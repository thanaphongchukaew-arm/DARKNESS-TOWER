// Detailed 16-bit NPCs: one portrait for each narrative state and service role.
(function(){
  var keys=['npcMira','npcMiraHurt','npcMiraLantern','npcOrin','npcOrinHurt','npcOrinStandard','npcLyra','npcLyraLost','npcLyraAstral','npcMerchant','npcSage','npcGambler'];
  function render(key){
    if(keys.indexOf(key)===-1)return '';
    return '<svg xmlns="http://www.w3.org/2000/svg" class="pixel-sprite npc-art" data-npc-art="'+key+'" viewBox="0 0 80 96" aria-hidden="true"><image href="assets/pixel16/npcs/'+key+'.png" width="80" height="96" preserveAspectRatio="xMidYMid meet"/></svg>';
  }
  window.Game.NPCArt={keys:keys,render:render};
})();
