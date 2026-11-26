// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Character attributes: STR / DEX / INT / END / LUK, MMO style.
//
// The five attributes are what the player builds; the combat stats every other system reads
// (hp, mp, atk, mag, def, res, spd, luk -- shown as HP, MP, ATK, MAG, DEF, RES, SPD, CRIT)
// are derived from them:
//
//   STR  +1 ATK, +0.15 DEF
//   DEX  +0.3 ATK, +0.5 SPD, +0.2 crit rating
//   INT  +1 MAG, +0.3 RES, +1.2 MP
//   END  +0.6 DEF, +0.4 RES, +3.5 HP, +0.3 MP
//   LUK  +0.6 crit rating, +0.1 SPD
//
// Each level grants AUTO_PER_LEVEL points that the class spends itself (its `attr` weights in
// data-classes.js) plus FREE_PER_LEVEL points the player spends on the Status screen. On top
// of that each class keeps a small base growth per level of its own (the part of its old stat
// curve the attributes do not explain), so a player who spends free points the class's way ends
// up with the class's tuned stat curve, and one who specialises trades defence for offence.
//
// Run state: run.attr = { str, dex, int, end, lck } -- the FREE points spent so far (plain
// JSON, saved with the run). Spent points are permanent: there is no reset. Saves from before this system have no run.attr; State's load
// repair spends their points the class's way (autoAllocate), so their stats do not drop.
(function () {
  var KEYS = ['str', 'dex', 'int', 'end', 'lck'];
  var LABEL = { str: 'STR', dex: 'DEX', int: 'INT', end: 'END', lck: 'LUK' };
  var STAT_KEYS = ['hp', 'mp', 'atk', 'mag', 'def', 'res', 'spd', 'luk'];
  var COEF = {
    str: { atk: 1, def: 0.15 },
    dex: { atk: 0.3, spd: 0.5, luk: 0.2 },
    int: { mag: 1, res: 0.3, mp: 1.2 },
    end: { def: 0.2, res: 0.15, hp: 1.8, mp: 0.2 },
    lck: { luk: 0.6, spd: 0.1 }
  };
  var AUTO_PER_LEVEL = 3;
  var FREE_PER_LEVEL = 3;
  var PER_LEVEL = AUTO_PER_LEVEL + FREE_PER_LEVEL;

  function D() { return window.Game.Data; }
  function zero() { return { str: 0, dex: 0, int: 0, end: 0, lck: 0 }; }

  // Combat stats granted by a block of attributes.
  function toStats(attrs) {
    var out = {};
    STAT_KEYS.forEach(function (s) { out[s] = 0; });
    KEYS.forEach(function (k) {
      var n = attrs[k] || 0;
      if (!n) return;
      Object.keys(COEF[k]).forEach(function (s) { out[s] += COEF[k][s] * n; });
    });
    return out;
  }

  // Class weights as fractions summing to 1 (data-classes.js stores them as percentages).
  function weights(cls) {
    var w = cls.attr || { str: 20, dex: 20, int: 20, end: 20, lck: 20 }, sum = 0, out = {};
    KEYS.forEach(function (k) { sum += w[k] || 0; });
    KEYS.forEach(function (k) { out[k] = sum ? (w[k] || 0) / sum : 0.2; });
    return out;
  }

  // Level-1 attributes: a floor of 3 plus the class's leaning.
  function startAttrs(cls) {
    var w = weights(cls), out = {};
    KEYS.forEach(function (k) { out[k] = 3 + Math.round(w[k] * 20); });
    return out;
  }

  // Points the class spends itself by `level`.
  function autoAttrs(cls, level) {
    var w = weights(cls), out = {};
    KEYS.forEach(function (k) { out[k] = Math.round(w[k] * AUTO_PER_LEVEL * (level - 1)); });
    return out;
  }

  // The class's own stats that are not explained by its attributes: base at level 1, and
  // growth per level assuming the free points follow the class's weights.
  var profileCache = {};
  function profile(cls) {
    if (profileCache[cls.id]) return profileCache[cls.id];
    var w = weights(cls);
    var fromStart = toStats(startAttrs(cls));
    var natural = {};
    KEYS.forEach(function (k) { natural[k] = w[k] * PER_LEVEL; });
    var fromGrowth = toStats(natural);
    var base = {}, growth = {};
    STAT_KEYS.forEach(function (s) {
      base[s] = (cls.baseStats[s] || 0) - fromStart[s];
      growth[s] = (cls.growth[s] || 0) - fromGrowth[s];
    });
    return (profileCache[cls.id] = { weights: w, base: base, growth: growth });
  }

  function ensure(run) {
    if (!run.attr || typeof run.attr !== 'object') run.attr = zero();
    KEYS.forEach(function (k) { if (typeof run.attr[k] !== 'number' || !isFinite(run.attr[k]) || run.attr[k] < 0) run.attr[k] = 0; else run.attr[k] = Math.floor(run.attr[k]); });
    return run.attr;
  }

  function earnedPoints(run) { return FREE_PER_LEVEL * Math.max(0, (run.level || 1) - 1); }
  function spentPoints(run) { var a = ensure(run), n = 0; KEYS.forEach(function (k) { n += a[k]; }); return n; }
  function unspent(run) { return Math.max(0, earnedPoints(run) - spentPoints(run)); }

  function cls(run) { return D().getClass(run.classId) || D().classes[0]; }

  /**
   * The run's attributes: class start + class auto points + free points spent, plus any
   * attribute bonus from equipment (accessories) and events. `extra` is that bonus block.
   */
  function totals(run, extra) {
    var c = cls(run), start = startAttrs(c), auto = autoAttrs(c, run.level || 1), free = ensure(run), out = {};
    KEYS.forEach(function (k) { out[k] = start[k] + auto[k] + free[k] + ((extra && extra[k]) || 0); });
    return out;
  }

  /** Combat stats from the class's own base/growth plus the attribute totals (unrounded). */
  function derivedStats(run, extra) {
    var c = cls(run), p = profile(c), lv = (run.level || 1) - 1;
    var fromAttr = toStats(totals(run, extra));
    var out = {};
    STAT_KEYS.forEach(function (s) { out[s] = p.base[s] + p.growth[s] * lv + fromAttr[s]; });
    return out;
  }

  function spend(run, key, n) {
    if (KEYS.indexOf(key) === -1) return false;
    n = Math.max(1, Math.floor(n || 1));
    if (unspent(run) < n) return false;
    ensure(run)[key] += n;
    return true;
  }

  // Spends every unspent free point the way the class would: each point goes to the attribute
  // furthest below its share. Deterministic (no Math.random), so the balance bot stays seeded.
  function autoAllocate(run) {
    var a = ensure(run), w = profile(cls(run)).weights, left = unspent(run);
    if (!left) return 0;
    var total = spentPoints(run) + left;
    for (var i = 0; i < left; i++) {
      var best = null, gap = -Infinity;
      KEYS.forEach(function (k) {
        var g = w[k] * total - a[k];
        if (g > gap + 1e-9) { gap = g; best = k; }
      });
      a[best] += 1;
    }
    return left;
  }


  window.Game = window.Game || {};
  window.Game.Attributes = {
    KEYS: KEYS, LABEL: LABEL, COEF: COEF,
    AUTO_PER_LEVEL: AUTO_PER_LEVEL, FREE_PER_LEVEL: FREE_PER_LEVEL,
    toStats: toStats, weights: weights, startAttrs: startAttrs, autoAttrs: autoAttrs, profile: profile,
    ensure: ensure, earnedPoints: earnedPoints, unspent: unspent, totals: totals, derivedStats: derivedStats,
    spend: spend, autoAllocate: autoAllocate
  };
})();
