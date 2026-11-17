// ぼうかぞえ (ROADMAP 18, 2026-11-17): the special 5th problem under たしざん. A stick figure from a railway scene (パンタグラフ, てっきょう, しんごうき, でんきの はしら, えき, せんろ) is drawn; the answer is the number of sticks. Shared sticks count once (the child wrote 14 for the 12 sticks of a house at school, counting the shared ones twice).
// A problem is {kind:'sticks', a: scene (0 to 6), b: seed, result: the number of sticks}; shape(a, b) builds the same figure again, so only the seed is saved. Every stick has the same length (1), and each is drawn a little apart from the next, so sticks in a line still look like separate sticks.
// The size changes each time (a bridge of 3 to 9 triangles, a station of 1 to 3 rooms and 1 or 2 floors...), so the child cannot learn a number per scene (ゆかりさん).
// In the browser, mount draws a problem into an element: tap a stick to color it (with its tap order when the person's ばんごう is on, おうちの方へ), wrong gives the hint (2nd wrong: the shared sticks or the untapped ones light up), win runs the reward (a train, a green signal, sparks).
(function(root){
'use strict';
const H=Math.sqrt(3)/2,U=100,GAP=11;
const poly=(name,c,...pts)=>({name,c,pts,closed:true}),line=(name,c,...pts)=>({name,c,pts,closed:false});
function warren(n,c,x0=0,y0=0){const ps=[];for(let k=0;k<n;k++){const j=k>>1;ps.push(poly('さんかく',c,...(k%2===0?[[x0+j,y0],[x0+j+1,y0],[x0+j+.5,y0+H]]:[[x0+j+.5,y0+H],[x0+j+1.5,y0+H],[x0+j+1,y0]])));}return ps;}
const sq=(x,y,c,extra={})=>({...poly('しかく',c,[x,y],[x+1,y],[x+1,y+1],[x,y+1]),...extra});
// The elbow of an arm of two sticks from B to T: the point 1 away from both, on the given side.
function knee(B,T,side){const dx=T[0]-B[0],dy=T[1]-B[1],d=Math.hypot(dx,dy),h=Math.sqrt(Math.max(0,1-d*d/4)),mx=B[0]+dx/2,my=B[1]+dy/2,p=[mx-dy/d*h,my+dx/d*h],q=[mx+dy/d*h,my-dx/d*h];return (p[0]<q[0])===(side<0)?p:q;}
const RED='#c9412a',STEEL='#7c8996',DARK='#39424a',WOOD='#7a4f30',ROOF='#b8372a',SIG='#5f6c78';
// Seeded, so a saved seed gives the same figure.
function rng(seed){let t=seed>>>0;return ()=>{t=t+0x6D2B79F5>>>0;let r=Math.imul(t^t>>>15,1|t);r=r+Math.imul(r^r>>>7,61|r)^r;return ((r^r>>>14)>>>0)/4294967296;};}
// パンタグラフ: the diamond (all four arms meeting at one point at the top and bottom) or the single arm the child likes; one or two on the roof, and a pan of 1 or 2 sticks each side.
const SCENES=[
  {scene:'panta',what:'パンタグラフ',yomi:'パンタグラフ',make(pick,r){const two=r()<.3,ts=(two?[0,0]:[0]).map(()=>pick(['ひしがた','シングル','シングル'])),ks=ts.map(()=>pick([1,2])),TOP=1.2,ps=[],bases=[],sp=Math.max(2.4,ks[0]+(ks[1]||0)+.8);
    ts.forEach((t,n)=>{const cx=two?(n?sp/2:-sp/2):0,k=ks[n],tx=t==='シングル'?cx+.2:cx;bases.push(cx);if(t==='ひしがた')ps.push(poly('ひしがた',DARK,[cx,0],[cx+.8,.6],[cx,TOP],[cx-.8,.6]));else{const B=[cx+.4,0],T=[tx,TOP];ps.push(line('うで',DARK,B,knee(B,T,-1),T));}ps.push(line('うえの ぼう',DARK,...Array.from({length:2*k+1},(_,i)=>[tx-k+i,TOP])));});
    return {pieces:ps,bases,wireY:TOP,all:two};}},
  {scene:'bridge',what:'てっきょう',yomi:'鉄橋',make(pick){return {pieces:warren(pick([3,5,7,9]),RED)};}},
  {scene:'bridge',what:'てっきょう',yomi:'鉄橋',all:true,make(pick){const a=pick([3,5]),b=pick([3,5]),w=(a+1)/2;return {pieces:[...warren(a,RED),...warren(b,RED,w+.8)],piers:[w+.4]};}},
  {scene:'signal',what:'しんごうき',yomi:'信号機',make(pick){const [m,p]=pick([[2,1],[2,2],[3,1]]),lamps=m===2?['green','red']:['green','yellow','red'];return {pieces:[line('はしら','#8a949c',...Array.from({length:p+1},(_,i)=>[0,i])),...lamps.map((l,i)=>sq(-.5,p+i,SIG,{lamp:l}))]};}},
  {scene:'pole',what:'でんきの はしら',yomi:'電気の柱',make(pick){const s=pick([2,3]),a=pick([1,2,3]),up=x=>line('はしら',STEEL,...Array.from({length:s+1},(_,i)=>[x,i]));return {pieces:[up(0),up(1),...Array.from({length:s},(_,i)=>line('よこ',STEEL,[0,i+1],[1,i+1])),line('うで',STEEL,...Array.from({length:a+1},(_,i)=>[1+i,s]))],wireY:s-.28,hangX:1+a-.45,trainS:s===3?1.75:1.3};}},
  {scene:'station',what:'えき',yomi:'駅',make(pick){const [w,h]=pick([[1,1],[1,2],[2,1],[2,2],[3,1]]),ps=[],door=Math.floor(w/2);for(let y=0;y<h;y++)for(let x=0;x<w;x++)ps.push(sq(x,y,WOOD,{deco:y===0&&x===door?'door':'window'}));let inv=0;warren(2*w-1,ROOF,0,h).forEach((p,i)=>ps.push(i%2?{...p,deco:inv++?'sign':'clock'}:w===1?{...p,deco:'clock'}:p));return {pieces:ps};}},
  {scene:'track',what:'せんろ',yomi:'線路',make(pick){return {pieces:Array.from({length:pick([2,3,4,5,6])},(_,x)=>sq(x,0,null))};}},
];
const k3=p=>p.map(v=>v.toFixed(3)).join(),key=(p,q)=>{const a=k3(p),b=k3(q);return a<b?a+'|'+b:b+'|'+a;};
// The sticks of a figure: a stick shared by two pieces is one stick.
function build(L){const edges=[],seen={},pieceEdges=[];L.pieces.forEach(pc=>{const mine=[],n=pc.pts.length;for(let i=0;i<(pc.closed?n:n-1);i++){const p=pc.pts[i],q=pc.pts[(i+1)%n],k=key(p,q);if(!(k in seen)){seen[k]=edges.length;edges.push({p,q,c:pc.c});}mine.push(seen[k]);}pieceEdges.push(mine);});return {edges,pieceEdges};}
// At first no figure has more than MOST sticks, until the child is used to ぼうかぞえ (2026-11-18 ゆかりさん: えき and the long ones were too many to count); a saved one still reads. On a phone (skip, set in the browser) the wide figures do not come.
const MOST=11;let skip=()=>false;
const SEEDS=1e6,okSeed=(a,b)=>Number.isSafeInteger(a)&&a>=0&&a<SCENES.length&&Number.isSafeInteger(b)&&b>=0&&b<SEEDS;
function shape(a,b){if(!okSeed(a,b))return null;const r=rng(b*7+a+1),pick=list=>list[Math.floor(r()*list.length)],S=SCENES[a];return {...S,...S.make(pick,r)};}
function count(a,b){const L=shape(a,b);return L?build(L).edges.length:0;}
// Not the scene nor the number of sticks of the one before ({a, b}, if given), so the same figure does not come twice in a row.
function problem(random=Math.random,before){const last=before&&okSeed(before.a,before.b)?{a:before.a,n:count(before.a,before.b)}:null;let a,b;for(let i=0;i<100;i++){a=Math.floor(random()*SCENES.length);b=Math.floor(random()*SEEDS);if(count(a,b)<=MOST&&!skip(a,b)&&(!last||a!==last.a&&count(a,b)!==last.n))break;}return {a,b,result:count(a,b)};}
const api={MOST,SCENES,shape,count,build,problem,okSeed};
if(typeof module!=='undefined'){module.exports=api;return;}

// ---------- In the browser ----------
const SC={
  bridge:{top:.75,bot:1.45,minW:5.2,pad:1.1,train:'back'},
  panta:{top:.85,bot:1.05,minW:3.8,pad:1.2,train:null},
  signal:{top:.55,bot:.6,minW:5,train:'back'},
  pole:{top:.55,bot:.6,minW:5.4,train:'back'},
  station:{top:.6,bot:1.05,minW:5,train:'front',railY:-.5},
  track:{top:.85,bot:.85,minW:5.6,train:'top'},
};
const horiz=e=>Math.abs(e.p[1]-e.q[1])<1e-9,stickW=(sc,e)=>sc==='track'?(horiz(e)?12:20):13,stickC=(sc,e)=>sc==='track'?(horiz(e)?'#5f6a74':'#7a5333'):e.c;
const hon=n=>n+([1,6,8,0].includes(n%10)?'ぽん':n%10===3?'ぼん':'ほん');
const NS='http://www.w3.org/2000/svg',X=x=>x*U,Y=y=>-y*U;
// The one figure on screen: L the shape, F its sticks, marks the sticks tapped (in order), num whether their order shows.
let svg=null,L=null,F=null,marks=[],num=false,done=false,tries=0;
const el=(t,a,p)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);(p||svg).appendChild(e);return e;};
const sc=()=>SC[L.scene];
function bounds(S=L){const xs=[],ys=[];S.pieces.forEach(p=>p.pts.forEach(([x,y])=>{xs.push(x);ys.push(y);}));return {x0:Math.min(...xs),x1:Math.max(...xs),y0:Math.min(...ys),y1:Math.max(...ys)};}
function view(S=L){const b=bounds(S),s=SC[S.scene],w=Math.max(b.x1-b.x0+(s.pad||1.8),s.minW),cx=(b.x0+b.x1)/2;return {x0:cx-w/2,x1:cx+w/2,top:b.y1+s.top,bot:s.bot-b.y0,b};}
const W=v=>(v.x1-v.x0)*U;
// A phone (as narrow as the phone layout in style.css) leaves out two figures side by side and the longest ones (wider than 6.2 sticks), whose sticks would be too small to tap (2026-11-18 ゆかりさん on an iPhone SE).
skip=(a,b)=>{if(!matchMedia('(max-width: 600px)').matches)return false;const S=shape(a,b),v=view(S);return !!S.all||v.x1-v.x0>6.2;};
const say=p=>{const S=shape(p.a,p.b);return `この${S.yomi}は、棒が${S.all?'全部で':''}何本？`;};
const prompt=p=>{const S=shape(p.a,p.b);return `この ${S.what}は ぼうが ${S.all?'ぜんぶで ':''}なんぼん？`;};
function mount(host,p,opts={}){L=shape(p.a,p.b);F=build(L);marks=[];done=false;tries=0;num=!!opts.num;host.innerHTML=`<span class="sticks-q">${prompt(p)}</span>`;svg=document.createElementNS(NS,'svg');svg.setAttribute('class','sticks-svg');svg.setAttribute('role','img');svg.setAttribute('aria-label',prompt(p));svg.addEventListener('click',near);host.appendChild(svg);draw();}
// A tap goes to the nearest stick, so a small finger need not hit the stick itself (up to half a stick away, or 36 px on a small screen).
function near(e){const m=svg.getScreenCTM();if(!m)return;const pt=new DOMPoint(e.clientX,e.clientY).matrixTransform(m.inverse()),x=pt.x/U,y=-pt.y/U;let best=-1,bd=Infinity;F.edges.forEach((ed,i)=>{const [px,py]=ed.p,[qx,qy]=ed.q,dx=qx-px,dy=qy-py,t=Math.max(0,Math.min(1,((x-px)*dx+(y-py)*dy)/(dx*dx+dy*dy))),d=Math.hypot(x-px-t*dx,y-py-t*dy);if(d<bd){bd=d;best=i;}});if(best>=0&&bd*U*m.a<=Math.max(36,U*m.a/2))tap(best);}
function draw(sharedEdges=[],blink=[]){
  svg.innerHTML='';const v=view();
  svg.setAttribute('viewBox',`${X(v.x0)} ${Y(v.top)} ${W(v)} ${(v.top+v.bot)*U}`);
  defs(v);
  const all=el('g',{'clip-path':'url(#st-clip)'}),g={bg:el('g',{},all),back:el('g',{class:'sticks-back'},all),fill:el('g',{},all),sticks:el('g',{},all),front:el('g',{class:'sticks-front'},all),fx:el('g',{},all)};
  BG[L.scene](v,g.bg);
  L.pieces.forEach(p=>FILL(p,g.fill));
  F.edges.forEach((e,i)=>{const a={x1:X(e.p[0]),y1:Y(e.p[1]),x2:X(e.q[0]),y2:Y(e.q[1])},dx=a.x2-a.x1,dy=a.y2-a.y1,cut=GAP/Math.hypot(dx,dy);
    const st=el('line',{x1:a.x1+dx*cut,y1:a.y1+dy*cut,x2:a.x2-dx*cut,y2:a.y2-dy*cut,stroke:stickC(L.scene,e),'stroke-width':stickW(L.scene,e),class:'stick'},g.sticks);
    if(marks.includes(i))st.classList.add('marked');if(sharedEdges.includes(i))st.classList.add('shared');if(blink.includes(i))st.classList.add('blink');
    el('line',{...a,'stroke-width':44,class:'stick-hit'},g.sticks);});
  if(num)marks.forEach((i,n)=>{const e=F.edges[i],cx=X((e.p[0]+e.q[0])/2),cy=Y((e.p[1]+e.q[1])/2),b=el('g',{class:'stick-badge'},g.sticks);el('circle',{cx,cy,r:19},b);el('text',{x:cx,y:cy},b).textContent=n+1;});
  if(done&&L.scene==='panta')sparks(g.fx);
}
function tap(i){if(done)return;const k=marks.indexOf(i);if(k<0)marks.push(i);else marks.splice(k,1);draw();}
// A wrong answer: no penalty; the hint says which way it is off, and from the 2nd the sticks to look at light up. Returns the hint.
function wrong(n){if(!L)return '';tries++;const total=F.edges.length;let text=n>total?'おなじ ぼうを 2かい かぞえたかも':'かぞえて いない ぼうが あるかも';if(tries<2)return text;
  const cnt={};F.pieceEdges.forEach(es=>es.forEach(i=>cnt[i]=(cnt[i]||0)+1));const shared=Object.keys(cnt).filter(i=>cnt[i]>1).map(Number),untapped=F.edges.map((_,i)=>i).filter(i=>!marks.includes(i));
  if(n>total&&shared.length){draw(shared);return 'オレンジの ぼうは 1かいだけ かぞえてね';}
  if(n>total){draw();return 'タップして 1ぽんずつ かぞえよう';}
  draw([],untapped);return marks.length&&untapped.length?'ひかった ぼうが まだだよ':'タップして 1ぽんずつ かぞえよう';}
