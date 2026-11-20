/* DUB12 — realistic rendering: sky, snow shading, post-processing, ski tracks */
'use strict';
renderer.outputEncoding=U.sRGBEncoding;
renderer.toneMapping=U.ACESFilmicToneMapping;
renderer.toneMappingExposure=.95;
renderer.setClearColor(0x000000,1);
const GLSL_NOISE=`
float hs1(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}
float hs2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hs2(i),hs2(i+vec2(1,0)),f.x),mix(hs2(i+vec2(0,1)),hs2(i+vec2(1,1)),f.x),f.y);}
float fbm2(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*vn2(p);p=p*2.03+vec2(17.1,9.2);a*=.5;}return s;}
`;

/* ---------- sky dome ---------- */
function parseSky(css){const st=[];css.replace(/(#[0-9a-f]{6})\s+(\d+)%/gi,(m,c,p)=>{st.push([new U.Color(c),+p/100]);return m;});
  while(st.length<4)st.push(st[st.length-1]);return st.slice(0,4);}
function makeSky(css,o){o=o||{};const st=parseSky(css);
  const mat=new U.ShaderMaterial({depthWrite:false,fog:false,toneMapped:false,side:U.BackSide,
    uniforms:{cs:{value:st.map(s=>s[0])},ps:{value:st.map(s=>s[1])},sunDir:{value:new U.Vector3(0,.5,.5).normalize()},sunCol:{value:new U.Color(1,.95,.85)},
      fogCol:{value:new U.Color(o.fog||0xffffff)},uNight:{value:o.night?1:0},uCloud:{value:o.cloud===undefined?.45:o.cloud},uTime:{value:0}},
    vertexShader:`varying vec3 vDir;void main(){vDir=position;vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position=p.xyww;}`,
    fragmentShader:GLSL_NOISE+`varying vec3 vDir;uniform vec3 cs[4];uniform float ps[4];uniform vec3 sunDir,sunCol,fogCol;uniform float uNight,uCloud,uTime;
    void main(){vec3 d=normalize(vDir);float e=d.y;
      float t=1.-smoothstep(-.03,.62,e);t=pow(t,1.35);
      vec3 col=cs[0];for(int i=0;i<3;i++){float a=ps[i],b=ps[i+1];if(t>=a)col=mix(cs[i],cs[i+1],clamp((t-a)/max(b-a,.001),0.,1.));}
      float sd=max(dot(d,normalize(sunDir)),0.);
      col+=sunCol*(pow(sd,900.)*14.+pow(sd,40.)*.22+pow(sd,6.)*.12)*(1.-uNight*.75);
      if(e>0.){vec2 uv=d.xz/(e+.09)*.55+vec2(uTime*.006,uTime*.002);
        float n=fbm2(uv*1.6)*.75+fbm2(uv*5.3)*.25;float cov=smoothstep(1.-uCloud,1.-uCloud+.32,n)*smoothstep(0.,.18,e);
        float lit=.62+.38*pow(sd,3.)+.2*(1.-n);vec3 cc=mix(cs[3]*.85,vec3(1.),.55)*lit;cc=mix(cc,cs[1]*.6,uNight*.8);
        col=mix(col,cc,cov*.82);
        if(uNight>0.){vec3 sc=floor(d*520.);float s=hs1(sc);float tw=.6+.4*sin(uTime*3.+s*80.);col+=step(.9982,s)*uNight*tw*(1.-cov)*vec3(.9,.95,1.)*smoothstep(.05,.3,e);}}
      col=mix(col,fogCol,(1.-smoothstep(-.02,.16,e))*.55);
      if(e<0.)col=mix(col,fogCol,smoothstep(0.,-.12,e));
      gl_FragColor=vec4(col,1.);
      #include <encodings_fragment>
    }`});
  const m=new U.Mesh(new U.SphereGeometry(1000,48,24),mat);m.frustumCulled=false;m.renderOrder=-10;
  m.onBeforeRender=(r,s,c)=>{m.position.copy(c.position);m.updateMatrixWorld();};
  m.userData.setSun=(dir,col)=>{mat.uniforms.sunDir.value.copy(dir);if(col)mat.uniforms.sunCol.value.copy(col);};
  return m;}
let runSky=null,lobbySky=null;
function setRunSky(C,sunDirV,sunColHex){if(runSky)scene.remove(runSky);
  runSky=makeSky(C.sky,{fog:C.fog,night:C.night,cloud:C.night?.25:C.ice?.3:.5});runSky.userData.setSun(sunDirV,new U.Color(sunColHex));scene.add(runSky);}

/* ---------- snow ---------- */
const SNOWC={};
function snowTextures(kind){if(SNOWC[kind])return SNOWC[kind];const N=512,r=rng(kind.length*91+7);
  // height field: groomed corduroy or wind-sculpted powder
  const hgt=new Float32Array(N*N),lat=[];for(let i=0;i<64;i++)lat.push(r());
  const vnoise=(x,y,f,o)=>{x=x*f/N;y=y*f/N;const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,s=t=>t*t*(3-2*t),m=f|0;
    const H=(a,b)=>{a=((a%m)+m)%m;b=((b%m)+m)%m;let h=(a*374761393+b*668265263+o*1442695041)|0;h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967296;};
    return H(xi,yi)+(H(xi+1,yi)-H(xi,yi))*s(xf)+(H(xi,yi+1)-H(xi,yi))*s(yf)+(H(xi,yi)-H(xi+1,yi)-H(xi,yi+1)+H(xi+1,yi+1))*s(xf)*s(yf);};
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){let h;
    if(kind==='cord'){const ph=(x/N)*22*Math.PI*2+vnoise(x,y,8,3)*1.2;h=Math.pow(.5+.5*Math.sin(ph),.6)*.55+vnoise(x,y,64,1)*.25+vnoise(x,y,16,2)*.2;}
    else{const w=Math.sin((y/N)*20*Math.PI*2+vnoise(x,y,4,5)*7)*.18;h=vnoise(x,y,8,1)*.45+vnoise(x,y,32,2)*.22+vnoise(x,y,128,4)*.12+w;}
    hgt[y*N+x]=h;}
  const nc=document.createElement('canvas');nc.width=nc.height=N;const ng=nc.getContext('2d'),ni=ng.createImageData(N,N),str=kind==='cord'?5.2:2.4;
  const cc=document.createElement('canvas');cc.width=cc.height=N;const cg=cc.getContext('2d'),ci=cg.createImageData(N,N);
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=y*N+x,hx=hgt[y*N+((x+1)%N)]-hgt[y*N+((x-1+N)%N)],hy=hgt[((y+1)%N)*N+x]-hgt[((y-1+N)%N)*N+x];
    let nx=-hx*str,ny=-hy*str,nz=1;const l=Math.hypot(nx,ny,nz);nx/=l;ny/=l;nz/=l;
    ni.data[i*4]=(nx*.5+.5)*255;ni.data[i*4+1]=(ny*.5+.5)*255;ni.data[i*4+2]=(nz*.5+.5)*255;ni.data[i*4+3]=255;
    const v=kind==='cord'?232+hgt[i]*26-r()*4:246+hgt[i]*9-r()*5;ci.data[i*4]=v-4;ci.data[i*4+1]=v-1;ci.data[i*4+2]=Math.min(255,v+6);ci.data[i*4+3]=255;}
  ng.putImageData(ni,0,0);cg.putImageData(ci,0,0);
  const nt=new U.CanvasTexture(nc),ct=new U.CanvasTexture(cc);[nt,ct].forEach(t=>{t.wrapS=t.wrapT=U.RepeatWrapping;t.anisotropy=renderer.capabilities.getMaxAnisotropy();});
  nt.encoding=U.LinearEncoding;return SNOWC[kind]={n:nt,c:ct};}
