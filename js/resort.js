/* DUB12 — Blue Mountain (free roam), laid out from the resort's 2017/18 winter trail map.
   All 43 named runs with their map difficulty, the glades, Due North / Bear Trail / Dog Sled / Yahoo connectors,
   Badlands and Grove terrain parks, a ski-cross course on L-Hill, the five high-speed six-person express lifts
   plus the Voyageur Quad and Graduate Triple, the four magic carpets, and the base lodges and buildings.
   Map pixels (1672x790 trail map) convert to world units: x=(px-836)*13, z=(py-85)*18 (summit ridge at z≈0).
   The ridge runs left (south) to right (north); downhill is +z. */
'use strict';
const MX=px=>(px-836)*13,MZ=py=>(py-85)*18;
const RS={W:11300,ZMIN:-1800,L:10700,GS:40,baseZ:8300,liftSpeed:260};
const DIFF={green:{n:'Easiest',c:'#2fbf5a',w:150},blue:{n:'More difficult',c:'#2f7fff',w:125},black:{n:'Most difficult',c:'#15161a',w:105},
  dbl:{n:'Experts only',c:'#15161a',w:92},glade:{n:'Glades',c:'#15161a',w:120},park:{n:'Terrain park',c:'#ff7a1a',w:200}};
// [name, difficulty, map points px,py top->bottom, extra]
const BM_TRAILS=[
 ["Gord's Groove",'green',[[95,110],[62,250],[70,380],[150,470],[205,540]]],["Founder",'blue',[[125,105],[118,290],[150,450],[200,535]]],
 ['Finally','green',[[160,100],[150,300],[175,450],[205,530]]],['Juicer','green',[[195,100],[200,330],[205,520]]],['Butternut','blue',[[290,100],[290,300],[300,470]]],
 ['Southern Cross','green',[[355,90],[370,200],[340,330],[320,430]]],["Mary Jane's Lane",'green',[[330,420],[305,480],[300,540]]],['Enchanted Forest','green',[[335,425],[330,470],[340,540]]],
 ['Big Baby','green',[[365,410],[375,470],[385,530]]],['Explorer','green',[[395,505],[397,560]]],['Little Ripper','green',[[420,500],[425,560]]],
 ['Waterfall','blue',[[405,95],[408,260],[415,500]]],['Crooked Oak','black',[[440,95],[432,280],[455,500]]],['Sunrise','blue',[[472,95],[478,300],[485,520]]],
 ['Cruiser','blue',[[505,90],[508,300],[515,525]]],['Dr. Doug','blue',[[590,105],[615,230],[640,520]]],['L-Hill','blue',[[650,95],[655,330],[660,520]],{skix:1}],
 ['Rinus Run','black',[[690,92],[700,300],[700,520]]],['Memory Lane','black',[[730,92],[735,330],[740,520]]],['Tranquility','blue',[[780,92],[790,300],[795,525]]],
 ['Smart Alec','blue',[[870,92],[875,310],[880,520]]],['Village Way','blue',[[930,330],[960,420],[990,520]]],['Easy Rider','green',[[900,450],[925,500],[950,560]]],
 ['Undergrad','green',[[945,470],[955,520],[975,560]]],['Graduate','green',[[1000,440],[1015,490],[1025,560]]],['Legacy','blue',[[985,95],[990,300],[1000,480]]],
 ['Apple Bowl','blue',[[1020,95],[1025,270],[1035,480]]],['Calamity Lane','dbl',[[1060,92],[1065,245],[1070,500]]],['Burner','black',[[1100,92],[1100,250],[1105,500]]],
 ["Willy's",'black',[[1135,92],[1135,240],[1140,500]]],['Happy Valley','green',[[1170,100],[1185,300],[1190,520]],{slow:1}],["Hog's Back",'black',[[1240,110],[1255,300],[1270,520]]],
 ['Elevator Shaft','black',[[1320,130],[1330,320],[1340,520]]],['Avalanche','dbl',[[1352,140],[1360,300],[1368,520]]],['Spectacular','dbl',[[1382,130],[1390,300],[1396,520]]],
 ['Little Devil','black',[[1410,130],[1415,320],[1420,520]]],['Senator/Larway','black',[[1405,100],[1430,140],[1445,260],[1450,520]]],["Rabbit's Run",'black',[[1460,100],[1470,140],[1480,300],[1500,520]]],
 ['Lone Rider','black',[[1460,200],[1465,280],[1470,520]]],['Starting Gate','black',[[1485,150],[1490,320],[1495,520]]],['Schuss','blue',[[1525,120],[1530,280],[1535,520]]],
 ['Kandahar','black',[[1570,110],[1575,290],[1580,520]]],
 ['Badlands Terrain Park','park',[[245,190],[240,320],[238,425]],{park:'big'}],['Grove Terrain Park','park',[[240,432],[236,490],[232,540]],{park:'small'}],
 ['Upper Orchard Glades','glade',[[230,95],[218,140],[210,210]]],['Lower Orchard Glades','glade',[[40,255],[45,320],[62,385]]],['Old South Glades','glade',[[545,200],[558,260],[566,335]]],
 ['Showcase Glades','glade',[[832,105],[840,300],[850,450]]],['Village Glades','glade',[[922,98],[928,140],[935,205]]],['Going South Glades','glade',[[1268,100],[1300,135],[1330,175]]],
 ['North Glades','glade',[[1418,80],[1426,105],[1432,140]]],
 ['Bear Trail','black',[[520,130],[540,160],[560,195]]],['Yahoo','black',[[905,150],[915,190],[928,245]]],['Dog Sled','blue',[[1212,330],[1232,355],[1252,385]]]];
// traverses along the ridge top (constant z): Due North
const BM_TRAV=[{n:'Due North',d:'green',x1:MX(830),x2:MX(1250),z:MZ(86),w:70,slow:1}];
// lifts: express six-packs run ridge top to base; the quad and triple serve the beginner areas
const BM_LIFTS=[{n:'Orchard Express',num:1,px:245,t:88,b:545},{n:'Voyageur Quad',num:2,px:360,t:420,b:535},{n:'Southern Comfort Express',num:5,px:500,t:88,b:535},
  {n:'Silver Bullet Express',num:6,px:812,t:92,b:540},{n:'Graduate Triple',num:9,px:1012,t:445,b:560},{n:'Century Express',num:10,px:1097,t:82,b:545},{n:'Weider Express',num:11,px:1402,t:82,b:535}];
