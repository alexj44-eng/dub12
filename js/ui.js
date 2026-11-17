/* DUB12 — lobby UI: play, locker, shop, pass, quests, leaderboard, map, ski designer */
'use strict';
let view='play',lobbyYaw=.45,lobbyTilt=0,lobbyZoom=1,dragY=0,dragX=null,dragMoved=0,qT=0,lockCat='jacket',tryLoad=null;
const mouse=new U.Vector2(),rayL=new U.Raycaster();
const owned=id=>isStaff()||save.owned.includes(id);
const lvlOk=l=>isStaff()||level()>=l;
const coinHTML=n=>'<i class="coin"></i>'+n.toLocaleString();
function toast(msg){const t=$('toast');t.innerHTML=msg;t.classList.remove('go');void t.offsetWidth;t.classList.add('go');}
function statBars(id){const st=statOf(id);return '<div class="stats">'+['Speed','Pop','Spin'].map((n,i)=>'<div><span>'+n+'</span><i>'+'<b></b>'.repeat(st[i])+'<u></u>'.repeat(5-st[i])+'</i></div>').join('')+'</div>';}
function refreshWallet(){const lv=level(),x=save.xp%XP_PER_LVL;$('lvl').textContent=lv;$('xpbar').style.width=(x/XP_PER_LVL*100)+'%';$('xptxt').textContent=x+' / '+XP_PER_LVL+' XP';$('coins').innerHTML=coinHTML(save.coins);if(typeof refreshAcctChip==='function')refreshAcctChip();else{$('acctBtn').textContent=save.acct?save.acct.u:'LOG IN';$('acctBtn').classList.toggle('in',!!save.acct);}document.querySelector('#nav [data-v=admin]').classList.toggle('hide',!isAdmin());
  const bp=PASS.filter(t=>t.t<=lv&&!save.claimed.includes(t.t)).length,bq=save.q.list.filter(q=>q.prog>=q.goal&&!q.claimed).length;
  $('badgeP').textContent=bp;$('badgeP').classList.toggle('hide',!bp);$('badgeQ').textContent=bq;$('badgeQ').classList.toggle('hide',!bq);}
function questProgress(v){ensureQuests();const done=[];save.q.list.forEach(q=>{if(q.prog>=q.goal)return;const a=v[q.k]||0;q.prog=q.max?Math.max(q.prog,a):q.prog+a;if(q.prog>=q.goal){q.prog=q.goal;done.push(q);}});return done;}

/* ---------- modes & views ---------- */
function setMode(m){mode=m;if(sk)sk.head.visible=true;const run=m==='run';$('ui').classList.toggle('hide',run);$('hud').classList.toggle('hide',!run);$('end').classList.add('hide');$('count').classList.add('hide');$('settings').classList.add('hide');paused=false;
  $('ready').classList.remove('q');$('qstat').innerHTML='';
  if(run)scene.add(sk.root);else{lobby.add(sk.root);cv.style.background='linear-gradient(#2d4a9a 0%,#7f8fd0 38%,#f6b9a0 70%,#ffe2c4 100%)';setView('play');}}
function setView(v){if(tryLoad&&v!=='shop'){tryLoad=null;sk.apply(save.load,save.body);}
  view=v;document.querySelectorAll('.view').forEach(e=>e.classList.toggle('hide',e.id!=='v-'+v));
  document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.v===v||((v==='map'||v==='select')&&b.dataset.v==='play')||(v==='design'&&b.dataset.v==='locker')));
  $('pins').classList.toggle('hide',v!=='map');$('top').classList.toggle('dim',v==='design');
  if(v==='select')renderSelect.init=false;
  refreshWallet();try{({select:renderSelect,play:renderPlay,locker:renderLocker,shop:renderShop,pass:renderPass,quests:renderQuests,leaders:renderLeaders,map:renderMap,admin:renderAdmin})[v]?.();}catch(e){console.error('view',v,e);}sfx('ui');}
const modeLabel=()=>MAPS[save.map].fr?'🏔️ Free Roam':MODES[save.gm].i+' '+MODES[save.gm].n;
function renderPlay(){if(!MAPS[save.map])save.map='park';const M=MAPS[save.map],lk=!lvlOk(M.lvl);
  $('mpName').textContent=M.n;$('mpSub').textContent=modeLabel()+' · '+M.diff;$('mpThumb').style.background=M.sky;
  $('ready').disabled=lk;$('ready').textContent=lk?'REACH LV '+M.lvl:'QUEUE';
  ensureQuests();$('qmini').innerHTML='<div class="lbl">Daily quests</div>'+save.q.list.map(q=>'<div class="qm'+(q.prog>=q.goal?' done':'')+'"><span>'+q.t+'</span><i style="width:'+(q.prog/q.goal*100)+'%"></i></div>').join('');}
function toggleQueue(){if(mode==='queue'){mode='lobby';$('ready').classList.remove('q');renderPlay();$('qstat').innerHTML='';$('count').classList.add('hide');return;}
  if(mode!=='lobby'||!lvlOk(MAPS[save.map].lvl))return;setView('play');mode='queue';qT=0;$('ready').classList.add('q');$('ready').textContent='CANCEL';}
/* ---------- select screen: pick a mode and a map, then confirm ---------- */
let selMap='park',selMode='battle';
function renderSelect(){if(!renderSelect.init){selMap=save.map;selMode=save.gm;}renderSelect.init=true;
  const fr=!!MAPS[selMap].fr;
  $('selModes').innerHTML=Object.keys(MODES).map(id=>{const Mo=MODES[id],dis=fr;return '<div class="mode'+(!fr&&selMode===id?' on':'')+(dis?' dis':'')+'" data-m="'+id+'"><i>'+Mo.i+'</i><b>'+Mo.n+'</b><span>'+Mo.d+'</span></div>';}).join('')+
    (fr?'<div class="mode on"><i>🏔️</i><b>Free Roam</b><span>Explore the resort. No timer, no rivals.</span></div>':'');
  $('selModes').querySelectorAll('[data-m]').forEach(d=>d.onclick=()=>{if(fr)return;selMode=d.dataset.m;sfx('ui');renderSelect();});
  $('selMaps').innerHTML=Object.keys(MAPS).map(id=>{const M=MAPS[id],lk=!lvlOk(M.lvl),b=save.best[(M.fr?'free':selMode)+'_'+id];
    return '<div class="smap'+(selMap===id?' on':'')+(lk?' lk':'')+'" data-m="'+id+'"><div class="sth" style="background:'+M.sky+'">'+(M.fr?'<em>FREE ROAM</em>':'')+'</div><b>'+(lk?'🔒 ':'')+M.n+'</b><span>'+M.zone+' · '+M.diff+'</span><small>'+(lk?'Unlocks at level '+M.lvl:M.d)+'</small><i>Best: '+(b?(selMode==='time'&&!M.fr?fmt(b):b.toLocaleString()):'—')+'</i></div>';}).join('');
  $('selMaps').querySelectorAll('.smap').forEach(d=>d.onclick=()=>{if(d.classList.contains('lk')){toast('Reach level '+MAPS[d.dataset.m].lvl+' to unlock');return;}selMap=d.dataset.m;sfx('ui');renderSelect();});
  $('selGo').textContent='CONFIRM · '+MAPS[selMap].n.toUpperCase();}
