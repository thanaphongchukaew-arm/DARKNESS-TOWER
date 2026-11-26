// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Class signature mechanics (js/class-mech.js): each pilot class's rule works through the
// real engine, survives a save/resume round trip, and leaves every other class untouched.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadGame } = require('./helpers/load-game');

function setup(classId, opts) {
  opts = opts || {};
  const g = loadGame({ random: opts.random || (() => 0.5) });
  const run = g.State.createRun('normal', classId);
  run.level = opts.level || 20; g.State.fullRestore(run);
  const battle = g.BattleEngine.createBattle(run, opts.floor || 12, false);
  battle.enemies = battle.enemies.slice(0, opts.enemies || 1);
  battle.enemies.forEach((e) => { e.hp = e.maxHp = opts.enemyHp || 100000; });
  battle.playerAP = 1;
  g.ClassMech.ensure(battle);
  return { g, run, battle, BE: g.BattleEngine, CM: g.ClassMech };
}
// Repeated hits fill Break and floor the foe, which pauses for the All-Out prompt; these tests
// are about the class rule, so decline that prompt and keep acting.
const act = (f, action) => { f.battle.awaitingAllOut = false; f.battle.playerAP = Math.max(f.battle.playerAP, 1); return f.BE.playerAction(f.battle, action); };
const hits = (r) => r.events.filter((e) => e.type === 'hit' && e.sourceSide === 'player');
const plain = (o) => JSON.parse(JSON.stringify(o));   // objects from the vm sandbox have foreign prototypes
const invalid = (r) => r.events.some((e) => e.type === 'invalid');

test('every class has a signature mechanic with full text and a gauge', () => {
  const g = loadGame();
  const ids = Object.keys(g.ClassMech.DEFS);
  assert.equal(JSON.stringify(g.Data.classes.map((c) => c.id).filter((id) => !ids.includes(id))), '[]', 'classes without a mechanic');
  for (const id of ids) {
    assert.ok(g.Data.getClass(id), id + ' is not a class');
    const d = g.ClassMech.info(id);
    for (const k of ['name', 'nameEn', 'desc', 'descEn', 'short', 'shortEn']) assert.ok(d[k] && d[k].length > 3, id + '.' + k);
    assert.ok(typeof d.gauge === 'function', id + ' has no gauge');
  }
  // A battle with no class rule in play (a deleted definition) never grows battle.mech.
  const f = setup('blade');
  delete f.CM.DEFS.blade;
  act(f, { kind: 'attack', targetIndex: 0 });
  f.BE.runCompanionPhase(f.battle); f.BE.runEnemyPhase(f.battle);
  assert.equal(f.CM.gauge(f.battle), null);
});

test('every class command is learnable by its own class only; Wolf Form waits for Lv 8', () => {
  const g = loadGame();
  const cmds = g.Data.skills.filter((s) => s.kind === 'mech');
  assert.ok(cmds.length >= 6);
  assert.equal(g.Data.getSkill('druid_form_wolf').minLevel, 8);
  assert.ok(!g.Data.getLearnedSkills('druid', 7).some((x) => x.id === 'druid_form_wolf'));
  for (const s of cmds) {
    assert.ok(g.Data.getLearnedSkills(s.classOnly, s.minLevel).some((x) => x.id === s.id), s.id);
    const other = g.Data.classes.find((c) => c.id !== s.classOnly).id;
    assert.ok(!g.Data.getLearnedSkills(other, 99).some((x) => x.id === s.id), s.id + ' leaked to ' + other);
    assert.ok(g.ClassMech.has(s.classOnly), s.id + ' belongs to a class without a mechanic');
  }
});

test('Samurai: Sheathe makes the next attack a sure critical, softens and counters enemy hits', () => {
  const f = setup('samurai', { random: () => 0.99 });   // 0.99: no natural crits
  const plain = hits(act(f, { kind: 'attack', targetIndex: 0 }));
  assert.equal(plain[0].isCrit, false);
  act(f, { kind: 'skill', skillId: 'samurai_sheathe' });
  assert.equal(f.battle.mech.sheathed, true);
  assert.ok(invalid(act(f, { kind: 'skill', skillId: 'samurai_sheathe' })), 'cannot sheathe twice');

  // Enemy phase while sheathed: damage is cut and the first attacker is countered once.
  const ref = setup('samurai', { random: () => 0.99 });
  ref.battle.playerAP = 0; f.battle.playerAP = 0;
  const hp0 = f.run.hp, refHp0 = ref.run.hp;
  const er = f.BE.runEnemyPhase(f.battle); ref.BE.runEnemyPhase(ref.battle);
  assert.ok(hp0 - f.run.hp < refHp0 - ref.run.hp, 'sheathed stance takes less damage');
  assert.equal(er.events.filter((e) => e.type === 'riposte').length, 1, 'one counter-draw per round');

  const drawn = hits(act(f, { kind: 'attack', targetIndex: 0 }));
  assert.equal(drawn[0].isCrit, true, 'the draw is a guaranteed critical');
  assert.equal(f.battle.mech.sheathed, false, 'drawing spends the stance');
});

