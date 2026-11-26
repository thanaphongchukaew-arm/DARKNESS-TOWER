// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Equipment + consumable item definitions. tier matches the tower's floor tiers (1: 1-10, 2: 11-20,
// 3: 21-30, 4: 31-40, 5: 41-44). Floors 45-100 (the hidden upper tower, see data-enemies.js) draw from
// two more gear tiers layered on top -- 6 (floors 45-59) and 7 (floors 60-100) -- via
// Formulas.itemTierForFloor, which caps out at 7 instead of following the monster tier (which
// keeps climbing to 16) since gear doesn't need a new rung every 5 floors the way monsters do.
(function () {
  var items = [
    // ---- Weapons (boost atk & mag a bit) ----
    { id: 'w_rusty_blade', name: 'ดาบสนิมกร้าน', nameEn: 'Rusty Blade', kind: 'weapon', tier: 1, icon: 'weaponSlot', statBonus: { atk: 3 }, desc: '+3 ATK', descEn: '+3 ATK' },
    { id: 'w_hunting_blade', name: 'ดาบนักล่า', nameEn: 'Hunting Blade', kind: 'weapon', tier: 1, icon: 'weaponSlot', statBonus: { atk: 5, lck: 2 }, desc: '+5 ATK, +2 LUK', descEn: '+5 ATK, +2 LUK' },
    { id: 'w_apprentice_wand', name: 'คทาศิษย์เวท', nameEn: 'Apprentice Wand', kind: 'weapon', tier: 1, icon: 'weaponSlotMag', statBonus: { mag: 5 }, desc: '+5 MAG', descEn: '+5 MAG' },
    { id: 'w_knight_sword', name: 'ดาบอัศวิน', nameEn: 'Knight Sword', kind: 'weapon', tier: 2, icon: 'weaponSlot', statBonus: { atk: 8, def: 2 }, desc: '+8 ATK, +2 DEF', descEn: '+8 ATK, +2 DEF' },
    { id: 'w_arcane_staff', name: 'คทาอาคม', nameEn: 'Arcane Staff', kind: 'weapon', tier: 2, icon: 'weaponSlotMag', statBonus: { mag: 9, res: 2 }, desc: '+9 MAG, +2 RES', descEn: '+9 MAG, +2 RES' },
    { id: 'w_storm_glaive', name: 'ทวนวายุ', nameEn: 'Storm Glaive', kind: 'weapon', tier: 2, icon: 'weaponSlot', statBonus: { atk: 6, spd: 3 }, desc: '+6 ATK, +3 SPD', descEn: '+6 ATK, +3 SPD' },
    { id: 'w_soul_edge', name: 'ดาบกลืนวิญญาณ', nameEn: 'Soulrend Blade', kind: 'weapon', tier: 3, icon: 'weaponSlot', statBonus: { atk: 13, lck: 3 }, desc: '+13 ATK, +3 LUK', descEn: '+13 ATK, +3 LUK' },
    { id: 'w_grand_grimoire', name: 'คัมภีร์มหาเวท', nameEn: 'Grand Grimoire', kind: 'weapon', tier: 3, icon: 'weaponSlotMag', statBonus: { mag: 14, mp: 6 }, desc: '+14 MAG, +6 MP', descEn: '+14 MAG, +6 MP' },
    { id: 'w_dragonfang_blade', name: 'ดาบเขี้ยวมังกร', nameEn: 'Dragonfang Blade', kind: 'weapon', tier: 4, icon: 'weaponSlot', statBonus: { atk: 21, lck: 5 }, desc: '+21 ATK, +5 LUK', descEn: '+21 ATK, +5 LUK' },
    { id: 'w_infernal_scepter', name: 'คทาอเวจี', nameEn: 'Infernal Scepter', kind: 'weapon', tier: 4, icon: 'weaponSlotMag', statBonus: { mag: 22, mp: 8 }, desc: '+22 MAG, +8 MP', descEn: '+22 MAG, +8 MP' },
    { id: 'w_tempest_lance', name: 'หอกพายุทมิฬ', nameEn: 'Stormdark Lance', kind: 'weapon', tier: 4, icon: 'weaponSlot', statBonus: { atk: 16, spd: 5 }, desc: '+16 ATK, +5 SPD', descEn: '+16 ATK, +5 SPD' },
    { id: 'w_voidforged_blade', name: 'ดาบหลอมความว่าง', nameEn: 'Voidforged Blade', kind: 'weapon', tier: 5, icon: 'weaponSlot', statBonus: { atk: 34, lck: 7 }, desc: '+34 ATK, +7 LUK', descEn: '+34 ATK, +7 LUK' },
    { id: 'w_archdemon_tome', name: 'คัมภีร์จอมเดวิล', nameEn: 'Archdevil Tome', kind: 'weapon', tier: 5, icon: 'weaponSlotMag', statBonus: { mag: 35, mp: 12 }, desc: '+35 MAG, +12 MP', descEn: '+35 MAG, +12 MP' },
    { id: 'w_resonant_edge', name: 'ดาบก้องกังวาน', nameEn: 'Resonant Edge', kind: 'weapon', tier: 6, icon: 'weaponSlot', statBonus: { atk: 46, lck: 8 }, desc: '+46 ATK, +8 LUK', descEn: '+46 ATK, +8 LUK' },
    { id: 'w_choral_staff', name: 'คทาบทสวด', nameEn: 'Choral Staff', kind: 'weapon', tier: 6, icon: 'weaponSlotMag', statBonus: { mag: 48, mp: 16 }, desc: '+48 MAG, +16 MP', descEn: '+48 MAG, +16 MP' },
    { id: 'w_sovereign_fang', name: 'ดาบเขี้ยวอธิราช', nameEn: 'Sovereign Fang', kind: 'weapon', tier: 7, icon: 'weaponSlot', statBonus: { atk: 62, lck: 10 }, desc: '+62 ATK, +10 LUK', descEn: '+62 ATK, +10 LUK' },
    { id: 'w_eternity_tome', name: 'คัมภีร์นิรันดร์', nameEn: 'Tome of Eternity', kind: 'weapon', tier: 7, icon: 'weaponSlotMag', statBonus: { mag: 65, mp: 22 }, desc: '+65 MAG, +22 MP', descEn: '+65 MAG, +22 MP' },

    // ---- Armor (boost def/res/hp) ----
    { id: 'a_leather_vest', name: 'เสื้อเกราะหนัง', nameEn: 'Leather Vest', kind: 'armor', tier: 1, icon: 'armorSlot', statBonus: { def: 3, hp: 6 }, desc: '+3 DEF, +6 HP', descEn: '+3 DEF, +6 HP' },
    { id: 'a_padded_robe', name: 'ชุดคลุมนวม', nameEn: 'Padded Robe', kind: 'armor', tier: 1, icon: 'armorSlot', statBonus: { res: 3, mp: 5 }, desc: '+3 RES, +5 MP', descEn: '+3 RES, +5 MP' },
    { id: 'a_chainmail', name: 'เกราะโซ่', nameEn: 'Chainmail', kind: 'armor', tier: 2, icon: 'armorSlot', statBonus: { def: 6, hp: 12 }, desc: '+6 DEF, +12 HP', descEn: '+6 DEF, +12 HP' },
    { id: 'a_mystic_robe', name: 'ชุดคลุมเวทลึกลับ', nameEn: 'Mystic Robe', kind: 'armor', tier: 2, icon: 'armorSlot', statBonus: { res: 6, mp: 10 }, desc: '+6 RES, +10 MP', descEn: '+6 RES, +10 MP' },
    { id: 'a_plate_armor', name: 'เกราะเหล็กแผ่น', nameEn: 'Plate Armor', kind: 'armor', tier: 3, icon: 'armorSlot', statBonus: { def: 10, hp: 22 }, desc: '+10 DEF, +22 HP', descEn: '+10 DEF, +22 HP' },
    { id: 'a_saint_vestment', name: 'อาภรณ์นักบุญ', nameEn: 'Saintly Vestment', kind: 'armor', tier: 3, icon: 'armorSlot', statBonus: { res: 10, hp: 12, mp: 12 }, desc: '+10 RES, +12 HP, +12 MP', descEn: '+10 RES, +12 HP, +12 MP' },
    { id: 'a_dragonscale_mail', name: 'เกราะเกล็ดมังกร', nameEn: 'Dragonscale Mail', kind: 'armor', tier: 4, icon: 'armorSlot', statBonus: { def: 15, hp: 37 }, desc: '+15 DEF, +37 HP', descEn: '+15 DEF, +37 HP' },
    { id: 'a_abyssal_robe', name: 'ชุดคลุมอเวจี', nameEn: 'Abyssal Robe', kind: 'armor', tier: 4, icon: 'armorSlot', statBonus: { res: 15, mp: 18 }, desc: '+15 RES, +18 MP', descEn: '+15 RES, +18 MP' },
    { id: 'a_demonlord_plate', name: 'เกราะจอมมาร', nameEn: "Demon Lord's Plate", kind: 'armor', tier: 5, icon: 'armorSlot', statBonus: { def: 23, hp: 63 }, desc: '+23 DEF, +63 HP', descEn: '+23 DEF, +63 HP' },
    { id: 'a_celestial_shroud', name: 'ผ้าคลุมเทวา', nameEn: 'Celestial Shroud', kind: 'armor', tier: 5, icon: 'armorSlot', statBonus: { res: 23, hp: 30, mp: 25 }, desc: '+23 RES, +30 HP, +25 MP', descEn: '+23 RES, +30 HP, +25 MP' },
    { id: 'a_crystalward_plate', name: 'เกราะผลึกพิทักษ์', nameEn: 'Crystalward Plate', kind: 'armor', tier: 6, icon: 'armorSlot', statBonus: { def: 31, hp: 84 }, desc: '+31 DEF, +84 HP', descEn: '+31 DEF, +84 HP' },
    { id: 'a_echoing_shroud', name: 'ผ้าคลุมสะท้อนเสียง', nameEn: 'Echoing Shroud', kind: 'armor', tier: 6, icon: 'armorSlot', statBonus: { res: 31, mp: 34 }, desc: '+31 RES, +34 MP', descEn: '+31 RES, +34 MP' },
    { id: 'a_timeless_aegis', name: 'เกราะอีจิสไร้กาล', nameEn: 'Timeless Aegis', kind: 'armor', tier: 7, icon: 'armorSlot', statBonus: { def: 42, hp: 115 }, desc: '+42 DEF, +115 HP', descEn: '+42 DEF, +115 HP' },
    { id: 'a_sovereign_mantle', name: 'ผ้าคลุมอธิราช', nameEn: "Sovereign's Mantle", kind: 'armor', tier: 7, icon: 'armorSlot', statBonus: { res: 42, mp: 46 }, desc: '+42 RES, +46 MP', descEn: '+42 RES, +46 MP' },

    // ---- Shoes ----
    { id: 'c_swift_boots', name: 'รองเท้าวิ่งไว', nameEn: 'Swift Boots', kind: 'shoes', tier: 1, icon: 'shoesSlot', statBonus: { spd: 4 }, desc: '+4 SPD', descEn: '+4 SPD' },
    { id: 's_wind_treads', name: 'รองเท้าลมกรด', nameEn: 'Wind Treads', kind: 'shoes', tier: 2, icon: 'shoesSlot', statBonus: { spd: 7, lck: 2 }, desc: '+7 SPD, +2 LUK', descEn: '+7 SPD, +2 LUK' },
    { id: 's_gale_striders', name: 'รองเท้าไล่ลม', nameEn: 'Gale Striders', kind: 'shoes', tier: 3, icon: 'shoesSlot', statBonus: { spd: 12, lck: 3 }, desc: '+12 SPD, +3 LUK', descEn: '+12 SPD, +3 LUK' },
    { id: 's_tempest_boots', name: 'รองเท้าพายุทมิฬ', nameEn: 'Tempest Boots', kind: 'shoes', tier: 4, icon: 'shoesSlot', statBonus: { spd: 18, lck: 5 }, desc: '+18 SPD, +5 LUK', descEn: '+18 SPD, +5 LUK' },
    { id: 's_stormgod_sabatons', name: 'รองเท้าเทพอัสนี', nameEn: "Stormgod's Sabatons", kind: 'shoes', tier: 5, icon: 'shoesSlot', statBonus: { spd: 26, lck: 7 }, desc: '+26 SPD, +7 LUK', descEn: '+26 SPD, +7 LUK' },
    { id: 's_resonant_striders', name: 'รองเท้าก้องกังวาน', nameEn: 'Resonant Striders', kind: 'shoes', tier: 6, icon: 'shoesSlot', statBonus: { spd: 34, lck: 8 }, desc: '+34 SPD, +8 LUK', descEn: '+34 SPD, +8 LUK' },
    { id: 's_boundless_striders', name: 'รองเท้าไร้ขอบเขต', nameEn: 'Boundless Striders', kind: 'shoes', tier: 7, icon: 'shoesSlot', statBonus: { spd: 46, lck: 12 }, desc: '+46 SPD, +12 LUK', descEn: '+46 SPD, +12 LUK' },

    // ---- Accessories ----
    { id: 'c_lucky_charm', name: 'เครื่องรางนำโชค', nameEn: 'Lucky Charm', kind: 'accessory', tier: 1, icon: 'accessorySlot', statBonus: { lck: 7 }, desc: '+7 LUK', descEn: '+7 LUK' },
    { id: 'c_focus_ring', name: 'แหวนสมาธิ', nameEn: 'Focus Ring', kind: 'accessory', tier: 2, icon: 'accessorySlot', statBonus: { str: 3, int: 3 }, desc: '+3 STR, +3 INT', descEn: '+3 STR, +3 INT' },
    { id: 'c_guardian_amulet', name: 'เครื่องรางผู้พิทักษ์', nameEn: 'Guardian Amulet', kind: 'accessory', tier: 2, icon: 'accessorySlot', statBonus: { end: 5 }, desc: '+5 END', descEn: '+5 END' },
    { id: 'c_sovereign_crest', name: 'ตราอธิราช', nameEn: 'Sovereign Crest', kind: 'accessory', tier: 3, icon: 'accessorySlot', statBonus: { str: 5, int: 5, lck: 5 }, desc: '+5 STR, +5 INT, +5 LUK', descEn: '+5 STR, +5 INT, +5 LUK' },
    { id: 'c_spire_heart', name: 'หัวใจแห่งหอคอย', nameEn: 'Heart of the Spire', kind: 'accessory', tier: 3, icon: 'accessorySlot', statBonus: { hp: 20, mp: 15, spd: 3 }, desc: '+20 HP, +15 MP, +3 SPD', descEn: '+20 HP, +15 MP, +3 SPD' },
    { id: 'c_wyrmscale_ring', name: 'แหวนเกล็ดไวเวิร์น', nameEn: 'Wyrmscale Ring', kind: 'accessory', tier: 4, icon: 'accessorySlot', statBonus: { str: 8, int: 8 }, desc: '+8 STR, +8 INT', descEn: '+8 STR, +8 INT' },
    { id: 'c_infernal_pact', name: 'พันธสัญญาอเวจี', nameEn: 'Infernal Pact', kind: 'accessory', tier: 4, icon: 'accessorySlot', statBonus: { end: 14 }, desc: '+14 END', descEn: '+14 END' },
    { id: 'c_demonlord_crown', name: 'มงกุฎจอมมาร', nameEn: "Demon Lord's Crown", kind: 'accessory', tier: 5, icon: 'accessorySlot', statBonus: { str: 12, int: 12, lck: 8 }, desc: '+12 STR, +12 INT, +8 LUK', descEn: '+12 STR, +12 INT, +8 LUK' },
    { id: 'c_heart_of_abyss', name: 'หัวใจอเวจี', nameEn: 'Heart of the Abyss', kind: 'accessory', tier: 5, icon: 'accessorySlot', statBonus: { hp: 40, mp: 30, spd: 5 }, desc: '+40 HP, +30 MP, +5 SPD', descEn: '+40 HP, +30 MP, +5 SPD' },
    { id: 'c_prism_band', name: 'แหวนปริซึม', nameEn: 'Prism Band', kind: 'accessory', tier: 6, icon: 'accessorySlot', statBonus: { str: 16, int: 16 }, desc: '+16 STR, +16 INT', descEn: '+16 STR, +16 INT' },
    { id: 'c_wardens_seal', name: 'ตราผู้เฝ้าผลึก', nameEn: "Warden's Crystal Seal", kind: 'accessory', tier: 6, icon: 'accessorySlot', statBonus: { end: 19 }, desc: '+19 END', descEn: '+19 END' },
    { id: 'c_infinity_loop', name: 'วงแหวนนิรันดร์', nameEn: 'Infinity Loop', kind: 'accessory', tier: 7, icon: 'accessorySlot', statBonus: { str: 22, int: 22 }, desc: '+22 STR, +22 INT', descEn: '+22 STR, +22 INT' },
    { id: 'c_absolute_ward', name: 'เครื่องรางพิทักษ์สมบูรณ์', nameEn: 'Absolute Ward', kind: 'accessory', tier: 7, icon: 'accessorySlot', statBonus: { end: 26 }, desc: '+26 END', descEn: '+26 END' },

    // ---- Consumables ----
    { id: 'p_hp_small', name: 'ยาฟื้นฟู HP เล็ก', nameEn: 'Small HP Potion', kind: 'consumable', tier: 1, icon: 'potion', effect: { type: 'healHp', amount: 30 }, desc: 'ฟื้นฟู 30 HP', descEn: 'Restores 30 HP', battleUsable: true },
    { id: 'p_hp_medium', name: 'ยาฟื้นฟู HP กลาง', nameEn: 'Medium HP Potion', kind: 'consumable', tier: 2, icon: 'potion', effect: { type: 'healHp', amount: 65 }, desc: 'ฟื้นฟู 65 HP', descEn: 'Restores 65 HP', battleUsable: true },
    { id: 'p_hp_large', name: 'ยาฟื้นฟู HP ใหญ่', nameEn: 'Large HP Potion', kind: 'consumable', tier: 3, icon: 'potion', effect: { type: 'healHp', amount: 130 }, desc: 'ฟื้นฟู 130 HP', descEn: 'Restores 130 HP', battleUsable: true },
    { id: 'p_hp_greater', name: 'ยาฟื้นฟู HP วิเศษ', nameEn: 'Greater HP Potion', kind: 'consumable', tier: 4, icon: 'potion', effect: { type: 'healHp', amount: 220 }, desc: 'ฟื้นฟู 220 HP', descEn: 'Restores 220 HP', battleUsable: true },
    { id: 'p_hp_supreme', name: 'ยาฟื้นฟู HP สูงสุด', nameEn: 'Supreme HP Potion', kind: 'consumable', tier: 5, icon: 'potion', effect: { type: 'healHp', amount: 400 }, desc: 'ฟื้นฟู 400 HP', descEn: 'Restores 400 HP', battleUsable: true },
    { id: 'p_hp_pristine', name: 'ยาฟื้นฟู HP บริสุทธิ์', nameEn: 'Pristine HP Potion', kind: 'consumable', tier: 6, icon: 'potion', effect: { type: 'healHp', amount: 550 }, desc: 'ฟื้นฟู 550 HP', descEn: 'Restores 550 HP', battleUsable: true },
    { id: 'p_hp_transcendent', name: 'ยาฟื้นฟู HP เหนือกาล', nameEn: 'Transcendent HP Potion', kind: 'consumable', tier: 7, icon: 'potion', effect: { type: 'healHp', amount: 750 }, desc: 'ฟื้นฟู 750 HP', descEn: 'Restores 750 HP', battleUsable: true },
    { id: 'p_mp_small', name: 'ยาฟื้นฟู MP เล็ก', nameEn: 'Small MP Potion', kind: 'consumable', tier: 1, icon: 'mpPotion', effect: { type: 'healMp', amount: 15 }, desc: 'ฟื้นฟู 15 MP', descEn: 'Restores 15 MP', battleUsable: true },
    { id: 'p_mp_medium', name: 'ยาฟื้นฟู MP กลาง', nameEn: 'Medium MP Potion', kind: 'consumable', tier: 2, icon: 'mpPotion', effect: { type: 'healMp', amount: 32 }, desc: 'ฟื้นฟู 32 MP', descEn: 'Restores 32 MP', battleUsable: true },
    { id: 'p_mp_large', name: 'ยาฟื้นฟู MP ใหญ่', nameEn: 'Large MP Potion', kind: 'consumable', tier: 3, icon: 'mpPotion', effect: { type: 'healMp', amount: 42 }, desc: 'ฟื้นฟู 42 MP', descEn: 'Restores 42 MP', battleUsable: true },
    { id: 'p_mp_greater', name: 'ยาฟื้นฟู MP วิเศษ', nameEn: 'Greater MP Potion', kind: 'consumable', tier: 4, icon: 'mpPotion', effect: { type: 'healMp', amount: 55 }, desc: 'ฟื้นฟู 55 MP', descEn: 'Restores 55 MP', battleUsable: true },
    { id: 'p_mp_supreme', name: 'ยาฟื้นฟู MP สูงสุด', nameEn: 'Supreme MP Potion', kind: 'consumable', tier: 5, icon: 'mpPotion', effect: { type: 'healMp', amount: 90 }, desc: 'ฟื้นฟู 90 MP', descEn: 'Restores 90 MP', battleUsable: true },
    { id: 'p_mp_pristine', name: 'ยาฟื้นฟู MP บริสุทธิ์', nameEn: 'Pristine MP Potion', kind: 'consumable', tier: 6, icon: 'mpPotion', effect: { type: 'healMp', amount: 120 }, desc: 'ฟื้นฟู 120 MP', descEn: 'Restores 120 MP', battleUsable: true },
    { id: 'p_mp_transcendent', name: 'ยาฟื้นฟู MP เหนือกาล', nameEn: 'Transcendent MP Potion', kind: 'consumable', tier: 7, icon: 'mpPotion', effect: { type: 'healMp', amount: 160 }, desc: 'ฟื้นฟู 160 MP', descEn: 'Restores 160 MP', battleUsable: true },
    { id: 'p_elixir', name: 'ยาอมฤต', nameEn: 'Elixir', kind: 'consumable', tier: 3, price: 150, icon: 'gem', effect: { type: 'healBoth', amount: 9999 }, desc: 'ฟื้นฟู HP และ MP เต็ม', descEn: 'Fully restores HP and MP', battleUsable: true },
    { id: 'skill_scroll', name: 'ม้วนคัมภีร์ทักษะ', nameEn: 'Skill Scroll', kind: 'consumable', tier: 2, icon: 'scroll', effect: { type: 'learnSkill' }, desc: 'เรียนรู้ทักษะใหม่ทันที (หรือแปลงเป็นค่าประสบการณ์หากเรียนครบแล้ว)', descEn: 'Instantly learn a new skill (or converts to EXP if all skills are already learned)', battleUsable: false },

    // ---- Crafting materials (kind: 'material') -- dropped by defeated monsters,
    // never sold in the shop or offered as a reward/treasure pick. Two per tier. ----
    { id: 'mat_beast_fang', name: 'เขี้ยวอสูรป่า', nameEn: 'Wild Fang', kind: 'material', tier: 1, icon: 'mat_beast_fang', desc: 'เขี้ยวแหลมคมจากสัตว์ร้ายชั้นล่างหอคอย ใช้คราฟต์อุปกรณ์', descEn: 'A sharp fang from a lowborn tower beast, used in crafting.' },
    { id: 'mat_spirit_dust', name: 'ธุลีวิญญาณจาง', nameEn: 'Faint Spirit Dust', kind: 'material', tier: 1, icon: 'mat_spirit_dust', desc: 'ผงเรืองแสงจาง ๆ จากวิญญาณเงามืด ใช้คราฟต์อุปกรณ์', descEn: 'Faintly glowing dust left by a lesser shade, used in crafting.' },
    { id: 'mat_iron_shard', name: 'เศษเกราะเหล็กกล้า', nameEn: 'Ironplate Shard', kind: 'material', tier: 2, icon: 'mat_iron_shard', desc: 'เศษเกราะเหล็กแข็งแกร่ง ใช้คราฟต์อุปกรณ์', descEn: 'A sturdy shard of iron plating, used in crafting.' },
    { id: 'mat_storm_core', name: 'แก่นวายุ', nameEn: 'Storm Core', kind: 'material', tier: 2, icon: 'mat_storm_core', desc: 'แก่นพลังงานพายุที่ยังคงสั่นไหว ใช้คราฟต์อุปกรณ์', descEn: 'A still-crackling core of storm energy, used in crafting.' },
    { id: 'mat_wyvern_scale', name: 'เกล็ดไวเวิร์น', nameEn: 'Wyvern Scale', kind: 'material', tier: 3, icon: 'mat_wyvern_scale', desc: 'เกล็ดแข็งจากไวเวิร์นปีกอ่อน ใช้คราฟต์อุปกรณ์', descEn: 'A tough scale shed by a young wyvern, used in crafting.' },
    { id: 'mat_demon_fang', name: 'เขี้ยวมาร', nameEn: 'Fiend Fang', kind: 'material', tier: 3, icon: 'mat_demon_fang', desc: 'เขี้ยวดำสนิทของปีศาจชั้นกลาง ใช้คราฟต์อุปกรณ์', descEn: 'A jet-black fang from a mid-tier demon, used in crafting.' },
    { id: 'mat_dragon_scale', name: 'เกล็ดมังกรเพลิง', nameEn: 'Ember Dragon Scale', kind: 'material', tier: 4, icon: 'mat_dragon_scale', desc: 'เกล็ดร้อนระอุจากมังกรแท้ ใช้คราฟต์อุปกรณ์', descEn: 'A searing scale from a true dragon, used in crafting.' },
    { id: 'mat_demonic_core', name: 'แก่นอสูรมาร', nameEn: 'Fiend Core', kind: 'material', tier: 4, icon: 'mat_demonic_core', desc: 'แก่นพลังมืดจากปีศาจชั้นสูง ใช้คราฟต์อุปกรณ์', descEn: 'A dark power core from a greater demon, used in crafting.' },
    { id: 'mat_ancient_scale', name: 'เกล็ดมังกรบรรพกาล', nameEn: 'Ancient Wyrm Scale', kind: 'material', tier: 5, icon: 'mat_ancient_scale', desc: 'เกล็ดสีทองจากมังกรยุคโบราณ ใช้คราฟต์อุปกรณ์', descEn: 'A golden scale from an ancient dragon, used in crafting.' },
    { id: 'mat_abyssal_essence', name: 'แก่นสารอเวจี', nameEn: 'Abyssal Essence', kind: 'material', tier: 5, icon: 'mat_abyssal_essence', desc: 'สาระอันมืดมิดจากห้วงนรกลึกสุด ใช้คราฟต์อุปกรณ์', descEn: 'A pitch-dark essence drawn from the deepest abyss, used in crafting.' },
    { id: 'mat_resonant_shard', name: 'เศษผลึกก้องกังวาน', nameEn: 'Resonant Shard', kind: 'material', tier: 6, icon: 'mat_resonant_shard', desc: 'เศษผลึกที่ยังสั่นสะเทือนด้วยเสียงประสาน ใช้คราฟต์อุปกรณ์', descEn: 'A crystal shard still humming with harmonic resonance, used in crafting.' },
    { id: 'mat_crystal_dust', name: 'ผงผลึกวิญญาณ', nameEn: 'Crystal Dust', kind: 'material', tier: 6, icon: 'mat_crystal_dust', desc: 'ผงเรืองแสงจากวิญญาณผลึกแห่งถ้ำลึก ใช้คราฟต์อุปกรณ์', descEn: 'Glowing dust left by a crystal spirit of the deep caverns, used in crafting.' },
    { id: 'mat_abyssal_scale', name: 'เกล็ดสมุทรอเวจี', nameEn: 'Abyssal Scale', kind: 'material', tier: 7, icon: 'mat_abyssal_scale', desc: 'เกล็ดเหนียวแน่นจากสัตว์ประหลาดใต้บาดาล ใช้คราฟต์อุปกรณ์', descEn: 'A tough scale from a monster of the sunken ruins, used in crafting.' },
    { id: 'mat_drowned_core', name: 'แก่นวิญญาณสมุทร', nameEn: 'Drowned Soul Core', kind: 'material', tier: 7, icon: 'mat_drowned_core', desc: 'แก่นพลังงานเย็นยะเยือกจากวิญญาณใต้บาดาล ใช้คราฟต์อุปกรณ์', descEn: 'An ice-cold energy core drawn from a drowned soul, used in crafting.' },
    { id: 'mat_storm_feather', name: 'ขนอัสนี', nameEn: 'Thunderfeather', kind: 'material', tier: 8, icon: 'mat_storm_feather', desc: 'ขนปีกที่ยังมีประจุไฟฟ้าคุกรุ่นจากนกล่าเหยื่อแห่งพายุ', descEn: "A still-crackling feather shed by a bird of prey from the storm citadel, used in crafting." },
    { id: 'mat_voltaic_core', name: 'แก่นประจุอัสนี', nameEn: 'Voltaic Core', kind: 'material', tier: 8, icon: 'mat_voltaic_core', desc: 'แก่นพลังงานไฟฟ้าแรงสูงจากสิ่งมีชีวิตแห่งเมฆพายุ ใช้คราฟต์อุปกรณ์', descEn: 'A high-voltage energy core from a storm-cloud creature, used in crafting.' },
    { id: 'mat_bone_fragment', name: 'เศษกระดูกบรรพกาล', nameEn: 'Ancient Bone Shard', kind: 'material', tier: 9, icon: 'mat_bone_fragment', desc: 'ชิ้นส่วนกระดูกแข็งจากผู้พิทักษ์ทะเลทรายยุคเก่า ใช้คราฟต์อุปกรณ์', descEn: 'A hardened bone fragment from an ancient desert guardian, used in crafting.' },
    { id: 'mat_wraith_essence', name: 'แก่นสารวิญญาณทราย', nameEn: 'Dune Wraith Essence', kind: 'material', tier: 9, icon: 'mat_wraith_essence', desc: 'สาระอันแห้งผากจากวิญญาณเร่ร่อนกลางทะเลทรายกระดูก ใช้คราฟต์อุปกรณ์', descEn: 'A parched essence drawn from a wraith wandering the bone desert, used in crafting.' },

    // ---- Craft-only equipment (kind matches normal equipment, but craftOnly:
    // true keeps them out of the shop and reward/treasure pools -- the crafting
    // bench is their only source). One per tier, cycling weapon/armor/shoes/
    // accessory; each is tuned to roughly match the FOLLOWING tier's best
    // same-kind shop item, so crafting is a genuine reward for farming
    // materials -- a clear step up, not just a side-grade -- without
    // outclassing the next tier you're about to reach. Tiers 8-9 have no
    // higher shop tier to reference, so they're scaled up from the tier-7
    // shop ceiling instead. ----
    { id: 'w_craft_fangblade', name: 'ดาบเขี้ยวเงา', nameEn: 'Shadowfang Blade', kind: 'weapon', tier: 1, icon: 'weaponSlot', craftOnly: true, statBonus: { atk: 9, lck: 5 }, desc: '+9 ATK, +5 LUK', descEn: '+9 ATK, +5 LUK' },
    { id: 'a_craft_ironward', name: 'เกราะหลอมพายุ', nameEn: 'Stormforged Plate', kind: 'armor', tier: 2, icon: 'armorSlot', craftOnly: true, statBonus: { def: 11, hp: 24 }, desc: '+11 DEF, +24 HP', descEn: '+11 DEF, +24 HP' },
    { id: 's_craft_wyvernstride', name: 'รองเท้าเกล็ดไวเวิร์น', nameEn: 'Wyvernscale Striders', kind: 'shoes', tier: 3, icon: 'shoesSlot', craftOnly: true, statBonus: { spd: 19, lck: 7 }, desc: '+19 SPD, +7 LUK', descEn: '+19 SPD, +7 LUK' },
    { id: 'c_craft_dragonfangring', name: 'แหวนตราเขี้ยวมังกร', nameEn: 'Dragonfang Signet', kind: 'accessory', tier: 4, icon: 'accessorySlot', craftOnly: true, statBonus: { str: 13, int: 13 }, desc: '+13 STR, +13 INT', descEn: '+13 STR, +13 INT' },
    { id: 'w_craft_voidreaver', name: 'ดาบเก็บเกี่ยวความว่าง', nameEn: 'Voidreaver Blade', kind: 'weapon', tier: 5, icon: 'weaponSlot', craftOnly: true, statBonus: { atk: 47, lck: 10 }, desc: '+47 ATK, +10 LUK', descEn: '+47 ATK, +10 LUK' },
    { id: 'a_craft_resonant_bulwark', name: 'เกราะปราการก้องกังวาน', nameEn: 'Resonant Bulwark', kind: 'armor', tier: 6, icon: 'armorSlot', craftOnly: true, statBonus: { def: 44, hp: 120 }, desc: '+44 DEF, +120 HP', descEn: '+44 DEF, +120 HP' },
    { id: 's_craft_undertow_striders', name: 'รองเท้ากระแสใต้บาดาล', nameEn: 'Undertow Striders', kind: 'shoes', tier: 7, icon: 'shoesSlot', craftOnly: true, statBonus: { spd: 64, lck: 17 }, desc: '+64 SPD, +17 LUK', descEn: '+64 SPD, +17 LUK' },
    { id: 'c_craft_stormcaller_band', name: 'แหวนเรียกพายุ', nameEn: "Stormcaller's Band", kind: 'accessory', tier: 8, icon: 'accessorySlot', craftOnly: true, statBonus: { str: 32, int: 32 }, desc: '+32 STR, +32 INT', descEn: '+32 STR, +32 INT' },
    { id: 'w_craft_desert_sovereign', name: 'ดาบอธิราชทะเลทราย', nameEn: 'Desert Sovereign Blade', kind: 'weapon', tier: 9, icon: 'weaponSlot', craftOnly: true, statBonus: { atk: 98, lck: 17 }, desc: '+98 ATK, +17 LUK', descEn: '+98 ATK, +17 LUK' },

    // ---- Quest-exclusive rewards (see data-quests.js) -- questOnly keeps them out
    // of the shop and every reward/treasure pool (getItemsByKindTier and the shop/
    // waypoint/reward-pool filters all exclude questOnly explicitly), same as
    // craftOnly does for the crafting bench's own equipment above. Claiming the
    // quest that grants one is their only source. ----
    { id: 'c_quest_novice_badge', name: 'ตราผู้เริ่มต้น', nameEn: "Novice's Badge", kind: 'accessory', tier: 2, icon: 'accessorySlot', questOnly: true, statBonus: { str: 3, int: 3, end: 3 }, desc: '+3 STR, +3 INT, +3 END (รางวัลภารกิจเท่านั้น)', descEn: '+3 STR, +3 INT, +3 END (quest reward only)' },
    { id: 'c_quest_veteran_medal', name: 'เหรียญทหารผ่านศึก', nameEn: "Veteran's Medal", kind: 'accessory', tier: 4, icon: 'accessorySlot', questOnly: true, statBonus: { str: 7, int: 7, end: 9, lck: 5 }, desc: '+7 STR, +7 INT, +9 END, +5 LUK (รางวัลภารกิจเท่านั้น)', descEn: '+7 STR, +7 INT, +9 END, +5 LUK (quest reward only)' },
    { id: 'c_quest_sovereign_relic', name: 'โบราณวัตถุแห่งอธิราชไร้กาล', nameEn: 'Relic of the Timeless Sovereign', kind: 'accessory', tier: 7, icon: 'accessorySlot', questOnly: true, statBonus: { str: 18, int: 18, end: 20, spd: 8, lck: 13 }, desc: '+18 STR, +18 INT, +20 END, +8 SPD, +13 LUK (รางวัลภารกิจเท่านั้น)', descEn: '+18 STR, +18 INT, +20 END, +8 SPD, +13 LUK (quest reward only)' }
  ];

  window.Game = window.Game || {};
  window.Game.Data = window.Game.Data || {};
  window.Game.Data.items = items;
  window.Game.Data.getItem = function (id) {
    for (var i = 0; i < items.length; i++) if (items[i].id === id) return items[i];
    return null;
  };
  window.Game.Data.getItemsByKindTier = function (kind, tier) {
    return items.filter(function (it) { return it.kind === kind && it.tier === tier && !it.craftOnly && !it.questOnly; });
  };
})();