function tickQueue(dt){qT+=dt;const bt=save.gm==='battle'&&!MAPS[save.map].fr;
  if(qT<2.2){const n=bt?Math.min(4,1+Math.floor(qT/.6)):1;
    $('qstat').innerHTML=bt?'Filling lobby '+n+'/4<br>'+['You'].concat(BOTS.map(b=>b.name)).slice(0,n).join(' · '):'Loading '+MAPS[save.map].n+'.'.repeat(1+((qT*3)|0)%3);}
  else{$('qstat').innerHTML=bt?'Lobby full':'Ready';$('count').classList.remove('hide');$('countMap').textContent=MODES[save.gm].n+' · '+MAPS[save.map].n;const n=3-Math.floor((qT-2.2)/.7);$('countN').textContent=n>0?n:'GO';if(qT>2.2+.7*3.4)startRun(save.map,save.gm);}}

/* ---------- lobby render ---------- */
let lt=0;
function drawLobby(dt){lt+=dt;CLOTH.t.value+=dt*.4;CLOTH.w.value=.12;const R=sk.root;R.position.set(0,7.6,0);R.scale.setScalar(2.4*sk.hs);
  const yaw=view==='design'?1.25:lobbyYaw+(dragX===null?Math.sin(lt*.5)*.06:0);R.rotation.y+=(yaw-R.rotation.y)*Math.min(1,dt*6);sk.flipG.rotation.set(0,0,0);
  const gd=view==='locker'&&(lockCat==='goggles'||lockCat==='helmet')||view==='shop'&&tryLoad;
  sk.pose({crouch:.05+Math.sin(lt*1.6)*.025,idle:true,gogUp:!gd,peek:view==='locker'&&lockCat==='eye'},dt);
  const V=LV[view]||LV.play,k=1-Math.exp(-dt*4.5);lcp.lerp(_v.fromArray(V.p),k);lct.lerp(_v.fromArray(V.t),k);
  // player zoom/tilt around the preview target (map and designer keep their fixed shots)
  const free=view!=='map'&&view!=='design',zm=free?lobbyZoom:1,tl=free?lobbyTilt:0;
  lcam.position.copy(lct).addScaledVector(_v.subVectors(lcp,lct),zm);lcam.position.y+=tl*zm;lcam.lookAt(lct.x,lct.y+(free?(1-zm)*-14:0),lct.z);
  if(Math.abs(lcam.fov-V.f)>.05){lcam.fov+=(V.f-lcam.fov)*k;lcam.updateProjectionMatrix();}
  placePins();if(lobbySky)lobbySky.material.uniforms.uTime.value+=dt;present(lobby,lcam,dt);}

/* ---------- locker ---------- */
const BODYTABS=[['skin','Skin'],['hair','Hair'],['hairColor','Hair color'],['eye','Eyes']];
let trickSlot=0;
function renderTricks(el,nm){el.className='grid';
  const slots=document.createElement('div');slots.className='slots';
  slots.innerHTML=save.tricks.g.map((id,i)=>'<div class="slot'+(trickSlot===i?' on':'')+'" data-i="'+i+'"><small>GRAB '+(i+1)+' · '+keyName(binds()['g'+(i+1)][0])+'</small><b>'+IDX[id].n+'</b></div>').join('')+
    '<div class="slot sty'+(trickSlot===3?' on':'')+'" data-i="3"><small>SPIN STYLE</small><b>'+IDX[save.tricks.style].n+'</b></div>';
  slots.querySelectorAll('.slot').forEach(d=>d.onclick=()=>{trickSlot=+d.dataset.i;renderLocker();});el.appendChild(slots);
  const kind=trickSlot===3?'style':'grab';
  TRICKS.filter(t=>t.k===kind).forEach(t=>{const own=owned(t.id),eq=kind==='style'?save.tricks.style===t.id:save.tricks.g[trickSlot]===t.id,d=document.createElement('div');
    d.className='card'+(eq?' on':'')+(own?'':' locked');d.style.setProperty('--r',RAR[t.rarity].c);
    const th=itemThumb(t);d.innerHTML=(th?'<img src="'+th+'">':'<div class="tico">'+t.n.split(' ').map(w=>w[0]).join('')+'</div>')+'<span>'+(own?t.n:coinHTML(t.price))+'</span>'+(own?'':'<em>🔒</em>');
    d.onclick=()=>{if(!own){setView('shop');openDetail(t);return;}
      if(kind==='style')save.tricks.style=t.id;else{const o=save.tricks.g.indexOf(t.id);if(o>=0&&o!==trickSlot)save.tricks.g[o]=save.tricks.g[trickSlot];save.tricks.g[trickSlot]=t.id;}
      persist();sfx('ui');renderLocker();};el.appendChild(d);});
  const sel=kind==='style'?IDX[save.tricks.style]:IDX[save.tricks.g[trickSlot]];
  nm.innerHTML='<b>'+sel.n+'</b>'+sel.d+' Score bonus x'+sel.m.toFixed(2)+(kind==='style'?'. Used when you flip and spin in the same jump.':'. Hold the grab key in the air.');}
/* quick gear toggles, always visible at the top of the locker */
const GEAR_TOG=[['Hood',[['Down',false],['Up',true]],()=>!!save.body.hood,v=>{save.body.hood=v;}],
  ['Goggles',[['On face','face'],['On helmet','helmet'],['Off','off']],()=>save.set.gog,v=>{save.set.gog=v;}],
  ['Goggles + hood',[['Under hood',0],['Over hood',1]],()=>save.set.gogOver,v=>{save.set.gogOver=v;}],
  ['Poles',[['On',1],['Off',0]],()=>save.set.poles,v=>{save.set.poles=v;}]];
function renderToggles(){const tg=$('ltog');
  tg.innerHTML=GEAR_TOG.map((t,i)=>'<div class="tg"><span>'+t[0]+'</span>'+t[1].map((o,j)=>'<button data-i="'+i+'" data-j="'+j+'" class="'+(t[2]()===o[1]?'on':'')+'">'+o[0]+'</button>').join('')+'</div>').join('');
  tg.querySelectorAll('button').forEach(b=>b.onclick=()=>{const t=GEAR_TOG[+b.dataset.i];t[3](t[1][+b.dataset.j][1]);persist();
    sk.gogMode=save.set.gog;sk.gogOver=!!save.set.gogOver;sk.apply(save.load,save.body);sk.setPoles(save.set.poles);for(const k in THUMB)delete THUMB[k];sfx('ui');renderLocker();});}
