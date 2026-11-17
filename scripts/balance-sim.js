// ลิขสิทธิ์และจัดทำโดย ธนพงศ์ ชูแก้ว (Copyright © Thanaphong Chukaew. All rights reserved.)

// Headless balance simulator: a simple bot climbs the tower through the real
// engine (same files the tests load), so tuning in js/formulas.js can be judged
// by numbers instead of by feel.
//
//   node scripts/balance-sim.js curve   [--diff normal] [--class blade] [--runs 12]
//   node scripts/balance-sim.js survive [--diff normal,hard] [--class blade,elementalist] [--runs 30]
//
// curve   -- the bot cannot die; prints, per floor, how long fights last and how
//            much of the player's max HP the enemies remove per round.
// survive -- the bot plays for real; prints where runs end.
//
// The bot buys gear with gold, takes one floor reward, keeps a starting
// companion, picks talents and exploits known weaknesses, but never guards and
// ignores runes/bonds/camps -- treat it as a careless average player.
const path = require('path');
const { loadGame } = require(path.join(__dirname, '..', 'test', 'helpers', 'load-game.js'));

const args = process.argv.slice(2);
const mode = args[0] === 'survive' ? 'survive' : 'curve';
function opt(name, fallback) {
  const i = args.indexOf('--' + name);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
}
const DIFFS = opt('diff', mode === 'curve' ? 'normal' : 'easy,normal,hard,nightmare').split(',');
const CLASSES = opt('class', mode === 'curve' ? 'blade' : 'blade,elementalist,cleric,berserker,ranger').split(',');
const RUNS = parseInt(opt('runs', mode === 'curve' ? '12' : '30'), 10);
const REST_FLOORS = [5, 20, 35, 50, 65, 80, 95];

function applyTuning(G) {
  if (!process.env.TUNE) return;
  const t = JSON.parse(process.env.TUNE), F = G.Formulas;
  if (t.anchors) { F.FLOOR_SCALE_ANCHORS.length = 0; t.anchors.forEach((a) => F.FLOOR_SCALE_ANCHORS.push(a)); }
  if (t.regular) Object.assign(F.REGULAR_TUNING, t.regular);
  if (t.mini) Object.assign(F.MINIBOSS_TUNING, t.mini);
  if (t.boss) Object.assign(F.FINAL_BOSS_TUNING, t.boss);
}

