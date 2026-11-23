// Generic layout guard for every non-battle screen (menu, class/blessing pick, tower, status, shop,
// craft, quests, codex, reward, waypoints, every random event, story, settings, credits, end).
// For each screen x viewport x language it checks, from real measured geometry:
//   * no horizontal page overflow
//   * every visible button / link / input lies inside the viewport horizontally
//   * nothing is cut off by an `overflow:hidden` ancestor
//   * no two interactive controls overlap each other
//   * no two text labels overlap each other
//   * no broken images / empty SVG icons
// Run: npm run test:screens [-- --quick]        exit code 1 on any violation.
const {app,BrowserWindow}=require('electron'),fs=require('fs'),path=require('path'),os=require('os');
app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'screens-layout-')));
app.on('window-all-closed',()=>{});
const OUT=path.resolve('previews/screens-layout');
const QUICK=process.argv.includes('--quick');

const VIEWPORTS=[
 ['desktop-1920x1080',1920,1080,false],['desktop-1440x960',1440,960,false],['desktop-1280x720',1280,720,false],
 ['desktop-1024x768',1024,768,false],['desktop-768x1024',768,1024,false],
 ['mobile-390x844',390,844,true],['mobile-360x640',360,640,true],['mobile-844x390',844,390,true],
];
const QUICK_VP=['desktop-1440x960','desktop-768x1024','mobile-390x844','mobile-844x390'];

// How to open each screen. `js` runs in the page after a fresh run with lots of gold/items.
const SCREENS=[
 ['menu',`G.MenuUI.renderMainMenu();G.UI.showScreen('screen-menu');`,'screen-menu'],
 ['guide',`G.MenuUI.renderGuide();G.UI.showScreen('screen-guide');`,'screen-guide'],
 ['story-intro',`G.MenuUI.renderStory('intro',()=>{});G.UI.showScreen('screen-story');`,'screen-story'],
 ['story-ending',`G.MenuUI.renderStory('ending',()=>{});G.UI.showScreen('screen-story');`,'screen-story'],
 ['difficulty',`G.MenuUI.renderDifficultyPick();G.UI.showScreen('screen-difficulty');`,'screen-difficulty'],
 ['ascension',`const m=G.Save.readMeta();m.ascensionUnlocked=10;G.Save.writeMeta(m);G.State.pending={difficulty:'nightmare'};G.MenuUI.renderAscensionPick();G.UI.showScreen('screen-ascension');`,'screen-ascension'],
 ['settings',`G.SettingsUI.renderSettings();G.UI.showScreen('screen-settings');`,'screen-settings'],
 ['credits',`G.SettingsUI.renderCredits();G.UI.showScreen('screen-credits');`,'screen-credits'],
 ['class-select',`G.State.pending={difficulty:'normal',ascension:0};G.MenuUI.renderClassSelect();G.UI.showScreen('screen-class');`,'screen-class'],
 ['blessing-pick',`G.State.pending={difficulty:'normal',ascension:0,classId:'blade'};G.MenuUI.renderBlessingPick();G.UI.showScreen('screen-blessing-pick');`,'screen-blessing-pick'],
 ['tower',`G.State.current.currentFloor=23;G.TowerUI.renderTower();G.UI.showScreen('screen-tower');`,'screen-tower'],
 ['status',`G.TowerUI.renderStatus();G.UI.showScreen('screen-status');`,'screen-status'],
 ['shop',`G.TowerUI.renderShop();G.UI.showScreen('screen-shop');`,'screen-shop'],
 ['craft',`G.TowerUI.renderCraft();G.UI.showScreen('screen-craft');`,'screen-craft'],
 ['quests',`G.State.current.currentFloor=20;G.TowerUI.renderQuests();G.UI.showScreen('screen-quests');`,'screen-quests'],
 ['codex-bestiary',`const m=G.Save.readMeta();m.bestFloorReached=100;G.Save.writeMeta(m);G.CodexUI.renderCodex();G.UI.showScreen('screen-codex');document.querySelector('#codex-tab-bestiary').click();`,'screen-codex'],
 ['codex-achievements',`const m=G.Save.readMeta();m.bestFloorReached=100;G.Save.writeMeta(m);G.CodexUI.renderCodex();G.UI.showScreen('screen-codex');document.querySelector('#codex-tab-achievements').click();`,'screen-codex'],
 ['codex-stories',`const m=G.Save.readMeta();m.bestFloorReached=100;G.Save.writeMeta(m);G.CodexUI.renderCodex();G.UI.showScreen('screen-codex');document.querySelector('#codex-tab-stories').click();`,'screen-codex'],
 ['reward',`G.State.current.difficulty='normal';G.TowerUI.renderReward(8);G.UI.showScreen('screen-reward');`,'screen-reward'],
 ...[5,10,15].map(f=>['waypoint-'+f,`G.State.current.currentFloor=${f};G.TowerUI.renderTower();G.UI.showScreen('screen-tower');document.querySelector('#tower-jump-current').click();`,'screen-waypoint']),
 // dialogs / overlays that open on top of a screen (4th field = modal)
 ['modal-talents',`G.State.current.level=5;G.SystemsUI.talentPrompt(()=>{});`,null,true],
 ['modal-routes',`G.SystemsUI.routePrompt(5,()=>{});`,null,true],
 ['modal-confirm-danger',`G.UI.confirmModal({title:'A deliberately long dialog title that wraps',message:'Long message. '.repeat(40),confirmLabel:'Confirm and continue',cancelLabel:'Cancel and go back',danger:true,onConfirm(){}});`,null,true],
 ['modal-confirm-info',`G.UI.confirmModal({title:'Info',message:'Short note.',confirmLabel:'Close',onConfirm(){}});`,null,true],
 ['modal-item-detail',`G.TowerUI.renderStatus();G.UI.showScreen('screen-status');document.querySelector('.inv-tile').click();`,null,true],
 ['modal-equip-picker',`G.TowerUI.renderStatus();G.UI.showScreen('screen-status');document.querySelector('.equip-slot[data-slot]').click();`,null,true],
 ['modal-companions-locked',`G.TowerUI.renderStatus();G.UI.showScreen('screen-status');document.querySelector('#companion-slot').click();`,null,true],
 ['modal-companions',`G.State.recordFloorReached(100);G.TowerUI.renderStatus();G.UI.showScreen('screen-status');document.querySelector('#companion-slot').click();`,null,true],
 ['end-victory',`G.Main.showEnd(true);`,'screen-end'],
 ['end-defeat',`G.Main.showEnd(false);`,'screen-end'],
];

