/* DUB12 — assets, materials, rider rig */
'use strict';
const U=THREE;
const A={};                       // Blender parts by name
function part(n){const o=A[n].clone(true);o.traverse(c=>{if(c.isMesh){c.castShadow=true;c.receiveShadow=false;}});return o;}
function whiteCols(geo){const n=geo.attributes.position.count,a=new Float32Array(n*3).fill(1);geo.setAttribute('color',new U.BufferAttribute(a,3));return geo;}
function loadAssets(url,onDone,onErr){
  if(!U.GLTFLoader){onErr&&onErr('three.js loaders missing');return;}
  const L=new U.GLTFLoader(),take=g=>{g.scene.traverse(o=>{if(o.parent===g.scene)A[o.name]=o;});
    for(const k in A){A[k].position.set(0,0,0);A[k].rotation.set(0,0,0);A[k].scale.set(1,1,1);}};
  const b64=s=>{const bin=atob(s),buf=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)buf[i]=bin.charCodeAt(i);return buf.buffer;};
  // environment pack built in Blender (tools/make_env.py); optional so the game still runs without it
  // gear pack (your fitted jacket + pants, tools/export_gear.py); also optional
  const prep=g=>{g.scene.traverse(o=>{if(o.isMesh&&!o.geometry.attributes.color)whiteCols(o.geometry);});take(g);};
  // extra pack: park helmet (tools/extract_helmet.py)
  const extra=()=>{if(!window.DUB12_EXTRA_GLB){onDone();return;}const e=b64(window.DUB12_EXTRA_GLB);window.DUB12_EXTRA_GLB=null;L.parse(e,'',g=>{prep(g);onDone();},()=>onDone());};
  const gear=()=>{if(!window.DUB12_GEAR_GLB){extra();return;}const e=b64(window.DUB12_GEAR_GLB);window.DUB12_GEAR_GLB=null;
    L.parse(e,'',g=>{prep(g);extra();},err=>{console.warn('gear pack failed',err);extra();});};
  const env=()=>{if(!window.DUB12_ENV_GLB){gear();return;}const e=b64(window.DUB12_ENV_GLB);window.DUB12_ENV_GLB=null;L.parse(e,'',g=>{take(g);gear();},err=>{console.warn('env pack failed',err);gear();});};
  const got=g=>{take(g);env();};
  if(window.DUB12_GLB){const buf=b64(window.DUB12_GLB);window.DUB12_GLB=null;L.parse(buf,'',got,onErr);return;}
  // hosted site: small Draco-compressed binary packs (tools/compress.py), fetched in parallel and cached by the browser.
  // Hardened: every pack is retried (with a cache-bypassing reload) and, if the compressed copy still can't be read,
  // the uncompressed backup in assets/raw/ is used instead. The decoder is served from the site itself (no CDN needed).
  if(U.DRACOLoader){const D=new U.DRACOLoader();D.setDecoderPath(window.DUB12_DRACO||'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/libs/draco/gltf/');L.setDRACOLoader(D);}
  const V=window.DUB12_V?'?v='+window.DUB12_V:'',wait=ms=>new Promise(r=>setTimeout(r,ms));
  const getBuf=async(url,tries)=>{for(let i=0;i<tries;i++){try{const ctl=window.AbortController?new AbortController():null,t=setTimeout(()=>ctl&&ctl.abort(),25000);
      const r=await fetch(url+(i?(url.includes('?')?'&':'?')+'r='+Date.now():''),{signal:ctl?ctl.signal:undefined,cache:i?'reload':'default'});clearTimeout(t);
      if(!r.ok)throw new Error('HTTP '+r.status);const b=await r.arrayBuffer();if(b.byteLength<1000)throw new Error('short file');return b;}
    catch(e){console.warn('load',url,'attempt',i+1,e);await wait(500*(i+1));}}return null;};
  const parse=buf=>new Promise(res=>{let done=false;const t=setTimeout(()=>{if(!done){done=true;console.warn('parse timeout');res(null);}},20000);
    try{L.parse(buf,'',g=>{if(!done){done=true;clearTimeout(t);res(g);}},e=>{if(!done){done=true;clearTimeout(t);console.warn('parse failed',e);res(null);}});}catch(e){done=true;clearTimeout(t);res(null);}});
  const loadPack=async n=>{let b=await getBuf('assets/'+n+'.glb'+V,2),g=b&&await parse(b);
    if(!g){console.warn('using uncompressed backup for',n);b=await getBuf('assets/raw/'+n+'.glb'+V,3);g=b&&await parse(b);}return g;};
  Promise.all(['models','env','gear','extra'].map(loadPack)).then(([m,e,g,x])=>{if(!m){onErr&&onErr('models');return;}take(m);if(e)take(e);
    if(g)prep(g);if(x)prep(x);onDone();}).catch(err=>{console.error('asset load failed',err);onErr&&onErr(err);});
}
const mname=m=>(m.name||'').replace(/\.\d+$/,'');
// DUB12 emblem (original): yellow sun disc with two red lightning bolts charging into it, red DUB12 wordmark underneath
function drawEmblem(g,cx,cy,s){g.save();g.translate(cx,cy);g.scale(s,s);
  const yg=g.createRadialGradient(-12,-14,6,0,0,62);yg.addColorStop(0,'#fff27a');yg.addColorStop(1,'#f2b800');g.fillStyle=yg;g.beginPath();g.arc(0,-6,58,0,7);g.fill();
  g.fillStyle='#e3262f';g.strokeStyle='#ffffff';g.lineWidth=5;g.lineJoin='round';
  [1,-1].forEach(d=>{g.save();g.scale(d,1);g.beginPath();g.moveTo(-150,-40);g.lineTo(-70,-46);g.lineTo(-84,-18);g.lineTo(-30,-26);g.lineTo(-104,14);g.lineTo(-92,-10);g.lineTo(-150,-4);g.closePath();g.stroke();g.fill();g.restore();});
  g.font='italic 900 66px Impact,Arial Black,sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineWidth=12;g.strokeText('DUB12',0,82);g.fillText('DUB12',0,82);g.restore();}
const EMB={};
function emblemTex(col){if(EMB[col])return EMB[col];const c=document.createElement('canvas');c.width=1024;c.height=512;const g=c.getContext('2d');
  g.fillStyle='#'+col.toString(16).padStart(6,'0');g.fillRect(0,0,1024,512);for(const cx of [256,768])drawEmblem(g,cx,250,.95);   // one on each side of the shell
  const t=new U.CanvasTexture(c);t.anisotropy=8;t.wrapS=U.RepeatWrapping;return EMB[col]=t;}
// waffle-knit bump for the base layer
let WAF=null;function waffleTex(){if(WAF)return WAF;const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,128,128);
  for(let y=0;y<128;y+=16)for(let x=0;x<128;x+=16){const r=g.createRadialGradient(x+8,y+8,1,x+8,y+8,8);r.addColorStop(0,'#5a5a5a');r.addColorStop(1,'#d8d8d8');g.fillStyle=r;g.fillRect(x+2,y+2,12,12);}
  WAF=new U.CanvasTexture(c);WAF.wrapS=WAF.wrapT=U.RepeatWrapping;WAF.repeat.set(10,10);return WAF;}
// race bib print: left half = front, right half = back. Vest shape with arm openings, number box, series name, made-up sponsor marks
const BIBT={};
function bibTex(col){if(BIBT[col])return BIBT[col];const c=document.createElement('canvas');c.width=1024;c.height=512;const g=c.getContext('2d'),hx='#'+col.toString(16).padStart(6,'0');
  const lum=((col>>16&255)*.3+(col>>8&255)*.59+(col&255)*.11)/255,ink=lum>.6?'#111':'#fff';
  for(let h=0;h<2;h++){const ox=h*512;g.save();g.translate(ox,0);
    g.fillStyle=hx;g.beginPath();g.moveTo(-2,500);g.lineTo(-2,300);g.quadraticCurveTo(110,292,140,110);g.lineTo(206,96);g.quadraticCurveTo(256,190,306,96);g.lineTo(372,110);g.quadraticCurveTo(402,292,514,300);g.lineTo(514,500);g.closePath();g.fill();g.fillStyle='rgba(0,0,0,.25)';g.fillRect(0,492,512,8);g.fillStyle='rgba(0,0,0,.18)';g.fillRect(0,300,6,200);g.fillRect(506,300,6,200);   // vest (512 tall: v=0 bottom.. flipped by canvas)
    g.fillStyle='#ffffff';g.fillRect(170,250,172,110);g.strokeStyle=ink;g.lineWidth=4;g.strokeRect(170,250,172,110);
    g.fillStyle='#111';g.font='900 92px Impact,Arial Black,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(h?'12':'12',256,308);
    g.fillStyle=ink;g.font='800 26px Inter,Arial,sans-serif';g.fillText('DUB12 PARK SERIES',256,236);
    g.font='italic 900 30px Impact,sans-serif';g.fillText('NORTHLINE',256,400);g.font='800 22px Inter,Arial,sans-serif';g.fillText('SUMMIT CO.  ·  YARDLINE',256,440);
    g.restore();}
  const t=new U.CanvasTexture(c);t.anisotropy=8;t.flipY=true;return BIBT[col]=t;}
const TEET={};
function teeTex(col,kind){const key=col+kind;if(TEET[key])return TEET[key];const c=document.createElement('canvas');c.width=1024;c.height=512;const g=c.getContext('2d'),hx='#'+col.toString(16).padStart(6,'0');
  g.textAlign='center';g.textBaseline='middle';
  // front (left half): chest mark
  g.fillStyle=hx;g.font='italic 900 44px Impact,Arial Black,sans-serif';g.fillText('DUB12',300,190);g.font='800 16px Inter,Arial,sans-serif';g.fillText('PARK SERIES',300,224);
  if(kind==='hoodie'){g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=4;g.beginPath();g.moveTo(150,470);g.lineTo(180,360);g.lineTo(332,360);g.lineTo(362,470);g.stroke();
    g.fillStyle='rgba(0,0,0,.12)';g.fill();}
  // back (right half): big print
  g.save();g.translate(768,250);drawEmblem(g,0,-40,.9);g.restore();g.fillStyle=hx;g.font='800 22px Inter,Arial,sans-serif';g.fillText('BUILT ON SNOW · EST. 12',768,420);
  const t=new U.CanvasTexture(c);t.anisotropy=8;return TEET[key]=t;}
