// Golden saves: real run files captured from older versions of the game (see scripts/gen-save-fixtures.js).
// Every future version must still load and play every one of them. When a release changes the save
// shape, run `node scripts/gen-save-fixtures.js <version> test/fixtures/saves` and commit the new files.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadGame } = require('./helpers/load-game.js');
const { exercise } = require('./helpers/exercise-run.js');

const DIR = path.join(__dirname, 'fixtures', 'saves');
const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.json')).sort();

test('golden saves exist for several different game versions', () => {
  const versions = new Set(files.map((f) => f.split('-')[0]));
  assert.ok(versions.size >= 3, 'only ' + versions.size + ' fixture version(s): ' + [...versions].join(', '));
});

for (const file of files) {
  test('golden save ' + file + ' loads and plays on the current version', () => {
    const fx = JSON.parse(fs.readFileSync(path.join(DIR, file), 'utf8'));
    const Game = loadGame();
    // through the real Save layer, exactly as the Continue button does
    assert.ok(Game.Save.write(JSON.parse(JSON.stringify(fx.run))), 'could not write the save');
    const loaded = Game.Save.read();
    assert.ok(loaded && loaded.classId === fx.classId, 'save did not round-trip');
    exercise(Game, loaded, file);
    assert.ok(loaded.level >= 1 && loaded.hp >= 0, file + ': invalid vitals after load');
    assert.ok(Game.State.getMaxHp(loaded) > 0);
  });
}
