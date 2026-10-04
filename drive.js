// Driving between stations after a section opens: pick a train you have met, close the doors, run and brake.
(function(root){'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* 車両の見た目（横から見たイラスト）。id は cards.js と同じ。redwing は最初から乗れる車両。vmax は本物の最高速度（km/h。メーターの数字だけに使う。2026-10-04） */
const TRAINS=[
 {id:'redwing',name:'Red Wing',reading:'227けい',kind:'ふつう',cars:3,front:'slant',body:'#cfd3d6',roof:'#9aa1a6',win:'#2d3539',doors:3,doorColor:'#bfc4c7',frame:'#d4262d',accent:'#d4262d',panto:[1],motor:'vvvf',vmax:110},
 {id:'mizukaze',name:'瑞風',reading:'みずかぜ',kind:'かんこう',cars:3,front:'round',body:'#1f4a3a',roof:'#2b3a33',stripe:{t:.64,h:.025,c:'#c9a24a'},win:'#15211c',bigWin:true,doors:1,doorsAtEnds:true,doorColor:'#1f4a3a',diesel:true,vmax:110},
 {id:'hanaakari',name:'はなあかり',reading:'キハ189けい',kind:'かんこう',cars:3,front:'flat',body:'#2b2226',skirt:'#b8952e',skirtFrom:.88,roof:'#3a3034',win:'#161213',bigWin:true,doors:1,doorsAtEnds:true,doorColor:'#2b2226',diesel:true,wrap:'hana',vmax:130},
 {id:'ef210',name:'ももたろう',reading:'EF210がた',kind:'かもつ',cars:5,loco:true,front:'flat',body:'#2e5fa9',skirt:'#6f7b86',skirtFrom:.8,stripe:{t:.56,h:.05,c:'#e8ecef'},roof:'#56606a',win:'#1f272c',panto:[0],motor:'loco',vmax:110},
 {id:'ef210-300',name:'EF210 300ばんだい',reading:'うしろから おす',kind:'かもつ',cars:5,loco:true,pusher:true,front:'flat',body:'#2e5fa9',skirt:'#6f7b86',skirtFrom:.8,stripe:{t:.56,h:.05,c:'#e8ecef'},roof:'#56606a',win:'#1f272c',panto:[0],motor:'loco',vmax:110},
 {id:'carp',name:'カープ',reading:'227けい',kind:'ふつう',cars:3,front:'slant',body:'#cfd3d6',roof:'#9aa1a6',win:'#2d3539',doors:3,doorColor:'#bfc4c7',frame:'#d4262d',accent:'#d4262d',panto:[1],motor:'vvvf',wrap:'carp',vmax:110},
 {id:'urara',name:'Urara',reading:'227けい',kind:'ふつう',cars:3,front:'slant',body:'#cfd3d6',roof:'#9aa1a6',win:'#2d3539',doors:3,doorColor:'#bfc4c7',frame:'#e9797b',accent:'#e9797b',panto:[1],motor:'vvvf',vmax:110},
 {id:'greenmover',name:'グリーンムーバーカラー',reading:'227けい',kind:'ふつう',cars:3,front:'slant',body:'#f1f2ef',roof:'#9aa1a6',win:'#2d3539',doors:3,doorColor:'#1d8a78',panto:[1],motor:'vvvf',wrap:'greenmover',vmax:110},
 {id:'etsetora',name:'etSETOra',reading:'エトセトラ',kind:'かいそく',cars:2,front:'flat',body:'#f4f1e8',skirt:'#1f3a70',skirtFrom:.56,stripe:{t:.52,h:.035,c:'#8cc0e6'},roof:'#9b978d',win:'#26323c',bigWin:true,doors:1,doorsAtEnds:true,doorColor:'#f0ede3',emblem:true,diesel:true,vmax:95},
 {id:'rose',name:'ばら',reading:'227けい',kind:'ふつう',cars:3,front:'slant',body:'#eceeee',roof:'#9aa1a6',win:'#2d3539',doors:3,doorColor:'#bfc4c7',frame:'#d4262d',accent:'#d4262d',panto:[1],motor:'vvvf',wrap:'rose',vmax:110},
 {id:'kiha40',name:'キハ40',reading:'しゅいろ',kind:'ふつう',cars:1,front:'flat',body:'#e0572b',roof:'#8a7d72',win:'#343b40',doors:2,doorsAtEnds:true,doorColor:'#d8502a',diesel:true,vmax:95},
 {id:'kiha47',name:'キハ47',reading:'しゅいろ',kind:'ふつう',cars:2,front:'flat',body:'#e0572b',roof:'#8a7d72',win:'#343b40',doors:2,doorColor:'#d8502a',diesel:true,vmax:95},
 {id:'115',name:'115けい',reading:'3000ばんだい',kind:'ふつう',cars:3,front:'flat',body:'#f2b400',roof:'#9c8a55',win:'#343b40',doors:2,doorColor:'#e9ac00',panto:[1],motor:'old',vmax:100},
 {id:'ginga',name:'銀河',reading:'ぎんが',kind:'かんこう',cars:3,front:'flat',body:'#1f2d52',roof:'#3a4460',stripe:{t:.7,h:.02,c:'#c9a24a'},win:'#141c2e',bigWin:true,doors:1,doorsAtEnds:true,doorColor:'#1f2d52',emblem:true,panto:[1],motor:'old',vmax:110},
 {id:'kizashi',name:'Kizashi',reading:'227けい',kind:'ふつう',cars:3,front:'slant',body:'#c9cdd0',stripe:{t:.53,h:.06,c:'#6f5c46'},roof:'#8e959a',win:'#2d3539',doors:3,doorColor:'#bfc4c7',frame:'#6f5c46',accent:'#1f1f22',accent2:'#c9a24a',panto:[1],motor:'vvvf',vmax:110},
 {id:'nt3001',name:'せせらぎ',reading:'NT3000がた',kind:'ふつう',cars:1,front:'nt',body:'#3f86c8',roof:'#8e959a',win:'#2d3539',doors:2,doorsAtEnds:true,doorColor:'#3778b4',diesel:true,tint:'#6fa9dc',deep:'#2f6fae',wrap:'seseragi',vmax:80},
 {id:'nt3002',name:'ひだまり',reading:'NT3000がた',kind:'ふつう',cars:1,front:'nt',body:'#d8468c',roof:'#8e959a',win:'#2d3539',doors:2,doorsAtEnds:true,doorColor:'#c63d7e',diesel:true,tint:'#e77aad',deep:'#b93674',wrap:'hidamari',vmax:80},
 {id:'nt3003',name:'こもれび',reading:'NT3000がた',kind:'ふつう',cars:1,front:'nt',body:'#8cc63f',roof:'#8e959a',win:'#2d3539',doors:2,doorsAtEnds:true,doorColor:'#7db536',diesel:true,tint:'#b2dc6e',deep:'#6fa52c',wrap:'komorebi',vmax:80},
 {id:'nt3004',name:'きらめき',reading:'NT3000がた',kind:'ふつう',cars:1,front:'nt',body:'#e3c23f',roof:'#8e959a',win:'#2d3539',doors:2,doorsAtEnds:true,doorColor:'#d2b135',diesel:true,tint:'#f0d970',deep:'#c9a82a',wrap:'kirameki',vmax:80},
 {id:'c57',name:'SLやまぐち',reading:'C57がた',kind:'かんこう',cars:4,steam:true,body:'#5a2e24',roof:'#3c3f41',win:'#2a2522',doors:2,doorsAtEnds:true,doorColor:'#52291f',vmax:100},
 {id:'lamalle',name:'ラ・マル しまなみ',reading:'213けい',kind:'かんこう',cars:2,front:'flat',body:'#f1f1ee',roof:'#9aa1a6',win:'#1b1f22',doors:2,doorColor:'#e9e9e5',accent:'#1b1f22',panto:[0],motor:'old',wrap:'malle',vmax:110},
 {id:'marineliner',name:'マリンライナー',reading:'5000けい',kind:'かいそく',cars:3,dd:true,front:'round',body:'#d3d8dc',roof:'#a3a9ae',win:'#1f3238',stripe:{t:.8,h:.06,c:'#22305a'},doors:2,doorColor:'#c9ced2',panto:[1],motor:'vvvf',vmax:130},
 {id:'n700a',name:'N700A',reading:'しんかんせん',kind:'しんかんせん',cars:3,front:'aero',body:'#f6f7f8',roof:'#dfe3e6',stripe:[{t:.56,h:.05,c:'#1f4fa0'},{t:.66,h:.018,c:'#1f4fa0'}],win:'#1f262c',doors:1,doorsAtEnds:true,doorColor:'#eef1f3',panto:[1],motor:'vvvf',track:'しんかんせん',vmax:300},
 {id:'mizuho',name:'みずほ・さくら',reading:'N700けい 8りょう',kind:'しんかんせん',cars:3,front:'aero',body:'#e2ebee',roof:'#cdd7db',stripe:[{t:.56,h:.08,c:'#1d3461'},{t:.655,h:.016,c:'#c9a24a'}],win:'#1f262c',doors:1,doorsAtEnds:true,doorColor:'#dbe5e8',panto:[1],motor:'vvvf',track:'しんかんせん',vmax:300},
 {id:'railstar',name:'ひかりレールスター',reading:'700けい',kind:'しんかんせん',cars:3,front:'duck',body:'#d3d8dc',roof:'#b5bcc1',stripe:[{t:.24,h:.3,c:'#2b3135'},{t:.56,h:.045,c:'#f2a33a'},{t:.62,h:.38,c:'#a3aaaf'}],win:'#15191c',doors:1,doorsAtEnds:true,doorColor:'#c9ced2',panto:[1],motor:'vvvf',track:'しんかんせん',vmax:285},
 {id:'500',name:'500けい',reading:'しんかんせん',kind:'しんかんせん',cars:3,front:'nose',body:'#b4bdc6',roof:'#6f8fc4',stripe:[{t:0,h:.16,c:'#6f8fc4'},{t:.27,h:.24,c:'#45525e'},{t:.51,h:.08,c:'#2f78c4'}],win:'#26313a',doors:1,doorsAtEnds:true,doorColor:'#aeb6bd',panto:[1],motor:'vvvf',track:'しんかんせん',vmax:285}
];
/* 広電の車両は、その線路ができたら TRAINS と cards.js に戻す（2026-09-27 にいったん図鑑から外した。500系は 2026-10-04 に山陽新幹線と いっしょに戻した） */
const WAITING_TRAINS=[
 {id:'apex',name:'グリーンムーバー エイペックス',reading:'ひろでん 5200がた',kind:'ろめんでんしゃ',cars:2,front:'slant',body:'#3d454a',skirt:'#eceeee',skirtFrom:.68,stripe:{t:.64,h:.04,c:'#9bd13a'},roof:'#eceeee',win:'#1b2024',bigWin:true,doors:2,doorColor:'#4a5358',accent:'#eceeee',panto:[0],track:'ひろでん'}
];
const STARTER='redwing',byId=Object.fromEntries(TRAINS.map(t=>[t.id,t]));
/* 線路ごとに走れる車両がちがう（2026-10-04）：新幹線の線路（路線の track）は新幹線の車両だけ、ほかの線路は在来線の車両だけ。新幹線は N700A から */
const STARTERS={'':STARTER,'しんかんせん':'n700a'},track=()=>trip.line.track||'',rideable=t=>t&&(t.track||'')===track();

/* ---------- 車両の絵 ---------- */
function carShape(c,x,y,L,h,isFront,front){
  const r=h*.14;c.beginPath();c.moveTo(x+r*.6,y);
  if(isFront&&front==='nt'){c.lineTo(x+L-h*.18,y);c.quadraticCurveTo(x+L,y,x+L,y+h*.2);c.lineTo(x+L,y+h);}
  else if(isFront&&front==='slant'){c.lineTo(x+L-h*.26,y);c.quadraticCurveTo(x+L-h*.04,y+h*.02,x+L,y+h*.38);c.lineTo(x+L,y+h);}
  else if(isFront&&front==='round'){c.lineTo(x+L-h*.7,y);c.quadraticCurveTo(x+L,y,x+L,y+h*.7);c.lineTo(x+L,y+h);}
  else if(isFront&&front==='nose'){c.lineTo(x+L-h*2.6,y);c.bezierCurveTo(x+L-h*.8,y+h*.02,x+L,y+h*.55,x+L,y+h);}
  else if(isFront&&front==='aero'){c.lineTo(x+L-h*2.3,y);c.bezierCurveTo(x+L-h*1.1,y,x+L-h*.25,y+h*.4,x+L,y+h*.86);c.lineTo(x+L,y+h);} // N700系：エアロ・ダブルウィング
  else if(isFront&&front==='duck'){c.lineTo(x+L-h*2.1,y);c.bezierCurveTo(x+L-h*1.3,y+h*.04,x+L-h*.75,y+h*.62,x+L-h*.15,y+h*.7);c.quadraticCurveTo(x+L,y+h*.73,x+L,y+h);} // 700系：カモノハシ
  else{c.lineTo(x+L-r*.6,y);c.quadraticCurveTo(x+L,y,x+L,y+r*.6);c.lineTo(x+L,y+h);}
  c.lineTo(x,y+h);c.lineTo(x,y+r*.6);c.quadraticCurveTo(x,y,x+r*.6,y);c.closePath();
}
function wheel(c,x,y,r,ang){
  c.fillStyle='#1d2224';c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();
  c.strokeStyle='#6b7479';c.lineWidth=Math.max(1,r*.18);c.beginPath();
  for(let k=0;k<3;k++){const a=ang+k*Math.PI/3;c.moveTo(x-Math.cos(a)*r*.7,y-Math.sin(a)*r*.7);c.lineTo(x+Math.cos(a)*r*.7,y+Math.sin(a)*r*.7);}
  c.stroke();
}
function bogie(c,cx,yRail,h,ang){const w=h*.95,bh=h*.16;c.fillStyle='#3a4145';c.fillRect(cx-w/2,yRail-bh-h*.1,w,bh);wheel(c,cx-w*.3,yRail-h*.1,h*.1,ang);wheel(c,cx+w*.3,yRail-h*.1,h*.1,ang);}
function panto(c,x,roofY,h,wireY){
  c.strokeStyle='#2c3134';c.lineWidth=Math.max(1.5,h*.025);
  c.fillStyle='#4c5357';c.fillRect(x-h*.28,roofY-h*.05,h*.56,h*.05);
  const top=wireY??roofY-h*.42;
  c.beginPath();c.moveTo(x-h*.2,roofY-h*.05);c.lineTo(x+h*.12,(roofY+top)/2);c.lineTo(x-h*.05,top+2);c.stroke();
  c.beginPath();c.moveTo(x-h*.3,top+2);c.lineTo(x+h*.2,top+2);c.lineWidth=Math.max(2,h*.04);c.stroke();
}
/* NT3000形の「川面」：車体の まんなかに、少し明るい 波の 帯 */
function river(c,x,y,w,h,t){
  c.fillStyle=t.tint;c.beginPath();c.moveTo(x,y+h*.6);
  for(let k=0;k<=24;k++)c.lineTo(x+w*k/24,y+h*(.6+Math.sin(k*.9)*.03));
  for(let k=24;k>=0;k--)c.lineTo(x+w*k/24,y+h*(.84+Math.sin(k*.9+1.3)*.03));
  c.closePath();c.fill();
  c.strokeStyle='#ffffff99';c.lineWidth=Math.max(1,h*.018);
  for(const [yy,ph] of [[.67,0],[.76,1.7]]){c.beginPath();for(let k=0;k<=30;k++){const px=x+w*k/30,py=y+h*(yy+Math.sin(k*1.1+ph)*.02);k?c.lineTo(px,py):c.moveTo(px,py);}c.stroke();}
}
/* ラッピングの 模様。w は 顔を のぞいた 横の 長さ */
const WRAP={
  malle(c,i,x,y,w,h){ // La Malle de Bois：白い 車体に、まどを かばんのように かこむ 黒い 太い 線と、ふだのような 黒い わく
    c.fillStyle='#1b1f22';c.fillRect(x,y+h*.14,w,h*.05);c.fillRect(x,y+h*.52,w,h*.05);
    c.strokeStyle='#1b1f22';c.lineWidth=h*.025;for(const k of [.12,.58])c.strokeRect(x+w*k,y+h*.64,w*.28,h*.13);
  },
  carp(c,i,x,y,w,h){ // 赤い 車体に ほのおと 野球の ボール（ロゴや 選手の 絵は 描かない）
    c.fillStyle='#c8202a';c.fillRect(x,y+h*.1,w,h*.86);
    for(let k=0;k<4;k++){const fx=x+w*(.12+k*.24),fy=y+h*.55,g=c.createLinearGradient(fx,fy+h*.3,fx,fy-h*.4);g.addColorStop(0,'#ffcf3a');g.addColorStop(1,'#ff6a1a00');c.fillStyle=g;
      c.beginPath();c.moveTo(fx-h*.25,fy+h*.4);c.quadraticCurveTo(fx-h*.3,fy-h*.1,fx,fy-h*.45);c.quadraticCurveTo(fx+h*.05,fy,fx+h*.25,fy-h*.2);c.quadraticCurveTo(fx+h*.3,fy+h*.2,fx+h*.2,fy+h*.4);c.fill();}
    for(const k of [.3,.72]){const bx=x+w*k,by=y+h*.72;c.fillStyle='#fff';c.beginPath();c.arc(bx,by,h*.1,0,Math.PI*2);c.fill();c.strokeStyle='#d4262d';c.lineWidth=1;
      c.beginPath();c.arc(bx-h*.13,by,h*.1,-.7,.7);c.stroke();c.beginPath();c.arc(bx+h*.13,by,h*.1,Math.PI-.7,Math.PI+.7);c.stroke();}
  },
  greenmover(c,i,x,y,w,h,isFront){ // 白と 緑の 車体に オレンジの 縦の 帯
    c.fillStyle='#1d8a78';c.fillRect(x,y+h*.14,w,h*.62);c.fillStyle='#f39a26';c.fillRect(x+h*.08,y+h*.14,h*.1,h*.62);if(!isFront)c.fillRect(x+w-h*.18,y+h*.14,h*.1,h*.62);
    c.fillStyle='#ffffffcc';c.fillRect(x,y+h*.76,w,h*.02);
  },
  rose(c,i,x,y,w,h){ // バラと 花びら
    const flower=(fx,fy,r,col)=>{for(let k=0;k<3;k++){c.fillStyle=k%2?'#f6a0b8':col;c.beginPath();c.arc(fx,fy,r*(1-k*.3),0,Math.PI*2);c.fill();}c.fillStyle='#4f9a4a';c.beginPath();c.ellipse(fx-r*1.1,fy+r*.6,r*.55,r*.25,-.4,0,Math.PI*2);c.fill();};
    [[.18,.7,.2,'#e0457b'],[.5,.62,.26,'#d23a6a'],[.8,.72,.18,'#f07a3a'],[.35,.35,.12,'#e0457b'],[.66,.3,.1,'#f07a3a']].forEach(([a,b,r,col])=>flower(x+w*((a+i*.091)%1),y+h*b,h*r,col));
    c.fillStyle='#f7a3b0';for(let k=0;k<8;k++){c.beginPath();c.ellipse(x+w*((k*.137+i*.21)%1),y+h*(.25+(k*.29)%.6),h*.05,h*.025,k,0,Math.PI*2);c.fill();}
  },
  // 錦川鉄道 NT3000形 (2026-09-30): the 「川面」 band every car has, and each car's pictures made simple (t.tint is the lighter body color)
  seseragi(c,i,x,y,w,h,f,t){ // あゆと 葉っぱ
    river(c,x,y,w,h,t);
    const fish=(fx,fy,s,dir)=>{c.save();c.translate(fx,fy);c.scale(dir,1);c.fillStyle='#d9e7c9';c.beginPath();c.ellipse(0,0,h*.16*s,h*.05*s,0,0,Math.PI*2);c.fill();c.beginPath();c.moveTo(-h*.14*s,0);c.lineTo(-h*.24*s,-h*.05*s);c.lineTo(-h*.24*s,h*.05*s);c.closePath();c.fill();c.fillStyle='#5b6b4a';c.fillRect(-h*.06*s,-h*.045*s,h*.12*s,h*.012*s);c.fillStyle='#1d2427';c.beginPath();c.arc(h*.1*s,-h*.01*s,h*.012*s,0,Math.PI*2);c.fill();c.restore();};
    fish(x+w*.2,y+h*.72,1,1);fish(x+w*.55,y+h*.8,.8,-1);fish(x+w*.82,y+h*.7,1,1);
    const leaf=(lx,ly,r,a)=>{c.save();c.translate(lx,ly);c.rotate(a);c.fillStyle='#f0d64a';for(let k=0;k<5;k++){c.rotate(Math.PI*2/5);c.beginPath();c.ellipse(0,-r*.6,r*.22,r*.6,0,0,Math.PI*2);c.fill();}c.restore();};
    leaf(x+w*.1,y+h*.3,h*.1,.3);leaf(x+w*.42,y+h*.52,h*.08,1);leaf(x+w*.9,y+h*.35,h*.09,-.4);
  },
  hidamari(c,i,x,y,w,h,f,t){ // 白い さくら
    river(c,x,y,w,h,t);
    const flower=(fx,fy,r)=>{c.fillStyle='#fff6fa';for(let k=0;k<5;k++){const a=k*Math.PI*2/5-Math.PI/2;c.beginPath();c.ellipse(fx+Math.cos(a)*r*.55,fy+Math.sin(a)*r*.55,r*.42,r*.3,a,0,Math.PI*2);c.fill();}c.fillStyle='#f3c63c';c.beginPath();c.arc(fx,fy,r*.16,0,Math.PI*2);c.fill();};
    [[.14,.62,.2],[.45,.7,.24],[.78,.6,.22],[.3,.35,.12],[.63,.32,.1]].forEach(([a,b,r])=>flower(x+w*a,y+h*b,h*r));
    c.fillStyle='#ffffffcc';for(let k=0;k<9;k++){c.beginPath();c.ellipse(x+w*((k*.113+.05)%1),y+h*(.28+(k*.37)%.55),h*.035,h*.018,k,0,Math.PI*2);c.fill();}
  },
  komorebi(c,i,x,y,w,h,f,t){ // はっぱと カワセミ
    river(c,x,y,w,h,t);
    const leaf=(lx,ly,r,a)=>{c.save();c.translate(lx,ly);c.rotate(a);c.fillStyle='#3f8f3a';c.beginPath();c.ellipse(0,0,r,r*.42,0,0,Math.PI*2);c.fill();c.strokeStyle='#2c6d2a';c.lineWidth=Math.max(1,r*.08);c.beginPath();c.moveTo(-r,0);c.lineTo(r,0);c.stroke();c.restore();};
    [[.1,.4,.1,.5],[.18,.62,.12,-.4],[.5,.38,.09,.9],[.62,.6,.11,.2],[.88,.45,.1,-.7],[.93,.7,.08,.4]].forEach(([a,b,r,g])=>leaf(x+w*a,y+h*b,h*r,g));
    const bx=x+w*.33,by=y+h*.62,s=h*.14;
    c.fillStyle='#e9893a';c.beginPath();c.ellipse(bx,by+s*.25,s*.7,s*.55,0,0,Math.PI*2);c.fill();
    c.fillStyle='#2f7fd0';c.beginPath();c.ellipse(bx-s*.1,by-s*.1,s*.75,s*.5,-.2,0,Math.PI*2);c.fill();c.beginPath();c.arc(bx+s*.55,by-s*.45,s*.42,0,Math.PI*2);c.fill();
    c.fillStyle='#1d2427';c.beginPath();c.moveTo(bx+s*.9,by-s*.5);c.lineTo(bx+s*1.7,by-s*.35);c.lineTo(bx+s*.9,by-s*.3);c.closePath();c.fill();
    c.fillStyle='#fff';c.beginPath();c.arc(bx+s*.62,by-s*.52,s*.1,0,Math.PI*2);c.fill();c.fillStyle='#1d2427';c.beginPath();c.arc(bx+s*.64,by-s*.52,s*.05,0,Math.PI*2);c.fill();
    c.strokeStyle='#6b4a2a';c.lineWidth=Math.max(1,s*.12);c.beginPath();c.moveTo(bx-s*1.6,by+s*.85);c.lineTo(bx+s*1.4,by+s*.75);c.stroke();
  },
  kirameki(c,i,x,y,w,h,f,t){ // 草と ほたる
    river(c,x,y,w,h,t);
    c.strokeStyle='#3f8f3a';c.lineCap='round';
    for(let k=0;k<9;k++){const gx=x+w*(.06+k*.11),gy=y+h*.96;c.lineWidth=Math.max(1,h*.03);c.beginPath();c.moveTo(gx,gy);c.quadraticCurveTo(gx+h*(k%2?.2:-.15),gy-h*.35,gx+h*(k%2?.35:-.3),gy-h*(.55+(k%3)*.08));c.stroke();}
    c.lineCap='butt';
    for(const [a,b] of [[.16,.34],[.3,.5],[.52,.3],[.7,.46],[.86,.3],[.42,.62]]){const fx=x+w*a,fy=y+h*b,g=c.createRadialGradient(fx,fy,0,fx,fy,h*.1);g.addColorStop(0,'#fbffcfee');g.addColorStop(1,'#d6ff6a00');c.fillStyle=g;c.beginPath();c.arc(fx,fy,h*.1,0,Math.PI*2);c.fill();c.fillStyle='#2b2a22';c.beginPath();c.ellipse(fx-h*.02,fy,h*.025,h*.012,0,0,Math.PI*2);c.fill();}
  },
  hana(c,i,x,y,w,h){ // こげ茶の 車体に 金色の つる草と 花
    c.strokeStyle='#d4ad3c';c.fillStyle='#d4ad3c';c.lineWidth=Math.max(1,h*.025);
    for(let k=0;k<3;k++){const bx=x+w*(.18+k*.3),by=y+h*.86;c.beginPath();c.moveTo(bx,by);c.bezierCurveTo(bx-h*.2,by-h*.2,bx+h*.25,by-h*.3,bx+h*.05,by-h*.52);c.stroke();
      for(const [dx,dy,r] of [[.05,-.52,.07],[-.1,-.22,.05],[.16,-.34,.05]]){c.beginPath();c.arc(bx+h*dx,by+h*dy,h*r,0,Math.PI*2);c.fill();}}
  }
};
/* SLやまぐち号 (2026-10-02): C57形1号機。うしろから 炭水車・運転室・ボイラー。動輪3つ（白い ふち）と 前後の 小さい車輪、うごく ロッド、煙よけの 板、赤い 前の はり */
function steamLoco(c,x,yRail,h,L,o){
  const y=yRail-h*1.22,X=f=>x+L*f,blk='#1c1f21',edge='#3a4044',round=(a,b,w,hh,r)=>{c.beginPath();if(c.roundRect)c.roundRect(a,b,w,hh,r);else c.rect(a,b,w,hh);c.fill();}; // 古い Safari には roundRect がない
  c.fillStyle=blk;round(X(0),y+h*.26,L*.28,h*.66,h*.06); // 炭水車
  c.fillStyle='#2a2d2f';for(let k=0;k<4;k++){c.beginPath();c.arc(X(.04+k*.065),y+h*.27,h*.07,Math.PI,0);c.fill();}
  c.strokeStyle=edge;c.lineWidth=Math.max(1,h*.02);c.strokeRect(X(.02),y+h*.4,L*.24,h*.42);
  c.fillStyle=blk;c.fillRect(X(.29),y+h*.06,L*.16,h*.86);c.fillRect(X(.28),y,L*.18,h*.07); // 運転室と 屋根
  c.fillStyle='#e9dcb8';c.fillRect(X(.32),y+h*.16,L*.1,h*.26);c.fillStyle=blk;c.fillRect(X(.365),y+h*.16,L*.01,h*.26);
  c.fillStyle='#1d1d1d';c.fillRect(X(.315),y+h*.52,L*.11,h*.13);c.save();c.translate(X(.37),y+h*.59);if(c.getTransform().a<0)c.scale(-1,1);c.fillStyle='#d6b45a';c.font=`900 ${h*.1}px system-ui`;c.textAlign='center';c.textBaseline='middle';c.fillText('C57 1',0,0);c.restore(); // 運転画面は 左右を ひっくりかえして 描くので、文字だけ もどす
  c.fillStyle=blk;round(X(.45),y+h*.28,L*.45,h*.52,h*.2); // ボイラー
  c.fillStyle=edge;c.fillRect(X(.46),y+h*.32,L*.42,h*.04);for(const f of [.55,.67,.79])c.fillRect(X(f),y+h*.29,L*.008,h*.5);
  c.fillStyle=blk;round(X(.58),y+h*.17,L*.06,h*.14,h*.05);round(X(.68),y+h*.15,L*.07,h*.16,h*.06); // ドーム
  c.fillRect(X(.835),y+h*.07,L*.05,h*.24);c.fillRect(X(.825),y+h*.05,L*.07,h*.04); // えんとつ
  c.fillStyle='#232628';c.fillRect(X(.86),y+h*.22,L*.09,h*.5);c.strokeStyle=edge;c.strokeRect(X(.86),y+h*.22,L*.09,h*.5); // 煙よけの 板
  c.fillStyle=blk;c.fillRect(X(.93),y+h*.3,L*.05,h*.5);
  c.fillStyle=o.light?'#fff6c8':'#d8d2b4';c.beginPath();c.arc(X(.965),y+h*.22,h*.07,0,Math.PI*2);c.fill();c.fillStyle=blk;c.fillRect(X(.95),y+h*.26,L*.03,h*.05);
  c.fillStyle='#e6e6e2';c.fillRect(X(.45),y+h*.82,L*.53,h*.025); // 白い へり
  c.fillStyle='#b8312f';c.fillRect(X(.96),y+h*.8,L*.04,h*.2); // 赤い 前の はり
  c.fillStyle='#2b2f31';c.fillRect(X(.83),yRail-h*.5,L*.1,h*.2); // シリンダー
  const big=(cx,r)=>{c.fillStyle='#1d2224';c.beginPath();c.arc(cx,yRail-r,r,0,Math.PI*2);c.fill();c.strokeStyle='#eeeeea';c.lineWidth=Math.max(1.5,r*.12);c.beginPath();c.arc(cx,yRail-r,r*.92,0,Math.PI*2);c.stroke();
    c.strokeStyle='#6b7479';c.lineWidth=Math.max(1,r*.07);c.beginPath();for(let k=0;k<6;k++){const a=o.ang*.35+k*Math.PI/6;c.moveTo(cx-Math.cos(a)*r*.8,yRail-r-Math.sin(a)*r*.8);c.lineTo(cx+Math.cos(a)*r*.8,yRail-r+Math.sin(a)*r*.8);}c.stroke();c.fillStyle='#6b7479';c.beginPath();c.arc(cx,yRail-r,r*.18,0,Math.PI*2);c.fill();};
  const R=h*.29,drv=[.54,.66,.78].map(X);drv.forEach(cx=>big(cx,R));
  for(const f of [.07,.16,.24,.37,.44,.88,.95])wheel(c,X(f),yRail-h*.12,h*.12,o.ang);
  const a=o.ang*.35,pin=cx=>[cx+Math.cos(a)*R*.5,yRail-R+Math.sin(a)*R*.5];
  c.strokeStyle='#a9afb2';c.lineCap='round';c.lineWidth=Math.max(2,h*.05);c.beginPath();c.moveTo(...pin(drv[0]));c.lineTo(...pin(drv[2]));c.stroke(); // 連結棒
  c.lineWidth=Math.max(2,h*.06);c.beginPath();c.moveTo(...pin(drv[1]));c.lineTo(X(.87),yRail-h*.4);c.stroke();c.lineCap='butt'; // 主連棒
}
/* マリンライナー (2026-10-03): JR四国 5000系の 先頭は 2かいだて。上と 下に まどが ならび、下のほうに オレンジ・赤・むらさきの 帯。大きい 前の まどと こんの 帯 */
function doubleDecker(c,t,x,yRail,h,L,o){
  const H=h*1.5,y=yRail-h*.22-H,r=h*.14,shape=()=>{c.beginPath();c.moveTo(x+r,y);c.lineTo(x+L-h*1.2,y);c.quadraticCurveTo(x+L-h*.05,y+h*.04,x+L,y+H*.6);c.lineTo(x+L,y+H);c.lineTo(x,y+H);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath();};
  c.save();shape();c.fillStyle=t.body;c.fill();c.clip();c.fillStyle=t.roof;c.fillRect(x,y,L,H*.05);
  const a=x+h*.3,b=x+L-h*1.7;c.fillStyle=t.win;c.fillRect(a,y+H*.12,b-a,H*.24);c.fillStyle='#ffffff22';c.fillRect(a,y+H*.12,b-a,H*.06); // 2かいの まど
  const n=5,gw=(b-a-h*.5)/n;for(let k=0;k<n;k++){c.fillStyle=t.win;c.fillRect(a+h*.5+k*gw+h*.04,y+H*.46,gw-h*.08,H*.17);} // 1かいの まど
  [['#f2a33a',.7],['#e23b52',.75],['#6a4fb3',.8]].forEach(([col,f])=>{c.fillStyle=col;c.fillRect(x,y+H*f,b-x,H*.035);}); // 3色の 帯
  const d=a+h*.05,dw=h*.3,open=o.door*dw*.5;c.fillStyle='#20282b';c.fillRect(d,y+H*.42,dw,H*.54);c.fillStyle=t.doorColor;c.fillRect(d-open,y+H*.42,dw/2,H*.54);c.fillRect(d+dw/2+open,y+H*.42,dw/2,H*.54);
  if(o.door>0){c.fillStyle='#ffe9a8';c.globalAlpha=.35*o.door;c.fillRect(d+dw/2-open,y+H*.42,open*2,H*.54);c.globalAlpha=1;}
  c.fillStyle='#22305a';c.fillRect(x+L-h*1.5,y+H*.56,h*1.5,H*.07);c.fillRect(x+L-h*1.5,y+H*.86,h*1.5,H*.05); // こんの 帯
  c.fillStyle=t.win;c.beginPath();c.moveTo(x+L-h*1.2,y+H*.1);c.quadraticCurveTo(x+L-h*.25,y+H*.12,x+L-h*.04,y+H*.52);c.lineTo(x+L-h*1.2,y+H*.52);c.closePath();c.fill(); // 前の 大きい まど
  c.fillStyle=o.light?'#fff6c8':'#d8d2b4';c.beginPath();c.arc(x+L-h*.14,y+H*.72,h*.05,0,Math.PI*2);c.fill();
  c.restore();c.strokeStyle='#00000030';c.lineWidth=1.2;shape();c.stroke();
  c.fillStyle='#394044';c.fillRect(x+L*.3,y+H,L*.4,h*.1);c.fillStyle='#2b3134';c.beginPath();c.moveTo(x+L-h*.35,y+H);c.lineTo(x+L,y+H);c.lineTo(x+L-h*.05,yRail-h*.08);c.lineTo(x+L-h*.35,yRail-h*.08);c.fill();
  bogie(c,x+L*.17,yRail,h,o.ang);bogie(c,x+L*.83,yRail,h,o.ang);
}
/* 新幹線（2026-10-04 描き直し）：在来線より 長く 低い 車体、鼻の 長い 先頭、小さい 窓が 一列、片開きの ドア。front：aero＝N700系、duck＝700系（カモノハシ）、nose＝500系（とがった 長い 鼻） */
function shinCar(c,t,i,x,yRail,h,L,o){
  const isFront=i===0,bodyH=h*.9,y=yRail-h*1.1,nl=L*({aero:.4,duck:.38,nose:.5}[t.front]||.4),r=bodyH*(t.front==='nose'?.42:.26);
  const shape=()=>{c.beginPath();c.moveTo(x+r,y);
    if(!isFront){c.lineTo(x+L-r,y);c.quadraticCurveTo(x+L,y,x+L,y+r);c.lineTo(x+L,y+bodyH);}
    else if(t.front==='duck'){c.lineTo(x+L-nl,y);c.bezierCurveTo(x+L-nl*.66,y,x+L-nl*.5,y+bodyH*.12,x+L-nl*.42,y+bodyH*.32);c.quadraticCurveTo(x+L-nl*.3,y+bodyH*.5,x+L-nl*.12,y+bodyH*.52);c.lineTo(x+L-bodyH*.3,y+bodyH*.53);c.bezierCurveTo(x+L-bodyH*.05,y+bodyH*.54,x+L,y+bodyH*.62,x+L,y+bodyH*.76);c.quadraticCurveTo(x+L,y+bodyH,x+L-bodyH*.4,y+bodyH);} // 700系：運転席の 下から 平たい くちばしが 前に のび、先は まるい
    else if(t.front==='nose'){c.lineTo(x+L-nl,y);c.bezierCurveTo(x+L-nl*.55,y+bodyH*.02,x+L-nl*.2,y+bodyH*.42,x+L-bodyH*.12,y+bodyH*.66);c.quadraticCurveTo(x+L,y+bodyH*.72,x+L-bodyH*.14,y+bodyH*.79);c.bezierCurveTo(x+L-nl*.3,y+bodyH*.92,x+L-nl*.5,y+bodyH,x+L-nl*.72,y+bodyH);} // 500系：とても 長い 鼻、先は 下から 3わりくらいの ところ
    else{c.lineTo(x+L-nl,y);c.bezierCurveTo(x+L-nl*.7,y,x+L-nl*.5,y+bodyH*.12,x+L-nl*.35,y+bodyH*.26);c.bezierCurveTo(x+L-nl*.18,y+bodyH*.42,x+L-bodyH*.15,y+bodyH*.5,x+L,y+bodyH*.66);c.quadraticCurveTo(x+L-bodyH*.02,y+bodyH*.95,x+L-bodyH*.7,y+bodyH);}
    c.lineTo(x,y+bodyH);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath();};
  bogie(c,x+L*.14,yRail,h,o.ang);bogie(c,x+L*(isFront?.7:.86),yRail,h,o.ang);
  c.save();shape();c.fillStyle=t.body;c.fill();c.clip();
  const sl=isFront?L-nl*.98:L; // 帯は 鼻の 手前で おわる（鼻は 無地）
  for(const st of [].concat(t.stripe||[])){c.fillStyle=st.c;c.fillRect(x,y+bodyH*st.t,sl,bodyH*st.h);}
  if(isFront&&t.front==='nose'){c.fillStyle=t.roof;c.beginPath();c.moveTo(x+L-nl-2,y-2);c.lineTo(x+L+4,y-2);c.lineTo(x+L+4,y+bodyH*.74);c.quadraticCurveTo(x+L-nl*.3,y+bodyH*.52,x+L-nl-2,y+bodyH*.16);c.closePath();c.fill();} // 500系：屋根の 青が 鼻の 上がわを 鼻先まで ながれる
  c.fillStyle=t.roof;c.fillRect(x,y,sl,bodyH*.06);c.fillStyle='#00000018';c.fillRect(x,y+bodyH*.9,L,bodyH*.1);
  const dw=bodyH*.24,doors=[x+bodyH*.55,isFront?x+L-nl-bodyH*.3:x+L-bodyH*.55];
  const a=x+bodyH*.95,b=isFront?x+L-nl-bodyH*.65:x+L-bodyH*.95,ww=bodyH*.26,gap=bodyH*.15,n=Math.max(1,Math.floor((b-a+gap)/(ww+gap))),off=a+((b-a)-(n*ww+(n-1)*gap))/2;
  c.fillStyle=t.win;for(let k=0;k<n;k++){const wx=off+k*(ww+gap);c.beginPath();c.roundRect?c.roundRect(wx,y+bodyH*.3,ww,bodyH*.19,bodyH*.04):c.rect(wx,y+bodyH*.3,ww,bodyH*.19);c.fill();}
  for(const d of doors){c.fillStyle=t.doorColor;c.fillRect(d-dw/2,y+bodyH*.14,dw,bodyH*.76);c.strokeStyle='#0000002a';c.lineWidth=1;c.strokeRect(d-dw/2,y+bodyH*.14,dw,bodyH*.76);c.fillStyle=t.win;c.fillRect(d-dw*.25,y+bodyH*.24,dw*.5,bodyH*.2);
    if(o.door>0){c.fillStyle=`rgba(32,40,43,${.8*o.door})`;c.fillRect(d-dw/2,y+bodyH*.14,dw,bodyH*.76);c.fillStyle=`rgba(255,233,168,${.3*o.door})`;c.fillRect(d-dw/2,y+bodyH*.14,dw,bodyH*.76);}}
  if(isFront){c.fillStyle=t.win;c.beginPath();
    if(t.front==='duck'){c.moveTo(x+L-nl*.7,y+bodyH*.06);c.quadraticCurveTo(x+L-nl*.52,y+bodyH*.1,x+L-nl*.45,y+bodyH*.3);c.lineTo(x+L-nl*.5,y+bodyH*.4);c.quadraticCurveTo(x+L-nl*.62,y+bodyH*.36,x+L-nl*.74,y+bodyH*.3);c.closePath();}
    else if(t.front==='nose'){c.moveTo(x+L-nl*.66,y+bodyH*.13);c.quadraticCurveTo(x+L-nl*.5,y+bodyH*.15,x+L-nl*.4,y+bodyH*.27);c.quadraticCurveTo(x+L-nl*.52,y+bodyH*.28,x+L-nl*.66,y+bodyH*.22);c.closePath();}
    else{c.moveTo(x+L-nl*.66,y+bodyH*.05);c.quadraticCurveTo(x+L-nl*.5,y+bodyH*.1,x+L-nl*.36,y+bodyH*.26);c.lineTo(x+L-nl*.42,y+bodyH*.36);c.quadraticCurveTo(x+L-nl*.56,y+bodyH*.27,x+L-nl*.7,y+bodyH*.22);c.closePath();}
    c.fill();const [lx,ly]={aero:[.32,.64],duck:[.42,.62],nose:[.35,.74]}[t.front]||[.32,.64];c.fillStyle=o.light?'#fff6c8':'#d8d2b4';c.beginPath();c.ellipse(x+L-bodyH*lx,y+bodyH*ly,bodyH*.1,bodyH*.032,.3,0,Math.PI*2);c.fill();}
  c.restore();c.strokeStyle='#00000030';c.lineWidth=1.2;shape();c.stroke();
  if(t.panto&&t.panto.includes(i)){c.fillStyle='#b9c0c5';c.beginPath();c.roundRect?c.roundRect(x+L*.5-bodyH*.5,y-bodyH*.06,bodyH,bodyH*.08,bodyH*.04):c.rect(x+L*.5-bodyH*.5,y-bodyH*.06,bodyH,bodyH*.08);c.fill();panto(c,x+L*.5,y-bodyH*.04,h*.9,o.wireY);}
}
function drawCar(c,t,i,x,yRail,h,L,o){
  if(t.track)return shinCar(c,t,i,x,yRail,h,L,o);
  if(t.steam&&i===0)return steamLoco(c,x,yRail,h,L,o);
  if(t.dd&&i===0)return doubleDecker(c,t,x,yRail,h,L,o);
  const isFront=i===0,y=yRail-h*1.22,bodyH=h,isLoco=t.loco&&i===0,isWagon=t.loco&&i>0;
  if(isWagon){ // コンテナ車
    const deckY=yRail-h*.36,cols=['#b8343f','#3d74b5','#5a9a57','#c58a2a','#b8343f','#7c8c96'],cw=(L-h*.4)/3;
    c.fillStyle='#4a4f52';c.fillRect(x+2,deckY,L-4,h*.1);
    for(let k=0;k<3;k++){const cx=x+h*.2+k*cw;c.fillStyle=cols[(i*3+k)%cols.length];c.fillRect(cx+2,deckY-h*.62,cw-4,h*.62);
      c.strokeStyle='#0002';c.lineWidth=1;for(let s=1;s<6;s++){c.beginPath();c.moveTo(cx+2+s*(cw-4)/6,deckY-h*.6);c.lineTo(cx+2+s*(cw-4)/6,deckY-h*.02);c.stroke();}}
    bogie(c,x+L*.17,yRail,h*.85,o.ang);bogie(c,x+L*.83,yRail,h*.85,o.ang);return;
  }
  c.save();carShape(c,x,y,L,bodyH,isFront,t.front);c.fillStyle=t.body;c.fill();c.clip();
  if(t.skirt){c.fillStyle=t.skirt;c.fillRect(x,y+bodyH*t.skirtFrom,L,bodyH);}
  for(const st of [].concat(t.stripe||[])){c.fillStyle=st.c;c.fillRect(x,y+bodyH*st.t,L,bodyH*st.h);}
  if(t.wrap)WRAP[t.wrap](c,i,x,y,isFront?L-bodyH*.75:L,bodyH,isFront,t);
  if(t.front==='nt'){c.fillStyle='#b9bec1';c.fillRect(x,y+bodyH*.93,L,bodyH*.07);} // NT3000形の グレーの 床下
  c.fillStyle=t.roof;c.fillRect(x,y,L,bodyH*.07);
  const doors=[],dw=bodyH*.3;
  if(!isLoco&&t.doors){
    if(t.doorsAtEnds){const inset=bodyH*.55;doors.push(x+inset);if(t.doors>1||!isFront)doors.push(x+L-inset-(isFront?bodyH*.5:0));}
    else for(let k=0;k<t.doors;k++)doors.push(x+L*(k+.5)/t.doors-(isFront?bodyH*.12:0));
  }
  const wy=y+bodyH*.2,wh=bodyH*(t.bigWin?.36:.3);
  if(isLoco){for(let k=0;k<7;k++){c.fillStyle='#24476f';c.fillRect(x+L*.25+k*L*.065,y+bodyH*.22,L*.035,bodyH*.26);}}
  else{
    const edges=[x+bodyH*.3,...doors.flatMap(d=>[d-dw/2-bodyH*.12,d+dw/2+bodyH*.12]),x+L-(isFront?bodyH*.7:bodyH*.3)].sort((a,b)=>a-b);
    for(let k=0;k+1<edges.length;k+=2){const a=edges[k],b=edges[k+1];if(b-a<bodyH*.3)continue;
      const n=Math.max(1,Math.round((b-a)/(bodyH*(t.bigWin?.9:.62)))),gw=(b-a)/n;
      for(let j=0;j<n;j++){c.fillStyle=t.win;c.fillRect(a+j*gw+bodyH*.04,wy,gw-bodyH*.08,wh);c.fillStyle='#ffffff22';c.fillRect(a+j*gw+bodyH*.04,wy,gw-bodyH*.08,wh*.25);}}
  }
  for(const d of doors){
    if(t.frame){c.fillStyle=t.frame;c.fillRect(d-dw/2-bodyH*.07,y+bodyH*.08,dw+bodyH*.14,bodyH*.9);}
    const open=o.door*dw*.5;
    c.fillStyle='#20282b';c.fillRect(d-dw/2,y+bodyH*.12,dw,bodyH*.84);
    c.fillStyle=t.doorColor;c.fillRect(d-dw/2-open,y+bodyH*.12,dw/2,bodyH*.84);c.fillRect(d+open,y+bodyH*.12,dw/2,bodyH*.84);
    c.fillStyle=t.win;c.fillRect(d-dw/2-open+bodyH*.04,y+bodyH*.22,dw/2-bodyH*.07,bodyH*.26);c.fillRect(d+open+bodyH*.03,y+bodyH*.22,dw/2-bodyH*.07,bodyH*.26);
    if(o.door>0){c.fillStyle='#ffe9a8';c.globalAlpha=.35*o.door;c.fillRect(d-open,y+bodyH*.12,open*2,bodyH*.84);c.globalAlpha=1;}
  }
  if(t.emblem){const ex=x+L*.5,ey=y+bodyH*.72;c.fillStyle='#c9a24a';c.beginPath();c.arc(ex,ey,bodyH*.12,0,Math.PI*2);c.fill();c.strokeStyle='#1f3a70';c.lineWidth=bodyH*.02;c.stroke();}
  if(isLoco){ // ももたろうの印
    const ex=x+L*.55,ey=y+bodyH*.36;c.fillStyle='#f6a7b0';c.beginPath();c.arc(ex,ey,bodyH*.13,0,Math.PI*2);c.fill();
    c.fillStyle='#5aa84a';c.beginPath();c.ellipse(ex-bodyH*.08,ey+bodyH*.1,bodyH*.07,bodyH*.035,-.5,0,Math.PI*2);c.fill();
    c.strokeStyle='#ffffff99';c.lineWidth=2;for(let k=0;k<5;k++){c.beginPath();c.moveTo(x+L*.12+k*6,y+bodyH*.62);c.lineTo(x+L*.12+k*6,y+bodyH*.78);c.stroke();}
  }
  if(isFront){
    if(t.front==='nt'){ // NT3000形：角まで回りこむ 大きい 前面窓、運転席の 窓、まんなかの 扉の へり、低い ライト
      c.fillStyle=t.win;c.fillRect(x+L-bodyH*.58,y+bodyH*.16,bodyH*.26,bodyH*.34);
      c.fillStyle='#1d2427';c.beginPath();c.moveTo(x+L-bodyH*.22,y+bodyH*.12);c.lineTo(x+L,y+bodyH*.16);c.lineTo(x+L,y+bodyH*.54);c.lineTo(x+L-bodyH*.22,y+bodyH*.54);c.closePath();c.fill();
      c.fillStyle='#ffffff30';c.fillRect(x+L-bodyH*.2,y+bodyH*.16,bodyH*.18,bodyH*.08);
      c.fillStyle=t.deep;c.fillRect(x+L-bodyH*.07,y+bodyH*.56,bodyH*.07,bodyH*.36);
      c.fillStyle=o.light?'#fff6c8':'#f1edd6';c.beginPath();c.arc(x+L-bodyH*.13,y+bodyH*.78,bodyH*.05,0,Math.PI*2);c.fill();c.fillStyle='#d23a3a';c.beginPath();c.arc(x+L-bodyH*.13,y+bodyH*.66,bodyH*.03,0,Math.PI*2);c.fill();
    }
    else if(t.front==='aero'||t.front==='duck'){const k=t.front==='aero'?1:.92;c.fillStyle=t.win;c.beginPath();c.moveTo(x+L-bodyH*1.95*k,y+bodyH*.1);c.quadraticCurveTo(x+L-bodyH*1.15*k,y+bodyH*.12,x+L-bodyH*.85*k,y+bodyH*.34);c.lineTo(x+L-bodyH*1.75*k,y+bodyH*.36);c.closePath();c.fill();c.fillStyle=o.light?'#fff6c8':'#d8d2b4';c.beginPath();c.ellipse(x+L-bodyH*(t.front==='aero'?.42:.5),y+bodyH*.66,bodyH*.09,bodyH*.035,.35,0,Math.PI*2);c.fill();}
    else if(t.front==='nose'){c.fillStyle=o.light?'#fff6c8':'#d8d2b4';c.beginPath();c.ellipse(x+L-bodyH*.55,y+bodyH*.72,bodyH*.08,bodyH*.03,.3,0,Math.PI*2);c.fill();c.fillStyle=t.win;c.beginPath();c.moveTo(x+L-bodyH*2.1,y+bodyH*.12);c.quadraticCurveTo(x+L-bodyH*1.2,y+bodyH*.14,x+L-bodyH*.9,y+bodyH*.36);c.lineTo(x+L-bodyH*1.9,y+bodyH*.38);c.closePath();c.fill();}
    else{
      if(t.accent){c.fillStyle=t.accent;c.fillRect(x+L-bodyH*.62,y+bodyH*.5,bodyH*.62,bodyH*.16);if(t.accent2){c.fillStyle=t.accent2;c.fillRect(x+L-bodyH*.62,y+bodyH*.66,bodyH*.62,bodyH*.03);}}
      c.fillStyle=t.front==='slant'?'#1d2427':t.win;c.fillRect(x+L-bodyH*.26,y+bodyH*.14,bodyH*.26,bodyH*.34);
      c.fillStyle=o.light?'#fff6c8':'#d8d2b4';c.beginPath();c.arc(x+L-bodyH*.08,y+bodyH*.8,bodyH*.045,0,Math.PI*2);c.fill();
    }
  }
  c.restore();
  c.strokeStyle='#00000030';c.lineWidth=1.2;carShape(c,x,y,L,bodyH,isFront,t.front);c.stroke();
  c.fillStyle='#394044';c.fillRect(x+L*.3,y+bodyH,L*.4,h*.1);
  if(isFront){c.fillStyle='#2b3134';c.beginPath();c.moveTo(x+L-bodyH*.35,y+bodyH);c.lineTo(x+L,y+bodyH);c.lineTo(x+L-bodyH*.05,yRail-h*.08);c.lineTo(x+L-bodyH*.35,yRail-h*.08);c.fill();}
  bogie(c,x+L*.17,yRail,h,o.ang);bogie(c,x+L*.83,yRail,h,o.ang);if(isLoco)bogie(c,x+L*.5,yRail,h,o.ang);
  if(t.panto&&t.panto.includes(i)){panto(c,x+L*(isLoco?.25:.5),y,h,o.wireY);if(isLoco)panto(c,x+L*.75,y,h,o.wireY);}
  if(t.diesel){c.fillStyle='#3b3f41';c.fillRect(x+L*.45,y-bodyH*.06,bodyH*.12,bodyH*.07);}
}
/* 先頭の鼻先を x=0 として、うしろ（マイナス方向）へ車両をならべる */
function drawTrain(c,t,yRail,h,o){
  const L=h*(t.track?6.4:5),len=i=>t.loco&&i===0?L*.85:t.loco?L*.75:L;
  for(let i=t.cars-1;i>=0;i--){let x=0;for(let k=0;k<i;k++)x-=len(k)+h*.08;x-=len(i);
    if(i<t.cars-1){c.fillStyle='#2a2f31';c.fillRect(x-h*.1,yRail-h*.55,h*.12,h*.1);}
    drawCar(c,t,i,x,yRail,h,len(i),o);}
  if(t.pusher){let x=-h*.08;for(let k=0;k<t.cars;k++)x-=len(k)+h*.08; // いちばん うしろに、うしろ向きの 補機
    c.fillStyle='#2a2f31';c.fillRect(x-h*.02,yRail-h*.55,h*.12,h*.1);c.save();c.translate(x,0);c.scale(-1,1);drawCar(c,t,0,0,yRail,h,len(0),o);c.restore();}
}

/* ---------- おと ---------- */
/* おと あり／なしは アプリ全体の 設定（ホームと 運転画面の ボタン）。このブラウザに おぼえておく */
const SOUND_KEY='keisan-tetsudo-sound';
let soundOn=true,ac=null,motor=null,hornNode=null,shapeCurve=null,jaVoice=null;try{soundOn=localStorage.getItem(SOUND_KEY)!=='off';}catch(e){}
/* iPadでは 読み上げなどの あとで 音が 止まったまま（interrupted）に なることがある。
   さわるたびに 動かしなおし、止まったままなら 作りなおす（読みこんだ 効果音は そのまま つかえる） */
function audio(){if(ac&&ac.state!=='running'&&ac.state!=='suspended'){try{ac.close().catch(()=>{});}catch(e){}ac=null;motor=null;hornNode=null;}if(!ac){try{ac=new (window.AudioContext||window.webkitAudioContext)();}catch(e){ac=null;return null;}}if(ac.state==='suspended')ac.resume().catch(()=>{});return ac;}
/* おうちの方へ の「おとの テスト」：正解の音を 鳴らして、音の じょうたいを かえす */
function soundTest(){const a=audio();loadSfx();if(a&&soundOn&&!play('seikai',0))beep(1047,.3,'triangle',.08);return new Promise(ok=>setTimeout(()=>ok(`おと：${soundOn?'あり':'なし'} ／ しくみ：${ac?ac.state:'つかえない'} ／ 音ファイル：${Object.values(sfx).filter(b=>b instanceof AudioBuffer).length}/${Object.keys(SFX).length}`),500));}
function soundUI(){const t=soundOn?'おと あり':'おと なし',i=soundOn?'🔊':'🔈',d=$('drive-sound'),h=$('sound-toggle');d.setAttribute('aria-pressed',String(soundOn));d.textContent=`${i} ${t}`;if(h){h.setAttribute('aria-pressed',String(soundOn));h.setAttribute('aria-label',t);h.innerHTML=`${i}<span class="wide-only"> ${t}</span>`;}}
function toggleSound(){soundOn=!soundOn;try{localStorage.setItem(SOUND_KEY,soundOn?'on':'off');}catch(e){}soundUI();if(!soundOn){hornStop();try{speechSynthesis.cancel();}catch(e){}}else if(audio())beep(880,.18,'sine',.1);updateMotor(v,notch);}
function makeMotor(t){
  stopMotor();const a=audio();if(!a||t.steam)return; // SLは モーターの 音の かわりに シュッシュッ（tick）
  const g=a.createGain();g.gain.value=0;const f=a.createBiquadFilter();f.type='lowpass';
  const o1=a.createOscillator(),o2=a.createOscillator();
  if(t.diesel){o1.type='square';o2.type='sawtooth';f.frequency.value=260;}else{o1.type='sawtooth';o2.type='triangle';f.frequency.value=t.motor==='old'?500:1100;}
  o1.connect(f);o2.connect(f);f.connect(g);g.connect(a.destination);o1.start();o2.start();motor={g,o1,o2,t};
}
function stopMotor(){if(motor){try{motor.o1.stop();motor.o2.stop();}catch(e){}motor=null;}}
function updateMotor(v,notch){
  if(!motor||!ac)return;const now=ac.currentTime,t=motor.t;let f,gain;
  if(t.diesel){f=48+(notch===1?22:0)+v*2.2;gain=notch===1?.05:.022;}
  else if(t.motor==='old'){f=60+v*9;gain=notch===1?.035:notch===-1&&v>1?.02:.008;}
  else{const band=v<8?420+v*90:v<16?300+(v-8)*55:260+(v-16)*20;f=notch===1?band:60+v*6;gain=notch===1?.03:notch===-1&&v>1?.02:.006;} // VVVF：はやさで音が上がる
  if(!soundOn)gain=0;
  motor.o1.frequency.setTargetAtTime(f,now,.08);motor.o2.frequency.setTargetAtTime(f*1.5,now,.08);motor.g.gain.setTargetAtTime(gain,now,.12);
}
function beep(freq,dur,type='sine',vol=.12,when=0){
  const a=ac;if(!a||!soundOn)return;const t0=a.currentTime+when,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.value=freq;
  g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(vol,t0+.02);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);o.connect(g);g.connect(a.destination);o.start(t0);o.stop(t0+dur+.05);
}
function click(vol){
  const a=ac;if(!a||!soundOn)return;const n=a.sampleRate*.05|0,buf=a.createBuffer(1,n,a.sampleRate),d=buf.getChannelData(0);
  for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,4);
  const s=a.createBufferSource(),g=a.createGain(),f=a.createBiquadFilter();f.type='lowpass';f.frequency.value=700;g.gain.value=vol;s.buffer=buf;s.connect(f);f.connect(g);g.connect(a.destination);s.start();
}
/* えきスタンプを おす音（モックアップの打刻音）。スタンプは タップの 0.18びょうあとに 紙に つく（style.css の stamp-slam）→ トン＋カツッ → キラキラ → よみあげ */
function sweep(f0,f1,dur,type,vol,when){
  const a=ac;if(!a||!soundOn)return;const t0=a.currentTime+when,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f0,t0);o.frequency.exponentialRampToValueAtTime(f1,t0+dur);
  g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(vol,t0+.008);g.gain.exponentialRampToValueAtTime(.0001,t0+dur);o.connect(g);g.connect(a.destination);o.start(t0);o.stop(t0+dur+.05);
}
function hiss(dur,vol,when,f0,f1){
  const a=ac;if(!a||!soundOn)return;const t0=a.currentTime+when,n=a.sampleRate*dur|0,buf=a.createBuffer(1,n,a.sampleRate),d=buf.getChannelData(0);
  for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.sin(Math.PI*i/n);
  const s=a.createBufferSource(),g=a.createGain(),f=a.createBiquadFilter();f.type='bandpass';f.Q.value=1.2;f.frequency.setValueAtTime(f0,t0);f.frequency.exponentialRampToValueAtTime(f1,t0+dur);g.gain.value=vol;s.buffer=buf;s.connect(f);f.connect(g);g.connect(a.destination);s.start(t0);
}
/* 効果音ファイル（OtoLogic、CC BY 4.0。クレジットは sources.html）。どれも 頭に 約0.1びょうの 無音がある。
   キラーンは iPadで 聞きくらべて 低い音に きめた（2026-09-26 ゆかりさん）
   けいさんの 正解の音は iPadで 聞きくらべて 2に きめた（2026-09-26 ゆかりさん）
   車両カードの キラーン（高い音）と ジャジャーンは もじ鉄図鑑と おなじ（2026-10-01 ゆかりさん） */