function winText(p){return `せいかい！ ぼうは ${hon(count(p.a,p.b))}！`;}
function win(){if(!L||done)return;done=true;draw();runTrain();}

// ---------- Backgrounds ----------
function defs(v){const d=el('defs',{});el('rect',{x:X(v.x0),y:Y(v.top),width:W(v),height:(v.top+v.bot)*U},el('clipPath',{id:'st-clip'},d));const lg=(id,stops)=>{const g=el('linearGradient',{id,x1:0,y1:0,x2:0,y2:1},d);stops.forEach(([o,c])=>el('stop',{offset:o,'stop-color':c},g));};
  lg('st-sky',[[0,'#6ec3f5'],[.7,'#c9ecff'],[1,'#eefaff']]);lg('st-river',[[0,'#3d97d6'],[1,'#2a6fb0']]);lg('st-roof',[[0,'#eef2f5'],[1,'#b9c3cc']]);lg('st-stone',[[0,'#b7b0a6'],[1,'#8f877c']]);}
function sky(v,g,horizon=0){
  el('rect',{x:X(v.x0),y:Y(v.top),width:W(v),height:(v.top+v.bot)*U,fill:'url(#st-sky)'},g);
  const mx=X(v.x0),mw=W(v),hy=Y(horizon);
  el('path',{d:`M${mx} ${hy} L${mx+mw*.1} ${hy-80} L${mx+mw*.22} ${hy-40} L${mx+mw*.38} ${hy-110} L${mx+mw*.55} ${hy-35} L${mx+mw*.72} ${hy-90} L${mx+mw*.88} ${hy-45} L${mx+mw} ${hy-70} L${mx+mw} ${hy} Z`,fill:'#9cc7a4',opacity:.75},g);
  el('path',{d:`M${mx} ${hy} L${mx+mw*.18} ${hy-45} L${mx+mw*.3} ${hy-20} L${mx+mw*.48} ${hy-60} L${mx+mw*.66} ${hy-18} L${mx+mw*.82} ${hy-50} L${mx+mw} ${hy-15} L${mx+mw} ${hy} Z`,fill:'#7fb38a',opacity:.8},g);
  const sx=X(v.x1)-62,sy=Y(v.top)+58;
  for(let i=0;i<12;i++){const a=i*Math.PI/6;el('line',{x1:sx+Math.cos(a)*36,y1:sy+Math.sin(a)*36,x2:sx+Math.cos(a)*48,y2:sy+Math.sin(a)*48,stroke:'#ffc93c','stroke-width':5,'stroke-linecap':'round'},g);}
  el('circle',{cx:sx,cy:sy,r:27,fill:'#ffd84d'},g);
  cloud(X(v.x0)+70,Y(v.top)+52,1,g);cloud(X(v.x0)+mw*.48,Y(v.top)+34,.75,g);}
