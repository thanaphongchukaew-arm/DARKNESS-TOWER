// Original 16×16 tactical sprites, authored in the existing palette-grid format.
(function () {
  var P = window.Game.PixelArt;
  var gold = { K: '#141020', D: '#63402d', M: '#b67b35', C: '#f2c45b', H: '#fff0ad', B: '#7054a5', S: '#b69be3' };
  var blue = { K: '#101629', D: '#263b61', M: '#37759a', C: '#65cbd4', H: '#d2ffff', B: '#704e95', S: '#b994de' };
  var red = { K: '#211020', D: '#63283b', M: '#b63d4d', C: '#fa7859', H: '#ffdab0', B: '#694986', S: '#b48be0' };
  var green = { K: '#101e25', D: '#245250', M: '#32957c', C: '#7fe09a', H: '#e0ffd1', B: '#6a4e96', S: '#b694da' };
  var shield = [
    '......KKKK......','...KKKCCC MKKK...'.replace(' ', ''), '...KHHCCMMDDK...', '...KHCCCMMDDK...',
    '...KHCCHHMDDK...', '...KHCHHHHDDK...', '...KHCC HHMDDK...'.replace(' ', ''), '...KMCCHHMDDK...',
    '...KMCCMMDDDK...', '....KMCMDDDK....', '....KMCMDDDK....', '.....KMDDDK.....',
    '......KDDK......', '.......KK.......', '................', '................'
  ];
  // All rows are exactly 16 cells; the renderer remains the same as existing art.
  shield = shield.map(function (r) { return (r + '................').slice(0, 16); });
  var blades = [
    '.............KK.','............KHK.','..KK.......KHCK.','..KHK.....KHCK..',
    '...KHK...KHCK...', '....KHK.KHCK....', '.....KHKHCK.....','......KHCK......',
    '.....KBHMBK.....','....KSMDMMSK....','...KS KDKKMSK...'.replace(' ', '.'),'..KSK.KD.KMSK...',
    '..KK..KD..KK....','......KD........','......KK........','................'
  ].map(function (r) { return (r + '................').slice(0, 16); });
  var crystal = [
    '.......KK.......','......KHHK......','.....KHCCMK.....','....KHCCCCMK....',
    '...KHCCCHCMMK...','..KHCCCHCCMM DK..'.replace(' ', ''),'..KHCCCHCCMMDDK.','..KCCCHCCCMMDDK.',
    '...KCC HCCMMDDK..'.replace(' ', ''),'....KC HCMDDDK...'.replace(' ', ''),'.....KCMDDDK....','......KMDDK.....',
    '...BBB.KKK.BBB..','..BSSBBBBBBSSB..','...BBBBBBBBBB...','................'
  ].map(function (r) { return (r + '................').slice(0, 16); });
  var bell = [
    '.......KK.......','......KHHK......','......KCMK......','.....KKKKKK.....',
    '....KHCCMM DK....'.replace(' ', ''),'...KHCCCMMDDK...','...KHCCCMMDDK...','...KHCCCMMDDK...',
    '..KHCCCCMMMDDK..','..KHCCCCMMMDDK..','.KHHCCCCMMMMDDK.','.KKKKKKKKKKKKKK.',
    '......KCMK......','......KMDK......','.......KK.......','................'
  ].map(function (r) { return (r + '................').slice(0, 16); });
  var bottle = [
    '......KKKK......','.....KCCCCK.....','.....KMMMMK.....','......KHHK......',
    '.....KH..HK.....','....KH....MK....','...KH......DK...','...KHCCCCMMDK...',
    '...KHCCCHMMDK...','...KHCCCHMMDK...','...KHCCCHMMDK...','...KHCCCCMMDK...',
    '...KMCCCMMDDK...','....KMMMMDDK....','.....KKKKKK.....','................'
  ];
  P.define('talentRiposte', shield, red); P.define('talentFlurry', blades, blue); P.define('talentPierce', blades, gold);
  P.define('relicBreak', crystal, blue); P.define('relicGuard', bell, gold); P.define('relicEcho', bell, blue);
  P.define('routeSafe', shield, green); P.define('routeElite', blades, red); P.define('routeExplore', crystal, green);
  P.define('statusPoison', bottle, green); P.define('statusBurn', bottle, red); P.define('statusSilence', bell, { K: '#151025', D: '#3a245c', M: '#7050a5', C: '#ad7ad7', H: '#f5d4ff' });
  P.define('statusCleanse', bottle, blue);
})();
