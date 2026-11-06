(function () {
  var G = window.Game, X = G.Systems, Story = G.Story;
  var lastView = null;
  function L(obj, field) { return G.I18n.L(obj, field); }
  function I(id) { return G.Icons.get(id); }
  function escape(value) { return String(value || '').replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function scene(event) {
    return '<div class="npc-scene" style="--npc-color:' + event.arc.color + '"><span class="npc-scene-stars"></span><span class="npc-prop">' + I(event.chapter.prop) + '</span><span class="npc-portrait">' + I(event.chapter.icon) + '</span><span class="npc-scene-ground"></span><span class="npc-scene-name">' + L(event.arc, 'name') + '</span></div>';
  }
  function render(event, resolved) {
    lastView = { event: event, resolved: resolved || null };
    var run = G.State.current, state = Story.ensure(run).people[event.arc.id];
    document.getElementById('event-icon').classList.add('event-npc-icon');
    document.getElementById('event-icon').innerHTML = I(event.arc.icon);
    document.getElementById('event-title').textContent = L(event.chapter, 'title');
    document.getElementById('event-desc').textContent = L(event.arc, 'name') + ' · ' + X.text('ตอน ', 'Chapter ') + (event.index + 1) + '/3 · ' + X.text('ชั้น ', 'Floor ') + event.floor + ' · ' + X.text('ความไว้ใจ ', 'Trust ') + state.trust;
    var dialogue = L(event.chapter, 'text');
    if (state.trust >= 2 && event.chapter.helped) dialogue += '\n' + L(event.chapter, 'helped');
    else if (state.trust < 2 && event.chapter.distant) dialogue += '\n' + L(event.chapter, 'distant');
    document.getElementById('event-body').innerHTML = '<div class="story-resources"><span>' + I('heart') + ' HP ' + run.hp + '/' + G.State.getMaxHp(run) + '</span><span>' + I('drop') + ' MP ' + run.mp + '/' + G.State.getMaxMp(run) + '</span><span>' + I('coin') + ' ' + run.gold + '</span></div><div class="story-scene-layout">' + scene(event) + '<div class="npc-dialogue"><div class="story-chapter-dots">' + [0, 1, 2].map(function (i) { return '<span class="' + (i <= event.index ? 'lit' : '') + '"></span>'; }).join('') + '</div>' + dialogue.split('\n').map(function (p) { return '<p>' + escape(p) + '</p>'; }).join('') + '</div></div>' +
      (resolved ? '<div class="story-result"><strong>' + X.text('บันทึกการตัดสินใจแล้ว', 'Your choice is remembered') + '</strong><p>' + L(resolved, 'name') + '</p><p>' + L(resolved, 'desc') + '</p></div>' : '<div class="story-choices">' + event.chapter.choices.map(function (option) {
        var available = Story.availability(run, event.arc.id, option);
        return '<button class="select-card story-choice" data-story-choice="' + option.id + '"' + (available ? '' : ' disabled') + '><strong>' + L(option, 'name') + '</strong><span>' + L(option, 'desc') + '</span>' + (!available ? '<small>' + X.text('เงื่อนไขยังไม่ครบ', 'Requirements not met') + '</small>' : '') + '</button>';
      }).join('') + '</div>');
    var actions = document.getElementById('event-actions');
    actions.innerHTML = resolved ? '<button class="btn-primary" id="npc-story-continue">' + X.text('ออกเดินทางต่อ', 'Continue the journey') + '</button>' : '';
    if (resolved) {
      document.getElementById('npc-story-continue').onclick = function () {
        lastView = null;
        G.TowerUI.renderTower(); G.UI.showScreen('screen-tower');
      };
    } else document.querySelectorAll('[data-story-choice]').forEach(function (button) {
      button.onclick = function () {
        var result = Story.resolve(run, event.arc.id, button.dataset.storyChoice);
        if (!result) return;
        run.eventsSeen = run.eventsSeen || {}; run.eventsSeen[event.floor] = true; G.State.saveNow();
        if (G.Audio) G.Audio.sfx('ui_confirm');
        render(event, result.option);
      };
    });
    G.UI.showScreen('screen-event');
  }
  function maybe(floor) {
    var event = Story.begin(G.State.current, floor);
    if (!event) return false;
    render(event); return true;
  }
  function refresh() {
    var active = document.querySelector('.screen.active');
    if (active && active.id === 'screen-event' && lastView) { render(lastView.event, lastView.resolved); return true; }
    return false;
  }
  function journal() {
    var run = G.State.current, story = Story.ensure(run);
    return '<div class="story-journal">' + Story.arcs.map(function (arc) {
      var state = story.people[arc.id], met = state.chapter > 0;
      return '<article class="story-journal-card"><div class="journal-portrait">' + I(met ? arc.chapters[Math.max(0, state.chapter - 1)].icon : arc.icon) + '</div><div><h3>' + (met ? L(arc, 'name') : X.text('ผู้เดินทางที่ยังไม่พบ', 'A traveler yet to meet')) + '</h3><p>' + (met ? X.text('ความไว้ใจ ', 'Trust ') + state.trust + ' · ' + state.chapter + '/3' : X.text('เริ่มพบได้ตั้งแต่ชั้น ', 'First encounter from floor ') + arc.chapters[0].floor) + '</p>' +
        state.history.map(function (entry) { var chapter = arc.chapters[entry.chapter], option = chapter.choices.find(function (c) { return c.id === entry.choice; }); return '<div class="journal-entry"><strong>' + L(chapter, 'title') + '</strong><span>' + X.text('ชั้น ', 'Floor ') + entry.floor + ' · ' + L(option, 'name') + '</span></div>'; }).join('') +
        (state.chapter < 3 ? '<p class="journal-next">' + X.text('เรื่องราวถัดไปเริ่มตั้งแต่ชั้น ', 'Next chapter from floor ') + arc.chapters[state.chapter].floor + '</p>' : '<p class="journal-next">' + X.text('เรื่องราวจบแล้ว แต่คำสัญญายังคงอยู่', 'The story ends; its promises remain.') + '</p>') +
        (arc.id === 'orin' && story.orinRounds ? '<p class="journal-oath">' + X.text('คำสัตย์: ช่วยโจมตีบอส ', 'Oath: aids boss fights for ') + story.orinRounds + X.text(' รอบแรก', ' opening rounds') + '</p>' : '') + '</div></article>';
    }).join('') + '</div>';
  }
  G.StoryUI = { maybe: maybe, refresh: refresh, journal: journal, scene: scene };
})();
