// Companion definitions: one passive ally, hired for free once its floor
// requirement has ever been reached (State.recordFloorReached / meta.bestFloorReached
// -- an account-wide unlock, like the Valiant elite classes). Acts automatically once
// per round in battle (see BattleEngine.runCompanionPhase) and is never a valid enemy
// target -- its `role` selects which branch of that function runs, and its numeric
// fields are fractions of the player's own *current* effective stats, so it scales
// with gear/level automatically instead of needing its own growth curve.
(function () {
  var companions = [
    { id: 'ember_fox', name: 'จิ้งจอกเปลวไฟ', nameEn: 'Ember Fox', icon: 'emberFox', unlockFloor: 1,
      role: 'attacker', power: 0.28, critChance: 0.10, critMult: 1.6,
      desc: 'สหายจิ้งจอกที่พุ่งเข้ากัดศัตรูให้ทุกรอบการต่อสู้', descEn: 'A fox companion that lunges at a foe every round' },
    // healPct is a flat %-of-maxHP heal every round for free -- unlike a DEF/RES%
    // buff (whose payoff depends on the matchup) or a damage-power% (which only
    // matters relative to the fight it lands in), a flat HP heal is unconditional
    // value with no downside, so it's tuned noticeably below the guardian/buffer
    // roles' own percentages rather than matching them 1:1.
    { id: 'dawn_owl', name: 'นกฮูกอรุณ', nameEn: 'Dawn Owl', icon: 'dawnOwl', unlockFloor: 15,
      role: 'healer', healPct: 0.05,
      desc: 'นกฮูกผู้เยียวยา ฟื้นฟู HP ให้เล็กน้อยทุกรอบ', descEn: 'A healing owl that restores a little HP every round' },
    { id: 'stoneheart_bear', name: 'หมีหัวใจศิลา', nameEn: 'Stoneheart Bear', icon: 'stoneheartBear', unlockFloor: 30,
      role: 'guardian', buffStats: ['def', 'res'], buffAmount: 0.18,
      desc: 'หมีผู้พิทักษ์ มอบเกราะป้องกันให้ทุกรอบ', descEn: 'A guardian bear that shields you with extra DEF/RES every round' },
    { id: 'storm_sprite', name: 'เอลฟ์สายฟ้าน้อย', nameEn: 'Storm Sprite', icon: 'stormSprite', unlockFloor: 45,
      role: 'buffer', buffStats: ['atk', 'mag'], buffAmount: 0.15,
      desc: 'เอลฟ์สายฟ้า เสริมพลังโจมตีและเวทให้ทุกรอบ', descEn: 'A storm sprite that empowers your ATK/MAG every round' },
    // ---- 2nd wave: unlocked deeper into the hidden upper tower, each a
    // stronger/alternate build of an existing role (same 4 roles battle-engine's
    // runCompanionPhase already knows how to run -- no engine changes needed). ----
    { id: 'sand_scarab', name: 'แมลงปีกแข็งทะเลทราย', nameEn: 'Sand Scarab', icon: 'sandScarab', unlockFloor: 60,
      role: 'attacker', power: 0.24, critChance: 0.16, critMult: 1.6,
      desc: 'สหายแมลงปีกแข็ง เน้นโจมตีคริติคอลสูงกว่าจิ้งจอกเปลวไฟ', descEn: 'A scarab companion built for a higher crit chance than Ember Fox, at slightly lower base power' },
    { id: 'frost_hare', name: 'กระต่ายน้ำแข็ง', nameEn: 'Frost Hare', icon: 'frostHare', unlockFloor: 70,
      role: 'healer', healPct: 0.065,
      desc: 'กระต่ายน้ำแข็ง ฟื้นฟู HP ให้มากกว่านกฮูกอรุณทุกรอบ', descEn: 'A frost hare that heals more HP per round than Dawn Owl' },
    { id: 'iron_golem_cub', name: 'ลูกโกเลมเหล็ก', nameEn: 'Iron Golem Cub', icon: 'ironGolemCub', unlockFloor: 85,
      role: 'guardian', buffStats: ['def', 'res'], buffAmount: 0.22,
      desc: 'ลูกโกเลมเหล็ก มอบเกราะป้องกันที่หนากว่าหมีหัวใจศิลาทุกรอบ', descEn: 'A young iron golem that shields you with even more DEF/RES than Stoneheart Bear' }
  ];

  window.Game = window.Game || {};
  window.Game.Data = window.Game.Data || {};
  window.Game.Data.companions = companions;
  window.Game.Data.getCompanion = function (id) {
    for (var i = 0; i < companions.length; i++) if (companions[i].id === id) return companions[i];
    return null;
  };
})();
