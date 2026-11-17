/* DUB12 — Mt. Twelve Resort: open free-roam mountain.
   A 2D heightfield (not the 1D run profile the park maps use), 50 named trails cut through the forest,
   7 terrain parks, cliff bands, a base village and summit, a chairlift you can ride or skip, trail signs,
   colliders for trees and buildings, and chunked tree LOD so thousands of pines stay fast. */
'use strict';
const RS={W:5600,L:21000,GS:30,topZ:700,baseZ:19300,lx:-160,liftSpeed:240};
const DIFF={green:{n:'Easier',c:'#2fbf5a',w:175},blue:{n:'More difficult',c:'#2f7fff',w:140},black:{n:'Most difficult',c:'#15161a',w:110},
  dbl:{n:'Experts only',c:'#15161a',w:90},park:{n:'Terrain park',c:'#ff7a1a',w:215}};
const PARK_NAMES=['Jib City','Big Air Alley','Rail Yard','Steeze Street','Launch Pad','Avalanche Park','DUB12 Park'];
const TRAIL_NAMES=['Summit Express','Powder Alley','Lone Pine','Bluebird','Corduroy Lane','Cougar Run','Northern Lights','Avalanche Gulch','Snowdrift','Ptarmigan',
  'Timberline','Glacier Way','Eagle\'s Nest','Rattlesnake','Moonshine','Sunrise Bowl','Widowmaker','Easy Street','Kingpin','Ridgeback','Huckleberry','Whiteout',
  'Frostbite','Silver Fox','Dropout Chutes','Copper Bowl','Blue Moon','Rolling Thunder','Little Dipper','Big Dipper','Stairway','The Wall','Elk Meadow',
  'Wolverine','Tumbleweed','Ice Box','Hidden Valley','Lookout','Trapper\'s Trail','Backbone','Fallen Timber','Sasquatch','Mogul Mayhem'];
const ssR=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
const sm01=t=>t<=0?0:t>=1?1:t*t*(3-2*t);

function trailX(T,z){return Math.max(-(RS.W-350),Math.min(RS.W-350,T.x0+T.a1*Math.sin(z*T.f1+T.p1)+T.a2*Math.sin(z*T.f2+T.p2)));}

/* ---------- height ---------- */
function rsSlope(z){if(z<900)return .04;if(z<1400)return .04+.26*sm01((z-900)/500);
  if(z<18800)return .3+.07*Math.sin(z*.0006)+.05*Math.sin(z*.0017+1.3);if(z<RS.baseZ)return .03+.27*(1-sm01((z-18800)/(RS.baseZ-18800)));return .03;}
function resortH(x,z){const M=map,G=M.grid,gs=RS.GS,fx=Math.max(0,Math.min(M.gnx-1.001,(x+RS.W)/gs)),fz=Math.max(0,Math.min(M.gnz-1.001,z/gs)),i=fx|0,j=fz|0,tx=fx-i,tz=fz-j,n=M.gnx;
  const a=G[j*n+i],b=G[j*n+i+1],c=G[(j+1)*n+i],d=G[(j+1)*n+i+1];let h=a+(b-a)*tx+(c-a)*tz+(a-b-c+d)*tx*tz;
  const L=M.fb[(z/500)|0];if(L)for(const F of L){if(z<F.zA||z>F.zB)continue;const dx=Math.abs(x-F.cx);if(dx>F.hw+40)continue;h+=featDelta(F,dx,z-F.z0);}
  return h;}
function featDelta(F,dx,u){const w=1-ssR(F.hw,F.hw+34,dx);if(w<=0)return 0;let d=0;
  if(F.t==='kick'){if(u>=-F.L&&u<=0)d=F.H*Math.pow((u+F.L)/F.L,2);else if(u>0&&u<=F.T)d=F.Ht;else if(u>F.T&&u<=F.T+F.LL)d=F.Ht*(1-sm01((u-F.T)/F.LL));}
  else if(F.t==='cliff'){const R=F.Hc*3.4;if(u>=-(F.P+R)&&u<=-F.P)d=F.Hc*sm01((u+F.P+R)/R);else if(u>-F.P&&u<=0)d=F.Hc;}
  return d*w;}

