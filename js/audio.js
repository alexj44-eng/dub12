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
function sfx(kind,k){if(!AC)return;const t=AC.currentTime;k=k||.5;
  if(kind==='land'){tone(90,.25,'sine',.5*k+.2,t,40);noiseHit(.25,900,.4*k+.15);}
  else if(kind==='trick'){const base=660+k*220;tone(base,.18,'triangle',.18,t);tone(base*1.5,.28,'triangle',.16,t+.09);}
  else if(kind==='bail'){noiseHit(.5,500,.7);tone(140,.4,'sawtooth',.12,t,50);}
  else if(kind==='ui'){tone(1200,.05,'square',.05,t);}
  else if(kind==='buy'){[0,.08,.16].forEach((d,i)=>tone([880,1100,1320][i],.2,'triangle',.15,t+d));}}
