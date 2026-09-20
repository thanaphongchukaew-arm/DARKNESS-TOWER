// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Exercises the real js/audio.js against a fake Web Audio API so the
// step-sequencer tracks (menu/battle/boss + the battle-track rotation) are
// proven to actually schedule sound, and playBattleMusic()'s random-pick
// logic is proven never to repeat or to skip the boss track.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const AUDIO_SRC = path.join(__dirname, '..', 'js', 'audio.js');

function makeLocalStorageStub() {
  const store = new Map();
  return {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k)
  };
}

// Loads js/audio.js against a fake AudioContext whose node creation calls are
// all recorded, and a manually-driven setTimeout queue so the lookahead
// scheduler can be advanced deterministically instead of waiting on real time.
function loadAudio() {
  const events = [];
  const pending = [];
  const fakeCtx = {
    currentTime: 0,
    state: 'running',
    sampleRate: 44100,
    resume() {},
    destination: {},
    createGain() {
      return { gain: { value: 1, setValueAtTime() {}, exponentialRampToValueAtTime() {}, setTargetAtTime() {} }, connect() {} };
    },
    createOscillator() {
      const node = {
        type: 'square',
        frequency: {
          setValueAtTime(v) { events.push({ kind: 'tone', freq: v }); },
          exponentialRampToValueAtTime() {}
        },
        connect() {}, start() {}, stop() {}
      };
      return node;
    },
    createBufferSource() {
      events.push({ kind: 'noise' });
      return { buffer: null, connect() {}, start() {}, stop() {} };
    },
    createBuffer(channels, size) {
      return { getChannelData: () => new Float32Array(size) };
    },
    createBiquadFilter() {
      return { type: 'bandpass', frequency: { value: 0 }, connect() {} };
    }
  };

  const sandbox = {
    window: { AudioContext: function () { return fakeCtx; } },
    localStorage: makeLocalStorageStub(),
    console,
    setTimeout(fn) { pending.push(fn); return pending.length; },
    clearTimeout() {}
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(AUDIO_SRC, 'utf8'), sandbox, { filename: 'js/audio.js' });

  return {
    Audio: sandbox.window.Game.Audio,
    events,
    // Advances the fake clock and drains whatever the scheduler queued, `steps`
    // times -- enough ticks covers a full loop of even the longest (32-step) track.
    advance(steps) {
      for (let i = 0; i < steps; i++) {
        fakeCtx.currentTime += 0.05;
        const fn = pending.shift();
        if (fn) fn();
      }
    }
  };
}

const BATTLE_TRACKS = [
  'battle', 'ashfallCharge', 'widowsMarch', 'crimsonOath', 'thornVeil', 'sableHollow',
  'blackReliquary', 'wolfsgate', 'graniteOath', 'huntersDrift', 'brassHorizon', 'copperRevolt',
  'goldenSkirmish', 'hollowSigil', 'brokenCompass', 'gildedSpire', 'auroraBreach', 'skylanceVow',
  'ironVerdict', 'daybreakSiege', 'valorousRush'
];

test('every battle-rotation track (plus menu/boss) actually schedules audio and never a bad frequency', () => {
  for (const name of BATTLE_TRACKS.concat(['menu', 'boss'])) {
    const { Audio, events, advance } = loadAudio();
    Audio.playMusic(name);
    advance(60);
    assert.ok(events.length > 0, `track "${name}" produced no audio events -- likely missing from TRACKS`);
    for (const e of events) {
      if (e.kind === 'tone') {
        assert.ok(Number.isFinite(e.freq) && e.freq > 0, `track "${name}" scheduled a non-finite frequency (${e.freq})`);
      }
    }
  }
});

test('playBattleMusic(false) always picks a known battle track and never repeats the previous pick', () => {
  const { Audio } = loadAudio();
  let prev = null;
  const seen = new Set();
  for (let i = 0; i < 300; i++) {
    Audio.playBattleMusic(false);
    const pick = Audio.getActiveTrack();
    assert.ok(BATTLE_TRACKS.includes(pick), `pick "${pick}" must come from the known battle-track pool`);
    assert.notEqual(pick, prev, 'must not repeat the immediately-previous track');
    seen.add(pick);
    prev = pick;
  }
  assert.equal(seen.size, BATTLE_TRACKS.length, 'every track in the pool should get picked over enough draws');
});

test('playBattleMusic(true) always plays the boss track', () => {
  const { Audio, events, advance } = loadAudio();
  Audio.playBattleMusic(true);
  assert.equal(Audio.getActiveTrack(), 'boss');
  advance(40);
  assert.ok(events.length > 0, 'boss music produced no audio events');
});

test('BATTLE_TRACKS has no duplicate ids', () => {
  assert.equal(new Set(BATTLE_TRACKS).size, BATTLE_TRACKS.length);
});
