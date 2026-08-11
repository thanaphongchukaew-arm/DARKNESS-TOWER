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
})();
