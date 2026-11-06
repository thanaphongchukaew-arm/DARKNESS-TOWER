(function () {
  var G = window.Game, X = G.Systems;
  function I(id) { return G.Icons.get(id); }
  function L(obj, field) { return G.I18n.L(obj, field); }
  function escape(value) { return String(value).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function choose(title, note, choices, onChoose) {
    var root = document.getElementById('modal-root');
    root.innerHTML = '<div class="modal-box tactical-modal"><h3>' + title + '</h3><p class="note">' + note + '</p><div class="tactical-choices">' + choices.map(function (choice) {
      var preview = '';
      if (choice.level && G.State.current) { var draft = Object.assign({}, G.State.current, { talents: Object.assign({}, G.State.current.talents) }); draft.talents[choice.level] = choice.id; preview = '<span class="talent-hero-preview">' + G.HeroArt.render(draft) + '</span>'; }
      return '<button class="select-card tactical-choice" data-choice="' + choice.id + '"><span class="tactical-art">' + I(choice.icon) + '</span>' + preview + '<strong>' + L(choice, 'name') + '</strong><span>' + L(choice, 'desc') + '</span></button>';
    }).join('') + '</div></div>';
    root.classList.remove('hidden');
    root.querySelectorAll('[data-choice]').forEach(function (button) {
      button.onclick = function () { root.classList.add('hidden'); root.innerHTML = ''; onChoose(button.dataset.choice); };
    });
  }
  function talentPrompt(done) {
    var run = G.State.current, level = X.pending(run);
    if (!level) { if (done) done(); return; }
    choose(X.text('เลือกพรสวรรค์ · เลเวล ', 'Choose a talent · Level ') + level, X.text('เลือกได้หนึ่งอย่างต่อขั้น เปลี่ยนไม่ได้ในการเดินทางนี้', 'Choose one per milestone. Choices last for this run.'), X.talents.filter(function (t) { return t.level === level; }), function (id) {
      X.chooseTalent(run, id); talentPrompt(function () { G.TowerUI.renderTower(); if (done) done(); });
    });
  }
  function routePrompt(floor, done) {
    var run = G.State.current;
    if (floor < 5 || floor % 5 || floor >= 100 || X.route(run, floor)) { done(); return; }
    var previews={safe:X.text('ตัวอย่าง: ทอง/EXP ลดลง แต่สู้สบายขึ้น','Preview: less gold/EXP, safer fights'),elite:X.text('ตัวอย่าง: ทอง/EXP มากขึ้น และศัตรู Elite','Preview: more gold/EXP and Elite foes'),explore:X.text('ตัวอย่าง: วัตถุดิบโซน 3 ชิ้นหลังชนะชั้นทางแยก','Preview: 3 zone materials after this crossroads fight')};
    var routes=X.routes.map(function(r){return Object.assign({},r,{desc:L(r,'desc')+' · '+previews[r.id],descEn:L(r,'desc')+' · '+previews[r.id]});});
    choose(X.text('ทางแยก · ชั้น ', 'Crossroads · Floor ') + floor, I('microRoute')+X.text('ตัวอย่างแสดงประเภทของรางวัล ไม่ระบุชิ้นที่จะได้รับ', 'Previews show reward types, not exact items.'), routes, function (id) { if (X.chooseRoute(run, floor, id)) done(); });
  }
  function ailments(list) {
    return '<div class="ailment-row">' + (list || []).map(function (a) {
      var names = { poison: ['พิษ', 'Poison'], burn: ['ไหม้', 'Burn'], silence: ['ใบ้', 'Silence'] };
      return '<span class="ailment-chip">' + I('status' + a.id[0].toUpperCase() + a.id.slice(1)) + X.text(names[a.id][0], names[a.id][1]) + ' · ' + a.turns + '</span>';
    }).join('') + '</div>';
  }
  function comparison(run, item, slot) {
    var old = G.Data.getItem(run.equipment[slot]), before = G.State.getTotalStats(run);
    var copy = Object.assign({}, run, { equipment: Object.assign({}, run.equipment) });
    copy.equipment[slot] = item.id;
    var after = G.State.getTotalStats(copy);
    var deltas = Object.keys(after).filter(function (key) { return before[key] !== after[key]; }).map(function (key) {
      var delta = after[key] - before[key];
      return '<span class="' + (delta > 0 ? 'stat-up' : 'stat-down') + '">' + key.toUpperCase() + ' ' + before[key] + ' → ' + after[key] + ' (' + (delta > 0 ? '+' : '') + delta + ')</span>';
    });
    return '<div class="equip-compare"><small>' + X.text('เทียบกับ ', 'Compared with ') + (old ? L(old, 'name') : X.text('ช่องว่าง', 'empty slot')) + '</small>' + (deltas.join('') || X.text('ค่าสถานะเท่าเดิม', 'Same stats')) + (item.combo ? '<span>' + L(item, 'desc') + '</span>' : '') + '</div>';
  }
  function preferences() { var meta = G.Save.readMeta(); return meta.battleSpeed === 2 || meta.battleSpeed === 4 ? meta.battleSpeed : 1; }
  function speedControl() {
    var host = document.getElementById('battle-floor-label');
    var button = document.getElementById('battle-speed');
    if (!button) { button = document.createElement('button'); button.id = 'battle-speed'; button.className = 'btn-secondary speed-control'; host.parentNode.appendChild(button); }
    document.documentElement.style.setProperty('--combat-speed', preferences());
    button.textContent = X.text('ความเร็ว ', 'Speed ') + '×' + preferences();
    button.onclick = function () { var meta = G.Save.readMeta(); meta.battleSpeed = preferences() === 1 ? 2 : preferences() === 2 ? 4 : 1; G.Save.writeMeta(meta); speedControl(); };
  }
  function summary(run, victory) {
    var old = document.getElementById('run-summary'); if (old) old.remove();
    var panel = document.createElement('div'); panel.id = 'run-summary'; panel.className = 'run-summary';
    var cls = G.Data.getClass(run.classId);
    panel.innerHTML = '<div class="summary-hero">' + G.HeroArt.render(run) + '</div><h3>' + X.text('บันทึกการเดินทาง', 'Journey Record') + '</h3><p>' + escape(L(cls, 'name')) + ' · Lv.' + run.level + ' · ' + X.text('ชั้น ', 'Floor ') + run.currentFloor + '/100</p><p>' + X.text('ชนะการต่อสู้ ', 'Battles won ') + (run.stats ? run.stats.battlesWon : 0) + ' · ' + X.text('กำจัดศัตรู ', 'Enemies defeated ') + (run.stats ? run.stats.enemiesDefeated : 0) + '</p>' +
      (!victory && run.lastDamage ? '<p class="stat-down">' + X.text('ความเสียหายสุดท้าย: ', 'Last damage: ') + escape(run.lastDamage.name) + ' (' + run.lastDamage.amount + ')</p>' : '') +
      '<div class="summary-gear">' + Object.keys(run.equipment).map(function (slot) { var item = G.Data.getItem(run.equipment[slot]); return '<span>' + (item ? I(item.icon) + escape(L(item, 'name')) : '—') + '</span>'; }).join('') + '</div><div class="summary-talents">' + X.talents.filter(function (t) { return X.has(run, t.id); }).map(function (t) { return '<span>' + I(t.icon) + L(t, 'name') + '</span>'; }).join('') + '</div>';
    var micro=G.Micro.ensure(run).stats,topSkill=G.Micro.top(micro.skills),topRune=G.Micro.top(micro.runes);
    panel.innerHTML+='<div class="micro-run-stats"><h4>'+I('microTrophy')+X.text('ช่วงเวลาน่าจดจำ','Run highlights')+'</h4><div><span>'+X.text('ดาเมจสูงสุด','Highest hit')+' <b>'+(micro.maxHit||0)+'</b></span><span>'+X.text('ทำ Break','Breaks')+' <b>'+(micro.breaks||0)+'</b></span><span>'+I('microCombo')+X.text('คอมโบ','Combos')+' <b>'+(micro.combos||0)+'</b></span><span>'+X.text('สกิลใช้บ่อย','Most-used skill')+' <b>'+(topSkill?escape(L(G.Data.getSkill(topSkill),'name'))+' ×'+micro.skills[topSkill]:'—')+'</b></span><span>'+X.text('รูนที่ทำงานบ่อย','Most-triggered rune')+' <b>'+(topRune?escape(L(G.Data.getItem(topRune),'name'))+' ×'+micro.runes[topRune]:'—')+'</b></span></div></div>';
    document.getElementById('end-actions').before(panel);
    var meta = G.Save.readMeta(); meta.lastRun = { victory: victory, classId: run.classId, level: run.level, floor: run.currentFloor, currentFloor: run.currentFloor, stats: run.stats || {}, relics: run.relics || [], companionId: run.companionId || null, lastDamage: run.lastDamage || null, equipment: run.equipment, talents: run.talents || {}, micro: run.micro || null }; G.Save.writeMeta(meta);
  }
  G.SystemsUI = { talentPrompt: talentPrompt, routePrompt: routePrompt, ailments: ailments, comparison: comparison, speed: preferences, speedControl: speedControl, summary: summary };
})();
