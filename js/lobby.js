/* DUB12 — lobby scene, mountain map, item thumbnails */
'use strict';
const lobby=new U.Scene();let lobbyRange=null;
const LV={quests:{p:[-95,76,440],t:[-95,66,0],f:30},leaders:{p:[-95,76,440],t:[-95,66,0],f:30},admin:{p:[-95,76,440],t:[-95,66,0],f:30},play:{p:[0,64,392],t:[0,61,0],f:30},locker:{p:[-95,76,440],t:[-95,66,0],f:30},map:{p:[0,700,1500],t:[0,300,-3600],f:44},
  shop:{p:[-147,76,480],t:[-147,66,0],f:30},pass:{p:[-150,96,420],t:[-120,70,0],f:30},design:{p:[30,30,150],t:[30,8,0],f:30}};
const lcp=new U.Vector3(0,64,392),lct=new U.Vector3(0,61,0),_v=new U.Vector3();let lfov=30;
function buildLobby(){
  lobby.fog=new U.Fog(0xdce8f6,1800,11200);
  lobby.environment=envFor('lobby','#4169b3','#f7c7ad','#b9c9e2');
  const std=(c,o)=>new U.MeshStandardMaterial(Object.assign({color:c,roughness:.85},o||{}));
  const deck=part('deck');const dm={wood:std(0x8a5a36,{vertexColors:true,roughness:.7}),wood_dark:std(0x5a3a22,{vertexColors:true,roughness:.75}),metal:std(0x2a2e3a,{vertexColors:true,roughness:.4,metalness:.6}),snow:std(0xffffff,{vertexColors:true,roughness:.9})};
  deck.traverse(o=>{if(o.isMesh){o.material=dm[mname(o.material)]||dm.snow;o.receiveShadow=true;}});lobby.add(deck);
  // world-space UVs so the snow detail matches the run scale
  const gg=new U.CircleGeometry(4200,64),guv=gg.attributes.uv,gp=gg.attributes.position;for(let i=0;i<guv.count;i++)guv.setXY(i,gp.getX(i)/64,gp.getY(i)/64);
  const gnd=new U.Mesh(gg,snowMaterial('pow'));gnd.rotation.x=-Math.PI/2;gnd.position.y=-5;gnd.receiveShadow=true;lobby.add(gnd);
  lobbySky=makeSky('linear-gradient(#3159a5 0%,#7896d0 42%,#f3c3ae 73%,#ffe7cf 100%)',{fog:0xdce8f6,cloud:.32});lobbySky.userData.setSun(new U.Vector3(320,420,360).normalize(),new U.Color(0xffddbd));lobby.add(lobbySky);
  lobbyRange=part('range');lobbyRange.traverse(o=>{if(o.isMesh){o.material=new U.MeshStandardMaterial({vertexColors:true,roughness:.95,envMapIntensity:.4});o.receiveShadow=true;}});
  lobbyRange.scale.set(4.2,1.25,3);lobbyRange.position.set(0,-40,-3600);lobby.add(lobbyRange);lobbyRange.updateMatrixWorld(true);
  const tm={needles:envMat('needles',0x1f3d33),snow:envMat('snow',0xf4f7ff,{roughness:.8}),bark:envMat('bark',0x3b2a20)};
  // A readable entrance: keep the centre open, place trees in broad outer clusters,
  // and leave a clean sightline from the rider platform to the mountain range.
  const L=[],r=rng(31);for(let k=0;k<78;k++){const a=r()*Math.PI*2,d=620+r()*980;const x=Math.sin(a)*d,z=Math.cos(a)*d;if(Math.abs(x)<560&&z>-180&&z<760)continue;L.push({x,z,s:.72+r()*.72,a:r()*6});}
  for(let k=0;k<18;k++){const x=-1120+k*132+(r()-.5)*45,z=-520+(r()-.5)*90;L.push({x,z,s:.72+r()*.55,a:r()*6});}
  const HQ=!!A.pine_hq_a;(HQ?['pine_hq_a','pine_hq_b','pine_hq_c']:['pine_a']).forEach((n,k,arr)=>{const LL=L.filter((t,i)=>i%arr.length===k);
    instParts(n,LL,(d,t)=>{d.position.set(t.x,-6,t.z);d.scale.setScalar(t.s*(HQ?.6:1));d.rotation.set(0,t.a,0);},tm).forEach(m=>lobby.add(m));});
  // compact snow banks define the plaza without adding clutter
  const bankM=snowMaterial('pow');for(const b of [[-520,-80,240,34],[520,-80,240,34],[-690,470,210,30],[690,470,210,30]]){const m=new U.Mesh(new U.SphereGeometry(1,20,10),bankM);m.scale.set(b[2],b[3],b[2]*.42);m.position.set(b[0],b[3]-5,b[1]);m.castShadow=true;m.receiveShadow=true;lobby.add(m);}
  // skis stuck in the snow
  const rack=[['s_chev',-190,-150],['s_sunset',-165,-165],['s_splat',185,-160],['s_wood',210,-140]];
  rack.forEach(([id,x,z],i)=>{[-6,6].forEach(dx=>{const s=part('ski');s.traverse(o=>{if(o.isMesh){const n=mname(o.material);o.material=n==='ski_top'?new U.MeshStandardMaterial({map:skiTex(id),roughness:.3,vertexColors:true}):std(0x15161a,{vertexColors:true});o.castShadow=true;}});
    s.scale.setScalar(1.8);s.rotation.set(-Math.PI/2+.08,(i%2?.25:-.25),dx*.012);s.position.set(x+dx*1.4,30,z);lobby.add(s);});});
  const lamp=part('lamp');lamp.traverse(o=>{if(o.isMesh)o.material=mname(o.material)==='bulb'?std(0xfff2b8,{emissive:0xffd890,emissiveIntensity:1.4,vertexColors:true}):std(0x2a2e3a,{vertexColors:true,roughness:.5});});
  lamp.position.set(118,-4,-30);lamp.rotation.y=-2.2;lamp.scale.setScalar(1.1);lobby.add(lamp);
  // simple entrance plaza: dark stone pad, warm edge light, and a straight snow path
  const pathM=new U.MeshStandardMaterial({color:0xeaf1fb,roughness:.96});const path=new U.Mesh(new U.PlaneGeometry(170,760),pathM);path.rotation.x=-Math.PI/2;path.position.set(0,-3,310);path.receiveShadow=true;lobby.add(path);
  const plat=new U.Mesh(new U.CylinderGeometry(42,44,3,48),std(0x18233a,{roughness:.48,metalness:.28}));plat.position.y=6;plat.receiveShadow=true;lobby.add(plat);
  const ring=new U.Mesh(new U.TorusGeometry(43,1.1,8,72),new U.MeshBasicMaterial({color:0xffc83d}));ring.rotation.x=Math.PI/2;ring.position.y=7.6;lobby.add(ring);
  const signCanvas=document.createElement('canvas');signCanvas.width=1024;signCanvas.height=256;const sg=signCanvas.getContext('2d');sg.fillStyle='#17233d';sg.fillRect(0,0,1024,256);sg.fillStyle='#ffd23f';sg.fillRect(28,28,968,200);sg.fillStyle='#17233d';sg.fillRect(42,42,940,172);sg.textAlign='center';sg.textBaseline='middle';sg.font='900 74px Bungee,Impact,sans-serif';sg.fillText('DUB12 ALPINE CENTER',512,112);sg.font='700 28px Inter,Arial,sans-serif';sg.fillText('RIDE  ·  LOCKER  ·  MAP',512,166);const sign=new U.Mesh(new U.PlaneGeometry(210,52),new U.MeshBasicMaterial({map:new U.CanvasTexture(signCanvas),transparent:true}));sign.position.set(0,92,-74);sign.rotation.y=Math.PI;lobby.add(sign);
  lobby.add(new U.HemisphereLight(0xdbe7ff,0x556078,.82));
  // soft frontal fill keeps the rider readable against the darker pines.
  const fill=new U.DirectionalLight(0xfff5e8,.7);fill.position.set(-180,150,260);fill.target.position.set(0,35,0);lobby.add(fill,fill.target);
  const key=new U.DirectionalLight(0xfff0e2,2.15);key.position.set(320,420,360);key.target.position.set(0,40,0);key.castShadow=true;key.shadow.mapSize.set(2048,2048);
  const kc=key.shadow.camera;kc.left=-260;kc.right=260;kc.top=260;kc.bottom=-260;kc.near=50;kc.far=1600;key.shadow.bias=-.0005;lobby.add(key,key.target);
  const rim=new U.DirectionalLight(0x8fb8ff,.72);rim.position.set(-300,200,-400);lobby.add(rim);
}
/* pins on the mountain */
const PINS={};const ray=new U.Raycaster();
function pinWorld(id){if(PINS[id])return PINS[id];const [px,pz]=MAPS[id].pin;const x=px*1000*4.2*.78,z=-3600+(-pz*420)*3;
  ray.set(new U.Vector3(x,9000,z),new U.Vector3(0,-1,0));const h=ray.intersectObject(lobbyRange,true);PINS[id]=new U.Vector3(x,h.length?h[0].point.y+30:400,z);return PINS[id];}
