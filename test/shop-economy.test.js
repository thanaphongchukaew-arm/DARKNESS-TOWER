// Shop / economy rules that must hold for EVERY item at EVERY floor: no money glitches, no negative
// gold or stock, no state change on a failed purchase/sale/craft.
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadGame } = require('./helpers/load-game.js');

const Game = loadGame();
const { State, Formulas: F, Data: D } = Game;
const fresh = () => { const r = State.createRun('normal', 'blade', 0); r.gold = 0; r.inventory = {}; return r; };
const snapshot = (r) => JSON.stringify({ gold: r.gold, inv: r.inventory, eq: r.equipment });

test('every item has a finite, positive, whole-number shop price', () => {
  for (const item of D.items) {
    const p = F.shopPrice(item);
    assert.ok(Number.isInteger(p) && p > 0, item.id + ' shopPrice=' + p);
  }
});

test('selling is always strictly cheaper than buying, so buy->sell can never create gold', () => {
  for (const item of D.items) {
    for (let floor = 1; floor <= 100; floor++) {
      const sell = F.sellPrice(item, floor), buy = F.shopPrice(item);
      assert.ok(Number.isInteger(sell) && sell >= 1, item.id + '@' + floor + ' sellPrice=' + sell);
      assert.ok(sell < buy || buy === 1, item.id + '@' + floor + ': sell ' + sell + ' >= buy ' + buy + ' (money exploit)');
    }
  }
});

test('sell value of the same item never goes UP as the player moves further past its tier', () => {
  for (const item of D.items) {
    let prev = Infinity;
    for (let floor = 1; floor <= 100; floor++) {
      const v = F.sellPrice(item, floor);
      assert.ok(v <= prev, item.id + ' sell value rose at floor ' + floor + ' (' + prev + ' -> ' + v + ')');
      prev = v;
    }
  }
});

test('spendGold: refuses when short, changes nothing, and never leaves negative gold', () => {
  const r = fresh(); r.gold = 50;
  assert.equal(State.spendGold(r, 51), false); assert.equal(r.gold, 50);
  assert.equal(State.spendGold(r, 50), true); assert.equal(r.gold, 0);
  assert.equal(State.spendGold(r, 1), false); assert.equal(r.gold, 0);
  r.gold = undefined;
  assert.equal(State.spendGold(r, 1), false);
});

test('spendGold with NaN / negative amounts must not mint gold', () => {
  const r = fresh(); r.gold = 100;
  State.spendGold(r, NaN);
  assert.ok(Number.isFinite(r.gold), 'gold became ' + r.gold + ' after spendGold(NaN)');
  const before = r.gold;
  const ok = State.spendGold(r, -500);
  assert.ok(!ok || r.gold <= before, 'spendGold(-500) increased gold from ' + before + ' to ' + r.gold + ' (a negative price would be a money exploit)');
});

test('sellItem: only sells what you own, pays the displayed price, and removes exactly qty', () => {
  const r = fresh(); r.currentFloor = 12;
  const item = D.items.find((i) => i.kind === 'material');
  State.addItem(r, item.id, 3);
  const unit = F.sellPrice(item, 12);
  assert.equal(State.sellItem(r, item.id, 1), unit);
  assert.equal(r.gold, unit); assert.equal(r.inventory[item.id], 2);
  const before = snapshot(r);
  assert.equal(State.sellItem(r, item.id, 3), 0, 'cannot sell more than owned'); assert.equal(snapshot(r), before);
  assert.equal(State.sellItem(r, 'not_an_item', 1), 0); assert.equal(snapshot(r), before);
  assert.equal(State.sellItem(r, D.items[0].id === item.id ? D.items[1].id : D.items[0].id, 1), 0, 'cannot sell an item you do not have'); assert.equal(snapshot(r), before);
  assert.equal(State.sellItem(r, item.id, 2), unit * 2);
  assert.equal(r.inventory[item.id], undefined, 'selling the last copy removes the entry');
});

