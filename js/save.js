// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Persistence for the current tower run, the meta-progress store (unlocks and
// records that must outlive any single run) and the difficulty checkpoint.
//
// Every slot is written to localStorage and, in the desktop build, mirrored to a
// real file through window.DesktopBridge (see electron/preload.js). Each slot
// also keeps the previous good copy under "<key>_bak": a save that fails to
// parse is never deleted -- it is set aside under "<key>_corrupt" and the
// backup is restored instead, so a single bad write cannot wipe a long run.
(function () {
  var KEY = 'towerRPG_save_v1';
  var META_KEY = 'towerRPG_meta_v1';
  var CHECKPOINT_KEY = 'towerRPG_checkpoint_v1';
  var SAVE_VERSION = 2;
  var EXPORT_TAG = 'darkness-tower-save';
  var lastError = null;

  function bridge() {
    var b = typeof window !== 'undefined' && window.DesktopBridge;
    return b && b.isDesktop ? b : null;
  }

  function rawGet(key) {
    var value = null;
    try { value = localStorage.getItem(key); } catch (e) { /* storage blocked */ }
    if (value == null && bridge()) {
      try { value = bridge().readSave(key); } catch (e2) { value = null; }
    }
    return value == null ? null : value;
  }

  function rawSet(key, value) {
    var ok = false;
    try { localStorage.setItem(key, value); ok = true; } catch (e) { lastError = e; }
    if (bridge()) {
      try { if (bridge().writeSave(key, value)) ok = true; } catch (e2) { lastError = e2; }
    }
    if (ok) lastError = null;
    return ok;
  }

  function rawRemove(key) {
    try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
    if (bridge()) { try { bridge().removeSave(key); } catch (e2) { /* ignore */ } }
  }

  function parse(raw) {
    if (raw == null) return null;
    try {
      var data = JSON.parse(raw);
      return data && typeof data === 'object' ? data : null;
    } catch (e) {
      return null;
    }
  }

  // Reads a slot, falling back to its backup when the main copy is unreadable.
  function readSlot(key) {
    var raw = rawGet(key);
    var data = parse(raw);
    if (data) return data;
    var backup = parse(rawGet(key + '_bak'));
    if (raw != null) {
      console.warn('[Save] ' + key + ' is unreadable; ' + (backup ? 'restoring the backup copy.' : 'no backup available.'));
      rawSet(key + '_corrupt', raw);
      if (backup) rawSet(key, JSON.stringify(backup)); else rawRemove(key);
    } else if (backup) {
      rawSet(key, JSON.stringify(backup));
    }
    return backup;
  }

  // Writes a slot, first rotating the current good copy into the backup.
  function writeSlot(key, data) {
    var next;
    try { next = JSON.stringify(data); } catch (e) { lastError = e; console.warn('[Save] cannot serialise ' + key + ':', e); return false; }
    var current = rawGet(key);
    if (current != null && current !== next && parse(current)) rawSet(key + '_bak', current);
    var ok = rawSet(key, next);
    if (!ok) console.warn('[Save] failed to write ' + key + ':', lastError);
    return ok;
  }

  function removeSlot(key) {
    rawRemove(key);
    rawRemove(key + '_bak');
  }

  function write(data) {
    if (data && typeof data === 'object') data.saveVersion = SAVE_VERSION;
    return writeSlot(KEY, data);
  }

  function read() {
    var data = readSlot(KEY);
    if (data && !data.saveVersion) data.saveVersion = 1;
    return data;
  }

  function clear() {
    removeSlot(KEY);
    removeSlot(CHECKPOINT_KEY);
  }

  function exists() {
    return rawGet(KEY) != null || rawGet(KEY + '_bak') != null;
  }

  function writeMeta(data) { return writeSlot(META_KEY, data); }
  function readMeta() { return readSlot(META_KEY) || {}; }

  // Checkpoint: a snapshot of the run taken every 10 floors on the difficulties
  // that allow a retry (see State.saveCheckpoint / restoreCheckpoint).
  function writeCheckpoint(data) { return writeSlot(CHECKPOINT_KEY, data); }
  function readCheckpoint() { return readSlot(CHECKPOINT_KEY); }
  function clearCheckpoint() { removeSlot(CHECKPOINT_KEY); }

  // Where the player is right now (screen + any in-flight battle). Lives in
  // sessionStorage on purpose: a page refresh keeps it, but closing the tab or
  // the app drops it, so quitting mid-battle still counts as a retreat.
  var VIEW_KEY = 'towerRPG_view_v1';
  function writeView(view) {
    try { sessionStorage.setItem(VIEW_KEY, JSON.stringify(view)); return true; } catch (e) { return false; }
  }
  function readView() {
    try { return parse(sessionStorage.getItem(VIEW_KEY)); } catch (e) { return null; }
  }
  function clearView() {
    try { sessionStorage.removeItem(VIEW_KEY); } catch (e) { /* ignore */ }
  }

  // Health of the three slots, for the Settings page: is each copy readable, is
  // there a backup to fall back on, and did a bad write ever get set aside?
  function slotHealth(key) {
    var raw = rawGet(key), bak = rawGet(key + '_bak');
    return {
      present: raw != null,
      ok: raw != null && !!parse(raw),
      backup: bak != null && !!parse(bak),
      corrupt: rawGet(key + '_corrupt') != null
    };
  }
  function health() {
    var storageOk = true;
    try { localStorage.setItem('towerRPG_probe', '1'); localStorage.removeItem('towerRPG_probe'); } catch (e) { storageOk = false; }
    return { storageOk: storageOk, lastWriteFailed: lastError != null, run: slotHealth(KEY), meta: slotHealth(META_KEY) };
  }
  // Puts the backup copy of a slot back in place (the bad copy is kept under _corrupt).
  function restoreBackup(which) {
    var key = which === 'meta' ? META_KEY : KEY;
    var backup = parse(rawGet(key + '_bak'));
    if (!backup) return false;
    var current = rawGet(key);
    if (current != null) rawSet(key + '_corrupt', current);
    return rawSet(key, JSON.stringify(backup));
  }

  // Everything a player needs to move to another browser or machine, as text.
  function exportAll() {
    return JSON.stringify({
      tag: EXPORT_TAG,
      saveVersion: SAVE_VERSION,
      exportedAt: new Date().toISOString(),
      run: readSlot(KEY),
      meta: readSlot(META_KEY) || {},
      checkpoint: readSlot(CHECKPOINT_KEY)
    });
  }

  // Returns { ok: true } or { ok: false, reason: 'format' | 'write' }. Nothing is
  // changed unless the whole payload validates first.
  function importAll(text) {
    var data = parse(typeof text === 'string' ? text.trim() : null);
    if (!data || data.tag !== EXPORT_TAG) return { ok: false, reason: 'format' };
    var run = data.run, meta = data.meta, checkpoint = data.checkpoint;
    if (meta != null && (typeof meta !== 'object' || Array.isArray(meta))) return { ok: false, reason: 'format' };
    if (run != null && (typeof run !== 'object' || !run.classId || !run.equipment || !run.inventory || !(run.currentFloor >= 1))) return { ok: false, reason: 'format' };
    if (checkpoint != null && (typeof checkpoint !== 'object' || !checkpoint.classId)) checkpoint = null;
    if (!writeSlot(META_KEY, meta || {})) return { ok: false, reason: 'write' };
    if (run) { if (!write(run)) return { ok: false, reason: 'write' }; } else removeSlot(KEY);
    if (checkpoint) writeSlot(CHECKPOINT_KEY, checkpoint); else removeSlot(CHECKPOINT_KEY);
    return { ok: true, hasRun: !!run };
  }

  window.Game = window.Game || {};
  window.Game.Save = {
    SAVE_VERSION: SAVE_VERSION,
    write: write, read: read, clear: clear, exists: exists,
    writeMeta: writeMeta, readMeta: readMeta,
    writeCheckpoint: writeCheckpoint, readCheckpoint: readCheckpoint, clearCheckpoint: clearCheckpoint,
    writeView: writeView, readView: readView, clearView: clearView,
    exportAll: exportAll, importAll: importAll,
    health: health, restoreBackup: restoreBackup,
    lastError: function () { return lastError; }
  };
})();
