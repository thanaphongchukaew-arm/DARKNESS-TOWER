// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Screenshot tour for UI review: opens the real game in a hidden Electron
// window and saves a PNG of every main screen at desktop and phone sizes.
//
//   npx electron scripts/screenshots.js <output-dir>
//
// Uses a throwaway profile, so real saves are never touched.
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

const ROOT = path.join(__dirname, '..');
const OUT = path.resolve(process.argv[2] || path.join(os.tmpdir(), 'darkness-tower-shots'));
const PROFILE = fs.mkdtempSync(path.join(os.tmpdir(), 'darkness-tower-shots-profile-'));
app.setPath('userData', PROFILE);
app.on('window-all-closed', () => {});
fs.mkdirSync(OUT, { recursive: true });

ipcMain.on('save:read', (e) => { e.returnValue = null; });
ipcMain.on('save:write', (e) => { e.returnValue = true; });
ipcMain.on('save:remove', (e) => { e.returnValue = true; });
ipcMain.on('window:isFullscreen', (e) => { e.returnValue = false; });
ipcMain.on('window:setFullscreen', () => {});
ipcMain.on('app:quit', () => {});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function shoot(win, name) {
  await sleep(900);
  const image = await win.webContents.capturePage();
  fs.writeFileSync(path.join(OUT, name + '.png'), image.toPNG());
  console.log('saved ' + name);
}

// Page-side helpers, evaluated before each scripted step.
const run = (win, code) => win.webContents.executeJavaScript('(async()=>{' + code + '})()', true);

async function tour(win, tag) {
  await run(win, "document.querySelector('#tip-card-ok') && document.querySelector('#tip-card-ok').click();");
  await shoot(win, tag + '-01-menu');

  await run(win, "document.getElementById('btn-guide').click();");
  await shoot(win, tag + '-02-guide');
  await run(win, "document.getElementById('guide-back').click();");

  await run(win, "document.getElementById('btn-settings').click();");
  await shoot(win, tag + '-03-settings');
  await run(win, "document.getElementById('settings-back').click();");

  await run(win, "document.getElementById('btn-new').click();");
  await shoot(win, tag + '-04-story');
  await run(win, "document.getElementById('story-continue').click();");
  await shoot(win, tag + '-05-difficulty');
  await run(win, "document.querySelector('#difficulty-cards [data-id=\"normal\"]').click();");
  await shoot(win, tag + '-06-class');
  await run(win, "document.querySelector('#class-cards [data-id=\"blade\"]').click();");
  await shoot(win, tag + '-07-blessing');
  await run(win, "document.getElementById('blessing-pick-skip').click();");
  await run(win, "var t=document.getElementById('tip-card-ok'); if(t) t.click();");
  await shoot(win, tag + '-08-tower');

  // A mid-game hero so status, shop and battle are not empty.
  await run(win, `
    const G = window.Game, run = G.State.current;
    run.level = 12; run.currentFloor = 13; run.gold = 640;
    run.talents = { 5: 'riposte', 10: 'flurry' };
    if (G.Tips) G.Tips.setEnabled(false);
    ['w_knight_sword','a_chainmail','s_swift_boots'].forEach((id) => { if (G.Data.getItem(id)) { G.State.addItem(run, id, 1); G.State.equip(run, id); } });
    G.State.addItem(run, 'p_hp_medium', 3);
    G.State.addRelic(run, 'ember_heart');
    G.State.fullRestore(run); G.State.saveNow();
    G.TowerUI.renderTower();
  `);
  await shoot(win, tag + '-09-tower-midgame');

  await run(win, "document.getElementById('tower-status-btn').click();");
  await shoot(win, tag + '-10-status');
  await run(win, "document.getElementById('status-back').click();");
  await run(win, "document.getElementById('tower-shop-btn').click();");
  await shoot(win, tag + '-11-shop');
  await run(win, "document.getElementById('shop-back').click();");
  await run(win, "document.getElementById('tower-quests-btn').click();");
  await shoot(win, tag + '-12-quests');
  await run(win, "document.getElementById('quests-back').click();");

  await run(win, `
    const G = window.Game, r = G.State.current;
    r.currentFloor = 3; G.StoryUI.maybe(3);
  `);
  await shoot(win, tag + '-12a-mira');
  await run(win, "window.Game.UI.showScreen('screen-tower'); window.Game.State.current.currentFloor = 13; window.Game.TowerUI.renderTower();");

  // Normal battle, then the player's skill menu.
  await run(win, "window.Game.BattleUI.startBattle(12, false, false);");
  await sleep(1800);
  await run(win, "var t=document.getElementById('tip-card-ok'); if(t) t.click();");
  await shoot(win, tag + '-13-battle');
  await run(win, "const b=document.querySelector('#battle-actions button:nth-child(2)'); if(b) b.click();");
  await shoot(win, tag + '-14-battle-menu');
  await run(win, "const c=document.getElementById('submenu-close'); if(c) c.click();");

  // Boss battle (floor 100 throne) and the end screen.
  await run(win, "document.getElementById('battle-home').click();");
  await run(win, "const y=document.getElementById('leave-confirm'); if(y) y.click();");
  await run(win, `
    const G = window.Game, run = G.State.current;
    run.currentFloor = 100; G.State.fullRestore(run); G.State.saveNow();
    G.BattleUI.startBattle(100, true, false);
  `);
  await sleep(1800);
  await shoot(win, tag + '-15-boss');
  // Reward screen (needs a live run, so before the defeat screen).
  await run(win, `
    const G = window.Game;
    const run = G.State.current; run.currentFloor = 9; run.pendingReward = null;
    G.State.current.difficulty = 'normal'; G.TowerUI.renderReward(8); G.UI.showScreen('screen-reward');
  `);
  await shoot(win, tag + '-16-reward');

  await run(win, `window.Game.Main.showEnd(false);`);
  await shoot(win, tag + '-18-defeat');

}

app.whenReady().then(async () => {
  for (const [tag, w, h] of [['desktop', 1280, 800], ['phone', 844, 390]].filter((x) => !process.env.ONLY || x[0] === process.env.ONLY)) {
    const win = new BrowserWindow({ width: w, height: h, show: false, useContentSize: true, webPreferences: { preload: path.join(ROOT, 'electron', 'preload.js'), contextIsolation: true, sandbox: true, backgroundThrottling: false } });
    await win.loadURL(require('url').pathToFileURL(path.join(ROOT, 'index.html')).href + (tag === 'phone' ? '?mobile=1' : ''));
    await sleep(700);
    try { await tour(win, tag); } catch (e) { console.log('tour failed (' + tag + '): ' + e.message); }
    win.destroy();
  }
  try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch { /* best effort */ }
  console.log('done: ' + OUT);
  app.exit(0);
});
