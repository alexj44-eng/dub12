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
const BM_BUILDINGS=[['lodge','South Base Lodge',470,525,0],['chalet','Resort Operations Centre',600,545,0],['chalet','Cachet Crossing',940,598,0],['lodge','Blue Mountain Inn',1120,598,0],
  ['chalet','Chateau Ridge',1200,522,.2],['chalet','Chateau Ridge',1225,545,.2],['hut','Guest Services',1190,582,0],['lodge','Toronto Ski Club',1478,556,0],
  ['chalet','Collingwood Ski Club',1470,598,0],['lodge','Mountain Springs Resort',1560,562,0],['hut','Woodview Mountaintop Skating',330,48,0]];
/* Blue Mountain Village, laid out from the village map (pixel coords of that map; uphill at the top).
   Building colours follow the map's colour coding; storefronts list the shops named on the map. Style: turn-of-the-century
   Ontario village — clapboard/stucco facades, white trim, stone base, snowy gabled roofs, cobblestone pedestrian streets. */
const VX=px=>-78+(px-305)*5.2,VZ=py=>8420+(py-140)*5.2;
// [code, name, colour, storeys, [[cx,cy,w,d] rects in map px], rot, shops]
const BM_VILLAGE=[
 ['GC','Grand Central Lodge',0x8a6446,3,[[318,150,42,52]],0,['Grand Central Eatery','1858 Caesar Bar','Death Cookies','Blue Basin Mountain Essentials','Reserve Lounge']],
 ['AC','Activity Central',0x6f7f8e,2,[[304,198,30,24]],.1,['Red Devil Sports','Blue Mountain Supply Co.']],
 ['I','Weider Lodge',0x4e7a4c,5,[[214,196,58,30]],-.42,['Columbia Sportswear','Hatley','Scoops','Firehall Pizza Co.','Rocky Mountain Chocolate','Mother Tongue','Axe Throwing']],
 ['A','Grand Georgian',0xa8433a,6,[[262,240,64,34],[285,275,30,50]],.32,["Rusty's at Blue",'Roots','Tim Hortons','Copper Blues Bar & Grill','Happy Valley Candy Co.','Starbucks','Mile High Poutine','Cold Truth','Camino Taco','Village Market',"Craig's Cookies"]],
 ['C','Seasons at Blue',0x4a6e9c,5,[[180,340,74,34],[150,372,34,40]],.58,["MJ Byrne's Irish Pub",'Cheezed',"L'Occitane en Provence",'BeaverTails','Madison Clothing Boutique','Crock a Doodle','Pepper Palace',"Menchie's Frozen Yogurt",'Twist Kitchen & Cocktail','Chuck Burger','Jack and Maddy Toy Store','Olde Stanton Store','Axed by the Bunker']],
 ['B','Mosaic',0xcc8a3a,4,[[118,446,64,34]],.5,['Kaytoo','Wild Wing','Northwinds Brew Pub','LCBO','Greekery Café',"Magnone's Italian Kitchen",'Sunset Grill','Royal Majesty Espresso Bar','The North Face','Iwa Spa']],
 ['W','Westin Trillium House',0x575c66,6,[[42,232,58,40],[30,290,36,80]],0,['Oliver & Bonacini Café Grill']],
 ['V','Village Conference Centre',0x7b6a58,2,[[212,482,40,34]],0,[]],
 ['P','Plunge Aquatic Centre',0x6a8fa6,2,[[70,372,34,30]],.2,[]]];
// shop colours (sign background, text) — the brand's usual colours, plain text signs
const SHOPCOL={'Starbucks':['#00704a','#fff'],'Tim Hortons':['#c8102e','#fff'],'Roots':['#3d2a1e','#f2e6d0'],'LCBO':['#0b5c3b','#fff'],'The North Face':['#111','#fff'],'Columbia Sportswear':['#1d4f91','#fff'],
  'BeaverTails':['#7a4a24','#ffe2a8'],'Rocky Mountain Chocolate':['#4a2a18','#f0d8b0'],'Red Devil Sports':['#b3121b','#fff'],'Hatley':['#2c6e49','#fff'],"Menchie's Frozen Yogurt":['#e84d8a','#fff'],
  'Wild Wing':['#f2b11b','#1a1a1a'],'Sunset Grill':['#e8641c','#fff'],"L'Occitane en Provence":['#f5c400','#1a1a1a'],'Cold Truth':['#2a9fd8','#fff'],'Village Market':['#2f5e3c','#fff'],
  "MJ Byrne's Irish Pub":['#1f4d2b','#e8c26a'],'Copper Blues Bar & Grill':['#9c5a2a','#fff'],'Firehall Pizza Co.':['#a51f1f','#fff'],'Chuck Burger':['#e94b1b','#fff'],'Iwa Spa':['#d8cfc0','#3a3a3a']};
const ssV=1;
const ssR=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
const sm01=t=>t<=0?0:t>=1?1:t*t*(3-2*t);
function trailX(T,z){const P=T.pts;if(z<=P[0][1])return P[0][0];for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1];if(z<=b[1]){const t=(z-a[1])/(b[1]-a[1]),s=t*t*(3-2*t)*.35+t*.65;return a[0]+(b[0]-a[0])*s+T.a2*Math.sin(z*T.f2+T.p2);}}return P[P.length-1][0];}

/* ---------- height ---------- */
function rsSlope(z){if(z<150)return .02;if(z<550)return .02+.34*sm01((z-150)/400);if(z<6200)return .36+.05*Math.sin(z*.0011)+.03*Math.sin(z*.0031+1.3);
  if(z<7600)return .12+.24*(1-sm01((z-6200)/1400));if(z<RS.baseZ)return .04+.08*(1-sm01((z-7600)/(RS.baseZ-7600)));return .02;}
