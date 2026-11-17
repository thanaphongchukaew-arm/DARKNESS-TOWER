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

  function itemGlyph(item) {
    if (!item) return glyph('bagItem');
    var tier = Math.max(1, Math.min(16, Number(item.tier) || 1));
    var colors = ['#a9b3c5','#84c994','#65bfe8','#b395ef','#efb86c','#ee8498','#f0df99','#83e3d6','#e9a2eb','#c9df79','#ffa275','#a3a4ff','#78deff','#f888ba','#ffe8b7','#ffffff'];
    var mark = item.icon === 'mpPotion' ? 'MP·' + tier : item.icon === 'potion' ? 'HP·' + tier : 'T' + tier;
    return '<span class="item-art" style="--item-tier-color:' + colors[tier - 1] + '">' + glyph(item.icon) + '<small>' + mark + '</small></span>';
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
