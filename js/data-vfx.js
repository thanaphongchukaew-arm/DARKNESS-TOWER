// Explicit choreography catalog. Visual classification never consumes game RNG.
(function () {
  var G = window.Game, D = G.Data;
  var families = {
    slash: [620, 0.40], cross: [680, 0.42], cleave: [740, 0.46], thrust: [580, 0.44],
    claw: [620, 0.40], bite: [620, 0.44], punch: [600, 0.42], arrow: [680, 0.53], bullet: [540, 0.45],
    fireball: [900, 0.56], iceShard: [820, 0.55], lightning: [740, 0.40], windBlade: [760, 0.52],
    magicBolt: [820, 0.54], beam: [900, 0.46], breath: [1100, 0.50],
    storm: [1100, 0.48], wave: [940, 0.48], eruption: [960, 0.46], blast: [1000, 0.48],
    drain: [960, 0.45], vine: [900, 0.52], bomb: [960, 0.56], curse: [800, 0.46], sigil: [820, 0.45],
    shield: [740, 0.42], empower: [740, 0.42], haste: [720, 0.42], heal: [840, 0.44], cleanse: [840, 0.42],
    music: [940, 0.48], puppet: [1000, 0.50], temporal: [980, 0.48], petals: [1000, 0.50],
    swarm: [920, 0.50], roar: [800, 0.46], overdrive: [1200, 0.52], allout: [1150, 0.50], phase: [1000, 0.48], cloud: [900, 0.48]
  };
  var skillFamilies = {}, enemyFamilies = {};
  function bind(table, family, names) {
    names.split('|').forEach(function (id) {
      if (!id) return;
      if (table[id]) throw new Error('Duplicate VFX choreography: ' + id);
      table[id] = family;
    });
  }
  bind(skillFamilies, 'slash', 'attack|holy_strike|sword_absolution|rune_slash|spellsword_finale|lightning_blade_strike|shadow_step|midnight_execution|runic_edge|blood_rune_slash|oathbreakers_judgment|shadow_verdict_blade|warlord_cleave|crippling_strike|reaping_slash|bloodlust_edge|flowing_strike|sunder_strike');
  bind(skillFamilies, 'cross', 'cross_slash|blademasters_flourish|twin_lightning_cut|twin_fang_dance|nightblade_waltz|twin_shadow_fangs|thousand_cuts');
  bind(skillFamilies, 'cleave', 'blade_dance|end_bringer|reckless_strike|lifesteal_cleave|raging_whirl|berserks_end|bloodletting_axe|wind_wheel_slash|blade_of_a_thousand_shadows|final_march|coup_de_grace');
  bind(skillFamilies, 'thrust', 'armor_piercer|iai_strike|tempest_lance|last_hunt|endless_assault');
  bind(skillFamilies, 'fireball', 'fire_bolt|primal_spark|soul_ember|concentrated_blast');
  bind(skillFamilies, 'iceShard', 'ice_shard|frost_vision|temporal_shard|riptide_bolt');
  bind(skillFamilies, 'lightning', 'spark|radiant_thunder|piercing_voltage|thunder_brand|static_charge|heart_of_thunder|abyssal_voltage');
  bind(skillFamilies, 'windBlade', 'gale_cut|spirit_arrow|pouncing_gale|predators_instinct|phantom_barrage');
  bind(skillFamilies, 'beam', 'holy_ray|smite|called_shot|one_shot_one_kill');
  bind(skillFamilies, 'magicBolt', 'curse_bolt|hex_bolt|twin_elements|elemental_barrage');
  bind(skillFamilies, 'bite', 'shadow_bite|wolfsbane_fang|fang_and_claw|alpha_predators_strike|rending_bite');
  bind(skillFamilies, 'storm', 'inferno|blizzard|thunderstorm|tempest|elemental_cascade|bramble_storm|eternal_frost|thunderhead|eye_of_the_storm|abyssal_tempest|hellstorm_pact|infinite_horizon');
  bind(skillFamilies, 'wave', 'radiant_wave|abyss_wave|runic_discharge|storm_surge|corroding_tide|oblivion_wave');
  bind(skillFamilies, 'eruption', 'grave_eruption|grave_horror|prophetic_glacier|glacial_prophecy|sigil_of_ruin');
  bind(skillFamilies, 'blast', 'almighty_burst|grand_cataclysm|judgment|cataclysm_damned|wrath_of_wilds|demonic_covenant|apocalypse_of_ruin');
  bind(skillFamilies, 'heal', 'heal|greater_heal|soothing_light|cleansing_light|oracles_respite');
  bind(skillFamilies, 'empower', 'focus|warriors_wrath|elemental_sovereignty|bloodlust|hunters_focus|spirit_possession|blood_covenant|arcane_edge|gathering_storm|shadowhunters_focus|headhunters_gambit|dark_communion|primal_howl|forests_vigor|bushido_focus|eagle_eye|steady_aim|rallying_banner');
  bind(skillFamilies, 'shield', 'iron_stance|sanctuary|angelic_ward|divine_aegis|eternal_guardian|natures_blessing|frost_ward|veil_of_night|runic_ward|iron_wall_command|vanguards_resolve');
  bind(skillFamilies, 'haste', 'haste|chi_step');
  bind(skillFamilies, 'curse', 'mark_of_sin|withering_curse|infernal_pact|chilling_omen|static_discharge_curse|whispering_fear|mark_for_death|venom_mark');
  bind(skillFamilies, 'sigil', 'guard_break|guard_sunder|elemental_seal|weak_point_strike|holy_brand|piercing_gaze|sundering_rune|binding_sigil|shatter_line|warlords_decree|crimson_seal');
  bind(skillFamilies, 'roar', 'intimidating_roar');
  bind(skillFamilies, 'arrow', 'piercing_shot|binding_shot|arrow_rain|perfect_shot|rapid_volley|shadow_binding_shot');
  bind(skillFamilies, 'bullet', 'quickdraw|arcane_round|bullet_storm|dead_mans_trigger|kneecap_shot|silver_round|aimed_shot|crippling_shot|suppressing_fire|snap_shot|heartseeker_round');
  bind(skillFamilies, 'drain', 'soul_siphon|fiendish_soul_drain|blood_pact|soul_harvest');
  bind(skillFamilies, 'punch', 'thunder_palm|hundred_fists|thousand_volt_fist|annihilating_fist');
  bind(skillFamilies, 'vine', 'thorn_whip|withering_vines');
  bind(skillFamilies, 'bomb', 'flame_flask|toxic_flask|weakening_brew|volatile_cocktail|grand_concoction|empowering_elixir');
  bind(skillFamilies, 'petals', 'thousand_cherry_blossoms');
  bind(skillFamilies, 'music', 'discordant_note|song_of_valor|dirge_of_despair|anthem_of_rally|finale_of_the_ages|unnerving_melody|piercing_refrain|puppeteers_chant');
  bind(skillFamilies, 'swarm', 'feral_stampede');
  bind(skillFamilies, 'puppet', 'marionette_strike|severed_strings|puppet_shackles|dance_of_marionettes|final_curtain_call|demon_marionette');
  bind(skillFamilies, 'temporal', 'haste_field|temporal_lock|accelerated_moment|end_of_days|temporal_fracture|crushing_timeline|temporal_step');
  bind(skillFamilies, 'wave', 'saltwater_curse|maelstrom_focus');

  bind(enemyFamilies, 'bite', "Rending Bite|Frost Fang|Blood Drain Bite|Venom Bite|Venom Fang|Hellfire Bite|Iron Jaw Crush|Crystal Fang Bite|Voltaic Bite|Bone Fang Strike|Mandible Crush|Molten Fang Bite|Heat-Draining Bite|Voltaic Fang|Rootfang Bite|Nightfall Bite|Deep Freeze Bite|Void-Devouring Bite|Chimeric Flame Fang|Flux-Warped Bite|Time-Eroding Bite|Queen's Blood Drain|Frozen Bite|Abyssal Maw Crush");
  bind(enemyFamilies, 'claw', 'Claw Swipe|Swooping Claw|Sharp Leg Strike|Lightning Peck|Talon Storm|Talon Rend|Blazing Claw|Primeval Claw|Diving Talon|Gale Talon Dive|Rapid Peck|Frostbite Talon|Chaotic Claw Rend|Alpha Talon|Obsidian Claw|Abyssal Frost Claw');
  bind(enemyFamilies, 'punch', "Rock Smash|Iron Fist|Club Smash|Geode Crush|Ember Fist Slam|Gear-Crushing Fist|Piston Drive Punch|Rootbound Crushing Fist|Primordial Ice Fist|Nebula-Crushing Fist|Chaos-Forged Fist|Time-Crushing Fist|Iron Slam|Steel Arm Swing|Ember Fist|Crystal Titan Fist|Core-Forged Fist|Grand Automaton's Fist|Chaos Forge Hammer");
  bind(enemyFamilies, 'thrust', 'Quick Stab|Thunder Lance Pierce|Eternal Blade Pierce|Twilight Wing Pierce');
  bind(enemyFamilies, 'arrow', 'Hatchet Throw|Fungal Spore Spike');
  bind(enemyFamilies, 'slash', "Ice Blade Slash|Shadow Blade|Reaper's Scythe|Hellfire Blade|Scythe of Doom|Rotor Blade Slice|Marshal's Thunder Blade|Blade of Unending Time");
  bind(enemyFamilies, 'cleave', 'Tail Slam|Tail Whip|Refracting Tail Swipe|Icy Tail Lash|Glacial Tail Slam|Wing Slam|Shield Bash|Storm Shield Bash');
  bind(enemyFamilies, 'breath', 'Ice Breath|Flame Breath|Ancient Breath|Sandblast Spray|Iron-Melting Flame Breath|Soul-Freezing Breath|Elemental Flux Breath|Eternal Frost Breath|Molten Breath|Sovereign\'s Glacial Breath');
  bind(enemyFamilies, 'fireball', "Flame Lick|Infernal Spark|Regal Blaze|Searing Mass|Warden's Blaze|Throne of Flame|Boundless Purging Flame|Ashen Pharaoh's Scepter");
  bind(enemyFamilies, 'beam', 'Prism Beam|Falling Star Beam|Fallen Radiance Beam|Bastion Energy Beam');
  bind(enemyFamilies, 'lightning', "Cursed Bolt|Static Discharge|Titan's Thunder|Scatter Glimmer|Cherub's Wrathful Bolt|Lightning Scale Flash|Spark Charge Ram|Discordant Discharge|Time-Shattering Bolt");
  bind(enemyFamilies, 'magicBolt', 'Prism Shard Burst|Energy Bolt Volley');
  bind(enemyFamilies, 'drain', 'Soul Drain|Drowning Soul Grasp');
  bind(enemyFamilies, 'roar', "Wailing Scream|Infernal Roar|Cursed Howl|Mournful Chime Toll|Sunken Wail|Chilling Shriek|Piercing Shriek|Intimidating Roar|Abyssal Call|Resonant Soul Toll|Sky-Shaking Command|Call of Succession|Herald's Proclamation of the End");
  bind(enemyFamilies, 'music', "Siren's Deadly Song|Shattering Crystal Hymn");
  bind(enemyFamilies, 'curse', "Heartbreak Curse|Pit Curse|Devil's Decree|Infernal Edict|Sand-Swallowing Curse|Djinn's Curse|Astral Ruin Curse|Curse of Discord|Sanctum's Corrupting Curse|Smoldering Curse|Deep Sea Curse|Ancient Mummy's Curse|Eternal Flame Curse|Soul Scorch|Soul Freeze|Crush All Moments");
  bind(enemyFamilies, 'swarm', 'Devouring Scarab Swarm');
  bind(enemyFamilies, 'vine', 'Soul-Binding Thorns|Deathvine Lash');
  bind(enemyFamilies, 'wave', "Void Wave|Wing Gale|Void Ripple|Tidal Slam|Whirlpool Surge|Wailing Soul Wave|Heat Wave|Leviathan's Tidal Wave|Warden's Lava Torrent|Blighted Heartbeat Pulse|Collapsing Galaxy Wave|Forge-Wide Discord Wave|Collapsing Dimension Wave|Ashfall Firewave");
  bind(enemyFamilies, 'storm', "Ashen Sandstorm Hex|Gale Wingbeat|Citadel Cyclone|Eternal Sandstorm|Endless Blizzard|Sovereign's Grand Tempest");
  bind(enemyFamilies, 'blast', 'Ground-Shaking Slam|Pyroclastic Dive|Tremor Slam|Disruption Field|All-Element Overload|Endless Annihilation');
  bind(enemyFamilies, 'sigil', 'Crushing Coil|Storm Coil Crush|Lava Coil Crush|Dimensional Coil|Twilight Coil Crush');
  bind(enemyFamilies, 'eruption', 'Devouring Glacier|Eternal Ice Throne');
  bind(enemyFamilies, 'temporal', "Dimensional Tear|Rift-Devouring Rend|Warden's Dimensional Tear");
  bind(enemyFamilies, 'cloud', 'Toxic Spore Cloud|Spore of Decay');
  bind(enemyFamilies, 'windBlade', 'Wind Blade');
  bind(enemyFamilies, 'punch', 'Sticky Slam');
  bind(enemyFamilies, 'roar', 'Scorching Roar');
  bind(enemyFamilies, 'storm', 'Starfall Barrage');
  bind(enemyFamilies, 'claw', 'Swift Dive');
  bind(enemyFamilies, 'eruption', 'Inferno Collapse');
  bind(enemyFamilies, 'sigil', 'Boon Rend');
  bind(enemyFamilies, 'drain', 'Mana Siphon');
  bind(enemyFamilies, 'vine', 'Pin the Ally');
  bind(enemyFamilies, 'curse', 'Kiss of Ruin|Kiss of Death');
  var palettes = {
    phys: ['#ffe7b5','#e9b262','#8d654c'], fire: ['#fff2b1','#ff9b3e','#dc3d3a'],
    ice: ['#e5ffff','#85dcf5','#4e83d5'], elec: ['#ffffd3','#fee565','#9b81ff'],
    wind: ['#e0ffe9','#83e4c4','#3b9999'], light: ['#ffffe8','#ffe29d','#d9b5ee'],
    dark: ['#f0d1ff','#b57be0','#604593'], almighty: ['#ffffff','#ffb3e0','#91a9ff'],
    poison: ['#e3ffbb','#9fd86b','#577843'], heal: ['#e3ffdc','#8fe0a5','#3d926e'],
    mana: ['#d9faff','#83b7ff','#5864c6'], blood: ['#ffc0b2','#e6667c','#7b325e'],
    water: ['#d4ffff','#70d0ea','#406eaf'], petals: ['#fff0fa','#f6b2d3','#b875b5']
  };
  var overrides = {
    bloodlust: { palette: 'blood', motif: 'heart' }, blood_covenant: { palette: 'blood', motif: 'heart' },
    warriors_wrath: { palette: 'fire', motif: 'axe' }, hunters_focus: { motif: 'eye' }, steady_aim: { motif: 'eye' }, eagle_eye: { motif: 'eye' },
    spirit_possession: { motif: 'spirit' }, natures_blessing: { motif: 'leaf' }, forests_vigor: { motif: 'leaf' },
    angelic_ward: { motif: 'wings' }, divine_aegis: { motif: 'wings' }, veil_of_night: { motif: 'veil' },
    final_curtain_call: { motif: 'curtain' }, phantom_barrage: { motif: 'ghost' }, infinite_horizon: { family: 'wave' },
    smite: { fromAbove: true }, judgment: { motif: 'cross' },
    primal_howl: { family: 'roar' }, spirit_arrow: { family: 'arrow' }, pouncing_gale: { family: 'claw' }, predators_instinct: { family: 'claw' },
    feral_stampede: { motif: 'beast', strikes: 5 }, frost_vision: { motif: 'eye' },
    dark_communion: { motif: 'ritual', palette: 'blood' }, crimson_seal: { palette: 'blood' },
    cross_slash: { strikes: 2 }, twin_lightning_cut: { strikes: 2, palette: 'elec' },
    thousand_cuts: { strikes: 3 }, hundred_fists: { strikes: 7 }, thousand_volt_fist: { strikes: 4 },
    rapid_volley: { strikes: 4 }, bullet_storm: { strikes: 5 }, suppressing_fire: { strikes: 4 },
    twin_fang_dance: { strikes: 2 }, twin_shadow_fangs: { strikes: 2 },
    blade_of_a_thousand_shadows: { strikes: 5, palette: 'dark' }, shadow_step: { palette: 'dark' },
    wind_wheel_slash: { spin: true }, raging_whirl: { spin: true }, blade_dance: { spin: true },
    lifesteal_cleave: { drain: true, palette: 'blood' }, bloodlust_edge: { palette: 'blood' },
    bloodletting_axe: { motif: 'axe', palette: 'blood' }, reaping_slash: { motif: 'scythe' },
    soul_siphon: { drain: true }, fiendish_soul_drain: { drain: true }, soul_harvest: { drain: true },
    blood_pact: { drain: true, palette: 'blood' },
    thorn_whip: { palette: 'poison' }, withering_vines: { palette: 'poison' },
    toxic_flask: { palette: 'poison' }, weakening_brew: { palette: 'poison' }, grand_concoction: { palette: 'poison' },
    venom_mark: { palette: 'poison' }, wolfsbane_fang: { palette: 'poison' },
    saltwater_curse: { palette: 'water' }, corroding_tide: { palette: 'water' }, riptide_bolt: { palette: 'water' },
    storm_surge: { palette: 'water' }, abyssal_tempest: { palette: 'water' }, maelstrom_focus: { palette: 'water' },
    thousand_cherry_blossoms: { palette: 'petals', strikes: 6 },
    anthem_of_rally: { strikes: 3 }, finale_of_the_ages: { strikes: 5 },
    temporal_shard: { motif: 'clock' }, glacial_prophecy: { scale: 1.2 }, end_of_days: { scale: 1.25 },
    apocalypse_of_ruin: { scale: 1.4 }, grand_cataclysm: { scale: 1.3 },
    holy_brand: { motif: 'cross' }, cross_of_judgment: { family: 'beam', motif: 'cross' },
    rallying_banner: { motif: 'banner' }, iron_wall_command: { motif: 'shield' },
    empowering_elixir: { selfItem: true, palette: 'fire' }, binding_shot: { bind: true },
    shadow_binding_shot: { bind: true, palette: 'dark' },
    thunder_palm: { motif: 'palm' }, moonlit_slash: { family: 'slash', motif: 'moon' }
  };
  // These named techniques are defined separately because they deliberately cross element/weapon families.
  bind(skillFamilies, 'slash', 'moonlit_slash');
  bind(skillFamilies, 'beam', 'cross_of_judgment');
  function make(family, record, extras) {
    family = extras && extras.family ? extras.family : family;
    var data = families[family] || families.magicBolt;
    return Object.assign({ family: family, element: record.element || 'phys', palette: record.element || 'phys', duration: data[0], impact: data[1], scale: Math.min(1.35, 0.85 + (record.power || 1) * 0.12), strikes: 1 }, extras || {});
  }
  var skills = {}, attacks = {}, missing = [];
  D.skills.forEach(function (skill) {
    var family = skillFamilies[skill.id];
    if (!family) { missing.push('skill:' + skill.id); family = 'magicBolt'; }
    skills[skill.id] = make(family, skill, Object.assign({ key: skill.id, kind: skill.kind, target: skill.target, declared: !!skillFamilies[skill.id] }, overrides[skill.id] || {}));
  });
  D.getAllEnemyTemplates().forEach(function (enemy) {
    [enemy.attacks].concat((enemy.phases || []).map(function (phase) { return phase.attacks; })).forEach(function (pool, phaseIndex) {
      pool.forEach(function (attack, index) {
        var family = enemyFamilies[attack.nameEn], key = enemy.id + ':' + phaseIndex + ':' + index;
        if (!family) { missing.push('enemy:' + enemy.id + ':' + attack.nameEn); family = attack.element === 'phys' ? 'claw' : 'magicBolt'; }
        var extra = { key: key, kind: 'attack', target: 'singleEnemy', declared: !!enemyFamilies[attack.nameEn], enemyId: enemy.id };
        if (/Venom|Toxic|Spore|Fungal|Thorn|Decay/.test(attack.nameEn)) extra.palette = 'poison';
        if (/Tidal|Whirlpool|Sea|Lava Torrent/.test(attack.nameEn)) extra.palette = /Lava/.test(attack.nameEn) ? 'fire' : 'water';
        if (/Sand/.test(attack.nameEn)) extra.palette = 'phys';
        if (/Drain|Draining/.test(attack.nameEn) || attack.drainSelf) extra.drain = true;
        if (/Dive|Swooping/.test(attack.nameEn)) extra.motion = 'dive';
        if (/Fungal Spore Spike/.test(attack.nameEn)) extra.motif = 'thorn';
        if (/Kiss/.test(attack.nameEn)) extra.motif = 'heart';
        if (/Fist|Punch/.test(attack.nameEn)) extra.motif = 'fist';
        if (/Hammer|Club/.test(attack.nameEn)) extra.motif = 'hammer';
        if (/Peck/.test(attack.nameEn)) { extra.family = 'thrust'; extra.motif = 'beak'; extra.strikes = 2; }
        if (/Volley|Barrage/.test(attack.nameEn)) extra.strikes = 4;
        if (/Tail/.test(attack.nameEn)) extra.motif = 'tail';
        if (/Shield/.test(attack.nameEn)) extra.motif = 'shield';
        if (/Hatchet/.test(attack.nameEn)) extra.motif = 'axe';
        if (/Coil/.test(attack.nameEn)) { extra.bind = true; extra.family = 'vine'; extra.motif = 'coil'; }
        attack.vfxKey = key;
        attacks[key] = make(family, attack, extra);
      });
    });
  });
  function skill(id, classId) {
    var profile = skills[id];
    if (id === 'attack' && classId) {
      var cls = D.getClass(classId), family = 'slash';
      if (['ranger', 'beastmaster'].indexOf(classId) !== -1) family = 'arrow';
      else if (['gunslinger', 'sharpshooter'].indexOf(classId) !== -1) family = 'bullet';
      else if (classId === 'monk') family = 'punch';
      else if (classId === 'bard') family = 'music';
      else if (classId === 'puppeteer') family = 'puppet';
      else if (cls && cls.baseStats.mag > cls.baseStats.atk) family = 'magicBolt';
      return make(family, { element: 'phys', power: 1 }, { key: 'attack', kind: 'attack', target: 'singleEnemy', declared: true });
    }
    return profile || make('magicBolt', {}, { key: id || 'unknown', kind: 'attack' });
  }
  function item(id) {
    var it = D.getItem(id), type = it && it.effect ? it.effect.type : '';
    return make(type === 'cleanse' ? 'cleanse' : 'heal', {}, { key: id, kind: 'item', itemType: type, itemIcon: it ? it.icon : 'potion', palette: type === 'healMp' ? 'mana' : type === 'healBoth' ? 'almighty' : type === 'cleanse' ? 'light' : 'heal', duration: 920, impact: 0.48, declared: !!(it && it.battleUsable && ['healHp','healMp','healBoth','cleanse'].indexOf(type) !== -1) });
  }
  G.VFXData = { families: families, palettes: palettes, skills: skills, attacks: attacks, missing: missing, skill: skill, item: item, make: make };
})();
