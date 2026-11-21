// Real-layout regressions for equipment, rewards, and battle command availability.
/* global window, document, getComputedStyle, KeyboardEvent */
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
  const click = id => { const el = document.getElementById(id); if (!el) throw new Error('Missing ' + id + ' on ' + document.querySelector('.screen.active').id); el.click(); };
  // Deterministic layout fixtures; smoke tests exercise natural initiative/groups.
  let observed;
  const createBattle = G.BattleEngine.createBattle;
  G.BattleEngine.createBattle = function () {
    observed = createBattle.apply(this, arguments); observed.pendingFirstStrike = false;
    if (arguments[1] === 12 && observed.enemies.length === 1) observed.enemies.push(Object.assign({}, observed.enemies[0], {uid:'test-e1'}));
    return observed;
  };
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
  check(portrait.bottom <= name.top + 1 || portrait.right <= name.left + 1, 'boss portrait clears name');
  check(document.querySelector('.enemy-card.boss').getBoundingClientRect().bottom <= document.getElementById('battle-log').getBoundingClientRect().top + 2, 'boss card does not overlap battle log');
  run.mp = 0; G.BattleUI.refreshActiveScreen();
  click('act-skill');
  check(document.querySelectorAll('.submenu-option:disabled .action-unavailable').length > 0, 'unaffordable skill gives reason');
  check(document.getElementById('act-skill').getAttribute('aria-expanded') === 'true', 'skill command marks open');
  click('submenu-close');
  check(!document.getElementById('act-skill').classList.contains('is-selected'), 'close clears selection');
  G.BattleUI.cancelPlayback();
  const mage = G.State.createRun('normal','elementalist'); G.State.current = mage; mage.level = 20; G.State.fullRestore(mage);
  G.BattleUI.startBattle(2,false,false); await new Promise(resolve => setTimeout(resolve,1550));
  mage.ailments = [{id:'silence',turns:2}];
  click('act-skill');
  check(Array.from(document.querySelectorAll('.action-unavailable')).some(el => /ใบ้|Silenced/.test(el.textContent)), 'silence explains blocked magic');
  click('submenu-close');
  G.BattleUI.cancelPlayback();
  const healer = G.State.createRun('normal','cleric'); G.State.current = healer; healer.level = 20; G.State.fullRestore(healer);
  G.BattleUI.startBattle(2,false,false); await new Promise(resolve => setTimeout(resolve,1550));
  click('act-skill');
  check(Array.from(document.querySelectorAll('.action-unavailable')).some(el => /เต็มแล้ว|HP is full/.test(el.textContent)), 'full HP explains unavailable healing');
  click('submenu-close');
  // A sacrificial skill must display HP cost as well as its availability reason.
  G.BattleUI.cancelPlayback();
  const blood = G.State.createRun('normal','deathbringer'); G.State.current = blood; blood.level = 20; G.State.fullRestore(blood); blood.hp = 1;
  G.BattleUI.startBattle(2,false,false); await new Promise(resolve => setTimeout(resolve,1550));
  click('act-skill');
  const pact = document.querySelector('[data-id="blood_pact"]');
  check(pact && pact.disabled && /HP/.test(pact.querySelector('.submenu-option-cost').textContent) && !!pact.querySelector('.action-unavailable'), 'HP skill shows cost and rejects lethal payment');
  G.BattleUI.cancelPlayback();
  G.State.current = run; G.State.fullRestore(run);
  G.BattleUI.startBattle(100,true,false); await new Promise(resolve => setTimeout(resolve,1550));
  observed.enemies[0].hp = Math.floor(observed.enemies[0].maxHp * .7);
  observed.player.atk = 1; observed.playerAP = 2;
  click('act-attack');
  for (let n=0;n<100 && !document.querySelector('.enemy-art[data-phase="2"]');n++) await new Promise(resolve=>setTimeout(resolve,80));
  check(!!document.querySelector('.enemy-art[data-phase="2"] image[href="assets/pixel16/monsters/timeless_sovereign-phase-2.png"]'), 'phase event changes actual sovereign illustration');
  check(/2\s*\/\s*4/.test(document.querySelector('.boss-phase-chip').textContent), 'phase label updates at the same impact as the illustration');
  G.BattleUI.cancelPlayback(); G.State.fullRestore(run);
  G.BattleUI.startBattle(12,false,false); await new Promise(resolve=>setTimeout(resolve,1550));
  check(document.querySelectorAll('.enemy-role-label').length === observed.enemies.length, 'all enemies have visible role labels');
  check(document.querySelectorAll('#battle-zone-props .zone-illustration').length === 3, 'real zone renders scenery illustrations');
  observed.enemies[0].ailments = [{id:'poison',turns:2}]; G.BattleUI.refreshActiveScreen();
  click('act-attack');
  const target = document.querySelector('.enemy-card.targetable');
  check(target && target.getAttribute('role') === 'button' && target.tabIndex === 0, 'target can be selected by keyboard');
  check(/เลือกเป้าหมาย|Choose a target/.test(document.getElementById('battle-state-cue').textContent), 'target selection has clear instruction');
  document.querySelector('.enemy-card.targetable .status-chip').click();
  check(!!document.getElementById('target-cancel'), 'reading target status does not commit an attack');
  if (!document.getElementById('target-cancel')) throw new Error('Target not entered: ' + JSON.stringify({count:observed.enemies.length,alive:observed.enemies.filter(e=>e.alive).length,ap:observed.playerAP,over:observed.over,disabled:document.getElementById('act-attack').disabled,cue:document.getElementById('battle-state-cue').textContent}));
  document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  check(!!document.getElementById('target-cancel'), 'Escape closes status before leaving target selection');
  target.focus();
  document.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));
  check(!!document.activeElement.closest('.enemy-card.targetable'), 'arrow navigation reaches target cards outside hint submenu');
  document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  check(!document.getElementById('target-cancel'), 'Escape cancels targeting without opening retreat dialog');
  check(document.querySelector('.turn-chip[data-actor="player"]').classList.contains('active'), 'cancel restores player indicator');
  run.ailments = [{id:'poison',turns:3},{id:'burn',turns:2},{id:'silence',turns:1}]; G.BattleUI.refreshActiveScreen();
  const status = document.querySelector('#screen-battle .status-chip'); status.click();
  check(getComputedStyle(status.querySelector('.status-tip')).display !== 'none', 'tap exposes status explanation');
  check(!!status.getAttribute('aria-label'), 'keyboard and screen reader can read status explanation');
  document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  check(!status.classList.contains('is-open'), 'Escape dismisses status explanation');
  check(document.querySelectorAll('.status-turns').length >= 3, 'status chips include remaining turns');
  G.BattleUI.cancelPlayback(); G.BattleEngine.createBattle = createBattle;
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
