// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Settings (audio, display, hints, save export/import, controls) and Credits.
(function () {
  function I(name, cls) { return window.Game.Icons.get(name, cls); }
  function SFX(name) { if (window.Game.Audio) window.Game.Audio.sfx(name); }
  function T(key, vars) { return window.Game.I18n.t(key, vars); }

  function desktop() { return window.DesktopBridge && window.DesktopBridge.isDesktop ? window.DesktopBridge : null; }

  function isFullscreen() {
    if (desktop()) return !!desktop().isFullscreen();
    return !!document.fullscreenElement;
  }

  function canFullscreen() {
    return !!desktop() || !!(document.documentElement.requestFullscreen && document.fullscreenEnabled);
  }

  function setFullscreen(on) {
    if (desktop()) { desktop().setFullscreen(on); return; }
    try {
      if (on) { var p = document.documentElement.requestFullscreen(); if (p && p.catch) p.catch(function () {}); }
      else if (document.fullscreenElement) document.exitFullscreen();
    } catch (e) { /* not allowed here */ }
  }

  function battleSpeed() {
    var speed = window.Game.Save.readMeta().battleSpeed;
    return speed === 2 || speed === 4 ? speed : 1;
  }

  function row(label, control) {
    return '<div class="settings-row"><span class="settings-label">' + label + '</span><span class="settings-control">' + control + '</span></div>';
  }

  function toggleBtn(id, on) {
    return '<button class="btn-secondary settings-toggle' + (on ? ' on' : '') + '" id="' + id + '" aria-pressed="' + (on ? 'true' : 'false') + '">' + T(on ? 'setOn' : 'setOff') + '</button>';
  }

  function slider(id, value, label) {
    return '<input type="range" id="' + id + '" class="music-volume settings-slider" min="0" max="100" step="1" value="' + value + '" aria-label="' + label + '" style="--vol-pct:' + value + '%"><span class="settings-value" id="' + id + '-value">' + value + '</span>';
  }

  function exportSave() {
    var text = window.Game.Save.exportAll();
    var stamp = new Date().toISOString().slice(0, 10);
    var blob = new Blob([text], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'darkness-tower-save-' + stamp + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    window.Game.UI.notice(T('setExportDone'));
  }

  function importSave(text) {
    var result = window.Game.Save.importAll(text);
    if (!result.ok) {
      SFX('ui_error');
      window.Game.UI.notice(T(result.reason === 'write' ? 'setImportFail' : 'setImportBad'), 'warn');
      return;
    }
    // The imported data replaces whatever run was loaded in memory.
    window.Game.State.current = null;
    SFX('item_get');
    window.Game.UI.notice(T('setImportOk'));
    renderSettings();
  }

  function renderSettings() {
    var A = window.Game.Audio, Tips = window.Game.Tips;
    var lang = window.Game.I18n.getLang();
    var html =
      '<div class="guide-section"><h3>' + T('setAudioTitle') + '</h3>' +
        row(T('setMusicVol'), slider('set-music', A.getMusicVolume(), T('setMusicVol'))) +
        row(T('setSfxVol'), slider('set-sfx', A.getSfxVolume(), T('setSfxVol'))) +
        row(T('setMute'), toggleBtn('set-mute', A.isMuted())) +
      '</div>' +
      '<div class="guide-section"><h3>' + T('setDisplayTitle') + '</h3>' +
        row(T('setLanguage'), '<button class="btn-secondary" id="set-lang">' + (lang === 'en' ? 'English' : 'ไทย') + '</button>') +
        row(T('setBattleSpeed'), '<button class="btn-secondary" id="set-speed">×' + battleSpeed() + '</button>') +
        (canFullscreen() ? row(T('setFullscreen'), toggleBtn('set-fullscreen', isFullscreen())) : '') +
        row(T('setHints'), toggleBtn('set-hints', Tips.enabled())) +
        row('', '<button class="btn-ghost" id="set-hints-reset">' + T('setHintsReset') + '</button>') +
      '</div>' +
      '<div class="guide-section"><h3>' + T('setSaveTitle') + '</h3>' +
        '<p>' + T('setSaveNote') + '</p>' +
        '<div class="settings-actions">' +
          '<button class="btn-secondary" id="set-export">' + T('setExport') + '</button>' +
          '<button class="btn-secondary" id="set-import">' + T('setImport') + '</button>' +
          '<input type="file" id="set-import-file" accept=".json,application/json" hidden>' +
        '</div>' +
      '</div>' +
      '<div class="guide-section"><h3>' + T('setControlsTitle') + '</h3>' +
        '<p>' + T('setControlsKeys') + '</p><p>' + T('setControlsPad') + '</p>' +
      '</div>';
    document.getElementById('settings-content').innerHTML = html;

    function bindSlider(id, apply) {
      var el = document.getElementById(id);
      el.addEventListener('input', function () {
        var value = parseInt(el.value, 10);
        A.unlock();
        apply(value);
        el.style.setProperty('--vol-pct', value + '%');
        document.getElementById(id + '-value').textContent = value;
        if (window.Game.Main.refreshAudioControls) window.Game.Main.refreshAudioControls();
      });
    }
    bindSlider('set-music', function (v) { A.setMusicVolume(v); });
    bindSlider('set-sfx', function (v) { A.setSfxVolume(v); });
    document.getElementById('set-sfx').addEventListener('change', function () { SFX('ui_confirm'); });

    document.getElementById('set-mute').onclick = function () {
      A.unlock();
      var muted = A.toggleMute();
      if (!muted) SFX('ui_confirm');
      if (window.Game.Main.refreshAudioControls) window.Game.Main.refreshAudioControls();
      renderSettings();
    };
    document.getElementById('set-lang').onclick = function () { document.getElementById('lang-toggle').click(); };
    document.getElementById('set-speed').onclick = function () {
      SFX('ui_confirm');
      var meta = window.Game.Save.readMeta();
      meta.battleSpeed = battleSpeed() === 1 ? 2 : battleSpeed() === 2 ? 4 : 1;
      window.Game.Save.writeMeta(meta);
      renderSettings();
    };
    var fs = document.getElementById('set-fullscreen');
    if (fs) fs.onclick = function () {
      SFX('ui_confirm');
      setFullscreen(!isFullscreen());
      setTimeout(function () { if (document.querySelector('#screen-settings.active')) renderSettings(); }, 250);
    };
    document.getElementById('set-hints').onclick = function () {
      SFX('ui_confirm');
      Tips.setEnabled(!Tips.enabled());
      renderSettings();
    };
    document.getElementById('set-hints-reset').onclick = function () {
      SFX('ui_confirm');
      Tips.reset();
      window.Game.UI.notice(T('setHintsResetDone'));
      renderSettings();
    };
    document.getElementById('set-export').onclick = function () { SFX('ui_confirm'); exportSave(); };
    var file = document.getElementById('set-import-file');
    document.getElementById('set-import').onclick = function () { SFX('ui_confirm'); file.value = ''; file.click(); };
    file.onchange = function () {
      var picked = file.files && file.files[0];
      if (!picked) return;
      var reader = new FileReader();
      reader.onload = function () {
        var text = String(reader.result || '');
        window.Game.UI.confirmModal({
          title: T('setImportConfirmTitle'), message: T('setImportConfirmMsg'), confirmLabel: T('setImportConfirmBtn'), danger: true,
          onConfirm: function () { importSave(text); }
        });
      };
      reader.onerror = function () { window.Game.UI.notice(T('setImportBad'), 'warn'); };
      reader.readAsText(picked);
    };

    document.getElementById('settings-back').innerHTML = I('back');
    document.getElementById('settings-back').onclick = backToMenu;
  }

  // Gear button (every screen): open Settings on top, and Back returns to where we were.
  var returnScreen = null;
  function openFromGear() {
    var active = document.querySelector('.screen.active');
    if (!active || active.id === 'screen-settings') return;
    returnScreen = active.id;
    SFX('ui_confirm');
    renderSettings();
    active.classList.remove('active');
    document.getElementById('screen-settings').classList.add('active');
  }

  function backToMenu() {
    SFX('ui_back');
    if (returnScreen && document.getElementById(returnScreen)) {
      var target = returnScreen;
      returnScreen = null;
      document.getElementById('screen-settings').classList.remove('active');
      document.getElementById(target).classList.add('active');
      // The language may have changed while Settings was on top: re-render the screen we return to.
      var G = window.Game;
      if (G.MenuUI) G.MenuUI.refreshActiveScreen();
      if (G.TowerUI) G.TowerUI.refreshActiveScreen();
      if (G.BattleUI) G.BattleUI.refreshActiveScreen();
      if (G.Main && G.Main.refreshEndScreen) G.Main.refreshEndScreen();
      return;
    }
    window.Game.MenuUI.renderMainMenu();
    window.Game.UI.showScreen('screen-menu');
  }

  function section(titleKey, body) {
    return '<div class="guide-section"><h3>' + T(titleKey) + '</h3><p>' + body + '</p></div>';
  }

  function renderCredits() {
    var version = (document.getElementById('version-tag') || {}).textContent || '';
    document.getElementById('credits-content').innerHTML =
      '<div class="guide-section credits-head"><h3>DARKNESS TOWER ' + version + '</h3>' +
        '<p>' + T('creditsMadeBy') + ': ธนพงศ์ ชูแก้ว (Thanaphong Chukaew)</p>' +
        '<p>Copyright © Thanaphong Chukaew. All rights reserved.</p></div>' +
      section('creditsArt', T('creditsArtBody')) +
      section('creditsAudio', T('creditsAudioBody')) +
      section('creditsFonts', T('creditsFontsBody')) +
      section('creditsTech', T('creditsTechBody')) +
      '<div class="guide-section"><p>' + T('creditsThanks') + '</p></div>';
    document.getElementById('credits-back').innerHTML = I('back');
    document.getElementById('credits-back').onclick = backToMenu;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var g = document.getElementById('open-settings');
    if (!g) return;
    g.innerHTML = I('settingsGear');
    g.onclick = openFromGear;
  });

  window.Game = window.Game || {};
  window.Game.SettingsUI = { openFromGear: openFromGear, renderSettings: renderSettings, renderCredits: renderCredits };
})();
