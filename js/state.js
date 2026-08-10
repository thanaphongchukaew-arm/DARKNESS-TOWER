// Central mutable game state: the active run, plus mutators. No rendering here.
(function () {
  var F = null, D = null; // resolved lazily so script load order only needs to precede usage

  function deps() {
    F = window.Game.Formulas;
    D = window.Game.Data;
  }

  function addItem(run, itemId, qty) {
    if (!itemId || qty <= 0) return;
    run.inventory[itemId] = (run.inventory[itemId] || 0) + qty;
  }

  function removeItem(run, itemId, qty) {
    if (!run.inventory[itemId]) return;
    run.inventory[itemId] = Math.max(0, run.inventory[itemId] - qty);
    if (run.inventory[itemId] === 0) delete run.inventory[itemId];
  }

  function addGold(run, amount) {
    if (!amount) return;
    run.gold = (run.gold || 0) + amount;
  }

  function spendGold(run, amount) {
    if ((run.gold || 0) < amount) return false;
    run.gold -= amount;
    return true;
  }

  function createRun(difficultyId, classId) {
    deps();
    var cls = D.getClass(classId);
    var diff = F.DIFFICULTY[difficultyId] || F.DIFFICULTY.normal;
    var level = 1;
    var stats = F.playerStatsAtLevel(cls, level);
    var run = {
      difficulty: difficultyId,
      classId: classId,
      level: level,
      exp: 0,
      expNext: F.expToNext(level),
      currentFloor: 1,
      hp: stats.hp,
      mp: stats.mp,
      gold: 0,
      waypointsSeen: {},
      equipment: { weapon: null, armor: null, accessory: null },
      inventory: {},
      bonusSkills: []
    };
    addItem(run, 'p_hp_small', diff.startPotions);
    addItem(run, 'p_mp_small', 1);
    window.Game.State.current = run;
    return run;
  }

  function getEquipmentBonus(run) {
    deps();
    var total = {};
    ['weapon', 'armor', 'accessory'].forEach(function (slot) {
      var id = run.equipment[slot];
      if (!id) return;
      var item = D.getItem(id);
      if (!item || !item.statBonus) return;
      Object.keys(item.statBonus).forEach(function (k) {
        total[k] = (total[k] || 0) + item.statBonus[k];
      });
    });
    return total;
  }

  function getTotalStats(run) {
    deps();
    var cls = D.getClass(run.classId);
    var base = F.playerStatsAtLevel(cls, run.level);
    var bonus = getEquipmentBonus(run);
    var total = {};
    Object.keys(base).forEach(function (k) { total[k] = base[k] + (bonus[k] || 0); });
    ['hp', 'mp', 'atk', 'mag', 'def', 'res', 'spd', 'luk'].forEach(function (k) {
      if (total[k] == null) total[k] = bonus[k] || 0;
    });
    return total;
  }

  function getMaxHp(run) { return getTotalStats(run).hp; }
  function getMaxMp(run) { return getTotalStats(run).mp; }

  function clampVitals(run) {
    var maxHp = getMaxHp(run), maxMp = getMaxMp(run);
    run.hp = F.clamp(run.hp, 0, maxHp);
    run.mp = F.clamp(run.mp, 0, maxMp);
  }

  function fullRestore(run) {
    deps();
    run.hp = getMaxHp(run);
    run.mp = getMaxMp(run);
  }

  function addExp(run, amount) {
    deps();
    run.exp += amount;
    var leveledUp = false;
    while (run.exp >= run.expNext) {
      run.exp -= run.expNext;
      run.level += 1;
      run.expNext = F.expToNext(run.level);
      leveledUp = true;
    }
    if (leveledUp) {
      run.hp = getMaxHp(run);
      run.mp = getMaxMp(run);
    } else {
      clampVitals(run);
    }
    return { leveledUp: leveledUp, level: run.level };
  }

  function learnedSkills(run) {
    deps();
    var base = D.getLearnedSkills(run.classId, run.level);
    var seen = {};
    var out = [];
    base.forEach(function (s) { if (!seen[s.id]) { seen[s.id] = true; out.push(s); } });
    (run.bonusSkills || []).forEach(function (id) {
      if (seen[id]) return;
      var s = D.getSkill(id);
      if (s) { seen[id] = true; out.push(s); }
    });
    return out;
  }

  function equip(run, itemId) {
    deps();
    var item = D.getItem(itemId);
    if (!item || ['weapon', 'armor', 'accessory'].indexOf(item.kind) === -1) return false;
    if (!run.inventory[itemId]) return false;
    var slot = item.kind;
    var prev = run.equipment[slot];
    removeItem(run, itemId, 1);
    run.equipment[slot] = itemId;
    if (prev) addItem(run, prev, 1);
    clampVitals(run);
    return true;
  }

  function unequip(run, slot) {
    var id = run.equipment[slot];
    if (!id) return false;
    run.equipment[slot] = null;
    addItem(run, id, 1);
    clampVitals(run);
    return true;
  }

  function useConsumable(run, itemId) {
    deps();
    var item = D.getItem(itemId);
    if (!item || !run.inventory[itemId]) return { ok: false };
    var result = { ok: true };
    var maxHp = getMaxHp(run), maxMp = getMaxMp(run);
    switch (item.effect && item.effect.type) {
      case 'healHp':
        if (run.hp >= maxHp) return { ok: false, reason: 'full' };
        run.hp = F.clamp(run.hp + item.effect.amount, 0, maxHp);
        result.healedHp = item.effect.amount;
        break;
      case 'healMp':
        if (run.mp >= maxMp) return { ok: false, reason: 'full' };
        run.mp = F.clamp(run.mp + item.effect.amount, 0, maxMp);
        result.healedMp = item.effect.amount;
        break;
      case 'healBoth':
        if (run.hp >= maxHp && run.mp >= maxMp) return { ok: false, reason: 'full' };
        result.healedHp = maxHp - run.hp;
        result.healedMp = maxMp - run.mp;
        run.hp = maxHp;
        run.mp = maxMp;
        result.fullRestore = true;
        break;
      case 'learnSkill': {
        var known = {};
        learnedSkills(run).forEach(function (s) { known[s.id] = true; });
        var candidates = D.skills
          .filter(function (s) { return (s.classOnly === null || s.classOnly === run.classId) && s.minLevel <= run.level && !known[s.id]; })
          .sort(function (a, b) { return a.minLevel - b.minLevel; });
        if (candidates.length) {
          run.bonusSkills.push(candidates[0].id);
          result.learnedSkillId = candidates[0].id;
        } else {
          var bonusExp = 25 + run.level * 8;
          var lvl = addExp(run, bonusExp);
          result.expBonus = bonusExp;
          result.leveled = lvl.leveledUp;
        }
        break;
      }
      default:
        result.ok = false;
        return result;
    }
    removeItem(run, itemId, 1);
    return result;
  }

  function saveNow() {
    if (window.Game.State.current) window.Game.Save.write(window.Game.State.current);
  }

  function clearRun() {
    window.Game.State.current = null;
    window.Game.Save.clear();
  }

  window.Game = window.Game || {};
  window.Game.State = {
    current: null,
    pending: { difficulty: null, classId: null },
    createRun: createRun,
    getTotalStats: getTotalStats,
    getMaxHp: getMaxHp,
    getMaxMp: getMaxMp,
    clampVitals: clampVitals,
    fullRestore: fullRestore,
    addExp: addExp,
    learnedSkills: learnedSkills,
    equip: equip,
    unequip: unequip,
    addItem: addItem,
    removeItem: removeItem,
    addGold: addGold,
    spendGold: spendGold,
    useConsumable: useConsumable,
    saveNow: saveNow,
    clearRun: clearRun
  };
})();