function renderLocker(){
  renderToggles();
  const cats=$('lcats');cats.innerHTML='<div class="lbl">Character</div>'+BODYTABS.map(b=>'<button data-c="'+b[0]+'">'+b[1]+'</button>').join('')+'<div class="lbl">Gear</div>'+CATS.map(c=>'<button data-c="'+c[0]+'">'+c[1]+'</button>').join('');
  cats.querySelectorAll('button').forEach(b=>{b.classList.toggle('on',b.dataset.c===lockCat);b.onclick=()=>{lockCat=b.dataset.c;renderLocker();};});
  const el=$('litems');el.innerHTML='';el.className='grid';const nm=$('lname');$('ldesign').classList.toggle('hide',lockCat!=='skis');
  const bd=save.body;
  const swatch=(col,on,fn)=>{const d=document.createElement('div');d.className='card sw'+(on?' on':'');d.innerHTML='<div class="dot" style="background:'+hex(col)+'"></div>';d.onclick=fn;el.appendChild(d);};
  const setB=(k,v)=>{save.body[k]=v;persist();sk.apply(save.load,save.body);for(const t in THUMB)delete THUMB[t];renderLocker();};
  if(lockCat==='skin'){BODY.skin.forEach((c,i)=>swatch(c,bd.skin===i,()=>setB('skin',i)));nm.innerHTML='<b>Skin tone</b>';}
  else if(lockCat==='hairColor'){BODY.hairColor.forEach((c,i)=>swatch(c,bd.hairColor===i,()=>setB('hairColor',i)));nm.innerHTML='<b>Hair color</b>';}
  else if(lockCat==='eye'){BODY.eye.forEach((c,i)=>swatch(c,bd.eye===i,()=>setB('eye',i)));nm.innerHTML='<b>Eye color</b>Goggles flip up in the lobby so you can see them.';}
  else if(lockCat==='hair'){BODY.hair.forEach(h=>{const d=document.createElement('div');d.className='card'+(bd.hair===h[0]?' on':'');
      d.innerHTML='<img src="'+thumb('hair_'+h[0]+bd.hairColor+bd.skin,save.load,Object.assign({},bd,{hair:h[0]}),'hair')+'"><span>'+h[1]+'</span>';d.onclick=()=>setB('hair',h[0]);el.appendChild(d);});nm.innerHTML='<b>Hair style</b>Shows below the helmet.';}
  else if(lockCat==='build'||lockCat==='height'){el.className='grid chips';BODY[lockCat].forEach(b=>{const d=document.createElement('div');d.className='card chip'+(bd[lockCat]===b[0]?' on':'');d.textContent=b[1];d.onclick=()=>setB(lockCat,b[0]);el.appendChild(d);});nm.innerHTML='<b>'+(lockCat==='build'?'Body build':'Height')+'</b>';}
  else{
    if(lockCat==='trick'){renderTricks(el,nm);return;}
    const list=ITEMS.filter(i=>i.cat===lockCat).sort((a,b)=>(owned(b.id)-owned(a.id))||(Object.keys(RAR).indexOf(a.rarity)-Object.keys(RAR).indexOf(b.rarity)));
    if(lockCat==='skis')[0,1,2].forEach(n=>{const id='custom'+n,d=document.createElement('div');d.className='card ski'+(save.load.skis===id?' on':'');
      d.innerHTML='<div class="skiimg" style="background-image:url('+skiCanvas(id).toDataURL()+')"></div><span>My design '+(n+1)+'</span>';
      d.onclick=()=>{if(!save.custom[n]){openDesigner(n);return;}save.load.skis=id;persist();sk.apply(save.load,save.body);renderLocker();};el.appendChild(d);});
    list.forEach(it=>{const own=owned(it.id),d=document.createElement('div');d.className='card'+(it.cat==='skis'?' ski':'')+(save.load[lockCat]===it.id?' on':'')+(own?'':' locked');d.style.setProperty('--r',RAR[it.rarity].c);
      d.innerHTML=(it.cat==='skis'?'<div class="skiimg" style="background-image:url('+skiCanvas(it.id).toDataURL()+')"></div>':'<img src="'+itemThumb(it)+'">')+'<span>'+(own?it.n.replace(/^[A-Z0-9. ]+ (?=[A-Z][a-z])/,''):(it.src==='pass'?'Pass tier '+PASS.find(t=>t.item===it.id).t:coinHTML(it.price)))+'</span>'+(own?'':'<em>🔒</em>');
      d.onclick=()=>{if(!own){if(it.src==='pass')setView('pass');else{setView('shop');openDetail(it);}return;}save.load[lockCat]=it.id;persist();sk.apply(save.load,save.body);renderLocker();};el.appendChild(d);});
    if(lockCat==='jacket'){const row=(label,key,skip)=>{const l=document.createElement('div');l.className='lbl';l.style.gridColumn='1/-1';l.style.marginTop='8px';l.textContent=label;el.appendChild(l);
        const box=document.createElement('div');box.className='swrow';el.appendChild(box);
        JCOL.forEach((c,i)=>{const d=document.createElement('button');d.className='swd'+(save.body[key]===i?' on':'');d.title=c[0];d.style.background=hex(c[1]);d.onclick=()=>setB(key,i);box.appendChild(d);});};
      row('Jacket colour','jc');if(IDX[save.load.jacket].stripe!==false)row('Stripe colour','sc');}
    const cur=IDX[save.load[lockCat]];nm.innerHTML=lockCat==='skis'?'<b>'+(cur?cur.n:'Custom skis')+'</b>'+statBars(save.load.skis):cur?'<b style="color:'+RAR[cur.rarity].c+'">'+cur.n+'</b>'+RAR[cur.rarity].n+' '+CATS.find(c=>c[0]===lockCat)[1].toLowerCase():'<b>Custom skis</b>Your own design';}
}

/* ---------- shop ---------- */
function shopRot(){const r=rng(today()*131+7),pool=ITEMS.filter(i=>i.src!=='pass'&&i.src!=='starter');const hi=pool.filter(i=>i.rarity==='legendary'||i.rarity==='epic');
  const feat=[];while(feat.length<2){const it=hi[(r()*hi.length)|0];if(!feat.includes(it))feat.push(it);}
  const daily=[];while(daily.length<6){const it=pool[(r()*pool.length)|0];if(!feat.includes(it)&&!daily.includes(it))daily.push(it);}return {feat,daily};}
let shopFilter='all';
function card(it,big){const own=owned(it.id),d=document.createElement('div');d.className='scard'+(big?' big':'')+(own?' own':'');d.style.setProperty('--r',RAR[it.rarity].c);
  const th=it.cat==='skis'?null:itemThumb(it),img=it.cat==='skis'?'<div class="skiimg h" style="background-image:url('+skiCanvas(it.id).toDataURL()+')"></div>':th?'<img src="'+th+'">':'<div class="tico">'+it.n.split(' ').map(w=>w[0]).join('')+'</div>';
  d.innerHTML='<div class="art">'+img+'</div><div class="meta"><small>'+RAR[it.rarity].n+' '+CATS.find(c=>c[0]===it.cat)[1]+'</small><b>'+it.n+'</b><span>'+(own?'OWNED':coinHTML(it.price))+'</span></div>';
  d.onclick=()=>openDetail(it);return d;}
function renderShop(){const {feat,daily}=shopRot();
  const ms=86400000-((Date.now()-new Date().getTimezoneOffset()*60000)%86400000);$('reset').textContent='Resets in '+Math.floor(ms/3600000)+'h '+Math.floor(ms/60000)%60+'m';
  const f=$('sfeat');f.innerHTML='';feat.forEach(it=>f.appendChild(card(it,true)));
  const dl=$('sdaily');dl.innerHTML='';daily.forEach(it=>dl.appendChild(card(it)));
  const fl=$('sfilt');fl.innerHTML=[['all','All']].concat(CATS).map(c=>'<button data-f="'+c[0]+'" class="'+(shopFilter===c[0]?'on':'')+'">'+c[1]+'</button>').join('');
  fl.querySelectorAll('button').forEach(b=>b.onclick=()=>{shopFilter=b.dataset.f;renderShop();});
  const al=$('sall');al.innerHTML='';ITEMS.filter(i=>i.src==='shop'&&(shopFilter==='all'||i.cat===shopFilter)).forEach(it=>al.appendChild(card(it)));}
