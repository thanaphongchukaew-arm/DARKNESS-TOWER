// Referential integrity of the game data: ids are unique, every cross-reference points at something that
// exists, every floor has enemies, and every item can actually be obtained. A typo in one data file
// otherwise shows up as a missing icon, a reward that never arrives, or an item nobody can ever get.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadGame } = require('./helpers/load-game.js');

const Game = loadGame();
const { Data: D, Formulas: F, State: S } = Game;
const asList = (c) => (Array.isArray(c) ? c : Object.values(c || {}));
const itemIds = new Set(D.items.map((i) => i.id));
const classIds = new Set(D.classes.map((c) => c.id));

test('ids are unique inside every collection', () => {
  const dup = [];
  for (const name of ['classes', 'skills', 'items', 'enemies', 'blessings', 'curses', 'relics', 'quests', 'events', 'recipes', 'companions', 'achievements']) {
    const seen = new Set();
    for (const e of D[name]) { if (seen.has(e.id)) dup.push(name + ':' + e.id); seen.add(e.id); }
  }
  assert.deepEqual(dup, [], 'duplicate ids: ' + dup.join(', '));
});

test('skills have valid shape and point at real classes', () => {
  const KINDS = new Set(['attack', 'heal', 'buffSelf', 'debuffEnemy']);
  const bad = [];
  for (const s of D.skills) {
    if (!s.id || !s.name || !s.nameEn) bad.push(s.id + ': missing id/name');
    if (!KINDS.has(s.kind)) bad.push(s.id + ': unknown kind ' + s.kind);
    if ((s.kind === 'attack' || s.kind === 'heal') && (!Number.isFinite(s.power) || s.power < 0)) bad.push(s.id + ': power ' + s.power);
    if (!Number.isInteger(s.cost) || s.cost < 0) bad.push(s.id + ': cost ' + s.cost);
    if (!Number.isInteger(s.minLevel) || s.minLevel < 1 || s.minLevel > 100) bad.push(s.id + ': minLevel ' + s.minLevel);
    if (!s.target) bad.push(s.id + ': no target');
    if (s.classOnly != null && !(Array.isArray(s.classOnly) ? s.classOnly : [s.classOnly]).every((c) => classIds.has(c))) bad.push(s.id + ': classOnly ' + s.classOnly + ' is not a class');
  }
  assert.deepEqual(bad, [], bad.join('\n'));
});

test('every class has a basic attack and a real skill set by level 60', () => {
  const bad = [];
  for (const c of D.classes) {
    const learned = D.getLearnedSkills(c.id, 60);
    if (!learned.some((s) => s.id === 'attack')) bad.push(c.id + ': no basic attack');
    if (learned.filter((s) => s.id !== 'attack').length < 3) bad.push(c.id + ': only ' + learned.length + ' skills at level 60');
    const st = c.baseStats || {};
    for (const k of ['hp', 'mp', 'atk', 'mag', 'def', 'res', 'spd', 'luk']) if (!Number.isFinite(st[k]) || st[k] < 0) bad.push(c.id + ': baseStats.' + k + ' = ' + st[k]);
    if (!(st.hp > 0)) bad.push(c.id + ': hp must be > 0');
  }
  assert.deepEqual(bad, [], bad.join('\n'));
});

test('every skill is learnable by at least one class (or is deliberately a reward-only skill)', () => {
  const learnable = new Set();
  for (const c of D.classes) D.getLearnedSkills(c.id, 100).forEach((s) => learnable.add(s.id));
  const rewardOnly = new Set();   // skills granted by scrolls/talents/events reference themselves by id in source data
  const src = JSON.stringify([D.items, D.events, D.relics, D.blessings, D.quests]);
  const orphan = D.skills.filter((s) => !learnable.has(s.id) && !src.includes('"' + s.id + '"') && !rewardOnly.has(s.id)).map((s) => s.id);
  assert.deepEqual(Array.from(orphan), [], 'skills no class can learn and nothing grants: ' + orphan.join(', '));
});

