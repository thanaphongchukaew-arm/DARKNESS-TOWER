// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

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
    { id: 'adrenaline_core', name: 'แกนเลือดพล่าน', nameEn: 'Adrenaline Core', icon: 'relicAdrenalineCore',
      lowHpThreshold: 0.30, lowHpPowerAmount: 0.25,
      desc: 'ขณะ HP ต่ำกว่า 30% ATK และ MAG ของคุณเพิ่มขึ้น 25%',
      descEn: 'While below 30% HP, your ATK and MAG rise by 25%' },
    { id: 'stone_ward', name: 'ปราการศิลา', nameEn: 'Stone Ward', icon: 'relicStoneWard',
      damageReductionPct: 0.08,
      desc: 'ดาเมจที่ได้รับจากศัตรูทั้งหมดลดลง 8%',
      descEn: 'All damage taken from enemies is reduced by 8%' },
    { id: 'momentum_charm', name: 'เครื่องรางแรงส่ง', nameEn: 'Momentum Charm', icon: 'relicMomentumCharm',
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
      descEn: 'Your HP-restoring skills heal for 25% more' },
    // ---- Second set: build-shaping relics. `hitMult` boosts the player's own
    // hits (optionally only `elements`, or only against bosses/champions via
    // `versus: 'elite'`); the other fields are read at their one hook in
    // battle-engine.js, exactly like the first set above. ----
    { id: 'ember_heart', name: 'หัวใจถ่านเพลิง', nameEn: 'Ember Heart', icon: 'fire', hitMult: 1.2, elements: ['fire'],
      desc: 'การโจมตีธาตุไฟของคุณแรงขึ้น 20%', descEn: 'Your fire attacks deal 20% more damage' },
    { id: 'frost_core', name: 'แกนน้ำแข็งนิรันดร์', nameEn: 'Frost Core', icon: 'ice', hitMult: 1.2, elements: ['ice'],
      desc: 'การโจมตีธาตุน้ำแข็งของคุณแรงขึ้น 20%', descEn: 'Your ice attacks deal 20% more damage' },
    { id: 'storm_coil', name: 'ขดลวดพายุ', nameEn: 'Storm Coil', icon: 'elec', hitMult: 1.15, elements: ['elec', 'wind'],
      desc: 'การโจมตีธาตุสายฟ้าและลมของคุณแรงขึ้น 15%', descEn: 'Your lightning and wind attacks deal 15% more damage' },
    { id: 'twin_idol', name: 'เทวรูปสองหน้า', nameEn: 'Twin Idol', icon: 'light', hitMult: 1.15, elements: ['light', 'dark'],
      desc: 'การโจมตีธาตุแสงและความมืดของคุณแรงขึ้น 15%', descEn: 'Your light and dark attacks deal 15% more damage' },
    { id: 'whetstone', name: 'หินลับคมโบราณ', nameEn: 'Ancient Whetstone', icon: 'swordAttack', hitMult: 1.12, elements: ['phys'],
      desc: 'การโจมตีกายภาพของคุณแรงขึ้น 12%', descEn: 'Your physical attacks deal 12% more damage' },
    { id: 'hunter_mark', name: 'ตราผู้ล้มราชา', nameEn: "Kingslayer's Mark", icon: 'crownSkull', hitMult: 1.15, versus: 'elite',
      desc: 'ดาเมจที่คุณสร้างต่อบอส มินิบอส และหัวหน้าฝูงเพิ่มขึ้น 15%', descEn: 'You deal 15% more damage to bosses, mini-bosses and champions' },
    { id: 'glass_blade', name: 'ใบมีดแก้ว', nameEn: 'Glass Blade', icon: 'weaponSlot', hitMult: 1.2, damageTakenPct: 0.10,
      desc: 'ดาเมจที่คุณสร้างเพิ่มขึ้น 20% แต่รับดาเมจเพิ่มขึ้น 10%', descEn: 'You deal 20% more damage but take 10% more' },
    { id: 'lucky_die', name: 'ลูกเต๋านำโชค', nameEn: 'Lucky Die', icon: 'star', bonusLuk: 7,
      desc: 'LUK +7 ระหว่างการต่อสู้ (โอกาสคริติคอลเพิ่มราว 8%)', descEn: '+7 LUK in battle (about 8% more critical chance)' },
    { id: 'healing_moss', name: 'มอสเยียวยา', nameEn: 'Healing Moss', icon: 'heart', roundHealPct: 0.02,
      desc: 'ฟื้นฟู HP 2% ของค่าสูงสุดเมื่อเริ่มแต่ละรอบ', descEn: 'Restore 2% of max HP at the start of each round' },
    { id: 'mana_prism', name: 'ปริซึมมานา', nameEn: 'Mana Prism', icon: 'drop', roundMp: 2,
      desc: 'ฟื้นฟู 2 MP เมื่อเริ่มแต่ละรอบ', descEn: 'Restore 2 MP at the start of each round' },
    { id: 'thorn_mail', name: 'เกราะหนาม', nameEn: 'Thorn Mail', icon: 'shieldGuard', reflectPct: 0.15,
      desc: 'ศัตรูที่โจมตีคุณรับดาเมจสะท้อน 15% ของดาเมจที่สร้าง', descEn: 'Enemies that hit you take 15% of that damage back' },
    { id: 'war_banner', name: 'ธงศึก', nameEn: 'War Banner', icon: 'buffUp', startFocus: 30,
      desc: 'เริ่มทุกการต่อสู้พร้อม Focus 30 แต้ม', descEn: 'Start every battle with 30 Focus' },
    { id: 'guardian_charm', name: 'เครื่องรางผู้คุ้มกัน', nameEn: "Guardian's Charm", icon: 'relicGuard', firstHitPct: 0.5,
      desc: 'การโจมตีแรกที่คุณโดนในแต่ละการต่อสู้ลดดาเมจลงครึ่งหนึ่ง', descEn: 'The first hit you take in each battle is halved' },
    { id: 'breaker_gauntlet', name: 'ถุงมือทลายเกราะ', nameEn: "Breaker's Gauntlet", icon: 'relicBreak', bonusBreak: 10,
      desc: 'การโจมตีของคุณเพิ่ม Break อีก 10 แต้มต่อครั้ง', descEn: 'Your hits add 10 extra Break each' },
    { id: 'bounty_seal', name: 'ตราค่าหัว', nameEn: 'Bounty Seal', icon: 'gem', economy: 'exp', economyAmount: 0.15,
      desc: '+15% EXP ที่ได้รับจากการต่อสู้', descEn: '+15% EXP earned from battles' },
    { id: 'scavenger_pouch', name: 'ถุงนักเก็บซาก', nameEn: "Scavenger's Pouch", icon: 'coin', dropChanceBonus: 0.25,
      desc: 'โอกาสดรอปวัตถุดิบจากศัตรูเพิ่มขึ้น 25%', descEn: 'Enemies are 25% more likely to drop materials' },
    { id: 'steady_boots', name: 'รองเท้าก้าวมั่น', nameEn: 'Steadfast Boots', icon: 'wind', statKey: 'spd', statAmount: 0.12,
      desc: '+12% SPD ตลอดการเดินทาง', descEn: '+12% SPD for the whole run' },
    { id: 'titan_belt', name: 'เข็มขัดไททัน', nameEn: "Titan's Belt", icon: 'blessVitality', statKey: 'hp', statAmount: 0.10,
      desc: '+10% HP สูงสุดตลอดการเดินทาง', descEn: '+10% max HP for the whole run' },
    { id: 'sage_tome', name: 'ตำรานักปราชญ์', nameEn: "Sage's Tome", icon: 'blessInsight', statKey: ['mag', 'mp'], statAmount: 0.08,
      desc: '+8% MAG และ MP สูงสุดตลอดการเดินทาง', descEn: '+8% MAG and max MP for the whole run' },
    { id: 'warrior_crest', name: 'ตรานักรบ', nameEn: "Warrior's Crest", icon: 'blessMight', statKey: ['atk', 'def'], statAmount: 0.07,
      desc: '+7% ATK และ DEF ตลอดการเดินทาง', descEn: '+7% ATK and DEF for the whole run' }
  ];

  window.Game = window.Game || {};
  window.Game.Data = window.Game.Data || {};
  window.Game.Data.relics = relics;
  window.Game.Data.getRelic = function (id) {
    for (var i = 0; i < relics.length; i++) if (relics[i].id === id) return relics[i];
    return null;
  };
})();
