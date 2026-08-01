"use strict";
/* ================= SAVE ================= */
const DEF = { coins:150, unlocked:1, stars:{}, ownedCues:[0], ownedBalls:[0], ownedCloths:[0], curCue:0, curBall:0, curCloth:0 };
let S;
try { S = Object.assign({}, DEF, JSON.parse(localStorage.getItem('kb_save')||'{}')); } catch(e){ S = {...DEF}; }
function save(){ localStorage.setItem('kb_save', JSON.stringify(S)); refreshUI(); }
function refreshUI(){
  document.querySelectorAll('.coinVal').forEach(e=>e.textContent=S.coins);
  document.getElementById('hudCoins').textContent=S.coins;
}

/* ================= DATA ================= */
const CUES = [
 {name:"Кий новичка", desc:"Базовый кий. Сила: 25%", pow:0.25, price:0, col:"linear-gradient(#c49a6c,#7a5a35)"},
 {name:"Кий любителя", desc:"Крепкий клён. Сила: 50%", pow:0.50, price:300, col:"linear-gradient(#e0b060,#8a5a20)"},
 {name:"Кий профи", desc:"Карбон + графит. Сила: 75%", pow:0.75, price:800, col:"linear-gradient(#8ab4ff,#2a4a9a)"},
 {name:"Кий легенды", desc:"Золотая серия. Сила: 100%", pow:1.00, price:2000, col:"linear-gradient(#ffe27a,#c98a00)"},
];
const BALLS = [
 {name:"Классика", desc:"Стандартный набор", price:0, style:"classic", vis:"radial-gradient(circle at 32% 28%,#fff,#f6c500 35%,#a37f00)"},
 {name:"Неон", desc:"Светятся в темноте", price:200, style:"neon", vis:"radial-gradient(circle at 32% 28%,#d8ffff,#00e5ff 35%,#006b8a)"},
 {name:"Золото", desc:"Чистая роскошь", price:500, style:"gold", vis:"radial-gradient(circle at 32% 28%,#fff6cc,#ffce3d 35%,#8a5c00)"},
 {name:"Космос", desc:"Из другой галактики", price:1200, style:"space", vis:"radial-gradient(circle at 32% 28%,#f0d8ff,#a259ff 35%,#3a1070)"},
];
const CLOTHS = [
 {name:"Зелёный клуб", desc:"Классическое сукно", price:0, felt:"#1c7a3d", felt2:"#155e2f"},
 {name:"Океан", desc:"Синее премиум-сукно", price:150, felt:"#1c5a8a", felt2:"#123f63"},
 {name:"Вишня", desc:"Красное вельветовое", price:400, felt:"#8a1c2e", felt2:"#611220"},
 {name:"Ночь", desc:"Чёрный бархат VIP", price:900, felt:"#26262e", felt2:"#18181f"},
];
const LEVELS = [
 {balls:1, shots:20, reward:40},
 {balls:5, shots:8, reward:60},
 {balls:7, shots:9, reward:90},
 {balls:9, shots:10, reward:130},
 {balls:12, shots:12, reward:200},
];
const BALL_COLORS = {
 classic:["#f6c500","#2b6cd4","#e03a3a","#7a3aad","#f07818","#1d9e46","#8a2a2a","#333333","#d4b32b","#3a8ad4","#d43a8a","#3ad4b0"],
 neon:["#00e5ff","#ff2bd6","#39ff14","#ffe600","#ff6b00","#00ffb3","#b300ff","#ff0055","#00aaff","#aaff00","#ff77ff","#77ffff"],
 gold:["#ffce3d","#e8b420","#ffd96b","#d49b10","#ffc020","#e8c860","#c98a00","#ffe27a","#d4a520","#f0b830","#ffdd50","#c69510"],
 space:["#a259ff","#5977ff","#ff59c7","#59ffe0","#8a3aff","#ff8a3a","#3affb0","#c73aff","#3a8aff","#ff3a8a","#b0ff3a","#7a59ff"],
};

