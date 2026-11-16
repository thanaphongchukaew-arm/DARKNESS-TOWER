const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');

function loadArt() {
  const context = vm.createContext({ window: { Game: {} } });
  ['js/pixel-art.js', 'js/pixel-sprites.js', 'js/data-classes.js', 'js/class-art.js', 'js/hero-art.js'].forEach(file => vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context));
  return context.window.Game;
}

test('all 29 playable classes resolve to separate shipped PNG portraits and offline assets', () => {
  const game = loadArt();
  const hashes = new Set();
  const serviceWorker = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const files = require('../package.json').build.files;
  assert.ok(files.includes('assets/classes/**'));
  assert.equal(game.Data.classes.length, 29);
  for (const cls of game.Data.classes) {
    assert.ok(game.ClassArt.has(cls.icon), cls.id);
    const svg = game.ClassArt.render(cls.icon);
    const relative = 'assets/classes/' + cls.icon + '.png';
    assert.ok(svg.includes('href="' + relative + '"'), cls.id);
    const png = fs.readFileSync(path.join(root, relative));
    assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', cls.id);
    assert.ok(png.readUInt32BE(16) >= 512, cls.id + ' width');
    assert.ok(png.readUInt32BE(20) >= 512, cls.id + ' height');
    const hash = crypto.createHash('sha256').update(png).digest('hex');
    assert.ok(!hashes.has(hash), cls.id + ' duplicates another portrait');
    hashes.add(hash);
    assert.ok(serviceWorker.includes("'./" + relative + "'"), cls.id + ' offline');
  }
  assert.equal(game.ClassArt.has('toString'), false);
  assert.equal(game.ClassArt.render('not-a-class'), '');
});

test('battle uses the same class asset and retains animation and talent layers', () => {
  const game = loadArt();
  for (const cls of game.Data.classes) {
    const html = game.HeroArt.render({ classId: cls.id, talents: { 5: 'riposte', 10: 'affliction', 15: 'focus_guard' } }, 'hero-guard');
    for (const marker of ['assets/classes/' + cls.icon + '.png', 'hero-body', 'hero-guard', 'hero-halo', 'hero-runes', 'hero-armament', 'hero-slash', 'hero-ward']) {
      assert.ok(html.includes(marker), cls.id + ': ' + marker);
    }
  }
});
