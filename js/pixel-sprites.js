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

  window.Game = window.Game || {};
})();