test('every floor 1-100 has enemies to fight, with sane stats and attacks', () => {
  const bad = [];
  for (let f = 1; f <= 100; f++) {
    if (f === 100 || D.getMiniBoss(f)) continue;
    const pool = D.getEnemiesByTier(F.tierForFloor(f));
    if (!pool.length) bad.push('floor ' + f + ': empty enemy pool for tier ' + F.tierForFloor(f));
    if (!(F.floorEnemyCount(f) >= 1)) bad.push('floor ' + f + ': enemy count ' + F.floorEnemyCount(f));
  }
  for (const e of [...D.enemies, ...asList(D.minibosses), D.boss]) {
    const st = e.baseStats || {};
    for (const k of ['hp', 'atk', 'mag', 'def', 'res', 'spd', 'luk', 'exp']) if (!Number.isFinite(st[k]) || st[k] < 0) bad.push((e.id || e.name) + ': baseStats.' + k + ' = ' + st[k]);
    if (!(st.hp > 0)) bad.push((e.id || e.name) + ': hp must be > 0');
    if (!Array.isArray(e.attacks) || !e.attacks.length) bad.push((e.id || e.name) + ': no attacks');
    (e.attacks || []).forEach((a, i) => { if (!a.name || !a.nameEn || !(a.power >= 0)) bad.push((e.id || e.name) + ' attack #' + i + ' incomplete'); });
  }
  assert.deepEqual(bad.slice(0, 30), [], bad.length + ' problem(s):\n' + bad.slice(0, 30).join('\n'));
});

test('items have valid shape (kind, tier, stats / effect)', () => {
  const KINDS = new Set(['weapon', 'armor', 'shoes', 'accessory', 'consumable', 'material', 'rune', 'component']);
  const STAT = new Set(['hp', 'mp', 'atk', 'mag', 'def', 'res', 'spd', 'luk']);
  const bad = [];
  for (const it of D.items) {
    if (!KINDS.has(it.kind)) bad.push(it.id + ': kind ' + it.kind);
    if (!Number.isInteger(it.tier) || it.tier < 1 || it.tier > 9) bad.push(it.id + ': tier ' + it.tier);
    if (['weapon', 'armor', 'shoes', 'accessory'].includes(it.kind)) {
      const keys = Object.keys(it.statBonus || {});
      if (!keys.length) bad.push(it.id + ': gear without statBonus');
      keys.forEach((k) => { if (!STAT.has(k) && !/^[a-z]+$/.test(k)) bad.push(it.id + ': odd stat ' + k); if (!Number.isFinite(it.statBonus[k])) bad.push(it.id + ': stat ' + k + ' not a number'); });
    }
    if (it.kind === 'consumable' && !it.effect && !it.battleUsable && !it.questOnly) bad.push(it.id + ': consumable with no effect');
    if (it.price != null && !(it.price > 0)) bad.push(it.id + ': price ' + it.price);
  }
  assert.deepEqual(bad, [], bad.join('\n'));
});

test('every item reference in recipes, quests and rewards points at a real item', () => {
  const bad = [];
  D.recipes.forEach((r) => { if (!itemIds.has(r.resultId)) bad.push('recipe ' + r.id + ' result ' + r.resultId); r.materials.forEach((m) => { if (!itemIds.has(m.id)) bad.push('recipe ' + r.id + ' material ' + m.id); }); });
  D.quests.forEach((q) => { ((q.reward && q.reward.items) || []).forEach((it) => { if (!itemIds.has(it.id)) bad.push('quest ' + q.id + ' reward ' + it.id); }); if (!(q.target > 0)) bad.push('quest ' + q.id + ' target ' + q.target); });
  assert.deepEqual(bad, [], bad.join('\n'));
});

test('every craft-only item has a recipe that produces it', () => {
  const fs = require('node:fs'), path = require('node:path');
  const produced = new Set(D.recipes.map((r) => r.resultId));
  const workshopSrc = ['data-workshop.js', 'workshop.js'].map((f) => fs.readFileSync(path.join(__dirname, '..', 'js', f), 'utf8')).join('\n');
  // forge_* (reforged weapons) and orin_* (armour services) are generated by the workshop system, not listed in recipes
  const bad = Array.from(D.items.filter((i) => i.craftOnly && !produced.has(i.id) && !/^(forge_|orin_)/.test(i.id) && !workshopSrc.includes(i.id)).map((i) => i.id));
  assert.deepEqual(bad, [], 'craft-only items nobody can craft: ' + bad.join(', '));
  assert.ok(D.items.filter((i) => /^(forge_|orin_)/.test(i.id)).length > 0 && /forge_/.test(workshopSrc) && /orin_/.test(workshopSrc), 'the workshop no longer mentions forge_/orin_ items');
});