const BM_CARPETS=[{n:'Explorer Magic Carpet',num:3,px:393,t:505,b:560},{n:'Little Ripper Magic Carpet',num:4,px:425,t:500,b:560},{n:'Easy Rider Magic Carpet',num:7,px:915,t:480,b:560},{n:'Undergrad Magic Carpet',num:8,px:962,t:480,b:560}];
const BM_BUILDINGS=[['lodge','South Base Lodge',470,525,0],['chalet','Resort Operations Centre',600,545,0],['lodge','Grand Central Lodge',830,552,0],['lodge','Westin Trillium House',680,598,.1],
  ['chalet','Weider Lodge',770,610,0],['lodge','The Grand Georgian',810,592,0],['chalet','Cachet Crossing',940,598,0],['lodge','Blue Mountain Inn',1120,598,0],
  ['chalet','Chateau Ridge',1200,522,.2],['chalet','Chateau Ridge',1225,545,.2],['hut','Guest Services',1190,582,0],['lodge','Toronto Ski Club',1478,556,0],
  ['chalet','Collingwood Ski Club',1470,598,0],['lodge','Mountain Springs Resort',1560,562,0],['chalet','Village',720,585,0],['chalet','Village',745,600,0],['hut','Woodview Mountaintop Skating',330,48,0]];
const ssR=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
const sm01=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
function trailX(T,z){const P=T.pts;if(z<=P[0][1])return P[0][0];for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1];if(z<=b[1]){const t=(z-a[1])/(b[1]-a[1]),s=t*t*(3-2*t)*.35+t*.65;return a[0]+(b[0]-a[0])*s+T.a2*Math.sin(z*T.f2+T.p2);}}return P[P.length-1][0];}

/* ---------- height ---------- */
function rsSlope(z){if(z<150)return .02;if(z<550)return .02+.34*sm01((z-150)/400);if(z<6200)return .36+.05*Math.sin(z*.0011)+.03*Math.sin(z*.0031+1.3);
  if(z<7600)return .12+.24*(1-sm01((z-6200)/1400));if(z<RS.baseZ)return .04+.08*(1-sm01((z-7600)/(RS.baseZ-7600)));return .02;}
function gIdx(x,z){return [Math.max(0,Math.min(map.gnx-1.001,(x+RS.W)/RS.GS)),Math.max(0,Math.min(map.gnz-1.001,(z-RS.ZMIN)/RS.GS))];}
function resortH(x,z){const M=map,G=M.grid,[fx,fz]=gIdx(x,z),i=fx|0,j=fz|0,tx=fx-i,tz=fz-j,n=M.gnx;
  const a=G[j*n+i],b=G[j*n+i+1],c=G[(j+1)*n+i],d=G[(j+1)*n+i+1];let h=a+(b-a)*tx+(c-a)*tz+(a-b-c+d)*tx*tz;
  const L=M.fb[Math.floor((z-RS.ZMIN)/500)];if(L)for(const F of L){if(z<F.zA||z>F.zB)continue;const sx=x-F.cx;if(Math.abs(sx)>F.hw+40)continue;h+=featDelta(F,sx,z-F.z0);}
  return h;}
function featDelta(F,sx,u){const dx=Math.abs(sx),w=1-ssR(F.hw,F.hw+34,dx);if(w<=0)return 0;let d=0;
  if(F.t==='kick'){if(u>=-F.L&&u<=0)d=F.H*Math.pow((u+F.L)/F.L,2);else if(u>0&&u<=F.T)d=F.Ht;else if(u>F.T&&u<=F.T+F.LL)d=F.Ht*(1-sm01((u-F.T)/F.LL));}
  else if(F.t==='roller'){if(u>=0&&u<=F.len)d=F.H*Math.pow(Math.sin(Math.PI*u/F.len),2);}
  else if(F.t==='berm'){if(u>=0&&u<=F.len)return F.H*ssR(.15,1,sx*F.side/F.hw)*Math.sin(Math.PI*u/F.len)*(dx<F.hw+34?1:0);}
  return d*w;}

