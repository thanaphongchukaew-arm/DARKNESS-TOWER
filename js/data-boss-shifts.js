// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Boss phase shifts. Crossing an HP threshold already swaps a boss's moves; this
// file makes those turning points change the fight itself:
//   * affinity  - the boss's weakness / resistance flips or is replaced,
//   * focus     - what its phase "signature" attack (attack.shiftHit) goes after:
//                 'companion' pins your companion for the next round,
//                 'mana' drains 8% of your max MP, 'buffs' strips one of your buffs.
// The final boss's four phases carry hand-written shifts; every mini-boss gets a
// 2nd phase at 50% HP that flips its affinity and enrages its moves.
(function () {
  var D = window.Game.Data;
  function scaled(attack, mult) { return Object.assign({}, attack, { power: Math.round(attack.power * mult * 100) / 100 }); }

  // ---- Final boss (Timeless Sovereign): explicit element swaps per phase ----
  var bossShifts = [
    { weak: 'ice', resist: 'fire', focus: 'buffs' },      // phase 2 - flames burn away your boons
    { weak: 'fire', resist: 'ice', focus: 'companion' },  // phase 3 - glacier freezes your ally in place
    { weak: 'dark', resist: 'elec', focus: 'mana' }       // phase 4 - true form devours mana
  ];
  D.boss.phases.forEach(function (phase, i) {
    phase.shift = bossShifts[i];
    phase.attacks[0].shiftHit = true;
  });

  // ---- Mini-bosses: flip affinity at 50% HP, and hunt a different resource ----
  var focusByFloor = { 5: 'buffs', 10: 'mana', 15: 'companion', 20: 'buffs', 25: 'mana', 30: 'companion', 35: 'mana', 40: 'buffs', 45: 'companion', 50: 'mana' };
  var phaseText = {
    buffs: { th: 'โกรธจัดและเริ่มทำลายพลังเสริมของคุณ!', en: 'is enraged and begins shredding your buffs!' },
    mana: { th: 'โกรธจัดและเริ่มดูดมานาของคุณ!', en: 'is enraged and begins draining your mana!' },
    companion: { th: 'โกรธจัดและเล็งไปที่สหายของคุณ!', en: 'is enraged and hunts your companion!' }
  };
  var signature = {
    buffs: { name: 'ฉีกพลังเสริม', nameEn: 'Boon Rend' },
    mana: { name: 'ดูดกลืนมานา', nameEn: 'Mana Siphon' },
    companion: { name: 'ตรึงผู้ร่วมทาง', nameEn: 'Pin the Ally' }
  };
  Object.keys(D.minibosses).forEach(function (floor) {
    var mini = D.minibosses[floor];
    if (mini.phases && mini.phases.length) return;
    var focus = focusByFloor[floor] || 'mana';
    var lead = mini.attacks[0];
    var attacks = mini.attacks.map(function (a) { return scaled(a, 1.12); });
    attacks.unshift(Object.assign({}, scaled(lead, 1.05), { name: signature[focus].name, nameEn: signature[focus].nameEn, weight: 3, shiftHit: true, debuff: undefined }));
    mini.phases = [{
      hpThreshold: 0.5,
      announce: mini.name + ' ' + phaseText[focus].th,
      announceEn: mini.nameEn + ' ' + phaseText[focus].en,
      shift: { flip: true, focus: focus },
      attacks: attacks
    }];
  });
})();
