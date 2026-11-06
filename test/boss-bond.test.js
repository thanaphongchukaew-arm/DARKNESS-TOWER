const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { loadGame } = require('./helpers/load-game');

function fixture(floor = 100, companion = null) {
  const g = loadGame({ random: () => 0.5 });
  const run = g.State.createRun('normal', 'elementalist');
  run.level = 30; run.currentFloor = floor; g.State.fullRestore(run);
  if (companion) { run.companionId = companion; }
  const battle = g.BattleEngine.createBattle(run, floor, floor === 100);
  return { g, run, battle, boss: battle.enemies[0] };
}
function attack(f) { f.battle.playerAP = 1; f.battle.awaitingAllOut = false; return f.g.BattleEngine.playerAction(f.battle, { kind: 'attack', targetIndex: 0 }); }
function setBond(g, id, pts) { const m = g.Save.readMeta(); m.bonds = { [id]: pts }; g.Save.writeMeta(m); }

test('every boss and mini-boss phase carries an affinity shift and a signature attack', () => {
  const g = loadGame();
  const all = [g.Data.boss, ...Object.values(g.Data.minibosses)];
  for (const b of all) {
    assert.ok(b.phases.length >= 1, b.id);
    for (const p of b.phases) {
      assert.ok(p.shift && ['companion', 'mana', 'buffs'].includes(p.shift.focus), b.id);
      assert.ok(p.shift.flip || (p.shift.weak && p.shift.resist), b.id);
      assert.ok(p.attacks.some(a => a.shiftHit), b.id + ' needs a signature attack');
    }
  }
  assert.equal(g.Data.boss.phases.length, 3);
});

test('crossing a phase threshold replaces the boss weakness and announces it', () => {
  const f = fixture(100);
  f.boss.hp = Math.floor(f.boss.maxHp * 0.75) + 1;
  const res = attack(f);
  const ev = res.events.find(e => e.type === 'bossPhaseChange');
  assert.ok(ev && ev.shift, 'phase event carries shift');
  assert.equal(f.boss.phase, 2);
  assert.equal(f.boss.weakEl, 'ice');
  assert.equal(f.boss.resistEl, 'fire');
  assert.equal(f.boss.shiftFocus, 'buffs');
  // the new weakness is really used for damage: an ice hit is boosted, a fire hit resisted
  assert.match(ev.message, /ice|น้ำแข็ง|Ice/i);
});

test('mini-boss flips its own affinity at half HP', () => {
  const f = fixture(10);
  const tpl = f.g.Data.getEnemyTemplate(f.boss.templateId);
  f.boss.hp = Math.floor(f.boss.maxHp * 0.49);
  f.battle.player.atk = f.battle.player.mag = 10;
  f.boss.hp = Math.floor(f.boss.maxHp * 0.5);
  attack(f);
  assert.equal(f.boss.phase, 2);
  assert.equal(f.boss.weakEl, tpl.resist);
  assert.equal(f.boss.resistEl, tpl.weak);
});

function shifted(f, focus) {
  f.boss.phase = 2; f.boss.shiftFocus = focus;
  f.boss.attacksPool = [{ name: 'x', nameEn: 'x', element: 'phys', power: 0.5, target: 'single', weight: 1, shiftHit: true }];
  f.run.hp = 1e6; f.battle.player.maxHp = 1e6;
}

test('buff-stripping focus removes exactly one positive buff', () => {
  const f = fixture(100);
  shifted(f, 'buffs');
  f.battle.player.buffs = [{ stat: 'atk', amount: 0.3, turnsLeft: 3 }, { stat: 'def', amount: 0.3, turnsLeft: 3 }, { stat: 'spd', amount: -0.2, turnsLeft: 3 }];
  const res = f.g.BattleEngine.runEnemyPhase(f.battle);
  assert.ok(res.events.some(e => e.type === 'shiftFocus' && e.focus === 'buffs'));
  assert.equal(f.battle.player.buffs.filter(b => b.amount > 0).length, 1);
  assert.equal(f.battle.player.buffs.filter(b => b.amount < 0).length, 1);
});

