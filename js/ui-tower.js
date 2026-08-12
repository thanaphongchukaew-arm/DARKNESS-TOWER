// Tower map, reward screen, status/equip screen.
(function () {
  function I(name, cls) { return window.Game.Icons.get(name, cls); }
  function EN(el) { return window.Game.ElementName(el); }
  function SFX(name) { if (window.Game.Audio) window.Game.Audio.sfx(name); }
  function T(key, vars) { return window.Game.I18n.t(key, vars); }
  function L(obj, field) { return window.Game.I18n.L(obj, field); }

  function statRow(icon, label, value) {
    return '<div class="stat-row"><div class="stat-row-label">' + I(icon) + '<span>' + label + '</span></div><div class="stat-row-value">' + value + '</div></div>';
  }

  // Slots available for each equippable item kind, in fill order. Accessory
  // has two slots since the player can carry two accessories at once.
  var SLOTS_FOR_KIND = { weapon: ['weapon'], armor: ['armor'], shoes: ['shoes'], accessory: ['accessory1', 'accessory2'] };
  var SLOT_TO_KIND = { weapon: 'weapon', armor: 'armor', shoes: 'shoes', accessory1: 'accessory', accessory2: 'accessory' };

  // Newly acquired equipment (reward pick, treasure, shop purchase) auto-equips
  // itself only into an empty slot -- an already-equipped slot is left alone
  // so the player's current gear choice is never silently swapped out.
  function autoEquipIfEmpty(run, itemId) {
    var item = window.Game.Data.getItem(itemId);
    var slots = item && SLOTS_FOR_KIND[item.kind];
    if (!slots) return;
    for (var i = 0; i < slots.length; i++) {
      if (!run.equipment[slots[i]]) { window.Game.State.equip(run, itemId, slots[i]); return; }
    }
  }

  // Floors 5/10/15/20/25/30/35/40/45 each gate a one-time waypoint stop before
  // their mini-boss, cycling rest -> shop -> treasure every 5 floors.
  var WAYPOINT_FLOORS = {
    5: 'rest', 10: 'shop', 15: 'treasure', 20: 'rest', 25: 'shop', 30: 'treasure', 35: 'rest', 40: 'shop', 45: 'treasure',
    50: 'rest', 55: 'shop', 60: 'treasure', 65: 'rest', 70: 'shop', 75: 'treasure', 80: 'rest', 85: 'shop', 90: 'treasure', 95: 'rest'
  };
  function getWaypointForFloor(floor) {
    return WAYPOINT_FLOORS[floor] || null;
  }

  // After clearing a floor (or on a defensive re-check before a battle), route
  // to the gated waypoint if this floor has one and it hasn't been seen yet;
  // otherwise go straight to the tower map.
  function goToTowerOrWaypoint() {
    var run = window.Game.State.current;
    run.waypointsSeen = run.waypointsSeen || {};
    var type = getWaypointForFloor(run.currentFloor);
    if (type && !run.waypointsSeen[run.currentFloor]) {
      renderWaypoint(type, run.currentFloor);
      window.Game.UI.showScreen('screen-waypoint');
    } else {
      renderTower();
      window.Game.UI.showScreen('screen-tower');
    }
  }

  // Marks the currently-displayed waypoint as seen and persists it. Called only
  // once the player actually completes the stop (continues past rest/shop, or
  // picks a treasure card) -- not on arrival -- so a reload mid-visit doesn't
  // permanently skip the reward.
  function markWaypointSeen() {
    var run = window.Game.State.current;
    run.waypointsSeen = run.waypointsSeen || {};
    if (lastWaypoint.floor != null) run.waypointsSeen[lastWaypoint.floor] = true;
    window.Game.State.saveNow();
  }

  function renderTower() {
    var run = window.Game.State.current;
    var S = window.Game.State, D = window.Game.Data;
    var cls = D.getClass(run.classId);
    var maxHp = S.getMaxHp(run), maxMp = S.getMaxMp(run);
    var hpPct = Math.max(0, Math.round(run.hp / maxHp * 100));
    var mpPct = Math.max(0, Math.round(run.mp / maxMp * 100));

    document.getElementById('tower-hero-summary').innerHTML =
      '<div class="hero-summary-icon">' + I(cls.icon) + '</div>' +
      '<div class="hero-summary-info">' +
        '<div class="hero-summary-name">' + L(cls, 'name') + '<span class="lvl">Lv.' + run.level + '</span><span class="gold-chip">' + I('coin') + (run.gold || 0) + '</span></div>' +
        '<div class="bar-row">' + I('heart') + '<div class="bar-track"><div class="bar-fill hp" style="width:' + hpPct + '%"></div></div><span>' + run.hp + '/' + maxHp + '</span></div>' +
        '<div class="bar-row">' + I('drop') + '<div class="bar-track"><div class="bar-fill mp" style="width:' + mpPct + '%"></div></div><span>' + run.mp + '/' + maxMp + '</span></div>' +
      '</div>';

    document.getElementById('tower-status-btn').textContent = T('statusEquip');
    document.getElementById('tower-status-btn').onclick = function () {
      SFX('ui_confirm');
      renderStatus();
      window.Game.UI.showScreen('screen-status');
    };
    document.getElementById('tower-shop-btn').textContent = T('shopBtn');
    document.getElementById('tower-shop-btn').onclick = function () {
      SFX('ui_confirm');
      renderShop();
      window.Game.UI.showScreen('screen-shop');
    };
    document.getElementById('tower-craft-btn').textContent = T('craftBtn');
    document.getElementById('tower-craft-btn').onclick = function () {
      SFX('ui_confirm');
      renderCraft();
      window.Game.UI.showScreen('screen-craft');
    };
    document.getElementById('tower-survival-btn').textContent = T('survivalBtn');
    document.getElementById('tower-survival-btn').onclick = function () {
      SFX('ui_confirm');
      window.Game.MenuUI.confirmModal({
        title: T('survivalIntroTitle'),
        message: T('survivalIntroMsg'),
        confirmLabel: T('survivalIntroConfirmBtn'),
        onConfirm: function () { window.Game.BattleUI.startSurvivalSession(); }
      });
    };
    document.querySelector('#tower-quests-btn .quest-btn-label').textContent = T('questsBtn');
    document.getElementById('tower-quests-btn').onclick = function () {
      SFX('ui_confirm');
      renderQuests();
      window.Game.UI.showScreen('screen-quests');
    };
    var questBadge = document.getElementById('tower-quests-badge');
    var claimableCount = window.Game.Data.quests.filter(function (q) { return window.Game.State.isQuestClaimable(run, q); }).length;
    questBadge.textContent = claimableCount;
    questBadge.classList.toggle('hidden', claimableCount === 0);
    document.getElementById('tower-home').innerHTML = I('doorway');
    document.getElementById('tower-home').onclick = function () {
      SFX('ui_back');
      window.Game.State.saveNow();
      window.Game.MenuUI.renderMainMenu();
      window.Game.UI.showScreen('screen-menu');
    };
    document.getElementById('tower-title').textContent = T('towerTitle');

    function isBossFloor(floor) {
      return floor === 100 || !!D.getMiniBoss(floor);
    }

    // Miniboss/final-boss floors are a one-way commitment (no waypoint pause
    // to back out at once it's already been seen, and floor 100 never has one
    // at all) -- ask first so a stray click doesn't throw the player in
    // unprepared, with the option to back out and hit the shop/craft first.
    function startBattleMaybeConfirm(floor, isReplay) {
      if (!isBossFloor(floor)) {
        window.Game.BattleUI.startBattle(floor, floor === 100, isReplay);
        return;
      }
      var bossTemplate = floor === 100 ? D.boss : D.getMiniBoss(floor);
      window.Game.MenuUI.confirmModal({
        title: T('confirmBossTitle'),
        message: T('confirmBossMsg', { name: L(bossTemplate, 'name') }),
        confirmLabel: T('confirmBossFightBtn'),
        cancelLabel: T('confirmBossPrepareBtn'),
        onConfirm: function () { window.Game.BattleUI.startBattle(floor, floor === 100, isReplay); }
      });
    }

    // Shared by the current-floor row and the jump button below: enters that
    // floor's waypoint (if it has one still unseen) or straight into battle.
    function enterFloor(floor) {
      SFX('floor_select');
      var waypointType = getWaypointForFloor(floor);
      run.waypointsSeen = run.waypointsSeen || {};
      if (waypointType && !run.waypointsSeen[floor]) {
        renderWaypoint(waypointType, floor);
        window.Game.UI.showScreen('screen-waypoint');
        return;
      }
      startBattleMaybeConfirm(floor, false);
    }

    var jumpBtn = document.getElementById('tower-jump-current');
    jumpBtn.innerHTML = I('enterFloor') + '<span>' + T('towerJumpCurrent') + '</span>';
    jumpBtn.onclick = function () { enterFloor(run.currentFloor); };

    var rowsHtml = '';
    for (var i = 1; i <= 100; i++) {
      var isBoss = i === 100;
      var miniBoss = D.getMiniBoss(i);
      var state = i < run.currentFloor ? 'cleared' : (i === run.currentFloor ? 'current' : 'locked');
      var icon = state === 'cleared' ? 'check' : state === 'current' ? ((isBoss || miniBoss) ? 'crownSkull' : 'doorway') : 'lock';
      var title = isBoss ? T('bossFloorTitle') : miniBoss ? (T('floorLabel') + i + ' · ' + L(miniBoss, 'name')) : (T('floorLabel') + i);
      var sub = isBoss ? T('bossFloorSub') : miniBoss ? T('miniBossFloorSub') : (T('floorSub') + i);
      rowsHtml += '<div class="floor-row ' + state + ((isBoss || miniBoss) ? ' boss-row' : '') + '" data-floor="' + i + '">' +
        '<div class="floor-num">' + ((isBoss || miniBoss) ? I('crownSkull') : i) + '</div>' +
        '<div class="floor-info"><div class="floor-info-title">' + title + '</div><div class="floor-info-sub">' + sub + '</div></div>' +
        '<div class="floor-status-icon">' + I(icon) + '</div>' +
      '</div>';
    }
    var container = document.getElementById('tower-floors');
    container.innerHTML = rowsHtml;
    Array.prototype.forEach.call(container.querySelectorAll('.floor-row.current'), function (row) {
      row.onclick = function () { enterFloor(parseInt(row.getAttribute('data-floor'), 10)); };
    });
    // Cleared floors can be replayed (farming EXP/gold/materials at 40% rate)
    // -- no waypoint gate, no floor advance, no reward pick, ever (handled in
    // BattleUI.startBattle's isReplay flag / handleVictory).
    Array.prototype.forEach.call(container.querySelectorAll('.floor-row.cleared'), function (row) {
      row.onclick = function () {
        SFX('floor_select');
        startBattleMaybeConfirm(parseInt(row.getAttribute('data-floor'), 10), true);
      };
    });
  }

  function generateRewardChoices(floor) {
    var D = window.Game.Data, F = window.Game.Formulas, S = window.Game.State;
    var run = S.current;
    var tier = F.itemTierForFloor(floor);
    var pool = [];
    ['weapon', 'armor', 'shoes', 'accessory'].forEach(function (k) {
      D.getItemsByKindTier(k, tier).forEach(function (it) { pool.push({ type: 'equip', item: it, qty: 1 }); });
    });
    // Elixir is excluded here while on cooldown (see spendElixir in state.js) so the
    // reward/treasure pool can't hand out a "free" one that undercuts the shop's
    // one-at-a-time pacing; picking it here starts the same cooldown as buying it.
    D.items.filter(function (it) { return it.kind === 'consumable' && it.tier <= tier && !it.questOnly && (it.id !== 'p_elixir' || S.elixirAvailable(run)); }).forEach(function (it) {
      pool.push({ type: 'consumable', item: it, qty: it.id === 'p_elixir' ? 1 : (2 + Math.floor(Math.random() * 2)) });
    });
    // shuffle
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = pool[i]; pool[i] = pool[j]; pool[j] = t;
    }
    return pool.slice(0, 3);
  }

  var lastRewardFloor = null;
  var lastRewardChoices = null;

  // floor is non-null only when a battle just handed off a genuinely new
  // reward screen; a language toggle re-renders with floor=null so the
  // already-rolled choices don't get re-rolled out from under the player.
  function renderReward(floor) {
    if (floor != null) {
      lastRewardFloor = floor;
      lastRewardChoices = generateRewardChoices(floor);
    }
    var choices = lastRewardChoices;
    document.getElementById('reward-title').textContent = T('rewardClearedPrefix') + lastRewardFloor + T('rewardClearedSuffix');
    var el = document.getElementById('reward-cards');
    el.innerHTML = choices.map(function (c, idx) {
      var qtyLabel = c.qty > 1 ? ' x' + c.qty : '';
      return '<button class="select-card" data-idx="' + idx + '">' +
        '<div class="select-card-icon">' + I(c.item.icon) + '</div>' +
        '<div class="select-card-title">' + L(c.item, 'name') + qtyLabel + '</div>' +
        '<div class="select-card-desc">' + L(c.item, 'desc') + '</div>' +
      '</button>';
    }).join('');
    Array.prototype.forEach.call(el.querySelectorAll('.select-card'), function (card) {
      card.onclick = function () {
        SFX('item_get');
        var idx = parseInt(card.getAttribute('data-idx'), 10);
        var pick = choices[idx];
        var run = window.Game.State.current;
        window.Game.State.addItem(run, pick.item.id, pick.qty);
        if (pick.item.id === 'p_elixir') window.Game.State.spendElixir(run);
        autoEquipIfEmpty(run, pick.item.id);
        var maxHp = window.Game.State.getMaxHp(run), maxMp = window.Game.State.getMaxMp(run);
        run.hp = Math.min(maxHp, run.hp + Math.round(maxHp * 0.3));
        run.mp = Math.min(maxMp, run.mp + Math.round(maxMp * 0.3));
        // Passing a mini-boss floor refreshes the shop's stock -- clear it here and
        // let renderShop lazily regenerate against the new (post-clear) floor tier.
        if (window.Game.Data.getMiniBoss(lastRewardFloor)) run.shopStock = null;
        run.currentFloor += 1;
        window.Game.State.saveNow();
        goToTowerOrWaypoint();
      };
    });
  }

  var WAYPOINT_META = {
    rest: { icon: 'heart', titleKey: 'waypointRestTitle', descKey: 'waypointRestDesc' },
    shop: { icon: 'coin', titleKey: 'waypointShopTitle', descKey: 'waypointShopDesc' },
    treasure: { icon: 'gem', titleKey: 'waypointTreasureTitle', descKey: 'waypointTreasureDesc' }
  };

  var lastWaypoint = { type: null, floor: null };
  // Caches the shop stock / treasure choices rolled for the current waypoint
  // visit, keyed by type+floor, so a language-toggle re-render (which calls
  // renderWaypoint again) reuses them instead of re-rolling.
  var waypointState = { type: null, floor: null, run: null, stock: null, purchased: null, choices: null };

  function renderContinueAction() {
    var actionsEl = document.getElementById('waypoint-actions');
    actionsEl.innerHTML = '<button class="btn-primary" id="waypoint-continue">' + T('continueBtn') + '</button>';
    document.getElementById('waypoint-continue').onclick = function () {
      SFX('ui_confirm');
      markWaypointSeen();
      renderTower();
      window.Game.UI.showScreen('screen-tower');
    };
  }

  function renderRestWaypoint() {
    var run = window.Game.State.current, S = window.Game.State;
    var body = document.getElementById('waypoint-body');
    function paint() {
      var maxHp = S.getMaxHp(run), maxMp = S.getMaxMp(run);
      var hpPct = Math.max(0, Math.round(run.hp / maxHp * 100));
      var mpPct = Math.max(0, Math.round(run.mp / maxMp * 100));
      var fullyRested = run.hp >= maxHp && run.mp >= maxMp;
      body.innerHTML = '<div class="waypoint-rest-box">' +
        '<div class="bar-row">' + I('heart') + '<div class="bar-track"><div class="bar-fill hp" style="width:' + hpPct + '%"></div></div><span>' + run.hp + '/' + maxHp + '</span></div>' +
        '<div class="bar-row">' + I('drop') + '<div class="bar-track"><div class="bar-fill mp" style="width:' + mpPct + '%"></div></div><span>' + run.mp + '/' + maxMp + '</span></div>' +
        '<button class="btn-primary" id="waypoint-rest-btn"' + (fullyRested ? ' disabled' : '') + '>' + I('sparkles') + '<span>' + T('waypointRestBtn') + '</span></button>' +
      '</div>';
      var btn = document.getElementById('waypoint-rest-btn');
      if (btn) {
        btn.onclick = function () {
          SFX('heal');
          S.fullRestore(run);
          window.Game.State.saveNow();
          paint();
        };
      }
    }
    paint();
  }

  function renderShopWaypoint(floor) {
    var run = window.Game.State.current, S = window.Game.State, D = window.Game.Data, F = window.Game.Formulas;
    if (!waypointState.stock) {
      var tier = F.itemTierForFloor(floor);
      var stock = D.items.filter(function (it) { return it.kind === 'consumable' && it.id !== 'p_elixir' && it.tier <= tier && !it.questOnly; });
      for (var i = stock.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = stock[i]; stock[i] = stock[j]; stock[j] = t;
      }
      stock = stock.slice(0, 2 + tier);
      // Elixir always has exactly one bottle in stock once available -- restocks
      // ELIXIR_RESTOCK_FLOORS floors after it's bought (see state.js), guaranteed
      // rather than just another random roll among the potions above.
      var elixirItem = D.getItem('p_elixir');
      if (S.elixirAvailable(run) && elixirItem.tier <= tier) stock.push(elixirItem);
      waypointState.stock = stock;
      waypointState.purchased = {};
    }
    var stock = waypointState.stock;
    var purchased = waypointState.purchased;
    var body = document.getElementById('waypoint-body');
    function paint() {
      var goldHtml = '<div class="waypoint-gold-display">' + I('coin') + (run.gold || 0) + ' ' + T('goldLabel') + '</div>';
      var cardsHtml = stock.map(function (it) {
        var price = F.shopPrice(it);
        var bought = purchased[it.id];
        var canAfford = (run.gold || 0) >= price;
        return '<button class="select-card' + (bought ? ' locked' : '') + '" data-id="' + it.id + '"' + ((bought || !canAfford) ? ' disabled' : '') + '>' +
          '<div class="select-card-icon">' + I(it.icon) + '</div>' +
          '<div class="select-card-title">' + L(it, 'name') + '</div>' +
          '<div class="select-card-desc">' + L(it, 'desc') + '</div>' +
          '<div class="select-card-stats"><span class="stat-chip">' + (bought ? T('purchasedLabel') : (price + ' ' + T('goldLabel'))) + '</span></div>' +
        '</button>';
      }).join('');
      body.innerHTML = goldHtml + '<div class="card-grid">' + cardsHtml + '</div>';
      Array.prototype.forEach.call(body.querySelectorAll('.select-card:not([disabled])'), function (card) {
        card.onclick = function () {
          var id = card.getAttribute('data-id');
          if (id === 'p_elixir' && !S.elixirAvailable(run)) return;
          var item = D.getItem(id);
          var price = F.shopPrice(item);
          if (!S.spendGold(run, price)) return;
          purchased[id] = true;
          S.addItem(run, id, 1);
          if (id === 'p_elixir') S.spendElixir(run);
          window.Game.State.saveNow();
          SFX('item_get');
          paint();
        };
      });
    }
    paint();
  }

  function renderTreasureWaypoint(floor) {
    if (!waypointState.choices) waypointState.choices = generateRewardChoices(floor);
    var choices = waypointState.choices;
    var body = document.getElementById('waypoint-body');
    body.innerHTML = '<div class="card-grid">' + choices.map(function (c, idx) {
      var qtyLabel = c.qty > 1 ? ' x' + c.qty : '';
      return '<button class="select-card" data-idx="' + idx + '">' +
        '<div class="select-card-icon">' + I(c.item.icon) + '</div>' +
        '<div class="select-card-title">' + L(c.item, 'name') + qtyLabel + '</div>' +
        '<div class="select-card-desc">' + L(c.item, 'desc') + '</div>' +
      '</button>';
    }).join('') + '</div>';
    document.getElementById('waypoint-actions').innerHTML = '';
    Array.prototype.forEach.call(body.querySelectorAll('.select-card'), function (card) {
      card.onclick = function () {
        SFX('item_get');
        var idx = parseInt(card.getAttribute('data-idx'), 10);
        var pick = choices[idx];
        var run = window.Game.State.current;
        window.Game.State.addItem(run, pick.item.id, pick.qty);
        if (pick.item.id === 'p_elixir') window.Game.State.spendElixir(run);
        autoEquipIfEmpty(run, pick.item.id);
        markWaypointSeen();
        renderTower();
        window.Game.UI.showScreen('screen-tower');
      };
    });
  }

  function renderWaypoint(type, floor) {
    var run = window.Game.State.current;
    if (waypointState.type !== type || waypointState.floor !== floor || waypointState.run !== run) {
      waypointState = { type: type, floor: floor, run: run, stock: null, purchased: null, choices: null };
    }
    lastWaypoint = { type: type, floor: floor };
    var meta = WAYPOINT_META[type];
    document.getElementById('waypoint-icon').innerHTML = I(meta.icon);
    document.getElementById('waypoint-title').textContent = T(meta.titleKey);
    document.getElementById('waypoint-desc').textContent = T(meta.descKey);
    if (type === 'rest') { renderRestWaypoint(); renderContinueAction(); }
    else if (type === 'shop') { renderShopWaypoint(floor); renderContinueAction(); }
    else { renderTreasureWaypoint(floor); }
  }

  // Persistent shop (accessible any time from the tower map). Stock is generated
  // against the current floor's tier and stored on run.shopStock so it survives
  // navigation/reloads; it's cleared (forcing a fresh roll) whenever the player
  // clears a mini-boss floor -- see the reward pick handler above.
  function shuffled(arr) {
    var copy = arr.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = copy[i]; copy[i] = copy[j]; copy[j] = t;
    }
    return copy;
  }

  // Counts mini-bosses (floors 5, 10, 15, ...) already cleared as of `floor` --
  // each one nudges the shop's consumable stock depth up a notch, on top of
  // the tier-based baseline, so restocks keep growing between tier jumps too.
  function minibossesCleared(floor) {
    var minibosses = window.Game.Data.minibosses;
    var count = 0;
    for (var f in minibosses) { if (Number(f) < floor) count++; }
    return count;
  }

  // Both the variety (how many distinct items appear per category) and the
  // stock depth (how many copies of each are for sale) grow with the floor
  // tier, so higher-tier shops feel bigger and better stocked, not just
  // pricier. slice() naturally caps at whatever the tier's item pool holds,
  // so these counts can exceed the pool size without needing extra clamping.
  function generateShopStock(run) {
    var D = window.Game.Data, F = window.Game.Formulas, S = window.Game.State;
    var floor = run.currentFloor;
    var tier = F.tierForFloor(floor);
    var bonus = minibossesCleared(floor);
    function entries(kind, n, maxQty) {
      return shuffled(D.items.filter(function (it) { return it.kind === kind && it.tier <= tier && !it.craftOnly && !it.questOnly; }))
        .slice(0, n)
        .map(function (it) { return { id: it.id, maxQty: maxQty, qty: maxQty }; });
    }
    var materialMaxQty = 2 + tier + Math.floor(bonus / 2); // 3, 4, 5, 6, 7 baseline, grows with mini-boss clears too
    var stock = [].concat(
      entries('weapon', 1 + tier, 1),
      entries('armor', 1 + tier, 1),
      entries('shoes', Math.ceil(tier / 2), 1),
      entries('accessory', 1 + tier, 1),
      // Only a handful of materials per tier show up here (n === tier, never
      // the full pool) -- the shop is a supplemental source, monster drops
      // stay the main way to stock up for crafting.
      entries('material', tier, materialMaxQty)
    );
    var potionMaxQty = 4 + (tier - 1) * 2 + bonus; // 4, 6, 8, 10, 12 baseline, +1 per mini-boss cleared
    var rareMaxQty = 2 + Math.floor((tier - 1) / 2) + Math.floor(bonus / 3); // 2, 2, 3, 3, 4 baseline -- scroll
    var scroll = D.getItem('skill_scroll');
    if (scroll && scroll.tier <= tier) stock.push({ id: scroll.id, maxQty: rareMaxQty, qty: rareMaxQty });
    shuffled(D.items.filter(function (it) { return it.kind === 'consumable' && it.tier <= tier && it.id !== 'skill_scroll' && it.id !== 'p_elixir' && !it.questOnly; }))
      .slice(0, 2 + tier)
      .forEach(function (it) {
        stock.push({ id: it.id, maxQty: potionMaxQty, qty: potionMaxQty });
      });
    // Elixir always has exactly one bottle in stock once available -- restocks
    // ELIXIR_RESTOCK_FLOORS floors after it's bought (see state.js), guaranteed
    // rather than just another random roll in the consumable pool above.
    var elixirItem = D.getItem('p_elixir');
    if (S.elixirAvailable(run) && elixirItem.tier <= tier) stock.push({ id: elixirItem.id, maxQty: 1, qty: 1 });
    return stock;
  }

  function ensureShopStock(run) {
    if (!run.shopStock) run.shopStock = generateShopStock(run);
    return run.shopStock;
  }

  var SHOP_KIND_ORDER = ['weapon', 'armor', 'shoes', 'accessory', 'material', 'consumable'];
  var SHOP_KIND_LABEL_KEY = { weapon: 'weaponLabel', armor: 'armorLabel', shoes: 'shoesLabel', accessory: 'accessoryLabel', material: 'shopMaterialsLabel', consumable: 'shopConsumablesLabel' };

  // Persists across renderShop() calls (re-renders on language toggle, tab
  // switch, etc.) so the player doesn't get bounced back to Buy every time.
  var shopMode = 'buy';

  function renderShop() {
    var run = window.Game.State.current, S = window.Game.State, D = window.Game.Data, F = window.Game.Formulas;
    var stock = ensureShopStock(run);
    document.getElementById('shop-header-title').textContent = T('shopScreenTitle');
    document.getElementById('shop-reset-note').textContent = T(shopMode === 'buy' ? 'shopResetNote' : 'shopSellNote');
    document.getElementById('shop-back').innerHTML = I('back');
    document.getElementById('shop-back').onclick = function () { SFX('ui_back'); renderTower(); window.Game.UI.showScreen('screen-tower'); };

    document.getElementById('shop-tabs').innerHTML =
      '<button class="' + (shopMode === 'buy' ? 'btn-primary' : 'btn-secondary') + '" id="shop-tab-buy">' + T('shopTabBuy') + '</button>' +
      '<button class="' + (shopMode === 'sell' ? 'btn-primary' : 'btn-secondary') + '" id="shop-tab-sell">' + T('shopTabSell') + '</button>';
    document.getElementById('shop-tab-buy').onclick = function () { SFX('ui_confirm'); shopMode = 'buy'; renderShop(); };
    document.getElementById('shop-tab-sell').onclick = function () { SFX('ui_confirm'); shopMode = 'sell'; renderShop(); };

    function paintBuy() {
      document.getElementById('shop-gold').innerHTML = I('coin') + (run.gold || 0) + ' ' + T('goldLabel');
      var byKind = {};
      stock.forEach(function (entry) {
        var item = D.getItem(entry.id);
        if (!item) return;
        (byKind[item.kind] = byKind[item.kind] || []).push(entry);
      });
      var html = SHOP_KIND_ORDER.filter(function (k) { return byKind[k] && byKind[k].length; }).map(function (kind) {
        var cardsHtml = byKind[kind].map(function (entry) {
          var item = D.getItem(entry.id);
          var price = F.shopPrice(item);
          var soldOut = entry.qty <= 0;
          var canAfford = (run.gold || 0) >= price;
          return '<button class="select-card' + (soldOut ? ' locked' : '') + '" data-id="' + entry.id + '"' + ((soldOut || !canAfford) ? ' disabled' : '') + '>' +
            '<div class="select-card-icon">' + I(item.icon) + '</div>' +
            '<div class="select-card-title">' + L(item, 'name') + '</div>' +
            '<div class="select-card-desc">' + L(item, 'desc') + '</div>' +
            '<div class="select-card-stats">' +
              '<span class="stat-chip">' + (soldOut ? T('shopOutOfStock') : (price + ' ' + T('goldLabel'))) + '</span>' +
              (entry.maxQty > 1 ? '<span class="stat-chip">' + T('shopStockLeft', { qty: entry.qty }) + '</span>' : '') +
            '</div>' +
          '</button>';
        }).join('');
        return '<div class="guide-section"><h3>' + T(SHOP_KIND_LABEL_KEY[kind]) + '</h3><div class="card-grid">' + cardsHtml + '</div></div>';
      }).join('');
      document.getElementById('shop-content').innerHTML = html;
      Array.prototype.forEach.call(document.querySelectorAll('#shop-content .select-card:not([disabled])'), function (card) {
        card.onclick = function () {
          var id = card.getAttribute('data-id');
          var entry = stock.filter(function (e) { return e.id === id; })[0];
          if (!entry || entry.qty <= 0) return;
          if (id === 'p_elixir' && !S.elixirAvailable(run)) return;
          var item = D.getItem(id);
          var price = F.shopPrice(item);
          if (!S.spendGold(run, price)) return;
          entry.qty -= 1;
          S.addItem(run, id, 1);
          if (id === 'p_elixir') S.spendElixir(run);
          autoEquipIfEmpty(run, id);
          window.Game.State.saveNow();
          SFX('item_get');
          paintBuy();
        };
      });
    }

    // Sell view lists whatever's actually sitting in the bag (equipped gear
    // never shows up here -- it's held in run.equipment, not run.inventory).
    function paintSell() {
      document.getElementById('shop-gold').innerHTML = I('coin') + (run.gold || 0) + ' ' + T('goldLabel');
      var byKind = {};
      Object.keys(run.inventory).forEach(function (id) {
        if ((run.inventory[id] || 0) <= 0) return;
        var item = D.getItem(id);
        if (!item) return;
        (byKind[item.kind] = byKind[item.kind] || []).push(item);
      });
      var html = SHOP_KIND_ORDER.filter(function (k) { return byKind[k] && byKind[k].length; }).map(function (kind) {
        var cardsHtml = byKind[kind].map(function (item) {
          var qty = run.inventory[item.id] || 0;
          var price = F.sellPrice(item, run.currentFloor);
          return '<button class="select-card" data-id="' + item.id + '">' +
            '<div class="select-card-icon">' + I(item.icon) + '</div>' +
            '<div class="select-card-title">' + L(item, 'name') + '</div>' +
            '<div class="select-card-desc">' + L(item, 'desc') + '</div>' +
            '<div class="select-card-stats">' +
              '<span class="stat-chip">' + T('shopSellPrice', { price: price }) + '</span>' +
              '<span class="stat-chip">' + T('shopStockLeft', { qty: qty }) + '</span>' +
            '</div>' +
          '</button>';
        }).join('');
        return '<div class="guide-section"><h3>' + T(SHOP_KIND_LABEL_KEY[kind]) + '</h3><div class="card-grid">' + cardsHtml + '</div></div>';
      }).join('');
      document.getElementById('shop-content').innerHTML = html || ('<p class="empty-note">' + T('shopSellEmptyNote') + '</p>');
      Array.prototype.forEach.call(document.querySelectorAll('#shop-content .select-card'), function (card) {
        card.onclick = function () {
          var id = card.getAttribute('data-id');
          var earned = S.sellItem(run, id, 1);
          if (!earned) return;
          window.Game.State.saveNow();
          SFX('item_get');
          paintSell();
        };
      });
    }

    if (shopMode === 'sell') paintSell(); else paintBuy();
  }

  // Crafting bench (persistent, always accessible from the tower map). Unlike
  // the shop, there's no stock/qty to track -- every recipe unlocked at the
  // current floor tier is always listed, and materials in the player's
  // inventory (dropped by defeated monsters) are what actually gate crafting.
  function renderCraft() {
    var run = window.Game.State.current, S = window.Game.State, D = window.Game.Data, F = window.Game.Formulas;
    document.getElementById('craft-header-title').textContent = T('craftScreenTitle');
    document.getElementById('craft-note').textContent = T('craftNote');
    document.getElementById('craft-back').innerHTML = I('back');
    document.getElementById('craft-back').onclick = function () { SFX('ui_back'); renderTower(); window.Game.UI.showScreen('screen-tower'); };

    function paint() {
      document.getElementById('craft-gold').innerHTML = I('coin') + (run.gold || 0) + ' ' + T('goldLabel');
      var tier = F.tierForFloor(run.currentFloor);
      var recipes = D.getRecipesByTier(tier);
      var html = recipes.map(function (recipe) {
        var result = D.getItem(recipe.resultId);
        var goldCost = recipe.gold || 0;
        var goldOk = (run.gold || 0) >= goldCost;
        var matsOk = true;
        var matsHtml = recipe.materials.map(function (m) {
          var mat = D.getItem(m.id);
          var have = run.inventory[m.id] || 0;
          var ok = have >= m.qty;
          if (!ok) matsOk = false;
          return '<div class="craft-mat-row' + (ok ? '' : ' craft-mat-short') + '">' + I(mat.icon) +
            '<span class="craft-mat-name">' + L(mat, 'name') + '</span>' +
            '<span class="craft-mat-count">' + have + '/' + m.qty + '</span></div>';
        }).join('');
        var canCraft = matsOk && goldOk;
        return '<div class="craft-card">' +
          '<div class="select-card-icon">' + I(result.icon) + '</div>' +
          '<div class="select-card-title">' + L(result, 'name') + '</div>' +
          '<div class="select-card-desc">' + L(result, 'desc') + '</div>' +
          '<div class="craft-materials">' + matsHtml + '</div>' +
          '<div class="select-card-stats"><span class="stat-chip">' + T('craftGoldLabel') + ': ' + goldCost + ' ' + T('goldLabel') + '</span></div>' +
          '<button class="btn-primary craft-btn" data-recipe="' + recipe.id + '"' + (canCraft ? '' : ' disabled') + '>' + T('craftBtn') + '</button>' +
        '</div>';
      }).join('');
      document.getElementById('craft-content').innerHTML = recipes.length ?
        ('<div class="card-grid">' + html + '</div>') :
        ('<p class="empty-note">' + T('craftEmptyNote') + '</p>');
      Array.prototype.forEach.call(document.querySelectorAll('#craft-content .craft-btn:not([disabled])'), function (btn) {
        btn.onclick = function () {
          var recipeId = btn.getAttribute('data-recipe');
          if (!S.craftItem(run, recipeId)) return;
          var recipe = D.getRecipe(recipeId);
          autoEquipIfEmpty(run, recipe.resultId);
          window.Game.State.saveNow();
          SFX('item_get');
          paint();
        };
      });
    }
    paint();
  }

  // Small reward-chip strip shown on each quest card (and reused by the claim-all
  // summary popup below) -- gold/exp first, then one chip per item reward.
  function questRewardChipsHtml(reward) {
    var chips = '';
    if (reward.gold) chips += '<span class="stat-chip">' + I('coin') + ' +' + reward.gold + '</span>';
    if (reward.exp) chips += '<span class="stat-chip">' + I('gem') + ' +' + reward.exp + ' EXP</span>';
    (reward.items || []).forEach(function (it) {
      var item = window.Game.Data.getItem(it.id);
      if (!item) return;
      chips += '<span class="stat-chip">' + I(item.icon) + ' ' + L(item, 'name') + (it.qty > 1 ? ' x' + it.qty : '') + '</span>';
    });
    return chips;
  }

  // Popup shown after "Claim All" -- lists the merged total of everything just
  // collected in that one action (not the running lifetime total).
  function showQuestClaimSummary(total) {
    var D = window.Game.Data;
    var statsHtml =
      (total.gold ? '<div class="stat-row"><div class="stat-row-label">' + I('coin') + '<span>' + T('goldLabel') + '</span></div><div class="stat-row-value">+' + total.gold + '</div></div>' : '') +
      (total.exp ? '<div class="stat-row"><div class="stat-row-label">' + I('gem') + '<span>EXP</span></div><div class="stat-row-value">+' + total.exp + '</div></div>' : '');
    var itemIds = Object.keys(total.items);
    var itemsHtml = itemIds.map(function (id) {
      var it = D.getItem(id);
      if (!it) return '';
      return '<div class="inv-item"><div class="inv-item-icon">' + I(it.icon) + '</div>' +
        '<div class="inv-item-info"><div class="inv-item-name">' + L(it, 'name') + '</div></div>' +
        '<div class="inv-item-actions"><span class="inv-item-count">x' + total.items[id] + '</span></div></div>';
    }).join('');
    var root = document.getElementById('modal-root');
    root.innerHTML = '<div class="modal-box"><h3>' + T('questsClaimSummaryTitle') + '</h3>' +
      '<div class="status-stats" style="margin:0.75rem 0; text-align:left; max-height:40vh; overflow-y:auto;">' +
        (statsHtml + itemsHtml) +
      '</div>' +
      '<button class="btn-primary" id="quests-summary-close">' + T('closeBtn') + '</button></div>';
    root.classList.remove('hidden');
    document.getElementById('quests-summary-close').onclick = function () { SFX('ui_confirm'); root.classList.add('hidden'); root.innerHTML = ''; };
  }

  // Quests screen (persistent, always accessible from the tower map). There is
  // no "accept" step -- every quest in data-quests.js is always active, and its
  // progress bar just reflects the run's live state (State.getQuestProgress).
  // Each card gets its own claim button once done; "Claim All" above the grid
  // sweeps every claimable quest in one action and pops a merged summary.
  function renderQuests() {
    var run = window.Game.State.current, S = window.Game.State, D = window.Game.Data;
    document.getElementById('quests-header-title').textContent = T('questsScreenTitle');
    document.getElementById('quests-note').textContent = T('questsNote');
    document.getElementById('quests-back').innerHTML = I('back');
    document.getElementById('quests-back').onclick = function () { SFX('ui_back'); renderTower(); window.Game.UI.showScreen('screen-tower'); };

    function paint() {
      var claimableCount = D.quests.filter(function (q) { return S.isQuestClaimable(run, q); }).length;
      var claimAllBtn = document.getElementById('quests-claim-all-btn');
      claimAllBtn.textContent = T('questsClaimAllBtn') + (claimableCount ? ' (' + claimableCount + ')' : '');
      claimAllBtn.disabled = claimableCount === 0;

      var html = D.quests.map(function (q) {
        var progress = S.getQuestProgress(run, q);
        var claimed = !!run.questsClaimed[q.id];
        var claimable = !claimed && progress.done;
        var statusTag = claimed ? T('questClaimedTag') : claimable ? T('questReadyTag') : T('questInProgressTag');
        return '<div class="craft-card' + (claimed ? ' locked' : '') + '">' +
          '<div class="select-card-icon">' + I(q.icon) + '</div>' +
          '<div class="select-card-title">' + L(q, 'name') + '</div>' +
          '<div class="select-card-desc">' + L(q, 'desc') + '</div>' +
          '<div class="craft-materials"><div class="craft-mat-row' + (progress.done ? '' : ' craft-mat-short') + '">' +
            '<span class="craft-mat-name">' + T('questProgressLabel') + '</span>' +
            '<span class="craft-mat-count">' + Math.min(progress.current, progress.target) + '/' + progress.target + '</span>' +
          '</div></div>' +
          '<div class="select-card-stats">' + questRewardChipsHtml(q.reward) + '<span class="stat-chip">' + statusTag + '</span></div>' +
          (claimable ? '<button class="btn-primary craft-btn" data-quest="' + q.id + '">' + T('questClaimBtn') + '</button>' : '') +
        '</div>';
      }).join('');
      document.getElementById('quests-content').innerHTML = '<div class="card-grid">' + html + '</div>';

      Array.prototype.forEach.call(document.querySelectorAll('#quests-content .craft-btn'), function (btn) {
        btn.onclick = function () {
          var reward = S.claimQuest(run, btn.getAttribute('data-quest'));
          if (!reward) return;
          window.Game.State.saveNow();
          SFX('item_get');
          paint();
        };
      });
    }
    paint();

    document.getElementById('quests-claim-all-btn').onclick = function () {
      var total = S.claimAllQuests(run);
      if (!total.gold && !total.exp && !Object.keys(total.items).length) return;
      window.Game.State.saveNow();
      SFX('item_get');
      showQuestClaimSummary(total);
      paint();
    };
  }

  function openEquipPicker(slot) {
    var run = window.Game.State.current, D = window.Game.Data;
    var kind = SLOT_TO_KIND[slot];
    var candidates = Object.keys(run.inventory).map(function (id) { return D.getItem(id); }).filter(function (it) { return it && it.kind === kind; });
    var currentId = run.equipment[slot];
    var listHtml = candidates.length ? candidates.map(function (it) {
      return '<button class="submenu-option" data-id="' + it.id + '">' +
        '<div class="submenu-option-icon">' + I(it.icon) + '</div>' +
        '<div class="submenu-option-info"><div class="submenu-option-name">' + L(it, 'name') + '</div><div class="submenu-option-desc">' + L(it, 'desc') + '</div></div>' +
      '</button>';
    }).join('') : '<p class="empty-note">' + T('noEquipInInventory') + '</p>';
    var root = document.getElementById('modal-root');
    root.innerHTML = '<div class="modal-box"><h3>' + T('chooseEquipTitle') + '</h3><div class="submenu-list">' + listHtml + '</div>' +
      (currentId ? '<button class="btn-danger" id="unequip-btn">' + T('unequipBtn') + '</button>' : '') +
      '<button class="btn-ghost" id="modal-cancel">' + T('closeBtn') + '</button></div>';
    root.classList.remove('hidden');
    function close() { root.classList.add('hidden'); root.innerHTML = ''; }
    document.getElementById('modal-cancel').onclick = function () { SFX('ui_cancel'); close(); };
    Array.prototype.forEach.call(root.querySelectorAll('.submenu-option'), function (btn) {
      btn.onclick = function () {
        SFX('item_use');
        window.Game.State.equip(run, btn.getAttribute('data-id'), slot);
        window.Game.State.saveNow();
        close();
        renderStatus();
      };
    });
    var unequipBtn = document.getElementById('unequip-btn');
    if (unequipBtn) {
      unequipBtn.onclick = function () {
        SFX('ui_back');
        window.Game.State.unequip(run, slot);
        window.Game.State.saveNow();
        close();
        renderStatus();
      };
    }
  }

  function renderStatus() {
    var run = window.Game.State.current;
    var S = window.Game.State, D = window.Game.Data;
    var cls = D.getClass(run.classId);
    var total = S.getTotalStats(run);
    var maxHp = total.hp, maxMp = total.mp;

    document.getElementById('status-header-title').textContent = T('statusScreenTitle');

    document.getElementById('status-stats').innerHTML =
      '<div class="status-panel-title">' + T('statusPanelTitle') + '</div>' +
      statRow('heart', 'HP', run.hp + '/' + maxHp) +
      statRow('drop', 'MP', run.mp + '/' + maxMp) +
      statRow('swordAttack', 'ATK', total.atk) +
      statRow('magicBurst', 'MAG', total.mag) +
      statRow('shieldGuard', 'DEF', total.def) +
      statRow('sparkles', 'RES', total.res) +
      statRow('wind', 'SPD', total.spd) +
      statRow('star', 'LUK', total.luk) +
      statRow(cls.weak, T('weakLabel'), EN(cls.weak)) +
      statRow(cls.resist, T('resistLabel'), EN(cls.resist)) +
      '<div class="bar-row" style="margin-top:.6rem">' + I('gem') + '<div class="bar-track"><div class="bar-fill exp" style="width:' + Math.round(run.exp / run.expNext * 100) + '%"></div></div><span>' + run.exp + '/' + run.expNext + '</span></div>';

    var SLOT_DEFAULT_ICON = { weapon: 'weaponSlot', armor: 'armorSlot', shoes: 'shoesSlot', accessory1: 'accessorySlot', accessory2: 'accessorySlot' };
    function slotHtml(slot, label) {
      var id = run.equipment[slot];
      var item = id ? D.getItem(id) : null;
      return '<div class="equip-slot" data-slot="' + slot + '">' +
        '<div class="equip-slot-icon">' + I(item ? item.icon : SLOT_DEFAULT_ICON[slot]) + '</div>' +
        '<div class="equip-slot-info">' +
          '<div class="equip-slot-name">' + label + (item ? ': ' + L(item, 'name') : '') + '</div>' +
          '<div class="equip-slot-desc">' + (item ? L(item, 'desc') : T('emptySlot')) + '</div>' +
        '</div>' +
      '</div>';
    }
    var equipEl = document.getElementById('status-equipment');
    equipEl.innerHTML = '<div class="status-panel-title">' + T('equipPanelTitle') + '</div>' +
      slotHtml('weapon', T('weaponLabel')) + slotHtml('armor', T('armorLabel')) + slotHtml('shoes', T('shoesLabel')) +
      slotHtml('accessory1', T('accessoryLabelN', { n: 1 })) + slotHtml('accessory2', T('accessoryLabelN', { n: 2 }));
    Array.prototype.forEach.call(equipEl.querySelectorAll('.equip-slot'), function (row) {
      row.onclick = function () { SFX('ui_confirm'); openEquipPicker(row.getAttribute('data-slot')); };
    });

    var invItems = Object.keys(run.inventory).map(function (id) { return D.getItem(id); }).filter(function (it) { return it && (it.kind === 'consumable' || it.kind === 'material'); });
    var invHtml = invItems.length ? invItems.map(function (it) {
      var qty = run.inventory[it.id];
      return '<div class="inv-item"><div class="inv-item-icon">' + I(it.icon) + '</div>' +
        '<div class="inv-item-info"><div class="inv-item-name">' + L(it, 'name') + '</div><div class="inv-item-desc">' + L(it, 'desc') + '</div></div>' +
        '<div class="inv-item-actions"><span class="inv-item-count">x' + qty + '</span>' +
        (it.kind === 'consumable' ? '<button class="btn-secondary" data-use="' + it.id + '">' + T('useBtn') + '</button>' : '') + '</div></div>';
    }).join('') : '<p class="empty-note">' + T('emptyInventory') + '</p>';
    var invEl = document.getElementById('status-inventory');
    invEl.innerHTML = '<div class="status-panel-title">' + T('inventoryPanelTitle') + '</div>' + invHtml;
    Array.prototype.forEach.call(invEl.querySelectorAll('[data-use]'), function (btn) {
      btn.onclick = function () {
        SFX('item_use');
        window.Game.State.useConsumable(run, btn.getAttribute('data-use'));
        window.Game.State.saveNow();
        renderStatus();
      };
    });

    document.getElementById('status-back').innerHTML = I('back');
    document.getElementById('status-back').onclick = function () { SFX('ui_back'); renderTower(); window.Game.UI.showScreen('screen-tower'); };
  }

  // Re-render whichever of these screens is currently active, called after a language switch.
  function refreshActiveScreen() {
    var active = document.querySelector('.screen.active');
    if (!active) return;
    if (active.id === 'screen-tower') renderTower();
    else if (active.id === 'screen-status') renderStatus();
    else if (active.id === 'screen-shop') renderShop();
    else if (active.id === 'screen-craft') renderCraft();
    else if (active.id === 'screen-quests') renderQuests();
    else if (active.id === 'screen-reward') renderReward(null);
    else if (active.id === 'screen-waypoint' && lastWaypoint.type) renderWaypoint(lastWaypoint.type, lastWaypoint.floor);
  }

  window.Game = window.Game || {};
  window.Game.TowerUI = {
    renderTower: renderTower,
    renderReward: renderReward,
    renderStatus: renderStatus,
    renderShop: renderShop,
    renderCraft: renderCraft,
    renderQuests: renderQuests,
    refreshActiveScreen: refreshActiveScreen
  };
})();
