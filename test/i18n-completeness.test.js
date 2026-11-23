// Translation completeness. English silently falls back to Thai when a string is missing, so an
// English player would just see Thai text with no error. Guard: UI dictionary and game data.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { loadGame } = require('./helpers/load-game.js');

const JS_DIR = path.join(__dirname, '..', 'js');
const i18nSrc = fs.readFileSync(path.join(JS_DIR, 'i18n.js'), 'utf8');
const THAI = /[฀-๿]/;

// ---- the UI string dictionary (private to i18n.js, so evaluate its literal) ---------------------
const start = i18nSrc.indexOf('var STRINGS = {');
const end = i18nSrc.indexOf('\n  };', start);
const literal = i18nSrc.slice(start + 'var STRINGS = '.length, end + 4);
const STRINGS = vm.runInNewContext('(' + literal + ')');
const keys = Object.keys(STRINGS);

test('the dictionary was parsed', () => { assert.ok(keys.length > 300, 'only ' + keys.length + ' keys parsed'); });

test('no key is defined twice (the later definition silently wins)', () => {
  const seen = new Map(), dup = [];
  for (const m of literal.matchAll(/^ {4}([A-Za-z0-9_]+):\s*\{/gm)) { if (seen.has(m[1])) dup.push(m[1]); seen.set(m[1], 1); }
  assert.deepEqual(dup, [], 'duplicate keys: ' + dup.join(', '));
});

test('every key has a non-empty Thai AND English text', () => {
  const bad = keys.filter((k) => !STRINGS[k] || typeof STRINGS[k].th !== 'string' || !STRINGS[k].th.trim() || typeof STRINGS[k].en !== 'string' || !STRINGS[k].en.trim());
  assert.deepEqual(bad, [], 'missing translation: ' + bad.join(', '));
});

test('English texts contain no Thai characters (a Thai string pasted into the English slot)', () => {
  const bad = keys.filter((k) => THAI.test(STRINGS[k].en || ''));
  assert.deepEqual(bad, [], 'Thai text in the English slot: ' + bad.join(', '));
});

test('Thai and English use the same {placeholders}', () => {
  const ph = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');
  const bad = keys.filter((k) => ph(STRINGS[k].th) !== ph(STRINGS[k].en)).map((k) => k + ' th{' + ph(STRINGS[k].th) + '} en{' + ph(STRINGS[k].en) + '}');
  assert.deepEqual(bad, [], 'placeholder mismatch: ' + bad.join('; '));
});

test('every literal key the code asks for exists in the dictionary', () => {
  const used = new Map();
  for (const f of fs.readdirSync(JS_DIR).filter((x) => x.endsWith('.js') && x !== 'i18n.js')) {
    const src = fs.readFileSync(path.join(JS_DIR, f), 'utf8');
    for (const m of src.matchAll(/(?:\bT|\bt|I18n\.t|\bTT)\(\s*['"]([A-Za-z][A-Za-z0-9_]*)['"]\s*[,)]/g)) if (!used.has(m[1])) used.set(m[1], f);
  }
  assert.ok(used.size > 100, 'only ' + used.size + ' key uses found (regex broken?)');
  const missing = [...used].filter(([k]) => !(k in STRINGS)).map(([k, f]) => k + ' (' + f + ')');
  assert.deepEqual(missing, [], 'keys requested but not defined (shown raw on screen): ' + missing.join(', '));
});

// ---- game data: every Thai text field needs its English twin (<field>En) -----------------------
const Game = loadGame();
const D = Game.Data;
const COLLECTIONS = ['classes', 'skills', 'items', 'enemies', 'blessings', 'curses', 'relics', 'quests', 'events', 'recipes', 'companions', 'achievements', 'minibosses', 'talents'];

function missingEnglish(collection) {
  const list = Array.isArray(collection) ? collection : Object.values(collection || {});
  const out = [];
  list.forEach((entry, i) => {
    if (!entry || typeof entry !== 'object') return;
    for (const k of Object.keys(entry)) {
      if (k.endsWith('En') || typeof entry[k] !== 'string' || !THAI.test(entry[k])) continue;
      const en = entry[k + 'En'];
      if (typeof en !== 'string' || !en.trim()) out.push((entry.id || i) + '.' + k);
      else if (THAI.test(en)) out.push((entry.id || i) + '.' + k + 'En (contains Thai)');
    }
  });
  return out;
}

for (const name of COLLECTIONS) {
  test('data: every Thai text in "' + name + '" has an English translation', { skip: !D[name] ? 'collection not present' : false }, () => {
    const bad = missingEnglish(D[name]);
    assert.deepEqual(bad.slice(0, 25), [], bad.length + ' untranslated field(s) in ' + name + ' (English players would see Thai): ' + bad.slice(0, 25).join(', '));
  });
}

test('the data check is not vacuous: it sees hundreds of Thai fields and catches a removed translation', () => {
  let thaiFields = 0;
  for (const name of COLLECTIONS) {
    const list = Array.isArray(D[name]) ? D[name] : Object.values(D[name] || {});
    list.forEach((e) => { if (e && typeof e === 'object') Object.keys(e).forEach((k) => { if (!k.endsWith('En') && typeof e[k] === 'string' && THAI.test(e[k])) thaiFields++; }); });
  }
  assert.ok(thaiFields > 500, 'only ' + thaiFields + ' Thai fields examined');
  const sample = { ...D.skills[0] }; delete sample.nameEn;
  assert.deepEqual(missingEnglish([sample]), [sample.id + '.name']);
  const pasted = { ...D.skills[0], nameEn: 'ชื่อไทย' };
  assert.match(missingEnglish([pasted])[0], /contains Thai/);
});
