// Functional test of the SHOP and BATTLE systems through the real UI (hidden Electron window, same
// preload bridge as the shipped build). Every assertion compares what the screen shows / what a click
// does against the game state and the economy/battle rules.
//
//   npm run test:functional
//
// Uses a throwaway profile, so real saves are never touched.
/* global window, document, KeyboardEvent -- IN_PAGE runs inside the game page */
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

const ROOT = path.join(__dirname, '..');
const PROFILE = fs.mkdtempSync(path.join(os.tmpdir(), 'darkness-tower-functional-'));
app.setPath('userData', PROFILE);
function saveFile(key) { return /^[A-Za-z0-9_]{1,64}$/.test(key) ? path.join(PROFILE, 'saves', key + '.json') : null; }
ipcMain.on('save:read', (e, key) => { const f = saveFile(key); e.returnValue = f && fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null; });
ipcMain.on('save:write', (e, key, text) => { const f = saveFile(key); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, text); e.returnValue = true; });
ipcMain.on('save:remove', (e, key) => { const f = saveFile(key); if (f && fs.existsSync(f)) fs.unlinkSync(f); e.returnValue = true; });
ipcMain.on('window:isFullscreen', (e) => { e.returnValue = false; });
ipcMain.on('window:setFullscreen', () => {});
ipcMain.on('app:quit', () => {});