test('Gunslinger: gun skills spend bullets and half MP, the last bullet crits, Reload refills', () => {
  const f = setup('gunslinger', { random: () => 0.99 });
  const quick = f.g.Data.getSkill('quickdraw');
  const qc = plain(f.BE.skillCost(f.battle, quick));
  assert.deepEqual({ mp: qc.mp, hp: qc.hp, ammo: qc.ammo }, { mp: Math.ceil(quick.cost / 2), hp: 0, ammo: 1 });
  assert.ok(invalid(act(f, { kind: 'skill', skillId: 'gun_reload' })), 'reload refused while full');
  for (let i = 0; i < 5; i++) {
    const mp0 = f.run.mp;
    const r = act(f, { kind: 'skill', skillId: 'quickdraw', targetIndex: 0 });
    assert.equal(hits(r)[0].isCrit, false);
    assert.equal(mp0 - f.run.mp, Math.ceil(quick.cost / 2));
  }
  assert.equal(f.battle.mech.ammo, 1);
  assert.ok(f.BE.skillBlockReason(f.battle, f.g.Data.getSkill('bullet_storm')), 'not enough bullets for a 3-bullet skill');
  const last = act(f, { kind: 'skill', skillId: 'quickdraw', targetIndex: 0 });
  assert.equal(hits(last)[0].isCrit, true, 'last bullet is a sure critical');
  assert.equal(f.battle.mech.ammo, 0);
  assert.ok(invalid(act(f, { kind: 'skill', skillId: 'quickdraw', targetIndex: 0 })), 'empty cylinder');
  assert.ok(!invalid(act(f, { kind: 'attack', targetIndex: 0 })), 'basic attack needs no bullets');
  act(f, { kind: 'skill', skillId: 'gun_reload' });
  assert.equal(f.battle.mech.ammo, 6);
});

test('Necromancer: corpses from kills raise skeletons that strike every round and can take hits', () => {
  const f = setup('necromancer', { enemies: 2 });
  assert.equal(f.battle.mech.corpses, 1, 'starts with one corpse');
  act(f, { kind: 'skill', skillId: 'raise_dead' });
  assert.equal(f.battle.mech.minions.length, 1);
  assert.equal(f.battle.mech.corpses, 0);
  assert.ok(invalid(act(f, { kind: 'skill', skillId: 'raise_dead' })), 'no corpse left');

  // A kill leaves a corpse (picked up by the end-of-action sweep).
  f.battle.enemies[1].hp = 1;
  act(f, { kind: 'attack', targetIndex: 1 });
  assert.equal(f.battle.enemies[1].alive, false);
  assert.equal(f.battle.mech.corpses, 1);

  // Skeletons act in the companion phase even without a companion.
  const hp0 = f.battle.enemies[0].hp;
  const cr = f.BE.runCompanionPhase(f.battle);
  assert.ok(cr.events.some((e) => e.type === 'riposte' && /Skeleton|โครงกระดูก/.test(e.message)));
  assert.ok(f.battle.enemies[0].hp < hp0);
  assert.equal(f.BE.runCompanionPhase(f.battle).events.filter((e) => e.type === 'riposte').length, 0, 'once per round');
});

test('Necromancer: a skeleton intercepts a blow and shatters when it runs out of HP', () => {
  const f = setup('necromancer', { random: () => 0.1 });   // 0.1 < intercept chance
  act(f, { kind: 'skill', skillId: 'raise_dead' });
  f.battle.mech.minions[0].hp = 1;
  const hp0 = f.run.hp;
  f.battle.playerAP = 0;
  const r = f.BE.runEnemyPhase(f.battle);
  assert.equal(f.battle.mech.minions.length, 0, 'skeleton shattered');
  assert.ok(r.events.some((e) => e.type === 'classMech'));
  assert.ok(f.run.hp <= hp0);
});

