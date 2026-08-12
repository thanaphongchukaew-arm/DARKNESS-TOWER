// Pure formulas: stat growth, damage, exp curve, floor/difficulty scaling.
(function () {
  var DIFFICULTY = {
    easy: { id: 'easy', name: 'ง่าย', nameEn: 'Easy', statMult: 0.72, rewardMult: 1.15, startPotions: 3 },
    normal: { id: 'normal', name: 'ปกติ', nameEn: 'Normal', statMult: 0.88, rewardMult: 1.0, startPotions: 2 },
    hard: { id: 'hard', name: 'ยาก', nameEn: 'Hard', statMult: 1.14, rewardMult: 1.35, startPotions: 1 }
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

  function scaleStatsBlock(baseStats, scale, groupScale) {
    var out = {};
    Object.keys(baseStats).forEach(function (k) {
      if (k === 'exp') { out[k] = round(baseStats[k] * scale); return; }
      out[k] = Math.max(1, round(baseStats[k] * scale * (groupScale || 1)));
    });
    return out;
  }

  // priority: null > reflect > drain > weak > resist > normal. almighty is always 'normal'.
  function elementRelation(target, element) {
    if (element === 'almighty') return 'normal';
    var lists = ['null', 'reflect', 'drain', 'weak', 'resist'];
    for (var i = 0; i < lists.length; i++) {
      var arr = target[lists[i]];
      if (arr && arr.indexOf(element) !== -1) return lists[i];
    }
    return 'normal';
  }

  var RELATION_DAMAGE_MULT = { weak: 1.5, normal: 1.0, resist: 0.5, null: 0, drain: 0, reflect: 0 };

  // Global damage scale-down so fights last ~2x as many turns without touching
  // relative balance (weak/resist ratios, crit multiplier, etc).
  var GLOBAL_DAMAGE_MULT = 0.5;

  function critChance(luk) {
    return clamp(0.05 + luk * 0.012, 0.05, 0.4);
  }

  function computeDamage(opts) {
    // opts: { element, power, atkStat, magStat, defStat, resStat, relation, isCrit }
    var relMult = RELATION_DAMAGE_MULT[opts.relation] != null ? RELATION_DAMAGE_MULT[opts.relation] : 1.0;
    var raw;
    if (opts.element === 'almighty') {
      raw = Math.max(opts.atkStat, opts.magStat) * opts.power;
    } else if (opts.element === 'phys') {
      raw = opts.atkStat * opts.power - opts.defStat * 0.5;
    } else {
      raw = opts.magStat * opts.power - opts.resStat * 0.5;
    }
    raw = Math.max(1, raw);
    var variance = rnd(0.9, 1.1);
    var dmg = raw * variance * relMult;
    if (opts.isCrit) dmg *= 1.6;
    dmg *= GLOBAL_DAMAGE_MULT;
    return Math.max(relMult === 0 ? 0 : 1, round(dmg));
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
    scaleStatsBlock: scaleStatsBlock,
    elementRelation: elementRelation,
    critChance: critChance,
    computeDamage: computeDamage,
    goldForExp: goldForExp,
    shopPrice: shopPrice,
    sellPrice: sellPrice
  };
})();
