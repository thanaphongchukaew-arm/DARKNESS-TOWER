// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Class mechanics beyond the pilots (js/class-mech-classes.js): every class with a mechanic
// plays a whole fight through a JSON save/resume, and each rule does what its text says.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadGame } = require('./helpers/load-game');

function setup(classId, opts) {
  opts = opts || {};
  const g = loadGame({ random: opts.random || (() => 0.5) });
  const run = g.State.createRun('normal', classId);
  run.level = opts.level || 20; g.Attributes.autoAllocate(run); g.State.fullRestore(run);
  const battle = g.BattleEngine.createBattle(run, opts.floor || 12, false);
  battle.enemies = battle.enemies.slice(0, opts.enemies || 1);
  if (opts.enemies && battle.enemies.length < opts.enemies) {
    while (battle.enemies.length < opts.enemies) { const c = JSON.parse(JSON.stringify(battle.enemies[0])); c.uid = 'x' + battle.enemies.length; battle.enemies.push(c); }
  }
  battle.enemies.forEach((e) => { e.hp = e.maxHp = opts.enemyHp || 100000; });
  battle.playerAP = 1;
  g.ClassMech.ensure(battle);
  return { g, run, battle, BE: g.BattleEngine, CM: g.ClassMech };
}
const act = (f, action) => { f.battle.awaitingAllOut = false; f.battle.playerAP = Math.max(f.battle.playerAP, 1); return f.BE.playerAction(f.battle, action); };
const invalid = (r) => r.events.some((e) => e.type === 'invalid');
const hits = (r) => r.events.filter((e) => e.type === 'hit' && e.sourceSide === 'player');
const skillOf = (f, kind) => f.g.State.learnedSkills(f.run).find((s) => s.kind === kind && s.target === 'singleEnemy' && !f.BE.skillBlockReason(f.battle, s));

test('every class with a mechanic plays a fight through a JSON save/resume without an invalid action', () => {
  const ids = Object.keys(loadGame().ClassMech.DEFS);
  for (const cls of ids) {
    const f = setup(cls, { enemies: 2, enemyHp: 3000, level: 30 });
    let b = f.battle;
    const blocked = (s) => f.BE.skillBlockReason(b, s);
    for (let round = 0; round < 12 && !b.over; round++) {
      if (round === 3) {   // save and resume mid-fight
        const copy = {};
        Object.keys(b).forEach((k) => { if (k !== 'run') copy[k] = b[k]; });
        b = JSON.parse(JSON.stringify(copy)); b.run = f.run; f.battle = b;
      }
      let guard = 0;
      while (b.playerAP > 0 && !b.over && guard++ < 6) {
        if (b.awaitingAllOut) { f.BE.confirmAllOut(b, true); continue; }
        const alive = b.enemies.findIndex((e) => e.alive);
        const action = f.CM.botAction(b, blocked) || (round % 2 && skillOf(f, 'attack') ? { kind: 'skill', skillId: skillOf(f, 'attack').id, targetIndex: alive } : { kind: 'attack', targetIndex: alive });
        if (action.targetIndex == null) action.targetIndex = alive;
        const r = f.BE.playerAction(b, action);
        assert.ok(!invalid(r), cls + ': ' + JSON.stringify(action) + ' was rejected');
      }
      if (!b.over) f.BE.runCompanionPhase(b);
      if (!b.over) f.BE.runEnemyPhase(b);
      f.run.hp = Math.max(f.run.hp, 1);
      assert.ok(Number.isFinite(f.run.hp) && Number.isFinite(f.run.mp), cls + ' vitals');
      assert.doesNotThrow(() => JSON.stringify(b.mech), cls + ' state is plain JSON');
      const gauge = f.CM.gauge(b);
      assert.ok(gauge && gauge.label && gauge.value != null, cls + ' gauge');
    }
  }
});

// ---- batch 1 ----

