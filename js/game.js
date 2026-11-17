/* DUB12 — renderer, physics, riders, run flow */
'use strict';
const $=id=>document.getElementById(id);
const cv=$('c');
const renderer=new U.WebGLRenderer({canvas:cv,antialias:true,alpha:true});
renderer.setClearColor(0x000000,0);renderer.shadowMap.enabled=true;renderer.shadowMap.type=U.PCFSoftShadowMap;

let W=1,H=1;
const cam=new U.PerspectiveCamera(62,1,2,60000),lcam=new U.PerspectiveCamera(30,1,1,12000);
function resize(){W=window.innerWidth;H=window.innerHeight;renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.setSize(W,H,false);
  cam.aspect=lcam.aspect=W/H;cam.updateProjectionMatrix();lcam.updateProjectionMatrix();}
window.addEventListener('resize',resize);

/* ---------- riders ---------- */
const mkInp=()=>({a:0,d:0,w:0,s:0,g1:0,g2:0,g3:0,bn:0,bt:0,f:0,jump:0});
const keys=mkInp();
let sk=null,p=null,BOTS=[];
const BOT_DEF=[['Juno',-115,.75,7],['Pow_Hound',115,.55,19],['Wax_Wizard',55,.9,33]];
function botLoad(seed){const r=rng(seed),pick=c=>{const L=ITEMS.filter(i=>i.cat===c);return L[(r()*L.length)|0].id;};
  return {load:{jacket:pick('jacket'),pants:pick('pants'),gloves:pick('gloves'),helmet:pick('helmet'),goggles:pick('goggles'),boots:pick('boots'),skis:pick('skis')},
    body:{hood:r()<.4,jc:(r()*JCOL.length)|0,sc:(r()*JCOL.length)|0,skin:(r()*8)|0,hair:BODY.hair[1+((r()*5)|0)][0],hairColor:(r()*12)|0,eye:(r()*8)|0,build:BODY.build[(r()*4)|0][0],height:BODY.height[(r()*3)|0][0]}};}
function initRiders(){
  sk=makeRider();sk.gogMode=save.set.gog;sk.gogOver=!!save.set.gogOver;sk.apply(save.load,save.body);
  p={sk,name:'You',inp:keys,bot:null,stat:statOf(save.load.skis)};
  BOTS=BOT_DEF.map(b=>{const s=makeRider(),L=botLoad(b[3]);s.apply(L.load,L.body);s.root.visible=false;scene.add(s.root);return {sk:s,name:b[0],inp:mkInp(),stat:statOf(L.load.skis),bot:{lane:b[1],skill:b[2],plan:null,dir:b[3]%2?1:-1}};});
}
let riders=[],mode='lobby',curMap='park',curMode='battle',endShown=false,paused=false,menuKind=null,camD={x:0,z:1},feed=[],hudT=0,st=null,bailT=0;
function spawn(r,x){Object.assign(r,{x,z:260,y:hAt(x,260),vx:0,vz:150,vy:0,vyG:0,mode:'ground',head:0,steer:0,pitch:0,spin:0,sv:0,fv:0,roll:0,yo:0,comp:0,bp:0,butter:null,butT:0,
  sw:false,swT:false,fPrev:0,tilt:0,flipAcc:0,spinAcc:0,airT:0,grabT:0,grabs:{},grab:null,crashT:0,rail:null,grindT:0,charge:0,ry:0,fin:false,time:0,score:0,mult:1,
  wind:0,bal:0,balV:0,ryT:0,railSide:false,press:null,pressT:0,swaps:0,spinOn:0,landQ:null,_tr:null});if(r.bot)r.bot.plan=null;}
function popup(n,pt,bail,mu){if(!save.set.popups&&!bail)return;const e=$('pop');e.className=bail?'bail':'';e.children[0].textContent=n;e.children[1].textContent=pt?'+'+pt.toLocaleString()+(mu>1?'  (x'+mu+')':''):'';void e.offsetWidth;e.classList.add('go');}
function say(r,n,pt,bail){if(r===p)popup(n,pt,bail,r.mult);else if(pt){feed.push({t:4.5,s:r.name+' · '+n+' +'+pt.toLocaleString()});if(feed.length>3)feed.shift();}}
function award(r,n,pts){pts=Math.round(pts/10)*10*r.mult;r.score+=pts;say(r,n,pts);r.mult=Math.min(r.mult+1,8);}
function endButter(r){if(r.butter){if(r.butT>.4)award(r,r.butter+' Butter',r.butT*300);r.butter=null;r.butT=0;}}
// pre-wind: steering while you load the jump stores rotation that releases at take-off
function startAir(r){endButter(r);r.mode='air';r.airT=0;r.flipAcc=0;r.spinAcc=0;r.grabT=0;r.grabs={};r.grab=null;r.charge=0;r.fv=0;r.swT=r.sw;
  const ST=r.stat||[3,3,3];r.sv=r.wind*SPIN*(1+.06*(ST[2]-3))*(r===p?save.set.rot:1);r.wind=0;r.landQ=null;}
