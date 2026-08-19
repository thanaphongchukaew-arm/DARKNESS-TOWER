// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Crafting recipes: consume monster-drop materials (+ gold) to produce a
// craft-only equipment item (see the craftOnly items in data-items.js). One
// recipe per tier, unlocked at the crafting bench once the player reaches
// that tier's floor range, same gating as the shop and reward pools. Tiers
// 6-9 unlock across the hidden upper tower's first four zones (floors 45-64)
// and use the new tier-6..9 materials those zones' monsters drop.
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
      materials: [{ id: 'mat_ancient_scale', qty: 5 }, { id: 'mat_abyssal_essence', qty: 4 }] },
    { id: 'craft_resonant_bulwark', resultId: 'a_craft_resonant_bulwark', resultQty: 1, tier: 6, gold: 1100,
      materials: [{ id: 'mat_resonant_shard', qty: 5 }, { id: 'mat_crystal_dust', qty: 4 }] },
    { id: 'craft_undertow_striders', resultId: 's_craft_undertow_striders', resultQty: 1, tier: 7, gold: 1800,
      materials: [{ id: 'mat_abyssal_scale', qty: 5 }, { id: 'mat_drowned_core', qty: 4 }] },
    { id: 'craft_stormcaller_band', resultId: 'c_craft_stormcaller_band', resultQty: 1, tier: 8, gold: 2900,
      materials: [{ id: 'mat_storm_feather', qty: 6 }, { id: 'mat_voltaic_core', qty: 5 }] },
    { id: 'craft_desert_sovereign', resultId: 'w_craft_desert_sovereign', resultQty: 1, tier: 9, gold: 4600,
      materials: [{ id: 'mat_bone_fragment', qty: 6 }, { id: 'mat_wraith_essence', qty: 5 }] }
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