test('Puppeteer: a strung enemy hits its ally instead of you, and the strings have a cooldown', () => {
  const f = setup('puppeteer', { enemies: 2 });
  const [a, b] = f.battle.enemies;
  const hpB = b.hp, hp0 = f.run.hp;
  assert.ok(!invalid(act(f, { kind: 'skill', skillId: 'puppet_strings', targetIndex: 0 })));
  assert.ok(f.BE.skillBlockReason(f.battle, f.g.Data.getSkill('puppet_strings')), 'cooldown');
  b.atk = b.mag = 1;   // only the strung enemy hurts
  f.battle.playerAP = 0;
  f.BE.runEnemyPhase(f.battle);
  assert.ok(b.hp < hpB, 'the ally took the strung hit');
  assert.ok(f.run.hp >= hp0 - 20, 'the player was spared the strung hit');
  assert.ok(a.alive);
});

test('Storm Caller: lightning hits build Static, Conduct turns it into MP for free once per round, 10 discharges', () => {
  const f = setup('stormCaller', { enemies: 2, random: () => 0.99 });
  const bolt = f.g.Data.getSkill('static_charge');
  act(f, { kind: 'skill', skillId: bolt.id, targetIndex: 0 });
  assert.equal(f.battle.mech.static, 1);
  f.run.mp = 0;
  const r = act(f, { kind: 'skill', skillId: 'storm_conduct' });
  assert.ok(f.run.mp > 0 && f.battle.mech.static === 0);
  assert.equal(r.playerAP, 1, 'first Conduct of the round is free');
  f.battle.mech.static = 9; f.run.mp = 999;
  const hp = f.battle.enemies.map((e) => e.hp);
  act(f, { kind: 'skill', skillId: bolt.id, targetIndex: 0 });
  assert.equal(f.battle.mech.static, 0, 'discharged at 10');
  assert.ok(f.battle.enemies[1].hp < hp[1], 'the discharge hit the other enemy too');
});

test('Tempest Witch: skills raise the tide and high tide turns the next single-target skill into a flood', () => {
  const f = setup('tempestWitch', { enemies: 3, level: 10, random: () => 0.99 });
  const bolt = f.g.Data.getSkill('riptide_bolt');
  f.run.mp = 999;
  for (let i = 0; i < 3; i++) act(f, { kind: 'skill', skillId: bolt.id, targetIndex: 0 });
  assert.equal(f.battle.mech.tide, 3);
  const flood = act(f, { kind: 'skill', skillId: bolt.id, targetIndex: 0 });
  assert.equal(new Set(hits(flood).map((h) => h.targetUid)).size, 3, 'hit every enemy');
  assert.ok(hits(flood).every((h) => h.target === 'allEnemies'));
  assert.equal(f.battle.mech.tide, 0);
  assert.equal(hits(act(f, { kind: 'attack', targetIndex: 0 })).length, 1, 'basic Attack never floods');
});

test('Chronomancer: Rewind restores last round\'s HP and MP, clears ailments, then cools down', () => {
  const f = setup('chronomancer');
  f.BE.runEnemyPhase(Object.assign(f.battle, { playerAP: 0 }));   // rolls into round 2, snapshotting vitals
  f.battle.playerAP = 1;
  const before = { hp: f.battle.mech.cur.hp, mp: f.battle.mech.cur.mp };
  f.run.hp = 5; f.run.mp = 0; f.run.ailments = [{ id: 'poison', turns: 3 }];
  assert.ok(!invalid(act(f, { kind: 'skill', skillId: 'chrono_rewind' })));
  assert.equal(f.run.hp, Math.min(before.hp, f.battle.player.maxHp));
  assert.equal(f.run.mp, Math.min(before.mp, f.battle.player.maxMp));
  assert.equal(f.run.ailments.length, 0);
  assert.ok(f.BE.skillBlockReason(f.battle, f.g.Data.getSkill('chrono_rewind')), 'cooldown');
});

