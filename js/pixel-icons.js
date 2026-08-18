// Pixel-art definitions filling the *remaining* gaps in icons.js's RAW glyph table.
//
// Most of that table already has real pixel-art sprites -- pixel-sprites.js defines
// pixel art for elements, equipment slots, resources (heart/coin/potion/...), combat
// icons, and the base UI glyphs (back/close/lock/star/...) in its own "Remaining UI
// glyphs" section, plus a handful of scene sprites (doorway/skull/crownSkull/
// towerSpire/shadowFigure) that double as icons. Icons.get() (icons.js:134-141)
// already prefers any PixelArt-registered sprite over the Unicode glyph, so this file
// only needs to cover the keys pixel-sprites.js doesn't touch: blessings, curses,
// relics, tower events, and the companion/codex/ascension icons -- all added in a
// later content pass and never converted. Adding a P.define here just upgrades that
// one key automatically; nothing else has to change.
(function () {
  var P = window.Game.PixelArt;

  // ---- Companion / codex / ascension ----
  P.define('companionSlot', [
    '.C.....C.',
    '..C...C..',
    '.........',
    '..C...C..',
    '.C..C..C.',
    '.C.CCC.C.',
    '..CCCCC..',
    '...CCC...'
  ], { C: '#c890ff' });

  P.define('trophy', [
    'CCCCCCCCC',
    'C.......C',
    'C.HHHHH.C',
    'CCH...HCC',
    '.CHHHHHC.',
    '..C...C..',
    '.CCCCCCC.',
    'CCCCCCCCC'
  ], { C: '#e8c050', H: '#fff2b0' });

  P.define('medal', [
    '.C.CCC.C.',
    'CC.CCC.CC',
    '..CCCCC..',
    '.CHHHHHC.',
    'CHHMMMHHC',
    'CHMMSMMHC',
    '.CHMMMHC.',
    '..CHHHC..'
  ], { C: '#5a3a10', H: '#e8c050', M: '#fff2b0', S: '#a87818' });

  P.define('codex', [
    'CCCCCCCC.',
    'CHHHHHHC.',
    'CH.MM.HC.',
    'CH.MM.HC.',
    'CH.MM.HC.',
    'CH.MM.HC.',
    'CHHHHHHC.',
    'CCCCCCCC.'
  ], { C: '#4a2c14', H: '#c8a868', M: '#8a6a10' });

  P.define('ascension', [
    '....C....',
    '...CCC...',
    '..C.C.C..',
    '.C..C..C.',
    '....C....',
    '..CCCCC..',
    '.CC...CC.',
    'CC.....CC'
  ], { C: '#c890ff' });

  // ---- Tower events ----
  P.define('eventMerchant', [
    '..CCCCC..',
    '....C....',
    '.CCCCCCC.',
    'C...C...C',
    'C...C...C',
    'CC..C..CC',
    '.C..C..C.',
    '..CCCCC..'
  ], { C: '#e8c050' });

  P.define('eventChest', [
    'KCCCCCCCK',
    'CCCCCCCCC',
    'CHHHHHHHC',
    'CH.HKH.HC',
    'CH..K..HC',
    'CHHHHHHHC',
    'KCCCCCCCK'
  ], { K: '#3a2410', C: '#a8622e', H: '#d6874a' });

  P.define('eventShortcut', [
    '...CC....',
    '..CC.....',
    '.CC......',
    'CCCCCC...',
    '...CC....',
    '....CC...',
    '.....CC..',
    '......CC.'
  ], { C: '#f0d030' });

  P.define('eventSage', [
    '..CCCCC..',
    '.C.....C.',
    'C..H.H..C',
    'C.......C',
    'C.CCCCC.C',
    '.C.....C.',
    '..CCCCC..'
  ], { C: '#c890ff', H: '#ffffff' });

  P.define('eventShrine', [
    '.C.....C.',
    'CC.....CC',
    'CHHHHHHHC',
    '.C.....C.',
    '.C.HHH.C.',
    '.C.H.H.C.',
    'CCCCCCCCC'
  ], { C: '#a89058', H: '#e8d090' });

  P.define('eventCompanion', [
    '.C.C.C.C.',
    'CCCCCCCCC',
    'CHHHHHHHC',
    'CH.....HC',
    '.CH...HC.',
    '..CC.CC..',
    '...CCC...'
  ], { C: '#8a6a10', H: '#e8c888' });

  P.define('eventSpring', [
    '....C....',
    '...CCC...',
    '..CCCCC..',
    '.CCCCCCC.',
    '..CCCCC..',
    '.C.C.C.C.',
    'C.C.C.C.C'
  ], { C: '#48c8e8' });

  P.define('eventBattlefield', [
    'CC.....CC',
    '.CC...CC.',
    '..CC.CC..',
    '...CCC...',
    '..CC.CC..',
    '.CC...CC.',
    'CC.....CC',
    '.........'
  ], { C: '#c04040' });

  P.define('eventGambler', [
    'CCCCCCC..',
    'CHHHHHC..',
    'CH.M.HC..',
    'CHM.MHC..',
    'CH.M.HC..',
    'CHHHHHC..',
    'CCCCCCC..'
  ], { C: '#0a0a0a', H: '#e8e0d0', M: '#c02020' });

  // ---- Shared badge frames: blessings (gold halo) / curses (dark spiked ring) /
  // relics (bronze ring) each reuse one outer frame, differing by the small glyph
  // baked into the center 3x3 -- keeps the whole set readable as "this is a
  // blessing / this is a curse / this is a relic" at a glance, the same trick real
  // pixel-icon sets use for badge families. ----
  var BLESS_PAL = { K: '#5a4008', H: '#fff2b0', M: '#e8c050', G: '#ffffff' };
  var CURSE_PAL = { K: '#1a0a24', H: '#c890ff', M: '#5a2c8a', G: '#0a0a0a' };
  var RELIC_PAL = { K: '#2a1808', H: '#e8a868', M: '#a8622e', G: '#3a2410' };

  function halo(centerRows) {
    return ['..KHHHK..', '.KHHHHHK.', 'KHHM.MHHK'].concat(centerRows).concat(['KHHM.MHHK', '.KHHHHHK.', '..KHHHK..']);
  }
  function spikes(centerRows) {
    return ['.K.K.K.K.', 'KMMMMMMMK', 'MMM.G.MMM'].concat(centerRows).concat(['MMM.G.MMM', 'KMMMMMMMK', '.K.K.K.K.']);
  }
  function ring(centerRows) {
    return ['..KHHHK..', '.KH...HK.', 'KH..G..HK'].concat(centerRows).concat(['KH..G..HK', '.KH...HK.', '..KHHHK..']);
  }

  P.define('blessMight', halo(['KHMGGGMHK', 'KHM.G.MHK']), BLESS_PAL);
  P.define('blessInsight', halo(['KHM.G.MHK', 'KHMGGGMHK']), BLESS_PAL);
  P.define('blessVitality', halo(['KHMGMGMHK', 'KHMGGGMHK']), BLESS_PAL);
  P.define('blessClarity', halo(['KHM.G.MHK', 'KHMG.GMHK']), BLESS_PAL);
  P.define('blessSwiftness', halo(['KHM.GG.HK', 'KHMGG..HK']), BLESS_PAL);
  P.define('blessFortune', halo(['KHMGMG.HK', 'KHM.G.MHK']), BLESS_PAL);
  P.define('blessWealth', halo(['KHMGGGMHK', 'KHM.G.MHK']), BLESS_PAL);
  P.define('blessWisdom', halo(['KHM.G.MHK', 'KHMG.G.HK']), BLESS_PAL);
  P.define('blessGuardian', halo(['KHMGGGMHK', 'KHM.G.MHK']), BLESS_PAL);
  P.define('blessIronSkin', halo(['KHMGMGMHK', 'KHMGGGMHK']), BLESS_PAL);
  P.define('blessTitan', halo(['KHMGGGMHK', 'KHMGMGMHK']), BLESS_PAL);
  P.define('blessWanderer', halo(['KHM.G.MHK', 'KHMG.GMHK']), BLESS_PAL);
  P.define('blessFocus', halo(['KHM.G.MHK', 'KHMGGGMHK']), BLESS_PAL);
  P.define('blessWildcat', halo(['KHMG.GMHK', 'KHM.G.MHK']), BLESS_PAL);
  P.define('blessStoneSkin', halo(['KHMGMGMHK', 'KHMGGGMHK']), BLESS_PAL);
  P.define('blessWarding', halo(['KHMGGGMHK', 'KHMG.GMHK']), BLESS_PAL);

  P.define('curseFrailty', spikes(['MMMGMGMMM', 'MM..G..MM']), CURSE_PAL);
  P.define('curseFool', spikes(['MM..G..MM', 'MMMGGGMMM']), CURSE_PAL);
  P.define('curseSlowness', spikes(['MM.GGG.MM', 'MM..G..MM']), CURSE_PAL);
  P.define('cursePoverty', spikes(['MMMG.GMMM', 'MM..G..MM']), CURSE_PAL);
  P.define('curseWeakArms', spikes(['MM.G.G.MM', 'MMMGGGMMM']), CURSE_PAL);
  P.define('curseDullMind', spikes(['MMMGMGMMM', 'MM.GGG.MM']), CURSE_PAL);
  P.define('curseTitanBurden', spikes(['MMMGGGMMM', 'MMMGMGMMM']), CURSE_PAL);
  P.define('curseWandererRuin', spikes(['MM..G..MM', 'MM.G.G.MM']), CURSE_PAL);
  P.define('curseBrokenFocus', spikes(['MM.GGG.MM', 'MMMG.GMMM']), CURSE_PAL);
  P.define('curseFrailMind', spikes(['MMMGMGMMM', 'MMMG.GMMM']), CURSE_PAL);

  P.define('relicVampiricFang', ring(['HM.GMG.MH', 'HM..G..MH']), RELIC_PAL);
  P.define('relicAdrenalineCore', ring(['HMGMGMGMH', 'HM..G..MH']), RELIC_PAL);
  P.define('relicStoneWard', ring(['HMGGGGGMH', 'HM.GMG.MH']), RELIC_PAL);
  P.define('relicMomentumCharm', ring(['HM.GG..MH', 'HM..GG.MH']), RELIC_PAL);
  P.define('relicCursedCoin', ring(['HMGMGMGMH', 'HMG.G.GMH']), RELIC_PAL);
  P.define('relicOpportunist', ring(['HM..G..MH', 'HMGGGGGMH']), RELIC_PAL);
  P.define('relicSwiftRecovery', ring(['HM.G.G.MH', 'HMG.G.GMH']), RELIC_PAL);
})();
