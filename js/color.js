/* DUB12 — colour management. Loaded before everything else that touches THREE.
   All hex colours in the game are authored in sRGB; three.js lights in linear space.
   Converting at the source lets the renderer use a proper linear workflow with
   filmic tone mapping, which is what makes light and snow read as real. */
'use strict';
(function(){
  const C=THREE.Color.prototype,setHex=C.setHex,getHex=C.getHex,setStyle=C.setStyle;let inStyle=false;
  C.setHex=function(h){setHex.call(this,h);return inStyle?this:this.convertSRGBToLinear();};
  C.setStyle=function(s){inStyle=true;try{setStyle.call(this,s);}finally{inStyle=false;}return this.convertSRGBToLinear();};
  C.getHex=function(){const r=this.r,g=this.g,b=this.b;this.convertLinearToSRGB();const h=getHex.call(this);this.r=r;this.g=g;this.b=b;return h;};
  const CT=THREE.CanvasTexture;
  class SRGBCanvasTexture extends CT{constructor(...a){super(...a);this.encoding=THREE.sRGBEncoding;}}
  THREE.CanvasTexture=SRGBCanvasTexture;
})();
