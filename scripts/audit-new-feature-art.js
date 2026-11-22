const {app,BrowserWindow}=require('electron');
const fs=require('fs'),path=require('path'),os=require('os');
const ROOT=path.join(__dirname,'..'),OUT=path.join(ROOT,'previews/new-feature-art');fs.mkdirSync(OUT,{recursive:true});
app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'new-feature-art-')));app.on('window-all-closed',()=>{});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const keys=['propDawnBell','miniForge','miniLockpick','miniCards','achDawnBell','achFourTravelers','achLocksmith','achGoldenHammer','achCardSharp','cardSuitHeart','cardSuitDiamond','cardSuitSpade','cardSuitClub','loreBellEcho','loreLampRoll'];
app.whenReady().then(async()=>{
 const report={views:[],edges:[],interactions:[],errors:[]};
 for(const [tag,width,height]of [['desktop',1280,960],['mobile',390,844],['landscape',844,390]]){
  const win=new BrowserWindow({width,height,useContentSize:true,show:false,webPreferences:{contextIsolation:false,backgroundThrottling:false}});
  win.webContents.on('console-message',e=>{if(e.level==='error'&&/Uncaught|TypeError|ReferenceError/.test(e.message))report.errors.push(e.message);});
  const run=code=>win.webContents.executeJavaScript('(async()=>{const G=window.Game;'+code+'})()');
  await win.loadURL(require('url').pathToFileURL(path.join(ROOT,'index.html')).href+(tag==='desktop'?'':'?mobile=1'));
  await run(`await document.fonts.ready;G.Tips.setEnabled(false);document.querySelector('#tip-card-ok')?.click();G.State.createRun('normal','blade');const s=document.createElement('style');s.textContent='.screen,.select-card,.craft-card{animation:none!important;transition:none!important;opacity:1!important}';document.head.appendChild(s);`);
  async function shot(name){await pause(100);const m=await run(`const b=document.querySelector('.minigame-box');const r=b?.getBoundingClientRect();return {name:${JSON.stringify(name)},tag:${JSON.stringify(tag)},overflow:document.body.scrollWidth>innerWidth,dialog:r?{left:r.left,top:r.top,right:r.right,bottom:r.bottom,scrollHeight:b.scrollHeight,clientHeight:b.clientHeight}:null,missing:[...document.querySelectorAll('.minigame-scene')].some(s=>!s.querySelector('svg')),cardRanks:[...document.querySelectorAll('.card-main strong')].map(e=>e.textContent)};`);if(m.overflow||m.missing||m.dialog&&(m.dialog.left<0||m.dialog.right>width||m.dialog.top<0||m.dialog.bottom>height+1))throw Error('Layout '+JSON.stringify(m));report.views.push(m);fs.writeFileSync(path.join(OUT,tag+'-'+name+'.png'),(await win.webContents.capturePage()).toPNG());}
  for(const lang of ['th','en']){
   await run('G.I18n.setLang('+JSON.stringify(lang)+');');
   for(const [kind,art,title,hint]of [['forge','miniForge','mgForgeTitle','mgForgeHint'],['lockpick','miniLockpick','mgLockTitle','mgLockHint']]){
    await run(`G.Minigame.timing({art:'${art}',title:G.I18n.t('${title}'),hint:G.I18n.t('${hint}'),speed:0.08,zone:0.22},r=>{window.mgResult=r;});`);await shot(lang+'-'+kind);
    await run(`document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));`);await pause(50);const skipped=await run('return !G.Minigame.active()&&window.mgResult.skipped;');if(!skipped)throw Error('Escape skip failed');report.interactions.push({tag,lang,kind,escape:true});
   }
   for(const card of [1,10,13]){
    await run(`const old=Math.random;Math.random=()=>(${card}-.5)/13;try{G.Minigame.hiLo({title:G.I18n.t('mgCardsTitle'),bet:120},r=>{window.mgResult=r;});}finally{Math.random=old;}`);await shot(lang+'-cards-'+card);
    if(card===10){await run(`const old=Math.random;Math.random=()=>12.5/13;try{document.querySelector('[data-mg="higher"]').click();}finally{Math.random=old;}`);await shot(lang+'-cards-reveal');await pause(850);const r=await run('return window.mgResult;');if(!r.won||r.hidden!==13)throw Error('Card reveal failed');report.interactions.push({tag,lang,reveal:true});}
    else {await run(`document.querySelector('[data-mg="skip"]').click();`);if(await run('return G.Minigame.active();'))throw Error('Card skip failed');}
   }
  }
  await run(`G.I18n.setLang('th');G.Minigame.timing({art:'miniForge',title:G.I18n.t('mgForgeTitle'),hint:G.I18n.t('mgForgeHint'),speed:0.08,zone:0.9},r=>{window.mgResult=r;});`);await pause(1100);
  for(let i=0;i<2;i++){await run(`document.querySelector('[data-mg="stop"]').click();`);await pause(420);}await shot('forge-success-marks');await run('G.Minigame.close();');
  await run(`G.Minigame.timing({art:'miniLockpick',title:G.I18n.t('mgLockTitle'),hint:G.I18n.t('mgLockHint'),speed:0.001,zone:0.2},()=>{});document.querySelector('[data-mg="stop"]').click();`);await shot('lockpick-miss-mark');await run('G.Minigame.close();');
  for(const unlocked of [false,true]){
   await run(`const ids=['veyra_bell','all_bonded','locksmith','forge_rhythm','card_sharp'];const m=G.Save.readMeta();G.Data.achievements.filter(a=>ids.includes(a.id)).forEach(a=>m[a.flag]=${unlocked});G.Save.writeMeta(m);G.CodexUI.renderCodex();G.UI.showScreen('screen-codex');document.querySelector('#codex-tab-achievements').click();[...document.querySelectorAll('.achievement-card')].forEach(c=>{if(!ids.some(id=>c.textContent.includes(G.I18n.L(G.Data.achievements.find(a=>a.id===id),'name'))))c.remove();});window.scrollTo(0,0);`);await shot('achievements-'+(unlocked?'unlocked':'locked'));
  }
  for(const lang of ['th','en'])for(const id of ['veyra_bell_echo','lamp_roll']){
   await run(`G.I18n.setLang('${lang}');G.State.createRun('normal','blade');const r=G.State.current,s=G.Story.ensure(r),lore=G.Data.story.lore.find(l=>l.id==='${id}');G.Story.arcs.forEach(a=>s.people[a.id].chapter=3);G.Data.story.lore.forEach(l=>{if(l.id!=='${id}')s.lore[l.id]=l.floor;});r.currentFloor=lore.floor;G.StoryUI.maybe(r.currentFloor);`);await shot(lang+'-lore-'+id);
  }
  await run(`G.SettingsUI.renderSettings();G.UI.showScreen('screen-settings');document.querySelector('#set-minigames').scrollIntoView({block:'center'});`);await shot('settings-switch');
  if(tag==='desktop'){
   report.edges=await run(`return Promise.all(${JSON.stringify(keys)}.map(async key=>{const svg=G.UISymbols.render(key);const i=new Image();i.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);await i.decode();const c=document.createElement('canvas');c.width=36;c.height=36;const x=c.getContext('2d');x.drawImage(i,0,0,36,36);const p=x.getImageData(0,0,36,36).data;let edge=false,n=0;for(let y=0;y<36;y++)for(let xx=0;xx<36;xx++)if(p[(y*36+xx)*4+3]){n++;if(!xx||!y||xx===35||y===35)edge=true;}return {key,edge,pixels:n,svg};}));`);if(report.edges.some(e=>e.edge||!e.pixels))throw Error('Clipped symbol '+JSON.stringify(report.edges.filter(e=>e.edge||!e.pixels).map(e=>e.key)));
   const cells=report.edges.map(e=>'<article><div>'+e.svg+'</div><strong>'+e.key+'</strong></article>').join('');const html='<!doctype html><meta charset="utf-8"><style>body{background:#171220;color:#f1e4ca;font:16px system-ui;margin:24px}main{display:grid;grid-template-columns:repeat(5,1fr);gap:16px}article{text-align:center;border:1px solid #78613d;padding:20px;background:#211a2b}article>div{width:112px;height:112px;margin:0 auto 12px}svg{width:100%;height:100%;image-rendering:pixelated}</style><h1>New feature art · 16-bit</h1><main>'+cells+'</main>';const file=path.join(OUT,'symbols.html');fs.writeFileSync(file,html);win.setContentSize(1280,960);await win.loadFile(file);await pause(150);fs.writeFileSync(path.join(OUT,'symbols.png'),(await win.webContents.capturePage()).toPNG());report.edges.forEach(e=>delete e.svg);
  }
  win.destroy();
 }
 fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({views:report.views.length,symbols:report.edges.length,interactions:report.interactions.length,errors:report.errors}));app.exit(report.errors.length?1:0);
}).catch(e=>{console.error(e);app.exit(1);});