/* ---------- build ---------- */
function buildResort(){
  const r=rng(1212),M={id:'resort',fr:1,ys:[0],feat:[],rails:[],lips:[],trees:[],cliffs:[],pillows:[],stairs:[],decor:[],noise:0,hw:RS.W-300,lim:RS.W-150,
    len:RS.L,finishZ:Infinity,stopZ:RS.L-350,trails:[],F:[],fb:{},signs:[],bldg:[],cliffRocks:[]};
  map=M;
  // trails
  const diffs=[];for(let i=0;i<13;i++)diffs.push('green');for(let i=0;i<14;i++)diffs.push('blue');for(let i=0;i<11;i++)diffs.push('black');for(let i=0;i<5;i++)diffs.push('dbl');
  for(let i=diffs.length-1;i>0;i--){const k=(r()*(i+1))|0;[diffs[i],diffs[k]]=[diffs[k],diffs[i]];}
  const all=TRAIL_NAMES.map((n,i)=>({n,d:diffs[i]})).concat(PARK_NAMES.map(n=>({n,d:'park'})));
  const slots=all.map((_,i)=>-(RS.W-700)+i*(2*(RS.W-700)/(all.length-1)));for(let i=slots.length-1;i>0;i--){const k=(r()*(i+1))|0;[slots[i],slots[k]]=[slots[k],slots[i]];}
  all.forEach((t,i)=>{const T=Object.assign(t,{x0:slots[i],a1:100+r()*340,f1:.00022+r()*.0004,p1:r()*6.28,a2:30+r()*90,f2:.0011+r()*.0009,p2:r()*6.28,w:DIFF[t.d].w*(.85+r()*.3)});
    T.zs=r()<.62||T.d==='park'?1100:3000+r()*8000;if(T.d==='park')T.zs=1500+r()*9000;T.ze=T.d==='park'?Math.min(18200,T.zs+5000+r()*3000):18900;M.trails.push(T);});
  // grid: base terrain with trails groomed smooth and the forest floor left rough
  const gs=RS.GS,nx=M.gnx=Math.round(2*RS.W/gs)+1,nz=M.gnz=Math.round(RS.L/gs)+1,G=M.grid=new Float32Array(nx*nz),GR=M.groom=new Float32Array(nx*nz);
  const Y=new Float32Array(nz);for(let j=1;j<nz;j++)Y[j]=Y[j-1]+rsSlope((j-.5)*gs)*gs;
  for(let j=0;j<nz;j++){const z=j*gs,m=ssR(600,1700,z)*(1-ssR(18500,19300,z));
    const tc=M.trails.filter(T=>z>T.zs-150&&z<T.ze+150).map(T=>[trailX(T,z),T.w,T]);
    for(let i=0;i<nx;i++){const x=-RS.W+i*gs;let g=0;
      for(const [c,w,T] of tc){const d=Math.abs(x-c),e=ssR(T.zs-150,T.zs,z)*(1-ssR(T.ze,T.ze+150,z));g=Math.max(g,(1-ssR(w,w+70,d))*e);}
      const ax=Math.abs(x)/RS.W;
      let h=-Y[j]-(900*ax*ax+Math.max(0,(Math.abs(x)-(RS.W-350))/300)**2*600)*-1;
      h+=m*(160*Math.sin(x*.0012+z*.00025+1)*Math.sin(z*.0007)+60*Math.sin(x*.0035-z*.0011));
      h+=m*(1-g)*(24*Math.sin(x*.023+z*.007)*Math.sin(z*.019-x*.004)+12*Math.sin(x*.051)*Math.sin(z*.043+1)+7*Math.sin(x*.11+z*.09));
      G[j*nx+i]=h;GR[j*nx+i]=g;}}
  // features along trails
  const placed=[];const free=(zA,zB,cx,hw)=>!placed.some(p=>zA<p.zB+120&&zB>p.zA-120&&Math.abs(cx-p.cx)<hw+p.hw+140)&&Math.abs(cx-RS.lx)>hw+180;
  const KS={S:{H:16,L:90,T:50,LL:210,Ht:12,hw:70},M:{H:28,L:140,T:110,LL:330,Ht:22,hw:85},L:{H:44,L:200,T:200,LL:490,Ht:36,hw:100}};
  const PCOL=[0x3aa0ff,0xff4d6d,0xffd23f,0x39d98a,0xb36bff,0xff7a1a,0x58d7ff];
  const kick=(T,z,sz,col)=>{const k=KS[sz],cx=trailX(T,z),zA=z-k.L-10,zB=z+k.T+k.LL+10;if(!free(zA,zB,cx,k.hw))return false;
    const F=Object.assign({t:'kick',cx,z0:z,zA,zB,trail:T.n},k);M.F.push(F);placed.push({zA,zB,cx,hw:k.hw});M.lips.push({z1:z-k.L*.35,z2:z,cx,hw:k.hw,col:col||0x3aa0ff});return true;};
  const cliff=(T,z,Hc)=>{const hw=Math.min(T.w*.75,150),P=60+Hc,cx=trailX(T,z),zA=z-P-Hc*3.4-10,zB=z+20;if(!free(zA,zB+Hc*2,cx,hw))return false;
    M.F.push({t:'cliff',cx,z0:z,zA,zB,hw,Hc,P,trail:T.n});placed.push({zA,zB:zB+Hc*2,cx,hw});M.cliffs.push({z,h:Hc,cx,hw});return true;};
  const RSC=1.55;
  const rail=(T,z,len,off,h,box,col,arch)=>{const x=trailX(T,z)+off,z2=z+len;if(!free(z-80,z2+60,x,box?50:30))return false;placed.push({zA:z-80,zB:z2+60,cx:x,hw:box?50:30});
    M.rails.push({x,z1:z,z2,h:h*RSC,box:!!box,col,w:box?34:19,arch:arch||0,trail:T.n});return true;};
  M.trails.forEach((T,ti)=>{const col=PCOL[ti%PCOL.length];
    if(T.d==='park'){let z=T.zs+500,k=0;const seq=['kS','rails','kM','box','kL','arch','kM','rails','kL','box'];
      while(z<T.ze-900){const s=seq[k++%seq.length],c=PCOL[k%PCOL.length];
        if(s==='kS')kick(T,z,'S',c),z+=420;else if(s==='kM')kick(T,z,'M',c),z+=640;else if(s==='kL')kick(T,z,'L',c),z+=900;
        else if(s==='rails'){rail(T,z,420,-70,20,0,c);rail(T,z,420,70,14,1,PCOL[(k+2)%7]);z+=640;}
        else if(s==='box'){rail(T,z,360,0,14,1,c);z+=560;}else{rail(T,z,420,-60,18,0,c,40);rail(T,z,420,70,22,0,PCOL[(k+3)%7]);z+=640;}}
      return;}
    const sp={green:2300,blue:1500,black:1300,dbl:1500}[T.d];
    for(let z=T.zs+700+r()*600;z<T.ze-900;z+=sp*(.75+r()*.5)){const u=r();
      if(T.d==='green'){if(u<.35)kick(T,z,'S',col);else if(u<.45)rail(T,z,300,0,14,1,col);}
      else if(T.d==='blue'){if(u<.45)kick(T,z,u<.25?'S':'M',col);else if(u<.65)rail(T,z,360,(r()-.5)*60,u<.55?14:18,u<.55,col);}
      else if(T.d==='black'){if(u<.35)kick(T,z,'M',col);else if(u<.7)cliff(T,z,40+r()*35);else if(u<.85)rail(T,z,420,(r()-.5)*80,20,0,col);}
      else{if(u<.65)cliff(T,z,75+r()*75);else kick(T,z,'L',col);}}});
  M.F.forEach(F=>{for(let k=(F.zA/500)|0;k<=((F.zB/500)|0);k++)(M.fb[k]=M.fb[k]||[]).push(F);});
  // buildings: summit and base village (box colliders)
  const B=(name,x,z,rot,hx,hz,h)=>{M.bldg.push({name,x,z,rot,hx,hz,h});};
  B('lift_station',RS.lx,RS.topZ-60,0,150,125,300);B('lift_station',RS.lx,RS.baseZ+60,Math.PI,150,125,300);
  B('lodge',RS.lx+780,620,Math.PI,300,165,520);B('hut',RS.lx-520,820,.4,105,90,190);B('hut',RS.lx+420,330,0,105,90,190);
  B('lodge',RS.lx+950,19950,0,300,165,520);B('lodge',RS.lx-1250,20150,.15,300,165,520);
  const cr=rng(77);for(let i=0;i<18;i++){const x=(cr()-.5)*8400,z=19750+cr()*900;if(Math.abs(x-RS.lx)<380||M.bldg.some(b=>Math.hypot(b.x-x,b.z-z)<420))continue;B('chalet',x,z,(cr()-.5)*.6,115,140,270);}
  for(let i=0;i<4;i++)B('hut',RS.lx+(i-1.5)*620+260,19520,0,105,90,190);
  // lift line towers
  M.liftTW=[];for(let z=RS.topZ+150;z<=RS.baseZ-150+1;z+=(RS.baseZ-RS.topZ-300)/24)M.liftTW.push({x:RS.lx,y:0,z});
  M.lift=RS.lx;M.liftSpeed=RS.liftSpeed;
  // trail signs at the top of each trail and every ~5000 down it
  M.trails.forEach(T=>{for(let z=T.zs+90;z<T.ze-400;z+=5000){const side=(T.x0>RS.lx?-1:1),x=trailX(T,z)+side*(T.w*.62+30);M.signs.push({x,z,T});}});
  // trees: forest everywhere except trails, the lift line, buildings and the village core
  for(let z=60;z<RS.L-80;z+=78)for(let x=-RS.W+60;x<RS.W-60;x+=78){const tx=x+(r()-.5)*64,tz=z+(r()-.5)*64;
    const gi=Math.round((tx+RS.W)/gs),gj=Math.round(tz/gs);if(GR[gj*nx+gi]>.06)continue;
    let p=tz<1500?.1:tz>RS.baseZ-200?.08:.72;if(Math.abs(tx-RS.lx)<170)continue;
    if(M.bldg.some(b=>Math.abs(tx-b.x)<b.hx+90&&Math.abs(tz-b.z)<b.hz+90))continue;if(M.signs.some(s=>Math.hypot(s.x-tx,s.z-tz)<60))continue;
    if(r()<p)M.trees.push({x:tx,z:tz,s:.8+r()*.9});}
  M.buckets={};
  M.trees.forEach(t=>{t.y=resortH(t.x,t.z);t.rad=10*t.s+4;t.h=70*t.s;addCol(M,t);});
  M.bldg.forEach(b=>{b.y=Math.min(...[[-1,-1],[1,-1],[-1,1],[1,1]].map(([a,c])=>resortH(b.x+a*b.hx*.8,b.z+c*b.hz*.8)))-3;
    addCol(M,{box:1,x:b.x,z:b.z,hx:b.hx,hz:b.hz,cs:Math.cos(b.rot),sn:Math.sin(b.rot),y:b.y,h:b.h,solid:1});});
  M.liftTW.forEach(t=>{t.y=resortH(t.x,t.z)-2;addCol(M,{x:t.x,z:t.z,y:t.y,rad:22,h:400});});
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
function signTex(T){const c=document.createElement('canvas');c.width=512;c.height=192;const g=c.getContext('2d'),D=DIFF[T.d];
  g.fillStyle='#f4f1ea';g.fillRect(0,0,512,192);g.strokeStyle='#2a2a30';g.lineWidth=10;g.strokeRect(5,5,502,182);
  const sx=96,sy=96;g.fillStyle=D.c;
  if(T.d==='green'){g.beginPath();g.arc(sx,sy,46,0,7);g.fill();}
  else if(T.d==='blue')g.fillRect(sx-44,sy-44,88,88);
  else if(T.d==='black'||T.d==='dbl'){const dd=(ox)=>{g.beginPath();g.moveTo(ox,sy-50);g.lineTo(ox+40,sy);g.lineTo(ox,sy+50);g.lineTo(ox-40,sy);g.fill();};if(T.d==='dbl'){dd(sx-26);dd(sx+26);}else dd(sx);}
  else{g.beginPath();g.roundRect?g.roundRect(sx-56,sy-36,112,72,14):g.rect(sx-56,sy-36,112,72);g.fill();g.fillStyle='#fff';g.font='34px Bungee,Impact,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('PARK',sx,sy+2);}
  g.fillStyle='#16171c';g.textAlign='left';g.textBaseline='middle';let fs=58;g.font=fs+'px Bungee,Impact,sans-serif';while(g.measureText(T.n.toUpperCase()).width>340&&fs>26){fs-=2;g.font=fs+'px Bungee,Impact,sans-serif';}
  g.fillText(T.n.toUpperCase(),168,82);g.font='bold 24px Inter,sans-serif';g.fillStyle='#55565e';g.fillText(DIFF[T.d].n.toUpperCase(),170,140);
  return new U.CanvasTexture(c);}
function buildResortGfx(M,C,add,std,tm){
  // terrain
  const nx=M.gnx,nz=M.gnz,gs=RS.GS,pos=new Float32Array(nx*nz*3),col=new Float32Array(nx*nz*3),uv=new Float32Array(nx*nz*2),idx=new Uint32Array((nx-1)*(nz-1)*6);
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i,o=k*3,x=-RS.W+i*gs,z=j*gs,g=M.groom[k];pos[o]=x;pos[o+1]=M.grid[k];pos[o+2]=z;
    const v=.93+.07*g,w=Math.sin(x*.004+z*.002)*.02;col[o]=v-.02+w;col[o+1]=v-.005+w;col[o+2]=1;uv[k*2]=x/64;uv[k*2+1]=z/64;}
  let q=0;for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){const a=j*nx+i,b=a+1,c=a+nx,d=c+1;idx[q++]=a;idx[q++]=c;idx[q++]=b;idx[q++]=b;idx[q++]=c;idx[q++]=d;}
  const tg=new U.BufferGeometry();tg.setAttribute('position',new U.BufferAttribute(pos,3));tg.setAttribute('color',new U.BufferAttribute(col,3));tg.setAttribute('uv',new U.BufferAttribute(uv,2));
  tg.setIndex(new U.BufferAttribute(idx,1));tg.computeVertexNormals();const terr=new U.Mesh(tg,snowMaterial('pow',{vc:true}));terr.receiveShadow=true;runG.add(terr);
  // feature patches (kickers, cliff shelves) at fine resolution so lips and drops are crisp
  const pm=snowMaterial('cord',{vc:true});pm.polygonOffset=true;pm.polygonOffsetFactor=-2;pm.polygonOffsetUnits=-2;const lc=new U.Color();
  M.F.forEach(F=>{const st=6,x0=F.cx-F.hw-40,x1=F.cx+F.hw+40,z0=F.zA,z1=F.zB+(F.t==='cliff'?F.Hc*2:0),pnx=Math.ceil((x1-x0)/st)+1,pnz=Math.ceil((z1-z0)/st)+1;
    const P=new Float32Array(pnx*pnz*3),Cc=new Float32Array(pnx*pnz*3),UV=new Float32Array(pnx*pnz*2),I=new Uint32Array((pnx-1)*(pnz-1)*6);
    const lip=F.t==='kick'?M.lips.find(l=>l.cx===F.cx&&l.z2===F.z0):null;if(lip)lc.setHex(lip.col);
    for(let j=0;j<pnz;j++)for(let i=0;i<pnx;i++){const x=x0+i*st,z=Math.min(z1,z0+j*st),k=j*pnx+i;P[k*3]=x;P[k*3+1]=resortH(x,z)+.3;P[k*3+2]=z;
      let cr=1,cg=1,cb=1;if(lip&&z>=lip.z1&&z<=lip.z2&&Math.abs(x-F.cx)<=F.hw){cr=lc.r*.8+.2;cg=lc.g*.8+.2;cb=lc.b*.8+.2;}Cc[k*3]=cr;Cc[k*3+1]=cg;Cc[k*3+2]=cb;UV[k*2]=x/64;UV[k*2+1]=z/64;}
    let n=0;for(let j=0;j<pnz-1;j++)for(let i=0;i<pnx-1;i++){const a=j*pnx+i,b=a+1,c=a+pnx,d=c+1;I[n++]=a;I[n++]=c;I[n++]=b;I[n++]=b;I[n++]=c;I[n++]=d;}
    const g=new U.BufferGeometry();g.setAttribute('position',new U.BufferAttribute(P,3));g.setAttribute('color',new U.BufferAttribute(Cc,3));g.setAttribute('uv',new U.BufferAttribute(UV,2));g.setIndex(new U.BufferAttribute(I,1));g.computeVertexNormals();
    const me=new U.Mesh(g,pm);me.receiveShadow=true;me.castShadow=true;runG.add(me);
    if(F.t==='cliff'){const L=[],rr=rng(F.z0|0);for(let x=F.cx-F.hw;x<=F.cx+F.hw;x+=30)L.push({x:x+rr()*10,y:resortH(x,F.z0+8)+F.Hc*.15,z:F.z0+6+rr()*6,sy:F.Hc/30*(.75+rr()*.3),s:.8+rr()*.5,rz:.6+rr()*.4,a:rr()*6});M.cliffRocks.push(...L);}});
  // trees with LOD (Blender HQ pines up close, Blender low-poly pine further out)
  const tmB=Object.assign({},tm,{needles:envMat('needles',C.tree[1],{roughness:.85})});
  const tf=(d,t)=>{d.position.set(t.x,t.y-6,t.z);d.scale.setScalar(t.s*.62);d.rotation.set(0,t.x*.37+t.z*.11,Math.sin(t.x*.13+t.z)*.03);};
  const lodNames=[A.pine_hq_a?['pine_hq_a','pine_hq_b','pine_hq_c']:['pine_a','pine_b'],A.pine_lod?['pine_lod']:['pine_a']];
  instChunks(lodNames,M.trees,tf,ni=>ni===1?tmB:tm,1500);
  // buildings
  const night=!!C.night,bm={wood:std(0x8a5a36,{roughness:.85,vertexColors:true}),wood_dark:std(0x4a3020,{roughness:.9,vertexColors:true}),snow:tm.snow,concrete:std(0x8f9096,{roughness:.95,vertexColors:true}),
    glass:std(0xffc98a,{roughness:.08,metalness:.2,emissive:0xffa850,emissiveIntensity:night?1.5:.55,vertexColors:true}),steel:std(0x9aa0aa,{roughness:.35,metalness:.85,vertexColors:true}),
    paint:std(0x3b4556,{roughness:.55,metalness:.4,vertexColors:true}),dark:std(0x15161a,{roughness:.6,vertexColors:true})};
  M.bldg.forEach(b=>{if(!A[b.name])return;const o=part(b.name);o.traverse(m=>{if(m.isMesh){m.material=bm[mname(m.material)]||tm.snow;m.castShadow=m.receiveShadow=true;}});o.position.set(b.x,b.y,b.z);o.rotation.y=b.rot;runG.add(o);});
  // trail signs
  const post=std(0x5a3a22,{roughness:.9}),back=std(0x2a2a30,{roughness:.7});
  M.signs.forEach(s=>{add(new U.CylinderGeometry(2.2,2.6,64,8),post,s.x,s.y+30,s.z);
    const b=add(new U.BoxGeometry(84,32,2.4),back,s.x,s.y+64,s.z);b.rotation.y=Math.PI;
    const f=add(new U.PlaneGeometry(82,30.75),new U.MeshStandardMaterial({map:signTex(s.T),roughness:.6}),s.x,s.y+64,s.z-1.4);f.rotation.y=Math.PI;});
  // cliff rocks
  const RK=A.rock_hq_a?'rock_hq_a':'rock',rk={rock:envMat('rock',0x6d7686,{roughness:.95}),snow:tm.snow};
  if(M.cliffRocks.length)instParts(RK,M.cliffRocks,(d,t)=>{d.position.set(t.x,t.y,t.z);d.scale.set(t.s,t.sy,t.rz);d.rotation.set(0,t.a,0);},rk).forEach(m=>runG.add(m));
  // welcome banner over the base village
  const bc=document.createElement('canvas');bc.width=1024;bc.height=160;const g=bc.getContext('2d');g.fillStyle='#14182e';g.fillRect(0,0,1024,160);g.fillStyle='#ffd23f';g.font='78px Bungee,Impact,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('MT. TWELVE RESORT',512,84);
  const by=resortH(RS.lx+300,RS.baseZ-300);[-1,1].forEach(sd=>add(new U.CylinderGeometry(4,4,220,8),std(0x2a2e3a),RS.lx+300+sd*200,by+110,RS.baseZ-300));
  add(new U.PlaneGeometry(380,60),new U.MeshBasicMaterial({map:new U.CanvasTexture(bc),side:U.DoubleSide}),RS.lx+300,by+200,RS.baseZ-300).rotation.y=Math.PI;}

