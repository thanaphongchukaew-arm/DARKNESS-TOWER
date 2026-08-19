// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Player class definitions: base stats, per-level growth.
(function () {
  var classes = [
    {
      id: 'blade',
      name: 'อัศวินคมดาบ',
      nameEn: 'Blade Knight',
      icon: 'blade',
      description: 'นักสู้แนวหน้า พลังโจมตีกายภาพสูง พื้นฐานแข็งแกร่ง',
      descriptionEn: 'A frontline fighter with high physical attack and a sturdy build.',
      baseStats: { hp: 48, mp: 16, atk: 14, mag: 5, def: 13, res: 8, spd: 9, luk: 7 },
      growth: { hp: 8.8, mp: 2.2, atk: 2.7, mag: 0.6, def: 2.0, res: 1.0, spd: 0.8, luk: 0.7 }
    },
    {
      id: 'elementalist',
      name: 'นักเวทธาตุ',
      nameEn: 'Elementalist',
      icon: 'staffOrb',
      description: 'นักเวทที่ควบคุมธาตุไฟ น้ำแข็ง สายฟ้า และลม พลังเวทสูงลิ่วแต่ร่างกายบอบบาง',
      descriptionEn: 'A mage who commands fire, ice, lightning, and wind. Sky-high magic power but frail.',
      baseStats: { hp: 33, mp: 36, atk: 6, mag: 16, def: 8, res: 13, spd: 10, luk: 8 },
      growth: { hp: 5.4, mp: 5.0, atk: 0.7, mag: 3.0, def: 1.1, res: 2.0, spd: 1.0, luk: 0.9 }
    },
    {
      id: 'cleric',
      name: 'นักบวชแสงสว่าง',
      nameEn: 'Cleric',
      icon: 'radiantOrb',
      description: 'ผู้เชี่ยวชาญพลังแสงและการฟื้นฟู สมดุลทุกด้าน',
      descriptionEn: 'A master of light and restoration. Well-balanced all around.',
      baseStats: { hp: 41, mp: 27, atk: 9, mag: 12, def: 11, res: 12, spd: 10, luk: 9 },
      growth: { hp: 6.8, mp: 4.0, atk: 1.4, mag: 2.2, def: 1.5, res: 1.9, spd: 1.15, luk: 1.0 }
    },
    {
      id: 'berserker',
      name: 'นักรบเดือดดาล',
      nameEn: 'Berserker',
      icon: 'berserker',
      description: 'นักรบบ้าคลั่งที่ทุ่มสุดตัวใส่ศัตรู พลัง HP และโจมตีสูงลิ่ว แต่การป้องกันและต้านเวทต่ำมาก',
      descriptionEn: 'A reckless warrior who throws everything into the attack. Massive HP and ATK, but very low DEF/RES.',
      baseStats: { hp: 55, mp: 10, atk: 17, mag: 3, def: 8, res: 5, spd: 8, luk: 6 },
      growth: { hp: 9.5, mp: 1.5, atk: 3.2, mag: 0.4, def: 1.6, res: 0.8, spd: 0.7, luk: 0.6 }
    },
    {
      id: 'ranger',
      name: 'นักธนูพราน',
      nameEn: 'Ranger',
      icon: 'ranger',
      description: 'นักล่าผู้ว่องไว ถนัดธนูและสายลม ความเร็วและโชคสูงเยี่ยม แต่ HP และ MP ค่อนข้างต่ำ',
      descriptionEn: 'A swift hunter skilled with bow and wind. Excellent SPD and LUK, but lower HP/MP.',
      baseStats: { hp: 36, mp: 20, atk: 12, mag: 6, def: 8, res: 8, spd: 14, luk: 12 },
      growth: { hp: 6.0, mp: 3.0, atk: 2.2, mag: 0.9, def: 1.1, res: 1.1, spd: 1.7, luk: 1.4 }
    },
    {
      id: 'necromancer',
      name: 'จอมเวทเงาวิญญาณ',
      nameEn: 'Necromancer',
      icon: 'necromancer',
      description: 'นักเวทมนตร์มืดที่เรียกพลังวิญญาณและคำสาป พลังเวทสูงจัด แต่ HP และการป้องกันต่ำมาก',
      descriptionEn: 'A dark spellcaster who commands cursed spirits. Extremely high MAG, but very low HP/DEF.',
      baseStats: { hp: 30, mp: 38, atk: 5, mag: 17, def: 7, res: 11, spd: 9, luk: 7 },
      growth: { hp: 5.0, mp: 5.4, atk: 0.6, mag: 3.2, def: 0.9, res: 1.7, spd: 0.9, luk: 0.8 }
    },
    {
      id: 'monk',
      name: 'นักพรตหมัดสายฟ้า',
      nameEn: 'Monk',
      icon: 'monk',
      description: 'นักสู้สายพลังชี่ที่ผสานหมัดกับสายฟ้า ความเร็วสูง สมดุลระหว่างกายภาพและเวท',
      descriptionEn: 'A martial artist who channels ki through lightning-charged strikes. High SPD, balanced between physical and magic.',
      baseStats: { hp: 40, mp: 24, atk: 11, mag: 9, def: 9, res: 10, spd: 13, luk: 9 },
      growth: { hp: 6.4, mp: 3.4, atk: 1.8, mag: 1.5, def: 1.3, res: 1.4, spd: 1.5, luk: 1.0 }
    },
    {
      id: 'paladin',
      name: 'อัศวินศักดิ์สิทธิ์',
      nameEn: 'Paladin',
      icon: 'paladin',
      description: 'อัศวินผู้พิทักษ์ที่ผสานดาบกับแสงศักดิ์สิทธิ์ การป้องกันและต้านเวทสูงเป็นเลิศ แต่ความเร็วต่ำ',
      descriptionEn: 'A guardian knight blending swordplay with holy light. Outstanding DEF/RES, but slow.',
      baseStats: { hp: 46, mp: 22, atk: 11, mag: 9, def: 15, res: 14, spd: 6, luk: 7 },
      growth: { hp: 7.6, mp: 3.0, atk: 1.6, mag: 1.3, def: 2.4, res: 2.2, spd: 0.5, luk: 0.7 }
    },

    // ---- 16 additional classes ----
    {
      id: 'gunslinger',
      name: 'มือปืนเวทมนตร์',
      nameEn: 'Gunslinger',
      icon: 'gunslinger',
      description: 'นักแม่นปืนที่ผสานกระสุนเวทอาคมเข้ากับความเร็วมือ โชคและความเร็วสูงเยี่ยม เน้นคริติคอล แต่การป้องกันค่อนข้างบาง',
      descriptionEn: 'A sharpshooter who fuses arcane-charged bullets with lightning-fast hands. Excellent SPD and LUK built for critical hits, but rather thin defenses.',
      baseStats: { hp: 40, mp: 18, atk: 13, mag: 7, def: 7, res: 8, spd: 13, luk: 13 },
      growth: { hp: 7.3, mp: 2.5, atk: 2.5, mag: 0.7, def: 1.1, res: 1.2, spd: 1.4, luk: 1.4 }
    },
    {
      id: 'druid',
      name: 'ดรูอิดพงไพร',
      nameEn: 'Druid',
      icon: 'druid',
      description: 'ผู้พิทักษ์ป่าที่ควบคุมเถาวัลย์และพลังเสื่อมสลาย พลังเวทและ HP สมดุลดี มีความสามารถฟื้นฟูตัวเองเล็กน้อย',
      descriptionEn: 'A forest guardian who commands thorned vines and decay. Solid MAG and HP with a touch of self-healing.',
      baseStats: { hp: 42, mp: 30, atk: 7, mag: 14, def: 9, res: 11, spd: 9, luk: 8 },
      growth: { hp: 7.7, mp: 4.2, atk: 0.7, mag: 2.7, def: 1.4, res: 1.7, spd: 1.0, luk: 0.9 }
    },
    {
      id: 'alchemist',
      name: 'นักเล่นแร่แปรธาตุ',
      nameEn: 'Alchemist',
      icon: 'alchemist',
      description: 'นักปรุงยาที่ใช้ขวดไฟและยาพิษล่อลวงศัตรู เก่งด้านการลดทอนสถานะศัตรู MP สูงมาก แต่พลังโจมตีโดยตรงค่อนข้างต่ำ',
      descriptionEn: 'A concoctor of fire flasks and poison vials, excelling at whittling enemies down. Very high MP but modest direct damage.',
      baseStats: { hp: 35, mp: 34, atk: 7, mag: 13, def: 8, res: 10, spd: 9, luk: 10 },
      growth: { hp: 6.4, mp: 4.8, atk: 0.7, mag: 2.0, def: 1.2, res: 1.5, spd: 1.0, luk: 1.1 }
    },
    {
      id: 'samurai',
      name: 'นักดาบซามูไร',
      nameEn: 'Samurai',
      icon: 'samurai',
      description: 'นักดวลดาบผู้รวดเร็วดุจสายลม เน้นโจมตีหนักและความเร็วสูง แต่เกราะป้องกันบางเฉียบ',
      descriptionEn: 'A blade duelist swift as the wind, built for heavy strikes and high speed, but thinly armored.',
      baseStats: { hp: 40, mp: 14, atk: 16, mag: 3, def: 7, res: 6, spd: 15, luk: 11 },
      growth: { hp: 7.3, mp: 2.0, atk: 3.0, mag: 0.2, def: 1.1, res: 0.9, spd: 1.7, luk: 1.2 }
    },
    {
      id: 'warlock',
      name: 'นักเวทปีศาจ',
      nameEn: 'Warlock',
      icon: 'warlock',
      description: 'นักเวทที่ทำสัญญากับปีศาจ ดึงพลังไฟนรกและความมืดมาใช้ พลังเวทสูงจัดพร้อมพลังดูดชีวิต แต่ร่างกายบอบบาง',
      descriptionEn: 'A spellcaster bound by demonic pact, drawing on hellfire and shadow. Extremely high MAG with life-draining power, but frail.',
      baseStats: { hp: 32, mp: 37, atk: 5, mag: 17, def: 7, res: 10, spd: 9, luk: 8 },
      growth: { hp: 5.9, mp: 5.2, atk: 0.4, mag: 3.2, def: 1.1, res: 1.5, spd: 1.0, luk: 0.9 }
    },
    {
      id: 'battlemage',
      name: 'นักรบเวทอักขระ',
      nameEn: 'Battlemage',
      icon: 'battlemage',
      description: 'นักรบผสานดาบกับเวทอักขระสายฟ้า โจมตีกายภาพและเวทสมดุลกันอย่างลงตัว แต่ไม่โดดเด่นด้านใดเป็นพิเศษ',
      descriptionEn: 'A warrior who fuses swordplay with electric runes, balancing physical and magic power without excelling at either extreme.',
      baseStats: { hp: 42, mp: 26, atk: 12, mag: 12, def: 10, res: 10, spd: 9, luk: 8 },
      growth: { hp: 7.7, mp: 3.6, atk: 1.9, mag: 1.9, def: 1.5, res: 1.5, spd: 1.0, luk: 0.9 }
    },
    {
      id: 'frostOracle',
      name: 'นักพยากรณ์น้ำแข็ง',
      nameEn: 'Frost Oracle',
      icon: 'frostOracle',
      description: 'ผู้พยากรณ์แห่งน้ำแข็งนิรันดร์ ผสานพลังเวทกับการฟื้นฟู',
      descriptionEn: 'An oracle of eternal frost who blends magic with restoration.',
      baseStats: { hp: 40, mp: 30, atk: 6, mag: 14, def: 9, res: 13, spd: 8, luk: 9 },
      growth: { hp: 7.3, mp: 4.2, atk: 0.5, mag: 2.7, def: 1.4, res: 2.0, spd: 0.9, luk: 1.0 }
    },
    {
      id: 'stormCaller',
      name: 'ผู้เรียกพายุ',
      nameEn: 'Storm Caller',
      icon: 'stormCaller',
      description: 'จอมเวทที่เรียกพายุฝนฟ้าคะนอง พลังเวทและความเร็วสูงลิ่ว แต่ร่างกายเปราะบางที่สุดในบรรดานักเวททั้งหมด',
      descriptionEn: 'A mage who summons raging thunderstorms. Sky-high MAG and SPD, but the frailest body among all spellcasters.',
      baseStats: { hp: 31, mp: 35, atk: 6, mag: 17, def: 6, res: 9, spd: 13, luk: 9 },
      growth: { hp: 5.7, mp: 4.9, atk: 0.5, mag: 3.2, def: 0.9, res: 1.4, spd: 1.4, luk: 1.0 }
    },
    {
      id: 'shadowDancer',
      name: 'นักเต้นเงามืด',
      nameEn: 'Shadow Dancer',
      icon: 'shadowDancer',
      description: 'นักฆ่าที่เคลื่อนไหวปะปนไปกับเงามืด ความเร็วและโชคสูงล้ำ เน้นจู่โจมฉับไว แต่ HP ต่ำมาก',
      descriptionEn: 'An assassin who moves as one with the shadows. Blazing SPD and LUK for swift strikes, but very low HP.',
      baseStats: { hp: 34, mp: 18, atk: 15, mag: 4, def: 6, res: 6, spd: 16, luk: 13 },
      growth: { hp: 6.2, mp: 2.5, atk: 2.9, mag: 0.3, def: 0.9, res: 0.9, spd: 1.8, luk: 1.4 }
    },
    {
      id: 'bard',
      name: 'นักร้องพเนจร',
      nameEn: 'Bard',
      icon: 'bard',
      description: 'นักร้องเร่ร่อนผู้ใช้บทเพลงเสริมพลังและบั่นทอนศัตรู เก่งด้านบัฟและโชค แต่พลังโจมตีโดยตรงไม่สูงนัก',
      descriptionEn: "A wandering minstrel whose songs empower allies and unravel foes. Great at buffs and LUK, but modest direct damage.",
      baseStats: { hp: 38, mp: 28, atk: 8, mag: 10, def: 9, res: 10, spd: 10, luk: 14 },
      growth: { hp: 7.0, mp: 3.9, atk: 1.0, mag: 1.5, def: 1.4, res: 1.5, spd: 1.1, luk: 1.5 }
    },
    {
      id: 'beastmaster',
      name: 'จอมเวทสัตว์ป่า',
      nameEn: 'Beastmaster',
      icon: 'beastmaster',
      description: 'ผู้เชี่ยวชาญสายสัตว์ป่าที่ผสานพลังกายภาพกับสายลม โจมตีและความเร็วสูง เหมาะกับการรุกไล่ต่อเนื่อง แต่ต้านเวทค่อนข้างต่ำ',
      descriptionEn: 'A wildlands expert who fuses raw physical power with the wind. High ATK and SPD for relentless assaults, but low RES.',
      baseStats: { hp: 42, mp: 18, atk: 15, mag: 5, def: 9, res: 7, spd: 13, luk: 10 },
      growth: { hp: 7.7, mp: 2.5, atk: 2.9, mag: 0.4, def: 1.4, res: 1.1, spd: 1.4, luk: 1.1 }
    },
    {
      id: 'runeblade',
      name: 'อัศวินอักขระเงา',
      nameEn: 'Runeblade',
      icon: 'runeblade',
      description: 'อัศวินผู้สลักอักขระมืดลงบนดาบ ผสานความแข็งแกร่งแบบถึกทนเข้ากับพลังมืด การป้องกันและต้านเวทสูงเป็นเลิศ แต่เชื่องช้า',
      descriptionEn: 'A knight who etches dark runes into their blade, marrying stalwart durability with shadow magic. Outstanding DEF/RES, but slow.',
      baseStats: { hp: 47, mp: 20, atk: 13, mag: 8, def: 14, res: 12, spd: 7, luk: 6 },
      growth: { hp: 8.6, mp: 2.8, atk: 2.1, mag: 0.8, def: 2.1, res: 1.8, spd: 0.8, luk: 0.7 }
    },
    {
      id: 'sharpshooter',
      name: 'นักแม่นปืนไร้เทียมทาน',
      nameEn: 'Sharpshooter',
      icon: 'sharpshooter',
      description: 'นักแม่นปืนผู้เล็งแม่นยำถึงขีดสุด เน้นโชคและความเร็วเพื่อคริติคอลรุนแรง แต่ร่างกายและ MP ค่อนข้างต่ำ',
      descriptionEn: 'A marksman with unmatched precision, built around LUK and SPD for devastating crits. Low HP and MP.',
      baseStats: { hp: 37, mp: 14, atk: 15, mag: 3, def: 6, res: 6, spd: 14, luk: 15 },
      growth: { hp: 6.8, mp: 2.0, atk: 2.9, mag: 0.2, def: 0.9, res: 0.9, spd: 1.5, luk: 1.7 }
    },
    {
      id: 'puppeteer',
      name: 'นักเชิดหุ่นเงา',
      nameEn: 'Puppeteer',
      icon: 'puppeteer',
      description: 'นักเวทที่บงการหุ่นเงามืดให้สาปแช่งศัตรู ถนัดลดทอนสถานะศัตรูมากกว่าโจมตีตรง ๆ ต้านเวทดี แต่พลังโจมตีต่ำ',
      descriptionEn: 'A puppet master who commands shadow marionettes to curse foes. Specializes in draining enemy stats rather than raw damage. Good RES but low ATK.',
      baseStats: { hp: 33, mp: 32, atk: 5, mag: 13, def: 7, res: 11, spd: 10, luk: 11 },
      growth: { hp: 6.0, mp: 4.5, atk: 0.4, mag: 2.5, def: 1.1, res: 1.7, spd: 1.1, luk: 1.2 }
    },
    {
      id: 'tempestWitch',
      name: 'แม่มดพายุทะเล',
      nameEn: 'Tempest Witch',
      icon: 'tempestWitch',
      description: 'แม่มดแห่งท้องทะเลพิโรธที่ผสานน้ำแข็งกับสายฟ้า พลังเวทสูงจัดเพื่อกวาดล้างศัตรูเป็นกลุ่ม แต่พลังโจมตีกายภาพแทบไม่มี',
      descriptionEn: 'A witch of the raging seas who fuses ice and lightning. Extremely high MAG built for sweeping groups of enemies, but almost no physical power.',
      baseStats: { hp: 32, mp: 34, atk: 4, mag: 16, def: 6, res: 10, spd: 11, luk: 9 },
      growth: { hp: 5.9, mp: 4.8, atk: 0.2, mag: 3.0, def: 0.9, res: 1.5, spd: 1.2, luk: 1.0 }
    },
    {
      id: 'chronomancer',
      name: 'นักเวทกาลเวลา',
      nameEn: 'Chronomancer',
      icon: 'chronomancer',
      description: 'นักเวทผู้บิดเบือนสายธารเวลา เก่งด้านบัฟ/ดีบัฟและควบคุมความเร็ว ความเร็วสูงที่สุดในบรรดานักเวท แต่พลังโจมตีโดยตรงต่ำ',
      descriptionEn: 'A mage who bends the flow of time, mastering buffs, debuffs, and speed control. The fastest of all spellcasters, but low direct damage.',
      baseStats: { hp: 34, mp: 30, atk: 5, mag: 12, def: 7, res: 10, spd: 15, luk: 10 },
      growth: { hp: 6.2, mp: 4.2, atk: 0.4, mag: 1.9, def: 1.1, res: 1.5, spd: 1.7, luk: 1.1 }
    },

    // ---- 5 unlockable elite classes: each locked behind clearing one game
    // mode (see State.isClassUnlocked), each ~10-25% above the base roster's
    // stat total, and each built around one signature skill mechanic no
    // other class has (see the classOnly skills below and the matching
    // battle-engine.js additions: allEnemies debuffs, on-hit debuffs,
    // execute bonuses, HP-cost skills, and free-action-point skills). ----
    {
      id: 'warlord',
      name: 'ผู้กล้าจอมบัญชาการ',
      nameEn: 'Valiant Warlord',
      icon: 'warlord',
      unlock: { type: 'difficulty', difficulty: 'easy' },
      description: 'ปลดล็อกด้วยการพิชิตหอคอยโหมด Easy จอมทัพผู้บัญชาการศึกที่สั่นสะเทือนขวัญศัตรูทั้งกลุ่มได้ในคำสั่งเดียว สมดุลระหว่างรุกและรับ',
      descriptionEn: 'Unlocked by clearing the tower on Easy. A battlefield commander who can shake an entire enemy group with a single decree. Balanced offense and defense.',
      baseStats: { hp: 52, mp: 24, atk: 14, mag: 10, def: 13, res: 11, spd: 10, luk: 9 },
      growth: { hp: 9.0, mp: 3.3, atk: 2.2, mag: 1.5, def: 2.0, res: 1.7, spd: 1.1, luk: 1.0 }
    },
    {
      id: 'shadowhunter',
      name: 'ผู้กล้านักล่าเงา',
      nameEn: 'Valiant Shadowhunter',
      icon: 'shadowhunter',
      unlock: { type: 'difficulty', difficulty: 'normal' },
      description: 'ปลดล็อกด้วยการพิชิตหอคอยโหมด Normal นักล่าผู้ทำให้ทุกจังหวะโจมตีกลายเป็นบาดแผลถาวร ความเร็วและโชคสูงเป็นเลิศ',
      descriptionEn: 'Unlocked by clearing the tower on Normal. A hunter whose every strike leaves a lasting wound. Superb SPD and LUK.',
      baseStats: { hp: 40, mp: 22, atk: 17, mag: 6, def: 8, res: 8, spd: 16, luk: 14 },
      growth: { hp: 6.9, mp: 3.0, atk: 3.1, mag: 0.6, def: 1.2, res: 1.2, spd: 1.9, luk: 1.6 }
    },
    {
      id: 'executioner',
      name: 'ผู้กล้าเพชฌฆาตราตรี',
      nameEn: 'Valiant Executioner',
      icon: 'executioner',
      unlock: { type: 'difficulty', difficulty: 'hard' },
      description: 'ปลดล็อกด้วยการพิชิตหอคอยโหมด Hard เพชฌฆาตผู้ทวีพลังโจมตีทันทีเมื่อศัตรูใกล้ร่วงหล่น พลังโจมตีสูงจัด',
      descriptionEn: 'Unlocked by clearing the tower on Hard. An executioner whose blows grow far deadlier the closer a foe is to death. Extremely high ATK.',
      baseStats: { hp: 46, mp: 18, atk: 20, mag: 4, def: 9, res: 7, spd: 15, luk: 12 },
      growth: { hp: 7.9, mp: 2.4, atk: 3.6, mag: 0.3, def: 1.3, res: 1.1, spd: 1.8, luk: 1.4 }
    },
    {
      id: 'deathbringer',
      name: 'ผู้กล้าจอมมรณะ',
      nameEn: 'Valiant Deathbringer',
      icon: 'deathbringer',
      unlock: { type: 'difficulty', difficulty: 'nightmare' },
      description: 'ปลดล็อกด้วยการพิชิตหอคอยโหมด Nightmare จอมเวทเลือดผู้สังเวย HP ของตนเองแทน MP เพื่อร่ายพลังทำลายล้างสูงสุด แข็งแกร่งที่สุดในบรรดาผู้กล้าทั้งห้า',
      descriptionEn: 'Unlocked by clearing the tower on Nightmare. A blood mage who spends their own HP instead of MP to unleash devastating power. The strongest of the five Valiant classes.',
      baseStats: { hp: 56, mp: 28, atk: 16, mag: 17, def: 10, res: 10, spd: 11, luk: 10 },
      growth: { hp: 9.6, mp: 3.9, atk: 2.9, mag: 3.1, def: 1.5, res: 1.5, spd: 1.2, luk: 1.1 }
    },
    {
      id: 'vanguard',
      name: 'ผู้กล้าไร้สิ้นสุด',
      nameEn: 'Valiant Vanguard',
      icon: 'vanguard',
      unlock: { type: 'survivalWaves', waves: 30 },
      description: 'ปลดล็อกด้วยการผ่านคลื่นในสนามประลองไร้สิ้นสุดให้ครบ 30 คลื่นในเซสชันเดียว นักรบแนวหน้าผู้บางท่วงท่าคืนพลังการกระทำให้ตนเองทันที โจมตีต่อเนื่องไม่หยุดยั้ง',
      descriptionEn: 'Unlocked by clearing 30 waves in a single Survival Arena session. A frontline warrior whose flowing techniques refund their own action point, chaining attacks without pause.',
      baseStats: { hp: 44, mp: 26, atk: 14, mag: 12, def: 9, res: 9, spd: 18, luk: 11 },
      growth: { hp: 7.6, mp: 3.6, atk: 2.4, mag: 2.1, def: 1.3, res: 1.3, spd: 2.1, luk: 1.3 }
    }
  ];

  window.Game = window.Game || {};
  window.Game.Data = window.Game.Data || {};
  window.Game.Data.classes = classes;
  window.Game.Data.getClass = function (id) {
    for (var i = 0; i < classes.length; i++) if (classes[i].id === id) return classes[i];
    return null;
  };
})();
