// Contact sheets of actual runtime sprites. Run after art:pack.
const {app,BrowserWindow}=require('electron');
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..'),OUT=path.join(ROOT,'previews/pixel16');fs.mkdirSync(OUT,{recursive:true});
const context=vm.createContext({window:{Game:{}}});
for(const f of ['pixel-art','pixel-sprites','data-classes','data-enemies','class-art','monster-art','battle-art'])vm.runInContext(fs.readFileSync(path.join(ROOT,'js',f+'.js'),'utf8'),context);
const G=context.window.Game;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const style='body{margin:0;background:#11101b;color:#efe8d8;font:14px system-ui,sans-serif}header{padding:15px 22px}h1{font-size:24px;margin:0}h2{font-size:16px;margin:8px 0}p{margin:3px 0;color:#c4b9cb}main{display:grid;gap:8px;padding:10px}article{border:1px solid #645337;background:radial-gradient(ellipse at 50% 40%,#332b40,#181420 70%);padding:8px;text-align:center;min-height:236px}.stage{height:174px;display:flex;align-items:center;justify-content:center;gap:10px}.class-character{height:174px;width:174px}.original{width:105px;height:140px;object-fit:contain;opacity:.7}.enemy-art{display:block;width:174px;height:174px}.enemy-art>svg{width:100%;height:100%}svg,image,img{image-rendering:pixelated}small{font-size:11px;color:#aca1b9}.gallery{grid-template-columns:repeat(auto-fit,minmax(230px,1fr))}';
const wrap=(title,cells,cols)=>'<!doctype html><html lang="th"><meta charset="utf-8"><base href="../../"><title>'+title+'</title><style>'+style+'</style><header><h1>'+title+'</h1></header><main '+(cols?'style="grid-template-columns:repeat('+cols+',1fr)"':'class="gallery"')+'>'+cells.join('')+'</main></html>';
const classes=G.Data.classes.filter(c=>fs.existsSync(path.join(ROOT,'assets/pixel16/classes',c.icon+'.png')));
const monsters=G.Data.getAllEnemyTemplates().filter(e=>fs.existsSync(path.join(ROOT,'assets/pixel16/monsters',e.id+'.png')));
const classCells=classes.map(c=>'<article><div class="stage"><img class="original" src="assets/classes/'+c.icon+'.webp">'+G.ClassArt.render(c.icon)+'</div><h2>'+esc(c.name)+'</h2><p>'+esc(c.nameEn)+'</p><small>เดิม (ซ้าย) / 16-bit (ขวา) · '+c.id+'</small></article>');
const entries=monsters.map(e=>({...e,phase:1}));for(let phase=2;phase<=4;phase++)if(fs.existsSync(path.join(ROOT,'assets/pixel16/monsters/timeless_sovereign-phase-'+phase+'.png')))entries.push({...G.Data.boss,phase});
const monsterCells=entries.map(e=>'<article><div class="stage">'+G.BattleArt.enemy(e)+'</div><h2>'+esc(e.name)+(e.phase>1?' · '+e.phase:'')+'</h2><p>'+esc(e.nameEn)+'</p><small>'+e.id+' · หันซ้าย</small></article>');
const sheets=[];
for(const [kind,cells,per,cols] of [['classes',classCells,12,4],['monsters',monsterCells,24,6]]){
 fs.writeFileSync(path.join(OUT,kind+'-gallery.html'),wrap(kind==='classes'?'คลาสเดิม → 16-bit':'มอนสเตอร์ออกแบบใหม่ · 16-bit · หันซ้าย',cells));
 for(let i=0;i<cells.length;i+=per){const name=kind+'-'+(i/per+1),group=cells.slice(i,i+per);fs.writeFileSync(path.join(OUT,name+'.html'),wrap(name,group,cols));sheets.push({name,rows:Math.ceil(group.length/cols)});}
}
app.whenReady().then(async()=>{const win=new BrowserWindow({width:1600,height:1200,show:false});for(const sheet of sheets){win.setContentSize(1600,Math.max(420,sheet.rows*270+100));await win.loadFile(path.join(OUT,sheet.name+'.html'));await win.webContents.executeJavaScript('document.fonts.ready');await new Promise(r=>setTimeout(r,180));fs.writeFileSync(path.join(OUT,sheet.name+'.png'),(await win.webContents.capturePage()).toPNG());}console.log(JSON.stringify({classes:classes.length,monsters:monsters.length,phaseViews:entries.length-monsters.length,sheets:sheets.length}));app.quit();}).catch(e=>{console.error(e);app.exit(1);});
