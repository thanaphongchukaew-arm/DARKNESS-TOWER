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
    clearSave: { th: 'ล้างเซฟ', en: 'Clear Save' },

    // story screen (intro / ending)
    storyIntroTitle: { th: 'หอคอยแห่งความมืด', en: 'The Shadow Spire' },
    storyIntroBody: {
      th: 'เงามืดปกคลุมแผ่นดินมานานนับทศวรรษ นับตั้งแต่หอคอยแห่งความมืดผุดขึ้นกลางราตรี ดูดกลืนแสงจันทร์และความหวังของผู้คนไปทีละน้อย\n\nหมู่บ้านรอบหอคอยล่มสลาย พืชผลเหี่ยวเฉา เสียงหอนของสัตว์ร้ายดังก้องอยู่ในความมืด ไม่มีใครที่เดินเข้าไปในหอคอยแล้วกลับออกมาอีกเลย\n\nแต่เจ้าไม่ใช่คนธรรมดา เจ้าคือนักผจญภัยผู้กล้าคนสุดท้ายที่ยังศรัทธาว่าแสงสว่างจะหวนคืน เจ้าตัดสินใจก้าวเข้าสู่ประตูหอคอย เพื่อไต่ขึ้นไปเผชิญหน้ากับสิ่งที่ซ่อนอยู่เบื้องบน... และนำแสงสว่างกลับคืนสู่โลกอีกครั้ง',
      en: "Darkness has choked the land for a decade, ever since the Shadow Spire rose in the dead of night, devouring moonlight and hope alike, piece by piece.\n\nThe villages around it withered. Crops rotted in the fields. The howls of monsters echo through the dark, and no one who has entered the tower has ever returned.\n\nBut you are no ordinary soul. You are the last adventurer who still believes the light can return. You step through the tower's gate, ready to climb toward whatever waits above... and reclaim the light for the world."
    },
    storyIntroBtn: { th: 'เริ่มการเดินทาง', en: 'Begin the Journey' },
    storyEndTitle: { th: 'รุ่งอรุณแห่งสันติภาพ', en: 'Dawn of Peace' },
    storyEndBody: {
      th: 'จอมมารราชันเงาล้มลงต่อหน้าเจ้า เสียงกรีดร้องสุดท้ายของมันสลายหายไปพร้อมกับความมืดที่เคยปกคลุมหอคอยทั้งหลัง\n\nหินทุกก้อนของหอคอยแห่งความมืดเริ่มแตกร้าวเป็นแสง สลายกลายเป็นละอองดาวลอยขึ้นสู่ท้องฟ้า ราวกับหอคอยเองก็โล่งใจที่ได้เป็นอิสระจากคำสาป\n\nรุ่งเช้าวันใหม่ แสงอาทิตย์ส่องทะลุเมฆหมอกที่ปกคลุมแผ่นดินมานานนับทศวรรษ หมู่บ้านรอบข้างเริ่มได้ยินเสียงนกร้องอีกครั้ง พืชผลผลิใบเขียวขจี และผู้คนต่างพากันมองขึ้นไปยังจุดที่หอคอยเคยตั้งตระหง่าน ด้วยรอยยิ้มแห่งความหวัง\n\nเจ้าได้กลายเป็นตำนาน... วีรบุรุษผู้นำแสงสว่างและสันติภาพกลับคืนสู่โลกอีกครั้ง',
      en: "The Shadow Demon Lord collapses before you. Its final, shattering scream dissolves along with the darkness that once smothered the entire tower.\n\nEvery stone of the Shadow Spire begins to crack with light, crumbling into a shower of stardust drifting up into the sky, as if the tower itself sighs in relief, freed at last from its curse.\n\nAt dawn, sunlight breaks through clouds that have loomed over the land for a decade. Birdsong returns to the villages nearby, crops bloom green once more, and the people look up to where the tower once stood, smiling with hope.\n\nYou have become legend... the hero who brought light and peace back to the world."
    },
    storyEndBtn: { th: 'ดำเนินการต่อ', en: 'Continue' },
    pageTitle: { th: 'SHADOW SPIRE — หอคอยแห่งความมืด', en: 'SHADOW SPIRE — Tower of Darkness' },
    gameSubtitle: { th: 'หอคอยแห่งความมืด 50 ชั้น', en: '50 Floors of the Shadow Spire' },
    menuFooter: { th: 'ไต่หอคอย เอาชนะเงามืด ค้นหาจุดอ่อน สร้างสายฟ้าแห่งชัยชนะ', en: 'Climb the spire, defeat the shadows, find their weakness, forge your path to victory' },
    pushStart: { th: 'PUSH START', en: 'PUSH START' },
    cancel: { th: 'ยกเลิก', en: 'Cancel' },
    confirmNewGameTitle: { th: 'เริ่มเกมใหม่?', en: 'Start a new game?' },
    confirmNewGameMsg: { th: 'ความคืบหน้าที่เซฟไว้จะถูกลบทิ้ง ต้องการเริ่มการไต่หอคอยใหม่หรือไม่?', en: 'Your saved progress will be deleted. Start a new climb up the tower?' },
    confirmNewGameBtn: { th: 'เริ่มใหม่', en: 'Start New' },
    confirmClearTitle: { th: 'ล้างเซฟ?', en: 'Clear save?' },
    confirmClearMsg: { th: 'การกระทำนี้จะลบความคืบหน้าทั้งหมดอย่างถาวร', en: 'This will permanently delete all saved progress.' },
    confirmClearBtn: { th: 'ล้างเซฟ', en: 'Clear Save' },

    // difficulty select
    chooseDifficultyTitle: { th: 'เลือกระดับความยาก', en: 'Choose Difficulty' },
    diffEasyDesc: { th: 'เหมาะสำหรับผู้เริ่มต้น ศัตรูอ่อนกำลังลง และได้รับไอเทมเริ่มต้นมากกว่า', en: 'Great for beginners. Enemies are weaker and you start with more items.' },
    diffNormalDesc: { th: 'ความสมดุลมาตรฐาน ท้าทายแต่ยุติธรรม', en: 'The standard balance. Challenging but fair.' },
    diffHardDesc: { th: 'ศัตรูแข็งแกร่งขึ้นมาก แต่ได้รับของรางวัลและ EXP มากขึ้นเป็นการตอบแทน', en: 'Enemies are much tougher, but rewards and EXP are greater in return.' },
    enemyPowerLabel: { th: 'พลังศัตรู x', en: 'Enemy power x' },
    rewardLabel: { th: 'รางวัล x', en: 'Reward x' },

    // class select
    chooseClassTitle: { th: 'เลือกคลาสตัวละคร', en: 'Choose Your Class' },
    weakLabel: { th: 'จุดอ่อน', en: 'Weak' },
    resistLabel: { th: 'ต้านทาน', en: 'Resist' },

    // tower
    statusEquip: { th: 'สถานะ & อุปกรณ์', en: 'Status & Equipment' },
    towerTitle: { th: 'หอคอยแห่งความมืด', en: 'Shadow Spire' },
    bossFloorTitle: { th: 'ชั้นบัลลังก์ · จอมมารราชันเงา', en: 'Throne Floor · Shadow Demon Lord' },
    bossFloorSub: { th: 'บอสประจำหอคอย', en: 'The tower\'s guardian boss' },
    floorLabel: { th: 'ชั้นที่ ', en: 'Floor ' },
    floorSub: { th: 'ที่พักพิงของเงามืด · ชั้น ', en: 'A lair of shadows · Floor ' },
    miniBossFloorSub: { th: 'ศัตรูมินิบอสรอคุณอยู่', en: 'A mini-boss awaits' },
    goldLabel: { th: 'ทอง', en: 'Gold' },
    continueBtn: { th: 'ดำเนินการต่อ', en: 'Continue' },

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
    victoryMsg: { th: 'คุณเอาชนะจอมมารราชันเงาและพิชิตหอคอยแห่งความมืดทั้ง 50 ชั้นได้สำเร็จ!', en: 'You defeated the Shadow Demon Lord and conquered all 50 floors of the Shadow Spire!' },
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
    phaseLabel: { th: ' · เฟส ', en: ' · Phase ' },
    replaySuffix: { th: ' (เล่นซ้ำ)', en: ' (Replay)' },

    // all-out attack modal
    allOutTitle: { th: 'ศัตรูทั้งหมดเสียหลัก!', en: 'All enemies staggered!' },
    allOutDesc: { th: 'ต้องการโจมตีรวมพลังหรือไม่? การโจมตีนี้จะจบเทิร์นของคุณทันที', en: 'Unleash an All-Out Attack? This will end your turn immediately.' },
    allOutContinue: { th: 'โจมตีต่อปกติ', en: 'Attack Normally' },
    allOutConfirm: { th: 'โจมตีรวมพลัง!', en: 'All-Out Attack!' },

    // leave-battle modal
    leaveBattleTitle: { th: 'กลับสู่หอคอย?', en: 'Return to the tower?' },
    leaveBattleMsg: { th: 'ออกจากการต่อสู้ตอนนี้ ความคืบหน้าของการต่อสู้นี้จะหายไป', en: 'Leaving now will forfeit your progress in this battle.' },
    keepFighting: { th: 'สู้ต่อ', en: 'Keep Fighting' },
    returnToTower: { th: 'กลับสู่หอคอย', en: 'Return to Tower' },

    // toasts / floating text
    toastNullified: { th: 'ไร้ผล!', en: 'No Effect!' },
    toastWeak: { th: 'จุดอ่อน!', en: 'Weak Point!' },
    toastCrit: { th: 'คริติคอล!', en: 'Critical!' },
    toastBlocked: { th: 'ป้องกันได้!', en: 'Blocked!' },
    toastReflected: { th: 'สะท้อนกลับ!', en: 'Reflected!' },
    toastAbsorbed: { th: 'ถูกดูดซับ!', en: 'Absorbed!' },
    toastAllOutReady: { th: 'พร้อมโจมตีรวมพลัง!', en: 'All-Out Attack Ready!' },
    toastPhase2: { th: 'เฟส 2!', en: 'Phase 2!' },
    toastPlayerWeak: { th: 'โดนจุดอ่อน!', en: 'Hit a weak point!' },
    toastInvalidAction: { th: 'ทำไม่ได้ตอนนี้', en: 'Can\'t do that right now' },
    dmgNullified: { th: 'ไร้ผล', en: 'No effect' },
    dmgBlocked: { th: 'กันได้', en: 'Blocked' },

    // battle log templates ({name}, {target}, {attacker}, {amount}, {skill}, {level}, {exp} placeholders)
    logSkillUsed: { th: 'ใช้ {name}', en: 'Used {name}' },
    logEnemyNullified: { th: '{target} ไร้ผล!', en: 'No effect on {target}!' },
    logEnemyDamage: { th: '{target} ได้รับ {amount} ดาเมจ{tag}', en: '{target} took {amount} damage{tag}' },
    logPlayerBlocked: { th: 'ป้องกันการโจมตีของ {attacker} ได้!', en: 'Blocked {attacker}\'s attack!' },
    logPlayerDrainFail: { th: '{attacker} พยายามดูดพลังแต่ไม่สำเร็จ', en: '{attacker} tried to drain power but failed' },
    logPlayerDamage: { th: 'โดน {skill} จาก {attacker} ({amount} ดาเมจ){tag}', en: 'Hit by {attacker}\'s {skill} ({amount} damage){tag}' },
    logDowned: { th: '{target} เสียหลัก!', en: '{target} is staggered!' },
    logDefeated: { th: '{target} ถูกกำจัด!', en: '{target} was defeated!' },
    logReflect: { th: 'ดาเมจสะท้อนกลับ {amount} ใส่ {attacker}!', en: '{amount} damage reflected back at {attacker}!' },
    logDrainBlocked: { th: '{target} ดูดซับพลังงานและฟื้นฟู {amount} HP!', en: '{target} absorbed the energy and recovered {amount} HP!' },
    logHeal: { th: 'ฟื้นฟู {amount} HP', en: 'Restored {amount} HP' },
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
    logInvalidAction: { th: 'ทำไม่ได้ตอนนี้', en: 'Can\'t do that right now' },
    logExpGained: { th: 'ได้รับ {exp} EXP', en: 'Gained {exp} EXP' },
    logGoldGained: { th: 'ได้รับ {gold} ทอง', en: 'Gained {gold} Gold' },
    logLevelUp: { th: 'เลเวลอัพ! ตอนนี้เลเวล {level}!', en: 'Level up! Now level {level}!' },
    weakTag: { th: ' [จุดอ่อน]', en: ' [Weak Point]' },
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
    { id: 'diff-title', key: 'chooseDifficultyTitle' },
    { id: 'diff-back', key: 'ariaBack', attr: 'aria-label' },
    { id: 'class-title', key: 'chooseClassTitle' },
    { id: 'class-back', key: 'ariaBack', attr: 'aria-label' },
    { id: 'tower-title', key: 'towerTitle' },
    { id: 'tower-home', key: 'ariaMainMenu', attr: 'aria-label' },
    { id: 'reward-sub', key: 'rewardPickOne' },
    { id: 'status-header-title', key: 'statusScreenTitle' },
    { id: 'status-back', key: 'ariaBack', attr: 'aria-label' },
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
