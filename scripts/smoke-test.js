// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// End-to-end smoke test: boots the real game in a hidden Electron window (same
// preload bridge as the shipped desktop build), then plays it through the UI --
// menus, settings, a new run, battles, rewards, events, a retreat,
// a defeat, save export/import and keyboard navigation -- failing on any script
// error, console error or broken expectation.
//
//   npm run smoke            (set SMOKE_FLOORS=20 to climb further)
//
// Uses a throwaway profile directory, so real saves are never touched.
/* global window, document, NodeFilter, KeyboardEvent -- the IN_PAGE function below runs inside the game page */
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

const ROOT = path.join(__dirname, '..');
const PROFILE = fs.mkdtempSync(path.join(os.tmpdir(), 'darkness-tower-smoke-'));
app.setPath('userData', PROFILE);
const TARGET_FLOOR = parseInt(process.env.SMOKE_FLOORS || '12', 10);

function saveFile(key) { return /^[A-Za-z0-9_]{1,64}$/.test(key) ? path.join(PROFILE, 'saves', key + '.json') : null; }
ipcMain.on('save:read', (e, key) => { const f = saveFile(key); e.returnValue = f && fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null; });
ipcMain.on('save:write', (e, key, text) => { const f = saveFile(key); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, text); e.returnValue = true; });
ipcMain.on('save:remove', (e, key) => { const f = saveFile(key); if (f && fs.existsSync(f)) fs.unlinkSync(f); e.returnValue = true; });
ipcMain.on('window:isFullscreen', (e) => { e.returnValue = false; });
ipcMain.on('window:setFullscreen', () => {});
ipcMain.on('app:quit', () => {});

