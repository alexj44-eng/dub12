/* DUB12 — data: catalog, maps, quests, pass, save */
'use strict';
const rng=seed=>()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
const hex=c=>'#'+('00000'+(c>>>0).toString(16)).slice(-6);
const RAR={common:{n:'Common',c:'#9aa7c2',p:300},rare:{n:'Rare',c:'#3aa0ff',p:800},epic:{n:'Epic',c:'#b36bff',p:1500},legendary:{n:'Legendary',c:'#ffb03f',p:2500}};

/* ---------- ski top sheets ---------- */
function skiText(g,w,h,txt,col,y,size){g.save();g.translate(w/2,y);g.rotate(-Math.PI/2);g.fillStyle=col;g.font=(size||26)+'px Bungee,Impact,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,0,0);g.restore();}
const SKI_ART={
 topo(g,w,h){const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#0b3d4a');gr.addColorStop(1,'#12a0a0');g.fillStyle=gr;g.fillRect(0,0,w,h);
   g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=1.3;for(let k=0;k<26;k++){g.beginPath();for(let x=-4;x<=w+4;x+=4){const y=k*22-20+Math.sin(x*.09+k*.7)*9+Math.sin(x*.21+k)*4;x<0?g.moveTo(x,y):g.lineTo(x,y);}g.stroke();}
   g.fillStyle='#0b3d4a';g.fillRect(12,170,w-24,180);skiText(g,w,h,'NORTHWALL','#fff',260);},
 chevron(g,w,h){g.fillStyle='#111';g.fillRect(0,0,w,h);for(let k=0;k<14;k++){g.fillStyle=k%3===0?'#fff':'#e63946';const y=k*38-10;g.beginPath();g.moveTo(0,y+26);g.lineTo(w/2,y);g.lineTo(w,y+26);g.lineTo(w,y+38);g.lineTo(w/2,y+12);g.lineTo(0,y+38);g.fill();}
   g.fillStyle='#111';g.fillRect(10,180,w-20,170);skiText(g,w,h,'KESTREL','#e63946',265);},
 sunset(g,w,h){const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#2b1b6b');gr.addColorStop(.4,'#d1458f');gr.addColorStop(.7,'#ff7a1a');gr.addColorStop(1,'#ffd23f');g.fillStyle=gr;g.fillRect(0,0,w,h);
   g.fillStyle='#fff3c4';g.beginPath();g.arc(w/2,150,24,0,7);g.fill();g.fillStyle='#d1458f';for(let k=0;k<5;k++)g.fillRect(0,152+k*7,w,2+k*.8);
   g.fillStyle='#2b1b6b';g.beginPath();g.moveTo(0,440);for(let x=0;x<=w;x+=8)g.lineTo(x,430-Math.abs(Math.sin(x*.13))*40);g.lineTo(w,h);g.lineTo(0,h);g.fill();skiText(g,w,h,'DRIFT CO.','#fff',300);},
 splatter(g,w,h){g.fillStyle='#0c0c12';g.fillRect(0,0,w,h);const r=rng(7),cols=['#39ff9e','#ff3df0','#3df0ff','#fff34d'];
   for(let k=0;k<170;k++){g.fillStyle=cols[(r()*4)|0];g.globalAlpha=.55+r()*.45;g.beginPath();g.arc(r()*w,r()*h,r()*r()*7+.6,0,7);g.fill();}
   g.globalAlpha=1;g.fillStyle='#0c0c12';g.fillRect(12,180,w-24,170);skiText(g,w,h,'HALCYON','#39ff9e',265);},
 wood(g,w,h){g.fillStyle='#b98352';g.fillRect(0,0,w,h);const r=rng(21);g.strokeStyle='rgba(90,52,24,.5)';
   for(let k=0;k<26;k++){g.lineWidth=.6+r()*1.6;const x0=r()*w;g.beginPath();g.moveTo(x0,0);for(let y=0;y<=h;y+=16)g.lineTo(x0+Math.sin(y*.02+k)*5,y);g.stroke();}
   g.fillStyle='#1d3a2c';for(let k=0;k<5;k++){const x=8+k*12,hh=40+((k*37)%30);g.beginPath();g.moveTo(x-9,h-70);g.lineTo(x,h-70-hh);g.lineTo(x+9,h-70);g.fill();}
   g.fillRect(0,h-72,w,72);skiText(g,w,h,'PINELINE','#f6ead2',250);},
 glitch(g,w,h){g.fillStyle='#101018';g.fillRect(0,0,w,h);const r=rng(4);
   for(let k=0;k<60;k++){const y=r()*h,hh=2+r()*14;g.fillStyle=['#ff2e63','#08d9d6','#eaeaea'][(r()*3)|0];g.globalAlpha=.8;g.fillRect(r()*w*.5,y,w*(.3+r()*.7),hh);}
   g.globalAlpha=1;skiText(g,w,h,'STATIC','#08d9d6',250,30);skiText(g,w,h,'STATIC','#ff2e63',253,30);},
 camo(g,w,h){g.fillStyle='#4b5a3a';g.fillRect(0,0,w,h);const r=rng(11),cs=['#2f3a25','#7a6a48','#1d2216','#5f6d47'];
   for(let k=0;k<90;k++){g.fillStyle=cs[(r()*4)|0];g.beginPath();const x=r()*w,y=r()*h;g.ellipse(x,y,6+r()*18,10+r()*30,r()*3,0,7);g.fill();}
   skiText(g,w,h,'FIELD UNIT','#e8e0c8',256,22);},
 checker(g,w,h){for(let y=0;y<h;y+=16)for(let x=0;x<w;x+=16){g.fillStyle=((x+y)/16)%2?'#f4f4f0':'#151515';g.fillRect(x,y,16,16);}
   g.fillStyle='#ff4d6d';g.fillRect(8,150,w-16,220);skiText(g,w,h,'CHEKR','#fff',260,30);},
 flames(g,w,h){g.fillStyle='#120708';g.fillRect(0,0,w,h);const cols=['#ff2a00','#ff7a1a','#ffd23f'];
   cols.forEach((c,i)=>{g.fillStyle=c;g.beginPath();g.moveTo(0,h);for(let y=h;y>=h*(.35+i*.12);y-=10){const k=(h-y)/h;g.lineTo(w*(.5+.45*Math.sin(y*.05+i)*(1-k)),y);}g.lineTo(w,h);g.fill();});
   skiText(g,w,h,'INFERNO','#ffd23f',170,28);},
 aurora(g,w,h){const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#030620');gr.addColorStop(1,'#0b1a3a');g.fillStyle=gr;g.fillRect(0,0,w,h);
   const r=rng(2);for(let k=0;k<70;k++){g.fillStyle='#fff';g.globalAlpha=r();g.fillRect(r()*w,r()*h,1.5,1.5);}
   g.globalAlpha=.55;['#39ff9e','#3df0ff','#b36bff'].forEach((c,i)=>{g.strokeStyle=c;g.lineWidth=14-i*3;g.beginPath();for(let y=0;y<=h;y+=8){const x=w/2+Math.sin(y*.018+i*1.7)*22;y?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();});
   g.globalAlpha=1;skiText(g,w,h,'POLARIS','#fff',256,26);},
 gold(g,w,h){const gr=g.createLinearGradient(0,0,w,h);gr.addColorStop(0,'#8a6114');gr.addColorStop(.3,'#ffe08a');gr.addColorStop(.55,'#c8922a');gr.addColorStop(.8,'#fff1b8');gr.addColorStop(1,'#8a6114');g.fillStyle=gr;g.fillRect(0,0,w,h);
   g.strokeStyle='rgba(60,40,0,.35)';for(let y=0;y<h;y+=24){g.beginPath();g.moveTo(0,y);g.lineTo(w,y+24);g.stroke();}skiText(g,w,h,'DUB12','#3a2600',256,30);},
 retro(g,w,h){g.fillStyle='#f3e6c8';g.fillRect(0,0,w,h);['#e63946','#f4a261','#2a9d8f','#264653'].forEach((c,i)=>{g.fillStyle=c;g.fillRect(i*w/4,0,w/4+1,h);});
   g.fillStyle='#f3e6c8';g.fillRect(8,160,w-16,200);skiText(g,w,h,'ALPENFUNK','#264653',260,20);}
};

/* ---------- catalog ---------- */
const ITEMS=[];const IDX={};
function item(o){o.rarity=o.rarity||'common';o.price=o.price===undefined?RAR[o.rarity].p:o.price;o.src=o.src||'shop';ITEMS.push(o);IDX[o.id]=o;return o;}
[
 ['j_triple','Triple Black',0x17171b,0x202026,0x2e2e36,null,'common','starter'],['j_ember','Ember',0xff4d3d,0xffd23f,0x1c1f2b,null,'common','starter'],['j_glacier','Glacier',0x2f9bff,0xffffff,0x20242e,null,'common','starter'],
 ['j_moss','Moss',0x5f8a3a,0xe8d9a8,0x3b2f25,null,'common'],['j_sun','Sunflower',0xffc928,0x22306b,0x22306b,null,'common'],
 ['j_orchid','Orchid',0xa55cff,0x39d98a,0x15151c,null,'rare'],['j_bone','Bone',0xeee6d8,0xff7a1a,0x6b4a2e,null,'rare'],
 ['j_bubble','Bubblegum',0xff7ab8,0x58d7ff,0xf2f2f2,null,'rare'],['j_black','Blackout',0x1c1c22,0x3a3a44,0x8a8a96,null,'rare'],
 ['j_camo','Woodland Camo',0x4b5a3a,0x2f3a25,0xd9cfa8,'camo','epic',null,0x7a6a48],['j_plaid','Lumberjack',0xb3261e,0x151515,0x151515,'plaid','epic',null,0x151515],
 ['j_snowcamo','Arctic Camo',0xdfe6ee,0x8b9bb0,0x2c3440,'camo','epic',null,0x9fb0c4],['j_split','Split Decision',0xff4d6d,0x2f9bff,0xffffff,'split','epic',null,0x2f9bff],
 ['j_splat','Paint Bomb',0x15151c,0x39ff9e,0xff3df0,'splat','legendary',null,0x39ff9e],['j_flame','Hot Lap',0x151515,0xff7a1a,0xffd23f,'flames','legendary',null,0xff4d1a],
 ['j_aurora','Aurora Shell',0x0b1a3a,0x39ff9e,0x3df0ff,'aurora','legendary','pass',0x39ff9e],['j_gold','Podium Gold',0xd9a531,0x1a1a1a,0xfff1b8,'gold','legendary','pass',0xfff1b8],
 ['j_check','Checkered Flag',0xf4f4f0,0x151515,0xff4d6d,'check','epic','pass',0x151515],['j_teal','Tidal',0x18a999,0xffd23f,0x0d2b33,null,'rare','pass']
].forEach(a=>item({id:a[0],cat:'jacket',n:a[1],c:a[2],a:a[3],t:a[4],pat:a[5],rarity:a[6],src:a[7]||'shop',p2:a[8]}));
[
 ['p_triple','Black Baggies',0x18181c,null,'common','starter'],['p_navy','Navy',0x1b2247,null,'common','starter'],['p_black','Charcoal',0x24262e,null,'common','starter'],['p_tan','Desert Tan',0xb59a6e,null,'common'],
 ['p_white','Whiteout',0xe9ecf2,null,'rare'],['p_olive','Olive',0x58613f,null,'common'],['p_red','Fire Red',0xc62f2f,null,'rare'],
 ['p_camo','Camo Cargo',0x4b5a3a,'camo','epic',null,0x7a6a48],['p_plaid','Flannel',0x2f4f8f,'plaid','epic',null,0x111a2e],['p_snowcamo','Arctic Cargo',0xdfe6ee,'camo','epic',null,0x9fb0c4],
 ['p_pj','PJ Pants',0xb3261e,'plaid','rare',null,0x1d5a2a],['p_pj2','Cozy PJs',0x2f4f8f,'check','rare',null,0xdfe6ee],['p_pjcamo','Camo PJs',0x6b7a55,'camo','rare',null,0x3a4530],
 ['p_splat','Drip',0x15151c,'splat','legendary','pass',0xff3df0],['p_check','Checkmate',0xf4f4f0,'check','epic','pass',0x151515]
].forEach(a=>item({id:a[0],cat:'pants',n:a[1],c:a[2],pat:a[3],rarity:a[4],src:a[5]||'shop',p2:a[6]}));
[
 ['g_black','Stealth',0x17181d,0x2c2e36,'common','starter'],['g_red','Red Mitts',0xd8343b,0x1a1a1a,'common'],['g_tan','Leather',0x9a6a3c,0x5a3a1c,'rare'],
 ['g_mitt','Leather Mitts',0x7a4a26,0x3a2412,'rare'],['g_mitt_blk','Black Leather Mitts',0x1e1a18,0x6a4a2a,'epic'],['g_white','Snowblind',0xeeeeee,0x9fb0c4,'rare'],['g_neon','Hi-Vis',0xd7ff3a,0x1a1a1a,'epic'],['g_gold','Gilded',0xd9a531,0x5a3a10,'legendary','pass']
].forEach(a=>item({id:a[0],cat:'gloves',n:a[1],c:a[2],a:a[3],rarity:a[4],src:a[5]||'shop'}));
[
 ['h_none','No Helmet','none',0,0,'common','starter'],['h_black','Matte Black','shell',0x1a1a20,0x2a2a30,'common','starter'],['h_bucket_blk','Skate Lid','bucket',0x1c1c22,0x2a2a30,'common','starter'],['h_bucket_wht','Skate Lid White','bucket',0xeeeeea,0x2a2a30,'rare'],['h_bucket_olv','Skate Lid Olive','bucket',0x5a6440,0x2a2a30,'rare'],['h_bucket_pink','Skate Lid Pink','bucket',0xff8fbf,0x2a2a30,'epic'],['h_snow','Snow','shell',0xf2f2ee,0x2a2a30,'common'],['h_red','Signal Red','shell',0xe63946,0x1a1a20,'common'],
 ['h_navy','Deep Sea','pro',0x1d4e89,0xffffff,'rare'],['h_lime','Lime Pro','pro',0xb5e61d,0x1a1a20,'rare'],['h_sand','Sand Pro','pro',0xd9b98a,0x6b4a2e,'rare'],
 ['h_chrome','Chrome Dome','pro',0xcfd6e4,0x1a1a20,'epic',null,1],['h_beanie_r','Red Beanie','beanie',0xc62f2f,0xffffff,'rare'],['h_beanie_y','Mustard Beanie','beanie',0xe0a526,0x2a2a30,'rare'],
 ['h_beanie_s','Striped Beanie','beanie',0x2a2a30,0x58d7ff,'epic'],['h_gold','Gold Lid','pro',0xd9a531,0x1a1a20,'legendary','pass',1],['h_teal','Teal Shell','shell',0x2bb3a3,0x1a1a20,'rare','pass']
].forEach(a=>item({id:a[0],cat:'helmet',n:a[1],style:a[2],c:a[3],a:a[4],rarity:a[5],src:a[6]||'shop',metal:a[7]}));
[
 ['o_none','No Goggles','none',0,0,0,'common','starter'],['o_fire','Fire Iridium','frame',0x111111,0xff7a1a,0x111111,'common','starter'],['o_ice','Ice Blue','frame',0xffffff,0x58d7ff,0xffffff,'common','starter'],
 ['o_chrome','Chrome','frame',0x222222,0xd8dde6,0x222222,'common'],['o_rose','Rose','frame',0x2b1b3d,0xff5d8f,0x2b1b3d,'rare'],['o_jade','Jade','rimless',0x111111,0x39d98a,0x111111,'rare'],
 ['o_gold','Gold Rush','rimless',0x6b4a2e,0xffd23f,0x6b4a2e,'epic'],['o_violet','Violet Haze','rimless',0xffffff,0x8f5bff,0xffffff,'epic'],['o_void','Void','frame',0x15151a,0x15151a,0x15151a,'rare'],
 ['o_prism','Prism','rimless',0x111111,0xff3df0,0x39ff9e,'legendary'],['o_sunrise','Sunrise','rimless',0xff7a1a,0xffb03f,0xff4d6d,'legendary','pass']
].forEach(a=>item({id:a[0],cat:'goggles',n:a[1],style:a[2],f:a[3],l:a[4],s:a[5],rarity:a[6],src:a[7]||'shop'}));
[
 ['b_free_blk','Park Pro','free',0x24262e,0x3a3d48,'common','starter'],['b_free_wht','Park Pro White','free',0xeeeeee,0x2a2a30,'rare'],['b_free_lime','Park Pro Lime','free',0xb5e61d,0x1a1a20,'rare'],
 ['b_race_red','Race Plug','race',0xd8343b,0x1a1a20,'rare'],['b_race_blu','Race Plug Blue','race',0x1d6fd8,0xeeeeee,'epic'],
 ['b_retro_pur','Rear Entry 88','retro',0x7a3cff,0xffd23f,'epic'],['b_retro_tq','Rear Entry Teal','retro',0x2bb3a3,0xff7ab8,'epic'],
 ['b_free_mint','Park Pro Mint','free',0x9fe8d0,0x1a1a20,'rare'],['b_race_blk','Race Plug Stealth','race',0x18181c,0x3a3a44,'epic'],['b_retro_blk','Rear Entry Night','retro',0x1c1c22,0xffd23f,'epic'],
 ['b_free_gold','Trophy','free',0xd9a531,0x1a1a20,'legendary','pass'],['b_retro_wht','Après','retro',0xf2efe6,0xc62f2f,'legendary']
].forEach(a=>item({id:a[0],cat:'boots',n:a[1],style:a[2],c:a[3],a:a[4],rarity:a[5],src:a[6]||'shop'}));
[
 ['s_topo','NORTHWALL Ridgeline 106','topo',0x0f6f78,'common','starter'],['s_chev','KESTREL Proto 98','chevron',0xe63946,'common','starter'],
 ['s_sunset','DRIFT CO. Daydream 112','sunset',0xff7a1a,'rare'],['s_splat','HALCYON Blackout 102','splatter',0x39ff9e,'rare'],['s_wood','PINELINE Timber 108','wood',0x2a4d3a,'rare'],
 ['s_glitch','STATIC Glitch 96','glitch',0x08d9d6,'epic'],['s_camo','FIELD UNIT Recon 100','camo',0x4b5a3a,'epic'],['s_check','CHEKR Grid 94','checker',0xff4d6d,'epic'],
 ['s_flames','INFERNO Hot Lap 99','flames',0xff7a1a,'legendary'],['s_aurora','POLARIS Night 104','aurora',0x3df0ff,'legendary','pass'],
 ['s_gold','DUB12 Gold Edition','gold',0xd9a531,'legendary','pass'],['s_retro','ALPENFUNK Retro 90','retro',0xe63946,'epic','pass'],
 ['s_rocket','VELOCITY Rocket 88','flames',0xff4d1a,'rare'],['s_pop','SPRING Pop 92','checker',0xffd23f,'rare'],['s_whirl','VORTEX Whirl 90','glitch',0xb36bff,'rare'],['s_apex','DUB12 Apex Pro','gold',0x111111,'legendary']
].forEach(a=>item({id:a[0],cat:'skis',n:a[1],art:a[2],base:a[3],rarity:a[4],src:a[5]||'shop'}));

[
 ['m_none','No Mask','none',0,null,'common','starter'],['m_clava_blk','Black Balaclava','clava',0x16161a,null,'common','starter'],['m_gaiter_blk','Black Face Mask','gaiter',0x1a1a1e,null,'common','starter'],
 ['m_clava_wht','White Balaclava','clava',0xe8e8e4,null,'rare'],['m_clava_red','Red Balaclava','clava',0xb3261e,null,'rare'],['m_clava_camo','Camo Balaclava','clava',0x4b5a3a,'camo','epic',null,0x7a6a48],
 ['m_clava_snow','Arctic Balaclava','clava',0xdfe6ee,'camo','epic',null,0x9fb0c4],['m_gaiter_teal','Teal Face Mask','gaiter',0x2bb3a3,null,'rare'],['m_gaiter_plaid','Plaid Face Mask','gaiter',0x2f4f8f,'plaid','epic',null,0x111a2e],
 ['m_band_red','Red Bandana','bandana',0xc62f2f,'plaid','rare',null,0x6a1010],['m_band_camo','Camo Bandana','bandana',0x4b5a3a,'camo','rare',null,0x2f3a25],['m_clava_gold','Gold Balaclava','clava',0xd9a531,'gold','legendary','pass',0xfff1b8],
 ['m_clava_splat','Splatter Balaclava','clava',0x15151c,'splat','legendary',null,0x39ff9e]
].forEach(a=>item({id:a[0],cat:'mask',n:a[1],style:a[2],c:a[3],pat:a[4],rarity:a[5],src:a[6]||'shop',p2:a[7]}));
/* ski performance stats: [speed, pop, spin] 1-5 */
const SKISTAT={s_topo:[3,3,3],s_chev:[2,4,4],s_sunset:[4,3,2],s_splat:[3,4,3],s_wood:[4,2,3],s_glitch:[3,3,5],s_camo:[4,4,2],s_check:[2,5,4],s_flames:[5,3,3],s_aurora:[4,4,4],s_gold:[5,5,4],s_retro:[3,3,4],s_rocket:[5,2,2],s_pop:[2,5,3],s_whirl:[2,3,5],s_apex:[5,4,5]};
const statOf=id=>id&&id.startsWith('custom')?[3,3,3]:(SKISTAT[id]||[3,3,3]);
/* tricks */
const TRICKS=[
 {id:'t_mute',k:'grab',n:'Mute',d:'Front hand to the outside of the opposite ski.',m:1,rarity:'common',src:'starter'},
 {id:'t_safety',k:'grab',n:'Safety',d:'Grab under the binding, knee tucked.',m:1,rarity:'common',src:'starter'},
 {id:'t_japan',k:'grab',n:'Japan',d:'Skis tweaked behind your back.',m:1.1,rarity:'common',src:'starter'},
 {id:'t_tail',k:'grab',n:'Tail',d:'Reach back and snag the tail.',m:1.1,rarity:'common'},
 {id:'t_critical',k:'grab',n:'Critical',d:'Cross-body grab to the opposite tip.',m:1.25,rarity:'rare'},
 {id:'t_blunt',k:'grab',n:'Blunt',d:'Tail grab with the skis poked out.',m:1.25,rarity:'rare'},
 {id:'t_truck',k:'grab',n:'Truck Driver',d:'Both hands, both tips, like a steering wheel.',m:1.4,rarity:'epic'},
 {id:'t_octo',k:'grab',n:'Octograb',d:'Both skis crossed and held. Pure style.',m:1.6,rarity:'legendary'},
 {id:'t_cork',k:'style',n:'Cork',d:'Classic off-axis spin.',m:1,tilt:.45,rarity:'common',src:'starter'},
 {id:'t_flat',k:'style',n:'Flatspin',d:'Flat, sideways rotation.',m:1.1,tilt:1.25,rarity:'rare'},
 {id:'t_bio',k:'style',n:'Bio',d:'Back-and-over, front shoulder drops.',m:1.15,tilt:.8,rarity:'rare'},
 {id:'t_rodeo',k:'style',n:'Rodeo',d:'Backflip with a sideways spin.',m:1.2,tilt:-.7,rarity:'epic'},
 {id:'t_misty',k:'style',n:'Misty',d:'Frontflip that rolls into a spin.',m:1.2,tilt:1.0,rarity:'epic'},
 {id:'t_dub',k:'style',n:'Lincoln Loop',d:'Huge, slow, inverted loop. Legendary style points.',m:1.35,tilt:1.45,rarity:'legendary'}
];
TRICKS.forEach(t=>{t.cat='trick';item(t);});
const BODY={
 skin:[0xf6d7c0,0xeec1a0,0xe0aa84,0xc98e64,0xa86f48,0x8a5636,0x6a3f26,0x4a2b1a],
 hair:[['buzz','Buzz'],['crop','Crop'],['flow','Flow'],['pony','Ponytail'],['braids','Braids'],['curls','Curls']],
 hairColor:[0x1a1210,0x3b2416,0x6b4226,0x9a6a3c,0xd9b46a,0xf0dca0,0xb5502a,0xe8e8e8,0xff7ab8,0x3aa0ff,0x39d98a,0x8f5bff],
 eye:[0x5a3a22,0x2f6db5,0x3f8a4a,0x7d8a99,0x9a7a2c,0x2a1a10,0x8f5bff,0xd8343b],
 build:[['slim','Slim',.9],['regular','Regular',1],['athletic','Athletic',1.08],['broad','Broad',1.17]],
 height:[['short','Short',.94],['avg','Average',1],['tall','Tall',1.06]]
};
const CATS=[['jacket','Jacket'],['pants','Pants'],['gloves','Gloves'],['helmet','Helmet'],['goggles','Goggles'],['mask','Face'],['boots','Boots'],['skis','Skis'],['trick','Tricks']];

/* ---------- maps ---------- */
const MAPS={
 park:{n:'Sunset Park',zone:'Lower Mountain',d:'Groomed jump line with rails and boxes. The classic warm-up lap.',diff:'Flow',lvl:1,pin:[-.55,.05],
   sky:'linear-gradient(#1b2a6b 0%,#6a55a8 42%,#f08a8f 74%,#ffd9a0 100%)',fog:0xf0a39a,hemi:[0xe6e9ff,0x7d78b8,.62],sun:[0xffd7a8,.52,[-.5,.6,.5]],tex:'cord',tree:[0x1f3a4f,0x2b5066],rng:0xd8b8d8},
 rails:{n:'Rail Garden',zone:'Lower Mountain',d:'Wall-to-wall jibs: rails, down-flat-downs and boxes in every lane.',diff:'Jib',lvl:1,pin:[-.2,-.05],
   sky:'linear-gradient(#3b7bd6 0%,#9fd0ff 60%,#eaf6ff 100%)',fog:0xdbeeff,hemi:[0xffffff,0x8fa8d8,.66],sun:[0xffffff,.5,[.3,.8,.4]],tex:'cord',tree:[0x1d4a35,0x2a6a4a],rng:0xffffff},
 back:{n:'Backcountry',zone:'North Face',d:'Powder, cliff drops and tight trees. Pick your line.',diff:'Steep',lvl:2,pin:[.05,.4],
   sky:'linear-gradient(#2f7fd6 0%,#8fc6ff 55%,#e6f3ff 100%)',fog:0xd6e8fb,hemi:[0xffffff,0x7f9fd8,.64],sun:[0xffffff,.48,[.4,.8,.3]],tex:'pow',tree:[0x1d4a35,0x2a6a4a],rng:0xffffff},
 night:{n:'Night Big Air',zone:'Village Base',d:'Three massive booters under the floodlights.',diff:'Send',lvl:3,pin:[.42,-.15],
   sky:'linear-gradient(#04061a 0%,#111845 60%,#27306e 100%)',fog:0x18204f,hemi:[0x9db0ff,0x2c3478,.62],sun:[0xc8d6ff,.4,[0,.9,-.3]],tex:'cord',tree:[0x0e1a33,0x162646],rng:0x5060a0,night:1},
 pillow:{n:'Pillow Glades',zone:'East Trees',d:'Stacked pillow lines through old-growth pines.',diff:'Flow',lvl:4,pin:[.62,.3],
   sky:'linear-gradient(#5a7fb8 0%,#c0d4ec 60%,#f4f7fb 100%)',fog:0xe2eaf4,hemi:[0xffffff,0x90a6c8,.66],sun:[0xfff4e0,.42,[-.3,.7,.5]],tex:'pow',tree:[0x1a3d2c,0x24563c],rng:0xffffff},
 downtown:{n:'Downtown Jam',zone:'Village Base',d:'Handrails down stair sets between the buildings. Street session.',diff:'Jib',lvl:5,pin:[.75,-.32],
   sky:'linear-gradient(#0a0c22 0%,#2a1f4f 55%,#6a3a6a 100%)',fog:0x2a2040,hemi:[0xb0a0ff,0x302848,.6],sun:[0xffd0a0,.35,[.4,.7,.2]],tex:'cord',tree:[0x0e1a33,0x162646],rng:0x403868,night:1},
 glacier:{n:'Glacier Bowl',zone:'Summit',d:'Wide-open ice-blue bowl with natural hits and rollers.',diff:'Big',lvl:6,pin:[-.32,.62],
   sky:'linear-gradient(#1a4fa0 0%,#6ab0f0 50%,#d8f0ff 100%)',fog:0xcfe8fb,hemi:[0xe8f6ff,0x6f9fd8,.68],sun:[0xffffff,.5,[.2,.9,.3]],tex:'pow',tree:[0x2a4a5a,0x3a6070],rng:0xe8f4ff,ice:1},
 mega:{n:'Mega Ramp',zone:'Summit',d:'One tower drop-in, one enormous jump. Built for triples.',diff:'Huge',lvl:7,pin:[.2,.78],
   sky:'linear-gradient(#ff7a3a 0%,#ffb070 40%,#ffe2b0 75%,#fff4dc 100%)',fog:0xffd8b0,hemi:[0xfff0e0,0xb08870,.64],sun:[0xffc890,.55,[-.6,.45,.4]],tex:'cord',tree:[0x2a3a3a,0x3a4a48],rng:0xf0c8b0}
};
MAPS.resort={n:'Mt. Twelve Resort',zone:'Free Roam',d:'The whole mountain: 50 named trails, 7 terrain parks, cliff bands, a summit lodge, a base village and a working chairlift. Ride the lift or skip straight to the top.',diff:'Open world',lvl:1,pin:[0,.25],fr:1,
  sky:'linear-gradient(#2a64c8 0%,#86b8f0 55%,#e9f3ff 100%)',fog:0xd8e8fa,hemi:[0xffffff,0x7f9fd8,.64],sun:[0xfff2dc,.52,[.45,.62,.45]],tex:'pow',tree:[0x1d4a35,0x2a6a4a],rng:0xffffff};
const MODES={battle:{n:'Trick Battle',i:'⚔️',d:'You vs 3 riders. Top score wins.'},free:{n:'Freeride',i:'🎿',d:'Solo run for a high score.'},time:{n:'Time Trial',i:'⏱️',d:'Fastest to the finish line.'}};

/* ---------- quests ---------- */
const QUESTS=[
 {id:'cork',t:'Land {n} corks',n:[3,5,8],k:'corks'},{id:'switch',t:'Land {n} tricks riding switch',n:[2,4,6],k:'switchTricks'},
 {id:'score',t:'Score {n} in a single run',n:[15000,30000,50000],k:'bestRun',max:1},{id:'butter',t:'Butter for {n} seconds',n:[4,8,12],k:'butterT'},
 {id:'rail',t:'Slide {n} rails or boxes',n:[4,8,12],k:'slides'},{id:'runs',t:'Finish {n} runs',n:[2,4,6],k:'runs'},
 {id:'win',t:'Win {n} Trick Battles',n:[1,2,3],k:'wins'},{id:'double',t:'Land {n} doubles',n:[1,2,4],k:'doubles'},
 {id:'air',t:'Get {n} seconds of air time',n:[15,30,50],k:'airT'},{id:'grab',t:'Hold grabs for {n} seconds',n:[5,10,16],k:'grabT'},
 {id:'big',t:'Land a 720 or bigger {n} times',n:[1,3,5],k:'big'}
];
function questsFor(day){const r=rng(day*977+13),pool=QUESTS.slice(),out=[];
  for(let i=0;i<3;i++){const q=pool.splice((r()*pool.length)|0,1)[0],tier=i;out.push({id:q.id,goal:q.n[tier],k:q.k,max:q.max,t:q.t.replace('{n}',q.n[tier].toLocaleString()),xp:[400,600,900][tier],coins:[100,150,250][tier],prog:0,claimed:false});}
  return out;}

/* ---------- battle pass ---------- */
const PASS_TIERS=40,XP_PER_LVL=1000;
const PASS=(()=>{const ex=ITEMS.filter(i=>i.src==='pass').map(i=>i.id);const r=[];let e=0;
  for(let t=1;t<=PASS_TIERS;t++){if(t%3===0&&e<ex.length)r.push({t,item:ex[e++]});else r.push({t,coins:t%5===0?500:t%2?150:250});}
  return r;})();

/* staff & admin accounts: sha-256 of 'dub12:'+username+':'+password (passwords are not stored here) */
const ACCOUNTS={"6fa9e9cbd1e501eb9da8f80ca961f5b968eba68cc318ecf2a64fe2006e11f4fb":{"u":"Admin_Alpine","role":"admin"},"f23130cd5f272ed7f4726aab3e0ff47b671d1462244472141a9bcfddba43701e":{"u":"Admin_Summit","role":"admin"},"dcfdae50848387fc744137c39466e4e31155b6109c268841b1854f84c6a659d2":{"u":"Admin_Glacier","role":"admin"},"5120501ab4f4801e570d2db44da67495b0a34d9b150244f88e8f70a923384447":{"u":"Admin_Powder","role":"admin"},"0fdc3745f19b666432c840ed3ef3f07f8412a4de09767bffc028437d1d28f54d":{"u":"Admin_Couloir","role":"admin"}};
/* ---------- save ---------- */
const today=()=>{const d=new Date();return Math.floor((d.getTime()-d.getTimezoneOffset()*60000)/86400000);};
let save=null;
function defaultSave(){return {v:3,coins:500,xp:0,owned:ITEMS.filter(i=>i.src==='starter').map(i=>i.id),
  load:{jacket:'j_triple',pants:'p_triple',gloves:'g_black',helmet:'h_black',goggles:'o_fire',mask:'m_none',boots:'b_free_blk',skis:'s_topo'},tricks:{g:['t_mute','t_safety','t_japan'],style:'t_cork'},keys:null,set:{vol:.7,shadows:1,res:1,view:'third',zoom:1,fov:62,rot:1,hints:1},acct:null,mig5:true,
  body:{skin:2,hair:'crop',hairColor:1,eye:0,build:'regular',height:'avg',hood:false},mig4:true,custom:[null,null,null],best:{},map:'park',gm:'battle',q:null,claimed:[],seen:{}};}
function loadSave(){try{const s=JSON.parse(localStorage.getItem('dub12'));if(s&&s.v===3){save=Object.assign(defaultSave(),s);if(!s.mig5){const d=defaultSave();save.load.mask=save.load.mask||'m_none';d.owned.forEach(i=>{if(!save.owned.includes(i))save.owned.push(i);});save.tricks=d.tricks;save.set=d.set;save.mig5=true;}if(!save.owned.includes('o_none'))save.owned.push('o_none');if(!s.mig4){['j_triple','p_triple'].forEach(i=>{if(!save.owned.includes(i))save.owned.push(i);});save.load.jacket='j_triple';save.load.pants='p_triple';save.body.hood=false;save.mig4=true;persist();}return;}}catch(e){}save=defaultSave();}
function persist(){try{localStorage.setItem('dub12',JSON.stringify(save));}catch(e){}}
loadSave();
const level=()=>1+Math.floor(save.xp/XP_PER_LVL);
function ensureQuests(){const d=today();if(!save.q||save.q.day!==d){save.q={day:d,list:questsFor(d)};persist();}}
ensureQuests();
const TOD={map:{n:'Map default'},sunrise:{n:'Sunrise',sky:'linear-gradient(#3a4f9a 0%,#f0a0b0 50%,#ffd8a0 100%)',fog:0xf4c8b8,hemi:[0xffe8e0,0x8a7ab8,.6],sun:[0xffc0a0,.55,[.8,.35,.3]],rng:0xf0c8c8,night:0},
 day:{n:'Midday',sky:'linear-gradient(#2f7fd6 0%,#8fc6ff 55%,#e6f3ff 100%)',fog:0xd6e8fb,hemi:[0xffffff,0x7f9fd8,.64],sun:[0xffffff,.5,[.4,.8,.3]],rng:0xffffff,night:0},
 sunset:{n:'Sunset',sky:'linear-gradient(#1b2a6b 0%,#6a55a8 42%,#f08a8f 74%,#ffd9a0 100%)',fog:0xf0a39a,hemi:[0xe6e9ff,0x7d78b8,.62],sun:[0xffd7a8,.52,[-.5,.6,.5]],rng:0xd8b8d8,night:0},
 night:{n:'Night',sky:'linear-gradient(#04061a 0%,#111845 60%,#27306e 100%)',fog:0x18204f,hemi:[0x9db0ff,0x2c3478,.62],sun:[0xc8d6ff,.4,[0,.9,-.3]],rng:0x5060a0,night:1}};
const VIEWS=[['third','Third person'],['first','First person'],['side','Side cam'],['drone','Drone']];
function fixSet(){const d={vol:.7,shadows:1,res:1,view:'third',zoom:1,fov:62,rot:1,hints:1,tod:'map',name:'',sideways:1,assist:1,invert:0,respawn:1,bots:1,slowmo:0,popups:1,units:'kmh',poles:1,bighead:0,shake:1,snow:1,fps:0,uiscale:1,speedo:1,fx:1,gog:'face'};for(const k in d)if(save.set[k]===undefined)save.set[k]=d[k];}
fixSet();
const isStaff=()=>!!(save.acct&&(save.acct.role==='admin'||save.acct.role==='staff'));
const isAdmin=()=>!!(save.acct&&save.acct.role==='admin');
const ACTIONS=[['left','Carve left / spin left',['KeyA','ArrowLeft']],['right','Carve right / spin right',['KeyD','ArrowRight']],['fwd','Tuck / frontflip',['KeyW','ArrowUp']],['back','Brake / backflip',['KeyS','ArrowDown']],
 ['jump','Jump (hold to charge)',['Space','']],['sw','Switch 180',['KeyF','']],['g1','Grab slot 1',['ShiftLeft','ShiftRight']],['g2','Grab slot 2',['KeyR','']],['g3','Grab slot 3',['KeyQ','']],
 ['bn','Nose butter',['KeyQ','']],['bt','Tail butter',['KeyR','']],['cam','Change camera',['KeyC','']]];
function binds(){if(!save.keys){save.keys={};}ACTIONS.forEach(a=>{if(!save.keys[a[0]])save.keys[a[0]]=a[2].slice();});return save.keys;}
const keyName=c=>!c?'—':c.replace(/^Key/,'').replace(/^Digit/,'').replace('ArrowLeft','←').replace('ArrowRight','→').replace('ArrowUp','↑').replace('ArrowDown','↓').replace('ShiftLeft','L-Shift').replace('ShiftRight','R-Shift').replace('ControlLeft','L-Ctrl').replace('Space','Space');
