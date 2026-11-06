// Retro pixel-canvas choreography. No game state or random-number stream is touched here.
(function () {
  var G = window.Game, canvas = null, ctx = null, jobs = [], frame = null, fallback = null;
  var lastTime = 0, serial = 0, generation = 0, failures = 0, gestures = new Set(), spriteCache = {};
  var PI = Math.PI, TAU = PI * 2;
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return 1 - Math.pow(1 - clamp(t, 0, 1), 3); }
  function hash(value) { var h = 2166136261; String(value).split('').forEach(function (c) { h = Math.imul(h ^ c.charCodeAt(0), 16777619); }); return h >>> 0; }
  function noise(seed, index) { var n = Math.imul(seed ^ (index * 374761393), 668265263); n = (n ^ (n >>> 13)) >>> 0; return n / 4294967295; }
  function speed() { return G.SystemsUI ? G.SystemsUI.speed() : 1; }
  function reduced() { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function boot() {
    if (canvas && canvas.isConnected) return !!ctx;
    canvas = document.createElement('canvas'); canvas.id = 'battle-fx-canvas'; canvas.className = 'battle-fx-canvas';
    canvas.setAttribute('aria-hidden', 'true'); document.body.appendChild(canvas);
    ctx = canvas.getContext('2d', { alpha: true });
    return !!ctx;
  }
  function resize() {
    var w = Math.max(1, Math.ceil(window.innerWidth / 2)), h = Math.max(1, Math.ceil(window.innerHeight / 2));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    ctx.imageSmoothingEnabled = false;
  }
  function rect(x, y, w, h, color, alpha) {
    if (w <= 0 || h <= 0 || alpha <= 0) return;
    ctx.globalAlpha = clamp(alpha == null ? 1 : alpha, 0, 1); ctx.fillStyle = color;
    ctx.fillRect(Math.round(x / 2) * 2, Math.round(y / 2) * 2, Math.max(2, Math.round(w / 2) * 2), Math.max(2, Math.round(h / 2) * 2));
  }
  function disc(x, y, radius, color, alpha) {
    radius = Math.max(0, radius); var unit = radius > 45 ? 6 : 4;
    for (var yy = -radius; yy <= radius; yy += unit) {
      var xx = Math.sqrt(Math.max(0, radius * radius - yy * yy));
      rect(x - xx, y + yy, xx * 2, unit, color, alpha);
    }
  }
  function line(x1, y1, x2, y2, color, width, alpha) {
    var distance = Math.hypot(x2 - x1, y2 - y1), steps = Math.max(1, Math.ceil(distance / 4));
    for (var i = 0; i <= steps; i++) rect(lerp(x1, x2, i / steps) - width / 2, lerp(y1, y2, i / steps) - width / 2, width, width, color, alpha);
  }
  function ring(x, y, radius, color, alpha, flatten, count) {
    count = count || 28;
    for (var i = 0; i < count; i++) { var a = TAU * i / count; rect(x + Math.cos(a) * radius - 2, y + Math.sin(a) * radius * (flatten || 1) - 2, 4, 4, color, alpha); }
  }
  function sprite(name, x, y, scale, colors, angle, alpha) {
    var def = spriteCache[name] || G.PixelArt.getDefinition(name); if (!def) return;
    spriteCache[name] = def;
    var grid = def.grid, w = grid[0].length, h = grid.length;
    ctx.save(); ctx.translate(Math.round(x / 2) * 2, Math.round(y / 2) * 2); ctx.rotate(angle || 0); ctx.scale(scale, scale);
    ctx.globalAlpha = clamp(alpha == null ? 1 : alpha, 0, 1);
    var palette = { M: colors[2], C: colors[1], H: colors[0], E: '#1b172a' };
    grid.forEach(function (row, yy) {
      var xx = 0;
      while (xx < row.length) { var key = row[xx], start = xx++; while (xx < row.length && row[xx] === key) xx++;
        if (key !== '.') { ctx.fillStyle = palette[key] || def.palette[key]; ctx.fillRect(start - w / 2, yy - h / 2, xx - start, 1); }
      }
    }); ctx.restore();
  }
  function point(find, breath) {
    var element = typeof find === 'function' ? find() : find;
    if (!element || !element.isConnected) return null;
    var r = element.getBoundingClientRect(); if (!r.width || !r.height) return null;
    return { x: r.left + r.width * 0.5, y: r.top + r.height * (breath ? 0.4 : 0.5), w: r.width, h: r.height, element: element };
  }
  function sparks(x, y, t, colors, seed, amount, size) {
    for (var i = 0; i < amount; i++) {
      var angle = noise(seed, i * 7) * TAU, power = (0.3 + noise(seed, i * 7 + 1)) * size;
      var distance = ease(t) * power;
      rect(x + Math.cos(angle) * distance, y + Math.sin(angle) * distance + t * t * size * 0.3, 2 + noise(seed, i * 7 + 2) * 4, 2 + noise(seed, i * 7 + 3) * 5, colors[i % 3], (1 - t) * 0.95);
    }
  }
  function explosion(x, y, t, colors, seed, size, gentle) {
    if (t < 0 || t > 1) return;
    var r = size * (0.25 + ease(t) * 0.8), fade = 1 - t;
    disc(x, y, r * 0.75, colors[2], fade * (gentle ? 0.12 : 0.3));
    disc(x, y, r * (1 - t) * 0.6, colors[1], fade * 0.7);
    disc(x, y, r * (1 - t) * 0.25, colors[0], fade * 0.8);
    ring(x, y, r, colors[1], fade, gentle ? 0.6 : 0.85);
    sparks(x, y, t, colors, seed, gentle ? 10 : 24, size * 1.6);
  }
  function bolt(x1, y1, x2, y2, t, colors, seed, width) {
    if (t < 0 || t > 1) return;
    var parts = 9, previous = { x: x1, y: y1 };
    for (var i = 1; i <= parts; i++) {
      var q = i / parts, j = Math.sin(q * PI) * (noise(seed, i + Math.floor(t * 7) * 41) - 0.5) * 42;
      var next = { x: lerp(x1, x2, q) + j, y: lerp(y1, y2, q) - j * 0.25 };
      line(previous.x, previous.y, next.x, next.y, colors[2], width + 5, (1 - t) * 0.3);
      line(previous.x, previous.y, next.x, next.y, colors[0], width, (1 - t) * 0.95);
      previous = next;
    }
  }
  function slash(x, y, t, colors, radius, rotation, heavy) {
    if (t < 0 || t > 1) return;
    var start = rotation - PI * 0.7, sweep = Math.min(1, t * 2.3), tail = Math.max(0, sweep - 0.65);
    for (var k = 0; k < 32; k++) {
      var q = k / 31; if (q > sweep || q < tail) continue;
      var a = start + q * PI * 1.35, thickness = Math.sin(q * PI) * (heavy ? 11 : 6) + 2;
      rect(x + Math.cos(a) * radius - thickness / 2, y + Math.sin(a) * radius * 0.65 - thickness / 2, thickness, thickness, colors[1], (1 - t) * 0.95);
      rect(x + Math.cos(a) * (radius - 3), y + Math.sin(a) * (radius - 3) * 0.65, 3, 3, colors[0], 1 - t);
    }
  }
  function plus(x, y, colors, size, alpha) { rect(x - size / 5, y - size, size * 0.4, size * 2, colors[0], alpha); rect(x - size, y - size / 5, size * 2, size * 0.4, colors[1], alpha); }
  function shield(x, y, t, colors, size) {
    var a = Math.sin(t * PI); sprite('fxShield', x, y, size / 10 * (0.85 + t * 0.2), colors, 0, a * 0.85);
    ring(x, y + size * 0.65, size, colors[1], a * 0.8, 0.25);
    for (var i = 0; i < 8; i++) { var angle = i / 8 * TAU + t * 2; rect(x + Math.cos(angle) * size, y + Math.sin(angle) * size, 3, 5, colors[0], a); }
  }
  function healing(x, y, t, colors, seed, size, cleanse) {
    var a = Math.sin(t * PI);
    ring(x, y + size * 0.7, size * (0.55 + t * 0.5), colors[1], a, 0.22);
    for (var i = 0; i < 13; i++) {
      var q = (t * 1.3 + noise(seed, i * 5)) % 1, xx = x + (noise(seed, i * 5 + 1) - 0.5) * size * 1.6, yy = y + size - q * size * 2.5;
      if (i % 4 === 0) plus(xx, yy, colors, 4, a * (1 - q)); else rect(xx, yy, 3, 6, colors[i % 3], a * (1 - q));
    }
    if (cleanse) { ring(x, y, size * ease(t), colors[0], a * 0.8); sprite('fxRune', x, y - size * t * 0.7, size / 22, colors, -t, (1 - t) * a); }
    else plus(x, y - size * 0.3 - t * size * 0.3, colors, size * 0.22, a * 0.8);
  }
  function trajectory(source, target, t, arc) { return { x: lerp(source.x, target.x, t), y: lerp(source.y, target.y, t) - Math.sin(t * PI) * arc }; }
  function projectile(cue, s, d, t, colors, size, seed) {
    var p = cue.profile, travel = clamp(t / p.impact, 0, 1), hit = (t - p.impact) / (1 - p.impact);
    var arc = p.family === 'bomb' ? Math.min(120, Math.hypot(d.x - s.x, d.y - s.y) * 0.2) : p.family === 'fireball' ? 20 : 0;
    var position = trajectory(s, d, travel, arc), angle = Math.atan2(d.y - s.y, d.x - s.x);
    if (t <= p.impact) {
      var count = Math.min(6, p.strikes || 1);
      for (var i = 0; i < count; i++) {
        var q = clamp(travel - i * 0.07, 0, 1), at = trajectory(s, d, q, arc);
        for (var tail = 1; tail <= 5; tail++) {
          var behind = trajectory(s, d, clamp(q - tail * 0.035, 0, 1), arc);
          disc(behind.x, behind.y, (6 - tail) * (p.family === 'fireball' ? 2.5 : 1.4), colors[tail % 3], (1 - tail / 6) * 0.35);
        }
        var icon = p.family === 'fireball' ? 'fxFire' : p.family === 'iceShard' ? 'fxIce' : p.family === 'arrow' ? (p.motif === 'axe' ? 'fxAxe' : p.motif === 'thorn' ? 'fxIce' : 'fxArrow') : p.family === 'bullet' ? 'fxBullet' : p.family === 'bomb' ? 'fxBottle' : p.motif === 'ghost' ? 'fxPuppet' : 'fxOrb';
        sprite(icon, at.x, at.y, p.family === 'bullet' ? 1.8 : p.family === 'arrow' ? 2 : p.family === 'fireball' ? 3.8 : 2.8, colors, p.family === 'bomb' ? travel * 5 : p.family === 'fireball' || p.family === 'iceShard' ? angle + PI / 2 : angle, 1);
      }
      if (p.family === 'fireball') { disc(position.x, position.y, 10, colors[1], .85); disc(position.x - Math.cos(angle) * 2, position.y - Math.sin(angle) * 2, 5, colors[0], .95); }
      if (p.family === 'bullet') explosion(s.x, s.y, Math.min(1, travel * 3), colors, seed, 18);
      if (p.family === 'windBlade') { ring(position.x, position.y, size * 0.5, colors[1], 0.8, 0.35); slash(position.x, position.y, travel % 0.9, colors, size * 0.6, angle, false); }
      if (p.motif === 'clock') sprite('fxClock', position.x, position.y, 2, colors, travel * 4, 0.9);
    }
    if (hit >= 0) {
      explosion(d.x, d.y, hit, colors, seed, size, p.family === 'arrow' || p.family === 'bullet');
      if (p.family === 'iceShard') for (var j = 0; j < 7; j++) { var a = j / 7 * TAU; sprite('fxIce', d.x + Math.cos(a) * size * ease(hit), d.y + Math.sin(a) * size * ease(hit), 1.3 * (1 - hit), colors, a, 1 - hit); }
      if (p.bind) binding(d.x, d.y, hit, colors, size);
    }
  }
  function binding(x, y, t, colors, size) {
    for (var i = 0; i < 3; i++) ring(x, y - size / 2 + i * size / 2, size * (0.7 - t * 0.15), colors[1], Math.sin(t * PI), 0.3, 20);
  }
  function breath(s, d, t, colors, size, seed, impact, element) {
    var progress = clamp(t / impact, 0, 1), dx = d.x - s.x, dy = d.y - s.y, angle = Math.atan2(dy, dx);
    var fade = t > 0.8 ? (1 - t) * 5 : 1;
    for (var i = 0; i < 38; i++) {
      var q = ((i / 38 + t * 0.7) % 1) * progress, wide = (8 + q * size * 0.65) * Math.sin(t * PI);
      var offset = (noise(seed, i * 3 + Math.floor(t * 10)) - 0.5) * wide;
      var x = s.x + dx * q - Math.sin(angle) * offset, y = s.y + dy * q + Math.cos(angle) * offset;
      disc(x, y, 4 + q * 12, colors[i % 3], (0.2 + q * 0.3) * fade);
      if (i % 5 === 0) sprite(element === 'ice' ? 'fxIce' : element === 'wind' ? 'fxOrb' : 'fxFire', x, y, 0.8 + q, colors, angle + PI / 2, 0.7 * fade);
    }
    if (t >= impact) explosion(d.x, d.y, (t - impact) / (1 - impact), colors, seed, size * 1.1);
  }
  function drawItem(cue, d, t, colors, size, seed) {
    var p = cue.profile, q = clamp(t / p.impact, 0, 1), hit = (t - p.impact) / (1 - p.impact);
    var fill = p.itemType === 'healHp' ? G.VFXData.palettes.blood : p.itemType === 'healBoth' ? G.VFXData.palettes.light : colors;
    if (t < p.impact) {
      sprite('fxBottle', d.x + Math.sin(q * PI) * 22, d.y - 32 - Math.sin(q * PI) * 25, 2.5, fill, q * -0.7, 1);
      if (q > 0.55) for (var i = 0; i < 7; i++) { var drop = (q * 3 + i / 7) % 1; rect(d.x + 6 + i % 2 * 3, d.y - 35 + drop * 45, 3, 5, fill[1], q); }
      if (q > 0.3) rect(d.x + (q - 0.3) * 55, d.y - 65 + q * 15, 5, 5, fill[2], 1 - q);
    }
    if (hit >= 0) {
      if (p.selfItem) aura(d.x, d.y, hit, colors, size, seed, p);
      else healing(d.x, d.y, hit, colors, seed, size, p.itemType === 'cleanse');
      if (p.itemType === 'healBoth') { ring(d.x, d.y, size * ease(hit), G.VFXData.palettes.mana[1], 1 - hit); plus(d.x + 10, d.y - size * hit, G.VFXData.palettes.heal, 8, 1 - hit); }
    }
  }
  function aura(x, y, t, colors, size, seed, p) {
    if (p.windup) { ring(x, y, size * (0.2 + t * 0.5), colors[1], Math.sin(t * PI), 0.4, 16); return; }
    ring(x, y + size * 0.7, size * (0.6 + t * 0.3), colors[1], Math.sin(t * PI), 0.24);
    for (var i = 0; i < 7; i++) {
      var q = (t * 1.5 + i / 7) % 1, xx = x + (noise(seed, i * 11) - 0.5) * size * 1.6, yy = y + size - q * size * 2;
      line(xx, yy + 8, xx, yy - 4, colors[1], 3, Math.sin(t * PI) * (1 - q));
      line(xx - 4, yy, xx, yy - 4, colors[0], 2, Math.sin(t * PI)); line(xx + 4, yy, xx, yy - 4, colors[0], 2, Math.sin(t * PI));
    }
    if (p.motif === 'banner') { sprite('propBanner', x, y - size * 0.5, 2, colors, 0, Math.sin(t * PI)); }
    if (p.motif === 'eye') { sprite('fxEye', x, y - size * .4, 2.7, colors, 0, Math.sin(t * PI)); ring(x, y - size * .4, size * .65, colors[0], Math.sin(t * PI), 1, 12); }
    if (p.motif === 'heart' || p.motif === 'spirit' || p.motif === 'leaf' || p.motif === 'axe') sprite(p.motif === 'heart' ? 'fxHeart' : p.motif === 'spirit' ? 'fxSkull' : p.motif === 'axe' ? 'fxAxe' : 'fxPetal', x, y - size * t * .6, 3, colors, Math.sin(t * 3) * .15, Math.sin(t * PI));
    if (p.motif === 'ritual') { sprite('fxRune', x, y, 3, colors, t * 2, Math.sin(t * PI)); }
  }
  function localDamage(cue, s, d, t, colors, size, seed) {
    var p = cue.profile, hit = (t - p.impact) / (1 - p.impact), a = Math.sin(t * PI), strikes = Math.min(7, p.strikes || 1);
    var attack = p.family, rotation = (cue.hitIndex || 0) % 2 ? PI / 2 : 0;
    if (attack === 'slash' || attack === 'cross' || attack === 'cleave' || attack === 'allout') {
      var count = attack === 'cross' ? Math.max(2, strikes) : strikes;
      for (var i = 0; i < count; i++) {
        var q = clamp((t - i * 0.06) / (1 - count * 0.03), 0, 1), angle = rotation + (p.spin ? t * TAU : i * PI / 2 - 0.4);
        slash(d.x, d.y, q, colors, size * (attack === 'cleave' ? 1.3 : 1), angle, attack === 'cleave');
      }
      if (p.motif === 'axe' || p.motif === 'scythe') sprite(p.motif === 'axe' ? 'fxAxe' : 'fxScythe', d.x + Math.cos(t * 4) * size * 0.3, d.y - 8, 3, colors, t * 2 - 1, a);
      if (p.motif === 'shield') sprite('fxShield', d.x - size * (1 - t), d.y, 3, colors, -0.3, a);
      if (p.motif === 'tail') for (var tail = 0; tail < 12; tail++) { var tailAngle = t * PI * 1.7 + tail * 0.08; disc(d.x + Math.cos(tailAngle) * size, d.y + Math.sin(tailAngle) * size * 0.65, 8 - tail * 0.45, colors[tail % 3], a); }
      if (p.motif === 'moon') ring(d.x + 8, d.y - 12, size * 0.75, colors[0], a, 0.8);
    } else if (attack === 'thrust') {
      var q2 = clamp(t / p.impact, 0, 1), dx = d.x - s.x, dy = d.y - s.y, length = Math.hypot(dx, dy) || 1;
      var tip = trajectory({ x: d.x - dx / length * size * 2, y: d.y - dy / length * size * 2 }, d, q2, 0);
      line(tip.x - dx / length * size, tip.y - dy / length * size, tip.x, tip.y, colors[1], 6, a);
      sprite(p.motif === 'beak' ? 'fxBeak' : 'fxArrow', tip.x, tip.y, 2.8, colors, Math.atan2(dy, dx), a);
    } else if (attack === 'claw') {
      for (var claw = 0; claw < 3; claw++) {
        var offset = (claw - 1) * 13, q3 = ease(clamp(t / 0.65, 0, 1));
        line(d.x - size * 0.7 + offset, d.y - size * 0.7, d.x - size * 0.7 + offset + size * q3, d.y - size * 0.7 + size * 1.4 * q3, colors[1], 5, 1 - t);
        line(d.x - size * 0.7 + offset + 3, d.y - size * 0.7, d.x - size * 0.7 + offset + 3 + size * q3, d.y - size * 0.7 + size * 1.4 * q3, colors[0], 2, 1 - t);
      }
    } else if (attack === 'bite') {
      var gap = size * (1 - Math.sin(t * PI));
      sprite('fxFang', d.x, d.y - gap * 0.5 - 4, size / 10, colors, 0, a);
      sprite('fxFang', d.x, d.y + gap * 0.5 + 4, size / 10, colors, PI, a);
    } else if (attack === 'punch') {
      for (var fist = 0; fist < strikes; fist++) {
        var f = clamp((t - fist * 0.07) * 1.5, 0, 1), sign = fist % 2 ? -1 : 1;
        sprite(p.motif === 'hammer' ? 'fxHammer' : 'fxFist', d.x + sign * size * (1 - ease(f)), d.y - size * 0.2 + fist % 3 * 8, 3, colors, sign * -0.25, Math.sin(f * PI));
      }
    }
    if (hit >= 0) explosion(d.x, d.y + (attack === 'punch' ? 12 : 0), hit, colors, seed, size * 0.7, true);
  }
  function environmental(cue, s, d, t, colors, size, seed) {
    var p = cue.profile, hit = (t - p.impact) / (1 - p.impact), a = Math.sin(t * PI), family = p.family;
    if (family === 'lightning') {
      bolt(d.x - 25, Math.max(15, d.y - 180), d.x, d.y, t, colors, seed, 4);
      if (t > p.impact) for (var i = 0; i < 4; i++) bolt(d.x, d.y, d.x + (i - 1.5) * 28, d.y + 20, hit, colors, seed + i, 2);
    } else if (family === 'beam') {
      var vertical = p.fromAbove || p.motif === 'cross';
      var from = vertical ? { x: d.x, y: Math.max(10, d.y - 200) } : s;
      var q = clamp(t / p.impact, 0, 1), end = trajectory(from, d, q, 0);
      line(from.x, from.y, end.x, end.y, colors[2], size * 0.6 * a, a * 0.4);
      line(from.x, from.y, end.x, end.y, colors[1], 12 * a, a * 0.8);
      line(from.x, from.y, end.x, end.y, colors[0], 4, a);
      if (p.motif === 'cross') { line(d.x - size, d.y - 15, d.x + size, d.y - 15, colors[0], 5, a); line(d.x, d.y - size, d.x, d.y + size, colors[1], 5, a); }
    } else if (family === 'storm') {
      for (var rain = 0; rain < 10; rain++) {
        var r = (t * 1.5 + rain / 10) % 1, xx = d.x + (noise(seed, rain * 9) - 0.5) * size * 2.4, yy = d.y - 140 + r * 160;
        if (p.element === 'elec') { if (rain % 3 === Math.floor(t * 8) % 3) bolt(xx, d.y - 140, d.x + (xx - d.x) * 0.5, d.y + 10, r, colors, seed + rain, 2); }
        else if (p.element === 'wind') ring(d.x + Math.sin(r * 6) * 8, d.y - size + r * size * 2, size * (0.3 + r * 0.6), colors[1], a * (1 - r), 0.22);
        else sprite(p.element === 'ice' ? 'fxIce' : p.element === 'fire' ? 'fxFire' : 'fxStar', xx, yy, 1.1 + noise(seed, rain) * 0.7, colors, p.element === 'ice' ? 0.4 : 0, a);
      }
      ring(d.x, d.y + 15, size * (0.5 + t), colors[1], a * 0.65, 0.24);
    } else if (family === 'eruption') {
      ring(d.x, d.y + 28, size * (0.4 + t * 0.6), colors[1], a, 0.2);
      for (var spike = 0; spike < 7; spike++) {
        var progress = clamp((t - spike * 0.035) / p.impact, 0, 1), xx2 = d.x + (spike - 3) * 12;
        var height = size * (0.6 + noise(seed, spike) * 0.7) * progress;
        if (p.element === 'ice') sprite('fxIce', xx2, d.y + 28 - height / 2, 1.5 + height / 45, colors, (spike - 3) * 0.12, a);
        else if (p.element === 'fire') sprite('fxFire', xx2, d.y + 24 - height / 2, 1.6 + height / 50, colors, 0, a);
        else { rect(xx2 - 4, d.y + 28 - height, 8, height, colors[2], a); sprite('fxSkull', xx2, d.y + 24 - height, 1.6, colors, 0, a); }
      }
    } else if (family === 'wave') {
      var wave = trajectory(s, d, clamp(t / p.impact, 0, 1), 0), angle = Math.atan2(d.y - s.y, d.x - s.x);
      for (var band = 0; band < 5; band++) {
        var radius = size * (0.45 + band * 0.12), fade = a * (1 - band / 7);
        for (var k = 0; k < 20; k++) { var theta = angle - PI / 2 + k / 19 * PI; rect(wave.x + Math.cos(theta) * radius, wave.y + Math.sin(theta) * radius, 4, 7, colors[band % 3], fade); }
      }
    } else if (family === 'blast' || family === 'overdrive' || family === 'phase') {
      var charge = clamp(t / p.impact, 0, 1);
      if (t < p.impact) { disc(d.x, d.y, size * charge * 0.6, colors[2], charge * 0.3); ring(d.x, d.y, size * (1.3 - charge), colors[1], charge); sprite('fxStar', d.x, d.y, 1 + charge * 3, colors, t * 4, charge); }
      if (family === 'overdrive') for (var orbit = 0; orbit < 6; orbit++) { var theta2 = orbit / 6 * TAU + t * 5; sprite('fxStar', d.x + Math.cos(theta2) * size, d.y + Math.sin(theta2) * size * 0.65, 1.3, colors, theta2, a); }
    } else if (family === 'cloud') {
      for (var bubble = 0; bubble < 16; bubble++) { var up = (t + bubble / 16) % 1; disc(d.x + (noise(seed, bubble * 4) - 0.5) * size * 1.8, d.y + size * 0.6 - up * size * 1.7, 3 + noise(seed, bubble * 4 + 1) * 8, colors[bubble % 3], a * (1 - up) * 0.65); }
      if (p.motif === 'poison') sprite('fxSkull', d.x, d.y - size * t * 0.5, 2, colors, 0, a);
    }
    if (hit >= 0 && family !== 'cloud') explosion(d.x, d.y, hit, colors, seed, size * (family === 'overdrive' ? 1.4 : 1), family === 'wave' || family === 'phase');
  }
  function mystical(cue, s, d, t, colors, size, seed) {
    var p = cue.profile, hit = (t - p.impact) / (1 - p.impact), a = Math.sin(t * PI);
    if (p.family === 'drain') {
      sprite('fxSkull', d.x, d.y, 3, colors, Math.sin(t * 4) * 0.1, a);
      for (var soul = 0; soul < 12; soul++) { var q = clamp((t - p.impact * 0.4 - soul * 0.02) / (1 - p.impact * 0.4), 0, 1), from = { x: d.x + Math.sin(soul * 2) * 12, y: d.y + Math.cos(soul * 2) * 12 }, at = trajectory(from, s, q, 30); sprite('fxOrb', at.x, at.y, 0.6, colors, 0, a * 0.8); }
    } else if (p.family === 'vine') {
      var growth = clamp(t / p.impact, 0, 1), previous = s;
      for (var vine = 1; vine <= 35; vine++) { var q2 = vine / 35; if (q2 > growth) break; var at2 = trajectory(s, d, q2, 20); at2.x += Math.sin(q2 * 15 + t * 3) * 12; line(previous.x, previous.y, at2.x, at2.y, colors[2], 6, a); line(previous.x, previous.y, at2.x, at2.y, colors[1], 2, a); if (vine % 5 === 0) sprite('fxIce', at2.x + 5, at2.y, 0.7, colors, q2 * 4, a); previous = at2; }
      if (hit >= 0) binding(d.x, d.y, hit, colors, size);
    } else if (p.family === 'curse' || p.family === 'sigil') {
      for (var ringIndex = 0; ringIndex < 2; ringIndex++) ring(d.x, d.y, size * (0.55 + ringIndex * 0.3) * (1.2 - t * 0.35), colors[ringIndex + 1], a, 1, 20);
      var icon = p.motif === 'heart' ? 'fxHeart' : p.motif === 'silence' ? 'fxRune' : p.family === 'curse' ? 'fxEye' : p.negative ? 'fxShield' : 'fxRune';
      sprite(icon, d.x, d.y - 3, 3.2, colors, p.family === 'sigil' ? t * 1.3 : 0, a);
      if (p.negative && hit >= 0) { line(d.x - size / 2, d.y - size / 2, d.x + size / 2, d.y + size / 2, colors[0], 3, a); sparks(d.x, d.y, hit, colors, seed, 12, size); }
      if (p.bind) binding(d.x, d.y, t, colors, size);
    } else if (p.family === 'temporal') {
      sprite('fxClock', d.x, d.y, 4, colors, 0, a);
      var angle = t * TAU * (p.kind === 'buffSelf' ? 2 : -1);
      line(d.x, d.y, d.x + Math.cos(angle) * size * 0.5, d.y + Math.sin(angle) * size * 0.5, colors[0], 3, a);
      line(d.x, d.y, d.x + Math.cos(angle / 2) * size * 0.35, d.y + Math.sin(angle / 2) * size * 0.35, colors[1], 4, a);
      ring(d.x, d.y, size, colors[1], a, 0.8, 12);
      if (hit >= 0 && p.kind !== 'buffSelf') sparks(d.x, d.y, hit, colors, seed, 22, size * 1.4);
    } else if (p.family === 'music' || p.family === 'roar') {
      var self = Math.hypot(s.x - d.x, s.y - d.y) < 8;
      for (var note = 0; note < (p.family === 'music' ? 7 : 4); note++) {
        var q3 = clamp((t - note * 0.035) / p.impact, 0, 1), at3 = self ? { x: d.x + Math.sin(q3 * TAU + note) * size, y: d.y + size / 2 - q3 * size * 2 } : trajectory(s, d, q3, 20 + note * 6);
        if (p.family === 'music') sprite('fxNote', at3.x, at3.y, 1.5, colors, Math.sin(t * 3) * 0.15, a);
        else ring(at3.x, at3.y, size * (0.2 + q3 * 0.8), colors[note % 3], a * 0.7, 0.7);
      }
      if (hit >= 0) ring(d.x, d.y, size * ease(hit), colors[0], 1 - hit);
    } else if (p.family === 'puppet') {
      var top = Math.max(8, d.y - size * 2.4), fall = ease(clamp(t / p.impact, 0, 1));
      for (var string = 0; string < 4; string++) line(d.x + (string - 1.5) * 15, top, d.x + (string - 1.5) * 10, lerp(top + 5, d.y + 18, fall), colors[1], 2, a * 0.85);
      sprite('fxPuppet', d.x, lerp(top + 5, d.y, fall), 3, colors, Math.sin(t * 8) * 0.2, a);
      if (p.motif === 'curtain') { rect(d.x - size * 1.2, d.y - size * 1.2, size * ease(t), size * 2.2, colors[2], a * .7); rect(d.x + size * 1.2 - size * ease(t), d.y - size * 1.2, size * ease(t), size * 2.2, colors[2], a * .7); }
      if (hit >= 0) { slash(d.x, d.y, hit, colors, size, 0.6, false); if (/sever|curtain/.test(p.key || '')) slash(d.x, top + 20, hit, colors, size * 0.8, 0, false); }
    } else if (p.family === 'petals') {
      for (var petal = 0; petal < 22; petal++) { var angle2 = noise(seed, petal * 3) * TAU + t * 6, rr = size * (0.3 + noise(seed, petal * 3 + 1)) * (1.2 - t * 0.6); sprite('fxPetal', d.x + Math.cos(angle2) * rr, d.y + Math.sin(angle2) * rr, 0.5 + noise(seed, petal) * 0.5, colors, angle2, a); }
      for (var cut = 0; cut < 3; cut++) slash(d.x, d.y, clamp((t - cut * 0.09) * 1.2, 0, 1), colors, size, cut * PI / 3, false);
    } else if (p.family === 'swarm') {
      for (var animal = 0; animal < 6; animal++) { var run = clamp((t - animal * 0.045) / p.impact, 0, 1), at4 = trajectory(s, d, run, 5 + animal * 3); sprite(p.motif === 'beast' ? 'fxBeast' : 'fxScarab', at4.x + (animal % 2) * 10, at4.y + (animal - 3) * 9, 1.5, colors, p.motif === 'beast' ? 0 : run * TAU, a); }
      if (hit >= 0) explosion(d.x, d.y, hit, colors, seed, size * 0.8, true);
    }
  }
  function drawCue(cue, elapsed, isReduced) {
    var p = cue.profile, t = clamp(elapsed / (isReduced ? Math.min(220, p.duration) : p.duration), 0, 1);
    var d = point(cue.target), s = point(cue.source, p.family === 'breath') || d;
    if (!d || !s) return;
    var colors = G.VFXData.palettes[p.palette] || G.VFXData.palettes[p.element] || G.VFXData.palettes.phys;
    var size = clamp(Math.max(d.w, d.h) * 0.45, 28, 65) * (p.scale || 1), seed = hash(cue.seed);
    if (isReduced) { ring(d.x, d.y, size * 0.65, colors[1], Math.sin(t * PI) * 0.65, 0.8, 18); return; }
    if (p.kind === 'item' || p.selfItem) drawItem(cue, d, t, colors, size, seed);
    else if (['slash','cross','cleave','thrust','claw','bite','punch','allout'].indexOf(p.family) !== -1) localDamage(cue, s, d, t, colors, size, seed);
    else if (['fireball','iceShard','arrow','bullet','magicBolt','windBlade','bomb'].indexOf(p.family) !== -1) projectile(cue, s, d, t, colors, size, seed);
    else if (p.family === 'breath') breath(s, d, t, colors, size, seed, p.impact, p.element);
    else if (p.family === 'heal' || p.family === 'cleanse') healing(d.x, d.y, t, colors, seed, size, p.family === 'cleanse');
    else if (p.family === 'shield') { shield(d.x, d.y, t, colors, size); if (p.motif === 'wings') { sprite('fxWing', d.x - size * .75, d.y, 3, colors, -.2, Math.sin(t * PI)); sprite('fxWing', d.x + size * .75, d.y, 3, colors, PI + .2, Math.sin(t * PI)); } if (p.motif === 'veil') disc(d.x, d.y, size * .75, colors[2], Math.sin(t * PI) * .3); }
    else if (p.family === 'empower' || p.family === 'haste') { aura(d.x, d.y, t, colors, size, seed, p); if (p.family === 'haste') for (var i = 0; i < 3; i++) sprite('fxArrow', d.x - size + t * size * 2, d.y - size / 2 + i * 12, 1, colors, 0, Math.sin(t * PI)); }
    else if (['lightning','beam','storm','eruption','wave','blast','overdrive','phase','cloud'].indexOf(p.family) !== -1) environmental(cue, s, d, t, colors, size, seed);
    else mystical(cue, s, d, t, colors, size, seed);
    if (p.drain && p.family !== 'drain' && t > p.impact) { var back = (t - p.impact) / (1 - p.impact); for (var orb = 0; orb < 5; orb++) { var soul = trajectory(d, s, clamp(back - orb * 0.04, 0, 1), 20); sprite('fxOrb', soul.x, soul.y, .65, G.VFXData.palettes.blood, 0, 1 - back); } }
    if (p.motif === 'cross' && p.family !== 'beam') { var fade = Math.sin(t * PI); line(d.x - size / 2, d.y - size / 4, d.x + size / 2, d.y - size / 4, colors[0], 4, fade); line(d.x, d.y - size, d.x, d.y + size * .4, colors[1], 4, fade); }
    if (cue.ailments && t > p.impact) cue.ailments.forEach(function (id, index) { sprite(id === 'poison' ? 'fxSkull' : id === 'burn' ? 'fxFire' : 'fxRune', d.x + (index - 1) * 14, d.y - size - (t - p.impact) * 25, 1.3, G.VFXData.palettes[id === 'poison' ? 'poison' : id === 'burn' ? 'fire' : 'dark'], 0, 1 - t); });
  }
  function gesture(cue, duration) {
    if (reduced() || cue.profile.windup || cue.profile.kind === 'item') return;
    var source = point(cue.source), target = point(cue.target); if (!source || !target || source.element === target.element || !source.element.animate) return;
    if (source.element.closest('#battle-player-panel')) return; // HeroArt owns player poses.
    var physical = cue.profile.motion === 'dive' || ['slash','cross','cleave','claw','bite','punch','thrust'].indexOf(cue.profile.family) !== -1;
    var dx = physical ? clamp((target.x - source.x) * 0.08, -14, 14) : 0, dy = physical ? clamp((target.y - source.y) * 0.08, -10, 10) : -4;
    var animation = source.element.animate([{ translate: '0px 0px' }, { translate: dx + 'px ' + dy + 'px', offset: 0.4 }, { translate: '0px 0px' }], { duration: duration / speed(), easing: 'steps(5)' });
    gestures.add(animation); animation.finished.then(function () { gestures.delete(animation); }, function () { gestures.delete(animation); });
  }
  function stopFrame() { if (frame !== null) cancelAnimationFrame(frame); if (fallback !== null) clearTimeout(fallback); frame = null; fallback = null; }
  function schedule() { stopFrame(); frame = requestAnimationFrame(tick); fallback = setTimeout(function () { tick(performance.now()); }, 100); }
  function finish(job, cancelled) {
    if (job.done) return; job.done = true;
    if (!cancelled && !job.hit) { job.hit = true; job.impact(); }
    job.resolve({ cancelled: cancelled });
  }
  function tick(now) {
    stopFrame(); var dt = Math.max(0, now - lastTime); lastTime = now;
    if (!ctx) return;
    resize(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.setTransform(0.5, 0, 0, 0.5, 0, 0);
    jobs.slice().forEach(function (job) {
      if (job.done) return;
      job.elapsed = document.hidden ? job.duration : Math.min(job.duration, job.elapsed + dt * speed());
      try {
        job.cues.forEach(function (cue) { drawCue(cue, job.elapsed, job.reduced); });
        if (!job.hit && job.elapsed >= job.hitAt) { job.hit = true; if (G.Audio && G.Audio.battleEffect && !job.cues[0].profile.windup) G.Audio.battleEffect(job.cues[0].profile, 'impact'); job.impact(); }
        if (job.elapsed >= job.duration) finish(job, false);
      } catch (error) { failures++; console.warn('[BattleFX] presentation failed:', error); finish(job, false); }
    });
    jobs = jobs.filter(function (job) { return !job.done; });
    ctx.globalAlpha = 1;
    if (jobs.length) schedule(); else { canvas.classList.remove('is-active'); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); }
  }
  function play(cues, impact) {
    if (!cues.length || !boot()) { impact(); return Promise.resolve({ cancelled: false }); }
    var isReduced = reduced(), duration = Math.max.apply(null, cues.map(function (cue) { return isReduced ? Math.min(220, cue.profile.duration) : cue.profile.duration; }));
    var hitAt = Math.max.apply(null, cues.map(function (cue) { return (isReduced ? Math.min(220, cue.profile.duration) : cue.profile.duration) * cue.profile.impact; }));
    var epoch = generation;
    return new Promise(function (resolve) {
      if (epoch !== generation) { resolve({ cancelled: true }); return; }
      if (jobs.length >= 12) finish(jobs.shift(), false);
      var job = { id: ++serial, cues: cues.slice(0, 8), elapsed: 0, duration: duration, hitAt: hitAt, hit: false, done: false, reduced: isReduced, impact: impact, resolve: resolve };
      jobs.push(job); canvas.classList.add('is-active');
      if (G.Audio && G.Audio.battleEffect && !cues[0].profile.windup) G.Audio.battleEffect(cues[0].profile, 'launch');
      cues.forEach(function (cue) { gesture(cue, duration); });
      if (frame === null && fallback === null) { lastTime = performance.now(); schedule(); }
    });
  }
  function cancel() {
    generation++; stopFrame(); jobs.slice().forEach(function (job) { finish(job, true); }); jobs = [];
    gestures.forEach(function (animation) { animation.cancel(); }); gestures.clear();
    if (ctx && canvas) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); canvas.classList.remove('is-active'); }
  }
  G.PixelFX = { play: play, cancel: cancel, diagnostics: function () { return { jobs: jobs.length, gestures: gestures.size, failures: failures, framePending: frame !== null || fallback !== null }; } };
})();
