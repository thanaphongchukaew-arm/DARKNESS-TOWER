// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Shared 16-bit UI emblems, authored item artwork, and character portraits.
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
    var npc = window.Game.NPCArt && window.Game.NPCArt.render(name);
    if(npc)return '<span class="'+cls+' pixel-icon" aria-hidden="true">'+npc+'</span>';
    var companion = window.Game.CompanionArt && window.Game.CompanionArt.render(name);
    if(companion)return '<span class="'+cls+' pixel-icon" aria-hidden="true">'+companion+'</span>';
    var emblem = window.Game.UISymbols && window.Game.UISymbols.render(name);
    if (emblem) return '<span class="' + cls + ' pixel-icon" aria-hidden="true">' + emblem + '</span>';
    if (window.Game.ClassArt && window.Game.ClassArt.has(name)) return '<span class="' + cls + '" aria-hidden="true">' + window.Game.ClassArt.render(name) + '</span>';
    // Generic scene icons must not be hijacked by a monster that happens to share the name.
    var sceneIcon = name === 'skull' || name === 'crownSkull';
    if (window.Game.MonsterArt && !sceneIcon) {
      var monster = window.Game.MonsterArt.icon(name);
      if (monster) {
        // Monster PNGs may not all be shipped yet: if one fails to load, swap in the vector/glyph icon.
        var fb = (window.Game.PixelArt && window.Game.PixelArt.has(name))
          ? window.Game.PixelArt.render(name) : (RAW[name] || RAW.sparkles);
        fb = fb.replace(/"/g, '&quot;');
        monster = monster.replace('<image ', '<image onerror="this.closest(\'.icon\').innerHTML=this.closest(\'.icon\').dataset.fb" ');
        return '<span class="' + cls + '" data-fb="' + fb + '" aria-hidden="true">' + monster + '</span>';
      }
    }
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
    plate: 'M7 3L10 5H14L17 3 22 7 19 12 17 10V21H7V10L5 12 2 7Z',
    leather: 'M8 3L12 6 16 3 20 7 17 10V21H7V10L4 7ZM11 8H13V20H11Z',
    boots: 'M4 4H10V16H13V21H2V17H4ZM15 2H21V14H23V19H14V15H15Z',
    ring: 'M8 7H16L20 11V18L16 22H8L4 18V11ZM9 11L8 13V16L10 18H14L16 16V13L15 11ZM9 2H15L18 5 14 9H10L6 5Z',
    pendant: 'M4 2H7V5H9V8H15V5H17V2H20V6L16 11 18 16 12 23 6 16 8 11 4 6ZM12 12L9 16 12 20 15 16Z',
    hpFlask: 'M8 2H16V5H15V9L19 12V22H5V12L9 9V5H8ZM11 13V15H8V18H11V21H14V18H17V15H14V13Z',
    mpFlask: 'M9 1H15V5H14V9L19 13 21 18 17 23H7L3 18 5 13 10 9V5H9ZM12 12L8 17 12 21 16 17Z',
    crown: 'M3 6H5V9H8V7H10V3H14V7H16V9H19V6H21V19H3Z',
    bell: 'M10 2H14V5H17V8H19V16H21V19H3V16H5V8H8V5H10ZM10 20H14V23H10Z',
    medal: 'M5 2H10L12 8 14 2H19L16 11 19 15V19L15 23H9L5 19V15L8 11Z',
    heart: 'M5 5H10V7H14V5H19V7H21V12H19V15H16V18H14V21H10V18H8V16H5V13H3V7H5Z',
    scroll: 'M5 3H20V6H18V18H20V21H4V18H6V6H3V4H5Z',
    fang: 'M7 2H16V5H18V10H16V14H14V17H11V20H7V22H3V19H6V16H8V12H9V7H7Z',
    scale: 'M10 2H14V4H18V7H21V13H19V17H16V20H12V23H9V20H6V17H3V10H5V6H8V4H10Z',
    dust: 'M7 3H16V6H14V9H17V12H20V22H4V12H7V9H10V6H7Z',
    crystal: 'M10 2H14V5H17V10H21V17H18V21H6V19H3V12H7V7H10Z',
    core: 'M8 2H16V4H20V8H22V16H20V20H16V22H8V20H4V16H2V8H4V4H8ZM8 7V9H6V15H8V18H16V15H18V9H16V7Z',
    feather: 'M17 2H21V9H19V12H17V15H14V18H10V20H6V23H3V20H5V16H7V11H10V7H13V4H17Z',
    bone: 'M4 3H8V5H10V8L17 15H20V17H22V21H18V19H16L8 11H5V9H2V5H4Z'
  };
  function itemShape(item) {
    var id = item.id || '';
    if (item.icon === 'potion') return 'hpFlask';
    if (item.icon === 'mpPotion') return 'mpFlask';
    if (item.effect && (item.effect.type === 'healBoth' || item.effect.type === 'cleanse')) return 'mpFlask';
    if (id === 'skill_scroll') return 'scroll';
    if (item.kind === 'material') {
      if (/fang/.test(id)) return 'fang';
      if (/scale/.test(id)) return 'scale';
      if (/dust|essence/.test(id)) return 'dust';
      if (/feather/.test(id)) return 'feather';
      if (/bone/.test(id)) return 'bone';
      if (/shard/.test(id)) return 'crystal';
      if (/core/.test(id)) return 'core';
    }
    if (item.kind === 'weapon') {
      if (/tome|grimoire|book/.test(id)) return 'tome';
      if (/staff|scepter|wand/.test(id)) return 'staff';
      if (/lance|glaive|spear|pike/.test(id)) return 'spear';
      if (/fang|soul|katana|saber|sabre/.test(id)) return 'curved';
      return item.icon === 'weaponSlotMag' ? 'staff' : 'sword';
    }
    if (item.kind === 'armor') return /robe|shroud|vestment|mantle/.test(id) ? 'robe' : /leather|padded/.test(id) ? 'leather' : 'plate';
    if (item.kind === 'shoes') return 'boots';
    if (item.kind === 'accessory') {
      if (/ring|band|loop|shatter_prism/.test(id)) return 'ring';
      if (/crown/.test(id)) return 'crown';
      if (/bell/.test(id)) return 'bell';
      if (/crest|seal|badge|medal|relic/.test(id)) return 'medal';
      if (/heart/.test(id)) return 'heart';
      if (/pact/.test(id)) return 'scroll';
      return 'pendant';
    }
    return null;
  }
  var itemDetails = {
    sword: ['M11 5H12V14H11Z', 'M7 15H17V17H7ZM11 19H13V21H11Z'],
    curved: ['M14 4H16V9H14ZM12 10H14V14H12Z', 'M7 14L16 18 15 20 6 16Z'],
    spear: ['M11 4H12V9H11Z', 'M10 11H14V22H10Z'],
    staff: ['M10 3H15V5H17V7H15V9H10V7H8V5H10Z', 'M11 11H14V23H11Z'],
    tome: ['M6 6H10V18H6ZM14 6H19V18H14Z', 'M5 4H8V20H5ZM17 9H19V11H17ZM17 13H19V15H17Z'],
    robe: ['M9 9H11V19H8ZM14 9H15V19H17Z', 'M10 3L12 8 14 3ZM8 14H16V16H8Z'],
    plate: ['M8 6H10V18H8ZM11 7H14V10H11Z', 'M7 18H17V20H7ZM3 7H6V10H3ZM18 7H21V10H18Z'],
    leather: ['M9 6H11V19H9Z', 'M7 15H17V17H7ZM12 8H14V10H12Z'],
    boots: ['M5 5H7V14H5ZM16 3H18V12H16Z', 'M3 18H12V20H3ZM15 16H22V18H15Z'],
    ring: ['M6 12H8V17H6ZM9 19H15V21H9Z', 'M10 3H14V7H10Z'],
    pendant: ['M5 3H6V5H5ZM10 14H12V18H10Z', 'M10 13H14V19H10Z'],
    hpFlask: ['M6 13H9V20H6Z', 'M8 2H16V5H8ZM11 14H13V20H11ZM9 16H15V18H9Z'],
    mpFlask: ['M6 14H9V19H6Z', 'M9 1H15V5H9ZM11 13H13V20H11Z'],
    crown: ['M4 15H20V18H4Z', 'M10 10H14V14H10Z'],
    bell: ['M7 9H9V16H7Z', 'M5 17H19V19H5ZM10 3H14V5H10Z'],
    medal: ['M8 15H10V19H8Z', 'M5 2H9L12 10H9ZM11 16H14V19H11Z'],
    heart: ['M5 8H9V10H7V13H5Z', 'M14 8H18V10H14Z'],
    scroll: ['M8 5H17V18H8Z', 'M10 8H15V10H10ZM10 12H14V14H10Z'],
    fang: ['M9 3H13V7H11V12H9V16H7V18H5V20H4V18H7V13H9Z', 'M7 2H16V5H8Z'],
    scale: ['M10 5H12V10H8V14H6V10H8V7H10Z', 'M5 14H8V16H11V19H14V17H17V14H19V17H16V20H12V22H10V19H7V17H5Z'],
    dust: ['M6 13H8V20H6ZM11 11H13V13H11ZM14 14H16V16H14ZM10 17H13V20H10Z', 'M7 3H16V6H7ZM8 9H15V11H8Z'],
    crystal: ['M10 5H12V17H10ZM5 13H7V18H5Z', 'M14 9H16V18H14ZM18 13H20V16H18Z'],
    core: ['M9 5H15V7H9ZM5 9H7V15H5ZM17 17H19V19H17Z', 'M11 8H14V11H16V14H13V17H10V14H8V11H11Z'],
    feather: ['M17 4H19V8H17V11H14V14H11V17H8V18H6V17H9V13H12V10H15V7H17Z', 'M6 18H9V20H6ZM11 12H16V14H11ZM15 7H20V9H15Z'],
    bone: ['M4 4H7V7H4ZM8 8H10V10H8ZM17 17H19V20H17Z', 'M10 10H12V12H10ZM12 12H14V14H12Z']
  };
  // Small, authored engravings and silhouettes tied to the actual item identity.
  // Upgraded gear retains its base design and gains a visible mechanical trait.
  function ornament(item) {
    var id=item.baseId||item.id||'', d='', extra='', metal='#f3dfac', glow='#a3e8ef';
    function path(color,data){return '<path fill="'+color+'" d="'+data+'"/>';}
    if(item.kind==='weapon') {
      if(/rusty/.test(id))d='M12 5H14V7H12ZM10 9H12V11H10ZM12 13H14V15H12Z';
      else if(/hunting/.test(id))d='M9 7H11V9H9ZM9 11H11V13H9ZM14 5H16V7H14Z';
      else if(/knight/.test(id))d='M8 13H10V15H8ZM14 13H16V15H14ZM11 17H13V20H11Z';
      else if(/apprentice/.test(id))d='M10 4H14V7H10ZM12 12H14V14H12ZM10 17H12V19H10Z';
      else if(/arcane/.test(id))d='M10 3H14V5H16V7H14V9H10V7H8V5H10ZM10 12H15V14H10Z';
      else if(/storm_glaive/.test(id))d='M15 3H18V7H16V10H14V8H13V5H15ZM8 14H11V16H8Z';
      else if(/soul/.test(id))d='M15 4H17V7H15ZM13 8H15V11H13ZM10 11H12V14H10ZM5 15H8V17H5Z';
      else if(/grand_grimoire/.test(id))d='M14 9H18V11H14ZM15 13H17V16H15ZM5 5H7V8H5Z';
      else if(/dragonfang|fangblade/.test(id))d='M14 5H17V7H14ZM12 9H15V11H12ZM10 12H13V14H10ZM6 15H9V18H6Z';
      else if(/infernal/.test(id))d='M7 2H9V4H11V6H9V5H7ZM15 2H17V5H15V6H13V4H15ZM11 4H13V8H11Z';
      else if(/tempest_lance/.test(id))d='M8 4H10V7H8ZM14 4H17V6H15V9H13V7H14ZM9 13H15V15H9Z';
      else if(/void/.test(id))d='M7 4H10V6H7ZM14 7H17V9H14ZM8 11H11V13H8ZM14 13H17V15H14ZM7 17H10V19H7Z';
      else if(/archdemon/.test(id))d='M4 3H6V6H4ZM18 3H20V6H18ZM15 9H18V11H15ZM16 12H18V16H16Z';
      else if(/resonant/.test(id))d='M8 3H10V11H8ZM15 3H17V11H15ZM8 10H17V12H8ZM6 15H8V18H6ZM17 15H19V18H17Z';
      else if(/choral/.test(id))d='M11 1H13V10H11ZM7 5H17V7H7ZM9 12H16V14H9ZM9 17H16V19H9Z';
      else if(/sovereign_fang/.test(id))d='M12 3H14V6H12ZM15 6H18V8H15ZM12 10H15V12H12ZM7 14H10V17H7ZM4 17H7V19H4Z';
      else if(/eternity/.test(id))d='M14 7H18V9H14ZM15 9H17V12H15ZM14 12H18V14H14ZM15 14H17V17H15Z';
      else if(/desert/.test(id))d='M8 4H10V7H8ZM14 6H16V9H14ZM8 10H10V13H8ZM10 15H14V18H10ZM7 18H17V20H7Z';
    } else if(item.kind==='armor') {
      if(/chainmail/.test(id))d='M8 8H10V10H8ZM12 8H14V10H12ZM10 11H12V13H10ZM14 11H16V13H14ZM8 14H10V16H8ZM12 14H14V16H12Z';
      else if(/scale/.test(id))d='M8 8H11V10H8ZM13 8H16V10H13ZM10 11H14V13H10ZM8 14H11V16H8ZM13 14H16V16H13ZM10 17H14V19H10Z';
      else if(/leather/.test(id))d='M10 8H12V9H10ZM12 10H14V11H12ZM10 12H12V13H10ZM12 14H14V15H12Z';
      else if(/padded/.test(id))d='M8 10H10V12H8ZM13 10H15V12H13ZM10 14H12V16H10ZM15 16H17V18H15Z';
      else if(/plate/.test(id))d='M7 5H10V7H7ZM15 5H18V7H15ZM8 11H16V13H8ZM9 15H15V17H9Z';
      else if(/saint/.test(id))d='M11 7H13V16H11ZM8 10H16V12H8ZM6 20H18V22H6Z';
      else if(/mystic/.test(id))d='M11 8H13V10H15V12H13V14H11V12H9V10H11ZM7 18H9V20H7ZM15 18H17V20H15Z';
      else if(/abyssal/.test(id))d='M7 6H9V9H7ZM15 6H17V9H15ZM10 12H14V14H10ZM8 18H10V21H8ZM14 18H16V21H14Z';
      else if(/celestial/.test(id))d='M5 7H7V10H9V12H7V11H5ZM17 7H19V11H17V12H15V10H17ZM11 7H13V10H11Z';
      else if(/echoing/.test(id))d='M8 8H10V15H8ZM11 10H13V18H11ZM14 8H16V15H14ZM5 20H19V22H5Z';
      else if(/timeless/.test(id))d='M9 8H15V10H9ZM9 14H15V16H9ZM10 10H14V12H10ZM11 12H13V14H11Z';
      else if(/mantle/.test(id))d='M8 5H10V7H12V4H14V7H16V5H18V10H8ZM5 20H19V22H5Z';
      else if(/ironward/.test(id))d='M12 5H16V8H13V11H15V13H11V10H9V8H12Z';
      else if(/bulwark/.test(id))d='M8 7H16V9H14V16H10V9H8ZM6 18H18V20H6Z';
      else if(/steadfast/.test(id))d='M9 8H15V10H16V17H8V10H9ZM11 10H13V15H11Z';
    } else if(item.kind==='shoes') {
      if(/swift/.test(id))d='M3 7H8V9H3ZM3 12H8V14H3Z';
      else if(/wind_treads/.test(id))d='M2 6H5V9H8V11H5V10H2ZM13 4H16V7H19V9H16V8H13Z';
      else if(/gale/.test(id))d='M1 5H3V8H6V10H8V12H5V10H3V9H1ZM13 2H15V5H18V7H15V6H13Z';
      else if(/tempest/.test(id))d='M6 6H9V9H7V12H5V9H6ZM17 4H20V7H18V10H16V7H17Z';
      else if(/stormgod/.test(id))d='M3 3H11V6H3ZM4 11H10V13H4ZM14 1H22V4H14ZM15 9H21V11H15Z';
      else if(/resonant/.test(id))d='M4 8H10V10H4ZM4 12H10V14H4ZM15 6H21V8H15ZM15 10H21V12H15Z';
      else if(/boundless/.test(id))d='M3 6H6V8H8V6H11V10H8V8H6V10H3ZM14 4H17V6H19V4H22V8H19V6H17V8H14Z';
      else if(/wyvern/.test(id))d='M4 5H7V7H4ZM7 8H10V10H7ZM4 11H7V13H4ZM15 3H18V5H15ZM18 6H21V8H18Z';
      else if(/undertow/.test(id))d='M3 7H6V9H9V11H6V10H3ZM14 5H17V7H20V9H17V8H14Z';
    } else if(item.kind==='accessory') {
      if(/focus/.test(id))d='M10 3H14V6H10ZM11 10H13V12H11Z';
      else if(/lucky/.test(id))d='M9 12H11V14H13V12H15V14H13V16H15V18H13V16H11V18H9V16H11V14H9Z';
      else if(/guardian|absolute/.test(id))d='M9 12H15V17H13V19H11V17H9Z';
      else if(/wyrm|dragon/.test(id))d='M9 2H12V4H15V6H13V9H10V7H8V5H9Z';
      else if(/prism/.test(id))d='M10 2H14V4H16V6H14V8H10V6H8V4H10Z';
      else if(/infinity/.test(id))d='M6 3H10V5H14V3H18V7H14V5H10V7H6Z';
      else if(/seal/.test(id))d='M9 14H15V16H13V20H11V16H9Z';
      else if(/crown/.test(id))d='M11 10H13V14H11ZM5 11H7V13H5ZM17 11H19V13H17Z';
      else if(/spire_heart/.test(id))d='M11 7H13V10H15V16H9V10H11Z';
      else if(/abyss/.test(id))d='M8 9H10V11H14V9H16V13H14V15H10V13H8Z';
      else if(/pact/.test(id))d='M10 8H15V10H10ZM12 12H16V16H12Z';
      else if(/novice/.test(id))d='M11 14H13V20H11Z';
      else if(/veteran/.test(id))d='M8 16H10V19H8ZM11 14H13V20H11ZM14 16H16V19H14Z';
      else if(/sovereign/.test(id))d='M9 14H11V16H13V13H15V16H17V14H19V20H9Z';
      else if(/bell/.test(id))d='M11 8H13V12H11ZM9 13H15V15H9Z';
    } else if(item.kind==='material') {
      if(/storm_core/.test(id))d='M8 9H14V11H16V14H10V16H7V14H10V12H8Z';
      else if(/voltaic/.test(id))d='M12 5H16V9H13V12H16V15H11V19H8V13H11V10H9V8H12Z';
      else if(/demonic/.test(id))d='M5 4H8V7H10V9H8V8H5ZM16 4H19V8H16V9H14V7H16Z';
      else if(/drowned/.test(id))d='M11 7H14V11H16V15H14V18H10V15H8V12H11Z';
      else if(/demon_fang/.test(id))d='M13 5H16V7H13ZM10 10H13V12H10ZM6 16H10V18H6Z';
      else if(/wyvern/.test(id))d='M8 9H11V11H8ZM13 9H16V11H13ZM10 14H14V16H10Z';
      else if(/dragon/.test(id))d='M11 5H13V10H16V14H14V17H10V15H8V12H11Z';
      else if(/ancient/.test(id))d='M9 7H15V9H9ZM10 11H14V13H10ZM11 15H13V18H11Z';
      else if(/abyssal_scale/.test(id))d='M7 9H10V11H13V9H17V12H14V14H10V12H7Z';
      else if(/resonant/.test(id))d='M8 7H10V17H8ZM14 5H16V17H14ZM18 13H20V17H18Z';
      else if(/crystal_dust/.test(id))d='M9 12H11V15H9ZM13 16H15V19H13ZM15 12H17V14H15Z';
      else if(/abyssal_essence/.test(id))d='M8 14H11V16H14V13H17V18H14V20H9V18H8Z';
      else if(/wraith/.test(id))d='M8 14H10V16H12V14H14V17H16V20H8Z';
      else if(/spirit/.test(id))d='M8 14H10V16H8ZM12 12H14V14H12ZM14 17H16V19H14Z';
    }
    if(d)extra+=path(metal,d);
    var unique={
      a_demonlord_plate:'M2 2H5V5H8V8H5V6H2ZM19 2H22V6H19V8H16V5H19Z',
      a_crystalward_plate:'M3 4H6V7H3ZM18 4H21V7H18ZM10 10H14V15H10Z',
      c_absolute_ward:'M7 10H17V18H15V21H9V18H7ZM10 12V16H14V12Z',
      w_craft_fangblade:'M6 4H9V6H11V8H8V7H6ZM5 10H8V12H5Z',
      c_craft_dragonfangring:'M4 3H7V6H9V8H7V7H4ZM17 3H20V7H17V8H15V6H17Z',
      w_craft_voidreaver:'M6 3H9V6H7V10H5V8H4V5H6ZM15 10H18V13H15Z',
      c_quest_sovereign_relic:'M4 11H7V15H4ZM18 11H21V15H18ZM10 17H14V20H10Z',
      c_shatter_prism:'M4 2H7V5H4ZM17 2H20V5H17ZM10 4H12V8H10Z'
    };
    if(unique[id])extra+=path('#b5def0',unique[id]);
    if(item.forgeEffect){var effect=item.forgeEffect.effect;extra+=path('#12101e','M16 15H24V24H16Z');extra+=path(effect==='leech'?'#ff6b85':effect==='break'?'#f0c97c':glow,effect==='leech'?'M19 16H21V18H22V21H18V18H19Z':effect==='break'?'M19 16H22V18H20V20H22V22H18V20H19Z':'M20 16H22V18H20V20H18V22H17V20H18V18H20Z');}
    if(/^orin_/.test(item.id||''))extra+=path('#d9e8ee','M2 8H5V14H2ZM19 8H22V14H19ZM8 18H16V21H8Z')+path('#bc8d43','M3 9H4V11H3ZM20 9H21V11H20ZM9 19H11V20H9ZM14 19H15V20H14Z');
    if(item.kind==='consumable' && /p_(hp|mp)_/.test(id)) {
      var bands=Math.max(1,Math.min(7,Number(item.tier)||1));
      for(var b=1;b<bands;b++)extra+=path(b%2?'#e9ce88':'#f5edce','M'+(5+b*2)+' 19h1v2h-1Z');
    }
    if(id==='p_panacea')extra+=path('#a9e5c1','M8 12H11V14H15V11H18V15H15V18H11V16H8Z');
    if(id==='p_elixir')extra+=path('#86ebc9','M11 10H13V13H16V15H13V18H11V15H8V13H11Z')+path('#f5d58c','M4 6H7V8H4ZM18 4H21V6H18Z');
    return extra;
  }

  function itemGlyph(item) {
    if (!item) return glyph('bagItem');
    var tier = Number(item.tier);
    tier = Number.isFinite(tier) ? Math.max(1, Math.min(16, Math.floor(tier))) : 1;
    var colors = ['#a9b3c5','#84c994','#65bfe8','#b395ef','#efb86c','#ee8498','#f0df99','#83e3d6','#e9a2eb','#c9df79','#ffa275','#a3a4ff','#78deff','#f888ba','#ffe8b7','#ffffff'];
    var mark = item.icon === 'mpPotion' ? 'MP·' + tier : item.icon === 'potion' ? 'HP·' + tier : 'T' + tier;
    var shape = itemShape(item), art = glyph(item.icon);
    var engravingItem=item.baseId?Object.assign({},item,{id:item.baseId,forgeEffect:null}):item;
    var detailed = window.Game.ItemArt && window.Game.ItemArt.render(item,shape,ornament(engravingItem));
    if(detailed)art='<span class="icon pixel-icon" aria-hidden="true">'+detailed+'</span>';
    else if (shape) {
      var base = shape === 'hpFlask' ? '#b94364' : shape === 'mpFlask' ? '#497dc4' : shape === 'leather' || shape === 'boots' ? '#99623c' : colors[tier - 1];
      var physical = {mat_beast_fang:'#c7b698',mat_demon_fang:'#775d80',mat_dragon_scale:'#bb5e45',mat_ancient_scale:'#d0ad66',mat_abyssal_scale:'#4f909c',mat_wyvern_scale:'#74976b',mat_iron_shard:'#9ba9b6',mat_bone_fragment:'#c7b698',mat_demonic_core:'#9d557e',mat_drowned_core:'#58a5ba',mat_voltaic_core:'#dfb45d'};
      if (physical[item.id]) base=physical[item.id];
      var detail = itemDetails[shape], silhouette = itemShapes[shape];
      if (shape === 'hpFlask' || shape === 'mpFlask') {
        var bottles = [
          'M9 2H15V6H14V10H17V13H18V22H6V13H7V10H10V6H9Z',
          'M8 2H16V6H14V9H17V12H19V22H5V12H7V9H10V6H8Z',
          'M8 2H16V6H15V9H18V11H21V21H19V23H5V21H3V11H6V9H9V6H8Z',
          'M9 1H15V6H14V9H18V12H20V20H17V23H7V20H4V12H6V9H10V6H9Z',
          'M7 2H17V5H15V9H18V11H21V19H19V22H5V19H3V11H6V9H9V5H7Z',
          'M9 1H15V5H14V8H17V11H20V20H17V23H7V20H4V11H7V8H10V5H9Z',
          'M8 1H16V4H18V6H15V9H18V12H21V18H18V21H16V23H8V21H6V18H3V12H6V9H9V6H6V4H8Z'
        ];
        silhouette = bottles[Math.min(6,tier-1)];
      }
      art = '<span class="icon pixel-icon" aria-hidden="true"><svg class="pixel-sprite item-silhouette" data-shape="' + shape + '" viewBox="-1 -1 26 26" shape-rendering="crispEdges"><path fill="' + base + '" fill-rule="evenodd" stroke="#080b18" stroke-width="1" d="' + silhouette + '"/><path fill="#f3e6c3" d="' + detail[0] + '"/><path fill="' + (shape === 'hpFlask' || shape === 'mpFlask' ? '#edd6a3' : '#d8a351') + '" d="' + detail[1] + '"/>' + ornament(item) + '</svg></span>';
    }
    return '<span class="item-art" data-item-id="' + String(item.id || '').replace(/[^a-zA-Z0-9_-]/g, '') + '" style="--item-tier-color:' + colors[tier - 1] + '">' + art + '<small aria-hidden="true" data-mark="' + String(mark).replace(/"/g, '') + '"></small></span>';
  }

  window.Game = window.Game || {};
  window.Game.Icons = {
    get: glyph,
    item: itemGlyph,
    has: function (name) { return Object.prototype.hasOwnProperty.call(RAW,name) || !!(window.Game.UISymbols && window.Game.UISymbols.render(name)) || !!(window.Game.PixelArt && window.Game.PixelArt.has(name)) || !!(window.Game.ClassArt && window.Game.ClassArt.has(name)); }
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
