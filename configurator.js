(function(){
const $=s=>document.querySelector(s);
const fmt=(n,d=1)=>(Math.round(n*10**d)/10**d).toFixed(d).replace('.',',');
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const sstep=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
const lerp=(a,b,t)=>a+(b-a)*t;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ================= data ================= */
const ZC=-1;               // hart van het lichaam (cm, diepte)
const W_C=64,H_C=84,Y0=2;  // tekenvlak per kledingdeel in cm
const MODELS={
  tshirt:{id:'tshirt',name:'T-shirt',a:21.5,df:13,db:11.5,len:72,nx:8.3,nz:6.3,dropF:8,dropB:2,sy:-3.4,under:-23,collar:'crew',
    sleeve:{len:21,under:9,angle:56,rzArm:7,cuffRY:6.5,cuffRZ:6,rib:0,hem:2.2}},
  polo:{id:'polo',name:'Polo',a:22,df:13.2,db:11.8,len:74,nx:8.2,nz:6.4,dropF:3.5,dropB:1.2,sy:-3.4,under:-23.5,collar:'polo',
    sleeve:{len:22,under:10,angle:55,rzArm:7.1,cuffRY:6.5,cuffRZ:6,rib:2.6,ribF:.97}},
  hoodie:{id:'hoodie',name:'Hoodie',a:24,df:14.5,db:13,len:68,nx:9.5,nz:7.2,dropF:8.5,dropB:2.2,sy:-4.4,under:-26,collar:'hood',waistRib:7,pocket:true,long:true,
    sleeve:{len:62,under:44,angle:17,rzArm:6.6,cuffRY:5.2,cuffRZ:4.9,rib:7,ribF:.72,bulge:1.05}},
  qzip:{id:'qzip',name:'Quarter zip',a:22.5,df:13.5,db:12,len:70,nx:8.6,nz:6.6,dropF:4.5,dropB:1.5,sy:-3.7,under:-24.5,collar:'zip',waistRib:6,long:true,
    sleeve:{len:61,under:44,angle:16,rzArm:6.2,cuffRY:4.9,cuffRZ:4.6,rib:6,ribF:.76,bulge:1.035}},
  longsleeve:{id:'longsleeve',name:'Longsleeve',a:21.5,df:13,db:11.5,len:72,nx:8.3,nz:6.3,dropF:8,dropB:2,sy:-3.4,under:-23,collar:'crew',long:true,
    sleeve:{len:62,under:46,angle:12,rzArm:5.8,cuffRY:4.5,cuffRZ:4.1,rib:3,ribF:.88}},
  sweater:{id:'sweater',name:'Sweater',a:22.5,df:13.5,db:12,len:69,nx:8.6,nz:6.5,dropF:7.5,dropB:2,sy:-3.7,under:-24.5,collar:'crew',waistRib:6,long:true,
    sleeve:{len:61,under:44,angle:16,rzArm:6.3,cuffRY:4.9,cuffRZ:4.6,rib:6,ribF:.76,bulge:1.04}},
  softshell:{id:'softshell',name:'Softshell jas',a:23,df:14,db:12.5,len:73,nx:9,nz:7,dropF:4.5,dropB:1.5,sy:-4,under:-25,collar:'zip',fullZip:true,long:true,shiny:.6,
    sleeve:{len:63,under:45,angle:15,rzArm:6.6,cuffRY:5.2,cuffRZ:4.8,rib:0,hem:2.5}},
  bodywarmer:{id:'bodywarmer',name:'Bodywarmer',a:22.5,df:14.5,db:13,len:70,nx:9,nz:7,dropF:4.5,dropB:1.5,sy:-3.6,under:-23,collar:'zip',fullZip:true,sleeveless:true,quilted:true,shiny:.5},
  sportshirt:{id:'sportshirt',name:'Sportshirt',a:21,df:12.5,db:11,len:72,nx:8,nz:6.2,dropF:11,dropB:2,sy:-3.4,under:-22.5,collar:'crew',vneck:true,shiny:.62,
    sleeve:{len:20,under:8.5,angle:52,rzArm:6.6,cuffRY:6.1,cuffRZ:5.6,rib:0,hem:2}},
  short:{id:'short',name:'Short',kind:'short',a:23,df:11.5,db:13.5,rise:26,len:50,shiny:.62}
};
const COLORS=[
  {id:'wit',name:'Wit',hex:'#f1f1ee'},{id:'zwart',name:'Zwart',hex:'#1d1e22'},{id:'navy',name:'Navy',hex:'#1f2a44'},
  {id:'royal',name:'Royal blauw',hex:'#2451b4'},{id:'rood',name:'Rood',hex:'#bf2530'},{id:'bordeaux',name:'Bordeaux',hex:'#66202e'},
  {id:'groen',name:'Flessengroen',hex:'#1e4c36'},{id:'melange',name:'Grijs melange',hex:'#a3a5a9',melange:true},{id:'antraciet',name:'Antraciet',hex:'#3b3e44'}
];
const FONTS={
  oswald:{name:'Oswald',fam:'"Oswald"',w:600},archivo:{name:'Archivo Black',fam:'"Archivo Black"',w:400},
  graduate:{name:'Graduate (varsity)',fam:'"Graduate"',w:400},slab:{name:'Roboto Slab',fam:'"Roboto Slab"',w:700},bebas:{name:'Bebas Neue',fam:'"Bebas Neue"',w:400}
};
const fontSpec=(id,px)=>`${FONTS[id].w} ${px}px ${FONTS[id].fam}, "Arial Black", sans-serif`;
const TECH={
  advies:{name:'Laat ons adviseren',hint:'Wij kiezen de beste techniek voor uw logo, stof en aantal. Dit is voor de meeste klanten de beste keuze.'},
  dtf:{name:'DTF-transfer',hint:'Full colour en ook geschikt voor kleine oplages, foto’s en kleurverlopen.'},
  zeef:{name:'Zeefdruk',hint:'Voordelig bij grotere aantallen. De prijs hangt af van het aantal drukkleuren.'},
  flex:{name:'Flex of flock',hint:'Strak en stevig, ideaal voor namen, nummers en eenvoudige logo’s in één kleur.'},
  subli:{name:'Sublimatie',hint:'De print zit ín de stof. Alleen mogelijk op witte of lichte polyester sportkleding.'},
  bord:{name:'Borduren',hint:'Op aanvraag.',hidden:true}
};
const SIZEPRE=z=>M().kind==='short'?(z.startsWith('sleeve')?[6,9,12]:[6,10,20]):z.startsWith('sleeve')?[5,7,9]:[7,11,26];
const ZONES={front:'Voorkant',back:'Achterkant',sleeveL:'Linkermouw',sleeveR:'Rechtermouw'};
const zoneName=z=>M().kind==='short'?({front:'Voorkant',back:'Achterkant',sleeveL:'Linkerpijp',sleeveR:'Rechterpijp'})[z]:ZONES[z];
const ZONE_IDS=['front','back','sleeveL','sleeveR'];
const pv=(v,m)=>typeof v==='function'?v(m):v;
const PRESETS=[
  {id:'chestL',label:'Linkerborst',zone:'front',x:10,y:m=>m.id==='hoodie'?23:20,w:9},
  {id:'chestR',label:'Rechterborst',zone:'front',x:-10,y:m=>m.id==='hoodie'?23:20,w:9},
  {id:'chestC',label:'Borst midden',zone:'front',x:0,y:m=>m.id==='hoodie'?26:24,w:22,not:['polo','qzip','softshell','bodywarmer']},
  {id:'frontBig',label:'Groot voor',zone:'front',x:0,y:m=>m.id==='hoodie'?28:31,w:m=>m.id==='hoodie'?26:28,not:['polo','qzip','softshell','bodywarmer']},
  {id:'neck',label:'Nek',zone:'back',x:0,y:7,w:8,not:['hoodie']},
  {id:'backName',label:'Naam rug',zone:'back',x:0,y:m=>m.id==='hoodie'?22:13,w:24},
  {id:'backBig',label:'Rug groot',zone:'back',x:0,y:m=>m.id==='hoodie'?36:30,w:28},
  {id:'sleeveL',label:'Linkermouw',zone:'sleeveL',x:0,y:m=>m.long?9:6.5,w:7,not:['bodywarmer']},
  {id:'sleeveR',label:'Rechtermouw',zone:'sleeveR',x:0,y:m=>m.long?9:6.5,w:7,not:['bodywarmer']}
];
const PRESETS_SHORT=[
  {id:'hipL',label:'Heup links',zone:'front',x:12,y:9,w:7},
  {id:'hipR',label:'Heup rechts',zone:'front',x:-12,y:9,w:7},
  {id:'backC',label:'Achter midden',zone:'back',x:0,y:8,w:10},
  {id:'legL',label:'Linkerpijp',zone:'sleeveL',x:0,y:36,w:8},
  {id:'legR',label:'Rechterpijp',zone:'sleeveR',x:0,y:36,w:8}
];
const presetsFor=m=>m.kind==='short'?PRESETS_SHORT:PRESETS.filter(p=>!(p.not||[]).includes(m.id));
const allPresets=()=>PRESETS.concat(PRESETS_SHORT);
function areaFor(zone){const m=M();
  if(m.kind==='short')return zone==='front'?{w:44,h:14,top:4}:zone==='back'?{w:36,h:14,top:4}:{w:12,h:16,top:28};
  if(zone==='front')return m.id==='hoodie'?{w:30,h:28,top:14}:{w:30,h:40,top:12};
  if(zone==='back')return m.id==='hoodie'?{w:30,h:36,top:18}:{w:30,h:42,top:6};
  return m.long?{w:10,h:40,top:3}:{w:9,h:9,top:2};
}
const SIZES=['XS','S','M','L','XL','XXL','3XL'];
const state={model:'polo',color:'navy',layers:[],sel:null,guides:true,qty:{XS:0,S:0,M:0,L:0,XL:0,XXL:0,'3XL':0},sample:true,team:{on:false,players:[],cur:0}};
const effText=l=>{if(!l.player)return l.text||'';const p=state.team.players[state.team.cur]||{};return l.player==='naam'?String(p.naam||'NAAM').toUpperCase():String(p.nummer||'10')};
let nextId=1;
const M=()=>MODELS[state.model];
const cur=()=>state.layers.find(l=>l.id===state.sel)||null;
const colorObj=()=>COLORS.find(c=>c.id===state.color);
function lum(hex){const n=parseInt(hex.slice(1),16);return (.2126*(n>>16&255)+.7152*(n>>8&255)+.0722*(n&255))/255}
function shade(hex,f){const n=parseInt(hex.slice(1),16);const c=[n>>16&255,n>>8&255,n&255].map(v=>Math.round(clamp(f<0?v*(1+f):v+(255-v)*f,0,255)));return '#'+c.map(v=>v.toString(16).padStart(2,'0')).join('')}
const lin=hex=>new THREE.Color(hex).convertSRGBToLinear();
let toastT;function toast(msg,act){const t=$('#toast');t.textContent=msg;if(act){const b=document.createElement('button');b.textContent=act.label;b.className='toast-act';b.onclick=()=>{t.hidden=true;act.fn()};t.appendChild(b)}t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,act?6000:3200)}
const RENDER_MODE=!!new URLSearchParams(location.search).get('render');let curStep=1;

/* ================= renderer ================= */
const viewEl=$('#view');
let R=null;try{R=new THREE.WebGLRenderer({antialias:true,alpha:true})}catch(e){}
const loadingEl=document.getElementById('loading');if(loadingEl)loadingEl.remove();
if(!R){viewEl.innerHTML='<div class="nogl">Dit apparaat ondersteunt geen 3D-weergave (WebGL). Probeer een recente versie van Chrome, Edge, Safari of Firefox.</div>';return}
R.setPixelRatio(Math.min(devicePixelRatio||1,2));
R.outputEncoding=THREE.sRGBEncoding;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=.98;
R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
R.setClearColor(0x000000,0);viewEl.appendChild(R.domElement);
const scene=new THREE.Scene();
const pmrem=new THREE.PMREMGenerator(R);
scene.environment=pmrem.fromScene(new THREE.RoomEnvironment(),.04).texture;
const camera=new THREE.PerspectiveCamera(30,1,.05,60);
const controls=new THREE.OrbitControls(camera,R.domElement);
Object.assign(controls,{enableDamping:true,dampingFactor:.08,enablePan:false,minDistance:1.4,maxDistance:9,rotateSpeed:.7,minPolarAngle:.35,maxPolarAngle:2.3});
scene.add(new THREE.HemisphereLight(0xffffff,0x8a90a0,.25));
const key=new THREE.DirectionalLight(0xffffff,1.15);key.position.set(1.6,2.6,3.2);key.castShadow=true;
Object.assign(key.shadow.camera,{left:-1.4,right:1.4,top:1.4,bottom:-1.4,near:.5,far:9});key.shadow.mapSize.set(2048,2048);key.shadow.bias=-.0004;key.shadow.normalBias=.012;key.shadow.radius=4;
scene.add(key);
const rim=new THREE.DirectionalLight(0xffffff,.45);rim.position.set(-1.5,2,-3);scene.add(rim);

const big=R.capabilities.maxTextureSize>=4096&&Math.min(innerWidth,innerHeight)>500&&!/Mobi/i.test(navigator.userAgent);
const PPC=big?24:14, CW=W_C*PPC, CH=H_C*PPC;
const aniso=Math.min(8,R.capabilities.getMaxAnisotropy());
function makeTex(c,srgb=true){const t=new THREE.CanvasTexture(c);if(srgb)t.encoding=THREE.sRGBEncoding;t.anisotropy=aniso;return t}
function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}

/* ================= garment surface maths (cm, y=0 at HPS) ================= */
function topY(m,ax,back){
  const sx=m.a-1;
  if(ax<=m.nx)return (!back&&m.vneck)?-m.dropF*(1-ax/m.nx):-(back?m.dropB:m.dropF)*Math.sqrt(Math.max(0,1-(ax/m.nx)**2));
  const u=(ax-m.nx)/(sx-m.nx);let y=u<=1?m.sy*Math.pow(u,1.12):m.sy*(1+1.12*(u-1));
  const x0=m.nx+.45*(sx-m.nx);
  if(m.sleeveless){if(ax>m.a-3)y-=2.5*Math.pow((ax-(m.a-3))/3,2)}else if(ax>x0+1.5)y-=9*Math.pow((ax-x0-1.5)/(m.a-x0-1.5),2);
  return y;
}
const topDepth=(m,ax)=>ax<m.nx?m.nz*Math.sqrt(1-(ax/m.nx)**2):0;
function widthF(m,y){if(!m.waistRib)return 1;const yr=-(m.len-m.waistRib);return 1-.085*sstep(yr+2.5,yr-.5,y)+.012*Math.exp(-(((y-yr-4)/3)**2))}
const supS=(m,ax)=>Math.pow(Math.max(0,1-Math.pow(Math.min(1,ax/m.a),2.3)),1/2.3);
function pocketF(m,x,y){ // 0..1 binnen buidelzak (y negatief, cm)
  if(!m.pocket)return 0;const yy=-y,top=44,bot=m.len-m.waistRib;if(yy<top-1.5||yy>bot+1)return 0;
  const hw=yy<top+12?lerp(11,15.5,(yy-top)/12):15.5;
  return sstep(top-.2,top+1.2,yy)*sstep(-.3,1.2,hw-Math.abs(x))*sstep(bot+.4,bot-.6,yy);
}
function drapeN(x,y,ph){return .22*Math.sin(x*.31+ph[0])*Math.sin(y*.17+ph[1])+.12*Math.sin(x*.71+y*.23+ph[2])+.3*Math.sin(x*.42+ph[2])*sstep(-40,-70,y)}
function panelDepth(m,x,y,back,ph){
  const ax=Math.abs(x),yt=topY(m,ax,back),dt=topDepth(m,ax),capH=9;
  const s=clamp((y-(yt-capH))/capH,0,1),S=supS(m,ax);
  let D=(back?m.db:m.df)*S*(1-.35*sstep(-26,0,y))*widthF(m,y);
  if(ph)D+=drapeN(x,y,ph)*S*(1-s);
  if(ph&&m.quilted)D+=.75*Math.pow(Math.abs(Math.sin(Math.PI*(-y-7)/9)),.55)*S*(1-s)*sstep(-m.len+.5,-m.len+3,y);
  if(!back&&m.pocket)D+=.5*pocketF(m,x,y);
  const wn=1-sstep(m.nx-1.5,m.nx+2,ax);
  const f=(1-Math.pow(s,1.7))*wn+Math.pow(1-Math.pow(s,2.2),1/2.2)*(1-wn);
  return dt+(D-dt)*f;
}
function surf(m,x,y,back){return new THREE.Vector3(x*widthF(m,y),y,ZC+(back?-1:1)*panelDepth(m,x,y,back))}
function pushOut(m,p,margin){
  const x=p.x/widthF(m,p.y),ax=Math.abs(x);if(ax>=m.a||p.y<-m.len)return p;
  const back=p.z<ZC,yt=topY(m,ax,back);if(p.y>yt)return p;
  const d=panelDepth(m,x,p.y,back);if(Math.abs(p.z-ZC)<d+margin)p.z=ZC+(back?-1:1)*(d+margin);return p;
}
function neckPt(m,phi){const c=Math.cos(phi),sn=Math.sin(phi);return new THREE.Vector3(m.nx*sn,c>=0?(m.vneck?-m.dropF*(1-Math.abs(sn)):-m.dropF*c):m.dropB*c,ZC+m.nz*c)}
function neckOut(m,phi){return new THREE.Vector3(Math.sin(phi)/m.nx,0,Math.cos(phi)/m.nz).normalize()}

