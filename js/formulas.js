// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Pure formulas: stat growth, damage, exp curve, floor/difficulty scaling.
(function () {
  // Nightmare is the only difficulty a new run can start on (see
  // ui-menu.js's startNightmareRun) -- easy/normal/hard stay defined here
  // because tests and other formulas (enemyStatScale, etc.) still reference
  // them, and each step keeps the same ~1.3x jump in statMult/rewardMult.
  var DIFFICULTY = {
    easy: { id: 'easy', name: 'ง่าย', nameEn: 'Easy', statMult: 0.72, rewardMult: 1.15, startPotions: 3 },
    normal: { id: 'normal', name: 'ปกติ', nameEn: 'Normal', statMult: 0.88, rewardMult: 1.0, startPotions: 2 },
    hard: { id: 'hard', name: 'ยาก', nameEn: 'Hard', statMult: 1.14, rewardMult: 1.35, startPotions: 1 },
    nightmare: { id: 'nightmare', name: 'ฝันร้าย', nameEn: 'Nightmare', statMult: 1.5, rewardMult: 1.8, startPotions: 0 }
  };

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function rnd(min, max) { return min + Math.random() * (max - min); }
  function round(v) { return Math.round(v); }

  function statAtLevel(base, growth, level) {
    return round(base + growth * (level - 1));
  }

  function playerStatsAtLevel(cls, level) {
    var out = {};
    Object.keys(cls.baseStats).forEach(function (k) {
      out[k] = statAtLevel(cls.baseStats[k], cls.growth[k] || 0, level);
    });
    return out;
  }

  // exp required to go from `level` to `level+1`
  function expToNext(level) {
    return round(13 * Math.pow(level, 1.5) + 10);
  }

  function floorEnemyCount(floor) {
    if (floor <= 4) return 1;
    if (floor <= 7) return Math.random() < 0.55 ? 1 : 2;
    if (floor <= 14) return Math.random() < 0.45 ? 1 : 2;
    if (floor <= 19) return Math.random() < 0.5 ? 2 : 3;
    if (floor <= 29) return Math.random() < 0.45 ? 2 : 3;
    if (floor <= 39) return Math.random() < 0.4 ? 3 : 4;
    if (floor <= 69) return Math.random() < 0.35 ? 3 : 4;
    if (floor <= 99) return Math.random() < 0.35 ? 4 : 5;
    return 1; // boss handled separately (floor 100)
  }

  function groupScaleFactor(count) {
    if (count <= 1) return 1.0;
    if (count === 2) return 0.62;
    if (count === 3) return 0.46;
    return 0.36; // 4+
  }

  function tierForFloor(floor) {
    if (floor <= 10) return 1;
    if (floor <= 20) return 2;
    if (floor <= 30) return 3;
    if (floor <= 40) return 4;
    if (floor <= 44) return 5;
    if (floor <= 49) return 6;
    if (floor <= 54) return 7;
    if (floor <= 59) return 8;
    if (floor <= 64) return 9;
    if (floor <= 69) return 10;
    if (floor <= 74) return 11;
    if (floor <= 79) return 12;
    if (floor <= 84) return 13;
    if (floor <= 89) return 14;
    if (floor <= 94) return 15;
    return 16;
  }

  // Equipment/consumable tiers only go up to 5 (see data-items.js) -- floors 45+ draw from the
  // same tier-5 pool, plus tier-6/7 gear layered in for the hidden upper tower (floors 45-100),
  // so shop stock and reward pools never come up empty on the new higher enemy tiers.
  function itemTierForFloor(floor) {
    if (floor <= 44) return Math.min(tierForFloor(floor), 5);
    if (floor <= 74) return 6;
    return 7;
  }

  function enemyStatScale(floor, difficultyId) {
    var diff = DIFFICULTY[difficultyId] || DIFFICULTY.normal;
    return (1 + 0.05 * (floor - 1)) * diff.statMult;
  }

  function bossStatScale(difficultyId) {
    var diff = DIFFICULTY[difficultyId] || DIFFICULTY.normal;
    return 1.22 * diff.statMult;
  }

  // Ascension: an opt-in, Nightmare-only prestige multiplier chosen at run creation
  // (see State.recordAscensionClear / isAscensionUnlocked), capped at 10 levels.
  // Composed into the `scale` argument at each enemy-actor-build call site in
  // battle-engine.js (never inside scaleStatsBlock itself, so a plain run is
  // never affected), and into the reward `rate` alongside difficulty/blessings.
  //
  // The two rates are deliberately close (0.09 vs 0.11, not e.g. 0.08 vs 0.12):
  // reward/enemy stays a roughly flat ~1.0-1.1 ratio across all 10 levels,
  // matching how the existing difficulty ladder's own reward/statMult ratio stays
  // in a tight band (Normal 1.14, Hard 1.18, Nightmare 1.20) rather than climbing.
  // A wider gap here would make level 10 a strictly better reward-per-difficulty
  // deal than level 1, turning "pick your Ascension level" into "always max it".
  var ASCENSION_MAX = 10;
  function ascensionEnemyMult(level) {
    return 1 + 0.09 * clamp(level || 0, 0, ASCENSION_MAX);
  }
  function ascensionRewardMult(level) {
    return 1 + 0.11 * clamp(level || 0, 0, ASCENSION_MAX);
  }

  // Endless Arena (survival mode): anchored to the player's current tower floor
  // (so it's immediately relevant at any point in a run, per the "doesn't depend
  // on floor progress" brief -- it just uses where you already are as a starting
  // point rather than gating on it), then climbs forever in fixed +15% steps
  // every 5 waves so the mode never plateaus, unlike the tower's capped 100 floors.
  function survivalStatScale(floor, difficultyId, wave) {
    var base = enemyStatScale(floor, difficultyId);
    var steps = Math.floor((Math.max(1, wave) - 1) / 5);
    return base * Math.pow(1.15, steps);
  }

  // Deliberately capped at 3 (never grows to the tower's late-game 4-5 packs) --
  // survival waves are meant to resolve quickly since the whole point is chaining
  // many of them back to back.
  function survivalEnemyCount(wave) {
    if (wave <= 3) return 1;
    if (wave <= 8) return Math.random() < 0.5 ? 1 : 2;
    return Math.random() < 0.35 ? 2 : 3;
  }

  function scaleStatsBlock(baseStats, scale, groupScale) {
    var out = {};
    Object.keys(baseStats).forEach(function (k) {
      if (k === 'exp') { out[k] = round(baseStats[k] * scale); return; }
      // luk only drives crit chance (critChance() below), which is already clamped --
      // scaling it by the same multiplier as atk/hp/def compounds with that clamp and
      // pins nearly every mid/late-game enemy's crit rate at the 40% ceiling regardless
      // of its authored per-tier luk. Each tier's baseStats.luk already encodes the
      // intended crit-rate progression on its own, so leave it unscaled here.
      if (k === 'luk') { out[k] = Math.max(1, round(baseStats[k])); return; }
      out[k] = Math.max(1, round(baseStats[k] * scale * (groupScale || 1)));
    });
    return out;
  }

  // Global damage scale-down so fights last ~2x as many turns without touching
  // relative balance (crit multiplier, etc).
  var GLOBAL_DAMAGE_MULT = 0.5;

  function critChance(luk) {
    return clamp(0.05 + luk * 0.012, 0.05, 0.4);
  }

  // Focus/Overdrive (see battle-engine.js): a battle-only resource built by landing
  // attacks (both the basic Attack and attack-kind skills), capped at FOCUS_MAX.
  // Spending a full gauge on Overdrive is a free (no MP) almighty-element hit,
  // calibrated near the game's existing mid-tier almighty skills (1.4-1.8 power) --
  // earned over several turns of real offense, not a shortcut around MP economy.
  var FOCUS_MAX = 100;
  var FOCUS_PER_HIT = 10;
  var FOCUS_CRIT_BONUS = 8;
  var OVERDRIVE_POWER = 1.6;

  // Break (see battle-engine.js): an enemy-only meter built by taking hits from any
  // source (player attacks/skills, Overdrive, companion), capped at BREAK_THRESHOLD.
  // A full meter flags the enemy 'broken' for the rest of the round -- a bonus-damage
  // window. Deliberately separate from the crit-triggered 'downed' (skip-turn/All-Out)
  // mechanic so the two never fight over the same flag; an enemy can be downed,
  // broken, both, or neither at once.
  var BREAK_THRESHOLD = 100;
  var BREAK_PER_HIT = 25;
  var BREAK_DAMAGE_MULT = 1.3;

  function computeDamage(opts) {
    // opts: { element, power, atkStat, magStat, defStat, resStat, isCrit }
    var raw;
    if (opts.element === 'almighty') {
      raw = Math.max(opts.atkStat, opts.magStat) * opts.power;
    } else if (opts.element === 'phys') {
      raw = opts.atkStat * opts.power - opts.defStat * 0.75;
    } else {
      raw = opts.magStat * opts.power - opts.resStat * 0.75;
    }
    raw = Math.max(1, raw);
    var variance = rnd(0.9, 1.1);
    var dmg = raw * variance;
    if (opts.isCrit) dmg *= 1.6;
    dmg *= GLOBAL_DAMAGE_MULT;
    return Math.max(1, round(dmg));
  }

  // Gold dropped per defeated enemy, derived from its EXP reward so no extra
  // per-enemy data is needed.
  function goldForExp(exp) {
    return Math.max(1, round(exp * 0.5));
  }

  // Shop price for an item, based on its tier and kind -- unless the item defines
  // its own flat `price` (e.g. the Elixir, priced well above what its tier would imply).
  function shopPrice(item) {
    if (item.price != null) return item.price;
    var base = item.kind === 'consumable' ? 20 : item.kind === 'material' ? 35 : 60;
    return item.tier * base;
  }

  // The last floor where a given item tier is still the "current" one on offer
  // (matches itemTierForFloor's own breakpoints -- see formulas.js/ui-tower.js).
  // Tiers 8-9 are craft-only with no shop floor range of their own, so they're
  // treated as always current within a 100-floor run.
  var ITEM_TIER_FLOOR_CEILING = { 1: 10, 2: 20, 3: 30, 4: 40, 5: 44, 6: 74, 7: 100, 8: 100, 9: 100 };

  // Sell-back price the shop pays for an item already in the player's bag --
  // always 20-30% of its shop price, nudged within that band by two factors:
  // how rare it is (deeper/harder-won tiers are worth relatively more) and how
  // long it's plainly been sitting unused (if the player has since climbed well
  // past the floor range where this tier was the current offering, it's clearly
  // aged stock and worth relatively less). No per-item purchase timestamp is
  // tracked, so "how long you've had it" is approximated by how far your
  // current floor has moved past that tier's own floor range.
  function sellPrice(item, floor) {
    var base = shopPrice(item);
    var tier = item.tier || 1;
    var rarity = clamp((tier - 1) / 8, 0, 1);
    var ceiling = ITEM_TIER_FLOOR_CEILING[tier] || 100;
    var floorsPast = Math.max(0, (floor || 1) - ceiling);
    var freshness = 1 - clamp(floorsPast / 40, 0, 1);
    var rate = 0.20 + 0.06 * rarity + 0.04 * freshness;
    return Math.max(1, round(base * rate));
  }

  window.Game = window.Game || {};
  window.Game.Formulas = {
    DIFFICULTY: DIFFICULTY,
    clamp: clamp,
    rnd: rnd,
    round: round,
    statAtLevel: statAtLevel,
    playerStatsAtLevel: playerStatsAtLevel,
    expToNext: expToNext,
    floorEnemyCount: floorEnemyCount,
    groupScaleFactor: groupScaleFactor,
    tierForFloor: tierForFloor,
    itemTierForFloor: itemTierForFloor,
    enemyStatScale: enemyStatScale,
    bossStatScale: bossStatScale,
    ASCENSION_MAX: ASCENSION_MAX,
    ascensionEnemyMult: ascensionEnemyMult,
    ascensionRewardMult: ascensionRewardMult,
    survivalStatScale: survivalStatScale,
    survivalEnemyCount: survivalEnemyCount,
    scaleStatsBlock: scaleStatsBlock,
    critChance: critChance,
    computeDamage: computeDamage,
    goldForExp: goldForExp,
    shopPrice: shopPrice,
    sellPrice: sellPrice,
    FOCUS_MAX: FOCUS_MAX,
    FOCUS_PER_HIT: FOCUS_PER_HIT,
    FOCUS_CRIT_BONUS: FOCUS_CRIT_BONUS,
    OVERDRIVE_POWER: OVERDRIVE_POWER,
    BREAK_THRESHOLD: BREAK_THRESHOLD,
    BREAK_PER_HIT: BREAK_PER_HIT,
    BREAK_DAMAGE_MULT: BREAK_DAMAGE_MULT
  };
})();
