/* DUB12 — player accounts (Firebase Auth + Firestore).
   Everyone is prompted to create an account when the game opens; signed-in progress (coins, XP, unlocks,
   outfits, settings, best scores, custom skis) is saved to the cloud and loaded on any device.
   Guests can still play; their progress stays in this browser and is uploaded when they sign up. */
'use strict';
const FB={ready:false,user:null,name:null,db:null,auth:null,saveT:null,loading:false};
const FB_VER='10.12.2';
function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error('load '+src));document.head.appendChild(s);});}

function initAccounts(){if(FB.inited)return;FB.inited=true;
  buildAccountUI();
  if(!window.DUB12_FIREBASE){refreshAcctChip();return;}          // accounts not configured: guest mode only
  (async()=>{try{
    for(const m of ['app','auth','firestore'])await loadScript('https://www.gstatic.com/firebasejs/'+FB_VER+'/firebase-'+m+'-compat.js');
    firebase.initializeApp(window.DUB12_FIREBASE);FB.auth=firebase.auth();FB.db=firebase.firestore();FB.ready=true;
    FB.auth.onAuthStateChanged(onAuth);
  }catch(e){console.warn('accounts unavailable',e);refreshAcctChip();}})();
  // wrap persist(): every local save also schedules a cloud save while signed in
  const local=persist;persist=function(){local();cloudSaveSoon();};
}
async function onAuth(u){if(u&&FB.signingUp)return;FB.user=u;
  // sign-up invite shows once per device (not every session); "Play as guest" or Esc dismisses it for good
  if(!u){FB.name=null;refreshAcctChip();let g=null;try{g=localStorage.getItem('dub12_guest')||sessionStorage.getItem('dub12_guest');}catch(e){}if(!g)openAccount('signup');return;}
  FB.loading=true;FB.noSync=true;   // never upload until this account's cloud save has loaded (a failed load must not overwrite it)
  try{const doc=await FB.db.collection('users').doc(u.uid).get();FB.noSync=false;
    if(doc.exists&&doc.data().save){applyCloudSave(JSON.parse(doc.data().save));FB.name=doc.data().name||u.displayName;toast('Welcome back, <b>'+FB.name+'</b> · progress loaded');}
    else{FB.name=u.displayName||'Rider';await cloudSaveNow();toast('Account ready · your progress now saves online');}
  }catch(e){console.warn('load save failed',e);FB.name=u.displayName||'Rider';toast('Couldn\'t reach your online save · playing offline, nothing will be overwritten');}
  FB.loading=false;save.set.name=FB.name;persistLocalOnly();refreshAcctChip();closeAccount();}
function applyCloudSave(cs){const acct=save.acct;save=Object.assign(defaultSave(),cs);save.acct=acct;fixSet();ensureQuests();hydrateCustom();
  if(sk){sk.gogMode=save.set.gog;sk.apply(validLoad(),save.body);sk.setPoles(save.set.poles);}for(const t in THUMB)delete THUMB[t];applySettings();if(mode==='lobby')setView(view);refreshWallet();}
function persistLocalOnly(){try{localStorage.setItem('dub12',JSON.stringify(save));}catch(e){}}
function cleanSave(){const s=JSON.parse(JSON.stringify(save));delete s.acct;if(s.custom)s.custom=s.custom.map(c=>c&&c.url?{url:c.url}:null);return JSON.stringify(s);}
function cloudSaveSoon(){if(!FB.user||FB.loading||FB.noSync)return;clearTimeout(FB.saveT);FB.saveT=setTimeout(cloudSaveNow,2500);}
async function cloudSaveNow(){if(!FB.user||FB.noSync)return;try{await FB.db.collection('users').doc(FB.user.uid).set({name:FB.name,save:cleanSave(),updated:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});}catch(e){console.warn('cloud save failed',e);}}
window.addEventListener('beforeunload',()=>{if(FB.user&&FB.saveT){clearTimeout(FB.saveT);cloudSaveNow();}});