test('mana-drain focus takes 8% max MP and never goes below zero', () => {
  const f = fixture(100);
  shifted(f, 'mana');
  f.run.mp = f.battle.player.maxMp;
  const before = f.run.mp;
  f.g.BattleEngine.runEnemyPhase(f.battle);
  assert.equal(before - f.run.mp, Math.max(1, Math.round(f.battle.player.maxMp * 0.08)));
  f.battle.round = 1; f.boss.downed = false; f.run.mp = 0; f.battle.over = false;
  const res = f.g.BattleEngine.runEnemyPhase(f.battle);
  assert.equal(f.run.mp, 0);
  assert.equal(res.events.filter(e => e.type === 'shiftFocus').length, 0);
});

test('companion focus pins the companion for the next round only', () => {
  const f = fixture(100, 'ember_fox');
  shifted(f, 'companion');
  const round = f.battle.round;
  f.g.BattleEngine.runEnemyPhase(f.battle);
  assert.equal(f.battle.round, round + 1);
  assert.equal(f.battle.companionSnaredRound, round + 1);
  const pinned = f.g.BattleEngine.runCompanionPhase(f.battle);
  assert.equal(pinned.events.map(e => e.type).join(), 'companionSnared');
  f.battle.round += 1;
  const free = f.g.BattleEngine.runCompanionPhase(f.battle);
  assert.ok(free.events.some(e => e.type === 'companionHit'));
});

test('without a companion the pin focus does nothing', () => {
  const f = fixture(100);
  shifted(f, 'companion');
  const res = f.g.BattleEngine.runEnemyPhase(f.battle);
  assert.equal(res.events.filter(e => e.type === 'shiftFocus').length, 0);
});

test('blood-altar max HP penalty shrinks max HP, clamps vitals and stacks', () => {
  const g = loadGame();
  const run = g.State.createRun('normal', 'blade');
  g.State.fullRestore(run);
  const max = g.State.getMaxHp(run);
  run.maxHpPenalty = 0.16; g.State.clampVitals(run);
  assert.equal(g.State.getMaxHp(run), Math.round(max * 0.84));
  assert.equal(run.hp, g.State.getMaxHp(run));
  const events = g.Data.getEvent('bloodAltar');
  for (const id of events.minorRunes.concat(events.rareRunes)) assert.equal(g.Data.getItem(id).kind, 'rune', id);
});

test('bond grows only on victory with a companion; bosses count more; thresholds level up', () => {
  const g = loadGame();
  const run = g.State.createRun('normal', 'blade');
  assert.equal(g.Bond.award(run, { victory: true, floor: 3 }), null);
  run.companionId = 'dawn_owl';
  assert.equal(g.Bond.award(run, { victory: false, floor: 3 }), null);
  let r = g.Bond.award(run, { victory: true, floor: 3 });
  assert.equal([r.gained, r.level, r.leveled].join(), '1,1,false');
  r = g.Bond.award(run, { victory: true, floor: 5 });
  assert.equal(r.gained, 2);
  setBond(g, 'dawn_owl', 5);
  r = g.Bond.award(run, { victory: true, floor: 7 });
  assert.equal([r.points, r.level, r.leveled].join(), '6,2,true');
  setBond(g, 'dawn_owl', 12);
  r = g.Bond.award(run, { victory: true, floor: 100, isBoss: true });
  assert.equal([r.level, r.leveled].join(), '3,true');
  assert.ok(g.Bond.story('dawn_owl', 3, run).text.text);
  assert.equal(g.Bond.story('dawn_owl', 1, run), null);
});

