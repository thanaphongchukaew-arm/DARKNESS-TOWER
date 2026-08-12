// localStorage persistence for the current tower run, plus a small separate
// meta-progress store (achievements that must outlive any single run, like
// unlocking Nightmare difficulty) that clear()/a fresh run never touches.
(function () {
  var KEY = 'towerRPG_save_v1';
  var META_KEY = 'towerRPG_meta_v1';

  function writeMeta(data) {
    try {
      localStorage.setItem(META_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('[Save] failed to write meta:', e);
      return false;
    }
  }

  function readMeta() {
    try {
      var raw = localStorage.getItem(META_KEY);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch (e) {
      console.warn('[Save] failed to read meta, discarding corrupt data:', e);
      localStorage.removeItem(META_KEY);
      return {};
    }
  }

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
  window.Game.Save = { write: write, read: read, clear: clear, exists: exists, writeMeta: writeMeta, readMeta: readMeta };
})();