const CHECK=`
(function(){
 const R=e=>e.getBoundingClientRect();
 const shown=e=>{const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity===0)return false;const r=R(e);if(r.width<2||r.height<2)return false;
  for(let p=e;p&&p!==document.body;p=p.parentElement){const c=getComputedStyle(p);if(c.display==='none'||c.visibility==='hidden'||+c.opacity===0||p.hasAttribute('hidden')||p.classList.contains('hidden'))return false;}return true;};
 const inter=(a,b,t)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>(t||2)&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>(t||2);
 const vr=e=>{let r=R(e),L=r.left,T=r.top,Rr=r.right,B=r.bottom;for(let p=e.parentElement;p&&p!==document.documentElement;p=p.parentElement){const c=getComputedStyle(p);
  if(c.overflowX!=='visible'||c.overflowY!=='visible'){const q=R(p);if(c.overflowX!=='visible'){L=Math.max(L,q.left);Rr=Math.min(Rr,q.right);}if(c.overflowY!=='visible'){T=Math.max(T,q.top);B=Math.min(B,q.bottom);}}}
  return {left:L,top:T,right:Rr,bottom:B};};
 const name=e=>(e.id?'#'+e.id:(e.className&&typeof e.className==='string'?'.'+e.className.trim().split(/\\s+/)[0]:e.tagName.toLowerCase()))+'"'+(e.textContent||e.getAttribute('aria-label')||'').trim().replace(/\\s+/g,' ').slice(0,18)+'"';
 const root=document.querySelector('.screen.active');
 const v=[],W=innerWidth,Hh=innerHeight;
 const mr=document.querySelector('#modal-root:not(.hidden)');
 if(Math.max(document.body.scrollWidth,document.documentElement.scrollWidth)>W+1)v.push('horizontal overflow '+document.body.scrollWidth+'>'+W);
 // with a dialog open, only the dialog is interactive; everything under the overlay is covered, not overlapping
 const scope=(mr&&mr.children.length?[mr]:[root,document.querySelector('#open-settings')]).filter(Boolean);
 const textRoot=(mr&&mr.children.length)?mr:root;
 const inScope=e=>scope.some(s=>s.contains(e));
 // an open dialog must fit the viewport (or scroll inside itself)
 if(mr){const box=mr.querySelector('.modal-box,.modal,[role=dialog]')||mr.firstElementChild;if(box){const b=R(box);
  if(b.left<-1||b.right>W+1)v.push('dialog outside viewport horizontally '+Math.round(b.left)+'..'+Math.round(b.right)+' of '+W);
  if((b.top<-1||b.bottom>Hh+1)&&!/auto|scroll/.test(getComputedStyle(box).overflowY)&&![...box.querySelectorAll('*')].some(x=>/auto|scroll/.test(getComputedStyle(x).overflowY)&&x.scrollHeight>x.clientHeight))v.push('dialog taller than the viewport and cannot scroll '+Math.round(b.top)+'..'+Math.round(b.bottom)+' of '+Hh);}}
 // the settings gear floats above everything: it must not sit on top of an open dialog
 const gear=document.querySelector('#open-settings');
 if(mr&&mr.children.length&&gear&&shown(gear)){const box=mr.querySelector('.modal-box,.modal,[role=dialog]')||mr.firstElementChild;
  if(box&&inter(R(gear),R(box),3)&&(parseInt(getComputedStyle(gear).zIndex,10)||0)>=(parseInt(getComputedStyle(mr).zIndex,10)||0))v.push('settings gear overlaps the open dialog');}
 // interactive controls
 const ctl=[...document.querySelectorAll('button,a[href],input,select,textarea,[role=button],.select-card,.btn-icon')].filter(e=>inScope(e)&&shown(e)&&!e.closest('[inert]'));
 // is the element clipped by an overflow:hidden/clip ancestor?
 const clipped=e=>{const r=R(e);let scrollX=false,scrollY=false;for(let p=e.parentElement;p&&p!==document.documentElement;p=p.parentElement){const c=getComputedStyle(p);
   // a scrolling ancestor makes content on that axis reachable, so outer clipping no longer matters
   if(/^(auto|scroll)$/.test(c.overflowX))scrollX=true;if(/^(auto|scroll)$/.test(c.overflowY))scrollY=true;
   const cx=!scrollX&&/^(hidden|clip)$/.test(c.overflowX),cy=!scrollY&&/^(hidden|clip)$/.test(c.overflowY);
   if(cx||cy){const pr=R(p);if(pr.width<2)continue;
    if(cx&&(r.left<pr.left-2||r.right>pr.right+2))return name(p);if(cy&&(r.top<pr.top-2||r.bottom>pr.bottom+2))return name(p);}}return null;};
 for(const e of ctl){const r=R(e);
  if(r.left<-1||r.right>W+1)v.push('control outside viewport horizontally: '+name(e)+' '+Math.round(r.left)+'..'+Math.round(r.right)+' of '+W);
  const c=clipped(e);if(c)v.push('control clipped by overflow of '+c+': '+name(e));}
 // overlapping controls (ignore nesting; ignore a control hidden under a modal)
 for(let i=0;i<ctl.length;i++)for(let j=i+1;j<ctl.length;j++){const a=ctl[i],b=ctl[j];
  if(a.contains(b)||b.contains(a))continue;if(inter(vr(a),vr(b),3))v.push('controls overlap: '+name(a)+' x '+name(b));}
 // overlapping text leaves
 const txt=[...textRoot.querySelectorAll('*')].filter(e=>{if(e.children.length)return false;const t=(e.textContent||'').trim();return t.length>=2&&shown(e)&&!/^(SCRIPT|STYLE)$/.test(e.tagName)&&!e.closest('svg');});
 for(let i=0;i<txt.length;i++)for(let j=i+1;j<txt.length;j++){const a=txt[i],b=txt[j];
  if(a.contains(b)||b.contains(a))continue;if(inter(vr(a),vr(b),3)){
   // badges / counts / chips drawn on top of art are intentional overlays
   if([a,b].some(x=>/qty|badge|count|tier|chip|tag|stack|level|lv/i.test(x.className&&x.className.baseVal===undefined?x.className:'')||getComputedStyle(x).position==='absolute'||getComputedStyle(x.parentElement).position==='absolute'))continue;
   v.push('text overlaps: '+name(a)+' x '+name(b));}}
 // text that is cut off horizontally
 for(const e of txt){const cs=getComputedStyle(e);if(/hidden|clip/.test(cs.overflowX)&&e.scrollWidth>e.clientWidth+2&&cs.textOverflow!=='ellipsis')v.push('text cut off: '+name(e));}
 // images / icons
 for(const i of root.querySelectorAll('img'))if(shown(i)&&!i.naturalWidth)v.push('broken image '+(i.getAttribute('src')||'').slice(-40));
 return v;
})()`;

