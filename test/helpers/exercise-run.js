// Shared by the save tests: loads a run the way the menu does and pokes every core system.
const assert = require('node:assert/strict');

function exercise(Game, run, label) {
  const { State: S, BattleEngine: BE, Data: D, Formulas: F } = Game;
  S.current = run;
  S.normalizeEquipment(run); S.normalizeRunExtras(run);
  assert.ok(Number.isFinite(S.getMaxHp(run)) && S.getMaxHp(run) > 0, label + ': maxHp ' + S.getMaxHp(run));
  assert.ok(Number.isFinite(S.getMaxMp(run)) && S.getMaxMp(run) >= 0, label + ': maxMp ' + S.getMaxMp(run));
  S.learnedSkills(run);
  run.hp = Math.min(run.hp || 1, S.getMaxHp(run)); if (!(run.hp > 0)) run.hp = 1;
  for (const [floor, boss] of [[1, false], [5, false], [37, false], [100, true]]) {
    run.currentFloor = floor;
    const b = BE.createBattle(run, floor, boss);
    BE.playerAction(b, { kind: 'attack', targetIndex: 0 });
    BE.playerAction(b, { kind: 'guard' });
    BE.runEnemyPhase(b);
    BE.getExpReward(b); BE.getGoldReward(b); BE.getMaterialDrops(b);
    assert.ok(Number.isFinite(run.hp) && Number.isFinite(run.mp), label + ': hp/mp not finite after a battle round');
  }
  const item = D.items.find((i) => i.kind === 'material');
  S.addItem(run, item.id, 2);
  assert.ok(S.sellItem(run, item.id, 1) > 0, label + ': could not sell');
  S.spendGold(run, 1);
  S.elixirAvailable(run);
  assert.ok(F.tierForFloor(run.currentFloor) >= 1);
  assert.doesNotThrow(() => JSON.stringify(run), label + ': run not serialisable');
  assert.equal(S.saveNow ? (S.saveNow(), true) : true, true);
}

module.exports = { exercise };