function snowMaterial(kind,o){o=o||{};const T=snowTextures(kind==='cord'?'cord':'pow');
  const m=new U.MeshStandardMaterial({map:T.c,normalMap:T.n,normalScale:new U.Vector2(.68,.68),vertexColors:!!o.vc,roughness:kind==='cord'?.68:.86,metalness:0,envMapIntensity:.72});
  m.onBeforeCompile=sh=>{sh.uniforms.uGlint={value:o.glint===undefined?1:o.glint};
    sh.vertexShader='varying vec3 vWP;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvWP=(modelMatrix*vec4(transformed,1.0)).xyz;');
    sh.fragmentShader='varying vec3 vWP;uniform float uGlint;\n'+GLSL_NOISE+sh.fragmentShader
      .replace('#include <map_fragment>','#include <map_fragment>\n float mac=fbm2(vWP.xz*.0016);diffuseColor.rgb*=.9+.1*mac;diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.9,.95,1.05),smoothstep(.45,.75,fbm2(vWP.xz*.0007+3.)));')
      .replace('#include <tonemapping_fragment>','{vec3 V=normalize(cameraPosition-vWP);float dd=length(cameraPosition-vWP);float s=hs1(floor(vWP*1.4)+floor(V*22.));\n gl_FragColor.rgb+=step(.9962,s)*smoothstep(700.,60.,dd)*uGlint*vec3(1.5,1.55,1.7);}\n#include <tonemapping_fragment>');};
  m.customProgramCacheKey=()=>'snow'+kind;return m;}

