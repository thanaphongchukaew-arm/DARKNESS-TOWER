// dist/game.min.js is the only code the game loads. If someone edits js/ and forgets `npm run build`,
// players get stale code. `build.js --check` must fail in that situation (proven here on a temp copy).
const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const BUILD = path.join(ROOT, 'scripts', 'build.js');
const run = (env) => spawnSync(process.execPath, [BUILD, '--check'], { encoding: 'utf8', env: { ...process.env, ...env } });

test('dist/game.min.js matches what the current sources build to', () => {
  const r = run({});
  assert.equal(r.status, 0, 'dist is stale — run `npm run build`.\n' + r.stderr);
});

test('the freshness check really fails when a source changes after the build (proof on a temp copy)', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dist-fresh-'));
  try {
    fs.cpSync(path.join(ROOT, 'js'), path.join(tmp, 'js'), { recursive: true });
    const built = spawnSync(process.execPath, [BUILD], { encoding: 'utf8', env: { ...process.env, BUILD_ROOT: tmp } });
    assert.equal(built.status, 0, 'building the temp copy failed: ' + built.stderr);
    assert.equal(run({ BUILD_ROOT: tmp }).status, 0, 'a freshly built copy should be fresh');
    fs.appendFileSync(path.join(tmp, 'js', 'protect.js'), '\nwindow.__stale_probe = 1;\n');
    const r = run({ BUILD_ROOT: tmp });
    assert.equal(r.status, 1, 'a changed source must make the check fail');
    assert.match(r.stderr, /STALE/);
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
});
