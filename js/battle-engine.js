// Battle engine: initiative/action-point economy, weakness resolution, enemy AI, All-Out Attack.
// Round structure: player phase (chained action-point turns) -> enemy phase -> next round.
// A large SPD gap grants a one-time ambush (enemy first-strike) or head-start (bonus player AP) at battle start.
(function () {
  function D() { return window.Game.Data; }
  function F() { return window.Game.Formulas; }
  function S() { return window.Game.State; }
  function L(obj, field) { return window.Game.I18n.L(obj, field); }

  function tickBuffs(list) {
    for (var i = list.length - 1; i >= 0; i--) {
      list[i].turnsLeft -= 1;
      if (list[i].turnsLeft <= 0) list.splice(i, 1);
    }
  }

  // Re-applying a stat mod refreshes it instead of stacking, so a repeated debuff attack
  // (e.g. the boss's over many rounds) can't compound into an ever-growing penalty.
  function applyStatMod(list, stat, amount, turnsLeft) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].stat === stat) { list[i].amount = amount; list[i].turnsLeft = turnsLeft; return; }
    }
    list.push({ stat: stat, amount: amount, turnsLeft: turnsLeft });
  }

  function effectiveStats(actor, buffs) {
    var eff = { atk: actor.atk, mag: actor.mag, def: actor.def, res: actor.res, spd: actor.spd, luk: actor.luk };
    (buffs || []).forEach(function (b) {
      var keys = b.stat === 'atkmag' ? ['atk', 'mag'] : b.stat === 'defres' ? ['def', 'res'] : [b.stat];
      keys.forEach(function (k) { if (eff[k] != null) eff[k] = eff[k] * (1 + b.amount); });
    });
    Object.keys(eff).forEach(function (k) { eff[k] = Math.max(0, Math.round(eff[k])); });
    return eff;
  }

  function markRevealed(entity, element, relation) {
    if (!entity.revealed || relation === 'normal') return;
    var arr = entity.revealed[relation];
    if (arr && arr.indexOf(element) === -1) arr.push(element);
  }

  function resolveHit(attackerEff, defenderEntity, defenderEff, element, power) {
    var relation = F().elementRelation(defenderEntity, element);
    markRevealed(defenderEntity, element, relation);
    var isCrit = false;
    if (relation !== 'null' && relation !== 'reflect' && relation !== 'drain') {
      isCrit = Math.random() < F().critChance(attackerEff.luk);
    }
    var dmgRelation = (relation === 'reflect' || relation === 'drain') ? 'normal' : relation;
    var amount = F().computeDamage({
      element: element, power: power,
      atkStat: attackerEff.atk, magStat: attackerEff.mag,
      defStat: defenderEff.def, resStat: defenderEff.res,
      relation: dmgRelation, isCrit: isCrit
    });
    return { relation: relation, isCrit: isCrit, amount: amount };
  }

  function pickWeighted(list) {
    var total = list.reduce(function (s, a) { return s + (a.weight != null ? a.weight : 1); }, 0);
    var r = Math.random() * total;
    for (var i = 0; i < list.length; i++) {
      r -= (list[i].weight != null ? list[i].weight : 1);
      if (r <= 0) return list[i];
    }
    return list[list.length - 1];
  }

  function buildEnemyActor(template, floor, difficultyId, groupScale, uid) {
    var scale = F().enemyStatScale(floor, difficultyId);
    var stats = F().scaleStatsBlock(template.baseStats, scale, groupScale);
    return {
      uid: uid, templateId: template.id, name: L(template, 'name'), icon: template.icon, isBoss: false,
      maxHp: stats.hp, hp: stats.hp, atk: stats.atk, mag: stats.mag, def: stats.def, res: stats.res, spd: stats.spd, luk: stats.luk,
      expReward: stats.exp,
      weak: (template.weak || []).slice(), resist: (template.resist || []).slice(),
      null: (template.null || []).slice(), drain: (template.drain || []).slice(), reflect: (template.reflect || []).slice(),
      attacksPool: template.attacks.slice(),
      downed: false, alive: true, debuffs: [],
      revealed: { weak: [], resist: [], null: [], drain: [], reflect: [] }
    };
  }

  function buildBossActor(template, difficultyId, uid) {
    var scale = F().bossStatScale(difficultyId);
    var stats = F().scaleStatsBlock(template.baseStats, scale, 1);
    return {
      uid: uid, templateId: template.id, name: L(template, 'name'), icon: template.icon, isBoss: true,
      maxHp: stats.hp, hp: stats.hp, atk: stats.atk, mag: stats.mag, def: stats.def, res: stats.res, spd: stats.spd, luk: stats.luk,
      expReward: stats.exp,
      weak: template.weak.slice(), resist: template.resist.slice(), null: [], drain: [], reflect: [],
      attacksPool: template.attacks.slice(),
      phase: 1, phasesData: template.phases || [],
      downed: false, alive: true, debuffs: [],
      revealed: { weak: [], resist: [], null: [], drain: [], reflect: [] }
    };
  }

  // Mini-boss actors use the regular per-floor enemy curve (they're tuned via
  // hand-authored baseStats to already hit noticeably harder than a same-tier
  // regular enemy), not the flat end-game bossStatScale.
  function buildMiniBossActor(template, floor, difficultyId, uid) {
    var scale = F().enemyStatScale(floor, difficultyId);
    var stats = F().scaleStatsBlock(template.baseStats, scale, 1);
    return {
      uid: uid, templateId: template.id, name: L(template, 'name'), icon: template.icon, isBoss: true,
      maxHp: stats.hp, hp: stats.hp, atk: stats.atk, mag: stats.mag, def: stats.def, res: stats.res, spd: stats.spd, luk: stats.luk,
      expReward: stats.exp,
      weak: template.weak.slice(), resist: template.resist.slice(), null: [], drain: [], reflect: [],
      attacksPool: template.attacks.slice(),
      phase: 1, phasesData: template.phases || [],
      downed: false, alive: true, debuffs: [],
      revealed: { weak: [], resist: [], null: [], drain: [], reflect: [] }
    };
  }

  function buildPlayerActor(run) {
    var cls = D().getClass(run.classId);
    var total = S().getTotalStats(run);
    return {
      classId: run.classId, name: L(cls, 'name'), icon: cls.icon,
      maxHp: total.hp, maxMp: total.mp,
      atk: total.atk, mag: total.mag, def: total.def, res: total.res, spd: total.spd, luk: total.luk,
      weak: [cls.weak], resist: [cls.resist], null: [], drain: [], reflect: [],
      buffs: [], guarding: false,
      skills: S().learnedSkills(run)
    };
  }

  // `phasesData` is an ordered list of transitions past phase 1 (phasesData[0] is
  // phase 2, phasesData[1] is phase 3, ...). Each entry's hpThreshold is checked
  // against the *current* phase only, so a single big hit can't skip a phase --
  // multi-hit skills re-check after every hit, walking one phase at a time.
  function checkBossPhase(enemy) {
    if (!enemy.isBoss || !enemy.phasesData || !enemy.phasesData.length) return null;
    var next = enemy.phasesData[enemy.phase - 1];
    if (!next || enemy.hp > enemy.maxHp * next.hpThreshold) return null;
    enemy.phase += 1;
    enemy.weak = next.weak.slice();
    enemy.resist = next.resist.slice();
    enemy.reflect = (next.reflect || []).slice();
    enemy.attacksPool = next.attacks.slice();
    // each phase is themed around different elements (weak/resist can even swap) -
    // discard what was revealed so far so stale prior-phase weakness tags don't mislead the player.
    enemy.revealed = { weak: [], resist: [], null: [], drain: [], reflect: [] };
    return L(next, 'announce');
  }

  function checkBattleEnd(battle, events) {
    if (battle.over) return;
    if (battle.run.hp <= 0) {
      battle.run.hp = 0;
      battle.over = true;
      battle.victory = false;
      events.push({ type: 'defeat' });
      return;
    }
    var living = battle.enemies.filter(function (e) { return e.alive; });
    if (living.length === 0) {
      battle.over = true;
      battle.victory = true;
      events.push({ type: 'victory' });
    }
  }

  function createBattle(run, floor, isBossFloor) {
    var enemies = [];
    var miniBossTemplate = D().getMiniBoss(floor);
    if (isBossFloor) {
      enemies.push(buildBossActor(D().boss, run.difficulty, 'e0'));
    } else if (miniBossTemplate) {
      enemies.push(buildMiniBossActor(miniBossTemplate, floor, run.difficulty, 'e0'));
    } else {
      var tier = F().tierForFloor(floor);
      var pool = D().getEnemiesByTier(tier);
      var count = F().floorEnemyCount(floor);
      var groupScale = F().groupScaleFactor(count);
      for (var i = 0; i < count; i++) {
        var template = pool[Math.floor(Math.random() * pool.length)];
        enemies.push(buildEnemyActor(template, floor, run.difficulty, groupScale, 'e' + i));
      }
    }
    var player = buildPlayerActor(run);
    var avgEnemySpd = enemies.reduce(function (s, e) { return s + e.spd; }, 0) / enemies.length;
    var firstStrike = null;
    if (player.spd >= avgEnemySpd * 1.3) firstStrike = 'player';
    else if (avgEnemySpd >= player.spd * 1.3) firstStrike = 'enemy';

    return {
      run: run, floor: floor, isBoss: !!isBossFloor,
      player: player, enemies: enemies,
      round: 1, playerAP: firstStrike === 'player' ? 2 : 1,
      awaitingAllOut: false, over: false, victory: false,
      pendingFirstStrike: firstStrike === 'enemy'
    };
  }

  function buildPlayerHits(skill, battle, targetIndex) {
    if (skill.target === 'allEnemies') {
      var out = [];
      battle.enemies.forEach(function (e, i) {
        if (!e.alive) return;
        var el = skill.randomElement ? skill.randomElement[Math.floor(Math.random() * skill.randomElement.length)] : skill.element;
        out.push({ targetIndex: i, element: el, power: skill.power });
      });
      return out;
    }
    var hitsCount = skill.hits || 1;
    var res = [];
    for (var i = 0; i < hitsCount; i++) {
      var el = skill.randomElement ? skill.randomElement[Math.floor(Math.random() * skill.randomElement.length)] : skill.element;
      res.push({ targetIndex: targetIndex, element: el, power: skill.power });
    }
    return res;
  }

  function playerAction(battle, action) {
    var events = [];
    if (battle.over) return { events: events, battleOver: true, victory: battle.victory, playerAP: battle.playerAP };
    var run = battle.run;

    if (action.kind === 'guard') {
      battle.player.guarding = true;
      battle.playerAP = 0;
      events.push({ type: 'guard' });
    } else if (action.kind === 'item') {
      var itemDef = D().getItem(action.itemId);
      if (!itemDef || !itemDef.battleUsable) { events.push({ type: 'invalid' }); return { events: events, battleOver: false, playerAP: battle.playerAP }; }
      var itemRes = S().useConsumable(run, action.itemId);
      if (!itemRes.ok) { events.push({ type: 'invalid' }); return { events: events, battleOver: false, playerAP: battle.playerAP }; }
      events.push({ type: 'itemUsed', itemId: action.itemId, result: itemRes, hpAfter: run.hp, mpAfter: run.mp, maxHp: battle.player.maxHp, maxMp: battle.player.maxMp });
      battle.playerAP -= 1;
    } else if (action.kind === 'attack' || action.kind === 'skill') {
      var skillId = action.kind === 'attack' ? 'attack' : action.skillId;
      var skill = D().getSkill(skillId);
      if (!skill || run.mp < skill.cost) { events.push({ type: 'invalid' }); return { events: events, battleOver: false, playerAP: battle.playerAP }; }
      // validate the target *before* spending MP, so an invalid/stale target can't waste resources
      if (skill.target === 'singleEnemy') {
        var checkTgt = battle.enemies[action.targetIndex];
        if (!checkTgt || !checkTgt.alive) { events.push({ type: 'invalid' }); return { events: events, battleOver: false, playerAP: battle.playerAP }; }
      }
      run.mp -= skill.cost;
      events.push({ type: 'skillUsed', name: L(skill, 'name'), element: skill.element });

      if (skill.kind === 'heal') {
        var healAmt = Math.round(battle.player.maxHp * skill.power);
        run.hp = Math.min(battle.player.maxHp, run.hp + healAmt);
        events.push({ type: 'heal', side: 'player', amount: healAmt, hpAfter: run.hp, maxHp: battle.player.maxHp });
        battle.playerAP -= 1;
      } else if (skill.kind === 'buffSelf') {
        applyStatMod(battle.player.buffs, skill.stat, skill.amount, 3);
        events.push({ type: 'buff', side: 'player', stat: skill.stat, amount: skill.amount });
        if (skill.healPower) {
          var hAmt = Math.round(battle.player.maxHp * skill.healPower);
          run.hp = Math.min(battle.player.maxHp, run.hp + hAmt);
          events.push({ type: 'heal', side: 'player', amount: hAmt, hpAfter: run.hp, maxHp: battle.player.maxHp });
        }
        battle.playerAP -= 1;
      } else if (skill.kind === 'debuffEnemy') {
        var tgt = battle.enemies[action.targetIndex];
        applyStatMod(tgt.debuffs, skill.stat, -skill.amount, 3);
        events.push({ type: 'buff', side: 'enemy', targetName: tgt.name, stat: skill.stat, amount: -skill.amount });
        battle.playerAP -= 1;
      } else if (skill.kind === 'attack') {
        var hits = buildPlayerHits(skill, battle, action.targetIndex);
        var hadWeakCrit = false, hadNullish = false;
        var playerEff = effectiveStats(battle.player, battle.player.buffs);
        hits.forEach(function (h) {
          var enemy = battle.enemies[h.targetIndex];
          if (!enemy || !enemy.alive) return;
          var enemyEff = effectiveStats(enemy, enemy.debuffs);
          var hit = resolveHit(playerEff, enemy, enemyEff, h.element, h.power);
          if (hit.relation === 'reflect') {
            run.hp = Math.max(0, run.hp - hit.amount);
            hadNullish = true;
            events.push({ type: 'reflect', attackerName: battle.player.name, amount: hit.amount, hpAfter: run.hp, maxHp: battle.player.maxHp });
          } else if (hit.relation === 'drain') {
            enemy.hp = Math.min(enemy.maxHp, enemy.hp + hit.amount);
            hadNullish = true;
            events.push({ type: 'drainBlocked', targetUid: enemy.uid, targetName: enemy.name, amount: hit.amount, hpAfter: enemy.hp, maxHp: enemy.maxHp });
          } else if (hit.relation === 'null') {
            hadNullish = true;
            events.push({ type: 'hit', targetSide: 'enemy', targetUid: enemy.uid, targetName: enemy.name, element: h.element, relation: 'null', amount: 0, isCrit: false });
          } else {
            enemy.hp = Math.max(0, enemy.hp - hit.amount);
            if (hit.relation === 'weak' || hit.isCrit) { hadWeakCrit = true; enemy.downed = true; events.push({ type: 'downed', targetUid: enemy.uid, targetName: enemy.name }); }
            events.push({ type: 'hit', targetSide: 'enemy', targetUid: enemy.uid, targetName: enemy.name, element: h.element, relation: hit.relation, isCrit: hit.isCrit, amount: hit.amount, hpAfter: enemy.hp, maxHp: enemy.maxHp });
            if (skill.drainSelf && hit.amount > 0) {
              var healBack = Math.round(hit.amount * 0.4);
              run.hp = Math.min(battle.player.maxHp, run.hp + healBack);
              events.push({ type: 'heal', side: 'player', amount: healBack, hpAfter: run.hp, maxHp: battle.player.maxHp });
            }
            if (enemy.hp <= 0) {
              enemy.alive = false;
              events.push({ type: 'defeated', targetUid: enemy.uid, targetName: enemy.name, side: 'enemy' });
            } else if (enemy.isBoss) {
              var phaseMsg = checkBossPhase(enemy);
              if (phaseMsg) events.push({ type: 'bossPhaseChange', message: phaseMsg });
            }
          }
        });
        battle.playerAP -= 1;
        if (hadNullish) battle.playerAP = 0;
        else if (hadWeakCrit) battle.playerAP = Math.min(battle.playerAP + 1, 4);
      }
    }

    checkBattleEnd(battle, events);
    if (!battle.over) {
      var living = battle.enemies.filter(function (e) { return e.alive; });
      if (living.length && living.every(function (e) { return e.downed; })) {
        battle.awaitingAllOut = true;
        events.push({ type: 'allOutReady' });
      }
    }
    return { events: events, battleOver: battle.over, victory: battle.victory, awaitingAllOut: battle.awaitingAllOut, playerAP: battle.playerAP };
  }

  function confirmAllOut(battle, use) {
    battle.awaitingAllOut = false;
    var events = [];
    if (!use) {
      events.push({ type: 'allOutDeclined' });
      return { events: events, battleOver: battle.over, victory: battle.victory, playerAP: battle.playerAP };
    }
    var living = battle.enemies.filter(function (e) { return e.alive; });
    var playerEff = effectiveStats(battle.player, battle.player.buffs);
    var per = Math.max(1, Math.round((playerEff.atk * 0.9 + playerEff.mag * 0.5) * (1.5 + 0.12 * living.length) * (0.95 + Math.random() * 0.15)));
    events.push({ type: 'allOutStart' });
    living.forEach(function (e) {
      e.hp = Math.max(0, e.hp - per);
      e.downed = false;
      var defeated = e.hp <= 0;
      if (defeated) e.alive = false;
      events.push({ type: 'allOutHit', targetUid: e.uid, targetName: e.name, amount: per, hpAfter: e.hp, maxHp: e.maxHp, defeated: defeated });
      if (!defeated && e.isBoss) {
        var msg = checkBossPhase(e);
        if (msg) events.push({ type: 'bossPhaseChange', message: msg });
      }
    });
    battle.playerAP = 0;
    checkBattleEnd(battle, events);
    return { events: events, battleOver: battle.over, victory: battle.victory, playerAP: battle.playerAP };
  }

  // A large *current* (post-buff/debuff) SPD gap grants a bonus action for the round,
  // mirroring the one-time ambush/head-start check createBattle runs on base SPD --
  // this is what makes Haste, Binding Shot, Veil of Night, etc. actually do something.
  function spdAheadBonus(fastSpd, slowSpd) {
    return slowSpd > 0 && fastSpd >= slowSpd * 1.3;
  }

  function startNextRound(battle) {
    battle.round += 1;
    battle.enemies.forEach(function (e) { if (e.alive) e.downed = false; tickBuffs(e.debuffs); });
    tickBuffs(battle.player.buffs);
    var alive = battle.enemies.filter(function (e) { return e.alive; });
    var avgEnemySpd = alive.length ? alive.reduce(function (s, e) { return s + effectiveStats(e, e.debuffs).spd; }, 0) / alive.length : 0;
    var playerSpd = effectiveStats(battle.player, battle.player.buffs).spd;
    battle.playerAP = spdAheadBonus(playerSpd, avgEnemySpd) ? 2 : 1;
    battle.awaitingAllOut = false;
  }

  function runEnemyPhase(battle) {
    var events = [];
    if (battle.over) return { events: events, battleOver: true, victory: battle.victory, playerAP: battle.playerAP, round: battle.round };
    for (var i = 0; i < battle.enemies.length; i++) {
      var enemy = battle.enemies[i];
      if (!enemy.alive) continue;
      if (enemy.downed) { events.push({ type: 'enemyPhaseSkip', targetName: enemy.name }); continue; }
      var enemySpd0 = effectiveStats(enemy, enemy.debuffs).spd;
      var playerSpd0 = effectiveStats(battle.player, battle.player.buffs).spd;
      // round 1 already grants a full ambush phase off this same speed gap (see createBattle) --
      // skip the bonus-action check there so a fast enemy doesn't double-dip the same lead.
      var ap = (battle.round > 1 && spdAheadBonus(enemySpd0, playerSpd0)) ? 2 : 1;
      // Weakness/crit hits grant bonus AP (mirrors the player's own extra-turn rule below),
      // but without a hard cap a lucky/weakness-exploiting streak could keep one enemy
      // attacking all round -- cap each enemy to 2 attacks per turn no matter how many
      // bonus-AP hits it lands.
      var hitsThisTurn = 0;
      var maxHitsPerTurn = 2;
      while (ap > 0 && hitsThisTurn < maxHitsPerTurn) {
        if (battle.run.hp <= 0) break;
        var atk = pickWeighted(enemy.attacksPool);
        var attackerEff = effectiveStats(enemy, enemy.debuffs);
        var playerEff = effectiveStats(battle.player, battle.player.buffs);
        var hit = resolveHit(attackerEff, battle.player, playerEff, atk.element, atk.power);
        ap -= 1;
        hitsThisTurn += 1;
        var hadWeakCrit = false, hadNullish = false;
        if (hit.relation === 'reflect') {
          enemy.hp = Math.max(0, enemy.hp - hit.amount);
          hadNullish = true;
          events.push({ type: 'reflect', attackerUid: enemy.uid, attackerName: enemy.name, amount: hit.amount, hpAfter: enemy.hp, maxHp: enemy.maxHp });
          if (enemy.hp <= 0) { enemy.alive = false; events.push({ type: 'defeated', targetUid: enemy.uid, targetName: enemy.name, side: 'enemy' }); }
        } else if (hit.relation === 'drain') {
          hadNullish = true;
          events.push({ type: 'hit', targetSide: 'player', relation: 'drain', amount: 0, attackerName: enemy.name });
        } else if (hit.relation === 'null') {
          hadNullish = true;
          events.push({ type: 'hit', targetSide: 'player', relation: 'null', amount: 0, attackerName: enemy.name });
        } else {
          var dmg = hit.amount;
          if (battle.player.guarding) dmg = Math.round(dmg * 0.5);
          battle.run.hp = Math.max(0, battle.run.hp - dmg);
          if (atk.drainSelf && dmg > 0) enemy.hp = Math.min(enemy.maxHp, enemy.hp + Math.round(dmg * 0.4));
          if (hit.relation === 'weak' || hit.isCrit) hadWeakCrit = true;
          events.push({ type: 'hit', targetSide: 'player', attackerUid: enemy.uid, attackerName: enemy.name, skillName: L(atk, 'name'), element: atk.element, relation: hit.relation, isCrit: hit.isCrit, amount: dmg, hpAfter: battle.run.hp, maxHp: battle.player.maxHp, attackerHpAfter: enemy.hp, attackerMaxHp: enemy.maxHp });
          if (atk.debuff) {
            applyStatMod(battle.player.buffs, atk.debuff.stat, -atk.debuff.amount, 3);
            events.push({ type: 'buff', side: 'player', stat: atk.debuff.stat, amount: -atk.debuff.amount });
          }
        }
        if (hadWeakCrit) ap = Math.min(ap + 1, 2); else if (hadNullish) ap = 0;
        checkBattleEnd(battle, events);
        if (battle.over) break;
      }
      if (battle.over) break;
    }
    battle.player.guarding = false;
    if (!battle.over) startNextRound(battle);
    return { events: events, battleOver: battle.over, victory: battle.victory, playerAP: battle.playerAP, round: battle.round };
  }

  // `rate` optionally scales rewards down (used for replaying an
  // already-cleared floor, at 40% -- see BattleUI.handleVictory).
  function getExpReward(battle, rate) {
    var total = battle.enemies.reduce(function (s, e) { return s + (e.expReward || 0); }, 0);
    return rate == null ? total : Math.round(total * rate);
  }

  function getGoldReward(battle, rate) {
    var total = battle.enemies.reduce(function (s, e) { return s + F().goldForExp(e.expReward || 0); }, 0);
    return rate == null ? total : Math.round(total * rate);
  }

  // Crafting material drops: each defeated enemy independently rolls against its
  // tier's 2-material pool (regular enemies have an explicit tier; mini-bosses
  // and the final boss don't, so their tier is derived from the floor instead).
  // Bosses/mini-bosses always drop, and drop more, to reward the tougher fight.
  // `rate` scales the drop chance itself (not the quantity), so a successful
  // drop is still a full-size one -- just rarer on a replay.
  function getMaterialDrops(battle, rate) {
    if (rate == null) rate = 1;
    var drops = {};
    battle.enemies.forEach(function (e) {
      var template = D().getEnemyTemplate(e.templateId);
      if (!template) return;
      var tier = template.tier || F().tierForFloor(battle.floor);
      var mats = D().items.filter(function (it) { return it.kind === 'material' && it.tier === tier; });
      if (!mats.length) return;
      var dropChance = (e.isBoss ? 1 : 0.5) * rate;
      if (Math.random() >= dropChance) return;
      var qty = e.isBoss ? (1 + Math.floor(Math.random() * 2)) : 1;
      var mat = mats[Math.floor(Math.random() * mats.length)];
      drops[mat.id] = (drops[mat.id] || 0) + qty;
    });
    return Object.keys(drops).map(function (id) { return { id: id, qty: drops[id] }; });
  }

  window.Game = window.Game || {};
  window.Game.BattleEngine = {
    createBattle: createBattle,
    playerAction: playerAction,
    confirmAllOut: confirmAllOut,
    runEnemyPhase: runEnemyPhase,
    getExpReward: getExpReward,
    getGoldReward: getGoldReward,
    getMaterialDrops: getMaterialDrops,
    effectiveStats: effectiveStats
  };
})();
