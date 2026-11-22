const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./helpers/load-game');

test('timing judge counts only stops inside the band, edges included', () => {
  const M = loadGame().Minigame;
  assert.equal(M.judge(0.5, 0.4, 0.2), true);
  assert.equal(M.judge(0.4, 0.4, 0.2), true);
  assert.equal(M.judge(0.3, 0.4, 0.2), false);
  assert.equal(M.judge(0.61, 0.4, 0.2), false);
});

test('higher/lower never offers an impossible side and never has a positive expected value', () => {
  const M = loadGame().Minigame;
  assert.equal(M.hiLoOdds(1).lower.available, false);
  assert.equal(M.hiLoOdds(13).higher.available, false);
  for (let card = 1; card <= 13; card++) {
    const odds = M.hiLoOdds(card);
    for (const side of [odds.higher, odds.lower]) {
      if (!side.available) continue;
      assert.ok(side.mult >= 1.05 && side.mult <= 12, 'card ' + card);
      assert.ok(side.p * side.mult <= 1.0001, 'EV card ' + card + ' ' + side.p * side.mult);
    }
  }
  assert.equal(M.hiLoPayout(100, 1.5), 150);
});

test('mini-games default to on and the setting persists in save metadata', () => {
  const g = loadGame(), M = g.Minigame;
  assert.equal(M.enabled(), true);
  M.setEnabled(false);
  assert.equal(M.enabled(), false);
  assert.equal(g.Save.readMeta().minigames, false);
  M.setEnabled(true);
  assert.equal(M.enabled(), true);
});

test('every mini-game string exists in Thai and English', () => {
  const g = loadGame();
  for (const key of ['mgLockTitle','mgLockHint','mgCardsTitle','mgForgeTitle','mgForgeHint','mgForgeBonus','setMinigames']) {
    for (const lang of ['th','en']) { g.I18n.setLang && g.I18n.setLang(lang); const text = g.I18n.t(key); assert.ok(text && text !== key, key + ' ' + lang); }
  }
});

test('no forge recipe refunds its base weapon: every recipe has a non-equipment part to return', () => {
  const g = loadGame();
  for (const r of g.Workshop.allRecipes().filter(x => x.type === 'forge')) {
    const part = r.materials.find(m => { const it = g.Data.getItem(m.id); return it && (it.kind === 'component' || it.kind === 'material'); });
    if (part) assert.ok(!['weapon','armor','shoes','accessory'].includes(g.Data.getItem(part.id).kind), r.id);
  }
});