function cloud(x,y,s,g){[[0,0,26],[24,-12,22],[48,0,25],[24,8,22],[-18,6,16]].forEach(([dx,dy,r])=>el('circle',{cx:x+dx*s,cy:y+dy*s,r:r*s,fill:'#fff',opacity:.95},g));}
function grass(v,g,y=0,col='#86c165'){el('rect',{x:X(v.x0),y:Y(y),width:W(v),height:(v.bot+y)*U,fill:col},g);}
function sideTrack(v,g,y=0){el('rect',{x:X(v.x0),y:Y(y)-2,width:W(v),height:16,fill:'#a69e93'},g);for(let x=X(v.x0)+4;x<X(v.x1);x+=26)el('rect',{x,y:Y(y)-6,width:14,height:7,fill:'#6e4b33'},g);el('rect',{x:X(v.x0),y:Y(y)-11,width:W(v),height:5,fill:'#8d969e'},g);}
function tree(x,y,s,g){el('rect',{x:x-5*s,y:y-28*s,width:10*s,height:28*s,fill:'#7b5536'},g);el('circle',{cx:x,cy:y-48*s,r:26*s,fill:'#4f9a4a'},g);el('circle',{cx:x-14*s,cy:y-36*s,r:18*s,fill:'#5aad54'},g);el('circle',{cx:x+14*s,cy:y-38*s,r:17*s,fill:'#5aad54'},g);}
function flowers(v,g,y0,y1,n){for(let i=0;i<n;i++){const x=X(v.x0)+((i*137)%997)/997*W(v),y=Y(y0)+((i*71)%89)/89*(Y(y1)-Y(y0));el('circle',{cx:x,cy:y,r:4,fill:['#fff','#ffe35c','#ff9fc4'][i%3]},g);}}
const BG={
  bridge(v,g){sky(v,g,0);const b=v.b,Y0=Y(0),bot=Y(-v.bot),mid=X((b.x0+b.x1)/2);
    el('rect',{x:X(v.x0),y:Y0,width:W(v),height:bot-Y0,fill:'url(#st-river)'},g);
    for(let i=0;i<4;i++){const y=Y0+40+i*24;el('path',{d:`M${X(v.x0)} ${y} `+Array.from({length:Math.ceil(W(v)/60)},()=>'q15 -7 30 0 t30 0').join(' '),stroke:'#8cc8ef','stroke-width':3,fill:'none',opacity:.8},g);}
    el('path',{d:`M${X(v.x0)} ${Y0} H${X(b.x0)-14} L${X(b.x0)-50} ${bot} H${X(v.x0)} Z`,fill:'#86c165'},g);
    el('path',{d:`M${X(v.x1)} ${Y0} H${X(b.x1)+14} L${X(b.x1)+50} ${bot} H${X(v.x1)} Z`,fill:'#86c165'},g);
    [b.x0,b.x1].forEach(x=>el('rect',{x:X(x)-18,y:Y0,width:36,height:bot-Y0,fill:'url(#st-stone)'},g));
    (L.piers||[]).forEach(x=>{el('rect',{x:X(x)-22,y:Y0,width:44,height:bot-Y0,fill:'url(#st-stone)'},g);el('ellipse',{cx:X(x),cy:bot-14,rx:34,ry:6,fill:'#8cc8ef',opacity:.7},g);});
    const bx=(L.piers||[]).length?mid-90:mid;
    el('path',{d:`M${bx-30} ${Y0+70} h60 l-10 12 h-40 Z`,fill:'#e8613a'},g);el('line',{x1:bx,y1:Y0+70,x2:bx,y2:Y0+44,stroke:'#555','stroke-width':3},g);el('path',{d:`M${bx} ${Y0+46} l18 10 l-18 8 Z`,fill:'#fff'},g);
    el('rect',{x:X(b.x0)-18,y:Y0,width:(b.x1-b.x0)*U+36,height:12,fill:'#5a463c'},g);
    sideTrack(v,g,0);tree(X(v.x0)+34,Y0+2,.9,g);tree(X(v.x1)-38,Y0+2,.8,g);},
  panta(v,g){sky(v,g,-1);const wy=Y(L.wireY),my=L.wireY+.5;
    [v.x0+.25,v.x1-.25].forEach(x=>{el('rect',{x:X(x)-9,y:Y(v.top),width:18,height:Y(0)-Y(v.top),fill:'#8a949c'},g);el('rect',{x:x<0?X(x)-9:X(x)-51,y:Y(my),width:60,height:8,fill:'#8a949c'},g);});
    el('path',{d:`M${X(v.x0)} ${Y(my)} Q${X(0)} ${Y(my-.5)} ${X(v.x1)} ${Y(my)}`,stroke:'#333','stroke-width':3,fill:'none'},g);
    for(let x=Math.ceil(v.x0*2)/2;x<v.x1;x+=.5){const t=(x-v.x0)/(v.x1-v.x0),yy=my-.5*2*t*(1-t);el('line',{x1:X(x),y1:Y(yy),x2:X(x),y2:wy,stroke:'#555','stroke-width':2},g);}
    el('line',{x1:X(v.x0),y1:wy-3,x2:X(v.x1),y2:wy-3,stroke:'#222','stroke-width':5},g);
    el('rect',{x:X(v.x0),y:Y(0)+6,width:W(v),height:Y(-v.bot)-Y(0),fill:'url(#st-roof)'},g);
    el('rect',{x:X(v.x0),y:Y(0)+2,width:W(v),height:8,fill:'#cfd7de'},g);
    el('rect',{x:X(v.x0),y:Y(-.72),width:W(v),height:14,fill:'#d8343f'},g);el('rect',{x:X(v.x0),y:Y(-.72)+14,width:W(v),height:6,fill:'#f0a52c'},g);
    (L.bases.length>1?[-.4]:[v.x0+.3,1.2]).forEach(x=>{el('rect',{x:X(x),y:Y(0)-14,width:90,height:20,rx:4,fill:'#a9b4bd'},g);for(let i=0;i<4;i++)el('rect',{x:X(x)+10+i*20,y:Y(0)-10,width:10,height:12,fill:'#8a959e'},g);});
    L.bases.forEach(c=>{[c-.55,c+.55].forEach(x=>{for(let i=0;i<3;i++)el('ellipse',{cx:X(x),cy:Y(0)+18-i*7,rx:11,ry:4,fill:'#f3efe6',stroke:'#b8b0a2'},g);});});},
  signal(v,g){sky(v,g,0);grass(v,g,0);flowers(v,g,-.25,-.55,14);sideTrack(v,g,0);tree(X(v.x1)-50,Y(0)-14,.9,g);el('rect',{x:X(-.12),y:Y(0)-4,width:24,height:14,fill:'#777'},g);},
  pole(v,g){const wy=L.wireY;sky(v,g,0);grass(v,g,0);flowers(v,g,-.25,-.55,14);sideTrack(v,g,0);
    el('line',{x1:X(v.x0),y1:Y(wy)-16,x2:X(v.x1),y2:Y(wy)-16,stroke:'#333','stroke-width':3},g);
    el('line',{x1:X(L.hangX),y1:Y(Math.round(wy+.28)),x2:X(L.hangX),y2:Y(wy),stroke:'#555','stroke-width':3},g);
    for(let i=0;i<3;i++)el('ellipse',{cx:X(L.hangX),cy:Y(Math.round(wy+.28))+10+i*7,rx:9,ry:3.5,fill:'#f3efe6',stroke:'#b8b0a2'},g);
    el('line',{x1:X(v.x0),y1:Y(wy),x2:X(v.x1),y2:Y(wy),stroke:'#222','stroke-width':4},g);
  },
  station(v,g){sky(v,g,0);
    for(let i=0;i<7;i++){const x=X(v.x0)+i*W(v)/7+10,h=40+((i*53)%60);el('rect',{x,y:Y(0)-h,width:W(v)/7-18,height:h,fill:'#c3d6e0',opacity:.9},g);for(let r=0;r<Math.floor(h/18);r++)el('rect',{x:x+8,y:Y(0)-h+8+r*18,width:W(v)/7-34,height:6,fill:'#e7f0f5'},g);}
    grass(v,g,0,'#cfc6b3');
    el('rect',{x:X(v.x0),y:Y(-.08),width:W(v),height:.26*U,fill:'#d9d5cc'},g);el('rect',{x:X(v.x0),y:Y(-.24),width:W(v),height:7,fill:'#f2c94c'},g);el('rect',{x:X(v.x0),y:Y(-.34),width:W(v),height:10,fill:'#9c968a'},g);
    el('rect',{x:X(v.x0),y:Y(-.42),width:W(v),height:v.bot*U,fill:'#8f8a82'},g);
    sideTrack(v,g,sc().railY);
    const b=v.b;el('rect',{x:X(b.x1)+40,y:Y(0)-120,width:6,height:120,fill:'#666'},g);el('rect',{x:X(b.x1)+18,y:Y(0)-150,width:50,height:34,rx:6,fill:'#1b5fa8'},g);el('text',{x:X(b.x1)+43,y:Y(0)-127,'font-size':18,'font-weight':900,fill:'#fff','text-anchor':'middle'},g).textContent='のりば';},
  track(v,g){el('rect',{x:X(v.x0),y:Y(v.top),width:W(v),height:(v.top+v.bot)*U,fill:'#86c165'},g);flowers(v,g,v.top-.1,v.top-.6,16);flowers(v,g,-.55,-.8,16);
    el('rect',{x:X(v.x0),y:Y(1.42),width:W(v),height:1.84*U,fill:'#b2aa9f'},g);
    for(let i=0;i<220;i++){const x=X(v.x0)+((i*389)%1009)/1009*W(v),y=Y(1.42)+((i*211)%313)/313*1.84*U;el('circle',{cx:x,cy:y,r:3+(i%3),fill:['#9d958a','#c7c0b6','#8e877d'][i%3]},g);}
    const bx=X(v.b.x1)+30;el('rect',{x:bx,y:Y(1.3),width:34,height:1.6*U,fill:'#fff',stroke:'#c03','stroke-width':3},g);for(let i=0;i<4;i++)el('rect',{x:bx,y:Y(1.3)+i*40+8,width:34,height:20,fill:'#d8343f'},g);
    el('text',{x:bx+17,y:Y(1.3)-10,'font-size':16,'font-weight':900,fill:'#7a1f1f','text-anchor':'middle'},g).textContent='くるまどめ';},
};
function FILL(p,g){const pts=p.pts.map(([x,y])=>`${X(x)},${Y(y)}`).join(' '),cx=X(p.pts.reduce((a,q)=>a+q[0],0)/p.pts.length),cy=Y(p.pts.reduce((a,q)=>a+q[1],0)/p.pts.length);
  if(L.scene==='station'){el('polygon',{points:pts,fill:p.name==='しかく'?'#fff1d6':'#f3a28a'},g);
    if(p.deco==='door'){el('rect',{x:cx-24,y:cy-30,width:48,height:80,rx:6,fill:'#9a6a43'},g);el('circle',{cx:cx+14,cy:cy+12,r:4,fill:'#ffd84d'},g);}
    if(p.deco==='window'){el('rect',{x:cx-28,y:cy-24,width:56,height:44,rx:4,fill:'#9fd3f2',stroke:'#fff','stroke-width':4},g);el('line',{x1:cx,y1:cy-24,x2:cx,y2:cy+20,stroke:'#fff','stroke-width':4},g);el('line',{x1:cx-28,y1:cy-2,x2:cx+28,y2:cy-2,stroke:'#fff','stroke-width':4},g);}
    if(p.deco==='clock'){el('circle',{cx,cy:cy+4,r:15,fill:'#fff',stroke:'#7a4f30','stroke-width':3},g);el('line',{x1:cx,y1:cy+4,x2:cx,y2:cy-6,stroke:'#333','stroke-width':3,'stroke-linecap':'round'},g);el('line',{x1:cx,y1:cy+4,x2:cx+7,y2:cy+4,stroke:'#333','stroke-width':3,'stroke-linecap':'round'},g);}
    if(p.deco==='sign'){el('rect',{x:cx-20,y:cy-8,width:40,height:22,rx:4,fill:'#1b5fa8'},g);el('text',{x:cx,y:cy+9,'font-size':15,'font-weight':900,fill:'#fff','text-anchor':'middle'},g).textContent='えき';}}
  if(p.lamp){el('polygon',{points:pts,fill:'#1d2226'},g);const on=p.lamp==='red'?!done:p.lamp==='green'&&done,c={red:['#ff3b30','#5a2222'],yellow:['#ffcc00','#5a4a14'],green:['#3ddc84','#1f4d33']}[p.lamp];
    el('circle',{cx,cy,r:30,fill:on?c[0]:c[1]},g);if(on)el('circle',{cx,cy,r:40,fill:c[0],opacity:.25,class:'stick-glow'},g);
    el('path',{d:`M${cx-32} ${cy-28} q32 -16 64 0`,stroke:'#111','stroke-width':6,fill:'none'},g);}}
