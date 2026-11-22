// Authored inventory objects on a 48px pixel grid. Identity controls form and material.
(function(){
 // clipPath ids must be unique per rendered SVG: the same item is drawn on several screens at once (hidden ones included),
 // and a duplicate id resolves to the first element in the document, which may sit in a display:none screen.
 var clipSeq=0;
 function cid(base){return base+'-'+(++clipSeq);}
 var C={ink:'#131421',edge:'#343244',steel0:'#39465b',steel1:'#697e95',steel2:'#a8c0cc',steel3:'#ecf3df',gold0:'#70452d',gold1:'#b67f39',gold2:'#e9bd64',gold3:'#fff0b5',brown0:'#392a30',brown1:'#71503a',brown2:'#a97648',brown3:'#d8aa72',red0:'#4e263e',red1:'#a23e57',red2:'#ed7480',blue0:'#263752',blue1:'#3d81aa',blue2:'#8dd8e0',purple0:'#382846',purple1:'#79589e',purple2:'#c6a0e2',green0:'#263f3d',green1:'#4d927b',green2:'#a5d5a0',white:'#fff0d1'};
 function p(d,c){return '<path d="'+d+'" fill="'+c+'"/>';}
 function r(x,y,w,h,c){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+c+'"/>';}
 function g(body,x,y,scale){return '<g transform="translate('+x+' '+y+') scale('+scale+')">'+body+'</g>';}
 function theme(id){return /infernal|demon|abyss|void|archdemon|heart_of/.test(id)?[C.purple0,C.purple1,C.purple2]:/storm|tempest|voltaic|wind|gale|undertow|drowned/.test(id)?[C.blue0,C.blue1,C.blue2]:/dragon|wyvern|wyrm|fang/.test(id)?[C.red0,C.red1,C.red2]:/saint|celestial|choral|sovereign|eternity|timeless|infinity/.test(id)?[C.gold0,C.gold1,C.gold3]:/lucky|spirit|warden|steadfast/.test(id)?[C.green0,C.green1,C.green2]:[C.blue0,C.blue1,C.blue2];}
 function gem(x,y,color,cut){return p('M'+x+' '+y+'h8l4 4-4 7h-8l-4-7Z',C.ink)+p('M'+x+' '+(y+1)+'h7l3 3-3 6h-7l-3-6Z',color)+r(x,y+2,5,2,C.white)+(cut?r(x+4,y+4,2,4,C.blue0):r(x-1,y+4,2,3,C.gold2));}
 function rivet(x,y){return r(x,y,2,2,C.ink)+r(x,y,1,1,C.gold3);}
 var blades={
 w_rusty_blade:'M21 4h5v4h2v19h-9V9h2Z',
 w_hunting_blade:'M24 2h3v20l-4 7h-5V11l6-9Z',
 w_knight_sword:'M24 1l6 7v19H18V8Z',
 w_soul_edge:'M28 2h6l-2 10-5 10-6 8-7-4 7-9 4-8Z',
 w_dragonfang_blade:'M31 1h4v8h-3v6h-3v5h-4v5h-4v5l-8-5 6-6v-4h4v-5h4V5h4Z',
 w_voidforged_blade:'M24 1h5l3 7-3 7h-3v5h3v8H17V15h3V8Z',
 w_resonant_edge:'M23 2h3v5h4v18l-6 5-7-5V7h4V2Z',
 w_sovereign_fang:'M32 1h5v9h-3v6h-4v5h-4v5l-9 6-7-8 9-6 6-8 3-6Z',
 w_craft_fangblade:'M30 2h5v9h-4v6h-4v5h-4v7l-9-4 5-7v-6h5V7h6Z',
 w_craft_voidreaver:'M25 1h6l3 6v7h-5v6h3v9H15v-7h5v-7h-3V8h5Z',
 w_craft_desert_sovereign:'M24 1h5v7h4v7h-4v6h-4v8H15v-7h4v-9h5Z'
 };
 function sword(id,t){
  var cp=cid('blade-'+id),d=blades[id]||blades.w_knight_sword,curved=/fang|soul|desert/.test(id);
  var a=p(d,C.ink)+p(d,C.steel1);
  // Blade planes stay distinct from the grip, guard, and edge.
  a+='<g clip-path="url(#'+cp+')">'+r(18,1,4,29,C.steel3)+r(22,1,3,29,C.steel2)+r(27,1,6,29,C.steel0)+r(24,4,1,21,t[1]);
  if(curved)a+=p('M32 2h2v7h-3v6h-4v6h-5v5h-4l6-7h3v-5h3V8h2Z',C.steel3);
  if(/rusty/.test(id))a+=r(23,7,4,3,C.brown2)+r(20,14,3,5,C.brown1)+r(24,22,3,3,C.brown2);
  if(/hunting/.test(id))a+=r(20,12,2,11,C.steel0)+r(26,5,1,9,C.white);
  if(/resonant/.test(id))a+=r(18,8,3,3,C.ink)+r(27,8,3,3,C.ink)+r(18,15,3,3,C.ink)+r(27,15,3,3,C.ink);
  if(/void/.test(id))a+=p('M24 6h4v5h-3v5h3v6h-4v-8h-3V9h3Z',t[2]);
  a+='</g><path d="'+d+'" fill="none" stroke="'+C.ink+'" stroke-width="1"/><defs><clipPath id="'+cp+'">'+p(d,'#ffffff')+'</clipPath></defs>';
  var guard=/sovereign|voidforged/.test(id)?'M9 25h7v3h16v-3h7v7h-9v3H18v-3H9Z':/hunting|rusty/.test(id)?'M14 27h20v5H14Z':'M11 25h6v3h14v-3h6v7h-8v2H19v-2h-8Z';
  a+=p(guard,C.ink)+p(guard,/rusty/.test(id)?C.steel0:C.gold0)+r(15,28,19,2,C.gold2)+r(21,32,6,11,C.ink)+r(22,32,4,10,C.brown1)+r(22,33,2,8,C.brown3)+r(22,35,4,1,C.gold0)+r(22,38,4,1,C.gold0)+p('M20 42h8v4h-8Z',C.ink)+r(21,42,6,3,C.gold1)+r(21,42,5,1,C.gold3);
  if(!/rusty|hunting/.test(id))a+=g(gem(0,0,t[2]),21,27,.5);
  return a;
 }
 function staff(id,t,spear){
  var a=r(21,13,6,32,C.ink)+r(22,14,4,30,C.brown1)+r(22,14,1,29,C.brown3)+r(22,20,4,2,C.gold2)+r(22,29,4,2,C.gold2)+r(22,39,4,2,C.gold1);
  if(spear){var storm=/tempest/.test(id);a+=p(storm?'M24 1h4v6h5v9h-6v5H17v-6h4V7h3Z':'M24 1l7 9 7 3v8h-9v-7l-5 8-7-6 4-7Z',C.ink)+p('M24 3l4 7-4 8-4-4Z',C.steel2)+p(storm?'M28 8h3v6h-4v5h-3v-6h4Z':'M30 12l6 2v5h-6Z',C.steel1)+r(23,6,2,8,C.white)+r(17,20,14,3,C.gold1)+r(18,20,12,1,C.gold3)+p('M17 23h3v10h-3v-3h-2v-4h2Z',t[1]);
  }else if(/apprentice/.test(id)){a+=p('M18 3h12v4h4v9h-4v4H18v-4h-4V7h4Z',C.ink)+p('M19 5h10v3h3v6h-4v4h-8v-4h-4V8h3Z',C.brown2)+gem(20,5,t[2]);
  }else if(/infernal/.test(id)){a+=p('M9 2h5v7h6V4h8v5h6V2h5v12l-9 9H18l-9-9Z',C.ink)+p('M11 4h2v7h8V6h6v5h8V4h2v9l-8 8H19l-8-8Z',C.gold0)+r(13,12,5,2,C.gold2)+r(30,12,5,2,C.gold2)+gem(20,8,C.red2);
  }else if(/choral/.test(id)){a+=p('M11 5h7V2h13v3h6v14h-6v5H18v-5h-7Z',C.ink)+p('M13 6h4v11h5V4h5v13h5V6h3v12h-5v4H19v-4h-6Z',C.gold1)+r(14,6,2,9,C.gold3)+r(23,4,2,12,C.white)+r(32,6,2,9,C.gold2)+g(gem(0,0,t[2]),21,18,.5);
  }else{a+=p('M15 2h6v4h7V2h6v8h5v7h-6v5H16v-5h-6v-7h5Z',C.ink)+p('M17 4h2v5h11V4h2v8h5v3h-7v5H18v-5h-6v-3h5Z',C.gold1)+r(17,5,2,8,C.gold3)+gem(20,6,t[2])+r(17,20,14,3,C.gold0)+r(18,20,12,1,C.gold3);}
  return a;
 }
 function tome(id,t){var demon=/archdemon/.test(id),eternal=/eternity/.test(id);var a=p('M8 6h13l3 3 3-3h13v32H28l-4 4-4-4H8Z',C.ink)+p('M9 7h12l3 4 3-4h12v29H27l-3 4-3-4H9Z',t[0])+r(10,8,3,27,C.gold1)+p('M14 5h7l3 4 3-4h10v28H27l-3 4-3-4h-7Z',C.gold0)+p('M15 7h6l2 3v23l-2-2h-6Z',C.white)+p('M25 10l3-3h7v24h-7l-3 2Z','#cfbd98')+r(24,10,1,25,C.brown1)+r(16,12,5,1,C.brown2)+r(16,16,5,1,C.brown2)+r(16,20,4,1,C.brown2)+r(28,12,5,1,C.brown1)+r(28,16,4,1,C.brown1)+r(28,20,5,1,C.brown1)+r(31,33,3,10,t[1])+p('M31 42h3v3l-2-1-1 1Z',t[2]);
  if(demon)a+=p('M3 2h4v6h6v5H7V9H3ZM37 8h4V2h4v7h-4v4h-6V8Z',C.gold0)+r(4,3,2,5,C.gold2)+r(42,3,2,5,C.gold2)+g(gem(0,0,C.red2),18,19,.8);
  else if(eternal)a+=p('M17 13h4v3h-3v7h3v3h-5v-3h-2v-7h3ZM29 13h4v3h-3v7h3v3h-5v-3h-2v-7h3Z',C.gold1)+r(21,24,8,2,C.gold2);
  else a+=g(gem(0,0,t[2]),19,22,.7)+r(11,8,2,3,C.gold3)+r(11,31,2,3,C.gold3);
  return a;
 }
 function armor(id,t){var cp=cid('armor-'+id);if(/padded/.test(id))t=[C.brown1,C.brown3,C.white];if(/saint|celestial/.test(id))t=[C.steel2,C.white,C.gold3];if(/sovereign_mantle/.test(id))t=[C.red0,C.red1,C.gold2];var robe=/robe|shroud|vestment|mantle/.test(id),leather=/leather/.test(id),padded=/padded/.test(id),demon=/demonlord/.test(id),crystal=/crystal/.test(id),cape=/shroud|mantle/.test(id);
  var d=robe?'M15 3h18l6 7 5 13-7 4-3-7 7 24H7l7-24-3 7-7-4 5-13Z':leather?'M13 4h7l4 5 4-5h7l5 8-6 5v25H14V17l-6-5Z':'M14 4h6l4 5 4-5h6l10 8-4 12-7-4v23H15V20l-7 4-4-12Z';
  var base=robe?t[0]:leather?C.brown1:C.steel0,mid=robe?t[1]:leather?C.brown2:C.steel1,hi=robe?t[2]:leather?C.brown3:C.steel2;
  var a=p(d,C.ink)+'<g clip-path="url(#'+cp+')">'+p(d,base)+p('M8 8h11v5h-3v26h-4V20H6ZM23 11h8v26h-8Z',mid)+p('M15 9h4v25h-2V17h-4ZM28 11h3v19h-3Z',hi)+p('M23 9h3v29h-3Z',base);
  if(robe){a+=p('M15 4h5l4 9 4-9h5l-7 14h-4Z',C.gold1)+p('M21 19h6v23h-6Z',C.gold0)+r(22,19,2,22,C.gold2)+p('M8 41h32v3H8Z',C.gold1);if(padded){for(var y=16;y<38;y+=6)a+=r(11,y,8,1,C.brown2)+r(29,y,8,1,C.brown2);}if(/saint/.test(id))a+=r(23,19,3,15,C.white)+r(19,24,11,3,C.white);if(/abyss/.test(id))a+=p('M12 15h5v9h-3v9h-3ZM31 15h5v18h-3v-9h-2Z',C.purple2);if(/echoing/.test(id))a+=r(11,15,2,20,C.steel2)+r(15,19,2,20,C.steel2)+r(31,19,2,20,C.steel2)+r(35,15,2,20,C.steel2);
  }else if(leather){a+=r(22,13,3,25,C.brown0)+r(15,31,18,4,C.brown0)+r(21,31,7,5,C.gold1)+r(23,32,3,3,C.ink);for(var y2=14;y2<29;y2+=4)a+=r(20,y2,2,1,C.gold3)+r(25,y2,2,1,C.gold3);
  }else {a+=p('M17 14h14l3 5-4 13H18l-4-13Z',C.steel1)+p('M18 15h6v14h-5l-3-10Z',C.steel2)+r(23,15,2,15,C.steel3)+r(17,33,14,3,C.steel0)+r(16,37,16,4,C.gold0)+r(17,37,14,1,C.gold2);if(/chainmail/.test(id)){for(var yy=13;yy<35;yy+=4)for(var xx=14+(yy%8?0:2);xx<34;xx+=4)a+=r(xx,yy,2,2,C.steel0)+r(xx,yy,1,1,C.steel3);}if(/scale/.test(id)){for(var sy=14;sy<35;sy+=6)for(var sx=14+(sy%12?0:3);sx<33;sx+=6)a+=p('M'+sx+' '+sy+'h5v3l-2 3-3-3Z',t[0])+r(sx,sy,4,1,t[2]);}if(/timeless/.test(id))a+=p('M19 17h10v3h-2v5l-3 3-3-3v-5h-2ZM20 29h8v3h-8Z',C.gold1);if(/steadfast/.test(id))a+=g(gem(0,0,C.gold3),21,18,.6);}
  a+='</g><defs><clipPath id="'+cp+'">'+p(d,'#ffffff')+'</clipPath></defs>';
  if(!robe&&!leather)a+=p('M8 7h9v5l-3 7-7 1-3-8ZM31 7h9l4 5-3 8-7-1-3-7Z',C.ink)+p('M9 8h7v4l-3 5-5 1-3-6ZM32 8h7l3 4-2 6-5-1-3-5Z',demon?t[1]:C.steel1)+r(8,9,7,2,C.steel3)+r(33,9,6,2,C.steel2)+rivet(10,14)+rivet(37,14);
  if(demon)a+=p('M5 3h4v5h5v5H8V9H4ZM39 3h4v6h-4v4h-5V8h5Z',C.ink)+p('M6 4h2v5h4v2H9V8H6ZM40 4h2v4h-4v3h-2V9h4Z',C.gold2)+g(gem(0,0,C.red2),20,22,.8);
  if(crystal)a+=p('M5 8l5-6 4 8-4 8ZM34 10l4-8 5 6-5 10Z',C.ink)+p('M7 8l3-4 2 6-2 4ZM36 10l2-6 3 4-3 6Z',C.blue2)+g(gem(0,0,C.blue2),21,20,.65);
  if(cape)a+=p('M9 16h4L7 40h5v5H3l3-18ZM35 16h4l3 11 3 18h-9v-5h5Z',t[0])+r(5,40,5,2,C.gold1)+r(38,40,5,2,C.gold1);
  if(/celestial/.test(id))a+=p('M2 10h7l8 7-3 3-8-4ZM39 10h7l-4 6-8 4-3-3Z',C.white);
  if(/sovereign_mantle/.test(id))a+=p('M13 4h7l4 5 4-5h7v8l-11 7-11-7Z',C.white)+g(gem(0,0,C.gold3),21,10,.6);
  return a;
 }
 function boots(id,t){var metal=/sabatons|wyvern|undertow|tempest/.test(id);var a=p('M9 8h13v22l7 4v10H4V33h5ZM28 3h13v22l5 4v10H24V28h4Z',C.ink)+p('M10 9h11v22l6 4v7H6v-8h4ZM29 4h11v22l4 4v7H26v-8h3Z',metal?C.steel0:C.brown1)+r(11,10,4,19,metal?C.steel2:C.brown3)+r(30,5,4,19,metal?C.steel2:C.brown3)+p('M11 29h10v4l5 3v5H7v-6h4ZM30 24h10v4l3 3v5H27v-6h3Z',metal?C.steel1:C.brown2)+r(6,41,21,3,C.brown0)+r(26,36,18,3,C.brown0)+r(7,41,19,1,C.gold2)+r(27,36,16,1,C.gold2)+r(14,14,7,3,C.gold0)+r(15,14,4,2,C.gold2)+r(14,22,7,3,C.gold0)+r(15,22,4,2,C.gold2)+r(33,9,7,3,C.gold0)+r(34,9,4,2,C.gold2)+r(33,17,7,3,C.gold0)+r(34,17,4,2,C.gold2);
  if(/wind|gale/.test(id))a+=p('M2 11h4v4h5v5h5v5h-6v-3H6v-4H2ZM22 5h4v4h4v5h5v5h-6v-3h-4v-5h-3Z',C.ink)+p('M3 12h2v5h5v4h4v2h-3v-3H7v-4H3ZM23 6h2v5h4v4h4v2h-3v-3h-4V9h-3Z',C.white);
  if(/wyvern/.test(id))a+=p('M10 9h11v5H10ZM10 16h11v5H10ZM29 4h11v5H29ZM29 11h11v5H29Z',t[1])+r(11,9,9,1,t[2])+r(30,4,9,1,t[2]);
  if(/storm|tempest/.test(id))a+=p('M17 9h4v5h-3v5h3l-7 10 2-10h-3v-4h4ZM36 4h4v5h-3v5h3l-7 10 2-10h-3V9h4Z',C.gold2);
  if(/resonant|boundless/.test(id))a+=r(11,12,10,2,t[2])+r(11,18,10,2,t[2])+r(30,7,10,2,t[2])+r(30,13,10,2,t[2]);
  if(/undertow/.test(id))a+=p('M10 28h4v3h4v-3h4v4h-4v3h-4v-3h-4ZM29 23h4v3h4v-3h4v4h-4v3h-4v-3h-4Z',C.blue2);
  return a;
 }
 function accessory(id,t,shape){
  var a;
  if(shape==='ring'){
   a=p('M13 17h22l8 9v11l-9 9H13l-9-9V26ZM16 25l-5 5v5l5 5h15l5-5v-5l-5-5Z',C.ink)+p('M14 19h19l8 8v9l-8 8H14l-8-8v-9ZM16 23l-7 7v6l7 6h16l6-6v-6l-6-7Z',C.gold0)+p('M14 20h17l7 7v2h-5l-3-4H17l-7 6v5l-3-2v-6Z',C.gold2)+r(8,29,2,7,C.gold3)+r(16,42,15,1,C.gold2)+p('M13 10h5V5h12v5h5v12h-5v5H18v-5h-5Z',C.ink)+p('M15 11h5V7h8v4h5v9h-5v5h-8v-5h-5Z',C.gold1)+gem(20,9,t[2]);
   if(/wyrm|dragonfang/.test(id))a+=p('M8 3h5v8h6v5h-8v-5H8ZM35 3h5v8h-3v5h-8v-5h6Z',C.ink)+p('M9 4h3v8h5v2h-5v-4H9ZM36 4h3v6h-3v4h-5v-2h5Z',C.white);
   if(/infinity/.test(id))a+=p('M7 8h10l7 8 7-8h10v14H31l-7-7-7 7H7ZM10 11v8h5l5-4-5-4ZM28 15l5 4h5v-8h-5Z',C.gold2);
   if(/shatter/.test(id))a+=p('M24 8h4v6h-4v5h3v6h-4v-7h-3v-6h4Z',C.ink)+r(36,5,4,4,C.blue2)+r(7,13,3,4,C.purple2);
   if(/prism/.test(id))a+=p('M18 12h6v7h-6Z',C.purple2)+p('M24 12h6v7h-6Z',C.blue2);
   if(/stormcaller/.test(id))a+=p('M24 7h6l-4 8h5l-10 11 2-10h-4Z',C.gold3);
   return a;
  }
  if(shape==='crown')return p('M3 9h6v7h6V8h5V2h8v6h5v8h6V9h6v30H3Z',C.ink)+p('M5 11h3v7h9V9h5V4h4v5h5v9h9v-7h3v26H5Z',C.gold0)+p('M6 20h36v15H6Z',C.gold1)+r(7,21,34,3,C.gold2)+r(7,33,34,3,C.gold2)+r(7,25,3,8,C.gold3)+gem(20,18,C.red2)+r(10,27,4,4,C.purple2)+r(34,27,4,4,C.purple2);
  if(shape==='bell')return p('M19 2h10v6h6v6h4v16h5v8H29v7H19v-7H4v-8h5V14h4V8h6Z',C.ink)+r(20,3,8,5,C.gold1)+r(21,3,5,2,C.gold3)+p('M19 9h10v5h5v16h6v5H8v-5h6V14h5Z',C.gold0)+p('M20 10h8v5h4v16H14V15h6Z',C.gold1)+r(17,16,4,14,C.gold2)+r(18,16,2,9,C.gold3)+r(9,32,30,3,C.gold2)+r(20,38,8,5,C.gold0)+r(20,38,5,3,C.gold2)+r(23,17,3,8,t[2])+r(20,27,9,2,t[2]);
  if(shape==='medal'){
   var crown=/sovereign|relic/.test(id);a=p('M7 2h11l6 12 6-12h11l-8 19 5 7v10l-8 8H18l-8-8V28l5-7Z',C.ink)+p('M9 4h7l8 15-7 4ZM32 4h7l-8 19-7-4Z',t[1])+p('M10 4h4l8 15-3 1ZM34 4h3l-7 16-3-1Z',t[2])+p('M18 21h12l6 8v8l-7 7H19l-7-7v-8Z',C.gold0)+p('M19 23h10l5 7v6l-6 6h-8l-6-6v-6Z',C.gold1)+p('M19 24h9v3h-8l-4 4v5h-2v-6Z',C.gold3)+r(19,40,9,1,C.gold2);
   a+=crown?p('M17 29h3v4h3v-7h3v7h3v-4h3v9H17Z',C.gold3):/veteran/.test(id)?p('M17 29h3v8h-3ZM23 26h3v11h-3ZM29 29h3v8h-3Z',C.gold3):p('M23 27h3v4h4v3h-4v5h-3v-5h-5v-3h5Z',C.gold3);return a;
  }
  if(shape==='heart')return p('M5 12h7V8h9v4h6V8h9v4h7v19h-5v5h-6v5h-5v4h-6v-4h-5v-5h-6v-5H5Z',C.ink)+p('M7 13h7v-3h6v5h8v-5h6v3h7v16h-5v5h-6v5h-5v3h-2v-3h-5v-5h-6v-5H7Z',t[0])+p('M14 12h5v5h10v-5h4v3h6v12h-5v5h-6v5h-4l-6-5h-5v-6H9v-9h5Z',t[1])+r(14,13,4,3,t[2])+r(10,17,3,7,t[2])+gem(20,21,t[2]);
  if(shape==='scroll')return scroll(id,t);
  a=p('M5 3h5v7h5v5h18v-5h5V3h5v10h-5v6h-6v4l6 8-14 15-14-15 6-8v-4h-6v-6H5Z',C.ink)+p('M7 4h2v8h6v5h18v-5h6V4h2v8h-5v6h-7v5H19v-5h-6v-6H7Z',C.gold1)+r(16,16,16,2,C.gold3)+p('M19 22h10l7 9-12 12-12-12Z',C.gold0)+p('M20 24h8l5 7-9 9-9-9Z',t[1])+p('M20 25h4v13l-7-7Z',t[2]);
  if(/lucky/.test(id))a+=g(window.Game.UISymbols.render('blessFortune').replace('<svg ','<svg x="0" y="0" width="24" height="24" '),12,20,1);
  else if(/guardian|absolute/.test(id))a+=p('M19 27h10v6l-5 5-5-5Z',C.gold3)+r(23,28,2,7,C.gold1);
  else if(/wardens/.test(id))a+=p('M24 23l8 8-8 9-8-9Z',C.blue2)+r(23,26,2,9,C.white);
  else a+=r(23,28,2,7,C.gold3)+r(20,30,8,2,C.gold3);
  return a;
 }
 function scroll(id,t){return p('M11 3h30v8h-5v25h4v9H5v-5H2v-8h7V11H6V6h5Z',C.ink)+p('M12 5h27v4h-5v28h4v6H6v-4H4v-5h7V9H8V7h4Z',C.brown2)+p('M15 9h17v26H13V12h2Z',C.white)+r(15,13,13,2,C.brown2)+r(15,18,11,2,C.brown2)+r(15,23,13,2,C.brown2)+r(15,28,7,2,C.brown2)+r(7,37,29,3,C.gold2)+r(9,40,25,2,C.brown1)+r(11,5,26,2,C.gold3)+g(gem(0,0,/pact/.test(id)?C.red2:t[2]),26,29,.8);}
 function flask(item,id,t){var cp=cid('flask-'+id);var tier=item.tier||1,hp=item.icon==='potion',elixir=id==='p_elixir',panacea=id==='p_panacea';var liquid=hp?[C.red0,C.red1,C.red2]:panacea?[C.green0,C.green1,C.green2]:elixir?[C.purple0,C.purple1,C.purple2]:[C.blue0,C.blue1,C.blue2];
  var d=tier===1?'M18 4h12v7h-2v10l8 6v16H12V27l8-6V11h-2Z':tier===2?'M17 3h14v7h-3v9l10 8v14l-4 4H14l-4-4V27l10-8v-9h-3Z':tier===3?'M17 2h14v8h-3v9l13 8v13l-7 5H14l-7-5V27l13-8v-9h-3Z':tier===4?'M18 2h12v8h-2v9l11 7v14l-8 6H17l-8-6V26l11-7v-9h-2Z':tier===5?'M14 2h20v8h-6v7l13 8v15l-8 6H15l-8-6V25l13-8v-7h-6Z':tier===6?'M17 1h14v8h-3v8l8 7 7 7-7 12-8 4h-8l-8-4-7-12 7-7 8-7V9h-3Z':'M17 1h14v5h4v5h-7v8l12 8v13l-8 6H16l-8-6V27l12-8V11h-7V6h4Z';
  var a=p(d,C.ink)+'<g clip-path="url(#'+cp+')">'+p(d,C.blue0)+r(13,23,24,19,C.steel1)+r(12,28,26,14,liquid[0])+r(14,28,21,12,liquid[1])+r(14,28,20,3,liquid[2])+r(14,27,2,11,C.white)+r(16,24,2,3,C.steel3)+r(20,11,2,11,C.steel2)+r(19,4,12,7,C.brown1)+r(18,4,13,3,C.brown3)+r(20,10,8,3,C.gold1);
  if(hp)a+=r(22,31,4,11,C.white)+r(18,35,12,4,C.white);else if(panacea)a+=p('M18 34h6v-5h4v5h5v4h-5v5h-4v-5h-6Z',C.white);else if(elixir)a+=p('M24 29l7 7-7 8-7-8Z',C.gold3)+r(23,32,2,8,C.white);else a+=p('M24 30l6 7-6 6-6-6Z',C.blue2)+r(23,32,2,8,C.white);
  a+='</g><defs><clipPath id="'+cp+'">'+p(d,'#ffffff')+'</clipPath></defs>';
  if(tier>=4)a+=r(15,22,18,3,C.gold1)+r(16,22,16,1,C.gold3);
  if(tier>=6)a+=p('M7 21h5v5H7ZM36 21h5v5h-5Z',C.gold1)+r(8,21,3,2,C.gold3)+r(37,21,3,2,C.gold3);
  return a;
 }
 function material(id,t,shape){
  if(shape==='fang')return p('M23 2h18v7h-3v10l-7 10-9 10-11 7H4v-5l8-7 7-12 4-13Z',C.ink)+p('M24 3h15v5h-3v10l-6 10-9 10-11 6H6v-2l8-7 7-13 3-13Z',C.brown2)+p('M25 10h11v8l-7 10-9 10-10 5h-2l9-10 6-14Z',C.steel2)+p('M25 11h5v7l-6 13-9 8 6-12 3-10Z',C.white)+r(25,4,13,3,C.brown3)+(/demon/.test(id)?r(30,12,7,3,C.purple1)+r(26,22,6,3,C.purple1):'');
  if(shape==='scale')return p('M19 2h10v4h8v7h7v12l-8 11-12 11-12-11-8-11V13h7V6h8Z',C.ink)+p('M20 4h8v4h7v7h7v9l-8 10-10 10-10-10-8-10v-9h7V8h7Z',t[0])+p('M20 6h7v5h6v6h6v7l-8 10-7 7-10-10-5-8v-6h6v-6h5Z',t[1])+p('M20 8h4v12h-5v8h-4v-6h-3v-4h5v-6h3Z',t[2])+p('M10 24h4v5h5v5h5v5l-3-3h-4v-5h-4Z',C.white)+p('M29 15h4v11h-4v6h-4v-5h4Z',t[0]);
  if(shape==='feather')return p('M31 1h12v13h-4v7h-5v7h-6v7h-7v5h-9l-7 7H1v-5l7-7v-9h4v-9h6V9h7V5h6Z',C.ink)+p('M31 3h10v10h-4v7h-5v7h-6v6h-6v5h-9l-7 7H3v-2l8-9v-8h3v-8h6v-7h7V7h4Z',t[1])+p('M33 5h5v8h-4v7h-6v7h-6v6h-8l7-8v-7h6v-7h6Z',t[2])+p('M36 6h2v6h-4v6h-5v6h-6v6h-6v6h-6l-7 8 7-11h5v-6h6v-6h6v-6h5V9h3Z',C.gold2)+r(21,14,7,2,C.white);
  if(shape==='bone')return p('M5 3h8v4h5v7l19 18h6v6h4v8h-9v-4h-6v-6L13 18H7v-5H2V7h3Z',C.ink)+p('M6 5h6v4h5v5l19 19h6v6h3v5h-6v-4h-5v-5L14 16H8v-5H4V8h2Z',C.brown2)+p('M7 5h4v6h5l20 22h6v5h-7L14 17H9v-5H5V9h2Z',C.white)+r(10,8,2,5,C.steel2)+r(36,36,3,4,C.steel2);
  if(shape==='dust'||/dust|essence/.test(id))return p('M16 3h17v7h-5v9l11 8v16H9V27l11-8v-9h-4Z',C.ink)+r(18,5,13,4,C.gold1)+r(19,5,10,2,C.gold3)+r(22,10,5,10,C.steel2)+p('M20 20h8l9 8v13H11V28Z',C.blue0)+p('M13 29h22v11H13Z',t[0])+r(14,29,20,3,t[2])+r(14,29,3,9,C.steel3)+r(19,33,3,3,t[2])+r(27,35,3,3,C.white)+r(23,28,2,2,C.white)+r(31,31,2,2,t[1]);
  if(shape==='crystal')return p('M22 2h9v11h7l7 10v17H5V26l7-8h7V9Z',C.ink)+p('M23 4h6v26H19V12Z',t[1])+p('M24 5h3v21h-5V12Z',t[2])+p('M13 20h5v18H7V27Z',C.steel1)+p('M14 21h2v14h-5v-8Z',C.white)+p('M33 16h4l6 8v14H29V25Z',t[0])+p('M34 18h2l4 7v10h-7Z',t[2])+r(10,38,29,4,C.steel0);
  if(shape==='core')return p('M15 2h18v5h8v8h5v18h-5v8h-8v5H15v-5H7v-8H2V15h5V7h8Z',C.ink)+p('M16 4h15v5h8v7h5v15h-5v8h-8v5H16v-5H9v-8H4V16h5V9h7Z',t[0])+p('M17 7h14v5h7v20h-6v6H16v-6h-6V16h7Z',t[1])+p('M17 8h12v4H17v6h-5v11h-2V15h7Z',t[2])+p('M20 14h9v6h6v9h-6v6h-9v-6h-6v-9h6Z',C.ink)+p('M22 16h5v6h6v5h-6v6h-5v-6h-6v-5h6Z',t[2])+r(22,20,3,6,C.white)+r(7,15,3,3,C.gold1)+r(36,31,3,3,C.gold1);
  return '';
 }
 function component(id){if(/metal/.test(id))return p('M4 29l7-10h20l6 10v12H4ZM17 12l7-9h18v12l-7 10H17Z',C.ink)+p('M7 29l5-8h17l6 8Z',C.steel3)+r(6,30,29,9,C.steel0)+r(7,31,13,6,C.steel1)+p('M20 12l5-7h15l-5 7Z',C.steel2)+r(19,13,16,10,C.steel1)+r(20,13,4,8,C.steel3)+r(36,7,4,9,C.steel0);if(/cloth/.test(id))return p('M6 11h32l6 7v23H5V17Z',C.ink)+r(7,12,29,26,C.green0)+r(10,14,27,24,C.green1)+r(13,16,26,22,C.green2)+r(15,19,22,16,C.green0)+r(16,20,20,14,C.green1)+r(16,20,20,2,C.green2)+r(16,20,2,14,C.white)+r(13,35,26,3,C.green2)+r(37,18,4,20,C.green0);return material(id,[C.purple0,C.purple1,C.purple2],'dust');}
 function render(item,shape,oldOrnament){
  if(!item)return '';var id=item.baseId||item.id||'',t=theme(id),body='';
  if(item.kind==='weapon')body=shape==='tome'?tome(id,t):shape==='staff'?staff(id,t,false):shape==='spear'?staff(id,t,true):sword(id,t);
  else if(item.kind==='armor')body=armor(id,t);
  else if(item.kind==='shoes')body=boots(id,t);
  else if(item.kind==='accessory')body=accessory(id,t,shape);
  else if(item.kind==='consumable')body=id==='skill_scroll'?scroll(id,t):flask(item,id,t);
  else if(item.kind==='material')body=material(id,t,shape);
  else if(item.kind==='component')body=component(id);
  else if(item.kind==='rune')body=window.Game.UISymbols.render(item.icon).replace('<svg ','<svg x="2" y="2" width="44" height="44" ');
  if(!body)return '';
  // Keep authored, identity-specific engravings and enchantment marks visible.
  if(oldOrnament)body+='<g class="item-engraving" opacity=".85" transform="scale(2)">'+oldOrnament+'</g>';
  if(item.forgeEffect){var effect=item.forgeEffect.effect,color=effect==='leech'?C.red2:effect==='break'?C.gold2:C.blue2;body+=p('M36 32h12v16H36Z',C.ink)+p(effect==='leech'?'M41 34h3v3h2v6h-2v2h-4v-2h-2v-6h3Z':effect==='break'?'M39 34h7v3h-4v3h4v5h-7v-4h2v-3h-2Z':'M43 34h3v4h-3v3h-3v4h-3v-4h3v-3h3Z',color);}
  if(/^orin_/.test(item.id||'')){body+=p('M17 19h14v14H17Z',C.ink)+p('M18 20h12v12H18Z',C.steel0)+r(19,21,5,9,C.steel2)+r(24,21,5,9,C.steel1)+r(19,21,2,8,C.steel3)+rivet(19,21)+rivet(27,21)+rivet(19,28)+rivet(27,28);}
  return '<svg xmlns="http://www.w3.org/2000/svg" class="pixel-sprite item-silhouette" data-art-style="inventory-objects-48" data-shape="'+(shape||item.kind)+'" viewBox="-2 -2 52 52" shape-rendering="crispEdges" aria-hidden="true">'+body+'</svg>';
 }
 window.Game.ItemArt={render:render};
})();
