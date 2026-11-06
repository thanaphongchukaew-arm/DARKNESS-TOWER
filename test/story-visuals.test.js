const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {loadGame} = require('./helpers/load-game');
function fixture(floor = 3) {
  const g = loadGame({random: () => 0.5}), run = g.State.createRun('normal','blade');
  run.level = 20; run.currentFloor = floor; run.gold = 1000; g.State.fullRestore(run);
  return {g,run};
}
function resolveAt(f, floor, option) {
  f.run.currentFloor = floor;
  const event = f.g.Story.begin(f.run, floor);
  assert.ok(event, 'expected story on floor ' + floor);
  const result = f.g.Story.resolve(f.run, event.arc.id, option);
  assert.ok(result, 'expected valid choice ' + option);
  return result;
}
test('story migration, saved active encounter, and idempotent rewards survive reload', () => {
  const f = fixture();
  assert.equal(f.run.story, undefined);
  const event = f.g.Story.begin(f.run, 3);
  assert.equal(event.arc.id,'mira');
  const loaded = f.g.Save.read(); f.g.State.current = loaded;
  assert.equal(f.g.Story.next(loaded, 3).index,0);
  const hp = loaded.hp;
  assert.ok(f.g.Story.resolve(loaded,'mira','lift'));
  assert.ok(loaded.hp < hp && loaded.hp > 0);
  assert.equal(f.g.Story.resolve(loaded,'mira','lift'),null);
  assert.equal(f.g.Story.next(loaded,3),null);
  assert.equal(f.g.Save.read().story.people.mira.trust,2);
  const fresh = f.g.State.createRun('normal','blade');
  assert.equal(f.g.Story.ensure(fresh).people.mira.chapter,0);
});
test('all nine chapters play in order with consequences, exclusive relics and boss support', () => {
  const f = fixture();
  const plan = {3:'lift',8:'guide',13:'mark',18:'gift',28:'oath',38:'research',48:'lantern',68:'stand',88:'astrolabe'};
  for (let floor=1;floor<=99;floor++) {
    f.run.currentFloor = floor;
    const next = f.g.Story.next(f.run,floor);
    if (plan[floor]) {
      assert.ok(next, 'floor '+floor);
      resolveAt(f,floor,plan[floor]);
    } else assert.equal(next,null,'no unexpected chapter at '+floor);
  }
  for (const state of Object.values(f.run.story.people)) assert.equal(state.chapter,3);
  assert.equal(f.g.Story.supportRounds(f.run),5);
  for (const id of ['mira_lantern','orin_standard','lyra_astrolabe']) assert.ok(f.run.relics.includes(id));
  const discovered = f.g.Save.readMeta().affinities;
  for (const enemy of f.g.Data.getEnemiesByTier(f.g.Formulas.tierForFloor(38))) {
    assert.equal(discovered[enemy.id][enemy.weak],true);assert.equal(discovered[enemy.id][enemy.resist],true);
  }
});
test('refusing early help changes trust-gated choices but does not block later chapters', () => {
  const f = fixture();resolveAt(f,3,'leave');
  // Other arcs are marked complete here to isolate Mira's later decisions.
  for (const id of ['orin','lyra']) f.g.Story.ensure(f.run).people[id].chapter = 3;
  f.run.currentFloor = 18;f.g.Story.begin(f.run,18);
  assert.equal(f.g.Story.resolve(f.run,'mira','gift'),null);
  assert.ok(f.g.Story.resolve(f.run,'mira','trade'));
  assert.equal(f.run.story.people.mira.trust,1);
  f.run.currentFloor = 48;f.g.Story.begin(f.run,48);
  assert.equal(f.g.Story.resolve(f.run,'mira','lantern'),null);
  assert.ok(f.g.Story.resolve(f.run,'mira','supplies'));
  assert.equal(f.run.inventory.p_hp_pristine,2);
});
test('invalid / unaffordable / stale choices do not change resources or story state', () => {
  const f = fixture();f.g.Story.begin(f.run,3);
  const hp=f.run.hp;
  assert.equal(f.g.Story.resolve(f.run,'mira','forged'),null);
  assert.equal(f.g.Story.resolve(f.run,'orin','guide'),null);
  f.g.State.removeItem(f.run,'p_hp_small',99);
  assert.equal(f.g.Story.resolve(f.run,'mira','medicine'),null);
  f.run.hp=1;assert.equal(f.g.Story.resolve(f.run,'mira','lift'),null);
  assert.equal(f.run.hp,1);f.run.hp=hp;f.run.currentFloor=4;
  assert.equal(f.g.Story.resolve(f.run,'mira','lift'),null);
  assert.equal(f.run.story.people.mira.chapter,0);
});
test('overdue chapters on old saves are offered one per floor with gaps within each arc', () => {
  const f = fixture(90);
  resolveAt(f,90,'leave');assert.equal(f.g.Story.next(f.run,90),null);
  assert.equal(resolveAt(f,91,'leave').arc.id,'orin');
  assert.equal(resolveAt(f,92,'leave').arc.id,'lyra');
  f.run.currentFloor=93;assert.equal(f.g.Story.next(f.run,93),null);
  assert.equal(resolveAt(f,95,'leave').arc.id,'mira');
  assert.equal(f.run.story.people.mira.chapter,2);
});
test('NPC support works without a companion, once per round, with a strict opening-round cap', () => {
  const f=fixture(5);f.g.Story.ensure(f.run).orinRounds=3;
  const battle=f.g.BattleEngine.createBattle(f.run,5,false);battle.enemies[0].hp=battle.enemies[0].maxHp=100000;
  assert.equal(battle.companion,null);
  const first=f.g.BattleEngine.runCompanionPhase(battle);
  assert.equal(first.events.filter(e=>e.type==='storySupport').length,1);
  assert.equal(f.g.BattleEngine.runCompanionPhase(battle).events.length,0);
  assert.equal(f.g.BattleEngine.runCompanionPhase(battle,true).events.length,0);
  battle.round=3;assert.ok(f.g.BattleEngine.runCompanionPhase(battle).events.some(e=>e.type==='storySupport'));
  battle.round=4;assert.equal(f.g.BattleEngine.runCompanionPhase(battle).events.length,0);
  const arena=f.g.BattleEngine.createSurvivalBattle(f.run,1);
  assert.equal(f.g.BattleEngine.runCompanionPhase(arena).events.length,0);
});
test('NPC support can finish a boss and composes with normal companion and Break rewards', () => {
  const f=fixture(5);f.g.Story.ensure(f.run).orinRounds=5;f.run.relics=['break_prism'];f.run.mp=0;
  let battle=f.g.BattleEngine.createBattle(f.run,5,false);battle.enemies[0].hp=1;battle.enemies[0].breakMeter=75;
  const result=f.g.BattleEngine.runCompanionPhase(battle);
  assert.equal(result.victory,true);assert.equal(f.run.mp,4);
  f.run.companionId='ember_fox';battle=f.g.BattleEngine.createBattle(f.run,5,false);battle.enemies[0].hp=100000;
  const together=f.g.BattleEngine.runCompanionPhase(battle);
  assert.ok(together.events.some(e=>e.type==='storySupport'));
  assert.ok(together.events.some(e=>e.type==='companionHit'));
});
test('story-only relics are valid existing stat/economy modifiers and reference valid sprites/rewards', () => {
  const f=fixture();const before=f.g.State.getTotalStats(f.run);
  f.g.State.addRelic(f.run,'mira_lantern');assert.ok(f.g.State.getTotalStats(f.run).mp>before.mp);
  assert.equal(f.g.State.getRewardMult(f.run,'gold'),1.1);
  for(const arc of f.g.Story.arcs)for(const chapter of arc.chapters)for(const option of chapter.choices){
    if(option.relic)assert.equal(f.g.Data.getRelic(option.relic).storyOnly,true);
    for(const item of option.items||[])assert.ok(f.g.Data.getItem(item.id));
  }
});
function loadArt(g) {
  const context={window:{Game:g},document:{querySelector:()=>null}};vm.createContext(context);
  for(const file of ['pixel-art','pixel-sprites','icons','pixel-stories','hero-art'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/'+file+'.js'),'utf8'),context);
  return g;
}
test('all class builds render distinct palette-grid portraits without mutating original art', () => {
  const g=loadArt(loadGame());
  for(const cls of g.Data.classes){
    const original=JSON.stringify(g.PixelArt.getDefinition(cls.icon));const images=new Set();
    for(const primary of ['riposte','flurry','pierce'])for(const second of ['clean_guard','break_flow','affliction'])for(const third of ['overdrive_echo','burning_wind','focus_guard']){
      const run={classId:cls.id,talents:{5:primary,10:second,15:third}};
      const art=g.HeroArt.render(run);assert.match(art,/viewBox="0 0 32 32"/);assert.ok(!art.includes('undefined'));images.add(art);
    }
    assert.equal(images.size,27,cls.id);assert.equal(JSON.stringify(g.PixelArt.getDefinition(cls.icon)),original);
  }
});
test('all NPCs and props have valid rectangular palette grids and every story image exists',()=>{
  const g=loadArt(loadGame());const ids=['npcMira','npcMiraHurt','npcMiraLantern','npcOrin','npcOrinHurt','npcOrinStandard','npcLyra','npcLyraLost','npcLyraAstral','npcMerchant','npcSage','npcGambler','propCart','propLantern','propBanner','propStarGate'];
  for(const id of ids){const {grid,palette}=g.PixelArt.getDefinition(id);for(const row of grid){assert.equal(row.length,24,id);for(const c of row)assert.ok(c==='.'||/^#[a-f0-9]{6}$/i.test(palette[c]||''),id+':'+c);}}
  for(const arc of g.Story.arcs)for(const chapter of arc.chapters){assert.ok(g.PixelArt.has(chapter.icon));assert.ok(g.PixelArt.has(chapter.prop));}
});
