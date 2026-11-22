const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {loadGame}=require('./helpers/load-game');
function game(){const g=loadGame(),context=vm.createContext({window:{Game:g}});for(const name of ['pixel-art','pixel-sprites','pixel-workshop','pixel-tactics','pixel-icons','ui-symbols','companion-art','npc-art','pixel-effects','item-art','icons'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',name+'.js'),'utf8'),context);return g;}
function svg(g,id){return g.Icons.item(g.Data.getItem(id)).match(/<svg[\s\S]*?<\/svg>/)[0];}
test('item identity determines crowns, bells, rings, scrolls, elixirs and material families',()=>{
 const g=game(),cases={c_demonlord_crown:'crown',c_echo_bell:'bell',c_infinity_loop:'ring',c_shatter_prism:'ring',c_quest_novice_badge:'medal',p_elixir:'mpFlask',skill_scroll:'scroll',mat_beast_fang:'fang',mat_dragon_scale:'scale',mat_storm_core:'core',mat_storm_feather:'feather',mat_bone_fragment:'bone'};
 for(const [id,shape]of Object.entries(cases))assert.ok(svg(g,id).includes('data-shape="'+shape+'"'),id);
 for(const item of g.Data.items){const html=g.Icons.item(item);assert.ok(html.includes('<svg'),item.id);assert.ok(!/undefined|NaN/.test(html),item.id);}
});
test('forged traits and reinforcement visibly retain and alter their base equipment',()=>{
 const g=game(),base=svg(g,'w_knight_sword'),variants=['keen','sanguine','sundering'].map(affix=>svg(g,'forge_w_knight_sword_'+affix));assert.equal(new Set([base,...variants]).size,4);
 assert.notEqual(svg(g,'a_chainmail'),svg(g,'orin_a_chainmail'));
 assert.notEqual(svg(g,'w_rusty_blade'),svg(g,'w_hunting_blade'));
 assert.notEqual(svg(g,'p_hp_small'),svg(g,'p_hp_large'));
});
test('UI danger markers are skull emblems and blessings have semantic symbols',()=>{
 const g=game();for(const key of ['skull','crownSkull','skullMark','skullFire','blessVitality','blessGuardian','curseWeakArms','coin','lock']){const html=g.Icons.get(key);assert.ok(html.includes('ui-emblem'),key);assert.ok(!html.includes('<image'),key);assert.ok(!/undefined|NaN/.test(html),key);}
 assert.notEqual(g.Icons.get('blessVitality'),g.Icons.get('blessGuardian'));
});
test('all 192 item drawings differ in geometry, not only their palette or tier label',()=>{
 const g=game(),seen=new Map();for(const item of g.Data.items){const drawing=svg(g,item.id).replace(/#[0-9a-fA-F]{3,8}/g,'COLOR');assert.ok(!seen.has(drawing),item.id+' duplicates '+seen.get(drawing));seen.set(drawing,item.id);}
});
test('each blessing and curse has its own drawing; missing icon data is safe',()=>{
 const g=game();for(const prefix of ['bless','curse']){const drawings=g.UISymbols.keys.filter(k=>k.startsWith(prefix)).map(k=>g.Icons.get(k).replace(/#[0-9a-fA-F]{3,8}/g,'COLOR'));assert.equal(new Set(drawings).size,drawings.length,prefix);}
 assert.doesNotThrow(()=>g.Icons.get());assert.doesNotThrow(()=>g.Icons.item({kind:'weapon',tier:NaN}));
});
test('remaining interface controls and status markers use the new symbol set',()=>{
 const g=game();for(const key of ['settingsGear','save','trash','soundOn','soundOff','microWarning','microHistory','statusPoison','statusBurn','statusSilence','routeExplore','shiftFlip','workMetal','workCloth','workDust','propLantern','propBanner','propCart','propStarGate','forgeBladekeen','forgeStaffsundering'])assert.ok(g.Icons.get(key).includes('ui-emblem'),key);
 assert.notEqual(g.Icons.get('soundOn'),g.Icons.get('soundOff'));
 const baseline=require('../previews/pixel16/original-monster-identities.json');for(const e of baseline){const live=g.Data.getEnemyTemplate(e.id);assert.equal(live.name,e.name);assert.equal(live.nameEn,e.nameEn);}
 assert.equal(g.Data.getEnemyTemplate('shadow_wolf').name,'หมาป่าเงา');
 assert.equal(g.Data.getEnemyTemplate('giant_spider').nameEn,'Giant Spider');
});
test('every UI role uses a complete shaded object drawing',()=>{
 const g=game();for(const key of ['menuContinue','home','credits','workForge','workCamp','workGuild','runeEmber','runeDiscovery','bondHeart'])assert.ok(g.UISymbols.keys.includes(key),key);for(const key of g.UISymbols.keys){const drawing=g.UISymbols.render(key);assert.ok(drawing.includes('viewBox="-2 -2 36 36"'),key);assert.ok(!/undefined|NaN/.test(drawing),key);assert.ok(new Set(drawing.match(/#[a-fA-F0-9]{6}/g)).size>=3,key+' needs material shading');}
});

test('every companion uses its own authored portrait through the production icon renderer',()=>{
 const g=game(),drawings=new Set();
 for(const c of g.Data.companions){const html=g.Icons.get(c.icon);assert.ok(html.includes('data-companion-art="'+c.icon+'"'),c.id);assert.ok(html.includes('href="assets/pixel16/companions/'));const file=path.join(__dirname,'../assets/pixel16/companions',c.icon+'.png');assert.ok(fs.existsSync(file),c.id+' image must be shipped');const png=fs.readFileSync(file);assert.equal(png.subarray(1,4).toString(),'PNG');assert.ok(png.readUInt32BE(16)<=80&&png.readUInt32BE(20)<=80,c.id+' must match the runtime pixel grid');drawings.add(html);}
 assert.equal(drawings.size,7);
});

test('every inventory item uses the new object renderer, including materials and rune components',()=>{
 const g=game();for(const item of g.Data.items){const html=g.Icons.item(item);assert.ok(html.includes('data-art-style="inventory-objects-48"'),item.id);assert.ok(!/undefined|NaN/.test(html),item.id);}
});
test('item artwork uses a unique clipPath id per rendered SVG',()=>{
 // The same item is drawn on several screens at once (hidden ones included); a shared id resolves to the first
 // copy in the document, which may sit inside display:none and leave the visible copy unclipped.
 const g=game(),ids=[];
 for(const itemId of ['w_knight_sword','a_leather_vest','p_hp_small'])for(let i=0;i<2;i++)for(const m of g.Icons.item(g.Data.getItem(itemId)).matchAll(/<clipPath id="([^"]+)"/g))ids.push(m[1]);
 assert.ok(ids.length>=6,'item art defines clip paths');
 assert.equal(new Set(ids).size,ids.length,ids.join(','));
});

test('all story states and service NPCs have shipped portraits through the actual icon path',()=>{
 const g=game(),keys=new Set(g.Story.arcs.flatMap(a=>[a.icon,...a.chapters.map(c=>c.icon)]).concat(['npcMerchant','npcSage','npcGambler']));
 assert.equal(keys.size,12);
 for(const key of keys){assert.ok(g.Icons.get(key).includes('data-npc-art="'+key+'"'),key);const file=path.join(__dirname,'../assets/pixel16/npcs',key+'.png');assert.ok(fs.existsSync(file),key);const png=fs.readFileSync(file);assert.equal(png.readUInt32BE(16),80);assert.equal(png.readUInt32BE(20),96);}
});
test('all battle motifs have transparent padding and a fully mapped pixel grid',()=>{
 const g=game(),source=fs.readFileSync(path.join(__dirname,'../js/pixel-effects.js'),'utf8'),keys=[...source.matchAll(/motif\('([^']+)'/g)].map(m=>m[1]);assert.equal(keys.length,25);
 for(const key of keys){const d=g.PixelArt.getDefinition(key);assert.ok(d,key);assert.ok(d.grid[0].split('').every(c=>c==='.')&&d.grid.at(-1).split('').every(c=>c==='.'),key+' vertical padding');for(const row of d.grid){assert.equal(row.length,d.grid[0].length,key);assert.equal(row[0],'.',key);assert.equal(row.at(-1),'.',key);for(const c of row)assert.ok(c==='.'||d.palette[c],key+' palette');}}
});