let detailIt=null;
function openDetail(it){detailIt=it;const own=owned(it.id);$('detail').classList.remove('hide');const th=it.cat==='skis'?null:itemThumb(it);$('dArt').innerHTML=it.cat==='skis'?'<div class="skiimg h" style="background-image:url('+skiCanvas(it.id).toDataURL()+')"></div>':th?'<img src="'+th+'">':'<div class="tico big">'+it.n.split(' ').map(w=>w[0]).join('')+'</div>';
  $('dRar').textContent=RAR[it.rarity].n+' '+CATS.find(c=>c[0]===it.cat)[1];$('dRar').style.color=RAR[it.rarity].c;$('dName').textContent=it.n;
  $('dBuy').innerHTML=own?(it.cat==='trick'?'EQUIP':'EQUIP'):it.src==='pass'?'BATTLE PASS':'BUY '+coinHTML(it.price);$('dBuy').disabled=!own&&(it.src==='pass'||save.coins<it.price);
  $('dExtra').innerHTML=it.cat==='skis'?statBars(it.id):it.cat==='trick'?'<div class="tdesc">'+it.d+' Score bonus x'+it.m.toFixed(2)+'</div>':'';
  $('dTry').classList.toggle('hide',it.cat==='trick');
  $('dNote').textContent=isStaff()&&!save.owned.includes(it.id)?'Unlocked by your '+save.acct.role+' account.':own?'You own this.':it.src==='pass'?'Unlocks at pass tier '+PASS.find(t=>t.item===it.id).t+'.':save.coins<it.price?'You need '+(it.price-save.coins).toLocaleString()+' more coins. Finish runs and quests to earn them.':'';}
function tryOn(){if(!detailIt)return;tryLoad=Object.assign({},save.load,{[detailIt.cat]:detailIt.id});sk.apply(tryLoad,save.body);$('detail').classList.add('hide');toast('Trying on <b>'+detailIt.n+'</b>');}
function buyOrEquip(){const it=detailIt;if(!it)return;
  if(!owned(it.id)){if(it.src==='pass'||save.coins<it.price)return;save.coins-=it.price;save.owned.push(it.id);sfx('buy');toast('Unlocked <b>'+it.n+'</b>');}
  if(it.cat==='trick'){if(it.k==='style')save.tricks.style=it.id;else if(!save.tricks.g.includes(it.id))save.tricks.g[2]=it.id;}else save.load[it.cat]=it.id;tryLoad=null;persist();sk.apply(save.load,save.body);$('detail').classList.add('hide');renderShop();refreshWallet();}

/* ---------- pass ---------- */
function renderPass(){const lv=isStaff()?PASS_TIERS:level(),tr=$('track');tr.innerHTML='';
  $('pLv').textContent='Level '+lv;$('pXp').style.width=(save.xp%XP_PER_LVL/XP_PER_LVL*100)+'%';
  PASS.forEach(t=>{const it=t.item&&IDX[t.item],got=save.claimed.includes(t.t),can=t.t<=lv&&!got,d=document.createElement('div');
    d.className='tier'+(got?' got':can?' can':' lock');if(it)d.style.setProperty('--r',RAR[it.rarity].c);
    d.innerHTML='<small>'+t.t+'</small><div class="art">'+(it?(it.cat==='skis'?'<div class="skiimg h" style="background-image:url('+skiCanvas(it.id).toDataURL()+')"></div>':'<img src="'+itemThumb(it)+'">'):'<div class="cbig"><i class="coin"></i>'+t.coins+'</div>')+'</div><b>'+(it?it.n:t.coins+' coins')+'</b>'+(can?'<button>CLAIM</button>':got?'<em>✓</em>':'<em>🔒</em>');
    if(can)d.querySelector('button').onclick=()=>{claimTier(t);renderPass();};tr.appendChild(d);});
  const c=tr.querySelector('.can')||tr.children[Math.max(0,lv-2)];if(c)tr.scrollLeft=c.offsetLeft-60;}
function claimTier(t){if(save.claimed.includes(t.t))return;save.claimed.push(t.t);if(t.item){if(!owned(t.item))save.owned.push(t.item);toast('Unlocked <b>'+IDX[t.item].n+'</b>');}else{save.coins+=t.coins;toast('+'+coinHTML(t.coins));}persist();refreshWallet();}
function claimAll(){const lv=isStaff()?PASS_TIERS:level();PASS.filter(t=>t.t<=lv&&!save.claimed.includes(t.t)).forEach(claimTier);renderPass();}

/* ---------- quests ---------- */
function renderQuests(){ensureQuests();const ms=86400000-((Date.now()-new Date().getTimezoneOffset()*60000)%86400000);$('qreset').textContent='New quests in '+Math.floor(ms/3600000)+'h '+Math.floor(ms/60000)%60+'m';
  const el=$('qlist');el.innerHTML='';save.q.list.forEach(q=>{const done=q.prog>=q.goal,d=document.createElement('div');d.className='quest'+(done?' done':'')+(q.claimed?' claimed':'');
    d.innerHTML='<div><b>'+q.t+'</b><div class="bar"><i style="width:'+(q.prog/q.goal*100)+'%"></i></div><small>'+Math.floor(q.prog).toLocaleString()+' / '+q.goal.toLocaleString()+'</small></div><div class="rw"><span>+'+q.xp+' XP</span><span>'+coinHTML(q.coins)+'</span>'+(q.claimed?'<em>CLAIMED</em>':done?'<button>CLAIM</button>':'')+'</div>';
    if(done&&!q.claimed)d.querySelector('button').onclick=()=>{q.claimed=true;const l0=level();save.xp+=q.xp;save.coins+=q.coins;persist();toast('Quest reward: +'+q.xp+' XP · '+coinHTML(q.coins)+(level()>l0?' · <b>LEVEL '+level()+'</b>':''));renderQuests();refreshWallet();};
    el.appendChild(d);});}

