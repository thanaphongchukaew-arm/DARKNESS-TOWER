// Leak / long-session guard. Plays hundreds of battles and visits every main screen in one page session,
// then checks that the number of DOM nodes and the JS heap are NOT growing run after run.
//
//   npm run test:soak [-- --iterations=300]        exit code 1 on growth beyond the thresholds
/* global window, document -- IN_PAGE runs inside the game page */
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

const ROOT = path.join(__dirname, '..');
const PROFILE = fs.mkdtempSync(path.join(os.tmpdir(), 'darkness-tower-soak-'));
app.setPath('userData', PROFILE);
app.commandLine.appendSwitch('js-flags', '--expose-gc');
app.commandLine.appendSwitch('enable-precise-memory-info');
const ITER = Number((process.argv.find((a) => a.startsWith('--iterations=')) || '').split('=')[1]) || 60;   // ~3 minutes; use --iterations=300 for an overnight-style soak
const LEAK_DEMO = process.argv.includes('--leak-demo');   // proves the guard: leaks 40 elements per iteration on purpose

ipcMain.on('save:read', (e) => { e.returnValue = null; });
ipcMain.on('save:write', (e) => { e.returnValue = true; });
ipcMain.on('save:remove', (e) => { e.returnValue = true; });
ipcMain.on('window:isFullscreen', (e) => { e.returnValue = false; });
ipcMain.on('window:setFullscreen', () => {});
ipcMain.on('app:quit', () => {});

const IN_PAGE = async function (ITERATIONS, LEAK) {
  const G = window.Game, S = G.State;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const $ = (s) => document.querySelector(s);
  const waitFor = async (fn, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (fn()) return true; } catch { /* retry */ } await sleep(15); } return false; };
  const meta = G.Save.readMeta(); meta.battleSpeed = 4; G.Save.writeMeta(meta);
  try { G.Tips.setEnabled(false); } catch { /* none */ }
  const run = S.createRun('normal', 'blade', 0); S.current = run; run.level = 30; run.gold = 5000; S.fullRestore(run);
  let battle = null; const real = G.BattleEngine.createBattle;
  G.BattleEngine.createBattle = function () { battle = real.apply(this, arguments); return battle; };
  const nodes = () => document.getElementsByTagName('*').length;
  const sample = async () => { for (let i = 0; i < 3; i++) { window.gc(); await sleep(30); } return { nodes: nodes(), heap: performance.memory.usedJSHeapSize }; };
  const points = [];
  const floors = [1, 3, 7, 12, 25, 42, 60, 88, 100];
  for (let i = 1; i <= ITERATIONS; i++) {
    const floor = floors[i % floors.length];
    run.currentFloor = floor; run.hp = S.getMaxHp(run); run.mp = S.getMaxMp(run);
    G.BattleUI.cancelPlayback();
    G.BattleUI.startBattle(floor, floor === 100, false);
    await waitFor(() => $('#act-attack') && !$('#act-attack').disabled && !G.BattleUI.isPlayingEffects(), 6000);
    // one real attack round through the UI
    battle.enemies.forEach((e) => { if (e.alive) e.hp = 1; });
    $('#act-attack').click(); await sleep(40);
    const t = $('.enemy-card.targetable'); if (t) t.click();
    await waitFor(() => battle.over && !G.BattleUI.isPlayingEffects(), 8000);
    G.BattleUI.cancelPlayback();
    // visit the other screens
    for (const [fn, screen] of [[() => G.TowerUI.renderTower(), 'screen-tower'], [() => G.TowerUI.renderStatus(), 'screen-status'], [() => G.TowerUI.renderShop(), 'screen-shop'], [() => G.TowerUI.renderCraft(), 'screen-craft'], [() => G.TowerUI.renderQuests(), 'screen-quests']]) { fn(); G.UI.showScreen(screen); }
    if (LEAK) { for (let k = 0; k < 40; k++) { const d = document.createElement('div'); d.textContent = 'leak ' + i + ' ' + k; document.body.appendChild(d); } }
    const m = document.getElementById('modal-root'); if (m) { m.classList.add('hidden'); m.innerHTML = ''; }
    if (i === 20 || i % 40 === 0 || i === ITERATIONS) points.push({ i, ...(await sample()) });
  }
  return points;
};

app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 1280, height: 800, show: false, webPreferences: { preload: path.join(ROOT, 'electron', 'preload.js'), contextIsolation: true, sandbox: true, backgroundThrottling: false } });
  const errors = [];
  win.webContents.on('console-message', (event) => { if (event.level === 'error' && !/Autofill|DevTools/.test(String(event.message))) errors.push(String(event.message)); });
  await win.loadFile(path.join(ROOT, 'index.html'));
  let points;
  try { points = await win.webContents.executeJavaScript('(' + IN_PAGE.toString() + ')(' + ITER + ',' + LEAK_DEMO + ')', true); }
  catch (e) { console.log('FAIL soak script threw: ' + e.message); app.exit(1); return; }
  const first = points[0], last = points[points.length - 1];
  const mb = (n) => (n / 1048576).toFixed(1) + ' MB';
  points.forEach((p) => console.log('iteration ' + String(p.i).padStart(4) + ': ' + String(p.nodes).padStart(6) + ' DOM nodes, heap ' + mb(p.heap)));
  const failures = [];
  const nodeGrowth = last.nodes - first.nodes, heapGrowth = last.heap - first.heap;
  // allow a little warm-up growth (caches), but not growth that tracks the iteration count
  if (nodeGrowth > Math.max(150, first.nodes * 0.08)) failures.push('DOM nodes grew by ' + nodeGrowth + ' between iteration ' + first.i + ' and ' + last.i + ' (leaking elements)');
  if (heapGrowth > 20 * 1048576) failures.push('JS heap grew by ' + mb(heapGrowth) + ' between iteration ' + first.i + ' and ' + last.i + ' (leak)');
  errors.slice(0, 5).forEach((e) => failures.push('console error: ' + e));
  failures.forEach((f) => console.log('FAIL ' + f));
  console.log(failures.length ? '\nSOAK TEST FAILED' : '\nSOAK TEST PASSED (' + ITER + ' battles + screen tours)');
  try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch { /* best effort */ }
  app.exit(failures.length ? 1 : 0);
});
