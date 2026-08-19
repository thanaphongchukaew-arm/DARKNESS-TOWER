// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Codex screen: Bestiary + Achievements tabs, reachable from the tower map's
// Codex button. Both tabs reuse the exact card/grid vocabulary the Quests screen
// already established (.craft-card/.card-grid/.guide-section) -- Bestiary has no
// claim step (it's a passive discovery log), Achievements swaps a gold/item claim
// for an Equip-title toggle (see State.equipTitle/getEquippedTitle).
(function () {
  function I(name, cls) { return window.Game.Icons.get(name, cls); }
  function SFX(name) { if (window.Game.Audio) window.Game.Audio.sfx(name); }
  function T(key, vars) { return window.Game.I18n.t(key, vars); }
  function L(obj, field) { return window.Game.I18n.L(obj, field); }

  // Persists across renders (tab switch, language toggle) so the player isn't
  // bounced back to Bestiary every time, mirroring ui-tower.js's shopMode.
  var codexMode = 'bestiary';

  function bestiaryTileHtml(template) {
    var meta = window.Game.Save.readMeta();
    var seen = !!(meta.bestiarySeen && meta.bestiarySeen[template.id]);
    return '<div class="craft-card' + (seen ? '' : ' locked') + '">' +
      '<div class="select-card-icon">' + I(seen ? template.icon : 'lock') + '</div>' +
      '<div class="select-card-title">' + (seen ? L(template, 'name') : '???') + '</div>' +
      '<div class="select-card-desc">' + (seen ? T('bestiaryDiscoveredNote') : T('bestiaryUndiscoveredNote')) + '</div>' +
    '</div>';
  }

  function renderBestiaryTab() {
    var D = window.Game.Data;
    var tiersHtml = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(function (tier) {
      var pool = D.getEnemiesByTier(tier);
      if (!pool.length) return '';
      return '<div class="guide-section"><h3>' + T('bestiaryTierLabel', { tier: tier }) + '</h3>' +
        '<div class="card-grid">' + pool.map(bestiaryTileHtml).join('') + '</div></div>';
    }).join('');
    var minibossHtml = '<div class="guide-section"><h3>' + T('bestiaryMinibossLabel') + '</h3><div class="card-grid">' +
      Object.keys(D.minibosses).sort(function (a, b) { return Number(a) - Number(b); }).map(function (f) { return bestiaryTileHtml(D.minibosses[f]); }).join('') +
      '</div></div>';
    var bossHtml = '<div class="guide-section"><h3>' + T('bestiaryBossLabel') + '</h3><div class="card-grid">' + bestiaryTileHtml(D.boss) + '</div></div>';
    document.getElementById('codex-content').innerHTML = tiersHtml + minibossHtml + bossHtml;
  }

  function renderAchievementsTab() {
    var D = window.Game.Data, S = window.Game.State;
    var equipped = S.getEquippedTitle();
    var html = D.achievements.map(function (ach) {
      var unlocked = S.isAchievementUnlocked(ach);
      var isEquipped = equipped && equipped.id === ach.id;
      var statusTag = unlocked ? (isEquipped ? T('achievementEquippedTag') : T('achievementUnlockedTag')) : T('achievementLockedTag');
      return '<div class="craft-card' + (unlocked ? '' : ' locked') + '">' +
        '<div class="select-card-icon">' + I(unlocked ? ach.icon : 'lock') + '</div>' +
        '<div class="select-card-title">' + L(ach, 'name') + '</div>' +
        '<div class="select-card-desc">' + L(ach, 'desc') + '</div>' +
        '<div class="select-card-stats"><span class="stat-chip">' + statusTag + '</span></div>' +
        (unlocked ? '<button class="btn-primary craft-btn" data-ach="' + ach.id + '">' + (isEquipped ? T('achievementUnequipBtn') : T('achievementEquipBtn')) + '</button>' : '') +
      '</div>';
    }).join('');
    document.getElementById('codex-content').innerHTML = '<div class="card-grid">' + html + '</div>';
    Array.prototype.forEach.call(document.querySelectorAll('#codex-content .craft-btn'), function (btn) {
      btn.onclick = function () {
        var id = btn.getAttribute('data-ach');
        var current = S.getEquippedTitle();
        SFX('ui_confirm');
        S.equipTitle(current && current.id === id ? null : id);
        renderAchievementsTab();
      };
    });
  }

  function renderCodex() {
    document.getElementById('codex-header-title').textContent = T('codexScreenTitle');
    document.getElementById('codex-note').textContent = T(codexMode === 'bestiary' ? 'bestiaryNote' : 'achievementsNote');
    document.getElementById('codex-back').innerHTML = I('back');
    document.getElementById('codex-back').onclick = function () { SFX('ui_back'); window.Game.TowerUI.renderTower(); window.Game.UI.showScreen('screen-tower'); };
    document.getElementById('codex-tabs').innerHTML =
      '<button class="' + (codexMode === 'bestiary' ? 'btn-primary' : 'btn-secondary') + '" id="codex-tab-bestiary">' + T('bestiaryTabBtn') + '</button>' +
      '<button class="' + (codexMode === 'achievements' ? 'btn-primary' : 'btn-secondary') + '" id="codex-tab-achievements">' + T('achievementsTabBtn') + '</button>';
    document.getElementById('codex-tab-bestiary').onclick = function () { SFX('ui_confirm'); codexMode = 'bestiary'; renderCodex(); };
    document.getElementById('codex-tab-achievements').onclick = function () { SFX('ui_confirm'); codexMode = 'achievements'; renderCodex(); };
    if (codexMode === 'bestiary') renderBestiaryTab(); else renderAchievementsTab();
  }

  function refreshActiveScreen() {
    var active = document.querySelector('.screen.active');
    if (active && active.id === 'screen-codex') renderCodex();
  }

  window.Game = window.Game || {};
  window.Game.CodexUI = { renderCodex: renderCodex, refreshActiveScreen: refreshActiveScreen };
})();