function scoreTrick(r,suffix,pen){pen=pen||1;
  const flips=Math.round(Math.abs(r.flipAcc)/(Math.PI*2)),spins=Math.round(Math.abs(r.spinAcc)/Math.PI)*180;
  let gn='',gt=.3;for(const k in r.grabs)if(r.grabs[k]>gt){gt=r.grabs[k];gn=k;}
  const sty=r===p?IDX[save.tricks.style]:IDX.t_cork,gm=gn?(TRICKS.find(t=>t.n===gn)||{m:1}).m:1;
  let name='';const cork=flips>0&&spins>=180;
  if(cork)name=(flips>2?'Triple ':flips>1?'Double ':'')+sty.n+' '+spins;
  else if(flips)name=(flips===2?'Double ':flips>2?'Triple ':'')+(r.flipAcc<0?'Backflip':'Frontflip');
  else if(spins)name=''+spins;
  if(gn)name+=(name?' ':'')+gn;
  if(r===p){st.airT+=r.airT;st.grabT+=r.grabT;}
  if(!name){if(r.airT<.8||suffix)return;const pt=Math.round(r.airT*10)*10*r.mult;r.score+=pt;say(r,'Straight Air',pt);return;}
  if(r.swT)name='Switch '+name;
  if(r===p){if(cork)st.corks++;if(flips>=2)st.doubles++;if(spins>=720)st.big++;if(r.swT)st.switchTricks++;sfx('trick',Math.min(1,(flips+spins/360)/4));}
  const Q=r.landQ,qm=Q==='Perfect'?1.25:Q==='Sketchy'?.7:1;if(r===p&&Q==='Perfect')st.perfect=(st.perfect||0)+1;
  award(r,name+(suffix||'')+(Q&&Q!=='Clean'?' · '+Q:''),qm*pen*(flips*600+spins/180*200+(cork?500*sty.m:0)+r.grabT*400*gm+r.airT*100)*(r.swT?1.25:1));
}
function crash(r){if(r===p){sfx('bail');shake=.5;}r.crashT=r===p?save.set.respawn:1.1;r.vx*=.3;r.vz*=.3;r.mult=1;r.charge=0;r.butter=null;r.butT=0;say(r,'BAIL!',0,true);puff(r,26,1);scatter(r);}
/* yard sale: skis and poles fly off, come back when you get up */
const DEB=[],_m4=new U.Matrix4(),_q=new U.Quaternion(),_e=new U.Euler();
function scatter(r){clearDebris(r);r.sk.root.updateMatrixWorld(true);r.sk.gearObjs().forEach(o=>{if(!o.visible)return;const c=o.clone(true);o.matrixWorld.decompose(c.position,c.quaternion,c.scale);scene.add(c);
  DEB.push({r,o:c,v:new U.Vector3(r.vx*.5+(Math.random()-.5)*260,220+Math.random()*260,r.vz*.5+(Math.random()-.5)*260),w:new U.Vector3((Math.random()-.5)*14,(Math.random()-.5)*14,(Math.random()-.5)*14)});});r.sk.gear(false);}
function clearDebris(r){for(let i=DEB.length-1;i>=0;i--)if(!r||DEB[i].r===r){scene.remove(DEB[i].o);DEB.splice(i,1);}}
function stepDebris(dt){for(const d of DEB){d.v.y-=G*dt;d.o.position.addScaledVector(d.v,dt);const gh=hAt(d.o.position.x,d.o.position.z)+1.5;
  if(d.o.position.y<gh){d.o.position.y=gh;d.v.y=Math.abs(d.v.y)*.3;d.v.x*=.55;d.v.z*=.55;d.w.multiplyScalar(.5);}
  _q.setFromEuler(_e.set(d.w.x*dt,d.w.y*dt,d.w.z*dt));d.o.quaternion.multiply(_q);}}
function getUp(r){clearDebris(r);r.sk.gear(true);const z=Math.min(r.z,map.finishZ-50),x=Math.max(-map.hw+40,Math.min(map.hw-40,r.x));
  Object.assign(r,{x,z,y:hAt(x,z),vx:0,vz:130,vy:0,vyG:0,mode:'ground',head:0,steer:0,spin:0,sv:0,fv:0,roll:0,yo:0,bp:0,sw:false,crashT:0,rail:null,ry:0,charge:0,grab:null,tilt:0,wind:0,bal:0,balV:0,press:null,_tr:null});
  r.pitch=gPitch(x,z,0,1);if(r===p)camD={x:0,z:1};}
let shake=0,fpsA=60;
const clampH=h=>Math.max(-1.35,Math.min(1.35,h));
/* rails: you lock in at whatever angle you arrive (sideways = front/backslide, straight = straight slide),
   then hold your balance with A/D. F swaps, Q/R presses the nose/tail when sliding straight. */
function onRail(r,R,spinOn){endButter(r);const rel=norm(bodyYaw(r));
  r.mode='rail';r.rail=R;r.grindT=0;r.head=0;r.spin=0;r.yo=0;r.sw=false;r.ry=rel;r.sv=0;r.fv=0;
  r.railSide=Math.abs(Math.sin(rel))>.62;r.ryT=r.railSide?Math.sign(Math.sin(rel))*Math.PI/2:(Math.abs(rel)>Math.PI/2?Math.sign(rel||1)*Math.PI:0);
  r.bal=(Math.random()-.5)*.25+Math.min(.35,Math.abs(r.vx)/900)*Math.sign(r.vx||0);r.balV=0;r.press=null;r.pressT=0;r.swaps=0;r.spinOn=spinOn||0;
  r.vz=Math.max(150,r.vz);r.vx=0;r.y=R.yAt(r.z);r.grab=null;r.comp=.6;if(r===p)sfx('land',.35);}
function railName(r){const R=r.rail,sw=Math.abs(norm(r.ryT))>2.5;
  const kind=r.railSide?(r.ryT>0?'Frontslide':'Backslide'):((sw?'Switch ':'')+(r.press&&r.pressT>.35?r.press+' Press':'Straight Slide'));
  return (r.spinOn>=180?r.spinOn+' On ':'')+kind+(r.swaps?' · Swap'+(r.swaps>1?' x'+r.swaps:''):'')+' · '+R.name;}
function leaveRail(r,pop){const gt=r.grindT,ry=r.ry,R=r.rail;r.vy=r.vyG+pop;startAir(r);
  award(r,railName(Object.assign({},r,{rail:R})),gt*520*(r.railSide?1.15:1)*(r.press&&r.pressT>.35?1.3:1)+r.spinOn*1.6+r.swaps*260+(R.h>40?400:0));
  r.rail=null;r.ry=0;r.yo+=ry;r.head=0;r.bp=0;}
const bodyYaw=r=>r.head+(r.sw?Math.PI:0)+r.spin+r.ry+r.yo;

