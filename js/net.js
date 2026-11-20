/* DUB12 online play (Firebase Realtime Database, free tier)
   - presence: who is online            status/{uid}
   - invites:  party invites by name    invites/{toUid}/{fromUid}
   - parties:  leader + members         parties/{leaderUid}
   - rooms:    matchmaking + live game  rooms/{rid}  (pl = players in the room, st = live rider state, 10x a second)
   Signed-out players keep the offline game (bots). Database rules: tools/database.rules.json */
const NET={on:false,db:null,uid:null,name:'',pid:null,party:null,rid:null,room:null,roomPl:{},remotes:{},off:0,sendT:0,queueing:false,status:'',subs:[]};
const netNow=()=>Date.now()+NET.off;
function netSub(ref,ev,fn){ref.on(ev,fn);NET.subs.push(()=>ref.off(ev,fn));}
async function netInit(){
  if(NET.db||!FB.user||!FB.ready)return;
  try{
    await loadScript('https://www.gstatic.com/firebasejs/'+FB_VER+'/firebase-database-compat.js');
    const cfg=window.DUB12_FIREBASE,url=cfg.databaseURL||('https://'+cfg.projectId+'-default-rtdb.firebaseio.com');
    NET.db=firebase.app().database(url);NET.uid=FB.user.uid;NET.name=FB.name||FB.user.displayName||'Rider';
    NET.db.ref('.info/serverTimeOffset').on('value',s=>{NET.off=s.val()||0;});
    const me=NET.db.ref('status/'+NET.uid);
    NET.db.ref('.info/connected').on('value',s=>{NET.on=!!s.val();
      if(NET.on){me.onDisconnect().remove();me.set({n:NET.name,s:'lobby',t:firebase.database.ServerValue.TIMESTAMP}).catch(e=>{NET.on=false;NET.status='Online play is not set up yet';console.warn('online',e);netUI();});}
      netUI();});
    setTimeout(()=>{if(!NET.on){NET.status='Online play unavailable (database not reachable)';netUI();}},9000);
    netSub(NET.db.ref('invites/'+NET.uid),'child_added',s=>{const v=s.val();if(v&&netNow()-v.t<120000)netShowInvite(s.key,v);else s.ref.remove();});
  }catch(e){console.warn('online init failed',e);NET.status='Online play unavailable';netUI();}
}
function netShutdown(){netLeaveRoom();netLeaveParty();NET.subs.forEach(f=>f());NET.subs=[];if(NET.db&&NET.uid)NET.db.ref('status/'+NET.uid).remove();NET.db=null;NET.on=false;netUI();}
function netSetState(s){if(NET.on)NET.db.ref('status/'+NET.uid+'/s').set(s);}

/* ---------- parties ---------- */
function netIsLeader(){return !NET.pid||NET.pid===NET.uid;}
async function netEnsureParty(){if(NET.pid)return NET.pid;const pid=NET.uid,ref=NET.db.ref('parties/'+pid);
  await ref.set({leader:NET.uid,m:{[NET.uid]:{n:NET.name}}});ref.onDisconnect().remove();netWatchParty(pid);return pid;}
function netWatchParty(pid){NET.pid=pid;let last=null;
  const ref=NET.db.ref('parties/'+pid);const fn=s=>{const v=s.val();
    if(!v||!v.m||!v.m[NET.uid]){if(NET.pid===pid){toast(pid===NET.uid?'Party closed':'You left the party');NET.pid=null;NET.party=null;ref.off('value',fn);netUI();}return;}
    NET.party=v;if(v.room&&v.room!==last&&pid!==NET.uid)netJoinRoom(v.room,true);last=v.room||null;netUI();};
  ref.on('value',fn);NET.subs.push(()=>ref.off('value',fn));}