/* ---------- lift ride & free-roam helpers ---------- */
function liftY(z){const T=map.liftTW;if(!T||!T.length)return 0;const step=(T[T.length-1].z-T[0].z)/(T.length-1),f=Math.max(0,Math.min(T.length-1.001,(z-T[0].z)/step)),i=f|0,t=f-i,a=T[i],b=T[i+1];
  return a.y+(b.y-a.y)*t+366-72*t*(1-t);}
function boardLift(r){if(!map.fr)return;const z=map.liftTW[map.liftTW.length-1].z;Object.assign(r,{mode:'lift',x:RS.lx+88,z,y:liftY(z)-104,vx:0,vz:0,vy:0,head:Math.PI,spin:0,yo:0,ry:0,sw:false,pitch:0,roll:0,steer:0,charge:0,rail:null,grab:null});
  if(r===p){toast('On the lift · hold <b>W</b> to speed up · <b>T</b> skip to the top');sfx('ui');}}
function arriveTop(r){Object.assign(r,{mode:'ground',x:RS.lx+260,z:RS.topZ+380,vx:0,vz:140,vy:0,vyG:0,head:0,sw:false,spin:0,yo:0,ry:0,pitch:0,crashT:0,rail:null,_tr:null});r.y=hAt(r.x,r.z);
  if(r===p){camD={x:0,z:1};cam.position.set(r.x,r.y+90,r.z-170);toast('Summit · pick a trail · <b>M</b> trail map');}}
