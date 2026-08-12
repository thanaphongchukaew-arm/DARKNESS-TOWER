// Central glyph library. Text/ASCII-terminal icon set (no images, no external assets).
(function () {
  var RAW = {
    // ui
    back: '‹',
    close: '✕',
    check: '✓',
    chevronRight: '›',
    lock: '☒',
    save: '▤',
    trash: '†',
    star: '★︎',
    sparkles: '✦︎',

    // resources
    heart: '♥︎',
    drop: '♦︎',
    potion: '!',
    mpPotion: '♦︎',
    scroll: '?',
    gem: '◆',
    coin: '$',

    // elements
    phys: '/',
    fire: '^',
    ice: '✻',
    elec: '≈',
    wind: '»',
    light: '☼︎',
    dark: '☾︎',
    almighty: '✦︎',

    // classes
    blade: '/',
    staffOrb: 'Ψ',
    radiantOrb: '☼︎',

    // combat
    swordAttack: '/',
    shieldGuard: 'Ω',
    magicBurst: '✦︎',
    bagItem: '■',

    // enemy / boss
    skull: '☠︎',
    crownSkull: '♛︎',
    shadowFigure: '☻︎',

    // tower
    towerSpire: '♜︎',
    doorway: '⌂',
    enterFloor: '▶',

    // status
    buffUp: '▲',
    debuffDown: '▼',
    downedMark: '✕',

    // equipment
    weaponSlot: '/',
    armorSlot: 'Ω',
    accessorySlot: '◆',
    shoesSlot: 'Π',

    // audio
    soundOn: '♪',
    soundOff: '♪'
  };

  function glyph(name, extraClass) {
    var cls = extraClass ? 'icon ' + extraClass : 'icon';
    if (window.Game.PixelArt && window.Game.PixelArt.has(name)) {
      return '<span class="' + cls + ' pixel-icon" aria-hidden="true">' + window.Game.PixelArt.render(name) + '</span>';
    }
    var g = RAW[name] || RAW.sparkles;
    return '<span class="' + cls + '" aria-hidden="true">' + g + '</span>';
  }

  window.Game = window.Game || {};
  window.Game.Icons = {
    get: glyph,
    has: function (name) { return !!RAW[name]; }
  };
  window.Game.ElementNames = {
    phys: 'กายภาพ', fire: 'ไฟ', ice: 'น้ำแข็ง', elec: 'สายฟ้า',
    wind: 'ลม', light: 'แสง', dark: 'ความมืด', almighty: 'มหาประลัย'
  };
  window.Game.ElementNamesEn = {
    phys: 'Physical', fire: 'Fire', ice: 'Ice', elec: 'Electric',
    wind: 'Wind', light: 'Light', dark: 'Dark', almighty: 'Almighty'
  };
  window.Game.ElementName = function (el) {
    var lang = window.Game.I18n && window.Game.I18n.getLang();
    var dict = lang === 'en' ? window.Game.ElementNamesEn : window.Game.ElementNames;
    return dict[el] || el;
  };
})();
