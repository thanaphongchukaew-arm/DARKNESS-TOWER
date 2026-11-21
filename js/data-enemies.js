// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Enemy templates grouped by tier (which floor range they can appear on) + the floor-100 final boss.
// baseStats are calibrated for floor 1; battle-engine scales them per floor/difficulty.
// Tiers: 1 = floors 1-10 (beasts & lesser undead), 2 = 11-20 (knights & elementals),
// 3 = 21-30 (dark knights, young wyverns, first demons), 4 = 31-40 (true dragons & greater demons),
// 5 = 41-44 (archdevils & ancient dragons -- the last of the "known" tower).
// Floor 45 onward is the hidden upper tower, sealed since before the Demon Lord's era and
// unlocked by clearing the tier-5 stretch: 6 = 45-49 (crystal caverns), 7 = 50-54 (drowned ruins),
// 8 = 55-59 (storm citadel), 9 = 60-64 (bone desert), 10 = 65-69 (molten core),
// 11 = 70-74 (clockwork bastion), 12 = 75-79 (withering nightgrove), 13 = 80-84 (sunless frozen abyss),
// 14 = 85-89 (astral rift), 15 = 90-94 (chaos forge), 16 = 95-99 (twilight sanctum),
// ending at the floor-100 throne of the Timeless Sovereign.
(function () {
  var enemies = [
    // ---- Tier 1 : floors 1-10 ----
    {
      id: 'shadow_wolf', name: "หมาป่าเงา", nameEn: 'Shadow Wolf', tier: 1, icon: 'wolf',
      baseStats: { hp: 22, atk: 8, mag: 2, def: 4, res: 3, spd: 11, luk: 5, exp: 14 },
      attacks: [
        { name: 'เขี้ยวฉีกวิญญาณ', nameEn: 'Rending Bite', element: 'phys', power: 1.0, target: 'single', weight: 3 },
        { name: 'เขี้ยวเหมันต์', nameEn: 'Frost Fang', element: 'ice', power: 1.2, target: 'single', weight: 2 }
      ]
    },
    {
      id: 'flame_imp', name: "ปีศาจเปลวไฟ", nameEn: 'Flame Imp', tier: 1, icon: 'demon',
      baseStats: { hp: 20, atk: 7, mag: 8, def: 3, res: 5, spd: 9, luk: 4, exp: 14 },
      attacks: [
        { name: 'ลิ้นเพลิงเลีย', nameEn: 'Flame Lick', element: 'fire', power: 1.3, target: 'single', weight: 3 },
        { name: 'กรงเล็บข่วนฉึก', nameEn: 'Claw Swipe', element: 'phys', power: 0.9, target: 'single', weight: 2 }
      ]
    },
    {
      id: 'stone_golem', name: "โกเลมหิน", nameEn: 'Stone Golem', tier: 1, icon: 'golem',
      baseStats: { hp: 34, atk: 9, mag: 1, def: 9, res: 4, spd: 4, luk: 2, exp: 18 },
      attacks: [
        { name: 'หมัดศิลาทุบ', nameEn: 'Rock Smash', element: 'phys', power: 1.2, target: 'single', weight: 4 }
      ]
    },
    {
      id: 'dark_bat', name: "ค้างคาวรัตติกาล", nameEn: 'Nightfall Bat', tier: 1, icon: 'bat',
      baseStats: { hp: 18, atk: 6, mag: 7, def: 3, res: 4, spd: 13, luk: 6, exp: 13 },
      attacks: [
        { name: 'งับดื่มโลหิต', nameEn: 'Blood Drain Bite', element: 'dark', power: 1.1, target: 'single', weight: 2, drainSelf: true },
        { name: 'โฉบตะปบราตรี', nameEn: 'Swooping Claw', element: 'phys', power: 0.9, target: 'single', weight: 3 }
      ]
    },
    {
      id: 'gust_sprite', name: "เอลฟ์สายลม", nameEn: 'Wind Sprite', tier: 1, icon: 'windSprite',
      baseStats: { hp: 19, atk: 6, mag: 8, def: 3, res: 5, spd: 14, luk: 7, exp: 14 },
      attacks: [
        { name: 'คมใบมีดลม', nameEn: 'Wind Blade', element: 'wind', power: 1.2, target: 'single', weight: 3 }
      ]
    },
    {
      id: 'giant_spider', name: "แมงมุมพิษยักษ์", nameEn: "Giant Spider", tier: 1, icon: 'spider',
      baseStats: { hp: 24, atk: 9, mag: 4, def: 4, res: 4, spd: 10, luk: 5, exp: 15 },
      attacks: [
        { name: 'เขี้ยวพิษกัดซึม', nameEn: 'Venom Bite', element: 'dark', power: 1.1, target: 'single', weight: 3, debuff: { stat: 'def', amount: 0.15 } },
        { name: 'ขาเคียวแทงทะลวง', nameEn: 'Sharp Leg Strike', element: 'phys', power: 1.0, target: 'single', weight: 2 }
      ]
    },
    {
      id: 'bog_slime', name: "เมือกหนองน้ำ", nameEn: 'Bog Slime', tier: 1, icon: 'slime',
      baseStats: { hp: 30, atk: 6, mag: 4, def: 8, res: 5, spd: 3, luk: 3, exp: 16 },
      attacks: [
        { name: 'ถาโถมเมือกหนึบ', nameEn: 'Sticky Slam', element: 'phys', power: 1.0, target: 'single', weight: 4 }
      ]
    },
    {
      id: 'forest_bandit', name: "โจรป่าเจ้าเล่ห์", nameEn: 'Forest Bandit', tier: 1, icon: 'bandit',
      baseStats: { hp: 21, atk: 10, mag: 2, def: 4, res: 3, spd: 12, luk: 9, exp: 15 },
      attacks: [
        { name: 'แทงสายฟ้า', nameEn: 'Quick Stab', element: 'phys', power: 1.1, target: 'single', weight: 3 },
        { name: 'ขว้างขวานสั้น', nameEn: 'Hatchet Throw', element: 'phys', power: 0.9, target: 'single', weight: 2 }
      ]
    },

    // ---- Tier 2 : floors 11-20 ----
    {
      id: 'frost_knight', name: "อัศวินน้ำแข็ง", nameEn: 'Frost Knight', tier: 2, icon: 'knight',
      baseStats: { hp: 42, atk: 12, mag: 6, def: 10, res: 7, spd: 8, luk: 6, exp: 26 },
      attacks: [
        { name: 'ดาบเหมันต์เฉือน', nameEn: 'Ice Blade Slash', element: 'ice', power: 1.3, target: 'single', weight: 3 },
        { name: 'โล่กระแทกอก', nameEn: 'Shield Bash', element: 'phys', power: 1.0, target: 'single', weight: 2 }
      ]
    },
    {
      id: 'thunder_hawk', name: "เหยี่ยวสายฟ้า", nameEn: 'Thunder Hawk', tier: 2, icon: 'hawk',
      baseStats: { hp: 30, atk: 10, mag: 10, def: 5, res: 6, spd: 15, luk: 8, exp: 24 },
      attacks: [
        { name: 'จงอยอัสนี', nameEn: 'Lightning Peck', element: 'elec', power: 1.3, target: 'single', weight: 3 }
      ]
    },
    {
      id: 'venom_wraith', name: "วิญญาณพิษ", nameEn: 'Venom Wraith', tier: 2, icon: 'shadowFigure',
      baseStats: { hp: 34, atk: 8, mag: 12, def: 5, res: 6, spd: 10, luk: 6, exp: 25 },
      attacks: [
        { name: 'ดูดดึงวิญญาณ', nameEn: 'Soul Drain', element: 'dark', power: 1.2, target: 'single', weight: 3, drainSelf: true }
      ]
    },
    {
      id: 'iron_sentinel', name: "ยามเหล็กจักรกล", nameEn: 'Iron Sentinel', tier: 2, icon: 'sentinel',
      baseStats: { hp: 50, atk: 11, mag: 3, def: 12, res: 6, spd: 5, luk: 4, exp: 27 },
      attacks: [
        { name: 'หมัดเหล็กกล้า', nameEn: 'Iron Fist', element: 'phys', power: 1.3, target: 'single', weight: 4 }
      ]
    },
    {
      id: 'storm_harpy', name: "ฮาร์ปี้พายุ", nameEn: 'Storm Harpy', tier: 2, icon: 'harpy',
      baseStats: { hp: 32, atk: 9, mag: 11, def: 6, res: 7, spd: 13, luk: 7, exp: 25 },
      attacks: [
        { name: 'พายุกรงเล็บ', nameEn: 'Talon Storm', element: 'wind', power: 1.3, target: 'single', weight: 3 }
      ]
    },
    {
      id: 'swamp_troll', name: "โทรลล์หนองน้ำ", nameEn: 'Swamp Troll', tier: 2, icon: 'troll',
      baseStats: { hp: 55, atk: 13, mag: 2, def: 11, res: 5, spd: 5, luk: 3, exp: 27 },
      attacks: [
        { name: 'ตะบองบดกระดูก', nameEn: 'Club Smash', element: 'phys', power: 1.3, target: 'single', weight: 4 }
      ]
    },
    {
      id: 'crystal_golem', name: "โกเลมแก้วอาถรรพ์", nameEn: 'Crystal Golem', tier: 2, icon: 'golem_crystal',
      baseStats: { hp: 46, atk: 9, mag: 12, def: 9, res: 10, spd: 6, luk: 4, exp: 26 },
      attacks: [
        { name: 'ลำแสงแก้วเฉือน', nameEn: 'Prism Beam', element: 'light', power: 1.3, target: 'single', weight: 3 }
      ]
    },
    {
      id: 'banshee', name: "แม่มดร้องไห้", nameEn: 'Banshee', tier: 2, icon: 'shadowFigure_banshee',
      baseStats: { hp: 32, atk: 8, mag: 13, def: 5, res: 7, spd: 12, luk: 7, exp: 26 },
      attacks: [
        { name: 'หวีดร้องอาลัย', nameEn: 'Wailing Scream', element: 'dark', power: 1.2, target: 'single', weight: 3, debuff: { stat: 'res', amount: 0.15 } }
      ]
    },

    // ---- Tier 3 : floors 21-30 ----
    {
      id: 'abyss_knight', name: "อัศวินก้นบึ้ง", nameEn: 'Abyss Knight', tier: 3, icon: 'knight_abyss',
      baseStats: { hp: 62, atk: 15, mag: 9, def: 12, res: 9, spd: 9, luk: 7, exp: 40 },
      attacks: [
        { name: 'ดาบเงาทมิฬ', nameEn: 'Shadow Blade', element: 'dark', power: 1.3, target: 'single', weight: 4 }
      ]
    },
    {
      id: 'inferno_beast', name: "อสูรเพลิงนรก", nameEn: 'Inferno Fiend', tier: 3, icon: 'fiend',
      baseStats: { hp: 58, atk: 16, mag: 10, def: 9, res: 8, spd: 10, luk: 6, exp: 40 },
      attacks: [
        { name: 'คำรามนรกเพลิง', nameEn: 'Infernal Roar', element: 'fire', power: 1.4, target: 'single', weight: 4 }
      ]
    },
    {
      id: 'glacial_wyrm', name: "มังกรน้ำแข็ง", nameEn: 'Glacial Wyrm', tier: 3, icon: 'dragon_ice',
      baseStats: { hp: 72, atk: 13, mag: 11, def: 11, res: 9, spd: 7, luk: 6, exp: 42 },
      attacks: [
        { name: 'ลมหายใจเหมันต์', nameEn: 'Ice Breath', element: 'ice', power: 1.2, target: 'all', weight: 2 },
        { name: 'หางฟาดฟ้า', nameEn: 'Tail Slam', element: 'phys', power: 1.2, target: 'single', weight: 3 }
      ]
    },
    {
      id: 'thunder_revenant', name: "วิญญาณสายฟ้า", nameEn: 'Thunder Revenant', tier: 3, icon: 'shadowFigure_storm',
      baseStats: { hp: 54, atk: 12, mag: 13, def: 8, res: 8, spd: 14, luk: 8, exp: 40 },
      attacks: [
        { name: 'อสนีบาตต้องสาป', nameEn: 'Cursed Bolt', element: 'elec', power: 1.35, target: 'single', weight: 3, drainSelf: true }
      ]
    },
    {
      id: 'void_sentinel', name: "ผู้พิทักษ์ห้วงว่าง", nameEn: 'Void Sentinel', tier: 3, icon: 'sentinel_void',
      baseStats: { hp: 60, atk: 12, mag: 12, def: 10, res: 10, spd: 9, luk: 7, exp: 42 },
      attacks: [
        { name: 'ระลอกความว่างเปล่า', nameEn: 'Void Wave', element: 'dark', power: 1.3, target: 'single', weight: 4 }
      ]
    },
    {
      id: 'young_wyvern', name: "ไวเวิร์นหนุ่ม", nameEn: 'Young Wyvern', tier: 3, icon: 'dragon',
      baseStats: { hp: 66, atk: 16, mag: 6, def: 10, res: 7, spd: 12, luk: 7, exp: 42 },
      attacks: [
        { name: 'กรงเล็บฉีกฟ้า', nameEn: 'Talon Rend', element: 'phys', power: 1.3, target: 'single', weight: 3 },
        { name: 'ปีกพายุกระพือ', nameEn: 'Wing Gale', element: 'wind', power: 1.1, target: 'single', weight: 2 }
      ]
    },
    {
      id: 'imp_captain', name: "หัวหน้าปีศาจ", nameEn: 'Imp Captain', tier: 3, icon: 'demon_captain',
      baseStats: { hp: 56, atk: 14, mag: 15, def: 8, res: 9, spd: 11, luk: 6, exp: 41 },
      attacks: [
        { name: 'ประกายไฟนรก', nameEn: 'Infernal Spark', element: 'fire', power: 1.35, target: 'single', weight: 3 }
      ]
    },
    {
      id: 'bone_reaper', name: "นักเกี่ยวกระดูก", nameEn: 'Bone Reaper', tier: 3, icon: 'skull',
      baseStats: { hp: 64, atk: 15, mag: 10, def: 10, res: 8, spd: 10, luk: 7, exp: 42 },
      attacks: [
        { name: 'เคียวมัจจุราช', nameEn: "Reaper's Scythe", element: 'dark', power: 1.35, target: 'single', weight: 4 }
      ]
    },

    // ---- Tier 4 : floors 31-40 (true dragons & greater demons) ----
    {
      id: 'crimson_drake', name: "มังกรไฟสีเลือด", nameEn: 'Crimson Drake', tier: 4, icon: 'dragon_fire',
      baseStats: { hp: 98, atk: 20, mag: 17, def: 13, res: 11, spd: 11, luk: 7, exp: 63 },
      attacks: [
        { name: 'ลมหายใจเพลิง', nameEn: 'Flame Breath', element: 'fire', power: 1.15, target: 'all', weight: 2 },
        { name: 'กรงเล็บอัคคี', nameEn: 'Blazing Claw', element: 'fire', power: 1.3, target: 'single', weight: 3 }
      ]
    },
    {
      id: 'venom_hydra', name: "ไฮดราพิษ", nameEn: 'Venom Hydra', tier: 4, icon: 'hydra',
      baseStats: { hp: 110, atk: 18, mag: 16, def: 14, res: 10, spd: 8, luk: 6, exp: 64 },
      attacks: [
        { name: 'เขี้ยวพิษร้าย', nameEn: 'Venom Fang', element: 'dark', power: 1.3, target: 'single', weight: 3 },
        { name: 'หางหวดสะบัด', nameEn: 'Tail Whip', element: 'phys', power: 1.2, target: 'single', weight: 2 }
      ]
    },
    {
      id: 'hell_hound', name: "สุนัขนรกสามหัว", nameEn: 'Hellhound', tier: 4, icon: 'hound',
      baseStats: { hp: 88, atk: 21, mag: 12, def: 10, res: 9, spd: 16, luk: 8, exp: 62 },
      attacks: [
        { name: 'เขี้ยวเพลิงอเวจี', nameEn: 'Hellfire Bite', element: 'fire', power: 1.3, target: 'single', weight: 3 },
        { name: 'เห่าหอนสาปแช่ง', nameEn: 'Cursed Howl', element: 'dark', power: 1.1, target: 'single', weight: 2 }
      ]
    },
    {
      id: 'succubus', name: "อสูรมารยั่วยวน", nameEn: 'Succubus', tier: 4, icon: 'demon_succubus',
      baseStats: { hp: 80, atk: 10, mag: 19, def: 9, res: 12, spd: 13, luk: 9, exp: 63 },
      attacks: [
        { name: 'จุมพิตพินาศ', nameEn: 'Kiss of Ruin', element: 'dark', power: 1.3, target: 'single', weight: 3, drainSelf: true },
        { name: 'มนตร์หักหัวใจ', nameEn: 'Heartbreak Curse', element: 'dark', power: 0.9, target: 'single', weight: 1, debuff: { stat: 'atk', amount: 0.2 } }
      ]
    },
    {
      id: 'iron_wyrm', name: "มังกรเหล็กจักรกล", nameEn: 'Iron Wyrm', tier: 4, icon: 'dragon_iron',
      baseStats: { hp: 105, atk: 19, mag: 8, def: 16, res: 9, spd: 9, luk: 5, exp: 64 },
      attacks: [
        { name: 'ขากรรไกรเหล็กบด', nameEn: 'Iron Jaw Crush', element: 'phys', power: 1.3, target: 'single', weight: 3 },
        { name: 'ปลดปล่อยประจุฟ้า', nameEn: 'Static Discharge', element: 'elec', power: 1.15, target: 'single', weight: 2 }
      ]
    },
    {
      id: 'pit_fiend', name: "ปีศาจขุมนรก", nameEn: 'Pit Fiend', tier: 4, icon: 'demon_pit',
      baseStats: { hp: 92, atk: 22, mag: 18, def: 12, res: 10, spd: 10, luk: 7, exp: 65 },
      attacks: [
        { name: 'ดาบเพลิงอเวจี', nameEn: 'Hellfire Blade', element: 'fire', power: 1.3, target: 'single', weight: 3 },
        { name: 'คำสาปขุมนรก', nameEn: 'Pit Curse', element: 'dark', power: 1.2, target: 'single', weight: 2 }
      ]
    },

    // ---- Tier 5 : floors 41-44 (archdevils & ancient dragons) ----
    {
      id: 'ancient_wyrm', name: "มังกรโบราณ", nameEn: 'Ancient Wyrm', tier: 5, icon: 'dragon_gold',
      baseStats: { hp: 150, atk: 26, mag: 24, def: 18, res: 16, spd: 10, luk: 8, exp: 98 },
      attacks: [
        { name: 'ลมหายใจบรรพกาล', nameEn: 'Ancient Breath', element: 'fire', power: 1.2, target: 'all', weight: 2 },
        { name: 'กรงเล็บยุคดึกดำบรรพ์', nameEn: 'Primeval Claw', element: 'phys', power: 1.4, target: 'single', weight: 3 }
      ]
    },
    {
      id: 'archdevil', name: "อาร์คเดวิลผู้บงการ", nameEn: 'Archdevil', tier: 5, icon: 'demon_arch',
      baseStats: { hp: 135, atk: 24, mag: 27, def: 16, res: 18, spd: 13, luk: 10, exp: 99 },
      attacks: [
        { name: 'ประกาศิตเดวิล', nameEn: "Devil's Decree", element: 'dark', power: 1.35, target: 'single', weight: 3 },
        { name: 'บัญญัตินรก', nameEn: 'Infernal Edict', element: 'dark', power: 1.0, target: 'all', weight: 2 }
      ]
    },
    {
      id: 'doom_reaper', name: "นักเกี่ยวความพินาศ", nameEn: 'Doom Reaper', tier: 5, icon: 'crownSkull',
      baseStats: { hp: 142, atk: 28, mag: 14, def: 15, res: 13, spd: 14, luk: 9, exp: 98 },
      attacks: [
        { name: 'เคียวพิพากษาวินาศ', nameEn: 'Scythe of Doom', element: 'dark', power: 1.4, target: 'single', weight: 4 }
      ]
    },
    {
      id: 'void_dragon', name: "มังกรห้วงว่าง", nameEn: 'Void Dragon', tier: 5, icon: 'dragon_void',
      baseStats: { hp: 158, atk: 22, mag: 26, def: 17, res: 17, spd: 11, luk: 9, exp: 100 },
      attacks: [
        { name: 'ริ้วรอยความว่าง', nameEn: 'Void Ripple', element: 'dark', power: 1.3, target: 'single', weight: 3 },
        { name: 'ฉีกมิติ', nameEn: 'Dimensional Tear', element: 'almighty', power: 0.9, target: 'single', weight: 1 }
      ]
    },
    {
      id: 'inferno_duke', name: "ดยุคเปลวนรก", nameEn: 'Inferno Duke', tier: 5, icon: 'demon_duke',
      baseStats: { hp: 130, atk: 27, mag: 20, def: 17, res: 14, spd: 12, luk: 8, exp: 97 },
      attacks: [
        { name: 'เพลิงราชันย์', nameEn: 'Regal Blaze', element: 'fire', power: 1.4, target: 'single', weight: 3 },
        { name: 'ก้อนเพลิงแผดเผา', nameEn: 'Searing Mass', element: 'fire', power: 1.05, target: 'all', weight: 2 }
      ]
    },
    {
      id: 'storm_titan', name: "ไททันสายฟ้า", nameEn: 'Storm Titan', tier: 5, icon: 'titan',
      baseStats: { hp: 148, atk: 25, mag: 18, def: 19, res: 14, spd: 9, luk: 7, exp: 98 },
      attacks: [
        { name: 'อัสนีไททัน', nameEn: "Titan's Thunder", element: 'elec', power: 1.3, target: 'single', weight: 3 },
        { name: 'ทุบแผ่นดินสะท้าน', nameEn: 'Ground-Shaking Slam', element: 'phys', power: 1.3, target: 'single', weight: 2 }
      ]
    },

    // ---- Tier 6 : floors 45-49 (Resonant Crystal Caverns -- the hidden tower begins) ----
    {
      id: 'crystal_wisp', name: "ฝูงแสงคริสตัล", nameEn: "Crystal Wisp Swarm", tier: 6, icon: 'crystalWisp',
      baseStats: { hp: 130, atk: 21, mag: 34, def: 12, res: 22, spd: 16, luk: 11, exp: 118 },
      attacks: [
        { name: 'ระเบิดเศษปริซึม', nameEn: 'Prism Shard Burst', element: 'light', power: 1.3, target: 'single', weight: 3 },
        { name: 'ประกายแตกกระจาย', nameEn: 'Scatter Glimmer', element: 'elec', power: 1.0, target: 'single', weight: 2 }
      ]
    },
    {
      id: 'prism_lynx', name: "แมวป่าปริซึม", nameEn: 'Prism Lynx', tier: 6, icon: 'prismLynx',
      baseStats: { hp: 147, atk: 36, mag: 13, def: 18, res: 16, spd: 15, luk: 10, exp: 118 },
      attacks: [
        { name: 'เขี้ยวคริสตัลงับ', nameEn: 'Crystal Fang Bite', element: 'phys', power: 1.2, target: 'single', weight: 3 },
        { name: 'หางสะท้อนแสงสะบัด', nameEn: 'Refracting Tail Swipe', element: 'ice', power: 1.1, target: 'single', weight: 2 }
      ]
    },
    {
      id: 'chime_wraith', name: "วิญญาณระฆังแก้ว", nameEn: 'Chime Wraith', tier: 6, icon: 'chimeWraith',
      baseStats: { hp: 138, atk: 18, mag: 35, def: 16, res: 23, spd: 13, luk: 10, exp: 118 },
      attacks: [
        { name: 'ระฆังอาลัยก้อง', nameEn: 'Mournful Chime Toll', element: 'light', power: 1.3, target: 'single', weight: 3, debuff: { stat: 'res', amount: 0.15 } }
      ]
    },
    {
      id: 'geode_golem', name: "โกเลมศิลาแก้ว", nameEn: 'Geode Golem', tier: 6, icon: 'geodeGolem',
      baseStats: { hp: 199, atk: 32, mag: 8, def: 25, res: 23, spd: 8, luk: 7, exp: 118 },
      attacks: [
        { name: 'บดผลึกศิลา', nameEn: 'Geode Crush', element: 'phys', power: 1.3, target: 'single', weight: 4 }
      ]
    },

    // ---- Tier 7 : floors 50-54 (Drowned Ruins) ----
    {
      id: 'drowned_revenant', name: "ผีดิบใต้บาดาล", nameEn: 'Drowned Revenant', tier: 7, icon: 'drownedRevenant',
      baseStats: { hp: 175, atk: 22, mag: 42, def: 18, res: 28, spd: 12, luk: 10, exp: 142 },
      attacks: [
        { name: 'มือวิญญาณจมน้ำคว้า', nameEn: 'Drowning Soul Grasp', element: 'dark', power: 1.3, target: 'single', weight: 3, drainSelf: true },
        { name: 'เสียงครวญใต้สมุทร', nameEn: 'Sunken Wail', element: 'dark', power: 1.0, target: 'single', weight: 2 }
      ]
    },
    {
      id: 'abyssal_eel', name: "ปลาไหลก้นสมุทร", nameEn: 'Abyssal Eel', tier: 7, icon: 'abyssalEel',
      baseStats: { hp: 190, atk: 46, mag: 15, def: 20, res: 16, spd: 18, luk: 11, exp: 142 },
      attacks: [
        { name: 'งับอัสนีกระชาก', nameEn: 'Voltaic Bite', element: 'elec', power: 1.35, target: 'single', weight: 3 },
        { name: 'ขดรัดบดกระดูก', nameEn: 'Crushing Coil', element: 'phys', power: 1.1, target: 'single', weight: 2 }
      ]
    },
    {
      id: 'tide_golem', name: "โกเลมกระแสน้ำ", nameEn: 'Tide Golem', tier: 7, icon: 'tideGolem',
      baseStats: { hp: 255, atk: 34, mag: 18, def: 33, res: 28, spd: 8, luk: 7, exp: 142 },
      attacks: [
        { name: 'น้ำหลากฟาดฝั่ง', nameEn: 'Tidal Slam', element: 'phys', power: 1.25, target: 'single', weight: 3 },
        { name: 'น้ำวนกลืนกิน', nameEn: 'Whirlpool Surge', element: 'ice', power: 1.05, target: 'all', weight: 1 }
      ]
    },
    {
      id: 'siren_wraith', name: "ไซเรนวิญญาณ", nameEn: 'Siren Wraith', tier: 7, icon: 'sirenWraith',
      baseStats: { hp: 165, atk: 20, mag: 40, def: 17, res: 25, spd: 16, luk: 13, exp: 142 },
      attacks: [
        { name: 'เพลงไซเรนปลิดชีพ', nameEn: "Siren's Deadly Song", element: 'dark', power: 1.2, target: 'single', weight: 2, debuff: { stat: 'atk', amount: 0.2 } },
        { name: 'กรงเล็บโฉบดิ่ง', nameEn: 'Diving Talon', element: 'phys', power: 1.0, target: 'single', weight: 2 }
      ]
    },

    // ---- Tier 8 : floors 55-59 (Storm Citadel) ----
    {
      id: 'gale_falcon', name: "เหยี่ยวสายลมพายุ", nameEn: 'Gale Falcon', tier: 8, icon: 'galeFalcon',
      baseStats: { hp: 210, atk: 55, mag: 18, def: 22, res: 20, spd: 22, luk: 12, exp: 170 },
      attacks: [
        { name: 'โฉบกรงเล็บวายุ', nameEn: 'Gale Talon Dive', element: 'wind', power: 1.3, target: 'single', weight: 3 },
        { name: 'จิกรัวเร็ว', nameEn: 'Rapid Peck', element: 'phys', power: 1.0, target: 'single', weight: 2 }
      ]
    },
    {
      id: 'thunder_cherub', name: "เทวาน้อยสายฟ้า", nameEn: 'Thunder Cherub', tier: 8, icon: 'thunderCherub',
      baseStats: { hp: 200, atk: 28, mag: 50, def: 20, res: 30, spd: 20, luk: 13, exp: 170 },
      attacks: [
        { name: 'อสนีเทวทูตพิโรธ', nameEn: "Cherub's Wrathful Bolt", element: 'elec', power: 1.35, target: 'single', weight: 3 }
      ]
    },
    {
      id: 'storm_lancer', name: "อัศวินหอกพายุ", nameEn: 'Storm Lancer', tier: 8, icon: 'stormLancer',
      baseStats: { hp: 285, atk: 52, mag: 30, def: 38, res: 28, spd: 15, luk: 9, exp: 170 },
      attacks: [
        { name: 'หอกอัสนีทะลวง', nameEn: 'Thunder Lance Pierce', element: 'elec', power: 1.3, target: 'single', weight: 3 },
        { name: 'โล่พายุกระแทก', nameEn: 'Storm Shield Bash', element: 'phys', power: 1.05, target: 'single', weight: 2 }
      ]
    },
    {
      id: 'cloud_serpent', name: "งูเมฆพายุ", nameEn: 'Cloud Serpent', tier: 8, icon: 'cloudSerpent',
      baseStats: { hp: 250, atk: 48, mag: 35, def: 27, res: 25, spd: 17, luk: 10, exp: 170 },
      attacks: [
        { name: 'ขดเมฆรัดพายุ', nameEn: 'Storm Coil Crush', element: 'wind', power: 1.25, target: 'single', weight: 3 },
        { name: 'เกล็ดฟ้าแลบวาบ', nameEn: 'Lightning Scale Flash', element: 'elec', power: 1.1, target: 'single', weight: 2 }
      ]
    },

    // ---- Tier 9 : floors 60-64 (Moonless Bone Desert) ----
    {
      id: 'sand_wraith', name: "วิญญาณคลื่นทราย", nameEn: 'Sand Wraith', tier: 9, icon: 'sandWraith',
      baseStats: { hp: 250, atk: 32, mag: 58, def: 25, res: 40, spd: 16, luk: 12, exp: 204 },
      attacks: [
        { name: 'สาปทรายกลืนวิญญาณ', nameEn: 'Sand-Swallowing Curse', element: 'dark', power: 1.3, target: 'single', weight: 3, drainSelf: true }
      ]
    },
    {
      id: 'bone_serpent', name: "งูกระดูกทะเลทราย", nameEn: 'Bone Serpent', tier: 9, icon: 'boneSerpent',
      baseStats: { hp: 280, atk: 62, mag: 20, def: 30, res: 25, spd: 19, luk: 11, exp: 204 },
      attacks: [
        { name: 'เขี้ยวกระดูกฟาด', nameEn: 'Bone Fang Strike', element: 'phys', power: 1.35, target: 'single', weight: 3 },
        { name: 'พ่นทรายเฉือน', nameEn: 'Sandblast Spray', element: 'wind', power: 1.0, target: 'single', weight: 2 }
      ]
    },
    {
      id: 'scarab_swarm', name: "ฝูงด้วงเกราะทราย", nameEn: 'Scarab Swarm', tier: 9, icon: 'scarabSwarm',
      baseStats: { hp: 340, atk: 48, mag: 30, def: 45, res: 35, spd: 13, luk: 9, exp: 204 },
      attacks: [
        { name: 'ฝูงด้วงสุริยากัดกิน', nameEn: 'Devouring Scarab Swarm', element: 'phys', power: 1.2, target: 'all', weight: 2 },
        { name: 'กรามเหล็กบดขยี้', nameEn: 'Mandible Crush', element: 'phys', power: 1.15, target: 'single', weight: 2 }
      ]
    },
    {
      id: 'dust_djinn', name: "ญินธุลีทะเลทราย", nameEn: 'Dust Djinn', tier: 9, icon: 'dustDjinn',
      baseStats: { hp: 260, atk: 35, mag: 60, def: 28, res: 38, spd: 18, luk: 14, exp: 204 },
      attacks: [
        { name: 'มนตร์พายุทรายเถ้า', nameEn: 'Ashen Sandstorm Hex', element: 'fire', power: 1.3, target: 'all', weight: 2 },
        { name: 'คำสาปจินนี', nameEn: "Djinn's Curse", element: 'dark', power: 1.0, target: 'single', weight: 1, debuff: { stat: 'def', amount: 0.15 } }
      ]
    },

    // ---- Tier 10 : floors 65-69 (The Molten Core) ----
    {
      id: 'magma_hound', name: "สุนัขลาวา", nameEn: 'Magma Hound', tier: 10, icon: 'magmaHound',
      baseStats: { hp: 310, atk: 78, mag: 25, def: 35, res: 30, spd: 22, luk: 12, exp: 245 },
      attacks: [
        { name: 'เขี้ยวลาวางับ', nameEn: 'Molten Fang Bite', element: 'fire', power: 1.35, target: 'single', weight: 3 },
        { name: 'คำรามไอร้อน', nameEn: 'Scorching Roar', element: 'fire', power: 1.0, target: 'single', weight: 2 }
      ]
    },
    {
      id: 'cinder_golem', name: "โกเลมถ่านคุ", nameEn: 'Cinder Golem', tier: 10, icon: 'cinderGolem',
      baseStats: { hp: 420, atk: 58, mag: 30, def: 56, res: 42, spd: 9, luk: 8, exp: 245 },
      attacks: [
        { name: 'หมัดถ่านแดงทุบ', nameEn: 'Ember Fist Slam', element: 'phys', power: 1.3, target: 'single', weight: 4 }
      ]
    },
    {
      id: 'lava_serpent', name: "งูเพลิงลาวา", nameEn: 'Lava Serpent', tier: 10, icon: 'lavaSerpent',
      baseStats: { hp: 360, atk: 68, mag: 40, def: 38, res: 32, spd: 18, luk: 11, exp: 245 },
      attacks: [
        { name: 'ขดลาวารัดบด', nameEn: 'Lava Coil Crush', element: 'fire', power: 1.3, target: 'single', weight: 3 },
        { name: 'ไฟหลอมเหล็กพ่น', nameEn: 'Iron-Melting Flame Breath', element: 'fire', power: 1.1, target: 'all', weight: 1 }
      ]
    },
    {
      id: 'pyroclast_bat', name: "ค้างคาวเถ้าปะทุ", nameEn: 'Pyroclast Bat', tier: 10, icon: 'pyroclastBat',
      baseStats: { hp: 302, atk: 72, mag: 32, def: 30, res: 28, spd: 24, luk: 13, exp: 245 },
      attacks: [
        { name: 'โฉบเถ้าปะทุ', nameEn: 'Pyroclastic Dive', element: 'fire', power: 1.3, target: 'single', weight: 3 },
        { name: 'งับดูดไอร้อน', nameEn: 'Heat-Draining Bite', element: 'fire', power: 1.0, target: 'single', weight: 2, drainSelf: true }
      ]
    },

    // ---- Tier 11 : floors 70-74 (Ancient Clockwork Bastion) ----
    {
      id: 'gear_sentinel', name: "ยามเฟืองจักรกลโบราณ", nameEn: 'Gear Sentinel', tier: 11, icon: 'gearSentinel',
      baseStats: { hp: 470, atk: 80, mag: 30, def: 66, res: 50, spd: 13, luk: 10, exp: 294 },
      attacks: [
        { name: 'หมัดเฟืองบด', nameEn: 'Gear-Crushing Fist', element: 'phys', power: 1.3, target: 'single', weight: 4 }
      ]
    },
    {
      id: 'spark_hound', name: "สุนัขประกายไฟฟ้า", nameEn: 'Spark Hound', tier: 11, icon: 'sparkHound',
      baseStats: { hp: 380, atk: 95, mag: 35, def: 45, res: 38, spd: 24, luk: 13, exp: 294 },
      attacks: [
        { name: 'เขี้ยวไฟฟ้า', nameEn: 'Voltaic Fang', element: 'phys', power: 1.3, target: 'single', weight: 3 },
        { name: 'พุ่งชนประกายไฟ', nameEn: 'Spark Charge Ram', element: 'elec', power: 1.15, target: 'single', weight: 2 }
      ]
    },
    {
      id: 'piston_golem', name: "โกเลมลูกสูบเหล็กกล้า", nameEn: 'Piston Golem', tier: 11, icon: 'pistonGolem',
      baseStats: { hp: 510, atk: 88, mag: 20, def: 75, res: 48, spd: 10, luk: 8, exp: 294 },
      attacks: [
        { name: 'หมัดลูกสูบอัด', nameEn: 'Piston Drive Punch', element: 'phys', power: 1.35, target: 'single', weight: 4 }
      ]
    },
    {
      id: 'rotor_wraith', name: "โดรนใบพัดคำสาป", nameEn: "Rotor Wraith", tier: 11, icon: 'rotorWraith',
      baseStats: { hp: 360, atk: 82, mag: 40, def: 40, res: 36, spd: 26, luk: 14, exp: 294 },
      attacks: [
        { name: 'ใบพัดหมุนเฉือน', nameEn: 'Rotor Blade Slice', element: 'wind', power: 1.3, target: 'single', weight: 3 },
        { name: 'ห่ากระสุนพลังงาน', nameEn: 'Energy Bolt Volley', element: 'elec', power: 1.1, target: 'single', weight: 2 }
      ]
    },

    // ---- Tier 12 : floors 75-79 (The Withering Nightgrove) ----
    {
      id: 'fungal_stalker', name: "ผู้ไล่ล่าเห็ดรา", nameEn: "Fungal Stalker", tier: 12, icon: 'fungalStalker',
      baseStats: { hp: 450, atk: 112, mag: 35, def: 50, res: 45, spd: 20, luk: 13, exp: 352 },
      attacks: [
        { name: 'หนามสปอร์เห็ด', nameEn: 'Fungal Spore Spike', element: 'dark', power: 1.3, target: 'single', weight: 3, debuff: { stat: 'def', amount: 0.15 } },
        { name: 'เขี้ยวรากไม้งับ', nameEn: 'Rootfang Bite', element: 'phys', power: 1.1, target: 'single', weight: 2 }
      ]
    },
    {
      id: 'thorn_wraith', name: "วิญญาณเถาหนาม", nameEn: 'Thorn Wraith', tier: 12, icon: 'thornWraith',
      baseStats: { hp: 430, atk: 48, mag: 100, def: 45, res: 68, spd: 18, luk: 14, exp: 352 },
      attacks: [
        { name: 'หนามรัดวิญญาณ', nameEn: 'Soul-Binding Thorns', element: 'dark', power: 1.3, target: 'single', weight: 3, drainSelf: true }
      ]
    },
    {
      id: 'spore_bat', name: "ค้างคาวสปอร์พิษ", nameEn: 'Spore Bat', tier: 12, icon: 'sporeBat',
      baseStats: { hp: 410, atk: 85, mag: 55, def: 42, res: 40, spd: 24, luk: 15, exp: 352 },
      attacks: [
        { name: 'หมอกสปอร์พิษ', nameEn: 'Toxic Spore Cloud', element: 'dark', power: 1.15, target: 'all', weight: 2 },
        { name: 'งับยามราตรี', nameEn: 'Nightfall Bite', element: 'phys', power: 1.0, target: 'single', weight: 2 }
      ]
    },
    {
      id: 'rootbound_golem', name: "โกเลมรากไม้ยักษ์", nameEn: 'Rootbound Golem', tier: 12, icon: 'rootboundGolem',
      baseStats: { hp: 620, atk: 95, mag: 40, def: 75, res: 62, spd: 11, luk: 10, exp: 352 },
      attacks: [
        { name: 'หมัดรากไม้ยักษ์', nameEn: 'Rootbound Crushing Fist', element: 'phys', power: 1.35, target: 'single', weight: 4 }
      ]
    },

    // ---- Tier 13 : floors 80-84 (The Sunless Frozen Abyss) ----
    {
      id: 'frost_spawn', name: "ทายาทความเยือกแข็ง", nameEn: "Frost Spawn", tier: 13, icon: 'frostSpawn',
      baseStats: { hp: 540, atk: 135, mag: 40, def: 60, res: 50, spd: 22, luk: 15, exp: 423 },
      attacks: [
        { name: 'งับแช่แข็งลึก', nameEn: 'Deep Freeze Bite', element: 'ice', power: 1.35, target: 'single', weight: 3 },
        { name: 'หางน้ำแข็งหวด', nameEn: 'Icy Tail Lash', element: 'phys', power: 1.1, target: 'single', weight: 2 }
      ]
    },
    {
      id: 'glacial_wraith', name: "วิญญาณธารน้ำแข็ง", nameEn: 'Glacial Wraith', tier: 13, icon: 'glacialWraith',
      baseStats: { hp: 520, atk: 58, mag: 120, def: 55, res: 80, spd: 20, luk: 16, exp: 423 },
      attacks: [
        { name: 'ลมหายใจแช่แข็งวิญญาณ', nameEn: 'Soul-Freezing Breath', element: 'ice', power: 1.3, target: 'all', weight: 2 }
      ]
    },
    {
      id: 'rime_golem', name: "โกเลมน้ำค้างแข็ง", nameEn: 'Rime Golem', tier: 13, icon: 'rimeGolem',
      baseStats: { hp: 740, atk: 112, mag: 45, def: 90, res: 70, spd: 12, luk: 11, exp: 423 },
      attacks: [
        { name: 'หมัดน้ำแข็งดึกดำบรรพ์', nameEn: 'Primordial Ice Fist', element: 'phys', power: 1.35, target: 'single', weight: 4 }
      ]
    },
    {
      id: 'frozen_harpy', name: "ฮาร์ปี้เยือกแข็ง", nameEn: 'Frozen Harpy', tier: 13, icon: 'frozenHarpy',
      baseStats: { hp: 500, atk: 118, mag: 60, def: 52, res: 48, spd: 26, luk: 17, exp: 423 },
      attacks: [
        { name: 'กรงเล็บหิมะกัด', nameEn: 'Frostbite Talon', element: 'ice', power: 1.3, target: 'single', weight: 3 },
        { name: 'กรีดร้องเยือกเย็น', nameEn: 'Chilling Shriek', element: 'ice', power: 0.95, target: 'single', weight: 1, debuff: { stat: 'spd', amount: 0.2 } }
      ]
    },

    // ---- Tier 14 : floors 85-89 (The Astral Rift) ----
    {
      id: 'star_wisp', name: "ฝูงวิญญาณดาวตก", nameEn: "Star Wisp Swarm", tier: 14, icon: 'starWisp',
      baseStats: { hp: 620, atk: 70, mag: 155, def: 70, res: 105, spd: 24, luk: 16, exp: 507 },
      attacks: [
        { name: 'ห่าดาวตก', nameEn: 'Starfall Barrage', element: 'light', power: 1.3, target: 'all', weight: 2 }
      ]
    },
    {
      id: 'void_serpent', name: "งูห้วงว่างดาราจักร", nameEn: 'Void Serpent', tier: 14, icon: 'voidSerpent',
      baseStats: { hp: 720, atk: 162, mag: 60, def: 80, res: 70, spd: 23, luk: 15, exp: 507 },
      attacks: [
        { name: 'งับกลืนความว่าง', nameEn: 'Void-Devouring Bite', element: 'dark', power: 1.35, target: 'single', weight: 3 },
        { name: 'ขดรัดมิติ', nameEn: 'Dimensional Coil', element: 'phys', power: 1.1, target: 'single', weight: 2 }
      ]
    },
    {
      id: 'nebula_golem', name: "โกเลมเนบิวลา", nameEn: 'Nebula Golem', tier: 14, icon: 'nebulaGolem',
      baseStats: { hp: 900, atk: 128, mag: 80, def: 110, res: 95, spd: 13, luk: 11, exp: 507 },
      attacks: [
        { name: 'หมัดหมอกดาราบด', nameEn: 'Nebula-Crushing Fist', element: 'phys', power: 1.35, target: 'single', weight: 4 }
      ]
    },
    {
      id: 'astral_wraith', name: "วิญญาณดาราจักร", nameEn: 'Astral Wraith', tier: 14, icon: 'astralWraith',
      baseStats: { hp: 660, atk: 75, mag: 160, def: 72, res: 100, spd: 21, luk: 17, exp: 507 },
      attacks: [
        { name: 'สาปดาราพินาศ', nameEn: 'Astral Ruin Curse', element: 'dark', power: 1.25, target: 'single', weight: 2, debuff: { stat: 'res', amount: 0.2 } },
        { name: 'ลำแสงดาวร่วง', nameEn: 'Falling Star Beam', element: 'light', power: 1.1, target: 'single', weight: 2 }
      ]
    },

    // ---- Tier 15 : floors 90-94 (The Chaos Forge) ----
    {
      id: 'chimeric_hound', name: "สุนัขไฮบริดโกลาหล", nameEn: "Chimeric Hound", tier: 15, icon: 'chimericHound',
      baseStats: { hp: 780, atk: 195, mag: 60, def: 90, res: 70, spd: 28, luk: 17, exp: 609 },
      attacks: [
        { name: 'เขี้ยวเพลิงผสมพันธุ์', nameEn: 'Chimeric Flame Fang', element: 'fire', power: 1.35, target: 'single', weight: 3 },
        { name: 'กรงเล็บโกลาหลฉีก', nameEn: 'Chaotic Claw Rend', element: 'phys', power: 1.15, target: 'single', weight: 2 }
      ]
    },
    {
      id: 'chaos_golem', name: "โกเลมหลอมโกลาหล", nameEn: 'Chaos Golem', tier: 15, icon: 'chaosGolem',
      baseStats: { hp: 1080, atk: 155, mag: 95, def: 135, res: 110, spd: 14, luk: 12, exp: 609 },
      attacks: [
        { name: 'หมัดหลอมโกลาหล', nameEn: 'Chaos-Forged Fist', element: 'phys', power: 1.3, target: 'single', weight: 3 },
        { name: 'ปลดปล่อยประจุปั่นป่วน', nameEn: 'Discordant Discharge', element: 'elec', power: 1.15, target: 'single', weight: 2 }
      ]
    },
    {
      id: 'discord_wraith', name: "วิญญาณแห่งความวุ่นวาย", nameEn: 'Discord Wraith', tier: 15, icon: 'discordWraith',
      baseStats: { hp: 810, atk: 90, mag: 190, def: 95, res: 135, spd: 23, luk: 18, exp: 609 },
      attacks: [
        { name: 'คำสาปปั่นป่วน', nameEn: 'Curse of Discord', element: 'dark', power: 1.3, target: 'single', weight: 2, debuff: { stat: 'atk', amount: 0.2 } }
      ]
    },
    {
      id: 'flux_serpent', name: "งูผันแปรธาตุ", nameEn: 'Flux Serpent', tier: 15, icon: 'fluxSerpent',
      baseStats: { hp: 830, atk: 168, mag: 100, def: 100, res: 85, spd: 26, luk: 16, exp: 609 },
      attacks: [
        { name: 'งับบิดเบือนธาตุ', nameEn: 'Flux-Warped Bite', element: 'elec', power: 1.3, target: 'single', weight: 3 },
        { name: 'ลมหายใจแปรธาตุ', nameEn: 'Elemental Flux Breath', element: 'fire', power: 1.15, target: 'single', weight: 2 }
      ]
    },

    // ---- Tier 16 : floors 95-99 (The Twilight Sanctum, beyond time) ----
    {
      id: 'twilight_seraph', name: "เทวาสนธยาผู้เสื่อมทราม", nameEn: 'Twilight Seraph', tier: 16, icon: 'twilightSeraph',
      baseStats: { hp: 950, atk: 210, mag: 180, def: 110, res: 140, spd: 30, luk: 19, exp: 731 },
      attacks: [
        { name: 'ปีกสนธยาทะลวง', nameEn: 'Twilight Wing Pierce', element: 'light', power: 1.35, target: 'single', weight: 3 },
        { name: 'ลำแสงเทวาตกสวรรค์', nameEn: 'Fallen Radiance Beam', element: 'light', power: 1.15, target: 'all', weight: 1 }
      ]
    },
    {
      id: 'chrono_golem', name: "โกเลมกาลเวลาเลือนราง", nameEn: 'Chrono Golem', tier: 16, icon: 'chronoGolem',
      baseStats: { hp: 1350, atk: 185, mag: 110, def: 165, res: 140, spd: 16, luk: 14, exp: 731 },
      attacks: [
        { name: 'หมัดบดกาลเวลา', nameEn: 'Time-Crushing Fist', element: 'phys', power: 1.35, target: 'single', weight: 4 }
      ]
    },
    {
      id: 'sanctum_wraith', name: "วิญญาณวิหารเสื่อมทราม", nameEn: 'Sanctum Wraith', tier: 16, icon: 'sanctumWraith',
      baseStats: { hp: 1000, atk: 105, mag: 230, def: 115, res: 165, spd: 25, luk: 20, exp: 731 },
      attacks: [
        { name: 'สาปวิหารกัดกร่อน', nameEn: "Sanctum's Corrupting Curse", element: 'dark', power: 1.3, target: 'single', weight: 2, debuff: { stat: 'res', amount: 0.2 } }
      ]
    },
    {
      id: 'chrono_serpent', name: "งูกัดกร่อนกาลเวลา", nameEn: 'Chrono Serpent', tier: 16, icon: 'chronoSerpent',
      baseStats: { hp: 1000, atk: 205, mag: 120, def: 120, res: 105, spd: 28, luk: 18, exp: 731 },
      attacks: [
        { name: 'งับกัดเซาะกาล', nameEn: 'Time-Eroding Bite', element: 'almighty', power: 1.1, target: 'single', weight: 2 },
        { name: 'ขดสนธยารัดบด', nameEn: 'Twilight Coil Crush', element: 'dark', power: 1.2, target: 'single', weight: 2 }
      ]
    }
  ];

  // Four-phase fight: each phase drops to a new HP threshold, retheming the
  // Sovereign's element entirely (attack pool is fully replaced rather than
  // appended) so the player has to keep re-reading the fight instead of
  // settling into one strategy.
  var boss = {
    id: 'timeless_sovereign', name: "ราชันไร้กาลเวลา", nameEn: 'The Timeless Sovereign', icon: 'timelessSovereign', isBoss: true,
    // atk/mag were tuned high enough that a single hit could exceed a
    // well-leveled player's max HP in one blow, an outright one-shot
    // regardless of level or gear. Trimmed so the fight stays the toughest
    // in the game without being unwinnable on a bad class/boss matchup.
    baseStats: { hp: 31000, atk: 500, mag: 500, def: 185, res: 175, spd: 34, luk: 22, exp: 17000 },
    attacks: [
      { name: 'ดาบกาลไร้อวสาน', nameEn: 'Blade of Unending Time', element: 'dark', power: 1.2, target: 'single', weight: 3 },
      { name: 'มิติล่มสลาย', nameEn: 'Collapsing Dimension Wave', element: 'almighty', power: 1.0, target: 'all', weight: 2 },
      { name: 'บดขยี้ทุกขณะ', nameEn: 'Crush All Moments', element: 'dark', power: 0.8, target: 'single', weight: 1, debuff: { stat: 'def', amount: 0.25 } }
    ],
    phases: [
      {
        // Phase 2 (HP <= 75%): ignites into a fire-themed onslaught.
        hpThreshold: 0.75,
        announce: 'อธิราชไร้กาลลุกโชนด้วยเปลวเพลิงแห่งการทำลายล้าง!',
        announceEn: 'The Timeless Sovereign ignites with flames of annihilation!',
        attacks: [
          { name: 'เพลิงชำระไร้ขอบเขต', nameEn: 'Boundless Purging Flame', element: 'fire', power: 1.3, target: 'single', weight: 3 },
          { name: 'เพลิงเถ้าโปรยปราย', nameEn: 'Ashfall Firewave', element: 'fire', power: 1.05, target: 'all', weight: 2 },
          { name: 'แผดเผาวิญญาณ', nameEn: 'Soul Scorch', element: 'fire', power: 0.9, target: 'single', weight: 1, debuff: { stat: 'res', amount: 0.25 } }
        ]
      },
      {
        // Phase 3 (HP <= 50%): freezes over.
        hpThreshold: 0.5,
        announce: 'อธิราชไร้กาลแช่แข็งสนามรบด้วยธารน้ำแข็งนิรันดร์!',
        announceEn: 'The Timeless Sovereign freezes the battlefield in an eternal glacier!',
        attacks: [
          { name: 'ธารน้ำแข็งกลืนกิน', nameEn: 'Devouring Glacier', element: 'ice', power: 1.4, target: 'single', weight: 3 },
          { name: 'พายุหิมะไร้จบ', nameEn: 'Endless Blizzard', element: 'ice', power: 1.15, target: 'all', weight: 2 },
          { name: 'แช่แข็งวิญญาณ', nameEn: 'Soul Freeze', element: 'ice', power: 0.95, target: 'single', weight: 1, debuff: { stat: 'spd', amount: 0.25 } }
        ]
      },
      {
        // Phase 4 (HP <= 25%): true form.
        hpThreshold: 0.25,
        announce: 'อธิราชไร้กาลปลดปล่อยรูปลักษณ์แท้จริงเหนือกาลเวลา!',
        announceEn: 'The Timeless Sovereign unveils its true form beyond time itself!',
        attacks: [
          { name: 'อสนีทลายกาลเวลา', nameEn: 'Time-Shattering Bolt', element: 'elec', power: 1.35, target: 'single', weight: 3 },
          { name: 'มหาพายุอธิราช', nameEn: "Sovereign's Grand Tempest", element: 'wind', power: 1.15, target: 'all', weight: 2 },
          { name: 'มหาประลัยไร้อวสาน', nameEn: 'Endless Annihilation', element: 'almighty', power: 1.3, target: 'single', weight: 2, debuff: { stat: 'luk', amount: 0.25 } }
        ]
      }
    ]
  };

  // Mini-bosses: one-time named encounters gating floors 5/10/15/20/25/30/35/40/45 --
  // each sits behind a waypoint stop and hits noticeably harder than a same-tier
  // regular enemy, but (unlike the floor-50 final boss) has no second phase.
  var minibosses = {
    5: {
      id: 'steel_golem', name: "โกเลมเหล็กกล้า", nameEn: "Steel-Forged Golem", icon: 'golem_steel', isBoss: true,
      baseStats: { hp: 75, atk: 13, mag: 3, def: 11, res: 6, spd: 6, luk: 4, exp: 55 },
      attacks: [
        { name: 'ทุบเกราะเหล็กสะท้าน', nameEn: 'Iron Slam', element: 'phys', power: 1.3, target: 'single', weight: 3 },
        { name: 'แขนเหล็กกวาดฟาด', nameEn: 'Steel Arm Swing', element: 'phys', power: 1.0, target: 'single', weight: 2 },
        { name: 'กระแทกพื้นสะเทือน', nameEn: 'Tremor Slam', element: 'phys', power: 0.9, target: 'single', weight: 1, debuff: { stat: 'spd', amount: 0.2 } }
      ]
    },
    10: {
      id: 'bat_queen', name: "ราชินีค้างคาวเลือด", nameEn: 'Blood Bat Queen', icon: 'bat_blood', isBoss: true,
      baseStats: { hp: 100, atk: 14, mag: 14, def: 8, res: 9, spd: 13, luk: 8, exp: 95 },
      attacks: [
        { name: 'ราชินีดื่มโลหิต', nameEn: "Queen's Blood Drain", element: 'dark', power: 1.3, target: 'single', weight: 3, drainSelf: true },
        { name: 'ทิ้งตัวโฉบไว', nameEn: 'Swift Dive', element: 'phys', power: 1.1, target: 'single', weight: 3 },
        { name: 'หวีดทะลวงโสต', nameEn: 'Piercing Shriek', element: 'dark', power: 0.9, target: 'single', weight: 1, debuff: { stat: 'def', amount: 0.25 } }
      ]
    },
    15: {
      id: 'inferno_warden', name: "เจ้าไฟผู้พิทักษ์", nameEn: 'Inferno Warden', icon: 'demon_warden', isBoss: true,
      baseStats: { hp: 155, atk: 20, mag: 20, def: 14, res: 11, spd: 11, luk: 8, exp: 150 },
      attacks: [
        { name: 'เพลิงผู้คุมนรก', nameEn: "Warden's Blaze", element: 'fire', power: 1.35, target: 'single', weight: 3 },
        { name: 'ไอร้อนถล่ม', nameEn: 'Heat Wave', element: 'fire', power: 1.0, target: 'all', weight: 2 },
        { name: 'หมัดถ่านแดง', nameEn: 'Ember Fist', element: 'phys', power: 1.1, target: 'single', weight: 2 }
      ]
    },
    20: {
      id: 'wyvern_alpha', name: 'ไวเวิร์นจ่าฝูง', nameEn: 'Wyvern Alpha', icon: 'dragon_alpha', isBoss: true,
      baseStats: { hp: 165, atk: 22, mag: 10, def: 14, res: 10, spd: 14, luk: 8, exp: 135 },
      attacks: [
        { name: 'กรงเล็บจ่าฝูง', nameEn: 'Alpha Talon', element: 'phys', power: 1.3, target: 'single', weight: 3 },
        { name: 'ปีกพายุกระหน่ำ', nameEn: 'Gale Wingbeat', element: 'wind', power: 1.15, target: 'all', weight: 2 },
        { name: 'คำรามข่มขวัญ', nameEn: 'Intimidating Roar', element: 'phys', power: 0.9, target: 'single', weight: 1, debuff: { stat: 'atk', amount: 0.2 } }
      ]
    },
    25: {
      id: 'flame_overlord', name: "จอมปีศาจเพลิง", nameEn: 'Flame Overlord', icon: 'demon_overlord', isBoss: true,
      baseStats: { hp: 212, atk: 26, mag: 24, def: 15, res: 13, spd: 12, luk: 9, exp: 210 },
      attacks: [
        { name: 'บัลลังก์เพลิง', nameEn: 'Throne of Flame', element: 'fire', power: 1.3, target: 'single', weight: 3 },
        { name: 'เพลิงถล่มทลาย', nameEn: 'Inferno Collapse', element: 'fire', power: 1.05, target: 'all', weight: 2 },
        { name: 'สาปมอดไหม้', nameEn: 'Smoldering Curse', element: 'fire', power: 0.9, target: 'single', weight: 1, debuff: { stat: 'res', amount: 0.2 } }
      ]
    },
    30: {
      id: 'glacial_tyrant', name: "ทรราชน้ำแข็งนิรันดร์", nameEn: 'Glacial Tyrant', icon: 'dragon_iceLord', isBoss: true,
      baseStats: { hp: 300, atk: 28, mag: 26, def: 18, res: 16, spd: 11, luk: 9, exp: 310 },
      attacks: [
        { name: 'ลมหายใจเหมันต์นิรันดร์', nameEn: 'Eternal Frost Breath', element: 'ice', power: 1.2, target: 'all', weight: 2 },
        { name: 'งับตรึงน้ำแข็ง', nameEn: 'Frozen Bite', element: 'ice', power: 1.35, target: 'single', weight: 3 },
        { name: 'หางธารน้ำแข็งฟาด', nameEn: 'Glacial Tail Slam', element: 'phys', power: 1.15, target: 'single', weight: 2 }
      ]
    },
    35: {
      id: 'abyssal_matriarch', name: "มารดาแห่งห้วงนรก", nameEn: 'Abyssal Matriarch', icon: 'demon_matriarch', isBoss: true,
      baseStats: { hp: 345, atk: 30, mag: 32, def: 19, res: 20, spd: 14, luk: 10, exp: 360 },
      attacks: [
        { name: 'เสียงเรียกจากอเวจี', nameEn: 'Abyssal Call', element: 'dark', power: 1.3, target: 'single', weight: 3 },
        { name: 'วิญญาณครวญถล่ม', nameEn: 'Wailing Soul Wave', element: 'dark', power: 1.05, target: 'all', weight: 2 },
        { name: 'จุมพิตมรณะ', nameEn: 'Kiss of Death', element: 'dark', power: 1.0, target: 'single', weight: 1, drainSelf: true }
      ]
    },
    40: {
      id: 'obsidian_dragon', name: "มังกรหินอัคคี", nameEn: 'Obsidian Dragon', icon: 'dragon_obsidian', isBoss: true,
      baseStats: { hp: 430, atk: 34, mag: 30, def: 22, res: 19, spd: 13, luk: 10, exp: 450 },
      attacks: [
        { name: 'ลมหายใจหินหลอม', nameEn: 'Molten Breath', element: 'fire', power: 1.25, target: 'all', weight: 2 },
        { name: 'กรงเล็บหินภูเขาไฟ', nameEn: 'Obsidian Claw', element: 'phys', power: 1.4, target: 'single', weight: 3 },
        { name: 'ปีกกระแทกสะท้าน', nameEn: 'Wing Slam', element: 'phys', power: 1.1, target: 'single', weight: 2 }
      ]
    },
    // ---- Floor 45 onward: gatekeepers of the hidden upper tower ----
    45: {
      id: 'choir_warden', name: "ผู้พิทักษ์เสียงประสาน", nameEn: 'Choir Warden', icon: 'choirWarden', isBoss: true,
      baseStats: { hp: 605, atk: 42, mag: 36, def: 28, res: 25, spd: 16, luk: 12, exp: 531 },
      attacks: [
        { name: 'บทสวดผลึกทลายล้าง', nameEn: 'Shattering Crystal Hymn', element: 'light', power: 1.3, target: 'all', weight: 2 },
        { name: 'หมัดไททันคริสตัล', nameEn: 'Crystal Titan Fist', element: 'phys', power: 1.35, target: 'single', weight: 3 },
        { name: 'ระฆังก้องสั่นวิญญาณ', nameEn: 'Resonant Soul Toll', element: 'light', power: 0.95, target: 'single', weight: 1, debuff: { stat: 'def', amount: 0.2 } }
      ]
    },
    50: {
      id: 'leviathan_herald', name: 'ทูตแห่งเลวีอาธาน', nameEn: "Leviathan's Herald", icon: 'leviathanHerald', isBoss: true,
      baseStats: { hp: 725, atk: 52, mag: 43, def: 35, res: 31, spd: 17, luk: 13, exp: 639 },
      attacks: [
        { name: 'มหาอุทกภัยเลวีอาธาน', nameEn: "Leviathan's Tidal Wave", element: 'ice', power: 1.3, target: 'all', weight: 2 },
        { name: 'ขย้ำขากรรไกรอเวจี', nameEn: 'Abyssal Maw Crush', element: 'phys', power: 1.4, target: 'single', weight: 3 },
        { name: 'สาปสมุทรลึก', nameEn: 'Deep Sea Curse', element: 'dark', power: 0.95, target: 'single', weight: 1, debuff: { stat: 'res', amount: 0.2 } }
      ]
    },
    55: {
      id: 'tempest_marshal', name: "จอมทัพพายุ", nameEn: 'Tempest Marshal', icon: 'tempestMarshal', isBoss: true,
      baseStats: { hp: 872, atk: 62, mag: 52, def: 41, res: 38, spd: 18, luk: 13, exp: 765 },
      attacks: [
        { name: 'ดาบอัสนีจอมทัพ', nameEn: "Marshal's Thunder Blade", element: 'elec', power: 1.35, target: 'single', weight: 3 },
        { name: 'พายุหมุนล้อมปราการ', nameEn: 'Citadel Cyclone', element: 'wind', power: 1.05, target: 'all', weight: 2 },
        { name: 'บัญชาสะท้านฟ้า', nameEn: 'Sky-Shaking Command', element: 'phys', power: 0.95, target: 'single', weight: 1, debuff: { stat: 'spd', amount: 0.2 } }
      ]
    },
    60: {
      id: 'pharaoh_ash', name: "ฟาโรห์เถ้าถ่าน", nameEn: 'Pharaoh of Ash', icon: 'pharaohAsh', isBoss: true,
      baseStats: { hp: 1043, atk: 74, mag: 63, def: 49, res: 45, spd: 20, luk: 14, exp: 918 },
      attacks: [
        { name: 'คทาฟาโรห์เถ้ากระดูก', nameEn: "Ashen Pharaoh's Scepter", element: 'fire', power: 1.35, target: 'single', weight: 3 },
        { name: 'คำสาปมัมมี่บรรพกาล', nameEn: "Ancient Mummy's Curse", element: 'dark', power: 1.1, target: 'all', weight: 2 },
        { name: 'พายุทรายนิรันดร์', nameEn: 'Eternal Sandstorm', element: 'wind', power: 1.0, target: 'single', weight: 1 }
      ]
    },
    65: {
      id: 'core_warden', name: "ผู้พิทักษ์แกนโลก", nameEn: 'Core Warden', icon: 'coreWarden', isBoss: true,
      baseStats: { hp: 1253, atk: 88, mag: 76, def: 59, res: 53, spd: 20, luk: 14, exp: 1103 },
      attacks: [
        { name: 'ลาวาหลากผู้พิทักษ์', nameEn: "Warden's Lava Torrent", element: 'fire', power: 1.3, target: 'all', weight: 2 },
        { name: 'หมัดหลอมแก่นโลก', nameEn: 'Core-Forged Fist', element: 'phys', power: 1.4, target: 'single', weight: 3 },
        { name: 'สาปเพลิงนิรันดร์', nameEn: 'Eternal Flame Curse', element: 'fire', power: 0.95, target: 'single', weight: 1, debuff: { stat: 'res', amount: 0.2 } }
      ]
    },
    70: {
      id: 'grand_automaton', name: "ราชันจักรกลโบราณ", nameEn: 'Grand Automaton', icon: 'grandAutomaton', isBoss: true,
      baseStats: { hp: 1502, atk: 106, mag: 90, def: 71, res: 64, spd: 21, luk: 16, exp: 1323 },
      attacks: [
        { name: 'หมัดมหาจักรกล', nameEn: "Grand Automaton's Fist", element: 'phys', power: 1.4, target: 'single', weight: 3 },
        { name: 'ลำแสงพลังงานปราการ', nameEn: 'Bastion Energy Beam', element: 'elec', power: 1.1, target: 'all', weight: 2 },
        { name: 'สนามรบกวนระบบ', nameEn: 'Disruption Field', element: 'elec', power: 0.95, target: 'single', weight: 1, debuff: { stat: 'atk', amount: 0.2 } }
      ]
    },
    75: {
      id: 'blight_heart', name: "หัวใจแห่งโรคร้าย", nameEn: 'Heart of the Blight', icon: 'blightHeart', isBoss: true,
      baseStats: { hp: 1803, atk: 127, mag: 108, def: 85, res: 77, spd: 22, luk: 17, exp: 1584 },
      attacks: [
        { name: 'ชีพจรหัวใจโรคระบาด', nameEn: 'Blighted Heartbeat Pulse', element: 'dark', power: 1.3, target: 'all', weight: 2 },
        { name: 'เถาวัลย์มรณะหวด', nameEn: 'Deathvine Lash', element: 'phys', power: 1.35, target: 'single', weight: 3 },
        { name: 'สปอร์เสื่อมสลาย', nameEn: 'Spore of Decay', element: 'dark', power: 0.95, target: 'single', weight: 1, debuff: { stat: 'res', amount: 0.2 } }
      ]
    },
    80: {
      id: 'frost_sovereign', name: "ราชันน้ำแข็งห้วงลึก", nameEn: "Abyssal Frost Sovereign", icon: 'frostSovereign', isBoss: true,
      baseStats: { hp: 2163, atk: 153, mag: 129, def: 102, res: 92, spd: 23, luk: 18, exp: 1904 },
      attacks: [
        { name: 'ลมหายใจราชันหิมะ', nameEn: "Sovereign's Glacial Breath", element: 'ice', power: 1.3, target: 'all', weight: 2 },
        { name: 'กรงเล็บเหมันต์ห้วงลึก', nameEn: 'Abyssal Frost Claw', element: 'phys', power: 1.4, target: 'single', weight: 3 },
        { name: 'บัลลังก์น้ำแข็งนิรันดร์', nameEn: 'Eternal Ice Throne', element: 'ice', power: 1.0, target: 'single', weight: 1, debuff: { stat: 'def', amount: 0.2 } }
      ]
    },
    85: {
      id: 'rift_warden', name: "ผู้พิทักษ์รอยแยก", nameEn: 'Rift Warden', icon: 'riftWarden', isBoss: true,
      baseStats: { hp: 2597, atk: 183, mag: 155, def: 123, res: 111, spd: 25, luk: 18, exp: 2282 },
      attacks: [
        { name: 'ฉีกรอยแยกกลืนกิน', nameEn: 'Rift-Devouring Rend', element: 'dark', power: 1.35, target: 'single', weight: 3 },
        { name: 'ดาราจักรล่มสลาย', nameEn: 'Collapsing Galaxy Wave', element: 'light', power: 1.05, target: 'all', weight: 2 },
        { name: 'ฉีกมิติผู้เฝ้ารอยแยก', nameEn: "Warden's Dimensional Tear", element: 'almighty', power: 0.9, target: 'single', weight: 1 }
      ]
    },
    90: {
      id: 'forge_master', name: "นายช่างเพลิงโกลาหล", nameEn: "Forgemaster of Chaos", icon: 'forgeMaster', isBoss: true,
      baseStats: { hp: 3119, atk: 220, mag: 186, def: 147, res: 133, spd: 27, luk: 20, exp: 2741 },
      attacks: [
        { name: 'ค้อนเพลิงโกลาหล', nameEn: 'Chaos Forge Hammer', element: 'fire', power: 1.35, target: 'single', weight: 3 },
        { name: 'ความปั่นป่วนถล่มโรงหลอม', nameEn: 'Forge-Wide Discord Wave', element: 'dark', power: 1.1, target: 'all', weight: 2 },
        { name: 'โอเวอร์โหลดหลอมทุกธาตุ', nameEn: 'All-Element Overload', element: 'almighty', power: 1.0, target: 'single', weight: 1 }
      ]
    },
    95: {
      id: 'timeless_herald', name: "ทูตแห่งนิรันดร", nameEn: 'Herald of the Timeless', icon: 'timelessHerald', isBoss: true,
      baseStats: { hp: 3742, atk: 263, mag: 224, def: 176, res: 160, spd: 29, luk: 21, exp: 3290 },
      attacks: [
        { name: 'ประกาศกาลอวสาน', nameEn: "Herald's Proclamation of the End", element: 'light', power: 1.3, target: 'all', weight: 2 },
        { name: 'ดาบนิรันดร์ทะลวง', nameEn: 'Eternal Blade Pierce', element: 'almighty', power: 1.35, target: 'single', weight: 3 },
        { name: 'เสียงเรียกผู้สืบทอด', nameEn: 'Call of Succession', element: 'dark', power: 1.0, target: 'single', weight: 1, debuff: { stat: 'def', amount: 0.2 } }
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
  // Every distinct template a battle can ever build an actor from (regular +
  // mini-bosses + the final boss) -- the Bestiary/Codex screen's full roster,
  // and the total the "discover them all" achievement counts against.
  window.Game.Data.getAllEnemyTemplates = function () {
    var out = enemies.slice();
    Object.keys(minibosses).forEach(function (f) { out.push(minibosses[f]); });
    out.push(boss);
    return out;
  };
})();
