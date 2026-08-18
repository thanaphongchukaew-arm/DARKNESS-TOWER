// Central mutable game state: the active run, plus mutators. No rendering here.
(function () {
  var F = null, D = null; // resolved lazily so script load order only needs to precede usage

  // Equipment slot -> item kind it accepts. Two slots (accessory1/accessory2)
  // share the 'accessory' kind since the player can carry two accessories at once.
  var SLOT_KIND = { weapon: 'weapon', armor: 'armor', shoes: 'shoes', accessory1: 'accessory', accessory2: 'accessory' };
  var EQUIP_SLOTS = Object.keys(SLOT_KIND);
  var ELIXIR_RESTOCK_FLOORS = 15;

  // Cumulative counters the Quests screen reads (see getQuestProgress) that
  // aren't already implicit in the run (level/currentFloor/gold/equipment/
  // skills). Kept to the minimum the quest list in data-quests.js actually
  // needs -- add a new key here (and a record* mutator below) before adding a
  // quest type that needs one.
  var QUEST_STAT_DEFAULTS = { enemiesDefeated: 0, battlesWon: 0, itemsCrafted: 0, goldEarned: 0, arenaWavesCleared: 0 };

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
    if (amount > 0) {
      ensureQuestState(run);
      run.stats.goldEarned += amount;
      // "Tower Tycoon" achievement -- a moment flag (see data-achievements.js),
      // since run.gold resets with the run and can't be checked live like the
      // meta-persistent achievements can.
      if (run.gold >= 5000) setAchievementFlag('goldHoarder');
    }
  }

  // Saves from before the quest system existed (or a save that's simply never
  // had a quest claimed yet) won't have run.stats/run.questsClaimed -- fill
  // them in on first touch instead of requiring a one-time migration pass.
  function ensureQuestState(run) {
    if (!run.stats) run.stats = {};
    Object.keys(QUEST_STAT_DEFAULTS).forEach(function (k) {
      if (run.stats[k] == null) run.stats[k] = QUEST_STAT_DEFAULTS[k];
    });
    if (!run.questsClaimed) run.questsClaimed = {};
    return run;
  }

  function recordEnemiesDefeated(run, count) {
    if (!count) return;
    ensureQuestState(run);
    run.stats.enemiesDefeated += count;
  }

  function recordBattleWon(run) {
    ensureQuestState(run);
    run.stats.battlesWon += 1;
  }

  function recordItemCrafted(run) {
    ensureQuestState(run);
    run.stats.itemsCrafted += 1;
  }

  function recordArenaWaveCleared(run) {
    ensureQuestState(run);
    run.stats.arenaWavesCleared += 1;
  }

  // Reads a quest's current/target regardless of whether it's been claimed --
  // callers combine this with run.questsClaimed[quest.id] to know what to show.
  function getQuestProgress(run, quest) {
    deps();
    ensureQuestState(run);
    var current = 0;
    switch (quest.type) {
      case 'floor': current = run.currentFloor; break;
      case 'level': current = run.level; break;
      case 'gold': current = run.gold || 0; break;
      case 'goldEarned': current = run.stats.goldEarned; break;
      case 'enemiesDefeated': current = run.stats.enemiesDefeated; break;
      case 'battlesWon': current = run.stats.battlesWon; break;
      case 'itemsCrafted': current = run.stats.itemsCrafted; break;
      case 'arenaWaves': current = run.stats.arenaWavesCleared; break;
      case 'equipFull': current = EQUIP_SLOTS.filter(function (s) { return !!run.equipment[s]; }).length; break;
      case 'skillsLearned': current = learnedSkills(run).length; break;
    }
    return { current: current, target: quest.target, done: current >= quest.target };
  }

  function isQuestClaimable(run, quest) {
    ensureQuestState(run);
    return !run.questsClaimed[quest.id] && getQuestProgress(run, quest).done;
  }

  // Applies one quest's reward to the run and marks it claimed. Returns the
  // reward actually granted, or null if it wasn't claimable -- callers should
  // check that before showing any "you got X" feedback.
  function claimQuest(run, questId) {
    deps();
    var quest = D.getQuest(questId);
    if (!quest || !isQuestClaimable(run, quest)) return null;
    run.questsClaimed[questId] = true;
    if (quest.reward.gold) addGold(run, quest.reward.gold);
    if (quest.reward.exp) addExp(run, quest.reward.exp);
    (quest.reward.items || []).forEach(function (it) { addItem(run, it.id, it.qty); });
    return quest.reward;
  }

  // Claims every currently-claimable quest in one pass and returns the merged
  // total (gold/exp summed, items merged by id) for a single summary popup.
  // Re-checks claimability per quest as it goes (rather than off a snapshot
  // taken before the loop) so a quest a just-claimed reward's EXP happens to
  // unlock (e.g. a level-up crossing another quest's threshold) is picked up
  // in the same pass if it appears later in the list.
  function claimAllQuests(run) {
    deps();
    var total = { gold: 0, exp: 0, items: {} };
    D.quests.forEach(function (quest) {
      if (!isQuestClaimable(run, quest)) return;
      var reward = claimQuest(run, quest.id);
      if (!reward) return;
      if (reward.gold) total.gold += reward.gold;
      if (reward.exp) total.exp += reward.exp;
      (reward.items || []).forEach(function (it) { total.items[it.id] = (total.items[it.id] || 0) + it.qty; });
    });
    return total;
  }

  function spendGold(run, amount) {
    if ((run.gold || 0) < amount) return false;
    run.gold -= amount;
    return true;
  }

  // Sells `qty` of an unequipped inventory item back to the shop (equipped gear
  // is never counted in run.inventory in the first place -- see EQUIP_SLOTS --
  // so there's nothing extra to guard against selling worn gear out from under
  // the player). Returns the gold earned, or 0 if the sale couldn't happen.
  function sellItem(run, itemId, qty) {
    deps();
    qty = qty || 1;
    if ((run.inventory[itemId] || 0) < qty) return 0;
    var item = D.getItem(itemId);
    if (!item) return 0;
    var total = F.sellPrice(item, run.currentFloor) * qty;
    removeItem(run, itemId, qty);
    addGold(run, total);
    return total;
  }

  // Consumes a recipe's materials + gold and adds its result item to the
  // inventory. Returns false (no state change) if the player is short on
  // either -- the caller (crafting UI) is expected to keep craft buttons
  // disabled in that case, so this is mostly a safety net.
  function craftItem(run, recipeId) {
    deps();
    var recipe = D.getRecipe(recipeId);
    if (!recipe) return false;
    var canAfford = (run.gold || 0) >= (recipe.gold || 0) &&
      recipe.materials.every(function (m) { return (run.inventory[m.id] || 0) >= m.qty; });
    if (!canAfford) return false;
    recipe.materials.forEach(function (m) { removeItem(run, m.id, m.qty); });
    if (recipe.gold) spendGold(run, recipe.gold);
    addItem(run, recipe.resultId, recipe.resultQty || 1);
    recordItemCrafted(run);
    return true;
  }

  function createRun(difficultyId, classId, ascension) {
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
      shopStock: null,
      stats: { enemiesDefeated: 0, battlesWon: 0, itemsCrafted: 0, goldEarned: 0, arenaWavesCleared: 0 },
      questsClaimed: {},
      // Elixir is a rare full-restore -- the shop (persistent or waypoint) and the
      // floor-clear/treasure reward pool always offer exactly one bottle once it's
      // available, then it goes on cooldown until the player has climbed another
      // ELIXIR_RESTOCK_FLOORS floors, tracked as the floor it next becomes buyable.
      elixirUnlockFloor: 1,
      // Run-long modifiers (see data-blessings.js) -- ids only, resolved through
      // Data.getBlessing/getCurse wherever they're applied (getTotalStats,
      // getRewardMult, battle-engine's revive check).
      blessings: [],
      curses: [],
      blessingRevived: false,
      // Relics (see data-relics.js): ids only, resolved the same way as blessings/
      // curses -- ever-growing, never removed once picked up, wiped on permadeath.
      relics: [],
      // Nightmare-only prestige level chosen at run creation (see Formulas.ascensionEnemyMult/
      // ascensionRewardMult and State.isAscensionUnlocked/recordAscensionClear).
      ascension: ascension || 0,
      // Companion hired from the Status screen (see data-companions.js) -- null means none.
      companionId: null,
      // Random Tower Events: one-shot-per-floor guard (mirrors waypointsSeen) plus
      // the last floor an event fired on, so events can't cluster back to back.
      eventsSeen: {},
      lastEventFloor: 0
    };
    addItem(run, 'p_hp_small', diff.startPotions);
    addItem(run, 'p_mp_small', 1);
    window.Game.State.current = run;
    recordFloorReached(1);
    return run;
  }

  // Saves from before this feature set existed (or a save that's simply never
  // touched one of these systems yet) won't have these fields -- fill them in on
  // load instead of requiring a one-time migration pass, mirroring normalizeEquipment.
  function normalizeRunExtras(run) {
    if (!run.blessings) run.blessings = [];
    if (!run.curses) run.curses = [];
    if (!run.relics) run.relics = [];
    if (run.blessingRevived == null) run.blessingRevived = false;
    if (run.ascension == null) run.ascension = 0;
    if (run.companionId === undefined) run.companionId = null;
    if (!run.eventsSeen) run.eventsSeen = {};
    if (run.lastEventFloor == null) run.lastEventFloor = 0;
    return run;
  }

  // run.elixirUnlockFloor is missing on saves from before this system existed --
  // treat that as "available right now" rather than locked.
  function elixirAvailable(run) {
    return run.currentFloor >= (run.elixirUnlockFloor != null ? run.elixirUnlockFloor : 1);
  }

  function spendElixir(run) {
    run.elixirUnlockFloor = run.currentFloor + ELIXIR_RESTOCK_FLOORS;
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

  var STAT_KEYS = ['hp', 'mp', 'atk', 'mag', 'def', 'res', 'spd', 'luk'];

  function getTotalStats(run) {
    deps();
    var cls = D.getClass(run.classId);
    var base = F.playerStatsAtLevel(cls, run.level);
    var bonus = getEquipmentBonus(run);
    var total = {};
    Object.keys(base).forEach(function (k) { total[k] = base[k] + (bonus[k] || 0); });
    STAT_KEYS.forEach(function (k) {
      if (total[k] == null) total[k] = bonus[k] || 0;
      total[k] = F.round(total[k] * blessingStatMult(run, k));
    });
    return total;
  }

  // Product of every held blessing's/curse's multiplier that touches `statKey`
  // (a blessing/curse's `stat` field is a single key or an array of keys). This is
  // the ONLY place run-long stat modifiers apply -- deliberately not routed through
  // battle-engine's per-battle buffs/debuffs array, since those tick down each round
  // and refresh-not-stack by stat key (a skill buff could silently clobber a
  // "permanent" one). Composing here instead means every caller of getTotalStats
  // (battle start, level-up HP/MP refill, clampVitals, the Status screen) is always
  // correct with zero double-counting risk.
  function blessingStatMult(run, statKey) {
    deps();
    var mult = 1;
    (run.blessings || []).forEach(function (id) {
      var b = D.getBlessing(id);
      if (!b || !b.stat) return;
      var keys = Array.isArray(b.stat) ? b.stat : [b.stat];
      if (keys.indexOf(statKey) !== -1) mult *= (1 + b.amount);
    });
    (run.curses || []).forEach(function (id) {
      var c = D.getCurse(id);
      if (!c || !c.stat) return;
      var keys = Array.isArray(c.stat) ? c.stat : [c.stat];
      if (keys.indexOf(statKey) !== -1) mult *= (1 + c.amount);
    });
    // Relics (see data-relics.js) reuse this same composition under distinct field
    // names (statKey/statAmount, not stat/amount) so a relic that also touches the
    // economy side (Cursed Coin's economy/economyAmount) can't collide on `amount`.
    (run.relics || []).forEach(function (id) {
      var r = D.getRelic(id);
      if (!r || !r.statKey) return;
      var keys = Array.isArray(r.statKey) ? r.statKey : [r.statKey];
      if (keys.indexOf(statKey) !== -1) mult *= (1 + r.statAmount);
    });
    return mult;
  }

  // Gold/EXP/material-drop-rate multiplier from held economy blessings/curses plus
  // the Ascension reward bonus -- composed by callers into the `rate` argument
  // BattleEngine.getGoldReward/getExpReward/getMaterialDrops already accept, so no
  // battle-engine change was needed to wire this in.
  // `b.economy`/`c.economy` is a single kind ('gold'/'exp'/'material') or an
  // array of kinds (e.g. Blessing of the Wanderer touches both gold and exp) --
  // matchesKind normalizes both shapes to the same indexOf check.
  function matchesEconomyKind(economy, kind) {
    if (!economy) return false;
    return (Array.isArray(economy) ? economy : [economy]).indexOf(kind) !== -1;
  }

  function getRewardMult(run, kind) {
    deps();
    var mult = F.ascensionRewardMult(run.ascension || 0);
    (run.blessings || []).forEach(function (id) {
      var b = D.getBlessing(id);
      if (b && matchesEconomyKind(b.economy, kind)) mult *= (1 + b.amount);
    });
    (run.curses || []).forEach(function (id) {
      var c = D.getCurse(id);
      if (c && matchesEconomyKind(c.economy, kind)) mult *= (1 + c.amount);
    });
    // Relics' economy field mirrors blessings/curses but reads economyAmount (not
    // amount) -- see blessingStatMult's matching comment on the same collision.
    (run.relics || []).forEach(function (id) {
      var r = D.getRelic(id);
      if (r && matchesEconomyKind(r.economy, kind)) mult *= (1 + r.economyAmount);
    });
    return mult;
  }

  // Product of every held relic's flat incoming-damage reduction (see data-relics.js's
  // damageReductionPct) -- multiplicative like blessingStatMult, so future relics
  // with this same field compose together instead of only the strongest applying.
  function relicDamageMult(run) {
    deps();
    var mult = 1;
    (run.relics || []).forEach(function (id) {
      var r = D.getRelic(id);
      if (r && r.damageReductionPct) mult *= (1 - r.damageReductionPct);
    });
    return mult;
  }

  // De-dupes by id (mirrors learnedSkills' dedupe) so the same blessing/curse can
  // never stack with itself -- keeps the multiplier math simple and bounded.
  // `deliberate` flips the "Risktaker" achievement flag: true for a player
  // knowingly accepting a paired blessing+curse offer (the run-start risky pick,
  // the in-run Cursed Shrine event), false/omitted for an unlucky trap (the
  // Forbidden Chest) which shouldn't count as a deliberate risk taken.
  // Also records into the meta store's blessingsEverHeld/cursesEverHeld sets --
  // account-wide, survives permadeath -- purely so the "collect them all"
  // achievements (see isAchievementUnlocked's blessingsAll/cursesAll cases) can
  // check total-ever-held rather than currently-held (a run's blessings/curses
  // are never removed once added, but a *new* run starts with none).
  function addBlessing(run, id) {
    run.blessings = run.blessings || [];
    if (run.blessings.indexOf(id) !== -1) return false;
    run.blessings.push(id);
    if (run.blessings.length >= 3) setAchievementFlag('blessedStacker');
    var meta = window.Game.Save.readMeta();
    meta.blessingsEverHeld = meta.blessingsEverHeld || {};
    if (!meta.blessingsEverHeld[id]) { meta.blessingsEverHeld[id] = true; window.Game.Save.writeMeta(meta); }
    return true;
  }

  function addCurse(run, id, deliberate) {
    run.curses = run.curses || [];
    if (run.curses.indexOf(id) !== -1) return false;
    run.curses.push(id);
    if (deliberate) setAchievementFlag('riskTaker');
    var meta = window.Game.Save.readMeta();
    meta.cursesEverHeld = meta.cursesEverHeld || {};
    if (!meta.cursesEverHeld[id]) { meta.cursesEverHeld[id] = true; window.Game.Save.writeMeta(meta); }
    return true;
  }

  function hasReviveBlessing(run) {
    deps();
    return (run.blessings || []).some(function (id) {
      var b = D.getBlessing(id);
      return b && b.special === 'revive';
    });
  }

  // Relics (see data-relics.js): granted from the reward-choice pool (floor-clear
  // reward, Treasure Room, Battlefield event -- see ui-tower.js's generateRewardChoices),
  // de-duped by id exactly like addBlessing/addCurse above. Also records into
  // meta.relicsEverHeld (account-wide, survives permadeath) for the relicsAll
  // achievement, mirroring blessingsEverHeld/cursesEverHeld.
  function addRelic(run, id) {
    run.relics = run.relics || [];
    if (run.relics.indexOf(id) !== -1) return false;
    run.relics.push(id);
    var meta = window.Game.Save.readMeta();
    meta.relicsEverHeld = meta.relicsEverHeld || {};
    if (!meta.relicsEverHeld[id]) { meta.relicsEverHeld[id] = true; window.Game.Save.writeMeta(meta); }
    return true;
  }

  function hasRelic(run, id) {
    return (run.relics || []).indexOf(id) !== -1;
  }

  // ---- Companion (see data-companions.js) -- account-wide unlock gated on the
  // best tower floor the player has ever reached (any run, survives permadeath),
  // hire itself is per-run and free/swappable any time from the Status screen. ----
  function isCompanionUnlocked(id) {
    deps();
    var c = D.getCompanion(id);
    if (!c) return false;
    var meta = window.Game.Save.readMeta();
    return (meta.bestFloorReached || 0) >= c.unlockFloor;
  }

  function hireCompanion(run, id) {
    if (id && !isCompanionUnlocked(id)) return false;
    run.companionId = id || null;
    if (id) {
      var meta = window.Game.Save.readMeta();
      meta.companionsRecruited = meta.companionsRecruited || {};
      if (!meta.companionsRecruited[id]) {
        meta.companionsRecruited[id] = true;
        window.Game.Save.writeMeta(meta);
      }
    }
    return true;
  }

  // Account-wide "highest floor ever reached" tracker (meta-persisted, survives
  // clearRun()) -- gates companion unlocks and the two floorReached achievements.
  function recordFloorReached(floor) {
    var meta = window.Game.Save.readMeta();
    if ((meta.bestFloorReached || 0) >= floor) return;
    meta.bestFloorReached = floor;
    window.Game.Save.writeMeta(meta);
  }

  // Bestiary: first-sighting tracker, called from the 3 enemy-actor-build sites in
  // battle-engine.js. Purely additive (a meta write only) -- cannot affect battle math.
  function recordEnemySeen(templateId) {
    if (!templateId) return;
    var meta = window.Game.Save.readMeta();
    meta.bestiarySeen = meta.bestiarySeen || {};
    if (meta.bestiarySeen[templateId]) return;
    meta.bestiarySeen[templateId] = true;
    window.Game.Save.writeMeta(meta);
  }

  // Event-type first-encounter tracker (see data-events.js), called from
  // ui-tower.js's finishEvent -- the single chokepoint every event choice
  // (including the no-op "decline"/"leave" ones) already funnels through, so
  // this is the one call site that needs it. Backs the "Seen It All" achievement.
  function recordEventSeen(eventId) {
    if (!eventId) return;
    var meta = window.Game.Save.readMeta();
    meta.eventTypesSeen = meta.eventTypesSeen || {};
    if (meta.eventTypesSeen[eventId]) return;
    meta.eventTypesSeen[eventId] = true;
    window.Game.Save.writeMeta(meta);
  }

  // ---- Ascension: Nightmare-only prestige level, chosen at run creation once
  // unlocked. Deliberately does not touch the floor-100 boss-victory code path --
  // main.js's showEnd(true) just increments this meta counter on a Nightmare clear,
  // exactly like it already does for unlockNightmare/recordDifficultyCleared. ----
  function recordAscensionClear() {
    deps();
    var meta = window.Game.Save.readMeta();
    var next = Math.min(F.ASCENSION_MAX, (meta.ascensionUnlocked || 0) + 1);
    if (next === (meta.ascensionUnlocked || 0)) return;
    meta.ascensionUnlocked = next;
    window.Game.Save.writeMeta(meta);
  }

  function getAscensionUnlocked() {
    var meta = window.Game.Save.readMeta();
    return meta.ascensionUnlocked || 0;
  }

  // ---- Achievements (see data-achievements.js) -- unlock state is derived LIVE
  // from meta-persistent data wherever possible (survives permadeath with zero
  // extra tracking); the few conditions that only make sense mid-run go through
  // setAchievementFlag at one dedicated call site each, written straight to meta
  // the moment they happen so they're not lost when the run ends. ----
  function setAchievementFlag(flag) {
    var meta = window.Game.Save.readMeta();
    if (meta[flag]) return;
    meta[flag] = true;
    window.Game.Save.writeMeta(meta);
  }

  function isAchievementUnlocked(ach) {
    deps();
    var meta = window.Game.Save.readMeta();
    switch (ach.type) {
      case 'difficulty':
        return !!(meta.clearedDifficulty && meta.clearedDifficulty[ach.difficulty]);
      case 'allElites': {
        var eliteIds = D.classes.filter(function (c) { return !!c.unlock; }).map(function (c) { return c.id; });
        return eliteIds.length > 0 && eliteIds.every(function (id) { return isClassUnlocked(id); });
      }
      case 'ascension':
        return (meta.ascensionUnlocked || 0) >= ach.target;
      case 'survivalWaves':
        return (meta.survivalBestWaves || 0) >= ach.target;
      case 'bestiary': {
        var seen = meta.bestiarySeen ? Object.keys(meta.bestiarySeen).length : 0;
        var total = D.getAllEnemyTemplates().length;
        return seen >= (ach.target === 'all' ? total : ach.target);
      }
      case 'floorReached':
        return (meta.bestFloorReached || 0) >= ach.target;
      case 'companionsAll': {
        var recruited = meta.companionsRecruited || {};
        return D.companions.every(function (c) { return !!recruited[c.id]; });
      }
      case 'blessingsAll': {
        var everHeld = meta.blessingsEverHeld || {};
        return D.blessings.every(function (b) { return !!everHeld[b.id]; });
      }
      case 'cursesAll': {
        var everHeldC = meta.cursesEverHeld || {};
        return D.curses.every(function (c) { return !!everHeldC[c.id]; });
      }
      case 'eventsAll': {
        var seenTypes = meta.eventTypesSeen || {};
        return D.events.every(function (e) { return !!seenTypes[e.id]; });
      }
      case 'relicsAll': {
        var relicsHeld = meta.relicsEverHeld || {};
        return D.relics.every(function (r) { return !!relicsHeld[r.id]; });
      }
      case 'flag':
        return !!meta[ach.flag];
      default:
        return false;
    }
  }

  function equipTitle(id) {
    deps();
    if (id) {
      var ach = D.getAchievement(id);
      if (!ach || !isAchievementUnlocked(ach)) return false;
    }
    var meta = window.Game.Save.readMeta();
    meta.equippedTitle = id || null;
    window.Game.Save.writeMeta(meta);
    return true;
  }

  function getEquippedTitle() {
    deps();
    var meta = window.Game.Save.readMeta();
    if (!meta.equippedTitle) return null;
    var ach = D.getAchievement(meta.equippedTitle);
    return ach && isAchievementUnlocked(ach) ? ach : null;
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
      // "Beyond the Limit" achievement -- a moment flag, same reasoning as
      // addGold's goldHoarder check just above: run.level resets with the run.
      if (run.level >= 75) setAchievementFlag('levelCapped');
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

  // Nightmare stays locked until the tower has been cleared once on hard (or
  // above) -- tracked in the separate meta store so it survives clearRun().
  function isNightmareUnlocked() {
    return !!window.Game.Save.readMeta().nightmareUnlocked;
  }

  function unlockNightmare() {
    if (isNightmareUnlocked()) return;
    var meta = window.Game.Save.readMeta();
    meta.nightmareUnlocked = true;
    window.Game.Save.writeMeta(meta);
  }

  // The 5 unlockable "Valiant" elite classes (see data-classes.js's `unlock`
  // field) each gate on either a tower difficulty clear or a Survival Arena
  // wave milestone. Both are tracked in the meta store (like nightmareUnlocked
  // above) so they survive clearRun() -- an elite class stays unlocked across
  // permadeath once earned.
  function recordDifficultyCleared(difficultyId) {
    var meta = window.Game.Save.readMeta();
    meta.clearedDifficulty = meta.clearedDifficulty || {};
    if (meta.clearedDifficulty[difficultyId]) return;
    meta.clearedDifficulty[difficultyId] = true;
    window.Game.Save.writeMeta(meta);
  }

  function recordSurvivalWaves(waves) {
    var meta = window.Game.Save.readMeta();
    if ((meta.survivalBestWaves || 0) >= waves) return;
    meta.survivalBestWaves = waves;
    window.Game.Save.writeMeta(meta);
  }

  function isClassUnlocked(classId) {
    deps();
    var cls = D.getClass(classId);
    if (!cls || !cls.unlock) return true;
    var meta = window.Game.Save.readMeta();
    if (cls.unlock.type === 'difficulty') return !!(meta.clearedDifficulty && meta.clearedDifficulty[cls.unlock.difficulty]);
    if (cls.unlock.type === 'survivalWaves') return (meta.survivalBestWaves || 0) >= cls.unlock.waves;
    return true;
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
    pending: { difficulty: null, classId: null, ascension: 0 },
    ELIXIR_RESTOCK_FLOORS: ELIXIR_RESTOCK_FLOORS,
    elixirAvailable: elixirAvailable,
    spendElixir: spendElixir,
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
    normalizeRunExtras: normalizeRunExtras,
    addItem: addItem,
    removeItem: removeItem,
    addGold: addGold,
    spendGold: spendGold,
    sellItem: sellItem,
    craftItem: craftItem,
    useConsumable: useConsumable,
    recordEnemiesDefeated: recordEnemiesDefeated,
    recordBattleWon: recordBattleWon,
    recordArenaWaveCleared: recordArenaWaveCleared,
    getQuestProgress: getQuestProgress,
    isQuestClaimable: isQuestClaimable,
    claimQuest: claimQuest,
    claimAllQuests: claimAllQuests,
    isNightmareUnlocked: isNightmareUnlocked,
    unlockNightmare: unlockNightmare,
    recordDifficultyCleared: recordDifficultyCleared,
    recordSurvivalWaves: recordSurvivalWaves,
    isClassUnlocked: isClassUnlocked,
    addBlessing: addBlessing,
    addCurse: addCurse,
    hasReviveBlessing: hasReviveBlessing,
    addRelic: addRelic,
    hasRelic: hasRelic,
    relicDamageMult: relicDamageMult,
    getRewardMult: getRewardMult,
    isCompanionUnlocked: isCompanionUnlocked,
    hireCompanion: hireCompanion,
    recordFloorReached: recordFloorReached,
    recordEnemySeen: recordEnemySeen,
    recordEventSeen: recordEventSeen,
    recordAscensionClear: recordAscensionClear,
    getAscensionUnlocked: getAscensionUnlocked,
    setAchievementFlag: setAchievementFlag,
    isAchievementUnlocked: isAchievementUnlocked,
    equipTitle: equipTitle,
    getEquippedTitle: getEquippedTitle,
    saveNow: saveNow,
    clearRun: clearRun
  };
})();