function makeBot(G, diff, classId) {
  const S = G.State, F = G.Formulas, D = G.Data, BE = G.BattleEngine, X = G.Systems;
  const run = S.createRun(diff, classId, 0);
  S.current = run;
  const cls = D.getClass(classId);
  const main = cls.baseStats.mag > cls.baseStats.atk ? 'mag' : 'atk';
  S.hireCompanion(run, 'ember_fox');
  S.addBlessing(run, main === 'mag' ? 'insight' : 'might');
  const startPotions = F.DIFFICULTY[diff].startPotions || 0;
  if (startPotions) S.addItem(run, 'p_hp_small', startPotions);

  function score(item) {
    const b = item.statBonus || {};
    return (b[main] || 0) * 3 + (b.def || 0) * 1.5 + (b.res || 0) * 1.5 + (b.hp || 0) * 0.4 + (b.spd || 0) + (b.luk || 0) * 0.5 + (b.mp || 0) * 0.2;
  }
  function slotsFor(kind) { return kind === 'accessory' ? ['accessory1', 'accessory2'] : [kind]; }
  function tryEquip(item) {
    let worst = null;
    slotsFor(item.kind).forEach((slot) => {
      const cur = D.getItem(run.equipment[slot]);
      const curScore = cur ? score(cur) : -1;
      if (run.equipment[slot] !== item.id && (!worst || curScore < worst.score)) worst = { slot, score: curScore };
    });
    if (!worst || score(item) <= worst.score) return false;
    if (slotsFor(item.kind).some((s) => run.equipment[s] === item.id)) return false;
    S.addItem(run, item.id, 1);
    return S.equip(run, item.id, worst.slot);
  }
  function gearPool(tier) {
    return D.items.filter((i) => ['weapon', 'armor', 'shoes', 'accessory'].indexOf(i.kind) !== -1 && i.tier === tier && !i.combo && D.getItemsByKindTier(i.kind, tier).indexOf(i) !== -1);
  }
  function shop(floor) {
    const tier = F.itemTierForFloor(floor);
    gearPool(tier).sort((a, b) => score(b) - score(a)).forEach((item) => {
      const price = F.shopPrice(item);
      if (run.gold < price) return;
      const before = JSON.stringify(run.equipment);
      if (tryEquip(item)) S.spendGold(run, price);
      else if (JSON.stringify(run.equipment) !== before) S.spendGold(run, price);
    });
    const pots = D.items.filter((i) => i.kind === 'consumable' && i.effect && i.effect.type === 'healHp' && i.tier <= tier && i.price == null).sort((a, b) => b.tier - a.tier);
    const pot = pots[0];
    while (pot && (run.inventory[pot.id] || 0) < 4 && run.gold >= F.shopPrice(pot)) { S.spendGold(run, F.shopPrice(pot)); S.addItem(run, pot.id, 1); }
  }
  // One of three random offers, like the real floor-clear reward screen.
  function reward(floor) {
    const tier = F.itemTierForFloor(floor);
    const pool = gearPool(tier).map((item) => ({ item }));
    D.items.filter((i) => i.kind === 'consumable' && i.tier <= tier && !i.questOnly && i.id !== 'p_elixir').forEach((item) => pool.push({ item, qty: 2 }));
    if (floor >= 5) {
      const unheld = D.relics.filter((r) => !r.storyOnly && run.relics.indexOf(r.id) === -1);
      if (unheld.length) pool.push({ relic: unheld[Math.floor(Math.random() * unheld.length)] });
    }
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
    const offers = pool.slice(0, 3);
    for (const o of offers) if (o.item && o.item.kind !== 'consumable' && tryEquip(o.item)) return;
    const relic = offers.find((o) => o.relic);
    if (relic) { S.addRelic(run, relic.relic.id); return; }
    const potion = offers.find((o) => o.item && o.item.effect && o.item.effect.type === 'healHp') || offers.find((o) => o.item && o.item.kind === 'consumable');
    if (potion) S.addItem(run, potion.item.id, potion.qty || 1);
  }
  function talents() {
    let level;
    while ((level = X.pending(run))) {
      const options = X.options(run, level);
      if (!options.length || !X.chooseTalent(run, options[0].id)) break;
    }
  }

  function chooseAction(b) {
    const alive = b.enemies.map((e, i) => ({ e, i })).filter((x) => x.e.alive);
    if (!alive.length) return null;
    const skills = S.learnedSkills(run).filter((s) => s.cost <= run.mp);
    if (run.hp < b.player.maxHp * 0.4) {
      const heal = skills.filter((s) => s.kind === 'heal').sort((a, c) => c.power - a.power)[0];
      if (heal) return { kind: 'skill', skillId: heal.id };
      const potion = Object.keys(run.inventory).map((id) => D.getItem(id)).filter((i) => i && i.battleUsable && i.effect && i.effect.type === 'healHp').sort((a, c) => c.tier - a.tier)[0];
      if (potion) return { kind: 'item', itemId: potion.id };
    }
    const weakest = alive.slice().sort((a, c) => a.e.hp - c.e.hp)[0];
    if (b.player.focus >= F.FOCUS_MAX) return { kind: 'overdrive', targetIndex: weakest.i };
    const st = b.player;
    let best = { value: -1 };
    skills.filter((s) => s.kind === 'attack' && !s.hpCost).forEach((s) => {
      const offense = s.element === 'almighty' ? Math.max(st.atk, st.mag) * 1.4 : (s.element === 'phys' || s.scaleStat === 'atk') ? st.atk : st.mag;
      const targets = s.target === 'allEnemies' ? alive : alive;
      targets.forEach((x) => {
        const tpl = D.getEnemyTemplate(x.e.templateId) || {};
        const weak = x.e.weakEl || tpl.weak, resist = x.e.resistEl || tpl.resist;
        let value = offense * s.power * (s.hits || 1) * (s.element === weak ? 1.6 : s.element === resist ? 0.65 : 1);
        if (s.target === 'allEnemies') value *= Math.min(alive.length, 3) * 0.9;
        value -= s.cost * 0.15;
        if (value > best.value) best = { value, skill: s, index: s.target === 'allEnemies' ? weakest.i : x.i };
      });
    });
    if (!best.skill || best.skill.id === 'attack') return { kind: 'attack', targetIndex: best.skill ? best.index : weakest.i };
    return { kind: 'skill', skillId: best.skill.id, targetIndex: best.index };
  }

  // Plays one battle. `immortal` refills HP/MP every round and reports the damage taken.
  function fight(floor, immortal) {
    const b = BE.createBattle(run, floor, floor === 100);
    const stats = { rounds: 0, taken: 0, worst: 0, enemyHp: b.enemies.reduce((s, e) => s + e.maxHp, 0), maxHp: b.player.maxHp };
    function enemyPhase() {
      const before = run.hp;
      BE.runEnemyPhase(b);
      const lost = Math.max(0, before - run.hp);
      stats.taken += lost; stats.worst = Math.max(stats.worst, lost); stats.rounds += 1;
      if (immortal) { run.hp = b.player.maxHp; run.mp = b.player.maxMp; if (b.over && !b.victory) { b.over = false; stats.died = true; } }
    }
    if (immortal) { run.hp = b.player.maxHp; run.mp = b.player.maxMp; }
    if (b.pendingFirstStrike) enemyPhase();
    let guard = 0;
    while (!b.over && guard++ < 600) {
      let inner = 0;
      while (!b.over && b.playerAP > 0 && inner++ < 12) {
        if (b.awaitingAllOut) { BE.confirmAllOut(b, true); continue; }
        const act = chooseAction(b);
        if (!act) break;
        let res = BE.playerAction(b, act);
        if (res.events.some((e) => e.type === 'invalid')) {
          const alive = b.enemies.findIndex((e) => e.alive);
          res = BE.playerAction(b, { kind: 'attack', targetIndex: alive });
          if (res.events.some((e) => e.type === 'invalid')) break;
        }
      }
      if (b.over) break;
      if (b.awaitingAllOut) BE.confirmAllOut(b, true);
      if (b.over) break;
      BE.runCompanionPhase(b);
      if (b.over) break;
      enemyPhase();
    }
    stats.victory = !!b.victory;
    stats.totalRounds = b.round;
    if (b.victory) {
      const rate = F.DIFFICULTY[diff].rewardMult;
      S.addExp(run, BE.getExpReward(b, rate));
      S.addGold(run, BE.getGoldReward(b, rate));
    }
    return stats;
  }

  function afterFloor(floor) {
    talents();
    reward(floor);
    const mh = S.getMaxHp(run), mm = S.getMaxMp(run);
    run.hp = Math.min(mh, run.hp + Math.round(mh * 0.3));
    run.mp = Math.min(mm, run.mp + Math.round(mm * 0.3));
    if (REST_FLOORS.indexOf(floor) !== -1) S.fullRestore(run);
  }

  return { run, shop, fight, afterFloor };
}

