/* DUB12 — map layouts, terrain, scenery */
'use strict';
const S=8,G=1100,POP0=165,POP1=215,FLIP=5.6,SPIN=8,DRAG=0.00034,FRIC=22,TURN=2.3;
let map=null;
const sm=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
const norm=a=>{a%=Math.PI*2;if(a>Math.PI)a-=Math.PI*2;if(a<-Math.PI)a+=Math.PI*2;return a;};
const PAL=[0x3aa0ff,0xff4d6d,0xffd23f,0x39d98a,0xb36bff,0xff7a1a,0x58d7ff];
function buildMap(id){
  const M={id,ys:[0],feat:[],rails:[],lips:[],trees:[],cliffs:[],pillows:[],stairs:[],decor:[],noise:0,hw:430};
  if(id==='back'||id==='pillow')M.noise=1;if(id==='glacier')M.noise=2;if(id==='downtown')M.hw=270;
  const ys=M.ys;let y=0;const B=(id==='back'||id==='pillow')?.34:id==='glacier'?.3:.24;
  const X=()=>(ys.length-1)*S;
  const seg=(len,s0,s1)=>{if(s1===undefined)s1=s0;const n=Math.round(len/S);for(let i=0;i<n;i++){y+=(s0+(s1-s0)*(i+.5)/n)*S;ys.push(y);}};
  const drop=h=>{y+=h;ys.push(y);};
  const feature=(cx,hw,fn)=>{const i0=ys.length-1;fn();M.feat.push({i0,i1:ys.length-1,cx,hw,ew:80});};
  const kicker=(cx,hw,lipLen,lipS,deck,table,landS,landLen,col,run)=>{seg(run===undefined?240:run,B);feature(cx,hw,()=>{const a=X();seg(lipLen,B,-lipS);if(col)M.lips.push({z1:a+lipLen*.3,z2:X(),cx,hw,col});
    drop(deck);seg(table,.03);seg(90,.03,landS);seg(landLen,landS);seg(240,landS,B);});};
  // rails are built full size: ~1-1.5 m tall handrails, wide boxes (RS scales the authored heights)
  const RS=1.55,rail=(x,h,z1,z2,col,box,extra)=>M.rails.push(Object.assign({x,z1,z2,h:h*RS,box:!!box,col,w:box?34:19,arch:0},extra||{}));
  const jib=(len,list,prof)=>{seg(260,B);const a=X();if(prof)prof();else seg(len*2,B);list.forEach(r=>rail(r.x,r.h,a,X(),r.col,r.box,r.arch?{arch:r.arch}:null));seg(200,B);};
  const pitch=()=>{seg(260,B,B+.18);seg(260,B+.18,B);};
  const cliff=h=>{feature(0,3000,()=>{seg(220,B,.08);M.cliffs.push({z:X(),h});drop(h);seg(60,.9,.75);seg(200+h*2,.75);seg(260,.75,B);});};
  const pillowStack=(n,h)=>{feature(0,3000,()=>{for(let k=0;k<n;k++){seg(80,B,.04);M.pillows.push({z:X(),h});drop(h);seg(70,.6);seg(40,.6,B);}});};
  const stairs=(n,rise,run,list)=>{const a=X(),y0=y;for(let k=0;k<n;k++){seg(run,.02);M.stairs.push({z1:X()-run,z2:X(),y:y});drop(rise);}
    const z2=X()+run*.5;seg(run*.5,.02);list.forEach(r=>rail(r.x,0,a,z2,r.col,r.box,{lin:1,ya:-y0+r.h*1.35,yb:-y+r.h*1.35}));seg(240,.06);};
  if(id==='park'){
    seg(440,.7);seg(220,.7,B);
    kicker(0,150,140,.5,30,120,.5,260,0x3aa0ff);
    jib(420,[{x:-120,h:22,col:0xff4d6d},{x:120,h:14,col:0x39d98a,box:1}]);
    kicker(0,160,180,.62,45,200,.55,380,0xffd23f);
    jib(380,[{x:-150,h:14,col:0xb36bff,box:1},{x:0,h:24,col:0xffd23f},{x:150,h:14,col:0x3aa0ff,box:1}]);
    pitch();kicker(0,190,240,.78,60,320,.62,540,0xff4d6d);
    jib(620,[{x:-120,h:24,col:0x39d98a},{x:120,h:24,col:0xff7a1a}]);
    kicker(0,160,180,.62,45,200,.55,380,0x3aa0ff);
    jib(340,[{x:-110,h:14,col:0xff4d6d,box:1},{x:110,h:16,col:0xffd23f,arch:34}]);
    pitch();kicker(0,210,280,.85,70,400,.66,680,0xff7a1a);
  }else if(id==='rails'){
    seg(440,.7);seg(220,.7,B);
    jib(360,[{x:-170,h:16,col:0x58d7ff,box:1},{x:-55,h:22,col:0xff4d6d},{x:60,h:22,col:0xffd23f},{x:175,h:16,col:0x39d98a,box:1}]);
    jib(0,[{x:-110,h:22,col:0xb36bff},{x:110,h:22,col:0xff7a1a}],()=>{seg(150,.48);seg(170,.08);seg(150,.48);});
    kicker(0,140,110,.42,22,60,.45,200,0x58d7ff);
    jib(520,[{x:-160,h:20,col:0xff4d6d},{x:0,h:14,col:0xffd23f,box:1},{x:160,h:20,col:0x39d98a}]);
    jib(0,[{x:-60,h:24,col:0xff7a1a},{x:150,h:16,col:0x3aa0ff,box:1}],()=>{seg(200,.1);seg(240,.5);});
    pitch();
    jib(0,[{x:-140,h:22,col:0xb36bff},{x:140,h:22,col:0x58d7ff}],()=>{seg(140,.5);seg(140,.06);seg(140,.5);seg(140,.06);});
    kicker(0,160,150,.55,35,140,.52,300,0xff4d6d);
    jib(420,[{x:-130,h:18,col:0x58d7ff,arch:42},{x:130,h:18,col:0xff3df0,arch:42}]);
    jib(700,[{x:0,h:28,col:0xff7a1a}]);
    jib(600,[{x:-180,h:14,col:0xffd23f,box:1},{x:-60,h:24,col:0x39d98a},{x:60,h:24,col:0xff4d6d},{x:180,h:14,col:0x3aa0ff,box:1}]);
  }else if(id==='back'){
    seg(520,.75);seg(260,.75,B);seg(500,B);
    kicker(0,3000,110,.35,22,60,.6,220,0);
    seg(400,B);cliff(70);seg(500,B);
    for(let k=0;k<3;k++)feature(0,3000,()=>{seg(110,B,.1);drop(34);seg(130,.62);seg(60,.62,B);});
    seg(500,B);cliff(110);seg(420,B);pitch();
    kicker(0,3000,130,.4,26,80,.62,260,0);
    seg(500,B);cliff(170);seg(600,B);
    kicker(0,3000,110,.35,22,60,.6,220,0);seg(300,B);
  }else if(id==='pillow'){
    seg(520,.75);seg(260,.75,B);seg(400,B);
    pillowStack(3,26);seg(500,B);
    kicker(0,3000,100,.32,20,50,.55,200,0);seg(420,B);
    pillowStack(4,30);seg(600,B);cliff(90);seg(420,B);
    pillowStack(5,24);seg(500,B);pitch();
    pillowStack(3,40);seg(400,B);
  }else if(id==='glacier'){
    seg(600,.8);seg(300,.8,B);
    for(let k=0;k<3;k++){seg(240,B,-.08);seg(160,-.08,B+.2);seg(200,B+.2,B);}
    kicker(-210,90,140,.55,34,120,.55,280,0x58d7ff,300);
    kicker(210,90,140,.55,34,120,.55,280,0x58d7ff,0);
    seg(500,B);kicker(0,3000,170,.62,40,180,.6,420,0);
    seg(400,B);cliff(120);seg(400,B);
    for(let k=0;k<4;k++){seg(200,B,-.1);seg(160,-.1,B+.25);seg(160,B+.25,B);}
    kicker(0,3000,220,.72,55,260,.62,520,0);
  }else if(id==='night'){
    seg(720,.75);seg(260,.75,B);
    const c=[0x58d7ff,0xff3df0,0xffd23f];
    for(let k=0;k<3;k++){kicker(0,230,300,.9,80,460,.68,760,c[k]);if(k<2){seg(200,B);pitch();}}
  }else if(id==='downtown'){
    seg(400,.7);seg(200,.7,.1);
    stairs(8,8,22,[{x:-90,h:26,col:0xffd23f},{x:90,h:26,col:0xff4d6d}]);
    jib(300,[{x:0,h:16,col:0x58d7ff,box:1}]);
    stairs(6,9,22,[{x:-120,h:26,col:0x39d98a},{x:0,h:26,col:0xff7a1a},{x:120,h:26,col:0xb36bff}]);
    seg(200,.1);kicker(0,140,120,.45,26,80,.5,220,0xff3df0);
    stairs(10,8,20,[{x:-80,h:28,col:0xff4d6d},{x:80,h:28,col:0x58d7ff}]);
    jib(0,[{x:-100,h:22,col:0xffd23f},{x:100,h:22,col:0x39d98a}],()=>{seg(160,.45);seg(160,.06);seg(160,.45);});
    stairs(7,9,22,[{x:0,h:26,col:0xff7a1a}]);
  }else if(id==='mega'){
    seg(260,.4);seg(1100,1.2);
    feature(0,260,()=>{const a=X();seg(300,1.2,-1.4);M.lips.push({z1:a+165,z2:X(),cx:0,hw:260,col:0xff7a1a});drop(380);seg(100,.03);seg(90,.03,1.0);seg(2700,1.0);seg(500,1.0,B);});
    seg(300,B);kicker(0,200,200,.6,50,240,.6,420,0xffd23f);
    jib(700,[{x:-120,h:26,col:0xff4d6d},{x:120,h:16,col:0x58d7ff,box:1}]);
  }
  seg(300,B);M.finishZ=X();seg(400,B,0);seg(1800,0);
  const n=M.n=ys.length;M.ys=Float32Array.from(ys);M.yb=Float32Array.from(ys);M.fidx=new Int16Array(n).fill(-1);M.len=(n-1)*S;
  M.feat.forEach((f,k)=>{for(let i=f.i0;i<=f.i1;i++){M.yb[i]=ys[f.i0]+(ys[f.i1]-ys[f.i0])*(i-f.i0)/(f.i1-f.i0);M.fidx[i]=k;}});
  map=M;
  const r=rng(id.length*77+5),edge=M.hw+50;
  if(id!=='downtown')for(let z=0;z<M.len;z+=55)[-1,1].forEach(sd=>{if(r()<.8){const x=sd*(edge+r()*330);M.trees.push({x,z:z+r()*40,s:.8+r()*.9});}});
  const dense=id==='back'?70:id==='pillow'?46:0;
  if(dense)for(let z=900;z<M.finishZ-200;z+=dense){if(r()<.85){const x=(r()-.5)*860,i=(z/S)|0;if(M.fidx[i]>=0||M.fidx[Math.min(n-1,i+30)]>=0)continue;if(Math.abs(x)<50&&r()<.6)continue;M.trees.push({x,z,s:.8+r()*.8,hit:1});}}
  // keep the chairlift corridor clear of trees
  M.lift=id!=='downtown'?-(M.hw+250):0;if(M.lift)M.trees=M.trees.filter(t=>Math.abs(t.x-M.lift)>95);
  // every tree is solid (edge trees too); park runs are fenced so you can't ride off the side
  M.lim=['park','rails','night','mega','glacier'].includes(id)?M.hw+14:M.hw+240;
  M.buckets={};M.trees.forEach(t=>{t.y=hAt(t.x,t.z);t.rad=10*t.s+4;t.h=70*t.s;addCol(M,t);});
  const cl01=v=>Math.max(0,Math.min(1,v));
  M.rails.forEach(R=>{R.yAt=R.lin?(z=>R.ya+(R.yb-R.ya)*cl01((z-R.z1)/(R.z2-R.z1))):(z=>hAt(R.x,z)+R.h+R.arch*Math.sin(Math.PI*cl01((z-R.z1)/(R.z2-R.z1))));
    R.name=R.box?'Box':R.arch?'Rainbow Rail':R.lin?'Handrail':R.h>40?'Mega Rail':'Rail';});
  return M;
}
/* colliders live in 300-unit z buckets; circles {x,z,rad,y,h} or rotated boxes {box,x,z,hx,hz,cs,sn,y,h} */
function addCol(M,o){const ext=o.box?Math.hypot(o.hx,o.hz):o.rad;for(let k=((o.z-ext)/300)|0;k<=(((o.z+ext)/300)|0);k++)(M.buckets[k]=M.buckets[k]||[]).push(o);}
function hAt(x,z){
  if(map.fr)return resortH(x,z);
  const M=map,f=Math.max(0,Math.min(M.n-2,z/S)),i=f|0,t=f-i;
  let a=M.ys[i]+(M.ys[i+1]-M.ys[i])*t;const k=M.fidx[i];
  if(k>=0){const F=M.feat[k],d=Math.abs(x-F.cx)-F.hw;if(d>0){const b=M.yb[i]+(M.yb[i+1]-M.yb[i])*t;a=b+(a-b)*(1-sm(d/F.ew));}}
  let h=-a;const e=Math.min(300,Math.abs(x)-M.hw);if(e>0)h+=M.id==='downtown'?Math.min(e,30)*1.2:e*e*.004;
  if(M.noise===1)h+=12*Math.sin(x*.011+1)*Math.sin(z*.0042)+6*Math.sin(x*.024+z*.009);
  else if(M.noise===2)h+=16*Math.sin(x*.008+2)*Math.sin(z*.003)+5*Math.sin(x*.02-z*.006)+(x*x)*.00012;
  return h;
}
const gPitch=(x,z,dx,dz)=>-Math.atan((hAt(x+dx*6,z+dz*6)-hAt(x-dx*6,z-dz*6))/12);