function sparks(g){const v=view(),y=Y(L.wireY);
  el('line',{x1:X(v.x0),y1:y-3,x2:X(v.x1),y2:y-3,stroke:'#ffe14d','stroke-width':7,opacity:.95,class:'stick-glow'},g);
  L.pieces.filter(p=>p.name==='うえの ぼう').forEach(p=>{const x=X((p.pts[0][0]+p.pts[p.pts.length-1][0])/2);
    for(let i=0;i<8;i++){const a=i*Math.PI/4+.3,r=i%2?26:40;el('line',{x1:x,y1:y-4,x2:x+Math.cos(a)*r,y2:y-4+Math.sin(a)*r,stroke:i%2?'#fff6a8':'#ffd000','stroke-width':4,'stroke-linecap':'round',class:'stick-spark'},g);}
    el('circle',{cx:x,cy:y-4,r:10,fill:'#fff',class:'stick-spark'},g);});}

// ---------- The train of the reward ----------
function trainSide(g,s=1,wireTop=null){const cw=150*s,ch=56*s,base=-10;
  for(let i=0;i<3;i++){const x=i*(cw+6*s),lead=i===2,top=base-8*s-ch;
    el('rect',{x,y:top,width:cw,height:ch,rx:(lead?22:7)*s,fill:'#f7f9fb',stroke:'#2b3a44','stroke-width':3*s},g);
    el('rect',{x:x+2*s,y:top+ch*.62,width:cw-4*s,height:7*s,fill:'#d8343f'},g);
    for(let w=0;w<(lead?3:4);w++)el('rect',{x:x+12*s+w*32*s,y:top+10*s,width:22*s,height:18*s,rx:3*s,fill:'#9cc9e8'},g);
    if(lead)el('path',{d:`M${x+cw-26*s} ${top+8*s} h${14*s} q${8*s} 0 ${10*s} ${10*s} v${14*s} h${-24*s} Z`,fill:'#3c4a55'},g);
    [22,cw/s-22].forEach(wx=>{el('circle',{cx:x+wx*s-8*s,cy:base-4*s,r:6*s,fill:'#2b3a44'},g);el('circle',{cx:x+wx*s+8*s,cy:base-4*s,r:6*s,fill:'#2b3a44'},g);});
    if(i===1){const mx=x+cw/2,pt=wireTop??(top-24*s),mid=(top+pt)/2;el('path',{d:`M${mx} ${top} L${mx-14*s} ${mid} L${mx} ${pt} L${mx+14*s} ${mid} Z`,stroke:'#333','stroke-width':3*s,fill:'none'},g);el('line',{x1:mx-18*s,y1:pt,x2:mx+18*s,y2:pt,stroke:'#333','stroke-width':4*s},g);}}
  return 3*cw+12*s;}
