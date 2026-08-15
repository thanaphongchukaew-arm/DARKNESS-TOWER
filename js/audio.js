// Chiptune audio engine: synthesized SFX + looping background tracks via Web Audio API.
// No external audio files -- everything is oscillators/noise generated at runtime.
(function () {
  var MUTE_KEY = 'towerRPG_muted_v1';
  var MUSIC_VOL_KEY = 'towerRPG_musicVol_v1';
  var MUSIC_MAX_GAIN = 0.5;

  var ctx = null;
  var masterGain, sfxGain, musicGain;
  var muted = false;
  try { muted = localStorage.getItem(MUTE_KEY) === '1'; } catch (e) { /* ignore */ }

  var musicVolume = 60; // percent, 0-100
  try {
    var storedVol = localStorage.getItem(MUSIC_VOL_KEY);
    if (storedVol != null) musicVolume = Math.max(0, Math.min(100, parseInt(storedVol, 10)));
  } catch (e) { /* ignore */ }

  var NOTES = {
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
    C6: 1046.50, D6: 1174.66, E6: 1318.51, G6: 1567.98
  };

  function ensureCtx() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.5;
      masterGain.connect(ctx.destination);
      sfxGain = ctx.createGain();
      sfxGain.gain.value = 0.9;
      sfxGain.connect(masterGain);
      musicGain = ctx.createGain();
      musicGain.gain.value = (musicVolume / 100) * MUSIC_MAX_GAIN;
      musicGain.connect(masterGain);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function noiseBuffer(c, duration) {
    var size = Math.max(1, Math.floor(c.sampleRate * duration));
    var buffer = c.createBuffer(1, size, c.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  function tone(freq, startTime, duration, opts) {
    var c = ensureCtx();
    if (!c || !freq) return;
    opts = opts || {};
    var osc = c.createOscillator();
    osc.type = opts.type || 'square';
    osc.frequency.setValueAtTime(freq, startTime);
    if (opts.slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, opts.slideTo), startTime + duration);
    var g = c.createGain();
    var peak = opts.gain != null ? opts.gain : 0.22;
    var attack = opts.attack != null ? opts.attack : 0.004;
    var release = opts.release != null ? opts.release : duration * 0.5;
    g.gain.setValueAtTime(0.0001, startTime);
    g.gain.exponentialRampToValueAtTime(peak, startTime + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + release);
    osc.connect(g);
    g.connect(opts.bus || sfxGain);
    osc.start(startTime);
    osc.stop(startTime + duration + release + 0.02);
  }

  function noise(startTime, duration, opts) {
    var c = ensureCtx();
    if (!c) return;
    opts = opts || {};
    var src = c.createBufferSource();
    src.buffer = noiseBuffer(c, duration);
    var filter = c.createBiquadFilter();
    filter.type = opts.filterType || 'bandpass';
    filter.frequency.value = opts.filterFreq || 1200;
    var g = c.createGain();
    var peak = opts.gain != null ? opts.gain : 0.28;
    g.gain.setValueAtTime(0.0001, startTime);
    g.gain.exponentialRampToValueAtTime(peak, startTime + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    src.connect(filter);
    filter.connect(g);
    g.connect(opts.bus || sfxGain);
    src.start(startTime);
    src.stop(startTime + duration + 0.02);
  }

  function playSeq(notes, opts) {
    if (muted) return;
    var c = ensureCtx();
    if (!c) return;
    var t = c.currentTime + 0.001;
    notes.forEach(function (n) {
      tone(n[0], t, n[1], opts);
      t += n[1] + (n[2] != null ? n[2] : 0.01);
    });
  }

  var SFX = {
    ui_confirm: function () { playSeq([[NOTES.C5, 0.05, 0.02], [NOTES.E5, 0.07, 0]], { type: 'square', gain: 0.2 }); },
    ui_back: function () { playSeq([[NOTES.E4, 0.05, 0.02], [NOTES.C4, 0.06, 0]], { type: 'square', gain: 0.18 }); },
    ui_cancel: function () { if (muted) return; tone(NOTES.A3, ensureCtx().currentTime, 0.06, { type: 'square', gain: 0.15 }); },
    ui_error: function () { if (muted) return; tone(110, ensureCtx().currentTime, 0.12, { type: 'square', gain: 0.18 }); },
    floor_select: function () { playSeq([[NOTES.G4, 0.04, 0.015], [NOTES.C5, 0.06, 0]], { type: 'triangle', gain: 0.22 }); },
    item_get: function () { playSeq([[NOTES.C5, 0.04, 0.01], [NOTES.E5, 0.04, 0.01], [NOTES.G5, 0.08, 0]], { type: 'square', gain: 0.2 }); },
    attack: function () { if (muted) return; var t = ensureCtx().currentTime; tone(150, t, 0.05, { type: 'square', gain: 0.22, slideTo: 60 }); noise(t, 0.05, { gain: 0.15, filterFreq: 2000 }); },
    hit_crit: function () { playSeq([[NOTES.C5, 0.03, 0.005], [NOTES.E5, 0.03, 0.005], [NOTES.G5, 0.03, 0.005], [NOTES.C6, 0.12, 0]], { type: 'square', gain: 0.26 }); },
    hit_null: function () { if (muted) return; tone(220, ensureCtx().currentTime, 0.08, { type: 'triangle', gain: 0.15 }); },
    downed: function () { if (muted) return; var t = ensureCtx().currentTime; tone(NOTES.A4, t, 0.15, { type: 'square', gain: 0.2, slideTo: NOTES.A3 }); },
    defeated: function () { if (muted) return; var t = ensureCtx().currentTime; noise(t, 0.25, { gain: 0.26, filterType: 'lowpass', filterFreq: 900 }); tone(NOTES.A3, t, 0.2, { type: 'square', gain: 0.16, slideTo: 55 }); },
    heal: function () { playSeq([[NOTES.C5, 0.06, 0.02], [NOTES.E5, 0.06, 0.02], [NOTES.G5, 0.1, 0]], { type: 'triangle', gain: 0.22 }); },
    guard: function () { if (muted) return; tone(80, ensureCtx().currentTime, 0.12, { type: 'triangle', gain: 0.25 }); },
    item_use: function () { playSeq([[NOTES.G4, 0.04, 0.01], [NOTES.C5, 0.06, 0]], { type: 'triangle', gain: 0.2 }); },
    skill_cast: function () { playSeq([[NOTES.E4, 0.03, 0.005], [NOTES.A4, 0.03, 0.005], [NOTES.E5, 0.08, 0]], { type: 'square', gain: 0.22 }); },
    player_hit: function () { if (muted) return; var t = ensureCtx().currentTime; tone(140, t, 0.09, { type: 'square', gain: 0.24, slideTo: 50 }); noise(t, 0.08, { gain: 0.2, filterFreq: 900 }); },
    allout_ready: function () { playSeq([[NOTES.C5, 0.06, 0.01], [NOTES.D5, 0.06, 0.01], [NOTES.E5, 0.06, 0.01], [NOTES.G5, 0.06, 0.01], [NOTES.C6, 0.16, 0]], { type: 'square', gain: 0.24 }); },
    allout_start: function () { playSeq([[NOTES.C4, 0.04, 0], [NOTES.C5, 0.04, 0], [NOTES.E5, 0.04, 0], [NOTES.G5, 0.04, 0], [NOTES.C6, 0.2, 0]], { type: 'square', gain: 0.28 }); },
    boss_phase: function () { playSeq([[NOTES.C3, 0.1, 0.02], [NOTES.C3, 0.1, 0.02], [NOTES.G3, 0.2, 0]], { type: 'square', gain: 0.26 }); },
    level_up: function () { playSeq([[NOTES.C5, 0.06, 0.01], [NOTES.E5, 0.06, 0.01], [NOTES.G5, 0.06, 0.01], [NOTES.C6, 0.06, 0.01], [NOTES.E6, 0.2, 0]], { type: 'square', gain: 0.26 }); },
    victory: function () { playSeq([[NOTES.C5, 0.09, 0.02], [NOTES.E5, 0.09, 0.02], [NOTES.G5, 0.09, 0.02], [NOTES.C6, 0.09, 0.02], [NOTES.G5, 0.09, 0.02], [NOTES.C6, 0.3, 0]], { type: 'square', gain: 0.26 }); },
    defeat: function () { playSeq([[NOTES.C4, 0.16, 0.03], [NOTES.B3, 0.16, 0.03], [NOTES.A3, 0.16, 0.03], [NOTES.G3, 0.4, 0]], { type: 'triangle', gain: 0.22 }); }
  };

  // ---- Background music: lookahead step-sequencer ----
  var TRACKS = {
    menu: {
      step: 0.22,
      lead: ['E4', null, 'G4', 'A4', null, 'G4', 'E4', null, 'C4', null, 'E4', 'G4', null, 'A4', 'G4', 'E4'],
      bass: ['A3', null, null, null, 'F3', null, null, null, 'C3', null, null, null, 'G3', null, null, null]
    },
    battle: {
      step: 0.14,
      lead: ['E4', 'E4', 'G4', 'E4', 'D4', 'D4', 'F4', 'D4', 'C4', 'C4', 'E4', 'C4', 'B3', 'B3', 'D4', 'B3'],
      bass: ['A3', null, 'A3', null, 'F3', null, 'F3', null, 'C3', null, 'C3', null, 'G3', null, 'G3', null]
    }
  };

  var lookahead = 25; // ms
  var scheduleAheadTime = 0.1; // s
  var schedulerTimer = null;
  var activeTrackName = null; // currently playing
  var desiredTrackName = null; // what should be playing once unmuted
  var stepIndex = 0;
  var nextStepTime = 0;

  function scheduleStep(track, time) {
    var lead = track.lead[stepIndex % track.lead.length];
    var bass = track.bass[stepIndex % track.bass.length];
    if (lead) tone(NOTES[lead], time, track.step * 0.85, { type: 'square', gain: 0.08, bus: musicGain, attack: 0.005, release: 0.02 });
    if (bass) tone(NOTES[bass] / 2, time, track.step * 0.9, { type: 'triangle', gain: 0.13, bus: musicGain, attack: 0.005, release: 0.03 });
  }

  function schedulerLoop() {
    var track = TRACKS[activeTrackName];
    if (!track) return;
    var c = ensureCtx();
    if (!c) return;
    while (nextStepTime < c.currentTime + scheduleAheadTime) {
      scheduleStep(track, nextStepTime);
      nextStepTime += track.step;
      stepIndex++;
    }
    schedulerTimer = setTimeout(schedulerLoop, lookahead);
  }

  function stopMusic() {
    activeTrackName = null;
    if (schedulerTimer) { clearTimeout(schedulerTimer); schedulerTimer = null; }
  }

  function startMusic(name) {
    stopMusic();
    if (!name || muted) return;
    var c = ensureCtx();
    if (!c) return;
    activeTrackName = name;
    stepIndex = 0;
    nextStepTime = c.currentTime + 0.05;
    schedulerLoop();
  }

  function playMusic(name) {
    desiredTrackName = name;
    if (activeTrackName !== name) startMusic(name);
  }

  function setMuted(val) {
    muted = !!val;
    try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch (e) { /* ignore */ }
    if (muted) stopMusic();
    else if (desiredTrackName) startMusic(desiredTrackName);
  }

  function toggleMute() {
    setMuted(!muted);
    return muted;
  }

  function setMusicVolume(percent) {
    musicVolume = Math.max(0, Math.min(100, percent));
    try { localStorage.setItem(MUSIC_VOL_KEY, String(musicVolume)); } catch (e) { /* ignore */ }
    var target = (musicVolume / 100) * MUSIC_MAX_GAIN;
    if (musicGain) {
      var c = ensureCtx();
      if (c) musicGain.gain.setTargetAtTime(target, c.currentTime, 0.01);
      else musicGain.gain.value = target;
    }
  }

  function sfx(name) {
    if (muted) return;
    var fn = SFX[name];
    if (fn) fn();
  }

  window.Game = window.Game || {};
  window.Game.Audio = {
    sfx: sfx,
    playMusic: playMusic,
    stopMusic: function () { desiredTrackName = null; stopMusic(); },
    toggleMute: toggleMute,
    isMuted: function () { return muted; },
    setMusicVolume: setMusicVolume,
    getMusicVolume: function () { return musicVolume; },
    unlock: ensureCtx
  };
})();
