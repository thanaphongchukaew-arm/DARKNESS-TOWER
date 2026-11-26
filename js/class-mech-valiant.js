// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Class mechanics for the five Valiant classes, unlocked by clearing Nightmare. They hook into
// the game's core systems (action tempo, stagger, HP costs, kills, damage over time) more deeply
// than the base classes, as a reward for players who already know those systems. Same rules
// as class-mech.js: plain-JSON state on battle.mech, mechanic hits through strikeEnemy with an
// explicit Break amount, kills from damage-over-time only in the minion phase.
(function () {
  var G = window.Game, CM = G.ClassMech, U = CM.util;
  var txt = U.txt, note = U.note;
  function F() { return G.Formulas; }
  function cmd(classId, id, name, nameEn, opts) {
    return Object.assign({ id: id, name: name, nameEn: nameEn, element: 'phys', kind: 'mech', mech: id, cost: 0, target: 'self', minLevel: 1, classOnly: classId }, opts);
  }
  function enemyAt(battle, i) { var e = battle.enemies[i]; return e && e.alive ? e : null; }
  function byUidAlive(battle, uid) { return battle.enemies.find(function (e) { return e.uid === uid && e.alive; }) || null; }
  function pruneDead(battle, table) { Object.keys(table).forEach(function (uid) { if (!byUidAlive(battle, uid)) delete table[uid]; }); }

  // ------------------------------------------------------------------------------------
  // Vanguard -- Flow: every action after the first in the same turn hits 15% harder per step,
  // but ending a turn on a chain of 3+ leaves you off balance (+20% damage taken this round).
  // Decision: how far to push the chain.
  // ------------------------------------------------------------------------------------
  var FLOW = { step: 0.15, maxSteps: 4, risk: 3, riskHigh: 4, highLevel: 20, exposed: 0.2 };
  function flowSync(battle, m) { if (m.round !== battle.round) { m.round = battle.round; m.chain = 0; m.warned = false; } }
  function flowRisk(battle) { return battle.run.level >= FLOW.highLevel ? FLOW.riskHigh : FLOW.risk; }
  CM.register('vanguard', {
    name: 'กระแสต่อเนื่อง', nameEn: 'Flow',
    short: 'ยิ่งต่อแอคชันในเทิร์นเดียวยิ่งแรง แต่เชนยาวแล้วเสียหลัก', shortEn: 'Each chained action hits harder, but a long chain leaves you exposed',
    desc: 'ทุกแอคชันถัดไปในเทิร์นเดียวกันแรงขึ้น 15% ต่อขั้น (สูงสุด +60%) แต่ถ้าในรอบนั้นใช้แอคชันไป 3 ครั้งขึ้นไป (4 เมื่อถึง Lv 20) คุณจะเสียหลัก รับดาเมจ +20% จนจบรอบ',
    descEn: 'Every further action in the same turn hits 15% harder per step (up to +60%). But taking 3+ actions in a round (4 from Lv 20) leaves you off balance: +20% damage taken until the round ends.',
    init: function () { return { chain: 0, round: 0, warned: false }; },
    beforeAttack: function (battle, skill, m) {
      flowSync(battle, m);
      return m.chain ? { powerMult: 1 + FLOW.step * Math.min(m.chain, FLOW.maxSteps) } : null;
    },
    afterAction: function (battle, kind, skill, m, events) {
      flowSync(battle, m);
      if (kind === 'guard') return;
      m.chain += 1;
      if (m.chain >= flowRisk(battle) && !m.warned) { m.warned = true; note(events, 'เชนยาวเกินไป · เสียหลัก!', 'Overextended · off balance!', 'weak'); }
    },
    incoming: function (battle, m, enemy, dmg) {
      flowSync(battle, m);
      return m.chain >= flowRisk(battle) ? { dmg: Math.round(dmg * (1 + FLOW.exposed)), absorbed: false } : null;
    },
    gauge: function (battle, m, label) {
      var chain = m.round === battle.round ? m.chain : 0, risk = flowRisk(battle);
      return { icon: 'wind', label: label, value: txt('เชน ', 'Chain ') + chain + (chain >= risk ? txt(' · เสียหลัก', ' · exposed') : ' · +' + Math.round(FLOW.step * Math.min(chain, FLOW.maxSteps) * 100) + '%'), pips: { filled: Math.min(chain, risk), max: risk }, active: chain >= risk };
    }
  });

  // ------------------------------------------------------------------------------------
  // Warlord -- Break the Line: your hits fill the stagger bar 40% faster, and every enemy you
  // stagger sends a wave of stagger (30% of a bar, 45% from Lv 20) through the rest of the
  // pack. Decision: which foe to topple first to set off the chain.
  // ------------------------------------------------------------------------------------
  var LINE = { breakMult: 1.4, spread: 0.3, spreadHigh: 0.45, highLevel: 20 };
  CM.register('warlord', {
    name: 'ทลายแนวรบ', nameEn: 'Break the Line',
    short: 'ลดสตักเกอร์เร็วขึ้น ล้มตัวหนึ่งแล้วสตักเกอร์ลามไปทั้งฝูง', shortEn: 'Stagger faster; toppling one foe shakes the whole pack',
    desc: 'การโจมตีของคุณลดแถบสตักเกอร์เร็วขึ้น 40% และทุกครั้งที่คุณทำศัตรูล้ม ศัตรูตัวอื่นทั้งหมดได้สตักเกอร์เพิ่ม 30% ของแถบ (45% เมื่อถึง Lv 20) เลือกล้มให้ถูกตัวเพื่อให้ล้มต่อกันทั้งฝูง',
    descEn: 'Your attacks drain the stagger bar 40% faster, and every enemy you stagger sends 30% of a stagger bar (45% from Lv 20) into every other enemy. Topple the right one to bring the whole pack down.',
    init: function () { return { waves: 0 }; },
    beforeAttack: function () { return { breakMult: LINE.breakMult }; },
    afterAction: function (battle, kind, skill, m, events, ctx) {
      var toppled = events.filter(function (e) { return e.type === 'enemyBroken'; }).map(function (e) { return e.targetUid; });
      if (!toppled.length) return;
      var share = battle.run.level >= LINE.highLevel ? LINE.spreadHigh : LINE.spread;
      toppled.forEach(function (uid) {
        U.living(battle).forEach(function (e) {
          if (e.uid === uid || e.broken) return;
          ctx.applyBreak(e, 0, events, Math.round(F().breakMax(e) * share));
        });
      });
      m.waves += 1;
      note(events, 'แนวรบสั่นคลอน!', 'The line wavers!', 'crit');
    },
    gauge: function (battle, m, label) {
      var broken = U.living(battle).filter(function (e) { return e.broken; }).length;
      return { icon: 'swordAttack', label: label, value: txt('ล้มอยู่ ', 'Staggered ') + broken + '/' + U.living(battle).length, active: broken > 0 };
    }
  });

  // ------------------------------------------------------------------------------------
  // Deathbringer -- Blood Pool: HP you sacrifice (and a quarter of the damage you take) pools
  // up. Harvest pours the pool into one foe as raw damage and returns part of it as HP.
  // Decision: let the pool grow while your HP falls, or cash it in now.
  // ------------------------------------------------------------------------------------
  var POOL = { cap: 0.4, capHigh: 0.6, highLevel: 20, takenShare: 0.25, dmgMult: 2.0, heal: 0.3, healHigh: 0.5 };
  function poolCap(battle) { return Math.round(battle.player.maxHp * (battle.run.level >= POOL.highLevel ? POOL.capHigh : POOL.cap)); }
  function addPool(battle, m, n) { m.pool = Math.min(poolCap(battle), m.pool + Math.max(0, Math.round(n))); }
  CM.register('deathbringer', {
    name: 'บ่อเลือด', nameEn: 'Blood Pool',
    short: 'HP ที่สังเวยไหลลงบ่อ แล้วเก็บเกี่ยวเป็นดาเมจและฮีล', shortEn: 'Sacrificed HP fills a pool; harvest it as damage and healing',
    desc: 'HP ที่สังเวยให้สกิลและ 25% ของดาเมจที่โดน ไหลลงบ่อเลือด (สูงสุด 40% ของ HP เป็น 60% เมื่อถึง Lv 20) "เก็บเกี่ยวโลหิต" เทบ่อทั้งหมดใส่ศัตรู 1 ตัวเป็นดาเมจตรง 200% ของบ่อ และฟื้น HP 30% ของบ่อ (50% เมื่อถึง Lv 20)',
    descEn: 'HP you sacrifice to skills, and 25% of the damage you take, fills a Blood Pool (up to 40% of max HP, 60% from Lv 20). Blood Harvest pours it all into one foe as raw damage (200% of the pool) and heals you for 30% of it (50% from Lv 20).',
    init: function () { return { pool: 0 }; },
    skills: [cmd('deathbringer', 'blood_harvest', 'เก็บเกี่ยวโลหิต', 'Blood Harvest', { element: 'dark', target: 'singleEnemy', icon: 'dark', vfxFamily: 'drain',
      desc: 'เทบ่อเลือดใส่เป้าหมายเป็นดาเมจตรง และฟื้น HP บางส่วน', descEn: 'Pour the Blood Pool into the target as raw damage and heal part of it.' })],
    block: function (battle, skill, m) { return skill.id === 'blood_harvest' && m.pool < Math.round(battle.player.maxHp * 0.05) ? txt('บ่อเลือดยังน้อยเกินไป', 'The pool is too shallow') : null; },
    perform: function (battle, skill, m, events, ctx, targetIndex) {
      var e = enemyAt(battle, targetIndex), pool = m.pool;
      if (!e) return false;
      m.pool = 0;
      var amount = Math.max(1, Math.round(pool * POOL.dmgMult));
      U.strikeEnemy(battle, e, amount, txt('เก็บเกี่ยวโลหิต ', 'Blood Harvest on ') + e.name, events, ctx, F().breakAmount({ power: Math.min(2.5, 1 + pool / battle.player.maxHp * 4) }));
      U.healPlayer(battle, pool * (battle.run.level >= POOL.highLevel ? POOL.healHigh : POOL.heal), events);
      return false;
    },
    afterAction: function (battle, kind, skill, m, events) {
      events.forEach(function (e) { if (e.type === 'hpSacrifice') addPool(battle, m, e.amount); });
    },
    afterIncoming: function (battle, m, enemy, dmg) { addPool(battle, m, dmg * POOL.takenShare); },
    gauge: function (battle, m, label) { var cap = poolCap(battle); return { icon: 'dark', label: label, value: m.pool + '/' + cap, active: m.pool >= cap * 0.5 }; },
    bot: function (battle, m, use, alive) {
      var cap = poolCap(battle);
      if (m.pool < cap * 0.6) return null;
      var t = alive.slice().sort(function (a, b) { return b.hp - a.hp; })[0];
      return t ? use('blood_harvest', battle.enemies.indexOf(t)) : null;
    },
    prime: function (battle, skill, m) { if (skill.id === 'blood_harvest') m.pool = Math.round(battle.player.maxHp * 0.2); }
  });

  // ------------------------------------------------------------------------------------
  // Executioner -- Verdict: execute a foe at low HP outright (20%, 25% from Lv 20; bosses 8%).
  // The execution is a free action, heals you, and fills the rest of the pack with dread
  // (-15% ATK/MAG). Decision: wound several or finish one.
  // ------------------------------------------------------------------------------------
  var VERDICT = { threshold: 0.2, thresholdHigh: 0.25, bossThreshold: 0.08, highLevel: 20, heal: 0.08, dread: 0.15 };
  function canExecute(battle, e) {
    var t = e.isBoss ? VERDICT.bossThreshold : battle.run.level >= VERDICT.highLevel ? VERDICT.thresholdHigh : VERDICT.threshold;
    return e.alive && e.hp <= e.maxHp * t;
  }
  CM.register('executioner', {
    name: 'คำพิพากษา', nameEn: 'Verdict',
    short: 'ประหารศัตรู HP ต่ำทันที ได้แอคชันคืนและทำให้ที่เหลือขวัญเสีย', shortEn: 'Execute a low-HP foe outright; free, and the rest lose heart',
    desc: '"พิพากษา" ประหารศัตรูที่ HP เหลือไม่เกิน 20% ทันที (25% เมื่อถึง Lv 20 บอส 8%) ไม่เสียแอคชัน ฟื้น HP 8% และศัตรูที่เหลือขวัญเสีย ATK/MAG −15% 3 เทิร์น',
    descEn: 'Verdict executes a foe at or below 20% HP outright (25% from Lv 20, bosses 8%). It is a free action, heals you 8% HP, and the rest of the pack loses heart: −15% ATK/MAG for 3 turns.',
    init: function () { return { kills: 0 }; },
    skills: [cmd('executioner', 'exec_verdict', 'พิพากษา', 'Verdict', { element: 'almighty', target: 'singleEnemy', icon: 'swordAttack', vfxFamily: 'slash',
      desc: 'ประหารศัตรูที่ HP ไม่เกิน 20% ทันที · ไม่เสียแอคชัน', descEn: 'Execute a foe at or below 20% HP. Free action.' })],
    block: function (battle, skill, m) {
      if (skill.id !== 'exec_verdict') return null;
      return U.living(battle).some(function (e) { return canExecute(battle, e); }) ? null : txt('ยังไม่มีศัตรูที่ประหารได้', 'No foe low enough to execute');
    },
    perform: function (battle, skill, m, events, ctx, targetIndex) {
      var e = enemyAt(battle, targetIndex);
      if (!e || !canExecute(battle, e)) { note(events, 'เป้าหมายนี้ยังไม่อ่อนแรงพอ', 'That target is not low enough', 'weak'); return true; }
      m.kills += 1;
      U.strikeEnemy(battle, e, e.hp, txt('พิพากษา! ประหาร ', 'Verdict! Executed ') + e.name, events, ctx, 0);
      U.healPlayer(battle, battle.player.maxHp * VERDICT.heal, events);
      U.living(battle).forEach(function (o) {
        ctx.applyStatMod(o.debuffs, 'atkmag', -VERDICT.dread, 3);
        events.push({ type: 'buff', targetUid: o.uid, side: 'enemy', targetName: o.name, stat: 'atkmag', amount: -VERDICT.dread });
      });
      return true;
    },
    gauge: function (battle, m, label) {
      var ready = U.living(battle).filter(function (e) { return canExecute(battle, e); }).map(function (e) { return e.name; });
      return { icon: 'swordAttack', label: label, value: ready.length ? txt('ประหารได้: ', 'Executable: ') + ready.join(', ') : txt('ยังไม่มีเป้า', 'No target'), active: ready.length > 0 };
    },
    bot: function (battle, m, use, alive) {
      var t = alive.find(function (e) { return canExecute(battle, e); });
      return t ? use('exec_verdict', battle.enemies.indexOf(t)) : null;
    },
    prime: function (battle, skill, m) { var e = U.living(battle)[0]; if (e) e.hp = Math.max(1, Math.floor(e.maxHp * 0.05)); }
  });

  // ------------------------------------------------------------------------------------
  // Shadowhunter -- Wounds: every hit opens a Wound (5 max, 7 from Lv 20). Wounds bleed every
  // round (1.2% max HP each, a third on bosses). Rend tears them open: three rounds of bleeding
  // at once. Decision: let them bleed, or rip them now.
  // ------------------------------------------------------------------------------------
  var WOUND = { max: 5, maxHigh: 7, highLevel: 20, bleed: 0.012, bossShare: 0.33, rendRounds: 3 };
  function woundMax(battle) { return battle.run.level >= WOUND.highLevel ? WOUND.maxHigh : WOUND.max; }
  function bleedOf(e, n) { return Math.max(1, Math.round(e.maxHp * WOUND.bleed * n * (e.isBoss ? WOUND.bossShare : 1))); }
  CM.register('shadowhunter', {
    name: 'บาดแผลลึก', nameEn: 'Deep Wounds',
    short: 'ทุกฮิตทิ้งแผลเลือดไหล หรือฉีกแผลเอาดาเมจทันที', shortEn: 'Every hit leaves a bleeding wound; rend them for burst',
    desc: 'ทุกฮิตเปิดแผล +1 บนเป้าหมาย (สูงสุด 5 เป็น 7 เมื่อถึง Lv 20) แผลเลือดไหลทุกรอบ 1.2% ของ HP สูงสุดต่อแผล (บอส 1/3) "ฉีกแผล" เอาเลือดไหล 3 รอบมาทีเดียวแล้วแผลปิด',
    descEn: 'Every hit opens a Wound on its target (5 max, 7 from Lv 20). Wounds bleed 1.2% of max HP each every round (a third on bosses). Rend tears them open for three rounds of bleeding at once and closes them.',
    init: function () { return { wounds: {} }; },
    skills: [cmd('shadowhunter', 'hunter_rend', 'ฉีกแผล', 'Rend', { element: 'dark', target: 'singleEnemy', icon: 'dark', vfxFamily: 'curse',
      desc: 'เลือดไหล 3 รอบมาทีเดียว แล้วแผลปิด', descEn: 'Three rounds of bleeding at once, then the wounds close.' })],
    block: function (battle, skill, m) {
      if (skill.id !== 'hunter_rend') return null;
      return Object.keys(m.wounds).some(function (uid) { return m.wounds[uid] > 0 && byUidAlive(battle, uid); }) ? null : txt('ยังไม่มีแผล', 'No wounds');
    },
    perform: function (battle, skill, m, events, ctx, targetIndex) {
      var e = enemyAt(battle, targetIndex), n = e ? (m.wounds[e.uid] || 0) : 0;
      if (!e || !n) { note(events, 'เป้าหมายนี้ไม่มีแผล', 'That target has no wounds', 'weak'); return true; }
      delete m.wounds[e.uid];
      U.strikeEnemy(battle, e, bleedOf(e, n) * WOUND.rendRounds, txt('ฉีกแผล x' + n + ' ', 'Rend x' + n + ' on ') + e.name, events, ctx, F().breakAmount({ power: Math.min(2.5, 0.4 * n) }));
      return false;
    },
    onHit: function (battle, skill, m, enemy) {
      if (enemy.alive) m.wounds[enemy.uid] = Math.min(woundMax(battle), (m.wounds[enemy.uid] || 0) + 1);
    },
    // Bleeding happens in the minion phase, where a kill is handled like any companion hit.
    minionPhase: function (battle, m, events, ctx) {
      Object.keys(m.wounds).forEach(function (uid) {
        var e = byUidAlive(battle, uid);
        if (!e || battle.over) return;
        U.strikeEnemy(battle, e, bleedOf(e, m.wounds[uid]), txt('เลือดไหล ', 'Bleeding ') + e.name, events, ctx, F().breakAmount({ flat: 2 * m.wounds[uid] }));
      });
    },
    sweep: function (battle, m) { pruneDead(battle, m.wounds); },
    gauge: function (battle, m, label) {
      var parts = Object.keys(m.wounds).filter(function (uid) { return byUidAlive(battle, uid); }).map(function (uid) { return byUidAlive(battle, uid).name + ' x' + m.wounds[uid]; });
      return { icon: 'dark', label: label, value: parts.join(', ') || txt('ยังไม่มีแผล', 'No wounds'), active: parts.length > 0 };
    },
    bot: function (battle, m, use, alive) {
      var t = alive.find(function (e) { var n = m.wounds[e.uid] || 0; return n >= woundMax(battle) || (n >= 3 && e.hp <= bleedOf(e, n) * WOUND.rendRounds); });
      return t ? use('hunter_rend', battle.enemies.indexOf(t)) : null;
    },
    prime: function (battle, skill, m) { var e = U.living(battle)[0]; if (e) m.wounds[e.uid] = 2; }
  });
})();