/* ---------- leaderboard ---------- */
const RIVALS=['FlatspinFrida','Kink_King','SendyMcSendface','Tail_Tap_Tom','PowderPanda','Cork_Ninja','ButterBoss','LateGrabLuca','Switch_Sam','Gnar_Narwhal','TreeWell_Tess','DoubleDub','Mogul_Mo','IcyIsak','HuckFinn','Nose_Press_Nia','Yardsale_Yuki','SlushPuppy'];
const MAPBASE={park:42000,rails:36000,back:24000,pillow:26000,glacier:38000,night:30000,downtown:34000,mega:22000,resort:60000};
let lbMode='battle',lbMap='park';
function renderLeaders(){
  $('lbModes').innerHTML=Object.keys(MODES).map(m=>'<button data-m="'+m+'" class="'+(lbMode===m?'on':'')+'">'+MODES[m].n+'</button>').join('');
  $('lbModes').querySelectorAll('button').forEach(b=>b.onclick=()=>{lbMode=b.dataset.m;renderLeaders();});
  $('lbMaps').innerHTML=Object.keys(MAPS).map(m=>'<button data-m="'+m+'" class="'+(lbMap===m?'on':'')+'">'+MAPS[m].n+'</button>').join('');
  $('lbMaps').querySelectorAll('button').forEach(b=>b.onclick=()=>{lbMap=b.dataset.m;renderLeaders();});
  const r=rng(lbMap.length*91+lbMode.length*7),time=lbMode==='time',rows=RIVALS.map(n=>({n,v:time?16+r()*14:Math.round(MAPBASE[lbMap]*(.35+r()*1.25)/10)*10}));
  const mine=save.best[lbMode+'_'+lbMap];if(mine)rows.push({n:save.acct?save.acct.u:'You',v:mine,me:1});
  rows.sort((a,b)=>time?a.v-b.v:b.v-a.v);
  $('lbTable').innerHTML=rows.map((x,i)=>'<div class="lrow'+(x.me?' me':'')+'"><span>'+(i+1)+'</span><b>'+x.n+'</b><em>'+(time?fmt(x.v):x.v.toLocaleString())+'</em></div>').join('')+(mine?'':'<div class="lrow me"><span>–</span><b>You</b><em>No run yet</em></div>');}

/* ---------- mountain map ---------- */
function renderMap(){const el=$('pins');if(!el.children.length){Object.keys(MAPS).forEach(id=>{const d=document.createElement('div');d.className='pin';d.dataset.m=id;d.innerHTML='<i></i><b></b>';
    d.onclick=e=>{e.stopPropagation();mapSel=id;renderMap();};el.appendChild(d);});}
  const lv=level();el.querySelectorAll('.pin').forEach(d=>{const M=MAPS[d.dataset.m],lk=!lvlOk(M.lvl);d.className='pin'+(d.dataset.m===mapSel?' on':'')+(lk?' lk':'');d.querySelector('b').textContent=(lk?'🔒 ':'')+M.n;});
  const M=MAPS[mapSel],lk=!lvlOk(M.lvl),b=save.best[save.gm+'_'+mapSel];
  $('miZone').textContent=M.zone;$('miName').textContent=M.n;$('miDesc').textContent=M.d;$('miDiff').textContent=M.diff;$('miThumb').style.background=M.sky;
  $('miBest').textContent=b?(save.gm==='time'?fmt(b):b.toLocaleString()):'—';$('miGo').disabled=lk;$('miGo').textContent=lk?'UNLOCKS AT LV '+M.lvl:'RIDE '+M.n.toUpperCase();}
let mapSel='park';

/* ---------- ski designer ---------- */
const DZ={slot:0,cv:null,g:null,tool:'brush',col:'#ff4d6d',col2:'#2f9bff',size:14,hist:[],drawing:false,last:null,text:'MY SKIS'};
const DCOLS=['#ffffff','#111111','#ff4d6d','#ff7a1a','#ffd23f','#39d98a','#2bb3a3','#3aa0ff','#1d4e89','#8f5bff','#ff7ab8','#9a6a3c'];
function openDesigner(n){DZ.slot=n;setView('design');DZ.cv=$('dcv');DZ.g=DZ.cv.getContext('2d');DZ.hist=[];
  const d=save.custom[n];if(d&&d.img)DZ.g.drawImage(d.img,0,0,1024,128);else{DZ.g.fillStyle='#e8ebf2';DZ.g.fillRect(0,0,1024,128);}
  $('dzSlots').innerHTML=[0,1,2].map(i=>'<button class="'+(i===n?'on':'')+'" data-s="'+i+'">Slot '+(i+1)+'</button>').join('');
  $('dzSlots').querySelectorAll('button').forEach(b=>b.onclick=()=>{commitDesign(false);openDesigner(+b.dataset.s);});
  $('dzCols').innerHTML=DCOLS.map(c=>'<button style="background:'+c+'" data-c="'+c+'"></button>').join('')+'<input type="color" id="dzPick" value="'+DZ.col+'">';
  $('dzCols').querySelectorAll('button').forEach(b=>b.onclick=e=>{if(e.shiftKey||DZ.pick2)DZ.col2=b.dataset.c;else DZ.col=b.dataset.c;dzUI();});
  $('dzPick').oninput=e=>{DZ.col=e.target.value;dzUI();};
  save.load.skis='custom'+n;sk.apply(save.load,save.body);dzUI();livePreview();}
function dzUI(){document.querySelectorAll('#dzTools [data-t]').forEach(b=>b.classList.toggle('on',b.dataset.t===DZ.tool));$('dzCur').style.background=DZ.col;$('dzCur2').style.background=DZ.col2;$('dzSize').value=DZ.size;}
function snap(){DZ.hist.push(DZ.g.getImageData(0,0,1024,128));if(DZ.hist.length>25)DZ.hist.shift();}
let lpT=0;function livePreview(){const c=SKICV['custom'+DZ.slot]||skiCanvas('custom'+DZ.slot),g=c.getContext('2d');g.save();g.setTransform(1,0,0,1,0,0);g.translate(0,1024);g.rotate(-Math.PI/2);g.drawImage(DZ.cv,0,0,1024,128);g.restore();skiTex('custom'+DZ.slot).needsUpdate=true;}
function dzPos(e){const r=DZ.cv.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*1024,y:(e.clientY-r.top)/r.height*128};}
const STICK={star:(g,x,y,s)=>{g.beginPath();for(let i=0;i<10;i++){const a=i/10*Math.PI*2-Math.PI/2,rr=i%2?s*.42:s;g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}g.closePath();g.fill();},
  bolt:(g,x,y,s)=>{g.beginPath();[[-.2,-1],[.5,-1],[.05,-.1],[.45,-.1],[-.35,1],[-.05,.15],[-.45,.15]].forEach(([a,b],i)=>i?g.lineTo(x+a*s,y+b*s):g.moveTo(x+a*s,y+b*s));g.closePath();g.fill();},
  flame:(g,x,y,s)=>{g.beginPath();g.moveTo(x,y+s);g.bezierCurveTo(x-s*.9,y+s*.4,x-s*.3,y-s*.2,x,y-s);g.bezierCurveTo(x+s*.2,y-s*.3,x+s*.9,y+s*.1,x,y+s);g.fill();},
  heart:(g,x,y,s)=>{g.beginPath();g.moveTo(x,y+s*.8);g.bezierCurveTo(x-s*1.4,y-s*.1,x-s*.5,y-s*1.1,x,y-s*.35);g.bezierCurveTo(x+s*.5,y-s*1.1,x+s*1.4,y-s*.1,x,y+s*.8);g.fill();},
  snowflake:(g,x,y,s)=>{g.save();g.lineWidth=s*.14;g.strokeStyle=g.fillStyle;g.lineCap='round';for(let i=0;i<6;i++){const a=i*Math.PI/3;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*s,y+Math.sin(a)*s);g.moveTo(x+Math.cos(a)*s*.55,y+Math.sin(a)*s*.55);g.lineTo(x+Math.cos(a+.5)*s*.8,y+Math.sin(a+.5)*s*.8);g.stroke();}g.restore();},
  mtn:(g,x,y,s)=>{g.beginPath();g.moveTo(x-s*1.4,y+s*.7);g.lineTo(x-s*.4,y-s*.6);g.lineTo(x,y-.1*s);g.lineTo(x+s*.5,y-s*.9);g.lineTo(x+s*1.4,y+s*.7);g.fill();}};