/* ---------- UI ---------- */
function buildAccountUI(){if($('acctModal'))return;
  const d=document.createElement('div');d.id='acctModal';d.className='modal hide';
  d.innerHTML='<div class="glass box acbox"><div class="logo" style="font-size:34px;margin-bottom:6px">DUB<i>12</i></div>'+
    '<div id="acIn"><div class="actabs"><button data-t="signup">CREATE ACCOUNT</button><button data-t="login">LOG IN</button></div>'+
    '<div class="note" id="acPitch" style="margin:2px 0 12px">Save your coins, unlocks, outfits and best scores online, and pick up on any device.</div>'+
    '<input id="acName" placeholder="Rider name (shown to everyone)" maxlength="16" autocomplete="nickname">'+
    '<input id="acEmail" placeholder="Email" autocomplete="email"><input id="acPass" type="password" placeholder="Password (6+ characters)" autocomplete="new-password">'+
    '<div id="acErr"></div><button class="btn" id="acGo" style="width:100%">CREATE ACCOUNT</button>'+
    '<div class="acfoot"><button class="lnk" id="acGuest">Play as guest</button><button class="lnk" id="acForgot">Forgot password?</button><button class="lnk" id="acStaff">Staff login</button></div></div>'+
    '<div id="acOut" class="hide"><div class="ttl" id="acWho"></div><div class="note" style="margin:6px 0 16px">Signed in. Your progress saves to your account automatically.</div>'+
    '<div class="drow"><button class="btn ghost" id="acClose">CLOSE</button><button class="btn" id="acLogout">LOG OUT</button></div></div>'+
    '<div id="acOff" class="hide"><div class="note" style="margin:6px 0 16px">Online accounts aren\'t switched on for this copy of the game yet, so progress saves in this browser.</div><div class="drow"><button class="btn ghost" id="acClose2">CLOSE</button><button class="btn" id="acStaff2">STAFF LOGIN</button></div></div></div>';
  document.body.appendChild(d);
  d.querySelectorAll('.actabs button').forEach(b=>b.onclick=()=>openAccount(b.dataset.t));
  $('acGo').onclick=submitAccount;$('acPass').onkeydown=e=>{if(e.key==='Enter')submitAccount();};
  const guest=()=>{try{localStorage.setItem('dub12_guest','1');}catch(e){}};
  $('acGuest').onclick=()=>{guest();closeAccount();toast('Playing as guest · sign up any time from the top bar');};
  $('acClose').onclick=$('acClose2').onclick=closeAccount;
  // Esc closes the account window (counts as "play as guest")
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('acctModal').classList.contains('hide')){e.stopImmediatePropagation();guest();closeAccount();}},true);
  // log out: the next person on this browser starts fresh instead of inheriting this account's progress
  $('acLogout').onclick=async()=>{await cloudSaveNow();await FB.auth.signOut();guest();save=defaultSave();fixSet();ensureQuests();persistLocalOnly();
    if(sk){sk.apply(validLoad(),save.body);}applySettings();if(mode==='lobby')setView(view);refreshWallet();closeAccount();toast('Logged out');};
  $('acForgot').onclick=async()=>{const em=$('acEmail').value.trim();if(!em){acErr('Type your email first.');return;}try{await FB.auth.sendPasswordResetEmail(em);acErr('Reset link sent to '+em,true);}catch(e){acErr(fbMsg(e));}};
  const staff=()=>{closeAccount();$('loginBox').classList.remove('hide');$('acctBox').classList.add('hide');$('lErr').textContent='';$('login').classList.remove('hide');};
  $('acStaff').onclick=$('acStaff2').onclick=staff;
  $('acctBtn').onclick=()=>openAccount(FB.user?'out':'signup');}
let acTab='signup';
function openAccount(t){acTab=t;const m=$('acctModal');m.classList.remove('hide');
  const off=!window.DUB12_FIREBASE||(!FB.ready&&!FB.user);$('acOff').classList.toggle('hide',!off);
  $('acIn').classList.toggle('hide',off||t==='out');$('acOut').classList.toggle('hide',off||t!=='out');
  if(t==='out'){$('acWho').textContent=FB.name||'Rider';return;}
  document.querySelectorAll('.actabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));
  $('acName').classList.toggle('hide',t!=='signup');$('acGo').textContent=t==='signup'?'CREATE ACCOUNT':'LOG IN';
  $('acPass').autocomplete=t==='signup'?'new-password':'current-password';acErr('');}
function closeAccount(){const m=$('acctModal');if(m)m.classList.add('hide');}
function acErr(t,ok){const e=$('acErr');e.textContent=t;e.style.color=ok?'#39d98a':'#ff4d6d';}
function fbMsg(e){const c=(e&&e.code)||'';return ({'auth/email-already-in-use':'That email already has an account. Try LOG IN.','auth/invalid-email':'That email doesn\'t look right.','auth/weak-password':'Password needs at least 6 characters.',
  'auth/invalid-credential':'Wrong email or password.','auth/wrong-password':'Wrong email or password.','auth/user-not-found':'No account with that email.','auth/too-many-requests':'Too many tries. Wait a minute and try again.',
  'auth/network-request-failed':'Can\'t reach the server. Check your connection.'})[c]||(e&&e.message)||'Something went wrong.';}
async function submitAccount(){if(!FB.ready){acErr('Still connecting… try again in a second.');return;}
  const em=$('acEmail').value.trim(),pw=$('acPass').value,nm=$('acName').value.trim();
  if(!em||!pw){acErr('Enter your email and password.');return;}
  $('acGo').disabled=true;
  try{if(acTab==='signup'){
      if(!/^[A-Za-z0-9_ .-]{3,16}$/.test(nm)){acErr('Rider name: 3–16 letters, numbers, spaces or _ . -');return;}
      const key=nm.toLowerCase().replace(/\s+/g,'_'),nref=FB.db.collection('names').doc(key);
      if((await nref.get()).exists){acErr('That rider name is taken.');return;}
      FB.signingUp=true;const cred=await FB.auth.createUserWithEmailAndPassword(em,pw);
      await cred.user.updateProfile({displayName:nm});await nref.set({uid:cred.user.uid});FB.signingUp=false;
      sessionStorage.removeItem('dub12_guest');await onAuth(cred.user);}
    else{await FB.auth.signInWithEmailAndPassword(em,pw);sessionStorage.removeItem('dub12_guest');}
    $('acPass').value='';}
  catch(e){FB.signingUp=false;acErr(fbMsg(e));}
  finally{$('acGo').disabled=false;}}
function refreshAcctChip(){const b=$('acctBtn');if(!b)return;
  if(save.acct){b.textContent=save.acct.u;b.classList.add('in');return;}
  b.textContent=FB.user?(FB.name||'Rider'):'SIGN UP';b.classList.toggle('in',!!FB.user);}
// the game may finish loading before or after this script: start whichever way round it happens
if(document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide'))initAccounts();
