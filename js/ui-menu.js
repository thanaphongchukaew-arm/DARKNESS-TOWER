// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Main menu, difficulty select, class select screens + shared modal/confirm helper.
(function () {
  function I(name, cls) { return window.Game.Icons.get(name, cls); }
  function SFX(name) { if (window.Game.Audio) window.Game.Audio.sfx(name); }
  function T(key, vars) { return window.Game.I18n.t(key, vars); }
  function L(obj, field) { return window.Game.I18n.L(obj, field); }

  function showScreen(id) {
    if (id !== 'screen-battle' && window.Game.BattleUI && window.Game.BattleUI.cancelPlayback) window.Game.BattleUI.cancelPlayback();
    document.querySelectorAll('.screen').forEach(function (s) { s.classList.remove('active'); });
    document.getElementById(id).classList.add('active');
    if (window.Game.Tips) window.Game.Tips.onScreen(id);
    if (window.Game.Input) window.Game.Input.onScreen(id);
    if (window.Game.Audio) window.Game.Audio.playMusic(id === 'screen-battle' ? 'battle' : 'menu');
  }

  // Short, self-dismissing status line (checkpoint saved, retreat cost, import result).
  var noticeTimer = null;
  function notice(text, tone) {
    var el = document.getElementById('app-notice');
    if (!el) {
      el = document.createElement('div');
      el.id = 'app-notice';
      el.setAttribute('role', 'status');
      document.getElementById('app-root').appendChild(el);
    }
    el.textContent = text;
    el.className = 'app-notice show' + (tone ? ' ' + tone : '');
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(function () { el.classList.remove('show'); }, 3800);
  }

  // Confirmation box. When the only sensible answer is "Close" (a result
  // message: confirmLabel is the shared Close label, or opts.info), it shows a
  // single button -- a second "Cancel" there would dismiss the box without
  // running onConfirm and leave the screen behind it half-finished.
  function confirmModal(opts) {
    var root = document.getElementById('modal-root');
    var info = !!opts.info || (opts.confirmLabel === T('closeBtn') && !opts.cancelLabel);
    root.innerHTML =
      '<div class="modal-box">' +
        '<h3>' + opts.title + '</h3>' +
        '<p class="note">' + opts.message + '</p>' +
        '<div class="modal-actions">' +
          (info ? '' : '<button class="btn-ghost" id="modal-cancel">' + (opts.cancelLabel || T('cancel')) + '</button>') +
          '<button class="' + (opts.danger ? 'btn-danger' : 'btn-primary') + '" id="modal-confirm">' + opts.confirmLabel + '</button>' +
        '</div>' +
      '</div>';
    root.classList.remove('hidden');
    function close() { root.classList.add('hidden'); root.innerHTML = ''; }
    var cancel = document.getElementById('modal-cancel');
    if (cancel) cancel.onclick = function () { SFX('ui_cancel'); close(); opts.onCancel && opts.onCancel(); };
    document.getElementById('modal-confirm').onclick = function () {
      SFX(opts.danger && !info ? 'ui_error' : 'ui_confirm');
      close();
      opts.onConfirm && opts.onConfirm();
    };
  }

  function renderMainMenu() {
    document.getElementById('menu-bat-1').innerHTML = window.Game.PixelArt.render('bat');
    document.getElementById('menu-bat-2').innerHTML = window.Game.PixelArt.render('bat');
    var hasSave = window.Game.Save.exists();
    var el = document.getElementById('menu-actions');
    var html = '';
    if (hasSave) {
      html += '<button class="btn-primary" id="btn-continue">' + I('doorway') + '<span>' + T('continueGame') + '</span></button>';
    }
    html += '<button class="' + (hasSave ? 'btn-secondary' : 'btn-primary') + '" id="btn-new">' + I('towerSpire') + '<span>' + T('newGame') + '</span></button>';
    html += '<button class="btn-secondary" id="btn-guide">' + I('scroll') + '<span>' + T('guideBtn') + '</span></button>';
    html += '<button class="btn-secondary" id="btn-settings">' + I('gem') + '<span>' + T('settingsBtn') + '</span></button>';
    html += '<button class="btn-secondary" id="btn-credits">' + I('star') + '<span>' + T('creditsBtn') + '</span></button>';
    if (hasSave) {
      html += '<button class="btn-danger" id="btn-clear">' + I('trash') + '<span>' + T('clearSave') + '</span></button>';
    }
    var desktop = window.DesktopBridge && window.DesktopBridge.isDesktop;
    if (desktop) html += '<button class="btn-ghost" id="btn-quit">' + I('doorway') + '<span>' + T('quitBtn') + '</span></button>';
    el.innerHTML = html;

    document.getElementById('btn-settings').onclick = function () {
      SFX('ui_confirm');
      window.Game.SettingsUI.renderSettings();
      showScreen('screen-settings');
    };
    document.getElementById('btn-credits').onclick = function () {
      SFX('ui_confirm');
      window.Game.SettingsUI.renderCredits();
      showScreen('screen-credits');
    };
    if (desktop) {
      document.getElementById('btn-quit').onclick = function () {
        SFX('ui_back');
        confirmModal({ title: T('quitConfirmTitle'), message: T('quitConfirmMsg'), confirmLabel: T('quitBtn'), danger: true, onConfirm: function () { window.DesktopBridge.quit(); } });
      };
    }

    document.getElementById('btn-guide').onclick = function () {
      SFX('ui_confirm');
      renderGuide();
      showScreen('screen-guide');
    };

    if (hasSave) {
      document.getElementById('btn-continue').onclick = function () {
        SFX('ui_confirm');
        var run = window.Game.Save.read();
        if (!run) { renderMainMenu(); return; }
        window.Game.State.current = run;
        window.Game.State.normalizeEquipment(run);
        window.Game.State.normalizeRunExtras(run);
        window.Game.State.clampVitals(run);
        // The game was closed mid-battle: that counts as a retreat.
        var retreatLoss = run.battleMark != null ? window.Game.State.settleRetreat(run) : -1;
        if (retreatLoss >= 0) { window.Game.State.saveNow(); notice(T('retreatNotice', { gold: retreatLoss }), 'warn'); }
        if (window.Game.TowerUI.resumePendingReward()) return;
        window.Game.TowerUI.renderTower();
        showScreen('screen-tower');
      };
    }
    function startIntroStory() {
      renderStory('intro', startNewRun);
      showScreen('screen-story');
    }
    document.getElementById('btn-new').onclick = function () {
      SFX('ui_confirm');
      if (hasSave) {
        confirmModal({
          title: T('confirmNewGameTitle'),
          message: T('confirmNewGameMsg'),
          confirmLabel: T('confirmNewGameBtn'),
          danger: true,
          onConfirm: function () {
            window.Game.State.clearRun();
            startIntroStory();
          }
        });
      } else {
        startIntroStory();
      }
    };
    if (hasSave) {
      document.getElementById('btn-clear').onclick = function () {
        SFX('ui_back');
        confirmModal({
          title: T('confirmClearTitle'),
          message: T('confirmClearMsg'),
          confirmLabel: T('confirmClearBtn'),
          danger: true,
          onConfirm: function () { window.Game.State.clearRun(); renderMainMenu(); }
        });
      };
    }
  }

  var GUIDE_ELEMENTS = ['phys', 'fire', 'ice', 'elec', 'wind', 'light', 'dark', 'almighty'];

  // icon + i18n-key-suffix per stat card -- reuses the exact icons the status
  // panel already uses for these stats (see statRow calls in ui-tower.js)
  // so the guide stays visually consistent with the rest of the UI.
  var GUIDE_STATS = [
    { icon: 'heart', key: 'Hp' }, { icon: 'drop', key: 'Mp' },
    { icon: 'swordAttack', key: 'Atk' }, { icon: 'magicBurst', key: 'Mag' },
    { icon: 'shieldGuard', key: 'Def' }, { icon: 'sparkles', key: 'Res' },
    { icon: 'wind', key: 'Spd' }, { icon: 'star', key: 'Luk' },
    { icon: 'gem', key: 'Exp' }
  ];
  var GUIDE_COMBAT = [
    { icon: 'buffUp', key: 'Ap' }, { icon: 'swordAttack', key: 'Actions' },
    { icon: 'debuffDown', key: 'Stagger' }, { icon: 'skull', key: 'Group' },
    { icon: 'sparkles', key: 'Focus' }, { icon: 'downedMark', key: 'Break' }
  ];
  var GUIDE_TOWER = [
    { icon: 'towerSpire', key: 'Floors' }, { icon: 'doorway', key: 'Waypoint' },
    { icon: 'crownSkull', key: 'Boss' }, { icon: 'skullFire', key: 'Difficulty' }
  ];
  // Random events, blessings/curses, companions, Ascension, and the Codex --
  // one card each, same guideCardGrid renderer as the sections above.
  var GUIDE_START = [
    { icon: 'crownSkull', key: 'Goal' }, { icon: 'towerSpire', key: 'Loop' },
    { icon: 'swordAttack', key: 'Turn' }, { icon: 'sparkles', key: 'Save' }
  ];
  // Special systems, split into themed groups so the page doesn't read as one wall.
  var GUIDE_GROUPS = [
    { title: 'guideGroupBuildTitle', items: [
      { icon: 'talentRiposte', key: 'Talents' }, { icon: 'blessMight', key: 'Blessings' },
      { icon: 'relicVampiricFang', key: 'Relics' }, { icon: 'workBench', key: 'Workshop' },
      { icon: 'microNew', key: 'New' } ] },
    { title: 'guideGroupJourneyTitle', items: [
      { icon: 'routeExplore', key: 'Routes' }, { icon: 'eventShrine', key: 'Events' },
      { icon: 'npcMira', key: 'Travelers' } ] },
    { title: 'guideGroupAlliesTitle', items: [
      { icon: 'companionSlot', key: 'Companions' }, { icon: 'sparkles', key: 'Bond' } ] },
    { title: 'guideGroupDangerTitle', items: [
      { icon: 'statusPoison', key: 'Ailments' }, { icon: 'skullFire', key: 'BossShift' } ] },
    { title: 'guideGroupMetaTitle', items: [
      { icon: 'ascension', key: 'Ascension' }, { icon: 'codex', key: 'Codex' } ] }
  ];
  var GUIDE_TIPS = ['guideTip1', 'guideTip2', 'guideTip3', 'guideTip4', 'guideTip5', 'guideTip6'];

  // Shared card renderer for every guide grid (icon + short label + one-line
  // description) -- prefix identifies the i18n key family, e.g. 'guideStat' + 'Hp' + 'Label'.
  function guideCardGrid(prefix, items) {
    return '<div class="guide-stat-grid">' + items.map(function (it) {
      return '<div class="guide-stat-card">' + window.Game.Icons.item(it) +
        '<div><div class="guide-stat-card-label">' + T(prefix + it.key + 'Label') + '</div>' +
        '<div class="guide-stat-card-desc">' + T(prefix + it.key + 'Desc') + '</div></div>' +
      '</div>';
    }).join('') + '</div>';
  }

  function renderGuide() {
    var elementsHtml = GUIDE_ELEMENTS.map(function (el) {
      return '<div class="element-card"><span class="el-tag el-' + el + '">' + I(el) + '</span><span class="element-card-name">' + window.Game.ElementName(el) + '</span></div>';
    }).join('');
    var tipsHtml = GUIDE_TIPS.map(function (key) {
      return '<div class="guide-tip-card">' + I('sparkles') + '<span>' + T(key) + '</span></div>';
    }).join('');

    var groupsHtml = GUIDE_GROUPS.map(function (g) {
      return '<div class="guide-section">' +
        '<h3>' + T('guideFeaturesTitle') + ' · ' + T(g.title) + '</h3>' +
        guideCardGrid('guideFeature', g.items) +
      '</div>';
    }).join('');

    document.getElementById('guide-content').innerHTML =
      '<div class="guide-section">' +
        '<h3>' + T('guideStartTitle') + '</h3>' +
        guideCardGrid('guideStart', GUIDE_START) +
      '</div>' +
      '<div class="guide-section">' +
        '<h3>' + T('guideStatsTitle') + '</h3>' +
        guideCardGrid('guideStat', GUIDE_STATS) +
      '</div>' +
      '<div class="guide-section">' +
        '<h3>' + T('guideElementsTitle') + '</h3>' +
        '<p>' + T('guideElementsIntro') + '</p>' +
        '<div class="element-grid">' + elementsHtml + '</div>' +
      '</div>' +
      '<div class="guide-section">' +
        '<h3>' + T('guideCombatTitle') + '</h3>' +
        guideCardGrid('guideCombat', GUIDE_COMBAT) +
      '</div>' +
      '<div class="guide-section">' +
        '<h3>' + T('guideTowerTitle') + '</h3>' +
        guideCardGrid('guideTower', GUIDE_TOWER) +
      '</div>' +
      groupsHtml +
      '<div class="guide-section">' +
        '<h3>' + T('guideTipsTitle') + '</h3>' +
        '<div class="guide-tip-list">' + tipsHtml + '</div>' +
      '</div>';

    document.getElementById('guide-back').innerHTML = I('back');
    document.getElementById('guide-back').onclick = function () { SFX('ui_back'); renderMainMenu(); showScreen('screen-menu'); };
  }

  // Story screen: reused for both the pre-run intro and the post-final-boss ending.
  // lastStory keeps the currently-shown kind/callback so a language toggle can re-render it.
  var lastStory = { kind: null, onContinue: null };
  var STORY_ICON = { intro: 'towerSpire', ending: 'sparkles' };

  function renderStory(kind, onContinue) {
    lastStory = { kind: kind, onContinue: onContinue };
    var isIntro = kind === 'intro';
    document.getElementById('screen-story').classList.toggle('story-ending', kind === 'ending');
    document.getElementById('story-icon').innerHTML = I(STORY_ICON[kind], 'icon-xl');
    document.getElementById('story-title').textContent = T(isIntro ? 'storyIntroTitle' : 'storyEndTitle');
    var bodyText = T(isIntro ? 'storyIntroBody' : 'storyEndBody');
    document.getElementById('story-body').innerHTML = bodyText.split('\n\n').map(function (p) { return '<p>' + p + '</p>'; }).join('');
    var btn = document.getElementById('story-continue');
    btn.textContent = T(isIntro ? 'storyIntroBtn' : 'storyEndBtn');
    btn.onclick = function () { SFX('ui_confirm'); onContinue(); };
  }

  // New run flow: intro story -> difficulty -> (Nightmare with Ascension unlocked:
  // ascension level) -> class -> blessing. See data-classes.js's elite-class unlock
  // note for how clearing Nightmare gates the 5 Valiant classes.
  var DIFFICULTY_ORDER = ['easy', 'normal', 'hard', 'nightmare'];
  var DIFFICULTY_ICON = { easy: 'heart', normal: 'swordAttack', hard: 'skull', nightmare: 'skullFire' };
  var DIFFICULTY_DESC = { easy: 'diffEasyDesc', normal: 'diffNormalDesc', hard: 'diffHardDesc', nightmare: 'diffNightmareDesc' };

  function startNewRun() {
    renderDifficultyPick();
    showScreen('screen-difficulty');
  }

  function afterDifficultyPicked() {
    var pending = window.Game.State.pending;
    if (pending.difficulty === 'nightmare' && window.Game.State.getAscensionUnlocked() > 0) {
      renderAscensionPick();
      showScreen('screen-ascension');
    } else {
      pending.ascension = 0;
      renderClassSelect();
      showScreen('screen-class');
    }
  }

  // Line chart of enemy strength for every floor and difficulty, straight from Formulas.
  function difficultyChartHtml() {
    var F = window.Game.Formulas;
    var W = 640, H = 190, padL = 34, padR = 10, padT = 10, padB = 26;
    var maxV = 0, series = {};
    DIFFICULTY_ORDER.forEach(function (id) {
      var pts = [];
      for (var f = 1; f <= 100; f++) { var v = F.enemyStatScale(f, id); pts.push(v); if (v > maxV) maxV = v; }
      series[id] = pts;
    });
    maxV = Math.ceil(maxV * 2) / 2;
    function x(f) { return padL + (f - 1) / 99 * (W - padL - padR); }
    function y(v) { return padT + (1 - v / maxV) * (H - padT - padB); }
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + T('diffChartTitle') + '">';
    for (var g = 0.5; g <= maxV + 0.001; g += 0.5) {
      svg += '<line class="dl-grid" x1="' + padL + '" x2="' + (W - padR) + '" y1="' + y(g).toFixed(1) + '" y2="' + y(g).toFixed(1) + '"/>' +
        '<text class="dl-axis" x="' + (padL - 5) + '" y="' + (y(g) + 3).toFixed(1) + '" text-anchor="end">×' + g.toFixed(1) + '</text>';
    }
    [1, 20, 40, 60, 80, 100].forEach(function (f) {
      svg += '<text class="dl-axis" x="' + x(f).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle">' + f + '</text>';
    });
    DIFFICULTY_ORDER.forEach(function (id) {
      svg += '<polyline class="dl-line dl-' + id + '" points="' + series[id].map(function (v, i) { return x(i + 1).toFixed(1) + ',' + y(v).toFixed(1); }).join(' ') + '"/>';
    });
    for (var cp = 11; cp <= 91; cp += 10) {
      var cx = x(cp), cy = H - padB + 4;
      svg += '<path class="dl-cp" d="M' + cx.toFixed(1) + ' ' + (cy - 4) + 'L' + (cx + 4).toFixed(1) + ' ' + cy + 'L' + cx.toFixed(1) + ' ' + (cy + 4) + 'L' + (cx - 4).toFixed(1) + ' ' + cy + 'Z"/>';
    }
    svg += '</svg>';
    var legend = DIFFICULTY_ORDER.map(function (id) {
      return '<span class="lg-' + id + '"><i></i>' + L(F.DIFFICULTY[id], 'name') + '</span>';
    }).join('') + '<span class="lg-cp"><i></i>' + T('diffChartCp') + '</span>';
    return '<h3>' + T('diffChartTitle') + '</h3><p class="diff-chart-hint">' + T('diffChartHint') + '</p>' + svg + '<div class="diff-chart-legend">' + legend + '</div>';
  }

  function renderDifficultyPick() {
    var F = window.Game.Formulas;
    var el = document.getElementById('difficulty-cards');
    el.innerHTML = DIFFICULTY_ORDER.map(function (id) {
      var d = F.DIFFICULTY[id];
      var permadeath = id === 'nightmare';
      return '<button class="select-card difficulty-card diff-' + id + '" data-id="' + id + '">' +
        '<div class="select-card-icon">' + I(DIFFICULTY_ICON[id]) + '</div>' +
        '<div class="select-card-title">' + L(d, 'name') + (id === 'normal' ? '<span class="stat-chip" style="margin-left:0.4rem">' + T('diffRecommended') + '</span>' : '') + '</div>' +
        '<div class="select-card-desc">' + T(DIFFICULTY_DESC[id]) + '</div>' +
        '<div class="select-card-stats">' +
          '<span class="stat-chip">' + T('enemyPowerLabel') + d.statMult.toFixed(2) + '</span>' +
          '<span class="stat-chip">' + T('rewardLabel') + d.rewardMult.toFixed(2) + '</span>' +
          '<span class="stat-chip">' + T('diffPotionsChip', { n: d.startPotions }) + '</span>' +
          '<span class="stat-chip ' + (permadeath ? 'chip-danger' : 'chip-safe') + '">' + T(permadeath ? 'diffPermadeathChip' : 'diffCheckpointChip') + '</span>' +
        '</div>' +
      '</button>';
    }).join('');
    Array.prototype.forEach.call(el.querySelectorAll('.select-card'), function (card) {
      card.onclick = function () {
        SFX('ui_confirm');
        window.Game.State.pending.difficulty = card.getAttribute('data-id');
        afterDifficultyPicked();
      };
    });
    var chart = document.getElementById('difficulty-chart');
    chart.innerHTML = difficultyChartHtml();
    Array.prototype.forEach.call(el.querySelectorAll('.select-card'), function (card) {
      var hot = function () { chart.setAttribute('data-hot', card.getAttribute('data-id')); };
      card.addEventListener('mouseenter', hot);
      card.addEventListener('focus', hot);
      card.addEventListener('mouseleave', function () { chart.removeAttribute('data-hot'); });
      card.addEventListener('blur', function () { chart.removeAttribute('data-hot'); });
    });
    document.getElementById('difficulty-sub').textContent = T('difficultySub');
    document.getElementById('difficulty-back').innerHTML = I('back');
    document.getElementById('difficulty-back').onclick = function () { SFX('ui_back'); renderMainMenu(); showScreen('screen-menu'); };
  }

  // Ascension level picker (Nightmare-only, see startNightmareRun above).
  // Reuses the exact locked/unlocked .select-card pattern the class screen
  // already uses, just with plain integer levels
  // 0..min(meta.ascensionUnlocked, Formulas.ASCENSION_MAX) instead of data records.
  function renderAscensionPick() {
    var F = window.Game.Formulas;
    var unlocked = window.Game.State.getAscensionUnlocked();
    var max = Math.min(unlocked, F.ASCENSION_MAX);
    var el = document.getElementById('ascension-cards');
    var cards = [];
    for (var lvl = 0; lvl <= max; lvl++) cards.push(lvl);
    el.innerHTML = cards.map(function (lvl) {
      return '<button class="select-card" data-lvl="' + lvl + '">' +
        '<div class="select-card-icon">' + I('ascension') + '</div>' +
        '<div class="select-card-title">' + (lvl === 0 ? T('ascensionLevelZeroTitle') : T('ascensionLevelTitle', { level: lvl })) + '</div>' +
        '<div class="select-card-desc">' + (lvl === 0 ? T('ascensionLevelZeroDesc') : T('ascensionLevelDesc')) + '</div>' +
        '<div class="select-card-stats">' +
          '<span class="stat-chip">' + T('enemyPowerLabel') + F.ascensionEnemyMult(lvl).toFixed(2) + '</span>' +
          '<span class="stat-chip">' + T('rewardLabel') + F.ascensionRewardMult(lvl).toFixed(2) + '</span>' +
        '</div>' +
      '</button>';
    }).join('');
    Array.prototype.forEach.call(el.querySelectorAll('.select-card'), function (card) {
      card.onclick = function () {
        SFX('ui_confirm');
        window.Game.State.pending.ascension = parseInt(card.getAttribute('data-lvl'), 10);
        renderClassSelect();
        showScreen('screen-class');
      };
    });
    document.getElementById('ascension-sub').textContent = T('ascensionSub');
    document.getElementById('ascension-back').innerHTML = I('back');
    document.getElementById('ascension-back').onclick = function () { SFX('ui_back'); renderDifficultyPick(); showScreen('screen-difficulty'); };
  }

  // Locked-class reason text: the class's `unlock` field (data-classes.js)
  // says whether it needs a difficulty clear or a Survival Arena wave count.
  function classLockedDesc(c) {
    if (c.unlock.type === 'difficulty') {
      var diff = window.Game.Formulas.DIFFICULTY[c.unlock.difficulty];
      return T('classLockedDifficultyDesc', { difficulty: L(diff, 'name') });
    }
    return T('classLockedSurvivalDesc', { waves: c.unlock.waves });
  }

  function renderClassSelect() {
    var el = document.getElementById('class-cards');
    var classes = window.Game.Data.classes;
    el.innerHTML = classes.map(function (c) {
      var locked = c.unlock && !window.Game.State.isClassUnlocked(c.id);
      return '<button class="select-card' + (locked ? ' locked' : '') + '" data-id="' + c.id + '" title="' + String(locked ? classLockedDesc(c) : L(c, 'description')).replace(/"/g, '&quot;') + '">' +
        '<div class="select-card-icon">' + I(c.icon) + (locked ? '<span class="class-lock-badge">' + I('lock') + '</span>' : '') + '</div>' +
        '<div class="select-card-title">' + L(c, 'name') + '</div>' +
        '<div class="select-card-desc">' + (locked ? classLockedDesc(c) : L(c, 'description')) + '</div>' +
        (locked || !c.pros ? '' :
        '<ul class="class-tradeoffs">' +
          '<li class="pro"><span class="arrow up">\u25B2</span>' + L(c, 'pros') + '</li>' +
          '<li class="con"><span class="arrow down">\u25BC</span>' + L(c, 'cons') + '</li>' +
        '</ul>') +
        (locked ? '' :
        '<div class="select-card-stats">' +
          '<span class="stat-chip">HP ' + c.baseStats.hp + '</span>' +
          '<span class="stat-chip">MP ' + c.baseStats.mp + '</span>' +
          '<span class="stat-chip">ATK ' + c.baseStats.atk + '</span>' +
          '<span class="stat-chip">MAG ' + c.baseStats.mag + '</span>' +
        '</div>') +
      '</button>';
    }).join('');
    Array.prototype.forEach.call(el.querySelectorAll('.select-card'), function (card) {
      if (card.classList.contains('locked')) {
        card.onclick = function () { SFX('ui_cancel'); };
        return;
      }
      card.onclick = function () {
        SFX('ui_confirm');
        var classId = card.getAttribute('data-id');
        window.Game.State.pending.classId = classId;
        blessingPickState = { solo: null, pair: null };
        renderBlessingPick();
        showScreen('screen-blessing-pick');
      };
    });
    document.getElementById('class-back').innerHTML = I('back');
    document.getElementById('class-back').onclick = function () {
      SFX('ui_back');
      if (window.Game.State.pending.difficulty === 'nightmare' && window.Game.State.getAscensionUnlocked() > 0) {
        renderAscensionPick();
        showScreen('screen-ascension');
      } else {
        renderDifficultyPick();
        showScreen('screen-difficulty');
      }
    };
  }

  // Run-start blessing pick: 3 rolled cards (2 solo blessings, 1 riskier
  // blessing+curse pair) plus an always-available Skip -- reuses .select-card/
  // .card-grid exactly like class select. Rolled fresh every visit (fresh
  // Math.random each render), held in blessingPickState only so the click
  // handlers below can read back what's currently on screen.
  function shuffledCopy(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  var blessingPickState = { solo: null, pair: null };

  function rollBlessingOptions() {
    var D = window.Game.Data;
    var solo = shuffledCopy(D.blessings).slice(0, 2);
    var pairBlessing = shuffledCopy(D.blessings).find(function (b) {
      return solo.indexOf(b) === -1;
    }) || D.blessings[0];
    var pairKeys = pairBlessing.stat ? (Array.isArray(pairBlessing.stat) ? pairBlessing.stat : [pairBlessing.stat]) : [];
    var pairCurse = shuffledCopy(D.curses).find(function (c) {
      var curseKeys = c.stat ? (Array.isArray(c.stat) ? c.stat : [c.stat]) : [];
      return !curseKeys.some(function (k) { return pairKeys.indexOf(k) !== -1; });
    }) || D.curses[0];
    blessingPickState = { solo: solo, pair: { blessing: pairBlessing, curse: pairCurse } };
  }

  function blessingCardHtml(b, extraTag) {
    return '<div class="select-card-icon">' + I(b.icon) + '</div>' +
      '<div class="select-card-title">' + L(b, 'name') + (extraTag || '') + '</div>' +
      '<div class="select-card-desc">' + L(b, 'desc') + '</div>';
  }

  // Re-rolling on every call (including a language toggle mid-screen) would swap
  // out the offered cards from under the player -- only roll fresh options the
  // first time this screen is entered for the current pending run, then just
  // re-render the already-rolled cards in the new language.
  function renderBlessingPick() {
    if (!blessingPickState.solo) rollBlessingOptions();
    document.getElementById('blessing-pick-title').textContent = T('blessingPickTitle');
    document.getElementById('blessing-pick-sub').textContent = T('blessingPickSub');
    document.getElementById('blessing-pick-skip').textContent = T('blessingSkipBtn');
    var el = document.getElementById('blessing-pick-cards');
    var soloHtml = blessingPickState.solo.map(function (b, i) {
      return '<button class="select-card" data-kind="solo" data-idx="' + i + '">' + blessingCardHtml(b) + '</button>';
    }).join('');
    var pair = blessingPickState.pair;
    var pairHtml = '<button class="select-card" data-kind="pair">' +
      '<div class="select-card-icon">' + I('eventShrine') + '</div>' +
      '<div class="select-card-title">' + L(pair.blessing, 'name') + ' + ' + L(pair.curse, 'name') + '<span class="stat-chip" style="margin-left:0.4rem">' + T('blessingRiskyTag') + '</span></div>' +
      '<div class="select-card-desc">' + L(pair.blessing, 'desc') + ' — ' + L(pair.curse, 'desc') + '</div>' +
    '</button>';
    el.innerHTML = soloHtml + pairHtml;
    Array.prototype.forEach.call(el.querySelectorAll('.select-card'), function (card) {
      card.onclick = function () {
        SFX('ui_confirm');
        var pending = window.Game.State.pending;
        var run = window.Game.State.createRun(pending.difficulty, pending.classId, pending.ascension || 0);
        if (card.getAttribute('data-kind') === 'solo') {
          var idx = parseInt(card.getAttribute('data-idx'), 10);
          window.Game.State.addBlessing(run, blessingPickState.solo[idx].id);
        } else {
          window.Game.State.addBlessing(run, blessingPickState.pair.blessing.id);
          window.Game.State.addCurse(run, blessingPickState.pair.curse.id, true);
        }
        window.Game.State.saveNow();
        window.Game.TowerUI.renderTower();
        showScreen('screen-tower');
      };
    });
    document.getElementById('blessing-pick-skip').onclick = function () {
      SFX('ui_cancel');
      var pending = window.Game.State.pending;
      window.Game.State.createRun(pending.difficulty, pending.classId, pending.ascension || 0);
      window.Game.State.saveNow();
      window.Game.TowerUI.renderTower();
      showScreen('screen-tower');
    };
  }

  // Re-render whichever of these screens is currently active, called after a language switch.
  function refreshActiveScreen() {
    var active = document.querySelector('.screen.active');
    if (!active) return;
    if (active.id === 'screen-menu') renderMainMenu();
    else if (active.id === 'screen-guide') renderGuide();
    else if (active.id === 'screen-difficulty') renderDifficultyPick();
    else if (active.id === 'screen-settings') window.Game.SettingsUI.renderSettings();
    else if (active.id === 'screen-credits') window.Game.SettingsUI.renderCredits();
    else if (active.id === 'screen-ascension') renderAscensionPick();
    else if (active.id === 'screen-class') renderClassSelect();
    else if (active.id === 'screen-blessing-pick') renderBlessingPick();
    else if (active.id === 'screen-story' && lastStory.kind) renderStory(lastStory.kind, lastStory.onContinue);
  }

  window.Game = window.Game || {};
  window.Game.UI = window.Game.UI || {};
  window.Game.UI.showScreen = showScreen;
  window.Game.UI.confirmModal = confirmModal;
  window.Game.UI.notice = notice;
  window.Game.MenuUI = {
    renderMainMenu: renderMainMenu,
    renderGuide: renderGuide,
    renderDifficultyPick: renderDifficultyPick,
    renderAscensionPick: renderAscensionPick,
    renderClassSelect: renderClassSelect,
    renderBlessingPick: renderBlessingPick,
    renderStory: renderStory,
    confirmModal: confirmModal,
    refreshActiveScreen: refreshActiveScreen
  };
})();
