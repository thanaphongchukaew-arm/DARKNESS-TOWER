// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Battle engine: initiative/action-point economy, damage resolution, enemy AI, All-Out Attack.
// Round structure: player phase (one action-point turn per round, chainable only by a SPD-ahead
// bonus AP, Vanguard's grantsBonusAp skills, or a Momentum Charm proc) -> enemy phase (one attack
// per enemy per round, same SPD-ahead bonus) -> next round. Landing a crit no longer grants a
// bonus action to either side -- only SPD advantage (see spdAheadBonus) and the two named
// exceptions above can chain a second action in the same turn.
// A large SPD gap also grants a one-time ambush (enemy first-strike) at battle start.
//
/**
 * @typedef {Object} PlayerActor
 * @property {string} classId
 * @property {string} name
 * @property {string} icon
 * @property {number} maxHp
 * @property {number} maxMp
 * @property {number} atk
 * @property {number} mag
 * @property {number} def
 * @property {number} res
 * @property {number} spd
 * @property {number} luk
 * @property {Array<{stat: string, amount: number, turnsLeft: number}>} buffs
 * @property {boolean} guarding
 * @property {number} focus - 0-Formulas.FOCUS_MAX, see applyBreak/Overdrive below
 * @property {Array} skills
 */
/**
 * @typedef {Object} EnemyActor
 * @property {string} uid - per-battle id, e.g. 'e0'
 * @property {string} templateId
 * @property {string} name
 * @property {string} icon
 * @property {boolean} isBoss
 * @property {number} maxHp
 * @property {number} hp
 * @property {number} atk
 * @property {number} mag
 * @property {number} def
 * @property {number} res
 * @property {number} spd
 * @property {number} luk
 * @property {number} expReward
 * @property {Array} attacksPool
 * @property {boolean} downed - crit-triggered skip-turn/All-Out flag, cleared each round
 * @property {boolean} alive
 * @property {Array<{stat: string, amount: number, turnsLeft: number}>} debuffs
 * @property {number} breakMeter - 0-Formulas.BREAK_THRESHOLD, see applyBreak below
 * @property {boolean} broken - bonus-damage flag, cleared each round (independent of `downed`)
 */
/**
 * @typedef {Object} Battle
 * @property {Object} run - a state.js Run object (mutated in place: hp/mp/gold/inventory/etc)
 * @property {number} floor
 * @property {boolean} isBoss
 * @property {PlayerActor} player
 * @property {EnemyActor[]} enemies
 * @property {?Object} companion
 * @property {number} round
 * @property {number} playerAP
 * @property {boolean} awaitingAllOut
 * @property {boolean} over
 * @property {boolean} victory
 */
