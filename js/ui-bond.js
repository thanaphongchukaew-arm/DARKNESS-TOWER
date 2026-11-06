// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Companion-bond UI: the bond meter shown in the companion picker, and the
// level-up scene (companion + bond heart + the NPC it is tied to) after a battle.
(function () {
  var G = window.Game;
  function T(key, vars) { return G.I18n.t(key, vars); }
  function L(obj, field) { return G.I18n.L(obj, field); }
  function I(id) { return G.Icons.get(id); }
  var NPC = { mira: { icon: 'npcMira', name: 'มิรา', nameEn: 'Mira' }, orin: { icon: 'npcOrin', name: 'โอริน', nameEn: 'Orin' }, lyra: { icon: 'npcLyra', name: 'ไลรา', nameEn: 'Lyra' } };

  // A compact meter: "Lv.2 ▮▮▮▯▯ 8/14" plus the duo-move line.
  function meter(id) {
    var info = G.Bond.info(id);
    if (!info) return '';
    var pr = G.Bond.progress(id);
    var floor = G.Bond.LEVEL_AT[pr.level - 1], span = pr.next == null ? 1 : pr.next - floor;
    var pct = pr.max ? 100 : Math.round((pr.points - floor) / span * 100);
    return '<div class="bond-meter"><span class="bond-meter-icon">' + I('bondHeart') + '</span><span class="bond-meter-lv">' + T('bondLevelLabel', { level: pr.level }) + '</span>' +
      '<span class="bond-meter-bar"><i style="width:' + pct + '%"></i></span><span class="bond-meter-pts">' + (pr.max ? T('bondMax') : pr.points + '/' + pr.next) + '</span></div>' +
      '<div class="bond-duo-line">' + (pr.level >= 2 ? T('bondDuoLine', { name: L(info.duo, 'name') }) : T('bondDuoLocked')) + '</div>';
  }

  function showLevelUp(result) {
    var run = G.State.current, story = G.Bond.story(result.id, result.level, run);
    if (!story) return;
    var info = G.Bond.info(result.id), npc = NPC[info.npc];
    var lines = '<p class="bond-story-text">' + L(story.text, 'text') + '</p>';
    if (story.npcLine) lines += '<p class="bond-story-npc"><strong>' + L(npc, 'name') + ':</strong> ' + L(story.npcLine, 'text') + '</p>';
    var perk = result.level === 2 ? T('bondUpUnlock', { name: L(info.duo, 'name') }) : T('bondUpEnhance', { name: L(info.duo, 'name') });
    if (G.Bond.mult(run, result.id) > (result.level >= 3 ? 1.35 : 1)) perk += ' · ' + T('bondNpcTrust', { npc: L(npc, 'name') });
    var root = document.getElementById('modal-root');
    root.innerHTML = '<div class="modal-box bond-modal"><h3>' + T('bondUpTitle', { level: result.level }) + '</h3>' +
      '<div class="bond-scene"><span class="bond-scene-comp">' + I(story.companion.icon) + '</span><span class="bond-scene-heart">' + I('bondHeart') + '</span><span class="bond-scene-npc">' + I(npc.icon) + '</span></div>' +
      '<h4 class="bond-story-title">' + L(story.companion, 'name') + '</h4>' + lines + '<p class="bond-perk">' + I('duoBoost') + '<span>' + perk + '</span></p>' +
      '<div class="modal-actions"><button class="btn-primary" id="bond-close">' + T('closeBtn') + '</button></div></div>';
    root.classList.remove('hidden');
    document.getElementById('bond-close').onclick = function () { root.classList.add('hidden'); root.innerHTML = ''; };
    if (G.Audio) G.Audio.sfx('level_up');
  }

  G.BondUI = { meter: meter, showLevelUp: showLevelUp };
})();
