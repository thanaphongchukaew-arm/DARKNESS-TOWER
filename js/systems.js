// Tactical systems. Data is shared by combat, UI and save migration.
(function () {
  var G = window.Game, D = G.Data, S = G.State;
  function text(th, en) { return G.I18n.getLang() === 'en' ? en : th; }
  function ensure(run) {
    if (!run.talents) run.talents = {};
    if (!run.routes) run.routes = {};
    if (!run.favoriteSkills) run.favoriteSkills = [];
    return run;
  }
  var elements = ['fire', 'ice', 'elec', 'wind', 'light', 'dark'];
  var opposing = { fire: 'ice', ice: 'fire', elec: 'wind', wind: 'elec', light: 'dark', dark: 'light' };
  D.getAllEnemyTemplates().forEach(function (enemy, index) {
    var signature = enemy.attacks.find(function (a) { return elements.indexOf(a.element) !== -1; });
    enemy.resist = signature ? signature.element : elements[index % elements.length];
    enemy.weak = opposing[enemy.resist];
  });
  var talents = [
    { id: 'riposte', level: 5, icon: 'talentRiposte', name: 'ตั้งรับสวนกลับ', nameEn: 'Riposte', desc: 'Guard แล้วสวนกลับศัตรูตัวแรกที่โจมตี 1 ครั้ง ด้วย ATK หรือ MAG ที่สูงกว่า', descEn: 'Guard counters the first attacker once, using your higher ATK or MAG.' },
    { id: 'flurry', level: 5, icon: 'talentFlurry', name: 'จังหวะคู่', nameEn: 'Twin Rhythm', desc: 'โจมตีปกติซ้ำ 1 ครั้งที่พลัง 40% (ไม่เพิ่ม AP)', descEn: 'Basic attacks gain a second hit at 40% power (no extra AP).' },
    { id: 'pierce', level: 5, icon: 'talentPierce', name: 'ทะลวงแนวรับ', nameEn: 'Piercing Arts', desc: 'การโจมตีกายภาพละเลย DEF 35% เวทละเลย RES 20%', descEn: 'Physical hits ignore 35% DEF; magic hits ignore 20% RES.' },
    { id: 'clean_guard', level: 10, icon: 'statusCleanse', name: 'ตั้งรับชำระล้าง', nameEn: 'Purifying Guard', desc: 'Guard ล้างสถานะผิดปกติทั้งหมด', descEn: 'Guard removes all ailments.' },
    { id: 'break_flow', level: 10, icon: 'relicBreak', name: 'กระแสทลาย', nameEn: 'Break Flow', desc: 'ทำ Break สำเร็จคืน 3 MP สูงสุดครั้งเดียวต่อรอบ', descEn: 'Breaking an enemy restores 3 MP, once per round.' },
    { id: 'affliction', level: 10, icon: 'statusPoison', name: 'พิษแทรกคม', nameEn: 'Venom Edge', desc: 'โจมตีปกติติดพิษ 3 รอบ (บอสรับผลเบาลง)', descEn: 'Basic attacks inflict poison for 3 rounds (reduced on bosses).' },
    { id: 'overdrive_echo', level: 15, icon: 'relicEcho', name: 'เสียงสะท้อนสหาย', nameEn: 'Companion Echo', desc: 'Overdrive ให้สหายทำงานเพิ่มทันที 1 ครั้ง', descEn: 'Overdrive triggers one immediate extra companion action.' },
    { id: 'burning_wind', level: 15, icon: 'statusBurn', name: 'ลมโหมเพลิง', nameEn: 'Fanning Flames', desc: 'โจมตีลมใส่ศัตรูที่ไหม้เพิ่มดาเมจอีก 30% และโจมตีไฟติดไหม้แน่นอน', descEn: 'Wind deals 30% extra to burning foes; fire always inflicts burn.' },
    { id: 'focus_guard', level: 15, icon: 'relicGuard', name: 'สมาธิผู้พิทักษ์', nameEn: 'Guardian Focus', desc: 'Guard เพิ่ม Focus 20 แต้ม', descEn: 'Guard grants 20 Focus.' },
    // Level 20: one set per class archetype (see archetype() below), so the
    // mid-run build choice differs between weapon fighters, casters and hybrids.
    { id: 'executioner_edge', level: 20, archetype: 'martial', icon: 'relicOpportunist', name: 'คมเพชฌฆาต', nameEn: "Executioner's Edge", desc: 'ดาเมจต่อศัตรูที่ HP ต่ำกว่า 35% เพิ่มขึ้น 25%', descEn: 'Deal 25% more damage to enemies below 35% HP.' },
    { id: 'weapon_mastery', level: 20, archetype: 'martial', icon: 'swordAttack', name: 'เชี่ยวชาญศาสตรา', nameEn: 'Weapon Mastery', desc: 'โจมตีปกติและท่าคมธาตุแรงขึ้น 25%', descEn: 'Basic attacks and elemental Edge techniques deal 25% more damage.' },
    { id: 'iron_will', level: 20, archetype: 'martial', icon: 'shieldGuard', name: 'เจตจำนงเหล็ก', nameEn: 'Iron Will', desc: 'DEF +15% และ RES +10% ระหว่างการต่อสู้', descEn: '+15% DEF and +10% RES in battle.' },
    { id: 'spell_surge', level: 20, archetype: 'caster', icon: 'magicBurst', name: 'เวทพลุ่งพล่าน', nameEn: 'Spell Surge', desc: 'ทักษะธาตุเวทแรงขึ้น 15%', descEn: 'Elemental spells deal 15% more damage.' },
    { id: 'mana_font', level: 20, archetype: 'caster', icon: 'drop', name: 'น้ำพุมานา', nameEn: 'Mana Font', desc: 'ฟื้นฟู MP 4% ของค่าสูงสุดเมื่อเริ่มแต่ละรอบ', descEn: 'Restore 4% of max MP at the start of each round.' },
    { id: 'arcane_ward', level: 20, archetype: 'caster', icon: 'sparkles', name: 'ม่านอาคม', nameEn: 'Arcane Ward', desc: 'RES +20% ระหว่างการต่อสู้ และ Guard คืน 6 MP', descEn: '+20% RES in battle, and Guard restores 6 MP.' },
    { id: 'versatile', level: 20, archetype: 'hybrid', icon: 'buffUp', name: 'ศาสตร์คู่ขนาน', nameEn: 'Twin Disciplines', desc: 'ATK และ MAG +8% ระหว่างการต่อสู้', descEn: '+8% ATK and MAG in battle.' },
    { id: 'tactician', level: 20, archetype: 'hybrid', icon: 'star', name: 'นักวางกลยุทธ์', nameEn: 'Tactician', desc: 'โจมตีโดนจุดอ่อนคูณดาเมจ 1.75 แทน 1.5', descEn: 'Weakness hits deal ×1.75 damage instead of ×1.5.' },
    { id: 'second_wind', level: 20, archetype: 'hybrid', icon: 'heart', name: 'ลมหายใจที่สอง', nameEn: 'Second Wind', desc: 'ครั้งแรกในแต่ละการต่อสู้ที่ HP ต่ำกว่า 30% ฟื้นฟู HP 25%', descEn: 'The first time each battle your HP drops below 30%, restore 25% HP.' },
    { id: 'opportune', level: 30, icon: 'downedMark', name: 'ซ้ำเติมผู้ล้ม', nameEn: 'Opportune Strike', desc: 'ดาเมจต่อศัตรูที่ล้มอยู่เพิ่มขึ้น 30%', descEn: 'Deal 30% more damage to knocked-down enemies.' },
    { id: 'bulwark', level: 30, icon: 'relicStoneWard', name: 'ปราการมั่น', nameEn: 'Bulwark', desc: 'Guard ลดดาเมจ 70% แทน 50%', descEn: 'Guard reduces damage by 70% instead of 50%.' },
    { id: 'quickstep', level: 30, icon: 'wind', name: 'ก้าวฉับไว', nameEn: 'Quickstep', desc: 'สะสมจังหวะเพิ่ม 25% ทุกรอบ ได้แต้ม AP พิเศษบ่อยขึ้นแม้ไม่เร็วกว่าศัตรู', descEn: 'Bank 25% extra tempo every round: bonus AP comes more often, even when you are not faster.' },
    { id: 'overdrive_mastery', level: 40, icon: 'almighty', name: 'ปรมาจารย์ Overdrive', nameEn: 'Overdrive Mastery', desc: 'Overdrive แรงขึ้น 40% และเหลือ Focus 30 แต้มหลังใช้', descEn: 'Overdrive deals 40% more damage and leaves 30 Focus behind.' },
    { id: 'lifebloom', level: 40, icon: 'blessVitality', name: 'ชีวิตผลิบาน', nameEn: 'Lifebloom', desc: 'ฟื้นฟู HP 4% ของค่าสูงสุดเมื่อเริ่มแต่ละรอบ', descEn: 'Restore 4% of max HP at the start of each round.' },
    { id: 'relentless', level: 40, icon: 'relicMomentumCharm', name: 'ไม่หยุดยั้ง', nameEn: 'Relentless', desc: 'กำจัดศัตรูได้รับ AP เพิ่ม 1 แต้ม (ครั้งเดียวต่อรอบ)', descEn: 'Defeating an enemy grants 1 AP (once per round).' },
    { id: 'giant_slayer', level: 50, icon: 'crownSkull', name: 'ผู้ล้มยักษ์', nameEn: 'Giant Slayer', desc: 'ดาเมจต่อบอส มินิบอส และหัวหน้าฝูงเพิ่มขึ้น 20%', descEn: 'Deal 20% more damage to bosses, mini-bosses and champions.' },
    { id: 'unbreakable', level: 50, icon: 'blessGuardian', name: 'ไม่ยอมล้ม', nameEn: 'Unbreakable', desc: 'ครั้งแรกในแต่ละการต่อสู้ที่จะพ่ายแพ้ ยืนหยัดไว้ที่ 1 HP', descEn: 'The first time each battle you would fall, survive at 1 HP instead.' },
    { id: 'rally_master', level: 50, icon: 'sparkles', name: 'จอมทัพรวมพลัง', nameEn: 'Rally Master', desc: 'โจมตีรวมพลังแรงขึ้น 50%', descEn: 'Rally Strike deals 50% more damage.' }
  ];
  var TALENT_LEVELS = [5, 10, 15, 20, 30, 40, 50];
  // Weapon fighters (the classes barred from shared spells), dedicated casters
  // (MAG well above ATK) and everyone in between.
  function archetype(run) {
    var cls = D.getClass(run.classId) || D.classes[0];
    if (D.isMartialClass(cls.id)) return 'martial';
    return cls.baseStats.mag >= cls.baseStats.atk * 1.4 ? 'caster' : 'hybrid';
  }
  // The choices offered at one talent level for this run's class.
  function options(run, level) {
    var kind = archetype(run);
    return talents.filter(function (t) { return t.level === level && (!t.archetype || t.archetype === kind); });
  }
  function has(run, id) { ensure(run); return Object.keys(run.talents).some(function (k) { return run.talents[k] === id; }); }
  function pending(run) { ensure(run); return TALENT_LEVELS.find(function (level) { return run.level >= level && !run.talents[level]; }) || null; }
  function chooseTalent(run, id) {
    var talent = talents.find(function (t) { return t.id === id; });
    if (!talent || pending(run) !== talent.level || options(run, talent.level).indexOf(talent) === -1) return false;
    run.talents[talent.level] = id; S.saveNow(); return true;
  }
  var routes = [
    { id: 'safe', icon: 'routeSafe', name: 'ทางปลอดภัย', nameEn: 'Sheltered Path', desc: '5 ชั้นถัดไป: ศัตรูน้อยลง 1 ตัว (ยกเว้นบอส) • พลัง ×0.85 • รางวัล ×0.7', descEn: 'Next 5 floors: one fewer non-boss enemy • stats ×0.85 • rewards ×0.7', stats: 0.85, rewards: 0.7 },
    { id: 'elite', icon: 'routeElite', name: 'ทางล่า Elite', nameEn: 'Elite Hunt', desc: '5 ชั้นถัดไป: พลังศัตรู ×1.25 • หัวหน้าฝูงดูดเลือด • รางวัล ×1.6', descEn: 'Next 5 floors: stats ×1.25 • leader leeches HP • rewards ×1.6', stats: 1.25, rewards: 1.6 },
    { id: 'explore', icon: 'routeExplore', name: 'ทางสำรวจ', nameEn: 'Forgotten Trail', desc: 'ชนะชั้นทางแยกรับวัตถุดิบโซน 3 ชิ้น • 5 ชั้นถัดไปรางวัล ×0.9', descEn: 'Win this crossroads floor for 3 zone materials • next 5 floors: rewards ×0.9', stats: 1, rewards: 0.9 }
  ];
  function route(run, floor) { ensure(run); return routes.find(function (r) { return r.id === run.routes[Math.floor(floor / 5) * 5]; }) || null; }
  function chooseRoute(run, floor, id) {
    ensure(run);
    if (floor !== run.currentFloor || floor < 5 || floor % 5 || floor >= 100 || run.routes[floor] || !routes.some(function (r) { return r.id === id; })) return false;
    run.routes[floor] = id; S.saveNow(); return true;
  }
  function discover(enemy, element) {
    if (elements.indexOf(element) === -1) return;
    var meta = G.Save.readMeta();
    if (!meta.affinities) meta.affinities = {};
    if (!meta.affinities[enemy.templateId]) meta.affinities[enemy.templateId] = {};
    if (!meta.affinities[enemy.templateId][element]) { meta.affinities[enemy.templateId][element] = true; G.Save.writeMeta(meta); }
  }
  // `actor` (optional) is a live boss whose phase shift replaced its affinity; the
  // announcement already told the player the new weakness, so a shifted actor shows both.
  function affinities(template, reveal, actor) {
    var meta = G.Save.readMeta(), known = (meta.affinities || {})[template.id] || {};
    var shifted = !!(actor && actor.weakEl);
    var weak = shifted ? actor.weakEl : template.weak, resist = shifted ? actor.resistEl : template.resist;
    return '<div class="affinity-row"><span class="affinity-weak">' + text('แพ้ ', 'Weak ') + (reveal || shifted || known[weak] ? G.Icons.get(weak) + G.ElementName(weak) : '???') + '</span><span class="affinity-resist">' + text('ต้าน ', 'Resist ') + (reveal || shifted || known[resist] ? G.Icons.get(resist) + G.ElementName(resist) : '???') + '</span></div>';
  }
  function effect(run, id) {
    return S.hasRelic(run, id) || Object.keys(run.equipment).some(function (slot) { var item = D.getItem(run.equipment[slot]); return item && item.combo === id; });
  }
  var extras = [
    { id: 'break_prism', icon: 'relicBreak', name: 'ปริซึมทลาย', nameEn: 'Shatter Prism', desc: 'เมื่อทำ Break คืน 4 MP สูงสุดครั้งเดียวต่อรอบ', descEn: 'Restore 4 MP on Break, once per round.' },
    { id: 'guard_lantern', icon: 'relicGuard', name: 'ตะเกียงตั้งมั่น', nameEn: 'Steadfast Lantern', desc: 'Guard เพิ่ม Focus 15 แต้ม', descEn: 'Guard grants 15 Focus.' },
    { id: 'echo_bell', icon: 'relicEcho', name: 'ระฆังผูกพัน', nameEn: 'Bond Bell', desc: 'Overdrive ให้สหายทำงานเพิ่มทันที 1 ครั้ง (ไม่ซ้ำกับพรสวรรค์เสียงสะท้อน)', descEn: 'Overdrive triggers one extra companion action (does not stack with Companion Echo).' }
  ];
  extras.forEach(function (r) { D.relics.push(r); });
  [
    { id: 'c_shatter_prism', combo: 'break_prism', tier: 2, statBonus: { mp: 8 }, name: 'แหวนทลายมนตรา', nameEn: 'Shatter Ring', icon: 'relicBreak', desc: '+8 MP • ทำ Break คืน 4 MP ครั้งเดียวต่อรอบ', descEn: '+8 MP • Break restores 4 MP once per round.' },
    { id: 'a_steadfast', combo: 'guard_lantern', tier: 3, kind: 'armor', statBonus: { def: 9, res: 9 }, name: 'เกราะตะเกียงผู้พิทักษ์', nameEn: 'Lantern Guard', icon: 'relicGuard', desc: '+9 DEF/RES • Guard เพิ่ม Focus 15', descEn: '+9 DEF/RES • Guard grants 15 Focus.' },
    { id: 'c_echo_bell', combo: 'echo_bell', tier: 4, statBonus: { spd: 3 }, name: 'กระดิ่งสายสัมพันธ์', nameEn: 'Bond Chime', icon: 'relicEcho', desc: '+3 SPD • Overdrive เรียกสหายทำงานเพิ่ม 1 ครั้ง', descEn: '+3 SPD • Overdrive triggers one extra companion action.' }
  ].forEach(function (item) { if (!item.kind) item.kind = 'accessory'; D.items.push(item); });
  D.items.push({ id: 'p_panacea', name: 'ยาชำระมลทิน', nameEn: 'Panacea', kind: 'consumable', tier: 1, price: 30, icon: 'statusCleanse', effect: { type: 'cleanse' }, battleUsable: true, desc: 'ล้างพิษ ไหม้ และใบ้ทั้งหมดในการต่อสู้', descEn: 'Removes poison, burn and silence in battle.' });
  D.skills.push({ id: 'sunder_strike', name: 'ฟันทลายเกราะ', nameEn: 'Sundering Strike', element: 'phys', kind: 'attack', power: 1.1, cost: 5, target: 'singleEnemy', minLevel: 1, classOnly: null, icon: 'talentPierce', armorPierce: 0.5, desc: 'โจมตีกายภาพ ละเลย DEF 50%', descEn: 'Physical strike ignoring 50% DEF.' });
  var momentum = D.getRelic('momentum_charm');
  momentum.desc = 'หลังใช้การโจมตีปกติหรือทักษะโจมตี มีโอกาส 15% ได้รับ AP เพิ่ม 1 (ไม่ขึ้นกับคริติคอล)';
  momentum.descEn = 'After a basic attack or attack skill, 15% chance to gain 1 AP, independent of critical hits.';
  var companionNotes = {
    ember_fox: ['โจมตีและเพิ่ม Break อีก 15 แต้มต่อการกัด', 'Attacks and adds 15 extra Break per bite.'],
    dawn_owl: ['ฟื้น HP 5% และล้างสถานะผิดปกติ 1 อย่างทุกรอบ', 'Heals 5% HP and cleanses one ailment each round.'],
    stoneheart_bear: ['เพิ่ม DEF/RES 18% และลดระยะเวลาดีบัฟค่าสถานะ 1 รอบ', 'Grants 18% DEF/RES and shortens stat debuffs by one round.'],
    sand_scarab: ['โจมตีคริติคอลสูงและละเลย DEF 50%', 'Higher critical chance; ignores 50% DEF.'],
    frost_hare: ['ฟื้น HP 6.5% และคืน MP 2 แต้มทุกรอบ', 'Heals 6.5% HP and restores 2 MP each round.'],
    iron_golem_cub: ['เพิ่ม DEF/RES 22% และเพิ่ม Focus 5 แต้มทุกรอบ', 'Grants 22% DEF/RES and 5 Focus each round.']
  };
  Object.keys(companionNotes).forEach(function (id) { var c = D.getCompanion(id); c.desc = companionNotes[id][0]; c.descEn = companionNotes[id][1]; });
  G.Systems = { text: text, ensure: ensure, talents: talents, TALENT_LEVELS: TALENT_LEVELS, archetype: archetype, options: options, has: has, pending: pending, chooseTalent: chooseTalent, routes: routes, route: route, chooseRoute: chooseRoute, discover: discover, affinities: affinities, effect: effect };
})();