/* ================= NAV ================= */
let shopFrom = null;
function show(id){ document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active')); document.getElementById(id).classList.add('active'); refreshUI(); }
function goLevels(){ renderLevels(); show('levels'); }
function renderLevels(){
  const g=document.getElementById('lvlGrid'); g.innerHTML='';
  for(let i=1;i<=5;i++){
    const d=document.createElement('div');
    const locked=i>S.unlocked;
    d.className='lvl-cell'+(locked?' locked':'');
    const st=S.stars[i]||0;
    d.innerHTML= locked?'🔒':(i+'<div class="stars">'+('★'.repeat(st))+'</div>');
    if(!locked) d.onclick=()=>startLevel(i);
    g.appendChild(d);
  }
}

/* ================= TOAST ================= */
let toastT;
function toast(msg){
  const t=document.getElementById('toast'); t.textContent=msg; t.style.display='block';
  clearTimeout(toastT); toastT=setTimeout(()=>t.style.display='none',1800);
}

/* ================= AD ================= */
const AD_CONTENT=[
 {ico:"🚀",t:"Супер Ферма 3000!",p:"Построй империю мечты! 10 млн игроков уже играют!"},
 {ico:"⚔️",t:"Клинки Тьмы: Онлайн",p:"Эпические битвы ждут тебя! Получи легендарный меч бесплатно!"},
 {ico:"🧩",t:"Puzzle Mania Deluxe",p:"3000 уровней головоломок! Разомни мозг прямо сейчас!"},
 {ico:"🏎️",t:"Turbo Drift X",p:"Гонки без правил. Дрифтуй как профи!"},
 {ico:"🍭",t:"Candy Splash Saga",p:"Сладкая жизнь начинается здесь! Играй бесплатно!"},
];
let adCallback=null;
function showAd(cb){
  adCallback=cb;
  const a=AD_CONTENT[Math.floor(Math.random()*AD_CONTENT.length)];
  document.querySelector('#adBody .ad-logo').textContent=a.ico;
  document.getElementById('adTitle').textContent=a.t;
  document.getElementById('adText').textContent=a.p;
  const ov=document.getElementById('adOverlay'); ov.classList.add('show');
  const closeBtn=document.getElementById('adClose'), timer=document.getElementById('adTimer');
  closeBtn.classList.add('disabled');
  let t=5; timer.textContent=t;
  const iv=setInterval(()=>{ t--; timer.textContent=t>0?t:'✓'; if(t<=0){ clearInterval(iv); closeBtn.classList.remove('disabled'); } },1000);
}
document.getElementById('adClose').onclick=()=>{
  document.getElementById('adOverlay').classList.remove('show');
  const cb=adCallback; adCallback=null; if(cb) cb();
};
function fakeInstall(){ toast("Спасибо за интерес! 😄 Это демо-реклама"); }

/* ================= SHOP ================= */
let shopCur='cues';
function openShop(tab){ shopTab(tab||'cues'); show('shop'); }
function openShopFromGame(){
  shopFrom='game';
  aiming=false;
  document.getElementById('powerFill').style.width='0%';
  running=false;
  cancelAnimationFrame(animId);
  openShop();
}
function shopBack(){
  if(shopFrom==='game'){
    shopFrom=null;
    show('game');
    fitCanvas();
    if(!running){ running=true; loop(); }
  } else {
    show('menu');
  }
}
function shopTab(t){
  shopCur=t;
  document.querySelectorAll('.tab').forEach(e=>e.classList.toggle('active',e.dataset.tab===t));
  const list=document.getElementById('shopList'); list.innerHTML='';
  if(t==='coins'){
    list.innerHTML=`
      <div class="shop-item"><div class="item-preview" style="font-size:30px;">📺</div>
        <div class="item-info"><b>Бесплатные монеты</b><small>Посмотри рекламу и получи награду</small></div>
        <button class="buy-btn equip" onclick="rewardAd()">+100 💰</button></div>
      <div class="shop-item"><div class="item-preview" style="font-size:30px;">💰</div>
        <div class="item-info"><b>Горсть монет</b><small>Мгновенное пополнение</small></div>
        <button class="buy-btn" onclick="buyCoins(500,'99 ₽')">99 ₽ → 500</button></div>
      <div class="shop-item"><div class="item-preview" style="font-size:30px;">💎</div>
        <div class="item-info"><b>Сундук монет</b><small>Выгода 40%!</small></div>
        <button class="buy-btn" onclick="buyCoins(2000,'299 ₽')">299 ₽ → 2000</button></div>
      <div class="shop-item"><div class="item-preview" style="font-size:30px;">👑</div>
        <div class="item-info"><b>Королевский запас</b><small>Максимальная выгода!</small></div>
        <button class="buy-btn" onclick="buyCoins(6000,'599 ₽')">599 ₽ → 6000</button></div>`;
    return;
  }
  const data = t==='cues'?CUES : t==='balls'?BALLS : CLOTHS;
  const owned = t==='cues'?S.ownedCues : t==='balls'?S.ownedBalls : S.ownedCloths;
  const curKey = t==='cues'?'curCue' : t==='balls'?'curBall' : 'curCloth';
  data.forEach((it,i)=>{
    const div=document.createElement('div');
    const isOwned=owned.includes(i), isEq=S[curKey]===i;
    div.className='shop-item'+(isEq?' equipped':'');
    div.style.animationDelay=(i*0.06)+'s';
    let prev='';
    if(t==='cues') prev=`<div class="cue-vis" style="background:${it.col}"></div>`;
    else if(t==='balls') prev=`<div class="ball-vis" style="background:${it.vis}"></div>`;
    else prev=`<div class="cloth-vis" style="background:${it.felt}"></div>`;
    let extra = t==='cues' ? `<div class="pwr-bar"><i style="width:${it.pow*100}%"></i></div>` : '';
    let btn;
    if(isEq) btn=`<button class="buy-btn owned">✓ Выбран</button>`;
    else if(isOwned) btn=`<button class="buy-btn equip" onclick="equipItem('${t}',${i})">Выбрать</button>`;
    else btn=`<button class="buy-btn" onclick="buyItem('${t}',${i})">${it.price} 💰</button>`;
    div.innerHTML=`<div class="item-preview">${prev}</div><div class="item-info"><b>${it.name}</b><small>${it.desc}</small>${extra}</div>${btn}`;
    document.getElementById('shopList').appendChild(div);
  });
}
function buyItem(t,i){
  const data = t==='cues'?CUES : t==='balls'?BALLS : CLOTHS;
  const owned = t==='cues'?S.ownedCues : t==='balls'?S.ownedBalls : S.ownedCloths;
  if(S.coins < data[i].price){ toast("Не хватает монет! 💰"); shopTab('coins'); return; }
  S.coins-=data[i].price; owned.push(i); equipItem(t,i); toast("Куплено: "+data[i].name+" 🎉");
}
function equipItem(t,i){
  if(t==='cues')S.curCue=i; else if(t==='balls')S.curBall=i; else S.curCloth=i;
  save(); shopTab(t);
}
function rewardAd(){ showAd(()=>{ S.coins+=100; save(); toast("+100 монет за рекламу! 💰"); if(shopCur==='coins')shopTab('coins'); }); }
function buyCoins(amount,price){
  showAd(()=>{
    S.coins+=amount; save(); toast(`Покупка за ${price} успешна! +${amount} 💰`); if(shopCur==='coins')shopTab('coins');
  });
}

/* ================= GAME ENGINE ================= */
const cv=document.getElementById('cv'), ctx=cv.getContext('2d');
const W=440, H=740, RAIL=26, R=13, PR=24;
const DRAG_MAX=75;      /* px оттяжки пальцем для максимальной силы */
const CUE_PULLBACK=85;  /* визуальный отвод кия при полной силе */
let dpr=1, scaleCSS=1;
function fitCanvas(){
  const wrap=document.getElementById('gameWrap');
  const availH = window.innerHeight - 170;
  const availW = Math.min(window.innerWidth - 10, 520 - 10);
  scaleCSS = Math.min(availW/W, availH/H);
  dpr = window.devicePixelRatio||1;
  cv.width=W*dpr; cv.height=H*dpr;
  cv.style.width=(W*scaleCSS)+'px'; cv.style.height=(H*scaleCSS)+'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
window.addEventListener('resize',fitCanvas);

const POCKETS=[ [RAIL,RAIL],[W-RAIL,RAIL],[RAIL,H/2],[W-RAIL,H/2],[RAIL,H-RAIL],[W-RAIL,H-RAIL] ];
let balls=[], particles=[], floats=[];
let curLevel=1, shotsLeft=0, running=false, aiming=false, animId=null;
let aimStart=null, aimCur=null, gameState='idle';
let coinsEarnedLvl=0;

function Ball(x,y,color,num,isCue){
  return {x,y,vx:0,vy:0,color,num,isCue:!!isCue,dead:false,rot:Math.random()*6.28};
}
function startLevel(n){
  shopFrom=null;
  curLevel=n;
  const L=LEVELS[n-1];
  shotsLeft=L.shots; coinsEarnedLvl=0;
  balls=[]; particles=[]; floats=[];
  const cols=BALL_COLORS[BALLS[S.curBall].style];
  const cx=W/2, topY=150; let placed=0, row=0;
  while(placed<L.balls){
    const inRow=row+1;
    for(let i=0;i<inRow && placed<L.balls;i++){
      const bx=cx+(i-(inRow-1)/2)*(R*2.2);
      const by=topY+row*(R*1.95);
      balls.push(Ball(bx,by,cols[placed%cols.length],placed+1,false));
      placed++;
    }
    row++;
  }
  balls.push(Ball(cx,H-160,'#f5f5f5',0,true));
  gameState='idle'; aiming=false;
  fitCanvas();
  show('game');
  document.getElementById('hudLvl').textContent=n;
  updateHUD();
  document.getElementById('powerCap').style.left=(CUES[S.curCue].pow*100)+'%';
  if(!running){ running=true; loop(); }
}
function quitGame(){ running=false; cancelAnimationFrame(animId); show('menu'); }
function updateHUD(){
  document.getElementById('hudShots').textContent=shotsLeft;
  document.getElementById('hudCoins').textContent=S.coins;
}
function cueBall(){ return balls.find(b=>b.isCue); }
function allStopped(){ return balls.every(b=>b.dead||(Math.abs(b.vx)<0.02&&Math.abs(b.vy)<0.02)); }

/* ---- pause ---- */
function openPause(){
  aiming=false;
  document.getElementById('powerFill').style.width='0%';
  running=false;
  cancelAnimationFrame(animId);
  const m=document.getElementById('resultModal');
  m.innerHTML=`<h2 class="pause-title">⏸ ПАУЗА</h2>
    <p class="pause-sub">Уровень <b>${curLevel}</b> • Осталось ударов: <b>${shotsLeft}</b></p>
    <button class="btn green" onclick="resumeGame()">▶ Продолжить</button>
    <button class="btn" onclick="restartFromPause()">🔄 Заново</button>
    <button class="btn gold" onclick="shopFromPause()">🛒 Магазин</button>
    <button class="btn red" onclick="menuFromPause()">🏠 В меню</button>`;
  document.getElementById('resultOverlay').classList.add('show');
}
function resumeGame(){ closeResult(); if(!running){ running=true; loop(); } }
function restartFromPause(){ closeResult(); startLevel(curLevel); }
function shopFromPause(){ closeResult(); openShopFromGame(); }
function menuFromPause(){ closeResult(); running=false; cancelAnimationFrame(animId); show('menu'); }

/* ---- input ---- */
function getPos(e){
  const rect=cv.getBoundingClientRect();
  const t=e.touches?e.touches[0]:e;
  return { x:(t.clientX-rect.left)/scaleCSS, y:(t.clientY-rect.top)/scaleCSS };
}
cv.addEventListener('pointerdown',e=>{
  if(gameState!=='idle'||!allStopped())return;
  const p=getPos(e); aiming=true; aimStart=p; aimCur=p;
  cv.setPointerCapture(e.pointerId);
});
cv.addEventListener('pointermove',e=>{ if(aiming) aimCur=getPos(e); });
cv.addEventListener('pointerup',e=>{
  if(!aiming)return; aiming=false;
  const dx=aimStart.x-aimCur.x, dy=aimStart.y-aimCur.y;
  const dist=Math.hypot(dx,dy);
  document.getElementById('powerFill').style.width='0%';
  if(dist<12)return;
  const cap=CUES[S.curCue].pow;
  const power=Math.min(dist/DRAG_MAX,1)*cap;
  const cb=cueBall(); if(!cb||cb.dead)return;
  const ang=Math.atan2(dy,dx);
  const SP=34;
  cb.vx=Math.cos(ang)*power*SP; cb.vy=Math.sin(ang)*power*SP;
  shotsLeft--; gameState='moving'; updateHUD();
});

/* ---- physics ---- */
function physics(){
  const sub=3;
  for(let s=0;s<sub;s++){
    for(const b of balls){
      if(b.dead)continue;
      b.x+=b.vx/sub; b.y+=b.vy/sub;
      b.rot+=(Math.abs(b.vx)+Math.abs(b.vy))*0.01;
      for(const [px,py] of POCKETS){
        if(Math.hypot(b.x-px,b.y-py)<PR-3){ potBall(b,px,py); break; }
      }
      if(b.dead)continue;
      let nearPocket=false;
      for(const [px,py] of POCKETS) if(Math.hypot(b.x-px,b.y-py)<PR*1.5)nearPocket=true;
      if(!nearPocket){
        if(b.x<RAIL+R){b.x=RAIL+R;b.vx=Math.abs(b.vx)*0.85;}
        if(b.x>W-RAIL-R){b.x=W-RAIL-R;b.vx=-Math.abs(b.vx)*0.85;}
        if(b.y<RAIL+R){b.y=RAIL+R;b.vy=Math.abs(b.vy)*0.85;}
        if(b.y>H-RAIL-R){b.y=H-RAIL-R;b.vy=-Math.abs(b.vy)*0.85;}
      } else {
        if(b.x<R)b.x=R; if(b.x>W-R)b.x=W-R; if(b.y<R)b.y=R; if(b.y>H-R)b.y=H-R;
      }
    }
    for(let i=0;i<balls.length;i++){
      const a=balls[i]; if(a.dead)continue;
      for(let j=i+1;j<balls.length;j++){
        const c=balls[j]; if(c.dead)continue;
        const dx=c.x-a.x, dy=c.y-a.y, d=Math.hypot(dx,dy);
        if(d<R*2&&d>0){
          const nx=dx/d, ny=dy/d, overlap=(R*2-d)/2;
          a.x-=nx*overlap; a.y-=ny*overlap; c.x+=nx*overlap; c.y+=ny*overlap;
          const dvn=(a.vx-c.vx)*nx+(a.vy-c.vy)*ny;
          if(dvn>0){
            a.vx-=dvn*nx*0.98; a.vy-=dvn*ny*0.98;
            c.vx+=dvn*nx*0.98; c.vy+=dvn*ny*0.98;
          }
        }
      }
    }
  }
  for(const b of balls){
    if(b.dead)continue;
    b.vx*=0.988; b.vy*=0.988;
    if(Math.abs(b.vx)<0.03&&Math.abs(b.vy)<0.03){b.vx=0;b.vy=0;}
  }
  if(gameState==='moving'&&allStopped()){ endOfShot(); }
}
function potBall(b,px,py){
  b.dead=true; b.vx=0; b.vy=0;
  spawnParticles(px,py,b.isCue?'#fff':b.color);
  if(b.isCue){
    floats.push({x:px,y:py,txt:'Биток! 😱',c:'#ff6b6b',t:0});
  } else {
    S.coins+=5; coinsEarnedLvl+=5; save();
    floats.push({x:px,y:py,txt:'+5 💰',c:'#ffd54f',t:0});
  }
  updateHUD();
}
function endOfShot(){
  const cb=cueBall();
  if(cb.dead){
    cb.dead=false; cb.x=W/2; cb.y=H-160; cb.vx=0; cb.vy=0;
    let tries=0;
    while(balls.some(o=>o!==cb&&!o.dead&&Math.hypot(o.x-cb.x,o.y-cb.y)<R*2.2)&&tries<50){ cb.y-=R; tries++; }
  }
  const left=balls.filter(b=>!b.isCue&&!b.dead).length;
  if(left===0){ winLevel(); return; }
  if(shotsLeft<=0){ loseLevel(); return; }
  gameState='idle';
}
function spawnParticles(x,y,color){
  for(let i=0;i<16;i++){
    const a=Math.random()*6.28, sp=1.2+Math.random()*2.5;
    particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,c:color,t:0});
  }
}
function updateParticles(){
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i]; p.x+=p.vx; p.y+=p.vy; p.t++; p.vx*=0.94; p.vy*=0.94;
    if(p.t>20) particles.splice(i,1);
  }
}
function updateFloats(){
  for(let i=floats.length-1;i>=0;i--){
    const f=floats[i]; f.t++; f.y-=0.6;
    if(f.t>35) floats.splice(i,1);
  }
}