function trainTop(g){const cw=150,ch=78;
  for(let i=0;i<3;i++){const x=i*(cw+6),lead=i===2;el('rect',{x,y:-ch/2,width:cw,height:ch,rx:lead?26:8,fill:'#e9eef2',stroke:'#2b3a44','stroke-width':3},g);el('rect',{x:x+10,y:-6,width:cw-20,height:12,fill:'#c3ccd4'},g);
    for(let k=0;k<2;k++)el('rect',{x:x+24+k*70,y:-22,width:36,height:44,rx:4,fill:'#b0bac3'},g);
    if(i===1)el('path',{d:`M${x+cw/2-24} 0 L${x+cw/2} -26 L${x+cw/2+24} 0 L${x+cw/2} 26 Z`,stroke:'#333','stroke-width':3,fill:'none'},g);}
  return 3*cw+12;}
const still=()=>matchMedia('(prefers-reduced-motion: reduce)').matches,trainMs=()=>{const s=sc();return !s.train||still()?0:s.train==='top'?2600:3200+300*(view().x1-view().x0);};
// How long the reward of the figure on screen runs (ms): the app waits this long before the drive.
function winMs(){return L?trainMs():0;}
function runTrain(){const s=sc(),v=view();if(!s.train)return;const g=svg.querySelector(s.train==='back'?'.sticks-back':'.sticks-front');
  const go=(from,to,y,dur,ease)=>{if(still()){g.setAttribute('transform',`translate(${to},${y})`);return;}const t0=performance.now(),f=t=>{if(!g.isConnected)return;const k=Math.min(1,(t-t0)/dur),e=ease?1-(1-k)**3:k;g.setAttribute('transform',`translate(${from+(to-from)*e},${y})`);if(k<1)requestAnimationFrame(f);};requestAnimationFrame(f);};
  if(s.train==='top'){const len=trainTop(g);go(X(v.x0)-len,X(v.b.x1)+20-len,Y(.5),trainMs(),true);return;}
  const railY=s.railY||0,len=trainSide(g,L.trainS||1,L.wireY&&L.scene==='pole'?Y(L.wireY)-Y(railY):null);go(X(v.x0)-len,still()?X(v.x0)+20:X(v.x1),Y(railY),trainMs(),false);}
Object.assign(api,{mount,wrong,win,winMs,winText,say,prompt,hon});
root.RailSticks=api;
})(globalThis);
