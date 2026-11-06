// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Casual deterrent only -- this cannot stop anyone determined (DevTools can
// still be opened from the browser menu, or the page fetched directly), it
// just removes the easy right-click / keyboard shortcuts most people reach for.
(function () {
  document.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  document.addEventListener('keydown', function (e) {
    var k = e.key;
    var mod = e.ctrlKey || e.metaKey;
    var blocked =
      k === 'F12' ||
      (mod && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].indexOf(k) !== -1) ||
      (mod && (k === 'U' || k === 'u')) ||
      (e.metaKey && e.altKey && ['I', 'i', 'J', 'j', 'C', 'c'].indexOf(k) !== -1);
    if (blocked) e.preventDefault();
  });

  // Zoom is only for touch devices (phones + iPad, via pinch). On mouse/keyboard
  // devices block Ctrl/Cmd +/-/0 and Ctrl+wheel zoom; the UI auto-fits the window.
  var touchDevice = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  if (!touchDevice) {
    document.addEventListener('wheel', function (e) {
      if (e.ctrlKey || e.metaKey) e.preventDefault();
    }, { passive: false });
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && ['+', '=', '-', '_', '0'].indexOf(e.key) !== -1) e.preventDefault();
    });
  }
})();
