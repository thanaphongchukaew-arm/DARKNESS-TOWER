// Original battle-effect sprites, drawn as palette-key pixel grids.
(function () {
  var P = window.Game.PixelArt;
  P.define('fxOrb', [
    "....MM....",
    "..MMCCMM..",
    ".MCCCCCCM.",
    "MCCHHCCCCM",
    "MCCHHCCCCM",
    "MCCCCCCCCM",
    "MCCCCCCCCM",
    ".MCCCCCCM.",
    "..MMCCMM..",
    "....MM...."
  ], {"M": "#4a355d", "C": "#e8b76d", "H": "#fff0c7", "E": "#181326"});
  P.define('fxFire', [
    ".....H....",
    "....HH....",
    "....HCH...",
    "..H.HCH...",
    "..HHCCCH..",
    ".HCCCCCH..",
    ".HCCHCCCH.",
    "HCCCHHCCCH",
    "HCCCHHCCCH",
    ".MCCCCCMM.",
    "..MMCCMM..",
    "....MM...."
  ], {"M": "#4a355d", "C": "#e8b76d", "H": "#fff0c7", "E": "#181326"});
  P.define('fxIce', [
    "....H...",
    "...HCH..",
    "..HCCCH.",
    ".HCCCCCH",
    "HCCCCHCM",
    "HCCCHCCM",
    "MCCCHCCM",
    ".MCCHCM.",
    ".MCCHCM.",
    "..MCCM..",
    "...MM..."
  ], {"M": "#4a355d", "C": "#e8b76d", "H": "#fff0c7", "E": "#181326"});
  P.define('fxArrow', [
    "..........HH",
    ".........HCH",
    "HHHHHHHHHCCH",
    ".CCCCCCCCCH.",
    "HHHHHHHHHCCH",
    ".........HCH",
    "..........HH"
  ], {"M": "#4a355d", "C": "#e8b76d", "H": "#fff0c7", "E": "#181326"});
  P.define('fxBullet', [
    "......HH",
    "MCCCCCHH",
    "MCCCCCHH",
    "......HH"
  ], {"M": "#4a355d", "C": "#e8b76d", "H": "#fff0c7", "E": "#181326"});
  P.define('fxBottle', [
    "..MMMMM..",
    "..MHHHM..",
    "..MMMMM..",
    "...HHH...",
    "..H...H..",
    ".H.....M.",
    "HCCCCCCCM",
    "HCCHHCCCM",
    "HCCHCCCCM",
    "HCCCCCCCM",
    ".MCCCCMM.",
    "..MMMMM.."
  ], {"M": "#4a355d", "C": "#e8b76d", "H": "#fff0c7", "E": "#181326"});
  P.define('fxNote', [
    "....MMMM",
    "....MCCM",
    "....MCCM",
    "....MCCM",
    "....M..M",
    "....M..M",
    ".CCCM..M",
    "CCCCMCCC",
    "CCCCCCCC",
    ".CC..CC."
  ], {"M": "#4a355d", "C": "#e8b76d", "H": "#fff0c7", "E": "#181326"});
  P.define('fxHeart', [
    ".HH...HH.",
    "HCCM.HCCM",
    "HCCCMCCCM",
    "HCCCCCCCM",
    ".HCCCCCM.",
    "..HCCCM..",
    "...HCM...",
    "....M...."
  ], {"M": "#4a355d", "C": "#e8b76d", "H": "#fff0c7", "E": "#181326"});
  P.define('fxSkull', [
    "..MMMMM..",
    ".MHCCCMM.",
    "MHHCCCCCM",
    "MHMMCCMMC",
    "MCMMCCMMC",
    "MCCCCCCCM",
    ".MCCMCCM.",
    "..MCMCM..",
    "..MMMMM.."
  ], {"M": "#4a355d", "C": "#e8b76d", "H": "#fff0c7", "E": "#181326"});
  P.define('fxFist', [
    "..MMMMMM..",
    ".MHCHCHCM.",
    "MHCHCHCHCM",
    "MHCCCCCCCM",
    "MCCCCCCCCM",
    "MMCCCCCCCM",
    ".MCCCCCCM.",
    "..MCCCCM..",
    "..MMMMMM.."
  ], {"M": "#4a355d", "C": "#e8b76d", "H": "#fff0c7", "E": "#181326"});
  P.define('fxShield', [
    "...MMMM...",
    ".MMHHCCMM.",
    "MHHCCCCCCM",
    "MHCCCCCCCM",
    "MHCCHHCCM.",
    "MHCCHHCCM.",
    ".MCCCCCCM.",
    ".MHCCCCM..",
    "..MCCCM...",
    "...MCM....",
    "....M....."
  ], {"M": "#4a355d", "C": "#e8b76d", "H": "#fff0c7", "E": "#181326"});
  P.define('fxClock', [
    "...MMMM...",
    ".MMHHCCMM.",
    "MHCCCCCCCM",
    "MHCCCHCCCM",
    "MHCCCHCCCM",
    "MHCCCHHCCM",
    "MHCCCCCCCM",
    "MHCCCCCCCM",
    ".MMCCCCMM.",
    "...MMMM..."
  ], {"M": "#4a355d", "C": "#e8b76d", "H": "#fff0c7", "E": "#181326"});
  P.define('fxStar', [
    "....H....",
    "....H....",
    "...HCH...",
    "..HCCHH..",
    "HHCCCCCHH",
    "..HCCHH..",
    "...HCH...",
    "....H....",
    "....H...."
  ], {"M": "#4a355d", "C": "#e8b76d", "H": "#fff0c7", "E": "#181326"});
  P.define('fxBeast', [
    "..M......M..",
    "..CM....MC..",
    "..CCMMMMCC..",
    ".MCCHHCCCM..",
    "MCCCCCCCCMM.",
    "MCCCCCCCCCCM",
    ".MMCCCCCCCM.",
    "..M.M..M.M.."
  ], {"M": "#4a355d", "C": "#e8b76d", "H": "#fff0c7", "E": "#181326"});
  P.define('fxScarab', [
    "...M..M...",
    "..MCCCCM..",
    ".MHHCCCCM.",
    "MMCCCCCCMM",
    ".MCCMCCCM.",
    "MMCCMCCCMM",
    ".MCCCCCCM.",
    "..MM..MM.."
  ], {"M": "#4a355d", "C": "#e8b76d", "H": "#fff0c7", "E": "#181326"});
  P.define('fxPuppet', [
    "...MMMM...",
    "..MHCCCM..",
    "..MCEECM..",
    "...MCCM...",
    "....MM....",
    "..MMCCMM..",
    ".MCCCCCCM.",
    "MCMCCCCMCM",
    "MM.CCCC.MM",
    "...CCCC...",
    "...M..M...",
    "...M..M...",
    "..MM..MM.."
  ], {"M": "#4a355d", "C": "#e8b76d", "H": "#fff0c7", "E": "#181326"});
  P.define('fxEye', [
    "....MMMM....",
    "..MMHHCCMM..",
    ".MHCCMMCCCM.",
    "MHCCMMMMCCCM",
    ".MCCCHHCCCM.",
    "..MMCCCCMM..",
    "....MMMM...."
  ], {"M": "#4a355d", "C": "#e8b76d", "H": "#fff0c7", "E": "#181326"});
  P.define('fxAxe', [
    ".......MMM..",
    ".....MMHCCM.",
    "....MHCCCCCM",
    "....MHCCCCCM",
    ".....MCCCCM.",
    ".....MMCCM..",
    "....MC.MMM..",
    "...MC.......",
    "..MC........",
    ".MC.........",
    "MC..........",
    "M..........."
  ], {"M": "#4a355d", "C": "#e8b76d", "H": "#fff0c7", "E": "#181326"});
  P.define('fxScythe', [
    ".....MMMMM..",
    "...MMHHCCCM.",
    "..MHCCCCCCCM",
    ".MHCCMMMMMM.",
    "MHCM........",
    "MMM.........",
    "..MC........",
    "..MC........",
    "..MC........",
    "..MC........",
    "..MC........",
    "..MC........",
    "..MC........"
  ], {"M": "#4a355d", "C": "#e8b76d", "H": "#fff0c7", "E": "#181326"});
  P.define('fxFang', [
    "HH.....HH",
    "HCH...HCH",
    ".HCM.MCH.",
    ".HCCMCCM.",
    "..HCCCM..",
    "...MCM...",
    "....M...."
  ], {"M": "#4a355d", "C": "#e8b76d", "H": "#fff0c7", "E": "#181326"});
  P.define('fxRune', [
    "....HH....",
    "...H..H...",
    "..H.CC.H..",
    ".H.C..C.H.",
    "H.C.HH.C.H",
    "H.C.HH.C.H",
    ".H.C..C.H.",
    "..H.CC.H..",
    "...H..H...",
    "....HH...."
  ], {"M": "#4a355d", "C": "#e8b76d", "H": "#fff0c7", "E": "#181326"});
  P.define('fxPetal', [
    '...HH..', '..HCCH.', '.HCCCM.', 'HCCCCM.', 'HCCCM..', '.MMM...'
  ], { M: '#b875b5', C: '#f6b2d3', H: '#fff0fa' });
  P.define('fxWing', [
    'H.........', 'HH........', 'HCH.......', 'HCCH......', 'HCCCH.....', '.HCCCH....', '..HCCCH...', '...HCCCH..', '....HHHHH.', '......HHHH'
  ], { H: '#fff9e1', C: '#e6d6a6' });
  P.define('fxHammer', [
    '...MMMMMMMM.', '...MHHCCCCM.', '...MHHCCCCM.', '...MCCCCCCM.', '...MMMMMMMM.', '......MC....', '.....MC.....', '....MC......', '...MC.......', '..MC........', '.MC.........', 'MM..........'
  ], { M: '#4a355d', C: '#e8b76d', H: '#fff0c7' });
  P.define('fxBeak', [
    'MH......', 'MCHH....', 'MCCCHH..', 'MCCCCCHH', 'MCCCHH..', 'MCHH....', 'MH......'
  ], { M: '#4a355d', C: '#e8b76d', H: '#fff0c7' });
})();
