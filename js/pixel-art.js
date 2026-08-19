// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Pixel-art rendering engine: turns a text grid into a crisp inline SVG sprite.
// No image assets -- every sprite is authored as rows of palette-key characters.
(function () {
  function renderGrid(grid, palette, extraClass) {
    var h = grid.length;
    var w = grid[0].length;
    var rects = '';
    for (var y = 0; y < h; y++) {
      var row = grid[y];
      var x = 0;
      while (x < w) {
        var c = row[x];
        if (c === '.') { x++; continue; }
        var runStart = x;
        while (x < w && row[x] === c) x++;
        var color = palette[c] || c;
        rects += '<rect x="' + runStart + '" y="' + y + '" width="' + (x - runStart) + '" height="1" fill="' + color + '"/>';
      }
    }
    var cls = 'pixel-sprite' + (extraClass ? ' ' + extraClass : '');
    return '<svg xmlns="http://www.w3.org/2000/svg" class="' + cls + '" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="xMidYMid meet" shape-rendering="crispEdges">' + rects + '</svg>';
  }

  var REGISTRY = {}; // name -> { grid, palette }

  function define(name, grid, palette) {
    REGISTRY[name] = { grid: grid, palette: palette };
  }

  function has(name) {
    return !!REGISTRY[name];
  }

  function render(name, extraClass) {
    var def = REGISTRY[name];
    if (!def) return '';
    return renderGrid(def.grid, def.palette, extraClass);
  }

  window.Game = window.Game || {};
  window.Game.PixelArt = {
    define: define,
    has: has,
    render: render
  };
})();