async function netInvite(name){if(!NET.on){toast('Not connected');return;}
  const key=String(name||'').trim().toLowerCase().replace(/\s+/g,'_');if(!key){toast('Type a rider name');return;}
  try{const d=await FB.db.collection('names').doc(key).get();if(!d.exists){toast('No rider called '+name);return;}const to=d.data().uid;if(to===NET.uid){toast("That's you!");return;}
    if(!netIsLeader()){toast('Only the party leader can invite');return;}
    const st=(await NET.db.ref('status/'+to).once('value')).val();if(!st){toast(name+' is offline');return;}
    const pid=await netEnsureParty();await NET.db.ref('invites/'+to+'/'+NET.uid).set({n:NET.name,pid,t:firebase.database.ServerValue.TIMESTAMP});toast('Invite sent to '+st.n);}
  catch(e){console.warn(e);toast('Could not send invite');}}
function netShowInvite(from,v){const box=$('invBox');if(!box)return;const d=document.createElement('div');d.className='inv';
  d.innerHTML='<b>'+String(v.n).replace(/</g,'&lt;')+'</b> invited you to their party<div><button class="p">JOIN</button><button>NO</button></div>';
  const [ok,no]=d.querySelectorAll('button');const done=()=>{d.remove();NET.db.ref('invites/'+NET.uid+'/'+from).remove();};
  ok.onclick=async()=>{done();await netLeaveParty();await NET.db.ref('parties/'+v.pid+'/m/'+NET.uid).set({n:NET.name});
    NET.db.ref('parties/'+v.pid+'/m/'+NET.uid).onDisconnect().remove();netWatchParty(v.pid);toast('Joined '+v.n+"'s party");sfx('ui');};
  no.onclick=done;box.appendChild(d);setTimeout(()=>{if(d.isConnected)done();},60000);sfx('ui');}
async function netLeaveParty(){if(!NET.pid||!NET.db)return;const pid=NET.pid;NET.pid=null;NET.party=null;
  try{if(pid===NET.uid)await NET.db.ref('parties/'+pid).remove();else await NET.db.ref('parties/'+pid+'/m/'+NET.uid).remove();}catch(e){}netUI();}
async function netKick(uid){if(NET.pid===NET.uid&&uid!==NET.uid)await NET.db.ref('parties/'+NET.pid+'/m/'+uid).remove();}

/* ---------- matchmaking: join an open room for this map+mode, or open a new one (8 riders max, 10 s to fill) ---------- */
async function netQueue(mapId,gm){if(!NET.on)return false;NET.queueing=true;NET.status='Finding riders…';netUI();
  const size=NET.party?Object.keys(NET.party.m).length:1,key=mapId+'|'+gm;let rid=null;
  try{const snap=await NET.db.ref('rooms').orderByChild('k').equalTo(key+'|open').limitToFirst(10).once('value'),rooms=snap.val()||{};
    for(const id in rooms){const R=rooms[id];if(!R||R.start<netNow()+2500)continue;
      const res=await NET.db.ref('rooms/'+id+'/count').transaction(c=>((c||0)+size>8)?undefined:(c||0)+size);if(res.committed){rid=id;break;}}
    if(!rid){const ref=NET.db.ref('rooms').push();rid=ref.key;
      await ref.set({k:key+'|open',map:mapId,gm,count:size,host:NET.uid,start:netNow()+10000,t:firebase.database.ServerValue.TIMESTAMP});
      ref.onDisconnect().update({k:key+'|closed'});}
    if(!NET.queueing){NET.db.ref('rooms/'+rid+'/count').transaction(c=>Math.max(0,(c||0)-size));return false;}
    if(NET.pid&&NET.pid===NET.uid)await NET.db.ref('parties/'+NET.pid+'/room').set(rid);
    await netJoinRoom(rid,false);return true;}
  catch(e){console.warn('queue failed',e);NET.queueing=false;NET.status='Matchmaking failed: playing offline';netUI();return false;}}