/* ---------- build ---------- */
function buildResort(){
  const r=rng(1212),M={id:'resort',fr:1,ys:[0],feat:[],rails:[],lips:[],trees:[],cliffs:[],pillows:[],stairs:[],decor:[],noise:0,hw:RS.W-300,lim:RS.W-150,
    len:RS.L,finishZ:Infinity,stopZ:RS.L-500,trails:[],trav:BM_TRAV,F:[],fb:{},signs:[],bldg:[],cliffRocks:[],lifts:[],carpets:[],lift:0,gates:[]};
  map=M;
  M.trails=BM_TRAILS.map(([n,d,pts,ex])=>{const T=Object.assign({n,d,pts:pts.map(([px,py])=>[MX(px),MZ(py)]),a2:12+r()*16,f2:.0016+r()*.0008,p2:r()*6.28},ex||{});
    T.w=DIFF[d].w*(.9+r()*.2);T.zs=T.pts[0][1];T.ze=T.pts[T.pts.length-1][1];T.glade=d==='glade';return T;});
  // grid: escarpment profile, gentle undulation, groomed runs, rough glades and forest floor
  const gs=RS.GS,nx=M.gnx=Math.round(2*RS.W/gs)+1,nz=M.gnz=Math.round((RS.L-RS.ZMIN)/gs)+1,G=M.grid=new Float32Array(nx*nz),GR=M.groom=new Float32Array(nx*nz),GL=M.glade=new Uint8Array(nx*nz);
  const Y=new Float32Array(nz);for(let j=1;j<nz;j++)Y[j]=Y[j-1]+rsSlope(RS.ZMIN+(j-.5)*gs)*gs;
  for(let j=0;j<nz;j++){const z=RS.ZMIN+j*gs,m=ssR(200,900,z)*(1-ssR(RS.baseZ-900,RS.baseZ,z));
    const tc=M.trails.filter(T=>z>T.zs-150&&z<T.ze+150).map(T=>[trailX(T,z),T.w,T]);
    for(let i=0;i<nx;i++){const x=-RS.W+i*gs;let g=0,gl=0;
      for(const [c,w,T] of tc){const d=Math.abs(x-c);if(d>w+80)continue;const e=ssR(T.zs-150,T.zs,z)*(1-ssR(T.ze,T.ze+150,z)),v=(1-ssR(w,w+70,d))*e;if(T.glade){gl=Math.max(gl,v);}else g=Math.max(g,v);}
      for(const t of M.trav){if(x>t.x1-60&&x<t.x2+60)g=Math.max(g,1-ssR(t.w,t.w+60,Math.abs(z-t.z)));}
      const ax=Math.abs(x)/RS.W;
      let h=-Y[j]+900*Math.pow(ax,6)+Math.max(0,(Math.abs(x)-(RS.W-500))/300)**2*900;
      h+=m*(60*Math.sin(x*.0021+z*.0004+1)*Math.sin(z*.0009)+30*Math.sin(x*.0047-z*.0013));
      h+=m*(1-g)*(1+gl*.6)*(16*Math.sin(x*.023+z*.007)*Math.sin(z*.019-x*.004)+9*Math.sin(x*.051)*Math.sin(z*.043+1)+6*Math.sin(x*.11+z*.09));
      G[j*nx+i]=h;GR[j*nx+i]=g;GL[j*nx+i]=gl>.3?1:0;}}
  const at=(A_,x,z)=>{const gi=Math.max(0,Math.min(nx-1,Math.round((x+RS.W)/gs))),gj=Math.max(0,Math.min(nz-1,Math.round((z-RS.ZMIN)/gs)));return A_[gj*nx+gi];};
  // terrain parks (Badlands: M/L/XL, Grove: S/M) and the L-Hill ski-cross course
  const KS={S:{H:16,L:90,T:50,LL:210,Ht:12,hw:70},M:{H:28,L:140,T:110,LL:330,Ht:22,hw:85},L:{H:44,L:200,T:200,LL:490,Ht:36,hw:100},XL:{H:58,L:240,T:280,LL:600,Ht:48,hw:110}};
  const PCOL=[0x3aa0ff,0xff4d6d,0xffd23f,0x39d98a,0xb36bff,0xff7a1a,0x58d7ff];
  const kick=(T,z,sz,col,off)=>{const k=KS[sz],cx=trailX(T,z)+(off||0),zA=z-k.L-10,zB=z+k.T+k.LL+10;M.F.push(Object.assign({t:'kick',cx,z0:z,zA,zB,trail:T.n},k));M.lips.push({z1:z-k.L*.35,z2:z,cx,hw:k.hw,col:col||0x3aa0ff});return k.L+k.T+k.LL;};
  const rail=(T,z,len,off,h,box,col,arch)=>{const x=trailX(T,z)+off;M.rails.push({x,z1:z,z2:z+len,h:h*1.55,box:!!box,col,w:box?34:19,arch:arch||0,trail:T.n});};
  M.trails.forEach(T=>{
    if(T.park==='big'){let z=T.zs+300,k=0;const seq=['M','rails','L','box','XL','arch','L'];
      while(z<T.ze-500){const s=seq[k++%seq.length],c=PCOL[k%7];if(KS[s])z+=kick(T,z,s,c)+120;else if(s==='rails'){rail(T,z,380,-55,20,0,c);rail(T,z,380,55,14,1,PCOL[(k+2)%7]);z+=560;}
        else if(s==='box'){rail(T,z,340,0,14,1,c);z+=520;}else{rail(T,z,400,-50,18,0,c,40);rail(T,z,400,55,22,0,PCOL[(k+3)%7]);z+=560;}}}
    else if(T.park==='small'){let z=T.zs+150,k=0;const seq=['S','box','M','rails','S'];
      while(z<T.ze-300){const s=seq[k++%seq.length],c=PCOL[k%7];if(KS[s])z+=kick(T,z,s,c)+100;else if(s==='box'){rail(T,z,260,0,10,1,c);z+=400;}else{rail(T,z,280,-45,12,1,c);rail(T,z,280,45,14,0,PCOL[(k+1)%7]);z+=420;}}}
    else if(T.skix){// ski cross: start gate, roller sets, alternating banked berms, a couple of step-down jumps
      let z=T.zs+260,side=1,k=0;M.gates.push({x:trailX(T,T.zs+120),z:T.zs+120,T});
      while(z<T.ze-500){const s=['rollers','berm','kick','rollers','berm','berm'][k++%6],cx=trailX(T,z);
        if(s==='rollers'){for(let q=0;q<3;q++){M.F.push({t:'roller',cx,z0:z,zA:z,zB:z+150,len:150,H:13,hw:T.w*.9,trail:T.n});z+=165;}z+=120;}
        else if(s==='berm'){M.F.push({t:'berm',cx,z0:z,zA:z,zB:z+520,len:520,H:46,hw:T.w*.95,side,trail:T.n});side=-side;z+=600;}
        else{z+=kick(T,z,'S',0x58d7ff)+140;}}}});
  M.F.forEach(F=>{for(let k=Math.floor((F.zA-RS.ZMIN)/500);k<=Math.floor((F.zB-RS.ZMIN)/500);k++)(M.fb[k]=M.fb[k]||[]).push(F);});
  // buildings (box colliders), named
  const SZ={lodge:[300,165,520],chalet:[115,140,270],hut:[105,90,190],lift_station:[150,125,300]};
  const B=(name,x,z,rot,label)=>{const s=SZ[name];M.bldg.push({name,x,z,rot,hx:s[0],hz:s[1],h:s[2],label});};
  BM_BUILDINGS.forEach(([k,label,px,py,rot])=>B(k,MX(px),MZ(py),rot,label));
  // lifts (straight lines down the fall line, stations at both ends) and magic carpets
  BM_LIFTS.forEach((Ld,li)=>{const x=MX(Ld.px),top=MZ(Ld.t),base=MZ(Ld.b),len=base-150-(top+150),n=Math.max(2,Math.ceil(len/800)),TW=[];
    for(let k=0;k<=n;k++)TW.push({x,y:0,z:top+150+len*k/n});M.lifts.push({i:li,n:Ld.n,num:Ld.num,x,top,base,TW,step:len/n,six:/Express/.test(Ld.n)});
    B('lift_station',x,top-60,0);B('lift_station',x,base+60,Math.PI);});
  BM_CARPETS.forEach(c=>M.carpets.push({n:c.n,x:MX(c.px),z1:MZ(c.t),z2:MZ(c.b)}));
  // signs: run name + difficulty at the top of every run, mid-run on long ones; glade, slow-zone and ski-cross signs
  M.trails.forEach(T=>{const side=(T.pts[0][0]>0?-1:1);for(let z=T.zs+90;z<T.ze-400;z+=4200){const x=trailX(T,z)+side*(T.w*.62+30);M.signs.push({x,z,T});}
    if(T.glade||T.d==='dbl')M.signs.push({x:trailX(T,T.zs+150)-side*(T.w*.62+30),z:T.zs+150,danger:'glades'});
    if(T.slow)M.signs.push({x:trailX(T,T.zs+500)-side*(T.w*.62+30),z:T.zs+500,danger:'slow'});
    if(T.skix)M.signs.push({x:trailX(T,T.zs+60)-side*(T.w*.62+30),z:T.zs+60,danger:'skix'});});
  M.trav.forEach(t=>M.signs.push({x:t.x1+120,z:t.z-t.w-40,danger:'slow'}));
  // trees: dense forest between runs, thinned glades, open summit farmland and village
  for(let z=RS.ZMIN+60;z<RS.L-80;z+=88)for(let x=-RS.W+60;x<RS.W-60;x+=88){const tx=x+(r()-.5)*70,tz=z+(r()-.5)*70;
    if(at(GR,tx,tz)>.06)continue;const glade=at(GL,tx,tz);
    const p=tz<120?.05:tz>RS.baseZ-150?.07:glade?.32:.72;
    if(M.lifts.some(L=>Math.abs(tx-L.x)<180&&tz>L.top-200&&tz<L.base+200))continue;if(M.carpets.some(c=>Math.abs(tx-c.x)<90&&tz>c.z1-60&&tz<c.z2+60))continue;
    if(M.bldg.some(b=>Math.abs(tx-b.x)<b.hx+90&&Math.abs(tz-b.z)<b.hz+90))continue;if(M.signs.some(s=>Math.hypot(s.x-tx,s.z-tz)<60))continue;
    if(r()<p)M.trees.push({x:tx,z:tz,s:.8+r()*.9});}
  M.buckets={};
  M.trees.forEach(t=>{t.y=resortH(t.x,t.z);t.rad=10*t.s+4;t.h=70*t.s;addCol(M,t);});
  M.bldg.forEach(b=>{b.y=Math.min(...[[-1,-1],[1,-1],[-1,1],[1,1]].map(([a,c])=>resortH(b.x+a*b.hx*.8,b.z+c*b.hz*.8)))-3;
    addCol(M,{box:1,x:b.x,z:b.z,hx:b.hx,hz:b.hz,cs:Math.cos(b.rot),sn:Math.sin(b.rot),y:b.y,h:b.h,solid:1});});
  M.lifts.forEach(L=>L.TW.forEach(t=>{t.y=resortH(t.x,t.z)-2;addCol(M,{x:t.x,z:t.z,y:t.y,rad:22,h:400});}));
  M.signs.forEach(s=>{s.y=resortH(s.x,s.z);addCol(M,{x:s.x,z:s.z,y:s.y,rad:7,h:60});});
  const cl01=v=>Math.max(0,Math.min(1,v));
  M.rails.forEach(R=>{R.yAt=z=>resortH(R.x,z)+R.h+R.arch*Math.sin(Math.PI*cl01((z-R.z1)/(R.z2-R.z1)));R.name=R.box?'Box':R.arch?'Rainbow Rail':'Rail';});
  return M;}

