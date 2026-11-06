// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Companion bonds: fighting beside a companion raises an account-wide bond
// (meta.bonds). Bond level 2 unlocks that companion's Duo Move -- one extra
// command per battle whose effect follows the companion's role -- and level 3
// strengthens it and opens the final bond story. Every companion is tied to one
// of the travelling NPCs (story-system.js): a companion whose NPC you have
// befriended in the current run (trust >= 2) hits a little harder.
(function () {
  var G = window.Game, D = G.Data, F = G.Formulas;
  var LEVEL_AT = [0, 6, 14]; // bond points needed for level 1 / 2 / 3
  function text(th, en) { return G.I18n.getLang() === 'en' ? en : th; }

  function bond(npc, duoTh, duoEn, s2, s2En, s3, s3En, npcTh, npcEn) {
    return { npc: npc, duo: { name: duoTh, nameEn: duoEn }, stories: [
      { text: s2, textEn: s2En }, { text: s3, textEn: s3En }], npcLine: { text: npcTh, textEn: npcEn } };
  }
  var BONDS = {
    ember_fox: bond('orin', 'พุ่งเปลวคู่ใจ', 'Twin Flame Dive',
      'จิ้งจอกเริ่มนอนขดข้างเท้าคุณหลังศึก ขนมันอุ่นพอจะไล่ความหนาวของหอคอยได้', 'After battle the fox now curls at your feet. Its fur is warm enough to chase off the tower chill.',
      'มันคาบเศษธงสีขาดมาวางตรงหน้า... เหมือนจะบอกว่า "ฉันจะอยู่ตรงนี้ ไม่ว่าธงใครจะขาด"', 'It lays a scrap of torn banner at your feet, as if to say: "I stay, whoever\'s banner falls."',
      'โอรินมองจิ้งจอกแล้วยิ้ม “สัตว์ที่ไม่ทิ้งหน่วย... ข้ารู้จักความหมายนั้นดี”', 'Orin looks at the fox and smiles. "A creature that never abandons its unit… I know that meaning well."'),
    dawn_owl: bond('lyra', 'ดวงตาแห่งอรุณ', 'Dawnlit Gaze',
      'นกฮูกเกาะบนไหล่คุณระหว่างพักและหมุนหัวตามเสียงแผนที่ที่คุณพับ', 'The owl perches on your shoulder at camp, head turning to the rustle of your folding map.',
      'มันชี้ปากไปทางรอยร้าวบนฝ้าเพดาน ที่แสงดาวรั่วลงมาเป็นเส้นบาง ๆ', 'It points its beak at a crack in the ceiling where starlight leaks down in a thin line.',
      'ไลราจดลงสมุด “นกฮูกของคุณอ่านดาวได้เร็วกว่าฉันอีก!”', 'Lyra scribbles in her journal. "Your owl reads the stars faster than I do!"'),
    stoneheart_bear: bond('orin', 'กำแพงหัวใจศิลา', 'Stoneheart Bulwark',
      'หมีเริ่มเดินด้านหน้าคุณในทางแคบ โดยไม่มีใครสั่ง', 'The bear starts walking ahead of you in narrow corridors, unprompted.',
      'มันวางอุ้งมือใหญ่บนไหล่คุณเบา ๆ ก่อนก้าวเข้าห้องบอส', 'It rests a heavy paw on your shoulder before you step into a boss chamber.',
      'โอรินพยักหน้าให้ “ผู้พิทักษ์ที่แท้ไม่จำเป็นต้องมีธง”', 'Orin nods. "A true guardian needs no banner."'),
    storm_sprite: bond('lyra', 'ประกายสายฟ้าพิสดาร', 'Starstorm Spark',
      'เอลฟ์น้อยเริ่มวาดแผนผังดาวด้วยประกายไฟบนอากาศ', 'The little sprite begins tracing star charts in sparks upon the air.',
      'ประกายของมันเรียงเป็นกลุ่มดาวที่ไม่มีบนแผนที่ใด ๆ', 'Its sparks arrange themselves into a constellation found on no map.',
      'ไลราสะดุ้ง “นั่นคือกลุ่มดาวของแม่ฉัน! มันรู้ได้ยังไง?”', 'Lyra gasps. "That is my mother\'s constellation! How does it know?"'),
    sand_scarab: bond('mira', 'ประกายปีกทอง', 'Gilded Wing Flash',
      'แมลงปีกแข็งเกาะที่ตะเกียงของคุณ ปีกมันสะท้อนแสงเป็นสีทอง', 'The scarab clings to your lantern, its wings catching golden light.',
      'มันเริ่มนำทางไปยังหีบที่ซ่อนอยู่ ราวกับรู้ว่าคุณเก็บของเก่งแค่ไหน', 'It begins leading you to hidden chests, as though it knows how you love a find.',
      'มิรายิ้ม “พ่อค้าที่ดีมีเพื่อนที่ไว้ใจได้ และมีแมลงที่ตาไวด้วย”', 'Mira grins. "A good merchant needs trustworthy friends - and a sharp-eyed beetle."'),
    frost_hare: bond('mira', 'กระโดดพิรุณน้ำแข็ง', 'Frostmist Leap',
      'กระต่ายน้ำแข็งนอนในกระเป๋าเสื้อของคุณ ทำให้ยาที่พกไม่เคยร้อนเกินไป', 'The frost hare naps in your coat pocket, keeping your potions pleasantly cool.',
      'มันดันขวดยาที่ใกล้หมดมาใกล้มือคุณทุกครั้งที่ HP ต่ำ', 'It nudges your last potion toward your hand whenever your HP runs low.',
      'มิราหัวเราะ “ถ้ามันขายได้ ฉันคงให้ราคาสูงสุด แต่ฉันรู้ว่ามันไม่ขาย”', 'Mira laughs. "If it were for sale I would name my highest price - but I know it is not."'),
    iron_golem_cub: bond('orin', 'เกราะเหล็กผนึกกาย', 'Ironbound Aegis',
      'ลูกโกเลมเลียนแบบท่าตั้งการ์ดของคุณ ช้ากว่าสองจังหวะ', 'The golem cub copies your guard stance, two beats too late.',
      'วันนี้มันตั้งการ์ดก่อนคุณ เป็นครั้งแรก', 'Today, for the first time, it raises its guard before you do.',
      'โอรินวางมือบนเกราะมัน “พร้อมจะรับดาบแทนใครสักคน... เหมือนที่ข้าเคยทำ”', 'Orin rests a hand on its plating. "Ready to take a blade for someone - just as I once did."')
  };

  function meta() { return G.Save.readMeta(); }
  function points(id) { return ((meta().bonds || {})[id]) || 0; }
  function levelFor(pts) { var lv = 1; LEVEL_AT.forEach(function (n, i) { if (pts >= n) lv = i + 1; }); return lv; }
  function level(id) { return levelFor(points(id)); }
  function info(id) { return BONDS[id] || null; }
  function progress(id) {
    var pts = points(id), lv = levelFor(pts), next = LEVEL_AT[lv] == null ? null : LEVEL_AT[lv];
    return { points: pts, level: lv, next: next, max: next == null };
  }

  // Win a battle with a companion at your side => bond grows (mini-boss floors
  // count double, the final boss triple).
  function award(run, battle) {
    var id = run && run.companionId;
    if (!id || !BONDS[id] || !battle || !battle.victory) return null;
    var m = meta();
    m.bonds = m.bonds || {};
    var before = m.bonds[id] || 0;
    var gain = battle.isBoss ? 3 : (battle.floor % 5 === 0 ? 2 : 1);
    m.bonds[id] = before + gain;
    G.Save.writeMeta(m);
    var lvAfter = levelFor(before + gain);
    return { id: id, gained: gain, points: before + gain, level: lvAfter, leveled: lvAfter > levelFor(before) };
  }

  function npcTrust(run, npc) {
    var arc = run && run.story && run.story.people && run.story.people[npc];
    return arc && arc.chapter > 0 ? arc.trust : 0;
  }
  function npcLineFor(run, id) {
    var b = BONDS[id];
    if (!b) return null;
    var arc = run && run.story && run.story.people && run.story.people[b.npc];
    return arc && arc.chapter > 0 ? b.npcLine : null;
  }
  function story(id, lv, run) {
    var b = BONDS[id], c = D.getCompanion(id);
    if (!b || !c || lv < 2) return null;
    return { companion: c, level: lv, text: b.stories[Math.min(lv, 3) - 2], npcLine: lv >= 3 ? npcLineFor(run, id) : null, npc: b.npc };
  }

  function mult(run, id) {
    var m = level(id) >= 3 ? 1.35 : 1;
    if (npcTrust(run, BONDS[id].npc) >= 2) m *= 1.1;
    return m;
  }

  // The state of the Duo command for this battle (null => no button at all).
  function duoFor(battle) {
    if (!battle || !battle.companion || !BONDS[battle.companion.id]) return null;
    var id = battle.companion.id, lv = level(id), role = battle.companion.def.role;
    var snared = battle.companionSnaredRound === battle.round;
    var ready = lv >= 2 && !battle.duoUsed && !snared && battle.playerAP > 0 && !battle.over && !battle.awaitingAllOut;
    return { id: id, level: lv, role: role, ready: ready, used: !!battle.duoUsed, snared: snared, locked: lv < 2,
      needsTarget: role === 'attacker', name: text(BONDS[id].duo.name, BONDS[id].duo.nameEn), mult: mult(battle.run, id) };
  }

  function perform(battle, duo, target, events, h) {
    var run = battle.run, comp = battle.companion, m = duo.mult;
    var playerEff = h.playerOffenseEff(battle);
    if (duo.role === 'attacker') {
      var tEff = h.effectiveStats(target, target.debuffs);
      var hit = h.resolveHit(playerEff, tEff, 'almighty', F.OVERDRIVE_POWER * 0.8 * m);
      var start = events.length;
      target.breakMeter += 25;
      var dmg = h.applyBreak(target, hit.amount, events);
      h.breakCombo(battle, events, start);
      target.hp = Math.max(0, target.hp - dmg);
      events.push({ type: 'companionHit', companionId: comp.id, companionName: comp.name, targetUid: target.uid, targetName: target.name, isCrit: hit.isCrit, amount: dmg, hpAfter: target.hp, maxHp: target.maxHp, breakMeter: target.breakMeter, broken: target.broken });
      if (target.hp <= 0) {
        target.alive = false;
        events.push({ type: 'defeated', targetUid: target.uid, targetName: target.name, side: 'enemy' });
      } else if (target.isBoss) {
        var msg = h.checkBossPhase(target);
        if (msg) events.push(h.bossEvent(msg));
      }
    } else if (duo.role === 'healer') {
      var maxHp = battle.player.maxHp, heal = Math.min(maxHp - run.hp, Math.round(maxHp * 0.3 * m));
      run.hp += heal;
      run.ailments = [];
      run.mp += Math.min(3, battle.player.maxMp - run.mp);
      events.push({ type: 'companionHeal', companionId: comp.id, companionName: comp.name, amount: heal, hpAfter: run.hp, maxHp: maxHp });
      events.push({ type: 'cleanse', side: 'player' });
    } else if (duo.role === 'guardian') {
      ['def', 'res'].forEach(function (stat) { h.applyStatMod(battle.player.buffs, stat, 0.35 * m, 3); });
      battle.player.guarding = true;
      events.push({ type: 'companionBuff', companionId: comp.id, companionName: comp.name, stats: ['def', 'res'], amount: 0.35 * m });
    } else {
      ['atk', 'mag'].forEach(function (stat) { h.applyStatMod(battle.player.buffs, stat, 0.3 * m, 3); });
      battle.player.focus = Math.min(F.FOCUS_MAX, battle.player.focus + Math.round(40 * m));
      battle.playerAP = Math.min(battle.playerAP + 1, 4); // the sprite's spark refunds the action
      events.push({ type: 'companionBuff', companionId: comp.id, companionName: comp.name, stats: ['atk', 'mag'], amount: 0.3 * m });
    }
  }

  G.Bond = { LEVEL_AT: LEVEL_AT, info: info, points: points, level: level, progress: progress, award: award, story: story, duoFor: duoFor, perform: perform, npcLineFor: npcLineFor, mult: mult };
})();
