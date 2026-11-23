// Sound-effect references. A typo in SFX('item_gat') fails silently in the shipped game, so check that
// (1) every sound name the code can play is actually defined, (2) every defined sound can be played
// against a (fake) Web Audio API without throwing or producing a bad frequency/duration.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const JS_DIR = path.join(__dirname, '..', 'js');
const files = fs.readdirSync(JS_DIR).filter((f) => f.endsWith('.js'));
const audioSrc = fs.readFileSync(path.join(JS_DIR, 'audio.js'), 'utf8');

// ---- names the code can ask for -----------------------------------------------------------------
const used = new Map();           // name -> first file
for (const f of files) {
  if (f === 'audio.js') continue;
  const src = fs.readFileSync(path.join(JS_DIR, f), 'utf8');
  for (const m of src.matchAll(/(?:\bSFX|\.sfx)\(([^;\n]*?)\)/g)) {
    for (const q of m[1].matchAll(/['"]([a-z][a-z0-9_]*)['"]/g)) if (!used.has(q[1])) used.set(q[1], f);
  }
}

// ---- names audio.js defines ---------------------------------------------------------------------
const block = audioSrc.slice(audioSrc.indexOf('var SFX = {'));
const defined = new Set([...block.slice(0, block.indexOf('\n  };')).matchAll(/^\s{4}([a-z][a-z0-9_]*):\s*function/gm)].map((m) => m[1]));

test('the SFX table was parsed (guards against a refactor silently emptying this test)', () => {
  assert.ok(defined.size >= 20, 'only ' + defined.size + ' sounds found in audio.js');
  assert.ok(used.size >= 15, 'only ' + used.size + ' sound references found in the code');
});

test('every sound name used by the game is defined in audio.js', () => {
  const missing = [...used.entries()].filter(([n]) => !defined.has(n) && !/^(battle|menu|boss)/.test(n)).map(([n, f]) => n + ' (used in ' + f + ')');
  assert.deepEqual(missing, [], 'undefined sound effects (these fail silently in the game): ' + missing.join(', '));
});

// ---- play every defined sound against a recording fake of the Web Audio API --------------------
function fakeAudioContext(log) {
  const param = () => ({ value: 0, setValueAtTime(v, t) { log.push(['param', v, t]); }, linearRampToValueAtTime(v, t) { log.push(['param', v, t]); }, exponentialRampToValueAtTime(v, t) { log.push(['param', v, t]); }, setTargetAtTime() {}, cancelScheduledValues() {} });
  const node = () => ({ connect() {}, disconnect() {}, gain: param(), frequency: param(), Q: param(), detune: param(), type: '', start(t) { log.push(['start', t]); }, stop(t) { log.push(['stop', t]); } });
  return class {
    constructor() { this.currentTime = 1; this.sampleRate = 44100; this.destination = node(); this.state = 'running'; }
    createGain() { return node(); } createOscillator() { return node(); } createBiquadFilter() { return node(); }
    createBufferSource() { return node(); } createDynamicsCompressor() { return node(); } createStereoPanner() { return node(); }
    createBuffer(ch, len) { return { getChannelData() { return new Float32Array(Math.max(0, Math.min(len | 0, 441000))); } }; }
    resume() { return Promise.resolve(); }
  };
}

test('every defined sound plays without throwing and schedules sane values', () => {
  const log = [];
  const sandbox = { window: {}, localStorage: { getItem: () => null, setItem() {}, removeItem() {} }, console, setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {}, Math };
  sandbox.window.AudioContext = fakeAudioContext(log);
  vm.createContext(sandbox);
  vm.runInContext(audioSrc, sandbox, { filename: 'js/audio.js' });
  const audio = sandbox.window.Game.Audio;
  const failures = [];
  for (const name of defined) {
    log.length = 0;
    try { audio.sfx(name); } catch (e) { failures.push(name + ' threw: ' + e.message); continue; }
    for (const [kind, a, b] of log) {
      if (kind === 'param' && !(Number.isFinite(a) && Number.isFinite(b))) failures.push(name + ': non-finite audio parameter (' + a + ', ' + b + ')');
      if ((kind === 'start' || kind === 'stop') && !Number.isFinite(a)) failures.push(name + ': non-finite ' + kind + ' time');
    }
  }
  assert.deepEqual(failures, [], failures.join('\n'));
});

test('playing an unknown sound name is a harmless no-op (a typo must never crash a battle)', () => {
  const sandbox = { window: {}, localStorage: { getItem: () => null, setItem() {}, removeItem() {} }, console, setTimeout: () => 0, clearTimeout() {}, Math };
  sandbox.window.AudioContext = fakeAudioContext([]);
  vm.createContext(sandbox);
  vm.runInContext(audioSrc, sandbox, { filename: 'js/audio.js' });
  assert.doesNotThrow(() => sandbox.window.Game.Audio.sfx('definitely_not_a_sound'));
  assert.doesNotThrow(() => sandbox.window.Game.Audio.sfx(undefined));
});
