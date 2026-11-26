// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// App boot, the game-over/victory screen and the crash safety net.
(function () {
  function T(key, vars) { return window.Game.I18n.t(key, vars); }

  // What the end screen is currently showing, so a language switch can redraw it.
  var lastEnd = null; // { victory: boolean, checkpointFloor: ?number }

  function renderEnd() {
    if (!lastEnd) return;
    var victory = lastEnd.victory, checkpointFloor = lastEnd.checkpointFloor;
    var returnToHideout = !checkpointFloor && window.Game.HideoutUI.preparation();
    document.getElementById('screen-end').dataset.room = victory ? 'victory' : 'defeat';
    window.Game.RoomUI.show('screen-end');
    var iconEl = document.getElementById('end-icon');
    var titleEl = document.getElementById('end-title');
    var msgEl = document.getElementById('end-message');
    var actionsEl = document.getElementById('end-actions');
    iconEl.innerHTML = window.Game.Icons.get(victory ? 'trophy' : 'skull', 'icon-xl');
    iconEl.style.color = victory ? 'var(--accent-gold)' : 'var(--danger)';
    titleEl.textContent = T(victory ? 'victoryTitle' : 'defeatTitle');
    msgEl.textContent = victory ? T('victoryMsg') : checkpointFloor ? T('defeatCheckpointMsg', { floor: checkpointFloor }) : T(returnToHideout ? 'hideoutDefeat' : 'defeatMsg');
    actionsEl.innerHTML =
      (checkpointFloor ? '<button class="btn-primary" id="end-checkpoint-btn">' + T('continueFromCheckpoint', { floor: checkpointFloor }) + '</button>' : '') +
      '<button class="' + (checkpointFloor ? 'btn-secondary' : 'btn-primary') + '" id="end-menu-btn">' + T(returnToHideout ? 'hideoutReturn' : 'backToMenu') + '</button>';
    document.getElementById('end-menu-btn').onclick = function () {
      if (returnToHideout) { window.Game.HideoutUI.open(); return; }
      window.Game.MenuUI.renderMainMenu();
      window.Game.UI.showScreen('screen-menu');
    };
    var resume = document.getElementById('end-checkpoint-btn');
    if (resume) resume.onclick = function () {
      if (!window.Game.State.current) { window.Game.MenuUI.renderMainMenu(); window.Game.UI.showScreen('screen-menu'); return; }
      window.Game.TowerUI.renderTower();
      window.Game.UI.showScreen('screen-tower');
    };
  }

  function showEnd(victory) {
    var S = window.Game.State;
    var run = S.current;
    if (victory && run) {
      // showEnd(true) only ever fires from a final-boss clear (see BattleUI.handleVictory).
      // A Nightmare clear unlocks the 5 Valiant elite classes (see data-classes.js's
      // `unlock` field) and raises the Ascension cap by one (see
      // Formulas.ascensionEnemyMult/ascensionRewardMult) -- meta counters only, so
      // this never touches the battle/victory logic itself.
      S.recordDifficultyCleared(run.difficulty);
      if (run.difficulty === 'nightmare') S.recordAscensionClear(run.ascension || 0);
    }

    var checkpointFloor = null;
    if (!victory && run) {
      // A defeat with a checkpoint puts the run straight back on it, so closing
      // the game on this screen can never leave a dead run in the save slot.
      S.clearBattleMark(run);
      var restored = S.restoreCheckpoint();
      if (restored) checkpointFloor = restored.currentFloor;
    }
    if (run) {
      S.bumpCounter(victory ? 'runsWon' : 'runsLost');
      var reward = checkpointFloor ? null : window.Game.Mastery.settle(run, victory);
      window.Game.SystemsUI.summary(run, victory, reward);
    }
    if (!checkpointFloor) {
      if (run) window.Game.HideoutUI.prepare(run.difficulty, run.ascension, !victory);
      S.clearRun();
    }
    lastEnd = { victory: !!victory, checkpointFloor: checkpointFloor };
    renderEnd();
    window.Game.UI.showScreen('screen-end');
  }

  function refreshEndScreen() {
    if (!lastEnd) return;
    var active = document.querySelector('.screen.active');
    if (!active || active.id !== 'screen-end') return;
    renderEnd();
    var lastRun = window.Game.Save.readMeta().lastRun;
    if (lastRun && lastRun.currentFloor) window.Game.SystemsUI.summary(lastRun, lastEnd.victory, lastRun.masteryReward);
  }

  var renderAudioControls = function () {};

  function initAudioToggle() {
    var btn = document.getElementById('audio-toggle');
    var slider = document.getElementById('music-volume');

    renderAudioControls = function () {
      var muted = window.Game.Audio.isMuted();
      btn.classList.toggle('muted', muted);
      btn.innerHTML = window.Game.Icons.get(muted ? 'soundOff' : 'soundOn');
      slider.value = window.Game.Audio.getMusicVolume();
      slider.style.setProperty('--vol-pct', slider.value + '%');
    };
    btn.onclick = function () {
      window.Game.Audio.unlock();
      var nowMuted = window.Game.Audio.toggleMute();
      renderAudioControls();
      if (!nowMuted) window.Game.Audio.sfx('ui_confirm');
      if (document.querySelector('#screen-settings.active')) window.Game.SettingsUI.renderSettings();
    };
    renderAudioControls();

    slider.addEventListener('input', function () {
      window.Game.Audio.unlock();
      window.Game.Audio.setMusicVolume(parseInt(slider.value, 10));
      slider.style.setProperty('--vol-pct', slider.value + '%');
    });
    slider.addEventListener('change', function () {
      if (document.querySelector('#screen-settings.active')) window.Game.SettingsUI.renderSettings();
    });
  }

  function initLangToggle() {
    var btn = document.getElementById('lang-toggle');
    btn.onclick = function () {
      var next = window.Game.I18n.getLang() === 'th' ? 'en' : 'th';
      window.Game.I18n.setLang(next);
      window.Game.I18n.applyStatic();
      window.Game.MenuUI.refreshActiveScreen();
      window.Game.TowerUI.refreshActiveScreen();
      window.Game.BattleUI.refreshActiveScreen();
      refreshEndScreen();
      if (window.Game.Audio) window.Game.Audio.sfx('ui_confirm');
    };
  }

  // ---- Crash safety net ----
  // An unexpected script error must never strand the player on a frozen screen.
  // The overlay offers a way back without touching the save data.
  var errorShownAt = 0;

  function showErrorOverlay(detail) {
    var now = Date.now();
    if (now - errorShownAt < 1500) return;
    errorShownAt = now;
    try { console.error('[Game] unexpected error:', detail); } catch (e) { /* ignore */ }
    var root = document.getElementById('app-root');
    if (!root) return;
    var overlay = document.getElementById('error-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'error-overlay';
      overlay.className = 'modal-overlay hidden';
      root.appendChild(overlay);
    }
    overlay.innerHTML = '<div class="modal-box"><h3>' + T('errorTitle') + '</h3><p class="note">' + T('errorMsg') + '</p>' +
      '<div class="modal-actions"><button class="btn-ghost" id="error-menu">' + T('errorMenu') + '</button>' +
      '<button class="btn-primary" id="error-reload">' + T('errorReload') + '</button></div></div>';
    overlay.classList.remove('hidden');
    document.getElementById('error-reload').onclick = function () { window.location.reload(); };
    document.getElementById('error-menu').onclick = function () {
      overlay.classList.add('hidden');
      overlay.innerHTML = '';
      try {
        ['modal-root', 'allout-modal', 'battle-submenu'].forEach(function (id) {
          var el = document.getElementById(id);
          if (el) { el.classList.add('hidden'); el.innerHTML = ''; }
        });
        window.Game.MenuUI.renderMainMenu();
        window.Game.UI.showScreen('screen-menu');
      } catch (e) {
        window.location.reload();
      }
    };
  }

  window.addEventListener('error', function (event) {
    // Resource load failures (an <img>/<script> element) also raise 'error' but
    // carry no script error -- only real exceptions should open the overlay.
    if (!event || !(event.error || (event.message && event.filename))) return;
    showErrorOverlay(event.error || event.message);
  });
  window.addEventListener('unhandledrejection', function (event) {
    showErrorOverlay(event && event.reason);
  });

  // ---- Refresh resume ----
  // Every screen change records where the player is (sessionStorage, see
  // Save.writeView) so a page refresh lands back on the same screen.
  var RESUMABLE = ['screen-tower', 'screen-status', 'screen-shop', 'screen-craft', 'screen-quests',
    'screen-codex', 'screen-reward', 'screen-waypoint', 'screen-event'];
  var NEUTRAL = ['screen-settings', 'screen-guide', 'screen-credits'];

  function rememberView(id) {
    var G = window.Game, run = G.State && G.State.current;
    if (!run) { G.Save.clearView(); return; }
    if (NEUTRAL.indexOf(id) !== -1) return;
    if (id === 'screen-battle') return; // written per turn by saveBattleView
    if (RESUMABLE.indexOf(id) === -1 || (id === 'screen-event' && G.StoryUI.isActive())) { G.Save.clearView(); return; }
    var view = G.TowerUI.viewState();
    G.Save.writeView({ screen: id, waypoint: view.waypoint, event: view.event });
  }

  function saveBattleView(snap) {
    snap.screen = 'screen-battle';
    window.Game.Save.writeView(snap);
  }

  function clearBattleView() {
    var v = window.Game.Save.readView();
    if (v && v.screen === 'screen-battle') window.Game.Save.clearView();
  }

  // Returns true when a refresh was resumed in place.
  // Captured at load: the first showScreen('screen-menu') below clears the stored view.
  var bootView = window.Game.Save.readView();

  function tryResume() {
    var G = window.Game, view = bootView;
    bootView = null;
    if (view) G.Save.writeView(view);
    if (!view || !G.Save.exists()) return false;
    var run = view.screen === 'screen-battle' && view.run ? view.run : G.Save.read();
    if (!run) return false;
    try {
      G.State.current = run;
      G.State.normalizeEquipment(run);
      G.State.normalizeRunExtras(run);
      G.State.clampVitals(run);
      if (view.screen === 'screen-battle') {
        if (!view.battle || run.battleMark == null) throw new Error('stale battle view');
        G.BattleUI.restoreBattle(view);
        return true;
      }
      if (run.battleMark != null) { G.State.settleRetreat(run); G.State.saveNow(); }
      if (!G.TowerUI.resumeView(view)) { if (G.TowerUI.resumePendingReward()) return true; G.TowerUI.renderTower(); G.UI.showScreen('screen-tower'); }
      return true;
    } catch (e) {
      console.warn('[Resume] could not restore the previous screen:', e);
      G.State.current = null;
      G.Save.clearView();
      return false;
    }
  }

  window.Game = window.Game || {};
  window.Game.Main = {
    rememberView: rememberView, saveBattleView: saveBattleView, clearBattleView: clearBattleView, tryResume: tryResume,
    showEnd: showEnd,
    refreshAudioControls: function () { renderAudioControls(); },
    refreshEndScreen: refreshEndScreen,
    showErrorOverlay: showErrorOverlay
  };

  document.addEventListener('DOMContentLoaded', function () {
    window.Game.I18n.applyStatic();
    initAudioToggle();
    initLangToggle();
    window.Game.MenuUI.renderMainMenu();
    window.Game.UI.showScreen('screen-menu');
    tryResume();
    var unlocked = false;
    function unlockOnce() {
      if (unlocked) return;
      unlocked = true;
      window.Game.Audio.unlock();
      window.Game.UI.showScreen(document.querySelector('.screen.active').id);
      window.removeEventListener('pointerdown', unlockOnce);
      window.removeEventListener('keydown', unlockOnce);
    }
    window.addEventListener('pointerdown', unlockOnce);
    window.addEventListener('keydown', unlockOnce);
  });
})();