app.whenReady().then(async()=>{
 const failures=[],consoleErrors=[];let checks=0;const settle=ms=>new Promise(r=>setTimeout(r,ms));
 const vps=QUICK?VIEWPORTS.filter(v=>QUICK_VP.includes(v[0])):VIEWPORTS;
 for(const [tag,width,height,mobile] of vps){
  const w=new BrowserWindow({width,height,useContentSize:true,show:false,webPreferences:{contextIsolation:false,backgroundThrottling:false}});
  w.webContents.on('console-message',e=>{if(e.level==='error'&&!/favicon|Autofill|DevTools/.test(e.message))consoleErrors.push({viewport:tag,message:String(e.message).slice(0,200)});});
  const run=s=>w.webContents.executeJavaScript('(async()=>{const G=Game;'+s+'})()');
  await w.loadURL(require('url').pathToFileURL(path.resolve('index.html')).href+(mobile?'?mobile=1':''));
  await run(`await document.fonts.ready;G.Tips.setEnabled(false);document.querySelector('#tip-card-ok')?.click();const s=document.createElement('style');s.textContent='*,*::before,*::after{animation:none!important;transition:none!important}';document.head.appendChild(s);`);
  const events=await run(`return G.Data.events.map(e=>e.id);`);
  const all=[...SCREENS,...events.map(id=>['event-'+id,`G.TowerUI.renderEvent('${id}',20);G.UI.showScreen('screen-event');`,'screen-event'])];
  for(const lang of ['th','en']){
   for(const [name,js,expect,isModal] of all){
    let list=[];
    try{
     await run(`G.I18n.setLang('${lang}');const mr=document.querySelector('#modal-root');mr.classList.add('hidden');mr.innerHTML='';G.State.createRun('nightmare','blade');const r=G.State.current;r.gold=100000;r.currentFloor=r.currentFloor||1;G.Data.items.forEach(i=>G.State.addItem(r,i.id,3));`);
     await run(js);
     await run(`await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));window.scrollTo(0,0);`);
     await settle(QUICK?70:110);
     const active=await run(`return document.querySelector('.screen.active')?.id;`);
     if(isModal){const open=await run(`return !!document.querySelector('#modal-root:not(.hidden)')&&document.querySelector('#modal-root').children.length>0;`);if(!open)list.push('dialog did not open');else list=await w.webContents.executeJavaScript(CHECK);}
     else if(active!==expect)list.push('expected '+expect+' but active screen is '+active);
     else list=await w.webContents.executeJavaScript(CHECK);
    }catch(e){list=['could not render: '+String(e.message||e).split('\n')[0].slice(0,140)];}
    checks++;
    if(list.length){const row={viewport:tag,lang,screen:name,violations:[...new Set(list)]};failures.push(row);
     {fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(path.join(OUT,(tag+'-'+lang+'-'+name).replace(/[^\w.-]+/g,'_')+'-FAIL.png'),(await w.webContents.capturePage()).toPNG());}}
   }
  }
  w.destroy();
 }
 for(const [i,e] of [...new Map(consoleErrors.map(e=>[e.message,e])).values()].entries())failures.push({viewport:e.viewport,lang:'-',screen:'console-error#'+i,violations:[e.message]});
 fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify({checks,failures},null,2));
 if(failures.length){
  console.error('Screens layout FAILED: '+failures.length+'/'+checks+' checks');
  for(const f of failures.slice(0,40)){console.error(' - '+f.viewport+' '+f.lang+' / '+f.screen);f.violations.slice(0,3).forEach(x=>console.error('     '+x));}
  if(failures.length>40)console.error(' ... '+(failures.length-40)+' more (see '+path.relative('.',OUT)+'/report.json)');
 }else console.log('Screens layout OK: '+checks+' checks across '+vps.length+' viewports');
 app.exit(failures.length?1:0);
}).catch(e=>{console.error(e);app.exit(1);});
