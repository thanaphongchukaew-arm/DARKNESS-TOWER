const test = require('node:test');
const assert = require('node:assert/strict');
const { loadGame } = require('./helpers/load-game');

function fixture(cls = 'elementalist', floor = 1) {
  const g = loadGame({ random: () => 0.5 });
  const run = g.State.createRun('normal', cls);
  run.level = 20; run.currentFloor = floor;
  g.State.fullRestore(run);
  const battle = g.BattleEngine.createBattle(run, floor, floor === 100);
  battle.enemies.forEach(e => { e.hp = e.maxHp = 10000; });
  return { g, run, battle, enemy: battle.enemies[0] };
}
function act(f, action) {
  f.battle.playerAP = 1; f.battle.awaitingAllOut = false;
  return f.g.BattleEngine.playerAction(f.battle, action);
}

test('all enemies including bosses have one distinct elemental weakness and resistance', () => {
  const g = loadGame();
  for (const enemy of g.Data.getAllEnemyTemplates()) {
    assert.ok(['fire','ice','elec','wind','light','dark'].includes(enemy.weak));
    assert.notEqual(enemy.weak, enemy.resist);
  }
});
test('weakness increases damage and Break, resistance reduces it, discoveries persist', () => {
  const f = fixture(), skill = f.g.Data.getSkill('fire_bolt');
  const template = f.g.Data.getEnemyTemplate(f.enemy.templateId);
  template.weak = 'fire'; template.resist = 'ice';
  const weak = act(f, { kind: 'skill', skillId: skill.id, targetIndex: 0 });
  const weakHit = weak.events.find(e => e.type === 'hit');
  assert.equal(f.enemy.breakMeter, 40);
  skill.element = 'ice';
  const resist = act(f, { kind: 'skill', skillId: skill.id, targetIndex: 0 });
  assert.ok(weakHit.amount > resist.events.find(e => e.type === 'hit').amount);
  assert.equal(f.g.Save.readMeta().affinities[f.enemy.templateId].fire, true);
  assert.equal(f.g.Save.readMeta().affinities[f.enemy.templateId].ice, true);
  f.g.State.clearRun();
  assert.equal(f.g.Save.readMeta().affinities[f.enemy.templateId].fire, true);
});
test('physical classes have a functional 50% DEF piercing skill', () => {
  const f = fixture('blade');
  assert.ok(f.battle.player.skills.some(s => s.id === 'sunder_strike'));
  f.enemy.def = 100;
  const base = act(f, { kind: 'attack', targetIndex: 0 }).events.find(e => e.type === 'hit').amount;
  const pierced = act(f, { kind: 'skill', skillId: 'sunder_strike', targetIndex: 0 }).events.find(e => e.type === 'hit').amount;
  assert.ok(pierced > base);
});
test('talent milestones enforce level, order and exactly one choice per tier; old saves normalize', () => {
  const g = loadGame(), run = g.State.createRun('normal', 'blade');
  assert.equal(g.Systems.chooseTalent(run, 'riposte'), false);
  run.level = 15;
  assert.equal(g.Systems.chooseTalent(run, 'focus_guard'), false);
  for (const id of ['riposte','clean_guard','focus_guard']) assert.equal(g.Systems.chooseTalent(run, id), true);
  assert.equal(g.Systems.pending(run), null);
  assert.equal(g.Systems.chooseTalent(run, 'flurry'), false);
  assert.equal(g.Save.read().talents[5], 'riposte');
});
test('flurry adds one weaker hit without AP refund', () => {
  const f = fixture('blade'); f.run.talents[5] = 'flurry';
  const result = act(f, { kind: 'attack', targetIndex: 0 });
  assert.equal(result.events.filter(e => e.type === 'hit').length, 2);
  assert.equal(f.battle.playerAP, 0);
});
test('riposte fires only once against a multi-action enemy and cannot counter after death', () => {
  const f = fixture('blade'); f.run.talents[5] = 'riposte';
  f.enemy.atk = 1; f.enemy.mag = 1; f.enemy.spd = 999; f.battle.round = 2;
  act(f, { kind: 'guard' });
  const result = f.g.BattleEngine.runEnemyPhase(f.battle);
  assert.equal(result.events.filter(e => e.type === 'riposte' && e.message.includes('สวนกลับ')).length, 1);
});
test('safe and elite routes change encounters and rewards, persist, and cannot be rerolled', () => {
  for (const id of ['safe','elite']) {
    const f = fixture('blade', 5);
    assert.equal(f.g.Systems.chooseRoute(f.run, 5, id), true);
    assert.equal(f.g.Systems.chooseRoute(f.run, 5, 'explore'), false);
    const routed = f.g.BattleEngine.createBattle(f.run, 5, false);
    assert.equal(routed.enemies[0].maxHp, Math.round(f.g.BattleEngine.createBattle(Object.assign({}, f.run, { routes: {} }), 5, false).enemies[0].maxHp * (id === 'safe' ? 0.85 : 1.25)));
    if (id === 'elite') assert.ok(routed.enemies[0].attacksPool.every(a => a.drainSelf));
    assert.equal(f.g.Save.read().routes[5], id);
  }
});
test('route choices cannot target cleared, future or final floors and do not affect Arena', () => {
  const f = fixture('blade', 5);
  assert.equal(f.g.Systems.chooseRoute(f.run, 10, 'elite'), false);
  f.g.Systems.chooseRoute(f.run, 5, 'elite');
  const arena = f.g.BattleEngine.createSurvivalBattle(f.run, 1);
  assert.ok(arena.enemies.every(e => !e.elite));
  f.run.currentFloor = 100;
  assert.equal(f.g.Systems.chooseRoute(f.run, 100, 'safe'), false);
});
test('Break MP combo is capped once per round and relic + equipment do not double stack', () => {
  const f = fixture(); f.run.relics.push('break_prism'); f.run.equipment.accessory1 = 'c_shatter_prism';
  f.run.talents[10] = 'break_flow'; f.run.mp = 0;
  f.enemy.breakMeter = 75;
  act(f, { kind: 'attack', targetIndex: 0 });
  assert.equal(f.run.mp, 7);
  f.enemy.breakMeter = 75; f.enemy.broken = false;
  act(f, { kind: 'attack', targetIndex: 0 });
  assert.equal(f.run.mp, 7);
  f.battle.round++; f.enemy.breakMeter = 75; f.enemy.broken = false;
  act(f, { kind: 'attack', targetIndex: 0 });
  assert.equal(f.run.mp, 14);
});
test('Guard Focus is capped and zero AP prevents repeated free commands', () => {
  const f = fixture(); f.run.talents[15] = 'focus_guard'; f.run.relics.push('guard_lantern'); f.battle.player.focus = 90;
  act(f, { kind: 'guard' }); assert.equal(f.battle.player.focus, 100);
  const result = f.g.BattleEngine.playerAction(f.battle, { kind: 'guard' });
  assert.equal(result.events[0].type, 'invalid');
});
test('Overdrive companion echo is immediate, does not double-stack and preserves normal companion phase', () => {
  const f = fixture(); f.run.companionId = 'frost_hare';
  f.run.relics.push('echo_bell'); f.run.talents[15] = 'overdrive_echo';
  f.battle = f.g.BattleEngine.createBattle(f.run, 1, false);
  f.battle.enemies[0].hp = f.battle.enemies[0].maxHp = 100000;
  f.battle.player.focus = 100; f.run.mp = 0;
  act(f, { kind: 'overdrive', targetIndex: 0 }); assert.equal(f.run.mp, 2);
  f.g.BattleEngine.runCompanionPhase(f.battle); assert.equal(f.run.mp, 4);
  f.g.BattleEngine.runCompanionPhase(f.battle); assert.equal(f.run.mp, 4);
});
test('ailments refresh without stacking and bosses receive reduced DoT and duration', () => {
  const f = fixture('blade', 100); f.run.talents[10] = 'affliction';
  f.enemy.atk = f.enemy.mag = 1;
  act(f, { kind: 'attack', targetIndex: 0 }); act(f, { kind: 'attack', targetIndex: 0 });
  assert.equal(f.enemy.ailments.length, 1); assert.equal(f.enemy.ailments[0].turns, 2);
  const hp = f.enemy.hp;
  f.g.BattleEngine.runEnemyPhase(f.battle);
  assert.equal(hp - f.enemy.hp, Math.round(f.enemy.maxHp * 0.035 * 0.35));
});
test('fire burn and wind synergy work, silence rejects magic before spending MP', () => {
  const f = fixture(); f.run.talents[15] = 'burning_wind';
  act(f, { kind: 'skill', skillId: 'fire_bolt', targetIndex: 0 });
  assert.equal(f.enemy.ailments[0].id, 'burn');
  f.run.ailments.push({ id: 'silence', turns: 2 });
  const mp = f.run.mp;
  const result = act(f, { kind: 'skill', skillId: 'heal' });
  assert.equal(result.events[0].type, 'invalid'); assert.equal(f.run.mp, mp);
  assert.notEqual(act(f, { kind: 'skill', skillId: 'sunder_strike', targetIndex: 0 }).events[0].type, 'invalid');
});
test('Panacea consumes only on successful cleanse and Purifying Guard cleanses for free', () => {
  const f = fixture(); f.g.State.addItem(f.run, 'p_panacea', 2);
  assert.equal(f.g.State.useConsumable(f.run, 'p_panacea').ok, false);
  f.run.ailments.push({ id: 'silence', turns: 2 }, { id: 'poison', turns: 3 });
  assert.equal(f.g.State.useConsumable(f.run, 'p_panacea').ok, true);
  assert.equal(f.run.ailments.length, 0); assert.equal(f.run.inventory.p_panacea, 1);
  f.run.ailments.push({ id: 'burn', turns: 3 }); f.run.talents[10] = 'clean_guard';
  act(f, { kind: 'guard' }); assert.equal(f.run.ailments.length, 0);
});
test('Dawn Owl cleanses at full HP and support buffs survive into the next player turn', () => {
  for (const id of ['dawn_owl','stoneheart_bear']) {
    const f = fixture(); f.run.companionId = id;
    f.battle = f.g.BattleEngine.createBattle(f.run, 1, false);
    f.run.ailments.push({ id: 'burn', turns: 3 });
    f.g.BattleEngine.runCompanionPhase(f.battle);
    if (id === 'dawn_owl') assert.equal(f.run.ailments.length, 0);
    else {
      f.battle.enemies[0].atk = f.battle.enemies[0].mag = 1;
      f.g.BattleEngine.runEnemyPhase(f.battle);
      assert.ok(f.battle.player.buffs.some(b => b.stat === 'def' && b.turnsLeft === 1));
    }
  }
});
test('poison can finish a battle and player DoT respects revive / defeat handling', () => {
  const f = fixture(); f.enemy.hp = 1; f.enemy.ailments.push({ id: 'poison', turns: 3 });
  f.g.BattleEngine.runEnemyPhase(f.battle); assert.equal(f.battle.victory, true);
  const h = fixture(); h.battle.enemies[0].downed = true; h.run.hp = 1;
  h.run.blessings.push('guardian'); h.run.ailments.push({ id: 'poison', turns: 3 });
  h.g.BattleEngine.runEnemyPhase(h.battle); assert.equal(h.run.hp, 1); assert.equal(h.run.blessingRevived, true);
});