function liftStep(r,dt){const I=r.inp,sp=RS.liftSpeed*(I.w?3.5:1);r.z-=sp*dt;r.y=liftY(r.z)-104;r.x=RS.lx+88;r.vz=-sp;r.comp=0;
  if(r.z<=map.liftTW[0].z+40)arriveTop(r);}
function nearLift(r){return map.fr&&r.mode==='ground'&&Math.abs(r.z-(RS.baseZ+60))<520&&Math.abs(r.x-RS.lx)<700;}
function trailAt(x,z){let best=null,bd=1e9;for(const T of map.trails){if(z<T.zs-80||z>T.ze+80)continue;const d=Math.abs(x-trailX(T,z));if(d<T.w+40&&d<bd){bd=d;best=T;}}return best;}
function teleportTrail(T){const z=T.zs+150,x=trailX(T,z);Object.assign(p,{mode:'ground',x,z,vx:0,vz:120,vy:0,vyG:0,head:0,sw:false,spin:0,yo:0,ry:0,pitch:0,crashT:0,rail:null,_tr:null});p.y=hAt(x,z);
  camD={x:0,z:1};cam.position.set(x,p.y+90,z-170);closeTrailMap();toast('Dropping into <b>'+T.n+'</b>');}
let tmapOpen=false;
function openTrailMap(){if(!map||!map.fr)return;tmapOpen=true;paused=true;for(const k in keys)keys[k]=0;$('tmap').classList.remove('hide');drawTrailMap();
  const order=['green','blue','black','dbl','park'];$('tmList').innerHTML=order.map(d=>'<div class="lbl" style="color:'+(d==='park'?'#ff7a1a':d==='green'?'#2fbf5a':d==='blue'?'#5a9cff':'#fff')+'">'+DIFF[d].n+'</div>'+
    map.trails.map((T,i)=>[T,i]).filter(([T])=>T.d===d).map(([T,i])=>{const f=map.F.filter(F=>F.trail===T.n),k=f.filter(F=>F.t==='kick').length,c=f.filter(F=>F.t==='cliff').length,rl=map.rails.filter(R=>R.trail===T.n).length;
      return '<button data-i="'+i+'"><b>'+T.n+'</b><span>'+[k?k+' jumps':'',c?c+' cliffs':'',rl?rl+' rails':''].filter(Boolean).join(' · ')+'</span></button>';}).join('')).join('');
  $('tmList').querySelectorAll('button').forEach(b=>b.onclick=()=>teleportTrail(map.trails[+b.dataset.i]));}