test('Warlock: skill hits stack Hex (more damage taken), Detonate cashes it in; the cap grows at Lv 15', () => {
  const f = setup('warlock', { level: 10, random: () => 0.5 });
  const e = f.battle.enemies[0];
  f.run.mp = 999;
  const first = hits(act(f, { kind: 'skill', skillId: 'hex_bolt', targetIndex: 0 }))[0].amount;
  for (let i = 0; i < 4; i++) act(f, { kind: 'skill', skillId: 'hex_bolt', targetIndex: 0 });
  assert.equal(f.battle.mech.hex[e.uid], 3, 'capped at 3 below Lv 15');
  const later = hits(act(f, { kind: 'skill', skillId: 'hex_bolt', targetIndex: 0 }))[0].amount;
  assert.ok(later > first, 'a hexed enemy takes more');
  const hp = e.hp; f.run.hp = 10;
  assert.ok(!invalid(act(f, { kind: 'skill', skillId: 'warlock_detonate', targetIndex: 0 })));
  assert.ok(e.hp < hp && f.run.hp > 10 && !f.battle.mech.hex[e.uid]);
  const hi = setup('warlock', { level: 15 }); hi.run.mp = 999;
  for (let i = 0; i < 6; i++) act(hi, { kind: 'skill', skillId: 'hex_bolt', targetIndex: 0 });
  assert.equal(hi.battle.mech.hex[hi.battle.enemies[0].uid], 5);
});

// ---- batch 2 ----

test('Monk: basic Attacks build Chi, and techniques spend 2 Chi instead of MP', () => {
  const f = setup('monk', { random: () => 0.99 });
  const palm = f.g.Data.getSkill('thunder_palm');
  assert.equal(f.BE.skillCost(f.battle, palm).mp, palm.cost, 'no Chi yet: costs MP');
  act(f, { kind: 'attack', targetIndex: 0 });
  assert.equal(f.battle.mech.chi, 2, 'one punch, two Chi');
  const c = f.BE.skillCost(f.battle, palm);
  assert.equal(c.mp, 0); assert.equal(c.res.amount, 2);
  const mp = f.run.mp;
  assert.ok(!invalid(act(f, { kind: 'skill', skillId: palm.id, targetIndex: 0 })));
  assert.equal(f.run.mp, mp, 'paid with Chi'); assert.equal(f.battle.mech.chi, 0);
  for (let i = 0; i < 9; i++) act(f, { kind: 'attack', targetIndex: 0 });
  assert.equal(f.battle.mech.chi, 6, 'Lv 20 raises the cap to 6');
});

test('Frost Oracle: ice Chills (weaker hits on you) and Premonition voids the next blow', () => {
  const f = setup('frostOracle');
  const e = f.battle.enemies[0];
  act(f, { kind: 'skill', skillId: 'frost_vision', targetIndex: 0 });
  assert.equal(f.battle.mech.chill[e.uid], 1);
  assert.ok(!invalid(act(f, { kind: 'skill', skillId: 'frost_premonition' })));
  const hp = f.run.hp;
  f.battle.playerAP = 0;
  const r = f.BE.runEnemyPhase(f.battle);
  assert.equal(f.run.hp, hp, 'the blow was voided');
  assert.ok(r.events.some((x) => x.type === 'classMech'));
  assert.ok(f.BE.skillBlockReason(f.battle, f.g.Data.getSkill('frost_premonition')), 'cooldown');
});

test('Bard: a held tune builds Encore, switching is free once per round and resets it', () => {
  const f = setup('bard', { level: 12 });
  const r = act(f, { kind: 'skill', skillId: 'bard_tune_ballad' });
  assert.equal(r.playerAP, 1, 'first switch is free');
  f.run.hp = 10;
  for (let i = 0; i < 3; i++) { f.battle.playerAP = 0; f.BE.runEnemyPhase(f.battle); f.run.hp = Math.max(f.run.hp, 10); }
  assert.equal(f.battle.mech.encore, 3);
  act(f, { kind: 'skill', skillId: 'bard_tune_haste' });
  assert.equal(f.battle.mech.encore, 1);
  assert.ok(f.battle.player.formMods && f.battle.player.formMods.spd > 0, 'Haste raises SPD');
  assert.ok(f.BE.skillBlockReason(f.battle, f.g.Data.getSkill('bard_tune_haste')), 'already playing');
  const low = setup('bard', { level: 5 });
  assert.ok(!low.g.State.learnedSkills(low.run).some((s) => s.id === 'bard_tune_haste'), 'Haste waits for Lv 10');
});