function gIdx(x,z){return [Math.max(0,Math.min(map.gnx-1.001,(x+RS.W)/RS.GS)),Math.max(0,Math.min(map.gnz-1.001,(z-RS.ZMIN)/RS.GS))];}
function resortH(x,z){const M=map,G=M.grid,[fx,fz]=gIdx(x,z),i=fx|0,j=fz|0,tx=fx-i,tz=fz-j,n=M.gnx;
  // same two triangles as the snow mesh (a-c-b, b-c-d), so riders sit exactly on the visible surface
  const a=G[j*n+i],b=G[j*n+i+1],c=G[(j+1)*n+i],d=G[(j+1)*n+i+1];let h=tx+tz<=1?a+(b-a)*tx+(c-a)*tz:d+(c-d)*(1-tx)+(b-d)*(1-tz);
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
    T.w=DIFF[d].w*(.9+r()*.2);T.zs=T.pts[0][1];T.ze=T.pts[T.pts.length-1][1];T.glade=d==='glade';
    if(T.skix){T.a2=240;T.f2=.0034;T.p2=0;T.w=150;}   // ski cross snakes down the hill in big S-turns
    return T;});
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
  // village: flatten the Mill Pond basin and smooth the square so buildings and ice sit level
  {const px=VX(96),pz=VZ(306),rx=52*5.2,rz=70*5.2;let lo=1e9;for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=-RS.W+i*gs,z=RS.ZMIN+j*gs,e=((x-px)/rx)**2+((z-pz)/rz)**2;if(e<1)lo=Math.min(lo,G[j*nx+i]);}
    M.pondY=lo-6;for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=-RS.W+i*gs,z=RS.ZMIN+j*gs,e=((x-px)/rx)**2+((z-pz)/rz)**2;if(e<1.6){const t=ssR(1,1.6,e),k=j*nx+i;G[k]=M.pondY+(G[k]-M.pondY)*t;}}}
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
    else if(T.skix){// ski cross: start gate, then a banked berm on the outside of every turn, with rollers, whoops and jumps on the straights
      let z=T.zs+300,k=0;M.gates.push({x:trailX(T,T.zs+130),z:T.zs+130,T});T.finZ=T.ze-160;
      const ph=z=>z*T.f2+T.p2,curv=z=>-Math.sin(ph(z));   // sign of x'' along the course
      while(z<T.ze-560){const s=Math.sin(ph(z+260));
        if(Math.abs(s)>.82){const side=-Math.sign(curv(z+260));M.F.push({t:'berm',cx:trailX(T,z+260),z0:z,zA:z,zB:z+560,len:560,H:52,hw:T.w*.95,side,trail:T.n});z+=640;continue;}
        const f=['rollers','kick','whoops','step','rollers','kick2'][k++%6],cx=trailX(T,z);
        if(f==='rollers'){for(let q=0;q<3;q++){M.F.push({t:'roller',cx:trailX(T,z),z0:z,zA:z,zB:z+150,len:150,H:14,hw:T.w*.92,trail:T.n});z+=160;}z+=90;}
        else if(f==='whoops'){for(let q=0;q<6;q++){M.F.push({t:'roller',cx:trailX(T,z),z0:z,zA:z,zB:z+70,len:70,H:6,hw:T.w*.92,trail:T.n});z+=72;}z+=90;}
        else if(f==='step'){M.F.push({t:'roller',cx,z0:z,zA:z,zB:z+260,len:260,H:24,hw:T.w*.92,trail:T.n});z+=360;}   // big step-down roller
        else z+=kick(T,z,f==='kick2'?'M':'S',0x58d7ff)+150;}}
    else if(T.n==='Smart Alec'){// GS course: alternating red/blue giant-slalom gates top to bottom
      let z=T.zs+420,sd=1;T.gs=1;M.gsGates=[];while(z<T.ze-400){M.gsGates.push({x:trailX(T,z)+sd*T.w*.34,z,sd,red:sd>0});sd=-sd;z+=380;}}});
  M.F.forEach(F=>{for(let k=Math.floor((F.zA-RS.ZMIN)/500);k<=Math.floor((F.zB-RS.ZMIN)/500);k++)(M.fb[k]=M.fb[k]||[]).push(F);});
  // buildings (box colliders), named
  const SZ={lodge:[300,165,520],chalet:[115,140,270],hut:[105,90,190],lift_station:[150,125,300]};
  const B=(name,x,z,rot,label)=>{const s=SZ[name];M.bldg.push({name,x,z,rot,hx:s[0],hz:s[1],h:s[2],label});};
  BM_BUILDINGS.forEach(([k,label,px,py,rot])=>B(k,MX(px),MZ(py),rot,label));
  // the village: one entry per building wing (world-space rectangles), plus the Mill Pond and the square
  M.vill=[];BM_VILLAGE.forEach(([code,name,col,st,rects,rot,shops],bi)=>{let si=0;rects.forEach(([px,py,wp,dp],ri)=>{const w=wp*5.2,d=dp*5.2,take=rects.length===1?shops.length:ri===0?Math.ceil(shops.length*.6):shops.length-si;
    const V={code,name,col,st:ri?st-1:st,x:VX(px),z:VZ(py),hx:w/2,hz:d/2,rot,shops:shops.slice(si,si+take),main:!ri};si+=take;M.vill.push(V);});});
  M.pond={x:VX(96),z:VZ(306),rx:52*5.2,rz:70*5.2};M.square={x:VX(232),z:VZ(292)};
  // lifts (straight lines down the fall line, stations at both ends) and magic carpets
  BM_LIFTS.forEach((Ld,li)=>{const x=MX(Ld.px),top=MZ(Ld.t),base=MZ(Ld.b),len=base-150-(top+150),n=Math.max(2,Math.ceil(len/800)),TW=[];
    for(let k=0;k<=n;k++)TW.push({x,y:0,z:top+150+len*k/n});M.lifts.push({i:li,n:Ld.n,num:Ld.num,x,top,base,TW,step:len/n,six:/Express/.test(Ld.n)});
    B('lift_station',x,top-60,0);B('lift_station',x,base+60,Math.PI);});
  BM_CARPETS.forEach(c=>M.carpets.push({n:c.n,x:MX(c.px),z1:MZ(c.t),z2:MZ(c.b)}));
  // signs: run name + difficulty at the top of every run, mid-run on long ones; glade, slow-zone and ski-cross signs
  M.trails.forEach(T=>{const side=(T.pts[0][0]>0?-1:1),off=T.skix?T.w+70:T.w*.62+30;for(let z=T.zs+90;z<T.ze-400;z+=4200){const x=trailX(T,z)+side*off;M.signs.push({x,z,T});}
    if(T.glade||T.d==='dbl')M.signs.push({x:trailX(T,T.zs+150)-side*(T.w*.62+30),z:T.zs+150,danger:'glades'});
    if(T.slow)M.signs.push({x:trailX(T,T.zs+500)-side*(T.w*.62+30),z:T.zs+500,danger:'slow'});
    if(T.skix)M.signs.push({x:trailX(T,T.zs+60)-side*(T.w+70),z:T.zs+60,danger:'skix'});});
  M.trav.forEach(t=>M.signs.push({x:t.x1+120,z:t.z-t.w-40,danger:'slow'}));
  // trees: dense forest between runs, thinned glades, open summit farmland and village
  for(let z=RS.ZMIN+60;z<RS.L-80;z+=88)for(let x=-RS.W+60;x<RS.W-60;x+=88){const tx=x+(r()-.5)*70,tz=z+(r()-.5)*70;
    if(at(GR,tx,tz)>.01||at(GR,tx+70,tz)>.3||at(GR,tx-70,tz)>.3)continue;const glade=at(GL,tx,tz);   // clear tree-free edge along every run
    const p=tz<120?.04:tz>RS.baseZ-150?.05:glade?.18:.5;
    if(M.lifts.some(L=>Math.abs(tx-L.x)<180&&tz>L.top-200&&tz<L.base+200))continue;
    if(M.lifts.some(L=>tx>L.x-260&&tx<L.x+560&&tz>L.top-260&&tz<L.top+620))continue;   // open unload bay at every lift topif(M.carpets.some(c=>Math.abs(tx-c.x)<90&&tz>c.z1-60&&tz<c.z2+60))continue;
    if(M.bldg.some(b=>Math.abs(tx-b.x)<b.hx+90&&Math.abs(tz-b.z)<b.hz+90))continue;
    if(tx>VX(-10)&&tx<VX(360)&&tz>VZ(100)&&tz<VZ(520))continue;   // no trees inside the village
    if(M.gates.some(g=>Math.abs(tx-g.x)<320&&tz>g.z-420&&tz<g.z+200))continue;   // open area round the ski-cross startif(M.signs.some(s=>Math.hypot(s.x-tx,s.z-tz)<60))continue;
    if(r()<p)M.trees.push({x:tx,z:tz,s:.8+r()*.9});}
  M.buckets={};
  M.trees.forEach(t=>{t.y=resortH(t.x,t.z);t.rad=5*t.s+3;t.h=70*t.s;addCol(M,t);});
  M.bldg.forEach(b=>{b.y=Math.min(...[[-1,-1],[1,-1],[-1,1],[1,1]].map(([a,c])=>resortH(b.x+a*b.hx*.8,b.z+c*b.hz*.8)))-3;
    addCol(M,{box:1,x:b.x,z:b.z,hx:b.hx,hz:b.hz,cs:Math.cos(b.rot),sn:Math.sin(b.rot),y:b.y,h:b.h,solid:1});});
  M.vill.forEach(V=>{V.y=Math.min(...[[-1,-1],[1,-1],[-1,1],[1,1],[0,0]].map(([a,c])=>{const lx=a*V.hx,lz=c*V.hz,cs=Math.cos(V.rot),sn=Math.sin(V.rot);return resortH(V.x+lx*cs+lz*sn,V.z-lx*sn+lz*cs);}))-4;
    V.h=V.st*62+40;addCol(M,{box:1,x:V.x,z:V.z,hx:V.hx,hz:V.hz,cs:Math.cos(V.rot),sn:Math.sin(V.rot),y:V.y,h:V.h+200,solid:1});});
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
/* ---------- Blue Mountain Village graphics ---------- */
function canv(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new U.CanvasTexture(c);t.anisotropy=4;return t;}
function facadeTex(col){const c=new U.Color(col),hx=c.getStyle();
  return canv(256,256,(g,w,h)=>{g.fillStyle=hx;g.fillRect(0,0,w,h);
    g.fillStyle='rgba(0,0,0,.09)';for(let y=6;y<h;y+=11)g.fillRect(0,y,w,2);                     // clapboard siding
    g.fillStyle='#f4f1ea';g.fillRect(0,0,10,h);g.fillRect(w-10,0,10,h);g.fillRect(0,h-12,w,12);    // corner boards + floor band
    g.fillStyle='#f4f1ea';g.fillRect(62,40,132,160);g.fillStyle='#26303c';g.fillRect(72,50,112,140);// window + trim
    g.fillStyle='rgba(255,200,120,.55)';g.fillRect(74,120,108,68);g.fillStyle='#f4f1ea';g.fillRect(124,50,8,140);g.fillRect(72,112,112,6);
    g.fillStyle='#3a2a1e';g.fillRect(50,206,156,8);for(let x=54;x<206;x+=12)g.fillRect(x,214,4,22);g.fillRect(50,234,156,5);   // balcony
    g.fillStyle='#2d3a2c';g.fillRect(44,40,16,160);g.fillRect(196,40,16,160);});}                 // shutters
