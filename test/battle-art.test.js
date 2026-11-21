const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const {loadGame} = require('./helpers/load-game');
function game() {
  const g = loadGame({random: () => .5});
  const context = vm.createContext({window:{Game:g}});
  for (const file of ['pixel-art','pixel-sprites','monster-art','battle-art']) vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',file + '.js'),'utf8'),context);
  return g;
}
test('every enemy and boss has an illustration, role and distinct champion markings', () => {
  const g = game();
  for (const template of g.Data.getAllEnemyTemplates()) {
    const actor = {...template,templateId:template.id};
    assert.ok(g.PixelArt.has(template.icon),template.id);
    const html = g.BattleArt.enemy(actor);
    assert.match(html,/enemy-illustration/);
    assert.ok(html.includes('assets/pixel16/monsters/' + template.id + '.png'), template.id);
    assert.doesNotMatch(html,/undefined|NaN/);
    assert.ok(['tank','caster','swift','striker'].includes(g.BattleArt.profile(actor).role));
    assert.match(g.BattleArt.enemy({...actor,champion:true}),/champion-crest/);
  }
  assert.equal(g.BattleArt.profile({templateId:'stone_golem'}).role,'tank');
  assert.equal(g.BattleArt.profile({templateId:'shadow_wolf'}).role,'swift');
});
test('sovereign art changes at all four phases, and every zone uses scenery not item glyphs', () => {
  const g = game();
  const phases = [1,2,3,4].map(phase => g.BattleArt.enemy({...g.Data.boss,phase}));
  assert.equal(new Set(phases).size,4);
  assert.match(phases[3],/sovereign-rift/);
  assert.match(phases[2],/sovereign-fragments/);
  const themes = new Set();
  for (let tier=1;tier<=16;tier++) {
    const scene=g.BattleArt.zone(tier,false); themes.add(scene);
    assert.equal((scene.match(/zone-illustration/g)||[]).length,3);
    assert.doesNotMatch(scene,/pixel-icon|item-art|undefined/);
  }
  assert.ok(themes.size>=8);
});
test('status chips have distinct shapes, escaped descriptions and explicit turn counts', () => {
  const g=game();
  assert.equal(new Set(['poison','burn','silence','buff','debuff'].map(id=>g.BattleArt.status(id))).size,5);
  const chip=g.BattleArt.chip('poison','<name>','"<description>"',3,'ailment-chip');
  assert.match(chip,/status-turns">3/);
  assert.match(chip,/aria-label=/);
  assert.match(chip,/&lt;description&gt;/);
  assert.doesNotMatch(chip,/<description>/);
});
test('boss phase events retain their actor and phase for ordered visual playback', () => {
  const g=game(),run=g.State.createRun('normal','blade');
  run.level=99; g.State.fullRestore(run);
  const battle=g.BattleEngine.createBattle(run,100,true), boss=battle.enemies[0];
  boss.hp=Math.floor(boss.maxHp*.7); battle.player.focus=g.Formulas.FOCUS_MAX;
  const result=g.BattleEngine.playerAction(battle,{kind:'overdrive',targetIndex:0});
  const events=result.events.filter(e=>e.type==='bossPhaseChange');
  assert.ok(events.length>0);
  for(const event of events){assert.equal(event.targetUid,boss.uid);assert.ok(event.phase>=2);}
});
