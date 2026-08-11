// Crafting recipes: consume monster-drop materials (+ gold) to produce a
// craft-only equipment item (see the craftOnly items in data-items.js). One
// recipe per tier, unlocked at the crafting bench once the player reaches
// that tier's floor range, same gating as the shop and reward pools.
(function () {
  var recipes = [
    { id: 'craft_fangblade', resultId: 'w_craft_fangblade', resultQty: 1, tier: 1, gold: 80,
      materials: [{ id: 'mat_beast_fang', qty: 4 }, { id: 'mat_spirit_dust', qty: 3 }] },
    { id: 'craft_ironward', resultId: 'a_craft_ironward', resultQty: 1, tier: 2, gold: 150,
      materials: [{ id: 'mat_iron_shard', qty: 4 }, { id: 'mat_storm_core', qty: 3 }] },
    { id: 'craft_wyvernstride', resultId: 's_craft_wyvernstride', resultQty: 1, tier: 3, gold: 260,
      materials: [{ id: 'mat_wyvern_scale', qty: 4 }, { id: 'mat_demon_fang', qty: 3 }] },
    { id: 'craft_dragonfangring', resultId: 'c_craft_dragonfangring', resultQty: 1, tier: 4, gold: 420,
      materials: [{ id: 'mat_dragon_scale', qty: 4 }, { id: 'mat_demonic_core', qty: 3 }] },
    { id: 'craft_voidreaver', resultId: 'w_craft_voidreaver', resultQty: 1, tier: 5, gold: 700,
      materials: [{ id: 'mat_ancient_scale', qty: 5 }, { id: 'mat_abyssal_essence', qty: 4 }] }
  ];

  window.Game = window.Game || {};
  window.Game.Data = window.Game.Data || {};
  window.Game.Data.recipes = recipes;
  window.Game.Data.getRecipesByTier = function (tier) {
    return recipes.filter(function (r) { return r.tier <= tier; });
  };
  window.Game.Data.getRecipe = function (id) {
    for (var i = 0; i < recipes.length; i++) if (recipes[i].id === id) return recipes[i];
    return null;
  };
})();
