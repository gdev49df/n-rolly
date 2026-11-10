// Коллекционные ники: вкладка «Коллекция», улучшение ника, подарок. Данные и редкость — в colldata.js.
(function(){
  if(typeof S==='undefined'||!window.CD)return;
  const CDt=window.CD,UP_K=3.5,UP_ADD=50000,GIFT_FEE=1000000;
  const cl={sel:null,load:false,err:'',busy:false};
  if(!Array.isArray(S.cl))S.cl=[];
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const upCost=it=>Math.round(val(it.t,it.p,it.n)*UP_K+UP_ADD);
  const cVal=c=>Math.round((c.base||1)*CDt.mult(c.N));
  window.collVal=cVal;
  const symUri=(path,op)=>`url('data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='84' height='84' viewBox='0 0 84 84'><g fill='white'><g fill-opacity='${op}' transform='translate(4 6) scale(.8)'><path d='${path}'/></g><g fill-opacity='${op*.7}' transform='translate(50 10) rotate(18 12 12) scale(.5)'><path d='${path}'/></g><g fill-opacity='${op}' transform='translate(42 46) scale(.8)'><path d='${path}'/></g><g fill-opacity='${op*.6}' transform='translate(8 52) rotate(-16 12 12) scale(.5)'><path d='${path}'/></g></g></svg>`).replace(/'/g,'%27')}')`;
  const RAR=[[1500,'Обычный','#cfd6e6'],[5000,'Необычный','#7be39a'],[20000,'Редкий','#5cc8ff'],[100000,'Эпический','#c18cff'],[1000000,'Легендарный','#ffc83d'],[1e12,'Мифический','#ff6b8a']];
  const rarOf=n=>{for(let i=0;i<RAR.length;i++)if(n<RAR[i][0])return{i,n:RAR[i][1],c:RAR[i][2]};return{i:5,n:RAR[5][1],c:RAR[5][2]}};
  function cardHtml(c,o){
    o=o||{};const b=CDt.BG[c.bg]||CDt.BG[0],s=CDt.SY[c.sym]||CDt.SY[0],f=Math.min(5,c.frm|0),big=o.big?' big':'',r=rarOf(c.N),fr=CDt.FR[f]||CDt.FR[0];
    return `<div class="kcard cf${f} kr${r.i}${big}" style="--c1:${b[1]};--c2:${b[2]};--rc:${r.c}"><div class="kcin" style="background:radial-gradient(circle at 50% 40%,${b[1]} 0%,${b[2]} 85%)">
      <div class="kcrays"></div>
      <div class="kcpat" style="background-image:${symUri(s[1],.16)}"></div>
      <div class="kcglow"></div>
      <span class="kcsy"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${s[1]}" fill="currentColor"/></svg></span>
      <div class="kctx"><div class="kcnm">@${esc(c.n)}</div><div class="kcchips"><span class="kcrar">${r.n}</span>${f?`<span class="kcfr">${fr[0]}</span>`:''}<span class="kcod">1 из ${fmt(c.N)}</span></div></div>
      ${o.val?`<div class="kcval">${fmt(cVal(c))} 🪙</div>`:''}
      ${c.price>0?'<div class="kcmk">на рынке</div>':''}<div class="kcshine"></div></div></div>`;
  }
  window.collCard=cardHtml;
  const attrs=c=>{const b=CDt.BG[c.bg],s=CDt.SY[c.sym],f=CDt.FR[c.frm];
    return `<div class="cattr"><span><small>фон</small><b>${b[0]}</b><i>${CDt.pct(CDt.pBg(c.bg))}</i></span><span><small>символ</small><b>${s[0]}</b><i>${CDt.pct(CDt.pSy(c.sym))}</i></span><span><small>рамка</small><b>${f[0]}</b><i>${CDt.pct(CDt.pFr(c.frm))}</i></span></div>`};
  async function req(path,body){return lbReq(path,body)}
  function bestSync(){try{(S.cl||[]).forEach(c=>noteBest(cVal(c),c.n))}catch(e){}}
  async function sync(){
    if(!API||!tg||!tg.initData)return;
    cl.load=true;cl.err='';
    try{
      const r=await req('/coll/mine');
      const ids=new Set((r.list||[]).map(x=>x.id));
      const have=new Map(S.cl.map(x=>[x.id,x]));
      S.cl=(r.list||[]).map(x=>({id:x.id,n:x.nick,bg:x.bg,sym:x.sym,frm:x.frm,N:x.n,base:(have.get(x.id)||{}).base||x.base||1,own:x.own||'',price:x.price||0,ts:x.ts}));
      bestSync();save();
      if(r.sold&&r.sold.length){try{const q=await req('/coll/claim',{});if(q&&q.sum>0){S.coins+=q.sum;save();render();try{sfx('coins')}catch(e){}toast('Продано на рынке: +'+fmt(q.sum)+' 🪙')}}catch(e){}}
    }catch(e){cl.err='Не удалось загрузить коллекцию'}
    cl.load=false;if(!$('#tab-coll').hidden)renderColl();
  }
  window.collSync=sync;
  window.openColl=function(){renderColl();sync()};
  window.renderColl=function(){
    const el=$('#tab-coll');if(!el)return;
    const list=[...S.cl].sort((a,b)=>cVal(b)-cVal(a)),tot=list.reduce((a,c)=>a+cVal(c),0);
    let h=subTabs('stock','coll')+`<div class="chead"><div><h2>Коллекция</h2></div><button class="btn sm" id="cl-up">✨ Улучшить ник</button></div>`;
    if(cl.err)h+=`<p class="cerr">${esc(cl.err)}</p>`;
    h+=`<p class="cinfo">Улучшать можно ники «Секретный» и «Эксклюзивный»: ник получает фон, символ и рамку. Чем реже сочетание, тем дороже.${list.length?` Оценка коллекции: <b>${fmt(tot)} 🪙</b>`:''}</p>`;
    if(!list.length)h+=`<div class="empty">Пока нет коллекционных ников.<br>Нажми «Улучшить ник» и выбери «Секретный» или «Эксклюзивный» ник со склада.</div>`;
    else h+=`<div class="cgrid">`+list.map(c=>`<button class="cslot" data-cid="${c.id}">${cardHtml(c,{val:1})}</button>`).join('')+`</div>`;
    el.innerHTML=h;
  };
  function sheet(id,inner,onclick){
    let o=document.getElementById(id);if(o)o.remove();
    o=document.createElement('div');o.id=id;o.className='usheet';document.body.append(o);
    o.innerHTML=`<div class="sbg" data-cx="1"></div><div class="sbox casebox clbox">${inner}</div>`;
    o.onclick=e=>{if(e.target.closest('[data-cx]'))return o.remove();onclick(e,o)};return o;
  }
  // ---- улучшение ----
  function pickSheet(){
    const its=S.items.filter(x=>x.t>=6).sort((a,b)=>val(b.t,b.p,b.n)-val(a.t,a.p,a.n));
    if(!its.length)return toast('Улучшать можно только ники «Секретный» и «Эксклюзивный»: на складе таких нет');
    sheet('clpick',`<div class="shead"><b>✨ Какой ник улучшить?</b><button class="btn sm" data-cx="1">✕</button></div>
      <div class="clist">${its.map(x=>`<button class="item" data-up="${x.id}" style="--tc:${T[x.t].c}"><div><b>@${esc(x.n)}</b><small>${T[x.t].n}</small></div><span>${fmt(upCost(x))} 🪙</span></button>`).join('')}</div>`,
      (e,o)=>{const b=e.target.closest('[data-up]');if(b){o.remove();confirmUp(b.dataset.up)}});
  }
  function confirmUp(id){
    const it=S.items.find(i=>i.id===id);if(!it)return;const cost=upCost(it),poor=S.coins<cost;
    sheet('clconf',`<div class="shead"><b>Улучшить @${esc(it.n)}</b><button class="btn sm" data-cx="1">✕</button></div>
      <div class="cmys"><div class="cseal"><div class="cq">?</div></div></div><p class="cinfo">Ник получит случайные фон, символ и рамку. Улучшение необратимо: ник уйдёт из склада в коллекцию.<br>Стоимость: <b>${fmt(cost)} 🪙</b>. Оценка ника после улучшения: от ×${CDt.mult(20).toFixed(1).replace('.',',')} до ×25 от текущей (${fmt(val(it.t,it.p,it.n))} 🪙).</p>
      <button class="btn main" id="cl-go"${poor?' disabled':''}>${poor?'Не хватает монет':'Улучшить за '+fmt(cost)+' 🪙'}</button>`,
      async(e,o)=>{if(!e.target.closest('#cl-go')||cl.busy)return;cl.busy=true;
        const base=val(it.t,it.p,it.n);
        try{
          if(!S.items.some(i=>i.id===id)||S.coins<cost)throw new Error('e:state');
          const r=await req('/coll/upgrade',{nick:it.n,base});
          S.coins-=cost;S.items=S.items.filter(i=>i.id!==id);
          const c={id:r.id,n:it.n,bg:r.bg,sym:r.sym,frm:r.frm,N:r.n,base};S.cl.push(c);bestSync();
          save();render();o.remove();reveal(c);
        }catch(err){const m=String(err.message||'');toast(m==='e:tier'?'Улучшать можно только «Секретные» и «Эксклюзивные» ники':m==='e:state'?'Нужен этот ник на складе и достаточно монет':'Не получилось улучшить. Проверь соединение')}
        cl.busy=false});
  }
  function reveal(c){
    const r=rarOf(c.N),rnd=n=>Math.floor(Math.random()*n);
    const o=sheet('clrev',`<div class="shead"><b>Улучшаем…</b><button class="btn sm" data-cx="1">✕</button></div>
      <div class="cspin"><div class="cface" id="cl-face"></div><div class="cflash" style="--rc:${r.c}"></div><div class="cburst" style="--rc:${r.c}">${Array.from({length:18},(_,i)=>`<i style="--a:${i*360/18}deg;--d:${80+(i%4)*26}px"></i>`).join('')}</div></div>
      <div class="cprog"><i id="cl-bar"></i></div><div class="cphase" id="cl-ph">Подбираем фон…</div>
      <div class="cafter">${attrs(c)}<p class="cinfo"><b style="color:${r.c}">${r.n}</b> · редкость <b>1 из ${fmt(c.N)}</b><br>Оценка: <b>${fmt(cVal(c))} 🪙</b></p><button class="btn main" data-cx="1">Отлично</button></div>`,(e)=>{if(e.target.closest('.cspin'))skip()});
    const face=o.querySelector('#cl-face'),bar=o.querySelector('#cl-bar'),ph=o.querySelector('#cl-ph'),hd=o.querySelector('.shead b');
    const T1=1000,T2=1900,T3=2800,t0=Date.now();let stop=false,tm=0,stage=0;
    const draw=(bgv,syv,frv,cls)=>{face.innerHTML=cardHtml({n:c.n,bg:bgv,sym:syv,frm:frv,N:c.N,base:c.base},{big:1}).replace('class="kcard','class="kcard '+(cls||'')+' ')};
    const tick=()=>{
      if(stop||!o.isConnected)return;
      const t=Date.now()-t0;
      if(t>=T3){return done()}
      const st=t<T1?0:t<T2?1:2;
      if(st!==stage){stage=st;try{hap('l')}catch(e){}ph.textContent=st===1?'Подбираем символ…':'Подбираем рамку…'}
      draw(t>=T1?c.bg:rnd(CDt.BG.length),t>=T2?c.sym:rnd(CDt.SY.length),rnd(CDt.FR.length));
      bar.style.width=Math.min(100,t/T3*100)+'%';
      try{if(Math.random()<.6)sfx('tap')}catch(e){}
      tm=setTimeout(tick,70+t/T3*130);
    };
    function done(){
      if(stop)return;stop=true;clearTimeout(tm);
      draw(c.bg,c.sym,c.frm,'land');bar.style.width='100%';ph.textContent='';
      hd.textContent=c.frm>=3||c.N>=100000?'Вот это находка!':'Готово!';
      o.classList.add('open');
      try{sfx('level');hap('n','success')}catch(e){}
    }
    function skip(){if(!stop){clearTimeout(tm);done()}}
    draw(rnd(CDt.BG.length),rnd(CDt.SY.length),rnd(CDt.FR.length));
    tm=setTimeout(tick,60);
    if(!$('#tab-coll').hidden)renderColl();
  }
  // ---- подарок ----
  function viewSheet(id){
    const c=S.cl.find(x=>x.id===id);if(!c)return;
    sheet('clview',`<div class="shead"><b>@${esc(c.n)}</b><button class="btn sm" data-cx="1">✕</button></div>
      <div class="crev">${cardHtml(c,{big:1})}</div>${attrs(c)}
      <p class="cinfo">Редкость: <b>1 из ${fmt(c.N)}</b> · оценка <b>${fmt(cVal(c))} 🪙</b></p>
      <button class="btn" id="cl-gift">🎁 Подарить (${fmt(GIFT_FEE)} 🪙)</button>`,
      (e,o)=>{if(e.target.closest('#cl-gift')){o.remove();giftSheet(id)}});
  }
  function giftSheet(id){
    const c=S.cl.find(x=>x.id===id);if(!c)return;
    sheet('clgift',`<div class="shead"><b>🎁 Подарить @${esc(c.n)}</b><button class="btn sm" data-cx="1">✕</button></div>
      <p class="cinfo">Введи Telegram-username игрока (он должен играть в Нейм-рулетку). Передача стоит <b>${fmt(GIFT_FEE)} 🪙</b>, ник перейдёт к нему.</p>
      <input class="aui" id="cl-to" placeholder="@username" autocomplete="off" autocapitalize="off" spellcheck="false">
      <button class="btn main" id="cl-send">Подарить</button>`,
      async(e,o)=>{if(!e.target.closest('#cl-send')||cl.busy)return;
        const to=(o.querySelector('#cl-to').value||'').replace(/^@/,'').trim();
        if(!/^[A-Za-z][A-Za-z0-9_]{3,31}$/.test(to))return toast('Введи корректный username');
        if(S.coins<GIFT_FEE)return toast('Не хватает монет на передачу');
        cl.busy=true;
        try{
          const r=await req('/coll/gift',{id,to});
          S.coins-=GIFT_FEE;S.cl=S.cl.filter(x=>x.id!==id);save();render();o.remove();renderColl();
          toast('Подарено игроку @'+(r.to||to));
        }catch(err){const m=String(err.message||'');toast(m==='e:nouser'?'Игрок с таким username не найден в игре':m==='e:self'?'Нельзя подарить самому себе':m==='e:gone'?'Этот ник уже не твой':'Не получилось отправить')}
        cl.busy=false});
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest('#tab-coll button,#tab-col .cslot');if(!b)return;
    if(b.id==='cl-up')return pickSheet();
    if(b.dataset.cid)return viewSheet(+b.dataset.cid);
  });
  // наклон большой карточки за пальцем
  const tilt=e=>{const k=e.target.closest&&e.target.closest('.kcard.big');if(!k)return;const r=k.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;k.style.setProperty('--rx',(-y*16).toFixed(1)+'deg');k.style.setProperty('--ry',(x*16).toFixed(1)+'deg');k.style.setProperty('--mx',(x*100+50)+'%')};
  const untilt=e=>{const k=e.target.closest&&e.target.closest('.kcard.big');if(k){k.style.setProperty('--rx','0deg');k.style.setProperty('--ry','0deg')}};
  document.addEventListener('pointermove',tilt);document.addEventListener('pointerup',untilt);document.addEventListener('pointerleave',untilt,true);
  // блок «Улучшенные ники» для вкладки «Ники»
  window.collStrip=function(){
    if(!S.cl.length)return '';
    const list=[...S.cl].sort((a,b)=>cVal(b)-cVal(a));
    return `<div class="chead"><div><h2>Улучшенные ники</h2></div></div><div class="cgrid cstrip">`+list.map(c=>`<button class="cslot" data-cid="${c.id}">${cardHtml(c,{val:1})}</button>`).join('')+`</div>`;
  };
  window.collUpgradeCost=upCost;
})();
