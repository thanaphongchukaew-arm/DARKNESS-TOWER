// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

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
    weaponSlotMag: '†',
    armorSlot: 'Ω',
    accessorySlot: '◆',
    shoesSlot: 'Π',

    // audio
    soundOn: '♪',
    soundOff: '♪',

    // tower events
    eventMerchant: '⚖',
    eventChest: '▣',
    eventShortcut: '↯',
    eventSage: '☯',
    eventShrine: '☥',
    eventCompanion: '☘',

    // blessings
    blessMight: '⚔',
    blessInsight: '✵',
    blessVitality: '✚',
    blessClarity: '❉',
    blessSwiftness: '☄',
    blessFortune: '✾',
    blessWealth: '❂',
    blessWisdom: '❋',
    blessGuardian: '☨',
    blessIronSkin: '⛨',

    // curses
    curseFrailty: '⚱',
    curseFool: '☹',
    curseSlowness: '⌛',
    cursePoverty: '⛓',
    curseWeakArms: '⚹',
    curseDullMind: '☁',

    // companion / codex / ascension
    companionSlot: '⚚',
    trophy: '⚝',
    medal: '❁',
    codex: '❧',
    ascension: '✺',

    // blessings (2nd wave)
    blessTitan: '⛰',
    blessWanderer: '❦',
    blessFocus: '✪',
    blessWildcat: '⚡',
    blessStoneSkin: '❊',
    blessWarding: '✷',

    // curses (2nd wave)
    curseTitanBurden: '⚰',
    curseWandererRuin: '⛔',
    curseBrokenFocus: '☓',
    curseFrailMind: '❍',

    // events (2nd wave)
    eventSpring: '⛲',
    eventBattlefield: '❖',
    eventGambler: '♠',

    // relics
    relicVampiricFang: '♆',
    relicAdrenalineCore: '☢',
    relicStoneWard: '⛊',
    relicMomentumCharm: '↻',
    relicCursedCoin: '⛃',
    relicOpportunist: '⌖',
    relicSwiftRecovery: '✜'
  };

  function glyph(name, extraClass) {
    var cls = extraClass ? 'icon ' + extraClass : 'icon';
    if (window.Game.ClassArt && window.Game.ClassArt.has(name)) return '<span class="' + cls + '" aria-hidden="true">' + window.Game.ClassArt.render(name) + '</span>';
    if (window.Game.PixelArt && window.Game.PixelArt.has(name)) {
      return '<span class="' + cls + ' pixel-icon" aria-hidden="true">' + window.Game.PixelArt.render(name) + '</span>';
    }
    var g = RAW[name] || RAW.sparkles;
    return '<span class="' + cls + '" aria-hidden="true">' + g + '</span>';
  }

  // Small authored silhouettes, shared by every item surface, including worn gear.
  var itemShapes = {
    sword: 'M10 15V5L12 2 14 5V15ZM7 15H17V17H13V22H11V17H7Z',
    curved: 'M10 16L13 10 14 3 18 2 17 10 13 17ZM7 14L16 18 15 20 6 16ZM9 17L12 19 10 23 7 21Z',
    spear: 'M12 1L17 8 14 10V22H10V10L7 8ZM7 12H17V14H7Z',
    staff: 'M11 9H14V23H11ZM9 2H16L19 6 16 10H9L6 6Z',
    tome: 'M4 4H10L12 6 14 4H21V20H14L12 22 10 20H4ZM11 7H13V19H11Z',
    robe: 'M8 3H16L20 8 17 11 16 9 20 22H4L8 9 7 11 4 8ZM10 3L12 8 14 3Z',
    plate: 'M7 3L10 5H14L17 3 22 7 19 12 17 10V21H7V10L5 12 2 7ZM10 8H14V17H10Z',
    leather: 'M8 3L12 6 16 3 20 7 17 10V21H7V10L4 7ZM11 8H13V20H11Z',
    boots: 'M4 4H10V16H13V21H2V17H4ZM15 2H21V14H23V19H14V15H15Z',
    ring: 'M8 7H16L20 11V18L16 22H8L4 18V11ZM9 11L8 13V16L10 18H14L16 16V13L15 11ZM9 2H15L18 5 14 9H10L6 5Z',
    pendant: 'M4 2H7V5H9V8H15V5H17V2H20V6L16 11 18 16 12 23 6 16 8 11 4 6ZM12 12L9 16 12 20 15 16Z',
    hpFlask: 'M8 2H16V5H15V9L19 12V22H5V12L9 9V5H8ZM11 13V15H8V18H11V21H14V18H17V15H14V13Z',
    mpFlask: 'M9 1H15V5H14V9L19 13 21 18 17 23H7L3 18 5 13 10 9V5H9ZM12 12L8 17 12 21 16 17Z'
  };
  function itemShape(item) {
    var id = item.id || '';
    if (item.icon === 'potion') return 'hpFlask';
    if (item.icon === 'mpPotion') return 'mpFlask';
    if (item.kind === 'weapon') {
      if (/tome|grimoire|book/.test(id)) return 'tome';
      if (/staff|scepter|wand/.test(id)) return 'staff';
      if (/lance|glaive|spear|pike/.test(id)) return 'spear';
      if (/fang|soul|katana|saber|sabre/.test(id)) return 'curved';
      return item.icon === 'weaponSlotMag' ? 'staff' : 'sword';
    }
    if (item.kind === 'armor') return /robe|shroud|vestment|mantle/.test(id) ? 'robe' : /leather|padded/.test(id) ? 'leather' : 'plate';
    if (item.kind === 'shoes') return 'boots';
    if (item.kind === 'accessory') return /ring|band/.test(id) ? 'ring' : 'pendant';
    return null;
  }
  function itemGlyph(item) {
    if (!item) return glyph('bagItem');
    var tier = Number(item.tier);
    tier = Number.isFinite(tier) ? Math.max(1, Math.min(16, Math.floor(tier))) : 1;
    var colors = ['#a9b3c5','#84c994','#65bfe8','#b395ef','#efb86c','#ee8498','#f0df99','#83e3d6','#e9a2eb','#c9df79','#ffa275','#a3a4ff','#78deff','#f888ba','#ffe8b7','#ffffff'];
    var mark = item.icon === 'mpPotion' ? 'MP·' + tier : item.icon === 'potion' ? 'HP·' + tier : 'T' + tier;
    var shape = itemShape(item), art = glyph(item.icon);
    if (shape) art = '<span class="icon pixel-icon" aria-hidden="true"><svg class="pixel-sprite item-silhouette" data-shape="' + shape + '" viewBox="0 0 24 24" shape-rendering="crispEdges"><path fill="' + colors[tier - 1] + '" fill-rule="evenodd" stroke="#080b18" stroke-width="1" d="' + itemShapes[shape] + '"/><path d="M10 6H12V8H10Z" fill="#fff4d4"/></svg></span>';
    return '<span class="item-art" style="--item-tier-color:' + colors[tier - 1] + '">' + art + '<small>' + mark + '</small></span>';
  }

  window.Game = window.Game || {};
  window.Game.Icons = {
    get: glyph,
    item: itemGlyph,
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
