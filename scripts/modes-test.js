// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// UI test for the game modes the balance pass touched: Endless Arena (EXP rate, no level-up
// refill), Replay defeat (non-fatal), the Ascension picker and unlock rule, and the shop's
// gear tiers. Boots the real game in a hidden Electron window with a throwaway profile.
//
//   npm run test:modes
/* global window, document -- IN_PAGE runs inside the game page */
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

const ROOT = path.join(__dirname, '..');
const PROFILE = fs.mkdtempSync(path.join(os.tmpdir(), 'darkness-tower-modes-'));
app.setPath('userData', PROFILE);
function saveFile(key) { return /^[A-Za-z0-9_]{1,64}$/.test(key) ? path.join(PROFILE, 'saves', key + '.json') : null; }
ipcMain.on('save:read', (e, key) => { const f = saveFile(key); e.returnValue = f && fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null; });
ipcMain.on('save:write', (e, key, text) => { const f = saveFile(key); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, text); e.returnValue = true; });
ipcMain.on('save:remove', (e, key) => { const f = saveFile(key); if (f && fs.existsSync(f)) fs.unlinkSync(f); e.returnValue = true; });
ipcMain.on('window:isFullscreen', (e) => { e.returnValue = false; });
ipcMain.on('window:setFullscreen', () => {});
ipcMain.on('app:quit', () => {});

