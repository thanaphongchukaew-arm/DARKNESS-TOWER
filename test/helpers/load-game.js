// Loads a subset of the real js/*.js source files into an isolated vm sandbox,
// in the same dependency order scripts/build.js concatenates them in, so tests
// exercise the actual production code (not a reimplementation of it). Returns
// the resulting window.Game object.
//
// A minimal localStorage stub is provided since save.js touches it inside
// try/catch-guarded functions; a plain in-memory Map is enough for tests that
// don't care about persistence, and keeps this file dependency-free.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..', '..');

const FILES = [
  'js/i18n.js',
  'js/data-classes.js',
  'js/data-skills.js',
  'js/data-enemies.js',
  'js/data-items.js',
  'js/data-recipes.js',
  'js/data-quests.js',
  'js/data-blessings.js',
  'js/data-relics.js',
  'js/data-events.js',
  'js/data-companions.js',
  'js/data-achievements.js',
  'js/formulas.js',
  'js/save.js',
  'js/state.js',
  'js/battle-engine.js'
];

function makeLocalStorageStub() {
  const store = new Map();
  return {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k)
  };
}

function loadGame() {
  const sandbox = {
    window: {},
    localStorage: makeLocalStorageStub(),
    document: { documentElement: {} },
    console
  };
  vm.createContext(sandbox);
  for (const rel of FILES) {
    const src = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    vm.runInContext(src, sandbox, { filename: rel });
  }
  return sandbox.window.Game;
}

module.exports = { loadGame };
