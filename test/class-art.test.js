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

test('all 29 classes use pixel sprites and retain shipped illustration assets offline', () => {
  const game = loadArt();
  const hashes = new Set();
  const serviceWorker = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const files = require('../package.json').build.files;
  assert.ok(files.includes('assets/classes/**'));
  assert.equal(game.Data.classes.length, 29);
  for (const cls of game.Data.classes) {
    assert.ok(game.ClassArt.has(cls.icon), cls.id);
    const svg = game.ClassArt.render(cls.icon);
    const relative = 'assets/classes/' + cls.icon + '.webp';
    assert.ok(svg.includes('pixel-sprite'), cls.id);
    assert.ok(game.PixelArt.has(cls.icon), cls.id);
    assert.ok(!svg.includes('<image'), cls.id);
    const png = fs.readFileSync(path.join(root, relative));
    assert.equal(png.subarray(0, 4).toString('latin1'), 'RIFF', cls.id);
    assert.equal(png.subarray(8, 12).toString('latin1'), 'WEBP', cls.id);
    assert.ok(png.length < 300 * 1024, cls.id + ' stays small enough to precache');
    const hash = crypto.createHash('sha256').update(png).digest('hex');
    assert.ok(!hashes.has(hash), cls.id + ' duplicates another portrait');
    hashes.add(hash);
    assert.ok(serviceWorker.includes("'./" + relative + "'"), cls.id + ' offline');
  }
  assert.equal(game.ClassArt.has('toString'), false);
  assert.equal(game.ClassArt.render('not-a-class'), '');
});

test('battle uses pixel class sprites and retains animation and talent layers', () => {
  const game = loadArt();
  for (const cls of game.Data.classes) {
    const html = game.HeroArt.render({ classId: cls.id, talents: { 5: 'riposte', 10: 'affliction', 15: 'focus_guard' } }, 'hero-guard');
    for (const marker of ['pixel-sprite', 'hero-body', 'hero-guard', 'hero-halo', 'hero-runes', 'hero-armament', 'hero-slash', 'hero-ward']) {
      assert.ok(html.includes(marker), cls.id + ': ' + marker);
    }
  }
});
