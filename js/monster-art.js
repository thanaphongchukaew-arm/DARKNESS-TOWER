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
  function idOf(enemy) { return enemy.templateId || enemy.id || ''; }
  function has(enemy) { return Object.prototype.hasOwnProperty.call(known, typeof enemy === 'string' ? enemy : idOf(enemy)); }
  function body(enemy) {
    var id = idOf(enemy);
    if (!has(id)) return '';
    var phase = Math.max(1, Math.min(4, enemy.phase || 1));
    var suffix = id === 'timeless_sovereign' && phase > 1 ? '-phase-' + phase : '';
    var mirror = sourceFacingRight[id] ? ' transform="translate(64 0) scale(-1 1)"' : '';
    var art = '<g class="enemy-body" data-facing="left"><g' + mirror + '><image class="monster-sprite" href="assets/pixel16/monsters/' + id + suffix + '.png" x="2" y="2" width="60" height="60" preserveAspectRatio="xMidYMax meet"/></g></g>';
    if (id === 'timeless_sovereign' && phase >= 3) art += '<g class="sovereign-fragments" fill="#c8f4ff"><path d="M3 18L6 15 7 21ZM57 14L61 17 57 20Z"/></g>';
    if (id === 'timeless_sovereign' && phase >= 4) art += '<path class="sovereign-rift" d="M31 2L29 8 33 11M33 52L30 57 33 62" fill="none" stroke="#ff94b3"/>';
    return art;
  }
  var byIcon = {};
  window.Game.Data.getAllEnemyTemplates().forEach(function (enemy) { if (has(enemy)) byIcon[enemy.icon] = enemy; });
  function icon(name) {
    var enemy = byIcon[name];
    return enemy ? '<svg xmlns="http://www.w3.org/2000/svg" class="pixel-sprite monster-icon" viewBox="0 0 64 64" aria-hidden="true">' + body(enemy) + '</svg>' : '';
  }
  window.Game.MonsterArt = { has: has, body: body, icon: icon };
})();