const _p=new U.Vector3();
function placePins(){const el=$('pins');if(el.classList.contains('hide'))return;
  for(const id in MAPS){const d=el.querySelector('[data-m="'+id+'"]');if(!d)continue;_p.copy(pinWorld(id)).project(lcam);
    d.style.transform='translate('+((_p.x*.5+.5)*W)+'px,'+((-_p.y*.5+.5)*H)+'px)';}}

/* ---------- thumbnails ---------- */
let TR=null;const THUMB={};
function thumbSetup(){
  const c=document.createElement('canvas');c.width=c.height=192;
  const r=new U.WebGLRenderer({canvas:c,antialias:true,alpha:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});r.setClearColor(0,0);
  if ('outputColorSpace' in r) r.outputColorSpace=U.SRGBColorSpace; else if ('outputEncoding' in r) r.outputEncoding=U.sRGBEncoding;
  if ('toneMapping' in r && U.ACESFilmicToneMapping!==undefined) r.toneMapping=U.ACESFilmicToneMapping;
  if ('toneMappingExposure' in r) r.toneMappingExposure=1.1;
  const sc=new U.Scene();const pm=new U.PMREMGenerator(r);
  const ec=document.createElement('canvas');ec.width=256;ec.height=128;const g=ec.getContext('2d');const gr=g.createLinearGradient(0,0,0,128);gr.addColorStop(0,'#5a7ad8');gr.addColorStop(.5,'#ffe6d0');gr.addColorStop(1,'#8fa6cf');g.fillStyle=gr;g.fillRect(0,0,256,128);
  const et=new U.CanvasTexture(ec);et.mapping=U.EquirectangularReflectionMapping;sc.environment=pm.fromEquirectangular(et).texture;
  sc.add(new U.HemisphereLight(0xffffff,0x606080,.45));const k=new U.DirectionalLight(0xffffff,.75);k.position.set(40,80,90);sc.add(k);
  const rd=makeRider();sc.add(rd.root);const cam=new U.PerspectiveCamera(28,1,1,1000);
  TR={r,sc,rd,cam,c};}
