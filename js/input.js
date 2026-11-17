// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Keyboard and gamepad play. Every screen is plain buttons, so this is one
// generic layer: arrows/WASD (or D-pad/stick) move focus spatially between the
// visible controls of the top-most context, Enter/Space (A) activates, Esc/
// Backspace (B) presses that context's cancel or back control, and 1-9 fire the
// battle commands in order. Mouse and touch play are untouched.
(function () {
  // Native controls plus the clickable rows/cards that are plain elements
  // (enemy target cards, tower floors, inventory tiles, equipment slots).
  var FOCUSABLE = 'button, input[type="range"], select, a[href], summary, [tabindex="0"], ' +
    '.enemy-card.targetable, .floor-row.current, .floor-row.cleared, .inv-tile, .equip-slot[data-slot], .ws-recipe-card';
  var NATIVE = { BUTTON: true, INPUT: true, SELECT: true, A: true, SUMMARY: true };
  var lastIndexByContext = {};

  function visible(el) {
    if (!el || el.disabled) return false;
    if (el.closest('.hidden')) return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  function shown(id) {
    var el = document.getElementById(id);
    return el && !el.classList.contains('hidden') && el.children.length ? el : null;
  }

  // The top-most layer that should own input right now.
  function context() {
    return shown('error-overlay') || shown('modal-root') || shown('allout-modal') || shown('battle-submenu') ||
      document.querySelector('.screen.active') || document.body;
  }

  function controls(ctx) {
    var list = Array.prototype.filter.call(ctx.querySelectorAll(FOCUSABLE), visible);
    // The hint card floats above the screens; keep it reachable from any of them.
    var tip = document.getElementById('tip-card');
    if (tip && ctx.classList && ctx.classList.contains('screen')) {
      Array.prototype.forEach.call(tip.querySelectorAll('button'), function (b) { if (visible(b)) list.push(b); });
    }
    return list;
  }

  function contextKey(ctx) { return ctx.id || 'body'; }

  function remember(ctx, el) {
    var list = controls(ctx), i = list.indexOf(el);
    if (i !== -1) lastIndexByContext[contextKey(ctx)] = i;
  }

  function defaultControl(ctx) {
    var list = controls(ctx);
    if (!list.length) return null;
    var saved = lastIndexByContext[contextKey(ctx)];
    if (saved != null && list[saved]) return list[saved];
    return ctx.querySelector('.btn-primary:not(:disabled)') && visible(ctx.querySelector('.btn-primary:not(:disabled)')) ? ctx.querySelector('.btn-primary:not(:disabled)') :
      (list.filter(function (el) { return !el.classList.contains('btn-icon'); })[0] || list[0]);
  }

  function focus(el, ctx) {
    if (!el) return;
    document.documentElement.classList.add('kbd-nav');
    if (!NATIVE[el.tagName] && !el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
    if (el.scrollIntoView) el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    remember(ctx || context(), el);
  }

  function current(ctx) {
    var el = document.activeElement;
    if (!el || el === document.body || !visible(el)) return null;
    return controls(ctx).indexOf(el) !== -1 ? el : null;
  }

  // Nearest control whose centre lies in the pressed direction.
  function move(dx, dy) {
    var ctx = context();
    var from = current(ctx);
    if (!from) { focus(defaultControl(ctx), ctx); return; }
    var a = from.getBoundingClientRect();
    var ax = a.left + a.width / 2, ay = a.top + a.height / 2;
    var best = null, bestScore = Infinity;
    controls(ctx).forEach(function (el) {
      if (el === from) return;
      var b = el.getBoundingClientRect();
      var bx = b.left + b.width / 2, by = b.top + b.height / 2;
      var along = (bx - ax) * dx + (by - ay) * dy;
      if (along <= 1) return;
      var across = Math.abs((bx - ax) * dy) + Math.abs((by - ay) * dx);
      var score = along + across * 2.5;
      if (score < bestScore) { bestScore = score; best = el; }
    });
    if (best) focus(best, ctx);
  }

  function activate() {
    var ctx = context();
    var el = current(ctx);
    if (!el) { focus(defaultControl(ctx), ctx); return; }
    el.click();
  }

  function back() {
    var ctx = context();
    var target;
    if (ctx.id === 'error-overlay') target = ctx.querySelector('button');
    else if (ctx.id === 'modal-root') target = ctx.querySelector('#modal-cancel, #leave-cancel, .btn-ghost') || (ctx.querySelectorAll('button').length === 1 ? ctx.querySelector('button') : null);
    else if (ctx.id === 'allout-modal') target = ctx.querySelector('#allout-decline');
    else if (ctx.id === 'battle-submenu') target = ctx.querySelector('#submenu-close');
    else target = ctx.querySelector('.screen-header .btn-icon, #battle-home');
    if (target && visible(target)) target.click();
  }

  function battleCommand(n) {
    var ctx = context();
    var host = ctx.id === 'battle-submenu' ? ctx : (ctx.id === 'screen-battle' ? document.getElementById('battle-actions') : null);
    if (!host) return false;
    var list = Array.prototype.filter.call(host.querySelectorAll(ctx.id === 'battle-submenu' ? '.submenu-option' : 'button'), visible);
    if (!list[n - 1]) return false;
    focus(list[n - 1], ctx);
    list[n - 1].click();
    return true;
  }

  function typing(target) {
    if (!target || !target.tagName) return false;
    var tag = target.tagName;
    return tag === 'TEXTAREA' || tag === 'SELECT' || (tag === 'INPUT' && target.type !== 'range' && target.type !== 'file');
  }

  var DIRS = {
    ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
    w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0], W: [0, -1], S: [0, 1], A: [-1, 0], D: [1, 0]
  };

  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey || typing(e.target)) return;
    var dir = DIRS[e.key];
    if (dir) {
      // A focused slider keeps left/right for its own value.
      if (e.target && e.target.type === 'range' && dir[0] !== 0) return;
      e.preventDefault();
      move(dir[0], dir[1]);
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      var ctx = context();
      var el = current(ctx);
      if (!el) { e.preventDefault(); focus(defaultControl(ctx), ctx); }
      else if (!NATIVE[el.tagName]) { e.preventDefault(); el.click(); }
      else document.documentElement.classList.add('kbd-nav');
      return; // a focused native control handles Enter/Space itself
    }
    if (e.key === 'Escape' || e.key === 'Backspace') { e.preventDefault(); back(); return; }
    if (/^[1-9]$/.test(e.key) && battleCommand(parseInt(e.key, 10))) e.preventDefault();
  });

  // Mouse/touch use hides the keyboard focus ring again.
  document.addEventListener('pointerdown', function () { document.documentElement.classList.remove('kbd-nav'); });
  document.addEventListener('focusin', function (e) { var ctx = context(); if (ctx.contains(e.target)) remember(ctx, e.target); });

  // ---- Gamepad: polled only while one is connected ----
  var padLoop = null, held = {}, REPEAT_FIRST = 380, REPEAT_NEXT = 140;

  function press(name, down, now, fn) {
    var h = held[name];
    if (!down) { held[name] = null; return; }
    if (!h) { held[name] = { next: now + REPEAT_FIRST }; fn(); }
    else if (h.repeat !== false && now >= h.next) { h.next = now + REPEAT_NEXT; fn(); }
  }
  function once(name, down, fn) {
    if (!down) { held[name] = null; return; }
    if (!held[name]) { held[name] = { repeat: false }; fn(); }
  }

  function pollPads() {
    var pads = navigator.getGamepads ? navigator.getGamepads() : [];
    var pad = null;
    for (var i = 0; i < pads.length; i++) if (pads[i] && pads[i].connected) { pad = pads[i]; break; }
    if (!pad) { padLoop = null; return; }
    var now = Date.now();
    var b = function (n) { return !!(pad.buttons[n] && pad.buttons[n].pressed); };
    var ax = pad.axes[0] || 0, ay = pad.axes[1] || 0;
    press('up', b(12) || ay < -0.55, now, function () { move(0, -1); });
    press('down', b(13) || ay > 0.55, now, function () { move(0, 1); });
    press('left', b(14) || ax < -0.55, now, function () { move(-1, 0); });
    press('right', b(15) || ax > 0.55, now, function () { move(1, 0); });
    once('a', b(0), activate);
    once('b', b(1), back);
    padLoop = requestAnimationFrame(pollPads);
  }

  window.addEventListener('gamepadconnected', function () { if (!padLoop) padLoop = requestAnimationFrame(pollPads); });

  // Called by UI.showScreen: keep keyboard/gamepad players on a sensible control.
  function onScreen() {
    if (!document.documentElement.classList.contains('kbd-nav')) return;
    setTimeout(function () { var ctx = context(); if (!current(ctx)) focus(defaultControl(ctx), ctx); }, 0);
  }

  window.Game = window.Game || {};
  window.Game.Input = { onScreen: onScreen, move: move, activate: activate, back: back };
})();
