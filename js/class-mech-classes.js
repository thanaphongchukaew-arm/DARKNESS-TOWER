// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Class signature mechanics for the base classes beyond the four pilots (see class-mech.js
// for the hook list and the rules every mechanic follows: plain-JSON state on battle.mech,
// mechanic hits through strikeEnemy with an explicit Break amount, no Math.random for
// classes without a mechanic). Each class: one rule that forces a decision on your turn,
// a gauge, a bot rule, and at least one part that grows with level.
(function () {
  var G = window.Game, CM = G.ClassMech, U = CM.util;
  var txt = U.txt, note = U.note;
  function F() { return G.Formulas; }
  function cmd(classId, id, name, nameEn, opts) {
    return Object.assign({ id: id, name: name, nameEn: nameEn, element: 'phys', kind: 'mech', mech: id, cost: 0, target: 'self', minLevel: 1, classOnly: classId }, opts);
  }
  function enemyAt(battle, i) { var e = battle.enemies[i]; return e && e.alive ? e : null; }
  function byUidAlive(battle, uid) { return battle.enemies.find(function (e) { return e.uid === uid && e.alive; }) || null; }
  // Drop per-enemy entries for enemies that are gone.
  function pruneDead(battle, table) {
    Object.keys(table).forEach(function (uid) { if (!byUidAlive(battle, uid)) delete table[uid]; });
  }
  function strongest(alive) { return alive.slice().sort(function (a, b) { return (b.atk + b.mag) - (a.atk + a.mag); })[0]; }
  function healthiest(alive) { return alive.slice().sort(function (a, b) { return b.hp - a.hp; })[0]; }

  // ------------------------------------------------------------------------------------
  // Puppeteer -- Marionette Strings: string an enemy so its attacks hit another enemy.
  // Decision: which foe to control, and when (3-round cooldown).
  // ------------------------------------------------------------------------------------
  var PUP = { rounds: 2, roundsHigh: 3, highLevel: 15, cooldown: 3, redirectPct: 0.8, selfPct: 0.5 };
  function stringRounds(battle, enemy) { return enemy.isBoss ? 1 : battle.run.level >= PUP.highLevel ? PUP.roundsHigh : PUP.rounds; }
  CM.register('puppeteer', {
    name: 'สายใยหุ่นเชิด', nameEn: 'Marionette Strings',
    short: 'ผูกสายใยศัตรูให้มันโจมตีพวกเดียวกัน', shortEn: 'String a foe so its attacks hit its allies',
    desc: '"ผูกสายใย" ศัตรู 1 ตัว 2 รอบ (3 รอบเมื่อถึง Lv 15 บอสได้แค่ 1 รอบ): ทุกการโจมตีของมันจะไปโดนศัตรูตัวอื่นแทนคุณ (80% ของดาเมจ) ถ้าไม่มีตัวอื่นจะทำร้ายตัวเอง 50% ใช้ได้ทุก 3 รอบ',
    descEn: 'String one enemy for 2 rounds (3 from Lv 15, bosses 1): every attack it makes hits another enemy instead of you (80% damage), or itself (50%) if it is alone. Usable every 3 rounds.',
    init: function () { return { strung: {}, readyRound: 0 }; },
    skills: [cmd('puppeteer', 'puppet_strings', 'ผูกสายใย', 'Puppet Strings', { element: 'dark', target: 'singleEnemy', icon: 'dark', vfxFamily: 'puppet',
      desc: 'ผูกศัตรู 2 รอบ (บอส 1): การโจมตีของมันไปโดนพวกเดียวกันแทน · ใช้ได้ทุก 3 รอบ', descEn: 'String a foe for 2 rounds (bosses 1): its attacks hit its allies instead of you. Every 3 rounds.' })],
    block: function (battle, skill, m) {
      if (skill.id !== 'puppet_strings') return null;
      return battle.round < m.readyRound ? txt('สายใยพร้อมในอีก ' + (m.readyRound - battle.round) + ' รอบ', 'Strings ready in ' + (m.readyRound - battle.round) + ' round(s)') : null;
    },
    perform: function (battle, skill, m, events, ctx, targetIndex) {
      var e = enemyAt(battle, targetIndex);
      if (!e) return false;
      m.strung[e.uid] = battle.round + stringRounds(battle, e) - 1;
      m.readyRound = battle.round + PUP.cooldown;
      note(events, 'ผูกสายใย ' + e.name + ' (' + stringRounds(battle, e) + ' รอบ)', e.name + ' is on your strings (' + stringRounds(battle, e) + ' rounds)', 'crit');
      return false;
    },
    incoming: function (battle, m, enemy, dmg, events, ctx) {
      if (!(m.strung[enemy.uid] >= battle.round)) return null;
      var others = U.living(battle).filter(function (e) { return e !== enemy; });
      if (others.length) {
        var victim = healthiest(others);
        U.strikeEnemy(battle, victim, Math.max(1, Math.round(dmg * PUP.redirectPct)), txt(enemy.name + ' ถูกเชิดฟาด ', enemy.name + ' is pulled into ') + victim.name, events, ctx, F().breakAmount({ power: 0.8 }));
      } else {
        U.strikeEnemy(battle, enemy, Math.max(1, Math.round(dmg * PUP.selfPct)), txt(enemy.name + ' ถูกเชิดทำร้ายตัวเอง', enemy.name + ' strikes itself'), events, ctx, F().breakAmount({ power: 0.5 }));
      }
      return { dmg: 0, absorbed: true };
    },
    sweep: function (battle, m) { pruneDead(battle, m.strung); },
    gauge: function (battle, m, label) {
      var held = Object.keys(m.strung).filter(function (uid) { return m.strung[uid] >= battle.round && byUidAlive(battle, uid); }).map(function (uid) { return byUidAlive(battle, uid).name; });
      var ready = battle.round >= m.readyRound;
      return { icon: 'dark', label: label, value: (held.length ? txt('เชิด: ', 'Strung: ') + held.join(', ') + ' · ' : '') + (ready ? txt('พร้อม', 'ready') : txt('อีก ' + (m.readyRound - battle.round) + ' รอบ', 'in ' + (m.readyRound - battle.round))), active: held.length > 0 };
    },
    bot: function (battle, m, use, alive) {
      if (alive.length < 1) return null;
      var t = strongest(alive);
      return use('puppet_strings', battle.enemies.indexOf(t));
    },
    prime: function (battle, skill, m) { m.readyRound = 0; }
  });

  // ------------------------------------------------------------------------------------
  // Storm Caller -- Static: lightning and wind hits build Static. Conduct it into MP, or let
  // it reach full and it discharges into every enemy at once.
  // Decision: sustain (MP) or burst (AoE).
  // ------------------------------------------------------------------------------------
  var STORM = { max: 10, dischargePower: 0.7, mpPer: 2, mpPerHigh: 3, highLevel: 20 };
  CM.register('stormCaller', {
    name: 'ไฟฟ้าสถิต', nameEn: 'Static',
    short: 'สะสมไฟฟ้าสถิต แปลงเป็น MP หรือปล่อยระเบิดใส่ทุกตัว', shortEn: 'Build Static: turn it into MP, or let it burst on every foe',
    desc: 'ทุกฮิตธาตุสายฟ้า/ลมสะสมไฟฟ้าสถิต +1 (คริติคอล +2 สูงสุด 10) "นำไฟฟ้า" แปลงไฟฟ้าสถิตทั้งหมดเป็น MP (2 MP ต่อหน่วย 3 MP เมื่อถึง Lv 20 ฟรี 1 ครั้งต่อรอบ) ถ้าเต็ม 10 จะปล่อยประจุใส่ศัตรูทุกตัวทันที',
    descEn: 'Every lightning or wind hit builds Static +1 (crit +2, max 10). Conduct turns all of it into MP (2 per point, 3 from Lv 20; free once per round). At 10 it discharges into every enemy at once.',
    init: function () { return { static: 0, conductRound: 0 }; },
    skills: [cmd('stormCaller', 'storm_conduct', 'นำไฟฟ้า', 'Conduct', { element: 'elec', icon: 'elec', vfxFamily: 'lightning',
      desc: 'แปลงไฟฟ้าสถิตทั้งหมดเป็น MP · ฟรี 1 ครั้งต่อรอบ', descEn: 'Turn all Static into MP. Free once per round.' })],
    block: function (battle, skill, m) { return skill.id === 'storm_conduct' && m.static <= 0 ? txt('ไม่มีไฟฟ้าสถิต', 'No Static') : null; },
    perform: function (battle, skill, m, events) {
      var per = battle.run.level >= STORM.highLevel ? STORM.mpPerHigh : STORM.mpPer;
      var gain = U.restoreMp(battle, m.static * per, events);
      note(events, 'นำไฟฟ้า ' + m.static + ' หน่วย → MP +' + gain, 'Conducted ' + m.static + ' Static → MP +' + gain);
      m.static = 0;
      if (m.conductRound !== battle.round) { m.conductRound = battle.round; return true; }
      return false;
    },
    onHit: function (battle, skill, m, enemy, hit) {
      if (hit.element !== 'elec' && hit.element !== 'wind') return;
      m.static = Math.min(STORM.max, m.static + (hit.isCrit ? 2 : 1));
    },
    // Discharges right after the action that filled it (never at round start, where a kill
    // would land outside the player's turn).
    afterAction: function (battle, kind, skill, m, events, ctx) {
      if (m.static < STORM.max) return;
      m.static = 0;
      note(events, 'ไฟฟ้าสถิตเต็ม! ปล่อยประจุ', 'Static overload! Discharge', 'crit');
      U.living(battle).forEach(function (e) {
        if (battle.over) return;
        U.strikeEnemy(battle, e, U.mechDamage(battle, e, 'elec', STORM.dischargePower, ctx, 'mag'), txt('ประจุไฟฟ้าช็อต ', 'Discharge shocks ') + e.name, events, ctx, F().breakAmount({ power: STORM.dischargePower }));
      });
    },
    gauge: function (battle, m, label) { return { icon: 'elec', label: label, value: m.static + '/' + STORM.max, pips: { filled: m.static, max: STORM.max }, active: m.static >= STORM.max }; },
    bot: function (battle, m, use) {
      return m.static >= 4 && battle.run.mp < battle.player.maxMp * 0.35 ? use('storm_conduct') : null;
    },
    prime: function (battle, skill, m) { if (skill.id === 'storm_conduct') m.static = 3; }
  });

  // ------------------------------------------------------------------------------------
  // Tempest Witch -- Tide: every skill raises the tide. At high tide the next single-target
  // attack skill floods every enemy, or crashes 60% harder into a lone foe. Decision: which
  // skill to spend high tide on.
  // ------------------------------------------------------------------------------------
  var TIDE = { max: 3, maxHigh: 2, highLevel: 15, aoePower: 1.0, lonePower: 1.6 };
  function tideMax(battle) { return battle.run.level >= TIDE.highLevel ? TIDE.maxHigh : TIDE.max; }
  CM.register('tempestWitch', {
    name: 'กระแสน้ำขึ้น', nameEn: 'Rising Tide',
    short: 'ร่ายสกิลให้น้ำขึ้น น้ำขึ้นสุดแล้วสกิลถัดไปโดนทุกตัว', shortEn: 'Skills raise the tide; at high tide the next one hits everyone',
    desc: 'ทุกสกิลที่ใช้ (ไม่นับโจมตีปกติ) ทำให้น้ำขึ้น +1 เมื่อน้ำขึ้นสุด (3 ระดับ เหลือ 2 เมื่อถึง Lv 15) สกิลโจมตีเป้าเดี่ยวครั้งถัดไปจะซัดใส่ศัตรูทุกตัวเต็มแรง (ถ้าเหลือศัตรูตัวเดียว แรงขึ้น 60%) และไม่เสีย MP แล้วน้ำลดเหลือ 0',
    descEn: 'Every skill you use (not basic Attack) raises the tide by 1. At high tide (3, or 2 from Lv 15) your next single-target attack skill floods every enemy at full power (or hits a lone foe 60% harder) for no MP, then the tide falls to 0.',
    init: function () { return { tide: 0, surged: false }; },
    beforeAttack: function (battle, skill, m, events) {
      if (skill.id === 'attack' || skill.target !== 'singleEnemy' || m.tide < tideMax(battle)) return null;
      m.tide = 0; m.surged = true;
      U.restoreMp(battle, skill.cost || 0, events);   // the wave is free
      if (U.living(battle).length < 2) {
        note(events, 'น้ำขึ้นสุด! คลื่นยักษ์ถาโถม', 'High tide! A great wave crashes down', 'crit');
        return { powerMult: TIDE.lonePower };
      }
      note(events, 'น้ำขึ้นสุด! คลื่นซัดทุกตัว', 'High tide! The wave floods them all', 'crit');
      return { aoe: TIDE.aoePower };
    },
    afterAction: function (battle, kind, skill, m) {
      if (m.surged) { m.surged = false; return; }
      if (kind === 'skill' && skill && skill.kind !== 'mech') m.tide = Math.min(tideMax(battle), m.tide + 1);
    },
    gauge: function (battle, m, label) { var max = tideMax(battle); return { icon: 'ice', label: label, value: m.tide + '/' + max, pips: { filled: m.tide, max: max }, active: m.tide >= max }; }
  });

  // ------------------------------------------------------------------------------------
  // Chronomancer -- Rewind: turn HP and MP back to where they were at the start of last round.
  // Rewinding takes no time (a free action). Decision: when to spend the cooldown.
  // ------------------------------------------------------------------------------------
  var CHRONO = { cooldown: 3, cooldownHigh: 2, highLevel: 20 };
  CM.register('chronomancer', {
    name: 'ย้อนเวลา', nameEn: 'Rewind',
    short: 'ย้อน HP/MP กลับไปเท่าตอนต้นรอบก่อน', shortEn: 'Turn HP and MP back to the start of last round',
    desc: '"ย้อนเวลา" คืน HP และ MP กลับเท่าตอนเริ่มรอบก่อนหน้า (ถ้าสูงกว่าตอนนี้) และล้างสถานะผิดปกติ ไม่เสียแอคชัน ใช้ได้ทุก 3 รอบ (2 รอบเมื่อถึง Lv 20)',
    descEn: 'Rewind restores HP and MP to what they were at the start of the previous round (when higher than now) and clears ailments. It takes no action. Usable every 3 rounds (2 from Lv 20).',
    init: function () { return { prev: null, cur: null, readyRound: 0 }; },
    skills: [cmd('chronomancer', 'chrono_rewind', 'ย้อนเวลา', 'Rewind', { element: 'light', icon: 'light', vfxFamily: 'temporal',
      desc: 'คืน HP/MP เท่าตอนต้นรอบก่อน ล้างสถานะผิดปกติ · ไม่เสียแอคชัน · ทุก 3 รอบ', descEn: 'Restore HP/MP to the start of last round and clear ailments. Free action. Every 3 rounds.' })],
    block: function (battle, skill, m) {
      if (skill.id !== 'chrono_rewind') return null;
      if (battle.round < m.readyRound) return txt('พร้อมในอีก ' + (m.readyRound - battle.round) + ' รอบ', 'Ready in ' + (m.readyRound - battle.round) + ' round(s)');
      var snap = m.prev || m.cur;
      if (!snap || (snap.hp <= battle.run.hp && snap.mp <= battle.run.mp && !(battle.run.ailments || []).length)) return txt('ไม่มีอะไรให้ย้อน', 'Nothing to rewind');
      return null;
    },
    perform: function (battle, skill, m, events) {
      var snap = m.prev || m.cur, run = battle.run, p = battle.player;
      var hpGain = Math.max(0, Math.min(p.maxHp, snap.hp) - run.hp), mpGain = Math.max(0, Math.min(p.maxMp, snap.mp) - run.mp);
      if (hpGain) U.healPlayer(battle, hpGain, events);
      if (mpGain) U.restoreMp(battle, mpGain, events);
      if ((run.ailments || []).length) { run.ailments = []; events.push({ type: 'cleanse', side: 'player' }); }
      m.readyRound = battle.round + (run.level >= CHRONO.highLevel ? CHRONO.cooldownHigh : CHRONO.cooldown);
      note(events, 'ย้อนเวลา! HP +' + hpGain + ' MP +' + mpGain, 'Time rewinds! HP +' + hpGain + ' MP +' + mpGain, 'crit');
      return true;
    },
    roundStart: function (battle, m) {
      m.prev = m.cur;
      m.cur = { hp: battle.run.hp, mp: battle.run.mp };
    },
    gauge: function (battle, m, label) {
      var ready = battle.round >= m.readyRound, snap = m.prev || m.cur;
      return { icon: 'light', label: label, value: (ready ? txt('พร้อม', 'Ready') : txt('อีก ' + (m.readyRound - battle.round) + ' รอบ', 'In ' + (m.readyRound - battle.round))) + (snap ? ' · HP ' + snap.hp : ''), active: ready };
    },
    bot: function (battle, m, use) {
      var snap = m.prev || m.cur, p = battle.player;
      return snap && snap.hp - battle.run.hp > p.maxHp * 0.2 ? use('chrono_rewind') : null;
    },
    prime: function (battle, skill, m) { m.readyRound = 0; m.prev = { hp: battle.player.maxHp, mp: battle.player.maxMp }; battle.run.hp = Math.max(1, battle.run.hp - 5); }
  });

  // ------------------------------------------------------------------------------------
  // Warlock -- Hex: skill hits stack Hex on the target (+10% damage taken from you per stack).
  // Detonate cashes the stacks in for damage and a little HP. Decision: keep the amp or cash out.
  // ------------------------------------------------------------------------------------
  var HEX = { max: 3, maxHigh: 5, highLevel: 15, perStack: 0.1, detonatePower: 0.45, healPct: 0.05 };
  function hexMax(battle) { return battle.run.level >= HEX.highLevel ? HEX.maxHigh : HEX.max; }
  CM.register('warlock', {
    name: 'คำสาปซ้อน', nameEn: 'Hexcraft',
    short: 'สกิลวางคำสาปซ้อนบนศัตรู แล้วจุดระเบิดเมื่อต้องการ', shortEn: 'Skills stack Hex on a foe; detonate it when you choose',
    desc: 'ทุกฮิตจากสกิล (ไม่นับโจมตีปกติ) วางคำสาป +1 บนเป้าหมาย (สูงสุด 3 เป็น 5 เมื่อถึง Lv 15) แต่ละชั้นทำให้มันรับดาเมจจากคุณ +10% "จุดคำสาป" ระเบิดคำสาปทั้งหมดบนเป้าหมาย สร้างดาเมจตามจำนวนชั้นและฟื้น HP 5% ต่อชั้น',
    descEn: 'Every skill hit (not basic Attack) adds a Hex to the target (3 max, 5 from Lv 15); each makes it take 10% more damage from you. Detonate Hex bursts all of a target\'s Hexes for damage per stack and heals you 5% HP per stack.',
    init: function () { return { hex: {} }; },
    skills: [cmd('warlock', 'warlock_detonate', 'จุดคำสาป', 'Detonate Hex', { element: 'dark', target: 'singleEnemy', icon: 'dark', vfxFamily: 'curse',
      desc: 'ระเบิดคำสาปบนเป้าหมาย: ดาเมจตามจำนวนชั้น และฟื้น HP 5% ต่อชั้น', descEn: 'Burst the target\'s Hexes: damage per stack, heal 5% HP per stack.' })],
    block: function (battle, skill, m) {
      if (skill.id !== 'warlock_detonate') return null;
      return Object.keys(m.hex).some(function (uid) { return m.hex[uid] > 0 && byUidAlive(battle, uid); }) ? null : txt('ยังไม่มีศัตรูติดคำสาป', 'No enemy is hexed');
    },
    perform: function (battle, skill, m, events, ctx, targetIndex) {
      var e = enemyAt(battle, targetIndex), stacks = e ? (m.hex[e.uid] || 0) : 0;
      if (!e || !stacks) { note(events, 'เป้าหมายนี้ไม่มีคำสาป', 'That target has no Hex', 'weak'); return true; }
      delete m.hex[e.uid];
      var power = HEX.detonatePower * stacks;
      U.strikeEnemy(battle, e, U.mechDamage(battle, e, 'almighty', power, ctx), txt('คำสาประเบิด x' + stacks + ' ใส่ ', 'Hex bursts x' + stacks + ' on ') + e.name, events, ctx, F().breakAmount({ power: Math.min(power, 2.5) }));
      U.healPlayer(battle, battle.player.maxHp * HEX.healPct * stacks, events);
      return false;
    },
    targetMult: function (battle, m, enemy) { return 1 + HEX.perStack * (m.hex[enemy.uid] || 0); },
    onHit: function (battle, skill, m, enemy) {
      if (skill.id === 'attack' || !enemy.alive) return;
      m.hex[enemy.uid] = Math.min(hexMax(battle), (m.hex[enemy.uid] || 0) + 1);
    },
    sweep: function (battle, m) { pruneDead(battle, m.hex); },
    gauge: function (battle, m, label) {
      var parts = Object.keys(m.hex).filter(function (uid) { return byUidAlive(battle, uid); }).map(function (uid) { return byUidAlive(battle, uid).name + ' x' + m.hex[uid]; });
      return { icon: 'dark', label: label, value: parts.join(', ') || txt('ยังไม่มีคำสาป', 'No Hex'), active: parts.length > 0 };
    },
    bot: function (battle, m, use, alive) {
      var best = null;
      alive.forEach(function (e) { var n = m.hex[e.uid] || 0; if (n >= hexMax(battle) && (!best || e.hp < best.hp)) best = e; });
      if (!best) alive.forEach(function (e) { if ((m.hex[e.uid] || 0) >= 2 && e.hp < e.maxHp * 0.25) best = e; });
      return best ? use('warlock_detonate', battle.enemies.indexOf(best)) : null;
    },
    prime: function (battle, skill, m) { var e = U.living(battle)[0]; if (e) m.hex[e.uid] = 2; }
  });

  // ------------------------------------------------------------------------------------
  // Monk -- Chi: basic Attack builds Chi; monk techniques are paid with 2 Chi instead of MP
  // whenever you have it. Decision: punch to bank Chi, or spend MP to keep it.
  // ------------------------------------------------------------------------------------
  var CHI = { max: 4, maxHigh: 6, highLevel: 20, spend: 2 };
  function chiMax(battle) { return battle.run.level >= CHI.highLevel ? CHI.maxHigh : CHI.max; }
  function chiPays(skill, m) { return skill.classOnly === 'monk' && skill.kind !== 'mech' && m.chi >= CHI.spend; }
  CM.register('monk', {
    name: 'พลังชี่', nameEn: 'Chi Flow',
    short: 'โจมตีปกติสะสมชี่ ใช้ชี่แทน MP ออกท่า', shortEn: 'Basic Attacks build Chi; techniques spend Chi instead of MP',
    desc: 'โจมตีปกติแต่ละฮิตได้ชี่ +2 (คริติคอล +3 สูงสุด 4 เป็น 6 เมื่อถึง Lv 20) ท่าของนักพรตจะใช้ชี่ 2 แทน MP ทั้งหมดเมื่อมีชี่พอ',
    descEn: 'Each basic Attack hit gives +2 Chi (crit +3; 4 max, 6 from Lv 20). Monk techniques cost 2 Chi instead of all their MP whenever you have enough.',
    init: function () { return { chi: 0 }; },
    cost: function (battle, skill, m, out) {
      if (!chiPays(skill, m)) return;
      out.mp = 0;
      out.res = { key: 'chi', amount: CHI.spend, th: 'ชี่', en: 'Chi' };
    },
    pay: function (battle, skill, m, c) { if (c.res && c.res.key === 'chi') m.chi = Math.max(0, m.chi - c.res.amount); },
    onHit: function (battle, skill, m, enemy, hit) {
      if (skill.id !== 'attack') return;
      m.chi = Math.min(chiMax(battle), m.chi + (hit.isCrit ? 3 : 2));
    },
    gauge: function (battle, m, label) { var max = chiMax(battle); return { icon: 'elec', label: label, value: m.chi + '/' + max, pips: { filled: m.chi, max: max }, active: m.chi >= CHI.spend }; },
  });

  // ------------------------------------------------------------------------------------
  // Frost Oracle -- Foresight: ice hits Chill a foe (its hits on you weaken per stack), and
  // Premonition voids the next blow this round. Decision: when to spend the 3-round foresight.
  // ------------------------------------------------------------------------------------
  var FROST = { chillMax: 3, chillCut: 0.08, cooldown: 3, voids: 1, voidsHigh: 2, highLevel: 20 };
  CM.register('frostOracle', {
    name: 'ญาณหยั่งรู้', nameEn: 'Foresight',
    short: 'ธาตุน้ำแข็งทำศัตรูหนาวสั่น · หยั่งรู้ปัดการโจมตีถัดไป', shortEn: 'Ice chills foes; Premonition voids the next blow',
    desc: 'ทุกฮิตธาตุน้ำแข็งทำให้ศัตรูหนาวสั่น +1 (สูงสุด 3) แต่ละชั้นทำให้มันโจมตีคุณเบาลง 8% "หยั่งรู้" ทำให้การโจมตีครั้งถัดไปที่โดนคุณในรอบนี้ไม่เกิดผล (2 ครั้งเมื่อถึง Lv 20) ใช้ได้ทุก 3 รอบ',
    descEn: 'Every ice hit Chills its target +1 (3 max); each stack makes its attacks on you 8% weaker. Premonition voids the next enemy hit on you this round (the next 2 from Lv 20). Usable every 3 rounds.',
    init: function () { return { chill: {}, voidLeft: 0, voidRound: 0, readyRound: 0 }; },
    skills: [cmd('frostOracle', 'frost_premonition', 'หยั่งรู้', 'Premonition', { element: 'ice', icon: 'ice', vfxFamily: 'shield',
      desc: 'การโจมตีถัดไปที่โดนคุณในรอบนี้ไม่เกิดผล · ทุก 3 รอบ', descEn: 'The next enemy hit on you this round is voided. Every 3 rounds.' })],
    block: function (battle, skill, m) {
      if (skill.id !== 'frost_premonition') return null;
      return battle.round < m.readyRound ? txt('พร้อมในอีก ' + (m.readyRound - battle.round) + ' รอบ', 'Ready in ' + (m.readyRound - battle.round) + ' round(s)') : null;
    },
    perform: function (battle, skill, m, events) {
      m.voidLeft = battle.run.level >= FROST.highLevel ? FROST.voidsHigh : FROST.voids;
      m.voidRound = battle.round;
      m.readyRound = battle.round + FROST.cooldown;
      note(events, 'หยั่งรู้อนาคต… การโจมตีถัดไปจะพลาด', 'Foreseen… the next blow will miss');
      return false;
    },
    onHit: function (battle, skill, m, enemy, hit) {
      if (hit.element !== 'ice' || !enemy.alive) return;
      m.chill[enemy.uid] = Math.min(FROST.chillMax, (m.chill[enemy.uid] || 0) + 1);
    },
    incoming: function (battle, m, enemy, dmg, events) {
      if (m.voidLeft > 0 && m.voidRound === battle.round) {
        m.voidLeft -= 1;
        note(events, 'หยั่งรู้! ' + enemy.name + ' โจมตีพลาด', 'Foreseen! ' + enemy.name + ' misses');
        return { dmg: 0, absorbed: true };
      }
      var c = m.chill[enemy.uid] || 0;
      return c ? { dmg: Math.max(1, Math.round(dmg * (1 - FROST.chillCut * c))), absorbed: false } : null;
    },
    sweep: function (battle, m) { pruneDead(battle, m.chill); },
    gauge: function (battle, m, label) {
      var ready = battle.round >= m.readyRound, chilled = Object.keys(m.chill).filter(function (uid) { return byUidAlive(battle, uid); }).length;
      var voidNow = m.voidLeft > 0 && m.voidRound === battle.round;
      return { icon: 'ice', label: label, value: (voidNow ? txt('หยั่งรู้แล้ว', 'Foreseen') : ready ? txt('พร้อม', 'Ready') : txt('อีก ' + (m.readyRound - battle.round) + ' รอบ', 'In ' + (m.readyRound - battle.round))) + ' · ' + txt('หนาวสั่น ', 'Chilled ') + chilled, active: voidNow };
    },
    bot: function (battle, m, use, alive) {
      return alive.length >= 2 || battle.run.hp < battle.player.maxHp * 0.6 ? use('frost_premonition') : null;
    },
    prime: function (battle, skill, m) { m.readyRound = 0; }
  });

  // ------------------------------------------------------------------------------------
  // Bard -- Tunes: play one tune at a time (Valor: damage, Ballad: healing, Haste: speed).
  // Holding a tune builds Encore (x1..x3); switching resets it. Decision: hold or adapt.
  // ------------------------------------------------------------------------------------
  var TUNES = {
    valor: { th: 'เพลงกล้าหาญ', en: 'Valor', dmg: 0.06 },
    ballad: { th: 'เพลงเยียวยา', en: 'Ballad', heal: 0.02 },
    haste: { th: 'เพลงเร่งจังหวะ', en: 'Haste', spd: 0.1 }
  };
  var ENCORE_MAX = 3;
  function setTune(battle, m, tune) {
    m.tune = tune; m.encore = 1;
    applyTuneMods(battle, m);
  }
  function applyTuneMods(battle, m) {
    battle.player.formMods = m.tune === 'haste' ? { spd: TUNES.haste.spd * m.encore } : null;
  }
  function tuneSkill(tune, minLevel, icon, desc, descEn) {
    return cmd('bard', 'bard_tune_' + tune, TUNES[tune].th, TUNES[tune].en + ' Tune', { tune: tune, minLevel: minLevel, element: 'wind', icon: icon, vfxFamily: 'music', desc: desc, descEn: descEn });
  }
  CM.register('bard', {
    name: 'บทเพลงต่อเนื่อง', nameEn: 'Encore',
    short: 'เล่นเพลงทีละเพลง ยิ่งเล่นต่อเนื่องยิ่งแรง', shortEn: 'Play one tune at a time; it grows the longer you hold it',
    desc: 'เลือกเล่นเพลงทีละเพลง (สลับฟรี 1 ครั้งต่อรอบ): กล้าหาญ ดาเมจ +6% · เยียวยา ฟื้น HP 2% ทุกรอบ · เร่งจังหวะ (Lv 10) SPD +10% เล่นเพลงเดิมต่อเนื่องได้ Encore ทุกรอบ (สูงสุด x3) คูณผลเพลง สลับเพลงแล้ว Encore กลับเป็น x1',
    descEn: 'Play one tune at a time (switch free once per round): Valor +6% damage · Ballad heals 2% HP each round · Haste (Lv 10) +10% SPD. Each round you hold the same tune its Encore rises (x3 max) and multiplies it; switching resets Encore to x1.',
    init: function () { return { tune: null, encore: 0, switchRound: 0 }; },
    skills: [
      tuneSkill('valor', 1, 'buffUp', 'ดาเมจ +6% x Encore · สลับฟรี 1 ครั้งต่อรอบ', '+6% damage x Encore. Free switch once per round.'),
      tuneSkill('ballad', 1, 'heart', 'ฟื้น HP 2% x Encore ทุกรอบ · สลับฟรี 1 ครั้งต่อรอบ', 'Heal 2% HP x Encore each round. Free switch once per round.'),
      tuneSkill('haste', 10, 'wind', 'SPD +10% x Encore · สลับฟรี 1 ครั้งต่อรอบ', '+10% SPD x Encore. Free switch once per round.')
    ],
    block: function (battle, skill, m) { return skill.tune && skill.tune === m.tune ? txt('กำลังเล่นเพลงนี้อยู่', 'Already playing') : null; },
    perform: function (battle, skill, m, events) {
      setTune(battle, m, skill.tune);
      note(events, 'เริ่มบรรเลง' + TUNES[skill.tune].th, 'Now playing ' + TUNES[skill.tune].en);
      if (m.switchRound !== battle.round) { m.switchRound = battle.round; return true; }
      return false;
    },
    beforeAttack: function (battle, skill, m) { return m.tune === 'valor' ? { powerMult: 1 + TUNES.valor.dmg * m.encore } : null; },
    roundStart: function (battle, m, events) {
      if (!m.tune) return;
      m.encore = Math.min(ENCORE_MAX, m.encore + 1);
      applyTuneMods(battle, m);
      if (m.tune === 'ballad' && events) U.healPlayer(battle, Math.max(1, battle.player.maxHp * TUNES.ballad.heal * m.encore), events);
    },
    gauge: function (battle, m, label) {
      return { icon: 'wind', label: label, value: m.tune ? txt(TUNES[m.tune].th, TUNES[m.tune].en) + ' · Encore x' + m.encore + (m.switchRound === battle.round ? '' : txt(' · สลับฟรีได้', ' · free switch')) : txt('ยังไม่เล่นเพลง', 'No tune'), pips: m.tune ? { filled: m.encore, max: ENCORE_MAX } : null, active: m.encore >= ENCORE_MAX };
    },
    bot: function (battle, m, use) {
      var low = battle.run.hp < battle.player.maxHp * 0.5;
      if (low && m.tune !== 'ballad') return use('bard_tune_ballad');
      if (!low && !m.tune) return use('bard_tune_valor');
      return null;
    },
    prime: function (battle, skill, m) { if (skill.tune && m.tune === skill.tune) setTune(battle, m, skill.tune === 'valor' ? 'ballad' : 'valor'); }
  });

  // ------------------------------------------------------------------------------------
  // Paladin -- Devotion: Guard, and blows taken while guarding, build Devotion. The next
  // attack spends it all for power and healing. Decision: give up a turn to guard, or strike.
  // ------------------------------------------------------------------------------------
  var DEVOTION = { max: 3, maxHigh: 4, highLevel: 20, power: 0.2, heal: 0.04 };
  function devotionMax(battle) { return battle.run.level >= DEVOTION.highLevel ? DEVOTION.maxHigh : DEVOTION.max; }
  CM.register('paladin', {
    name: 'ศรัทธา', nameEn: 'Devotion',
    short: 'ตั้งรับสะสมศรัทธา แล้วระเบิดออกในการโจมตีถัดไป', shortEn: 'Guard to build Devotion, then pour it into your next strike',
    desc: 'ตั้งรับได้ศรัทธา +1 และทุกครั้งที่โดนโจมตีระหว่างตั้งรับ +1 (สูงสุด 3 เป็น 4 เมื่อถึง Lv 20) การโจมตีครั้งถัดไปใช้ศรัทธาทั้งหมด: แรงขึ้น 20% และฟื้น HP 4% ต่อชั้น',
    descEn: 'Guard gives +1 Devotion, and each hit you take while guarding +1 more (3 max, 4 from Lv 20). Your next attack spends it all: +20% power and 4% HP healed per stack.',
    init: function () { return { devotion: 0 }; },
    onGuard: function (battle, m, events) {
      m.devotion = Math.min(devotionMax(battle), m.devotion + 1);
      note(events, 'ศรัทธา ' + m.devotion + '/' + devotionMax(battle), 'Devotion ' + m.devotion + '/' + devotionMax(battle));
    },
    afterIncoming: function (battle, m) {
      if (battle.player.guarding) m.devotion = Math.min(devotionMax(battle), m.devotion + 1);
    },
    beforeAttack: function (battle, skill, m, events) {
      if (!m.devotion) return null;
      var n = m.devotion;
      m.devotion = 0;
      note(events, 'พลังศรัทธา x' + n + '!', 'Devotion x' + n + '!', 'crit');
      U.healPlayer(battle, battle.player.maxHp * DEVOTION.heal * n, events);
      return { powerMult: 1 + DEVOTION.power * n };
    },
    gauge: function (battle, m, label) { var max = devotionMax(battle); return { icon: 'shieldGuard', label: label, value: m.devotion + '/' + max, pips: { filled: m.devotion, max: max }, active: m.devotion > 0 }; },
    bot: function (battle, m) {
      return m.devotion === 0 && battle.run.hp < battle.player.maxHp * 0.5 && battle.playerAP === 1 ? { kind: 'guard' } : null;
    }
  });

  // ------------------------------------------------------------------------------------
  // Alchemist -- Field Chemistry: the first item each round is a free action, healing items
  // work 50% better, and every item used primes a Catalyst for the next attack skill.
  // Decision: spend consumables (gold) to buy tempo and damage.
  // ------------------------------------------------------------------------------------
  var ALCH = { healBonus: 0.25, catMax: 3, catPower: 0.2, catPowerHigh: 0.3, highLevel: 20 };
  CM.register('alchemist', {
    name: 'เคมีภาคสนาม', nameEn: 'Field Chemistry',
    short: 'ใช้ไอเทมฟรีรอบละครั้ง ยาแรงขึ้น และเติมสารเร่งให้ท่าถัดไป', shortEn: 'One free item per round, stronger potions, and a Catalyst for your next skill',
    desc: 'ไอเทมชิ้นแรกในแต่ละรอบไม่เสียแอคชัน ยาฟื้น HP ได้ผลเพิ่ม 25% และทุกไอเทมที่ใช้ได้สารเร่ง +1 (สูงสุด 3) สกิลโจมตีครั้งถัดไปใช้สารเร่งทั้งหมด แรงขึ้น 20% ต่อชั้น (30% เมื่อถึง Lv 20)',
    descEn: 'Your first item each round is a free action, healing items work 25% better, and every item used adds a Catalyst (3 max). Your next attack skill spends them all for +20% power each (+30% from Lv 20).',
    init: function () { return { catalyst: 0, freeRound: 0 }; },
    afterItem: function (battle, item, m, hpGain, events) {
      if (hpGain > 0) U.healPlayer(battle, hpGain * ALCH.healBonus, events);
      m.catalyst = Math.min(ALCH.catMax, m.catalyst + 1);
      note(events, 'สารเร่ง ' + m.catalyst + '/' + ALCH.catMax, 'Catalyst ' + m.catalyst + '/' + ALCH.catMax);
      if (m.freeRound !== battle.round) { m.freeRound = battle.round; return true; }
      return false;
    },
    beforeAttack: function (battle, skill, m, events) {
      if (skill.id === 'attack' || !m.catalyst) return null;
      var n = m.catalyst, per = battle.run.level >= ALCH.highLevel ? ALCH.catPowerHigh : ALCH.catPower;
      m.catalyst = 0;
      note(events, 'สารเร่งทำปฏิกิริยา x' + n + '!', 'Catalyst reaction x' + n + '!', 'crit');
      return { powerMult: 1 + per * n };
    },
    gauge: function (battle, m, label) {
      return { icon: 'fire', label: label, value: txt('สารเร่ง ', 'Catalyst ') + m.catalyst + '/' + ALCH.catMax + (m.freeRound === battle.round ? '' : txt(' · ไอเทมฟรี', ' · free item')), pips: { filled: m.catalyst, max: ALCH.catMax }, active: m.catalyst > 0 };
    }
  });

  // ------------------------------------------------------------------------------------
  // Shadow Dancer -- Shadows: each attack leaves a Shadow (12% dodge each). A dodge makes the
  // next strike a sure critical; Vanish (Lv 15) spends 3 Shadows so every blow this round
  // misses. Decision: keep the dodge odds, or cash them for one safe round.
  // ------------------------------------------------------------------------------------
  var SHADOW = { max: 3, dodge: 0.12 };
  CM.register('shadowDancer', {
    name: 'เงาพราง', nameEn: 'Shadowstep',
    short: 'โจมตีทิ้งเงาไว้หลบการโจมตี หลบได้แล้วท่าถัดไปคริ', shortEn: 'Attacks leave Shadows that dodge; a dodge sets up a sure critical',
    desc: 'ทุกครั้งที่โจมตีได้เงา +1 (สูงสุด 3) แต่ละเงาให้โอกาสหลบ 12% เมื่อหลบได้จะเสียเงา 1 และการโจมตีครั้งถัดไปคริติคอลแน่นอน "หายตัว" (Lv 15) ใช้เงา 3 ทำให้ทุกการโจมตีในรอบนี้พลาด',
    descEn: 'Every attack leaves a Shadow (3 max), each a 12% chance to dodge. A dodge spends one and makes your next attack a sure critical. Vanish (Lv 15) spends 3 Shadows: every enemy blow this round misses.',
    init: function () { return { shadows: 0, primed: false, vanishRound: 0 }; },
    skills: [cmd('shadowDancer', 'shadow_vanish', 'หายตัว', 'Vanish', { element: 'dark', minLevel: 15, icon: 'dark', vfxFamily: 'haste',
      desc: 'ใช้เงา 3: ทุกการโจมตีของศัตรูในรอบนี้พลาด', descEn: 'Spend 3 Shadows: every enemy blow this round misses.' })],
    block: function (battle, skill, m) { return skill.id === 'shadow_vanish' && m.shadows < SHADOW.max ? txt('ต้องมีเงา 3', 'Needs 3 Shadows') : null; },
    perform: function (battle, skill, m, events) {
      m.shadows = 0; m.vanishRound = battle.round;
      note(events, 'หายเข้าไปในเงา…', 'You vanish into the shadows…', 'crit');
      return false;
    },
    beforeAttack: function (battle, skill, m, events) {
      if (!m.primed) return null;
      m.primed = false;
      note(events, 'โจมตีจากเงา!', 'Strike from the shadows!', 'crit');
      return { forceCrit: true };
    },
    afterAction: function (battle, kind, skill, m) {
      if ((kind === 'attack' || kind === 'skill') && skill && skill.kind === 'attack') m.shadows = Math.min(SHADOW.max, m.shadows + 1);
    },
    incoming: function (battle, m, enemy, dmg, events) {
      if (m.vanishRound === battle.round) { note(events, enemy.name + ' ฟันโดนแต่เงา', enemy.name + ' strikes only shadow'); return { dmg: 0, absorbed: true }; }
      if (!m.shadows || Math.random() >= SHADOW.dodge * m.shadows) return null;
      m.shadows -= 1; m.primed = true;
      note(events, 'หลบ! ' + enemy.name + ' โจมตีพลาด', 'Dodged ' + enemy.name + '!');
      return { dmg: 0, absorbed: true };
    },
    gauge: function (battle, m, label) {
      return { icon: 'dark', label: label, value: m.vanishRound === battle.round ? txt('หายตัว', 'Vanished') : txt('เงา ', 'Shadows ') + m.shadows + '/' + SHADOW.max + (m.primed ? txt(' · พร้อมคริ', ' · crit ready') : ''), pips: { filled: m.shadows, max: SHADOW.max }, active: m.primed || m.vanishRound === battle.round };
    },
    bot: function (battle, m, use) { return m.shadows >= SHADOW.max && battle.run.hp < battle.player.maxHp * 0.4 ? use('shadow_vanish') : null; },
    prime: function (battle, skill, m) { if (skill.id === 'shadow_vanish') m.shadows = SHADOW.max; }
  });

  // ------------------------------------------------------------------------------------
  // Beastmaster -- Pack Hunter: your hound Fang fights every round. Sic 'Em sends it at a
  // target now and keeps it on that target. Decision: where to point the pack.
  // ------------------------------------------------------------------------------------
  var PACK = { roundPower: 0.4, sicPower: 1.0, twiceLevel: 20 };
  CM.register('beastmaster', {
    name: 'ฝูงล่า', nameEn: 'Pack Hunter',
    short: 'สุนัขล่าเนื้อโจมตีทุกรอบ สั่งให้รุมเป้าหมายได้', shortEn: 'Your hound attacks every round; sic it on the foe you choose',
    desc: 'สุนัขล่าเนื้อ "เขี้ยว" โจมตีทุกรอบ (2 ครั้งเมื่อถึง Lv 20) "สั่งจู่โจม" ให้มันกัดเป้าหมายทันทีอย่างแรง และรุมเป้าหมายนั้นต่อไปจนกว่ามันจะตาย',
    descEn: 'Your hound Fang attacks every round (twice from Lv 20). Sic \'Em sends it at a target for a heavy bite right away, and it keeps hunting that target until it falls.',
    init: function () { return { focus: null }; },
    skills: [cmd('beastmaster', 'beast_sic', 'สั่งจู่โจม', 'Sic \'Em', { target: 'singleEnemy', icon: 'swordAttack', vfxFamily: 'bite',
      desc: 'สุนัขกัดเป้าหมายทันที และรุมเป้าหมายนี้ต่อไป', descEn: 'Fang bites the target now and keeps hunting it.' })],
    perform: function (battle, skill, m, events, ctx, targetIndex) {
      var e = enemyAt(battle, targetIndex);
      if (!e) return false;
      m.focus = e.uid;
      U.strikeEnemy(battle, e, U.mechDamage(battle, e, 'phys', PACK.sicPower, ctx), txt('เขี้ยวกระโจนกัด ', 'Fang lunges at ') + e.name, events, ctx, F().breakAmount({ power: PACK.sicPower }));
      return false;
    },
    minionPhase: function (battle, m, events, ctx) {
      var n = battle.run.level >= PACK.twiceLevel ? 2 : 1;
      for (var i = 0; i < n && !battle.over; i++) {
        var foes = U.living(battle);
        if (!foes.length) return;
        var t = byUidAlive(battle, m.focus) || foes[Math.floor(Math.random() * foes.length)];
        U.strikeEnemy(battle, t, U.mechDamage(battle, t, 'phys', PACK.roundPower, ctx), txt('เขี้ยวกัด ', 'Fang bites ') + t.name, events, ctx, F().breakAmount({ power: PACK.roundPower }));
      }
    },
    sweep: function (battle, m) { if (m.focus && !byUidAlive(battle, m.focus)) m.focus = null; },
    gauge: function (battle, m, label) {
      var t = byUidAlive(battle, m.focus);
      return { icon: 'swordAttack', label: label, value: t ? txt('รุม ', 'Hunting ') + t.name : txt('ล่าอิสระ', 'Roaming'), active: !!t };
    },
    bot: function (battle, m, use, alive) {
      if (m.focus || alive.length < 2) return null;
      return use('beast_sic', battle.enemies.indexOf(healthiest(alive)));
    }
  });

  // ------------------------------------------------------------------------------------
  // Runeblade -- Runes: every skill inscribes a rune that hardens you (+5% DEF/RES each).
  // Shatter breaks them all on a target for damage and MP. Decision: hold the armour or cash it.
  // ------------------------------------------------------------------------------------
  var RUNE = { max: 3, maxHigh: 4, highLevel: 20, guard: 0.05, power: 0.6, mp: 2 };
  function runeMax(battle) { return battle.run.level >= RUNE.highLevel ? RUNE.maxHigh : RUNE.max; }
  function runeMods(battle, m) { battle.player.formMods = m.runes ? { def: RUNE.guard * m.runes, res: RUNE.guard * m.runes } : null; }
  CM.register('runeblade', {
    name: 'วงอักขระ', nameEn: 'Rune Circle',
    short: 'สกิลจารึกอักขระเสริมเกราะ แล้วทำลายเป็นดาเมจและ MP', shortEn: 'Skills inscribe armouring runes; shatter them for damage and MP',
    desc: 'ทุกสกิลที่ใช้จารึกอักขระ +1 (สูงสุด 3 เป็น 4 เมื่อถึง Lv 20) แต่ละอักขระ DEF/RES +5% "ทำลายอักขระ" สลายทั้งหมดใส่เป้าหมาย สร้างดาเมจตามจำนวนอักขระและคืน MP 2 ต่ออักขระ',
    descEn: 'Every skill you use inscribes a rune (3 max, 4 from Lv 20), each +5% DEF/RES. Shatter Runes breaks them all on a target for damage per rune and 2 MP back per rune.',
    init: function () { return { runes: 0 }; },
    skills: [cmd('runeblade', 'rune_shatter', 'ทำลายอักขระ', 'Shatter Runes', { element: 'dark', target: 'singleEnemy', icon: 'dark', vfxFamily: 'sigil',
      desc: 'สลายอักขระทั้งหมดใส่เป้าหมาย: ดาเมจและ MP ตามจำนวนอักขระ', descEn: 'Break every rune on the target: damage and MP per rune.' })],
    block: function (battle, skill, m) { return skill.id === 'rune_shatter' && !m.runes ? txt('ยังไม่มีอักขระ', 'No runes') : null; },
    perform: function (battle, skill, m, events, ctx, targetIndex) {
      var e = enemyAt(battle, targetIndex), n = m.runes;
      if (!e) return false;
      m.runes = 0; runeMods(battle, m);
      var power = RUNE.power * n;
      U.strikeEnemy(battle, e, U.mechDamage(battle, e, 'almighty', power, ctx), txt('อักขระแตก x' + n + ' ใส่ ', 'Runes shatter x' + n + ' on ') + e.name, events, ctx, F().breakAmount({ power: Math.min(power, 2.5) }));
      U.restoreMp(battle, RUNE.mp * n, events);
      return false;
    },
    afterAction: function (battle, kind, skill, m) {
      if (kind !== 'skill' || !skill || skill.kind === 'mech') return;
      m.runes = Math.min(runeMax(battle), m.runes + 1);
      runeMods(battle, m);
    },
    gauge: function (battle, m, label) { var max = runeMax(battle); return { icon: 'shieldGuard', label: label, value: m.runes + '/' + max + ' · DEF/RES +' + Math.round(RUNE.guard * m.runes * 100) + '%', pips: { filled: m.runes, max: max }, active: m.runes >= max }; },
    bot: function (battle, m, use, alive) {
      return m.runes >= runeMax(battle) && battle.run.mp < battle.player.maxMp * 0.4 ? use('rune_shatter', battle.enemies.indexOf(alive[0])) : null;
    },
    prime: function (battle, skill, m) { if (skill.id === 'rune_shatter') { m.runes = 2; runeMods(battle, m); } }
  });

  // ------------------------------------------------------------------------------------
  // Sharpshooter -- Steady Aim: spend turns aiming (+110% power each, 3 = sure critical) for
  // one huge shot; every heavy blow shakes off an Aim. Decision: aim or fire under pressure.
  // ------------------------------------------------------------------------------------
  var AIM = { max: 3, power: 1.1, freeLevel: 15, shakePct: 0.15 };
  CM.register('sharpshooter', {
    name: 'เล็งนิ่ง', nameEn: 'Steady Aim',
    short: 'เล็งสะสมพลังให้นัดเดียวจอด โดนตีแรงแล้วเสียศูนย์', shortEn: 'Aim to build one huge shot; a heavy blow throws it off',
    desc: '"เล็ง" สะสม +1 (สูงสุด 3) การโจมตีครั้งถัดไปแรงขึ้น 110% ต่อชั้น และคริติคอลแน่นอนเมื่อเล็งครบ 3 โดนโจมตีแรงเกิน 15% ของ HP สูงสุดจะเสียการเล็ง 1 ตั้งแต่ Lv 15 การเล็งครั้งแรกของแต่ละรอบไม่เสียแอคชัน',
    descEn: 'Aim adds +1 (3 max): your next attack gets +110% power per Aim and is a sure critical at 3. A heavy blow (over 15% of your max HP) costs one Aim. From Lv 15 your first Aim each round is a free action.',
    init: function () { return { aim: 0, freeRound: 0 }; },
    skills: [cmd('sharpshooter', 'sharp_aim', 'เล็ง', 'Aim', { icon: 'buffUp', vfxFamily: 'empower',
      desc: 'เล็ง +1: นัดถัดไปแรงขึ้น 110% (ครบ 3 คริติคอลแน่นอน)', descEn: 'Aim +1: your next shot gets +110% power (a sure critical at 3).' })],
    block: function (battle, skill, m) { return skill.id === 'sharp_aim' && m.aim >= AIM.max ? txt('เล็งเต็มแล้ว', 'Fully aimed') : null; },
    perform: function (battle, skill, m, events) {
      m.aim += 1;
      note(events, 'เล็ง ' + m.aim + '/' + AIM.max, 'Aim ' + m.aim + '/' + AIM.max);
      if (battle.run.level >= AIM.freeLevel && m.freeRound !== battle.round) { m.freeRound = battle.round; return true; }
      return false;
    },
    beforeAttack: function (battle, skill, m, events) {
      if (!m.aim) return null;
      var n = m.aim;
      m.aim = 0;
      note(events, 'ยิง! (เล็ง x' + n + ')', 'Fire! (Aim x' + n + ')', n >= AIM.max ? 'crit' : '');
      return { powerMult: 1 + AIM.power * n, forceCrit: n >= AIM.max };
    },
    // Only a heavy blow (over 15% of max HP) shakes your aim.
    afterIncoming: function (battle, m, enemy, dmg, events) {
      if (m.aim > 0 && dmg > battle.player.maxHp * AIM.shakePct) { m.aim -= 1; note(events, 'เสียศูนย์! เล็งเหลือ ' + m.aim, 'Shaken! Aim ' + m.aim, 'weak'); }
    },
    gauge: function (battle, m, label) { return { icon: 'buffUp', label: label, value: m.aim + '/' + AIM.max, pips: { filled: m.aim, max: AIM.max }, active: m.aim >= AIM.max }; },
    bot: function (battle, m, use, alive) {
      var boss = alive.length === 1 && alive[0].hp > alive[0].maxHp * 0.4;
      return boss && m.aim < AIM.max && battle.run.hp > battle.player.maxHp * 0.5 ? use('sharp_aim') : null;
    },
    prime: function (battle, skill, m) { if (skill.id === 'sharp_aim') m.aim = 0; }
  });

  // ------------------------------------------------------------------------------------
  // Battlemage -- Spellblade: magic skills charge your blade; a basic Attack releases every
  // charge as extra hits of that spell's element. Decision: weave spells and strikes.
  // ------------------------------------------------------------------------------------
  var BLADE_CHARGE = { max: 3, power: 0.5, powerHigh: 0.65, highLevel: 20 };
  CM.register('battlemage', {
    name: 'ดาบเวท', nameEn: 'Spellblade',
    short: 'ร่ายเวทชาร์จดาบ แล้วโจมตีปกติปล่อยธาตุเพิ่ม', shortEn: 'Spells charge your blade; a basic Attack releases them',
    desc: 'ทุกสกิลธาตุ (ไม่ใช่กายภาพ) ชาร์จดาบ +1 (สูงสุด 3) จดธาตุล่าสุดไว้ โจมตีปกติครั้งถัดไปปล่อยชาร์จทั้งหมดเป็นฮิตธาตุนั้นเพิ่ม 1 ครั้งต่อชาร์จ (พลัง 0.5 ใช้ MAG เป็น 0.65 เมื่อถึง Lv 20)',
    descEn: 'Every elemental (non-physical) skill charges your blade +1 (3 max) with that element. Your next basic Attack releases every charge as an extra hit of that element (power 0.5 from MAG, 0.65 from Lv 20).',
    init: function () { return { charge: 0, element: null }; },
    beforeAttack: function (battle, skill, m, events) {
      if (skill.id !== 'attack' || !m.charge) return null;
      var n = m.charge, el = m.element || 'almighty', power = battle.run.level >= BLADE_CHARGE.highLevel ? BLADE_CHARGE.powerHigh : BLADE_CHARGE.power;
      m.charge = 0;
      note(events, 'ปลดพลังดาบเวท x' + n + '!', 'Spellblade release x' + n + '!', 'crit');
      var extra = [];
      for (var i = 0; i < n; i++) extra.push({ element: el, power: power, scaleStat: 'mag' });
      return { extraHits: extra };
    },
    afterAction: function (battle, kind, skill, m) {
      if (kind !== 'skill' || !skill || skill.kind === 'mech' || skill.element === 'phys') return;
      m.charge = Math.min(BLADE_CHARGE.max, m.charge + 1);
      m.element = skill.element;
    },
    gauge: function (battle, m, label) { return { icon: 'elec', label: label, value: m.charge + '/' + BLADE_CHARGE.max + (m.element ? ' · ' + m.element.toUpperCase() : ''), pips: { filled: m.charge, max: BLADE_CHARGE.max }, active: m.charge > 0 }; },
    bot: function (battle, m, use, alive) {
      return m.charge >= 2 && alive.length ? { kind: 'attack', targetIndex: battle.enemies.indexOf(alive[0]) } : null;
    }
  });

  // ------------------------------------------------------------------------------------
  // Blade Knight -- Momentum: attacking again and again builds Momentum (+6% power each);
  // anything else breaks the chain. Unleash spends it all in one blow. Decision: ride the
  // chain, or cash it before you have to guard or heal.
  // ------------------------------------------------------------------------------------
  var MOMENTUM = { max: 5, maxHigh: 6, highLevel: 20, power: 0.06, unleash: 0.6, minUnleash: 3 };
  function momentumMax(battle) { return battle.run.level >= MOMENTUM.highLevel ? MOMENTUM.maxHigh : MOMENTUM.max; }
  CM.register('blade', {
    name: 'แรงส่ง', nameEn: 'Momentum',
    short: 'โจมตีต่อเนื่องสะสมแรงส่ง แล้วปลดออกเป็นดาบเดียว', shortEn: 'Chain attacks to build Momentum, then unleash it in one blow',
    desc: 'ทุกการโจมตีต่อเนื่องได้แรงส่ง +1 (สูงสุด 5 เป็น 6 เมื่อถึง Lv 20) แต่ละชั้นทำให้การโจมตีแรงขึ้น 6% ใช้แอคชันอื่น (ตั้งรับ บัฟ ไอเทม...) แรงส่งหายหมด "ปลดแรงส่ง" (ต้องมี 3 ขึ้นไป) ใช้ทั้งหมดฟันเป้าหมายทีเดียว',
    descEn: 'Each attack in a row adds Momentum (5 max, 6 from Lv 20), each +6% attack power. Any other action (guard, buff, item...) breaks the chain. Unleash (3+ Momentum) spends it all in one blow.',
    init: function () { return { momentum: 0 }; },
    skills: [cmd('blade', 'blade_unleash', 'ปลดแรงส่ง', 'Unleash', { target: 'singleEnemy', icon: 'blade', vfxFamily: 'slash',
      desc: 'ใช้แรงส่งทั้งหมดฟันเป้าหมายทีเดียว (ต้องมี 3 ขึ้นไป)', descEn: 'Spend all Momentum in one blow (needs 3+).' })],
    block: function (battle, skill, m) { return skill.id === 'blade_unleash' && m.momentum < MOMENTUM.minUnleash ? txt('ต้องมีแรงส่ง 3', 'Needs 3 Momentum') : null; },
    perform: function (battle, skill, m, events, ctx, targetIndex) {
      var e = enemyAt(battle, targetIndex), n = m.momentum;
      if (!e) return false;
      m.momentum = 0; m.unleashed = true;
      var power = MOMENTUM.unleash * n;
      U.strikeEnemy(battle, e, U.mechDamage(battle, e, 'phys', power, ctx), txt('ปลดแรงส่ง x' + n + ' ใส่ ', 'Unleash x' + n + ' on ') + e.name, events, ctx, F().breakAmount({ power: Math.min(power, 2.5) }));
      return false;
    },
    beforeAttack: function (battle, skill, m) { return m.momentum ? { powerMult: 1 + MOMENTUM.power * m.momentum } : null; },
    afterAction: function (battle, kind, skill, m, events) {
      if (m.unleashed) { m.unleashed = false; return; }
      if ((kind === 'attack' || kind === 'skill') && skill && skill.kind === 'attack') { m.momentum = Math.min(momentumMax(battle), m.momentum + 1); return; }
      if (m.momentum) { note(events, 'แรงส่งขาด', 'Momentum broken', 'weak'); m.momentum = 0; }
    },
    gauge: function (battle, m, label) { var max = momentumMax(battle); return { icon: 'blade', label: label, value: m.momentum + '/' + max, pips: { filled: m.momentum, max: max }, active: m.momentum >= MOMENTUM.minUnleash }; },
    // Unleash is a finisher: only when the weakest foe would fall to it.
    bot: function (battle, m, use, alive) {
      if (m.momentum < MOMENTUM.minUnleash) return null;
      var t = alive.slice().sort(function (a, b) { return a.hp - b.hp; })[0];
      return t && t.hp < t.maxHp * 0.15 ? use('blade_unleash', battle.enemies.indexOf(t)) : null;
    },
    prime: function (battle, skill, m) { if (skill.id === 'blade_unleash') m.momentum = MOMENTUM.minUnleash; }
  });

  // ------------------------------------------------------------------------------------
  // Elementalist -- Resonance: each spell of a different element from the last one adds
  // Resonance (+10% spell power each); repeating an element resets it. At full Resonance the
  // next spell is free. Decision: rotate elements, or keep hammering a weakness.
  // ------------------------------------------------------------------------------------
  var RESO = { max: 3, maxHigh: 4, highLevel: 15, power: 0.1 };
  function resoMax(battle) { return battle.run.level >= RESO.highLevel ? RESO.maxHigh : RESO.max; }
  function isSpell(skill) { return skill && skill.kind === 'attack' && skill.id !== 'attack' && skill.element !== 'phys' && skill.element !== 'almighty'; }
  CM.register('elementalist', {
    name: 'ธาตุสั่นพ้อง', nameEn: 'Resonance',
    short: 'สลับธาตุไม่ซ้ำเพื่อสะสมพลัง ครบแล้วร่ายฟรี', shortEn: 'Alternate elements to build Resonance; at full the next spell is free',
    desc: 'ร่ายเวทธาตุที่ต่างจากครั้งก่อนได้สั่นพ้อง +1 (สูงสุด 3 เป็น 4 เมื่อถึง Lv 15) แต่ละชั้นเวทแรงขึ้น 10% ร่ายธาตุซ้ำ สั่นพ้องหายหมด เมื่อสั่นพ้องเต็ม เวทครั้งถัดไปไม่เสีย MP',
    descEn: 'Casting a spell of a different element from your last one adds Resonance (3 max, 4 from Lv 15), each +10% spell power. Repeating an element resets it. At full Resonance your next spell costs no MP.',
    init: function () { return { reso: 0, last: null, free: false }; },
    cost: function (battle, skill, m, out) {
      if (!isSpell(skill) || m.reso < resoMax(battle)) return;
      out.mp = 0;
      out.res = { key: 'reso', amount: m.reso, th: 'สั่นพ้อง', en: 'Resonance' };
    },
    pay: function (battle, skill, m, c) { if (c.res && c.res.key === 'reso') m.free = true; },
    beforeAttack: function (battle, skill, m, events) {
      if (!isSpell(skill) || !m.reso) return null;
      if (m.free) note(events, 'สั่นพ้องเต็ม! ร่ายฟรี', 'Full Resonance! Free cast', 'crit');
      return { powerMult: 1 + RESO.power * m.reso };
    },
    afterAction: function (battle, kind, skill, m) {
      if (kind !== 'skill' || !isSpell(skill)) return;
      if (m.free) { m.free = false; m.reso = 0; m.last = skill.element; return; }
      m.reso = skill.element !== m.last && m.last ? Math.min(resoMax(battle), m.reso + 1) : 0;
      m.last = skill.element;
    },
    gauge: function (battle, m, label) { var max = resoMax(battle); return { icon: 'sparkles', label: label, value: m.reso + '/' + max + (m.last ? ' · ' + txt('ล่าสุด ', 'last ') + m.last.toUpperCase() : ''), pips: { filled: m.reso, max: max }, active: m.reso >= max }; }
  });

  // ------------------------------------------------------------------------------------
  // Cleric -- Grace: healing past full HP becomes a Barrier that soaks damage. Decision: heal
  // early (shield up before the blow) or wait (no waste).
  // ------------------------------------------------------------------------------------
  var GRACE = { cap: 0.12, capHigh: 0.2, highLevel: 20 };
  function graceCap(battle) { return Math.round(battle.player.maxHp * (battle.run.level >= GRACE.highLevel ? GRACE.capHigh : GRACE.cap)); }
  CM.register('cleric', {
    name: 'พระคุ้มครอง', nameEn: 'Grace',
    short: 'ฮีลเกิน HP เต็มกลายเป็นเกราะป้องกัน', shortEn: 'Healing past full HP becomes a protective Barrier',
    desc: 'การฮีลส่วนที่เกิน HP เต็มกลายเป็นเกราะศักดิ์สิทธิ์ (สูงสุด 12% ของ HP เป็น 20% เมื่อถึง Lv 20) เกราะรับดาเมจก่อน HP และอยู่จนจบการต่อสู้',
    descEn: 'Healing past full HP becomes a holy Barrier (up to 12% of max HP, 20% from Lv 20). The Barrier soaks damage before your HP and lasts the whole fight.',
    init: function () { return { barrier: 0 }; },
    afterHeal: function (battle, skill, m, overflow, events) {
      if (!overflow) return;
      var before = m.barrier;
      m.barrier = Math.min(graceCap(battle), m.barrier + overflow);
      if (m.barrier > before) note(events, 'เกราะศักดิ์สิทธิ์ +' + (m.barrier - before), 'Barrier +' + (m.barrier - before));
    },
    incoming: function (battle, m, enemy, dmg, events) {
      if (!m.barrier) return null;
      var soak = Math.min(m.barrier, dmg);
      m.barrier -= soak;
      note(events, 'เกราะรับดาเมจ ' + soak + (m.barrier ? '' : txt(' (แตก)', ' (broken)')), 'Barrier absorbs ' + soak + (m.barrier ? '' : ' (broken)'), m.barrier ? '' : 'weak');
      return dmg - soak > 0 ? { dmg: dmg - soak, absorbed: false } : { dmg: 0, absorbed: true };
    },
    gauge: function (battle, m, label) { return { icon: 'shieldGuard', label: label, value: m.barrier + '/' + graceCap(battle), active: m.barrier > 0 }; }
  });

  // ------------------------------------------------------------------------------------
  // Berserker -- Rage: blows taken and attacks landed build Rage (+2% damage each). Rampage
  // spends 8 Rage for an extra action and a heal. Decision: bank the damage, or turn it into
  // tempo and survival.
  // ------------------------------------------------------------------------------------
  var RAGE = { max: 10, power: 0.02, hurtStep: 0.08, rampage: 8, heal: 0.1, healHigh: 0.2, highLevel: 20 };
  CM.register('berserker', {
    name: 'โทสะ', nameEn: 'Rage',
    short: 'โดนตีและโจมตีสะสมโทสะ แปลงเป็นแอคชันเพิ่มได้', shortEn: 'Build Rage by fighting; spend it for an extra action',
    desc: 'โดนโจมตีได้โทสะ +1 ต่อ 8% ของ HP ที่เสีย และโจมตีโดนได้ +1 (สูงสุด 10) แต่ละชั้นดาเมจ +2% "อาละวาด" ใช้โทสะ 8 ได้แอคชันเพิ่ม 1 และฟื้น HP 10% (20% เมื่อถึง Lv 20)',
    descEn: 'Taking damage builds Rage (+1 per 8% of max HP lost) and every attack that lands +1 (10 max); each Rage is +2% damage. Rampage spends 8 Rage for an extra action and heals 10% HP (20% from Lv 20).',
    init: function () { return { rage: 0 }; },
    skills: [cmd('berserker', 'berserk_rampage', 'อาละวาด', 'Rampage', { icon: 'buffUp', vfxFamily: 'roar',
      desc: 'ใช้โทสะ 8: ได้แอคชันเพิ่ม 1 และฟื้น HP 10%', descEn: 'Spend 8 Rage: gain an extra action and heal 10% HP.' })],
    block: function (battle, skill, m) { return skill.id === 'berserk_rampage' && m.rage < RAGE.rampage ? txt('ต้องมีโทสะ ' + RAGE.rampage, 'Needs ' + RAGE.rampage + ' Rage') : null; },
    perform: function (battle, skill, m, events) {
      m.rage -= RAGE.rampage;
      U.healPlayer(battle, battle.player.maxHp * (battle.run.level >= RAGE.highLevel ? RAGE.healHigh : RAGE.heal), events);
      battle.playerAP = Math.min(battle.playerAP + 1, 4);
      note(events, 'อาละวาด! แอคชันเพิ่ม', 'Rampage! Extra action', 'crit');
      return true;
    },
    beforeAttack: function (battle, skill, m) { return m.rage ? { powerMult: 1 + RAGE.power * m.rage } : null; },
    afterAction: function (battle, kind, skill, m) {
      if ((kind === 'attack' || kind === 'skill') && skill && skill.kind === 'attack') m.rage = Math.min(RAGE.max, m.rage + 1);
    },
    afterIncoming: function (battle, m, enemy, dmg) {
      if (dmg > 0) m.rage = Math.min(RAGE.max, m.rage + Math.max(1, Math.floor(dmg / (battle.player.maxHp * RAGE.hurtStep))));
    },
    gauge: function (battle, m, label) { return { icon: 'buffUp', label: label, value: m.rage + '/' + RAGE.max, pips: { filled: m.rage, max: RAGE.max }, active: m.rage >= RAGE.rampage }; },
    bot: function (battle, m, use) { return m.rage >= RAGE.rampage && battle.run.hp < battle.player.maxHp * 0.5 ? use('berserk_rampage') : null; },
    prime: function (battle, skill, m) { if (skill.id === 'berserk_rampage') m.rage = RAGE.rampage; }
  });

  // ------------------------------------------------------------------------------------
  // Ranger -- Mark Prey: mark one enemy (free once per round) to take +20% from you. Killing
  // the prey returns MP and moves the mark to the toughest foe left. Decision: whom to hunt.
  // ------------------------------------------------------------------------------------
  var PREY = { mult: 0.2, multHigh: 0.3, highLevel: 20, killMp: 5 };
  CM.register('ranger', {
    name: 'หมายหัวเหยื่อ', nameEn: 'Mark Prey',
    short: 'หมายหัวศัตรูให้รับดาเมจเพิ่ม ฆ่าแล้วได้ MP คืน', shortEn: 'Mark a foe to take more damage; the kill returns MP',
    desc: '"หมายหัว" ศัตรู 1 ตัว (ฟรี 1 ครั้งต่อรอบ) ให้รับดาเมจจากคุณ +20% (30% เมื่อถึง Lv 20) ฆ่าเหยื่อได้คืน MP 5 และเครื่องหมายย้ายไปที่ศัตรูที่ HP มากที่สุดอัตโนมัติ',
    descEn: 'Mark one enemy (free once per round): it takes +20% damage from you (30% from Lv 20). Killing your prey returns 5 MP and moves the mark to the toughest enemy left.',
    init: function () { return { prey: null, markRound: 0 }; },
    skills: [cmd('ranger', 'ranger_mark', 'หมายหัว', 'Mark Prey', { element: 'wind', target: 'singleEnemy', icon: 'wind', vfxFamily: 'sigil',
      desc: 'เป้าหมายรับดาเมจจากคุณ +20% · ฟรี 1 ครั้งต่อรอบ', descEn: 'The target takes +20% damage from you. Free once per round.' })],
    perform: function (battle, skill, m, events, ctx, targetIndex) {
      var e = enemyAt(battle, targetIndex);
      if (!e) return false;
      m.prey = e.uid;
      note(events, 'หมายหัว ' + e.name, e.name + ' marked as prey');
      if (m.markRound !== battle.round) { m.markRound = battle.round; return true; }
      return false;
    },
    targetMult: function (battle, m, enemy) { return enemy.uid === m.prey ? 1 + (battle.run.level >= PREY.highLevel ? PREY.multHigh : PREY.mult) : 1; },
    sweep: function (battle, m, events) {
      if (!m.prey || byUidAlive(battle, m.prey)) return;
      m.prey = null;
      if (battle.over) return;
      U.restoreMp(battle, PREY.killMp, events);
      var next = U.living(battle);
      if (next.length) { var t = healthiest(next); m.prey = t.uid; note(events, 'ล่าเหยื่อสำเร็จ! หมายหัว ' + t.name + ' ต่อ', 'Prey down! Now hunting ' + t.name); }
    },
    gauge: function (battle, m, label) {
      var t = byUidAlive(battle, m.prey);
      return { icon: 'wind', label: label, value: t ? txt('เหยื่อ: ', 'Prey: ') + t.name : txt('ยังไม่หมายหัว', 'No prey'), active: !!t };
    },
    bot: function (battle, m, use, alive) { return !m.prey && alive.length ? use('ranger_mark', battle.enemies.indexOf(healthiest(alive))) : null; }
  });
})();
