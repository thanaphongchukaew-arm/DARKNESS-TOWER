// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Bilingual (Thai/English) string dictionary + helpers. English falls back to Thai
// wherever a translation is missing, and Thai falls back to Chakra Petch since
// the 8-bit pixel font (Press Start 2P) has no Thai glyphs.
(function () {
  var STORAGE_KEY = 'shadowspire_lang';
  var lang = 'th';
  try {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'th' || saved === 'en') lang = saved;
  } catch (e) { /* ignore */ }
  document.documentElement.lang = lang;

  // key -> { th, en }
  var STRINGS = {
    // main menu
    continueGame: { th: 'เล่นต่อ', en: 'Continue' },
    newGame: { th: 'เริ่มเกมใหม่', en: 'New Game' },
    guideBtn: { th: 'วิธีเล่น', en: 'How to Play' },
    clearSave: { th: 'ล้างเซฟ', en: 'Clear Save' },

    // how-to-play / guide screen
    guideTitle: { th: 'วิธีเล่น', en: 'How to Play' },
    guideStatsTitle: { th: 'ค่าสถานะของคุณ', en: 'Your Stats' },
    guideStatHpLabel: { th: 'HP', en: 'HP' },
    guideStatHpDesc: { th: 'พลังชีวิต — ลดเหลือ 0 เมื่อไรแพ้ทันที', en: 'Hit Points — reach 0 and you lose the battle immediately.' },
    guideStatMpLabel: { th: 'MP', en: 'MP' },
    guideStatMpDesc: { th: 'พลังเวท — ใช้ร่ายทักษะ แต่ละทักษะใช้ไม่เท่ากัน', en: 'Magic Points — spent on Skills; each skill costs a different amount.' },
    guideStatAtkLabel: { th: 'ATK', en: 'ATK' },
    guideStatAtkDesc: { th: 'พลังโจมตี — ดาเมจของการโจมตีธาตุกายภาพ', en: 'Attack — determines the damage of physical-element attacks.' },
    guideStatMagLabel: { th: 'MAG', en: 'MAG' },
    guideStatMagDesc: { th: 'พลังเวทโจมตี — ดาเมจของทักษะธาตุเวท เช่น ไฟ น้ำแข็ง สายฟ้า', en: 'Magic Attack — determines the damage of elemental skills like fire, ice, or electric.' },
    guideStatDefLabel: { th: 'DEF', en: 'DEF' },
    guideStatDefDesc: { th: 'พลังป้องกัน — ลดดาเมจจากการโจมตีธาตุกายภาพ', en: 'Defense — reduces damage taken from physical-element attacks.' },
    guideStatResLabel: { th: 'RES', en: 'RES' },
    guideStatResDesc: { th: 'ต้านทานเวท — ลดดาเมจจากการโจมตีธาตุเวท', en: 'Resistance — reduces damage taken from elemental attacks.' },
    guideStatSpdLabel: { th: 'SPD', en: 'SPD' },
    guideStatSpdDesc: { th: 'ความเร็ว — ยิ่งเร็วกว่าศัตรู ยิ่งมีโอกาสโจมตีก่อนหรือได้แต้ม AP พิเศษ', en: "Speed — the faster you are than the enemy, the more likely you'll strike first or gain a bonus action point." },
    guideStatLukLabel: { th: 'LUK', en: 'LUK' },
    guideStatLukDesc: { th: 'โชค — เพิ่มโอกาสคริติคอล (ดาเมจ 1.6 เท่า)', en: 'Luck — increases your chance to land a critical hit (1.6x damage).' },
    guideStatExpLabel: { th: 'EXP', en: 'EXP' },
    guideStatExpDesc: { th: 'แถบล่างสุด — คืบหน้าสู่เลเวลถัดไป เต็มแล้วเลเวลอัพและค่าสถานะเพิ่ม', en: 'Bottom bar — progress toward your next level; fill it up to level up and boost your stats.' },
    guideElementsTitle: { th: 'ธาตุแห่งการต่อสู้', en: 'Combat Elements' },
    guideElementsIntro: {
      th: 'ทุกการโจมตีมีธาตุประจำตัว แสดงด้วยไอคอนสีต่าง ๆ ตามด้านล่าง ธาตุกายภาพใช้ค่า ATK/DEF ส่วนธาตุเวทใช้ค่า MAG/RES ในการคำนวณดาเมจ',
      en: 'Every attack carries an element, shown as a colored icon like the ones below. Physical attacks scale off ATK/DEF, while elemental attacks scale off MAG/RES.'
    },
    guideCombatTitle: { th: 'ระบบการต่อสู้', en: 'Battle System' },
    guideCombatApLabel: { th: 'แต้มการกระทำ (AP)', en: 'Action Points (AP)' },
    guideCombatApDesc: {
      th: 'เริ่มเทิร์นด้วย 1 แต้ม (หรือ 2 ถ้าเร็วกว่าศัตรูมาก) ใช้ 1 แต้มต่อคำสั่ง คริติคอลได้แต้มคืน 1 แต้ม',
      en: 'Start each turn with 1 AP (2 if much faster than the enemy). Every command costs 1 AP. A critical hit refunds one.'
    },
    guideCombatActionsLabel: { th: 'คำสั่งที่ใช้ได้', en: 'Commands' },
    guideCombatActionsDesc: { th: 'โจมตีธรรมดา, ทักษะ (ใช้ MP), ป้องกัน (ลดดาเมจครึ่งหนึ่งในเทิร์นนั้น), และใช้ไอเทม', en: 'Basic Attack, Skills (cost MP), Guard (halves damage taken that round), and Items.' },
    guideCombatStaggerLabel: { th: 'เสียหลัก', en: 'Stagger' },
    guideCombatStaggerDesc: {
      th: 'ศัตรูที่โดนคริติคอลจะเสียหลักและข้ามเทิร์น ถ้าทุกตัวเสียหลักพร้อมกันจะได้โอกาส "โจมตีรวมพลัง" ใส่ดาเมจก้อนใหญ่ทีเดียว',
      en: 'An enemy hit by a crit staggers and skips its turn. If every enemy is staggered at once, you get an All-Out Attack for heavy damage.'
    },
    guideCombatGroupLabel: { th: 'กลุ่มศัตรู', en: 'Enemy Groups' },
    guideCombatGroupDesc: {
      th: 'ชั้นลึก ๆ อาจเจอศัตรูเป็นกลุ่มสูงสุด 5 ตัว ยิ่งกลุ่มใหญ่แต่ละตัวยิ่งอ่อนลง แต่โจมตีคุณพร้อมกันได้หลายทาง',
      en: 'On deeper floors enemies can appear in groups of up to 5. Larger groups are individually weaker, but can all attack you the same round.'
    },
    guideCombatFocusLabel: { th: 'พลังโฟกัส & โอเวอร์ไดรฟ์', en: 'Focus & Overdrive' },
    guideCombatFocusDesc: {
      th: 'ทุกครั้งที่โจมตีโดน พลังโฟกัสจะสะสมขึ้น (คริติคอลสะสมเร็วกว่า) เมื่อเต็มแถบ ใช้ท่า "โอเวอร์ไดรฟ์" โจมตีแรงแบบไม่เสีย MP ได้ทันที',
      en: 'Every landed hit builds your Focus gauge (crits build it faster). Once it\'s full, unleash Overdrive for a heavy hit that costs no MP.'
    },
    guideCombatBreakLabel: { th: 'เกราะแตก', en: 'Break' },
    guideCombatBreakDesc: {
      th: 'ศัตรูที่โดนตีสะสมจะ "เกราะแตก" และรับดาเมจเพิ่มขึ้นไปตลอดเทิร์นนั้น แยกจากการเสียหลักโดยสิ้นเชิง ศัตรูตัวเดียวเสียหลักและเกราะแตกพร้อมกันได้',
      en: 'An enemy that takes enough sustained hits becomes "Broken" and takes bonus damage for the rest of that round -- completely separate from Stagger, so an enemy can be staggered and broken at the same time.'
    },
    guideTowerTitle: { th: 'การไต่หอคอย', en: 'Climbing the Tower' },
    guideTowerFloorsLabel: { th: '100 ชั้น', en: '100 Floors' },
    guideTowerFloorsDesc: { th: 'เอาชนะศัตรูแต่ละชั้นเพื่อไต่ขึ้นไป ทุกชั้นที่ผ่านได้เลือกของรางวัล 1 ชิ้น พร้อม EXP และทอง', en: 'Defeat the enemies on each floor to climb higher. Clearing a floor lets you pick one reward, plus EXP and gold.' },
    guideTowerWaypointLabel: { th: 'จุดพัก', en: 'Waypoints' },
    guideTowerWaypointDesc: {
      th: 'ทุก 5 ชั้นมีจุดพักก่อนมินิบอส — จุดพักฟื้น (ฟื้น HP/MP เต็ม), ร้านค้าเร่ร่อน (ซื้อไอเทม/อุปกรณ์), หรือห้องสมบัติ (รับของฟรี 1 ชิ้น)',
      en: "Every 5 floors has a waypoint before that tier's mini-boss — a Rest Stop (full HP/MP), a Wandering Shop (buy gear), or a Treasure Room (1 free item)."
    },
    guideTowerBossLabel: { th: 'บอสใหญ่', en: 'Final Boss' },
    guideTowerBossDesc: { th: 'ชั้น 100 คือห้องบัลลังก์ของราชันไร้กาลเวลา เตรียมตัวให้พร้อมก่อนขึ้นเผชิญหน้า', en: "Floor 100 is the throne room of the Timeless Sovereign. Come prepared before you face it." },
    guideTowerDifficultyLabel: { th: 'ความยาก', en: 'Difficulty' },
    guideTowerDifficultyDesc: {
      th: 'ง่าย ศัตรูอ่อนลง+ไอเทมเริ่มต้นเพิ่ม, ปกติ สมดุลมาตรฐาน, ยาก ศัตรูแกร่งขึ้น+รางวัลมากขึ้น, ฝันร้าย โหดสุดปลดล็อกหลังพิชิตโหมดยาก',
      en: 'Easy weakens enemies and adds starting items, Normal is standard, Hard is tougher for bigger rewards, Nightmare — the harshest — unlocks after clearing Hard.'
    },
    guideFeaturesTitle: { th: 'ระบบพิเศษ', en: 'Special Systems' },
    guideFeatureEventsLabel: { th: 'เหตุการณ์สุ่ม', en: 'Random Events' },
    guideFeatureEventsDesc: {
      th: 'มีโอกาสเจอเหตุการณ์พิเศษระหว่างชั้น (นอกจุดพัก/มินิบอส) 9 รูปแบบ เช่น พ่อค้าลึกลับ กล่องต้องห้าม หรือบ่อนพนัน แต่ละแบบให้ทางเลือกเสี่ยง-คุ้มต่างกัน',
      en: "A small chance of a special encounter between floors (outside waypoints/mini-bosses) -- 9 kinds, like a mysterious merchant, a forbidden chest, or a gambler's den, each with its own risk/reward choice."
    },
    guideFeatureBlessingsLabel: { th: 'พร & คำสาป', en: 'Blessings & Curses' },
    guideFeatureBlessingsDesc: {
      th: 'เลือกพร 1 อย่างตอนเริ่มการเดินทาง (หรือคู่พร+คำสาปที่แรงกว่า) และรับเพิ่มได้จากเหตุการณ์สุ่ม พรคงอยู่ตลอดการเดินทางนั้นจนกว่าจะตายหรือพิชิตหอคอย',
      en: 'Choose one blessing at the start of a run (or a stronger blessing+curse pair), and pick up more from random events. They last for the whole run until you fall or conquer the tower.'
    },
    guideFeatureRelicsLabel: { th: 'วัตถุโบราณ', en: 'Relics' },
    guideFeatureRelicsDesc: {
      th: 'ของวิเศษที่เปลี่ยนกฎการต่อสู้แทนที่จะบวกค่าสถานะตรง ๆ (เช่น ดูดเลือดจากการโจมตี หรือพลังพุ่งพล่านเมื่อ HP ต่ำ) มีโอกาสปรากฏเป็นตัวเลือกของรางวัลตั้งแต่ชั้น 5 ขึ้นไป คงอยู่ตลอดการเดินทางเหมือนพร และรวมกันได้หลายชิ้นเพื่อสร้างคอมโบเฉพาะตัว',
      en: 'Items that bend a combat rule instead of just adding to a stat (e.g. leeching HP on hit, or surging in power at low HP). They have a chance to appear as a reward-screen choice from floor 5 onward, last for the whole run like a blessing, and stack together for your own combos.'
    },
    guideFeatureCompanionsLabel: { th: 'สหายร่วมทาง', en: 'Companions' },
    guideFeatureCompanionsDesc: {
      th: 'ปลดล็อกสหายตามชั้นสูงสุดที่เคยไปถึง (สะสมข้ามการตาย) เลือกได้ฟรีจากหน้าสถานะ สหายจะช่วยต่อสู้อัตโนมัติทุกรอบและไม่มีวันถูกโจมตี',
      en: "Unlocked by the highest floor you've ever reached (persists across deaths). Choose one for free from the Status screen -- it acts automatically every round in battle and can never be attacked."
    },
    guideFeatureAscensionLabel: { th: 'Ascension', en: 'Ascension' },
    guideFeatureAscensionDesc: {
      th: 'ปลดล็อกหลังพิชิตหอคอยด้วยโหมด Nightmare เลือกระดับเพิ่มความยากได้ตอนเริ่มการเดินทางใหม่ ศัตรูแข็งแกร่งขึ้นแลกกับทอง/EXP/วัตถุดิบที่มากขึ้น',
      en: 'Unlocked after clearing the tower on Nightmare. Choose an extra difficulty level when starting a new Nightmare run -- tougher enemies in exchange for more gold/EXP/material rewards.'
    },
    guideFeatureCodexLabel: { th: 'สมุดเวท (Codex)', en: 'Codex' },
    guideFeatureCodexDesc: {
      th: 'สมุดสัตว์ประหลาดบันทึกศัตรูที่เคยเผชิญหน้าโดยอัตโนมัติ ส่วนความสำเร็จปลดล็อกตำแหน่งให้นำไปสวมใส่โชว์ในหน้าสถานะ',
      en: 'The Bestiary auto-records every enemy you\'ve ever fought; Achievements unlock cosmetic titles you can equip and show off on the Status screen.'
    },
    guideTipsTitle: { th: 'เคล็ดลับ', en: 'Tips' },
    guideTip1: { th: 'ป้องกัน (Guard) เมื่อ HP ต่ำเพื่อลดดาเมจลงครึ่งหนึ่ง และพกไอเทมฟื้นฟูติดตัวเสมอ', en: 'Guard when your HP is low to halve incoming damage, and always keep a healing item on hand.' },
    guideTip2: { th: 'แวะร้านค้าเร่ร่อนที่จุดพักเพื่ออัปเกรดอาวุธ เกราะ และเครื่องประดับก่อนเจอมินิบอส', en: 'Stop by the Wandering Shop at waypoints to upgrade your weapon, armor, and accessory before facing the mini-boss.' },

    // story screen (intro / ending)
    storyIntroTitle: { th: 'หอคอยแห่งความมืด', en: 'The Darkness Tower' },
    storyIntroBody: {
      th: 'เงามืดปกคลุมแผ่นดินมานานนับทศวรรษ นับตั้งแต่หอคอยแห่งความมืดผุดขึ้นกลางราตรี ดูดกลืนแสงจันทร์และความหวังของผู้คนไปทีละน้อย\n\nหมู่บ้านรอบหอคอยล่มสลาย พืชผลเหี่ยวเฉา เสียงหอนของสัตว์ร้ายดังก้องอยู่ในความมืด ไม่มีใครที่เดินเข้าไปในหอคอยแล้วกลับออกมาอีกเลย\n\nแต่เจ้าไม่ใช่คนธรรมดา เจ้าคือนักผจญภัยผู้กล้าคนสุดท้ายที่ยังศรัทธาว่าแสงสว่างจะหวนคืน เจ้าตัดสินใจก้าวเข้าสู่ประตูหอคอย เพื่อไต่ขึ้นไปเผชิญหน้ากับสิ่งที่ซ่อนอยู่เบื้องบน... และนำแสงสว่างกลับคืนสู่โลกอีกครั้ง',
      en: "Darkness has choked the land for a decade, ever since the Darkness Tower rose in the dead of night, devouring moonlight and hope alike, piece by piece.\n\nThe villages around it withered. Crops rotted in the fields. The howls of monsters echo through the dark, and no one who has entered the tower has ever returned.\n\nBut you are no ordinary soul. You are the last adventurer who still believes the light can return. You step through the tower's gate, ready to climb toward whatever waits above... and reclaim the light for the world."
    },
    storyIntroBtn: { th: 'เริ่มการเดินทาง', en: 'Begin the Journey' },
    storyEndTitle: { th: 'รุ่งอรุณแห่งสันติภาพ', en: 'Dawn of Peace' },
    storyEndBody: {
      th: 'เจ้าเคยเชื่อว่าจอมมารราชันเงาที่ชั้น 50 คือปลายทางของหอคอย แต่เมื่อมันล้มลง ประตูเบื้องบนกลับเปิดออกสู่หอคอยอีกครึ่งหนึ่งที่ถูกผนึกไว้ตั้งแต่ก่อนกาลของจอมมารเสียอีก เจ้าไต่ขึ้นไปเผชิญกับสิ่งมีชีวิตประหลาดที่ไม่มีใครเคยพบเห็น จนมาถึงบัลลังก์สูงสุดที่ชั้น 100 — ที่ซึ่ง "ราชันไร้กาลเวลา" ผู้บงการทุกสิ่งอยู่เบื้องหลังรอคอยอยู่\n\nราชันไร้กาลเวลาล้มลงต่อหน้าเจ้า เสียงกรีดร้องข้ามกาลเวลาของมันสลายหายไปพร้อมกับความมืดที่เคยปกคลุมหอคอยทั้งหลัง\n\nหินทุกก้อนของหอคอยแห่งความมืดเริ่มแตกร้าวเป็นแสง สลายกลายเป็นละอองดาวลอยขึ้นสู่ท้องฟ้า ราวกับหอคอยเองก็โล่งใจที่ได้เป็นอิสระจากคำสาปนิรันดร์\n\nรุ่งเช้าวันใหม่ แสงอาทิตย์ส่องทะลุเมฆหมอกที่ปกคลุมแผ่นดินมานานนับทศวรรษ หมู่บ้านรอบข้างเริ่มได้ยินเสียงนกร้องอีกครั้ง พืชผลผลิใบเขียวขจี และผู้คนต่างพากันมองขึ้นไปยังจุดที่หอคอยเคยตั้งตระหง่าน ด้วยรอยยิ้มแห่งความหวัง\n\nเจ้าได้กลายเป็นตำนาน... วีรบุรุษผู้ไต่หอคอยทั้ง 100 ชั้น และนำแสงสว่างกับสันติภาพกลับคืนสู่โลกอีกครั้ง',
      en: "You once believed the Shadow Demon Lord at floor 50 was the tower's final secret. But when it fell, a gate above swung open onto a second half of the tower — sealed away since long before the Demon Lord's time. You climbed on, past creatures no one had ever seen, all the way to the highest throne at floor 100, where the Timeless Sovereign, the true power behind it all, awaited.\n\nThe Timeless Sovereign collapses before you. Its scream, echoing across time itself, dissolves along with the darkness that once smothered the entire tower.\n\nEvery stone of the Darkness Tower begins to crack with light, crumbling into a shower of stardust drifting up into the sky, as if the tower itself sighs in relief, freed at last from its endless curse.\n\nAt dawn, sunlight breaks through clouds that have loomed over the land for a decade. Birdsong returns to the villages nearby, crops bloom green once more, and the people look up to where the tower once stood, smiling with hope.\n\nYou have become legend... the hero who climbed all 100 floors and brought light and peace back to the world."
    },
    storyEndBtn: { th: 'ดำเนินการต่อ', en: 'Continue' },
    pageTitle: { th: 'DARKNESS TOWER — หอคอยแห่งความมืด', en: 'DARKNESS TOWER — Tower of Darkness' },
    gameSubtitle: { th: 'หอคอยแห่งความมืด 100 ชั้น', en: '100 Floors of the Darkness Tower' },
    menuFooter: { th: 'ไต่หอคอย เอาชนะเงามืด สร้างสายฟ้าแห่งชัยชนะ', en: 'Climb the spire, defeat the shadows, forge your path to victory' },
    pushStart: { th: 'PUSH START', en: 'PUSH START' },
    cancel: { th: 'ยกเลิก', en: 'Cancel' },
    confirmNewGameTitle: { th: 'เริ่มเกมใหม่?', en: 'Start a new game?' },
    confirmNewGameMsg: { th: 'ความคืบหน้าที่เซฟไว้จะถูกลบทิ้ง ต้องการเริ่มการไต่หอคอยใหม่หรือไม่?', en: 'Your saved progress will be deleted. Start a new climb up the tower?' },
    confirmNewGameBtn: { th: 'เริ่มใหม่', en: 'Start New' },
    confirmClearTitle: { th: 'ล้างเซฟ?', en: 'Clear save?' },
    confirmClearMsg: { th: 'การกระทำนี้จะลบความคืบหน้าทั้งหมดอย่างถาวร', en: 'This will permanently delete all saved progress.' },
    confirmClearBtn: { th: 'ล้างเซฟ', en: 'Clear Save' },
    confirmBossTitle: { th: 'พร้อมเผชิญหน้าหรือยัง?', en: 'Ready to face it?' },
    confirmBossMsg: { th: 'จะเข้าสู้กับ {name} เลยหรือไม่?', en: 'Enter battle with {name} now?' },
    confirmBossFightBtn: { th: 'ไปสู้เลย', en: 'Fight Now' },
    confirmBossPrepareBtn: { th: 'เตรียมตัวก่อน', en: 'Prepare First' },

    // class lock reasons
    classLockedDifficultyDesc: { th: 'ล็อกอยู่ — พิชิตหอคอยด้วยโหมด {difficulty} ให้จบก่อนจึงจะปลดล็อกคลาสนี้', en: 'Locked — clear the tower on {difficulty} difficulty to unlock this class.' },
    classLockedSurvivalDesc: { th: 'ล็อกอยู่ — ผ่านคลื่นในสนามประลองไร้สิ้นสุดให้ครบ {waves} คลื่นในเซสชันเดียวจึงจะปลดล็อกคลาสนี้', en: 'Locked — clear {waves} waves in a single Survival Arena session to unlock this class.' },
    enemyPowerLabel: { th: 'พลังศัตรู x', en: 'Enemy power x' },
    rewardLabel: { th: 'รางวัล x', en: 'Reward x' },

    // class select
    chooseClassTitle: { th: 'เลือกคลาสตัวละคร', en: 'Choose Your Class' },

    // tower
    statusEquip: { th: 'สถานะ & อุปกรณ์', en: 'Status & Equipment' },
    towerTitle: { th: 'หอคอยแห่งความมืด', en: 'Darkness Tower' },
    towerJumpCurrent: { th: 'ชั้นล่าสุด', en: 'Current Floor' },

    // Endless Arena (survival mode)
    survivalBtn: { th: 'สนามประลอง', en: 'Endless Arena' },
    survivalIntroTitle: { th: 'สนามประลองไม่สิ้นสุด', en: 'The Endless Arena' },
    survivalIntroMsg: {
      th: 'ต่อสู้กับศัตรูสุ่มไปเรื่อย ๆ ไม่จำกัดจำนวนคลื่น ความยากจะเพิ่มขึ้นทุก ๆ 5 คลื่น รางวัลมีแค่ EXP และวัตถุดิบคราฟต์เท่านั้น (ไม่มีทองหรืออุปกรณ์) HP/MP จะไม่ฟื้นฟูระหว่างคลื่น กดหยุดเมื่อไรก็ได้เพื่อเก็บของรางวัลและดูสรุปผล ไม่กระทบความคืบหน้าของหอคอย',
      en: "Fight endless waves of random enemies. Difficulty climbs every 5 waves. Rewards are EXP and crafting materials only (no gold or gear). HP/MP don't recover between waves. Stop anytime to bank your rewards and see a summary -- your tower progress is never affected."
    },
    survivalIntroConfirmBtn: { th: 'เข้าสู่สนามประลอง', en: 'Enter the Arena' },
    survivalWaveLabel: { th: 'คลื่นที่ {wave}', en: 'Wave {wave}' },
    survivalTallySuffix: { th: ' · EXP รวม {exp}', en: ' · Total EXP {exp}' },
    survivalStopTitle: { th: 'หยุดและสรุปผล?', en: 'Stop and see the summary?' },
    survivalStopMsg: {
      th: 'ความคืบหน้าในคลื่นปัจจุบันที่ยังไม่จบจะไม่ถูกนับ แต่ EXP และวัตถุดิบจากทุกคลื่นที่ผ่านมาแล้วจะถูกเก็บไว้ทั้งหมด',
      en: "Progress in the current, unfinished wave won't count, but every EXP and material reward from waves you've already cleared is kept."
    },
    survivalStopConfirmBtn: { th: 'หยุด & ดูสรุป', en: 'Stop & Summarize' },
    survivalKnockedOutLog: { th: 'คุณถูกปราบ! ล่าถอยออกจากสนามประลอง...', en: "You've been knocked out! Retreating from the arena..." },
    survivalSummaryStoppedTitle: { th: 'จบการประลอง', en: 'Session Complete' },
    survivalSummaryDefeatedTitle: { th: 'ถูกปราบกลางสนาม', en: 'Knocked Out' },
    survivalSummaryDesc: { th: 'ผ่านมาแล้ว {waves} คลื่น นี่คือของรางวัลที่คุณได้รับ', en: 'You cleared {waves} waves. Here is what you earned.' },
    survivalSummaryStatsTitle: { th: 'สรุปผล', en: 'Summary' },
    survivalSummaryWavesLabel: { th: 'คลื่นที่ผ่าน', en: 'Waves Cleared' },
    survivalSummaryMaterialsTitle: { th: 'วัตถุดิบที่ได้รับ', en: 'Materials Gained' },
    survivalSummaryNoMaterials: { th: 'ไม่ได้วัตถุดิบในรอบนี้', en: 'No materials dropped this session' },
    survivalSummaryAgainBtn: { th: 'เข้าประลองอีกครั้ง', en: 'Enter Again' },
    survivalSummaryBackBtn: { th: 'กลับสู่หอคอย', en: 'Back to Tower' },

    // Quests
    questsBtn: { th: 'ภารกิจ', en: 'Quests' },
    questsScreenTitle: { th: 'ภารกิจ', en: 'Quests' },
    questsNote: {
      th: 'ภารกิจทุกอันเริ่มทำงานอัตโนมัติ ไม่ต้องกดรับก่อน แค่เล่นไปตามปกติแล้วกลับมารับรางวัลได้เมื่อทำสำเร็จ',
      en: "Every quest tracks automatically -- no need to accept one first. Just play normally, then come back to claim the reward once it's done."
    },
    questsClaimAllBtn: { th: 'รับรางวัลทั้งหมด', en: 'Claim All' },
    questProgressLabel: { th: 'ความคืบหน้า', en: 'Progress' },
    questClaimBtn: { th: 'รับรางวัล', en: 'Claim' },
    questClaimedTag: { th: 'รับแล้ว', en: 'Claimed' },
    questReadyTag: { th: 'พร้อมรับ!', en: 'Ready!' },
    questInProgressTag: { th: 'กำลังดำเนินการ', en: 'In Progress' },
    questsClaimSummaryTitle: { th: 'สรุปรางวัลที่ได้รับ', en: 'Rewards Claimed' },

    bossFloorTitle: { th: 'ชั้นบัลลังก์ · ราชันไร้กาลเวลา', en: 'Throne Floor · The Timeless Sovereign' },
    bossFloorSub: { th: 'บอสประจำหอคอย', en: 'The tower\'s guardian boss' },
    floorLabel: { th: 'ชั้นที่ ', en: 'Floor ' },
    floorSub: { th: 'ที่พักพิงของเงามืด · ชั้น ', en: 'A lair of shadows · Floor ' },
    miniBossFloorSub: { th: 'ศัตรูมินิบอสรอคุณอยู่', en: 'A mini-boss awaits' },
    goldLabel: { th: 'ทอง', en: 'Gold' },
    continueBtn: { th: 'ดำเนินการต่อ', en: 'Continue' },

    // shop screen (persistent, always accessible from the tower map)
    shopBtn: { th: 'ร้านค้า', en: 'Shop' },
    shopScreenTitle: { th: 'ร้านค้า', en: 'Shop' },
    shopResetNote: { th: 'สินค้าจะเปลี่ยนใหม่ทุกครั้งที่ผ่านมินิบอส', en: "Stock refreshes every time you clear a mini-boss" },
    shopOutOfStock: { th: 'ของหมด', en: 'Out of Stock' },
    shopStockLeft: { th: 'เหลือ {qty} ชิ้น', en: '{qty} left' },
    shopConsumablesLabel: { th: 'ยาและเครื่องใช้', en: 'Potions & Items' },
    shopMaterialsLabel: { th: 'วัตถุดิบคราฟต์', en: 'Crafting Materials' },
    shopTabBuy: { th: 'ซื้อของ', en: 'Buy' },
    shopTabSell: { th: 'ขายของ', en: 'Sell' },
    shopSellNote: { th: 'รับซื้อคืนที่ 20-30% ของราคาซื้อ ยิ่งหายาก/ยิ่งใหม่ ยิ่งได้ราคาดี', en: "Buys back at 20-30% of the purchase price -- rarer and fresher items fetch a better cut" },
    shopSellPrice: { th: 'ขายได้ {price} ทอง', en: 'Sell for {price} Gold' },
    shopSellEmptyNote: { th: 'ไม่มีของในกระเป๋าให้ขาย', en: 'Nothing in your bag to sell' },

    // crafting bench (persistent, always accessible from the tower map)
    craftBtn: { th: 'คราฟต์', en: 'Craft' },
    craftScreenTitle: { th: 'โต๊ะคราฟต์', en: 'Crafting Bench' },
    craftNote: { th: 'ใช้วัตถุดิบที่ได้จากการปราบมอนสเตอร์และทองเพื่อคราฟต์อุปกรณ์เฉพาะ', en: 'Spend materials dropped by defeated monsters, plus gold, to craft exclusive gear.' },
    craftGoldLabel: { th: 'ทองที่ต้องใช้', en: 'Gold Cost' },
    craftEmptyNote: { th: 'ยังไม่มีสูตรคราฟต์ที่ปลดล็อกในชั้นนี้', en: 'No recipes unlocked at this floor tier yet' },

    // waypoint stops (floors 5/10/15, gate the mini-bosses)
    waypointRestTitle: { th: 'จุดพักฟื้น', en: 'Rest Stop' },
    waypointRestDesc: { th: 'พักฟื้นให้เต็มก่อนเผชิญหน้ากับมินิบอส', en: 'Recover fully before you face the mini-boss ahead.' },
    waypointRestBtn: { th: 'พักฟื้น', en: 'Rest' },
    waypointShopTitle: { th: 'ร้านค้าเร่ร่อน', en: 'Wandering Shop' },
    waypointShopDesc: { th: 'ใช้ทองที่เก็บมาซื้อไอเทมก่อนไปต่อ', en: 'Spend the gold you\'ve gathered before moving on.' },
    waypointTreasureTitle: { th: 'ห้องสมบัติ', en: 'Treasure Room' },
    waypointTreasureDesc: { th: 'เลือกของขวัญฟรี 1 ชิ้นก่อนเผชิญหน้ากับมินิบอส', en: 'Pick one free item before you face the mini-boss ahead.' },
    purchasedLabel: { th: 'ซื้อแล้ว', en: 'Purchased' },

    // reward
    rewardScreenTitle: { th: 'ผ่านด่านสำเร็จ!', en: 'Floor Cleared!' },
    rewardPickOne: { th: 'เลือกของรางวัล 1 ชิ้น', en: 'Choose 1 reward' },
    rewardClearedPrefix: { th: 'ผ่านชั้นที่ ', en: 'Cleared floor ' },
    rewardClearedSuffix: { th: ' สำเร็จ!', en: '!' },

    // status & equipment screen
    statusScreenTitle: { th: 'สถานะตัวละคร', en: 'Character Status' },
    statusPanelTitle: { th: 'สถานะ', en: 'Status' },
    equipPanelTitle: { th: 'อุปกรณ์', en: 'Equipment' },
    weaponLabel: { th: 'อาวุธ', en: 'Weapon' },
    armorLabel: { th: 'เกราะ', en: 'Armor' },
    accessoryLabel: { th: 'เครื่องประดับ', en: 'Accessory' },
    accessoryLabelN: { th: 'เครื่องประดับ {n}', en: 'Accessory {n}' },
    shoesLabel: { th: 'รองเท้า', en: 'Shoes' },
    emptySlot: { th: 'ว่าง — แตะเพื่อเลือกอุปกรณ์', en: 'Empty — tap to choose equipment' },
    inventoryPanelTitle: { th: 'คลังไอเทม', en: 'Inventory' },
    emptyInventory: { th: 'คลังไอเทมว่างเปล่า', en: 'Inventory is empty' },
    useBtn: { th: 'ใช้', en: 'Use' },
    chooseEquipTitle: { th: 'เลือกอุปกรณ์', en: 'Choose Equipment' },
    noEquipInInventory: { th: 'ไม่มีอุปกรณ์ในคลังสำหรับช่องนี้', en: 'No equipment in inventory for this slot' },
    unequipBtn: { th: 'ถอดออก', en: 'Unequip' },
    closeBtn: { th: 'ปิด', en: 'Close' },

    // end screen
    victoryTitle: { th: 'พิชิตหอคอยสำเร็จ!', en: 'Tower Conquered!' },
    victoryMsg: { th: 'คุณเอาชนะราชันไร้กาลเวลาและพิชิตหอคอยแห่งความมืดทั้ง 100 ชั้นได้สำเร็จ!', en: 'You defeated the Timeless Sovereign and conquered all 100 floors of the Darkness Tower!' },
    defeatTitle: { th: 'พ่ายแพ้...', en: 'Defeated...' },
    defeatMsg: { th: 'การไต่หอคอยของคุณจบลงเพียงเท่านี้ ลองอีกครั้งเพื่อพิชิตหอคอยให้ได้!', en: 'Your climb ends here. Try again to conquer the tower!' },
    backToMenu: { th: 'กลับสู่เมนูหลัก', en: 'Back to Main Menu' },

    // battle actions
    attackLabel: { th: 'โจมตี', en: 'Attack' },
    skillsLabel: { th: 'ทักษะ', en: 'Skills' },
    guardLabel: { th: 'ป้องกัน', en: 'Guard' },
    itemsLabel: { th: 'ไอเทม', en: 'Items' },
    freeLabel: { th: 'ฟรี', en: 'Free' },
    selectSkillTitle: { th: 'เลือกทักษะ', en: 'Choose a Skill' },
    noMoreSkills: { th: 'ยังไม่มีทักษะเพิ่มเติม', en: 'No more skills learned yet' },
    useItemTitle: { th: 'ใช้ไอเทม', en: 'Use Item' },
    noUsableItems: { th: 'ไม่มีไอเทมที่ใช้ได้ในการต่อสู้', en: 'No usable items in battle' },
    selectTargetTitle: { th: 'เลือกเป้าหมาย', en: 'Select a Target' },
    tapEnemyHint: { th: 'แตะศัตรูที่ต้องการเลือกเป็นเป้าหมาย', en: 'Tap the enemy you want to target' },
    downedTag: { th: 'เสียหลัก!', en: 'Staggered!' },
    brokenTag: { th: 'เกราะแตก!', en: 'Broken!' },
    overdriveLabel: { th: 'โอเวอร์ไดรฟ์', en: 'Overdrive' },
    phaseLabel: { th: ' · เฟส ', en: ' · Phase ' },
    replaySuffix: { th: ' (เล่นซ้ำ)', en: ' (Replay)' },

    // all-out attack modal
    allOutTitle: { th: 'ศัตรูตัวนั้นมึนงง', en: 'Enemy Dazed!' },
    allOutDesc: { th: 'ต้องการโจมตีรวมพลังหรือไม่? การโจมตีนี้จะจบเทิร์นของคุณทันที', en: 'Unleash an All-Out Attack? This will end your turn immediately.' },
    allOutContinue: { th: 'โจมตีต่อปกติ', en: 'Attack Normally' },
    allOutConfirm: { th: 'โจมตีหลักทันที!', en: 'Attack Now!' },

    // leave-battle modal
    leaveBattleTitle: { th: 'กลับสู่หอคอย?', en: 'Return to the tower?' },
    leaveBattleMsg: { th: 'ออกจากการต่อสู้ตอนนี้ ความคืบหน้าของการต่อสู้นี้จะหายไป', en: 'Leaving now will forfeit your progress in this battle.' },
    keepFighting: { th: 'สู้ต่อ', en: 'Keep Fighting' },
    returnToTower: { th: 'กลับสู่หอคอย', en: 'Return to Tower' },

    // toasts / floating text
    toastCrit: { th: 'คริติคอล!', en: 'Critical!' },
    toastAllOutReady: { th: 'พร้อมโจมตีรวมพลัง!', en: 'All-Out Attack Ready!' },
    toastPhase2: { th: 'เฟส 2!', en: 'Phase 2!' },
    toastPlayerCrit: { th: 'โดนคริติคอล!', en: 'Critical hit!' },
    toastInvalidAction: { th: 'ทำไม่ได้ตอนนี้', en: 'Can\'t do that right now' },
    toastOverdriveReady: { th: 'พลังเต็ม! ใช้โอเวอร์ไดรฟ์ได้แล้ว', en: 'Focus maxed! Overdrive is ready!' },

    // battle log templates ({name}, {target}, {attacker}, {amount}, {skill}, {level}, {exp} placeholders)
    logSkillUsed: { th: 'ใช้ {name}', en: 'Used {name}' },
    logEnemyDamage: { th: '{target} ได้รับ {amount} ดาเมจ{tag}', en: '{target} took {amount} damage{tag}' },
    logPlayerDamage: { th: 'โดน {skill} จาก {attacker} ({amount} ดาเมจ){tag}', en: 'Hit by {attacker}\'s {skill} ({amount} damage){tag}' },
    logDowned: { th: '{target} เสียหลัก!', en: '{target} is staggered!' },
    logEnemyBroken: { th: '{target} เกราะแตก! รับดาเมจเพิ่มขึ้น!', en: "{target}'s guard breaks! Taking bonus damage!" },
    logOverdriveUsed: { th: 'ปลดปล่อยโอเวอร์ไดรฟ์!', en: 'Overdrive unleashed!' },
    logDefeated: { th: '{target} ถูกกำจัด!', en: '{target} was defeated!' },
    logHeal: { th: 'ฟื้นฟู {amount} HP', en: 'Restored {amount} HP' },
    logHpSacrifice: { th: 'สังเวย {amount} HP เพื่อร่ายพลังเลือด', en: 'Sacrificed {amount} HP to fuel blood magic' },
    logBuffUp: { th: '{who} ได้รับ {stat} เพิ่มขึ้น', en: '{who} gained increased {stat}' },
    logBuffDown: { th: '{who} ถูกลด {stat} ลง', en: '{who} had {stat} lowered' },
    logGuard: { th: 'ตั้งท่าป้องกัน', en: 'Took a defensive stance' },
    logItemUsed: { th: 'ใช้ไอเทม', en: 'Used an item' },
    logAllOutReady: { th: 'ศัตรูทั้งหมดเสียหลัก! พร้อมโจมตีรวมพลัง!', en: 'All enemies staggered! Ready for an All-Out Attack!' },
    logAllOutStart: { th: 'โจมตีรวมพลัง!!', en: 'All-Out Attack!!' },
    logAllOutHit: { th: '{target} ได้รับ {amount} ดาเมจ{defeated}', en: '{target} took {amount} damage{defeated}' },
    logAllOutHitDefeatedTag: { th: ' และถูกกำจัด!', en: ' and was defeated!' },
    logAllOutDeclined: { th: 'ไม่ใช้การโจมตีรวมพลัง', en: 'Did not use the All-Out Attack' },
    logEnemyPhaseSkip: { th: '{target} กำลังลุกขึ้นยืน (ข้ามเทิร์น)', en: '{target} is getting back up (skips turn)' },
    logVictory: { th: 'ชนะการต่อสู้!', en: 'Victory!' },
    logDefeat: { th: 'คุณพ่ายแพ้...', en: 'You were defeated...' },
    logFirstStrike: { th: 'ศัตรูจู่โจมก่อน!', en: 'The enemy strikes first!' },
    logBattleStart: { th: '{name} ปรากฏตัว!', en: '{name} appears!' },
    logBattleStartMulti: { th: 'ศัตรูปรากฏตัว!', en: 'Enemies appear!' },
    logInvalidAction: { th: 'ทำไม่ได้ตอนนี้', en: 'Can\'t do that right now' },
    logExpGained: { th: 'ได้รับ {exp} EXP', en: 'Gained {exp} EXP' },
    logGoldGained: { th: 'ได้รับ {gold} ทอง', en: 'Gained {gold} Gold' },
    logMaterialGained: { th: 'ได้รับวัตถุดิบ {name} x{qty}', en: 'Got {qty}x {name}' },
    logLevelUp: { th: 'เลเวลอัพ! ตอนนี้เลเวล {level}!', en: 'Level up! Now level {level}!' },
    critTag: { th: ' [คริติคอล]', en: ' [Critical]' },
    youPronoun: { th: 'คุณ', en: 'You' },

    // stat names
    statAtk: { th: 'พลังโจมตี', en: 'ATK' },
    statMag: { th: 'พลังเวท', en: 'MAG' },
    statDef: { th: 'การป้องกัน', en: 'DEF' },
    statRes: { th: 'ต้านเวท', en: 'RES' },
    statSpd: { th: 'ความเร็ว', en: 'SPD' },
    statLuk: { th: 'โชค', en: 'LUK' },
    statAtkMag: { th: 'พลังโจมตี/เวท', en: 'ATK/MAG' },
    statDefRes: { th: 'การป้องกัน/ต้านเวท', en: 'DEF/RES' },

    // Ascension level picker (Nightmare-only, run-start screen)
    ascensionScreenTitle: { th: 'เลือกระดับ Ascension', en: 'Choose Ascension Level' },
    ascensionSub: {
      th: 'ยิ่งระดับสูง ศัตรูยิ่งแข็งแกร่งขึ้น แต่ก็ได้รับทอง/EXP/วัตถุดิบมากขึ้นตามไปด้วย เลือกระดับ 0 เพื่อเล่นแบบปกติ',
      en: 'Higher levels make enemies tougher, but gold/EXP/material rewards scale up to match. Choose level 0 for a normal run.'
    },
    ascensionLevelZeroTitle: { th: 'ไม่ใช้ Ascension', en: 'No Ascension' },
    ascensionLevelZeroDesc: { th: 'เล่นแบบปกติ ไม่มีการปรับพลังศัตรูหรือรางวัลเพิ่มเติม', en: 'A normal run -- no extra enemy toughness or reward bonus.' },
    ascensionLevelTitle: { th: 'Ascension ระดับ {level}', en: 'Ascension Level {level}' },
    ascensionLevelDesc: { th: 'ศัตรูแข็งแกร่งขึ้น แลกกับทอง/EXP/วัตถุดิบที่มากขึ้น', en: 'Tougher enemies, in exchange for more gold/EXP/material rewards.' },
    ascensionChipLabel: { th: 'ระดับ Ascension ของการเดินทางนี้', en: "This run's Ascension level" },

    // Blessing pick (run-start screen)
    blessingPickTitle: { th: 'เลือกพรประจำการเดินทาง', en: 'Choose a Blessing for This Run' },
    blessingPickSub: { th: 'เลือกพร 1 อย่าง (หรือคู่พร+คำสาปที่แรงกว่า) เพื่อเริ่มการเดินทาง หรือข้ามก็ได้', en: 'Pick one blessing (or a stronger blessing+curse pair) to start your run with, or skip.' },
    blessingSkipBtn: { th: 'ข้าม', en: 'Skip' },
    blessingRiskyTag: { th: 'เสี่ยง', en: 'Risky' },

    // Random tower events
    eventMerchantTitle: { th: 'พ่อค้าลึกลับ', en: 'The Mysterious Merchant' },
    eventMerchantDesc: { th: 'พ่อค้าเร่ปรากฏตัวขึ้นพร้อมของหายากไม่กี่ชิ้น ซื้อเท่าที่มีทองพอ', en: 'A traveling merchant appears with a handful of rare wares. Buy whatever you can afford.' },
    eventChestTitle: { th: 'กล่องต้องห้าม', en: 'The Forbidden Chest' },
    eventChestDesc: { th: 'กล่องประหลาดวางอยู่กลางทาง เปิดดูไหม?', en: 'A strange chest sits in your path. Open it?' },
    eventChestOpenBtn: { th: 'เปิดกล่อง', en: 'Open the Chest' },
    eventChestOpenDesc: { th: 'อาจได้ของดี หรืออาจเจอกับดัก', en: 'Could be treasure, could be a trap.' },
    eventChestLeaveBtn: { th: 'เดินผ่านไป', en: 'Walk Away' },
    eventChestLeaveDesc: { th: 'ปลอดภัยไว้ก่อน', en: 'Better safe than sorry.' },
    eventChestGoodTitle: { th: 'เจอของดี!', en: 'Treasure!' },
    eventChestGoldMsg: { th: 'พบทอง {gold} เหรียญในกล่อง', en: 'You found {gold} gold inside.' },
    eventChestBlessingMsg: { th: 'พบพร "{name}" ในกล่อง', en: 'You found the "{name}" blessing inside.' },
    eventChestMaterialMsg: { th: 'พบวัตถุดิบ {name} x{qty} ในกล่อง', en: 'You found {qty}x {name} inside.' },
    eventChestTrapTitle: { th: 'กับดัก!', en: 'A Trap!' },
    eventChestTrapMsg: { th: 'กล่องระเบิดใส่คุณ! เสีย {dmg} HP และได้รับคำสาป "{name}"', en: 'The chest explodes! You lose {dmg} HP and gain the "{name}" curse.' },
    eventShortcutTitle: { th: 'ทางลัดเสี่ยงดวง', en: 'A Risky Shortcut' },
    eventShortcutDesc: { th: 'มีช่องแคบที่ดูเหมือนจะลัดผ่านชั้นนี้ไปได้', en: 'A narrow gap looks like it could skip this floor entirely.' },
    eventShortcutPushBtn: { th: 'ฝ่าไป', en: 'Push Through' },
    eventShortcutPushDesc: { th: 'เสีย HP บางส่วน แต่ข้ามการต่อสู้ของชั้นนี้ไปได้ทันที', en: 'Costs some HP, but skips this floor\'s battle entirely.' },
    eventShortcutSafeBtn: { th: 'ไปตามทางปกติ', en: 'Take the Safe Path' },
    eventShortcutSafeDesc: { th: 'ไม่มีผลใด ๆ', en: 'No effect.' },
    eventSageTitle: { th: 'ปราชญ์เร่ร่อน', en: 'The Wandering Sage' },
    eventSageDesc: { th: 'ปราชญ์ชราเสนอจะแลกเปลี่ยนความรู้กับคุณ', en: 'An old sage offers to trade knowledge with you.' },
    eventSageGoldBtn: { th: 'แลกทองเป็นประสบการณ์', en: 'Trade Gold for EXP' },
    eventSageGoldDesc: { th: 'จ่าย {gold} ทอง รับ {exp} EXP ทันที', en: 'Pay {gold} gold, instantly gain {exp} EXP.' },
    eventSageMaterialBtn: { th: 'แลกวัตถุดิบเป็นทักษะ', en: 'Trade Materials for a Skill' },
    eventSageMaterialDesc: { th: 'มอบวัตถุดิบ {qty} ชิ้น แลกกับม้วนคัมภีร์ทักษะ 1 ม้วน', en: 'Give up {qty} of one material, receive a Skill Scroll.' },
    eventShrineTitle: { th: 'ศาลเจ้าต้องสาป', en: 'The Cursed Shrine' },
    eventShrineDesc: { th: 'ศาลเจ้าโบราณเสนอพลังที่แรงขึ้น แลกกับคำสาปที่ติดตัวไปตลอดการเดินทาง', en: 'An ancient shrine offers greater power, in exchange for a curse that lasts the rest of your run.' },
    eventCompanionTitle: { th: 'สหายพเนจร', en: 'The Wandering Companion' },
    eventCompanionDesc: { th: 'สิ่งมีชีวิตตัวหนึ่งเฝ้ามองคุณอยู่ ดูเหมือนจะอยากร่วมทางด้วย', en: 'A creature watches you from the shadows. It seems to want to join your journey.' },
    eventCompanionNoneNote: { th: 'ตอนนี้ไม่มีสหายตัวใหม่ให้พบแล้ว', en: 'There are no new companions to meet right now.' },
    declineBtn: { th: 'ปฏิเสธ', en: 'Decline' },
    eventDeclineDesc: { th: 'ปฏิเสธและเดินหน้าต่อ', en: 'Decline and move on.' },
    eventSpringTitle: { th: 'บ่อน้ำพุลับ', en: 'The Hidden Spring' },
    eventSpringDesc: { th: 'บ่อน้ำพุประหลาดเรืองแสงอ่อน ๆ อยู่ข้างทาง', en: 'A strange spring glows faintly beside the path.' },
    eventSpringDrinkBtn: { th: 'ดื่มน้ำจากบ่อ', en: 'Drink from the Spring' },
    eventSpringDrinkDesc: { th: 'ฟื้นฟู HP และ MP เต็มทันที', en: 'Fully restores HP and MP instantly.' },
    eventSpringLeaveBtn: { th: 'เดินผ่านไป', en: 'Walk Away' },
    eventSpringLeaveDesc: { th: 'ไม่มีผลใด ๆ', en: 'No effect.' },
    eventBattlefieldTitle: { th: 'สมรภูมิเก่า', en: 'The Old Battlefield' },
    eventBattlefieldDesc: { th: 'ซากอุปกรณ์จากนักผจญภัยที่มาก่อนกระจัดกระจายอยู่ทั่วบริเวณ เลือกเก็บ 1 ชิ้นได้ฟรี', en: "The gear of adventurers who came before litters the ground. Pick one item to keep, free." },
    eventGamblerTitle: { th: 'บ่อนพนันเร่ร่อน', en: "The Gambler's Den" },
    eventGamblerDesc: { th: 'นักพนันปริศนาเปิดโต๊ะเสี่ยงโชคกลางทาง เดิมพันทองแลกโอกาสได้เพิ่มเป็นสองเท่า', en: 'A mysterious gambler has set up a table. Bet gold for a 50/50 chance to double it.' },
    eventGamblerTierSmall: { th: 'เดิมพันเล็ก (25%)', en: 'Small Bet (25%)' },
    eventGamblerTierMedium: { th: 'เดิมพันกลาง (50%)', en: 'Medium Bet (50%)' },
    eventGamblerTierAll: { th: 'ทุ่มหมดหน้าตัก (100%)', en: 'All In (100%)' },
    eventGamblerBetDesc: { th: 'เดิมพัน {gold} ทอง โอกาสชนะ 50%', en: 'Bet {gold} gold, 50% chance to win.' },
    eventGamblerLeaveBtn: { th: 'ไม่เล่น', en: "Don't Bet" },
    eventGamblerLeaveDesc: { th: 'เดินจากโต๊ะพนันไป', en: 'Walk away from the table.' },
    eventGamblerWinTitle: { th: 'ชนะ!', en: 'You Win!' },
    eventGamblerWinMsg: { th: 'คุณได้รับทอง {gold} เหรียญ!', en: 'You won {gold} gold!' },
    eventGamblerLoseTitle: { th: 'แพ้!', en: 'You Lose!' },
    eventGamblerLoseMsg: { th: 'คุณเสียทอง {gold} เหรียญไปกับการพนัน', en: 'You lost {gold} gold at the table.' },

    // Companion (Status screen slot + picker + battle panel)
    companionLabel: { th: 'สหายร่วมทาง', en: 'Companion' },
    companionLockedDesc: { th: 'ล็อกอยู่ — ไต่หอคอยให้ถึงชั้น {floor} (สะสมตลอดทุกการเดินทาง) จึงจะปลดล็อก', en: 'Locked — reach floor {floor} (across any run, ever) to unlock.' },
    chooseCompanionTitle: { th: 'เลือกสหายร่วมทาง', en: 'Choose a Companion' },
    dismissCompanionBtn: { th: 'ปล่อยสหายออกไป', en: 'Dismiss Companion' },
    companionRoleAttacker: { th: 'ผู้โจมตี', en: 'Attacker' },
    companionRoleHealer: { th: 'ผู้เยียวยา', en: 'Healer' },
    companionRoleGuardian: { th: 'ผู้พิทักษ์', en: 'Guardian' },
    companionRoleBuffer: { th: 'ผู้เสริมพลัง', en: 'Buffer' },
    logCompanionHit: { th: '{companion} โจมตี {target} ({amount} ดาเมจ){tag}', en: "{companion} strikes {target} ({amount} damage){tag}" },
    logCompanionHeal: { th: '{companion} ฟื้นฟู {amount} HP ให้คุณ', en: '{companion} restores {amount} HP to you' },
    logCompanionBuff: { th: '{companion} เสริมพลังให้คุณ', en: '{companion} empowers you' },
    logBlessingRevive: { th: 'พรแห่งเทพผู้พิทักษ์ปกป้องคุณจากความตาย!', en: 'The Guardian Spirit blessing shields you from death!' },
    toastBlessingRevive: { th: 'ฟื้นคืนชีพ!', en: 'Revived!' },

    // Codex: Bestiary + Achievements
    codexBtn: { th: 'สมุดเวท', en: 'Codex' },
    codexScreenTitle: { th: 'สมุดเวท', en: 'Codex' },
    bestiaryTabBtn: { th: 'สมุดสัตว์ประหลาด', en: 'Bestiary' },
    achievementsTabBtn: { th: 'ความสำเร็จ', en: 'Achievements' },
    bestiaryNote: { th: 'ค้นพบศัตรูโดยเผชิญหน้ากับพวกมันในการต่อสู้', en: 'Discover enemies by encountering them in battle.' },
    achievementsNote: { th: 'ปลดล็อกความสำเร็จเพื่อรับตำแหน่งไปแสดงในหน้าสถานะ', en: 'Unlock achievements to earn titles you can equip on your Status screen.' },
    bestiaryDiscoveredNote: { th: 'ค้นพบแล้ว', en: 'Discovered' },
    bestiaryUndiscoveredNote: { th: 'ยังไม่เคยเผชิญหน้า', en: 'Not yet encountered' },
    bestiaryTierLabel: { th: 'ระดับชั้น {tier}', en: 'Tier {tier}' },
    bestiaryMinibossLabel: { th: 'มินิบอส', en: 'Mini-Bosses' },
    bestiaryBossLabel: { th: 'บอสใหญ่', en: 'Final Boss' },
    achievementEquippedTag: { th: 'สวมอยู่', en: 'Equipped' },
    achievementUnlockedTag: { th: 'ปลดล็อกแล้ว', en: 'Unlocked' },
    achievementLockedTag: { th: 'ยังไม่ปลดล็อก', en: 'Locked' },
    achievementEquipBtn: { th: 'สวมตำแหน่ง', en: 'Equip Title' },
    achievementUnequipBtn: { th: 'ถอดตำแหน่ง', en: 'Unequip Title' },

    // misc aria labels
    ariaBack: { th: 'ย้อนกลับ', en: 'Back' },
    ariaHome: { th: 'กลับสู่หอคอย', en: 'Return to tower' },
    ariaMainMenu: { th: 'กลับสู่เมนูหลัก', en: 'Return to main menu' },
    ariaAudioToggle: { th: 'เปิด/ปิดเสียง', en: 'Toggle sound' },
    ariaVolume: { th: 'ระดับเสียงเพลง', en: 'Music volume' },
    ariaLangToggle: { th: 'เปลี่ยนภาษา', en: 'Change language' }
  };

  function t(key, vars) {
    var entry = STRINGS[key];
    var str = entry ? (entry[lang] || entry.th || key) : key;
    if (vars) {
      str = str.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : ''; });
    }
    return str;
  }

  // Static (non-JS-rendered) page text: {id, key, attr?} -- attr set means
  // translate that attribute instead of textContent (e.g. aria-label).
  var STATIC_MAP = [
    { id: 'game-subtitle', key: 'gameSubtitle' },
    { id: 'menu-footer', key: 'menuFooter' },
    { id: 'push-start', key: 'pushStart' },
    { id: 'guide-title', key: 'guideTitle' },
    { id: 'guide-back', key: 'ariaBack', attr: 'aria-label' },
    { id: 'class-title', key: 'chooseClassTitle' },
    { id: 'class-back', key: 'ariaBack', attr: 'aria-label' },
    { id: 'ascension-title', key: 'ascensionScreenTitle' },
    { id: 'ascension-back', key: 'ariaBack', attr: 'aria-label' },
    { id: 'codex-back', key: 'ariaBack', attr: 'aria-label' },
    { id: 'tower-title', key: 'towerTitle' },
    { id: 'tower-home', key: 'ariaMainMenu', attr: 'aria-label' },
    { id: 'reward-sub', key: 'rewardPickOne' },
    { id: 'status-header-title', key: 'statusScreenTitle' },
    { id: 'status-back', key: 'ariaBack', attr: 'aria-label' },
    { id: 'shop-header-title', key: 'shopScreenTitle' },
    { id: 'shop-back', key: 'ariaBack', attr: 'aria-label' },
    { id: 'shop-reset-note', key: 'shopResetNote' },
    { id: 'craft-header-title', key: 'craftScreenTitle' },
    { id: 'craft-back', key: 'ariaBack', attr: 'aria-label' },
    { id: 'craft-note', key: 'craftNote' },
    { id: 'battle-home', key: 'ariaHome', attr: 'aria-label' },
    { id: 'audio-toggle', key: 'ariaAudioToggle', attr: 'aria-label' },
    { id: 'music-volume', key: 'ariaVolume', attr: 'aria-label' },
    { id: 'lang-toggle', key: 'ariaLangToggle', attr: 'aria-label' }
  ];

  function applyStatic() {
    document.title = t('pageTitle');
    STATIC_MAP.forEach(function (m) {
      var el = document.getElementById(m.id);
      if (!el) return;
      if (m.attr) el.setAttribute(m.attr, t(m.key));
      else el.textContent = t(m.key);
    });
    var langBtn = document.getElementById('lang-toggle');
    if (langBtn) langBtn.textContent = lang === 'en' ? 'EN' : 'TH';
  }

  // Returns obj[field + 'En'] when in English mode (falling back to obj[field]
  // if no translation was authored), otherwise obj[field].
  function L(obj, field) {
    if (!obj) return '';
    if (lang === 'en' && obj[field + 'En']) return obj[field + 'En'];
    return obj[field];
  }

  function getLang() { return lang; }

  function setLang(l) {
    if (l !== 'th' && l !== 'en') return;
    lang = l;
    try { localStorage.setItem(STORAGE_KEY, l); } catch (e) { /* ignore */ }
    document.documentElement.lang = l;
  }

  window.Game = window.Game || {};
  window.Game.I18n = { t: t, L: L, getLang: getLang, setLang: setLang, applyStatic: applyStatic };
})();
