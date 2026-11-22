// Hand-authored 32px fantasy objects: recognizable silhouettes and material shading.
(function () {
  var C={ink:'#11131f',shadow:'#262636',steelDark:'#475369',steel:'#899db0',steelLight:'#d0e1e8',white:'#fff5df',goldDark:'#87502c',gold:'#c28b40',goldLight:'#f2ca70',goldWhite:'#ffe8a4',woodDark:'#50302c',wood:'#93613e',woodLight:'#c89459',redDark:'#762d43',red:'#c74760',redLight:'#f5818c',blueDark:'#274a73',blue:'#478ac1',blueLight:'#93d9eb',greenDark:'#275a47',green:'#59a579',greenLight:'#b1d8a2',violetDark:'#4e3c70',violet:'#9473bc',violetLight:'#d9b4e5'};
  function p(d,fill,stroke){return '<path d="'+d+'" fill="'+fill+'"'+(stroke?' stroke="'+stroke+'" stroke-width="1" stroke-linejoin="miter"':'')+'/>';}
  function r(x,y,w,h,fill){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'"/>';}
  function jewel(x,y,color){return p('M'+(x+2)+' '+y+'h4v2h2v4h-2v2h-4v-2h-2v-4h2Z',C.ink)+r(x+2,y+1,3,2,C.white)+p('M'+(x+1)+' '+(y+3)+'h5v3h-2v1h-2v-1h-1Z',color);}
  function sparkle(x,y,color){return r(x+2,y,1,5,color)+r(x,y+2,5,1,color);}
  var art={};
  art.sword=function(broken){
    var a=p('M23 2h6v6l-2 2h-2v2h-2v2h-2v2h-2v2l3 3-3 3-3-3-7 7H5v-4l7-7-3-3 3-3 3 3 2-2v-2h2V8h2V6h2Z',C.ink);
    a+=p('M24 3h4v4l-2 2h-2v2h-2v2h-2v2h-2l-2-2 2-2V9h2V7h2V5h2Z',C.steel)+p('M24 4h3v2h-3v2h-2v2h-2v2h-2v2h-1v-2l2-2V8h2V6h2V4Z',C.white);
    a+=p('M25 7h2v2h-2v2h-2v2h-2v2h-2v2h-2v-2h2v-2h2v-2h2V9h2Z',C.steelDark);
    a+=p('M11 12h2l8 8v2h-2l-8-8Z',C.goldDark)+p('M11 12h2l8 8h-3l-7-7Z',C.goldLight);
    a+=p('M13 18l2 2-7 7-2-2Z',C.wood)+p('M12 21h2v2h-2v2h-2v-2H8v-2h2v-2h2Z',C.goldDark)+p('M4 25h3l2 2-2 3H4l-2-2Z',C.goldLight)+r(3,26,2,2,C.goldWhite);
    if(broken)a+=p('M20 9h8v3h-7l-3 3-2-2 4-4Z',C.ink)+r(25,2,4,3,C.steelLight)+r(28,7,2,2,C.steel);
    return a;
  };
  art.shield=function(ward){
    var a=p('M6 3h20v3h3v12h-2v4h-3v3h-3v3h-4v2h-2v-2h-4v-3H8v-3H5v-4H3V6h3Z',C.ink);
    a+=p('M6 4h20v3h2v11h-2v4h-3v3h-3v2h-8v-2H9v-3H6v-4H4V7h2Z',C.goldDark)+p('M7 4h18v2H7ZM5 7h2v10H5ZM7 18h2v4H7ZM10 23h3v3h-3Z',C.goldLight);
    a+=p('M8 7h16v2h2v8h-2v4h-3v3h-3v2h-4v-2h-3v-3H8v-4H6V9h2Z',ward?C.violetDark:C.blueDark)+p('M8 8h8v17h-2v-2h-3v-3H9v-4H7V10h1Z',ward?C.violet:C.blue);
    a+=p('M10 9h3v10h-2v-4H9v-5h1Z',ward?C.violetLight:C.blueLight);
    a+=ward?jewel(12,11,C.violetLight):r(14,10,4,12,C.goldLight)+r(10,14,12,4,C.goldLight)+r(14,11,2,4,C.goldWhite);
    a+=r(7,6,2,2,C.white)+r(23,6,2,2,C.goldLight)+r(14,26,3,1,C.goldLight);
    return a;
  };
  art.heart=function(broken){return p('M5 5h8v2h6V5h8v2h3v12h-3v4h-4v3h-4v3h-6v-3H9v-3H5v-4H2V8h3Z',C.ink)+p('M5 7h7v2h8V7h6v2h2v9h-3v4h-4v3h-4v2h-2v-2h-4v-3H7v-4H4V9h1Z',C.redDark)+p('M5 8h7v3h8V8h6v9h-3v4h-4v3h-5v-3h-4v-4H6V8Z',C.red)+r(7,8,4,2,C.redLight)+r(5,10,3,5,C.redLight)+r(7,9,2,1,C.white)+(broken?p('M17 5h3v6h-4v4h4v5h-4v8h-3v-9h4v-3h-4v-7h4Z',C.ink):r(12,24,5,2,C.redLight));};
  art.book=function(torn){return p('M2 7h11l3 2 3-2h11v20H19l-3 2-3-2H2Z',C.ink)+p('M2 9h11l3 2 3-2h11v17H19l-3 2-3-2H2Z',C.redDark)+p('M4 5h8l4 3 4-3h8v18h-8l-4 3-4-3H4Z',C.woodDark)+p('M5 6h7l3 3v15l-3-2H5Z',C.goldLight)+p('M17 9l3-3h7v16h-7l-3 2Z',C.gold)+p('M6 7h6l2 2v12l-2-1H6Z',C.white)+p('M18 10l3-2h5v12h-5l-3 2Z',C.steelLight)+r(15,9,2,16,C.wood)+r(7,10,5,1,C.woodLight)+r(7,13,5,1,C.woodLight)+r(7,16,4,1,C.woodLight)+r(20,11,5,1,C.steel)+r(20,14,5,1,C.steel)+r(20,17,4,1,C.steel)+(torn?p('M23 5h4v6h-3v4h3v8h-5v-5h2v-4h-3V9h2Z',C.ink):p('M19 22h3v7l-2-2-1 2Z',C.redLight));};
  art.boot=function(wing,chain){
    var a=p('M12 3h13v16l5 3v7H6v-3H3v-6h5V5h4Z',C.ink)+p('M11 5h12v14l5 4v4H7v-2H5v-4h5Z',C.woodDark)+r(12,6,10,11,C.wood)+r(12,6,3,11,C.woodLight)+p('M11 18h11v3l5 3v2H8v-3h3Z',C.wood)+r(7,27,21,2,C.goldDark)+r(8,26,18,1,C.goldLight)+r(16,9,6,2,C.goldDark)+r(17,9,3,2,C.goldLight)+r(16,14,6,2,C.goldDark)+r(17,14,3,2,C.goldLight);
    if(wing)a+=p('M2 7h3l2 3h3v3h3v5h-3l-2-2H5v-3H3v-3H1Z',C.ink)+p('M2 8h3v3h3v3h4v3H9v-2H6v-3H4v-2H2Z',C.white)+r(4,13,2,2,C.steel)+r(7,16,3,2,C.steelLight);
    if(chain)a+=p('M3 21h3v2h3v-2h4v4H9v-2H6v2H3Z',C.steel)+p('M3 22h5v2h3v4H8v3H3v-3H1v-4h2Z',C.steelDark)+r(3,23,4,2,C.steelLight);
    return a;
  };
  art.coins=function(empty){
    if(empty)return art.bag(true);
    var a=p('M2 20h13v3h2v6H2ZM16 16h13v3h2v10H16Z',C.ink)+r(3,21,12,7,C.goldDark)+r(3,21,11,2,C.goldLight)+r(3,25,11,1,C.goldLight)+r(17,17,12,11,C.goldDark)+r(17,17,11,2,C.goldLight)+r(17,21,11,1,C.goldLight)+r(17,25,11,1,C.goldLight);
    a+=p('M11 2h10v2h4v4h2v12h-2v4h-4v2H11v-2H7v-4H5V8h2V4h4Z',C.ink)+p('M11 3h10v2h3v4h2v10h-2v4h-3v2H11v-2H8v-4H6V9h2V5h3Z',C.goldDark)+p('M11 3h10v2h3v3h-3V6H11v3H9v10H7V9h1V5h3Z',C.goldWhite)+p('M12 7h8v2h3v10h-3v3h-8v-3H9V9h3Z',C.gold)+r(12,8,7,2,C.goldLight)+r(14,11,4,8,C.goldDark)+r(15,11,2,6,C.goldWhite)+r(11,14,10,2,C.goldLight);return a;
  };
  art.flask=function(kind,cracked){
    var liquid=kind==='hp'?C.red:kind==='poison'?C.green:kind==='elixir'?C.violet:C.blue;
    var a=p('M11 1h10v4h-1v7l7 6v10l-3 3H8l-3-3V18l7-6V5h-1Z',C.ink)+r(12,2,8,3,C.wood)+r(12,2,8,1,C.woodLight)+r(13,5,6,7,C.steelDark)+r(13,5,2,7,C.steelLight)+p('M13 12h6l7 7v8l-3 3H9l-3-3v-8Z',C.blueDark)+p('M13 13h5l6 6v7l-3 2H10l-2-2v-7Z',C.steel)+p('M8 21h16v5l-3 2H11l-3-2Z',liquid)+r(9,20,14,2,kind==='hp'?C.redLight:kind==='poison'?C.greenLight:C.blueLight)+r(8,18,2,7,C.white)+r(10,16,2,2,C.steelLight)+r(13,7,1,4,C.white)+r(22,24,2,3,C.steelDark);
    if(kind==='hp')a+=r(14,20,3,7,C.white)+r(12,22,7,3,C.white);
    if(kind==='poison')a+=r(13,22,2,2,C.ink)+r(18,22,2,2,C.ink)+r(15,25,3,1,C.ink);
    if(kind==='cleanse')a+=p('M13 23h3v-3h3v3h3v3h-3v3h-3v-3h-3Z',C.greenLight);
    if(cracked)a+=p('M18 15h2v6h-3v3h3v5h-2v-4h-3v-5h3Z',C.ink);
    return a;
  };
  art.gem=function(color){return p('M11 2h10l8 9v5L19 29h-6L3 16v-5Z',C.ink)+p('M11 4h9l7 8-10 15h-2L5 13Z',C.blueDark)+p('M11 4h9l-2 8h-7L5 12Z',color||C.blueLight)+p('M11 13h7l-2 14Z',C.blue)+p('M19 13h8L17 27Z',C.violetDark)+p('M5 13h5l5 14Z',C.steelLight)+r(12,5,6,2,C.white)+r(8,8,3,2,C.white);};
  art.armor=function(){return p('M9 2h4v3h6V2h4l7 6v6h-5v15H7V14H2V8Z',C.ink)+p('M9 4h3v3h8V4h3l5 5v3h-5v15H9V12H4V9Z',C.steelDark)+p('M10 7h4v2h4V7h4v17H10Z',C.steel)+p('M10 9h5v6h-4v5h-1ZM18 9h4v5h-4Z',C.steelLight)+p('M10 15h5v2h-5ZM17 15h5v2h-5ZM11 21h10v2H11Z',C.steelDark)+r(9,24,14,3,C.goldDark)+r(10,24,12,1,C.goldLight)+p('M9 4H7v2H4v4h5ZM23 4h2v2h3v4h-5Z',C.goldDark)+r(5,7,4,2,C.goldLight)+r(23,7,4,2,C.goldLight)+r(15,8,2,14,C.white);};
  art.skull=function(mode){
    var a='';if(mode==='fire')a=art.flame();
    a+=p('M10 4h12v2h5v4h2v11h-4v5h-3v4H10v-4H7v-5H3V10h2V6h5Z',C.ink)+p('M10 5h12v2h4v4h2v9h-4v5h-3v4H11v-4H8v-5H4V11h2V7h4Z',C.woodLight)+p('M10 6h12v2h3v11h-4v5H11v-5H6V9h4Z',C.steelLight)+p('M10 6h11v2H10ZM6 10h3v8H6ZM11 24h10v4H11Z',C.white)+p('M7 12h6v7H7ZM19 12h6v7h-6ZM14 19h4v4h-4Z',C.ink)+r(8,12,4,1,C.steelDark)+r(20,12,4,1,C.steelDark)+r(13,25,1,4,C.woodDark)+r(18,25,1,4,C.woodDark);
    if(mode==='crown')a+=p('M4 1h4v3h5V1h6v3h5V1h4v9H4Z',C.ink)+p('M5 2h2v3h7V2h4v3h7V2h2v7H5Z',C.goldDark)+r(6,6,20,2,C.goldLight)+r(6,6,17,1,C.goldWhite)+r(14,5,4,3,C.red);
    if(mode==='fire')a+=p('M5 8H2V2h4v3h4v4H7ZM23 8V5h3V2h4v6h-3v3Z',C.goldLight)+r(8,14,4,3,C.red)+r(20,14,4,3,C.red)+r(9,14,2,1,C.goldWhite)+r(21,14,2,1,C.goldWhite);
    return a;
  };
  art.flame=function(){return p('M14 1h4v5h3v4h3V7h3v7h3v10h-3v5h-5v2H10v-2H5v-4H2V15h3v-5h3v6h3v-5h3Z',C.ink)+p('M15 2h2v6h3v5h4v-3h2v6h3v7h-3v5h-5v2H11v-2H6v-4H3v-8h3v-3h1v5h5v-5h3Z','#ab3c32')+p('M15 7h2v6h4v4h4v7h-4v4H11v-3H7v-8h3v4h3v-9h2Z','#e67b3e')+p('M15 15h3v5h3v6h-3v2h-5v-3h-3v-3h3v-4h2Z',C.goldLight)+r(15,22,3,5,C.white);};
  art.eye=function(){return p('M10 5h12v3h4v3h4v10h-4v3h-4v3H10v-3H6v-3H2V11h4V8h4Z',C.ink)+p('M10 7h12v3h4v3h3v6h-4v3h-4v3H11v-3H7v-3H3v-6h4v-3h3Z',C.violetDark)+p('M10 10h12v2h4v3h2v2h-3v3h-5v2h-9v-2H7v-3H5v-2h3v-3h2Z',C.white)+p('M13 9h6v3h3v8h-3v3h-6v-3h-3v-8h3Z',C.blue)+r(14,12,5,9,C.ink)+r(13,10,3,3,C.blueLight)+r(15,11,2,3,C.white)+r(7,8,3,2,C.violetLight);};
  art.target=function(broken){return p('M10 2h12v3h5v5h3v12h-3v5h-5v3H10v-3H5v-5H2V10h3V5h5Z',C.ink)+p('M10 4h12v3h4v4h2v10h-2v4h-4v3H10v-3H6v-4H4V11h2V7h4Z',C.redDark)+p('M11 6h10v3h3v3h2v8h-2v3h-3v3H11v-3H8v-3H6V12h2V9h3Z',C.white)+p('M12 10h8v2h2v8h-2v2h-8v-2h-2v-8h2Z',C.red)+r(14,13,4,6,C.white)+p('M21 4h3V1h4v4h-3v3h-3v3h-3v3h-3v-3h3V8h2Z',C.goldDark)+p('M22 5h2v2h-2v3h-3v3h-2v-2h2V8h3Z',C.goldLight)+(broken?p('M10 3h4v8h-3v5h4v6h-3v7H9v-8h3v-4H8v-7h3Z',C.ink):'');};
  art.paw=function(){
    function toe(x,y){return p('M'+(x+1)+' '+y+'h4v2h1v5h-1v2h-4v-2h-1v-5h1Z',C.ink)+r(x+1,y+2,4,5,C.wood)+r(x+1,y+2,2,3,C.woodLight)+r(x+2,y-1,2,2,C.white);}
    return toe(2,9)+toe(9,3)+toe(17,3)+toe(24,9)+p('M13 14h6v3h4v3h4v7h-3v3h-6v-2h-4v2H8v-3H4v-7h4v-3h5Z',C.ink)+p('M13 16h5v3h4v3h3v4h-3v2h-4v-2h-5v2H9v-2H6v-4h4v-3h3Z',C.wood)+p('M13 17h5v3h3v3H10v-3h3Z',C.woodLight)+r(12,20,6,2,C.goldLight);
  };
  art.wall=function(){return p('M3 4h26v25H3Z',C.ink)+r(4,5,24,23,C.steelDark)+r(5,6,10,6,C.steel)+r(17,6,10,6,C.steel)+r(5,14,5,6,C.steel)+r(12,14,11,6,C.steel)+r(25,14,2,6,C.steel)+r(5,22,10,5,C.steel)+r(17,22,10,5,C.steel)+r(5,6,10,1,C.steelLight)+r(17,6,10,1,C.steelLight)+r(12,14,11,1,C.steelLight)+r(5,22,10,1,C.steelLight);};
  art.fist=function(){return p('M8 4h19v3h3v15h-4v8H10v-7H6v-4H2V10h6Z',C.ink)+p('M9 5h17v3h3v13h-4v8H11v-7H7v-4H4v-6h5Z',C.woodDark)+r(10,6,4,9,C.woodLight)+r(15,6,4,9,C.woodLight)+r(20,6,4,9,C.woodLight)+r(25,9,3,8,C.wood)+r(10,6,4,2,C.goldLight)+r(15,6,4,2,C.goldLight)+r(20,6,4,2,C.goldLight)+p('M6 12h7v4h8v4h-9v3H9v-4H6Z',C.woodLight)+r(7,12,5,2,C.goldLight)+r(14,16,7,2,C.wood)+r(12,23,12,5,C.wood)+r(10,28,16,3,C.steelDark)+r(11,28,14,1,C.steelLight);};
  art.pendant=function(){return p('M4 2h4v4h3v3h10V6h3V2h4v5h-3v4h-4v3h3v4h2v5h-4v5h-4v3h-4v-3h-4v-5H6v-5h2v-4h3v-3H7V7H4Z',C.ink)+p('M5 2h2v5h4v3h10V7h4V2h2v4h-3v5h-4v3h-8v-3H8V7H5Z',C.gold)+r(11,10,10,2,C.goldLight)+p('M13 13h6v3h4v6h-4v5h-6v-5H9v-6h4Z',C.goldDark)+p('M14 15h4v3h3v3h-3v4h-4v-4h-3v-3h3Z',C.blue)+r(14,15,3,3,C.white)+r(13,18,2,4,C.blueLight)+r(18,19,2,3,C.blueDark);};
  art.bag=function(empty){return p('M9 2h14v4h-2v3h4v3h3v14h-3v4H7v-4H4V12h3V9h4V6H9Z',C.ink)+p('M10 3h12v2h-3v5h5v3h3v12h-3v4H8v-4H5V13h3v-3h5V5h-3Z',C.woodDark)+p('M13 7h6v5h4v3h2v9h-3v3H10v-3H7v-9h3v-3h3Z',C.wood)+r(10,13,3,11,C.woodLight)+r(10,8,12,3,C.goldDark)+r(10,8,11,1,C.goldLight)+(empty?p('M12 17h8v2h-8ZM10 22h12v2H10Z',C.ink):jewel(12,15,C.goldLight))+r(21,16,2,7,C.woodDark);};
  art.chest=function(){return p('M6 4h20v3h4v22H2V7h4Z',C.ink)+p('M6 5h20v3h3v20H3V8h3Z',C.woodDark)+p('M7 7h18v2h2v7H5V9h2Z',C.wood)+r(7,7,17,2,C.woodLight)+r(5,19,22,7,C.wood)+r(6,20,20,2,C.woodLight)+r(3,15,26,3,C.goldDark)+r(4,15,24,1,C.goldLight)+r(7,7,3,20,C.goldDark)+r(7,7,1,19,C.goldLight)+r(22,7,3,20,C.goldDark)+r(22,7,1,19,C.goldLight)+r(13,14,7,9,C.ink)+r(14,15,5,7,C.gold)+r(14,15,4,1,C.goldWhite)+r(16,17,1,4,C.ink);};
  art.scroll=function(torn){return p('M7 2h20v5h-2v17h-3v6H4v-3H2v-5h4V7H4V4h3Z',C.ink)+p('M8 3h18v3h-3v18h-2v5H5v-2H3v-4h4V6H6V4h2Z',C.woodLight)+p('M10 5h12v19H8V7h2Z',C.goldWhite)+r(11,8,8,1,C.wood)+r(11,11,7,1,C.wood)+r(11,14,8,1,C.wood)+r(11,17,5,1,C.wood)+r(5,24,16,3,C.goldLight)+r(7,26,13,2,C.woodLight)+r(7,4,17,1,C.white)+(torn?p('M16 3h4v5h-3v4h4v5h-4v6h-3v-8h3v-3h-3V7h2Z',C.ink):jewel(13,19,C.red));};
  art.map=function(torn){return p('M2 6l9-4 10 4 9-4v24l-9 4-10-4-9 4Z',C.ink)+p('M4 7l7-3 10 4 7-3v20l-7 3-10-4-7 3Z',C.goldLight)+p('M11 4l10 4v20l-10-4Z',C.woodLight)+p('M5 8l5-2v17l-5 2ZM22 9l5-2v16l-5 2Z',C.goldWhite)+p('M6 11h3v3h3v3h5v-3h4v-3h4v2h-3v4h-4v3h-6v-3H9v-3H6Z',C.green)+r(13,10,3,2,C.blue)+r(15,8,3,2,C.blueLight)+r(23,19,2,7,C.redDark)+r(21,21,6,2,C.redDark)+(torn?p('M15 4h4v6h-3v5h4v6h-3v7h-3v-9h3v-3h-4V9h2Z',C.ink):r(12,23,6,1,C.wood));};
  art.compass=function(){return p('M12 1h8v4h5v3h3v17h-3v3h-5v3h-8v-3H7v-3H4V8h3V5h5Z',C.ink)+r(13,2,6,3,C.goldLight)+p('M12 6h8v2h5v4h2v10h-2v4h-5v3h-8v-3H8v-4H6V12h2V8h4Z',C.goldDark)+p('M12 7h8v2h4v4h2v8h-2v4h-4v3h-8v-3H9v-4H7v-8h2V9h3Z',C.goldLight)+p('M12 10h8v2h3v10h-3v3h-8v-3H9V12h3Z',C.blueDark)+p('M19 10v10l-7 6v-9Z',C.steelLight)+p('M19 10l-7 7v8l7-6Z',C.red)+r(12,16,4,4,C.goldLight)+r(15,11,1,2,C.white);};
  art.clover=function(){var a=p('M14 14h4v12l-5 5h-3v-3l4-4Z',C.greenDark);function leaf(d,h){return p(d,C.ink)+p(h,C.green);}a+=leaf('M5 2h8v3h3v10H6v-3H3V5h2Z','M6 4h6v3h2v6H7v-3H5V6h1Z');a+=leaf('M19 2h8v3h3v8h-3v3H17V6h2Z','M20 4h6v3h2v5h-3v2h-6V7h1Z');a+=leaf('M4 17h10v10h-3v3H4v-3H1v-7h3Z','M5 19h7v6H9v3H5v-3H3v-4h2Z');a+=leaf('M18 17h10v3h3v7h-3v3h-8v-3h-3V17Z','M19 19h7v3h3v4h-3v2h-5v-3h-2Z');return a+r(6,5,5,2,C.greenLight)+r(20,5,5,2,C.greenLight)+r(4,20,5,2,C.greenLight)+r(20,20,5,2,C.greenLight)+r(14,13,4,5,C.greenDark);};
  art.weight=function(){return p('M11 2h10v3h3v7h3v3l4 13H1l4-13v-3h3V5h3ZM12 6v6h8V6Z',C.ink)+p('M12 3h8v3h3v6h-3V6h-8v6H9V6h3Z',C.steel)+p('M7 14h18l4 12H3Z',C.steelDark)+p('M7 14h9v11H4Z',C.steel)+r(8,15,12,2,C.steelLight)+r(13,19,6,4,C.ink)+r(14,19,2,3,C.steelLight);};
  art.brain=function(){return p('M10 4h12v2h5v4h3v11h-3v5h-5v3H10v-3H5v-5H2V10h3V6h5Z',C.ink)+p('M10 5h11v3h5v4h3v8h-3v5h-5v3H11v-3H6v-5H3v-8h3V8h4Z',C.redDark)+p('M11 6h9v3h5v4h3v6h-4v5h-4v3h-8v-3H7v-5H4v-6h3V9h4Z',C.redLight)+p('M14 7h3v19h-3ZM8 10h5v3H8v4H5v-6h3ZM20 10h5v3h-4v5h5v3h-7v-9h1ZM8 19h4v3h-2v3H8Z',C.redDark)+r(9,8,4,2,C.white)+r(18,7,3,2,C.white);};
  art.trophy=function(){return p('M7 2h18v4h6v12h-4v4h-6v4h5v5H6v-5h5v-4H5v-4H1V6h6Z',C.ink)+p('M7 7H3v9h3v3h5v-3H6V9h1ZM25 7h4v9h-3v3h-5v-3h5V9h-1Z',C.goldDark)+p('M8 3h16v12h-2v4h-4v7h6v3H8v-3h6v-7h-4v-4H8Z',C.gold)+r(8,3,16,2,C.goldLight)+r(9,5,4,9,C.goldLight)+r(10,5,2,7,C.goldWhite)+r(8,27,15,2,C.goldLight)+r(14,20,3,6,C.goldLight)+p('M13 9h6v2h2v3h-3v3h-4v-3h-3v-3h2Z',C.goldDark)+r(14,9,3,2,C.goldWhite);};
  art.medal=function(){return p('M5 1h9l2 5 2-5h9l-5 15 4 5v6l-5 5H11l-5-5v-6l4-5Z',C.ink)+p('M6 2h6l5 13h-5Z',C.redDark)+p('M7 2h3l5 11h-3Z',C.redLight)+p('M20 2h5l-5 13h-5Z',C.blueDark)+p('M21 2h3l-5 12h-2Z',C.blueLight)+p('M12 15h9v3h3v8l-4 4h-7l-4-4v-8h3Z',C.goldDark)+p('M13 16h7v3h3v6l-4 4h-5l-4-4v-6h3Z',C.goldLight)+r(12,20,3,5,C.goldWhite)+p('M16 19h3v3h2v2h-3v3h-2v-3h-3v-2h3Z',C.goldDark);};
  art.lock=function(){return p('M10 1h12v3h4v10h3v16H3V14h3V5h4ZM11 7v7h10V7Z',C.ink)+p('M10 2h12v3h3v9h-4V7H11v7H7V6h3Z',C.steelDark)+r(10,3,11,2,C.steelLight)+r(8,6,2,8,C.steelLight)+r(22,6,2,8,C.steel)+r(4,15,24,14,C.goldDark)+r(5,16,21,10,C.gold)+r(5,16,21,2,C.goldLight)+r(5,18,3,8,C.goldLight)+r(14,20,5,4,C.ink)+r(15,23,3,4,C.ink)+r(6,27,20,1,C.goldLight);};
  art.door=function(){return p('M10 1h12v3h5v5h3v22H2V9h3V4h5Z',C.ink)+p('M10 2h12v3h4v5h3v20H3V10h3V5h4Z',C.steelDark)+r(4,11,5,18,C.steel)+r(23,11,5,18,C.steel)+r(7,6,6,5,C.steelLight)+r(13,3,7,6,C.steel)+r(21,6,4,5,C.steel)+p('M12 8h8v3h3v19H9V11h3Z',C.woodDark)+r(11,12,10,17,C.wood)+r(12,12,2,16,C.woodLight)+r(17,12,1,17,C.woodDark)+r(9,17,14,2,C.goldDark)+r(19,20,2,2,C.goldLight)+r(4,18,4,1,C.ink)+r(24,22,4,1,C.ink);};
  art.tower=function(){return p('M2 7h3V4h4v3h3V1h8v6h3V4h4v3h3v24H2Z',C.ink)+p('M3 8h7v22H3ZM12 3h7v27h-7ZM22 8h7v22h-7Z',C.steelDark)+r(3,9,4,20,C.steel)+r(12,4,4,25,C.steel)+r(22,9,4,20,C.steel)+r(3,8,7,2,C.steelLight)+r(12,3,7,2,C.steelLight)+r(22,8,7,2,C.steelLight)+r(5,13,3,5,C.ink)+r(14,8,3,5,C.ink)+r(24,13,3,5,C.ink)+r(13,22,5,9,C.woodDark)+r(14,23,2,7,C.wood)+r(3,24,7,1,C.steelLight)+r(22,24,7,1,C.steelLight)+r(19,1,2,9,C.gold)+p('M21 2h8v5h-8Z',C.red);};
  art.gear=function(){
    // Symmetric eight-tooth steel cog: one continuous rim and an open axle.
    var outline='M12 6 14 5 13 1 19 1 18 5 20 6 22 7 24 3 29 8 25 10 26 12 27 14 31 13 31 19 27 18 26 20 25 22 29 24 24 29 22 25 20 26 18 27 19 31 13 31 14 27 12 26 10 25 8 29 3 24 7 22 6 20 5 18 1 19 1 13 5 14 6 12 7 10 3 8 8 3 10 7Z';
    return p(outline,C.ink)+
      '<g transform="translate(16 16) scale(.87) translate(-16 -16)">'+p(outline,C.steel)+'</g>'+
      p('M13 4h6v3h-6ZM5 10h3v5H5ZM9 7h4v3H9Z',C.steelLight)+
      p('M24 17h3v5h-3ZM19 24h4v3h-4ZM13 25h6v3h-6Z',C.steelDark)+
      p('M12 8h8v2h3v3h2v6h-2v3h-3v2h-8v-2H9v-3H7v-6h2v-3h3Z',C.steelLight)+
      p('M12 10h8v2h2v8h-2v2h-8v-2h-2v-8h2Z',C.steelDark)+
      p('M13 12h6v2h2v5h-2v2h-6v-2h-2v-5h2Z',C.ink)+
      r(13,12,6,1,C.shadow)+r(13,21,6,1,C.white);
  };
  art.bell=function(){return p('M12 1h8v4h4v4h3v12h3v5H20v5h-8v-5H2v-5h3V9h3V5h4Z',C.ink)+r(13,2,6,4,C.goldDark)+r(14,2,3,2,C.goldLight)+p('M12 6h8v3h4v12h3v3H5v-3h3V9h4Z',C.goldDark)+p('M12 7h7v3h3v11H8V10h4Z',C.gold)+r(11,9,3,11,C.goldLight)+r(12,9,2,6,C.goldWhite)+r(5,22,22,2,C.goldLight)+r(13,26,6,3,C.goldDark)+r(13,26,4,2,C.goldLight);};
  art.staff=function(){return p('M12 1h8v3h4v4h3v5h-3v4h-6v13h-5V17H8v-4H5V8h3V4h4Z',C.ink)+r(14,15,3,15,C.woodDark)+r(14,16,1,13,C.woodLight)+p('M11 3h10v3h3v7h-4v3h-9v-3H8V6h3Z',C.goldDark)+p('M12 4h8v2h3v6h-4v2h-7v-2H9V6h3Z',C.goldLight)+jewel(12,4,C.violet)+r(12,17,7,2,C.gold)+r(12,24,7,2,C.gold);};
  art.ring=function(){return p('M11 2h10v3h4v7h-3v3h5v4h2v8h-4v3H7v-3H3v-8h2v-4h5v-3H7V5h4Z',C.ink)+p('M9 15h14v3h3v8h-3v3H9v-3H5v-8h4Z',C.goldDark)+p('M10 16h12v3h3v6h-4v3H9v-3H6v-6h4Z',C.goldLight)+p('M11 19h10v6H11Z',C.ink)+r(7,19,2,5,C.goldWhite)+r(10,26,10,1,C.goldWhite)+jewel(12,3,C.blueLight)+r(10,11,13,3,C.gold);};
  art.fang=function(){return p('M13 1h12v6h-2v6h-3v6h-5v5h-5v4H5v3H1v-5h4v-4h4v-6h3V9h1Z',C.ink)+p('M14 2h10v4h-2v6h-3v6h-5v5H9v4H5v2H3v-3h4v-5h4v-7h3Z',C.woodLight)+p('M14 6h8v5h-3v6h-4v5h-5v3H7v-3h4v-8h3Z',C.steelLight)+r(14,6,3,7,C.white)+r(12,14,3,6,C.white)+r(9,21,3,3,C.white)+r(14,2,10,3,C.wood);};
  art.brainFog=function(){return art.brain()+p('M1 3h9v2h5v6h-5v2H2V9H0V5h1Z',C.steelDark)+r(2,4,7,3,C.steelLight)+r(9,6,4,3,C.steel);};
  art.bolt=function(){return p('M17 1h12v4h-4v5h-4v3h7v4h-5v5h-5v5h-5v4H7V20h4v-5H5v-4h5V6h7Z',C.ink)+p('M18 2h9v2h-4v5h-4v5h7v2h-5v5h-5v5h-5v3H9v-8h4v-7H7v-2h5V7h6Z',C.gold)+p('M18 2h7v2h-4v5h-4v5h-5v-2h2V7h4ZM13 16h4v6h-4v4h-2v-5h2Z',C.goldWhite);};
  art.snow=function(){return p('M14 1h4v6h3V4h4v4h-4v4h7v4h-7v3h4v4h-4v-3h-3v10h-4V20h-3v3H7v-4h4v-3H3v-4h8V8H7V4h4v3h3Z',C.ink)+p('M15 2h2v8h4V6h2v1h-4v6h8v2h-8v6h4v1h-2v-4h-4v10h-2V18h-4v4H9v-1h4v-6H4v-2h9V7H9V6h2v4h4Z',C.blueLight)+r(13,11,7,7,C.blueDark)+r(14,12,5,5,C.steelLight)+r(15,13,3,3,C.white)+r(15,3,1,6,C.white);};
  art.wind=function(){return p('M3 5h18V3h7v3h3v7h-4v3H8v-4h17V9H3ZM1 19h23v-2h5v4h2v6h-4v3h-7v-4h6v-3H1ZM5 26h11v4H5Z',C.ink)+p('M4 6h18V4h5v3h3v5h-4v3H9v-2h17V8H4ZM2 20h23v-2h3v4h2v4h-4v3h-5v-2h6v-5H2ZM6 27h9v2H6Z',C.green)+r(4,6,18,1,C.greenLight)+r(9,13,17,1,C.white)+r(2,20,23,1,C.greenLight)+r(21,27,6,1,C.white);};
  art.sun=function(){return p('M13 1h6v5h-6ZM3 3h5v5H3ZM24 3h5v5h-5ZM1 13h5v6H1ZM26 13h5v6h-5ZM3 25h5v5H3ZM24 25h5v5h-5ZM13 26h6v5h-6Z',C.goldDark)+p('M12 6h8v2h4v4h2v8h-2v4h-4v2h-8v-2H8v-4H6v-8h2V8h4Z',C.ink)+p('M12 7h8v2h3v4h2v6h-2v4h-3v2h-8v-2H9v-4H7v-6h2V9h3Z',C.gold)+p('M12 8h7v2h-7v3H9v6H8v-7h2v-2h2Z',C.goldWhite)+r(12,13,3,3,C.goldLight)+r(17,16,4,5,C.goldDark)+r(14,1,3,4,C.goldLight)+r(27,14,3,3,C.goldLight)+r(14,27,3,3,C.goldLight)+r(1,14,3,3,C.goldLight);};
  art.moon=function(){return p('M13 2h12v4h-7v3h-4v5h1v5h4v3h7v-1h4v5h-5v3H13v-3H7v-5H3V10h4V5h6Z',C.ink)+p('M13 3h10v2h-7v3h-4v7h2v5h4v3h9v-1h2v3h-5v3H13v-3H8v-5H4V11h4V6h5Z',C.violetDark)+p('M13 4h7v1h-7v4H9v9h3v6h4v3h-3v-3H9v-5H5v-7h3V7h5Z',C.violetLight)+r(8,12,3,3,C.violet)+r(12,21,3,2,C.violet)+sparkle(23,5,C.goldLight)+sparkle(23,14,C.white);};
  art.star=function(){return p('M14 1h4v8h4v3h8v5h-7v4h-3v9h-5v-7h-4v-3H2v-5h8v-4h4Z',C.ink)+p('M15 3h2v8h4v3h7v2h-7v5h-3v7h-2v-7h-5v-3H4v-2h8v-5h3Z',C.violet)+p('M15 7h2v7h6v2h-6v8h-1v-7H9v-1h6Z',C.white)+r(17,17,3,3,C.violetDark)+sparkle(3,4,C.goldLight)+sparkle(24,23,C.blueLight);};
  art.arrow=function(direction){
    var a=p('M12 3h5v7h13v12H17v7h-5L1 18v-4Z',C.ink)+p('M12 5h3v7h13v8H15v7h-2L3 17v-2Z',C.steelDark)+p('M12 5h3v7h13v3H12v-5l-7 7-2-2Z',C.steelLight)+p('M12 16h16v3H15v6h-2l-8-8 3-3 4 4Z',C.steel);
    return direction==='right'?'<g transform="translate(32 0) scale(-1 1)">'+a+'</g>':direction==='up'?'<g transform="translate(32 0) rotate(90)">'+a+'</g>':direction==='down'?'<g transform="translate(0 32) rotate(-90)">'+a+'</g>':a;
  };
  art.check=function(){return p('M24 3h6v6h-3v4h-4v4h-4v4h-4v6H9v-4H5v-4H1v-7h6v3h4v3h2v-4h4v-4h4V6h3Z',C.ink)+p('M25 4h4v4h-3v4h-4v4h-4v4h-4v6h-4v-4H6v-4H2v-5h4v3h4v3h4v-4h4v-4h4V7h3Z',C.green)+p('M25 4h4v2h-4v3h-3v4h-4v4h-4v3h-4v-2H8v-2h3v2h2v-4h4v-4h4V6h4Z',C.greenLight);};
  art.close=function(){return p('M5 2L16 13 27 2l4 4-11 11 11 11-4 4-11-11L5 32l-4-4 11-11L1 6Z',C.ink)+p('M5 4l11 11L27 4l2 2-11 11 11 11-2 2-11-11L5 30l-2-2 11-11L3 6Z',C.red)+p('M5 4l11 11L27 4l1 1-12 12L4 5Z',C.redLight)+p('M16 19l11 11 2-2-11-11Z',C.redDark);};
  art.save=function(){return p('M4 2h20l6 6v22H2V2Z',C.ink)+p('M4 3h19l6 6v20H3V3Z',C.blueDark)+r(5,4,4,23,C.blue)+r(8,3,15,11,C.ink)+r(9,3,13,9,C.steelLight)+r(17,4,4,7,C.steelDark)+r(7,18,18,11,C.ink)+r(8,19,16,9,C.white)+r(10,21,12,1,C.steel)+r(10,24,12,1,C.steel)+r(5,4,2,10,C.blueLight)+r(25,10,2,16,C.blue);};
  art.speaker=function(off){return p('M3 11h7V8h4V4h6v25h-6v-4h-4v-3H2V11Z',C.ink)+p('M4 12h7V9h4V5h4v23h-4v-4h-4v-3H4Z',C.woodDark)+r(4,13,7,7,C.gold)+r(4,13,6,2,C.goldLight)+p('M12 10h3V7h3v19h-3v-4h-3Z',C.gold)+r(15,7,2,18,C.goldLight)+(off?p('M22 11h3v4h2v-4h3v5h-3v3h3v5h-3v-4h-2v4h-3v-5h3v-3h-3Z',C.redLight):p('M22 8h3v4h2v10h-2v4h-3v-3h2V11h-2ZM27 4h2v5h2v17h-2v4h-2v-5h2V10h-2Z',C.steelLight));};
  art.warning=function(){return p('M13 1h6v4h3v5h3v5h3v5h3v10H1V20h3v-5h3v-5h3V5h3Z',C.ink)+p('M14 3h4v4h3v5h3v5h3v5h2v6H3v-6h2v-5h3v-5h3V7h3Z',C.goldDark)+p('M14 4h3v4h3v5h3v5h3v5h2v3H4v-3h2v-5h3v-5h3V8h2Z',C.goldLight)+r(14,10,4,10,C.ink)+r(14,23,4,3,C.ink)+r(6,23,2,3,C.goldWhite)+r(11,10,1,5,C.goldWhite);};
  art.hourglass=function(){return p('M5 1h22v5h-3v7l-5 4 5 4v5h3v5H5v-5h3v-5l5-4-5-4V6H5Z',C.ink)+r(6,2,20,3,C.goldDark)+r(6,2,19,1,C.goldLight)+r(6,27,20,3,C.goldDark)+r(6,27,19,1,C.goldLight)+p('M10 6h12v6l-6 5-6-5ZM16 18l6 5v3H10v-3Z',C.blueDark)+p('M11 6h9v5l-5 4-4-4ZM15 20l5 4v2h-9v-2Z',C.steelLight)+p('M11 10h10v2l-5 4-5-4ZM15 20h2v2h3v2h2v2H10v-2h2v-2h3Z',C.goldLight)+r(11,7,2,3,C.white)+r(15,16,2,6,C.gold);};
  art.snake=function(){return p('M12 2h13v3h5v9h-5v3H14v4h13v3h4v6H9v-3H4v-7h4v-5h4v-3h11V8H12v3H7V5h5Z',C.ink)+p('M12 3h12v3h5v7h-5v3H13v6h13v3h4v4H10v-3H5v-5h4v-5h4v-3h11V7H11v3H8V6h4Z',C.greenDark)+p('M12 4h11v3H11v3H9V6h3ZM13 16h4v2h-2v4h10v2H13ZM10 25h16v2H10Z',C.greenLight)+r(24,7,3,2,C.goldLight)+r(25,7,1,1,C.ink)+r(24,13,1,3,C.white)+r(27,13,1,3,C.white)+p('M29 10h3v2h-2v2h-2v-2h1Z',C.red);};
  art.silence=function(){return p('M5 3h22v3h4v17h-4v3H15l-8 6v-6H2V6h3Z',C.ink)+p('M6 4h20v3h4v15h-4v3H14l-6 4v-4H3V7h3Z',C.steelDark)+p('M6 5h20v3h3v12H5V8h1Z',C.steelLight)+r(8,11,3,3,C.ink)+r(15,11,3,3,C.ink)+r(22,11,3,3,C.ink)+p('M25 1h5v5L6 30H1v-5Z',C.ink)+p('M26 2h3v3L5 29H2v-3Z',C.red)+p('M26 2h2L2 28v-2Z',C.redLight);};
  art.claw=function(){return art.paw();};
  art.wing=function(){return art.boot(true);};
  art.ice=function(){return art.snow();};
  art.drop=function(){return p('M14 1h4v6h3v5h4v5h3v9h-4v4H8v-4H4v-9h3v-5h4V7h3Z',C.ink)+p('M15 3h2v5h3v5h4v5h3v7h-4v4H9v-4H5v-7h3v-5h4V8h3Z',C.blueDark)+p('M15 7h2v5h3v5h3v7h-3v3H10v-3H7v-6h3v-5h3V9h2Z',C.blue)+p('M13 13h2v5h-3v5H9v-5h2v-3h2Z',C.blueLight)+r(10,18,2,4,C.white);};
  art.spear=function(){return p('M14 1h4v4h3v4h3v4h-6v17h-4V13H8V9h3V5h3Z',C.ink)+p('M15 2h2v4h3v4h2v2H10v-2h2V6h3Z',C.steel)+p('M15 3h1v8h-5v-1h2V6h2Z',C.white)+r(14,13,4,17,C.woodDark)+r(14,13,2,16,C.woodLight)+r(12,12,8,2,C.goldLight)+r(13,22,6,2,C.gold);};
  art.dice=function(){return p('M3 3h17v3h4v14h-3v3H3V3ZM16 13h12v3h3v14H16Z',C.ink)+p('M4 4h15v3h3v12h-3v3H4Z',C.woodLight)+r(5,5,14,14,C.white)+r(7,7,3,3,C.ink)+r(14,7,3,3,C.ink)+r(7,14,3,3,C.ink)+r(14,14,3,3,C.ink)+r(17,15,12,14,C.steel)+r(18,16,10,12,C.steelLight)+r(19,17,3,3,C.ink)+r(24,23,3,3,C.ink);};
  art.shrine=function(){return p('M4 15h24v6h-3v6h5v4H2v-4h5v-6H4Z',C.ink)+r(5,16,22,4,C.steelDark)+r(5,16,21,1,C.steelLight)+r(9,20,14,7,C.steel)+r(10,21,3,5,C.steelLight)+r(3,28,26,2,C.steelDark)+r(4,28,23,1,C.steelLight)+p('M11 13V8h3V3h4v5h3v5l-3 4h-4Z',C.goldDark)+p('M14 6h3v4h3v3l-3 3h-3l-2-3V9h2Z',C.goldLight)+r(14,11,3,4,C.white)+sparkle(3,4,C.goldLight)+sparkle(25,4,C.goldLight);};
  function small(body,x,y,scale){return '<g transform="translate('+x+' '+y+') scale('+scale+')">'+body+'</g>';}
  function plus(){return p('M24 18h5v5h4v5h-4v5h-5v-5h-5v-5h5Z',C.ink)+p('M25 19h3v5h4v3h-4v5h-3v-5h-5v-3h5Z',C.greenLight);}
  function minus(body){return body+p('M1 23h11v8H1Z',C.ink)+r(2,24,9,6,C.redDark)+r(4,26,5,2,C.redLight);}
  function dual(){return '<g transform="translate(32 0) scale(-1 1)">'+art.sword()+'</g>'+art.sword();}
  var roles={};
  function bind(ids,draw){ids.split(' ').forEach(function(id){roles[id]=draw;});}
  bind('heart blessVitality relicAdrenalineCore',function(){return art.heart();});
  bind('drop',art.drop);
  bind('potion',function(){return art.flask('hp');});
  bind('mpPotion blessClarity',function(){return art.flask('mp');});
  bind('scroll microHistory',function(){return art.scroll();});
  bind('gem',function(){return art.gem();});
  bind('coin blessWealth eventMerchant',function(){return art.coins();});
  bind('phys swordAttack weaponSlot blessMight',function(){return art.sword();});
  bind('fire statusBurn',art.flame);
  bind('ice',art.snow);
  bind('elec eventShortcut microCombo',art.bolt);
  bind('wind',art.wind);
  bind('light',art.sun);
  bind('dark',art.moon);
  bind('almighty magicBurst star sparkles microNew',art.star);
  bind('shieldGuard blessGuardian relicGuard routeSafe',function(){return art.shield();});
  bind('bagItem microIngredient',function(){return art.bag();});
  bind('weaponSlotMag',art.staff);
  bind('armorSlot blessIronSkin',art.armor);
  bind('shoesSlot',function(){return art.boot();});
  bind('accessorySlot blessWarding',art.pendant);
  bind('lock',art.lock);
  bind('back',function(){return art.arrow('left');});
  bind('chevronRight',function(){return art.arrow('right');});
  bind('enterFloor doorway',art.door);
  bind('towerSpire',art.tower);
  bind('check',art.check);
  bind('close downedMark',art.close);
  bind('buffUp ascension',function(){return art.arrow('up');});
  bind('debuffDown',function(){return art.arrow('down');});
  bind('trophy microTrophy',art.trophy);
  bind('medal',art.medal);
  bind('codex blessWisdom eventSage',function(){return art.book();});
  bind('companionSlot eventCompanion blessWildcat',art.paw);
  bind('eventChest',art.chest);
  bind('eventShrine',art.shrine);
  bind('eventSpring',art.drop);
  bind('eventGambler',art.dice);
  bind('relicVampiricFang',art.fang);
  bind('relicStoneWard blessStoneSkin',art.wall);
  bind('relicMomentumCharm blessSwiftness',function(){return art.boot(true);});
  bind('relicCursedCoin',function(){return art.coins()+p('M16 6h3v7h-3v5h4v5h-3v-4h-4v-7h3Z',C.ink);});
  bind('relicOpportunist blessInsight',art.eye);
  bind('relicSwiftRecovery',function(){return art.heart()+small(plus(),7,8,.7);});
  bind('relicBreak',function(){return art.gem()+p('M15 3h3v8h-4v5h4v7h-3v-6h-4v-7h4Z',C.ink);});
  bind('relicEcho propDawnBell',art.bell);
  bind('settingsGear',art.gear);
  bind('save',art.save);
  bind('trash',function(){return p('M11 2h10v4h8v5h-3v19H6V11H3V6h8Z',C.ink)+r(12,3,8,3,C.steelDark)+r(4,7,24,3,C.steel)+r(5,7,21,1,C.steelLight)+r(7,11,18,18,C.steelDark)+r(8,12,15,16,C.steel)+r(10,13,2,13,C.steelLight)+r(15,13,2,13,C.steelDark)+r(20,13,2,13,C.steelDark);});
  bind('soundOn',function(){return art.speaker(false);});
  bind('soundOff',function(){return art.speaker(true);});
  bind('microWarning',art.warning);
  bind('microUrgent',art.hourglass);
  bind('microRoute routeExplore',art.compass);
  bind('statusPoison',art.snake);
  bind('statusSilence',art.silence);
  bind('statusCleanse',function(){return art.flask('cleanse');});
  bind('routeElite',function(){return art.skull();});
  bind('talentRiposte',function(){return art.shield()+small(art.sword(),15,14,.55);});
  bind('talentFlurry eventBattlefield',dual);
  bind('talentPierce',art.spear);
  bind('blessFortune',art.clover);
  bind('blessTitan',art.fist);
  bind('blessWanderer',function(){return art.map();});
  bind('blessFocus',function(){return art.target();});
  bind('curseFrailty',function(){return minus(art.heart(true));});
  bind('curseFool',function(){return minus(art.book(true));});
  bind('curseSlowness',function(){return minus(art.boot(false,true));});
  bind('cursePoverty',function(){return minus(art.bag(true));});
  bind('curseWeakArms',function(){return minus(art.sword(true));});
  bind('curseDullMind',function(){return minus(art.brainFog());});
  bind('curseTitanBurden',function(){return minus(art.weight());});
  bind('curseWandererRuin',function(){return minus(art.map(true));});
  bind('curseBrokenFocus',function(){return minus(art.target(true));});
  bind('curseFrailMind',function(){return minus(art.flask('mp',true));});
  bind('skull skullMark',function(){return art.skull();});
  bind('crownSkull',function(){return art.skull('crown');});
  bind('skullFire',function(){return art.skull('fire');});
  // All remaining interface families use the same readable object vocabulary.
  art.hammer=function(){return p('M3 3h20v3h6v9h-9v-3h-4v18h-6V12H3Z',C.ink)+r(11,10,4,19,C.woodDark)+r(11,12,2,16,C.woodLight)+r(4,4,18,7,C.steel)+r(4,4,18,2,C.steelLight)+r(22,7,6,7,C.steelDark)+r(23,7,4,2,C.steelLight)+r(10,10,6,3,C.gold);};
  art.anvil=function(){return p('M1 7h29v8h-6l-4 5v4h7v6H6v-6h6v-4L7 15H1Z',C.ink)+r(2,8,27,5,C.steel)+r(2,8,26,2,C.steelLight)+p('M8 14h16l-6 7v4h7v3H8v-3h6v-5Z',C.steelDark)+r(9,26,15,2,C.steel)+r(14,15,4,7,C.steel);};
  art.camp=function(){return p('M4 23l24 5v4L3 27ZM27 22l-24 6v4l26-6Z',C.ink)+p('M5 24l22 5v2L5 26ZM26 24l-21 6v-2l21-6Z',C.wood)+r(5,25,5,1,C.woodLight)+small(art.flame(),5,0,.72);};
  art.parcel=function(){return p('M3 5h26v25H3Z',C.ink)+r(4,6,24,23,C.woodDark)+r(5,7,22,20,C.woodLight)+r(5,7,22,3,C.goldLight)+r(14,7,4,20,C.goldWhite)+r(5,15,22,4,C.goldWhite)+r(20,21,5,4,C.white)+r(21,22,3,1,C.wood);};
  art.board=function(){return p('M3 2h26v25H18v4h-4v-4H3Z',C.ink)+r(4,3,24,23,C.woodDark)+r(6,5,20,19,C.wood)+r(8,7,8,14,C.white)+r(19,8,5,8,C.goldWhite)+r(10,10,4,1,C.wood)+r(10,13,4,1,C.wood)+r(10,16,3,1,C.wood)+r(20,10,3,1,C.wood)+r(14,27,4,3,C.woodLight);};
  art.meal=function(){return p('M2 19h28v6h-4v4H6v-4H2Z',C.ink)+p('M3 20h26v4h-4v4H7v-4H3Z',C.steel)+r(4,20,24,2,C.steelLight)+p('M6 18v-5h3v-3h13v3h4v5Z',C.woodDark)+p('M7 17v-4h4v-2h10v3h4v3Z',C.woodLight)+r(10,12,3,4,C.goldWhite)+r(17,12,3,4,C.goldWhite)+r(7,3,2,5,C.steelLight)+r(15,1,2,6,C.steel)+r(23,3,2,5,C.steelLight);};
  art.home=function(){return p('M1 14L14 2h4l13 12v5h-5v12H6V19H1Z',C.ink)+p('M3 14L15 3h2l12 11v2h-5L16 9l-8 7H3Z',C.redDark)+p('M8 16l8-7 8 7v13H8Z',C.woodLight)+r(13,19,6,10,C.woodDark)+r(10,16,3,4,C.goldWhite)+r(21,5,4,7,C.steel)+r(16,24,1,2,C.goldLight);};
  art.play=function(){return p('M7 2h5l19 12v5L12 31H7Z',C.ink)+p('M9 4h2l18 11v3L11 29H9Z',C.greenDark)+p('M10 5l17 11-17 10Z',C.green)+p('M10 5l17 11h-5L10 9Z',C.greenLight);};
  art.credits=function(){return art.scroll()+small(art.medal(),16,14,.48);};
  bind('menuContinue',art.play);
  bind('home',art.home);
  bind('credits',art.credits);
  bind('workBench workSalvage',art.hammer);
  bind('workForge',art.anvil);
  bind('workCamp eventNightCamp',art.camp);
  bind('workParcel',art.parcel);
  bind('workGuild workBounty',art.board);
  bind('workBook workStudy tome',function(){return art.book();});
  bind('workMeal',art.meal);
  bind('workSocket',function(){return p('M7 4h18l5 5v18l-5 4H7l-5-4V9Z',C.ink)+p('M8 5h16l5 5v16l-5 4H8l-5-4V10Z',C.steelDark)+r(5,10,3,15,C.steel)+r(9,6,14,2,C.steelLight)+p('M12 9h8l6 7-10 12L6 16Z',C.ink)+p('M12 11h8l4 5-8 10-8-10Z',C.blueDark)+p('M12 11h7l-3 6H9Z',C.blueLight)+p('M16 17h8l-8 9Z',C.blue)+r(11,12,5,2,C.white)+r(3,9,6,3,C.gold)+r(23,9,6,3,C.gold)+r(3,24,6,3,C.gold)+r(23,24,6,3,C.gold);});
  bind('workReinforced',art.armor);
  bind('workWard duoGuard',function(){return art.shield();});
  bind('workBond bondHeart duoHeal',function(){return art.heart();});
  bind('workElite',function(){return art.skull('crown');});
  bind('duoStrike',dual);
  bind('duoBoost',function(){return art.arrow('up');});
  bind('eventBloodAltar',function(){return art.shrine()+small(art.drop().replace(/#274a73/g,C.redDark).replace(/#478ac1/g,C.red).replace(/#93d9eb/g,C.redLight),12,11,.5);});
  bind('shiftFlip',function(){return p('M3 5h18V1l10 8-10 8v-5H3ZM29 27H11v4L1 23l10-8v5h18Z',C.ink)+p('M4 6h18V3l7 6-7 6v-4H4Z',C.blue)+r(4,6,18,2,C.blueLight)+p('M28 26H10v3l-7-6 7-6v4h18Z',C.gold)+r(10,21,18,2,C.goldLight);});
  bind('shiftHunt',function(){return art.target();});
  bind('shiftDrain',art.fang);
  bind('shiftStrip',function(){return art.shield()+small(art.close(),17,17,.45);});
  function rune(draw){return function(){return p('M7 2h18l5 6v18l-5 5H7l-5-5V8Z',C.ink)+p('M8 3h16l5 6v16l-5 5H8l-5-5V9Z',C.steelDark)+p('M8 4h15l4 5H7v15H4V9Z',C.steelLight)+small(draw(),5,5,.69);};}
  bind('runeFracture',rune(function(){return art.sword(true);}));
  bind('runeShelter',rune(function(){return art.shield();}));
  bind('runeVenom',rune(art.snake));
  bind('runeVigor',rune(function(){return art.heart();}));
  bind('runeEmber',rune(art.flame));
  bind('runeFrost',rune(art.snow));
  bind('runeThunder',rune(art.bolt));
  bind('runeGale',rune(art.wind));
  bind('runeSun',rune(art.sun));
  bind('runeMoon',rune(art.moon));
  bind('runeFocus',rune(function(){return art.target();}));
  bind('runeDiscovery',rune(art.eye));
  // Workshop supplies and story objects must not fall back to the old flat tiles.
  bind('workMetal',function(){return p('M3 10l8-6 18 5v9l-8 8L3 21Z',C.ink)+p('M4 11l7-5 16 4-7 6Z',C.steelLight)+p('M4 12l16 5v7L4 20Z',C.steel)+p('M21 17l7-6v6l-7 7Z',C.steelDark)+r(7,14,6,2,C.white)+p('M10 25l7-3 12 4v4H14Z',C.steelDark)+p('M12 25l5-2 11 3-12 2Z',C.steelLight);});
  bind('workCloth',function(){return p('M4 5h21l5 5v19H7l-5-5V8Z',C.ink)+p('M5 6h19l4 4v17H8l-4-4V9Z',C.greenDark)+p('M6 7h16v3h4v13H8V10H6Z',C.green)+r(9,10,2,12,C.greenLight)+r(13,10,11,2,C.greenLight)+r(8,25,18,2,C.gold)+r(22,13,2,9,C.greenDark)+r(5,7,17,2,C.goldLight);});
  bind('workDust',function(){return p('M10 2h12v5h-2v3l8 8v10l-3 3H7l-3-3V18l8-8V7h-2Z',C.ink)+r(11,3,10,4,C.wood)+r(12,3,8,2,C.woodLight)+p('M13 8h6v4l7 7v8l-2 2H8l-2-2v-8l7-7Z',C.blueDark)+p('M8 20h16v7H8Z',C.violet)+r(8,19,16,2,C.violetLight)+r(8,16,2,8,C.white)+sparkle(14,21,C.goldWhite)+r(20,24,2,2,C.goldLight)+r(14,14,2,2,C.violetLight);});
  art.lantern=function(){return p('M12 1h8v2h3v6h3v4h2v14l-4 4H8l-4-4V13h2V9h3V3h3ZM13 4v5h6V4Z',C.ink)+p('M12 2h8v2h2v5h-3V5h-6v4h-3V4h2Z',C.gold)+r(7,10,18,3,C.goldLight)+r(6,14,20,12,C.goldDark)+r(10,14,12,12,C.goldWhite)+p('M14 16h4v3h2v5h-8v-5h2Z',C.gold)+r(8,13,2,14,C.gold)+r(22,13,2,14,C.gold)+r(8,27,16,3,C.gold)+r(9,27,14,1,C.goldLight);};
  bind('propLantern',art.lantern);
  bind('propBanner',function(){return r(4,2,4,29,C.ink)+r(5,3,2,27,C.woodLight)+p('M8 4h22v20l-11-5-11 5Z',C.ink)+p('M9 5h19v16l-9-4-10 4Z',C.redDark)+r(9,5,19,2,C.goldLight)+p('M18 8h3v3h4v3h-4v3h-3v-3h-4v-3h4Z',C.goldLight)+r(10,8,2,10,C.red)+r(3,1,6,3,C.goldLight);});
  bind('propCart',function(){return p('M2 9h26v13H2Z',C.ink)+r(3,10,24,10,C.wood)+r(4,11,22,2,C.woodLight)+r(4,16,22,2,C.woodDark)+r(6,9,2,12,C.gold)+r(22,9,2,12,C.gold)+r(26,17,5,3,C.woodLight)+p('M5 20h7v2h2v7h-2v2H5v-2H3v-7h2ZM19 20h7v2h2v7h-2v2h-7v-2h-2v-7h2Z',C.ink)+r(5,23,7,5,C.steel)+r(19,23,7,5,C.steel)+r(7,24,3,3,C.woodDark)+r(21,24,3,3,C.woodDark)+p('M7 9V4h10v5Z',C.goldDark)+r(8,5,8,2,C.goldLight)+r(18,5,6,4,C.redDark);});
  bind('propStarGate',function(){return p('M10 2h12v3h5v5h4v12h-4v5h-5v4H10v-4H5v-5H1V10h4V5h5Z',C.ink)+p('M11 3h10v3h5v5h3v10h-3v5h-5v3H11v-3H6v-5H3V11h3V6h5Z',C.goldDark)+p('M11 5h10v3h4v16h-4v3H11v-3H7V8h4Z',C.violetDark)+p('M11 8h1v17h-1ZM21 8h1v17h-1ZM8 11h17v1H8ZM8 21h17v1H8Z',C.violet)+p('M24 6l-5 12-13 8 7-13Z',C.ink)+p('M23 7l-6 9-4-3Z',C.goldWhite)+p('M13 14l4 3-9 7Z',C.gold)+r(14,14,4,4,C.goldLight)+r(15,15,2,2,C.white)+r(9,8,2,2,C.violetLight)+r(22,21,2,2,C.violetLight)+r(5,11,2,8,C.goldLight);});
  ['Blade','Staff'].forEach(function(kind){['keen','sanguine','sundering'].forEach(function(effect){bind('forge'+kind+effect,function(){var base=kind==='Blade'?art.sword():art.staff();var mark=effect==='keen'?art.target():effect==='sanguine'?art.drop().replace(/#274a73/g,C.redDark).replace(/#478ac1/g,C.red).replace(/#93d9eb/g,C.redLight):art.sword(true);return small(base,0,0,.84)+small(mark,15,15,.54);});});});
  // New feature artwork: handbells, tools, four travelers, and real card suits.
  art.handbell=function(){return p('M13 1h6v3h2v4h-3v5h5v4h3v6h4v5H19v3h-6v-3H2v-5h4v-6h3v-4h5V8h-3V4h2Z',C.ink)+r(14,2,4,5,C.wood)+r(14,2,2,4,C.woodLight)+r(14,8,4,6,C.goldDark)+r(14,9,2,4,C.goldLight)+p('M10 14h12v4h3v6h3v3H4v-3h3v-6h3Z',C.goldDark)+p('M11 15h10v4h2v5H8v-5h3Z',C.gold)+r(11,15,3,7,C.goldLight)+r(11,15,2,5,C.goldWhite)+r(4,25,24,2,C.goldLight)+r(14,28,4,2,C.gold)+p('M17 17h2v2h2v2h-2v2h-2v-2h-2v-2h2Z',C.goldWhite);};
  art.lockpick=function(){return small(art.lock(),0,5,.76)+p('M22 4h8v4h-6v9l-7 7-3-3 7-7V7Z',C.ink)+p('M23 5h6v2h-6v9l-7 7-1-2 7-7V6Z',C.steelLight)+r(24,5,5,2,C.woodLight)+p('M19 26h11v4H17l-5-6 3-3Z',C.ink)+p('M20 27h9v2H18l-5-5 2-1Z',C.steel)+r(22,27,6,2,C.woodLight);};
  art.cards=function(){return p('M1 5l13-4 8 23-13 5Z',C.ink)+p('M3 6l10-3 7 20-10 3Z',C.white)+p('M20 2l11 5-8 23-12-5Z',C.ink)+p('M21 4l8 4-7 19-9-3Z',C.goldWhite)+p('M9 4h15v27H9Z',C.ink)+r(10,5,13,25,C.white)+r(11,6,11,2,C.goldLight)+p('M13 13h3l1 2 1-2h3v5l-4 5-4-5Z',C.redDark)+r(13,13,2,2,C.redLight)+r(11,9,2,3,C.redDark)+r(20,25,2,3,C.redDark)+r(5,8,2,4,C.ink)+r(25,8,2,3,C.redDark);};
  art.fourTravelers=function(){var a='';[[2,2,C.greenDark,C.green],[18,2,C.steelDark,C.steelLight],[2,18,C.violetDark,C.violet],[18,18,C.goldDark,C.goldLight]].forEach(function(t){var x=t[0],y=t[1];a+=r(x+3,y,7,8,C.ink)+r(x+4,y+1,5,5,C.woodLight)+r(x+3,y+6,7,2,t[2])+p('M'+x+' '+(y+12)+'v-3l3-2h7l3 2v3Z',C.ink)+r(x+1,y+9,11,3,t[3])+r(x+4,y+7,4,2,C.goldWhite)+r(x+4,y+2,5,1,t[2])+r(x+5,y+3,1,1,C.ink)+r(x+8,y+3,1,1,C.ink);});return a;};
  bind('propDawnBell',art.handbell);
  bind('miniLockpick achLocksmith',art.lockpick);
  bind('miniCards achCardSharp',art.cards);
  bind('achFourTravelers',art.fourTravelers);
  bind('achDawnBell',function(){return sparkle(2,4,C.goldLight)+sparkle(25,7,C.goldWhite)+small(art.handbell(),3,2,.85);});
  bind('miniForge',function(){return small(art.anvil(),5,12,.66)+p('M4 15h13v4H4Z',C.redDark)+r(5,15,11,2,C.redLight)+'<g transform="translate(10 3) rotate(20 8 8)">'+small(art.hammer(),0,0,.6)+'</g>'+sparkle(18,12,C.goldLight)+r(3,12,2,2,C.goldWhite);});
  bind('achGoldenHammer',function(){return art.hammer().replace(/#475369/g,C.goldDark).replace(/#899db0/g,C.gold).replace(/#d0e1e8/g,C.goldWhite)+sparkle(23,19,C.goldLight)+sparkle(3,24,C.goldWhite);});
  bind('loreBellEcho',function(){return small(art.handbell(),0,2,.8)+p('M24 8h2v3h2v10h-2v3h-2v-3h2V11h-2Z',C.gold)+p('M28 5h2v6h2v10h-2v6h-2v-6h2V11h-2Z',C.goldLight);});
  bind('loreLampRoll',function(){return small(art.scroll(),0,0,.82)+small(art.lantern(),15,14,.5);});
  bind('cardSuitHeart',function(){return art.heart();});
  bind('cardSuitDiamond',function(){return p('M16 2l13 14-13 14L3 16Z',C.redDark)+p('M16 5l10 11-10 11L6 16Z',C.red)+p('M16 5v19L8 16Z',C.redLight);});
  bind('cardSuitSpade',function(){return p('M16 1L3 15v7l4 4h6l-3 5h12l-3-5h6l4-4v-7Z',C.ink)+p('M16 4L5 16v5l3 3h5l3-4 3 4h5l3-3v-5Z',C.steelDark)+p('M15 6l-9 11v4h3v-5Z',C.steel)+r(14,24,4,5,C.steelDark);});
  bind('cardSuitClub',function(){return p('M12 1h8l4 4v7h5l3 4v7l-4 4h-9l3 4H10l3-4H4l-4-4v-7l3-4h5V5Z',C.ink)+p('M13 3h6l3 3v5l-4 4h9l3 3v4l-3 3h-7l-4-5-4 5H5l-3-3v-4l3-3h9l-4-4V6Z',C.steelDark)+r(12,6,3,5,C.steel)+r(4,17,3,4,C.steel)+r(14,24,4,5,C.steelDark);});
  function render(name){
    if(!Object.prototype.hasOwnProperty.call(roles,name))return '';
    return '<svg xmlns="http://www.w3.org/2000/svg" class="pixel-sprite ui-emblem" data-art-style="fantasy-objects-32" viewBox="-2 -2 36 36" shape-rendering="crispEdges" aria-hidden="true">'+roles[name]()+'</svg>';
  }
  window.Game.UISymbols={render:render,keys:Object.keys(roles)};
})();
