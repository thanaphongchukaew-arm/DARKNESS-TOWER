const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx=vm.createContext({window:{Game:{}}});
for(const file of ['js/data-events.js','js/room-ui.js'])vm.runInContext(fs.readFileSync(file,'utf8'),ctx);
const G=ctx.window.Game;
test('every random event has a valid illustrated location, including data-driven events',()=>{
 for(const event of G.Data.events)assert.ok(G.RoomUI.keys.includes(G.RoomUI.eventRoom(event.id)),event.id+' has no room art');
});
test('every registered room illustration exists and is cached for offline play',()=>{
 const sw=fs.readFileSync('sw.js','utf8');
 for(const key of G.RoomUI.keys){const file='assets/pixel16/rooms/'+key+'.png';assert.ok(fs.existsSync(file),file);assert.ok(sw.includes("'./"+file+"'"),file+' missing from precache');}
});
