// Battle layout guard. The hero must never overlap the HUD / log / panels / actions / enemies
// (except while deliberately dashing at them), must stay inside the viewport, and must stand
// in front of the enemies on the scene floor.
//
// Coverage: 17 viewports (both sides of every CSS breakpoint) x scenarios:
//   * floors / boss / companion / both languages / submenu open
//   * every playable class
//   * every enemy-group size the tower produces (+ champion)
//   * UI stress states: expanded history, very long log, long toast, status ailments,
//     poison/burn/overdrive auras, level-up, won, lost
//   * hero animations frozen at 11 points of their timeline (attack dash, cast, hurt, guard)
//   * a real attack played live and sampled every frame
//   * browser zoom 67% - 200%
//   * stacking order of the submenu / toast / modal layers vs the hero
// Run: npm run test:layout [-- --quick] [-- --shots]      exit code 1 on any violation.
const {app,BrowserWindow}=require('electron'),fs=require('fs'),path=require('path'),os=require('os');
app.setPath('userData',fs.mkdtempSync(path.join(os.tmpdir(),'battle-layout-')));
app.on('window-all-closed',()=>{});

const OUT=path.resolve('previews/battle-layout');
const SAVE_SHOTS=process.argv.includes('--shots');
const QUICK=process.argv.includes('--quick');

// [tag, width, height, mobile]. Boundaries: 1250px (hero shrinks), aspect 4/5 (hero re-anchors).
const VIEWPORTS=[
 ['desktop-1920x1080',1920,1080,false],
 ['desktop-1680x1474',1680,1474,false],   // the original bug report
 ['desktop-1440x960',1440,960,false],
 ['desktop-1366x768',1366,768,false],
 ['desktop-1280x720',1280,720,false],
 ['desktop-1251x900',1251,900,false],     // just above the 1250 breakpoint
 ['desktop-1249x900',1249,900,false],     // just below it
 ['desktop-1024x768',1024,768,false],
 ['desktop-1000x1250',1000,1250,false],   // aspect exactly 4/5
 ['desktop-1000x1251',1000,1251,false],   // just narrower than 4/5
 ['desktop-1000x1249',1000,1249,false],   // just wider than 4/5
 ['desktop-768x1024',768,1024,false],     // portrait tablet
 ['desktop-1024x1366',1024,1366,false],
 ['desktop-2560x1440',2560,1440,false],
 ['mobile-390x844',390,844,true],
 ['mobile-360x640',360,640,true],
 ['mobile-844x390',844,390,true],         // phone landscape
];
const QUICK_VIEWPORTS=['desktop-1680x1474','desktop-1366x768','desktop-1249x900','desktop-1000x1251','desktop-768x1024','mobile-390x844','mobile-844x390'];
// Viewports that also get the zoom sweep (zoom changes the CSS viewport, so it re-hits breakpoints).
const ZOOM_VIEWPORTS=['desktop-1440x960','desktop-1280x720','mobile-390x844'];
const ZOOMS=[0.67,0.8,1.25,1.5,2];
// Viewports that also play a real attack and sample every frame.
const LIVE_VIEWPORTS=['desktop-1440x960','desktop-1000x1251','desktop-1249x900','mobile-390x844'];

// ---- in-page helpers (installed once per window as window.__lay) -------------------------------
const INSTALL=require('./lib/layout-measure.js');

const STRESS={
 'history-open':`const d=document.getElementById('battle-recent-history');if(d){d.open=true;d.querySelector('ol').innerHTML=Array.from({length:10},(_,i)=>'<li>Action '+i+' with a deliberately long description that wraps onto several lines to stress the layout of the history panel</li>').join('');}`,
 'long-log':`const l=document.getElementById('battle-log');for(let i=0;i<40;i++){const p=document.createElement('div');p.className='log-line';p.textContent='Very long log line number '+i+' that goes on and on to test wrapping inside the battle log container';l.appendChild(p);}`,
 'long-toast':`const t=document.getElementById('battle-toast');t.textContent='A VERY LONG TOAST MESSAGE THAT KEEPS GOING TO SEE IF IT COLLIDES WITH THE HERO OR THE HUD';t.classList.remove('hidden');`,
 'ailments':`const r=G.State.current;r.ailments=[{id:'poison',turns:3},{id:'burn',turns:2},{id:'silence',turns:1},{id:'slow',turns:2}];G.BattleUI.refreshActiveScreen();`,
 'auras':`const p=document.querySelector('#battle-player-panel .player-portrait');p.classList.add('has-poison','has-burn','overdrive-ready');`,
 'levelup':`document.getElementById('screen-battle').classList.add('hero-levelup');`,
 'won':`document.getElementById('screen-battle').classList.add('battle-won');`,
 'lost':`document.getElementById('screen-battle').classList.add('battle-lost');`,
 'guard':`document.querySelector('#battle-player-panel .hero-visual').classList.add('is-guarding','hero-guard');`,
};