/* generic grid geometry */
function gridGeo(C,Rw,pos,uv,col,flipTest){
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
  if(col)g.setAttribute('color',new THREE.BufferAttribute(col,3));
  const ind=[];for(let j=0;j<Rw;j++)for(let i=0;i<C;i++){const a=j*(C+1)+i,b=a+C+1;ind.push(a,b,a+1,b,b+1,a+1)}
  if(flipTest){const [ci,cj,out]=flipTest;const t=(cj*C+ci)*6;const P=k=>new THREE.Vector3(pos[ind[t+k]*3],pos[ind[t+k]*3+1],pos[ind[t+k]*3+2]);
    const A=P(0),B=P(1),Cc=P(2);if(B.clone().sub(A).cross(Cc.clone().sub(A)).dot(out)<0)for(let k=0;k<ind.length;k+=3){const s=ind[k+1];ind[k+1]=ind[k+2];ind[k+2]=s}}
  g.setIndex(ind);g.computeVertexNormals();return g;
}

/* ---- front / back panel ---- */
function buildPanel(m,back){
  const C=136,Rw=176,sg=back?-1:1,ph=back?[1.3,2.1,.4]:[.2,.9,2.6];
  const n=(C+1)*(Rw+1),pos=new Float32Array(n*3),uv=new Float32Array(n*2),col=new Float32Array(n*3);
  const xs=[];for(let i=0;i<=C;i++)xs.push(m.a*Math.sin((i/C*2-1)*Math.PI/2));
  const P=new Array(n);
  for(let j=0;j<=Rw;j++){const t=j/Rw;for(let i=0;i<=C;i++){const x=xs[i],ax=Math.abs(x),yt=topY(m,ax,back),y=yt+(-m.len-yt)*t;
    const w=widthF(m,y),p=new THREE.Vector3(x*w,y,ZC+sg*panelDepth(m,x,y,back,ph));const k=j*(C+1)+i;P[k]=p;pos.set([p.x,p.y,p.z],k*3);
    let ao=1;
    ao*=1-.15*Math.exp(-(((ax-m.a)/3.2)**2))*sstep(m.under-7,m.under,y)*(1-sstep(m.sy-2,m.sy+2,y));
    ao*=1-.42*Math.exp(-(((ax-m.a)/2.4)**2))*Math.exp(-(((y-m.under)/3)**2));
    if(m.sleeveless)ao*=1-.45*Math.exp(-(((ax-m.a)/1.6)**2))*sstep(m.under-1,m.under+2,y)*(1-sstep(m.sy-4,m.sy,y));
    if(ax<m.nx+2.5)ao*=1-.22*Math.exp(-(yt-y)/2.2)*(1-sstep(m.nx,m.nx+2.5,ax));
    if(m.collar==='hood')ao*=1-(back?.32:.12)*sstep(back?-20:-9,back?-11:-2,y)*(1-sstep(10,17,ax));
    if(!back&&m.pocket){const pf=pocketF(m,x,y);ao*=1-.12*pf*Math.exp(-(((-y-44)/1.5)**2))}
    ao*=1-.1*sstep(-m.len+1.2,-m.len,y);
    col.set([ao,ao,ao],k*3);
  }}
  const mid=C/2;
  for(let j=0;j<=Rw;j++){let s=0;for(const dir of [1,-1]){s=0;for(let i=mid;dir>0?i<=C:i>=0;i+=dir){const k=j*(C+1)+i;if(i!==mid)s+=P[k].distanceTo(P[k-dir]);
    const sgn=(back?-dir:dir);const u=.5+sgn*s/W_C;uv[k*2]=u;uv[k*2+1]=1-(Y0-P[k].y)/H_C}}}
  return gridGeo(C,Rw,pos,uv,col,[C/2,Rw/2,new THREE.Vector3(0,0,sg)]);
}

/* ---- sleeve ---- */
function bez(P0,P1,P2,t){const u=1-t;return new THREE.Vector3().addScaledVector(P0,u*u).addScaledVector(P1,2*u*t).addScaledVector(P2,t*t)}
function bezT(P0,P1,P2,t){return new THREE.Vector3().addScaledVector(P1.clone().sub(P0),2*(1-t)).addScaledVector(P2.clone().sub(P1),2*t).normalize()}
function resample(P0,P1,P2,n){
  const F=400,fine=[],cum=[0];for(let i=0;i<=F;i++)fine.push(bez(P0,P1,P2,i/F));for(let i=1;i<=F;i++)cum.push(cum[i-1]+fine[i].distanceTo(fine[i-1]));
  const L=cum[F],out=[];let j=0;for(let k=0;k<=n;k++){const s=k/n*L;while(j<F-1&&cum[j+1]<s)j++;const f=(s-cum[j])/((cum[j+1]-cum[j])||1);out.push(fine[j].clone().lerp(fine[j+1],f))}
  return{pts:out,L};
}
function resamplePoly(pts,n){
  const cum=[0];for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+pts[i].distanceTo(pts[i-1]));
  const L=cum[cum.length-1],out=[];let j=0;for(let k=0;k<=n;k++){const s=k/n*L;while(j<pts.length-2&&cum[j+1]<s)j++;const f=(s-cum[j])/((cum[j+1]-cum[j])||1);out.push(pts[j].clone().lerp(pts[j+1],f))}
  return{pts:out,L};
}
function buildSleeve(m,side){
  const sl=m.sleeve,sgn=side,sx=m.a-1,x0=m.nx+.45*(sx-m.nx);
  const T0=new THREE.Vector3(sgn*x0,topY(m,x0,false)-.35,ZC);
  const A=new THREE.Vector3(sgn*sx,m.sy-.35,ZC);
  const tan=A.clone().sub(T0).normalize();
  const al=sl.angle*Math.PI/180,d=new THREE.Vector3(sgn*Math.sin(al),-Math.cos(al),0),n=new THREE.Vector3(sgn*Math.cos(al),Math.sin(al),0);
  // onderkant: oksel -> mouwzoom, evenwijdig aan de hangrichting; bovenkant: schouder -> ronde kop -> mouwzoom
  const Bu=new THREE.Vector3(sgn*(m.a-.8),m.under,ZC),B2=Bu.clone().addScaledVector(d,sl.under),T2=B2.clone().addScaledVector(n,2*sl.cuffRY);
  const B0=new THREE.Vector3(sgn*(m.a-4),m.under+1.5,ZC),B1=Bu;
  const dt=T2.clone().sub(A).normalize();
  const rc=m.long?6:4.5,perp=dt.clone().sub(tan.clone().multiplyScalar(dt.dot(tan))).normalize(),turn=Math.acos(clamp(tan.dot(dt),-1,1));
  const sgnT=Math.sign(tan.x*dt.y-tan.y*dt.x)||1,Cc=A.clone().addScaledVector(perp,rc),v0=A.clone().sub(Cc);
  const line=[];for(let i=0;i<=20;i++)line.push(T0.clone().lerp(A,i/20));
  for(let i=1;i<=30;i++){const a=sgnT*turn*i/30,c=Math.cos(a),s=Math.sin(a);line.push(new THREE.Vector3(Cc.x+v0.x*c-v0.y*s,Cc.y+v0.x*s+v0.y*c,ZC))}
  const E=line[line.length-1];for(let i=1;i<=40;i++)line.push(E.clone().lerp(T2,i/40));
  const K=m.long?150:100,N=72,top=resamplePoly(line,K),bot=resample(B0,B1,B2,K);
  const depthAt=(x,y)=>{const xc=Math.min(Math.abs(x),m.a-4);return Math.min(panelDepth(m,xc,y,false),panelDepth(m,xc,y,true))};
  const n3=(N+1)*(K+1),pos=new Float32Array(n3*3),uv=new Float32Array(n3*2),col=new Float32Array(n3*3),P=new Array(n3),Z=new THREE.Vector3(0,0,1),zs=-sgn;
  const Lt=top.L,seam=T0.distanceTo(A);let perim=40,midC=null;
  for(let k=0;k<=K;k++){const t=k/K,Tk=top.pts[k],Bk=bot.pts[k],C0=Tk.clone().add(Bk).multiplyScalar(.5),up=Tk.clone().sub(Bk).normalize();
    let ry=Tk.distanceTo(Bk)/2;const armRz=t<.5?sl.rzArm:lerp(sl.rzArm,sl.cuffRZ,(t-.5)/.5);let rz=lerp(depthAt(C0.x,C0.y),armRz,sstep(.08,.35,t));
    const dist=t*Lt;let f=1;
    if(sl.rib){const rs=Lt-sl.rib;f*=1-(1-sl.ribF)*sstep(rs-1.2,rs+.5,dist);if(sl.bulge)f*=1+(sl.bulge-1)*Math.exp(-(((dist-(rs-4))/4.5)**2))}
    ry*=f;rz*=f;if(k===Math.round(K*.6))perim=Math.PI*(ry+rz);if(k===Math.round(K*.55))midC=C0.clone();
    const cw=1-sstep(0,.08,t);
    for(let i=0;i<=N;i++){const th=(i/N*2-1)*Math.PI;
      const p=C0.clone().addScaledVector(up,ry*Math.cos(th)).addScaledVector(Z,rz*Math.sin(th)*zs);
      if(cw>0&&Math.abs(p.x)<m.a){const bk=p.z<ZC,dd=panelDepth(m,p.x,p.y,bk)*.93;if(Math.abs(p.z-ZC)>dd)p.z=lerp(p.z,ZC+(bk?-1:1)*dd,cw)}
      const q=k*(N+1)+i;P[q]=p;pos.set([p.x,p.y,p.z],q*3);
      let ao=1-.14*Math.max(0,-Math.cos(th))*Math.exp(-Math.max(0,dist-seam)/12);ao*=1-.08*sstep(Lt-1.2,Lt,dist);col.set([ao,ao,ao],q*3)}
  }
  let tl=0;const mid=N/2;
  for(let k=0;k<=K;k++){if(k)tl+=P[k*(N+1)+mid].distanceTo(P[(k-1)*(N+1)+mid]);const yy=tl-seam;
    for(const dir of [1,-1]){let s=0;for(let i=mid;dir>0?i<=N:i>=0;i+=dir){const q=k*(N+1)+i;if(i!==mid)s+=P[q].distanceTo(P[q-dir]);uv[q*2]=.5+dir*s/W_C;uv[q*2+1]=1-(Y0+yy)/H_C}}}
  const kk=Math.round(K/2),upMid=top.pts[kk].clone().sub(bot.pts[kk]).normalize();
  const g=gridGeo(N,K,pos,uv,col,[mid,kk,upMid]);
  g.userData={L:tl-seam,mid:midC,perim};
  return g;
}

/* ---- short ---- */
const supA=(a,ax)=>Math.pow(Math.max(0,1-Math.pow(Math.min(1,ax/a),2.3)),1/2.3);
function shortDepth(m,x,y,back){const S=supA(m.a,Math.abs(x));return (back?m.db:m.df)*S*(1-.12*sstep(-6,0,y))}
function shortW(y){return 1-.07*sstep(-8,0,y)}
function buildShortPanel(m,back){
  const C=120,Rw=70,sg=back?-1:1,yEnd=-m.rise+2,n=(C+1)*(Rw+1),pos=new Float32Array(n*3),uv=new Float32Array(n*2),col=new Float32Array(n*3),P=new Array(n);
  const xs=[];for(let i=0;i<=C;i++)xs.push(m.a*Math.sin((i/C*2-1)*Math.PI/2));
  for(let j=0;j<=Rw;j++){const y=yEnd*j/Rw;for(let i=0;i<=C;i++){const x=xs[i];let d=shortDepth(m,x,y,back);{const cr=sstep(-m.rise+13,-m.rise+3,y),ex=Math.max(0,1-Math.abs(x)/(m.a*.55));d*=1-cr*.55*Math.pow(ex,1.4)}d+=.18*Math.sin(x*.35+(back?1:2))*Math.sin(y*.3)*supA(m.a,Math.abs(x));
    const p=new THREE.Vector3(x*shortW(y),y,ZC+sg*d);const k=j*(C+1)+i;P[k]=p;pos.set([p.x,p.y,p.z],k*3);
    let ao=1-.18*sstep(-1.2,0,y);ao*=1-.25*Math.exp(-((Math.abs(x)/3)**2))*sstep(-m.rise+8,-m.rise,y);col.set([ao,ao,ao],k*3)}}
  const mid=C/2;
  for(let j=0;j<=Rw;j++){for(const dir of [1,-1]){let s=0;for(let i=mid;dir>0?i<=C:i>=0;i+=dir){const k=j*(C+1)+i;if(i!==mid)s+=P[k].distanceTo(P[k-dir]);
    const sgn=back?-dir:dir;uv[k*2]=.5+sgn*s/W_C;uv[k*2+1]=1-(Y0-P[k].y)/H_C}}}
  return gridGeo(C,Rw,pos,uv,col,[C/2,Rw/2,new THREE.Vector3(0,0,sg)]);
}
function buildLeg(m,side){
  const sgn=side,K=70,N=72,y0=-m.rise+12,y1=-m.len,n3=(N+1)*(K+1),pos=new Float32Array(n3*3),uv=new Float32Array(n3*2),col=new Float32Array(n3*3),P=new Array(n3),zs=-sgn;
  const xc0=m.a/2,dF0=shortDepth(m,xc0,-m.rise+12,false)*.97,dB0=shortDepth(m,xc0,-m.rise+12,true)*.97,dF1=shortDepth(m,xc0,-m.rise+2,false)+.5,dB1=shortDepth(m,xc0,-m.rise+2,true)+.5,tB=10/(m.len-m.rise+12);
  let midC=null,perim=60;
  for(let k=0;k<=K;k++){const t=k/K,y=lerp(y0,y1,t),cxl=sgn*lerp(xc0,xc0+1.2,sstep(0,1,t)),e1=sstep(0,tB,t),rx=lerp(lerp(m.a/2*.97,m.a/2+.5,e1),10.6,sstep(tB,.75,t)),rF=lerp(lerp(dF0,dF1,e1),10.6,sstep(tB,.75,t)),rB=lerp(lerp(dB0,dB1,e1),11.4,sstep(tB,.75,t));
    if(k===Math.round(K*.6)){midC=new THREE.Vector3(cxl,y,ZC);perim=Math.PI*(rx+(rF+rB)/2)}
    for(let i=0;i<=N;i++){const th=(i/N*2-1)*Math.PI,sz=Math.sin(th)*zs;const r=sz>=0?rF:rB;
      const wob=1+.02*Math.sin(th*3+y*.4+sgn);const p=new THREE.Vector3(cxl+sgn*rx*Math.cos(th)*wob,y,ZC+r*sz*wob);
      const q=k*(N+1)+i;P[q]=p;pos.set([p.x,p.y,p.z],q*3);let ao=1-.2*Math.max(0,-Math.cos(th))*sstep(-m.rise+2,-m.rise-6,y)*(1-t);ao*=1-.08*sstep(-m.len+1.2,-m.len,y);col.set([ao,ao,ao],q*3)}}
  const mid=N/2;
  for(let k=0;k<=K;k++){for(const dir of [1,-1]){let s=0;for(let i=mid;dir>0?i<=N:i>=0;i+=dir){const q=k*(N+1)+i;if(i!==mid)s+=P[q].distanceTo(P[q-dir]);uv[q*2]=.5+dir*s/W_C;uv[q*2+1]=1-(Y0-P[q].y)/H_C}}}
  const g=gridGeo(N,K,pos,uv,col,[mid,Math.round(K/2),new THREE.Vector3(sgn,0,0)]);
  g.userData={L:m.len,mid:midC,perim};return g;
}

