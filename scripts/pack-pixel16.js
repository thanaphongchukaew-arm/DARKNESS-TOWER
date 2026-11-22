// Normalize imagegen-authored art into small, palette-limited runtime sprites.
// Creative design comes from the generated source; this only exports the sprite grid.
// Run: electron scripts/pack-pixel16.js [--available]
const {app, BrowserWindow} = require('electron');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');
const context = vm.createContext({window:{Game:{}}});
for (const file of ['data-classes', 'data-enemies']) vm.runInContext(fs.readFileSync(path.join(ROOT,'js',file+'.js'),'utf8'),context);
const data = context.window.Game.Data;
const jobs = data.classes.map(c=>({id:c.icon,kind:'classes',width:64,height:80,colors:24}));
for (const e of data.getAllEnemyTemplates()) {
  const boss = !!e.isBoss;
  const wide = /wolf|hound|lynx|dragon|wyrm|wyvern|hydra|leviathan|serpent|eel|bat|hawk|falcon|spider|swarm/.test(e.id);
  const tall = /knight|bandit|fiend|devil|troll|reaper|lancer|marshal|pharaoh|herald|succubus/.test(e.id);
  jobs.push({id:e.id,kind:'monsters',width:boss?(e.id==='timeless_sovereign'?128:wide?128:96):wide?80:64,height:boss?(e.id==='timeless_sovereign'?128:96):tall?80:64,colors:boss?32:24});
}
for(let phase=2;phase<=4;phase++)jobs.push({id:'timeless_sovereign-phase-'+phase,kind:'monsters',width:128,height:128,colors:32});

// Companion assets use exactly the same grid/palette exporter as the existing game art.
const companionJobs = [
  ['emberFox',80,64],['dawnOwl',64,80],['stoneheartBear',80,64],
  ['stormSprite',64,80],['sandScarab',64,64],['frostHare',80,64],['ironGolemCub',64,80]
].map(([id,width,height])=>({id,kind:'companions',width,height,colors:24}));
const npcJobs=['npcMira','npcMiraHurt','npcMiraLantern','npcOrin','npcOrinHurt','npcOrinStandard','npcLyra','npcLyraLost','npcLyraAstral','npcMerchant','npcSage','npcGambler'].map(id=>({id,kind:'npcs',width:80,height:96,colors:24}));
if(process.argv.includes('--companions-only'))jobs.splice(0,jobs.length,...companionJobs);
else if(process.argv.includes('--npcs-only'))jobs.splice(0,jobs.length,...npcJobs);
else jobs.push(...companionJobs,...npcJobs);