// thumbnail shots, tuned to the realistic-proportion rider (taller, head at 84%)
const FRAMES={jacket:[[22,47,78],[0,39,0]],pants:[[20,21,76],[0,16,0]],gloves:[[26,31,30],[10,24,2]],helmet:[[13.5,57.2,22],[0,53.4,1]],goggles:[[7,54.2,19.5],[0,53.3,2]],
  boots:[[22,13,22],[4.6,5,1]],hair:[[-13.5,53.6,-20],[0,51,-1]],face:[[3.4,53.2,17],[0,52.4,3]],body:[[30,36,116],[0,30,0]]};
function thumb(key,load,bd,frame,gogUp,grab){if(THUMB[key])return THUMB[key];if(!TR)thumbSetup();
  TR.rd.apply(load,bd);TR.rd.root.scale.setScalar(1);TR.rd.root.rotation.y=frame==='hair'?0:.35;
  for(let i=0;i<3;i++)TR.rd.pose(grab?{air:true,grab,crouch:.3}:{idle:true,crouch:.05,gogUp:!!gogUp},10);
  const f=FRAMES[frame];TR.cam.position.fromArray(f[0]);TR.cam.lookAt(f[1][0],f[1][1],f[1][2]);
  TR.r.render(TR.sc,TR.cam);THUMB[key]=TR.c.toDataURL('image/png');return THUMB[key];}
function itemThumb(it){
  if(it.cat==='skis')return null;
  if(it.cat==='trick')return it.k==='grab'?thumb('i_'+it.id,save.load,save.body,'body',false,it.n):null;
  if(it.cat==='mask')return thumb('i_'+it.id,Object.assign({},save.load,{mask:it.id,helmet:save.load.helmet}),save.body,'helmet',false);
  const l=Object.assign({},save.load,{[it.cat]:it.id});
  if(it.cat==='jacket'){l.gloves='g_black';}
  return thumb('i_'+it.id,l,save.body,it.cat);}
