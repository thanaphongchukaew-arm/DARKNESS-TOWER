// Battle engine: initiative/action-point economy, damage resolution, enemy AI, All-Out Attack.
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

  // Player's own outgoing ATK/MAG for damage/companion-power purposes -- wraps
  // effectiveStats with any relic effect that depends on the player's own state
  // (see data-relics.js's Adrenaline Core), so every call site that reads the
  // player's offense (attack hits, All-Out Attack, the companion attacker role)
  // picks it up identically instead of each re-checking the relic itself.
  function playerOffenseEff(battle) {
    var eff = effectiveStats(battle.player, battle.player.buffs);
    var relic = D().getRelic('adrenaline_core');
    if (relic && S().hasRelic(battle.run, 'adrenaline_core') && battle.run.hp <= battle.player.maxHp * relic.lowHpThreshold) {
      eff.atk = Math.round(eff.atk * (1 + relic.lowHpPowerAmount));
      eff.mag = Math.round(eff.mag * (1 + relic.lowHpPowerAmount));
    }
    return eff;
  }

  function resolveHit(attackerEff, defenderEff, element, power) {
    var isCrit = Math.random() < F().critChance(attackerEff.luk);
    var amount = F().computeDamage({
      element: element, power: power,
      atkStat: attackerEff.atk, magStat: attackerEff.mag,
      defStat: defenderEff.def, resStat: defenderEff.res,
      isCrit: isCrit
    });
    return { isCrit: isCrit, amount: amount };
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

  // Shared by the floor-based curve (buildEnemyActor) and the Endless Arena's
  // wave-based curve (createSurvivalBattle), which each compute `scale` differently.
  // Also the single chokepoint every regular enemy actor is built through, so this
  // is where the Bestiary's first-sighting tracker hooks in (purely additive --
  // a meta write only, cannot affect the stats/actor shape below it).
  function buildEnemyActorScaled(template, scale, groupScale, uid) {
    S().recordEnemySeen(template.id);
    var stats = F().scaleStatsBlock(template.baseStats, scale, groupScale);
    return {
      uid: uid, templateId: template.id, name: L(template, 'name'), icon: template.icon, isBoss: false,
      maxHp: stats.hp, hp: stats.hp, atk: stats.atk, mag: stats.mag, def: stats.def, res: stats.res, spd: stats.spd, luk: stats.luk,
      expReward: stats.exp,
      attacksPool: template.attacks.slice(),
      downed: false, alive: true, debuffs: []
    };
  }

  // `ascension` (0 if omitted) composes Formulas.ascensionEnemyMult into the scale
  // at this call site, never inside scaleStatsBlock itself, so a plain (non-Nightmare
  // or ascension-0) run's numbers are completely unaffected.
  function buildEnemyActor(template, floor, difficultyId, groupScale, uid, ascension) {
    var scale = F().enemyStatScale(floor, difficultyId) * F().ascensionEnemyMult(ascension);
    return buildEnemyActorScaled(template, scale, groupScale, uid);
  }

  function buildBossActor(template, difficultyId, uid, ascension) {
    S().recordEnemySeen(template.id);
    var scale = F().bossStatScale(difficultyId) * F().ascensionEnemyMult(ascension);
    var stats = F().scaleStatsBlock(template.baseStats, scale, 1);
    return {
      uid: uid, templateId: template.id, name: L(template, 'name'), icon: template.icon, isBoss: true,
      maxHp: stats.hp, hp: stats.hp, atk: stats.atk, mag: stats.mag, def: stats.def, res: stats.res, spd: stats.spd, luk: stats.luk,
      expReward: stats.exp,
      attacksPool: template.attacks.slice(),
      phase: 1, phasesData: template.phases || [],
      downed: false, alive: true, debuffs: []
    };
  }

  // Mini-boss actors use the regular per-floor enemy curve (they're tuned via
  // hand-authored baseStats to already hit noticeably harder than a same-tier
  // regular enemy), not the flat end-game bossStatScale.
  function buildMiniBossActor(template, floor, difficultyId, uid, ascension) {
    S().recordEnemySeen(template.id);
    var scale = F().enemyStatScale(floor, difficultyId) * F().ascensionEnemyMult(ascension);
    var stats = F().scaleStatsBlock(template.baseStats, scale, 1);
    return {
      uid: uid, templateId: template.id, name: L(template, 'name'), icon: template.icon, isBoss: true,
      maxHp: stats.hp, hp: stats.hp, atk: stats.atk, mag: stats.mag, def: stats.def, res: stats.res, spd: stats.spd, luk: stats.luk,
      expReward: stats.exp,
      attacksPool: template.attacks.slice(),
      phase: 1, phasesData: template.phases || [],
      downed: false, alive: true, debuffs: []
    };
  }

  // Companion (see data-companions.js): a passive ally that auto-acts once per
  // round via runCompanionPhase below. Its power is a fraction of the player's own
  // *current* effective stats (computed fresh each round, not cached here), so it
  // needs no growth curve of its own. Deliberately not an actor in `battle.enemies`
  // and never targeted by enemy attacks (see runEnemyPhase, unchanged) -- this is
  // what keeps the whole feature from touching checkBattleEnd/victory-defeat logic.
  function buildCompanionActor(run) {
    if (!run.companionId) return null;
    var def = D().getCompanion(run.companionId);
    if (!def) return null;
    return { id: def.id, name: L(def, 'name'), icon: def.icon, def: def };
  }

  function buildPlayerActor(run) {
    var cls = D().getClass(run.classId);
    var total = S().getTotalStats(run);
    return {
      classId: run.classId, name: L(cls, 'name'), icon: cls.icon,
      maxHp: total.hp, maxMp: total.mp,
      atk: total.atk, mag: total.mag, def: total.def, res: total.res, spd: total.spd, luk: total.luk,
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
    enemy.attacksPool = next.attacks.slice();
    return L(next, 'announce');
  }

  function checkBattleEnd(battle, events) {
    if (battle.over) return;
    if (battle.run.hp <= 0) {
      // Guardian Spirit blessing: a one-time-per-run safety net -- consumed here,
      // the single chokepoint every defeat check already passes through (playerAction,
      // confirmAllOut, runEnemyPhase, runCompanionPhase all call this same function),
      // so there's exactly one place this can ever fire.
      if (S().hasReviveBlessing(battle.run) && !battle.run.blessingRevived) {
        battle.run.blessingRevived = true;
        battle.run.hp = 1;
        events.push({ type: 'blessingRevive', hpAfter: 1, maxHp: battle.player.maxHp });
        return;
      }
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
      enemies.push(buildBossActor(D().boss, run.difficulty, 'e0', run.ascension));
    } else if (miniBossTemplate) {
      enemies.push(buildMiniBossActor(miniBossTemplate, floor, run.difficulty, 'e0', run.ascension));
    } else {
      var tier = F().tierForFloor(floor);
      var pool = D().getEnemiesByTier(tier);
      var count = F().floorEnemyCount(floor);
      var groupScale = F().groupScaleFactor(count);
      for (var i = 0; i < count; i++) {
        var template = pool[Math.floor(Math.random() * pool.length)];
        enemies.push(buildEnemyActor(template, floor, run.difficulty, groupScale, 'e' + i, run.ascension));
      }
    }
    var player = buildPlayerActor(run);
    var avgEnemySpd = enemies.reduce(function (s, e) { return s + e.spd; }, 0) / enemies.length;
    var firstStrike = null;
    if (player.spd >= avgEnemySpd * 1.3) firstStrike = 'player';
    else if (avgEnemySpd >= player.spd * 1.3) firstStrike = 'enemy';

    return {
      run: run, floor: floor, isBoss: !!isBossFloor,
      player: player, enemies: enemies, companion: buildCompanionActor(run),
      round: 1, playerAP: firstStrike === 'player' ? 2 : 1,
      awaitingAllOut: false, over: false, victory: false,
      pendingFirstStrike: firstStrike === 'enemy'
    };
  }

  // Endless Arena: an infinitely repeatable, non-progressing battle (no floor
  // advance, no gold/equipment reward -- see ui-battle.js's handleSurvivalWaveEnd)
  // built from the player's *current* tower tier so it's relevant at any point in
  // a run, then scaled ever upward by wave via F().survivalStatScale. Reuses the
  // exact same actor shapes as createBattle, so playerAction/runEnemyPhase/
  // confirmAllOut all work on it completely unchanged.
  function createSurvivalBattle(run, wave) {
    var tier = F().tierForFloor(run.currentFloor);
    var pool = D().getEnemiesByTier(tier);
    var count = F().survivalEnemyCount(wave);
    var groupScale = F().groupScaleFactor(count);
    var scale = F().survivalStatScale(run.currentFloor, run.difficulty, wave) * F().ascensionEnemyMult(run.ascension);
    var enemies = [];
    for (var i = 0; i < count; i++) {
      var template = pool[Math.floor(Math.random() * pool.length)];
      enemies.push(buildEnemyActorScaled(template, scale, groupScale, 'e' + i));
    }
    var player = buildPlayerActor(run);
    var avgEnemySpd = enemies.reduce(function (s, e) { return s + e.spd; }, 0) / enemies.length;
    var firstStrike = null;
    if (player.spd >= avgEnemySpd * 1.3) firstStrike = 'player';
    else if (avgEnemySpd >= player.spd * 1.3) firstStrike = 'enemy';

    return {
      run: run, floor: run.currentFloor, isBoss: false, isSurvival: true, wave: wave,
      player: player, enemies: enemies, companion: buildCompanionActor(run),
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
      // Blood-magic skills (Deathbringer) pay with a slice of max HP instead of/alongside
      // MP -- must always leave the caster with at least 1 HP, so this can never be a
      // free suicide (checkBattleEnd only ever fires from *damage*, not from this cost).
      var hpCostAmt = skill && skill.hpCost ? Math.round(battle.player.maxHp * skill.hpCost) : 0;
      if (!skill || run.mp < skill.cost || (hpCostAmt > 0 && run.hp <= hpCostAmt)) { events.push({ type: 'invalid' }); return { events: events, battleOver: false, playerAP: battle.playerAP }; }
      // validate the target *before* spending MP/HP, so an invalid/stale target can't waste resources
      if (skill.target === 'singleEnemy') {
        var checkTgt = battle.enemies[action.targetIndex];
        if (!checkTgt || !checkTgt.alive) { events.push({ type: 'invalid' }); return { events: events, battleOver: false, playerAP: battle.playerAP }; }
      }
      run.mp -= skill.cost;
      events.push({ type: 'skillUsed', name: L(skill, 'name'), element: skill.element });
      if (hpCostAmt > 0) {
        run.hp -= hpCostAmt;
        events.push({ type: 'hpSacrifice', amount: hpCostAmt, hpAfter: run.hp, maxHp: battle.player.maxHp });
      }

      // Swift Recovery relic: boosts every HP-restoring skill (a heal-kind cast and
      // a buffSelf's optional healPower) -- computed once so both branches below
      // read the same multiplier (see data-relics.js).
      var swiftRecovery = D().getRelic('swift_recovery');
      var healMult = (swiftRecovery && S().hasRelic(run, 'swift_recovery')) ? (1 + swiftRecovery.healBoostPct) : 1;

      if (skill.kind === 'heal') {
        var healAmt = Math.round(battle.player.maxHp * skill.power * healMult);
        run.hp = Math.min(battle.player.maxHp, run.hp + healAmt);
        events.push({ type: 'heal', side: 'player', amount: healAmt, hpAfter: run.hp, maxHp: battle.player.maxHp });
        battle.playerAP -= 1;
      } else if (skill.kind === 'buffSelf') {
        applyStatMod(battle.player.buffs, skill.stat, skill.amount, 3);
        events.push({ type: 'buff', side: 'player', stat: skill.stat, amount: skill.amount });
        if (skill.healPower) {
          var hAmt = Math.round(battle.player.maxHp * skill.healPower * healMult);
          run.hp = Math.min(battle.player.maxHp, run.hp + hAmt);
          events.push({ type: 'heal', side: 'player', amount: hAmt, hpAfter: run.hp, maxHp: battle.player.maxHp });
        }
        battle.playerAP -= 1;
        // Vanguard-only: refunds the AP this cast just spent, so it chains straight
        // into another action instead of ending the turn.
        if (skill.grantsBonusAp) battle.playerAP = Math.min(battle.playerAP + 1, 4);
      } else if (skill.kind === 'debuffEnemy') {
        // Warlord-only: an allEnemies debuff hits every living enemy in one cast --
        // every other debuffEnemy skill in the game is singleEnemy, so `action.targetIndex`
        // is simply unused on this path.
        if (skill.target === 'allEnemies') {
          battle.enemies.forEach(function (e) {
            if (!e.alive) return;
            applyStatMod(e.debuffs, skill.stat, -skill.amount, 3);
            events.push({ type: 'buff', side: 'enemy', targetName: e.name, stat: skill.stat, amount: -skill.amount });
          });
        } else {
          var tgt = battle.enemies[action.targetIndex];
          applyStatMod(tgt.debuffs, skill.stat, -skill.amount, 3);
          events.push({ type: 'buff', side: 'enemy', targetName: tgt.name, stat: skill.stat, amount: -skill.amount });
        }
        battle.playerAP -= 1;
      } else if (skill.kind === 'attack') {
        var hits = buildPlayerHits(skill, battle, action.targetIndex);
        var hadCrit = false;
        var playerEff = playerOffenseEff(battle);
        hits.forEach(function (h) {
          var enemy = battle.enemies[h.targetIndex];
          if (!enemy || !enemy.alive) return;
          var enemyEff = effectiveStats(enemy, enemy.debuffs);
          // Executioner-only: this hit's power spikes against a low-HP target, checked
          // fresh per hit so a multi-hit skill can cross the threshold mid-combo.
          var hitPower = h.power;
          if (skill.executeThreshold && enemy.hp <= enemy.maxHp * skill.executeThreshold) {
            hitPower = hitPower * (1 + skill.executeBonus);
          }
          // Opportunist relic: a second, independent execute-style bonus against
          // low-HP targets -- composes multiplicatively with a skill's own
          // executeThreshold above (e.g. Executioner), rather than replacing it.
          var opportunist = D().getRelic('opportunist');
          if (opportunist && S().hasRelic(run, 'opportunist') && enemy.hp <= enemy.maxHp * opportunist.executeThreshold) {
            hitPower = hitPower * (1 + opportunist.executeBonus);
          }
          var hit = resolveHit(playerEff, enemyEff, h.element, hitPower);
          enemy.hp = Math.max(0, enemy.hp - hit.amount);
          if (hit.isCrit) { hadCrit = true; enemy.downed = true; events.push({ type: 'downed', targetUid: enemy.uid, targetName: enemy.name }); }
          events.push({ type: 'hit', targetSide: 'enemy', targetUid: enemy.uid, targetName: enemy.name, element: h.element, isCrit: hit.isCrit, amount: hit.amount, hpAfter: enemy.hp, maxHp: enemy.maxHp });
          if (skill.drainSelf && hit.amount > 0) {
            var healBack = Math.round(hit.amount * 0.4);
            run.hp = Math.min(battle.player.maxHp, run.hp + healBack);
            events.push({ type: 'heal', side: 'player', amount: healBack, hpAfter: run.hp, maxHp: battle.player.maxHp });
          }
          // Vampiric Fang relic: every attack hit leeches HP back, independently of
          // (and stacking with) a skill's own drainSelf above.
          var vampiricFang = D().getRelic('vampiric_fang');
          if (vampiricFang && hit.amount > 0 && S().hasRelic(run, 'vampiric_fang')) {
            var lifesteal = Math.round(hit.amount * vampiricFang.lifestealPct);
            if (lifesteal > 0) {
              run.hp = Math.min(battle.player.maxHp, run.hp + lifesteal);
              events.push({ type: 'heal', side: 'player', amount: lifesteal, hpAfter: run.hp, maxHp: battle.player.maxHp });
            }
          }
          // Shadowhunter-only: the strike itself cripples the target. Reuses applyStatMod's
          // refresh-not-stack behavior, so repeated hits from a multi-hit skill can't compound it.
          if (skill.onHitDebuff && enemy.alive) {
            applyStatMod(enemy.debuffs, skill.onHitDebuff.stat, -skill.onHitDebuff.amount, 3);
            events.push({ type: 'buff', side: 'enemy', targetName: enemy.name, stat: skill.onHitDebuff.stat, amount: -skill.onHitDebuff.amount });
          }
          if (enemy.hp <= 0) {
            enemy.alive = false;
            events.push({ type: 'defeated', targetUid: enemy.uid, targetName: enemy.name, side: 'enemy' });
          } else if (enemy.isBoss) {
            var phaseMsg = checkBossPhase(enemy);
            if (phaseMsg) events.push({ type: 'bossPhaseChange', message: phaseMsg });
          }
        });
        battle.playerAP -= 1;
        if (hadCrit) {
          battle.playerAP = Math.min(battle.playerAP + 1, 4);
        } else {
          // Momentum Charm relic: a non-crit attack has a flat chance to still
          // grant the same bonus turn a crit would (only rolled when the crit
          // itself didn't already grant it, so this can't double up per action).
          var momentum = D().getRelic('momentum_charm');
          if (momentum && S().hasRelic(run, 'momentum_charm') && Math.random() < momentum.bonusApChance) {
            battle.playerAP = Math.min(battle.playerAP + 1, 4);
          }
        }
        // Vanguard-only: an attack-kind grantsBonusAp skill refunds its own AP same as
        // the buffSelf case above, regardless of whether it also happened to crit
        // (that's evaluated first; this still tops back up afterward).
        if (skill.grantsBonusAp) battle.playerAP = Math.min(battle.playerAP + 1, 4);
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
    var playerEff = playerOffenseEff(battle);
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
      // Crit hits grant bonus AP (mirrors the player's own extra-turn rule below),
      // but without a hard cap a lucky streak could keep one enemy attacking all
      // round -- cap each enemy to 2 attacks per turn no matter how many bonus-AP
      // hits it lands.
      var hitsThisTurn = 0;
      var maxHitsPerTurn = 2;
      while (ap > 0 && hitsThisTurn < maxHitsPerTurn) {
        if (battle.run.hp <= 0) break;
        var atk = pickWeighted(enemy.attacksPool);
        var attackerEff = effectiveStats(enemy, enemy.debuffs);
        var playerEff = effectiveStats(battle.player, battle.player.buffs);
        var hit = resolveHit(attackerEff, playerEff, atk.element, atk.power);
        ap -= 1;
        hitsThisTurn += 1;
        var dmg = hit.amount;
        // Stone Ward relic (see data-relics.js): flat reduction to all incoming
        // enemy damage, applied before Guard's own halving so the two multiply.
        dmg = Math.round(dmg * S().relicDamageMult(battle.run));
        if (battle.player.guarding) dmg = Math.round(dmg * 0.5);
        battle.run.hp = Math.max(0, battle.run.hp - dmg);
        if (atk.drainSelf && dmg > 0) enemy.hp = Math.min(enemy.maxHp, enemy.hp + Math.round(dmg * 0.4));
        events.push({ type: 'hit', targetSide: 'player', attackerUid: enemy.uid, attackerName: enemy.name, skillName: L(atk, 'name'), element: atk.element, isCrit: hit.isCrit, amount: dmg, hpAfter: battle.run.hp, maxHp: battle.player.maxHp, attackerHpAfter: enemy.hp, attackerMaxHp: enemy.maxHp });
        if (atk.debuff) {
          applyStatMod(battle.player.buffs, atk.debuff.stat, -atk.debuff.amount, 3);
          events.push({ type: 'buff', side: 'player', stat: atk.debuff.stat, amount: -atk.debuff.amount });
        }
        if (hit.isCrit) ap = Math.min(ap + 1, 2);
        checkBattleEnd(battle, events);
        if (battle.over) break;
      }
      if (battle.over) break;
    }
    battle.player.guarding = false;
    if (!battle.over) startNextRound(battle);
    return { events: events, battleOver: battle.over, victory: battle.victory, playerAP: battle.playerAP, round: battle.round };
  }

  // Companion auto-turn: fires once per round, called from ui-battle.js's
  // afterPlayerAction between the player's AP hitting 0 and runEnemyPhase --
  // playerAP/enemy-iteration semantics are completely untouched by this. The
  // companion is never pushed into battle.enemies and never a valid attack
  // target, so it can't affect checkBattleEnd's living-enemies/defeat logic
  // except by (legitimately) landing the killing blow as an attacker.
  function runCompanionPhase(battle) {
    var events = [];
    if (battle.over || !battle.companion) {
      return { events: events, battleOver: battle.over, victory: battle.victory, playerAP: battle.playerAP };
    }
    var comp = battle.companion;
    var def = comp.def;
    var playerEff = playerOffenseEff(battle);
    if (def.role === 'attacker') {
      var living = battle.enemies.filter(function (e) { return e.alive; });
      if (living.length) {
        var target = living[Math.floor(Math.random() * living.length)];
        var targetEff = effectiveStats(target, target.debuffs);
        var isCrit = Math.random() < def.critChance;
        // Reuses computeDamage's own physical-hit formula (mitigated by the
        // target's DEF exactly like a normal attack) and its existing 1.6x crit
        // multiplier -- def.critMult documents that fixed value rather than
        // re-implementing a second crit-scaling path.
        var amount = F().computeDamage({
          element: 'phys', power: 1, atkStat: def.power * playerEff.atk, magStat: 0,
          defStat: targetEff.def, resStat: targetEff.res, isCrit: isCrit
        });
        target.hp = Math.max(0, target.hp - amount);
        events.push({ type: 'companionHit', companionName: comp.name, targetUid: target.uid, targetName: target.name, isCrit: isCrit, amount: amount, hpAfter: target.hp, maxHp: target.maxHp });
        if (target.hp <= 0) {
          target.alive = false;
          events.push({ type: 'defeated', targetUid: target.uid, targetName: target.name, side: 'enemy' });
        } else if (target.isBoss) {
          var phaseMsg = checkBossPhase(target);
          if (phaseMsg) events.push({ type: 'bossPhaseChange', message: phaseMsg });
        }
      }
    } else if (def.role === 'healer') {
      var maxHp = battle.player.maxHp;
      var missing = maxHp - battle.run.hp;
      if (missing > 0) {
        var healAmt = Math.min(missing, Math.round(maxHp * def.healPct));
        battle.run.hp += healAmt;
        events.push({ type: 'companionHeal', companionName: comp.name, amount: healAmt, hpAfter: battle.run.hp, maxHp: maxHp });
      }
    } else if (def.role === 'guardian' || def.role === 'buffer') {
      // Refreshed every round via applyStatMod, exactly like a skill buff would be --
      // unlike run-long blessings (see state.js's blessingStatMult), a companion's
      // per-round support IS the correct use of the per-battle buff array.
      def.buffStats.forEach(function (stat) { applyStatMod(battle.player.buffs, stat, def.buffAmount, 1); });
      events.push({ type: 'companionBuff', companionName: comp.name, stats: def.buffStats, amount: def.buffAmount });
    }
    checkBattleEnd(battle, events);
    return { events: events, battleOver: battle.over, victory: battle.victory, playerAP: battle.playerAP };
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
    createSurvivalBattle: createSurvivalBattle,
    playerAction: playerAction,
    confirmAllOut: confirmAllOut,
    runEnemyPhase: runEnemyPhase,
    runCompanionPhase: runCompanionPhase,
    getExpReward: getExpReward,
    getGoldReward: getGoldReward,
    getMaterialDrops: getMaterialDrops,
    effectiveStats: effectiveStats
  };
})();