/* ---------- run scene ---------- */
const scene=new U.Scene();
const hemi=new U.HemisphereLight(0xffffff,0x8899bb,.9),sun=new U.DirectionalLight(0xffffff,.7);
sun.castShadow=true;sun.shadow.mapSize.set(4096,4096);sun.shadow.bias=-.0008;sun.shadow.normalBias=2;
{const c=sun.shadow.camera;c.left=-560;c.right=560;c.top=560;c.bottom=-560;c.near=100;c.far=4200;}
scene.add(hemi,sun,sun.target);
let runG=null;const sunDir=new U.Vector3(0,1,0);
let pmrem=null;const ENVC={};
function envFor(key,top,mid,bot){if(ENVC[key])return ENVC[key];const c=document.createElement('canvas');c.width=256;c.height=128;const g=c.getContext('2d');
  const gr=g.createLinearGradient(0,0,0,128);gr.addColorStop(0,top);gr.addColorStop(.48,mid);gr.addColorStop(.52,'#ffffff');gr.addColorStop(1,bot);g.fillStyle=gr;g.fillRect(0,0,256,128);
  const t=new U.CanvasTexture(c);t.mapping=U.EquirectangularReflectionMapping;pmrem=pmrem||new U.PMREMGenerator(renderer);ENVC[key]=pmrem.fromEquirectangular(t).texture;return ENVC[key];}