(function () {
  function D() { return window.Game.Data; }
  function F() { return window.Game.Formulas; }
  function S() { return window.Game.State; }
  function L(obj, field) { return window.Game.I18n.L(obj, field); }

  function X() { return window.Game.Systems; }

  function addAilment(list, id, turns, isBoss, events, who, targetUid) {
    var found = list.find(function (a) { return a.id === id; });
    var duration = isBoss ? Math.min(2, turns) : turns;
    if (found) found.turns = Math.max(found.turns, duration);
    else list.push({ id: id, turns: duration });
    events.push({ type: 'ailment', id: id, targetName: who, targetUid: targetUid || 'player', targetSide: targetUid && targetUid !== 'player' ? 'enemy' : 'player' });
  }

  function elementalHit(battle, enemy, element, amount, events) {
    var template = D().getEnemyTemplate(enemy.templateId);
    X().discover(enemy, element);
    var weakEl = enemy.weakEl || (template && template.weak), resistEl = enemy.resistEl || (template && template.resist);
    if (template && element === weakEl) {
      amount = Math.round(amount * 1.5);
      enemy.breakMeter += 15;
      events.push({ type: 'affinity', weak: true, element: element, targetName: enemy.name });
    } else if (template && element === resistEl) {
      amount = Math.max(1, Math.round(amount * 0.65));
      events.push({ type: 'affinity', weak: false, element: element, targetName: enemy.name });
    }
    if (element === 'wind' && enemy.ailments.some(function (a) { return a.id === 'burn'; })) {
      amount = Math.round(amount * (X().has(battle.run, 'burning_wind') ? 1.55 : 1.25));
    }
    return amount;
  }

  function breakCombo(battle, events, from) {
    if (battle.breakRewardRound === battle.round || !events.slice(from).some(function (e) { return e.type === 'enemyBroken'; })) return;
    var amount = (X().effect(battle.run, 'break_prism') ? 4 : 0) + (X().has(battle.run, 'break_flow') ? 3 : 0);
    if (amount) {
      battle.breakRewardRound = battle.round;
      var restored = Math.min(amount, battle.player.maxMp - battle.run.mp);
      battle.run.mp += restored;
      events.push({ type: 'combo', message: X().text('ทลายคืนพลัง +', 'Break flow +') + restored + ' MP' });
      if (restored) events.push({ type: 'resourceGain', resource: 'mp', amount: restored, mpAfter: battle.run.mp, maxMp: battle.player.maxMp });
    }
  }

  function tickAilments(battle, actor, player, events) {
    var list = player ? battle.run.ailments : actor.ailments;
    list.forEach(function (a) {
      if (a.id === 'poison' || a.id === 'burn') {
        var amount = Math.max(1, Math.round(actor.maxHp * (a.id === 'poison' ? 0.035 : 0.025) * (actor.isBoss ? 0.35 : 1)));
        if (player) {
          battle.run.hp = Math.max(0, battle.run.hp - amount);
          battle.run.lastDamage = { name: X().text(a.id === 'poison' ? 'พิษ' : 'เผาไหม้', a.id), amount: amount };
        } else {
          actor.hp = Math.max(0, actor.hp - amount);
          if (!actor.hp) actor.alive = false;
        }
        events.push({ type: 'ailmentDamage', id: a.id, targetName: player ? battle.player.name : actor.name, amount: amount, targetSide: player ? 'player' : 'enemy', targetUid: actor.uid, hpAfter: player ? battle.run.hp : actor.hp, maxHp: actor.maxHp });
      }
      a.turns -= 1;
    });
    for (var i = list.length - 1; i >= 0; i--) if (list[i].turns <= 0) list.splice(i, 1);
  }

  function prepareEnemies(run, floor, enemies, survival) {
    X().ensure(run);
    run.ailments = [];
    if (survival) return;
    var route = X().route(run, floor);
    if (!route) return;
    if (route.id === 'safe' && enemies.length > 1) enemies.pop();
    enemies.forEach(function (enemy, i) {
      ['maxHp', 'hp', 'atk', 'mag', 'def', 'res'].forEach(function (key) { enemy[key] = Math.max(1, Math.round(enemy[key] * route.stats)); });
      enemy.expReward = Math.round(enemy.expReward * route.rewards);
      if (route.id === 'elite' && i === 0) {
        enemy.elite = true;
        enemy.attacksPool = enemy.attacksPool.map(function (a) { return Object.assign({}, a, { drainSelf: true }); });
      }
    });
  }

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

  /**
   * Applies the break bonus-damage multiplier (if the target is already broken
   * from a previous hit this fight) and advances its break meter from *this*
   * hit, flagging it broken once full -- this hit's own damage is never
   * boosted by a break it just caused, only a hit landing on an
   * already-broken target is. Called from every place damage lands on an
   * enemy (player attack/skill, Overdrive, All-Out Attack, companion
   * attacker) so break behaves identically no matter the source.
   * `enemy.broken` is cleared each round in startNextRound.
   * @param {EnemyActor} enemy
   * @param {number} rawAmount - damage before the break multiplier
   * @param {Array} events - pushed to in place if this hit crosses the break threshold
   * @returns {number} the actual damage to apply, after any break multiplier
   */
  function applyBreak(enemy, rawAmount, events) {
    var amount = enemy.broken ? Math.round(rawAmount * F().BREAK_DAMAGE_MULT) : rawAmount;
    if (enemy.alive) {
      enemy.breakMeter += F().BREAK_PER_HIT;
      if (enemy.breakMeter >= F().BREAK_THRESHOLD) {
        enemy.breakMeter = 0;
        if (!enemy.broken) {
          enemy.broken = true;
          events.push({ type: 'enemyBroken', targetUid: enemy.uid, targetName: enemy.name });
        }
      }
    }
    return amount;
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
      downed: false, alive: true, debuffs: [], ailments: [],
      breakMeter: 0, broken: false
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
      downed: false, alive: true, debuffs: [], ailments: [],
      breakMeter: 0, broken: false
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
      downed: false, alive: true, debuffs: [], ailments: [],
      breakMeter: 0, broken: false
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
    var cls = D().getClass(run.classId) || D().classes[0];
    var total = S().getTotalStats(run);
    return {
      classId: run.classId, name: L(cls, 'name'), icon: cls.icon,
      maxHp: total.hp, maxMp: total.mp,
      atk: total.atk, mag: total.mag, def: total.def, res: total.res, spd: total.spd, luk: total.luk,
      buffs: [], guarding: false, focus: 0,
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
    lastPhaseShift = null; // set below only when this phase carries a shift
    var message = L(next, 'announce');
    // A phase may also reshape the fight itself: flip or replace the elemental
    // affinity and pick a "focus" (what the phase's signature attack targets).
    if (next.shift) {
      var template = D().getEnemyTemplate(enemy.templateId) || {};
      var sh = next.shift;
      enemy.weakEl = sh.flip ? template.resist : (sh.weak || enemy.weakEl);
      enemy.resistEl = sh.flip ? template.weak : (sh.resist || enemy.resistEl);
      enemy.shiftFocus = sh.focus || null;
      lastPhaseShift = { focus: enemy.shiftFocus, weak: enemy.weakEl, resist: enemy.resistEl, phase: enemy.phase };
      message += ' ' + X().text('[จุดอ่อนใหม่: ', '[New weakness: ') + (window.Game.ElementName ? window.Game.ElementName(enemy.weakEl) : enemy.weakEl) + ' · ' + shiftFocusLabel(enemy.shiftFocus) + ']';
    }
    return message;
  }

  var lastPhaseShift = null;
  function bossEvent(message) { return { type: 'bossPhaseChange', message: message, shift: lastPhaseShift }; }
  function shiftFocusLabel(focus) {
    return { companion: X().text('ล่าสหาย', 'hunts your companion'), mana: X().text('ดูดมานา', 'drains mana'), buffs: X().text('ลบบัฟ', 'strips buffs') }[focus] || '';
  }


  // Phase-shift "signature" attacks (attack.shiftHit) carry the boss's current
  // focus: the boss changes *what it goes after*, not just how hard it hits.
  function applyShiftFocus(battle, enemy, events) {
    var focus = enemy.shiftFocus;
    if (focus === 'companion' && battle.companion) {
      battle.companionSnaredRound = battle.round + 1;
      events.push({ type: 'shiftFocus', focus: focus, targetName: battle.companion.name, message: X().text(battle.companion.name + ' ถูกตรึงไว้ในรอบหน้า!', battle.companion.name + ' is pinned down next round!') });
    } else if (focus === 'mana') {
      var drain = Math.min(battle.run.mp, Math.max(1, Math.round(battle.player.maxMp * 0.08)));
      if (drain > 0) {
        battle.run.mp -= drain;
        events.push({ type: 'shiftFocus', focus: focus, amount: drain, mpAfter: battle.run.mp, message: X().text('มานาถูกดูด −' + drain + ' MP', 'Mana drained −' + drain + ' MP') });
      }
    } else if (focus === 'buffs') {
      var idx = -1;
      battle.player.buffs.forEach(function (b, i) { if (idx === -1 && b.amount > 0) idx = i; });
      if (idx !== -1) {
        battle.player.buffs.splice(idx, 1);
        events.push({ type: 'shiftFocus', focus: focus, message: X().text('บัฟถูกลบออก 1 อย่าง!', 'One of your buffs was stripped!') });
      }
    }
  }

  function checkEchoEnd(battle, events) { checkBattleEnd(battle, events); return battle.over; }

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

  /**
   * @param {Object} run - a state.js Run
   * @param {number} floor
   * @param {boolean} isBossFloor
   * @returns {Battle}
   */
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
    prepareEnemies(run, floor, enemies, false);
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
    prepareEnemies(run, run.currentFloor, enemies, true);
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
    if (skill.id === 'attack' && X().has(battle.run, 'flurry')) hitsCount = 2;
    var res = [];
    for (var i = 0; i < hitsCount; i++) {
      var el = skill.randomElement ? skill.randomElement[Math.floor(Math.random() * skill.randomElement.length)] : skill.element;
      res.push({ targetIndex: targetIndex, element: el, power: skill.power * (skill.id === 'attack' && i > 0 ? 0.4 : 1) });
    }
    return res;
  }

  /**
   * Resolves one player action (attack/skill/guard/item/overdrive), mutating
   * `battle` in place. `action.kind` selects the branch; `action.targetIndex`
   * and `action.skillId`/`action.itemId` are read as needed per kind.
   * @param {Battle} battle
   * @param {{kind: string, targetIndex?: number, skillId?: string, itemId?: string}} action
   * @returns {{events: Array, battleOver: boolean, victory?: boolean, awaitingAllOut?: boolean, playerAP: number}}
   */
  function playerAction(battle, action) {
    var events = [];
    if (battle.over) return { events: events, battleOver: true, victory: battle.victory, playerAP: battle.playerAP };
    var run = battle.run;
    if (battle.playerAP <= 0 || battle.awaitingAllOut) return { events: [{ type: 'invalid' }], battleOver: false, playerAP: battle.playerAP };

    if (action.kind === 'guard') {
      battle.player.guarding = true;
      battle.riposteUsed = false;
      if (X().has(run, 'clean_guard') && run.ailments.length) { run.ailments = []; events.push({ type: 'cleanse', side: 'player' }); }
      var guardFocus = (X().has(run, 'focus_guard') ? 20 : 0) + (X().effect(run, 'guard_lantern') ? 15 : 0);
      battle.player.focus = Math.min(F().FOCUS_MAX, battle.player.focus + guardFocus);
      battle.playerAP = 0;
      events.push({ type: 'guard' });
      var guardRune = window.Game.Workshop.battleEffects(battle).guardMp || 0;
      if (guardRune && battle.runeGuardRound !== battle.round) { battle.runeGuardRound=battle.round; var gain=Math.min(guardRune,battle.player.maxMp-run.mp); run.mp+=gain; if(gain) events.push({type:'resourceGain',resource:'mp',amount:gain,mpAfter:run.mp,maxMp:battle.player.maxMp}); }
    } else if (action.kind === 'duo') {
      var duo = window.Game.Bond.duoFor(battle);
      if (!duo || !duo.ready) { events.push({ type: 'invalid' }); return { events: events, battleOver: false, playerAP: battle.playerAP }; }
      var duoTarget = battle.enemies[action.targetIndex];
      if (duo.needsTarget && (!duoTarget || !duoTarget.alive)) { events.push({ type: 'invalid' }); return { events: events, battleOver: false, playerAP: battle.playerAP }; }
      battle.duoUsed = true;
      battle.playerAP -= 1;
      events.push({ type: 'duoStart', companionId: battle.companion.id, companionName: battle.companion.name, name: duo.name, role: duo.role });
      window.Game.Bond.perform(battle, duo, duoTarget, events, { applyBreak: applyBreak, breakCombo: breakCombo, resolveHit: resolveHit, applyStatMod: applyStatMod, playerOffenseEff: playerOffenseEff, effectiveStats: effectiveStats, checkBossPhase: checkBossPhase, bossEvent: bossEvent });
    } else if (action.kind === 'overdrive') {
      // Spends a full Focus gauge on a single almighty-element hit -- no MP cost
      // (paid entirely in Focus), never grants a bonus AP itself (unlike Vanguard's
      // grantsBonusAp skills or a Momentum Charm proc) so it stays a clean
      // "spend your turn" finisher.
      var odTarget = battle.enemies[action.targetIndex];
      if (battle.player.focus < F().FOCUS_MAX || !odTarget || !odTarget.alive) {
        events.push({ type: 'invalid' });
        return { events: events, battleOver: false, playerAP: battle.playerAP };
      }
      battle.player.focus = 0;
      events.push({ type: 'overdriveUsed' });
      var odEff = playerOffenseEff(battle);
      var odTargetEff = effectiveStats(odTarget, odTarget.debuffs);
      var odHit = resolveHit(odEff, odTargetEff, 'almighty', F().OVERDRIVE_POWER);
      var odBreakStart = events.length;
      odTarget.breakMeter += window.Game.Workshop.battleEffects(battle).break || 0;
      var odDmg = applyBreak(odTarget, Math.round(odHit.amount * window.Game.Workshop.damageMult(battle,odTarget,'almighty',odHit.isCrit)), events);
      breakCombo(battle, events, odBreakStart);
      odTarget.hp = Math.max(0, odTarget.hp - odDmg);
      if (odHit.isCrit) { odTarget.downed = true; events.push({ type: 'downed', targetUid: odTarget.uid, targetName: odTarget.name }); }
      events.push({ type: 'hit', skillId: 'overdrive', sourceSide: 'player', sourceClassId: run.classId, targetSide: 'enemy', targetUid: odTarget.uid, targetName: odTarget.name, element: 'almighty', isCrit: odHit.isCrit, amount: odDmg, hpAfter: odTarget.hp, maxHp: odTarget.maxHp, breakMeter: odTarget.breakMeter, broken: odTarget.broken });
      if (odTarget.hp <= 0) {
        odTarget.alive = false;
        events.push({ type: 'defeated', targetUid: odTarget.uid, targetName: odTarget.name, side: 'enemy' });
      } else if (odTarget.isBoss) {
        var odPhaseMsg = checkBossPhase(odTarget);
        if (odPhaseMsg) events.push(bossEvent(odPhaseMsg));
      }
      battle.playerAP -= 1;
      if (!checkEchoEnd(battle, events) && (X().has(run, 'overdrive_echo') || X().effect(run, 'echo_bell'))) {
        var echo = runCompanionPhase(battle, true);
        Array.prototype.push.apply(events, echo.events);
      }
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
      if (!skill || (skill.element !== 'phys' && (run.ailments || []).some(function (a) { return a.id === 'silence'; })) || run.mp < skill.cost || (hpCostAmt > 0 && run.hp <= hpCostAmt) || (skill.kind === 'heal' && run.hp >= battle.player.maxHp)) { events.push({ type: 'invalid' }); return { events: events, battleOver: false, playerAP: battle.playerAP }; }
      // validate the target *before* spending MP/HP, so an invalid/stale target can't waste resources
      if (skill.target === 'singleEnemy') {
        var checkTgt = battle.enemies[action.targetIndex];
        if (!checkTgt || !checkTgt.alive) { events.push({ type: 'invalid' }); return { events: events, battleOver: false, playerAP: battle.playerAP }; }
      }
      run.mp -= skill.cost;
      events.push({ type: 'skillUsed', skillId: skill.id, sourceClassId: run.classId, kind: skill.kind, target: skill.target, name: L(skill, 'name'), element: skill.element });
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
        var healAmt = Math.min(battle.player.maxHp - run.hp, Math.round(battle.player.maxHp * skill.power * healMult));
        run.hp = Math.min(battle.player.maxHp, run.hp + healAmt);
        events.push({ type: 'heal', skillId: skill.id, side: 'player', amount: healAmt, hpAfter: run.hp, maxHp: battle.player.maxHp });
        battle.playerAP -= 1;
      } else if (skill.kind === 'buffSelf') {
        applyStatMod(battle.player.buffs, skill.stat, skill.amount, 3);
        events.push({ type: 'buff', skillId: skill.id, side: 'player', stat: skill.stat, amount: skill.amount });
        if (skill.healPower) {
          var hAmt = Math.min(battle.player.maxHp - run.hp, Math.round(battle.player.maxHp * skill.healPower * healMult));
          run.hp = Math.min(battle.player.maxHp, run.hp + hAmt);
          if (hAmt > 0) events.push({ type: 'heal', skillId: skill.id, side: 'player', amount: hAmt, hpAfter: run.hp, maxHp: battle.player.maxHp });
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
            events.push({ type: 'buff', skillId: skill.id, targetUid: e.uid, side: 'enemy', targetName: e.name, stat: skill.stat, amount: -skill.amount });
          });
        } else {
          var tgt = battle.enemies[action.targetIndex];
          applyStatMod(tgt.debuffs, skill.stat, -skill.amount, 3);
          events.push({ type: 'buff', skillId: skill.id, targetUid: tgt.uid, side: 'enemy', targetName: tgt.name, stat: skill.stat, amount: -skill.amount });
        }
        battle.playerAP -= 1;
      } else if (skill.kind === 'attack') {
        var hits = buildPlayerHits(skill, battle, action.targetIndex);
        var playerEff = playerOffenseEff(battle);
        hits.forEach(function (h, hitIndex) {
          var enemy = battle.enemies[h.targetIndex];
          if (!enemy || !enemy.alive) return;
          var enemyEff = effectiveStats(enemy, enemy.debuffs);
          enemyEff.def *= 1 - Math.max(skill.armorPierce || 0, X().has(run, 'pierce') ? 0.35 : 0);
          if (X().has(run, 'pierce')) enemyEff.res *= 0.8;
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
          // Focus (see formulas.js): every landed attack hit builds the player's
          // Overdrive gauge, crits building it faster -- gained on the raw hit,
          // not the break-boosted amount, so it can't be inflated by breaking.
          var focusBefore = battle.player.focus;
          battle.player.focus = Math.min(F().FOCUS_MAX, battle.player.focus + F().FOCUS_PER_HIT + (hit.isCrit ? F().FOCUS_CRIT_BONUS : 0) + (window.Game.Workshop.battleEffects(battle).focus || 0));
          if (focusBefore < F().FOCUS_MAX && battle.player.focus >= F().FOCUS_MAX) events.push({ type: 'focusReady' });
          var breakStart = events.length;
          var elementalAmount = Math.round(elementalHit(battle, enemy, h.element, hit.amount, events) * window.Game.Workshop.damageMult(battle,enemy,h.element,hit.isCrit));
          enemy.breakMeter += window.Game.Workshop.battleEffects(battle).break || 0;
          var dmgAmt = applyBreak(enemy, elementalAmount, events);
          breakCombo(battle, events, breakStart);
          if (h.element === 'fire' && (X().has(run, 'burning_wind') || Math.random() < 0.3)) addAilment(enemy.ailments, 'burn', 3, enemy.isBoss, events, enemy.name, enemy.uid);
          if (skill.id === 'attack' && X().has(run, 'affliction')) addAilment(enemy.ailments, 'poison', 3, enemy.isBoss, events, enemy.name, enemy.uid);
          if (h.element === 'dark' && Math.random() < 0.2) addAilment(enemy.ailments, 'silence', 2, enemy.isBoss, events, enemy.name, enemy.uid);
          enemy.hp = Math.max(0, enemy.hp - dmgAmt);
          if (hit.isCrit) { enemy.downed = true; events.push({ type: 'downed', targetUid: enemy.uid, targetName: enemy.name }); }
          events.push({ type: 'hit', skillId: skill.id, sourceSide: 'player', sourceClassId: run.classId, hitIndex: hitIndex, target: skill.target, targetSide: 'enemy', targetUid: enemy.uid, targetName: enemy.name, element: h.element, isCrit: hit.isCrit, amount: dmgAmt, hpAfter: enemy.hp, maxHp: enemy.maxHp, breakMeter: enemy.breakMeter, broken: enemy.broken });
          var runeLeech=window.Game.Workshop.battleEffects(battle).leech || 0;
          if (runeLeech && dmgAmt>0) { var leeched=Math.min(battle.player.maxHp-run.hp,Math.round(dmgAmt*runeLeech)); run.hp+=leeched; if(leeched) events.push({type:'heal',vfxHeal:'drain',side:'player',amount:leeched,hpAfter:run.hp,maxHp:battle.player.maxHp}); }
          if (skill.drainSelf && dmgAmt > 0) {
            var healBack = Math.min(battle.player.maxHp - run.hp, Math.round(dmgAmt * 0.4));
            run.hp = Math.min(battle.player.maxHp, run.hp + healBack);
            if (healBack > 0) events.push({ type: 'heal', vfxHeal: 'drain', side: 'player', amount: healBack, hpAfter: run.hp, maxHp: battle.player.maxHp });
          }
          // Vampiric Fang relic: every attack hit leeches HP back, independently of
          // (and stacking with) a skill's own drainSelf above.
          var vampiricFang = D().getRelic('vampiric_fang');
          if (vampiricFang && dmgAmt > 0 && S().hasRelic(run, 'vampiric_fang')) {
            var lifesteal = Math.min(battle.player.maxHp - run.hp, Math.round(dmgAmt * vampiricFang.lifestealPct));
            if (lifesteal > 0) {
              run.hp = Math.min(battle.player.maxHp, run.hp + lifesteal);
              events.push({ type: 'heal', vfxHeal: 'drain', side: 'player', amount: lifesteal, hpAfter: run.hp, maxHp: battle.player.maxHp });
            }
          }
          // Shadowhunter-only: the strike itself cripples the target. Reuses applyStatMod's
          // refresh-not-stack behavior, so repeated hits from a multi-hit skill can't compound it.
          if (skill.onHitDebuff && enemy.alive) {
            applyStatMod(enemy.debuffs, skill.onHitDebuff.stat, -skill.onHitDebuff.amount, 3);
            events.push({ type: 'buff', skillId: skill.id, targetUid: enemy.uid, side: 'enemy', targetName: enemy.name, stat: skill.onHitDebuff.stat, amount: -skill.onHitDebuff.amount });
          }
          if (enemy.hp <= 0) {
            enemy.alive = false;
            events.push({ type: 'defeated', targetUid: enemy.uid, targetName: enemy.name, side: 'enemy' });
          } else if (enemy.isBoss) {
            var phaseMsg = checkBossPhase(enemy);
            if (phaseMsg) events.push(bossEvent(phaseMsg));
          }
        });
        battle.playerAP -= 1;
        // Momentum Charm relic: a flat per-attack chance to grant a bonus action
        // point, independent of whether the hit crit -- crits no longer grant one
        // on their own, so this is the only random source of an extra player turn.
        var momentum = D().getRelic('momentum_charm');
        if (momentum && S().hasRelic(run, 'momentum_charm') && Math.random() < momentum.bonusApChance) {
          battle.playerAP = Math.min(battle.playerAP + 1, 4);
        }
        // Vanguard-only: an attack-kind grantsBonusAp skill refunds its own AP same as
        // the buffSelf case above.
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

  /**
   * Resolves the player's decision on the awaitingAllOut prompt (see
   * playerAction's downed-check at the end of this file).
   * @param {Battle} battle
   * @param {boolean} use - true to unleash the All-Out Attack, false to decline
   * @returns {{events: Array, battleOver: boolean, victory?: boolean, playerAP: number}}
   */
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
      var allBreakStart = events.length;
      e.breakMeter += window.Game.Workshop.battleEffects(battle).break || 0;
      var perDmg = applyBreak(e, Math.round(per * window.Game.Workshop.damageMult(battle,e,'almighty',false)), events);
      breakCombo(battle, events, allBreakStart);
      e.hp = Math.max(0, e.hp - perDmg);
      e.downed = false;
      var defeated = e.hp <= 0;
      if (defeated) e.alive = false;
      events.push({ type: 'allOutHit', skillId: 'allout', target: 'allEnemies', targetUid: e.uid, targetName: e.name, amount: perDmg, hpAfter: e.hp, maxHp: e.maxHp, defeated: defeated, breakMeter: e.breakMeter, broken: e.broken });
      if (!defeated && e.isBoss) {
        var msg = checkBossPhase(e);
        if (msg) events.push(bossEvent(msg));
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
    battle.enemies.forEach(function (e) { if (e.alive) { e.downed = false; e.broken = false; } tickBuffs(e.debuffs); });
    tickBuffs(battle.player.buffs);
    var alive = battle.enemies.filter(function (e) { return e.alive; });
    var avgEnemySpd = alive.length ? alive.reduce(function (s, e) { return s + effectiveStats(e, e.debuffs).spd; }, 0) / alive.length : 0;
    var playerSpd = effectiveStats(battle.player, battle.player.buffs).spd;
    battle.playerAP = spdAheadBonus(playerSpd, avgEnemySpd) ? 2 : 1;
    battle.awaitingAllOut = false;
  }

  /**
   * Runs every living, non-downed enemy's turn in order, then (if the battle
   * isn't over) advances to the next round via startNextRound.
   * @param {Battle} battle
   * @returns {{events: Array, battleOver: boolean, victory?: boolean, playerAP: number, round: number}}
   */
  function runEnemyPhase(battle) {
    var events = [];
    if (battle.over) return { events: events, battleOver: true, victory: battle.victory, playerAP: battle.playerAP, round: battle.round };
    for (var i = 0; i < battle.enemies.length; i++) {
      var enemy = battle.enemies[i];
      if (!enemy.alive) continue;
      var wasSilenced = enemy.ailments.some(function (a) { return a.id === 'silence'; });
      tickAilments(battle, enemy, false, events);
      if (enemy.alive) { var ailmentPhase = checkBossPhase(enemy); if (ailmentPhase) events.push(bossEvent(ailmentPhase)); }
      checkBattleEnd(battle, events);
      if (battle.over) break;
      if (!enemy.alive) continue;
      if (enemy.downed) { events.push({ type: 'enemyPhaseSkip', targetName: enemy.name }); continue; }
      var enemySpd0 = effectiveStats(enemy, enemy.debuffs).spd;
      var playerSpd0 = effectiveStats(battle.player, battle.player.buffs).spd;
      // round 1 already grants a full ambush phase off this same speed gap (see createBattle) --
      // skip the bonus-action check there so a fast enemy doesn't double-dip the same lead.
      // A crit no longer grants a bonus attack, so `ap` only ever counts down from its
      // starting value -- at most 2 (the SPD-ahead bonus), never refilled mid-turn.
      var ap = (battle.round > 1 && spdAheadBonus(enemySpd0, playerSpd0)) ? 2 : 1;
      while (ap > 0) {
        if (battle.run.hp <= 0) break;
        var silenced = wasSilenced;
        var attackPool = silenced ? enemy.attacksPool.filter(function (a) { return a.element === 'phys'; }) : enemy.attacksPool;
        var atk = attackPool.length ? pickWeighted(attackPool) : { element: 'phys', power: 0.7, name: 'โจมตีติดขัด', nameEn: 'Disrupted strike' };
        events.push({ type: 'enemyAction', attackerUid: enemy.uid, attackerTemplateId: enemy.templateId, vfxKey: atk.vfxKey || 'disrupted', skillName: L(atk, 'name'), element: atk.element });
        var attackerEff = effectiveStats(enemy, enemy.debuffs);
        var playerEff = effectiveStats(battle.player, battle.player.buffs);
        var hit = resolveHit(attackerEff, playerEff, atk.element, atk.power);
        ap -= 1;
        var dmg = hit.amount;
        // Stone Ward relic (see data-relics.js): flat reduction to all incoming
        // enemy damage, applied before Guard's own halving so the two multiply.
        dmg = Math.round(dmg * S().relicDamageMult(battle.run) * (battle.workshop && battle.workshop.ward ? .92 : 1));
        if (battle.player.guarding) dmg = Math.round(dmg * 0.5);
        battle.run.hp = Math.max(0, battle.run.hp - dmg);
        battle.run.lastDamage = { name: enemy.name + ' · ' + L(atk, 'name'), amount: dmg };
        if (!silenced && atk.element === 'fire' && Math.random() < 0.25) addAilment(battle.run.ailments, 'burn', 3, false, events, battle.player.name);
        if (!silenced && atk.element === 'dark' && Math.random() < 0.18) addAilment(battle.run.ailments, 'silence', 2, false, events, battle.player.name);
        if (atk.element === 'phys' && /venom|spider|hydra|spore/.test(enemy.templateId) && Math.random() < 0.3) addAilment(battle.run.ailments, 'poison', 3, false, events, battle.player.name);
        if (atk.drainSelf && dmg > 0) enemy.hp = Math.min(enemy.maxHp, enemy.hp + Math.round(dmg * 0.4));
        if (atk.shiftHit && enemy.shiftFocus && dmg > 0) applyShiftFocus(battle, enemy, events);
        events.push({ type: 'hit', vfxKey: atk.vfxKey || 'disrupted', attackerTemplateId: enemy.templateId, sourceSide: 'enemy', targetSide: 'player', attackerUid: enemy.uid, attackerName: enemy.name, skillName: L(atk, 'name'), element: atk.element, isCrit: hit.isCrit, amount: dmg, hpAfter: battle.run.hp, maxHp: battle.player.maxHp, attackerHpAfter: enemy.hp, attackerMaxHp: enemy.maxHp });
        if (atk.debuff) {
          applyStatMod(battle.player.buffs, atk.debuff.stat, -atk.debuff.amount, 3);
          events.push({ type: 'buff', vfxKey: atk.vfxKey || 'disrupted', attackerUid: enemy.uid, targetUid: 'player', side: 'player', stat: atk.debuff.stat, amount: -atk.debuff.amount });
        }
        checkBattleEnd(battle, events);
        if (!battle.over && battle.player.guarding && !battle.riposteUsed && X().has(battle.run, 'riposte')) {
          battle.riposteUsed = true;
          var counter = F().computeDamage({ element: 'almighty', power: 0.75, atkStat: playerEff.atk, magStat: playerEff.mag, defStat: 0, resStat: 0, isCrit: false });
          var counterStart = events.length;
          counter = applyBreak(enemy, counter, events);
          enemy.hp = Math.max(0, enemy.hp - counter);
          if (!enemy.hp) enemy.alive = false;
          breakCombo(battle, events, counterStart);
          events.push({ type: 'riposte', targetUid: enemy.uid, targetName: enemy.name, amount: counter, hpAfter: enemy.hp, maxHp: enemy.maxHp, breakMeter: enemy.breakMeter, broken: enemy.broken, message: X().text('สวนกลับ ', 'Riposte ') + enemy.name + ' −' + counter });
          if (!enemy.alive) events.push({ type: 'defeated', targetUid: enemy.uid, targetName: enemy.name, side: 'enemy' });
          var counterPhase = enemy.alive ? checkBossPhase(enemy) : null;
          if (counterPhase) events.push(bossEvent(counterPhase));
          checkBattleEnd(battle, events);
        }
        if (battle.over || !enemy.alive) break;
      }
      if (battle.over) break;
    }
    if (!battle.over) { tickAilments(battle, battle.player, true, events); checkBattleEnd(battle, events); }
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
  /**
   * The companion's once-per-round auto-turn (attacker/healer/guardian/buffer
   * role, see data-companions.js). No-ops if the run has no companion.
   * @param {Battle} battle
   * @returns {{events: Array, battleOver: boolean, victory?: boolean, playerAP: number}}
   */
  function runStorySupport(battle, events) {
    var rounds = window.Game.Story.supportRounds(battle.run);
    if (!rounds || battle.round > rounds || battle.storySupportRound === battle.round || !battle.enemies.some(function (e) { return e.alive && e.isBoss; })) return;
    battle.storySupportRound = battle.round;
    var target = battle.enemies.find(function (e) { return e.alive && e.isBoss; });
    var eff = playerOffenseEff(battle), start = events.length;
    var damage = F().computeDamage({ element: 'almighty', power: 0.65, atkStat: eff.atk, magStat: eff.mag, defStat: 0, resStat: 0, isCrit: false });
    damage = applyBreak(target, damage, events);
    target.hp = Math.max(0, target.hp - damage);
    if (!target.hp) target.alive = false;
    breakCombo(battle, events, start);
    events.push({ type: 'storySupport', targetUid: target.uid, targetName: target.name, amount: damage, hpAfter: target.hp, maxHp: target.maxHp, breakMeter: target.breakMeter, broken: target.broken });
    if (!target.alive) events.push({ type: 'defeated', targetUid: target.uid, targetName: target.name, side: 'enemy' });
    if (target.alive) { var phase = checkBossPhase(target); if (phase) events.push(bossEvent(phase)); }
    checkBattleEnd(battle, events);
  }

  function runCompanionPhase(battle, echo) {
    var events = [];
    if (!battle.over && !echo) runStorySupport(battle, events);
    if (battle.over || !battle.companion) {
      return { events: events, battleOver: battle.over, victory: battle.victory, playerAP: battle.playerAP };
    }
    if (!echo && battle.companionRound === battle.round) return { events: events, battleOver: battle.over, victory: battle.victory, playerAP: battle.playerAP };
    if (!echo) battle.companionRound = battle.round;
    var comp = battle.companion;
    if (!echo && battle.companionSnaredRound === battle.round) {
      events.push({ type: 'companionSnared', companionId: comp.id, companionName: comp.name });
      return { events: events, battleOver: battle.over, victory: battle.victory, playerAP: battle.playerAP };
    }
    if (comp.id === 'dawn_owl' && battle.run.ailments.length) {
      battle.run.ailments.shift();
      events.push({ type: 'cleanse', companionId: comp.id, side: 'player' });
      events.push({ type: 'combo', message: X().text('นกฮูกชำระสถานะผิดปกติ', 'Dawn Owl cleanses an ailment') });
    }
    if (comp.id === 'frost_hare') { var mpGain = Math.min(2, battle.player.maxMp - battle.run.mp); battle.run.mp += mpGain; if (mpGain) events.push({ type: 'resourceGain', companionId: comp.id, resource: 'mp', amount: mpGain, mpAfter: battle.run.mp, maxMp: battle.player.maxMp }); }
    if (comp.id === 'iron_golem_cub') { var focusGain = Math.min(5, F().FOCUS_MAX - battle.player.focus); battle.player.focus += focusGain; if (focusGain) events.push({ type: 'resourceGain', companionId: comp.id, resource: 'focus', amount: focusGain }); }
    if (comp.id === 'stoneheart_bear') battle.player.buffs.forEach(function (b) { if (b.amount < 0) b.turnsLeft = Math.max(1, b.turnsLeft - 1); });
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
          defStat: targetEff.def * (comp.id === 'sand_scarab' ? 0.5 : 1), resStat: targetEff.res, isCrit: isCrit
        });
        var compStart = events.length;
        if (comp.id === 'ember_fox') target.breakMeter += 15;
        var compDmg = applyBreak(target, amount, events);
        breakCombo(battle, events, compStart);
        target.hp = Math.max(0, target.hp - compDmg);
        if (isCrit) { target.downed = true; events.push({ type: 'downed', targetUid: target.uid, targetName: target.name }); }
        events.push({ type: 'companionHit', companionId: comp.id, companionName: comp.name, targetUid: target.uid, targetName: target.name, isCrit: isCrit, amount: compDmg, hpAfter: target.hp, maxHp: target.maxHp, breakMeter: target.breakMeter, broken: target.broken });
        if (target.hp <= 0) {
          target.alive = false;
          events.push({ type: 'defeated', targetUid: target.uid, targetName: target.name, side: 'enemy' });
        } else if (target.isBoss) {
          var phaseMsg = checkBossPhase(target);
          if (phaseMsg) events.push(bossEvent(phaseMsg));
        }
      }
    } else if (def.role === 'healer') {
      var maxHp = battle.player.maxHp;
      var missing = maxHp - battle.run.hp;
      if (missing > 0) {
        var healAmt = Math.min(missing, Math.round(maxHp * def.healPct));
        battle.run.hp += healAmt;
        events.push({ type: 'companionHeal', companionId: comp.id, companionName: comp.name, amount: healAmt, hpAfter: battle.run.hp, maxHp: maxHp });
      }
    } else if (def.role === 'guardian' || def.role === 'buffer') {
      // Refreshed every round via applyStatMod, exactly like a skill buff would be --
      // unlike run-long blessings (see state.js's blessingStatMult), a companion's
      // per-round support IS the correct use of the per-battle buff array.
      def.buffStats.forEach(function (stat) { applyStatMod(battle.player.buffs, stat, def.buffAmount, 2); });
      events.push({ type: 'companionBuff', companionId: comp.id, companionName: comp.name, stats: def.buffStats, amount: def.buffAmount });
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
      var tier = Math.min(template.tier || F().tierForFloor(battle.floor), 9);
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
