// Quest definitions: always-active objectives (no "accept" step -- see the
// Quests screen in ui-tower.js) that become claimable the moment their
// condition is met and stay claimable until the player collects the reward.
// Progress is derived live from the run (see State.getQuestProgress), driven
// by a small set of cumulative counters on run.stats (State.recordEnemiesDefeated/
// recordBattleWon/recordItemCrafted/recordArenaWaveCleared) plus fields the run
// already tracks (level/currentFloor/gold/equipment/skills) -- so adding a new
// quest here never needs a new event hook, only a `type` this file already knows.
//
// type: 'floor' | 'level' | 'gold' | 'goldEarned' | 'enemiesDefeated' |
//       'battlesWon' | 'itemsCrafted' | 'equipFull' | 'skillsLearned' | 'arenaWaves'
// reward: { gold?, exp?, items?: [{ id, qty }] }
(function () {
  var quests = [
    { id: 'q_floor_5', name: 'ผู้บุกเบิกหอคอย', nameEn: 'Tower Pioneer', icon: 'doorway', type: 'floor', target: 5,
      desc: 'ไต่หอคอยถึงชั้นที่ 5', descEn: 'Reach floor 5 of the tower.',
      reward: { gold: 100, exp: 40 } },
    { id: 'q_floor_10', name: 'นักไต่หอคอยฝีมือดี', nameEn: 'Capable Climber', icon: 'doorway', type: 'floor', target: 10,
      desc: 'ไต่หอคอยถึงชั้นที่ 10', descEn: 'Reach floor 10 of the tower.',
      reward: { gold: 250, exp: 100, items: [{ id: 'p_hp_medium', qty: 3 }] } },
    { id: 'q_floor_25', name: 'ผู้ท้าทายเงามืด', nameEn: 'Shadow Challenger', icon: 'doorway', type: 'floor', target: 25,
      desc: 'ไต่หอคอยถึงชั้นที่ 25', descEn: 'Reach floor 25 of the tower.',
      reward: { gold: 600, exp: 300, items: [{ id: 'mat_demon_fang', qty: 4 }] } },
    { id: 'q_floor_45', name: 'ผู้ปลดผนึกหอคอยซ่อนเร้น', nameEn: 'Unsealer of the Hidden Tower', icon: 'doorway', type: 'floor', target: 45,
      desc: 'ไต่หอคอยถึงชั้นที่ 45 และปลดผนึกหอคอยส่วนที่ซ่อนอยู่', descEn: 'Reach floor 45 and unseal the hidden upper tower.',
      reward: { gold: 1500, exp: 900, items: [{ id: 'c_quest_veteran_medal', qty: 1 }] } },
    { id: 'q_floor_100', name: 'ผู้พิชิตหอคอยแห่งความมืด', nameEn: 'Conqueror of the Darkness Tower', icon: 'crownSkull', type: 'floor', target: 100,
      desc: 'ไต่หอคอยถึงชั้นบัลลังก์ของราชันไร้กาลเวลา', descEn: "Reach the Timeless Sovereign's throne floor.",
      reward: { gold: 5000, exp: 3000, items: [{ id: 'c_quest_sovereign_relic', qty: 1 }] } },

    { id: 'q_level_10', name: 'นักผจญภัยมือใหม่', nameEn: 'Fledgling Adventurer', icon: 'star', type: 'level', target: 10,
      desc: 'มีเลเวลตัวละครถึง 10', descEn: 'Reach character level 10.',
      reward: { gold: 150 } },
    { id: 'q_level_25', name: 'นักผจญภัยผู้ช่ำชอง', nameEn: 'Seasoned Adventurer', icon: 'star', type: 'level', target: 25,
      desc: 'มีเลเวลตัวละครถึง 25', descEn: 'Reach character level 25.',
      reward: { gold: 500, items: [{ id: 'skill_scroll', qty: 1 }] } },
    { id: 'q_level_50', name: 'จอมพลังผู้ยิ่งใหญ่', nameEn: 'Mighty Champion', icon: 'star', type: 'level', target: 50,
      desc: 'มีเลเวลตัวละครถึง 50', descEn: 'Reach character level 50.',
      reward: { gold: 1500, items: [{ id: 'c_quest_veteran_medal', qty: 1 }] } },

    { id: 'q_gold_500', name: 'นักสะสมมือใหม่', nameEn: 'Budding Collector', icon: 'coin', type: 'gold', target: 500,
      desc: 'มีทองอยู่ในมือพร้อมกัน 500', descEn: 'Hold 500 gold at once.',
      reward: { exp: 80, items: [{ id: 'p_mp_small', qty: 3 }] } },
    { id: 'q_gold_earned_5000', name: 'เจ้าสัวหอคอย', nameEn: 'Tower Tycoon', icon: 'coin', type: 'goldEarned', target: 5000,
      desc: 'สะสมทองรวมตลอดการเดินทาง 5,000', descEn: 'Accumulate 5,000 gold in total over the journey.',
      reward: { gold: 300, items: [{ id: 'c_quest_veteran_medal', qty: 1 }] } },

    { id: 'q_kills_20', name: 'นักล่าเงามืดมือใหม่', nameEn: 'Novice Shadow Hunter', icon: 'skull', type: 'enemiesDefeated', target: 20,
      desc: 'กำจัดศัตรู 20 ตัว', descEn: 'Defeat 20 enemies.',
      reward: { gold: 120, exp: 60 } },
    { id: 'q_kills_100', name: 'นักล่าเงามืดผู้เชี่ยวชาญ', nameEn: 'Expert Shadow Hunter', icon: 'skull', type: 'enemiesDefeated', target: 100,
      desc: 'กำจัดศัตรู 100 ตัว', descEn: 'Defeat 100 enemies.',
      reward: { gold: 400, exp: 250, items: [{ id: 'mat_iron_shard', qty: 5 }] } },
    { id: 'q_kills_300', name: 'ผู้ล้างเผ่าพันธุ์เงามืด', nameEn: 'Shadow Exterminator', icon: 'skull', type: 'enemiesDefeated', target: 300,
      desc: 'กำจัดศัตรู 300 ตัว', descEn: 'Defeat 300 enemies.',
      reward: { gold: 1200, exp: 700, items: [{ id: 'c_quest_veteran_medal', qty: 1 }] } },

    { id: 'q_wins_10', name: 'ผู้ชนะไม่หยุดยั้ง', nameEn: 'Unstoppable Victor', icon: 'crownSkull', type: 'battlesWon', target: 10,
      desc: 'ชนะการต่อสู้ 10 ครั้ง', descEn: 'Win 10 battles.',
      reward: { gold: 150, exp: 80 } },

    { id: 'q_craft_1', name: 'ช่างฝีมือมือใหม่', nameEn: 'Budding Artisan', icon: 'weaponSlot', type: 'itemsCrafted', target: 1,
      desc: 'คราฟต์อุปกรณ์ 1 ชิ้นที่โต๊ะคราฟต์', descEn: 'Craft 1 piece of equipment at the crafting bench.',
      reward: { gold: 100, items: [{ id: 'mat_beast_fang', qty: 3 }] } },
    { id: 'q_craft_5', name: 'ปรมาจารย์งานช่าง', nameEn: 'Master Artisan', icon: 'weaponSlot', type: 'itemsCrafted', target: 5,
      desc: 'คราฟต์อุปกรณ์ 5 ชิ้นที่โต๊ะคราฟต์', descEn: 'Craft 5 pieces of equipment at the crafting bench.',
      reward: { gold: 500, items: [{ id: 'c_quest_novice_badge', qty: 1 }] } },

    { id: 'q_equip_full', name: 'พร้อมออกศึกเต็มตัว', nameEn: 'Fully Geared', icon: 'shieldGuard', type: 'equipFull', target: 5,
      desc: 'สวมใส่อุปกรณ์ครบทั้ง 5 ช่องพร้อมกัน', descEn: 'Have gear equipped in all 5 slots at once.',
      reward: { gold: 200, exp: 100 } },

    { id: 'q_skills_8', name: 'ปรมาจารย์ทักษะ', nameEn: 'Skill Master', icon: 'magicBurst', type: 'skillsLearned', target: 8,
      desc: 'เรียนรู้ทักษะให้ได้ 8 ทักษะ', descEn: 'Know 8 skills at once.',
      reward: { gold: 300, exp: 150 } },

    { id: 'q_arena_10', name: 'นักประลองหน้าใหม่', nameEn: 'Arena Newcomer', icon: 'sparkles', type: 'arenaWaves', target: 10,
      desc: 'ผ่านคลื่นในสนามประลองรวม 10 คลื่น', descEn: 'Clear a total of 10 waves in the Endless Arena.',
      reward: { gold: 200, items: [{ id: 'mat_spirit_dust', qty: 3 }] } },
    { id: 'q_arena_50', name: 'จอมประลองไร้พ่าย', nameEn: 'Arena Champion', icon: 'sparkles', type: 'arenaWaves', target: 50,
      desc: 'ผ่านคลื่นในสนามประลองรวม 50 คลื่น', descEn: 'Clear a total of 50 waves in the Endless Arena.',
      reward: { gold: 1000, exp: 400, items: [{ id: 'c_quest_novice_badge', qty: 1 }] } }
  ];

  window.Game = window.Game || {};
  window.Game.Data = window.Game.Data || {};
  window.Game.Data.quests = quests;
  window.Game.Data.getQuest = function (id) {
    for (var i = 0; i < quests.length; i++) if (quests[i].id === id) return quests[i];
    return null;
  };
})();