/* ---------- graphics ---------- */
function geoView(src,center,radius){const g=new U.BufferGeometry();for(const k in src.attributes)g.setAttribute(k,src.attributes[k]);g.setIndex(src.index);
  src.groups.forEach(gr=>g.addGroup(gr.start,gr.count,gr.materialIndex));g.boundingSphere=new U.Sphere(center,radius);return g;}
function instChunks(names,list,fn,matsFor,size){const chunks={},d=new U.Object3D(),out=[];
  list.forEach(t=>{const k=Math.floor(t.x/size)+'_'+Math.floor(t.z/size);(chunks[k]=chunks[k]||[]).push(t);});
  for(const k in chunks){const L=chunks[k],cx=L.reduce((a,t)=>a+t.x,0)/L.length,cz=L.reduce((a,t)=>a+t.z,0)/L.length,cy=L.reduce((a,t)=>a+t.y,0)/L.length;
    const C={cx,cz,lv:[]};
    names.forEach((lvNames,li)=>{const ms=[];lvNames.forEach((name,ni)=>{const sub=L.filter((t,i)=>i%lvNames.length===ni);if(!sub.length||!A[name])return;
      const src=A[name],meshes=[];src.traverse(o=>{if(o.isMesh)meshes.push(o);});
      meshes.forEach(m=>{const im=new U.InstancedMesh(geoView(m.geometry,new U.Vector3(cx,cy+200,cz),size*.75+450),matsFor(ni)[mname(m.material)]||envMat('x',0xffffff),sub.length);
        sub.forEach((t,i)=>{fn(d,t,i);d.updateMatrix();im.setMatrixAt(i,d.matrix);});im.instanceMatrix.needsUpdate=true;im.castShadow=li===0;im.receiveShadow=true;im.frustumCulled=true;runG.add(im);ms.push(im);out.push(im);});});
      C.lv.push(ms);});
    (runG.userData.lod=runG.userData.lod||[]).push(C);}
  return out;}
function updateLod(){const L=runG&&runG.userData.lod;if(!L)return;const x=cam.position.x,z=cam.position.z;
  for(const C of L){const d=Math.hypot(C.cx-x,C.cz-z),hq=d<1500;C.lv[0].forEach(m=>m.visible=hq);if(C.lv[1])C.lv[1].forEach(m=>m.visible=!hq&&d<17000);}}