function step(r,dt){
  const I=r.inp;
  if(r.mode==='lift'){liftStep(r,dt);return;}
  if(r.crashT>0){r.crashT-=dt;if(r.crashT<=0){getUp(r);return;}}
  const ctl=r.crashT<=0&&!r.fin;let pop=0;
  if(!r.fin)r.time+=dt;
  const ST=r.stat||[3,3,3];
  if(r.mode!=='air'&&ctl){if(I.jump){r.charge=Math.min(1,r.charge+dt/.55);if(r.mode==='ground')r.wind+=((I.a-I.d)-r.wind)*Math.min(1,dt*4);}
    else if(r.charge>0){pop=(POP0+POP1*r.charge)*(1+.06*(ST[1]-3));r.charge=0;}else r.wind*=Math.exp(-dt*8);}
  r.comp*=Math.exp(-dt*5);r.yo*=Math.exp(-dt*8);
  const pz=r.z;
  if(r.mode==='ground'){
    const e=2,gx=(hAt(r.x+e,r.z)-hAt(r.x-e,r.z))/(2*e),gz=(hAt(r.x,r.z+e)-hAt(r.x,r.z-e))/(2*e),den=1+gx*gx+gz*gz;
    // carving: tighter turns at low speed, longer arcs at speed; edges grip unless you're braking into a skid
    const sp0=Math.hypot(r.vx,r.vz),turnK=TURN*(.62+.5*Math.min(1,240/Math.max(80,sp0)))*(r.charge>0?.3:1);
    r.steer+=((ctl?I.a-I.d:0)-r.steer)*Math.min(1,dt*7);r.head=clampH(r.head+r.steer*turnK*dt);
    const fx=Math.sin(r.head),fz=Math.cos(r.head),lx=fz,lz=-fx;
    r.vx-=G*gx/den*dt;r.vz-=G*gz/den*dt;
    let vF=r.vx*fx+r.vz*fz,vL=r.vx*lx+r.vz*lz;vL*=Math.exp(-(I.s&&ctl?3.2:9)*dt);
    const sp=Math.hypot(vF,vL),bt=ctl&&sp>120?(I.bn?'Nose':I.bt?'Tail':null):null;
    let drag=DRAG*(I.w&&ctl?.5:1)*(1-.07*(ST[0]-3))*sp*sp+FRIC;if(I.s&&ctl)drag+=750;if(r.fin)drag+=650;if(r.crashT>0)drag+=300;if(bt)drag+=60;
    if(sp>0){const k=Math.max(0,sp-drag*dt)/sp;vF*=k;vL*=k;}
    const atBase=map.stopZ&&r.z>map.stopZ;
    if(I.w&&ctl&&sp<170)vF+=320*dt;if(ctl&&!r.fin&&!atBase&&vF<110)vF+=Math.min(110-vF,900*dt); // skate/push when slow so you never stall on an up-ramp
    if(atBase){const k=Math.exp(-dt*3*Math.min(1,(r.z-map.stopZ)/120));vF*=k;vL*=k;} // run-out at the bottom of the resort
    r.vx=vF*fx+vL*lx;r.vz=vF*fz+vL*lz;
    if(bt){r.butter=bt;r.butT+=dt;if(r===p)st.butterT+=dt;}else endButter(r);
    // ground 180 to/from switch
    if(ctl&&I.f&&!r.fPrev){r.sw=!r.sw;r.yo-=Math.PI;if(r.butter){award(r,'Butter 180',300);}else say(r,r.sw?'Switch':'Regular',0);}
    r.fPrev=I.f;
    const bsign=r.sw?-1:1;
    r.bp+=((bt?(bt==='Nose'?.36:-.36):0)-r.bp)*Math.min(1,dt*9);
    r.roll+=(r.steer*Math.min(1,sp/400)*.5-r.roll)*Math.min(1,dt*7);
    if(r.crashT>0)r.pitch+=11*dt;else r.pitch+=norm(bsign*gPitch(r.x,r.z,fx,fz)-r.pitch)*Math.min(1,dt*12);
    if(pop){r.vy=(r.vyG>0?r.vyG*.8:r.vyG)+pop;startAir(r);puff(r,8);return;}
    const lim=map.lim||map.hw+240,nx=Math.max(-lim,Math.min(lim,r.x+r.vx*dt)),nz=r.z+r.vz*dt,gh=hAt(nx,nz),fy=r.y+r.vyG*dt-.5*G*dt*dt;
    if(Math.abs(nx)>=lim)r.vx=0;
    if(fy-gh>1){r.x=nx;r.z=nz;r.y=fy;r.vy=(r.vyG>0?r.vyG*.8:r.vyG)-G*dt;startAir(r);}
    else{r.vyG=(gh-r.y)/dt;r.x=nx;r.z=nz;r.y=gh;}
    if(sp>220&&Math.random()<.6)spray(r.x+(Math.random()-.5)*12,r.y+1,r.z-10,-lx*r.steer*170+(Math.random()-.5)*70,50+Math.random()*(I.s?260:110),r.vz*.2,.3+Math.random()*.3);
    if(!r.fin&&r.z>map.finishZ){r.fin=true;if(r===p)st.finished=1;}
    // boxes have on-ramps you can ride straight onto; rails have to be jumped onto — ride into one and you go down
    if(ctl&&r.mode==='ground')for(const R of map.rails){
      if(R.box&&pz<R.z1&&r.z>=R.z1&&Math.abs(r.x-R.x)<R.w+6&&Math.abs(r.y-R.yAt(R.z1))<R.h+30){onRail(r,R,0);break;}
      if(!R.box&&pz<R.z1+2&&r.z>=R.z1+2&&Math.abs(r.x-R.x)<9&&R.yAt(r.z)-r.y>10){crash(r);r.vx=(r.x>=R.x?1:-1)*140;say(r,'Clipped the rail',0,true);break;}}
  }else if(r.mode==='air'){
    const py=r.y,lim=map.lim||map.hw+240;r.vy-=G*dt;r.x=Math.max(-lim,Math.min(lim,r.x+r.vx*dt));r.z+=r.vz*dt;r.y+=r.vy*dt;r.airT+=dt;
    const sp=Math.hypot(r.vx,r.vz)||1,dx=r.vx/sp,dz=r.vz/sp,k=Math.min(1,dt*10),tv=Math.atan2(r.vx,r.vz);
    const sd=ctl?I.a-I.d:0,fd=ctl?(I.w-I.s)*(r===p&&save.set.invert?-1:1):0,AS=r!==p||save.set.assist;
    // rotation has momentum: input steers it (strongest just after take-off), letting go lets it coast down
    const sm_=(1+.06*(ST[2]-3))*(r===p?save.set.rot:1),kr=Math.min(1,dt*6);
    if(sd)r.sv+=(sd*SPIN*sm_-r.sv)*kr*(r.airT<.3?1:.6);else r.sv*=Math.exp(-dt*(AS?4.5:1.3));
    r.vx*=1-.05*dt;r.vz*=1-.05*dt;r.fv+=((r.crashT>0?1.3:fd)*FLIP*(r.crashT>0?1:sm_)-r.fv)*kr;
    const styT=(r===p?IDX[save.tricks.style]:IDX.t_cork).tilt;r.tilt+=((Math.abs(r.sv)>2&&Math.abs(r.fv)>2?styT:0)-r.tilt)*Math.min(1,dt*5);
    r.spin+=r.sv*dt;r.spinAcc+=r.sv*dt;r.pitch+=r.fv*dt;r.flipAcc+=r.fv*dt;
    const rel=norm(bodyYaw(r)-tv);
    if(ctl){
      if(AS&&!sd&&Math.abs(r.sv)<3){const tgt=Math.abs(rel)>Math.PI/2?(rel>0?Math.PI:-Math.PI):0;r.spin+=Math.max(-1,Math.min(1,tgt-rel))*dt*3.2;}
      if(AS&&!fd){const df=norm(gPitch(r.x,r.z,dx,dz)*Math.cos(rel)-r.pitch);if(Math.abs(df)<1.5)r.pitch+=Math.max(-2.4*dt,Math.min(2.4*dt,df*6*dt));}
      const GL=r===p?save.tricks.g:['t_mute','t_safety','t_japan'],gi=I.g1?0:I.g2?1:I.g3?2:-1,g=gi>=0&&GL[gi]?IDX[GL[gi]].n:null;r.grab=g;if(g){r.grabT+=dt;r.grabs[g]=(r.grabs[g]||0)+dt;}
    }else r.grab=null;
    r.roll*=1-Math.min(1,dt*6);r.bp*=1-Math.min(1,dt*8);r.steer*=1-Math.min(1,dt*8);
    for(const R of map.rails)if(r.z>=R.z1&&r.z<=R.z2&&Math.abs(r.x-R.x)<R.w){const ry=R.yAt(r.z);if(py>=ry-4&&r.y<=ry+1&&r.vy<0){
      const deg=Math.round(Math.abs(r.spinAcc)/(Math.PI/2))*90;if(ctl&&Math.abs(r.flipAcc)>Math.PI)scoreTrick(r,R.box?' to Box':' to Rail');onRail(r,R,ctl?deg:0);if(r===p)st.slides++;return;}}
    const gh=hAt(r.x,r.z);
    if(r.y<=gh){
      // slope physics on touchdown: velocity into the slope is absorbed, the rest carries along it.
      // steep landings keep (and convert) speed; flat landings hurt.
      const e=3,sgx=(hAt(r.x+e,r.z)-hAt(r.x-e,r.z))/(2*e),sgz=(hAt(r.x,r.z+e)-hAt(r.x,r.z-e))/(2*e),nl=Math.hypot(sgx,1,sgz),nx_=-sgx/nl,ny_=1/nl,nz_=-sgz/nl;
      const vn=r.vx*nx_+r.vy*ny_+r.vz*nz_,impact=Math.max(0,-vn),hs0=Math.hypot(r.vx,r.vz);
      if(vn<0){r.vx-=nx_*vn;r.vz-=nz_*vn;const hs1=Math.hypot(r.vx,r.vz),cap=hs0*1.3+60;if(hs1>cap){r.vx*=cap/hs1;r.vz*=cap/hs1;}}
      r.y=gh;r.vyG=(hAt(r.x+r.vx*dt,r.z+r.vz*dt)-gh)/dt;r.mode='ground';
      const by=bodyYaw(r),tv2=Math.atan2(r.vx,r.vz),rl=norm(by-tv2),landSw=Math.abs(rl)>Math.PI/2,nh=clampH(tv2);
      r.head=nh;r.sw=landSw;r.yo=norm(by-(nh+(landSw?Math.PI:0)));r.spin=0;r.sv=0;r.fv=0;r.grab=null;r.ry=0;
      r.tilt=0;if(r.airT>.25){r.comp=Math.min(1,.35+r.airT*.35+impact/1400);puff(r,10+Math.min(30,impact/30)|0);if(r===p){sfx('land',Math.min(1,impact/900+.2));shake=Math.max(shake,Math.min(.45,impact/2400+r.airT*.08));};
        if(ctl){const side=Math.abs(rl)>1.05&&Math.abs(rl)<Math.PI-1.05,pe=Math.abs(norm(r.pitch-gPitch(r.x,r.z,dx,dz)*Math.cos(rl))),bad=pe>(side?.9:1.1)||impact>1550;
          const ye=Math.min(Math.abs(rl),Math.PI-Math.abs(rl)),q=pe/1.1+ye*.55+Math.max(0,impact-780)/900;
          r.landQ=side?'Sketchy':q<.25?'Perfect':q<.7?'Clean':'Sketchy';
          if(r.landQ==='Sketchy'&&!bad){r.vx*=.86;r.vz*=.86;r.comp=1;}
          if(bad||(side&&r===p&&!save.set.sideways)){crash(r);if(impact>1550)say(r,'Flat landing',0,true);}else if(side)scoreTrick(r,' · Sideways',.45);else scoreTrick(r);}}
      r.pitch=norm(r.pitch);
    }
  }else{
    const R=r.rail,gz=(R.yAt(r.z+2)-R.yAt(r.z-2))/4;
    // steel is faster than plastic; gravity pulls you down a down-rail and slows you up a rainbow
    r.vz=Math.max(90,r.vz+(-G*gz/(1+gz*gz)*.92-(R.box?34:16))*dt);r.z+=r.vz*dt;r.x+=(R.x-r.x)*Math.min(1,dt*14);r.vx=0;
    const ny=R.yAt(r.z);r.vyG=(ny-r.y)/dt;r.y=ny;r.grindT+=dt;r.roll=r.bal*.5;r.steer*=1-Math.min(1,dt*8);
    // balance: the board wants to tip; correct with A/D (bots balance by skill)
    if(ctl){const inst=(R.box?.85:1.4)*(r.railSide?1:1.3)*(r.press?1.35:1);
      r.balV+=(r.bal*inst*2.4+(Math.random()-.5)*3.4*inst)*dt;
      if(r.bot)r.balV+=(-r.bal*7-r.balV*2.6)*(.45+r.bot.skill)*dt;else r.balV-=(I.a-I.d)*5.2*dt;
      r.balV*=Math.exp(-dt*1.1);r.bal+=r.balV*dt;
      if(Math.abs(r.bal)>1){startAir(r);r.vy=40;r.vx=Math.sign(r.bal)*-160;r.rail=null;r.ry=0;r.yo+=r.ryT;crash(r);say(r,'Lost balance',0,true);return;}
      if(I.f&&!r.fPrev){r.ryT+=r.railSide?(r.ryT>0?-Math.PI:Math.PI):Math.PI;r.ryT=norm(r.ryT)||0;r.swaps++;r.bal*=.6;if(r===p)sfx('ui');}
      r.press=!r.railSide&&(I.bn||I.bt)?(I.bn?'Nose':'Tail'):null;if(r.press)r.pressT+=dt;}
    r.fPrev=I.f;
    r.ry+=norm(r.ryT-r.ry)*Math.min(1,dt*10);r.bp+=((r.press?(r.press==='Nose'?.3:-.3):0)-r.bp)*Math.min(1,dt*9);
    r.pitch+=norm(-Math.atan(gz)*Math.cos(r.ry)-r.pitch)*Math.min(1,dt*12);
    if(Math.random()<.5)spray(r.x,r.y,r.z,(Math.random()-.5)*160,60+Math.random()*120,r.vz*.4,.2+Math.random()*.2);
    if(pop||r.z>R.z2){leaveRail(r,pop);}
  }
  if(r.crashT<=0&&!r.fin&&r.mode!=='lift')collide(r);
}
/* collisions: trees, towers, rocks, signs crash you; buildings are solid walls you bounce off */
function collide(r){const bk=map.buckets,k0=(r.z/300)|0;
  {const L=bk[k0];if(!L)return;
    for(const t of L){if(r.y-t.y>t.h)continue;let nx,nz,pen;
      if(t.box){const dx=r.x-t.x,dz=r.z-t.z,lx=dx*t.cs-dz*t.sn,lz=dx*t.sn+dz*t.cs,R=7;
        if(Math.abs(lx)>t.hx+R||Math.abs(lz)>t.hz+R)continue;const px=t.hx+R-Math.abs(lx),pz=t.hz+R-Math.abs(lz);
        let ux=0,uz=0;if(px<pz){ux=Math.sign(lx)||1;pen=px;}else{uz=Math.sign(lz)||1;pen=pz;}nx=ux*t.cs+uz*t.sn;nz=-ux*t.sn+uz*t.cs;}
      else{const dx=r.x-t.x,dz=r.z-t.z,d2=dx*dx+dz*dz,rr=t.rad+5;if(d2>=rr*rr)continue;const d=Math.sqrt(d2)||1;nx=dx/d;nz=dz/d;pen=rr-d;}
      if(t.solid){r.x+=nx*pen;r.z+=nz*pen;const vn=r.vx*nx+r.vz*nz;if(vn<0){r.vx-=1.5*vn*nx;r.vz-=1.5*vn*nz;r.vx*=.6;r.vz*=.6;}
        if(-vn>420&&r.mode!=='air'){crash(r);say(r,'Hit a wall',0,true);}if(r===p)shake=Math.max(shake,.15);continue;}
      crash(r);r.x+=nx*pen;r.vx=nx*130;r.vz=Math.max(40,r.vz*.2);if(r===p)say(r,t.rad>15?'Wiped out':'Hit a tree',0,true);return;}}}