function texFor(kind){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,128,128);
  if(kind==='cord'){g.fillStyle='rgba(120,150,215,.18)';for(let x=0;x<128;x+=8)g.fillRect(x,0,2.5,128);}
  const r=rng(9);for(let i=0;i<400;i++){g.fillStyle='rgba(120,160,225,'+(r()*.22)+')';g.fillRect(r()*128,r()*128,1+r()*2,1+r()*2);}
  for(let i=0;i<120;i++){g.fillStyle='rgba(255,255,255,'+(.6+r()*.4)+')';g.fillRect(r()*128,r()*128,1,1);}
  const t=new U.CanvasTexture(c);t.wrapS=t.wrapT=U.RepeatWrapping;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;}
const ENVM={};
function envMat(n,c,o){const k=n+'_'+c;if(!ENVM[k])ENVM[k]=new U.MeshStandardMaterial(Object.assign({color:c,roughness:.9,vertexColors:true},o||{}));return ENVM[k];}
function instParts(name,list,fn,mats){const src=A[name],out=[];const meshes=[];src.traverse(o=>{if(o.isMesh)meshes.push(o);});const d=new U.Object3D();
  meshes.forEach(m=>{const im=new U.InstancedMesh(m.geometry,mats[mname(m.material)]||envMat('x',0xffffff),list.length);
    list.forEach((t,i)=>{fn(d,t,i);d.updateMatrix();im.setMatrixAt(i,d.matrix);});im.instanceMatrix.needsUpdate=true;im.frustumCulled=false;im.castShadow=true;im.receiveShadow=true;out.push(im);});return out;}
