// Approved illustrated class portraits; keep the same asset in menus and battles.
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
    return '<svg xmlns="http://www.w3.org/2000/svg" class="class-character hero-art" viewBox="0 0 160 152" role="img" aria-label="' + names[id] + '">' +
      '<image class="hero-body" href="assets/pixel16/classes/' + id + '.png" x="0" y="0" width="160" height="152" preserveAspectRatio="xMidYMid meet"/>' +
      '</svg>';
  }
  window.Game.ClassArt = { has: has, render: render };
})();