// pants decals (race: side panel + vertical DUB12 + sponsor tags; cargo: thigh pocket + tag). u: 0-.5 thigh, .5-1 shin; v: ankle(0)->hip(1)
const PDT={};
function pantsDecoTex(kind,col){const key=kind+col;if(PDT[key])return PDT[key];const c=document.createElement('canvas');c.width=256;c.height=512;const g=c.getContext('2d');
  const lum=((col>>16&255)*.3+(col>>8&255)*.59+(col&255)*.11)/255,ink=lum>.55?'#111':'#f4f4f2',acc='#e3262f';
  // column layout (each 256 wide = once round the leg; x=128 = front, right leg's outside at x<128, left leg's at x>128)
  const patch=(x,y,txt,bg,fg,w)=>{g.save();g.translate(x,y);g.scale(.36,1.6);g.fillStyle=bg;const W=w||64;g.beginPath();g.roundRect?g.roundRect(-W/2,-11,W,22,8):g.rect(-W/2,-11,W,22);g.fill();g.fillStyle=fg;g.font='800 13px Inter,Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,0,1);g.restore();};
  const vtext=(x,y,txt,col,sz)=>{g.save();g.translate(x,y);g.scale(.36,1);g.rotate(-Math.PI/2);g.scale(1.6,1);g.fillStyle=col;g.font='italic 900 '+(sz||26)+'px Impact,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,0,0);g.restore();};
  const lite=lum<.55,pbg=lite?'rgba(255,255,255,.92)':'rgba(15,15,18,.9)',pfg=lite?'#15161a':'#f4f4f2';
  if(kind==='race'){c.width=1024;c.height=512;
    // right thigh: big number on the front-outside, two sponsor patches below
    g.save();g.translate(100,190);g.scale(.36,1.5);g.fillStyle=ink;g.font='900 64px Impact,Arial Black,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('12',0,0);g.restore();
    patch(104,300,'NORTHLINE',pbg,pfg,86);patch(104,350,'SUMMIT',pbg,pfg,70);
    // right shin: tall side print down the outside
    vtext(256+66,256,'DUB12 RACING',ink,30);patch(256+128,120,'YARDLINE',pbg,pfg,80);
    // left thigh: red sponsor tab + patch
    g.save();g.translate(512+150,186);g.scale(.36,1.6);g.fillStyle=acc;g.fillRect(-40,-15,80,30);g.fillStyle='#fff';g.font='900 18px Inter,Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('SILT',0,1);g.restore();
    patch(512+156,300,'OFF/SET',pbg,pfg,74);
    vtext(768+190,256,'NORTHLINE',ink,30);patch(768+128,120,'DUB12',pbg,pfg,60);}
  else if(kind==='cargo'){c.width=1024;c.height=512;
    [[0,70],[512,186]].forEach(([ox,cx])=>{g.fillStyle='rgba(0,0,0,.28)';g.fillRect(ox+cx-36,170,72,110);g.fillStyle='rgba(0,0,0,.42)';g.fillRect(ox+cx-40,164,80,26);
      g.strokeStyle='rgba(255,255,255,.35)';g.setLineDash([5,4]);g.lineWidth=2;g.strokeRect(ox+cx-34,172,68,106);g.setLineDash([]);});
    g.fillStyle=acc;g.fillRect(512+120,320,40,20);g.fillStyle='#fff';g.font='800 13px Inter,sans-serif';g.textAlign='center';g.fillText('DUB12',512+140,335);}
  const t=new U.CanvasTexture(c);t.anisotropy=8;return PDT[key]=t;}
function decoMat(m){const prev=m.onBeforeCompile,u={uDT:{value:null},uDO:{value:0}};m.userData.deco=u;
  m.onBeforeCompile=sh=>{if(prev)prev(sh);sh.uniforms.uDT=u.uDT;sh.uniforms.uDO=u.uDO;
    sh.vertexShader='attribute float aSeg;varying vec3 vDp;varying float vSeg;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvDp=position;vSeg=aSeg;');
    sh.fragmentShader='uniform sampler2D uDT;uniform float uDO;varying vec3 vDp;varying float vSeg;\n'+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nif(uDO>0.5&&vSeg>0.5&&abs(vDp.y)<0.5){float an=atan(-vDp.x,vDp.z);vec4 dc=texture2D(uDT,vec2((an/6.2832+0.5+floor(vSeg-0.5))*0.25,vDp.y+0.5));diffuseColor.rgb=mix(diffuseColor.rgb,dc.rgb,dc.a);}');};
  const pk=m.customProgramCacheKey?m.customProgramCacheKey():'';m.customProgramCacheKey=()=>pk+'deco';return m;}
// "Chrome Flash" livery (original design): chrome-blue and silver diagonal panels, a gloss-yellow side disc,
// a bridge/skyline line drawing and bold red DUB12 lettering. Wraparound map: u = around the head (0.5 = front), v = height.
let LIVERY=null;
function liveryTex(){if(LIVERY)return LIVERY;const c=document.createElement('canvas');c.width=1024;c.height=512;const g=c.getContext('2d');
  const sil=g.createLinearGradient(0,0,0,512);sil.addColorStop(0,'#eef1f5');sil.addColorStop(.6,'#b9c0ca');sil.addColorStop(1,'#8e96a2');g.fillStyle=sil;g.fillRect(0,0,1024,512);
  const blu=g.createLinearGradient(0,0,0,512);blu.addColorStop(0,'#3a7bff');blu.addColorStop(.45,'#0f3fc8');blu.addColorStop(1,'#061c6e');
  g.save();g.translate(512,256);g.rotate(-.5);g.fillStyle=blu;for(let i=-6;i<6;i++)for(let j=-4;j<4;j++)if((i+j)%2===0)g.fillRect(i*150,j*150,150,150);g.restore();   // diagonal checker panels
  g.strokeStyle='rgba(20,30,60,.55)';g.lineWidth=3;for(const cx of [300,770]){g.beginPath();g.arc(cx,300,150,Math.PI,0);g.stroke();for(let k=-6;k<=6;k++){g.beginPath();g.moveTo(cx+k*24,300-Math.sqrt(Math.max(0,150*150-(k*24)**2)));g.lineTo(cx+k*24,330);g.stroke();}
    g.beginPath();g.moveTo(cx-200,330);g.lineTo(cx+200,330);g.stroke();}                                                                                                  // bridge line art
  for(const cx of [256,768]){const yg=g.createRadialGradient(cx-30,250,10,cx,270,95);yg.addColorStop(0,'#fff27a');yg.addColorStop(1,'#f2c200');g.fillStyle=yg;g.beginPath();g.arc(cx,270,92,0,7);g.fill();}   // yellow side discs
  g.font='italic 900 110px Impact,Arial Black,sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';
  g.save();g.translate(512,404);g.scale(1,-1);drawEmblem(g,0,0,.62);g.restore();for(const cx of [0,1024]){g.lineWidth=18;g.strokeStyle='#ffffff';g.strokeText('DUB12',cx,112);g.fillStyle='#e3262f';g.fillText('DUB12',cx,112);}                   // front + back lettering
  LIVERY=new U.CanvasTexture(c);LIVERY.anisotropy=8;LIVERY.wrapS=U.RepeatWrapping;return LIVERY;}

/* ---------- textures ---------- */
const TEXC={};
function patTex(kind,c1,c2){const key=kind+c1+'_'+c2;if(TEXC[key])return TEXC[key];
  const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d'),A1=hex(c1),A2=hex(c2),r=rng(kind.length*31+c1%97);
  g.fillStyle=A1;g.fillRect(0,0,256,256);
  if(kind==='camo'){const cs=[A2,shade(c1,-.35),shade(c2,.25)];for(let k=0;k<70;k++){g.fillStyle=cs[k%3];g.beginPath();const x=r()*256,y=r()*256;g.ellipse(x,y,10+r()*26,6+r()*16,r()*3,0,7);g.fill();g.beginPath();g.ellipse(x-256,y,10,6,0,0,7);g.fill();}}
  else if(kind==='plaid'){g.globalAlpha=.55;g.fillStyle=A2;for(let i=0;i<256;i+=64){g.fillRect(i,0,26,256);g.fillRect(0,i,256,26);}g.globalAlpha=.35;g.fillStyle='#fff';for(let i=40;i<256;i+=64){g.fillRect(i,0,3,256);g.fillRect(0,i,256,3);}}
  else if(kind==='split'){g.fillStyle=A2;g.fillRect(128,0,128,256);}
  else if(kind==='splat'){const cs=[A2,'#ff3df0','#3df0ff','#fff34d'];for(let k=0;k<120;k++){g.fillStyle=cs[(r()*4)|0];g.globalAlpha=.6+r()*.4;g.beginPath();g.arc(r()*256,r()*256,r()*r()*12+1,0,7);g.fill();}}
  else if(kind==='flames'){[hex(c2),'#ffb03f','#ffe27a'].forEach((cc,i)=>{g.fillStyle=cc;g.beginPath();g.moveTo(0,256);for(let x=0;x<=256;x+=8)g.lineTo(x,256-(60+i*-14)-Math.abs(Math.sin(x*.05+i))*(90-i*20));g.lineTo(256,256);g.fill();});}
  else if(kind==='aurora'){g.globalAlpha=.6;['#39ff9e','#3df0ff','#b36bff'].forEach((cc,i)=>{g.strokeStyle=cc;g.lineWidth=22-i*5;g.beginPath();for(let x=0;x<=256;x+=6){const y=120+Math.sin(x*.025+i*1.7)*40-i*20;x?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();});}
  else if(kind==='gold'){const gr=g.createLinearGradient(0,0,256,256);gr.addColorStop(0,'#8a6114');gr.addColorStop(.35,'#ffe08a');gr.addColorStop(.6,'#c8922a');gr.addColorStop(1,'#fff1b8');g.fillStyle=gr;g.fillRect(0,0,256,256);}
  else if(kind==='check'){for(let y=0;y<256;y+=32)for(let x=0;x<256;x+=32)if(((x+y)/32)%2){g.fillStyle=A2;g.fillRect(x,y,32,32);}}
  const t=new U.CanvasTexture(c);t.wrapS=t.wrapT=U.RepeatWrapping;t.anisotropy=4;TEXC[key]=t;return t;}
/* cloth movement: fabric ripples with wind speed */
const CLOTH={t:{value:0},w:{value:0}};
function cloth(m,amp){m.onBeforeCompile=sh=>{sh.uniforms.uT=CLOTH.t;sh.uniforms.uW=CLOTH.w;sh.vertexShader='uniform float uT;uniform float uW;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n float cw=sin(position.y*1.9+uT*17.0+position.x*1.3)*0.6+sin(position.y*3.7-uT*23.0+position.z*2.1)*0.4;\n transformed+=objectNormal*cw*uW*'+(0.16*amp).toFixed(3)+';');};m.customProgramCacheKey=()=>'cloth'+amp;return m;}
/* puffer quilting drawn in the material (geometry stays smooth): soft stitch lines every `period` units along the part,
   each baffle shaded like a rounded tube (light on top, shadow toward the seam). Works on the torso and on stretched limbs
   (uses the object's real length via the model matrix), and stacks with cloth()/band() shaders. */
function quiltMat(m,period){const prev=m.onBeforeCompile;
  m.onBeforeCompile=sh=>{if(prev)prev(sh);
    sh.vertexShader='varying float vQy;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvQy=position.y*length(modelMatrix[1].xyz);');
    sh.fragmentShader='varying float vQy;\n'+sh.fragmentShader
      .replace('#include <color_fragment>','#include <color_fragment>\nfloat qf=fract(vQy/'+period.toFixed(2)+');float qs=smoothstep(0.0,0.16,qf)*smoothstep(1.0,0.84,qf);diffuseColor.rgb*=0.72+0.28*qs;')
      .replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\n{float qa=fract(vQy/'+period.toFixed(2)+')*6.2832;normal=normalize(normal+vec3(0.0,cos(qa)*0.42,0.0));}');};
  const pk=m.customProgramCacheKey?m.customProgramCacheKey():'';m.customProgramCacheKey=()=>pk+'quilt'+period;return m;}
/* stripe band painted on a mesh between two local-space heights (arms and shoulders carry the chest stripe) */
function band(m,lo,hi,key){const prev=m.onBeforeCompile,su={value:new U.Color(0x3a3d44)};m.userData.stripeU=su;
  m.onBeforeCompile=sh=>{if(prev)prev(sh);sh.uniforms.uStripe=su;
    sh.vertexShader='varying float vLy;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvLy=position.y;');
    sh.fragmentShader='varying float vLy;uniform vec3 uStripe;\n'+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nif(vLy>'+lo.toFixed(3)+'&&vLy<'+hi.toFixed(3)+')diffuseColor.rgb=uStripe;');};
  const pk=m.customProgramCacheKey?m.customProgramCacheKey():'';m.customProgramCacheKey=()=>pk+'band'+key;return m;}
/* printed goggle strap: DUB12 + chevrons, twice around */
let STRAPT=null;function strapTex(){if(STRAPT)return STRAPT;const c=document.createElement('canvas');c.width=1024;c.height=64;const g=c.getContext('2d');
  g.fillStyle='#f4f4f2';g.fillRect(0,0,1024,64);g.fillStyle='#141416';g.font='40px Bungee,Impact,sans-serif';g.textBaseline='middle';
  // text sits on each side of the helmet (never across the back); the strap's u runs right side -> back -> left side
  [[190,true],[834,false]].forEach(([x,flip])=>{g.save();g.translate(x,32);if(flip)g.scale(-1,1);g.textAlign='center';g.fillText('DUB12',0,3);
    g.font='bold 22px Inter,sans-serif';g.fillText('>>>',120,1);g.restore();g.font='40px Bungee,Impact,sans-serif';});
  STRAPT=new U.CanvasTexture(c);STRAPT.anisotropy=8;return STRAPT;}
let FAB=null;function fabricTex(){if(FAB)return FAB;const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d'),r=rng(77);g.fillStyle='#808080';g.fillRect(0,0,256,256);
  for(let i=0;i<9000;i++){const v=100+r()*60|0;g.fillStyle='rgb('+v+','+v+','+v+')';g.fillRect(r()*256,r()*256,1+r()*2,1);}
  for(let y=0;y<256;y+=4){g.fillStyle='rgba(0,0,0,.06)';g.fillRect(0,y,256,1);}
  FAB=new U.CanvasTexture(c);FAB.wrapS=FAB.wrapT=U.RepeatWrapping;return FAB;}
function shade(c,k){const C=new U.Color(c);if(k<0)C.multiplyScalar(1+k);else C.lerp(new U.Color(1,1,1),k);return C.getHex();}
// ski top sheets (64x512 portrait, tip at top)
const SKITEX={},SKICV={};
function skiCanvas(id){if(SKICV[id])return SKICV[id];const c=document.createElement('canvas');c.width=128;c.height=1024;SKICV[id]=c;drawSki(id);return c;}
function drawSki(id){const c=SKICV[id],g=c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,128,1024);
  if(id.startsWith('custom')){const d=save.custom[+id.slice(6)];if(d&&d.img){const im=d.img;g.save();g.translate(0,1024);g.rotate(-Math.PI/2);g.drawImage(im,0,0,1024,128);g.restore();}else{g.fillStyle='#e8ebf2';g.fillRect(0,0,128,1024);skiText(g,128,1024,'DESIGN ME','#9aa7c2',512,40);}}
  else{g.scale(2,2);SKI_ART[IDX[id].art](g,64,512);}
  if(SKITEX[id])SKITEX[id].needsUpdate=true;}
function skiTex(id){if(!SKITEX[id]){const t=new U.CanvasTexture(skiCanvas(id));t.anisotropy=8;SKITEX[id]=t;}return SKITEX[id];}
function redrawAllSkis(){for(const id in SKICV)drawSki(id);}

/* ---------- IK helpers ---------- */
const UPV=new U.Vector3(0,1,0),_d=new U.Vector3(),_h=new U.Vector3();
function limb(m,a,b){_d.subVectors(b,a);const L=_d.length()||1;m.position.addVectors(a,b).multiplyScalar(.5);m.scale.y=L;m.quaternion.setFromUnitVectors(UPV,_d.divideScalar(L));}
function ik(out,A_,B_,l1,l2,hint){_d.subVectors(B_,A_);let d=_d.length()||1;_d.divideScalar(d);const mx=l1+l2-.05;if(d>mx){d=mx;B_.copy(A_).addScaledVector(_d,d);}
  const a=(l1*l1-l2*l2+d*d)/(2*d),h=Math.sqrt(Math.max(0,l1*l1-a*a));_h.copy(hint).addScaledVector(_d,-hint.dot(_d)).normalize();out.copy(A_).addScaledVector(_d,a).addScaledVector(_h,h);}

/* ---------- grab poses ---------- */
const GRABPOSE={
 Mute:{c:.9,lean:1.0,sy:.42,hr:[4,-14,11],hl:[16,10,-2]},
 Safety:{c:1,lean:.95,tk:4,lX:-.3,hl:[9.5,-15,3],hr:[-16,11,-2]},
 Japan:{c:.55,lean:.35,lX:.85,tw:.45,hl:[5,-12,-10],hr:[-15,11,4]},
 Tail:{c:.85,lean:.7,lX:-.45,hl:[16,9,0],hr:[-6,-15,-12]},
 Critical:{c:.9,lean:.95,sy:-.3,hl:[-3,-15,12],hr:[-16,10,-2]},
 Blunt:{c:.8,lean:.55,lX:-.7,tw:-.3,hl:[15,10,2],hr:[-5,-13,-16]},
 'Truck Driver':{c:1,lean:1.05,lX:-.35,tk:3,hl:[7,-13,13],hr:[-7,-13,13]},
 Octograb:{c:.95,lean:.9,sy:.7,lX:.3,hl:[-4,-14,8],hr:[4,-14,8]}
};
/* ---------- clothing fit ----------
   The original jacket hem tapered inward (6.8 wide) right where the pants hips are widest (7.4-7.8),
   so the waistband bulged out under the jacket. Reshape once: drop the hem ~1.6 and flare it so it
   overlaps the waistband, and tuck the top of the pants inside the jacket. */
const ss=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
function fitClothes(){if(fitClothes.done)return;fitClothes.done=true;
  const edit=(obj,fn)=>obj.traverse(m=>{if(!m.isMesh)return;const p=m.geometry.attributes.position;for(let i=0;i<p.count;i++){const r=fn(p.getX(i),p.getY(i),p.getZ(i));p.setXYZ(i,r[0],r[1],r[2]);}p.needsUpdate=true;m.geometry.computeVertexNormals();m.geometry.computeBoundingSphere();});
  edit(A.torso,(x,y,z)=>{const k=ss(0,-3,y),f=1+.17*k;return [x*f,y-2.4*k,z*f];});
  edit(A.hips,(x,y,z)=>{const k=ss(-4.5,-1.5,y),f=(1-.1*k)*.94;return [x*f,y-.5*k,z*f];});
  // thigh is a unit-length limb (y=+.5 at the hip): taper the hip end so it stays inside the jacket
  edit(A.thigh,(x,y,z)=>{const f=1-.2*ss(-.1,.5,y);return [x*f,y,z*f];});
  // puffer quilting: push each surface out along its normal in rounded bands (baffles) with stitched seams between them.
  // Torso: horizontal baffles below the collar; sleeves (unit-length limbs): rings along the arm; hood: bands over the crown.
  const quilt=(obj,axisVal,period,amp,mask)=>obj&&obj.traverse(m=>{if(!m.isMesh)return;const g=m.geometry;if(!g.attributes.normal)g.computeVertexNormals();
    const P=g.attributes.position,N=g.attributes.normal;for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i);if(mask&&!mask(x,y,z))continue;
      const ph=axisVal(x,y,z)/period,b=Math.pow(.5-.5*Math.cos(ph*Math.PI*2),.7);P.setXYZ(i,x+N.getX(i)*amp*b,y+N.getY(i)*amp*b*.4,z+N.getZ(i)*amp*b);}
    P.needsUpdate=true;g.computeVertexNormals();g.computeBoundingSphere();});
  // (geometric quilting removed: it made the low-poly parts look blocky; quiltMat() draws the baffles in the material instead)
  // fitted pants: flare the bottom of each leg (limb y=-.5 is the ankle end) so the hem sits over the boot cuff like real ski pants
  ['gp_shin_P','gp_shin_N'].forEach(n=>{if(A[n])edit(A[n],(x,y,z)=>{const f=1+.28*ss(-.2,-.5,y);return [x*f,y,z*f];});});
  // glove cuffs tuck cleanly inside the sleeve: narrow and shorten everything above the wrist so it never pokes through the jacket
  if(A.glove)edit(A.glove,(x,y,z)=>{const k=ss(.6,2.2,y),f=1-.3*k;return [x*f,y>2.2?2.2+(y-2.2)*.5:y,z*f];});
  // park helmet: lower edge hugs the face/jaw instead of flaring out
  if(A.helmet_park2)edit(A.helmet_park2,(x,y,z)=>{const k=ss(1.5,-8.5,y),f=1-.13*k;return [x*f,y,(z+.6)*f-.6];});
  if(A.torso_v2)edit(A.torso_v2,(x,y,z)=>y<-2.6?[x,-2.6+(y+2.6)*.18,z]:[x,y,z]);
  // rounded ski tips/tails: reshape the outline near each end into a half-circle instead of a point
  ['ski'].forEach(n=>{if(!A[n])return;A[n].traverse(m=>{if(!m.isMesh)return;const P=m.geometry.attributes.position;m.geometry.computeBoundingBox();const bb=m.geometry.boundingBox,zc=(bb.max.z+bb.min.z)/2,half=(bb.max.z-bb.min.z)/2;
    const NB=60,hw=new Float32Array(NB),bi=z=>Math.min(NB-1,Math.max(0,Math.floor((z-bb.min.z)/(2*half)*NB)));for(let i=0;i<P.count;i++){const k=bi(P.getZ(i));hw[k]=Math.max(hw[k],Math.abs(P.getX(i)));}
    const W=hw[Math.floor(NB*.2)]||hw[Math.floor(NB/2)],R=W*1.6;
    for(let i=0;i<P.count;i++){const z=P.getZ(i),t=(Math.abs(z-zc)-(half-R))/R;if(t<=0)continue;const cur=hw[bi(z)]||1e-3,tgt=W*Math.sqrt(Math.max(0,1-t*t))*.98+W*.02;P.setX(i,P.getX(i)/cur*Math.max(cur,tgt));}
    P.needsUpdate=true;m.geometry.computeVertexNormals();});});
  // boot cuffs sit inside the slim pant leg: shrink the upper cuff, keep the lower shell full size so the boot shows
  ['free','race','retro'].forEach(s=>{if(A['boot_'+s])edit(A['boot_'+s],(x,y,z)=>{const k=ss(3.4,5.6,y),f=1-.38*k;return [x*f,y,(z+.2)*f-.2];});});}