test('Paladin: Guard builds Devotion, the next attack spends it for power and healing', () => {
  const f = setup('paladin', { random: () => 0.99 });
  const base = hits(act(f, { kind: 'attack', targetIndex: 0 }))[0].amount;
  f.battle.playerAP = 1;
  act(f, { kind: 'guard' });
  assert.equal(f.battle.mech.devotion, 1);
  f.BE.runEnemyPhase(f.battle);
  assert.ok(f.battle.mech.devotion >= 2, 'hits taken while guarding add Devotion');
  f.run.hp = 10;
  const strong = hits(act(f, { kind: 'attack', targetIndex: 0 }))[0].amount;
  assert.ok(strong > base * 1.3 && f.run.hp > 10 && f.battle.mech.devotion === 0);
});

test('Alchemist: the first item each round is free, heals more, and primes a Catalyst', () => {
  const f = setup('alchemist', { random: () => 0.99 });
  f.g.State.addItem(f.run, 'p_hp_small', 3);
  f.run.hp = 10;
  const r = act(f, { kind: 'item', itemId: 'p_hp_small' });
  assert.equal(r.playerAP, 1, 'free action');
  assert.ok(r.events.filter((e) => e.type === 'heal').length >= 1, 'bonus healing');
  assert.equal(f.battle.mech.catalyst, 1);
  const r2 = act(f, { kind: 'item', itemId: 'p_hp_small' });
  assert.equal(r2.playerAP, 0, 'only once per round');
  f.run.mp = 999;
  const boosted = act(f, { kind: 'skill', skillId: 'flame_flask', targetIndex: 0 });
  assert.ok(boosted.events.some((e) => e.type === 'classMech' && e.tone === 'crit'));
  assert.equal(f.battle.mech.catalyst, 0);
});

// ---- batch 3 ----

test('Shadow Dancer: attacks leave Shadows, a dodge primes a sure crit, Vanish voids a round', () => {
  const f = setup('shadowDancer', { random: () => 0.01 });   // every dodge roll succeeds
  act(f, { kind: 'attack', targetIndex: 0 });
  assert.equal(f.battle.mech.shadows, 1);
  const hp = f.run.hp;
  f.battle.playerAP = 0; f.BE.runEnemyPhase(f.battle);
  assert.equal(f.run.hp, hp, 'dodged');
  assert.equal(f.battle.mech.primed, true);
  const r = act(f, { kind: 'attack', targetIndex: 0 });
  assert.ok(hits(r).every((h) => h.isCrit), 'sure critical after a dodge');
  f.battle.mech.shadows = 3;
  assert.ok(!invalid(act(f, { kind: 'skill', skillId: 'shadow_vanish' })));
  const hp2 = f.run.hp; f.battle.playerAP = 0; f.BE.runEnemyPhase(f.battle);
  assert.equal(f.run.hp, hp2, 'vanished: nothing lands');
});

test('Beastmaster: Fang bites every round, Sic \'Em bites now and keeps it on that target', () => {
  const f = setup('beastmaster', { enemies: 2, level: 10 });
  const [a, b] = f.battle.enemies;
  const hpB = b.hp;
  assert.ok(!invalid(act(f, { kind: 'skill', skillId: 'beast_sic', targetIndex: 1 })));
  assert.ok(b.hp < hpB);
  const hpA = a.hp, hpB2 = b.hp;
  f.battle.playerAP = 0;
  f.BE.runCompanionPhase(f.battle);
  assert.ok(b.hp < hpB2 && a.hp === hpA, 'Fang keeps hunting the marked target');
});

test('Runeblade: skills inscribe armouring runes, Shatter cashes them for damage and MP', () => {
  const f = setup('runeblade');
  const def0 = f.BE.effectiveStats(f.battle.player, f.battle.player.buffs).def;
  f.run.mp = 999;
  for (let i = 0; i < 4; i++) act(f, { kind: 'skill', skillId: 'runic_edge', targetIndex: 0 });
  assert.equal(f.battle.mech.runes, 4, 'Lv 20: 4 runes');
  assert.ok(f.BE.effectiveStats(f.battle.player, f.battle.player.buffs).def > def0);
  const hp = f.battle.enemies[0].hp; f.run.mp = 0;
  assert.ok(!invalid(act(f, { kind: 'skill', skillId: 'rune_shatter', targetIndex: 0 })));
  assert.ok(f.battle.enemies[0].hp < hp && f.run.mp === 8 && f.battle.mech.runes === 0);
  assert.equal(f.battle.player.formMods, null);
});

