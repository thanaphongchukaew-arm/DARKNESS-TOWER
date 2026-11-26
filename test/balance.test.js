// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)
// Guards for the balance pass: each assertion pins a rule that fixed a measured problem
// (see scripts/balance-sim.js), so a later tuning change cannot silently undo it.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadGame } = require('./helpers/load-game.js');

test('enemy SPD only takes part of the floor multiplier (no first strike on every boss)', () => {
  const { Formulas: F } = loadGame();
  const out = F.scaleStatsBlock({ hp: 100, atk: 20, mag: 20, def: 10, res: 10, spd: 20, luk: 5, exp: 10 }, 2, 1);
  assert.equal(out.atk, 40);
  assert.equal(out.spd, Math.round(20 * (1 + F.SPD_SCALE_SHARE)));
  assert.ok(out.spd < 40);
});

test('Ascension bonus ramps in over the first floors and is full from floor 40', () => {
  const { Formulas: F } = loadGame();
  const early = F.ascensionEnemyMult(10, 1), mid = F.ascensionEnemyMult(10, 20), late = F.ascensionEnemyMult(10, 40);
  assert.ok(early < mid && mid < late);
  assert.ok(Math.abs(late - 1.9) < 1e-9);
  assert.ok(Math.abs(F.ascensionEnemyMult(10) - 1.9) < 1e-9, 'no floor means full strength (level picker)');
  assert.equal(F.ascensionEnemyMult(0, 1), 1);
  assert.equal(F.ascensionEnemyMult(10, 100), late);
});

test('clearing a low Ascension never skips levels', () => {
  const g = loadGame(), S = g.State;
  assert.equal(S.getAscensionUnlocked(), 0);
  S.recordAscensionClear(0); assert.equal(S.getAscensionUnlocked(), 1);
  S.recordAscensionClear(0); S.recordAscensionClear(0); assert.equal(S.getAscensionUnlocked(), 1, 'replaying level 0 unlocks nothing more');
  S.recordAscensionClear(1); assert.equal(S.getAscensionUnlocked(), 2);
  for (let i = 0; i < 20; i++) S.recordAscensionClear(S.getAscensionUnlocked());
  assert.equal(S.getAscensionUnlocked(), g.Formulas.ASCENSION_MAX);
});

test('arena pays a fraction of tower EXP and materials', () => {
  const { Formulas: F } = loadGame();
  assert.ok(F.ARENA_EXP_MULT > 0 && F.ARENA_EXP_MULT <= 0.4);
  assert.ok(F.ARENA_MATERIAL_MULT > 0 && F.ARENA_MATERIAL_MULT <= 0.5);
});

test('gold per enemy grows with EXP but with diminishing returns', () => {
  const { Formulas: F } = loadGame();
  assert.equal(F.goldForExp(15), 8);
  assert.ok(F.goldForExp(1000) > F.goldForExp(500));
  assert.ok(F.goldForExp(1000) < 0.4 * 1000, 'well under the old flat 50%');
  assert.ok(F.goldForExp(15) >= 7, 'early game income is unchanged');
  assert.ok(F.goldForExp(2000) < 0.6 * (2000 * 0.5 / (1 + 2000 / 600)), 'late game pays well under the old curve');
});

test('every gear source agrees on the item tier table', () => {
  const g = loadGame(), F = g.Formulas;
  assert.equal(F.itemTierForFloor(44), 5);
  assert.equal(F.itemTierForFloor(45), 6);
  assert.equal(F.itemTierForFloor(60), 7);
  const floors = g.WorkshopData.recipes.filter((r) => r.type === 'forge' || r.type === 'armor');
  for (const r of floors) {
    const base = g.Data.getItem(g.Data.getItem(r.resultId).baseId);
    if (base.tier >= 6 && base.tier <= 7) assert.ok(r.floor <= ({ 6: 45, 7: 60 })[base.tier] + 0, r.id + ' unlocks no later than shop/reward tier');
  }
});

