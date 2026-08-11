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
    if (floor <= 49) return Math.random() < 0.35 ? 3 : 4;
    return 1; // boss handled separately (floor 50)
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
    return 5;
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
    return Math.max(relMult === 0 ? 0 : 1, round(dmg));
  }

  // Gold dropped per defeated enemy, derived from its EXP reward so no extra
  // per-enemy data is needed.
  function goldForExp(exp) {
    return Math.max(1, round(exp * 0.5));
  }

  // Shop price for an item, based on its tier and kind.
  function shopPrice(item) {
    var base = item.kind === 'consumable' ? 20 : 60;
    return item.tier * base;
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
    enemyStatScale: enemyStatScale,
    bossStatScale: bossStatScale,
    scaleStatsBlock: scaleStatsBlock,
    elementRelation: elementRelation,
    critChance: critChance,
    computeDamage: computeDamage,
    goldForExp: goldForExp,
    shopPrice: shopPrice
  };
})();
