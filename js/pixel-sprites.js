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

  // Shared silhouettes reused by the palette-swapped playable classes below.
  var BLADE_GRID = [
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
  ];
  var STAFFORB_GRID = [
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
  ];

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

  // The full robed-reaper figure -- used as an actual creature portrait
  // (Bone Reaper) and the game-over screen, where a body reads correctly.
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

  // A standalone skull emblem (no body) for contexts that need just a danger
  // marker -- e.g. the Hard-difficulty card -- rather than a full figure.
  P.define('skullMark', [
    '....OOOOOO....',
    '...OOOOOOOO...',
    '...OKKOOKKO...',
    '...OOOOOOOO...',
    '....OOOOOO....',
    '...DDGGGGDD...',
    '..DDGGGGGGDD..',
    '..DDGGKKGGDD..',
    '..DDGGGGGGDD..',
    '...DDGGGGDD...',
    '....DDGGDD....',
    '....DDGGDD....',
    '.....DGGD.....'
  ], PAL);

  // Nightmare-difficulty marker: skullMark wreathed in flame, with the eye
  // sockets and jaw ember lit fire-orange instead of hollow black.
  P.define('skullFire', [
    '.....Y..Y.....',
    '....FFFFFFF...',
    '....OOOOOO....',
    '...OOOOOOOO...',
    '...OFFOOFFO...',
    '...OOOOOOOO...',
    '....OOOOOO....',
    '...DDGGGGDD...',
    '..DDGGGGGGDD..',
    '..DDGGFFGGDD..',
    '..DDGGGGGGDD..',
    '...DDGGGGDD...',
    '....DDGGDD....',
    '....DDGGDD....',
    '.....DGGD.....'
  ], { O: PAL.O, D: PAL.D, G: PAL.G, Y: PAL.Y, F: '#f08020' });

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

  // ---- New creature silhouettes so each monster's art matches its name ----

  var WOLF_PAL = { F: '#4a4058', D: '#2a2438', L: '#c8bfae', K: '#151018', R: '#d02838', T: '#f4f0e8' };
  var WOLF_GRID = [
    '....D......D....',
    '...DDD....DDD...',
    '..FFFFFFFFFFFF..',
    '.FFFFFFFFFFFFFF.',
    '.FFFRRFFFFRRFFF.',
    '.FFFFFFFFFFFFFF.',
    '.FFFFLLLLLLFFFF.',
    '.FFFFLLKKLLFFFF.',
    '.FFFFLTTTTLFFFF.',
    '.FFFFFFFFFFFFFF.',
    '..FFFFFFFFFFFF..',
    '..FFFFFFFFFFFF..',
    '...FFFF..FFFF...',
    '...FF......FF...',
    '...FF......FF...',
    '...KK......KK...'
  ];
  P.define('wolf', WOLF_GRID, WOLF_PAL);

  var HOUND_PAL = { F: '#5a1010', D: '#2a0808', L: '#3a1414', K: '#0a0a0a', R: '#f0d040', T: '#f4f0e8' };
  P.define('hound', WOLF_GRID, HOUND_PAL);

  var SLIME_PAL = { H: '#a8e0a0', M: '#4a9850', K: '#1a3010', S: '#2f6a38' };
  P.define('slime', [
    '......HH......',
    '....HHHHHH....',
    '..MMMMMMMMMM..',
    '.MMMMMMMMMMMM.',
    'MMMMMMMMMMMMMM',
    'MMMMKKMMKKMMMM',
    'MMMMMMMMMMMMMM',
    'MMMMMMMMMMMMMM',
    'MMMMMMMMMMMMMM',
    '.SSSSSSSSSSSS.',
    '..SSSSSSSSSS..',
    '...SSSSSSSS...',
    '....SSSSSS....'
  ], SLIME_PAL);

  var SPIDER_PAL = { B: '#3a2050', R: '#e8c050', K: '#0a0a0a' };
  P.define('spider', [
    '.................',
    '.B.............B.',
    '..BB...BBB...BB..',
    '....B.BBBBB.B....',
    'BBB..BBBBBBB..BBB',
    '...BBBBRBRBBBB...',
    '....BBBBBBBBB....',
    '..BBBBBBBBBBBBB..',
    'BB..BBBBBBBBB..BB',
    '...B..BKBKB..B...',
    '..B....BBB....B..',
    '.B.............B.',
    '.................'
  ], SPIDER_PAL);

  var WINDSPRITE_PAL = { W: '#eaf6ff', C: '#9fd8f0', E: '#cdeeff', K: '#2a5878' };
  P.define('windSprite', [
    '......WW......',
    '.....WWWW.....',
    'CCC..WWWW..CCC',
    'CCCCEEEEEECCCC',
    '.CCCCEKKECCCC.',
    '..CCCEEEECCC..',
    '....EEEEEE....',
    '....EEEEEE....',
    '....WWWWWW....',
    '....WWWWWW....',
    '.....WWWW.....',
    '.....CCCC.....',
    '......CC......',
    '......CC......'
  ], WINDSPRITE_PAL);

  var BANDIT_PAL = { H: '#3a4a3a', C: '#2c3a2c', K: '#0a0a0a', F: '#8a9a7a', G: '#c8ccd4', U: '#6a4a2a' };
  P.define('bandit', [
    '.......H.......',
    '......HHH......',
    '....HHHHHHH....',
    '...HHHHHHHHH...',
    '..HHHHHHHHHHH..',
    '..HHKKFFFKKHH..',
    '..HHHHHHHHHHH..',
    '..CCCCCCCCCCC..',
    '.CCCCCCCCCCUCC.',
    '.CCCCCCCCCCCGC.',
    '.CCCCCCCCCCCCG.',
    '..CCCCCCCCCCC..',
    '...CCCC.CCCC...',
    '...CC.....CC...',
    '...CC.....CC...',
    '...KK.....KK...'
  ], BANDIT_PAL);

  var KNIGHT_PAL = { P: '#d02838', M: '#c8d0dc', K: '#1a2028', A: '#8894a8', Y: '#e8c050' };
  P.define('knight', [
    '.......P.......',
    '......PPP......',
    '...MMMMMMMMM...',
    '..MMMMMMMMMMM..',
    '.MMMMMMMMMMMMM.',
    '.MMKKKKKKKKKMM.',
    '.MMMMMMMMMMMMM.',
    '..MMMMMMMMMMM..',
    '.AAAAAAAAAAAAA.',
    '.AAAYYAAAYYAAA.',
    '.AAAAAAAAAAAAA.',
    '.AAAAAAAAAAAAA.',
    '..AAAAAAAAAAA..',
    '...AA.....AA...',
    '...AA.....AA...',
    '...KK.....KK...'
  ], KNIGHT_PAL);

  var HAWK_PAL = { F: '#8a6a3a', K: '#1a1006', Y: '#e8c050' };
  var HAWK_GRID = [
    '.......F.......',
    '......FFF......',
    '.....KFFFK.....',
    'F...FFFFFFF...F',
    'FFFFFFFFFFFFFFF',
    '.FFFFFFFFFFFFF.',
    '...FFFFFFFFF...',
    '...FFFFYFFFF...',
    '...FFFFFFFFF...',
    '....FFFFFFF....',
    '....FF...FF....',
    '....KK...KK....'
  ];
  P.define('hawk', HAWK_GRID, HAWK_PAL);

  var HARPY_PAL = { F: '#7a4a8a', K: '#1a0a1e', Y: '#e8c050' };
  P.define('harpy', HAWK_GRID, HARPY_PAL);

  var SENTINEL_PAL = { M: '#7a8290', D: '#3a4048', R: '#e83838', Y: '#f0d040', K: '#1a1c20' };
  P.define('sentinel', [
    '...MMM.MMM...',
    '..MMMMMMMMM..',
    '..MRRRMRRRM..',
    '..MMMMMMMMM..',
    '.DDDDDDDDDDD.',
    'MMMMDDDDDMMMM',
    'MMMMMMMMMMMMM',
    '.MMYYMMMYYMM.',
    '.MMMMMMMMMMM.',
    '.MMMMMMMMMMM.',
    '..MMMMMMMMM..',
    '..MM.MMM.MM..',
    '..DD.DDD.DD..',
    '..MM.MMM.MM..',
    '.MMMM...MMMM.',
    '.KKKK...KKKK.'
  ], SENTINEL_PAL);

  var TROLL_PAL = { S: '#4a6a3a', K: '#1a2a10', W: '#f0ecd8' };
  var TROLL_GRID = [
    '....SSSSSSS....',
    '...SSSSSSSSS...',
    '..SSSSSSSSSSS..',
    '..KKSSSSSSSKK..',
    '..SSSSSSSSSSS..',
    '..SSWWWWWWWSS..',
    '.SSSSSSSSSSSSS.',
    'SSSSSSSSSSSSSSS',
    'SSSSSSSSSSSSSSS',
    'SSSSSSSSSSSSSSS',
    '.SSSSSSSSSSSSS.',
    '..SSSSSSSSSSS..',
    '...SSSS.SSSS...',
    '...SS.....SS...',
    '...SS.....SS...',
    '...KK.....KK...'
  ];
  P.define('troll', TROLL_GRID, TROLL_PAL);

  var TITAN_PAL = { S: '#6a6a8a', K: '#1a1a2a', W: '#f0f0ff' };
  P.define('titan', TROLL_GRID, TITAN_PAL);

  var GOLEM_PAL = { R: '#8a7a5a', K: '#e8c050', D: '#4a3e2a', Y: '#e85838' };
  P.define('golem', [
    '...RRRRRRR...',
    '..RRRRRRRRR..',
    '..KKRRRRRKK..',
    '..RRRRRRRRR..',
    '.RRRRRRRRRRR.',
    'RRRRRRRRRRRRR',
    'RRDDRRRRRDDRR',
    'RRRRRRRRRRRRR',
    'RRRRRRRRRRRRR',
    '.RRYRRRRRYRR.',
    '.RRRRRRRRRRR.',
    '..RRRRRRRRR..',
    '..RR.....RR..',
    '..RR.....RR..',
    '..DD.....DD..'
  ], GOLEM_PAL);

  var FIEND_PAL = { F: '#7a1818', H: '#3a1010', R: '#f0d040', L: '#3a0a0a', T: '#f4f0e8', K: '#0a0a0a' };
  P.define('fiend', [
    '..HH.......HH..',
    '....FFFFFFF....',
    '...FFFFFFFFF...',
    '..FFRFFFFFRFF..',
    '.FFFFFFFFFFFFF.',
    '.FFFFLLLLLFFFF.',
    '.FFFFLTLTLFFFF.',
    '.FFFFFFFFFFFFF.',
    '.FFFFFFFFFFFFF.',
    '..FFFFFFFFFFF..',
    '..FFFFFFFFFFF..',
    '...FFFF.FFFF...',
    '...FF.....FF...',
    '...FF.....FF...',
    '...KK.....KK...'
  ], FIEND_PAL);

  var HYDRA_PAL = { C: '#2f7a45', R: '#f5e050', D: '#1c4a2a', K: '#0a0a0a' };
  P.define('hydra', [
    '.......CCC.......',
    '......CRCRC......',
    'CCC...CCCCC...CCC',
    'CRCC..CCCCC..CCRC',
    '.CCC..CCCCC..CCC.',
    '..C.C.CCCCC.C.C..',
    '...CCC.....CCC...',
    '....DDDDDDDDD....',
    '...DDDDDDDDDDD...',
    '...DDDDDDDDDDD...',
    '....DDDDDDDDD....',
    '.....DDDDDDD.....',
    '......KK.KK......',
    '.................'
  ], HYDRA_PAL);

  // ---- Floor 45-100 creature silhouettes: the hidden upper tower (each unique, no palette-swap reuse) ----

  P.define('crystalWisp', [
    '.....C.C.....',
    '....CCCCC....',
    '...C.CCC.C...',
    '..C...C...C..',
    '.C....K....C.',
    '..C..CCC..C..',
    '...CCLLLCC...',
    '..C..CCC..C..',
    '.C....K....C.',
    '..C...C...C..',
    '...C.CCC.C...',
    '....CCCCC....'
  ], { C: '#8ad0f0', L: '#e8f8ff', K: '#153148' });

  P.define('prismLynx', [
    '....D......D....',
    '...DDD....DDD...',
    '..CCCCCCCCCCCC..',
    '.CCCCCCCCCCCCCC.',
    '.CCCLLCCCCLLCCC.',
    '.CCCCKCCCCKCCC..',
    '.CCCCCLLLLCCCCC.',
    '.CCCCCLLLLCCCCC.',
    '.CCCCCCCCCCCCCC.',
    '..CCCCCCCCCCCC..',
    '..CCCCCCCCCCCC..',
    '...CCCC..CCCC...',
    '...CC......CC...',
    '...CC......CC...',
    '...DD......DD...'
  ], { C: '#6ab8e8', D: '#3a6a90', L: '#e8f8ff', K: '#0a1a28' });

  P.define('chimeWraith', [
    '.....C.C.C.....',
    '....CCCCCCC....',
    '...C.......C...',
    '..CC.......CC..',
    '...CCCCCCCCC...',
    '...CLKC.CKLC...',
    '...CCCCCCCCC...',
    '..CCCCCCCCCCC..',
    '..CC.CCCCC.CC..',
    '..CC.......CC..',
    '..CC.......CC..',
    '..CC.......CC..',
    '..DD.......DD..'
  ], { C: '#b090e8', L: '#e8d8ff', K: '#241a38', D: '#4a3868' });

  P.define('geodeGolem', [
    '...RRRRRRR...',
    '..RRRRRRRRR..',
    '.RRRLLLLLRRR.',
    '.RRLLKLKLLRR.',
    '.RRRLLLLLRRR.',
    'RRRRRRRRRRRRR',
    'RRRDDRDDRRRRR',
    'RRRRRRRRRRRRR',
    'RRRLRRRRRLRR.',
    '.RRRRRRRRRRR.',
    '..RRRRRRRRR..',
    '..RR.....RR..',
    '..RR.....RR..',
    '..DD.....DD..'
  ], { R: '#7a6ab0', L: '#c8b8ff', K: '#0a0a14', D: '#3a2f5a' });

  P.define('choirWarden', [
    '.....G.G.G.....',
    '....GGGGGGG....',
    '...CCCCCCCCC...',
    '..CCCCCCCCCCC..',
    '.CCCLLKLLKLLCC.',
    '.CCCCCCCCCCCCC.',
    '.CCCCGGGGGCCCC.',
    'CCCCCGGGGGCCCCC',
    'CCCCCCCCCCCCCCC',
    '.CCCCCCCCCCCCC.',
    '.CCCCCCCCCCCCC.',
    '..CCCC...CCCC..',
    '..CC.......CC..',
    '..CC.......CC..',
    '.DDD.......DDD.'
  ], { C: '#9ad8f0', G: '#e8f8ff', L: '#c8b0ff', K: '#12283a', D: '#2a4a5e' });

  P.define('drownedRevenant', [
    '.....V.V.....',
    '....VVVVV....',
    '...VVVVVVV...',
    '...VXVVVXV...',
    '...VVVVVVV...',
    '..VVVVVVVVV..',
    '.VVVVVVVVVVV.',
    '.VV.VVVVV.VV.',
    '.VV.......VV.',
    '.VV.......VV.',
    '.VV.......VV.',
    '..V.......V..',
    '..V.......V..'
  ], { V: '#2a5040', X: '#7ad8b0', K: '#0a1a14' });

  P.define('abyssalEel', [
    '............EE..',
    '...........EE...',
    '..........EE....',
    '.........EE.....',
    '........EE......',
    '.......EE.......',
    '......EE........',
    '.....EE.........',
    '....EE..........',
    '...EE...........',
    '..KEEK..........'
  ], { E: '#2f6a5a', K: '#0a1810' });

  P.define('tideGolem', [
    '...CCCCCCC...',
    '..CCCCCCCCC..',
    '.CCCLLLLLCC..',
    '.CCLKCCCKLC..',
    '.CCCLLLLLCC..',
    'CCCCCCCCCCCCC',
    'CCCDDDDDDDCCC',
    'CCCCCCCCCCCCC',
    'CCCCCCCCCCCCC',
    '.CCCCCCCCCCC.',
    '..CCCCCCCCC..',
    '..CC.....CC..',
    '..CC.....CC..',
    '..DD.....DD..'
  ], { C: '#2f6a80', L: '#a0e8f0', K: '#0a1c24', D: '#173a48' });

  P.define('sirenWraith', [
    '.....V...V.....',
    '....VVV.VVV....',
    '...VVVVVVVVV...',
    '...VXVVVVVXV...',
    '..VVVVVVVVVVV..',
    '.VVVVVVVVVVVVV.',
    '.VV.VVVVVVV.VV.',
    '..V.........V..',
    '..VV.......VV..',
    '...VV.....VV...',
    '....VV...VV....'
  ], { V: '#3a6a78', X: '#e8d040', K: '#0a1c20' });

  P.define('leviathanHerald', [
    '....C.....C....',
    '...CCC...CCC...',
    '..CCCCCCCCCCC..',
    '.CCCCCCCCCCCCC.',
    '.CCCLKCCCKLCCC.',
    'CCCCCCCCCCCCCCC',
    'CCCDDDDDDDDDCCC',
    'CCCCCCCCCCCCCCC',
    'CCCCCCCCCCCCCCC',
    '.CCCCCCCCCCCCC.',
    '.CCCCCCCCCCCCC.',
    '..CCCC...CCCC..',
    '..CC.......CC..',
    '..CC.......CC..',
    '.DDD.......DDD.'
  ], { C: '#245868', L: '#7ad8e0', K: '#081820', D: '#123040' });

  P.define('galeFalcon', [
    '.......F.......',
    '......FFF......',
    '.....KFFFK.....',
    'F....FFFFF....F',
    'FF..FFFFFFF..FF',
    'FFFFFFFFFFFFFFF',
    '.FFFFFFFFFFFFF.',
    '...FFFFFFFFF...',
    '...FFFFYFFFF...',
    '....FFFFFFF....',
    '.....FF.FF.....',
    '.....KK.KK.....'
  ], { F: '#c8d4e0', K: '#1c2430', Y: '#e8c050' });

  P.define('thunderCherub', [
    '.....Y.Y.....',
    '....YYYYY....',
    '...YLKYKLY...',
    '....YYYYY....',
    'YY..YYYYY..YY',
    '.YY.YYYYY.YY.',
    '..YYYYYYYYY..',
    '...YYYYYYY...',
    '....Y...Y....',
    '....Y...Y....'
  ], { Y: '#f0e050', L: '#fff8d0', K: '#3a3410' });

  P.define('stormLancer', [
    '.......Y.......',
    '......YYY......',
    '...MMMMMMMMM...',
    '..MMMMMMMMMMM..',
    '.MMMMMMMMMMMMM.',
    '.MMKKYKYKKKMM..',
    '.MMMMMMMMMMMMM.',
    '..MMMMMMMMMMM..',
    '.AAAAAAAAAAAAA.',
    '.AAAYYAAAYYAAA.',
    '.AAAAAAAAAAAAA.',
    '..AAAAAAAAAAA..',
    '...AA.....AA...',
    '...AA.....AA...',
    '...KK.....KK...'
  ], { M: '#8a9ab8', A: '#5a6a88', Y: '#f0e050', K: '#181e28' });

  P.define('cloudSerpent', [
    '............WW..',
    '...........WW...',
    '..........WW....',
    '.........WW.....',
    '........WW......',
    '.......WW.......',
    '......WW........',
    '.....WW.........',
    '....WW..........',
    '...WW...........',
    '..YWWY..........'
  ], { W: '#8aa8d8', Y: '#e8e0f8' });

  P.define('tempestMarshal', [
    '.......Y.......',
    '......YYY......',
    '...MMMMMMMMM...',
    '..MMMMMMMMMMM..',
    '.MMMMMMMMMMMMM.',
    '.MMKKYYYKKKMM..',
    '.MMMMMMMMMMMMM.',
    '..MMMMMMMMMMM..',
    'AAAAAAAAAAAAAAA',
    'AAAAYYYYYYYAAAA',
    'AAAAAAAAAAAAAAA',
    '.AAAAAAAAAAAAA.',
    '..AA.....AA....',
    '..AA.....AA....',
    '.KKK.....KKK...'
  ], { M: '#6a7ab0', A: '#4a5888', Y: '#f0e050', K: '#141828' });

  P.define('sandWraith', [
    '.....U.U.....',
    '....UUUUU....',
    '...UUUUUUU...',
    '...UXUUUXU...',
    '..UUUUUUUUU..',
    '.UUUUUUUUUUU.',
    '.UU.UUUUU.UU.',
    '..U.......U..',
    '..UU.....UU..',
    '...UU...UU...',
    '....UU.UU....'
  ], { U: '#c8a860', X: '#5a1818', K: '#3a2c14' });

  P.define('boneSerpent', [
    '............OO..',
    '...........OO...',
    '..........OO....',
    '.........OO.....',
    '........OO......',
    '.......OO.......',
    '......OO........',
    '.....OO.........',
    '....OO..........',
    '...OO...........',
    '..KOOK..........'
  ], { O: '#e8e0c8', K: '#5a4a2a' });

  P.define('scarabSwarm', [
    '..D.......D..',
    '.DDD.....DDD.',
    'DDDDD...DDDDD',
    '.DDDDD.DDDDD.',
    '..DDDDDDDDD..',
    '.D.DDDDDDD.D.',
    'DD..DDRDD..DD',
    '.D.DDDDDDD.D.',
    '..DDDDDDDDD..',
    '.DDDDD.DDDDD.',
    'DDDDD...DDDDD',
    '.DDD.....DDD.'
  ], { D: '#4a3a1a', R: '#e88030', K: '#1c1608' });

  P.define('dustDjinn', [
    '......G.G......',
    '.....GGGGG.....',
    '....GLKGKLG....',
    '.....GGGGG.....',
    '..GG.GGGGG.GG..',
    '.G.GGGGGGGGG.G.',
    '..GGGGGGGGGGG..',
    '...GGGGGGGGG...',
    '....GG.G.GG....',
    '....G...G......',
    '....G...G......'
  ], { G: '#e0c888', L: '#fff4d8', K: '#4a3c18' });

  P.define('pharaohAsh', [
    '.....Y.Y.....',
    '....YYYYY....',
    '...UUUUUUU...',
    '..UUUUUUUUU..',
    '.UUUUUUUUUUU.',
    '.UUKKUKUKKU..',
    '.UUUUUUUUUUU.',
    '..UUUYYYUUU..',
    '..UUUUUUUUU..',
    '...UU.....UU.',
    '...UU.....UU.',
    '...UU.....UU.',
    '..KKK.....KKK'
  ], { U: '#c89848', Y: '#f0d060', K: '#3a2810' });

  P.define('magmaHound', [
    '....R......R....',
    '...RRR....RRR...',
    '..RRRRRRRRRRRR..',
    '.RRRRRRRRRRRRRR.',
    '.RRROORRRROORRR.',
    '.RRRRRRRRRRRRRR.',
    '.RRRRYYYYYYRRRR.',
    '.RRRRYKKYKYRRRR.',
    '.RRRRYYYYYYRRRR.',
    '.RRRRRRRRRRRRRR.',
    '..RRRRRRRRRRRR..',
    '...RRRR..RRRR...',
    '...RR......RR...',
    '...KK......KK...'
  ], { R: '#6a1c10', O: '#e85820', Y: '#f0d040', K: '#1a0a06' });

  P.define('cinderGolem', [
    '...KKKKKKK...',
    '..KKKKKKKKK..',
    '.KKKOOOOOKK..',
    '.KKOYKOKYOKK.',
    '.KKKOOOOOKK..',
    'KKKKKKKKKKKKK',
    'KKKOOKOOKOKKK',
    'KKKKKKKKKKKKK',
    'KKKOKKKKKOKK.',
    '.KKKKKKKKKKK.',
    '..KKKKKKKKK..',
    '..KK.....KK..',
    '..OO.....OO..',
    '..OO.....OO..'
  ], { K: '#2a1a14', O: '#e85820', Y: '#f0d040' });

  P.define('lavaSerpent', [
    '............RR..',
    '...........RR...',
    '..........RR....',
    '.........RR.....',
    '........RR......',
    '.......RR.......',
    '......RR........',
    '.....RR.........',
    '....RR..........',
    '...RR...........',
    '..KOOK..........'
  ], { O: '#e85820', R: '#8a2410', K: '#1a0a06' });

  P.define('pyroclastBat', [
    '..R....R....R..',
    '.RRR..RRR..RRR.',
    'RRRRRRRRRRRRRRR',
    '.RRRRRRRRRRRRR.',
    '...RRRRRRRRR...',
    '...RRRXXRRRR...',
    '...RRRRRRRRR...',
    '....RRR.RRR....',
    '....KK...KK....'
  ], { R: '#7a2414', X: '#f0d040', K: '#1a0806' });

  P.define('coreWarden', [
    '...OOOOOOO...',
    '..OOOOOOOOO..',
    '.OOOKKKKKOO..',
    '.OOKYOOOYKOO.',
    '.OOOKKKKKOO..',
    'OOOOOOOOOOOOO',
    'OOORRRRRRROOO',
    'OOOOOOOOOOOOO',
    'OOOYOOOOOYOO.',
    '.OOOOOOOOOOO.',
    '..OOOOOOOOO..',
    '..OO.....OO..',
    '..RR.....RR..',
    '..RR.....RR..'
  ], { O: '#8a3018', R: '#e85820', Y: '#f0d040', K: '#1c0c08' });

  P.define('gearSentinel', [
    '...MYM...MYM...',
    '..MMMM...MMMM..',
    '..MMMMMMMMMMM..',
    '.MMMDDDDDDDMMM.',
    'MMMMDDDDDDDMMMM',
    'MMMMMMRMRMMMMMM',
    '.MMMMDDDDDMMMM.',
    '..MMMMMMMMMMM..',
    '..MM.MMMMM.MM..',
    '..MM.......MM..',
    '..MM.......MM..',
    '.DDD.......DDD.'
  ], { M: '#8a8a94', D: '#454550', R: '#e85838', K: '#1c1c22', Y: '#f0d040' });

  P.define('sparkHound', [
    '....D......D....',
    '...DDD....DDD...',
    '..DDDDDDDDDDDD..',
    '.DDDDDDDDDDDDDD.',
    '.DDDYYDDDDYYDDD.',
    '.DDDDDDDDDDDDDD.',
    '.DDDDYYYYYYDDDD.',
    '.DDDDYKKYKYDDDD.',
    '.DDDDYYYYYYDDDD.',
    '.DDDDDDDDDDDDDD.',
    '..DDDDDDDDDDDD..',
    '...DDDD..DDDD...',
    '...YY......YY...',
    '...KK......KK...'
  ], { D: '#3a4058', Y: '#f0e050', K: '#0e1018' });

  P.define('pistonGolem', [
    '...RRRRRRR...',
    '..RRRRRRRRR..',
    '.RRRKKKKKRR..',
    '.RRKYRKRYKRR.',
    '.RRRKKKKKRR..',
    'RRRRRRRRRRRRR',
    'RRRMMRRRMMRRR',
    'RRRMMRRRMMRRR',
    'RRRRRRRRRRRRR',
    '.RRRRRRRRRRR.',
    '..RRRRRRRRR..',
    '..RR.....RR..',
    '..MM.....MM..',
    '..MM.....MM..'
  ], { R: '#5a6270', M: '#8a94a8', Y: '#e85838', K: '#161a20' });

  P.define('rotorWraith', [
    '......D......',
    '.....DDD.....',
    'W....DDD....W',
    'WW..DDDDD..WW',
    'WWWWDDDDDWWWW',
    '.WWWDDDDDWWW.',
    '...DDDKDDD...',
    '...DDDDDDD...',
    '....DD.DD....',
    '....KK.KK....'
  ], { W: '#c8d0dc', D: '#4a5468', K: '#161a20' });

  P.define('grandAutomaton', [
    '..MYM...MYM..',
    '.MMMMM.MMMMM.',
    '.MMMMMMMMMMM.',
    'MMMDDDDDDDMMM',
    'MMMDDDDDDDMMM',
    'MMMMRMRMRMMMM',
    '.MMMDDDDDMMM.',
    'MMMMMMMMMMMMM',
    'MMMM.MMM.MMMM',
    'MMMM.....MMMM',
    'MMMM.....MMMM',
    '.DDD.....DDD.',
    '.DDD.....DDD.'
  ], { M: '#9a9aa8', D: '#4a4a58', R: '#e85838', K: '#1c1c26', Y: '#f0d040' });

  P.define('fungalStalker', [
    '....N......N....',
    '...NNN....NNN...',
    '..NNNNNNNNNNNN..',
    '.NNNNNNNNNNNNNN.',
    '.NNNMMNNNNMMNNN.',
    '.NNNNNNNNNNNNNN.',
    '.NNNNGGGGGGNNNN.',
    '.NNNNGKKGKGNNNN.',
    '.NNNNGGGGGGNNNN.',
    '.NNNNNNNNNNNNNN.',
    '..NNNNNNNNNNNN..',
    '...NNNN..NNNN...',
    '...NN......NN...',
    '...KK......KK...'
  ], { N: '#4a5a2a', G: '#8ab040', M: '#c8e080', K: '#141c0a' });

  P.define('thornWraith', [
    '.....N.N.....',
    '....NNNNN....',
    '...NNNNNNN...',
    '...NMNNNMN...',
    '..NNNNNNNNN..',
    '.NNNNNNNNNNN.',
    '.NN.NNNNN.NN.',
    '..N.G.G.G.N..',
    '..NG.....GN..',
    '...N.....N...',
    '...N.....N...',
    '..GN.....NG..'
  ], { N: '#3a4a22', M: '#e0a838', G: '#6a8a34', K: '#0e1408' });

  P.define('sporeBat', [
    '..N....N....N..',
    '.NNN..NNN..NNN.',
    'NNNNNNNNNNNNNNN',
    '.NNNNNNNNNNNNN.',
    '...NNNNNNNNN...',
    '...NNNGGNNNN...',
    '...NNNNNNNNN...',
    '....NNN.NNN....',
    '....GG...GG....'
  ], { N: '#3a4a22', G: '#8ab040', K: '#141c0a' });

  P.define('rootboundGolem', [
    '...NNNNNNN...',
    '..NNNNNNNNN..',
    '.NNNGGGGGNN..',
    '.NNGMNGNMGNN.',
    '.NNNGGGGGNN..',
    'NNNNNNNNNNNNN',
    'NNNGGNGGNGNNN',
    'NNNNNNNNNNNNN',
    'NNNGNNNNNGNN.',
    '.NNNNNNNNNNN.',
    '..NNNNNNNNN..',
    '..NN.....NN..',
    '..GG.....GG..',
    '..GG.....GG..'
  ], { N: '#3a4a22', G: '#6a8a34', M: '#c8e080', K: '#101a08' });

  P.define('blightHeart', [
    '.....M.M.....',
    '....MMMMM....',
    '...NNNNNNN...',
    '..NNNNNNNNN..',
    '.NNNNRRRNNNN.',
    '.NNNRRKRRNNN.',
    '.NNNNRRRNNNN.',
    '..NNNNNNNNN..',
    '..GNNNNNNNG..',
    '...G.....G...',
    '...G.....G...',
    '..GG.....GG..'
  ], { N: '#3a2848', R: '#9a2848', M: '#c05888', G: '#5a3a68', K: '#160c1c' });

  P.define('frostSpawn', [
    '............BB..',
    '...........BB...',
    '..........BB....',
    '.........BB.....',
    '........BB......',
    '.......BB.......',
    '......BB........',
    '.....BB.........',
    '....BB..........',
    '...BB...........',
    '..WBBW..........'
  ], { B: '#3a6a90', W: '#e8f8ff', K: '#0e2030' });

  P.define('glacialWraith', [
    '.....W.W.....',
    '....WWWWW....',
    '...WWWWWWW...',
    '...WXWWWXW...',
    '..WWWWWWWWW..',
    '.WWWWWWWWWWW.',
    '.WW.WWWWW.WW.',
    '..W.......W..',
    '..WW.....WW..',
    '...WW...WW...',
    '....W.W.W....'
  ], { W: '#7ab0d8', X: '#e8f8ff', K: '#0e2c40' });

  P.define('rimeGolem', [
    '...WWWWWWW...',
    '..WWWWWWWWW..',
    '.WWWBBBBBWW..',
    '.WWBKWBWKBWW.',
    '.WWWBBBBBWW..',
    'WWWWWWWWWWWWW',
    'WWWBBWBBWBWWW',
    'WWWWWWWWWWWWW',
    'WWWBWWWWWBWW.',
    '.WWWWWWWWWWW.',
    '..WWWWWWWWW..',
    '..WW.....WW..',
    '..BB.....BB..',
    '..BB.....BB..'
  ], { W: '#a8d8f0', B: '#3a6a90', K: '#0e2030' });

  P.define('frozenHarpy', [
    '.......W.......',
    '......WWW......',
    '.....KWWWK.....',
    'W....WWWWW....W',
    'WW..WWWWWWW..WW',
    'WWWWWWWWWWWWWWW',
    '.WWWWWWWWWWWWW.',
    '...WWWWWWWWW...',
    '...WWWWBWWWW...',
    '....WWWWWWW....',
    '.....WW.WW.....',
    '.....BB.BB.....'
  ], { W: '#c8e8f8', B: '#3a6a90', K: '#0e2030' });

  P.define('frostSovereign', [
    '....W..W..W....',
    '...WWWWWWWWW...',
    '..WWWWWWWWWWW..',
    '.WWWBBBBBBBWWW.',
    '.WWBKWWBWWKBWW.',
    '.WWWBBBBBBBWWW.',
    'WWWWWWWWWWWWWWW',
    'WWWBBBBBBBBBWWW',
    'WWWWWWWWWWWWWWW',
    '.WWWWWWWWWWWWW.',
    '.WWWWWWWWWWWWW.',
    '..WWWW...WWWW..',
    '..WW.......WW..',
    '..WW.......WW..',
    '.BBB.......BBB.'
  ], { W: '#a8d8f0', B: '#2a5a80', K: '#0a1c2c' });

  P.define('starWisp', [
    '......P.......',
    '.....PPP......',
    '....PLPLP.....',
    '...P..P..P....',
    '..P...P...P...',
    '.P....K....P..',
    '..P..PPP..P...',
    '...PPLLLPP....',
    '..P..PPP..P...',
    '.P....K....P..',
    '..P...P...P...',
    '...P..P..P....'
  ], { P: '#9a70e8', L: '#e8d8ff', K: '#1c1030' });

  P.define('voidSerpent', [
    '............PP..',
    '...........PP...',
    '..........PP....',
    '.........PP.....',
    '........PP......',
    '.......PP.......',
    '......PP........',
    '.....PP.........',
    '....PP..........',
    '...PP...........',
    '..KPPK..........'
  ], { P: '#5a2890', K: '#150a24' });

  P.define('nebulaGolem', [
    '...PPPPPPP...',
    '..PPPPPPPPP..',
    '.PPPLLLLLPP..',
    '.PPLKPLPKLPP.',
    '.PPPLLLLLPP..',
    'PPPPPPPPPPPPP',
    'PPPKKPKKPKPPP',
    'PPPPPPPPPPPPP',
    'PPPLPPPPPLPP.',
    '.PPPPPPPPPPP.',
    '..PPPPPPPPP..',
    '..PP.....PP..',
    '..KK.....KK..',
    '..KK.....KK..'
  ], { P: '#5a2890', L: '#c890ff', K: '#150a24' });

  P.define('astralWraith', [
    '.....P.P.....',
    '....PPPPP....',
    '...PPPPPPP...',
    '...PLPPPLP...',
    '..PPPPPPPPP..',
    '.PPPPPPPPPPP.',
    '.PP.PPPPP.PP.',
    '..P.......P..',
    '..PP.....PP..',
    '...PP...PP...',
    '....P.P.P....'
  ], { P: '#7a4ac0', L: '#e8d8ff', K: '#180c2c' });

  P.define('riftWarden', [
    '....P..P..P....',
    '...PPPPPPPPP...',
    '..PPPPPPPPPPP..',
    '.PPPLLLLLLLPPP.',
    '.PPLKPPLPPKLPP.',
    '.PPPLLLLLLLPPP.',
    'PPPPPPPPPPPPPPP',
    'PPPLLLLLLLLLPPP',
    'PPPPPPPPPPPPPPP',
    '.PPPPPPPPPPPPP.',
    '.PPPPPPPPPPPPP.',
    '..PPPP...PPPP..',
    '..PP.......PP..',
    '..PP.......PP..',
    '.KKK.......KKK.'
  ], { P: '#5a2890', L: '#c890ff', K: '#150a24' });

  P.define('chimericHound', [
    '....R......B....',
    '...RRR....BBB...',
    '..RRRRRRRRBBBB..',
    '.RRRRRRRRRRBBBB.',
    '.RRROORRRRBBOOB.',
    '.RRRRRRRRRRBBBB.',
    '.RRRRYYYYYYBBBB.',
    '.RRRRYKKYKYBBBB.',
    '.RRRRYYYYYYBBBB.',
    '.RRRRRRRRRRBBBB.',
    '..RRRRRRRRBBBB..',
    '...RRRR..BBBB...',
    '...RR......BB...',
    '...KK......KK...'
  ], { R: '#8a2020', B: '#2a3888', O: '#e85820', Y: '#f0e050', K: '#160808' });

  P.define('chaosGolem', [
    '...MMMMMMM...',
    '..MMMMMMMMM..',
    '.MMMRRRRRMM..',
    '.MMRYMRMYRMM.',
    '.MMMRRRRRMM..',
    'MMMMMMMMMMMMM',
    'MMMBBMRRMBMMM',
    'MMMMMMMMMMMMM',
    'MMMRMMMMMRMM.',
    '.MMMMMMMMMMM.',
    '..MMMMMMMMM..',
    '..MM.....MM..',
    '..BB.....RR..',
    '..BB.....RR..'
  ], { M: '#4a4a58', R: '#c8383a', B: '#3858c8', Y: '#f0e050', K: '#14141c' });

  P.define('discordWraith', [
    '.....P.R.....',
    '....PRPRP....',
    '...PPPPPPP...',
    '...RXPPPXR...',
    '..PPPPPPPPP..',
    '.PRPPPPPPPRP.',
    '.PP.PPPPP.PP.',
    '..P.......P..',
    '..RP.....PR..',
    '...PP...PP...',
    '....R.P.R....'
  ], { P: '#5a2870', R: '#c8383a', X: '#e8c060', K: '#180a20' });

  P.define('fluxSerpent', [
    '............BB..',
    '...........BB...',
    '..........BB....',
    '.........BB.....',
    '........BB......',
    '.......BB.......',
    '......BB........',
    '.....BB.........',
    '....BB..........',
    '...BB...........',
    '..RBBR..........'
  ], { R: '#c8383a', B: '#3858c8', K: '#12142c' });

  P.define('forgeMaster', [
    '....Y..Y..Y....',
    '...MMMMMMMMM...',
    '..MMMMMMMMMMM..',
    '.MMMRRRRRRRMMM.',
    '.MMRYMMRMMYRMM.',
    '.MMMRRRRRRRMMM.',
    'MMMMMMMMMMMMMMM',
    'MMMBBRRRRRBBMMM',
    'MMMMMMMMMMMMMMM',
    '.MMMMMMMMMMMMM.',
    '.MMMMMMMMMMMMM.',
    '..MMMM...MMMM..',
    '..MM.......MM..',
    '..MM.......MM..',
    '.RRR.......RRR.'
  ], { M: '#5a5a68', R: '#c8383a', B: '#3858c8', Y: '#f0e050', K: '#14141c' });

  P.define('twilightSeraph', [
    '......Y.Y......',
    '.....YYYYY.....',
    'W....YLKLY....W',
    'WW...YYYYY...WW',
    'WWW..YYYYY..WWW',
    'WWWWWYYYYYWWWWW',
    '.WWWWYYYYYWWWW.',
    '...WWYYYYYWW...',
    '.....YY.YY.....',
    '.....YY.YY.....',
    '....KKK.KKK....'
  ], { Y: '#e8d888', W: '#c8b8f0', L: '#fff8e0', K: '#302858' });

  P.define('chronoGolem', [
    '...VVVVVVV...',
    '..VVVVVVVVV..',
    '.VVVYYYYYVV..',
    '.VVYKVYVKYVV.',
    '.VVVYYYYYVV..',
    'VVVVVVVVVVVVV',
    'VVVGGVYYVGVVV',
    'VVVVVVVVVVVVV',
    'VVVYVVVVVYVV.',
    '.VVVVVVVVVVV.',
    '..VVVVVVVVV..',
    '..VV.....VV..',
    '..GG.....GG..',
    '..GG.....GG..'
  ], { V: '#403868', Y: '#e8d888', G: '#8a7ab0', K: '#140e28' });

  P.define('sanctumWraith', [
    '.....Y.Y.....',
    '....YYYYY....',
    '...VVVVVVV...',
    '...VXVVVXV...',
    '..VVVVVVVVV..',
    '.VVVVVVVVVVV.',
    '.VV.VVVVV.VV.',
    '..V.......V..',
    '..VY.....YV..',
    '...V.....V...',
    '...V.....V...',
    '..YV.....VY..'
  ], { V: '#3a2f5e', Y: '#e8d888', X: '#c890ff', K: '#140e28' });

  P.define('chronoSerpent', [
    '............VV..',
    '...........VV...',
    '..........VV....',
    '.........VV.....',
    '........VV......',
    '.......VV.......',
    '......VV........',
    '.....VV.........',
    '....VV..........',
    '...VV...........',
    '..YVVY..........'
  ], { V: '#403868', Y: '#e8d888', K: '#140e28' });

  P.define('timelessHerald', [
    '....Y..Y..Y....',
    '...YYYYYYYYY...',
    '..VVVVVVVVVVV..',
    '.VVVWWWWWWWVVV.',
    '.VVWKVVWVVKWVV.',
    '.VVVWWWWWWWVVV.',
    'VVVVVVVVVVVVVVV',
    'VVVYYYYYYYYYVVV',
    'VVVVVVVVVVVVVVV',
    '.VVVVVVVVVVVVV.',
    '.VVVVVVVVVVVVV.',
    '..VVVV...VVVV..',
    '..VV.......VV..',
    '..VV.......VV..',
    '.YYY.......YYY.'
  ], { V: '#3a2f5e', W: '#c8b8f0', Y: '#e8d888', K: '#140e28' });

  P.define('timelessSovereign', [
    '...Y..Y..Y..Y...',
    '..YYYYYYYYYYYY..',
    '...V........V...',
    '..VVV......VVV..',
    '...VVVVVVVVVV...',
    '...VWVVVVVVWV...',
    '...VVVVVVVVVV...',
    '..VVVVVVVVVVVV..',
    '.VVVVVVYYVVVVVV.',
    '.VVVVVVYYVVVVVV.',
    '..VVVVVVVVVVVV..',
    '...VVVVVVVVVV...',
    '....VVVVVVVV....',
    '.....VV..VV.....',
    '.....VV..VV.....',
    '....YYY..YYY....'
  ], { Y: '#e8d040', V: '#241a44', W: '#c890ff', K: '#0a0714' });

  // ---- 16 additional playable classes (palette-swaps of BLADE_GRID / STAFFORB_GRID) ----

  P.define('gunslinger', BLADE_GRID, { K: '#0a0a0a', G: '#8a7a5a', R: '#5a4030', Y: '#d8a840', U: '#3a2a1a', W: '#e8d8b0' });
  P.define('samurai', BLADE_GRID, { K: '#0a0a0a', G: '#c8283a', R: '#1a1a1e', Y: '#e8c050', U: '#2a1a1a', W: '#f0f0f0' });
  P.define('runeblade', BLADE_GRID, { K: '#0a0a0a', G: '#3a2050', R: '#22142e', Y: '#a060ff', U: '#150a1e', W: '#c890ff' });
  P.define('beastmaster', BLADE_GRID, { K: '#0a0a0a', G: '#5a7a3a', R: '#7a5a30', Y: '#c8a850', U: '#3a2a18', W: '#e8e0c0' });
  P.define('shadowDancer', BLADE_GRID, { K: '#0a0a0a', G: '#1a3838', R: '#102020', Y: '#40d8c0', U: '#0a1414', W: '#80f0e0' });
  P.define('sharpshooter', BLADE_GRID, { K: '#0a0a0a', G: '#5a6070', R: '#3a4048', Y: '#d0d8e0', U: '#20242a', W: '#f0f4f8' });
  P.define('battlemage', BLADE_GRID, { K: '#0a0a0a', G: '#3a58a0', R: '#20305a', Y: '#f0d060', U: '#182040', W: '#a0c0ff' });

  P.define('druid', STAFFORB_GRID, { N: '#2f5a2a', K: '#0a0a0a', B: '#3a6a34', p: '#c8a838' });
  P.define('alchemist', STAFFORB_GRID, { N: '#5a2a4a', K: '#0a0a0a', B: '#6a3458', p: '#80e070' });
  P.define('warlock', STAFFORB_GRID, { N: '#2a0a0a', K: '#0a0a0a', B: '#4a1414', p: '#ff8020' });
  P.define('frostOracle', STAFFORB_GRID, { N: '#3a5a7a', K: '#0a2030', B: '#5a80a0', p: '#e8f8ff' });
  P.define('stormCaller', STAFFORB_GRID, { N: '#3a3a48', K: '#0a0a0a', B: '#50505e', p: '#f0e050' });
  P.define('bard', STAFFORB_GRID, { N: '#6a2838', K: '#0a0a0a', B: '#8a3a4a', p: '#f0c860' });
  P.define('puppeteer', STAFFORB_GRID, { N: '#403050', K: '#0a0a0a', B: '#584068', p: '#e04858' });
  P.define('tempestWitch', STAFFORB_GRID, { N: '#0a3a4a', K: '#0a0a0a', B: '#145a6a', p: '#60e8f0' });
  P.define('chronomancer', STAFFORB_GRID, { N: '#2a2a5a', K: '#0a0a0a', B: '#3a3a78', p: '#f0e8c0' });

  // ---- 5 unlockable "Valiant" elite classes (palette-swaps of BLADE_GRID / STAFFORB_GRID) ----

  P.define('warlord', BLADE_GRID, { K: '#0a0a0a', G: '#8a6a2a', R: '#3a2a14', Y: '#e8c060', U: '#1a1408', W: '#e04030' });
  P.define('shadowhunter', BLADE_GRID, { K: '#0a0a0a', G: '#1a2438', R: '#0e1624', Y: '#6ae090', U: '#080c14', W: '#a0f0b8' });
  P.define('executioner', BLADE_GRID, { K: '#0a0a0a', G: '#3a0a0a', R: '#1a0606', Y: '#d81828', U: '#100404', W: '#f04858' });
  P.define('vanguard', BLADE_GRID, { K: '#0a0a0a', G: '#186878', R: '#0e3a44', Y: '#60e8f0', U: '#082028', W: '#c0f8ff' });
  P.define('deathbringer', STAFFORB_GRID, { N: '#3a0a14', K: '#0a0a0a', B: '#5a1420', p: '#ff2030' });

  // ---- Equipment-slot & item icons (weapon, armor, shoes, accessory, potions) ----

  P.define('weaponSlot', [
    '.....K.....',
    '....KWK....',
    '....KWK....',
    '...KWWWK...',
    '...KWWWK...',
    '...KWWWK...',
    '...KWWWK...',
    '...KWWWK...',
    '...KWWWK...',
    '..KWWWWWK..',
    '.KYYYYYYYK.',
    '...KUUK....',
    '...KUUK....',
    '...KUUK....',
    '..KYYYYK...',
    '...KKKK....'
  ], { K: '#0a0a0a', W: '#e8ecf2', Y: '#e8c050', U: '#5a3818' });

  // A Minecraft-style chestplate: blocky, no curves -- shoulder-strap prongs,
  // then a full-width sleeve row that sticks out past the torso on both
  // sides, then the chest block (with a center rivet) narrows back in.
  P.define('armorSlot', [
    '..MMM...MMM..',
    '..MMMMMMMMM..',
    'MMMMMMMMMMMMM',
    'MMMMMMMMMMMMM',
    '..MDDDDDDDM..',
    '..MDDDYDDDM..',
    '..MDDDDDDDM..',
    '..MDDDDDDDM..',
    '..MDDDDDDDM..',
    '..MMMMMMMMM..'
  ], { M: '#c8ccd6', D: '#6a7488', Y: '#e8c050' });

  P.define('shoesSlot', [
    '...UUUU.....',
    '...UUUU.....',
    '...UUUU.....',
    '...UUUU.....',
    '...UUUUUU...',
    '...UUUUUUUU.',
    '..UUUUUUUUUU',
    '.UUUUUUUUUUU',
    '.GGGGGGGGGGG',
    '.GGGGGGGGGGG',
    '..DDDDDDDD..'
  ], { U: '#8a5a2a', G: '#c8c8c8', D: '#4a4a50' });

  P.define('accessorySlot', [
    '....P....',
    '...PPP...',
    '..PPPPP..',
    '...YYY...',
    '..YYYYY..',
    '.YY...YY.',
    'YY.....YY',
    'YY.....YY',
    'YY.....YY',
    '.YY...YY.',
    '..YYYYY..',
    '...YYY...'
  ], { P: '#b060f0', Y: '#e8c050' });

  // ---- Element icons: shown on every skill badge and in the how-to-play guide's
  // element grid -- each needs to be unmistakable at a glance. Colors match the
  // --el-* CSS variables already used for these elements' tag chips. ----

  P.define('phys', [
    '..K...K..',
    '.KWWWWWK.',
    'KWWWWWWWK',
    'KWWWWWWWK',
    'KWWWWWWWK',
    '.KWWWWWK.',
    '..KWWWK..',
    '...KWK...',
    '...KWK...'
  ], { K: '#3a362e', W: '#d8d0c0' });

  P.define('fire', [
    '....K....',
    '....R....',
    '...RRR...',
    '..RROOR..',
    '.RROOOOR.',
    '.ROOOOOR.',
    '.RROOORR.',
    '..RRRRR..',
    '...RRR...',
    '....K....'
  ], { K: '#4a1c00', R: '#f07030', O: '#ffb060' });

  P.define('ice', [
    'K...I...K',
    '.K..I..K.',
    '..K.I.K..',
    'IIIIIIIII',
    '..K.I.K..',
    '.K..I..K.',
    'K...I...K'
  ], { K: '#1a4a5a', I: '#48c8e8' });

  P.define('elec', [
    '..KK...',
    '.KYYK..',
    'KYYK...',
    '.KYYK..',
    '..KYYK.',
    '...KYYK',
    '....KYK',
    '....KK.'
  ], { K: '#5a4a00', Y: '#f0d030' });

  // A ring with a small curling tail -- an earlier version with an inner
  // branch mark misread as a face at small render size; a plain curl reads
  // unambiguously as a gust/swirl.
  P.define('wind', [
    '..GGG..',
    '.G...G.',
    'G.....G',
    'G.GGG.G',
    '.G...G.',
    '..GGG..',
    '....G..',
    '....G..'
  ], { G: '#48a058' });

  // A simple radiant orb -- an earlier corner-ray version misread as a bug
  // at small render size; a clean glowing sphere is far more robust.
  P.define('light', [
    '..YYY..',
    '.YYYYY.',
    'YYYWWYY',
    'YYWWWWY',
    'YYYWWYY',
    '.YYYYY.',
    '..YYY..'
  ], { Y: '#f5e8b8', W: '#fffbe8' });

  P.define('dark', [
    '..PPPP...',
    '.P....P..',
    'P......P.',
    'P.....P..',
    'P....P...',
    'P...P....',
    'P....P...',
    'P.....P..',
    'P......P.',
    '.P....P..',
    '..PPPP...'
  ], { P: '#a060e0' });

  P.define('almighty', [
    '....K....',
    '....P....',
    '...PPP...',
    '..PPPPP..',
    '.PPPPPPP.',
    'KPPPWPPPK',
    '.PPPPPPP.',
    '..PPPPP..',
    '...PPP...',
    '....P....',
    '....K....'
  ], { K: '#5a1040', P: '#e83daa', W: '#ffe0f0' });

  // ---- Battle action bar icons: Attack/Skills/Guard/Items, drawn in the same
  // compact "shop slot" style as the equipment icons above. ----

  P.define('swordAttack', [
    '.....K.....',
    '....KWK....',
    '....KWK....',
    '...KWWWK...',
    '...KWWWK...',
    '...KWWWK...',
    '...KWWWK...',
    '...KWWWK...',
    '...KWWWK...',
    '..KWWWWWK..',
    '.KYYYYYYYK.',
    '...KUUK....',
    '...KUUK....',
    '...KUUK....',
    '..KYYYYK...',
    '...KKKK....'
  ], { K: '#0a0a0a', W: '#e8ecf2', Y: '#e8c050', U: '#5a3818' });

  P.define('shieldGuard', [
    '...KKKKK...',
    '..KMMMMMK..',
    '.KMMMMMMMK.',
    'KMMMYYYMMMK',
    'KMMYYYYYMMK',
    'KMMYYYYYMMK',
    'KMMMYYYMMMK',
    '.KMMMMMMMK.',
    '.KMMMMMMMK.',
    '..KMMMMMK..',
    '...KMMMK...',
    '....KMK....',
    '.....K.....'
  ], { K: '#0a0a0a', M: '#c8ccd6', Y: '#e8c050' });

  // Skills: a flame -- a common shorthand for "special technique", and reads
  // clearly at icon size for both physical and magic skills alike.
  P.define('magicBurst', [
    '....K.....',
    '....R.....',
    '...RRR....',
    '...ROR....',
    '..RROOR...',
    '..ROOOOR..',
    '.RROOOYR..',
    '.ROOOOYYR.',
    '.ROOOYYYR.',
    '.RROOYYRR.',
    '..RROYYRR.',
    '...RRRRR..',
    '....RRR...',
    '.....K....'
  ], { K: '#3a0a00', R: '#c82818', O: '#f08020', Y: '#f8e050' });

  // Items: a red potion flask, same silhouette as the HP potion below.
  P.define('bagItem', [
    '...UUU...',
    '...UUU...',
    '..GGGGG..',
    '.GRRRRRG.',
    'GRRRRRRRG',
    'GRRRWRRRG',
    'GRRRRRRRG',
    'GRRRRRRRG',
    '.GRRRRRG.',
    '..GRRRG..',
    '..GGGGG..',
    '...GGG...'
  ], { U: '#5a3818', G: '#8a94a8', R: '#d02838', W: '#f4f0e8' });

  P.define('potion', [
    '...UUU...',
    '...UUU...',
    '..GGGGG..',
    '.GRRRRRG.',
    'GRRRRRRRG',
    'GRRRWRRRG',
    'GRRRRRRRG',
    'GRRRRRRRG',
    '.GRRRRRG.',
    '..GRRRG..',
    '..GGGGG..',
    '...GGG...'
  ], { U: '#5a3818', G: '#8a94a8', R: '#d02838', W: '#f4f0e8' });

  P.define('mpPotion', [
    '...UUU...',
    '...UUU...',
    '..GGGGG..',
    '.GBBBBBG.',
    'GBBBBBBBG',
    'GBBBWBBBG',
    'GBBBBBBBG',
    'GBBBBBBBG',
    '.GBBBBBG.',
    '..GBBBG..',
    '..GGGGG..',
    '...GGG...'
  ], { U: '#5a3818', G: '#8a94a8', B: '#3868c8', W: '#f4f0e8' });

  // ---- Remaining UI glyphs, converted from plain text to pixel art for a
  // consistent look throughout -- resource/status icons, and basic chrome
  // (back/close/lock/etc). Kept deliberately bold and simple: an earlier pass
  // on the element icons showed that fussy detail disappears (or worse,
  // misreads) at the small sizes these render at. ----

  P.define('heart', [
    '.RR.RR.',
    'RRRRRRR',
    'RRRRRRR',
    '.RRRRR.',
    '..RRR..',
    '...R...'
  ], { R: '#d02838' });

  P.define('drop', [
    '...B...',
    '..BBB..',
    '.BBBBB.',
    'BBBBBBB',
    'BBBBBBB',
    '.BBBBB.',
    '..BBB..'
  ], { B: '#3868c8' });

  P.define('coin', [
    '.YYYYY.',
    'YYYYYYY',
    'YYKKKYY',
    'YYKYKYY',
    'YYKKKYY',
    'YYYYYYY',
    '.YYYYY.'
  ], { Y: '#e8c050', K: '#8a6a10' });

  P.define('gem', [
    '..III..',
    '.IWIII.',
    'IIIIIII',
    '.IIIII.',
    '..III..',
    '...I...'
  ], { I: '#48c8e8', W: '#e0f8ff' });

  P.define('scroll', [
    'UUUUUUU',
    'U.....U',
    'U.PPP.U',
    'U.PPP.U',
    'U.....U',
    'UUUUUUU'
  ], { U: '#8a6a3a', P: '#e8d8a8' });

  P.define('lock', [
    '.KKKKK.',
    '.K...K.',
    '.K...K.',
    'KKKKKKK',
    'KYYYYYK',
    'KY.K.YK',
    'KYYYYYK'
  ], { K: '#5a5a68', Y: '#e8c050' });

  P.define('save', [
    'KKKKKKK',
    'K.....K',
    'K.WWW.K',
    'K.....K',
    'K.RRR.K',
    'K.RRR.K',
    'KKKKKKK'
  ], { K: '#3a4a68', W: '#e8f0ff', R: '#d02838' });

  P.define('trash', [
    '.KKKKK.',
    '.......',
    'KUUUUUK',
    '.UUUUU.',
    '.U.U.U.',
    '.U.U.U.',
    '.UUUUU.'
  ], { K: '#8a8a94', U: '#6a7488' });

  P.define('star', [
    '...Y...',
    '..YYY..',
    '.YYYYY.',
    'YYYYYYY',
    '..Y.Y..',
    '.Y...Y.'
  ], { Y: '#e8c050' });

  P.define('sparkles', [
    '..Y.....',
    '.YYY..Y.',
    'YYYYY.Y.',
    '.YYY..Y.',
    '..Y.....'
  ], { Y: '#f0e8c0' });

  P.define('buffUp', [
    '...G...',
    '..GGG..',
    '.GGGGG.',
    'GGGGGGG'
  ], { G: '#4ade80' });

  P.define('debuffDown', [
    'RRRRRRR',
    '.RRRRR.',
    '..RRR..',
    '...R...'
  ], { R: '#ff5a5a' });

  P.define('downedMark', [
    'O.....O',
    '.O...O.',
    '..O.O..',
    '...O...',
    '..O.O..',
    '.O...O.',
    'O.....O'
  ], { O: '#ff8020' });

  P.define('enterFloor', [
    'Y......',
    'YY.....',
    'YYY....',
    'YYYY...',
    'YYY....',
    'YY.....',
    'Y......'
  ], { Y: '#e8c050' });

  P.define('back', [
    '...KK..',
    '..KK...',
    '.KK....',
    'KK.....',
    '.KK....',
    '..KK...',
    '...KK..'
  ], { K: '#c8ccd6' });

  P.define('chevronRight', [
    '..KK...',
    '...KK..',
    '....KK.',
    '.....KK',
    '....KK.',
    '...KK..',
    '..KK...'
  ], { K: '#c8ccd6' });

  P.define('close', [
    'K.....K',
    '.K...K.',
    '..K.K..',
    '...K...',
    '..K.K..',
    '.K...K.',
    'K.....K'
  ], { K: '#c8ccd6' });

  P.define('check', [
    '......K',
    '.....K.',
    'K...K..',
    '.K.K...',
    '..K....',
    '.K.....',
    'K......'
  ], { K: '#7ad8a0' });

  // Distinct silhouettes (not just a slash overlay) so on/off reads clearly
  // even without color -- notes-with-waves vs. a plain dimmed note plus an X.
  P.define('soundOn', [
    '..K......',
    '.KKK..W.W',
    'KKKKKW...',
    'KKKKKW...',
    '.KKK..W.W',
    '..K......'
  ], { K: '#e8e0f0', W: '#e8e0f0' });

  P.define('soundOff', [
    '..K.....',
    '.KKK....',
    'KKKKK.R.',
    'KKKKKR.R',
    '.KKK.R.R',
    '..K...R.'
  ], { K: '#6a6478', R: '#ff5a5a' });

  // ---- Crafting material icons: 4 shared silhouettes (fang, pouch of dust,
  // shard/scale, glowing orb/core), each palette-swapped per material so every
  // drop reads as a distinct 8-bit item without hand-authoring 10 grids. ----

  var FANG_GRID = [
    '....W....',
    '....W....',
    '...WWW...',
    '...WWW...',
    '..WWWW...',
    '..WWWW...',
    '.WWWWW...',
    '.WWWWU...',
    'WWWWWU...',
    'WWWUUU...',
    'WWUUU....'
  ];
  P.define('mat_beast_fang', FANG_GRID, { W: '#f0ece0', U: '#8a6a4a' });
  P.define('mat_demon_fang', FANG_GRID, { W: '#1a1418', U: '#7a1420' });
  P.define('mat_storm_feather', FANG_GRID, { W: '#e8f0ff', U: '#3868c8' });
  P.define('mat_bone_fragment', FANG_GRID, { W: '#f0e8d0', U: '#a89060' });

  var POUCH_GRID = [
    '...UU....',
    '...UU....',
    '..UUUU...',
    '.MMMMMM..',
    'MMMMMMMM.',
    'MMMMMMMMM',
    'MMMGMMMMM',
    'MMMMMMMMM',
    '.MMMMMMM.',
    '..MMMMM..',
    '...MMM...'
  ];
  P.define('mat_spirit_dust', POUCH_GRID, { U: '#5a4a70', M: '#8a7aa0', G: '#c8b0ff' });
  P.define('mat_crystal_dust', POUCH_GRID, { U: '#2a5878', M: '#6ab8e8', G: '#e8f8ff' });
  P.define('mat_wraith_essence', POUCH_GRID, { U: '#5a4020', M: '#c8a860', G: '#fff4d8' });

  var SHARD_GRID = [
    '....S....',
    '....S....',
    '...SSS...',
    '...SSS...',
    '..SSSSS..',
    '..SSSSS..',
    '.SSSSSSS.',
    '.SSSSSSS.',
    '.SSDDSSS.',
    '..SSSSS..',
    '...SSS...',
    '....S....'
  ];
  P.define('mat_iron_shard', SHARD_GRID, { S: '#b8bcc8', D: '#6a7488' });
  P.define('mat_wyvern_scale', SHARD_GRID, { S: '#4a9850', D: '#2a6030' });
  P.define('mat_dragon_scale', SHARD_GRID, { S: '#e86838', D: '#a83818' });
  P.define('mat_ancient_scale', SHARD_GRID, { S: '#e8c050', D: '#a87c1a' });
  P.define('mat_resonant_shard', SHARD_GRID, { S: '#8ad0f0', D: '#3a6a90' });
  P.define('mat_abyssal_scale', SHARD_GRID, { S: '#2f6a5a', D: '#153128' });

  var ORB_GRID = [
    '...OOO...',
    '..OOOOO..',
    '.OOOOOOO.',
    'OOOOOOOOO',
    'OOOOGOOOO',
    'OOOOOOOOO',
    '.OOOOOOO.',
    '..OOOOO..',
    '...OOO...'
  ];
  P.define('mat_storm_core', ORB_GRID, { O: '#3868c8', G: '#e8f4ff' });
  P.define('mat_demonic_core', ORB_GRID, { O: '#7a2050', G: '#f0d040' });
  P.define('mat_abyssal_essence', ORB_GRID, { O: '#2a1038', G: '#c860e0' });
  P.define('mat_drowned_core', ORB_GRID, { O: '#245868', G: '#7ad8e0' });
  P.define('mat_voltaic_core', ORB_GRID, { O: '#3a3a48', G: '#f0e050' });

  window.Game = window.Game || {};
})();
