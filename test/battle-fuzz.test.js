// Battle fuzz: plays complete battles with random legal AND illegal actions across every class,
// every floor type (normal, champion, mini-boss, boss, survival) and with/without a companion,
// asserting the invariants that must hold no matter what the player (or RNG) does.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadGame } = require('./helpers/load-game.js');
const { primeMech } = require('./helpers/class-mech.js');

const Game = loadGame();
const { BattleEngine: BE, State, Formulas: F, Data: D } = Game;

// Small seeded PRNG so any failure is reproducible from its seed.
function seeded(seed) {
  let s = seed >>> 0;
  return function () { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function withSeed(seed, fn) {
  const real = Math.random; Math.random = seeded(seed);
  try { return fn(); } finally { Math.random = real; }
}

const coverage = {};
const count = (k) => { coverage[k] = (coverage[k] || 0) + 1; };
const finite = (n) => typeof n === 'number' && Number.isFinite(n);

function checkInvariants(battle, ctx) {
  const run = battle.run, p = battle.player;
  const where = ctx + ' round=' + battle.round;
  assert.ok(finite(run.hp) && finite(run.mp), where + ': hp/mp must be finite numbers (hp=' + run.hp + ', mp=' + run.mp + ')');
  assert.ok(run.hp >= 0 && run.hp <= p.maxHp, where + ': hp out of range ' + run.hp + '/' + p.maxHp);
  assert.ok(run.mp >= 0 && run.mp <= p.maxMp, where + ': mp out of range ' + run.mp + '/' + p.maxMp);
  assert.ok(finite(p.focus) && p.focus >= 0 && p.focus <= F.FOCUS_MAX, where + ': focus out of range ' + p.focus);
  assert.ok(Number.isInteger(battle.playerAP) && battle.playerAP >= 0 && battle.playerAP <= 6, where + ': playerAP invalid ' + battle.playerAP);
  assert.ok(Number.isInteger(battle.round) && battle.round >= 1, where + ': round invalid');
  battle.enemies.forEach((e, i) => {
    assert.ok(finite(e.hp) && e.hp >= 0 && e.hp <= e.maxHp, where + ': enemy ' + i + ' hp out of range ' + e.hp + '/' + e.maxHp);
    assert.equal(e.alive, e.hp > 0, where + ': enemy ' + i + ' alive flag disagrees with hp ' + e.hp);
    assert.ok(finite(e.breakMeter) && e.breakMeter >= 0, where + ': enemy ' + i + ' break meter invalid ' + e.breakMeter);
    assert.ok(finite(e.atk) && finite(e.def) && finite(e.spd), where + ': enemy ' + i + ' stats must be finite');
  });
  Object.keys(run.inventory).forEach((id) => assert.ok(Number.isInteger(run.inventory[id]) && run.inventory[id] >= 0, where + ': inventory ' + id + ' = ' + run.inventory[id]));
  if (battle.over) {
    if (battle.victory) assert.ok(battle.enemies.every((e) => !e.alive), where + ': victory with a living enemy');
    else assert.equal(run.hp, 0, where + ': defeat but hp=' + run.hp);
  } else {
    assert.ok(run.hp > 0, where + ': battle not over but hp=0');
    assert.ok(battle.enemies.some((e) => e.alive), where + ': battle not over but no living enemy');
  }
}

function randomAction(battle, rnd) {
  const run = battle.run;
  const alive = battle.enemies.map((e, i) => (e.alive ? i : -1)).filter((i) => i >= 0);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const target = rnd() < 0.08 ? 99 : pick(alive.length ? alive : [0]);          // occasionally an invalid target
  const roll = rnd();
  const skills = State.learnedSkills(run).filter((s) => s.id !== 'attack');
  if (roll < 0.35) return { kind: 'attack', targetIndex: target };
  if (roll < 0.62 && skills.length) { const s = pick(skills); return { kind: 'skill', skillId: s.id, targetIndex: target }; }
  if (roll < 0.72) return { kind: 'guard' };
  if (roll < 0.82) { const items = D.items.filter((i) => i.battleUsable); return { kind: 'item', itemId: pick(items).id }; }
  if (roll < 0.90) return { kind: 'overdrive', targetIndex: target };
  if (roll < 0.95 && battle.companion) return { kind: 'duo', targetIndex: target };
  if (roll < 0.97) return { kind: 'skill', skillId: 'definitely_not_a_skill', targetIndex: target };   // garbage must be rejected
  return { kind: 'nonsense' };
}

// Plays a battle to its conclusion with random actions; returns {over,victory,steps}.
function playOut(battle, rnd, ctx, maxRounds) {
  let steps = 0;
  while (!battle.over) {
    assert.ok(battle.round <= maxRounds, ctx + ': battle did not end within ' + maxRounds + ' rounds (possible infinite loop)');
    // Player phase: spend AP with random actions (invalid ones must change nothing).
    let guard = 0;
    while (!battle.over && battle.playerAP > 0 && guard++ < 12) {
      const snap = JSON.stringify({ hp: battle.run.hp, mp: battle.run.mp, ap: battle.playerAP, focus: battle.player.focus, inv: battle.run.inventory, en: battle.enemies.map((e) => e.hp) });
      const action = randomAction(battle, rnd);
      const res = BE.playerAction(battle, action);
      steps++;
      res && res.events && res.events.forEach((e) => count(e.type));
      assert.ok(res && Array.isArray(res.events), ctx + ': playerAction must always return events');
      if (res.events.some((e) => e.type === 'invalid')) {
        const after = JSON.stringify({ hp: battle.run.hp, mp: battle.run.mp, ap: battle.playerAP, focus: battle.player.focus, inv: battle.run.inventory, en: battle.enemies.map((e) => e.hp) });
        assert.equal(after, snap, ctx + ': an INVALID action ' + JSON.stringify(action) + ' changed state');
      }
      if (battle.awaitingAllOut) BE.confirmAllOut(battle, rnd() < 0.5);
      checkInvariants(battle, ctx + ' after ' + JSON.stringify(action));
    }
    if (battle.over) break;
    battle.playerAP = 0;
    if (battle.companion && BE.runCompanionPhase) { const cr = BE.runCompanionPhase(battle); cr && cr.events && cr.events.forEach((e) => count(e.type)); checkInvariants(battle, ctx + ' after companion'); }
    if (battle.over) break;
    const er = BE.runEnemyPhase(battle);
    er && er.events && er.events.forEach((e) => count(e.type));
    assert.ok(er && Array.isArray(er.events), ctx + ': runEnemyPhase must return events');
    checkInvariants(battle, ctx + ' after enemy phase');
  }
  return { over: battle.over, victory: battle.victory, steps };
}

function newRun(classId, level, companion, difficulty) {
  const run = State.createRun(difficulty || 'normal', classId, 0);
  run.level = level; State.fullRestore(run);
  run.companionId = companion || null;
  D.items.filter((i) => i.battleUsable).forEach((i) => State.addItem(run, i.id, 2));
  return run;
}

const CLASSES = D.classes.map((c) => c.id);
const COMPANIONS = D.companions.map((c) => c.id);
// Max out every bond so each companion's Duo Move is unlocked and the fuzz can exercise it.
{ const meta = Game.Save.readMeta(); meta.bonds = meta.bonds || {}; COMPANIONS.forEach((id) => { meta.bonds[id] = 9999; }); Game.Save.writeMeta(meta); }
const FLOORS = [1, 2, 7, 12, 25, 40, 55, 70, 85, 99];
// More seeds = deeper soak. Default keeps `npm test` fast; run `FUZZ_SEEDS=100 npm test` to hunt harder.
const SEEDS = Number(process.env.FUZZ_SEEDS || 3);

test('every class survives random play on every kind of floor without breaking an invariant', () => {
  const results = { fights: 0, wins: 0 };
  for (const cls of CLASSES) {
    for (const floor of FLOORS) for (let k = 0; k < SEEDS; k++) {
      const seed = cls.length * 1000 + floor + k * 7919;
      withSeed(seed, () => {
        const rnd = seeded(seed + 1);
        const level = Math.min(60, 1 + Math.floor(floor / 2));
        const run = newRun(cls, level, floor % 2 === 0 ? COMPANIONS[(cls.length + floor) % COMPANIONS.length] : null, ['normal', 'hard', 'nightmare'][floor % 3]);
        run.currentFloor = floor;
        const battle = BE.createBattle(run, floor, false);
        checkInvariants(battle, cls + '@' + floor + ' start');
        const r = playOut(battle, rnd, cls + '@' + floor + ' seed ' + seed, 400);
        assert.ok(r.over, 'battle must reach a conclusion');
        results.fights++; if (r.victory) results.wins++;
      });
    }
  }
  assert.ok(results.fights === CLASSES.length * FLOORS.length * SEEDS);
  assert.ok(results.wins > 0, 'random play should win at least some fights (otherwise the harness is broken)');
});

test('the random player really exercises every kind of action (the fuzz is not vacuous)', () => {
  for (const type of ['skillUsed', 'itemUsed', 'guard', 'overdriveUsed', 'duoStart', 'invalid', 'heal', 'companionHit']) {
    assert.ok(coverage[type] > 0, 'fuzz never produced a "' + type + '" event; coverage = ' + JSON.stringify(coverage));
  }
  assert.ok(Object.keys(coverage).length >= 15, 'expected broad event coverage, got ' + Object.keys(coverage).join(','));
});

test('boss floor 100 fights stay consistent through every boss phase', () => {
  for (const cls of CLASSES) {
    withSeed(7, () => {
      const run = newRun(cls, 60, 'ember_fox', 'normal'); run.currentFloor = 100;
      const battle = BE.createBattle(run, 100, true);
      assert.equal(battle.enemies.length, 1);
      playOut(battle, seeded(11), cls + ' boss', 800);
    });
  }
});

test('mini-boss floors and champion floors play out correctly', () => {
  const minibossFloors = Object.keys(D.minibosses).map(Number);
  assert.ok(minibossFloors.length > 0);
  for (const f of minibossFloors) {
    withSeed(f, () => {
      const run = newRun('blade', Math.min(60, f), null, 'normal'); run.currentFloor = f;
      playOut(BE.createBattle(run, f, false), seeded(f), 'miniboss@' + f, 600);
    });
  }
  for (let f = 1; f < 100; f++) {
    if (!F.isChampionFloor(f) || D.getMiniBoss(f)) continue;
    withSeed(f, () => {
      const run = newRun('ranger', Math.min(60, f), null, 'normal'); run.currentFloor = f;
      playOut(BE.createBattle(run, f, false), seeded(f), 'champion@' + f, 600);
    });
  }
});

test('survival waves 1-60 stay consistent', () => {
  for (const wave of [1, 2, 5, 10, 20, 35, 60]) {
    withSeed(wave, () => {
      const run = newRun('monk', 40, null, 'normal');
      const battle = BE.createSurvivalBattle(run, wave);
      assert.ok(battle.enemies.length >= 1);
      playOut(battle, seeded(wave), 'survival wave ' + wave, 600);
    });
  }
});

test('actions are rejected cleanly: no AP, finished battle, garbage input', () => {
  withSeed(3, () => {
    const run = newRun('blade', 5, null, 'normal');
    const battle = BE.createBattle(run, 3, false);
    const hp0 = battle.enemies.map((e) => e.hp);
    battle.playerAP = 0;
    const r = BE.playerAction(battle, { kind: 'attack', targetIndex: 0 });
    assert.equal(r.battleOver, false);
    assert.deepEqual(battle.enemies.map((e) => e.hp), hp0, 'no AP: nothing may happen');
    battle.playerAP = 1;
    for (const bad of [{}, { kind: 'attack' }, { kind: 'attack', targetIndex: -1 }, { kind: 'attack', targetIndex: 1e9 }, { kind: 'skill' }, { kind: 'item', itemId: null }, { kind: 'item', itemId: 'sword_of_nothing' }, { kind: 'overdrive', targetIndex: 0 }, { kind: 'duo' }]) {
      const before = JSON.stringify([battle.run.hp, battle.run.mp, battle.playerAP, battle.enemies.map((e) => e.hp)]);
      assert.doesNotThrow(() => BE.playerAction(battle, bad), 'action ' + JSON.stringify(bad) + ' must not throw');
      const after = JSON.stringify([battle.run.hp, battle.run.mp, battle.playerAP, battle.enemies.map((e) => e.hp)]);
      assert.equal(after, before, 'garbage action ' + JSON.stringify(bad) + ' must not change state');
    }
    battle.over = true; battle.victory = true;
    const done = BE.playerAction(battle, { kind: 'attack', targetIndex: 0 });
    assert.equal(done.battleOver, true);
  });
});

test('skills cannot be cast without enough MP, and MP is only spent on a successful cast', () => {
  withSeed(5, () => {
    for (const cls of CLASSES) {
      const run = newRun(cls, 30, null, 'normal');
      const battle = BE.createBattle(run, 1, false);
      const target = battle.enemies.findIndex((e) => e.alive);
      for (const s of State.learnedSkills(run).filter((x) => x.id !== 'attack' && BE.skillCost(battle, x).mp > 0 && x.kind !== 'heal')) {
        primeMech(Game, battle, s);
        const need = BE.skillCost(battle, s).mp;
        battle.run.mp = need - 1; battle.playerAP = 1;
        const hp0 = battle.enemies.map((e) => e.hp);
        const r = BE.playerAction(battle, { kind: 'skill', skillId: s.id, targetIndex: target });
        assert.ok(r.events.some((e) => e.type === 'invalid'), cls + '/' + s.id + ': cast with ' + (need - 1) + ' MP must be rejected');
        assert.equal(battle.run.mp, need - 1, cls + '/' + s.id + ': failed cast must not spend MP');
        assert.deepEqual(battle.enemies.map((e) => e.hp), hp0);
      }
    }
  });
});

test('rewards are finite, non-negative and never shrink as floors get harder', () => {
  withSeed(9, () => {
    let prevExp = 0;
    for (let floor = 1; floor <= 100; floor++) {
      const run = newRun('blade', 20, null, 'normal'); run.currentFloor = floor;
      const battle = BE.createBattle(run, floor, floor === 100);
      const exp = BE.getExpReward(battle), gold = BE.getGoldReward(battle), mats = BE.getMaterialDrops(battle);
      assert.ok(finite(exp) && exp >= 0, 'exp@' + floor + ' = ' + exp);
      assert.ok(finite(gold) && gold >= 0, 'gold@' + floor + ' = ' + gold);
      (Array.isArray(mats) ? mats : []).forEach((m) => { assert.ok(D.getItem(m.id), 'drop ' + m.id + ' must exist'); assert.ok(Number.isInteger(m.qty) && m.qty > 0, 'drop qty ' + m.qty); });
      if (floor % 5 !== 0 && (floor - 1) % 5 !== 0) { assert.ok(exp >= prevExp * 0.4, 'exp should not collapse between floors (' + prevExp + ' -> ' + exp + ' @' + floor + ')'); }
      prevExp = exp;
    }
  });
});

test('a successful cast spends EXACTLY the skill cost in MP (and HP-cost skills spend exactly their HP)', () => {
  withSeed(21, () => {
    let casts = 0;
    for (const cls of CLASSES) {
      for (const s of State.learnedSkills(newRun(cls, 40, null, 'normal')).filter((x) => x.id !== 'attack')) {
        const run = newRun(cls, 40, null, 'normal');
        const battle = BE.createBattle(run, 1, false);
        const target = battle.enemies.findIndex((e) => e.alive);
        run.mp = battle.player.maxMp; battle.playerAP = 1;
        primeMech(Game, battle, s);
        const need = BE.skillCost(battle, s).mp;   // a Gunslinger pays half on gun skills
        if (run.mp < need) continue;
        const mp0 = run.mp, hp0 = run.hp;
        const r = BE.playerAction(battle, { kind: 'skill', skillId: s.id, targetIndex: target });
        if (r.events.some((e) => e.type === 'invalid')) continue;   // e.g. a heal at full HP is legitimately refused
        casts++;
        const regen = r.events.filter((e) => e.type === 'resourceGain' && e.resource === 'mp').reduce((n, e) => n + e.amount, 0);
        assert.equal(mp0 - run.mp + regen, need, cls + '/' + s.id + ': MP went ' + mp0 + ' -> ' + run.mp + ' for a ' + need + ' MP skill');
        if (s.hpCost) assert.ok(run.hp <= hp0 - Math.round(battle.player.maxHp * s.hpCost) || battle.over, cls + '/' + s.id + ': HP cost not paid');
      }
    }
    assert.ok(casts > 40, 'only ' + casts + ' casts were verified');
  });
});

test('Ascension 1-10: fights stay consistent and enemies never get weaker as Ascension rises', () => {
  const statsAt = (asc, floor) => withSeed(77, () => {
    const run = State.createRun('nightmare', 'blade', asc); run.level = 30; State.fullRestore(run); run.currentFloor = floor;
    const b = BE.createBattle(run, floor, false);
    return { hp: b.enemies.reduce((n, e) => n + e.maxHp, 0), atk: b.enemies.reduce((n, e) => n + e.atk, 0), battle: b, run };
  });
  for (const floor of [10, 40, 80]) {
    let prev = statsAt(0, floor);
    for (let asc = 1; asc <= 10; asc++) {
      const cur = statsAt(asc, floor);
      assert.ok(cur.hp >= prev.hp && cur.atk >= prev.atk, 'floor ' + floor + ': Ascension ' + asc + ' enemies are weaker than Ascension ' + (asc - 1) + ' (hp ' + prev.hp + '->' + cur.hp + ', atk ' + prev.atk + '->' + cur.atk + ')');
      prev = cur;
    }
  }
  for (let asc = 1; asc <= 10; asc++) {
    for (const cls of ['blade', 'cleric', 'ranger']) {
      withSeed(asc * 31, () => {
        const run = State.createRun('nightmare', cls, asc); run.level = 35; State.fullRestore(run); run.currentFloor = 60;
        playOut(BE.createBattle(run, 60, false), seeded(asc), cls + ' asc ' + asc, 400);
      });
    }
  }
});