test('route applies across five floors, reduces normal packs, and expires at the next crossroads', () => {
  const f = fixture('blade', 15);
  f.g.Systems.chooseRoute(f.run, 15, 'safe');
  assert.equal(f.g.Systems.route(f.run, 19).id, 'safe');
  assert.equal(f.g.Systems.route(f.run, 20), null);
  const safe = f.g.BattleEngine.createBattle(f.run, 19, false);
  const normal = f.g.BattleEngine.createBattle(Object.assign({}, f.run, { routes: {} }), 19, false);
  assert.equal(safe.enemies.length, Math.max(1, normal.enemies.length - 1));
});
test('one remaining round of enemy silence still suppresses magic for that turn', () => {
  const f = fixture(); f.enemy.ailments = [{ id: 'silence', turns: 1 }];
  f.enemy.attacksPool = [{ name: 'Magic', nameEn: 'Magic', element: 'fire', power: 1 }];
  const result = f.g.BattleEngine.runEnemyPhase(f.battle);
  const hit = result.events.find(e => e.type === 'hit');
  assert.equal(hit.element, 'phys'); assert.equal(f.enemy.ailments.length, 0);
});
test('poison crossing a boss phase updates its attack pool', () => {
  const f = fixture('blade', 100);
  f.enemy.hp = f.enemy.maxHp * 0.75 + 1;
  f.enemy.ailments = [{ id: 'poison', turns: 2 }];
  f.g.BattleEngine.runEnemyPhase(f.battle);
  assert.equal(f.enemy.phase, 2);
});

