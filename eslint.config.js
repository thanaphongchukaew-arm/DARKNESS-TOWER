// Flat ESLint config (ESLint 9+). The game's js/*.js files are plain
// browser-loaded scripts (see scripts/build.js -- no bundler, no modules), so
// they get the browser globals + script sourceType; test/ and scripts/ run
// under Node instead. dist/ is generated output and never linted.
const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  {
    files: ['js/**/*.js'],
    languageOptions: {
      sourceType: 'script',
      ecmaVersion: 2021,
      globals: globals.browser
    },
    rules: {
      // The codebase deliberately keeps small unused function params for
      // documentation/consistency across similar call signatures, and ignores
      // the bound error in `catch (e) { /* ignore */ }` guards -- only flag
      // genuinely unused local vars/requires.
      'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none' }]
    }
  },
  {
    files: ['sw.js'],
    languageOptions: {
      sourceType: 'script',
      ecmaVersion: 2021,
      globals: globals.serviceworker
    },
    rules: {
      'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none' }]
    }
  },
  {
    files: ['scripts/**/*.js', 'test/**/*.js', 'eslint.config.js'],
    languageOptions: {
      sourceType: 'commonjs',
      ecmaVersion: 2021,
      globals: globals.node
    }
  }
];
