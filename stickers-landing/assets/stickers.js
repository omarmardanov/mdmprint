/* Скрипты лендинга 3D-стикеров. Подключается в конце body, DOM уже разобран.
   При правке бампать ?v= в stickers-v2.html. */
  /* ═══════════ ЦЕЛИ МЕТРИКИ — правятся ТОЛЬКО здесь ═══════════
     Счётчика на странице нет: решение «91973 или новый» за заказчиком (HANDOFF.md §4).
     Разработчику: вписать номер в YM_ID и вставить сниппет Метрики — больше ничего не нужно,
     все точки на странице уже размечены. Имена целей и что по ним смотреть — ANALYTICS.md.
     Пока YM_ID = 0, достижения копятся в window.__goals: их видно в консоли, и разметку
     можно проверить, не подключая счётчик. */
  const YM_ID = 0;
  window.__goals = [];
  function goal(name, place){
    window.__goals.push(place ? name + ':' + place : name);
    if(YM_ID && typeof ym === 'function') ym(YM_ID, 'reachGoal', name, place ? {place: place} : undefined);
  }
  /* Одна цель на действие, место — параметром: «Рассчитать» стоит в пяти местах, а шаг
     воронки один. Разбивка по местам видна в отчёте по параметрам цели. */
  const goalOnce = (function(){ const seen = new Set();
    return function(name){ if(seen.has(name)) return; seen.add(name); goal(name); }; })();
  /* Клики размечены атрибутом data-goal прямо в разметке. Делегирование, а не слушатель
     на каждой кнопке: телефон, почта и мессенджеры повторяются в шапке, лидформе,
     футере и мобильной полосе — это четыре одинаковых пары на каждый канал. */
  document.addEventListener('click', function(e){
    const el = e.target.closest('[data-goal]');
    if(el) goal(el.dataset.goal, el.dataset.place);
  });
  /* Калькулятор: цель «человек считал», а не «открыл экран». Ловим первое изменение любого
     поля — до итога он доходит сам, пересчёт идёт на каждый клик. Один раз за визит. */
  document.getElementById('calc')?.addEventListener('change', function(){ goalOnce('calc_use'); });

  /* ═══════════ ЮРИДИЧЕСКИЕ ДОКУМЕНТЫ — правятся ТОЛЬКО здесь ═══════════
     Все ссылки на документы в разметке помечены data-legal="ключ" и адрес получают отсюда.
     Пустая строка = документа у бизнеса пока нет: ссылка на странице становится обычным
     текстом с пунктирным подчёркиванием и не ведёт в никуда. Как только Omar пришлёт
     адреса — вписать сюда, больше нигде править не нужно.
     Статус на 04.08: оферта и пользовательское соглашение ЕСТЬ, остальное ЖДЁМ (ANSWERS п.10). */
  /* Копирование телефона и почты по клику — только для мыши. Смысл: на десктопе ссылка
     tel: обычно ведёт в никуда (или открывает ненужное приложение), а человеку нужен сам
     номер, чтобы вставить его в свой телефон или CRM. На тач-устройствах поведение
     стандартное: звонок и почтовый клиент.
     navigator.clipboard живёт только на https и localhost — на http по локальной сети
     (как при просмотре с телефона) он недоступен, поэтому есть запасной путь. */
  (function(){
    if(!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    const copy = async text => {
      try { await navigator.clipboard.writeText(text); return true; }
      catch(e){
        const t=document.createElement('textarea');
        t.value=text; t.setAttribute('readonly',''); t.style.cssText='position:fixed;opacity:0';
        document.body.appendChild(t); t.select();
        let ok=false; try{ ok=document.execCommand('copy'); }catch(_){}
        t.remove(); return ok;
      }
    };
    for(const a of document.querySelectorAll('a[href^="tel:"],a[href^="mailto:"]')){
      if(a.dataset.copy) continue;          // у элемента уже есть своё копирование (телефон в шапке)
      a.dataset.copy='';
      a.addEventListener('click', async e => {
        e.preventDefault();
        const value = decodeURIComponent(a.getAttribute('href').replace(/^(tel|mailto):/,''));
        if(await copy(value)){
          a.classList.add('is-copied');
          clearTimeout(a._ct);
          a._ct = setTimeout(()=>a.classList.remove('is-copied'), 1500);
        } else location.href = a.getAttribute('href');   // не вышло — ведём себя как обычная ссылка
      });
    }
  })();

  /* ═══════════ КАНАЛЫ СВЯЗИ — правятся ТОЛЬКО здесь ═══════════
     Ссылки сняты с их сайта 05.08. В Telegram у бизнеса ДВА адреса: канал t.me/mdmprint
     (туда только читают) и бот t.me/MDMprint_bot (туда пишут). Для кнопок «Написать»
     нужен бот — канал в этой роли был бы тупиком. Если менеджеры предпочтут личный
     аккаунт, поменять здесь одну строку.
     Пусто = ссылки нет: кнопка тогда ведёт в форму заявки, как раньше. */
  const CONTACTS = {
    tg:  'https://t.me/MDMprint_bot',
    max: 'https://max.ru/u/f9LHodD0cOI9Tc-bhH8PtupT-lmXfFhPewx04OC-N5XYug9PIubEzTbzfIk'
  };
  (function(){
    for(const a of document.querySelectorAll('[data-msg]')){
      const url = CONTACTS[a.dataset.msg];
      if(!url) continue;                       // нет адреса — остаётся переход к форме
      a.href = url; a.target = '_blank'; a.rel = 'noopener';
    }
  })();

  const LEGAL = {
    offer:   'https://mdmprint.ru/publichnaya-oferta',   // публичная оферта — есть
    /* ИСПРАВЛЕНО 21.08. Вывод от 05.08 («политика лежит на /terms под чужим заголовком»)
       был ошибкой: на /terms — настоящее пользовательское соглашение, а строка «Политика
       в отношении обработки персональных данных» там всего лишь пункт оглавления.
       Сама политика живёт отдельной страницей, на неё и ссылаемся. */
    privacy: 'https://mdmprint.ru/soglasie-na-obrabotku-personalnyh-dannyh',
    terms:   'https://mdmprint.ru/terms',   // пользовательское соглашение
    consent: '',   // отдельного согласия на обработку ПД нет — покрывается политикой
    /* Нашлось 05.08 в футере их сайта: отдельное «Положение об обработке файлов cookies».
       Теперь плашка о cookie ведёт именно туда, а не в общую политику. */
    cookie:  'https://mdmprint.ru/polozhenie-ob-obrabotke-fajlov-cookies'
  };
  (function(){
    for(const a of document.querySelectorAll('[data-legal]')){
      const url = LEGAL[a.dataset.legal];
      if(url){ a.href = url; a.removeAttribute('data-pending'); }
      else {
        /* Ссылка без адреса — худший вариант: ведёт в никуда и выглядит рабочей.
           Оставляем текст, снимаем интерактивность, помечаем для себя. */
        a.removeAttribute('href'); a.removeAttribute('target'); a.removeAttribute('rel');
        a.setAttribute('data-pending','');
        a.title = 'Документ ещё не предоставлен заказчиком';
      }
    }
  })();

  /* ГЕРОЙ (десктоп): четыре стикера лежат кучкой и по скроллу раскрываются веером.
     ── КАДРЫ ДВИЖЕНИЯ ───────────────────────────────────────────────────────────────
     Для каждого стикера две позы — «покой» и «конец дорожки», всё между ними считается
     интерполяцией.
       x,y  — сдвиг в % от СОБСТВЕННОЙ ширины элемента (не сцены): так поза не плывёт
              при смене размера сцены;
       r,s  — поворот в плоскости и масштаб;
       blur — размытие задних планов, глубина;
       o    — камера модели [theta, phi, radius%]: phi 90° = стикер лежит, 0° = смотрит в лицо;
       t    — окно прогресса, в котором элемент едет (сдвиг стартов = ощущение веса);
       d    — амплитуда СЛЕЖЕНИЯ за курсором в градусах: стикер доворачивается к мыши,
              позиция при этом не меняется (это не параллакс — сцена не ездит).
     Смещения в покое подобраны замером так, чтобы ни один стикер не был спрятан целиком.
     ──────────────────────────────────────────────────────────────────────────────── */
  (function(){
    const hero  = document.querySelector('.hero');
    const stage = document.querySelector('.hero__stage');
    if(!hero || !stage) return;
    const rm   = matchMedia('(prefers-reduced-motion:reduce)');
    const mob  = matchMedia('(max-width:860px)');
    if(rm.matches) return;
    /* Сцена одна на обе раскладки. Отдельный масштаб для мобилки не нужен: смещения в таблице
       поз заданы в ПРОЦЕНТАХ от размера самого стикера, а размер стикера — процент от ширины
       сцены. Композиция ужимается вместе со сценой сама. */

    const SHADOW = {from:{sx:1,sy:1,op:.5}, to:{sx:1.9,sy:.78,op:.22}};
    const OBJS = {
      main:{t:[0,.9],  d:16,
        from:{x:0,  y:8,   r:-4, s:1,   blur:0,   o:[-12,52,104]},
        to:  {x:6,  y:-6,  r:0,  s:1.06,blur:0,   o:[10,14,94]}},
      a:{t:[.06,1],    d:22,
        from:{x:-64,y:-36, r:-12,s:.82, blur:1.1, o:[22,64,106]},
        to:  {x:-98,y:-62, r:-20,s:.76, blur:0,   o:[46,30,104]}},
      b:{t:[.12,1],    d:24,
        from:{x:60, y:-42, r:13, s:.8,  blur:1.3, o:[-30,44,106]},
        to:  {x:82, y:-62, r:20, s:.74, blur:0,   o:[-54,26,104]}},
      c:{t:[.18,1],    d:24,
        from:{x:88, y:66,  r:8,  s:.78, blur:1.5, o:[14,70,106]},
        to:  {x:96, y:80,  r:14, s:.72, blur:0,   o:[34,34,104]}}
    };

    /* На узком экране сцена ниже, и прежний ход нижнего стикера (66 → 80% собственной высоты)
       уводил его под самую кромку — в зону растворения. Ход уменьшен вдвое: движение
       читается, а стикер остаётся в кадре. */
    if(mob.matches){ OBJS.c.from.y = 34; OBJS.c.to.y = 42; }

    const clamp = (v,a,b) => Math.min(b, Math.max(a, v));
    const mix = (a,b,t) => a+(b-a)*t;
    const seg = (p,a,b) => clamp((p-a)/(b-a),0,1);
    const easeOut = t => 1-Math.pow(1-t,3);
    /* Для скролла easeOut не годится: к середине дорожки он уже отрабатывает 87% пути,
       и вторая половина прокрутки стоит мёртвой. Нужна кривая, размазанная по всей дорожке. */
    const easeInOut = t => t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
    /* Перелёт отдельным горбом на последней четверти: элемент уезжает чуть ДАЛЬШЕ цели
       и садится назад ровно к концу. В самой кривой этого не выразить — она монотонна. */
    const overshoot = t => t<.72 ? 0 : Math.sin((t-.72)/.28*Math.PI);

    const shadow = stage.querySelector('.hero__sh');
    const items = Object.entries(OBJS).map(([key,c])=>{
      const el = stage.querySelector('[data-obj="'+key+'"]');
      // перелёт только у спутников: главный — опора кадра, он должен ехать ровно
      return {el, mv:el.querySelector('model-viewer'), c, lbl:el.querySelector('span'),
              over: key==='main' ? 0 : .08};
    });

    /* Курсор: цель обновляем на pointermove, а в кадре подтягиваем к ней с затуханием —
       без сглаживания стикеры дёргаются вслед за каждым событием мыши. */
    let mx=0,my=0,tmx=0,tmy=0;
    if(matchMedia('(hover:hover) and (pointer:fine)').matches){
      addEventListener('pointermove', e => {
        tmx = (e.clientX/innerWidth -.5)*2;
        tmy = (e.clientY/innerHeight-.5)*2;
      }, {passive:true});
    }

    /* Влёт при первом показе: большинство людей вообще не скроллит, поэтому первое
       движение должно случиться само. Один раз, 900 мс. */
    let enter = 0;
    addEventListener('load', () => setTimeout(() => {
      const t0 = performance.now();
      (function step(now){
        enter = clamp((now-t0)/900,0,1);
        if(enter<1) requestAnimationFrame(step);
      })(performance.now());
    }, 120));

    function paint(){
      mx += (tmx-mx)*.08; my += (tmy-my)*.08;
      const e = easeOut(enter);
      const r = hero.getBoundingClientRect();

      if(r.bottom > -200 && r.top < innerHeight+200){
        /* Прогресс = сколько хода пройдено. На десктопе ход = высота дорожки минус экран:
           ровно на этом отрезке .hero__pin стоит на месте. На телефоне липкости нет и
           дорожки нет — герой ростом в экран, разность дала бы ноль и деление на ноль.
           Там ход считаем долей самого героя: веер успевает раскрыться, пока он уезжает. */
        const travel = mob.matches ? r.height*.55 : (r.height-innerHeight);
        const p = clamp(-r.top/travel,0,1);
        hero.classList.toggle('hero--rolled', p > .12);

        for(const {el,mv,c,lbl,over} of items){
          const raw = seg(p, c.t[0], c.t[1]);
          const t = easeInOut(raw);
          const k = 1 + over*overshoot(raw);   // перелёт по траектории, не по масштабу
          const f=c.from, o=c.to;
          const x = mix(f.x,o.x,t*k);
          const y = mix(f.y,o.y,t*k) + (1-e)*26;   // влёт: приезжают снизу
          const s = mix(f.s,o.s,t) * mix(.86,1,e);
          el.style.transform =
            'translate('+(-50+x)+'%, '+(-50+y)+'%) rotate('+mix(f.r,o.r,t*k)+'deg) scale('+s+')';
          el.style.opacity = e;
          const bl = mix(f.blur,o.blur,t);
          el.style.filter = bl>.05 ? 'blur('+bl.toFixed(2)+'px) brightness('+mix(.93,1,t)+')' : '';
          /* Слежение за курсором: доворот камеры поверх позы, которую задал скролл.
             По горизонтали свободно, по вертикали — не больше ±4° от текущей позы:
             на снимках видно, что уже +5° кладут главный стикер на ребро и логотип
             перестаёт читаться, а он тут главный носитель смысла. */
          const phBase = mix(f.o[1],o.o[1],t);
          const th = mix(f.o[0],o.o[0],t) + mx*c.d;
          const ph = clamp(phBase + my*c.d*.2, phBase-4, phBase+4);
          mv.setAttribute('camera-orbit',
            th.toFixed(1)+'deg '+ph.toFixed(1)+'deg '+mix(f.o[2],o.o[2],t).toFixed(1)+'%');
          if(lbl) lbl.style.opacity = e;
        }
        const sp = easeInOut(p);
        shadow.style.transform = 'translate(-50%,-50%) scale('+
          mix(SHADOW.from.sx,SHADOW.to.sx,sp)+','+mix(SHADOW.from.sy,SHADOW.to.sy,sp)+')';
        shadow.style.opacity = mix(SHADOW.from.op,SHADOW.to.op,sp)*e;
      }
      requestAnimationFrame(paint);
    }
    paint();
  })();

  /* Уведомление о cookie: показываем один раз, выбор помним. Задержка 1.2 с — плашка не должна
     спорить с первым экраном в момент загрузки. */
  (function(){
    const bar=document.getElementById('cookieBar'), ok=document.getElementById('cookieOk');
    if(!bar||!ok) return;
    let seen=false;
    try{ seen = localStorage.getItem('mdm-cookie-ok')==='1'; }catch(e){}   // приватный режим
    if(seen) return;
    setTimeout(()=>bar.removeAttribute('hidden'), 1200);
    ok.addEventListener('click',()=>{
      bar.setAttribute('hidden','');
      try{ localStorage.setItem('mdm-cookie-ok','1'); }catch(e){}
    });
  })();

  /* Фон под открытой шторкой делаем инертным. Без этого Tab из последнего поля формы уходит
     на страницу ПОД шторкой: фокус бродит по невидимым ссылкам, а человек не понимает, куда
     он делся. Шторки лежат прямыми детьми body, поэтому достаточно пометить соседей.
     Обе модалки страницы («Оформить заказ» и «Доставка») пользуются этой же функцией. */
  function sheetInert(sheet, on){
    for(const el of document.body.children){
      if(el === sheet || el.tagName === 'SCRIPT') continue;
      if(on) el.setAttribute('inert',''); else el.removeAttribute('inert');
    }
  }

  /* Модалка заказа: сводка выбранного + макет + контакты. Открывается кнопкой из итога
     и из мобильной полосы. Доступность: Escape, клик по фону, возврат фокуса. */
  (function(){
    const sh=document.getElementById('orderSheet');
    if(!sh) return;
    const $s=id=>document.getElementById(id);
    const spec=$s('ordSpec'), total=$s('ordTotal'), per=$s('ordPer'), promo=$s('ordPromo');
    const title=$s('orderTitle');
    const src=sh.querySelector('[name="source"]');
    const row=(k,v)=>`<div><dt>${k}</dt><dd>${v}</dd></div>`;
    let back=null;
    function fill(){
      const L=window.__calcLast||{};
      // «от» и здесь: в шторке та же цифра, что в калькуляторе, и та же оговорка
      total.textContent = L.sumText ? 'от '+L.sumText : '—';
      per.textContent   = L.perLong||'';
      promo.textContent = L.promo||'';
      promo.hidden = !L.promo;
      spec.innerHTML = row('Тип', L.kind||'—')
        + row(L.packs?'Паков':'Тираж', (L.q||'—')+(L.packs?'':' шт'))
        + row(L.packs?'Формат':'Размер', (L.size||'—')+(L.packs?'':' мм'))
        + row('Плёнка', L.mat||'—') + row('Смола', L.resin||'—') + row('Срок', L.term||'—')
        + (L.extras&&L.extras.length ? row('Допы', L.extras.join(', ')) : '');
    }
    /* sample=true — вход «Заказать образец»: расчёта нет (калькулятор не считает 1 шт),
       вместо сводки одна строка. Источник уходит в CRM скрытым полем. */
    function show(sample){
      sh.classList.toggle('sheet--sample', !!sample);
      // «поштучно» бессмысленно для стикерпака: пак и есть лист. Раньше это скрывал калькулятор,
      // после переезда галочек в шторку логика переехала сюда.
      // допы выбираются в калькуляторе, в форму уходят скрытыми полями
      const L=window.__calcLast||{};
      const set=(n,v)=>{ const el=sh.querySelector('[name="'+n+'"]'); if(el) el.value=v?'1':''; };
      set('design', !sample && (L.extras||[]).includes('дизайн контура'));
      set('single', !sample && (L.extras||[]).includes('поштучно'));
      set('box',    !sample && (L.extras||[]).includes('инд. упаковка'));
      title.textContent = sample ? 'Заказать образец' : 'Оформить заказ';
      if(sample) spec.innerHTML = row('Заказ','Пробный стикер') + row('Тираж','1 шт'); else fill();
      if(src) src.value = sample ? 'sample' : 'calc';
      goal(sample ? 'sample_open' : 'order_open');
      back=document.activeElement; sh.setAttribute('open','');
      sheetInert(sh, true);
      document.body.style.overflow='hidden'; sh.querySelector('.sheet__close').focus(); }
    function hide(){ sh.removeAttribute('open'); sheetInert(sh, false);
      document.body.style.overflow=''; if(back) back.focus(); }
    /* обёртка в стрелку обязательна: событие как аргумент включило бы режим образца */
    ['orderOpen','barOrder'].forEach(id=>{ const b=document.getElementById(id); if(b) b.addEventListener('click',()=>show(false)); });
    const smp=document.getElementById('heroSample');
    if(smp) smp.addEventListener('click',e=>{ e.preventDefault(); show(true); });
    sh.querySelector('.sheet__close').addEventListener('click',hide);
    sh.addEventListener('click',e=>{ if(e.target===sh) hide(); });
    addEventListener('keydown',e=>{ if(e.key==='Escape'&&sh.hasAttribute('open')) hide(); });
  })();

  /* Стрелки ленты видов: шаг = ширина карточки с зазором, на краях кнопка гаснет. */
  (function(){
    const lane=document.querySelector('.lane');
    const btns=[...document.querySelectorAll('.lane__btn')];
    if(!lane||!btns.length) return;
    const step=()=>{ const c=lane.querySelector('.fcard');
      return c ? c.getBoundingClientRect().width + 20 : lane.clientWidth*.8; };
    const sync=()=>{ const max=lane.scrollWidth-lane.clientWidth-1;
      btns.forEach(b=>{ const back=b.dataset.lane==='-1';
        b.disabled = back ? lane.scrollLeft<=1 : lane.scrollLeft>=max; }); };
    btns.forEach(b=>b.addEventListener('click',()=>
      lane.scrollBy({left:step()*(+b.dataset.lane),behavior:'smooth'})));
    lane.addEventListener('scroll',sync,{passive:true});
    addEventListener('resize',sync,{passive:true});
    sync();
  })();

  /* ═══ ВАЛИДАЦИЯ ФОРМ ═══ Поведение то же, что в прототипе услуги (.cbm-field.invalid):
     маска телефона по мере ввода, МЯГКАЯ проверка по уходу из поля (ругаемся только на
     заполненное и неверное — про пустое скажем по кнопке), ЖЁСТКАЯ по нажатию: подсвечиваем
     всё незаполненное и ведём фокус на первое. Кнопку не гасим — спрятанный disabled
     не объясняет человеку, что не так. */
  (function(){
    const digits = v => (v||'').replace(/\D/g,'');
    const norm = v => { let d=digits(v); if(d[0]==='8') d='7'+d.slice(1);
      if(d && d[0]!=='7') d='7'+d; return d.slice(0,11); };
    const fmt = v => { const d=norm(v); if(!d) return ''; let r='+7';
      if(d.length>1) r+=' ('+d.slice(1,4); if(d.length>=4) r+=')';
      if(d.length>=5) r+=' '+d.slice(4,7); if(d.length>=8) r+='-'+d.slice(7,9);
      if(d.length>=10) r+='-'+d.slice(9,11); return r; };
    const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v||'').trim());
    /* пустое НЕобязательное поле — валидно; заполненное проверяем по типу в любом случае */
    const ok = el => (!el.required && !el.value.trim()) ? true
                   : el.type==='tel'   ? norm(el.value).length===11
                   : el.type==='email' ? emailOk(el.value)
                   : el.value.trim().length>=2;   // «минимум две буквы» — как в услуге
    /* Ошибка помечается не только классом: без aria-invalid и связи с текстом ошибки
       скринридер сообщает «поле Имя» и молчит о том, что с ним не так. Текст ошибки лежит
       рядом в .calc__err — привязываем его к полю по id, id раздаём на месте. */
    let errUid = 0;
    const mark = (el,bad) => {
      const box = el.closest('.calc__f');
      if(!box) return;
      box.classList.toggle('calc__f--bad', !!bad);
      el.setAttribute('aria-invalid', bad ? 'true' : 'false');
      const err = box.querySelector('.calc__err');
      if(!err) return;
      if(!err.id) err.id = 'err-' + (++errUid);
      if(bad) el.setAttribute('aria-describedby', err.id);
      else el.removeAttribute('aria-describedby');
    };

    document.querySelectorAll('#orderSheet form, #orderForm').forEach(form=>{
      const fields=[...form.querySelectorAll('.calc__f input')];
      const consent=form.querySelector('[name="agree"]');
      const phone=form.querySelector('input[type=tel]');
      if(phone) phone.addEventListener('input',()=>{ phone.value=fmt(phone.value); mark(phone,false); });
      fields.forEach(el=>{
        const soft=()=>mark(el, el.value.trim() ? !ok(el) : false);
        el.addEventListener('blur',soft);
        el.addEventListener('input',()=>{ if(ok(el)) mark(el,false); });
      });
      if(consent) consent.addEventListener('change',()=>
        consent.closest('.calc__ok')?.classList.toggle('calc__ok--bad', !consent.checked));
      form.addEventListener('submit',e=>{
        e.preventDefault();
        let first=null;
        fields.forEach(el=>{ const bad=!ok(el); mark(el,bad); if(bad&&!first) first=el; });
        const noConsent = consent && !consent.checked;
        if(consent) consent.closest('.calc__ok')?.classList.toggle('calc__ok--bad', noConsent);
        if(first || noConsent){ (first||consent).focus(); return; }
        /* цель ставим на пройденную валидацию, а не на клик: у шторки заказа поле source
           уже переключено на calc или sample, у формы «Заявка» оно zayavka. */
        goal('lead_' + (form.querySelector('[name="source"]')?.value || 'zayavka'));
        /* ДЕМО: отправки нет — интеграция с Битриксом за разработчиком. Пишем это прямо,
           иначе на прототипе решат, что заявки уже приходят. */
        const done=document.createElement('p');
        done.className='calc__done';
        done.setAttribute('role','status');   // иначе успех виден только зрячим
        done.textContent='Проверено: форма заполнена верно. Это прототип — заявка никуда не уходит, отправку в Битрикс подключает разработчик.';
        form.querySelector('.calc__done')?.remove();
        (form.querySelector('.ord__foot') || form).appendChild(done);
      });
    });
  })();

  /* ЧАВО: открыт всегда ровно один вопрос. Нативный <details> так не умеет — атрибут `name`
     (аккордеон-группа) поддержан не везде, поэтому закрываем соседей вручную по событию toggle. */
  (function(){
    const items=[...document.querySelectorAll('.faq details')];
    if(items.length<2) return;
    items.forEach(d=>d.addEventListener('toggle',()=>{
      if(!d.open) return;
      items.forEach(o=>{ if(o!==d) o.open=false; });
    }));
  })();

  /* Карточка «Связаться»: на десктопе открывается наведением (мышь легко проскакивает мимо,
     поэтому закрытие с задержкой), на таче и с клавиатуры — кликом по кнопке. */
  (function(){
    const box=document.querySelector('.hd__reach');
    if(!box) return;
    const btn=box.querySelector('.hd__reachbtn');
    const hoverable=matchMedia('(hover:hover) and (pointer:fine)').matches;
    let t=null;
    const open=on=>{ if(on) box.setAttribute('data-open',''); else box.removeAttribute('data-open');
      btn.setAttribute('aria-expanded', on?'true':'false'); };
    btn.addEventListener('click',()=>open(!box.hasAttribute('data-open')));
    if(hoverable){
      box.addEventListener('mouseenter',()=>{ clearTimeout(t); open(true); });
      box.addEventListener('mouseleave',()=>{ clearTimeout(t); t=setTimeout(()=>open(false),220); });
    }
    box.addEventListener('focusout',e=>{ if(!box.contains(e.relatedTarget)) open(false); });
    document.addEventListener('click',e=>{ if(!box.contains(e.target)) open(false); });
    addEventListener('keydown',e=>{ if(e.key==='Escape'&&box.hasAttribute('data-open')){ open(false); btn.focus(); } });
  })();

  /* Полоса с ценой ПРЕВРАЩАЕТСЯ в карточку итога — непрерывно, по ходу прокрутки, а не
     переключается по событию. Пока карточка ниже экрана, полоса стоит внизу; по мере того как
     карточка поднимается на своё место, полоса синхронно сжимается и опускается к ней, а сама
     карточка проявляется. На эталоне (mdmprint.ru) итог просто лежит в потоке без перехода вовсе.
     Считаем по координатам на скролле, а не через IntersectionObserver: так переход плавный,
     а не ступенчатый, и поведение предсказуемо. */
  (function(){
    const bar=document.getElementById('calcBar'), calc=document.querySelector('.calc');
    if(!bar||!calc) return;
    const out=calc.querySelector('.calc__out');
    /* Контактное состояние ведёт тот же обработчик: состояния взаимоисключающие, и держать
       их в одном месте дешевле, чем сводить два независимых наблюдателя. */
    const rbar=document.getElementById('reachBar');
    const heroCta=document.querySelector('.hero__cta'), ft=document.querySelector('.ft');
    const calcH2=calc.querySelector('h2');
    const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
    let raf=0;
    function paint(){
      raf=0;
      const cr=calc.getBoundingClientRect();
      /* Переключаемся не по входу секции в кадр (тогда цена всплывала, когда калькулятора
         на экране ещё почти нет), а когда заголовок «Посчитайте…» дошёл до верха экрана. */
      const inCalc = (calcH2 ? calcH2.getBoundingClientRect().top <= 0 : cr.top < innerHeight)
        && cr.bottom > 0;
      bar.classList.toggle('calcbar--live', inCalc);
      if(rbar){
        // герой пролистан, калькулятора на экране нет, футер ещё не показался
        const passed = !heroCta || heroCta.getBoundingClientRect().bottom < 0;
        const atFoot = ft && ft.getBoundingClientRect().top < innerHeight - 8;
        rbar.classList.toggle('rbar--on', passed && !inCalc && !atFoot);
      }
      if(!inCalc){ document.body.classList.remove('has-calcbar'); return; }

      let t=0;                                   // 0 — полоса внизу, 1 — эстафета передана
      if(out){
        const o=out.getBoundingClientRect();
        const start=innerHeight;                 // карточка только показалась снизу
        const end=innerHeight-o.height-24;       // карточка встала целиком
        t=clamp((start-o.top)/Math.max(1,start-end),0,1);
      }
      const ease=t*t*(3-2*t);                    // сглаживаем края, чтобы не дёргалось
      bar.style.transform='translateY('+(ease*115).toFixed(1)+'%) scale('+(1-ease*.06).toFixed(3)+')';
      bar.style.opacity=(1-ease).toFixed(3);
      if(out) out.style.opacity=(0.35+0.65*ease).toFixed(3);
      document.body.classList.toggle('has-calcbar', ease<.9);
    }
    const onScroll=()=>{ if(!raf) raf=requestAnimationFrame(paint); };
    addEventListener('scroll',onScroll,{passive:true});
    addEventListener('resize',onScroll,{passive:true});
    paint();
  })();

  /* Модалка «Доставка и самовывоз»: краткая справка, чтобы не грузить форму лишними шагами. */
  (function(){
    const sh=document.getElementById('shipSheet'), open=document.getElementById('shipOpen');
    if(!sh||!open) return;
    let back=null;
    const show=()=>{ back=document.activeElement; sh.setAttribute('open','');
      sheetInert(sh, true);
      document.body.style.overflow='hidden'; sh.querySelector('.sheet__close').focus(); };
    const hide=()=>{ sh.removeAttribute('open'); sheetInert(sh, false);
      document.body.style.overflow=''; if(back) back.focus(); };
    open.addEventListener('click',show);
    // вторая точка входа — из перетяжки шоурума: там же адреса самовывоза
    document.getElementById('showShip')?.addEventListener('click',show);
    sh.querySelector('.sheet__close').addEventListener('click',hide);
    sh.addEventListener('click',e=>{ if(e.target===sh) hide(); });
    addEventListener('keydown',e=>{ if(e.key==='Escape'&&sh.hasAttribute('open')) hide(); });
  })();

  /* ШАПКА (десктоп): три вещи в ОДНОМ rAF-цикле, чтобы состояния не расходились между собой —
     (1) стекло+сжатие после 80px, (2) инверсия над тёмной секцией, (3) активный пункт меню.
     Ключевое: и инверсия, и подсветка меню считаются по ОДНОЙ пробной линии — нижней кромке
     шапки. Прошлая инверсия ловила центр секции и включалась, пока шапка была ещё над светлым. */
  (function(){
    const hd = document.querySelector('.hd');
    if(!hd) return;
    const links = [...hd.querySelectorAll('.hd__nav a')];
    const targets = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    const heroCta = document.querySelector('.hero__cta');
    let queued = false;

    const paint = () => {
      queued = false;
      const stuck = scrollY > 80;
      hd.classList.toggle('hd--stuck', stuck);
      /* «Рассчитать» в шапке — только когда кнопка героя скрылась ЗА шапкой. Считаем по её
         нижней кромке против нижней кромки шапки, а не по scrollY: высота героя не фиксирована. */
      hd.classList.toggle('hd--cta',
        !heroCta || heroCta.getBoundingClientRect().bottom < hd.getBoundingClientRect().bottom);
      // Инверсия удалена 30.07 (решение Omar: тёмных блоков на странице не держим).
      // Светлое стекло читается и над тёмным футером, поэтому состояние не нужно вовсе.
      const probe = hd.getBoundingClientRect().bottom;          // нижняя кромка шапки
      /* Активный пункт — последняя секция МЕНЮ, начавшаяся выше пробной линии, а не та,
         что линию пересекает. Три секции («Преимущества», «О нас», «Шоурум») пунктов не имеют:
         при проверке на пересечение подсветка на них гасла совсем, и при листании получалось
         мигание Расчёт → Портфолио → пусто → Отзывы. Теперь она держится на ближайшем
         предыдущем пункте. targets идут в порядке документа, поэтому последний подходящий
         и есть ближайший сверху. */
      let cur = null;
      targets.forEach(s => { if(s.getBoundingClientRect().top <= probe + 4) cur = s; });
      links.forEach(a => {
        const on = cur && a.getAttribute('href') === '#' + cur.id;
        if(on) a.setAttribute('aria-current','true'); else a.removeAttribute('aria-current');
      });
    };
    const onScroll = () => { if(!queued){ queued = true; requestAnimationFrame(paint); } };
    addEventListener('scroll', onScroll, {passive:true});
    addEventListener('resize', onScroll, {passive:true});
    paint();
  })();

  /* Телефон в шапке: на десктопе клик копирует номер вместо бесполезного tel:.
     Если копирование недоступно (нет clipboard / отказ) — не мешаем, tel: отработает как был. */
  (function(){
    const a = document.querySelector('.hd__phone[data-copy]');
    if(!a || !matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    let t = null;
    a.addEventListener('click', e => {
      if(!navigator.clipboard) return;
      e.preventDefault();
      navigator.clipboard.writeText(a.dataset.copy).then(() => {
        a.setAttribute('data-done','');
        clearTimeout(t); t = setTimeout(() => a.removeAttribute('data-done'), 1600);
      });
    });
  })();

  /* Блок «Виды»: карточки СТАТИЧНЫ — постеры сняты под наклоном с перспективой,
     чтобы читались и блик смолы, и сам стикер. Живое 3D из блока убрано (осталось в герое);
     модель sticker-glow-3d.glb в репо лежит — если вернём вращение, включать здесь. */

  /* Доклон карточек «Видов» по скроллу удалён 30.07 вместе с живыми моделями: крутить
     нечего, в карточках теперь кадры. Если вернём модели — приём описан в истории лога. */

  /* Калькулятор: тип → плёнка → размер (готовый или свой) → количество (готовое или своё).
     Три параметра вместо шести: их живой калькулятор на mdmprint.ru просит 12 полей и сам
     подписан «сложно сделать расчёт? пишите в телеграм». Коэффициенты ДЕМО, ждём прайс. */
  (function(){
    /* ═══ ФАКТЫ ОТ БИЗНЕСА — правятся ТОЛЬКО здесь. Всё неподтверждённое в ANSWERS.md ═══ */
    const BIZ={
      // директор 30.07: «от 3-х дней; 10 шт — 3 дня; 50 000 шт — месяц». Середина шкалы
      // НЕ ПОДТВЕРЖДЕНА, поэтому выше порога срок не выдумываем, а согласуем.
      /* Шкала сроков собрана из двух ответов: директор 30.07 (10 шт — 3 дня, 50 000 — месяц)
         и лист «Вопросы» 06.08 (1 000 — 7 р.дней, 5 000 — 14 р.дней). Бизнес назвал ЧЕТЫРЕ
         точки, а тиражей между ними бесконечно много. Раньше между узлами брался срок верхнего
         узла, и сто штук показывали «7 рабочих дней» — завышение на ровном месте. Теперь между
         узлами показываем ДИАПАЗОН между соседними точками: и не выдумываем, и не пугаем.
         Третье число — дни для диапазона, null у верхнего узла (там «около месяца»). */
      terms:[[10,'3 дня',3],[1000,'7 рабочих дней',7],[5000,'14 рабочих дней',14],
             [50000,'около месяца',null]],
      // их сайт: до 100 шт эпоксидная, от 100 полиуретановая (она же «полимерная»,
      // которую маркетолог называет преимуществом). ЖДЁМ: правда ли на малых эпоксидная.
      resinAt:100, resinLow:'эпоксидная', resinHigh:'полиуретановая',
      // их сайт: −30% до 31 августа, стикеры от 1000 шт, паки от 500 шт
      promo:{off:.3, till:'2026-08-31', label:'до 31 августа', minSt:1000, minPack:500},
      /* designFrom удалён 05.08 вместе с фиксированной ценой контура: услуга переформулирована
         в «дизайн», её стоимость менеджер называет отдельно. Цифра 900 ₽ (директор 29.07)
         сохранена в ANSWERS.md на случай, если вернёмся к тарифу за контур. */
    };
    /* ═══ ПРАЙС. Лист «Цены» от 06.08, цена за ШТУКУ в рублях ДО скидки ═══
       Строки — тираж (qty), столбцы — размер (size). Никаких коэффициентов: бизнес объяснил
       05.08, что печать, смола и работа стоят одинаково для всех плёнок, а разница сидит
       в печати и резке — и она не мультипликативная. Отношение к белому глянцу гуляет
       от 1,09 до 2,90, поэтому таблицы отдельные.
       Аномалии, которые выглядят опечатками, но подтверждены бизнесом 07.08:
       фотолюминесцентная местами ДЕШЕВЛЕ голографической (голо печатается УФ и почти
       не дешевеет с тиражом, фотолюм — ШФ и дешевеет заметно). Не «чинить». */
    const PRICE={
      qty:  [10,50,100,500,1000,5000,50000],
      size: [10,15,20,25,50],                       // сторона квадрата, мм
      mat: [
        [ [400,402,402,400.7,400.7],                // Белый глянец
          [80,80.4,80.4,80.14,111.6],
          [40,40.2,40.2,40.07,71.1],
          [8,11.21,14.3,17.38,44.24],
          [5.6,7.15,10.4,13.54,39.95],
          [2.73,4.72,6.82,10.13,37.52],
          [2,3.96,6.04,9,33.23] ],
        [ [443,443.7,443.7,441.1,441.1],            // Голографическая
          /* 133.38 — цифра из листа 06.08. В исправленном файле 07.08 она стала 88.22,
             но правили там фотолюминесцентную, а эта клетка поехала попутно и противоречит
             всему остальному прайсу: цена за штуку получалась бы ВЫШЕ на ста штуках (89),
             чем на пятидесяти, и голографическая выходила бы дешевле белого глянца (111.6) —
             единственная такая клетка из 105. Держим прежнее значение до ответа.
             Вопрос 21 в ANSWERS.md. */
          [88.74,88.74,88.74,88.22,133.38],
          [44.37,44.37,44.37,44.11,89],
          [8.87,13.44,17.96,22.2,66.78],
          [6.72,8.98,13.4,17.53,62.54],
          [3.54,6.38,10.55,14.59,59.67],
          [2.86,5.88,9.73,13.75,56.69] ],
        /* Обновлена 07.08 по исправленному файлу («исправленные цены вроде.csv»): изменились
           столбцы 25×25 и 50×50 на всех тиражах от 50 штук. Аномалия «большой стикер дешевле
           маленького» ушла — на 5 000 было 25×25 = 13,68 против 20×20 = 14,31, стало 19,12.
           Оставшиеся клетки, где фотолюм дешевле голографической (50×50 на 1 000, 5 000
           и 50 000), — не ошибка: голо печатается УФ и почти не дешевеет с тиражом. */
        [ [560,560,560,609,609],                    // Фотолюминесцентная
          [112,112,112,122,183.26],
          [56,56,56,61,121.81],
          [17.43,17.43,23.54,30.28,68.48],
          [11.8,14.77,17.71,23.68,60.23],
          [6.83,10.44,14.31,19.12,56.35],
          [5.81,9.21,12.98,17.15,50.5] ] ],
      /* Стикерпаки — своя система координат: цена за ЛИСТ, форматы вместо миллиметров,
         потолок тиража 1 000 листов. Выше потолка калькулятор не считает, а ведёт
         в блок «У вас большой тираж?». */
      packQty:[10,50,100,500,1000],
      pack: [ [405.5,564,714],[213,277,446],[171,227,403],[137,201,378],[134,193,370] ],
      /* Резка. Маркетолог 07.08: «начальная цена 300 руб + 8,25 руб/шт, стоимость снижается
         при увеличении тиража» — ШКАЛЫ СНИЖЕНИЯ НЕТ (вопрос 17 в ANSWERS.md). Поэтому резка
         в сумму НЕ входит: на 1 000 штук начальный тариф даёт больше, чем сама печать,
         и подставить его в итог значило бы напугать неверной цифрой. Показываем подписью. */
      cut:  {fix:300, per:8.25},
    };
    const F={
      /* Описания переписаны 07.08 под ответ бизнеса «отличие стикерпака в том, что он сдаётся
         не печатным листом, а в указанном клиентом размере». Прежнее «Отдельные наклейки любой
         формы» обещало поштучную выдачу, которой в базовой цене нет. */
      kind: [['Стикеры',0,'Любой формы, листом или поштучно'],['Стикерпаки',1,'Лист выбранного формата']],
      // заголовки в ОДНО слово: на карточке ~190px два слова переносятся и ряд становится неровным
      // ряд из четырёх → карточка ~185px: заголовок в ОДНО слово, описание в два.
      // Двухсловный заголовок переносится и уезжает под картинку в правом нижнем углу.
      // плёнки как на сайте: белая, прозрачная, голографическая, люминесцентная.
      // «Металлик» был выдумкой, а свечение стояло шагом «Смола» — свечение даёт ПЛЁНКА.
      // Металлизированной плёнки у них в списке нет; картинка лежит в calc-icons/mat-3-metallic.webp.
      // названия и описания — формулировки маркетолога 03.08 (см. ANSWERS.md).
      // Слово «плёнка» вынесено в легенду шага: в колонке ~185px «Голографическая плёнка»
      // рвётся на три строки и ряд карточек разъезжается.
      /* ПРОЗРАЧНАЯ УБРАНА 05.08: бизнес говорит, что доступны только белый глянец,
         фотолюминесцентная и голографическая. Прозрачную мы взяли с их же страницы
         /nakleyki-obyomnye-so-smoloy — она расходится с реальной доступностью.
         Второе число — номер таблицы в PRICE.mat, а не наценка. */
      mat:  [['Белый глянец',0,'Виден контур наклейки'],
             ['Голографическая',1,'Радужный перелив'],
             ['Светится в темноте',2,'Копит свет за день']],
      /* Размеры взяты с их страницы «Наклейки объёмные со смолой» и от Omar (05.08):
         10×10, 15×15, 20×20, 25×25, 50×50 и свой. Второе число — сторона в мм, по ней
         калькулятор берёт столбец прайса; у «своего» размера столбца нет, там интерполяция. */
      size: [['10×10',10],['15×15',15],['20×20',20],['25×25',25],['50×50',50],
             ['Свой','own','Свой размер']],
      sheet:[['А7',0],['А6',1],['А5',2]],   // у паков свой размер не задаётся, число — столбец прайса
      /* Ступени тиража — ровно узлы прайса. Ступень 300 убрана 07.08: в прайсе её нет,
         а между 100 и 500 сумма заказа не меняется вовсе, так что своей ступени она
         не заслуживает. У паков потолок 1 000 листов — выше прайса нет. */
      qty:  [[10,10],[50,50],[100,100],[500,500],[1000,1000],[5000,5000],[50000,50000],
             ['Своё','own','Свой тираж']],
      qtyPack:[[10,10],[50,50],[100,100],[500,500],[1000,1000],['Своё','own','Свой тираж']],
    };
    const S={kind:0,mat:0,size:0,qty:2};
    const $=id=>document.getElementById(id);
    const rub=n=>n.toLocaleString('ru-RU')+' \u20BD';

    function build(key,labels){
      const box=$(key); box.innerHTML='';
      labels.forEach((it,i)=>{
        const l=document.createElement('label'); l.className='opt';
        // метка на САМОЙ плашке-поле: раньше растяжку вешал :last-child, и у стикерпаков
        // (А7/А6/А5, «своего» размера нет) растягивался последний пресет — А5
        if(it[1]==='own') l.classList.add('opt--wide');
        const own = it[1]==='own';                      // «Свой» — плашка-поле, не подпись
        const desc = (!own && it[2]) ? `<em class="opt__desc">${it[2]}</em>` : '';
        const inner = own
          ? `<input class="opt__inp" id="${key}Own" `+
            `type="text" inputmode="numeric" maxlength="5" `+
            (key==='qty' ? `pattern="[0-9]{1,5}"` : `pattern="[0-9]{1,2}x[0-9]{1,2}"`)+
            ` placeholder="${it[2]||'Свой'}" aria-label="${it[2]||'Свой'}">`
          // тираж — число: без разделителя разрядов «50000» читается как код, а не как количество
          : `<b class="opt__txt">${typeof it[0]==='number'?it[0].toLocaleString('ru-RU'):it[0]}${desc}</b>`+
            `<img class="opt__ico" src="calc-icons/${key}-${i}.webp" alt="" `+
            `onerror="this.closest('span')?.classList.remove('has-ico');this.remove()">`;
        l.innerHTML=`<input type="radio" name="${key}" value="${i}"${i===S[key]?' checked':''}>`+
          `<span class="${own?'opt--own':(['kind','mat'].includes(key)?'has-ico':'')}${desc?' opt--card':''}">${inner}</span>`;
        if(own){
          const f=l.querySelector('.opt__inp');
          f.addEventListener('focus',()=>{ l.querySelector('input[type=radio]').checked=true; S[key]=i; calc(); });
          f.addEventListener('input',()=>{                        // маски: 99x99 для размера, только цифры для тиража
            if(key==='size'){
              const d=f.value.replace(/\D/g,'').slice(0,4);
              f.value = d.length>2 ? d.slice(0,2)+'x'+d.slice(2) : d;
            } else f.value = f.value.replace(/\D/g,'').slice(0,5);
          });
          f.addEventListener('input',()=>{ l.querySelector('input[type=radio]').checked=true; S[key]=i; calc(); });
        }
        l.querySelector('input').addEventListener('change',()=>{S[key]=i;calc();});
        box.appendChild(l);
      });
    }
    /* Интерполируем СУММУ за тираж, а не цену за штуку. Это не стилистика, а требование
       прайса: до 500 штук сумма заказа не меняется вовсе (минимальный чек ~4 000 ₽ —
       и 10 штук, и 500 стоят одинаково). Если тянуть прямую между ценами за штуку,
       на 300 штуках выйдет 24 ₽/шт против 8 ₽ на пятистах — цена бы РОСЛА с тиражом.
       На суммах кривая почти кусочно-линейная, и минимальный чек получается сам собой. */
    function sumAt(rows,col,q,nodes){
      const sums=nodes.map((n,i)=>rows[i][col]*n);
      if(q<=nodes[0]) return sums[0];
      for(let i=1;i<nodes.length;i++) if(q<=nodes[i]){
        const t=(q-nodes[i-1])/(nodes[i]-nodes[i-1]);
        return sums[i-1]+(sums[i]-sums[i-1])*t;
      }
      return sums[sums.length-1];
    }
    /* Цена за штуку по стороне в мм. У готовых размеров сторона попадает точно в узел
       прайса, и результат равен клетке таблицы — это и есть критерий «калькулятор
       не врёт». Свой размер интерполируется между соседними столбцами по стороне
       эквивалентного квадрата: считать по площади нельзя, столбцы прайса — квадраты. */
    function unitFor(mat,side,q){
      const rows=PRICE.mat[mat], N=PRICE.size, at=c=>sumAt(rows,c,q,PRICE.qty)/q;
      if(side<=N[0]) return at(0);
      for(let i=1;i<N.length;i++) if(side<=N[i]){
        const t=(side-N[i-1])/(N[i]-N[i-1]);
        return at(i-1)+(at(i)-at(i-1))*t;
      }
      return at(N.length-1);
    }
    // точный узел — точный срок, между узлами — диапазон соседних точек
    function termFor(q){
      const T=BIZ.terms;
      for(let i=0;i<T.length;i++){
        if(q===T[i][0]) return T[i][1];
        if(q<T[i][0]) return i===0 ? T[0][1]
          : T[i][2]!=null ? T[i-1][2]+'–'+T[i][2]+' рабочих дней'
          : 'от '+T[i-1][2]+' рабочих дней';
      }
      return T[T.length-1][1];
    }
    function calc(){
      const packs=S.kind===1;
      const sizes=packs?F.sheet:F.size, qtys=packs?F.qtyPack:F.qty;
      $('qtyLeg').textContent  = packs?'Количество паков':'Количество, штук';
      $('sizeLeg').textContent = packs?'Формат листа':'Размер, мм';
      if($('size').dataset.mode!==(packs?'sheet':'size')){
        $('size').dataset.mode = packs?'sheet':'size'; if(S.size>=sizes.length) S.size=0; build('size',sizes);
      }
      // ступени тиража тоже зависят от вида: у паков прайс кончается на 1 000 листов
      if($('qty').dataset.mode!==(packs?'pack':'st')){
        $('qty').dataset.mode = packs?'pack':'st'; if(S.qty>=qtys.length) S.qty=qtys.length-1; build('qty',qtys);
      }
      const sizeOwn = !packs && sizes[S.size][1]==='own';
      const qtyOwn  = qtys[S.qty][1]==='own';
      // потолок = последний узел прайса. Выше него мы цену не знаем и не выдумываем:
      // рядом стоит плашка «У вас большой тираж?» — это её работа
      const qMax = packs ? 1000 : 50000;
      const q = qtyOwn ? Math.min(qMax, Math.max(10, +($('qtyOwn')||{}).value||100)) : qtys[S.qty][0];
      // свой размер: сторона эквивалентного квадрата, 10…50 мм — границы прайса
      let side=null;
      if(!packs && sizeOwn){
        const t=(($('sizeOwn')||{}).value||'').replace(',','.').split(/[x×х*]/i);
        // дефолт 20 мм — середина набора размеров
        const w=Math.min(99,parseFloat(t[0])||20), h=Math.min(99,parseFloat(t[1])||w);
        side=Math.sqrt(Math.max(100,w*h));
      } else if(!packs) side=sizes[S.size][1];

      let unit = packs
        ? sumAt(PRICE.pack, sizes[S.size][1], q, PRICE.packQty)/q
        : unitFor(F.mat[S.mat][1], side, q);

      // акция считается ПОСЛЕ цены по прайсу и сама выключится после даты.
      // Бизнес 07.08: «скидка 30% в указанные цены не заложена» — значит именно сверху.
      const P=BIZ.promo, onPromo = new Date(P.till) >= new Date('2026-07-30')
        && q >= (packs?P.minPack:P.minSt);
      if(onPromo) unit *= (1 - P.off);
      // «Поштучно» бессмысленно для стикерпака: пак и есть лист
      const single=$('optSingle'), box=$('optBox'), design=$('needDesign');
      $('optSingleWrap').hidden = packs;
      if(packs) single.checked=false;
      // контур — фиксированная сумма за заказ. У поштучной резки и упаковки цены НЕТ (не выдумываем),
      // они уходят в заявку флагами и показываются строкой «Допы» в сводке.
      /* Дизайн больше НЕ прибавляет фиксированную сумму (решение 05.08): 900 ₽ — это была
         подготовка контура, а мы теперь предлагаем дизайн как услугу, и она считается
         индивидуально. Галочка уходит в заявку, менеджер называет цену. */
      const sum=Math.round(unit*q);
      /* Цену за штуку округляем до копеек, пока она меньше десяти рублей. На больших тиражах
         прайс даёт 2,73 ₽ — округление до 3 ₽ завышало бы на 10% и не сходилось бы с суммой
         за тираж, которую человек видит строкой ниже. */
      const unitTxt = unit<10 && Math.abs(unit-Math.round(unit))>.005
        ? unit.toFixed(2).replace('.',',')+' ₽' : rub(Math.round(unit));
      const per=unitTxt+(packs?' / пак':' / шт');
      const term = termFor(q);
      const resin = q<BIZ.resinAt ? BIZ.resinLow : BIZ.resinHigh;
      // ГЛАВНАЯ ЦИФРА — за штуку: маркетолог 30.07 «показываем мин. цену за шт», продавец
      // сравнивает поставщиков именно по ней. Сумма за тираж ушла строкой ниже.
      $('total').textContent = unitTxt;
      $('unit').textContent = packs?'за пак':'за штуку';   // у .calc__unit есть точка-разделитель в ::before,
      // поэтому «/ шт» давало «27 ₽ · / шт»; словами читается как «27 ₽ · за штуку»
      $('sumOut').textContent = 'от '+rub(sum);   // «от» при цифре, а не в подписи строки
      $('term').textContent = term;
      $('resinOut').textContent = resin;
      $('promo').hidden = !onPromo;
      const mark=$('calcMark');
      mark.textContent = packs && S.mat!==0
        ? 'Цена по белому глянцу. Пак на другой плёнке посчитает менеджер.' : '';
      mark.hidden = !mark.textContent;
      const extras=[design.checked?'дизайн контура':null, single.checked?'поштучно':null,
        box.checked?'инд. упаковка':null].filter(Boolean);
      // q уходит дальше только на показ (сводка заказа и нижняя панель) — сразу с разрядами
      const L = {sum, unit:Math.round(unit), per, q:q.toLocaleString('ru-RU'), packs, term, resin, extras,
        perLong: unitTxt+' за '+(packs?'пак':'штуку'),
        kind:F.kind[S.kind][0], mat:F.mat[S.mat][0],
        size:(packs?F.sheet:F.size)[S.size][0],
        promo: onPromo ? ('−'+Math.round(P.off*100)+'% '+P.label) : null};
      L.sumText=rub(sum); window.__calcLast=L;
      const bp=$('barPrice'), bm=$('barMeta');
      if(bp){ bp.textContent='от '+per; bm.textContent='от '+rub(sum)+' · '+L.q+(packs?' паков':' шт')+' · '+term; }
    }
    build('kind',F.kind); build('mat',F.mat); build('size',F.size); build('qty',F.qty);
    ['needDesign','optSingle','optBox'].forEach(id=>$(id).addEventListener('change',calc));
    // имя выбранного файла — вместо надписи на кнопке
    /* ═══ ЗАГРУЗКА МАКЕТОВ ═══
       Несколько файлов, добавление (а не замена), удаление по одному, лимиты.
       Список файлов ведём своим массивом и синхронизируем в input через DataTransfer:
       напрямую FileList не редактируется, а без синка форма отправит не то, что видит человек. */
    const FILES={ max:5, mbEach:25, mbTotal:50,
      ext:['pdf','ai','eps','svg','png','jpg','jpeg','tif','tiff','cdr'] };
    const drop=$('dropZone'), file=$('artFile'), name=$('fileName'),
          list=$('fileList'), err=$('fileErr'), hint=$('dropHint');
    let picked=[];
    const mb=n=>n/1048576;
    const size=n=> n<1048576 ? Math.max(1,Math.round(n/1024))+' КБ' : (mb(n)).toFixed(1)+' МБ';
    const ext=n=>(n.split('.').pop()||'').toLowerCase();

    function sync(){
      const dt=new DataTransfer(); picked.forEach(f=>dt.items.add(f)); file.files=dt.files;
    }
    function render(){
      list.innerHTML = picked.map((f,i)=>
        '<li><b title="'+f.name.replace(/"/g,'&quot;')+'">'+f.name+'</b><span>'+size(f.size)+'</span>'+
        '<button type="button" data-i="'+i+'" aria-label="Убрать '+f.name.replace(/"/g,'&quot;')+'">'+
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" '+
        'stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button></li>').join('');
      list.hidden = !picked.length;
      drop.toggleAttribute('data-has', !!picked.length);
      const total = picked.reduce((a,f)=>a+f.size,0);
      name.textContent = picked.length
        ? 'Добавить ещё' + (picked.length>=FILES.max ? ' — достигнут предел' : '')
        : 'Перетащите макеты или выберите файлы';
      hint.textContent = picked.length
        ? picked.length+' из '+FILES.max+' · '+size(total)+' из '+FILES.mbTotal+' МБ'
        : 'PDF, AI, EPS, SVG, PNG, JPG, TIFF, CDR · до '+FILES.mbEach+' МБ файл';
      sync();
    }
    function fail(msgs){
      err.innerHTML = msgs.join('<br>');
      err.hidden = !msgs.length;
    }
    function add(incoming){
      const msgs=[];
      [...incoming].forEach(f=>{
        if(picked.length>=FILES.max){ msgs.push('Больше '+FILES.max+' файлов не нужно — остальное пришлём менеджеру'); return; }
        if(picked.some(p=>p.name===f.name && p.size===f.size)){ msgs.push('«'+f.name+'» уже добавлен'); return; }
        if(!FILES.ext.includes(ext(f.name))){ msgs.push('«'+f.name+'» — формат не поддерживается'); return; }
        if(mb(f.size)>FILES.mbEach){ msgs.push('«'+f.name+'» больше '+FILES.mbEach+' МБ'); return; }
        const total=picked.reduce((a,x)=>a+x.size,0)+f.size;
        if(mb(total)>FILES.mbTotal){ msgs.push('Суммарно больше '+FILES.mbTotal+' МБ — пришлите остальное менеджеру'); return; }
        picked.push(f);
      });
      fail(msgs); render();
      if(picked.length) goalOnce('art_attach');   // важен факт макета, а не число файлов
    }
    file.addEventListener('change',e=>{ add(e.target.files); });
    list.addEventListener('click',e=>{
      const b=e.target.closest('button[data-i]'); if(!b) return;
      picked.splice(+b.dataset.i,1); fail([]); render();
    });
    ['dragenter','dragover'].forEach(t=>drop.addEventListener(t,e=>{
      e.preventDefault(); drop.setAttribute('data-over',''); }));
    ['dragleave','dragend','drop'].forEach(t=>drop.addEventListener(t,()=>drop.removeAttribute('data-over')));
    drop.addEventListener('drop',e=>{ e.preventDefault();
      if(e.dataTransfer.files&&e.dataTransfer.files.length) add(e.dataTransfer.files); });
    render();
    calc();
  })();

  /* Медиа-слоты преимуществ: подхватываем файл по имени (adv/v1.mp4 или adv/p1.webp).
     Нет файла — остаётся плашка-заглушка, ничего не ломается. */
  (function(){
    document.querySelectorAll('[data-media]').forEach(fig=>{
      const base=fig.dataset.media, vertical=/v\d$/.test(base);
      /* Медиа встаёт НА МЕСТО заглушки, а не в конец figure: в карточках сравнения дальше
         идёт <figcaption>, и appendChild ставил фотографию ПОД подписью — подпись оказывалась
         над картинкой. Заглушка лежит там, где картинке и место, поэтому вставляем перед ней. */
      const put = el => {
        const ph = fig.querySelector('.adv__ph,.abt__ph,.cmp__ph');
        if(ph) fig.insertBefore(el, ph); else fig.appendChild(el);
      };
      if(vertical){
        const v=document.createElement('video');
        Object.assign(v,{muted:true,loop:true,playsInline:true,autoplay:true,preload:'metadata'});
        // webm сделан из исходника прямо в браузере (ffmpeg в системе нет); mp4 — для Safari,
        // когда появится чем перекодировать. Нет ни одного файла — остаётся плашка-заглушка.
        [['webm','video/webm'],['mp4','video/mp4']].forEach(([ext,type])=>{
          const s=document.createElement('source'); s.src=base+'.'+ext; s.type=type; v.appendChild(s);
        });
        /* Постер — первый кадр того же ролика (аудит 11.08). Пока mp4 нет, Safari не проигрывает
           webm и раньше показывал серую заглушку «видео»; теперь на её месте кадр из ролика,
           и блок выглядит законченным даже без воспроизведения. */
        /* Заглушку снимаем, только когда постер реально загрузился: по loadedmetadata
           её убирало и в случае, когда ни видео, ни постера нет, — оставалась пустая ячейка. */
        const poster = base + '-poster.webp';
        const probe = new Image();
        probe.onload = () => { v.poster = poster; fig.querySelector('.adv__ph,.abt__ph,.cmp__ph')?.remove(); };
        probe.src = poster;
        v.addEventListener('loadeddata',()=>{ fig.querySelector('.adv__ph,.abt__ph,.cmp__ph')?.remove(); v.play().catch(()=>{}); });
        put(v);
      } else {
        const i=document.createElement('img');
        i.loading='lazy'; i.decoding='async'; i.alt='';
        i.addEventListener('load',()=> fig.querySelector('.adv__ph,.abt__ph,.cmp__ph')?.remove());
        i.addEventListener('error',()=> i.remove());
        i.src=base+'.webp';
        put(i);
      }
    });
  })();
  /* Мобильная лента логотипов. Для бесшовного цикла нужен второй такой же набор: ряд едет
     ровно на половину своей ширины, и в конце вторая копия стоит там, где стартовала первая.
     Клоны помечены aria-hidden, чтобы скринридер не зачитывал список дважды.
     «Место для вашего стикера» в ленту НЕ едет — остаётся под ней. */
  (function(){
    const box=document.querySelector('.b2b__logos');
    if(!box) return;
    const mob=matchMedia('(max-width:860px)');
    const you=box.querySelector('.b2b__logo--you');
    const logos=[...box.querySelectorAll('.b2b__logo:not(.b2b__logo--you)')];
    let lane=null;
    function sync(){
      if(mob.matches){
        if(lane) return;
        lane=document.createElement('div'); lane.className='b2b__lane';
        const row=document.createElement('div'); row.className='b2b__row is-lane';
        logos.forEach(el=>row.appendChild(el));
        logos.forEach(el=>{
          const c=el.cloneNode(true);
          c.setAttribute('aria-hidden','true');
          row.appendChild(c);
        });
        lane.appendChild(row);
        box.insertBefore(lane, you || null);
      } else {
        if(!lane) return;
        logos.forEach(el=>box.insertBefore(el, you || null));   // порядок восстанавливаем
        lane.remove(); lane=null;
      }
    }
    mob.addEventListener('change', sync);
    sync();
  })();

  /* Логотипы партнёров: подхватываем по имени файла (b2b/logo-1.webp), иначе остаётся слот. */
  (function(){
    document.querySelectorAll('.b2b__logo[data-logo]').forEach(box=>{
      const i=document.createElement('img');
      i.loading='lazy'; i.decoding='async';
      /* Название компании в alt, а не пустая строка: логотип здесь несёт смысл («с кем
         работали»), без подписи блок для скринридера — шесть пустых плашек. */
      i.alt=box.dataset.name || '';
      /* Убираем ТОЛЬКО текстовую заглушку «Логотип», а не всё содержимое: box.textContent=''
         стирал и сам <img>, который уже лежал внутри, — плашки оставались пустыми.
         Баг лежал с самого начала, но проявился лишь когда появились реальные файлы. */
      i.addEventListener('load',()=>{
        [...box.childNodes].forEach(n=>{ if(n.nodeType===3) n.remove(); });
      });
      i.addEventListener('error',()=> i.remove());
      /* расширение указано прямо в data-logo: почти все знаки векторные (svg), но vitobox
         собран из растровых исходников и лежит webp */
      i.src=box.dataset.logo;
      box.appendChild(i);
    });
  })();
  /* Скрины отзывов: подхватываем по имени файла, иначе остаётся слот с подписью формата. */
  (function(){
    document.querySelectorAll('.rev__slot[data-shot]').forEach(fig=>{
      const i=document.createElement('img');
      i.loading='lazy'; i.decoding='async'; i.alt='Отзыв клиента';
      i.addEventListener('load',()=> fig.querySelector('.rev__ph')?.remove());
      i.addEventListener('error',()=> i.remove());
      i.src=fig.dataset.shot+'.webp';
      fig.appendChild(i);
    });
  })();
  /* Портфолио: подхватываем фото по имени файла и открываем крупно (клик/Enter). */
  (function(){
    const cells=[...document.querySelectorAll('.work__cell[data-work]')];
    if(!cells.length) return;
    cells.forEach((btn, n)=>{
      const i=document.createElement('img');
      i.loading='lazy'; i.decoding='async'; i.alt='Пример работы';
      i.addEventListener('load',()=>{ btn.querySelector('.work__ph')?.remove(); btn.dataset.ready='1'; });
      i.addEventListener('error',()=> i.remove());
      i.src=btn.dataset.work+'.webp';
      btn.appendChild(i);
      // Доступное имя кнопки: внутри только картинка с alt="" (она декоративная —
      // смысл несёт увеличенная копия), без этого скринридер читает просто «кнопка».
      btn.setAttribute('aria-label', 'Пример работы ' + (n + 1) + ' — открыть крупно');
      btn.addEventListener('click',()=>{
        if(!btn.dataset.ready) return;                       // нечего увеличивать, пока фото нет
        open(btn, i.currentSrc || i.src, btn.getAttribute('aria-label'));
      });
    });

    /* Лайтбокс. Раньше обработчик доставал шторку доставки и на этом заканчивался —
       кнопки были кликабельны и не делали ничего (аудит 11.08). Разметка создаётся здесь,
       а не в HTML: поисковику она не нужна, а в коде страницы это лишние сто строк. */
    const lb = document.createElement('div');
    lb.className = 'lb';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.innerHTML = '<button class="lb__x" type="button" aria-label="Закрыть">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">' +
      '<path d="M18 6 6 18M6 6l12 12"/></svg></button><img class="lb__img" alt="">';
    document.body.appendChild(lb);
    const shot = lb.querySelector('.lb__img'), x = lb.querySelector('.lb__x');
    let back = null;

    function open(btn, src, label){
      back = btn;
      shot.src = src; shot.alt = label.replace(' — открыть крупно', '');
      goal('work_open');
      lb.setAttribute('open', '');
      sheetInert(lb, true);
      document.body.style.overflow = 'hidden';
      x.focus();
    }
    function close(){
      lb.removeAttribute('open');
      sheetInert(lb, false);
      document.body.style.overflow = '';
      shot.removeAttribute('src');
      back?.focus();
    }
    x.addEventListener('click', close);
    lb.addEventListener('click', e => { if(e.target === lb) close(); });
    addEventListener('keydown', e => { if(e.key === 'Escape' && lb.hasAttribute('open')) close(); });
  })();