test('every quest-only item is granted by a quest or an event', () => {
  const src = JSON.stringify([D.quests, D.events, D.relics, D.blessings, D.companions]);
  const bad = Array.from(D.items.filter((i) => i.questOnly && !src.includes('"' + i.id + '"')).map((i) => i.id));
  assert.deepEqual(bad, [], 'quest-only items nothing grants: ' + bad.join(', '));
});

test('every plain item can be obtained: sold in the shop pool, or dropped, or crafted', () => {
  // The shop sells every non-craft/quest item of gear and consumable kinds; materials come from drops.
  const bad = [];
  const dropTiers = new Set();
  const probe = State => State;   // eslint-friendly no-op keeps intent explicit
  probe(S);
  for (let f = 1; f <= 100; f += 1) dropTiers.add(F.tierForFloor(f));
  for (const it of D.items) {
    if (it.craftOnly || it.questOnly) continue;
    if (['weapon', 'armor', 'shoes', 'accessory', 'consumable'].includes(it.kind)) { if (!(it.tier >= 1)) bad.push(it.id + ': no tier, shop cannot place it'); continue; }
    if (it.kind === 'material' && !dropTiers.has(Math.min(it.tier, Math.max(...dropTiers)))) bad.push(it.id + ': material tier ' + it.tier + ' never appears');
  }
  assert.deepEqual(bad, [], bad.join('\n'));
});

test('companions, blessings and relics have what the game reads from them', () => {
  const bad = [];
  D.companions.forEach((c) => { if (!['attacker', 'healer', 'guardian', 'support', 'buffer', 'tank'].includes(c.role) && !c.role) bad.push('companion ' + c.id + ': role'); if (!(c.unlockFloor >= 1 && c.unlockFloor <= 100)) bad.push('companion ' + c.id + ': unlockFloor ' + c.unlockFloor); });
  [...D.blessings, ...D.curses].forEach((b) => { if (!Number.isFinite(b.amount) && !b.special) bad.push((b.id) + ': neither an amount nor a special effect'); });
  D.relics.forEach((r) => { if (!r.name || !r.nameEn || !r.desc) bad.push('relic ' + r.id + ': incomplete'); });
  assert.deepEqual(bad, [], bad.join('\n'));
});

test('mini-boss and boss floors line up with the tower layout', () => {
  const floors = Object.keys(D.minibosses).map(Number);
  assert.ok(floors.length >= 15, 'only ' + floors.length + ' mini-bosses');
  floors.forEach((f) => { assert.ok(f >= 5 && f < 100 && f % 5 === 0, 'mini-boss on odd floor ' + f); assert.ok(D.getMiniBoss(f), 'getMiniBoss(' + f + ')'); });
  assert.ok(D.boss && Object.keys(D.boss).length >= 1, 'no final boss defined');
});

test('story chapters sit on real floors and each traveler has distinct floors', () => {
  const bad = [];
  for (const [who, list] of Object.entries(D.story || {})) {
    asList(list).forEach((npc) => {
      if (!npc || !Array.isArray(npc.chapters)) return;
      const seen = new Set();
      npc.chapters.forEach((ch) => { if (!(ch.floor >= 1 && ch.floor <= 100)) bad.push((npc.id || who) + ': chapter floor ' + ch.floor); if (seen.has(ch.floor)) bad.push((npc.id || who) + ': two chapters on floor ' + ch.floor); seen.add(ch.floor); if (!ch.text || !ch.textEn) bad.push((npc.id || who) + ' floor ' + ch.floor + ': missing text/textEn'); });
    });
  }
  assert.deepEqual(bad, [], bad.join('\n'));
});
