// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Attributes (js/attributes.js): STR/DEX/INT/END/LUK feed the combat stats, levels grant free
// points, and spending them the class's way reproduces the class's tuned stat curve.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadGame } = require('./helpers/load-game');

function runAt(g, classId, level) {
  const run = g.State.createRun('normal', classId);
  run.level = level;
  return run;
}

test('every class has attribute weights for all five attributes', () => {
  const g = loadGame();
  for (const cls of g.Data.classes) {
    assert.ok(cls.attr, cls.id + ' has no attr weights');
    for (const k of g.Attributes.KEYS) assert.ok(Number.isFinite(cls.attr[k]) && cls.attr[k] >= 0, cls.id + '.' + k);
  }
});

test('spending free points the class way reproduces the class stat curve', () => {
  const g = loadGame(), A = g.Attributes;
  for (const cls of g.Data.classes) {
    for (const lv of [1, 15, 40, 75]) {
      const run = runAt(g, cls.id, lv);
      A.autoAllocate(run);
      const now = g.State.getTotalStats(run), old = g.Formulas.playerStatsAtLevel(cls, lv);
      for (const k of Object.keys(old)) {
        assert.ok(Math.abs(now[k] - old[k]) <= Math.max(2, old[k] * 0.05), cls.id + ' L' + lv + ' ' + k + ': ' + old[k] + ' -> ' + now[k]);
      }
    }
  }
});

test('each level grants free points; spending is capped and permanent', () => {
  const g = loadGame(), A = g.Attributes, S = g.State;
  const run = runAt(g, 'blade', 11);
  assert.equal(A.unspent(run), 30);
  const atk0 = S.getTotalStats(run).atk, str0 = S.getAttributes(run).str;
  assert.ok(S.spendAttribute(run, 'str', 10));
  assert.equal(S.getAttributes(run).str, str0 + 10);
  assert.equal(S.getTotalStats(run).atk, atk0 + 10, 'STR +1 = ATK +1');
  assert.equal(A.unspent(run), 20);
  assert.equal(S.spendAttribute(run, 'str', 21), false, 'cannot spend more than is left');
  assert.equal(S.spendAttribute(run, 'nope', 1), false);
  assert.equal(A.reset, undefined, 'there is no reset');
});

test('END raises max HP; INT raises MAG and MP', () => {
  const g = loadGame(), S = g.State;
  const run = runAt(g, 'cleric', 21);
  const before = S.getTotalStats(run);
  S.spendAttribute(run, 'end', 10); S.spendAttribute(run, 'int', 10);
  const after = S.getTotalStats(run);
  assert.ok(after.hp > before.hp && after.def > before.def);
  assert.equal(after.mag, before.mag + 10);
  assert.ok(after.mp > before.mp);
});

test('accessories give attributes, and gear LUK is the LUK attribute', () => {
  const g = loadGame(), S = g.State;
  const ring = g.Data.items.find((it) => it.kind === 'accessory' && it.statBonus && it.statBonus.str);
  assert.ok(ring, 'an accessory gives STR');
  for (const it of g.Data.items) if (it.statBonus) assert.equal(it.statBonus.luk, undefined, it.id + ' still uses the old LUK stat');
  const run = runAt(g, 'blade', 10);
  const before = S.getTotalStats(run), strBefore = S.getAttributes(run).str;
  run.equipment.accessory1 = ring.id;
  assert.equal(S.getAttributes(run).str, strBefore + ring.statBonus.str);
  assert.equal(S.getTotalStats(run).atk, before.atk + ring.statBonus.str);
});

test('a save from before attributes spends its earned points the class way on load', () => {
  const g = loadGame(), S = g.State, A = g.Attributes;
  const run = runAt(g, 'ranger', 30);
  delete run.attr;
  S.normalizeRunExtras(run);
  assert.equal(A.unspent(run), 0);
  const old = g.Formulas.playerStatsAtLevel(g.Data.getClass('ranger'), 30), now = S.getTotalStats(run);
  assert.ok(Math.abs(now.atk - old.atk) <= 2 && Math.abs(now.hp - old.hp) <= Math.max(2, old.hp * 0.05));
  // A current save keeps its unspent points.
  const fresh = runAt(g, 'ranger', 30);
  S.normalizeRunExtras(fresh);
  assert.equal(A.unspent(fresh), 87);
});

test('auto-assign is deterministic (never touches Math.random)', () => {
  const g = loadGame({ random: () => { throw new Error('Math.random called'); } });
  const run = runAt(g, 'samurai', 40);
  g.Attributes.autoAllocate(run);
  assert.equal(g.Attributes.unspent(run), 0);
});
