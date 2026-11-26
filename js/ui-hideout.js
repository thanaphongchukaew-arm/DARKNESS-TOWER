// The hideout lives between attempts, so its preparation is saved with profile data.
(function () {
  var G = window.Game;
  var masteryClassId = 'samurai';

  function T(key, vars) { return G.I18n.t(key, vars); }
  function L(obj, field) { return G.I18n.L(obj, field); }
  function I(name) { return G.Icons.get(name); }
  function byId(id) { return document.getElementById(id); }

  function preparation() {
    var prep = G.Save.readMeta().hideout;
    if (!prep || typeof prep.difficulty !== 'string' || !Object.prototype.hasOwnProperty.call(G.Formulas.DIFFICULTY, prep.difficulty)) return null;
    var ascension = Number.isInteger(prep.ascension) ? prep.ascension : 0;
    prep.ascension = prep.difficulty === 'nightmare' ? Math.max(0, Math.min(ascension, G.Formulas.ASCENSION_MAX)) : 0;
    return prep;
  }

  function writePreparation(prep) {
    var meta = G.Save.readMeta();
    meta.hideout = prep;
    G.Save.writeMeta(meta);
  }

  function prepare(difficulty, ascension, returned) {
    writePreparation({
      difficulty: difficulty, ascension: ascension || 0, returned: !!returned,
      options: null, blessing: null, curse: null
    });
  }

  function open() {
    render();
    G.UI.showScreen('screen-hideout');
    window.scrollTo(0, 0);
  }

  function render() {
    var prep = preparation();
    if (!prep) return;
    var difficulty = L(G.Formulas.DIFFICULTY[prep.difficulty], 'name');
    if (prep.ascension) difficulty += ' · ' + T('ascensionLevelTitle', { level: prep.ascension });
    var blessing = G.Data.getBlessing(prep.blessing);
    var curse = G.Data.getCurse(prep.curse);
    var blessingLabel = blessing ? L(blessing, 'name') + (curse ? ' · ' + L(curse, 'name') : '') : T('hideoutShrineHint');
    var meta = G.Save.readMeta();
    var last = meta.lastRun;
    var mapLabel = meta.bestFloorReached ? T('hideoutBestFloor', { floor: meta.bestFloorReached }) : T('hideoutMapBlank');
    byId('hideout-title').textContent = T('hideoutTitle');
    byId('hideout-back').innerHTML = I('back');
    byId('hideout-back').setAttribute('aria-label', T('backToMenu'));
    byId('hideout-back').onclick = function () {
      G.Audio.sfx('ui_back');
      G.MenuUI.renderMainMenu();
      G.UI.showScreen('screen-menu');
    };
    byId('hideout-content').innerHTML =
      '<div class="hideout-intro"><div><p class="hideout-location">' + T('hideoutLocation') + '</p><p class="hideout-story">' +
      L(G.Data.story.hideout, prep.returned ? 'returned' : 'welcome') + '</p></div>' +
      '<div class="hideout-departure"><button class="btn-primary" id="hideout-enter">' + I('enterFloor') + T('hideoutDoor') + '</button>' +
      '<button class="btn-ghost" id="hideout-difficulty" title="' + T('hideoutChangeDifficulty') + '">' + I('settingsGear') + '<span>' + difficulty + '</span></button></div></div>' +
      '<div class="hideout-stations">' +
      station('mastery', 'codex', 'masteryTitle', T('masteryCoins', { coins: G.Mastery.profile(meta).coins })) +
      station('bench', 'propLantern', 'hideoutBench', T('hideoutBenchHint')) +
      station('map', 'codex', 'hideoutMap', mapLabel) +
      station('shrine', 'eventShrine', 'hideoutShrine', blessingLabel) +
      '</div>' +
      (last ? '<p class="hideout-last" id="hideout-last-run"></p>' : '');
    if (last) byId('hideout-last-run').textContent = lastRunLabel(last);

    function bind(id, action) {
      byId('hideout-' + id).onclick = function () { G.Audio.sfx('ui_confirm'); action(); };
    }
    bind('enter', function () { G.MenuUI.openClassSelect(); });
    byId('hideout-difficulty').setAttribute('aria-label', T('hideoutChangeDifficulty') + ' · ' + difficulty);
    bind('difficulty', function () { G.MenuUI.openDifficultyFromHideout(); });
    bind('mastery', function () {
      masteryClassId = last && G.Data.getClass(last.classId) ? last.classId : 'samurai';
      renderMastery();
      G.UI.showScreen('screen-mastery');
      window.scrollTo(0, 0);
    });
    bind('bench', function () {
      G.UI.confirmModal({
        title: T('hideoutBench'), message: L(G.Data.story.hideout, 'letter'),
        confirmLabel: T('closeBtn')
      });
    });
    bind('map', function () {
      G.CodexUI.openBestiary();
    });
    bind('shrine', function () {
      G.MenuUI.renderBlessingPick();
      G.UI.showScreen('screen-blessing-pick');
      window.scrollTo(0, 0);
    });
  }

  function station(id, icon, label, detail) {
    return '<button class="hideout-station" id="hideout-' + id + '"><span class="hideout-station-icon">' + I(icon) +
      '</span><span><strong>' + T(label) + '</strong><small>' + detail + '</small></span>' + I('chevronRight') + '</button>';
  }

  function lastRunLabel(last) {
    var floor = Number(last.floor || last.currentFloor) || 1;
    return T('hideoutLastRun', { floor: floor }) +
      (!last.victory && last.lastDamage ? ' · ' + T('hideoutLastHit', last.lastDamage) : '');
  }

  function depart(classId) {
    var prep = preparation();
    if (!prep || G.State.current || !G.Data.getClass(classId) || !G.State.isClassUnlocked(classId)) return;
    var run = G.State.createRun(prep.difficulty, classId, prep.ascension || 0);
    if (G.Data.getBlessing(prep.blessing)) G.State.addBlessing(run, prep.blessing);
    if (G.Data.getCurse(prep.curse)) G.State.addCurse(run, prep.curse, true);
    G.State.saveNow();
    var meta = G.Save.readMeta();
    delete meta.hideout;
    G.Save.writeMeta(meta);
    G.TowerUI.enterFloor(run.currentFloor);
  }

  function renderMastery() {
    var mastery = G.Mastery;
    var profile = mastery.profile(G.Save.readMeta());
    var entry = mastery.classRecord(profile, masteryClassId);
    var perks = mastery.perks.filter(function (perk) { return perk.classId === masteryClassId; });
    var classes = G.Data.classes.filter(function (cls) { return G.State.isClassUnlocked(cls.id); });
    byId('mastery-title').textContent = T('masteryTitle');
    byId('mastery-back').innerHTML = I('back');
    byId('mastery-back').setAttribute('aria-label', T('hideoutReturn'));
    byId('mastery-back').onclick = open;
    byId('mastery-content').innerHTML =
      '<p class="hideout-story">' + T('masteryHelp') + '</p>' +
      '<div class="mastery-overview"><label for="mastery-class">' + T('masteryClass') + '</label>' +
      '<select id="mastery-class">' + classes.map(function (cls) {
        return '<option value="' + cls.id + '"' + (cls.id === masteryClassId ? ' selected' : '') + '>' + L(cls, 'name') + '</option>';
      }).join('') + '</select><span>' + T('masteryXP', { xp: entry.xp }) + '</span><span>' +
      T('masteryCoins', { coins: profile.coins }) + '</span></div>' +
      (perks.length ? '<div class="hideout-stations">' + perks.map(function (perk) {
        var owned = entry.owned.indexOf(perk.id) !== -1;
        var active = entry.equipped === perk.id && owned;
        var label = owned ? T(active ? 'masteryUnequip' : 'masteryEquip') : T('masteryBuy', { coins: perk.price });
        var blocked = !owned && (entry.xp < perk.xp || profile.coins < perk.price);
        var detail = owned ? (active ? T('masteryEquipped') : '') : T('masteryCost', { xp: perk.xp, coins: perk.price });
        var missing = [];
        if (!owned && entry.xp < perk.xp) missing.push(T('masteryLockedXP', { xp: perk.xp - entry.xp }));
        if (!owned && profile.coins < perk.price) missing.push(T('masteryLockedCoins', { coins: perk.price - profile.coins }));
        return '<article class="mastery-perk"><h3>' + I(perk.icon) + T('masteryPerkName_' + perk.id) + '</h3>' +
          '<p>' + T('masteryPerkDesc_' + perk.id) + '</p>' + (detail ? '<p class="mastery-detail">' + detail + '</p>' : '') +
          (missing.length ? '<p class="mastery-detail">' + missing.join(' · ') + '</p>' : '') +
          '<button class="btn-' + (!owned && !blocked ? 'primary' : 'secondary') + '" data-perk="' + perk.id + '"' +
          (blocked ? ' disabled' : '') + '>' + label + '</button></article>';
      }).join('') + '</div>' : '<p class="hideout-story">' + T('masteryNoPerks') + '</p>');
    byId('mastery-class').onchange = function () {
      masteryClassId = this.value;
      renderMastery();
      byId('mastery-class').focus();
    };
    byId('mastery-content').querySelectorAll('[data-perk]').forEach(function (button) {
      button.onclick = function () {
        var id = button.dataset.perk;
        if (!mastery.selectPerk(masteryClassId, id)) {
          G.UI.notice(T('masteryFailed'), 'warn');
          return;
        }
        G.Audio.sfx('ui_confirm');
        renderMastery();
        byId('mastery-content').querySelector('[data-perk="' + id + '"]').focus();
      };
    });
  }

  G.HideoutUI = {
    preparation: preparation, writePreparation: writePreparation, prepare: prepare, open: open,
    render: render, renderMastery: renderMastery, depart: depart
  };
})();
