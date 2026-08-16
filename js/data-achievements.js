// One-off bragging-rights achievements (distinct from the cumulative-resource Quests
// screen). Reward is purely cosmetic: a title string the player can equip from the
// Codex screen (see State.equipTitle), shown next to their name on the Status screen.
// Unlocks persist in the meta store (window.Game.Save meta, survives clearRun()/
// permadeath) so they must only depend on meta-persistent data or a single dedicated
// meta flag set at one obvious call site -- see State.isAchievementUnlocked for the
// `type` switch this file drives.
//
// type: 'difficulty' (param: difficulty) | 'allElites' | 'ascension' (target) |
//       'survivalWaves' (target) | 'bestiary' (target, or 'all') | 'floorReached' (target) |
//       'companionsAll' | 'blessingsAll' | 'cursesAll' | 'eventsAll' |
//       'flag' (param: meta flag key set elsewhere -- flawlessVictor/blessedStacker/
//       riskTaker/goldHoarder/levelCapped/bigGambleWon)
(function () {
  var achievements = [
    { id: 'clear_easy', name: 'ผู้กล้าฝึกหัด', nameEn: 'Fledgling Hero', icon: 'trophy',
      type: 'difficulty', difficulty: 'easy',
      desc: 'พิชิตหอคอยโหมด Easy', descEn: 'Clear the tower on Easy.',
      title: 'ผู้กล้าฝึกหัด', titleEn: 'Fledgling Hero' },
    { id: 'clear_normal', name: 'นักผจญภัย', nameEn: 'True Adventurer', icon: 'trophy',
      type: 'difficulty', difficulty: 'normal',
      desc: 'พิชิตหอคอยโหมด Normal', descEn: 'Clear the tower on Normal.',
      title: 'นักผจญภัย', titleEn: 'True Adventurer' },
    { id: 'clear_hard', name: 'นักรบผู้แกร่งกล้า', nameEn: 'Hardened Warrior', icon: 'trophy',
      type: 'difficulty', difficulty: 'hard',
      desc: 'พิชิตหอคอยโหมด Hard', descEn: 'Clear the tower on Hard.',
      title: 'นักรบผู้แกร่งกล้า', titleEn: 'Hardened Warrior' },
    { id: 'clear_nightmare', name: 'ผู้พิชิตฝันร้าย', nameEn: 'Nightmare Conqueror', icon: 'medal',
      type: 'difficulty', difficulty: 'nightmare',
      desc: 'พิชิตหอคอยโหมด Nightmare', descEn: 'Clear the tower on Nightmare.',
      title: 'ผู้พิชิตฝันร้าย', titleEn: 'Nightmare Conqueror' },
    { id: 'all_elites', name: 'เจ้าแห่งผู้กล้า', nameEn: 'Master of the Valiant', icon: 'crownSkull',
      type: 'allElites',
      desc: 'ปลดล็อกคลาสผู้กล้า Valiant ครบทั้ง 5', descEn: 'Unlock all 5 Valiant elite classes.',
      title: 'เจ้าแห่งผู้กล้า', titleEn: 'Master of the Valiant' },
    { id: 'ascension_5', name: 'ผู้ไต่ระดับเหนือกาล', nameEn: 'Ascendant', icon: 'ascension',
      type: 'ascension', target: 5,
      desc: 'ปลดล็อก Ascension ระดับ 5', descEn: 'Unlock Ascension level 5.',
      title: 'ผู้ไต่ระดับเหนือกาล', titleEn: 'Ascendant' },
    { id: 'ascension_10', name: 'ผู้เหนือกาลเวลา', nameEn: 'Timeless One', icon: 'medal',
      type: 'ascension', target: 10,
      desc: 'ปลดล็อก Ascension ระดับ 10', descEn: 'Unlock Ascension level 10.',
      title: 'ผู้เหนือกาลเวลา', titleEn: 'Timeless One' },
    { id: 'survival_25', name: 'นักประลองมือฉมัง', nameEn: 'Arena Veteran', icon: 'sparkles',
      type: 'survivalWaves', target: 25,
      desc: 'ผ่านคลื่นในสนามประลองรวดเดียว 25 คลื่น', descEn: 'Clear 25 waves in a single Survival Arena session.',
      title: 'นักประลองมือฉมัง', titleEn: 'Arena Veteran' },
    { id: 'survival_50', name: 'จอมประลองไร้พ่าย', nameEn: 'Arena Legend', icon: 'medal',
      type: 'survivalWaves', target: 50,
      desc: 'ผ่านคลื่นในสนามประลองรวดเดียว 50 คลื่น', descEn: 'Clear 50 waves in a single Survival Arena session.',
      title: 'จอมประลองไร้พ่าย', titleEn: 'Arena Legend' },
    { id: 'bestiary_25', name: 'นักสำรวจสัตว์ประหลาด', nameEn: 'Monster Cataloguer', icon: 'codex',
      type: 'bestiary', target: 25,
      desc: 'ค้นพบศัตรูในสมุดสัตว์ประหลาด 25 ชนิด', descEn: 'Discover 25 entries in the Bestiary.',
      title: 'นักสำรวจสัตว์ประหลาด', titleEn: 'Monster Cataloguer' },
    { id: 'bestiary_all', name: 'ปรมาจารย์สัตว์ประหลาด', nameEn: 'Monster Master', icon: 'medal',
      type: 'bestiary', target: 'all',
      desc: 'ค้นพบศัตรูในสมุดสัตว์ประหลาดครบทุกชนิด', descEn: 'Discover every entry in the Bestiary.',
      title: 'ปรมาจารย์สัตว์ประหลาด', titleEn: 'Monster Master' },
    { id: 'floor_60', name: 'ผู้ท่องทะเลทรายกระดูก', nameEn: 'Bone Desert Wanderer', icon: 'doorway',
      type: 'floorReached', target: 60,
      desc: 'เคยไต่ถึงชั้น 60 มาก่อน', descEn: 'Have ever reached floor 60.',
      title: 'ผู้ท่องทะเลทรายกระดูก', titleEn: 'Bone Desert Wanderer' },
    { id: 'floor_100', name: 'ผู้พิชิตบัลลังก์นิรันดร์', nameEn: 'Throne Conqueror', icon: 'crownSkull',
      type: 'floorReached', target: 100,
      desc: 'เคยไต่ถึงชั้น 100 มาก่อน', descEn: 'Have ever reached floor 100.',
      title: 'ผู้พิชิตบัลลังก์นิรันดร์', titleEn: 'Throne Conqueror' },
    { id: 'companions_all', name: 'มิตรแห่งสรรพสัตว์', nameEn: 'Friend of All', icon: 'companionSlot',
      type: 'companionsAll',
      desc: 'รับสหายร่วมทางครบทั้ง 4 ตัว', descEn: 'Recruit all 4 companions at least once.',
      title: 'มิตรแห่งสรรพสัตว์', titleEn: 'Friend of All' },
    { id: 'flawless_victor', name: 'ผู้ไร้รอยขีดข่วน', nameEn: 'Flawless Victor', icon: 'trophy',
      type: 'flag', flag: 'flawlessVictor',
      desc: 'ชนะราชันไร้กาลเวลาโดย HP เต็มขณะได้รับชัยชนะ', descEn: 'Defeat the Timeless Sovereign at full HP.',
      title: 'ผู้ไร้รอยขีดข่วน', titleEn: 'Flawless Victor' },
    { id: 'blessed', name: 'ผู้ได้รับพรสามชั้น', nameEn: 'Thrice Blessed', icon: 'blessMight',
      type: 'flag', flag: 'blessedStacker',
      desc: 'ถือครองพรพร้อมกัน 3 อย่างขึ้นไป', descEn: 'Hold 3 or more blessings at once.',
      title: 'ผู้ได้รับพรสามชั้น', titleEn: 'Thrice Blessed' },
    { id: 'risktaker', name: 'ผู้กล้าเสี่ยงดวง', nameEn: 'Risktaker', icon: 'eventShrine',
      type: 'flag', flag: 'riskTaker',
      desc: 'รับพรจากศาลเจ้าต้องสาปพร้อมคำสาป', descEn: 'Accept a Cursed Shrine’s blessing-and-curse offer.',
      title: 'ผู้กล้าเสี่ยงดวง', titleEn: 'Risktaker' },
    { id: 'floor_85', name: 'ผู้ฝ่าป่าเสื่อมสลาย', nameEn: 'Nightgrove Wanderer', icon: 'doorway',
      type: 'floorReached', target: 85,
      desc: 'เคยไต่ถึงชั้น 85 มาก่อน', descEn: 'Have ever reached floor 85.',
      title: 'ผู้ฝ่าป่าเสื่อมสลาย', titleEn: 'Nightgrove Wanderer' },
    { id: 'bestiary_60', name: 'นักสะสมสัตว์ประหลาดตัวยง', nameEn: 'Avid Cataloguer', icon: 'codex',
      type: 'bestiary', target: 60,
      desc: 'ค้นพบศัตรูในสมุดสัตว์ประหลาด 60 ชนิด', descEn: 'Discover 60 entries in the Bestiary.',
      title: 'นักสะสมสัตว์ประหลาดตัวยง', titleEn: 'Avid Cataloguer' },
    { id: 'blessings_all', name: 'ผู้ได้รับพรครบทุกประการ', nameEn: 'Fully Blessed', icon: 'trophy',
      type: 'blessingsAll',
      desc: 'เคยได้รับพรครบทุกชนิดอย่างน้อยครั้งหนึ่ง (สะสมข้ามการเดินทาง)', descEn: 'Have ever held every blessing at least once (across all runs).',
      title: 'ผู้ได้รับพรครบทุกประการ', titleEn: 'Fully Blessed' },
    { id: 'curses_all', name: 'ผู้ต้านทานคำสาปครบทุกชนิด', nameEn: 'Curse Survivor', icon: 'medal',
      type: 'cursesAll',
      desc: 'เคยได้รับคำสาปครบทุกชนิดอย่างน้อยครั้งหนึ่ง (สะสมข้ามการเดินทาง)', descEn: 'Have ever held every curse at least once (across all runs).',
      title: 'ผู้ต้านทานคำสาปครบทุกชนิด', titleEn: 'Curse Survivor' },
    { id: 'gold_hoarder', name: 'เจ้าสัวหอคอย', nameEn: 'Tower Tycoon', icon: 'blessWealth',
      type: 'flag', flag: 'goldHoarder',
      desc: 'มีทองอยู่ในมือพร้อมกัน 5,000 เหรียญ', descEn: 'Hold 5,000 gold at once.',
      title: 'เจ้าสัวหอคอย', titleEn: 'Tower Tycoon' },
    { id: 'level_75', name: 'ผู้ทรงพลังเหนือขีดจำกัด', nameEn: 'Beyond the Limit', icon: 'star',
      type: 'flag', flag: 'levelCapped',
      desc: 'มีเลเวลตัวละครถึง 75 ในการเดินทางเดียว', descEn: 'Reach character level 75 in a single run.',
      title: 'ผู้ทรงพลังเหนือขีดจำกัด', titleEn: 'Beyond the Limit' },
    { id: 'gambler_jackpot', name: 'เจ้ามือดวงเพชร', nameEn: 'Jackpot Winner', icon: 'eventGambler',
      type: 'flag', flag: 'bigGambleWon',
      desc: 'ชนะการพนันเดิมพันสูงสุดที่บ่อนพนัน', descEn: 'Win the highest-stakes bet at the Gambler\'s Den.',
      title: 'เจ้ามือดวงเพชร', titleEn: 'Jackpot Winner' },
    { id: 'events_all', name: 'ผู้ท่องเหตุการณ์ครบทุกรูปแบบ', nameEn: 'Seen It All', icon: 'codex',
      type: 'eventsAll',
      desc: 'เคยพบเหตุการณ์สุ่มครบทุกประเภทอย่างน้อยครั้งหนึ่ง', descEn: 'Have ever encountered every type of random tower event.',
      title: 'ผู้ท่องเหตุการณ์ครบทุกรูปแบบ', titleEn: 'Seen It All' }
  ];

  window.Game = window.Game || {};
  window.Game.Data = window.Game.Data || {};
  window.Game.Data.achievements = achievements;
  window.Game.Data.getAchievement = function (id) {
    for (var i = 0; i < achievements.length; i++) if (achievements[i].id === id) return achievements[i];
    return null;
  };
})();
