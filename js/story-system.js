// Persistent, choice-driven NPC arcs. Story state belongs to a single tower run.
(function () {
  var G = window.Game, D = G.Data, S = G.State;
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
  D.relics.push(
    { id: 'mira_lantern', name: 'ตะเกียงแห่งคำสัญญา', nameEn: 'Promise Lantern', icon: 'propLantern', storyOnly: true, statKey: 'mp', statAmount: 0.1, economy: 'gold', economyAmount: 0.1, desc: '+10% MP สูงสุด และทองจากการต่อสู้ +10%', descEn: '+10% max MP and +10% battle gold' },
    { id: 'orin_standard', name: 'ธงแห่งรุ่งอรุณ', nameEn: 'Dawn Standard', icon: 'propBanner', storyOnly: true, statKey: ['def', 'res'], statAmount: 0.08, desc: '+8% DEF/RES ตลอดการเดินทาง', descEn: '+8% DEF/RES for this run' },
    { id: 'lyra_astrolabe', name: 'เครื่องดูดาวแห่งความทรงจำ', nameEn: 'Memory Astrolabe', icon: 'propStarGate', storyOnly: true, statKey: ['mag', 'res'], statAmount: 0.08, desc: '+8% MAG/RES ตลอดการเดินทาง', descEn: '+8% MAG/RES for this run' }
  );
  function ensure(run) {
    if (!run.story) run.story = { people: {}, active: null, lastFloor: 0 };
    if (!run.story.people) run.story.people = {};
    arcs.forEach(function (arc) { if (!run.story.people[arc.id]) run.story.people[arc.id] = { chapter: 0, trust: 0, history: [], lastFloor: 0 }; });
    return run.story;
  }
  function getArc(id) { return arcs.find(function (arc) { return arc.id === id; }) || null; }
  function next(run, floor) {
    var story = ensure(run);
    if (story.active) {
      var activeArc = getArc(story.active.id);
      if (activeArc && story.people[activeArc.id].chapter === story.active.chapter) return { arc: activeArc, chapter: activeArc.chapters[story.active.chapter], index: story.active.chapter, floor: story.active.floor };
      story.active = null;
    }
    if (floor !== run.currentFloor || floor >= 100 || story.lastFloor === floor) return null;
    var eligible = arcs.filter(function (arc) {
      var state = story.people[arc.id], chapter = arc.chapters[state.chapter];
      return chapter && floor >= chapter.floor && (!state.lastFloor || floor - state.lastFloor >= 5);
    }).sort(function (a, b) { return a.chapters[story.people[a.id].chapter].floor - b.chapters[story.people[b.id].chapter].floor; });
    if (!eligible.length) return null;
    var arc = eligible[0], index = story.people[arc.id].chapter;
    return { arc: arc, chapter: arc.chapters[index], index: index, floor: floor };
  }
  function begin(run, floor) {
    var event = next(run, floor);
    if (!event) return null;
    ensure(run).active = { id: event.arc.id, chapter: event.index, floor: event.floor };
    S.saveNow(); return event;
  }
  function availability(run, arcId, option) {
    var state = ensure(run).people[arcId];
    if (!state || !option) return false;
    return state.trust >= (option.minTrust || 0) && run.gold >= (option.goldCost || 0) &&
      (!option.itemCost || (run.inventory[option.itemCost] || 0) >= 1) &&
      (!option.hpCost || run.hp > Math.max(1, Math.round(S.getMaxHp(run) * option.hpCost))) &&
      (!option.mpCost || run.mp >= Math.max(1, Math.round(S.getMaxMp(run) * option.mpCost)));
  }
  function resolve(run, arcId, choiceId) {
    var story = ensure(run), active = story.active, arc = getArc(arcId);
    if (!active || !arc || active.id !== arcId || active.floor !== run.currentFloor) return null;
    var state = story.people[arcId], chapter = arc.chapters[state.chapter];
    if (active.chapter !== state.chapter || !chapter) return null;
    var option = chapter.choices.find(function (c) { return c.id === choiceId; });
    if (!availability(run, arcId, option)) return null;
    if (option.goldCost) S.spendGold(run, option.goldCost);
    if (option.hpCost) run.hp -= Math.max(1, Math.round(S.getMaxHp(run) * option.hpCost));
    if (option.mpCost) run.mp -= Math.max(1, Math.round(S.getMaxMp(run) * option.mpCost));
    if (option.itemCost) S.removeItem(run, option.itemCost, 1);
    (option.items || []).forEach(function (item) { S.addItem(run, item.id, item.qty); });
    if (option.relic) S.addRelic(run, option.relic);
    if (option.heal) run.hp = Math.min(S.getMaxHp(run), run.hp + Math.round(S.getMaxHp(run) * option.heal));
    if (option.research) D.getEnemiesByTier(G.Formulas.tierForFloor(run.currentFloor)).forEach(function (enemy) { S.recordEnemySeen(enemy.id); G.Systems.discover({ templateId: enemy.id }, enemy.weak); G.Systems.discover({ templateId: enemy.id }, enemy.resist); });
    state.trust += option.trust || 0;
    if (option.support) story.orinRounds = Math.max(story.orinRounds || 0, option.support);
    state.history.push({ chapter: state.chapter, choice: option.id, floor: run.currentFloor });
    state.chapter += 1; state.lastFloor = run.currentFloor;
    story.lastFloor = run.currentFloor; story.active = null;
    S.saveNow(); return { arc: arc, chapter: chapter, option: option };
  }
  function supportRounds(run) { return ensure(run).orinRounds || 0; }
  G.Story = { arcs: arcs, ensure: ensure, getArc: getArc, next: next, begin: begin, availability: availability, resolve: resolve, supportRounds: supportRounds };
})();
