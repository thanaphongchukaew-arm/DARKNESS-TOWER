// Supplement the main UI audit with secondary screens and real dialogs.
const {app,BrowserWindow}=require('electron');
const fs=require('fs'),path=require('path'),os=require('os');
const OUT=path.resolve('previews/extra-ui');fs.mkdirSync(OUT,{recursive:true});
app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'tower-extra-')));
app.on('window-all-closed',()=>{});
app.whenReady().then(async()=>{
 const report={views:[],interactions:[],errors:[]};
 for(const [tag,width,height] of [['desktop',1440,960],['mobile',390,844],['landscape',844,390]]){
  const w=new BrowserWindow({width,height,useContentSize:true,show:false,webPreferences:{contextIsolation:false,backgroundThrottling:false}});
  w.webContents.on('console-message',e=>{if(e.level==='error'&&/Uncaught|TypeError|ReferenceError/.test(e.message))report.errors.push(e.message);});
  await w.loadURL(require('url').pathToFileURL(path.resolve('index.html')).href+(tag==='desktop'?'':'?mobile=1'));
  const run=s=>w.webContents.executeJavaScript('(async()=>{const G=Game;'+s+'})()');
  await run(`await document.fonts.ready;G.Tips.setEnabled(false);document.querySelector('#tip-card-ok')?.click();const s=document.createElement('style');s.textContent='*{animation:none!important;transition:none!important}';document.head.appendChild(s);`);
  for(const lang of ['th','en']){
   await run(`G.I18n.setLang('${lang}');`);
   const setup=`document.querySelector('#modal-root').classList.add('hidden');document.querySelector('#modal-root').innerHTML='';G.State.createRun('nightmare','blade');G.State.current.gold=100000;G.Data.items.forEach(i=>G.State.addItem(G.State.current,i.id,3));`;
   async function shot(name,code){await run(code);await run(`await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));window.scrollTo(0,0);`);await new Promise(r=>setTimeout(r,80));const m=await run(`const modal=document.querySelector('#modal-root:not(.hidden)'),root=modal||document.querySelector('.screen.active');const b=modal?.querySelector('.modal-box')?.getBoundingClientRect();return {screen:document.querySelector('.screen.active').id,overflow:document.body.scrollWidth>innerWidth,broken:[...root.querySelectorAll('img')].filter(i=>!i.naturalWidth).length,empty:[...root.querySelectorAll('svg')].filter(i=>!i.children.length).length,dialog:b?{left:b.left,right:b.right,top:b.top,bottom:b.bottom}:null,textFallback:[...root.querySelectorAll('.icon')].filter(i=>!i.querySelector('svg,img')&&i.textContent.trim()).map(i=>i.textContent),icons:root.querySelectorAll('.icon').length};`);report.views.push({tag,lang,name,...m});if(m.overflow||m.broken||m.empty||m.textFallback.length||m.dialog&&(m.dialog.left<0||m.dialog.right>width+1||m.dialog.top<0||m.dialog.bottom>height+1))report.errors.push({tag,lang,name,...m});fs.writeFileSync(path.join(OUT,`${tag}-${lang}-${name}.png`),(await w.webContents.capturePage()).toPNG());}
   await run(setup);
   await shot('credits',`G.SettingsUI.renderCredits();G.UI.showScreen('screen-credits');`);
   for(const kind of ['intro','ending'])await shot('story-'+kind,`G.MenuUI.renderStory('${kind}',()=>{});G.UI.showScreen('screen-story');`);
   await shot('ascension',`const meta=G.Save.readMeta();meta.ascensionUnlocked=10;G.Save.writeMeta(meta);G.MenuUI.renderAscensionPick();G.UI.showScreen('screen-ascension');`);
   for(const floor of [5,10,15]){await run(setup);await shot('waypoint-'+floor,`G.State.current.currentFloor=${floor};G.TowerUI.renderTower();G.UI.showScreen('screen-tower');document.querySelector('#tower-jump-current').click();if(!document.querySelector('#screen-waypoint.active'))throw Error('Waypoint not shown');`);}
   await run(setup);await shot('boss-confirm',`G.State.current.currentFloor=100;G.TowerUI.renderTower();G.UI.showScreen('screen-tower');document.querySelector('#tower-jump-current').click();`);
   await run(setup);await shot('talents',`G.State.current.level=5;G.SystemsUI.talentPrompt(()=>{});`);
   const talentOverlap=await run(`return [...document.querySelectorAll('.tactical-choice')].some(c=>{const a=c.querySelector('.talent-hero-preview')?.getBoundingClientRect(),b=c.querySelector('strong').getBoundingClientRect();return a&&Math.min(a.right,b.right)-Math.max(a.left,b.left)>2&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2;});`);if(talentOverlap)report.errors.push({tag,lang,error:'Talent portrait overlaps title'});
   await run(setup);await shot('routes',`G.SystemsUI.routePrompt(5,()=>{});`);
   await run(setup);await shot('item-detail',`G.TowerUI.renderStatus();G.UI.showScreen('screen-status');document.querySelector('.inv-tile').click();`);
   await run(setup);await shot('equip-picker',`G.TowerUI.renderStatus();G.UI.showScreen('screen-status');document.querySelector('.equip-slot[data-slot]').click();`);
   const equipment=await run(`const list=document.querySelector('.equipment-picker .submenu-list');list.scrollTop=list.scrollHeight;const last=list.querySelector('.submenu-option:last-child'),id=last.dataset.id,b=last.getBoundingClientRect(),v=list.getBoundingClientRect();const visible=b.bottom<=v.bottom+1;last.click();return {visible,equipped:G.State.current.equipment.weapon===id,closed:document.querySelector('#modal-root').classList.contains('hidden')};`);report.interactions.push({tag,lang,...equipment});if(!equipment.visible||!equipment.equipped||!equipment.closed)report.errors.push({tag,lang,equipment});
   await run(setup);await shot('companions-locked',`G.TowerUI.renderStatus();G.UI.showScreen('screen-status');document.querySelector('#companion-slot').click();`);
   await run(setup);await shot('companions-unlocked',`G.State.recordFloorReached(100);G.TowerUI.renderStatus();G.UI.showScreen('screen-status');document.querySelector('#companion-slot').click();`);
   await run(setup);await shot('quest-claim',`G.State.current.currentFloor=20;G.TowerUI.renderQuests();G.UI.showScreen('screen-quests');document.querySelector('#quests-claim-all-btn').click();`);
   await run(setup);await shot('victory',`G.Main.showEnd(true);`);
  }
  w.destroy();
 }
 fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({views:report.views.length,errors:report.errors}));app.exit(report.errors.length?1:0);
}).catch(e=>{console.error(e);app.exit(1);});
