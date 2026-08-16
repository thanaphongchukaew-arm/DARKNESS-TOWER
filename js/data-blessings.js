// Run-long blessing/curse modifiers. Never applied via battle-engine's per-battle
// buff/debuff arrays (those tick down and refresh-not-stack by stat key -- see
// state.js's blessingStatMult) -- these are pure multipliers composed once inside
// State.getTotalStats (player stats) or into the reward `rate` argument already
// threaded through BattleEngine.getGoldReward/getExpReward/getMaterialDrops
// (economy blessings). `stat` entries multiply the matching key from
// Formulas.playerStatsAtLevel + equipment bonus; `special` entries are handled by
// dedicated code (revive) rather than a stat multiplier.
(function () {
  var blessings = [
    { id: 'might', name: 'พรแห่งพลัง', nameEn: 'Blessing of Might', icon: 'blessMight',
      stat: 'atk', amount: 0.10, desc: '+10% ATK ตลอดการเดินทาง', descEn: '+10% ATK for the whole run' },
    { id: 'insight', name: 'พรแห่งปัญญา', nameEn: 'Blessing of Insight', icon: 'blessInsight',
      stat: 'mag', amount: 0.10, desc: '+10% MAG ตลอดการเดินทาง', descEn: '+10% MAG for the whole run' },
    { id: 'vitality', name: 'พรแห่งชีวิต', nameEn: 'Blessing of Vitality', icon: 'blessVitality',
      stat: 'hp', amount: 0.12, desc: '+12% HP สูงสุดตลอดการเดินทาง', descEn: '+12% max HP for the whole run' },
    { id: 'clarity', name: 'พรแห่งสมาธิ', nameEn: 'Blessing of Clarity', icon: 'blessClarity',
      stat: 'mp', amount: 0.12, desc: '+12% MP สูงสุดตลอดการเดินทาง', descEn: '+12% max MP for the whole run' },
    { id: 'swiftness', name: 'พรแห่งความไว', nameEn: 'Blessing of Swiftness', icon: 'blessSwiftness',
      stat: 'spd', amount: 0.08, desc: '+8% SPD ตลอดการเดินทาง', descEn: '+8% SPD for the whole run' },
    { id: 'fortune', name: 'พรแห่งโชคชะตา', nameEn: 'Blessing of Fortune', icon: 'blessFortune',
      stat: 'luk', amount: 0.10, desc: '+10% LUK ตลอดการเดินทาง (เพิ่มโอกาสคริติคอล)', descEn: '+10% LUK for the whole run (raises crit chance)' },
    { id: 'wealth', name: 'พรแห่งความมั่งคั่ง', nameEn: 'Blessing of Wealth', icon: 'blessWealth',
      economy: 'gold', amount: 0.20, desc: '+20% ทองที่ได้รับจากการต่อสู้', descEn: '+20% gold earned from battles' },
    { id: 'wisdom', name: 'พรแห่งความรู้แจ้ง', nameEn: 'Blessing of Wisdom', icon: 'blessWisdom',
      economy: 'exp', amount: 0.15, desc: '+15% ค่าประสบการณ์ที่ได้รับ', descEn: '+15% EXP earned' },
    { id: 'guardian', name: 'พรแห่งเทพผู้พิทักษ์', nameEn: 'Blessing of the Guardian Spirit', icon: 'blessGuardian',
      special: 'revive', desc: 'ฟื้นคืนชีพครั้งเดียวที่ 1 HP เมื่อจะปราชัย', descEn: 'Revives you once at 1 HP the moment you would be defeated' },
    { id: 'ironskin', name: 'พรแห่งผิวเหล็ก', nameEn: 'Blessing of Iron Skin', icon: 'blessIronSkin',
      stat: ['def', 'res'], amount: 0.10, desc: '+10% DEF และ RES ตลอดการเดินทาง', descEn: '+10% DEF and RES for the whole run' },
    { id: 'titan', name: 'พรแห่งไททัน', nameEn: 'Blessing of the Titan', icon: 'blessTitan',
      stat: ['hp', 'def'], amount: 0.10, desc: '+10% HP สูงสุดและ DEF ตลอดการเดินทาง', descEn: '+10% max HP and DEF for the whole run' },
    // economy can be a single kind or an array of kinds (see state.js's getRewardMult) --
    // this is the only blessing that touches both gold and EXP at once.
    { id: 'wanderer', name: 'พรแห่งนักเดินทาง', nameEn: 'Blessing of the Wanderer', icon: 'blessWanderer',
      economy: ['gold', 'exp'], amount: 0.08, desc: '+8% ทองและ EXP ที่ได้รับจากการต่อสู้', descEn: '+8% gold and EXP earned from battles' },
    { id: 'focus', name: 'พรแห่งสมาธิแน่วแน่', nameEn: 'Blessing of Focus', icon: 'blessFocus',
      stat: ['atk', 'mag'], amount: 0.08, desc: '+8% ATK และ MAG ตลอดการเดินทาง', descEn: '+8% ATK and MAG for the whole run' },
    { id: 'wildcat', name: 'พรแห่งเสือป่า', nameEn: 'Blessing of the Wildcat', icon: 'blessWildcat',
      stat: ['spd', 'luk'], amount: 0.08, desc: '+8% SPD และ LUK ตลอดการเดินทาง', descEn: '+8% SPD and LUK for the whole run' },
    { id: 'stoneskin', name: 'พรแห่งผิวศิลา', nameEn: 'Blessing of Stone Skin', icon: 'blessStoneSkin',
      stat: ['def', 'res', 'hp'], amount: 0.06, desc: '+6% DEF, RES และ HP สูงสุดตลอดการเดินทาง', descEn: '+6% DEF, RES, and max HP for the whole run' },
    { id: 'warding', name: 'พรแห่งการปกป้อง', nameEn: 'Blessing of Warding', icon: 'blessWarding',
      stat: 'res', amount: 0.14, desc: '+14% RES ตลอดการเดินทาง', descEn: '+14% RES for the whole run' }
  ];

  var curses = [
    { id: 'frailty', name: 'คำสาปแห่งความอ่อนแอ', nameEn: 'Curse of Frailty', icon: 'curseFrailty',
      stat: 'hp', amount: -0.10, desc: '-10% HP สูงสุดตลอดการเดินทาง', descEn: '-10% max HP for the whole run' },
    { id: 'fool', name: 'คำสาปแห่งความโง่เขลา', nameEn: 'Curse of the Fool', icon: 'curseFool',
      stat: 'luk', amount: -0.10, desc: '-10% LUK ตลอดการเดินทาง', descEn: '-10% LUK for the whole run' },
    { id: 'slowness', name: 'คำสาปแห่งความเชื่องช้า', nameEn: 'Curse of Slowness', icon: 'curseSlowness',
      stat: 'spd', amount: -0.08, desc: '-8% SPD ตลอดการเดินทาง', descEn: '-8% SPD for the whole run' },
    { id: 'poverty', name: 'คำสาปแห่งความยากจน', nameEn: 'Curse of Poverty', icon: 'cursePoverty',
      economy: 'gold', amount: -0.15, desc: '-15% ทองที่ได้รับจากการต่อสู้', descEn: '-15% gold earned from battles' },
    { id: 'weakarms', name: 'คำสาปแห่งแขนอ่อนแรง', nameEn: 'Curse of Weak Arms', icon: 'curseWeakArms',
      stat: 'atk', amount: -0.08, desc: '-8% ATK ตลอดการเดินทาง', descEn: '-8% ATK for the whole run' },
    { id: 'dullmind', name: 'คำสาปแห่งจิตมัวหมอง', nameEn: 'Curse of Dull Mind', icon: 'curseDullMind',
      stat: 'mag', amount: -0.08, desc: '-8% MAG ตลอดการเดินทาง', descEn: '-8% MAG for the whole run' },
    { id: 'titansburden', name: 'คำสาปแห่งภาระไททัน', nameEn: "Curse of the Titan's Burden", icon: 'curseTitanBurden',
      stat: ['hp', 'def'], amount: -0.08, desc: '-8% HP สูงสุดและ DEF ตลอดการเดินทาง', descEn: '-8% max HP and DEF for the whole run' },
    { id: 'wandererruin', name: 'คำสาปแห่งนักเดินทางล่มจม', nameEn: "Curse of the Wanderer's Ruin", icon: 'curseWandererRuin',
      economy: ['gold', 'exp'], amount: -0.10, desc: '-10% ทองและ EXP ที่ได้รับจากการต่อสู้', descEn: '-10% gold and EXP earned from battles' },
    { id: 'brokenfocus', name: 'คำสาปแห่งสมาธิแตกสลาย', nameEn: 'Curse of Broken Focus', icon: 'curseBrokenFocus',
      stat: ['atk', 'mag'], amount: -0.06, desc: '-6% ATK และ MAG ตลอดการเดินทาง', descEn: '-6% ATK and MAG for the whole run' },
    { id: 'frailmind', name: 'คำสาปแห่งจิตอ่อนแอ', nameEn: 'Curse of the Frail Mind', icon: 'curseFrailMind',
      stat: 'mag', amount: -0.12, desc: '-12% MAG ตลอดการเดินทาง', descEn: '-12% MAG for the whole run' }
  ];

  window.Game = window.Game || {};
  window.Game.Data = window.Game.Data || {};
  window.Game.Data.blessings = blessings;
  window.Game.Data.curses = curses;
  window.Game.Data.getBlessing = function (id) {
    for (var i = 0; i < blessings.length; i++) if (blessings[i].id === id) return blessings[i];
    return null;
  };
  window.Game.Data.getCurse = function (id) {
    for (var i = 0; i < curses.length; i++) if (curses[i].id === id) return curses[i];
    return null;
  };
})();
