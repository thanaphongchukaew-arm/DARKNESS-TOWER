// Every image the code or CSS names literally must (1) exist on disk, (2) ship in the service-worker
// precache (otherwise it is missing when the player is offline), and (3) be packaged by electron-builder.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

const sources = [
  ...fs.readdirSync(path.join(ROOT, 'js')).filter((f) => f.endsWith('.js')).map((f) => 'js/' + f),
  ...fs.readdirSync(path.join(ROOT, 'css')).filter((f) => f.endsWith('.css')).map((f) => 'css/' + f),
  'index.html'
];
const refs = new Map();   // asset path -> first file that names it
for (const f of sources) {
  for (const m of read(f).matchAll(/(?:\.\.\/|\.\/)?(assets\/pixel16\/[A-Za-z0-9_\-./]+\.(?:png|webp|jpg|svg))/g)) {
    if (!refs.has(m[1])) refs.set(m[1], f);
  }
}

const sw = read('sw.js');
const precached = new Set([...sw.matchAll(/'\.\/([^']+)'/g)].map((m) => m[1]));

test('the scan found the artwork references (guards against the regex silently matching nothing)', () => {
  assert.ok(refs.size >= 2, 'only ' + refs.size + ' asset references found');
});

test('every image named in code or CSS exists on disk', () => {
  const missing = [...refs].filter(([p]) => !fs.existsSync(path.join(ROOT, p))).map(([p, f]) => p + ' (named in ' + f + ')');
  assert.deepEqual(missing, [], 'missing image files:\n  ' + missing.join('\n  '));
});

test('every image named in code or CSS is in the service-worker precache (works offline)', () => {
  const notCached = [...refs].filter(([p]) => !precached.has(p)).map(([p, f]) => p + ' (named in ' + f + ')');
  assert.deepEqual(notCached, [], 'not precached, so missing offline:\n  ' + notCached.join('\n  '));
});

test('every precached file is shipped by the desktop packager', () => {
  const pkg = JSON.parse(read('package.json'));
  const globs = pkg.build.files.filter((g) => !g.startsWith('!')).map((g) => g.replace(/\*\*$/, '').replace(/\/$/, ''));
  const notShipped = [...precached].filter((p) => p !== '' && !globs.some((g) => p === g || p.startsWith(g + '/') || p === g.replace(/\/$/, '')))
    .filter((p) => !/^(sw\.js|favicon|apple-touch)/.test(p));
  assert.deepEqual(notShipped, [], 'precached but not packaged by electron-builder:\n  ' + notShipped.join('\n  '));
});

test('every shipped image under assets/pixel16 is precached (monsters/scenes are loaded by computed names, so scan the folder)', () => {
  const out = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
      const rel = dir + '/' + e.name;
      if (e.isDirectory()) walk(rel);
      else if (/\.(png|webp|jpg)$/.test(e.name) && !/-source\.png$/.test(e.name) && !precached.has(rel)) out.push(rel);
    }
  })('assets/pixel16');
  assert.deepEqual(out, [], 'shipped but not precached (missing offline):\n  ' + out.join('\n  '));
});

test('every stylesheet and script that index.html loads is in the precache (a new css/js file must be added to sw.js)', () => {
  const html = read('index.html');
  const loaded = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g), ...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]).filter((u) => !/^https?:/.test(u));
  assert.ok(loaded.length >= 8, 'only ' + loaded.length + ' linked files found');
  const missing = loaded.filter((u) => !precached.has(u.replace(/^\.\//, '')));
  assert.deepEqual(missing, [], 'loaded by index.html but not precached (offline play breaks): ' + missing.join(', '));
});

test('no stylesheet in css/ is orphaned (exists but index.html never loads it)', () => {
  const html = read('index.html');
  const orphans = fs.readdirSync(path.join(ROOT, 'css')).filter((f) => f.endsWith('.css') && !html.includes('css/' + f));
  assert.deepEqual(orphans, [], 'css files never linked from index.html: ' + orphans.join(', '));
});
