// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Battle engine: initiative/action-point economy, damage resolution, enemy AI, All-Out Attack.
// Round structure: player phase (one action-point turn per round, chainable only by a SPD-ahead
// bonus AP, Vanguard's grantsBonusAp skills, or a Momentum Charm proc) -> enemy phase (one attack
// per enemy per round, same SPD-ahead bonus) -> next round. Landing a crit no longer grants a
// bonus action to either side -- only SPD advantage (see bankTempo: a partial lead banks toward
// a bonus action over several rounds) and the two named exceptions above can chain a second
// action in the same turn.
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
 * @property {boolean} downed - skip-turn/group-finisher flag (see knockDown), cleared each round
 * @property {boolean} steady - was downed last round, so it cannot be downed again this round
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
  function CM() { return window.Game.ClassMech; }

  // ---- Perks: the talents (systems.js) and relics (data-relics.js) that are
  // plain multipliers or per-round trickles, gathered here so each battle hook
  // below asks one question instead of naming every perk. ----
  function heldRelics(run, field) {
    return (run.relics || []).map(function (id) { return D().getRelic(id); }).filter(function (r) { return r && r[field] != null; });
  }
  function relicSum(run, field) {
    return heldRelics(run, field).reduce(function (sum, r) { return sum + r[field]; }, 0);
  }
  function isEliteFoe(enemy) { return !!(enemy.isBoss || enemy.champion || enemy.elite); }

  // Multiplier on one of the player's own hits. `skill` is null for Overdrive.
  function playerHitMult(battle, enemy, skill, element) {
    var run = battle.run, mult = F().PLAYER_DAMAGE_MULT;
    var elemental = element !== 'phys' && element !== 'almighty';
    if (X().has(run, 'executioner_edge') && enemy.hp <= enemy.maxHp * 0.35) mult *= 1.25;
    if (X().has(run, 'weapon_mastery') && skill && (skill.id === 'attack' || skill.scaleStat === 'atk')) mult *= 1.25;
    if (X().has(run, 'spell_surge') && elemental && !(skill && skill.scaleStat === 'atk')) mult *= 1.15;
    if (X().has(run, 'opportune') && enemy.downed) mult *= 1.3;
    if (X().has(run, 'giant_slayer') && isEliteFoe(enemy)) mult *= 1.2;
    if (!skill && X().has(run, 'overdrive_mastery')) mult *= 1.4;
    heldRelics(run, 'hitMult').forEach(function (r) {
      if (r.elements && r.elements.indexOf(element) === -1) return;
      if (r.versus === 'elite' && !isEliteFoe(enemy)) return;
      mult *= r.hitMult;
    });
    return mult;
  }

  // Start-of-round trickles (Mana Font, Lifebloom, Healing Moss, Mana Prism).
  function roundRegen(battle, events) {
    var run = battle.run, p = battle.player;
    var mp = relicSum(run, 'roundMp') + (X().has(run, 'mana_font') ? Math.max(1, Math.round(p.maxMp * 0.04)) : 0);
    var hpPct = relicSum(run, 'roundHealPct') + (X().has(run, 'lifebloom') ? 0.04 : 0);
    if (mp > 0) {
      var gainMp = Math.min(mp, p.maxMp - run.mp);
      if (gainMp > 0) { run.mp += gainMp; events.push({ type: 'resourceGain', resource: 'mp', amount: gainMp, mpAfter: run.mp, maxMp: p.maxMp }); }
    }
    if (hpPct > 0 && run.hp > 0) {
      var gainHp = Math.min(Math.max(1, Math.round(p.maxHp * hpPct)), p.maxHp - run.hp);
      if (gainHp > 0) { run.hp += gainHp; events.push({ type: 'heal', side: 'player', amount: gainHp, hpAfter: run.hp, maxHp: p.maxHp }); }
    }
  }

  function addAilment(list, id, turns, isBoss, events, who, targetUid) {
    var found = list.find(function (a) { return a.id === id; });
    var duration = isBoss ? Math.min(2, turns) : turns;
    if (found) found.turns = Math.max(found.turns, duration);
    else list.push({ id: id, turns: duration });
    events.push({ type: 'ailment', id: id, targetName: who, targetUid: targetUid || 'player', targetSide: targetUid && targetUid !== 'player' ? 'enemy' : 'player' });
  }

  // `info` (optional) gets .weak / .resist = true when the hit struck a weakness / resistance, so the
  // caller can scale that hit's Break (see Formulas.breakAmount).
  function elementalHit(battle, enemy, element, amount, events, info) {
    var template = D().getEnemyTemplate(enemy.templateId);
    if (template) X().discover(enemy, element);
    var weakEl = enemy.weakEl || (template && template.weak), resistEl = enemy.resistEl || (template && template.resist);
    if (template && element === weakEl) {
      amount = Math.round(amount * (X().has(battle.run, 'tactician') ? 1.75 : 1.5));
      if (info) info.weak = true;
      events.push({ type: 'affinity', weak: true, element: element, targetName: enemy.name });
    } else if (template && element === resistEl) {
      amount = Math.max(1, Math.round(amount * 0.65));
      if (info) info.resist = true;
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

  // Champion: the pack leader on a champion floor (see Formulas.isChampionFloor)
  // -- tougher and worth more, and it always drops a material.
  function makeChampion(enemy) {
    var m = F().CHAMPION_STAT_MULT;
    enemy.champion = true;
    enemy.maxHp = enemy.hp = Math.max(1, Math.round(enemy.maxHp * m));
    enemy.atk = Math.max(1, Math.round(enemy.atk * (1 + (m - 1) * 0.6)));
    enemy.mag = Math.max(1, Math.round(enemy.mag * (1 + (m - 1) * 0.6)));
    enemy.expReward = Math.round(enemy.expReward * F().CHAMPION_REWARD_MULT);
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
    // Druid shapeshift (see class-mech.js): a form's stat change, stored as plain data on the actor.
    if (actor.formMods) Object.keys(actor.formMods).forEach(function (k) { if (eff[k] != null) eff[k] = eff[k] * (1 + actor.formMods[k]); });
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
    eff.luk += relicSum(battle.run, 'bonusLuk');
    return eff;
  }

  // Knockdown: a downed enemy skips its next action, and when every living enemy
  // is down at once the player earns the group finisher. The only cause is filling
  // its Break (stagger) meter -- crits and weakness hits just fill it faster.
  // An enemy that was down last round is `steady` and cannot be floored again
  // straight away, so no single trick can lock a foe out of the fight.
  function knockDown(enemy, events) {
    if (!enemy.alive || enemy.downed || enemy.steady) return false;
    enemy.downed = true;
    events.push({ type: 'downed', targetUid: enemy.uid, targetName: enemy.name });
    return true;
  }

  function resolveHit(attackerEff, defenderEff, element, power, scaleStat, forceCrit) {
    var isCrit = forceCrit ? true : Math.random() < F().critChance(attackerEff.luk);
    var amount = F().computeDamage({
      element: element, power: power, scaleStat: scaleStat,
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
  function applyBreak(enemy, rawAmount, events, breakAdd) {
    var amount = enemy.broken ? Math.round(rawAmount * F().BREAK_DAMAGE_MULT) : rawAmount;
    if (enemy.alive) {
      enemy.breakMeter += breakAdd != null ? breakAdd : F().BREAK_PER_HIT;
      if (enemy.breakMeter >= F().breakMax(enemy)) {
        enemy.breakMeter = 0;
        if (!enemy.broken) {
          enemy.broken = true;
          events.push({ type: 'enemyBroken', targetUid: enemy.uid, targetName: enemy.name });
          knockDown(enemy, events);
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
    var stats = F().tuneBossStats(F().scaleStatsBlock(template.baseStats, scale, groupScale), F().REGULAR_TUNING);
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
    var scale = F().enemyStatScale(floor, difficultyId) * F().ascensionEnemyMult(ascension, floor);
    return buildEnemyActorScaled(template, scale, groupScale, uid);
  }

  function buildBossActor(template, difficultyId, uid, ascension) {
    S().recordEnemySeen(template.id);
    var scale = F().bossStatScale(difficultyId) * F().ascensionEnemyMult(ascension, 100);
    var stats = F().tuneBossStats(F().scaleStatsBlock(template.baseStats, scale, 1), F().FINAL_BOSS_TUNING);
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
    var scale = F().enemyStatScale(floor, difficultyId) * F().ascensionEnemyMult(ascension, floor);
    var stats = F().tuneBossStats(F().scaleStatsBlock(template.baseStats, scale, 1), F().MINIBOSS_TUNING);
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
    X().ensure(run);
    if (X().has(run, 'iron_will')) { total.def = Math.round(total.def * 1.15); total.res = Math.round(total.res * 1.10); }
    if (X().has(run, 'arcane_ward')) total.res = Math.round(total.res * 1.2);
    if (X().has(run, 'versatile')) { total.atk = Math.round(total.atk * 1.08); total.mag = Math.round(total.mag * 1.08); }
    return {
      classId: run.classId, name: L(cls, 'name'), icon: cls.icon,
      maxHp: total.hp, maxMp: total.mp,
      atk: total.atk, mag: total.mag, def: total.def, res: total.res, spd: total.spd, luk: total.luk,
      buffs: [], guarding: false, focus: Math.min(F().FOCUS_MAX, relicSum(run, 'startFocus')),
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
    lastPhaseSnapshot = { targetUid: enemy.uid, phase: enemy.phase };
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
  var lastPhaseSnapshot = null;
  function bossEvent(message) { return { type: 'bossPhaseChange', message: message, shift: lastPhaseShift, targetUid: lastPhaseSnapshot ? lastPhaseSnapshot.targetUid : null, phase: lastPhaseSnapshot ? lastPhaseSnapshot.phase : null }; }
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
    if (battle.run.hp <= 0 && !battle.unbreakableUsed && X().has(battle.run, 'unbreakable')) {
      // Unbreakable talent: once per battle, a lethal blow leaves 1 HP.
      battle.unbreakableUsed = true;
      battle.run.hp = 1;
      events.push({ type: 'combo', message: X().text('ไม่ยอมล้ม! ยืนหยัดที่ 1 HP', 'Unbreakable! Holding on at 1 HP') });
      events.push({ type: 'heal', side: 'player', amount: 1, hpAfter: 1, maxHp: battle.player.maxHp });
      return;
    }
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
      if (F().isChampionFloor(floor)) makeChampion(enemies[0]);
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
      // A lead short of a full first strike still starts banking toward a bonus action.
      tempo: firstStrike === 'player' ? 0 : F().tempoGain(player.spd, avgEnemySpd),
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
    var scale = F().survivalStatScale(run.currentFloor, run.difficulty, wave) * F().ascensionEnemyMult(run.ascension, run.currentFloor);
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
      // A lead short of a full first strike still starts banking toward a bonus action.
      tempo: firstStrike === 'player' ? 0 : F().tempoGain(player.spd, avgEnemySpd),
      awaitingAllOut: false, over: false, victory: false,
      pendingFirstStrike: firstStrike === 'enemy'
    };
  }

  // What a skill costs this battle: MP (a Gunslinger pays half on gun skills), HP (blood magic)
  // and the class resource (bullets). One place, so the engine and the skill menu agree.
  function skillCost(battle, skill) {
    var c = CM().cost(battle, skill);
    return { mp: c.mp, hp: skill.hpCost ? Math.round(battle.player.maxHp * skill.hpCost) : 0, ammo: c.ammo, res: c.res };
  }

  // Why a skill cannot be used right now (localised), or null when it can.
  function skillBlockReason(battle, skill) {
    var run = battle.run, cost = skillCost(battle, skill);
    if (skill.element !== 'phys' && (run.ailments || []).some(function (a) { return a.id === 'silence'; })) return X().text('ติดสถานะใบ้', 'Silenced');
    if (run.mp < cost.mp) return X().text('MP ไม่พอ', 'Not enough MP');
    if (cost.hp > 0 && run.hp <= cost.hp) return X().text('HP ไม่พอ', 'Not enough HP');
    if (skill.kind === 'heal' && run.hp >= battle.player.maxHp) return X().text('HP เต็มแล้ว', 'HP is full');
    return CM().blockReason(battle, skill);
  }

  // Engine context handed to class-mech.js hooks that deal damage.
  function mechCtx() {
    return { applyBreak: applyBreak, breakCombo: breakCombo, effectiveStats: effectiveStats, playerOffenseEff: playerOffenseEff, checkBossPhase: checkBossPhase, bossEvent: bossEvent, checkBattleEnd: checkBattleEnd, applyStatMod: applyStatMod, addAilment: addAilment, knockDown: knockDown };
  }

  // power = skill power x its rank (see Data.skillRank); basePower (no rank) sets the hit's Break,
  // so stagger stays tuned to the move itself.
  function buildPlayerHits(skill, battle, targetIndex) {
    var rankMult = D().skillPowerMult(skill, battle.run.level);
    if (skill.target === 'allEnemies') {
      var out = [];
      battle.enemies.forEach(function (e, i) {
        if (!e.alive) return;
        var el = skill.randomElement ? skill.randomElement[Math.floor(Math.random() * skill.randomElement.length)] : skill.element;
        out.push({ targetIndex: i, element: el, power: skill.power * rankMult, basePower: skill.power });
      });
      return out;
    }
    var hitsCount = skill.hits || 1;
    if (skill.id === 'attack' && X().has(battle.run, 'flurry')) hitsCount = 2;
    var res = [];
    for (var i = 0; i < hitsCount; i++) {
      var el = skill.randomElement ? skill.randomElement[Math.floor(Math.random() * skill.randomElement.length)] : skill.element;
      var p = skill.power * (skill.id === 'attack' && i > 0 ? 0.4 : 1);
      res.push({ targetIndex: targetIndex, element: el, power: p * rankMult, basePower: p });
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
      CM().onGuard(battle, events);
      if (X().has(run, 'arcane_ward')) {
        var wardMp = Math.min(6, battle.player.maxMp - run.mp);
        if (wardMp > 0) { run.mp += wardMp; events.push({ type: 'resourceGain', resource: 'mp', amount: wardMp, mpAfter: run.mp, maxMp: battle.player.maxMp }); }
      }
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
      battle.player.focus = X().has(run, 'overdrive_mastery') ? 30 : 0;
      events.push({ type: 'overdriveUsed' });
      var odEff = playerOffenseEff(battle);
      var odTargetEff = effectiveStats(odTarget, odTarget.debuffs);
      var odHit = resolveHit(odEff, odTargetEff, 'almighty', F().OVERDRIVE_POWER * playerHitMult(battle, odTarget, null, 'almighty'));
      var odBreakStart = events.length;
      odTarget.breakMeter += (window.Game.Workshop.battleEffects(battle).break || 0) + relicSum(run, 'bonusBreak');
      var odDmg = applyBreak(odTarget, Math.round(odHit.amount * window.Game.Workshop.damageMult(battle,odTarget,'almighty',odHit.isCrit)), events, F().breakAmount({ power: 2.5, crit: odHit.isCrit }));
      breakCombo(battle, events, odBreakStart);
      odTarget.hp = Math.max(0, odTarget.hp - odDmg);
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
      var hpBeforeItem = run.hp;
      var itemRes = S().useConsumable(run, action.itemId);
      if (!itemRes.ok) { events.push({ type: 'invalid' }); return { events: events, battleOver: false, playerAP: battle.playerAP }; }
      events.push({ type: 'itemUsed', itemId: action.itemId, result: itemRes, hpAfter: run.hp, mpAfter: run.mp, maxHp: battle.player.maxHp, maxMp: battle.player.maxMp });
      battle.playerAP -= 1;
      if (CM().afterItem(battle, itemDef, Math.max(0, run.hp - hpBeforeItem), events, mechCtx())) battle.playerAP = Math.min(battle.playerAP + 1, 4);
    } else if (action.kind === 'attack' || action.kind === 'skill') {
      var skillId = action.kind === 'attack' ? 'attack' : action.skillId;
      var skill = D().getSkill(skillId);
      // Blood-magic skills (Deathbringer) pay with a slice of max HP instead of/alongside
      // MP -- must always leave the caster with at least 1 HP, so this can never be a
      // free suicide (checkBattleEnd only ever fires from *damage*, not from this cost).
      if (!skill || skillBlockReason(battle, skill)) { events.push({ type: 'invalid' }); return { events: events, battleOver: false, playerAP: battle.playerAP }; }
      var cost = skillCost(battle, skill), hpCostAmt = cost.hp;
      // validate the target *before* spending MP/HP, so an invalid/stale target can't waste resources
      if (skill.target === 'singleEnemy') {
        var checkTgt = battle.enemies[action.targetIndex];
        if (!checkTgt || !checkTgt.alive) { events.push({ type: 'invalid' }); return { events: events, battleOver: false, playerAP: battle.playerAP }; }
      }
      run.mp -= cost.mp;
      CM().pay(battle, skill);
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

      if (skill.kind === 'mech') {
        // Class command (see class-mech.js): Sheathe, Reload, Raise Dead, Shapeshift...
        battle.playerAP -= 1;
        if (CM().perform(battle, skill, events, mechCtx(), action.targetIndex)) battle.playerAP = Math.min(battle.playerAP + 1, 4);
      } else if (skill.kind === 'heal') {
        var healFull = Math.round(battle.player.maxHp * skill.power * D().skillPowerMult(skill, run.level) * healMult);
        var healAmt = Math.min(battle.player.maxHp - run.hp, healFull);
        run.hp = Math.min(battle.player.maxHp, run.hp + healAmt);
        events.push({ type: 'heal', skillId: skill.id, side: 'player', amount: healAmt, hpAfter: run.hp, maxHp: battle.player.maxHp });
        CM().afterHeal(battle, skill, Math.max(0, healFull - healAmt), events);
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
        var mods = CM().beforeAttack(battle, skill, events) || {};
        var hits = buildPlayerHits(skill, battle, action.targetIndex);
        if (mods.basicHits) {
          hits = [];
          for (var bh = 0; bh < mods.basicHits.hits; bh++) hits.push({ targetIndex: action.targetIndex, element: 'phys', power: mods.basicHits.power });
        }
        // A class rule can turn this attack into one that hits every enemy (mods.aoe = power per
        // target) or add bonus hits (mods.extraHits). `hitTarget` is what break and VFX read.
        var hitTarget = skill.target;
        if (mods.aoe && skill.target === 'singleEnemy') {
          var aoeFirst = hits[0] || { element: skill.element, power: skill.power, basePower: skill.power };
          hits = [];
          battle.enemies.forEach(function (e, i) { if (e.alive) hits.push({ targetIndex: i, element: aoeFirst.element, power: aoeFirst.power * mods.aoe, basePower: aoeFirst.basePower }); });
          hitTarget = 'allEnemies';
        }
        if (mods.extraHits) mods.extraHits.forEach(function (x) { hits.push({ targetIndex: action.targetIndex, element: x.element, power: x.power, basePower: x.power, scaleStat: x.scaleStat }); });
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
          hitPower = hitPower * playerHitMult(battle, enemy, skill, h.element) * (mods.powerMult || 1);
          // Class rules that make one enemy take more from you (Ranger's mark, Warlock's hex):
          // player attack/skill hits only, never companion, Overdrive or All-Out.
          hitPower = hitPower * CM().targetMult(battle, enemy);
          var hit = resolveHit(playerEff, enemyEff, h.element, hitPower, h.scaleStat || mods.scaleStat || skill.scaleStat, mods.forceCrit);
          // Focus (see formulas.js): every landed attack hit builds the player's
          // Overdrive gauge, crits building it faster -- gained on the raw hit,
          // not the break-boosted amount, so it can't be inflated by breaking.
          var focusBefore = battle.player.focus;
          battle.player.focus = Math.min(F().FOCUS_MAX, battle.player.focus + F().FOCUS_PER_HIT + (hit.isCrit ? F().FOCUS_CRIT_BONUS : 0) + (window.Game.Workshop.battleEffects(battle).focus || 0));
          if (focusBefore < F().FOCUS_MAX && battle.player.focus >= F().FOCUS_MAX) events.push({ type: 'focusReady' });
          var breakStart = events.length;
          var affinity = {};
          var elementalAmount = Math.round(elementalHit(battle, enemy, h.element, hit.amount, events, affinity) * window.Game.Workshop.damageMult(battle,enemy,h.element,hit.isCrit));
          var hitBreak = F().breakAmount({ power: skill.breakPower != null ? skill.breakPower : (h.basePower != null ? h.basePower : h.power), crit: hit.isCrit, weak: affinity.weak, aoe: hitTarget === 'allEnemies' });
          if (mods.breakMult) hitBreak = Math.round(hitBreak * mods.breakMult);
          enemy.breakMeter += (window.Game.Workshop.battleEffects(battle).break || 0) + relicSum(run, 'bonusBreak');
          var dmgAmt = applyBreak(enemy, elementalAmount, events, hitBreak);
          breakCombo(battle, events, breakStart);
          if (h.element === 'fire' && (X().has(run, 'burning_wind') || Math.random() < 0.3)) addAilment(enemy.ailments, 'burn', 3, enemy.isBoss, events, enemy.name, enemy.uid);
          if (mods.poisonChance && Math.random() < mods.poisonChance) addAilment(enemy.ailments, 'poison', 3, enemy.isBoss, events, enemy.name, enemy.uid);
          if (skill.id === 'attack' && X().has(run, 'affliction')) addAilment(enemy.ailments, 'poison', 3, enemy.isBoss, events, enemy.name, enemy.uid);
          if (h.element === 'dark' && Math.random() < 0.2) addAilment(enemy.ailments, 'silence', 2, enemy.isBoss, events, enemy.name, enemy.uid);
          enemy.hp = Math.max(0, enemy.hp - dmgAmt);
          events.push({ type: 'hit', skillId: skill.id, sourceSide: 'player', sourceClassId: run.classId, hitIndex: hitIndex, target: hitTarget, targetSide: 'enemy', targetUid: enemy.uid, targetName: enemy.name, element: h.element, isCrit: hit.isCrit, affinity: affinity.weak ? 'weak' : affinity.resist ? 'resist' : null, amount: dmgAmt, hpAfter: enemy.hp, maxHp: enemy.maxHp, breakMeter: enemy.breakMeter, broken: enemy.broken });
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
          CM().onHit(battle, skill, enemy, { element: h.element, isCrit: hit.isCrit, amount: dmgAmt }, events, mechCtx());
        });
        battle.playerAP -= 1;
        // Relentless talent: a kill refunds an action point, once per round.
        if (X().has(run, 'relentless') && battle.relentlessRound !== battle.round && hits.some(function (h) { var e = battle.enemies[h.targetIndex]; return e && !e.alive; }) && battle.enemies.some(function (e) { return e.alive; })) {
          battle.relentlessRound = battle.round;
          battle.playerAP = Math.min(battle.playerAP + 1, 4);
          events.push({ type: 'combo', message: X().text('ไม่หยุดยั้ง +1 AP', 'Relentless +1 AP') });
        }
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
    // Class rules that react to what you just did (combo counters, resets...). Only valid
    // actions reach here: every rejected action returned early above.
    CM().afterAction(battle, action.kind, action.kind === 'attack' ? D().getSkill('attack') : action.kind === 'skill' ? D().getSkill(action.skillId) : null, events, mechCtx());
    CM().sweep(battle, events);
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
    var per = Math.max(1, Math.round((playerEff.atk * 0.9 + playerEff.mag * 0.5) * (F().ALL_OUT_BASE + 0.12 * living.length) * (0.95 + Math.random() * 0.15) * (X().has(battle.run, 'rally_master') ? 1.5 : 1)));
    events.push({ type: 'allOutStart' });
    living.forEach(function (e) {
      var allBreakStart = events.length;
      e.breakMeter += window.Game.Workshop.battleEffects(battle).break || 0;
      var perDmg = applyBreak(e, Math.round(per * window.Game.Workshop.damageMult(battle,e,'almighty',false)), events, F().breakAmount({ power: 1 }));
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
    CM().sweep(battle, events);
    return { events: events, battleOver: battle.over, victory: battle.victory, playerAP: battle.playerAP };
  }

  // A large *current* (post-buff/debuff) SPD gap grants a bonus action for the round,
  // mirroring the one-time ambush/head-start check createBattle runs on base SPD --
  // this is what makes Haste, Binding Shot, Veil of Night, etc. actually do something.
  // Banks this round's tempo for `holder` (the battle for the player, an enemy
  // actor for itself) and returns true when a full bonus action has built up.
  function bankTempo(holder, fastSpd, slowSpd) {
    holder.tempo = (holder.tempo || 0) + F().tempoGain(fastSpd, slowSpd);
    if (holder.tempo >= 0.999) { holder.tempo = Math.max(0, holder.tempo - 1); return true; }
    return false;
  }

  function startNextRound(battle, events) {
    battle.round += 1;
    if (events) roundRegen(battle, events);
    CM().roundStart(battle, events, mechCtx());
    if (X().has(battle.run, 'quickstep')) battle.tempo = (battle.tempo || 0) + 0.25;
    battle.enemies.forEach(function (e) { if (e.alive) { e.steady = !!e.downed; e.downed = false; e.broken = false; } tickBuffs(e.debuffs); });
    tickBuffs(battle.player.buffs);
    var alive = battle.enemies.filter(function (e) { return e.alive; });
    var avgEnemySpd = alive.length ? alive.reduce(function (s, e) { return s + effectiveStats(e, e.debuffs).spd; }, 0) / alive.length : 0;
    var playerSpd = effectiveStats(battle.player, battle.player.buffs).spd;
    battle.playerAP = bankTempo(battle, playerSpd, avgEnemySpd) ? 2 : 1;
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
      var ap = (battle.round > 1 && bankTempo(enemy, enemySpd0, playerSpd0)) ? 2 : 1;
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
        dmg = Math.round(dmg * S().relicDamageMult(battle.run) * (battle.workshop && battle.workshop.ward ? .92 : 1) * (1 + relicSum(battle.run, 'damageTakenPct')));
        if (battle.player.guarding) dmg = Math.round(dmg * (X().has(battle.run, 'bulwark') ? 0.3 : 0.5));
        // Guardian's Charm: the first hit of the battle lands at reduced strength.
        if (!battle.firstHitTaken) {
          battle.firstHitTaken = true;
          heldRelics(battle.run, 'firstHitPct').forEach(function (r) { dmg = Math.round(dmg * r.firstHitPct); });
        }
        dmg = Math.max(1, dmg);
        // Class mechanics (see class-mech.js): a Samurai's stance softens the blow, a
        // Necromancer's skeleton may take it instead.
        var mechHit = CM().incoming(battle, enemy, dmg, events, mechCtx());
        if (mechHit.absorbed) { if (battle.over || !enemy.alive) break; continue; }
        dmg = mechHit.dmg;
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
        // Second Wind talent: one emergency heal per battle.
        if (!battle.over && !battle.secondWindUsed && battle.run.hp > 0 && battle.run.hp < battle.player.maxHp * 0.3 && X().has(battle.run, 'second_wind')) {
          battle.secondWindUsed = true;
          var windHeal = Math.min(Math.round(battle.player.maxHp * 0.25), battle.player.maxHp - battle.run.hp);
          battle.run.hp += windHeal;
          events.push({ type: 'combo', message: X().text('ลมหายใจที่สอง', 'Second Wind') });
          events.push({ type: 'heal', side: 'player', amount: windHeal, hpAfter: battle.run.hp, maxHp: battle.player.maxHp });
        }
        // Thorn Mail relic: the attacker takes a share of the damage it dealt.
        var reflectPct = relicSum(battle.run, 'reflectPct');
        if (!battle.over && reflectPct > 0 && dmg > 0 && enemy.alive) {
          var thorns = Math.max(1, Math.round(dmg * reflectPct));
          enemy.hp = Math.max(0, enemy.hp - thorns);
          if (!enemy.hp) enemy.alive = false;
          events.push({ type: 'riposte', targetUid: enemy.uid, targetName: enemy.name, amount: thorns, hpAfter: enemy.hp, maxHp: enemy.maxHp, breakMeter: enemy.breakMeter, broken: enemy.broken, message: X().text('เกราะหนามสะท้อน ', 'Thorns hit ') + enemy.name + ' −' + thorns });
          if (!enemy.alive) events.push({ type: 'defeated', targetUid: enemy.uid, targetName: enemy.name, side: 'enemy' });
          else { var thornPhase = checkBossPhase(enemy); if (thornPhase) events.push(bossEvent(thornPhase)); }
          checkBattleEnd(battle, events);
        }
        if (!battle.over && enemy.alive && battle.player.guarding && !battle.riposteUsed && X().has(battle.run, 'riposte')) {
          battle.riposteUsed = true;
          var counter = F().computeDamage({ element: 'almighty', power: 0.75, atkStat: playerEff.atk, magStat: playerEff.mag, defStat: 0, resStat: 0, isCrit: false });
          var counterStart = events.length;
          counter = applyBreak(enemy, counter, events, F().breakAmount({ power: 0.75 }));
          enemy.hp = Math.max(0, enemy.hp - counter);
          if (!enemy.hp) enemy.alive = false;
          breakCombo(battle, events, counterStart);
          events.push({ type: 'riposte', targetUid: enemy.uid, targetName: enemy.name, amount: counter, hpAfter: enemy.hp, maxHp: enemy.maxHp, breakMeter: enemy.breakMeter, broken: enemy.broken, message: X().text('สวนกลับ ', 'Riposte ') + enemy.name + ' −' + counter });
          if (!enemy.alive) events.push({ type: 'defeated', targetUid: enemy.uid, targetName: enemy.name, side: 'enemy' });
          var counterPhase = enemy.alive ? checkBossPhase(enemy) : null;
          if (counterPhase) events.push(bossEvent(counterPhase));
          checkBattleEnd(battle, events);
        }
        CM().afterIncoming(battle, enemy, events, mechCtx(), dmg);
        if (battle.over || !enemy.alive) break;
      }
      if (battle.over) break;
    }
    if (!battle.over) { tickAilments(battle, battle.player, true, events); checkBattleEnd(battle, events); }
    CM().sweep(battle, events);
    battle.player.guarding = false;
    if (!battle.over) startNextRound(battle, events);
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
    damage = applyBreak(target, damage, events, F().breakAmount({ power: 0.65 }));
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
    // Necromancer skeletons act once per round, with or without a companion.
    if (!battle.over && !echo && battle.minionRound !== battle.round) {
      battle.minionRound = battle.round;
      CM().minionPhase(battle, events, mechCtx());
    }
    CM().sweep(battle, events);
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
          element: 'phys', power: def.power, atkStat: playerEff.atk, magStat: 0,
          defStat: targetEff.def * (comp.id === 'sand_scarab' ? 0.5 : 1), resStat: targetEff.res, isCrit: isCrit
        });
        var compStart = events.length;
        var compDmg = applyBreak(target, amount, events, F().breakAmount({ power: def.power, crit: isCrit }) + (comp.id === 'ember_fox' ? 8 : 0));
        breakCombo(battle, events, compStart);
        target.hp = Math.max(0, target.hp - compDmg);
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
    CM().sweep(battle, events);
    return { events: events, battleOver: battle.over, victory: battle.victory, playerAP: battle.playerAP };
  }

  // `rate` optionally scales rewards down (used for replaying an
  // already-cleared floor, at 40% -- see BattleUI.handleVictory).
  function getExpReward(battle, rate) {
    var total = battle.enemies.reduce(function (s, e) { return s + (e.expReward || 0); }, 0);
    return rate == null ? total : Math.round(total * rate);
  }

  function getGoldReward(battle, rate) {
    // The diminishing gold curve is per enemy, so a lone boss (one huge EXP figure) must be
    // priced like the 5-strong pack it replaces, or boss floors would pay less than ordinary ones.
    var total = battle.enemies.reduce(function (s, e) {
      var exp = e.expReward || 0;
      return s + (e.isBoss ? 5 * F().goldForExp(exp / 5) : F().goldForExp(exp));
    }, 0);
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
      var rawTier = template.tier || F().tierForFloor(battle.floor);
      var tier = Math.min(rawTier, 9);
      // Tier 10+ enemies would only ever drop tier-9 materials (one recipe), leaving the
      // scarce tier 5-8 recipes starved: deep-floor enemies feed those pools as well.
      if (rawTier >= 10) tier = 5 + Math.floor(Math.random() * 5);
      var mats = D().items.filter(function (it) { return it.kind === 'material' && it.tier === tier; });
      if (!mats.length) return;
      var dropChance = Math.min(1, ((e.isBoss || e.champion) ? 1 : 0.5) * rate * (1 + relicSum(battle.run, 'dropChanceBonus')));
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
    effectiveStats: effectiveStats,
    skillCost: skillCost,
    skillBlockReason: skillBlockReason
  };
})();
