// Dedicated 16-bit interiors: every encounter remains inside the tower.
(function(){
  var G=window.Game;
  var zones=[
    ['moonlit-den','Moonlit Guard Chamber'],['knight-ward','Knight Ward'],
    ['shadow-bastion','Shadow Bastion'],['dragon-reach','Draconic Hall'],
    ['infernal-gate','Infernal Gate'],['resonant-cavern','Crystal Chamber'],
    ['drowned-ruins','Drowned Hall'],['storm-citadel','Storm Citadel'],
    ['bone-desert','Sand-filled Bone Crypt'],['molten-core','Molten Furnace'],
    ['clockwork-bastion','Clockwork Bastion'],['nightgrove','Withering Conservatory'],
    ['frozen-abyss','Frozen Hall'],['astral-rift','Astral Observatory'],
    ['chaos-forge','Chaos Forge'],['twilight-sanctum','Twilight Sanctum'],
    ['sovereign-throne','Sovereign Throne Room']
  ];
  // Living room: breathing torchlight, drifting floor mist and floating motes layered over the painted scene.
  function ambient(){
    var motes='',i,seed=11;
    function rnd(){seed=(seed*48271)%2147483647;return seed/2147483647;}
    for(i=0;i<14;i++){var t=9+rnd()*8;motes+='<i style="--x:'+(4+rnd()*92).toFixed(0)+'%;--y:'+(18+rnd()*52).toFixed(0)+'%;--s:'+(1.5+rnd()*2).toFixed(1)+'px;--t:'+t.toFixed(1)+'s;--d:-'+(rnd()*t).toFixed(1)+'s;--dx:'+((rnd()-.5)*60).toFixed(0)+'px"></i>';}
    return '<div class="scene-ambient" aria-hidden="true"><div class="scene-light"></div><div class="scene-mist scene-mist-a"></div><div class="scene-mist scene-mist-b"></div><div class="scene-motes">'+motes+'</div></div>';
  }
  function scene(tier,boss){return zones[boss?16:Math.max(0,Math.min(15,tier-1))];}
  function render(tier,boss){var z=scene(tier,boss);return '<img class="battle-scene-art" data-scene="'+z[0]+'" src="assets/pixel16/scenes/'+z[0]+'.png" width="768" height="512" alt="" aria-hidden="true" draggable="false">';}
  function apply(backdrop,tier,boss){if(!backdrop)return;var stage=backdrop.querySelector('.battle-scenery');if(!stage){stage=document.createElement('div');stage.className='battle-scenery';backdrop.appendChild(stage);}var id=scene(tier,boss)[0];if(backdrop.dataset.scene!==id)stage.innerHTML=render(tier,boss);if(!stage.querySelector('.scene-ambient'))stage.insertAdjacentHTML('beforeend',ambient());backdrop.classList.add('has-scenery');backdrop.dataset.scene=id;}
  function urlForFloor(floor){return 'assets/pixel16/scenes/'+scene(G.Formulas.tierForFloor(floor),floor>=100)[0]+'.png';}
  G.BattleScenes={render:render,apply:apply,urlForFloor:urlForFloor,zones:zones.map(function(z){return z[1];}),keys:zones.map(function(z){return z[0];})};
})();