const COBBLE=()=>canv(256,256,(g,w,h)=>{g.fillStyle='#7d7873';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=16)for(let x=(y/16)%2*10;x<w;x+=20){const s=118+Math.random()*26|0;
  g.fillStyle='rgb('+s+','+(s-5)+','+(s-11)+')';g.beginPath();g.ellipse(x+9,y+7.5,8.6,6.6,0,0,7);g.fill();}g.fillStyle='rgba(255,255,255,.55)';for(let k=0;k<900;k++)g.fillRect(Math.random()*w,Math.random()*h,2+Math.random()*4,1.5);});
function shopSign(name){const sc=SHOPCOL[name]||['#f4efe4','#2a2420'];return canv(512,112,(g,w,h)=>{g.fillStyle=sc[0];g.fillRect(0,0,w,h);g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=5;g.strokeRect(6,6,w-12,h-12);
  g.fillStyle=sc[1];let fs=54;g.font='bold '+fs+'px Georgia,serif';while(g.measureText(name).width>w-40&&fs>18){fs-=2;g.font='bold '+fs+'px Georgia,serif';}g.textAlign='center';g.textBaseline='middle';g.fillText(name,w/2,h/2+2);});}
function buildVillage(M,add,std,tm){const VG=new U.Group();runG.add(VG);const SH=62;
  const snowM=std(0xf3f6fb,{roughness:.9}),trimM=std(0xf2efe8,{roughness:.6}),stoneM=std(0x86837d,{roughness:.95}),glassM=new U.MeshStandardMaterial({color:0x2a3340,emissive:0xffc77a,emissiveIntensity:.55,roughness:.1,metalness:.2}),
    doorM=std(0x3a2a1e,{roughness:.6}),fasciaM=std(0x2b2f36,{roughness:.7});
  const mesh=(geo,mat,par)=>{const m=new U.Mesh(geo,mat);m.castShadow=m.receiveShadow=true;(par||VG).add(m);return m;};
  const signTexC={};
  M.vill.forEach(V=>{const g=new U.Group();g.position.set(V.x,V.y,V.z);g.rotation.y=V.rot;VG.add(g);const w=V.hx*2,d=V.hz*2,up=V.st-1,H=V.st*SH;
    // stone ground floor, sided upper floors with windows and balconies
    mesh(new U.BoxGeometry(w,SH+4,d),stoneM,g).position.y=(SH+4)/2;
    const ft=facadeTex(V.col),tw=ft.clone(),td=ft.clone();[tw,td].forEach(t=>{t.wrapS=t.wrapT=U.RepeatWrapping;t.needsUpdate=true;});tw.repeat.set(Math.max(1,Math.round(w/80)),up);td.repeat.set(Math.max(1,Math.round(d/80)),up);
    const mw=new U.MeshStandardMaterial({map:tw,roughness:.85}),md=new U.MeshStandardMaterial({map:td,roughness:.85}),plain=std(V.col,{roughness:.85});
    const body=mesh(new U.BoxGeometry(w,up*SH,d),[md,md,plain,plain,mw,mw],g);body.position.y=SH+4+up*SH/2;
    // trim band between floors + cornice
    mesh(new U.BoxGeometry(w+6,5,d+6),trimM,g).position.y=SH+4;mesh(new U.BoxGeometry(w+14,7,d+14),fasciaM,g).position.y=H+6;
    // snowy gabled roof along the long side, with chimneys and dormers
    const long=w>=d,L=(long?w:d)+26,S=(long?d:w)+26,rh=S*.42,sh=new U.Shape();sh.moveTo(-S/2,0);sh.lineTo(S/2,0);sh.lineTo(0,rh);sh.lineTo(-S/2,0);
    const rg=new U.ExtrudeGeometry(sh,{depth:L,bevelEnabled:false});rg.translate(0,0,-L/2);if(long)rg.rotateY(Math.PI/2);const roof=mesh(rg,snowM,g);roof.position.y=H+9;
    for(let k=-1;k<=1;k+=2){const ch=mesh(new U.BoxGeometry(14,40,14),stoneM,g);ch.position.set(long?k*w*.3:S*.18,H+9+rh*.62,long?S*.18:k*d*.3);}
    for(let k=-1;k<=1;k++){const dm=mesh(new U.BoxGeometry(long?34:30,30,long?30:34),plain,g);const off=k*(long?w:d)*.28;dm.position.set(long?off:S*.24,H+9+rh*.36,long?S*.24:off);
      const dr=mesh(new U.BoxGeometry(long?40:36,4,long?36:40),snowM,g);dr.position.set(dm.position.x,dm.position.y+16,dm.position.z);}
    // storefronts along both long sides: lit window, door, coloured awning, shop sign
    const slots=Math.max(1,Math.floor(w/74));let si=0;
    for(const side of [1,-1])for(let k=0;k<slots&&si<V.shops.length;k++){const name=V.shops[si++],x=-w/2+(k+.5)*w/slots,z=side*(d/2+.6);
      const win=mesh(new U.PlaneGeometry(46,30),glassM,g);win.position.set(x-6,22,z);win.rotation.y=side>0?0:Math.PI;
      const dor=mesh(new U.PlaneGeometry(14,34),doorM,g);dor.position.set(x+24,17,z);dor.rotation.y=win.rotation.y;
      const sc=SHOPCOL[name]||['#5a3f2a'],aw=mesh(new U.BoxGeometry(62,3,16),std(new U.Color(sc[0]).getHex(),{roughness:.7}),g);aw.position.set(x,44,side*(d/2+8));aw.rotation.x=side*.35;
      const st=signTexC[name]||(signTexC[name]=shopSign(name)),sg=mesh(new U.PlaneGeometry(60,13),new U.MeshStandardMaterial({map:st,roughness:.5,emissive:0xffffff,emissiveMap:st,emissiveIntensity:.25}),g);sg.position.set(x,55,side*(d/2+1));sg.rotation.y=win.rotation.y;sg.castShadow=false;}
    // building name across the front at the top floor
    if(V.main){const nb=mesh(new U.PlaneGeometry(Math.min(w*.8,260),24),new U.MeshBasicMaterial({map:labelTex(V.name),side:U.DoubleSide}),g);nb.position.set(0,H-18,d/2+1.2);nb.castShadow=false;}});
  // Mill Pond (frozen) with a skating ring
  {const P=M.pond,ice=mesh(new U.CircleGeometry(1,48),new U.MeshStandardMaterial({color:0xcfe5f5,roughness:.12,metalness:.05}));ice.scale.set(P.rx,P.rz,1);ice.rotation.x=-Math.PI/2;ice.position.set(P.x,M.pondY+1.5,P.z);ice.castShadow=false;}
  // cobblestone pedestrian streets over the village core (skipping the pond)
  {const x0=VX(10),x1=VX(345),z0=VZ(118),z1=VZ(472),st=40,nx=Math.ceil((x1-x0)/st)+1,nz=Math.ceil((z1-z0)/st)+1,P=[],UV=[],I=[];
    for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=x0+i*st,z=z0+j*st;P.push(x,resortH(x,z)+.8,z);UV.push(x/90,z/90);}
    const inPond=(x,z)=>((x-M.pond.x)/M.pond.rx)**2+((z-M.pond.z)/M.pond.rz)**2<1.08;
    for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){const x=x0+(i+.5)*st,z=z0+(j+.5)*st;if(inPond(x,z))continue;const a=j*nx+i,b=a+1,c=a+nx,d=c+1;I.push(a,c,b,b,c,d);}
    const gg=new U.BufferGeometry();gg.setAttribute('position',new U.Float32BufferAttribute(P,3));gg.setAttribute('uv',new U.Float32BufferAttribute(UV,2));gg.setIndex(I);gg.computeVertexNormals();
    const ct=COBBLE();ct.wrapS=ct.wrapT=U.RepeatWrapping;const cm=new U.MeshStandardMaterial({map:ct,roughness:.9,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});const cb=new U.Mesh(gg,cm);cb.receiveShadow=true;VG.add(cb);}
  // the square: tall centre pole with strings of lights to lamp posts all round, a big lit tree
  {const S=M.square,sy=resortH(S.x,S.z),postM=std(0x1f3a2c,{roughness:.5,metalness:.4}),lampM=new U.MeshStandardMaterial({color:0xfff1c8,emissive:0xffd890,emissiveIntensity:1.4});
    const cp=mesh(new U.CylinderGeometry(3,4,190,10),postM);cp.position.set(S.x,sy+95,S.z);
    const bulbs=[],wireP=[];const N=12,R=330;
    for(let k=0;k<N;k++){const a=k/N*Math.PI*2,px=S.x+Math.cos(a)*R,pz=S.z+Math.sin(a)*R,py=resortH(px,pz);
      if(M.vill.some(V=>{const dx=px-V.x,dz=pz-V.z,cs=Math.cos(V.rot),sn=Math.sin(V.rot),lx=dx*cs-dz*sn,lz=dx*sn+dz*cs;return Math.abs(lx)<V.hx+20&&Math.abs(lz)<V.hz+20;}))continue;
      const pp=mesh(new U.CylinderGeometry(2,2.6,92,8),postM);pp.position.set(px,py+46,pz);const ln=mesh(new U.BoxGeometry(9,12,9),lampM);ln.position.set(px,py+96,pz);
      const A_=new U.Vector3(S.x,sy+186,S.z),B_=new U.Vector3(px,py+90,pz);let prev=A_;for(let i=0;i<=22;i++){const u=i/22,v=A_.clone().lerp(B_,u);v.y-=Math.sin(Math.PI*u)*34;bulbs.push(v);if(i)wireP.push(prev,v);prev=v;}}
    const bm=new U.InstancedMesh(new U.SphereGeometry(1.6,6,5),new U.MeshStandardMaterial({color:0xfff2c0,emissive:0xffcc66,emissiveIntensity:2.2}),bulbs.length),d_=new U.Object3D();
    bulbs.forEach((v,i)=>{d_.position.copy(v);d_.updateMatrix();bm.setMatrixAt(i,d_.matrix);});bm.instanceMatrix.needsUpdate=true;VG.add(bm);
    const wg=new U.BufferGeometry().setFromPoints(wireP);VG.add(new U.LineSegments(wg,new U.LineBasicMaterial({color:0x1a1a1a})));
    if(A.pine_hq_a){const tr=part('pine_hq_a');tr.traverse(o=>{if(o.isMesh){o.material=tm[mname(o.material)]||tm.snow;o.castShadow=true;}});tr.scale.setScalar(1.6);tr.position.set(S.x+150,resortH(S.x+150,S.z+60)-4,S.z+60);VG.add(tr);
      const tb=new U.InstancedMesh(new U.SphereGeometry(1.8,6,5),new U.MeshStandardMaterial({color:0xff5050,emissive:0xff4040,emissiveIntensity:1.8}),70);for(let i=0;i<70;i++){const u=i/70,a=u*Math.PI*14,r=(1-u)*48+6;
        d_.position.set(tr.position.x+Math.cos(a)*r,tr.position.y+12+u*150,tr.position.z+Math.sin(a)*r);d_.updateMatrix();tb.setMatrixAt(i,d_.matrix);tb.setColorAt&&tb.setColorAt(i,new U.Color([0xff4040,0xffd23f,0x4aa3ff,0x39d98a][i%4]));}tb.instanceMatrix.needsUpdate=true;VG.add(tb);}}
  // village gateway arch
  {const x=VX(300),z=VZ(118),y=resortH(x,z),wood=std(0x5a3a22,{roughness:.85});[-1,1].forEach(s=>{const p=mesh(new U.BoxGeometry(12,150,12),wood);p.position.set(x+s*120,y+75,z);});
    const bm=mesh(new U.BoxGeometry(270,16,14),wood);bm.position.set(x,y+150,z);const sg=mesh(new U.PlaneGeometry(240,34),new U.MeshBasicMaterial({map:labelTex('Blue Mountain Village'),side:U.DoubleSide}));sg.position.set(x,y+126,z+8);sg.castShadow=false;}}
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
  buildVillage(M,add,std,tm);
  // trail map board in the unload bay at the top of every lift (you step off facing it)
  {const wood=std(0x4a3020,{roughness:.85}),roofM=std(0xf3f6fb,{roughness:.9});
    M.lifts.forEach(L=>{const s=boardSpot(L),y=resortH(s.x,s.z),cv=document.createElement('canvas');drawTrailMap(cv,{x:L.x+150,z:L.top+170},900);
      const tx=new U.CanvasTexture(cv);tx.anisotropy=8;const bw=230,bh=bw*cv.height/cv.width,ry=Math.atan2(-180,-120);
      const g=new U.Group();g.position.set(s.x,y,s.z);g.rotation.y=ry;runG.add(g);
      [-1,1].forEach(k=>{const po=new U.Mesh(new U.BoxGeometry(8,bh+70,8),wood);po.position.set(k*(bw/2+6),(bh+70)/2,0);po.castShadow=true;g.add(po);});
      const fr=new U.Mesh(new U.BoxGeometry(bw+16,bh+16,5),wood);fr.position.set(0,60+bh/2,-2);fr.castShadow=true;g.add(fr);
      const pn=new U.Mesh(new U.PlaneGeometry(bw,bh),new U.MeshStandardMaterial({map:tx,roughness:.7}));pn.position.set(0,60+bh/2,.8);g.add(pn);
      const rf=new U.Mesh(new U.BoxGeometry(bw+40,6,30),roofM);rf.position.set(0,60+bh+14,0);rf.rotation.x=-.12;rf.castShadow=true;g.add(rf);
      addCol(M,{box:1,x:s.x,z:s.z,hx:bw/2+10,hz:6,cs:Math.cos(ry),sn:Math.sin(ry),y,h:bh+80,solid:1});});}
  // Smart Alec GS course: two poles + a coloured panel per gate, start wand banner and finish banner
  if(M.gsGates){const poleM=std(0x202020,{roughness:.4}),red=std(0xd62a2a,{roughness:.6,side:U.DoubleSide}),blue=std(0x2257d6,{roughness:.6,side:U.DoubleSide});
    M.gsGates.forEach(G_=>{const y=resortH(G_.x,G_.z);[-1,1].forEach(s=>add(new U.CylinderGeometry(.9,.9,66,6),poleM,G_.x+s*17,y+33,G_.z));
      const pn=add(new U.PlaneGeometry(32,22),G_.red?red:blue,G_.x,y+48,G_.z);pn.castShadow=false;});
    const T=M.trails.find(t=>t.gs);[[T.zs+300,'Smart Alec GS · Start'],[T.ze-300,'GS · Finish']].forEach(([z,txt])=>{const x=trailX(T,z),y=resortH(x,z);[-1,1].forEach(s=>add(new U.BoxGeometry(8,96,8),poleM,x+s*(T.w+6),y+48,z));
      const b=add(new U.PlaneGeometry(T.w*2,26),new U.MeshBasicMaterial({map:labelTex(txt),side:U.DoubleSide}),x,y+92,z);b.rotation.y=Math.PI;});}
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
  M.gates.forEach(gt=>{const T=gt.T,y=resortH(gt.x,gt.z),mat=std(0x1d6fd8,{roughness:.5}),wood=std(0x7a5232,{roughness:.85}),dark=std(0x1c1f26,{roughness:.6}),orange=std(0xff6a10,{roughness:.6});
    // start: wooden start deck, roofed start hut, 4 lanes with dividers and drop-down gate bars, banner arch
    const DW=170;add(new U.BoxGeometry(DW+30,3,280),wood,gt.x,y+.6,gt.z-138);
    const hut=add(new U.BoxGeometry(DW+30,90,10),dark,gt.x,resortH(gt.x,gt.z-290)+45,gt.z-290);const roof=add(new U.BoxGeometry(DW+44,6,90),mat,gt.x,y+92,gt.z-30);roof.rotation.x=.06;
    [-1,1].forEach(s=>{add(new U.BoxGeometry(6,90,6),dark,gt.x+s*(DW/2+12),y+47,gt.z);add(new U.BoxGeometry(6,90,6),dark,gt.x+s*(DW/2+12),y+47,gt.z-70);});
    const bars=[];for(let k=0;k<5;k++){const lx=gt.x-DW/2+k*DW/4;add(new U.BoxGeometry(2.5,26,36),orange,lx,y+27,gt.z-18);}
    for(let k=0;k<4;k++){const lx=gt.x-DW/2+(k+.5)*DW/4,piv=new U.Group();piv.position.set(lx,y+2,gt.z+2);runG.add(piv);const b=new U.Mesh(new U.BoxGeometry(DW/4-6,3,3),std(0xf3f5f8,{roughness:.4}));b.position.y=14;b.castShadow=true;piv.add(b);bars.push(piv);}
    runG.userData.gateBars=bars;
    const bd=add(new U.PlaneGeometry(DW+20,24),new U.MeshBasicMaterial({map:labelTex('L-Hill Ski Cross'),side:U.DoubleSide}),gt.x,y+92,gt.z);bd.rotation.y=Math.PI;
    // finish arch at the bottom
    {const fz=T.finZ,fx=trailX(T,fz),fy=resortH(fx,fz);[-1,1].forEach(s=>add(new U.BoxGeometry(10,110,10),dark,fx+s*(T.w+10),fy+55,fz));
      const fb=add(new U.PlaneGeometry(T.w*2+20,30),new U.MeshBasicMaterial({map:labelTex('Finish'),side:U.DoubleSide}),fx,fy+104,fz);fb.rotation.y=Math.PI;
      const ln=add(new U.PlaneGeometry(T.w*2,4),new U.MeshBasicMaterial({color:0xff2a2a}),fx,fy+1.5,fz);ln.rotation.x=-Math.PI/2;}
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
function updateResortLifts(dt){updateSled(dt);raceStep(dt);const LS=runG&&runG.userData.rlifts;if(!LS)return;
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
// top of a lift: you step off into the unload bay (cleared of trees) facing the trail-map board, standing still; turn and go
function arriveTop(r,L){L=topOf(L||r.lift);r.lift=null;Object.assign(r,{mode:'ground',x:L.x+150,z:L.top+170,vx:0,vz:0,vy:0,vyG:0,head:.9,sw:false,spin:0,yo:0,ry:0,pitch:0,crashT:0,rail:null,_tr:null,bsp:0,hsk:0});r.y=hAt(r.x,r.z);r.safeT=3;
  if(r===p){camD={x:Math.sin(.9),z:Math.cos(.9)};cam.position.set(r.x-Math.sin(.9)*160,r.y+80,r.z-Math.cos(.9)*160);toast('Top of the <b>'+L.n+'</b> · check the trail map board · <b>M</b> full map · <b>Y</b> snowmobile');}}
function boardSpot(L){return {x:L.x+330,z:L.top+290};}
function liftStep(r,dt){const I=r.inp,sp=RS.liftSpeed*(r.lift.six?1:.7)*(I.w?3.5:1);r.cz-=sp*dt;liftPlace(r);r.vz=-sp;r.comp=0;
  if(r.cz<=r.lift.TW[0].z+40)arriveTop(r,r.lift);}
function trailAt(x,z){let best=null,bd=1e9;for(const T of map.trails){if(z<T.zs-80||z>T.ze+80)continue;const d=Math.abs(x-trailX(T,z));if(d<T.w+40&&d<bd){bd=d;best=T;}}
  if(!best)for(const t of map.trav)if(x>t.x1&&x<t.x2&&Math.abs(z-t.z)<t.w+30)return {n:t.n,d:t.d};return best;}
function r_reset(r){r.lift=null;Object.assign(r,{mode:'ground',vx:0,vy:0,vyG:0,head:0,sw:false,spin:0,yo:0,ry:0,pitch:0,crashT:0,rail:null,_tr:null,bsp:0,hsk:0});}
function spawnAt(x,z,label,keep){x=Math.max(-RS.W+400,Math.min(RS.W-400,x));z=Math.max(RS.ZMIN+300,Math.min(RS.L-600,z));
  // clicked in the woods? snap onto the nearest run so you never spawn stuck in the trees
  if(!trailAt(x,z)){let bx=x,bd=1e9,bT=null;for(const T of map.trails){if(T.glade||z<T.zs||z>T.ze)continue;const c=trailX(T,z),d=Math.abs(c-x);if(d<bd){bd=d;bx=c;bT=T;}}if(bT&&bd<2500){x=bx;label=label||bT.n;}}
  r_reset(p);Object.assign(p,{x,z,vz:60});p.y=hAt(x,z);p.safeT=3;
  if(!keep)p.spawnPt={x,z,label};   // T brings you back here
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
  // search: filters the list, highlights matches on the map, Enter drops you into the first match
  const sb=$('tmSearch');sb.value=tmQuery;sb.onkeydown=e=>{e.stopPropagation();if(e.key==='Escape'){sb.blur();return;}
    if(e.key==='Enter'){const b=$('tmList').querySelector('button:not([style*="none"])');if(b)b.click();}};sb.onkeyup=e=>e.stopPropagation();
  sb.oninput=()=>{tmQuery=sb.value;filterTrailMap();};filterTrailMap();
  // click anywhere on the map to spawn there
  $('tmCv').onclick=e=>{const c=$('tmCv'),rc=c.getBoundingClientRect(),u=(e.clientX-rc.left)/rc.width,v=(e.clientY-rc.top)/rc.height;
    const x=-RS.W+u*2*RS.W,z=RS.ZMIN+v*(RS.L-RS.ZMIN),T=trailAt(x,z);spawnAt(x,z,T&&T.n);};}
/* ---------- Ski Cross race (L-Hill): 4 riders in the start gate, 3-2-1, bars drop, first across the line wins ---------- */
let RACE=null;
function raceSetup(){const T=map.trails.find(t=>t.skix),gz=T.zs+130;RACE={T,t:0,go:false,order:[]};
  riders.forEach((r,i)=>{const lane=[-1.5,-.5,.5,1.5][i%4]*42;r_reset(r);Object.assign(r,{x:trailX(T,gz)+lane,z:gz-20,vz:0,fin:false,lane,score:0,time:0});r.y=hAt(r.x,r.z);r.safeT=0;});
  (runG.userData.gateBars||[]).forEach(b=>b.rotation.x=0);camD={x:0,z:1};cam.position.set(p.x,p.y+80,p.z-170);toast('<b>Ski Cross</b> · L-Hill · get in the gate…');}
function raceStep(dt){if(!RACE||curMode!=='skix')return;RACE.t+=dt;const T=RACE.t-3;
  if(!RACE.go){const n=Math.ceil(3-RACE.t);$('timer').textContent=n>0?String(n):'GO!';if(RACE._n!==n){RACE._n=n;sfx(n>0?'ui':'trick',.8);}if(RACE.t>=3){RACE.go=true;sfx('trick',1);}}
  else $('timer').textContent=fmt(Math.max(0,T));
  (runG.userData.gateBars||[]).forEach(b=>{if(RACE.go)b.rotation.x+=(1.45-b.rotation.x)*Math.min(1,dt*10);});
  for(const r of riders)if(!r.fin&&r.z>RACE.T.finZ){r.fin=true;r.ft=T;RACE.order.push(r);if(r===p){p.time=T;toast('<b>'+['1st','2nd','3rd','4th'][RACE.order.length-1]+'</b> · '+fmt(T));sfx('buy');}}}
function raceRank(){const fin=RACE?RACE.order.slice():[];return fin.concat(riders.filter(r=>!fin.includes(r)).sort((a,b)=>b.z-a.z));}
// bots: follow the course line in their own lane, tuck on the straights, carve the berms
function skixAI(r){const I=r.inp;if(!RACE||!RACE.go||r.mode!=='ground'||r.fin)return;const T=RACE.T,look=230+Math.min(200,Math.hypot(r.vx,r.vz)*.25);
  const tx=trailX(T,r.z+look)+r.lane*.55*(1-Math.min(1,Math.abs(Math.sin((r.z+look)*T.f2+T.p2)))),want=Math.atan2(tx-r.x,look),d=want-r.head;
  if(d>.03)I.a=1;else if(d<-.03)I.d=1;if(Math.abs(d)<.12&&Math.random()<.85*(r.bot.skill||.8))I.w=1;}
/* ---------- snowmobile tow (Y): a sled with a driver pulls up, winches you in on a tow rope and drags you uphill ---------- */
let SLED=null;
function sledModel(){const g=new U.Group(),m=(c,o)=>new U.MeshStandardMaterial(Object.assign({color:c,roughness:.45,metalness:.1},o||{}));
  const red=m(0xd8262e,{roughness:.3,metalness:.25}),blk=m(0x15161a,{roughness:.8}),gry=m(0x3a3e46,{roughness:.6}),glass=m(0x223040,{roughness:.05,transparent:true,opacity:.55}),chrome=m(0xcfd6e4,{metalness:.9,roughness:.2}),lamp=m(0xffffff,{emissive:0xfff2c0,emissiveIntensity:1.5});
  const B=(w,h,d,mat,x,y,z,rx)=>{const o=new U.Mesh(new U.BoxGeometry(w,h,d),mat);o.position.set(x,y,z);if(rx)o.rotation.x=rx;o.castShadow=true;g.add(o);return o;};
  B(34,10,40,blk,0,9,-16);                       // tunnel + track housing
  for(let k=0;k<6;k++)B(30,2.2,4,gry,0,3.2,-34+k*7);   // track lugs
  B(36,14,34,red,0,14,22,-.12);B(30,8,18,red,0,23,34,-.45);   // hood + nose
  B(26,6,30,blk,0,22,-14);B(24,4,8,blk,0,26,-26);            // seat + rear rack
  B(28,14,2,glass,0,32,17,-.55);                             // windshield
  B(30,1.6,1.6,chrome,0,31,8);[-1,1].forEach(s=>B(1.6,6,1.6,chrome,s*14,28,8));   // handlebars
  B(8,3,1,lamp,0,20,40,-.3);
  [-1,1].forEach(s=>{B(5,1.5,34,chrome,s*20,1.2,34);B(2,10,2,gry,s*20,7,36);B(5,6,2,chrome,s*20,3,51,.6);});   // front skis + spindles
  g.traverse(o=>{if(o.isMesh)o.receiveShadow=true;});
  // driver: a real rider sitting on the seat
  const dr=makeRider();dr.apply(Object.assign({},save.load,{skis:'s_chev'}),Object.assign({},save.body,{jc:4,sc:3,hood:false}));dr.gear(false);dr.setPoles(false);
  dr.root.position.set(0,6,-30);g.add(dr.root);g.userData.drv=dr;return g;}
function ropeMesh(){const r=new U.Mesh(new U.CylinderGeometry(.5,.5,1,6),new U.MeshStandardMaterial({color:0xffd23f,roughness:.6}));r.castShadow=true;return r;}
function towToggle(r){if(!map.fr||r!==p)return;
  if(r.mode==='tow'){towRelease(r);return;}if(r.mode!=='ground'||r.crashT>0)return;
  if(!SLED){SLED={g:sledModel(),rope:ropeMesh()};}if(SLED.g.parent!==runG){runG.add(SLED.g);runG.add(SLED.rope);}
  // pulls in from the side, just uphill of you, then winches you in
  Object.assign(SLED,{ph:'arrive',t:0,x0:r.x+(r.x>0?-520:520),z0:r.z-260,x:r.x,z:r.z-170,vx:0,vz:0,rl:260,yaw:Math.PI});
  r.mode='tow';r.towT=0;r.head=Math.PI;r.sw=false;r.spin=0;r.yo=0;r.ry=0;r.bsp=0;r.hsk=0;r.vx=r.vz=0;r.rail=null;endButter(r);
  toast('Snowmobile on the way · <b>A/D</b> steer · <b>W</b> faster · <b>Y</b> let go');sfx('ui');}
function towRelease(r,top){r.mode='ground';r.towT=0;if(top){r.head=0;r.vx=0;r.vz=120;toast('Dropped at the top · <b>T</b> back to your run');}else{r.head=Math.PI;r.vx=SLED.vx*.6;r.vz=SLED.vz*.6;}
  r.y=hAt(r.x,r.z);if(SLED)SLED.ph='leave',SLED.t=0;}
function towStep(r,dt){const S=SLED,I=r.inp;if(!S){r.mode='ground';return;}S.t+=dt;
  if(S.ph==='arrive'){const u=Math.min(1,S.t/1.4),e=u*u*(3-2*u);S.x=S.x0+(r.x-S.x0)*e;S.z=S.z0+(r.z-170-S.z0)*e;S.yaw=Math.PI+(1-e)*(S.x0>r.x?-1.2:1.2);
    if(u>=1){S.ph='winch';S.t=0;}r.vx=r.vz=0;}
  else if(S.ph==='winch'){S.rl=Math.max(110,S.rl-150*dt);if(S.rl<=110){S.ph='tow';S.t=0;toast('Hang on!');}}
  else if(S.ph==='tow'){const want=(I.w?620:430),sp=Math.min(want,Math.hypot(S.vx,S.vz)+260*dt);S.yaw+=((I.a?1:0)-(I.d?1:0))*-.9*dt;S.yaw=Math.max(Math.PI-.9,Math.min(Math.PI+.9,S.yaw));
    S.vx=Math.sin(S.yaw)*sp;S.vz=Math.cos(S.yaw)*sp;S.x+=S.vx*dt;S.z+=S.vz*dt;S.x=Math.max(-RS.W+500,Math.min(RS.W-500,S.x));
    if(S.z<260){S.z=260;r.x=S.x+((r.x>S.x)?40:-40);r.z=S.z+60;towRelease(r,true);return;}}
  // the rider trails the sled at rope length, skis on the snow
  const dx=r.x-S.x,dz=r.z-S.z,d=Math.hypot(dx,dz)||1;if(d>S.rl||S.ph!=='arrive'){r.x=S.x+dx/d*S.rl;r.z=S.z+dz/d*S.rl;}
  r.vx=S.vx;r.vz=S.vz;r.y=hAt(r.x,r.z);r.head=Math.atan2(S.x-r.x,S.z-r.z);r.comp=0;}
function updateSled(dt){if(!SLED||SLED.g.parent!==runG)return;const S=SLED,g=S.g;
  if(S.ph==='leave'){S.t+=dt;S.x+=Math.sin(S.yaw)*500*dt;S.z+=Math.cos(S.yaw)*500*dt;S.yaw+=.6*dt;if(S.t>4){runG.remove(g);runG.remove(S.rope);return;}}
  const y=hAt(S.x,S.z);g.position.set(S.x,y,S.z);g.rotation.set(gPitch(S.x,S.z,Math.sin(S.yaw),Math.cos(S.yaw)),S.yaw,0,'YXZ');
  const dr=g.userData.drv;dr.pose({sit:true},dt);
  // tow rope: from the sled's rear rack to the rider's hands
  const show=p.mode==='tow'&&S.ph!=='leave';S.rope.visible=show;if(show){const a=new U.Vector3(0,26,-30).applyEuler(g.rotation).add(g.position),b=new U.Vector3(p.x,p.y+27,p.z).addScaledVector(new U.Vector3(S.x-p.x,0,S.z-p.z).normalize(),10);
    const len=a.distanceTo(b);S.rope.position.copy(a).add(b).multiplyScalar(.5);S.rope.scale.set(1,len,1);S.rope.quaternion.setFromUnitVectors(UPV,b.clone().sub(a).normalize());}
  if(S.ph==='tow'&&Math.random()<.6)spray(S.x-Math.sin(S.yaw)*40+(Math.random()-.5)*20,y+3,S.z-Math.cos(S.yaw)*40,(Math.random()-.5)*80,60+Math.random()*120,-S.vz*.2,.4);}
let tmQuery='';
function tmMatch(T,q){if(!q)return false;const L=liftFor(T);return (T.n+' '+DIFF[T.d].n+(T.skix?' ski cross':'')+(T.gs?' gs giant slalom':'')+(T.park?' terrain park':'')+(L?' '+L.n+' '+L.num:'')).toLowerCase().includes(q);}
function filterTrailMap(){const q=tmQuery.trim().toLowerCase();
  $('tmList').querySelectorAll('button').forEach(b=>{const T=map.trails[+b.dataset.i],m=tmMatch(T,q);b.style.display=!q||m?'':'none';b.classList.toggle('hit',m);});
  $('tmList').querySelectorAll('.lbl').forEach(l=>{let n=l.nextElementSibling,any=false;while(n&&n.tagName==='BUTTON'){if(n.style.display!=='none')any=true;n=n.nextElementSibling;}l.style.display=any?'':'none';});
  drawTrailMap();}
function closeTrailMap(){if($('tmSearch'))$('tmSearch').blur();tmapOpen=false;$('tmap').classList.add('hide');paused=false;}
// painted-style trail map: hill shading, forest canopy, runs by difficulty, lifts, village, title + legend; also used on the boards at each lift top
function drawTrailMap(c,here,W){c=c||$('tmCv');here=here===undefined?p:here;W=W||900;c.width=W;c.height=Math.round(W*(RS.L-RS.ZMIN)/(2*RS.W));const g=c.getContext('2d'),w=c.width,h=c.height,X=x=>(x+RS.W)/(2*RS.W)*w,Z=z=>(z-RS.ZMIN)/(RS.L-RS.ZMIN)*h,sc=W/900;
  const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#9fb9d6');gr.addColorStop(.07,'#dbe6f1');gr.addColorStop(.5,'#eef3f8');gr.addColorStop(.85,'#f6f8fb');gr.addColorStop(1,'#e8eef4');g.fillStyle=gr;g.fillRect(0,0,w,h);
  // hill shading from the real terrain (light from the upper left)
  const st=Math.max(3,Math.round(6/sc));for(let py=0;py<h;py+=st)for(let px=0;px<w;px+=st){const x=-RS.W+px/w*2*RS.W,z=RS.ZMIN+py/h*(RS.L-RS.ZMIN),e=60,dx=resortH(x+e,z)-resortH(x-e,z),dz=resortH(x,z+e)-resortH(x,z-e),s=(-dx*.7-dz*.25)/(2*e);
    g.fillStyle=s>0?'rgba(255,255,255,'+Math.min(.45,s*1.2)+')':'rgba(70,90,130,'+Math.min(.28,-s*1.1)+')';g.fillRect(px,py,st,st);}
  // forest canopy: soft dark-green dabs
  for(let i=0;i<map.trees.length;i++){const t=map.trees[i],x=X(t.x),y=Z(t.z);g.fillStyle=i%3?'rgba(34,78,58,.55)':'rgba(52,100,72,.5)';g.beginPath();g.arc(x,y,(1.5+t.s)*sc,0,7);g.fill();}
  // village + pond
  if(map.pond){g.fillStyle='#bcd8ee';g.beginPath();g.ellipse(X(map.pond.x),Z(map.pond.z),map.pond.rx/(2*RS.W)*w,map.pond.rz/(RS.L-RS.ZMIN)*h,0,0,7);g.fill();}
  if(map.vill)for(const V of map.vill){g.save();g.translate(X(V.x),Z(V.z));g.rotate(-V.rot);g.fillStyle='#'+new U.Color(V.col).getHexString();g.fillRect(-V.hx/(2*RS.W)*w,-V.hz/(RS.L-RS.ZMIN)*h,V.hx/RS.W*w,2*V.hz/(RS.L-RS.ZMIN)*h);g.restore();}
  const q=tmQuery.trim().toLowerCase();if(q)for(const T of map.trails){if(!tmMatch(T,q))continue;g.strokeStyle='rgba(255,200,40,.8)';g.lineWidth=12;g.beginPath();
    for(let z=T.zs;z<=T.ze;z+=80){const x=X(trailX(T,z)),y=Z(z);z===T.zs?g.moveTo(x,y):g.lineTo(x,y);}g.stroke();}
  const path=T=>{g.beginPath();for(let z=T.zs;z<=T.ze;z+=60){const x=X(trailX(T,z)),y=Z(z);z===T.zs?g.moveTo(x,y):g.lineTo(x,y);}};
  g.lineCap='round';g.lineJoin='round';
  for(const T of map.trails){if(T.glade)continue;g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=(T.d==='park'?9:6)*sc;path(T);g.stroke();}   // groomed white casing
  for(const T of map.trails){g.strokeStyle=T.d==='park'?'#ff7a1a':T.glade?'#3a4a5a':DIFF[T.d].c;g.lineWidth=(T.d==='park'?6:T.glade?1.5:3)*sc;if(T.glade)g.setLineDash([3*sc,3*sc]);path(T);g.stroke();g.setLineDash([]);}
  if(map.gsGates)for(const G_ of map.gsGates){g.fillStyle=G_.red?'#d62a2a':'#2257d6';g.fillRect(X(G_.x)-2*sc,Z(G_.z)-1*sc,4*sc,2*sc);}
  for(const t of map.trav){g.strokeStyle='#2fbf5a';g.lineWidth=3*sc;g.beginPath();g.moveTo(X(t.x1),Z(t.z));g.lineTo(X(t.x2),Z(t.z));g.stroke();}
  g.setLineDash([6*sc,4*sc]);g.lineWidth=2*sc;g.font='bold '+(11*sc)+'px Inter';
  for(const L of map.lifts){g.strokeStyle='#c0262d';g.beginPath();g.moveTo(X(L.x),Z(L.top));g.lineTo(X(L.x),Z(L.base));g.stroke();g.fillStyle='#c0262d';g.beginPath();g.arc(X(L.x),Z(L.base)+8*sc,8*sc,0,7);g.fill();g.fillStyle='#fff';g.textAlign='center';g.fillText(L.num,X(L.x),Z(L.base)+12*sc);}
  g.setLineDash([]);g.textAlign='left';g.fillStyle='#8a5a36';for(const b of map.bldg)g.fillRect(X(b.x)-3*sc,Z(b.z)-3*sc,6*sc,6*sc);
  g.font='bold '+(10*sc)+'px Inter';for(const T of map.trails){if(T.d==='glade')continue;const zz=T.zs+(T.ze-T.zs)*.42;g.save();g.translate(X(trailX(T,zz))+3*sc,Z(zz));g.rotate(-Math.PI/2);
    g.lineWidth=3*sc;g.strokeStyle='rgba(255,255,255,.85)';g.strokeText(T.n.toUpperCase(),0,0);g.fillStyle='#0b1024';g.fillText(T.n.toUpperCase(),0,0);g.restore();}
  // title block (own wordmark) + legend
  g.fillStyle='rgba(14,30,62,.92)';g.fillRect(10*sc,10*sc,250*sc,58*sc);g.fillStyle='#fff';g.beginPath();g.moveTo(22*sc,58*sc);g.lineTo(40*sc,24*sc);g.lineTo(52*sc,42*sc);g.lineTo(60*sc,32*sc);g.lineTo(76*sc,58*sc);g.fill();
  g.font='bold '+(22*sc)+'px Bungee,Impact,sans-serif';g.fillText('BLUE MOUNTAIN',84*sc,40*sc);g.font=(11*sc)+'px Inter';g.fillStyle='#bcd2f0';g.fillText('Trail map · Collingwood, Ontario',84*sc,58*sc);
  const lg=[['green','Easiest'],['blue','More difficult'],['black','Most difficult'],['dbl','Experts only'],['park','Terrain park']];g.fillStyle='rgba(255,255,255,.9)';g.fillRect(w-190*sc,10*sc,180*sc,(16+lg.length*20)*sc);
  lg.forEach(([d,n],i)=>{const y=28*sc+i*20*sc;diffIcon(g,d,w-172*sc,y,.16*sc);g.textAlign='left';g.textBaseline='alphabetic';g.fillStyle='#0b1024';g.font='bold '+(12*sc)+'px Inter';g.fillText(n,w-150*sc,y+4*sc);});
  if(here){const hx=X(here.x),hy=Z(here.z);g.fillStyle='#ffd23f';g.strokeStyle='#0b1024';g.lineWidth=2*sc;g.beginPath();g.arc(hx,hy,7*sc,0,7);g.fill();g.stroke();
    if(here!==p){g.fillStyle='#d01f1f';g.font='bold '+(14*sc)+'px Inter';g.fillText('YOU ARE HERE',hx+10*sc,hy+5*sc);}}
  if(c.id==='tmCv'){g.fillStyle='#0b1024';g.font='bold 13px Inter';g.fillText('Click anywhere to spawn there',10,h-10);}}
function resortHud(){if(!map||!map.fr)return;const T=trailAt(p.x,p.z),el=$('mapName');
  el.innerHTML=p.mode==='lift'&&p.lift?'🚡 '+p.lift.n:T?'<span style="color:'+(T.d==='park'?'#ff7a1a':T.d==='green'?'#39d98a':T.d==='blue'?'#5a9cff':'#fff')+'">'+(T.d==='green'?'●':T.d==='blue'?'■':T.d==='black'?'◆':T.d==='park'?'▬':'◆◆')+'</span> '+T.n:p.z>RS.baseZ-200?'Village':p.z<300?'Summit ridge':'Off-piste';
  const L=nearLift(p);let s='';if(p.mode==='lift')s='<b>W</b> speed up · <b>T</b> skip to the top';else if(L)s='<b>E</b> ride the '+L.n+' · <b>T</b> skip to the top';else s='<b>M</b> trail map (click to spawn) · <b>T</b> '+(p.spawnPt?'back to '+(p.spawnPt.label||'your spot'):'skip to the top');
  $('prompt').innerHTML=s;}
