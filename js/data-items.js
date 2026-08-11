// Equipment + consumable item definitions. tier matches the tower's floor tiers (1: 1-10, 2: 11-20, 3: 21-30, 4: 31-40, 5: 41-49).
(function () {
  var items = [
    // ---- Weapons (boost atk & mag a bit) ----
    { id: 'w_rusty_blade', name: 'ดาบสนิม', nameEn: 'Rusty Blade', kind: 'weapon', tier: 1, icon: 'weaponSlot', statBonus: { atk: 3 }, desc: '+3 ATK', descEn: '+3 ATK' },
    { id: 'w_hunting_blade', name: 'ดาบล่าเนื้อ', nameEn: 'Hunting Blade', kind: 'weapon', tier: 1, icon: 'weaponSlot', statBonus: { atk: 5, luk: 1 }, desc: '+5 ATK, +1 LUK', descEn: '+5 ATK, +1 LUK' },
    { id: 'w_apprentice_wand', name: 'คทาศิษย์เวท', nameEn: 'Apprentice Wand', kind: 'weapon', tier: 1, icon: 'weaponSlot', statBonus: { mag: 5 }, desc: '+5 MAG', descEn: '+5 MAG' },
    { id: 'w_knight_sword', name: 'ดาบอัศวิน', nameEn: 'Knight Sword', kind: 'weapon', tier: 2, icon: 'weaponSlot', statBonus: { atk: 8, def: 2 }, desc: '+8 ATK, +2 DEF', descEn: '+8 ATK, +2 DEF' },
    { id: 'w_arcane_staff', name: 'คทาอาถรรพ์', nameEn: 'Arcane Staff', kind: 'weapon', tier: 2, icon: 'weaponSlot', statBonus: { mag: 9, res: 2 }, desc: '+9 MAG, +2 RES', descEn: '+9 MAG, +2 RES' },
    { id: 'w_storm_glaive', name: 'ทวนสายลม', nameEn: 'Storm Glaive', kind: 'weapon', tier: 2, icon: 'weaponSlot', statBonus: { atk: 6, spd: 3 }, desc: '+6 ATK, +3 SPD', descEn: '+6 ATK, +3 SPD' },
    { id: 'w_soul_edge', name: 'ดาบกินวิญญาณ', nameEn: 'Soul Edge', kind: 'weapon', tier: 3, icon: 'weaponSlot', statBonus: { atk: 13, luk: 2 }, desc: '+13 ATK, +2 LUK', descEn: '+13 ATK, +2 LUK' },
    { id: 'w_grand_grimoire', name: 'คัมภีร์เวทมนตร์', nameEn: 'Grand Grimoire', kind: 'weapon', tier: 3, icon: 'weaponSlot', statBonus: { mag: 14, mp: 6 }, desc: '+14 MAG, +6 MP', descEn: '+14 MAG, +6 MP' },
    { id: 'w_dragonfang_blade', name: 'ดาบเขี้ยวมังกร', nameEn: 'Dragonfang Blade', kind: 'weapon', tier: 4, icon: 'weaponSlot', statBonus: { atk: 21, luk: 3 }, desc: '+21 ATK, +3 LUK', descEn: '+21 ATK, +3 LUK' },
    { id: 'w_infernal_scepter', name: 'คทานรกา', nameEn: 'Infernal Scepter', kind: 'weapon', tier: 4, icon: 'weaponSlot', statBonus: { mag: 22, mp: 8 }, desc: '+22 MAG, +8 MP', descEn: '+22 MAG, +8 MP' },
    { id: 'w_tempest_lance', name: 'หอกพายุทมิฬ', nameEn: 'Tempest Lance', kind: 'weapon', tier: 4, icon: 'weaponSlot', statBonus: { atk: 16, spd: 5 }, desc: '+16 ATK, +5 SPD', descEn: '+16 ATK, +5 SPD' },
    { id: 'w_voidforged_blade', name: 'ดาบขุมนรกไร้แสง', nameEn: 'Voidforged Blade', kind: 'weapon', tier: 5, icon: 'weaponSlot', statBonus: { atk: 34, luk: 4 }, desc: '+34 ATK, +4 LUK', descEn: '+34 ATK, +4 LUK' },
    { id: 'w_archdemon_tome', name: 'คัมภีร์อาร์คเดวิล', nameEn: 'Archdemon Tome', kind: 'weapon', tier: 5, icon: 'weaponSlot', statBonus: { mag: 35, mp: 12 }, desc: '+35 MAG, +12 MP', descEn: '+35 MAG, +12 MP' },

    // ---- Armor (boost def/res/hp) ----
    { id: 'a_leather_vest', name: 'เกราะหนัง', nameEn: 'Leather Vest', kind: 'armor', tier: 1, icon: 'armorSlot', statBonus: { def: 3, hp: 6 }, desc: '+3 DEF, +6 HP', descEn: '+3 DEF, +6 HP' },
    { id: 'a_padded_robe', name: 'เสื้อคลุมนวม', nameEn: 'Padded Robe', kind: 'armor', tier: 1, icon: 'armorSlot', statBonus: { res: 3, mp: 5 }, desc: '+3 RES, +5 MP', descEn: '+3 RES, +5 MP' },
    { id: 'a_chainmail', name: 'เกราะลูกโซ่', nameEn: 'Chainmail', kind: 'armor', tier: 2, icon: 'armorSlot', statBonus: { def: 6, hp: 12 }, desc: '+6 DEF, +12 HP', descEn: '+6 DEF, +12 HP' },
    { id: 'a_mystic_robe', name: 'เสื้อคลุมเวทมนตร์', nameEn: 'Mystic Robe', kind: 'armor', tier: 2, icon: 'armorSlot', statBonus: { res: 6, mp: 10 }, desc: '+6 RES, +10 MP', descEn: '+6 RES, +10 MP' },
    { id: 'a_plate_armor', name: 'เกราะเพลท', nameEn: 'Plate Armor', kind: 'armor', tier: 3, icon: 'armorSlot', statBonus: { def: 10, hp: 22 }, desc: '+10 DEF, +22 HP', descEn: '+10 DEF, +22 HP' },
    { id: 'a_saint_vestment', name: 'อาภรณ์นักบุญ', nameEn: 'Saintly Vestment', kind: 'armor', tier: 3, icon: 'armorSlot', statBonus: { res: 10, hp: 12, mp: 12 }, desc: '+10 RES, +12 HP, +12 MP', descEn: '+10 RES, +12 HP, +12 MP' },
    { id: 'a_dragonscale_mail', name: 'เกราะเกล็ดมังกร', nameEn: 'Dragonscale Mail', kind: 'armor', tier: 4, icon: 'armorSlot', statBonus: { def: 15, hp: 37 }, desc: '+15 DEF, +37 HP', descEn: '+15 DEF, +37 HP' },
    { id: 'a_abyssal_robe', name: 'เสื้อคลุมห้วงนรก', nameEn: 'Abyssal Robe', kind: 'armor', tier: 4, icon: 'armorSlot', statBonus: { res: 15, mp: 18 }, desc: '+15 RES, +18 MP', descEn: '+15 RES, +18 MP' },
    { id: 'a_demonlord_plate', name: 'เกราะจอมมาร', nameEn: "Demon Lord's Plate", kind: 'armor', tier: 5, icon: 'armorSlot', statBonus: { def: 23, hp: 63 }, desc: '+23 DEF, +63 HP', descEn: '+23 DEF, +63 HP' },
    { id: 'a_celestial_shroud', name: 'ผ้าคลุมสวรรค์', nameEn: 'Celestial Shroud', kind: 'armor', tier: 5, icon: 'armorSlot', statBonus: { res: 23, hp: 30, mp: 25 }, desc: '+23 RES, +30 HP, +25 MP', descEn: '+23 RES, +30 HP, +25 MP' },

    // ---- Shoes ----
    { id: 'c_swift_boots', name: 'รองเท้าไว', nameEn: 'Swift Boots', kind: 'shoes', tier: 1, icon: 'shoesSlot', statBonus: { spd: 4 }, desc: '+4 SPD', descEn: '+4 SPD' },
    { id: 's_wind_treads', name: 'รองเท้าลมกรด', nameEn: 'Wind Treads', kind: 'shoes', tier: 2, icon: 'shoesSlot', statBonus: { spd: 7, luk: 1 }, desc: '+7 SPD, +1 LUK', descEn: '+7 SPD, +1 LUK' },
    { id: 's_gale_striders', name: 'รองเท้าไล่ล่าสายลม', nameEn: 'Gale Striders', kind: 'shoes', tier: 3, icon: 'shoesSlot', statBonus: { spd: 12, luk: 2 }, desc: '+12 SPD, +2 LUK', descEn: '+12 SPD, +2 LUK' },
    { id: 's_tempest_boots', name: 'รองเท้าพายุทมิฬ', nameEn: 'Tempest Boots', kind: 'shoes', tier: 4, icon: 'shoesSlot', statBonus: { spd: 18, luk: 3 }, desc: '+18 SPD, +3 LUK', descEn: '+18 SPD, +3 LUK' },
    { id: 's_stormgod_sabatons', name: 'รองเท้าเทพสายฟ้า', nameEn: "Stormgod's Sabatons", kind: 'shoes', tier: 5, icon: 'shoesSlot', statBonus: { spd: 26, luk: 4 }, desc: '+26 SPD, +4 LUK', descEn: '+26 SPD, +4 LUK' },

    // ---- Accessories ----
    { id: 'c_lucky_charm', name: 'เครื่องรางนำโชค', nameEn: 'Lucky Charm', kind: 'accessory', tier: 1, icon: 'accessorySlot', statBonus: { luk: 4 }, desc: '+4 LUK', descEn: '+4 LUK' },
    { id: 'c_focus_ring', name: 'แหวนสมาธิ', nameEn: 'Focus Ring', kind: 'accessory', tier: 2, icon: 'accessorySlot', statBonus: { atk: 3, mag: 3 }, desc: '+3 ATK, +3 MAG', descEn: '+3 ATK, +3 MAG' },
    { id: 'c_guardian_amulet', name: 'ประคำผู้พิทักษ์', nameEn: 'Guardian Amulet', kind: 'accessory', tier: 2, icon: 'accessorySlot', statBonus: { def: 3, res: 3 }, desc: '+3 DEF, +3 RES', descEn: '+3 DEF, +3 RES' },
    { id: 'c_sovereign_crest', name: 'ตราราชันย์', nameEn: 'Sovereign Crest', kind: 'accessory', tier: 3, icon: 'accessorySlot', statBonus: { atk: 5, mag: 5, luk: 3 }, desc: '+5 ATK, +5 MAG, +3 LUK', descEn: '+5 ATK, +5 MAG, +3 LUK' },
    { id: 'c_spire_heart', name: 'หัวใจแห่งหอคอย', nameEn: 'Heart of the Spire', kind: 'accessory', tier: 3, icon: 'accessorySlot', statBonus: { hp: 20, mp: 15, spd: 3 }, desc: '+20 HP, +15 MP, +3 SPD', descEn: '+20 HP, +15 MP, +3 SPD' },
    { id: 'c_wyrmscale_ring', name: 'แหวนเกล็ดไวเวิร์น', nameEn: 'Wyrmscale Ring', kind: 'accessory', tier: 4, icon: 'accessorySlot', statBonus: { atk: 8, mag: 8 }, desc: '+8 ATK, +8 MAG', descEn: '+8 ATK, +8 MAG' },
    { id: 'c_infernal_pact', name: 'สัญญานรก', nameEn: 'Infernal Pact', kind: 'accessory', tier: 4, icon: 'accessorySlot', statBonus: { def: 8, res: 8 }, desc: '+8 DEF, +8 RES', descEn: '+8 DEF, +8 RES' },
    { id: 'c_demonlord_crown', name: 'มงกุฎจอมมาร', nameEn: "Demon Lord's Crown", kind: 'accessory', tier: 5, icon: 'accessorySlot', statBonus: { atk: 12, mag: 12, luk: 5 }, desc: '+12 ATK, +12 MAG, +5 LUK', descEn: '+12 ATK, +12 MAG, +5 LUK' },
    { id: 'c_heart_of_abyss', name: 'หัวใจห้วงนรก', nameEn: 'Heart of the Abyss', kind: 'accessory', tier: 5, icon: 'accessorySlot', statBonus: { hp: 40, mp: 30, spd: 5 }, desc: '+40 HP, +30 MP, +5 SPD', descEn: '+40 HP, +30 MP, +5 SPD' },

    // ---- Consumables ----
    { id: 'p_hp_small', name: 'ยาฟื้นฟู HP เล็ก', nameEn: 'Small HP Potion', kind: 'consumable', tier: 1, icon: 'potion', effect: { type: 'healHp', amount: 30 }, desc: 'ฟื้นฟู 30 HP', descEn: 'Restores 30 HP', battleUsable: true },
    { id: 'p_hp_medium', name: 'ยาฟื้นฟู HP กลาง', nameEn: 'Medium HP Potion', kind: 'consumable', tier: 2, icon: 'potion', effect: { type: 'healHp', amount: 65 }, desc: 'ฟื้นฟู 65 HP', descEn: 'Restores 65 HP', battleUsable: true },
    { id: 'p_hp_large', name: 'ยาฟื้นฟู HP ใหญ่', nameEn: 'Large HP Potion', kind: 'consumable', tier: 3, icon: 'potion', effect: { type: 'healHp', amount: 130 }, desc: 'ฟื้นฟู 130 HP', descEn: 'Restores 130 HP', battleUsable: true },
    { id: 'p_hp_greater', name: 'ยาฟื้นฟู HP วิเศษ', nameEn: 'Greater HP Potion', kind: 'consumable', tier: 4, icon: 'potion', effect: { type: 'healHp', amount: 220 }, desc: 'ฟื้นฟู 220 HP', descEn: 'Restores 220 HP', battleUsable: true },
    { id: 'p_hp_supreme', name: 'ยาฟื้นฟู HP สูงสุด', nameEn: 'Supreme HP Potion', kind: 'consumable', tier: 5, icon: 'potion', effect: { type: 'healHp', amount: 400 }, desc: 'ฟื้นฟู 400 HP', descEn: 'Restores 400 HP', battleUsable: true },
    { id: 'p_mp_small', name: 'ยาฟื้นฟู MP เล็ก', nameEn: 'Small MP Potion', kind: 'consumable', tier: 1, icon: 'drop', effect: { type: 'healMp', amount: 15 }, desc: 'ฟื้นฟู 15 MP', descEn: 'Restores 15 MP', battleUsable: true },
    { id: 'p_mp_medium', name: 'ยาฟื้นฟู MP กลาง', nameEn: 'Medium MP Potion', kind: 'consumable', tier: 2, icon: 'drop', effect: { type: 'healMp', amount: 32 }, desc: 'ฟื้นฟู 32 MP', descEn: 'Restores 32 MP', battleUsable: true },
    { id: 'p_mp_greater', name: 'ยาฟื้นฟู MP วิเศษ', nameEn: 'Greater MP Potion', kind: 'consumable', tier: 4, icon: 'drop', effect: { type: 'healMp', amount: 55 }, desc: 'ฟื้นฟู 55 MP', descEn: 'Restores 55 MP', battleUsable: true },
    { id: 'p_mp_supreme', name: 'ยาฟื้นฟู MP สูงสุด', nameEn: 'Supreme MP Potion', kind: 'consumable', tier: 5, icon: 'drop', effect: { type: 'healMp', amount: 90 }, desc: 'ฟื้นฟู 90 MP', descEn: 'Restores 90 MP', battleUsable: true },
    { id: 'p_elixir', name: 'ยาอมฤต', nameEn: 'Elixir', kind: 'consumable', tier: 3, icon: 'gem', effect: { type: 'healBoth', amount: 9999 }, desc: 'ฟื้นฟู HP และ MP เต็ม', descEn: 'Fully restores HP and MP', battleUsable: true },
    { id: 'skill_scroll', name: 'ม้วนคัมภีร์ทักษะ', nameEn: 'Skill Scroll', kind: 'consumable', tier: 2, icon: 'scroll', effect: { type: 'learnSkill' }, desc: 'เรียนรู้ทักษะใหม่ทันที (หรือแปลงเป็นค่าประสบการณ์หากเรียนครบแล้ว)', descEn: 'Instantly learn a new skill (or converts to EXP if all skills are already learned)', battleUsable: false }
  ];

  window.Game = window.Game || {};
  window.Game.Data = window.Game.Data || {};
  window.Game.Data.items = items;
  window.Game.Data.getItem = function (id) {
    for (var i = 0; i < items.length; i++) if (items[i].id === id) return items[i];
    return null;
  };
  window.Game.Data.getItemsByKindTier = function (kind, tier) {
    return items.filter(function (it) { return it.kind === kind && it.tier === tier; });
  };
})();