/* ---------- rider ---------- */
function makeRider(){
  fitClothes();
  const std=(c,o)=>new U.MeshStandardMaterial(Object.assign({color:c,roughness:.85,vertexColors:true},o||{}));
  // physically based upgrades: lacquered helmet shells and ski tops, soft sheen on fabric
  const phys=(c,o)=>new U.MeshPhysicalMaterial(Object.assign({color:c,roughness:.85,vertexColors:true},o||{}));
  const fab=(c,o)=>phys(c,Object.assign({sheen:new U.Color(0x6a6a6a),roughness:.82},o||{}));
  const M={skin:std(0xe0aa84,{roughness:.62,envMapIntensity:.3}),lip:std(0xb06a5a,{roughness:.42}),mask:std(0x16161a,{roughness:.95,bumpMap:fabricTex(),bumpScale:.4}),eye_white:std(0xf4f0ea,{roughness:.25}),iris:std(0x5a3a22,{roughness:.2}),pupil:std(0x080808,{roughness:.1}),
    hair:std(0x3b2416,{roughness:.75}),helmet:phys(0x222222,{roughness:.32,clearcoat:1,clearcoatRoughness:.06,envMapIntensity:1,side:U.DoubleSide}),helmet_acc:std(0xffffff,{roughness:.3,side:U.DoubleSide}),helmet_dark:std(0x15161a,{roughness:.8,side:U.DoubleSide,bumpMap:fabricTex(),bumpScale:.25}),
    strap:std(0x111111,{roughness:.9,side:U.DoubleSide}),hstrap:std(0x15161a,{roughness:.85,side:U.DoubleSide}),frame:std(0x111111,{roughness:.45}),lens:std(0xff7a1a,{roughness:.04,metalness:1,envMapIntensity:1.6}),
    jacket:cloth(fab(0xff4d3d,{bumpMap:fabricTex(),bumpScale:.35}),1),stripe:cloth(fab(0x3a3d44,{bumpMap:fabricTex(),bumpScale:.35}),1),
    zip:std(0x0c0c0e,{roughness:.4,metalness:.3}),logo:std(0xf2f2f2,{roughness:.5}),
    jacket_arm:band(cloth(fab(0xff4d3d,{bumpMap:fabricTex(),bumpScale:.35}),1),.03,.41,'arm'),jacket_sh:band(fab(0xff4d3d,{bumpMap:fabricTex(),bumpScale:.35}),-9,-.85,'sh'),hood:cloth(fab(0xff4d3d,{side:U.DoubleSide,bumpMap:fabricTex(),bumpScale:.35}),1.3),accent:std(0xffd23f),trim:std(0x1c1f2b),gaiter:std(0x22252e,{roughness:.95}),pants:cloth(fab(0x1b2247,{roughness:.9,bumpMap:fabricTex(),bumpScale:.35}),.8),
    glove:std(0x17181d,{roughness:.7}),glove_acc:std(0x2c2e36,{roughness:.8}),boot_shell:phys(0x24262e,{roughness:.3,clearcoat:.6,clearcoatRoughness:.15,envMapIntensity:.6}),boot_cuff:std(0x3a3d48,{roughness:.35}),
    metal:std(0xcfd6e4,{metalness:.85,roughness:.25}),pole:std(0xcfd6e4,{metalness:.7,roughness:.28}),sole:std(0x15161a,{roughness:.8}),ski_top:phys(0xffffff,{roughness:.35,clearcoat:.8,clearcoatRoughness:.12,envMapIntensity:.5}),
    ski_base:std(0x111111,{roughness:.4}),ski_edge:std(0x1a1a1e,{roughness:.4,metalness:.4}),bind:std(0x1b1d24,{roughness:.35}),grip:std(0x15161a,{roughness:.7})};
  quiltMat(M.jacket,8);quiltMat(M.jacket_arm,6.5);quiltMat(M.jacket_sh,6.5);quiltMat(M.hood,6);decoMat(M.pants);   // puffer baffles, smooth geometry
  const remap={};
  function dress(o,over){o.traverse(c=>{if(!c.isMesh)return;const n=mname(c.material);c.material=M[(over&&over[n])||n]||M.trim;});return o;}
  const root=new U.Group(),flipG=new U.Group(),body=new U.Group();root.add(flipG);flipG.add(body);flipG.position.y=22;body.position.y=-22;
  const lower=new U.Group();lower.position.y=20;body.add(lower);const lw=new U.Group();lw.position.y=-20;lower.add(lw);
  const add=(o,par,x,y,z)=>{if(x!==undefined)o.position.set(x,y,z);par.add(o);return o;};
  const jsph=(r,mat)=>{const m=new U.Mesh(whiteCols(new U.SphereGeometry(r,20,14)),mat);m.castShadow=true;return m;};
  // gear pack (tools/export_gear.py): the user's puffer jacket with hood + pants, cut into rider parts, realistic proportions
  // the cut-up imported jacket tore at the joints in motion; the rig-native puffer (quilted in fitClothes) is used instead.
  // Set USE_GEAR_PACK=true to bring the imported jacket/pants back.
  const USE_GEAR_PACK=false;
  const GEAR=USE_GEAR_PACK&&['gj_torso','gj_zip','gj_hood_up','gj_hood_down','gp_hips','gear_meta'].concat(...['P','N'].map(s=>['gj_uarm_'+s,'gj_farm_'+s,'gp_thigh_'+s,'gp_shin_'+s])).every(n=>A[n]),GM=GEAR&&A.gear_meta?A.gear_meta.userData:{};
  const skiOnly=[],skiG=[],boots=[],thigh=[],shin=[],knee=[],uarm=[],farm=[],elb=[],hand=[],pole=[],shoulder=[];
  [1,-1].forEach(sd=>{
    const sg=new U.Group();sg.position.set(sd*5.0,0,0);lw.add(sg);
    const so=add(new U.Group(),sg);add(dress(part('ski')),so);add(dress(part('binding')),so);skiOnly.push(so);
    const bt={};['free','race','retro'].forEach(s=>{bt[s]=add(dress(part('boot_'+s),{strap:'sole'}),sg);});boots.push(bt);
    const gs=sd>0?'P':'N';   // your fitted pants (gear pack) replace the built-in legs when present
    skiG.push(sg);thigh.push(add(dress(part(GEAR?'gp_thigh_'+gs:'thigh')),body));shin.push(add(dress(part(GEAR?'gp_shin_'+gs:'shin')),body));const k=jsph(4.25,M.pants);knee.push(add(k,body));});
  // snowboard: lies across the stance (along the lower-body x axis); top graphic = your ski design, black base, steel edges, two strap bindings
  const boardG=new U.Group();lw.add(boardG);boardG.visible=false;
  {const Lh=32,Wh=6.6,sh=new U.Shape();sh.moveTo(-Lh+6,-Wh);sh.lineTo(Lh-6,-Wh);sh.quadraticCurveTo(Lh+.5,-Wh,Lh,0);sh.quadraticCurveTo(Lh+.5,Wh,Lh-6,Wh);
    sh.lineTo(-Lh+6,Wh);sh.quadraticCurveTo(-Lh-.5,Wh,-Lh,0);sh.quadraticCurveTo(-Lh-.5,-Wh,-Lh+6,-Wh);
    const bend=g=>{const P=g.attributes.position;for(let i=0;i<P.count;i++){const x=P.getX(i),ax=Math.abs(x);let y=P.getY(i);if(ax>23)y+=Math.pow((ax-23)/9,2)*3.4;
      const z=P.getZ(i);P.setY(i,y+.25*Math.cos(x/Lh*1.57)*0);P.setZ(i,z*(1-.07*Math.cos(x/Lh*1.57)));}P.needsUpdate=true;g.computeVertexNormals();return g;};   // rocker tips + sidecut waist
    const core=new U.ExtrudeGeometry(sh,{depth:.9,bevelEnabled:true,bevelThickness:.15,bevelSize:.18,bevelSegments:1,curveSegments:10,steps:1});core.rotateX(Math.PI/2);core.translate(0,1.05,0);
    const topG=new U.ShapeGeometry(sh,10);topG.rotateX(-Math.PI/2);topG.translate(0,1.22,0);
    {const P=topG.attributes.position,UV=topG.attributes.uv;for(let i=0;i<P.count;i++)UV.setXY(i,(P.getZ(i)+Wh)/(2*Wh),(P.getX(i)+Lh)/(2*Lh));}
    whiteCols(core);whiteCols(topG);
    const cm=new U.Mesh(bend(core),M.ski_base),tm_=new U.Mesh(bend(topG),M.ski_top);boardG.add(cm,tm_);
    [-1,1].forEach(sd=>{const bg=new U.Group();bg.position.set(sd*9.5,0,0);bg.rotation.y=sd>0?.26:-.1;boardG.add(bg);   // binding turns with the boot angle
      const b=new U.Mesh(whiteCols(new U.BoxGeometry(6.4,.9,11.5)),M.grip);b.position.set(0,1.65,0);bg.add(b);
      const hb=new U.Mesh(whiteCols(new U.BoxGeometry(6.6,7.5,.9)),M.grip);hb.position.set(0,5.4,-4.9);hb.rotation.x=-.18;bg.add(hb);
      [[-1.2,5.6,2.6],[3.4,3.4,2.0]].forEach(([dz,y,w])=>{const st=new U.Mesh(whiteCols(new U.BoxGeometry(6.9,1.1,w)),M.bind);st.position.set(0,y,dz);bg.add(st);});});
    boardG.traverse(o=>{if(o.isMesh){o.castShadow=true;}});}
  const segAttr=(o,v)=>o.traverse(c=>{if(c.isMesh){c.geometry=c.geometry.clone();const n=c.geometry.attributes.position.count;c.geometry.setAttribute('aSeg',new U.BufferAttribute(new Float32Array(n).fill(v),1));}});thigh.forEach((o,i)=>segAttr(o,1+2*i));shin.forEach((o,i)=>segAttr(o,2+2*i));
  shin.forEach(o=>o.traverse(c=>{if(!c.isMesh)return;c.userData.g0=c.geometry;const t=c.geometry.clone(),P=t.attributes.position;for(let i=0;i<P.count;i++){const y=P.getY(i),f=1+.42*ss(.15,-.5,y);P.setXYZ(i,P.getX(i)*f,y,P.getZ(i)*f);}P.needsUpdate=true;t.computeVertexNormals();c.userData.gFl=t;}));
  let ride='ski';
  const upper=new U.Group();body.add(upper);
  const torsoG=new U.Group();upper.add(torsoG);
  // v2 jacket: puffer with funnel collar, chest stripe, zipper, chest patch and a hood lying on the back
  const V2=!!A.torso_v2;let hoodDown;
  let gHips=null;
  if(GEAR){add(dress(part('gj_torso')),torsoG);add(dress(part('gj_zip')),torsoG);hoodDown=add(dress(part('gj_hood_down')),torsoG);hoodDown.userData.gear=1;gHips=add(dress(part('gp_hips')),upper);}
  else if(V2){add(dress(part('torso_v2')),torsoG);hoodDown=add(dress(part('hood_down_v2')),torsoG);}
  else{add(dress(part('torso')),torsoG);hoodDown=add(dress(part('hood_down')),torsoG);add(dress(part('gaiter')),upper);}
  if(!GEAR)add(dress(part('hips')),torsoG);
  const SH=[new U.Vector3(8.35,13.3,0),new U.Vector3(-8.35,13.3,0)];
  [0,1].forEach(i=>{const gs=i?'N':'P';shoulder.push(add(jsph(2.8,V2?M.jacket_sh:M.jacket),upper));uarm.push(add(dress(part(GEAR?'gj_uarm_'+gs:'uarm'),V2&&!GEAR?{jacket:'jacket_arm'}:null),upper));farm.push(add(dress(part(GEAR?'gj_farm_'+gs:'farm')),upper));elb.push(add(jsph(2.4,M.jacket),upper));
    if(GEAR){shoulder[i].material=M.jacket;elb[i].material=M.jacket;}   // padded caps hide the shoulder/elbow seams in every pose
    const hg=add(new U.Group(),upper);add(dress(part('glove')),hg);hand.push(hg);pole.push(add(dress(part('pole'),{metal:'pole'}),upper));});
  const head=new U.Group();head.position.set(0,V2?22.2:22.6,.9);if(V2){head.scale.setScalar(.84);M.strap.map=strapTex();M.strap.side=U.DoubleSide;M.frame.side=U.DoubleSide;M.lens.side=U.DoubleSide;}upper.add(head);
  // sculpted Blender head (skull, sockets, nose, lips, eyeballs, lids, brows, ears in one piece); falls back to the original parts
  let brows,ears;
  if(A.head_hq){add(dress(part('head_hq')),head);brows=new U.Group();ears=new U.Group();[M.skin,M.lip,M.eye_white,M.iris,M.pupil,M.hair].forEach(m=>m.side=U.DoubleSide);M.hair.roughness=.55;}
  else{add(dress(part('head')),head);add(dress(part('eyes')),head);brows=add(dress(part('brows')),head);['nose','lips','lids'].forEach(n=>add(dress(part(n)),head));ears=add(dress(part('ears')),head);}
  const masks={};['clava','gaiter','bandana'].forEach(m=>{masks[m]=add(dress(part('mask_'+m)),head);});
  // neck warmer: the face mask pulled down, bunched round the neck under the chin
  masks.neck=add(dress(part('mask_gaiter')),head);masks.neck.position.set(0,-3.6,-.3);masks.neck.scale.set(1.1,.62,1.12);
  // wired earbuds: buds in both ears, cables down under the chin to a Y-split, then down the chest
  const buds=new U.Group();head.add(buds);M.bud=std(0xf2f2f2,{roughness:.35});
  {const tube=(pts,r)=>new U.Mesh(whiteCols(new U.TubeGeometry(new U.CatmullRomCurve3(pts.map(p=>new U.Vector3(...p))),24,r,5,false)),M.bud);
    [1,-1].forEach(sd=>{const b=new U.Mesh(whiteCols(new U.SphereGeometry(.75,12,8)),M.bud);b.position.set(sd*4.55,-.2,.4);buds.add(b);
      buds.add(tube([[sd*4.6,-.6,.5],[sd*4.3,-3.5,1.2],[sd*2.6,-7.2,2.4],[sd*.5,-9.4,3.2]],.13));});}
  const budWire=new U.Mesh(whiteCols(new U.TubeGeometry(new U.CatmullRomCurve3([[0,14.6,3.6],[.6,12.5,6.1],[1.8,9,6.9],[2.6,5.5,7.0]].map(p=>new U.Vector3(...p))),20,.13,5,false)),M.bud);upper.add(budWire);const tops={};['crop','flow','pony','braids','curls','buzz'].forEach(t=>{tops[t]=add(dress(part('top_'+t)),head);});
  // hood rides on the torso (not the head) so it stays joined to the jacket when the head turns
  const HV2=V2&&!!A.hood_up_v2,hoodUp=add(dress(part(GEAR?'gj_hood_up':HV2?'hood_up_v2':'hood_up'),{hood:'jacket'}),upper);if(!HV2&&!GEAR){hoodUp.position.copy(head.position);if(V2)hoodUp.scale.setScalar(.84);}if(HV2){hoodUp.scale.set(1.16,1.12,1.14);hoodUp.position.y-=1.4;}   // roomier hood that fits over the helmet
  if(GEAR){head.position.set(0,GM.head_y,GM.head_z);head.scale.setScalar(GM.head_s);M.jacket.side=M.pants.side=U.DoubleSide;}   // cut seams never show through   // realistic head size/height to match the fitted jacket
  const hairs={};['crop','flow','pony','braids','curls','buzz'].forEach(s=>{if(A['hair_'+s])hairs[s]=add(dress(part('hair_'+s)),head);});
  const helmets={};['shell','pro','bucket','beanie'].forEach(s=>{helmets[s]=add(dress(part('helmet_'+s),{strap:'hstrap'}),head);});
  if(A.helmet_park2){M.helmet_liv=new U.MeshPhysicalMaterial({color:0xffffff,roughness:.6,metalness:0,vertexColors:true,clearcoat:.4,clearcoatRoughness:.2,envMapIntensity:1.2});
    // no chin straps/buckles, sits higher on the head and less bulky (slimmer sides)
    const hp=part('helmet_park2');hp.traverse(c=>{if(c.isMesh&&(/strap|buckle|chin/i.test(c.name)||mname(c.material)==='strap'))c.visible=false;});
    hp.position.y+=.45;hp.scale.multiply(new U.Vector3(.98,.98,.98));helmets.park2=add(new U.Group(),head);helmets.park2.add(dress(hp,{strap:'hstrap'}));}
  // soft ear covers under the lower edge of the hard helmets (like real park lids), fabric with a stitched rim
  {const bx=new U.Box3();['shell','pro','park2'].forEach(k=>{const h=helmets[k];if(!h)return;h.updateMatrixWorld(true);head.updateMatrixWorld(true);bx.makeEmpty();
    const inv=new U.Matrix4().copy(head.matrixWorld).invert();h.traverse(c=>{if(c.isMesh&&c.visible){c.geometry.computeBoundingBox();bx.union(c.geometry.boundingBox.clone().applyMatrix4(new U.Matrix4().multiplyMatrices(inv,c.matrixWorld)));}});
    if(bx.isEmpty())return;const W=(bx.max.x-bx.min.x)/2,cz=(bx.max.z+bx.min.z)/2,H=bx.max.y-bx.min.y;
    [1,-1].forEach(sd=>{const pad=jsph(1,M.helmet_dark);pad.scale.set(W*.12,H*.2,W*.24);pad.position.set(sd*W*.88,bx.min.y+H*.08,cz-W*.2);h.add(pad);
      const rim=new U.Mesh(new U.TorusGeometry(1,.09,6,20),M.hstrap);rim.scale.set(W*.24,H*.2,1);rim.rotation.y=Math.PI/2;rim.position.set(sd*W*.95,bx.min.y+H*.08,cz-W*.2);h.add(rim);});});}
  // race bib: a vest drawn over the torso (shirt shows at the sides/arms). Planar UVs: left half of the texture = front, right half = back
  let bibMesh=null;
  {let big=null;torsoG.children[0].traverse(c=>{if(c.isMesh&&(!big||c.geometry.attributes.position.count>big.geometry.attributes.position.count))big=c;});
    if(big){const g=big.geometry.clone();g.computeBoundingBox();const bb=g.boundingBox,P=g.attributes.position,uv=new Float32Array(P.count*2);
      for(let i=0;i<P.count;i++){const x=(P.getX(i)-bb.min.x)/(bb.max.x-bb.min.x),y=(P.getY(i)-bb.min.y)/(bb.max.y-bb.min.y),z=P.getZ(i);uv[i*2]=z>=0?x*.5:1-x*.5;uv[i*2+1]=y;}
      g.setAttribute('uv',new U.BufferAttribute(uv,2));M.bib=new U.MeshStandardMaterial({color:0xffffff,roughness:.75,transparent:false,alphaTest:.5,side:U.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2});
      bibMesh=new U.Mesh(g,M.bib);bibMesh.position.copy(big.position);bibMesh.quaternion.copy(big.quaternion);bibMesh.scale.copy(big.scale).multiplyScalar(1.04);bibMesh.castShadow=true;bibMesh.visible=false;big.parent.add(bibMesh);}}
  const gpiv=new U.Group();gpiv.position.set(0,.9,0);head.add(gpiv);const gogs={};
  ['frame','rimless'].forEach(s=>{const g=new U.Group();g.position.y=-.9;['frame','lens','strap'].forEach(p=>g.add(dress(part('gog_'+s+'_'+p))));gpiv.add(g);gogs[s]=g;});
  // park goggles (round style): thick rounded frame with a nose notch, wide cylindrical lens, bent round the face
  {const g=new U.Group(),cy=-.85,R=5.9,cz=.05;
    const outline=(w,h,r,nw,nd)=>{const s_=new U.Shape(),x=w/2,y=h/2;s_.moveTo(-x+r,y);s_.lineTo(x-r,y);s_.quadraticCurveTo(x,y,x,y-r);s_.lineTo(x,-y+r*1.3);s_.quadraticCurveTo(x,-y,x-r*1.3,-y);
      s_.lineTo(nw/2,-y);s_.bezierCurveTo(nw*.32,-y,nw*.2,-y+nd,0,-y+nd);s_.bezierCurveTo(-nw*.2,-y+nd,-nw*.32,-y,-nw/2,-y);s_.lineTo(-x+r*1.3,-y);s_.quadraticCurveTo(-x,-y,-x,-y+r*1.3);s_.lineTo(-x,y-r);s_.quadraticCurveTo(-x,y,-x+r,y);
      return new U.Shape(s_.getSpacedPoints(220));};
    const W=10.4,H=3.9,T=.48,outer=outline(W,H,1.7,3.0,1.25),inner=outline(W-2*T,H-2*T,1.2,2.2,1.0);outer.holes.push(new U.Path(inner.getPoints()));
    const bend=(geo,off)=>{const P=geo.attributes.position;for(let i=0;i<P.count;i++){const x=P.getX(i),z=P.getZ(i)+off,a=x/R;P.setXYZ(i,(R+z)*Math.sin(a),P.getY(i),(R+z)*Math.cos(a)-R+R);}P.needsUpdate=true;geo.computeVertexNormals();return geo;};
    const fg=new U.ExtrudeGeometry(outer,{depth:.5,bevelEnabled:true,bevelThickness:.18,bevelSize:.16,bevelSegments:3,curveSegments:8});
    const frame=new U.Mesh(whiteCols(bend(fg,-.3)),M.frame);
    // lens: finely divided plane bent on the same cylinder, cut to the inner outline by an alpha mask
    const lc=document.createElement('canvas');lc.width=512;lc.height=256;{const q=lc.getContext('2d'),sx=512/(W-2*T+.5),sy=256/(H-2*T+.5);q.fillStyle='#000';q.fillRect(0,0,512,256);q.fillStyle='#fff';q.beginPath();
      inner.getPoints(80).forEach((p_,k)=>{const X=256+p_.x*sx,Y=128-p_.y*sy;k?q.lineTo(X,Y):q.moveTo(X,Y);});q.closePath();q.fill();}
    M.lensR=new U.MeshStandardMaterial({color:0xffffff,roughness:.04,metalness:1,envMapIntensity:1.6,alphaMap:new U.CanvasTexture(lc),alphaTest:.5,side:U.DoubleSide});
    const lens=new U.Mesh(whiteCols(bend(new U.PlaneGeometry(W-2*T+.5,H-2*T+.5,48,6),.12)),M.lensR);
    [frame,lens].forEach(m=>{m.position.set(0,cy,cz);g.add(m);});
    const st=dress(part('gog_frame_strap'));st.position.y=-.9;g.add(st);g.userData.strap=st;gpiv.add(g);gogs.round=g;}
  root.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  // base layer for the race bib: fitted waffle-knit shirt replaces the puffer materials on torso/arms
  M.shirt=fab(0xffffff,{roughness:.9,bumpMap:waffleTex(),bumpScale:1.1});M.shirt_arm=cloth(fab(0xffffff,{roughness:.9,bumpMap:waffleTex(),bumpScale:1.1}),1);
  // cotton for hoodies and tees (soft, matte, no quilting)
  M.cotton=fab(0xffffff,{roughness:.96,bumpMap:fabricTex(),bumpScale:.5});M.cotton_arm=cloth(fab(0xffffff,{roughness:.96,bumpMap:fabricTex(),bumpScale:.5}),1);
  const shirtables=[];[torsoG,...uarm,...farm,...shoulder,...elb].forEach(o=>{const fa=farm.includes(o);o.traverse(c=>{if(c.isMesh&&c!==bibMesh&&(c.material===M.jacket||c.material===M.jacket_arm||c.material===M.jacket_sh)){c.userData.m0=c.material;c.userData.fa=fa;shirtables.push(c);}});});
  // top type: puffer (default) | waffle (base layer under the bib) | cotton (hoodie / long-sleeve tee) | tee (short sleeves: bare forearms)
  // tees/hoodies/base layer get a low crew neck instead of the puffer's tall funnel collar
  shirtables.forEach(c=>{if(c.userData.fa||c.userData.m0!==M.jacket)return;const g=c.geometry;g.computeBoundingBox();if(g.boundingBox.max.y<18)return;c.userData.g0=g;const t=g.clone(),P=t.attributes.position;
    for(let i=0;i<P.count;i++){const y=P.getY(i);if(y>14.6){const k=ss(14.6,20.5,y);P.setXYZ(i,P.getX(i)*(1-.32*k),14.6+(y-14.6)*.3,P.getZ(i)*(1-.32*k));}}P.needsUpdate=true;t.computeVertexNormals();c.userData.gTop=t;});
  let shirtMode='puffer';function swapShirt(mode){if(mode===shirtMode)return;shirtMode=mode;shirtables.forEach(c=>{const arm=c.userData.m0===M.jacket_arm;if(c.userData.gTop)c.geometry=mode==='puffer'?c.userData.g0:c.userData.gTop;
    c.material=mode==='puffer'?c.userData.m0:mode==='tee'&&c.userData.fa?M.skin:mode==='waffle'?(arm?M.shirt_arm:M.shirt):(arm?M.cotton_arm:M.cotton);});}
  const s={c:0,lean:.1,tw:0,lX:0,tk:0,sy:0,ss:0,hl:new U.Vector3(9.5,-3,3),hr:new U.Vector3(-9.5,-3,3),pd:new U.Vector3(.12,-.95,-.25),gu:0,look:0};
  const tA=new U.Vector3(),tB=new U.Vector3(),tE=new U.Vector3(),tH=new U.Vector3();
  let poleK=1,gloveK=1;
  let bs=1,legX=3.9,hem=1.6,helmetStyle='shell',gogBase=1;
  let poleOn=true;
  const R={root,flipG,M,head,hs:1,headS:GEAR?GM.head_s:V2?.84:1,hasGear:GEAR,
    // first-person camera sits where the head is: hide head, collar/torso and hood so they don't block the view
    firstPerson(on){head.visible=!on;torsoG.visible=!on;hoodUp.visible=!on&&!!R.hoodOn;},gearObjs:()=>ride==='board'?[]:skiOnly.concat(pole),setPoles(v){poleOn=!!v;pole.forEach(o=>o.visible=poleOn&&ride!=='board');},
    gear(on){skiOnly.forEach(o=>o.visible=on&&ride!=='board');pole.forEach(o=>o.visible=on&&poleOn&&ride!=='board');boardG.visible=ride==='board';},
    // skis or snowboard: the board rides across the stance, so the whole body turns side-on and the head looks down the nose
    setRide(m){ride=m==='board'?'board':'ski';R.ride=ride;body.rotation.y=ride==='board'?Math.PI/2:0;R.gear(true);},
    apply(load,bd){
      const J=IDX[load.jacket]||IDX.j_puffer,P=IDX[load.pants],Gl=IDX[load.gloves],He=IDX[load.helmet],Go=IDX[load.goggles],Bo=IDX[load.boots];
      // jacket = style + your colours: body colour, stripe colour (the clean style has no stripe)
      const jc=JCOL[(bd&&bd.jc!==undefined)?bd.jc:0][1],sc=J.stripe===false?jc:JCOL[(bd&&bd.sc!==undefined)?bd.sc:1][1];
      M.jacket.color.setHex(jc);M.jacket.map=null;M.jacket.needsUpdate=true;M.hood.color.copy(M.jacket.color);M.hood.map=null;M.hood.needsUpdate=true;
      M.jacket_arm.color.copy(M.jacket.color);M.jacket_sh.color.copy(M.jacket.color);M.stripe.color.setHex(sc);
      M.jacket_arm.userData.stripeU.value.copy(M.stripe.color);M.jacket_sh.userData.stripeU.value.copy(M.stripe.color);R.gogOverHood=!!R.gogOver;
      // two-tone: sleeves + shoulders in the second colour
      if(J.two){M.jacket_arm.color.setHex(sc);M.jacket_sh.color.setHex(sc);M.jacket_arm.userData.stripeU.value.setHex(sc);M.jacket_sh.userData.stripeU.value.setHex(sc);}
      // race bib: waffle-knit base layer (jacket colour) + vest in the second colour
      const topMode=J.bib?'waffle':J.top==='tee'?'tee':J.top?'cotton':'puffer';swapShirt(topMode);
      M.shirt.color.setHex(jc);M.shirt_arm.color.setHex(jc);M.cotton.color.setHex(jc);M.cotton_arm.color.setHex(jc);
      if(topMode!=='puffer'){M.stripe.color.setHex(jc);}torsoG.traverse(c=>{if(c.isMesh&&(c.material===M.zip||c.material===M.logo))c.visible=topMode==='puffer'||(J.top==='hoodie'&&c.material===M.zip&&false);});   // tees/hoodies/base layer: no chest stripe, zip or patch
      if(bibMesh){bibMesh.visible=!!(J.bib||J.top);if(bibMesh.visible){M.bib.map=J.bib?bibTex(sc):teeTex(sc,J.top);M.bib.needsUpdate=true;}}
      M.accent.color.setHex(jc);M.trim.color.setHex(jc);
      {const pc=POLECOL[(bd&&bd.pc)||0]||POLECOL[0];M.pole.color.setHex(pc[1]);M.pole.metalness=pc[2]?.75:.15;M.pole.roughness=pc[2]?.25:.38;}   // pole colour
      M.pants.color.setHex(P.pat?0xffffff:P.c);M.pants.map=P.pat?patTex(P.pat,P.c,P.p2):null;M.pants.needsUpdate=true;
      {const du=M.pants.userData.deco,pcol=(bd&&bd.pnc>=0&&JCOL[bd.pnc])?JCOL[bd.pnc][1]:P.c;du.uDO.value=P.deco?1:0;du.uDT.value=P.deco?pantsDecoTex(P.deco,pcol):null;}   // sponsor prints / cargo pockets
      shin.forEach(o=>o.traverse(c=>{if(c.userData.gFl)c.geometry=P.flare?c.userData.gFl:c.userData.g0;}));   // flared styles
      M.glove.color.setHex(Gl.c);M.glove_acc.color.setHex(Gl.a);
      // colour pickers override the item colours (pants / gloves); -1 or unset = the item's own colour
      if(bd&&bd.pnc>=0&&JCOL[bd.pnc]){M.pants.color.setHex(JCOL[bd.pnc][1]);M.pants.map=null;M.pants.needsUpdate=true;}
      if(bd&&bd.glc>=0&&JCOL[bd.glc])M.glove.color.setHex(JCOL[bd.glc][1]);
      M.helmet.color.setHex(He.c);M.helmet_acc.color.setHex(He.a);const matte=/Matte|Sand|Olive/.test(He.n);M.helmet.metalness=He.metal?.9:0;M.helmet.roughness=He.metal?.18:(He.style==='beanie'?.95:matte?.62:.3);M.helmet.clearcoat=He.style==='beanie'||matte?0:1;
      // size sliders (locker): 0..1, default .5 = normal size, range 80%..120%
      const zsc=k=>.8+.4*((bd&&bd[k]!==undefined)?bd[k]:.5);
      if(M.helmet_liv){const L_=M.helmet_liv;if(He.liv){L_.map=liveryTex();L_.color.setHex(0xffffff);L_.metalness=.22;L_.roughness=.22;L_.clearcoat=1;L_.clearcoatRoughness=.05;}
        else{L_.map=He.style==='park2'?emblemTex(He.c):null;L_.color.setHex(He.style==='park2'?0xffffff:He.c);L_.metalness=0;L_.roughness=.58;L_.clearcoat=.3;}L_.needsUpdate=true;}
      for(const k in helmets){helmets[k].visible=k===He.style;helmets[k].scale.setScalar(zsc('zh'));}helmetStyle=He.style;gogBase=(He.style==='none'?.84:He.style==='beanie'?.93:1)*zsc('zg');
      skiOnly.forEach(o=>{o.scale.z=zsc('zs');o.scale.x=.72*zsc('zw');o.scale.y=.6+.8*((bd&&bd.zt!==undefined)?bd.zt:.5);});   // slimmer, realistic ski widthboardG.scale.x=zsc('zs');poleK=zsc('zp');pole.forEach(o=>o.scale.y=poleK);gloveK=zsc('zgl');
      const Ma=IDX[load.mask||'m_none'];R.mask=Ma.style;for(const k in masks)masks[k].visible=k===Ma.style;M.mask.color.setHex(Ma.pat?0xffffff:Ma.c);M.mask.map=Ma.pat?patTex(Ma.pat,Ma.c,Ma.p2):null;M.mask.needsUpdate=true;
      const gOff=R.gogMode==='off';for(const k in gogs)gogs[k].visible=k===Go.style&&!gOff;R.noGog=Go.style==='none'||gOff;M.frame.color.setHex(Go.f);M.lens.side=Go.style==='round'?U.DoubleSide:M.lens.side;M.lens.color.setHex(Go.l);if(Go.clear){M.lens.transparent=true;M.lens.opacity=.32;M.lens.metalness=.05;M.lens.roughness=.02;M.lens.depthWrite=false;}else{M.lens.transparent=false;M.lens.opacity=1;M.lens.metalness=1;M.lens.roughness=.04;M.lens.depthWrite=true;}M.lens.needsUpdate=true;if(M.lensR){['color'].forEach(k=>M.lensR[k].copy(M.lens[k]));M.lensR.transparent=M.lens.transparent;M.lensR.opacity=M.lens.opacity;M.lensR.metalness=M.lens.metalness;M.lensR.roughness=M.lens.roughness;M.lensR.depthWrite=M.lens.depthWrite;M.lensR.needsUpdate=true;}M.strap.color.setHex(Go.s);
      {const on=!!(bd&&bd.buds);buds.visible=budWire.visible=on;M.bud.color.setHex(bd&&bd.budc?0x17181c:0xf2f2f2);}
      {const st=gogs.round&&gogs.round.userData.strap;if(st)st.scale.set(helmetStyle==='none'?1:1.1,helmetStyle==='none'?1:1.35,helmetStyle==='none'?1:1.12);}   // strap rides on the outside of the helmet shell
      for(const b of boots)for(const k in b){b[k].visible=k===Bo.style;b[k].scale.setScalar(zsc('zb'));}M.boot_shell.color.setHex(Bo.c);M.boot_cuff.color.setHex(Bo.a);
      const sk=load.skis;M.ski_top.map=skiTex(sk);M.ski_top.needsUpdate=true;M.ski_top.color.setHex(0xffffff);
      const base=sk.startsWith('custom')?0x1a1a1e:IDX[sk].base;M.bind.color.setHex(base);M.ski_base.color.setHex(shade(base,-.5));
      {const cw=(bd&&bd.cw)||{},C=k=>cw[k]?parseInt(cw[k].slice(1),16):null;let v;
        if((v=C('jacket'))!==null){[M.jacket,M.hood,M.accent,M.trim,M.shirt,M.shirt_arm,M.cotton,M.cotton_arm].forEach(m=>m&&m.color.setHex(v));if(!J.two){M.jacket_arm.color.setHex(v);M.jacket_sh.color.setHex(v);}if(J.bib||J.top)M.stripe.color.setHex(v);}
        if((v=C('stripe'))!==null){M.stripe.color.setHex(v);M.jacket_arm.userData.stripeU.value.setHex(v);M.jacket_sh.userData.stripeU.value.setHex(v);if(J.two){M.jacket_arm.color.setHex(v);M.jacket_sh.color.setHex(v);}if((J.bib||J.top)&&bibMesh){M.bib.map=J.bib?bibTex(v):teeTex(v,J.top);M.bib.needsUpdate=true;}}
        if((v=C('pants'))!==null){M.pants.color.setHex(v);M.pants.map=null;M.pants.needsUpdate=true;if(P.deco)M.pants.userData.deco.uDT.value=pantsDecoTex(P.deco,v);}
        if((v=C('glove'))!==null)M.glove.color.setHex(v);
        if((v=C('helmet'))!==null){M.helmet.color.setHex(v);if(M.helmet_liv&&!He.liv){M.helmet_liv.map=He.style==='park2'?emblemTex(v):null;M.helmet_liv.needsUpdate=true;}}
        if((v=C('frame'))!==null)M.frame.color.setHex(v);if((v=C('lens'))!==null)M.lens.color.setHex(v);
        if((v=C('boot'))!==null)M.boot_shell.color.setHex(v);
        if((v=C('skitop'))!==null)M.ski_top.color.setHex(v);   // tints the top-sheet graphic
        if((v=C('skibase'))!==null){M.bind.color.setHex(v);M.ski_base.color.setHex(shade(v,-.4));}}
      if(bd){M.skin.color.setHex(BODY.skin[bd.skin]);M.lip.color.setHex(BODY.skin[bd.skin]).lerp(new U.Color(0xa4504a),.42).multiplyScalar(.88);
        const hc=BODY.hairColor[bd.hairColor];M.hair.color.setHex(hc);M.iris.color.setHex(BODY.eye[bd.eye]);
        const clava=R.mask==='clava';for(const k in hairs)hairs[k].visible=k===bd.hair&&!clava&&!bd.hood;for(const k in tops)tops[k].visible=k===bd.hair&&helmetStyle==='none'&&!clava&&!bd.hood;ears.visible=!clava;R.hoodOn=!!bd.hood;hoodUp.visible=R.hoodOn;hoodDown.visible=!R.hoodOn;M.hstrap.visible=!R.hoodOn;
        // one body type for everyone (realistic proportions)
        // slim, tall athletic build (matches the reference): narrow torso, thin limbs, long legs
        bs=1;R.hs=1;const T=V2?{tx:.84,ty:1,tz:.86,sh:6.75,arm:.84,leg:3.45,th:.76,sn:.72,kn:.64}:{tx:1,ty:1,tz:1,sh:8.35,arm:1,leg:3.9,th:1,sn:1,kn:1};
        // fit sliders (0 = slim, 1 = baggy): jacket body/arms, pant legs and how far the hem falls over the boot
        if(V2){const jf=bd.jf!==undefined?bd.jf:.3,pf=bd.pf!==undefined?bd.pf:.2,jk=.94+.18*jf,ak=.92+.22*jf;
          T.tx*=jk;T.tz*=jk;T.arm*=ak;T.th=.8+.2*pf;T.sn=T.th*.95;T.kn=.86*T.th;hem=1.6+1.4*pf;}   // pants fall over the boot cuff
        if(GEAR){// fitted gear: real proportions from the body it was fitted to; sliders still loosen/tighten it
          // fuller, athletic build: broad torso and shoulders, solid arms and legs (sliders go from fitted to baggy on top of this)
          const jf=bd.jf!==undefined?bd.jf:.3,pf=bd.pf!==undefined?bd.pf:.3,jk=1.22+.22*jf,lk=1.42+.4*pf;
          Object.assign(T,{tx:jk,ty:1.04,tz:jk*1.05,sh:GM.sh_x*.76*1.04,arm:1.38+.25*jf,leg:GM.hip_x*1.45/.9,th:lk,sn:lk*1.02,kn:1});hem=.8+1.2*pf;
          if(gHips)gHips.scale.set(1.3+.3*pf,1,1.3+.3*pf);T.kn=.62*lk/1.54;}
        if(J.bib||J.top){const k=J.top==='hoodie'?.93:J.bib?.9:.86;T.tx*=k;T.tz*=k-.02;T.arm*=J.top==='hoodie'?.9:.8;}   // fitted base layer under the vest
        torsoG.scale.set(T.tx,T.ty,T.tz);const shY=GEAR?GM.sh_y+.6:13.3*T.ty,shZ=GEAR?GM.sh_z:0;SH[0].set(T.sh*(T.tx/.76),shY,shZ);SH[1].set(-T.sh*(T.tx/.76),shY,shZ);legX=T.leg;
        if(V2&&!GEAR){head.position.y=22.2*T.ty;}
        [...uarm,...farm].forEach(m=>{m.scale.x=m.scale.z=T.arm;});elb.forEach(m=>m.scale.setScalar(GEAR?T.arm*.62:T.arm));shoulder.forEach(m=>m.scale.setScalar(GEAR?T.arm*.66:T.arm));hand.forEach(h=>h.scale.setScalar((GEAR?.6:V2?.7:1)*gloveK));   // gloves sized to the jacket cuffs
        thigh.forEach(m=>{m.scale.x=m.scale.z=T.th;});shin.forEach(m=>{m.scale.x=m.scale.z=T.sn;});knee.forEach(m=>m.scale.setScalar(T.kn));}
    },
    pose(o,dt){
      const k=1-Math.exp(-dt*11);
      let c=o.crouch||0,lean=.12+.78*c,tw=o.steer?-o.steer*.12:0,lX=0,tk=0,sy=0,ss=o.steer?o.steer*.12:0,hl=[11,3.5,9],hr=[-11,3.5,9],pd=[.18,-.5,-.85];
      if(o.tuck){hl=[3.6,7,11.5];hr=[-3.6,7,11.5];pd=[.05,-.1,-1];lean=1.02;}
      if(o.air){hl=[15.5,7,3];hr=[-15.5,7,3];c=Math.max(c,.3);lean=.45;pd=[.4,-.3,-.87];}
      const GP=o.grab&&GRABPOSE[o.grab];if(GP){c=GP.c;lean=GP.lean;sy=GP.sy||0;lX=GP.lX||0;tk=GP.tk||0;tw=GP.tw||0;hl=GP.hl;hr=GP.hr;}
      if(false){}
      else if(o.grab==='Safety'){c=1;tk=4;lX=-.3;lean=.95;hl=[9.5,-15,3];hr=[-16,11,-2];}
      else if(o.grab==='Japan'){c=.55;lX=.85;lean=.35;tw=.45;hl=[5,-12,-10];hr=[-15,11,4];}
      if(o.sit){c=0;lean=-.06;hl=[4.6,-2.5,9.5];hr=[-4.6,-2.5,9.5];pd=[.2,-.4,.9];}
      if(o.idle){const hx=V2?8.2:10.3*bs;hl=[hx,-3.5,2.8];hr=[-hx,-3.5,2.8];pd=[.1,-.97,-.2];lean=.04;}
      if(o.tow){hl=[2.5,6,13];hr=[-2.5,6,13];pd=[.1,-.9,-.4];lean=.25;}   // both hands on the tow rope
      const SB=ride==='board';
      if(SB&&!GP&&!o.sit){lean*=.4;tw-=.3;if(!o.air&&!o.idle){hl=[11,-1,4];hr=[-11,-1,4];}c=Math.max(c,.38);}   // snowboard: upright, knees bent, arms out for balance
      s.c+=(c-s.c)*k;s.lean+=(lean-s.lean)*k;s.tw+=((tw+(o.look||0))-s.tw)*k;s.lX+=(lX-s.lX)*k;s.tk+=(tk-s.tk)*k;s.sy+=(sy-s.sy)*k;s.ss+=(ss-s.ss)*k;
      s.hl.lerp(tA.fromArray(hl),k);s.hr.lerp(tA.fromArray(hr),k);s.pd.lerp(tA.fromArray(pd),k);
      // goggle mode (player choice): on the face, pushed up on the helmet, or off; unset = lobby default behaviour
      const gup=R.gogMode==='helmet'?true:R.gogMode==='face'?!!o.peek:o.gogUp;
      s.gu+=((gup&&!R.hoodOn&&R.mask!=='clava'&&!R.noGog?1:0)-s.gu)*k;gpiv.rotation.x=-.78*s.gu;gpiv.position.set(0,(gogBase<1?.2:.9)+.25*s.gu,(helmetStyle==='shell'||helmetStyle==='pro'?-.8:.15)*s.gu+(gogBase<.9?.55:0));{const gs=gogBase*(1+.035*s.gu),ov=R.gogOverHood,hw=R.hoodOn?(ov?1.13:.965):1;gpiv.scale.set(gs*hw*.95,gs,gs*(R.hoodOn?(ov?1.16:.975):1)*.84);} // hood up: goggles under the hood, or strapped over it
      head.rotation.y=SB?((o.look||0)>.5?1.2:-1.2):-(o.look||0)*.6;
      let hipY=(V2?31:27.5)-(V2?12.8:11.5)*s.c,hipZ=-2.8*s.c;const LL=V2?12.3:10.5;
      if(o.sit){hipY=19.5;hipZ=0;}   // seated on a chairlift
      upper.position.set(0,hipY,hipZ);upper.rotation.set(o.sit?-.06:s.lean,o.sit?0:s.tw,0);
      if(o.sit){lower.position.set(0,7.2+13.5,LL+1.2);lower.rotation.x=.28;}else{lower.position.set(0,20+s.tk,0);lower.rotation.x=s.lX;}if(SB){skiG[0].position.x=9.5;skiG[1].position.x=-9.5;skiG[0].rotation.y=.26;skiG[1].rotation.y=-.1;}
      else{skiG[0].position.x=5;skiG[1].position.x=-5;skiG[0].rotation.y=s.sy+s.ss;skiG[1].rotation.y=-s.sy+s.ss;}
      for(let i=0;i<2;i++){const sd=i?-1:1;
        tA.set(sd*legX*.9,hipY-1,hipZ);tB.set(sd*(SB&&!o.sit?9.5:5.0),20+s.tk-13.5*Math.cos(s.lX),-13.5*Math.sin(s.lX)-.6);
        if(o.sit)tB.set(sd*4.6,7.2,LL+1.2);
        tH.set(sd*.12,.1,1);ik(tE,tA,tB,LL,LL,tH);limb(thigh[i],tE,tA);
        if(V2){tB.y-=hem;tB.z+=.5;}limb(shin[i],tB,tE);knee[i].position.copy(tE);   // pant cuff sits on the boot, upper boot still shows
        tB.copy(i?s.hr:s.hl);tH.set(sd*.55,-.5,-.65);shoulder[i].position.copy(SH[i]);ik(tE,SH[i],tB,9.6,9.6,tH);limb(uarm[i],tE,SH[i]);limb(farm[i],tB,tE);elb[i].position.copy(tE);
        hand[i].position.copy(tB);hand[i].quaternion.copy(farm[i].quaternion);
        tA.set(s.pd.x*sd,s.pd.y,s.pd.z).normalize();tE.copy(tB).addScaledVector(tA,15*poleK);pole[i].position.copy(tE);pole[i].quaternion.setFromUnitVectors(UPV,tH.copy(tA).negate());}
    }};
  return R;
}