function dzDown(e){const P=dzPos(e),g=DZ.g;snap();
  if(DZ.tool==='brush'||DZ.tool==='erase'){DZ.drawing=true;DZ.last=P;dzLine(P,P);}
  else if(DZ.tool==='text'){g.fillStyle=DZ.col;g.font=Math.max(18,DZ.size*3)+'px Bungee,Impact,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText($('dzText').value||'DUB12',P.x,P.y);livePreview();}
  else if(STICK[DZ.tool]){g.fillStyle=DZ.col;STICK[DZ.tool](g,P.x,P.y,Math.max(10,DZ.size*1.6));livePreview();}
  else if(DZ.tool==='fill'){g.fillStyle=DZ.col;g.fillRect(0,0,1024,128);livePreview();}}
function dzLine(a,b){const g=DZ.g;g.strokeStyle=DZ.tool==='erase'?'#e8ebf2':DZ.col;g.lineWidth=DZ.size;g.lineCap=g.lineJoin='round';g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x+.01,b.y);g.stroke();}
function dzMove(e){if(!DZ.drawing)return;const P=dzPos(e);dzLine(DZ.last,P);DZ.last=P;const t=performance.now();if(t-lpT>60){lpT=t;livePreview();}}
function dzUp(){if(DZ.drawing){DZ.drawing=false;livePreview();}}
function dzPattern(kind){const g=DZ.g,c=DZ.col,c2=DZ.col2;snap();g.save();g.fillStyle=c;g.strokeStyle=c;const r=rng((Math.random()*1e6)|0);
  if(kind==='grad'){const gr=g.createLinearGradient(0,0,1024,0);gr.addColorStop(0,c);gr.addColorStop(1,c2);g.fillStyle=gr;g.fillRect(0,0,1024,128);}
  else if(kind==='stripes'){for(let x=-128;x<1024;x+=48){g.beginPath();g.moveTo(x,128);g.lineTo(x+128,0);g.lineTo(x+148,0);g.lineTo(x+20,128);g.fill();}}
  else if(kind==='chevron'){for(let x=0;x<1100;x+=70){g.beginPath();g.moveTo(x,0);g.lineTo(x+40,64);g.lineTo(x,128);g.lineTo(x+20,128);g.lineTo(x+60,64);g.lineTo(x+20,0);g.fill();}}
  else if(kind==='dots'){for(let x=16;x<1024;x+=32)for(let y=16;y<128;y+=32){g.beginPath();g.arc(x+(y/32%2)*16,y,7,0,7);g.fill();}}
  else if(kind==='camo'){for(let k=0;k<70;k++){g.fillStyle=k%2?c:c2;g.beginPath();g.ellipse(r()*1024,r()*128,20+r()*40,10+r()*18,r()*3,0,7);g.fill();}}
  else if(kind==='topo'){g.lineWidth=2;for(let k=0;k<12;k++){g.beginPath();for(let x=0;x<=1024;x+=8){const y=k*12+Math.sin(x*.02+k)*8+Math.sin(x*.05)*3;x?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();}}
  else if(kind==='splat'){for(let k=0;k<140;k++){g.fillStyle=k%3?c:c2;g.globalAlpha=.6+r()*.4;g.beginPath();g.arc(r()*1024,r()*128,r()*r()*14+1,0,7);g.fill();}}
  g.restore();livePreview();}
function commitDesign(close){const n=DZ.slot,url=DZ.cv.toDataURL('image/jpeg',.88),img=new Image();img.src=url;save.custom[n]={url,img};persist();
  img.onload=()=>drawSki('custom'+n);livePreview();if(close){save.load.skis='custom'+n;persist();sk.apply(save.load,save.body);lockCat='skis';setView('locker');toast('Saved to slot '+(n+1));}}
function hydrateCustom(){save.custom.forEach((d,i)=>{if(d&&d.url){const im=new Image();im.onload=()=>drawSki('custom'+i);im.src=d.url;d.img=im;}});}

/* ---------- wiring ---------- */
function wire(){
  document.querySelectorAll('#nav button').forEach(b=>b.onclick=()=>{if(mode==='lobby')setView(b.dataset.v);});
  $('mapCard').onclick=()=>{if(mode==='lobby')setView('select');};
  $('ready').onclick=toggleQueue;$('miBack').onclick=()=>setView('play');
  $('miGo').onclick=()=>{save.map=mapSel;persist();setView('play');};
  $('ldesign').onclick=()=>openDesigner(save.load.skis.startsWith('custom')?+save.load.skis.slice(6):0);
  $('dClose').onclick=()=>$('detail').classList.add('hide');$('dTry').onclick=tryOn;$('dBuy').onclick=buyOrEquip;$('claimAll').onclick=claimAll;
  $('setBtn').onclick=()=>openSettings();$('setClose').onclick=closeSettings;
  $('acctBtn').onclick=()=>{if(save.acct){$('loginBox').classList.add('hide');$('acctBox').classList.remove('hide');$('acctName').textContent=save.acct.u;$('acctRole').textContent=save.acct.role.toUpperCase();}else{$('loginBox').classList.remove('hide');$('acctBox').classList.add('hide');$('lErr').textContent='';}$('login').classList.remove('hide');};
  $('lClose').onclick=$('lClose2').onclick=()=>$('login').classList.add('hide');$('lGo').onclick=doLogin;$('lPass').onkeydown=e=>{if(e.key==='Enter')doLogin();};
  $('lOut').onclick=()=>{save.acct=null;persist();$('login').classList.add('hide');sk.apply(validLoad(),save.body);setView('play');toast('Logged out');};
  document.querySelectorAll('#adminTools [data-a]').forEach(b=>b.onclick=()=>adminAct(b.dataset.a));
  $('again').onclick=()=>startRun(curMap);$('toLobby').onclick=()=>setMode('lobby');
  $('exit').onclick=()=>{if(!endShown)openSettings();};$('sRestart').onclick=()=>{closeSettings();startRun(curMap);};$('sLobby').onclick=()=>{closeSettings();if(map&&map.fr&&mode==='run'&&!endShown){endRun();return;}setMode('lobby');};
  $('tmClose').onclick=closeTrailMap;
  $('selBtn').onclick=()=>{if(mode==='lobby')setView('select');};$('selBack').onclick=()=>setView('play');
  $('selGo').onclick=()=>{save.map=selMap;save.gm=selMode;persist();setView('play');};
  // designer
  const dc=$('dcv');dc.addEventListener('pointerdown',e=>{dc.setPointerCapture(e.pointerId);dzDown(e);});dc.addEventListener('pointermove',dzMove);dc.addEventListener('pointerup',dzUp);dc.addEventListener('pointercancel',dzUp);
  document.querySelectorAll('#dzTools [data-t]').forEach(b=>b.onclick=()=>{DZ.tool=b.dataset.t;dzUI();});
  document.querySelectorAll('#dzPats [data-p]').forEach(b=>b.onclick=()=>dzPattern(b.dataset.p));
  $('dzSize').oninput=e=>DZ.size=+e.target.value;
  $('dzUndo').onclick=()=>{const h=DZ.hist.pop();if(h){DZ.g.putImageData(h,0,0);livePreview();}};
  $('dzClear').onclick=()=>{snap();DZ.g.fillStyle='#e8ebf2';DZ.g.fillRect(0,0,1024,128);livePreview();};
  $('dzSwap').onclick=()=>{[DZ.col,DZ.col2]=[DZ.col2,DZ.col];dzUI();};
  $('dzSave').onclick=()=>commitDesign(true);$('dzCancel').onclick=()=>{drawSki('custom'+DZ.slot);lockCat='skis';setView('locker');};
  // lobby rider drag / click
  cv.addEventListener('pointerdown',e=>{if(mode!=='run'&&view!=='map'){dragX=e.clientX;dragY=e.clientY;dragMoved=0;}});
  window.addEventListener('pointermove',e=>{if(dragX!==null){lobbyYaw+=(e.clientX-dragX)*.012;lobbyTilt=Math.max(-45,Math.min(70,lobbyTilt+(e.clientY-dragY)*.35));
    dragMoved+=Math.abs(e.clientX-dragX)+Math.abs(e.clientY-dragY);dragX=e.clientX;dragY=e.clientY;}});
  // scroll / pinch to zoom on your rider in the lobby
  cv.addEventListener('wheel',e=>{if(mode==='run'||view==='map')return;e.preventDefault();lobbyZoom=Math.max(.4,Math.min(1.6,lobbyZoom*Math.exp(e.deltaY*.0012)));},{passive:false});
  window.addEventListener('pointerup',e=>{if(dragX!==null&&dragMoved<6&&mode==='lobby'&&view==='play'){
      {mouse.set(e.clientX/W*2-1,-(e.clientY/H)*2+1);rayL.setFromCamera(mouse,lcam);if(rayL.intersectObject(sk.root,true).length)setView('locker');}}
    dragX=null;});
  const AM={left:'a',right:'d',fwd:'w',back:'s',jump:'jump',sw:'f',g1:'g1',g2:'g2',g3:'g3',bn:'bn',bt:'bt',cam:'cam'};
  const keysFor=code=>{const out=[];const B=binds();for(const a in B)if(B[a].includes(code))out.push(AM[a]);return out;};
  window.addEventListener('pointerdown',()=>audioStart(),{once:true});
  window.addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;if(capture){e.preventDefault();doCapture(e.code);return;}
    // free-roam resort keys: M trail map, E ride the lift at the base, T skip to the top
    if(mode==='run'&&map&&map.fr&&!endShown&&$('settings').classList.contains('hide')){
      if(e.code==='KeyM'&&!e.repeat){tmapOpen?closeTrailMap():openTrailMap();return;}
      if(tmapOpen){if(e.code==='Escape')closeTrailMap();return;}
      if(e.code==='KeyE'&&!e.repeat&&nearLift(p)){boardLift(p);return;}
      if(e.code==='KeyT'&&!e.repeat&&!paused){arriveTop(p);return;}}
    if(e.code==='Escape'){if(!$('settings').classList.contains('hide')){closeSettings();return;}if(mode==='run'){if(endShown)return;openSettings();}else if(mode==='lobby'){if(!$('detail').classList.contains('hide'))$('detail').classList.add('hide');else if(view!=='play')setView('play');}else if(mode==='queue')toggleQueue();return;}
    if(e.code==='Enter'){if(mode==='run'&&endShown)startRun(curMap);else if(mode==='lobby'&&view==='play')toggleQueue();return;}
    const ks=keysFor(e.code);if(ks.includes('cam')&&mode==='run'&&!e.repeat){const i=VIEWS.findIndex(v=>v[0]===save.set.view);save.set.view=VIEWS[(i+1)%VIEWS.length][0];persist();toast(VIEWS.find(v=>v[0]===save.set.view)[1]);}
    if(ks.length){if(mode==='run'&&!paused){ks.forEach(k=>keys[k]=1);e.preventDefault();}else if(e.code==='Space')e.preventDefault();}});
  window.addEventListener('keyup',e=>{keysFor(e.code).forEach(k=>keys[k]=0);});
  window.addEventListener('blur',()=>{for(const k in keys)keys[k]=0;});
  document.addEventListener('contextmenu',e=>e.preventDefault());
}
/* ---------- settings & keybinds ---------- */
let capture=null;
const SET_TABS=[['gameplay','Gameplay'],['camera','Camera'],['graphics','Graphics'],['controls','Controls'],['audio','Audio']];
const SETS=[
 ['gameplay','name','Rider name','text'],
 ['gameplay','sideways','Sideways landings','sel',[[1,'Ride it out (lose points)'],[0,'Crash']]],
 ['gameplay','assist','Landing assist','sel',[[1,'On'],[0,'Off (hardcore)']]],
 ['gameplay','respawn','Get-up time','range',.5,2,.1,'s'],
 ['gameplay','invert','Flip controls','sel',[[0,'Normal'],[1,'Inverted']]],
 ['gameplay','poles','Ski poles','sel',[[1,'On'],[0,'Off']]],
 ['gameplay','gog','Goggles','sel',[['face','On face'],['helmet','Up on helmet'],['off','Off']]],
 ['gameplay','bots','Rival riders','sel',[[0,'Chill'],[1,'Normal'],[2,'Shredders']]],
 ['gameplay','slowmo','Slow-mo on big air','sel',[[0,'Off'],[1,'On']]],
 ['gameplay','popups','Trick popups','sel',[[1,'Show'],[0,'Hide']]],
 ['gameplay','bighead','Big-head mode','sel',[[0,'Off'],[1,'On']]],
 ['camera','view','View','sel',null],
 ['camera','zoom','Zoom','range',.6,1.8,.05,'x'],
 ['camera','fov','Field of view','range',45,90,1,'°'],
 ['camera','rot','Flip & spin speed','range',.6,1.4,.05,'x'],
 ['camera','shake','Camera shake','sel',[[1,'On'],[0,'Off']]],
 ['graphics','tod','Time of day','sel',null],
 ['graphics','snow','Snowfall','sel',[[0,'Off'],[1,'Light'],[2,'Blizzard']]],
 ['graphics','fx','Cinematic effects','sel',[[1,'On (bloom, grading, MSAA)'],[0,'Off (faster)']]],
 ['graphics','shadows','Shadows','sel',[[1,'On'],[0,'Off']]],
 ['graphics','res','Resolution','sel',[[1,'Full'],[0,'Performance']]],
 ['graphics','uiscale','Interface size','range',.8,1.3,.05,'x'],
 ['graphics','speedo','Speedometer','sel',[[1,'Show'],[0,'Hide']]],
 ['graphics','units','Speed units','sel',[['kmh','km/h'],['mph','mph']]],
 ['graphics','fps','FPS counter','sel',[[0,'Hide'],[1,'Show']]],
 ['graphics','hints','Control hints','sel',[[1,'Show'],[0,'Hide']]],
 ['audio','vol','Volume','range',0,1,.05,'']];
