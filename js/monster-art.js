// 16-bit monster assets. IDs and gameplay templates remain unchanged.
(function () {
  var known = {
    'shadow_wolf': true,
    'flame_imp': true,
    'stone_golem': true,
    'dark_bat': true,
    'gust_sprite': true,
    'giant_spider': true,
    'bog_slime': true,
    'forest_bandit': true,
    'frost_knight': true,
    'thunder_hawk': true,
    'venom_wraith': true,
    'iron_sentinel': true,
    'storm_harpy': true,
    'swamp_troll': true,
    'crystal_golem': true,
    'banshee': true,
    'abyss_knight': true,
    'inferno_beast': true,
    'glacial_wyrm': true,
    'thunder_revenant': true,
    'void_sentinel': true,
    'young_wyvern': true,
    'imp_captain': true,
    'bone_reaper': true,
    'crimson_drake': true,
    'venom_hydra': true,
    'hell_hound': true,
    'succubus': true,
    'iron_wyrm': true,
    'pit_fiend': true,
    'ancient_wyrm': true,
    'archdevil': true,
    'doom_reaper': true,
    'void_dragon': true,
    'inferno_duke': true,
    'storm_titan': true,
    'crystal_wisp': true,
    'prism_lynx': true,
    'chime_wraith': true,
    'geode_golem': true,
    'drowned_revenant': true,
    'abyssal_eel': true,
    'tide_golem': true,
    'siren_wraith': true,
    'gale_falcon': true,
    'thunder_cherub': true,
    'storm_lancer': true,
    'cloud_serpent': true,
    'sand_wraith': true,
    'bone_serpent': true,
    'scarab_swarm': true,
    'dust_djinn': true,
    'magma_hound': true,
    'cinder_golem': true,
    'lava_serpent': true,
    'pyroclast_bat': true,
    'gear_sentinel': true,
    'spark_hound': true,
    'piston_golem': true,
    'rotor_wraith': true,
    'fungal_stalker': true,
    'thorn_wraith': true,
    'spore_bat': true,
    'rootbound_golem': true,
    'frost_spawn': true,
    'glacial_wraith': true,
    'rime_golem': true,
    'frozen_harpy': true,
    'star_wisp': true,
    'void_serpent': true,
    'nebula_golem': true,
    'astral_wraith': true,
    'chimeric_hound': true,
    'chaos_golem': true,
    'discord_wraith': true,
    'flux_serpent': true,
    'twilight_seraph': true,
    'chrono_golem': true,
    'sanctum_wraith': true,
    'chrono_serpent': true,
    'steel_golem': true,
    'bat_queen': true,
    'inferno_warden': true,
    'wyvern_alpha': true,
    'flame_overlord': true,
    'glacial_tyrant': true,
    'abyssal_matriarch': true,
    'obsidian_dragon': true,
    'choir_warden': true,
    'leviathan_herald': true,
    'tempest_marshal': true,
    'pharaoh_ash': true,
    'core_warden': true,
    'grand_automaton': true,
    'blight_heart': true,
    'frost_sovereign': true,
    'rift_warden': true,
    'forge_master': true,
    'timeless_herald': true,
    'timeless_sovereign': true
  };
  // The first wolf was generated before the left-facing direction was specified.
  // Mirror only its image layer, never UI, phase markers or champion badges.
  var sourceFacingRight = { shadow_wolf: true };
  // [w, h, x0, y0, x1, y1]: PNG size and opaque bounding box, used to ground and size each sprite.
  var metrics = {
    'abyss_knight': [64,80,2,31,62,78],
    'abyssal_eel': [80,64,9,2,70,62],
    'abyssal_matriarch': [96,96,4,2,92,94],
    'ancient_wyrm': [80,64,7,2,73,62],
    'archdevil': [64,80,2,17,62,78],
    'astral_wraith': [64,64,3,3,61,62],
    'banshee': [64,64,3,2,60,62],
    'bat_queen': [128,96,14,2,114,94],
    'blight_heart': [96,96,2,9,94,94],
    'bog_slime': [64,64,2,22,62,62],
    'bone_reaper': [64,80,2,24,62,78],
    'bone_serpent': [80,64,12,2,68,62],
    'chaos_golem': [64,64,2,6,62,62],
    'chime_wraith': [64,64,2,2,62,62],
    'chimeric_hound': [80,64,2,2,78,62],
    'choir_warden': [96,96,2,9,94,94],
    'chrono_golem': [64,64,2,4,62,62],
    'chrono_serpent': [80,64,12,2,67,62],
    'cinder_golem': [64,64,2,8,62,62],
    'cloud_serpent': [80,64,8,2,71,62],
    'core_warden': [96,96,2,7,94,94],
    'crimson_drake': [64,64,2,27,62,62],
    'crystal_golem': [64,64,2,8,62,62],
    'crystal_wisp': [64,64,2,2,61,62],
    'dark_bat': [80,64,5,2,74,62],
    'discord_wraith': [64,64,2,3,62,62],
    'doom_reaper': [64,80,2,18,62,78],
    'drowned_revenant': [64,64,2,3,62,62],
    'dust_djinn': [64,64,2,2,62,62],
    'flame_imp': [64,64,2,5,62,62],
    'flame_overlord': [96,96,2,9,94,94],
    'flux_serpent': [80,64,11,2,69,62],
    'forest_bandit': [64,80,2,20,62,78],
    'forge_master': [96,96,2,10,94,94],
    'frost_knight': [64,80,2,25,62,78],
    'frost_sovereign': [96,96,2,8,94,94],
    'frost_spawn': [64,64,2,14,62,62],
    'frozen_harpy': [64,64,2,7,62,61],
    'fungal_stalker': [64,64,2,13,62,62],
    'gale_falcon': [80,64,8,2,71,61],
    'gear_sentinel': [64,64,2,4,62,62],
    'geode_golem': [64,64,2,8,62,62],
    'giant_spider': [80,64,2,2,78,62],
    'glacial_tyrant': [96,96,2,11,94,94],
    'glacial_wraith': [64,64,2,4,62,62],
    'glacial_wyrm': [80,64,6,2,73,62],
    'grand_automaton': [96,96,2,4,94,94],
    'gust_sprite': [64,64,2,5,62,62],
    'hell_hound': [80,64,5,2,75,62],
    'imp_captain': [64,64,2,5,62,62],
    'inferno_beast': [64,64,2,8,62,62],
    'inferno_duke': [64,64,5,2,59,62],
    'inferno_warden': [96,96,2,7,94,94],
    'iron_sentinel': [64,64,2,8,62,62],
    'iron_wyrm': [80,64,6,2,73,62],
    'lava_serpent': [80,64,8,2,72,62],
    'leviathan_herald': [128,96,18,2,109,94],
    'magma_hound': [80,64,2,8,78,62],
    'nebula_golem': [64,64,2,2,62,62],
    'obsidian_dragon': [128,96,12,2,116,94],
    'pharaoh_ash': [96,96,2,8,94,94],
    'piston_golem': [64,64,2,14,62,62],
    'pit_fiend': [64,80,2,29,62,78],
    'prism_lynx': [80,64,2,2,77,62],
    'pyroclast_bat': [80,64,2,2,78,62],
    'rift_warden': [96,96,2,5,94,94],
    'rime_golem': [64,64,2,10,62,62],
    'rootbound_golem': [64,64,2,4,62,62],
    'rotor_wraith': [64,64,3,2,61,62],
    'sanctum_wraith': [64,64,2,2,61,62],
    'sand_wraith': [64,64,2,5,62,61],
    'scarab_swarm': [80,64,12,2,68,62],
    'shadow_wolf': [80,64,2,11,78,62],
    'siren_wraith': [64,64,2,2,61,62],
    'spark_hound': [80,64,2,19,78,62],
    'spore_bat': [80,64,6,2,73,61],
    'star_wisp': [64,64,3,5,62,62],
    'steel_golem': [128,96,11,2,116,94],
    'stone_golem': [64,64,2,10,62,62],
    'storm_harpy': [64,64,2,3,62,62],
    'storm_lancer': [64,80,3,37,62,78],
    'storm_titan': [64,64,2,5,62,62],
    'succubus': [64,80,2,18,62,78],
    'swamp_troll': [64,80,2,28,62,78],
    'tempest_marshal': [96,96,2,15,94,94],
    'thorn_wraith': [64,64,2,2,62,62],
    'thunder_cherub': [64,64,2,5,62,61],
    'thunder_hawk': [80,64,9,2,71,62],
    'thunder_revenant': [64,64,2,2,62,62],
    'tide_golem': [64,64,2,3,62,62],
    'timeless_herald': [96,96,2,2,94,94],
    'timeless_sovereign-phase-2': [128,128,8,2,120,126],
    'timeless_sovereign-phase-3': [128,128,5,2,123,126],
    'timeless_sovereign-phase-4': [128,128,2,4,126,126],
    'timeless_sovereign': [128,128,3,2,124,126],
    'twilight_seraph': [64,64,2,8,62,62],
    'venom_hydra': [80,64,9,2,71,62],
    'venom_wraith': [64,64,2,2,62,62],
    'void_dragon': [80,64,6,2,74,62],
    'void_sentinel': [64,64,2,3,62,62],
    'void_serpent': [80,64,10,2,69,62],
    'wyvern_alpha': [128,96,11,2,117,94],
    'young_wyvern': [80,64,7,2,73,62]
  };
  // Silhouette height (viewBox units, 64 = full card) by monster family; first match wins.
  var sizeRules = [
    [/bat$|^flame_imp|wisp|scarab|cherub|sprite/, 28],
    [/slime/, 30],
    [/spider|wolf|lynx|falcon|hawk|harpy|stalker|eel|spark_hound/, 38],
    [/hell_hound|magma_hound|chimeric_hound/, 46],
    [/wraith|banshee|djinn|seraph|spawn|bandit|imp_captain|revenant|succubus|lancer|knight|reaper/, 50],
    [/golem|sentinel|troll|beast|pit_fiend|duke/, 58],
    [/serpent|wyrm|drake|wyvern|hydra|dragon|titan|archdevil/, 66]
  ];
  var flyers = /bat$|wisp|sprite|harpy|falcon|hawk|cherub|wraith|banshee|djinn|seraph|wyvern/;
  function layout(id) {
    var m = metrics[id];
    if (!m) return null;
    var w = m[0], h = m[1], bw = m[4] - m[2], bh = m[5] - m[3], flying = flyers.test(id), k, H = 0;
    if (Math.max(w, h) >= 96) k = 60 / Math.max(w, h);
    else {
      for (var i = 0; i < sizeRules.length; i++) if (sizeRules[i][0].test(id)) { H = sizeRules[i][1]; break; }
      k = Math.min((H || 50) / bh, 72 / bw);
    }
    var lift = flying ? 6 : 0, sw = bw * k;
    return { k: k, w: w * k, h: h * k, x: 32 - (m[2] + bw / 2) * k, y: 61 - lift - m[5] * k, lift: lift,
             gw: Math.min(72, sw * (flying ? 0.5 : 0.85)), go: flying ? 0.5 : 0.85, sw: Math.min(sw, 72), sh: Math.min(bh * k + lift, 80) };
  }
  function idOf(enemy) { return enemy.templateId || enemy.id || ''; }
  function has(enemy) { return Object.prototype.hasOwnProperty.call(known, typeof enemy === 'string' ? enemy : idOf(enemy)); }
  function body(enemy) {
    var id = idOf(enemy);
    if (!has(id)) return '';
    var phase = Math.max(1, Math.min(4, enemy.phase || 1));
    var suffix = id === 'timeless_sovereign' && phase > 1 ? '-phase-' + phase : '';
    var mirror = sourceFacingRight[id] ? ' transform="translate(64 0) scale(-1 1)"' : '';
    var L = layout(id + suffix);
    var art = '<g class="enemy-body" data-facing="left"><g' + mirror + '><image class="monster-sprite" href="assets/pixel16/monsters/' + id + suffix + '.png" x="' + L.x.toFixed(2) + '" y="' + L.y.toFixed(2) + '" width="' + L.w.toFixed(2) + '" height="' + L.h.toFixed(2) + '"/></g></g>';
    if (id === 'timeless_sovereign' && phase >= 3) art += '<g class="sovereign-fragments" fill="#c8f4ff"><path d="M3 18L6 15 7 21ZM57 14L61 17 57 20Z"/></g>';
    if (id === 'timeless_sovereign' && phase >= 4) art += '<path class="sovereign-rift" d="M31 2L29 8 33 11M33 52L30 57 33 62" fill="none" stroke="#ff94b3"/>';
    return art;
  }
  // Inline custom properties for the ground shadow (sized to the monster, not the card).
  function ground(enemy) {
    var id = idOf(enemy), phase = Math.max(1, Math.min(4, enemy.phase || 1)), L = has(id) && layout(id === 'timeless_sovereign' && phase > 1 ? id + '-phase-' + phase : id);
    return L ? ' style="--gw:' + L.gw.toFixed(1) + ';--gh:' + (L.gw * 0.2).toFixed(1) + ';--go:' + L.go + ';--sw:' + L.sw.toFixed(1) + ';--sh:' + L.sh.toFixed(1) + '"' : '';
  }
  var byIcon = {};
  window.Game.Data.getAllEnemyTemplates().forEach(function (enemy) { if (has(enemy)) byIcon[enemy.icon] = enemy; });
  function icon(name) {
    var enemy = byIcon[name];
    return enemy ? '<svg xmlns="http://www.w3.org/2000/svg" class="pixel-sprite monster-icon" viewBox="0 0 64 64" aria-hidden="true">' + body(enemy) + '</svg>' : '';
  }
  window.Game.MonsterArt = { has: has, body: body, icon: icon, ground: ground };
})();
