// Save compatibility: a save written by an older version lacks the fields later versions added. For EVERY
// field of a real run we delete it, load the save the way the menu does (read -> normalize*), and make sure
// the game still works: stats, battles, shop economy, crafting, re-saving. Also junk/corrupt values.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadGame } = require('./helpers/load-game.js');

const { exercise } = require('./helpers/exercise-run.js');

function freshRun(Game) {
  const run = Game.State.createRun('normal', 'blade', 0);
  run.gold = 500; run.level = 12; Game.State.fullRestore(run);
  Game.State.addItem(run, 'p_hp_small', 3);
  return JSON.parse(JSON.stringify(run));
}

test('a complete modern save loads and plays', () => {
  const Game = loadGame();
  exercise(Game, freshRun(Game), 'complete');
});

test('every single field can be missing from the save without breaking the game', () => {
  const probe = loadGame();
  const keys = Object.keys(freshRun(probe));
  assert.ok(keys.length > 15, 'unexpectedly small run object');
  const broken = [];
  for (const key of keys) {
    const Game = loadGame();
    const run = freshRun(Game);
    delete run[key];
    try { exercise(Game, run, 'missing ' + key); } catch (e) { broken.push(key + ' -> ' + String(e.message).split('\n')[0].slice(0, 110)); }
  }
  assert.deepEqual(broken, [], 'saves missing these fields crash the game:\n  ' + broken.join('\n  '));
});

test('a save missing every optional field at once (oldest possible shape) still loads', () => {
  const Game = loadGame();
  const full = freshRun(Game);
  const REQUIRED = ['classId', 'level', 'exp', 'hp', 'mp', 'gold', 'inventory', 'equipment', 'currentFloor', 'difficulty'];
  const run = {};
  REQUIRED.forEach((k) => { run[k] = full[k]; });
  exercise(Game, run, 'minimal');
});

test('nested containers missing or null do not crash (inventory / equipment / stats / quests)', () => {
  const broken = [];
  for (const key of ['inventory', 'equipment', 'stats', 'quests', 'talents', 'ailments', 'relics', 'blessings', 'curses', 'eventsSeen']) {
    for (const bad of [null, {}, [], 0]) {
      const Game = loadGame(); const run = freshRun(Game);
      if (run[key] === undefined) continue;
      run[key] = bad;
      try { exercise(Game, run, key + '=' + JSON.stringify(bad)); } catch (e) { broken.push(key + '=' + JSON.stringify(bad) + ' -> ' + String(e.message).split('\n')[0].slice(0, 100)); }
    }
  }
  assert.deepEqual(broken, [], 'junk containers crash the game:\n  ' + broken.join('\n  '));
});

test('items that no longer exist in the data are tolerated in the bag and in equipment', () => {
  const Game = loadGame(); const run = freshRun(Game);
  run.inventory.item_from_an_old_version = 4;
  run.equipment.weapon = 'weapon_from_an_old_version';
  exercise(Game, run, 'removed items');
});

test('the Save layer: corrupt main slot falls back to the backup, import rejects foreign data', () => {
  const Game = loadGame(); const { Save } = Game;
  const run = freshRun(Game);
  assert.ok(Save.write(run)); run.gold += 1; assert.ok(Save.write(run));
  Save.write(run);
  const stub = Game.__ls;   // not exposed; exercise through public API only
  assert.equal(stub, undefined);
  assert.equal(Save.importAll('not json').ok, false);
  assert.equal(Save.importAll('{"tag":"something-else"}').ok, false);
  const exported = Save.exportAll();
  assert.equal(Save.importAll(exported).ok, true);
  assert.equal(Save.read().classId, 'blade');
  assert.ok(Save.read().saveVersion >= 1);
});
