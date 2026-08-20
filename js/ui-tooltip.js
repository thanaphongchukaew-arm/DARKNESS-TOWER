// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Pixel-styled hover tooltip that replaces the plain native browser bubble.
// Any element with a data-tip="..." attribute (added anywhere in the game,
// no per-screen wiring needed) gets this tooltip on mouse hover.
(function () {
  var OFFSET = 14;
  var tipEl = null;
  var activeTarget = null;

  function ensureTipEl() {
    if (tipEl) return tipEl;
    tipEl = document.createElement('div');
    tipEl.className = 'game-tooltip';
    document.body.appendChild(tipEl);
    return tipEl;
  }

  function findTipTarget(node) {
    while (node && node !== document.body) {
      if (node.hasAttribute && node.hasAttribute('data-tip')) return node;
      node = node.parentNode;
    }
    return null;
  }

  function position(x, y) {
    var el = ensureTipEl();
    var pad = 8;
    var w = el.offsetWidth, h = el.offsetHeight;
    var left = x + OFFSET;
    var top = y + OFFSET;
    if (left + w + pad > window.innerWidth) left = x - w - OFFSET;
    if (top + h + pad > window.innerHeight) top = y - h - OFFSET;
    if (left < pad) left = pad;
    if (top < pad) top = pad;
    el.style.left = left + 'px';
    el.style.top = top + 'px';
  }

  function hide() {
    activeTarget = null;
    if (tipEl) tipEl.classList.remove('visible');
  }

  document.addEventListener('mouseover', function (e) {
    var target = findTipTarget(e.target);
    if (!target || target === activeTarget) return;
    activeTarget = target;
    var el = ensureTipEl();
    el.textContent = target.getAttribute('data-tip');
    el.classList.add('visible');
    position(e.clientX, e.clientY);
  });

  document.addEventListener('mousemove', function (e) {
    if (activeTarget) position(e.clientX, e.clientY);
  });

  document.addEventListener('mouseout', function (e) {
    if (!activeTarget) return;
    var related = e.relatedTarget;
    if (related && (activeTarget.contains(related) || findTipTarget(related) === activeTarget)) return;
    hide();
  });

  // A click (e.g. opening a modal over the hovered tile) shouldn't leave a stale tooltip on screen.
  document.addEventListener('mousedown', hide);
})();
