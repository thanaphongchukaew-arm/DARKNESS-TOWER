// localStorage persistence for the current tower run.
(function () {
  var KEY = 'towerRPG_save_v1';

  function write(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('[Save] failed to write save:', e);
      return false;
    }
  }

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('[Save] failed to read save, discarding corrupt data:', e);
      localStorage.removeItem(KEY);
      return null;
    }
  }

  function clear() {
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
  }

  function exists() {
    try { return !!localStorage.getItem(KEY); } catch (e) { return false; }
  }

  window.Game = window.Game || {};
  window.Game.Save = { write: write, read: read, clear: clear, exists: exists };
})();