function closeTrailMap(){tmapOpen=false;$('tmap').classList.add('hide');paused=false;}
function drawTrailMap(){const c=$('tmCv'),g=c.getContext('2d'),w=c.width,h=c.height,X=x=>(x+RS.W)/(2*RS.W)*w,Z=z=>z/RS.L*h;
  g.fillStyle='#e9eef6';g.fillRect(0,0,w,h);g.fillStyle='#2d5a45';g.globalAlpha=.55;for(const t of map.trees)if((t.x*7+t.z)%3<1)g.fillRect(X(t.x),Z(t.z),1.6,1.6);g.globalAlpha=1;
  for(const T of map.trails){g.strokeStyle=T.d==='park'?'#ff7a1a':DIFF[T.d].c==='#15161a'?'#15161a':DIFF[T.d].c;g.lineWidth=T.d==='park'?3.5:2.2;g.beginPath();for(let z=T.zs;z<=T.ze;z+=150){const x=X(trailX(T,z)),y=Z(z);z===T.zs?g.moveTo(x,y):g.lineTo(x,y);}g.stroke();}
  g.strokeStyle='#c0262d';g.lineWidth=2;g.setLineDash([5,4]);g.beginPath();g.moveTo(X(RS.lx),Z(RS.topZ));g.lineTo(X(RS.lx),Z(RS.baseZ));g.stroke();g.setLineDash([]);
  g.fillStyle='#8a5a36';for(const b of map.bldg)g.fillRect(X(b.x)-3,Z(b.z)-3,6,6);
  g.fillStyle='#ffd23f';g.strokeStyle='#0b1024';g.lineWidth=2;g.beginPath();g.arc(X(p.x),Z(p.z),6,0,7);g.fill();g.stroke();
  g.fillStyle='#0b1024';g.font='bold 12px Inter';g.fillText('SUMMIT',X(RS.lx)+8,Z(RS.topZ)+4);g.fillText('VILLAGE',X(RS.lx)+8,Z(RS.baseZ)+14);}
function resortHud(){if(!map||!map.fr)return;const T=trailAt(p.x,p.z),el=$('mapName');
  el.innerHTML=p.mode==='lift'?'🚡 Summit Chair':T?'<span style="color:'+(T.d==='park'?'#ff7a1a':T.d==='green'?'#39d98a':T.d==='blue'?'#5a9cff':'#fff')+'">'+(T.d==='green'?'●':T.d==='blue'?'■':T.d==='black'?'◆':T.d==='dbl'?'◆◆':'▬')+'</span> '+T.n:p.z>RS.baseZ-200?'Village':p.z<RS.topZ+500?'Summit':'Off-piste';
  const pr=$('prompt');let s='';if(p.mode==='lift')s='<b>W</b> speed up · <b>T</b> skip to top';else if(nearLift(p))s='<b>E</b> ride the Summit Chair · <b>T</b> skip to the top';else s='<b>M</b> trail map · <b>T</b> skip to top';
  pr.innerHTML=s;}