test('Sharpshooter: Aim builds a big shot (sure crit at 3), getting hit costs an Aim', () => {
  const f = setup('sharpshooter', { random: () => 0.99 });
  const plainShot = hits(act(f, { kind: 'attack', targetIndex: 0 }))[0].amount;
  const r1 = act(f, { kind: 'skill', skillId: 'sharp_aim' });
  assert.equal(r1.playerAP, 1, 'Lv 15+: first Aim of the round is free');
  act(f, { kind: 'skill', skillId: 'sharp_aim' });
  f.battle.enemies[0].atk = f.battle.enemies[0].mag = 1;
  f.battle.playerAP = 0; f.BE.runEnemyPhase(f.battle);
  assert.equal(f.battle.mech.aim, 2, 'a light hit does not shake your aim');
  f.run.hp = f.battle.player.maxHp;
  f.CM.afterIncoming(f.battle, f.battle.enemies[0], [], {}, Math.ceil(f.battle.player.maxHp * 0.2));
  assert.equal(f.battle.mech.aim, 1, 'a heavy blow shook off an Aim');
  f.battle.mech.aim = 3;
  const big = hits(act(f, { kind: 'attack', targetIndex: 0 }))[0];
  assert.ok(big.isCrit && big.amount > plainShot * 2);
});

test('Battlemage: elemental skills charge the blade, a basic Attack releases them as extra hits', () => {
  const f = setup('battlemage', { random: () => 0.99 });
  f.run.mp = 999;
  act(f, { kind: 'skill', skillId: 'thunder_brand', targetIndex: 0 });
  act(f, { kind: 'skill', skillId: 'thunder_brand', targetIndex: 0 });
  assert.equal(f.battle.mech.charge, 2);
  const r = hits(act(f, { kind: 'attack', targetIndex: 0 }));
  assert.equal(r.length, 3);
  assert.equal(r.filter((h) => h.element === 'elec').length, 2);
  assert.equal(f.battle.mech.charge, 0);
});

// ---- batch 4 (the balance-snapshot classes) ----

test('Blade: chained attacks build Momentum, other actions break it, Unleash spends it', () => {
  const f = setup('blade', { random: () => 0.99 });
  const first = hits(act(f, { kind: 'attack', targetIndex: 0 }))[0].amount;
  for (let i = 0; i < 3; i++) act(f, { kind: 'attack', targetIndex: 0 });
  assert.equal(f.battle.mech.momentum, 4);
  assert.ok(hits(act(f, { kind: 'attack', targetIndex: 0 }))[0].amount > first, 'momentum adds power');
  const hp = f.battle.enemies[0].hp;
  assert.ok(!invalid(act(f, { kind: 'skill', skillId: 'blade_unleash', targetIndex: 0 })));
  assert.ok(f.battle.enemies[0].hp < hp && f.battle.mech.momentum === 0);
  act(f, { kind: 'attack', targetIndex: 0 });
  act(f, { kind: 'guard' });
  assert.equal(f.battle.mech.momentum, 0, 'guarding breaks the chain');
});

test('Elementalist: alternating elements builds Resonance, repeating resets it, full makes a free cast', () => {
  const f = setup('elementalist', { level: 10, random: () => 0.99 });
  f.run.mp = 999;
  const cast = (id) => act(f, { kind: 'skill', skillId: id, targetIndex: 0 });
  cast('fire_bolt'); cast('ice_shard'); cast('fire_bolt');
  assert.equal(f.battle.mech.reso, 2);
  cast('fire_bolt');
  assert.equal(f.battle.mech.reso, 0, 'same element resets');
  cast('ice_shard'); cast('fire_bolt'); cast('ice_shard');
  assert.equal(f.battle.mech.reso, 3);
  assert.equal(f.BE.skillCost(f.battle, f.g.Data.getSkill('fire_bolt')).mp, 0);
  const mp = f.run.mp;
  cast('fire_bolt');
  assert.equal(f.run.mp, mp, 'free cast');
  assert.equal(f.battle.mech.reso, 0);
});

