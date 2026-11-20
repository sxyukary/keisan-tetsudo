// コンテナを つむ（ROADMAP 19、2026-11-20）：おてほんと おなじ かたちに、3×3 の台へ コンテナを3段まで つむ。試作（アプリのフォルダ外の tsumiki-shisaku）から。
// 貨物駅への よりみち（ROADMAP 17）で n 問（app.js の TSUMIKI_N）。90°回した形も正解。減点・時間制限なし。
// 形は 毎回 作る（2026-11-20 ゆかりさん「B」）。さっくんは こういう問題が 苦手そうなので、**とけた数（記録の tsumiki）で だんだん むずかしく**（STAGES）。どの形も、ほかの山を 全部 つんだあとでも ますが かくれずに タップできるものだけ（visible）。前の形と同じ・回すと同じ形は 続けて出さない。
// コンテナは 4面とも同じ（とびらを描くと 向きまで そろえたくなるので 描かない）。色は JRFレッド（JR貨物の 12ft コンテナの 赤紫）と、試作の 水色（ゆかりさんが 本物っぽいと えらんだ）。
(function(root){
'use strict';
const $=id=>document.getElementById(id);
// 問題は "i,j"（3×3 の台のます）→ 下からの色（w:JRFレッド d:水色）。
// だんかい：とけた数が at 以上で その だんかい。n＝コンテナの数、h＝高さ（段）まで、two＝2色、turn＝じぶんの台が おてほんと ちがう向きから
const STAGES=[{at:0,n:2,h:1,two:false},{at:6,n:3,h:1,two:true},{at:15,n:3,h:2,two:true},{at:27,n:4,h:2,two:true},{at:42,n:5,h:2,two:true},{at:60,n:5,h:3,two:true},{at:80,n:5,h:3,two:true,turn:true}],MAXH=3,YAW=0.6;
const COLORS={w:[140,38,66],d:[78,156,212]};   // 水色は試作の色（2026-11-20 ゆかりさん：こっちのほうが本物っぽい）
let o=null,goalNow={},step=0,tool='w',play={},views={},raf=0,recent=[];

function shade(c,k){return `rgb(${c.map(x=>Math.min(255,Math.round(x*k))).join(',')})`;}
function view(id){const cv=$(id);return {cv,ctx:cv.getContext('2d'),yaw:YAW,goal:YAW,polys:[]};}
function size(v){const r=v.cv.getBoundingClientRect(),d=root.devicePixelRatio||1;if(v.cv.width!==Math.round(r.width*d)||v.cv.height!==Math.round(r.height*d)){v.cv.width=Math.round(r.width*d);v.cv.height=Math.round(r.height*d);}v.w=r.width;v.h=r.height;v.ctx.setTransform(d,0,0,d,0,0);}

function draw(v,stacks){
 const {ctx,w,h}=v,s=Math.min(w/5.4,h/5.2),cx=w/2,cy=h*0.64,K=0.5,H=0.9,c=Math.cos(v.yaw),sn=Math.sin(v.yaw);
 const P=(x,y,z)=>[cx+(x*c-y*sn)*s,cy+(x*sn+y*c)*s*K-z*s*H];
 ctx.clearRect(0,0,w,h);v.polys=[];
 // 台（丸いお皿）
 const R=2.25*s;ctx.fillStyle='#8d939b';ctx.beginPath();ctx.ellipse(cx,cy+0.3*s*H,R,R*K,0,0,Math.PI*2);ctx.fill();ctx.fillRect(cx-R,cy,R*2,0.3*s*H);
 ctx.fillStyle='#c3c7cc';ctx.beginPath();ctx.ellipse(cx,cy,R,R*K,0,0,Math.PI*2);ctx.fill();
 const poly=(pts,fill,key)=>{ctx.beginPath();pts.forEach((p,n)=>n?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle='#0004';ctx.lineWidth=1;ctx.stroke();if(key)v.polys.push({pts,key});};
 const line=(a,b,col,lw)=>{ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.stroke();};
 // コンテナ：すきま・縦のひだ・角の金具・白い札
 const box=(q,base)=>{const x=q.i-1,y=q.j-1,hf=0.46,z0=q.z+0.02,z1=q.z+0.96,lw=Math.max(1,s*0.012);
  for(const [nx,ny] of [[1,0],[-1,0],[0,1],[0,-1]]){if(nx*sn+ny*c<=0.001)continue;const lit=0.72+0.18*(nx*c-ny*sn),tx=-ny,ty=nx;
   const F=(u,w)=>P(x+nx*hf+tx*hf*(2*u-1),y+ny*hf+ty*hf*(2*u-1),z0+(z1-z0)*w);
   const quad=(u0,u1,w0,w1,col)=>poly([F(u0,w0),F(u1,w0),F(u1,w1),F(u0,w1)],col);
   poly([F(0,0),F(1,0),F(1,1),F(0,1)],shade(base,lit),q.key);
   const dark=shade(base,lit*0.72),light=shade(base,lit*1.15);
   for(let u=.12;u<.9;u+=.076)line(F(u,.1),F(u,.88),dark,lw*0.8);quad(.2,.42,.62,.76,'#f4f4f4');
   quad(0,1,.9,1,dark);quad(0,1,0,.07,dark);quad(0,.05,0,1,light);quad(.95,1,0,1,light);
   for(const [u,w] of [[0,0],[.9,0],[0,.9],[.9,.9]])quad(u,u+.1,w,w+.1,'#3b3b3b');}
  const T=(a,b)=>P(x+hf*(2*a-1),y+hf*(2*b-1),z1),tq=(a0,a1,b0,b1,col,key)=>poly([T(a0,b0),T(a1,b0),T(a1,b1),T(a0,b1)],col,key);
  tq(0,1,0,1,shade(base,1.08),q.key);tq(.06,.94,.06,.94,shade(base,1.0));
  for(const [a,b] of [[0,0],[.9,0],[0,.9],[.9,.9]])tq(a,a+.1,b,b+.1,'#3b3b3b');};
 for(let i=0;i<3;i++)for(let j=0;j<3;j++){const x=i-1,y=j-1;poly([P(x-.5,y-.5,0),P(x+.5,y-.5,0),P(x+.5,y+.5,0),P(x-.5,y+.5,0)],(i+j)%2?'#b3b8bf':'#bcc1c7',i+','+j);}
 const cubes=[];for(const k in stacks){const [i,j]=k.split(',').map(Number);[...stacks[k]].forEach((col,z)=>cubes.push({i,j,z,col,key:k,d:(i-1)*sn+(j-1)*c}));}
 cubes.sort((a,b)=>a.d-b.d||a.z-b.z);
 for(const q of cubes)box(q,COLORS[q.col]);
}

function inside(p,pts){let r=false;for(let a=0,b=pts.length-1;a<pts.length;b=a++){const [xa,ya]=pts[a],[xb,yb]=pts[b];if((ya>p[1])!==(yb>p[1])&&p[0]<(xb-xa)*(p[1]-ya)/(yb-ya)+xa)r=!r;}return r;}
function hit(v,p){for(let n=v.polys.length-1;n>=0;n--)if(inside(p,v.polys[n].pts))return v.polys[n].key;return null;}
// 回した形も同じとみなす（90°ずつ）
function norm(st){const out=[];let cur=st;for(let r=0;r<4;r++){out.push(Object.keys(cur).filter(k=>cur[k]).sort().map(k=>k+':'+cur[k]).join(' '));const nx={};for(const k in cur){const [i,j]=k.split(',').map(Number);nx[(2-j)+','+i]=cur[k];}cur=nx;}return out;}
function same(a,b){return norm(a).includes(norm(b)[0]);}
function stageOf(n){let i=0;STAGES.forEach((t,k)=>{if((n||0)>=t.at)i=k;});return i;}
// 見えるか：ほかの山を全部つんだまま、そのますを 下から1つずつ つむとき、タップする面（ますか いちばん上の箱）が ほかの山に かくれない
const ghost=()=>({ctx:new Proxy({},{get:()=>()=>{}}),w:300,h:260,yaw:YAW,polys:[]});
function visible(g){const v=ghost();for(const k in g)for(let z=0;z<g[k].length;z++){const st={...g};if(z)st[k]=g[k].slice(0,z);else delete st[k];draw(v,st);const p=[...v.polys].reverse().find(x=>x.key===k);if(!p)return false;const c=[p.pts.reduce((a,q)=>a+q[0],0)/p.pts.length,p.pts.reduce((a,q)=>a+q[1],0)/p.pts.length];if(hit(v,c)!==k)return false;}return true;}
function make(stage,random=Math.random,avoid=[]){const t=STAGES[stage];for(let tries=0;tries<500;tries++){const g={},cells=[];for(let i=0;i<3;i++)for(let j=0;j<3;j++)cells.push(i+','+j);
  for(let c=0;c<t.n;c++){const open=cells.filter(k=>(g[k]||'').length<t.h);const k=open[Math.floor(random()*open.length)];g[k]=(g[k]||'')+(t.two&&random()<.5?'d':'w');}
  const cols=Object.values(g).join('');if(t.two&&(!cols.includes('w')||!cols.includes('d')))continue;if(t.h>1&&!Object.values(g).some(x=>x.length>1))continue;
  if(avoid.some(a=>same(g,a))||!visible(g))continue;return g;}
  return {"1,1":"w","2,1":"w"};}
function done(){return !$('tsumiki-done').hidden;}

function tap(key){if(done())return;const cur=play[key]||'';
 if(tool==='x'){if(!cur)return;play[key]=cur.slice(0,-1);if(!play[key])delete play[key];}
 else{if(cur.length>=MAXH)return;play[key]=cur+tool;}
 if(same(play,goalNow))setTimeout(win,350);}
function win(){if(!o||done())return;o.good?.();o.solved?.();const end=step+1>=o.n;$('tsumiki-next').textContent=end?`${o.to.name}へ しゅっぱつ →`:'つぎの かたち →';$('tsumiki-done').hidden=false;$('tsumiki-next').focus();o.say?.(end?'できた！ しゅっぱつ しよう！':'できた！');}

function bind(name,editable){const v=views[name];let st=null;
 v.cv.addEventListener('pointerdown',e=>{v.cv.setPointerCapture(e.pointerId);st={x:e.clientX,y:e.clientY,yaw:v.yaw,drag:false};});
 v.cv.addEventListener('pointermove',e=>{if(!st)return;const dx=e.clientX-st.x;if(Math.abs(dx)+Math.abs(e.clientY-st.y)>10)st.drag=true;if(st.drag)v.yaw=v.goal=st.yaw+dx*0.012;});
 v.cv.addEventListener('pointerup',e=>{if(st&&!st.drag&&editable){const r=v.cv.getBoundingClientRect(),k=hit(v,[e.clientX-r.left,e.clientY-r.top]);if(k)tap(k);}
  if(st&&st.drag)v.goal=Math.round((v.yaw-YAW)/(Math.PI/2))*(Math.PI/2)+YAW;st=null;});
 v.cv.addEventListener('pointercancel',()=>{st=null;});}

let wired=false;
function wire(){if(wired)return;wired=true;views.model=view('tsumiki-model');views.play=view('tsumiki-play');bind('model',false);bind('play',true);
 $('tsumiki').querySelectorAll('[data-turn]').forEach(b=>b.onclick=()=>{const [n,d]=b.dataset.turn.split(',');views[n].goal+=Number(d)*Math.PI/2;});
 $('tsumiki').querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>{tool=b.dataset.tool;$('tsumiki').querySelectorAll('[data-tool]').forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',x===b);});});
 $('tsumiki-clear').onclick=()=>{if(!done())play={};};
 $('tsumiki-next').onclick=()=>{if(!o)return;step++;if(step>=o.n){const f=o.onDone;close();f?.();return;}start();};
 $('tsumiki-close').onclick=()=>close();
 $('tsumiki').addEventListener('cancel',e=>{e.preventDefault();close();});}

function start(){const st=Math.min(STAGES.length-1,Math.max(0,o.stage?o.stage():stageOf(o.count?.()||0)));goalNow=make(st,Math.random,recent);recent=[goalNow,...recent].slice(0,4);play={};$('tsumiki-done').hidden=true;$('tsumiki-lv').textContent=`${step+1} / ${o.n}`;for(const v of Object.values(views))v.yaw=v.goal=YAW;if(STAGES[st].turn)views.play.yaw=views.play.goal=YAW+(1+Math.floor(Math.random()*3))*Math.PI/2;}
function loop(){for(const name in views){const v=views[name];v.yaw+=(v.goal-v.yaw)*0.2;if(Math.abs(v.goal-v.yaw)<0.001)v.yaw=v.goal;size(v);draw(v,name==='model'?goalNow:play);}raf=requestAnimationFrame(loop);}
function close(){o=null;cancelAnimationFrame(raf);if($('tsumiki').open)$('tsumiki').close();}

// o = {n, to:駅, say, good, count:とけた数, stage:だんかい（0から。おうちの方へで決めたとき）, solved:1問とけたとき, onDone}。onDone は n 問 できて「しゅっぱつ」を押したときだけ
function open(opts){wire();o=opts;step=0;tool='w';$('tsumiki').querySelectorAll('[data-tool]').forEach(x=>{x.classList.toggle('on',x.dataset.tool==='w');x.setAttribute('aria-pressed',x.dataset.tool==='w');});$('tsumiki-to').textContent=`${opts.to.name}へ はこぶ コンテナ`;start();if(!$('tsumiki').open)$('tsumiki').showModal();cancelAnimationFrame(raf);loop();opts.say?.('おてほんと おなじに、コンテナを つもう。');}

// テスト用：いまの おてほん と、ますの いちばん上の面の まんなか（画面の座標）
function goal(){return o?{...goalNow}:null;}
function spot(key){const v=views.play,p=v&&[...v.polys].reverse().find(x=>x.key===key);if(!p)return null;const r=v.cv.getBoundingClientRect(),n=p.pts.length;return {x:r.left+p.pts.reduce((a,q)=>a+q[0],0)/n,y:r.top+p.pts.reduce((a,q)=>a+q[1],0)/n};}
root.RailTsumiki={open,close,STAGES,stageOf,make,visible,same,norm,goal,spot};
})(typeof window==='undefined'?globalThis:window);
