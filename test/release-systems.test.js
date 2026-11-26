// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Covers the release-readiness systems: save backup/export/import, ratio damage,
// knockdown rules, tempo, champions, checkpoints, retreat, the extended talent
// tiers, the second relic set and the data-driven choice events.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadGame } = require('./helpers/load-game.js');

function fresh(classId, difficulty, options) {
  const G = loadGame(options);
  const run = G.State.createRun(difficulty || 'normal', classId || 'blade', 0);
  G.State.current = run;
  return { G, run };
}

test('save stamps a version and clear removes the slot together with its backup', () => {
  const { G, run } = fresh();
  G.State.saveNow();
  run.gold = 77; G.State.saveNow();
  assert.equal(G.Save.read().saveVersion, G.Save.SAVE_VERSION);
  assert.equal(G.Save.read().gold, 77);
  assert.ok(G.Save.exists());
  G.Save.clear();
  assert.equal(G.Save.exists(), false, 'clear removes the backup too');
});

test('export then import round-trips the run, meta and checkpoint; foreign data is rejected', () => {
  const { G, run } = fresh();
  run.currentFloor = 11; run.gold = 321;
  G.Save.writeCheckpoint(JSON.parse(JSON.stringify(run)));
  G.State.saveNow();
  const meta = G.Save.readMeta(); meta.bestFloorReached = 11; G.Save.writeMeta(meta);
  const text = G.Save.exportAll();
  G.Save.clear();
  assert.equal(G.Save.read(), null);
  assert.deepEqual(JSON.parse(JSON.stringify(G.Save.importAll('garbage'))), { ok: false, reason: 'format' });
  assert.equal(G.Save.importAll(JSON.stringify({ tag: 'other' })).ok, false);
  assert.equal(G.Save.importAll(JSON.stringify({ tag: 'darkness-tower-save', run: { classId: 'blade' } })).ok, false);
  assert.equal(G.Save.importAll(text).ok, true);
  assert.equal(G.Save.read().gold, 321);
  assert.equal(G.Save.readMeta().bestFloorReached, 11);
  assert.equal(G.Save.readCheckpoint().currentFloor, 11);
});

test('ratio damage never collapses to 1 nor explodes, and is scale-invariant', () => {
  const F = loadGame({ random: () => 0.5 }).Formulas;
  const hit = (atk, def) => F.computeDamage({ element: 'phys', power: 1, atkStat: atk, magStat: 0, defStat: def, resStat: 0, isCrit: false });
  assert.equal(hit(100, 100), 25);                 // equal stats: half, then the global 0.5
  assert.ok(hit(100, 400) >= 9, 'heavily out-defended hits still matter');
  assert.ok(hit(100, 0) === 50);
  assert.equal(hit(200, 200), 2 * hit(100, 100));
  const edge = F.computeDamage({ element: 'fire', power: 1, atkStat: 100, magStat: 10, defStat: 0, resStat: 100, isCrit: false, scaleStat: 'atk' });
  assert.equal(edge, 25, 'an ATK-scaled elemental technique uses ATK against RES');
  assert.ok(F.floorScale(100) < F.floorScale(44), 'the floor curve eases off in the upper tower');
  assert.ok(F.tempoGain(115, 100) > 0.4 && F.tempoGain(115, 100) < 0.6);
  assert.equal(F.tempoGain(130, 100), 1);
  assert.equal(F.tempoGain(90, 100), 0);
});

test('only a full stagger bar knocks an enemy down; weakness and crits just fill it faster', () => {
  const { G, run } = fresh('elementalist', 'normal', { random: () => 0.99 });
  const BE = G.BattleEngine, F = G.Formulas;
  run.mp = 999;
  const battle = BE.createBattle(run, 2, false);
  const enemy = battle.enemies[0];
  enemy.maxHp = enemy.hp = 1e6;
  const weak = G.Data.getEnemyTemplate(enemy.templateId).weak;
  const skill = G.Data.skills.find((s) => s.kind === 'attack' && s.target === 'singleEnemy' && s.element === weak && s.classOnly === null && !s.martialOnly);
  assert.ok(skill, 'a shared skill exists for ' + weak);
  battle.playerAP = 1;
  let res = BE.playerAction(battle, { kind: 'skill', skillId: skill.id, targetIndex: 0 });
  assert.ok(!res.events.some((e) => e.type === 'downed'), 'a weakness hit alone no longer downs the enemy');
  assert.equal(enemy.breakMeter, F.breakAmount({ power: skill.power, weak: true }), 'weakness fills the bar x1.25');
  assert.ok(F.breakAmount({ power: 1, crit: true }) > F.breakAmount({ power: 1 }), 'a crit fills it x1.5');
  enemy.breakMeter = F.breakMax(enemy) - 1;
  battle.playerAP = 1; run.mp = 999;
  res = BE.playerAction(battle, { kind: 'skill', skillId: skill.id, targetIndex: 0 });
  assert.ok(res.events.some((e) => e.type === 'downed') && enemy.downed, 'a full bar knocks it down');
  BE.confirmAllOut(battle, false);
  BE.runEnemyPhase(battle);
  assert.equal(enemy.steady, true);
  enemy.breakMeter = F.breakMax(enemy) - 1;
  battle.playerAP = 1; run.mp = 999;
  BE.playerAction(battle, { kind: 'skill', skillId: skill.id, targetIndex: 0 });
  assert.equal(enemy.downed, false, 'a steady enemy cannot be downed again straight away');
  const boss = BE.createBattle(run, 5, false);
  assert.ok(F.breakMax(boss.enemies[0]) > F.breakMax(enemy), 'bosses have a longer stagger bar');
});

