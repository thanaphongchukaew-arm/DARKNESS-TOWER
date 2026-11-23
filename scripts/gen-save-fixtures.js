// Writes real save files (JSON) produced by the code in the CURRENT working directory. Run it inside a
// checkout of an older commit to capture what that version really wrote, then keep the output in
// test/fixtures/saves/ so every later version is tested against it (test/save-fixtures.test.js).
//
//   node /path/to/scripts/gen-save-fixtures.js <label> <outDir>
//
// Uses the checkout's OWN test/helpers/load-game.js, so the saves reflect that version's fields.
const fs = require('node:fs');
const path = require('node:path');

const label = process.argv[2] || 'unknown';
const outDir = path.resolve(process.argv[3] || 'fixtures');
// Newer commits ship test/helpers/load-game.js; the earliest ones do not, so fall back to loading the
// non-UI game files in the order index.html lists them.
function fallbackLoader() {
  const vm = require('node:vm');
  const html = fs.readFileSync('index.html', 'utf8');
  const order = [...html.matchAll(/<script src="(js\/[^"]+)"/g)].map((m) => m[1]).filter((f) => /(i18n|data-|formulas|save|^js\/state|systems|minigame|story-system|micro)/.test(f) && !/ui-|art/.test(f));
  return function loadGame(options = {}) {
    const store = new Map();
    const sandbox = { window: {}, localStorage: { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) }, document: { documentElement: {} }, console, Math: Object.assign(Object.create(Math), options.random ? { random: options.random } : {}) };
    vm.createContext(sandbox);
    for (const f of order) { try { vm.runInContext(fs.readFileSync(f, 'utf8'), sandbox, { filename: f }); } catch (e) { console.log('  (could not load ' + f + ': ' + String(e.message).slice(0, 60) + ')'); } }
    return sandbox.window.Game;
  };
}
const helper = path.resolve('test/helpers/load-game.js');
const loadGame = fs.existsSync(helper) ? require(helper).loadGame : fallbackLoader();
fs.mkdirSync(outDir, { recursive: true });

function seeded(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

const wanted = [['blade', 'normal', 8], ['elementalist', 'hard', 31], ['cleric', 'easy', 57]];
for (const [cls, diff, floor] of wanted) {
  const G = loadGame({ random: seeded(floor) });
  const S = G.State, D = G.Data;
  if (!D.getClass || !D.getClass(cls)) { console.log('skip ' + cls + ' (not in ' + label + ')'); continue; }
  const run = S.createRun(diff, cls, 0);
  run.level = Math.max(1, Math.min(60, Math.round(floor * 0.9)));
  run.currentFloor = floor;
  run.gold = 120 + floor * 20;
  S.fullRestore(run);
  const wear = { weapon: D.items.find((i) => i.kind === 'weapon' && i.tier <= 3 && !i.craftOnly), armor: D.items.find((i) => i.kind === 'armor' && i.tier <= 3 && !i.craftOnly) };
  if (wear.weapon) run.equipment.weapon = wear.weapon.id;
  if (wear.armor) run.equipment.armor = wear.armor.id;
  D.items.filter((i) => i.kind === 'material' && i.tier <= 2).slice(0, 4).forEach((i) => S.addItem(run, i.id, 3));
  if (D.blessings && D.blessings.length) run.blessings = [D.blessings[0].id];
  const file = path.join(outDir, label + '-' + cls + '.json');
  fs.writeFileSync(file, JSON.stringify({ label, classId: cls, run }, null, 1));
  console.log('wrote ' + path.relative(process.cwd(), file) + ' (' + Object.keys(run).length + ' fields)');
}