test('duo move needs bond level 2, works once per battle and costs the action', () => {
  const f = fixture(15, 'ember_fox');
  assert.equal(f.g.Bond.duoFor(f.battle).ready, false);
  assert.equal(f.g.Bond.duoFor(f.battle).locked, true);
  f.battle.playerAP = 1;
  assert.equal(f.g.BattleEngine.playerAction(f.battle, { kind: 'duo', targetIndex: 0 }).events.map(e => e.type).join(), 'invalid');
  setBond(f.g, 'ember_fox', 6);
  f.battle.enemies.forEach(e => { e.hp = e.maxHp = 100000; });
  f.battle.playerAP = 1;
  assert.equal(f.g.Bond.duoFor(f.battle).ready, true);
  const res = f.g.BattleEngine.playerAction(f.battle, { kind: 'duo', targetIndex: 0 });
  assert.ok(res.events.some(e => e.type === 'duoStart'));
  const hit = res.events.find(e => e.type === 'companionHit');
  assert.ok(hit.amount > 0 && f.battle.enemies[0].hp === 100000 - hit.amount);
  assert.equal(res.playerAP, 0);
  f.battle.playerAP = 1;
  assert.equal(f.g.Bond.duoFor(f.battle).ready, false);
  assert.equal(f.g.BattleEngine.playerAction(f.battle, { kind: 'duo', targetIndex: 0 }).events.map(e => e.type).join(), 'invalid');
});

test('each duo role has its own effect and level 3 / trusted NPC strengthen it', () => {
  const heal = fixture(15, 'dawn_owl'); setBond(heal.g, 'dawn_owl', 6);
  heal.run.hp = 1; heal.run.ailments = [{ id: 'poison', turns: 3 }]; heal.battle.playerAP = 1;
  const healed = heal.g.BattleEngine.playerAction(heal.battle, { kind: 'duo' });
  assert.ok(heal.run.hp > 1 && heal.run.ailments.length === 0 && healed.events.some(e => e.type === 'companionHeal'));

  const guard = fixture(15, 'stoneheart_bear'); setBond(guard.g, 'stoneheart_bear', 6); guard.battle.playerAP = 1;
  guard.g.BattleEngine.playerAction(guard.battle, { kind: 'duo' });
  assert.ok(guard.battle.player.buffs.some(b => b.stat === 'def' && b.amount > 0) && guard.battle.player.guarding);

  const boost = fixture(15, 'storm_sprite'); setBond(boost.g, 'storm_sprite', 6); boost.battle.playerAP = 1;
  const after = boost.g.BattleEngine.playerAction(boost.battle, { kind: 'duo' });
  assert.equal(after.playerAP, 1, 'buffer duo refunds its action');
  assert.ok(boost.battle.player.focus > 0);

  const base = boost.g.Bond.mult(boost.run, 'storm_sprite');
  setBond(boost.g, 'storm_sprite', 14);
  assert.equal(boost.g.Bond.mult(boost.run, 'storm_sprite'), base * 1.35);
  boost.run.story = { people: { lyra: { chapter: 1, trust: 2 } } };
  assert.ok(Math.abs(boost.g.Bond.mult(boost.run, 'storm_sprite') - 1.35 * 1.1) < 1e-9);
});

test('a pinned companion cannot use the duo move that round', () => {
  const f = fixture(15, 'ember_fox'); setBond(f.g, 'ember_fox', 6);
  f.battle.companionSnaredRound = f.battle.round; f.battle.playerAP = 1;
  assert.equal(f.g.Bond.duoFor(f.battle).ready, false);
  assert.equal(f.g.Bond.duoFor(f.battle).snared, true);
});

test('every new illustration is a complete 24x24 palette grid and is referenced art', () => {
  const defs = {};
  vm.runInNewContext(fs.readFileSync('js/pixel-bonds.js', 'utf8'), { window: { Game: { PixelArt: { define: (id, grid, palette) => { defs[id] = { grid, palette }; } } } } });
  const need = ['eventBloodAltar', 'eventNightCamp', 'bondHeart', 'duoStrike', 'duoHeal', 'duoGuard', 'duoBoost', 'shiftFlip', 'shiftHunt', 'shiftDrain', 'shiftStrip'];
  for (const id of need) {
    assert.ok(defs[id], id);
    assert.equal(defs[id].grid.length, 24, id);
    for (const row of defs[id].grid) { assert.equal(row.length, 24, id); for (const c of row) if (c !== '.') assert.ok(defs[id].palette[c], id + ':' + c); }
  }
  const g = loadGame();
  for (const e of ['bloodAltar', 'nightCamp']) assert.ok(defs[g.Data.getEvent(e).icon]);
});
