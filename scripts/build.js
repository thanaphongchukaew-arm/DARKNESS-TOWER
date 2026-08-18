// Bundles + minifies/mangles all game source files into dist/game.min.js so
// the shipped code isn't trivially readable in DevTools. index.html loads
// only the dist bundle, never the individual js/*.js files -- run
// `npm run build` after editing anything under js/ to regenerate it.
const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

const ROOT = path.join(__dirname, '..');
const OUT_FILE = path.join(ROOT, 'dist', 'game.min.js');

// Load order matters: later files reference window.Game.* set up by earlier ones.
const FILES = [
  'js/protect.js',
  'js/pixel-art.js',
  'js/pixel-sprites.js',
  'js/icons.js',
  'js/i18n.js',
  'js/audio.js',
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
  'js/battle-engine.js',
  'js/ui-menu.js',
  'js/ui-tower.js',
  'js/ui-codex.js',
  'js/ui-battle.js',
  'js/main.js'
];

async function build() {
  const sources = {};
  FILES.forEach(function (f) {
    sources[f] = fs.readFileSync(path.join(ROOT, f), 'utf8');
  });

  const result = await minify(sources, {
    compress: true,
    mangle: true,
    format: { comments: false }
  });
  if (result.error) throw result.error;

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, result.code);
  console.log('Built ' + path.relative(ROOT, OUT_FILE) + ' (' + result.code.length + ' bytes)');
}

build().catch(function (e) {
  console.error(e);
  process.exit(1);
});
