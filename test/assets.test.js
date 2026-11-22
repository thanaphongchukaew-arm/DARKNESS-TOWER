// Guards for shipped artwork: a missing PNG renders as a broken-image glyph, and a missing
// service-worker precache URL makes cache.addAll() reject, so offline install fails entirely.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ROOT = path.join(__dirname, '..');

test('every precached service-worker URL exists on disk', () => {
  const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  const urls = [...sw.matchAll(/'(\.\/[^']+)'/g)].map((m) => m[1]).filter((u) => u !== './');
  assert.ok(urls.length > 10);
  const missing = urls.filter((u) => !fs.existsSync(path.join(ROOT, u)));
  assert.deepEqual(missing, []);
});

test('NPC, companion and class artwork each have a shipped PNG', () => {
  const load = (file) => { const ctx = vm.createContext({ window: { Game: {} } }); vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', file), 'utf8'), ctx); return ctx.window.Game; };
  const npc = load('npc-art.js').NPCArt, companion = load('companion-art.js').CompanionArt;
  for (const key of npc.keys) assert.ok(fs.existsSync(path.join(ROOT, 'assets/pixel16/npcs', key + '.png')), 'npc ' + key);
  for (const key of companion.keys) assert.ok(fs.existsSync(path.join(ROOT, 'assets/pixel16/companions', key + '.png')), 'companion ' + key);
  // Every claimed key renders a PNG-backed sprite; unknown keys fall back to the code-drawn art.
  for (const key of npc.keys) assert.ok(npc.render(key).includes('assets/pixel16/npcs/' + key + '.png'), 'render ' + key);
  assert.equal(npc.render('npcDoesNotExist'), '');
});