test('late gear costs more; early gear price is unchanged', () => {
  const { Formulas: F, Data: D } = loadGame();
  assert.equal(F.shopPrice(D.getItem('w_dragonfang_blade')), 240);
  assert.equal(F.shopPrice(D.getItem('w_resonant_edge')), 540);
  assert.equal(F.shopPrice(D.getItem('w_sovereign_fang')), 735);
  assert.equal(F.shopPrice(D.getItem('p_hp_transcendent')), 140);
});

test('crafting recipes can be fed by the drops of their zone', () => {
  const { Data: D } = loadGame();
  for (const r of D.recipes) for (const m of r.materials) {
    const mat = D.getItem(m.id);
    assert.equal(mat.kind, 'material');
    assert.ok(m.qty <= 4 || r.tier <= 4 || r.tier === 9, r.id + ' asks for a realistic amount');
  }
});

test('deep-floor enemies also drop the scarce tier 5-8 materials', () => {
  const g = loadGame(), S = g.State, BE = g.BattleEngine;
  const run = S.createRun('nightmare', 'blade', 0); S.current = run;
  const seen = new Set();
  for (let i = 0; i < 400; i++) {
    run.currentFloor = 90;
    const b = BE.createBattle(run, 90, false);
    BE.getMaterialDrops(b, 1).forEach((d) => seen.add(g.Data.getItem(d.id).tier));
  }
  for (const t of [5, 6, 7, 8]) assert.ok(seen.has(t), 'tier ' + t + ' material drops on floor 90');
});

test('martial classes get sustain and every elite class has an AoE they can use', () => {
  const { Data: D } = loadGame();
  const learn = (id) => D.getLearnedSkills(id, 99).map((s) => s.id);
  for (const id of ['blade', 'berserker', 'ranger', 'samurai', 'shadowDancer', 'beastmaster', 'sharpshooter', 'executioner']) assert.ok(learn(id).includes('catch_breath'), id);
  assert.ok(!learn('elementalist').includes('catch_breath'), 'casters keep the shared heals instead');
  assert.ok(learn('shadowhunter').includes('shadow_volley') && !learn('executioner').includes('shadow_volley'));
  assert.ok(learn('executioner').includes('harvest_sweep'));
  assert.ok(learn('cleric').includes('divine_mercy') && !learn('paladin').includes('divine_mercy'));
});

test('class-specific opening attacks are not worse than the shared spell they replace', () => {
  const { Data: D } = loadGame();
  const own = { alchemist: 'flame_flask', frostOracle: 'frost_vision', bard: 'discordant_note', puppeteer: 'marionette_strike' };
  for (const c of Object.keys(own)) {
    const a = D.getSkill(own[c]);
    assert.ok(a.cost <= 7 && a.power >= 1.5, c);
  }
});

test('Deathbringer sacrifices more HP for less raw power than before', () => {
  const { Data: D } = loadGame();
  assert.equal(D.getSkill('blood_pact').power, 1.6);
  assert.equal(D.getSkill('apocalypse_of_ruin').power, 2.4);
  assert.equal(D.getSkill('apocalypse_of_ruin').hpCost, 0.25);
});

test('every mini-boss has its own phase focus through floor 95', () => {
  const { Data: D } = loadGame();
  for (let f = 5; f <= 95; f += 5) {
    const m = D.getMiniBoss(f);
    assert.ok(m && m.phases && m.phases[0].shift && ['buffs', 'mana', 'companion'].includes(m.phases[0].shift.focus), 'floor ' + f);
  }
});

test('a Large MP potion fills the tier-3 gap', () => {
  const { Data: D } = loadGame();
  const p = D.getItem('p_mp_large');
  assert.equal(p.tier, 3);
  assert.ok(p.effect.amount > D.getItem('p_mp_medium').effect.amount && p.effect.amount < D.getItem('p_mp_greater').effect.amount);
});

// ---- runtime behaviour of the new skills and the sell-price table ----
function fixture(classId, floor = 30) {
  const g = loadGame(), run = g.State.createRun('nightmare', classId, 0);
  g.State.current = run; run.level = 40; run.currentFloor = floor; g.State.fullRestore(run);
  const battle = g.BattleEngine.createBattle(run, floor, false);
  battle.enemies.forEach((e) => { e.hp = e.maxHp = 1e6; });
  battle.playerAP = 3;
  return { g, run, battle };
}

