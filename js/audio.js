/* DUB12 — synthesized sound effects */
'use strict';
let AC=null,master=null,wind=null,windG=null,windF=null,carveG=null;
function audioStart(){if(AC){if(AC.state==='suspended')AC.resume();return;}
  try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return;}
  master=AC.createGain();master.gain.value=save.set.vol;master.connect(AC.destination);
  const len=AC.sampleRate*2,buf=AC.createBuffer(1,len,AC.sampleRate),d=buf.getChannelData(0);let b=0;for(let i=0;i<len;i++){b=.98*b+.02*(Math.random()*2-1);d[i]=b*6;}
  wind=AC.createBufferSource();wind.buffer=buf;wind.loop=true;windF=AC.createBiquadFilter();windF.type='bandpass';windF.frequency.value=400;windF.Q.value=.7;
  windG=AC.createGain();windG.gain.value=0;wind.connect(windF);windF.connect(windG);windG.connect(master);
  const cn=AC.createBufferSource();cn.buffer=buf;cn.loop=true;const cf=AC.createBiquadFilter();cf.type='highpass';cf.frequency.value=1800;carveG=AC.createGain();carveG.gain.value=0;cn.connect(cf);cf.connect(carveG);carveG.connect(master);
  wind.start();cn.start();}
function setVol(v){save.set.vol=v;if(master)master.gain.value=v;}
function sfxWind(sp,m,steer){if(!AC||!windG)return;const t=AC.currentTime,k=Math.min(1,sp/900);
  windG.gain.setTargetAtTime(sp?(.05+.35*k)*(m==='air'?1.2:1):0,t,.15);windF.frequency.setTargetAtTime(250+900*k,t,.2);
  carveG.gain.setTargetAtTime(m==='ground'?.25*k*(steer||0)+.04*k:m==='rail'?.18:0,t,.08);}
function tone(f,dur,type,g,when,slide){const o=AC.createOscillator(),gg=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,when);if(slide)o.frequency.exponentialRampToValueAtTime(slide,when+dur);
  gg.gain.setValueAtTime(g,when);gg.gain.exponentialRampToValueAtTime(.001,when+dur);o.connect(gg);gg.connect(master);o.start(when);o.stop(when+dur+.02);}
function noiseHit(dur,f,g){const n=AC.sampleRate*dur,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n)**2;
  const s=AC.createBufferSource();s.buffer=b;const fl=AC.createBiquadFilter();fl.type='lowpass';fl.frequency.value=f;const gg=AC.createGain();gg.gain.value=g;s.connect(fl);fl.connect(gg);gg.connect(master);s.start();}
// shaped noise burst: band-passed, with attack/decay, optional filter sweep (snow crunch, spray, swoosh)
function snowNoise(when,dur,f1,f2,q,g,att){const n=Math.ceil(AC.sampleRate*dur),b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);let s=0;
  for(let i=0;i<n;i++){s=.6*s+.4*(Math.random()*2-1);const u=i/n,a=att?Math.min(1,u/att):1;d[i]=s*a*(1-u)**1.6*(Math.random()<.04?2.2:1);}  // grainy crackle
  const src=AC.createBufferSource();src.buffer=b;const fl=AC.createBiquadFilter();fl.type='bandpass';fl.Q.value=q;fl.frequency.setValueAtTime(f1,when);fl.frequency.exponentialRampToValueAtTime(f2,when+dur);
  const gg=AC.createGain();gg.gain.value=g;src.connect(fl);fl.connect(gg);gg.connect(master);src.start(when);}
function sfx(kind,k){if(!AC)return;const t=AC.currentTime;k=k||.5;
  // ski landing: body thump, both skis slapping the snow a few ms apart, then the packed-snow crunch and a short spray hiss
  if(kind==='land'){tone(70+20*k,.22,'sine',.35*k+.15,t,38);
    snowNoise(t,.05,2600,1800,1.2,.5*k+.2);snowNoise(t+.018,.05,2300,1600,1.2,.45*k+.18);
    snowNoise(t+.01,.32+.2*k,1400,520,.9,.55*k+.25,.05);snowNoise(t+.05,.45+.25*k,5200,2600,.7,.12+.12*k,.15);}
  // trick landed: airy whoosh into a bright two-note pluck (higher for bigger tricks)
  else if(kind==='trick'){const base=520+k*260;snowNoise(t,.22,600,3800,.8,.18,.6);
    [[base,0],[base*1.26,.06],[base*1.5,.12]].forEach(([f,d])=>{tone(f,.32,'sine',.13,t+.1+d);tone(f*2,.12,'triangle',.04,t+.1+d);});}
  else if(kind==='bail'){noiseHit(.5,500,.7);tone(140,.4,'sawtooth',.12,t,50);}
  else if(kind==='ui'){tone(1200,.05,'square',.05,t);}
  else if(kind==='buy'){[0,.08,.16].forEach((d,i)=>tone([880,1100,1320][i],.2,'triangle',.15,t+d));}}