/* ---- collars ---- */
function ringGeo(m,phis,rows,ptFn,outward,uvRows){
  const C=phis.length-1,Rw=rows-1,n=(C+1)*(Rw+1),pos=new Float32Array(n*3),uv=new Float32Array(n*2);
  for(let j=0;j<=Rw;j++)for(let i=0;i<=C;i++){const p=ptFn(phis[i],j/Rw,i);const k=j*(C+1)+i;pos.set([p.x,p.y,p.z],k*3);uv[k*2]=i/C;uv[k*2+1]=uvRows?j/Rw:j/Rw}
  return gridGeo(C,Rw,pos,uv,null,[Math.round(C/2),Math.round(Rw/2),outward]);
}
const range=(a,b,n)=>Array.from({length:n+1},(_,i)=>a+(b-a)*i/n);
function crewGeo(m){
  const prof=[[-.55,-.75,0],[-.32,.15,0],[.15,.48,0],[.55,.18,.5],[.5,-.2,1.3],[.38,-.25,2.1]];
  const curve=new THREE.SplineCurve(prof.map(p=>new THREE.Vector2(p[0],p[1])));
  return ringGeo(m,range(-Math.PI,Math.PI,160),14,(phi,t)=>{const N=neckPt(m,phi),Rh=neckOut(m,phi);const pd=Rh.clone().multiplyScalar(.45).add(new THREE.Vector3(0,-1,0)).normalize();
    const f=t*(prof.length-1),i0=Math.floor(Math.min(f,prof.length-2)),fr=f-i0;const c=prof[i0].map((v,q)=>lerp(v,prof[i0+1][q],fr));const cp=curve.getPoint(t);
    return pushOut(m,N.clone().addScaledVector(Rh,cp.x).add(new THREE.Vector3(0,cp.y,0)).addScaledVector(pd,c[2]),.22)},new THREE.Vector3(0,0,1));
}
function poloGeos(m){
  const f0=.2,phis=range(f0,2*Math.PI-f0,150);
  const stand=ringGeo(m,phis,8,(phi,t)=>{const N=neckPt(m,phi),Rh=neckOut(m,phi);const h=lerp(-.4,3,t);return N.clone().addScaledVector(Rh,.15+.06*h).add(new THREE.Vector3(0,h,0))},new THREE.Vector3(0,0,-1));
  const leaf=ringGeo(m,phis,16,(phi,t)=>{const N=neckPt(m,phi),Rh=neckOut(m,phi),U=new THREE.Vector3(0,1,0);
    const tip=Math.exp(-(phi-f0)/.32)+Math.exp(-(2*Math.PI-f0-phi)/.32);
    const F=N.clone().addScaledVector(Rh,.5).addScaledVector(U,3.15),E=N.clone().addScaledVector(Rh,3.5+1.1*tip).addScaledVector(U,-2.1-3.3*tip);
    const Cc=F.clone().add(E).multiplyScalar(.5).addScaledVector(Rh,.75).addScaledVector(U,.9);
    return pushOut(m,bez(F,Cc,E,t),.35)},new THREE.Vector3(0,0,-1));
  return [stand,leaf];
}
function zipCollarGeo(m){
  const hs=[[-.4,.25],[1,.38],[3,.55],[5,.72],[6.6,.86],[7.1,.75],[7.25,.35],[7.1,-.05],[6.7,-.3]];
  return ringGeo(m,range(-Math.PI,Math.PI,170),hs.length,(phi,t)=>{const N=neckPt(m,phi),Rh=neckOut(m,phi);const f=t*(hs.length-1),i0=Math.min(Math.floor(f),hs.length-2),fr=f-i0;
    const h=lerp(hs[i0][0],hs[i0+1][0],fr),r=lerp(hs[i0][1],hs[i0+1][1],fr);return N.clone().addScaledVector(Rh,r).add(new THREE.Vector3(0,h,0))},new THREE.Vector3(0,0,1));
}
function hoodGeo(m){
  const backP=new THREE.SplineCurve([[0,0],[1.6,3.6],[4.9,6.1],[8.4,5.6],[10.2,1.4],[9.7,-5.8],[8.4,-12.5]].map(p=>new THREE.Vector2(...p)));
  const sideP=new THREE.SplineCurve([[0,0],[1.2,2.8],[3.7,4.1],[5.9,3.1],[6.9,.7],[6.9,-1.3]].map(p=>new THREE.Vector2(...p)));
  const f0=.3,phis=range(f0,2*Math.PI-f0,140);
  return ringGeo(m,phis,46,(phi,t)=>{const g=(1-Math.cos(phi))/2,gb=sstep(.45,1,g),sc=Math.pow(sstep(0,.42,g),.75);
    const a=backP.getPoint(t),b=sideP.getPoint(t);const r=lerp(b.x,a.x,gb)*sc,h=lerp(b.y,a.y,gb)*sc;
    const N=neckPt(m,phi),Rh=neckOut(m,phi);return pushOut(m,N.clone().addScaledVector(Rh,r+.3*sc).add(new THREE.Vector3(0,h,0)),.9)},new THREE.Vector3(0,.3,-1));
}

/* ================= textures ================= */
function makeKnit(strength,heather){
  const s=128,c=canvas(s,s),g=c.getContext('2d'),im=g.createImageData(s,s),d=im.data;
  for(let y=0;y<s;y++)for(let x=0;x<s;x++){let v=((x%4<2)?4:-4)+(((y>>1)%2)?1:-1)+(Math.random()-.5)*12*strength;if(heather&&Math.random()<.08)v+=(Math.random()<.5?-1:1)*36;
    const i=(y*s+x)*4,w=v>=0?255:0;d[i]=d[i+1]=d[i+2]=w;d[i+3]=Math.min(255,Math.abs(v)*2)}
  g.putImageData(im,0,0);return c;
}
const KNIT=makeKnit(1,false),KNIT_M=makeKnit(2.3,true);
function normalTile(w,h,hf,str){
  const c=canvas(w,h),g=c.getContext('2d'),im=g.createImageData(w,h),d=im.data,H=(x,y)=>hf(((x%w)+w)%w,((y%h)+h)%h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const nx=(H(x-1,y)-H(x+1,y))*str,ny=(H(x,y-1)-H(x,y+1))*str,l=Math.hypot(nx,ny,1),i=(y*w+x)*4;
    d[i]=(nx/l*.5+.5)*255;d[i+1]=(-ny/l*.5+.5)*255;d[i+2]=(1/l*.5+.5)*255;d[i+3]=255}
  g.putImageData(im,0,0);return c;
}
const rnd=Array.from({length:4096},()=>Math.random());
const KNIT_N=normalTile(64,64,(x,y)=>.5-.5*Math.cos(2*Math.PI*x/4)*(.7+.3*Math.sin(2*Math.PI*(y+(x%8<4?0:1.5))/3))+rnd[(y*64+x)%4096]*.18,1.6);
const ribW=Math.max(6,Math.round(PPC*.5));
const RIB_N=normalTile(ribW,8,(x,y)=>.5-.5*Math.cos(2*Math.PI*x/ribW),2.6);
const normalPanel=canvas(CW,CH),normalSleeve=canvas(CW,CH);
const texNP=makeTex(normalPanel,false),texNS=makeTex(normalSleeve,false);
function paintNormals(){
  const m=M();
  const sr=m.sleeve&&m.sleeve.rib,isShort=m.kind==='short';
  for(const [c,ribFrom,ribTo] of [[normalPanel,isShort?0:(m.waistRib?m.len-m.waistRib:0),isShort?4:(m.waistRib?m.len:0)],[normalSleeve,sr?SL.L-sr:0,sr?SL.L:0]]){
    const g=c.getContext('2d');g.fillStyle=g.createPattern(KNIT_N,'repeat');g.fillRect(0,0,CW,CH);
    if(ribTo){g.fillStyle=g.createPattern(RIB_N,'repeat');g.fillRect(0,(Y0+ribFrom)*PPC,CW,(ribTo-ribFrom+1)*PPC)}
  }
  texNP.needsUpdate=texNS.needsUpdate=true;
}

/* zone canvases */
const Z={};
for(const z of ZONE_IDS){const c=canvas(CW,CH),base=canvas(CW,CH),tex=makeTex(c);
  const mat=new THREE.MeshPhysicalMaterial({map:tex,normalMap:z.startsWith('sleeve')?texNS:texNP,normalScale:new THREE.Vector2(.16,.16),roughness:.92,metalness:0,sheen:.22,sheenRoughness:.9,envMapIntensity:.7,vertexColors:true});
  Z[z]={c,base,tex,mat,mesh:null}}
const trimCanvas=canvas(1024,256),trimTex=makeTex(trimCanvas),hoodCanvas=canvas(1024,512),hoodTex=makeTex(hoodCanvas);
const trimMat=new THREE.MeshPhysicalMaterial({map:trimTex,roughness:.92,sheen:.22,sheenRoughness:.9,envMapIntensity:.7,side:THREE.DoubleSide,normalMap:makeTex(normalTile(16,16,(x)=>.5-.5*Math.cos(2*Math.PI*x/8),2),false),normalScale:new THREE.Vector2(.5,.5)});
const hoodMat=new THREE.MeshPhysicalMaterial({map:hoodTex,roughness:.92,sheen:.22,sheenRoughness:.9,envMapIntensity:.7,normalMap:texNP,normalScale:new THREE.Vector2(.14,.14)});
const innerMat=new THREE.MeshStandardMaterial({color:0x333333,roughness:1,side:THREE.BackSide});
const metalMat=new THREE.MeshStandardMaterial({color:0xc9ccd1,metalness:1,roughness:.32});
const darkMetal=new THREE.MeshStandardMaterial({color:0x2e3035,metalness:.85,roughness:.38});
const cordMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.75});
const buttonMat=new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.35,clearcoat:.6});

function stitch(g,x0,x1,y,vertical){g.save();g.setLineDash([.32*PPC,.2*PPC]);g.lineWidth=Math.max(1,.07*PPC);g.strokeStyle='rgba(0,0,0,.32)';g.beginPath();
  if(vertical){g.moveTo(y,x0);g.lineTo(y,x1)}else{g.moveTo(x0,y);g.lineTo(x1,y)}g.stroke();g.strokeStyle='rgba(255,255,255,.12)';g.lineDashOffset=.12*PPC;g.beginPath();
  if(vertical){g.moveTo(y+1,x0);g.lineTo(y+1,x1)}else{g.moveTo(x0,y+1);g.lineTo(x1,y+1)}g.stroke();g.restore()}
function paintFabric(g,w,h){const col=colorObj();g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.fillStyle=col.hex;g.fillRect(0,0,w,h);
  g.fillStyle=g.createPattern(col.melange?KNIT_M:KNIT,'repeat');g.globalAlpha=col.melange?1:.35;g.fillRect(0,0,w,h);g.globalAlpha=1}
function ribLines(g,y0,y1,w){g.save();g.fillStyle='rgba(0,0,0,.06)';g.fillRect(0,y0,w,y1-y0);g.strokeStyle='rgba(0,0,0,.13)';g.lineWidth=Math.max(1,PPC*.08);
  for(let x=0;x<w;x+=PPC*.5){g.beginPath();g.moveTo(x,y0);g.lineTo(x,y1);g.stroke()}g.strokeStyle='rgba(0,0,0,.3)';g.lineWidth=Math.max(1,PPC*.1);g.beginPath();g.moveTo(0,y0);g.lineTo(w,y0);g.stroke();g.restore()}
