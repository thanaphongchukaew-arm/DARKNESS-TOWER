// Central mutable game state: the active run, plus mutators. No rendering here.
(function () {
  var F = null, D = null; // resolved lazily so script load order only needs to precede usage

  // Equipment slot -> item kind it accepts. Two slots (accessory1/accessory2)
  // share the 'accessory' kind since the player can carry two accessories at once.
  var SLOT_KIND = { weapon: 'weapon', armor: 'armor', shoes: 'shoes', accessory1: 'accessory', accessory2: 'accessory' };
  var EQUIP_SLOTS = Object.keys(SLOT_KIND);

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
      equipment: { weapon: null, armor: null, shoes: null, accessory1: null, accessory2: null },
      inventory: {},
      bonusSkills: [],
      shopStock: null
    };
    addItem(run, 'p_hp_small', diff.startPotions);
    addItem(run, 'p_mp_small', 1);
    window.Game.State.current = run;
    return run;
  }

  function getEquipmentBonus(run) {
    deps();
    var total = {};
    EQUIP_SLOTS.forEach(function (slot) {
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

  // slot is required for kinds with more than one slot (accessory); optional
  // for single-slot kinds where it defaults to the kind's own name.
  function equip(run, itemId, slot) {
    deps();
    var item = D.getItem(itemId);
    if (!item) return false;
    slot = slot || item.kind;
    if (SLOT_KIND[slot] !== item.kind) return false;
    if (!run.inventory[itemId]) return false;
    var prev = run.equipment[slot];
    removeItem(run, itemId, 1);
    run.equipment[slot] = itemId;
    if (prev) addItem(run, prev, 1);
    clampVitals(run);
    return true;
  }

  // Brings a run's equipment object up to the current slot schema. Older saves
  // only have { weapon, armor, accessory } -- migrate that single accessory
  // slot into accessory1, or into the new shoes slot if the item it held was
  // recategorized from 'accessory' kind to 'shoes' kind (e.g. Swift Boots).
  function normalizeEquipment(run) {
    deps();
    var eq = run.equipment || {};
    var legacyAccessory = eq.accessory;
    var next = {
      weapon: eq.weapon || null,
      armor: eq.armor || null,
      shoes: eq.shoes || null,
      accessory1: eq.accessory1 || null,
      accessory2: eq.accessory2 || null
    };
    if (legacyAccessory) {
      var item = D.getItem(legacyAccessory);
      if (item && item.kind === 'shoes' && !next.shoes) next.shoes = legacyAccessory;
      else if (item && item.kind === 'accessory' && !next.accessory1) next.accessory1 = legacyAccessory;
    }
    run.equipment = next;
    return run;
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
    normalizeEquipment: normalizeEquipment,
    addItem: addItem,
    removeItem: removeItem,
    addGold: addGold,
    spendGold: spendGold,
    useConsumable: useConsumable,
    saveNow: saveNow,
    clearRun: clearRun
  };
})();
