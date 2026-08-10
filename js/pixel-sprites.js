// Hand-authored pixel-art sprite data (original art, NES-inspired). No image assets.
(function () {
  var P = window.Game.PixelArt;

  var PAL = {
    K: '#0a0a0a', W: '#f4f0e8',
    G: '#b0b0ba', D: '#606068',
    R: '#d02838', Y: '#e8c050',
    U: '#5a3818', N: '#1a3878',
    B: '#3868c8', Pu: '#a060ff',
    E: '#e8e0d0', V: '#3a2050',
    X: '#ff4040', O: '#d8d0c0'
  };
  // single-char grid cells only -- map the 2-letter 'Pu' key to a spare letter 'p'
  PAL.p = PAL.Pu;

  P.define('blade', [
    '.....GGGG.....',
    '....GGGGGG....',
    '....GGKKGG....',
    '....GGGGGG....',
    '...GGRRRRGG...',
    '..GRRRRRRRRG.W',
    '..GRRYYRRG...W',
    '...RRRRRRRR..W',
    '....RRYYRR....',
    '....RRRRRR....',
    '....RRRRRR....',
    '.....RRRR.....',
    '.....RRRR.....',
    '.....G..G.....',
    '.....G..G.....',
    '.....G..G.....',
    '....UU..UU....',
    '....UU..UU....'
  ], PAL);

  P.define('staffOrb', [
    '......NN......',
    '.....NNNN.....',
    '....NNNNNN....',
    '...NNNNNNNN...',
    '...NKKNNNN....',
    '....NNNNNN....',
    '...NNBBBBNN...',
    '..NBBBBBBBBN..',
    '..NBBppppBBN..',
    '..NBBBBBBBBN..',
    '...NBBBBBBN...',
    '....BBBBBB....',
    '....BBBBBB....',
    '.....BBBB.....',
    '.....BBBB.....',
    '.....K..K.....',
    '.....K..K.....',
    '....KK..KK....'
  ], PAL);

  P.define('radiantOrb', [
    '......EE......',
    '.....EEEE.....',
    '....EEEEEE....',
    '...EEEEEEEE...',
    '...EKKEEEE....',
    '....EEEEEE....',
    '...EEYYYYEE...',
    '..EYYYYYYYYE..',
    '..EYYWWWWYYE..',
    '..EYYYYYYYYE..',
    '...EYYYYYYE...',
    '....YYYYYY....',
    '....YYYYYY....',
    '.....YYYY.....',
    '.....YYYY.....',
    '.....K..K.....',
    '.....K..K.....',
    '....KK..KK....'
  ], PAL);

  // Player classes 4-8 reuse the 'blade' knight silhouette or the 'staffOrb'
  // hooded-caster silhouette with their own palette -- a palette-swap keeps
  // proportions consistent with the original 3 classes while giving each new
  // class a distinct color identity.
  var BERSERKER_PAL = { K: '#0a0a0a', G: '#5a4030', R: '#c05a20', Y: '#d8c090', U: '#3a2410', W: '#b8b8c0' };
  P.define('berserker', [
    '.....GGGG.....',
    '....GGGGGG....',
    '....GGKKGG....',
    '....GGGGGG....',
    '...GGRRRRGG...',
    '..GRRRRRRRRG.W',
    '..GRRYYRRG...W',
    '...RRRRRRRR..W',
    '....RRYYRR....',
    '....RRRRRR....',
    '....RRRRRR....',
    '.....RRRR.....',
    '.....RRRR.....',
    '.....G..G.....',
    '.....G..G.....',
    '.....G..G.....',
    '....UU..UU....',
    '....UU..UU....'
  ], BERSERKER_PAL);

  var PALADIN_PAL = { K: '#0a0a0a', G: '#d8d8e0', R: '#f0ece0', Y: '#e8c050', U: '#9098a8', W: '#fff6c8' };
  P.define('paladin', [
    '.....GGGG.....',
    '....GGGGGG....',
    '....GGKKGG....',
    '....GGGGGG....',
    '...GGRRRRGG...',
    '..GRRRRRRRRG.W',
    '..GRRYYRRG...W',
    '...RRRRRRRR..W',
    '....RRYYRR....',
    '....RRRRRR....',
    '....RRRRRR....',
    '.....RRRR.....',
    '.....RRRR.....',
    '.....G..G.....',
    '.....G..G.....',
    '.....G..G.....',
    '....UU..UU....',
    '....UU..UU....'
  ], PALADIN_PAL);

  var RANGER_PAL = { K: '#0a0a0a', N: '#2f6b2f', B: '#7a5230', p: '#a8d060' };
  P.define('ranger', [
    '......NN......',
    '.....NNNN.....',
    '....NNNNNN....',
    '...NNNNNNNN...',
    '...NKKNNNN....',
    '....NNNNNN....',
    '...NNBBBBNN...',
    '..NBBBBBBBBN..',
    '..NBBppppBBN..',
    '..NBBBBBBBBN..',
    '...NBBBBBBN...',
    '....BBBBBB....',
    '....BBBBBB....',
    '.....BBBB.....',
    '.....BBBB.....',
    '.....K..K.....',
    '.....K..K.....',
    '....KK..KK....'
  ], RANGER_PAL);

  var NECROMANCER_PAL = { K: '#0a0a0a', N: '#3a1a4a', B: '#5a2060', p: '#c890ff' };
  P.define('necromancer', [
    '......NN......',
    '.....NNNN.....',
    '....NNNNNN....',
    '...NNNNNNNN...',
    '...NKKNNNN....',
    '....NNNNNN....',
    '...NNBBBBNN...',
    '..NBBBBBBBBN..',
    '..NBBppppBBN..',
    '..NBBBBBBBBN..',
    '...NBBBBBBN...',
    '....BBBBBB....',
    '....BBBBBB....',
    '.....BBBB.....',
    '.....BBBB.....',
    '.....K..K.....',
    '.....K..K.....',
    '....KK..KK....'
  ], NECROMANCER_PAL);

  var MONK_PAL = { K: '#0a0a0a', N: '#e0942a', B: '#a83a2a', p: '#f5f050' };
  P.define('monk', [
    '......NN......',
    '.....NNNN.....',
    '....NNNNNN....',
    '...NNNNNNNN...',
    '...NKKNNNN....',
    '....NNNNNN....',
    '...NNBBBBNN...',
    '..NBBBBBBBBN..',
    '..NBBppppBBN..',
    '..NBBBBBBBBN..',
    '...NBBBBBBN...',
    '....BBBBBB....',
    '....BBBBBB....',
    '.....BBBB.....',
    '.....BBBB.....',
    '.....K..K.....',
    '.....K..K.....',
    '....KK..KK....'
  ], MONK_PAL);

  var DRAGON_PAL = { H: '#d8c8a0', C: '#2f7a45', E: '#f5e050', W: '#6a2020', D: '#1c4a2a', K: '#0a0a0a', U: '#8fc06a' };
  P.define('dragon', [
    '.....H..H.....',
    '....HH..HH....',
    '.....CCCC.....',
    '....CCCCCC....',
    '...CCCCCCCC...',
    '..CCEECCEECC..',
    '..CCCCCCCCCC..',
    'W.CCCCCCCCCC.W',
    'W..DDDDDDDD..W',
    '...DDKKKKDD...',
    '....DDDDDD....',
    '.....CCCC.....',
    '....CC..CC....',
    '....UU..UU....'
  ], DRAGON_PAL);

  var DEMON_PAL = { H: '#3a1010', R: '#8a1818', K: '#0a0a0a', Y: '#f0d040' };
  P.define('demon', [
    '.....H..H.....',
    '....HHH.HHH...',
    '....RRRRRR....',
    '....RKRRKR....',
    '....RRRRRR....',
    '...RRRRRRRR...',
    '..RRRRYYRRRR..',
    '.RRRRRYYRRRRR.',
    '..RRRRRRRRRR..',
    '...RRRRRRRR...',
    '....RRRRRR....',
    '.....R..R.....',
    '.....R..R.....',
    '....KK..KK....'
  ], DEMON_PAL);

  var DEMONLORD_PAL = { Y: '#f0c030', H: '#2a0a10', R: '#7a1030', K: '#0a0a0a' };
  P.define('demonLord', [
    '...Y..Y..Y..Y...',
    '..YYYYYYYYYYYY..',
    '...H........H...',
    '..HHH......HHH..',
    '...RRRRRRRRRR...',
    '...RKRRRRRRKR...',
    '...RRRRRRRRRR...',
    '..RRRRRRRRRRRR..',
    '.RRRRRRYYRRRRRR.',
    '.RRRRRRYYRRRRRR.',
    '..RRRRRRRRRRRR..',
    '...RRRRRRRRRR...',
    '....RRRRRRRR....',
    '.....RR..RR.....',
    '.....RR..RR.....',
    '....KKK..KKK....'
  ], DEMONLORD_PAL);

  P.define('shadowFigure', [
    '....V......V..',
    '...VV....VV...',
    '..VVVVVVVVVV..',
    '....VXVVXV....',
    '...VVVVVVVV...',
    '..VVVVVVVVVV..',
    '.VVVVVVVVVVVV.',
    'KVVVVVVVVVVVVK',
    '.VVVVVVVVVVVV.',
    '..VVVVVVVVVV..',
    '..VVVV..VVVV..',
    '..VVVV..VVVV..',
    '..VVVV..VVVV..',
    '..KKKK..KKKK..'
  ], PAL);

  P.define('skull', [
    '....OOOOOO....',
    '...OOOOOOOO...',
    '...OKKOOKKO...',
    '...OOOOOOOO...',
    '....OOOOOO....',
    '...DDGGGGDD...',
    '..DDGGGGGGDD..',
    '..DDGGUUGGDD..',
    '..DDGGGGGGDD..',
    '...DDGGGGDD...',
    '....DDGGDD....',
    '....DDGGDD....',
    '.....DGGD.....',
    '.....O..O.....',
    '.....O..O.....',
    '.....O..O.....',
    '....OO..OO....',
    '....OO..OO....'
  ], PAL);

  P.define('crownSkull', [
    '.....Y..Y..Y....',
    '....YYYYYYYYYY..',
    '...OOOOOOOOOOOO.',
    '..OOOOOOOOOOOO..',
    '..OXXOOOOOXXOO..',
    '..OOOOOOOOOOOO..',
    '..OOOOOOOOOOOO..',
    '...VVVVVVVVVVV..',
    '..VVVVVVVVVVVVV.',
    '.VVVVVYYYYVVVVV.',
    '.VVVVVVVVVVVVVV.',
    '..VVVVVVVVVVVV..',
    '..VVVVVVVVVVVV..',
    '...VVVVVVVVVV...',
    '...VVVVVVVVVV...',
    '....VVVVVVVV....',
    '....VV....VV....',
    '....VV....VV....',
    '...KKK....KKK...',
    '...KKK....KKK...'
  ], PAL);

  P.define('towerSpire', [
    '....GG....',
    '...GGGG...',
    '...GGGG...',
    '..GGGGGG..',
    '..GGGGGG..',
    '.GGGGGGGG.',
    '.GGGGGGGG.',
    'G.G.G.G.G.',
    '.GGGGGGGG.',
    '.GDDDDDDG.',
    '.GGGGGGGG.',
    '.GGGGGGGG.',
    '.GGGGGGGG.',
    'GGGGGGGGGG'
  ], PAL);

  var BRICK_PAL = { S: '#d6874a', T: '#b5652a', M: '#2e1c10' };
  P.define('tileBrick', [
    'SSSSSSSMSSSSSSSM',
    'TTTTTTTMTTTTTTTM',
    'TTTTTTTMTTTTTTTM',
    'MMMMMMMMMMMMMMMM',
    'SSSMSSSSSSSMSSSS',
    'TTTMTTTTTTTMTTTT',
    'TTTMTTTTTTTMTTTT',
    'MMMMMMMMMMMMMMMM'
  ], BRICK_PAL);

  var GROUND_PAL = { S: '#aaaab4', T: '#8a8a94', M: '#38383e' };
  P.define('tileGround', [
    'SSSSSSSMSSSSSSSM',
    'TTTTTTTMTTTTTTTM',
    'TTTTTTTMTTTTTTTM',
    'MMMMMMMMMMMMMMMM'
  ], GROUND_PAL);

  P.define('doorway', [
    '......YY......',
    '.....YYYY.....',
    '....YYYYYY....',
    '...YYYYYYYY...',
    '..YYYYYYYYYY..',
    '.YYYYYYYYYYYY.',
    'UUUUUUUUUUUUUU',
    'UOOOOOOOOOOOOU',
    'UOOOOOOOOOOOOU',
    'UOOOOKKKKOOOOU',
    'UOOOOKKKKOOOOU',
    'UOOOOKKKKOOOOU',
    'UUUUUKKKKUUUUU',
    'UUUUUUUUUUUUUU'
  ], PAL);

  P.define('bat', [
    '..V....V..',
    '.VVV..VVV.',
    'VVVVVVVVVV',
    '.VVVXXVVV.',
    '..VV..VV..'
  ], PAL);

  window.Game = window.Game || {};
})();
