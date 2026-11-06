// Small run-quality systems shared by menus, battle and the end record.
(function () {
  var G=window.Game,S=G.State,D=G.Data;
  function text(th,en){return G.Systems.text(th,en);}
  function ensure(run){if(!run.micro){var initialSkills={},initialRunes={},initialRecipes={};S.learnedSkills(run).forEach(function(x){initialSkills[x.id]=true;});Object.keys(run.inventory||{}).forEach(function(id){var item=D.getItem(id);if(item&&item.kind==='rune')initialRunes[id]=true;});run.micro={skillsSeen:initialSkills,runesSeen:initialRunes,recipesSeen:initialRecipes,stats:{skills:{},runes:{},maxHit:0,breaks:0,combos:0}};G.Workshop.allRecipes().forEach(function(r){if(!r.blueprint&&!r.npc&&G.Workshop.floorFor(r)<=run.currentFloor)initialRecipes[r.id]=true;});}var m=run.micro;['skillsSeen','runesSeen','recipesSeen'].forEach(function(k){if(!m[k])m[k]={};});if(!m.stats)m.stats={};if(!m.stats.skills)m.stats.skills={};if(!m.stats.runes)m.stats.runes={};return m;}
  function badge(){return '<span class="micro-new">'+G.Icons.get('microNew')+text('ใหม่','NEW')+'</span>';}
  function seen(run,kind,id){var map=ensure(run)[kind+'Seen'];return !!map[id];}
  function mark(run,kind,id){if(!id)return;ensure(run)[kind+'Seen'][id]=true;S.saveNow();}
  function markAll(run,kind,ids){var map=ensure(run)[kind+'Seen'];ids.forEach(function(id){map[id]=true;});S.saveNow();}
  function newSkill(run,id){var m=ensure(run);if(!m.skillsSeen[id])m.skillsSeen[id]=false;}
  function rewardNeed(run,itemId){var r=G.Workshop.recipe(G.Workshop.ensure(run).trackedRecipe);if(!r)return '';var mat=r.materials.find(function(x){return x.id===itemId;});if(!mat)return '';var item=D.getItem(itemId),have=run.inventory[itemId]||0;return '<span class="micro-needed">'+G.Icons.get('microIngredient')+text('สูตรที่ปักหมุด: ','Pinned recipe: ')+G.I18n.L(item,'name')+' '+have+'/'+mat.qty+'</span>';}
  function protectedItem(run,id){var r=G.Workshop.recipe(G.Workshop.ensure(run).trackedRecipe);return !!(r&&(r.resultId===id||r.materials.some(function(m){return m.id===id;})));}
  function sellDuplicates(run,id){var qty=run.inventory[id]||0;if(qty<=1||protectedItem(run,id))return 0;var sold=0;while((run.inventory[id]||0)>1){if(!S.sellItem(run,id,1))break;sold++;}if(sold)S.saveNow();return sold;}
  function urgentContracts(run){var w=G.Workshop.ensure(run);return Object.values(w.contracts).filter(function(c){return !c.claimed&&!c.expired&&!c.abandoned&&c.deadline-run.currentFloor<=2;});}
  function noteEvents(run,events){var m=ensure(run),st=m.stats,sockets=G.Workshop.ensure(run).sockets;events.forEach(function(e){
    if(e.type==='skillUsed'&&e.skillId)st.skills[e.skillId]=(st.skills[e.skillId]||0)+1;
    if(e.type==='hit'&&e.sourceSide==='player')st.maxHit=Math.max(st.maxHit||0,e.amount||0);
    if(e.type==='enemyBroken')st.breaks=(st.breaks||0)+1;
    Object.keys(sockets).forEach(function(slot){var x=sockets[slot],r=x&&G.Workshop.rune(x.runeId);if(!r)return;var active=e.type==='hit'&&e.sourceSide==='player'&&(['break','focus','leech'].indexOf(r.effect)!==-1||r.effect===e.element)||(e.type==='guard'&&r.effect==='guardMp');if(active)st.runes[r.id]=(st.runes[r.id]||0)+1;});
  });}
  function top(map){return Object.keys(map||{}).sort(function(a,b){return map[b]-map[a];})[0]||null;}
  var addItem=S.addItem;S.addItem=function(run,id,qty){var item=D.getItem(id),prior=run.inventory[id]||0;var out=addItem(run,id,qty);if(item&&item.kind==='rune'&&prior===0&&qty>0)ensure(run).runesSeen[id]=false;return out;};
  var recordEnemy=S.recordEnemySeen;S.recordEnemySeen=function(id){var meta=G.Save.readMeta(),was=!!(meta.bestiarySeen&&meta.bestiarySeen[id]);recordEnemy(id);if(!was&&id){meta=G.Save.readMeta();meta.bestiaryNew=meta.bestiaryNew||{};meta.bestiaryNew[id]=true;G.Save.writeMeta(meta);}};
  var addExp=S.addExp;S.addExp=function(run,amount){ensure(run);var before=S.learnedSkills(run).map(function(s){return s.id;}),out=addExp(run,amount);S.learnedSkills(run).forEach(function(skill){if(before.indexOf(skill.id)===-1)newSkill(run,skill.id);});return out;};
  G.Micro={ensure:ensure,badge:badge,seen:seen,mark:mark,markAll:markAll,newSkill:newSkill,rewardNeed:rewardNeed,protectedItem:protectedItem,sellDuplicates:sellDuplicates,urgentContracts:urgentContracts,noteEvents:noteEvents,top:top,text:text};
})();