test('Catch Breath heals a martial class for 28% of max HP (times its rank) and costs 7 MP', () => {
  const f = fixture('blade');
  const rank = f.g.Data.skillPowerMult(f.g.Data.getSkill('catch_breath'), f.run.level);
  f.run.hp = Math.round(f.battle.player.maxHp * 0.3); f.run.mp = 20;
  const before = f.run.hp;
  const res = f.g.BattleEngine.playerAction(f.battle, { kind: 'skill', skillId: 'catch_breath' });
  assert.ok(!res.events.some((e) => e.type === 'invalid'));
  assert.equal(f.run.hp - before, Math.round(f.battle.player.maxHp * 0.28 * rank));
  assert.equal(f.run.mp, 13);
});

test('Harvest Sweep hits every enemy and spikes only on the ones below 30% HP', () => {
  const f = fixture('executioner');
  const base = f.battle.enemies[0];
  while (f.battle.enemies.length < 2) f.battle.enemies.push(Object.assign({}, base, { uid: 'e' + f.battle.enemies.length, debuffs: [], ailments: [] }));
  const [low, high] = f.battle.enemies;
  [low, high].forEach((e) => { e.maxHp = 1e6; e.def = e.res = 1; e.downed = false; e.broken = false; e.breakMeter = 0; });
  low.hp = low.maxHp * 0.2; high.hp = high.maxHp;
  f.battle.enemies.slice(2).forEach((e) => { e.alive = false; });
  const lowBefore = low.hp, highBefore = high.hp;
  // Pin the RNG so a crit on only one of the two targets cannot mask the +40% execute bonus.
  const realRandom = Math.random; Math.random = () => 0.999;
  let res;
  try { res = f.g.BattleEngine.playerAction(f.battle, { kind: 'skill', skillId: 'harvest_sweep', targetIndex: 0 }); }
  finally { Math.random = realRandom; }
  assert.ok(!res.events.some((e) => e.type === 'invalid'));
  const lowLoss = lowBefore - low.hp, highLoss = highBefore - high.hp;
  assert.ok(lowLoss > 0 && highLoss > 0, 'both enemies were hit');
  assert.ok(lowLoss / highLoss > 1.2, 'the weakened enemy takes the execute bonus (+40%, minus variance)');
});

test('boss floors pay more gold than the neighbouring ordinary floor', () => {
  const g = loadGame(), S = g.State, BE = g.BattleEngine;
  const run = S.createRun('nightmare', 'blade', 0); S.current = run;
  const avg = (floor) => { run.currentFloor = floor; let t = 0; for (let i = 0; i < 40; i++) t += BE.getGoldReward(BE.createBattle(run, floor, false), 1); return t / 40; };
  for (const f of [30, 50, 70, 90]) assert.ok(avg(f) > avg(f + 1) * 0.9, 'mini-boss floor ' + f);
});

test('Shadow Volley is physical: it scales with ATK, not MAG', () => {
  const f = fixture('shadowhunter');
  const p = f.battle.player; assert.ok(p.atk > p.mag * 3);
  const res = f.g.BattleEngine.playerAction(f.battle, { kind: 'skill', skillId: 'shadow_volley', targetIndex: 0 });
  assert.ok(res.events.filter((e) => e.type === 'hit').length >= 1);
  assert.equal(f.g.Data.getSkill('shadow_volley').element, 'phys');
});

test('Divine Mercy is cheaper per HP than Greater Heal', () => {
  const { Data: D } = loadGame();
  const dm = D.getSkill('divine_mercy'), gh = D.getSkill('greater_heal');
  assert.ok(dm.cost / dm.power < gh.cost / gh.power);
});

test('sell price freshness tracks the new tier ceilings', () => {
  const { Formulas: F, Data: D } = loadGame();
  const t6 = D.getItem('w_resonant_edge');
  assert.ok(F.sellPrice(t6, 59) > F.sellPrice(t6, 100), 'tier 6 gear ages once you pass floor 59');
  assert.equal(F.sellPrice(t6, 45), F.sellPrice(t6, 59));
});