function diffIcon(g,d,sx,sy,sc){sc=sc||1;g.fillStyle=DIFF[d].c;
  if(d==='green'){g.beginPath();g.arc(sx,sy,46*sc,0,7);g.fill();}
  else if(d==='blue')g.fillRect(sx-44*sc,sy-44*sc,88*sc,88*sc);
  else if(d==='black'||d==='dbl'||d==='glade'){const dd=ox=>{g.beginPath();g.moveTo(ox,sy-50*sc);g.lineTo(ox+40*sc,sy);g.lineTo(ox,sy+50*sc);g.lineTo(ox-40*sc,sy);g.fill();};if(d!=='black'){dd(sx-26*sc);dd(sx+26*sc);}else dd(sx);}
  else{g.beginPath();g.rect(sx-56*sc,sy-36*sc,112*sc,72*sc);g.fill();g.fillStyle='#fff';g.font=(34*sc)+'px Bungee,Impact,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('PARK',sx,sy+2);}}
function signTex(T){const c=document.createElement('canvas');c.width=512;c.height=192;const g=c.getContext('2d');
  g.fillStyle='#f4f1ea';g.fillRect(0,0,512,192);g.strokeStyle='#2a2a30';g.lineWidth=10;g.strokeRect(5,5,502,182);diffIcon(g,T.d,96,96);
  g.fillStyle='#16171c';g.textAlign='left';g.textBaseline='middle';let fs=58;g.font=fs+'px Bungee,Impact,sans-serif';while(g.measureText(T.n.toUpperCase()).width>340&&fs>22){fs-=2;g.font=fs+'px Bungee,Impact,sans-serif';}
  g.fillText(T.n.toUpperCase(),168,82);g.font='bold 24px Inter,sans-serif';g.fillStyle='#55565e';g.fillText((T.skix?'SKI CROSS · ':'')+DIFF[T.d].n.toUpperCase(),170,140);
  return new U.CanvasTexture(c);}
const DANGER_TEX={};
function dangerTex(kind){if(DANGER_TEX[kind])return DANGER_TEX[kind];const c=document.createElement('canvas');c.width=512;c.height=512;const g=c.getContext('2d');
  g.fillStyle=kind==='skix'?'#ff7a1a':'#ffd21f';g.save();g.translate(256,256);g.rotate(Math.PI/4);g.fillRect(-172,-172,344,344);g.lineWidth=16;g.strokeStyle='#141416';g.strokeRect(-160,-160,320,320);g.restore();
  g.fillStyle='#141416';g.textAlign='center';g.textBaseline='middle';g.font='56px Bungee,Impact,sans-serif';
  if(kind==='slow'){g.fillText('SLOW',256,226);g.fillText('ZONE',256,284);}
  else if(kind==='skix'){g.fillText('SKI',256,214);g.fillText('CROSS',256,272);g.font='bold 26px Inter,sans-serif';g.fillText('L-HILL COURSE',256,326);}
  else{g.fillText('GLADES',256,226);g.font='bold 28px Inter,sans-serif';g.fillText('EXPERTS ONLY',256,282);}
  return DANGER_TEX[kind]=new U.CanvasTexture(c);}
function labelTex(text){const c=document.createElement('canvas');c.width=1024;c.height=128;const g=c.getContext('2d');g.fillStyle='#14182e';g.fillRect(0,0,1024,128);g.strokeStyle='#ffd23f';g.lineWidth=6;g.strokeRect(6,6,1012,116);
  g.fillStyle='#ffd23f';let fs=64;g.font=fs+'px Bungee,Impact,sans-serif';while(g.measureText(text.toUpperCase()).width>960&&fs>24){fs-=2;g.font=fs+'px Bungee,Impact,sans-serif';}g.textAlign='center';g.textBaseline='middle';g.fillText(text.toUpperCase(),512,68);return new U.CanvasTexture(c);}
function buildResortGfx(M,C,add,std,tm){
  const nx=M.gnx,nz=M.gnz,gs=RS.GS,pos=new Float32Array(nx*nz*3),col=new Float32Array(nx*nz*3),uv=new Float32Array(nx*nz*2),idx=new Uint32Array((nx-1)*(nz-1)*6);
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i,o=k*3,x=-RS.W+i*gs,z=RS.ZMIN+j*gs,g=M.groom[k];pos[o]=x;pos[o+1]=M.grid[k];pos[o+2]=z;
    const v=.93+.07*g,w=Math.sin(x*.004+z*.002)*.02;col[o]=v-.02+w;col[o+1]=v-.005+w;col[o+2]=1;uv[k*2]=x/64;uv[k*2+1]=z/64;}
  let q=0;for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){const a=j*nx+i,b=a+1,c=a+nx,d=c+1;idx[q++]=a;idx[q++]=c;idx[q++]=b;idx[q++]=b;idx[q++]=c;idx[q++]=d;}
  const tg=new U.BufferGeometry();tg.setAttribute('position',new U.BufferAttribute(pos,3));tg.setAttribute('color',new U.BufferAttribute(col,3));tg.setAttribute('uv',new U.BufferAttribute(uv,2));
  tg.setIndex(new U.BufferAttribute(idx,1));tg.computeVertexNormals();const terr=new U.Mesh(tg,snowMaterial('pow',{vc:true}));terr.receiveShadow=true;runG.add(terr);
  // feature patches at fine resolution (park jumps, ski-cross rollers and berms)
  const pm=snowMaterial('cord',{vc:true});pm.polygonOffset=true;pm.polygonOffsetFactor=-2;pm.polygonOffsetUnits=-2;const lc=new U.Color();
  M.F.forEach(F=>{const st=6,x0=F.cx-F.hw-40,x1=F.cx+F.hw+40,z0=F.zA,z1=F.zB,pnx=Math.ceil((x1-x0)/st)+1,pnz=Math.ceil((z1-z0)/st)+1;
    const P=new Float32Array(pnx*pnz*3),Cc=new Float32Array(pnx*pnz*3),UV=new Float32Array(pnx*pnz*2),I=new Uint32Array((pnx-1)*(pnz-1)*6);
    const lip=F.t==='kick'?M.lips.find(l=>l.cx===F.cx&&l.z2===F.z0):null;if(lip)lc.setHex(lip.col);
    for(let j=0;j<pnz;j++)for(let i=0;i<pnx;i++){const x=x0+i*st,z=Math.min(z1,z0+j*st),k=j*pnx+i;P[k*3]=x;P[k*3+1]=resortH(x,z)+.3;P[k*3+2]=z;
      let cr=1,cg=1,cb=1;if(lip&&z>=lip.z1&&z<=lip.z2&&Math.abs(x-F.cx)<=F.hw){cr=lc.r*.8+.2;cg=lc.g*.8+.2;cb=lc.b*.8+.2;}Cc[k*3]=cr;Cc[k*3+1]=cg;Cc[k*3+2]=cb;UV[k*2]=x/64;UV[k*2+1]=z/64;}
    let n=0;for(let j=0;j<pnz-1;j++)for(let i=0;i<pnx-1;i++){const a=j*pnx+i,b=a+1,c=a+pnx,d=c+1;I[n++]=a;I[n++]=c;I[n++]=b;I[n++]=b;I[n++]=c;I[n++]=d;}
    const g=new U.BufferGeometry();g.setAttribute('position',new U.BufferAttribute(P,3));g.setAttribute('color',new U.BufferAttribute(Cc,3));g.setAttribute('uv',new U.BufferAttribute(UV,2));g.setIndex(new U.BufferAttribute(I,1));g.computeVertexNormals();
    const me=new U.Mesh(g,pm);me.receiveShadow=true;me.castShadow=true;runG.add(me);});
  // trees with LOD
  const tmB=Object.assign({},tm,{needles:envMat('needles',C.tree[1],{roughness:.85})});
  const tf=(d,t)=>{d.position.set(t.x,t.y-6,t.z);d.scale.setScalar(t.s*.62);d.rotation.set(0,t.x*.37+t.z*.11,Math.sin(t.x*.13+t.z)*.03);};
  instChunks([A.pine_hq_a?['pine_hq_a','pine_hq_b','pine_hq_c']:['pine_a','pine_b'],A.pine_lod?['pine_lod']:['pine_a']],M.trees,tf,ni=>ni===1?tmB:tm,1500);
  // buildings + name boards
  const night=!!C.night,bm={wood:std(0x8a5a36,{roughness:.85,vertexColors:true}),wood_dark:std(0x4a3020,{roughness:.9,vertexColors:true}),snow:tm.snow,concrete:std(0x8f9096,{roughness:.95,vertexColors:true}),
    glass:std(0xffc98a,{roughness:.08,metalness:.2,emissive:0xffa850,emissiveIntensity:night?1.5:.55,vertexColors:true}),steel:std(0x9aa0aa,{roughness:.35,metalness:.85,vertexColors:true}),
    paint:std(0x3b4556,{roughness:.55,metalness:.4,vertexColors:true}),dark:std(0x15161a,{roughness:.6,vertexColors:true})};
  M.bldg.forEach(b=>{if(!A[b.name])return;const o=part(b.name);o.traverse(m=>{if(m.isMesh){m.material=bm[mname(m.material)]||tm.snow;m.castShadow=m.receiveShadow=true;}});o.position.set(b.x,b.y,b.z);o.rotation.y=b.rot;runG.add(o);
    if(b.label){const h=b.name==='lodge'?260:b.name==='chalet'?170:150,bd=add(new U.PlaneGeometry(b.label.length>14?300:220,34),new U.MeshBasicMaterial({map:labelTex(b.label),side:U.DoubleSide}),b.x,b.y+h,b.z-b.hz-12);bd.rotation.y=Math.PI;}});
  // Woodview mountaintop skating rink
  {const x=MX(330),z=MZ(40),y=resortH(x,z)+1;const ice=add(new U.CircleGeometry(220,48),std(0xcfe8ff,{roughness:.08,metalness:.1}),x,y,z);ice.rotation.x=-Math.PI/2;ice.castShadow=false;}
  // signs
  const post=std(0x5a3a22,{roughness:.9}),back=std(0x2a2a30,{roughness:.7}),dpost=std(0x2a2e3a,{roughness:.5,metalness:.4});
  M.signs.forEach(s=>{if(s.danger){add(new U.CylinderGeometry(1.8,1.8,96,8),dpost,s.x,s.y+46,s.z);
      const f=add(new U.PlaneGeometry(64,64),new U.MeshStandardMaterial({map:dangerTex(s.danger),roughness:.6,transparent:true,alphaTest:.5,side:U.DoubleSide}),s.x,s.y+92,s.z-2.2);f.rotation.y=Math.PI;return;}
    add(new U.CylinderGeometry(2.2,2.6,64,8),post,s.x,s.y+30,s.z);
    const b=add(new U.BoxGeometry(84,32,2.4),back,s.x,s.y+64,s.z);b.rotation.y=Math.PI;
    const f=add(new U.PlaneGeometry(82,30.75),new U.MeshStandardMaterial({map:signTex(s.T),roughness:.6}),s.x,s.y+64,s.z-1.4);f.rotation.y=Math.PI;});
  // ski-cross start gate + course fencing along L-Hill
  M.gates.forEach(gt=>{const T=gt.T,y=resortH(gt.x,gt.z),w=T.w*.9,mat=std(0x1d6fd8,{roughness:.5}),bar=std(0xe9edf3,{roughness:.4});
    add(new U.BoxGeometry(w*2,10,30),mat,gt.x,y+5,gt.z);for(let k=0;k<5;k++)add(new U.BoxGeometry(3,40,3),bar,gt.x-w+k*w/2,y+28,gt.z+12);
    add(new U.BoxGeometry(w*2,12,4),mat,gt.x,y+52,gt.z+12);const bd=add(new U.PlaneGeometry(w*1.6,22),new U.MeshBasicMaterial({map:labelTex('L-Hill Ski Cross'),side:U.DoubleSide}),gt.x,y+68,gt.z+12);bd.rotation.y=Math.PI;
    if(A.fence){const L=[];for(let z=T.zs+300;z<T.ze-200;z+=244)[-1,1].forEach(sd=>{const x=trailX(T,z)+sd*(T.w+30);L.push({x,y:resortH(x,z),z});});
      instParts('fence',L,(d,t)=>{d.position.set(t.x,t.y-1,t.z);d.scale.setScalar(1);d.rotation.set(0,Math.PI/2,0);},{wood:std(0x6a4a30,{roughness:.9,vertexColors:true}),fence:std(0xff5a10,{roughness:.7,vertexColors:true}),snow:tm.snow}).forEach(m=>runG.add(m));}});
  // magic carpets (conveyor belts with covers)
  M.carpets.forEach(c=>{const z1=c.z1,z2=c.z2,len=z2-z1,mid=(z1+z2)/2,y1=resortH(c.x,z1),y2=resortH(c.x,z2);const belt=add(new U.BoxGeometry(26,3,len),std(0x2a2d33,{roughness:.6}),c.x,(y1+y2)/2+1.5,mid);belt.rotation.x=Math.atan2(y1-y2,len);
    const cover=add(new U.BoxGeometry(34,22,len),new U.MeshStandardMaterial({color:0xbfd8f0,roughness:.2,transparent:true,opacity:.35}),c.x,(y1+y2)/2+12,mid);cover.rotation.x=belt.rotation.x;cover.castShadow=false;});
  buildResortLifts(M,add,std);
  // distant ridges for views (hazed)
  if(A.range){const hz=new U.Color(C.fog);const pk=new U.MeshBasicMaterial({color:new U.Color(0xf4f7ff).lerp(hz,.4),vertexColors:true,fog:false});
    [[0,-14000,10,4.5,9,0],[-19000,4000,7,4,7,Math.PI/2],[19000,4000,7,4,7,-Math.PI/2]].forEach(([x,z,sx,sy,sz,ry])=>{const g=part('range');g.traverse(o=>{if(o.isMesh){o.material=pk;o.castShadow=false;}});g.position.set(x,-900-sy*80,z);g.scale.set(sx,sy,sz);g.rotation.y=ry;runG.add(g);});}
  // Georgian Bay beyond the village (flat frozen water)
  {const bay=add(new U.PlaneGeometry(60000,30000),new U.MeshStandardMaterial({color:0xa9c4dd,roughness:.15,metalness:.1}),0,resortH(0,RS.L-200)-40,RS.L+15000);bay.rotation.x=-Math.PI/2;bay.castShadow=false;}
  const bc=document.createElement('canvas');bc.width=1024;bc.height=160;const g=bc.getContext('2d');g.fillStyle='#14182e';g.fillRect(0,0,1024,160);g.fillStyle='#ffd23f';g.font='78px Bungee,Impact,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('BLUE MOUNTAIN',512,84);
  const bx=MX(812),bz=MZ(500),by=resortH(bx,bz);[-1,1].forEach(sd=>add(new U.CylinderGeometry(4,4,220,8),std(0x2a2e3a),bx+300+sd*200,by+110,bz));
  add(new U.PlaneGeometry(380,60),new U.MeshBasicMaterial({map:new U.CanvasTexture(bc),side:U.DoubleSide}),bx+300,by+200,bz).rotation.y=Math.PI;}

