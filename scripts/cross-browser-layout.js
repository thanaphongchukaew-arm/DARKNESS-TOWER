// Cross-browser guard: the layout audits run in Electron (Chromium). The game is also a web page with a
// service worker, so this runs the same battle overlap measurements in Firefox and WebKit (Safari's engine),
// and reports which modern CSS features each engine lacks.
//
//   npm run test:browsers [-- --browser=firefox|webkit|chromium]     (first time: npx playwright install firefox webkit)
/* global window, document, CSS, innerWidth -- page.evaluate callbacks run inside the browser page */
const path = require('node:path');
const http = require('node:http');
const fs = require('node:fs');
const INSTALL = require('./lib/layout-measure.js');

let pw;
try { pw = require('playwright'); } catch { console.error('playwright is not installed (npm i -D playwright; npx playwright install firefox webkit)'); process.exit(2); }

const only = (process.argv.find((a) => a.startsWith('--browser=')) || '').split('=')[1];
const BROWSERS = ['firefox', 'webkit'].filter((b) => !only || only === b).concat(only === 'chromium' ? ['chromium'] : []);
const VIEWPORTS = [
  ['desktop-1440x960', 1440, 960, false], ['desktop-1280x720', 1280, 720, false], ['desktop-1000x1251', 1000, 1251, false],
  ['desktop-768x1024', 768, 1024, false], ['mobile-390x844', 390, 844, true], ['mobile-360x640', 360, 640, true], ['mobile-844x390', 844, 390, true]
];
const SCENARIOS = [
  { name: 'floor1', floor: 1, lang: 'en' },
  { name: 'boss-companion', floor: 100, boss: true, companion: 'ember_fox', lang: 'th' },
  { name: 'big-group', floor: 89, lang: 'en', companion: 'ember_fox' }
];
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
// Serve the project over http://localhost like a real deployment (file:// adds CORS errors that never happen online).
function serve() {
  const root = path.resolve('.');
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(new globalThis.URL(req.url, 'http://x').pathname).replace(/^\/+/, '') || 'index.html';
    const file = path.resolve(root, rel);
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, url: 'http://127.0.0.1:' + server.address().port + '/' })));
}

async function run() {
  const failures = []; let checks = 0;
  const { server, url: URL } = await serve();
  for (const name of BROWSERS) {
    const browser = await pw[name].launch();
    const features = {};
    for (const [tag, width, height, mobile] of VIEWPORTS) {
      const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
      const page = await ctx.newPage();
      const consoleErrors = [];
      page.on('pageerror', (e) => consoleErrors.push(String(e.message)));
      page.on('console', (m) => { if (m.type() === 'error' && !/favicon|ServiceWorker|service worker|manifest/i.test(m.text())) consoleErrors.push(m.text()); });
      await page.goto(URL + (mobile ? '?mobile=1' : ''));
      await page.evaluate(async () => {
        await document.fonts.ready; const G = window.Game; try { G.Tips.setEnabled(false); } catch { /* none */ }
        const st = document.createElement('style'); st.textContent = '*,*::before,*::after{animation:none!important;transition:none!important}.battle-entrance{display:none!important}'; document.head.appendChild(st);
      });
      await page.evaluate(INSTALL);
      features[tag] = await page.evaluate(() => ({ zoom: CSS.supports('zoom', '0.5'), has: CSS.supports('selector(:has(*))'), dvh: CSS.supports('height', '100dvh'), mobileClass: document.documentElement.classList.contains('is-mobile') }));
      for (const sc of SCENARIOS) {
        await page.evaluate(({ sc }) => {
          const G = window.Game; G.I18n.setLang(sc.lang); G.BattleUI.cancelPlayback();
          const run = G.State.createRun('normal', 'blade', 0); G.State.current = run; run.level = 30; run.currentFloor = sc.floor; run.companionId = sc.companion || null; G.State.fullRestore(run);
          G.BattleUI.startBattle(sc.floor, !!sc.boss, false);
        }, { sc });
        await page.waitForTimeout(400);
        const m = await page.evaluate(() => window.__lay.measure());
        const layers = await page.evaluate(() => window.__lay.layers());
        checks++;
        const v = [...m.violations, ...layers];
        if (m.isMobile !== mobile) v.push('expected is-mobile=' + mobile + ' got ' + m.isMobile);
        if (v.length) failures.push({ browser: name, viewport: tag, scenario: sc.name, violations: v.slice(0, 4) });
      }
      // other screens must not overflow horizontally
      for (const [label, js] of [['menu', "G.MenuUI.renderMainMenu();G.UI.showScreen('screen-menu')"], ['status', "G.TowerUI.renderStatus();G.UI.showScreen('screen-status')"], ['shop', "G.TowerUI.renderShop();G.UI.showScreen('screen-shop')"], ['tower', "G.TowerUI.renderTower();G.UI.showScreen('screen-tower')"], ['class', "G.State.pending={difficulty:'normal',ascension:0};G.MenuUI.renderClassSelect();G.UI.showScreen('screen-class')"]]) {
        await page.evaluate((code) => { const G = window.Game; G.BattleUI.cancelPlayback(); if (!G.State.current) G.State.createRun('normal', 'blade', 0); new Function('G', code)(G); }, js);
        await page.waitForTimeout(150);
        const over = await page.evaluate(() => Math.max(document.body.scrollWidth, document.documentElement.scrollWidth) - innerWidth);
        checks++; if (over > 1) failures.push({ browser: name, viewport: tag, scenario: 'screen-' + label, violations: ['horizontal overflow by ' + over + 'px'] });
      }
      if (consoleErrors.length) failures.push({ browser: name, viewport: tag, scenario: 'console', violations: [...new Set(consoleErrors)].slice(0, 3) });
      await ctx.close();
    }
    const f = Object.values(features)[0];
    console.log(name + ' ' + (await browser.version()) + ': CSS zoom=' + f.zoom + ', :has()=' + f.has + ', dvh=' + f.dvh);
    await browser.close();
  }
  server.close();
  if (failures.length) {
    console.error('Cross-browser layout FAILED: ' + failures.length + '/' + checks + ' checks');
    failures.slice(0, 30).forEach((f) => { console.error(' - ' + f.browser + ' ' + f.viewport + ' / ' + f.scenario); f.violations.forEach((x) => console.error('     ' + x)); });
    return 1;
  }
  console.log('Cross-browser layout OK: ' + checks + ' checks in ' + BROWSERS.join(' + '));
  return 0;
}
run().then((c) => process.exit(c), (e) => { console.error(e); process.exit(1); });