test('Cleric: overhealing becomes a Barrier that soaks damage first', () => {
  const f = setup('cleric');
  f.run.hp = f.battle.player.maxHp - 1;
  act(f, { kind: 'skill', skillId: 'heal' });
  assert.ok(f.battle.mech.barrier > 0);
  assert.ok(f.battle.mech.barrier <= Math.round(f.battle.player.maxHp * 0.2));
  const barrier = f.battle.mech.barrier, hp = f.run.hp;
  f.battle.enemies[0].atk = f.battle.enemies[0].mag = 1;   // a blow smaller than the barrier
  f.battle.playerAP = 0; f.BE.runEnemyPhase(f.battle);
  assert.ok(f.battle.mech.barrier < barrier, 'barrier took the blow');
  assert.equal(f.run.hp, hp, 'HP untouched while the barrier holds');
});

test('Berserker: blows and hits build Rage (more damage), Rampage spends 8 for an extra action and a heal', () => {
  const f = setup('berserker', { random: () => 0.99 });
  act(f, { kind: 'attack', targetIndex: 0 });
  assert.equal(f.battle.mech.rage, 1);
  f.battle.playerAP = 0; f.BE.runEnemyPhase(f.battle);
  assert.ok(f.battle.mech.rage >= 2, 'taking a hit builds Rage');
  f.battle.mech.rage = 8; f.run.hp = 10; f.battle.playerAP = 1;
  const r = f.BE.playerAction(f.battle, { kind: 'skill', skillId: 'berserk_rampage' });
  assert.ok(!invalid(r));
  assert.equal(r.playerAP, 2, 'the command is free and grants one more action');
  assert.ok(f.run.hp > 10 && f.battle.mech.rage === 0);
});

test('Ranger: the marked prey takes more, the kill returns MP and the mark moves on', () => {
  const f = setup('ranger', { enemies: 2, random: () => 0.99 });
  const plain = hits(act(f, { kind: 'attack', targetIndex: 0 }))[0].amount;
  const r = act(f, { kind: 'skill', skillId: 'ranger_mark', targetIndex: 0 });
  assert.equal(r.playerAP, 1, 'marking is free once per round');
  const marked = hits(act(f, { kind: 'attack', targetIndex: 0 }))[0].amount;
  assert.ok(marked > plain);
  f.battle.enemies[0].hp = 1; f.run.mp = 0;
  act(f, { kind: 'attack', targetIndex: 0 });
  assert.equal(f.run.mp, 5);
  assert.equal(f.battle.mech.prey, f.battle.enemies[1].uid);
});

// ---- Valiant classes (js/class-mech-valiant.js) ----

test('Vanguard: chained actions hit harder, a chain of 3+ leaves you exposed', () => {
  const f = setup('vanguard', { level: 10, random: () => 0.99 });   // below Lv 20 the risk starts at 3
  const one = hits(act(f, { kind: 'attack', targetIndex: 0 }))[0].amount;
  const two = hits(act(f, { kind: 'attack', targetIndex: 0 }))[0].amount;
  assert.ok(two > one, 'the second action in a turn hits harder');
  act(f, { kind: 'attack', targetIndex: 0 });
  assert.equal(f.battle.mech.chain, 3);
  const exposed = f.CM.incoming(f.battle, f.battle.enemies[0], 100, [], {});
  assert.equal(exposed.dmg, 120, 'off balance: +20% damage taken');
  f.battle.playerAP = 0; f.BE.runEnemyPhase(f.battle);
  assert.equal(f.CM.incoming(f.battle, f.battle.enemies[0], 100, [], {}).dmg, 100, 'a new round resets the chain');
});

