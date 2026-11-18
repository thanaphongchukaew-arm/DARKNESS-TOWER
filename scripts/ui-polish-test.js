// Real-layout regressions for equipment, rewards, and battle command availability.
/* global window, document, getComputedStyle */
const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'tower-ui-test-'));
app.setPath('userData', profile);
app.on('window-all-closed', () => {});
for (const name of ['save:read', 'save:write', 'save:remove', 'window:isFullscreen']) ipcMain.on(name, e => { e.returnValue = name === 'save:read' ? null : true; });
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const page = async function () {
  const G = window.Game, failures = [], check = (ok, label) => { if (!ok) failures.push(label); };
  const run = G.State.createRun('normal', 'blade');
  G.State.current = run; run.level = 20; run.currentFloor = 100;
  G.Tips.setEnabled(false); G.State.fullRestore(run);
  const html = item => G.Icons.item(item);
  const shape = item => html(item).match(/data-shape="([^"]+)"/)[1];
  const weapons = ['w_knight_sword','w_storm_glaive','w_arcane_staff','w_grand_grimoire','w_soul_edge'].map(id => G.Data.getItem(id));
  check(new Set(weapons.map(shape)).size === 5, 'weapon families have distinct silhouettes');
  check(shape(G.Data.getItem('p_hp_small')) !== shape(G.Data.getItem('p_mp_small')), 'potions differ by shape');
  for (const tier of [NaN, Infinity, -4, 2.7, 99]) check(!/undefined|NaN/.test(html({kind:'weapon', tier})), 'malformed tier has safe frame');
  G.BattleUI.startBattle(100, true, false);
  check(!!document.getElementById('battle-entrance'), 'boss introduction exists');
  G.BattleUI.refreshActiveScreen();
  check(Array.from(document.querySelectorAll('#battle-actions button')).every(button => button.disabled), 'language refresh cannot unlock introduction');
  await new Promise(resolve => setTimeout(resolve, 1550));
  check(!document.getElementById('battle-entrance'), 'introduction cleans up');
  const portrait = document.querySelector('.enemy-card.boss .enemy-portrait').getBoundingClientRect();
  const name = document.querySelector('.enemy-card.boss .enemy-name').getBoundingClientRect();
  check(portrait.bottom <= name.top + 1, 'boss portrait clears name');
  run.mp = 0; G.BattleUI.refreshActiveScreen();
  document.getElementById('act-skill').click();
  check(document.querySelectorAll('.submenu-option:disabled .action-unavailable').length > 0, 'unaffordable skill gives reason');
  check(document.getElementById('act-skill').getAttribute('aria-expanded') === 'true', 'skill command marks open');
  document.getElementById('submenu-close').click();
  check(!document.getElementById('act-skill').classList.contains('is-selected'), 'close clears selection');
  G.BattleUI.cancelPlayback();
  const mage = G.State.createRun('normal','elementalist'); G.State.current = mage; mage.level = 20; G.State.fullRestore(mage);
  G.BattleUI.startBattle(2,false,false); await new Promise(resolve => setTimeout(resolve,1550));
  mage.ailments = [{id:'silence',turns:2}];
  document.getElementById('act-skill').click();
  check(Array.from(document.querySelectorAll('.action-unavailable')).some(el => /ใบ้|Silenced/.test(el.textContent)), 'silence explains blocked magic');
  document.getElementById('submenu-close').click();
  G.BattleUI.cancelPlayback();
  const healer = G.State.createRun('normal','cleric'); G.State.current = healer; healer.level = 20; G.State.fullRestore(healer);
  G.BattleUI.startBattle(2,false,false); await new Promise(resolve => setTimeout(resolve,1550));
  document.getElementById('act-skill').click();
  check(Array.from(document.querySelectorAll('.action-unavailable')).some(el => /เต็มแล้ว|HP is full/.test(el.textContent)), 'full HP explains unavailable healing');
  document.getElementById('submenu-close').click();
  // A sacrificial skill must display HP cost as well as its availability reason.
  G.BattleUI.cancelPlayback();
  const blood = G.State.createRun('normal','deathbringer'); G.State.current = blood; blood.level = 20; G.State.fullRestore(blood); blood.hp = 1;
  G.BattleUI.startBattle(2,false,false); await new Promise(resolve => setTimeout(resolve,1550));
  document.getElementById('act-skill').click();
  const pact = document.querySelector('[data-id="blood_pact"]');
  check(pact && pact.disabled && /HP/.test(pact.querySelector('.submenu-option-cost').textContent) && !!pact.querySelector('.action-unavailable'), 'HP skill shows cost and rejects lethal payment');
  G.BattleUI.cancelPlayback();
  G.State.current = run; run.currentFloor = 9; run.mp = 30;
  run.pendingReward = { floor: 8, picks: [{type:'weapon',itemId:'w_storm_glaive',qty:1},{type:'armor',itemId:'a_mystic_robe',qty:1},{type:'item',itemId:'p_mp_small',qty:2}] };
  G.TowerUI.resumePendingReward();
  await new Promise(resolve => setTimeout(resolve,1300));
  if (window.innerHeight <= 500 && window.innerWidth > window.innerHeight) {
    const tops = Array.from(document.querySelectorAll('#reward-cards .select-card')).map(el => el.getBoundingClientRect().top);
    check(Math.max(...tops) - Math.min(...tops) < 2, 'landscape rewards appear in one row');
  }
  check(document.querySelectorAll('#reward-cards .select-card').length === 3, 'saved reward choices render');
  check(document.querySelectorAll('#reward-cards .equip-compare').length === 2, 'equipment rewards show stat comparisons');
  for (const card of document.querySelectorAll('#reward-cards .select-card')) {
    check(card.scrollWidth <= card.clientWidth + 2, 'reward content fits card');
    const art = card.querySelector('.select-card-icon').getBoundingClientRect(), title = card.querySelector('.select-card-title').getBoundingClientRect();
    check(art.right <= title.left + 1 || art.bottom <= title.top + 1, 'reward art does not overlap title');
    const badge = card.querySelector('.item-art small').getBoundingClientRect(), frame = card.querySelector('.item-art').getBoundingClientRect();
    check(badge.right <= frame.right + 1 && badge.bottom <= frame.bottom + 1, 'tier badge fits frame');
  }
  check(/Chakra Petch/.test(getComputedStyle(document.querySelector('.equip-compare')).fontFamily), 'readable comparison font');
  return failures;
};
app.whenReady().then(async () => {
  let failures = [];
  try {
    for (const [label,width,height] of [['desktop',1280,800],['landscape',844,390],['portrait',390,844]]) {
      const win = new BrowserWindow({width,height,show:false,useContentSize:true,webPreferences:{preload:path.join(__dirname,'../electron/preload.js'),contextIsolation:true,sandbox:true,backgroundThrottling:false}});
      await win.loadFile(path.join(__dirname,'../index.html'), {query: label === 'desktop' ? {} : {mobile:'1'}}); await pause(350);
      const result = await win.webContents.executeJavaScript('(' + page.toString() + ')()',true);
      failures.push(...result.map(message => label + ': ' + message));
      fs.writeFileSync(path.join(os.tmpdir(),'tower-ui-' + label + '.png'),(await win.webContents.capturePage()).toPNG());
      win.destroy();
    }
  } catch (error) { failures.push(error.stack); }
  failures.forEach(message => console.error('FAIL ' + message));
  console.log(failures.length ? 'UI POLISH FAILED' : 'UI POLISH PASSED (desktop, landscape, portrait)');
  fs.rmSync(profile,{recursive:true,force:true}); app.exit(failures.length ? 1 : 0);
});
