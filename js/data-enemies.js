// Enemy templates grouped by tier (which floor range they can appear on) + the floor-50 final boss.
// baseStats are calibrated for floor 1; battle-engine scales them per floor/difficulty.
// Tiers: 1 = floors 1-10 (beasts & lesser undead), 2 = 11-20 (knights & elementals),
// 3 = 21-30 (dark knights, young wyverns, first demons), 4 = 31-40 (true dragons & greater demons),
// 5 = 41-49 (archdevils & ancient dragons guarding the Demon Lord's throne).
(function () {
  var enemies = [
    // ---- Tier 1 : floors 1-10 ----
    {
      id: 'shadow_wolf', name: 'หมาป่าเงา', nameEn: 'Shadow Wolf', tier: 1, icon: 'wolf',
      baseStats: { hp: 22, atk: 8, mag: 2, def: 4, res: 3, spd: 11, luk: 5, exp: 14 },
      weak: ['fire'], resist: ['ice'],
      attacks: [
        { name: 'กัดฉีก', nameEn: 'Rending Bite', element: 'phys', power: 1.0, target: 'single', weight: 3 },
        { name: 'เขี้ยวน้ำแข็ง', nameEn: 'Frost Fang', element: 'ice', power: 1.2, target: 'single', weight: 2 }
      ]
    },
    {
      id: 'flame_imp', name: 'ปีศาจเปลวไฟ', nameEn: 'Flame Imp', tier: 1, icon: 'demon',
      baseStats: { hp: 20, atk: 7, mag: 8, def: 3, res: 5, spd: 9, luk: 4, exp: 14 },
      weak: ['ice'], resist: ['fire'],
      attacks: [
        { name: 'เปลวเลีย', nameEn: 'Flame Lick', element: 'fire', power: 1.3, target: 'single', weight: 3 },
        { name: 'ข่วน', nameEn: 'Claw Swipe', element: 'phys', power: 0.9, target: 'single', weight: 2 }
      ]
    },
    {
      id: 'stone_golem', name: 'โกเลมหิน', nameEn: 'Stone Golem', tier: 1, icon: 'golem',
      baseStats: { hp: 34, atk: 9, mag: 1, def: 9, res: 4, spd: 4, luk: 2, exp: 18 },
      weak: ['elec'], resist: ['phys'],
      attacks: [
        { name: 'ทุบหิน', nameEn: 'Rock Smash', element: 'phys', power: 1.2, target: 'single', weight: 4 }
      ]
    },
    {
      id: 'dark_bat', name: 'ค้างคาวรัตติกาล', nameEn: 'Nightfall Bat', tier: 1, icon: 'bat',
      baseStats: { hp: 18, atk: 6, mag: 7, def: 3, res: 4, spd: 13, luk: 6, exp: 13 },
      weak: ['light'], resist: ['dark'],
      attacks: [
        { name: 'กัดดูดเลือด', nameEn: 'Blood Drain Bite', element: 'dark', power: 1.1, target: 'single', weight: 2, drainSelf: true },
        { name: 'โฉบตะปบ', nameEn: 'Swooping Claw', element: 'phys', power: 0.9, target: 'single', weight: 3 }
      ]
    },
    {
      id: 'gust_sprite', name: 'เอลฟ์สายลม', nameEn: 'Wind Sprite', tier: 1, icon: 'windSprite',
      baseStats: { hp: 19, atk: 6, mag: 8, def: 3, res: 5, spd: 14, luk: 7, exp: 14 },
      weak: ['fire'], resist: ['wind'],
      attacks: [
        { name: 'ใบมีดลม', nameEn: 'Wind Blade', element: 'wind', power: 1.2, target: 'single', weight: 3 }
      ]
    },
    {
      id: 'giant_spider', name: 'แมงมุมพิษยักษ์', nameEn: 'Giant Spider', tier: 1, icon: 'spider',
      baseStats: { hp: 24, atk: 9, mag: 4, def: 4, res: 4, spd: 10, luk: 5, exp: 15 },
      weak: ['fire'], resist: ['dark'],
      attacks: [
        { name: 'กัดพิษ', nameEn: 'Venom Bite', element: 'dark', power: 1.1, target: 'single', weight: 3, debuff: { stat: 'def', amount: 0.15 } },
        { name: 'ขาคม', nameEn: 'Sharp Leg Strike', element: 'phys', power: 1.0, target: 'single', weight: 2 }
      ]
    },
    {
      id: 'bog_slime', name: 'เมือกหนองน้ำ', nameEn: 'Bog Slime', tier: 1, icon: 'slime',
      baseStats: { hp: 30, atk: 6, mag: 4, def: 8, res: 5, spd: 3, luk: 3, exp: 16 },
      weak: ['elec'], resist: ['phys'],
      attacks: [
        { name: 'พุ่งชนเหนียวหนึบ', nameEn: 'Sticky Slam', element: 'phys', power: 1.0, target: 'single', weight: 4 }
      ]
    },
    {
      id: 'forest_bandit', name: 'โจรป่าเจ้าเล่ห์', nameEn: 'Forest Bandit', tier: 1, icon: 'bandit',
      baseStats: { hp: 21, atk: 10, mag: 2, def: 4, res: 3, spd: 12, luk: 9, exp: 15 },
      weak: ['ice'], resist: ['wind'],
      attacks: [
        { name: 'แทงเร็ว', nameEn: 'Quick Stab', element: 'phys', power: 1.1, target: 'single', weight: 3 },
        { name: 'ปาขวานเล็ก', nameEn: 'Hatchet Throw', element: 'phys', power: 0.9, target: 'single', weight: 2 }
      ]
    },

    // ---- Tier 2 : floors 11-20 ----
    {
      id: 'frost_knight', name: 'อัศวินน้ำแข็ง', nameEn: 'Frost Knight', tier: 2, icon: 'knight',
      baseStats: { hp: 42, atk: 12, mag: 6, def: 10, res: 7, spd: 8, luk: 6, exp: 26 },
      weak: ['fire'], resist: ['ice'],
      attacks: [
        { name: 'ฟันดาบน้ำแข็ง', nameEn: 'Ice Blade Slash', element: 'ice', power: 1.3, target: 'single', weight: 3 },
        { name: 'ฟาดโล่', nameEn: 'Shield Bash', element: 'phys', power: 1.0, target: 'single', weight: 2 }
      ]
    },
    {
      id: 'thunder_hawk', name: 'เหยี่ยวสายฟ้า', nameEn: 'Thunder Hawk', tier: 2, icon: 'hawk',
      baseStats: { hp: 30, atk: 10, mag: 10, def: 5, res: 6, spd: 15, luk: 8, exp: 24 },
      weak: ['ice'], resist: ['elec'],
      attacks: [
        { name: 'จิกสายฟ้า', nameEn: 'Lightning Peck', element: 'elec', power: 1.3, target: 'single', weight: 3 }
      ]
    },
    {
      id: 'venom_wraith', name: 'วิญญาณพิษ', nameEn: 'Venom Wraith', tier: 2, icon: 'shadowFigure',
      baseStats: { hp: 34, atk: 8, mag: 12, def: 5, res: 6, spd: 10, luk: 6, exp: 25 },
      weak: ['light'], resist: ['dark'],
      attacks: [
        { name: 'ดูดวิญญาณ', nameEn: 'Soul Drain', element: 'dark', power: 1.2, target: 'single', weight: 3, drainSelf: true }
      ]
    },
    {
      id: 'iron_sentinel', name: 'ยามเหล็กจักรกล', nameEn: 'Iron Sentinel', tier: 2, icon: 'sentinel',
      baseStats: { hp: 50, atk: 11, mag: 3, def: 12, res: 6, spd: 5, luk: 4, exp: 27 },
      weak: ['elec'], resist: ['phys'],
      attacks: [
        { name: 'หมัดเหล็ก', nameEn: 'Iron Fist', element: 'phys', power: 1.3, target: 'single', weight: 4 }
      ]
    },
    {
      id: 'storm_harpy', name: 'ฮาร์ปี้พายุ', nameEn: 'Storm Harpy', tier: 2, icon: 'harpy',
      baseStats: { hp: 32, atk: 9, mag: 11, def: 6, res: 7, spd: 13, luk: 7, exp: 25 },
      weak: ['elec'], resist: ['wind'],
      attacks: [
        { name: 'พายุกรงเล็บ', nameEn: 'Talon Storm', element: 'wind', power: 1.3, target: 'single', weight: 3 }
      ]
    },
    {
      id: 'swamp_troll', name: 'โทรลล์หนองน้ำ', nameEn: 'Swamp Troll', tier: 2, icon: 'troll',
      baseStats: { hp: 55, atk: 13, mag: 2, def: 11, res: 5, spd: 5, luk: 3, exp: 27 },
      weak: ['fire'], resist: ['phys'],
      attacks: [
        { name: 'ตะบองทุบ', nameEn: 'Club Smash', element: 'phys', power: 1.3, target: 'single', weight: 4 }
      ]
    },
    {
      id: 'crystal_golem', name: 'โกเลมแก้วอาถรรพ์', nameEn: 'Crystal Golem', tier: 2, icon: 'golem',
      baseStats: { hp: 46, atk: 9, mag: 12, def: 9, res: 10, spd: 6, luk: 4, exp: 26 },
      weak: ['dark'], resist: ['light'],
      attacks: [
        { name: 'ลำแสงตัดกระจก', nameEn: 'Prism Beam', element: 'light', power: 1.3, target: 'single', weight: 3 }
      ]
    },
    {
      id: 'banshee', name: 'แม่มดร้องไห้', nameEn: 'Banshee', tier: 2, icon: 'shadowFigure',
      baseStats: { hp: 32, atk: 8, mag: 13, def: 5, res: 7, spd: 12, luk: 7, exp: 26 },
      weak: ['light'], resist: ['dark'],
      attacks: [
        { name: 'เสียงกรีดวิญญาณ', nameEn: 'Wailing Scream', element: 'dark', power: 1.2, target: 'single', weight: 3, debuff: { stat: 'res', amount: 0.15 } }
      ]
    },

    // ---- Tier 3 : floors 21-30 ----
    {
      id: 'abyss_knight', name: 'อัศวินก้นบึ้ง', nameEn: 'Abyss Knight', tier: 3, icon: 'knight',
      baseStats: { hp: 62, atk: 15, mag: 9, def: 12, res: 9, spd: 9, luk: 7, exp: 40 },
      weak: ['light'], resist: ['dark'], reflect: ['phys'],
      attacks: [
        { name: 'ดาบเงามืด', nameEn: 'Shadow Blade', element: 'dark', power: 1.3, target: 'single', weight: 4 }
      ]
    },
    {
      id: 'inferno_beast', name: 'อสูรเพลิงนรก', nameEn: 'Inferno Fiend', tier: 3, icon: 'fiend',
      baseStats: { hp: 58, atk: 16, mag: 10, def: 9, res: 8, spd: 10, luk: 6, exp: 40 },
      weak: ['ice'], resist: ['fire'],
      attacks: [
        { name: 'คำรามเพลิง', nameEn: 'Infernal Roar', element: 'fire', power: 1.4, target: 'single', weight: 4 }
      ]
    },
    {
      id: 'glacial_wyrm', name: 'มังกรน้ำแข็ง', nameEn: 'Glacial Wyrm', tier: 3, icon: 'dragon',
      baseStats: { hp: 72, atk: 13, mag: 11, def: 11, res: 9, spd: 7, luk: 6, exp: 42 },
      weak: ['fire'], resist: ['ice'],
      attacks: [
        { name: 'ลมหายใจน้ำแข็ง', nameEn: 'Ice Breath', element: 'ice', power: 1.2, target: 'all', weight: 2 },
        { name: 'หางฟาด', nameEn: 'Tail Slam', element: 'phys', power: 1.2, target: 'single', weight: 3 }
      ]
    },
    {
      id: 'thunder_revenant', name: 'วิญญาณสายฟ้า', nameEn: 'Thunder Revenant', tier: 3, icon: 'shadowFigure',
      baseStats: { hp: 54, atk: 12, mag: 13, def: 8, res: 8, spd: 14, luk: 8, exp: 40 },
      weak: ['wind'], resist: ['elec'],
      attacks: [
        { name: 'ฟาดสายฟ้าคำสาป', nameEn: 'Cursed Bolt', element: 'elec', power: 1.35, target: 'single', weight: 3, drainSelf: true }
      ]
    },
    {
      id: 'void_sentinel', name: 'ผู้พิทักษ์ห้วงว่าง', nameEn: 'Void Sentinel', tier: 3, icon: 'sentinel',
      baseStats: { hp: 60, atk: 12, mag: 12, def: 10, res: 10, spd: 9, luk: 7, exp: 42 },
      weak: ['elec'], resist: [], null: ['light', 'dark'],
      attacks: [
        { name: 'คลื่นห้วงว่าง', nameEn: 'Void Wave', element: 'dark', power: 1.3, target: 'single', weight: 4 }
      ]
    },
    {
      id: 'young_wyvern', name: 'ไวเวิร์นหนุ่ม', nameEn: 'Young Wyvern', tier: 3, icon: 'dragon',
      baseStats: { hp: 66, atk: 16, mag: 6, def: 10, res: 7, spd: 12, luk: 7, exp: 42 },
      weak: ['elec'], resist: ['wind'],
      attacks: [
        { name: 'กรงเล็บฉีก', nameEn: 'Talon Rend', element: 'phys', power: 1.3, target: 'single', weight: 3 },
        { name: 'พายุปีก', nameEn: 'Wing Gale', element: 'wind', power: 1.1, target: 'single', weight: 2 }
      ]
    },
    {
      id: 'imp_captain', name: 'หัวหน้าปีศาจ', nameEn: 'Imp Captain', tier: 3, icon: 'demon',
      baseStats: { hp: 56, atk: 14, mag: 15, def: 8, res: 9, spd: 11, luk: 6, exp: 41 },
      weak: ['ice'], resist: ['fire'],
      attacks: [
        { name: 'ไฟนรกจิ๋ว', nameEn: 'Infernal Spark', element: 'fire', power: 1.35, target: 'single', weight: 3 }
      ]
    },
    {
      id: 'bone_reaper', name: 'นักเกี่ยวกระดูก', nameEn: 'Bone Reaper', tier: 3, icon: 'skull',
      baseStats: { hp: 64, atk: 15, mag: 10, def: 10, res: 8, spd: 10, luk: 7, exp: 42 },
      weak: ['light'], resist: ['dark'],
      attacks: [
        { name: 'เคียวมัจจุราช', nameEn: "Reaper's Scythe", element: 'dark', power: 1.35, target: 'single', weight: 4 }
      ]
    },

    // ---- Tier 4 : floors 31-40 (true dragons & greater demons) ----
    {
      id: 'crimson_drake', name: 'มังกรไฟสีเลือด', nameEn: 'Crimson Drake', tier: 4, icon: 'dragon',
      baseStats: { hp: 98, atk: 20, mag: 17, def: 13, res: 11, spd: 11, luk: 7, exp: 63 },
      weak: ['ice'], resist: ['fire'],
      attacks: [
        { name: 'ลมหายใจเพลิง', nameEn: 'Flame Breath', element: 'fire', power: 1.15, target: 'all', weight: 2 },
        { name: 'กรงเล็บเพลิง', nameEn: 'Blazing Claw', element: 'fire', power: 1.3, target: 'single', weight: 3 }
      ]
    },
    {
      id: 'venom_hydra', name: 'ไฮดราพิษ', nameEn: 'Venom Hydra', tier: 4, icon: 'hydra',
      baseStats: { hp: 110, atk: 18, mag: 16, def: 14, res: 10, spd: 8, luk: 6, exp: 64 },
      weak: ['light'], resist: ['dark'],
      attacks: [
        { name: 'เขี้ยวพิษ', nameEn: 'Venom Fang', element: 'dark', power: 1.3, target: 'single', weight: 3 },
        { name: 'ฟาดหาง', nameEn: 'Tail Whip', element: 'phys', power: 1.2, target: 'single', weight: 2 }
      ]
    },
    {
      id: 'hell_hound', name: 'สุนัขนรกสามหัว', nameEn: 'Hellhound', tier: 4, icon: 'hound',
      baseStats: { hp: 88, atk: 21, mag: 12, def: 10, res: 9, spd: 16, luk: 8, exp: 62 },
      weak: ['light'], resist: ['fire'],
      attacks: [
        { name: 'เขี้ยวเพลิงนรก', nameEn: 'Hellfire Bite', element: 'fire', power: 1.3, target: 'single', weight: 3 },
        { name: 'เห่าคำสาป', nameEn: 'Cursed Howl', element: 'dark', power: 1.1, target: 'single', weight: 2 }
      ]
    },
    {
      id: 'succubus', name: 'อสูรมารยั่วยวน', nameEn: 'Succubus', tier: 4, icon: 'demon',
      baseStats: { hp: 80, atk: 10, mag: 19, def: 9, res: 12, spd: 13, luk: 9, exp: 63 },
      weak: ['light'], resist: ['dark'],
      attacks: [
        { name: 'จุมพิตมัจจุราช', nameEn: 'Kiss of Ruin', element: 'dark', power: 1.3, target: 'single', weight: 3, drainSelf: true },
        { name: 'มนตร์ทำลายใจ', nameEn: 'Heartbreak Curse', element: 'dark', power: 0.9, target: 'single', weight: 1, debuff: { stat: 'atk', amount: 0.2 } }
      ]
    },
    {
      id: 'iron_wyrm', name: 'มังกรเหล็กจักรกล', nameEn: 'Iron Wyrm', tier: 4, icon: 'dragon',
      baseStats: { hp: 105, atk: 19, mag: 8, def: 16, res: 9, spd: 9, luk: 5, exp: 64 },
      weak: ['fire'], resist: ['phys'],
      attacks: [
        { name: 'ขากรรไกรเหล็ก', nameEn: 'Iron Jaw Crush', element: 'phys', power: 1.3, target: 'single', weight: 3 },
        { name: 'ปล่อยประจุ', nameEn: 'Static Discharge', element: 'elec', power: 1.15, target: 'single', weight: 2 }
      ]
    },
    {
      id: 'pit_fiend', name: 'ปีศาจขุมนรก', nameEn: 'Pit Fiend', tier: 4, icon: 'demon',
      baseStats: { hp: 92, atk: 22, mag: 18, def: 12, res: 10, spd: 10, luk: 7, exp: 65 },
      weak: ['light'], resist: ['dark'],
      attacks: [
        { name: 'ดาบเพลิงนรก', nameEn: 'Hellfire Blade', element: 'fire', power: 1.3, target: 'single', weight: 3 },
        { name: 'คำสาปขุมนรก', nameEn: 'Pit Curse', element: 'dark', power: 1.2, target: 'single', weight: 2 }
      ]
    },

    // ---- Tier 5 : floors 41-49 (archdevils & ancient dragons) ----
    {
      id: 'ancient_wyrm', name: 'มังกรโบราณ', nameEn: 'Ancient Wyrm', tier: 5, icon: 'dragon',
      baseStats: { hp: 150, atk: 26, mag: 24, def: 18, res: 16, spd: 10, luk: 8, exp: 98 },
      weak: ['light'], resist: ['fire', 'ice'],
      attacks: [
        { name: 'ลมหายใจโบราณ', nameEn: 'Ancient Breath', element: 'fire', power: 1.2, target: 'all', weight: 2 },
        { name: 'กรงเล็บยุคเก่า', nameEn: 'Primeval Claw', element: 'phys', power: 1.4, target: 'single', weight: 3 }
      ]
    },
    {
      id: 'archdevil', name: 'อาร์คเดวิลผู้บงการ', nameEn: 'Archdevil', tier: 5, icon: 'demon',
      baseStats: { hp: 135, atk: 24, mag: 27, def: 16, res: 18, spd: 13, luk: 10, exp: 99 },
      weak: ['light'], resist: ['dark'],
      attacks: [
        { name: 'อาญาปีศาจ', nameEn: "Devil's Decree", element: 'dark', power: 1.35, target: 'single', weight: 3 },
        { name: 'ธรรมนูญนรก', nameEn: 'Infernal Edict', element: 'dark', power: 1.0, target: 'all', weight: 2 }
      ]
    },
    {
      id: 'doom_reaper', name: 'นักเกี่ยวความพินาศ', nameEn: 'Doom Reaper', tier: 5, icon: 'crownSkull',
      baseStats: { hp: 142, atk: 28, mag: 14, def: 15, res: 13, spd: 14, luk: 9, exp: 98 },
      weak: ['light'], resist: ['dark'],
      attacks: [
        { name: 'เคียวแห่งความพินาศ', nameEn: 'Scythe of Doom', element: 'dark', power: 1.4, target: 'single', weight: 4 }
      ]
    },
    {
      id: 'void_dragon', name: 'มังกรห้วงว่าง', nameEn: 'Void Dragon', tier: 5, icon: 'dragon',
      baseStats: { hp: 158, atk: 22, mag: 26, def: 17, res: 17, spd: 11, luk: 9, exp: 100 },
      weak: ['elec'], resist: [], null: ['light', 'dark'],
      attacks: [
        { name: 'คลื่นห้วงมิติ', nameEn: 'Void Ripple', element: 'dark', power: 1.3, target: 'single', weight: 3 },
        { name: 'สลายมิติ', nameEn: 'Dimensional Tear', element: 'almighty', power: 0.9, target: 'single', weight: 1 }
      ]
    },
    {
      id: 'inferno_duke', name: 'ดยุคเปลวนรก', nameEn: 'Inferno Duke', tier: 5, icon: 'demon',
      baseStats: { hp: 130, atk: 27, mag: 20, def: 17, res: 14, spd: 12, luk: 8, exp: 97 },
      weak: ['ice'], resist: ['fire'],
      attacks: [
        { name: 'เพลิงราชศักดิ์', nameEn: 'Regal Blaze', element: 'fire', power: 1.4, target: 'single', weight: 3 },
        { name: 'มวลเพลิงคลอก', nameEn: 'Searing Mass', element: 'fire', power: 1.05, target: 'all', weight: 2 }
      ]
    },
    {
      id: 'storm_titan', name: 'ไททันสายฟ้า', nameEn: 'Storm Titan', tier: 5, icon: 'titan',
      baseStats: { hp: 148, atk: 25, mag: 18, def: 19, res: 14, spd: 9, luk: 7, exp: 98 },
      weak: ['fire'], resist: ['elec'],
      attacks: [
        { name: 'สายฟ้าฟาดยักษ์', nameEn: "Titan's Thunder", element: 'elec', power: 1.3, target: 'single', weight: 3 },
        { name: 'ทุบพื้นสะเทือน', nameEn: 'Ground-Shaking Slam', element: 'phys', power: 1.3, target: 'single', weight: 2 }
      ]
    }
  ];

  var boss = {
    id: 'demon_lord', name: 'จอมมารราชันเงา', nameEn: 'Shadow Demon Lord', icon: 'demonLord', isBoss: true,
    baseStats: { hp: 2150, atk: 150, mag: 150, def: 52, res: 48, spd: 24, luk: 16, exp: 2000 },
    weak: ['ice', 'elec'], resist: ['dark'],
    attacks: [
      { name: 'ดาบมารเงามืด', nameEn: 'Shadow Demon Blade', element: 'dark', power: 1.2, target: 'single', weight: 3 },
      { name: 'คลื่นมารสยอง', nameEn: 'Dreadful Demonic Wave', element: 'dark', power: 1.0, target: 'all', weight: 2 },
      { name: 'กำกดวิญญาณจอมมาร', nameEn: "Demon Lord's Soul Crush", element: 'dark', power: 0.8, target: 'single', weight: 1, debuff: { stat: 'def', amount: 0.25 } }
    ],
    phase2: {
      hpThreshold: 0.5,
      weak: ['fire', 'light'],
      resist: ['ice', 'elec'],
      reflect: ['phys'],
      announce: 'จอมมารราชันเงาปลดปล่อยพลังที่แท้จริง!',
      announceEn: 'The Shadow Demon Lord unleashes its true power!',
      attacksAdd: [
        { name: 'ห้วงนรกล่มสลาย', nameEn: 'Collapsing Abyss', element: 'almighty', power: 1.15, target: 'all', weight: 2 },
        { name: 'กรงเล็บจอมมาร', nameEn: "Demon Lord's Claw", element: 'dark', power: 1.45, target: 'single', weight: 3 }
      ]
    }
  };

  // Mini-bosses: one-time named encounters gating floors 5/10/15/20/25/30/35/40/45 --
  // each sits behind a waypoint stop and hits noticeably harder than a same-tier
  // regular enemy, but (unlike the floor-50 final boss) has no second phase.
  var minibosses = {
    5: {
      id: 'steel_golem', name: 'โกเลมเหล็กกล้า', nameEn: 'Steel-Forged Golem', icon: 'golem', isBoss: true,
      baseStats: { hp: 75, atk: 13, mag: 3, def: 11, res: 6, spd: 6, luk: 4, exp: 55 },
      weak: ['elec'], resist: ['phys'],
      attacks: [
        { name: 'ทุบเกราะเหล็ก', nameEn: 'Iron Slam', element: 'phys', power: 1.3, target: 'single', weight: 3 },
        { name: 'แขนเหล็กฟาด', nameEn: 'Steel Arm Swing', element: 'phys', power: 1.0, target: 'single', weight: 2 },
        { name: 'กระแทกสั่นพื้น', nameEn: 'Tremor Slam', element: 'phys', power: 0.9, target: 'single', weight: 1, debuff: { stat: 'spd', amount: 0.2 } }
      ]
    },
    10: {
      id: 'bat_queen', name: 'ราชินีค้างคาวเลือด', nameEn: 'Blood Bat Queen', icon: 'bat', isBoss: true,
      baseStats: { hp: 100, atk: 14, mag: 14, def: 8, res: 9, spd: 19, luk: 9, exp: 95 },
      weak: ['light'], resist: ['dark'],
      attacks: [
        { name: 'กัดดูดเลือดราชินี', nameEn: "Queen's Blood Drain", element: 'dark', power: 1.3, target: 'single', weight: 3, drainSelf: true },
        { name: 'โฉบทิ้งตัวไว', nameEn: 'Swift Dive', element: 'phys', power: 1.1, target: 'single', weight: 3 },
        { name: 'เสียงกรีดสยอง', nameEn: 'Piercing Shriek', element: 'dark', power: 0.9, target: 'single', weight: 1, debuff: { stat: 'def', amount: 0.25 } }
      ]
    },
    15: {
      id: 'inferno_warden', name: 'เจ้าไฟผู้พิทักษ์', nameEn: 'Inferno Warden', icon: 'demon', isBoss: true,
      baseStats: { hp: 155, atk: 20, mag: 20, def: 14, res: 11, spd: 11, luk: 8, exp: 150 },
      weak: ['ice'], resist: ['fire'],
      attacks: [
        { name: 'เปลวไฟผู้พิทักษ์', nameEn: "Warden's Blaze", element: 'fire', power: 1.35, target: 'single', weight: 3 },
        { name: 'คลื่นความร้อน', nameEn: 'Heat Wave', element: 'fire', power: 1.0, target: 'all', weight: 2 },
        { name: 'หมัดถ่านคุ', nameEn: 'Ember Fist', element: 'phys', power: 1.1, target: 'single', weight: 2 }
      ]
    },
    20: {
      id: 'wyvern_alpha', name: 'ไวเวิร์นจ่าฝูง', nameEn: 'Wyvern Alpha', icon: 'dragon', isBoss: true,
      baseStats: { hp: 165, atk: 22, mag: 10, def: 14, res: 10, spd: 14, luk: 8, exp: 135 },
      weak: ['elec'], resist: ['wind'],
      attacks: [
        { name: 'กรงเล็บจ่าฝูง', nameEn: 'Alpha Talon', element: 'phys', power: 1.3, target: 'single', weight: 3 },
        { name: 'พายุปีกยักษ์', nameEn: 'Gale Wingbeat', element: 'wind', power: 1.15, target: 'all', weight: 2 },
        { name: 'เสียงคำรามข่มขวัญ', nameEn: 'Intimidating Roar', element: 'phys', power: 0.9, target: 'single', weight: 1, debuff: { stat: 'atk', amount: 0.2 } }
      ]
    },
    25: {
      id: 'flame_overlord', name: 'จอมปีศาจเพลิง', nameEn: 'Flame Overlord', icon: 'demon', isBoss: true,
      baseStats: { hp: 212, atk: 26, mag: 24, def: 15, res: 13, spd: 12, luk: 9, exp: 210 },
      weak: ['ice'], resist: ['fire'],
      attacks: [
        { name: 'บัลลังก์เพลิง', nameEn: 'Throne of Flame', element: 'fire', power: 1.3, target: 'single', weight: 3 },
        { name: 'มวลไฟถล่ม', nameEn: 'Inferno Collapse', element: 'fire', power: 1.05, target: 'all', weight: 2 },
        { name: 'สาปมอดไหม้', nameEn: 'Smoldering Curse', element: 'fire', power: 0.9, target: 'single', weight: 1, debuff: { stat: 'res', amount: 0.2 } }
      ]
    },
    30: {
      id: 'glacial_tyrant', name: 'ทรราชน้ำแข็งนิรันดร์', nameEn: 'Glacial Tyrant', icon: 'dragon', isBoss: true,
      baseStats: { hp: 300, atk: 28, mag: 26, def: 18, res: 16, spd: 11, luk: 9, exp: 310 },
      weak: ['fire'], resist: ['ice'],
      attacks: [
        { name: 'ลมหายใจนิรันดร์', nameEn: 'Eternal Frost Breath', element: 'ice', power: 1.2, target: 'all', weight: 2 },
        { name: 'งับตรึงน้ำแข็ง', nameEn: 'Frozen Bite', element: 'ice', power: 1.35, target: 'single', weight: 3 },
        { name: 'หางน้ำแข็งฟาด', nameEn: 'Glacial Tail Slam', element: 'phys', power: 1.15, target: 'single', weight: 2 }
      ]
    },
    35: {
      id: 'abyssal_matriarch', name: 'มารดาแห่งห้วงนรก', nameEn: 'Abyssal Matriarch', icon: 'demon', isBoss: true,
      baseStats: { hp: 345, atk: 30, mag: 32, def: 19, res: 20, spd: 14, luk: 10, exp: 360 },
      weak: ['light'], resist: ['dark'],
      attacks: [
        { name: 'เสียงเรียกห้วงนรก', nameEn: 'Abyssal Call', element: 'dark', power: 1.3, target: 'single', weight: 3 },
        { name: 'คลื่นวิญญาณร่ำไห้', nameEn: 'Wailing Soul Wave', element: 'dark', power: 1.05, target: 'all', weight: 2 },
        { name: 'จุมพิตมรณะ', nameEn: 'Kiss of Death', element: 'dark', power: 1.0, target: 'single', weight: 1, drainSelf: true }
      ]
    },
    40: {
      id: 'obsidian_dragon', name: 'มังกรหินอัคคี', nameEn: 'Obsidian Dragon', icon: 'dragon', isBoss: true,
      baseStats: { hp: 430, atk: 34, mag: 30, def: 22, res: 19, spd: 13, luk: 10, exp: 450 },
      weak: ['ice'], resist: ['fire'],
      attacks: [
        { name: 'ลมหายใจหินหลอมเหลว', nameEn: 'Molten Breath', element: 'fire', power: 1.25, target: 'all', weight: 2 },
        { name: 'กรงเล็บหิน', nameEn: 'Obsidian Claw', element: 'phys', power: 1.4, target: 'single', weight: 3 },
        { name: 'ปีกกระแทกสะเทือน', nameEn: 'Wing Slam', element: 'phys', power: 1.1, target: 'single', weight: 2 }
      ]
    },
    45: {
      id: 'demon_general', name: 'แม่ทัพปีศาจ', nameEn: 'Demon General', icon: 'demon', isBoss: true,
      baseStats: { hp: 480, atk: 36, mag: 34, def: 23, res: 21, spd: 15, luk: 11, exp: 520 },
      weak: ['light'], resist: ['dark'],
      attacks: [
        { name: 'ดาบบัญชาการนรก', nameEn: 'Infernal Command Blade', element: 'dark', power: 1.35, target: 'single', weight: 3 },
        { name: 'กองทัพเงาสยอง', nameEn: 'Shadow Legion Wave', element: 'dark', power: 1.1, target: 'all', weight: 2 },
        { name: 'ตราสัญลักษณ์ล่มสลาย', nameEn: 'Sigil of Ruin', element: 'dark', power: 0.95, target: 'single', weight: 1, debuff: { stat: 'def', amount: 0.25 } }
      ]
    }
  };

  window.Game = window.Game || {};
  window.Game.Data = window.Game.Data || {};
  window.Game.Data.enemies = enemies;
  window.Game.Data.boss = boss;
  window.Game.Data.minibosses = minibosses;
  window.Game.Data.getMiniBoss = function (floor) {
    return minibosses[floor] || null;
  };
  window.Game.Data.getEnemiesByTier = function (tier) {
    return enemies.filter(function (e) { return e.tier === tier; });
  };
  window.Game.Data.getEnemyTemplate = function (id) {
    if (boss.id === id) return boss;
    for (var f in minibosses) if (minibosses[f].id === id) return minibosses[f];
    for (var i = 0; i < enemies.length; i++) if (enemies[i].id === id) return enemies[i];
    return null;
  };
})();
