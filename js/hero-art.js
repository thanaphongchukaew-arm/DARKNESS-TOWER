// Layered palette-grid variants retain each class's original silhouette.
(function () {
  var G = window.Game, P = G.PixelArt;
  var schemes = {
    riposte: { light: '#b6d2e0', dark: '#405c7c', edge: '#f7d887', glow: '#8fe4f0' },
    flurry: { light: '#a490db', dark: '#463267', edge: '#afffe6', glow: '#70e5bd' },
    pierce: { light: '#dfb264', dark: '#785034', edge: '#fff0b7', glow: '#ffd278' }
  };
  var shield = ['..KKKK..','.KHHCCK.','KHHCCCDK','KHCCCCDK','KHCHHCDK','.KCCCDK.','.KCCDDK.','..KDDK..','...KK...'];
  var blade = ['.....HK.','....HCK.','...HCK..','..HCK...','.HCK....','HCK.....','.DYD....','..DYD...','...DD...'];
  var lance = ['...H....','..HCH...','.HCCH...','..YCK...','..YCK...','..YDK...','..YDK...','..YDK...','..YDK...','..YDK...','..YDK...','..DDK...'];
  var arrow = ['......HH','.....HCH','....HCCH','...HCK..','..HCK...','.HCK....','HCK.....','KK......'];
  var orb = ['..HH....','.HCCK...','HCCCCK..','.CCCD...','..DD....','........','.C..C...','..CC....'];
  var halo = ['.......CCC.......','....CCC...CCC....','..CC.........CC..','.C.............C.','C...............C','.C.............C.','..CC.........CC..','....CCC...CCC....','.......CCC.......'];
  var runes = ['..C.......C.......C..','...C.C.........C.C...','C....C.C.C.C.C.C....C','.CC...............CC.','...CCCCCCCCCCCCCCC...'];
  function layer(grid, palette, x, y, cls) {
    var svg = P.renderGrid(grid, palette);
    return '<g class="' + cls + '" transform="translate(' + x + ' ' + y + ')">' + svg.slice(svg.indexOf('>') + 1, svg.lastIndexOf('</svg>')) + '</g>';
  }
  function render(run, extraClass) {
    var cls = G.Data.getClass(run.classId) || G.Data.classes[0], def = P.getDefinition(cls.icon);
    if (!def) return G.Icons.get(cls.icon);
    var talents = run.talents || {}, primary = talents[5], scheme = schemes[primary];
    var palette = def.palette, layers = '', magic = cls.baseStats.mag > cls.baseStats.atk || cls.id === 'monk';
    var ranged = ['ranger', 'beastmaster', 'gunslinger', 'sharpshooter'].indexOf(cls.id) !== -1;
    if (scheme) {
      if (palette.R) { palette.R = scheme.dark; palette.G = scheme.light; palette.Y = scheme.edge; if (palette.W) palette.W = scheme.edge; }
      if (palette.N) palette.N = scheme.dark;
      if (palette.B) palette.B = scheme.light;
      if (palette.p) palette.p = scheme.glow;
    }
    var glow = talents[15] === 'burning_wind' ? '#f99a5e' : talents[15] === 'focus_guard' ? '#ffe2a1' : talents[15] === 'overdrive_echo' ? '#9ddbf8' : scheme ? scheme.glow : '#bbb1cf';
    if (talents[15]) layers += layer(halo, { C: glow }, 7, 1, 'hero-halo');
    if (talents[10]) layers += layer(runes, { C: talents[10] === 'affliction' ? '#84e5a8' : talents[10] === 'clean_guard' ? '#d5faff' : '#7bd6f2' }, 5, 26, 'hero-runes');
    layers += layer(def.grid, palette, 8, 7, 'hero-body');
    if (scheme) {
      var weaponPalette = { K: '#111422', H: scheme.edge, C: scheme.light, D: scheme.dark, Y: '#dca852' };
      if (primary === 'riposte') layers += layer(shield, weaponPalette, 2, 16, 'hero-armament hero-shield');
      else if (primary === 'flurry') {
        layers += layer(magic ? orb : ranged ? arrow : blade, weaponPalette, 1, 12, 'hero-armament hero-offhand');
        layers += layer(magic ? orb : ranged ? arrow : blade, weaponPalette, 23, 10, 'hero-armament hero-mainhand');
      } else layers += layer(magic ? orb : ranged ? arrow : lance, weaponPalette, 24, 8, 'hero-armament hero-mainhand');
    }
    if (talents[15] === 'overdrive_echo') layers += layer(['.C.','CHC','.C.'], { C: '#84cce8', H: '#e1ffff' }, 3, 6, 'hero-wisp');
    if (talents[15] === 'burning_wind') layers += layer(['..C..','.CHC.','CHHHC','.CHC.'], { C: '#e56a40', H: '#ffe7a4' }, 25, 22, 'hero-wisp');
    return '<span class="hero-visual ' + (extraClass || '') + '" data-primary="' + (primary || 'base') + '" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" class="hero-art pixel-sprite" viewBox="0 0 32 32" shape-rendering="crispEdges">' + layers + '</svg><span class="hero-slash"></span><span class="hero-ward"></span></span>';
  }
  function animate(mode, target) {
    var hero = target || document.querySelector('#battle-player-panel .hero-visual');
    if (!hero) return;
    ['attack', 'cast', 'guard', 'hurt'].forEach(function (id) { hero.classList.remove('hero-' + id); });
    void hero.offsetWidth;
    hero.classList.add('hero-' + mode);
  }
  G.HeroArt = { render: render, animate: animate };
})();