const IN_PAGE = async function (OPTS) {
  const failures = [], log = [];
  const G = window.Game, S = G.State, D = G.Data, F = G.Formulas;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const vis = (el) => !!el && !el.disabled && !el.closest('.hidden') && el.getBoundingClientRect().width > 0;
  const active = () => { const s = $('.screen.active'); return s ? s.id : null; };
  let checks = 0;
  const check = (cond, what) => { checks++; if (!cond) failures.push(what); };
  const waitFor = async (fn, ms) => { const t0 = Date.now(); while (Date.now() - t0 < (ms || 8000)) { try { if (fn()) return true; } catch { /* retry */ } await sleep(40); } return false; };
  const closeModals = () => { for (const id of ['modal-root', 'allout-modal']) { const m = document.getElementById(id); if (m) { m.classList.add('hidden'); m.innerHTML = ''; } } };
  const tipOff = () => { try { G.Tips.setEnabled(false); } catch { /* none */ } const t = $('#tip-card-ok'); if (t) t.click(); };

  function newRun(cls, level, floor, gold) {
    closeModals();
    const run = S.createRun('normal', cls || 'blade', 0);
    S.current = run; run.level = level || 1; run.currentFloor = floor || 1; run.gold = gold == null ? 0 : gold;
    G.Attributes.autoAllocate(run);   // a player who has assigned their attribute points
    S.fullRestore(run);
    return run;
  }
  const meta = G.Save.readMeta(); meta.battleSpeed = 4; G.Save.writeMeta(meta);
  tipOff();

  // =========================================================================================== SHOP
  async function shopTests() {
    const goldLabel = () => { const t = $('#shop-gold') ? $('#shop-gold').textContent : ''; const m = t.match(/-?\d+/); return m ? Number(m[0]) : NaN; };
    const open = () => { G.TowerUI.renderShop(); G.UI.showScreen('screen-shop'); };
    const buyCards = () => $$('#shop-content .select-card');
    const owned = (run, id) => (run.inventory[id] || 0) + Object.keys(run.equipment || {}).filter((k) => run.equipment[k] === id).length;

    for (const floor of [1, 6, 12, 26, 41, 60, 99]) {
      const run = newRun('blade', 10, floor, 1000000); run.shopStock = null; open();
      const stock = run.shopStock;
      check(Array.isArray(stock) && stock.length > 0, 'floor ' + floor + ': shop has stock');
      const tierCap = F.itemTierForFloor(floor), tier = F.tierForFloor(floor);
      const ids = {};
      stock.forEach((e) => {
        const it = D.getItem(e.id);
        check(!!it, 'floor ' + floor + ': stock item ' + e.id + ' exists');
        if (!it) return;
        check(!ids[e.id], 'floor ' + floor + ': ' + e.id + ' listed twice'); ids[e.id] = 1;
        check(!it.craftOnly && !it.questOnly, 'floor ' + floor + ': ' + e.id + ' is craft/quest-only but sold in shop');
        const cap = ['weapon', 'armor', 'shoes', 'accessory'].indexOf(it.kind) !== -1 ? tierCap : tier;
        check(it.tier <= cap || it.id === 'skill_scroll' || it.id === 'p_elixir', 'floor ' + floor + ': ' + e.id + ' tier ' + it.tier + ' exceeds cap ' + cap);
        check(e.qty > 0 && e.qty === e.maxQty && Number.isInteger(e.qty), 'floor ' + floor + ': ' + e.id + ' bad stock qty ' + e.qty + '/' + e.maxQty);
      });
      check(stock.filter((e) => e.id === 'p_elixir').length <= 1, 'floor ' + floor + ': more than one elixir slot');
      check(buyCards().length === stock.length, 'floor ' + floor + ': ' + buyCards().length + ' cards for ' + stock.length + ' stock entries');
      check(goldLabel() === 1000000, 'floor ' + floor + ': gold label shows ' + goldLabel());
      // every card's displayed price is the formula price
      buyCards().forEach((card) => {
        const id = card.getAttribute('data-id'), price = F.shopPrice(D.getItem(id));
        check(card.textContent.indexOf(String(price)) !== -1, 'floor ' + floor + ': card ' + id + ' does not show price ' + price);
      });
    }

    // ---- buy EVERYTHING on a rich run, verifying every single purchase ----
    {
      const run = newRun('blade', 10, 26, 10000000); run.shopStock = null; open();
      const start = run.gold; let spent = 0, purchases = 0;
      const before = {}; run.shopStock.forEach((e) => { before[e.id] = owned(run, e.id); });
      for (const entry of run.shopStock.slice()) {
        for (let n = 0; n < entry.maxQty; n++) {
          if (entry.id === 'p_elixir' && !S.elixirAvailable(run)) break;
          const card = $('#shop-content .select-card[data-id="' + entry.id + '"]');
          if (!card || card.disabled) { check(false, 'card for ' + entry.id + ' disabled with stock ' + entry.qty); break; }
          const g0 = run.gold, q0 = entry.qty, o0 = owned(run, entry.id);
          card.click();
          const price = F.shopPrice(D.getItem(entry.id));
          check(g0 - run.gold === price, entry.id + ': gold dropped by ' + (g0 - run.gold) + ', price is ' + price);
          check(q0 - entry.qty === 1, entry.id + ': stock dropped by ' + (q0 - entry.qty));
          check(owned(run, entry.id) - o0 === 1, entry.id + ': owned changed by ' + (owned(run, entry.id) - o0));
          check(goldLabel() === run.gold, entry.id + ': gold label ' + goldLabel() + ' != ' + run.gold);
          spent += price; purchases++;
        }
      }
      check(start - run.gold === spent, 'total spent ' + (start - run.gold) + ' != sum of prices ' + spent);
      // everything is sold out now: all cards locked, clicking changes nothing
      const g1 = run.gold, snap = JSON.stringify(run.inventory);
      $$('#shop-content .select-card').forEach((c) => c.click());
      check(run.gold === g1 && JSON.stringify(run.inventory) === snap, 'clicking sold-out cards changed gold/inventory');
      check($$('#shop-content .select-card').every((c) => c.disabled || c.classList.contains('locked')), 'sold-out cards are not all disabled');
      check(run.gold >= 0, 'gold went negative');
      log.push('shop: bought ' + purchases + ' items across the whole stock');
    }

    // ---- affordability boundary ----
    {
      const run = newRun('blade', 10, 12, 0); run.shopStock = null; open();
      const entry = run.shopStock.find((e) => D.getItem(e.id).kind === 'consumable');
      const price = F.shopPrice(D.getItem(entry.id));
      run.gold = price - 1; G.TowerUI.renderShop();
      let card = $('#shop-content .select-card[data-id="' + entry.id + '"]');
      check(card.disabled || card.classList.contains('locked'), 'card affordable at price-1 gold');
      card.click(); check(run.gold === price - 1 && entry.qty === entry.maxQty, 'a purchase went through with price-1 gold');
      run.gold = price; G.TowerUI.renderShop();
      card = $('#shop-content .select-card[data-id="' + entry.id + '"]'); card.click();
      check(run.gold === 0 && entry.qty === entry.maxQty - 1, 'exact-gold purchase failed (gold ' + run.gold + ')');
      run.gold = 0; G.TowerUI.renderShop();
      check($$('#shop-content .select-card').every((c) => c.disabled || c.classList.contains('locked')), 'with 0 gold some card is still buyable');
    }

    // ---- stock survives navigation + language toggle; resets only after a mini-boss ----
    {
      const run = newRun('blade', 10, 12, 500); run.shopStock = null; open();
      const sig = JSON.stringify(run.shopStock);
      G.TowerUI.renderTower(); G.UI.showScreen('screen-tower'); open();
      check(JSON.stringify(run.shopStock) === sig, 'stock changed after leaving and re-entering the shop');
      const lang = G.I18n.getLang(); G.I18n.setLang(lang === 'th' ? 'en' : 'th'); G.TowerUI.refreshActiveScreen && G.TowerUI.refreshActiveScreen();
      check(JSON.stringify(run.shopStock) === sig, 'stock changed on language toggle'); G.I18n.setLang(lang);
      G.State.saveNow(); const reloaded = G.Save.read();
      check(reloaded && JSON.stringify(reloaded.shopStock) === sig, 'stock is not persisted in the save');
      for (const [floor, expectReset] of [[5, true], [6, false], [10, true], [7, false]]) {
        run.currentFloor = floor + 1 > 100 ? 100 : floor; run.pendingReward = null; run.shopStock = [{ id: 'p_hp_small', maxQty: 4, qty: 4 }];
        G.TowerUI.renderReward(floor); G.UI.showScreen('screen-reward');
        const pick = $('#reward-cards .select-card'); check(!!pick, 'reward screen for floor ' + floor + ' has cards');
        if (pick) pick.click();
        check((run.shopStock === null) === expectReset, 'floor ' + floor + ': shop stock reset=' + (run.shopStock === null) + ', expected ' + expectReset);
        closeModals();
      }
    }

    // ---- elixir: exactly one, buyable once, then locked until the restock floor ----
    {
      const run = newRun('blade', 30, 50, 100000); run.shopStock = null; run.elixirUnlockFloor = 0; open();
      const e = run.shopStock.find((x) => x.id === 'p_elixir');
      check(!!e && e.qty === 1, 'elixir should be offered once with qty 1 when available');
      if (e) {
        const c = $('#shop-content .select-card[data-id="p_elixir"]'); c.click();
        check(owned(run, 'p_elixir') >= 1 && !S.elixirAvailable(run), 'elixir bought but still marked available');
        check(run.elixirUnlockFloor === run.currentFloor + 15, 'elixir restock floor is ' + run.elixirUnlockFloor);
        run.shopStock = null; G.TowerUI.renderShop();
        check(!run.shopStock.some((x) => x.id === 'p_elixir'), 'elixir re-listed before its restock floor');
        run.currentFloor += 15; run.shopStock = null; G.TowerUI.renderShop();
        check(run.shopStock.some((x) => x.id === 'p_elixir'), 'elixir not restocked after 15 floors');
      }
    }

    // ---- auto-equip: buying gear into an empty slot equips it; into a filled slot goes to the bag ----
    {
      const run = newRun('blade', 10, 12, 100000); run.shopStock = null; open();
      const w = run.shopStock.find((e) => D.getItem(e.id).kind === 'weapon');
      $('#shop-content .select-card[data-id="' + w.id + '"]').click();
      check(run.equipment.weapon === w.id, 'weapon bought with an empty slot was not equipped');
      const w2 = run.shopStock.filter((e) => D.getItem(e.id).kind === 'weapon' && e.id !== w.id)[0];
      if (w2) { $('#shop-content .select-card[data-id="' + w2.id + '"]').click(); check(run.equipment.weapon === w.id && run.inventory[w2.id] === 1, 'second weapon replaced the equipped one or vanished'); }
    }

    // ---- sell tab ----
    {
      const run = newRun('blade', 10, 12, 0); run.shopStock = null;
      ['p_hp_small', 'p_mp_small'].forEach((id) => S.addItem(run, id, 3));
      const mat = D.items.find((i) => i.kind === 'material'); S.addItem(run, mat.id, 5);
      run.equipment.weapon = D.items.find((i) => i.kind === 'weapon' && !i.craftOnly).id;
      open(); $('#shop-tab-sell').click();
      check(!$$('#shop-content .select-card').some((c) => c.getAttribute('data-id') === run.equipment.weapon), 'equipped weapon appears in the sell list');
      const rows = $$('#shop-content .select-card');
      check(rows.length === Object.keys(run.inventory).filter((k) => run.inventory[k] > 0).length, 'sell list shows ' + rows.length + ' rows for ' + Object.keys(run.inventory).length + ' bag entries');
      // sell one potion
      const unit = F.sellPrice(D.getItem('p_hp_small'), run.currentFloor);
      const g0 = run.gold, q0 = run.inventory.p_hp_small;
      $('#shop-content .select-card[data-id="p_hp_small"]').click();
      check(run.gold - g0 === unit && q0 - run.inventory.p_hp_small === 1, 'selling one potion paid ' + (run.gold - g0) + ', expected ' + unit);
      check(goldLabel() === run.gold, 'gold label out of date after selling');
      // sell-duplicates keeps exactly one and pays for the rest
      const dup = $('#shop-content [data-dup-id="' + mat.id + '"]');
      if (dup) {
        const g1 = run.gold, have = run.inventory[mat.id], u = F.sellPrice(mat, run.currentFloor);
        dup.click(); await sleep(40);
        const dlg = document.getElementById('modal-root');
        check(dlg && !dlg.classList.contains('hidden') && dlg.textContent.indexOf('×' + (have - 1)) !== -1, 'sell-duplicates confirm dialog does not state the quantity to be sold (' + (have - 1) + ')');
        check(run.inventory[mat.id] === have && run.gold === g1, 'sell-duplicates sold before the player confirmed');
        const yes = $('#modal-confirm'); if (yes) yes.click(); await sleep(40);
        check(run.inventory[mat.id] === 1 && run.gold - g1 === (have - 1) * u, 'sell-duplicates: kept ' + run.inventory[mat.id] + ', paid ' + (run.gold - g1) + ', expected ' + (have - 1) * u);
      } else log.push('shop: no sell-duplicates button for ' + mat.id + ' (protected item?)');
      // sell everything: empty state, gold never negative, no item left with qty<=0
      for (let guard = 0; guard < 200; guard++) { const c = $('#shop-content .select-card'); if (!c) break; c.click(); }
      check(Object.keys(run.inventory).every((k) => run.inventory[k] > 0), 'bag has a zero/negative entry after selling everything');
      check(run.gold >= 0 && Number.isFinite(run.gold), 'gold invalid after selling everything: ' + run.gold);
      check(!!$('#shop-content .empty-note'), 'empty sell list shows no placeholder note');
      $('#shop-tab-buy').click(); check($$('#shop-content .select-card').length > 0, 'buy tab empty after switching back');
    }

    // ---- no gold exploit: buy then sell every item once, you must always lose money ----
    {
      const run = newRun('blade', 10, 26, 1000000); run.shopStock = null; open();
      const g0 = run.gold;
      for (const entry of run.shopStock.slice()) { const c = $('#shop-content .select-card[data-id="' + entry.id + '"]'); if (c && !c.disabled) c.click(); }
      Object.keys(run.equipment).forEach((k) => { if (run.equipment[k]) { S.addItem(run, run.equipment[k], 1); run.equipment[k] = null; } });
      $('#shop-tab-sell').click();
      for (let guard = 0; guard < 500; guard++) { const c = $('#shop-content .select-card'); if (!c) break; c.click(); }
      check(run.gold < g0, 'buy-everything-then-sell-everything netted gold (' + g0 + ' -> ' + run.gold + ')');
    }

    // ---- workshop shortcuts on the shop screen ----
    {
      newRun('blade', 20, 26, 5000); open();
      const sc = $$('#screen-shop [data-workshop], #screen-shop .workshop-shortcut, #screen-shop button').filter((b) => vis(b) && !/shop-tab|shop-back/.test(b.id));
      check(sc.length >= 2, 'shop shows its workshop shortcuts (found ' + sc.length + ')');
      for (const b of sc) { b.click(); await sleep(60); check(!document.getElementById('error-overlay') || document.getElementById('error-overlay').classList.contains('hidden'), 'shortcut "' + b.textContent.trim().slice(0, 20) + '" raised the crash overlay'); closeModals(); open(); }
    }
  }

  // ========================================================================================= BATTLE
  let lastBattle = null;
  const realCreate = G.BattleEngine.createBattle, realSurvival = G.BattleEngine.createSurvivalBattle;
  G.BattleEngine.createBattle = function () { lastBattle = realCreate.apply(this, arguments); return lastBattle; };
  G.BattleEngine.createSurvivalBattle = function () { lastBattle = realSurvival.apply(this, arguments); return lastBattle; };
  const idle = () => !G.BattleUI.isPlayingEffects();
  const startFloor = async (floor, boss) => { G.BattleUI.cancelPlayback(); G.State.current.currentFloor = floor; G.BattleUI.startBattle(floor, !!boss, false); await waitFor(() => idle() && active() === 'screen-battle' && !!$('#act-attack') && vis($('#act-attack')), 12000); };
  async function settleTurn(b) {
    // wait until it is the player's turn again, or the battle ended; answer All-Out prompts
    for (let i = 0; i < 400; i++) {
      const allout = document.getElementById('allout-modal');
      if (allout && !allout.classList.contains('hidden') && allout.children.length) { const y = $('#allout-confirm'); if (y) y.click(); }
      if (b.over && idle()) return; if (!b.over && idle() && b.playerAP > 0 && !b.awaitingAllOut && active() === 'screen-battle' && vis($('#act-attack'))) return;
      await sleep(40);
    }
    failures.push('battle never returned control to the player (round ' + b.round + ', AP ' + b.playerAP + ', over ' + b.over + ')');
  }
  async function pickTargetIfAsked() {
    await sleep(60);
    const t = $$('.enemy-card.targetable')[0];
    if (t) t.click();
  }

  async function battleTests() {
    const classes = D.classes.map((c) => c.id);
    check(classes.length >= 12, 'class list unexpectedly small: ' + classes.length);

    // every class: open the battle, check every command, use each at least once
    for (const cls of classes) {
      const run = newRun(cls, 12, 4, 0); run.mp = S.getMaxMp(run);
      S.addItem(run, 'p_hp_small', 3); S.addItem(run, 'p_mp_small', 3);
      await startFloor(4, false); const b = lastBattle;
      check(!!b && active() === 'screen-battle', cls + ': battle screen did not open');
      if (!b) continue;
      check($$('#battle-enemies .enemy-card').length === b.enemies.length, cls + ': enemy cards ' + $$('#battle-enemies .enemy-card').length + ' != ' + b.enemies.length);
      check(vis($('#act-attack')) && vis($('#act-skill')) && vis($('#act-guard')) && vis($('#act-item')), cls + ': a basic command button is missing');
      check($('#act-overdrive').disabled === (b.player.focus < F.FOCUS_MAX), cls + ': overdrive enabled state wrong (focus ' + b.player.focus + ')');
      check($('#battle-player-panel').textContent.indexOf(String(run.hp)) !== -1, cls + ': player panel does not show HP ' + run.hp);

      // --- attack with targeting
      const hp0 = b.enemies.map((e) => e.hp), focus0 = b.player.focus;
      $('#act-attack').click(); await pickTargetIfAsked(b); await settleTurn(b);
      check(b.enemies.some((e, i) => e.hp < hp0[i]) || b.over, cls + ': an attack did not damage any enemy');
      check(b.player.focus >= focus0 || b.round > 1, cls + ': attack lost focus');
      if (b.over) continue;

      // --- skill menu: shown costs match data, unaffordable are disabled, casting spends exactly the cost
      run.mp = S.getMaxMp(run); const skills = S.learnedSkills(run).filter((s) => s.id !== 'attack');
      $('#act-skill').click(); await sleep(80);
      const opts = $$('#battle-submenu .submenu-option');
      check(opts.length >= Math.min(1, skills.length), cls + ': skill submenu is empty');
      for (const o of opts) {
        const s = D.getSkill(o.getAttribute('data-id')); if (!s) { check(false, cls + ': submenu lists unknown skill ' + o.getAttribute('data-id')); continue; }
        const label = o.querySelector('.submenu-option-cost'); const costText = label ? label.textContent : '';
        // The engine's real cost (class rules change it, e.g. the Gunslinger pays half MP plus bullets).
        const mpCost = G.BattleEngine.skillCost(b, s).mp;
        if (mpCost > 0) check(costText.indexOf(mpCost + ' MP') !== -1, cls + '/' + s.id + ': cost label "' + costText + '" != ' + mpCost);
        check(o.disabled === (run.mp < s.cost && !(s.hpCost > 0)) || o.disabled || run.mp >= s.cost, cls + '/' + s.id + ': affordability flag wrong');
      }
      const pick = opts.find((o) => !o.disabled && (D.getSkill(o.getAttribute('data-id')) || {}).kind === 'attack') || opts.find((o) => !o.disabled);
      if (pick) {
        const s = D.getSkill(pick.getAttribute('data-id'));
        pick.click(); await pickTargetIfAsked(b); await settleTurn(b);
        check(run.mp >= 0 && run.mp <= S.getMaxMp(run), cls + '/' + s.id + ': MP out of range after cast: ' + run.mp);   // exact cost is asserted in test/battle-fuzz.test.js
      }
      if (b.over) continue;

      // --- item: heals, consumes exactly one, list only shows owned battle-usable items
      run.hp = Math.max(1, Math.floor(S.getMaxHp(run) / 3)); G.BattleUI.refreshActiveScreen();
      const potions = run.inventory.p_hp_small, hpBefore = run.hp;
      $('#act-item').click(); await sleep(80);
      const itemOpts = $$('#battle-submenu .submenu-option');
      check(itemOpts.every((o) => { const it = D.getItem(o.getAttribute('data-id')); return it && it.battleUsable && (run.inventory[it.id] || 0) > 0; }), cls + ': item menu lists a non-usable or unowned item');
      const hpOpt = itemOpts.find((o) => o.getAttribute('data-id') === 'p_hp_small');
      if (hpOpt) { hpOpt.click(); await settleTurn(b); check(run.inventory.p_hp_small === potions - 1, cls + ': potion count ' + potions + ' -> ' + run.inventory.p_hp_small); check(run.hp > hpBefore - 1 || b.over, cls + ': potion did not heal (' + hpBefore + ' -> ' + run.hp + ')'); }
      else { check(false, cls + ': owned potion missing from the item menu'); $('#submenu-close') && $('#submenu-close').click(); }
      if (b.over) continue;

      // --- guard: spends the turn and sets the flag, enemies then act, control returns
      const round0 = b.round;
      $('#act-guard').click(); await settleTurn(b);
      check(b.round > round0 || b.over, cls + ': guard did not advance the round');

      // --- overdrive when full
      if (!b.over) {
        b.player.focus = F.FOCUS_MAX; G.BattleUI.refreshActiveScreen(); await sleep(40);
        check(!$('#act-overdrive').disabled, cls + ': overdrive not enabled at full focus');
        const hpE = b.enemies.map((e) => e.hp); $('#act-overdrive').click(); await pickTargetIfAsked(b); await settleTurn(b);
        check(b.enemies.some((e, i) => e.hp < hpE[i]) || b.over, cls + ': overdrive dealt no damage');
        check(b.player.focus < F.FOCUS_MAX || b.over, cls + ': overdrive did not spend focus');
      }
    }
    log.push('battle: every class exercised attack/skill/item/guard/overdrive');

    // ---- targeting UI: with several enemies, only living ones are selectable; cancel works
    {
      // enemy group size is random per fight, so retry on a deep floor until a 3+ group appears
      let b = null;
      for (let tries = 0; tries < 40; tries++) { newRun('blade', 30, 89, 0); await startFloor(89, false); b = lastBattle; if (b.enemies.length >= 3) break; }
      check(b.enemies.length >= 3, 'wanted a 3+ enemy group for the targeting test, got ' + b.enemies.length);
      b.enemies[0].hp = 0; b.enemies[0].alive = false; G.BattleUI.refreshActiveScreen();
      $('#act-attack').click(); await sleep(80);
      const living = b.enemies.filter((e) => e.alive).length;
      const targets = $$('.enemy-card.targetable').length;
      if (living > 1) check(targets === living, 'targetable cards ' + targets + ' != living enemies ' + living);
      const cancel = $('#target-cancel'); if (cancel) { cancel.click(); await sleep(60); check($$('.enemy-card.targetable').length === 0 || living === 1, 'cancel left targeting active'); }
    }

    // ---- full fights through the UI, with outcome checks
    for (const [cls, floor, boss] of [['blade', 2, false], ['elementalist', 7, false], ['cleric', 13, false], ['ranger', 25, false], ['blade', 100, true]]) {
      const run = newRun(cls, 25, floor, 100); S.addItem(run, 'p_hp_small', 20);
      await startFloor(floor, boss); const b = lastBattle;
      const exp0 = run.exp, lvl0 = run.level, gold0 = run.gold, expReward = G.BattleEngine.getExpReward(b);
      let guard = 0;
      while (!b.over && guard++ < 400) {
        if (run.hp < S.getMaxHp(run) * 0.35) { run.hp = S.getMaxHp(run); run.mp = S.getMaxMp(run); }   // flow test, not a balance test
        // flow test, not balance: keep every enemy one hit from death (the boss has phases, so this also walks through them)
        b.enemies.forEach((e) => { if (e.alive) e.hp = boss ? 1 : Math.max(1, Math.min(e.hp, Math.ceil(e.maxHp * 0.3))); });
        $('#act-attack').click(); await pickTargetIfAsked(b); await settleTurn(b);
      }
      check(b.over && b.victory, cls + '@' + floor + ': fight did not end in victory');
      await waitFor(() => active() === 'screen-reward' || active() === 'screen-tower' || active() === 'screen-end' || active() === 'screen-waypoint' || active() === 'screen-story', 15000);
      const screen = active();
      check(['screen-reward', 'screen-tower', 'screen-waypoint', 'screen-end', 'screen-story'].indexOf(screen) !== -1, cls + '@' + floor + ': victory landed on ' + screen);
      check(run.gold > gold0 && Number.isFinite(run.gold), cls + '@' + floor + ': no gold awarded (' + gold0 + ' -> ' + run.gold + ')');
      check(run.level > lvl0 || run.exp >= exp0, cls + '@' + floor + ': exp went down');
      check(run.level >= lvl0 && expReward >= 0, cls + '@' + floor + ': level/exp reward invalid');
      check(run.hp > 0 && run.hp <= S.getMaxHp(run), cls + '@' + floor + ': hp out of range after victory');
      closeModals();
    }

    // ---- defeat leads to the end screen and clears the run
    {
      const run = newRun('blade', 1, 40, 0); await startFloor(40, false); const b = lastBattle;
      run.hp = 1; let guard = 0;
      while (!b.over && guard++ < 60) { $('#act-guard').click(); await settleTurn(b); if (b.over) break; run.hp = 1; }
      await waitFor(() => active() === 'screen-end' || active() === 'screen-menu', 15000);
      check(b.over && !b.victory, 'a 1 HP level-1 hero on floor 40 should lose');
      check(active() === 'screen-end', 'defeat did not show the end screen (' + active() + ')');
      closeModals();
    }

    // ---- speed control cycles
    {
      newRun('blade', 5, 2, 0); await startFloor(2, false);
      const btn = $('#battle-speed, .speed-btn, #speed-btn') || $$('button').find((x) => /×\d|x\d/.test(x.textContent) && x.closest('.battle-topbar, #screen-battle'));
      if (btn) { const seq = []; for (let i = 0; i < 4; i++) { seq.push(G.SystemsUI.speed()); btn.click(); await sleep(30); } check(new Set(seq).size >= 3, 'speed control cycle ' + seq.join(',')); }
      else log.push('battle: speed button not found');
    }

    // ---- survival mode: waves advance
    {
      const run = newRun('monk', 20, 20, 0);
      const exp0 = run.exp, lvl0 = run.level, best0 = (G.Save.readMeta().survivalBest || 0);
      try {
        G.BattleUI.startSurvivalSession(); await waitFor(() => active() === 'screen-battle' && lastBattle && idle(), 8000);
        check(active() === 'screen-battle', 'survival did not open a battle');
        // clear three waves; between waves a talent prompt may appear and must be answerable
        for (let wave = 1; wave <= 3; wave++) {
          const b = lastBattle;
          check(($('#battle-floor-label').textContent || '').indexOf(String(wave)) !== -1, 'wave label does not show wave ' + wave + ': "' + $('#battle-floor-label').textContent + '"');
          for (let guard = 0; guard < 80 && !b.over; guard++) { b.enemies.forEach((e) => { if (e.alive) e.hp = 1; }); $('#act-attack').click(); await pickTargetIfAsked(); await settleTurn(b); }
          check(b.over && b.victory, 'survival wave ' + wave + ' not won');
          // answer the talent prompt (if any) and wait for the next wave's battle
          for (let i = 0; i < 120; i++) {
            const modal = document.getElementById('modal-root');
            if (modal && !modal.classList.contains('hidden') && modal.children.length) { const c = modal.querySelector('.tactical-choice, [data-choice], #modal-confirm, button'); if (c) c.click(); }
            if (lastBattle !== b && idle() && active() === 'screen-battle') break;
            await sleep(60);
          }
          check(lastBattle !== b, 'survival never started wave ' + (wave + 1));
        }
        check(run.exp > exp0 || run.level > lvl0, 'three survival waves paid no EXP');
        // lose on purpose: the summary screen must appear with the stats
        const b = lastBattle; run.hp = 1; let guard = 0;
        while (!b.over && guard++ < 80) { $('#act-guard').click(); await settleTurn(b); if (b.over) break; run.hp = 1; }
        await waitFor(() => active() === 'screen-survival-summary', 15000);
        check(active() === 'screen-survival-summary', 'losing an arena wave did not show the summary (' + active() + ')');
        check(/\d/.test($('#survival-summary-desc').textContent) && !!$('#survival-back-btn') && !!$('#survival-again-btn'), 'summary is missing its numbers or buttons');
        check(run.hp >= 1, 'the arena knock-out left the hero on 0 HP');
        check((G.Save.readMeta().survivalWaves || G.Save.readMeta().survivalBest || 0) >= best0, 'best survival record went down');
        $('#survival-again-btn').click(); await waitFor(() => active() === 'screen-battle', 8000);
        check(active() === 'screen-battle', 'Play again did not start a new arena session');
        G.BattleUI.cancelPlayback(); G.UI.showScreen('screen-tower');
      } catch (e) { failures.push('survival flow threw: ' + e.message); }
      G.BattleUI.cancelPlayback(); run.hp = S.getMaxHp(run);
    }
  }

  // ======================================================================================== EVENTS
  // Every random event x every choice x several seeds x floors x both languages: whatever the player
  // picks, the run must stay sane (finite hp/mp/gold, hp in range, clean bag) and control must return.
  function seededRandom(seed) {
    let st = seed >>> 0;
    return function () { st = (st + 0x6D2B79F5) >>> 0; let t = st; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const eventChoices = () => $$('#screen-event button, #screen-event .select-card').filter((b) => vis(b) && !b.closest('.screen-header'));
  function runSane(run, where) {
    check(Number.isFinite(run.hp) && Number.isFinite(run.mp) && Number.isFinite(run.gold), where + ': hp/mp/gold not finite (' + run.hp + '/' + run.mp + '/' + run.gold + ')');
    // outside a battle a living hero always has at least 1 HP (an event must never leave the run on 0 HP)
    check(run.hp >= 1 && run.hp <= S.getMaxHp(run), where + ': hp ' + run.hp + ' outside 1..' + S.getMaxHp(run));
    check(run.mp >= 0 && run.mp <= S.getMaxMp(run), where + ': mp ' + run.mp + ' outside 0..' + S.getMaxMp(run));
    check(run.gold >= 0, where + ': negative gold ' + run.gold);
    check(Object.keys(run.inventory).every((k) => Number.isInteger(run.inventory[k]) && run.inventory[k] > 0 && D.getItem(k)), where + ': bad bag entry ' + JSON.stringify(run.inventory).slice(0, 120));
    check(Number.isInteger(run.level) && run.level >= 1 && Number.isFinite(run.exp) && run.exp >= 0, where + ': level/exp invalid ' + run.level + '/' + run.exp);
  }
  let changedRuns = 0;
  async function playEvent(id, floor, choiceIdx, seed, lang) {
    const where = 'event ' + id + '@' + floor + ' choice#' + choiceIdx + ' seed ' + seed + ' ' + lang;
    const realRandom = Math.random; Math.random = seededRandom(seed);
    try {
      G.I18n.setLang(lang);
      const run = newRun('blade', 20 + (seed % 15), floor, 400 + (seed % 5) * 300);
      D.items.filter((i) => i.battleUsable).slice(0, 6).forEach((i) => S.addItem(run, i.id, 2));
      D.items.filter((i) => i.kind === 'material').slice(0, 5).forEach((i) => S.addItem(run, i.id, 3));
      run.hp = Math.max(1, Math.floor(S.getMaxHp(run) * (0.3 + (seed % 7) / 10)));
      const before = JSON.stringify([run.hp, run.mp, run.gold, run.inventory, run.blessings, run.curses, run.exp]);
      G.TowerUI.renderEvent(id, floor); G.UI.showScreen('screen-event');
      const total = eventChoices().length;
      if (choiceIdx >= total) return total;
      let steps = 0, left = false;
      while (steps++ < 14) {
        const overlay = document.getElementById('error-overlay');
        if (overlay && !overlay.classList.contains('hidden')) { check(false, where + ': crash overlay'); break; }
        const skip = $('.minigame-overlay [data-mg="skip"]');
        if (skip) { skip.click(); await sleep(15); continue; }
        if ($('.minigame-overlay')) { const mb = $$('.minigame-overlay button').filter(vis)[0]; if (mb) mb.click(); await sleep(15); continue; }
        const modal = document.getElementById('modal-root');
        if (modal && !modal.classList.contains('hidden') && modal.children.length) {
          const mb = modal.querySelector('#modal-confirm') || modal.querySelector('[data-choice]') || modal.querySelector('button');
          if (mb) mb.click(); await sleep(15); continue;
        }
        if (active() !== 'screen-event') { left = true; break; }
        const opts = eventChoices();
        if (!opts.length) { check(false, where + ': event screen has no clickable choice'); break; }
        opts[Math.min(choiceIdx, opts.length - 1)].click(); await sleep(15);
      }
      if (active() === 'screen-battle') { G.BattleUI.cancelPlayback(); left = true; }
      check(left || active() !== 'screen-event', where + ': never left the event screen');
      runSane(run, where);
      if (JSON.stringify([run.hp, run.mp, run.gold, run.inventory, run.blessings, run.curses, run.exp]) !== before) changedRuns++;
      closeModals();
      return total;
    } catch (e) { failures.push(where + ': exception ' + (e && e.message)); return 0; }
    finally { Math.random = realRandom; }
  }
  async function eventTests() {
    const ids = D.events.map((e) => e.id);
    check(ids.length >= 10, 'event list unexpectedly small: ' + ids.length);
    let cases = 0;
    for (const id of ids) {
      for (const floor of OPTS.quick ? [30] : [8, 30, 70]) {
        for (const seed of OPTS.quick ? [1, 2] : [1, 2, 3, 4, 5, 6, 7, 8]) {
          const lang = seed % 2 ? 'th' : 'en';
          const total = await playEvent(id, floor, 0, seed, lang); cases++;
          for (let c = 1; c < Math.min(total, 6); c++) { await playEvent(id, floor, c, seed, lang); cases++; }
        }
      }
    }
    log.push('events: ' + ids.length + ' events, ' + cases + ' choice playthroughs, ' + changedRuns + ' changed the run');
    check(changedRuns > cases * 0.3, 'only ' + changedRuns + ' of ' + cases + ' event playthroughs changed anything (the test may not be clicking real choices)');
  }

  // ===================================================================================== MINIGAMES
  // The optional mini-games are played for real through their buttons: the callback must fire exactly
  // once with a result that is consistent with the rules, and the overlay must always close.
  async function minigameTests() {
    const MG = G.Minigame;
    const seeded = (seed) => { let st = seed >>> 0; return () => { st = (st + 0x6D2B79F5) >>> 0; let t = st; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
    const realRandom = Math.random;
    try {
      // ---- Higher / Lower
      for (let round = 0; round < (OPTS.quick ? 6 : 16); round++) {
        Math.random = seeded(100 + round);
        let calls = 0, res = null;
        MG.hiLo({ title: 'Test', bet: 50 }, (r) => { calls++; res = r; });
        const overlay = $('.minigame-overlay'); check(!!overlay && MG.active(), 'hiLo round ' + round + ': overlay did not open');
        const card = Number(overlay.querySelector('.minigame-card').getAttribute('aria-label'));
        check(card >= 1 && card <= 13, 'hiLo: shown card ' + card + ' outside 1..13');
        const odds = MG.hiLoOdds(card);
        check(overlay.querySelector('[data-mg="higher"]').disabled === !odds.higher.available, 'hiLo card ' + card + ': higher button availability wrong');
        check(overlay.querySelector('[data-mg="lower"]').disabled === !odds.lower.available, 'hiLo card ' + card + ': lower button availability wrong');
        if (round === 3) { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })); await sleep(30); check(calls === 1 && res.skipped === true && !MG.active(), 'hiLo: Escape must skip exactly once and close'); continue; }
        const side = odds.higher.available && (round % 2 === 0 || !odds.lower.available) ? 'higher' : 'lower';
        const btn = overlay.querySelector('[data-mg="' + side + '"]'); btn.click(); btn.click();
        await sleep(950);
        check(calls === 1, 'hiLo round ' + round + ': callback fired ' + calls + ' times');
        check(res && res.played === true && !MG.active(), 'hiLo round ' + round + ': not played/closed');
        if (res) {
          check(res.won === (side === 'higher' ? res.hidden > res.card : res.hidden < res.card), 'hiLo: won=' + res.won + ' for ' + side + ' with card ' + res.card + ' vs hidden ' + res.hidden + ' (a tie must lose)');
          check(res.payout === (res.won ? MG.hiLoPayout(50, res.mult) : 0), 'hiLo: payout ' + res.payout + ' wrong for won=' + res.won);
          check(res.hidden >= 1 && res.hidden <= 13, 'hiLo: hidden card out of range');
        }
      }
      // skip button
      { let calls = 0, res = null; MG.hiLo({ title: 'Test', bet: 10 }, (r) => { calls++; res = r; }); $('.minigame-overlay [data-mg="skip"]').click(); await sleep(30); check(calls === 1 && res.skipped && !MG.active(), 'hiLo: skip button'); }

      // ---- Timing (lockpick / forge style)
      for (const cfg of [{ stops: 3, need: 2, speed: 1.0, zone: 0.22 }, { stops: 4, need: 3, speed: 1.4, zone: 0.16 }, { stops: 2, need: 1, speed: 0.8, zone: 0.3 }]) {
        for (let round = 0; round < (OPTS.quick ? 1 : 3); round++) {
          Math.random = seeded(500 + round);
          let calls = 0, res = null;
          MG.timing({ title: 'Test', hint: 'x', art: 'miniLockpick', ...cfg }, (r) => { calls++; res = r; });
          check(!!$('.minigame-overlay') && MG.active(), 'timing: overlay did not open');
          for (let i = 0; i < cfg.stops; i++) {
            await sleep(120 + ((round * 37 + i * 91) % 260));
            const stop = $('.minigame-overlay [data-mg="stop"]'); if (stop) stop.click();
            if (i < cfg.stops - 1) {
              stop.click(); stop.click();   // clicks inside the 380ms lock must NOT count as extra strikes
              check($$('.minigame-pips i.hit, .minigame-pips i.miss').length === i + 1, 'timing: pips ' + $$('.minigame-pips i.hit, .minigame-pips i.miss').length + ' after strike ' + (i + 1) + ' (locked clicks were counted)');
              await sleep(420);
            }
          }
          await sleep(900);
          check(calls === 1, 'timing ' + JSON.stringify(cfg) + ': callback fired ' + calls + ' times');
          check(!MG.active(), 'timing: overlay still open after the last stop');
          if (res) {
            check(res.played === true && res.stops === cfg.stops, 'timing: result stops ' + res.stops + ' != ' + cfg.stops);
            check(res.hits >= 0 && res.hits <= cfg.stops, 'timing: hits ' + res.hits + ' out of range');
            check(res.success === (res.hits >= cfg.need), 'timing: success=' + res.success + ' with ' + res.hits + '/' + cfg.need + ' hits needed');
          }
        }
      }
      { let calls = 0, res = null; MG.timing({ title: 'Test', hint: 'x', stops: 3, need: 2, speed: 1, zone: 0.2 }, (r) => { calls++; res = r; }); $('.minigame-overlay [data-mg="skip"]').click(); await sleep(30); check(calls === 1 && res.skipped && !MG.active(), 'timing: skip button'); }
      // opening a second mini-game while one is open must replace it, never stack overlays
      MG.timing({ title: 'A', hint: 'x' }, () => {}); MG.timing({ title: 'B', hint: 'x' }, () => {});
      check($$('.minigame-overlay').length === 1, 'two mini-game overlays are open at once'); MG.close();
      check($$('.minigame-overlay').length === 0, 'close() left an overlay behind');
      log.push('minigames: higher/lower and timing played through their buttons');
    } finally { Math.random = realRandom; }
  }

  try {
    if (OPTS.shop) await shopTests();
    if (OPTS.battle) await battleTests();
    if (OPTS.events) await eventTests();
    if (OPTS.minigames) await minigameTests();
  } catch (e) { failures.push('exception: ' + (e && e.stack || e)); }
  log.push('assertions: ' + checks);
  return { failures, log };
};

app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 1280, height: 800, show: false, webPreferences: { preload: path.join(ROOT, 'electron', 'preload.js'), contextIsolation: true, sandbox: true, backgroundThrottling: false } });
  const consoleErrors = [];
  win.webContents.on('console-message', (event) => {
    const msg = String(event.message), lvl = event.level;
    if ((lvl === 'error' || lvl >= 3) && !/Autofill|DevTools/.test(msg)) consoleErrors.push(msg + ' (' + path.basename(String(event.sourceId || '')) + ':' + event.lineNumber + ')');
  });
  win.webContents.on('render-process-gone', () => { console.log('FAIL renderer crashed'); app.exit(1); });
  await win.loadFile(path.join(ROOT, 'index.html'));
  const only = process.argv.includes('--shop') ? { shop: true } : process.argv.includes('--battle') ? { battle: true } : process.argv.includes('--events') ? { events: true } : process.argv.includes('--minigames') ? { minigames: true } : { shop: true, battle: true, events: true, minigames: true };
  if (process.argv.includes('--quick')) only.quick = true;
  let result;
  try { result = await win.webContents.executeJavaScript('(' + IN_PAGE.toString() + ')(' + JSON.stringify(only) + ')', true); }
  catch (e) { result = { failures: ['executeJavaScript failed: ' + e.message], log: [] }; }
  result.log.forEach((l) => console.log(l));
  consoleErrors.forEach((e) => result.failures.push('console error: ' + e));
  const uniq = [...new Set(result.failures)];
  uniq.slice(0, 60).forEach((f) => console.log('FAIL ' + f));
  if (uniq.length > 60) console.log('... ' + (uniq.length - 60) + ' more');
  console.log(uniq.length ? '\nFUNCTIONAL TEST FAILED (' + uniq.length + ')' : '\nFUNCTIONAL TEST PASSED');
  try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch { /* best effort */ }
  app.exit(uniq.length ? 1 : 0);
});
