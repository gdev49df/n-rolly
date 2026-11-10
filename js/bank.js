/* Банк: вклады, инвестиции, крипто-гараж. Состояние в S.bank (как и вся игра — на устройстве). */
(function(){
  const PLANS=[{d:1,p:2},{d:3,p:7},{d:5,p:13}],MAXDEP=3,MAXA=1e8,MINA=1000;
  const COMP=[
    {id:'bank',n:'Банк-Надёж',ic:'🏛',lo:-2,hi:6,k:'надёжно',c:'#3ddc84'},
    {id:'tel',n:'Нейм-Телеком',ic:'📡',lo:-15,hi:25,k:'умеренно',c:'#5cc8ff'},
    {id:'soft',n:'Рулетка-Софт',ic:'🎰',lo:-30,hi:40,k:'рискованно',c:'#c18cff'},
    {id:'cryp',n:'Крипто-Гараж',ic:'💎',lo:-50,hi:60,k:'пан или пропал',c:'#ff6b8a'}];
  const INVT=6*3600e3,DAY=864e5;
  const bk={tab:'dep',plan:1,amt:'',co:'cryp',open:false};
  const B=()=>{if(!S.bank||typeof S.bank!=='object')S.bank={dep:[],inv:[]};if(!Array.isArray(S.bank.dep))S.bank.dep=[];if(!Array.isArray(S.bank.inv))S.bank.inv=[];return S.bank};
  window.bankHeld=()=>{try{const b=B();return b.dep.reduce((s,x)=>s+x.a,0)+b.inv.reduce((s,x)=>s+x.a,0)}catch(e){return 0}};
  const left=ms=>{const m=Math.ceil(ms/6e4);return m>=1440?Math.floor(m/1440)+' д '+Math.floor(m%1440/60)+' ч':m>=60?Math.floor(m/60)+' ч '+m%60+' мин':m+' мин'};
  const pct=r=>(r>0?'+':'')+String(r).replace('.',',')+'%';
  const amt=()=>Math.max(0,Math.min(MAXA,Math.floor(+bk.amt||0)));
  window.bankCard=function(){
    const b=B(),held=bankHeld(),ready=b.dep.filter(x=>Date.now()>=x.end).length+b.inv.filter(x=>Date.now()>=x.end).length;
    return `<div class="pcard bankc"><div class="bkh"><span class="bkic">🏦</span><div><b>Банк</b><small>Вклады до +13%, инвестиции, крипто-гараж</small></div></div>
      <div class="bkst"><span>В банке: <b>${fmt(held)} 🪙</b></span>${ready?`<span class="bkr">Готово к выдаче: ${ready}</span>`:''}</div>
      <button class="btn main cwide" data-bank="open">Открыть банк</button></div>`;
  };
  function sheet(){
    let sh=document.getElementById('banksh');
    if(!bk.open){if(sh)sh.remove();document.body.classList.remove('shopen');return}
    if(!sh){sh=document.createElement('div');sh.id='banksh';sh.className='usheet';document.body.appendChild(sh);sh.onclick=onClick;sh.oninput=e=>{if(e.target.id==='bk-amt'){bk.amt=e.target.value.replace(/\D/g,'');const o=document.getElementById('bk-pv');if(o)o.innerHTML=prev()}}}
    const b=B(),keep=sh.querySelector('.sbox'),sc=keep?keep.scrollTop:0;
    sh.innerHTML=`<div class="sbg" data-bx="1"></div><div class="sbox banksb"><div class="shead"><b>🏦 Банк</b><button class="btn sm" data-bx="1">✕</button></div>
      <p class="bkbal">Баланс: <b>${fmt(S.coins)} 🪙</b></p>
      <div class="bktabs"><button data-bt="dep" aria-pressed="${bk.tab==='dep'}">Вклады</button><button data-bt="inv" aria-pressed="${bk.tab==='inv'}">Инвестиции</button></div>
      ${bk.tab==='dep'?depHtml(b):invHtml(b)}</div>`;
    const nb=sh.querySelector('.sbox');if(nb)nb.scrollTop=sc;
  }
  function amtBox(){
    return `<label class="mlab">Сумма, 🪙<input id="bk-amt" inputmode="numeric" value="${bk.amt}" placeholder="от ${fmt(MINA)} до ${fmt(MAXA)}"></label>
      <div class="mchips">${[[.1,'10%'],[.25,'25%'],[.5,'50%'],[1,'Всё']].map(([k,l])=>`<button class="btn sm" data-bk="${k}">${l}</button>`).join('')}</div>`;
  }
  const prev=()=>{const a=amt();if(bk.tab==='dep'){const p=PLANS[bk.plan];return a?`Через ${p.d} ${p.d===1?'день':p.d<5?'дня':'дней'} получишь <b>${fmt(Math.floor(a*(1+p.p/100)))} 🪙</b> (+${fmt(Math.floor(a*p.p/100))})`:'Введи сумму'}
    const c=COMP.find(x=>x.id===bk.co);return a?`Исход: от <b>${fmt(Math.floor(a*(1+c.lo/100)))}</b> до <b>${fmt(Math.floor(a*(1+c.hi/100)))} 🪙</b>`:'Введи сумму'};
  function depHtml(b){
    const act=b.dep.map(x=>{const rd=Date.now()>=x.end;return `<div class="quest bkrow"><div class="qtop"><b>${fmt(x.a)} 🪙 → ${fmt(Math.floor(x.a*(1+x.p/100)))} 🪙</b><span>+${x.p}%</span></div>
      <div class="qbot"><small>${rd?'Готово':'Осталось '+left(x.end-Date.now())}</small>${rd?`<button class="btn main sm" data-bout="dep" data-id="${x.id}">Забрать</button>`:`<button class="btn sm" data-bearly="${x.id}">Досрочно (без процентов)</button>`}</div></div>`}).join('');
    return `<div class="bkplans">${PLANS.map((p,i)=>`<button class="bkplan" data-bp="${i}" aria-pressed="${bk.plan===i}"><b>${p.d} ${p.d===1?'день':p.d<5?'дня':'дней'}</b><small>надёжно</small><em>+${p.p}%</em></button>`).join('')}</div>
      ${amtBox()}<p class="sum" id="bk-pv">${prev()}</p>
      <button class="btn main cwide" data-bnew="dep"${b.dep.length>=MAXDEP?' disabled':''}>${b.dep.length>=MAXDEP?'Максимум '+MAXDEP+' вклада':'Открыть вклад'}</button>
      <h4 class="bgrp">Мои вклады · ${b.dep.length} из ${MAXDEP}</h4>${act||'<p class="sum">Пока нет вкладов</p>'}`;
  }
  function invHtml(b){
    const act=b.inv.map(x=>{const c=COMP.find(y=>y.id===x.c)||COMP[0],rd=Date.now()>=x.end,v=Math.floor(x.a*(1+x.r/100));
      return `<div class="quest bkrow"><div class="qtop"><b>${c.ic} ${c.n} · ${fmt(x.a)} 🪙</b><span>${rd?pct(x.r):'?'}</span></div>
      <div class="qbot"><small>${rd?`Итог: ${fmt(v)} 🪙`:'Результат через '+left(x.end-Date.now())}</small>${rd?`<button class="btn main sm" data-bout="inv" data-id="${x.id}">Забрать</button>`:''}</div></div>`}).join('');
    return `<div class="bkco">${COMP.map(c=>`<button class="bkcm" data-bc="${c.id}" aria-pressed="${bk.co===c.id}" style="--tc:${c.c}"><span>${c.ic}</span><div><b>${c.n}</b><small>${c.k}</small></div><em>${pct(c.lo)} … ${pct(c.hi)}</em></button>`).join('')}</div>
      ${amtBox()}<p class="sum" id="bk-pv">${prev()}</p>
      <button class="btn main cwide" data-bnew="inv"${b.inv.some(x=>x.c===bk.co)?' disabled':''}>${b.inv.some(x=>x.c===bk.co)?'В эту компанию уже вложено':'Вложить на 6 ч'}</button>
      <p class="sum">Результат известен только в конце срока. Чем выше потенциал — тем больше риск потерять часть суммы.</p>
      <h4 class="bgrp">Мои вложения</h4>${act||'<p class="sum">Пока нет вложений</p>'}`;
  }
  const ok=()=>{save();try{render()}catch(e){}sheet()};
  function onClick(e){
    const t=e.target,b=B();
    if(t.closest('[data-bx]')){bk.open=false;return sheet()}
    let x;
    if(x=t.closest('[data-bt]')){bk.tab=x.dataset.bt;return sheet()}
    if(x=t.closest('[data-bp]')){bk.plan=+x.dataset.bp;return sheet()}
    if(x=t.closest('[data-bc]')){bk.co=x.dataset.bc;return sheet()}
    if(x=t.closest('[data-bk]')){const k=+x.dataset.bk;bk.amt=String(Math.max(0,Math.min(MAXA,Math.floor(S.coins*k))));return sheet()}
    if(x=t.closest('[data-bnew]')){
      const a=amt();if(a<MINA)return toast('Минимум '+fmt(MINA)+' 🪙');if(a>S.coins)return toast('Не хватает монет');
      if(x.dataset.bnew==='dep'){if(b.dep.length>=MAXDEP)return;const p=PLANS[bk.plan];S.coins-=a;b.dep.push({id:Date.now()+''+Math.floor(Math.random()*999),a,p:p.p,end:Date.now()+p.d*DAY});toast('Вклад открыт');}
      else{const c=COMP.find(y=>y.id===bk.co);if(b.inv.some(y=>y.c===c.id))return;S.coins-=a;const r=Math.round((c.lo+(c.hi-c.lo)*Math.pow(Math.random(),1.3))*10)/10;b.inv.push({id:Date.now()+''+Math.floor(Math.random()*999),c:c.id,a,r,end:Date.now()+INVT});toast('Вложено в '+c.n)}
      bk.amt='';try{sfx('coin')}catch(er){}return ok()}
    if(x=t.closest('[data-bout]')){
      const kind=x.dataset.bout,list=b[kind==='dep'?'dep':'inv'],i=list.findIndex(y=>y.id===x.dataset.id);if(i<0||Date.now()<list[i].end)return;
      const y=list[i],get=Math.floor(y.a*(1+(kind==='dep'?y.p:y.r)/100));list.splice(i,1);S.coins=Math.min(CAP,S.coins+get);
      toast((get>=y.a?'+':'')+fmt(get-y.a)+' 🪙 · на баланс '+fmt(get));try{sfx(get>=y.a?'coins':'uplose')}catch(er){}return ok()}
    if(x=t.closest('[data-bearly]')){const i=b.dep.findIndex(y=>y.id===x.dataset.bearly);if(i<0)return;const y=b.dep[i];b.dep.splice(i,1);S.coins=Math.min(CAP,S.coins+y.a);toast('Вклад закрыт, вернули '+fmt(y.a)+' 🪙');return ok()}
  }
  document.addEventListener('click',e=>{const o=e.target.closest&&e.target.closest('[data-bank="open"]');if(o){bk.open=true;sheet()}});
  setInterval(()=>{if(bk.open&&!document.activeElement.matches('#bk-amt'))sheet()},30000);
})();
