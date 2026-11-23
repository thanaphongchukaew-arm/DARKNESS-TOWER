// Size budgets. The game is downloaded and cached whole (service worker precache), so growth is felt by
// every player on first load. These ceilings sit ~15% above today's sizes: crossing one is allowed, but
// must be a conscious decision (raise the number here in the same change).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const size = (p) => fs.statSync(path.join(ROOT, p)).size;
const kb = (n) => (n / 1024).toFixed(0) + ' KB';

const BUDGET = {
  bundle: 1200 * 1024,           // dist/game.min.js            (today ~1.0 MB)
  css: 290 * 1024,               // all css/*.css               (today ~237 KB)
  precache: 7000 * 1024,         // 24 indexed 16-bit room banners; whole offline game ~6.2 MB
  singleAsset: 600 * 1024        // any one precached file except the bundle
};

const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
const cached = [...new Set([...sw.matchAll(/'\.\/([^']+)'/g)].map((m) => m[1]))].filter((f) => f && fs.existsSync(path.join(ROOT, f)) && fs.statSync(path.join(ROOT, f)).isFile());

test('game bundle stays under its size budget', () => {
  assert.ok(size('dist/game.min.js') <= BUDGET.bundle, 'dist/game.min.js is ' + kb(size('dist/game.min.js')) + ', budget ' + kb(BUDGET.bundle));
});

test('stylesheets stay under their size budget', () => {
  const total = fs.readdirSync(path.join(ROOT, 'css')).filter((f) => f.endsWith('.css')).reduce((n, f) => n + size('css/' + f), 0);
  assert.ok(total <= BUDGET.css, 'css is ' + kb(total) + ', budget ' + kb(BUDGET.css));
});

test('the whole precache stays under its size budget', () => {
  const total = cached.reduce((n, f) => n + size(f), 0);
  assert.ok(cached.length > 100, 'precache list looks wrong (' + cached.length + ' files)');
  assert.ok(total <= BUDGET.precache, 'precache is ' + kb(total) + ', budget ' + kb(BUDGET.precache));
});

test('no single shipped asset is unreasonably large', () => {
  const fat = cached.filter((f) => f !== 'dist/game.min.js' && size(f) > BUDGET.singleAsset).map((f) => f + ' (' + kb(size(f)) + ')');
  assert.deepEqual(fat, [], 'assets over ' + kb(BUDGET.singleAsset) + ': ' + fat.join(', '));
});
