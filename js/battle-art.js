// Code-native pixel illustrations: enemy identity, set dressing, and readable statuses.
(function () {
  var G = window.Game;
  function svg(body, cls) { return '<svg xmlns="http://www.w3.org/2000/svg" class="pixel-sprite ' + (cls || '') + '" viewBox="0 0 64 64" shape-rendering="crispEdges" aria-hidden="true">' + body + '</svg>'; }
  function profile(enemy) {
    var template = G.Data.getEnemyTemplate(enemy.templateId || enemy.id) || {}, stats = template.baseStats || enemy, id = enemy.templateId || enemy.id || enemy.icon || '';
    var role = /golem|knight|guard|colossus|titan|sentinel|tortoise|juggernaut/.test(id) ? 'tank' : /mage|witch|oracle|seer|lich|priest|shaman|sorcer|timeless_sovereign|timeless_herald/.test(id) || stats.mag > stats.atk * 1.2 ? 'caster' : /wolf|bat|harpy|spider|assassin|hawk|raptor|stalker/.test(id) || stats.spd > Math.max(stats.def, 1) * 1.8 ? 'swift' : 'striker';
    var motion = /slime|ooze|jelly/.test(id) ? 'squash' : /ghost|wraith|spirit|sprite|elemental|bat|harpy|wisp|seraph|banshee|djinn|cherub|falcon|hawk/.test(id) ? 'float' : /serpent|eel|wyrm|hydra/.test(id) ? 'coil' : /wyvern|dragon|drake/.test(id) ? 'flap' : /hound|lynx|spider|beast|stalker|wolf/.test(id) ? 'prowl' : role === 'tank' ? 'heavy' : role === 'swift' ? 'prowl' : 'breathe';
    if (enemy.isBoss) motion = 'breathe';
    return { role: role, motion: motion };
  }
  function sovereign(phase) {
    var gold = phase >= 3 ? '#fff0ae' : '#d8af62', light = phase >= 4 ? '#ff94b3' : phase >= 2 ? '#8df0ef' : '#bca5ec';
    return '<g class="sovereign-orbit" fill="none" stroke="' + light + '" opacity=".7"><path d="M22 3H42L54 15V35L42 47H22L10 35V15Z"/><path d="M32 0V6M53 8L49 12M59 25H53M53 43L49 39M32 51V45M11 43L15 39M5 25H11M11 8L15 12"/></g>' +
      '<g class="enemy-body"><path d="M21 24L14 35 8 60 23 57 32 62 41 57 56 60 50 35 43 24Z" fill="#0c0c22" stroke="#060713" stroke-width="2"/><path d="M22 29L16 55 25 51 30 59 30 30ZM42 29L48 55 39 51 34 59 34 30Z" fill="#38294d"/><path d="M17 36L12 56M47 36L52 56M25 37L22 52M39 37L42 52" stroke="#6b476d" stroke-width="2"/>' +
      '<path d="M20 23L13 27 11 34 21 35 25 28ZM44 23L51 27 53 34 43 35 39 28Z" fill="#55516c" stroke="' + gold + '" stroke-width="2"/><path d="M17 27L15 31H21M47 27L49 31H43" fill="none" stroke="#b4adbc"/>' +
      '<path d="M23 14L27 9H37L41 14V25L36 29H28L23 25Z" fill="#17152c" stroke="#66547d"/><path d="M21 8L23 3 28 8 31 4 33 8 39 2 40 9 44 5 42 14H22Z" fill="' + gold + '" stroke="#382838"/><path d="M35 5L33 11 36 13" fill="none" stroke="#191429"/><path d="M26 19H30V21H26ZM34 19H38V21H34Z" fill="' + light + '"/><path d="M27 24H37L34 27H30Z" fill="#55425b"/>' +
      '<path d="M25 29H39L42 40 36 46H28L22 40Z" fill="#292b43" stroke="' + gold + '"/><path d="M28 31H36L40 35V39L36 43H28L24 39V35Z" fill="#101c2d" stroke="' + gold + '"/><path d="M32 32V37L36 39" fill="none" stroke="' + light + '" stroke-width="2"/><path d="M31 30H33M31 44H33M23 36V38M41 36V38" stroke="' + gold + '"/>' +
      '<path d="M13 35H18V46H12ZM46 35H51L52 46H46Z" fill="#655f7e" stroke="#111323"/><path d="M16 39L14 58M48 39L50 58" stroke="' + gold + '" stroke-width="2"/></g>' +
      (phase >= 2 ? '<g class="sovereign-fragments" fill="' + light + '"><path d="M4 18L8 16 7 22ZM55 13L59 17 55 20ZM6 40L9 37 10 43ZM54 42L58 45 54 48Z"/></g>' : '') +
      (phase >= 3 ? '<path d="M19 14L12 8M45 14L52 8M19 47L13 54M45 47L51 54" stroke="' + light + '" stroke-width="2"/>' : '') +
      (phase >= 4 ? '<g class="sovereign-rift" fill="none" stroke="#ff94b3"><path d="M32 0L29 14 34 27 30 40 33 64"/><path d="M26 1L24 15M40 48L42 62"/></g>' : '');
  }
  function enemy(enemy) {
    var p = profile(enemy), phase = Math.max(1, Math.min(4, enemy.phase || 1)), body;
    if (G.MonsterArt && G.MonsterArt.has(enemy)) body = G.MonsterArt.body(enemy);
    else if (enemy.templateId === 'timeless_sovereign' || enemy.id === 'timeless_sovereign' || enemy.icon === 'timelessSovereign') body = sovereign(phase);
    else {
      var base = G.PixelArt.render(enemy.icon), width = p.role === 'tank' ? 46 : 40;
      body = '<g class="enemy-body"><svg x="' + (32 - width / 2) + '" y="8" width="' + width + '" height="46">' + base + '</svg></g>';
      if (p.role === 'caster') body += '<g class="role-casting" fill="none" stroke="#a3c8ff"><path d="M13 52L21 47H43L51 52 43 57H21Z"/><path d="M17 43L14 39 17 35M47 43L50 39 47 35"/></g>';
      if (p.role === 'tank') body += '<g fill="#575d72" stroke="#b2abb5"><path d="M10 28L16 24 19 30 17 39H10ZM54 28L48 24 45 30 47 39H54Z"/></g>';
      if (p.role === 'swift') body += '<path d="M9 48H17M6 52H14M47 48H55M50 52H58" stroke="#8cbfb5" opacity=".7"/>';
      if (enemy.isBoss) body += '<path d="M20 8L21 2 27 6 32 1 37 6 43 2 44 8" fill="#c99d59" stroke="#302339"/><path d="M15 55L24 59H40L49 55" fill="none" stroke="' + ['#c99d59','#8de7e0','#ee92bf','#fff1b2'][phase - 1] + '" stroke-width="2"/>';
    }
    if (enemy.champion || enemy.elite) body += '<g class="champion-crest" fill="#ffda86" stroke="#69472f"><path d="M3 6L7 2 11 6 7 10ZM53 6L57 2 61 6 57 10Z"/><path d="M4 13V20M60 13V20"/></g>';
    return '<span class="enemy-art icon motion-' + p.motion + ' amb-' + ambienceFor(enemy)[1] + ' role-' + p.role + ' phase-' + phase + '" data-phase="' + phase + '">' + svg(body, 'enemy-illustration') + '</span>';
  }
  var props = {
    roots: '<path d="M5 61L14 40 11 27 17 32 20 49 29 59M15 47L27 36 32 20 34 37 27 49 41 55M34 59L46 43 48 22 52 30 51 48 60 61" fill="#384b3d" stroke="#1b2930" stroke-width="3"/>',
    crystal: '<path d="M9 59L5 40 13 31 21 43 19 60ZM23 60L18 26 29 7 39 26 35 60ZM40 60L38 39 49 25 58 43 52 60Z" fill="#559caf" stroke="#b1ded5"/><path d="M29 10V57M49 29L44 57M13 34L16 56" stroke="#c5ede5"/>',
    rubble: '<path d="M3 60L5 49 17 43 24 49 19 61ZM23 61L29 47 43 44 54 51 60 61Z" fill="#5b5966" stroke="#272734"/><path d="M13 45L13 16H31V26H24V42L30 48" fill="#77737c" stroke="#b2a99e"/><path d="M13 28H22M15 35H22" stroke="#353442"/>',
    chains: '<g fill="none" stroke="#8f8796" stroke-width="2"><path d="M16 0V10H22V18H16V26H22V34H16V42M44 0V8H50V16H44V24H50V32H44V40"/></g><path d="M13 40H25L28 51 22 59H14L9 51ZM41 38H53L56 49 50 57H42L37 49Z" fill="#4a465c" stroke="#a7a0aa"/>',
    lava: '<path d="M0 62L9 43 21 46 30 35 43 40 52 33 64 48V64Z" fill="#3c303b"/><path d="M7 64L17 51 28 53 34 44 43 49 54 42 61 49" fill="none" stroke="#ec8150" stroke-width="3"/><path d="M20 33V28M40 29V24M52 20V16" stroke="#ffc17a" stroke-width="2"/>',
    gears: '<path d="M18 17H26V23H32V31H26V37H18V31H12V23H18ZM39 34H47V40H53V48H47V54H39V48H33V40H39Z" fill="#8f7656" stroke="#c8ab74"/><path d="M20 25H24V29H20ZM41 42H45V46H41Z" fill="#191c2c"/><path d="M5 59H59V64H5Z" fill="#424351"/>',
    bones: '<path d="M7 55L14 49 26 54 40 42 47 48 31 61Z" fill="#c1b5a0" stroke="#57545b"/><path d="M39 25L46 19H56L61 25V37L56 43H44L38 37Z" fill="#b4aa9b" stroke="#57545b"/><path d="M42 28H47V33H42ZM52 28H57V33H52ZM47 37H53V41H47Z" fill="#292836"/>',
    frost: '<path d="M0 64L8 44 19 47 28 33 36 43 51 32 64 48V64Z" fill="#6695b0" stroke="#b7d4da"/><path d="M12 43V15M3 24L21 34M3 34L21 24M45 30V4M36 12L54 22M36 22L54 12" stroke="#bde5ef" stroke-width="2"/>',
    astrolabe: '<path d="M17 60L27 43H37L47 60Z" fill="#62546f" stroke="#b8a479"/><g fill="none" stroke="#c3a56c"><path d="M22 9H42L52 19V37L42 47H22L12 37V19Z"/><path d="M16 16L48 40M16 40L48 16M32 7V49M10 28H54"/></g><path d="M29 25H35V31H29Z" fill="#9fd3ec"/>'
  };
  var zones = ['roots','rubble','chains','bones','lava','crystal','rubble','chains','bones','lava','gears','roots','frost','astrolabe','gears','astrolabe'];
  function zone(tier, boss) {
    var id = boss ? 'astrolabe' : zones[Math.max(0, Math.min(15, tier - 1))];
    return [id, id === 'chains' ? 'rubble' : 'chains', id === 'astrolabe' ? 'crystal' : id].map(function (prop) { return '<span class="zone-prop prop-' + prop + '">' + svg(props[prop], 'zone-illustration') + '</span>'; }).join('');
  }
  var statusPaths = {
    poison: '<path d="M32 5L16 28V43L24 51H40L48 43V28Z" fill="#8cce8d"/><path d="M23 31H29V37H23ZM35 31H41V37H35ZM28 42H36V46H28Z" fill="#172523"/>',
    burn: '<path d="M33 3L42 21 44 14 53 32V45L42 57H23L12 46V32L23 17 24 29Z" fill="#ee9a59"/><path d="M32 28L41 43 36 52H27L23 44Z" fill="#ffe8a1"/>',
    silence: '<path d="M9 12H55V43H30L19 54V43H9Z" fill="#a8b5e4"/><path d="M20 26H44M13 54L53 6" stroke="#25253e" stroke-width="6"/>',
    buff: '<path d="M32 6L55 29H42V56H22V29H9Z" fill="#9cdeb3"/><path d="M29 25H35V47H29Z" fill="#d9ffdc"/>',
    debuff: '<path d="M22 8H42V35H55L32 58 9 35H22Z" fill="#ee9fbb"/><path d="M29 17H35V39H29Z" fill="#ffdbdf"/>'
  };
  function status(id) { return svg(statusPaths[id] || statusPaths.debuff, 'status-illustration'); }
  function escape(value) { return String(value).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function chip(id, label, description, turns, extraClass) {
    var duration = G.Systems.text('เหลือ ' + turns + ' เทิร์น', turns + ' turns remaining');
    return '<button type="button" class="status-chip ' + (extraClass || '') + '" aria-label="' + escape(label + ': ' + description + ' · ' + duration) + '">' + status(id) + '<span>' + escape(label) + '</span><b class="status-turns">' + escape(turns) + '</b><span class="status-tip" aria-hidden="true">' + escape(description + ' · ' + duration) + '</span></button>';
  }
  // Explicit tap support also works on browsers that do not focus tapped buttons.
  if (typeof document !== 'undefined') {
    document.addEventListener('click', function (event) {
      var selected = event.target.closest ? event.target.closest('.status-chip') : null;
      document.querySelectorAll('.status-chip.is-open').forEach(function (chip) { if (chip !== selected) chip.classList.remove('is-open'); });
      if (selected) selected.classList.add('is-open');
      else if (document.activeElement && document.activeElement.classList.contains('status-chip')) document.activeElement.blur();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      var opened = document.querySelector('.status-chip.is-open');
      if (!opened) return;
      opened.classList.remove('is-open'); opened.blur();
      event.preventDefault(); event.stopImmediatePropagation();
    });
    document.addEventListener('focusin', function (event) {
      document.querySelectorAll('.status-chip.is-open').forEach(function (chip) { if (chip !== event.target) chip.classList.remove('is-open'); });
    });
  }
    function ring(e) { return '<span class="enemy-ground-ring ring-' + profile(e).motion + '"' + (G.MonsterArt ? G.MonsterArt.ground(e) : '') + '></span>'; }
  // Ambient particles by monster family: embers, snow, sparks, spores... Deterministic per monster id.
  var ambience = [
    [/sand|dust|scarab|djinn/, 'sand', 5], [/flame|inferno|magma|lava|cinder|pyroclast|ash|crimson|hell|forge|obsidian/, 'embers', 6],
    [/frost|glacial|rime|frozen|ice/, 'snow', 6], [/thunder|storm|spark|tempest/, 'sparks', 4],
    [/tide|drowned|siren|abyssal|leviathan|eel/, 'drops', 5], [/bog|venom|spore|fungal|swamp|thorn|rootbound|blight|hydra|slime/, 'spores', 5],
    [/gust|cloud|gale|harpy|falcon|hawk/, 'wind', 4],
    [/seraph|sanctum|chrono|timeless|choir|star|nebula|chaos|flux|discord|astral|prism|wisp|cherub|twilight|chime/, 'holy', 5],
    [/wraith|banshee|revenant|reaper|void|shadow|doom|abyss|archdevil|succubus|bat|imp|pit|duke|dragon|wolf/, 'shade', 5],
    [/./, 'dust', 3]
  ];
  function ambienceFor(e) {
    var id = e.templateId || e.id || '', i;
    for (i = 0; i < ambience.length; i++) if (ambience[i][0].test(id)) return ambience[i];
    return ambience[ambience.length - 1];
  }
  function seedOf(id) { var seed = 7, i; for (i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) % 2147483647; return seed; }
  function particles(seed, n, tMin, tSpan) {
    var out = '', i, t;
    function rnd() { seed = (seed * 48271) % 2147483647; return seed / 2147483647; }
    for (i = 0; i < n; i++) {
      t = tMin + rnd() * tSpan;
      out += '<i style="--x:' + (8 + rnd() * 84).toFixed(0) + '%;--y:' + (rnd() * 30).toFixed(0) + '%;--s:' + (2 + rnd() * 2).toFixed(1) + 'px;--t:' + t.toFixed(2) + 's;--d:-' + (rnd() * t).toFixed(2) + 's;--dx:' + ((rnd() - .5) * 22).toFixed(0) + 'px"></i>';
    }
    return out;
  }
  // Ambient particles (by family), status particles (poison/burn/silence) and Break stars share one field
  // sized to the monster. Everything is deterministic per monster id.
  function fx(e) {
    if (!G.MonsterArt || !G.MonsterArt.has(e)) return '';
    var amb = ambienceFor(e), seed = seedOf(e.templateId || e.id || ''), ground = G.MonsterArt.ground(e), out;
    out = '<span class="enemy-fx fx-' + amb[1] + '"' + ground + '>' + particles(seed, amb[2], 2.6, 2.6) + '</span>';
    var status = '';
    (e.ailments || []).forEach(function (a, idx) {
      if (a.id === 'poison' || a.id === 'burn' || a.id === 'silence') status += '<b class="st-' + a.id + '">' + particles(seed + 101 * (idx + 1), a.id === 'silence' ? 3 : 5, 1.6, 1.4) + '</b>';
    });
    if (status) out += '<span class="enemy-fx fx-status"' + ground + '>' + status + '</span>';
    out += '<span class="enemy-fx fx-break"' + ground + '><i></i><i></i><i></i></span>';
    return out;
  }
  G.BattleArt = { ring: ring, fx: fx, profile: profile, enemy: enemy, zone: zone, status: status, chip: chip };
})();
