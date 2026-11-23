// Screens + viewports shared by the visual-regression and accessibility audits.
// Each shot is [name, js run in the page (G = window.Game) after a fresh seeded run exists].
const VIEWPORTS = [['desktop', 1440, 900, false], ['phone', 390, 844, true]];
// [name, js run in the page after a fresh seeded run exists]
const SHOTS = [
  ['menu', "G.MenuUI.renderMainMenu();G.UI.showScreen('screen-menu');"],
  ['class-select', "G.State.pending={difficulty:'normal',ascension:0};G.MenuUI.renderClassSelect();G.UI.showScreen('screen-class');"],
  ['tower', "G.TowerUI.renderTower();G.UI.showScreen('screen-tower');"],
  ['status', "G.TowerUI.renderStatus();G.UI.showScreen('screen-status');"],
  ['shop', "G.TowerUI.renderShop();G.UI.showScreen('screen-shop');"],
  ['craft', "G.TowerUI.renderCraft();G.UI.showScreen('screen-craft');"],
  ['quests', "G.TowerUI.renderQuests();G.UI.showScreen('screen-quests');"],
  ['codex', "G.CodexUI.renderCodex();G.UI.showScreen('screen-codex');"],
  ['reward', "G.TowerUI.renderReward(8);G.UI.showScreen('screen-reward');"],
  ['event-merchant', "G.TowerUI.renderEvent('merchant',20);G.UI.showScreen('screen-event');"],
  ['settings', "G.SettingsUI.renderSettings();G.UI.showScreen('screen-settings');"],
  ['battle-floor1', "G.BattleUI.startBattle(1,false,false);"],
  ['battle-floor12-companion', "G.State.current.companionId='ember_fox';G.State.current.currentFloor=12;G.BattleUI.startBattle(12,false,false);"],
  ['battle-boss', "G.State.current.currentFloor=100;G.BattleUI.startBattle(100,true,false);"],
  ['battle-big-group', "G.State.current.currentFloor=71;G.BattleUI.startBattle(71,false,false);"],
  ['modal-talents', "G.SystemsUI.talentPrompt(()=>{});"]
];

module.exports = { VIEWPORTS, SHOTS };
