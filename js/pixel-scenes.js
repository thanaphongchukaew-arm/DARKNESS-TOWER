// Seamless 32px stonework, shared by story stages and workshop camp scenery.
(function(){
  var G=window.Game,P=G.PixelArt;
  function tile(name,palette,draw){
    var grid=Array.from({length:32},function(){return Array(32).fill('M');});
    function box(x,y,w,h,c){for(var yy=y;yy<y+h;yy++)for(var xx=x;xx<x+w;xx++)grid[(yy+32)%32][(xx+32)%32]=c;}
    draw(box);P.define(name,grid.map(function(r){return r.join('');}),palette);
  }
  tile('tileBrick',{M:'#14131f',S:'#302b3d',T:'#252131',H:'#474052',C:'#393345',V:'#33413e'},function(b){
    [[0,0,19,14],[20,0,12,14],[-8,16,22,14],[15,16,17,14]].forEach(function(q){var x=q[0],y=q[1],w=q[2],h=q[3];b(x,y,w,h,'T');b(x+1,y+1,w-2,h-3,'S');b(x+2,y+1,w-4,1,'H');b(x+1,y+3,1,h-6,'C');b(x+w-3,y+h-4,2,2,'M');});
    b(7,4,2,3,'T');b(8,7,3,1,'M');b(11,8,1,3,'M');b(23,19,1,3,'M');b(21,21,2,1,'M');b(2,12,3,1,'V');b(3,11,1,1,'V');b(27,28,3,1,'V');
  });
  tile('tileGround',{M:'#17151f',S:'#37333f',T:'#292632',H:'#514958',C:'#413c4a',V:'#393f3c'},function(b){
    [[1,1,14,13],[17,1,14,13],[1,16,9,15],[12,16,19,15]].forEach(function(q){var x=q[0],y=q[1],w=q[2],h=q[3];b(x,y,w,h,'T');b(x+1,y+1,w-2,h-3,'S');b(x+2,y+1,w-4,1,'H');b(x+1,y+3,1,h-5,'C');b(x+w-3,y+h-3,2,2,'M');});
    b(6,6,1,3,'T');b(7,9,3,1,'T');b(20,20,3,1,'M');b(23,21,1,4,'M');b(2,28,2,1,'V');b(17,11,4,1,'V');
  });
  function install(){['tileBrick','tileGround'].forEach(function(id){document.documentElement.style.setProperty('--'+id,'url("data:image/svg+xml,'+encodeURIComponent(P.render(id))+'")');});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
  G.SceneArt={keys:['tileBrick','tileGround']};
})();
