const test = require('node:test');
const assert = require('node:assert/strict');
const { loadGame } = require('./helpers/load-game');

test('mastery counts each new floor once and settles reloaded runs only once', () => {
  const g = loadGame();
  const m = g.Mastery;
  const run = g.State.createRun('normal', 'samurai');
  run.gold = 123;
  m.recordClear(run, 1);
  m.recordClear(run, 1);
  m.recordClear(run, 2);
  assert.equal(m.profile(g.Save.readMeta()).coins, 0);
  g.State.saveNow();
  assert.equal(m.settle(g.Save.read(), false).xp, 10);
  assert.equal(m.settle(g.Save.read(), false).coins, 4);
  const profile = m.profile(g.Save.readMeta());
  assert.equal(profile.coins, 4);
  assert.equal(m.classRecord(profile, 'samurai').xp, 10);
  assert.equal(m.classRecord(profile, 'blade').xp, 0);
  assert.equal(g.Save.read().gold, 123);
});

test('buying requires class XP and profile coins, and only one purchased perk is equipped', () => {
  const g = loadGame();
  const m = g.Mastery;
  assert.equal(m.selectPerk('samurai', 'samurai_draw'), false);
  const run = g.State.createRun('normal', 'samurai');
  for (let floor = 1; floor <= 20; floor++) m.recordClear(run, floor);
  m.settle(run, false);
  assert.equal(m.selectPerk('samurai', 'samurai_draw'), false);
  g.State.clearRun();
  assert.equal(m.selectPerk('blade', 'samurai_draw'), false);
  const before = m.profile(g.Save.readMeta());
  assert.equal(m.selectPerk('samurai', 'samurai_draw'), true);
  assert.equal(m.equipped('samurai'), 'samurai_draw');
  assert.equal(m.selectPerk('samurai', 'samurai_guard'), true);
  assert.equal(m.equipped('samurai'), 'samurai_guard');
  assert.equal(m.selectPerk('samurai', 'samurai_draw'), true);
  assert.equal(m.equipped('samurai'), 'samurai_draw');
  const after = m.profile(g.Save.readMeta());
  assert.equal(after.coins, before.coins - 35);
  assert.equal(m.classRecord(after, 'samurai').xp, m.classRecord(before, 'samurai').xp);
  const nextRun = g.State.createRun('normal', 'samurai');
  assert.equal(nextRun.masteryPerk, 'samurai_draw');
  assert.equal(nextRun.gold, 0);
});

test('Samurai perks change actual combat and the guard restore occurs only once', () => {
  const g = loadGame({ random: () => 0.99 });
  function act(battle, action) {
    battle.playerAP = 1;
    return g.BattleEngine.playerAction(battle, action);
  }
  function createBattle() {
    const run = g.State.createRun('normal', 'samurai');
    const battle = g.BattleEngine.createBattle(run, 1, false);
    battle.enemies[0].hp = battle.enemies[0].maxHp = 360;
    return battle;
  }
  function draw(perk) {
    const battle = createBattle();
    battle.run.masteryPerk = perk;
    act(battle, { kind: 'skill', skillId: 'samurai_sheathe' });
    act(battle, { kind: 'attack', targetIndex: 0 });
    return battle.enemies[0].breakMeter;
  }
  assert.equal(draw('samurai_draw'), Math.round(draw(null) * 1.25));

  const battle = createBattle();
  battle.run.masteryPerk = 'samurai_guard';
  battle.run.mp = 1;
  act(battle, { kind: 'guard' });
  assert.equal(battle.run.mp, 1);
  act(battle, { kind: 'skill', skillId: 'samurai_sheathe' });
  act(battle, { kind: 'guard' });
  assert.equal(battle.run.mp, 5);
  act(battle, { kind: 'guard' });
  assert.equal(battle.run.mp, 5);
});
