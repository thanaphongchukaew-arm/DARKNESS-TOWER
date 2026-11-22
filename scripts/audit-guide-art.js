// Check every handbook topic, at actual desktop/phone sizes and both languages.
const {app,BrowserWindow}=require('electron');
const fs=require('fs'),path=require('path'),os=require('os');
const ROOT=path.join(__dirname,'..'),OUT=path.join(ROOT,'previews/guide-art');fs.mkdirSync(OUT,{recursive:true});
app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'guide-art-')));app.on('window-all-closed',()=>{});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
app.whenReady().then(async()=>{
 const report={views:[],edges:[],errors:[]};
 for(const [tag,width,height]of [['desktop',1440,1000],['mobile',390,844],['landscape',844,390]]){
  const win=new BrowserWindow({width,height,useContentSize:true,show:false,webPreferences:{contextIsolation:false,backgroundThrottling:false}});
  win.webContents.on('console-message',e=>{if(e.level==='error'&&/Uncaught|TypeError|ReferenceError/.test(e.message))report.errors.push(e.message);});
  const run=code=>win.webContents.executeJavaScript('(async()=>{const G=window.Game;'+code+'})()');
  await win.loadURL(require('url').pathToFileURL(path.join(ROOT,'index.html')).href+(tag==='desktop'?'':'?mobile=1'));
  await run(`await document.fonts.ready;G.Tips.setEnabled(false);document.querySelector('#tip-card-ok')?.click();const s=document.createElement('style');s.textContent='*{animation:none!important;transition:none!important}';document.head.appendChild(s);`);
  for(const lang of ['th','en']){
   await run(`G.I18n.setLang('${lang}');G.MenuUI.renderGuide();G.UI.showScreen('screen-guide');await Promise.all([...new Set([...document.querySelectorAll('#guide-content image')].map(i=>i.getAttribute('href')))].map(src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=resolve;i.onerror=()=>reject(Error('Broken guide PNG '+src));i.src=src;})));`);
   const metrics=await run(`const root=document.querySelector('#guide-content');return {tag:'${tag}',lang:'${lang}',cards:root.querySelectorAll('[data-guide-topic]').length,art:root.querySelectorAll('[data-guide-art]').length,topics:[...root.querySelectorAll('[data-guide-art]')].map(a=>a.getAttribute('data-guide-art')),tierBadges:root.querySelectorAll('.item-art,small').length,overflow:document.body.scrollWidth>innerWidth,smallArt:[...root.querySelectorAll('[data-guide-art]')].filter(a=>a.getBoundingClientRect().width<50).map(a=>a.getAttribute('data-guide-art')),overlap:[...root.querySelectorAll('.guide-stat-card')].filter(c=>{const a=c.querySelector('.guide-art-frame').getBoundingClientRect(),b=c.children[1].getBoundingClientRect(),r=c.getBoundingClientRect();return a.right>b.left+1||b.right>r.right+1||a.left<r.left;}).map(c=>c.dataset.guideTopic),sections:root.querySelectorAll(':scope>.guide-section').length,missing:root.textContent.includes('undefined')};`);
   if(metrics.cards!==43||metrics.tierBadges||metrics.overflow||metrics.overlap.length||metrics.smallArt.length||metrics.missing)throw Error('Guide layout '+JSON.stringify(metrics));
   const missing=await run('return G.GuideArt.keys.filter(k=>!'+JSON.stringify(metrics.topics)+'.includes(k));');if(missing.length)throw Error('Unshown guide art '+missing);report.views.push(metrics);
   await run('window.scrollTo(0,0);');await pause(100);fs.writeFileSync(path.join(OUT,tag+'-'+lang+'-top.png'),(await win.webContents.capturePage()).toPNG());
   for(let section=0;section<metrics.sections;section++){
    const h=await run(`const el=document.querySelectorAll('#guide-content>.guide-section')[${section}];el.scrollIntoView({block:'start'});return el.getBoundingClientRect().height;`);await pause(60);fs.writeFileSync(path.join(OUT,tag+'-'+lang+'-section-'+section+'.png'),(await win.webContents.capturePage()).toPNG());
    if(h>height){await run(`const el=document.querySelectorAll('#guide-content>.guide-section')[${section}];window.scrollTo(0,window.scrollY+el.getBoundingClientRect().bottom-innerHeight+12);`);await pause(60);fs.writeFileSync(path.join(OUT,tag+'-'+lang+'-section-'+section+'-bottom.png'),(await win.webContents.capturePage()).toPNG());}
   }
  }
  const restored=await run(`G.UI.showScreen('screen-menu');return document.querySelector('.top-right-controls>#open-settings')!==null;`);if(!restored)throw Error('Settings control not restored');
  if(tag==='desktop'){
   const art=await run('return G.GuideArt.keys.map(key=>({key,svg:G.GuideArt.render(key)}));');
   for(const a of art)a.embedded=a.svg.replace(/href="(assets\/[^"]+)"/g,(_,file)=>'href="data:image/png;base64,'+fs.readFileSync(path.join(ROOT,file)).toString('base64')+'"');
   report.edges=await run(`return Promise.all(${JSON.stringify(art.map(a=>({key:a.key,svg:a.embedded})))}.map(async a=>{const i=new Image();i.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(a.svg);await i.decode();const c=document.createElement('canvas');c.width=c.height=72;const x=c.getContext('2d');x.drawImage(i,0,0,72,72);const p=x.getImageData(0,0,72,72).data;let edge=false,pixels=0;for(let y=0;y<72;y++)for(let xx=0;xx<72;xx++)if(p[(y*72+xx)*4+3]){pixels++;if(!y||!xx||xx===71||y===71)edge=true;}return {key:a.key,pixels,edge};}));`);
   if(report.edges.some(e=>e.edge||!e.pixels))throw Error('Clipped art '+JSON.stringify(report.edges.filter(e=>e.edge||!e.pixels)));
   const base='<!doctype html><meta charset="utf-8"><base href="'+require('url').pathToFileURL(ROOT+path.sep).href+'"><style>body{background:#15111e;color:#f0e4cc;font:16px system-ui;margin:24px}main{display:grid;grid-template-columns:repeat(5,1fr);gap:14px}article{border:1px solid #79613e;background:#221a2c;padding:16px;text-align:center;overflow-wrap:anywhere}article>div{width:128px;height:128px;margin:auto}svg{width:100%;height:100%;image-rendering:pixelated}strong{display:block;margin-top:12px}</style><h1>Handbook illustrations · 16-bit</h1><main>';
   for(let n=0;n<art.length;n+=20){const file=path.join(OUT,'art-'+(n/20+1)+'.html');fs.writeFileSync(file,base+art.slice(n,n+20).map(a=>'<article><div>'+a.svg+'</div><strong>'+a.key+'</strong></article>').join('')+'</main>');win.setContentSize(1440,1100);await win.loadFile(file);await pause(150);fs.writeFileSync(file.replace('.html','.png'),(await win.webContents.capturePage()).toPNG());}
  }
  win.destroy();
 }
 fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({layouts:report.views.length,cards:report.views[0].cards,art:report.edges.length,errors:report.errors}));app.exit(report.errors.length?1:0);
}).catch(e=>{console.error(e);app.exit(1);});