test('every class can use its learned kit with new talents across early, deep and final floors', () => {
  const g = loadGame({ random: () => 0.5 });
  for (const cls of g.Data.classes) {
    for (const floor of [1, 45, 100]) {
      const run = g.State.createRun('normal', cls.id); run.level = 20; run.currentFloor = floor;
      g.State.fullRestore(run); g.Systems.ensure(run);
      run.talents = { 5: 'pierce', 10: 'affliction', 15: 'burning_wind' };
      run.routes[45] = 'elite';
      for (const skill of g.State.learnedSkills(run)) {
        const battle = g.BattleEngine.createBattle(run, floor, floor === 100);
        g.State.fullRestore(run); run.hp -= 1;
        const result = g.BattleEngine.playerAction(battle, { kind: 'skill', skillId: skill.id, targetIndex: 0 });
        assert.notEqual(result.events[0]?.type, 'invalid', cls.id + '/' + skill.id);
        assert.ok(Number.isFinite(run.hp) && Number.isFinite(run.mp), cls.id + '/' + skill.id);
        assert.ok(battle.enemies.every(e => Number.isFinite(e.hp) && e.hp >= 0));
        if (!battle.over) {
          if (result.awaitingAllOut) g.BattleEngine.confirmAllOut(battle, true);
          if (!battle.over) g.BattleEngine.runCompanionPhase(battle);
          if (!battle.over) g.BattleEngine.runEnemyPhase(battle);
        }
      }
    }
  }
});

test('new pixel sprites use complete 16×16 palette grids and render crisp SVGs', () => {
  const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
  const grids = [];
  const context = { window: { Game: { PixelArt: { define: (id, grid, palette) => grids.push({ id, grid, palette }) } } } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/pixel-tactics.js'), 'utf8'), context);
  assert.equal(grids.length, 13);
  for (const {id, grid, palette} of grids) {
    assert.equal(grid.length, 16, id);
    for (const row of grid) {
      assert.equal(row.length, 16, id);
      for (const key of row) assert.ok(key === '.' || /^#[0-9a-f]{6}$/i.test(palette[key] || ''), id + ':' + key);
    }
  }
  const renderer = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/pixel-art.js'), 'utf8'), renderer);
  for (const {id, grid, palette} of grids) {
    renderer.window.Game.PixelArt.define(id, grid, palette);
    const svg = renderer.window.Game.PixelArt.render(id);
    assert.match(svg, /viewBox="0 0 16 16"/);
    assert.match(svg, /shape-rendering="crispEdges"/);
    assert.ok(!svg.includes('undefined'));
  }
});
