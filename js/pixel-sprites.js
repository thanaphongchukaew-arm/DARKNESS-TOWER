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
    '......GGGG......',
    '.....GGGGGG.....',
    '.....GGKKGG.....',
    '.....GGGGGG.....',
    '...GGGRRRRGGG...',
    '...GRRRRRRRRGKWW',
    '...GRRYYRRG..WW.',
    '....RRRRRRRR.WW.',
    '.....RRYYRR..W..',
    '.....RRRRRR.....',
    '.....RRRRRR.....',
    '......RRRR......',
    '......RRRR......',
    '......G..G......',
    '......G..G......',
    '......G..G......',
    '.....UU..UU.....',
    '.....UU..UU.....'
  ], PAL);

  P.define('staffOrb', [
    '........N.......',
    '.......NN.......',
    '......NNNN......',
    '.....NNNNNN.....',
    '....NNNNNNNN....',
    '....NKKNNNN.....',
    '.....NNNNNN.....',
    '....NNBBBBNN....',
    '...NBBBBBBBBN...',
    '...NBBppppBBN...',
    '...NBBBBBBBBN...',
    '....NBBBBBBN....',
    '.....BBBBBB.....',
    '.....BBBBBB.....',
    '......BBBB......',
    '......BBBB......',
    '......K..K......',
    '......K..K......',
    '....KKK..KKK....'
  ], PAL);

  // Shared silhouettes reused by the palette-swapped playable classes below.
  var BLADE_GRID = [
    '......GGGG......',
    '.....GGGGGG.....',
    '.....GGKKGG.....',
    '.....GGGGGG.....',
    '...GGGRRRRGGG...',
    '...GRRRRRRRRGKWW',
    '...GRRYYRRG..WW.',
    '....RRRRRRRR.WW.',
    '.....RRYYRR..W..',
    '.....RRRRRR.....',
    '.....RRRRRR.....',
    '......RRRR......',
    '......RRRR......',
    '......G..G......',
    '......G..G......',
    '......G..G......',
    '.....UU..UU.....',
    '.....UU..UU.....'
  ];
  var STAFFORB_GRID = [
    '........N.......',
    '.......NN.......',
    '......NNNN......',
    '.....NNNNNN.....',
    '....NNNNNNNN....',
    '....NKKNNNN.....',
    '.....NNNNNN.....',
    '....NNBBBBNN....',
    '...NBBBBBBBBN...',
    '...NBBppppBBN...',
    '...NBBBBBBBBN...',
    '....NBBBBBBN....',
    '.....BBBBBB.....',
    '.....BBBBBB.....',
    '......BBBB......',
    '......BBBB......',
    '......K..K......',
    '......K..K......',
    '....KKK..KKK....'
  ];

  P.define('radiantOrb', [
    '........E.......',
    '.......EE.......',
    '......EEEE......',
    '.....EEEEEE.....',
    '....EEEEEEEE....',
    '....EKKEEEE.....',
    '.....EEEEEE.....',
    '....EEYYYYEE....',
    '...EYYYYYYYYE...',
    '...EYYWWWWYYE...',
    '...EYYYYYYYYE...',
    '....EYYYYYYE....',
    '.....YYYYYY.....',
    '.....YYYYYY.....',
    '......YYYY......',
    '......YYYY......',
    '......K..K......',
    '......K..K......',
    '....KKK..KKK....'
  ], PAL);

  // Player classes 4-8 reuse the 'blade' knight silhouette or the 'staffOrb'
  // hooded-caster silhouette with their own palette -- a palette-swap keeps
  // proportions consistent with the original 3 classes while giving each new
  // class a distinct color identity.
  var BERSERKER_PAL = { K: '#0a0a0a', G: '#5a4030', R: '#c05a20', Y: '#d8c090', U: '#3a2410', W: '#b8b8c0' };
  P.define('berserker', [
    '......GGGG......',
    '.....GGGGGG.....',
    '.....GGKKGG.....',
    '.....GGGGGG.....',
    '...GGGRRRRGGG...',
    '...GRRRRRRRRGKWW',
    '...GRRYYRRG..WW.',
    '....RRRRRRRR.WW.',
    '.....RRYYRR..W..',
    '.....RRRRRR.....',
    '.....RRRRRR.....',
    '......RRRR......',
    '......RRRR......',
    '......G..G......',
    '......G..G......',
    '......G..G......',
    '.....UU..UU.....',
    '.....UU..UU.....'
  ], BERSERKER_PAL);

  var PALADIN_PAL = { K: '#0a0a0a', G: '#d8d8e0', R: '#f0ece0', Y: '#e8c050', U: '#9098a8', W: '#fff6c8' };
  P.define('paladin', [
    '......GGGG......',
    '.....GGGGGG.....',
    '.....GGKKGG.....',
    '.....GGGGGG.....',
    '...GGGRRRRGGG...',
    '...GRRRRRRRRGKWW',
    '...GRRYYRRG..WW.',
    '....RRRRRRRR.WW.',
    '.....RRYYRR..W..',
    '.....RRRRRR.....',
    '.....RRRRRR.....',
    '......RRRR......',
    '......RRRR......',
    '......G..G......',
    '......G..G......',
    '......G..G......',
    '.....UU..UU.....',
    '.....UU..UU.....'
  ], PALADIN_PAL);

  var RANGER_PAL = { K: '#0a0a0a', N: '#2f6b2f', B: '#7a5230', p: '#a8d060' };
  P.define('ranger', [
    '........N.......',
    '.......NN.......',
    '......NNNN......',
    '.....NNNNNN.....',
    '....NNNNNNNN....',
    '....NKKNNNN.....',
    '.....NNNNNN.....',
    '....NNBBBBNN....',
    '...NBBBBBBBBN...',
    '...NBBppppBBN...',
    '...NBBBBBBBBN...',
    '....NBBBBBBN....',
    '.....BBBBBB.....',
    '.....BBBBBB.....',
    '......BBBB......',
    '......BBBB......',
    '......K..K......',
    '......K..K......',
    '....KKK..KKK....'
  ], RANGER_PAL);

  var NECROMANCER_PAL = { K: '#0a0a0a', N: '#3a1a4a', B: '#5a2060', p: '#c890ff' };
  P.define('necromancer', [
    '........N.......',
    '.......NN.......',
    '......NNNN......',
    '.....NNNNNN.....',
    '....NNNNNNNN....',
    '....NKKNNNN.....',
    '.....NNNNNN.....',
    '....NNBBBBNN....',
    '...NBBBBBBBBN...',
    '...NBBppppBBN...',
    '...NBBBBBBBBN...',
    '....NBBBBBBN....',
    '.....BBBBBB.....',
    '.....BBBBBB.....',
    '......BBBB......',
    '......BBBB......',
    '......K..K......',
    '......K..K......',
    '....KKK..KKK....'
  ], NECROMANCER_PAL);

  var MONK_PAL = { K: '#0a0a0a', N: '#e0942a', B: '#a83a2a', p: '#f5f050' };
  P.define('monk', [
    '........N.......',
    '.......NN.......',
    '......NNNN......',
    '.....NNNNNN.....',
    '....NNNNNNNN....',
    '....NKKNNNN.....',
    '.....NNNNNN.....',
    '....NNBBBBNN....',
    '...NBBBBBBBBN...',
    '...NBBppppBBN...',
    '...NBBBBBBBBN...',
    '....NBBBBBBN....',
    '.....BBBBBB.....',
    '.....BBBBBB.....',
    '......BBBB......',
    '......BBBB......',
    '......K..K......',
    '......K..K......',
    '....KKK..KKK....'
  ], MONK_PAL);

  var DRAGON_PAL = { H: '#d8c8a0', C: '#2f7a45', E: '#f5e050', W: '#6a2020', D: '#1c4a2a', K: '#0a0a0a', U: '#8fc06a', z: '#e4dabe', y: '#72a581', x: '#9a6767', w: '#65846e', v: '#b3d49a' };
  P.define('dragon', [
    '.....H..H.....',
    '....zH..zH....',
    '.....yyCC.....',
    '....yyCCCC....',
    '...yyyCCCCC...',
    '..yCEEyCEEyC..',
    '..yyyyCCCCCC..',
    'W.yyyyCCCCCC.W',
    'W..wwwDDDDD..W',
    '...wDKKKKwD...',
    '....wwDDDD....',
    '.....yyCC.....',
    '....yC..yC....',
    '....vU..vU....'
  ], DRAGON_PAL);

  var DEMON_PAL = { H: '#3a1010', R: '#8a1818', K: '#0a0a0a', Y: '#f0d040', z: '#af6262', y: '#f5df7d' };
  P.define('demon', [
    '.....H..H.....',
    '....HHH.HHH...',
    '....zzRRRR....',
    '....RKzRKR....',
    '....zzRRRR....',
    '...zzzRRRRR...',
    '..zzRRyYzzRR..',
    '.zzRRRyYzzRRR.',
    '..zzzzRRRRRR..',
    '...zzzRRRRR...',
    '....zzRRRR....',
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
    '....yyyFFFF...',
    '....xxOOOO....',
    '...xxxOOOOO...',
    '...OyFxOyFO...',
    '...xxxOOOOO...',
    '....xxOOOO....',
    '...wDvvGGwD...',
    '..wDvvGGGGwD..',
    '..wDvGyFvGwD..',
    '..wDvvGGGGwD..',
    '...wDvvGGwD...',
    '....wDvGwD....',
    '....wDvGwD....',
    '.....DvGD.....'
  ], { O: PAL.O, D: PAL.D, G: PAL.G, Y: PAL.Y, F: '#f08020', z: '#efd488', y: '#f5a967', x: '#e4dfd4', w: '#939398', v: '#c9c9d0' });

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

  var WOLF_PAL = { F: '#4a4058', D: '#2a2438', L: '#c8bfae', K: '#151018', R: '#d02838', T: '#f4f0e8', z: '#847d8d', y: '#df6d78' };
  var WOLF_GRID = [
    '....D......D....',
    '...DDD....DDD...',
    '..zzzzzFFFFFFF..',
    '.zzzzzzFFFFFFFF.',
    '.zFFyRzzFFyRzFF.',
    '.zzzzzzFFFFFFFF.',
    '.zzFFLLLLLLzzFF.',
    '.zzFFLLKKLLzzFF.',
    '.zzFFLTTTTLzzFF.',
    '.zzzzzzFFFFFFFF.',
    '..zzzzzFFFFFFF..',
    '..zzzzzFFFFFFF..',
    '...zzFF..zzFF...',
    '...zF......zF...',
    '...zF......zF...',
    '...KK......KK...'
  ];
  P.define('wolf', WOLF_GRID, WOLF_PAL);

  var HOUND_PAL = { F: '#5a1010', D: '#2a0808', L: '#3a1414', K: '#0a0a0a', R: '#f0d040', T: '#f4f0e8', z: '#8f5c5c', y: '#f5df7d' };
  P.define('hound', WOLF_GRID, HOUND_PAL);

  var SLIME_PAL = { H: '#a8e0a0', M: '#4a9850', K: '#1a3010', S: '#2f6a38', z: '#c4eabe', y: '#84b988', x: '#63725c', w: '#729a78' };
  P.define('slime', [
    '......zH......',
    '....zzHHHH....',
    '..yyyyMMMMMM..',
    '.yyyyyMMMMMMM.',
    'yyyyyyMMMMMMMM',
    'yyMMxKyMxKyyMM',
    'yyyyyyMMMMMMMM',
    'yyyyyyMMMMMMMM',
    'yyyyyyMMMMMMMM',
    '.wwwwwSSSSSSS.',
    '..wwwwSSSSSS..',
    '...wwwSSSSS...',
    '....wwSSSS....'
  ], SLIME_PAL);

  var SPIDER_PAL = { B: '#3a2050', R: '#e8c050', K: '#0a0a0a', z: '#796788', y: '#efd488' };
  P.define('spider', [
    '.................',
    '.B.............B.',
    '..zB...zBB...zB..',
    '....B.zzBBB.B....',
    'zBB..zzzBBBB..zBB',
    '...zzBBRBRzzBB...',
    '....zzzzBBBBB....',
    '..zzzzzBBBBBBBB..',
    'zB..zzzzBBBBB..zB',
    '...B..BKBKB..B...',
    '..B....zBB....B..',
    '.B.............B.',
    '.................'
  ], SPIDER_PAL);

  var WINDSPRITE_PAL = { W: '#eaf6ff', C: '#9fd8f0', E: '#cdeeff', K: '#2a5878', z: '#bee4f5', y: '#6e8da3' };
  P.define('windSprite', [
    '......WW......',
    '.....WWWW.....',
    'zCC..WWWW..zCC',
    'zzCCEEEEEEzzCC',
    '.zzCCEyKEzzCC.',
    '..zCCEEEEzCC..',
    '....EEEEEE....',
    '....EEEEEE....',
    '....WWWWWW....',
    '....WWWWWW....',
    '.....WWWW.....',
    '.....zzCC.....',
    '......zC......',
    '......zC......'
  ], WINDSPRITE_PAL);

  var BANDIT_PAL = { H: '#3a4a3a', C: '#2c3a2c', K: '#0a0a0a', F: '#8a9a7a', G: '#c8ccd4', U: '#6a4a2a', z: '#798479', y: '#afbaa5', x: '#707970', w: '#9a846e', v: '#dadce2' };
  P.define('bandit', [
    '.......H.......',
    '......zHH......',
    '....zzzHHHH....',
    '...zzzzHHHHH...',
    '..zzzzHHHHHHH..',
    '..zHKKyFFKKzH..',
    '..zzzzHHHHHHH..',
    '..xxxxCCCCCCC..',
    '.xxxxCCCCCCUxC.',
    '.xxxxCCCCCCCGC.',
    '.xxxxxCCCCCCCG.',
    '..xxxxCCCCCCC..',
    '...xxCC.xxCC...',
    '...xC.....xC...',
    '...xC.....xC...',
    '...KK.....KK...'
  ], BANDIT_PAL);

  var KNIGHT_PAL = { P: '#d02838', M: '#c8d0dc', K: '#1a2028', A: '#8894a8', Y: '#e8c050', z: '#df6d78', y: '#dadfe7', x: '#aeb6c4', w: '#efd488' };
  P.define('knight', [
    '.......P.......',
    '......zPP......',
    '...yyyyMMMMM...',
    '..yyyyMMMMMMM..',
    '.yyyyyMMMMMMMM.',
    '.yMKKKKKKKKKyM.',
    '.yyyyyMMMMMMMM.',
    '..yyyyMMMMMMM..',
    '.xxxxxAAAAAAAA.',
    '.xAAwYxAAwYxAA.',
    '.xxxxxAAAAAAAA.',
    '.xxxxxAAAAAAAA.',
    '..xxxxAAAAAAA..',
    '...xA.....xA...',
    '...xA.....xA...',
    '...KK.....KK...'
  ], KNIGHT_PAL);

  var HAWK_PAL = { F: '#8a6a3a', K: '#1a1006', Y: '#e8c050', z: '#af9a79', y: '#efd488' };
  var HAWK_GRID = [
    '.......F.......',
    '......zFF......',
    '.....KzFFK.....',
    'F...zzzFFFF...F',
    'zzzzzzFFFFFFFFF',
    '.zzzzzFFFFFFFF.',
    '...zzzzFFFFF...',
    '...zzFFYzzFF...',
    '...zzzzFFFFF...',
    '....zzzFFFF....',
    '....zF...zF....',
    '....KK...KK....'
  ];
  P.define('hawk', HAWK_GRID, HAWK_PAL);

  var HARPY_PAL = { F: '#7a4a8a', K: '#1a0a1e', Y: '#e8c050', z: '#a584af', y: '#efd488' };
  P.define('harpy', HAWK_GRID, HARPY_PAL);

  var SENTINEL_PAL = { M: '#7a8290', D: '#3a4048', R: '#e83838', Y: '#f0d040', K: '#1a1c20', z: '#a5aab4', y: '#ef7878', x: '#797d83', w: '#f5df7d' };
  P.define('sentinel', [
    '...zMM.zMM...',
    '..zzzzMMMMM..',
    '..MyRRMyRRM..',
    '..zzzzMMMMM..',
    '.xxxxDDDDDDD.',
    'zzMMxxDDDzzMM',
    'zzzzzMMMMMMMM',
    '.zMwYzMMwYzM.',
    '.zzzzMMMMMMM.',
    '.zzzzMMMMMMM.',
    '..zzzzMMMMM..',
    '..zM.zMM.zM..',
    '..xD.xDD.xD..',
    '..zM.zMM.zM..',
    '.zzMM...zzMM.',
    '.KKKK...KKKK.'
  ], SENTINEL_PAL);

  var TROLL_PAL = { S: '#4a6a3a', K: '#1a2a10', W: '#f0ecd8', z: '#849a79' };
  var TROLL_GRID = [
    '....zzzSSSS....',
    '...zzzzSSSSS...',
    '..zzzzSSSSSSS..',
    '..KKzzzSSSSKK..',
    '..zzzzSSSSSSS..',
    '..zSWWWWWWWzS..',
    '.zzzzzSSSSSSSS.',
    'zzzzzzSSSSSSSSS',
    'zzzzzzSSSSSSSSS',
    'zzzzzzSSSSSSSSS',
    '.zzzzzSSSSSSSS.',
    '..zzzzSSSSSSS..',
    '...zzSS.zzSS...',
    '...zS.....zS...',
    '...zS.....zS...',
    '...KK.....KK...'
  ];
  P.define('troll', TROLL_GRID, TROLL_PAL);

  var TITAN_PAL = { S: '#6a6a8a', K: '#1a1a2a', W: '#f0f0ff', z: '#9a9aaf' };
  P.define('titan', TROLL_GRID, TITAN_PAL);

  var GOLEM_PAL = { R: '#8a7a5a', K: '#e8c050', D: '#4a3e2a', Y: '#e85838', z: '#afa58f', y: '#efd488', x: '#847c6e', w: '#ef8d78' };
  P.define('golem', [
    '...zzzRRRR...',
    '..zzzzRRRRR..',
    '..yKzzRRRyK..',
    '..zzzzRRRRR..',
    '.zzzzRRRRRRR.',
    'zzzzzRRRRRRRR',
    'zRxDzzRRRxDzR',
    'zzzzzRRRRRRRR',
    'zzzzzRRRRRRRR',
    '.zRYzzRRRYzR.',
    '.zzzzRRRRRRR.',
    '..zzzzRRRRR..',
    '..zR.....zR..',
    '..zR.....zR..',
    '..xD.....xD..'
  ], GOLEM_PAL);

  var FIEND_PAL = { F: '#7a1818', H: '#3a1010', R: '#f0d040', L: '#3a0a0a', T: '#f4f0e8', K: '#0a0a0a', z: '#a56262', y: '#f5df7d' };
  P.define('fiend', [
    '..HH.......HH..',
    '....zzzFFFF....',
    '...zzzzFFFFF...',
    '..zFRzzFFFRzF..',
    '.zzzzzFFFFFFFF.',
    '.zzFFLLLLLzzFF.',
    '.zzFFLTLTLzzFF.',
    '.zzzzzFFFFFFFF.',
    '.zzzzzFFFFFFFF.',
    '..zzzzFFFFFFF..',
    '..zzzzFFFFFFF..',
    '...zzFF.zzFF...',
    '...zF.....zF...',
    '...zF.....zF...',
    '...KK.....KK...'
  ], FIEND_PAL);

  var HYDRA_PAL = { C: '#2f7a45', R: '#f5e050', D: '#1c4a2a', K: '#0a0a0a', z: '#72a581', y: '#65846e' };
  P.define('hydra', [
    '.......zCC.......',
    '......CRCRC......',
    'zCC...zzCCC...zCC',
    'CRzC..zzCCC..zCRC',
    '.zCC..zzCCC..zCC.',
    '..C.C.zzCCC.C.C..',
    '...zCC.....zCC...',
    '....yyyyDDDDD....',
    '...yyyyDDDDDDD...',
    '...yyyyDDDDDDD...',
    '....yyyyDDDDD....',
    '.....yyyDDDD.....',
    '......KK.KK......',
    '.................'
  ], HYDRA_PAL);

  // ---- Floor 45-100 creature silhouettes: the hidden upper tower (each unique, no palette-swap reuse) ----

  P.define('crystalWisp', [
    '.....C.C.....',
    '....zzCCC....',
    '...C.zCC.C...',
    '..C...C...C..',
    '.C....K....C.',
    '..C..zCC..C..',
    '...zCLLLzC...',
    '..C..zCC..C..',
    '.C....K....C.',
    '..C...C...C..',
    '...C.zCC.C...',
    '....zzCCC....'
  ], { C: '#8ad0f0', L: '#e8f8ff', K: '#153148', z: '#afdff5', y: '#607383' });

  P.define('prismLynx', [
    '....D......D....',
    '...zDD....zDD...',
    '..yyyyyCCCCCCC..',
    '.yyyyyyCCCCCCCC.',
    '.yCCLLyyCCLLyCC.',
    '.yyCCKyyCCKyCC..',
    '.yyCCCLLLLyyCCC.',
    '.yyCCCLLLLyyCCC.',
    '.yyyyyyCCCCCCCC.',
    '..yyyyyCCCCCCC..',
    '..yyyyyCCCCCCC..',
    '...yyCC..yyCC...',
    '...yC......yC...',
    '...yC......yC...',
    '...zD......zD...'
  ], { C: '#6ab8e8', D: '#3a6a90', L: '#e8f8ff', K: '#0a1a28', z: '#799ab4', y: '#9acfef' });

  P.define('chimeWraith', [
    '.....C.C.C.....',
    '....zzzCCCC....',
    '...C.......C...',
    '..zC.......zC..',
    '...zzzzCCCCC...',
    '...CLKC.CKLC...',
    '...zzzzCCCCC...',
    '..zzzzCCCCCCC..',
    '..zC.zzCCC.zC..',
    '..zC.......zC..',
    '..zC.......zC..',
    '..zC.......zC..',
    '..yD.......yD..'
  ], { C: '#b090e8', L: '#e8d8ff', K: '#241a38', D: '#4a3868', z: '#c9b4ef', y: '#847898' });

  P.define('geodeGolem', [
    '...zzzRRRR...',
    '..zzzzRRRRR..',
    '.zRRyyLLLzRR.',
    '.zRyLKLKyLzR.',
    '.zRRyyLLLzRR.',
    'zzzzzRRRRRRRR',
    'zRRxDRxDzzRRR',
    'zzzzzRRRRRRRR',
    'zRRLzzRRRLzR.',
    '.zzzzRRRRRRR.',
    '..zzzzRRRRR..',
    '..zR.....zR..',
    '..zR.....zR..',
    '..xD.....xD..'
  ], { R: '#7a6ab0', L: '#c8b8ff', K: '#0a0a14', D: '#3a2f5a', z: '#a59ac9', y: '#dacfff', x: '#79728f' });

  P.define('choirWarden', [
    '.....G.G.G.....',
    '....GGGGGGG....',
    '...zzzzCCCCC...',
    '..zzzzCCCCCCC..',
    '.zCCyLKyLKyLzC.',
    '.zzzzzCCCCCCCC.',
    '.zzCCGGGGGzzCC.',
    'zzCCCGGGGGzzCCC',
    'zzzzzzCCCCCCCCC',
    '.zzzzzCCCCCCCC.',
    '.zzzzzCCCCCCCC.',
    '..zzCC...zzCC..',
    '..zC.......zC..',
    '..zC.......zC..',
    '.xDD.......xDD.'
  ], { C: '#9ad8f0', G: '#e8f8ff', L: '#c8b0ff', K: '#12283a', D: '#2a4a5e', z: '#bae4f5', y: '#dac9ff', x: '#6e8492' });

  P.define('drownedRevenant', [
    '.....V.V.....',
    '....zzVVV....',
    '...zzzVVVV...',
    '...VXzVVXV...',
    '...zzzVVVV...',
    '..zzzzVVVVV..',
    '.zzzzVVVVVVV.',
    '.zV.zzVVV.zV.',
    '.zV.......zV.',
    '.zV.......zV.',
    '.zV.......zV.',
    '..V.......V..',
    '..V.......V..'
  ], { V: '#2a5040', X: '#7ad8b0', K: '#0a1a14', z: '#6e887d', y: '#a5e4c9' });

  P.define('abyssalEel', [
    '............zE..',
    '...........zE...',
    '..........zE....',
    '.........zE.....',
    '........zE......',
    '.......zE.......',
    '......zE........',
    '.....zE.........',
    '....zE..........',
    '...zE...........',
    '..KzEK..........'
  ], { E: '#2f6a5a', K: '#0a1810', z: '#729a8f' });

  P.define('tideGolem', [
    '...zzzCCCC...',
    '..zzzzCCCCC..',
    '.zCCLLLLLzC..',
    '.zCLKzCCKLC..',
    '.zCCLLLLLzC..',
    'zzzzzCCCCCCCC',
    'zCCyyyDDDDzCC',
    'zzzzzCCCCCCCC',
    'zzzzzCCCCCCCC',
    '.zzzzCCCCCCC.',
    '..zzzzCCCCC..',
    '..zC.....zC..',
    '..zC.....zC..',
    '..yD.....yD..'
  ], { C: '#2f6a80', L: '#a0e8f0', K: '#0a1c24', D: '#173a48', z: '#729aa9', y: '#617983' });

  P.define('sirenWraith', [
    '.....V...V.....',
    '....zVV.zVV....',
    '...zzzzVVVVV...',
    '...VXzzVVVXV...',
    '..zzzzVVVVVVV..',
    '.zzzzzVVVVVVVV.',
    '.zV.zzzVVVV.zV.',
    '..V.........V..',
    '..zV.......zV..',
    '...zV.....zV...',
    '....zV...zV....'
  ], { V: '#3a6a78', X: '#e8d040', K: '#0a1c20', z: '#799aa3', y: '#efdf7d' });

  P.define('leviathanHerald', [
    '....C.....C....',
    '...zCC...zCC...',
    '..zzzzCCCCCCC..',
    '.zzzzzCCCCCCCC.',
    '.zCCLKzCCKLzCC.',
    'zzzzzzCCCCCCCCC',
    'zCCxxxxDDDDDzCC',
    'zzzzzzCCCCCCCCC',
    'zzzzzzCCCCCCCCC',
    '.zzzzzCCCCCCCC.',
    '.zzzzzCCCCCCCC.',
    '..zzCC...zzCC..',
    '..zC.......zC..',
    '..zC.......zC..',
    '.xDD.......xDD.'
  ], { C: '#245868', L: '#7ad8e0', K: '#081820', D: '#123040', z: '#6a8d98', y: '#a5e4ea', x: '#5e727d' });

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
  ], { F: '#c8d4e0', K: '#1c2430', Y: '#e8c050', z: '#efd488' });

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
  ], { Y: '#f0e050', L: '#fff8d0', K: '#3a3410', z: '#79755c' });

  P.define('stormLancer', [
    '.......Y.......',
    '......YYY......',
    '...zzzzMMMMM...',
    '..zzzzMMMMMMM..',
    '.zzzzzMMMMMMMM.',
    '.zMKKYKYKKKzM..',
    '.zzzzzMMMMMMMM.',
    '..zzzzMMMMMMM..',
    '.yyyyyAAAAAAAA.',
    '.yAAYYyAAYYyAA.',
    '.yyyyyAAAAAAAA.',
    '..yyyyAAAAAAA..',
    '...yA.....yA...',
    '...yA.....yA...',
    '...KK.....KK...'
  ], { M: '#8a9ab8', A: '#5a6a88', Y: '#f0e050', K: '#181e28', z: '#afbacf', y: '#8f9aae' });

  P.define('cloudSerpent', [
    '............zW..',
    '...........zW...',
    '..........zW....',
    '.........zW.....',
    '........zW......',
    '.......zW.......',
    '......zW........',
    '.....zW.........',
    '....zW..........',
    '...zW...........',
    '..YzWY..........'
  ], { W: '#8aa8d8', Y: '#e8e0f8', z: '#afc4e4' });

  P.define('tempestMarshal', [
    '.......Y.......',
    '......YYY......',
    '...zzzzMMMMM...',
    '..zzzzMMMMMMM..',
    '.zzzzzMMMMMMMM.',
    '.zMKKYYYKKKzM..',
    '.zzzzzMMMMMMMM.',
    '..zzzzMMMMMMM..',
    'yyyyyyAAAAAAAAA',
    'yyAAYYYYYYYyyAA',
    'yyyyyyAAAAAAAAA',
    '.yyyyyAAAAAAAA.',
    '..yA.....yA....',
    '..yA.....yA....',
    '.KKK.....KKK...'
  ], { M: '#6a7ab0', A: '#4a5888', Y: '#f0e050', K: '#141828', z: '#9aa5c9', y: '#848dae' });

  P.define('sandWraith', [
    '.....U.U.....',
    '....zzUUU....',
    '...zzzUUUU...',
    '...UXzUUXU...',
    '..zzzzUUUUU..',
    '.zzzzUUUUUUU.',
    '.zU.zzUUU.zU.',
    '..U.......U..',
    '..zU.....zU..',
    '...zU...zU...',
    '....zU.zU....'
  ], { U: '#c8a860', X: '#5a1818', K: '#3a2c14', z: '#dac493', y: '#8f6262' });

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
  ], { O: '#e8e0c8', K: '#5a4a2a', z: '#8f846e' });

  P.define('scarabSwarm', [
    '..D.......D..',
    '.zDD.....zDD.',
    'zzDDD...zzDDD',
    '.zzDDD.zzDDD.',
    '..zzzzDDDDD..',
    '.D.zzzDDDD.D.',
    'zD..zDRzD..zD',
    '.D.zzzDDDD.D.',
    '..zzzzDDDDD..',
    '.zzDDD.zzDDD.',
    'zzDDD...zzDDD',
    '.zDD.....zDD.'
  ], { D: '#4a3a1a', R: '#e88030', K: '#1c1608', z: '#847963', y: '#efa972' });

  P.define('dustDjinn', [
    '......G.G......',
    '.....zzGGG.....',
    '....GLKGKLG....',
    '.....zzGGG.....',
    '..zG.zzGGG.zG..',
    '.G.zzzzGGGGG.G.',
    '..zzzzGGGGGGG..',
    '...zzzzGGGGG...',
    '....zG.G.zG....',
    '....G...G......',
    '....G...G......'
  ], { G: '#e0c888', L: '#fff4d8', K: '#4a3c18', z: '#eadaae', y: '#847a62' });

  P.define('pharaohAsh', [
    '.....Y.Y.....',
    '....zzYYY....',
    '...yyyUUUU...',
    '..yyyyUUUUU..',
    '.yyyyUUUUUUU.',
    '.yUxKUKUxKU..',
    '.yyyyUUUUUUU.',
    '..yUUzYYyUU..',
    '..yyyyUUUUU..',
    '...yU.....yU.',
    '...yU.....yU.',
    '...yU.....yU.',
    '..xKK.....xKK'
  ], { U: '#c89848', Y: '#f0d060', K: '#3a2810', z: '#f5df93', y: '#dab983', x: '#796d5c' });

  P.define('magmaHound', [
    '....R......R....',
    '...zRR....zRR...',
    '..zzzzzRRRRRRR..',
    '.zzzzzzRRRRRRRR.',
    '.zRRyOzzRRyOzRR.',
    '.zzzzzzRRRRRRRR.',
    '.zzRRxxYYYYzzRR.',
    '.zzRRYKKYKYzzRR.',
    '.zzRRxxYYYYzzRR.',
    '.zzzzzzRRRRRRRR.',
    '..zzzzzRRRRRRR..',
    '...zzRR..zzRR...',
    '...zR......zR...',
    '...KK......KK...'
  ], { R: '#6a1c10', O: '#e85820', Y: '#f0d040', K: '#1a0a06', z: '#9a655c', y: '#ef8d67', x: '#f5df7d' });

  P.define('cinderGolem', [
    '...KKKKKKK...',
    '..KKKKKKKKK..',
    '.KKKzzOOOKK..',
    '.KKOYKOKYOKK.',
    '.KKKzzOOOKK..',
    'KKKKKKKKKKKKK',
    'KKKzOKzOKOKKK',
    'KKKKKKKKKKKKK',
    'KKKOKKKKKOKK.',
    '.KKKKKKKKKKK.',
    '..KKKKKKKKK..',
    '..KK.....KK..',
    '..zO.....zO..',
    '..zO.....zO..'
  ], { K: '#2a1a14', O: '#e85820', Y: '#f0d040', z: '#ef8d67', y: '#f5df7d' });

  P.define('lavaSerpent', [
    '............zR..',
    '...........zR...',
    '..........zR....',
    '.........zR.....',
    '........zR......',
    '.......zR.......',
    '......zR........',
    '.....zR.........',
    '....zR..........',
    '...zR...........',
    '..KyOK..........'
  ], { O: '#e85820', R: '#8a2410', K: '#1a0a06', z: '#af6a5c', y: '#ef8d67' });

  P.define('pyroclastBat', [
    '..R....R....R..',
    '.zRR..zRR..zRR.',
    'zzzzzzRRRRRRRRR',
    '.zzzzzRRRRRRRR.',
    '...zzzzRRRRR...',
    '...zRRyXzzRR...',
    '...zzzzRRRRR...',
    '....zRR.zRR....',
    '....KK...KK....'
  ], { R: '#7a2414', X: '#f0d040', K: '#1a0806', z: '#a56a5f', y: '#f5df7d' });

  P.define('coreWarden', [
    '...zzzOOOO...',
    '..zzzzOOOOO..',
    '.zOOKKKKKzO..',
    '.zOKYzOOYKzO.',
    '.zOOKKKKKzO..',
    'zzzzzOOOOOOOO',
    'zOOxxxRRRRzOO',
    'zzzzzOOOOOOOO',
    'zOOYzzOOOYzO.',
    '.zzzzOOOOOOO.',
    '..zzzzOOOOO..',
    '..zO.....zO..',
    '..xR.....xR..',
    '..xR.....xR..'
  ], { O: '#8a3018', R: '#e85820', Y: '#f0d040', K: '#1c0c08', z: '#af7262', y: '#f5df7d', x: '#ef8d67' });

  P.define('gearSentinel', [
    '...MYM...MYM...',
    '..zzMM...zzMM..',
    '..zzzzMMMMMMM..',
    '.zMMxxxDDDDzMM.',
    'zzMMxxxDDDDzzMM',
    'zzMMMMRMRzzMMMM',
    '.zzMMxxDDDzzMM.',
    '..zzzzMMMMMMM..',
    '..zM.zzMMM.zM..',
    '..zM.......zM..',
    '..zM.......zM..',
    '.xDD.......xDD.'
  ], { M: '#8a8a94', D: '#454550', R: '#e85838', K: '#1c1c22', Y: '#f0d040', z: '#afafb6', y: '#f5df7d', x: '#818188', w: '#ef8d78' });

  P.define('sparkHound', [
    '....D......D....',
    '...zDD....zDD...',
    '..zzzzzDDDDDDD..',
    '.zzzzzzDDDDDDDD.',
    '.zDDYYzzDDYYzDD.',
    '.zzzzzzDDDDDDDD.',
    '.zzDDYYYYYYzzDD.',
    '.zzDDYKKYKYzzDD.',
    '.zzDDYYYYYYzzDD.',
    '.zzzzzzDDDDDDDD.',
    '..zzzzzDDDDDDD..',
    '...zzDD..zzDD...',
    '...YY......YY...',
    '...KK......KK...'
  ], { D: '#3a4058', Y: '#f0e050', K: '#0e1018', z: '#797d8d' });

  P.define('pistonGolem', [
    '...zzzRRRR...',
    '..zzzzRRRRR..',
    '.zRRKKKKKzR..',
    '.zRKYRKRYKzR.',
    '.zRRKKKKKzR..',
    'zzzzzRRRRRRRR',
    'zRRxMzRRxMzRR',
    'zRRxMzRRxMzRR',
    'zzzzzRRRRRRRR',
    '.zzzzRRRRRRR.',
    '..zzzzRRRRR..',
    '..zR.....zR..',
    '..xM.....xM..',
    '..xM.....xM..'
  ], { R: '#5a6270', M: '#8a94a8', Y: '#e85838', K: '#161a20', z: '#8f949e', y: '#ef8d78', x: '#afb6c4' });

  P.define('rotorWraith', [
    '......D......',
    '.....zDD.....',
    'W....zDD....W',
    'yW..zzDDD..yW',
    'yyWWzzDDDyyWW',
    '.yWWzzDDDyWW.',
    '...zDDKzDD...',
    '...zzzDDDD...',
    '....zD.zD....',
    '....KK.KK....'
  ], { W: '#c8d0dc', D: '#4a5468', K: '#161a20', z: '#848b98', y: '#dadfe7' });

  P.define('grandAutomaton', [
    '..MYM...MYM..',
    '.zzMMM.zzMMM.',
    '.zzzzMMMMMMM.',
    'zMMxxxDDDDzMM',
    'zMMxxxDDDDzMM',
    'zzMMRMRMRzzMM',
    '.zMMxxDDDzMM.',
    'zzzzzMMMMMMMM',
    'zzMM.zMM.zzMM',
    'zzMM.....zzMM',
    'zzMM.....zzMM',
    '.xDD.....xDD.',
    '.xDD.....xDD.'
  ], { M: '#9a9aa8', D: '#4a4a58', R: '#e85838', K: '#1c1c26', Y: '#f0d040', z: '#babac4', y: '#f5df7d', x: '#84848d', w: '#ef8d78' });

  P.define('fungalStalker', [
    '....N......N....',
    '...zNN....zNN...',
    '..zzzzzNNNNNNN..',
    '.zzzzzzNNNNNNNN.',
    '.zNNyMzzNNyMzNN.',
    '.zzzzzzNNNNNNNN.',
    '.zzNNxxGGGGzzNN.',
    '.zzNNGKKGKGzzNN.',
    '.zzNNxxGGGGzzNN.',
    '.zzzzzzNNNNNNNN.',
    '..zzzzzNNNNNNN..',
    '...zzNN..zzNN...',
    '...zN......zN...',
    '...KK......KK...'
  ], { N: '#4a5a2a', G: '#8ab040', M: '#c8e080', K: '#141c0a', z: '#848f6e', y: '#daeaa9', x: '#afc97d' });

  P.define('thornWraith', [
    '.....N.N.....',
    '....zzNNN....',
    '...zzzNNNN...',
    '...NMzNNMN...',
    '..zzzzNNNNN..',
    '.zzzzNNNNNNN.',
    '.zN.zzNNN.zN.',
    '..N.G.G.G.N..',
    '..NG.....GN..',
    '...N.....N...',
    '...N.....N...',
    '..GN.....NG..'
  ], { N: '#3a4a22', M: '#e0a838', G: '#6a8a34', K: '#0e1408', z: '#798469', y: '#eac478', x: '#9aaf75' });

  P.define('sporeBat', [
    '..N....N....N..',
    '.zNN..zNN..zNN.',
    'zzzzzzNNNNNNNNN',
    '.zzzzzNNNNNNNN.',
    '...zzzzNNNNN...',
    '...zNNyGzzNN...',
    '...zzzzNNNNN...',
    '....zNN.zNN....',
    '....yG...yG....'
  ], { N: '#3a4a22', G: '#8ab040', K: '#141c0a', z: '#798469', y: '#afc97d' });

  P.define('rootboundGolem', [
    '...zzzNNNN...',
    '..zzzzNNNNN..',
    '.zNNyyGGGzN..',
    '.zNGMNGNMGzN.',
    '.zNNyyGGGzN..',
    'zzzzzNNNNNNNN',
    'zNNyGNyGNGzNN',
    'zzzzzNNNNNNNN',
    'zNNGzzNNNGzN.',
    '.zzzzNNNNNNN.',
    '..zzzzNNNNN..',
    '..zN.....zN..',
    '..yG.....yG..',
    '..yG.....yG..'
  ], { N: '#3a4a22', G: '#6a8a34', M: '#c8e080', K: '#101a08', z: '#798469', y: '#9aaf75', x: '#daeaa9' });

  P.define('blightHeart', [
    '.....M.M.....',
    '....zzMMM....',
    '...yyyNNNN...',
    '..yyyyNNNNN..',
    '.yyNNxRRyyNN.',
    '.yNNxRKxRyNN.',
    '.yyNNxRRyyNN.',
    '..yyyyNNNNN..',
    '..GyyyNNNNG..',
    '...G.....G...',
    '...G.....G...',
    '..wG.....wG..'
  ], { N: '#3a2848', R: '#9a2848', M: '#c05888', G: '#5a3a68', K: '#160c1c', z: '#d48dae', y: '#796d83', x: '#ba6d83', w: '#8f7998' });

  P.define('frostSpawn', [
    '............zB..',
    '...........zB...',
    '..........zB....',
    '.........zB.....',
    '........zB......',
    '.......zB.......',
    '......zB........',
    '.....zB.........',
    '....zB..........',
    '...zB...........',
    '..WzBW..........'
  ], { B: '#3a6a90', W: '#e8f8ff', K: '#0e2030', z: '#799ab4' });

  P.define('glacialWraith', [
    '.....W.W.....',
    '....zzWWW....',
    '...zzzWWWW...',
    '...WXzWWXW...',
    '..zzzzWWWWW..',
    '.zzzzWWWWWWW.',
    '.zW.zzWWW.zW.',
    '..W.......W..',
    '..zW.....zW..',
    '...zW...zW...',
    '....W.W.W....'
  ], { W: '#7ab0d8', X: '#e8f8ff', K: '#0e2c40', z: '#a5c9e4' });

  P.define('rimeGolem', [
    '...zzzWWWW...',
    '..zzzzWWWWW..',
    '.zWWyyBBBzW..',
    '.zWBKWBWKBzW.',
    '.zWWyyBBBzW..',
    'zzzzzWWWWWWWW',
    'zWWyBWyBWBzWW',
    'zzzzzWWWWWWWW',
    'zWWBzzWWWBzW.',
    '.zzzzWWWWWWW.',
    '..zzzzWWWWW..',
    '..zW.....zW..',
    '..yB.....yB..',
    '..yB.....yB..'
  ], { W: '#a8d8f0', B: '#3a6a90', K: '#0e2030', z: '#c4e4f5', y: '#799ab4' });

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
    '.....zB.zB.....'
  ], { W: '#c8e8f8', B: '#3a6a90', K: '#0e2030', z: '#799ab4' });

  P.define('frostSovereign', [
    '....W..W..W....',
    '...zzzzWWWWW...',
    '..zzzzWWWWWWW..',
    '.zWWyyyBBBBzWW.',
    '.zWBKzWBzWKBzW.',
    '.zWWyyyBBBBzWW.',
    'zzzzzzWWWWWWWWW',
    'zWWyyyyBBBBBzWW',
    'zzzzzzWWWWWWWWW',
    '.zzzzzWWWWWWWW.',
    '.zzzzzWWWWWWWW.',
    '..zzWW...zzWW..',
    '..zW.......zW..',
    '..zW.......zW..',
    '.yBB.......yBB.'
  ], { W: '#a8d8f0', B: '#2a5a80', K: '#0a1c2c', z: '#c4e4f5', y: '#6e8fa9' });

  P.define('starWisp', [
    '......P.......',
    '.....zPP......',
    '....PLPLP.....',
    '...P..P..P....',
    '..P...P...P...',
    '.P....K....P..',
    '..P..zPP..P...',
    '...zPLLLzP....',
    '..P..zPP..P...',
    '.P....K....P..',
    '..P...P...P...',
    '...P..P..P....'
  ], { P: '#9a70e8', L: '#e8d8ff', K: '#1c1030', z: '#ba9eef' });

  P.define('voidSerpent', [
    '............zP..',
    '...........zP...',
    '..........zP....',
    '.........zP.....',
    '........zP......',
    '.......zP.......',
    '......zP........',
    '.....zP.........',
    '....zP..........',
    '...zP...........',
    '..KzPK..........'
  ], { P: '#5a2890', K: '#150a24', z: '#8f6db4' });

  P.define('nebulaGolem', [
    '...zzzPPPP...',
    '..zzzzPPPPP..',
    '.zPPyyLLLzP..',
    '.zPLKPLPKLzP.',
    '.zPPyyLLLzP..',
    'zzzzzPPPPPPPP',
    'zPPKKPKKPKzPP',
    'zzzzzPPPPPPPP',
    'zPPLzzPPPLzP.',
    '.zzzzPPPPPPP.',
    '..zzzzPPPPP..',
    '..zP.....zP..',
    '..KK.....KK..',
    '..KK.....KK..'
  ], { P: '#5a2890', L: '#c890ff', K: '#150a24', z: '#8f6db4', y: '#dab4ff' });

  P.define('astralWraith', [
    '.....P.P.....',
    '....zzPPP....',
    '...zzzPPPP...',
    '...PLzPPLP...',
    '..zzzzPPPPP..',
    '.zzzzPPPPPPP.',
    '.zP.zzPPP.zP.',
    '..P.......P..',
    '..zP.....zP..',
    '...zP...zP...',
    '....P.P.P....'
  ], { P: '#7a4ac0', L: '#e8d8ff', K: '#180c2c', z: '#a584d4' });

  P.define('riftWarden', [
    '....P..P..P....',
    '...zzzzPPPPP...',
    '..zzzzPPPPPPP..',
    '.zPPyyyLLLLzPP.',
    '.zPLKzPLzPKLzP.',
    '.zPPyyyLLLLzPP.',
    'zzzzzzPPPPPPPPP',
    'zPPyyyyLLLLLzPP',
    'zzzzzzPPPPPPPPP',
    '.zzzzzPPPPPPPP.',
    '.zzzzzPPPPPPPP.',
    '..zzPP...zzPP..',
    '..zP.......zP..',
    '..zP.......zP..',
    '.KKK.......KKK.'
  ], { P: '#5a2890', L: '#c890ff', K: '#150a24', z: '#8f6db4', y: '#dab4ff' });

  P.define('chimericHound', [
    '....R......B....',
    '...zRR....yBB...',
    '..zzzRRRRRyyBB..',
    '.zzzzRRRRRRyyBB.',
    '.zRRxOzzRRyBxOB.',
    '.zzzzRRRRRRyyBB.',
    '.zzRRYYYYYYyyBB.',
    '.zzRRYKKYKYyyBB.',
    '.zzRRYYYYYYyyBB.',
    '.zzzzRRRRRRyyBB.',
    '..zzzRRRRRyyBB..',
    '...zzRR..yyBB...',
    '...zR......yB...',
    '...KK......KK...'
  ], { R: '#8a2020', B: '#2a3888', O: '#e85820', Y: '#f0e050', K: '#160808', z: '#af6767', y: '#6e78ae', x: '#ef8d67' });

  P.define('chaosGolem', [
    '...zzzMMMM...',
    '..zzzzMMMMM..',
    '.zMMyyRRRzM..',
    '.zMRYMRMYRzM.',
    '.zMMyyRRRzM..',
    'zzzzzMMMMMMMM',
    'zMMxBMyRMBzMM',
    'zzzzzMMMMMMMM',
    'zMMRzzMMMRzM.',
    '.zzzzMMMMMMM.',
    '..zzzzMMMMM..',
    '..zM.....zM..',
    '..xB.....yR..',
    '..xB.....yR..'
  ], { M: '#4a4a58', R: '#c8383a', B: '#3858c8', Y: '#f0e050', K: '#14141c', z: '#84848d', y: '#da7879', x: '#788dda' });

  P.define('discordWraith', [
    '.....P.R.....',
    '....PRPRP....',
    '...zzzPPPP...',
    '...RXzPPXR...',
    '..zzzzPPPPP..',
    '.PRzzzPPPPRP.',
    '.zP.zzPPP.zP.',
    '..P.......P..',
    '..RP.....PR..',
    '...zP...zP...',
    '....R.P.R....'
  ], { P: '#5a2870', R: '#c8383a', X: '#e8c060', K: '#180a20', z: '#8f6d9e', y: '#da7879', x: '#efd493' });

  P.define('fluxSerpent', [
    '............zB..',
    '...........zB...',
    '..........zB....',
    '.........zB.....',
    '........zB......',
    '.......zB.......',
    '......zB........',
    '.....zB.........',
    '....zB..........',
    '...zB...........',
    '..RzBR..........'
  ], { R: '#c8383a', B: '#3858c8', K: '#12142c', z: '#788dda', y: '#da7879' });

  P.define('forgeMaster', [
    '....Y..Y..Y....',
    '...zzzzMMMMM...',
    '..zzzzMMMMMMM..',
    '.zMMyyyRRRRzMM.',
    '.zMRYzMRzMYRzM.',
    '.zMMyyyRRRRzMM.',
    'zzzzzzMMMMMMMMM',
    'zMMxByyRRRxBzMM',
    'zzzzzzMMMMMMMMM',
    '.zzzzzMMMMMMMM.',
    '.zzzzzMMMMMMMM.',
    '..zzMM...zzMM..',
    '..zM.......zM..',
    '..zM.......zM..',
    '.yRR.......yRR.'
  ], { M: '#5a5a68', R: '#c8383a', B: '#3858c8', Y: '#f0e050', K: '#14141c', z: '#8f8f98', y: '#da7879', x: '#788dda' });

  P.define('twilightSeraph', [
    '......Y.Y......',
    '.....YYYYY.....',
    'W....YLKLY....W',
    'zW...YYYYY...zW',
    'zWW..YYYYY..zWW',
    'zzWWWYYYYYzzWWW',
    '.zzWWYYYYYzzWW.',
    '...zWYYYYYzW...',
    '.....YY.YY.....',
    '.....YY.YY.....',
    '....yKK.yKK....'
  ], { Y: '#e8d888', W: '#c8b8f0', L: '#fff8e0', K: '#302858', z: '#dacff5', y: '#726d8d' });

  P.define('chronoGolem', [
    '...zzzVVVV...',
    '..zzzzVVVVV..',
    '.zVVYYYYYzV..',
    '.zVYKVYVKYzV.',
    '.zVVYYYYYzV..',
    'zzzzzVVVVVVVV',
    'zVVyGVYYVGzVV',
    'zzzzzVVVVVVVV',
    'zVVYzzVVVYzV.',
    '.zzzzVVVVVVV.',
    '..zzzzVVVVV..',
    '..zV.....zV..',
    '..yG.....yG..',
    '..yG.....yG..'
  ], { V: '#403868', Y: '#e8d888', G: '#8a7ab0', K: '#140e28', z: '#7d7898', y: '#afa5c9' });

  P.define('sanctumWraith', [
    '.....Y.Y.....',
    '....YYYYY....',
    '...zzzVVVV...',
    '...VXzVVXV...',
    '..zzzzVVVVV..',
    '.zzzzVVVVVVV.',
    '.zV.zzVVV.zV.',
    '..V.......V..',
    '..VY.....YV..',
    '...V.....V...',
    '...V.....V...',
    '..YV.....VY..'
  ], { V: '#3a2f5e', Y: '#e8d888', X: '#c890ff', K: '#140e28', z: '#797292', y: '#dab4ff' });

  P.define('chronoSerpent', [
    '............zV..',
    '...........zV...',
    '..........zV....',
    '.........zV.....',
    '........zV......',
    '.......zV.......',
    '......zV........',
    '.....zV.........',
    '....zV..........',
    '...zV...........',
    '..YzVY..........'
  ], { V: '#403868', Y: '#e8d888', K: '#140e28', z: '#7d7898' });

  P.define('timelessHerald', [
    '....Y..Y..Y....',
    '...YYYYYYYYY...',
    '..zzzzVVVVVVV..',
    '.zVVyyyWWWWzVV.',
    '.zVWKzVWzVKWzV.',
    '.zVVyyyWWWWzVV.',
    'zzzzzzVVVVVVVVV',
    'zVVYYYYYYYYYzVV',
    'zzzzzzVVVVVVVVV',
    '.zzzzzVVVVVVVV.',
    '.zzzzzVVVVVVVV.',
    '..zzVV...zzVV..',
    '..zV.......zV..',
    '..zV.......zV..',
    '.YYY.......YYY.'
  ], { V: '#3a2f5e', W: '#c8b8f0', Y: '#e8d888', K: '#140e28', z: '#797292', y: '#dacff5' });

  P.define('timelessSovereign', [
    '.....Y....Y.....',
    '....YYY..YYY....',
    '...YYYYYYYYYYY..',
    '................',
    '.....V......V...',
    '....VVV....VVV..',
    '.....VVVVVVVV...',
    '....HVVVVVVVVS..',
    '....HVWVVVVWVS..',
    '....HVVVVVVVVS..',
    '...HVVVVVVVVVVS.',
    '...HVVVVVVVVVVS.',
    '...HVVVYYVVVVS..',
    '...HVVVYYVVVVS..',
    '...HVVVVVVVVS...',
    '....VVVVVVVV....',
    '....VVVVVVVV....',
    '.....VVVVVV.....',
    '.....VVVVVV.....',
    '......VV.VV.....',
    '......VV.VV.....',
    '......VV.VV.....',
    '.....YYY.YYY....',
    '.....YYY.YYY....'
  ], { Y: '#e8d040', V: '#241a44', W: '#f0d0ff', K: '#0a0714', H: '#4a3878', S: '#120a24' });

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

  // ---- Companion portraits (see data-companions.js) -- reuse proven, already
  // width-checked grids from existing creatures with all-new palettes/identities,
  // so there's zero risk of a row-length mismatch in hand-authored new grids. ----
  P.define('emberFox', WOLF_GRID, { F: '#e8763c', D: '#a83c18', L: '#f7e6c8', K: '#0a0a0a', R: '#ff8a3d', T: '#fff3d6', z: '#efa27a', y: '#ffaf7b' });

  P.define('dawnOwl', [
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
  ], { W: '#f4ecd8', C: '#8a6a42', E: '#f0d9a8', K: '#241a10' });

  P.define('stoneheartBear', [
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
  ], { R: '#7a5a3c', K: '#1a120a', D: '#4a3420', Y: '#e8c878' });

  P.define('stormSprite', [
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
  ], { Y: '#7fd8e0', L: '#e8faff', K: '#12222a' });

  // ---- Companion portraits, 2nd wave -- same reuse-a-proven-grid approach as
  // the first 4 companions above (zero row-width risk). ----
  P.define('sandScarab', [
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
  ], { B: '#c8962a', R: '#3a2408', K: '#1a1408' });

  P.define('frostHare', WOLF_GRID, { F: '#eaf6ff', D: '#9fd8f0', L: '#cdeeff', K: '#12222a', R: '#7fd8e0', T: '#ffffff', z: '#f1f9ff', y: '#a8e4ea' });

  P.define('ironGolemCub', [
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
  ], { R: '#8a9ab8', K: '#181e28', D: '#5a6a88', Y: '#c8e0f0' });

  window.Game = window.Game || {};
})();
