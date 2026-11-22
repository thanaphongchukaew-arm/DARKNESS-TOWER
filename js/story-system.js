// Story logic: choice-driven NPC arcs, floor-triggered lore fragments and the intro/ending text assembly.
// All narrative text lives in data-story.js. Story state belongs to a single tower run.
(function () {
  var G = window.Game, D = G.Data, S = G.State;
  var ST = D.story, arcs = ST.arcs;
  function ensure(run) {
    if (!run.story) run.story = { people: {}, active: null, lastFloor: 0 };
    if (!run.story.people) run.story.people = {};
    if (!run.story.lore) run.story.lore = {};
    arcs.forEach(function (arc) { if (!run.story.people[arc.id]) run.story.people[arc.id] = { chapter: 0, trust: 0, history: [], lastFloor: 0 }; });
    return run.story;
  }
  function getArc(id) { return arcs.find(function (arc) { return arc.id === id; }) || null; }
  function next(run, floor) {
    var story = ensure(run);
    if (story.active) {
      var activeArc = getArc(story.active.id);
      if (activeArc && story.people[activeArc.id].chapter === story.active.chapter) return { arc: activeArc, chapter: activeArc.chapters[story.active.chapter], index: story.active.chapter, floor: story.active.floor };
      story.active = null;
    }
    if (floor !== run.currentFloor || floor >= 100 || story.lastFloor === floor) return null;
    var eligible = arcs.filter(function (arc) {
      var state = story.people[arc.id], chapter = arc.chapters[state.chapter];
      return chapter && floor >= chapter.floor && (!state.lastFloor || floor - state.lastFloor >= 5);
    }).sort(function (a, b) { return a.chapters[story.people[a.id].chapter].floor - b.chapters[story.people[b.id].chapter].floor; });
    if (!eligible.length) return null;
    var arc = eligible[0], index = story.people[arc.id].chapter;
    return { arc: arc, chapter: arc.chapters[index], index: index, floor: floor };
  }
  function begin(run, floor) {
    var event = next(run, floor);
    if (!event) return null;
    ensure(run).active = { id: event.arc.id, chapter: event.index, floor: event.floor };
    S.saveNow(); return event;
  }
  function availability(run, arcId, option) {
    var state = ensure(run).people[arcId];
    if (!state || !option) return false;
    return state.trust >= (option.minTrust || 0) && run.gold >= (option.goldCost || 0) &&
      (!option.itemCost || (run.inventory[option.itemCost] || 0) >= 1) &&
      (!option.hpCost || run.hp > Math.max(1, Math.round(S.getMaxHp(run) * option.hpCost))) &&
      (!option.mpCost || run.mp >= Math.max(1, Math.round(S.getMaxMp(run) * option.mpCost)));
  }
  function resolve(run, arcId, choiceId) {
    var story = ensure(run), active = story.active, arc = getArc(arcId);
    if (!active || !arc || active.id !== arcId || active.floor !== run.currentFloor) return null;
    var state = story.people[arcId], chapter = arc.chapters[state.chapter];
    if (active.chapter !== state.chapter || !chapter) return null;
    var option = chapter.choices.find(function (c) { return c.id === choiceId; });
    if (!availability(run, arcId, option)) return null;
    if (option.goldCost) S.spendGold(run, option.goldCost);
    if (option.hpCost) run.hp -= Math.max(1, Math.round(S.getMaxHp(run) * option.hpCost));
    if (option.mpCost) run.mp -= Math.max(1, Math.round(S.getMaxMp(run) * option.mpCost));
    if (option.itemCost) S.removeItem(run, option.itemCost, 1);
    (option.items || []).forEach(function (item) { S.addItem(run, item.id, item.qty); });
    if (option.relic) S.addRelic(run, option.relic);
    if (option.heal) run.hp = Math.min(S.getMaxHp(run), run.hp + Math.round(S.getMaxHp(run) * option.heal));
    if (option.research) D.getEnemiesByTier(G.Formulas.tierForFloor(run.currentFloor)).forEach(function (enemy) { S.recordEnemySeen(enemy.id); G.Systems.discover({ templateId: enemy.id }, enemy.weak); G.Systems.discover({ templateId: enemy.id }, enemy.resist); });
    state.trust += option.trust || 0;
    if (option.support) story.orinRounds = Math.max(story.orinRounds || 0, option.support);
    state.history.push({ chapter: state.chapter, choice: option.id, floor: run.currentFloor });
    state.chapter += 1; state.lastFloor = run.currentFloor;
    story.lastFloor = run.currentFloor; story.active = null;
    if (option.relic === 'veyra_bell') S.setAchievementFlag('veyraBell');
    if (arcs.every(function (a) { var st = story.people[a.id]; return st.chapter >= a.chapters.length && st.trust >= 2; })) S.setAchievementFlag('allBonded');
    S.saveNow(); return { arc: arc, chapter: chapter, option: option };
  }
  function supportRounds(run) { return ensure(run).orinRounds || 0; }
  // ---- Lore fragments: shown once per run, the first time you enter their floor or any
  // later floor (so older saves catch up one scene per floor entry). Never on replays. ----
  function nextLore(run, floor) {
    var story = ensure(run);
    if (floor !== run.currentFloor || story.active) return null;
    return ST.lore.filter(function (f) { return floor >= f.floor && !story.lore[f.id]; })
      .sort(function (a, b) { return a.floor - b.floor; })[0] || null;
  }
  // Marks the fragment found (idempotent) so a reload mid-scene never shows it twice.
  function discover(run, id) {
    var story = ensure(run);
    if (!ST.lore.some(function (f) { return f.id === id; })) return false;
    if (!story.lore[id]) { story.lore[id] = run.currentFloor; S.saveNow(); }
    return true;
  }
  function foundLore(run) {
    var story = ensure(run);
    return ST.lore.filter(function (f) { return story.lore[f.id]; });
  }
  function loreProgress(run) { return { found: foundLore(run).length, total: ST.lore.length }; }

  // ---- Screens: pure text assembly, so the UI only renders what it is given ----
  function pick(obj, field) { return G.I18n.L(obj, field); }
  function epilogueFor(run) {
    var story = ensure(run);
    return arcs.map(function (arc) {
      var state = story.people[arc.id], text = ST.epilogues[arc.id];
      if (!state || !text || state.chapter === 0) return '';
      var out = pick(text, state.trust >= 2 ? 'bonded' : 'distant');
      if (arc.id === 'orin' && (story.orinRounds || 0) > 0 && text.oath) out += pick(text, 'oath');
      return out;
    }).filter(Boolean);
  }
  // kind: 'intro' | 'ending'. run is only needed for the ending's personalised paragraphs.
  function screen(kind, run) {
    var def = ST.screens[kind], body = pick(def, 'body').slice();
    if (kind === 'ending') {
      if (run) {
        body = body.concat(epilogueFor(run));
        var progress = loreProgress(run);
        if (progress.found === progress.total) body.push(pick(ST, 'truth'));
      }
      body = body.concat(pick(def, 'closing'));
    }
    return { title: pick(def, 'title'), body: body.join('\n\n'), btn: pick(def, 'btn') };
  }
  G.Story = { nextLore: nextLore, discover: discover, foundLore: foundLore, loreProgress: loreProgress, epilogueFor: epilogueFor, screen: screen, arcs: arcs, ensure: ensure, getArc: getArc, next: next, begin: begin, availability: availability, resolve: resolve, supportRounds: supportRounds };
})();
