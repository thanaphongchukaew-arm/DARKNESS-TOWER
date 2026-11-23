// Visual regression without storing images. Key screens are rendered deterministically (seeded randomness,
// animations off, fixed state), shrunk to an 8x8 grid of average colours plus a 64-bit difference hash, and
// compared with test/visual-baseline.json. It catches what geometry audits cannot: missing art, wrong
// colours, a screen that went blank, a layout that shifted wholesale.
//
//   npm run test:visual            compare against the baseline (exit 1 on a visible change)
//   npm run test:visual -- --update   accept the current look as the new baseline
//
// Baselines are per platform (font rasterisation differs between macOS and Linux); a platform without a
// baseline prints a notice and passes.
/* global window, document -- IN_PAGE runs inside the game page */
const { app, BrowserWindow, ipcMain, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

const ROOT = path.join(__dirname, '..');
const BASELINE = path.join(ROOT, 'test', 'visual-baseline.json');
const UPDATE = process.argv.includes('--update');
const DEMO = process.argv.includes('--demo-breakage');   // proves the guard: hides all artwork and shifts colours
const PROFILE = fs.mkdtempSync(path.join(os.tmpdir(), 'darkness-tower-visual-'));
app.setPath('userData', PROFILE);
app.on('window-all-closed', () => {});   // closing a viewport's window must not quit the app
ipcMain.on('save:read', (e) => { e.returnValue = null; });
ipcMain.on('save:write', (e) => { e.returnValue = true; });
ipcMain.on('save:remove', (e) => { e.returnValue = true; });
ipcMain.on('window:isFullscreen', (e) => { e.returnValue = false; });
ipcMain.on('window:setFullscreen', () => {});
ipcMain.on('app:quit', () => {});

const { VIEWPORTS, SHOTS } = require('./lib/screens.js');

const IN_PAGE = async function (js, name, demo) {
  const G = window.Game;
  let st = 12345; Math.random = function () { st = (st + 0x6D2B79F5) >>> 0; let t = st; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  await document.fonts.ready; G.Tips.setEnabled(false); G.I18n.setLang('en');
  const m = document.getElementById('modal-root'); m.classList.add('hidden'); m.innerHTML = ''; G.BattleUI.cancelPlayback();
  if (!document.getElementById('vr-freeze')) { const s = document.createElement('style'); s.id = 'vr-freeze'; s.textContent = '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}.battle-entrance{display:none!important}'; document.head.appendChild(s); }
  const run = G.State.createRun('nightmare', 'blade', 0); run.level = name === 'modal-talents' ? 5 : 23; run.currentFloor = 23; run.gold = 4321; G.State.fullRestore(run);
  G.Data.items.filter((i) => i.kind === 'consumable').slice(0, 6).forEach((i) => G.State.addItem(run, i.id, 2));
  if (demo) { const d = document.createElement('style'); d.textContent = '.battle-scene-art,.hero-visual,.enemy-art{visibility:hidden!important}.screen{filter:hue-rotate(70deg)}'; document.head.appendChild(d); }
  new Function('G', js)(G);
  await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
  await new Promise((r) => setTimeout(r, 450));
  return true;
};

// 8x8 grid of mean RGB (192 numbers) + 64-bit dHash of a 9x8 greyscale
function signature(png) {
  const small = png.resize({ width: 64, height: 64, quality: 'good' }), bmp = small.toBitmap();   // BGRA
  const px = (x, y) => { const i = (y * 64 + x) * 4; return [bmp[i + 2], bmp[i + 1], bmp[i]]; };
  const grid = [];
  for (let gy = 0; gy < 8; gy++) for (let gx = 0; gx < 8; gx++) {
    let r = 0, g = 0, b = 0;
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { const p = px(gx * 8 + x, gy * 8 + y); r += p[0]; g += p[1]; b += p[2]; }
    grid.push(Math.round(r / 64), Math.round(g / 64), Math.round(b / 64));
  }
  const tiny = png.resize({ width: 9, height: 8, quality: 'good' }).toBitmap(); let bits = '';
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { const a = (y * 9 + x) * 4, b = a + 4; const la = tiny[a] + tiny[a + 1] + tiny[a + 2], lb = tiny[b] + tiny[b + 1] + tiny[b + 2]; bits += la > lb ? '1' : '0'; }
  return { grid, dhash: BigInt('0b' + bits).toString(16).padStart(16, '0') };
}
const hamming = (a, b) => { let x = BigInt('0x' + a) ^ BigInt('0x' + b), n = 0; while (x) { n += Number(x & 1n); x >>= 1n; } return n; };
function compare(a, b) {
  let sum = 0, max = 0;
  for (let i = 0; i < a.grid.length; i++) { const d = Math.abs(a.grid[i] - b.grid[i]); sum += d; if (d > max) max = d; }
  return { mean: sum / a.grid.length, max, hash: hamming(a.dhash, b.dhash) };
}
// A change is "visible" when the average colour moved, or one region changed a lot, or the structure hash flipped.
const LIMITS = { mean: 4, max: 70, hash: 10 };

app.whenReady().then(async () => {
  const results = {};
  for (const [vp, width, height, mobile] of VIEWPORTS) {
    const win = new BrowserWindow({ width, height, useContentSize: true, show: false, webPreferences: { contextIsolation: false, backgroundThrottling: false } });
    await win.loadURL(require('url').pathToFileURL(path.join(ROOT, 'index.html')).href + (mobile ? '?mobile=1' : ''));
    for (const [name, js] of SHOTS) {
      await win.webContents.executeJavaScript('(' + IN_PAGE.toString() + ')(' + JSON.stringify(js) + ',' + JSON.stringify(name) + ',' + DEMO + ')', true);
      results[vp + '/' + name] = signature(nativeImage.createFromBuffer((await win.webContents.capturePage()).toPNG()));
    }
    win.destroy();
  }
  const all = fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')) : {};
  if (UPDATE) {
    all[process.platform] = results;
    fs.writeFileSync(BASELINE, JSON.stringify(all));
    console.log('Baseline updated for ' + process.platform + ' (' + Object.keys(results).length + ' screens, ' + (fs.statSync(BASELINE).size / 1024).toFixed(0) + ' KB file)');
    try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch { /* best effort */ }
    app.exit(0); return;
  }
  const base = all[process.platform];
  if (!base) { console.log('No visual baseline for ' + process.platform + ' yet; run with --update to record one. (skipped)'); app.exit(0); return; }
  const failures = [], missing = Object.keys(base).filter((k) => !results[k]);
  for (const [k, sig] of Object.entries(results)) {
    if (!base[k]) { failures.push(k + ': new screen with no baseline (run --update)'); continue; }
    const d = compare(base[k], sig);
    console.log((d.mean > LIMITS.mean || d.max > LIMITS.max || d.hash > LIMITS.hash ? 'CHANGED ' : 'same    ') + k.padEnd(34) + ' mean ' + d.mean.toFixed(2) + ' max ' + d.max + ' hash ' + d.hash);
    if (d.mean > LIMITS.mean || d.max > LIMITS.max || d.hash > LIMITS.hash) failures.push(k + ': looks different (mean ' + d.mean.toFixed(2) + ', max ' + d.max + ', hash ' + d.hash + ')');
  }
  missing.forEach((k) => failures.push(k + ': in the baseline but no longer rendered'));
  failures.forEach((f) => console.log('FAIL ' + f));
  console.log(failures.length ? '\nVISUAL REGRESSION: ' + failures.length + ' screen(s) changed. If intentional: npm run test:visual -- --update' : '\nVISUAL REGRESSION PASSED (' + Object.keys(results).length + ' screens)');
  try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch { /* best effort */ }
  app.exit(failures.length ? 1 : 0);
});
