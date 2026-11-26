// In-page layout measurement shared by every battle layout audit (Electron + cross-browser).
// The string is evaluated inside the game page and installs window.__lay.
module.exports = `
window.__lay=(function(){
 const R=e=>{const r=e.getBoundingClientRect();return {l:r.left,t:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height};};
 const vis=e=>{if(!e)return false;const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden')return false;const r=e.getBoundingClientRect();return r.width>1&&r.height>1;};
 const controlRect=e=>{
  const rect=R(e),scroller=e.closest('.enemy-effects');
  if(!scroller)return rect;
  const clip=R(scroller);
  return {...rect,l:Math.max(rect.l,clip.l),r:Math.min(rect.r,clip.r)};
 };
 const hit=(a,b,tol)=>Math.min(a.r,b.r)-Math.max(a.l,b.l)>(tol||2)&&Math.min(a.b,b.b)-Math.max(a.t,b.t)>(tol||2);
 const fmt=r=>Math.round(r.l)+','+Math.round(r.t)+'-'+Math.round(r.r)+','+Math.round(r.b);
 // opts.dashing: hero is allowed to overlap enemies; opts.box: which hero box to use
 function measure(opts){
  opts=opts||{};
  const v=[],isMobile=document.documentElement.classList.contains('is-mobile');
  const portrait=document.querySelector('#battle-player-panel .player-portrait');
  const visual=portrait&&portrait.querySelector('.hero-visual');
  if(!vis(portrait)||!vis(visual)){return {isMobile,violations:['hero portrait missing or not visible']};}
  const H=R(opts.visualOnly?visual:portrait),V={w:innerWidth,h:innerHeight};
  if(H.l<-1||H.t<-1||H.r>V.w+1||H.b>V.h+1)v.push('hero outside viewport '+fmt(H)+' vs '+V.w+'x'+V.h);
  const sw=Math.max(document.body.scrollWidth,document.documentElement.scrollWidth);
  if(sw>innerWidth+1)v.push('horizontal overflow '+sw+'>'+innerWidth);
  const blockers=[['topbar-home','#battle-home'],['floor-label','#battle-floor-label'],['turn-order','#battle-turn-order'],
   ['log','#battle-log'],['history','#battle-recent-history'],['companion-panel','#battle-companion-panel'],
   ['actions','#battle-actions'],['settings-gear','#open-settings']];   // submenu/toast/modal are overlays: layers() checks they draw above the hero
  if(!isMobile)blockers.push(['player-bars','#battle-player-panel .player-bars'],['player-panel','#battle-player-panel']);
  // a mobile hero dashes out of its panel over the log by design; only the viewport check applies then
  if(!(isMobile&&opts.dashing))for(const [name,sel] of blockers)for(const el of document.querySelectorAll(sel)){
   if(!vis(el))continue;const B=R(el);
   if(hit(H,B,opts.tol))v.push('hero overlaps '+name+' '+fmt(B)+' by '+Math.round(Math.min(H.b,B.b)-Math.max(H.t,B.t))+'px');
   if(sel==='#battle-actions')for(const b of el.querySelectorAll('button'))if(vis(b)&&hit(H,R(b),opts.tol))v.push('hero overlaps action button "'+b.textContent.trim().slice(0,20)+'"');
  }
  const cards=[...document.querySelectorAll('#battle-enemies .enemy-card')].filter(vis);
  if(!opts.dashing)cards.forEach((el,i)=>{if(hit(H,R(el)))v.push('hero overlaps enemy card #'+i+' '+fmt(R(el)));});
  if(isMobile&&!opts.dashing){const P=R(document.querySelector('#battle-player-panel'));if(H.l<P.l-1||H.r>P.r+1||H.t<P.t-1||H.b>P.b+1)v.push('mobile hero escapes player panel '+fmt(P));}
  for(const b of document.querySelectorAll('#battle-actions button')){if(!vis(b))continue;const r=R(b);if(r.b>V.h+1||r.r>V.w+1||r.l<-1)v.push('action button off-screen "'+b.textContent.trim().slice(0,20)+'"');}
  // enemies themselves must be on-screen and not hidden under UI
  cards.forEach((el,i)=>{const r=R(el);if(r.l<-1||r.r>V.w+1||r.t<-1)v.push('enemy card #'+i+' outside viewport '+fmt(r));
   for(const [name,sel] of [['log','#battle-log'],['actions','#battle-actions'],['topbar-home','#battle-home'],['floor-label','#battle-floor-label'],['turn-order','#battle-turn-order'],['settings-gear','#open-settings']]){const b=document.querySelector(sel);if(vis(b)&&hit(r,R(b)))v.push('enemy card #'+i+' overlaps '+name);}});
  // desktop: hero stands in FRONT of (at or below) the enemies' feet, inside the arena
  if(!isMobile&&!opts.dashing&&!opts.noFeet&&cards.length){
   const feet=Math.max(...cards.map(c=>{const a=c.querySelector('.enemy-art')||c;return R(a).b;}));
   const hb=R(visual).b;
   if(hb<feet-4)v.push('hero feet ('+Math.round(hb)+') are behind enemy feet ('+Math.round(feet)+')');
  }
  // every interactive control on the battle screen (plus the settings gear) must be clear of every other one
  {const ctl=[...document.querySelectorAll('#screen-battle button, #screen-battle [role=button], #open-settings')].filter(e=>vis(e)&&!e.closest('#battle-submenu'));
   for(let i=0;i<ctl.length;i++)for(let j=i+1;j<ctl.length;j++){const a=ctl[i],b=ctl[j];if(a.contains(b)||b.contains(a))continue;
    if(hit(controlRect(a),controlRect(b),3))v.push('controls overlap: '+(a.id||a.className||a.tagName).toString().slice(0,24)+' x '+(b.id||b.className||b.tagName).toString().slice(0,24));}}
  // action-button labels: every text node must stay inside its own button and clear of the neighbours' text
  {const nodes=[];for(const b of document.querySelectorAll('#battle-actions button')){if(!vis(b))continue;const br=R(b);
    const walk=document.createTreeWalker(b,NodeFilter.SHOW_TEXT);let n;
    while((n=walk.nextNode())){const t=n.textContent.trim();if(!t||(n.parentElement&&n.parentElement.closest('svg'))||(n.parentElement&&!vis(n.parentElement)))continue;
     const rg=document.createRange();rg.selectNodeContents(n);const tr=rg.getBoundingClientRect();if(tr.width<1)continue;
     nodes.push({b,t,tr});
     if(tr.left<br.left-1||tr.right>br.right+1||tr.top<br.top-1||tr.bottom>br.bottom+1)v.push('action label "'+t.slice(0,16)+'" spills outside its button ('+Math.round(tr.left)+'..'+Math.round(tr.right)+' vs '+Math.round(br.left)+'..'+Math.round(br.right)+')');}}
   for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const A=nodes[i].tr,C=nodes[j].tr;
    if(hit({l:A.left,r:A.right,t:A.top,b:A.bottom},{l:C.left,r:C.right,t:C.top,b:C.bottom}))v.push('action labels overlap: "'+nodes[i].t.slice(0,12)+'" x "'+nodes[j].t.slice(0,12)+'"');}}
  // top bar: the floor label must not run into the speed control / turn order / settings gear
  {const lab=document.querySelector('#battle-floor-label');
   if(vis(lab))for(const sel of ['#battle-turn-order','#speed-control','.speed-control','.speed-btn','#battle-home','#open-settings']){const o=document.querySelector(sel);if(vis(o)&&hit(R(lab),R(o)))v.push('floor label overlaps '+sel);}
   // ...nor the enemy art (boss silhouette is decorative; real enemies are checked via cards)
  }
  return {isMobile,violations:v};
 }
 // z-order: overlays that must draw above the hero (hero is z-index:3)
 function layers(){
  const v=[],hero=document.querySelector('#battle-player-panel .player-portrait');
  const hz=parseInt(getComputedStyle(hero).zIndex,10)||0;
  if(getComputedStyle(hero).position==='absolute')
  for(const sel of ['#battle-submenu','#battle-toast','#allout-modal','#modal-root']){
   const el=document.querySelector(sel);if(!el)continue;
   const cs=getComputedStyle(el);let z=parseInt(cs.zIndex,10);
   if(isNaN(z)||cs.position==='static')z=0;
   if(z<=hz)v.push(sel+' z-index '+z+' is not above hero z-index '+hz);
  }
  return v;
 }
 // Freeze every finite animation on the hero at several points and measure each frame.
 async function frozenAnimations(cls){
  const v=[],visual=document.querySelector('#battle-player-panel .hero-visual');
  visual.classList.add(cls);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  const anims=visual.getAnimations({subtree:true}).filter(a=>{const t=a.effect.getComputedTiming();return isFinite(t.endTime)&&t.endTime>0;});
  let sampled=0;
  for(const a of anims){a.pause();const end=a.effect.getComputedTiming().endTime;
   for(let i=0;i<=10;i++){a.currentTime=end*i/10;await new Promise(r=>requestAnimationFrame(r));
    const m=measure({dashing:cls==='hero-attack',visualOnly:true,noFeet:true,tol:cls==='hero-attack'?2:8});sampled++;
    m.violations.forEach(x=>v.push(cls+'@'+i*10+'% '+x));}
   a.cancel();}
  visual.classList.remove(cls);
  return {violations:v,sampled,animations:anims.length};
 }
 // Sample every frame while a real attack plays out.
 async function liveAttack(ms){
  const v=[];let frames=0,dashed=false;const start=performance.now();
  let atk=document.querySelector('#act-attack');for(let n=0;n<100&&(!atk||atk.disabled);n++){await new Promise(r=>setTimeout(r,80));atk=document.querySelector('#act-attack');}
  if(!atk||atk.disabled)return {violations:['attack button unavailable'],frames:0};
  atk.click();await new Promise(r=>setTimeout(r,60));
  const t=document.querySelector('#battle-enemies .enemy-card.targetable');if(t)t.click();
  await new Promise(res=>{(function tick(){
   const vis2=document.querySelector('#battle-player-panel .hero-visual');
   if(vis2&&vis2.classList.contains('hero-attack'))dashed=true;
   const dash=!!(vis2&&vis2.classList.contains('hero-attack'));const m=measure({dashing:dash,visualOnly:true,noFeet:true,tol:dash?2:8});frames++;
   m.violations.forEach(x=>{if(v.length<12)v.push('live@'+Math.round(performance.now()-start)+'ms '+x);});
   if(performance.now()-start<ms)requestAnimationFrame(tick);else res();})();});
  return {violations:v,frames,dashed};
 }
 function groupFloors(G){
  const by={};for(let f=1;f<100;f++){if(f%5===0&&G.Data.getMiniBoss&&G.Data.getMiniBoss(f))continue;
   const c=G.Formulas.floorEnemyCount(f);if(!G.Data.getMiniBoss(f)&&!by[c])by[c]=f;}
  let champ=null;for(let f=1;f<100;f++)if(G.Formulas.isChampionFloor(f)&&!G.Data.getMiniBoss(f)){champ=f;break;}
  return {by,champ};
 }
 return {measure,layers,frozenAnimations,liveAttack,groupFloors};
})();`;
