// Accessibility audit with axe-core on every key screen (desktop + phone). Pixel-art UIs usually start with
// many findings, so this is a RATCHET: test/a11y-baseline.json records today's count per rule per screen;
// the audit fails only when something gets WORSE (a new rule or more affected elements). Fix things and run
// with --update to lock the improvement in.
//
//   npm run test:a11y               fail on any regression
//   npm run test:a11y -- --update   record the current state as the new baseline
//   npm run test:a11y -- --report   also print every finding (what to fix next)
/* global window, document -- IN_PAGE runs inside the game page */
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { VIEWPORTS, SHOTS } = require('./lib/screens.js');

const ROOT = path.join(__dirname, '..');
const BASELINE = path.join(ROOT, 'test', 'a11y-baseline.json');
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const UPDATE = process.argv.includes('--update'), REPORT = process.argv.includes('--report');
const PROFILE = fs.mkdtempSync(path.join(os.tmpdir(), 'darkness-tower-a11y-'));
app.setPath('userData', PROFILE);
app.on('window-all-closed', () => {});
['save:read', 'save:write', 'save:remove', 'window:isFullscreen', 'window:setFullscreen', 'app:quit'].forEach((c) => ipcMain.on(c, (e) => { e.returnValue = null; }));

const PREP = async function (js, name) {
  const G = window.Game;
  let st = 12345; Math.random = function () { st = (st + 0x6D2B79F5) >>> 0; let t = st; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  await document.fonts.ready; G.Tips.setEnabled(false); G.I18n.setLang('en');
  const m = document.getElementById('modal-root'); m.classList.add('hidden'); m.innerHTML = ''; G.BattleUI.cancelPlayback();
  if (!document.getElementById('vr-freeze')) { const s = document.createElement('style'); s.id = 'vr-freeze'; s.textContent = '*,*::before,*::after{animation:none!important;transition:none!important}.battle-entrance{display:none!important}'; document.head.appendChild(s); }
  const run = G.State.createRun('nightmare', 'blade', 0); run.level = name === 'modal-talents' ? 5 : 23; run.currentFloor = 23; run.gold = 4321; G.State.fullRestore(run);
  G.Data.items.filter((i) => i.kind === 'consumable').slice(0, 6).forEach((i) => G.State.addItem(run, i.id, 2));
  new Function('G', js)(G);
  await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
  await new Promise((r) => setTimeout(r, 400));
  return true;
};

app.whenReady().then(async () => {
  const found = {};     // "viewport/screen" -> { ruleId: { nodes, impact, help } }
  for (const [vp, width, height, mobile] of VIEWPORTS) {
    const win = new BrowserWindow({ width, height, useContentSize: true, show: false, webPreferences: { contextIsolation: false, backgroundThrottling: false } });
    await win.loadURL(require('url').pathToFileURL(path.join(ROOT, 'index.html')).href + (mobile ? '?mobile=1' : ''));
    await win.webContents.executeJavaScript(AXE);
    for (const [name, js] of SHOTS) {
      await win.webContents.executeJavaScript('(' + PREP.toString() + ')(' + JSON.stringify(js) + ',' + JSON.stringify(name) + ')', true);
      const res = await win.webContents.executeJavaScript(`window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] }, resultTypes: ['violations'] }).then(function (r) { return r.violations.map(function (v) { return { id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length, sample: v.nodes.slice(0, 3).map(function (n) { return n.target.join(' ') + ' :: ' + (n.html || '').slice(0, 80); }) }; }); })`, true);
      found[vp + '/' + name] = Object.fromEntries(res.map((v) => [v.id, { nodes: v.nodes, impact: v.impact, help: v.help, sample: v.sample }]));
    }
    win.destroy();
  }
  const counts = Object.fromEntries(Object.entries(found).map(([k, rules]) => [k, Object.fromEntries(Object.entries(rules).map(([r, v]) => [r, v.nodes]))]));
  if (REPORT) {
    const byRule = {};
    for (const [k, rules] of Object.entries(found)) for (const [r, v] of Object.entries(rules)) { (byRule[r] = byRule[r] || { impact: v.impact, help: v.help, nodes: 0, screens: [], sample: v.sample[0] }); byRule[r].nodes += v.nodes; byRule[r].screens.push(k); }
    Object.entries(byRule).sort((a, b) => b[1].nodes - a[1].nodes).forEach(([r, v]) => console.log(String(v.nodes).padStart(5) + '  [' + v.impact + '] ' + r + ' - ' + v.help + '\n         e.g. ' + v.sample + '\n         on ' + v.screens.length + ' screen(s)'));
  }
  if (UPDATE) {
    fs.writeFileSync(BASELINE, JSON.stringify(counts, null, 1));
    const total = Object.values(counts).reduce((n, r) => n + Object.values(r).reduce((a, b) => a + b, 0), 0);
    console.log('Baseline updated: ' + Object.keys(counts).length + ' screens, ' + total + ' findings recorded.');
    try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch { /* best effort */ }
    app.exit(0); return;
  }
  const base = fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')) : null;
  if (!base) { console.log('No accessibility baseline yet; run with --update.'); app.exit(1); return; }
  const worse = [], better = [];
  for (const [k, rules] of Object.entries(counts)) {
    for (const [r, n] of Object.entries(rules)) { const was = (base[k] || {})[r] || 0; if (n > was) worse.push(k + ': ' + r + ' ' + was + ' -> ' + n + '  e.g. ' + found[k][r].sample[0]); }
    for (const [r, was] of Object.entries(base[k] || {})) if (!(rules[r] >= was)) better.push(k + ': ' + r + ' ' + was + ' -> ' + (rules[r] || 0));
  }
  const total = Object.values(counts).reduce((n, r) => n + Object.values(r).reduce((a, b) => a + b, 0), 0);
  console.log('Accessibility findings now: ' + total + ' across ' + Object.keys(counts).length + ' screens.');
  if (better.length) console.log('Improved vs baseline (run --update to lock in): ' + better.length + ' item(s)');
  worse.slice(0, 25).forEach((w) => console.log('FAIL ' + w));
  console.log(worse.length ? '\nACCESSIBILITY REGRESSION (' + worse.length + ')' : '\nACCESSIBILITY OK (no new findings)');
  try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch { /* best effort */ }
  app.exit(worse.length ? 1 : 0);
});
