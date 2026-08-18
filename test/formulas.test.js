const test = require('node:test');
const assert = require('node:assert/strict');
const { loadGame } = require('./helpers/load-game.js');

const Game = loadGame();
const F = Game.Formulas;

test('statAtLevel grows linearly with level', () => {
  assert.equal(F.statAtLevel(10, 2, 1), 10);
  assert.equal(F.statAtLevel(10, 2, 5), 18);
});

test('expToNext is strictly increasing', () => {
  let prev = 0;
  for (let lvl = 1; lvl <= 30; lvl++) {
    const next = F.expToNext(lvl);
    assert.ok(next > prev, `expToNext(${lvl}) should exceed the previous level's requirement`);
    prev = next;
  }
});

test('tierForFloor covers the known-tower boundaries (1-40) and the hidden tower (41-99+)', () => {
  assert.equal(F.tierForFloor(1), 1);
  assert.equal(F.tierForFloor(10), 1);
  assert.equal(F.tierForFloor(11), 2);
  assert.equal(F.tierForFloor(40), 4);
  assert.equal(F.tierForFloor(41), 5);
  assert.equal(F.tierForFloor(44), 5);
  assert.equal(F.tierForFloor(45), 6);
  assert.equal(F.tierForFloor(94), 15);
  assert.equal(F.tierForFloor(95), 16);
  assert.equal(F.tierForFloor(99), 16);
  assert.equal(F.tierForFloor(100), 16);
});

test('itemTierForFloor never exceeds the top item tier and tracks tierForFloor below floor 45', () => {
  assert.equal(F.itemTierForFloor(1), F.tierForFloor(1));
  assert.equal(F.itemTierForFloor(44), Math.min(F.tierForFloor(44), 5));
  assert.equal(F.itemTierForFloor(74), 6);
  assert.equal(F.itemTierForFloor(75), 7);
  assert.equal(F.itemTierForFloor(100), 7);
});

test('enemyStatScale increases with floor and with difficulty', () => {
  const floor1Normal = F.enemyStatScale(1, 'normal');
  const floor50Normal = F.enemyStatScale(50, 'normal');
  assert.ok(floor50Normal > floor1Normal, 'later floors should scale enemies up');
  const floor1Hard = F.enemyStatScale(1, 'hard');
  assert.ok(floor1Hard > floor1Normal, 'hard difficulty should scale enemies up relative to normal');
});

test('scaleStatsBlock leaves luk unscaled but floors every other stat at 1', () => {
  const out = F.scaleStatsBlock({ hp: 10, atk: 2, luk: 5, exp: 20 }, 0.01, 1);
  assert.equal(out.luk, 5, 'luk should not be scaled by the floor/group multiplier');
  assert.equal(out.hp, 1, 'a near-zero scale should still floor at 1, never 0');
  assert.equal(out.atk, 1);
});

test('critChance is clamped to [0.05, 0.4] regardless of luk', () => {
  assert.equal(F.critChance(-100), 0.05);
  assert.equal(F.critChance(0), 0.05);
  assert.equal(F.critChance(1000), 0.4);
});

test('computeDamage: physical/magic damage is mitigated by the matching defense stat', () => {
  const withoutDef = F.computeDamage({ element: 'phys', power: 1, atkStat: 100, magStat: 0, defStat: 0, resStat: 0, isCrit: false });
  const withDef = F.computeDamage({ element: 'phys', power: 1, atkStat: 100, magStat: 0, defStat: 50, resStat: 0, isCrit: false });
  assert.ok(withDef < withoutDef, 'higher DEF should reduce physical damage taken');
});

test('computeDamage: almighty ignores both defense stats and uses the higher of atk/mag', () => {
  const dmg = F.computeDamage({ element: 'almighty', power: 2, atkStat: 10, magStat: 100, defStat: 9999, resStat: 9999, isCrit: false });
  assert.ok(dmg > 0, 'almighty damage should never be zeroed out by defense');
});

test('computeDamage: a crit hits noticeably harder than a non-crit, all else equal', () => {
  // average over several rolls since computeDamage has +/-10% variance
  function avg(isCrit) {
    let total = 0;
    const n = 200;
    for (let i = 0; i < n; i++) {
      total += F.computeDamage({ element: 'phys', power: 1, atkStat: 100, magStat: 0, defStat: 10, resStat: 0, isCrit });
    }
    return total / n;
  }
  assert.ok(avg(true) > avg(false) * 1.3, 'a crit should deal substantially more damage on average');
});

test('computeDamage never returns less than 1', () => {
  const dmg = F.computeDamage({ element: 'phys', power: 0.01, atkStat: 1, magStat: 0, defStat: 9999, resStat: 0, isCrit: false });
  assert.equal(dmg, 1);
});

test('groupScaleFactor shrinks per-enemy power as the group grows, never below the 4+ floor', () => {
  assert.equal(F.groupScaleFactor(1), 1.0);
  assert.ok(F.groupScaleFactor(2) < F.groupScaleFactor(1));
  assert.ok(F.groupScaleFactor(3) < F.groupScaleFactor(2));
  assert.equal(F.groupScaleFactor(4), F.groupScaleFactor(10));
});

test('goldForExp is always at least 1', () => {
  assert.equal(F.goldForExp(0), 1);
  assert.ok(F.goldForExp(100) > F.goldForExp(10));
});

test('sellPrice is always less than shopPrice for the same item', () => {
  const item = { kind: 'consumable', tier: 2 };
  assert.ok(F.sellPrice(item, 20) < F.shopPrice(item));
});

test('Focus/Break constants are internally consistent (see battle-engine.js applyBreak)', () => {
  assert.ok(F.FOCUS_PER_HIT > 0 && F.FOCUS_PER_HIT <= F.FOCUS_MAX);
  assert.ok(F.FOCUS_CRIT_BONUS >= 0);
  assert.ok(F.BREAK_PER_HIT > 0 && F.BREAK_PER_HIT <= F.BREAK_THRESHOLD);
  assert.ok(F.BREAK_DAMAGE_MULT > 1, 'break should always be a damage bonus, never a penalty');
  assert.ok(F.OVERDRIVE_POWER > 0);
});
