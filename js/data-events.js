// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Random tower events: a small chance (see TowerUI's EVENT_CHANCE) of a full-screen
// detour between floors, offering a risk/reward choice. Display text lives in i18n.js
// (keys follow the `event<Id>...` convention, e.g. eventMerchantTitle) since these are
// UI chrome like the waypoint screens, not data records -- this file only holds the
// ids/icons/tunable numbers ui-tower.js's event screen switches on.
(function () {
  var events = [
    { id: 'merchant', icon: 'eventMerchant', offerGoldBase: 180, offerGoldPerTier: 40 },
    { id: 'chest', icon: 'eventChest', goodChance: 0.65, trapHpPct: 0.15 },
    { id: 'shortcut', icon: 'eventShortcut', hpCostPct: 0.20 },
    { id: 'sage', icon: 'eventSage', expTradeGoldBase: 100, expTradeGoldPerTier: 20, materialTradeQty: 3 },
    { id: 'shrine', icon: 'eventShrine' },
    { id: 'companion', icon: 'eventCompanion' },
    { id: 'spring', icon: 'eventSpring' },
    { id: 'battlefield', icon: 'eventBattlefield' },
    { id: 'gambler', icon: 'eventGambler', betTiers: [0.25, 0.5, 1.0] },
    // Bargain events: both cost something real (max HP for the run / the free heal).
    { id: 'bloodAltar', icon: 'eventBloodAltar', minFloor: 8, minorPenalty: 0.08, majorPenalty: 0.16, maxPenalty: 0.4,
      minorRunes: ['rune_fracture', 'rune_shelter', 'rune_vigor', 'rune_ember', 'rune_frost'],
      rareRunes: ['rune_focus', 'rune_discovery', 'rune_thunder', 'rune_gale', 'rune_sun', 'rune_moon'] },
    { id: 'nightCamp', icon: 'eventNightCamp', minFloor: 8, bazaarRuneMult: 3.2 }
  ];

  // ---- Choice events ------------------------------------------------------
  // Data-driven events: ui-tower.js's renderChoiceEvent draws one card per
  // choice and shows the text returned by `effect`. A choice may declare a gold
  // `cost(run, floor)` (the card is disabled when the player cannot pay) or
  // `leave: true` (walk away, no effect). `effect(run, floor)` mutates the run
  // through State and returns { th, en, danger? } for the result box.
  function S() { return window.Game.State; }
  function F() { return window.Game.Formulas; }
  function tierOf(floor) { return F().itemTierForFloor(floor); }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  function hurt(run, pct) {
    var dmg = Math.max(1, Math.round(S().getMaxHp(run) * pct));
    run.hp = Math.max(1, run.hp - dmg);
    return dmg;
  }
  function healPct(run, hpPct, mpPct) {
    var maxHp = S().getMaxHp(run), maxMp = S().getMaxMp(run);
    run.hp = Math.min(maxHp, run.hp + Math.round(maxHp * (hpPct || 0)));
    run.mp = Math.min(maxMp, run.mp + Math.round(maxMp * (mpPct || 0)));
  }
  function bestPotion(floor) {
    var tier = tierOf(floor);
    return items().filter(function (i) { return i.kind === 'consumable' && i.effect && i.effect.type === 'healHp' && i.tier <= tier && i.price == null; })
      .sort(function (a, b) { return b.tier - a.tier; })[0];
  }
  function items() { return window.Game.Data.items; }
  function zoneMaterial(floor) {
    var tier = Math.min(F().tierForFloor(floor), 9);
    return pick(items().filter(function (i) { return i.kind === 'material' && i.tier === tier; }));
  }
  function nameOf(obj, en) { return en ? (obj.nameEn || obj.name) : obj.name; }
  var leave = { id: 'leave', icon: 'doorway', name: 'เดินต่อไป', nameEn: 'Move on', desc: 'ไม่ยุ่งกับสิ่งนี้', descEn: 'Leave it alone.', leave: true };

  var choiceEvents = [
    { id: 'fountain', icon: 'eventSpring', name: 'น้ำพุแสงจันทร์', nameEn: 'Moonlit Fountain',
      desc: 'น้ำใสเรืองแสงไหลออกจากรอยแตกของผนังหอคอย', descEn: 'Glowing water runs from a crack in the tower wall.',
      choices: [
        { id: 'drink', icon: 'drop', name: 'ดื่ม', nameEn: 'Drink', desc: 'ฟื้นฟู HP 25% และ MP 50%', descEn: 'Restore 25% HP and 50% MP.',
          effect: function (run) { healPct(run, 0.25, 0.5); return { th: 'ร่างกายสดชื่นขึ้น ฟื้นฟู HP และ MP แล้ว', en: 'You feel refreshed. HP and MP restored.' }; } },
        { id: 'bottle', icon: 'potion', name: 'กรอกใส่ขวด', nameEn: 'Fill your flasks', desc: 'ได้ยาฟื้นฟู HP 2 ขวดของโซนนี้', descEn: 'Gain 2 HP potions of this zone.',
          effect: function (run, floor) { var p = bestPotion(floor); if (!p) return { th: 'ไม่มีขวดว่างเหลือ', en: 'You have no empty flask.' }; S().addItem(run, p.id, 2); return { th: 'ได้รับ ' + p.name + ' ×2', en: 'Received ' + nameOf(p, true) + ' ×2' }; } }
      ] },
    { id: 'wounded', icon: 'eventCompanion', name: 'นักผจญภัยบาดเจ็บ', nameEn: 'Wounded Adventurer',
      desc: 'นักผจญภัยคนหนึ่งนั่งพิงผนัง ขอความช่วยเหลือ', descEn: 'An adventurer slumps against the wall and asks for help.',
      choices: [
        { id: 'supplies', icon: 'coin', name: 'แบ่งเสบียง', nameEn: 'Share supplies', desc: 'เสียทอง 15% ที่ถืออยู่ ได้ EXP จากเรื่องเล่าของเขา', descEn: 'Lose 15% of your gold; gain EXP from his stories.',
          effect: function (run) { var cost = Math.floor((run.gold || 0) * 0.15); run.gold -= cost; var exp = Math.round(run.expNext * 0.6); S().addExp(run, exp); return { th: 'เสียทอง ' + cost + ' ได้รับ EXP ' + exp, en: 'Lost ' + cost + ' gold. Gained ' + exp + ' EXP.' }; } },
        { id: 'escort', icon: 'shieldGuard', name: 'คุ้มกันออกไป', nameEn: 'Escort him out', desc: 'เสีย HP 12% ของค่าสูงสุด ได้วัตถุดิบโซนนี้ 4 ชิ้น', descEn: 'Lose 12% of max HP; gain 4 zone materials.',
          effect: function (run, floor) { var dmg = hurt(run, 0.12), m = zoneMaterial(floor); if (m) S().addItem(run, m.id, 4); return { th: 'เสีย HP ' + dmg + (m ? ' ได้รับ ' + m.name + ' ×4' : ''), en: 'Lost ' + dmg + ' HP.' + (m ? ' Received ' + nameOf(m, true) + ' ×4.' : '') }; } },
        leave
      ] },
    { id: 'forge', icon: 'workBench', name: 'เตาหลอมร้าง', nameEn: 'Abandoned Forge', minFloor: 6,
      desc: 'เตาหลอมโบราณยังอุ่นอยู่ พอใช้ได้อีกครั้งเดียว', descEn: 'An ancient forge is still warm, good for one more use.',
      choices: [
        { id: 'sharpen', icon: 'swordAttack', name: 'ลับอาวุธ', nameEn: 'Sharpen', desc: 'จ่ายทอง ได้ ATK และ MAG ถาวรตลอดการเดินทาง', descEn: 'Pay gold for run-long ATK and MAG.',
          cost: function (run, floor) { return 140 * tierOf(floor); },
          effect: function (run, floor) { var n = 2 + tierOf(floor); S().addStatBoost(run, 'atk', n); S().addStatBoost(run, 'mag', n); return { th: 'ATK และ MAG +' + n, en: 'ATK and MAG +' + n }; } },
        { id: 'reinforce', icon: 'shieldGuard', name: 'เสริมเกราะ', nameEn: 'Reinforce', desc: 'จ่ายทอง ได้ DEF และ RES ถาวรตลอดการเดินทาง', descEn: 'Pay gold for run-long DEF and RES.',
          cost: function (run, floor) { return 140 * tierOf(floor); },
          effect: function (run, floor) { var n = 2 + tierOf(floor); S().addStatBoost(run, 'def', n); S().addStatBoost(run, 'res', n); return { th: 'DEF และ RES +' + n, en: 'DEF and RES +' + n }; } },
        leave
      ] },
    { id: 'library', icon: 'codex', name: 'ห้องสมุดผุพัง', nameEn: 'Ruined Library',
      desc: 'ชั้นหนังสือล้มระเนระนาด แต่ยังมีบางเล่มที่อ่านได้', descEn: 'The shelves have collapsed, but a few books are still readable.',
      choices: [
        { id: 'study', icon: 'gem', name: 'ศึกษาตำรารบ', nameEn: 'Study tactics', desc: 'ได้ EXP ครึ่งหนึ่งของที่ต้องใช้ขึ้นเลเวลถัดไป', descEn: 'Gain half the EXP needed for your next level.',
          effect: function (run) { var exp = Math.round(run.expNext * 0.5); S().addExp(run, exp); return { th: 'ได้รับ EXP ' + exp, en: 'Gained ' + exp + ' EXP.' }; } },
        { id: 'bestiary', icon: 'scroll', name: 'คัดลอกบันทึกสัตว์ร้าย', nameEn: 'Copy the bestiary', desc: 'เปิดเผยจุดอ่อนและธาตุที่ต้านของศัตรูทุกชนิดในโซนนี้', descEn: 'Reveal the weakness and resistance of every enemy in this zone.',
          effect: function (run, floor) {
            var D = window.Game.Data, meta = window.Game.Save.readMeta(), count = 0;
            meta.affinities = meta.affinities || {};
            D.getEnemiesByTier(F().tierForFloor(floor)).forEach(function (e) {
              var known = meta.affinities[e.id] = meta.affinities[e.id] || {};
              [e.weak, e.resist].forEach(function (el) { if (el && !known[el]) { known[el] = true; count++; } });
            });
            window.Game.Save.writeMeta(meta);
            return count ? { th: 'บันทึกจุดอ่อนใหม่ ' + count + ' รายการลงสมุดเวท', en: 'Recorded ' + count + ' new affinities in your Codex.' } : { th: 'คุณรู้ทุกอย่างในบันทึกนี้อยู่แล้ว', en: 'You already knew everything written here.' };
          } }
      ] },
    { id: 'idol', icon: 'eventShrine', name: 'เทวรูปต้องสาป', nameEn: 'Cursed Idol', minFloor: 6,
      desc: 'เทวรูปหินถืออัญมณีเม็ดโต ดวงตาของมันเหมือนกำลังมองคุณ', descEn: 'A stone idol clutches a large gem. Its eyes seem to follow you.',
      choices: [
        { id: 'gem', icon: 'gem', name: 'หยิบอัญมณี', nameEn: 'Take the gem', desc: 'ได้ทองก้อนโตและวัตถุดิบโซน 4 ชิ้น แต่ติดคำสาปสุ่ม 1 อย่าง', descEn: 'Gain a large sum of gold and 4 zone materials, but suffer a random curse.',
          effect: function (run, floor) {
            var D = window.Game.Data, gold = window.Game.Formulas.eventGold(floor, 1.5), gemMat = zoneMaterial(floor);
            S().addGold(run, gold);
            if (gemMat) S().addItem(run, gemMat.id, 4);
            var open = D.curses.filter(function (c) { return (run.curses || []).indexOf(c.id) === -1; });
            if (!open.length) return { th: 'ได้รับทอง ' + gold + ' คำสาปไม่มีผลกับคุณอีกแล้ว', en: 'Gained ' + gold + ' gold. No curse can take hold of you any more.' };
            var c = pick(open); S().addCurse(run, c.id, true);
            return { th: 'ได้รับทอง ' + gold + (gemMat ? ' และ ' + gemMat.name + ' ×4' : '') + ' แต่ติด ' + c.name, en: 'Gained ' + gold + ' gold' + (gemMat ? ' and ' + nameOf(gemMat, true) + ' ×4' : '') + ', but you are afflicted with ' + nameOf(c, true) + '.', danger: true };
          } },
        { id: 'pray', icon: 'statusCleanse', name: 'สวดอ้อนวอน', nameEn: 'Pray', desc: 'ลบคำสาป 1 อย่างถ้ามี ไม่เช่นนั้นฟื้นฟู HP 20%', descEn: 'Lift one curse if you carry any; otherwise restore 20% HP.',
          effect: function (run) {
            if (run.curses && run.curses.length) { var id = run.curses.shift(), c = window.Game.Data.getCurse(id); S().clampVitals(run); return { th: 'คำสาป ' + (c ? c.name : '') + ' ถูกลบออก', en: 'The curse ' + (c ? nameOf(c, true) : '') + ' is lifted.' }; }
            healPct(run, 0.2, 0); return { th: 'ฟื้นฟู HP 20%', en: 'Restored 20% HP.' };
          } },
        leave
      ] },
    { id: 'master', icon: 'npcSage', npc: true, name: 'ปรมาจารย์ผู้ปลีกวิเวก', nameEn: 'Hermit Master',
      desc: 'ชายชรานั่งสมาธิกลางห้อง เขายอมสอนให้หนึ่งอย่าง', descEn: 'An old man meditates in the middle of the room. He offers one lesson.',
      choices: [
        { id: 'body', icon: 'heart', name: 'ฝึกกาย', nameEn: 'Train the body', desc: 'HP สูงสุดเพิ่มถาวรตลอดการเดินทาง', descEn: 'Run-long max HP.',
          effect: function (run, floor) { var n = 10 + tierOf(floor) * 6; S().addStatBoost(run, 'hp', n); return { th: 'HP สูงสุด +' + n, en: 'Max HP +' + n }; } },
        { id: 'mind', icon: 'drop', name: 'ฝึกจิต', nameEn: 'Train the mind', desc: 'MP สูงสุดเพิ่มถาวรตลอดการเดินทาง', descEn: 'Run-long max MP.',
          effect: function (run, floor) { var n = 5 + tierOf(floor) * 3; S().addStatBoost(run, 'mp', n); return { th: 'MP สูงสุด +' + n, en: 'Max MP +' + n }; } },
        { id: 'feet', icon: 'wind', name: 'ฝึกฝีเท้า', nameEn: 'Train footwork', desc: 'SPD เพิ่มถาวรตลอดการเดินทาง', descEn: 'Run-long SPD.',
          effect: function (run, floor) { var n = 2 + tierOf(floor); S().addStatBoost(run, 'spd', n); return { th: 'SPD +' + n, en: 'SPD +' + n }; } }
      ] },
    { id: 'smuggler', icon: 'npcMerchant', npc: true, name: 'กล่องปริศนาของนักลักลอบ', nameEn: "Smuggler's Crate", minFloor: 4,
      desc: 'พ่อค้าท่าทางมีพิรุธเสนอขายกล่องปิดผนึก ไม่บอกว่าข้างในคืออะไร', descEn: 'A shifty trader offers a sealed crate and will not say what is inside.',
      choices: [
        { id: 'buy', icon: 'eventChest', name: 'ซื้อกล่อง', nameEn: 'Buy the crate', desc: 'จ่ายทอง ได้อุปกรณ์สุ่ม 1 ชิ้นของโซนนี้', descEn: 'Pay gold for one random piece of gear from this zone.',
          cost: function (run, floor) { return 45 * tierOf(floor); },
          effect: function (run, floor) {
            var D = window.Game.Data, tier = tierOf(floor), pool = [];
            ['weapon', 'armor', 'shoes', 'accessory'].forEach(function (k) { pool = pool.concat(D.getItemsByKindTier(k, tier)); });
            if (!pool.length) return { th: 'กล่องว่างเปล่า', en: 'The crate is empty.' };
            var it = pick(pool); S().addItem(run, it.id, 1);
            return { th: 'ได้รับ ' + it.name + ' (' + it.desc + ')', en: 'Received ' + nameOf(it, true) + ' (' + (it.descEn || it.desc) + ')' };
          } },
        leave
      ] },
    { id: 'gatekeeper', icon: 'skull', name: 'วิญญาณเฝ้าประตู', nameEn: 'Gate Wraith', minFloor: 6,
      desc: 'วิญญาณโปร่งแสงขวางทางเดิน มันต้องการค่าผ่านทาง', descEn: 'A translucent wraith bars the corridor and demands a toll.',
      choices: [
        { id: 'toll', icon: 'coin', name: 'จ่ายค่าผ่านทาง', nameEn: 'Pay the toll', desc: 'เสียทอง 20% ที่ถืออยู่ วิญญาณอวยพรให้ ฟื้นฟู HP และ MP 30%', descEn: 'Lose 20% of your gold. The wraith blesses you: restore 30% HP and MP.',
          effect: function (run) { var cost = Math.floor((run.gold || 0) * 0.2); run.gold -= cost; healPct(run, 0.3, 0.3); return { th: 'เสียทอง ' + cost + ' ฟื้นฟู HP และ MP 30%', en: 'Lost ' + cost + ' gold. Restored 30% HP and MP.' }; } },
        { id: 'force', icon: 'swordAttack', name: 'ฝ่าออกไป', nameEn: 'Force your way through', desc: 'เสีย HP 22% ของค่าสูงสุด ได้ EXP และวัตถุดิบ 3 ชิ้น', descEn: 'Lose 22% of max HP; gain EXP and 3 materials.',
          effect: function (run, floor) { var dmg = hurt(run, 0.22), exp = Math.round(run.expNext * 0.45), m = zoneMaterial(floor); S().addExp(run, exp); if (m) S().addItem(run, m.id, 3); return { th: 'เสีย HP ' + dmg + ' ได้รับ EXP ' + exp + (m ? ' และ ' + m.name + ' ×3' : ''), en: 'Lost ' + dmg + ' HP. Gained ' + exp + ' EXP' + (m ? ' and ' + nameOf(m, true) + ' ×3.' : '.'), danger: true }; } }
      ] },
    { id: 'hoard', icon: 'eventChest', name: 'รังของสัตว์ร้ายที่หลับอยู่', nameEn: "Sleeping Beast's Hoard", minFloor: 8,
      desc: 'สัตว์ร้ายตัวใหญ่นอนขดอยู่บนกองสมบัติ ลมหายใจของมันสั่นทั้งห้อง', descEn: 'A huge beast sleeps curled on a pile of treasure. Its breathing shakes the room.',
      choices: [
        { id: 'sneak', icon: 'coin', name: 'ย่องเข้าไปหยิบ', nameEn: 'Sneak in', desc: 'โอกาส 55% ได้ทองและยา 3 ขวด ถ้าพลาดเสีย HP 25% ของค่าสูงสุด', descEn: '55% chance of gold and 3 potions. Fail and you lose 25% of max HP.',
          effect: function (run, floor) {
            if (Math.random() < 0.55) { var gold = window.Game.Formulas.eventGold(floor, 1.2), p = bestPotion(floor); S().addGold(run, gold); if (p) S().addItem(run, p.id, 3); return { th: 'สำเร็จ! ได้รับทอง ' + gold + (p ? ' และ ' + p.name + ' ×3' : ''), en: 'Success! Gained ' + gold + ' gold' + (p ? ' and ' + nameOf(p, true) + ' ×3.' : '.') }; }
            var dmg = hurt(run, 0.25); return { th: 'มันตื่น! คุณหนีออกมาได้แต่เสีย HP ' + dmg, en: 'It wakes! You escape, but lose ' + dmg + ' HP.', danger: true };
          } },
        leave
      ] },
    { id: 'starfall', icon: 'star', name: 'เศษดาวตก', nameEn: 'Fallen Star Shard',
      desc: 'เศษหินเรืองแสงทะลุหลังคาหอคอยลงมาฝังอยู่กลางพื้น', descEn: 'A glowing shard has punched through the tower roof and lies embedded in the floor.',
      choices: [
        { id: 'absorb', icon: 'sparkles', name: 'ดูดซับพลัง', nameEn: 'Absorb it', desc: 'LUK +3 และ MP สูงสุด +6 ตลอดการเดินทาง', descEn: 'Run-long +3 LUK and +6 max MP.',
          effect: function (run) { S().addStatBoost(run, 'luk', 3); S().addStatBoost(run, 'mp', 6); return { th: 'LUK +3 และ MP สูงสุด +6', en: 'LUK +3 and max MP +6' }; } },
        { id: 'sell', icon: 'coin', name: 'เก็บไปขาย', nameEn: 'Take it to sell', desc: 'ได้ทองทันที', descEn: 'Gain gold right away.',
          effect: function (run, floor) { var gold = window.Game.Formulas.eventGold(floor, 1.2); S().addGold(run, gold); return { th: 'ได้รับทอง ' + gold, en: 'Gained ' + gold + ' gold.' }; } }
      ] }
  ];
  choiceEvents.forEach(function (e) { e.choiceEvent = true; events.push(e); });

  window.Game = window.Game || {};
  window.Game.Data = window.Game.Data || {};
  window.Game.Data.events = events;
  window.Game.Data.getEvent = function (id) {
    for (var i = 0; i < events.length; i++) if (events[i].id === id) return events[i];
    return null;
  };
})();
