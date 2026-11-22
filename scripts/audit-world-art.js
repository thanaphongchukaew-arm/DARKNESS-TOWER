// Real-page verification of NPC states, pixel scenery, and battle motifs.
const {app,BrowserWindow}=require('electron');
const fs=require('fs'),path=require('path'),os=require('os');
const ROOT=path.join(__dirname,'..'),OUT=path.join(ROOT,'previews/world-art');
fs.mkdirSync(OUT,{recursive:true});app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'world-art-')));app.on('window-all-closed',()=>{});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
app.whenReady().then(async()=>{
 const report={assets:[],views:[],effects:[],errors:[]};
 for(const [tag,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
  const win=new BrowserWindow({width,height,useContentSize:true,show:false,webPreferences:{contextIsolation:false,backgroundThrottling:false}});
  win.webContents.on('console-message',e=>{if(e.level==='error'&&/Uncaught|TypeError|ReferenceError/.test(e.message))report.errors.push(e.message);});
  const run=code=>win.webContents.executeJavaScript('(async()=>{const G=window.Game;'+code+'})()');
  await win.loadURL(require('url').pathToFileURL(path.join(ROOT,'index.html')).href+(tag==='mobile'?'?mobile=1':''));
  await run(`await document.fonts.ready;G.Tips.setEnabled(false);document.querySelector('#tip-card-ok')?.click();const style=document.createElement('style');style.textContent='.screen,.npc-scene,.npc-portrait,.story-scene-layout{animation:none!important;transition:none!important;opacity:1!important}';document.head.appendChild(style);`);
  async function shot(name){await run('await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));window.scrollTo(0,0);');await pause(80);fs.writeFileSync(path.join(OUT,tag+'-'+name+'.png'),(await win.webContents.capturePage()).toPNG());const m=await run(`const root=document.querySelector('.screen.active');return {tag:${JSON.stringify(tag)},name:${JSON.stringify(name)},overflow:document.body.scrollWidth>innerWidth,npcs:[...root.querySelectorAll('[data-npc-art]')].map(a=>({key:a.dataset.npcArt,w:a.getBoundingClientRect().width,h:a.getBoundingClientRect().height})),overlaps:[...root.querySelectorAll('.story-journal-card')].filter(c=>{const a=c.querySelector('.journal-portrait').getBoundingClientRect(),b=c.children[1].getBoundingClientRect();return a.right>b.left+1;}).length};`);report.views.push(m);if(m.overflow||m.overlaps)throw Error('Layout '+JSON.stringify(m));}
  if(tag==='desktop'){
   report.assets=await run(`return Promise.all(G.NPCArt.keys.map(async key=>{const i=new Image();i.src='assets/pixel16/npcs/'+key+'.png';await i.decode();const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const x=c.getContext('2d');x.drawImage(i,0,0);const p=x.getImageData(0,0,i.width,i.height).data,colors=new Set(),alpha=new Set();let left=i.width,top=i.height,right=0,bottom=0;for(let y=0;y<i.height;y++)for(let xx=0;xx<i.width;xx++){const n=(y*i.width+xx)*4;alpha.add(p[n+3]);if(!p[n+3])continue;colors.add(p.slice(n,n+3).join(','));left=Math.min(left,xx);right=Math.max(right,xx);top=Math.min(top,y);bottom=Math.max(bottom,y);}return {key,width:i.width,height:i.height,colors:colors.size,alpha:[...alpha],bounds:[left,top,right,bottom],margin:Math.min(left,top,i.width-1-right,i.height-1-bottom)};}));`);
   for(const a of report.assets)if(a.colors>24||a.margin<2||a.alpha.some(v=>v!==0&&v!==255))throw Error('Sprite '+JSON.stringify(a));
  }
  await run(`G.State.createRun('normal','blade');G.CodexUI.renderCodex();G.UI.showScreen('screen-codex');document.querySelector('#codex-tab-stories').click();`);await shot('travelers-unmet');
  for(const arc of ['mira','orin','lyra'])for(let chapter=0;chapter<3;chapter++){
   await run(`G.State.createRun('normal','blade');const r=G.State.current,s=G.Story.ensure(r);G.Story.arcs.forEach(a=>s.people[a.id].chapter=3);s.people['${arc}'].chapter=${chapter};s.people['${arc}'].trust=3;const a=G.Story.arcs.find(a=>a.id==='${arc}');r.currentFloor=a.chapters[${chapter}].floor;r.gold=3000;G.StoryUI.maybe(r.currentFloor);`);
   await shot(arc+'-'+chapter);
   const bounds=await run(`const p=document.querySelector('.npc-portrait').getBoundingClientRect(),s=document.querySelector('.npc-scene').getBoundingClientRect();return {key:document.querySelector('#screen-event .npc-portrait [data-npc-art]')?.getAttribute('data-npc-art'),html:document.querySelector('#screen-event .npc-portrait').innerHTML.slice(0,320),inside:p.left>=s.left&&p.right<=s.right&&p.top>=s.top&&p.bottom<=s.bottom};`);if(!bounds.inside||!bounds.key)throw Error('Portrait clipped '+JSON.stringify(bounds));
  }
  await run(`G.CodexUI.renderCodex();G.UI.showScreen('screen-codex');document.querySelector('#codex-tab-stories').click();`);await shot('travelers-met');
  await run(`G.WorkshopUI.open('services');`);await shot('services');
  await run(`G.WorkshopUI.open('camp');`);await shot('camp');
  await run(`G.State.createRun('normal','blade');G.BattleUI.startBattle(2,false,false);`);await pause(1700);await run('G.BattleUI.cancelPlayback();');
  for(const [family,element,motif] of [['fireball','fire',''],['iceShard','ice',''],['arrow','phys',''],['bullet','phys',''],['bomb','fire',''],['punch','phys',''],['shield','light',''],['temporal','almighty','clock'],['music','light',''],['puppet','dark',''],['swarm','fire','beast'],['swarm','elec','scarab'],['bite','phys','fang'],['shield','light','wings']]){
   await run(`G.PixelFX.cancel();const p=G.VFXData.make('${family}',{element:'${element}'},{duration:1800,motif:'${motif}'});G.PixelFX.play([{profile:p,source:()=>document.querySelector('#battle-player-panel'),target:()=>document.querySelector('.enemy-art'),seed:'world-art'}],()=>{});`);await pause(620);await shot('fx-'+family+'-'+motif);await run('G.PixelFX.cancel();');const d=await run('return G.PixelFX.diagnostics();');if(d.failures||d.jobs)throw Error('Effect '+family);report.effects.push({tag,family,motif,...d});
  }
  if(tag==='desktop'){
   const cells=await run(`return G.NPCArt.keys.map(k=>'<article><div class="portrait">'+G.Icons.get(k)+'</div><strong>'+k+'</strong></article>').join('');`);
   const fx=await run(`const names=${JSON.stringify([...fs.readFileSync(path.join(ROOT,'js/pixel-effects.js'),'utf8').matchAll(/motif\('([^']+)'/g)].map(m=>m[1]))};return names.map(k=>{const d=G.PixelArt.getDefinition(k);const colors=G.VFXData.palettes[/Fire/.test(k)?'fire':/Ice/.test(k)?'ice':/Heart/.test(k)?'heal':/Rune|Eye|Puppet/.test(k)?'dark':'phys'];return '<article><div class="effect">'+G.PixelArt.renderGrid(d.grid,Object.assign({},d.palette,{H:colors[0],C:colors[1],M:colors[2]}))+'</div><strong>'+k+'</strong></article>';}).join('');`);
   const tiles=await run(`return G.SceneArt.keys.map(k=>'<article><div class="tile">'+G.PixelArt.render(k)+'</div><strong>'+k+'</strong></article>').join('');`);
   for(const [name,body,columns]of [['npcs',cells,4],['effects',fx,5],['tiles',tiles,2]]){
    const html='<!doctype html><meta charset="utf-8"><base href="'+require('url').pathToFileURL(ROOT+path.sep).href+'"><style>body{background:#171220;color:#f3e6cd;font:16px system-ui;margin:24px}main{display:grid;grid-template-columns:repeat('+columns+',1fr);gap:16px}article{padding:16px;text-align:center;border:1px solid #6b5841;background:#211a2b}.portrait{width:160px;height:192px;margin:0 auto 12px}.effect{width:112px;height:112px;margin:0 auto 10px}.tile{width:256px;height:256px;margin:0 auto 12px}.icon,svg{display:block;width:100%;height:100%;image-rendering:pixelated}</style><h1>'+name+' · 16-bit</h1><main>'+body+'</main>';
    const file=path.join(OUT,name+'.html');fs.writeFileSync(file,html);win.setContentSize(1200,1100);await win.loadFile(file);await pause(200);const h=await win.webContents.executeJavaScript('document.documentElement.scrollHeight');win.setContentSize(1200,Math.max(1100,h));await pause(100);fs.writeFileSync(path.join(OUT,name+'.png'),(await win.webContents.capturePage()).toPNG());
   }
  }
  win.destroy();
 }
 fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({assets:report.assets.length,views:report.views.length,effects:report.effects.length,errors:report.errors}));app.exit(report.errors.length?1:0);
}).catch(e=>{console.error(e);app.exit(1);});