/* riders bump each other instead of passing through */
function riderBumps(){for(let i=0;i<riders.length;i++)for(let j=i+1;j<riders.length;j++){const a=riders[i],b=riders[j];
  if(a.mode==='lift'||b.mode==='lift'||a.crashT>0||b.crashT>0)continue;const dx=b.x-a.x,dz=b.z-a.z,dy=b.y-a.y,d=Math.hypot(dx,dz);
  if(d>0&&d<15&&Math.abs(dy)<28){const nx=dx/d,nz=dz/d,pen=(15-d)/2;a.x-=nx*pen;a.z-=nz*pen;b.x+=nx*pen;b.z+=nz*pen;
    const rv=(b.vx-a.vx)*nx+(b.vz-a.vz)*nz;if(rv<0){const im=-rv*.8;a.vx-=nx*im*.5;a.vz-=nz*im*.5;b.vx+=nx*im*.5;b.vz+=nz*im*.5;
      if(-rv>380){const v=Math.hypot(a.vx,a.vz)<Math.hypot(b.vx,b.vz)?a:b;crash(v);say(v,'Collision!',0,true);}else if(a===p||b===p){shake=Math.max(shake,.12);sfx('land',.2);}}}}}
function ai(r){const b=r.bot,I=r.inp;I.a=I.d=I.w=I.s=I.g1=I.g2=I.g3=I.bn=I.bt=I.jump=I.f=0;
  if(r.fin||r.crashT>0){b.plan=null;return;}
  if(r.mode==='air'){
    if(!b.plan){const T=Math.max(0,2*r.vy/G)+.32,u=Math.random(),P=b.plan={ft:0,st:0,g:null,T};
      const FT=Math.PI*2/FLIP+.1,S1=Math.PI*2/SPIN+.08,S5=Math.PI/SPIN+.06;if(T>FT+.45&&u<b.skill){P.ft=FT;P.st=u<b.skill*.6?S1:0;}else if(T>S1+.3)P.st=u<.5?S1:S5;else if(T>S5+.3)P.st=S5;
      if(T>.55)P.g=['g1','g2','g3'][(Math.random()*3)|0];}
    const P=b.plan;if(r.airT<P.ft)I.s=1;if(r.airT<P.st)I[b.dir>0?'a':'d']=1;if(P.g&&r.airT>.1&&r.airT<P.T-.3)I[P.g]=1;return;}
  b.plan=null;if(r.mode==='rail')return;
  let tx=b.lane+Math.sin(r.z*.0011+b.lane)*25,best=1e9;
  const k=(r.z/300)|0;for(let q=k;q<=k+2;q++){const L=map.buckets[q];if(L)for(const t of L){const dz=t.z-r.z;if(dz>-10&&dz<420&&dz<best&&Math.abs(t.x-r.x)<38){best=dz;tx=t.x+(r.x>=t.x?75:-75);}}}
  // line up rails/boxes in this rider's lane and ollie onto the tall ones
  for(const R of map.rails){const dz=R.z1-r.z;if(dz>0&&dz<720&&Math.abs(R.x-b.lane)<135){tx=R.x;if(!R.box&&dz>60&&dz<270&&Math.abs(r.x-R.x)<R.w)I.jump=1;break;}}
  const e=Math.max(-.7,Math.min(.7,(tx-r.x)*.007))-r.head;I.a=e>.03?1:0;I.d=e<-.03?1:0;
  for(const l of map.lips)if(r.z>l.z2-190&&r.z<l.z2-12&&Math.abs(r.x-l.cx)<l.hw)I.jump=1;
}