let setTab='gameplay';
function openSettings(){if(mode==='run'){paused=true;for(const k in keys)keys[k]=0;}$('runActs').classList.toggle('hide',mode!=='run');
  $('stabs').innerHTML=SET_TABS.map(t=>'<button data-t="'+t[0]+'" class="'+(setTab===t[0]?'on':'')+'">'+t[1]+'</button>').join('');
  $('stabs').querySelectorAll('button').forEach(b=>b.onclick=()=>{setTab=b.dataset.t;openSettings();});
  const P=$('spane');P.innerHTML='';
  if(setTab==='controls'){const B=binds();P.innerHTML='<div class="full"><div class="lbl">Click a key to rebind · Backspace clears · Esc cancels</div><div id="kb">'+ACTIONS.map(a=>'<div class="kr"><span>'+a[1]+'</span><button data-a="'+a[0]+'" data-s="0">'+keyName(B[a[0]][0])+'</button><button data-a="'+a[0]+'" data-s="1">'+keyName(B[a[0]][1])+'</button></div>').join('')+'</div><button class="btn ghost" id="kReset" style="margin-top:10px">RESET KEYS</button></div>';
    P.querySelectorAll('#kb button').forEach(b=>b.onclick=()=>{capture={a:b.dataset.a,s:+b.dataset.s,el:b};b.textContent='Press a key…';b.classList.add('cap');});
    $('kReset').onclick=()=>{save.keys=null;binds();openSettings();};}
  else SETS.filter(x=>x[0]===setTab).forEach(x=>{const k=x[1],row=document.createElement('div');row.className='srow2';let html='<span>'+x[2]+'</span>';
    if(x[3]==='text')html+='<input type="text" maxlength="16" placeholder="You">';
    else if(x[3]==='range')html+='<input type="range" min="'+x[4]+'" max="'+x[5]+'" step="'+x[6]+'"><em></em>';
    else{const opts=k==='view'?VIEWS:k==='tod'?Object.keys(TOD).map(t=>[t,TOD[t].n]):x[4];html+='<select>'+opts.map(o=>'<option value="'+o[0]+'">'+o[1]+'</option>').join('')+'</select>';}
    row.innerHTML=html;P.appendChild(row);const el=row.querySelector('input,select'),em=row.querySelector('em');el.value=save.set[k];
    const show=()=>{if(em)em.textContent=(+save.set[k]).toFixed(x[6]>=1?0:2).replace(/\.?0+$/,m=>x[6]<1&&m?'':m)+x[7];};show();
    el.oninput=el.onchange=()=>{let v=el.value;if(x[3]==='range'||(x[3]==='sel'&&typeof (x[4]||[[0]])[0][0]==='number'))v=+v;save.set[k]=v;show();if(k==='vol')setVol(v);applySettings();};});
  $('settings').classList.remove('hide');}
