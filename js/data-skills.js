// Skill pool. classOnly: null = shared by all classes, otherwise restricted to that class id.
// kind: 'attack' | 'heal' | 'buffSelf' | 'debuffEnemy'
// target: 'singleEnemy' | 'allEnemies' | 'self'
(function () {
  var skills = [
    // --- basic ---
    { id: 'attack', name: 'โจมตี', nameEn: 'Attack', element: 'phys', kind: 'attack', power: 1.0, cost: 0, target: 'singleEnemy', minLevel: 1, classOnly: null, icon: 'swordAttack', desc: 'โจมตีกายภาพพื้นฐาน ไม่เสีย MP', descEn: 'Basic physical attack. Costs no MP.' },

    // --- shared single-target nukes ---
    { id: 'fire_bolt', name: 'ลูกไฟ', nameEn: 'Fireball', element: 'fire', kind: 'attack', power: 1.5, cost: 6, target: 'singleEnemy', minLevel: 1, classOnly: null, icon: 'fire', desc: 'พลังไฟใส่ศัตรูเดี่ยว', descEn: 'Fire damage to a single enemy.' },
    { id: 'ice_shard', name: 'เศษน้ำแข็ง', nameEn: 'Ice Shard', element: 'ice', kind: 'attack', power: 1.5, cost: 6, target: 'singleEnemy', minLevel: 1, classOnly: null, icon: 'ice', desc: 'เศษน้ำแข็งแหลมคมใส่ศัตรูเดี่ยว', descEn: 'A sharp ice shard hits a single enemy.' },
    { id: 'spark', name: 'สายฟ้าฟาด', nameEn: 'Spark Strike', element: 'elec', kind: 'attack', power: 1.6, cost: 7, target: 'singleEnemy', minLevel: 3, classOnly: null, icon: 'elec', desc: 'สายฟ้าฟาดใส่ศัตรูเดี่ยว', descEn: 'A lightning bolt strikes a single enemy.' },
    { id: 'gale_cut', name: 'คมลม', nameEn: 'Gale Cut', element: 'wind', kind: 'attack', power: 1.6, cost: 7, target: 'singleEnemy', minLevel: 3, classOnly: null, icon: 'wind', desc: 'คมลมกรีดใส่ศัตรูเดี่ยว', descEn: 'A blade of wind slices a single enemy.' },
    { id: 'holy_ray', name: 'แสงศักดิ์สิทธิ์', nameEn: 'Holy Ray', element: 'light', kind: 'attack', power: 1.7, cost: 9, target: 'singleEnemy', minLevel: 6, classOnly: null, icon: 'light', desc: 'ลำแสงศักดิ์สิทธิ์เจาะทะลุศัตรู', descEn: 'A holy beam pierces through the enemy.' },
    { id: 'shadow_bite', name: 'เขี้ยวเงามืด', nameEn: 'Shadow Fang', element: 'dark', kind: 'attack', power: 1.7, cost: 9, target: 'singleEnemy', minLevel: 6, classOnly: null, icon: 'dark', desc: 'เขี้ยวเงามืดกัดกินศัตรู', descEn: 'Fangs of shadow tear into the enemy.' },
    { id: 'almighty_burst', name: 'มหาประลัย', nameEn: 'Almighty Burst', element: 'almighty', kind: 'attack', power: 1.8, cost: 14, target: 'singleEnemy', minLevel: 10, classOnly: null, icon: 'almighty', desc: 'พลังบริสุทธิ์ ไม่มีศัตรูตัวใดต้านทานได้', descEn: 'Pure power that no enemy can resist.' },

    // --- shared AoE ---
    { id: 'inferno', name: 'พายุเพลิง', nameEn: 'Inferno', element: 'fire', kind: 'attack', power: 1.1, cost: 14, target: 'allEnemies', minLevel: 8, classOnly: null, icon: 'fire', desc: 'เพลิงกวาดล้างศัตรูทั้งหมด', descEn: 'Flames sweep across all enemies.' },
    { id: 'blizzard', name: 'พายุหิมะ', nameEn: 'Blizzard', element: 'ice', kind: 'attack', power: 1.1, cost: 14, target: 'allEnemies', minLevel: 8, classOnly: null, icon: 'ice', desc: 'หิมะกวาดล้างศัตรูทั้งหมด', descEn: 'A blizzard sweeps across all enemies.' },
    { id: 'thunderstorm', name: 'พายุสายฟ้า', nameEn: 'Thunderstorm', element: 'elec', kind: 'attack', power: 1.2, cost: 16, target: 'allEnemies', minLevel: 12, classOnly: null, icon: 'elec', desc: 'สายฟ้ากระหน่ำศัตรูทั้งหมด', descEn: 'Lightning pounds all enemies.' },
    { id: 'tempest', name: 'พายุหมุน', nameEn: 'Tempest', element: 'wind', kind: 'attack', power: 1.2, cost: 16, target: 'allEnemies', minLevel: 12, classOnly: null, icon: 'wind', desc: 'พายุหมุนโหมกระหน่ำศัตรูทั้งหมด', descEn: 'A raging whirlwind batters all enemies.' },
    { id: 'radiant_wave', name: 'คลื่นรัศมี', nameEn: 'Radiant Wave', element: 'light', kind: 'attack', power: 1.2, cost: 18, target: 'allEnemies', minLevel: 15, classOnly: null, icon: 'light', desc: 'คลื่นแสงชำระล้างศัตรูทั้งหมด', descEn: 'A wave of light purges all enemies.' },
    { id: 'abyss_wave', name: 'คลื่นนรก', nameEn: 'Abyssal Wave', element: 'dark', kind: 'attack', power: 1.2, cost: 18, target: 'allEnemies', minLevel: 15, classOnly: null, icon: 'dark', desc: 'คลื่นความมืดกลืนกินศัตรูทั้งหมด', descEn: 'A wave of darkness consumes all enemies.' },

    // --- heal / buff / debuff ---
    { id: 'heal', name: 'ฟื้นฟู', nameEn: 'Heal', element: 'light', kind: 'heal', power: 0.38, cost: 8, target: 'self', minLevel: 1, classOnly: null, icon: 'heart', desc: 'ฟื้นฟู HP ราว 38% ของ HP สูงสุด', descEn: 'Restores about 38% of max HP.' },
    { id: 'greater_heal', name: 'ฟื้นฟูขั้นสูง', nameEn: 'Greater Heal', element: 'light', kind: 'heal', power: 0.7, cost: 16, target: 'self', minLevel: 9, classOnly: null, icon: 'heart', desc: 'ฟื้นฟู HP ราว 70% ของ HP สูงสุด', descEn: 'Restores about 70% of max HP.' },
    { id: 'focus', name: 'สมาธิรบ', nameEn: 'Battle Focus', element: 'phys', kind: 'buffSelf', stat: 'atkmag', amount: 0.25, cost: 6, target: 'self', minLevel: 4, classOnly: null, icon: 'buffUp', desc: 'เพิ่มพลังโจมตี/เวท 25% ใน 3 เทิร์น', descEn: 'Boosts ATK/MAG by 25% for 3 turns.' },
    { id: 'iron_stance', name: 'ท่ายืนเหล็ก', nameEn: 'Iron Stance', element: 'phys', kind: 'buffSelf', stat: 'defres', amount: 0.3, cost: 6, target: 'self', minLevel: 4, classOnly: null, icon: 'shieldGuard', desc: 'เพิ่มการป้องกัน/ต้านเวท 30% ใน 3 เทิร์น', descEn: 'Boosts DEF/RES by 30% for 3 turns.' },
    { id: 'guard_break', name: 'ทลายเกราะ', nameEn: 'Guard Break', element: 'phys', kind: 'debuffEnemy', stat: 'def', amount: 0.3, cost: 5, target: 'singleEnemy', minLevel: 5, classOnly: null, icon: 'debuffDown', desc: 'ลดการป้องกันศัตรูเดี่ยว 30% ใน 3 เทิร์น', descEn: 'Lowers a single enemy DEF by 30% for 3 turns.' },
    { id: 'haste', name: 'เร่งความเร็ว', nameEn: 'Haste', element: 'wind', kind: 'buffSelf', stat: 'spd', amount: 0.4, cost: 8, target: 'self', minLevel: 7, classOnly: null, icon: 'buffUp', desc: 'เพิ่มความเร็ว 40% ใน 3 เทิร์น', descEn: 'Boosts SPD by 40% for 3 turns.' },

    // --- Blade Knight signatures ---
    { id: 'cross_slash', name: 'กากบาทสังหาร', nameEn: 'Cross Slash', element: 'phys', kind: 'attack', power: 2.0, cost: 10, target: 'singleEnemy', minLevel: 1, classOnly: 'blade', icon: 'blade', desc: 'ฟันไขว้พลังสูงใส่ศัตรูเดี่ยว', descEn: 'A powerful crossing slash hits a single enemy.' },
    { id: 'armor_piercer', name: 'ทะลวงเกราะ', nameEn: 'Armor Piercer', element: 'phys', kind: 'attack', power: 1.8, cost: 9, target: 'singleEnemy', minLevel: 6, classOnly: 'blade', icon: 'swordAttack', desc: 'แทงทะลุจุดอ่อนของเกราะศัตรู', descEn: "Thrusts through a gap in the enemy's armor." },
    { id: 'blade_dance', name: 'ระบำคมดาบ', nameEn: 'Blade Dance', element: 'phys', kind: 'attack', power: 1.3, cost: 16, target: 'allEnemies', minLevel: 10, classOnly: 'blade', icon: 'blade', desc: 'หมุนดาบฟาดฟันศัตรูทั้งหมด', descEn: 'A spinning blade strikes all enemies.' },
    { id: 'warriors_wrath', name: 'โกรธเกรี้ยวนักรบ', nameEn: "Warrior's Wrath", element: 'phys', kind: 'buffSelf', stat: 'atk', amount: 0.35, cost: 10, target: 'self', minLevel: 13, classOnly: 'blade', icon: 'buffUp', desc: 'เพิ่มพลังโจมตี 35% ใน 3 เทิร์น', descEn: 'Boosts ATK by 35% for 3 turns.' },
    { id: 'end_bringer', name: 'ดาบอวสาน', nameEn: 'End Bringer', element: 'phys', kind: 'attack', power: 2.6, cost: 18, target: 'singleEnemy', minLevel: 18, classOnly: 'blade', icon: 'blade', desc: 'ท่าไม้ตายที่ทุ่มพลังทั้งหมดลงในดาบเดียว', descEn: 'A finishing blow that pours everything into a single strike.' },

    // --- Elementalist signatures ---
    { id: 'twin_elements', name: 'พลังคู่ธาตุ', nameEn: 'Twin Elements', element: 'fire', kind: 'attack', power: 1.5, cost: 12, target: 'singleEnemy', minLevel: 1, classOnly: 'elementalist', icon: 'sparkles', desc: 'ปล่อยธาตุสุ่ม (ไฟ/น้ำแข็ง/ฟ้า/ลม) สองครั้งใส่ศัตรูเดี่ยว', descEn: 'Unleashes a random element (fire/ice/lightning/wind) twice on a single enemy.', randomElement: ['fire', 'ice', 'elec', 'wind'], hits: 2 },
    { id: 'elemental_seal', name: 'ผนึกธาตุ', nameEn: 'Elemental Seal', element: 'ice', kind: 'debuffEnemy', stat: 'res', amount: 0.25, cost: 8, target: 'singleEnemy', minLevel: 5, classOnly: 'elementalist', icon: 'debuffDown', desc: 'ลดต้านเวทศัตรูเดี่ยว 25% ใน 3 เทิร์น', descEn: 'Lowers a single enemy RES by 25% for 3 turns.' },
    { id: 'elemental_sovereignty', name: 'ราชันธาตุ', nameEn: 'Elemental Sovereignty', element: 'fire', kind: 'buffSelf', stat: 'mag', amount: 0.3, cost: 9, target: 'self', minLevel: 9, classOnly: 'elementalist', icon: 'buffUp', desc: 'เพิ่มพลังเวท 30% ใน 3 เทิร์น', descEn: 'Boosts MAG by 30% for 3 turns.' },
    { id: 'grand_cataclysm', name: 'มหาวิบัติ', nameEn: 'Grand Cataclysm', element: 'almighty', kind: 'attack', power: 1.4, cost: 22, target: 'allEnemies', minLevel: 14, classOnly: 'elementalist', icon: 'almighty', desc: 'พลังบริสุทธิ์ถล่มศัตรูทั้งหมด', descEn: 'Pure power obliterates all enemies.' },
    { id: 'elemental_barrage', name: 'กระหน่ำจตุรธาตุ', nameEn: 'Elemental Barrage', element: 'fire', kind: 'attack', power: 1.3, cost: 19, target: 'singleEnemy', minLevel: 17, classOnly: 'elementalist', icon: 'sparkles', desc: 'ปล่อยธาตุสุ่มสามครั้งใส่ศัตรูเดี่ยว', descEn: 'Unleashes three random elemental strikes on a single enemy.', randomElement: ['fire', 'ice', 'elec', 'wind'], hits: 3 },

    // --- Cleric signatures ---
    { id: 'smite', name: 'อาญาสวรรค์', nameEn: 'Smite', element: 'light', kind: 'attack', power: 1.6, cost: 8, target: 'singleEnemy', minLevel: 1, classOnly: 'cleric', icon: 'radiantOrb', desc: 'พลังแสงลงทัณฑ์ศัตรูเดี่ยว', descEn: 'The power of light punishes a single enemy.' },
    { id: 'mark_of_sin', name: 'สาปมลทิน', nameEn: 'Mark of Sin', element: 'light', kind: 'debuffEnemy', stat: 'res', amount: 0.25, cost: 7, target: 'singleEnemy', minLevel: 5, classOnly: 'cleric', icon: 'debuffDown', desc: 'ตราบาปลดต้านเวทศัตรูเดี่ยว 25% ใน 3 เทิร์น', descEn: 'A mark of sin lowers a single enemy RES by 25% for 3 turns.' },
    { id: 'sanctuary', name: 'เขตคุ้มครอง', nameEn: 'Sanctuary', element: 'light', kind: 'buffSelf', stat: 'defres', amount: 0.35, cost: 14, target: 'self', minLevel: 8, classOnly: 'cleric', icon: 'shieldGuard', desc: 'เพิ่มการป้องกัน/ต้านเวท 35% ใน 3 เทิร์น พร้อมฟื้นฟู HP เล็กน้อย', descEn: 'Boosts DEF/RES by 35% for 3 turns and restores a small amount of HP.', healPower: 0.15 },
    { id: 'radiant_thunder', name: 'อสนีบาตแสง', nameEn: 'Radiant Thunder', element: 'light', kind: 'attack', power: 1.9, cost: 11, target: 'singleEnemy', minLevel: 11, classOnly: 'cleric', icon: 'light', desc: 'สายฟ้าศักดิ์สิทธิ์ฟาดใส่ศัตรูเดี่ยว', descEn: 'A holy thunderbolt strikes a single enemy.' },
    { id: 'judgment', name: 'วันพิพากษา', nameEn: 'Judgment', element: 'light', kind: 'attack', power: 1.2, cost: 20, target: 'allEnemies', minLevel: 16, classOnly: 'cleric', icon: 'light', desc: 'แสงพิพากษาศัตรูทั้งหมด', descEn: 'A light of judgment strikes all enemies.' },
    { id: 'angelic_ward', name: 'เกราะเทวะ', nameEn: 'Angelic Ward', element: 'light', kind: 'buffSelf', stat: 'defres', amount: 0.55, cost: 22, target: 'self', minLevel: 18, classOnly: 'cleric', icon: 'shieldGuard', desc: 'เพิ่มการป้องกัน/ต้านเวท 55% ใน 3 เทิร์น พร้อมฟื้นฟู HP ปานกลาง', descEn: 'Boosts DEF/RES by 55% for 3 turns and restores a moderate amount of HP.', healPower: 0.3 },

    // --- Berserker signatures ---
    { id: 'reckless_strike', name: 'ฟาดเดือดดาล', nameEn: 'Reckless Strike', element: 'phys', kind: 'attack', power: 2.2, cost: 9, target: 'singleEnemy', minLevel: 1, classOnly: 'berserker', icon: 'swordAttack', desc: 'ฟันดะแบบไม่สนใจการป้องกันตัวเอง', descEn: 'A reckless swing that ignores self-preservation.' },
    { id: 'bloodlust', name: 'เลือดเดือด', nameEn: 'Bloodlust', element: 'phys', kind: 'buffSelf', stat: 'atk', amount: 0.35, cost: 8, target: 'self', minLevel: 5, classOnly: 'berserker', icon: 'buffUp', desc: 'เพิ่มพลังโจมตี 35% ใน 3 เทิร์น', descEn: 'Boosts ATK by 35% for 3 turns.' },
    { id: 'lifesteal_cleave', name: 'ดูดเลือดสังหาร', nameEn: 'Life-Steal Cleave', element: 'phys', kind: 'attack', power: 1.6, cost: 10, target: 'singleEnemy', minLevel: 9, classOnly: 'berserker', icon: 'swordAttack', desc: 'ฟันสังหารพร้อมดูดเลือดคืนชีวิต', descEn: 'A savage cleave that drains life from the wound.', drainSelf: true },
    { id: 'raging_whirl', name: 'พายุขวานเดือด', nameEn: 'Raging Whirl', element: 'phys', kind: 'attack', power: 1.35, cost: 18, target: 'allEnemies', minLevel: 11, classOnly: 'berserker', icon: 'swordAttack', desc: 'ขวานหมุนเดือดดาลฟาดศัตรูทั้งหมด', descEn: 'A furious spinning axe strikes all enemies.' },
    { id: 'berserks_end', name: 'จุดจบเดือดดาล', nameEn: "Berserker's End", element: 'phys', kind: 'attack', power: 2.8, cost: 20, target: 'singleEnemy', minLevel: 16, classOnly: 'berserker', icon: 'swordAttack', desc: 'ทุ่มสุดตัวครั้งสุดท้ายแบบไม่สนใจชีวิต', descEn: 'A final all-out assault with total disregard for self.' },

    // --- Ranger signatures ---
    { id: 'piercing_shot', name: 'ธนูเจาะเกราะ', nameEn: 'Piercing Shot', element: 'phys', kind: 'attack', power: 1.9, cost: 7, target: 'singleEnemy', minLevel: 1, classOnly: 'ranger', icon: 'wind', desc: 'ลูกธนูความเร็วสูงเจาะเกราะศัตรู', descEn: "A high-speed arrow pierces the enemy's armor." },
    { id: 'hunters_focus', name: 'สมาธินักล่า', nameEn: "Hunter's Focus", element: 'wind', kind: 'buffSelf', stat: 'luk', amount: 0.4, cost: 7, target: 'self', minLevel: 5, classOnly: 'ranger', icon: 'buffUp', desc: 'เพิ่มโชค 40% ใน 3 เทิร์น เพิ่มโอกาสคริติคอล', descEn: 'Boosts LUK by 40% for 3 turns, raising crit chance.' },
    { id: 'binding_shot', name: 'ธนูพันธนาการ', nameEn: 'Binding Shot', element: 'phys', kind: 'debuffEnemy', stat: 'spd', amount: 0.3, cost: 6, target: 'singleEnemy', minLevel: 8, classOnly: 'ranger', icon: 'debuffDown', desc: 'ลูกธนูตรึงขาศัตรูเดี่ยว ลดความเร็ว 30% ใน 3 เทิร์น', descEn: "An arrow binds a single enemy's legs, lowering SPD by 30% for 3 turns." },
    { id: 'arrow_rain', name: 'ห่าฝนธนู', nameEn: 'Arrow Rain', element: 'wind', kind: 'attack', power: 1.15, cost: 15, target: 'allEnemies', minLevel: 11, classOnly: 'ranger', icon: 'wind', desc: 'ธนูตกลงมาเป็นสายฝนใส่ศัตรูทั้งหมด', descEn: 'A rain of arrows falls on all enemies.' },
    { id: 'perfect_shot', name: 'นัดสังหารเนรมิต', nameEn: 'Perfect Shot', element: 'phys', kind: 'attack', power: 2.5, cost: 16, target: 'singleEnemy', minLevel: 17, classOnly: 'ranger', icon: 'wind', desc: 'นัดยิงแม่นยำที่สุดในชีวิต เล็งจุดอ่อนสุดขีด', descEn: 'The single most precise shot of a lifetime, aimed at the deadliest point.' },

    // --- Necromancer signatures ---
    { id: 'curse_bolt', name: 'มนตร์สาปมืด', nameEn: 'Curse Bolt', element: 'dark', kind: 'attack', power: 1.6, cost: 8, target: 'singleEnemy', minLevel: 1, classOnly: 'necromancer', icon: 'dark', desc: 'พลังมืดสาปแช่งศัตรูเดี่ยว', descEn: 'A bolt of dark curse strikes a single enemy.' },
    { id: 'soul_siphon', name: 'ดูดวิญญาณ', nameEn: 'Soul Siphon', element: 'dark', kind: 'attack', power: 1.4, cost: 9, target: 'singleEnemy', minLevel: 5, classOnly: 'necromancer', icon: 'dark', desc: 'ดูดพลังวิญญาณศัตรูมาเยียวยาตนเอง', descEn: "Siphons the enemy's soul essence to heal yourself.", drainSelf: true },
    { id: 'withering_curse', name: 'คำสาปทำลายล้าง', nameEn: 'Withering Curse', element: 'dark', kind: 'debuffEnemy', stat: 'res', amount: 0.3, cost: 8, target: 'singleEnemy', minLevel: 9, classOnly: 'necromancer', icon: 'debuffDown', desc: 'คำสาปเซาะกร่อนต้านเวทศัตรูเดี่ยว 30% ใน 3 เทิร์น', descEn: "A withering curse erodes a single enemy's RES by 30% for 3 turns." },
    { id: 'grave_eruption', name: 'หลุมศพประทุ', nameEn: 'Grave Eruption', element: 'dark', kind: 'attack', power: 1.25, cost: 20, target: 'allEnemies', minLevel: 14, classOnly: 'necromancer', icon: 'dark', desc: 'วิญญาณจากหลุมศพระเบิดใส่ศัตรูทั้งหมด', descEn: 'Spirits erupt from the grave, striking all enemies.' },
    { id: 'cataclysm_damned', name: 'วิปโยคจากขุมนรก', nameEn: 'Cataclysm of the Damned', element: 'dark', kind: 'attack', power: 1.3, cost: 24, target: 'allEnemies', minLevel: 18, classOnly: 'necromancer', icon: 'dark', desc: 'เรียกวิญญาณผู้ถูกสาปทั้งหมดถล่มศัตรูทุกตัว', descEn: 'Summons the wailing damned to consume all enemies.' },

    // --- Monk signatures ---
    { id: 'thunder_palm', name: 'ฝ่ามือสายฟ้า', nameEn: 'Thunder Palm', element: 'elec', kind: 'attack', power: 1.7, cost: 7, target: 'singleEnemy', minLevel: 1, classOnly: 'monk', icon: 'elec', desc: 'พลังกำปั้นชาร์จสายฟ้ากระแทกศัตรู', descEn: 'A palm strike charged with lightning slams the enemy.' },
    { id: 'weak_point_strike', name: 'จุดชี่อ่อนแอ', nameEn: 'Weak Point Strike', element: 'phys', kind: 'debuffEnemy', stat: 'def', amount: 0.25, cost: 6, target: 'singleEnemy', minLevel: 6, classOnly: 'monk', icon: 'debuffDown', desc: 'จุดจุดชี่อ่อนแอ ลดการป้องกันศัตรูเดี่ยว 25% ใน 3 เทิร์น', descEn: "Strikes a vital pressure point, lowering a single enemy's DEF by 25% for 3 turns." },
    { id: 'piercing_voltage', name: 'ประจุสายฟ้าทะลวง', nameEn: 'Piercing Voltage', element: 'elec', kind: 'attack', power: 2.0, cost: 12, target: 'singleEnemy', minLevel: 10, classOnly: 'monk', icon: 'elec', desc: 'ปล่อยกระแสไฟฟ้าทะลวงเข้าสู่ร่างศัตรู', descEn: "Channels a piercing voltage straight into the enemy's body." },
    { id: 'hundred_fists', name: 'ร้อยหมัดสายฟ้า', nameEn: 'Hundred Thunder Fists', element: 'elec', kind: 'attack', power: 1.3, cost: 17, target: 'allEnemies', minLevel: 12, classOnly: 'monk', icon: 'elec', desc: 'กระหน่ำหมัดสายฟ้าใส่ศัตรูทั้งหมด', descEn: 'A flurry of lightning-charged fists batters all enemies.' },
    { id: 'thousand_volt_fist', name: 'หมัดสายฟ้าล้างจักรวาล', nameEn: 'Thousand Volt Fist', element: 'elec', kind: 'attack', power: 1.3, cost: 20, target: 'singleEnemy', minLevel: 17, classOnly: 'monk', icon: 'elec', desc: 'ทุ่มหมัดสายฟ้าสุดพลังสองครั้งซ้อน', descEn: 'Unleashes two consecutive full-power lightning fists.', hits: 2 },

    // --- Paladin signatures ---
    { id: 'holy_strike', name: 'ฟันดาบศักดิ์สิทธิ์', nameEn: 'Holy Strike', element: 'light', kind: 'attack', power: 1.6, cost: 8, target: 'singleEnemy', minLevel: 1, classOnly: 'paladin', icon: 'light', desc: 'ดาบชุบแสงศักดิ์สิทธิ์ฟันศัตรู', descEn: 'A blade blessed with holy light strikes the enemy.' },
    { id: 'holy_brand', name: 'ตราสัญลักษณ์ศักดิ์สิทธิ์', nameEn: 'Holy Brand', element: 'light', kind: 'debuffEnemy', stat: 'atk', amount: 0.25, cost: 7, target: 'singleEnemy', minLevel: 5, classOnly: 'paladin', icon: 'debuffDown', desc: 'ตราศักดิ์สิทธิ์ลดพลังโจมตีศัตรูเดี่ยว 25% ใน 3 เทิร์น', descEn: "A holy brand lowers a single enemy's ATK by 25% for 3 turns." },
    { id: 'divine_aegis', name: 'โล่แสงเทวะ', nameEn: 'Divine Aegis', element: 'light', kind: 'buffSelf', stat: 'defres', amount: 0.4, cost: 14, target: 'self', minLevel: 8, classOnly: 'paladin', icon: 'shieldGuard', desc: 'โล่แสงศักดิ์สิทธิ์เพิ่มการป้องกัน/ต้านเวท 40% ใน 3 เทิร์น', descEn: 'A holy light shield boosts DEF/RES by 40% for 3 turns.' },
    { id: 'sword_absolution', name: 'ดาบชำระบาป', nameEn: 'Sword of Absolution', element: 'light', kind: 'attack', power: 2.0, cost: 13, target: 'singleEnemy', minLevel: 12, classOnly: 'paladin', icon: 'light', desc: 'ดาบแห่งการชำระล้างฟันศัตรูเดี่ยว', descEn: 'A sword of absolution cuts down a single enemy.' },
    { id: 'eternal_guardian', name: 'ผู้พิทักษ์นิรันดร์', nameEn: 'Eternal Guardian', element: 'light', kind: 'buffSelf', stat: 'defres', amount: 0.55, cost: 22, target: 'self', minLevel: 18, classOnly: 'paladin', icon: 'shieldGuard', desc: 'เพิ่มการป้องกัน/ต้านเวท 55% ใน 3 เทิร์น พร้อมฟื้นฟู HP ปานกลาง', descEn: 'Boosts DEF/RES by 55% for 3 turns and restores a moderate amount of HP.', healPower: 0.25 }
  ];

  window.Game = window.Game || {};
  window.Game.Data = window.Game.Data || {};
  window.Game.Data.skills = skills;
  window.Game.Data.getSkill = function (id) {
    for (var i = 0; i < skills.length; i++) if (skills[i].id === id) return skills[i];
    return null;
  };
  window.Game.Data.getLearnedSkills = function (classId, level) {
    return skills.filter(function (s) {
      return (s.classOnly === null || s.classOnly === classId) && s.minLevel <= level;
    });
  };
})();