// Runs in the hidden export window. Never modifies the original source artwork.
/* global Image, document */
async function exportSprite({url,width,height,colors}) {
  const image = new Image(); image.src=url; await image.decode();
  const source=document.createElement('canvas');source.width=image.width;source.height=image.height;
  const sc=source.getContext('2d',{willReadFrequently:true});sc.drawImage(image,0,0);
  const pixels=sc.getImageData(0,0,source.width,source.height).data;
  let x0=source.width,y0=source.height,x1=0,y1=0;
  for(let y=0;y<source.height;y++)for(let x=0;x<source.width;x++)if(pixels[(y*source.width+x)*4+3]>=96){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
  if(x1<=x0||y1<=y0)throw Error('Empty alpha mask');
  const sourceMargin=Math.min(x0,y0,source.width-1-x1,source.height-1-y1);
  if(sourceMargin<2)throw Error('Source artwork touches canvas edge; repair framing before export');
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.imageSmoothingEnabled=false;
  const scale=Math.min((width-4)/(x1-x0+1),(height-4)/(y1-y0+1));
  const w=Math.round((x1-x0+1)*scale),h=Math.round((y1-y0+1)*scale);
  ctx.drawImage(source,x0,y0,x1-x0+1,y1-y0+1,Math.floor((width-w)/2),height-2-h,w,h);
  const output=ctx.getImageData(0,0,width,height),hist=new Map();
  for(let i=0;i<output.data.length;i+=4){
    if(output.data[i+3]<96){output.data[i]=output.data[i+1]=output.data[i+2]=output.data[i+3]=0;continue;}
    output.data[i+3]=255;
    const key=((output.data[i]>>3)<<10)|((output.data[i+1]>>3)<<5)|(output.data[i+2]>>3);
    const entry=hist.get(key)||{rgb:[(output.data[i]>>3)*8+4,(output.data[i+1]>>3)*8+4,(output.data[i+2]>>3)*8+4],n:0};entry.n++;hist.set(key,entry);
  }
  const measure=items=>{const lo=[255,255,255],hi=[0,0,0];let total=0;for(const p of items){total+=p.n;for(let c=0;c<3;c++){lo[c]=Math.min(lo[c],p.rgb[c]);hi[c]=Math.max(hi[c],p.rgb[c]);}}let channel=0;for(let c=1;c<3;c++)if(hi[c]-lo[c]>hi[channel]-lo[channel])channel=c;return {items,total,channel,range:hi[channel]-lo[channel]};};
  const boxes=[measure([...hist.values()])];
  while(boxes.length<colors){
    let best=-1,score=-1;for(let i=0;i<boxes.length;i++)if(boxes[i].items.length>1&&boxes[i].range*Math.sqrt(boxes[i].total)>score){best=i;score=boxes[i].range*Math.sqrt(boxes[i].total);}
    if(best<0)break;
    const box=boxes.splice(best,1)[0];box.items.sort((a,b)=>a.rgb[box.channel]-b.rgb[box.channel]);let sum=0,split=1;
    for(let i=0;i<box.items.length-1;i++){sum+=box.items[i].n;split=i+1;if(sum>=box.total/2)break;}
    boxes.push(measure(box.items.slice(0,split)),measure(box.items.slice(split)));
  }
  const palette=boxes.map(b=>{const rgb=[0,0,0];for(const p of b.items)for(let c=0;c<3;c++)rgb[c]+=p.rgb[c]*p.n;return rgb.map(v=>Math.min(255,Math.round(v/b.total)));});
  const cache=new Map();
  for(let i=0;i<output.data.length;i+=4){if(!output.data[i+3])continue;const key=(output.data[i]<<16)|(output.data[i+1]<<8)|output.data[i+2];let rgb=cache.get(key);if(!rgb){let distance=Infinity;for(const p of palette){const d=(p[0]-output.data[i])**2+(p[1]-output.data[i+1])**2+(p[2]-output.data[i+2])**2;if(d<distance){distance=d;rgb=p;}}cache.set(key,rgb);}for(let c=0;c<3;c++)output.data[i+c]=rgb[c];}
  ctx.putImageData(output,0,0);
  return {png:canvas.toDataURL('image/png').split(',')[1],sourceWidth:image.width,sourceHeight:image.height,sourceMargin,palette:palette.length,alpha:'binary'};
}
app.whenReady().then(async()=>{
  const win=new BrowserWindow({show:false,webPreferences:{contextIsolation:false}});await win.loadURL('about:blank');const report=[],missing=[];
  for(const job of jobs){
    const src=path.join(ROOT,'art-source/pixel16',job.kind,job.id+'.png');
    if(!fs.existsSync(src)){missing.push(job.kind+'/'+job.id);continue;}
    let result;
    try {
      result=await win.webContents.executeJavaScript('('+exportSprite.toString()+')('+JSON.stringify({...job,url:'data:image/png;base64,'+fs.readFileSync(src).toString('base64')})+')');
    } catch (error) { throw new Error(job.kind+'/'+job.id+': '+error.message,{cause:error}); }
    const out=path.join(ROOT,'assets/pixel16',job.kind,job.id+'.png');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,Buffer.from(result.png,'base64'));delete result.png;report.push({...job,...result});
  }
  fs.mkdirSync(path.join(ROOT,'previews/pixel16'),{recursive:true});fs.writeFileSync(path.join(ROOT,'previews/pixel16',process.argv.includes('--companions-only')?'companion-export-report.json':process.argv.includes('--npcs-only')?'npc-export-report.json':'export-report.json'),JSON.stringify({sprites:report,missing},null,2));
  console.log('Exported '+report.length+'/'+jobs.length+' sprites; missing '+missing.length);
  app.exit(missing.length&&!process.argv.includes('--available')?1:0);
}).catch(e=>{console.error(e);app.exit(1);});
