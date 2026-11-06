(function () {
  var G=window.Game, BE=G.BattleEngine;
  var tower=BE.createBattle, arena=BE.createSurvivalBattle;
  BE.createBattle=function(run,floor,boss){var battle=tower(run,floor,boss);G.Workshop.prepareBattle(run,battle,false);return battle;};
  BE.createSurvivalBattle=function(run,wave){var battle=arena(run,wave);G.Workshop.prepareBattle(run,battle,true);return battle;};
})();
