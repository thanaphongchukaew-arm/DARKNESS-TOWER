// A shipped file changed => sw.js must carry a new cache version (see scripts/sw-version.js).
const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const SCRIPT = path.join(ROOT, 'scripts', 'sw-version.js');
const run = (args, root) => spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8', env: { ...process.env, SW_ROOT: root || ROOT } });

test('sw.js cache version is in step with the files it caches', () => {
  const r = run(['--check']);
  assert.equal(r.status, 0, r.stderr || r.stdout);
});

test('the guard works: changing a cached file demands a bump, and --write fixes it (proof on a temp copy)', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sw-version-'));
  try {
    fs.writeFileSync(path.join(tmp, 'sw.js'), "const CACHE_NAME = 'darkness-tower-v7';\nconst PRECACHE_URLS = [\n  './index.html',\n  './css/a.css',\n];\n");
    fs.mkdirSync(path.join(tmp, 'css'));
    fs.writeFileSync(path.join(tmp, 'index.html'), '<html></html>'); fs.writeFileSync(path.join(tmp, 'css', 'a.css'), 'a{}');
    assert.equal(run(['--write'], tmp).status, 0);
    assert.match(fs.readFileSync(path.join(tmp, 'sw.js'), 'utf8'), /darkness-tower-v8/, 'first --write records the hash and bumps');
    assert.equal(run(['--check'], tmp).status, 0, 'unchanged files: check passes');
    fs.writeFileSync(path.join(tmp, 'css', 'a.css'), 'a{color:red}');
    const bad = run(['--check'], tmp);
    assert.equal(bad.status, 1, 'a changed cached file must fail the check'); assert.match(bad.stderr, /Shipped files changed/);
    assert.equal(run(['--write'], tmp).status, 0);
    assert.match(fs.readFileSync(path.join(tmp, 'sw.js'), 'utf8'), /darkness-tower-v9/);
    assert.equal(run(['--check'], tmp).status, 0);
    fs.rmSync(path.join(tmp, 'css', 'a.css'));
    assert.equal(run(['--check'], tmp).status, 1, 'a removed cached file must also demand a bump');
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
});
