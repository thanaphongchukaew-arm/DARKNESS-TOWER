// Profile progression is settled once per finished tower run.
(function () {
  var G = window.Game;
  var perks = [
    { id: 'samurai_draw', classId: 'samurai', xp: 25, price: 10, icon: 'swordAttack' },
    { id: 'samurai_guard', classId: 'samurai', xp: 75, price: 25, icon: 'shield' }
  ];

  function count(value) { return Number.isSafeInteger(value) && value > 0 ? value : 0; }

  function profile(meta) {
    var data = meta.mastery || {};
    return {
      coins: count(data.coins), classes: data.classes || {}, lastSettlement: data.lastSettlement || null
    };
  }

  function classRecord(data, classId) {
    var entry = data.classes[classId] || {};
    return { xp: count(entry.xp), owned: Array.isArray(entry.owned) ? entry.owned : [], equipped: entry.equipped || null };
  }

  function recordClear(run, floor) {
    var progress = run.masteryProgress || { floor: 0, xp: 0, coins: 0 };
    if (!Number.isInteger(floor) || floor < 1 || floor > 100 || floor <= count(progress.floor)) return;
    var boss = floor === 100 || !!G.Data.getMiniBoss(floor);
    run.masteryProgress = {
      floor: floor, xp: count(progress.xp) + 5 + (boss ? 10 : 0), coins: count(progress.coins) + 2 + (boss ? 5 : 0)
    };
  }

  // Use the profile's run counter to identify saves made before mastery existed.
  function settle(run, victory) {
    if (!G.Data.getClass(run.classId)) return null;
    var meta = G.Save.readMeta();
    var data = profile(meta);
    var attempt = run.masteryAttempt || ('legacy:' + count(meta.runsStarted));
    if (data.lastSettlement && data.lastSettlement.attempt === attempt) return data.lastSettlement.reward;
    var progress = run.masteryProgress || {};
    var reward = { xp: count(progress.xp) + (victory ? 30 : 0), coins: count(progress.coins) + (victory ? 20 : 0) };
    var entry = classRecord(data, run.classId);
    entry.xp += reward.xp;
    reward.totalXP = entry.xp;
    data.classes[run.classId] = entry;
    data.coins += reward.coins;
    data.lastSettlement = { attempt: attempt, reward: reward };
    meta.mastery = data;
    return G.Save.writeMeta(meta) ? reward : null;
  }

  function getPerk(classId, id) {
    return perks.find(function (perk) { return perk.classId === classId && perk.id === id; });
  }

  function equipped(classId, data) {
    var entry = classRecord(data || profile(G.Save.readMeta()), classId);
    return getPerk(classId, entry.equipped) && entry.owned.indexOf(entry.equipped) !== -1 ? entry.equipped : null;
  }

  function selectPerk(classId, id) {
    if (G.State.current || G.Save.exists() || !G.State.isClassUnlocked(classId)) return false;
    var perk = getPerk(classId, id);
    if (!perk) return false;
    var meta = G.Save.readMeta();
    var data = profile(meta);
    var entry = classRecord(data, classId);
    if (entry.owned.indexOf(id) === -1) {
      if (entry.xp < perk.xp || data.coins < perk.price) return false;
      data.coins -= perk.price;
      entry.owned.push(id);
    }
    entry.equipped = entry.equipped === id ? null : id;
    data.classes[classId] = entry;
    meta.mastery = data;
    return G.Save.writeMeta(meta);
  }

  G.Mastery = {
    profile: profile, classRecord: classRecord, perks: perks, recordClear: recordClear,
    settle: settle, equipped: equipped, selectPerk: selectPerk
  };
})();
