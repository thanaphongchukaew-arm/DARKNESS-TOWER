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
    toastTimer = setTimeout(function () { el.classList.add('hidden'); }, 900);
  }

  function describeEvent(ev) {
    switch (ev.type) {
      case 'skillUsed': return { text: T('logSkillUsed', { name: ev.name }), cls: '' };
      case 'hit':
        if (ev.targetSide === 'enemy') {
          if (ev.relation === 'null') return { text: T('logEnemyNullified', { target: ev.targetName }), cls: '' };
          var tag = ev.relation === 'weak' ? T('weakTag') : ev.isCrit ? T('critTag') : '';
          return { text: T('logEnemyDamage', { target: ev.targetName, amount: ev.amount, tag: tag }), cls: ev.relation === 'weak' ? 'log-weak' : ev.isCrit ? 'log-crit' : '' };
        }
        if (ev.relation === 'null') return { text: T('logPlayerBlocked', { attacker: ev.attackerName }), cls: '' };
        if (ev.relation === 'drain') return { text: T('logPlayerDrainFail', { attacker: ev.attackerName }), cls: '' };
        var ptag = ev.relation === 'weak' ? T('weakTag') : ev.isCrit ? T('critTag') : '';
        return { text: T('logPlayerDamage', { attacker: ev.attackerName, skill: ev.skillName, amount: ev.amount, tag: ptag }), cls: (ev.relation === 'weak' || ev.isCrit) ? 'log-weak' : '' };
      case 'downed': return { text: T('logDowned', { target: ev.targetName }), cls: 'log-weak' };
      case 'defeated': return { text: T('logDefeated', { target: ev.targetName }), cls: 'log-crit' };
      case 'reflect': return { text: T('logReflect', { amount: ev.amount, attacker: ev.attackerName }), cls: 'log-weak' };
      case 'drainBlocked': return { text: T('logDrainBlocked', { target: ev.targetName, amount: ev.amount }), cls: 'log-heal' };
      case 'heal': return { text: T('logHeal', { amount: ev.amount }), cls: 'log-heal' };
      case 'buff':
        var who = ev.side === 'enemy' ? ev.targetName : (currentBattle ? currentBattle.player.name : T('youPronoun'));
        var statName = T(STAT_NAME_KEYS[ev.stat] || ev.stat);
        return { text: T(ev.amount > 0 ? 'logBuffUp' : 'logBuffDown', { who: who, stat: statName }), cls: '' };
      case 'guard': return { text: T('logGuard'), cls: '' };
      case 'itemUsed': return { text: T('logItemUsed'), cls: 'log-heal' };
      case 'allOutReady': return { text: T('logAllOutReady'), cls: 'log-crit' };
      case 'allOutStart': return { text: T('logAllOutStart'), cls: 'log-crit' };
      case 'allOutHit': return { text: T('logAllOutHit', { target: ev.targetName, amount: ev.amount, defeated: ev.defeated ? T('logAllOutHitDefeatedTag') : '' }), cls: 'log-crit' };
      case 'allOutDeclined': return { text: T('logAllOutDeclined'), cls: '' };
      case 'bossPhaseChange': return { text: ev.message, cls: 'log-crit' };
      case 'enemyPhaseSkip': return { text: T('logEnemyPhaseSkip', { target: ev.targetName }), cls: '' };
      case 'victory': return { text: T('logVictory'), cls: 'log-crit' };
      case 'defeat': return { text: T('logDefeat'), cls: 'log-weak' };
      case 'invalid': return { text: T('logInvalidAction'), cls: '' };
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

  function getEnemyPortraitEl(uid) {
    var card = document.getElementById('enemy-card-' + uid);
    return card ? card.querySelector('.enemy-portrait') : null;
  }

  function getPlayerPortraitEl() {
    return document.querySelector('#battle-player-panel .player-portrait');
  }

  function spawnFloatNumber(anchorEl, text, cls) {
    if (!anchorEl) return;
    var num = document.createElement('div');
    num.className = 'dmg-number' + (cls ? ' ' + cls : '');
    num.textContent = text;
    anchorEl.appendChild(num);
    setTimeout(function () { if (num.parentNode) num.parentNode.removeChild(num); }, 900);
  }

  function flashEl(el, cls) {
    if (!el) return;
    var c = cls || 'hit-flash';
    el.classList.remove(c);
    void el.offsetWidth;
    el.classList.add(c);
    setTimeout(function () { el.classList.remove(c); }, 450);
  }

  function shakeScreen(strong) {
    var el = document.getElementById('screen-battle');
    if (!el) return;
    var c = strong ? 'screen-shake-strong' : 'screen-shake';
    el.classList.remove('screen-shake', 'screen-shake-strong');
    void el.offsetWidth;
    el.classList.add(c);
    setTimeout(function () { el.classList.remove(c); }, 450);
  }

  // Toggling just the CSS class left the "Staggered!" text tag out of sync -- it's built
  // into enemyCardHtml() but this function patches an existing card in place rather than
  // re-rendering it, so the tag element itself has to be added/removed here too.
  function setEnemyCardState(uid, opts) {
    if (!uid) return;
    var card = document.getElementById('enemy-card-' + uid);
    if (!card) return;
    if (opts.downed) {
      card.classList.add('downed');
      if (!card.querySelector('.enemy-downed-tag')) {
        var tag = document.createElement('span');
        tag.className = 'enemy-downed-tag';
        tag.textContent = T('downedTag');
        var portrait = card.querySelector('.enemy-portrait');
        card.insertBefore(tag, portrait ? portrait.nextSibling : card.firstChild);
      }
    }
    if (opts.downed === false) {
      card.classList.remove('downed');
      var existingTag = card.querySelector('.enemy-downed-tag');
      if (existingTag) existingTag.remove();
    }
    if (opts.dead) {
      card.classList.add('dead');
      card.classList.remove('downed', 'targetable');
      var deadTag = card.querySelector('.enemy-downed-tag');
      if (deadTag) deadTag.remove();
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
    switch (ev.type) {
      case 'skillUsed':
        SFX('skill_cast');
        break;
      case 'guard':
        SFX('guard');
        break;
      case 'buff':
        SFX(ev.amount > 0 ? 'item_get' : 'hit_null');
        break;
      case 'hit':
        if (ev.targetSide === 'enemy') {
          var ePortrait = getEnemyPortraitEl(ev.targetUid);
          if (ev.hpAfter != null && ev.maxHp != null) updateEnemyBarByUid(ev.targetUid, ev.hpAfter, ev.maxHp);
          if (ev.relation === 'null') {
            SFX('hit_null');
            showToast(T('toastNullified'), 'miss');
            spawnFloatNumber(ePortrait, T('dmgNullified'), 'dmg-null');
          } else if (ev.relation === 'weak') {
            SFX('hit_weak');
            showToast(T('toastWeak'), 'weak');
            setEnemyCardState(ev.targetUid, { downed: true });
            flashEl(ePortrait, 'hit-flash');
            flashEl(ePortrait, 'hit-shake');
            spawnFloatNumber(ePortrait, ev.amount, 'dmg-weak');
            shakeScreen(false);
          } else if (ev.isCrit) {
            SFX('hit_crit');
            showToast(T('toastCrit'), '');
            setEnemyCardState(ev.targetUid, { downed: true });
            flashEl(ePortrait, 'hit-flash');
            flashEl(ePortrait, 'hit-shake');
            spawnFloatNumber(ePortrait, ev.amount, 'dmg-crit');
            shakeScreen(false);
          } else {
            SFX('attack');
            flashEl(ePortrait, 'hit-flash');
            spawnFloatNumber(ePortrait, ev.amount, 'dmg-hp');
          }
        } else {
          var pPortrait = getPlayerPortraitEl();
          updatePlayerBarsDirect(ev.hpAfter, ev.maxHp);
          if (ev.attackerUid && ev.attackerHpAfter != null) updateEnemyBarByUid(ev.attackerUid, ev.attackerHpAfter, ev.attackerMaxHp);
          if (ev.relation === 'weak' || ev.isCrit) {
            SFX('player_hit');
            showToast(T('toastPlayerWeak'), 'weak');
            flashEl(pPortrait, 'hit-flash');
            flashEl(pPortrait, 'hit-shake');
            spawnFloatNumber(pPortrait, ev.amount, 'dmg-weak');
            shakeScreen(true);
          } else if (ev.relation === 'null') {
            SFX('hit_null');
            showToast(T('toastBlocked'), 'miss');
            spawnFloatNumber(pPortrait, T('dmgBlocked'), 'dmg-null');
          } else if (ev.relation === 'drain') {
            SFX('hit_null');
            spawnFloatNumber(pPortrait, '?', 'dmg-null');
          } else if (ev.amount) {
            SFX('player_hit');
            flashEl(pPortrait, 'hit-flash');
            flashEl(pPortrait, 'hit-shake');
            spawnFloatNumber(pPortrait, ev.amount, 'dmg-hp');
            shakeScreen(false);
          }
        }
        break;
      case 'defeated':
        SFX('defeated');
        setEnemyCardState(ev.targetUid, { dead: true });
        break;
      case 'downed':
        SFX('downed');
        setEnemyCardState(ev.targetUid, { downed: true });
        break;
      case 'reflect':
        SFX('reflect');
        if (ev.attackerUid) {
          updateEnemyBarByUid(ev.attackerUid, ev.hpAfter, ev.maxHp);
          spawnFloatNumber(getEnemyPortraitEl(ev.attackerUid), ev.amount, 'dmg-weak');
        } else {
          updatePlayerBarsDirect(ev.hpAfter, ev.maxHp);
          spawnFloatNumber(getPlayerPortraitEl(), ev.amount, 'dmg-weak');
        }
        showToast(T('toastReflected'), 'miss');
        break;
      case 'drainBlocked':
        SFX('heal');
        updateEnemyBarByUid(ev.targetUid, ev.hpAfter, ev.maxHp);
        spawnFloatNumber(getEnemyPortraitEl(ev.targetUid), '+' + ev.amount, 'dmg-heal');
        showToast(T('toastAbsorbed'), 'miss');
        break;
      case 'heal':
        SFX('heal');
        updatePlayerBarsDirect(ev.hpAfter, ev.maxHp);
        spawnFloatNumber(getPlayerPortraitEl(), '+' + ev.amount, 'dmg-heal');
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
        setEnemyCardState(ev.targetUid, { downed: false, dead: ev.defeated });
        flashEl(getEnemyPortraitEl(ev.targetUid), 'hit-flash');
        spawnFloatNumber(getEnemyPortraitEl(ev.targetUid), ev.amount, 'dmg-crit');
        shakeScreen(false);
        break;
      case 'allOutReady':
        SFX('allout_ready');
        showToast(T('toastAllOutReady'), 'weak');
        break;
      case 'allOutStart':
        SFX('allout_start');
        shakeScreen(true);
        break;
      case 'bossPhaseChange':
        SFX('boss_phase');
        showToast(T('toastPhase2'), 'weak');
        shakeScreen(true);
        break;
      case 'invalid':
        SFX('hit_null');
        showToast(T('toastInvalidAction'), 'miss');
        break;
    }
    var d = describeEvent(ev);
    if (d) logLine(d.text, d.cls);
  }

  function playEvents(events, onDone) {
    var i = 0;
    function step() {
      if (i >= events.length) { onDone(); return; }
      var ev = events[i++];
      handleEventVisual(ev);
      setTimeout(step, 260);
    }
    step();
  }

  function enemyCardHtml(e) {
    var classes = ['enemy-card'];
    if (!e.alive) classes.push('dead');
    if (e.downed) classes.push('downed');
    if (e.isBoss) classes.push('boss');
    if (targetPickCallback && e.alive) classes.push('targetable');
    var hpPct = Math.max(0, Math.round(e.hp / e.maxHp * 100));
    var seen = {};
    function tagsFor(list, modifier, icon) {
      return list.filter(function (el) { if (seen[el]) return false; seen[el] = true; return true; })
        .map(function (el) { return '<span class="el-tag el-' + el + ' ' + modifier + '">' + I(el) + I(icon, 'tag-marker') + '</span>'; }).join('');
    }
    var weakTags = tagsFor(e.revealed.weak, 'tag-weak', 'star') +
      tagsFor(e.revealed.drain, 'tag-bad', 'heart') +
      tagsFor(e.revealed.reflect, 'tag-bad', 'shieldGuard') +
      tagsFor(e.revealed.null, 'tag-bad', 'close') +
      tagsFor(e.revealed.resist, 'tag-bad', 'shieldGuard');
    var hasPhases = e.isBoss && e.phasesData && e.phasesData.length;
    var hpBarHtml;
    if (hasPhases) {
      var pts = hpSegmentBreakpoints(e);
      var frac = e.hp / e.maxHp;
      var segs = '';
      for (var i = 0; i < pts.length - 1; i++) {
        var hi = pts[i], lo = pts[i + 1];
        var pct = frac >= hi ? 100 : frac <= lo ? 0 : Math.round((frac - lo) / (hi - lo) * 100);
        segs += '<div class="bar-track hp-segment"><div class="bar-fill hp' + (pct > 0 && pct <= 30 ? ' low' : '') + '" id="enemy-hp-' + e.uid + '-' + i + '" style="width:' + pct + '%"></div></div>';
      }
      hpBarHtml = '<div class="bar-row hp-segment-row" style="width:100%">' + segs + '</div>';
    } else {
      hpBarHtml = '<div class="bar-row" style="width:100%"><div class="bar-track"><div class="bar-fill hp" id="enemy-hp-' + e.uid + '" style="width:' + hpPct + '%"></div></div></div>';
    }
    return '<div class="' + classes.join(' ') + '" id="enemy-card-' + e.uid + '" data-uid="' + e.uid + '">' +
      '<div class="enemy-portrait">' + I(e.icon) + '</div>' +
      (e.downed && e.alive ? '<span class="enemy-downed-tag">' + T('downedTag') + '</span>' : '') +
      '<div class="enemy-name">' + e.name + (hasPhases ? T('phaseLabel') + e.phase : '') + '</div>' +
      hpBarHtml +
      '<div class="enemy-weak-tags">' + weakTags + '</div>' +
    '</div>';
  }

  function renderEnemies(battle) {
    var el = document.getElementById('battle-enemies');
    el.innerHTML = battle.enemies.map(enemyCardHtml).join('');
    if (targetPickCallback) {
      Array.prototype.forEach.call(el.querySelectorAll('.enemy-card.targetable'), function (card) {
        card.onclick = function () {
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
    renderEnemies(currentBattle);
    var root = document.getElementById('battle-submenu');
    root.innerHTML = '<div class="submenu-header"><h3>' + T('selectTargetTitle') + '</h3><button class="btn-icon" id="target-cancel">' + I('close') + '</button></div>' +
      '<p class="empty-note">' + T('tapEnemyHint') + '</p>';
    root.classList.remove('hidden');
    document.getElementById('target-cancel').onclick = function () {
      SFX('ui_cancel');
      exitTargetSelect();
      setActionsEnabled(true);
    };
  }

  function renderPlayerPanel(battle) {
    var run = battle.run;
    var hpPct = Math.max(0, Math.round(run.hp / battle.player.maxHp * 100));
    var mpPct = Math.max(0, Math.round(run.mp / battle.player.maxMp * 100));
    var apDots = '';
    for (var i = 0; i < 4; i++) apDots += '<div class="ap-dot' + (i < battle.playerAP ? ' filled' : '') + '"></div>';
    document.getElementById('battle-player-panel').innerHTML =
      '<div class="player-portrait">' + I(battle.player.icon) + '</div>' +
      '<div class="player-bars">' +
        '<div class="player-name-row"><span>' + battle.player.name + '</span><div class="ap-indicator">' + apDots + '</div></div>' +
        '<div class="bar-row">' + I('heart') + '<div class="bar-track"><div class="bar-fill hp" id="player-hp-bar" style="width:' + hpPct + '%"></div></div><span id="player-hp-text">' + run.hp + '/' + battle.player.maxHp + '</span></div>' +
        '<div class="bar-row">' + I('drop') + '<div class="bar-track"><div class="bar-fill mp" id="player-mp-bar" style="width:' + mpPct + '%"></div></div><span id="player-mp-text">' + run.mp + '/' + battle.player.maxMp + '</span></div>' +
      '</div>';
  }

  function renderTurnOrder(battle) {
    var chips = '<div class="turn-chip is-player active" title="' + battle.player.name + '">' + I('phys') + '</div>';
    battle.enemies.forEach(function (e) {
      if (!e.alive) return;
      chips += '<div class="turn-chip is-enemy" title="' + e.name + '">' + I(e.isBoss ? 'crownSkull' : 'skull') + '</div>';
    });
    document.getElementById('battle-turn-order').innerHTML = chips;
  }

  function closeSubmenu() {
    var root = document.getElementById('battle-submenu');
    root.classList.add('hidden');
    root.innerHTML = '';
  }

  function openSkillMenu() {
    var battle = currentBattle;
    var skills = battle.player.skills.filter(function (s) { return s.id !== 'attack'; });
    var root = document.getElementById('battle-submenu');
    var itemsHtml = skills.length ? skills.map(function (s) {
      var disabled = battle.run.mp < s.cost;
      return '<button class="submenu-option" ' + (disabled ? 'disabled' : '') + ' data-id="' + s.id + '">' +
        '<div class="submenu-option-icon">' + I(s.icon) + '</div>' +
        '<div class="submenu-option-info"><div class="submenu-option-name">' + L(s, 'name') + ' <span class="el-tag el-' + s.element + '">' + EN(s.element) + '</span></div><div class="submenu-option-desc">' + L(s, 'desc') + '</div></div>' +
        '<div class="submenu-option-cost">' + (s.cost > 0 ? s.cost + ' MP' : T('freeLabel')) + '</div>' +
      '</button>';
    }).join('') : '<p class="empty-note">' + T('noMoreSkills') + '</p>';
    root.innerHTML = '<div class="submenu-header"><h3>' + T('selectSkillTitle') + '</h3><button class="btn-icon" id="submenu-close">' + I('close') + '</button></div>' +
      '<div class="submenu-list">' + itemsHtml + '</div>';
    root.classList.remove('hidden');
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
    var battle = currentBattle, run = battle.run, D = window.Game.Data;
    var usable = Object.keys(run.inventory).map(function (id) { return D.getItem(id); }).filter(function (it) { return it && it.battleUsable; });
    var root = document.getElementById('battle-submenu');
    var itemsHtml = usable.length ? usable.map(function (it) {
      return '<button class="submenu-option" data-id="' + it.id + '">' +
        '<div class="submenu-option-icon">' + I(it.icon) + '</div>' +
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

  function setActionsEnabled(enabled) {
    Array.prototype.forEach.call(document.querySelectorAll('#battle-actions button'), function (b) { b.disabled = !enabled; });
  }

  function renderActions() {
    var el = document.getElementById('battle-actions');
    el.innerHTML =
      '<button class="btn-primary" id="act-attack">' + I('swordAttack') + '<span>' + T('attackLabel') + '</span></button>' +
      '<button class="btn-secondary" id="act-skill">' + I('magicBurst') + '<span>' + T('skillsLabel') + '</span></button>' +
      '<button class="btn-secondary" id="act-guard">' + I('shieldGuard') + '<span>' + T('guardLabel') + '</span></button>' +
      '<button class="btn-secondary" id="act-item">' + I('bagItem') + '<span>' + T('itemsLabel') + '</span></button>';
    document.getElementById('act-attack').onclick = function () {
      closeSubmenu();
      enterTargetSelect(function (idx) { doAction({ kind: 'attack', targetIndex: idx }); });
    };
    document.getElementById('act-skill').onclick = function () { SFX('ui_confirm'); openSkillMenu(); };
    document.getElementById('act-guard').onclick = function () { doAction({ kind: 'guard' }); };
    document.getElementById('act-item').onclick = function () { SFX('ui_confirm'); openItemMenu(); };
  }

  function doAction(action) {
    var battle = currentBattle;
    if (!battle || battle.over || battle.playerAP <= 0 || battle.awaitingAllOut) return;
    closeSubmenu();
    setActionsEnabled(false);
    var result = window.Game.BattleEngine.playerAction(battle, action);
    playEvents(result.events, function () { afterPlayerAction(); });
  }

  function afterPlayerAction() {
    var battle = currentBattle;
    renderPlayerPanel(battle);
    renderTurnOrder(battle);
    if (battle.over) { handleBattleEnd(battle); return; }
    if (battle.awaitingAllOut) { showAllOutModal(); return; }
    if (battle.playerAP > 0) {
      setActionsEnabled(true);
    } else {
      setTimeout(function () {
        var res2 = window.Game.BattleEngine.runEnemyPhase(battle);
        playEvents(res2.events, function () { afterEnemyPhase(); });
      }, 500);
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
    setActionsEnabled(false);
    closeSubmenu();
    if (currentMode === 'survival') { handleSurvivalWaveEnd(battle); return; }
    if (window.Game.Audio) window.Game.Audio.stopMusic();
    if (battle.victory) handleVictory(battle); else handleDefeat(battle);
  }

  function handleVictory(battle) {
    var run = window.Game.State.current;
    // Replaying an already-cleared floor still pays out EXP/gold/materials,
    // just at 40% of a first clear's rate, and the chosen difficulty's own
    // rewardMult (shown on the difficulty-select card) always applies on top.
    var diff = window.Game.Formulas.DIFFICULTY[run.difficulty] || window.Game.Formulas.DIFFICULTY.normal;
    var rate = (currentIsReplay ? 0.4 : 1) * diff.rewardMult;
    var exp = window.Game.BattleEngine.getExpReward(battle, rate);
    var gold = window.Game.BattleEngine.getGoldReward(battle, rate);
    var lvlRes = window.Game.State.addExp(run, exp);
    window.Game.State.addGold(run, gold);
    window.Game.State.recordBattleWon(run);
    window.Game.State.recordEnemiesDefeated(run, battle.enemies.length);
    SFX('victory');
    logLine(T('logExpGained', { exp: exp }), 'log-heal');
    logLine(T('logGoldGained', { gold: gold }), 'log-heal');
    var drops = window.Game.BattleEngine.getMaterialDrops(battle, rate);
    drops.forEach(function (d) {
      window.Game.State.addItem(run, d.id, d.qty);
      var mat = window.Game.Data.getItem(d.id);
      logLine(T('logMaterialGained', { name: L(mat, 'name'), qty: d.qty }), 'log-heal');
    });
    if (lvlRes.leveledUp) {
      logLine(T('logLevelUp', { level: lvlRes.level }), 'log-crit');
      setTimeout(function () { SFX('level_up'); }, 450);
    }
    if (currentIsReplay) {
      // Replaying an already-cleared floor: no floor advance, no reward pick,
      // and never re-trigger the end-game screen even for a repeat boss kill.
      window.Game.State.saveNow();
      setTimeout(function () {
        window.Game.TowerUI.renderTower();
        window.Game.UI.showScreen('screen-tower');
      }, 1400);
    } else if (battle.isBoss) {
      setTimeout(function () {
        window.Game.MenuUI.renderStory('ending', function () { window.Game.Main.showEnd(true); });
        window.Game.UI.showScreen('screen-story');
      }, 1400);
    } else {
      window.Game.State.saveNow();
      setTimeout(function () {
        window.Game.TowerUI.renderReward(battle.floor);
        window.Game.UI.showScreen('screen-reward');
      }, 1400);
    }
  }

  function handleDefeat() {
    SFX('defeat');
    setTimeout(function () { window.Game.Main.showEnd(false); }, 1400);
  }

  function leaveBattle() {
    setActionsEnabled(false);
    closeSubmenu();
    if (window.Game.Audio) window.Game.Audio.stopMusic();
    currentBattle = null;
    targetPickCallback = null;
    window.Game.State.saveNow();
    window.Game.TowerUI.renderTower();
    window.Game.UI.showScreen('screen-tower');
  }

  function confirmLeaveBattle() {
    SFX('ui_confirm');
    var root = document.getElementById('modal-root');
    root.innerHTML = '<div class="modal-box"><h3>' + T('leaveBattleTitle') + '</h3>' +
      '<p class="note">' + T('leaveBattleMsg') + '</p>' +
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

  // Floor 40+ shifts the tower backdrop into a bloodier, more menacing palette, then
  // each new tier of the hidden upper tower (floors 45-99) recolors it again to match
  // that zone's theme; floor 100 goes all the way to the final boss's own throne room,
  // complete with its looming silhouette. Same flat pixel-art technique throughout
  // (recolor via CSS filters + the existing PixelArt renderer), just a grander color story.
  var AMBIENCE_TIER_CLASSES = ['battle-tier-5', 'battle-tier-6', 'battle-tier-7', 'battle-tier-8', 'battle-tier-9', 'battle-tier-10',
    'battle-tier-11', 'battle-tier-12', 'battle-tier-13', 'battle-tier-14', 'battle-tier-15', 'battle-tier-16'];

  function applyBattleAmbience(floor, isBoss) {
    var screenEl = document.getElementById('screen-battle');
    screenEl.classList.remove.apply(screenEl.classList, AMBIENCE_TIER_CLASSES.concat('battle-boss-throne'));
    var silhouette = document.getElementById('battle-boss-silhouette');
    if (isBoss) {
      screenEl.classList.add('battle-boss-throne');
      if (silhouette) silhouette.innerHTML = window.Game.PixelArt.render('timelessSovereign');
    } else {
      if (silhouette) silhouette.innerHTML = '';
      var tier = window.Game.Formulas.tierForFloor(floor);
      if (floor >= 40 && tier < 5) tier = 5; // floor-40 miniboss previews the deep-tower mood
      if (tier >= 5) screenEl.classList.add('battle-tier-' + tier);
    }
  }

  // Shared tail for both startBattle and startSurvivalWave: everything from here
  // on only cares about currentBattle's generic shape (enemies/player/AP/etc),
  // not which mode produced it.
  function beginBattleScreen() {
    document.getElementById('battle-log').innerHTML = '';
    window.Game.UI.showScreen('screen-battle');
    renderEnemies(currentBattle);
    renderPlayerPanel(currentBattle);
    renderTurnOrder(currentBattle);
    renderActions();
    setActionsEnabled(false);
    if (currentBattle.pendingFirstStrike) {
      logLine(T('logFirstStrike'), 'log-weak');
      setTimeout(function () {
        var res = window.Game.BattleEngine.runEnemyPhase(currentBattle);
        playEvents(res.events, function () { afterEnemyPhase(); });
      }, 500);
    } else {
      setActionsEnabled(true);
    }
  }

  function startBattle(floor, isBoss, isReplay) {
    var run = window.Game.State.current;
    currentBattle = window.Game.BattleEngine.createBattle(run, floor, isBoss);
    currentMode = 'tower';
    currentFloor = floor;
    currentIsBoss = !!isBoss;
    currentIsReplay = !!isReplay;
    targetPickCallback = null;
    applyBattleAmbience(floor, currentIsBoss);
    document.getElementById('battle-floor-label').textContent =
      (isBoss ? T('bossFloorTitle') : (T('floorLabel') + floor)) + (isReplay ? T('replaySuffix') : '');
    document.getElementById('battle-home').innerHTML = I('doorway');
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
    document.getElementById('battle-home').innerHTML = I('doorway');
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
      var exp = window.Game.BattleEngine.getExpReward(battle);
      var lvlRes = window.Game.State.addExp(run, exp);
      window.Game.State.recordBattleWon(run);
      window.Game.State.recordEnemiesDefeated(run, battle.enemies.length);
      window.Game.State.recordArenaWaveCleared(run);
      SFX('victory');
      logLine(T('logExpGained', { exp: exp }), 'log-heal');
      survivalSession.totalExp += exp;
      var drops = window.Game.BattleEngine.getMaterialDrops(battle);
      drops.forEach(function (d) {
        window.Game.State.addItem(run, d.id, d.qty);
        survivalSession.materials[d.id] = (survivalSession.materials[d.id] || 0) + d.qty;
        var mat = window.Game.Data.getItem(d.id);
        logLine(T('logMaterialGained', { name: L(mat, 'name'), qty: d.qty }), 'log-heal');
      });
      if (lvlRes.leveledUp) {
        logLine(T('logLevelUp', { level: lvlRes.level }), 'log-crit');
        setTimeout(function () { SFX('level_up'); }, 450);
      }
      survivalSession.wavesCleared += 1;
      window.Game.State.saveNow();
      setTimeout(function () { startSurvivalWave(survivalSession.wave + 1); }, 1400);
    } else {
      SFX('defeat');
      logLine(T('survivalKnockedOutLog'), 'log-weak');
      run.hp = 1;
      window.Game.State.clampVitals(run);
      setTimeout(function () { endSurvivalSession(true); }, 1400);
    }
  }

  function endSurvivalSession(defeated) {
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
    document.getElementById('survival-summary-icon').innerHTML = I(defeated ? 'skull' : 'crownSkull');
    document.getElementById('survival-summary-title').textContent = T(defeated ? 'survivalSummaryDefeatedTitle' : 'survivalSummaryStoppedTitle');
    document.getElementById('survival-summary-desc').textContent = T('survivalSummaryDesc', { waves: session.wavesCleared });
    var statsHtml =
      '<div class="stat-row"><div class="stat-row-label">' + I('gem') + '<span>' + T('survivalSummaryWavesLabel') + '</span></div><div class="stat-row-value">' + session.wavesCleared + '</div></div>' +
      '<div class="stat-row"><div class="stat-row-label">' + I('sparkles') + '<span>EXP</span></div><div class="stat-row-value">' + session.totalExp + '</div></div>';
    var D = window.Game.Data;
    var matIds = Object.keys(session.materials);
    var matHtml = matIds.length ? matIds.map(function (id) {
      var it = D.getItem(id);
      if (!it) return '';
      return '<div class="inv-item"><div class="inv-item-icon">' + I(it.icon) + '</div>' +
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
    renderTurnOrder(currentBattle);
    renderActions();
    setActionsEnabled(!currentBattle.over && currentBattle.playerAP > 0 && !currentBattle.awaitingAllOut && !targetPickCallback);
  }

  window.Game = window.Game || {};
  window.Game.BattleUI = { startBattle: startBattle, startSurvivalSession: startSurvivalSession, refreshActiveScreen: refreshActiveScreen };
})();