async function netJoinRoom(rid,pulled){if(NET.rid===rid)return;await netLeaveRoom(true);NET.rid=rid;NET.queueing=true;
  const R=(await NET.db.ref('rooms/'+rid).once('value')).val();if(!R){NET.rid=null;NET.queueing=false;return;}
  NET.room=R;NET.roomPl={};
  const plRef=NET.db.ref('rooms/'+rid+'/pl/'+NET.uid),stRef=NET.db.ref('rooms/'+rid+'/st/'+NET.uid);
  await plRef.set({n:NET.name,load:save.load,body:netBody()});plRef.onDisconnect().remove();stRef.onDisconnect().remove();
  const pl=NET.db.ref('rooms/'+rid+'/pl');
  netSub(pl,'child_added',s=>{NET.roomPl[s.key]=s.val();netUI();});
  netSub(pl,'child_removed',s=>{delete NET.roomPl[s.key];netDropRemote(s.key);netUI();});
  netSub(NET.db.ref('rooms/'+rid+'/st'),'child_changed',s=>netRecv(s.key,s.val()));
  netSub(NET.db.ref('rooms/'+rid+'/st'),'child_added',s=>netRecv(s.key,s.val()));
  netSetState('queue');
  if(pulled&&mode==='lobby'){save.map=R.map;save.gm=R.gm;setView('play');mode='queue';qT=0;$('ready').classList.add('q');$('ready').textContent='CANCEL';}
  netUI();}
async function netLeaveRoom(keepParty){if(!NET.rid||!NET.db)return;const rid=NET.rid;NET.rid=null;NET.room=null;NET.queueing=false;
  try{await NET.db.ref('rooms/'+rid+'/pl/'+NET.uid).remove();await NET.db.ref('rooms/'+rid+'/st/'+NET.uid).remove();
    const left=(await NET.db.ref('rooms/'+rid+'/pl').once('value')).val();if(!left)await NET.db.ref('rooms/'+rid).remove();}catch(e){}
  if(!keepParty&&NET.pid===NET.uid)NET.db.ref('parties/'+NET.pid+'/room').remove();
  for(const u in NET.remotes)netDropRemote(u);NET.roomPl={};netSetState('lobby');netUI();}
function netBody(){const b={};['skin','hair','hairColor','eye','hood','jc','sc','pnc','glc','pc','jf','pf','zh','zg','zgl','zb','zs','zw','zt','zp','buds','budc','cw'].forEach(k=>{if(save.body[k]!==undefined)b[k]=save.body[k];});return b;}
/* queue screen text + start the run together at the room's start time */
function netTickQueue(){if(!NET.room)return false;const R=NET.room,left=(R.start-netNow())/1000,n=Object.keys(NET.roomPl).length;
  $('qstat').innerHTML='Online lobby '+n+'/8<br>'+Object.values(NET.roomPl).map(q=>String(q.n).replace(/</g,'&lt;')).join(' · ');
  if(left<=3.2){$('count').classList.remove('hide');$('countMap').textContent=(MAPS[R.map]?MAPS[R.map].n:'')+' · online';$('countN').textContent=left>0?Math.ceil(left):'GO';}
  if(left<=0){if(R.host===NET.uid)NET.db.ref('rooms/'+NET.rid+'/k').set(R.map+'|'+R.gm+'|closed');NET.queueing=false;netSetState('game');startRun(R.map,R.gm);}
  return true;}

/* ---------- live riders: send ours 10x a second, draw everyone else smoothly ---------- */
function netSend(dt){if(!NET.rid||!NET.on||!p||mode!=='run')return;NET.sendT-=dt;if(NET.sendT>0)return;NET.sendT=.1;
  const P=p.netPose||{},f=p.sk.flipG.rotation;
  NET.db.ref('rooms/'+NET.rid+'/st/'+NET.uid).set([Math.round(p.x),Math.round(p.y),Math.round(p.z),+bodyYaw(p).toFixed(3),+f.x.toFixed(3),+f.z.toFixed(3),
    {ground:0,air:1,rail:2,lift:3,tow:4}[p.mode]||0,+(P.crouch||0).toFixed(2),P.tuck?1:0,P.air?1:0,P.grab||0,+(P.steer||0).toFixed(2),+(P.look||0).toFixed(2),p.score|0,p.crashT>0?1:0]);}
function netRecv(uid,a){if(uid===NET.uid||!a)return;let R=NET.remotes[uid];
  if(!R){const pl=NET.roomPl[uid];if(!pl||mode!=='run')return;const s=makeRider();
    try{s.apply(Object.assign({},save.load,pl.load||{}),Object.assign({},save.body,pl.body||{}));}catch(e){s.apply(defaultSave().load,save.body);}
    s.gear(true);scene.add(s.root);R=NET.remotes[uid]={sk:s,x:a[0],y:a[1],z:a[2],yaw:a[3],a,name:pl.n,label:netLabel(pl.n)};s.root.add(R.label);}
  R.a=a;R.t=performance.now();}
