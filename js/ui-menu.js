// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Main menu, difficulty select, class select screens + shared modal/confirm helper.
(function () {
  function I(name, cls) { return window.Game.Icons.get(name, cls); }
  function SFX(name) { if (window.Game.Audio) window.Game.Audio.sfx(name); }
  function T(key, vars) { return window.Game.I18n.t(key, vars); }
  function L(obj, field) { return window.Game.I18n.L(obj, field); }

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(function (s) { s.classList.remove('active'); });
    document.getElementById(id).classList.add('active');
    if (window.Game.Audio) window.Game.Audio.playMusic(id === 'screen-battle' ? 'battle' : 'menu');
  }

  function confirmModal(opts) {
    var root = document.getElementById('modal-root');
    root.innerHTML =
      '<div class="modal-box">' +
        '<h3>' + opts.title + '</h3>' +
        '<p class="note">' + opts.message + '</p>' +
        '<div class="modal-actions">' +
          '<button class="btn-ghost" id="modal-cancel">' + (opts.cancelLabel || T('cancel')) + '</button>' +
          '<button class="' + (opts.danger ? 'btn-danger' : 'btn-primary') + '" id="modal-confirm">' + opts.confirmLabel + '</button>' +
        '</div>' +
      '</div>';
    root.classList.remove('hidden');
    document.getElementById('modal-cancel').onclick = function () { SFX('ui_cancel'); root.classList.add('hidden'); root.innerHTML = ''; };
    document.getElementById('modal-confirm').onclick = function () {
      SFX(opts.danger ? 'ui_error' : 'ui_confirm');
      root.classList.add('hidden'); root.innerHTML = '';
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
    if (hasSave) {
      html += '<button class="btn-danger" id="btn-clear">' + I('trash') + '<span>' + T('clearSave') + '</span></button>';
    }
    el.innerHTML = html;

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
        window.Game.TowerUI.renderTower();
        showScreen('screen-tower');
      };
    }
    function startIntroStory() {
      renderStory('intro', startNightmareRun);
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
  var GUIDE_FEATURES = [
    { icon: 'eventShrine', key: 'Events' }, { icon: 'blessMight', key: 'Blessings' },
    { icon: 'relicVampiricFang', key: 'Relics' },
    { icon: 'companionSlot', key: 'Companions' }, { icon: 'ascension', key: 'Ascension' },
    { icon: 'codex', key: 'Codex' }
  ];
  var GUIDE_TIPS = ['guideTip1', 'guideTip2'];

  // Shared card renderer for every guide grid (icon + short label + one-line
  // description) -- prefix identifies the i18n key family, e.g. 'guideStat' + 'Hp' + 'Label'.
  function guideCardGrid(prefix, items) {
    return '<div class="guide-stat-grid">' + items.map(function (it) {
      return '<div class="guide-stat-card">' + I(it.icon) +
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

    document.getElementById('guide-content').innerHTML =
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
      '<div class="guide-section">' +
        '<h3>' + T('guideFeaturesTitle') + '</h3>' +
        guideCardGrid('guideFeature', GUIDE_FEATURES) +
      '</div>' +
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

  // Nightmare is the only difficulty in the game, so there's no picker screen
  // for it -- a new run goes straight from the intro story into the ascension
  // picker (once unlocked) or class select. See data-classes.js's elite-class
  // unlock note for how clearing Nightmare still gates the 5 Valiant classes.
  function startNightmareRun() {
    window.Game.State.pending.difficulty = 'nightmare';
    if (window.Game.State.getAscensionUnlocked() > 0) {
      renderAscensionPick();
      showScreen('screen-ascension');
    } else {
      window.Game.State.pending.ascension = 0;
      renderClassSelect();
      showScreen('screen-class');
    }
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
    document.getElementById('ascension-back').onclick = function () { SFX('ui_back'); renderMainMenu(); showScreen('screen-menu'); };
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
      return '<button class="select-card' + (locked ? ' locked' : '') + '" data-id="' + c.id + '">' +
        '<div class="select-card-icon">' + I(locked ? 'lock' : c.icon) + '</div>' +
        '<div class="select-card-title">' + L(c, 'name') + '</div>' +
        '<div class="select-card-desc">' + (locked ? classLockedDesc(c) : L(c, 'description')) + '</div>' +
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
      if (window.Game.State.getAscensionUnlocked() > 0) {
        renderAscensionPick();
        showScreen('screen-ascension');
      } else {
        renderMainMenu();
        showScreen('screen-menu');
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
    else if (active.id === 'screen-ascension') renderAscensionPick();
    else if (active.id === 'screen-class') renderClassSelect();
    else if (active.id === 'screen-blessing-pick') renderBlessingPick();
    else if (active.id === 'screen-story' && lastStory.kind) renderStory(lastStory.kind, lastStory.onContinue);
  }

  window.Game = window.Game || {};
  window.Game.UI = window.Game.UI || {};
  window.Game.UI.showScreen = showScreen;
  window.Game.UI.confirmModal = confirmModal;
  window.Game.MenuUI = {
    renderMainMenu: renderMainMenu,
    renderGuide: renderGuide,
    renderAscensionPick: renderAscensionPick,
    renderClassSelect: renderClassSelect,
    renderBlessingPick: renderBlessingPick,
    renderStory: renderStory,
    confirmModal: confirmModal,
    refreshActiveScreen: refreshActiveScreen
  };
})();