function railPath(R){const pts=[];for(let z=R.z1;z<=R.z2+.1;z+=Math.min(40,(R.z2-R.z1)/2)){pts.push(new U.Vector3(R.x,R.yAt(Math.min(z,R.z2)),Math.min(z,R.z2)));}if(pts[pts.length-1].z<R.z2)pts.push(new U.Vector3(R.x,R.yAt(R.z2),R.z2));return pts;}
function windowTex(seed){const c=document.createElement('canvas');c.width=128;c.height=256;const g=c.getContext('2d'),r=rng(seed);
  g.fillStyle=['#3a2f44','#46384a','#2e3550','#4a3a30'][seed%4];g.fillRect(0,0,128,256);
  for(let y=12;y<256;y+=28)for(let x=10;x<128;x+=24){g.fillStyle=r()<.55?['#ffd98a','#ffe9b8','#9fd0ff'][(r()*3)|0]:'#151824';g.fillRect(x,y,14,18);}
  const t=new U.CanvasTexture(c);t.wrapS=t.wrapT=U.RepeatWrapping;return t;}
const _lo=new U.Object3D();
function updateLift(dt){const Lf=runG&&runG.userData.lift;if(!Lf)return;Lf.t+=dt*Lf.speed;const span=Lf.z1-Lf.z0,T=Lf.TW;
  Lf.L.forEach((it,k)=>{let u=(it.u*span+(it.side<0?Lf.t:-Lf.t))%span;if(u<0)u+=span;const z=Lf.z0+u,f=(z-Lf.z0)/Lf.step,i=Math.min(T.length-2,f|0),t=f-i,a=T[i],b=T[i+1];
    _lo.position.set(Lf.lx+it.side,a.y+(b.y-a.y)*t+Lf.CH-72*t*(1-t),z);_lo.rotation.set(0,it.side<0?0:Math.PI,Math.sin(Lf.t*.02+k)*.03);_lo.scale.setScalar(1);_lo.updateMatrix();
    Lf.chairs.forEach(m=>m.setMatrixAt(k,_lo.matrix));});
  Lf.chairs.forEach(m=>m.instanceMatrix.needsUpdate=true);}
