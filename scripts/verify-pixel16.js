// Real app checks with a disposable profile; existing player saves are untouched.
const {app,BrowserWindow}=require('electron');
const fs=require('fs'),path=require('path'),os=require('os'),http=require('http');
const ROOT=path.join(__dirname,'..'),OUT=path.join(ROOT,'previews/pixel16');
app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'tower-pixel16-')));
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.json':'application/json'};
const server=http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost'),file=path.resolve(ROOT,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));if(!file.startsWith(ROOT+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(error,data)=>{if(error){res.writeHead(404).end();return;}res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(data);});});
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
app.whenReady().then(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 const win=new BrowserWindow({width:1500,height:1000,show:false,webPreferences:{contextIsolation:false}});
 const errors=[];win.webContents.on('console-message',event=>{if(event.level==='error'&&/Uncaught|TypeError|ReferenceError/.test(event.message))errors.push(event.message);});
 const run=code=>win.webContents.executeJavaScript('(async()=>{'+code+'})()');
 await win.loadURL(base);await run('await document.fonts.ready;');
 const report=await run(`
 const paths=Game.Data.classes.map(c=>'assets/pixel16/classes/'+c.icon+'.png').concat(Game.Data.getAllEnemyTemplates().map(e=>'assets/pixel16/monsters/'+e.id+'.png'));
 for(let phase=2;phase<=4;phase++)paths.push('assets/pixel16/monsters/timeless_sovereign-phase-'+phase+'.png');
 const loads=await Promise.all(paths.map(src=>new Promise(resolve=>{const image=new Image();image.onload=()=>resolve({src,ok:true,width:image.naturalWidth,height:image.naturalHeight});image.onerror=()=>resolve({src,ok:false});image.src=src;})));
 return {classes:Game.Data.classes.length,monsters:Game.Data.getAllEnemyTemplates().length,images:loads};`);
 if(report.images.some(i=>!i.ok))throw Error('Missing runtime images');
 const identities=JSON.parse(fs.readFileSync(path.join(OUT,'original-monster-identities.json'),'utf8'));
 const actual=await run('return Game.Data.getAllEnemyTemplates().map(e=>({id:e.id,name:e.name,nameEn:e.nameEn}));');
 for(const e of identities){const found=actual.find(a=>a.id===e.id);if(!found||found.name!==e.name||found.nameEn!==e.nameEn)throw Error('Runtime monster identity changed: '+e.id);}
 report.originalNames=true;
 await run('Game.MenuUI.renderClassSelect();Game.UI.showScreen("screen-class");document.querySelector("#tip-card-ok")?.click();');await delay(400);
 fs.writeFileSync(path.join(OUT,'game-classes-desktop.png'),(await win.webContents.capturePage()).toPNG());
 await run('Game.State.createRun("normal","samurai",0);Game.BattleUI.startBattle(1,false,false);');await delay(1800);await run('document.querySelector("#tip-card-ok")?.click();');await delay(250);
 report.battle=await run('return {player:document.querySelector("#battle-player-panel image")?.getAttribute("href"),enemies:[...document.querySelectorAll(".enemy-portrait image")].map(i=>i.getAttribute("href"))};');
 if(!report.battle.player?.includes('assets/pixel16/classes/'))throw Error('Legacy player portrait');
 if(!report.battle.enemies.length||report.battle.enemies.some(src=>!src.startsWith('assets/pixel16/monsters/')))throw Error('Legacy enemy portrait');
 fs.writeFileSync(path.join(OUT,'game-battle-desktop.png'),(await win.webContents.capturePage()).toPNG());
 await run('await Promise.race([navigator.serviceWorker.ready,new Promise((_,reject)=>setTimeout(()=>reject(Error("Offline cache not ready")),8000))]);');
 report.cached=await run('return (await Promise.all('+JSON.stringify(report.images.map(i=>i.src))+'.map(src=>caches.match(src)))).filter(Boolean).length;');
 if(report.cached!==132)throw Error('Offline sprite cache incomplete: '+report.cached);
 await win.webContents.session.enableNetworkEmulation({offline:true});
 await win.loadURL(base);await run('if(!Game.Data.getAllEnemyTemplates().length)throw Error("Offline game did not load");');
 report.offline=true;await win.webContents.session.disableNetworkEmulation();
 win.setContentSize(390,844);await win.loadURL(base+'/?mobile=1');await run('await document.fonts.ready;Game.MenuUI.renderClassSelect();Game.UI.showScreen("screen-class");document.querySelector("#tip-card-ok")?.click();');await delay(400);
 report.mobile=await run('return {overflow:document.body.scrollWidth>innerWidth,portrait:document.querySelector("#class-cards .class-character").getBoundingClientRect().height};');
 if(report.mobile.overflow)throw Error('Mobile horizontal overflow');
 fs.writeFileSync(path.join(OUT,'game-classes-mobile.png'),(await win.webContents.capturePage()).toPNG());
 report.errors=errors;fs.writeFileSync(path.join(OUT,'runtime-report.json'),JSON.stringify(report,null,2));
 if(errors.length)throw Error(errors.join('\n'));
 console.log(JSON.stringify({classes:report.classes,monsters:report.monsters,loaded:report.images.length,cached:report.cached,offline:report.offline,mobile:report.mobile,errors}));
 server.close();app.quit();
}).catch(error=>{console.error(error);server.close();app.exit(1);});
