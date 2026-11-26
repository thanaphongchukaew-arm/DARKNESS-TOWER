// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Battle screen: rendering, action menu, target selection, event playback, All-Out Attack modal.
(function () {
  function I(name, cls) { return window.Game.Icons.get(name, cls); }
  function EN(el) { return window.Game.ElementName(el); }
  function SFX(name) { if (window.Game.Audio) window.Game.Audio.sfx(name); }
  function T(key, vars) { return window.Game.I18n.t(key, vars); }
  function L(obj, field) { return window.Game.I18n.L(obj, field); }

  var STAT_NAME_KEYS = {
    atk: 'statAtk', mag: 'statMag', def: 'statDef', res: 'statRes',
    spd: 'statSpd', luk: 'statLuk', atkmag: 'statAtkMag', defres: 'statDefRes'
  };

  var currentBattle = null;
  var currentFloor = null;
  var currentIsBoss = false;
  var currentIsReplay = false;
  var targetPickCallback = null;
  var toastTimer = null;
  var recentHistory=[];
  var playbackEpoch = 0, playbackBusy = false, pendingLanguageRefresh = false;

  // Endless Arena (survival mode): 'tower' | 'survival'. currentBattle is reused
  // for both modes (same object shape, same BattleEngine calls) -- only what
  // happens when a battle ends differs, branched in handleBattleEnd below.
  var currentMode = 'tower';
  var survivalSession = null;
  var lastSurvivalSummary = null;

  function logLine(text, cls) {
    var log = document.getElementById('battle-log');
    var line = document.createElement('div');
    line.className = cls || '';
    line.textContent = text;
    log.appendChild(line);
    if (cls !== 'log-new') { recentHistory.push(text); if(recentHistory.length>10)recentHistory.shift(); var panel=document.getElementById('battle-recent-history');if(panel){panel.querySelector('ol').innerHTML=recentHistory.map(function(entry){var li=document.createElement('li');li.textContent=entry;return li.outerHTML;}).join('');} }
    log.scrollTop = log.scrollHeight;
  }

  function showToast(text, cls) {
    var el = document.getElementById('battle-toast');
    clearTimeout(toastTimer);
    el.className = 'battle-toast' + (cls ? ' ' + cls : '');
    el.textContent = text;
    el.classList.remove('hidden');
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
    toastTimer = setTimeout(function () { el.classList.add('hidden'); }, 900 / window.Game.SystemsUI.speed());
  }

  function describeEvent(ev) {
    switch (ev.type) {
      case 'cleanse': return { text: window.Game.Systems.text('ชำระล้างสถานะผิดปกติ', 'Ailment cleansed'), cls: 'log-heal' };
      case 'enemyAction': return { text: ev.skillName, cls: '' };
      case 'riposte': return { text: ev.message, cls: 'log-crit' };
      case 'storySupport': return { text: window.Game.Systems.text('โอรินช่วยเปิดทาง! ', 'Orin clears the way! ') + ev.targetName + ' −' + ev.amount, cls: 'log-crit' };
      case 'combo': return { text: ev.message, cls: 'log-heal' };
      case 'classMech': return { text: ev.message, cls: ev.tone === 'crit' ? 'log-crit' : ev.tone === 'weak' ? 'log-weak' : 'log-heal' };
      case 'affinity': return { text: ev.targetName + ' · ' + window.Game.Systems.text(ev.weak ? 'จุดอ่อน ×1.5' : 'ต้านทาน ×0.65', ev.weak ? 'WEAK ×1.5' : 'RESIST ×0.65'), cls: ev.weak ? 'log-crit' : '' };
      case 'ailment': return { text: ev.targetName + ' · ' + window.Game.Systems.text('ติดสถานะ ', 'Inflicted: ') + window.Game.Systems.text({ poison: 'พิษ', burn: 'ไหม้', silence: 'ใบ้' }[ev.id], ev.id), cls: 'log-weak' };
      case 'ailmentDamage': return { text: ev.targetName + ' · ' + ev.id + ' −' + ev.amount, cls: 'log-weak' };
      case 'skillUsed': return { text: T('logSkillUsed', { name: ev.name }), cls: '' };
      case 'hit':
        if (ev.targetSide === 'enemy') {
          var tag = ev.isCrit ? T('critTag') : '';
          return { text: T('logEnemyDamage', { target: ev.targetName, amount: ev.amount, tag: tag }), cls: ev.isCrit ? 'log-crit' : '' };
        }
        var ptag = ev.isCrit ? T('critTag') : '';
        return { text: T('logPlayerDamage', { attacker: ev.attackerName, skill: ev.skillName, amount: ev.amount, tag: ptag }), cls: ev.isCrit ? 'log-weak' : '' };
      case 'downed': return { text: T('logDowned', { target: ev.targetName }), cls: 'log-weak' };
      case 'defeated': return { text: T('logDefeated', { target: ev.targetName }), cls: 'log-crit' };
      case 'heal': return { text: T('logHeal', { amount: ev.amount }), cls: 'log-heal' };
      case 'hpSacrifice': return { text: T('logHpSacrifice', { amount: ev.amount }), cls: 'log-weak' };
      case 'buff':
        var who = ev.side === 'enemy' ? ev.targetName : (currentBattle ? currentBattle.player.name : T('youPronoun'));
        var statName = T(STAT_NAME_KEYS[ev.stat] || ev.stat);
        return { text: T(ev.amount > 0 ? 'logBuffUp' : 'logBuffDown', { who: who, stat: statName }), cls: '' };
      case 'guard': return { text: T('logGuard'), cls: '' };
      case 'itemUsed': return { text: T('logItemUsed'), cls: 'log-heal' };
      case 'allOutReady': return { text: T('logAllOutReady'), cls: 'log-crit' };
      case 'enemyBroken': return { text: T('logEnemyBroken', { target: ev.targetName }), cls: 'log-weak' };
      case 'overdriveUsed': return { text: T('logOverdriveUsed'), cls: 'log-crit' };
      case 'allOutStart': return { text: T('logAllOutStart'), cls: 'log-crit' };
      case 'allOutHit': return { text: T('logAllOutHit', { target: ev.targetName, amount: ev.amount, defeated: ev.defeated ? T('logAllOutHitDefeatedTag') : '' }), cls: 'log-crit' };
      case 'allOutDeclined': return { text: T('logAllOutDeclined'), cls: '' };
      case 'bossPhaseChange': return { text: ev.message, cls: 'log-crit' };
      case 'enemyPhaseSkip': return { text: T('logEnemyPhaseSkip', { target: ev.targetName }), cls: '' };
      case 'victory': return { text: T('logVictory'), cls: 'log-crit' };
      case 'defeat': return { text: T('logDefeat'), cls: 'log-weak' };
      case 'invalid': return { text: T('logInvalidAction'), cls: '' };
      case 'companionHit':
        var ctag = ev.isCrit ? T('critTag') : '';
        return { text: T('logCompanionHit', { companion: ev.companionName, target: ev.targetName, amount: ev.amount, tag: ctag }), cls: ev.isCrit ? 'log-crit' : '' };
      case 'companionHeal': return { text: T('logCompanionHeal', { companion: ev.companionName, amount: ev.amount }), cls: 'log-heal' };
      case 'companionBuff': return { text: T('logCompanionBuff', { companion: ev.companionName }), cls: '' };
      case 'duoStart': return { text: T('logDuoStart', { companion: ev.companionName, name: ev.name }), cls: 'log-crit' };
      case 'companionSnared': return { text: T('logCompanionSnared', { companion: ev.companionName }), cls: 'log-weak' };
      case 'shiftFocus': return { text: ev.message, cls: 'log-weak' };
      case 'blessingRevive': return { text: T('logBlessingRevive'), cls: 'log-crit' };
      default: return null;
    }
  }

  // Descending HP-fraction cut points bounding each phase's segment, e.g. a
  // 4-phase boss (3 entries in phasesData) yields [1, 0.75, 0.5, 0.25, 0].
  function hpSegmentBreakpoints(enemy) {
    var pts = [1];
    (enemy.phasesData || []).forEach(function (p) { pts.push(p.hpThreshold); });
    pts.push(0);
    return pts;
  }

  function findEnemyByUid(uid) {
    if (!currentBattle) return null;
    for (var i = 0; i < currentBattle.enemies.length; i++) {
      if (currentBattle.enemies[i].uid === uid) return currentBattle.enemies[i];
    }
    return null;
  }

  function updateEnemyBarByUid(uid, hp, maxHp) {
    if (!uid) return;
    var hpText = document.getElementById('enemy-hptext-' + uid);
    if (hpText) hpText.textContent = Math.max(0, hp) + '/' + maxHp;
    var enemy = findEnemyByUid(uid);
    if (enemy && enemy.phasesData && enemy.phasesData.length) {
      var pts = hpSegmentBreakpoints(enemy);
      var frac = Math.max(0, hp / maxHp);
      for (var i = 0; i < pts.length - 1; i++) {
        var seg = document.getElementById('enemy-hp-' + uid + '-' + i);
        if (!seg) continue;
        var hi = pts[i], lo = pts[i + 1];
        var pct = frac >= hi ? 100 : frac <= lo ? 0 : Math.round((frac - lo) / (hi - lo) * 100);
        seg.style.width = pct + '%';
      }
      return;
    }
    var bar = document.getElementById('enemy-hp-' + uid);
    if (bar) bar.style.width = Math.max(0, Math.round(hp / maxHp * 100)) + '%';
  }

  // Break meter (see battle-engine.js's applyBreak): patches the existing bar in
  // place, same pattern as updateEnemyBarByUid, and toggles the "Broken!" tag via
  // setEnemyCardState. Takes the breakMeter/broken snapshot straight off the event
  // (each hit/companionHit/allOutHit event carries its own post-hit values, exactly
  // like hpAfter does) rather than reading live current state, so a multi-hit skill's
  // bar fills incrementally per hit instead of jumping to its final value early.
  // Bar length per enemy (bosses and champions stagger slower -- see Formulas.breakMax).
  function breakMaxFor(uid) {
    return window.Game.Formulas.breakMax(findEnemyByUid(uid));
  }
  // The bar shows the enemy's remaining poise: full at the start, draining with every hit,
  // empty when it is staggered.
  function poisePct(breakMeter, max, broken) {
    return broken ? 0 : Math.max(0, 100 - Math.min(100, Math.round(breakMeter / max * 100)));
  }
  function poiseLabel(meter, max, broken) {
    var left = broken ? 0 : Math.max(0, max - meter);
    return window.Game.Systems.text('ความมั่นคงเหลือ ', 'Poise left ') + left + '/' + max + window.Game.Systems.text(' (หมดแล้วล้ม)', ' (staggers at 0)');
  }
  function refreshBreakBar(uid, breakMeter, broken) {
    if (!uid) return;
    var bar = document.getElementById('enemy-break-' + uid);
    if (bar) {
      var max = breakMaxFor(uid);
      bar.style.width = poisePct(breakMeter, max, broken) + '%';
      bar.closest('.break-row').dataset.tip = poiseLabel(breakMeter, max, broken);
      bar.classList.toggle('full', !!broken);
      if (bar.parentNode) bar.parentNode.classList.toggle('staggered', !!broken);
    }
    setEnemyCardState(uid, { broken: broken });
  }

  function getEnemyPortraitEl(uid) {
    var card = document.getElementById('enemy-card-' + uid);
    return card ? card.querySelector('.enemy-portrait') : null;
  }

  function getPlayerPortraitEl() {
    return document.querySelector('#battle-player-panel .player-portrait');
  }

  var ELEMENT_COLORS = { fire: '#ffb070', ice: '#a8e8ff', elec: '#fff07a', wind: '#b8f7cf', dark: '#d2adff', light: '#fff6c4', almighty: '#ffffff' };
  // Weight of a hit: bigger numbers for hits that take a bigger bite out of the target's max HP.
  function numberOpts(ev, tinted) {
    var ratio = ev.maxHp ? Math.max(0, ev.amount || 0) / ev.maxHp : 0;
    return { scale: Math.min(1.85, 1 + ratio * 2.4), color: tinted ? ELEMENT_COLORS[ev.element] : '' };
  }
  // Small labels at the top right of a damage number: CRIT, WEAK ▲ (struck a weakness),
  // RESIST ▼ (the target resisted the element).
  function hitTags(ev) {
    var tags = [];
    if (ev.isCrit) tags.push({ cls: 'tag-crit', text: 'CRIT' });
    if (ev.affinity === 'weak') tags.push({ cls: 'tag-weak', text: 'WEAK ▲' });
    if (ev.affinity === 'resist') tags.push({ cls: 'tag-resist', text: 'RESIST ▼' });
    return tags;
  }
  function spawnFloatNumber(anchorEl, text, cls, opts) {
    if (!anchorEl) return;
    var num = document.createElement('div');
    num.className = 'dmg-number' + (cls ? ' ' + cls : '');
    num.textContent = text;
    if (opts && opts.tags && opts.tags.length) {
      var box = document.createElement('span');
      box.className = 'dmg-tags';
      opts.tags.forEach(function (t) { var s = document.createElement('span'); s.className = 'dmg-tag ' + t.cls; s.textContent = t.text; box.appendChild(s); });
      num.appendChild(box);
    }
    num.style.setProperty('--dx', (Math.random() * 28 - 14).toFixed(0) + 'px');
    if (opts && opts.scale > 1) num.style.setProperty('--dmg-s', opts.scale.toFixed(2));
    if (opts && opts.color) num.style.color = opts.color;
    anchorEl.appendChild(num);
    setTimeout(function () { if (num.parentNode) num.parentNode.removeChild(num); }, 900 / window.Game.SystemsUI.speed());
  }

  function motionOf(portrait) {
    var art = portrait && portrait.querySelector('.enemy-art'), m = art && art.className.match(/motion-(\w+)/);
    return m ? m[1] : 'breathe';
  }
  function ambienceOf(portrait) {
    var art = portrait && portrait.querySelector('.enemy-art'), m = art && art.className.match(/amb-(\w+)/);
    return m ? m[1] : 'dust';
  }
  // Dust kicked up at the monster's feet (landings, charges, entrances).
  function spawnPuffs(portrait, n) {
    if (!portrait || !portrait.isConnected) return;
    for (var i = 0; i < n; i++) {
      var puff = document.createElement('span');
      puff.className = 'dust-puff';
      puff.style.setProperty('--ox', (Math.random() * 40 - 20).toFixed(1) + 'cqmin');
      puff.style.setProperty('--ps', (5 + Math.random() * 5).toFixed(1) + 'cqmin');
      puff.style.setProperty('--pd', (Math.random() * .08).toFixed(2) + 's');
      portrait.appendChild(puff);
      setTimeout(function (node) { if (node.parentNode) node.parentNode.removeChild(node); }.bind(null, puff), 900);
    }
  }
  // Element-flavoured burst when a monster falls.
  function spawnDeathBurst(portrait) {
    if (!portrait) return;
    var kind = ambienceOf(portrait), i, n = 14;
    for (i = 0; i < n; i++) {
      var shard = document.createElement('span');
      shard.className = 'death-shard ds-' + kind;
      shard.style.setProperty('--a', (-170 + Math.random() * 160).toFixed(0) + 'deg');
      shard.style.setProperty('--r', (14 + Math.random() * 30).toFixed(1) + 'cqmin');
      shard.style.setProperty('--g', (8 + Math.random() * 16).toFixed(1) + 'cqmin');
      shard.style.setProperty('--ds', (2 + Math.random() * 3.5).toFixed(1) + 'px');
      shard.style.setProperty('--dd', (Math.random() * .12).toFixed(2) + 's');
      portrait.appendChild(shard);
      setTimeout(function (node) { if (node.parentNode) node.parentNode.removeChild(node); }.bind(null, shard), 1400);
    }
  }
  // Slow "camera": only the room behind the fighters pushes in, so the UI never moves.
  var cameraTimer = null;
  function camera(kind, ms) {
    var screenEl = document.getElementById('screen-battle');
    if (!screenEl) return;
    screenEl.classList.remove('cam-push', 'cam-overdrive', 'cam-slam');
    void screenEl.offsetWidth;
    screenEl.classList.add('cam-' + kind);
    clearTimeout(cameraTimer);
    cameraTimer = setTimeout(function () { screenEl.classList.remove('cam-push', 'cam-overdrive', 'cam-slam'); }, ms);
  }
  var introTimer = null;
  function startIntro() {
    var screenEl = document.getElementById('screen-battle');
    if (!screenEl) return;
    screenEl.classList.add('battle-intro');
    clearTimeout(introTimer);
    introTimer = setTimeout(function () { screenEl.classList.remove('battle-intro'); }, 2800);
  }
  function clearIntro() {
    var screenEl = document.getElementById('screen-battle');
    clearTimeout(introTimer); clearTimeout(cameraTimer);
    if (screenEl) screenEl.classList.remove('battle-intro', 'cam-push', 'cam-overdrive', 'cam-slam');
  }

  // Enemy hit reaction: recoil + squash on the art, a pulse on the ground shadow, and a spark burst.
  function reactEnemyHit(el, heavy) {
    var cls = heavy ? 'is-hurt-heavy' : 'is-hurt', i, n = heavy ? 9 : 6, base = Math.random() * 60, now = Date.now();
    // crits call flash then shake back-to-back: let the heavy reaction replace the light one
    if (!heavy && now - (el._hurtAt || 0) < 40) return;
    if (heavy) Array.prototype.forEach.call(el.querySelectorAll('.hit-spark'), function (node) { node.parentNode.removeChild(node); });
    el._hurtAt = now;
    el.classList.remove('is-hurt', 'is-hurt-heavy');
    void el.offsetWidth;
    el.classList.add(cls);
    setTimeout(function () { el.classList.remove(cls); }, 520 / window.Game.SystemsUI.speed());
    for (i = 0; i < n; i++) {
      var spark = document.createElement('span');
      spark.className = 'hit-spark' + (heavy ? ' hit-spark-heavy' : '');
      spark.style.setProperty('--a', (base + i * (360 / n) + Math.random() * 20 - 10).toFixed(0) + 'deg');
      spark.style.setProperty('--r', ((heavy ? 34 : 24) + Math.random() * 22).toFixed(0) + 'px');
      el.appendChild(spark);
      setTimeout(function (node) { if (node.parentNode) node.parentNode.removeChild(node); }.bind(null, spark), 600 / window.Game.SystemsUI.speed());
    }
  }

  function flashEl(el, cls) {
    if (!el) return;
    var c = cls || 'hit-flash';
    if (el.classList.contains('enemy-portrait') && (c === 'hit-flash' || c === 'hit-shake')) reactEnemyHit(el, c === 'hit-shake');
    el.classList.remove(c);
    void el.offsetWidth;
    el.classList.add(c);
    setTimeout(function () { el.classList.remove(c); }, 450 / window.Game.SystemsUI.speed());
  }

  function shakeScreen(strong) {
    var el = document.getElementById('screen-battle');
    if (!el) return;
    var c = strong ? 'screen-shake-strong' : 'screen-shake';
    el.classList.remove('screen-shake', 'screen-shake-strong');
    void el.offsetWidth;
    el.classList.add(c);
    setTimeout(function () { el.classList.remove(c); }, 450 / window.Game.SystemsUI.speed());
  }

  function setEnemyCardState(uid, opts) {
    if (!uid) return;
    var card = document.getElementById('enemy-card-' + uid);
    if (!card) return;
    if (opts.downed != null) card.classList.toggle('downed', opts.downed);
    if (opts.broken != null) card.classList.toggle('broken', opts.broken);
    if (opts.dead) {
      card.classList.add('dead');
      card.classList.remove('downed', 'broken', 'targetable', 'is-acting');
    }
  }

  function updatePlayerBarsDirect(hp, maxHp, mp, maxMp) {
    var hpBar = document.getElementById('player-hp-bar');
    if (hpBar && hp != null && maxHp != null) hpBar.style.width = Math.max(0, Math.round(hp / maxHp * 100)) + '%';
    var hpText = document.getElementById('player-hp-text');
    if (hpText && hp != null && maxHp != null) hpText.textContent = hp + '/' + maxHp;
    if (mp != null && maxMp != null) {
      var mpBar = document.getElementById('player-mp-bar');
      if (mpBar) mpBar.style.width = Math.max(0, Math.round(mp / maxMp * 100)) + '%';
      var mpText = document.getElementById('player-mp-text');
      if (mpText) mpText.textContent = mp + '/' + maxMp;
    }
    if (hpBar && hp != null && maxHp != null) hpBar.classList.toggle('low', hp / maxHp <= 0.25 && hp > 0);
  }

  function handleEventVisual(ev) {
    if(ev.type==='affinity'&&ev.weak&&currentBattle){currentBattle.microWeakTargets=currentBattle.microWeakTargets||{};currentBattle.microWeakTargets[ev.targetUid]=true;}
    if(ev.type==='enemyBroken'&&currentBattle&&currentBattle.microWeakTargets&&currentBattle.microWeakTargets[ev.targetUid]){SFX('level_up');showToast(window.Game.Systems.text('คอมโบ! จุดอ่อน + Break','COMBO! Weakness + Break'),'');logLine(window.Game.Systems.text('คอมโบ: เจาะจุดอ่อนจนเกราะแตก','Combo: weakness caused Break'),'log-crit');currentBattle.microWeakTargets[ev.targetUid]=false;window.Game.Micro.ensure(currentBattle.run).stats.combos++;}
    if(ev.type==='companionHit'&&ev.hpAfter===0&&currentBattle.enemies.every(function(e){return !e.alive;})){SFX('level_up');showToast(window.Game.Systems.text('สหายปิดฉาก!','ALLY FINISH!'),'');logLine(window.Game.Systems.text('สหายจัดการศัตรูตัวสุดท้าย','Ally delivers the finishing blow'),'log-crit');}

    switch (ev.type) {
      case 'resourceGain':
        if (ev.resource === 'mp') updatePlayerBarsDirect(null, null, ev.mpAfter, ev.maxMp);
        spawnFloatNumber(getPlayerPortraitEl(), '+' + ev.amount + (ev.resource === 'mp' ? ' MP' : ' Focus'), 'dmg-heal');
        break;
      case 'cleanse':
        SFX('heal');
        break;
      case 'riposte':
        window.Game.HeroArt.animate('attack');
        updateEnemyBarByUid(ev.targetUid, ev.hpAfter, ev.maxHp);
        refreshBreakBar(ev.targetUid, ev.breakMeter, ev.broken);
        spawnFloatNumber(getEnemyPortraitEl(ev.targetUid), ev.amount, 'dmg-crit');
        break;
      case 'storySupport':
        updateEnemyBarByUid(ev.targetUid, ev.hpAfter, ev.maxHp);
        refreshBreakBar(ev.targetUid, ev.breakMeter, ev.broken);
        spawnFloatNumber(getEnemyPortraitEl(ev.targetUid), ev.amount, 'dmg-hp');
        flashEl(document.getElementById('battle-story-ally'), 'hit-flash');
        break;
      case 'ailmentDamage':
        if (ev.targetSide === 'enemy') { updateEnemyBarByUid(ev.targetUid, ev.hpAfter, ev.maxHp); spawnFloatNumber(getEnemyPortraitEl(ev.targetUid), ev.amount, 'dmg-hp'); }
        else { updatePlayerBarsDirect(ev.hpAfter, ev.maxHp, currentBattle.run.mp, currentBattle.player.maxMp); spawnFloatNumber(getPlayerPortraitEl(), ev.amount, 'dmg-hp'); }
        break;
      case 'enemyAction': {
        var acting = findEnemyByUid(ev.attackerUid);
        setBattleCue(window.Game.Systems.text('ตาศัตรู · ', 'Enemy turn · ') + (acting ? acting.name : ev.skillName), ev.attackerUid);
        var actor = getEnemyPortraitEl(ev.attackerUid);
        if (actor) { actor.classList.remove('enemy-strike'); void actor.offsetWidth; actor.classList.add('enemy-strike'); battleLater(function () { actor.classList.remove('enemy-strike'); }, 700 / window.Game.SystemsUI.speed());
          var strikeMotion = motionOf(actor);
          if (strikeMotion === 'heavy' || strikeMotion === 'squash' || strikeMotion === 'flap') battleLater(function () { spawnPuffs(actor, strikeMotion === 'heavy' ? 6 : 3); }, 340 / window.Game.SystemsUI.speed());
          else if (strikeMotion === 'prowl') battleLater(function () { spawnPuffs(actor, 3); }, 150 / window.Game.SystemsUI.speed());
        }
        break;
      }
      case 'skillUsed':
        setBattleCue(window.Game.Systems.text('กำลังใช้ · ', 'Using · ') + ev.name, 'player');
        aimHeroDash();
        var family = window.Game.VFXData.skill(ev.skillId, currentBattle.run.classId).family;
        window.Game.HeroArt.animate(ev.kind === 'attack' && ['slash','cross','cleave','thrust','claw','bite','punch','arrow','bullet'].indexOf(family) !== -1 ? 'attack' : 'cast');
        SFX('skill_cast');
        camera('push', 1100 / window.Game.SystemsUI.speed());
        break;
      case 'guard':
        window.Game.HeroArt.animate('guard');
        SFX('guard');
        break;
      case 'buff':
        SFX(ev.amount > 0 ? 'item_get' : 'hit_null');
        break;
      case 'hit':
        if (ev.targetSide === 'enemy') {
          var ePortrait = getEnemyPortraitEl(ev.targetUid);
          if (ev.hpAfter != null && ev.maxHp != null) updateEnemyBarByUid(ev.targetUid, ev.hpAfter, ev.maxHp);
          refreshBreakBar(ev.targetUid, ev.breakMeter, ev.broken);
          var tagOpts = numberOpts(ev, !ev.isCrit && ev.affinity !== 'resist');
          tagOpts.tags = hitTags(ev);
          if (ev.isCrit) {
            SFX('hit_crit');
            flashEl(ePortrait, 'hit-flash');
            flashEl(ePortrait, 'hit-shake');
            spawnFloatNumber(ePortrait, ev.amount, 'dmg-crit', tagOpts);
            shakeScreen(false);
          } else {
            SFX('attack');
            flashEl(ePortrait, 'hit-flash');
            spawnFloatNumber(ePortrait, ev.amount, ev.affinity === 'resist' ? 'dmg-hp dmg-resisted' : 'dmg-hp', tagOpts);
          }
        } else {
          window.Game.HeroArt.animate('hurt');
          var pPortrait = getPlayerPortraitEl();
          updatePlayerBarsDirect(ev.hpAfter, ev.maxHp);
          if (ev.attackerUid && ev.attackerHpAfter != null) updateEnemyBarByUid(ev.attackerUid, ev.attackerHpAfter, ev.attackerMaxHp);
          if (ev.isCrit) {
            SFX('player_hit');
            showToast(T('toastPlayerCrit'), 'weak');
            flashEl(pPortrait, 'hit-flash');
            flashEl(pPortrait, 'hit-shake');
            spawnFloatNumber(pPortrait, ev.amount, 'dmg-weak', numberOpts(ev, false));
            shakeScreen(true);
          } else if (ev.amount) {
            SFX('player_hit');
            flashEl(pPortrait, 'hit-flash');
            flashEl(pPortrait, 'hit-shake');
            spawnFloatNumber(pPortrait, ev.amount, 'dmg-hp', numberOpts(ev, false));
            shakeScreen(false);
          }
        }
        break;
      case 'defeated':
        SFX('defeated');
        setEnemyCardState(ev.targetUid, { dead: true });
        spawnDeathBurst(getEnemyPortraitEl(ev.targetUid));
        break;
      case 'downed':
        SFX('downed');
        setEnemyCardState(ev.targetUid, { downed: true });
        break;
      case 'heal':
        SFX('heal');
        updatePlayerBarsDirect(ev.hpAfter, ev.maxHp);
        spawnFloatNumber(getPlayerPortraitEl(), '+' + ev.amount, 'dmg-heal');
        break;
      case 'hpSacrifice':
        SFX('player_hit');
        updatePlayerBarsDirect(ev.hpAfter, ev.maxHp);
        spawnFloatNumber(getPlayerPortraitEl(), ev.amount, 'dmg-weak');
        break;
      case 'itemUsed':
        SFX('item_use');
        updatePlayerBarsDirect(ev.hpAfter, ev.maxHp, ev.mpAfter, ev.maxMp);
        if (ev.result && ev.result.healedHp) spawnFloatNumber(getPlayerPortraitEl(), '+' + ev.result.healedHp, 'dmg-heal');
        if (ev.result && ev.result.healedMp) spawnFloatNumber(getPlayerPortraitEl(), '+' + ev.result.healedMp + ' MP', 'dmg-heal');
        break;
      case 'allOutHit':
        SFX('hit_crit');
        updateEnemyBarByUid(ev.targetUid, ev.hpAfter, ev.maxHp);
        refreshBreakBar(ev.targetUid, ev.breakMeter, ev.broken);
        setEnemyCardState(ev.targetUid, { downed: false, dead: ev.defeated });
        flashEl(getEnemyPortraitEl(ev.targetUid), 'hit-flash');
        spawnFloatNumber(getEnemyPortraitEl(ev.targetUid), ev.amount, 'dmg-crit');
        shakeScreen(false);
        break;
      case 'allOutReady':
        SFX('allout_ready');
        showToast(T('toastAllOutReady'), 'weak');
        break;
      case 'enemyBroken':
        SFX('enemy_broken');
        flashEl(getEnemyPortraitEl(ev.targetUid), 'hit-shake');
        break;
      case 'focusReady':
        SFX('overdrive_ready');
        showToast(T('toastOverdriveReady'), 'weak');
        break;
      case 'overdriveUsed':
        SFX('overdrive_start');
        shakeScreen(true);
        camera('overdrive', 1700 / window.Game.SystemsUI.speed());
        break;
      case 'allOutStart':
        SFX('allout_start');
        shakeScreen(true);
        break;
      case 'duoStart':
        SFX('allout_start');
        showToast(ev.name, 'weak');
        flashEl(getPlayerPortraitEl(), 'hit-flash');
        break;
      case 'companionSnared':
        SFX('hit_null');
        showToast(T('logCompanionSnared', { companion: ev.companionName }), 'miss');
        break;
      case 'shiftFocus':
        SFX('ui_error');
        showToast(ev.message, 'miss');
        if (ev.mpAfter != null) updatePlayerBarsDirect(null, null, ev.mpAfter, currentBattle.player.maxMp);
        break;
      case 'bossPhaseChange': {
        var changing = findEnemyByUid(ev.targetUid);
        var portrait = changing && getEnemyPortraitEl(changing.uid);
        if (portrait) { var phased = Object.assign({}, changing, { phase: ev.phase }); portrait.innerHTML = window.Game.BattleArt.ring(phased) + window.Game.BattleArt.enemy(phased) + window.Game.BattleArt.fx(phased); }
        var phaseChip = changing && document.querySelector('#enemy-card-' + changing.uid + ' .boss-phase-chip');
        if (phaseChip) phaseChip.textContent = T('phaseChip', { n: ev.phase, max: changing.phasesData.length + 1 });
        SFX('boss_phase');
        showToast(ev.shift ? T('toastPhaseShift') : T('toastPhase2'), 'weak');
        shakeScreen(true);
        break;
      }
      case 'invalid':
        SFX('hit_null');
        showToast(T('toastInvalidAction'), 'miss');
        break;
      case 'companionHit': {
        var cPortrait = getEnemyPortraitEl(ev.targetUid);
        if (ev.hpAfter != null && ev.maxHp != null) updateEnemyBarByUid(ev.targetUid, ev.hpAfter, ev.maxHp);
        refreshBreakBar(ev.targetUid, ev.breakMeter, ev.broken);
        SFX(ev.isCrit ? 'hit_crit' : 'attack');
        flashEl(cPortrait, 'hit-flash');
        spawnFloatNumber(cPortrait, ev.amount, ev.isCrit ? 'dmg-crit' : 'dmg-hp');
        break;
      }
      case 'classMech':
        if (ev.tone === 'crit') showToast(ev.message, '');
        break;
      case 'companionHeal':
        SFX('heal');
        updatePlayerBarsDirect(ev.hpAfter, ev.maxHp);
        spawnFloatNumber(getPlayerPortraitEl(), '+' + ev.amount, 'dmg-heal');
        break;
      case 'companionBuff':
        SFX('item_get');
        flashEl(getPlayerPortraitEl(), 'hit-flash');
        break;
      case 'blessingRevive':
        SFX('level_up');
        updatePlayerBarsDirect(ev.hpAfter, ev.maxHp);
        showToast(T('toastBlessingRevive'), 'weak');
        shakeScreen(true);
        break;
    }
    if(ev.type==='hit'&&ev.targetSide==='enemy'&&currentBattle&&currentBattle.microWeakTargets)currentBattle.microWeakTargets[ev.targetUid]=false;
    var d = describeEvent(ev);
    if (d) logLine(d.text, d.cls);
  }

  function cancelPlayback() {
    playbackEpoch += 1; playbackBusy = false; pendingLanguageRefresh = false;
    if (window.Game.PixelFX) window.Game.PixelFX.cancel();
    clearTimeout(toastTimer);
    var toast = document.getElementById('battle-toast'); if (toast) toast.classList.add('hidden');
    var prompt = document.getElementById('allout-modal'); if (prompt) { prompt.classList.add('hidden'); prompt.innerHTML = ''; }
    var entrance = document.getElementById('battle-entrance'); if (entrance) entrance.remove();
    clearIntro();
    closeSubmenu();
    var caption = document.getElementById('battle-fx-caption');
    if (caption) caption.classList.remove('is-active');
  }

  function battleLater(callback, delay) {
    var battle = currentBattle, epoch = playbackEpoch;
    return setTimeout(function () { if (epoch === playbackEpoch && battle === currentBattle) callback(); }, delay);
  }

  function effectCaption(ev) {
    var name = ev.type === 'skillUsed' ? ev.name : ev.type === 'enemyAction' ? ev.skillName : ev.type === 'itemUsed' ? L(window.Game.Data.getItem(ev.itemId), 'name') : ev.type === 'overdriveUsed' ? T('overdriveLabel') : ev.type === 'allOutStart' ? T('allOutTitle') : null;
    if (!name) return;
    var el = document.getElementById('battle-fx-caption');
    if (!el) { el = document.createElement('div'); el.id = 'battle-fx-caption'; el.className = 'battle-fx-caption'; el.setAttribute('aria-hidden', 'true'); document.body.appendChild(el); }
    el.textContent = name;
    el.classList.toggle('is-enemy', ev.type === 'enemyAction');
    el.classList.add('is-active');
  }

  function playEvents(events, onDone) {
    if(currentBattle)window.Game.Micro.noteEvents(currentBattle.run,events);
    if (window.Game.Tips) window.Game.Tips.onBattleEvents(events);
    var battle = currentBattle, epoch = playbackEpoch, completed = false;
    function complete() { if (!completed && epoch === playbackEpoch && currentBattle === battle) { completed = true; onDone(); } }
    document.getElementById('battle-home').disabled = !!battle.over;
    var timeline = window.Game.BattleFX.timeline(events);
    playbackBusy = true;
    function valid() { return epoch === playbackEpoch && currentBattle === battle; }
    async function play() {
      for (var i = 0; i < timeline.length; i++) {
        if (!valid()) return;
        var step = timeline[i];
        effectCaption(step.events[0]);
        var result = await window.Game.BattleFX.play(step, battle, function () {
          if (!valid()) return;
          step.events.forEach(handleEventVisual);
        });
        if (result.cancelled || !valid()) return;
      }
      if (!valid()) return;
      playbackBusy = false;
      var caption = document.getElementById('battle-fx-caption');
      if (caption) caption.classList.remove('is-active');
      if (pendingLanguageRefresh) { pendingLanguageRefresh = false; refreshActiveScreen(); }
      complete();
    }
    play().catch(function (error) {
      console.error('[BattleFX] playback failed:', error);
      if (valid()) { playbackBusy = false; window.Game.PixelFX.cancel(); complete(); }
    });
  }

  function enemyCardHtml(e) {
    var classes = ['enemy-card'];
    if (!e.alive) classes.push('dead', 'dead-done'); // dead-done: the fall animation already played, skip the replay
    if (e.downed) classes.push('downed');
    if (e.broken) classes.push('broken');
    if (e.isBoss) classes.push('boss');
    if (e.champion || e.elite) classes.push('is-champion');
    (e.ailments || []).forEach(function (a) { classes.push('fx-afflicted-' + a.id); });
    if (targetPickCallback && e.alive) classes.push('targetable');
    var hpPct = Math.max(0, Math.round(e.hp / e.maxHp * 100));
    var hasPhases = e.isBoss && e.phasesData && e.phasesData.length;
    var hpBarHtml;
    if (hasPhases) {
      var pts = hpSegmentBreakpoints(e);
      var frac = e.hp / e.maxHp;
      var segs = '';
      for (var i = 0; i < pts.length - 1; i++) {
        var hi = pts[i], lo = pts[i + 1];
        var pct = frac >= hi ? 100 : frac <= lo ? 0 : Math.round((frac - lo) / (hi - lo) * 100);
        segs += '<div class="bar-track hp-segment" style="flex:' + Math.max(0.05, hi - lo).toFixed(3) + ' 1 0"><div class="bar-fill hp' + (pct > 0 && pct <= 30 ? ' low' : '') + '" id="enemy-hp-' + e.uid + '-' + i + '" style="width:' + pct + '%"></div></div>';
      }
      hpBarHtml = '<div class="bar-row hp-segment-row" style="width:100%">' + segs + '</div>';
    } else {
      hpBarHtml = '<div class="bar-row" style="width:100%"><div class="bar-track"><div class="bar-fill hp" id="enemy-hp-' + e.uid + '" style="width:' + hpPct + '%"></div></div></div>';
    }
    var breakMax = window.Game.Formulas.breakMax(e);
    var breakPct = poisePct(e.breakMeter, breakMax, e.broken);
    var breakBarHtml = '<div class="bar-row break-row" data-tip="' + poiseLabel(e.breakMeter, breakMax, e.broken) + '"><div class="bar-track break-track' + (e.broken ? ' staggered' : '') + '"><div class="bar-fill break' + (e.broken ? ' full' : '') + '" id="enemy-break-' + e.uid + '" style="width:' + breakPct + '%"></div></div></div>';
    var role = window.Game.BattleArt.profile(e).role;
    var roleLabel = window.Game.Systems.text({tank:'เกราะหนัก',caster:'เวทมนตร์',swift:'ว่องไว',striker:'โจมตี'}[role], {tank:'ARMORED',caster:'CASTER',swift:'SWIFT',striker:'STRIKER'}[role]);
    var name = (e.elite ? 'ELITE · ' : '') + (e.champion ? T('championTag') + ' · ' : '') + e.name;
    var phase = hasPhases ? '<span class="boss-phase-chip">' + T('phaseChip', { n: e.phase, max: e.phasesData.length + 1 }) + '</span>' : '';
    return '<div class="' + classes.join(' ') + '" id="enemy-card-' + e.uid + '" data-uid="' + e.uid + '">' +
      '<div class="enemy-portrait">' + window.Game.BattleArt.ring(e) + window.Game.BattleArt.enemy(e) + window.Game.BattleArt.fx(e) + '</div>' +
      '<div class="enemy-hud">' +
        '<div class="enemy-meta"><span class="enemy-role-label">' + roleLabel + '</span>' + phase +
        '<span class="enemy-downed-tag">' + T('downedTag') + '</span><span class="enemy-broken-tag">' + T('brokenTag') + '</span></div>' +
        '<div class="enemy-name-slot"><div class="enemy-name">' + name + '</div></div>' +
        '<div class="enemy-health">' + hpBarHtml + '<div class="enemy-hp-text" id="enemy-hptext-' + e.uid + '">' + Math.max(0, e.hp) + '/' + e.maxHp + '</div></div>' +
        breakBarHtml + window.Game.Systems.affinities(window.Game.Data.getEnemyTemplate(e.templateId), false, e) +
        '<div class="enemy-effects">' + window.Game.SystemsUI.ailments(e.ailments) + window.Game.BattleFX.modifiers(e.debuffs) + '</div>' +
      '</div></div>';
  }

  function renderEnemies(battle) {
    var el = document.getElementById('battle-enemies');
    el.innerHTML = battle.enemies.map(enemyCardHtml).join('');
    el.querySelectorAll('.enemy-name').forEach(function (name) { name.title = name.textContent; });
    if (targetPickCallback) {
      Array.prototype.forEach.call(el.querySelectorAll('.enemy-card.targetable'), function (card) {
        card.setAttribute('role', 'button'); card.tabIndex = 0; card.setAttribute('aria-label', window.Game.Systems.text('เลือกเป้าหมาย ', 'Target ') + card.querySelector('.enemy-name').textContent);
        card.onkeydown = function (event) { if (event.target !== card) return; if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); card.click(); } };
        card.onclick = function (event) {
          if (event && event.target.closest('.status-chip')) return;
          SFX('ui_confirm');
          var uid = card.getAttribute('data-uid');
          var idx = -1;
          battle.enemies.forEach(function (e, i) { if (e.uid === uid) idx = i; });
          var cb = targetPickCallback;
          exitTargetSelect();
          if (idx !== -1) cb(idx);
        };
      });
    }
  }

  function exitTargetSelect() {
    targetPickCallback = null;
    renderEnemies(currentBattle);
    closeSubmenu();
  }

  function enterTargetSelect(cb) {
    var living = currentBattle.enemies.filter(function (e) { return e.alive; });
    if (living.length === 1) {
      var idx = currentBattle.enemies.indexOf(living[0]);
      cb(idx);
      return;
    }
    targetPickCallback = cb;
    setActionsEnabled(false);
    setBattleCue(window.Game.Systems.text('เลือกเป้าหมาย · แตะศัตรู', 'Choose a target · tap an enemy'), null);
    renderEnemies(currentBattle);
    var root = document.getElementById('battle-submenu');
    root.innerHTML = '<div class="submenu-header"><h3>' + T('selectTargetTitle') + '</h3><button class="btn-icon" id="target-cancel">' + I('close') + '</button></div>' +
      '<p class="empty-note">' + T('tapEnemyHint') + '</p>';
    root.classList.remove('hidden');
    var firstTarget = document.querySelector('.enemy-card.targetable');
    if (firstTarget && document.documentElement.classList.contains('kbd-nav')) firstTarget.focus();
    document.getElementById('target-cancel').onclick = function () {
      SFX('ui_cancel');
      exitTargetSelect();
      setActionsEnabled(true);
    };
  }

  // Small icon-chip row for held blessings/curses (reuses .stat-chip, no new CSS) --
  // static for the whole battle like the companion panel, so it's built inline
  // here rather than needing its own repaint hook.
  function blessingBadgesHtml(run) {
    var D = window.Game.Data;
    var chips = (run.blessings || []).map(function (id) {
      var b = D.getBlessing(id);
      return b ? '<span class="stat-chip" title="' + L(b, 'name') + '">' + I(b.icon) + '</span>' : '';
    }).join('') + (run.curses || []).map(function (id) {
      var c = D.getCurse(id);
      return c ? '<span class="stat-chip" title="' + L(c, 'name') + '">' + I(c.icon) + '</span>' : '';
    }).join('');
    return chips ? '<div class="player-name-row">' + chips + '</div>' : '';
  }

  // Status auras around the hero: poison/burn tint and an Overdrive-ready glow.
  function portraitStateClasses(run, focusPct) {
    var c = '';
    (run.ailments || []).forEach(function (a) { if (a.id === 'poison' || a.id === 'burn') c += ' has-' + a.id; });
    if (focusPct >= 100) c += ' overdrive-ready';
    return c;
  }

  // Sparkles + rising light ring around the hero when a level is gained.
  // Points the attack dash at the first living enemy: distance from the hero to
  // just short of that enemy, converted into the zoomed UI's local pixels.
  function aimHeroDash() {
    var hero = document.querySelector('#battle-player-panel .hero-visual');
    var enemy = null;
    if (!hero || !currentBattle) return;
    currentBattle.enemies.some(function (e) { if (e.alive && !enemy) enemy = getEnemyPortraitEl(e.uid); return !!enemy; });
    if (!enemy) return;
    var scale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ui-scale')) || 1;
    var h = hero.getBoundingClientRect(), t = enemy.getBoundingClientRect();
    var dx = (t.left + t.width / 2) - (h.left + h.width / 2) - h.width * 0.45 - t.width * 0.35;
    var dy = (t.top + t.height * 0.75) - (h.top + h.height * 0.5);
    hero.style.setProperty('--dash-x', Math.round(dx / scale) + 'px');
    hero.style.setProperty('--dash-y', Math.round(dy / scale) + 'px');
  }

  function heroLevelUpFx() {
    var el = document.getElementById('screen-battle');
    if (!el) return;
    el.classList.remove('hero-levelup');
    void el.offsetWidth;
    el.classList.add('hero-levelup');
    setTimeout(function () { el.classList.remove('hero-levelup'); }, 2400);
  }

  // Gear tier -> visual band (0 = none). Equipment can't be redrawn on the
  // illustrated class art, so it shows through weapon-trail colour, armour
  // rim light and accessory sparkles instead.
  function gearBand(tier) { return !tier ? 0 : tier <= 2 ? 1 : tier <= 4 ? 2 : tier <= 6 ? 3 : 4; }
  function gearClasses(run) {
    var eq = run.equipment || {}, D = window.Game.Data, c = '';
    function tierOf(id) { var it = id && D.getItem(id); return it ? (it.tier || 1) : 0; }
    var w = gearBand(tierOf(eq.weapon)), a = gearBand(tierOf(eq.armor));
    var acc = (eq.accessory1 ? 1 : 0) + (eq.accessory2 ? 1 : 0);
    if (w) c += ' gear-w' + w;
    if (a) c += ' gear-a' + a;
    if (acc) c += ' gear-acc' + acc;
    return c;
  }

  // Signature mechanic readout (class-mech.js): bullets, stance, corpses/skeletons, form.
  function classGaugeHtml(battle) {
    var g = window.Game.ClassMech.gauge(battle);
    if (!g) return '';
    var info = window.Game.ClassMech.info(battle.run.classId);
    var pips = '';
    if (g.pips) { pips = '<span class="mech-pips" aria-hidden="true">'; for (var i = 0; i < g.pips.max; i++) pips += '<span class="mech-pip' + (i < g.pips.filled ? ' filled' : '') + '"></span>'; pips += '</span>'; }
    return '<div class="class-mech-row' + (g.active ? ' is-active' : '') + '" title="' + String(L(info, 'desc')).replace(/"/g, '&quot;') + '">' + I(g.icon) +
      '<span class="mech-label">' + g.label + '</span>' + pips + '<span class="mech-value">' + g.value + '</span></div>';
  }

  function renderPlayerPanel(battle) {
    var statusHost = document.getElementById('player-ailments');
    if (!statusHost) { statusHost = document.createElement('div'); statusHost.id = 'player-ailments'; document.getElementById('battle-actions').before(statusHost); }
    statusHost.innerHTML = window.Game.SystemsUI.ailments(battle.run.ailments) + window.Game.BattleFX.modifiers(battle.player.buffs);
    var run = battle.run;
    var hpPct = Math.max(0, Math.round(run.hp / battle.player.maxHp * 100));
    var mpPct = Math.max(0, Math.round(run.mp / battle.player.maxMp * 100));
    var focusMax = window.Game.Formulas.FOCUS_MAX;
    var focusPct = Math.min(100, Math.round(battle.player.focus / focusMax * 100));
    var apDots = '';
    for (var i = 0; i < 4; i++) apDots += '<div class="ap-dot' + (i < battle.playerAP ? ' filled' : '') + '"></div>';
    document.getElementById('battle-player-panel').innerHTML =
      '<div class="player-portrait' + portraitStateClasses(run, focusPct) + gearClasses(run) + '">' + window.Game.HeroArt.render(run, battle.player.guarding ? 'is-guarding hero-guard' : '') + '</div>' +
      '<div class="player-bars">' +
        '<div class="player-name-row"><span>' + battle.player.name + '</span><div class="ap-indicator">' + apDots + '</div></div>' +
        '<div class="bar-row">' + I('heart') + '<div class="bar-track"><div class="bar-fill hp" id="player-hp-bar" style="width:' + hpPct + '%"></div></div><span id="player-hp-text">' + run.hp + '/' + battle.player.maxHp + '</span></div>' +
        '<div class="bar-row">' + I('drop') + '<div class="bar-track"><div class="bar-fill mp" id="player-mp-bar" style="width:' + mpPct + '%"></div></div><span id="player-mp-text">' + run.mp + '/' + battle.player.maxMp + '</span></div>' +
        '<div class="bar-row">' + I('star') + '<div class="bar-track"><div class="bar-fill focus' + (focusPct >= 100 ? ' full' : '') + '" id="player-focus-bar" style="width:' + focusPct + '%"></div></div></div>' +
        classGaugeHtml(battle) +
        blessingBadgesHtml(run) + window.Game.WorkshopUI.battleBadges(run,battle) +
      '</div>';
  }

  // Static for the whole battle (the companion has no HP bar -- it's never a
  // valid enemy target, see battle-engine.js's runCompanionPhase comment) so this
  // only needs to run once at battle start and on a language toggle, unlike
  // renderPlayerPanel which repaints after every event.
  function renderCompanionPanel(battle) {
    var ally = document.getElementById('battle-story-ally');
    if (!ally) { ally = document.createElement('div'); ally.id = 'battle-story-ally'; document.getElementById('battle-companion-panel').before(ally); }
    var support = window.Game.Story.supportRounds(battle.run);
    ally.innerHTML = support && battle.enemies.some(function (e) { return e.isBoss; }) ? '<div class="story-battle-ally">' + I(support >= 5 ? 'npcOrinStandard' : 'npcOrin') + '<span>' + window.Game.Systems.text('คำสัตย์ของโอริน · ช่วย ', 'Orin’s oath · aids ') + support + window.Game.Systems.text(' รอบแรก', ' opening rounds') + '</span></div>' : '';
    var el = document.getElementById('battle-companion-panel');
    if (!battle.companion) { el.innerHTML = ''; return; }
    var comp = battle.companion;
    el.innerHTML =
      '<div class="companion-portrait">' + I(comp.icon) + '</div>' +
      '<div class="companion-info"><div class="companion-name">' + comp.name + '</div>' +
      '<div class="companion-role">' + T('companionRole' + comp.def.role.charAt(0).toUpperCase() + comp.def.role.slice(1)) + '</div></div>';
  }

  var cueActor = 'player';
  function renderTurnOrder(battle) {
    // Re-apply whoever the cue last named, so redrawing the chips never loses the highlight.
    var chips = '<div class="turn-chip is-player' + (cueActor === 'player' ? ' active' : '') + '" data-actor="player" title="' + battle.player.name + '">' + I('phys') + '</div>';
    battle.enemies.forEach(function (e) {
      if (!e.alive) return;
      chips += '<div class="turn-chip is-enemy' + (cueActor === e.uid ? ' active' : '') + '" data-actor="' + e.uid + '" title="' + e.name + '">' + I(e.isBoss ? 'crownSkull' : 'skull') + '</div>';
    });
    document.getElementById('battle-turn-order').innerHTML = chips;
  }

  function setBattleCue(text, actor) {
    var cue = document.getElementById('battle-state-cue');
    if (!cue) { cue = document.createElement('div'); cue.id = 'battle-state-cue'; cue.setAttribute('role', 'status'); cue.setAttribute('aria-live', 'polite'); document.getElementById('battle-turn-order').after(cue); }
    cue.textContent = text;
    cueActor = actor;
    document.querySelectorAll('.enemy-card').forEach(function (card) { card.classList.toggle('is-acting', card.dataset.uid === actor); });
    document.querySelectorAll('.turn-chip').forEach(function (chip) { chip.classList.toggle('active', chip.dataset.actor === actor); });
  }

  function closeSubmenu() {
    var root = document.getElementById('battle-submenu');
    root.classList.add('hidden');
    root.innerHTML = '';
    document.querySelectorAll('#battle-actions button').forEach(function (button) { button.classList.remove('is-selected'); button.setAttribute('aria-expanded', 'false'); });
  }

  // "4 MP", "12 HP", "2 bullets" lines for the skill menu (a cost-free command reads "Free").
  function costLabel(cost) {
    var parts = [];
    if (cost.mp > 0) parts.push(cost.mp + ' MP');
    if (cost.hp > 0) parts.push(cost.hp + ' HP');
    if (cost.ammo > 0) parts.push(cost.ammo + window.Game.Systems.text(' นัด', cost.ammo > 1 ? ' bullets' : ' bullet'));
    if (cost.res && cost.res.amount > 0) parts.push(cost.res.amount + ' ' + window.Game.Systems.text(cost.res.th, cost.res.en));
    return parts.length ? parts.join('<br>') : T('freeLabel');
  }

  // New skills, rank-ups and the next unlock after a level-up (see State.levelUpNews).
  function logLevelUpNews(lvlRes) {
    var run = window.Game.State.current;
    if (!run || lvlRes.from == null) return;
    var news = window.Game.State.levelUpNews(run, lvlRes.from);
    news.learned.forEach(function (sk) { logLine(T('logNewSkill', { name: L(sk, 'name') }), 'log-crit'); });
    news.ranked.forEach(function (r) { logLine(T('logSkillRank', { name: L(r.skill, 'name'), rank: RANK_NAMES[r.rank] }), 'log-heal'); });
    if (news.learned.length && news.next) logLine(T('logNextSkill', { name: L(news.next, 'name'), level: news.next.minLevel }), '');
    if (news.learned.length) showToast(T('logNewSkill', { name: L(news.learned[0], 'name') }), '');
  }
  // Unassigned attribute points: a log line now, and a toast once the level-up fanfare has played.
  function remindAttrPoints() {
    var left = window.Game.Attributes.unspent(window.Game.State.current);
    if (!left) return;
    logLine(T('logAttrPoints', { n: left }), 'log-heal');
    battleLater(function () { showToast(T('toastAttrPoints', { n: left }), ''); }, 1600 / window.Game.SystemsUI.speed());
  }
  var RANK_NAMES = ['', 'I', 'II', 'III'];
  function rankTag(skill, level) {
    var D = window.Game.Data, r = D.skillRank(skill, level);
    if (!r) return '';
    var next = D.nextRankLevel(skill, level);
    var tip = window.Game.Systems.text('แรงค์ ' + RANK_NAMES[r] + ' (พลัง x' + D.RANK_MULT[r - 1] + ')' + (next ? ' · แรงค์ถัดไปที่ Lv ' + next : ' · แรงค์สูงสุด'), 'Rank ' + RANK_NAMES[r] + ' (power x' + D.RANK_MULT[r - 1] + ')' + (next ? ' · next rank at Lv ' + next : ' · max rank'));
    return ' <span class="rank-tag rank-' + r + '" data-tip="' + tip + '">' + RANK_NAMES[r] + '</span>';
  }

  function openSkillMenu() {
    closeSubmenu();
    var command = document.getElementById('act-skill'); command.classList.add('is-selected'); command.setAttribute('aria-expanded', 'true');
    var battle = currentBattle;
    window.Game.Micro.ensure(battle.run);
    var favorites = window.Game.Systems.ensure(battle.run).favoriteSkills;
    // Class commands first, then pinned favourites.
    var skills = battle.player.skills.filter(function (s) { return s.id !== 'attack'; }).sort(function (a, b) { return Number(b.kind === 'mech') - Number(a.kind === 'mech') || Number(favorites.indexOf(b.id) !== -1) - Number(favorites.indexOf(a.id) !== -1); });
    var root = document.getElementById('battle-submenu');
    var itemsHtml = skills.length ? skills.map(function (s) {
      // Cost and availability come from the engine, so the menu can never disagree with what a cast does.
      var cost = window.Game.BattleEngine.skillCost(battle, s);
      var reason = window.Game.BattleEngine.skillBlockReason(battle, s) || '';
      var disabled = !!reason;
      return '<div class="skill-row"><button type="button" class="skill-favorite" data-favorite="' + s.id + '" aria-pressed="' + (favorites.indexOf(s.id) !== -1) + '" aria-label="' + window.Game.Systems.text('ปักหมุดทักษะ', 'Pin skill') + '">' + (favorites.indexOf(s.id) !== -1 ? '★' : '☆') + '</button><button class="submenu-option" ' + (disabled ? 'disabled' : '') + ' data-id="' + s.id + '">' +
        '<div class="submenu-option-icon">' + I(s.icon) + '</div>' +
        '<div class="submenu-option-info"><div class="submenu-option-name">' + L(s, 'name') + rankTag(s, battle.run.level) + (window.Game.Micro.seen(battle.run,'skills',s.id)?'':window.Game.Micro.badge()) + ' <span class="el-tag el-' + s.element + '">' + EN(s.element) + '</span></div><div class="submenu-option-desc">' + L(s, 'desc') + '</div>' + (reason ? '<small class="action-unavailable">' + reason + '</small>' : '') + '</div>' +
        '<div class="submenu-option-cost">' + costLabel(cost) + '</div>' +
      '</button></div>';
    }).join('') : '<p class="empty-note">' + T('noMoreSkills') + '</p>';
    root.innerHTML = '<div class="submenu-header"><h3>' + T('selectSkillTitle') + '</h3><button class="btn-icon" id="submenu-close">' + I('close') + '</button></div>' +
      '<div class="submenu-list">' + itemsHtml + '</div>';
    root.classList.remove('hidden');
    window.Game.Micro.markAll(battle.run,'skills',skills.map(function(s){return s.id;}));
    root.scrollTop = 0;
    root.querySelectorAll('[data-favorite]').forEach(function (button) { button.onclick = function () {
      var id = button.dataset.favorite, index = favorites.indexOf(id);
      if (index === -1) favorites.push(id); else favorites.splice(index, 1);
      window.Game.State.saveNow(); openSkillMenu();
    }; });
    document.getElementById('submenu-close').onclick = function () { SFX('ui_cancel'); closeSubmenu(); };
    Array.prototype.forEach.call(root.querySelectorAll('.submenu-option:not([disabled])'), function (btn) {
      btn.onclick = function () {
        var skill = window.Game.Data.getSkill(btn.getAttribute('data-id'));
        closeSubmenu();
        if (skill.target === 'singleEnemy') {
          enterTargetSelect(function (idx) { doAction({ kind: 'skill', skillId: skill.id, targetIndex: idx }); });
        } else {
          doAction({ kind: 'skill', skillId: skill.id });
        }
      };
    });
  }

  function openItemMenu() {
    closeSubmenu();
    var command = document.getElementById('act-item'); command.classList.add('is-selected'); command.setAttribute('aria-expanded', 'true');
    var battle = currentBattle, run = battle.run, D = window.Game.Data;
    var usable = Object.keys(run.inventory).map(function (id) { return D.getItem(id); }).filter(function (it) { return it && it.battleUsable; });
    var root = document.getElementById('battle-submenu');
    var itemsHtml = usable.length ? usable.map(function (it) {
      return '<button class="submenu-option" data-id="' + it.id + '">' +
        '<div class="submenu-option-icon">' + window.Game.Icons.item(it) + '</div>' +
        '<div class="submenu-option-info"><div class="submenu-option-name">' + L(it, 'name') + '</div><div class="submenu-option-desc">' + L(it, 'desc') + '</div></div>' +
        '<div class="submenu-option-cost">x' + run.inventory[it.id] + '</div>' +
      '</button>';
    }).join('') : '<p class="empty-note">' + T('noUsableItems') + '</p>';
    root.innerHTML = '<div class="submenu-header"><h3>' + T('useItemTitle') + '</h3><button class="btn-icon" id="submenu-close">' + I('close') + '</button></div><div class="submenu-list">' + itemsHtml + '</div>';
    root.classList.remove('hidden');
    document.getElementById('submenu-close').onclick = function () { SFX('ui_cancel'); closeSubmenu(); };
    Array.prototype.forEach.call(root.querySelectorAll('.submenu-option'), function (btn) {
      btn.onclick = function () {
        var id = btn.getAttribute('data-id');
        closeSubmenu();
        doAction({ kind: 'item', itemId: id });
      };
    });
  }

  // The Overdrive button is always in the DOM (rendered once, like the other
  // four) but only meant to be clickable once Focus is full -- setActionsEnabled
  // is the one chokepoint every "give control back to the player" path already
  // runs through, so correcting its disabled state here (after the blanket
  // enable/disable above) can't be forgotten at some call site.
  // Start-of-turn snapshot (battle + run) so a page refresh can resume the fight.
  function snapshotBattle() {
    var b = currentBattle, copy = {};
    Object.keys(b).forEach(function (k) { if (k !== 'run') copy[k] = b[k]; });
    window.Game.Main.saveBattleView({ battle: copy, run: b.run, floor: currentFloor, isBoss: currentIsBoss, isReplay: currentIsReplay });
  }

  // Rebuilds the battle screen from a snapshot, on the player's turn.
  function restoreBattle(snap) {
    var b = snap.battle;
    b.run = window.Game.State.current;
    currentBattle = b; currentMode = 'tower';
    currentFloor = snap.floor; currentIsBoss = !!snap.isBoss; currentIsReplay = !!snap.isReplay;
    targetPickCallback = null;
    applyBattleAmbience(currentFloor, currentIsBoss);
    document.getElementById('battle-floor-label').textContent =
      (currentIsBoss ? T('bossFloorTitle') : (T('floorLabel') + currentFloor)) + (currentIsReplay ? T('replaySuffix') : '');
    document.getElementById('battle-home').innerHTML = I('home');
    document.getElementById('battle-home').onclick = confirmLeaveBattle;
    beginBattleScreen(true);
  }

  function setActionsEnabled(enabled) {
    enabled = !!enabled && !document.getElementById('battle-entrance');
    setBattleCue(window.Game.Systems.text(enabled ? 'ตาของคุณ · เลือกคำสั่ง' : currentBattle && currentBattle.over ? 'การต่อสู้สิ้นสุด' : 'กำลังดำเนินการ…', enabled ? 'Your turn · choose a command' : currentBattle && currentBattle.over ? 'Battle finished' : 'Resolving…'), enabled ? 'player' : null);
    document.getElementById('battle-home').disabled = !!(currentBattle && currentBattle.over);
    var battleScreen = document.getElementById('screen-battle');
    if (battleScreen) {
      battleScreen.classList.toggle('player-turn', !!enabled);
      battleScreen.classList.toggle('player-waiting', !enabled && !!(currentBattle && !currentBattle.over));
    }
    if (enabled && currentBattle && !currentBattle.over && currentMode === 'tower') snapshotBattle();
    else if (currentBattle && currentBattle.over) window.Game.Main.clearBattleView();
    Array.prototype.forEach.call(document.querySelectorAll('#battle-actions button'), function (b) { b.disabled = !enabled; });
    var mpLabel = document.getElementById('skill-mp');
    if (mpLabel && currentBattle) mpLabel.textContent = currentBattle.run.mp + ' MP';
    var od = document.getElementById('act-overdrive');
    if (od && enabled) od.disabled = !currentBattle || currentBattle.player.focus < window.Game.Formulas.FOCUS_MAX;
    if (od) od.title = od.disabled ? window.Game.Systems.text('ต้องมี Focus เต็ม', 'Requires full Focus') : T('overdriveLabel');
    if (enabled) refreshDuoButton(); else { var db = document.getElementById('act-duo'); if (db) db.disabled = true; }
  }

  // The Duo Move command: only shown when a bonded companion is at your side.
  function duoButtonHtml() {
    var duo = currentBattle && window.Game.Bond.duoFor(currentBattle);
    if (!duo) return '';
    return '<button class="btn-secondary btn-duo" id="act-duo" disabled>' + I('duo' + { attacker: 'Strike', healer: 'Heal', guardian: 'Guard', buffer: 'Boost' }[duo.role]) + '<span>' + T('duoLabel') + '</span></button>';
  }

  function refreshDuoButton() {
    var btn = document.getElementById('act-duo');
    if (!btn) return;
    var duo = window.Game.Bond.duoFor(currentBattle);
    btn.disabled = !duo || !duo.ready;
    btn.title = !duo ? '' : duo.locked ? T('duoLockedHint') : duo.used ? T('duoUsedHint') : duo.snared ? T('duoSnaredHint') : duo.name;
    btn.classList.toggle('is-locked', !!(duo && (duo.locked || duo.used)));
  }

  function renderActions() {
    var el = document.getElementById('battle-actions');
    el.innerHTML =
      '<button class="btn-primary" id="act-attack">' + I('swordAttack') + '<span>' + T('attackLabel') + '</span></button>' +
      '<button class="btn-secondary" id="act-skill">' + I('magicBurst') + '<span>' + T('skillsLabel') + '</span><small id="skill-mp" class="command-meta"></small></button>' +
      '<button class="btn-secondary" id="act-guard">' + I('shieldGuard') + '<span>' + T('guardLabel') + '</span></button>' +
      '<button class="btn-secondary" id="act-item">' + I('bagItem') + '<span>' + T('itemsLabel') + '</span></button>' +
      '<button class="btn-secondary btn-overdrive" id="act-overdrive" disabled>' + I('sparkles') + '<span>' + T('overdriveLabel') + '</span></button>' +
      duoButtonHtml();
    var duoBtn = document.getElementById('act-duo');
    if (duoBtn) duoBtn.onclick = function () {
      var duo = window.Game.Bond.duoFor(currentBattle);
      if (!duo || !duo.ready) return;
      closeSubmenu();
      if (duo.needsTarget) enterTargetSelect(function (idx) { doAction({ kind: 'duo', targetIndex: idx }); });
      else doAction({ kind: 'duo' });
    };
    document.getElementById('act-attack').onclick = function () {
      closeSubmenu();
      enterTargetSelect(function (idx) { doAction({ kind: 'attack', targetIndex: idx }); });
    };
    document.getElementById('act-skill').onclick = function () { SFX('ui_confirm'); openSkillMenu(); };
    document.getElementById('act-guard').onclick = function () { doAction({ kind: 'guard' }); };
    document.getElementById('act-item').onclick = function () { SFX('ui_confirm'); openItemMenu(); };
    document.getElementById('act-overdrive').onclick = function () {
      closeSubmenu();
      enterTargetSelect(function (idx) { doAction({ kind: 'overdrive', targetIndex: idx }); });
    };
  }

  function doAction(action) {
    var battle = currentBattle;
    if (document.getElementById('battle-entrance') || !battle || battle.over || battle.playerAP <= 0 || battle.awaitingAllOut) return;
    closeSubmenu();
    setActionsEnabled(false);
    var result = window.Game.BattleEngine.playerAction(battle, action);
    playEvents(result.events, function () { afterPlayerAction(); });
  }

  function afterPlayerAction() {
    var battle = currentBattle;
    renderPlayerPanel(battle);
    renderEnemies(battle);
    renderTurnOrder(battle);
    if (battle.over) { handleBattleEnd(battle); return; }
    if (battle.awaitingAllOut) { showAllOutModal(); return; }
    if (battle.playerAP > 0) {
      setActionsEnabled(true);
    } else {
      battleLater(function () {
        var resC = window.Game.BattleEngine.runCompanionPhase(battle);
        playEvents(resC.events, function () {
          renderPlayerPanel(battle);
          renderEnemies(battle);
          if (battle.over) { handleBattleEnd(battle); return; }
          var res2 = window.Game.BattleEngine.runEnemyPhase(battle);
          playEvents(res2.events, function () { afterEnemyPhase(); });
        });
      }, 500 / window.Game.SystemsUI.speed());
    }
  }

  function afterEnemyPhase() {
    var battle = currentBattle;
    renderPlayerPanel(battle);
    renderEnemies(battle);
    renderTurnOrder(battle);
    if (battle.over) { handleBattleEnd(battle); return; }
    setActionsEnabled(true);
  }

  function showAllOutModal() {
    var battle = currentBattle;
    var root = document.getElementById('allout-modal');
    root.innerHTML = '<div class="modal-box allout-box">' +
      '<div class="allout-icon">' + I('sparkles') + '</div>' +
      '<h3>' + T('allOutTitle') + '</h3>' +
      '<p class="note">' + T('allOutDesc') + '</p>' +
      '<div class="modal-actions"><button class="btn-ghost" id="allout-decline">' + T('allOutContinue') + '</button><button class="btn-primary" id="allout-confirm">' + T('allOutConfirm') + '</button></div>' +
    '</div>';
    root.classList.remove('hidden');
    document.getElementById('allout-confirm').onclick = function () {
      root.classList.add('hidden'); root.innerHTML = '';
      var res = window.Game.BattleEngine.confirmAllOut(battle, true);
      playEvents(res.events, function () { afterPlayerAction(); });
    };
    document.getElementById('allout-decline').onclick = function () {
      root.classList.add('hidden'); root.innerHTML = '';
      var res = window.Game.BattleEngine.confirmAllOut(battle, false);
      playEvents(res.events, function () { afterPlayerAction(); });
    };
  }

  function handleBattleEnd(battle) {
    var leave = document.getElementById('leave-confirm');
    if (leave) { var modal = document.getElementById('modal-root'); modal.classList.add('hidden'); modal.innerHTML = ''; }
    setActionsEnabled(false);
    closeSubmenu();
    var endScreen = document.getElementById('screen-battle');
    if (endScreen) {
      endScreen.classList.remove('battle-won', 'battle-lost');
      endScreen.classList.add(battle.victory ? 'battle-won' : 'battle-lost');
    }
    if (currentMode === 'survival') { handleSurvivalWaveEnd(battle); return; }
    if (window.Game.Audio) window.Game.Audio.stopMusic();
    if (battle.victory) handleVictory(battle); else handleDefeat(battle);
  }

  function handleVictory(battle) {
    var run = window.Game.State.current;
    window.Game.State.clearBattleMark(run);
    window.Game.Workshop.recordClear(run,battle,currentIsReplay);
    if (!currentIsReplay) window.Game.Mastery.recordClear(run, battle.floor);
    // Replaying an already-cleared floor still pays out EXP/gold/materials,
    // just at 40% of a first clear's rate, and Nightmare's own rewardMult
    // (Formulas.DIFFICULTY.nightmare) always applies on top.
    // Blessings/curses and the Ascension reward bonus each compose their own
    // per-kind multiplier via State.getRewardMult (see state.js) on top of this
    // base rate -- gold and EXP can differ (e.g. Wealth only touches gold).
    var diff = window.Game.Formulas.DIFFICULTY[run.difficulty] || window.Game.Formulas.DIFFICULTY.normal;
    var baseRate = (currentIsReplay ? 0.4 : 1) * diff.rewardMult;
    var rateExp = baseRate * window.Game.State.getRewardMult(run, 'exp');
    var rateGold = baseRate * window.Game.State.getRewardMult(run, 'gold');
    var routeModifiers = window.Game.Systems.route(run, battle.floor);
    var rateMat = baseRate * window.Game.State.getRewardMult(run, 'material') * (routeModifiers ? routeModifiers.rewards : 1);
    var exp = window.Game.BattleEngine.getExpReward(battle, rateExp);
    var gold = window.Game.BattleEngine.getGoldReward(battle, rateGold);
    // Flawless Victor achievement: the floor-100 final boss only (battle.isBoss is
    // true only for that fight, see createBattle), won without HP ever having
    // dropped below max at the moment of victory.
    if (battle.isBoss && battle.run.hp === battle.player.maxHp) {
      window.Game.State.setAchievementFlag('flawlessVictor');
    }
    var lvlRes = window.Game.State.addExp(run, exp);
    window.Game.State.addGold(run, gold);
    window.Game.State.recordBattleWon(run);
    window.Game.State.recordEnemiesDefeated(run, battle.enemies.length);
    SFX('victory');
    logLine(T('logExpGained', { exp: exp }), 'log-heal');
    logLine(T('logGoldGained', { gold: gold }), 'log-heal');
    var drops = window.Game.BattleEngine.getMaterialDrops(battle, rateMat);
    var chosenRoute = window.Game.Systems.route(run, battle.floor);
    if (!currentIsReplay && battle.floor % 5 === 0 && chosenRoute && chosenRoute.id === 'explore') {
      var materials = window.Game.Data.items.filter(function (it) { return it.kind === 'material' && it.tier === Math.min(9, window.Game.Formulas.tierForFloor(battle.floor)); });
      if (materials.length) drops.push({ id: materials[Math.floor(battle.floor / 5) % materials.length], qty: 3 });
    }
    drops.forEach(function (d) {
      window.Game.State.addItem(run, d.id, d.qty);
      var mat = window.Game.Data.getItem(d.id);
      logLine(T('logMaterialGained', { name: L(mat, 'name'), qty: d.qty }), 'log-heal');
    });
    var bondResult = currentIsReplay ? null : window.Game.Bond.award(run, battle);
    if (bondResult) {
      var bondComp = window.Game.Data.getCompanion(bondResult.id);
      logLine(T('bondGainLog', { companion: L(bondComp, 'name'), gain: bondResult.gained }), 'log-heal');
      if (bondResult.leveled) battleLater(function () { window.Game.BondUI.showLevelUp(bondResult); }, 900 / window.Game.SystemsUI.speed());
    }
    if (lvlRes.leveledUp) {
      logLine(T('logLevelUp', { level: lvlRes.level }), 'log-crit'); logLevelUpNews(lvlRes); remindAttrPoints();
      battleLater(function () { SFX('level_up'); heroLevelUpFx(); }, 450 / window.Game.SystemsUI.speed());
    }
    if (currentIsReplay) {
      // Replaying an already-cleared floor: no floor advance, no reward pick,
      // and never re-trigger the end-game screen even for a repeat boss kill.
      window.Game.State.saveNow();
      battleLater(function () {
        window.Game.TowerUI.renderTower();
        window.Game.UI.showScreen('screen-tower');
      }, 1400 / window.Game.SystemsUI.speed());
    } else if (battle.isBoss) {
      battleLater(function () {
        window.Game.MenuUI.renderStory('ending', function () { window.Game.Main.showEnd(true); });
        window.Game.UI.showScreen('screen-story');
      }, 1400 / window.Game.SystemsUI.speed());
    } else {
      window.Game.TowerUI.queueReward(battle.floor);
      battleLater(function () {
        window.Game.TowerUI.renderReward(battle.floor);
        window.Game.UI.showScreen('screen-reward');
      }, 1400 / window.Game.SystemsUI.speed());
    }
  }

  function handleDefeat() {
    SFX('defeat');
    // Replaying a cleared floor is farming, not progress: losing there costs the retreat gold
    // and leaves you at 1 HP instead of ending the whole run.
    if (currentIsReplay) {
      var run = window.Game.State.current;
      var lost = window.Game.State.settleRetreat(run);
      run.hp = 1;
      window.Game.State.clampVitals(run);
      window.Game.State.saveNow();
      battleLater(function () {
        window.Game.TowerUI.renderTower();
        window.Game.UI.showScreen('screen-tower');
        window.Game.UI.notice(T('retreatNotice', { gold: lost }), 'warn');
      }, 1400 / window.Game.SystemsUI.speed());
      return;
    }
    battleLater(function () { window.Game.Main.showEnd(false); }, 1400 / window.Game.SystemsUI.speed());
  }

  function leaveBattle() {
    if (currentBattle && currentBattle.over) return;
    cancelPlayback();
    setActionsEnabled(false);
    closeSubmenu();
    if (window.Game.Audio) window.Game.Audio.stopMusic();
    var wasTower = currentMode === 'tower';
    currentBattle = null;
    targetPickCallback = null;
    // Walking away from a tower fight costs gold (see State.settleRetreat).
    var run = window.Game.State.current;
    var lost = wasTower && run && run.battleMark != null ? window.Game.State.settleRetreat(run) : -1;
    window.Game.State.saveNow();
    window.Game.TowerUI.renderTower();
    window.Game.UI.showScreen('screen-tower');
    if (lost >= 0) window.Game.UI.notice(T('retreatNotice', { gold: lost }), 'warn');
  }

  function confirmLeaveBattle() {
    if (!currentBattle || currentBattle.over) return;
    SFX('ui_confirm');
    var root = document.getElementById('modal-root');
    root.innerHTML = '<div class="modal-box"><h3>' + T('leaveBattleTitle') + '</h3>' +
      '<p class="note">' + (currentMode === 'tower' ? T('leaveBattleMsg', { gold: window.Game.State.retreatCost(window.Game.State.current) }) : T('leaveArenaMsg')) + '</p>' +
      '<div class="modal-actions"><button class="btn-ghost" id="leave-cancel">' + T('keepFighting') + '</button><button class="btn-danger" id="leave-confirm">' + T('returnToTower') + '</button></div></div>';
    root.classList.remove('hidden');
    document.getElementById('leave-cancel').onclick = function () {
      SFX('ui_cancel');
      root.classList.add('hidden');
      root.innerHTML = '';
    };
    document.getElementById('leave-confirm').onclick = function () {
      SFX('ui_back');
      root.classList.add('hidden');
      root.innerHTML = '';
      leaveBattle();
    };
  }

  // Each zone has its own enclosed tower interior; the final floor uses the throne room.
  var AMBIENCE_TIER_CLASSES = ['battle-tier-1', 'battle-tier-2', 'battle-tier-3', 'battle-tier-4', 'battle-tier-5',
    'battle-tier-6', 'battle-tier-7', 'battle-tier-8', 'battle-tier-9', 'battle-tier-10',
    'battle-tier-11', 'battle-tier-12', 'battle-tier-13', 'battle-tier-14', 'battle-tier-15', 'battle-tier-16'];

  function applyBattleAmbience(floor, isBoss) {
    var screenEl = document.getElementById('screen-battle');
    screenEl.classList.remove.apply(screenEl.classList, AMBIENCE_TIER_CLASSES.concat('battle-boss-throne'));
    var backdrop = screenEl.querySelector('.battle-backdrop');
    var props = document.getElementById('battle-zone-props');
    if (!props && backdrop) { props = document.createElement('div'); props.id = 'battle-zone-props'; backdrop.appendChild(props); }
    var tierIndex = Math.min(15, Math.max(0, window.Game.Formulas.tierForFloor(floor) - 1));
    window.Game.BattleScenes.apply(backdrop, tierIndex + 1, isBoss);
    if (props) { props.innerHTML = window.Game.BattleArt.zone(tierIndex + 1, isBoss); props.dataset.zone = tierIndex; }
    var silhouette = document.getElementById('battle-boss-silhouette');
    if (isBoss) {
      screenEl.classList.add('battle-boss-throne');
      if (silhouette) silhouette.innerHTML = window.Game.BattleArt.enemy(window.Game.Data.boss);
    } else {
      if (silhouette) silhouette.innerHTML = '';
      var tier = window.Game.Formulas.tierForFloor(floor);
      if (floor >= 40 && tier < 5) tier = 5; // floor-40 miniboss previews the deep-tower mood
      screenEl.classList.add('battle-tier-' + tier);
    }
  }

  // Shared tail for both startBattle and startSurvivalWave: everything from here
  // on only cares about currentBattle's generic shape (enemies/player/AP/etc),
  // not which mode produced it.
  // Desktop hero placement: the hero stands at the left edge of the arena, just above the lower
  // block. Size and position come from the space that is actually free (height under the top bar,
  // width left of the first enemy) so tall UI states or large enemy groups can never put the hero
  // on top of the HUD or the enemies. Mobile keeps the hero inside its panel (no fitting needed).
  var heroFitQueued = false, heroFitInstalled = false;
  // If the enemy group is taller than the arena it was given (short windows, companion panel, long
  // log, big groups) the cards spill over the HUD. Shrink the whole group to what actually fits.
  function fitEnemies() {
    var box = document.getElementById('battle-enemies');
    if (!box) return;
    box.style.zoom = '';
    var cards = box.querySelectorAll('.enemy-card');
    box.classList.toggle('crowded', cards.length >= 4);   // lets CSS narrow the cards so a big group keeps a bigger zoom
    if (!cards.length || box.clientHeight < 8) return;
    var hud = [], top = document.querySelector('#screen-battle .battle-topbar');
    if (top) hud = Array.prototype.slice.call(top.querySelectorAll('#battle-home, #battle-floor-label, #battle-turn-order'));
    function fits() {
      var br = box.getBoundingClientRect();
      for (var i = 0; i < cards.length; i++) {
        var r = cards[i].getBoundingClientRect();
        if (r.width < 1) continue;
        if (r.top < br.top - 1 || r.bottom > br.bottom + 1) return false;
        for (var j = 0; j < hud.length; j++) {
          var h = hud[j].getBoundingClientRect();
          if (h.width > 1 && Math.min(r.right, h.right) - Math.max(r.left, h.left) > 2 && Math.min(r.bottom, h.bottom) - Math.max(r.top, h.top) > 2) return false;
        }
      }
      return true;
    }
    // Zooming re-flows the wrap, so walk down until the whole group really fits.
    for (var z = 0.95; z >= 0.3; z -= 0.05) {
      if (fits()) return;
      box.style.zoom = String(Math.round(z * 100) / 100);
    }
  }
  function fitHero() {
    var screen = document.getElementById('screen-battle');
    if (!screen) return;
    fitEnemies();
    var lower = screen.querySelector('.battle-lower'), top = screen.querySelector('.battle-topbar');
    if (document.documentElement.classList.contains('is-mobile') || !lower || !top || !screen.classList.contains('active')) {
      screen.style.removeProperty('--hero-size'); screen.style.removeProperty('--hero-left'); return;
    }
    var lr = lower.getBoundingClientRect(), tr = top.getBoundingClientRect();
    var base = window.innerWidth <= 1250 ? 195 : 286, margin = 8;
    var freeH = lr.top - 4 - (tr.bottom + 4);
    var freeW = base, cards = screen.querySelectorAll('#battle-enemies .enemy-card');
    for (var i = 0; i < cards.length; i++) {
      var r = cards[i].getBoundingClientRect();
      if (r.width > 1 && r.height > 1) freeW = Math.min(freeW, r.left - margin - 4);
    }
    var size = Math.max(72, Math.min(base, freeH, freeW));
    screen.style.setProperty('--hero-size', Math.floor(size) + 'px');
    // Wide landscape: two stage zones. The hero is centred in the left zone (monsters get the right).
    var left = margin;
    if (window.matchMedia('(min-width: 900px) and (min-aspect-ratio: 1/1)').matches) left = Math.max(margin, window.innerWidth * 0.24 - size / 2);
    screen.style.setProperty('--hero-left', Math.round(left - lr.left) + 'px');
  }
  function queueHeroFit() {
    if (heroFitQueued) return;
    heroFitQueued = true;
    requestAnimationFrame(function () { heroFitQueued = false; fitHero(); });
  }
  function installHeroFit() {
    if (heroFitInstalled) return;
    heroFitInstalled = true;
    window.addEventListener('resize', queueHeroFit);
    var screen = document.getElementById('screen-battle');
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(queueHeroFit);
      ro.observe(screen.querySelector('.battle-lower')); ro.observe(screen); ro.observe(screen.querySelector('.battle-topbar'));
    }
    if (window.MutationObserver) {
      new MutationObserver(queueHeroFit).observe(document.getElementById('battle-enemies'), { childList: true });
      new MutationObserver(queueHeroFit).observe(screen, { attributes: true, attributeFilter: ['class'] });
    }
    document.addEventListener('toggle', queueHeroFit, true);
  }

  function beginBattleScreen(resume) {
    cancelPlayback();
    var resetScreen = document.getElementById('screen-battle');
    if (resetScreen) resetScreen.classList.remove('battle-won', 'battle-lost', 'hero-levelup');
    window.Game.SystemsUI.speedControl();
    document.getElementById('battle-log').innerHTML = '';recentHistory=[];var historyPanel=document.getElementById('battle-recent-history');if(!historyPanel){historyPanel=document.createElement('details');historyPanel.id='battle-recent-history';historyPanel.className='micro-history';document.getElementById('battle-log').after(historyPanel);}historyPanel.innerHTML='<summary>'+I('microHistory')+window.Game.Systems.text('การกระทำล่าสุด 10 รายการ','Last 10 actions')+'</summary><ol></ol>';
    window.Game.UI.showScreen('screen-battle');
    if (window.Game.Audio) window.Game.Audio.playBattleMusic(currentIsBoss);
    if (!resume) startIntro();
    renderEnemies(currentBattle);
    if (!resume) Array.prototype.forEach.call(document.querySelectorAll('#battle-enemies .enemy-portrait'), function (portrait, index) {
      var entering = motionOf(portrait);
      if (entering !== 'float' && entering !== 'flap') battleLater(function () { spawnPuffs(portrait, portrait.closest('.boss') ? 8 : 4); }, (1150 + index * 140) / window.Game.SystemsUI.speed());
    });
    renderPlayerPanel(currentBattle);
    renderCompanionPanel(currentBattle);
    renderTurnOrder(currentBattle);
    renderActions();
    installHeroFit(); fitHero();
    setActionsEnabled(false);
    // Always seed the log with an intro line -- otherwise the panel sits
    // completely blank until the first action resolves, which reads as a
    // rendering glitch rather than an empty dialogue box.
    if (resume) {
      logLine(window.Game.Systems.text('กลับเข้าสู่การต่อสู้', 'Battle resumed'), 'log-new');
      setActionsEnabled(!currentBattle.over && currentBattle.playerAP > 0 && !currentBattle.awaitingAllOut);
      return;
    }
    if (currentBattle.enemies.length === 1) {
      logLine(T('logBattleStart', { name: currentBattle.enemies[0].name }), 'log-new');
    } else {
      logLine(T('logBattleStartMulti'), 'log-new');
    }
    var boss = currentBattle.enemies.find(function (enemy) { return enemy.isBoss; });
    var entrance = document.createElement('div');
    entrance.id = 'battle-entrance'; entrance.className = boss ? 'battle-entrance boss-entrance' : 'battle-entrance';
    entrance.setAttribute('role', 'status');
    entrance.textContent = boss ? boss.name : document.getElementById('battle-floor-label').textContent;
    resetScreen.appendChild(entrance);
    if (boss) { SFX('boss_phase'); shakeScreen(true); battleLater(function () { camera('slam', 1300); shakeScreen(true); }, 1050 / window.Game.SystemsUI.speed()); }
    else SFX('ui_confirm');
    battleLater(function () { entrance.remove(); }, 1400 / window.Game.SystemsUI.speed());
    battleLater(function () {
      if (currentBattle.pendingFirstStrike) {
        logLine(T('logFirstStrike'), 'log-weak');
        battleLater(function () {
          var battle = currentBattle;
          var resC = window.Game.BattleEngine.runCompanionPhase(battle);
          playEvents(resC.events, function () {
            renderPlayerPanel(battle);
            renderEnemies(battle);
            if (battle.over) { handleBattleEnd(battle); return; }
            var res2 = window.Game.BattleEngine.runEnemyPhase(battle);
            playEvents(res2.events, function () { afterEnemyPhase(); });
          });
        }, 500 / window.Game.SystemsUI.speed());
      } else {
        setActionsEnabled(true);
      }
    }, 1400 / window.Game.SystemsUI.speed());
  }

  function startBattle(floor, isBoss, isReplay) {
    var run = window.Game.State.current;
    currentBattle = window.Game.BattleEngine.createBattle(run, floor, isBoss);
    currentMode = 'tower';
    currentFloor = floor;
    currentIsBoss = !!isBoss;
    currentIsReplay = !!isReplay;
    targetPickCallback = null;
    window.Game.State.markBattle(run, floor);
    applyBattleAmbience(floor, currentIsBoss);
    document.getElementById('battle-floor-label').textContent =
      (isBoss ? T('bossFloorTitle') : (T('floorLabel') + floor)) + (isReplay ? T('replaySuffix') : '');
    document.getElementById('battle-home').innerHTML = I('home');
    document.getElementById('battle-home').onclick = confirmLeaveBattle;
    beginBattleScreen();
  }

  // ---- Endless Arena (survival mode) ----

  function updateSurvivalLabel() {
    document.getElementById('battle-floor-label').textContent =
      T('survivalWaveLabel', { wave: survivalSession.wave }) + T('survivalTallySuffix', { exp: survivalSession.totalExp });
  }

  function startSurvivalWave(wave) {
    var run = window.Game.State.current;
    survivalSession.wave = wave;
    currentBattle = window.Game.BattleEngine.createSurvivalBattle(run, wave);
    currentMode = 'survival';
    currentFloor = null;
    currentIsBoss = false;
    currentIsReplay = false;
    targetPickCallback = null;
    applyBattleAmbience(run.currentFloor, false);
    updateSurvivalLabel();
    document.getElementById('battle-home').innerHTML = I('home');
    document.getElementById('battle-home').onclick = confirmStopSurvival;
    beginBattleScreen();
  }

  // Entry point (called from the tower screen's Endless Arena button). Resets
  // the running session tally and starts wave 1.
  function startSurvivalSession() {
    survivalSession = { wave: 0, wavesCleared: 0, totalExp: 0, materials: {} };
    startSurvivalWave(1);
  }

  function confirmStopSurvival() {
    SFX('ui_confirm');
    window.Game.MenuUI.confirmModal({
      title: T('survivalStopTitle'),
      message: T('survivalStopMsg'),
      confirmLabel: T('survivalStopConfirmBtn'),
      cancelLabel: T('keepFighting'),
      onConfirm: function () { endSurvivalSession(false); }
    });
  }

  // Wave cleared: pays out EXP + material drops only (no gold, no equipment --
  // this mode is meant purely for crafting-material/EXP farming, not gearing up
  // or gold income), tallies them into the session summary, then auto-continues
  // into the next wave. A defeat doesn't wipe the tower run like the main game's
  // game-over screen does -- it's a soft knockout (HP floored at 1) that just
  // ends the session early, since this mode is meant to be low-stakes and
  // endlessly repeatable.
  function handleSurvivalWaveEnd(battle) {
    var run = window.Game.State.current;
    if (battle.victory) {
      var F = window.Game.Formulas;
      var exp = window.Game.BattleEngine.getExpReward(battle, window.Game.State.getRewardMult(run, 'exp') * F.ARENA_EXP_MULT);
      // Arena level-ups do not refill HP/MP (addExp does so in the tower), otherwise a session
      // chains waves on free full heals.
      var hpBefore = run.hp, mpBefore = run.mp;
      var lvlRes = window.Game.State.addExp(run, exp);
      run.hp = hpBefore; run.mp = mpBefore;
      window.Game.State.clampVitals(run);
      window.Game.State.recordBattleWon(run);
      window.Game.State.recordEnemiesDefeated(run, battle.enemies.length);
      window.Game.State.recordArenaWaveCleared(run);
      SFX('victory');
      logLine(T('logExpGained', { exp: exp }), 'log-heal');
      survivalSession.totalExp += exp;
      var drops = window.Game.BattleEngine.getMaterialDrops(battle, window.Game.State.getRewardMult(run, 'material') * window.Game.Formulas.ARENA_MATERIAL_MULT);
      drops.forEach(function (d) {
        window.Game.State.addItem(run, d.id, d.qty);
        survivalSession.materials[d.id] = (survivalSession.materials[d.id] || 0) + d.qty;
        var mat = window.Game.Data.getItem(d.id);
        logLine(T('logMaterialGained', { name: L(mat, 'name'), qty: d.qty }), 'log-heal');
      });
      if (lvlRes.leveledUp) {
        logLine(T('logLevelUp', { level: lvlRes.level }), 'log-crit'); logLevelUpNews(lvlRes); remindAttrPoints();
        battleLater(function () { SFX('level_up'); heroLevelUpFx(); }, 450 / window.Game.SystemsUI.speed());
      }
      survivalSession.wavesCleared += 1;
      window.Game.State.saveNow();
      battleLater(function () { window.Game.SystemsUI.talentPrompt(function () { startSurvivalWave(survivalSession.wave + 1); }); }, 1400 / window.Game.SystemsUI.speed());
    } else {
      SFX('defeat');
      logLine(T('survivalKnockedOutLog'), 'log-weak');
      run.hp = 1;
      window.Game.State.clampVitals(run);
      battleLater(function () { endSurvivalSession(true); }, 1400 / window.Game.SystemsUI.speed());
    }
  }

  function endSurvivalSession(defeated) {
    // Best wave count is kept in meta (achievements, survivalWaves unlocks) however the
    // session ended -- stopping voluntarily still counts.
    window.Game.State.recordSurvivalWaves(survivalSession.wavesCleared);
    lastSurvivalSummary = { session: survivalSession, defeated: !!defeated };
    currentBattle = null;
    currentMode = 'tower';
    targetPickCallback = null;
    if (window.Game.Audio) window.Game.Audio.stopMusic();
    window.Game.State.saveNow();
    renderSurvivalSummary(lastSurvivalSummary.session, lastSurvivalSummary.defeated);
    window.Game.UI.showScreen('screen-survival-summary');
  }

  function renderSurvivalSummary(session, defeated) {
    document.getElementById('survival-summary-icon').innerHTML = I(defeated ? 'skull' : 'trophy');
    document.getElementById('survival-summary-title').textContent = T(defeated ? 'survivalSummaryDefeatedTitle' : 'survivalSummaryStoppedTitle');
    document.getElementById('survival-summary-desc').textContent = T('survivalSummaryDesc', { waves: session.wavesCleared });
    var statsHtml =
      '<div class="stat-row"><div class="stat-row-label">' + I('towerSpire') + '<span>' + T('survivalSummaryWavesLabel') + '</span></div><div class="stat-row-value">' + session.wavesCleared + '</div></div>' +
      '<div class="stat-row"><div class="stat-row-label">' + I('sparkles') + '<span>EXP</span></div><div class="stat-row-value">' + session.totalExp + '</div></div>';
    var D = window.Game.Data;
    var matIds = Object.keys(session.materials);
    var matHtml = matIds.length ? matIds.map(function (id) {
      var it = D.getItem(id);
      if (!it) return '';
      return '<div class="inv-item"><div class="inv-item-icon">' + window.Game.Icons.item(it) + '</div>' +
        '<div class="inv-item-info"><div class="inv-item-name">' + L(it, 'name') + '</div></div>' +
        '<div class="inv-item-actions"><span class="inv-item-count">x' + session.materials[id] + '</span></div></div>';
    }).join('') : '<p class="empty-note">' + T('survivalSummaryNoMaterials') + '</p>';
    document.getElementById('survival-summary-body').innerHTML =
      '<div class="status-panel-title">' + T('survivalSummaryStatsTitle') + '</div>' + statsHtml +
      '<div class="status-panel-title" style="margin-top:1rem">' + T('survivalSummaryMaterialsTitle') + '</div>' + matHtml;
    document.getElementById('survival-summary-actions').innerHTML =
      '<button class="btn-secondary" id="survival-again-btn">' + T('survivalSummaryAgainBtn') + '</button>' +
      '<button class="btn-primary" id="survival-back-btn">' + T('survivalSummaryBackBtn') + '</button>';
    document.getElementById('survival-again-btn').onclick = function () { SFX('ui_confirm'); startSurvivalSession(); };
    document.getElementById('survival-back-btn').onclick = function () {
      SFX('ui_back');
      window.Game.TowerUI.renderTower();
      window.Game.UI.showScreen('screen-tower');
    };
  }

  // Re-derives actor display names in the current language and repaints the
  // static battle chrome, without touching HP/MP/turn state. Called after a
  // language switch. The battle log's history is intentionally left as-is.
  function refreshActiveScreen() {
    var active = document.querySelector('.screen.active');
    if (active && active.id === 'screen-survival-summary' && lastSurvivalSummary) {
      renderSurvivalSummary(lastSurvivalSummary.session, lastSurvivalSummary.defeated);
      return;
    }
    if (document.getElementById('screen-battle').className.indexOf('active') === -1) return;
    if (!currentBattle) return;
    if (playbackBusy) { pendingLanguageRefresh = true; return; }
    var D = window.Game.Data;
    currentBattle.player.name = window.Game.I18n.L(D.getClass(currentBattle.player.classId), 'name');
    currentBattle.enemies.forEach(function (e) {
      var template = D.getEnemyTemplate(e.templateId);
      if (template) e.name = window.Game.I18n.L(template, 'name');
    });
    if (currentMode === 'survival') {
      updateSurvivalLabel();
    } else {
      document.getElementById('battle-floor-label').textContent =
        (currentIsBoss ? T('bossFloorTitle') : (T('floorLabel') + currentFloor)) + (currentIsReplay ? T('replaySuffix') : '');
    }
    renderEnemies(currentBattle);
    renderPlayerPanel(currentBattle);
    renderCompanionPanel(currentBattle);
    renderTurnOrder(currentBattle);
    renderActions();
    setActionsEnabled(!currentBattle.over && currentBattle.playerAP > 0 && !currentBattle.awaitingAllOut && !targetPickCallback);
  }

  window.Game = window.Game || {};
  window.Game.BattleUI = { cancelPlayback: cancelPlayback, isPlayingEffects: function () { return playbackBusy || !!document.getElementById('battle-entrance'); }, startBattle: startBattle, restoreBattle: restoreBattle, startSurvivalSession: startSurvivalSession, refreshActiveScreen: refreshActiveScreen };
})();