/* ---- draw ---- */
function draw(){
  const cloth=CLOTHS[S.curCloth];
  const grd=ctx.createLinearGradient(0,0,0,H);
  grd.addColorStop(0,cloth.felt); grd.addColorStop(1,cloth.felt2);
  ctx.fillStyle=grd; ctx.fillRect(0,0,W,H);
  
  // rails
  ctx.fillStyle='#5a3616'; ctx.fillRect(0,0,W,RAIL); ctx.fillRect(0,H-RAIL,W,RAIL);
  ctx.fillRect(0,0,RAIL,H); ctx.fillRect(W-RAIL,0,RAIL,H);
  ctx.fillStyle='#3d2210'; ctx.fillRect(RAIL,RAIL,W-RAIL*2,4); ctx.fillRect(RAIL,H-RAIL-4,W-RAIL*2,4);
  ctx.fillRect(RAIL,RAIL,4,H-RAIL*2); ctx.fillRect(W-RAIL-4,RAIL,4,H-RAIL*2);
  
  // pockets
  ctx.fillStyle='#0a0e1a';
  for(const [px,py] of POCKETS){ ctx.beginPath(); ctx.arc(px,py,PR,0,6.28); ctx.fill(); }
  
  // balls
  for(const b of balls){
    if(b.dead)continue;
    ctx.save(); ctx.translate(b.x,b.y); ctx.rotate(b.rot);
    ctx.beginPath(); ctx.arc(0,0,R,0,6.28);
    const grad=ctx.createRadialGradient(-4,-4,2,0,0,R);
    grad.addColorStop(0,'#ffffff'); grad.addColorStop(0.35,b.color); grad.addColorStop(1,'#000000');
    ctx.fillStyle=grad; ctx.fill();
    if(b.num>0){
      ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(0,0,5,0,6.28); ctx.fill();
      ctx.fillStyle='#000'; ctx.font='bold 10px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(b.num,0,0);
    }
    ctx.restore();
  }
  
  // cue aim & power
  if(aiming && !cueBall()?.dead){
    const cb=cueBall();
    const dx=aimStart.x-aimCur.x, dy=aimStart.y-aimCur.y;
    const dist=Math.hypot(dx,dy);
    const ang=Math.atan2(dy,dx);
    const pull=Math.min(dist,CUE_PULLBACK);
    const capPct=CUES[S.curCue].pow*100;
    document.getElementById('powerFill').style.width=(pull/CUE_PULLBACK*capPct)+'%';
    
    ctx.save(); ctx.translate(cb.x,cb.y); ctx.rotate(ang);
    // shadow
    ctx.strokeStyle='rgba(0,0,0,.35)'; ctx.lineWidth=6; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(20,0); ctx.lineTo(20+pull,0); ctx.stroke();
    // cue stick gradient from user's cue
    const cueGrad=ctx.createLinearGradient(0,0,20+pull,0);
    cueGrad.addColorStop(0,'#4a2c10'); cueGrad.addColorStop(0.3,'#8a5a20'); cueGrad.addColorStop(0.6,'#c49a6c'); cueGrad.addColorStop(0.8,'#e8c88a'); cueGrad.addColorStop(1,'#3ad4ff');
    ctx.strokeStyle=cueGrad; ctx.lineWidth=4;
    ctx.beginPath(); ctx.moveTo(20,0); ctx.lineTo(20+pull,0); ctx.stroke();
    ctx.restore();
    
    // aim line
    ctx.strokeStyle='rgba(255,255,255,.25)'; ctx.lineWidth=2; ctx.setLineDash([6,6]);
    ctx.beginPath(); ctx.moveTo(cb.x,cb.y); ctx.lineTo(cb.x-Math.cos(ang)*90,cb.y-Math.sin(ang)*90); ctx.stroke();
    ctx.setLineDash([]);
  }
  
  // particles
  for(const p of particles){
    ctx.globalAlpha=1-p.t/20; ctx.fillStyle=p.c;
    ctx.beginPath(); ctx.arc(p.x,p.y,2.5,0,6.28); ctx.fill();
  }
  ctx.globalAlpha=1;
  
  // floats
  ctx.font='bold 15px Arial'; ctx.textAlign='center';
  for(const f of floats){
    ctx.fillStyle=f.c; ctx.globalAlpha=1-f.t/35;
    ctx.fillText(f.txt,f.x,f.y);
  }
  ctx.globalAlpha=1;
}