const SFX={press:'assets/sound/stamp-press.mp3',kira:'assets/sound/stamp-kira-low.mp3',seikai:'assets/sound/correct-2.mp3',retry:'assets/sound/retry.mp3',cardKira:'assets/sound/card-kira.mp3',jajaan:'assets/sound/card-jajaan.mp3'},sfx={};
function loadSfx(){const a=audio();if(!a)return;for(const [k,u] of Object.entries(SFX))if(!sfx[k])sfx[k]=fetch(u).then(r=>{if(!r.ok)throw r.status;return r.arrayBuffer();}).then(b=>new Promise((ok,ng)=>a.decodeAudioData(b,ok,ng))).then(b=>sfx[k]=b,()=>{delete sfx[k];});}
function play(k,when,vol=1){
  const a=ac,b=sfx[k];if(!(b instanceof AudioBuffer))return false;if(!a||!soundOn)return true;
  const s=a.createBufferSource(),g=a.createGain();g.gain.value=vol;s.buffer=b;s.connect(g);g.connect(a.destination);s.start(a.currentTime+Math.max(0,when));return true;
}
function pon(reading){
  if(!audio())return;const hit=.18;loadSfx();
  if(!play('press',hit-.1))sweep(170,36,.14,'triangle',.7,hit),hiss(.04,.35,hit,1400,1400); // ポン（ファイルが まだ なければ 合成音の トン・カツッ）
  if(!play('kira',hit-.06,.8))[1047,1319,1568,2093].forEach((f,i)=>beep(f,.4,'triangle',.05,hit+.25+i*.07)); // キラーン（星と いっしょ）
  if(reading)setTimeout(()=>say(`${reading}えき、スタンプ ゲット！`),1100);
}
/* 起動して さいしょの 正解は、音ファイルが まだ 読みこみ中の ことがある。0.6びょうまでは 読みこみを まって ファイルの音を 鳴らし、まにあわなければ 合成音 */
function seikai(){if(!audio())return;loadSfx();const b=sfx.seikai;if(play('seikai',0))return;const beeps=()=>{beep(1047,.3,'triangle',.08);beep(1568,.5,'triangle',.08,.12);};if(!b)return beeps();let done=false;const t=setTimeout(()=>{done=true;beeps();},600);b.then(()=>{if(done)return;clearTimeout(t);if(!play('seikai',0))beeps();});} // けいさん 正解
function cardGet(){if(!audio())return;loadSfx();if(!play('cardKira',0))[1047,1319,1568,2093].forEach((f,i)=>beep(f,.4,'triangle',.05,i*.07));play('jajaan',.9,.6);} // 車両カード ゲット（キラーンの 0.9びょう あとに ジャジャーン。もじ鉄図鑑と おなじ）
function retry(){if(!audio())return;loadSfx();if(!play('retry',0))beep(523,.3,'sine',.08),beep(392,.45,'sine',.08,.2);} // もう一回（やさしく）
function chime(){beep(784,.5,'sine',.14);beep(659,.8,'sine',.14,.32);}
/* けいてき：おしている あいだ鳴る。2つの音を重ね、息の立ち上がりと ひずみ・山びこで空気笛らしくする */
function hornStart(){
  const a=audio();if(!a||!soundOn||hornNode)return;
  const t=cur||{};if(t.steam)return whistleStart(a);const notes=t.diesel?[262,330]:t.loco?[392,494]:[311,392],now=a.currentTime;
  if(!shapeCurve){shapeCurve=new Float32Array(1024);for(let i=0;i<1024;i++){const x=i/511.5-1;shapeCurve[i]=Math.tanh(3.5*x)/Math.tanh(3.5);}}
  const pre=a.createGain();pre.gain.value=.16;const sh=a.createWaveShaper();sh.curve=shapeCurve;
  const pk=a.createBiquadFilter();pk.type='peaking';pk.frequency.value=t.diesel?900:1500;pk.Q.value=1.1;pk.gain.value=7;
  const lp=a.createBiquadFilter();lp.type='lowpass';lp.frequency.value=t.diesel?2400:4800;
  const out=a.createGain();out.gain.setValueAtTime(0,now);out.gain.linearRampToValueAtTime(.55,now+.07);
  const comp=a.createDynamicsCompressor(),dly=a.createDelay(1),fb=a.createGain(),wet=a.createGain();dly.delayTime.value=.26;fb.gain.value=.25;wet.gain.value=.3;
  pre.connect(sh);sh.connect(pk);pk.connect(lp);lp.connect(out);out.connect(comp);out.connect(dly);dly.connect(fb);fb.connect(dly);dly.connect(wet);wet.connect(comp);comp.connect(a.destination);
  const lfo=a.createOscillator(),lg=a.createGain();lfo.frequency.value=5.5;lg.gain.value=2.5;lfo.connect(lg);lfo.start();
  const oscs=[];
  for(const f of notes)for(const d of [-8,0,8]){const o=a.createOscillator();o.type='sawtooth';o.detune.value=d;o.frequency.setValueAtTime(f*.88,now);o.frequency.exponentialRampToValueAtTime(f,now+.14);lg.connect(o.frequency);o.connect(pre);o.start();o.base=f;oscs.push(o);}
  hornNode={oscs,out,lfo,t0:now};
}
/* SLの 汽笛（ポーッ）：やわらかい 3つの 音に、ふく 息の シューという 音を まぜる */
function whistleStart(a){
  const now=a.currentTime,out=a.createGain();out.gain.setValueAtTime(0,now);out.gain.linearRampToValueAtTime(.32,now+.12);
  const lp=a.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3200;const dly=a.createDelay(1),fb=a.createGain(),wet=a.createGain();dly.delayTime.value=.3;fb.gain.value=.22;wet.gain.value=.35;
  out.connect(lp);lp.connect(a.destination);lp.connect(dly);dly.connect(fb);fb.connect(dly);dly.connect(wet);wet.connect(a.destination);
  const lfo=a.createOscillator(),lg=a.createGain();lfo.frequency.value=4.2;lg.gain.value=3;lfo.connect(lg);lfo.start();
  const oscs=[];for(const [f,type,vol] of [[392,'triangle',.5],[466,'sine',.4],[587,'triangle',.3],[784,'sine',.08]]){const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f*.86,now);o.frequency.exponentialRampToValueAtTime(f,now+.22);g.gain.value=vol;lg.connect(o.frequency);o.connect(g);g.connect(out);o.start();o.base=f;oscs.push(o);}
  const n=a.sampleRate*2|0,buf=a.createBuffer(1,n,a.sampleRate),d=buf.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;
  const air=a.createBufferSource(),bp=a.createBiquadFilter(),ag=a.createGain();air.buffer=buf;air.loop=true;bp.type='bandpass';bp.frequency.value=1400;bp.Q.value=.8;ag.gain.value=.12;air.connect(bp);bp.connect(ag);ag.connect(out);air.start();
  hornNode={oscs,out,lfo,air,t0:now};
}
function hornStop(){
  if(!hornNode||!ac)return;const h=hornNode;hornNode=null;const end=Math.max(ac.currentTime,h.t0+.45);if(h.air)h.air.stop(end+.8);
  h.out.gain.setTargetAtTime(0,end,.08);h.oscs.forEach(o=>{o.frequency.setTargetAtTime(o.base*.95,end,.12);o.stop(end+.8);});h.lfo.stop(end+.8);
}
function pickVoice(){try{const vs=speechSynthesis.getVoices().filter(v=>/^ja/i.test(v.lang));jaVoice=vs.find(v=>/Kyoko|O-ren|Otoya|Siri/i.test(v.name))||vs[0]||null;}catch(e){}}
if('speechSynthesis' in root){pickVoice();speechSynthesis.onvoiceschanged=pickVoice;}
// 読み上げで読み方やアクセントが変わる駅は、routes.js の say（読み上げ用の表記）を使う
const spoken=st=>st.say||st.reading;
function say(text){if(!soundOn||!('speechSynthesis' in root))return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='ja-JP';if(jaVoice)u.voice=jaVoice;u.rate=.92;u.pitch=1.05;speechSynthesis.speak(u);}catch(e){}}