const IN_PAGE = async function () {
  const failures = [], log = [];
  const G = window.Game;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const $ = (sel) => document.querySelector(sel);
  const vis = (el) => !!el && !el.disabled && !el.closest('.hidden') && el.getBoundingClientRect().width > 0;
  const active = () => { const s = $('.screen.active'); return s ? s.id : null; };
  const check = (cond, what) => { if (!cond) failures.push(what); else log.push('ok: ' + what); };
  const click = (sel) => { const el = typeof sel === 'string' ? $(sel) : sel; if (!vis(el)) return false; el.click(); return true; };
  const modal = () => { const el = document.getElementById('modal-root'); return el && !el.classList.contains('hidden') && el.children.length ? el : null; };
  const waitFor = async (fn, ms) => { const t = Date.now(); while (Date.now() - t < ms) { if (fn()) return true; await sleep(60); } return false; };
  const tip = () => { const t = $('#tip-card-ok'); if (vis(t)) t.click(); };
  // Presses whatever advances the current battle, until `until()` holds.
  async function fight(until, ms) {
    const t = Date.now();
    while (Date.now() - t < ms) {
      if (until()) return true;
      tip();
      const m = modal(); const allout = $('#allout-confirm');
      if (vis(allout)) allout.click();
      else if (m) { const b = ['[data-choice]', '#modal-confirm', '.btn-primary', 'button'].map((q) => m.querySelector(q)).find(Boolean); if (b) b.click(); }
      else if (active() === 'screen-battle') {
        const target = $('.enemy-card.targetable');
        if (target) target.click(); else { const b = Array.from(document.querySelectorAll('#battle-actions button')).filter(vis)[0]; if (b) b.click(); }
      }
      await sleep(120);
    }
    return until();
  }
  function newRun(opts) {
    const run = G.State.createRun(opts.difficulty || 'nightmare', opts.classId || 'blade', opts.ascension || 0);
    Object.assign(run, opts.patch || {});
    G.State.current = run; G.State.fullRestore(run);
    G.TowerUI.renderTower(); G.UI.showScreen('screen-tower');
    return run;
  }

  try {
    const meta0 = G.Save.readMeta(); meta0.battleSpeed = 4; G.Save.writeMeta(meta0);

    // ---- Endless Arena: reduced EXP, no refill on level-up ----
    {
      const run = newRun({ patch: { level: 60, currentFloor: 1 } });
      run.expNext = G.Formulas.expToNext(run.level);
      while (G.Systems.pending(run)) { const o = G.Systems.options(run, G.Systems.pending(run)); G.Systems.chooseTalent(run, o[0].id); }
      run.exp = run.expNext - 1; run.hp = 5; run.mp = 3;
      const lvl0 = run.level, wavesBefore = run.stats.arenaWavesCleared;
      G.BattleUI.startSurvivalSession();
      const cleared = await fight(() => run.stats.arenaWavesCleared > wavesBefore, 40000);
      check(cleared, 'arena: a wave can be cleared through the UI');
      if (cleared) {
        check(run.level > lvl0, 'arena: the wave levelled the hero up (' + lvl0 + ' -> ' + run.level + ')');
        check(run.hp <= 5 && run.mp <= 3, 'arena: levelling up inside the arena does not refill HP/MP (hp ' + run.hp + ', mp ' + run.mp + ')');
      }
      await fight(() => active() === 'screen-battle' && !!$('#battle-home'), 8000);
      // The home button is ignored while an animation plays, so retry until the confirm modal shows.
      for (let i = 0; i < 40 && !modal(); i++) { click('#battle-home'); await sleep(250); }
      const stop = modal(); if (stop) { const b = stop.querySelector('#modal-confirm'); if (b) b.click(); }
      const reached = await waitFor(() => active() === 'screen-survival-summary', 8000);
      check(reached, 'arena: stopping shows the summary screen' + (reached ? '' : ' (stuck on ' + active() + ', modal: ' + (modal() ? modal().textContent.slice(0, 80) : 'none') + ')'));
      click('#survival-back-btn'); await sleep(150);
      check(active() === 'screen-tower', 'arena: summary returns to the tower');
    }

    // ---- Replay: defeat costs gold but does not end the run ----
    {
      const run = newRun({ patch: { currentFloor: 4, gold: 1000 } });
      for (let f = 1; f <= 3; f++) run.floorsCleared = run.floorsCleared || {};
      G.TowerUI.renderTower();
      const row = $('.floor-row.cleared');
      check(!!row, 'replay: a cleared floor row is offered');
      if (row) {
        run.hp = 1; row.click();
        await fight(() => active() === 'screen-battle', 5000);
        run.hp = 1;
        const back = await fight(() => active() === 'screen-tower' || active() === 'screen-end', 60000);
        check(back && active() === 'screen-tower', 'replay: losing a replay returns to the tower, not the end screen (' + active() + ')');
        check(G.State.current === run && run.hp >= 1, 'replay: the run survives with at least 1 HP');
        check(run.gold === 850, 'replay: defeat cost exactly 15% gold (' + run.gold + ')');
        check(run.battleMark == null, 'replay: the battle mark is cleared');
      }
    }

    // ---- Ascension picker and unlock rule ----
    {
      G.State.clearRun();
      const meta = G.Save.readMeta(); meta.ascensionUnlocked = 3; G.Save.writeMeta(meta);
      G.MenuUI.renderMainMenu(); G.UI.showScreen('screen-menu');
      click('#btn-new'); click('#story-continue');
      click('#difficulty-cards [data-id="nightmare"]'); await sleep(120);
      check(active() === 'screen-ascension', 'ascension: the picker opens on Nightmare once unlocked (' + active() + ')');
      const cards = document.querySelectorAll('#ascension-cards .select-card').length;
      check(cards === 4, 'ascension: levels 0-3 are offered (' + cards + ')');
      const run = newRun({ ascension: 2 });
      G.Main.showEnd(true); await sleep(120);
      check(G.State.getAscensionUnlocked() === 3, 'ascension: clearing level 2 does not unlock more than 3 (' + G.State.getAscensionUnlocked() + ')');
      newRun({ ascension: 3 }); G.Main.showEnd(true); await sleep(120);
      check(G.State.getAscensionUnlocked() === 4, 'ascension: clearing the highest unlocked level unlocks the next (' + G.State.getAscensionUnlocked() + ')');
      check(run && true, 'ascension: showEnd(true) did not throw');
    }

    // ---- New skills appear in the skill menu and work when picked ----
    for (const [classId, skillId] of [['blade', 'catch_breath'], ['executioner', 'harvest_sweep'], ['shadowhunter', 'shadow_volley'], ['cleric', 'divine_mercy']]) {
      const run = newRun({ classId, patch: { level: 60, currentFloor: 1 } });
      run.expNext = G.Formulas.expToNext(run.level);
      while (G.Systems.pending(run)) { const o = G.Systems.options(run, G.Systems.pending(run)); G.Systems.chooseTalent(run, o[0].id); }
      G.State.fullRestore(run);
      const maxHp = G.State.getMaxHp(run); run.hp = Math.round(maxHp * 0.1);
      click('.floor-row.current');
      check(await waitFor(() => active() === 'screen-battle' && !!$('#act-skill') && vis($('#act-skill')), 8000), skillId + ': battle opens');
      await sleep(900); tip();
      const hpBefore = run.hp;
      let opened = false;
      for (let i = 0; i < 30 && !opened; i++) { click('#act-skill'); await sleep(200); opened = !!$('#battle-submenu .submenu-option[data-id="' + skillId + '"]'); }
      check(opened, classId + ': ' + skillId + ' is listed in the skill menu');
      if (opened) {
        const btn = $('#battle-submenu .submenu-option[data-id="' + skillId + '"]');
        const wasDisabled = btn.disabled; btn.click(); await sleep(150);
        if (!wasDisabled && $('.enemy-card.targetable')) $('.enemy-card.targetable').click();
        await sleep(1200);
        if (['catch_breath', 'divine_mercy'].indexOf(skillId) !== -1) check(run.hp > hpBefore + maxHp * 0.15, skillId + ' healed the hero (' + hpBefore + ' -> ' + run.hp + ' of ' + maxHp + ')');
        else check(!wasDisabled, skillId + ' is usable (not greyed out)');
      }
      await fight(() => active() !== 'screen-battle', 60000);
      await sleep(200);
      const reward = G.UI && active() === 'screen-reward'; if (reward) click('#reward-cards .select-card');
      await sleep(200);
      if (active() !== 'screen-tower') { G.TowerUI.renderTower(); G.UI.showScreen('screen-tower'); }
    }

    // ---- Shop gear tiers follow the shared table ----
    for (const [floor, maxTier] of [[44, 5], [50, 6], [59, 6], [60, 7], [90, 7]]) {
      const run = newRun({ patch: { currentFloor: floor, gold: 99999 } });
      run.shopStock = null;
      click('#tower-shop-btn'); await sleep(120);
      const m = modal(); if (m) { const b = m.querySelector('button'); if (b) b.click(); }
      const stock = run.shopStock || [];
      const gear = stock.map((s) => G.Data.getItem(s.id)).filter((i) => i && ['weapon', 'armor', 'shoes', 'accessory'].indexOf(i.kind) !== -1);
      check(gear.length > 0 && gear.every((i) => i.tier <= maxTier), 'shop: floor ' + floor + ' stocks gear up to tier ' + maxTier + ' (max seen ' + Math.max.apply(null, gear.map((i) => i.tier)) + ')');
      click('#shop-back'); await sleep(80);
    }
  } catch (e) {
    failures.push('exception in modes script: ' + (e && e.stack || e));
  }
  return { failures, log };
};

app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 1280, height: 800, show: false, webPreferences: { preload: path.join(ROOT, 'electron', 'preload.js'), contextIsolation: true, sandbox: true, backgroundThrottling: false } });
  const consoleErrors = [];
  win.webContents.on('console-message', (event, level, message, line, source) => { if (level >= 3) consoleErrors.push(message + ' (' + path.basename(String(source)) + ':' + line + ')'); });
  win.webContents.on('render-process-gone', () => { console.log('FAIL renderer crashed'); app.exit(1); });
  await win.loadFile(path.join(ROOT, 'index.html'));
  let result;
  try { result = await win.webContents.executeJavaScript('(' + IN_PAGE.toString() + ')()', true); } catch (e) { result = { failures: ['executeJavaScript failed: ' + e.message], log: [] }; }
  result.log.forEach((l) => console.log(l));
  consoleErrors.forEach((e) => result.failures.push('console error: ' + e));
  result.failures.forEach((f) => console.log('FAIL ' + f));
  console.log(result.failures.length ? '\nMODES TEST FAILED (' + result.failures.length + ')' : '\nMODES TEST PASSED');
  try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch { /* best effort */ }
  app.exit(result.failures.length ? 1 : 0);
});
