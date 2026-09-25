// Driving between stations after a section opens: pick a train you have met, close the doors, run and brake.
(function(root){'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* 車両の見た目（横から見たイラスト）。id は cards.js と同じ。redwing は最初から乗れる車両 */
const TRAINS=[
 {id:'redwing',name:'Red Wing',reading:'227けい',kind:'ふつう',cars:3,front:'slant',body:'#cfd3d6',roof:'#9aa1a6',win:'#2d3539',doors:3,doorColor:'#bfc4c7',frame:'#d4262d',accent:'#d4262d',panto:[1],motor:'vvvf'},
 {id:'115',name:'115けい',reading:'3000ばんだい',kind:'ふつう',cars:3,front:'flat',body:'#f2b400',roof:'#9c8a55',win:'#343b40',doors:2,doorColor:'#e9ac00',panto:[1],motor:'old'},
 {id:'kiha40',name:'キハ40',reading:'ひろしまいろ',kind:'ふつう',cars:2,front:'flat',body:'#f1c21b',skirt:'#f4f2ea',skirtFrom:.74,roof:'#8f8a7c',win:'#343b40',doors:2,doorsAtEnds:true,doorColor:'#e7b815',diesel:true},
 {id:'kiha40-gantoku',name:'キハ40けい',reading:'がんとくせん',kind:'ふつう',cars:2,front:'flat',body:'#e0572b',roof:'#8a7d72',win:'#343b40',doors:2,doorsAtEnds:true,doorColor:'#d8502a',diesel:true},
 {id:'etsetora',name:'etSETOra',reading:'エトセトラ',kind:'かいそく',cars:2,front:'flat',body:'#f4f1e8',skirt:'#1f3a70',skirtFrom:.56,stripe:{t:.52,h:.035,c:'#8cc0e6'},roof:'#9b978d',win:'#26323c',bigWin:true,doors:1,doorsAtEnds:true,doorColor:'#f0ede3',emblem:true,diesel:true},
 {id:'kizashi',name:'Kizashi',reading:'227けい',kind:'ふつう',cars:3,front:'slant',body:'#c9cdd0',roof:'#8e959a',win:'#2d3539',doors:3,doorColor:'#bfc4c7',frame:'#2a2a2c',accent:'#1f1f22',accent2:'#c9a24a',panto:[1],motor:'vvvf'},
 {id:'urara',name:'Urara',reading:'227けい',kind:'ふつう',cars:3,front:'slant',body:'#cfd3d6',roof:'#9aa1a6',win:'#2d3539',doors:3,doorColor:'#bfc4c7',frame:'#e9797b',accent:'#e9797b',panto:[1],motor:'vvvf'},
 {id:'ef210',name:'ももたろう',reading:'EF210がた',kind:'かもつ',cars:5,loco:true,front:'flat',body:'#2e5fa9',skirt:'#6f7b86',skirtFrom:.8,stripe:{t:.56,h:.05,c:'#e8ecef'},roof:'#56606a',win:'#1f272c',panto:[0],motor:'loco'},
 {id:'500',name:'500けい',reading:'しんかんせん',kind:'しんかんせん',cars:2,front:'nose',body:'#a4adb6',roof:'#7d8792',stripe:{t:.62,h:.07,c:'#2a4a9a'},win:'#28313a',doors:1,doorsAtEnds:true,doorColor:'#98a1ab',track:'しんかんせん'},
 {id:'apex',name:'グリーンムーバー エイペックス',reading:'ひろでん 5200がた',kind:'ろめんでんしゃ',cars:2,front:'slant',body:'#3d454a',skirt:'#eceeee',skirtFrom:.68,stripe:{t:.64,h:.04,c:'#9bd13a'},roof:'#eceeee',win:'#1b2024',bigWin:true,doors:2,doorColor:'#4a5358',accent:'#eceeee',panto:[0],track:'ひろでん'}
];
const STARTER='redwing',byId=Object.fromEntries(TRAINS.map(t=>[t.id,t]));
const rideable=t=>t&&!t.track; // 新幹線・広電は、その線路ができるまで走れない

/* ---------- 車両の絵 ---------- */
function carShape(c,x,y,L,h,isFront,front){
  const r=h*.14;c.beginPath();c.moveTo(x+r*.6,y);
  if(isFront&&front==='slant'){c.lineTo(x+L-h*.26,y);c.quadraticCurveTo(x+L-h*.04,y+h*.02,x+L,y+h*.38);c.lineTo(x+L,y+h);}
  else if(isFront&&front==='nose'){c.lineTo(x+L-h*2.6,y);c.bezierCurveTo(x+L-h*.8,y+h*.02,x+L,y+h*.55,x+L,y+h);}
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
function drawCar(c,t,i,x,yRail,h,L,o){
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
  if(t.stripe){c.fillStyle=t.stripe.c;c.fillRect(x,y+bodyH*t.stripe.t,L,bodyH*t.stripe.h);}
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
    if(t.front==='nose'){c.fillStyle=t.win;c.beginPath();c.moveTo(x+L-bodyH*2.1,y+bodyH*.12);c.quadraticCurveTo(x+L-bodyH*1.2,y+bodyH*.14,x+L-bodyH*.9,y+bodyH*.36);c.lineTo(x+L-bodyH*1.9,y+bodyH*.38);c.closePath();c.fill();}
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
  const L=h*5,len=i=>t.loco&&i===0?L*.85:t.loco?L*.75:L;
  for(let i=t.cars-1;i>=0;i--){let x=0;for(let k=0;k<i;k++)x-=len(k)+h*.08;x-=len(i);
    if(i<t.cars-1){c.fillStyle='#2a2f31';c.fillRect(x-h*.1,yRail-h*.55,h*.12,h*.1);}
    drawCar(c,t,i,x,yRail,h,len(i),o);}
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
  stopMotor();const a=audio();if(!a)return;
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
   けいさんの 正解の音は iPadで 聞きくらべて 2に きめた（2026-09-26 ゆかりさん） */
const SFX={press:'assets/sound/stamp-press.mp3',kira:'assets/sound/stamp-kira-low.mp3',seikai:'assets/sound/correct-2.mp3',retry:'assets/sound/retry.mp3'},sfx={};
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
function seikai(){if(!audio())return;loadSfx();if(!play('seikai',0))beep(1047,.3,'triangle',.08),beep(1568,.5,'triangle',.08,.12);} // けいさん 正解（ファイルが まだ なければ 合成音）
function retry(){if(!audio())return;loadSfx();if(!play('retry',0))beep(523,.3,'sine',.08),beep(392,.45,'sine',.08,.2);} // もう一回（やさしく）
function chime(){beep(784,.5,'sine',.14);beep(659,.8,'sine',.14,.32);}
/* けいてき：おしている あいだ鳴る。2つの音を重ね、息の立ち上がりと ひずみ・山びこで空気笛らしくする */
function hornStart(){
  const a=audio();if(!a||!soundOn||hornNode)return;
  const t=cur||{},notes=t.diesel?[262,330]:t.loco?[392,494]:[311,392],now=a.currentTime;
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
function hornStop(){
  if(!hornNode||!ac)return;const h=hornNode;hornNode=null;const end=Math.max(ac.currentTime,h.t0+.45);
  h.out.gain.setTargetAtTime(0,end,.08);h.oscs.forEach(o=>{o.frequency.setTargetAtTime(o.base*.95,end,.12);o.stop(end+.8);});h.lfo.stop(end+.8);
}
function pickVoice(){try{const vs=speechSynthesis.getVoices().filter(v=>/^ja/i.test(v.lang));jaVoice=vs.find(v=>/Kyoko|O-ren|Otoya|Siri/i.test(v.name))||vs[0]||null;}catch(e){}}
if('speechSynthesis' in root){pickVoice();speechSynthesis.onvoiceschanged=pickVoice;}
function say(text){if(!soundOn||!('speechSynthesis' in root))return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='ja-JP';if(jaVoice)u.voice=jaVoice;u.rate=.92;u.pitch=1.05;speechSynthesis.speak(u);}catch(e){}}

/* ---------- はしる ---------- */
const END=220,VMAX=25,ACC=5,BRK=5,STOP_OK=6; // m, m/s, m/s²。停止位置の手前 STOP_OK m 以内で とうちゃく
let cur=null,trip=null,phase='closed',s=0,v=0,notch=0,auto=false,doorT=1,doorTarget=1,lastJoint=0,near=false,smoke=[],raf=0,lastT=0,timers=[];
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
  phase='ready';s=0;v=0;notch=0;auto=false;doorT=1;doorTarget=1;lastJoint=0;near=false;smoke=[];
  $('drive-console').hidden=false;$('drive-arrive').hidden=true;$('drive-door').hidden=false;$('drive-door').disabled=false;$('drive-change').hidden=false;$('drive-skip').hidden=false;
  notchUI(false);setMsg('ドアを しめて しゅっぱつ しよう！');$('drive-led').textContent=`${trip.to.reading} ゆき`;$('drive-kind').textContent=cur.kind;
  document.querySelector('#drive .n-brake').classList.remove('hint');
}
function start(id){
  cur=rideable(byId[id])?byId[id]:byId[STARTER];showScreen('run');resize();resetRun();makeMotor(cur);
  say(`この でんしゃは、${trip.to.reading} ゆき です。`);
  if(!raf){lastT=performance.now();raf=requestAnimationFrame(tick);}
}
function arrive(kind){
  phase='arrived';notch=0;notchUI(false);doorTarget=1;$('drive-skip').hidden=true;$('drive-change').hidden=true;
  document.querySelector('#drive .n-brake').classList.remove('hint');
  const r=trip.to.reading,quick=kind==='skip';$('drive-led').textContent=r;
  later(()=>{chime();say(`${r}、${r}。`);},quick?50:500);
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
    const r=END-s,hintBrake=!auto&&notch!==-1&&v>3&&need>=r-40;
    document.querySelector('#drive .n-brake').classList.toggle('hint',hintBrake);
    if(!near&&r<110){near=true;$('drive-led').textContent=`まもなく ${trip.to.reading}`;say(`まもなく、${trip.to.reading} です。`);}
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
  smoke.forEach(p=>{p.y+=dt*18;p.r+=dt*14;p.life-=dt*.8;});smoke=smoke.filter(p=>p.life>0);
  $('drive-speed').textContent=Math.round(v*3.6);
  $('drive-state').textContent=phase==='ready'?'とまっています':phase==='arrived'?'とうちゃく':notch===1?'すすむ':notch===-1?'ブレーキ':'そのまま';
  const pct=100-s/END*100;$('drive-me').style.left=pct+'%';$('drive-done-bar').style.width=(100-pct)+'%';
  updateMotor(v,phase==='run'?notch:0);draw();
}

/* ---------- けしき（東へ すすむと 左。線路の山がわから見る）。広島の街なか、内陸の山あい、それ以外は瀬戸内の海ぞい ---------- */
const TOWN=new Set(['新井口','西広島','横川','新白島','広島','天神川','向洋','海田市','三滝','安芸長束','下祇園','矢賀']);
const INLAND=new Set(['安芸中野','中野東','瀬野','八本松','寺家','西条','西高屋','白市','入野','河内','本郷']);
function sceneFor(from,to,line){if(TOWN.has(from.id)&&TOWN.has(to.id))return 'town';if(['kabe','geibi','gantoku'].includes(line.id)||INLAND.has(from.id)||INLAND.has(to.id))return 'hills';return 'sea';}
/* えきスタンプの模様。lines はその駅を通る路線の id */
function stationScene(id,lines){if(TOWN.has(id))return 'town';if(INLAND.has(id)||lines.every(l=>['kabe','geibi','gantoku'].includes(l)))return 'hills';return 'sea';}
const rnd=k=>{const x=Math.sin(k*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const loop=(k,gap,p,sc)=>((k*gap+s*sc*p)%(W+gap)+W+gap)%(W+gap)-gap/2;
function draw(){
  if(!W||!H)return;const c=ctx,hC=H*.2,L=hC*5,sc=L/20,yRail=H*.86,frontX=W*.37,wx=m=>frontX-(m-s)*sc;
  let g=c.createLinearGradient(0,0,0,H*.55);g.addColorStop(0,'#8ec5e6');g.addColorStop(1,'#d9edf5');c.fillStyle=g;c.fillRect(0,0,W,H);
  c.fillStyle='#ffffffcc';for(let k=0;k<6;k++){const px=((k*420+s*sc*.03)%(W+400))-200,py=H*(.08+(k%3)*.07);cloud(c,px,py,H*.05);}
  ({sea,hills,town})[trip.scene](c,sc);
  const wireY=yRail-hC*1.22-hC*.42,electric=!['geibi','gantoku'].includes(trip.line.id); // 芸備線・岩徳線は非電化
  if(electric){c.strokeStyle='#5e6a6e';c.lineWidth=Math.max(2,hC*.05);const p0=Math.floor((s-40)/50)*50;
    for(let m=p0-100;m<s+W/sc+100;m+=50){const x=wx(m);if(x<-20||x>W+20)continue;c.beginPath();c.moveTo(x,yRail-hC*.1);c.lineTo(x,wireY-hC*.3);c.lineTo(x+hC*.5,wireY-hC*.3);c.stroke();}
    c.strokeStyle='#39424599';c.lineWidth=1.2;c.beginPath();c.moveTo(0,wireY);c.lineTo(W,wireY);c.moveTo(0,wireY-hC*.3);c.lineTo(W,wireY-hC*.3);c.stroke();}
  c.fillStyle='#a79d8c';c.fillRect(0,yRail-2,W,H-yRail+2);
  c.fillStyle='#6d5a48';const sl=.65*sc,off=((s*sc)%sl+sl)%sl;for(let x=-sl+off;x<W+sl;x+=sl)c.fillRect(x,yRail+2,sl*.45,H*.03);
  c.fillStyle='#8c9296';c.fillRect(0,yRail-1,W,3);
  c.save();c.translate(frontX,0);c.scale(-1,1);drawTrain(c,cur,yRail,hC,{ang:-s/.43,door:doorT,light:true,wireY:electric?wireY:undefined});c.restore();
  for(const p of smoke){c.fillStyle=`rgba(90,90,90,${.35*p.life})`;c.beginPath();c.arc(wx(p.x),yRail-hC*1.3-p.y,p.r,0,Math.PI*2);c.fill();}
  platform(c,wx,0,trip.from,trip.to,hC,yRail);platform(c,wx,END,trip.to,trip.next,hC,yRail);
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
    const have=trip.owned.includes(t.id),other=have&&t.track,card=trip.cards.find(c=>c.id===t.id),b=document.createElement('button');
    b.className='drive-train '+(have?(other?'other-track':'ok'):'locked')+(t.id===cur.id?' current':'');b.disabled=!have||other;b.dataset.train=t.id;
    b.innerHTML=`<canvas aria-hidden="true"></canvas><span class="drive-train-body"><small>${have?esc(t.reading):'？？？'}</small><b>${have?esc(t.name):'？？？？'}</b><span>${other?`${t.track}の せんろが できたら はしれるよ`:have?(t.id===cur.id?'いま えらんでいる でんしゃ':'▶ これで はしる'):`${esc(card?card.station:'')}えきで のれるように なるよ`}</span></span>`;
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
    later(()=>{if(phase!=='ready')return;phase='run';$('drive-door').hidden=true;setNotch(0);setMsg('「すすむ」で しゅっぱつ！');$('drive-led').textContent=`つぎは ${trip.to.reading}`;say(`つぎは、${trip.to.reading}。${trip.to.reading} です。`);},1300);
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
  wire();loadSfx();trip={...o,scene:sceneFor(o.from,o.to,o.line)};$('drive-title').innerHTML=`<ruby>${esc(o.from.name)}<rt>${esc(o.from.reading)}</rt></ruby><i style="background:${o.line.color}"></i><ruby>${esc(o.to.name)}<rt>${esc(o.to.reading)}</rt></ruby>`;
  $('drive-from').textContent=o.from.reading;$('drive-to').textContent=o.to.reading;$('drive-arrive-title').innerHTML=`<ruby>${esc(o.to.name)}<rt>${esc(o.to.reading)}</rt></ruby> に とうちゃく！`;
  if(!$('drive').open)$('drive').showModal();start(o.train);
}
soundUI();
root.RailDrive={open,pon,seikai,retry,toggleSound,soundTest,loadSfx,stationScene,TRAINS,STARTER};
})(globalThis);