const cx=v=>(W_C/2+v)*PPC, cy=v=>(Y0+v)*PPC;
function drawBases(){
  const m=M(),col=colorObj(),dark=lum(col.hex)<.5;
  for(const z of ZONE_IDS){const g=Z[z].base.getContext('2d');paintFabric(g,CW,CH);
    if(m.kind==='short'){
      if(z==='front'||z==='back'){ribLines(g,cy(0),cy(4),CW);stitch(g,0,CW,cy(4.3))}
      else stitch(g,0,CW,cy(m.len-2.5));
      continue}
    if(z==='front'||z==='back'){
      if(m.waistRib)ribLines(g,cy(m.len-m.waistRib),cy(m.len),CW);else stitch(g,0,CW,cy(m.len-2.2));
      if(m.quilted)for(let q=7;q<m.len-2;q+=9){stitch(g,0,CW,cy(q));g.save();const gr=g.createLinearGradient(0,cy(q-1.2),0,cy(q+1.2));gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(.5,'rgba(0,0,0,.14)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,cy(q-1.2),CW,2.4*PPC);g.restore()}
      if(z==='front'&&m.collar==='polo'){ // knoopsluiting
        g.save();g.fillStyle='rgba(0,0,0,.05)';g.fillRect(cx(-1.6),cy(m.dropF-.5),3.2*PPC,13.5*PPC);
        g.strokeStyle='rgba(0,0,0,.3)';g.lineWidth=Math.max(1,PPC*.08);g.strokeRect(cx(-1.6),cy(m.dropF-1),3.2*PPC,14*PPC);
        g.beginPath();g.moveTo(cx(.9),cy(m.dropF));g.lineTo(cx(.9),cy(m.dropF+12.8));g.stroke();g.restore();
        stitch(g,cx(-2),cx(2),cy(m.dropF+13.6))}
      if(z==='front'&&m.collar==='zip'){
        const y0=cy(m.dropF-.5),y1=cy(m.fullZip?m.len-.3:24),tape=shade(col.hex,dark?-.35:-.25);
        g.save();g.fillStyle=tape;g.fillRect(cx(-.75),y0,1.5*PPC,y1-y0);g.strokeStyle=dark?'rgba(255,255,255,.22)':'rgba(0,0,0,.35)';g.lineWidth=Math.max(1,PPC*.06);
        g.beginPath();for(let y=y0,k=0;y<y1;y+=PPC*.22,k++){g.lineTo(cx(k%2?.32:-.32),y)}g.stroke();
        g.fillStyle=dark?'#6e7179':'#55585f';g.fillRect(cx(-.55),y1-.5*PPC,1.1*PPC,.5*PPC);g.restore();
        stitch(g,y0,y1,cx(-1.25),true);stitch(g,y0,y1,cx(1.25),true);stitch(g,cx(-1.25),cx(1.25),y1+.5*PPC)}
      if(z==='front'&&m.pocket){
        const top=44,bot=m.len-m.waistRib;g.save();
        g.beginPath();g.moveTo(cx(-11),cy(top));g.lineTo(cx(11),cy(top));g.lineTo(cx(15.5),cy(top+12));g.lineTo(cx(15.5),cy(bot));g.lineTo(cx(-15.5),cy(bot));g.lineTo(cx(-15.5),cy(top+12));g.closePath();
        g.fillStyle='rgba(0,0,0,.035)';g.fill();g.restore();
        stitch(g,cx(-11),cx(11),cy(top+.6));stitch(g,cx(-11),cx(11),cy(top+1.1));
        for(const s of [-1,1]){g.save();g.strokeStyle='rgba(0,0,0,.45)';g.lineWidth=PPC*.16;g.beginPath();g.moveTo(cx(11*s),cy(top));g.lineTo(cx(15.5*s),cy(top+12));g.stroke();
          g.strokeStyle='rgba(0,0,0,.12)';g.lineWidth=PPC*.9;g.beginPath();g.moveTo(cx(11.4*s),cy(top+.5));g.lineTo(cx(15.9*s),cy(top+12.3));g.stroke();g.restore();
          g.save();g.setLineDash([.32*PPC,.2*PPC]);g.strokeStyle='rgba(0,0,0,.3)';g.lineWidth=PPC*.07;g.beginPath();g.moveTo(cx(10.4*s),cy(top+.2));g.lineTo(cx(14.9*s),cy(top+12.2));g.stroke();g.restore()}
      }
    }else if(m.sleeve){
      const L=SL.L;if(m.sleeve.rib)ribLines(g,cy(L-m.sleeve.rib),cy(L+1),CW);else stitch(g,0,CW,cy(L-m.sleeve.hem))}
  }
  // trims
  let g=trimCanvas.getContext('2d');paintFabric(g,1024,256);g.fillStyle='rgba(0,0,0,.04)';g.fillRect(0,0,1024,256);
  if(m.collar==='zip'){const tape=shade(col.hex,dark?-.35:-.25);g.fillStyle=tape;g.fillRect(512-14,0,28,256);g.strokeStyle=dark?'rgba(255,255,255,.22)':'rgba(0,0,0,.35)';g.lineWidth=1.5;g.beginPath();for(let y=0,k=0;y<256;y+=5,k++)g.lineTo(512+(k%2?6:-6),y);g.stroke();
    for(const x of [512-24,512+24]){g.save();g.setLineDash([7,4]);g.strokeStyle='rgba(0,0,0,.3)';g.lineWidth=1.5;g.beginPath();g.moveTo(x,0);g.lineTo(x,256);g.stroke();g.restore()}}
  g=hoodCanvas.getContext('2d');paintFabric(g,1024,512);
  g.save();g.strokeStyle='rgba(0,0,0,.28)';g.lineWidth=2;g.beginPath();g.moveTo(512,0);g.lineTo(512,512);g.stroke();g.setLineDash([8,5]);g.strokeStyle='rgba(0,0,0,.25)';for(const x of [503,521]){g.beginPath();g.moveTo(x,0);g.lineTo(x,512);g.stroke()}g.restore();
  g.fillStyle='rgba(0,0,0,.08)';g.fillRect(0,490,1024,22);
  trimTex.needsUpdate=hoodTex.needsUpdate=true;
  innerMat.color.copy(lin(shade(col.hex,-.62)));
  const sh=lin(shade(col.hex,dark?.18:.08));for(const z of ZONE_IDS)Z[z].mat.sheenColor.copy(sh);trimMat.sheenColor.copy(sh);hoodMat.sheenColor.copy(sh);
  cordMat.color.copy(lin(shade(col.hex,dark?.12:-.06)));buttonMat.color.copy(lin(shade(col.hex,dark?.1:-.08)));
}

/* ================= scene graph ================= */
const CMU=.02;let ground=null;
const garment=new THREE.Group();garment.scale.setScalar(CMU);garment.position.y=36*CMU;scene.add(garment);
(function(){const c=canvas(256,256),g=c.getContext('2d'),gr=g.createRadialGradient(128,128,4,128,128,128);gr.addColorStop(0,'rgba(20,24,35,.3)');gr.addColorStop(1,'rgba(20,24,35,0)');g.fillStyle=gr;g.fillRect(0,0,256,256);
  const s=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false}));s.rotation.x=-Math.PI/2;s.scale.set(2.4,1,1);s.position.y=-.8;scene.add(s);ground=s})();
let SL={L:20,perim:44,mid:{L:new THREE.Vector3(),R:new THREE.Vector3()}};
const extras=[];
function addMesh(geo,mat,opts={}){const me=new THREE.Mesh(geo,mat);me.castShadow=opts.cast!==false;me.receiveShadow=true;Object.assign(me.userData,opts.data||{});garment.add(me);extras.push(me);return me}
function buildGarment(){
  for(const me of extras){garment.remove(me);if(!me.userData.shared)me.geometry.dispose()}extras.length=0;
  const m=M(),isShort=m.kind==='short';
  garment.position.y=(isShort?m.len/2+2:36)*CMU;ground.position.y=garment.position.y-(isShort?m.len:72)*CMU-.04;
  for(const z of ZONE_IDS){Z[z].mat.roughness=m.shiny||.92;Z[z].mat.sheen=m.shiny?.12:.22;Z[z].mat.normalScale.set(m.shiny?.08:.16,m.shiny?.08:.16)}
  trimMat.roughness=hoodMat.roughness=m.shiny||.92;
  for(const [z,back] of [['front',false],['back',true]]){const g=isShort?buildShortPanel(m,back):buildPanel(m,back);Z[z].mesh=addMesh(g,Z[z].mat,{data:{zone:z}});addMesh(g,innerMat,{cast:false,data:{shared:true}})}
  if(!m.sleeveless)for(const [z,s] of [['sleeveL',1],['sleeveR',-1]]){const g=isShort?buildLeg(m,s):buildSleeve(m,s);Z[z].mesh=addMesh(g,Z[z].mat,{data:{zone:z}});addMesh(g,innerMat,{cast:false,data:{shared:true}});
    SL.L=g.userData.L;SL.perim=g.userData.perim;SL.mid[s>0?'L':'R']=g.userData.mid}
  if(isShort){for(const s of [1,-1]){const st=new THREE.Vector3(1.6*s,-2.2,ZC+shortDepth(m,1.6,-2.2,false)+.4);
      const cz=(x,y)=>ZC+shortDepth(m,x,y,false)+.45;const curve=new THREE.CatmullRomCurve3([st,new THREE.Vector3(2.4*s,-6,cz(2.4,-6)),new THREE.Vector3(2.8*s,-11,cz(2.8,-11)),new THREE.Vector3(2.6*s,-14,cz(2.6,-14))]);addMesh(new THREE.TubeGeometry(curve,40,.28,8),cordMat);
      const end=curve.getPoint(1),tan=curve.getTangent(1);const ag=addMesh(new THREE.CylinderGeometry(.3,.27,2,12),metalMat);ag.position.copy(end).addScaledVector(tan,.9);ag.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),tan)}
    for(const l of state.layers)clampLayer(l);paintNormals();return}
  if(m.collar==='crew')addMesh(crewGeo(m),trimMat);
  if(m.collar==='polo'){for(const g of poloGeos(m))addMesh(g,trimMat);
    for(const yy of [m.dropF+2.6,m.dropF+6.6,m.dropF+10.6]){const p=surf(m,.35,-yy,false);const b=addMesh(new THREE.CylinderGeometry(.55,.55,.28,28),buttonMat);b.position.copy(p).add(new THREE.Vector3(0,0,.2));b.rotation.x=Math.PI/2-.12}}
  if(m.collar==='crew'&&m.vneck){}
  if(m.collar==='zip'){addMesh(zipCollarGeo(m),trimMat);
    const top=neckPt(m,0).add(new THREE.Vector3(0,6.2,.86+.5));const sld=addMesh(new THREE.BoxGeometry(1.15,1.7,.6),darkMetal);sld.position.copy(top);
    const tab=addMesh(new THREE.BoxGeometry(.95,3.4,.18),darkMetal);tab.position.copy(top).add(new THREE.Vector3(0,-2.1,.42));tab.rotation.x=-.12}
  if(m.collar==='hood'){const hg=hoodGeo(m);addMesh(hg,hoodMat,{data:{zone:null}});addMesh(hg,innerMat,{cast:false,data:{shared:true}});
    for(const s of [1,-1]){const st=surf(m,3.4*s,-m.dropF+1.6,false).add(new THREE.Vector3(0,0,.7));
      const pts=[st,new THREE.Vector3(3.9*s,st.y-6,0),new THREE.Vector3(4.4*s,st.y-15,0),new THREE.Vector3(4.6*s,st.y-24,0),new THREE.Vector3(4.4*s,st.y-31,0)].map((p,i)=>i?pushOut(m,new THREE.Vector3(p.x,p.y,ZC),.55):p);
      const curve=new THREE.CatmullRomCurve3(pts);addMesh(new THREE.TubeGeometry(curve,80,.3,10),cordMat);
      const end=curve.getPoint(1),tan=curve.getTangent(1);const ag=addMesh(new THREE.CylinderGeometry(.33,.3,2.6,14),metalMat);ag.position.copy(end).addScaledVector(tan,1.2);ag.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),tan);
      const ey=addMesh(new THREE.TorusGeometry(.5,.16,10,28),metalMat);ey.position.copy(st).add(new THREE.Vector3(0,.2,-.25))}}
  for(const l of state.layers)clampLayer(l);
  paintNormals();
}
const pickables=()=>extras.filter(e=>e.material!==innerMat);

/* ================= print layers ================= */
const mctx=canvas(4,4).getContext('2d');
function textAspect(l){mctx.font=fontSpec(l.font,100);const m=mctx.measureText(effText(l)||' ');const w=(m.actualBoundingBoxLeft+m.actualBoundingBoxRight)||1,h=(m.actualBoundingBoxAscent+m.actualBoundingBoxDescent)||60;return h/w}
function bitmap(l){
  const key=[l.w.toFixed(2),l.aspect.toFixed(4),l.tech,l.type==='text'?effText(l)+l.font+l.color:(l.knock?1:0),PPC].join('|');
  if(l._k===key)return l._b;
  const ss=2,wpx=Math.max(4,Math.round(l.w*PPC*ss)),hpx=Math.max(4,Math.round(l.w*l.aspect*PPC*ss));
  const c=canvas(wpx,hpx),g=c.getContext('2d');g.imageSmoothingQuality='high';
  if(l.type==='image')g.drawImage(l.knock?knockOut(l):l.src,0,0,wpx,hpx);
  else{g.font=fontSpec(l.font,100);const mm=g.measureText(effText(l)||' ');const tw=(mm.actualBoundingBoxLeft+mm.actualBoundingBoxRight)||1;const s=wpx/tw;g.scale(s,s);g.font=fontSpec(l.font,100);g.fillStyle=l.color;g.fillText(effText(l),mm.actualBoundingBoxLeft,mm.actualBoundingBoxAscent);g.setTransform(1,0,0,1,0,0)}
  g.globalCompositeOperation='source-atop';
  if(l.tech==='bord'){const st=Math.max(2,PPC*ss*.07);g.lineWidth=st*.45;for(let x=-hpx;x<wpx+hpx;x+=st){g.strokeStyle=(Math.round(x/st)%2)?'rgba(255,255,255,.16)':'rgba(0,0,0,.14)';g.beginPath();g.moveTo(x,0);g.lineTo(x+hpx*.55,hpx);g.stroke()}}
  else{g.globalAlpha=.5;g.fillStyle=g.createPattern(KNIT,'repeat');g.fillRect(0,0,wpx,hpx);g.globalAlpha=1}
  l._b=c;l._k=key;return c;
}
function knockOut(l){
  if(l._ko)return l._ko;const s=l.src,c=canvas(s.width,s.height),g=c.getContext('2d');g.drawImage(s,0,0);
  const im=g.getImageData(0,0,c.width,c.height),d=im.data;for(let i=0;i<d.length;i+=4){const mn=Math.min(d[i],d[i+1],d[i+2]);if(mn>=242)d[i+3]=0;else if(mn>=215)d[i+3]=d[i+3]*(242-mn)/27}
  g.putImageData(im,0,0);l._ko=c;return c;
}
function xform(g,l,fn){g.save();g.translate(cx(l.x),cy(l.y));g.rotate(l.rot*Math.PI/180);g.scale(.5,.5);fn();g.restore()}
function drawLayer(g,l){const b=bitmap(l);xform(g,l,()=>{if(l.tech==='bord'){g.shadowColor='rgba(0,0,0,.42)';g.shadowBlur=3;g.shadowOffsetY=1.5}g.drawImage(b,-b.width/2,-b.height/2)})}
function dual(g,draw,lw,dash){g.lineWidth=lw;g.setLineDash(dash);g.strokeStyle='rgba(0,0,0,.55)';draw();g.lineDashOffset=dash[0];g.strokeStyle='rgba(255,255,255,.85)';draw()}
function drawGuides(g,l){
  const a=areaFor(l.zone);g.save();g.globalAlpha=.6;dual(g,()=>g.strokeRect(cx(-a.w/2),cy(a.top),a.w*PPC,a.h*PPC),Math.max(1,PPC*.07),[PPC*.5,PPC*.5]);g.globalAlpha=1;
  g.font=`600 ${Math.round(PPC*.75)}px Archivo, Arial, sans-serif`;g.textBaseline='top';g.fillStyle=lum(colorObj().hex)>.55?'rgba(0,0,0,.55)':'rgba(255,255,255,.7)';g.fillText(`drukgebied ${a.w} × ${a.h} cm`,cx(-a.w/2)+PPC*.4,cy(a.top)+PPC*.4);g.restore();
  const b=bitmap(l),pad=.35*PPC*2;xform(g,l,()=>dual(g,()=>g.strokeRect(-b.width/2-pad,-b.height/2-pad,b.width+2*pad,b.height+2*pad),PPC*.18,[PPC*.8,PPC*.6]));
}
let dirty=new Set(ZONE_IDS);
const markAll=()=>ZONE_IDS.forEach(z=>dirty.add(z)),markZone=z=>dirty.add(z);
function redraw(){const s=cur();for(const z of dirty){const g=Z[z].c.getContext('2d');g.setTransform(1,0,0,1,0,0);g.drawImage(Z[z].base,0,0);
  for(const l of state.layers)if(l.zone===z)drawLayer(g,l);if(state.guides&&s&&s.zone===z)drawGuides(g,s);Z[z].tex.needsUpdate=true}dirty.clear()}

function zoneRange(z){const m=M();
  if(m.kind==='short')return z.startsWith('sleeve')?{xmin:-(SL.perim/2-3),xmax:SL.perim/2-3,ymin:m.rise-2,ymax:m.len-3,wmax:14,yLabel:'Onder tailleband'}:{xmin:-(W_C/2-5),xmax:W_C/2-5,ymin:1,ymax:m.rise-2,wmax:30,yLabel:'Onder tailleband'};
  if(z.startsWith('sleeve'))return{xmin:-(SL.perim/2-3),xmax:SL.perim/2-3,ymin:0,ymax:SL.L-3,wmax:12,yLabel:'Onder schoudernaad'};
  return{xmin:-(W_C/2-5),xmax:W_C/2-5,ymin:1,ymax:m.len-3,wmax:36,yLabel:'Onder de kraag'}}
