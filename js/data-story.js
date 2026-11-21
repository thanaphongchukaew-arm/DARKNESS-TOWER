// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// ALL narrative text lives here -- the only file to edit when changing the story.
// Logic (what triggers when, saving, endings assembly) is in story-system.js and
// the screens are in ui-stories.js / ui-menu.js.
//
//   D.story.screens    intro + ending screen shells (title / base paragraphs / button)
//   D.story.arcs       the 3 choice-driven NPC arcs (Mira, Orin, Lyra), 3 chapters each;
//                      every chapter also carries a `clue` that ties it to the main plot
//   D.story.lore       floor-triggered lore fragments (letters, inscriptions, voices)
//   D.story.epilogues  per-NPC ending paragraphs, picked by how much the NPC trusts you
//   D.story.truth      extra ending paragraph for players who found every lore fragment
//
// Every string has a Thai field and an `...En` twin (read through I18n.L).
// Paragraphs are separated by a blank line ("\n\n"); a single "\n" is a line break.
//
// THE TRUTH BEHIND THE TOWER (for writers -- the story the fragments reveal):
//   The Timeless Sovereign was once the Keeper of Dawn, who loved the world so much
//   it could not bear for any day to end. It stopped time and built the tower as a
//   clock that never strikes, feeding on moonlight and on lives held in the stones.
//   The lower tower was built later as a cage around that upper half; the Shadow
//   Demon Lord was only the lock on its gate (floor 50). The hero's guardian, the
//   Lamplighter, climbed in first and became a lamp keeping the tower lit. The hero's
//   Moon Shard is a piece of the one light the Sovereign could never hold.
(function () {
  var G = window.Game, D = G.Data;
  // ---- NPC arcs: choice-driven, 3 chapters each (choices carry the gameplay effects) ----
  function choice(id, name, nameEn, desc, descEn, effects) { return Object.assign({ id: id, name: name, nameEn: nameEn, desc: desc, descEn: descEn }, effects || {}); }
  var arcs = [
    { id: 'mira', name: 'มิรา · พ่อค้าตะเกียง', nameEn: 'Mira · Lantern Merchant', icon: 'npcMira', color: '#eda557', chapters: [
      { floor: 3, icon: 'npcMiraHurt', prop: 'propCart', title: 'แสงเล็กใต้ซากเกวียน', titleEn: 'A Light Beneath the Wreck',
        text: 'เสียงกระดิ่งเบา ๆ ดังจากเกวียนที่พลิกคว่ำ หญิงสาวคนหนึ่งติดอยู่ใต้คานไม้ เธอกอดตะเกียงไว้แน่น\n“ฉันชื่อมิรา... อย่าปล่อยให้ไฟดวงนี้ดับนะ มันเป็นสิ่งเดียวที่พาฉันกลับบ้านได้”',
        textEn: 'A tiny bell rings beneath an overturned cart. A young merchant is trapped under its beam, clutching a lantern.\n“My name is Mira… please keep this light alive. It is the only thing that can lead me home.”',
        choices: [choice('lift', 'ยกคานช่วยเธอ', 'Lift the beam', 'เสีย HP 10% ของค่าสูงสุด (ไม่ตาย) • มิราจดจำความช่วยเหลือ', 'Lose 10% max HP (nonlethal) • Mira remembers your help', { hpCost: 0.1, trust: 2 }), choice('medicine', 'แบ่งยารักษาให้', 'Share a potion', 'ใช้ยาฟื้น HP เล็ก 1 ขวด • มิราจดจำความช่วยเหลือ', 'Spend 1 Small HP Potion • Mira remembers your help', { itemCost: 'p_hp_small', trust: 2 }), choice('leave', 'บอกเส้นทางแล้วเดินต่อ', 'Point out the exit', 'ไม่มีค่าใช้จ่าย • เธอต้องหาทางออกด้วยตัวเอง', 'No cost • she must escape on her own', { trust: 0 })] },
      { floor: 18, icon: 'npcMira', prop: 'propCart', title: 'ร้านค้าข้างแสงตะเกียง', titleEn: 'The Lantern-side Shop',
        text: 'กระดิ่งเสียงคุ้นเคยดังขึ้นหลังม่านผ้า มิรายืนข้างแผงยาที่ซ่อมจากเกวียนเก่า\n“หอคอยเอาของฉันไปเกือบหมด แต่ยังเอาความฝันไปไม่ได้หรอก”', textEn: 'A familiar bell chimes behind a cloth curtain. Mira stands beside a medicine stall rebuilt from her cart.\n“The tower took almost everything. It has not taken my dream.”',
        helped: '“ฉันจำคนที่ช่วยใต้ซากเกวียนได้ รับยานี้ไปเถอะ เราอาจได้พบกันอีก”', helpedEn: '“I remember who pulled me from that wreck. Please take these. I hope we meet again.”',
        distant: '“วันนั้นฉันรอดมาได้ด้วยตัวเอง ครั้งนี้... จะลองไว้ใจกันดูไหม?”', distantEn: '“I escaped that wreck on my own. This time… shall we try trusting each other?”',
        choices: [choice('gift', 'รับของตอบแทน', 'Accept her thanks', 'ต้องเคยช่วยมิรา • รับยา HP กลาง 2 และ MP กลาง 1', 'Requires helping Mira • 2 Medium HP + 1 Medium MP Potion', { minTrust: 2, items: [{ id: 'p_hp_medium', qty: 2 }, { id: 'p_mp_medium', qty: 1 }] }), choice('trade', 'อุดหนุนร้านของเธอ', 'Support her shop', 'จ่าย 30 ทอง • รับยา HP กลาง 2 และ MP กลาง 1 • เพิ่มความไว้ใจ', 'Pay 30 gold • 2 Medium HP + 1 Medium MP Potion • earn trust', { goldCost: 30, trust: 1, items: [{ id: 'p_hp_medium', qty: 2 }, { id: 'p_mp_medium', qty: 1 }] }), choice('leave', 'อวยพรแล้วออกเดินทาง', 'Wish her well', 'เก็บทรัพยากรไว้ • เรื่องราวยังดำเนินต่อ', 'Keep your resources • her journey continues') ] },
      { floor: 48, icon: 'npcMiraLantern', prop: 'propLantern', title: 'สัญญาที่ไม่ดับแสง', titleEn: 'A Promise That Keeps Burning',
        text: 'เหนือถ้ำคริสตัล มิรารออยู่พร้อมเกวียนที่ซ่อมเสร็จ แสงตะเกียงสะท้อนประกายคล้ายดวงดาว\n“ฉันจะกลับบ้านแล้ว แต่แสงส่วนหนึ่งควรอยู่กับคนที่ยังเดินต่อ”', textEn: 'Beyond the crystal caverns, Mira waits with her restored cart. Her lantern shines like a captured star.\n“I am going home. But some of this light belongs with whoever keeps climbing.”',
        helped: 'เธอวางตะเกียงสำรองไว้ในมือคุณ “สัญญานะว่าจะกลับออกมาเหมือนกัน”', helpedEn: 'She places a spare lantern in your hands. “Promise you will find your way home too.”',
        choices: [choice('lantern', 'รับตะเกียงแห่งคำสัญญา', 'Take the promise lantern', 'ความไว้ใจ 2 • Relic: +10% MP สูงสุด และทองต่อสู้ +10%', 'Trust 2 • Relic: +10% max MP and +10% battle gold', { minTrust: 2, relic: 'mira_lantern' }), choice('supplies', 'รับเสบียงเดินทาง', 'Take travel supplies', 'ยา HP บริสุทธิ์ 2 และ MP สูงสุด 1 • ทุกคนเลือกได้', '2 Pristine HP + 1 Supreme MP Potion • available to all', { items: [{ id: 'p_hp_pristine', qty: 2 }, { id: 'p_mp_supreme', qty: 1 }] }), choice('farewell', 'ให้เธอเก็บทุกอย่างกลับบ้าน', 'Let her keep everything', 'ไม่รับรางวัล • ปิดเรื่องราวด้วยคำอำลา', 'No reward • part with a farewell') ] }
    ] },
    { id: 'orin', name: 'โอริน · นักรบธงขาด', nameEn: 'Orin · The Tattered Banner', icon: 'npcOrin', color: '#89c9df', chapters: [
      { floor: 8, icon: 'npcOrinHurt', prop: 'propBanner', title: 'ผู้เฝ้าธงที่ไม่มีใครกลับมา', titleEn: 'The Last Banner Watch', text: 'นักรบเกราะบุบนั่งพิงกำแพง มือยังจับธงที่ขาดวิ่น\n“หน่วยของข้าหายไปในชั้นบน ข้าจะกลับไปตามหา... แต่เกราะแบบนี้คงไปได้ไม่ไกล”', textEn: 'A battered knight rests against the wall, still holding a tattered banner.\n“My company vanished above. I will find them… though this broken armor will not take me far.”', choices: [choice('repair', 'ช่วยค่าซ่อมเกราะ', 'Fund his repairs', 'จ่าย 40 ทอง • ได้รับความไว้ใจ 2', 'Pay 40 gold • earn 2 trust', { goldCost: 40, trust: 2 }), choice('guide', 'แบ่งแผนที่ทางปลอดภัย', 'Share a safe route', 'ไม่มีค่าใช้จ่าย • ได้รับความไว้ใจ 1', 'No cost • earn 1 trust', { trust: 1 }), choice('leave', 'เดินต่ออย่างเงียบงัน', 'Walk on quietly', 'ยังไม่ผูกพันคำสัญญา', 'Make no promise') ] },
      { floor: 28, icon: 'npcOrin', prop: 'propBanner', title: 'ดาบอีกเล่มที่ประตูมืด', titleEn: 'Another Blade at the Dark Gate', text: 'เสียงดาบกระทบเกราะดังมาจากประตู โอรินยืนขวางเงามืดไว้ให้ผู้หลงทางหลบหนี\n“ข้าพบธงของพวกเขาแล้ว เหลือเพียงหน้าที่ที่ต้องทำให้จบ เจ้าจะให้ข้าช่วยเปิดทางไหม?”', textEn: 'Steel rings at the gate. Orin holds back the shadows so lost travelers can escape.\n“I found their banner. All that remains is to finish our duty. Will you let me help clear your path?”', helped: '“เจ้าช่วยให้ข้ายืนได้อีกครั้ง คราวนี้ถึงตาข้า”', helpedEn: '“You helped me stand again. Now it is my turn.”', choices: [choice('oath', 'ร่วมคำสัตย์นักรบ', 'Swear the oath', 'ความไว้ใจ 1 • โอรินช่วยโจมตีบอสใน 3 รอบแรกของแต่ละไฟต์', 'Trust 1 • Orin attacks in the first 3 rounds of boss fights', { minTrust: 1, support: 3 }), choice('reconcile', 'มอบเสบียงให้ผู้ลี้ภัย', 'Supply the refugees', 'จ่าย 120 ทอง • โอรินยอมร่วมคำสัตย์ แม้ไม่เคยช่วยมาก่อน', 'Pay 120 gold • earn his oath even without earlier help', { goldCost: 120, trust: 1, support: 3 }), choice('alone', 'ขอเดินทางด้วยตัวเอง', 'Continue alone', 'ไม่รับความช่วยเหลือในการต่อสู้', 'Decline battle support') ] },
      { floor: 68, icon: 'npcOrinStandard', prop: 'propBanner', title: 'คืนธงให้รุ่งอรุณ', titleEn: 'A Banner Returned to Dawn', text: 'โอรินปักธงที่เย็บใหม่เหนือสะพานลาวา ใต้ธงมีชื่อของเพื่อนร่วมหน่วยทุกคน\n“พวกเขากลับบ้านไม่ได้แล้ว แต่ข้ายังช่วยให้ใครสักคนกลับไปได้”', textEn: 'Orin plants his repaired banner above the lava bridge. Every lost companion’s name is sewn beneath it.\n“They cannot return home. But I can still help someone else make it back.”', choices: [choice('stand', 'ยืนเคียงข้างจนจบ', 'Stand beside him', 'เสีย HP 8% (ไม่ตาย) • Relic DEF/RES +8% • โอรินช่วยบอส 5 รอบแรก', 'Lose 8% max HP (nonlethal) • +8% DEF/RES relic • Orin aids the first 5 boss rounds', { hpCost: 0.08, trust: 1, relic: 'orin_standard', support: 5 }), choice('armor', 'รับเกราะที่ซ่อมไว้', 'Take the repaired armor', 'รับเกราะตะเกียงผู้พิทักษ์ • คำสัตย์เดิมยังคงอยู่', 'Receive Lantern Guard armor • any existing oath remains', { items: [{ id: 'a_steadfast', qty: 1 }] }), choice('farewell', 'ฝากคำอำลาไว้ใต้ธง', 'Leave a farewell', 'ไม่รับรางวัล • คำสัตย์เดิมยังคงอยู่', 'No reward • any existing oath remains') ] }
    ] },
    { id: 'lyra', name: 'ไลรา · นักจดดาว', nameEn: 'Lyra · Star Chronicler', icon: 'npcLyra', color: '#c3a3ec', chapters: [
      { floor: 13, icon: 'npcLyraLost', prop: 'propStarGate', title: 'แผนที่ที่ไม่มีท้องฟ้า', titleEn: 'A Map Without a Sky', text: 'เด็กสาวสวมหมวกดาวหมุนแผนที่กลับหัว เศษกระดาษเต็มไปด้วยภาพสัตว์ประหลาด\n“ถ้าหอคอยนี้แตะฟ้าได้จริง ฉันต้องเห็นดาวของแม่จากยอดมันแน่ ๆ... แต่ตอนนี้ฉันหลงทางแล้ว”', textEn: 'A young scholar in a star hat turns her map upside down. Her notes are filled with monster sketches.\n“If this tower truly reaches the sky, I can see Mother’s star from its summit… but I am lost.”', choices: [choice('decipher', 'ใช้เวทอ่านแผนที่ให้', 'Illuminate her map', 'ใช้ MP 15% ของค่าสูงสุด • ได้รับความไว้ใจ 2', 'Spend 15% max MP • earn 2 trust', { mpCost: 0.15, trust: 2 }), choice('mark', 'ทำเครื่องหมายบอกทาง', 'Mark a path', 'ไม่มีค่าใช้จ่าย • ได้รับความไว้ใจ 1', 'No cost • earn 1 trust', { trust: 1 }), choice('leave', 'เตือนให้เธอกลับลงไป', 'Urge her to turn back', 'เธอเก็บแผนที่ไว้ และคิดหาทางของตัวเอง', 'She keeps her map and seeks her own way') ] },
      { floor: 38, icon: 'npcLyra', prop: 'propStarGate', title: 'สมุดที่เริ่มมีคำตอบ', titleEn: 'A Journal Finding Answers', text: 'ไลรามีสมุดเล่มหนาขึ้น และไม่ถือแผนที่กลับหัวอีกแล้ว\n“ฉันเริ่มอ่านหอคอยออกแล้ว! สัตว์ประหลาดแต่ละตัวมีสิ่งที่กลัว ให้ฉันแบ่งสิ่งที่ค้นพบกับเธอสิ”', textEn: 'Lyra’s journal is thicker now, and her map is the right way up.\n“I am learning to read this tower! Every monster fears something. Let me share what I found.”', helped: '“หน้าที่เธอช่วยอ่านวันนั้น เป็นจุดเริ่มต้นของทุกอย่างเลย”', helpedEn: '“The page you helped me read was where all of this began.”', choices: [choice('research', 'แลกเปลี่ยนผลสำรวจ', 'Compare discoveries', 'ความไว้ใจ 1 • เปิดจุดอ่อน/ต้านของศัตรูปกติในโซนนี้ และฟื้น HP 30%', 'Trust 1 • reveal this zone’s regular enemy affinities and heal 30% HP', { minTrust: 1, research: true, heal: 0.3, trust: 1 }), choice('pages', 'ช่วยจัดเรียงหน้าสมุด', 'Help bind her journal', 'ไม่มีค่าใช้จ่าย • ได้รับยาชำระมลทิน 2 และความไว้ใจ 1', 'No cost • receive 2 Panaceas and earn 1 trust', { trust: 1, items: [{ id: 'p_panacea', qty: 2 }] }), choice('leave', 'ฝากเธอเขียนต่อให้จบ', 'Ask her to keep writing', 'เรื่องราวของเธอยังเดินหน้าต่อ', 'Her story keeps moving') ] },
      { floor: 88, icon: 'npcLyraAstral', prop: 'propStarGate', title: 'ดาวที่เห็นแม้ไม่มีฟ้า', titleEn: 'Stars Beyond the Sky', text: 'ไลรายืนใต้รอยแยกที่เต็มไปด้วยแสงดาว สมุดเล่มนั้นเขียนถึงหน้าสุดท้ายแล้ว\n“ฉันเจอดาวของแม่แล้ว มันไม่ได้อยู่ไกลบนฟ้า... มันอยู่ในทุกคนที่ช่วยให้ฉันเดินมาถึงตรงนี้”', textEn: 'Lyra stands beneath a rift filled with starlight. Her journal has reached its final page.\n“I found Mother’s star. It was never far above us… it lives in everyone who helped me reach this place.”', choices: [choice('astrolabe', 'รับเครื่องดูดาวของเธอ', 'Accept her astrolabe', 'ความไว้ใจ 2 • Relic เพิ่ม MAG/RES 8%', 'Trust 2 • relic grants +8% MAG/RES', { minTrust: 2, relic: 'lyra_astrolabe' }), choice('pages', 'รับหน้าสมุดที่คัดไว้', 'Take the copied pages', 'เปิดจุดอ่อน/ต้านของศัตรูปกติในโซนนี้ • ฟื้น HP 30%', 'Reveal this zone’s regular enemy affinities • heal 30% HP', { research: true, heal: 0.3 }), choice('farewell', 'ขอให้เธอเขียนชื่อคุณไว้', 'Ask her to remember you', 'ไม่รับรางวัล • ปิดหน้าสุดท้ายร่วมกัน', 'No reward • close the final page together') ] }
    ] }
  ];

  // ---- Clues: each NPC chapter reveals one piece of the main plot, shown after the choice ----
  var clues = {
    mira: [
      { clue: 'ไฟตะเกียงของมิรานิ่งสนิท ไม่แกว่งและไม่หรี่ลง แม้ลมจากหอคอยพัดจนกระดิ่งสั่นแรง ราวกับเวลาของมันไม่ได้เดินตามหอคอย',
        clueEn: 'Mira’s flame stays perfectly still, neither swaying nor dimming, even as the tower’s wind rattles her bell. As if its time does not follow the tower’s.' },
      { clue: 'เปลวตะเกียงเอียงชี้ขึ้นข้างบนเสมอ มิราบอกว่าบ้านของเธอไม่ได้หายไป แต่ถูกยกขึ้นไปทั้งหลังในคืนที่หอคอยผุดขึ้น',
        clueEn: 'Her flame always leans upward. Mira says her home did not vanish. It was lifted away whole, the night the tower rose.' },
      { clue: 'แสงของมิราจำได้เพียงรุ่งอรุณเดียว คือวันสุดท้ายก่อนหอคอยผุดขึ้น และมันกำลังชี้ไปทางเดียวกับเศษจันทราในมือเจ้า',
        clueEn: 'Her light remembers only one dawn, the last before the tower rose. It now points the same way as the Moon Shard in your hand.' }
    ],
    orin: [
      { clue: 'กองร้อยของโอรินเดินขึ้นไปเกินชั้น 50 ตามเสียงเพลงเดินแถวที่ดังมาจากเบื้องบน โดยไม่มีใครสั่งให้เดิน',
        clueEn: 'Orin’s company marched past floor 50, following a marching song drifting from above. No one gave the order.' },
      { clue: 'โอรินพบธงของกองร้อยแขวนอยู่ในผนังหิน ไม่มีศพ ไม่มีรอยต่อสู้ มีแต่เสียงฮัมเพลงเดินแถวแผ่ว ๆ ที่เขาจำได้',
        clueEn: 'Orin found his company’s banners hanging in the stone walls. No bodies, no signs of a fight, only a faint hum of the marching song he knows.' },
      { clue: 'ชื่อที่โอรินเย็บใต้ธงตรงกับรอยสลักบนศิลาของหอคอย เขาเชื่อว่าสหายไม่ได้ล้มตาย แต่ถูกใช้เป็นก้อนหินของมัน',
        clueEn: 'The names Orin sewed beneath the banner match carvings in the tower’s stones. He believes his comrades did not die. They were used as its bricks.' }
    ],
    lyra: [
      { clue: 'แม่ของไลราเป็นนักทำแผนที่ดาว ปีที่หอคอยผุดขึ้น ดวงดาวทุกดวงบนแผนที่ของแม่หยุดเคลื่อนที่พร้อมกัน',
        clueEn: 'Lyra’s mother charted the stars. The year the tower rose, every star on her charts stopped moving at once.' },
      { clue: 'ไลราจดไว้ว่าสัตว์ประหลาดทุกตัวกลัวสิ่งเดียวกัน คือ “วันพรุ่งนี้” พวกมันเหมือนเสี้ยววินาทีที่ถูกกักไว้ไม่ให้ไปต่อ',
        clueEn: 'Lyra notes that every monster fears the same thing: “tomorrow.” They seem like moments held back from ever moving on.' },
      { clue: 'ในแผนที่ของแม่ ดาวดวงเดียวที่ยังเคลื่อนอยู่คือแสงของคนที่ยังเชื่อ ไลราคิดว่ามันคือสิ่งเดียวที่ผู้เบื้องบนหยุดไม่ได้',
        clueEn: 'On her mother’s chart, one star still moves: the light of those who still believe. Lyra thinks it is the one thing the power above cannot stop.' }
    ]
  };
  arcs.forEach(function (arc) {
    arc.chapters.forEach(function (chapter, i) { chapter.clue = clues[arc.id][i].clue; chapter.clueEn = clues[arc.id][i].clueEn; });
  });

  D.story = {
    arcs: arcs,
    totalChapters: 3,

    // ---- Intro + ending screens. The ending is assembled in order: base[0..], the NPC
    // epilogues, the truth paragraph (only if every fragment was found), then closing. ----
    screens: {
      intro: {
        title: 'หอคอยแห่งความมืด', titleEn: 'The Darkness Tower',
        btn: 'เริ่มการเดินทาง', btnEn: 'Begin the Journey',
        body: [
          'เงามืดปกคลุมแผ่นดินมานานนับทศวรรษ นับตั้งแต่หอคอยแห่งความมืดผุดขึ้นกลางราตรี ดูดกลืนแสงจันทร์และความหวังของผู้คนไปทีละน้อย',
          'หมู่บ้านรอบหอคอยล่มสลาย พืชผลเหี่ยวเฉา เสียงหอนของสัตว์ร้ายดังก้องอยู่ในความมืด ไม่มีใครที่เดินเข้าไปในหอคอยแล้วกลับออกมาอีกเลย',
          'เจ้าเติบโตในหมู่บ้านตะเกียงสุดท้าย หมู่บ้านที่อยู่ใกล้ตีนหอคอยที่สุด คืนที่หอคอยผุดขึ้น ผู้จุดตะเกียงซึ่งเลี้ยงดูเจ้ามาหยิบตะเกียงเดินเข้าประตูหอคอยไปโดยไม่หันกลับมา ทิ้งไว้เพียง “เศษจันทรา” ชิ้นเล็กที่ยังอุ่นอยู่ในมือของเจ้า',
          'ตลอดสิบปี เศษจันทราส่องแสงจาง ๆ ทุกครั้งที่เจ้าเข้าใกล้ความจริง เจ้าไม่ใช่คนธรรมดา เจ้าคือผู้ถือแสงคนสุดท้ายที่ยังเชื่อว่ารุ่งอรุณจะหวนคืน เจ้าก้าวเข้าประตูหอคอยเพื่อตามหาผู้ที่ไม่เคยกลับมา... และนำแสงสว่างคืนสู่โลกอีกครั้ง'
        ],
        bodyEn: [
          'Darkness has choked the land for a decade, ever since the Darkness Tower rose in the dead of night, devouring moonlight and hope alike, piece by piece.',
          'The villages around it withered. Crops rotted in the fields. The howls of monsters echo through the dark, and no one who has entered the tower has ever returned.',
          'You grew up in Last Lamp, the village nearest the tower’s foot. The night the tower rose, the Lamplighter who raised you took a lantern and walked through its gate without looking back, leaving only a “Moon Shard” still warm in your hand.',
          'For ten years the Shard has glowed faintly whenever you drew near the truth. You are no ordinary soul. You are the last Lightbearer who still believes the dawn will return. You step through the gate to find the one who never came back... and to bring the light home.'
        ]
      },
      ending: {
        title: 'รุ่งอรุณแห่งสันติภาพ', titleEn: 'Dawn of Peace',
        btn: 'ดำเนินการต่อ', btnEn: 'Continue',
        // Paragraphs before the NPC epilogues
        body: [
          'อธิราชไร้กาลล้มลงต่อหน้าเจ้า คำสุดท้ายของมันไม่ใช่คำสาป แต่เป็นเสียงกระซิบแผ่วเบา “ข้าเพียงไม่อยากให้วันสุดท้ายมาถึง” แล้วความมืดที่ปกคลุมหอคอยทั้งหลังก็สลายไปพร้อมเสียงนั้น',
          'เจ้าเคยเชื่อว่าผู้เฝ้าประตูชั้น 50 คือปลายทางของหอคอย แต่ราชันเงาเป็นเพียงกุญแจ ส่วนผู้ที่ขังโลกไว้ในวันเดียวรออยู่ที่บัลลังก์ชั้น 100 มาตลอด',
          'หินทุกก้อนของหอคอยเริ่มแตกร้าวเป็นแสง ชื่อนับพันที่ถูกสลักไว้ลอยออกมาเป็นละอองดาวขึ้นสู่ท้องฟ้า ราวกับทุกชีวิตที่ถูกกักไว้ในศิลาได้กลับบ้านพร้อมกัน',
          'ในแสงนั้น เศษจันทราในมือเจ้าอุ่นขึ้นเป็นครั้งสุดท้ายแล้วค่อย ๆ มอดลง ไกลออกไปที่ขอบฟ้า ตะเกียงดวงหนึ่งสว่างขึ้นที่หน้าต่างบ้านหลังเก่าในหมู่บ้านตะเกียงสุดท้าย เหมือนมีใครเพิ่งกลับมาจุดมันอีกครั้ง'
        ],
        bodyEn: [
          'The Timeless Sovereign collapses before you. Its last words are not a curse but a whisper: “I only did not want the last day to come.” The darkness that smothered the whole tower dissolves with that voice.',
          'You once believed the keeper of the floor-50 gate was the tower’s final secret. But the Shadow Demon Lord was only a lock. The one who trapped the world in a single day had waited on the throne at floor 100 all along.',
          'Every stone of the tower cracks with light. The thousands of names carved into it rise as stardust into the sky, as if every life held in the walls were going home at once.',
          'In that glow, the Moon Shard in your hand warms one final time, then slowly fades. Far on the horizon, a lamp lights in the window of an old house in Last Lamp, as if someone had just come back to kindle it.'
        ],
        // Paragraphs after the NPC epilogues and truth paragraph
        closing: [
          'รุ่งเช้าวันใหม่ แสงอาทิตย์ส่องทะลุเมฆหมอกที่ปกคลุมแผ่นดินมานานนับทศวรรษ หมู่บ้านรอบข้างได้ยินเสียงนกร้องอีกครั้ง พืชผลผลิใบเขียวขจี และผู้คนต่างมองขึ้นไปยังจุดที่หอคอยเคยตั้งตระหง่าน ด้วยรอยยิ้มแห่งความหวัง',
          'เจ้าได้กลายเป็นตำนาน... วีรบุรุษผู้ไต่หอคอยทั้ง 100 ชั้น และนำแสงสว่างกับสันติภาพกลับคืนสู่โลกอีกครั้ง'
        ],
        closingEn: [
          'At dawn, sunlight breaks through clouds that have loomed over the land for a decade. Birdsong returns to the villages nearby, crops bloom green once more, and the people look up to where the tower once stood, smiling with hope.',
          'You have become legend... the hero who climbed all 100 floors and brought light and peace back to the world.'
        ]
      }
    },

    // ---- Lore fragments: shown the first time you reach `floor` (or the next floor you
    // enter if it was missed). kind only changes the label; icon is any Icons id. ----
    lore: [
      { id: 'lamplighter_note', floor: 10, kind: 'letter', icon: 'scroll',
        title: 'เศษจดหมายของผู้จุดตะเกียง', titleEn: 'A Scrap of the Lamplighter’s Letter',
        text: 'กระดาษเปื้อนเขม่าติดอยู่กับเสาหิน ลายมือที่เจ้าคุ้นเคยเขียนไว้อย่างรีบร้อน\n“ถ้ามีใครเก็บจดหมายนี้ได้ ข้าไม่ได้หลงเข้ามา ข้าเลือกเอง หอคอยนี้ไม่ได้ขโมยแสงไป มันกำลัง ‘เก็บ’ ไว้ที่ใดที่หนึ่งข้างบน\nข้าจะขึ้นไปให้สุดทาง ถ้าเจ้าตามมา เศษจันทราจะบอกทางเอง”\nเศษจันทราในมือเจ้าอุ่นขึ้นเล็กน้อย',
        textEn: 'A soot-stained scrap clings to a stone pillar, written in a hand you know, in a hurry.\n“If anyone finds this: I did not wander in. I chose to. The tower has not stolen the light. It is keeping it somewhere above.\nI will climb to the very end. If you follow, the Moon Shard will show the way.”\nThe Moon Shard in your hand grows slightly warmer.' },
      { id: 'wall_inscription', floor: 25, kind: 'inscription', icon: 'tome',
        title: 'จารึกบนผนัง', titleEn: 'Inscription on the Wall',
        text: 'รอยสลักโบราณเรียงเป็นแถวบนผนังหิน\n“ก่อนมีหอคอย มีราชันผู้รักษารุ่งอรุณ ท่านจุดแสงให้ทุกวันเริ่มต้นใหม่ได้ ท่านรักโลกนี้มากเสียจนไม่อาจทนเห็นวันใดวันหนึ่งสิ้นสุดลง”\nบรรทัดถัดไปถูกขูดทิ้งจนอ่านไม่ออก',
        textEn: 'Ancient carvings run in rows across the stone wall.\n“Before the tower, there was a sovereign, Keeper of the Dawn, who lit the light that let every day begin anew. It loved the world so much that it could not bear to see a single day end.”\nThe next line has been scraped away until it cannot be read.' },
      { id: 'builders_page', floor: 40, kind: 'letter', icon: 'scroll',
        title: 'หน้าบันทึกของผู้สร้าง', titleEn: 'A Builder’s Torn Page',
        text: 'หน้ากระดาษเก่าฉีกขาด ลายมือเร่งรีบของช่างก่อสร้าง\n“หอคอยมีสองครึ่ง ครึ่งล่างเราสร้างทีหลัง เพื่อเป็นกรงครอบครึ่งบนที่ถูกผนึกไว้ ประตูผนึกอยู่ที่ชั้น 50 และผู้เฝ้าประตูถูกตั้งนามว่า ‘ราชันเงา’\nข้าไม่แน่ใจเลยว่าเราขังสิ่งนั้นไว้ข้างบน หรือขังตัวเราเองไว้ข้างล่าง”',
        textEn: 'A torn old page in a builder’s hurried hand.\n“The tower has two halves. We built the lower one later, as a cage over the sealed upper half. The seal-gate is at floor 50, and its keeper was given the name ‘Shadow Demon Lord.’\nI am no longer sure whether we locked that thing in above, or ourselves in below.”' },
      { id: 'shadow_last_words', floor: 51, kind: 'voice', icon: 'skull',
        title: 'เสียงสุดท้ายของราชันเงา', titleEn: 'The Shadow’s Last Words',
        text: 'ทูตแห่งเลวีอาธานเป็นเพียงร่างสุดท้ายที่เงาใช้พูดกับเจ้า เมื่อมันสลายไป เสียงทุ้มต่ำก็ก้องออกมาจากรอยแตกของประตูผนึก\n“ข้าไม่เคยเป็นเจ้าของหอคอยนี้ ข้าเป็นแค่กุญแจ ข้าเฝ้าประตูนี้นานจนลืมไปแล้วว่าเฝ้าเพื่ออะไร\nก่อนเจ้า มีผู้ถือตะเกียงผ่านประตูนี้ไปคนหนึ่ง ข้าไม่ได้ขวางเขา\nเบื้องบนไม่มีขุมทรัพย์ ไม่มีบัลลังก์ของข้า มีแต่ผู้ที่ไม่ยอมให้เวลาเดินต่อ ขึ้นไปเถอะ ผู้ถือแสง... และอย่าให้มันปลอบเจ้า มันปลอบข้ามาแล้ว”\nประตูผนึกเปิดออก เศษจันทราสั่นไหวในมือเจ้า',
        textEn: 'The Leviathan’s Herald was only the last form the Shadow used to speak to you. As it fades, a low voice echoes from the cracks of the seal-gate.\n“I never owned this tower. I was only the lock. I guarded this gate so long I forgot what for.\nBefore you, someone carrying a lantern passed through. I did not stop them.\nAbove there is no treasure and no throne of mine. Only the one who will not let time move on. Climb, Lightbearer... and do not let it comfort you. It comforted me.”\nThe seal-gate swings open. The Moon Shard trembles in your hand.' },
      { id: 'stone_names', floor: 60, kind: 'inscription', icon: 'tome',
        title: 'ชื่อบนศิลา', titleEn: 'Names in the Stone',
        text: 'เมื่อเจ้าแตะผนังหิน มันอุ่นผิดธรรมชาติ ภายในมีเสียงฮัมเป็นจังหวะเดียวกับเพลงเดินแถว\nรอยสลักเล็ก ๆ นับพันเรียงกันเป็นชื่อคน ทหาร พ่อค้า นักปราชญ์ เด็กจากหมู่บ้านข้างเคียง\nหอคอยนี้ไม่ได้สร้างด้วยหินอย่างเดียว มันถูกก่อด้วยเวลาและชีวิตที่ถูกยึดไว้ ทีละก้อน',
        textEn: 'The wall is unnaturally warm under your hand, and inside it hums a rhythm like a marching song.\nThousands of tiny carvings form names: soldiers, merchants, scholars, children from nearby villages.\nThis tower is not built of stone alone. It is laid with time and lives taken, one brick at a time.' },
      { id: 'lamplighter_second', floor: 75, kind: 'letter', icon: 'scroll',
        title: 'จดหมายฉบับที่สอง', titleEn: 'The Second Letter',
        text: 'จดหมายฉบับนี้ใช้ลายมือเดิม แต่เบาและสั่นเทากว่าฉบับแรกมาก\n“ข้ามาถึงชั้นนี้ แต่ไปต่อไม่ไหวแล้ว อธิราชไร้กาลไม่ได้ฆ่าใคร มันแค่ขอให้เราอยู่ ‘ตรงนี้’ ต่อไปเรื่อย ๆ ข้าเป็นตะเกียงของมันแล้ว ไฟของข้าช่วยให้หอคอยสว่างพอจะเก็บแสงจันทร์ไว้ได้\nถ้าเจ้าอ่านจดหมายนี้ อย่าเสียใจและอย่าหยุดเดิน เศษจันทราที่ข้าทิ้งไว้ให้ คือส่วนของแสงที่มันยึดไม่ได้”',
        textEn: 'The same handwriting, but far lighter and shakier than the first letter.\n“I made it this far, but cannot go on. The Timeless Sovereign kills no one. It only asks us to stay right here, forever. I am its lamp now. My fire helps the tower stay bright enough to hold the moonlight.\nIf you read this, do not grieve and do not stop. The Moon Shard I left you is a piece of the light it could not take.”' },
      { id: 'sovereign_echo', floor: 90, kind: 'voice', icon: 'star',
        title: 'เสียงก้องจากเบื้องบน', titleEn: 'An Echo from Above',
        text: 'เสียงนุ่มลึกดังก้องผ่านทางเดิน ไม่มีความเกลียดชังแม้แต่น้อย\n“ข้าไม่ได้ต้องการให้เจ้าตาย ข้าต้องการให้เจ้าอยู่ ที่นี่ไม่มีใครแก่ ไม่มีใครสูญเสีย ไม่มีวันสุดท้าย เหตุใดเจ้าจึงอยากไปต่อ”\nเศษจันทราเย็นลงชั่วครู่ แล้วค่อย ๆ อุ่นขึ้นอีกครั้ง ราวกับตอบกลับไปเอง',
        textEn: 'A deep, gentle voice echoes down the corridor, with no hatred in it at all.\n“I do not want you dead. I want you to stay. Here no one grows old, no one is lost, no last day comes. Why would you wish to go on?”\nThe Moon Shard chills for a moment, then slowly warms again, as if answering for itself.' },
      { id: 'throne_gate', floor: 100, kind: 'voice', icon: 'towerSpire',
        title: 'ก่อนถึงบัลลังก์', titleEn: 'Before the Throne',
        text: 'ที่ปลายทางเดิน ตะเกียงนับพันดวงลอยเรียงกันเหมือนดวงดาว เจ้าจำดวงหนึ่งได้ทันที ผู้จุดตะเกียงยังอยู่ตรงนั้น เปลวไฟนิ่งสนิท ยิ้มเหมือนรอเจ้ามานาน\nเศษจันทราสว่างวาบ เสียงจากบัลลังก์ดังขึ้น\n“เจ้ามาแล้ว ช้าไปสิบปี... และเร็วไปหนึ่งวัน”',
        textEn: 'At the end of the hall, a thousand lamps float in rows like stars. You recognize one at once. The Lamplighter is there, flame perfectly still, smiling as if they had waited a long time for you.\nThe Moon Shard flares. A voice speaks from the throne.\n“You have come. Ten years late... and one day too early.”' }
    ],

    // ---- Epilogues: one paragraph per NPC chosen by trust. `bonded` needs trust >= 2
    // (the same bar the chapter dialogue uses); `oath` is appended for Orin if he
    // swore to fight beside you. ----
    epilogues: {
      mira: {
        bonded: 'ที่หน้าต่างหมู่บ้านเก่า มิราจุดตะเกียงเคียงข้างตะเกียงของผู้จุดตะเกียง เธอฝากโคมเล็กอีกดวงไว้ที่ธรณีประตูบ้านเจ้า “ฉันบอกแล้วว่าเราจะได้พบกันอีก”',
        bondedEn: 'At the old village window, Mira lights her lantern beside the Lamplighter’s. She leaves a small spare at your doorstep. “I told you we would meet again.”',
        distant: 'บนถนนสายใหม่ เสียงกระดิ่งเกวียนของมิราดังแว่วมาแต่ไกล เธอเดินทางกลับบ้านด้วยแสงของตัวเอง และไม่ลืมโบกมือให้หอคอยที่กำลังสลาย',
        distantEn: 'Far down the new road, Mira’s cart bell rings. She travels home by her own light, and waves once at the crumbling tower.'
      },
      orin: {
        bonded: 'ใต้ธงที่ปักไว้บนซากหอคอย โอรินยืนตรงเมื่อชื่อสหายทุกคนลอยขึ้นเป็นแสง เขาทำความเคารพเจ้าและกระซิบ “หน้าที่ของพวกเรา จบแล้ว”',
        bondedEn: 'Beneath the banner planted on the tower’s ruins, Orin stands tall as every comrade’s name rises as light. He salutes you and whispers, “Our duty is done.”',
        oath: ' เขาไม่ได้เก็บดาบ “เมื่อใดที่เจ้าเรียก ธงนี้จะเดินมาเอง”',
        oathEn: ' He does not sheathe his sword. “Whenever you call, this banner will march.”',
        distant: 'บนเนินไกล ๆ โอรินยืนมองละอองดาวลอยขึ้นฟ้า เขาเดินกลับบ้านโดยลำพัง พร้อมธงขาดเก่าผืนเดิมที่ยังไม่ได้ซ่อม',
        distantEn: 'On a distant hill, Orin watches the stardust rise. He walks home alone, the old tattered banner still unmended in his hands.'
      },
      lyra: {
        bonded: 'ไลราวางสมุดหน้าสุดท้ายลงแล้วเงยหน้ามองฟ้ายามรุ่งสาง ดาวดวงสุดท้ายกำลังจางหาย “ฉันเขียนชื่อเธอไว้ในทุกหน้าเลยนะ เผื่อวันไหนฉันลืม ดาวจะได้จำให้แทน”',
        bondedEn: 'Lyra sets down her final page and looks up at the dawn sky as the last star fades. “I wrote your name on every page, in case I ever forget. The stars will remember for me.”',
        distant: 'ไลราเปิดสมุดเล่มใหม่ หน้าแรกเขียนไว้ว่า “ดวงดาวเริ่มเคลื่อนที่อีกครั้ง” เธอยังไม่รู้ชื่อทุกดวง แต่เธอมีทั้งชีวิตที่จะเรียนรู้มัน',
        distantEn: 'Lyra opens a fresh journal. The first line reads: “The stars are moving again.” She does not know all their names yet, but she has a lifetime to learn them.'
      }
    },

    // ---- Truth paragraph: added to the ending only if every lore fragment was found ----
    truth: 'เจ้ารู้ทุกอย่างที่หอคอยพยายามปิดบัง ดังนั้นเมื่ออธิราชไร้กาลสลายไป เจ้าจึงไม่ได้จดจำมันในฐานะอสูรกาย แต่ในฐานะผู้ที่รักวันเวลามากเกินไป และเศษจันทราคือสิ่งเดียวที่ช่วยให้มันได้พักเสียที',
    truthEn: 'You learned everything the tower tried to hide. So as the Timeless Sovereign fades, you remember it not as a monster, but as one who loved the days too much, and the Moon Shard as the one thing that finally let it rest.'
  };

  // ---- Story-only relics (granted by NPC choices) ----
  D.relics.push(
    { id: 'mira_lantern', name: 'ตะเกียงแห่งคำสัญญา', nameEn: 'Promise Lantern', icon: 'propLantern', storyOnly: true, statKey: 'mp', statAmount: 0.1, economy: 'gold', economyAmount: 0.1, desc: '+10% MP สูงสุด และทองจากการต่อสู้ +10%', descEn: '+10% max MP and +10% battle gold' },
    { id: 'orin_standard', name: 'ธงแห่งรุ่งอรุณ', nameEn: 'Dawn Standard', icon: 'propBanner', storyOnly: true, statKey: ['def', 'res'], statAmount: 0.08, desc: '+8% DEF/RES ตลอดการเดินทาง', descEn: '+8% DEF/RES for this run' },
    { id: 'lyra_astrolabe', name: 'เครื่องดูดาวแห่งความทรงจำ', nameEn: 'Memory Astrolabe', icon: 'propStarGate', storyOnly: true, statKey: ['mag', 'res'], statAmount: 0.08, desc: '+8% MAG/RES ตลอดการเดินทาง', descEn: '+8% MAG/RES for this run' }
  );
})();