/* ---------- lifts ---------- */
const LIFT_CH=366,_lq=new U.Object3D();
function cableY(L,z){const T=L.TW,f=Math.max(0,Math.min(T.length-1.001,(z-T[0].z)/L.step)),i=f|0,t=f-i,a=T[i],b=T[i+1];return a.y+(b.y-a.y)*t+LIFT_CH-72*t*(1-t);}
function buildResortLifts(M,add,std){if(!A.lift_tower)return;runG.userData.rlifts=[];
  const tmats={paint:std(0x3b4556,{roughness:.55,metalness:.4,vertexColors:true}),steel:std(0x9aa0aa,{roughness:.35,metalness:.85,vertexColors:true}),dark:std(0x15161a,{roughness:.6,vertexColors:true}),concrete:std(0x8f9096,{roughness:.95,vertexColors:true})};
  const cab=std(0x1a1b1f,{roughness:.5,metalness:.6});
  M.lifts.forEach(L=>{const TW=L.TW;
    instParts('lift_tower',TW,(d,t)=>{d.position.set(t.x,t.y,t.z);d.scale.setScalar(1);d.rotation.set(0,0,0);},tmats).forEach(m=>runG.add(m));
    [-88,88].forEach(ox=>{for(let i=0;i<TW.length-1;i++){const a=TW[i],b=TW[i+1],pts=[];for(let k=0;k<=8;k++){const t=k/8;pts.push(new U.Vector3(L.x+ox,a.y+(b.y-a.y)*t+LIFT_CH-72*t*(1-t),a.z+(b.z-a.z)*t));}
      add(new U.TubeGeometry(new U.CatmullRomCurve3(pts),16,1.1,5,false),cab,0,0,0).castShadow=false;}});
    const bd=add(new U.PlaneGeometry(240,32),new U.MeshBasicMaterial({map:labelTex(L.num+' · '+L.n),side:U.DoubleSide}),L.x,resortH(L.x,L.base+60)+330,L.base-80);bd.rotation.y=Math.PI;
    if(!A.lift_chair)return;const n=Math.max(2,Math.floor((TW[TW.length-1].z-TW[0].z)/(L.six?480:420))),list=[];for(let i=0;i<n*2;i++)list.push({side:i<n?-88:88,u:(i%n)/n});
    const cm={dark:std(0x18191d,{roughness:.6,vertexColors:true}),steel:tmats.steel,seat:std(L.six?0x2a5bb8:0xd8343b,{roughness:.55,vertexColors:true})};
    const chairs=instParts('lift_chair',list,()=>{},cm);chairs.forEach(m=>{m.castShadow=false;runG.add(m);});
    runG.userData.rlifts.push({L,chairs,list,t:0});});}
