// Shared usable location headers; artwork is separate from all interactive controls.
(function(){
 var G=window.Game,lastWorkshop='runes';
 var keys=['shop','craft','runes','salvage','forge','travelers','camp','guild','library','armory','arena','vault','shortcut','shrine','spring','battlefield','gambler','altar','victory','defeat','idol','hoard','starfall','ruined-library'];
 var map={'screen-shop':'shop','screen-craft':'craft','screen-status':'armory','screen-quests':'guild','screen-codex':'library','screen-tower':'travelers','screen-survival-summary':'arena','screen-reward':'vault'};
 var eventMap={merchant:'shop',chest:'vault',shortcut:'shortcut',sage:'library',shrine:'shrine',companion:'travelers',spring:'spring',battlefield:'battlefield',gambler:'gambler',bloodAltar:'altar',nightCamp:'camp',fountain:'spring',wounded:'camp',forge:'forge',library:'ruined-library',idol:'idol',master:'arena',smuggler:'shop',gatekeeper:'shortcut',hoard:'hoard',starfall:'starfall'};
 var workshopMap={runes:'runes',salvage:'salvage',forge:'forge',services:'travelers',camp:'camp',guild:'guild',book:'library'};
 function image(key){return '<img src="assets/pixel16/rooms/'+key+'.png" width="640" height="180" alt="" aria-hidden="true" draggable="false">';}
 function show(id,key){var root=document.getElementById(id);if(!root)return;key=key||(id==='screen-workshop'?workshopMap[lastWorkshop]:map[id])||root.dataset.room;var banner=root.querySelector(':scope > .location-banner');if(!key||keys.indexOf(key)===-1){if(banner)banner.remove();root.classList.remove('room-screen');return;}
  root.classList.add('room-screen');if(!banner){banner=document.createElement('div');banner.className='location-banner';banner.setAttribute('aria-hidden','true');var header=root.querySelector(':scope > .screen-header,:scope > h2');if(header)header.after(banner);else root.prepend(banner);}
  if(banner.dataset.room!==key){banner.innerHTML=image(key);banner.dataset.room=key;}
 }
 function workshop(tab){lastWorkshop=tab;show('screen-workshop',workshopMap[tab]||'craft');}
 function preview(key){return '<span class="location-preview" aria-hidden="true">'+image(key)+'</span>';}
 G.RoomUI={show:show,workshop:workshop,preview:preview,keys:keys,eventRoom:function(id){return eventMap[id]||'';}};
})();