/* ---------- はしる ---------- */
const END=220,VMAX=25,ACC=5,BRK=5,STOP_OK=6; // m, m/s, m/s²。停止位置の手前 STOP_OK m 以内で とうちゃく
let cur=null,trip=null,phase='closed',s=0,v=0,notch=0,auto=false,doorT=1,doorTarget=1,lastJoint=0,lastChuff=0,near=false,smoke=[],raf=0,lastT=0,timers=[];
let cv,ctx,W=0,H=0;
const later=(fn,ms)=>timers.push(setTimeout(fn,ms));
function resize(){if(!cv)return;const dpr=Math.min(2,root.devicePixelRatio||1);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}
function setMsg(m){$('drive-msg').textContent=m;}
function setNotch(n){notch=n;notchUI(true);}
function notchUI(enabled){
  document.querySelectorAll('#drive .notch').forEach(b=>{b.disabled=!enabled;b.classList.toggle('on',+b.dataset.n===notch);b.setAttribute('aria-pressed',String(+b.dataset.n===notch));});
  const top={1:0,0:50,'-1':100}[notch];$('drive-knob').style.top=`calc(${top}% - ${top*.26}px)`;
}
function showScreen(name){$('drive-run').hidden=name!=='run';$('drive-choose').hidden=name!=='choose';}
function resetRun(){
  timers.forEach(clearTimeout);timers=[];
  phase='ready';s=0;v=0;notch=0;auto=false;doorT=1;doorTarget=1;lastJoint=0;lastChuff=0;near=false;smoke=[];
  $('drive-console').hidden=false;$('drive-arrive').hidden=true;$('drive-door').hidden=false;$('drive-door').disabled=false;$('drive-change').hidden=false;$('drive-skip').hidden=false;
  notchUI(false);setMsg('ドアを しめて しゅっぱつ しよう！');$('drive-led').textContent=`${trip.to.reading} ゆき`;$('drive-kind').textContent=cur.kind;
  document.querySelector('#drive .n-brake').classList.remove('hint');
}
function start(id){
  cur=rideable(byId[id])?byId[id]:byId[STARTERS[track()]||STARTER];showScreen('run');resize();resetRun();makeMotor(cur);
  say(`この でんしゃは、${spoken(trip.to)} ゆき です。`);
  if(!raf){lastT=performance.now();raf=requestAnimationFrame(tick);}
}
function arrive(kind){
  phase='arrived';notch=0;notchUI(false);doorTarget=1;$('drive-skip').hidden=true;$('drive-change').hidden=true;
  document.querySelector('#drive .n-brake').classList.remove('hint');
  const r=trip.to.reading,quick=kind==='skip';$('drive-led').textContent=r;
  later(()=>{chime();say(`${spoken(trip.to)}、${spoken(trip.to)}。`);},quick?50:500);
  later(()=>{
    $('drive-console').hidden=true;$('drive-arrive').hidden=false;
    $('drive-rating').textContent=kind==='skip'?`${r}に ついたよ`:kind==='perfect'?'ぴったり ていしゃ！ すごい うんてんしさん！':kind==='auto'?'じどうブレーキで ぴたっと とまったよ':'じょうずに とまれたね！';
    $('drive-done').focus();
  },quick?200:1700);
}
function skipRun(){if(phase!=='ready'&&phase!=='run')return;s=END;v=0;auto=false;notch=0;$('drive-door').hidden=true;arrive('skip');}
function finish(){
  if(phase==='closed')return;phase='closed';timers.forEach(clearTimeout);timers=[];stopMotor();hornStop();
  try{speechSynthesis.cancel();}catch(e){}
  cancelAnimationFrame(raf);raf=0;const done=trip.onDone;trip=null;$('drive').close();done();
}
function tick(now){
  raf=requestAnimationFrame(tick);
  const dt=Math.min(.05,(now-lastT)/1000);lastT=now;
  if(phase==='closed'||$('drive-run').hidden)return;
  doorT+=(doorTarget-doorT)*Math.min(1,dt*3);
  if(phase==='run'){
    const rem=END-s,need=v*v/(2*BRK);let a;
    if(!auto&&v>1&&need>=rem-.5&&notch!==-1)auto=true;
    if(auto)a=rem>.02?-Math.min(8,v*v/(2*rem)):-8;
    else a=notch===1?(v<VMAX?ACC*(1-v/VMAX*.4):0):notch===-1?-BRK:-.05;
    v=Math.max(0,v+a*dt);s=Math.min(END,s+v*dt);
    if(s>=END-.01){s=END;v=0;}
    if(auto&&v===0)s=END;
    if(s-lastJoint>=25&&v>1){lastJoint=Math.floor(s/25)*25;const vol=Math.min(.5,v/40+.08);click(vol);later(()=>click(vol*.8),Math.max(40,Math.min(260,2600/v)));} // レールのつなぎめ
    if(cur.diesel&&notch===1&&Math.random()<dt*14)smoke.push({x:s-10,y:0,r:4,life:1});
    if(cur.steam&&v>.5&&s-lastChuff>=2.2){lastChuff=s;hiss(.16,notch===1?.5:.18,0,1100,420);if(notch===1)smoke.push({x:s-2.9,y:0,r:H*.025,g:H*.07,life:1,dark:true});} // シュッシュッと 黒い けむり
    const r=END-s,hintBrake=!auto&&notch!==-1&&v>3&&need>=r-40;
    document.querySelector('#drive .n-brake').classList.toggle('hint',hintBrake);
    if(!near&&r<110){near=true;$('drive-led').textContent=`まもなく ${trip.to.reading}`;say(`まもなく、${spoken(trip.to)} です。`);}
    if(auto)setMsg('じどうブレーキが はたらいているよ');
    else if(hintBrake)setMsg('そろそろ ブレーキ！');
    else if(notch===1)setMsg(v>=VMAX-.3?'さいこう そくど！':'かそく ちゅう');
    else if(notch===-1&&v>0)setMsg('ブレーキ ちゅう');
    else if(v>0)setMsg('そのまま すすむよ');
    if(v===0&&s>40&&(notch!==1||s>=END||auto)){
      if(r<=STOP_OK)arrive(auto?'auto':r<=1.5?'perfect':'ok');
      else if(notch!==1)setMsg('「3」の ひょうしきまで もうすこし！「すすむ」で すすもう');
    }
  }
  if(cur.steam&&phase!=='closed'&&Math.random()<dt*2)smoke.push({x:s-2.9,y:0,r:H*.02,g:H*.05,life:.8}); // とまっていても すこし 白い ゆげ
  smoke.forEach(p=>{p.y+=dt*18;p.r+=dt*(p.g||14);p.life-=dt*.8;});smoke=smoke.filter(p=>p.life>0);
  $('drive-speed').textContent=Math.round(v*3.6*(cur.vmax||90)/90); // 走る長さは同じで、メーターは車両の最高速度に合わせる
  $('drive-state').textContent=phase==='ready'?'とまっています':phase==='arrived'?'とうちゃく':notch===1?'すすむ':notch===-1?'ブレーキ':'そのまま';
  const pct=100-s/END*100;$('drive-me').style.left=pct+'%';$('drive-done-bar').style.width=(100-pct)+'%';
  updateMotor(v,phase==='run'?notch:0);draw();
}