function clampLayer(l){const r=zoneRange(l.zone);l.x=clamp(l.x,r.xmin,r.xmax);l.y=clamp(l.y,r.ymin,r.ymax);l.w=clamp(l.w,1,r.wmax)}
function describeX(l){if(Math.abs(l.x)<.25)return 'midden';const side=l.zone==='back'?(l.x>0?'rechts':'links'):(l.x>0?'links':'rechts');return `${fmt(Math.abs(l.x))} cm ${side}`}
function describePos(l){
  if(M().kind==='short')return `${fmt(l.y)} cm onder de tailleband${Math.abs(l.x)>=.25?', '+describeX(l)+' van midden':''}`;
  if(l.zone.startsWith('sleeve'))return `${fmt(l.y)} cm onder schoudernaad${Math.abs(l.x)>=.25?', '+describeX(l)+' van midden':''}`;
  return `${fmt(l.y)} cm onder de kraag, ${Math.abs(l.x)<.25?'gecentreerd':describeX(l)+' van midden'}`}
const layerName=l=>l.player?(l.player==='naam'?'Naam per speler':'Nummer per speler'):l.type==='text'?`“${l.text||'…'}”`:l.name;
const dpiOf=l=>Math.round(l.srcW/(l.w/2.54));
function warnings(l){
  const out=[],h=l.w*l.aspect,a=areaFor(l.zone),r=l.rot*Math.PI/180,m=M();
  const hx=Math.abs(l.w/2*Math.cos(r))+Math.abs(h/2*Math.sin(r)),hy=Math.abs(l.w/2*Math.sin(r))+Math.abs(h/2*Math.cos(r));
  if(l.x-hx<-a.w/2-.01||l.x+hx>a.w/2+.01||l.y-hy<a.top-.01||l.y+hy>a.top+a.h+.01)out.push(`Valt (deels) buiten het drukgebied van ${a.w} × ${a.h} cm.`);
  if(l.zone==='front'&&(m.collar==='polo'||m.collar==='zip')&&Math.abs(l.x)-hx<2.2&&l.y-hy<(m.collar==='polo'?m.dropF+14:m.fullZip?m.len:24))out.push(m.collar==='polo'?'Overlapt de knoopsluiting. Schuif het ontwerp opzij of lager.':'Overlapt de rits. Schuif het ontwerp opzij of lager.');
  if(l.zone==='front'&&m.pocket&&l.y+hy>43)out.push('Loopt over de buidelzak. Daar kan niet worden bedrukt.');
  if(l.tech==='bord'&&l.w>25)out.push('Borduurwerk breder dan 25 cm wordt stug en kostbaar. Kies hier liever DTF of zeefdruk.');
  if(l.tech==='bord'&&l.type==='text'&&h<.6)out.push('Tekst lager dan 6 mm is lastig leesbaar te borduren.');
  if(l.tech==='subli'&&lum(colorObj().hex)<.6)out.push('Sublimatie kan alleen op witte of lichte stof. Kies een lichte kleur of laat ons adviseren.');
  if(l.type==='text'&&!l.player&&!String(l.text||'').trim())out.push('Deze tekst is nog leeg. Typ uw tekst of verwijder de regel.');
  if(l.type==='image'&&!l.vector){const dpi=dpiOf(l);if(dpi<150)out.push(`Uw logo is op deze maat wat onscherp (${dpi} dpi). Geen probleem voor de offerte; heeft u een scherper bestand (SVG, PDF, AI of een grote PNG), stuur dat dan later mee.`)}
  return out;
}
function newLayer(o){const l=Object.assign({id:nextId++,zone:'front',x:0,y:20,w:9,rot:0,tech:'advies',aspect:1,knock:false},o);if(l.type==='text')l.aspect=textAspect(l);clampLayer(l);state.layers.push(l);return l}
function applyPreset(l,p){const m=M();l.zone=p.zone;l.x=p.x;l.y=pv(p.y,m);l.w=Math.min(pv(p.w,m),zoneRange(p.zone).wmax);clampLayer(l);markAll()}
function userTouched(){if(state.sample){state.sample=false}updateStartCta();if(typeof hideStepMsg==='function'&&state.layers.length&&curStep===2)hideStepMsg()}

/* ================= camera ================= */
let tween=null,activeView='';
function fitDist(){const a=camera.aspect||1,t=Math.tan(15*Math.PI/180)*2,m=M();const sh=m.kind==='short';const w=sh?1.45:m.sleeveless?1.25:m.long?2.05:1.6,h=sh?1.5:1.75;return Math.max(h/t,w/(t*a))+.35}
function viewDef(n){const m=M();if(n==='front')return{t:[0,.02,0],az:0,pol:1.5};if(n==='back')return{t:[0,.02,0],az:Math.PI,pol:1.5};if(n==='start')return{t:[0,.02,0],az:.42,pol:1.45};
  const p=SL.mid[n==='sleeveL'?'L':'R'].clone().multiplyScalar(CMU).add(garment.position);if(M().kind==='short')return{t:[p.x*.5,p.y,0],az:(n==='sleeveL'?1:-1)*1.2,pol:1.45,d:3};return{t:[p.x*.6,M().long?p.y+.12:p.y-.05,0],az:(n==='sleeveL'?1:-1)*1.25,pol:1.35,d:M().long?4.3:3.2}}
function goView(name,instant){
  const v=viewDef(name),toT=new THREE.Vector3(...v.t),to=new THREE.Spherical(v.d||fitDist(),v.pol,v.az);setActiveView(name);
  if(instant){controls.target.copy(toT);camera.position.setFromSpherical(to).add(toT);controls.update();return}
  const from=new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));let d=to.theta-from.theta;d=((d+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;to.theta=from.theta+d;
  tween={t0:performance.now(),dur:700,fromT:controls.target.clone(),toT,from,to};
}
function setActiveView(n){activeView=n;document.querySelectorAll('.views button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.view===n))}
controls.addEventListener('start',()=>{tween=null;setActiveView('')});
document.querySelectorAll('.views button').forEach(b=>b.addEventListener('click',()=>goView(b.dataset.view)));

/* ================= picking ================= */
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();
function pick(e){
  const r=R.domElement.getBoundingClientRect();ndc.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ndc,camera);
  const h=ray.intersectObjects(pickables(),false)[0];if(!h)return null;const z=h.object.userData.zone;if(!z||!h.uv)return{zone:null};
  return{zone:z,x:(h.uv.x-.5)*W_C,y:(1-h.uv.y)*H_C-Y0};
}
function hitLayer(p){for(let i=state.layers.length-1;i>=0;i--){const l=state.layers[i];if(l.zone!==p.zone)continue;const r=l.rot*Math.PI/180,dx=p.x-l.x,dy=p.y-l.y;
  const lx=dx*Math.cos(r)+dy*Math.sin(r),ly=-dx*Math.sin(r)+dy*Math.cos(r);if(Math.abs(lx)<=l.w/2+.6&&Math.abs(ly)<=l.w*l.aspect/2+.6)return l}return null}
let drag=null,down=null,hoverQueued=null;
viewEl.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};if(e.pointerType==='mouse'&&e.button!==0)return;const p=pick(e);if(!p||!p.zone)return;const l=hitLayer(p);if(!l)return;
  e.stopPropagation();e.preventDefault();tween=null;if(state.sel!==l.id)select(l.id);drag={zone:l.zone,dx:p.x-l.x,dy:p.y-l.y};viewEl.setPointerCapture(e.pointerId);R.domElement.style.cursor='grabbing'},{capture:true});
viewEl.addEventListener('pointermove',e=>{
  if(drag){const p=pick(e),l=cur();if(p&&l&&p.zone===drag.zone){l.x=p.x-drag.dx;l.y=p.y-drag.dy;clampLayer(l);markZone(l.zone);userTouched();syncEditor();updateReadout()}return}
  if(!e.buttons&&e.pointerType==='mouse')hoverQueued=e});
viewEl.addEventListener('pointerup',e=>{if(drag){drag=null;R.domElement.style.cursor='grab';renderLayers();updateSpec();return}
  if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<4){const p=pick(e);if(!p||!p.zone||!hitLayer(p)){if(state.sel!==null)select(null)}}down=null});
viewEl.addEventListener('pointercancel',()=>{drag=null});
const stage=$('#stage');let dragDepth=0;const hasFiles=e=>[...(e.dataTransfer?.types||[])].includes('Files');
stage.addEventListener('dragenter',e=>{if(hasFiles(e)){dragDepth++;$('#drop').hidden=false;e.preventDefault()}});
stage.addEventListener('dragover',e=>{if(hasFiles(e))e.preventDefault()});
stage.addEventListener('dragleave',()=>{if(--dragDepth<=0){dragDepth=0;$('#drop').hidden=true}});
stage.addEventListener('drop',e=>{e.preventDefault();dragDepth=0;$('#drop').hidden=true;const f=e.dataTransfer.files[0];if(f)loadFile(f)});

/* ================= loop ================= */
function frame(now){
  if(tween){const k=clamp((now-tween.t0)/tween.dur,0,1),e=k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;const t=tween.fromT.clone().lerp(tween.toT,e);
    const s=new THREE.Spherical(lerp(tween.from.radius,tween.to.radius,e),lerp(tween.from.phi,tween.to.phi,e),lerp(tween.from.theta,tween.to.theta,e));controls.target.copy(t);camera.position.setFromSpherical(s).add(t);if(k>=1)tween=null}
  if(hoverQueued){const p=pick(hoverQueued);R.domElement.style.cursor=p&&p.zone&&hitLayer(p)?'move':'grab';hoverQueued=null}
  if(dirty.size)redraw();controls.update();R.render(scene,camera);requestAnimationFrame(frame);
}
function resize(){const w=viewEl.clientWidth,h=viewEl.clientHeight;if(!w||!h)return;R.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
new ResizeObserver(resize).observe(viewEl);

/* ================= UI ================= */
function renderGarmentUI(){
  $('#models').innerHTML=Object.values(MODELS).map(m=>`<button data-m="${m.id}" aria-pressed="${state.model===m.id}">${m.name}</button>`).join('');
  $('#swatches').innerHTML=COLORS.map(c=>`<button class="sw" data-c="${c.id}" title="${c.name}" aria-label="${c.name}" aria-pressed="${state.color===c.id}" style="background:${c.melange?`radial-gradient(circle at 30% 30%,#c4c6ca,${c.hex} 60%,#8d8f94)`:c.hex}"></button>`).join('');
  $('#colorName').textContent=`${M().name} · ${colorObj().name}`;
  const m=M();document.querySelectorAll('.views button').forEach(b=>{const v=b.dataset.view;if(v.startsWith('sleeve')){b.hidden=!!m.sleeveless;b.textContent=m.kind==='short'?(v==='sleeveL'?'Linkerpijp':'Rechterpijp'):(v==='sleeveL'?'Linkermouw':'Rechtermouw')}});
  for(const l of state.layers)if(l.zone.startsWith('sleeve')&&m.sleeveless){l.zone='front';l.y=20;l.x=10;clampLayer(l)}
}
$('#models').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.dataset.m===state.model)return;const prevKind=M().kind||'top';state.model=b.dataset.m;userTouched();if((M().kind||'top')!==prevKind){const sh=M().kind==='short',used={};for(const l of state.layers){if(l.player)continue;const id=l.zone==='front'?(sh?'hipL':'chestL'):l.zone==='back'?(sh?'backC':'backBig'):(l.zone==='sleeveL'?(sh?'legL':'sleeveL'):(sh?'legR':'sleeveR'));const p=allPresets().find(x=>x.id===id);const keepW=l.w;applyPreset(l,p);l.w=Math.min(keepW,pv(p.w,M())*1.6,zoneRange(l.zone).wmax);clampLayer(l)}}if(state.team.on){state.layers=state.layers.filter(l=>!l.player);ensurePlayerLayers();if(!cur())state.sel=state.layers[0]?state.layers[0].id:null}buildGarment();drawBases();markAll();renderGarmentUI();renderLayers();renderEditor();updateReadout();updateSpec();goView(activeView&&activeView!=='start'&&!(M().sleeveless&&activeView.startsWith('sleeve'))?activeView:'start',false)});
$('#swatches').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;state.color=b.dataset.c;userTouched();drawBases();markAll();state.layers.forEach(l=>l._k=null);renderGarmentUI();renderLayers();updateSpec()});
$('#guides').addEventListener('click',e=>{state.guides=!state.guides;e.currentTarget.setAttribute('aria-pressed',state.guides);markAll()});
function thumbHTML(l){const bg=colorObj().hex;if(l.type==='image')return `<div class="thumb" style="background:${bg}"><img alt="" src="${l.thumb}"></div>`;
  return `<div class="thumb" style="background:${bg}"><span style="color:${l.color};font-family:${FONTS[l.font].fam},sans-serif">Aa</span></div>`}
function renderLayers(){
  const n=state.layers.length;
  $('#layers').innerHTML=state.layers.slice().reverse().map(l=>{const w=warnings(l).concat(playerWarnings(l)).length;
    return `<li class="layer" role="option" tabindex="0" data-id="${l.id}" aria-selected="${l.id===state.sel}">
    ${thumbHTML(l)}<div style="min-width:0"><div class="lname">${esc(layerName(l))}</div><div class="lmeta">${zoneName(l.zone)} · ${fmt(l.w)} × ${fmt(l.w*l.aspect)} cm</div></div>${w?'<span class="lwarn" title="Bekijk de opmerking">!</span>':'<span class="ledit">Aanpassen</span>'}</li>`}).join('');
  $('#layers').hidden=!n;
  $('#layerCount').textContent=n?`${n} ${n===1?'bedrukking':'bedrukkingen'}`:'';
  const ul=$('#uploadLabel');if(ul)ul.textContent=state.layers.some(l=>l.type==='image')?'Nog een logo uploaden':'Upload uw logo';
  $('#uploadBtn').classList.toggle('compact',n>0);
  updateStartCta();
}
function updateStartCta(){const c=$('#startCta');if(c)c.hidden=state.layers.length>0||RENDER_MODE}
$('#layers').addEventListener('click',e=>{const li=e.target.closest('.layer');if(li)select(+li.dataset.id,true)});
$('#layers').addEventListener('keydown',e=>{const li=e.target.closest('.layer');if(li&&(e.key==='Enter'||e.key===' ')){e.preventDefault();select(+li.dataset.id,true)}});
function select(id,focusView){state.sel=id;markAll();renderLayers();renderEditor();updateReadout();const l=cur();
  if(l&&curStep!==2&&!drag)goStep(2,true);
  if(l&&focusView&&activeView!==l.zone)goView(l.zone)}