test('Warlord: hits stagger 40% faster and toppling one foe shakes the rest', () => {
  const f = setup('warlord', { enemies: 3, random: () => 0.99 });
  const [a, b, c] = f.battle.enemies;
  act(f, { kind: 'attack', targetIndex: 0 });
  assert.equal(a.breakMeter, Math.round(f.g.Formulas.breakAmount({ power: 1 }) * 1.4));
  a.breakMeter = f.g.Formulas.breakMax(a) - 1;
  const r = act(f, { kind: 'attack', targetIndex: 0 });
  assert.ok(a.broken);
  assert.ok(b.breakMeter >= Math.round(f.g.Formulas.breakMax(b) * 0.45) && c.breakMeter > 0, 'the wave reached the others');
  assert.ok(r.events.some((e) => e.type === 'classMech'));
});

test('Deathbringer: sacrificed HP fills the Blood Pool, Harvest pours it out as damage and healing', () => {
  const f = setup('deathbringer');
  act(f, { kind: 'skill', skillId: 'blood_pact', targetIndex: 0 });
  const pool = f.battle.mech.pool;
  assert.ok(pool > 0, 'blood pact HP went into the pool');
  f.battle.mech.pool = Math.round(f.battle.player.maxHp * 0.3);
  const e = f.battle.enemies[0], hp = e.hp; f.run.hp = 10;
  assert.ok(!invalid(act(f, { kind: 'skill', skillId: 'blood_harvest', targetIndex: 0 })));
  assert.ok(hp - e.hp >= Math.round(f.battle.player.maxHp * 0.3 * 2));
  assert.ok(f.run.hp > 10 && f.battle.mech.pool === 0);
});

test('Executioner: Verdict executes a low foe for free, heals, and spreads dread; refuses healthy targets', () => {
  const f = setup('executioner', { enemies: 2 });
  const [a, b] = f.battle.enemies;
  assert.ok(f.BE.skillBlockReason(f.battle, f.g.Data.getSkill('exec_verdict')), 'nobody low enough yet');
  a.hp = Math.floor(a.maxHp * 0.2); f.run.hp = 10;
  const r = act(f, { kind: 'skill', skillId: 'exec_verdict', targetIndex: 0 });
  assert.ok(!a.alive && r.playerAP === 1 && f.run.hp > 10);
  assert.ok(b.debuffs.some((d) => d.stat === 'atkmag' && d.amount < 0));
});

test('Shadowhunter: hits open bleeding Wounds; Rend tears three rounds of bleeding out at once', () => {
  const f = setup('shadowhunter');
  const e = f.battle.enemies[0];
  act(f, { kind: 'attack', targetIndex: 0 }); act(f, { kind: 'attack', targetIndex: 0 });
  assert.equal(f.battle.mech.wounds[e.uid], 2);
  const hp = e.hp; f.battle.playerAP = 0;
  f.BE.runCompanionPhase(f.battle);
  assert.equal(hp - e.hp >= Math.round(e.maxHp * 0.012 * 2), true, 'bled in the minion phase');
  const hp2 = e.hp; f.battle.playerAP = 1;
  assert.ok(!invalid(act(f, { kind: 'skill', skillId: 'hunter_rend', targetIndex: 0 })));
  assert.ok(hp2 - e.hp >= Math.round(e.maxHp * 0.012 * 2) * 3 && !f.battle.mech.wounds[e.uid]);
});

test('weak-class buffs: Rewind is a free action; high tide crashes harder into a lone foe', () => {
  const c = setup('chronomancer');
  c.battle.mech.prev = { hp: c.battle.player.maxHp, mp: c.battle.player.maxMp };
  c.run.hp = 5;
  assert.equal(act(c, { kind: 'skill', skillId: 'chrono_rewind' }).playerAP, 1, 'Rewind takes no action');
  const w = setup('tempestWitch', { level: 10, random: () => 0.99 });
  w.run.mp = 999;
  const plain = hits(act(w, { kind: 'skill', skillId: 'riptide_bolt', targetIndex: 0 }))[0].amount;
  w.battle.mech.tide = 3;
  const wave = hits(act(w, { kind: 'skill', skillId: 'riptide_bolt', targetIndex: 0 }));
  assert.equal(wave.length, 1);
  assert.ok(wave[0].amount > plain * 1.4, 'a lone foe takes the full wave');
});
