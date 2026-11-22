// Illustrated 64px handbook art. Objects share the game's pixel vocabulary;
// compositions explain each topic instead of posing as tier-one inventory items.
(function(){
  var G=window.Game,C={ink:'#11131f',panel:'#241d31',line:'#66513e',gold:'#edc46c',red:'#dd5d75',blue:'#6ac5e2',green:'#89c49c',white:'#fff0ce'};
  function rect(x,y,w,h,color){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+color+'"/>';}
  function path(d,color){return '<path d="'+d+'" fill="'+color+'"/>';}
  function icon(key,x,y,size){
    var raw=G.Icons.get(key),a=raw.indexOf('<svg'),b=raw.lastIndexOf('</svg>');
    if(a<0||b<0)throw Error('Missing handbook artwork: '+key);
    return raw.slice(a,b+6).replace('<svg ','<svg x="'+x+'" y="'+y+'" width="'+size+'" height="'+size+'" ');
  }
  function bar(color,count){var a=rect(7,51,50,9,C.ink)+rect(8,52,48,7,'#3c3347');for(var i=0;i<count;i++)a+=rect(9+i*12,53,10,5,color);return a;}
  function badge(key,x,y,size){return rect(x,y,size,size,C.ink)+icon(key,x+1,y+1,size-2);}
  function arrow(x,y,color){return path('M'+x+' '+y+'h7v-3l6 6-6 6v-3h-7Z',color||C.gold);}
  function object(key){return icon(key,7,4,50);}
  function pair(a,b){return icon(a,2,9,40)+badge(b,36,33,26);}
  function quad(keys){return keys.map(function(k,i){return icon(k,3+i%2*30,2+Math.floor(i/2)*30,28);}).join('');}
  function figures(){return quad(['npcMira','npcOrin','npcLyra','npcVeyraDawn']);}
  var art={
    guideStartGoal:function(){return icon('towerSpire',11,9,43)+badge('crownSkull',37,1,24);},
    guideStartLoop:function(){return icon('swordAttack',2,2,25)+icon('eventChest',37,2,25)+icon('workForge',37,35,25)+icon('towerSpire',2,35,25)+arrow(26,12)+'<g transform="translate(64 0) scale(-1 1)">'+arrow(25,46)+'</g>';},
    guideStartTurn:function(){return pair('swordAttack','blessFocus')+arrow(27,19);},
    guideStartSave:function(){return pair('save','check');},
    guideStatHp:function(){return object('heart')+bar(C.red,3);},
    guideStatMp:function(){return object('mpPotion')+bar(C.blue,3);},
    guideStatAtk:function(){return pair('swordAttack','blessFocus');},
    guideStatMag:function(){return pair('weaponSlotMag','fire');},
    guideStatDef:function(){return pair('shieldGuard','phys');},
    guideStatRes:function(){return pair('shieldGuard','magicBurst');},
    guideStatSpd:function(){return object('blessSwiftness')+rect(3,18,12,2,C.green)+rect(1,26,14,2,C.green)+rect(3,34,10,2,C.green);},
    guideStatLuk:function(){return pair('blessFortune','eventGambler');},
    guideStatExp:function(){return icon('gem',5,4,43)+icon('buffUp',37,16,26)+bar(C.gold,3);},
    guideCombatAp:function(){return [5,19,33,47].map(function(x,i){return rect(x,16,12,26,C.ink)+rect(x+2,18,8,22,i?'#746044':C.gold)+rect(x+3,20,4,3,i?'#9c8253':C.white);}).join('');},
    guideCombatActions:function(){return quad(['swordAttack','weaponSlotMag','shieldGuard','potion']);},
    guideCombatStagger:function(){return '<g transform="rotate(-35 30 31)">'+icon('skull',9,9,43)+'</g>'+rect(8,56,48,3,C.line)+icon('sparkles',44,3,17);},
    guideCombatGroup:function(){return icon('skull',1,23,26)+icon('skull',19,4,28)+icon('skull',38,23,26);},
    guideCombatFocus:function(){return icon('magicBurst',11,1,44)+icon('swordAttack',37,22,25)+bar(C.blue,4);},
    guideCombatBreak:function(){return object('shieldGuard')+path('M31 6h6l-7 18 10 7-11 20h-6l10-18-10-7Z',C.ink)+path('M31 9h3l-7 17 10 7-10 17h-2l8-17-10-7Z',C.red)+bar(C.red,4);},
    guideTowerFloors:function(){return object('towerSpire')+icon('buffUp',41,2,21);},
    guideTowerWaypoint:function(){return pair('workCamp','eventChest');},
    guideTowerBoss:function(){return icon('crownSkull',8,4,48)+rect(6,54,52,6,C.ink)+rect(8,56,48,2,C.red);},
    guideTowerDifficulty:function(){return [12,21,30,39].map(function(y,i){return rect(9,y,46,6,C.ink)+rect(11,y+1,10+i*10,4,[C.green,C.gold,C.red,'#a37fc7'][i]);}).join('')+icon('microWarning',43,0,19);},
    guideFeatureTalents:function(){return path('M29 11h5v16h16v5H34v18h-5V32H13v-5h16Z',C.gold)+badge('star',21,1,22)+badge('shieldGuard',2,23,22)+badge('swordAttack',41,23,22)+badge('heart',21,41,22);},
    guideFeatureBlessings:function(){return icon('light',1,3,33)+icon('dark',31,28,32)+icon('buffUp',36,2,21)+icon('debuffDown',7,37,20);},
    guideFeatureRelics:function(){return rect(9,51,46,7,C.line)+icon('relicVampiricFang',14,2,42)+icon('gem',2,29,24);},
    guideFeatureShop:function(){return pair('propCart','coin');},
    guideFeatureWorkshop:function(){return pair('miniForge','workSocket');},
    guideFeatureNew:function(){return pair('workBook','microNew')+path('M43 3h11v5h-2v8h3v5h-6v12h-3V21h-6v-5h3V8h-2V3Z',C.ink)+rect(43,4,10,4,C.red)+rect(45,8,6,9,C.red)+rect(42,17,12,3,C.red)+rect(47,21,2,9,C.gold);},
    guideFeatureRoutes:function(){return path('M29 58V35H9V16h5v14h15V9h6v21h15V16h5v19H35v23Z',C.gold)+icon('shieldGuard',0,0,23)+icon('routeElite',41,0,23)+icon('microRoute',23,0,21);},
    guideFeatureEvents:function(){return quad(['eventChest','eventShrine','miniCards','eventMerchant']);},
    guideFeatureTravelers:figures,
    guideFeatureLore:function(){return pair('workBook','propLantern');},
    guideFeatureCompanions:function(){return icon('emberFox',0,9,44)+icon('dawnOwl',34,13,29);},
    guideFeatureBond:function(){return icon('emberFox',1,14,38)+icon('heart',38,0,23)+icon('duoStrike',36,35,26);},
    guideFeatureAilments:function(){return quad(['statusPoison','statusBurn','statusSilence','statusCleanse']);},
    guideFeatureBossShift:function(){return icon('crownSkull',17,0,30)+icon('fire',1,31,28)+icon('ice',36,31,28)+arrow(25,44);},
    guideFeatureArena:function(){return pair('trophy','skull');},
    guideFeatureQuests:function(){return pair('workGuild','check');},
    guideFeatureMinigames:function(){return icon('miniForge',0,3,32)+icon('miniLockpick',32,3,32)+icon('miniCards',16,30,33);},
    guideFeatureAscension:function(){return icon('towerSpire',0,13,42)+icon('buffUp',36,0,27)+icon('crownSkull',35,37,25);},
    guideFeatureCodex:function(){return object('codex')+badge('skull',39,35,23);},
    guideFeatureAchievements:function(){return pair('trophy','medal');}
  };
  art.guideReward=function(){return pair('eventChest','coin');};
  art.guideOverdrive=function(){return icon('swordAttack',7,5,45)+icon('elec',38,1,23)+icon('magicBurst',39,32,23)+bar(C.blue,4);};
  art.guideRally=function(){return icon('duoStrike',2,1,52)+badge('skull',37,37,25);};
  art.guideBonusDamage=function(){return icon('swordAttack',2,7,44)+icon('buffUp',36,1,25)+icon('sparkles',37,35,25);};
  var tipKeys=['guideStatDef','guideFeatureShop','guideFeatureBossShift','guideFeatureRoutes','guideFeatureAilments','guideFeatureTravelers','guideFeatureArena','guideTowerBoss'];
  tipKeys.forEach(function(key,i){art['guideTip'+(i+1)]=art[key];});
  ['phys','fire','ice','elec','wind','light','dark','almighty'].forEach(function(key){art['element-'+key]=function(){return icon(key,7,7,50);};});
  function render(key){if(!art[key])throw Error('Unillustrated handbook topic: '+key);return '<svg xmlns="http://www.w3.org/2000/svg" class="pixel-sprite guide-illustration" data-guide-art="'+key+'" viewBox="-4 -4 72 72" shape-rendering="crispEdges" aria-hidden="true">'+art[key]()+'</svg>';}
  G.GuideArt={render:render,keys:Object.keys(art)};
})();