let lastDeleted=null;
function renderEditor(){
  const l=cur(),box=$('#editor'),m=M();
  if(!l){box.hidden=true;box.innerHTML='';return}
  box.hidden=false;
  const r=zoneRange(l.zone),presets=presetsFor(m),isP=!!l.player,sp=SIZEPRE(l.zone);
  const techs=Object.entries(TECH).filter(([k,t])=>!t.hidden||k===l.tech);
  const fontSel=`<div class="frow"><label class="fld"><span>Lettertype</span><select id="edFont">${Object.entries(FONTS).map(([k,f])=>`<option value="${k}"${k===l.font?' selected':''}>${f.name}</option>`).join('')}</select></label>
      <label class="fld"><span>Kleur</span><input id="edColor" type="color" value="${l.color}"></label></div>`;
  box.innerHTML=`
    <div class="ed-h"><strong>${esc(layerName(l))}</strong><button class="ed-x" id="edClose" aria-label="Klaar met aanpassen">Klaar</button></div>
    ${isP?`<p class="tiphint">De naam en het nummer komen uit de spelerslijst in stap 3. Blader met de pijltjes in beeld door de spelers.</p>${fontSel}`
     :l.type==='text'?`<label class="fld"><span>Uw tekst</span><input id="edText" type="text" maxlength="40" value="${esc(l.text)}" placeholder="Typ hier uw tekst"></label>${fontSel}`:''}
    ${isP?'':`<div class="fld"><span class="lbl">Waar komt het?</span><div class="chips big" id="edPresets">${presets.map(p=>`<button data-p="${p.id}" aria-pressed="${isAt(l,p)}">${p.label}</button>`).join('')}</div></div>`}
    ${isP?`<div class="slider"><label class="lbl" for="edH">Letterhoogte</label><input id="edH" type="range" min="3" max="30" step=".5"><output id="oH"></output></div>`
         :`<div class="fld"><span class="lbl">Hoe groot?</span><div class="chips big" id="edSizes">${['Klein','Middel','Groot'].map((t,i)=>`<button data-w="${Math.min(sp[i],r.wmax)}">${t} <small>${fmt(Math.min(sp[i],r.wmax),0)} cm</small></button>`).join('')}</div>
            <div class="slider"><label class="lbl" for="edW">Breedte</label><input id="edW" type="range" min="2" max="${r.wmax}" step=".5"><output id="oW"></output></div></div>`}
    <ul class="warns" id="edWarn"></ul>
    <details class="more" id="edMore"${isP?'':''}><summary>Meer opties</summary>
      <div class="more-in">
      ${l.type==='image'&&!isP?`<label class="chk"><input id="edKnock" type="checkbox"${l.knock?' checked':''}> Witte achtergrond van het logo weghalen</label><p class="tiphint" id="edDpi"></p>`:''}
      <div class="slider"><label class="lbl" for="edX">Opzij</label><input id="edX" type="range" min="${r.xmin}" max="${r.xmax}" step=".5"><output id="oX"></output></div>
      <div class="slider"><label class="lbl" for="edY">Hoogte</label><input id="edY" type="range" min="${r.ymin}" max="${r.ymax}" step=".5"><output id="oY"></output></div>
      ${isP?'':`<div class="slider"><label class="lbl" for="edR">Draaien</label><input id="edR" type="range" min="-45" max="45" step="1"><output id="oR"></output></div>`}
      <div class="frow"><label class="fld"><span>Techniek</span><select id="edTech">${techs.map(([k,t])=>`<option value="${k}"${k===l.tech?' selected':''}>${t.name}${k==='advies'?' (aanbevolen)':''}</option>`).join('')}</select></label>
        <label class="fld" id="edColsWrap"${l.tech==='zeef'?'':' hidden'}><span>Kleuren</span><input id="edCols" type="number" min="1" max="8" step="1" value="${l.colors||1}"></label></div>
      <p class="tiphint" id="edHint"></p>
      ${isP?'':`<button class="b" id="edDup">Kopie maken</button>`}
      </div></details>
    ${isP?'':`<button class="b danger" id="edDel">Verwijderen</button>`}`;
  const on=(id,ev,fn)=>{const el=$('#'+id);if(el)el.addEventListener(ev,fn)};
  const changed=full=>{userTouched();markAll();syncEditor();updateReadout();if(full){renderLayers();updateSpec()}else debouncedList()};
  on('edW','input',e=>{l.w=+e.target.value;clampLayer(l);changed()});on('edX','input',e=>{l.x=+e.target.value;changed()});
  on('edH','input',e=>{l.ph=+e.target.value;fitPlayerLayer(l);changed()});
  on('edY','input',e=>{l.y=+e.target.value;changed()});on('edR','input',e=>{l.rot=+e.target.value;changed()});
  on('edTech','change',e=>{l.tech=e.target.value;$('#edColsWrap').hidden=l.tech!=='zeef';changed(true)});
  on('edCols','input',e=>{l.colors=clamp(parseInt(e.target.value)||1,1,8);changed(true)});
  on('edKnock','change',e=>{l.knock=e.target.checked;changed(true)});
  on('edText','input',e=>{l.text=e.target.value.slice(0,40);l.aspect=textAspect(l);clampLayer(l);$('.ed-h strong').textContent=layerName(l);changed()});
  on('edFont','change',e=>{l.font=e.target.value;document.fonts.load(fontSpec(l.font,100)).catch(()=>{}).then(()=>{l.aspect=textAspect(l);if(l.player)fitPlayerLayer(l);l._k=null;changed(true)})});
  on('edColor','input',e=>{l.color=e.target.value;changed()});
  on('edSizes','click',e=>{const b=e.target.closest('button');if(!b)return;l.w=+b.dataset.w;clampLayer(l);changed(true)});
  on('edPresets','click',e=>{const b=e.target.closest('button');if(!b)return;const p=allPresets().find(x=>x.id===b.dataset.p);applyPreset(l,p);userTouched();renderEditor();renderLayers();updateSpec();updateReadout();goView(p.zone)});
  on('edDup','click',()=>{const c=Object.assign({},l,{id:nextId++,_k:null,_b:null});c.x+=3;c.y+=3;clampLayer(c);state.layers.push(c);userTouched();select(c.id);updateSpec();toast('Kopie gemaakt. Sleep hem naar de juiste plek.')});
  on('edDel','click',()=>{const idx=state.layers.indexOf(l);lastDeleted={l,idx};state.layers=state.layers.filter(x=>x.id!==l.id);userTouched();select(null);updateSpec();toast('Bedrukking verwijderd.',{label:'Ongedaan maken',fn:()=>{if(!lastDeleted)return;state.layers.splice(Math.min(lastDeleted.idx,state.layers.length),0,lastDeleted.l);const id=lastDeleted.l.id;lastDeleted=null;select(id,true);updateSpec()}})});
  on('edClose','click',()=>select(null));
  syncEditor();
}
function isAt(l,p){const m=M();return l.zone===p.zone&&Math.abs(l.x-p.x)<.6&&Math.abs(l.y-pv(p.y,m))<.6}
let listT;function debouncedList(){clearTimeout(listT);listT=setTimeout(()=>{renderLayers();updateSpec()},180)}
function syncEditor(){const l=cur();if(!l||!$('#edX'))return;
  if($('#edW')){$('#edW').value=l.w;$('#oW').textContent=`${fmt(l.w)} × ${fmt(l.w*l.aspect)} cm`;document.querySelectorAll('#edSizes button').forEach(b=>b.setAttribute('aria-pressed',Math.abs(+b.dataset.w-l.w)<.3))}
  if($('#edH')){$('#edH').value=l.ph;$('#oH').textContent=`${fmt(l.ph)} cm`}
  document.querySelectorAll('#edPresets button').forEach(b=>{const p=allPresets().find(x=>x.id===b.dataset.p);b.setAttribute('aria-pressed',!!p&&isAt(l,p))});
  $('#edX').value=l.x;$('#oX').textContent=describeX(l);$('#edY').value=l.y;$('#oY').textContent=`${fmt(l.y)} cm`;
  if($('#edR')){$('#edR').value=l.rot;$('#oR').textContent=`${l.rot}°`}
  $('#edHint').textContent=TECH[l.tech].hint;
  const d=$('#edDpi');if(d)d.textContent=l.vector?'Vectorbestand: scherp op elke maat.':`Scherpte op deze maat: ${dpiOf(l)} dpi (300 dpi is ideaal).`;
  const w=warnings(l).concat(playerWarnings(l));$('#edWarn').innerHTML=w.map(x=>`<li>${esc(x)}</li>`).join('');$('#edWarn').hidden=!w.length}
function updateReadout(){const l=cur(),r=$('#readout');if(!l){r.hidden=true;return}r.hidden=false;
  r.innerHTML=`<div class="z">${zoneName(l.zone)}</div><div class="d">${fmt(l.w)} × ${fmt(l.w*l.aspect)} cm</div><div class="p">${describePos(l)}</div>`}

/* ================= team: namen en nummers ================= */
const team=state.team;
function playerLayers(){return state.layers.filter(l=>l.player)}
function fitPlayerLayer(l){l.aspect=textAspect(l);l.w=clamp(l.ph/l.aspect,1,40);l._k=null}
function longestName(){let best=null,bw=0;const l=playerLayers().find(x=>x.player==='naam');if(!l)return null;const keep=team.cur;
  team.players.forEach((p,i)=>{team.cur=i;const w=l.ph/textAspect(l);if(w>bw){bw=w;best=p}});team.cur=keep;return best?{p:best,w:bw}:null}
function playerWarnings(l){if(!l||l.player!=='naam'||!team.players.length)return[];const ln=longestName();
  return ln&&ln.w>30?[`De langste naam (${String(ln.p.naam).toUpperCase()}) wordt ${fmt(ln.w)} cm breed. Kies een kleinere letterhoogte of een smaller lettertype.`]:[]}
function ensurePlayerLayers(){
  const m=M(),hood=m.id==='hoodie',col=lum(colorObj().hex)>.55?'#16181d':'#ffffff';
  if(m.kind==='short'){if(!playerLayers().some(l=>l.player==='nummer'))state.layers.push({id:nextId++,type:'text',player:'nummer',font:'bebas',color:col,tech:'dtf',zone:'sleeveL',x:0,y:36,ph:8,rot:0,w:6,aspect:1});state.layers=state.layers.filter(l=>l.player!=='naam');playerLayers().forEach(fitPlayerLayer);return}
  if(!playerLayers().some(l=>l.player==='naam'))state.layers.push(Object.assign({id:nextId++,type:'text',player:'naam',font:'oswald',color:col,tech:'dtf',zone:'back',x:0,y:hood?22:12,ph:6,rot:0,w:10,aspect:.2}));
  if(!playerLayers().some(l=>l.player==='nummer'))state.layers.push(Object.assign({id:nextId++,type:'text',player:'nummer',font:'bebas',color:col,tech:'dtf',zone:'back',x:0,y:hood?36:28,ph:22,rot:0,w:10,aspect:1}));
  playerLayers().forEach(fitPlayerLayer);
}
function setPlayer(i){if(!team.players.length)return;team.cur=(i+team.players.length)%team.players.length;playerLayers().forEach(fitPlayerLayer);markAll();renderTeam();syncEditor();updateReadout()}
function renderTeam(){
  $('#teamOn').checked=team.on;$('#teamBox').hidden=!team.on;
  $('#teamRows').innerHTML=team.players.map((p,i)=>`<tr data-i="${i}"${i===team.cur?' class="cur"':''}><td><input type="text" data-k="naam" placeholder="Naam" value="${esc(p.naam||'')}" aria-label="Naam speler ${i+1}"></td>
    <td><input type="text" inputmode="numeric" data-k="nummer" placeholder="Nr." value="${esc(p.nummer||'')}" aria-label="Nummer speler ${i+1}"></td>
    <td><select data-k="maat" aria-label="Maat speler ${i+1}">${SIZES.map(s=>`<option${s===p.maat?' selected':''}>${s}</option>`).join('')}</select></td>
    <td><button class="rm" data-rm="${i}" aria-label="Speler ${i+1} verwijderen">×</button></td></tr>`).join('');
  if($('#teamCount'))$('#teamCount').textContent=team.on&&team.players.length?`${team.players.length} spelers`:'';
  const nav=$('#playerNav');nav.hidden=!(team.on&&team.players.length);if(!nav.hidden){const p=team.players[team.cur];$('#pName').textContent=`${p.naam||'Naam'} · ${p.nummer||'–'}`}
  syncSizesFromTeam();
}
function syncSizesFromTeam(){
  const on=team.on&&team.players.length;$('#sizesNote').hidden=!on;
  if(on){SIZES.forEach(s=>state.qty[s]=team.players.filter(p=>p.maat===s).length)}
  SIZES.forEach(s=>{const i=$('#q'+s);if(i){i.value=state.qty[s];i.disabled=!!on}});
}
$('#teamOn').addEventListener('change',e=>{team.on=e.target.checked;userTouched();
  if(team.on){state.layers=state.layers.filter(l=>!(l.sample&&l.zone==='back'));if(!team.players.length)team.players=[{naam:'',nummer:'',maat:'M'}];team.cur=0;ensurePlayerLayers();goView('back');toast('Namen en nummers staan op de rug. U kunt ze aanpassen in stap 2.')}
  else{state.layers=state.layers.filter(l=>!l.player);if(cur()==null)state.sel=null}
  markAll();renderTeam();renderLayers();renderEditor();updateReadout();updateSpec()});
$('#teamRows').addEventListener('input',e=>{const tr=e.target.closest('tr');if(!tr)return;const i=+tr.dataset.i,k=e.target.dataset.k;team.players[i][k]=e.target.value;
  if(i===team.cur){playerLayers().forEach(fitPlayerLayer);markAll();updateReadout()}
  const nav=$('#pName');if(nav&&team.players[team.cur])nav.textContent=`${team.players[team.cur].naam||'Naam'} · ${team.players[team.cur].nummer||'–'}`;
  if(k==='maat')syncSizesFromTeam();syncEditor();debouncedList()});
$('#teamRows').addEventListener('focusin',e=>{const tr=e.target.closest('tr');if(tr&&+tr.dataset.i!==team.cur){team.cur=+tr.dataset.i;playerLayers().forEach(fitPlayerLayer);markAll();$('#teamRows').querySelectorAll('tr').forEach(r=>r.classList.toggle('cur',+r.dataset.i===team.cur));const p=team.players[team.cur];$('#pName').textContent=`${p.naam||'Naam'} · ${p.nummer||'–'}`;updateReadout()}});
$('#teamRows').addEventListener('click',e=>{const b=e.target.closest('[data-rm]');if(!b)return;team.players.splice(+b.dataset.rm,1);if(team.cur>=team.players.length)team.cur=Math.max(0,team.players.length-1);playerLayers().forEach(fitPlayerLayer);markAll();renderTeam();updateSpec()});
$('#addPlayer').addEventListener('click',()=>{team.players.push({naam:'',nummer:String(team.players.length+1),maat:'L'});team.cur=team.players.length-1;playerLayers().forEach(fitPlayerLayer);markAll();renderTeam();updateSpec();const ins=$('#teamRows').querySelectorAll('tr:last-child input');if(ins[0])ins[0].focus()});
$('#pasteToggle').addEventListener('click',()=>{$('#pasteBox').hidden=!$('#pasteBox').hidden;if(!$('#pasteBox').hidden)$('#pasteArea').focus()});
$('#pasteApply').addEventListener('click',()=>{
  const rows=$('#pasteArea').value.split(/\r?\n/).map(r=>r.trim()).filter(Boolean),out=[];
  for(const r of rows){const c=r.split(/\t|;|,/).map(x=>x.trim()).filter(x=>x!=='');if(!c.length)continue;
    let maat=c.find(x=>SIZES.includes(x.toUpperCase()));const nr=c.find(x=>/^\d{1,3}$/.test(x));const naam=c.find(x=>x!==maat&&x!==nr)||'';
    if(/^naam$/i.test(naam))continue;out.push({naam,nummer:nr||'',maat:maat?maat.toUpperCase():'L'})}
  if(!out.length){toast('Geen spelers gevonden. Zet per regel een naam, nummer en maat.');return}
  team.players=out;team.cur=0;playerLayers().forEach(fitPlayerLayer);markAll();$('#pasteArea').value='';$('#pasteBox').hidden=true;renderTeam();renderLayers();syncEditor();updateSpec();toast(`${out.length} spelers overgenomen`)});
