// Presentation planning: stable event IDs, simultaneous AoE, impact-before-feedback.
(function () {
  var G = window.Game;
  function V() { return G.VFXData; }
  function special(family, palette, extras) { return V().make(family, { element: palette || 'phys' }, extras); }
  function profile(ev, battle) {
    var p, skill;
    if (ev.type === 'hit') {
      if (ev.vfxKey) {
        if (V().attacks[ev.vfxKey]) return V().attacks[ev.vfxKey];
        var id = ev.attackerTemplateId || '';
        var fallback = /wolf|hound|dragon|wyrm|serpent|bat|spider|lynx|hydra/.test(id) ? 'bite' : /golem|sentinel|automaton|titan/.test(id) ? 'punch' : /wraith|sprite|wisp|cherub|seraph/.test(id) ? 'wave' : 'slash';
        return special(fallback, 'phys', { key: 'disrupted' });
      }
      if (ev.skillId === 'overdrive') return special('overdrive', 'almighty', { key: 'overdrive', scale: 1.35 });
      p = V().skill(ev.skillId || 'attack', ev.sourceClassId || battle.run.classId);
      skill = G.Data.getSkill(ev.skillId);
      if (skill && skill.randomElement) return Object.assign({}, p, { element: ev.element, palette: ev.element });
      return p;
    }
    if (ev.type === 'buff') {
      skill = G.Data.getSkill(ev.skillId);
      if (skill && skill.kind !== 'attack') return V().skill(skill.id, battle.run.classId);
      return special(ev.amount > 0 ? 'empower' : 'sigil', ev.amount > 0 ? 'light' : 'dark', { duration: 500, stat: ev.stat, negative: ev.amount < 0 });
    }
    if (ev.type === 'heal') {
      skill = G.Data.getSkill(ev.skillId);
      return skill && skill.kind === 'heal' ? V().skill(skill.id, battle.run.classId) : special('heal', ev.vfxHeal === 'drain' ? 'blood' : 'heal', { duration: 480 });
    }
    if (ev.type === 'itemUsed') return V().item(ev.itemId);
    if (ev.type === 'ailment') return special(ev.id === 'poison' ? 'cloud' : ev.id === 'burn' ? 'eruption' : 'sigil', ev.id === 'poison' ? 'poison' : ev.id === 'burn' ? 'fire' : 'dark', { duration: 460, scale: 0.65, motif: ev.id });
    if (ev.type === 'ailmentDamage') return special(ev.id === 'poison' ? 'cloud' : 'eruption', ev.id === 'poison' ? 'poison' : 'fire', { duration: 400, scale: 0.5 });
    if (ev.type === 'companionHit') return special(ev.companionId === 'sand_scarab' ? 'bite' : 'claw', ev.companionId === 'ember_fox' ? 'fire' : 'phys', { duration: 600, key: ev.companionId });
    if (ev.type === 'companionHeal') return special('heal', ev.companionId === 'frost_hare' ? 'ice' : 'heal', { duration: 620 });
    if (ev.type === 'companionBuff') { var offense = ev.stats && ev.stats.indexOf('atk') !== -1; return special(offense ? 'empower' : 'shield', offense ? 'elec' : 'light', { duration: 580 }); }
    if (ev.type === 'storySupport') return special('cross', 'light', { duration: 680, key: 'orin', strikes: 2 });
    if (ev.type === 'riposte') return special('slash', 'light', { key: 'riposte', duration: 600 });
    if (ev.type === 'allOutHit') return special('allout', 'almighty', { key: 'allout', strikes: 5, scale: 1.3 });
    if (ev.type === 'guard') return special('shield', 'light', { key: 'guard', duration: 580 });
    if (ev.type === 'blessingRevive') return special('heal', 'light', { key: 'revive', motif: 'wings', scale: 1.4, duration: 900 });
    if (ev.type === 'bossPhaseChange') return special('phase', 'almighty', { duration: 820 });
    if (ev.type === 'hpSacrifice') return special('drain', 'blood', { duration: 420, scale: 0.6 });
    if (ev.type === 'resourceGain') return special('heal', ev.resource === 'mp' ? 'mana' : 'light', { duration: 460 });
    if (ev.type === 'cleanse') return special('cleanse', 'light', { duration: 620 });
    return null;
  }
  var beforeHit = ['affinity', 'ailment', 'downed', 'enemyBroken', 'focusReady', 'combo', 'resourceGain'];
  function timeline(events) {
    var result = [], deferred = [];
    function flush() { if (deferred.length) { deferred.forEach(function (e) { result.push({ events: [e] }); }); deferred = []; } }
    for (var i = 0; i < events.length; i++) {
      var ev = events[i];
      if ((ev.type === 'skillUsed' && ev.target === 'allEnemies') || ev.type === 'allOutStart') {
        flush(); result.push({ events: [ev], windup: true });
        var group = [], end = i + 1;
        while (end < events.length && ['victory', 'defeat', 'allOutReady', 'skillUsed', 'enemyAction', 'companionHit', 'storySupport', 'blessingRevive'].indexOf(events[end].type) === -1) group.push(events[end++]);
        var primary = group.filter(function (e) { return e.type === 'hit' || e.type === 'allOutHit' || (e.type === 'buff' && e.side === 'enemy'); });
        if (primary.length) { result.push({ events: group, primary: primary, simultaneous: true }); i = end - 1; }
        continue;
      }
      if (beforeHit.indexOf(ev.type) !== -1) { deferred.push(ev); continue; }
      if (ev.type === 'hit' || ev.type === 'companionHit' || ev.type === 'storySupport' || ev.type === 'riposte' || ev.type === 'allOutHit') {
        result.push({ events: [ev].concat(deferred), primary: [ev] }); deferred = []; continue;
      }
      flush(); result.push({ events: [ev], windup: ev.type === 'skillUsed' || ev.type === 'enemyAction' || ev.type === 'overdriveUsed' });
    }
    flush(); return result;
  }
  function enemyEl(uid) { var card = document.getElementById('enemy-card-' + uid); return card ? card.querySelector('.enemy-portrait') : null; }
  function heroEl() { return document.querySelector('#battle-player-panel .player-portrait'); }
  function anchor(ev, source) {
    if (source) {
      if (ev.attackerUid) return enemyEl(ev.attackerUid);
      if (ev.type === 'storySupport') return document.querySelector('#battle-story-ally .icon');
      if (/^companion/.test(ev.type)) return document.querySelector('#battle-companion-panel .companion-portrait');
      return heroEl();
    }
    if (ev.targetUid && ev.targetUid !== 'player') return enemyEl(ev.targetUid);
    if (ev.type === 'bossPhaseChange') return document.querySelector('.enemy-card.boss .enemy-portrait');
    return heroEl();
  }
  function play(step, battle, impact) {
    var events = step.primary || step.events, primary = events[0];
    if (step.windup) {
      var origin = function () { return anchor(primary, true); };
      return G.PixelFX.play([{ profile: special('empower', primary.element || 'light', { duration: 180, scale: 0.45, windup: true }), source: origin, target: origin, seed: primary.skillId || primary.vfxKey || primary.type }], impact);
    }
    var cues = events.map(function (ev) {
      var p = profile(ev, battle);
      if (!p) return null;
      var isSelf = p.kind === 'item' || ev.type === 'guard' || ev.type === 'heal' || ev.type === 'companionHeal' || ev.type === 'companionBuff' || ev.type === 'blessingRevive' || ev.type === 'hpSacrifice' || ev.type === 'resourceGain' || (ev.type === 'buff' && ev.side === 'player' && !ev.attackerUid);
      return { profile: p, source: function () { return isSelf ? anchor(ev, false) : anchor(ev, true); }, target: function () { return anchor(ev, false); }, seed: (p.key || ev.type) + ':' + (ev.targetUid || 'player') + ':' + (ev.hitIndex || 0), hitIndex: ev.hitIndex || 0,
        ailments: step.events.filter(function (e) { return e.type === 'ailment' && e.targetUid === ev.targetUid; }).map(function (e) { return e.id; }) };
    }).filter(Boolean);
    if (!cues.length) { impact(); return Promise.resolve({ cancelled: false }); }
    return G.PixelFX.play(cues, impact);
  }
  function modifiers(list) {
    return '<div class="combat-modifiers">' + (list || []).filter(function (mod) { return mod.turnsLeft > 0; }).map(function (mod) {
      var label = { atkmag: 'ATK/MAG', defres: 'DEF/RES' }[mod.stat] || mod.stat.toUpperCase();
      return '<span class="combat-mod ' + (mod.amount > 0 ? 'is-positive' : 'is-negative') + '">' + G.Icons.get(mod.amount > 0 ? (mod.stat.indexOf('def') !== -1 || mod.stat === 'res' ? 'fxShield' : 'fxStar') : 'fxRune') + label + ' ' + (mod.amount > 0 ? '+' : '') + Math.round(mod.amount * 100) + '% · ' + mod.turnsLeft + '</span>';
    }).join('') + '</div>';
  }
  G.BattleFX = { profile: profile, timeline: timeline, play: play, modifiers: modifiers };
})();
