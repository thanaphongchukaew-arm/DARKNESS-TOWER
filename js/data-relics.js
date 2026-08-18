// Relics: run-long passive items that bend a combat *rule* rather than just
// multiplying a stat (contrast data-blessings.js, which is pure %-stat/economy
// multipliers). Each relic's mechanical effect is checked directly by id at its
// one relevant hook in battle-engine.js (mirrors how e.g. skill.grantsBonusAp or
// skill.executeThreshold are handled there) -- this file only holds display text
// and the tunable numbers those hooks read. `economy`/`economyAmount` and
// `statKey`/`statAmount` reuse state.js's getRewardMult/blessingStatMult
// composition (see Cursed Coin) alongside blessings/curses; every other field
// is relic-specific and read nowhere else.
(function () {
  var relics = [
    { id: 'vampiric_fang', name: 'เขี้ยวกระหายเลือด', nameEn: 'Vampiric Fang', icon: 'relicVampiricFang',
      lifestealPct: 0.15,
      desc: 'การโจมตีปกติและทักษะโจมตีของคุณดูดเลือด 15% ของดาเมจที่สร้างกลับมาเป็น HP',
      descEn: 'Your basic attacks and attack skills leech 15% of damage dealt back as HP' },
    { id: 'adrenaline_core', name: 'แกนอะดรีนาลีน', nameEn: 'Adrenaline Core', icon: 'relicAdrenalineCore',
      lowHpThreshold: 0.30, lowHpPowerAmount: 0.25,
      desc: 'ขณะ HP ต่ำกว่า 30% ATK และ MAG ของคุณเพิ่มขึ้น 25%',
      descEn: 'While below 30% HP, your ATK and MAG rise by 25%' },
    { id: 'stone_ward', name: 'ปราการศิลา', nameEn: 'Stone Ward', icon: 'relicStoneWard',
      damageReductionPct: 0.08,
      desc: 'ดาเมจที่ได้รับจากศัตรูทั้งหมดลดลง 8%',
      descEn: 'All damage taken from enemies is reduced by 8%' },
    { id: 'momentum_charm', name: 'เครื่องรางแรงเหวี่ยง', nameEn: 'Momentum Charm', icon: 'relicMomentumCharm',
      bonusApChance: 0.15,
      desc: 'การโจมตีที่ไม่คริติคอลมีโอกาส 15% ได้รับเทิร์นเสริมเหมือนคริติคอล',
      descEn: 'A non-critical attack has a 15% chance to still grant a bonus turn, like a crit' },
    { id: 'cursed_coin', name: 'เหรียญต้องสาป', nameEn: 'Cursed Coin', icon: 'relicCursedCoin',
      economy: 'gold', economyAmount: 0.25, statKey: 'hp', statAmount: -0.10,
      desc: '+25% ทองที่ได้รับจากการต่อสู้ แต่ -10% HP สูงสุดตลอดการเดินทาง',
      descEn: '+25% gold earned from battles, but -10% max HP for the whole run' },
    { id: 'opportunist', name: 'นักฉวยโอกาส', nameEn: 'Opportunist', icon: 'relicOpportunist',
      executeThreshold: 0.25, executeBonus: 0.30,
      desc: 'ดาเมจที่คุณสร้างต่อศัตรูที่เหลือ HP ต่ำกว่า 25% เพิ่มขึ้น 30%',
      descEn: 'Your damage against enemies below 25% HP is increased by 30%' },
    { id: 'swift_recovery', name: 'ฟื้นคืนพลังไว', nameEn: 'Swift Recovery', icon: 'relicSwiftRecovery',
      healBoostPct: 0.25,
      desc: 'ทักษะฟื้นฟู HP ของคุณฟื้นฟูเพิ่มขึ้น 25%',
      descEn: 'Your HP-restoring skills heal for 25% more' }
  ];

  window.Game = window.Game || {};
  window.Game.Data = window.Game.Data || {};
  window.Game.Data.relics = relics;
  window.Game.Data.getRelic = function (id) {
    for (var i = 0; i < relics.length; i++) if (relics[i].id === id) return relics[i];
    return null;
  };
})();