/* ---------- けしき（東へ すすむと 左。線路の山がわから見る）。広島・防府〜新山口・福山・倉敷〜岡山〜備前西市の街なか、内陸と岡山〜児島の山あい（上の町〜児島は海ぞい）、それ以外は瀬戸内の海ぞい ---------- */
const TOWN=new Set(['新井口','西広島','横川','新白島','広島','天神川','向洋','海田市','三滝','安芸長束','下祇園','矢賀','防府','大道','四辻','新山口','東福山','福山','倉敷','中庄','庭瀬','北長瀬','岡山','大元','備前西市']);
const INLAND=new Set(['安芸中野','中野東','瀬野','八本松','寺家','西条','西高屋','白市','入野','河内','本郷','妹尾','備中箕島','早島','久々原','茶屋町','植松','木見']);
function sceneFor(from,to,line){if(line.track)return 'shin';if(TOWN.has(from.id)&&TOWN.has(to.id))return 'town';if(['kabe','geibi','gantoku','seiryu'].includes(line.id)||INLAND.has(from.id)||INLAND.has(to.id))return 'hills';return 'sea';}
/* えきスタンプの模様。lines はその駅を通る路線の id */
function stationScene(id,lines){if(TOWN.has(id)||lines.every(l=>l==='shinkansen'))return 'town';if(INLAND.has(id)||lines.every(l=>['kabe','geibi','gantoku','seiryu'].includes(l)))return 'hills';return 'sea';}
const rnd=k=>{const x=Math.sin(k*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const loop=(k,gap,p,sc)=>((k*gap+s*sc*p)%(W+gap)+W+gap)%(W+gap)-gap/2;
function draw(){
  if(!W||!H)return;const c=ctx,hC=H*.2,L=hC*5,sc=L/20,yRail=H*.86,frontX=W*.37,wx=m=>frontX-(m-s)*sc;
  let g=c.createLinearGradient(0,0,0,H*.55);g.addColorStop(0,'#8ec5e6');g.addColorStop(1,'#d9edf5');c.fillStyle=g;c.fillRect(0,0,W,H);
  c.fillStyle='#ffffffcc';for(let k=0;k<6;k++){const px=((k*420+s*sc*.03)%(W+400))-200,py=H*(.08+(k%3)*.07);cloud(c,px,py,H*.05);}
  ({sea,hills,town,shin:hills})[trip.scene](c,sc);
  const wireY=yRail-hC*1.22-hC*.42,electric=!['geibi','gantoku','seiryu'].includes(trip.line.id); // 芸備線・岩徳線・錦川清流線は非電化
  if(electric){c.strokeStyle='#5e6a6e';c.lineWidth=Math.max(2,hC*.05);const p0=Math.floor((s-40)/50)*50;
    for(let m=p0-100;m<s+W/sc+100;m+=50){const x=wx(m);if(x<-20||x>W+20)continue;c.beginPath();c.moveTo(x,yRail-hC*.1);c.lineTo(x,wireY-hC*.3);c.lineTo(x+hC*.5,wireY-hC*.3);c.stroke();}
    c.strokeStyle='#39424599';c.lineWidth=1.2;c.beginPath();c.moveTo(0,wireY);c.lineTo(W,wireY);c.moveTo(0,wireY-hC*.3);c.lineTo(W,wireY-hC*.3);c.stroke();}
  c.fillStyle='#a79d8c';c.fillRect(0,yRail-2,W,H-yRail+2);
  c.fillStyle='#6d5a48';const sl=.65*sc,off=((s*sc)%sl+sl)%sl;for(let x=-sl+off;x<W+sl;x+=sl)c.fillRect(x,yRail+2,sl*.45,H*.03);
  c.fillStyle='#8c9296';c.fillRect(0,yRail-1,W,3);
  if(trip.scene==='shin')shinkansen(c,wx,hC,yRail);
  c.save();c.translate(frontX,0);c.scale(-1,1);drawTrain(c,cur,yRail,hC,{ang:-s/.43,door:doorT,light:true,wireY:electric?wireY:undefined});c.restore();
  for(const p of smoke){c.fillStyle=p.dark?`rgba(55,55,58,${.5*p.life})`:`rgba(${cur.steam?'235,235,235':'90,90,90'},${(cur.steam?.6:.35)*p.life})`;c.beginPath();c.arc(wx(p.x),yRail-hC*1.3-p.y,p.r,0,Math.PI*2);c.fill();}
  platform(c,wx,0,trip.from,trip.to,hC,yRail);platform(c,wx,END,trip.to,trip.next,hC,yRail);
}
/* 新幹線（2026-10-04）：むこうがわの防音壁と、トンネル（区間のまんなかあたり）。トンネルの中は暗く、入口は コンクリートの坑口 */
function shinkansen(c,wx,hC,yRail){
  const wallTop=yRail-hC*.5;c.fillStyle='#c9cdcf';c.fillRect(0,wallTop,W,yRail-wallTop);c.fillStyle='#b3b8bb';c.fillRect(0,wallTop,W,hC*.06);
  c.strokeStyle='#a9aeb1';c.lineWidth=1;const step=hC*.9,off=((s*(hC*5/20))%step+step)%step;for(let x=off-step;x<W+step;x+=step){c.beginPath();c.moveTo(x,wallTop+hC*.06);c.lineTo(x,yRail);c.stroke();}
  for(const [m0,m1] of [[70,135]]){const x0=wx(m1),x1=wx(m0);if(x1<-50||x0>W+50)continue;
    c.fillStyle='#2a2f33';c.fillRect(x0,0,x1-x0,yRail);c.fillStyle='#f3d27a55';for(let m=m0+8;m<m1;m+=16){const x=wx(m);c.fillRect(x-3,H*.25,6,3);}
    for(const x of [x0,x1]){c.fillStyle='#9ea4a7';c.fillRect(x-hC*.18,0,hC*.36,yRail);c.fillStyle='#878d90';c.fillRect(x-hC*.18,yRail-hC*1.9,hC*.36,hC*.12);}}
}
function sea(c,sc){
  const mx=W*.62+s*sc*.035,seaY=H*.5; // 沖の島
  c.fillStyle='#7f9aa4';c.beginPath();c.moveTo(mx-W*.5,seaY);c.bezierCurveTo(mx-W*.3,seaY-H*.08,mx-W*.15,seaY-H*.22,mx,seaY-H*.27);c.bezierCurveTo(mx+W*.08,seaY-H*.2,mx+W*.12,seaY-H*.23,mx+W*.2,seaY-H*.16);c.bezierCurveTo(mx+W*.35,seaY-H*.08,mx+W*.45,seaY-H*.03,mx+W*.6,seaY);c.fill();
  c.fillStyle='#96b0b8';c.beginPath();c.moveTo(mx-W*.9,seaY);c.bezierCurveTo(mx-W*.75,seaY-H*.06,mx-W*.62,seaY-H*.1,mx-W*.5,seaY-H*.05);c.lineTo(mx-W*.45,seaY);c.fill();
  const g=c.createLinearGradient(0,seaY,0,H*.7);g.addColorStop(0,'#4e8fb5');g.addColorStop(1,'#6fb0cf');c.fillStyle=g;c.fillRect(0,seaY,W,H*.25);
  c.strokeStyle='#ffffff55';c.lineWidth=1.5;for(let k=0;k<14;k++){const px=((k*137+s*sc*.12)%(W+60))-30,py=seaY+H*(.02+((k*7)%5)*.035);c.beginPath();c.moveTo(px,py);c.lineTo(px+14,py);c.stroke();}
  c.strokeStyle='#3d4b4f';c.lineWidth=1.2; // かきいかだ
  for(let k=0;k<5;k++){const px=((k*310+s*sc*.18)%(W+300))-150,py=seaY+H*(.05+(k%2)*.05),rw=H*.22,rh=H*.018;
    for(let j=0;j<=6;j++){c.beginPath();c.moveTo(px+j*rw/6,py);c.lineTo(px+j*rw/6-rh,py+rh);c.stroke();}c.beginPath();c.moveTo(px,py);c.lineTo(px+rw,py);c.moveTo(px-rh,py+rh);c.lineTo(px+rw-rh,py+rh);c.stroke();}
  const landY=H*.7;c.fillStyle='#9fbf86';c.fillRect(0,landY,W,H);
  for(let k=0;k<12;k++){const px=((k*190+s*sc*.45)%(W+300))-150,hh=H*(.05+(k%3)*.018);
    if(k%3===1){c.fillStyle='#5f8c55';c.beginPath();c.arc(px,landY-hh*.4,hh*.7,0,Math.PI*2);c.fill();}
    else{c.fillStyle=['#e8e1d3','#d9d2c4','#efe9dc'][k%3];c.fillRect(px,landY-hh,hh*1.6,hh);c.fillStyle=['#7a4b3a','#465a6b','#8a6a45'][k%3];c.beginPath();c.moveTo(px-hh*.15,landY-hh);c.lineTo(px+hh*.8,landY-hh*1.55);c.lineTo(px+hh*1.75,landY-hh);c.fill();}}
}
function hills(c,sc){
  const ridge=(p,base,amp,col,seed)=>{c.fillStyle=col;c.beginPath();c.moveTo(0,H);const off=s*sc*p;for(let x=0;x<=W+20;x+=20){const u=(x-off)/W;c.lineTo(x,base-amp*(.55+.25*Math.sin(u*5.1+seed)+.2*Math.sin(u*11.3+seed*2)));}c.lineTo(W,H);c.fill();};
  ridge(.03,H*.52,H*.26,'#a7bcc0',1);ridge(.08,H*.6,H*.2,'#86a58f',4);
  const fieldY=H*.6;c.fillStyle='#b9cf8f';c.fillRect(0,fieldY,W,H);
  c.strokeStyle='#a2bb78';c.lineWidth=2;for(let k=0;k<5;k++){const y=fieldY+H*(.02+k*.022);c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke();} // たんぼの あぜ
  for(let k=0;k<7;k++){const px=loop(k,260,.3,sc),y=fieldY+H*.02;c.strokeStyle='#8fa865';c.beginPath();c.moveTo(px,y);c.lineTo(px-H*.05,fieldY+H*.11);c.stroke();}
  for(let k=0;k<10;k++){const px=loop(k,210,.5,sc),hh=H*(.05+rnd(k)*.04),y=H*.72;
    if(rnd(k+9)<.6){c.fillStyle=rnd(k+3)<.5?'#4f7d4a':'#628f55';c.beginPath();c.ellipse(px,y-hh*.7,hh*.45,hh*.8,0,0,Math.PI*2);c.fill();c.fillStyle='#6b4f3a';c.fillRect(px-2,y-hh*.1,4,hh*.2);}
    else{c.fillStyle='#ece5d6';c.fillRect(px,y-hh,hh*1.5,hh);c.fillStyle='#5b5f66';c.beginPath();c.moveTo(px-hh*.2,y-hh);c.lineTo(px+hh*.75,y-hh*1.6);c.lineTo(px+hh*1.7,y-hh);c.fill();}}
  c.fillStyle='#9fbf86';c.fillRect(0,H*.72,W,H);
}
function town(c,sc){
  for(const [p,base,col,win] of [[.05,H*.62,'#b8c6cf',null],[.18,H*.7,null,'#e9f2f6']]){
    for(let k=0;k<16;k++){const bw=W*(.07+rnd(k*7+p*100)*.06),px=loop(k,W*.14,p,sc),bh=H*(win?.14+rnd(k+p)*.2:.2+rnd(k*3)*.22);
      c.fillStyle=col||['#d7d2c8','#c9d3d8','#e3ddd0','#b9c2c9'][k%4];c.fillRect(px,base-bh,bw,bh);
      if(win){c.fillStyle='#7f98a8';for(let y=base-bh+6;y<base-8;y+=12)for(let x=px+5;x<px+bw-8;x+=11)c.fillRect(x,y,6,6);}}}
  c.fillStyle='#b9bdb8';c.fillRect(0,H*.7,W,H);c.fillStyle='#8f9591';c.fillRect(0,H*.72,W,H*.02); // 道路
  for(let k=0;k<9;k++){const px=loop(k,230,.45,sc);c.fillStyle='#5f8c55';c.beginPath();c.arc(px,H*.7,H*.035,0,Math.PI*2);c.fill();}
}
function cloud(c,x,y,r){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.arc(x+r*1.1,y-r*.4,r*1.2,0,Math.PI*2);c.arc(x+r*2.3,y,r*.9,0,Math.PI*2);c.fill();}
function platform(c,wx,stop,st,next,hC,yRail){
  const a=wx(stop+18),b=wx(stop-70);if(Math.max(a,b)<-400||Math.min(a,b)>W+400)return;
  const x0=Math.min(a,b),x1=Math.max(a,b),top=yRail-hC*.3,font='-apple-system,"Hiragino Sans",sans-serif';
  c.fillStyle='#d8d4ca';c.fillRect(x0,top,x1-x0,yRail-top+H);c.fillStyle='#f2c230';c.fillRect(x0,top+hC*.06,x1-x0,hC*.06);c.fillStyle='#b9b3a6';c.fillRect(x0,top,x1-x0,hC*.04);
  const sx=wx(stop);c.fillStyle='#2b3336';c.fillRect(sx-1.5,top-hC*.55,3,hC*.55); // 停止位置目標
  c.fillStyle='#fff';c.strokeStyle='#e0572e';c.lineWidth=2.5;c.beginPath();c.rect(sx-hC*.17,top-hC*.85,hC*.34,hC*.32);c.fill();c.stroke();
  c.fillStyle='#e0572e';c.font=`900 ${hC*.22}px system-ui`;c.textAlign='center';c.textBaseline='middle';c.fillText('3',sx,top-hC*.69);
  const bw=Math.min(hC*2.6,W*.3),bh=hC*.95,by=top-hC*1.35,nx=wx(stop+Math.min(9,(W*.37-bw/2-8)/(wx(stop)-wx(stop+1)))); // 駅名標（縦長の画面では小さくして、画面の左からはみ出さない位置へ寄せる）
  c.fillStyle='#2b3336';c.fillRect(nx-bw*.35,by+bh,4,top-by-bh);c.fillRect(nx+bw*.35,by+bh,4,top-by-bh);
  c.fillStyle='#fff';c.fillRect(nx-bw/2,by,bw,bh);c.strokeStyle='#9aa4a6';c.lineWidth=1;c.strokeRect(nx-bw/2,by,bw,bh);
  c.fillStyle=trip.line.color;c.fillRect(nx-bw/2,by+bh*.62,bw,bh*.14);
  c.fillStyle='#193d47';c.textBaseline='alphabetic';c.font=`800 ${Math.min(bh*.36,bw*.9/Math.max(3,st.reading.length))}px ${font}`;c.fillText(st.reading,nx,by+bh*.45);
  c.font=`700 ${bh*.14}px ${font}`;c.fillText(st.name,nx,by+bh*.58);
  if(next){c.textAlign='left';c.fillText('← '+next.reading,nx-bw*.47,by+bh*.93);}
}

/* ---------- 車両をえらぶ ---------- */
function thumb(canvas,t,locked){
  const dpr=Math.min(2,root.devicePixelRatio||1),w=canvas.clientWidth||220,hh=84;canvas.width=w*dpr;canvas.height=hh*dpr;
  const c=canvas.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);const h=30,yRail=hh*.72+h*.1;
  c.save();c.translate(w-12,0);drawTrain(c,t,yRail,h,{ang:0,door:0,light:!locked});c.restore();
  c.fillStyle='#8a8172';c.fillRect(0,yRail,w,2);
  if(locked){c.globalCompositeOperation='source-atop';c.fillStyle='#3f5057';c.fillRect(0,0,w,yRail);c.globalCompositeOperation='source-over';c.fillStyle='#fff';c.font='900 26px system-ui';c.textAlign='center';c.fillText('？',w*.55,yRail-h*.45);}
}
function choose(){
  stopMotor();phase='ready';showScreen('choose');const g=$('drive-grid');g.innerHTML='';
  for(const t of TRAINS){
    const have=trip.owned.includes(t.id),other=have&&!rideable(t),card=trip.cards.find(c=>c.id===t.id),b=document.createElement('button');
    b.className='drive-train '+(have?(other?'other-track':'ok'):'locked')+(t.id===cur.id?' current':'');b.disabled=!have||other;b.dataset.train=t.id;
    b.innerHTML=`<canvas aria-hidden="true"></canvas><span class="drive-train-body"><small>${have?esc(t.reading):'？？？'}</small><b>${have?esc(t.name):'？？？？'}</b><span>${other?`${t.track||'ざいらいせん'}の せんろで はしれるよ`:have?(t.id===cur.id?'いま えらんでいる でんしゃ':'▶ これで はしる'):`${esc(card?card.station:'')}えきで のれるように なるよ`}</span></span>`;
    b.onclick=()=>{trip.onTrain(t.id);start(t.id);};g.appendChild(b);requestAnimationFrame(()=>thumb(b.querySelector('canvas'),t,!have));
  }
}

let wired=false;
function wire(){
  if(wired)return;wired=true;cv=$('drive-canvas');ctx=cv.getContext('2d');new ResizeObserver(resize).observe(cv);
  document.querySelectorAll('#drive .notch').forEach(b=>b.addEventListener('click',()=>{if(phase==='run')setNotch(+b.dataset.n);}));
  $('drive').addEventListener('keydown',e=>{if(phase!=='run'||e.target.closest('button:not(.notch)'))return;if(e.key==='ArrowUp'){setNotch(Math.min(1,notch+1));e.preventDefault();}if(e.key==='ArrowDown'){setNotch(Math.max(-1,notch-1));e.preventDefault();}});
  $('drive-door').onclick=()=>{
    if(phase!=='ready')return;audio();if(!motor)makeMotor(cur);$('drive-door').disabled=true;$('drive-change').hidden=true;chime();doorTarget=0;setMsg('ドアが しまります…');
    later(()=>{if(phase!=='ready')return;phase='run';$('drive-door').hidden=true;setNotch(0);setMsg('「すすむ」で しゅっぱつ！');$('drive-led').textContent=`つぎは ${trip.to.reading}`;say(`つぎは、${spoken(trip.to)}。${spoken(trip.to)} です。`);},1300);
  };
  const hb=$('drive-horn');
  hb.addEventListener('pointerdown',e=>{e.preventDefault();try{hb.setPointerCapture(e.pointerId);}catch(_){}hornStart();});
  ['pointerup','pointercancel','lostpointercapture'].forEach(n=>hb.addEventListener(n,hornStop));
  hb.addEventListener('contextmenu',e=>e.preventDefault());
  hb.addEventListener('click',e=>{if(e.detail===0){hornStart();setTimeout(hornStop,700);}});
  $('drive-skip').onclick=skipRun;$('drive-change').onclick=choose;$('drive-again').onclick=()=>start(cur.id);$('drive-done').onclick=finish;
  $('drive-sound').onclick=toggleSound;
  $('drive').addEventListener('cancel',e=>{e.preventDefault();if(!$('drive-choose').hidden)start(cur.id);else if(phase==='arrived')finish();else skipRun();});
}
/* 開通した区間を走る。from→to、next は to の先の駅（駅名標の矢印用）。owned は乗れる車両の id */
function open(o){
  wire();loadSfx();$('drive-heading').textContent=o.trial?'おためし うんてん':o.ride?'しゅっぱつ！':'かいつう！';trip={...o,scene:sceneFor(o.from,o.to,o.line)};$('drive-title').innerHTML=`<ruby>${esc(o.from.name)}<rt>${esc(o.from.reading)}</rt></ruby><i style="background:${o.line.color}"></i><ruby>${esc(o.to.name)}<rt>${esc(o.to.reading)}</rt></ruby>`;
  $('drive-from').textContent=o.from.reading;$('drive-to').textContent=o.to.reading;$('drive-arrive-title').innerHTML=`<ruby>${esc(o.to.name)}<rt>${esc(o.to.reading)}</rt></ruby> に とうちゃく！`;
  if(!$('drive').open)$('drive').showModal();start(o.train);
}
// のりかえ案内：チャイムのあとに読み上げ
function norikae(text){if(!audio())return;chime();setTimeout(()=>say(text),900);}
soundUI();
root.RailDrive={open,pon,norikae,seikai,cardGet,retry,say,toggleSound,soundTest,loadSfx,stationScene,TRAINS,STARTER};
})(globalThis);