const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN);
const pad = (v, n) => String(v).padStart(n);

function curve(diff, classId) {
  const rows = {};
  for (let i = 0; i < RUNS; i++) {
    const G = loadGame(); applyTuning(G);
    const bot = makeBot(G, diff, classId);
    for (let floor = 1; floor <= 100; floor++) {
      bot.run.currentFloor = floor;
      bot.shop(floor);
      const s = bot.fight(floor, true);
      const r = rows[floor] = rows[floor] || { rounds: [], pct: [], worst: [], level: [], enemyHp: [], hp: [] };
      r.rounds.push(s.totalRounds); r.pct.push(s.rounds ? s.taken / s.rounds / s.maxHp : 0); r.worst.push(s.worst / s.maxHp);
      r.level.push(bot.run.level); r.enemyHp.push(s.enemyHp); r.hp.push(s.maxHp);
      bot.afterFloor(floor);
    }
  }
  console.log('\n== curve: ' + diff + ' / ' + classId + ' (' + RUNS + ' runs, immortal bot)');
  console.log('floor kind      lvl playerHP enemyHP rounds dmg%/round worst%');
  const G = loadGame();
  for (let floor = 1; floor <= 100; floor++) {
    const kind = floor === 100 ? 'BOSS' : G.Data.getMiniBoss(floor) ? 'miniboss' : G.Formulas.isChampionFloor(floor) ? 'champion' : '';
    if (!kind && floor % 5 !== 4 && floor > 3) continue;
    const r = rows[floor];
    console.log(pad(floor, 5), kind.padEnd(9), pad(avg(r.level).toFixed(0), 4), pad(avg(r.hp).toFixed(0), 8), pad(avg(r.enemyHp).toFixed(0), 7), pad(avg(r.rounds).toFixed(1), 6), pad((avg(r.pct) * 100).toFixed(0) + '%', 10), pad((Math.max.apply(null, r.worst) * 100).toFixed(0) + '%', 6));
  }
}

function survive(diff, classId) {
  const ends = [];
  for (let i = 0; i < RUNS; i++) {
    const G = loadGame(); applyTuning(G);
    const bot = makeBot(G, diff, classId);
    let end = 101;
    for (let floor = 1; floor <= 100; floor++) {
      bot.run.currentFloor = floor;
      bot.shop(floor);
      if (!bot.fight(floor, false).victory) { end = floor; break; }
      bot.afterFloor(floor);
    }
    ends.push(end);
  }
  ends.sort((a, b) => a - b);
  const clears = ends.filter((f) => f > 100).length;
  console.log(diff.padEnd(10), classId.padEnd(13), 'clears', pad(clears + '/' + RUNS, 6), '| death floor: min', pad(ends[0], 3), 'median', pad(ends[Math.floor(ends.length / 2)], 3), 'max', pad(Math.min(100, ends[ends.length - 1]), 3), '|', ends.map((f) => (f > 100 ? 'C' : f)).join(' '));
}

DIFFS.forEach((diff) => CLASSES.forEach((classId) => (mode === 'curve' ? curve : survive)(diff, classId)));