function netDropRemote(uid){const R=NET.remotes[uid];if(!R)return;scene.remove(R.sk.root);delete NET.remotes[uid];}
function netLabel(n){const c=document.createElement('canvas');c.width=256;c.height=64;const g=c.getContext('2d');g.font='800 30px Inter,Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';
  const w=Math.min(250,g.measureText(n).width+30);g.fillStyle='rgba(10,14,30,.7)';g.fillRect(128-w/2,10,w,44);g.fillStyle='#fff';g.fillText(n,128,33);
  const sp=new U.Sprite(new U.SpriteMaterial({map:new U.CanvasTexture(c),depthTest:false,transparent:true}));sp.scale.set(36,9,1);sp.position.y=62;sp.renderOrder=5;return sp;}
function netDraw(dt){if(mode!=='run'){for(const u in NET.remotes)NET.remotes[u].sk.root.visible=false;return;}
  const k=1-Math.exp(-dt*12);for(const u in NET.remotes){const R=NET.remotes[u],a=R.a,stale=performance.now()-R.t>4000;R.sk.root.visible=!stale;if(stale)continue;
    R.x+=(a[0]-R.x)*k;R.y+=(a[1]-R.y)*k;R.z+=(a[2]-R.z)*k;let dy=a[3]-R.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));R.yaw+=dy*k;
    const Rt=R.sk.root;Rt.position.set(R.x,R.y+.8,R.z);Rt.rotation.set(0,R.yaw,0);R.sk.flipG.rotation.set(a[4],0,a[5]);
    if(a[6]===3)R.sk.pose({sit:true},dt);else if(a[6]===4)R.sk.pose({crouch:.4,tow:true},dt);
    else R.sk.pose({crouch:a[7],tuck:!!a[8],air:!!a[9],grab:a[10]||null,steer:a[11],look:a[12]},dt);}}
/* battle scoreboard rows for online riders */
function netBoard(){const out=[];for(const u in NET.remotes){const R=NET.remotes[u];out.push({name:R.name,score:R.a[13]||0,online:1});}return out;}

/* ---------- party panel in the lobby ---------- */
function netUI(){const el=$('partyBox');if(!el)return;
  if(!FB.user){el.innerHTML='<div class="pb-h">PARTY</div><div class="pb-s">Sign in to play online with friends.</div>';return;}
  if(!NET.on){el.innerHTML='<div class="pb-h">PARTY</div><div class="pb-s">'+(NET.status||'Connecting…')+'</div>';return;}
  const m=NET.party?NET.party.m:{[NET.uid]:{n:NET.name}},lead=NET.party?NET.party.leader:NET.uid,esc=s=>String(s).replace(/</g,'&lt;');
  el.innerHTML='<div class="pb-h">PARTY <span>● online</span></div>'+Object.keys(m).map(u=>'<div class="pb-m">'+(u===lead?'👑 ':'')+esc(m[u].n)+(u===NET.uid?' (you)':'')+(lead===NET.uid&&u!==NET.uid?' <button data-k="'+u+'">✕</button>':'')+'</div>').join('')+
    (netIsLeader()?'<div class="pb-i"><input id="pbName" maxlength="16" placeholder="Rider name"><button id="pbInv" class="p">INVITE</button></div>':'<div class="pb-s">Waiting for the leader to queue…</div>')+
    (NET.pid?'<button id="pbLeave" class="pb-l">'+(NET.pid===NET.uid?'DISBAND':'LEAVE')+' PARTY</button>':'');
  const inv=$('pbInv');if(inv){inv.onclick=()=>netInvite($('pbName').value);$('pbName').onkeydown=e=>{e.stopPropagation();if(e.key==='Enter')netInvite($('pbName').value);};}
  const lv=$('pbLeave');if(lv)lv.onclick=()=>netLeaveParty();
  el.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>netKick(b.dataset.k));}