test('physical classes get ATK-scaled elemental techniques; casters do not', () => {
  const G = loadGame();
  const ids = (cls) => G.Data.getLearnedSkills(cls, 99).map((s) => s.id);
  assert.ok(ids('blade').includes('edge_fire') && ids('blade').includes('edge_dark'));
  assert.ok(!ids('elementalist').includes('edge_fire'));
  assert.ok(!ids('blade').includes('fire_bolt'));
});

test('champion floors field one tougher, better-paying leader', () => {
  const { G, run } = fresh();
  assert.equal(G.Formulas.isChampionFloor(8), true);
  assert.equal(G.Formulas.isChampionFloor(3), false);
  assert.equal(G.Formulas.isChampionFloor(10), false);
  const battle = G.BattleEngine.createBattle(run, 8, false);
  assert.equal(battle.enemies[0].champion, true);
  assert.ok(battle.enemies.slice(1).every((e) => !e.champion));
});

test('permadeath on every difficulty: no checkpoints are ever taken or restored', () => {
  for (const diff of ['easy', 'normal', 'hard', 'nightmare']) {
    const { G, run } = fresh('blade', diff);
    run.currentFloor = 11;
    assert.equal(G.State.maybeCheckpoint(run), false, diff);
    assert.equal(G.Save.readCheckpoint(), null, diff);
    assert.equal(G.State.restoreCheckpoint(), null, diff);
  }
});

test('retreat costs 15% gold only when a battle was in progress', () => {
  const { G, run } = fresh();
  run.gold = 200;
  assert.equal(G.State.settleRetreat(run), 0);
  assert.equal(run.gold, 200);
  G.State.markBattle(run, 4);
  assert.equal(G.Save.read().battleMark, 4, 'the mark is saved, so quitting mid-battle is caught on Continue');
  assert.equal(G.State.settleRetreat(run), 30);
  assert.equal(run.gold, 170);
  assert.equal(run.battleMark, undefined);
});

test('talent tiers 20-50: three options each, the level 20 set depends on the class archetype', () => {
  const G = loadGame();
  const X = G.Systems;
  const mk = (cls) => { const r = G.State.createRun('normal', cls, 0); r.level = 60; return r; };
  for (const cls of G.Data.classes) {
    const run = mk(cls.id);
    for (const level of X.TALENT_LEVELS) assert.equal(X.options(run, level).length, 3, cls.id + ' level ' + level);
  }
  assert.equal(X.archetype(mk('blade')), 'martial');
  assert.equal(X.archetype(mk('elementalist')), 'caster');
  const run = mk('blade'); G.State.current = run;
  assert.equal(X.chooseTalent(run, 'spell_surge'), false, 'cannot take another archetype\'s talent');
  for (const level of X.TALENT_LEVELS) { assert.equal(X.pending(run), level); assert.equal(X.chooseTalent(run, X.options(run, level)[0].id), true); }
  assert.equal(X.pending(run), null);
  const ids = X.talents.map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const t of X.talents) assert.ok(t.name && t.nameEn && t.desc && t.descEn && t.icon, t.id);
});