$('#pPrev').addEventListener('click',()=>setPlayer(team.cur-1));$('#pNext').addEventListener('click',()=>setPlayer(team.cur+1));

/* ================= aantallen ================= */
$('#sizes').innerHTML=SIZES.map(s=>`<label for="q${s}">${s}<input id="q${s}" type="number" min="0" step="1" inputmode="numeric" value="${state.qty[s]}"></label>`).join('');
$('#sizes').addEventListener('input',e=>{const s=e.target.id.slice(1);if(!(s in state.qty))return;state.qty[s]=clamp(parseInt(String(e.target.value).replace(/\D/g,''))||0,0,9999);userTouched();updateSpec();hideStepMsg()});
$('#sizes').addEventListener('focusout',e=>{const s=e.target.id.slice(1);if(s in state.qty)e.target.value=state.qty[s]});
$('#sizes').addEventListener('focusin',e=>{if(e.target.select)setTimeout(()=>e.target.select(),0)});
const totalQty=()=>SIZES.reduce((a,s)=>a+state.qty[s],0);

/* ================= prijsindicatie ================= */
const TAR=window.IG_TARIEVEN||{toonPrijzen:false};
const eur=v=>'€ '+v.toFixed(2).replace('.',',').replace(/\B(?=(\d{3})+(?!\d))/g,'.');
function priceCalc(){
  const q=totalQty(),T=TAR.techniek,lines=[];let perStuk=(TAR.kledingstuk[state.model]||0),setup=0;const notes=[];
  lines.push([`${M().name} (${q} ×)`,(TAR.kledingstuk[state.model]||0)*q]);
  for(const l of state.layers){if(l.player)continue;const area=l.w*l.w*l.aspect;let p=0,s=0;
    if(l.tech!=='zeef'&&l.tech!=='bord'){p=Math.max(T.dtf.minimumPerStuk,area*T.dtf.perCm2);s=T.dtf.opstartkosten||0}
    else if(l.tech==='zeef'){const k=l.colors||1;p=k*T.zeef.perKleurPerStuk;s=k*T.zeef.zeefPerKleur;if(q&&q<T.zeef.minimumAantal)notes.push(`Zeefdruk is pas voordelig vanaf ${T.zeef.minimumAantal} stuks. DTF is dan vaak goedkoper.`)}
    else{const st=area*T.bord.stekenPerCm2*(l.type==='text'?.55:1);p=Math.max(T.bord.minimumPerStuk,st/1000*T.bord.per1000Steken);s=T.bord.programmeerkosten||0}
    perStuk+=p;setup+=s;lines.push([`${layerName(l)} · ${zoneName(l.zone).toLowerCase()} · ${TECH[l.tech].name}`,p*q])}
  if(team.on&&team.players.length){const pp=(TAR.speler.naam||0)+(TAR.speler.nummer||0);perStuk+=pp;lines.push([`Naam en nummer per speler`,pp*q])}
  const st=(TAR.staffel||[]).filter(s=>q>=s.vanaf).pop()||{korting:0};
  const sub=perStuk*q,korting=sub*st.korting/100,total=sub-korting+setup;
  return{q,lines,setup,korting,kortingPct:st.korting,total,incl:total*(1+TAR.btwPercentage/100),per:q?total/q:0,notes:[...new Set(notes)]};
}
function updatePrice(){
  const sec=$('#priceSec');if(!TAR.toonPrijzen){sec.hidden=true;return}
  const c=priceCalc(),box=$('#price');
  if(!c.q){box.innerHTML='<div class="per"><span>Vul de aantallen in voor een prijsindicatie.</span></div>';return}
  box.innerHTML=`<table><tbody>${c.lines.map(([a,b])=>`<tr><td>${esc(a)}</td><td>${eur(b)}</td></tr>`).join('')}
    ${c.setup?`<tr class="sub"><td>Eenmalige opstartkosten</td><td>${eur(c.setup)}</td></tr>`:''}
    ${c.korting?`<tr class="sub"><td>Staffelkorting ${c.kortingPct}%</td><td>− ${eur(c.korting)}</td></tr>`:''}
    <tr class="tot"><td>Totaal excl. btw</td><td>${eur(c.total)}</td></tr></tbody></table>
    <div class="per"><span>Per stuk <b>${eur(c.per)}</b></span><span>Incl. btw ${eur(c.incl)}</span></div>
    ${c.notes.map(n=>`<div class="per" style="background:var(--warn-soft);color:var(--warn)">${esc(n)}</div>`).join('')}`;
}

/* ================= specificatie ================= */
function specText(){
  const total=totalQty();
  const lines=['AANVRAAG BEDRUKKING · 3D-ontwerptool Intersport Goes',`Kledingstuk  ${M().name} (basismodel), kleur ${colorObj().name}`,`Aantallen    ${SIZES.filter(s=>state.qty[s]).map(s=>`${s} ${state.qty[s]}`).join(' · ')||'nog in te vullen'}${total?`  (totaal ${total})`:''}`,''];
  if(!state.layers.length)lines.push('Nog geen bedrukkingen.');
  state.layers.forEach((l,i)=>{const what=l.player?`${layerName(l)} (${FONTS[l.font].name}, ${l.color.toUpperCase()}, letterhoogte ${fmt(l.ph)} cm)`:l.type==='text'?`Tekst “${l.text}” (${FONTS[l.font].name}, ${l.color.toUpperCase()})`:`Logo ${l.name}${l.knock?' (witte achtergrond weg)':''}`;
    lines.push(`${i+1}. ${what}`,`   ${zoneName(l.zone)}: ${describePos(l)}`,`   ${l.player?'ca. ':''}${fmt(l.w)} × ${fmt(l.w*l.aspect)} cm${l.rot?`, ${l.rot}° gedraaid`:''} · ${TECH[l.tech].name}${l.tech==='zeef'?` · ${l.colors||1} drukkleur${(l.colors||1)>1?'en':''}`:''}${l.type==='image'&&!l.vector?` · ${dpiOf(l)} dpi`:''}`);
    warnings(l).concat(playerWarnings(l)).forEach(w=>lines.push(`   ! ${w}`))});
  if(team.on&&team.players.length){lines.push('','SPELERSLIJST (naam · nummer · maat)');team.players.forEach((p,i)=>lines.push(`${String(i+1).padStart(2,' ')}. ${(p.naam||'').toUpperCase()} · ${p.nummer||'-'} · ${p.maat}`))}
  if(TAR.toonPrijzen&&total){const c=priceCalc();lines.push('',`Prijsindicatie: ${eur(c.total)} excl. btw (${eur(c.per)} per stuk)`)}
  return lines.join('\n');
}
function updateSpec(){
  const total=totalQty();$('#qtyTotal').textContent=total?`${total} ${total===1?'stuk':'stuks'}`:'';
  $('#spec').textContent=specText();updatePrice();scheduleSave();
}
$('#copy').addEventListener('click',()=>{const t=specText();const fb=()=>{$('.spec-d').open=true;const r=document.createRange();r.selectNodeContents($('#spec'));const s=getSelection();s.removeAllRanges();s.addRange(r);toast('Tekst geselecteerd. Kopieer met Ctrl+C of ⌘C.')};
  try{navigator.clipboard.writeText(t).then(()=>toast('Specificatie gekopieerd'),fb)}catch(e){fb()}});

/* ================= logo's toevoegen ================= */
function thumbFrom(c){const s=80/Math.max(c.width,c.height),t=canvas(Math.max(1,Math.round(c.width*s)),Math.max(1,Math.round(c.height*s)));t.getContext('2d').drawImage(c,0,0,t.width,t.height);return t.toDataURL()}
function addImage(o,preset){
  const l=newLayer({type:'image',name:o.name,src:o.src,vector:o.vector,srcW:o.srcW,aspect:o.src.height/o.src.width,thumb:thumbFrom(o.src),tech:o.tech||'dtf',colors:2,file:o.file||null});
  const sh=M().kind==='short';const p=allPresets().find(x=>x.id===preset&&presetsFor(M()).includes(x))||allPresets().find(x=>x.id===(sh?(state.layers.some(y=>y!==l&&y.zone==='front')?'legL':'hipL'):(state.layers.some(y=>y!==l&&y.zone==='front')?'backBig':'chestL')));
  applyPreset(l,p);if(o.w)l.w=o.w;if(o.y!=null)l.y=o.y;clampLayer(l);return l;
}
function loadFile(file){
  if(!file)return;if(/heic|heif/i.test(file.type+file.name)){toast('iPhone-foto’s (HEIC) kunnen hier niet worden geopend. Maak een schermafbeelding van uw logo en upload die.');return}
  if(!/^image\/(png|jpeg|webp|svg\+xml)$/.test(file.type)){toast(/pdf|postscript|illustrator|eps/i.test(file.type+file.name)?'PDF-, AI- en EPS-bestanden kunnen hier niet worden getoond. Upload een PNG- of JPG-voorbeeld; het origineel kunt u later mailen.':'Dit bestandstype werkt niet. Kies een PNG-, JPG- of SVG-bestand.');return}
  if(file.size>15*1024*1024){toast('Dit bestand is groter dan 15 MB.');return}
  const fr=new FileReader();fr.onload=()=>{const img=new Image();img.onload=()=>{
    const vector=file.type==='image/svg+xml',w=img.naturalWidth||1000,h=img.naturalHeight||1000,s=vector?2000/Math.max(w,h):Math.min(1,2400/Math.max(w,h));
    const c=canvas(Math.max(1,Math.round(w*s)),Math.max(1,Math.round(h*s)));c.getContext('2d').drawImage(img,0,0,c.width,c.height);
    if(state.sample){state.layers=state.layers.filter(l=>!l.sample)}
    const l=addImage({name:file.name,src:c,vector,srcW:vector?Infinity:w,file});if(file.type==='image/jpeg')l.knock=true;
    userTouched();select(l.id,true);updateSpec();toast(file.type==='image/jpeg'?'Logo geplaatst. De witte achtergrond is weggehaald. Sleep het logo om het te verplaatsen.':'Logo geplaatst. Sleep het om het te verplaatsen, of kies hieronder een plek.')};
    img.onerror=()=>toast('Dit bestand kan niet worden gelezen.');img.src=fr.result};fr.readAsDataURL(file);
}
$('#upload').addEventListener('change',e=>{loadFile(e.target.files[0]);e.target.value=''});
$('#uploadBtn').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('#upload').click()}});
$('#addText').addEventListener('click',()=>{const l=newLayer({type:'text',text:'UW TEKST',font:'oswald',color:lum(colorObj().hex)>.55?'#16181d':'#ffffff',tech:'advies',colors:1});
  applyPreset(l,allPresets().find(p=>p.id===(M().kind==='short'?'backC':'backName')));l.aspect=textAspect(l);clampLayer(l);userTouched();select(l.id,true);updateSpec();setTimeout(()=>{const t=$('#edText');if(t){t.focus();t.select()}},50)});

/* ================= voorbeeldontwerp ================= */
const SAMPLE_SVG=`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="240" viewBox="0 0 600 240">
<rect x="8" y="8" width="584" height="224" rx="28" fill="none" stroke="#ffffff" stroke-width="12" stroke-dasharray="26 16"/>
<circle cx="112" cy="120" r="62" fill="#e20917"/><path d="M84 152 L112 86 L140 152 Z" fill="#ffffff"/>
<text x="206" y="146" font-family="Arial Black, Arial, Helvetica, sans-serif" font-weight="900" font-size="78" fill="#ffffff" textLength="300" lengthAdjust="spacingAndGlyphs">UW LOGO</text></svg>`;
function sampleCanvas(){return new Promise(res=>{const img=new Image();img.onload=()=>{const c=canvas(1500,600);c.getContext('2d').drawImage(img,0,0,1500,600);res(c)};img.onerror=()=>res(null);img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(SAMPLE_SVG)})}
async function loadSample(){const c=await sampleCanvas();if(!c)return;
  const a=addImage({name:'uw-logo.svg',src:c,vector:true,srcW:Infinity,tech:'bord',w:9.5},'chestL');a.sample=true;
  const b=addImage({name:'uw-logo.svg',src:c,vector:true,srcW:Infinity,tech:'dtf',w:26,y:17},'backBig');b.sample=true;
  const t=newLayer({type:'text',text:'UW TEKST',font:'oswald',color:'#ffffff',tech:'dtf',zone:'back',x:0,y:29,w:18,colors:1});t.aspect=textAspect(t);t.sample=true}

/* ================= opnames (afbeelding, aanvraag) ================= */
function capture(view,w,h){
  const keepPos=camera.position.clone(),keepT=controls.target.clone(),keepTween=tween,keepGuides=state.guides,keepAspect=camera.aspect,size=new THREE.Vector2();R.getSize(size);
  tween=null;state.guides=false;markAll();redraw();
  R.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();goView(view,true);R.render(scene,camera);
  const url=R.domElement.toDataURL('image/png');
  R.setSize(size.x,size.y,false);camera.aspect=keepAspect;camera.updateProjectionMatrix();camera.position.copy(keepPos);controls.target.copy(keepT);controls.update();tween=keepTween;
  state.guides=keepGuides;markAll();setActiveView('');return url;
}
const loadImg=src=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=src});
async function composeSheet(){
  const fr=await loadImg(capture('front',900,900)),bk=await loadImg(capture('back',900,900)),logo=await loadImg('logo.svg');
  const W=1800,H=1150,c=canvas(W,H),g=c.getContext('2d');g.fillStyle='#ffffff';g.fillRect(0,0,W,H);
  const grd=g.createRadialGradient(W/2,560,50,W/2,560,900);grd.addColorStop(0,'#f8f9fb');grd.addColorStop(1,'#e4e8ef');g.fillStyle=grd;g.fillRect(0,120,W,860);
  if(logo)g.drawImage(logo,60,40,300,61);
  g.fillStyle='#121826';g.font='700 34px Archivo, Arial, sans-serif';g.textAlign='right';g.fillText(`${M().name} · ${colorObj().name}`,W-60,72);
  g.font='400 22px Archivo, Arial, sans-serif';g.fillStyle='#555d6e';g.fillText(new Date().toLocaleDateString('nl-NL',{day:'numeric',month:'long',year:'numeric'}),W-60,104);g.textAlign='left';
  if(fr)g.drawImage(fr,0,120,900,900);if(bk)g.drawImage(bk,900,120,900,900);
  g.font='700 20px Archivo, Arial, sans-serif';g.fillStyle='#144390';g.fillText('VOORKANT',60,160);g.fillText('ACHTERKANT',960,160);
  g.font='400 19px Archivo, Arial, sans-serif';g.fillStyle='#121826';
  const items=state.layers.map(l=>`${zoneName(l.zone)}: ${layerName(l)} · ${fmt(l.w)} × ${fmt(l.w*l.aspect)} cm · ${TECH[l.tech].name}`);
  items.slice(0,4).forEach((t,i)=>g.fillText(t,60+(i%2)*870,1030+Math.floor(i/2)*32));
  g.font='400 16px Archivo, Arial, sans-serif';g.fillStyle='#555d6e';g.fillText('Indicatie, geen drukproef. Intersport Goes · Kreukelmarkt 53, Goes · 0113 - 27 08 60 · info@intersportgoes.nl',60,H-24);
  return c;
}
$('#download').addEventListener('click',async()=>{try{const c=await composeSheet();const a=document.createElement('a');a.href=c.toDataURL('image/png');a.download=`ontwerp-${state.model}-${state.color}.png`;document.body.appendChild(a);a.click();a.remove();toast('Afbeelding gedownload')}catch(e){toast('Downloaden is niet gelukt.')}});

