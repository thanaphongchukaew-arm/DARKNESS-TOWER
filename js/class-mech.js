// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Class signature mechanics: one rule per class that changes how its turns are played,
// instead of another damage skill. battle-engine.js calls the dispatchers at the bottom of
// this file at fixed points (skill cost/validation, a class command, before an attack, each
// landed hit, after any action, Guard, a heal, an item, an incoming enemy hit, the minion
// phase, round start, and a kill sweep at the end of every engine entry point).
//
// Each class registers ONE definition object (G.ClassMech.register) holding its text, its
// `init()` state, its class commands (`skills`, kind 'mech') and only the hooks it needs.
// The four pilot classes live in this file; the rest in class-mech-classes.js.
//
// Every piece of state lives on `battle.mech` (and `battle.player.formMods`) as plain JSON,
// because a fight in progress is saved with JSON.stringify and resumed without createBattle.
// `ensure` therefore initialises lazily at every hook. Classes with no definition never get
// a `battle.mech`, never consume Math.random here, and play exactly as before.
//
// Hooks (all optional; `m` is battle.mech, `ctx` the engine helpers from mechCtx()):
//   cost(battle, skill, m, out)              adjust out.mp / out.ammo / out.res {key, amount, th, en}
//   block(battle, skill, m)                  reason string when the skill can't be used now
//   pay(battle, skill, m, cost)              spend the class resource after validation
//   perform(battle, skill, m, events, ctx, targetIndex)  a class command; return true to refund its AP
//   beforeAttack(battle, skill, m, events)   modifiers for every hit of this attack action:
//                                            { powerMult, forceCrit, scaleStat, basicHits, poisonChance, aoe, extraHits, breakMult }
//   targetMult(battle, m, enemy)             damage multiplier on one enemy (player attack/skill hits only)
//   onHit(battle, skill, m, enemy, hit, events, ctx)    after each landed player attack/skill hit
//   afterAction(battle, kind, skill, m, events, ctx)    after any valid player action
//   onGuard(battle, m, events)
//   afterHeal(battle, skill, m, overflow, events)       overflow = healing past max HP
//   afterItem(battle, item, m, hpGain, events, ctx)     return true to refund the item's AP
//   incoming(battle, m, enemy, dmg, events, ctx)        return { dmg, absorbed }
//   afterIncoming(battle, m, enemy, dmg, events, ctx)   after an enemy hit landed on the player
//   minionPhase(battle, m, events, ctx)      once per round, before the companion
//   roundStart(battle, m, events, ctx)
//   sweep(battle, m, events)                 end of every engine entry point (new deaths)
//   gauge(battle, m)                         { icon, label, value, pips?, active }
//   bot(battle, m, use, alive)               an action for the balance bot, or null
//   prime(battle, skill, m)                  tests: make `skill` usable from a fresh battle
(function () {
  var G = window.Game;
  function txt(th, en) { return G.I18n.getLang() === 'en' ? en : th; }

  var DEFS = {};
  function register(classId, def) {
    DEFS[classId] = def;
    (def.skills || []).forEach(function (s) { G.Data.skills.push(s); });
  }
  function def(classId) { return DEFS[classId] || null; }

  function ensure(battle) {
    if (!battle || !battle.run) return null;
    var d = def(battle.run.classId);
    if (!d) return null;
    if (!battle.mech || battle.mech.classId !== battle.run.classId) {
      battle.mech = d.init();
      battle.mech.classId = battle.run.classId;
    }
    return battle.mech;
  }
  // The active definition and its state, or null for a class without a mechanic.
  function active(battle) {
    var m = ensure(battle);
    return m ? { d: def(battle.run.classId), m: m } : null;
  }

  function note(events, th, en, tone) { events.push({ type: 'classMech', message: txt(th, en), tone: tone || '' }); }

  // Shared damage path for mechanic hits: break, HP, defeat, boss phase, battle end.
  function strikeEnemy(battle, enemy, amount, message, events, ctx, breakAdd) {
    var start = events.length;
    amount = ctx.applyBreak(enemy, amount, events, breakAdd);
    ctx.breakCombo(battle, events, start);
    enemy.hp = Math.max(0, enemy.hp - amount);
    if (!enemy.hp) enemy.alive = false;
    events.push({ type: 'riposte', targetUid: enemy.uid, targetName: enemy.name, amount: amount, hpAfter: enemy.hp, maxHp: enemy.maxHp, breakMeter: enemy.breakMeter, broken: enemy.broken, message: message + ' ' + amount });
    if (!enemy.alive) events.push({ type: 'defeated', targetUid: enemy.uid, targetName: enemy.name, side: 'enemy' });
    else if (enemy.isBoss) { var phase = ctx.checkBossPhase(enemy); if (phase) events.push(ctx.bossEvent(phase)); }
    ctx.checkBattleEnd(battle, events);
  }
  // Damage of a mechanic hit from the player onto `enemy` (no crit, no affinity).
  function mechDamage(battle, enemy, element, power, ctx, scaleStat) {
    var eff = ctx.playerOffenseEff(battle), foe = ctx.effectiveStats(enemy, enemy.debuffs);
    return G.Formulas.computeDamage({ element: element, power: power, scaleStat: scaleStat, atkStat: eff.atk, magStat: eff.mag, defStat: foe.def, resStat: foe.res, isCrit: false });
  }
  function living(battle) { return battle.enemies.filter(function (e) { return e.alive; }); }
  function restoreMp(battle, amount, events) {
    var gain = Math.max(0, Math.min(amount, battle.player.maxMp - battle.run.mp));
    if (!gain) return 0;
    battle.run.mp += gain;
    events.push({ type: 'resourceGain', resource: 'mp', amount: gain, mpAfter: battle.run.mp, maxMp: battle.player.maxMp });
    return gain;
  }
  function healPlayer(battle, amount, events) {
    var gain = Math.max(0, Math.min(Math.round(amount), battle.player.maxHp - battle.run.hp));
    if (!gain || battle.run.hp <= 0) return 0;
    battle.run.hp += gain;
    events.push({ type: 'heal', side: 'player', amount: gain, hpAfter: battle.run.hp, maxHp: battle.player.maxHp });
    return gain;
  }

  // ======================================================================================
  // Pilot classes
  // ======================================================================================

  var SAMURAI = { critPowerMult: 1.35, guardCut: 0.25, counterPower: 0.9 };
  register('samurai', {
    name: 'วิถีชักดาบ', nameEn: 'Way of the Draw',
    short: 'เก็บดาบ 1 ตา แล้วท่าถัดไปคริติคอลแน่นอน พร้อมสวนกลับ', shortEn: 'Sheathe, then the next strike is a sure critical; counters attackers',
    desc: 'ใช้ "เก็บดาบ" เพื่อตั้งท่า: ระหว่างเก็บดาบรับดาเมจน้อยลง 25% และชักดาบสวนศัตรูตัวแรกที่โจมตี การโจมตีครั้งถัดไปคริติคอลแน่นอนและแรงขึ้น 35%',
    descEn: 'Sheathe to take a stance: while sheathed you take 25% less damage and counter the first enemy that strikes you. Your next attack is a guaranteed critical with 35% more power.',
    init: function () { return { sheathed: false, counterRound: 0 }; },
    skills: [
      { id: 'samurai_sheathe', name: 'เก็บดาบ', nameEn: 'Sheathe', element: 'phys', kind: 'mech', mech: 'sheathe', cost: 0, target: 'self', minLevel: 1, classOnly: 'samurai', icon: 'talentRiposte', vfxFamily: 'shield',
        desc: 'เก็บดาบตั้งท่า: รับดาเมจ −25% สวนศัตรูตัวแรกที่โจมตี ท่าถัดไปคริติคอลแน่นอน +35%', descEn: 'Take a stance: −25% damage taken, counter the first attacker, next attack is a sure critical with +35% power.' }
    ],
    block: function (battle, skill, m) { return skill.mech === 'sheathe' && m.sheathed ? txt('เก็บดาบอยู่แล้ว', 'Already sheathed') : null; },
    perform: function (battle, skill, m, events) {
      m.sheathed = true;
      note(events, 'เก็บดาบเข้าฝัก… ท่าถัดไปคริติคอลแน่นอน', 'Blade sheathed… the next strike is a sure critical');
      return false;
    },
    beforeAttack: function (battle, skill, m, events) {
      if (!m.sheathed) return null;
      m.sheathed = false;
      note(events, 'ชักดาบ!', 'Draw!', 'crit');
      return { forceCrit: true, powerMult: SAMURAI.critPowerMult, breakMult: battle.run.masteryPerk === 'samurai_draw' ? 1.25 : 1 };
    },
    onGuard: function (battle, m, events) {
      if (!m.sheathed || battle.run.masteryPerk !== 'samurai_guard' || m.masteryGuardUsed) return;
      var gain = Math.min(4, battle.player.maxMp - battle.run.mp);
      if (gain <= 0) return;
      m.masteryGuardUsed = true;
      battle.run.mp += gain;
      events.push({ type: 'resourceGain', resource: 'mp', amount: gain, mpAfter: battle.run.mp, maxMp: battle.player.maxMp });
    },
    incoming: function (battle, m, enemy, dmg) {
      return m.sheathed ? { dmg: Math.max(1, Math.round(dmg * (1 - SAMURAI.guardCut))), absorbed: false } : null;
    },
    afterIncoming: function (battle, m, enemy, dmg, events, ctx) {
      if (!m.sheathed || m.counterRound === battle.round) return;
      m.counterRound = battle.round;
      strikeEnemy(battle, enemy, mechDamage(battle, enemy, 'phys', SAMURAI.counterPower, ctx), txt('ชักดาบสวน ', 'Counter-draw ') + enemy.name, events, ctx, G.Formulas.breakAmount({ power: SAMURAI.counterPower }));
    },
    gauge: function (battle, m, label) { return { icon: 'talentRiposte', label: label, value: m.sheathed ? txt('เก็บดาบ · พร้อมชัก', 'Sheathed · ready') : txt('ดาบออกฝัก', 'Drawn'), active: m.sheathed }; },
    bot: function (battle, m, use, alive) { return !m.sheathed && alive.length === 1 && alive[0].hp > alive[0].maxHp * 0.3 ? use('samurai_sheathe') : null; },
    prime: function (battle, skill, m) { if (skill.mech === 'sheathe') m.sheathed = false; }
  });

  var GUN = { max: 6, lastShotMult: 1.3, mpShare: 0.5 };
  // Bullets per gun skill. Basic Attack (a pistol-whip) never uses ammo.
  var GUN_AMMO = { quickdraw: 1, kneecap_shot: 1, arcane_round: 1, silver_round: 2, dead_mans_trigger: 2, bullet_storm: 3 };
  register('gunslinger', {
    name: 'ลูกโม่หกนัด', nameEn: 'Six-Shooter',
    short: 'กระสุน 6 นัด ใช้ MP ครึ่งเดียว นัดสุดท้ายคริติคอล', shortEn: '6 bullets at half MP; the last one always crits',
    desc: 'ท่าปืนใช้กระสุน (สูงสุด 6 นัด) และใช้ MP เพียงครึ่งเดียว กระสุนหมดต้อง "บรรจุกระสุน" 1 ตา นัดสุดท้ายในโม่คริติคอลแน่นอนและแรงขึ้น 30%',
    descEn: 'Gun skills spend bullets (6 max) and only half their MP. When empty you must spend a turn to Reload. The last bullet in the cylinder is a guaranteed critical with 30% more power.',
    init: function () { return { ammo: GUN.max }; },
    skills: [
      { id: 'gun_reload', name: 'บรรจุกระสุน', nameEn: 'Reload', element: 'phys', kind: 'mech', mech: 'reload', cost: 0, target: 'self', minLevel: 1, classOnly: 'gunslinger', icon: 'weaponSlot', vfxFamily: 'haste',
        desc: 'เติมกระสุนเต็ม 6 นัด', descEn: 'Refill the cylinder to 6 bullets.' }
    ],
    cost: function (battle, skill, m, out) {
      if (!GUN_AMMO[skill.id]) return;
      out.ammo = GUN_AMMO[skill.id];
      out.mp = Math.ceil(out.mp * GUN.mpShare);
    },
    block: function (battle, skill, m) {
      if (skill.mech === 'reload' && m.ammo >= GUN.max) return txt('กระสุนเต็มแล้ว', 'Cylinder is full');
      var need = GUN_AMMO[skill.id] || 0;
      if (need && m.ammo < need) return txt('กระสุนไม่พอ ต้องบรรจุใหม่', 'Not enough bullets, reload');
      return null;
    },
    pay: function (battle, skill, m, c) { if (c.ammo) m.ammo = Math.max(0, m.ammo - c.ammo); },
    perform: function (battle, skill, m, events) {
      m.ammo = GUN.max;
      note(events, 'บรรจุกระสุนเต็มโม่ (6/6)', 'Cylinder reloaded (6/6)');
      return false;
    },
    beforeAttack: function (battle, skill, m, events) {
      if (!GUN_AMMO[skill.id] || m.ammo !== 0) return null;
      note(events, 'นัดสุดท้าย!', 'Last bullet!', 'crit');
      return { forceCrit: true, powerMult: GUN.lastShotMult };
    },
    gauge: function (battle, m, label) { return { icon: 'weaponSlot', label: label, value: m.ammo + '/' + GUN.max, pips: { filled: m.ammo, max: GUN.max }, active: m.ammo === 1 }; },
    bot: function (battle, m, use) { return m.ammo === 0 ? use('gun_reload') : null; },
    prime: function (battle, skill, m) { if (skill.mech === 'reload') m.ammo = 0; }
  });

  var NECRO = { maxCorpses: 3, maxMinions: 2, secondMinionLevel: 20, startCorpses: 1, minionHpPct: 0.22, minionPower: 0.55, interceptChance: 0.35, soulMp: 4 };
  // The mechanic grows with the hero: one skeleton at first, a second from Lv 20.
  function maxMinions(battle) { return battle.run.level >= NECRO.secondMinionLevel ? NECRO.maxMinions : 1; }
  register('necromancer', {
    name: 'ปลุกผีดิบ', nameEn: 'Raise the Dead',
    short: 'ปลุกศพศัตรูที่ตายเป็นโครงกระดูกช่วยรบ', shortEn: 'Raise fallen foes as skeleton allies',
    desc: 'ศัตรูที่ตายทิ้งศพไว้ (สูงสุด 3 เริ่มต้น 1) "ปลุกศพ" สร้างโครงกระดูกได้ 1 ตัว (2 ตัวเมื่อถึง Lv 20) ซึ่งโจมตีทุกรอบและมีโอกาสรับการโจมตีแทนคุณ เมื่อโครงกระดูกแตกคืน MP 4',
    descEn: 'Fallen enemies leave corpses (3 max, start with 1). Raise Dead turns one into a skeleton (1 max, 2 from Lv 20) that strikes every round and may take hits for you. A shattered skeleton returns 4 MP.',
    init: function () { return { corpses: NECRO.startCorpses, minions: [], nextMinion: 1, dead: {} }; },
    skills: [
      { id: 'raise_dead', name: 'ปลุกศพ', nameEn: 'Raise Dead', element: 'dark', kind: 'mech', mech: 'raise', cost: 6, target: 'self', minLevel: 1, classOnly: 'necromancer', icon: 'crownSkull', vfxFamily: 'empower',
        desc: 'ใช้ศพ 1 ร่างปลุกโครงกระดูก (สูงสุด 2) โจมตีทุกรอบ อาจรับการโจมตีแทน', descEn: 'Spend a corpse to raise a skeleton (2 max) that strikes every round and may take hits for you.' }
    ],
    block: function (battle, skill, m) {
      if (skill.mech !== 'raise') return null;
      if (m.corpses <= 0) return txt('ไม่มีศพให้ปลุก', 'No corpse to raise');
      if (m.minions.length >= maxMinions(battle)) return txt('โครงกระดูกครบแล้ว' + (maxMinions(battle) < NECRO.maxMinions ? ' (ตัวที่ 2 ที่ Lv ' + NECRO.secondMinionLevel + ')' : ''), 'Skeletons at maximum' + (maxMinions(battle) < NECRO.maxMinions ? ' (2nd at Lv ' + NECRO.secondMinionLevel + ')' : ''));
      return null;
    },
    perform: function (battle, skill, m, events) {
      m.corpses -= 1;
      var maxHp = Math.max(1, Math.round(battle.player.maxHp * NECRO.minionHpPct));
      m.minions.push({ id: 'sk' + m.nextMinion, hp: maxHp, maxHp: maxHp });
      m.nextMinion += 1;
      note(events, 'โครงกระดูกลุกขึ้นจากศพ!', 'A skeleton rises from the corpse!', 'crit');
      return false;
    },
    incoming: function (battle, m, enemy, dmg, events) {
      if (!m.minions.length || Math.random() >= NECRO.interceptChance) return null;
      var sk = m.minions[0];
      sk.hp = Math.max(0, sk.hp - dmg);
      if (sk.hp <= 0) {
        m.minions.shift();
        note(events, 'โครงกระดูกรับการโจมตีแทนและแตกสลาย', 'A skeleton takes the blow and shatters', 'weak');
        restoreMp(battle, NECRO.soulMp, events);
      } else {
        note(events, 'โครงกระดูกรับการโจมตีแทน (−' + dmg + ')', 'A skeleton takes the blow (−' + dmg + ')');
      }
      return { dmg: 0, absorbed: true };
    },
    minionPhase: function (battle, m, events, ctx) {
      for (var i = 0; i < m.minions.length && !battle.over; i++) {
        var foes = living(battle);
        if (!foes.length) break;
        var target = foes[Math.floor(Math.random() * foes.length)];
        strikeEnemy(battle, target, mechDamage(battle, target, 'dark', NECRO.minionPower, ctx), txt('โครงกระดูกฟาด ', 'Skeleton strikes ') + target.name, events, ctx, G.Formulas.breakAmount({ power: NECRO.minionPower }));
      }
    },
    sweep: function (battle, m, events) {
      var gained = 0;
      battle.enemies.forEach(function (e) {
        if (e.alive || m.dead[e.uid]) return;
        m.dead[e.uid] = true;
        if (m.corpses < NECRO.maxCorpses) { m.corpses += 1; gained += 1; }
      });
      if (gained && !battle.over) note(events, 'ได้ศพ +' + gained + ' (' + m.corpses + '/' + NECRO.maxCorpses + ')', 'Corpse +' + gained + ' (' + m.corpses + '/' + NECRO.maxCorpses + ')');
    },
    gauge: function (battle, m, label) {
      return { icon: 'crownSkull', label: label, value: txt('ศพ ', 'Corpses ') + m.corpses + '/' + NECRO.maxCorpses + ' · ' + txt('โครงกระดูก ', 'Skeletons ') + (m.minions.map(function (s) { return s.hp + '/' + s.maxHp; }).join(', ') || '0'), active: m.minions.length > 0 };
    },
    bot: function (battle, m, use) { return m.minions.length < maxMinions(battle) && m.corpses > 0 ? use('raise_dead') : null; },
    prime: function (battle, skill, m) { if (skill.mech === 'raise') { m.corpses = Math.max(1, m.corpses); m.minions = []; } }
  });

  var FORMS = {
    human: { mods: null },
    bear: { mods: { def: 0.3, res: 0.3 }, regenPct: 0.03, basic: { hits: 1, power: 1.1 } },
    wolf: { mods: { spd: 0.3, luk: 0.3 }, basic: { hits: 2, power: 0.6 }, poisonChance: 0.4 }
  };
  function formName(form, lang) {
    var names = { human: ['ร่างคน', 'Human Form'], bear: ['ร่างหมี', 'Bear Form'], wolf: ['ร่างหมาป่า', 'Wolf Form'] }[form] || [form, form];
    return lang === 'en' ? names[1] : names[0];
  }
  function setForm(battle, form) {
    var m = ensure(battle);
    m.form = form;
    var mods = FORMS[form] && FORMS[form].mods;
    battle.player.formMods = mods ? JSON.parse(JSON.stringify(mods)) : null;
  }
  register('druid', {
    name: 'แปลงร่าง', nameEn: 'Shapeshift',
    short: 'สลับร่างคน หมี หมาป่า ได้ฟรีทุกรอบ', shortEn: 'Shift between human, bear and wolf for free each round',
    desc: 'สลับร่างได้ฟรี 1 ครั้งต่อรอบ ร่างคน: ร่ายเวทได้ตามปกติ · ร่างหมี: DEF/RES +30% ฟื้น HP 3% ทุกรอบ ตบด้วย MAG · ร่างหมาป่า (Lv 8): SPD/LUK +30% ขย้ำ 2 ครั้งและอาจติดพิษ ร่างสัตว์ใช้ได้เฉพาะท่าของร่างนั้น',
    descEn: 'Shift form for free once per round. Human: cast spells as normal. Bear: +30% DEF/RES, heal 3% HP each round, maul with MAG. Wolf (Lv 8): +30% SPD/LUK, bite twice and may poison. Beast forms can only use that form\'s moves.',
    init: function () { return { form: 'human', shiftRound: 0 }; },
    skills: [
      { id: 'druid_form_bear', name: 'ร่างหมี', nameEn: 'Bear Form', element: 'phys', kind: 'mech', mech: 'shift', form: 'bear', cost: 0, target: 'self', minLevel: 1, classOnly: 'druid', icon: 'stoneheartBear', vfxFamily: 'shield',
        desc: 'DEF/RES +30% ฟื้น HP 3% ทุกรอบ โจมตีปกติเป็นตบหนัก (ใช้ MAG) · สลับร่างฟรี 1 ครั้งต่อรอบ', descEn: '+30% DEF/RES, heal 3% HP each round, Attack becomes a MAG-powered maul. Free once per round.' },
      { id: 'druid_form_wolf', name: 'ร่างหมาป่า', nameEn: 'Wolf Form', element: 'phys', kind: 'mech', mech: 'shift', form: 'wolf', cost: 0, target: 'self', minLevel: 8, classOnly: 'druid', icon: 'emberFox', vfxFamily: 'haste',
        desc: 'SPD/LUK +30% โจมตีปกติขย้ำ 2 ครั้ง (ใช้ MAG) อาจติดพิษ · สลับร่างฟรี 1 ครั้งต่อรอบ', descEn: '+30% SPD/LUK, Attack bites twice with MAG and may poison. Free once per round.' },
      { id: 'druid_form_human', name: 'คืนร่างคน', nameEn: 'Human Form', element: 'phys', kind: 'mech', mech: 'shift', form: 'human', cost: 0, target: 'self', minLevel: 1, classOnly: 'druid', icon: 'wind', vfxFamily: 'empower',
        desc: 'กลับร่างคนเพื่อร่ายเวทและฟื้นฟู · สลับร่างฟรี 1 ครั้งต่อรอบ', descEn: 'Return to human form to cast spells and heal. Free once per round.' },
      { id: 'bear_roar', name: 'คำรามหมีป่า', nameEn: 'Ursine Roar', element: 'phys', kind: 'debuffEnemy', stat: 'atk', amount: 0.2, cost: 6, target: 'allEnemies', minLevel: 1, classOnly: 'druid', form: 'bear', icon: 'debuffDown', vfxFamily: 'roar',
        desc: '(ร่างหมี) ลด ATK ศัตรูทั้งหมด 20% 3 เทิร์น', descEn: '(Bear) Lower every enemy\'s ATK by 20% for 3 turns.' },
      { id: 'feral_pounce', name: 'กระโจนขย้ำ', nameEn: 'Feral Pounce', element: 'phys', kind: 'attack', power: 0.95, hits: 2, scaleStat: 'mag', cost: 7, target: 'singleEnemy', minLevel: 8, classOnly: 'druid', form: 'wolf', icon: 'swordAttack', vfxFamily: 'bite',
        desc: '(ร่างหมาป่า) ขย้ำ 2 ครั้งด้วยพลัง MAG อาจติดพิษ', descEn: '(Wolf) Two MAG-powered bites that may poison.' }
    ],
    block: function (battle, skill, m) {
      if (skill.mech === 'shift') return skill.form === m.form ? txt('อยู่ในร่างนี้แล้ว', 'Already in this form') : null;
      if (skill.form && skill.form !== m.form) return txt('ต้องอยู่ใน' + formName(skill.form, 'th'), 'Requires ' + formName(skill.form, 'en'));
      if (!skill.form && m.form !== 'human' && skill.id !== 'attack') return txt('ร่างสัตว์ร่ายท่านี้ไม่ได้', 'Not usable in beast form');
      return null;
    },
    perform: function (battle, skill, m, events) {
      setForm(battle, skill.form);
      note(events, 'แปลงเป็น' + formName(skill.form, 'th'), 'Shifted into ' + formName(skill.form, 'en'));
      if (m.shiftRound !== battle.round) { m.shiftRound = battle.round; return true; }
      return false;
    },
    beforeAttack: function (battle, skill, m) {
      var form = FORMS[m.form], mods = {};
      if (skill.id === 'attack' && form.basic) { mods.basicHits = form.basic; mods.scaleStat = 'mag'; }
      if (m.form === 'wolf') mods.poisonChance = form.poisonChance;
      return mods;
    },
    roundStart: function (battle, m, events) {
      if (m.form !== 'bear' || !events || battle.run.hp <= 0) return;
      healPlayer(battle, Math.max(1, Math.round(battle.player.maxHp * FORMS.bear.regenPct)), events);
    },
    gauge: function (battle, m, label) {
      return { icon: { human: 'wind', bear: 'stoneheartBear', wolf: 'emberFox' }[m.form], label: label, value: formName(m.form, G.I18n.getLang()) + (m.shiftRound === battle.round ? '' : txt(' · สลับฟรีได้', ' · free shift')), active: m.form !== 'human' };
    },
    bot: function (battle, m, use) {
      var run = battle.run, p = battle.player;
      if (run.hp < p.maxHp * 0.45 && m.form !== 'bear') return use('druid_form_bear');
      if (m.form === 'human' && run.mp < p.maxMp * 0.25) return use('druid_form_wolf');
      if (m.form !== 'human' && run.hp > p.maxHp * 0.7 && run.mp > p.maxMp * 0.6) return use('druid_form_human');
      return null;
    },
    prime: function (battle, skill, m) {
      if (skill.mech === 'shift' && m.form === skill.form) setForm(battle, skill.form === 'human' ? 'wolf' : 'human');
      if (skill.form && !skill.mech) setForm(battle, skill.form);
      if (!skill.form && !skill.mech && m.form && m.form !== 'human') setForm(battle, 'human');
    }
  });

  // ======================================================================================
  // Dispatchers called by battle-engine.js
  // ======================================================================================

  function cost(battle, skill) {
    var out = { mp: skill.cost || 0, ammo: 0, res: null };
    var a = active(battle);
    if (a && a.d.cost) a.d.cost(battle, skill, a.m, out);
    return out;
  }
  function blockReason(battle, skill) {
    var a = active(battle);
    return a && a.d.block ? a.d.block(battle, skill, a.m) || null : null;
  }
  function pay(battle, skill) {
    var a = active(battle);
    if (a && a.d.pay) a.d.pay(battle, skill, a.m, cost(battle, skill));
  }
  function perform(battle, skill, events, ctx, targetIndex) {
    var a = active(battle);
    return a && a.d.perform ? !!a.d.perform(battle, skill, a.m, events, ctx, targetIndex) : false;
  }
  function beforeAttack(battle, skill, events) {
    var a = active(battle);
    return a && a.d.beforeAttack ? a.d.beforeAttack(battle, skill, a.m, events) || null : null;
  }
  function targetMult(battle, enemy) {
    var a = active(battle);
    return a && a.d.targetMult ? a.d.targetMult(battle, a.m, enemy) || 1 : 1;
  }
  function onHit(battle, skill, enemy, hit, events, ctx) {
    var a = active(battle);
    if (a && a.d.onHit) a.d.onHit(battle, skill, a.m, enemy, hit, events, ctx);
  }
  function afterAction(battle, kind, skill, events, ctx) {
    var a = active(battle);
    if (a && a.d.afterAction && !battle.over) a.d.afterAction(battle, kind, skill, a.m, events, ctx);
  }
  function onGuard(battle, events) {
    var a = active(battle);
    if (a && a.d.onGuard) a.d.onGuard(battle, a.m, events);
  }
  function afterHeal(battle, skill, overflow, events) {
    var a = active(battle);
    if (a && a.d.afterHeal) a.d.afterHeal(battle, skill, a.m, overflow, events);
  }
  function afterItem(battle, item, hpGain, events, ctx) {
    var a = active(battle);
    return a && a.d.afterItem ? !!a.d.afterItem(battle, item, a.m, hpGain, events, ctx) : false;
  }
  // `dmg` is the final damage an enemy hit would deal to the player. Returns the damage the
  // player actually takes; `absorbed` true means the mechanic took the hit instead.
  function incoming(battle, enemy, dmg, events, ctx) {
    var a = active(battle);
    var r = a && a.d.incoming ? a.d.incoming(battle, a.m, enemy, dmg, events, ctx) : null;
    return r || { dmg: dmg, absorbed: false };
  }
  function afterIncoming(battle, enemy, events, ctx, dmg) {
    var a = active(battle);
    if (!a || !a.d.afterIncoming || battle.over || !enemy.alive || battle.run.hp <= 0) return;
    a.d.afterIncoming(battle, a.m, enemy, dmg || 0, events, ctx);
  }
  function minionPhase(battle, events, ctx) {
    var a = active(battle);
    if (a && a.d.minionPhase) a.d.minionPhase(battle, a.m, events, ctx);
  }
  function roundStart(battle, events, ctx) {
    var a = active(battle);
    if (a && a.d.roundStart) a.d.roundStart(battle, a.m, events, ctx);
  }
  function sweep(battle, events) {
    var a = active(battle);
    if (a && a.d.sweep) a.d.sweep(battle, a.m, events);
  }
  function gauge(battle) {
    var a = active(battle);
    return a && a.d.gauge ? a.d.gauge(battle, a.m, G.I18n.L(a.d, 'name')) : null;
  }
  // A sensible use of the class command for the headless balance bot (scripts/balance-sim.js).
  function botAction(battle, blocked) {
    var a = active(battle);
    if (!a || !a.d.bot) return null;
    var run = battle.run;
    function use(id, targetIndex) {
      var s = G.Data.getSkill(id);
      if (!s || s.minLevel > run.level || blocked(s)) return null;
      return targetIndex == null ? { kind: 'skill', skillId: id } : { kind: 'skill', skillId: id, targetIndex: targetIndex };
    }
    return a.d.bot(battle, a.m, use, living(battle)) || null;
  }
  // Tests: make `skill` legitimately usable from a fresh battle.
  function prime(battle, skill) {
    var a = active(battle);
    if (a && a.d.prime) a.d.prime(battle, skill, a.m);
  }

  G.ClassMech = {
    DEFS: DEFS, GUN_AMMO: GUN_AMMO, FORMS: FORMS,
    register: register, has: function (classId) { return !!def(classId); }, info: def,
    ensure: ensure, cost: cost, blockReason: blockReason, pay: pay, perform: perform,
    beforeAttack: beforeAttack, targetMult: targetMult, onHit: onHit, afterAction: afterAction,
    onGuard: onGuard, afterHeal: afterHeal, afterItem: afterItem,
    incoming: incoming, afterIncoming: afterIncoming, minionPhase: minionPhase,
    roundStart: roundStart, sweep: sweep, gauge: gauge, botAction: botAction, prime: prime,
    formName: formName, setForm: setForm,
    // for class-mech-classes.js
    util: { txt: txt, note: note, strikeEnemy: strikeEnemy, mechDamage: mechDamage, living: living, restoreMp: restoreMp, healPlayer: healPlayer }
  };
})();