// Runs inside the page. Returns { failures: [...], log: [...] }.
const IN_PAGE = async function (TARGET, BUDGET) {
  const failures = [], log = [];
  const G = window.Game;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const $ = (sel) => document.querySelector(sel);
  const vis = (el) => !!el && !el.disabled && !el.closest('.hidden') && el.getBoundingClientRect().width > 0;
  const active = () => { const s = $('.screen.active'); return s ? s.id : null; };
  const check = (cond, what) => { if (!cond) failures.push(what); else log.push('ok: ' + what); };
  const click = (sel) => { const el = typeof sel === 'string' ? $(sel) : sel; if (!vis(el)) return false; el.click(); return true; };
  const modalOpen = (id) => { const el = document.getElementById(id); return el && !el.classList.contains('hidden') && el.children.length ? el : null; };
  // Untranslated strings show up as raw camelCase keys.
  const rawKeys = () => {
    const out = [];
    const walker = document.createTreeWalker($('.screen.active') || document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) { const t = walker.currentNode.textContent.trim(); if (/^[a-z]+[A-Z][A-Za-z]+$/.test(t) && t.length > 8) out.push(t); }
    return out;
  };
  const checkScreenText = (label) => { const keys = rawKeys(); check(!keys.length, label + ' has no untranslated keys' + (keys.length ? ' -> ' + keys.slice(0, 5).join(',') : '')); };

  try {
    // ---- menu, settings, credits, guide (both languages) ----
    check(active() === 'screen-menu', 'boots to the main menu');
    for (const lang of ['th', 'en']) {
      if (G.I18n.getLang() !== lang) $('#lang-toggle').click();
      check(click('#btn-guide') && active() === 'screen-guide', lang + ': guide opens'); checkScreenText(lang + ' guide'); click('#guide-back');
      check(click('#btn-settings') && active() === 'screen-settings', lang + ': settings opens'); checkScreenText(lang + ' settings');
      const music = $('#set-music'); music.value = 35; music.dispatchEvent(new Event('input', { bubbles: true }));
      check(G.Audio.getMusicVolume() === 35 && $('#music-volume').value === '35', lang + ': music slider syncs with the corner control');
      const sfx = $('#set-sfx'); sfx.value = 60; sfx.dispatchEvent(new Event('input', { bubbles: true }));
      check(G.Audio.getSfxVolume() === 60, lang + ': effects slider applies');
      const before = G.Audio.isMuted(); click('#set-mute'); check(G.Audio.isMuted() !== before, lang + ': mute toggles'); click('#set-mute');
      click('#set-speed'); click('#set-hints'); click('#set-hints'); click('#set-hints-reset');
      click('#settings-back');
      check(click('#btn-credits') && active() === 'screen-credits', lang + ': credits opens'); checkScreenText(lang + ' credits'); click('#credits-back');
      check(active() === 'screen-menu', lang + ': back on the menu');
    }
    if (G.I18n.getLang() !== 'th') $('#lang-toggle').click();
    const meta0 = G.Save.readMeta(); meta0.battleSpeed = 4; G.Save.writeMeta(meta0);

    // ---- keyboard navigation on the menu ----
    const key = (k) => document.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
    key('ArrowDown'); const f1 = document.activeElement; key('ArrowDown'); const f2 = document.activeElement;
    check(f1 && f1.tagName === 'BUTTON' && f2 && f2 !== f1, 'arrow keys move focus between menu buttons');
    document.documentElement.classList.remove('kbd-nav');

    // ---- new run: story -> difficulty -> hideout -> class -> floor 1 ----
    click('#btn-new'); check(active() === 'screen-story', 'new game shows the intro story');
    click('#story-continue'); check(active() === 'screen-difficulty', 'story leads to difficulty select');
    check(document.querySelectorAll('#difficulty-cards .select-card').length === 4, 'four difficulties are offered'); checkScreenText('difficulty');
    key('Escape'); check(active() === 'screen-menu', 'Esc goes back from difficulty select');
    click('#btn-new'); click('#story-continue'); click('#difficulty-cards [data-id="normal"]');
    check(active() === 'screen-hideout' && G.HideoutUI.preparation().difficulty === 'normal', 'picking Normal opens the hideout');
    check(!G.State.current && !G.Save.exists(), 'the hideout has no active run'); checkScreenText('hideout');
    click('#hideout-bench'); check(!!modalOpen('modal-root'), 'the Lamplighter’s letter opens'); click('#modal-confirm');
    click('#hideout-map'); check(active() === 'screen-codex' && !!$('#codex-tab-bestiary'), 'the map opens the Bestiary');
    click('#codex-back'); check(active() === 'screen-hideout', 'the Bestiary returns to the hideout');
    click('#hideout-shrine');
    const shrineOptions = JSON.stringify(G.HideoutUI.preparation().options);
    click('#blessing-pick-cards [data-kind="solo"]');
    const selectedBlessing = G.HideoutUI.preparation().blessing;
    click('#hideout-back'); click('#btn-continue'); click('#hideout-shrine');
    check(JSON.stringify(G.HideoutUI.preparation().options) === shrineOptions && !!$('#blessing-pick-cards [aria-pressed="true"]'), 'shrine choice and offers survive leaving the hideout');
    click('#blessing-pick-back'); click('#hideout-enter');
    check(active() === 'screen-class', 'the hideout door opens class select');
    check(document.querySelectorAll('#class-cards .select-card').length === 29, '29 classes are listed');
    const imgs = Array.from(document.querySelectorAll('#class-cards svg.class-character')).slice(0, 3);
    click('#class-cards [data-id="blade"]');
    check(active() === 'screen-battle' && G.State.current?.currentFloor === 1 && G.State.current.difficulty === 'normal', 'selecting a class enters floor 1 directly');
    check(G.State.current?.blessings.includes(selectedBlessing) && !G.HideoutUI.preparation(), 'the shrine’s blessing applies once on departure');
    check(imgs.length === 3, 'class portraits render');

    // ---- climb: a generic driver that always presses something sensible ----
    const seen = {}, started = Date.now();
    let stuck = 0, lastSig = '', lastScreen = '', defeats = 0;
    async function drive(until, budgetMs) {
      const t0 = Date.now();
      while (Date.now() - t0 < budgetMs) {
        if (modalOpen('error-overlay')) { failures.push('error overlay appeared on ' + active()); return false; }
        if (until()) return true;
        const run = G.State.current, screen = active();
        seen[screen] = (seen[screen] || 0) + 1;
        const tip = $('#tip-card-ok'); if (vis(tip)) tip.click();
        if (screen !== lastScreen) { lastScreen = screen; log.push('screen ' + screen + ' floor ' + (run && run.currentFloor) + ' t=' + Math.round((Date.now() - started) / 1000) + 's'); }
        if (screen === 'screen-waypoint' && Date.now() - t0 > 20000 && !seen.dumpedWaypoint) { seen.dumpedWaypoint = 1; log.push('WAYPOINT DUMP: ' + $('#screen-waypoint').innerText.replace(/\s+/g, ' ').slice(0, 400) + ' | buttons: ' + Array.from($('#screen-waypoint').querySelectorAll('button')).map((b) => (b.id || b.className) + (vis(b) ? '' : '(hidden)')).join(',')); }
        // Optional mini-games (forge/lockpick/cards) always offer Skip, which resolves the event as before.
        const mg = document.querySelector('.minigame-overlay [data-mg="skip"]'); if (mg) { mg.click(); await sleep(150); continue; }
        const modal = modalOpen('modal-root'), allout = modalOpen('allout-modal');
        if (allout) click('#allout-confirm');
        else if (modal) { const b = ['[data-choice]', '[data-story-choice]', '#modal-confirm', '#bond-close', '.btn-primary', 'button'].map((q) => modal.querySelector(q)).find(Boolean); if (b) b.click(); }
        else if (screen === 'screen-tower') { if (run && run.hp < G.State.getMaxHp(run) * 0.5) G.State.fullRestore(run); click('.floor-row.current'); }
        else if (screen === 'screen-battle') {
          // The smoke test checks flow, not balance (scripts/balance-sim.js does that): keep the hero alive.
          if (run && run.hp < G.State.getMaxHp(run) * 0.4) { run.hp = G.State.getMaxHp(run); run.mp = G.State.getMaxMp(run); }
          const target = $('.enemy-card.targetable');
          if (target) target.click();
          else { const b = Array.from(document.querySelectorAll('#battle-actions button')).filter(vis)[0]; if (b) b.click(); }
        }
        else if (screen === 'screen-reward') click('#reward-cards .select-card');
        else if (screen === 'screen-event') { if (!seen['text-event-' + run.currentFloor]) { seen['text-event-' + run.currentFloor] = 1; checkScreenText('event on floor ' + run.currentFloor); } const c = Array.from(document.querySelectorAll('#event-body .select-card, #event-body button, #event-actions button')).filter(vis)[0]; if (c) c.click(); }
        else if (screen === 'screen-waypoint') { const c = Array.from(document.querySelectorAll('#waypoint-actions button, #waypoint-body .select-card')).filter(vis); const b = c.find((x) => x.closest('#waypoint-actions')) || c[0]; if (b) b.click(); }
        else if (screen === 'screen-story') click('#story-continue');
        else if (screen === 'screen-end') {
          // A natural defeat ends this smoke run under permadeath.
          if (!vis($('#end-checkpoint-btn'))) return false;
          defeats++; $('#end-checkpoint-btn').click();
        }
        else { const b = Array.from(document.querySelectorAll('.screen.active button')).filter(vis)[0]; if (b) b.click(); }
        const sig = screen + '|' + (run ? run.currentFloor + '|' + run.hp + '|' + run.exp : '') + '|' + document.querySelectorAll('#battle-log > *').length + '|' + !!modal;
        stuck = sig === lastSig ? stuck + 1 : 0; lastSig = sig;
        if (stuck > 220) { failures.push('driver made no progress for 30s on ' + screen + ' (floor ' + (run && run.currentFloor) + ')'); return false; }
        await sleep(140);
      }
      failures.push('driver ran out of time on ' + active());
      return false;
    }

    const reached = await drive(() => G.State.current && G.State.current.currentFloor >= TARGET && active() === 'screen-tower' && !modalOpen('modal-root'), BUDGET);
    check(reached, 'climbed to floor ' + TARGET + ' through the real UI');
    log.push('defeats resumed from a checkpoint: ' + defeats);
    log.push('screens visited: ' + Object.keys(seen).filter((k) => k.indexOf('text-') !== 0).join(', ') + ' in ' + Math.round((Date.now() - started) / 1000) + 's');
    if (reached) {
      const run = G.State.current;
      check(run.level > 1 && (run.level < 5 || Object.keys(run.talents || {}).length >= 1), 'levelled up and chose a talent (level ' + run.level + ')');
      check(G.State.getCheckpoint(run) === null, 'permadeath has no checkpoint');
      checkScreenText('tower');

      // ---- side screens ----
      for (const [btn, screen, back] of [['#tower-status-btn', 'screen-status', '#status-back'], ['#tower-shop-btn', 'screen-shop', '#shop-back'], ['#tower-craft-btn', 'screen-craft', '#craft-back'], ['#tower-quests-btn', 'screen-quests', '#quests-back'], ['#tower-codex-btn', 'screen-codex', '#codex-back']]) {
        if (!vis($(btn))) { log.push('skip ' + screen + ' (button hidden)'); continue; }
        click(btn); await sleep(60);
        check(active() === screen, screen + ' opens'); checkScreenText(screen);
        $('#lang-toggle').click(); checkScreenText(screen + ' (en)'); $('#lang-toggle').click();
        const m = modalOpen('modal-root'); if (m) { const b = m.querySelector('button'); if (b) b.click(); }
        click(back); await sleep(60);
        check(active() === 'screen-tower', screen + ' returns to the tower');
      }

      // ---- retreat costs gold ----
      run.gold = 200; G.State.fullRestore(run); G.State.saveNow();
      click('.floor-row.current'); await sleep(400);
      await drive(() => active() === 'screen-battle', 20000);
      check(active() === 'screen-battle' && run.battleMark != null, 'battle start marks the run');
      const goldBefore = G.State.current.gold;
      click('#battle-home'); await sleep(80); click('#leave-confirm'); await sleep(200);
      check(active() === 'screen-tower' && G.State.current.gold === goldBefore - Math.floor(goldBefore * 0.15) && G.State.current.battleMark == null, 'retreating costs 15% gold and clears the mark');

      // ---- save: export / import / corruption recovery ----
      const exported = G.Save.exportAll();
      const floorNow = G.State.current.currentFloor;
      G.State.current.currentFloor = 3; G.State.saveNow();
      check(G.Save.importAll('not json').ok === false && G.Save.importAll('{"tag":"x"}').ok === false, 'import rejects foreign data');
      check(G.Save.importAll(exported).ok === true && G.Save.read().currentFloor === floorNow, 'import restores the exported run');
      G.State.current = G.Save.read();
      G.State.saveNow(); G.State.current.gold += 1; G.State.saveNow();
      localStorage.setItem('towerRPG_save_v1', '{broken');
      const recovered = G.Save.read();
      check(recovered && recovered.classId === 'blade', 'a corrupt save falls back to the backup copy');
      check(localStorage.getItem('towerRPG_save_v1_corrupt') === '{broken', 'the corrupt copy is kept aside, not deleted');
      check(typeof window.DesktopBridge.readSave('towerRPG_meta_v1') === 'string', 'saves are mirrored to real files in the desktop build');

      // ---- continue from the menu ----
      click('#tower-home'); await sleep(80); const m2 = modalOpen('modal-root'); if (m2) click('#modal-confirm'); await sleep(80);
      check(active() === 'screen-menu' && vis($('#btn-continue')), 'home returns to the menu with Continue');
      click('#btn-continue'); await sleep(120);
      check(active() === 'screen-tower' || active() === 'screen-reward', 'Continue resumes the run');

      // ---- defeat clears the run on every difficulty ----
      G.Main.showEnd(false); await sleep(100);
      check(active() === 'screen-end' && !vis($('#end-checkpoint-btn')), 'defeat offers no checkpoint'); checkScreenText('defeat');
      check(G.State.current === null && !G.Save.read(), 'defeat clears the active and saved run');
      click('#end-menu-btn'); await sleep(60);
      check(active() === 'screen-hideout' && G.HideoutUI.preparation().returned, 'defeat returns to the hideout');
      const mastery = G.Mastery.profile(G.Save.readMeta());
      check(mastery.coins > 0 && G.Mastery.classRecord(mastery, 'blade').xp > 0, 'first clears pay out both permanent rewards');
      check(!!$('#hideout-last-run') && !G.HideoutUI.preparation().blessing, 'the hideout keeps a record and resets preparation');
      click('#hideout-back'); click('#btn-continue'); click('#hideout-enter'); click('#class-cards [data-id="samurai"]');
      check(active() === 'screen-battle' && G.State.current?.classId === 'samurai' && G.State.current.currentFloor === 1, 'Continue and the hideout door start a fresh run with a new class');

      // ---- the class perk book spends only the between-run wallet ----
      for (let floor = 1; floor <= 5; floor++) G.Mastery.recordClear(G.State.current, floor);
      G.Main.showEnd(false);
      check(!!$('#run-summary .mastery-reward'), 'the run summary shows both permanent rewards');
      click('#end-menu-btn'); click('#hideout-mastery');
      check(active() === 'screen-mastery' && $('#mastery-class').value === 'samurai', 'the perk book opens on the last class');
      const beforePurchase = G.Mastery.profile(G.Save.readMeta()).coins;
      click('[data-perk="samurai_draw"]');
      check(G.Mastery.equipped('samurai') === 'samurai_draw' &&
        G.Mastery.profile(G.Save.readMeta()).coins === beforePurchase - 10, 'purchasing a perk uses Lantern Coins and equips it');
      click('#mastery-back'); click('#hideout-enter'); click('#class-cards [data-id="samurai"]');
      check(G.State.current?.masteryPerk === 'samurai_draw' && G.State.current.gold === 0, 'the equipped perk carries into a fresh run with zero tower gold');

      // ---- crash overlay ----
      G.Main.showErrorOverlay(new Error('smoke test probe'));
      check(!!modalOpen('error-overlay'), 'the crash overlay opens'); click('#error-menu'); await sleep(60);
      check(!modalOpen('error-overlay') && active() === 'screen-menu', 'the crash overlay returns to the menu');
    }
  } catch (e) {
    failures.push('exception in smoke script: ' + (e && e.stack || e));
  }
  return { failures, log };
};

