// Capture all authored battle environments at desktop and phone sizes.
const {app,BrowserWindow}=require('electron'),fs=require('fs'),path=require('path'),os=require('os');
const OUT=path.resolve('previews/battle-scenes');fs.mkdirSync(OUT,{recursive:true});app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'battle-scenes-')));app.on('window-all-closed',()=>{});
app.whenReady().then(async()=>{
 const report={views:[],errors:[]},floors=process.argv.includes('--sample')?[1,11,21,31]:[1,11,21,31,41,45,50,55,60,65,70,75,80,85,90,95,100];
 for(const [tag,width,height]of [['desktop',1440,960],['mobile',390,844],['landscape',844,390]]){
  const w=new BrowserWindow({width,height,useContentSize:true,show:false,webPreferences:{contextIsolation:false,backgroundThrottling:false}});
  const run=s=>w.webContents.executeJavaScript('(async()=>{const G=Game;'+s+'})()');
  await w.loadURL(require('url').pathToFileURL(path.resolve('index.html')).href+(tag==='desktop'?'':'?mobile=1'));
  await run(`await document.fonts.ready;G.Tips.setEnabled(false);document.querySelector('#tip-card-ok')?.click();const st=document.createElement('style');st.textContent='*,*::before,*::after{animation:none!important;transition:none!important}.battle-entrance{display:none!important}';document.head.appendChild(st);G.State.createRun('normal','blade');`);
  if(tag==='desktop'&&!process.argv.includes('--sample')){
   const cells=await run(`return G.BattleScenes.zones.map((name,i)=>'<article><div>'+G.BattleScenes.render(i+1,i===16)+'</div><h2>'+name+'</h2></article>');`);
   const html='<!doctype html><meta charset="utf-8"><base href="'+require('url').pathToFileURL(path.resolve('.')+path.sep).href+'"><style>body{background:#0d101b;color:#e8e0c7;font:14px system-ui;margin:20px}main{display:grid;grid-template-columns:1fr 1fr;gap:16px}img{display:block;width:100%;height:auto;image-rendering:pixelated}h2{font-size:17px;margin:10px 0}article{border:1px solid #4c485b;padding:8px}</style><main>';
   for(let n=0;n<cells.length;n+=6){const f=path.join(OUT,'gallery-'+(n/6+1)+'.html');fs.writeFileSync(f,html+cells.slice(n,n+6).join('')+'</main>');const gallery=new BrowserWindow({width:1440,height:1330,show:false});await gallery.loadFile(f);await gallery.webContents.executeJavaScript('Promise.all([...document.images].map(i=>i.decode()))');gallery.setContentSize(1440,await gallery.webContents.executeJavaScript('document.documentElement.scrollHeight'));await new Promise(r=>setTimeout(r,80));fs.writeFileSync(f.replace('.html','.png'),(await gallery.webContents.capturePage()).toPNG());gallery.destroy();}
  }
  for(const floor of floors){await run(`G.BattleUI.cancelPlayback();G.State.current.currentFloor=${floor};G.State.fullRestore(G.State.current);G.BattleUI.startBattle(${floor},${floor===100},false);`);await run(`await Promise.all([...document.querySelectorAll('.battle-scene-art')].map(i=>i.decode()));`);await new Promise(r=>setTimeout(r,150));const m=await run(`const b=document.querySelector('.battle-backdrop'),s=b.querySelector('.battle-scene-art'),a=s.getBoundingClientRect(),v=b.getBoundingClientRect();return {scene:b.dataset.scene,overflow:document.body.scrollWidth>innerWidth,legacy:[...b.children].filter(c=>!c.classList.contains('battle-scenery')&&getComputedStyle(c).display!=='none').length,covered:a.width>=v.width-1&&a.height>=v.height-1,loaded:s.complete&&s.naturalWidth>0,fit:getComputedStyle(s).objectFit,natural:[s.naturalWidth,s.naturalHeight],images:[...document.querySelectorAll('#screen-battle image')].map(i=>i.getAttribute('href'))};`);if(m.overflow||m.legacy||!m.covered||!m.loaded||m.fit!=='cover')report.errors.push({tag,floor,...m});report.views.push({tag,floor,...m});fs.writeFileSync(path.join(OUT,tag+'-'+floor+'.png'),(await w.webContents.capturePage()).toPNG());}
  await run('G.BattleUI.cancelPlayback();');
  for(const lang of ['th','en'])for(const kind of ['intro','ending']){
   const story=await run(`G.I18n.setLang('${lang}');G.MenuUI.renderStory('${kind}',()=>{});G.UI.showScreen('screen-story');const bg=getComputedStyle(document.querySelector('#screen-story')).backgroundImage;return {background:bg,overflow:document.body.scrollWidth>innerWidth};`);
   if(story.overflow||!story.background.includes('/scenes/'))report.errors.push({tag,lang,kind,...story});
   await new Promise(r=>setTimeout(r,100));fs.writeFileSync(path.join(OUT,tag+'-'+lang+'-'+kind+'.png'),(await w.webContents.capturePage()).toPNG());
  }
  w.destroy();
 }
 fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({views:report.views.length,environments:17,errors:report.errors}));app.exit(report.errors.length?1:0);
}).catch(e=>{console.error(e);app.exit(1);});
