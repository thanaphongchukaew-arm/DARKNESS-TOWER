// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Optional mini-games: a timing gauge (forge, lockpick) and a higher/lower card guess (gambler).
// Every mini-game can be skipped (button / Esc) and the whole feature can be switched off in
// Settings; callers must then fall back to their original, non-interactive behaviour.
(function () {
  var G = window.Game;
  var LS_KEY = 'minigames';
  function X(th, en) { return G.I18n && G.I18n.getLang && G.I18n.getLang() === 'en' ? en : th; }
  function SFX(name) { if (G.Audio && G.Audio.sfx) G.Audio.sfx(name); }
  function icon(name) { return G.Icons ? G.Icons.get(name) : ''; }
  function scene(name) { return '<div class="minigame-scene" aria-hidden="true">' + icon(name) + '</div>'; }
  function cardArt(value) {
    var rank = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'][value];
    var suit = ['Spade', 'Heart', 'Club', 'Diamond'][(value - 1) % 4];
    var color = suit === 'Heart' || suit === 'Diamond' ? 'card-red' : 'card-black';
    return '<span class="card-face ' + color + '"><span class="card-corner">' + rank + icon('cardSuit' + suit) + '</span><span class="card-main"><strong>' + rank + '</strong>' + icon('cardSuit' + suit) + '</span><span class="card-corner card-corner-bottom" aria-hidden="true">' + rank + icon('cardSuit' + suit) + '</span></span>';
  }
  function cardBack() { return '<span class="card-back-pattern" aria-hidden="true"><span>' + icon('cardSuitDiamond') + '</span></span>'; }

  function enabled() {
    try { return G.Save.readMeta()[LS_KEY] !== false; } catch (e) { return true; }
  }
  function setEnabled(on) {
    try { var meta = G.Save.readMeta(); meta[LS_KEY] = !!on; G.Save.writeMeta(meta); } catch (e) { /* storage unavailable */ }
  }

  // ---- Pure helpers (unit-tested) ----
  // A stop counts when the marker sits inside [start, start + width].
  function judge(pos, start, width) { return pos >= start && pos <= start + width; }
  // Card values 1..13. A tie loses, so each side wins (13 - c)/13 or (c - 1)/13 of the time.
  // The payout is scaled to ~92% return and clamped (1.05x to 12x) so no side has a positive expected value.
  function hiLoOdds(card) {
    function side(p) {
      if (p <= 0) return { p: 0, mult: 0, available: false };
      var mult = Math.round(Math.min(12, Math.max(1.05, 0.92 / p)) * 100) / 100;
      return { p: p, mult: mult, available: true };
    }
    return { higher: side((13 - card) / 13), lower: side((card - 1) / 13) };
  }
  // Total gold paid back (stake included) for a winning guess.
  function hiLoPayout(bet, mult) { return Math.round(bet * mult); }

  // ---- Overlay plumbing ----
  var root = null, cleanup = null;
  function open(html) {
    close();
    root = document.createElement('div');
    root.className = 'minigame-overlay';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.innerHTML = '<div class="minigame-box">' + html + '</div>';
    document.body.appendChild(root);
    return root;
  }
  function close() {
    if (cleanup) { var fn = cleanup; cleanup = null; fn(); }
    if (root && root.parentNode) root.parentNode.removeChild(root);
    root = null;
  }
  function active() { return !!root; }

  // opts: { title, hint, stops, need, speed, zone }  ->  cb({ played, skipped, hits, stops, success })
  function timing(opts, cb) {
    var stops = opts.stops || 3, need = opts.need || 2, speed = opts.speed || 1.1, zoneW = opts.zone || 0.2;
    var hits = 0, stop = 0, pos = 0, dir = 1, last = 0, raf = 0, zoneStart = 0, locked = false, done = false;
    var el = open(
      scene(opts.art || 'miniForge') + '<h3>' + opts.title + '</h3><p class="minigame-hint">' + opts.hint + '</p>' +
      '<div class="minigame-gauge" aria-hidden="true"><span class="minigame-zone"></span><span class="minigame-marker"></span></div>' +
      '<div class="minigame-pips" aria-hidden="true"></div>' +
      '<p class="minigame-status" aria-live="polite"></p>' +
      '<div class="minigame-actions"><button class="btn-ghost" data-mg="skip">' + X('ข้าม', 'Skip') + '</button>' +
      '<button class="btn-primary" data-mg="stop">' + X('หยุด!', 'Strike!') + '</button></div>');
    var zone = el.querySelector('.minigame-zone'), marker = el.querySelector('.minigame-marker'), pips = el.querySelector('.minigame-pips'), status = el.querySelector('.minigame-status');
    var results = [];
    function paintPips() { pips.innerHTML = Array.apply(null, Array(stops)).map(function (_, i) { return '<i class="' + (results[i] === undefined ? '' : results[i] ? 'hit' : 'miss') + '"></i>'; }).join(''); }
    function newZone() { zoneStart = 0.08 + Math.random() * (0.84 - zoneW); zone.style.left = (zoneStart * 100) + '%'; zone.style.width = (zoneW * 100) + '%'; }
    function finish(result) {
      if (done) return; done = true;
      document.removeEventListener('keydown', onKey, true);
      cancelAnimationFrame(raf);
      var delay = result.skipped ? 0 : 650;
      setTimeout(function () { close(); cb(result); }, delay);
    }
    function frame(t) {
      if (done) return;
      var dt = last ? Math.min(0.05, (t - last) / 1000) : 0; last = t;
      if (!locked) {
        pos += dir * speed * dt;
        if (pos >= 1) { pos = 1; dir = -1; } else if (pos <= 0) { pos = 0; dir = 1; }
        marker.style.left = (pos * 100) + '%';
      }
      raf = requestAnimationFrame(frame);
    }
    function strike() {
      if (locked || done) return;
      var ok = judge(pos, zoneStart, zoneW); results.push(ok); if (ok) hits++; stop++;
      SFX(ok ? 'item_get' : 'hit_null'); paintPips();
      status.textContent = ok ? X('แม่นยำ!', 'Perfect!') : X('พลาด', 'Missed');
      if (stop >= stops) {
        locked = true;
        var success = hits >= need;
        status.textContent = success ? X('สำเร็จ!', 'Success!') : X('ไม่สำเร็จ', 'Not quite');
        finish({ played: true, skipped: false, hits: hits, stops: stops, success: success });
      } else { locked = true; setTimeout(function () { locked = false; newZone(); }, 380); }
    }
    function skip() { SFX('ui_cancel'); finish({ played: false, skipped: true, hits: 0, stops: stops, success: false }); }
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); skip(); }
      else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); strike(); }
    }
    cleanup = function () { done = true; cancelAnimationFrame(raf); document.removeEventListener('keydown', onKey, true); };
    document.addEventListener('keydown', onKey, true);
    el.querySelector('[data-mg="stop"]').onclick = strike;
    el.querySelector('[data-mg="skip"]').onclick = skip;
    el.querySelector('.minigame-gauge').onclick = strike;
    paintPips(); newZone(); raf = requestAnimationFrame(frame);
    el.querySelector('[data-mg="stop"]').focus();
  }

  // opts: { title, bet }  ->  cb({ played, skipped, won, mult, card, hidden, payout })
  function hiLo(opts, cb) {
    var card = 1 + Math.floor(Math.random() * 13), odds = hiLoOdds(card), done = false;
    function sideBtn(key, label, o) {
      return '<button class="btn-primary" data-mg="' + key + '"' + (o.available ? '' : ' disabled') + '>' + label + (o.available ? ' ×' + o.mult.toFixed(2) : '') + '</button>';
    }
    var el = open(
      scene('miniCards') + '<h3>' + opts.title + '</h3><p class="minigame-hint">' + X('ไพ่ใบถัดไปจะสูงหรือต่ำกว่า? เสมอถือว่าแพ้ ยิ่งเสี่ยงยิ่งได้คูณสูง', 'Will the next card be higher or lower? A tie loses; riskier guesses pay more.') + '</p>' +
      '<div class="minigame-cards"><span class="minigame-card" aria-label="' + card + '">' + cardArt(card) + '</span><span class="minigame-card back" id="mg-hidden" aria-label="' + X('ไพ่คว่ำ', 'Hidden card') + '">' + cardBack() + '</span></div>' +
      '<p class="minigame-status" aria-live="polite">' + X('เดิมพัน ', 'Stake ') + opts.bet + '</p>' +
      '<div class="minigame-actions"><button class="btn-ghost" data-mg="skip">' + X('ข้าม (โยนเหรียญ)', 'Skip (coin flip)') + '</button>' +
      sideBtn('lower', X('ต่ำกว่า', 'Lower'), odds.lower) + sideBtn('higher', X('สูงกว่า', 'Higher'), odds.higher) + '</div>');
    function onKey(e) { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); skip(); } }
    function skip() { if (done) return; done = true; SFX('ui_cancel'); close(); cb({ played: false, skipped: true }); }
    function guess(side) {
      if (done) return; done = true;
      var o = odds[side], hidden = 1 + Math.floor(Math.random() * 13);
      var won = side === 'higher' ? hidden > card : hidden < card;
      el.querySelector('#mg-hidden').innerHTML = cardArt(hidden); el.querySelector('#mg-hidden').classList.remove('back');
      el.querySelector('#mg-hidden').setAttribute('aria-label', String(hidden));
      Array.prototype.forEach.call(el.querySelectorAll('button'), function (b) { b.disabled = true; });
      SFX(won ? 'item_get' : 'hit_null');
      setTimeout(function () { close(); cb({ played: true, skipped: false, won: won, mult: o.mult, card: card, hidden: hidden, payout: won ? hiLoPayout(opts.bet, o.mult) : 0 }); }, 800);
    }
    cleanup = function () { done = true; document.removeEventListener('keydown', onKey, true); };
    document.addEventListener('keydown', onKey, true);
    el.querySelector('[data-mg="skip"]').onclick = skip;
    el.querySelector('[data-mg="lower"]').onclick = function () { guess('lower'); };
    el.querySelector('[data-mg="higher"]').onclick = function () { guess('higher'); };
  }

  G.Minigame = { enabled: enabled, setEnabled: setEnabled, timing: timing, hiLo: hiLo, judge: judge, hiLoOdds: hiLoOdds, hiLoPayout: hiLoPayout, close: close, active: active };
})();