test('every relic is documented in both languages and battles run with all of them held', () => {
  const { G, run } = fresh('blade', 'normal');
  const D = G.Data, S = G.State, BE = G.BattleEngine;
  assert.ok(D.relics.length >= 30);
  for (const r of D.relics) { assert.ok(r.name && r.nameEn && r.desc && r.descEn && r.icon, r.id); S.addRelic(run, r.id); }
  run.level = 60; G.Systems.TALENT_LEVELS.forEach((lv) => { run.talents = run.talents || {}; run.talents[lv] = G.Systems.options(run, lv)[2].id; });
  S.fullRestore(run);
  for (const floor of [3, 8, 10, 48, 100]) {
    S.fullRestore(run);
    const battle = BE.createBattle(run, floor, floor === 100);
    assert.equal(battle.player.focus, 30, 'War Banner starts the fight with Focus');
    let guard = 0;
    while (!battle.over && guard++ < 400) {
      while (!battle.over && battle.playerAP > 0) {
        if (battle.awaitingAllOut) { BE.confirmAllOut(battle, true); continue; }
        const target = battle.enemies.findIndex((e) => e.alive);
        const res = BE.playerAction(battle, battle.player.focus >= 100 ? { kind: 'overdrive', targetIndex: target } : guard % 5 === 0 ? { kind: 'guard' } : { kind: 'attack', targetIndex: target });
        for (const ev of res.events) assert.ok(ev && typeof ev.type === 'string');
      }
      if (battle.over) break;
      BE.runCompanionPhase(battle);
      if (battle.over) break;
      run.hp = Math.max(run.hp, Math.round(battle.player.maxHp * 0.6));
      const phase = BE.runEnemyPhase(battle);
      for (const ev of phase.events) { assert.ok(ev && typeof ev.type === 'string'); if (ev.type === 'hit') assert.ok(Number.isFinite(ev.amount) && ev.amount >= 0); }
      assert.ok(Number.isFinite(run.hp) && Number.isFinite(run.mp) && run.mp <= battle.player.maxMp && run.hp <= battle.player.maxHp);
    }
    assert.ok(battle.over, 'the fight on floor ' + floor + ' finishes');
  }
});

test('Unbreakable and Second Wind each fire once per battle', () => {
  const { G, run } = fresh('cleric', 'normal');
  run.level = 60; run.talents = { 20: 'second_wind', 50: 'unbreakable' };
  G.State.fullRestore(run);
  const battle = G.BattleEngine.createBattle(run, 3, false);
  battle.enemies.forEach((e) => { e.atk = e.mag = 1e6; e.maxHp = e.hp = 1e6; });
  G.BattleEngine.runEnemyPhase(battle);
  assert.equal(battle.unbreakableUsed, true);
  assert.equal(battle.over, false, 'the first lethal hit is survived');
  assert.ok(run.hp >= 1);
  const res = G.BattleEngine.runEnemyPhase(battle);
  assert.equal(res.battleOver, true);
  assert.equal(res.victory, false);
});

test('every choice event resolves every choice without breaking the run', () => {
  const G = loadGame();
  const events = G.Data.events.filter((e) => e.choiceEvent);
  assert.ok(G.Data.events.length >= 20);
  assert.ok(events.length >= 10);
  for (const ev of events) {
    assert.ok(ev.name && ev.nameEn && ev.desc && ev.descEn && ev.icon, ev.id);
    assert.ok(ev.choices.length >= 2, ev.id);
    for (const choice of ev.choices) {
      assert.ok(choice.name && choice.nameEn && choice.desc && choice.descEn && choice.icon, ev.id + '/' + choice.id);
      if (choice.leave) continue;
      for (const floor of [4, 37, 96]) {
        for (let i = 0; i < 6; i++) {
          const run = G.State.createRun('normal', 'blade', 0);
          G.State.current = run;
          run.currentFloor = floor; run.gold = 5000; run.level = 5 + floor;
          if (i % 2) G.State.addCurse(run, G.Data.curses[0].id, false);
          const cost = choice.cost ? choice.cost(run, floor) : 0;
          assert.ok(Number.isFinite(cost) && cost >= 0);
          const result = choice.effect(run, floor);
          assert.ok(result && typeof result.th === 'string' && result.th && typeof result.en === 'string' && result.en, ev.id + '/' + choice.id);
          assert.ok(!/undefined|NaN/.test(result.th + result.en), ev.id + '/' + choice.id + ': ' + result.en);
          const stats = G.State.getTotalStats(run);
          for (const k of Object.keys(stats)) assert.ok(Number.isFinite(stats[k]) && stats[k] >= 0, ev.id + ' ' + k);
          assert.ok(run.hp >= 1 && run.hp <= G.State.getMaxHp(run) && run.mp <= G.State.getMaxMp(run) && run.gold >= 0, ev.id + '/' + choice.id);
          JSON.stringify(run);
        }
      }
    }
  }
});

test('every difficulty can start a run and build floor 1 through the final boss', () => {
  for (const diff of ['easy', 'normal', 'hard', 'nightmare']) {
    const { G, run } = fresh('blade', diff);
    for (const floor of [1, 5, 50, 99, 100]) {
      const battle = G.BattleEngine.createBattle(run, floor, floor === 100);
      for (const e of battle.enemies) for (const k of ['maxHp', 'atk', 'mag', 'def', 'res', 'spd']) assert.ok(Number.isFinite(e[k]) && e[k] >= 1, diff + ' ' + floor + ' ' + k);
    }
  }
  const F = loadGame().Formulas;
  assert.ok(F.DIFFICULTY.easy.statMult < F.DIFFICULTY.normal.statMult && F.DIFFICULTY.normal.statMult < F.DIFFICULTY.hard.statMult && F.DIFFICULTY.hard.statMult < F.DIFFICULTY.nightmare.statMult);
});
