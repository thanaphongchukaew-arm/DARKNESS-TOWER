// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// First-time hints: each system is explained once, at the moment the player
// first meets it, instead of only in the long How to Play page. Seen hints and
// the on/off switch live in the meta store so they survive every run.
(function () {
  var queue = [], showing = null, timer = null;

  function meta() { return window.Game.Save.readMeta(); }
  function enabled() { return !meta().tipsOff; }
  function seen(id) { var m = meta(); return !!(m.tipsSeen && m.tipsSeen[id]); }

  function markSeen(id) {
    var m = meta();
    m.tipsSeen = m.tipsSeen || {};
    if (m.tipsSeen[id]) return;
    m.tipsSeen[id] = true;
    window.Game.Save.writeMeta(m);
  }

  function card() {
    var el = document.getElementById('tip-card');
    if (!el) {
      el = document.createElement('div');
      el.id = 'tip-card';
      el.className = 'tip-card hidden';
      el.setAttribute('role', 'status');
      document.getElementById('app-root').appendChild(el);
    }
    return el;
  }

  function dismiss() {
    clearTimeout(timer);
    showing = null;
    var el = card();
    el.classList.add('hidden');
    el.innerHTML = '';
    next();
  }

  function next() {
    if (showing || !queue.length) return;
    showing = queue.shift();
    var el = card();
    el.innerHTML = '<span class="tip-card-icon">' + window.Game.Icons.get('sparkles') + '</span>' +
      '<span class="tip-card-text"></span>' +
      '<button class="btn-ghost tip-card-ok" id="tip-card-ok"></button>';
    el.querySelector('.tip-card-text').textContent = window.Game.I18n.t(showing);
    var ok = document.getElementById('tip-card-ok');
    ok.textContent = window.Game.I18n.t('tipGotIt');
    ok.onclick = dismiss;
    el.classList.remove('hidden');
    timer = setTimeout(dismiss, 14000);
  }

  // Queues a hint the first time its id is requested. Returns true if queued.
  function show(id) {
    if (!enabled() || seen(id) || showing === id || queue.indexOf(id) !== -1) return false;
    markSeen(id);
    queue.push(id);
    next();
    return true;
  }

  function onScreen(screenId) {
    var S = window.Game.State, F = window.Game.Formulas, D = window.Game.Data;
    var run = S && S.current;
    if (screenId === 'screen-tower' && run) {
      if (!show('tipTower')) {
        if (D.getMiniBoss(run.currentFloor)) show('tipMiniBoss');
        else if (F.isChampionFloor(run.currentFloor)) show('tipChampion');
      }
    } else if (screenId === 'screen-battle') show('tipBattleBasics');
    else if (screenId === 'screen-waypoint') show('tipWaypoint');
    else if (screenId === 'screen-shop') show('tipShop');
    else if (screenId === 'screen-craft') show('tipCraft');
    else if (screenId === 'screen-menu' || screenId === 'screen-end') { queue = []; if (showing) dismiss(); }
  }

  var EVENT_TIPS = { allOutReady: 'tipRally', enemyBroken: 'tipBreak', focusReady: 'tipFocus' };
  function onBattleEvents(events) {
    if (!enabled()) return;
    (events || []).forEach(function (e) {
      if (e.type === 'affinity' && e.weak) show('tipWeakness');
      else if (EVENT_TIPS[e.type]) show(EVENT_TIPS[e.type]);
    });
  }

  function setEnabled(on) {
    var m = meta();
    m.tipsOff = !on;
    window.Game.Save.writeMeta(m);
    if (!on) { queue = []; if (showing) dismiss(); }
  }

  function reset() {
    var m = meta();
    m.tipsSeen = {};
    m.tipsOff = false;
    window.Game.Save.writeMeta(m);
  }

  window.Game = window.Game || {};
  window.Game.Tips = { show: show, onScreen: onScreen, onBattleEvents: onBattleEvents, enabled: enabled, setEnabled: setEnabled, reset: reset };
})();