function updateResortLifts(dt){const LS=runG&&runG.userData.rlifts;if(!LS)return;
  for(const S of LS){const L=S.L,z0=L.TW[0].z,span=L.TW[L.TW.length-1].z-z0;S.t+=dt*RS.liftSpeed*(L.six?1:.7);
    S.list.forEach((it,k)=>{let u=(it.u*span+(it.side<0?S.t:-S.t))%span;if(u<0)u+=span;const z=z0+u;
      _lq.position.set(L.x+it.side,cableY(L,z),z);_lq.rotation.set(0,it.side<0?0:Math.PI,Math.sin(S.t*.02+k)*.03);_lq.scale.setScalar(1);_lq.updateMatrix();S.chairs.forEach(m=>m.setMatrixAt(k,_lq.matrix));});
    S.chairs.forEach(m=>m.instanceMatrix.needsUpdate=true);}
  const mc=runG.userData.myChair;if(mc){mc.visible=p.mode==='lift'&&!!p.lift;if(mc.visible){mc.position.set(p.lift.x+88,cableY(p.lift,p.cz),p.cz);mc.rotation.set(0,Math.PI,0);}}}
function myChair(){if(runG.userData.myChair)return runG.userData.myChair;const o=part('lift_chair'),std=(c)=>new U.MeshStandardMaterial({color:c,roughness:.55,vertexColors:true});
  const mm={dark:std(0x18191d),steel:new U.MeshStandardMaterial({color:0x9aa0aa,roughness:.35,metalness:.85,vertexColors:true}),seat:std(0xffd23f)};
  o.traverse(m=>{if(m.isMesh)m.material=mm[mname(m.material)]||mm.dark;});runG.add(o);runG.userData.myChair=o;return o;}

/* ---------- lift ride & free-roam helpers ---------- */
function nearLift(r){if(!map.fr||r.mode!=='ground')return null;let best=null,bd=1e9;for(const L of map.lifts){const d=Math.hypot(r.x-L.x,(r.z-(L.base+60))*.7);if(d<650&&d<bd){bd=d;best=L;}}return best;}
function boardLift(r,L){L=L||nearLift(r);if(!L)return;r.lift=L;r.cz=L.TW[L.TW.length-1].z;myChair();
  Object.assign(r,{mode:'lift',vx:0,vz:0,vy:0,head:Math.PI,spin:0,yo:0,ry:0,sw:false,pitch:0,roll:0,steer:0,charge:0,rail:null,grab:null,bsp:0,hsk:0});liftPlace(r);
  if(r===p){toast('On the <b>'+L.n+'</b> · hold <b>W</b> to speed up · <b>T</b> skip to the top');sfx('ui');}}
function liftPlace(r){const L=r.lift;r.x=L.x+88;r.z=r.cz-22;r.y=cableY(L,r.cz)-107.5-18.5;}
function topOf(L){return L||map.lifts.find(l=>l.num===6)||map.lifts[0];}
function arriveTop(r,L){L=topOf(L||r.lift);r.lift=null;Object.assign(r,{mode:'ground',x:L.x+260,z:L.top+300,vx:0,vz:140,vy:0,vyG:0,head:0,sw:false,spin:0,yo:0,ry:0,pitch:0,crashT:0,rail:null,_tr:null,bsp:0,hsk:0});r.y=hAt(r.x,r.z);
  if(r===p){camD={x:0,z:1};cam.position.set(r.x,r.y+90,r.z-170);toast('Top of the <b>'+L.n+'</b> · <b>M</b> trail map');}}
function liftStep(r,dt){const I=r.inp,sp=RS.liftSpeed*(r.lift.six?1:.7)*(I.w?3.5:1);r.cz-=sp*dt;liftPlace(r);r.vz=-sp;r.comp=0;
  if(r.cz<=r.lift.TW[0].z+40)arriveTop(r,r.lift);}
function trailAt(x,z){let best=null,bd=1e9;for(const T of map.trails){if(z<T.zs-80||z>T.ze+80)continue;const d=Math.abs(x-trailX(T,z));if(d<T.w+40&&d<bd){bd=d;best=T;}}
  if(!best)for(const t of map.trav)if(x>t.x1&&x<t.x2&&Math.abs(z-t.z)<t.w+30)return {n:t.n,d:t.d};return best;}