/* ---- loop ---- */
function loop(){
  if(!running)return;
  physics(); updateParticles(); updateFloats(); draw();
  animId=requestAnimationFrame(loop);
}

/* ---- result ---- */
function closeResult(){ document.getElementById('resultOverlay').classList.remove('show'); }
function winLevel(){
  const L=LEVELS[curLevel-1];
  const base=L.reward;
  const earned=base+coinsEarnedLvl;
  S.coins+=earned;
  const curSt=S.stars[curLevel]||0;
  const newSt=shotsLeft>=Math.ceil(L.shots*0.6)?3 : shotsLeft>=Math.ceil(L.shots*0.3)?2 : 1;
  if(newSt>curSt) S.stars[curLevel]=newSt;
  if(curLevel===S.unlocked && curLevel<5) S.unlocked++;
  save();
  const m=document.getElementById('resultModal');
  m.innerHTML=`<h2 class="win-title">ПОБЕДА!</h2>
    <div class="stars-row">${'★'.repeat(newSt)}</div>
    <p>+${earned} монет</p>
    <button class="btn green" onclick="nextLevelOrMenu()">▶ Дальше</button>
    <button class="btn" onclick="restartLevel()">🔄 Заново</button>
    <button class="btn gold" onclick="openShopFromGame()">🛒 Магазин</button>`;
  document.getElementById('resultOverlay').classList.add('show');
}
function loseLevel(){
  const m=document.getElementById('resultModal');
  m.innerHTML=`<h2 class="lose-title">НЕУДАЧА</h2>
    <p>Попробуй ещё раз!</p>
    <button class="btn green" onclick="restartLevel()">🔄 Заново</button>
    <button class="btn" onclick="closeResult(); show('levels')">📋 Уровни</button>
    <button class="btn gold" onclick="openShopFromGame()">🛒 Магазин</button>`;
  document.getElementById('resultOverlay').classList.add('show');
}
function restartLevel(){ closeResult(); startLevel(curLevel); }
function nextLevelOrMenu(){
  closeResult();
  if(curLevel<5) startLevel(curLevel+1);
  else show('levels');
}

/* ================= INIT ================= */
fitCanvas();
refreshUI();
