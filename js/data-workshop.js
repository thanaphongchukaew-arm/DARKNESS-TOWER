// Artisan economy: stable IDs, explicit recipes and distinct rune silhouettes.
(function () {
  var G = window.Game, D = G.Data, F = G.Formulas;
  var components = [
    { id: 'part_metal', name: 'เศษโลหะ', nameEn: 'Metal Scrap', icon: 'workMetal', source: 'weapon' },
    { id: 'part_cloth', name: 'ผ้าทอเก่า', nameEn: 'Woven Cloth', icon: 'workCloth', source: 'armor' },
    { id: 'part_dust', name: 'ผงอาคม', nameEn: 'Arcane Dust', icon: 'workDust', source: 'accessory' }
  ];
  components.forEach(function (c) { D.items.push(Object.assign({}, c, { kind: 'component', tier: 1, price: 4, craftOnly: true, desc: 'วัตถุดิบจากการแยกอุปกรณ์และงานสมาคม', descEn: 'Recovered from dismantling gear and guild jobs.' })); });
  var runes = [
    { id: 'rune_fracture', name: 'รูนทลาย', nameEn: 'Fracture Rune', category: 'offense', icon: 'runeFracture', shape: 'diamond', symbol: 'crack', floor: 1, effect: 'break', amount: 10, desc: 'โจมตีแต่ละฮิตเพิ่มเกจ Break อีก 10', descEn: 'Each attack hit adds 10 extra Break.' },
    { id: 'rune_shelter', name: 'รูนตั้งมั่น', nameEn: 'Shelter Rune', category: 'defense', icon: 'runeShelter', shape: 'shield', symbol: 'rampart', floor: 1, effect: 'guardMp', amount: 2, desc: 'Guard คืน 2 MP สูงสุดหนึ่งครั้งต่อรอบ', descEn: 'Guard restores 2 MP, once per round.' },
    { id: 'rune_venom', name: 'รูนอสรพิษ', nameEn: 'Venom Rune', category: 'affliction', icon: 'runeVenom', shape: 'triangle', symbol: 'serpent', floor: 5, blueprint: true, effect: 'venom', amount: 0.12, desc: 'ดาเมจต่อศัตรูติดพิษ +12% (ไม่ได้ทำให้ติดพิษเอง)', descEn: '+12% damage to poisoned foes; does not inflict poison.' },
    { id: 'rune_vigor', name: 'รูนชีพจร', nameEn: 'Vigor Rune', category: 'recovery', icon: 'runeVigor', shape: 'heart', symbol: 'pulse', floor: 1, effect: 'leech', amount: 0.04, desc: 'โจมตีปกติ/ทักษะโจมตีดูดเลือด 4% ของดาเมจ', descEn: 'Basic attacks and attack skills leech 4% of damage as HP.' },
    { id: 'rune_ember', name: 'รูนเพลิง', nameEn: 'Ember Rune', category: 'element', icon: 'runeEmber', shape: 'flame', symbol: 'flame', floor: 1, effect: 'fire', amount: 0.1, desc: 'ดาเมจธาตุไฟ +10%', descEn: '+10% fire damage.' },
    { id: 'rune_frost', name: 'รูนเหมันต์', nameEn: 'Frost Rune', category: 'element', icon: 'runeFrost', shape: 'hexagon', symbol: 'snowflake', floor: 1, effect: 'ice', amount: 0.1, desc: 'ดาเมจธาตุน้ำแข็ง +10%', descEn: '+10% ice damage.' },
    { id: 'rune_thunder', name: 'รูนอสนี', nameEn: 'Thunder Rune', category: 'element', icon: 'runeThunder', shape: 'kite', symbol: 'lightning', floor: 11, effect: 'elec', amount: 0.1, desc: 'ดาเมจธาตุสายฟ้า +10%', descEn: '+10% lightning damage.' },
    { id: 'rune_gale', name: 'รูนวายุ', nameEn: 'Gale Rune', category: 'element', icon: 'runeGale', shape: 'notched-circle', symbol: 'spiral', floor: 11, effect: 'wind', amount: 0.1, desc: 'ดาเมจธาตุลม +10%', descEn: '+10% wind damage.' },
    { id: 'rune_sun', name: 'รูนอรุณ', nameEn: 'Dawn Rune', category: 'element', icon: 'runeSun', shape: 'octagon', symbol: 'sun', floor: 21, effect: 'light', amount: 0.1, desc: 'ดาเมจธาตุแสง +10%', descEn: '+10% light damage.' },
    { id: 'rune_moon', name: 'รูนราตรี', nameEn: 'Night Rune', category: 'element', icon: 'runeMoon', shape: 'crescent', symbol: 'crescent', floor: 21, effect: 'dark', amount: 0.1, desc: 'ดาเมจธาตุมืด +10%', descEn: '+10% dark damage.' },
    { id: 'rune_focus', name: 'รูนสมาธิ', nameEn: 'Focus Rune', category: 'tempo', icon: 'runeFocus', shape: 'square', symbol: 'eye', floor: 10, blueprint: true, effect: 'focus', amount: 2, desc: 'การโจมตีแต่ละฮิตสร้าง Focus เพิ่ม 2', descEn: 'Each attack hit generates 2 extra Focus.' },
    { id: 'rune_discovery', name: 'รูนนักสำรวจ', nameEn: 'Discovery Rune', category: 'utility', icon: 'runeDiscovery', shape: 'compass-star', symbol: 'compass', floor: 10, blueprint: true, effect: 'material', amount: 0.1, desc: 'โอกาสดรอปวัตถุดิบจากการต่อสู้ ×1.10', descEn: 'Battle material drop chance ×1.10.' }
  ];
  var recipes = [];
  runes.forEach(function (r, i) {
    D.items.push(Object.assign({}, r, { kind: 'rune', tier: 1, price: 100 + Math.floor(i / 4) * 30, craftOnly: true }));
    var primary = r.category === 'defense' || r.category === 'recovery' ? 'part_cloth' : r.category === 'offense' ? 'part_metal' : 'part_dust';
    recipes.push({ id: 'make_' + r.id, type: 'rune', resultId: r.id, floor: r.floor, blueprint: r.blueprint ? r.id : null, gold: 80 + Math.floor(i / 4) * 20, materials: [{ id: primary, qty: 2 }, { id: primary === 'part_dust' ? 'part_metal' : 'part_dust', qty: 1 }] });
  });
  var affixes = [
    { id: 'keen', name: 'คมสังหาร', nameEn: 'Keen', effect: 'critDamage', amount: 0.12, desc: 'ดาเมจคริติคอล +12%', descEn: '+12% critical-hit damage.' },
    { id: 'sanguine', name: 'กระหายเลือด', nameEn: 'Sanguine', effect: 'leech', amount: 0.04, desc: 'การโจมตีดูดเลือด 4%', descEn: 'Attack hits leech 4% HP.' },
    { id: 'sundering', name: 'ทลาย', nameEn: 'Sundering', effect: 'break', amount: 8, desc: 'การโจมตีแต่ละฮิตเพิ่ม Break อีก 8', descEn: '+8 Break per attack hit.' }
  ];
  D.items.filter(function (it) { return it.kind === 'weapon' && !it.questOnly; }).forEach(function (base) {
    affixes.forEach(function (affix) {
      var id = 'forge_' + base.id + '_' + affix.id, magic = (base.statBonus.mag || 0) > (base.statBonus.atk || 0);
      var item = Object.assign({}, base, { id: id, name: base.name + ' · ' + affix.name, nameEn: affix.nameEn + ' ' + base.nameEn, icon: 'forge' + (magic ? 'Staff' : 'Blade') + affix.id, craftOnly: true, price: F.shopPrice(base), forgeEffect: { effect: affix.effect, amount: affix.amount }, baseId: base.id, desc: base.desc + ' • ' + affix.desc, descEn: base.descEn + ' • ' + affix.descEn });
      D.items.push(item);
      recipes.push({ id: 'make_' + id, type: 'forge', resultId: id, baseId: base.id, affix: affix.id, floor: ({1:1,2:11,3:21,4:31,5:41,6:45,7:75,8:55,9:60})[base.tier] || 1, gold: 60 * base.tier, materials: [{ id: base.id, qty: 1 }, { id: affix.id === 'sanguine' ? 'part_dust' : 'part_metal', qty: 2 }, { id: 'part_cloth', qty: 1 }] });
    });
  });
  D.items.filter(function (it) { return it.kind === 'armor' && !it.questOnly; }).forEach(function (base) {
    var id = 'orin_' + base.id, stats = Object.assign({}, base.statBonus);
    stats.def = (stats.def || 0) + base.tier * 2; stats.res = (stats.res || 0) + base.tier;
    var desc = Object.keys(stats).map(function (key) { return '+' + stats[key] + ' ' + key.toUpperCase(); }).join(', ');
    D.items.push(Object.assign({}, base, { id: id, name: base.name + ' · เสริมแผ่นเกราะ', nameEn: 'Reinforced ' + base.nameEn, statBonus: stats, icon: 'workReinforced', craftOnly: true, price: F.shopPrice(base), baseId: base.id, desc: desc, descEn: desc }));
    recipes.push({ id: 'make_' + id, type: 'armor', resultId: id, npc: 'orin', trust: 1, floor: Math.max(8, ({1:1,2:11,3:21,4:31,5:41,6:45,7:75})[base.tier] || 1), gold: 80 * base.tier, materials: [{ id: base.id, qty: 1 }, { id: 'part_metal', qty: 2 }, { id: 'part_cloth', qty: 2 }] });
  });
  G.WorkshopData = { components: components, runes: runes, affixes: affixes, recipes: recipes };
})();
