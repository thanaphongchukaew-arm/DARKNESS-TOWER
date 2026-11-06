const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {loadGame} = require('./helpers/load-game');

function fixture(classId='elementalist', floor=19) {
  const g=loadGame({random:()=>0.5}), run=g.State.createRun('normal',classId);
  run.level=99;run.currentFloor=floor;g.State.fullRestore(run);
  const battle=g.BattleEngine.createBattle(run,floor,floor===100);
  battle.enemies.forEach(e=>{e.hp=e.maxHp=1e7;});
  return {g,run,battle};
}
test('every player skill, every monster attack and every usable battle item has an explicitly reviewed effect',()=>{
  const g=loadGame();assert.equal(g.VFXData.missing.length,0);
  assert.equal(Object.keys(g.VFXData.skills).length,g.Data.skills.length);
  assert.equal(g.Data.getAllEnemyTemplates().length,100);
  let count=0;
  for(const enemy of g.Data.getAllEnemyTemplates())for(const pool of [enemy.attacks,...(enemy.phases||[]).map(p=>p.attacks)])for(const attack of pool){
    count++;const profile=g.VFXData.attacks[attack.vfxKey];assert.ok(profile?.declared,enemy.id+'/'+attack.nameEn);
    assert.equal(profile.element,attack.element);
  }
  assert.equal(count,272);
  for(const skill of g.Data.skills)assert.ok(g.VFXData.skill(skill.id).declared,skill.id);
  for(const item of g.Data.items.filter(i=>i.battleUsable))assert.ok(g.VFXData.item(item.id).declared,item.id);
});
test('name semantics distinguish weapons, elements, thrown flasks, self elixirs, music, time and monster anatomy',()=>{
  const g=loadGame(), v=g.VFXData;
  for(const [id,family] of Object.entries({fire_bolt:'fireball',ice_shard:'iceShard',cross_slash:'cross',arrow_rain:'arrow',bullet_storm:'bullet',flame_flask:'bomb',toxic_flask:'bomb',thousand_cherry_blossoms:'petals',hundred_fists:'punch',temporal_lock:'temporal',discordant_note:'music',puppet_shackles:'puppet',thorn_whip:'vine',spirit_arrow:'arrow'})) assert.equal(v.skill(id).family,family,id);
  assert.equal(v.skill('empowering_elixir').selfItem,true);
  assert.equal(v.skill('toxic_flask').palette,'poison');
  assert.equal(v.skill('riptide_bolt').palette,'water');
  assert.equal(v.skill('attack','ranger').family,'arrow');assert.equal(v.skill('attack','gunslinger').family,'bullet');assert.equal(v.skill('attack','monk').family,'punch');assert.equal(v.skill('attack','bard').family,'music');
  const enemy=(id,name)=>{const e=g.Data.getEnemyTemplate(id),a=e.attacks.find(a=>a.nameEn===name);return v.attacks[a.vfxKey];};
  assert.equal(enemy('shadow_wolf','Rending Bite').family,'bite');
  assert.equal(enemy('crimson_drake','Flame Breath').family,'breath');
  assert.equal(enemy('crimson_drake','Blazing Claw').family,'claw');
  assert.equal(enemy('glacial_wyrm','Ice Breath').element,'ice');
  assert.equal(enemy('giant_spider','Venom Bite').palette,'poison');
});
test('all 220 skills emit stable animation metadata and their timelines preserve every event exactly once',()=>{
  const definitions=loadGame().Data.skills;
  for(const skill of definitions){
    const f=fixture(skill.classOnly||'elementalist');f.run.hp-=5;f.battle.playerAP=2;
    const result=f.g.BattleEngine.playerAction(f.battle,{kind:'skill',skillId:skill.id,targetIndex:0});
    assert.notEqual(result.events[0]?.type,'invalid',skill.id);
    const plan=f.g.BattleFX.timeline(result.events), flattened=plan.flatMap(step=>step.events);
    assert.equal(flattened.length,result.events.length,skill.id);
    for(const event of result.events) assert.equal(flattened.filter(e=>e===event).length,1,skill.id+'/'+event.type);
    for(const e of result.events.filter(e=>e.type==='hit')){assert.equal(e.skillId,skill.id);assert.ok(e.targetUid);assert.ok(f.g.BattleFX.profile(e,f.battle));}
    if(skill.target==='allEnemies'){
      const group=plan.find(step=>step.simultaneous);assert.ok(group,skill.id);
      assert.equal(group.primary.length,f.battle.enemies.length,skill.id);
    }
    for(const e of result.events.filter(e=>e.type==='buff'&&e.side==='enemy'))assert.ok(e.targetUid,skill.id);
  }
});
test('all 272 enemy attacks retain source identity and choreography through actual enemy-phase events',()=>{
  const g=loadGame({random:()=>0.5}),run=g.State.createRun('normal','blade');
  run.level=99;g.State.fullRestore(run);
  for(const template of g.Data.getAllEnemyTemplates())for(const attack of [template.attacks,...(template.phases||[]).map(p=>p.attacks)].flat()){
    const battle=g.BattleEngine.createBattle(run,1,false);battle.enemies=battle.enemies.slice(0,1);
    const actor=battle.enemies[0];actor.templateId=template.id;actor.attacksPool=[attack];actor.atk=actor.mag=1;actor.spd=1;
    run.hp=battle.player.maxHp;run.ailments=[];
    const events=g.BattleEngine.runEnemyPhase(battle).events;
    const cast=events.find(e=>e.type==='enemyAction'),hit=events.find(e=>e.type==='hit');
    assert.equal(cast.vfxKey,attack.vfxKey);assert.equal(hit.vfxKey,attack.vfxKey);
    assert.equal(hit.attackerTemplateId,template.id);assert.equal(hit.attackerUid,actor.uid);
    assert.equal(g.BattleFX.profile(hit,battle).key,attack.vfxKey);
  }
});
test('random-element hits use the actual rolled element and multi-hit attacks retain each mechanical hit',()=>{
  const f=fixture();
  for(const id of ['twin_elements','elemental_barrage']){
    f.battle.playerAP=2;f.battle.awaitingAllOut=false;
    const result=f.g.BattleEngine.playerAction(f.battle,{kind:'skill',skillId:id,targetIndex:0});
    const hits=result.events.filter(e=>e.type==='hit');assert.equal(hits.length,f.g.Data.getSkill(id).hits);
    for(const [index,hit]of hits.entries()){assert.equal(hit.hitIndex,index);assert.equal(f.g.BattleFX.profile(hit,f.battle).palette,hit.element);}
    assert.equal(f.g.BattleFX.timeline(result.events).filter(s=>s.primary).length,hits.length);
  }
});
test('every battle item has appropriate self-targeted healing / mana / cleanse choreography',()=>{
  for(const item of loadGame().Data.items.filter(i=>i.battleUsable)){
    const f=fixture();f.run.hp-=20;f.run.mp-=10;f.run.ailments=[{id:'poison',turns:3}];f.g.State.addItem(f.run,item.id,1);
    const result=f.g.BattleEngine.playerAction(f.battle,{kind:'item',itemId:item.id});
    const event=result.events.find(e=>e.type==='itemUsed');assert.ok(event,item.id);
    const p=f.g.BattleFX.profile(event,f.battle);assert.equal(p.kind,'item');assert.equal(p.itemType,item.effect.type);
  }
});
test('impact precedes down/break/ailment feedback and AoE damage stays one simultaneous packet',()=>{
  const g=loadGame(),pre={type:'ailment',id:'burn',targetUid:'e0'},broken={type:'enemyBroken',targetUid:'e0'},hit={type:'hit',skillId:'fire_bolt',targetUid:'e0'};
  const steps=g.BattleFX.timeline([pre,broken,hit]);assert.equal(steps.length,1);assert.equal(steps[0].events[0],hit);
  const aoe=g.BattleFX.timeline([{type:'skillUsed',target:'allEnemies'},pre,hit,{type:'hit',targetUid:'e1'},{type:'victory'}]);
  assert.equal(aoe[1].primary.length,2);assert.equal(aoe[2].events[0].type,'victory');
});
function fakeRenderer() {
  const g=loadGame(),queue=new Map(),timers=new Map();let clock=0,id=0,draws=0,hidden=false;
  const classes={add(){},remove(){}};
  const context={globalAlpha:1,fillStyle:'',imageSmoothingEnabled:false,
    fillRect(...values){assert.ok(values.every(Number.isFinite),'non-finite particle geometry');assert.ok(/^#[0-9a-f]{6}$/i.test(this.fillStyle),'invalid palette '+this.fillStyle);draws++;},
    clearRect(){},setTransform(){},save(){},restore(){},translate(...n){assert.ok(n.every(Number.isFinite));},rotate(n){assert.ok(Number.isFinite(n));},scale(...n){assert.ok(n.every(Number.isFinite));}};
  const canvas={isConnected:true,classList:classes,setAttribute(){},getContext:()=>context};
  const document={createElement:()=>canvas,body:{appendChild(){}},get hidden(){return hidden;}};
  const sandbox={window:{Game:g,innerWidth:1200,innerHeight:900,matchMedia:()=>({matches:false})},document,console,performance:{now:()=>clock},
    requestAnimationFrame:fn=>{queue.set(++id,fn);return id;},cancelAnimationFrame:n=>queue.delete(n),setTimeout:fn=>{timers.set(++id,fn);return id;},clearTimeout:n=>timers.delete(n)};
  g.SystemsUI={speed:()=>4};vm.createContext(sandbox);
  for(const file of ['pixel-art','pixel-effects','pixel-stories','vfx-renderer'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/'+file+'.js'),'utf8'),sandbox);
  const element={isConnected:true,closest:()=>null,getBoundingClientRect:()=>({left:80,top:600,width:80,height:80})};
  const target={...element,getBoundingClientRect:()=>({left:500,top:120,width:120,height:140})};
  return {g,sandbox,element,target,draws:()=>draws,hidden:v=>{hidden=v;},tick:ms=>{clock+=ms;const callbacks=[...queue.values()];queue.clear();callbacks.forEach(fn=>fn(clock));},pending:()=>queue.size+timers.size};
}
test('every skill, enemy and item effect renders a complete bounded lifecycle without invalid geometry or leaks',async()=>{
  const f=fakeRenderer();const profiles=[...Object.values(f.g.VFXData.skills),...Object.values(f.g.VFXData.attacks),...f.g.Data.items.filter(i=>i.battleUsable).map(i=>f.g.VFXData.item(i.id)),...[{type:'hit',skillId:'overdrive'},{type:'allOutHit'},{type:'guard'},{type:'bossPhaseChange'},{type:'blessingRevive'},{type:'cleanse'},{type:'resourceGain',resource:'mp'}].map(e=>f.g.BattleFX.profile(e,{run:{classId:'blade'}}))];
  for(const p of profiles){
    let impacts=0;const promise=f.g.PixelFX.play([{profile:p,source:()=>f.element,target:()=>f.target,seed:p.key}],()=>impacts++);
    for(let frame=0;frame<22;frame++)f.tick(20);
    assert.equal((await promise).cancelled,false,p.key);assert.equal(impacts,1,p.key);
    const state=f.g.PixelFX.diagnostics();assert.equal(state.jobs,0,p.key);assert.equal(state.framePending,false,p.key);assert.equal(state.failures,0,p.key);
  }
  assert.ok(f.draws()>10000);assert.equal(f.pending(),0);
});
test('cancel, missing targets, hidden tabs, reduced motion and resize never stall a turn or fire a stale impact',async()=>{
  const f=fakeRenderer(),p=f.g.VFXData.skill('fire_bolt');let hits=0;
  const cancelled=f.g.PixelFX.play([{profile:p,source:()=>f.element,target:()=>f.target,seed:'cancel'}],()=>hits++);f.tick(20);f.g.PixelFX.cancel();assert.equal((await cancelled).cancelled,true);assert.equal(hits,0);assert.equal(f.pending(),0);
  const missing=f.g.PixelFX.play([{profile:p,source:()=>null,target:()=>null,seed:'missing'}],()=>hits++);f.hidden(true);f.tick(100);await missing;assert.equal(hits,1);
  f.hidden(false);f.sandbox.window.matchMedia=()=>({matches:true});
  const motion=f.g.PixelFX.play([{profile:p,source:()=>f.element,target:()=>f.target,seed:'reduce'}],()=>hits++);f.sandbox.window.innerWidth=390;f.sandbox.window.innerHeight=844;for(let i=0;i<5;i++)f.tick(20);await motion;assert.equal(hits,2);assert.equal(f.g.PixelFX.diagnostics().jobs,0);
});
test('visual noise is deterministic and never consumes game randomness',async()=>{
  const f=fakeRenderer();let randomCalls=0;f.sandbox.Math=Object.assign(Object.create(Math),{random:()=>{randomCalls++;throw Error('presentation consumed game RNG');}});
  // The production renderer uses local hashing; verify statically as well as the runtime paths above.
  for(const file of ['vfx-renderer','data-vfx','battle-vfx'])assert.ok(!fs.readFileSync(path.join(__dirname,'../js/'+file+'.js'),'utf8').includes('Math.random'),file);
  const p=f.g.PixelFX.play([{profile:f.g.VFXData.skill('fire_bolt'),source:()=>f.element,target:()=>f.target,seed:'stable'}],()=>{});for(let i=0;i<20;i++)f.tick(20);await p;assert.equal(randomCalls,0);
});

test('healing and resource feedback reports only amounts actually restored, including near-full potion use',()=>{
  const f=fixture();f.run.hp=f.battle.player.maxHp-3;
  let events=f.g.BattleEngine.playerAction(f.battle,{kind:'skill',skillId:'greater_heal'}).events;
  assert.equal(events.find(e=>e.type==='heal').amount,3);
  f.battle.playerAP=1;f.run.hp=f.battle.player.maxHp-2;f.g.State.addItem(f.run,'p_hp_small',1);
  events=f.g.BattleEngine.playerAction(f.battle,{kind:'item',itemId:'p_hp_small'}).events;
  assert.equal(events.find(e=>e.type==='itemUsed').result.healedHp,2);
  f.run.mp=f.battle.player.maxMp-1;f.g.State.addItem(f.run,'p_mp_small',1);
  assert.equal(f.g.State.useConsumable(f.run,'p_mp_small').healedMp,1);
});
test('cleanse and companion resource gains have their own semantic animation events',()=>{
  const f=fixture();f.run.talents[10]='clean_guard';f.run.ailments=[{id:'poison',turns:3}];
  let events=f.g.BattleEngine.playerAction(f.battle,{kind:'guard'}).events;assert.ok(events.some(e=>e.type==='cleanse'));
  f.run.companionId='dawn_owl';f.battle=f.g.BattleEngine.createBattle(f.run,1,false);f.run.ailments=[{id:'silence',turns:2}];
  events=f.g.BattleEngine.runCompanionPhase(f.battle).events;assert.ok(events.some(e=>e.type==='cleanse'));
  f.run.companionId='frost_hare';f.battle=f.g.BattleEngine.createBattle(f.run,1,false);f.run.mp-=1;
  events=f.g.BattleEngine.runCompanionPhase(f.battle).events;const gain=events.find(e=>e.type==='resourceGain');assert.equal(gain.amount,1);assert.equal(f.g.BattleFX.profile(gain,f.battle).palette,'mana');
  const audioSrc=fs.readFileSync(path.join(__dirname,'../js/audio.js'),'utf8');
  // Only the cosmetic battle-track rotation may use Math.random; sound effects must stay deterministic.
  const uses=audioSrc.split('\n').filter(l=>l.includes('Math.random'));
  assert.equal(uses.length,1);assert.ok(uses[0].includes('pool['));
});

test('offensive companion buffs do not masquerade as shields and silenced monsters keep anatomical fallback motions',()=>{
  const f=fixture();assert.equal(f.g.BattleFX.profile({type:'companionBuff',stats:['atk','mag']},f.battle).family,'empower');
  assert.equal(f.g.BattleFX.profile({type:'companionBuff',stats:['def','res']},f.battle).family,'shield');
  assert.equal(f.g.BattleFX.profile({type:'hit',vfxKey:'disrupted',attackerTemplateId:'shadow_wolf'},f.battle).family,'bite');
  assert.equal(f.g.BattleFX.profile({type:'hit',vfxKey:'disrupted',attackerTemplateId:'gust_sprite'},f.battle).family,'wave');
});