test('sellItem with a negative quantity must not pay out negative gold or conjure items', () => {
  const r = fresh(); r.gold = 100;
  const item = D.items.find((i) => i.kind === 'consumable');
  State.addItem(r, item.id, 2);
  const before = snapshot(r);
  const res = State.sellItem(r, item.id, -3);
  assert.ok(res === 0 && snapshot(r) === before, 'sellItem(-3) changed state: ' + snapshot(r) + ' (was ' + before + ', returned ' + res + ')');
});

test('addItem / removeItem keep the bag clean: no zero/negative/fractional entries', () => {
  const r = fresh();
  State.addItem(r, 'p_hp_small', 0); State.addItem(r, 'p_hp_small', -2); State.addItem(r, '', 3); State.addItem(r, null, 3);
  assert.deepEqual(r.inventory, {});
  State.addItem(r, 'p_hp_small', 2);
  State.removeItem(r, 'p_hp_small', 5);
  assert.deepEqual(r.inventory, {}, 'over-removing must clamp to 0 and delete the entry');
  State.removeItem(r, 'never_owned', 1); assert.deepEqual(r.inventory, {});
});

test('craftItem: needs ALL materials AND gold; a failed craft changes nothing; success spends exactly the recipe', () => {
  for (const recipe of D.recipes) {
    const r = fresh();
    recipe.materials.forEach((m) => State.addItem(r, m.id, m.qty));
    r.gold = Math.max(0, (recipe.gold || 0) - 1);
    if (recipe.gold) {
      const before = snapshot(r);
      assert.equal(State.craftItem(r, recipe.id), false, recipe.id + ': one gold short must fail');
      assert.equal(snapshot(r), before, recipe.id + ': failed craft changed state');
    }
    r.gold = (recipe.gold || 0) + 7;
    if (recipe.materials.length) {
      const m0 = recipe.materials[0];
      const saved = r.inventory[m0.id]; r.inventory[m0.id] = m0.qty - 1; if (r.inventory[m0.id] === 0) delete r.inventory[m0.id];
      const before = snapshot(r);
      assert.equal(State.craftItem(r, recipe.id), false, recipe.id + ': one material short must fail');
      assert.equal(snapshot(r), before, recipe.id + ': failed craft changed state');
      r.inventory[m0.id] = saved;
    }
    assert.equal(State.craftItem(r, recipe.id), true, recipe.id + ': fully funded craft must succeed');
    assert.equal(r.gold, 7, recipe.id + ': gold spent must equal recipe.gold');
    assert.ok((r.inventory[recipe.resultId] || 0) >= (recipe.resultQty || 1), recipe.id + ': result missing');
    recipe.materials.forEach((m) => { if (m.id !== recipe.resultId) assert.equal(r.inventory[m.id] || 0, 0, recipe.id + ': material ' + m.id + ' not fully consumed'); });
  }
});

test('every recipe references real items and is actually craftable from obtainable things', () => {
  for (const recipe of D.recipes) {
    assert.ok(D.getItem(recipe.resultId), recipe.id + ' result ' + recipe.resultId + ' does not exist');
    recipe.materials.forEach((m) => { assert.ok(D.getItem(m.id), recipe.id + ' material ' + m.id + ' does not exist'); assert.ok(m.qty > 0); });
    assert.ok((recipe.gold || 0) >= 0);
  }
});

test('every consumable that is marked battle-usable can be used and never over-heals or goes negative', () => {
  for (const item of D.items.filter((i) => i.kind === 'consumable')) {
    const r = State.createRun('normal', 'blade', 0); State.fullRestore(r);
    r.inventory = {}; r.hp = 1; r.mp = 0; State.addItem(r, item.id, 1);
    const res = State.useConsumable(r, item.id);
    const maxHp = State.getMaxHp(r), maxMp = State.getMaxMp(r);   // after use: some items (e.g. scrolls) grant a level
    if (!res.ok) { assert.equal(r.inventory[item.id], 1, item.id + ': a rejected use must not consume the item'); continue; }
    assert.equal(r.inventory[item.id] || 0, 0, item.id + ': a successful use must consume exactly one');
    assert.ok(r.hp >= 0 && r.hp <= maxHp, item.id + ' hp ' + r.hp + '/' + maxHp);
    assert.ok(r.mp >= 0 && r.mp <= maxMp, item.id + ' mp ' + r.mp + '/' + maxMp);
  }
});