function closeSettings(){$('settings').classList.add('hide');persist();applySettings();if(mode==='run'&&!endShown)paused=false;}
function doCapture(code){const c=capture;capture=null;if(code==='Escape'){openSettings();return;}if(code==='Backspace'||code==='Delete')code='';binds()[c.a][c.s]=code;persist();openSettings();updateHint();}
function applySettings(){if(sk){sk.setPoles(save.set.poles);if(sk.gogMode!==save.set.gog){sk.gogMode=save.set.gog;sk.apply(save.load,save.body);}if(p&&mode==='run')p.name=save.acct?save.acct.u:(save.set.name||'You');}
  $('fps').classList.toggle('hide',!save.set.fps);$('spd').classList.toggle('hide',!save.set.speedo);$('hud').style.zoom=save.set.uiscale;$('ui').style.zoom=save.set.uiscale;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2)*[.6,1][save.set.res]);renderer.setSize(W,H,false);sun.castShadow=!!save.set.shadows;lobby.traverse(o=>{if(o.isDirectionalLight&&o.shadow)o.castShadow=!!save.set.shadows;});
  $('hint').classList.toggle('hide',!save.set.hints);updateHint();}
function updateHint(){const B=binds(),k=a=>'<b>'+keyName(B[a][0])+'</b>';
  $('hint').innerHTML=k('left')+'/'+k('right')+' carve · '+k('fwd')+' tuck · '+k('back')+' brake · '+k('sw')+' switch 180 · hold '+k('jump')+' jump · '+k('cam')+' camera · air: '+k('left')+'/'+k('right')+' spin, '+k('fwd')+'/'+k('back')+' flip, '+k('g1')+'/'+k('g2')+'/'+k('g3')+' grabs · snow: '+k('bn')+'/'+k('bt')+' butter<br>steer while charging to pre-wind spins · rails: jump on, '+k('left')+'/'+k('right')+' balance, '+k('sw')+' swap, '+k('bn')+'/'+k('bt')+' press';}
/* ---------- login ---------- */
async function sha256(t){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');}
async function doLogin(){const u=$('lUser').value.trim(),pw=$('lPass').value;if(!u||!pw){$('lErr').textContent='Enter a username and password.';return;}
  let h='';try{h=await sha256('dub12:'+u.toLowerCase()+':'+pw);}catch(e){$('lErr').textContent='Login needs a secure (https) page.';return;}
  const A_=ACCOUNTS[h];if(!A_){$('lErr').textContent='Wrong username or password.';$('lPass').value='';return;}
  save.acct={u:A_.u,role:A_.role};persist();$('lPass').value='';$('login').classList.add('hide');sfx('buy');toast('Welcome, <b>'+A_.u+'</b> · all gear unlocked');for(const t in THUMB)delete THUMB[t];setView(view);}
function validLoad(){for(const c in save.load){const id=save.load[c];if(c==='skis'&&id.startsWith('custom'))continue;if(!save.owned.includes(id)){const st=ITEMS.find(i=>i.cat===c&&i.src==='starter');if(st)save.load[c]=st.id;}}
  save.tricks.g=save.tricks.g.map((id,i)=>save.owned.includes(id)?id:['t_mute','t_safety','t_japan'][i]);if(!save.owned.includes(save.tricks.style))save.tricks.style='t_cork';persist();return save.load;}
function adminAct(a){if(!isAdmin())return;
  if(a==='coins'){save.coins+=10000;toast('+'+coinHTML(10000));}
  else if(a==='level'){save.xp+=XP_PER_LVL;toast('Level '+level());}
  else if(a==='quests'){save.q.list.forEach(q=>q.prog=q.goal);toast('All quests completed');}
  else if(a==='reset'){if(!$('adminTools').dataset.arm){$('adminTools').dataset.arm=1;toast('Press reset again to wipe progress');return;}const acct=save.acct;save=defaultSave();save.acct=acct;ensureQuests();sk.apply(save.load,save.body);toast('Progress reset');}
  delete $('adminTools').dataset.arm;persist();refreshWallet();renderAdmin();}
function renderAdmin(){$('adminInfo').innerHTML='Signed in as <b>'+(save.acct?save.acct.u:'')+'</b> · Level '+level()+' · '+coinHTML(save.coins)+'<br>Every cosmetic, ski, trick, map and pass tier is unlocked while you are signed in.';}
function boot(){resize();
  loadAssets('assets/dub12.glb',()=>{
    buildLobby();initRiders();hydrateCustom();wire();applySettings();setMode('lobby');$('loading').classList.add('hide');
    if(typeof initAccounts==='function')initAccounts();
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{redrawAllSkis();});
    requestAnimationFrame(frame);
  },e=>{$('loading').querySelector('p').textContent='Could not load the 3D models.';console.error(e);});}
boot();