test('Druid: forms change stats, gate skills, transform Attack and shift once per round for free', () => {
  const f = setup('druid', { random: () => 0.99 });
  const def0 = f.BE.effectiveStats(f.battle.player, f.battle.player.buffs).def;
  const r = act(f, { kind: 'skill', skillId: 'druid_form_bear' });
  assert.equal(r.playerAP, 1, 'first shift of the round refunds its action');
  assert.ok(f.BE.effectiveStats(f.battle.player, f.battle.player.buffs).def >= Math.floor(def0 * 1.3), 'bear form: DEF +30%');
  assert.ok(f.BE.skillBlockReason(f.battle, f.g.Data.getSkill('thorn_whip')), 'spells locked in bear form');
  assert.equal(f.BE.skillBlockReason(f.battle, f.g.Data.getSkill('bear_roar')), null);
  assert.ok(f.BE.skillBlockReason(f.battle, f.g.Data.getSkill('feral_pounce')), 'wolf move locked in bear form');
  const r2 = act(f, { kind: 'skill', skillId: 'druid_form_wolf' });
  assert.equal(r2.playerAP, 0, 'second shift in one round costs the action');
  f.battle.playerAP = 1;
  const bites = hits(act(f, { kind: 'attack', targetIndex: 0 }));
  assert.equal(bites.length, 2, 'wolf Attack bites twice');
  // Bear regenerates at the start of each round.
  f.CM.setForm(f.battle, 'bear');
  f.run.hp = Math.round(f.battle.player.maxHp / 2);
  f.battle.playerAP = 0;
  const er = f.BE.runEnemyPhase(f.battle);
  assert.ok(er.events.some((e) => e.type === 'heal' && e.side === 'player'));
});

test('a mechanic battle survives a JSON save/resume round trip mid-fight and keeps playing', () => {
  for (const cls of ['samurai', 'gunslinger', 'necromancer', 'druid']) {
    const f = setup(cls, { enemies: 2 });
    const cmd = { samurai: 'samurai_sheathe', gunslinger: 'quickdraw', necromancer: 'raise_dead', druid: 'druid_form_bear' }[cls];
    act(f, { kind: 'skill', skillId: cmd, targetIndex: 0 });
    const copy = {};
    Object.keys(f.battle).forEach((k) => { if (k !== 'run') copy[k] = f.battle[k]; });
    const resumed = JSON.parse(JSON.stringify(copy));
    resumed.run = f.run;
    assert.deepEqual(resumed.mech, JSON.parse(JSON.stringify(f.battle.mech)), cls + ': mechanic state serialises');
    if (cls === 'druid') assert.deepEqual(plain(resumed.player.formMods), plain(f.battle.player.formMods));
    for (let round = 0; round < 4 && !resumed.over; round++) {
      resumed.playerAP = Math.max(1, resumed.playerAP);
      const r = f.BE.playerAction(resumed, { kind: 'attack', targetIndex: resumed.enemies.findIndex((e) => e.alive) });
      assert.ok(!invalid(r), cls + ': attack after resume');
      if (!resumed.over) f.BE.runCompanionPhase(resumed);
      if (!resumed.over) f.BE.runEnemyPhase(resumed);
      assert.ok(Number.isFinite(f.run.hp) && Number.isFinite(f.run.mp), cls);
    }
  }
});

test('the balance bot has a usable class command for every pilot class', () => {
  const cases = {
    samurai: () => {},
    gunslinger: (f) => { f.battle.mech.ammo = 0; },
    necromancer: () => {},
    druid: (f) => { f.run.hp = 1; }
  };
  for (const cls of Object.keys(cases)) {
    const f = setup(cls);
    cases[cls](f);
    const a = f.CM.botAction(f.battle, (s) => f.BE.skillBlockReason(f.battle, s));
    assert.ok(a && a.kind === 'skill', cls);
    assert.ok(!invalid(act(f, a)), cls + ': ' + a.skillId);
  }
});

test('gauge text exists in both languages for every pilot class', () => {
  for (const cls of ['samurai', 'gunslinger', 'necromancer', 'druid']) {
    const f = setup(cls);
    for (const lang of ['th', 'en']) {
      f.g.I18n.setLang(lang);
      const gauge = f.CM.gauge(f.battle);
      assert.ok(gauge && gauge.label && gauge.value && gauge.icon, cls + '/' + lang);
    }
  }
});