app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 1280, height: 800, show: false, webPreferences: { preload: path.join(ROOT, 'electron', 'preload.js'), contextIsolation: true, sandbox: true, backgroundThrottling: false } });
  const consoleErrors = [];
  win.webContents.on('console-message', (event, level, message, line, source) => {
    if (level >= 3 && !/smoke test probe/.test(message)) consoleErrors.push(message + ' (' + path.basename(String(source)) + ':' + line + ')');
  });
  win.webContents.on('render-process-gone', () => { console.log('FAIL renderer crashed'); app.exit(1); });
  await win.loadFile(path.join(ROOT, 'index.html'));
  let result;
  try {
    result = await win.webContents.executeJavaScript('(' + IN_PAGE.toString() + ')(' + TARGET_FLOOR + ',' + parseInt(process.env.SMOKE_MS || String(15 * 60 * 1000), 10) + ')', true);
  } catch (e) {
    result = { failures: ['executeJavaScript failed: ' + e.message], log: [] };
  }
  result.log.forEach((l) => console.log(l));
  consoleErrors.forEach((e) => result.failures.push('console error: ' + e));
  result.failures.forEach((f) => console.log('FAIL ' + f));
  console.log(result.failures.length ? '\nSMOKE TEST FAILED (' + result.failures.length + ')' : '\nSMOKE TEST PASSED');
  try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch { /* best effort */ }
  app.exit(result.failures.length ? 1 : 0);
});
