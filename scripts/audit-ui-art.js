// Inspect real UI and every registered item using a disposable save profile.
const {app,BrowserWindow}=require('electron');
const fs=require('fs'),path=require('path'),os=require('os');
const ROOT=path.join(__dirname,'..'),OUT=path.join(ROOT,'previews/ui-art');fs.mkdirSync(OUT,{recursive:true});
app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'tower-art-audit-')));
app.on('window-all-closed',()=>{});
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
app.whenReady().then(async()=>{
 const report={views:[],items:[],registry:[],errors:[]};const originalNames=JSON.parse(fs.readFileSync(path.join(ROOT,'previews/pixel16/original-monster-identities.json'),'utf8'));
 for(const [tag,width,height] of [['desktop',1440,960],['mobile',390,844],['landscape',844,390]]){
  const win=new BrowserWindow({width,height,useContentSize:true,show:false,webPreferences:{contextIsolation:false,backgroundThrottling:false}});
  win.webContents.on('console-message',event=>{if(event.level==='error'&&/Uncaught|TypeError|ReferenceError/.test(event.message))report.errors.push(event.message);});
  const run=code=>win.webContents.executeJavaScript('(async()=>{const G=window.Game;'+code+'})()');
  await win.loadURL(require('url').pathToFileURL(path.join(ROOT,'index.html')).href+(tag==='desktop'?'':'?mobile=1'));
  await run(`await document.fonts.ready;const steady=document.createElement('style');steady.textContent='.screen,.select-card,.craft-card,.ws-card,.enemy-art,.enemy-art>svg{animation:none!important;transition:none!important;transform:none!important}';document.head.appendChild(steady);G.Tips.setEnabled(false);document.querySelector("#tip-card-ok")?.click();G.State.createRun("normal","blade");G.State.current.level=1;G.State.current.currentFloor=13;G.State.current.gold=3000;G.Data.items.forEach(it=>G.State.addItem(G.State.current,it.id,3));G.State.fullRestore(G.State.current);`);
  const liveNames=await run('return G.Data.getAllEnemyTemplates().map(e=>({id:e.id,name:e.name,nameEn:e.nameEn}));');for(const e of originalNames){const live=liveNames.find(n=>n.id===e.id);if(!live||live.name!==e.name||live.nameEn!==e.nameEn)throw Error('Display name changed: '+e.id);}report.originalNames=true;
  async function shot(name,code){await run(code);await pause(150);await run('document.querySelector("#tip-card-ok")?.click();window.scrollTo(0,0);');const view=await run(`const root=document.querySelector('.screen.active');return {screen:root.id,overflow:document.body.scrollWidth>innerWidth,broken:[...root.querySelectorAll('img')].filter(i=>i.complete&&!i.naturalWidth).length,emptySVG:[...root.querySelectorAll('svg')].filter(s=>!s.children.length).length,bestiaryArt:root.id==='screen-codex'&&root.querySelector('.enemy-art')?parseFloat(getComputedStyle(root.querySelector('.enemy-art')).width):null,pairIcons:root.id==='screen-blessing-pick'?root.querySelectorAll('.blessing-pair-art > .icon').length:null,iconOverlaps:[...root.querySelectorAll('.select-card,.achievement-card')].filter(card=>{const a=card.querySelector('.select-card-icon');if(!a)return false;const x=a.getBoundingClientRect();return [...card.querySelectorAll('.select-card-title,.select-card-desc')].some(t=>{const y=t.getBoundingClientRect();return y.width>0&&y.height>0&&Math.min(x.right,y.right)-Math.max(x.left,y.left)>2&&Math.min(x.bottom,y.bottom)-Math.max(x.top,y.top)>2;});}).map(c=>c.dataset.id||c.textContent.slice(0,40)),itemCount:root.querySelectorAll('[data-item-id]').length};`);report.views.push({tag,name,...view});fs.writeFileSync(path.join(OUT,tag+'-'+name+'.png'),(await win.webContents.capturePage()).toPNG());}
  await shot('menu','G.MenuUI.renderMainMenu();G.UI.showScreen("screen-menu");');
  await shot('guide','G.MenuUI.renderGuide();G.UI.showScreen("screen-guide");');
  await shot('settings','G.SettingsUI.renderSettings();G.UI.showScreen("screen-settings");');
  await shot('classes','G.MenuUI.renderClassSelect();G.UI.showScreen("screen-class");');
  await shot('difficulty','G.MenuUI.renderDifficultyPick();G.UI.showScreen("screen-difficulty");');
  await shot('blessings','G.MenuUI.renderBlessingPick();G.UI.showScreen("screen-blessing-pick");');
  await shot('tower','G.TowerUI.renderTower();G.UI.showScreen("screen-tower");');
  await shot('shop','G.TowerUI.renderShop();G.UI.showScreen("screen-shop");');
  await shot('shop-no-gold','G.State.current.gold=0;G.TowerUI.renderShop();G.UI.showScreen("screen-shop");');
  await shot('shop-sell','document.querySelector("#shop-tab-sell").click();');
  await shot('craft','G.State.current.gold=3000;G.TowerUI.renderCraft();G.UI.showScreen("screen-craft");');
  await shot('quests','G.TowerUI.renderQuests();G.UI.showScreen("screen-quests");');
  await shot('bestiary','const meta=G.Save.readMeta();meta.bestiarySeen={};G.Data.getAllEnemyTemplates().forEach(e=>meta.bestiarySeen[e.id]=true);G.Save.writeMeta(meta);G.CodexUI.renderCodex();G.UI.showScreen("screen-codex");');
  await shot('achievements','document.querySelector("#codex-tab-achievements").click();');
  await shot('travelers','document.querySelector("#codex-tab-stories").click();');
  await shot('inventory','G.TowerUI.renderStatus();G.UI.showScreen("screen-status");');
  for(const tab of ['runes','salvage','forge','services','camp','guild','book'])await shot('workshop-'+tab,'G.WorkshopUI.open('+JSON.stringify(tab)+');');
  await shot('battle','G.BattleUI.startBattle(2,false,false);await new Promise(r=>setTimeout(r,1700));');
  await shot('battle-skills','document.querySelector("#act-skill").click();');
  await shot('battle-items','document.querySelector("#submenu-close")?.click();document.querySelector("#act-item").click();');
  await run('G.BattleUI.cancelPlayback();');
  await shot('arena-summary' ,'G.BattleUI.startSurvivalSession();await new Promise(r=>setTimeout(r,1600));document.querySelector("#battle-home").click();document.querySelector("#modal-confirm").click();');
  await shot('reward','G.TowerUI.renderReward(12);G.UI.showScreen("screen-reward");');
  await shot('end','G.Main.showEnd(false);');
  if(tag==='desktop'&&!process.argv.includes('--screens-only')){
   report.items=await run(`return G.Data.items.map(it=>({id:it.id,name:it.name,icon:it.icon,html:G.Icons.item(it),registered:G.PixelArt.has(it.icon)}));`);
   report.registry=[];
   const keys=new Set();for(const file of fs.readdirSync(path.join(ROOT,'js')).filter(f=>f.endsWith('.js'))){const source=fs.readFileSync(path.join(ROOT,'js',file),'utf8');for(const m of source.matchAll(/P\.define\('([^']+)'/g))keys.add(m[1]);}
   report.registry=await run('return '+JSON.stringify([...keys])+`.map(key=>{const d=G.PixelArt.getDefinition(key);if(!d)return {key,missing:true};return {key,uneven:d.grid.some(r=>r.length!==d.grid[0].length),unmapped:[...new Set(d.grid.join('').split(''))].filter(c=>c!=='.'&&!d.palette[c])};});`);
   const uiCells=await run(`return G.UISymbols.keys.map(key=>'<article><div style="width:80px;height:80px;margin:auto">'+G.Icons.get(key)+'</div><strong>'+key+'</strong></article>');`);
   const cells=report.items.map(it=>'<article>'+it.html+'<strong>'+it.name+'</strong><small>'+it.id+'</small></article>');
   const html='<!doctype html><meta charset="utf-8"><style>body{background:#14101c;color:#eee3cc;font:15px system-ui}main{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px}article{min-width:0;overflow-wrap:anywhere;padding:16px;text-align:center;border:1px solid #746047}strong,small{display:block;margin:8px}.item-art{display:inline-flex;position:relative;width:80px;height:80px;padding:8px 8px 18px;box-sizing:border-box;border:2px solid var(--item-tier-color)}.icon,svg{display:block;width:100%;height:100%}small{color:#c4b6a2}.item-art small{position:absolute;bottom:0;right:3px;font:10px monospace}.pixel-sprite{image-rendering:pixelated}</style><h1>All item artwork</h1><main>'+cells.join('')+'</main>';
   fs.writeFileSync(path.join(OUT,'all-items.html'),html);
   fs.writeFileSync(path.join(OUT,'ui-symbols.html'),html.replace(cells.join(''),uiCells.join('')).replace('All item artwork','16-bit UI symbols'));
   for(let i=0;i<uiCells.length;i+=30){const file=path.join(OUT,'symbols-'+(i/30+1)+'.html');fs.writeFileSync(file,html.replace(cells.join(''),uiCells.slice(i,i+30).join('')));win.setContentSize(1440,1060);await win.loadFile(file);await pause(100);win.setContentSize(1440,Math.max(1060,await win.webContents.executeJavaScript('document.documentElement.scrollHeight')));await pause(50);await win.webContents.executeJavaScript('window.scrollTo(0,0)');await pause(50);fs.writeFileSync(file.replace('.html','.png'),(await win.webContents.capturePage()).toPNG());}
   report.items=report.items.map(it=>({id:it.id,name:it.name,icon:it.icon,registered:it.registered}));
   for(let i=0;i<cells.length;i+=24){const file=path.join(OUT,'items-'+(i/24+1)+'.html');fs.writeFileSync(file,html.replace(cells.join(''),cells.slice(i,i+24).join('')));win.setContentSize(1440,1060);await win.loadFile(file);await pause(100);win.setContentSize(1440,Math.max(1060,await win.webContents.executeJavaScript('document.documentElement.scrollHeight')));await pause(50);await win.webContents.executeJavaScript('window.scrollTo(0,0)');await pause(50);fs.writeFileSync(file.replace('.html','.png'),(await win.webContents.capturePage()).toPNG());}
  }
  win.destroy();
 }
 const links=report.views.filter(v=>v.tag==='desktop').map(v=>'<article><h2>'+v.name+'</h2><a href="'+v.tag+'-'+v.name+'.png"><img loading="lazy" src="'+v.tag+'-'+v.name+'.png"></a></article>').join('');
 fs.writeFileSync(path.join(OUT,'other-ui.html'),'<!doctype html><meta charset="utf-8"><title>16-bit UI review</title><style>body{background:#15111e;color:#ede2c9;font:16px system-ui;margin:24px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:20px}article{min-width:0;padding:12px;border:1px solid #76613f}img{display:block;width:100%;height:300px;object-fit:contain;background:#090910}h2{font-size:18px}</style><h1>16-bit UI · all screens</h1><main>'+links+'</main>');
 fs.writeFileSync(path.join(OUT,process.argv.includes('--screens-only')?'screen-report.json':'report.json'),JSON.stringify(report,null,2));
 const bad=report.views.filter(v=>v.overflow||v.broken||v.emptySVG||v.iconOverlaps.length||(v.bestiaryArt!==null&&v.bestiaryArt<120)||(v.pairIcons!==null&&v.pairIcons!==2));console.log(JSON.stringify({views:report.views.length,items:report.items.length,layoutIssues:bad,registryIssues:report.registry.filter(r=>r.missing||r.uneven||r.unmapped.length),errors:report.errors}));app.exit(bad.length||report.errors.length?1:0);
}).catch(e=>{console.error(e);app.exit(1);});
