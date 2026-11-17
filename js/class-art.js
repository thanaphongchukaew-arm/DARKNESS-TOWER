// Class portraits share the palette-grid art direction used by enemies and NPCs.
// SVG coordinates preserve talent overlays and battle animation hooks.
(function () {
  var names = {
    blade: 'Blade Knight',
    staffOrb: 'Elementalist',
    radiantOrb: 'Cleric',
    berserker: 'Berserker',
    ranger: 'Ranger',
    necromancer: 'Necromancer',
    monk: 'Monk',
    paladin: 'Paladin',
    gunslinger: 'Gunslinger',
    druid: 'Druid',
    alchemist: 'Alchemist',
    samurai: 'Samurai',
    warlock: 'Warlock',
    battlemage: 'Battlemage',
    frostOracle: 'Frost Oracle',
    stormCaller: 'Storm Caller',
    shadowDancer: 'Shadow Dancer',
    bard: 'Bard',
    beastmaster: 'Beastmaster',
    runeblade: 'Runeblade',
    sharpshooter: 'Sharpshooter',
    puppeteer: 'Puppeteer',
    tempestWitch: 'Tempest Witch',
    chronomancer: 'Chronomancer',
    warlord: 'Valiant Warlord',
    shadowhunter: 'Valiant Shadowhunter',
    executioner: 'Valiant Executioner',
    deathbringer: 'Valiant Deathbringer',
    vanguard: 'Valiant Vanguard'
  };
  function has(id) { return Object.prototype.hasOwnProperty.call(names, id); }
  function render(id) {
    if (!has(id)) return '';
    return window.Game.PixelArt.render(id, 'class-character hero-art');
  }
  window.Game.ClassArt = { has: has, render: render };
})();
