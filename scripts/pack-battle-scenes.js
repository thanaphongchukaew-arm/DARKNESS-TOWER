// Technical export only: preserve imagegen-authored composition on a 384x256, 48-color grid.
/* global Image, document */
const {app,BrowserWindow}=require('electron'),fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve('.'),ctx=vm.createContext({window:{Game:{}}});vm.runInContext(fs.readFileSync('js/battle-scenes.js','utf8'),ctx);const keys=ctx.window.Game.BattleScenes.keys;
async function pack(url){
 const image=new Image();image.src=url;await image.decode();const colors=48,width=384,height=256;
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.imageSmoothingEnabled=false;ctx.drawImage(image,0,0,width,height);
 const output=ctx.getImageData(0,0,width,height),hist=new Map();
 for(let i=0;i<output.data.length;i+=4){output.data[i+3]=255;const key=((output.data[i]>>3)<<10)|((output.data[i+1]>>3)<<5)|(output.data[i+2]>>3);const e=hist.get(key)||{rgb:[(output.data[i]>>3)*8+4,(output.data[i+1]>>3)*8+4,(output.data[i+2]>>3)*8+4],n:0};e.n++;hist.set(key,e);}
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
 return {png:canvas.toDataURL('image/png').split(',')[1],width,height,colors:palette.length};
}
app.whenReady().then(async()=>{const w=new BrowserWindow({show:false});await w.loadURL('about:blank');const report=[];for(const key of keys){const src=path.join(root,'art-source/pixel16/scenes',key+'-retro.png');if(!fs.existsSync(src)){if(process.argv.includes('--available'))continue;throw Error('Missing '+src);}const result=await w.webContents.executeJavaScript('('+pack.toString()+')('+JSON.stringify('data:image/png;base64,'+fs.readFileSync(src).toString('base64'))+')');fs.mkdirSync('assets/pixel16/scenes',{recursive:true});fs.writeFileSync('assets/pixel16/scenes/'+key+'.png',Buffer.from(result.png,'base64'));delete result.png;report.push({key,...result});}fs.mkdirSync('previews/battle-scenes',{recursive:true});fs.writeFileSync('previews/battle-scenes/export-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify({exported:report.length,expected:keys.length}));app.exit();}).catch(e=>{console.error(e);app.exit(1);});