/* ================= offerte aanvragen ================= */
const dlg=$('#reqDialog');
$('#openRequest').addEventListener('click',()=>{
  if(!totalQty()){goStep(3);showStepMsg('Vul eerst in hoeveel stuks u wilt.');return}
  $('#reqImg').src=capture('front',480,480);const q=totalQty();
  $('#reqSum').innerHTML=`<b>${M().name}, ${colorObj().name}</b><br>${state.layers.length?`${state.layers.length} bedrukking${state.layers.length>1?'en':''}`:'nog zonder ontwerp'} · ${q?q+(q===1?' stuk':' stuks'):'aantal nog onbekend'}${TAR.toonPrijzen&&q?`<br>Indicatie ${eur(priceCalc().total)} excl. btw`:''}`;
  $('#reqForm').hidden=false;$('#reqDone').hidden=true;$('#reqErr').hidden=true;
  if(dlg.showModal)dlg.showModal();else dlg.setAttribute('open','');
});
const closeDlg=()=>{if(dlg.close)dlg.close();else dlg.removeAttribute('open')};
$('#reqClose').addEventListener('click',closeDlg);$('#reqDoneClose').addEventListener('click',closeDlg);
const toBlob=url=>fetch(url).then(r=>r.blob());
const CFG=window.IG_CONFIG||{verzenden:'php'};
async function sendRequest(fd){
  if(CFG.verzenden!=='formsubmit'){const r=await fetch('aanvraag.php',{method:'POST',body:fd});const j=await r.json().catch(()=>null);if(!r.ok||!j||!j.ok)throw new Error(j&&j.error||'server');return}
  // FormSubmit: gewone multipart-post in een verborgen iframe (bijlagen worden meegestuurd)
  if(fd.get('website'))return;
  const total=[...fd.values()].reduce((a,v)=>a+(v instanceof Blob?v.size:0),0);if(total>9.5*1024*1024)throw new Error('de bestanden zijn samen groter dan 10 MB');
  const name='fs_'+Date.now(),ifr=document.createElement('iframe');ifr.name=name;ifr.hidden=true;document.body.appendChild(ifr);
  const form=document.createElement('form');form.method='POST';form.action='https://formsubmit.co/'+encodeURIComponent(CFG.ontvanger);form.enctype='multipart/form-data';form.target=name;form.hidden=true;
  const add=(k,v)=>{const i=document.createElement('input');i.type='hidden';i.name=k;i.value=v;form.appendChild(i)};
  add('_subject',`Aanvraag 3D-ontwerp: ${fd.get('organisatie')||fd.get('naam')}`);add('_template','table');add('_captcha','false');add('_replyto',fd.get('email'));
  for(const [k,v] of [['Naam','naam'],['Bedrijf of club','organisatie'],['Soort klant','klanttype'],['E-mail','email'],['Telefoon','telefoon'],['Gewenste leverdatum','leverdatum'],['Opmerkingen','bericht'],['Specificatie','specificatie']])add(k,fd.get(v)||'-');
  let n=0;for(const v of fd.getAll('bestanden[]')){if(!(v instanceof Blob))continue;const dt=new DataTransfer();dt.items.add(v instanceof File?v:new File([v],'bestand-'+(n+1)+'.png',{type:v.type}));const i=document.createElement('input');i.type='file';i.name='bijlage_'+(++n);i.files=dt.files;form.appendChild(i)}
  document.body.appendChild(form);
  await new Promise((res,rej)=>{const t=setTimeout(()=>rej(new Error('geen reactie van de verzenddienst')),45000);ifr.addEventListener('load',()=>{clearTimeout(t);res()},{once:true});form.submit()});
  setTimeout(()=>{form.remove();ifr.remove()},2000);
}
$('#reqForm').addEventListener('submit',async e=>{
  e.preventDefault();const f=e.target,err=$('#reqErr'),btn=$('#reqSend');if(!f.checkValidity()){f.reportValidity();return}
  btn.disabled=true;btn.textContent='Versturen…';err.hidden=true;
  try{
    const fd=new FormData(f);fd.append('type','configurator');fd.append('specificatie',specText());fd.append('onderwerp',`3D-ontwerp ${M().name}, ${colorObj().name}`);
    fd.append('ontwerp',JSON.stringify(serialize(false)));
    const small=CFG.verzenden==='formsubmit';
    for(const [v,nm] of [['front','voorkant'],['back','achterkant']]){let u=capture(v,small?800:1000,small?800:1000);if(small){const im=await loadImg(u),c=canvas(im.width,im.height),g=c.getContext('2d');g.fillStyle='#ffffff';g.fillRect(0,0,c.width,c.height);g.drawImage(im,0,0);u=c.toDataURL('image/jpeg',.85)}
      fd.append('bestanden[]',new File([await toBlob(u)],`voorbeeld-${nm}.${small?'jpg':'png'}`,{type:small?'image/jpeg':'image/png'}))}
    const seen=new Set();for(const l of state.layers){if(l.type!=='image'||l.sample)continue;
      if(l.file&&!seen.has(l.file)){seen.add(l.file);fd.append('bestanden[]',l.file,l.file.name)}
      else if(!l.file&&!seen.has(l.name)){seen.add(l.name);fd.append('bestanden[]',await toBlob(l.src.toDataURL('image/png')),l.name.replace(/\.\w+$/,'')+'.png')}}
    await sendRequest(fd);
    $('#reqForm').hidden=true;$('#reqDone').hidden=false;f.reset();
  }catch(x){err.hidden=false;err.innerHTML=`Versturen is niet gelukt${x&&x.message&&x.message!=='server'&&x.message!=='Failed to fetch'?' ('+esc(x.message)+')':''}. Kopieer uw specificatie met de knop in het paneel en mail die naar <b>info@intersportgoes.nl</b>, of bel 0113 - 27 08 60.`}
  finally{btn.disabled=false;btn.textContent='Aanvraag versturen'}
});

/* ================= opslaan in de browser ================= */
const KEY='ig-ontwerp-v1';let saveT=null,restoring=false;
function serialize(withImages){return{v:1,model:state.model,color:state.color,qty:state.qty,team:{on:team.on,players:team.players,cur:team.cur},
  layers:state.layers.map(l=>{const o={};for(const k of ['type','name','zone','x','y','w','rot','tech','aspect','knock','vector','srcW','text','font','color','player','ph','colors','sample'])if(l[k]!==undefined)o[k]=l[k];
    if(o.srcW===Infinity)o.srcW=null;if(withImages&&l.type==='image'){const s=l.src,k=Math.min(1,1000/Math.max(s.width,s.height)),c=canvas(Math.round(s.width*k),Math.round(s.height*k));c.getContext('2d').drawImage(s,0,0,c.width,c.height);o.img=c.toDataURL('image/png')}return o})}}
function scheduleSave(){if(restoring||RENDER)return;clearTimeout(saveT);saveT=setTimeout(()=>{if(state.sample)return;try{localStorage.setItem(KEY,JSON.stringify(serialize(true)))}catch(e){}},800)}
async function restore(){
  let d=null;try{d=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}
  if(!d||d.v!==1||!MODELS[d.model])return false;restoring=true;
  state.model=d.model;state.color=COLORS.some(c=>c.id===d.color)?d.color:state.color;Object.assign(state.qty,d.qty||{});
  Object.assign(team,d.team||{});state.layers=[];
  for(const o of d.layers||[]){const l=Object.assign({id:nextId++,rot:0},o);if(!TECH[l.tech])l.tech='advies';if(l.srcW==null&&l.type==='image')l.srcW=Infinity;
    if(l.type==='image'){const img=await loadImg(o.img);if(!img)continue;const c=canvas(img.width,img.height);c.getContext('2d').drawImage(img,0,0);l.src=c;l.thumb=thumbFrom(c);delete l.img}
    state.layers.push(l)}
  state.sample=false;restoring=false;return true;
}
$('#resetDesign').addEventListener('click',e=>{const b=e.currentTarget;if(!b.dataset.sure){b.dataset.sure='1';b.textContent='Zeker weten? Klik nogmaals';setTimeout(()=>{delete b.dataset.sure;b.textContent='Opnieuw beginnen'},4000);return}
  try{localStorage.removeItem(KEY)}catch(x){}
  state.layers=[];team.on=false;team.players=[];team.cur=0;state.sel=null;SIZES.forEach(z=>state.qty[z]=0);$('#restore').hidden=true;state.sample=false;
  buildGarment();drawBases();markAll();renderGarmentUI();renderTeam();renderLayers();renderEditor();updateReadout();updateSpec();goStep(1);goView('start')});

/* ================= stappen ================= */
function stepValid(n){
  if(n===2&&!state.layers.length)return 'U heeft nog geen logo of tekst geplaatst. Klik nogmaals op Volgende om zonder ontwerp verder te gaan; wij nemen dan contact met u op over het ontwerp.';
  if(n===2&&state.layers.some(l=>l.type==='text'&&!l.player&&!String(l.text||'').trim()))return 'Er staat nog een lege tekst op het kledingstuk. Typ uw tekst of verwijder hem.';
  if(n===3&&team.on&&(!team.players.length||team.players.some(p=>!String(p.naam||'').trim()&&!String(p.nummer||'').trim())))return 'Niet elke speler heeft een naam of nummer. Vul de lijst aan of verwijder lege regels.';
  if(n===3&&!totalQty())return 'Vul bij minstens één maat in hoeveel stuks u wilt.';
  return null}
let skipOnce=null;
function showStepMsg(t){const m=$('#stepMsg');m.textContent=t;m.hidden=false}
function hideStepMsg(){const m=$('#stepMsg');if(m)m.hidden=true;skipOnce=null}
const STEPNEXT={1:'Volgende: logo of tekst',2:'Volgende: aantallen',3:'Volgende: controleren'};
function goStep(n,keepScroll){
  n=clamp(n,1,4);curStep=n;hideStepMsg();
  document.querySelectorAll('.step').forEach(s=>s.hidden=+s.dataset.step!==n);
  document.querySelectorAll('#steps button').forEach(b=>{const k=+b.dataset.go;b.toggleAttribute('aria-current',k===n);if(k===n)b.setAttribute('aria-current','step');b.classList.toggle('done',k<n)});
  $('#prevStep').hidden=n===1;$('#stepnav').classList.toggle('static',n===4);$('#nextStep').hidden=n===4;$('#nextStep').textContent=STEPNEXT[n]||'Volgende';
  if(n===4)renderReview();
  if(n!==2&&state.sel!==null){state.sel=null;markAll();renderLayers();renderEditor();updateReadout()}
  if(!keepScroll){const pn=$('.panel');if(pn&&pn.scrollHeight>pn.clientHeight)pn.scrollTop=0;else{const st=document.querySelector('.wsteps');if(st&&st.getBoundingClientRect().top<0)st.scrollIntoView({block:'start'})}}
}
$('#nextStep').addEventListener('click',()=>{const msg=stepValid(curStep);
  if(msg){if(curStep===2&&!state.layers.length&&skipOnce===2){goStep(3);return}showStepMsg(msg);if(curStep===2&&!state.layers.length)skipOnce=2;return}
  goStep(curStep+1)});
$('#prevStep').addEventListener('click',()=>goStep(curStep-1));
$('#steps').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const k=+b.dataset.go;
  if(k<=curStep){goStep(k);return}
  for(let i=curStep;i<k;i++){const msg=stepValid(i);if(msg&&!(i===2&&!state.layers.length)){goStep(i);showStepMsg(msg);return}}goStep(k)});
function renderReview(){
  const q=totalQty(),sz=SIZES.filter(z=>state.qty[z]).map(z=>`${z}: ${state.qty[z]}`).join(' · ');
  const issues=state.layers.flatMap(l=>warnings(l).concat(playerWarnings(l)).map(w=>`${layerName(l)}: ${w}`));
  $('#review').innerHTML=`<div class="rv-img"><img alt="Voorkant" src="${capture('front',360,360)}"><img alt="Achterkant" src="${capture('back',360,360)}"></div>
    <dl class="rv">
      <dt>Kledingstuk</dt><dd>${M().name}, ${colorObj().name} <button class="lnk" data-go="1">wijzig</button></dd>
      <dt>Ontwerp</dt><dd>${state.layers.length?state.layers.map(l=>`${esc(layerName(l))} · ${zoneName(l.zone).toLowerCase()} · ${fmt(l.w,0)} cm`).join('<br>'):'Nog geen ontwerp; wij nemen contact met u op.'} <button class="lnk" data-go="2">wijzig</button></dd>
      <dt>Aantal</dt><dd>${q} ${q===1?'stuk':'stuks'}${sz?` (${sz})`:''}${team.on&&team.players.length?`<br>${team.players.length} ${team.players.length===1?'speler':'spelers'} met naam en nummer`:''} <button class="lnk" data-go="3">wijzig</button></dd>
    </dl>
    ${issues.length?`<ul class="warns">${issues.map(w=>`<li>${esc(w)}</li>`).join('')}</ul><p class="fine">U kunt toch aanvragen; wij lopen deze punten met u door.</p>`:''}`;
}
$('#review').addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b)goStep(+b.dataset.go)});
$('#startText').addEventListener('click',()=>{goStep(2);$('#addText').click()});
$('#helpBtn').addEventListener('click',e=>{const h=$('#helpBox');h.hidden=!h.hidden;e.currentTarget.setAttribute('aria-expanded',!h.hidden)});
$('#helpClose').addEventListener('click',()=>{$('#helpBox').hidden=true;$('#helpBtn').setAttribute('aria-expanded','false')});

/* ================= start ================= */
const RENDER=new URLSearchParams(location.search).get('render');
try{const d=$('#r-datum');if(d)d.min=new Date().toISOString().slice(0,10)}catch(e){}
const fontsReady=Promise.race([Promise.all(Object.keys(FONTS).map(k=>document.fonts.load(fontSpec(k,100)))),new Promise(r=>setTimeout(r,2500))]).catch(()=>{});
buildGarment();drawBases();renderGarmentUI();renderLayers();renderEditor();updateSpec();resize();goView('start',true);requestAnimationFrame(frame);
fontsReady.then(async()=>{
  if(RENDER){await renderMode(RENDER);return}
  const restored=await restore();
  if(restored){$('#restore').hidden=false}
  state.layers.forEach(l=>{if(l.type==='text'){l.aspect=textAspect(l);l._k=null}});playerLayers().forEach(fitPlayerLayer);
  state.sel=null;
  buildGarment();drawBases();markAll();renderGarmentUI();renderTeam();renderLayers();renderEditor();updateReadout();updateSpec();setActiveView('');goView('start',true);goStep(restored&&state.layers.length?(totalQty()?4:3):1,true);updateStartCta();
});

/* ================= render-modus voor website-afbeeldingen ================= */
async function renderMode(spec){
  // ?render=model,kleur,aanzicht,inhoud   inhoud: logo | team | rug
  const [model,color,view,content]=spec.split(',');state.model=MODELS[model]?model:'polo';state.color=color||'navy';state.layers=[];
  const c=await sampleCanvas();
  if(content==='logo'||content==='rug'){const a=addImage({name:'logo',src:c,vector:true,srcW:Infinity,tech:'bord',w:9.5},'chestL');a.sample=true;}
  if(content==='rug'){const b=addImage({name:'logo',src:c,vector:true,srcW:Infinity,tech:'dtf',w:26,y:15},'backBig');}
  if(content==='team'){team.on=true;team.players=[{naam:'Jansen',nummer:'10',maat:'L'}];team.cur=0;ensurePlayerLayers();playerLayers().forEach(fitPlayerLayer);
    const a=addImage({name:'logo',src:c,vector:true,srcW:Infinity,tech:'dtf',w:9},'chestL')}
  buildGarment();drawBases();markAll();redraw();
  window.__render=capture(view||'front',1200,1200);
}
})();
