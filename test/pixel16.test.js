const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const zlib=require('node:zlib');
const crypto=require('node:crypto');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function game(){const context=vm.createContext({window:{Game:{}}});for(const f of ['pixel-art','pixel-sprites','data-classes','data-enemies','class-art','hero-art','monster-art','battle-art'])vm.runInContext(fs.readFileSync(path.join(root,'js',f+'.js'),'utf8'),context);return context.window.Game;}
function inspectPNG(file){
 const png=fs.readFileSync(file);assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');const width=png.readUInt32BE(16),height=png.readUInt32BE(20);assert.equal(png[24],8);assert.equal(png[25],6,'RGBA export');
 const chunks=[];for(let at=8;at<png.length;){const length=png.readUInt32BE(at),type=png.subarray(at+4,at+8).toString();if(type==='IDAT')chunks.push(png.subarray(at+8,at+8+length));at+=12+length;}
 const data=zlib.inflateSync(Buffer.concat(chunks)),stride=width*4,rows=Buffer.alloc(stride*height);let offset=0;
 const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
 for(let y=0;y<height;y++){const filter=data[offset++];for(let x=0;x<stride;x++){const at=y*stride+x,a=x>=4?rows[at-4]:0,b=y?rows[at-stride]:0,c=y&&x>=4?rows[at-stride-4]:0;const prediction=[0,a,b,Math.floor((a+b)/2),paeth(a,b,c)][filter];assert.notEqual(prediction,undefined);rows[at]=(data[offset++]+prediction)&255;}}
 const palette=new Set();let opaque=0,clear=0;for(let i=0;i<rows.length;i+=4){assert.ok(rows[i+3]===0||rows[i+3]===255,'no smoothed alpha');if(rows[i+3]){opaque++;palette.add(rows.subarray(i,i+3).toString('hex'));}else clear++;}
 for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(x<2||x>=width-2||y<2||y>=height-2)assert.equal(rows[(y*width+x)*4+3],0,'complete transparent border around '+file);
 assert.ok(opaque>30&&clear>30,'real nonempty transparent sprite');return {width,height,colors:palette.size,hash:crypto.createHash('sha256').update(rows).digest('hex')};
}
test('all class designs are exported as native 64x80 sprites with <=24 colors',()=>{
 const g=game(),seen=new Set();for(const c of g.Data.classes){const file='assets/pixel16/classes/'+c.icon+'.png',info=inspectPNG(path.join(root,file));assert.equal(info.width,64,c.id);assert.equal(info.height,80,c.id);assert.ok(info.colors<=24,c.id);assert.ok(!seen.has(info.hash),c.id+' duplicate');seen.add(info.hash);assert.ok(g.ClassArt.render(c.icon).includes(file),c.id);}
});
test('all 100 original monster identities keep their names and attacks and use distinct native sprites',()=>{
 const g=game(),baseline=require('../previews/pixel16/original-monster-identities.json'),seen=new Set();assert.equal(g.Data.getAllEnemyTemplates().length,baseline.length);
 for(const original of baseline){const e=g.Data.getEnemyTemplate(original.id);assert.ok(e,original.id);assert.equal(e.name,original.name);assert.equal(e.nameEn,original.nameEn);assert.equal(JSON.stringify(e.baseStats),JSON.stringify(original.baseStats));assert.equal(JSON.stringify(e.attacks.map(a=>({nameEn:a.nameEn,element:a.element,power:a.power,target:a.target}))),JSON.stringify(original.attacks));const file='assets/pixel16/monsters/'+e.id+'.png',info=inspectPNG(path.join(root,file));assert.ok(info.width<=128&&info.height<=128,e.id);assert.ok(info.colors<=(e.isBoss?32:24),e.id);assert.ok(!seen.has(info.hash),e.id+' duplicate');seen.add(info.hash);const html=g.BattleArt.enemy(e);assert.ok(html.includes(file),e.id);assert.ok(html.includes('data-facing="left"'),e.id);assert.ok(!html.includes('undefined'),e.id);}
 assert.equal(g.MonsterArt.has('toString'),false);
});
test('boss phase art is distinct; every runtime asset is shipped and cached offline',()=>{
 const g=game(),sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');assert.ok(require('../package.json').build.files.includes('assets/pixel16/**'));
 const paths=g.Data.classes.map(c=>'assets/pixel16/classes/'+c.icon+'.png').concat(g.Data.getAllEnemyTemplates().map(e=>'assets/pixel16/monsters/'+e.id+'.png'));
 const hashes=new Set();for(let phase=1;phase<=4;phase++){const file='assets/pixel16/monsters/timeless_sovereign'+(phase>1?'-phase-'+phase:'')+'.png';const info=inspectPNG(path.join(root,file));assert.ok(!hashes.has(info.hash));hashes.add(info.hash);assert.ok(g.BattleArt.enemy({...g.Data.boss,phase}).includes(file));if(phase>1)paths.push(file);}
 for(const file of paths)assert.ok(sw.includes("'./"+file+"'"),file);
});