function r_reset(r){r.lift=null;Object.assign(r,{mode:'ground',vx:0,vy:0,vyG:0,head:0,sw:false,spin:0,yo:0,ry:0,pitch:0,crashT:0,rail:null,_tr:null,bsp:0,hsk:0});}
function spawnAt(x,z,label){x=Math.max(-RS.W+400,Math.min(RS.W-400,x));z=Math.max(RS.ZMIN+300,Math.min(RS.L-600,z));r_reset(p);Object.assign(p,{x,z,vz:110});p.y=hAt(x,z);
  camD={x:0,z:1};cam.position.set(x,p.y+90,z-170);closeTrailMap();toast(label?'Dropping into <b>'+label+'</b>':'Spawned');}
function teleportTrail(T){spawnAt(trailX(T,T.zs+150),T.zs+150,T.n);}
let tmapOpen=false;
function liftFor(T){let b=null,bd=1e9;for(const L of map.lifts){if(!L.six)continue;const d=Math.abs(T.pts[0][0]-L.x);if(d<bd){bd=d;b=L;}}return b;}
function openTrailMap(){if(!map||!map.fr)return;tmapOpen=true;paused=true;for(const k in keys)keys[k]=0;$('tmap').classList.remove('hide');drawTrailMap();
  const ic=d=>d==='green'?'<b style="color:#2fbf5a">●</b>':d==='blue'?'<b style="color:#5a9cff">■</b>':d==='black'?'◆':d==='park'?'<b style="color:#ff7a1a">▬</b>':'◆◆';
  $('tmList').innerHTML=map.lifts.filter(L=>L.six).map(L=>'<div class="lbl" style="color:#ffd23f">'+L.num+' · '+L.n+'</div>'+
    map.trails.map((T,i)=>[T,i]).filter(([T])=>liftFor(T)===L).map(([T,i])=>{const k=map.F.filter(F=>F.trail===T.n&&F.t==='kick').length,rl=map.rails.filter(R=>R.trail===T.n).length;
      return '<button data-i="'+i+'"><b>'+ic(T.d)+' '+T.n+'</b><span>'+(T.skix?'Ski cross · ':'')+(T.glade?'Glades · ':'')+DIFF[T.d].n+(k?' · '+k+' jumps':'')+(rl?' · '+rl+' rails':'')+'</span></button>';}).join('')).join('');
  $('tmList').querySelectorAll('button').forEach(b=>b.onclick=()=>teleportTrail(map.trails[+b.dataset.i]));
  // click anywhere on the map to spawn there
  $('tmCv').onclick=e=>{const c=$('tmCv'),rc=c.getBoundingClientRect(),u=(e.clientX-rc.left)/rc.width,v=(e.clientY-rc.top)/rc.height;
    const x=-RS.W+u*2*RS.W,z=RS.ZMIN+v*(RS.L-RS.ZMIN),T=trailAt(x,z);spawnAt(x,z,T&&T.n);};}
function closeTrailMap(){tmapOpen=false;$('tmap').classList.add('hide');paused=false;}
function drawTrailMap(){const c=$('tmCv');c.width=900;c.height=Math.round(900*(RS.L-RS.ZMIN)/(2*RS.W));const g=c.getContext('2d'),w=c.width,h=c.height,X=x=>(x+RS.W)/(2*RS.W)*w,Z=z=>(z-RS.ZMIN)/(RS.L-RS.ZMIN)*h;
  const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#dfe9f4');gr.addColorStop(.2,'#e9eef6');gr.addColorStop(1,'#f4f6fa');g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.fillStyle='#2d5a45';g.globalAlpha=.55;for(let i=0;i<map.trees.length;i+=2){const t=map.trees[i];g.fillRect(X(t.x),Z(t.z),1.6,1.6);}g.globalAlpha=1;
  for(const T of map.trails){g.strokeStyle=T.d==='park'?'#ff7a1a':T.glade?'#3a4a5a':DIFF[T.d].c;g.lineWidth=T.d==='park'?6:T.glade?1.5:3;if(T.glade)g.setLineDash([3,3]);g.beginPath();
    for(let z=T.zs;z<=T.ze;z+=80){const x=X(trailX(T,z)),y=Z(z);z===T.zs?g.moveTo(x,y):g.lineTo(x,y);}g.stroke();g.setLineDash([]);}
  for(const t of map.trav){g.strokeStyle='#2fbf5a';g.lineWidth=3;g.beginPath();g.moveTo(X(t.x1),Z(t.z));g.lineTo(X(t.x2),Z(t.z));g.stroke();}
  g.setLineDash([6,4]);g.lineWidth=2;g.font='bold 11px Inter';
  for(const L of map.lifts){g.strokeStyle='#c0262d';g.beginPath();g.moveTo(X(L.x),Z(L.top));g.lineTo(X(L.x),Z(L.base));g.stroke();g.fillStyle='#c0262d';g.beginPath();g.arc(X(L.x),Z(L.base)+8,8,0,7);g.fill();g.fillStyle='#fff';g.textAlign='center';g.fillText(L.num,X(L.x),Z(L.base)+12);}
  g.setLineDash([]);g.textAlign='left';g.fillStyle='#8a5a36';for(const b of map.bldg)g.fillRect(X(b.x)-3,Z(b.z)-3,6,6);
  g.fillStyle='#0b1024';g.font='bold 10px Inter';for(const T of map.trails){if(T.d==='glade')continue;const zz=T.zs+(T.ze-T.zs)*.42;g.save();g.translate(X(trailX(T,zz))+3,Z(zz));g.rotate(-Math.PI/2);g.fillText(T.n.toUpperCase(),0,0);g.restore();}
  g.fillStyle='#ffd23f';g.strokeStyle='#0b1024';g.lineWidth=2;g.beginPath();g.arc(X(p.x),Z(p.z),7,0,7);g.fill();g.stroke();
  g.fillStyle='#0b1024';g.font='bold 13px Inter';g.fillText('Click anywhere to spawn there',10,h-10);}
function resortHud(){if(!map||!map.fr)return;const T=trailAt(p.x,p.z),el=$('mapName');
  el.innerHTML=p.mode==='lift'&&p.lift?'🚡 '+p.lift.n:T?'<span style="color:'+(T.d==='park'?'#ff7a1a':T.d==='green'?'#39d98a':T.d==='blue'?'#5a9cff':'#fff')+'">'+(T.d==='green'?'●':T.d==='blue'?'■':T.d==='black'?'◆':T.d==='park'?'▬':'◆◆')+'</span> '+T.n:p.z>RS.baseZ-200?'Village':p.z<300?'Summit ridge':'Off-piste';
  const L=nearLift(p);let s='';if(p.mode==='lift')s='<b>W</b> speed up · <b>T</b> skip to the top';else if(L)s='<b>E</b> ride the '+L.n+' · <b>T</b> skip to the top';else s='<b>M</b> trail map (click to spawn) · <b>T</b> skip to the top';
  $('prompt').innerHTML=s;}
