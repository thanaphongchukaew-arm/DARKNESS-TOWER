const {app,BrowserWindow}=require('electron');
const fs=require('fs'),path=require('path'),os=require('os');
const ROOT=path.join(__dirname,'..'),OUT=path.join(ROOT,'previews/companions');fs.mkdirSync(OUT,{recursive:true});
app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'companion-art-')));app.on('window-all-closed',()=>{});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
app.whenReady().then(async()=>{
 const results=[];
 for(const [tag,width,height]of [['desktop',1280,960],['mobile',390,844]]){
 const win=new BrowserWindow({width,height,useContentSize:true,show:false,webPreferences:{contextIsolation:false,backgroundThrottling:false}});
 const run=code=>win.webContents.executeJavaScript('(async()=>{const G=window.Game;'+code+'})()');
 await win.loadURL(require('url').pathToFileURL(path.join(ROOT,'index.html')).href+(tag==='mobile'?'?mobile=1':''));
 await run(`await Promise.all(G.CompanionArt.keys.map(key=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve();i.onerror=()=>reject(Error('Missing companion asset '+key));i.src='assets/pixel16/companions/'+key+'.png';})));await document.fonts.ready;G.Tips.setEnabled(false);document.querySelector('#tip-card-ok')?.click();G.State.createRun('normal','blade');G.State.current.level=1;G.State.current.currentFloor=2;G.State.fullRestore(G.State.current);const style=document.createElement('style');style.textContent='*,*::before,*::after{animation:none!important;transition:none!important}';document.head.appendChild(style);`);
 async function shot(name){await pause(100);fs.writeFileSync(path.join(OUT,tag+'-'+name+'.png'),(await win.webContents.capturePage()).toPNG());}
 await run(`G.TowerUI.renderStatus();G.UI.showScreen('screen-status');document.querySelector('#companion-slot').click();`);await shot('locked');
 await run(`document.querySelector('#modal-cancel').click();const m=G.Save.readMeta();m.bestFloorReached=100;G.Save.writeMeta(m);document.querySelector('#companion-slot').click();`);
 const picker=await run(`return {portraits:document.querySelectorAll('.companion-picker .companion-art').length,overflow:document.body.scrollWidth>innerWidth,clipped:(()=>{const b=document.querySelector('.companion-picker').getBoundingClientRect();return b.top<0||b.bottom>innerHeight+1;})()};`);
 if(picker.portraits!==7||picker.overflow||picker.clipped)throw Error('Picker failed '+JSON.stringify(picker));
 await shot('picker');
 await run(`const list=document.querySelector('.companion-picker>.submenu-list');list.scrollTop=list.scrollHeight;`);await shot('picker-bottom');
 await run(`document.querySelector('.companion-picker>.submenu-list').scrollTop=0;`);
 const list=await run('return G.Data.companions.map(c=>({id:c.id,icon:c.icon,name:c.name}));');
 for(const c of list){
 await run(`document.querySelector('.companion-picker [data-id="${c.id}"]').click();if(G.State.current.companionId!=='${c.id}')throw Error('Hiring failed');G.BattleUI.startBattle(2,false,false);`);
 await pause(1700);
 const actual=await run(`const el=document.querySelector('#battle-companion-panel');const svg=el.querySelector('[data-companion-art]');return {id:G.State.current.companionId,art:svg?.dataset.companionArt,name:el.textContent,artWidth:svg?.getBoundingClientRect().width,overflow:document.body.scrollWidth>innerWidth};`);
 if(actual.art!==c.icon||!actual.name.includes(c.name)||actual.artWidth<50||actual.overflow)throw Error('Battle failed '+JSON.stringify(actual));
 results.push({tag,...actual});await shot('battle-'+c.id);
 await run(`G.BattleUI.cancelPlayback();G.TowerUI.renderStatus();G.UI.showScreen('screen-status');document.querySelector('#companion-slot').scrollIntoView({block:'center'});`);await shot('status-'+c.id);
 const status=await run(`const e=document.querySelector('#companion-slot'),a=e.querySelector('[data-companion-art]'),b=a.getBoundingClientRect(),row=e.getBoundingClientRect();return {width:b.width,height:b.height,rowWidth:row.width,visible:b.top>=0&&b.bottom<=innerHeight,overlap:b.right>e.querySelector('.equip-slot-info').getBoundingClientRect().left+1};`);
 if(status.width>70||status.height>70||!status.visible||status.overlap)throw Error('Status portrait overlaps text '+JSON.stringify(status));
 await run(`G.BattleUI.cancelPlayback();G.TowerUI.renderStatus();G.UI.showScreen('screen-status');document.querySelector('#companion-slot').click();`);
 }
 const cells=await run(`return G.Data.companions.map(c=>'<article>'+G.Icons.get(c.icon)+'<h3>'+c.name+'</h3></article>').join('');`);
 if(tag==='desktop'){const html='<!doctype html><meta charset="utf-8"><base href="'+require('url').pathToFileURL(ROOT+path.sep).href+'"><style>body{background:#15121f;color:#f4e5c9;font:18px system-ui;padding:24px}main{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}article{text-align:center;background:#231c30;border:1px solid #776343;padding:16px}.icon{display:block;width:160px;height:160px;margin:auto}svg{width:100%;height:100%;image-rendering:pixelated}</style><h1>สหายร่วมทาง · 16-bit</h1><main>'+cells+'</main>';fs.writeFileSync(path.join(OUT,'all.html'),html);await win.loadFile(path.join(OUT,'all.html'));await pause(150);await shot('all');}
 win.destroy();
 }
 fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({battleViews:results.length,allPassed:true}));app.quit();
}).catch(e=>{console.error(e);app.exit(1);});
