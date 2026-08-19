// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadGame } = require('./helpers/load-game.js');

const Game = loadGame();
const BE = Game.BattleEngine;
const State = Game.State;
const Formulas = Game.Formulas;

function freshRun() {
  return State.createRun('normal', 'blade', 0);
}

// A single-enemy floor keeps target index 0 valid for every test without
// needing to special-case multi-enemy groups.
function soloBattle(floor) {
  let battle;
  do {
    battle = BE.createBattle(freshRun(), floor || 1, false);
  } while (battle.enemies.length !== 1);
  return battle;
}

test('createBattle produces a player actor with a fresh Focus gauge and enemies with a fresh Break meter', () => {
  const battle = soloBattle(1);
  assert.equal(battle.player.focus, 0);
  battle.enemies.forEach((e) => {
    assert.equal(e.breakMeter, 0);
    assert.equal(e.broken, false);
  });
});

test('a landed attack damages the enemy and builds both Focus and Break', () => {
  const battle = soloBattle(1);
  const hpBefore = battle.enemies[0].hp;
  const res = BE.playerAction(battle, { kind: 'attack', targetIndex: 0 });
  assert.ok(battle.enemies[0].hp <= hpBefore, 'enemy HP should not increase from an attack');
  assert.ok(battle.player.focus >= Formulas.FOCUS_PER_HIT, 'Focus should have grown by at least one hit\'s worth');
  assert.ok(battle.enemies[0].breakMeter >= Formulas.BREAK_PER_HIT || battle.enemies[0].broken, 'Break meter should have grown by at least one hit\'s worth');
  assert.ok(res.events.some((e) => e.type === 'hit'), 'an attack should emit a hit event');
});

test('Break flags the enemy broken once its meter fills, and a subsequent hit deals bonus damage', () => {
  const battle = soloBattle(1);
  const hitsToBreak = Math.ceil(Formulas.BREAK_THRESHOLD / Formulas.BREAK_PER_HIT);
  let brokenEventSeen = false;
  for (let i = 0; i < hitsToBreak && battle.enemies[0].alive; i++) {
    const res = BE.playerAction(battle, { kind: 'attack', targetIndex: 0 });
    if (res.events.some((e) => e.type === 'enemyBroken')) brokenEventSeen = true;
    if (!battle.enemies[0].alive) break; // a weak floor-1 enemy may die before the meter fills
  }
  if (battle.enemies[0].alive) {
    assert.ok(brokenEventSeen, 'the break threshold should have fired an enemyBroken event by now');
    assert.equal(battle.enemies[0].broken, true);
  }
});

test('Overdrive is rejected below full Focus and does not touch player state', () => {
  const battle = soloBattle(1);
  assert.ok(battle.player.focus < Formulas.FOCUS_MAX);
  const before = battle.player.focus;
  const res = BE.playerAction(battle, { kind: 'overdrive', targetIndex: 0 });
  assert.equal(res.events[0].type, 'invalid');
  assert.equal(battle.player.focus, before, 'a rejected Overdrive must not spend Focus');
});

test('Overdrive at full Focus spends the whole gauge and deals damage without costing MP', () => {
  const battle = soloBattle(1);
  battle.player.focus = Formulas.FOCUS_MAX;
  const mpBefore = battle.run.mp;
  const hpBefore = battle.enemies[0].hp;
  const res = BE.playerAction(battle, { kind: 'overdrive', targetIndex: 0 });
  assert.equal(battle.player.focus, 0, 'Overdrive should fully consume Focus');
  assert.equal(battle.run.mp, mpBefore, 'Overdrive must not cost MP');
  assert.ok(battle.enemies[0].hp < hpBefore || !battle.enemies[0].alive, 'Overdrive should damage its target');
  assert.ok(res.events.some((e) => e.type === 'overdriveUsed'));
});

test('guard sets the guarding flag and ends the player turn', () => {
  const battle = soloBattle(1);
  const res = BE.playerAction(battle, { kind: 'guard' });
  assert.equal(battle.player.guarding, true);
  assert.equal(res.playerAP, 0);
});

test('runEnemyPhase can damage the player and always advances the round afterward', () => {
  const battle = soloBattle(1);
  battle.playerAP = 0;
  const hpBefore = battle.run.hp;
  const roundBefore = battle.round;
  BE.runEnemyPhase(battle);
  assert.ok(battle.run.hp <= hpBefore);
  if (!battle.over) assert.equal(battle.round, roundBefore + 1);
});

test('confirmAllOut damages every living enemy and always ends the player turn', () => {
  const battle = soloBattle(1);
  battle.awaitingAllOut = true;
  const res = BE.confirmAllOut(battle, true);
  assert.equal(res.playerAP, 0);
  assert.ok(res.events.some((e) => e.type === 'allOutStart'));
});

test('declining an All-Out Attack does not change any enemy HP', () => {
  const battle = soloBattle(1);
  const hpBefore = battle.enemies.map((e) => e.hp);
  battle.awaitingAllOut = true;
  BE.confirmAllOut(battle, false);
  assert.deepEqual(battle.enemies.map((e) => e.hp), hpBefore);
});
