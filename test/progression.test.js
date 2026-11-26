// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Level progression and the gold sink: skills unlock across the whole level range and grow in
// rank (Data.skillRank), and gear slots can be forged +1..+10 for gold (State.enhanceSlot).
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadGame } = require('./helpers/load-game');

test('every class keeps learning skills until Lv 45, and starts with only a few', () => {
  const g = loadGame(), D = g.Data;
  for (const cls of D.classes) {
    const own = D.skills.filter((s) => s.classOnly === cls.id && s.kind !== 'mech' && !s.form);
    assert.ok(own.length >= 5, cls.id);
    assert.equal(Math.max(...own.map((s) => s.minLevel)), 45, cls.id + ' capstone');
    assert.ok(own.filter((s) => s.minLevel <= 5).length <= 2, cls.id + ' starts with too many');
  }
});

test('a skill ranks up 10 and 25 levels after it is learned; Attack and commands have no rank', () => {
  const D = loadGame().Data, s = D.getSkill('fire_bolt');
  assert.equal(D.skillRank(s, s.minLevel), 1);
  assert.equal(D.skillRank(s, s.minLevel + 10), 2);
  assert.equal(D.skillRank(s, s.minLevel + 25), 3);
  assert.ok(D.skillPowerMult(s, s.minLevel) < 1 && D.skillPowerMult(s, s.minLevel + 25) > 1);
  assert.equal(D.nextRankLevel(s, s.minLevel), s.minLevel + 10);
  assert.equal(D.nextRankLevel(s, 99), null);
  assert.equal(D.skillRank(D.getSkill('attack'), 50), 0);
  assert.equal(D.skillRank(D.getSkill('samurai_sheathe'), 50), 0);
});

test('rank raises skill damage but not its stagger', () => {
  const g = loadGame({ random: () => 0.5 });
  const hitAt = (level) => {
    const run = g.State.createRun('normal', 'elementalist'); run.level = level; g.State.fullRestore(run);
    const b = g.BattleEngine.createBattle(run, 1, false);
    const e = b.enemies[0]; e.hp = e.maxHp = 1e6; e.def = e.res = 10; e.breakMeter = 0;
    b.player.mag = 100; b.player.atk = 100; b.player.luk = 0;
    const res = g.BattleEngine.playerAction(b, { kind: 'skill', skillId: 'fire_bolt', targetIndex: 0 });
    return { dmg: res.events.find((x) => x.type === 'hit').amount, brk: e.breakMeter };
  };
  const r1 = hitAt(1), r3 = hitAt(30);
  assert.ok(r3.dmg > r1.dmg * 1.3, 'Rank III hits harder than Rank I');
  assert.equal(r3.brk, r1.brk, 'stagger follows the move, not the rank');
});

test('level-up news lists new skills and rank-ups', () => {
  const g = loadGame(), run = g.State.createRun('normal', 'blade');
  run.level = 10;
  const news = g.State.levelUpNews(run, 9);
  assert.ok(news.learned.some((s) => s.id === 'armor_piercer'));
  assert.ok(news.next && news.next.minLevel > 10);
  run.level = 11;
  assert.ok(g.State.levelUpNews(run, 10).ranked.some((r) => r.skill.id === 'cross_slash' && r.rank === 2));
});

test('forging a slot costs gold, raises the equipped item stats, and stays with the slot', () => {
  const g = loadGame(), S = g.State, F = g.Formulas;
  const run = S.createRun('normal', 'blade');
  S.addItem(run, 'w_knight_sword', 1); S.equip(run, 'w_knight_sword', 'weapon');
  assert.equal(S.enhancePrice(run, 'armor'), null, 'an empty slot cannot be forged');
  const atk0 = S.getTotalStats(run).atk;
  run.gold = 0;
  assert.equal(S.enhanceSlot(run, 'weapon'), false, 'needs gold');
  run.gold = 10000;
  const price = S.enhancePrice(run, 'weapon');
  assert.equal(price, F.enhanceCost(0));
  assert.ok(S.enhanceSlot(run, 'weapon'));
  assert.equal(run.gold, 10000 - price);
  assert.equal(S.enhanceLevel(run, 'weapon'), 1);
  assert.ok(S.getTotalStats(run).atk > atk0);
  assert.ok(F.enhanceCost(1) > price, 'each level costs more');
  S.addItem(run, 'w_rusty_blade', 1); S.equip(run, 'w_rusty_blade', 'weapon');
  assert.equal(S.enhanceLevel(run, 'weapon'), 1, 'the +1 stays with the slot');
  run.gold = 1e9;
  for (let i = 0; i < 20; i++) S.enhanceSlot(run, 'weapon');
  assert.equal(S.enhanceLevel(run, 'weapon'), F.ENHANCE_MAX);
  assert.equal(S.enhancePrice(run, 'weapon'), null);
});

test('an old save gets an empty enhancement table', () => {
  const g = loadGame(), run = g.State.createRun('normal', 'blade');
  delete run.enhance; run.enhance = undefined;
  g.State.normalizeRunExtras(run);
  assert.equal(g.State.enhanceLevel(run, 'weapon'), 0);
  run.enhance.weapon = 'junk'; g.State.normalizeRunExtras(run);
  assert.equal(run.enhance.weapon, 0);
});