/* ---------- particles ---------- */
const NP=500,pPos=new Float32Array(NP*3).fill(-1e6),pVel=new Float32Array(NP*3),pLife=new Float32Array(NP);let pi=0;
const pGeo=new U.BufferGeometry();pGeo.setAttribute('position',new U.BufferAttribute(pPos,3));
const pts=new U.Points(pGeo,new U.PointsMaterial({color:0xffffff,size:4.5,transparent:true,opacity:.9,depthWrite:false,map:(()=>{const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d'),gr=g.createRadialGradient(16,16,1,16,16,15);gr.addColorStop(0,'#fff');gr.addColorStop(.6,'rgba(255,255,255,.8)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,32,32);return new U.CanvasTexture(c);})()}));
pts.frustumCulled=false;scene.add(pts);
function spray(x,y,z,vx,vy,vz,l){const i=pi++%NP;pPos[i*3]=x;pPos[i*3+1]=y;pPos[i*3+2]=z;pVel[i*3]=vx;pVel[i*3+1]=vy;pVel[i*3+2]=vz;pLife[i]=l;}
function puff(r,n,big){for(let i=0;i<n;i++)spray(r.x+(Math.random()-.5)*14,r.y+2,r.z,(Math.random()-.5)*(big?420:240),Math.random()*(big?380:200),r.vz*.3+(Math.random()-.5)*200,.4+Math.random()*.5);}

/* ---------- snowfall ---------- */
const SNN=1600,snP=new Float32Array(SNN*3);for(let i=0;i<SNN;i++){snP[i*3]=(Math.random()-.5)*900;snP[i*3+1]=Math.random()*600-200;snP[i*3+2]=Math.random()*900-200;}
const snG=new U.BufferGeometry();snG.setAttribute('position',new U.BufferAttribute(snP,3));
const snow=new U.Points(snG,new U.PointsMaterial({color:0xffffff,size:2.6,transparent:true,opacity:.85,depthWrite:false,map:pts.material.map}));snow.frustumCulled=false;scene.add(snow);
function snowUpdate(dt){const lv=save.set.snow;snow.visible=lv>0;if(!lv)return;snG.setDrawRange(0,lv===2?SNN:550);snow.position.copy(cam.position);
  for(let i=0;i<SNN;i++){let y=snP[i*3+1]-dt*(60+(i%7)*8),x=snP[i*3]+Math.sin(i+CLOTH.t.value)*dt*12;if(y<-250)y+=600;snP[i*3+1]=y;snP[i*3]=x;}snG.attributes.position.needsUpdate=true;}
/* ---------- view ---------- */
function place(r,dt){const R=r.sk.root;r.sk.head.scale.setScalar((save.set.bighead?1.55:1)*(r.sk.headS||1));R.scale.setScalar(r.sk.hs);R.position.set(r.x,r.y+.2,r.z);R.rotation.set(0,bodyYaw(r),0);
  r.sk.flipG.rotation.set(r.pitch+r.bp,0,-r.roll*(r.sw?-1:1)+r.tilt*Math.sin(r.pitch));
  const g=r.mode==='ground',tuck=g&&r.inp.w&&!r.charge&&!r.fin&&r.crashT<=0;
  if(r.mode==='lift'){r.sk.flipG.rotation.set(0,0,0);r.sk.pose({crouch:1,idle:true},dt);return;}
  r.sk.pose({crouch:(g?(r.charge>0?.35+.65*r.charge:tuck?.8:.3):r.mode==='rail'?.45:.3)+r.comp*.5,tuck,air:r.mode==='air'&&r.airT>.12,grab:r.grab,steer:r.steer*(r.sw?-1:1),look:r.sw&&r.mode!=='air'?.85:0},dt);}
const fmt=t=>{const m=(t/60)|0,s=t-m*60;return m+':'+(s<10?'0':'')+s.toFixed(2);};
function hud(dt){
  $('score').textContent=p.score.toLocaleString();$('mult').textContent='x'+p.mult;$('spd').textContent=save.set.units==='mph'?Math.round(Math.hypot(p.vx,p.vz)*.11*.621)+' mph':Math.round(Math.hypot(p.vx,p.vz)*.11)+' km/h';
  $('swb').classList.toggle('on',!!p.sw);
  const onR=p.mode==='rail';$('bal').classList.toggle('hide',!onR);if(onR){const b=$('bal').lastChild;b.style.left=(50+p.bal*48)+'%';b.style.background=Math.abs(p.bal)>.7?'#ff4d6d':Math.abs(p.bal)>.4?'#ffb03f':'#39d98a';}
  if(curMode==='time')$('timer').textContent=fmt(p.time);
  feed.forEach(f=>f.t-=dt);feed=feed.filter(f=>f.t>0);
  hudT-=dt;if(hudT<=0){hudT=.2;if(map.fr)resortHud();
    if(curMode==='battle'){$('board').innerHTML=riders.slice().sort((a,b)=>b.score-a.score).map((r,i)=>'<div class="'+(r===p?'me':'')+'"><span>'+(i+1)+'. '+r.name+(r===p&&isStaff()?' <i class=tag>'+save.acct.role.toUpperCase()+'</i>':'')+'</span><span>'+r.score.toLocaleString()+'</span></div>').join('');
      $('feed').innerHTML=feed.map(f=>'<div>'+f.s+'</div>').join('');}}
}
const nv=new U.Vector3(),zAx=new U.Vector3(0,0,1),_hp=new U.Vector3();
const shadow=new U.Mesh(new U.CircleGeometry(13,20),new U.MeshBasicMaterial({color:0x0a1030,transparent:true,opacity:.2,depthWrite:false}));scene.add(shadow);
function drawRun(dt){
  for(let i=0;i<NP;i++)if(pLife[i]>0){pLife[i]-=dt;const o=i*3;if(pLife[i]<=0){pPos[o+1]=-1e6;continue;}pVel[o+1]-=520*dt;pPos[o]+=pVel[o]*dt;pPos[o+1]+=pVel[o+1]*dt;pPos[o+2]+=pVel[o+2]*dt;}
  pGeo.attributes.position.needsUpdate=true;
  for(const r of riders)place(r,dt);
  const gh=hAt(p.x,p.z),e=3,gx=(hAt(p.x+e,p.z)-hAt(p.x-e,p.z))/(2*e),gz=(hAt(p.x,p.z+e)-hAt(p.x,p.z-e))/(2*e);
  nv.set(-gx,1,-gz).normalize();shadow.position.set(p.x+nv.x*1.5,gh+nv.y*1.5,p.z+nv.z*1.5);shadow.quaternion.setFromUnitVectors(zAx,nv);
  const hgt=Math.max(0,p.y-gh);shadow.scale.setScalar(Math.max(.35,1-hgt/420));shadow.material.opacity=hgt>4?.26*Math.max(.3,1-hgt/500):0;
  sun.position.set(p.x+sunDir.x*1800,p.y+sunDir.y*1800,p.z+sunDir.z*1800);sun.target.position.set(p.x,p.y,p.z+150);sun.target.updateMatrixWorld();
  const sp=Math.hypot(p.vx,p.vz);let tx=sp>60?p.vx/sp:Math.sin(p.head),tz=sp>60?p.vz/sp:Math.cos(p.head);if(p.mode==='lift'){tx=-.35;tz=-1;}else if(tz<.25){tz=.25;const n=Math.hypot(tx,tz);tx/=n;tz/=n;}
  const k=1-Math.exp(-dt*3.2);camD.x+=(tx-camD.x)*k;camD.z+=(tz-camD.z)*k;const n=Math.hypot(camD.x,camD.z)||1;camD.x/=n;camD.z/=n;
  const VW=save.set.view,Z=save.set.zoom;let cx,cy,cz,kk=1-Math.exp(-dt*9),ky=1-Math.exp(-dt*6);p.sk.head.visible=VW!=='first';
  if(VW==='first'){p.sk.head.getWorldPosition(_hp);cx=_hp.x;cy=_hp.y+3;cz=_hp.z;kk=ky=1;}
  else if(VW==='side'){const px=camD.z,pz=-camD.x;cx=p.x+px*230*Z-camD.x*70;cz=p.z+pz*230*Z-camD.z*70;cy=Math.max(p.y+45*Z,hAt(cx,cz)+30);}
  else if(VW==='drone'){cx=p.x-camD.x*120*Z;cz=p.z-camD.z*120*Z;cy=p.y+300*Z;}
  else{const back=(150+Math.min(50,sp*.05))*Z;cx=p.x-camD.x*back;cz=p.z-camD.z*back;cy=Math.max(p.y+72*Z,hAt(cx,cz)+40);}
  cam.position.x+=(cx-cam.position.x)*kk;cam.position.y+=(cy-cam.position.y)*ky;cam.position.z+=(cz-cam.position.z)*kk;
  if(VW==='first')cam.lookAt(cam.position.x+camD.x*200,cam.position.y-30,cam.position.z+camD.z*200);
  else cam.lookAt(p.x+camD.x*(VW==='third'?130:20),p.y+8,p.z+camD.z*(VW==='third'?130:20));
  if(VW==='third')cam.rotateZ(p.roll*.12*(p.sw?-1:1));
  if(save.set.shake&&shake>0&&dt>0){cam.position.x+=(Math.random()-.5)*shake*14;cam.position.y+=(Math.random()-.5)*shake*14;shake=Math.max(0,shake-dt*1.6);}
  snowUpdate(dt);
  const fv=save.set.fov-2+Math.min(16,sp*.018);if(Math.abs(cam.fov-fv)>.2){cam.fov+=(fv-cam.fov)*Math.min(1,dt*4);cam.updateProjectionMatrix();}
  const mg=runG.userData.mtn;mg.position.set(cam.position.x*.95,cam.position.y-3700,cam.position.z+17000);
  const ch=$('charge');ch.style.opacity=p.charge>0?1:0;ch.firstChild.style.width=(p.charge*100)+'%';
  fxRun(dt);updateLift(dt);if(map.fr)updateLod();present(scene,cam,dt);
}

/* ---------- flow ---------- */
function newStats(){return {corks:0,switchTricks:0,doubles:0,big:0,butterT:0,slides:0,airT:0,grabT:0,finished:0,wins:0};}
function startRun(id,gm){curMap=id;curMode=gm||curMode;const FR=!!MAPS[id].fr;if(FR)curMode='free';if(FR)buildResort();else buildMap(id);buildGfx();
  riders=curMode==='battle'?[p].concat(BOTS):[p];BOTS.forEach(b=>b.sk.root.visible=curMode==='battle');
  p.stat=statOf(save.load.skis);p.name=save.acct?save.acct.u:(save.set.name||'You');BOTS.forEach(b=>b.bot.sk_=b.bot.sk_||b.bot.skill);BOTS.forEach(b=>b.bot.skill=Math.min(1,b.bot.sk_*[.5,1,1.45][save.set.bots]));spawn(p,0);if(curMode==='battle')BOTS.forEach(b=>spawn(b,b.bot.lane));audioStart();
  clearDebris();clearTracks();riders.forEach(r=>r.sk.gear(true));sk.setPoles(save.set.poles);st=newStats();endShown=false;paused=false;menuKind=null;shake=0;feed=[];pPos.fill(-1e6);pLife.fill(0);camD={x:0,z:1};cam.position.set(0,p.y+80,p.z-160);
  for(const k in keys)keys[k]=0;
  $('mapName').textContent=MODES[curMode].n+' · '+MAPS[id].n;$('timer').textContent='';$('board').innerHTML='';$('feed').innerHTML='';$('board').classList.toggle('hide',curMode!=='battle');
  $('prompt').classList.toggle('hide',!FR);if(FR){arriveTop(p);if(typeof tmapOpen!=='undefined'&&tmapOpen)closeTrailMap();}
  setMode('run');}
function openMenu(){openSettings();}
function endRun(){endShown=true;const key=curMode+'_'+curMap,b=save.best[key]||0;let title,html;const lv0=level();
  let xp=0,coins=0;
  if(curMode==='time'){const t=+p.time.toFixed(2),nb=!b||t<b;if(nb){save.best[key]=t;}title=fmt(t);html=nb?'New best time!':'Best: '+fmt(b);xp=300+(nb?200:0);coins=60+(nb?60:0);}
  else{if(p.score>b)save.best[key]=p.score;xp=150+Math.round(p.score/25);coins=40+Math.round(p.score/120);
    if(curMode==='battle'){const rk=riders.slice().sort((a,c)=>c.score-a.score),pos=rk.indexOf(p)+1;title=pos===1?'VICTORY':'#'+pos+' of 4';if(pos===1){st.wins=1;xp+=300;coins+=100;}
      html=rk.map((r,i)=>'<div class="'+(r===p?'me':'')+'">'+(i+1)+'. '+r.name+' — '+r.score.toLocaleString()+'</div>').join('');}
    else{title=p.score.toLocaleString();html=p.score>b&&p.score>0?'New best!':'Best: '+b.toLocaleString();}}
  const done=questProgress({corks:st.corks,switchTricks:st.switchTricks,doubles:st.doubles,big:st.big,butterT:st.butterT,slides:st.slides,airT:st.airT,grabT:st.grabT,runs:1,wins:st.wins,bestRun:p.score});
  save.xp+=xp;save.coins+=coins;persist();const lv1=level();
  $('endMap').textContent=MODES[curMode].n+' · '+MAPS[curMap].n;$('final').textContent=title;$('best').innerHTML=html;
  $('rew').innerHTML='<span>+'+xp.toLocaleString()+' XP</span><span><i class="coin"></i>'+coins.toLocaleString()+'</span>'+(lv1>lv0?'<span class="lvup">LEVEL UP · '+lv1+'</span>':'')+
    done.map(q=>'<span class="qd">Quest done: '+q.t+'</span>').join('');
  $('end').classList.remove('hide');refreshWallet();}
let last=0;
function frame(t){
  const dt=Math.min(.05,(t-last)/1000||0);last=t;if(dt>0){fpsA+=(1/dt-fpsA)*.05;if(save.set.fps)$('fps').textContent=Math.round(fpsA)+' FPS';}
  if(mode==='run'){
    if(!paused){const ts=save.set.slowmo&&p.mode==='air'&&p.airT>.35?.55:1,sd=dt*ts,n=Math.max(1,Math.ceil(sd*120)),h=sd/n;if(dt>0)for(let i=0;i<n;i++){for(const r of riders){if(r.bot)ai(r);step(r,h);}if(riders.length>1)riderBumps();}stepDebris(sd);
      CLOTH.t.value+=dt;CLOTH.w.value+=((Math.min(1,Math.hypot(p.vx,p.vz)/900)*(p.mode==='air'?1.4:1))-CLOTH.w.value)*Math.min(1,dt*3);
      sfxWind(Math.hypot(p.vx,p.vz),p.mode,Math.abs(p.steer));hud(dt);if(p.fin&&!endShown&&p.mode==='ground'&&Math.hypot(p.vx,p.vz)<8)endRun();}
    if(paused)sfxWind(0);drawRun(paused?0:dt);}
  else{sfxWind(0);if(mode==='queue')tickQueue(dt);drawLobby(dt);}
  requestAnimationFrame(frame);
}
