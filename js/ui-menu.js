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
        window.Game.TowerUI.renderTower();
        showScreen('screen-tower');
      };
    }
    function startIntroStory() {
      renderStory('intro', function () {
        renderDifficulty();
        showScreen('screen-difficulty');
      });
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
    { icon: 'debuffDown', key: 'Weak' }, { icon: 'buffUp', key: 'Resist' },
    { icon: 'gem', key: 'Exp' }
  ];
  var GUIDE_RELATIONS = [
    { icon: 'star', key: 'Weak' }, { icon: 'shieldGuard', key: 'Resist' }, { icon: 'close', key: 'Null' },
    { icon: 'heart', key: 'Drain' }, { icon: 'debuffDown', key: 'Reflect' }
  ];
  var GUIDE_COMBAT = [
    { icon: 'buffUp', key: 'Ap' }, { icon: 'swordAttack', key: 'Actions' },
    { icon: 'debuffDown', key: 'Stagger' }, { icon: 'skull', key: 'Group' }
  ];
  var GUIDE_TOWER = [
    { icon: 'towerSpire', key: 'Floors' }, { icon: 'doorway', key: 'Waypoint' },
    { icon: 'crownSkull', key: 'Boss' }, { icon: 'skullFire', key: 'Difficulty' }
  ];
  var GUIDE_TIPS = ['guideTip1', 'guideTip2', 'guideTip3', 'guideTip4'];

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
        '<h3>' + T('guideRelationsTitle') + '</h3>' +
        guideCardGrid('guideRel', GUIDE_RELATIONS) +
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

  var DIFF_DESC_KEY = { easy: 'diffEasyDesc', normal: 'diffNormalDesc', hard: 'diffHardDesc', nightmare: 'diffNightmareDesc' };
  var DIFF_ICON = { easy: 'star', normal: 'shieldGuard', hard: 'skullMark', nightmare: 'skullFire' };

  function renderDifficulty() {
    var el = document.getElementById('difficulty-cards');
    var F = window.Game.Formulas;
    var order = ['easy', 'normal', 'hard', 'nightmare'];
    var nightmareUnlocked = window.Game.State.isNightmareUnlocked();
    el.innerHTML = order.map(function (id) {
      var d = F.DIFFICULTY[id];
      var locked = id === 'nightmare' && !nightmareUnlocked;
      return '<button class="select-card' + (locked ? ' locked' : '') + '" data-id="' + id + '">' +
        '<div class="select-card-icon">' + I(locked ? 'lock' : DIFF_ICON[id]) + '</div>' +
        '<div class="select-card-title">' + L(d, 'name') + '</div>' +
        '<div class="select-card-desc">' + T(locked ? 'diffNightmareLockedDesc' : DIFF_DESC_KEY[id]) + '</div>' +
        (locked ? '' :
        '<div class="select-card-stats">' +
          '<span class="stat-chip">' + T('enemyPowerLabel') + d.statMult.toFixed(2) + '</span>' +
          '<span class="stat-chip">' + T('rewardLabel') + d.rewardMult.toFixed(2) + '</span>' +
        '</div>') +
      '</button>';
    }).join('');
    Array.prototype.forEach.call(el.querySelectorAll('.select-card'), function (card) {
      if (card.classList.contains('locked')) {
        card.onclick = function () { SFX('ui_cancel'); };
        return;
      }
      card.onclick = function () {
        var id = card.getAttribute('data-id');
        var proceed = function () {
          SFX('ui_confirm');
          window.Game.State.pending.difficulty = id;
          renderClassSelect();
          showScreen('screen-class');
        };
        // A little friendly taunt on Easy -- nudges toward Normal/Hard without
        // actually blocking the choice (Cancel just returns to this screen).
        if (id === 'easy') {
          SFX('ui_cancel');
          confirmModal({
            title: T('diffEasyTauntTitle'),
            message: T('diffEasyTauntMsg'),
            confirmLabel: T('diffEasyTauntConfirmBtn'),
            onConfirm: proceed
          });
          return;
        }
        proceed();
      };
    });
    document.getElementById('diff-back').innerHTML = I('back');
    document.getElementById('diff-back').onclick = function () { SFX('ui_back'); renderMainMenu(); showScreen('screen-menu'); };
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
          '<span class="el-tag el-' + c.weak + '">' + I(c.weak) + ' ' + T('weakLabel') + '</span>' +
          '<span class="el-tag el-' + c.resist + '">' + I(c.resist) + ' ' + T('resistLabel') + '</span>' +
        '</div>' +
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
        window.Game.State.createRun(window.Game.State.pending.difficulty, classId);
        window.Game.State.saveNow();
        window.Game.TowerUI.renderTower();
        showScreen('screen-tower');
      };
    });
    document.getElementById('class-back').innerHTML = I('back');
    document.getElementById('class-back').onclick = function () { SFX('ui_back'); renderDifficulty(); showScreen('screen-difficulty'); };
  }

  // Re-render whichever of these screens is currently active, called after a language switch.
  function refreshActiveScreen() {
    var active = document.querySelector('.screen.active');
    if (!active) return;
    if (active.id === 'screen-menu') renderMainMenu();
    else if (active.id === 'screen-guide') renderGuide();
    else if (active.id === 'screen-difficulty') renderDifficulty();
    else if (active.id === 'screen-class') renderClassSelect();
    else if (active.id === 'screen-story' && lastStory.kind) renderStory(lastStory.kind, lastStory.onContinue);
  }

  window.Game = window.Game || {};
  window.Game.UI = window.Game.UI || {};
  window.Game.UI.showScreen = showScreen;
  window.Game.UI.confirmModal = confirmModal;
  window.Game.MenuUI = {
    renderMainMenu: renderMainMenu,
    renderGuide: renderGuide,
    renderDifficulty: renderDifficulty,
    renderClassSelect: renderClassSelect,
    renderStory: renderStory,
    confirmModal: confirmModal,
    refreshActiveScreen: refreshActiveScreen
  };
})();
