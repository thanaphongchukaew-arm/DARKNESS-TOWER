// Run-local artisan progression. Mutators validate every cost before committing.
(function () {
  var G = window.Game, S = G.State, D = G.Data, F = G.Formulas, WD = G.WorkshopData;
  var slots = ['weapon','armor','shoes','accessory1','accessory2'];
  function ensure(run) {
    if (!run.workshop) run.workshop = {};
    var w = run.workshop;
    ['sockets','blueprints','camps','preparations','purchases','contracts','clears'].forEach(function (key) { if (!w[key]) w[key] = {}; });
    if (!w.orders) w.orders = [];
    Object.keys(w.contracts).forEach(function (id) { var c = w.contracts[id]; if (!c.claimed && run.currentFloor > c.deadline) c.expired = true; });
    // Old saves and equipment swaps cannot leave an active rune on unrelated gear.
    slots.forEach(function (slot) { var socket = w.sockets[slot]; if (socket && socket.itemId !== run.equipment[slot]) { S.addItem(run, socket.runeId, 1); delete w.sockets[slot]; } });
    return w;
  }
  function save() { S.saveNow(); }
  function rune(id) { return WD.runes.find(function (r) { return r.id === id; }); }
  function trust(run, npc) { var state = G.Story.ensure(run).people[npc]; return state && state.chapter > 0 ? state.trust : 0; }
  function recipe(id) { return WD.recipes.find(function (r) { return r.id === id; }) || D.getRecipe(id); }
  function floorFor(r) { return r.floor || ({1:1,2:11,3:21,4:31,5:41,6:45,7:50,8:55,9:60})[r.tier] || 1; }
  function unlocked(run, r) { var w = ensure(run); return !!r && run.currentFloor >= floorFor(r) && (!r.blueprint || w.blueprints[r.blueprint]) && (!r.npc || trust(run,r.npc) >= (r.trust || 1)); }
  function affordable(run, r) { return !!r && run.gold >= (r.gold || 0) && r.materials.every(function (m) { return (run.inventory[m.id] || 0) >= m.qty; }); }
  function canCraft(run, id) { var r = recipe(id); return unlocked(run,r) && affordable(run,r); }
  function craft(run, id) {
    var r = recipe(id); if (!r || !canCraft(run,id)) return false;
    if (!r.type) { if (!S.craftItem(run,id)) return false; }
    else {
      r.materials.forEach(function (m) { S.removeItem(run,m.id,m.qty); }); S.spendGold(run,r.gold || 0); S.addItem(run,r.resultId,r.resultQty || 1); S.recordItemCrafted(run);
    }
    save(); return true;
  }
  function detach(run, slot) { var w = ensure(run), socket = w.sockets[slot]; if (!socket) return false; S.addItem(run,socket.runeId,1); delete w.sockets[slot]; return true; }
  function socket(run, slot, runeId) {
    var w = ensure(run), r = rune(runeId);
    if (slots.indexOf(slot) === -1 || !run.equipment[slot] || !r || !(run.inventory[runeId] > 0) || run.gold < 20) return false;
    if (slots.some(function (key) { return w.sockets[key] && w.sockets[key].runeId === runeId; })) return false;
    detach(run,slot); S.removeItem(run,runeId,1); S.spendGold(run,20); w.sockets[slot] = { itemId: run.equipment[slot], runeId: runeId }; save(); return true;
  }
  function unsocket(run, slot) { if (!detach(run,slot)) return false; save(); return true; }
  function salvageOutput(item) {
    if (!item || ['weapon','armor','shoes','accessory'].indexOf(item.kind) === -1) return null;
    return { id: item.kind === 'weapon' ? 'part_metal' : item.kind === 'accessory' ? 'part_dust' : 'part_cloth', qty: Math.min(3,1 + Math.floor(((item.tier || 1) - 1)/3)) };
  }
  function salvage(run, id) {
    var output = salvageOutput(D.getItem(id)); if (!output || !(run.inventory[id] > 0)) return false;
    S.removeItem(run,id,1); S.addItem(run,output.id,output.qty); save(); return output;
  }
  function convert(run, sourceId, targetId) {
    var source = D.getItem(sourceId), target = WD.components.find(function (p) { return p.id === targetId; });
    if (!source || !target || sourceId === targetId || ['component','material'].indexOf(source.kind) === -1 || (run.inventory[sourceId] || 0) < 3 || run.gold < 15) return false;
    S.removeItem(run,sourceId,3); S.spendGold(run,15); S.addItem(run,targetId,1); save(); return true;
  }
  function effects(run) {
    var w = ensure(run), result = {};
    slots.forEach(function (slot) {
      var entry = w.sockets[slot], r = entry && rune(entry.runeId), item = D.getItem(run.equipment[slot]);
      if (r) result[r.effect] = (result[r.effect] || 0) + r.amount;
      if (item && item.forgeEffect) result[item.forgeEffect.effect] = (result[item.forgeEffect.effect] || 0) + item.forgeEffect.amount;
    });
    result.leech = Math.min(.08,result.leech || 0); return result;
  }
  function prepareBattle(run,battle,survival) {
    var w = ensure(run); battle.workshop = { effects: effects(run) };
    if (!survival && battle.floor === run.currentFloor) {
      ['meal','ward','bond'].forEach(function (id) { if (w.preparations[id] > 0) { battle.workshop[id] = true; w.preparations[id]--; } });
      if (battle.workshop.bond) battle.player.focus = Math.min(F.FOCUS_MAX,battle.player.focus + 20);
      save();
    }
  }
  function battleEffects(battle) { return battle.workshop ? battle.workshop.effects : {}; }
  function damageMult(battle, enemy, element, isCrit) {
    var e = battleEffects(battle), amount = 1 + (e[element] || 0);
    if (e.venom && (enemy.ailments || []).some(function (a) { return a.id === 'poison'; })) amount += e.venom;
    if (isCrit) amount += e.critDamage || 0;
    return amount * (battle.workshop && battle.workshop.meal ? 1.08 : 1);
  }
  function campKey(run) { return run.currentFloor >= 5 && run.currentFloor < 100 ? Math.floor(run.currentFloor/5)*5 : null; }
  function camp(run, action) {
    var w = ensure(run), key = campKey(run);
    if (!key || w.camps[key]) return false;
    if (['rest','meal','ward','study','bond'].indexOf(action) === -1 || (action === 'bond' && !run.companionId)) return false;
    if (action === 'rest') {
      if (run.hp >= S.getMaxHp(run) && run.mp >= S.getMaxMp(run)) return false;
      run.hp = Math.min(S.getMaxHp(run),run.hp + Math.round(S.getMaxHp(run)*.6)); run.mp = Math.min(S.getMaxMp(run),run.mp + Math.round(S.getMaxMp(run)*.4));
    } else if (action === 'study') {
      var next = WD.runes.find(function (r) { return r.blueprint && r.floor <= run.currentFloor && !w.blueprints[r.id]; });
      if (next) w.blueprints[next.id] = true; else S.addItem(run,'part_dust',3);
    } else w.preparations[action] = action === 'bond' ? 3 : 4;
    w.camps[key] = action; save(); return true;
  }
  function potion(kind,tier) {
    return D.items.filter(function (it) { return it.kind === 'consumable' && it.effect && it.effect.type === kind && it.tier <= tier && !it.questOnly; }).sort(function (a,b) { return b.tier-a.tier; })[0];
  }
  function offers(run) {
    var tier = F.itemTierForFloor(run.currentFloor), hp = potion('healHp',tier), mp = potion('healMp',tier);
    // Mira's story currently grants at most three trust; the best discount must
    // be attainable without inventing an extra story chapter.
    var discount = trust(run,'mira') >= 3 ? .7 : .85;
    return [
      { id:'mira_kit', npc:'mira', trust:1, floor:3, name:'เสบียงยาจากมิรา', nameEn:'Mira’s Medicine Crate', icon:'workParcel', price:Math.ceil((F.shopPrice(hp)*2+F.shopPrice(mp))*discount), eta:3, items:[{id:hp.id,qty:2},{id:mp.id,qty:1}] },
      { id:'mira_venom', npc:'mira', trust:2, floor:5, name:'แผนผังรูนอสรพิษ', nameEn:'Venom Blueprint', icon:'runeVenom', price:120, eta:3, blueprint:'rune_venom' },
      { id:'orin_parts', npc:'orin', trust:1, floor:8, name:'ชุดวัสดุช่างเกราะ', nameEn:'Armorer’s Supplies', icon:'workMetal', price:100, eta:2, items:[{id:'part_metal',qty:4},{id:'part_cloth',qty:2}] },
      { id:'orin_focus', npc:'orin', trust:2, floor:10, name:'แผนผังรูนสมาธิ', nameEn:'Focus Blueprint', icon:'runeFocus', price:160, eta:3, blueprint:'rune_focus' },
      { id:'lyra_dust', npc:'lyra', trust:1, floor:13, name:'ผงอาคมกลั่นบริสุทธิ์', nameEn:'Refined Arcane Dust', icon:'workDust', price:80, eta:2, items:[{id:'part_dust',qty:4}] },
      { id:'lyra_map', npc:'lyra', trust:1, floor:13, name:'แผนผังรูนนักสำรวจ', nameEn:'Discovery Blueprint', icon:'runeDiscovery', price:140, eta:3, blueprint:'rune_discovery' }
    ];
  }
  function order(run,id) {
    var w = ensure(run), offer = offers(run).find(function (o) { return o.id === id; }), band = Math.floor((run.currentFloor-1)/10), key = band+':'+id;
    if (!offer || run.currentFloor < offer.floor || run.currentFloor + offer.eta > 100 || trust(run,offer.npc) < offer.trust || w.purchases[key] || run.gold < offer.price || w.orders.filter(function (o) { return !o.claimed; }).length >= 3 || (offer.blueprint && w.blueprints[offer.blueprint])) return false;
    if (offer.blueprint && w.orders.some(function (o) { return !o.claimed && o.blueprint === offer.blueprint; })) return false;
    S.spendGold(run,offer.price); w.purchases[key] = true;
    w.orders.push(Object.assign({},offer,{key:key,readyFloor:run.currentFloor+offer.eta,claimed:false})); save(); return true;
  }
  function collect(run,key) {
    var w = ensure(run), o = w.orders.find(function (entry) { return entry.key === key; });
    if (!o || o.claimed || run.currentFloor < o.readyFloor) return false;
    o.claimed = true;
    (o.items || []).forEach(function (it) { S.addItem(run,it.id,it.qty); });
    if (o.blueprint) {
      // The same design can be discovered at camp or through guild work
      // while an order is in transit. Never charge twice for an owned design.
      if (w.blueprints[o.blueprint]) run.gold += o.price; // Refund is not earned gold.
      else w.blueprints[o.blueprint] = true;
    }
    save(); return true;
  }
  function board(run) {
    var band = Math.floor((run.currentFloor-1)/10), tier = F.itemTierForFloor(run.currentFloor), material = D.items.find(function (it) { return it.kind === 'material' && it.tier === Math.min(9,F.tierForFloor(run.currentFloor)); });
    return [
      {kind:'hunt',name:'กวาดล้างเงามืด',nameEn:'Shadow Hunt',icon:'workBounty',target:6,gold:80*tier,blueprint:'rune_venom'},
      {kind:'elite',name:'หมายล่า Elite',nameEn:'Elite Warrant',icon:'workElite',target:1,gold:140*tier,blueprint:'rune_focus'},
      {kind:'delivery',name:'เสบียงถึงผู้เฝ้าทาง',nameEn:'Trailkeeper Delivery',icon:'workParcel',target:3,gold:90*tier,blueprint:'rune_discovery',item:'p_hp_small',qty:2},
      {kind:'supply',name:'จัดหาวัตถุดิบโซน',nameEn:'Zone Material Request',icon:'workGuild',target:3,gold:100*tier,item:material.id,qty:3}
    ].map(function (c) { return Object.assign(c,{id:band+':'+c.kind}); });
  }
  function accept(run,id) {
    var w = ensure(run), offer = board(run).find(function (c) { return c.id === id; });
    if (!offer || w.contracts[id] || run.currentFloor >= 96 || Object.values(w.contracts).filter(function (c) { return !c.claimed && !c.expired && !c.abandoned; }).length >= 2) return false;
    w.contracts[id] = Object.assign({},offer,{progress:0,acceptedFloor:run.currentFloor,deadline:Math.min(100,run.currentFloor+8),destination:run.currentFloor+3,claimed:false}); save(); return true;
  }
  function readyContract(run,c) {
    if (!c || c.claimed || c.expired || c.abandoned || run.currentFloor > c.deadline) return false;
    if (c.kind === 'supply') return (run.inventory[c.item] || 0) >= c.qty;
    if (c.kind === 'delivery') return run.currentFloor >= c.destination && (run.inventory[c.item] || 0) >= c.qty;
    return c.progress >= c.target;
  }
  function claim(run,id) {
    var w = ensure(run), c = w.contracts[id]; if (!readyContract(run,c)) return false;
    c.claimed = true; if (c.item) S.removeItem(run,c.item,c.qty); S.addGold(run,c.gold); S.addItem(run,'part_dust',2);
    if (c.blueprint) { if (w.blueprints[c.blueprint]) S.addItem(run,'part_metal',2); else w.blueprints[c.blueprint] = true; }
    save(); return true;
  }
  function abandon(run,id) { var c = ensure(run).contracts[id]; if (!c || c.claimed || c.expired || c.abandoned) return false; c.abandoned = true; save(); return true; }
  function recordClear(run,battle,replay) {
    var w = ensure(run); if (replay || !battle.victory || battle.floor !== run.currentFloor || w.clears[battle.floor]) return;
    w.clears[battle.floor] = true;
    Object.values(w.contracts).forEach(function (c) {
      if (c.claimed || c.expired || c.abandoned || battle.floor < c.acceptedFloor || battle.floor > c.deadline) return;
      if (c.kind === 'hunt') c.progress += battle.enemies.length;
      if (c.kind === 'elite' && battle.enemies.some(function (e) { return e.elite; })) c.progress++;
    });
  }
  function pin(run,id) { if (id && !recipe(id)) return false; var w = ensure(run); w.trackedRecipe = id || null; w.trackReady = !!(id && canCraft(run,id)); save(); return true; }
  function sourceHint(id) {
    var item = D.getItem(id); if (!item) return {th:'',en:''};
    if (item.kind === 'component') return {th:'แยกอุปกรณ์ / หลอม 3 ต่อ 1 / งานสมาคม / สั่งจาก NPC',en:'Dismantle gear / fuse 3:1 / guild jobs / NPC orders'};
    if (item.kind === 'material') { var starts={1:1,2:11,3:21,4:31,5:41,6:45,7:50,8:55,9:60}; return {th:'ศัตรูโซนชั้น '+starts[item.tier]+(item.tier===9?' ขึ้นไป':'–'+({1:10,2:20,3:30,4:40,5:44,6:49,7:54,8:59})[item.tier]),en:'Enemies on floors '+starts[item.tier]+(item.tier===9?'+':'–'+({1:10,2:20,3:30,4:40,5:44,6:49,7:54,8:59})[item.tier])}; }
    return {th:item.craftOnly?'คราฟต์ตามสูตรเดิมก่อนนำมาดัดแปลง':'อุปกรณ์ในกระเป๋า / ร้านค้า / รางวัลชั้น',en:item.craftOnly?'Craft the original recipe first':'Unequipped gear / shop / floor rewards'};
  }
  var originalEquip=S.equip, originalUnequip=S.unequip, originalReward=S.getRewardMult;
  S.equip=function(run,id,slot){var item=D.getItem(id);slot=slot||(item&&item.kind);var old=run.equipment[slot];if(!originalEquip(run,id,slot))return false;if(old!==run.equipment[slot])detach(run,slot);return true;};
  S.unequip=function(run,slot){if(!originalUnequip(run,slot))return false;detach(run,slot);return true;};
  S.getRewardMult=function(run,kind){return originalReward(run,kind)*(kind==='material'?1+(effects(run).material||0):1);};
  G.Workshop = {ensure:ensure,slots:slots,rune:rune,trust:trust,recipe:recipe,allRecipes:function(){return D.recipes.concat(WD.recipes);},floorFor:floorFor,unlocked:unlocked,affordable:affordable,canCraft:canCraft,craft:craft,socket:socket,unsocket:unsocket,salvage:salvage,salvageOutput:salvageOutput,convert:convert,effects:effects,prepareBattle:prepareBattle,battleEffects:battleEffects,damageMult:damageMult,campKey:campKey,camp:camp,offers:offers,order:order,collect:collect,board:board,accept:accept,readyContract:readyContract,claim:claim,abandon:abandon,recordClear:recordClear,pin:pin,sourceHint:sourceHint};
})();
