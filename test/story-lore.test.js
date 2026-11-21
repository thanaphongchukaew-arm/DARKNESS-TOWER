const test = require('node:test');
const assert = require('node:assert/strict');
const {loadGame} = require('./helpers/load-game');

function fixture(floor = 1) {
  const g = loadGame({random: () => 0.5}), run = g.State.createRun('normal', 'blade');
  run.level = 20; run.currentFloor = floor; run.gold = 5000; g.State.fullRestore(run);
  return {g, run};
}
// Plays an NPC chapter with the given choice, regardless of which floor it normally sits on.
function play(f, arcId, choiceId) {
  const arc = f.g.Story.getArc(arcId), state = f.g.Story.ensure(f.run).people[arcId];
  f.run.currentFloor = arc.chapters[state.chapter].floor;
  const story = f.g.Story.ensure(f.run);
  state.lastFloor = 0; story.lastFloor = 0;
  // keep the other arcs from claiming this floor first (a chapter needs 5 floors since the last one)
  Object.keys(story.people).forEach((id) => { if (id !== arcId) story.people[id].lastFloor = f.run.currentFloor; });
  const event = f.g.Story.begin(f.run, f.run.currentFloor);
  assert.equal(event.arc.id, arcId);
  return f.g.Story.resolve(f.run, arcId, choiceId);
}

test('every narrative string has a Thai and an English version', () => {
  const g = loadGame(), story = g.Data.story;
  const pair = (obj, field, where) => {
    const th = obj[field], en = obj[field + 'En'];
    assert.ok(th && en, where + '.' + field + ' needs both languages');
    assert.equal(Array.isArray(th), Array.isArray(en), where + '.' + field + ' shape mismatch');
    if (Array.isArray(th)) assert.equal(th.length, en.length, where + '.' + field + ' paragraph count mismatch');
  };
  Object.keys(story.screens).forEach((k) => ['title', 'btn', 'body'].forEach((f) => pair(story.screens[k], f, 'screens.' + k)));
  pair(story.screens.ending, 'closing', 'screens.ending');
  story.lore.forEach((l) => { pair(l, 'title', l.id); pair(l, 'text', l.id); });
  Object.keys(story.epilogues).forEach((id) => ['bonded', 'distant'].forEach((f) => pair(story.epilogues[id], f, 'epilogue.' + id)));
  pair(story.epilogues.orin, 'oath', 'epilogue.orin');
  pair(story, 'truth', 'story');
  story.arcs.forEach((arc) => arc.chapters.forEach((c, i) => pair(c, 'clue', arc.id + '#' + i)));
});

test('every NPC chapter carries a clue, and lore floors are unique and never share a floor with an NPC chapter', () => {
  const g = loadGame(), story = g.Data.story;
  const npcFloors = new Set();
  story.arcs.forEach((arc) => arc.chapters.forEach((c) => { assert.ok(c.clue); npcFloors.add(c.floor); }));
  const ids = new Set(), floors = new Set();
  story.lore.forEach((l) => {
    assert.ok(!ids.has(l.id) && !floors.has(l.floor), 'duplicate lore ' + l.id);
    assert.ok(!npcFloors.has(l.floor), 'lore ' + l.id + ' collides with an NPC chapter floor');
    assert.ok(l.floor >= 1 && l.floor <= 100);
    ids.add(l.id); floors.add(l.floor);
  });
});

test('lore appears once on its floor, is saved, and is skipped on replays', () => {
  const f = fixture(10);
  const first = f.g.Story.nextLore(f.run, 10);
  assert.equal(first.id, 'lamplighter_note');
  assert.ok(f.g.Story.discover(f.run, first.id));
  assert.equal(f.g.Story.nextLore(f.run, 10), null);
  f.g.State.current = f.g.Save.read();
  assert.equal(f.g.Story.nextLore(f.g.State.current, 10), null);
  // replaying a cleared floor (floor differs from the run's current floor) never shows lore
  f.run.currentFloor = 30;
  assert.equal(f.g.Story.nextLore(f.run, 25), null);
  assert.equal(f.g.Story.discover(f.run, 'does_not_exist'), false);
});

test('missed lore catches up one fragment per floor entry, oldest first', () => {
  const f = fixture(60);
  const seen = [];
  for (let guard = 0; guard < 20; guard++) {
    const fragment = f.g.Story.nextLore(f.run, 60);
    if (!fragment) break;
    f.g.Story.discover(f.run, fragment.id); seen.push(fragment.id);
  }
  assert.deepEqual(Array.from(seen), ['lamplighter_note', 'wall_inscription', 'builders_page', 'shadow_last_words', 'stone_names']);
  f.run.currentFloor = 100;
  assert.equal(f.g.Story.nextLore(f.run, 100).id, 'lamplighter_second');
});

test('lore waits while an NPC encounter is active', () => {
  const f = fixture(3);
  assert.ok(f.g.Story.begin(f.run, 3));
  assert.equal(f.g.Story.nextLore(f.run, 3), null);
});

test('ending text follows the player’s NPC choices and lore progress', () => {
  const closing = (g, run) => g.Story.screen('ending', run).body;

  const warm = fixture();
  play(warm, 'mira', 'lift'); play(warm, 'mira', 'leave'); play(warm, 'mira', 'leave');
  assert.equal(warm.g.Story.epilogueFor(warm.run).length, 1);
  assert.match(warm.g.Story.epilogueFor(warm.run)[0], /มิรา|Mira/);

  const cold = fixture();
  play(cold, 'mira', 'leave');
  assert.notEqual(cold.g.Story.epilogueFor(cold.run)[0], warm.g.Story.epilogueFor(warm.run)[0], 'trust changes the epilogue');

  const oath = fixture();
  play(oath, 'orin', 'repair'); play(oath, 'orin', 'oath');
  assert.match(oath.g.Story.epilogueFor(oath.run).join(' '), /ธง|banner/);

  const fresh = fixture();
  assert.equal(fresh.g.Story.epilogueFor(fresh.run).length, 0, 'unmet NPCs add nothing');
  const base = closing(fresh.g, fresh.run);
  const truth = fresh.g.Data.story.truth;
  assert.ok(!base.includes(truth), 'truth paragraph needs every fragment');
  fresh.g.Data.story.lore.forEach((l) => fresh.g.Story.discover(fresh.run, l.id));
  assert.equal(fresh.g.Story.loreProgress(fresh.run).found, fresh.g.Story.loreProgress(fresh.run).total);
  assert.ok(closing(fresh.g, fresh.run).includes(truth));
  assert.ok(closing(fresh.g, fresh.run).endsWith(fresh.g.Data.story.screens.ending.closing.slice(-1)[0]));
});

test('intro screen needs no run and carries the hero’s origin', () => {
  const g = loadGame();
  const intro = g.Story.screen('intro', null);
  assert.match(intro.body, /เศษจันทรา/);
  assert.ok(intro.title && intro.btn);
});