/* ---------- post-processing ---------- */
let comp=null,rPass=null,bloom=null,grade=null,sao=null,compAO=-1,compOK=!!(U.EffectComposer&&U.UnrealBloomPass);
const GradeShader={uniforms:{tDiffuse:{value:null},uTime:{value:0},uVig:{value:.55},uGrain:{value:.018},uSat:{value:1.08},uWarm:{value:new U.Vector3(1.0,1.0,1.0)}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`uniform sampler2D tDiffuse;uniform float uTime,uVig,uGrain,uSat;uniform vec3 uWarm;varying vec2 vUv;
    float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
    void main(){vec3 c=texture2D(tDiffuse,vUv).rgb;float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,uSat)*uWarm;
      vec2 q=vUv-.5;c*=1.-dot(q,q)*uVig;vec4 o=linearToOutputTexel(vec4(max(c,0.),1.));o.rgb+=(h(vUv*977.+fract(uTime)*61.)-.5)*uGrain;gl_FragColor=o;}`};
function fxOn(){return compOK&&save.set.fx!==0;}
function buildComposer(){if(!compOK)return;
  const pr=renderer.getPixelRatio(),w=Math.max(1,W*pr|0),h=Math.max(1,H*pr|0),gl2=renderer.capabilities.isWebGL2;
  const opt={type:U.HalfFloatType,format:U.RGBAFormat,encoding:U.LinearEncoding};
  const rt=gl2&&U.WebGLMultisampleRenderTarget?new U.WebGLMultisampleRenderTarget(w,h,opt):new U.WebGLRenderTarget(w,h,opt);
  comp=new U.EffectComposer(renderer,rt);rPass=new U.RenderPass(scene,cam);comp.addPass(rPass);  bloom=new U.UnrealBloomPass(new U.Vector2(w,h),.32,.55,.86);comp.addPass(bloom);
  grade=new U.ShaderPass(GradeShader);grade.renderToScreen=true;comp.addPass(grade);comp.setPixelRatio(1);comp.setSize(w,h);}
let compW=0,compH=0,compPR=0;
function present(sc,camera,dt){
  if(!fxOn()){renderer.render(sc,camera);return;}
  // build the composer once; window resizes and auto-quality steps only resize its buffers (rebuilding leaked the bloom targets)
  const pr=renderer.getPixelRatio();
  if(!comp||compAO!==save.set.ao){compW=W;compH=H;compPR=pr;compAO=save.set.ao;if(comp){comp.renderTarget1.dispose();comp.renderTarget2.dispose();if(bloom&&bloom.dispose)bloom.dispose();}buildComposer();}
  else if(compW!==W||compH!==H||compPR!==pr){compW=W;compH=H;compPR=pr;const w=Math.max(1,W*pr|0),h=Math.max(1,H*pr|0);comp.setSize(w,h);}
  rPass.scene=sc;rPass.camera=camera;if(sao){sao.scene=sc;sao.camera=camera;}grade.uniforms.uTime.value+=dt||.016;
  const night=sc===scene&&map&&MAPS[map.id]&&(MAPS[map.id].night||(save.set.tod==='night'));
  bloom.strength=night?.5:.16;bloom.threshold=night?.72:.94;bloom.enabled=!!night||sc!==scene;   // daytime bloom was nearly invisible but cost ~10 full-screen passes
  comp.render(dt);}

/* ---------- ski tracks ---------- */
const TQ=2400,trPos=new Float32Array(TQ*4*3).fill(-1e6),trIdx=new Uint32Array(TQ*6),trNrm=new Float32Array(TQ*4*3);let trI=0;
for(let q=0;q<TQ;q++){const v=q*4;trIdx.set([v,v+2,v+1,v+1,v+2,v+3],q*6);for(let k=0;k<4;k++)trNrm[(v+k)*3+1]=1;}
const trGeo=new U.BufferGeometry();trGeo.setAttribute('position',new U.BufferAttribute(trPos,3));trGeo.setAttribute('normal',new U.BufferAttribute(trNrm,3));trGeo.setIndex(new U.BufferAttribute(trIdx,1));
const trMesh=new U.Mesh(trGeo,new U.MeshStandardMaterial({color:0xaebfd8,roughness:.95,transparent:true,opacity:.5,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4}));
trMesh.frustumCulled=false;trMesh.renderOrder=1;scene.add(trMesh);
function clearTracks(){trPos.fill(-1e6);trGeo.attributes.position.needsUpdate=true;trI=0;}
function trackStep(r){if(r.mode!=='ground'||r.crashT>0){r._tr=null;return;}
  const yaw=bodyYaw(r),fx=Math.sin(yaw),fz=Math.cos(yaw),lx=fz,lz=-fx;
  const board=r.sk.ride==='board';   // snowboard: one wide track down the middle; skis: two narrow ones
  const cur=(board?[0]:[-1,1]).map(sd=>{const ox=r.x+lx*sd*5*r.sk.hs,oz=r.z+lz*sd*5*r.sk.hs;return [ox,oz];});
  if(!r._tr||r._tr.length!==cur.length){r._tr=cur;r._tr.cx=r.x;r._tr.cz=r.z;return;}const dx=r.x-r._tr.cx,dz=r.z-r._tr.cz;if(dx*dx+dz*dz<36)return;
  const w=board?6.4+Math.abs(r.steer)*2:2.2+Math.abs(r.steer)*1.6;
  for(let s=0;s<cur.length;s++){const a=r._tr[s],b=cur[s];if(!a)continue;const q=(trI++%TQ),o=q*12;
    const sx=lx*w,sz=lz*w;const pts=[[a[0]-sx,a[1]-sz],[a[0]+sx,a[1]+sz],[b[0]-sx,b[1]-sz],[b[0]+sx,b[1]+sz]];
    pts.forEach((p,k)=>{trPos[o+k*3]=p[0];trPos[o+k*3+1]=hAt(p[0],p[1])+.35;trPos[o+k*3+2]=p[1];});}
  r._tr=cur;r._tr.cx=r.x;r._tr.cz=r.z;trGeo.attributes.position.needsUpdate=true;}
function fxRun(dt){for(const r of riders)trackStep(r);if(runSky)runSky.material.uniforms.uTime.value+=dt;if(lobbySky)lobbySky.material.uniforms.uTime.value+=dt;}