function buildGfx(){
  if(runG){scene.remove(runG);runG.traverse(o=>{if(o.geometry&&!o.userData.shared&&!o.isInstancedMesh)o.geometry.dispose();});}
  runG=new U.Group();scene.add(runG);
  const M=map,C=Object.assign({},MAPS[M.id],save.set.tod&&save.set.tod!=='map'?TOD[save.set.tod]:{}),skyc=C.sky.match(/#[0-9a-f]{6}/gi);
  cv.style.background=C.sky;scene.fog=new U.Fog(C.fog,2200,14000);
  scene.environment=envFor(M.id+(save.set.tod||''),skyc[0],skyc[skyc.length-1],'#8fa6cf');
  // linear lighting: the sun carries most of the light, sky fill stays cool so shade reads blue like real snow
  hemi.color.setHex(C.hemi[0]);hemi.groundColor.setHex(C.hemi[1]);hemi.intensity=C.hemi[2]*(C.night?.62:.9);
  sun.color.setHex(C.sun[0]);sun.intensity=C.sun[1]*(C.night?1.25:1.55);sunDir.set(C.sun[2][0],C.sun[2][1],C.sun[2][2]).normalize();
  if(typeof setRunSky==='function')setRunSky(C,sunDir,C.sun[0]);
  const std=(c,o)=>new U.MeshStandardMaterial(Object.assign({color:c,roughness:.6},o||{})),dark=std(0x1c2545),concrete=std(0x9a9aa6,{roughness:.9});
  const add=(geo,mat,x,y,z)=>{const me=new U.Mesh(geo,mat);me.position.set(x,y,z);me.castShadow=true;me.receiveShadow=true;runG.add(me);return me;};
  const HQ=!!A.pine_hq_a,tm={needles:envMat('needles',C.tree[0],{roughness:.85}),snow:envMat('snow',0xf4f7ff,{roughness:.7}),bark:envMat('bark',0x3b2a20)};
  if(M.fr)buildResortGfx(M,C,add,std,tm);
  else{
  // terrain
  const XS=14,nx=105,x0=-728,nz=M.n,pos=new Float32Array(nx*nz*3),col=new Float32Array(nx*nz*3),uv=new Float32Array(nx*nz*2),idx=new Uint32Array((nx-1)*(nz-1)*6);
  const lc=new U.Color(),ice=C.ice?new U.Color(0xbfe4ff):null;
  for(let j=0;j<nz;j++){const z=j*S;let lip=null;for(const l of M.lips)if(z>=l.z1&&z<=l.z2)lip=l;
    for(let i=0;i<nx;i++){const x=x0+i*XS,o=(j*nx+i)*3,h=hAt(x,z);pos[o]=x;pos[o+1]=h;pos[o+2]=z;
      let r=1,g=1,b=1;if(lip&&Math.abs(x-lip.cx)<=lip.hw+10){lc.setHex(lip.col);r=lc.r*.8+.2;g=lc.g*.8+.2;b=lc.b*.8+.2;}
      else if(ice){const k=.35+.35*Math.sin(x*.013+z*.004)*Math.sin(z*.002);r=1-(1-ice.r)*k;g=1-(1-ice.g)*k;b=1;}
      col[o]=r;col[o+1]=g;col[o+2]=b;uv[(j*nx+i)*2]=x/64;uv[(j*nx+i)*2+1]=z/64;}}
  let q=0;for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){const a=j*nx+i,b=a+1,c=a+nx,d=c+1;idx[q++]=a;idx[q++]=c;idx[q++]=b;idx[q++]=b;idx[q++]=c;idx[q++]=d;}
  const tg=new U.BufferGeometry();tg.setAttribute('position',new U.BufferAttribute(pos,3));tg.setAttribute('color',new U.BufferAttribute(col,3));tg.setAttribute('uv',new U.BufferAttribute(uv,2));
  tg.setIndex(new U.BufferAttribute(idx,1));tg.computeVertexNormals();
  const terr=new U.Mesh(tg,typeof snowMaterial==='function'?snowMaterial(C.tex,{vc:true}):new U.MeshStandardMaterial({map:texFor(C.tex),vertexColors:true,roughness:.92,envMapIntensity:.5}));terr.receiveShadow=true;runG.add(terr);
  // trees: Blender-built snow-loaded pines (falls back to the original low-poly ones)
  const tf=(d,t)=>{d.position.set(t.x,t.y-6,t.z);d.scale.setScalar(t.s*(HQ?.62:1));d.rotation.set(0,t.x*.37+t.z*.11,(Math.sin(t.x*.13+t.z)*.03));};
  const tn=HQ?['pine_hq_a','pine_hq_b','pine_hq_c']:['pine_a','pine_b'];
  tn.forEach((n,k)=>{const L=M.trees.filter((t,i)=>i%tn.length===k);if(L.length)instParts(n,L,tf,k===1?Object.assign({},tm,{needles:envMat('needles',C.tree[1],{roughness:.85})}):tm).forEach(m=>runG.add(m));});
  const RK=A.rock_hq_a?'rock_hq_a':'rock',rk={rock:envMat('rock',C.ice?0x9fc8e8:0x6d7686,{roughness:C.ice?.25:.95}),snow:tm.snow};
  if(M.cliffs.length){const L=[],r=rng(4);M.cliffs.forEach(c=>{for(let i=0;i<42;i++){const x=-740+i*36+r()*14;L.push({x,y:hAt(x,c.z-4)-c.h*.5,z:c.z+10+r()*8,sy:c.h/34*(.8+r()*.4),s:.9+r()*.6,rz:.5+r()*.4,a:r()*6});}});
    instParts(RK,L,(d,t)=>{d.position.set(t.x,t.y,t.z);d.scale.set(t.s,t.sy,t.rz);d.rotation.set(0,t.a,0);},rk).forEach(m=>runG.add(m));}
  {const L=[],r=rng(5);for(let z=500;z<M.len-600;z+=230)[-1,1].forEach(sd=>{if(r()<(C.ice?.75:.4)){const x=sd*(M.hw+70+r()*260);if(M.lift&&Math.abs(x-M.lift)<110)return;L.push({x,y:hAt(x,z)-4,z,s:.6+r()*1.3,a:r()*6});}});
    instParts(RK,L,(d,t)=>{d.position.set(t.x,t.y,t.z);d.scale.set(t.s,t.s*1.5,t.s);d.rotation.set(0,t.a,0);},rk).forEach(m=>runG.add(m));
    L.forEach(t=>addCol(M,{x:t.x,z:t.z,y:t.y,rad:26*t.s,h:40*t.s}));}
  }
  // pillows
  if(M.pillows.length){const g=new U.SphereGeometry(1,18,10),pm=new U.MeshStandardMaterial({color:0xffffff,roughness:.85,map:texFor('pow')}),L=[],r=rng(12);
    M.pillows.forEach(p=>{for(let x=-700;x<=700;x+=60+r()*30)L.push({x:x+r()*20,y:hAt(x,p.z-6)-p.h*.45,z:p.z+4+r()*6,s:20+r()*12,h:p.h*.62});});
    const im=new U.InstancedMesh(g,pm,L.length),d=new U.Object3D();L.forEach((t,i)=>{d.position.set(t.x,t.y,t.z);d.scale.set(t.s,t.h,t.s*.8);d.rotation.set(0,0,0);d.updateMatrix();im.setMatrixAt(i,d.matrix);});
    im.castShadow=im.receiveShadow=true;im.frustumCulled=false;runG.add(im);}
  // stairs (downtown)
  M.stairs.forEach(s=>{add(new U.BoxGeometry(2*M.hw,10,s.z2-s.z1),concrete,0,-s.y-4.4,(s.z1+s.z2)/2);});
  if(M.id==='downtown'){const r=rng(6);for(let z=200;z<M.len-1400;z+=260+r()*120)[-1,1].forEach(sd=>{const h=260+r()*360,w=160+r()*90,d=180+r()*60,x=sd*(M.hw+40+w/2),y=hAt(sd*(M.hw+40),z);
      const t=windowTex((z|0)+(sd>0?1:0));t.repeat.set(w/90,h/140);const b=add(new U.BoxGeometry(w,h,d),new U.MeshStandardMaterial({map:t,emissive:0xffffff,emissiveMap:t,emissiveIntensity:.55,roughness:.8}),x,y+h/2-10,z);
      add(new U.BoxGeometry(w+6,8,d+6),std(0xf4f7ff,{roughness:.8}),x,y+h-6,z);});}
  // lips & flags
  M.lips.forEach(l=>[-1,1].forEach(sd=>{const x=l.cx+sd*(l.hw+6),y=hAt(l.cx,l.z2-4);add(new U.CylinderGeometry(1.2,1.2,70,6),dark,x,y+30,l.z2);
    add(new U.BoxGeometry(26,14,1),new U.MeshBasicMaterial({color:l.col}),x+sd*13,y+56,l.z2);}));
  // rails and boxes: full-size park features — painted steel rails on posts with base plates, UHMW-topped boxes with steel coping
  const steel=std(0x8a8f99,{roughness:.32,metalness:.9}),uhmw=std(0x2b2e35,{roughness:.42}),plate=std(0x3a3e46,{roughness:.5,metalness:.7});
  const postG=new U.CylinderGeometry(2.4,2.4,1,10),plateG=new U.BoxGeometry(20,1.6,20);postG.translate(0,.5,0);postG.userData.shared=plateG.userData.shared=true;
  M.rails.forEach(R=>{const pts=railPath(R);
    if(R.box){const ww=R.w*1.85,skin=std(R.col,{roughness:.45,metalness:.15});
      for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],L=a.distanceTo(b),mid=a.clone().add(b).multiplyScalar(.5);
        const t=add(new U.BoxGeometry(ww,2.6,L+.6),uhmw,mid.x,mid.y-1.3,mid.z);t.lookAt(b.x,b.y-1.3,b.z);
        const sh=Math.max(6,R.h+6),side=add(new U.BoxGeometry(ww-2,sh,L+.6),skin,mid.x,mid.y-2.6-sh/2,mid.z);side.lookAt(b.x,b.y-2.6-sh/2,b.z);
        [-1,1].forEach(sd=>{const c=add(new U.CylinderGeometry(1.1,1.1,L+.6,8),steel,mid.x+sd*ww/2,mid.y-.4,mid.z);c.lookAt(b.x+sd*ww/2,b.y-.4,b.z);c.rotateX(Math.PI/2);});}
      // on-ramp so you can ride straight onto a box
      const a=pts[0],gh=hAt(R.x,R.z1-60),rh=a.y-gh,rl=62,ramp=add(new U.BoxGeometry(ww,2.4,Math.hypot(rl,rh)),uhmw,R.x,(a.y+gh)/2-1.2,R.z1-rl/2);ramp.rotation.x=-Math.atan2(rh,rl);
      const wedge=add(new U.BoxGeometry(ww-2,Math.max(2,rh*.6),rl*.7),skin,R.x,gh+rh*.3-2,R.z1-rl*.35);wedge.rotation.x=-Math.atan2(rh,rl)*.5;}
    else{const curve=new U.CatmullRomCurve3(pts.map(p=>p.clone().add(new U.Vector3(0,-2,0))),false,'catmullrom',R.arch?.5:0);
      add(new U.TubeGeometry(curve,Math.max(16,pts.length*6),3.4,14,false),std(R.col,{roughness:.28,metalness:.55}),0,0,0);
      // rounded end caps
      [pts[0],pts[pts.length-1]].forEach(p=>add(new U.SphereGeometry(3.5,12,8),std(R.col,{roughness:.28,metalness:.55}),p.x,p.y-2,p.z));
      const step=R.arch?(R.z2-R.z1)/4:95;
      for(let z=R.z1+14;z<R.z2-6;z+=step){const top=R.yAt(z)-2,gh=hAt(R.x,z)-3;const po=add(postG.clone(),plate,R.x,gh,z);po.scale.y=top-gh;
        add(plateG.clone(),plate,R.x,gh+3.2,z);}
      const tz=R.z2-8,top=R.yAt(tz)-2,gh=hAt(R.x,tz)-3,po=add(postG.clone(),plate,R.x,gh,tz);po.scale.y=top-gh;}});
  // chairlift: Blender towers, sagging cables, moving chairs
  if(M.lift&&A.lift_tower){const lx=M.lift,TW=M.liftTW||[];if(!M.liftTW){for(let z=-200;z<M.len+400;z+=760)TW.push({x:lx,y:hAt(lx,z)-2,z});TW.forEach(t=>addCol(M,{x:t.x,z:t.z,y:t.y,rad:20,h:400}));}
    const tmats={paint:std(0x3b4556,{roughness:.55,metalness:.4,vertexColors:true}),steel:std(0x9aa0aa,{roughness:.35,metalness:.85,vertexColors:true}),dark:std(0x15161a,{roughness:.6,vertexColors:true}),concrete:std(0x8f9096,{roughness:.95,vertexColors:true})};
    instParts('lift_tower',TW,(d,t)=>{d.position.set(t.x,t.y,t.z);d.scale.setScalar(1);d.rotation.set(0,0,0);},tmats).forEach(m=>runG.add(m));
    const cab=std(0x1a1b1f,{roughness:.5,metalness:.6}),CH=366,cables=[];
    [-88,88].forEach(ox=>{for(let i=0;i<TW.length-1;i++){const a=TW[i],b=TW[i+1],pts=[];for(let k=0;k<=8;k++){const t=k/8;pts.push(new U.Vector3(lx+ox,a.y+(b.y-a.y)*t+CH-72*t*(1-t),a.z+(b.z-a.z)*t));}
      add(new U.TubeGeometry(new U.CatmullRomCurve3(pts),16,1.1,5,false),cab,0,0,0).castShadow=false;}});
    if(A.lift_chair){const n=Math.floor((TW[TW.length-1].z-TW[0].z)/(M.fr?520:420)),L=[];for(let i=0;i<n*2;i++)L.push({i,side:i<n?-88:88,u:(i%n)/n});
      const cm={dark:std(0x18191d,{roughness:.6,vertexColors:true}),steel:tmats.steel,seat:std(0x2a5bb8,{roughness:.55,vertexColors:true})};
      const chairs=instParts('lift_chair',L,()=>{},cm);chairs.forEach(m=>{m.castShadow=false;runG.add(m);});
      runG.userData.lift={chairs,L,TW,lx,CH,z0:TW[0].z,z1:TW[TW.length-1].z,t:0,speed:M.liftSpeed||60,step:(TW[TW.length-1].z-TW[0].z)/(TW.length-1)};}}
  // park fencing along groomed runs, start hut, floodlight towers
  if(A.fence&&['park','rails','night','mega','glacier'].includes(M.id)){const L=[];for(let z=120;z<M.finishZ+200;z+=244)[-1,1].forEach(sd=>{const x=sd*(M.hw+22);L.push({x,y:hAt(x,z),z,a:Math.PI/2});});
    instParts('fence',L,(d,t)=>{d.position.set(t.x,t.y-1,t.z);d.scale.setScalar(1);d.rotation.set(0,t.a,0);},{wood:std(0x6a4a30,{roughness:.9,vertexColors:true}),fence:std(0xff5a10,{roughness:.7,vertexColors:true}),snow:tm.snow}).forEach(m=>runG.add(m));}
  if(A.hut&&!M.fr){const hm={wood:std(0x8a5a36,{roughness:.85,vertexColors:true}),wood_dark:std(0x4a3020,{roughness:.9,vertexColors:true}),snow:tm.snow,concrete:std(0x8f9096,{roughness:.95,vertexColors:true}),
      glass:std(C.night?0xffc070:0x1a2430,{roughness:.05,metalness:.3,emissive:C.night?0xffa040:0x000000,emissiveIntensity:C.night?1.4:0,vertexColors:true})};
    [[M.hw+150,180,-.6],[-(M.hw+150),M.finishZ+260,2.2]].forEach(([x,z,a])=>{const h=part('hut');h.traverse(o=>{if(o.isMesh){o.material=hm[mname(o.material)]||tm.snow;o.castShadow=o.receiveShadow=true;}});h.position.set(x,hAt(x,z)-4,z);h.rotation.y=a;runG.add(h);addCol(M,{box:1,x,z,hx:100,hz:85,cs:Math.cos(a),sn:Math.sin(a),y:h.position.y,h:190,solid:1});});}
  if(A.light_tower&&C.night&&!M.fr){const L=[];for(let z=400;z<M.finishZ;z+=1100)[-1,1].forEach(sd=>L.push({x:sd*(M.hw+110),z,a:sd<0?Math.PI/2:-Math.PI/2}));L.forEach(t=>{t.y=hAt(t.x,t.z);addCol(M,{x:t.x,z:t.z,y:t.y,rad:22,h:600});});
    instParts('light_tower',L,(d,t)=>{d.position.set(t.x,t.y-2,t.z);d.scale.setScalar(1);d.rotation.set(0,t.a,0);},{steel:std(0x8a909a,{roughness:.4,metalness:.8,vertexColors:true}),dark:std(0x1a1b20,{roughness:.6,vertexColors:true}),concrete:std(0x8f9096,{vertexColors:true}),bulb:new U.MeshBasicMaterial({color:0xfff4dc})}).forEach(m=>runG.add(m));}
  // finish arch
  if(!M.fr){const fz=M.finishZ,fy=hAt(0,fz),arch=part('arch');arch.traverse(o=>{if(o.isMesh)o.material=mname(o.material)==='arch_a'?std(0xff4d6d,{vertexColors:true,roughness:.5}):std(0xffffff,{vertexColors:true,roughness:.5});});
  arch.position.set(0,fy,fz);runG.add(arch);
  const fc=document.createElement('canvas');fc.width=512;fc.height=64;const g=fc.getContext('2d');g.fillStyle='#14182e';g.fillRect(0,0,512,64);g.fillStyle='#ffd23f';g.font='44px Bungee,Impact,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('FINISH · DUB12',256,34);
  add(new U.PlaneGeometry(300,38),new U.MeshBasicMaterial({map:new U.CanvasTexture(fc),side:U.DoubleSide}),0,fy+150,fz).rotation.y=Math.PI;}
  // lamps
  if(C.night&&!M.fr){const L=[];for(let z=300;z<M.len;z+=420)[-1,1].forEach(sd=>{const x=sd*(M.hw-30);L.push({x,y:hAt(x,z),z,a:sd>0?-Math.PI/2:Math.PI/2});});
    instParts('lamp',L,(d,t)=>{d.position.set(t.x,t.y,t.z);d.scale.setScalar(1);d.rotation.set(0,t.a,0);},{metal:envMat('lampm',0x2a2e3a,{roughness:.5}),bulb:envMat('bulb',0xfff2b8,{emissive:0xfff2b8,emissiveIntensity:1.6})}).forEach(m=>{m.castShadow=false;runG.add(m);});}
  // mega tower
  // distant range
  // distant range sits in atmospheric haze: tint towards the fog colour so it recedes like real mountains
  const rgc=new U.Color(C.rng),rfog=new U.Color(C.fog);
  const rgm=new U.MeshBasicMaterial({color:rgc,vertexColors:true,fog:false});
  rgm.onBeforeCompile=sh=>{sh.uniforms.uFog={value:rfog};sh.vertexShader='varying float vH;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvH=position.y/1184.;');
    sh.fragmentShader='varying float vH;uniform vec3 uFog;\n'+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n diffuseColor.rgb=mix(uFog,diffuseColor.rgb*vec3(.92,.96,1.04),.22+.5*smoothstep(.05,.85,vH));');};
  const rg=part('range');rg.traverse(o=>{if(o.isMesh){o.material=rgm;o.castShadow=false;}});
  rg.scale.set(10,6.5,8);rg.rotation.y=Math.PI;runG.add(rg);runG.userData.mtn=rg;
}
