// App boot + game-over/victory screen.
(function () {
  function T(key) { return window.Game.I18n.t(key); }

  var lastVictory = null;

  function showEnd(victory) {
    lastVictory = victory;
    var iconEl = document.getElementById('end-icon');
    var titleEl = document.getElementById('end-title');
    var msgEl = document.getElementById('end-message');
    var actionsEl = document.getElementById('end-actions');
    if (victory) {
      // showEnd(true) only ever fires from a final-boss clear (see BattleUI.handleVictory),
      // so this is exactly the moment to check "cleared the tower on hard or above".
      var run = window.Game.State.current;
      if (run && (run.difficulty === 'hard' || run.difficulty === 'nightmare')) {
        window.Game.State.unlockNightmare();
      }
      // Clearing any difficulty is also what unlocks that difficulty's
      // Valiant elite class (see data-classes.js's `unlock` field).
      if (run) window.Game.State.recordDifficultyCleared(run.difficulty);
      iconEl.innerHTML = window.Game.Icons.get('crownSkull', 'icon-xl');
      iconEl.style.color = 'var(--accent-gold)';
      titleEl.textContent = T('victoryTitle');
      msgEl.textContent = T('victoryMsg');
    } else {
      iconEl.innerHTML = window.Game.Icons.get('skull', 'icon-xl');
      iconEl.style.color = 'var(--danger)';
      titleEl.textContent = T('defeatTitle');
      msgEl.textContent = T('defeatMsg');
    }
    window.Game.State.clearRun();
    actionsEl.innerHTML = '<button class="btn-primary" id="end-menu-btn">' + T('backToMenu') + '</button>';
    document.getElementById('end-menu-btn').onclick = function () {
      window.Game.MenuUI.renderMainMenu();
      window.Game.UI.showScreen('screen-menu');
    };
    window.Game.UI.showScreen('screen-end');
  }

  function refreshEndScreen() {
    if (lastVictory === null) return;
    var active = document.querySelector('.screen.active');
    if (!active || active.id !== 'screen-end') return;
    var titleEl = document.getElementById('end-title');
    var msgEl = document.getElementById('end-message');
    titleEl.textContent = T(lastVictory ? 'victoryTitle' : 'defeatTitle');
    msgEl.textContent = T(lastVictory ? 'victoryMsg' : 'defeatMsg');
    var btn = document.getElementById('end-menu-btn');
    if (btn) btn.textContent = T('backToMenu');
  }

  function initAudioToggle() {
    var btn = document.getElementById('audio-toggle');
    var slider = document.getElementById('music-volume');

    function render() {
      var muted = window.Game.Audio.isMuted();
      btn.classList.toggle('muted', muted);
      btn.innerHTML = window.Game.Icons.get(muted ? 'soundOff' : 'soundOn');
    }
    btn.onclick = function () {
      window.Game.Audio.unlock();
      var nowMuted = window.Game.Audio.toggleMute();
      render();
      if (!nowMuted) window.Game.Audio.sfx('ui_confirm');
    };
    render();

    slider.value = window.Game.Audio.getMusicVolume();
    slider.style.setProperty('--vol-pct', slider.value + '%');
    slider.addEventListener('input', function () {
      window.Game.Audio.unlock();
      window.Game.Audio.setMusicVolume(parseInt(slider.value, 10));
      slider.style.setProperty('--vol-pct', slider.value + '%');
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

  window.Game = window.Game || {};
  window.Game.Main = { showEnd: showEnd };

  document.addEventListener('DOMContentLoaded', function () {
    window.Game.I18n.applyStatic();
    initAudioToggle();
    initLangToggle();
    window.Game.MenuUI.renderMainMenu();
    window.Game.UI.showScreen('screen-menu');
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
