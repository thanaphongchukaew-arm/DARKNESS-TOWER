// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

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

  // Hooded ranged-fighter silhouette: same torso/leg build as BLADE_GRID,
  // but a pointed scout hood instead of a helm and a strung bow (Y=wood,
  // W=string) down the right side instead of a gauntlet.
  var ARCHER_GRID = [
    '.......G........',
    '......GGG.......',
    '.....GGKKGG.....',
    '....GGGGGGGG....',
    '...GGGRRRRGGG.YW',
    '...GRRRRRRRRG.YW',
    '...GRRYYRRG...YW',
    '....RRRRRRRR..YW',
    '.....RRYYRR...YW',
    '.....RRRRRR...YW',
    '.....RRRRRR...YW',
    '......RRRR.....Y',
    '......RRRR......',
    '......G..G......',
    '......G..G......',
    '......G..G......',
    '.....UU..UU.....',
    '.....UU..UU.....'
  ];

  // Hooded duelist silhouette: same torso/leg build as BLADE_GRID with a
  // bandana mask, but a pair of mirrored daggers (Y=blade, U=hilt) flanking
  // the torso instead of a single gauntlet.
  var ROGUE_GRID = [
    '......GGGG......',
    '.....GGGGGG.....',
    '.....GGKKGG.....',
    '....GGKKKKGG....',
    '...GGGRRRRGGG...',
    '..YGRRRRRRRRGY..',
    '.YWGRRYYRRG..WY.',
    '.YW.RRRRRRRR.WY.',
    '.YW..RRYYRR..WY.',
    '.YW..RRRRRR..WY.',
    '.UU..RRRRRR..UU.',
    '..U...RRRR...U..',
    '......RRRR......',
    '......G..G......',
    '......G..G......',
    '......G..G......',
    '.....UU..UU.....',
    '.....UU..UU.....'
  ];

  // Hooded performer silhouette: same proven hood as STAFFORB_GRID, but a
  // lute (Y=body wood, s=strings) held against the torso instead of a
  // floating magic orb.
  var BARD_GRID = [
    '........N.......',
    '.......NN.......',
    '......NNNN......',
    '.....NNNNNN.....',
    '....NNNNNNNN....',
    '....NKKNNNN.....',
    '.....NNNNNN.....',
    '....NNBBBB.YY...',
    '...NNBBBB.YsY...',
    '..NNBBBBBYYYY...',
    '..NBBBBBYYYYs...',
    '..NBBBBBYYYYY...',
    '..BBBBBBYYYYs...',
    '...BBBBBYYY.....',
    '....BBBBBB......',
    '.....BBBBBB.....',
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

  P.define('ranger', ARCHER_GRID, { K: '#0a0a0a', G: '#2f6b2f', R: '#26421c', Y: '#8a5a30', U: '#4a3018', W: '#c8e070' });

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

  // Unarmed martial-artist silhouette: bald head, wrapped torso, bare fists
  // thrown mid-punch on both sides, and a wide horse-stance instead of the
  // narrow parallel legs every armed class uses.
  var MONK_GRID = [
    '......GGGG......',
    '.....GGGGGG.....',
    '.....GGKKGG.....',
    '....GGGGGGGG....',
    '...GGGRRRRGGG...',
    '..WGRRRRRRRRGW..',
    '.WWGRRYYRRG..WW.',
    '.WW.RRRRRRRR.WW.',
    '..W..RRYYRR..W..',
    '.....RRRRRR.....',
    '.....RRRRRR.....',
    '....RRRRRRRR....',
    '....YYYYYYYY....',
    '...GG......GG...',
    '...GG......GG...',
    '..GG........GG..',
    '..UU........UU..',
    '..UU........UU..'
  ];
  P.define('monk', MONK_GRID, { K: '#0a0a0a', G: '#e0942a', R: '#a83a2a', Y: '#f5f050', U: '#7a2418', W: '#fff2d0' });

  var DRAGON_GRID = [
    '.........KHHK..KHHK.........',
    '........KKHHK..KHHHK........',
    '.......KzzHHK..KzHHHK.......',
    '.......KzzHHKKKKzzHHK.......',
    '........KKyyyyCCCCKK........',
    '........KyyyyCCCCCCK........',
    '.......KKyyyyCCCCCCKK.......',
    '......KyyyyyCCCCCCCCCK......',
    '.....KKyyyyyCCCCCCCCCKK.....',
    '....KyyyyyyyyCCCCCCCCCCK....',
    '....KyCCEEEEyyCCEEEEyyCK....',
    '...KyyCCEEEEyyCCEEEEyyCCK...',
    '...KyyyyyyyyyCCCCCCCCCCCK...',
    'K..KyyyyyyyyCCCCCCCCCCCCK..K',
    'WK.KyyyyyyyyCCCCCCCCCCCCK.KW',
    'WWK.KyyyyyyyCCCCCCCCCCCK.KWW',
    'WWK..KwwwwwwDDDDDDDDDDK..KWW',
    'WK...KwwwwwwDDDDDDDDDDK...KW',
    'K....KwwDDKKKKKKKKwwDDK....K',
    '......KwDDKKKKKKKKwwDK......',
    '......KwwwwwDDDDDDDDDK......',
    '.......KKwwwDDDDDDDKK.......',
    '.........KyyyyCCCCK.........',
    '........KyyyyyCCCCCK........',
    '........KyyCKKKKyCCK........',
    '.......KyyCCK..KyyCCK.......',
    '.......KvvUUK..KvvUUK.......',
    '.......KvvUUK..KvvUUK.......'
  ];
  // Elder variant: the same proven dragon body with two extra rows of
  // taller horn tips stacked on top, for the handful of "ancient/tyrant"
  // dragons that should visibly loom larger than their kin.
  var DRAGON_GRID_ELDER = [
    '..........HH....HH..........',
    '.........KHHK..KHHK.........'
  ].concat(DRAGON_GRID);
  P.define('dragon', DRAGON_GRID, { H: '#e2d0a5', C: '#247a3e', E: '#ffe94e', W: '#671515', D: '#134121', K: '#0a0a0a', U: '#90cb64', z: '#ede3c9', y: '#6eac80', x: '#a06262', w: '#60866b', v: '#b9de9e' });
  // Palette-swapped dragons so each named wyrm actually matches its element/title
  // instead of every tier wearing the same green-and-cream scales.
  P.define('dragon_ice', DRAGON_GRID, { H: '#eaf6ff', C: '#3a7ab0', E: '#c8f0ff', W: '#2a4868', D: '#1a3850', K: '#0a0a0a', U: '#8ac8e8', z: '#f0f8ff', y: '#5a9ac0', x: '#4a7a9c', w: '#3a6888', v: '#b8e0f8' });
  P.define('dragon_iceLord', DRAGON_GRID_ELDER, { H: '#f0e8ff', C: '#5a3a90', E: '#e8d0ff', W: '#241848', D: '#180f38', K: '#0a0a0a', U: '#8a68c8', z: '#e8ddff', y: '#7858a8', x: '#5a4478', w: '#3a2860', v: '#c8b0f0' });
  P.define('dragon_fire', DRAGON_GRID, { H: '#3a1408', C: '#a83018', E: '#ffe040', W: '#7a0e0e', D: '#5a1206', K: '#0a0a0a', U: '#e86830', z: '#f0d0a8', y: '#d85020', x: '#8a2410', w: '#7a2c10', v: '#f0a860' });
  P.define('dragon_iron', DRAGON_GRID, { H: '#d8dce4', C: '#5a6270', E: '#f9ca46', W: '#20242c', D: '#2c3038', K: '#0a0a0a', U: '#9098a8', z: '#eceef2', y: '#7a8290', x: '#6a7280', w: '#40444c', v: '#c0c6d0' });
  P.define('dragon_gold', DRAGON_GRID_ELDER, { H: '#fff4c8', C: '#c89830', E: '#fff080', W: '#5a3808', D: '#7a5818', K: '#0a0a0a', U: '#e8c050', z: '#fff0d0', y: '#d8a840', x: '#a87828', w: '#8a6420', v: '#f0d888' });
  P.define('dragon_void', DRAGON_GRID, { H: '#20102c', C: '#3a1858', E: '#c890ff', W: '#0a0512', D: '#150a20', K: '#0a0a0a', U: '#6838a0', z: '#2c1840', y: '#502878', x: '#1a0c28', w: '#180a24', v: '#8858c8' });
  P.define('dragon_alpha', DRAGON_GRID, { H: '#3a2010', C: '#8a4a1c', E: '#ffd040', W: '#4a1808', D: '#5a2e10', K: '#0a0a0a', U: '#c87830', z: '#e8c0a0', y: '#a85c24', x: '#6a3414', w: '#5a3010', v: '#e0a868' });
  P.define('dragon_obsidian', DRAGON_GRID_ELDER, { H: '#1a1a1e', C: '#141416', E: '#ff8030', W: '#2a0a04', D: '#0e0e10', K: '#0a0a0a', U: '#e85818', z: '#38383e', y: '#242428', x: '#502010', w: '#1e1e22', v: '#ff9848' });

  var DEMON_GRID = [
    '.........KHHK..KHHK.........',
    '........KHHHHK.KHHHKKK......',
    '........KHHHHK.KHHHHHHK.....',
    '.......KHHHHHHKKHHHHHHK.....',
    '.......KzzzzRRRRRRRRKK......',
    '.......KzzzzzRRRRRRRK.......',
    '.......KRRKKzzRRKKRRK.......',
    '.......KRRKKzzRRKKRRK.......',
    '.......KzzzzzRRRRRRRK.......',
    '......KzzzzzRRRRRRRRRK......',
    '.....KKzzzzzRRRRRRRRRKK.....',
    '....KzzzzzzRRRRRRRRRRRRK....',
    '...KKzzzzRRRRyYYzzzRRRRKK...',
    '..KzzzzRRRRRyyYYzzzzRRRRRK..',
    '.KzzzzRRRRRRyyYYzzzzRRRRRRK.',
    '.KzzzzRRRRRRRyYYzzzRRRRRRRK.',
    '..KzzzzzzzzRRRRRRRRRRRRRRK..',
    '...KKzzzzzzzRRRRRRRRRRRKK...',
    '....KzzzzzzzRRRRRRRRRRRK....',
    '.....KKzzzzzRRRRRRRRRKK.....',
    '......KzzzzzRRRRRRRRRK......',
    '.......KKzzRRRRRRRRKK.......',
    '.........KRRRKKRRRRK........',
    '.........KRRK..KRRK.........',
    '.........KRRK..KRRK.........',
    '.........KRRK..KRRK.........',
    '........KKKKK..KKKKK........',
    '.......KKKKKK..KKKKKK.......'
  ];
  // Elder variant: the same proven demon body with two extra rows of
  // taller horn tips stacked on top, for the handful of "arch/overlord"
  // demons that should visibly outrank the rest of the family.
  var DEMON_GRID_ELDER = [
    '..........HH....HH..........',
    '.........KHHK..KHHK.........'
  ].concat(DEMON_GRID);
  P.define('demon', DEMON_GRID, { H: '#2c0808', R: '#8c0b0b', K: '#0a0a0a', Y: '#ffdb37', z: '#b85b5b', y: '#ffe881' });
  // Palette-swapped devils so a duke, a succubus and an overlord don't all wear
  // the literal same face.
  P.define('demon_captain', DEMON_GRID, { H: '#3a1004', R: '#c8501a', K: '#0a0a0a', Y: '#fff060', z: '#e88848', y: '#fff2a0' });
  P.define('demon_succubus', DEMON_GRID, { H: '#280a24', R: '#7a2068', K: '#0a0a0a', Y: '#ff70c8', z: '#a8489c', y: '#ffb0e0' });
  P.define('demon_pit', DEMON_GRID, { H: '#180404', R: '#4a0a0a', K: '#0a0a0a', Y: '#ff8020', z: '#6a1414', y: '#ffb060' });
  P.define('demon_arch', DEMON_GRID_ELDER, { H: '#1c0a2c', R: '#4a1868', K: '#0a0a0a', Y: '#f9ca46', z: '#6a3898', y: '#fbdd8b' });
  P.define('demon_duke', DEMON_GRID, { H: '#380a04', R: '#d8380e', K: '#0a0a0a', Y: '#ffe040', z: '#f06828', y: '#fff090' });
  P.define('demon_warden', DEMON_GRID, { H: '#301a04', R: '#b86818', K: '#0a0a0a', Y: '#ffe881', z: '#e0a848', y: '#fff2c0' });
  P.define('demon_overlord', DEMON_GRID_ELDER, { H: '#0e0202', R: '#380606', K: '#0a0a0a', Y: '#ff5020', z: '#500c0c', y: '#ff9050' });
  P.define('demon_matriarch', DEMON_GRID_ELDER, { H: '#140418', R: '#38103c', K: '#0a0a0a', Y: '#c890ff', z: '#582060', y: '#e0b8ff' });

  var SHADOWFIGURE_GRID = [
    '.......KVVK..........KVVK...',
    '......KVVVK........KKVVVK...',
    '.....KKVVVK......KKVVKKK....',
    '....KVVVVVVKKKKKKVVVVVKK....',
    '...KVVVVVVVVVVVVVVVVVVVVK...',
    '...KVVVVVVVVVVVVVVVVVVVVK...',
    '....KKKKVVXXVVVVXXVVKKKK....',
    '.......KVVXXVVVVXXVVK.......',
    '.....KKVVVVVVVVVVVVVVKK.....',
    '....KVVVVVVVVVVVVVVVVVVK....',
    '...KKVVVVVVVVVVVVVVVVVVKK...',
    '..KVVVVVVVVVVVVVVVVVVVVVVK..',
    '..KVVVVVVVVVVVVVVVVVVVVVVK..',
    'KKVVVVVVVVVVVVVVVVVVVVVVVVKK',
    'KKVVVVVVVVVVVVVVVVVVVVVVVVKK',
    'KKVVVVVVVVVVVVVVVVVVVVVVVVKK',
    'KKVVVVVVVVVVVVVVVVVVVVVVVVKK',
    '..KVVVVVVVVVVVVVVVVVVVVVVK..',
    '..KVVVVVVVVVVVVVVVVVVVVVVK..',
    '...KVVVVVVVVVVVVVVVVVVVVK...',
    '...KVVVVVVVVVKKVVVVVVVVVK...',
    '...KVVVVVVVVK..KVVVVVVVVK...',
    '...KVVVVVVVVK..KVVVVVVVVK...',
    '...KVVVVVVVVK..KVVVVVVVVK...',
    '...KVVVVVVVVK..KVVVVVVVVK...',
    '...KVVVVVVVVK..KVVVVVVVVK...',
    '...KKKKKKKKKK..KKKKKKKKKK...',
    '...KKKKKKKKKK..KKKKKKKKKK...'
  ];
  P.define('shadowFigure', SHADOWFIGURE_GRID, { K: '#0a0a0a', W: '#f6f2e9', G: '#b6b6c1', D: '#5c5c65', R: '#e21529', Y: '#f9ca46', U: '#53300e', N: '#0e3077', B: '#2863d8', Pu: '#a76cff', E: '#f1eadd', V: '#311748', X: '#ff4848', O: '#e1d9c9', p: '#a76cff' });
  // Palette-swapped so Banshee and Thunder Revenant no longer wear the exact
  // same violet cloak as Venom Wraith.
  P.define('shadowFigure_banshee', SHADOWFIGURE_GRID, { K: '#0a0a0a', V: '#c8d0d8', X: '#eaf6ff' });
  P.define('shadowFigure_storm', SHADOWFIGURE_GRID, { K: '#0a0a0a', V: '#2c2848', X: '#f5e050' });

  // The full robed-reaper figure -- used as an actual creature portrait
  // (Bone Reaper) and the game-over screen, where a body reads correctly.
  P.define('skull', [
    '.......KOOOOOOOOOOOOK.......',
    '......KOOOOOOOOOOOOOOK......',
    '......KOOOOOOOOOOOOOOK......',
    '.....KOOOOOOOOOOOOOOOOK.....',
    '.....KOOKKKKOOOOKKKKOOK.....',
    '.....KOOKKKKOOOOKKKKOOK.....',
    '.....KOOOOOOOOOOOOOOOOK.....',
    '......KOOOOOOOOOOOOOOK......',
    '......KOOOOOOOOOOOOOOK......',
    '.......KOOOOOOOOOOOOK.......',
    '.....KKDDDGGGGGGGGDDDKK.....',
    '....KDDDDGGGGGGGGGGDDDDK....',
    '....KDDDDGGGGGGGGGGDDDDK....',
    '...KDDDDGGGGGGGGGGGGDDDDK...',
    '...KDDDDGGGGUUUUGGGGDDDDK...',
    '...KDDDDGGGGUUUUGGGGDDDDK...',
    '...KDDDDGGGGGGGGGGGGDDDDK...',
    '....KDDDDGGGGGGGGGGDDDDK....',
    '....KDDDDGGGGGGGGGGDDDDK....',
    '.....KKDDDDGGGGGGDDDDKK.....',
    '......KDDDDGGGGGGDDDDK......',
    '.......KDDDDGGGGDDDDK.......',
    '.......KDDDDGGGGDDDDK.......',
    '........KDDDGGGGDDDK........',
    '........KDDDGGGGDDDK........',
    '.........KDDGGGGDDK.........',
    '.........KOOKKKKOOK.........',
    '.........KOOK..KOOK.........',
    '.........KOOK..KOOK.........',
    '.........KOOK..KOOK.........',
    '.........KOOK..KOOK.........',
    '........KOOOK..KOOOK........',
    '........KOOOK..KOOOK........',
    '.......KOOOOK..KOOOOK.......',
    '.......KOOOOK..KOOOOK.......',
    '.......KOOOOK..KOOOOK.......'
  ], { K: '#0a0a0a', W: '#f6f2e9', G: '#b6b6c1', D: '#5c5c65', R: '#e21529', Y: '#f9ca46', U: '#53300e', N: '#0e3077', B: '#2863d8', Pu: '#a76cff', E: '#f1eadd', V: '#311748', X: '#ff4848', O: '#e1d9c9', p: '#a76cff' });

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
    '.........KYYK..KYYK..KYYK.......',
    '........KYYYYKKYYYYKKYYYYKK.....',
    '........KYYYYYYYYYYYYYYYYYYK....',
    '.......KYYYYYYYYYYYYYYYYYYYYKK..',
    '.....KKOOOOOOOOOOOOOOOOOOOOOOOK.',
    '....KOOOOOOOOOOOOOOOOOOOOOOOOOK.',
    '....KOOOOOOOOOOOOOOOOOOOOOOOOK..',
    '...KOOOOOOOOOOOOOOOOOOOOOOOOK...',
    '...KOOXXXXOOOOOOOOOOXXXXOOOOK...',
    '...KOOXXXXOOOOOOOOOOXXXXOOOOK...',
    '...KOOOOOOOOOOOOOOOOOOOOOOOOK...',
    '...KOOOOOOOOOOOOOOOOOOOOOOOOK...',
    '...KOOOOOOOOOOOOOOOOOOOOOOOOK...',
    '....KOOOOOOOOOOOOOOOOOOOOOOOK...',
    '.....KVVVVVVVVVVVVVVVVVVVVVVK...',
    '....KVVVVVVVVVVVVVVVVVVVVVVVVK..',
    '...KKVVVVVVVVVVVVVVVVVVVVVVVVK..',
    '..KVVVVVVVVVVVVVVVVVVVVVVVVVVVK.',
    '..KVVVVVVVVVYYYYYYYYVVVVVVVVVVK.',
    '.KVVVVVVVVVVYYYYYYYYVVVVVVVVVVK.',
    '.KVVVVVVVVVVVVVVVVVVVVVVVVVVVVK.',
    '..KVVVVVVVVVVVVVVVVVVVVVVVVVVK..',
    '..KVVVVVVVVVVVVVVVVVVVVVVVVVVK..',
    '...KVVVVVVVVVVVVVVVVVVVVVVVVK...',
    '...KVVVVVVVVVVVVVVVVVVVVVVVVK...',
    '....KVVVVVVVVVVVVVVVVVVVVVVK....',
    '....KVVVVVVVVVVVVVVVVVVVVVVK....',
    '.....KVVVVVVVVVVVVVVVVVVVVK.....',
    '.....KVVVVVVVVVVVVVVVVVVVVK.....',
    '......KVVVVVVVVVVVVVVVVVVK......',
    '......KVVVVVVVVVVVVVVVVVVK......',
    '.......KVVVVVVVVVVVVVVVVK.......',
    '.......KVVVVVKKKKKKVVVVVK.......',
    '.......KVVVVK......KVVVVK.......',
    '.......KVVVVK......KVVVVK.......',
    '.......KVVVVK......KVVVVK.......',
    '......KKKKKKK......KKKKKKK......',
    '.....KKKKKKKK......KKKKKKKK.....',
    '.....KKKKKKKK......KKKKKKKK.....',
    '.....KKKKKKKK......KKKKKKKK.....'
  ], { K: '#0a0a0a', W: '#f6f2e9', G: '#b6b6c1', D: '#5c5c65', R: '#e21529', Y: '#f9ca46', U: '#53300e', N: '#0e3077', B: '#2863d8', Pu: '#a76cff', E: '#f1eadd', V: '#311748', X: '#ff4848', O: '#e1d9c9', p: '#a76cff' });

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

  // Beveled brick: a highlight row on top of each brick, mid-tone body, shadow row
  // underneath -- gives the tiled wall a 3D lit-from-above look instead of flat 2-tone.
  var BRICK_PAL = { H: '#eba468', S: '#d6874a', T: '#b5652a', M: '#20130a' };
  P.define('tileBrick', [
    'HHHHHHHMHHHHHHHM',
    'SSSSSSSMSSSSSSSM',
    'TTTTTTTMTTTTTTTM',
    'MMMMMMMMMMMMMMMM',
    'HHHMHHHHHHHMHHHH',
    'SSSMSSSSSSSMSSSS',
    'TTTMTTTTTTTMTTTT',
    'MMMMMMMMMMMMMMMM'
  ], BRICK_PAL);

  var GROUND_PAL = { H: '#c8c8d2', S: '#aaaab4', T: '#8a8a94', M: '#242428' };
  P.define('tileGround', [
    'HHHHHHHMHHHHHHHM',
    'SSSSSSSMSSSSSSSM',
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

  var BAT_GRID = [
    '...KVVK......KVVK...',
    '..KVVVVK....KVVVVK..',
    '.KKVVVVKK..KKVVVVKK.',
    'KVVVVVVVVKKVVVVVVVVK',
    'VVVVVVVVVVVVVVVVVVVV',
    'VVVVVVVVVVVVVVVVVVVV',
    'KVVVVVVVVXXVVVVVVVVK',
    '.KKVVVVVXXXXVVVVVKK.',
    '..KVVVVVKKKKVVVVVK..',
    '...KVVVVK..KVVVVK...'
  ];
  P.define('bat', BAT_GRID, { K: '#0a0a0a', W: '#f6f2e9', G: '#b6b6c1', D: '#5c5c65', R: '#e21529', Y: '#f9ca46', U: '#53300e', N: '#0e3077', B: '#2863d8', Pu: '#a76cff', E: '#f1eadd', V: '#311748', X: '#ff4848', O: '#e1d9c9', p: '#a76cff' });
  // Blood Bat Queen gets her own deep-crimson wings instead of Nightfall Bat's palette.
  P.define('bat_blood', BAT_GRID, { K: '#0a0a0a', V: '#5a0a14', X: '#ff5868' });

  // ---- New creature silhouettes so each monster's art matches its name ----

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
  P.define('wolf', [
    '.......KDDK..........KDDK.......',
    '......KDDDDK........KDDDDK......',
    '......KDDDDK........KDDDDK......',
    '.....KDDDDDDKKKKKKKKDDDDDDK.....',
    '...KKzzzzzzzzzFFFFFFFFFFFFFKK...',
    '..KzzzzzzzzzzzFFFFFFFFFFFFFFFK..',
    '..KzzzzzzzzzzzFFFFFFFFFFFFFFFK..',
    '.KzzzzzzzzzzzzzFFFFFFFFFFFFFFFK.',
    '.KzzFFFFyyRRzzzzFFFFyyRRzzFFFFK.',
    '.KzzFFFFyyRRzzzzFFFFyyRRzzFFFFK.',
    '.KzzzzzzzzzzzzzFFFFFFFFFFFFFFFK.',
    '.KzzzzzzzzzzzzFFFFFFFFFFFFFFFFK.',
    '.KzzzzzFFFLLLLLLLLLLLLzzzFFFFFK.',
    '.KzzzzFFFFLLLLLLLLLLLLzzzzFFFFK.',
    '.KzzzzFFFFLLLLLKKLLLLLzzzzFFFFK.',
    '.KzzzzFFFFLLLLKKKKLLLLzzzzFFFFK.',
    '.KzzzzFFFFLLLTTTTTTLLLzzzzFFFFK.',
    '.KzzzzzFFFLLTTTTTTTTLLzzzFFFFFK.',
    '.KzzzzzzzzzzzzFFFFFFFFFFFFFFFFK.',
    '..KzzzzzzzzzzzFFFFFFFFFFFFFFFK..',
    '..KzzzzzzzzzzzFFFFFFFFFFFFFFFK..',
    '...KzzzzzzzzzzFFFFFFFFFFFFFFK...',
    '...KzzzzzzzzzzFFFFFFFFFFFFFFK...',
    '....KzzzzzzzzFFFFFFFFFFFFFFK....',
    '....KzzzzzzFFFFKKKzzzFFFFFFK....',
    '.....KzzzFFFFKK...KzzzzFFFK.....',
    '.....KzzzFFKK......KKzzFFFK.....',
    '.....KzzFFK..........KzzFFK.....',
    '.....KzzFFK..........KzzFFK.....',
    '.....KzzFFK..........KzzFFK.....',
    '.....KKKKKK..........KKKKKK.....',
    '.....KKKKKK..........KKKKKK.....'
  ], { F: '#443853', D: '#201b2e', L: '#d0c7b4', K: '#0b080d', R: '#e21529', T: '#f6f2e9', z: '#847c8f', y: '#ed6975' });

  P.define('hound', [
    '.......KDDK..........KDDK.......',
    '......KDDDDK........KDDDDK......',
    '......KDDDDK........KDDDDK......',
    '.....KDDDDDDKKKKKKKKDDDDDDK.....',
    '...KKzzzzzzzzzFFFFFFFFFFFFFKK...',
    '..KzzzzzzzzzzzFFFFFFFFFFFFFFFK..',
    '..KzzzzzzzzzzzFFFFFFFFFFFFFFFK..',
    '.KzzzzzzzzzzzzzFFFFFFFFFFFFFFFK.',
    '.KzzFFFFyyRRzzzzFFFFyyRRzzFFFFK.',
    '.KzzFFFFyyRRzzzzFFFFyyRRzzFFFFK.',
    '.KzzzzzzzzzzzzzFFFFFFFFFFFFFFFK.',
    '.KzzzzzzzzzzzzFFFFFFFFFFFFFFFFK.',
    '.KzzzzzFFFLLLLLLLLLLLLzzzFFFFFK.',
    '.KzzzzFFFFLLLLLLLLLLLLzzzzFFFFK.',
    '.KzzzzFFFFLLLLLKKLLLLLzzzzFFFFK.',
    '.KzzzzFFFFLLLLKKKKLLLLzzzzFFFFK.',
    '.KzzzzFFFFLLLTTTTTTLLLzzzzFFFFK.',
    '.KzzzzzFFFLLTTTTTTTTLLzzzFFFFFK.',
    '.KzzzzzzzzzzzzFFFFFFFFFFFFFFFFK.',
    '..KzzzzzzzzzzzFFFFFFFFFFFFFFFK..',
    '..KzzzzzzzzzzzFFFFFFFFFFFFFFFK..',
    '...KzzzzzzzzzzFFFFFFFFFFFFFFK...',
    '...KzzzzzzzzzzFFFFFFFFFFFFFFK...',
    '....KzzzzzzzzFFFFFFFFFFFFFFK....',
    '....KzzzzzzFFFFKKKzzzFFFFFFK....',
    '.....KzzzFFFFKK...KzzzzFFFK.....',
    '.....KzzzFFKK......KKzzFFFK.....',
    '.....KzzFFK..........KzzFFK.....',
    '.....KzzFFK..........KzzFFK.....',
    '.....KzzFFK..........KzzFFK.....',
    '.....KKKKKK..........KKKKKK.....',
    '.....KKKKKK..........KKKKKK.....'
  ], { F: '#520707', D: '#170202', L: '#2d0c0c', K: '#0a0a0a', R: '#ffdb37', T: '#f6f2e9', z: '#935656', y: '#ffe881' });

  P.define('slime', [
    '...........KzzHHK...........',
    '.........KKzzHHHHKK.........',
    '........KzzzzHHHHHHK........',
    '.....KKKzzzzHHHHHHHHKKK.....',
    '...KKyyyyyyyMMMMMMMMMMMKK...',
    '..KyyyyyyyyyMMMMMMMMMMMMMK..',
    '.KKyyyyyyyyyMMMMMMMMMMMMMKK.',
    'KyyyyyyyyyyyMMMMMMMMMMMMMMMK',
    'yyyyyyyyyyyyMMMMMMMMMMMMMMMM',
    'yyyyyyyyyyyyyMMMMMMMMMMMMMMM',
    'yyyyMMMMxxKKyyMMxxKKyyyyMMMM',
    'yyyyMMMMxxKKyyMMxxKKyyyyMMMM',
    'yyyyyyyyyyyyyMMMMMMMMMMMMMMM',
    'yyyyyyyyyyyyMMMMMMMMMMMMMMMM',
    'yyyyyyyyyyyyMMMMMMMMMMMMMMMM',
    'yyyyyyyyyyyyMMMMMMMMMMMMMMMM',
    'yyyyyyyyyyyyMMMMMMMMMMMMMMMM',
    'yyyyyyyyyyyyMMMMMMMMMMMMMMMM',
    'KKwwwwwwwwwwSSSSSSSSSSSSSSKK',
    '..KwwwwwwwwwSSSSSSSSSSSSSK..',
    '..KwwwwwwwwwSSSSSSSSSSSSSK..',
    '...KKwwwwwwwSSSSSSSSSSSKK...',
    '....KwwwwwwwSSSSSSSSSSSK....',
    '.....KKwwwwwSSSSSSSSSKK.....',
    '......KwwwwwSSSSSSSSSK......',
    '.......KwwwwSSSSSSSSK.......'
  ], { H: '#aeeaa5', M: '#409e48', K: '#102108', S: '#25672f', z: '#cff3ca', y: '#83c188', x: '#5f7157', w: '#6f9f76' });

  P.define('spider', [
    '..................................',
    '..KK..........................KK..',
    '.KBBK........................KBBK.',
    '.KBBKKKK.......KKKK.......KKKBBBK.',
    '..KKzzBBK....KKzBBBKK....KzzBBBK..',
    '...KzzBBBK..KzzzBBBBBK..KKzzBBK...',
    '....KKKBBBKKKzzzBBBBBK.KBBKKKK....',
    'KKKKKK.KBBKzzzzzBBBBBBKKBBK.KKKKKK',
    'zzBBBBK.KKKzzzzzBBBBBBBKKK.KzzBBBB',
    'zzBBBBKKKzzzzzzzBBBBBBBBKKKKzzBBBB',
    'KKKKKKzzzzBBBBRRBBRRzzzzBBBBKKKKKK',
    '.....KzzzzBBBBRRBBRRzzzzBBBBK.....',
    '......KKzzzzzzzzBBBBBBBBBBKK......',
    '....KKKKzzzzzzzBBBBBBBBBBBKKKK....',
    '...KzzzzzzzzzzBBBBBBBBBBBBBBBBK...',
    'KKKKzzzzzzzzzzBBBBBBBBBBBBBBBBKKKK',
    'zzBBKKKzzzzzzzzBBBBBBBBBBBKKKKzzBB',
    'zzBBK.KKKzzzzzzzBBBBBBBBBKKK.KzzBB',
    'KKKK.KBBKKKKBBKKBBKKBBBKKBBBK.KKKK',
    '....KBBBK...KBKKBBKKBKK..KBBBK....',
    '...KBBBK.....KzzBBBBBK....KBBBK...',
    '..KBBBK.......KzBBBKK......KBBBK..',
    '.KBBBK.........KKKK.........KBBBK.',
    '.KBBK........................KBBK.',
    '..KK..........................KK..',
    '..................................'
  ], { B: '#311748', R: '#f9ca46', K: '#0a0a0a', z: '#78638b', y: '#fbdd8b' });

  P.define('windSprite', [
    '...........KWWWWK...........',
    '..........KWWWWWWK..........',
    '..........KWWWWWWK..........',
    'KKKKK....KWWWWWWWWK....KKKKK',
    'zzCCCKK..KWWWWWWWWK..KKzCCCC',
    'zzzCCCCKKKWWWWWWWWKKKzzzCCCC',
    'zzzCCCCCEEEEEEEEEEEEzzzzCCCC',
    'zzzzzCCCCEEEEEEEEEEzzzzCCCCC',
    'KzzzzCCCCEEEyyKKEEEzzzzCCCCK',
    '.KKzzzCCCCEEyyKKEEzzzCCCCKK.',
    '..KzzzCCCCEEEEEEEEzzzCCCCK..',
    '...KKzCCCEEEEEEEEEEzCCCKK...',
    '.....KKKEEEEEEEEEEEEKKK.....',
    '.......KEEEEEEEEEEEEK.......',
    '.......KEEEEEEEEEEEEK.......',
    '.......KEEEEEEEEEEEEK.......',
    '.......KWWWWWWWWWWWWK.......',
    '.......KWWWWWWWWWWWWK.......',
    '.......KWWWWWWWWWWWWK.......',
    '........KWWWWWWWWWWK........',
    '........KWWWWWWWWWWK........',
    '.........KWWWWWWWWK.........',
    '.........KzzzzCCCCK.........',
    '..........KzzzCCCK..........',
    '..........KzzzCCCK..........',
    '...........KzzCCK...........',
    '...........KzzCCK...........',
    '...........KzzCCK...........'
  ], { W: '#e0f2ff', C: '#a6e1fa', E: '#e0f5ff', K: '#1f5378', z: '#ccedfc', y: '#6a8faa' });

  P.define('bandit', [
    '.............KHHK.............',
    '.............KHHHK............',
    '...........KKzHHHKK...........',
    '.........KKzzzHHHHHKK.........',
    '.......KKzzzzzHHHHHHHKK.......',
    '......KzzzzzzzHHHHHHHHHK......',
    '.....KKzzzzzzzHHHHHHHHHKK.....',
    '....KzzzzzzzzHHHHHHHHHHHHK....',
    '....KzzzzzzzzHHHHHHHHHHHHK....',
    '...KzzzzzzzzHHHHHHHHHHHHHHK...',
    '...KzzHHKKKKyyFFFFKKKKzzHHK...',
    '...KzzHHKKKKyyFFFFKKKKzzHHK...',
    '...KzzzzzzzzHHHHHHHHHHHHHHK...',
    '...KzzzzzzzzHHHHHHHHHHHHHHK...',
    '...KxxxxxxxxCCCCCCCCCCCCCCK...',
    '..KxxxxxxxxCCCCCCCCCCCCCCCCK..',
    '..KxxxxxxxxCCCCCCCCCCCUUxCCK..',
    '.KxxxxxxxxCCCCCCCCCCCCUUxxCCK.',
    '.KxxxxxxxxCCCCCCCCCCCCCCGGCCK.',
    '.KxxxxxxxxxCCCCCCCCCCCCCGGGCK.',
    '.KxxxxxxxxxCCCCCCCCCCCCCCGCGK.',
    '..KxxxxxxxxxCCCCCCCCCCCCCCGK..',
    '..KxxxxxxxxxCCCCCCCCCCCCCCK...',
    '...KKxxxxxxCCCCCCCCCCCCCCK....',
    '....KxxxxxxCCCCKxxxCCCCCCK....',
    '.....KxxxCCCCKK.KxxxxCCCK.....',
    '.....KxxxCCKK....KKxxCCCK.....',
    '.....KxxCCK........KxxCCK.....',
    '.....KxxCCK........KxxCCK.....',
    '.....KxxCCK........KxxCCK.....',
    '.....KKKKKK........KKKKKK.....',
    '.....KKKKKK........KKKKKK.....'
  ], { H: '#324332', C: '#233123', K: '#0a0a0a', F: '#8b9f78', G: '#d2d5dd', U: '#674420', z: '#788578', y: '#b5c1a9', x: '#6e796e', w: '#9f856a', v: '#e6e8ed' });

  var KNIGHT_GRID = [
    '.............KPPK.............',
    '.............KPPPK............',
    '............KzPPPK............',
    '.......KKKKKzzPPPPKKKKK.......',
    '.....KKyyyyyyyMMMMMMMMMKK.....',
    '....KyyyyyyyyMMMMMMMMMMMMK....',
    '...KKyyyyyyyyMMMMMMMMMMMMKK...',
    '..KyyyyyyyyyMMMMMMMMMMMMMMMK..',
    '..KyyyyyyyyyMMMMMMMMMMMMMMMK..',
    '.KyyyyyyyyyyMMMMMMMMMMMMMMMMK.',
    '.KyyMMKKKKKKKKKKKKKKKKKKyyMMK.',
    '.KyyMMKKKKKKKKKKKKKKKKKKyyMMK.',
    '.KyyyyyyyyyyMMMMMMMMMMMMMMMMK.',
    '..KyyyyyyyyyMMMMMMMMMMMMMMMK..',
    '..KyyyyyyyyyMMMMMMMMMMMMMMMK..',
    '...KyyyyyyyyMMMMMMMMMMMMMMK...',
    '..KxxxxxxxxxAAAAAAAAAAAAAAAK..',
    '.KxxxxxxxxxxxAAAAAAAAAAAAAAAK.',
    '.KxxAAAAwwYYxxAAAAwwYYxxAAAAK.',
    '.KxxAAAAwwYYxxAAAAwwYYxxAAAAK.',
    '.KxxxxxxxxxxxAAAAAAAAAAAAAAAK.',
    '.KxxxxxxxxxxAAAAAAAAAAAAAAAAK.',
    '.KxxxxxxxxxxAAAAAAAAAAAAAAAAK.',
    '..KxxxxxxxxxAAAAAAAAAAAAAAAK..',
    '..KxxxxxxxxxAAAAAAAAAAAAAAAK..',
    '...KKxxxxxxxAAAAAAAAAAAAAKK...',
    '....KxxxxAKKKKKKKKKKxAAAAK....',
    '.....KxxAAK........KxxAAK.....',
    '.....KxxAAK........KxxAAK.....',
    '.....KxxAAK........KxxAAK.....',
    '.....KKKKKK........KKKKKK.....',
    '.....KKKKKK........KKKKKK.....'
  ];
  P.define('knight', KNIGHT_GRID, { P: '#e21529', M: '#d2dae5', K: '#10151b', A: '#8896ae', Y: '#f9ca46', z: '#ed6975', y: '#e7ebf1', x: '#b4bdcc', w: '#fbdd8b' });
  // Abyss Knight gets a void-purple recolor instead of wearing Frost Knight's
  // ice-white armor unchanged.
  P.define('knight_abyss', KNIGHT_GRID, { P: '#8a1868', M: '#2a1840', K: '#0a0612', A: '#4a2868', Y: '#7a3ad0', z: '#5a1848', y: '#6a4a98', x: '#3a2458', w: '#a878e8' });

  P.define('hawk', [
    '.............KFFK.............',
    '.............KFFFK............',
    '............KzFFFK............',
    '...........KzzFFFFK...........',
    '..........KKzzFFFFKK..........',
    'K........KKzzzFFFFFKK........K',
    'FK.....KKzzzzzFFFFFFFKK....KKF',
    'FFKKKKKzzzzzzFFFFFFFFFFKKKKFFF',
    'zzzzzzzzzzzzzFFFFFFFFFFFFFFFFF',
    'zzzzzzzzzzzzFFFFFFFFFFFFFFFFFF',
    'KzzzzzzzzzzzFFFFFFFFFFFFFFFFFK',
    '.KKzzzzzzzzzzFFFFFFFFFFFFFFKK.',
    '...KKzzzzzzzzzFFFFFFFFFFFKK...',
    '.....KzzzzzzzzFFFFFFFFFFK.....',
    '.....KzzzzFFFFYYzzzzFFFFK.....',
    '.....KzzzzFFFFYYzzzzFFFFK.....',
    '.....KzzzzzzzFFFFFFFFFFFK.....',
    '......KzzzzzzzFFFFFFFFFK......',
    '......KzzzzzzzFFFFFFFFFK......',
    '.......KzzzzzzFFFFFFFFK.......',
    '.......KzzzFKKKKKKzFFFK.......',
    '.......KzzFFK....KzzFFK.......',
    '.......KKKKKK....KKKKKK.......',
    '.......KKKKKK....KKKKKK.......'
  ], { F: '#8d682f', K: '#120a02', Y: '#f9ca46', z: '#b79e76', y: '#fbdd8b' });

  P.define('harpy', [
    '.............KFFK.............',
    '.............KFFFK............',
    '............KzFFFK............',
    '...........KzzFFFFK...........',
    '..........KKzzFFFFKK..........',
    'K........KKzzzFFFFFKK........K',
    'FK.....KKzzzzzFFFFFFFKK....KKF',
    'FFKKKKKzzzzzzFFFFFFFFFFKKKKFFF',
    'zzzzzzzzzzzzzFFFFFFFFFFFFFFFFF',
    'zzzzzzzzzzzzFFFFFFFFFFFFFFFFFF',
    'KzzzzzzzzzzzFFFFFFFFFFFFFFFFFK',
    '.KKzzzzzzzzzzFFFFFFFFFFFFFFKK.',
    '...KKzzzzzzzzzFFFFFFFFFFFKK...',
    '.....KzzzzzzzzFFFFFFFFFFK.....',
    '.....KzzzzFFFFYYzzzzFFFFK.....',
    '.....KzzzzFFFFYYzzzzFFFFK.....',
    '.....KzzzzzzzFFFFFFFFFFFK.....',
    '......KzzzzzzzFFFFFFFFFK......',
    '......KzzzzzzzFFFFFFFFFK......',
    '.......KzzzzzzFFFFFFFFK.......',
    '.......KzzzFKKKKKKzFFFK.......',
    '.......KzzFFK....KzzFFK.......',
    '.......KKKKKK....KKKKKK.......',
    '.......KKKKKK....KKKKKK.......'
  ], { F: '#7a418e', K: '#0e0410', Y: '#f9ca46', z: '#aa83b6', y: '#fbdd8b' });

  var SENTINEL_GRID = [
    '.....KzzMMMMKKzzMMMMK.....',
    '....KzzzzMMMMKzMMMMMMK....',
    '....KzzzzzzMMMMMMMMMMK....',
    '...KzzzzzzzzMMMMMMMMMMK...',
    '...KMMyyRRRRMMyyRRRRMMK...',
    '...KMMyyRRRRMMyyRRRRMMK...',
    '...KzzzzzzzzMMMMMMMMMMK...',
    '...KzzzzzzzzMMMMMMMMMMK...',
    '..KxxxxxxxDDDDDDDDDDDDDK..',
    'KKxxxxxxxxxDDDDDDDDDDDDDKK',
    'zzzzMMMxxxxDDDDDDDDzzzMMMM',
    'zzzzzMMMxxxxDDDDDDzzzMMMMM',
    'zzzzzzzzzzMMMMMMMMMMMMMMMM',
    'zzzzzzzzzzzMMMMMMMMMMMMMMM',
    'KzzzMMwwYYzzMMMMwwYYzzMMMK',
    '.KzzMMwwYYzzMMMMwwYYzzMMK.',
    '.KzzzzzzzzzMMMMMMMMMMMMMK.',
    '.KzzzzzzzzMMMMMMMMMMMMMMK.',
    '.KzzzzzzzzMMMMMMMMMMMMMMK.',
    '..KzzzzzzzzMMMMMMMMMMMMK..',
    '..KzzzzzzzzMMMMMMMMMMMMK..',
    '...KzzzzzzzzMMMMMMMMMMK...',
    '...KzzzMKzzzMMMMMKzMMMK...',
    '...KzzMMKKzzMMMMKKzzMMK...',
    '...KxxDDKKxxDDDDKKxxDDK...',
    '...KxxDDKKxxDDDDKKxxDDK...',
    '...KzzMMKKzzMMMMKKzzMMK...',
    '..KzzzMMMKKzMMMKKzzzMMMK..',
    '..KzzzMMMK.KKKK.KzzzMMMK..',
    '.KzzzzMMMMK....KzzzzMMMMK.',
    '.KKKKKKKKKK....KKKKKKKKKK.',
    '.KKKKKKKKKK....KKKKKKKKKK.'
  ];
  P.define('sentinel', SENTINEL_GRID, { M: '#788293', D: '#323841', R: '#fb2929', Y: '#ffdb37', K: '#0f1013', z: '#a9afba', y: '#fc7777', x: '#787d84', w: '#ffe881' });
  // Void Sentinel gets a purple recolor instead of Iron Sentinel's grey unchanged.
  P.define('sentinel_void', SENTINEL_GRID, { M: '#3a2858', D: '#1a1228', R: '#a060ff', Y: '#6a4a98', K: '#0e0a16', z: '#6a5a88', y: '#d8c0ff', x: '#4a3868', w: '#c0a8f0' });

  P.define('troll', [
    '.......KzzzzzzSSSSSSSSK.......',
    '......KzzzzzzzSSSSSSSSSK......',
    '.....KKzzzzzzzSSSSSSSSSKK.....',
    '....KzzzzzzzzSSSSSSSSSSSSK....',
    '....KzzzzzzzSSSSSSSSSSSSSK....',
    '...KzzzzzzzzSSSSSSSSSSSSSSK...',
    '...KKKKKzzzzzzSSSSSSSSKKKKK...',
    '...KKKKKzzzzzzSSSSSSSSKKKKK...',
    '...KzzzzzzzzzSSSSSSSSSSSSSK...',
    '...KzzzzzzzzSSSSSSSSSSSSSSK...',
    '...KzzSSWWWWWWWWWWWWWWzzSSK...',
    '..KzzzSSWWWWWWWWWWWWWWzzSSSK..',
    '.KKzzzzzzzzzSSSSSSSSSSSSSSSKK.',
    'KzzzzzzzzzzzSSSSSSSSSSSSSSSSSK',
    'zzzzzzzzzzzzSSSSSSSSSSSSSSSSSS',
    'zzzzzzzzzzzzSSSSSSSSSSSSSSSSSS',
    'zzzzzzzzzzzzSSSSSSSSSSSSSSSSSS',
    'zzzzzzzzzzzzSSSSSSSSSSSSSSSSSS',
    'zzzzzzzzzzzzSSSSSSSSSSSSSSSSSS',
    'zzzzzzzzzzzzSSSSSSSSSSSSSSSSSS',
    'KzzzzzzzzzzzSSSSSSSSSSSSSSSSSK',
    '.KKzzzzzzzzzSSSSSSSSSSSSSSSKK.',
    '..KzzzzzzzzzSSSSSSSSSSSSSSSK..',
    '...KKzzzzzzSSSSSSSSSSSSSSKK...',
    '....KzzzzzzSSSSKzzzSSSSSSK....',
    '.....KzzzSSSSKK.KzzzzSSSK.....',
    '.....KzzzSSKK....KKzzSSSK.....',
    '.....KzzSSK........KzzSSK.....',
    '.....KzzSSK........KzzSSK.....',
    '.....KzzSSK........KzzSSK.....',
    '.....KKKKKK........KKKKKK.....',
    '.....KKKKKK........KKKKKK.....'
  ], { S: '#436831', K: '#0f1b08', W: '#f8f5e7', z: '#849f77' });

  P.define('titan', [
    '.......KzzzzzzSSSSSSSSK.......',
    '......KzzzzzzzSSSSSSSSSK......',
    '.....KKzzzzzzzSSSSSSSSSKK.....',
    '....KzzzzzzzzSSSSSSSSSSSSK....',
    '....KzzzzzzzSSSSSSSSSSSSSK....',
    '...KzzzzzzzzSSSSSSSSSSSSSSK...',
    '...KKKKKzzzzzzSSSSSSSSKKKKK...',
    '...KKKKKzzzzzzSSSSSSSSKKKKK...',
    '...KzzzzzzzzzSSSSSSSSSSSSSK...',
    '...KzzzzzzzzSSSSSSSSSSSSSSK...',
    '...KzzSSWWWWWWWWWWWWWWzzSSK...',
    '..KzzzSSWWWWWWWWWWWWWWzzSSSK..',
    '.KKzzzzzzzzzSSSSSSSSSSSSSSSKK.',
    'KzzzzzzzzzzzSSSSSSSSSSSSSSSSSK',
    'zzzzzzzzzzzzSSSSSSSSSSSSSSSSSS',
    'zzzzzzzzzzzzSSSSSSSSSSSSSSSSSS',
    'zzzzzzzzzzzzSSSSSSSSSSSSSSSSSS',
    'zzzzzzzzzzzzSSSSSSSSSSSSSSSSSS',
    'zzzzzzzzzzzzSSSSSSSSSSSSSSSSSS',
    'zzzzzzzzzzzzSSSSSSSSSSSSSSSSSS',
    'KzzzzzzzzzzzSSSSSSSSSSSSSSSSSK',
    '.KKzzzzzzzzzSSSSSSSSSSSSSSSKK.',
    '..KzzzzzzzzzSSSSSSSSSSSSSSSK..',
    '...KKzzzzzzSSSSSSSSSSSSSSKK...',
    '....KzzzzzzSSSSKzzzSSSSSSK....',
    '.....KzzzSSSSKK.KzzzzSSSK.....',
    '.....KzzzSSKK....KKzzSSSK.....',
    '.....KzzSSK........KzzSSK.....',
    '.....KzzSSK........KzzSSK.....',
    '.....KzzSSK........KzzSSK.....',
    '.....KKKKKK........KKKKKK.....',
    '.....KKKKKK........KKKKKK.....'
  ], { S: '#66668d', K: '#10101d', W: '#e0e0ff', z: '#9d9db5' });

  var GOLEM_GRID = [
    '.....DzzzzzzRRRRRRRRD.....',
    '....DzzzzzzzRRRRRRRRRD....',
    '....DzzzzzzzRRRRRRRRRD....',
    '...DzzzzzzzzRRRRRRRRRRD...',
    '...DyyKKzzzzRRRRRRyyKKD...',
    '...DyyKKzzzzRRRRRRyyKKD...',
    '...DzzzzzzzzRRRRRRRRRRD...',
    '..DzzzzzzzzRRRRRRRRRRRRD..',
    '.DDzzzzzzzzRRRRRRRRRRRRDD.',
    'DzzzzzzzzzRRRRRRRRRRRRRRRD',
    'zzzzzzzzzzRRRRRRRRRRRRRRRR',
    'zzzzzzzzzzzRRRRRRRRRRRRRRR',
    'zzRRxxDDzzzzRRRRRRxxDDzzRR',
    'zzRRxxDDzzzzRRRRRRxxDDzzRR',
    'zzzzzzzzzzzRRRRRRRRRRRRRRR',
    'zzzzzzzzzzRRRRRRRRRRRRRRRR',
    'zzzzzzzzzzRRRRRRRRRRRRRRRR',
    'zzzzzzzzzzzRRRRRRRRRRRRRRR',
    'DzzzRRYYzzzzRRRRRRYYzzRRRD',
    '.DzzRRYYzzzzRRRRRRYYzzRRD.',
    '.DzzzzzzzzRRRRRRRRRRRRRRD.',
    '..DzzzzzzzRRRRRRRRRRRRRD..',
    '..DzzzzzzzzRRRRRRRRRRRRD..',
    '...DzzzzzzzzRRRRRRRRRRD...',
    '...DzzzRDDDDDDDDDDzRRRD...',
    '...DzzRRD........DzzRRD...',
    '...DzzRRD........DzzRRD...',
    '...DzzRRD........DzzRRD...',
    '...DxxDDD........DxxDDD...',
    '...DxxDDD........DxxDDD...'
  ];
  P.define('golem', GOLEM_GRID, { R: '#8d7a54', K: '#f9ca46', D: '#423621', Y: '#fb4f29', z: '#b6aa90', y: '#fbdd8b', x: '#867c6b', w: '#fc8f77' });
  // Crystal Golem and Steel-Forged Golem get palettes that actually look like
  // crystal / forged steel instead of Stone Golem's tan rock unchanged.
  P.define('golem_crystal', GOLEM_GRID, { R: '#4a7ab8', K: '#e8f8ff', D: '#1a2c40', Y: '#60d0f0', z: '#8ab8e0', y: '#c8ecff', x: '#3a5878', w: '#a0d8ff' });
  P.define('golem_steel', GOLEM_GRID, { R: '#9098a8', K: '#fff4c0', D: '#2a2e38', Y: '#e85028', z: '#c8ced8', y: '#fff0d0', x: '#5a6270', w: '#f0a888' });

  P.define('fiend', [
    '...KHHHHK............KHHHHK...',
    '....KHHK.KKKKKKKKKKKK.KHHK....',
    '.....KKKKzzzzzFFFFFFFKKKK.....',
    '......KzzzzzzzFFFFFFFFFK......',
    '.....KKzzzzzzzFFFFFFFFFKK.....',
    '....KzzzzzzzzzFFFFFFFFFFFK....',
    '...KKzFFRRzzzzFFFFFFRRzzFKK...',
    '..KzzzFFRRzzzFFFFFFFRRzzFFFK..',
    '..KzzzzzzzzzzFFFFFFFFFFFFFFK..',
    '.KzzzzzzzzzzFFFFFFFFFFFFFFFFK.',
    '.KzzzzzFFFLLLLLLLLLLzzzFFFFFK.',
    '.KzzzzFFFFLLLLLLLLLLzzzzFFFFK.',
    '.KzzzzFFFFLLTTLLTTLLzzzzFFFFK.',
    '.KzzzzzFFFLLTTLLTTLLzzzFFFFFK.',
    '.KzzzzzzzzzzFFFFFFFFFFFFFFFFK.',
    '.KzzzzzzzzzzFFFFFFFFFFFFFFFFK.',
    '.KzzzzzzzzzzFFFFFFFFFFFFFFFFK.',
    '..KzzzzzzzzzFFFFFFFFFFFFFFFK..',
    '..KzzzzzzzzzFFFFFFFFFFFFFFFK..',
    '...KzzzzzzzzFFFFFFFFFFFFFFK...',
    '...KzzzzzzzzFFFFFFFFFFFFFFK...',
    '....KzzzzzzFFFFFFFFFFFFFFK....',
    '....KzzzzzzFFFFKzzzFFFFFFK....',
    '.....KzzzFFFFKK.KzzzzFFFK.....',
    '.....KzzzFFKK....KKzzFFFK.....',
    '.....KzzFFK........KzzFFK.....',
    '.....KzzFFK........KzzFFK.....',
    '.....KzzFFK........KzzFFK.....',
    '.....KKKKKK........KKKKKK.....',
    '.....KKKKKK........KKKKKK.....'
  ], { F: '#790c0c', H: '#2c0808', R: '#ffdb37', L: '#2a0303', T: '#f6f2e9', K: '#0a0a0a', z: '#ad5b5b', y: '#ffe881' });

  P.define('hydra', [
    '.............KzzCCCCK.............',
    '.............KzzCCCCCK............',
    '............KCRRCCRRCK............',
    'KKKKK......KCCRRCCRRCCK......KKKKK',
    'zzCCCKK....KzzzzCCCCCCK....KKzCCCC',
    'zCCCCCCK...KzzzzCCCCCCK...KzzCCCCC',
    'CCCRzzCK...KzzzzCCCCCCK...KzzCRRCC',
    'CCRzzzCCK..KzzzzCCCCCCK..KzzCCRRCC',
    'KKzzzCCCK..KzzzzCCCCCCK..KzzCCCCCK',
    '..KzCCCKCK.KzzzzCCCCCCK.KKKzCCCKK.',
    '...KCCKKCCKKzzzzCCCCCCKKCCKKCCCK..',
    '...KCCKKCCCKKzzzCCCCCK.KCCKKCCK...',
    '....KKzzCCCK.KKKKKKKK.KzCCCCCK....',
    '.....KzzCCCCKKKKKKKKKKzzCCCCK.....',
    '......KKyyyyyyyyDDDDDDDDDDKK......',
    '......KyyyyyyyyDDDDDDDDDDDDK......',
    '......KyyyyyyyyDDDDDDDDDDDDK......',
    '.....KyyyyyyyyDDDDDDDDDDDDDDK.....',
    '.....KyyyyyyyyDDDDDDDDDDDDDDK.....',
    '......KyyyyyyyyDDDDDDDDDDDDK......',
    '......KyyyyyyyyDDDDDDDDDDDDK......',
    '.......KKyyyyyyyDDDDDDDDDKK.......',
    '........KyyyyyyyDDDDDDDDDK........',
    '.........KKyyyyyDDDDDDDKK.........',
    '...........KKKKKKKKKKKK...........',
    '............KKKK..KKKK............',
    '.............KK....KK.............',
    '..................................'
  ], { C: '#247a3e', R: '#ffe94e', D: '#134121', K: '#0a0a0a', z: '#6eac80', y: '#60866b' });

  // ---- Floor 45-100 creature silhouettes: the hidden upper tower (each unique, no palette-swap reuse) ----

  P.define('crystalWisp', [
    '.........KCCKKCCK.........',
    '........KKCCKKCCCK........',
    '.......KzzzCCCCCCCK.......',
    '......KKzzzzCCCCCCCK......',
    '.....KCCKzzzCCCCKKCCK.....',
    '....KCCCKKKzCCCK.KCCCK....',
    '...KCCCK...KCCCK..KCCCK...',
    '..KCCCK....KCCK....KCCCK..',
    '.KCCKK.....KKKK.....KKCCK.',
    '.KCCKK.....KKKK.....KKCCK.',
    '..KCCCK...KzCCCK...KCCCK..',
    '...KCCKKKKzzCCCCKKKCCCK...',
    '....KKzzCCLLLLLLzzCCKK....',
    '....KKzzCCLLLLLLzzCCKK....',
    '...KCCKKKKzzCCCCKKKCCCK...',
    '..KCCCK...KzCCCK...KCCCK..',
    '.KCCKK.....KKKK.....KKCCK.',
    '.KCCKK.....KKKK.....KKCCK.',
    '..KCCCK....KCCK....KCCCK..',
    '...KCCCK...KCCCK..KCCCK...',
    '....KCCCKKKzCCCK.KCCCK....',
    '.....KCCKzzzCCCCKKCCK.....',
    '......KKKzzzCCCCCKCK......',
    '.......KzzzzCCCCCCK.......'
  ], { C: '#8dd9fc', L: '#e0f6ff', K: '#0c273d', z: '#bbe8fd', y: '#5b7285' });

  P.define('prismLynx', [
    '.......KDDK..........KDDK.......',
    '.......KDDDK.........KDDDK......',
    '......KzDDDK........KzDDDK......',
    '.....KzzDDDDKKKKKKKKzzDDDDK.....',
    '...KKyyyyyyyyyCCCCCCCCCCCCCKK...',
    '..KyyyyyyyyyyyCCCCCCCCCCCCCCCK..',
    '..KyyyyyyyyyyyCCCCCCCCCCCCCCCK..',
    '.KyyyyyyyyyyyyyCCCCCCCCCCCCCCCK.',
    '.KyyCCCCLLLyyyyCCCCCCLLLyyCCCCK.',
    '.KyyCCCCCLLLyyyyCCCCLLLyyyCCCK..',
    '.KyyyCCCCCKKyyyyCCCCKKyyyCCCK...',
    '.KyyyyCCCCCKyyyyCCCCKyyyCCCCK...',
    '.KyyyyCCCCCCLLLLLLLLyyyyCCCCCK..',
    '.KyyyyCCCCCCLLLLLLLLyyyyCCCCCCK.',
    '.KyyyyCCCCCCLLLLLLLLyyyyCCCCCCK.',
    '.KyyyyyCCCCCLLLLLLLLyyyCCCCCCCK.',
    '.KyyyyyyyyyyyyCCCCCCCCCCCCCCCCK.',
    '..KyyyyyyyyyyyCCCCCCCCCCCCCCCK..',
    '..KyyyyyyyyyyyCCCCCCCCCCCCCCCK..',
    '...KyyyyyyyyyyCCCCCCCCCCCCCCK...',
    '...KyyyyyyyyyyCCCCCCCCCCCCCCK...',
    '....KyyyyyyyyCCCCCCCCCCCCCCK....',
    '....KyyyyyyCCCCKKKyyyCCCCCCK....',
    '.....KyyyCCCCKK...KyyyyCCCK.....',
    '.....KyyyCCKK......KKyyCCCK.....',
    '.....KyyCCK..........KyyCCK.....',
    '.....KyyCCK..........KyyCCK.....',
    '.....KyyCCK..........KyyCCK.....',
    '.....KzzDDK..........KzzDDK.....',
    '.....KzzDDK..........KzzDDK.....'
  ], { C: '#66bff6', D: '#2f6895', L: '#e0f6ff', K: '#030d16', z: '#769dbc', y: '#a0d8f9' });

  P.define('chimeWraith', [
    '.........KCCKKCCKKCCK.........',
    '........KKCCKKCCKKCCCK........',
    '.......KzzzzzzCCCCCCCCK.......',
    '......KKzzzzzzCCCCCCCCCK......',
    '.....KCCKKKKKKKKKKKKKCCCK.....',
    '....KKCCK............KCCCK....',
    '...KzzCCK............KzzCCK...',
    '...KzzzCKKKKKKKKKKKKKKzzCCK...',
    '....KzzzzzzzzzCCCCCCCCCCCK....',
    '.....KzzzzzzzCCCCCCCCCCCK.....',
    '.....KCCLLKKCCKKCCKKLLCCK.....',
    '.....KCCLLKKCCKKCCKKLLCCK.....',
    '.....KzzzzzzzzCCCCCCCCCCK.....',
    '....KzzzzzzzzzCCCCCCCCCCCK....',
    '....KzzzzzzzCCCCCCCCCCCCCK....',
    '...KzzzzzzzzCCCCCCCCCCCCCCK...',
    '...KzzzCKzzzzCCCCCCCCKzCCCK...',
    '...KzzCCKKKzzzCCCCCKKKzzCCK...',
    '...KzzCCK..KKKKKKKK..KzzCCK...',
    '...KzzCCK............KzzCCK...',
    '...KzzCCK............KzzCCK...',
    '...KzzCCK............KzzCCK...',
    '...KzzCCK............KzzCCK...',
    '...KzzCCK............KzzCCK...',
    '...KyyDDK............KyyDDK...',
    '...KyyDDK............KyyDDK...'
  ], { C: '#b693f3', L: '#ede0ff', K: '#1a112c', D: '#442f65', z: '#d3bff8', y: '#84769c' });

  P.define('geodeGolem', [
    '.....KzzzzzzRRRRRRRRK.....',
    '....KzzzzzzzRRRRRRRRRK....',
    '...KKzzzzzzzRRRRRRRRRKK...',
    '..KzzzzzzzzzRRRRRRRRRRRK..',
    '..KzzRRRyyyyLLLLLLzRRRRK..',
    '.KzzRRRyyyyyLLLLLLLzzRRRK.',
    '.KzzRRyyLLKKLLKKyyLLzzRRK.',
    '.KzzRRyyLLKKLLKKyyLLzzRRK.',
    '.KzzRRRyyyyyLLLLLLLzzRRRK.',
    'KzzzzRRRyyyyLLLLLLzRRRRRRK',
    'zzzzzzzzzzRRRRRRRRRRRRRRRR',
    'zzzzzzzzzzRRRRRRRRRRRRRRRR',
    'zzRRRRxxDDRRxxDDzzzzRRRRRR',
    'zzRRRRxxDDRRxxDDzzzzRRRRRR',
    'zzzzzzzzzzRRRRRRRRRRRRRRRR',
    'zzzzzzzzzzzRRRRRRRRRRRRRRR',
    'zzRRRRLLzzzzRRRRRRLLzzRRRK',
    'zzRRRRLLzzzzRRRRRRLLzzRRK.',
    'KzzzzzzzzzRRRRRRRRRRRRRRK.',
    '.KKzzzzzzzRRRRRRRRRRRRRK..',
    '..KzzzzzzzzRRRRRRRRRRRRK..',
    '...KzzzzzzzzRRRRRRRRRRK...',
    '...KzzzRKKKKKKKKKKzRRRK...',
    '...KzzRRK........KzzRRK...',
    '...KzzRRK........KzzRRK...',
    '...KzzRRK........KzzRRK...',
    '...KxxDDK........KxxDDK...',
    '...KxxDDK........KxxDDK...'
  ], { R: '#7865b9', L: '#d9ceff', K: '#06060e', D: '#322655', z: '#a99dd2', y: '#e7e0ff', x: '#776f92' });

  P.define('choirWarden', [
    '.........KGGKKGGKKGGK.........',
    '........KGGGKKGGKKGGGK........',
    '........KGGGGGGGGGGGGK........',
    '.......KGGGGGGGGGGGGGGK.......',
    '.....KKzzzzzzzCCCCCCCCCKK.....',
    '....KzzzzzzzzCCCCCCCCCCCCK....',
    '...KKzzzzzzzzCCCCCCCCCCCCKK...',
    '..KzzzzzzzzzCCCCCCCCCCCCCCCK..',
    '..KzCCCCyyLLKKyyLLKKyyLLzzCK..',
    '.KzzCCCCyyLLKKyyLLKKyyLLzzCCK.',
    '.KzzzzzzzzzzCCCCCCCCCCCCCCCCK.',
    '.KzzzzzzzzzzCCCCCCCCCCCCCCCCK.',
    '.KzzzzzCCCGGGGGGGGGGzzzCCCCCK.',
    'KzzzzCCCCCGGGGGGGGGGzzzzCCCCCK',
    'zzzzCCCCCCGGGGGGGGGGzzzzCCCCCC',
    'zzzzCCCCCCGGGGGGGGGGzzzCCCCCCC',
    'zzzzzzzzzzzzCCCCCCCCCCCCCCCCCC',
    'zzzzzzzzzzzzCCCCCCCCCCCCCCCCCC',
    'KzzzzzzzzzzzCCCCCCCCCCCCCCCCCK',
    '.KzzzzzzzzzzCCCCCCCCCCCCCCCCK.',
    '.KzzzzzzzzzzCCCCCCCCCCCCCCCCK.',
    '..KzzzzzzzzCCCCCCCCCCCCCCCCK..',
    '..KzzzzzzCCCCKKKKKzzzCCCCCCK..',
    '...KzzzCCCCKK.....KzzzzCCCK...',
    '...KzzzCCKK........KKzzCCCK...',
    '...KzzCCK............KzzCCK...',
    '...KzzCCK............KzzCCK...',
    '...KzzCCK............KzzCCK...',
    '..KxDDDDK............KxxDDDK..',
    '.KxxDDDDK............KxxDDDDK.'
  ], { C: '#a0e1fa', G: '#e0f6ff', L: '#d7c5ff', K: '#0a1d2d', D: '#204359', z: '#c8edfc', y: '#eae0ff', x: '#6a8596' });

  P.define('drownedRevenant', [
    '.........KVVKKVVK.........',
    '.........KVVKKVVVK........',
    '.......KKzzVVVVVVKK.......',
    '......KzzzzzVVVVVVVK......',
    '......KzzzzzVVVVVVVK......',
    '.....KzzzzzzVVVVVVVVK.....',
    '.....KVVXXzzVVVVXXVVK.....',
    '.....KVVXXzzVVVVXXVVK.....',
    '.....KzzzzzzVVVVVVVVK.....',
    '....KzzzzzzzVVVVVVVVVK....',
    '...KKzzzzzzzVVVVVVVVVKK...',
    '..KzzzzzzzzVVVVVVVVVVVVK..',
    '..KzzzzzzzVVVVVVVVVVVVVK..',
    '.KzzzzzzzzVVVVVVVVVVVVVVK.',
    '.KzzzVKzzzzVVVVVVVVKzVVVK.',
    '.KzzVVKKKzzzVVVVVKKKzzVVK.',
    '.KzzVVK..KKKKKKKK..KzzVVK.',
    '.KzzVVK............KzzVVK.',
    '.KzzVVK............KzzVVK.',
    '.KzzVVK............KzzVVK.',
    '.KzzVVK............KzzVVK.',
    '..KzVVK............KzVVK..',
    '...KVVK............KVVVK..',
    '...KVVK............KVVK...',
    '...KVVK............KVVK...',
    '...KVVK............KVVK...'
  ], { V: '#214938', X: '#78e4b6', K: '#05100c', z: '#6b8a7d', y: '#aceed1' });

  // Wavy serpent silhouette (S-curve body with a distinct head/eye and a
  // tapering tail) shared by every "Serpent/Eel"-type enemy, so each one
  // reads as an actual creature instead of a single straight diagonal bar.
  var SERPENT_GRID = [
    '...KzzzzK........................',
    '..KzzEXEzzK......................',
    '...KzzEEEzzK.....................',
    '......KzzEEK.....................',
    '........KzzEEK...................',
    '..........KzzEEK.................',
    '...........KzzEEK................',
    '...........KzzEEK................',
    '..........KzzEEK.................',
    '........KzzEEK...................',
    '......KzzEEK.....................',
    '....KzzEEK.......................',
    '....KzzEEK.......................',
    '.....KzzEEK......................',
    '.......KzzEEK....................',
    '.........KzzEEK..................',
    '...........KzzEEK................',
    '.............KzzEEK..............',
    '...............KzzEEK............',
    '.................KzzEEK..........',
    '...................KzzEEK........',
    '......................KEEEK......',
    '........................KEEK.....',
    '...........................KEK...'
  ];
  P.define('abyssalEel', SERPENT_GRID, { E: '#256756', K: '#050f09', z: '#6f9f92', X: '#bfe8d8' });

  P.define('tideGolem', [
    '.....KzzzzzzCCCCCCCCK.....',
    '....KzzzzzzzCCCCCCCCCK....',
    '...KKzzzzzzzCCCCCCCCCK....',
    '..KzzzzzzzzzCCCCCCCCCCK...',
    '..KzzCCCLLLLLLLLLLzCCCK...',
    '.KzzCCCLLLLLLLLLLLLzCCK...',
    '.KzzCCLLKKzzCCCCKKLLCCK...',
    '.KzzCCLLKKzzCCCCKKLLCCK...',
    '.KzzCCCLLLLLLLLLLLLzCCK...',
    'KzzzzCCCLLLLLLLLLLzCCCCKKK',
    'zzzzzzzzzzCCCCCCCCCCCCCCCC',
    'zzzzzzzzzzCCCCCCCCCCCCCCCC',
    'zzCCCCyyyyyyDDDDDDDDzzCCCC',
    'zzCCCCyyyyyyDDDDDDDDzzCCCC',
    'zzzzzzzzzzCCCCCCCCCCCCCCCC',
    'zzzzzzzzzzCCCCCCCCCCCCCCCC',
    'zzzzzzzzzzCCCCCCCCCCCCCCCC',
    'zzzzzzzzzzCCCCCCCCCCCCCCCC',
    'KzzzzzzzzzCCCCCCCCCCCCCCCK',
    '.KKzzzzzzzzCCCCCCCCCCCCKK.',
    '..KzzzzzzzzCCCCCCCCCCCCK..',
    '...KzzzzzzzzCCCCCCCCCCK...',
    '...KzzzCKKKKKKKKKKzCCCK...',
    '...KzzCCK........KzzCCK...',
    '...KzzCCK........KzzCCK...',
    '...KzzCCK........KzzCCK...',
    '...KyyDDK........KyyDDK...',
    '...KyyDDK........KyyDDK...'
  ], { C: '#246881', L: '#a8f2fa', K: '#030d12', D: '#0e303e', z: '#6e9eb0', y: '#5c7985' });

  P.define('sirenWraith', [
    '.........KVVK....KVVK.........',
    '.........KVVVK...KVVVK........',
    '.......KKzVVVKK.KzVVVKK.......',
    '......KzzzzVVVVKzVVVVVVK......',
    '......KzzzzzzVVVVVVVVVVK......',
    '.....KzzzzzzzzVVVVVVVVVVK.....',
    '.....KVVXXzzzzVVVVVVXXVVK.....',
    '.....KVVXXzzzVVVVVVVXXVVVK....',
    '...KKzzzzzzzzVVVVVVVVVVVVKK...',
    '..KzzzzzzzzzVVVVVVVVVVVVVVVK..',
    '..KzzzzzzzzzVVVVVVVVVVVVVVVK..',
    '.KzzzzzzzzzzzVVVVVVVVVVVVVVVK.',
    '.KzzzVKzzzzzzVVVVVVVVVVKzzVVK.',
    '..KzVVKKKzzzzzVVVVVVVKKKzzVK..',
    '...KVVK..KKKKKKKKKKKK..KVVVK..',
    '...KVVVK...............KVVK...',
    '...KzVVKK............KKzVVK...',
    '....KzzVVK..........KzzVVK....',
    '....KzzVVKK........KKzzVVK....',
    '.....KKzzVVK......KzzVVKK.....',
    '......KzzVVK......KzzVVK......',
    '.......KzzVVK....KzzVVK.......'
  ], { V: '#316878', X: '#fbde32', K: '#040e11', z: '#779ea9', y: '#fcea7d' });

  P.define('leviathanHerald', [
    '.......KCCK........KCCK.......',
    '.......KCCCK.......KCCCK......',
    '.....KKzCCCKK.....KzCCCKK.....',
    '....KzzzzCCCCKKKKKzCCCCCCK....',
    '...KKzzzzzzCCCCCCCCCCCCCCKK...',
    '..KzzzzzzzzzCCCCCCCCCCCCCCCK..',
    '..KzzzzzzzzzCCCCCCCCCCCCCCCK..',
    '.KzzzzzzzzzzzCCCCCCCCCCCCCCCK.',
    '.KzzCCCCLLKKzzCCCCKKLLzzCCCCK.',
    'KzzzCCCCLLKKzzCCCCKKLLzzCCCCCK',
    'zzzzzzzzzzzzzCCCCCCCCCCCCCCCCC',
    'zzzzzzzzzzzzCCCCCCCCCCCCCCCCCC',
    'zzCCCCxxxxxxxxDDDDDDDDDDzzCCCC',
    'zzCCCCxxxxxxxxDDDDDDDDDDzzCCCC',
    'zzzzzzzzzzzzCCCCCCCCCCCCCCCCCC',
    'zzzzzzzzzzzzCCCCCCCCCCCCCCCCCC',
    'zzzzzzzzzzzzCCCCCCCCCCCCCCCCCC',
    'zzzzzzzzzzzzCCCCCCCCCCCCCCCCCC',
    'KzzzzzzzzzzzCCCCCCCCCCCCCCCCCK',
    '.KzzzzzzzzzzCCCCCCCCCCCCCCCCK.',
    '.KzzzzzzzzzzCCCCCCCCCCCCCCCCK.',
    '..KzzzzzzzzCCCCCCCCCCCCCCCCK..',
    '..KzzzzzzCCCCKKKKKzzzCCCCCCK..',
    '...KzzzCCCCKK.....KzzzzCCCK...',
    '...KzzzCCKK........KKzzCCCK...',
    '...KzzCCK............KzzCCK...',
    '...KzzCCK............KzzCCK...',
    '...KzzCCK............KzzCCK...',
    '..KxDDDDK............KxxDDDK..',
    '.KxxDDDDK............KxxDDDDK.'
  ], { C: '#1a5364', L: '#78e3ed', K: '#030d12', D: '#0a2534', z: '#65909d', y: '#adedf4', x: '#59717e' });

  P.define('galeFalcon', [
    '.............KFFK.............',
    '............KFFFFK............',
    '............KFFFFK............',
    '...........KFFFFFFK...........',
    '..........KKFFFFFFKK..........',
    'K........KKFFFFFFFFKK........K',
    'FKK......KFFFFFFFFFFK......KKF',
    'FFFK....KFFFFFFFFFFFFK....KFFF',
    'FFFKK..KKFFFFFFFFFFFFKK..KKFFF',
    'FFFFFKKFFFFFFFFFFFFFFFFKKFFFFF',
    'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
    'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
    'KFFFFFFFFFFFFFFFFFFFFFFFFFFFFK',
    '.KKFFFFFFFFFFFFFFFFFFFFFFFFKK.',
    '...KKFFFFFFFFFFFFFFFFFFFFKK...',
    '.....KFFFFFFFFFFFFFFFFFFK.....',
    '.....KFFFFFFFFYYFFFFFFFFK.....',
    '......KFFFFFFFYYFFFFFFFK......',
    '......KFFFFFFFFFFFFFFFFK......',
    '.......KKFFFFFFFFFFFFKK.......',
    '........KFFFFFKKFFFFFK........',
    '.........KFFFFKKFFFFK.........',
    '.........KKKKKKKKKKKK.........',
    '.........KKKKKKKKKKKK.........'
  ], { F: '#d3dee9', K: '#131a24', Y: '#f9ca46', z: '#fbdd8b' });

  P.define('thunderCherub', [
    '.........KYYKKYYK.........',
    '........KYYYKKYYYK........',
    '.......KKYYYYYYYYKK.......',
    '......KYYYYYYYYYYYYK......',
    '.....KYYLLKKYYKKLLYYK.....',
    '.....KYYLLKKYYKKLLYYK.....',
    '......KYYYYYYYYYYYYK......',
    'KKK....KYYYYYYYYYYK....KKK',
    'YYYKK..KYYYYYYYYYYK..KKYYY',
    'YYYYYK.KYYYYYYYYYYK.KYYYYY',
    'KYYYYK.KYYYYYYYYYYK.KYYYYK',
    '.KKYYYKKYYYYYYYYYYKKYYYKK.',
    '..KYYYYYYYYYYYYYYYYYYYYK..',
    '...KKYYYYYYYYYYYYYYYYKK...',
    '....KYYYYYYYYYYYYYYYYK....',
    '.....KKYYYYYYYYYYYYKK.....',
    '......KYYYYKKKKYYYYK......',
    '.......KYYK....KYYK.......',
    '.......KYYK....KYYK.......',
    '.......KYYK....KYYK.......'
  ], { Y: '#ffed49', L: '#fffae0', K: '#2c2708', z: '#797457' });

  P.define('stormLancer', [
    '.............KYYK.............',
    '............KYYYYK............',
    '............KYYYYK............',
    '.......KKKKKYYYYYYKKKKK.......',
    '.....KKzzzzzzzMMMMMMMMMKK.....',
    '....KzzzzzzzzMMMMMMMMMMMMK....',
    '...KKzzzzzzzzMMMMMMMMMMMMKK...',
    '..KzzzzzzzzzMMMMMMMMMMMMMMMK..',
    '..KzzzzzzzzzMMMMMMMMMMMMMMMMK.',
    '.KzzzzzzzzzzMMMMMMMMMMMMMMMMK.',
    '.KzzMMKKKKYYKKYYKKKKKKzzMMKK..',
    '.KzzMMKKKKYYKKYYKKKKKKzzMMKK..',
    '.KzzzzzzzzzzMMMMMMMMMMMMMMMMK.',
    '..KzzzzzzzzzMMMMMMMMMMMMMMMMK.',
    '..KzzzzzzzzzMMMMMMMMMMMMMMMK..',
    '...KzzzzzzzzMMMMMMMMMMMMMMK...',
    '..KyyyyyyyyyAAAAAAAAAAAAAAAK..',
    '.KyyyyyyyyyyyAAAAAAAAAAAAAAAK.',
    '.KyyAAAAYYYYyyAAAAYYYYyyAAAAK.',
    '.KyyAAAAYYYYyyAAAAYYYYyyAAAAK.',
    '.KyyyyyyyyyyyAAAAAAAAAAAAAAAK.',
    '..KyyyyyyyyyAAAAAAAAAAAAAAAK..',
    '..KyyyyyyyyyAAAAAAAAAAAAAAAK..',
    '...KKyyyyyyyAAAAAAAAAAAAAKK...',
    '....KyyyyAKKKKKKKKKKyAAAAK....',
    '.....KyyAAK........KyyAAK.....',
    '.....KyyAAK........KyyAAK.....',
    '.....KyyAAK........KyyAAK.....',
    '.....KKKKKK........KKKKKK.....',
    '.....KKKKKK........KKKKKK.....'
  ], { M: '#8a9dc0', A: '#54678b', Y: '#ffed49', K: '#0e131b', z: '#b5c1d8', y: '#909db4' });

  P.define('cloudSerpent', SERPENT_GRID, { E: '#8bade3', K: '#3a5a8a', z: '#b7cded', X: '#ece4fb' });

  P.define('tempestMarshal', [
    '.............KYYK.............',
    '............KYYYYK............',
    '............KYYYYK............',
    '.......KKKKKYYYYYYKKKKK.......',
    '.....KKzzzzzzzMMMMMMMMMKK.....',
    '....KzzzzzzzzMMMMMMMMMMMMK....',
    '...KKzzzzzzzzMMMMMMMMMMMMKK...',
    '..KzzzzzzzzzMMMMMMMMMMMMMMMK..',
    '..KzzzzzzzzzMMMMMMMMMMMMMMMMK.',
    '.KzzzzzzzzzzMMMMMMMMMMMMMMMMK.',
    '.KzzMMKKKKYYYYYYKKKKKKzzMMKK..',
    '.KzzMMKKKKYYYYYYKKKKKKzzMMKK..',
    '.KzzzzzzzzzzMMMMMMMMMMMMMMMMK.',
    '..KzzzzzzzzzMMMMMMMMMMMMMMMMK.',
    '..KzzzzzzzzzMMMMMMMMMMMMMMMK..',
    'KKKKzzzzzzzzMMMMMMMMMMMMMMKKKK',
    'yyyyyyyyyyyyAAAAAAAAAAAAAAAAAA',
    'yyyyyyyyyyyyAAAAAAAAAAAAAAAAAA',
    'yyyyAAAAYYYYYYYYYYYYYYyyyyAAAA',
    'yyyyAAAAYYYYYYYYYYYYYYyyyyAAAA',
    'yyyyyyyyyyyyAAAAAAAAAAAAAAAAAA',
    'yyyyyyyyyyyyAAAAAAAAAAAAAAAAAA',
    'KyyyyyyyyyyyAAAAAAAAAAAAAAAAAK',
    '.KKyyyyyyyyyAAAAAAAAAAAAAAAKK.',
    '..KyyyyAKKKKKKKKKKyAAAAKKKK...',
    '...KyyAAK........KyyAAK.......',
    '...KyyAAK........KyyAAK.......',
    '...KyyAAK........KyyAAK.......',
    '..KKKKKKK........KKKKKKK......',
    '.KKKKKKKK........KKKKKKKK.....'
  ], { M: '#6578b9', A: '#41528b', Y: '#ffed49', K: '#0b0e1a', z: '#9da9d2', y: '#838eb5' });

  P.define('sandWraith', [
    '.........KUUKKUUK.........',
    '.........KUUKKUUUK........',
    '.......KKzzUUUUUUKK.......',
    '......KzzzzzUUUUUUUK......',
    '......KzzzzzUUUUUUUK......',
    '.....KzzzzzzUUUUUUUUK.....',
    '.....KUUXXzzUUUUXXUUK.....',
    '.....KUUXXzzUUUUXXUUUK....',
    '...KKzzzzzzzUUUUUUUUUKK...',
    '..KzzzzzzzzUUUUUUUUUUUUK..',
    '..KzzzzzzzUUUUUUUUUUUUUK..',
    '.KzzzzzzzzUUUUUUUUUUUUUUK.',
    '.KzzzUKzzzzUUUUUUUUKzzUUK.',
    '..KzUUKKKzzzUUUUUKKKzzUK..',
    '...KUUK..KKKKKKKK..KUUUK..',
    '...KUUUK...........KUUK...',
    '...KzUUKK........KKzUUK...',
    '....KzzUUK......KzzUUK....',
    '....KzzUUKK....KKzzUUK....',
    '.....KKzzUUK..KzzUUKK.....',
    '......KzzUUK..KzzUUK......',
    '.......KzzUUKKzzUUK.......'
  ], { U: '#d4ae58', X: '#530e0e', K: '#2d210c', z: '#e4cc96', y: '#935c5c' });

  P.define('boneSerpent', SERPENT_GRID, { E: '#f1ead4', K: '#554321', z: '#92856a', X: '#2a1f10' });

  P.define('scarabSwarm', [
    '...KDDK............KDDK...',
    '...KDDDK...........KDDDK..',
    '.KKzDDDKK........KKzDDDKK.',
    'KzzzDDDDDK......KzzzDDDDDK',
    'zzzzDDDDDKK....KKzzzDDDDDD',
    'zzzzzDDDDDDK..KzzzzDDDDDDD',
    'KzzzzDDDDDDKK.KzzzzDDDDDDK',
    '.KKzzzzDDDDDDKzzzDDDDDDKK.',
    '..KzzzzzzzzDDDDDDDDDDDK...',
    '..KKKzzzzzzzDDDDDDDDDKKK..',
    '.KDDKzzzzzzzDDDDDDDDKKDDK.',
    'KKDDKKKzzzzDDDDDDDDK.KDDDK',
    'zzDDK..KzzDDRRzzDDK..KzzDD',
    'zzDDK..KzzDDRRzzDDK..KzzDD',
    'KKDDKKKzzzzDDDDDDDDK.KDDDK',
    '.KDDKzzzzzzzDDDDDDDDKKDDK.',
    '..KKKzzzzzzzDDDDDDDDDKKK..',
    '..KzzzzzzzzDDDDDDDDDDDK...',
    '.KKzzzzDDDDDDKzzzDDDDDDKK.',
    'KzzzzDDDDDDKK.KzzzzDDDDDDK',
    'zzzzzDDDDDDK..KzzzzDDDDDDD',
    'zzzzDDDDDKK....KKzzzDDDDDD',
    'KzzzDDDDDK......KzzzDDDDDK',
    '.KzzDDDDK........KzzDDDDK.'
  ], { D: '#413111', R: '#fc7f1f', K: '#110d03', z: '#86795e', y: '#fdae70' });

  P.define('dustDjinn', [
    '...........KGGKKGGK...........',
    '...........KGGKKGGGK..........',
    '..........KzzGGGGGGKK.........',
    '........KKzzzzGGGGGGGK........',
    '.......KGGLLKKGGKKLLGGK.......',
    '.......KGGLLKKGGKKLLGGK.......',
    '........KKzzzzGGGGGGGK........',
    '....KKK..KzzzzGGGGGGK..KKK....',
    '...KzzGK.KzzzzGGGGGGK.KzGGK...',
    '..KKzzzGKzzzzzGGGGGGGKzGGGGK..',
    '.KGGKKzzzzzzzzGGGGGGGGGGKKGGK.',
    '.KGGKKzzzzzzzGGGGGGGGGGGKKGGK.',
    '..KKzzzzzzzzGGGGGGGGGGGGGGGK..',
    '...KzzzzzzzzGGGGGGGGGGGGGGK...',
    '....KzzzzzzzzGGGGGGGGGGGGK....',
    '.....KKzzzzzzzGGGGGGGGGKK.....',
    '......KzzzzGKKGGKKzGGGGK......',
    '.......KzGGK.KGGKKKzGKK.......',
    '.......KGGGK..KGGGKKK.........',
    '.......KGGK....KGGK...........',
    '.......KGGK....KGGK...........',
    '.......KGGK....KGGK...........'
  ], { G: '#ebd189', L: '#fff6e0', K: '#40320f', z: '#f3e3b7', y: '#867a5d' });

  P.define('pharaohAsh', [
    '.........KYYKKYYK.........',
    '.........KYYKKYYYK........',
    '........KzzYYYYYYK........',
    '.......KzzzzYYYYYYK.......',
    '.....KKyyyyyUUUUUUUKK.....',
    '....KyyyyyyyUUUUUUUUUK....',
    '...KKyyyyyyyUUUUUUUUUKK...',
    '..KyyyyyyyyUUUUUUUUUUUUK..',
    '..KyyyyyyyyUUUUUUUUUUUUUK.',
    '.KyyyyyyyyUUUUUUUUUUUUUUK.',
    '.KyyUUxxKKUUKKUUxxKKUUKK..',
    '.KyyUUxxKKUUKKUUxxKKUUKK..',
    '.KyyyyyyyyUUUUUUUUUUUUUUK.',
    '..KyyyyyyUUUUUUUUUUUUUUUK.',
    '..KyyyUUUUUzYYYYyyUUUUUK..',
    '...KyyUUUUzzYYYYyyUUUUK...',
    '...KyyyyyyyyUUUUUUUUUUK...',
    '....KyyyyyyyUUUUUUUUUUUK..',
    '....KyyyyUKKKKKKKKKKyUUK..',
    '.....KyyUUK........KyyUUK.',
    '.....KyyUUK........KyyUUK.',
    '.....KyyUUK........KyyUUK.',
    '.....KyyUUK........KyyUUK.',
    '.....KyyUUK........KyyUUKK',
    '....KxKKKKK........KxxKKKK',
    '...KxxKKKKK........KxxKKKK'
  ], { U: '#d69c3c', Y: '#ffda5b', K: '#2c1d08', z: '#ffe899', y: '#e5c083', x: '#796b57' });

  P.define('magmaHound', [
    '.......KRRK..........KRRK.......',
    '.......KRRRK.........KRRRK......',
    '.....KKzRRRK........KzRRRKK.....',
    '....KzzzzRRRKKKKKKKKzRRRRRRK....',
    '...KKzzzzzzzzzRRRRRRRRRRRRRKK...',
    '..KzzzzzzzzzzzRRRRRRRRRRRRRRRK..',
    '..KzzzzzzzzzzzRRRRRRRRRRRRRRRK..',
    '.KzzzzzzzzzzzzzRRRRRRRRRRRRRRRK.',
    '.KzzRRRRyyOOzzzzRRRRyyOOzzRRRRK.',
    '.KzzRRRRyyOOzzzzRRRRyyOOzzRRRRK.',
    '.KzzzzzzzzzzzzzRRRRRRRRRRRRRRRK.',
    '.KzzzzzzzzzzzzRRRRRRRRRRRRRRRRK.',
    '.KzzzzzRRRxxxxYYYYYYYYzzzRRRRRK.',
    '.KzzzzRRRRxxxxYYYYYYYYzzzzRRRRK.',
    '.KzzzzRRRRYYKKKKYYKKYYzzzzRRRRK.',
    '.KzzzzRRRRYYKKKKYYKKYYzzzzRRRRK.',
    '.KzzzzRRRRxxxxYYYYYYYYzzzzRRRRK.',
    '.KzzzzzRRRxxxxYYYYYYYYzzzRRRRRK.',
    '.KzzzzzzzzzzzzRRRRRRRRRRRRRRRRK.',
    '..KzzzzzzzzzzzRRRRRRRRRRRRRRRK..',
    '..KzzzzzzzzzzzRRRRRRRRRRRRRRRK..',
    '...KKzzzzzzzzRRRRRRRRRRRRRRKK...',
    '....KzzzzzzRRRRKKKzzzRRRRRRK....',
    '.....KzzzRRRRKK...KzzzzRRRK.....',
    '.....KzzzRRKK......KKzzRRRK.....',
    '.....KzzRRK..........KzzRRK.....',
    '.....KKKKKK..........KKKKKK.....',
    '.....KKKKKK..........KKKKKK.....'
  ], { R: '#651205', O: '#fe4f0b', Y: '#ffdb37', K: '#120602', z: '#a06055', y: '#fe8e62', x: '#ffe881' });

  P.define('cinderGolem', [
    '.....KKKKKKKKKKKKKKKK.....',
    '....KKKKKKKKKKKKKKKKKK....',
    '...KKKKKKKKKKKKKKKKKKK....',
    '..KKKKKKKKKKKKKKKKKKKKK...',
    '..KKKKKKKzzzOOOOOKKKKKK...',
    '.KKKKKKKzzzzOOOOOOOKKKKK..',
    '.KKKKKOOYYKKOOKKYYOOKKKKK.',
    '.KKKKKOOYYKKOOKKYYOOKKKKK.',
    '.KKKKKKKzzzzOOOOOOOKKKKK..',
    'KKKKKKKKKzzzOOOOOKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKzzOOKKzzOOKKOOKKKKKK',
    'KKKKKKzzOOKKzzOOKKOOKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKKKKKKKKKKKKKKKKKKKKK',
    'KKKKKKOOKKKKKKKKKKOOKKKKKK',
    'KKKKKKOOKKKKKKKKKKOOKKKKK.',
    'KKKKKKKKKKKKKKKKKKKKKKKKK.',
    '.KKKKKKKKKKKKKKKKKKKKKKK..',
    '..KKKKKKKKKKKKKKKKKKKKKK..',
    '...KKKKKKKKKKKKKKKKKKKK...',
    '...KKKKKKKKKKKKKKKKKKKK...',
    '...KKKKKK........KKKKKK...',
    '...KzzOOK........KzzOOK...',
    '...KzzOOK........KzzOOK...',
    '...KzzOOK........KzzOOK...',
    '...KzzOOK........KzzOOK...'
  ], { K: '#1c100b', O: '#fe4f0b', Y: '#ffdb37', z: '#fe8e62', y: '#ffe881' });

  P.define('lavaSerpent', SERPENT_GRID, { E: '#fe4f0b', K: '#120602', z: '#b96554', X: '#fe8e62' });

  P.define('pyroclastBat', [
    '...KRRK......KRRK......KRRK...',
    '...KRRRK.....KRRRK.....KRRRK..',
    '.KKzRRRK...KKzRRRKK...KzRRRKK.',
    'KzzzzRRRKKKzzRRRRRRKKKzRRRRRRK',
    'zzzzzzzzzzzzzRRRRRRRRRRRRRRRRR',
    'zzzzzzzzzzzzRRRRRRRRRRRRRRRRRR',
    'KzzzzzzzzzzzRRRRRRRRRRRRRRRRRK',
    '.KKzzzzzzzzzzRRRRRRRRRRRRRRKK.',
    '...KKzzzzzzzzRRRRRRRRRRRRKK...',
    '.....KzzzzzzzzRRRRRRRRRRK.....',
    '.....KzzRRRRyyXXzzzzRRRRK.....',
    '.....KzzRRRRyyXXzzzzRRRRK.....',
    '.....KzzzzzzzzRRRRRRRRRRK.....',
    '......KzzzzzzRRRRRRRRRRK......',
    '......KzzzzRRRRKzRRRRRRK......',
    '.......KzzRRRKK.KzRRRRK.......',
    '.......KKKKKK....KKKKKK.......',
    '.......KKKKKK....KKKKKK.......'
  ], { R: '#781a08', X: '#ffdb37', K: '#120402', z: '#ad6558', y: '#ffe881' });

  P.define('coreWarden', [
    '.....KzzzzzzOOOOOOOOK.....',
    '....KzzzzzzzOOOOOOOOOK....',
    '...KKzzzzzzzOOOOOOOOOK....',
    '..KzzzzzzzzzOOOOOOOOOOK...',
    '..KzzOOOKKKKKKKKKKzOOOK...',
    '.KzzOOOKKKKKKKKKKKKzzOOK..',
    '.KzzOOKKYYzzOOOOYYKKzzOOK.',
    '.KzzOOKKYYzzOOOOYYKKzzOOK.',
    '.KzzOOOKKKKKKKKKKKKzzOKK..',
    'KzzzzOOOKKKKKKKKKKzOOOKKKK',
    'zzzzzzzzzzOOOOOOOOOOOOOOOO',
    'zzzzzzzzzzOOOOOOOOOOOOOOOO',
    'zzOOOOxxxxxxRRRRRRRRzzOOOO',
    'zzOOOOxxxxxxRRRRRRRRzzOOOO',
    'zzzzzzzzzzOOOOOOOOOOOOOOOO',
    'zzzzzzzzzzzOOOOOOOOOOOOOOO',
    'zzOOOOYYzzzzOOOOOOYYzzOOOK',
    'zzOOOOYYzzzzOOOOOOYYzzOOK.',
    'KzzzzzzzzzOOOOOOOOOOOOOOK.',
    '.KKzzzzzzzOOOOOOOOOOOOOK..',
    '..KzzzzzzzzOOOOOOOOOOOOK..',
    '...KzzzzzzzzOOOOOOOOOOK...',
    '...KzzzOKKKKKKKKKKzOOOK...',
    '...KzzOOK........KzzOOK...',
    '...KxxRRK........KxxRRK...',
    '...KxxRRK........KxxRRK...',
    '...KxxRRK........KxxRRK...',
    '...KxxRRK........KxxRRK...'
  ], { O: '#8c260b', R: '#fe4f0b', Y: '#ffdb37', K: '#110603', z: '#b86e5b', y: '#ffe881', x: '#fe8e62' });

  P.define('gearSentinel', [
    '.....KMMYYMMK....KMMYYMMK.....',
    '.....KMMYYMMK....KMMYYMMMK....',
    '....KzzMMMMMK....KzzzzMMMK....',
    '...KzzzzzMMMMKKKKKzzzMMMMMK...',
    '...KzzzzzzzMMMMMMMMMMMMMMMK...',
    '..KzzzzzzzzzMMMMMMMMMMMMMMMK..',
    '.KKzzMMMxxxxxxDDDDDDDDzMMMMKK.',
    'KzzzMMMMxxxxxxDDDDDDDDzzzMMMMK',
    'zzzzMMMMxxxxxxDDDDDDDDzzzzMMMM',
    'zzzzMMMMMxxxxxDDDDDDDzzzzzMMMM',
    'zzzzMMMMMMMMRRMMRRzzzzMMMMMMMM',
    'zzzzzMMMMMMMRRMMRRzzzzMMMMMMMM',
    'KzzzzMMMMMMxxxDDDDDzzzzzMMMMMK',
    '.KKzzzzMMMxxxxDDDDDDzzzzMMMKK.',
    '..KzzzzzzzzzMMMMMMMMMMMMMMMK..',
    '...KzzzzzzzzzMMMMMMMMMMMMMK...',
    '...KzzzMKzzzzMMMMMMMMKzMMMK...',
    '...KzzMMKKKzzzMMMMMKKKzzMMK...',
    '...KzzMMK..KKKKKKKK..KzzMMK...',
    '...KzzMMK............KzzMMK...',
    '...KzzMMK............KzzMMK...',
    '...KzzMMK............KzzMMK...',
    '..KxDDDDK............KxxDDDK..',
    '.KxxDDDDK............KxxDDDDK.'
  ], { M: '#8b8b97', D: '#3e3e4a', R: '#fb4f29', K: '#111116', Y: '#ffdb37', z: '#b5b5bd', y: '#ffe881', x: '#818189', w: '#fc8f77' });

  P.define('sparkHound', [
    '.......KDDK..........KDDK.......',
    '.......KDDDK.........KDDDK......',
    '.....KKzDDDK........KzDDDKK.....',
    '....KzzzzDDDKKKKKKKKzDDDDDDK....',
    '...KKzzzzzzzzzDDDDDDDDDDDDDKK...',
    '..KzzzzzzzzzzzDDDDDDDDDDDDDDDK..',
    '..KzzzzzzzzzzzDDDDDDDDDDDDDDDK..',
    '.KzzzzzzzzzzzzzDDDDDDDDDDDDDDDK.',
    '.KzzDDDDYYYYzzzzDDDDYYYYzzDDDDK.',
    '.KzzDDDDYYYYzzzzDDDDYYYYzzDDDDK.',
    '.KzzzzzzzzzzzzzDDDDDDDDDDDDDDDK.',
    '.KzzzzzzzzzzzzDDDDDDDDDDDDDDDDK.',
    '.KzzzzzDDDYYYYYYYYYYYYzzzDDDDDK.',
    '.KzzzzDDDDYYYYYYYYYYYYzzzzDDDDK.',
    '.KzzzzDDDDYYKKKKYYKKYYzzzzDDDDK.',
    '.KzzzzDDDDYYKKKKYYKKYYzzzzDDDDK.',
    '.KzzzzDDDDYYYYYYYYYYYYzzzzDDDDK.',
    '.KzzzzzDDDYYYYYYYYYYYYzzzDDDDDK.',
    '.KzzzzzzzzzzzzDDDDDDDDDDDDDDDDK.',
    '..KzzzzzzzzzzzDDDDDDDDDDDDDDDK..',
    '..KzzzzzzzzzzzDDDDDDDDDDDDDDDK..',
    '...KKzzzzzzzzDDDDDDDDDDDDDDKK...',
    '....KzzzzzzDDDDKKKzzzDDDDDDK....',
    '.....KzzzzDDDKK...KzzzDDDDK.....',
    '.....KYYYYKKK......KKKYYYYK.....',
    '.....KYYYYK..........KYYYYK.....',
    '.....KKKKKK..........KKKKKK.....',
    '.....KKKKKK..........KKKKKK.....'
  ], { D: '#323853', Y: '#ffed49', K: '#07080d', z: '#777c90' });

  P.define('pistonGolem', [
    '.....KzzzzzzRRRRRRRRK.....',
    '....KzzzzzzzRRRRRRRRRK....',
    '...KKzzzzzzzRRRRRRRRRK....',
    '..KzzzzzzzzzRRRRRRRRRRK...',
    '..KzzRRRKKKKKKKKKKzRRRK...',
    '.KzzRRRKKKKKKKKKKKKzzRRK..',
    '.KzzRRKKYYRRKKRRYYKKzzRRK.',
    '.KzzRRKKYYRRKKRRYYKKzzRRK.',
    '.KzzRRRKKKKKKKKKKKKzzRKK..',
    'KzzzzRRRKKKKKKKKKKzRRRKKKK',
    'zzzzzzzzzzRRRRRRRRRRRRRRRR',
    'zzzzzzzzzzzRRRRRRRRRRRRRRR',
    'zzzRRRxxMzzRRRRRRxMMzRRRRR',
    'zzRRRRxxMMzzRRRRxxMMzzRRRR',
    'zzRRRRxxMMzzRRRRxxMMzzRRRR',
    'zzzRRRxxMzzRRRRRRxMMzRRRRR',
    'zzzzzzzzzzzRRRRRRRRRRRRRRR',
    'zzzzzzzzzzRRRRRRRRRRRRRRRR',
    'KzzzzzzzzzRRRRRRRRRRRRRRRK',
    '.KKzzzzzzzzRRRRRRRRRRRRKK.',
    '..KzzzzzzzzRRRRRRRRRRRRK..',
    '...KzzzzzzzzRRRRRRRRRRK...',
    '...KzzzRKKKKKKKKKKzRRRK...',
    '...KzzRRK........KzzRRK...',
    '...KxxMMK........KxxMMK...',
    '...KxxMMK........KxxMMK...',
    '...KxxMMK........KxxMMK...',
    '...KxxMMK........KxxMMK...'
  ], { R: '#555e6f', M: '#8a96ae', Y: '#fb4f29', K: '#0c0e12', z: '#9096a2', y: '#fc8f77', x: '#b5bdcc' });

  P.define('rotorWraith', [
    '...........KDDK...........',
    '...........KDDDK..........',
    '..........KzDDDK..........',
    'K........KzzDDDDK........K',
    'WKK......KzzDDDDK.......KW',
    'WWWK....KzzzDDDDDK.....KWW',
    'yWWKK...KzzzDDDDDK...KKyWW',
    'yyyWWKKKzzzzDDDDDDKKKyyWWW',
    'yyyWWWWWzzzzDDDDDDyyyyyWWW',
    'yyyyWWWWzzzzDDDDDDyyyWWWWW',
    'KyyyWWWWzzzzDDDDDDyyyWWWWK',
    '.KKyWWWzzzzDDDDDDDDyWWWKK.',
    '...KKKzzDDDDKKzzDDDDKKK...',
    '.....KzzDDDDKKzzDDDDK.....',
    '.....KzzzzzzDDDDDDDDK.....',
    '......KzzzzzDDDDDDDK......',
    '......KzzzzDDKzDDDDK......',
    '.......KzzDDKKzzDDK.......',
    '.......KKKKKKKKKKKK.......',
    '.......KKKKKKKKKKKK.......'
  ], { W: '#d2dae5', D: '#434f66', K: '#0c0e12', z: '#848c9c', y: '#e7ebf1' });

  P.define('grandAutomaton', [
    '...KMMYYMMK....KMMYYMMK...',
    '...KMMYYMMMK...KMMYYMMMK..',
    '..KzzMMMMMMKK.KzzzMMMMMK..',
    '.KzzzzzMMMMMMKzzzzMMMMMMK.',
    '.KzzzzzzzMMMMMMMMMMMMMMMK.',
    'KzzzzzzzzzMMMMMMMMMMMMMMMK',
    'zzzMMMxxxxxxDDDDDDDDzMMMMM',
    'zzMMMMxxxxxxDDDDDDDDzzMMMM',
    'zzMMMMxxxxxxDDDDDDDDzzMMMM',
    'zzzMMMMxxxxxDDDDDDDzzzMMMM',
    'zzzMMMMMRRMMRRMMRRzzzzMMMM',
    'zzzzMMMMRRMMRRMMRRzzzMMMMM',
    'KKzzMMMMxxxxDDDDDDzzzMMMKK',
    'KKzzzMMMxxxxDDDDDDzMMMMMKK',
    'zzzzzzzzzzMMMMMMMMMMMMMMMM',
    'zzzzzzzzzzzMMMMMMMMMMMMMMM',
    'zzzzzMMMKzzMMMMMMKzzzMMMMM',
    'zzzzMMMMKKKzMMMKKKzzzzMMMM',
    'zzzzMMMMK..KKKK..KzzzzMMMM',
    'zzzzMMMMK........KzzzzMMMM',
    'zzzzMMMMK........KzzzzMMMM',
    'zzzzMMMMK........KzzzzMMMM',
    'KKxxDDDDK........KxxDDDDKK',
    '.KxxDDDDK........KxxDDDDK.',
    '.KxxDDDDK........KxxDDDDK.',
    '.KxxDDDDK........KxxDDDDK.'
  ], { M: '#9d9dad', D: '#434353', R: '#fb4f29', K: '#12121a', Y: '#ffdb37', z: '#c1c1cc', y: '#ffe881', x: '#84848f', w: '#fc8f77' });

  P.define('fungalStalker', [
    '.......KNNK..........KNNK.......',
    '.......KNNNK.........KNNNK......',
    '.....KKzNNNK........KzNNNKK.....',
    '....KzzzzNNNKKKKKKKKzNNNNNNK....',
    '...KKzzzzzzzzzNNNNNNNNNNNNNKK...',
    '..KzzzzzzzzzzzNNNNNNNNNNNNNNNK..',
    '..KzzzzzzzzzzzNNNNNNNNNNNNNNNK..',
    '.KzzzzzzzzzzzzzNNNNNNNNNNNNNNNK.',
    '.KzzNNNNyyMMzzzzNNNNyyMMzzNNNNK.',
    '.KzzNNNNyyMMzzzzNNNNyyMMzzNNNNK.',
    '.KzzzzzzzzzzzzzNNNNNNNNNNNNNNNK.',
    '.KzzzzzzzzzzzzNNNNNNNNNNNNNNNNK.',
    '.KzzzzzNNNxxxxGGGGGGGGzzzNNNNNK.',
    '.KzzzzNNNNxxxxGGGGGGGGzzzzNNNNK.',
    '.KzzzzNNNNGGKKKKGGKKGGzzzzNNNNK.',
    '.KzzzzNNNNGGKKKKGGKKGGzzzzNNNNK.',
    '.KzzzzNNNNxxxxGGGGGGGGzzzzNNNNK.',
    '.KzzzzzNNNxxxxGGGGGGGGzzzNNNNNK.',
    '.KzzzzzzzzzzzzNNNNNNNNNNNNNNNNK.',
    '..KzzzzzzzzzzzNNNNNNNNNNNNNNNK..',
    '..KzzzzzzzzzzzNNNNNNNNNNNNNNNK..',
    '...KKzzzzzzzzNNNNNNNNNNNNNNKK...',
    '....KzzzzzzNNNNKKKzzzNNNNNNK....',
    '.....KzzzNNNNKK...KzzzzNNNK.....',
    '.....KzzzNNKK......KKzzNNNK.....',
    '.....KzzNNK..........KzzNNK.....',
    '.....KKKKKK..........KKKKKK.....',
    '.....KKKKKK..........KKKKKK.....'
  ], { N: '#435521', G: '#8dbb33', M: '#d1ec80', K: '#0b1004', z: '#85926a', y: '#e3f3b1', x: '#b5d37b' });

  P.define('thornWraith', [
    '.........KNNKKNNK.........',
    '.........KNNKKNNNK........',
    '.......KKzzNNNNNNKK.......',
    '......KzzzzzNNNNNNNK......',
    '......KzzzzzNNNNNNNK......',
    '.....KzzzzzzNNNNNNNNK.....',
    '.....KNNMMzzNNNNMMNNK.....',
    '.....KNNMMzzNNNNMMNNNK....',
    '...KKzzzzzzzNNNNNNNNNKK...',
    '..KzzzzzzzzNNNNNNNNNNNNK..',
    '..KzzzzzzzNNNNNNNNNNNNNK..',
    '.KzzzzzzzzNNNNNNNNNNNNNNK.',
    '.KzzzNKzzzzNNNNNNNNKzzNNK.',
    '..KzNNKKzzzzNNNNNNKKzzNK..',
    '...KNNKKGGKKGGKKGGKKNNNK..',
    '...KNNKGGGKKGGKKGGGKNNK...',
    '...KNNGKGK..KK..KGKGNNK...',
    '....KNNGK........KGNNK....',
    '....KNNNK........KNNNK....',
    '.....KNNK........KNNK.....',
    '.....KNNK........KNNK.....',
    '.....KNNK........KNNK.....',
    '....KGNNK........KNNGK....',
    '...KGGNNK........KNNGGK...'
  ], { N: '#314219', M: '#f3af28', G: '#688d29', K: '#0a1005', z: '#788665', y: '#f7cc77', x: '#9eb772' });

  P.define('sporeBat', [
    '...KNNK......KNNK......KNNK...',
    '...KNNNK.....KNNNK.....KNNNK..',
    '.KKzNNNK...KKzNNNKK...KzNNNKK.',
    'KzzzzNNNKKKzzNNNNNNKKKzNNNNNNK',
    'zzzzzzzzzzzzzNNNNNNNNNNNNNNNNN',
    'zzzzzzzzzzzzNNNNNNNNNNNNNNNNNN',
    'KzzzzzzzzzzzNNNNNNNNNNNNNNNNNK',
    '.KKzzzzzzzzzzNNNNNNNNNNNNNNKK.',
    '...KKzzzzzzzzNNNNNNNNNNNNKK...',
    '.....KzzzzzzzzNNNNNNNNNNK.....',
    '.....KzzNNNNyyGGzzzzNNNNK.....',
    '.....KzzNNNNyyGGzzzzNNNNK.....',
    '.....KzzzzzzzzNNNNNNNNNNK.....',
    '......KzzzzzzNNNNNNNNNNK......',
    '......KzzzzNNNNKzNNNNNNK......',
    '.......KzzNNNKK.KzNNNNK.......',
    '.......KyyGGK....KyyGGK.......',
    '.......KyyGGK....KyyGGK.......'
  ], { N: '#314219', G: '#8dbb33', K: '#0b1004', z: '#788665', y: '#b5d37b' });

  P.define('rootboundGolem', [
    '.....KzzzzzzNNNNNNNNK.....',
    '....KzzzzzzzNNNNNNNNNK....',
    '...KKzzzzzzzNNNNNNNNNK....',
    '..KzzzzzzzzzNNNNNNNNNNK...',
    '..KzzNNNyyyyGGGGGGzNNNK...',
    '.KzzNNNNyyyyGGGGGGGzzNNK..',
    '.KzzNNGGMMNNGGNNMMGGzzNNK.',
    '.KzzNNGGMMNNGGNNMMGGzzNNK.',
    '.KzzNNNNyyyyGGGGGGGzzNKK..',
    'KzzzzNNNyyyyGGGGGGzNNNKKKK',
    'zzzzzzzzzzNNNNNNNNNNNNNNNN',
    'zzzzzzzzzzNNNNNNNNNNNNNNNN',
    'zzNNNNyyGGNNyyGGNNGGzzNNNN',
    'zzNNNNyyGGNNyyGGNNGGzzNNNN',
    'zzzzzzzzzzNNNNNNNNNNNNNNNN',
    'zzzzzzzzzzzNNNNNNNNNNNNNNN',
    'zzNNNNGGzzzzNNNNNNGGzzNNNK',
    'zzNNNNGGzzzzNNNNNNGGzzNNK.',
    'KzzzzzzzzzNNNNNNNNNNNNNNK.',
    '.KKzzzzzzzNNNNNNNNNNNNNK..',
    '..KzzzzzzzzNNNNNNNNNNNNK..',
    '...KzzzzzzzzNNNNNNNNNNK...',
    '...KzzzNKKKKKKKKKKzNNNK...',
    '...KzzNNK........KzzNNK...',
    '...KyyGGK........KyyGGK...',
    '...KyyGGK........KyyGGK...',
    '...KyyGGK........KyyGGK...',
    '...KyyGGK........KyyGGK...'
  ], { N: '#314219', G: '#688d29', M: '#d1ec80', K: '#091104', z: '#788665', y: '#9eb772', x: '#e3f3b1' });

  P.define('blightHeart', [
    '.........KMMKKMMK.........',
    '.........KMMKKMMMK........',
    '........KzzMMMMMMK........',
    '.......KzzzzMMMMMMK.......',
    '.....KKyyyyyNNNNNNNKK.....',
    '....KyyyyyyyNNNNNNNNNK....',
    '...KKyyyyyyyNNNNNNNNNKK...',
    '..KyyyyyyyyyNNNNNNNNNNNK..',
    '..KyyyyNNNxxRRRRyyyNNNNK..',
    '.KyyyNNNNxxRRRRRRyyyNNNNK.',
    '.KyyNNNNxxRRKKxxRRyyNNNNK.',
    '.KyyNNNNxxRRKKxxRRyyNNNNK.',
    '.KyyyNNNNxxRRRRRRyyyNNNNK.',
    '..KyyyyNNNxxRRRRyyyNNNNK..',
    '..KyyyyyyyyyNNNNNNNNNNNK..',
    '...KyyyyyyyyNNNNNNNNNNK...',
    '...KGyyyyyyyNNNNNNNNNGK...',
    '....KGGyyyyyNNNNNNNGGK....',
    '....KGGGKKKKKKKKKKGGGK....',
    '.....KGGK........KGGK.....',
    '.....KGGK........KGGK.....',
    '.....KGGK........KGGGK....',
    '....KwGGK........KwGGK....',
    '...KwwGGK........KwwGGK...'
  ], { N: '#311f40', R: '#a01a40', M: '#cc4f89', G: '#563166', K: '#0b050f', z: '#de8eb4', y: '#786a84', x: '#c46882', w: '#91779c' });

  P.define('frostSpawn', [
    '.......................KzzBBK...',
    '......................KzzBBK....',
    '.....................KKzzBBK....',
    '....................KzzBBKK.....',
    '...................KKzzBBK......',
    '..................KzzBBKK.......',
    '.................KKzzBBK........',
    '................KzzBBKK.........',
    '...............KKzzBBK..........',
    '..............KzzBBKK...........',
    '.............KKzzBBK............',
    '............KzzBBKK.............',
    '...........KKzzBBK..............',
    '..........KzzBBKK...............',
    '.........KKzzBBK................',
    '........KzzBBKK.................',
    '.......KKzzBBK..................',
    '......KzzBBKK...................',
    '......KzzBBK....................',
    '.....KzzBBK.....................',
    '....KWzzBBWK....................',
    '...KWWzzBBWWK...................'
  ], { B: '#2f6895', W: '#e0f6ff', K: '#061420', z: '#769dbc' });

  P.define('glacialWraith', [
    '.........KWWKKWWK.........',
    '.........KWWKKWWWK........',
    '.......KKzzWWWWWWKK.......',
    '......KzzzzzWWWWWWWK......',
    '......KzzzzzWWWWWWWK......',
    '.....KzzzzzzWWWWWWWWK.....',
    '.....KWWXXzzWWWWXXWWK.....',
    '.....KWWXXzzWWWWXXWWWK....',
    '...KKzzzzzzzWWWWWWWWWKK...',
    '..KzzzzzzzzWWWWWWWWWWWWK..',
    '..KzzzzzzzWWWWWWWWWWWWWK..',
    '.KzzzzzzzzWWWWWWWWWWWWWWK.',
    '.KzzzWKzzzzWWWWWWWWKzzWWK.',
    '..KzWWKKKzzzWWWWWKKKzzWK..',
    '...KWWK..KKKKKKKK..KWWWK..',
    '...KWWWK...........KWWK...',
    '...KzWWKK........KKzWWK...',
    '....KzzWWK......KzzWWK....',
    '....KzzWWK......KzzWWK....',
    '.....KKzWWK.KK.KzWWKK.....',
    '.......KWWKKWWKKWWWK......',
    '.......KWWKKWWKKWWK.......'
  ], { W: '#78b6e4', X: '#e0f6ff', K: '#062133', z: '#acd1ee' });

  P.define('rimeGolem', [
    '.....KzzzzzzWWWWWWWWK.....',
    '....KzzzzzzzWWWWWWWWWK....',
    '...KKzzzzzzzWWWWWWWWWK....',
    '..KzzzzzzzzzWWWWWWWWWWK...',
    '..KzzWWWyyyyBBBBBBzWWWK...',
    '.KzzWWWWyyyyBBBBBBBzzWWK..',
    '.KzzWWBBKKWWBBWWKKBBzzWWK.',
    '.KzzWWBBKKWWBBWWKKBBzzWWK.',
    '.KzzWWWWyyyyBBBBBBBzzWKK..',
    'KzzzzWWWyyyyBBBBBBzWWWKKKK',
    'zzzzzzzzzzWWWWWWWWWWWWWWWW',
    'zzzzzzzzzzWWWWWWWWWWWWWWWW',
    'zzWWWWyyBBWWyyBBWWBBzzWWWW',
    'zzWWWWyyBBWWyyBBWWBBzzWWWW',
    'zzzzzzzzzzWWWWWWWWWWWWWWWW',
    'zzzzzzzzzzzWWWWWWWWWWWWWWW',
    'zzWWWWBBzzzzWWWWWWBBzzWWWK',
    'zzWWWWBBzzzzWWWWWWBBzzWWK.',
    'KzzzzzzzzzWWWWWWWWWWWWWWK.',
    '.KKzzzzzzzWWWWWWWWWWWWWK..',
    '..KzzzzzzzzWWWWWWWWWWWWK..',
    '...KzzzzzzzzWWWWWWWWWWK...',
    '...KzzzWKKKKKKKKKKzWWWK...',
    '...KzzWWK........KzzWWK...',
    '...KyyBBK........KyyBBK...',
    '...KyyBBK........KyyBBK...',
    '...KyyBBK........KyyBBK...',
    '...KyyBBK........KyyBBK...'
  ], { W: '#b1e1f9', B: '#2f6895', K: '#061420', z: '#d3eefc', y: '#769dbc' });

  P.define('frozenHarpy', [
    '.............KWWK.............',
    '............KWWWWK............',
    '............KWWWWK............',
    '...........KWWWWWWK...........',
    '..........KKWWWWWWKK..........',
    'K........KKWWWWWWWWKK........K',
    'WKK......KWWWWWWWWWWK......KKW',
    'WWWK....KWWWWWWWWWWWWK....KWWW',
    'WWWKK..KKWWWWWWWWWWWWKK..KKWWW',
    'WWWWWKKWWWWWWWWWWWWWWWWKKWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'KWWWWWWWWWWWWWWWWWWWWWWWWWWWWK',
    '.KKWWWWWWWWWWWWWWWWWWWWWWWWKK.',
    '...KKWWWWWWWWWWWWWWWWWWWWKK...',
    '.....KWWWWWWWWWWWWWWWWWWK.....',
    '.....KWWWWWWWWBBWWWWWWWWK.....',
    '......KWWWWWWWBBWWWWWWWK......',
    '......KWWWWWWWWWWWWWWWWK......',
    '.......KKWWWWWWWWWWWWKK.......',
    '........KWWWWWKKWWWWWK........',
    '.........KWWWWKKWWWWK.........',
    '.........KzzBBKKzzBBK.........',
    '.........KzzBBKKzzBBK.........'
  ], { W: '#d9f2fe', B: '#2f6895', K: '#061420', z: '#769dbc' });

  P.define('frostSovereign', [
    '.......KWWK..KWWK..KWWK.......',
    '.......KWWKKKKWWWKKWWWWK......',
    '.....KKzzzzzzzWWWWWWWWWKK.....',
    '....KzzzzzzzzWWWWWWWWWWWWK....',
    '...KKzzzzzzzzWWWWWWWWWWWWKK...',
    '..KzzzzzzzzzWWWWWWWWWWWWWWWK..',
    '..KzzWWWyyyyyyBBBBBBBBzWWWWK..',
    '.KzzWWWWyyyyyyBBBBBBBBBzzWWWK.',
    '.KzzWWBBKKzzWWBBzzWWKKBBzzWWK.',
    '.KzzWWBBKKzzWWBBzzWWKKBBzzWWK.',
    '.KzzWWWWyyyyyyBBBBBBBBBzzWWWK.',
    'KzzzzWWWyyyyyyBBBBBBBBzWWWWWWK',
    'zzzzzzzzzzzzWWWWWWWWWWWWWWWWWW',
    'zzzzzzzzzzzzWWWWWWWWWWWWWWWWWW',
    'zzWWWWyyyyyyyyBBBBBBBBBBzzWWWW',
    'zzWWWWyyyyyyyyBBBBBBBBBBzzWWWW',
    'zzzzzzzzzzzzWWWWWWWWWWWWWWWWWW',
    'zzzzzzzzzzzzWWWWWWWWWWWWWWWWWW',
    'KzzzzzzzzzzzWWWWWWWWWWWWWWWWWK',
    '.KzzzzzzzzzzWWWWWWWWWWWWWWWWK.',
    '.KzzzzzzzzzzWWWWWWWWWWWWWWWWK.',
    '..KzzzzzzzzWWWWWWWWWWWWWWWWK..',
    '..KzzzzzzWWWWKKKKKzzzWWWWWWK..',
    '...KzzzWWWWKK.....KzzzzWWWK...',
    '...KzzzWWKK........KKzzWWWK...',
    '...KzzWWK............KzzWWK...',
    '...KzzWWK............KzzWWK...',
    '...KzzWWK............KzzWWK...',
    '..KyBBBBK............KyyBBBK..',
    '.KyyBBBBK............KyyBBBBK.'
  ], { W: '#b1e1f9', B: '#1f5681', K: '#03101a', z: '#d3eefc', y: '#6991b0' });

  P.define('starWisp', [
    '...........KPPK.............',
    '...........KPPPK............',
    '..........KzPPPKK...........',
    '........KKzzPPPPPK..........',
    '.......KPPLLPPLLPPK.........',
    '......KPPPLLPPLLPPPK........',
    '.....KPPPKKKPPKKKPPPK.......',
    '....KPPPK..KPPK..KPPPK......',
    '...KPPPK...KPPK...KPPPK.....',
    '..KPPPK....KPPK....KPPPK....',
    '.KPPKK.....KKKK.....KKPPK...',
    '.KPPKK.....KKKK.....KKPPK...',
    '..KPPPK...KzPPPK...KPPPK....',
    '...KPPKKKKzzPPPPKKKPPPK.....',
    '....KKzzPPLLLLLLzzPPKK......',
    '....KKzzPPLLLLLLzzPPKK......',
    '...KPPKKKKzzPPPPKKKPPPK.....',
    '..KPPPK...KzPPPK...KPPPK....',
    '.KPPKK.....KKKK.....KKPPK...',
    '.KPPKK.....KKKK.....KKPPK...',
    '..KPPPK....KPPK....KPPPK....',
    '...KPPPK...KPPK...KPPPK.....',
    '....KPPPK..KPPK..KPPPK......',
    '.....KPPK..KPPK..KPPK.......'
  ], { P: '#9d6df6', L: '#ede0ff', K: '#110821', z: '#c2a5f9' });

  P.define('voidSerpent', SERPENT_GRID, { E: '#551b94', K: '#090312', z: '#9168bd', X: '#c8a0ff' });

  P.define('nebulaGolem', [
    '.....KzzzzzzPPPPPPPPK.....',
    '....KzzzzzzzPPPPPPPPPK....',
    '...KKzzzzzzzPPPPPPPPPK....',
    '..KzzzzzzzzzPPPPPPPPPPK...',
    '..KzzPPPyyyyLLLLLLzPPPK...',
    '.KzzPPPPyyyyLLLLLLLzzPPK..',
    '.KzzPPLLKKPPLLPPKKLLzzPPK.',
    '.KzzPPLLKKPPLLPPKKLLzzPPK.',
    '.KzzPPPPyyyyLLLLLLLzzPKK..',
    'KzzzzPPPyyyyLLLLLLzPPPKKKK',
    'zzzzzzzzzzPPPPPPPPPPPPPPPP',
    'zzzzzzzzzzPPPPPPPPPPPPPPPP',
    'zzPPPPKKKKPPKKKKPPKKzzPPPP',
    'zzPPPPKKKKPPKKKKPPKKzzPPPP',
    'zzzzzzzzzzPPPPPPPPPPPPPPPP',
    'zzzzzzzzzzzPPPPPPPPPPPPPPP',
    'zzPPPPLLzzzzPPPPPPLLzzPPPK',
    'zzPPPPLLzzzzPPPPPPLLzzPPK.',
    'KzzzzzzzzzPPPPPPPPPPPPPPK.',
    '.KKzzzzzzzPPPPPPPPPPPPPK..',
    '..KzzzzzzzzPPPPPPPPPPPPK..',
    '...KzzzzzzzzPPPPPPPPPPK...',
    '...KzzzPKKKKKKKKKKzPPPK...',
    '...KzzPPK........KzzPPK...',
    '...KKKKKK........KKKKKK...',
    '...KKKKKK........KKKKKK...',
    '...KKKKKK........KKKKKK...',
    '...KKKKKK........KKKKKK...'
  ], { P: '#551b94', L: '#d1a1ff', K: '#090312', z: '#9168bd', y: '#e5caff' });

  P.define('astralWraith', [
    '.........KPPKKPPK.........',
    '.........KPPKKPPPK........',
    '.......KKzzPPPPPPKK.......',
    '......KzzzzzPPPPPPPK......',
    '......KzzzzzPPPPPPPK......',
    '.....KzzzzzzPPPPPPPPK.....',
    '.....KPPLLzzPPPPLLPPK.....',
    '.....KPPLLzzPPPPLLPPPK....',
    '...KKzzzzzzzPPPPPPPPPKK...',
    '..KzzzzzzzzPPPPPPPPPPPPK..',
    '..KzzzzzzzPPPPPPPPPPPPPK..',
    '.KzzzzzzzzPPPPPPPPPPPPPPK.',
    '.KzzzPKzzzzPPPPPPPPKzzPPK.',
    '..KzPPKKKzzzPPPPPKKKzzPK..',
    '...KPPK..KKKKKKKK..KPPPK..',
    '...KPPPK...........KPPK...',
    '...KzPPKK........KKzPPK...',
    '....KzzPPK......KzzPPK....',
    '....KzzPPK......KzzPPK....',
    '.....KKzPPK.KK.KzPPKK.....',
    '.......KPPKKPPKKPPPK......',
    '.......KPPKKPPKKPPK.......'
  ], { P: '#783ecd', L: '#ede0ff', K: '#0d051b', z: '#a984df' });

  P.define('riftWarden', [
    '.......KPPK..KPPK..KPPK.......',
    '.......KPPKKKKPPPKKPPPPK......',
    '.....KKzzzzzzzPPPPPPPPPKK.....',
    '....KzzzzzzzzPPPPPPPPPPPPK....',
    '...KKzzzzzzzzPPPPPPPPPPPPKK...',
    '..KzzzzzzzzzPPPPPPPPPPPPPPPK..',
    '..KzzPPPyyyyyyLLLLLLLLzPPPPK..',
    '.KzzPPPPyyyyyyLLLLLLLLLzzPPPK.',
    '.KzzPPLLKKzzPPLLzzPPKKLLzzPPK.',
    '.KzzPPLLKKzzPPLLzzPPKKLLzzPPK.',
    '.KzzPPPPyyyyyyLLLLLLLLLzzPPPK.',
    'KzzzzPPPyyyyyyLLLLLLLLzPPPPPPK',
    'zzzzzzzzzzzzPPPPPPPPPPPPPPPPPP',
    'zzzzzzzzzzzzPPPPPPPPPPPPPPPPPP',
    'zzPPPPyyyyyyyyLLLLLLLLLLzzPPPP',
    'zzPPPPyyyyyyyyLLLLLLLLLLzzPPPP',
    'zzzzzzzzzzzzPPPPPPPPPPPPPPPPPP',
    'zzzzzzzzzzzzPPPPPPPPPPPPPPPPPP',
    'KzzzzzzzzzzzPPPPPPPPPPPPPPPPPK',
    '.KzzzzzzzzzzPPPPPPPPPPPPPPPPK.',
    '.KzzzzzzzzzzPPPPPPPPPPPPPPPPK.',
    '..KzzzzzzzzPPPPPPPPPPPPPPPPK..',
    '..KzzzzzzPPPPKKKKKzzzPPPPPPK..',
    '...KzzzPPPPKK.....KzzzzPPPK...',
    '...KzzzPPKK........KKzzPPPK...',
    '...KzzPPK............KzzPPK...',
    '...KzzPPK............KzzPPK...',
    '...KzzPPK............KzzPPK...',
    '..KKKKKKK............KKKKKKK..',
    '.KKKKKKKK............KKKKKKKK.'
  ], { P: '#551b94', L: '#d1a1ff', K: '#090312', z: '#9168bd', y: '#e5caff' });

  P.define('chimericHound', [
    '.......KRRK..........KBBK.......',
    '.......KRRRK.........KBBBK......',
    '.....KKzRRRKK.......KyBBBKK.....',
    '....KzzzzRRRRKKKKKKKyyyBBBBK....',
    '...KKzzzzRRRRRRRRRRRyyyBBBBKK...',
    '..KzzzzzzzRRRRRRRRRRRyyyyBBBBK..',
    '..KzzzzzzzRRRRRRRRRRRRyyyBBBBK..',
    '.KzzzzzzzzRRRRRRRRRRRRyyyyBBBBK.',
    '.KzzRRRRxxOOzzzzRRRRyyBBxxOOBBK.',
    '.KzzRRRRxxOOzzzzRRRRyyBBxxOOBBK.',
    '.KzzzzzzzzRRRRRRRRRRRyyyyyBBBBK.',
    '.KzzzzzzzRRRRRRRRRRRRRyyyyBBBBK.',
    '.KzzzzzRRRRYYYYYYYYYYYyyyyBBBBK.',
    '.KzzzzRRRRYYYYYYYYYYYYyyyyBBBBK.',
    '.KzzzzRRRRYYKKKKYYKKYYyyyyBBBBK.',
    '.KzzzzRRRRYYKKKKYYKKYYyyyyBBBBK.',
    '.KzzzzRRRRYYYYYYYYYYYYyyyyBBBBK.',
    '.KzzzzzRRRRYYYYYYYYYYYyyyyBBBBK.',
    '.KzzzzzzzRRRRRRRRRRRRRyyyyBBBBK.',
    '..KzzzzzzzRRRRRRRRRRRyyyyBBBBK..',
    '..KzzzzzzzRRRRRRRRRRRyyyyBBBBK..',
    '...KKzzzzzRRRRRRRRRyyyyBBBBKK...',
    '....KzzzzzRRRRRKKKyyyyBBBBBK....',
    '.....KzzzRRRRKK...KyyyBBBBK.....',
    '.....KzzzRRKK......KKyyBBBK.....',
    '.....KzzRRK..........KyyBBK.....',
    '.....KKKKKK..........KKKKKK.....',
    '.....KKKKKK..........KKKKKK.....'
  ], { R: '#8d1313', B: '#1e2e8b', O: '#fe4f0b', Y: '#ffed49', K: '#100404', z: '#b86161', y: '#6975b6', x: '#fe8e62' });

  P.define('chaosGolem', [
    '.....KzzzzzzMMMMMMMMK.....',
    '....KzzzzzzzMMMMMMMMMK....',
    '...KKzzzzzzzMMMMMMMMMK....',
    '..KzzzzzzzzzMMMMMMMMMMK...',
    '..KzzMMMyyyyRRRRRRzMMMK...',
    '.KzzMMMMyyyyRRRRRRRzzMMK..',
    '.KzzMMRRYYMMRRMMYYRRzzMMK.',
    '.KzzMMRRYYMMRRMMYYRRzzMMK.',
    '.KzzMMMMyyyyRRRRRRRzzMKK..',
    'KzzzzMMMyyyyRRRRRRzMMMKKKK',
    'zzzzzzzzzzMMMMMMMMMMMMMMMM',
    'zzzzzzzzzzMMMMMMMMMMMMMMMM',
    'zzMMMMxxBBMMyyRRMMBBzzMMMM',
    'zzMMMMxxBBMMyyRRMMBBzzMMMM',
    'zzzzzzzzzzMMMMMMMMMMMMMMMM',
    'zzzzzzzzzzzMMMMMMMMMMMMMMM',
    'zzMMMMRRzzzzMMMMMMRRzzMMMK',
    'zzMMMMRRzzzzMMMMMMRRzzMMK.',
    'KzzzzzzzzzMMMMMMMMMMMMMMK.',
    '.KKzzzzzzzMMMMMMMMMMMMMK..',
    '..KzzzzzzzzMMMMMMMMMMMMK..',
    '...KzzzzzzzzMMMMMMMMMMK...',
    '...KzzzMKKKKKKKKKKzMMMK...',
    '...KzzMMK........KzzMMK...',
    '...KxxBBK........KyyRRK...',
    '...KxxBBK........KyyRRK...',
    '...KxxBBK........KyyRRK...',
    '...KxxBBK........KyyRRK...'
  ], { M: '#434353', R: '#d8282b', B: '#284fd8', Y: '#ffed49', K: '#09090e', z: '#84848f', y: '#e67677', x: '#768ee6' });

  P.define('discordWraith', [
    '.........KPPKKRRK.........',
    '........KPPPPKRRK.........',
    '........KPRRPPRRPKK.......',
    '.......KPPRRPPRRPPPK......',
    '......KzzzzzPPPPPPPK......',
    '.....KzzzzzzPPPPPPPPK.....',
    '.....KRRXXzzPPPPXXRRK.....',
    '.....KRRXXzzPPPPXXRRK.....',
    '....KzzzzzzzPPPPPPPPPKK...',
    '...KzzzzzzzzPPPPPPPPPPPK..',
    '..KPRzzzzzzzPPPPPPPPRRPK..',
    '.KPPPRzzzzzzPPPPPPPPRRPPK.',
    '.KzPPPKzzzzzPPPPPPPKzzPPK.',
    '..KzPPKKKzzzPPPPPKKKzPPK..',
    '...KPPK..KKKKKKKK..KPPPK..',
    '...KPPPK..........KPPPK...',
    '...KRPPKK.........KPPRK...',
    '....KRPPPK.......KPPRK....',
    '.....KzPPK......KzPPK.....',
    '......KzPPK.KK.KzzPK......',
    '.......KRRKKPPKKRRK.......',
    '.......KRRKKPPKKRRK.......'
  ], { P: '#561d6e', R: '#d8282b', X: '#f7c959', K: '#0c0411', z: '#9269a4', y: '#e67677', x: '#fadd98' });

  P.define('fluxSerpent', SERPENT_GRID, { E: '#284fd8', K: '#090b1d', z: '#768ee6', X: '#d8282b' });

  P.define('forgeMaster', [
    '.......KYYK..KYYK..KYYK.......',
    '.......KYYKKKKYYKKKKYYK.......',
    '.....KKzzzzzzzMMMMMMMMMKK.....',
    '....KzzzzzzzzMMMMMMMMMMMMK....',
    '...KKzzzzzzzzMMMMMMMMMMMMKK...',
    '..KzzzzzzzzzMMMMMMMMMMMMMMMK..',
    '..KzzMMMyyyyyyRRRRRRRRzMMMMK..',
    '.KzzMMMMyyyyyyRRRRRRRRRzzMMMK.',
    '.KzzMMRRYYzzMMRRzzMMYYRRzzMMK.',
    '.KzzMMRRYYzzMMRRzzMMYYRRzzMMK.',
    '.KzzMMMMyyyyyyRRRRRRRRRzzMMMK.',
    'KzzzzMMMyyyyyyRRRRRRRRzMMMMMMK',
    'zzzzzzzzzzzzMMMMMMMMMMMMMMMMMM',
    'zzzzzzzzzzzzMMMMMMMMMMMMMMMMMM',
    'zzMMMMxxBByyyyRRRRRRxxBBzzMMMM',
    'zzMMMMxxBByyyyRRRRRRxxBBzzMMMM',
    'zzzzzzzzzzzzMMMMMMMMMMMMMMMMMM',
    'zzzzzzzzzzzzMMMMMMMMMMMMMMMMMM',
    'KzzzzzzzzzzzMMMMMMMMMMMMMMMMMK',
    '.KzzzzzzzzzzMMMMMMMMMMMMMMMMK.',
    '.KzzzzzzzzzzMMMMMMMMMMMMMMMMK.',
    '..KzzzzzzzzMMMMMMMMMMMMMMMMK..',
    '..KzzzzzzMMMMKKKKKzzzMMMMMMK..',
    '...KzzzMMMMKK.....KzzzzMMMK...',
    '...KzzzMMKK........KKzzMMMK...',
    '...KzzMMK............KzzMMK...',
    '...KzzMMK............KzzMMK...',
    '...KzzMMK............KzzMMK...',
    '..KyRRRRK............KyyRRRK..',
    '.KyyRRRRK............KyyRRRRK.'
  ], { M: '#555566', R: '#d8282b', B: '#284fd8', Y: '#ffed49', K: '#09090e', z: '#91919b', y: '#e67677', x: '#768ee6' });

  P.define('twilightSeraph', [
    '...........KYYKKYYK...........',
    '..........KYYYKKYYYK..........',
    '..........KYYYYYYYYK..........',
    'K........KYYYYYYYYYYK........K',
    'WKK......KYYLLKKLLYYK.......KW',
    'WWWK.....KYYLLKKLLYYK......KWW',
    'zWWKK....KYYYYYYYYYYK....KKzWW',
    'zzWWWK...KYYYYYYYYYYK...KzzWWW',
    'zzWWWKK..KYYYYYYYYYYK..KKzzWWW',
    'zzzWWWWKKKYYYYYYYYYYKKKzzWWWWW',
    'zzzWWWWWWWYYYYYYYYYYzzzzzWWWWW',
    'zzzzzWWWWWYYYYYYYYYYzzzzWWWWWW',
    'KzzzzWWWWWYYYYYYYYYYzzzzWWWWWK',
    '.KKzzzzWWWYYYYYYYYYYzzzWWWWKK.',
    '...KKzzWWWYYYYYYYYYYzzzWWKK...',
    '.....KKzWWYYYYYYYYYYzzWKK.....',
    '.......KKKYYYYKKYYYYKKK.......',
    '.........KYYYYKKYYYYK.........',
    '.........KYYYYKKYYYYK.........',
    '.........KYYYYKKYYYYK.........',
    '........KyKKKKKKyyKKKK........',
    '.......KyyKKKKKKyyKKKKK.......'
  ], { Y: '#f4e28a', W: '#d3c4f8', L: '#fff8e0', K: '#271f52', z: '#e8e0fc', y: '#6f6990' });

  P.define('chronoGolem', [
    '.....KzzzzzzVVVVVVVVK.....',
    '....KzzzzzzzVVVVVVVVVK....',
    '...KKzzzzzzzVVVVVVVVVK....',
    '..KzzzzzzzzzVVVVVVVVVVK...',
    '..KzzVVVYYYYYYYYYYzVVVK...',
    '.KzzVVVYYYYYYYYYYYYzzVVK..',
    '.KzzVVYYKKVVYYVVKKYYzzVVK.',
    '.KzzVVYYKKVVYYVVKKYYzzVVK.',
    '.KzzVVVYYYYYYYYYYYYzzVKK..',
    'KzzzzVVVYYYYYYYYYYzVVVKKKK',
    'zzzzzzzzzzVVVVVVVVVVVVVVVV',
    'zzzzzzzzzzVVVVVVVVVVVVVVVV',
    'zzVVVVyyGGVVYYYYVVGGzzVVVV',
    'zzVVVVyyGGVVYYYYVVGGzzVVVV',
    'zzzzzzzzzzVVVVVVVVVVVVVVVV',
    'zzzzzzzzzzzVVVVVVVVVVVVVVV',
    'zzVVVVYYzzzzVVVVVVYYzzVVVK',
    'zzVVVVYYzzzzVVVVVVYYzzVVK.',
    'KzzzzzzzzzVVVVVVVVVVVVVVK.',
    '.KKzzzzzzzVVVVVVVVVVVVVK..',
    '..KzzzzzzzzVVVVVVVVVVVVK..',
    '...KzzzzzzzzVVVVVVVVVVK...',
    '...KzzzVKKKKKKKKKKzVVVK...',
    '...KzzVVK........KzzVVK...',
    '...KyyGGK........KyyGGK...',
    '...KyyGGK........KyyGGK...',
    '...KyyGGK........KyyGGK...',
    '...KyyGGK........KyyGGK...'
  ], { V: '#382f65', Y: '#f4e28a', G: '#8a77b8', K: '#0a0618', z: '#7c769c', y: '#b5aad2' });

  P.define('sanctumWraith', [
    '.........KYYKKYYK.........',
    '........KYYYKKYYYK........',
    '........KYYYYYYYYK........',
    '.......KYYYYYYYYYYK.......',
    '......KzzzzzVVVVVVVK......',
    '.....KzzzzzzVVVVVVVVK.....',
    '.....KVVXXzzVVVVXXVVK.....',
    '.....KVVXXzzVVVVXXVVVK....',
    '...KKzzzzzzzVVVVVVVVVKK...',
    '..KzzzzzzzzVVVVVVVVVVVVK..',
    '..KzzzzzzzVVVVVVVVVVVVVK..',
    '.KzzzzzzzzVVVVVVVVVVVVVVK.',
    '.KzzzVKzzzzVVVVVVVVKzzVVK.',
    '..KzVVKKKzzzVVVVVKKKzzVK..',
    '...KVVK..KKKKKKKK..KVVVK..',
    '...KVVK............KVVK...',
    '...KVVYK..........KYVVK...',
    '....KVVYK........KYVVK....',
    '....KVVVK........KVVVK....',
    '.....KVVK........KVVK.....',
    '.....KVVK........KVVK.....',
    '.....KVVK........KVVK.....',
    '....KYVVK........KVVYK....',
    '...KYYVVK........KVVYYK...'
  ], { V: '#32265a', Y: '#f4e28a', X: '#d1a1ff', K: '#0a0618', z: '#776f96', y: '#e5caff' });

  P.define('chronoSerpent', SERPENT_GRID, { E: '#382f65', K: '#0a0618', z: '#7c769c', X: '#f4e28a' });

  P.define('timelessHerald', [
    '.......KYYK..KYYK..KYYK.......',
    '......KYYYYKKYYYYKKYYYYK......',
    '......KYYYYYYYYYYYYYYYYK......',
    '.....KYYYYYYYYYYYYYYYYYYK.....',
    '...KKzzzzzzzVVVVVVVVVVVVVKK...',
    '..KzzzzzzzzzVVVVVVVVVVVVVVVK..',
    '..KzzVVVyyyyyyWWWWWWWWzVVVVK..',
    '.KzzVVVVyyyyyyWWWWWWWWWzzVVVK.',
    '.KzzVVWWKKzzVVWWzzVVKKWWzzVVK.',
    '.KzzVVWWKKzzVVWWzzVVKKWWzzVVK.',
    '.KzzVVVVyyyyyyWWWWWWWWWzzVVVK.',
    'KzzzzVVVyyyyyyWWWWWWWWzVVVVVVK',
    'zzzzzzzzzzzzVVVVVVVVVVVVVVVVVV',
    'zzzzzzzzzzzzVVVVVVVVVVVVVVVVVV',
    'zzVVVVYYYYYYYYYYYYYYYYYYzzVVVV',
    'zzVVVVYYYYYYYYYYYYYYYYYYzzVVVV',
    'zzzzzzzzzzzzVVVVVVVVVVVVVVVVVV',
    'zzzzzzzzzzzzVVVVVVVVVVVVVVVVVV',
    'KzzzzzzzzzzzVVVVVVVVVVVVVVVVVK',
    '.KzzzzzzzzzzVVVVVVVVVVVVVVVVK.',
    '.KzzzzzzzzzzVVVVVVVVVVVVVVVVK.',
    '..KzzzzzzzzVVVVVVVVVVVVVVVVK..',
    '..KzzzzzzVVVVKKKKKzzzVVVVVVK..',
    '...KzzzVVVVKK.....KzzzzVVVK...',
    '...KzzzVVKK........KKzzVVVK...',
    '...KzzVVK............KzzVVK...',
    '...KzzVVK............KzzVVK...',
    '...KzzVVK............KzzVVK...',
    '..KYYYYYK............KYYYYYK..',
    '.KYYYYYYK............KYYYYYYK.'
  ], { V: '#32265a', W: '#d3c4f8', Y: '#f4e28a', K: '#0a0618', z: '#776f96', y: '#e8e0fc' });

  P.define('timelessSovereign', [
    '.........KYYK......KYYK.........',
    '........KYYYYK....KYYYYK........',
    '.......KKYYYYKK..KKYYYYKK.......',
    '......KYYYYYYYYKKYYYYYYYYKKK....',
    '.....KYYYYYYYYYYYYYYYYYYYYYYK...',
    '.....KYYYYYYYYYYYYYYYYYYYYYYK...',
    '......KKKKKKKKKKKKKKKKKKKKKK....',
    '..........KK............KK......',
    '.........KVVK..........KVVK.....',
    '........KVVVVK........KVVVVK....',
    '.......KVVVVVKK......KKVVVVVK...',
    '.......KVVVVVVVKKKKKKVVVVVVVK...',
    '........KVVVVVVVVVVVVVVVVVVK....',
    '.........KVVVVVVVVVVVVVVVVK.....',
    '........KHVVVVVVVVVVVVVVVVSK....',
    '.......KHHVVVVVVVVVVVVVVVVSSK...',
    '.......KHHVVWWVVVVVVVVWWVVSSK...',
    '.......KHHVVWWVVVVVVVVWWVVSSK...',
    '.......KHHVVVVVVVVVVVVVVVVSSK...',
    '......KHHVVVVVVVVVVVVVVVVVVSSK..',
    '......KHHVVVVVVVVVVVVVVVVVVSSK..',
    '.....KHHVVVVVVVVVVVVVVVVVVVVSSK.',
    '.....KHHVVVVVVVVVVVVVVVVVVVVSSK.',
    '.....KHHVVVVVVVVVVVVVVVVVVVSSK..',
    '.....KHHVVVVVVVYYVVVVVVVVVVSSK..',
    '.....KHHVVVVVVYYYYVVVVVVVVSSK...',
    '.....KHHVVVVVVYYYYVVVVVVVVSSK...',
    '.....KHHVVVVVVVYYVVVVVVVVSSK....',
    '.....KHHVVVVVVVVVVVVVVVVVSSK....',
    '......KHVVVVVVVVVVVVVVVVSKK.....',
    '.......KVVVVVVVVVVVVVVVVK.......',
    '.......KVVVVVVVVVVVVVVVVK.......',
    '.......KVVVVVVVVVVVVVVVVK.......',
    '........KVVVVVVVVVVVVVVK........',
    '........KVVVVVVVVVVVVVVK........',
    '.........KVVVVVVVVVVVVK.........',
    '.........KVVVVVVVVVVVVK.........',
    '..........KVVVVVVVVVVVK.........',
    '..........KVVVVVKKVVVVK.........',
    '...........KVVVVKKVVVVK.........',
    '...........KVVVVKKVVVVK.........',
    '...........KVVVVKKVVVVK.........',
    '...........KVVVVKKVVVVK.........',
    '...........KVVVVKKVVVVK.........',
    '..........KYYYYYKKYYYYYK........',
    '.........KYYYYYYKKYYYYYYK.......',
    '.........KYYYYYYKKYYYYYYK.......',
    '.........KYYYYYYKKYYYYYYK.......'
  ], { Y: '#fbde32', V: '#1b113a', W: '#f5e0ff', K: '#070410', H: '#432e78', S: '#080312' });

  // ---- 16 additional playable classes (palette-swaps of BLADE_GRID / STAFFORB_GRID) ----

  P.define('gunslinger', ARCHER_GRID, { K: '#0a0a0a', G: '#8a7a5a', R: '#5a4030', Y: '#3a2a1a', U: '#2a1a10', W: '#e8d8b0' });
  P.define('samurai', BLADE_GRID, { K: '#0a0a0a', G: '#c8283a', R: '#1a1a1e', Y: '#e8c050', U: '#2a1a1a', W: '#f0f0f0' });
  P.define('runeblade', ROGUE_GRID, { K: '#22142e', G: '#3a2050', R: '#180c22', Y: '#a060ff', U: '#150a1e', W: '#c890ff' });
  P.define('beastmaster', ARCHER_GRID, { K: '#0a0a0a', G: '#5a7a3a', R: '#3a4a20', Y: '#c8a850', U: '#3a2a18', W: '#e8e0c0' });
  P.define('shadowDancer', ROGUE_GRID, { K: '#102020', G: '#1a3838', R: '#0a1a1a', Y: '#40d8c0', U: '#0a1414', W: '#80f0e0' });
  P.define('sharpshooter', ARCHER_GRID, { K: '#0a0a0a', G: '#6a7284', R: '#3a4048', Y: '#8a929c', U: '#20242a', W: '#f0f4f8' });
  P.define('battlemage', BLADE_GRID, { K: '#0a0a0a', G: '#3a58a0', R: '#20305a', Y: '#f0d060', U: '#182040', W: '#a0c0ff' });

  P.define('druid', STAFFORB_GRID, { N: '#2f5a2a', K: '#0a0a0a', B: '#3a6a34', p: '#c8a838' });
  P.define('alchemist', STAFFORB_GRID, { N: '#5a2a4a', K: '#0a0a0a', B: '#6a3458', p: '#80e070' });
  P.define('warlock', STAFFORB_GRID, { N: '#2a0a0a', K: '#0a0a0a', B: '#4a1414', p: '#ff8020' });
  P.define('frostOracle', STAFFORB_GRID, { N: '#3a5a7a', K: '#0a2030', B: '#5a80a0', p: '#e8f8ff' });
  P.define('stormCaller', STAFFORB_GRID, { N: '#3a3a48', K: '#0a0a0a', B: '#50505e', p: '#f0e050' });
  P.define('bard', BARD_GRID, { N: '#6a2838', K: '#0a0a0a', B: '#8a3a4a', Y: '#c8863a', s: '#f0e0a8' });
  P.define('puppeteer', STAFFORB_GRID, { N: '#403050', K: '#0a0a0a', B: '#584068', p: '#e04858' });
  P.define('tempestWitch', STAFFORB_GRID, { N: '#0a3a4a', K: '#0a0a0a', B: '#145a6a', p: '#60e8f0' });
  P.define('chronomancer', STAFFORB_GRID, { N: '#2a2a5a', K: '#0a0a0a', B: '#3a3a78', p: '#f0e8c0' });

  // ---- 5 unlockable "Valiant" elite classes (palette-swaps of BLADE_GRID / STAFFORB_GRID) ----

  P.define('warlord', BLADE_GRID, { K: '#0a0a0a', G: '#8a6a2a', R: '#3a2a14', Y: '#e8c060', U: '#1a1408', W: '#e04030' });
  P.define('shadowhunter', ROGUE_GRID, { K: '#0e1624', G: '#1a2438', R: '#0a121e', Y: '#6ae090', U: '#080c14', W: '#a0f0b8' });
  P.define('executioner', BLADE_GRID, { K: '#0a0a0a', G: '#7a1818', R: '#4a1010', Y: '#d81828', U: '#1a0808', W: '#f04858' });
  P.define('vanguard', BLADE_GRID, { K: '#0a0a0a', G: '#186878', R: '#0e3a44', Y: '#60e8f0', U: '#082028', W: '#c0f8ff' });
  P.define('deathbringer', STAFFORB_GRID, { N: '#7a1030', K: '#0a0a0a', B: '#921840', p: '#ff3050' });

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

  // Magic-weapon icon (wands/staves/grimoires): a glowing gem on a wooden
  // shaft, same footprint as weaponSlot's sword so it drops into every slot
  // that already renders an item icon.
  P.define('weaponSlotMag', [
    '.....K.....',
    '....KGK....',
    '...KGGGK...',
    '..KGGGGGK..',
    '...KGGGK...',
    '....KGK....',
    '....KWK....',
    '.....W.....',
    '.....W.....',
    '.....W.....',
    '.....W.....',
    '.....W.....',
    '....KWK....',
    '...KYYYK...',
    '...KYYYK...',
    '....KKK....'
  ], { K: '#0a0a0a', G: '#a060ff', W: '#8a6a4a', Y: '#e8c050' });

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
