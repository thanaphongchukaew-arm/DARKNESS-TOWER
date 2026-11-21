// Detailed 16-bit companion portraits, shared across every game surface.
(function(){
  var keys=['emberFox','dawnOwl','stoneheartBear','stormSprite','sandScarab','frostHare','ironGolemCub'];
  var frames={emberFox:[0,10,80,54,80,64],dawnOwl:[0,25,64,55,64,80],stoneheartBear:[0,1,80,63,80,64],stormSprite:[0,12,64,68,64,80],sandScarab:[1,0,62,63,64,64],frostHare:[7,0,65,64,80,64],ironGolemCub:[0,23,64,57,64,80]};
  function render(key){
    if(keys.indexOf(key)===-1)return '';
    var f=frames[key];
    return '<svg xmlns="http://www.w3.org/2000/svg" class="pixel-sprite companion-art" data-companion-art="'+key+'" viewBox="'+f.slice(0,4).join(' ')+'" aria-hidden="true"><image href="assets/pixel16/companions/'+key+'.png" x="0" y="0" width="'+f[4]+'" height="'+f[5]+'" preserveAspectRatio="xMidYMid meet"/></svg>';
  }
  window.Game.CompanionArt={render:render,keys:keys};
})();