app.whenReady().then(async()=>{
 const failures=[],summary=[],consoleErrors=[];let checks=0;
 const viewports=QUICK?VIEWPORTS.filter(v=>QUICK_VIEWPORTS.includes(v[0])):VIEWPORTS;
 const settle=ms=>new Promise(r=>setTimeout(r,ms));
 for(const [tag,width,height,mobile] of viewports){
  const w=new BrowserWindow({width,height,useContentSize:true,show:false,webPreferences:{contextIsolation:false,backgroundThrottling:false}});
  w.webContents.on('console-message',e=>{if(e.level==='error'&&!/favicon|Autofill|DevTools/.test(e.message))consoleErrors.push({viewport:tag,message:String(e.message).slice(0,200)});});
  const run=s=>w.webContents.executeJavaScript('(async()=>{const G=Game;'+s+'})()');
  await w.loadURL(require('url').pathToFileURL(path.resolve('index.html')).href+(mobile?'?mobile=1':''));
  await run(`await document.fonts.ready;G.Tips.setEnabled(false);document.querySelector('#tip-card-ok')?.click();const st=document.createElement('style');st.id='lay-noanim';st.textContent='*,*::before,*::after{animation:none!important;transition:none!important}.battle-entrance{display:none!important}';document.head.appendChild(st);`);
  await run(INSTALL);
  const classes=await run(`return G.Data.classes.map(c=>c.id);`);
  const groups=await run(`return window.__lay.groupFloors(G);`);
  const scenarios=[
   {name:'floor1',floor:1,lang:'th'},
   {name:'floor1-en',floor:1,lang:'en'},
   {name:'floor50-companion',floor:50,companion:'ember_fox',lang:'th'},
   {name:'floor100-boss',floor:100,boss:true,lang:'en'},
   {name:'floor100-boss-companion',floor:100,boss:true,companion:'ember_fox',lang:'th'},
   {name:'floor10-submenu',floor:10,lang:'th',submenu:true},
   ...(QUICK?classes.slice(0,2):classes).map(c=>({name:'class-'+c,floor:1,lang:'th',cls:c})),
   ...Object.entries(groups.by).map(([n,f])=>({name:'enemies-x'+n,floor:f,lang:'en'})),
   ...Object.entries(groups.by).map(([n,f])=>({name:'enemies-x'+n+'-companion',floor:f,lang:'th',companion:'ember_fox'})),
   ...(groups.champ?[{name:'champion',floor:groups.champ,lang:'th'}]:[]),
   ...Object.keys(STRESS).flatMap(k=>[{name:'state-'+k,floor:1,lang:'th',stress:k},{name:'state-'+k+'-boss-comp-en',floor:100,boss:true,companion:'ember_fox',lang:'en',stress:k}]),
  ];
  let lastCls=null;
  async function startScenario(sc){
   const cls=sc.cls||'blade';
   if(lastCls!==cls){await run(`G.BattleUI.cancelPlayback();G.State.createRun('normal','${cls}');`);lastCls=cls;}
   await run(`G.I18n.setLang('${sc.lang}');G.BattleUI.cancelPlayback();const run=G.State.current;run.ailments=[];run.companionId=${JSON.stringify(sc.companion||null)};run.currentFloor=${sc.floor};G.State.fullRestore(run);G.BattleUI.startBattle(${sc.floor},${!!sc.boss},false);`);
   await run(`await Promise.all([...document.querySelectorAll('.battle-scene-art,.hero-visual img,.enemy-art img')].map(i=>i.decode?i.decode().catch(()=>{}):0));`);
   await run(`const d=document.getElementById('battle-recent-history');if(d)d.open=false;`);
   await settle(QUICK?90:130);
  }
  function record(sc,list,extra){
   checks++;const row={viewport:tag,scenario:sc.name,violations:list,...(extra||{})};summary.push(row);if(list.length)failures.push(row);return row;
  }
  async function shot(row){if(SAVE_SHOTS||row.violations.length){fs.mkdirSync(OUT,{recursive:true});fs.writeFileSync(path.join(OUT,(row.viewport+'-'+row.scenario).replace(/[^\w.-]+/g,'_')+(row.violations.length?'-FAIL':'')+'.png'),(await w.webContents.capturePage()).toPNG());}}

  for(const sc of scenarios){
   await startScenario(sc);
   if(sc.submenu){await run(`const b=[...document.querySelectorAll('#battle-actions button')].filter(x=>!x.disabled)[1]||document.querySelector('#battle-actions button');b&&b.click();`);await settle(120);}
   if(sc.stress){await run(STRESS[sc.stress]);await settle(60);}
   const m=await run(`return window.__lay.measure();`);
   const list=[...m.violations];
   if(m.isMobile!==mobile)list.push('expected is-mobile='+mobile+' but got '+m.isMobile);
   list.push(...await run(`return window.__lay.layers();`));
   await shot(record(sc,list));
  }

  // Hero animations frozen at points along their timeline (animations enabled just for this).
  {
   await run(`document.getElementById('lay-noanim').disabled=true;`);
   for(const [name,floor,companion,lang] of [['floor1',1,null,'th'],['boss-comp',100,'ember_fox','en']]){
    const sc={name:'anim-'+name,floor,boss:floor===100,companion,lang};await startScenario(sc);
    await run(`document.getElementById('lay-noanim').disabled=true;document.querySelectorAll('.battle-entrance').forEach(e=>e.remove());`);
    const list=[];let sampled=0;
    for(const cls of ['hero-attack','hero-cast','hero-hurt','hero-guard']){const r=await run(`return await window.__lay.frozenAnimations('${cls}');`);list.push(...r.violations);sampled+=r.sampled;}
    await shot(record(sc,list.slice(0,12),{sampled}));
   }
   if(LIVE_VIEWPORTS.includes(tag)){
    const sc={name:'live-attack',floor:1,lang:'th'};await startScenario(sc);
    await run(`document.getElementById('lay-noanim').disabled=true;`);await settle(1700);   // entrance
    const r=await run(`return await window.__lay.liveAttack(3200);`);
    const list=[...r.violations];if(!r.dashed&&!mobile)list.push('live attack never produced a hero-attack animation (test is blind)');
    await shot(record(sc,list,{frames:r.frames,dashed:r.dashed}));
   }
   await run(`document.getElementById('lay-noanim').disabled=false;`);
  }

  // Browser zoom: shrinks/grows the CSS viewport, re-triggering breakpoints.
  if(!QUICK&&ZOOM_VIEWPORTS.includes(tag)){
   for(const z of ZOOMS){
    w.webContents.setZoomFactor(z);await settle(250);
    for(const sc of [{name:'zoom'+z+'-floor1',floor:1,lang:'th'},{name:'zoom'+z+'-boss-comp-en',floor:100,boss:true,companion:'ember_fox',lang:'en'},{name:'zoom'+z+'-submenu',floor:10,lang:'th',submenu:true}]){
     await startScenario(sc);
     if(sc.submenu){await run(`const b=[...document.querySelectorAll('#battle-actions button')].filter(x=>!x.disabled)[1]||document.querySelector('#battle-actions button');b&&b.click();`);await settle(120);}
     const m=await run(`return window.__lay.measure();`);
     await shot(record(sc,[...m.violations]));
    }
   }
   w.webContents.setZoomFactor(1);
  }
  await run('G.BattleUI.cancelPlayback();');
  w.destroy();
 }
 for(const [i,e] of [...new Map(consoleErrors.map(e=>[e.message,e])).values()].entries())failures.push({viewport:e.viewport,scenario:'console-error#'+i,violations:[e.message]});
 fs.mkdirSync(OUT,{recursive:true});
 fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify({checks,failures,summary},null,2));
 if(failures.length){
  console.error('Battle layout FAILED: '+failures.length+'/'+checks+' checks');
  const shown=failures.slice(0,40);
  for(const f of shown){console.error(' - '+f.viewport+' / '+f.scenario);f.violations.slice(0,4).forEach(x=>console.error('     '+x));}
  if(failures.length>shown.length)console.error(' ... '+(failures.length-shown.length)+' more (see report.json)');
  console.error('Screenshots + report: '+path.relative('.',OUT));
 }else console.log('Battle layout OK: '+checks+' checks across '+viewports.length+' viewports');
 app.exit(failures.length?1:0);
}).catch(e=>{console.error(e);app.exit(1);});
