// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Random tower events: a small chance (see TowerUI's EVENT_CHANCE) of a full-screen
// detour between floors, offering a risk/reward choice. Display text lives in i18n.js
// (keys follow the `event<Id>...` convention, e.g. eventMerchantTitle) since these are
// UI chrome like the waypoint screens, not data records -- this file only holds the
// ids/icons/tunable numbers ui-tower.js's event screen switches on.
(function () {
  var events = [
    { id: 'merchant', icon: 'eventMerchant', offerGoldBase: 180, offerGoldPerTier: 40 },
    { id: 'chest', icon: 'eventChest', goodChance: 0.65, trapHpPct: 0.15 },
    { id: 'shortcut', icon: 'eventShortcut', hpCostPct: 0.20 },
    { id: 'sage', icon: 'eventSage', expTradeGoldBase: 100, expTradeGoldPerTier: 20, materialTradeQty: 3 },
    { id: 'shrine', icon: 'eventShrine' },
    { id: 'companion', icon: 'eventCompanion' },
    { id: 'spring', icon: 'eventSpring' },
    { id: 'battlefield', icon: 'eventBattlefield' },
    { id: 'gambler', icon: 'eventGambler', betTiers: [0.25, 0.5, 1.0] }
  ];

  window.Game = window.Game || {};
  window.Game.Data = window.Game.Data || {};
  window.Game.Data.events = events;
  window.Game.Data.getEvent = function (id) {
    for (var i = 0; i < events.length; i++) if (events[i].id === id) return events[i];
    return null;
  };
})();
