/* Скрипты страницы услуги (prototypes/usluga.html).
   Вынесено из inline 19.08 по замечанию разработчиков: в HTML лежало ~1500 строк кода, из-за
   чего страница читалась как каша, а правки в ней конфликтовали.
   ПОРЯДОК ВНУТРИ ФАЙЛА ЗНАЧИМ: блоки идут ровно так, как шли в разметке. Файл подключается в
   конце <body> без defer — код рассчитывает, что DOM уже разобран.
   Микроразметка JSON-LD осталась в HTML: это данные страницы, а не код. */

  /* ── ДЕМО-СОСТОЯНИЯ БЛОКОВ (?limits=…) — УДАЛИТЬ ПРИ ПЕРЕНОСЕ В CMS ──────────
     Лимиты карточек описаны в CMS_FIELDS (крайние значения у каждого блока), но в самом
     прототипе контент один и граничные состояния не видны: карусель «Видов» включается с
     четвёртой карточки, кнопка «Показать ещё» — с седьмой плитки, растяжка статей — при 2–4.
     Чтобы разработчику и тестировщику не собирать это руками, состояние задаётся адресом:

       usluga.html?limits=vidy5          — «Виды» лентой со стрелками
       usluga.html?limits=prod12         — 12 плиток «Где применяется» (на мобилке кнопка)
       usluga.html?limits=art2,combo2    — можно несколько блоков сразу

     Ключи: vidy, price, prod, combo, art. Скрипт стоит ПЕРВЫМ намеренно: ниже инициализируются
     скроллеры и кнопка «Показать ещё», и они должны увидеть уже изменённое количество карточек.
     Карточки клонируются по кругу, поэтому в демо повторяются — это стенд, не контент. */
  (function(){
    const q = new URLSearchParams(location.search).get('limits');
    if (!q) return;
    const map = {vidy:'.vidy-grid', price:'.mk-pricelist', prod:'.usl-prod .pcards',
                 combo:'.combo-grid', art:'.art-grid'};
    q.split(',').forEach(part => {
      const m = part.trim().match(/^([a-z]+)(\d+)$/);
      const grid = m && document.querySelector(map[m[1]]);
      if (!grid || !grid.children.length) return;
      const n = Number(m[2]), items = [...grid.children];
      while (grid.children.length > n) grid.lastElementChild.remove();
      for (let i = 0; grid.children.length < n; i++) grid.appendChild(items[i % items.length].cloneNode(true));
    });
  })();

  const mega = document.getElementById('mega');
  const catbtn = document.getElementById('catbtn');
  const hcat = document.getElementById('hcat');
  const overlay = document.getElementById('overlay');
  const rail = document.getElementById('rail');
  const ris = [...rail.querySelectorAll('.ri')];
  const panels = [...document.querySelectorAll('.panel')];
  const quick = [...document.querySelectorAll('.quick a[data-open]')];

  function showSec(sec){
    panels.forEach(p=>p.classList.toggle('show', p.dataset.sec===sec));
    ris.forEach(r=>r.classList.toggle('active', r.dataset.sec===sec));
    document.getElementById('pane').scrollTop = 0;
  }
  // Подсветка в навбаре = «я пришёл отсюда», а не «этот раздел открыт». Иначе кнопка
  // «Каталог» открывает раздел по умолчанию (0) и заодно зажигает «Визитки», хотя её не нажимали.
  function markQuick(sec){
    quick.forEach(a=>a.classList.toggle('active', sec!==undefined && a.dataset.open===sec));
  }
  function openMega(sec){
    showSec(sec!==undefined ? sec : '0');
    markQuick(sec);
    ['.m-root','.rail','.pane'].forEach(s=>{ const el=mega.querySelector(s); if(el) el.scrollTop=0; });   // меню всегда открывается с начала
    mega.classList.add('open');
    catbtn.classList.add('active');
    hcat.classList.add('active');
    [catbtn, hcat].forEach(b => b.setAttribute('aria-expanded','true'));
    overlay.classList.add('show');
    document.body.classList.add('nav-open');   // мобилка: блок скролла фона
  }
  function closeMega(){
    mega.classList.remove('open');
    mega.classList.remove('cat-open','detail-open');   // мобилка: сброс на корень
    const _s=document.getElementById('mSearch'); if(_s) _s.classList.remove('active');   // лупа гаснет вместе с меню
    const _t=document.getElementById('mDhTitle'); if(_t) _t.textContent='Меню';
    catbtn.classList.remove('active');
    hcat.classList.remove('active');
    [catbtn, hcat].forEach(b => b.setAttribute('aria-expanded','false'));
    overlay.classList.remove('show');
    document.body.classList.remove('nav-open');
    showSec('0');       // сброс панелей/рельсы к разделу по умолчанию
    markQuick();        // и гасим подсветку в навбаре
  }

  // ===== Мобильный drawer, 3 уровня: Меню(корень) → Каталог(рельса) → Раздел(панель) =====
  const isMobileNav = () => window.matchMedia('(max-width:1023px)').matches;
  const dhTitle = document.getElementById('mDhTitle');
  const dhBackLbl = document.getElementById('mDhBackLbl');
  // шапка: заголовок = текущий экран, метка у «назад» = куда вернёт (родитель)
  const setDh = (title, back) => { if(dhTitle) dhTitle.textContent = title; if(dhBackLbl) dhBackLbl.textContent = back; };
  const mSearchBtn = document.getElementById('mSearch');
  const mSearchOff = () => { if(mSearchBtn) mSearchBtn.classList.remove('active'); };   /* лупа горит, только пока поиск на экране */
  const drawerRoot    = () => { mega.classList.remove('cat-open','detail-open'); setDh('Меню','Меню'); };
  const drawerCatalog = () => { mega.classList.add('cat-open'); mega.classList.remove('detail-open'); setDh('','Меню'); mSearchOff(); };   /* заголовок пуст — в списке уже есть лейбл «Каталог» */
  const drawerSection = () => { mega.classList.add('cat-open','detail-open'); setDh('','Каталог'); mSearchOff(); const p=mega.querySelector('.pane'); if(p) p.scrollTop=0; };   /* имя раздела теперь отдельной строкой в панели (панель — с начала), в шапке — только «‹ Каталог» */

  const mrCat = document.getElementById('mrCat');
  if(mrCat) mrCat.addEventListener('click', drawerCatalog);

  // формы из меню: сначала закрыть drawer, иначе модалка ляжет поверх открытого меню
  mega.querySelectorAll('.cb,.tb-cta').forEach(b=> b.addEventListener('click', closeMega));

  // тап по разделу рельсы → уровень 2 (панель) + заголовок = имя раздела
  ris.forEach(r=> r.addEventListener('click', ()=>{ if(isMobileNav()) drawerSection((r.textContent||'').trim()); }));

  // единая кнопка «назад» в шапке drawer: раздел → каталог → корень → закрыть
  const mDhBack = document.getElementById('mDhBack');
  if(mDhBack) mDhBack.addEventListener('click', ()=>{
    if(mega.classList.contains('detail-open'))      drawerCatalog();
    else if(mega.classList.contains('cat-open'))    drawerRoot();
    else closeMega();
  });
  const megaBack = document.getElementById('megaBack');
  if(megaBack)  megaBack.addEventListener('click', drawerCatalog);   // на случай старой inline-кнопки
  const megaClose = document.getElementById('megaClose');
  if(megaClose) megaClose.addEventListener('click', closeMega);

  // мобильный поиск (лупа в шапке) — toggle: закрыто → корень+фокус; открыт корень → закрыть; открыт глубже → вернуть на корень+фокус
  if(mSearchBtn) mSearchBtn.addEventListener('click', e=>{
    e.preventDefault(); e.stopPropagation();
    const atRoot = mega.classList.contains('open') && !mega.classList.contains('cat-open');
    if(atRoot){ closeMega(); return; }   /* повторный тап = закрыть (не пере-фокус) */
    if(!mega.classList.contains('open')) openMega();
    drawerRoot();   /* поиск живёт в корне — с глубины возвращаем */
    const inp = mega.querySelector('.m-dsearch input');
    if(inp) inp.focus();
    mSearchBtn.classList.add('active');
  });

  catbtn.addEventListener('click', e=>{
    e.stopPropagation();
    mega.classList.contains('open') ? closeMega() : openMega();
  });
  hcat.addEventListener('click', e=>{
    e.stopPropagation();
    mega.classList.contains('open') ? closeMega() : openMega();
  });

  // hover-выбор раздела — только для мыши. На тач-устройстве mouseenter менял бы панель по «наведению»,
  // и Safari трактует первый тап как ховер, откладывая переход на второй тап.
  const canHover = window.matchMedia('(hover:hover)').matches;
  /* ПРОБЛЕМА ДИАГОНАЛИ. Раздел переключался мгновенно по mouseenter, и когда курсор шёл
     по диагонали из рельсы к пунктам панели, он задевал соседние пункты рельсы — раздел
     дёргался, приходилось вести курсор ровно. Лечим «задержкой намерения»: переключаем,
     только если курсор ЗАДЕРЖАЛСЯ на пункте (140мс), а не пролетел мимо. А как только
     курсор вошёл в панель — отменяем любое отложенное переключение, чтобы путь к пунктам
     точно не сбивал раздел. Клик — всегда мгновенно. */
  let aimTimer = 0;
  const pane = document.getElementById('pane');
  ris.forEach(r=>{
    // ушли в другой раздел по рельсе — подсветка «откуда пришли» больше не верна
    const go = ()=>{ showSec(r.dataset.sec); markQuick(); };
    if(canHover){
      r.addEventListener('mouseenter', ()=>{ clearTimeout(aimTimer); aimTimer = setTimeout(go, 140); });
      r.addEventListener('mouseleave', ()=> clearTimeout(aimTimer));
    }
    /* Пункт рельсы — НАСТОЯЩАЯ ссылка <a href> на страницу раздела, и это не украшение:
       поисковый бот не кликает и не наводит мышь, он читает разметку. Дивом раздел был
       для бота невидим, то есть верхний уровень каталога выпадал из индекса.
       Человеку переход не нужен — ему нужна панель, поэтому клик перехват. */
    r.addEventListener('click', e=>{ e.preventDefault(); clearTimeout(aimTimer); go(); });
    /* Клавиатура: раньше до рельсы было не добраться вовсе (див не принимает фокус),
       человек с Tab видел только раздел по умолчанию. Теперь фокус показывает панель —
       то же, что наведение мышью. */
    r.addEventListener('focus', go);
  });
  if(canHover && pane) pane.addEventListener('mouseenter', ()=> clearTimeout(aimTimer));

  quick.forEach(a=>{
    a.addEventListener('click', e=>{e.preventDefault();e.stopPropagation();openMega(a.dataset.open);});
  });

  mega.addEventListener('click', e=>e.stopPropagation());
  overlay.addEventListener('click', closeMega);
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeMega(); });

  // фикс-шапка: класс .scrolled при прокрутке (демо уменьшения).
  // Гистерезис: включаем при >80px, выключаем при <20px — мёртвая зона убирает мерцание у границы.
  // В уменьшенном состоянии поле поиска уже — подменяем плейсхолдер на короткий, чтобы он влезал.
  const searchInput = document.querySelector('.search input');
  const phFull = searchInput ? searchInput.placeholder : '';
  const phShort = 'Поиск по 2000+ услугам…';
  let headShrunk = false;
  const onScroll = () => {
    const y = window.scrollY;
    if(!headShrunk && y > 80){ headShrunk = true; document.body.classList.add('scrolled'); if(searchInput) searchInput.placeholder = phShort; }
    else if(headShrunk && y < 20){ headShrunk = false; document.body.classList.remove('scrolled'); if(searchInput) searchInput.placeholder = phFull; }
  };
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  // почта в топбаре: клик копирует адрес в буфер + подсказка «Скопировано ✓»
  (function(){
    const m = document.getElementById('tbMail');
    if(!m) return;
    let t;
    m.addEventListener('click', e=>{
      e.preventDefault();
      const mail = m.dataset.mail || m.textContent.trim();
      const done = ()=>{ m.classList.add('is-done'); clearTimeout(t); t=setTimeout(()=>m.classList.remove('is-done'), 1500); };
      if(navigator.clipboard) navigator.clipboard.writeText(mail).then(done, done); else done();
    });
  })();

    // ===== ПОИСК: один механизм, две поверхности =====
    // Датасет, ранжирование и подсветка — общие. Десктоп рисует выдачу в дропдауне под полем,
    // мобилка — во весь drawer: там поле уже есть, а экран целиком и есть поверхность выдачи.
    // Второго поиска не заводим: разошлись бы ранжирование и типы. Дропдаун мобилке КЛОНИРУЕТСЯ
    // из десктопного (оттого внутри него классы, а не id) — разметка гарантированно одна.
    (function(){
      const form  = document.getElementById('searchForm');
      const input = document.getElementById('searchInput');
      const drop  = document.getElementById('searchDrop');
      const clearBtn = document.getElementById('searchClear');
      if(!form || !input || !drop) return;

    // демо-датасет подсказок: [название, тип, (раздел для мегаменю)]
    // поиск по всему сайту. Типы каталога = наша таксономия: Продукция / Услуга (технология) /
    // Материал; плюс Раздел и контент (Статья/Портфолио/Новость) и Страница.
    const DATA = [
      // продукция (то, что заказывают)
      ['Визитки','Продукция'],['Премиальные визитки','Продукция'],['Визитки с тиснением','Продукция'],['Визитки с фольгой','Продукция'],['Многослойные визитки','Продукция'],['Срочные визитки','Продукция'],
      ['Листовки','Продукция'],['Флаеры','Продукция'],['Буклеты','Продукция'],['Брошюры','Продукция'],['Каталоги','Продукция'],['Блокноты','Продукция'],['Календари 2027','Продукция'],['Плакаты','Продукция'],['Постеры','Продукция'],
      ['Наклейки','Продукция'],['Стикерпаки','Продукция'],['Наклейки УФ ДТФ','Продукция'],['Этикетки для Wildberries','Продукция'],
      ['Коробки крышка-дно','Продукция'],['Подарочные коробки','Продукция'],['Бумажные пакеты','Продукция'],
      ['Баннеры','Продукция'],['Roll-Up','Продукция'],
      ['Футболки с логотипом','Продукция'],['Кружки с логотипом','Продукция'],['Корпоративные наборы','Продукция'],
      ['Карты Таро','Продукция'],['Пластиковые карты','Продукция'],
      // услуги = технологии/отделки поверх продукции
      ['Тиснение фольгой','Услуга'],['Конгревное тиснение','Услуга'],['Ламинация','Услуга'],['Выборочный УФ-лак','Услуга'],['Широкоформатная печать','Услуга'],
      // материалы
      ['Крафт-бумага','Материал'],['Дизайнерская бумага','Материал'],['Плёнка soft-touch','Материал'],['Пластик для карт','Материал'],
      // разделы каталога (3-й элемент = sec → открыть мегаменю)
      ['Полиграфия','Раздел','1'],['Наклейки и стикеры','Раздел','4'],['Широкоформатная печать','Раздел','2'],['Упаковка и коробки','Раздел','5'],['Сувениры и мерч','Раздел','6'],['Карты и настольные игры','Раздел','3'],
      // статьи / блог
      ['Как выбрать бумагу для визиток','Статья'],['Чем офсет отличается от цифровой печати','Статья'],['Виды тиснения: где применять','Статья'],['Как подготовить макет к печати','Статья'],['Тренды упаковки 2027','Статья'],
      // портфолио / кейсы
      ['Кейс: брендбук для кофейни','Портфолио'],['Упаковка для косметики — кейс','Портфолио'],['Мерч для IT-компании','Портфолио'],['Каталог для мебельного бренда','Портфолио'],
      // новости
      ['Запустили ПУР-склейку','Новость'],['Акция на визитки в июне','Новость'],['График работы в праздники','Новость'],
      // страницы сайта
      ['Доставка','Страница'],['Оплата','Страница'],['Контакты','Страница'],['Требования к макетам','Страница'],['О компании','Страница'],['Вакансии','Страница'],['Портфолио','Страница'],['Блог','Страница'],['Новости','Страница']
    ];
    // тип → css-класс тега и приоритет в выдаче (коммерческое выше контента)
    const TYPE_CLS = {'Продукция':'t-prod','Услуга':'t-svc','Материал':'t-mat','Раздел':'t-sec','Статья':'t-art','Портфолио':'t-port','Новость':'t-news','Страница':'t-page'};
    const TYPE_RANK = {'Продукция':0,'Услуга':0,'Материал':0,'Раздел':0,'Статья':1,'Портфолио':1,'Новость':2,'Страница':2};
    const esc = s => s.replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

    // Рисует выдачу в ЛЮБОЙ дропдаун: сам находит свои .sd-list/.sd-q внутри него.
      function render(dropEl, raw){
        const q = (raw||'').trim();
        const list = dropEl.querySelector('.sd-list'), qEl = dropEl.querySelector('.sd-q');
        if(!q){ dropEl.dataset.state='empty'; return; }
        const ql = q.toLowerCase();
        const m = DATA.filter(d=>d[0].toLowerCase().includes(ql));
        m.sort((a,b)=>{
          const aw = a[0].toLowerCase().startsWith(ql)?0:1, bw = b[0].toLowerCase().startsWith(ql)?0:1;
          return aw-bw || (TYPE_RANK[a[1]]-TYPE_RANK[b[1]]) || a[0].length-b[0].length;
        });
        const top = m.slice(0,12);
        if(!top.length){ dropEl.dataset.state='none'; return; }
        if(qEl) qEl.textContent = q;
        list.innerHTML = top.map(d=>{
          const t = d[0], type = d[1], i = t.toLowerCase().indexOf(ql);
          const tx = esc(t.slice(0,i)) + '<mark>' + esc(t.slice(i,i+q.length)) + '</mark>' + esc(t.slice(i+q.length));
          const sec = d[2] ? ' data-sec="'+esc(d[2])+'"' : '';
          return '<li class="sd-row" data-t="'+esc(t)+'"'+sec+'><span class="sd-tx">'+tx+'</span><span class="sd-tag '+TYPE_CLS[type]+'">'+type+'</span></li>';
        }).join('');
        dropEl.dataset.state='results';
      }

      // Общее поведение поверхности: ввод → выдача, чип → подстановка, строка → переход.
      function bind(inputEl, dropEl, opts){
        opts = opts || {};
        const upd = () => { opts.onOpen && opts.onOpen(); render(dropEl, inputEl.value); };
        inputEl.addEventListener('focus', upd);
        inputEl.addEventListener('input', upd);
        inputEl.addEventListener('keydown', e=>{ if(e.key==='Escape'){ opts.onClose && opts.onClose(); inputEl.blur(); } });
        dropEl.addEventListener('click', e=>{
          const chip = e.target.closest('.sd-chip');
          if(chip){ inputEl.value = chip.textContent.trim(); inputEl.focus(); render(dropEl, inputEl.value); return; }
          const row = e.target.closest('.sd-row');
          if(!row) return;
          if(row.dataset.sec!==undefined){          // раздел каталога → открыть его, а не искать
            opts.onClose && opts.onClose(); inputEl.blur();
            if(typeof openMega==='function') openMega(row.dataset.sec);
            return;
          }
          inputEl.value = row.dataset.t; render(dropEl, inputEl.value); inputEl.focus();  // прототип: тут переход на страницу результатов
        });
      }

      // ── десктоп
      bind(input, drop, {
        onOpen: ()=>{ form.classList.add('s-open'); document.body.classList.add('search-open');
                      if(typeof closeMega==='function') closeMega(); },
        onClose: ()=>{ form.classList.remove('s-open'); document.body.classList.remove('search-open'); }
      });
      input.addEventListener('input', ()=> form.classList.toggle('has-val', input.value.trim().length>0));
      document.addEventListener('click', e=>{ if(!form.contains(e.target)){ form.classList.remove('s-open'); document.body.classList.remove('search-open'); } });
      clearBtn && clearBtn.addEventListener('click', ()=>{ input.value=''; input.focus(); form.classList.remove('has-val'); render(drop, ''); });

      // ── мобилка: клон дропдауна прямо в drawer, под поле поиска
      const mForm = document.querySelector('#mega .m-dsearch');
      const mInput = mForm && mForm.querySelector('input');
      if(mInput){
        const mDrop = drop.cloneNode(true);
        mDrop.removeAttribute('id'); mDrop.classList.add('m-drop'); mDrop.dataset.state='empty';
        mForm.insertAdjacentElement('afterend', mDrop);
        const root = document.getElementById('mRoot');
        // Поиск включается ФОКУСОМ, а не наличием текста: тапнул поле — экран отдан выдаче
        // (сначала «Популярные запросы»), ушёл с пустым полем — меню вернулось.
        // m-has-q отдельно от m-searching: крестик нужен только когда есть что стирать.
        const sync = ()=>{
          if(!root) return;
          const has = mInput.value.trim().length>0;
          root.classList.toggle('m-has-q', has);
          root.classList.toggle('m-searching', has || document.activeElement===mInput);
        };
        bind(mInput, mDrop, {});
        mInput.addEventListener('input', sync);
        mInput.addEventListener('focus', sync);
        // blur с задержкой: тап по чипу/строке сначала снимает фокус, и без паузы выдача
        // исчезла бы ДО того, как клик по ней долетит
        mInput.addEventListener('blur', ()=> setTimeout(sync, 180));
        // очистка поля × — та же кнопка, что у desktop-поля, но своя на мобилке
        const mClear = document.createElement('button');
        mClear.type='button'; mClear.className='m-dsearch-clear'; mClear.setAttribute('aria-label','Очистить');
        mClear.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
        mClear.addEventListener('click', ()=>{ mInput.value=''; mInput.focus(); render(mDrop,''); sync(); });
        mForm.appendChild(mClear);
      }
    })();

  /* ── Модалки-лиды (обратный звонок + заявка): общая логика ── */
  /* ── Отправка: одна на три формы ──────────────────────────────────────────────
     В прототипе бэкенда нет, поэтому отправка сымитирована. Но сымитирована ЧЕСТНО:
     с паузой и с возможностью отказа — иначе состояние «не отправилось» невозможно ни
     нарисовать, ни показать заказчику, а на бою оно случается чаще всего остального.
     Демонстрация: добавьте ?fail к адресу страницы — все формы начнут падать.
     Разработчику: заменить тело sendLead на реальный fetch, остальное менять не нужно —
     разметка плашки, блокировка кнопки и возврат к форме уже разведены по состояниям. */
  const FAIL_DEMO = location.search.includes('fail');
  function sendLead(payload){
    return new Promise((resolve, reject)=>{
      setTimeout(()=> FAIL_DEMO ? reject(new Error('network')) : resolve({ok:true}), 700);
    });
  }
  /* Обёртка кнопки на время запроса: подпись меняется, повторный клик не проходит.
     Возвращает функцию отката — её зовут и на успехе, и на ошибке. */
  function busy(btn){
    const label = btn.textContent;
    btn.dataset.busy = '1'; btn.disabled = true; btn.textContent = 'Отправляем…';
    return ()=>{ delete btn.dataset.busy; btn.disabled = false; btn.textContent = label; };
  }

  /* ── ОБЩИЕ КИРПИЧИ ФОРМ ─────────────────────────────────────────────────────
     Форм на странице три (звонок, заявка, вопрос) и валидируют они одно и то же: телефон,
     почту, согласие, непустой текст. Раньше эти правила были написаны дважды — в setupLead
     и в блоке ЧАВО, — и любая правка (формат номера, текст проверки, поведение подсветки)
     делалась в двух местах или расходилась. Здесь общее собрано один раз; формам остаётся
     только своё: у заявки — файлы, у ЧАВО — выбор способа связи и шторка на мобилке.
     Контракт компонента описан в docs/CMS_FIELDS.md §3.4. */
  const fk = (function(){
    const digits = v => (v||'').replace(/\D/g,'');
    /* 8XXX и XXX приводим к 7XXX: человек набирает номер как привык, а уходит он в одном виде */
    function norm(v){ let d = digits(v); if(d[0]==='8') d='7'+d.slice(1); if(d && d[0]!=='7') d='7'+d; return d.slice(0,11); }
    const phoneOk = v => { const d = norm(v); return d.length===11 && d[0]==='7'; };
    const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v||'').trim());
    // лёгкое форматирование в +7 (XXX) XXX-XX-XX
    function fmtPhone(v){
      const d = norm(v);
      if(!d) return '';
      let r = '+7';
      if(d.length>1) r += ' (' + d.slice(1,4);
      if(d.length>=4) r += ')';
      if(d.length>=5) r += ' ' + d.slice(4,7);
      if(d.length>=8) r += '-' + d.slice(7,9);
      if(d.length>=10) r += '-' + d.slice(9,11);
      return r;
    }
    /* Имя: хотя бы одна БУКВА и два знака, цифры не запрещаем. У нас B2B, и «Отдел 5» —
       законный ответ на «как к вам обращаться». Полный запрет цифр — переусердствованная
       валидация: отсекает живого человека вместе с мусором. */
    const nameOk = v => /\p{L}/u.test(v||'') && (v||'').trim().length >= 2;
    const mark = (el, bad) => { const w = el.closest('.mk-field'); if(w) w.classList.toggle('invalid', !!bad); };
    /* Мягкая проверка по уходу из поля: ругаемся только на ЗАПОЛНЕННОЕ и неверное — ругать
       того, кто ещё печатает, незачем. Про пустое скажем по нажатию кнопки. Гасим сразу,
       как исправил. */
    function soft(el, valid){
      const check = () => mark(el, el.value.trim() ? !valid(el) : false);
      el.addEventListener('blur',   check);
      el.addEventListener('change', check);
      el.addEventListener('input',  () => { if(valid(el)) mark(el, false); });
    }
    /* Доводим до первого проблемного поля явно: внутри шторки свой скролл-контейнер, и одного
       focus() мало — поле оставалось за экраном, человек жал кнопку, а внешне ничего.
       К СТРОКЕ согласия (.mk-checkrow), а не к квадратику 22×22: иначе по центру экрана окажется
       чекбокс без текста. block:'center' — чтобы поле не встало под липкую шапку.
       preventScroll — иначе браузер дёрнет свой скачок поверх плавного. */
    function goTo(el){
      (el.closest('.mk-checkrow') || el.closest('.mk-field') || el).scrollIntoView({block:'center', behavior:'smooth'});
      if(el.focus) el.focus({preventScroll:true});
    }
    /* Отправка: гасим прошлую ошибку, занимаем кнопку, шлём. Ответ — true/false, чтобы форма
       сама решила, что показывать (у модалок экран «Заявка принята», у ЧАВО — своё место). */
    function send(form, payload){
      const alert = form.querySelector('[data-role="alert"]');
      const btn   = form.querySelector('button[type="submit"]');
      if(alert) alert.hidden = true;
      const done = busy(btn);
      return sendLead(payload)
        .then(()=>{ done(); return true; })
        .catch(()=>{
          done();
          if(alert){ alert.hidden = false; alert.scrollIntoView({block:'nearest', behavior:'smooth'}); }
          return false;
        });
    }
    /* Кнопка активна всегда (почему — CMS_FIELDS §3.2). disabled в разметке — страховка на
       случай, если скрипт не загрузился: тогда форма не уйдёт полупустой. */
    const unlock = btn => { if(btn) btn.disabled = false; };
    return {norm, phoneOk, emailOk, fmtPhone, nameOk, mark, soft, goTo, send, unlock};
  })();

  function setupLead(back, triggerSel){
    if(!back) return;
    const formWrap = back.querySelector('[data-role="form"]');
    const doneWrap = back.querySelector('[data-role="done"]');
    const form     = back.querySelector('form');
    /* Телефона может не быть вовсе: в отзыве его не спрашивают. Все обращения к нему ниже
       через проверку — модалка одна на три формы. */
    const phone    = back.querySelector('input[type="tel"]');
    const pField   = phone && phone.closest('.mk-field');
    const consent  = back.querySelector('input[data-role="consent"]');
    const submit   = back.querySelector('button[type="submit"]');
    const hp       = form.querySelector('.mk-hp');
    const fileInput = form.querySelector('input[type="file"]');
    const fileLabel = form.querySelector('[data-file-label]');
    const fileLabelText = fileLabel ? fileLabel.textContent : '';
    let lastFocus = null;

    /* ОДНА МОДАЛКА НА ДВА ПОВОДА. «Заказать звонок» в шапке и «Заказать образец» в первом
       экране просят одно и то же — номер, поэтому вторая форма не заводится: кнопка приносит
       свои тексты в data-lead-*, а дефолт лежит в разметке и возвращается при открытии
       из шапки. Ветка лида уходит в скрытом context. */
    const LEAD_SWAP = [['leadTitle','.cbm-title'], ['leadSub','.cbm-sub'],
                       ['leadSubmit','.mk-submit'], ['leadFine','.mk-fine']]
      .map(([key, sel]) => { const el = formWrap && formWrap.querySelector(sel);
                             return el && {key, el, def: el.textContent}; })
      .filter(Boolean);
    const ctxField = form.querySelector('input[name="context"]');
    const ctxDef   = ctxField ? ctxField.value : '';
    function applyLead(trigger){
      const d = (trigger && trigger.dataset) || {};
      LEAD_SWAP.forEach(s => s.el.textContent = d[s.key] || s.def);
      if(ctxField) ctxField.value = d.leadContext || ctxDef;
    }

    /* ФАЙЛЫ. input[type=file] по своей природе ЗАМЕНЯЕТ список при каждом выборе, а не
       дополняет: выбрал второй файл — первый исчез, и убрать лишний нечем.
       Поэтому ведём собственный массив, а сам input пересобираем через DataTransfer,
       чтобы форма отправляла ровно то, что человек видит в списке. */
    const MAX_FILES = 10;
    const fileList = form.querySelector('[data-file-list]');
    let picked = [];

    const fmtSize = b => b < 1048576
      ? Math.max(1, Math.round(b/1024)) + ' КБ'
      : (b/1048576).toFixed(1).replace('.', ',') + ' МБ';

    function syncInput(){
      if(!window.DataTransfer) return;            // старый браузер — оставляем родное поведение
      const dt = new DataTransfer();
      picked.forEach(f => dt.items.add(f));
      fileInput.files = dt.files;                 // присваивание НЕ вызывает change — рекурсии нет
    }

    function renderFiles(){
      if(fileLabel) fileLabel.textContent = picked.length ? 'Добавить ещё' : fileLabelText;
      if(!fileList) return;
      fileList.hidden = !picked.length;
      fileList.textContent = '';
      picked.forEach((f, i) => {
        const li = document.createElement('li');
        const nm = document.createElement('span'); nm.className = 'mk-filelist__name'; nm.textContent = f.name;
        const sz = document.createElement('span'); sz.className = 'mk-filelist__size'; sz.textContent = fmtSize(f.size);
        const x  = document.createElement('button');
        x.type = 'button'; x.className = 'mk-filelist__x'; x.setAttribute('aria-label', 'Убрать файл ' + f.name);
        x.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
        x.addEventListener('click', () => { picked.splice(i, 1); syncInput(); renderFiles(); });
        li.append(nm, sz, x);
        fileList.appendChild(li);
      });
    }

    fileInput && fileInput.addEventListener('change', () => {
      [...fileInput.files].forEach(f => {
        if(picked.length >= MAX_FILES) return;                       // лимит из подписи под полем
        /* Сверяем имя и размер, БЕЗ lastModified: при повторном выборе того же файла
           браузер отдаёт новую метку времени, и дубль проскакивал. Два разных файла
           с совпадающими именем и размером — случай куда более редкий, чем повторный тап. */
        if(picked.some(p => p.name===f.name && p.size===f.size)) return;
        picked.push(f);
      });
      syncInput(); renderFiles();
    });
    /* Форма звонка файлов не имеет — отсюда проверка на null. */
    function resetFiles(){ picked = []; if(fileInput) fileInput.value = ''; renderFiles(); }

    const phoneValid = () => !phone || fk.phoneOk(phone.value);
    function formValid(){
      if(!phoneValid() || !consent.checked) return false;
      // М2: e-mail НЕ обязателен, но если введён — должен быть валиден
      const em = form.querySelector('input[type=email]');
      if(em && em.value.trim() && !fk.emailOk(em.value)) return false;
      // все прочие поля с атрибутом required (имя, способ связи…)
      for(const el of form.querySelectorAll('[required]')){
        if(el===phone || el===consent) continue;
        if(el.type==='checkbox'){ if(!el.checked) return false; continue; }
        // оценка звёздами: required висит на первом переключателе, выбран может быть любой
        if(el.type==='radio'){ if(!form.querySelector(`input[name="${el.name}"]:checked`)) return false; continue; }
        if(!el.value.trim()) return false;
      }
      return true;
    }
    /* Какое поле считается заполненным верно. Правила общие (fk), тут только раскладка
       по полям ЭТОЙ формы: телефон обязателен, e-mail — нет, но формат проверяем. */
    function fieldValid(el){
      if(phone && el === phone) return phoneValid();
      if(el.type === 'checkbox') return el.checked;
      if(el.type === 'radio') return !!form.querySelector(`input[name="${el.name}"]:checked`);
      if(el.type === 'email') return !el.value.trim() || fk.emailOk(el.value);   // М2: пусто допустимо
      if(!el.value.trim()) return false;
      if(el.name === 'name') return fk.nameOk(el.value);
      return true;
    }
    // М2: e-mail не required, но формат по уходу проверяем — поэтому добавлен в набор явно
    form.querySelectorAll('[required], input[type=email]').forEach(el=>{
      if(el.type === 'checkbox' || el.type === 'radio') return;
      fk.soft(el, fieldValid);
    });
    // оценка: подсветку гасим сразу по выбору звезды
    form.querySelectorAll('input[type=radio]').forEach(el=>
      el.addEventListener('change', ()=> fk.mark(el, false)));
    const refresh = () => fk.unlock(submit);

    function openModal(e){
      if(e) e.preventDefault();
      lastFocus = document.activeElement;
      resetFiles();                              // иначе файлы прошлой заявки приезжают в новую
      formWrap.scrollTop = 0;                    // и открываемся всегда с начала формы,
      formWrap.classList.remove('scrolled');     // а линия под шапкой при этом не висит
      formWrap.hidden = false; doneWrap.hidden = true;
      applyLead(e && e.currentTarget);
      back.classList.add('show'); back.setAttribute('aria-hidden','false');
      document.body.style.overflow = 'hidden';
      if(typeof closeMega==='function') closeMega();
      const firstField = phone || form.querySelector('input:not([type=hidden]):not(.mk-hp), textarea');
      if(firstField) setTimeout(()=>firstField.focus(), 60);
    }
    function closeModal(){
      back.classList.remove('show'); back.setAttribute('aria-hidden','true');
      document.body.style.overflow = '';
      form.reset(); if(pField) pField.classList.remove('invalid'); refresh();
      if(lastFocus && lastFocus.focus) lastFocus.focus();
    }

    document.querySelectorAll(triggerSel).forEach(o=>o.addEventListener('click', openModal));
    back.querySelectorAll('[data-cbm-close]').forEach(c=>c.addEventListener('click', closeModal));
    back.addEventListener('click', e=>{ if(e.target===back) closeModal(); });

    /* Линия под липким заголовком нужна, только когда под него что-то заехало. */
    const scroller = back.querySelector('[data-role="form"]');
    if(scroller) scroller.addEventListener('scroll', ()=>{
      scroller.classList.toggle('scrolled', scroller.scrollTop > 4);
    }, {passive:true});

    /* СВАЙП ВНИЗ — только по верхней зоне шторки (ручка и заголовок).
       Тянуть за содержимое НЕЛЬЗЯ: там свой скролл, и два жеста начали бы спорить —
       палец то тянет окно, то листает форму. Отсюда и берутся рывки и залипание
       на полпути. Верхняя полоса скролла не имеет, поэтому конфликта нет.
       Порог 90px: короткий смах не должен закрывать заполненную форму. */
    const sheet = back.querySelector('.cbm');
    if(sheet){
      let y0 = 0, dy = 0, drag = false;
      sheet.addEventListener('touchstart', e=>{
        if(!matchMedia('(max-width:1023px)').matches) return;
        const t = e.touches[0];
        if(t.clientY - sheet.getBoundingClientRect().top > 56) return;   // ниже ручки не тянем
        drag = true; y0 = t.clientY; dy = 0;
        sheet.style.transition = 'none';                                 // за пальцем — без задержки
      }, {passive:true});
      sheet.addEventListener('touchmove', e=>{
        if(!drag) return;
        dy = Math.max(0, e.touches[0].clientY - y0);                     // вверх не тянем
        sheet.style.transform = 'translateY(' + dy + 'px)';
      }, {passive:true});
      const endDrag = ()=>{
        if(!drag) return;
        drag = false;
        sheet.style.transition = '';                                     // вернули плавность
        sheet.style.transform = '';                                      // и штатное положение
        if(dy > 90) closeModal();
      };
      sheet.addEventListener('touchend', endDrag);
      sheet.addEventListener('touchcancel', endDrag);
    }
    document.addEventListener('keydown', e=>{ if(e.key==='Escape' && back.classList.contains('show')) closeModal(); });

    // фокус-ловушка: aria-modal сам по себе не держит Tab — без неё фокус уходит на страницу под модалкой
    back.addEventListener('keydown', e=>{
      if(e.key!=='Tab') return;
      const items = [...back.querySelectorAll('a[href],button:not(:disabled),input:not([type=hidden]),select,textarea')]
        .filter(el => el.tabIndex >= 0 && el.offsetParent !== null);  // honeypot и скрытые поля (контакт, .cbm-done) не в счёт
      if(!items.length) return;
      const first = items[0], last = items[items.length-1];
      if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
    });

    if(phone){
      phone.addEventListener('input', ()=>{ phone.value = fk.fmtPhone(phone.value); pField.classList.remove('invalid'); });
      phone.addEventListener('blur', ()=>{ if(phone.value && !phoneValid()) pField.classList.add('invalid'); });
    }
    form.addEventListener('input', refresh);
    form.addEventListener('change', refresh);

    form.addEventListener('submit', e=>{
      e.preventDefault();
      if(hp && hp.value){ closeModal(); return; }          // бот попался в honeypot — тихо закрываем
      /* По нажатию подсвечиваем ВСЕ незаполненные и уводим фокус на первое из них —
         человек сразу видит и сколько осталось, и с чего начать. */
      if(!formValid()){
        let first = null;
        form.querySelectorAll('[required]').forEach(el=>{
          if(el.type === 'checkbox') return;
          const bad = !fieldValid(el);
          fk.mark(el, bad);
          if(bad && !first) first = el;
        });
        if(phone && !phoneValid()) fk.mark(phone, true);
        // М2: e-mail не required, но если введён с ошибкой — тоже отметить
        const em = form.querySelector('input[type=email]');
        if(em && em.value.trim() && !fk.emailOk(em.value)){ fk.mark(em, true); if(!first) first = em; }
        if(!consent.checked) consent.closest('.mk-checkrow')?.classList.add('invalid');
        // текстовые поля в порядке, а согласие не отмечено — ведём к нему
        fk.goTo(first || consent);
        return;
      }
      consent.closest('.mk-checkrow')?.classList.remove('invalid');
      // на реале: POST на бэкенд { phone: norm(phone.value), + прочие поля формы,
      //   consent:true, page: location.href, ts: Date.now() } + серверная валидация/антиспам/rate-limit
      /* Подтверждение говорит ровно то, что человек выбрал. Раньше стояло «перезвоним»
         независимо от способа связи — обещание расходилось с формой.
         Контакт тоже подставляем по способу: для почты показывать телефон бессмысленно. */
      const wayEl = form.querySelector('[name="contact_way"]');
      if(!phone){ fk.send(form, {page: location.href})
        .then(ok=>{ if(ok){ formWrap.hidden = true; doneWrap.hidden = false; } }); return; }
      const way   = wayEl ? wayEl.value : '';
      const mailEl = form.querySelector('input[type="email"]');
      /* Одной фразой: КАК свяжемся и КОГДА. Срок «за 15 минут» здесь НЕ обещаем: вместе
         с рабочими часами это противоречие — заявку можно оставить и ночью, а ответить
         через 15 минут в три часа никто не сможет. Нейтральная формулировка честнее и
         не создаёт ожидания, которое сами же нарушим. */
      const HOURS = ' — ежедневно с 9 до 22';   // неразрывные — иначе «22» повисает одна на строке
      const WAYS = {
        'Позвонить': ['Перезвоним в рабочее время' + HOURS,          'Телефон'],
        'Telegram':  ['Напишем в Telegram в рабочее время' + HOURS,  'Telegram'],
        'MAX':       ['Напишем в MAX в рабочее время' + HOURS,       'MAX'],
        'E-mail':    ['Ответим на почту в рабочее время' + HOURS,    'E-mail']
      };
      const [lead, label] = WAYS[way] || WAYS['Позвонить'];
      const set = (sel, val) => { const el = doneWrap.querySelector(sel); if(el && val) el.textContent = val; };
      set('[data-done-lead]', lead);
      set('[data-done-waylbl]', label);
      /* Telegram и MAX привязаны к номеру, поэтому у них контакт — телефон. */
      set('[data-done-contact]', way === 'E-mail' && mailEl ? mailEl.value.trim() : phone.value.trim());
      const ctxSrc = form.querySelector('input[name="context"]');
      set('[data-done-ctx]', ctxSrc && ctxSrc.value);

      fk.send(form, {way, page: location.href})
        .then(ok=>{ if(ok){ formWrap.hidden = true; doneWrap.hidden = false; } });
    });

    refresh();
  }
  setupLead(document.getElementById('cbmBack'), '.cb');       // обратный звонок
  setupLead(document.getElementById('reqBack'), '.tb-cta');   // оставить заявку
  setupLead(document.getElementById('revBack'), '.rev-add');  // добавить отзыв (без телефона)

  /* ── FAQ: инлайн-форма «Задайте свой вопрос» (поля как в блоке FAQ на mdmprint.ru) ── */
  (function(){
    const root = document.querySelector('.faq-form');
    if(!root) return;
    const formWrap = root.querySelector('[data-role="form"]');
    const doneWrap = root.querySelector('[data-role="done"]');
    const form     = root.querySelector('form');
    const q        = form.querySelector('#faqQ');
    const way      = form.querySelector('#faqWay');
    const consent  = form.querySelector('input[data-role="consent"]');
    const submit   = form.querySelector('button[type="submit"]');
    const hp       = form.querySelector('.mk-hp');
    const contacts = [...form.querySelectorAll('[data-contact]')];
    const phone    = form.querySelector('input[type="tel"]');

    const phoneValid = () => fk.phoneOk(phone.value);

    // способ связи выбирает, какое контакт-поле показать; лишние прячем и отключаем
    const activeField = ()=> contacts.find(f => f.dataset.contact.split(' ').includes(way.value));
    function syncContacts(){
      const act = activeField();
      contacts.forEach(f=>{ const on = f===act; f.hidden = !on; f.querySelector('input').disabled = !on; });
    }
    function contactValid(){
      const inp = activeField().querySelector('input');
      if(way.value==='Email')    return fk.emailOk(inp.value);
      if(way.value==='Telegram') return !!inp.value.trim();
      return phoneValid();                                   // Телефон / MAX
    }
    const formValid = ()=> consent.checked && !!q.value.trim() && contactValid();
    const refresh = () => fk.unlock(submit);
    const activeInput = ()=> activeField().querySelector('input');
    /* Раскладка по полям ЭТОЙ формы: контакт-поле одно, но его тип зависит от способа связи. */
    function inputValid(el){
      if(el.type === 'tel')   return phoneValid();
      if(el.type === 'email') return fk.emailOk(el.value);
      return !!el.value.trim();                              // Telegram / MAX-ник
    }

    way.addEventListener('change', ()=>{ syncContacts(); refresh(); });
    phone.addEventListener('input', ()=>{ phone.value = fk.fmtPhone(phone.value); fk.mark(phone, false); });
    q.addEventListener('input', ()=>{ if(q.value.trim()) fk.mark(q, false); });
    /* Скрытые контакт-поля проверять нечего: способ связи показывает ровно одно, остальные
       ещё и disabled. Поэтому обёртка над общей мягкой проверкой. */
    contacts.forEach(f=>{
      const el = f.querySelector('input');
      fk.soft(el, e => e.disabled || inputValid(e));
    });
    form.addEventListener('submit', e=>{
      e.preventDefault();
      if(hp && hp.value) return;                             // бот попался в honeypot — тихо игнорируем
      if(!formValid()){
        /* По нажатию подсвечиваем всё незаполненное и ведём фокус на первое из них. */
        let first = null;
        if(!q.value.trim()){ fk.mark(q, true); first = first || q; }
        const inp = activeInput();
        if(!contactValid()){ fk.mark(inp, true); first = first || inp; }
        if(!consent.checked){ consent.closest('.mk-checkrow')?.classList.add('invalid'); first = first || consent; }
        if(first) fk.goTo(first);
        return;
      }
      consent.closest('.mk-checkrow')?.classList.remove('invalid');
      // на реале: POST { comment, contact_way, contact, name, promo, consent:true, page, ts } + антиспам/rate-limit
      fk.send(form, {page: location.href})
        .then(ok=>{ if(ok){ formWrap.hidden = true; doneWrap.hidden = false; } });
    });

    // ── Мобилка: кнопка «Задать вопрос» → шторка снизу (та же форма). ──
    // На десктопе триггеры/оверлей display:none, кликов нет — обработчики безвредны.
    let lastFocus = null;
    function resetForm(){ form.reset(); formWrap.hidden = false; doneWrap.hidden = true;
      formWrap.scrollTop = 0; formWrap.classList.remove('scrolled'); syncContacts(); refresh(); }
    function openFaq(){
      lastFocus = document.activeElement;
      resetForm();
      document.body.classList.add('faqsheet');
      document.body.style.overflow = 'hidden';
      if(typeof closeMega === 'function') closeMega();
      setTimeout(()=>q.focus(), 60);
    }
    function closeFaq(){
      document.body.classList.remove('faqsheet');
      document.body.style.overflow = '';
      resetForm();
      if(lastFocus && lastFocus.focus) lastFocus.focus();
    }
    document.querySelectorAll('[data-faq-open]').forEach(o=>o.addEventListener('click', openFaq));
    root.querySelectorAll('[data-faq-close]').forEach(c=>c.addEventListener('click', closeFaq));
    const faqBack = document.querySelector('.faq-backdrop');
    if(faqBack) faqBack.addEventListener('click', closeFaq);
    document.addEventListener('keydown', e=>{
      if(e.key === 'Escape' && document.body.classList.contains('faqsheet')) closeFaq();
    });
    // линия под липким заголовком — только когда под него заехало содержимое
    formWrap.addEventListener('scroll', ()=>{
      formWrap.classList.toggle('scrolled', formWrap.scrollTop > 4);
    }, {passive:true});

    syncContacts(); refresh();
  })();

  // ===== СТРАНИЦА УСЛУГИ: табы «Требования к макету» =====
  (function(){
    // табы: контейнер [data-tabs] + панели [data-panel] в общем родителе-секции.
    // Паттерн WAI-ARIA Tabs: связь tab↔panel через aria-controls/aria-labelledby,
    // в таб-порядке ровно один таб (roving tabindex), переключение — стрелками.
    let uid = 0;
    document.querySelectorAll('[data-tabs]').forEach(bar => {
      const btns   = [...bar.querySelectorAll('.mk-tab')];
      const scope  = bar.closest('section') || document;
      const panels = [...scope.querySelectorAll('.mk-tabpanel')];
      const box = scope.querySelector('.mk-tabpanels');
      const ns = 'mk-tabs-' + (++uid);

      // разметку связываем здесь: id-шники синтетические, в HTML их держать нечего
      btns.forEach(b => {
        const p = panels.find(p => p.dataset.panel === b.dataset.tab);
        if (!p) return;
        b.id = b.id || `${ns}-tab-${b.dataset.tab}`;
        p.id = p.id || `${ns}-panel-${b.dataset.tab}`;
        b.setAttribute('aria-controls', p.id);
        p.setAttribute('role', 'tabpanel');
        p.setAttribute('aria-labelledby', b.id);
        p.tabIndex = 0;   // содержимое панели может быть нефокусируемым — иначе до него не дойти
      });

      const select = (b, focus) => {
        const from = box && box.offsetHeight;   // фиксируем высоту до смены панели
        btns.forEach(x => {
          const on = x === b;
          x.classList.toggle('is-active', on);
          x.setAttribute('aria-selected', on);
          x.tabIndex = on ? 0 : -1;
        });
        if (focus) b.focus();
        panels.forEach(p => p.classList.toggle('is-active', p.dataset.panel === b.dataset.tab));
        scope.querySelectorAll('[data-scroller]')
             .forEach(x => x.dispatchEvent(new CustomEvent('mk:sync')));
        if (!box) return;
        const release = () => { box.style.height = ''; box.classList.remove('is-animating'); };
        const dur = parseFloat(getComputedStyle(box).transitionDuration) || 0;
        if (!dur) { release(); return; }                    // prefers-reduced-motion: перехода нет
        box.classList.add('is-animating');                  // overflow:hidden только на время роста
        box.style.height = from + 'px';
        box.offsetHeight;                                   // форсируем reflow, иначе перехода не будет
        box.style.height = box.scrollHeight + 'px';
        let done = false;
        const finish = e => {
          if (done || (e && e.propertyName !== 'height')) return;
          done = true; release();
          box.removeEventListener('transitionend', finish);
        };
        box.addEventListener('transitionend', finish);
        setTimeout(finish, dur * 1000 + 100);               // страховка, если событие не придёт
      };

      btns.forEach(b => {
        b.tabIndex = b.classList.contains('is-active') ? 0 : -1;
        b.addEventListener('click', () => { if (!b.classList.contains('is-active')) select(b, false); });
      });

      bar.addEventListener('keydown', e => {
        const i = btns.indexOf(document.activeElement);
        if (i < 0) return;
        const last = btns.length - 1;
        const to = e.key === 'ArrowRight' ? (i === last ? 0 : i + 1)
                 : e.key === 'ArrowLeft'  ? (i === 0 ? last : i - 1)
                 : e.key === 'Home'       ? 0
                 : e.key === 'End'        ? last : -1;
        if (to < 0) return;
        e.preventDefault();
        select(btns[to], true);
      });
    });
  })();

  // ===== ФУТЕР: копирование телефона и почты =====
  (function(){
    const btns = [...document.querySelectorAll('.usl-foot .fcopy')];
    if(!btns.length) return;
    // статус берём в том футере, где нажали: на странице их может быть два (сравнение композиций)
    const statusOf = el => el.closest('.usl-foot')?.querySelector('.js-copy-status');

    // Скрытое поле + execCommand: работает и по file://, и без пользовательской активации,
    // и когда документ не в фокусе — там, где navigator.clipboard отказывает.
    const legacyCopy = text => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly','');
      ta.style.cssText = 'position:fixed;top:-9999px;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand && document.execCommand('copy');
      ta.remove();
      return ok;
    };

    // Clipboard API — основной путь, но он отклоняет запрос без активации и вне защищённого
    // контекста (прототип открывают с диска). Отказ гасим откатом, а не сообщением об ошибке.
    const copy = text => {
      const fallback = () => legacyCopy(text) ? Promise.resolve() : Promise.reject();
      if(navigator.clipboard && window.isSecureContext)
        return navigator.clipboard.writeText(text).catch(fallback);
      return fallback();
    };

    const feedback = el => {
      const status = statusOf(el);
      clearTimeout(el.__t);
      el.classList.add('is-done');
      // сообщение перезаписываем всегда: два клика подряд по одному элементу
      // при неизменном тексте скринридер бы не озвучил
      if(status) status.textContent = el.dataset.copy + ' — скопировано';
      el.__t = setTimeout(() => {
        el.classList.remove('is-done');
        if(status) status.textContent = '';
      }, 1800);
    };
    const fail = el => { const st = statusOf(el); if(st) st.textContent = 'Не удалось скопировать'; };

    // вариант А — кнопка-иконка рядом с номером
    btns.forEach(b => b.addEventListener('click', () => copy(b.dataset.copy).then(() => feedback(b), () => fail(b))));

    // вариант Б — клик по самой ссылке. Перехватываем только при наличии мыши:
    // на тач-устройстве tel:/mailto: должны отработать штатно.
    document.querySelectorAll('.usl-foot .fcopy-link').forEach(a => {
      a.addEventListener('click', e => {
        if(!window.matchMedia('(hover:hover)').matches) return;
        e.preventDefault();
        copy(a.dataset.copy).then(() => feedback(a), () => fail(a));
      });
    });

    // Телефон в шапке: на десктопе клик копирует номер (с ПК не звонят), на тач — обычный tel:
    const hphNum = document.querySelector('.hphone .num');
    if(hphNum) hphNum.addEventListener('click', e => {
      if(!window.matchMedia('(hover:hover)').matches) return;
      e.preventDefault();
      copy(hphNum.dataset.copy).then(() => feedback(hphNum), () => fail(hphNum));
    });
  })();

  // ===== ЧАВО: тап по ОТВЕТУ тоже сворачивает =====
  // Тач-зона аккордеона — вся карточка, а не только шапка: нативно <summary> ловит клик,
  // а <p class="mk-acc__a"> — нет. Группу «открыт только один» делает не этот код, а атрибут
  // name= у <details> (браузер закрывает соседей сам, без JS).
  // Защита от выделения: если пользователь выделял текст, клик — конец выделения, не переключение.
  (function(){
    document.querySelectorAll('.mk-acc__a').forEach(a => {
      a.style.cursor = 'pointer';
      a.addEventListener('click', e => {
        if(e.target.closest('a,button')) return;              // ссылка внутри ответа важнее
        if((window.getSelection()+'').length) return;          // шло выделение текста
        const d = a.closest('details');
        if(d) d.open = false;
      });
    });
  })();

  // ===== СТРАНИЦА УСЛУГИ: подсветка активного пункта под-навигации при скролле =====
  (function(){
    const links = [...document.querySelectorAll('.usl-subnav a')];
    if(!links.length) return;
    const track = document.querySelector('.usl-subnav .wrap');
    const map = links.map(a=>({a, sec:document.querySelector(a.getAttribute('href'))})).filter(x=>x.sec);
    const smooth = !window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    let active = null;
    /* На мобилке лента не влезает целиком: юзер уже в «Отзывах», а лента показывает «Обзор» —
       подсветка есть, но её не видно. Подтягиваем активный таб в кадр.
       scrollIntoView не годится: он дёргает и вертикальный скролл страницы, поэтому считаем сами. */
    const reveal = (a) => {
      if(!track || track.scrollWidth <= track.clientWidth) return;   // лента не едет (десктоп) — двигать нечего
      const t = track.getBoundingClientRect(), r = a.getBoundingClientRect();
      const to = track.scrollLeft + (r.left - t.left) - (t.width - r.width) / 2;   // по центру ленты
      track.scrollTo({left: Math.max(0, to), behavior: smooth ? 'smooth' : 'auto'});
    };
    const spy = () => {
      const y = window.scrollY + 160;
      let cur = map[0];
      for(const m of map){ if(m.sec.offsetTop <= y) cur = m; }
      if(cur.a === active) return;   // двигаем только при СМЕНЕ активного, иначе деремся с ручной прокруткой ленты
      active = cur.a;
      // is-active — соглашение кита (.mk-subnav a.is-active), у нас было своё 'active'
      links.forEach(a=>a.classList.toggle('is-active', a===cur.a));
      reveal(cur.a);
    };
    window.addEventListener('scroll', spy, {passive:true});
    spy();
  })();



  /* ── Ленты с горизонтальной прокруткой: стрелки и их доступность ── */
  document.querySelectorAll('[data-scroller]').forEach(sc => {
    const track = sc.querySelector('.mk-scroller__track');
    const navs  = [...sc.querySelectorAll('.mk-scroller__nav')];
    const step  = () => {
      const first = track.firstElementChild;
      if (!first) return track.clientWidth;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return first.getBoundingClientRect().width + gap;
    };
    const sync = () => {
      const max = track.scrollWidth - track.clientWidth - 1;   // -1: субпиксельная погрешность
      navs.forEach(n => {
        const back = n.dataset.dir === '-1';
        n.disabled = max <= 0 || (back ? track.scrollLeft <= 0 : track.scrollLeft >= max);
      });
    };
    navs.forEach(n => n.addEventListener('click', () => {
      track.scrollBy({ left: step() * Number(n.dataset.dir), behavior: 'smooth' });
    }));
    track.addEventListener('scroll', sync, { passive: true });
    addEventListener('resize', sync);
    // скрытая панель имеет нулевую ширину: пересчитываем, когда её показали
    sc.addEventListener('mk:sync', sync);
    sync();
  });

  /* ── «ГДЕ ПРИМЕНЯЕТСЯ»: свёрнутая сетка на мобилке ──────────────────────────
     Первые 6 плиток видны сразу, остальные открывает кнопка. Только на телефоне: на десктопе
     12 плиток спокойно лежат в два ряда. Подпись без числа — считать остаток шаблону не нужно.
     Обратно не сворачиваем: закрывающая кнопка увезла бы вверх уже прочитанное. */
  (function(){
    const grid = document.querySelector('.usl-prod .pcards');
    const btn  = document.querySelector('.usl-prod .prod-more');
    if (!grid || !btn || grid.children.length <= 6) return;
    const mq = matchMedia('(max-width:1023px)');
    let opened = false;
    const sync = () => {
      const clamp = mq.matches && !opened;
      grid.classList.toggle('is-clamped', clamp);
      btn.hidden = !clamp;
    };
    btn.addEventListener('click', () => { opened = true; sync(); });
    mq.addEventListener('change', sync);
    sync();
  })();

  /* ── ЛАЙТБОКС ВИДЕО ПОРТФОЛИО ───────────────────────────────────────────────
     Открывается кликом по карточке во вкладке «Видео». Плеер чужой: по умолчанию
     встраиваемый ВК, у работы хранится только id ролика; если ролик на YouTube — у
     карточки стоит data-video-source="youtube", и ссылка собирается иначе.
     VK_OID — сообщество, из которого берутся ролики: на бою приедет из настроек CMS,
     здесь зашит, потому что бэкенда у прототипа нет.
     Разработчику: сюда же вешается цель Метрики на открытие (docs/ANALYTICS.md).
     ЖЕСТОВ НЕТ И НЕ БУДЕТ: кадр — чужой iframe, тач-события внутри него до страницы не
     доходят. Свайп по плееру мы не увидим, поэтому переключение и закрытие — только
     видимыми кнопками и клавишами. */
  (function(){
    const back  = document.getElementById('vlbBack');
    const cards = [...document.querySelectorAll('.mk-mcard--video[data-video-id]')];
    if (!back || !cards.length) return;
    const VK_OID   = '-29011584';
    const frame    = back.querySelector('#vlbFrame');
    const tagEl    = back.querySelector('[data-role="tag"]');
    const titleEl  = back.querySelector('[data-role="title"]');
    const countEl  = back.querySelector('[data-role="count"]');
    const navs     = [...back.querySelectorAll('[data-vlb-dir]')];
    const closeBtn = back.querySelector('[data-vlb-close]');
    let idx = 0, lastFocus = null;

    const srcOf = card => card.dataset.videoSource === 'youtube'
      ? 'https://www.youtube.com/embed/' + card.dataset.videoId + '?autoplay=1&rel=0&playsinline=1'
      : 'https://vkvideo.ru/video_ext.php?oid=' + VK_OID + '&id=' + card.dataset.videoId + '&hd=2&autoplay=1';

    function show(i){
      if (i < 0 || i >= cards.length) return;
      idx = i;
      const card = cards[i];
      frame.src = srcOf(card);
      const tag = card.querySelector('.mk-mcard__tag'), title = card.querySelector('.mk-mcard__title');
      tagEl.textContent   = tag   ? tag.textContent   : '';
      titleEl.textContent = title ? title.textContent : '';
      countEl.textContent = (i + 1) + ' / ' + cards.length;
      navs.forEach(n => n.disabled = Number(n.dataset.vlbDir) < 0 ? i === 0 : i === cards.length - 1);
    }
    function openLb(i){
      lastFocus = document.activeElement;
      show(i);
      back.classList.add('show'); back.setAttribute('aria-hidden','false');
      document.body.style.overflow = 'hidden';
      setTimeout(() => closeBtn.focus(), 60);
    }
    function closeLb(){
      back.classList.remove('show'); back.setAttribute('aria-hidden','true');
      frame.removeAttribute('src');          // без этого ролик играет дальше за закрытым слоем
      document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    cards.forEach((c, i) => c.addEventListener('click', () => openLb(i)));
    navs.forEach(n => n.addEventListener('click', () => show(idx + Number(n.dataset.vlbDir))));
    closeBtn.addEventListener('click', closeLb);
    back.addEventListener('click', e => { if (e.target === back) closeLb(); });
    document.addEventListener('keydown', e => {
      if (!back.classList.contains('show')) return;
      if (e.key === 'Escape')          closeLb();
      else if (e.key === 'ArrowLeft')  show(idx - 1);
      else if (e.key === 'ArrowRight') show(idx + 1);
    });
    /* фокус-ловушка — та же, что у модалок: aria-modal сам по себе Tab не держит.
       disabled-стрелки в список не попадают, иначе фокус упирался бы в крайние ролики. */
    back.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const items = [...back.querySelectorAll('button:not(:disabled)')].filter(el => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    });
  })();


  /* ── Отзывы: подсказка прокрутки ──
     Класс .has-more на тексте, пока он переполнен И не долистан до конца → нижний край тает (см. CSS).
     Это сигнал «снизу есть продолжение» в покое, в отличие от скроллбара (виден только при скролле). */
  function markReviewScroll(scope){
    (scope || document).querySelectorAll('.mk-review__text').forEach(el => {
      const check = () => el.classList.toggle('has-more', el.scrollHeight - el.clientHeight - el.scrollTop > 1);
      if (!el.dataset.moreBound) { el.dataset.moreBound = '1'; el.addEventListener('scroll', check, { passive:true }); }
      check();
    });
  }
  /* ── Отзывы на мобилке: «Показать полностью» ──
     Вложенный скролл внутри карточки на тач-экране конфликтует с прокруткой страницы, поэтому там
     текст обрезан и раскрывается по тапу. Кнопку ставим ТОЛЬКО тем, кто реально не влез, и только
     на мобилке: на десктопе работает прежний скролл с растворяющимся низом. */
  const REV_MOBILE = window.matchMedia('(max-width:1023px)');
  function markReviewClamp(scope){
    (scope || document).querySelectorAll('.usl-rev .mk-review__text').forEach(el => {
      const card = el.closest('.mk-review');
      let btn = el.querySelector('.rev-more');
      if (!REV_MOBILE.matches) { if (btn) btn.remove(); el.classList.remove('rev-clamped','is-open'); return; }
      const over = el.scrollHeight - el.clientHeight > 1 || el.classList.contains('is-open');
      el.classList.toggle('rev-clamped', over);
      if (over && !btn && card) {
        btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'rev-more'; btn.textContent = '…ещё';
        btn.addEventListener('click', () => {
          const open = el.classList.toggle('is-open');
          btn.textContent = open ? 'Свернуть' : '…ещё';
        });
        el.appendChild(btn);   // ВНУТРЬ текста: position:absolute считается от позиционированного
                               // ПРЕДКА, а не от брата — снаружи ссылку уносило к краю карточки
      } else if (!over && btn) btn.remove();
    });
  }
  markReviewClamp();
  REV_MOBILE.addEventListener('change', () => markReviewClamp());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => markReviewClamp());

  markReviewScroll();                                                          // статичные карточки
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => markReviewScroll());  // после свопа шрифтов высоты меняются
  window.addEventListener('resize', () => markReviewScroll(), { passive:true });

  /* ── Отзывы: живые данные из виджета SmartWidgets ────────────────────────
     Виджет рендерит свой DOM в .sw-app, но нам нужна только его выдача:
     после события swAppComplite данные лежат в window.swapp_data.WidgetReviewsAll.
     Забираем их и рисуем своей разметкой (.mk-review) — чужой свайпер не используем.
     Контейнер виджета скрыт. Если данные не пришли (офлайн, квота, CORS) —
     в разметке остаются статичные карточки, ничего не ломается. */
  (function(){
    const KEY  = '21070d5461e941a5a3abf339f617ae40';
    const box  = document.querySelector('.usl-rev .revs');
    const grid = box && box.querySelector('.mk-scroller__track');
    const LIMIT = 4;
    if (!box || !grid) return;

    const SRC = {                       // from → бейдж
      'Яндекс Карты': { cls:'yandex', label:'Яндекс Карты' },
      '2GIS':         { cls:'2gis',   label:'2ГИС' }
    };

    const esc = t => { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; };
    // не оборачиваем в «ёлочки» текст, который уже начинается с кавычки
    const quote = t => /^[«"„']/.test(t.trim()) ? t.trim() : `«${t.trim()}»`;
    // инициалы для аватара-фолбэка: первые буквы двух слов имени (когда author_img пустой — ~22% отзывов)
    const initials = n => ((n||'').trim().split(/\s+/).slice(0,2).map(w => w[0] || '').join('') || '—').toUpperCase();

    const card = r => {
      const src  = SRC[r.from] || { cls:'site', label:'Отзыв на сайте' };
      const href = r.href || r.param || '#';   // у 2ГИС href пустой, ссылка лежит в param
      const ext  = src.cls !== 'site';
      const stars  = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);

      const f = document.createElement('figure');
      f.className = 'rev mk-card mk-review';
      f.innerHTML = `
        <div class="mk-review__head">
          <span class="mk-review__stars" role="img" aria-label="Оценка ${r.rating} из 5">${stars}</span>
          <a class="mk-review__source mk-review__source--${src.cls}" href="${esc(href)}"
             ${ext ? 'target="_blank" rel="noopener"' : ''}>${src.label}</a>
        </div>
        <blockquote class="mk-review__text">${esc(quote(r.text))}</blockquote>
        <figcaption class="mk-review__author">
          <span class="mk-review__avatar" aria-hidden="true">${r.author_img
            ? `<img src="${esc(r.author_img)}" alt="" loading="lazy" width="40" height="40">`
            : esc(initials(r.author_name))}</span>
          <span class="mk-review__who">
            <span class="mk-review__name">${esc(r.author_name || 'Клиент')}</span>
            <!-- author_profession не берём: у Яндекса там «Знаток города N уровня» -->
            <span class="mk-review__role">${new Date(r.date * 1000).toLocaleDateString('ru-RU',
              { day:'numeric', month:'long', year:'numeric' })}</span>
          </span>
        </figcaption>`;
      return f;
    };

    // демо-отзыв «с сайта» — пример варианта --site в карусели, пока нет своего потока из CMS
    // (у своих подпись — роль/компания, а не дата; фото нет → инициалы)
    const SITE_DEMO = { from:'site', rating:5, author_name:'Ольга В.', author_img:'',
      date: Math.floor(Date.now() / 1000) - 9 * 86400,   // ≈9 дней назад — как у обычного отзыва
      text:'Делали упаковку для премиум-линейки косметики с серебряным тиснением и конгревом. На этапе макета помогли развести зону фольги отдельным слоем и предложили дизайнерский картон плотнее — коробка держит форму и выглядит дорого. Первый тираж согласовали по цветопробе, дальше без правок. Сроки выдержали, качество ровное на всём тираже. Заказываем повторно и рекомендуем коллегам по цеху.', href:'#' };

    let rendered = false;                              // рисуем один раз — фолбэки не должны затирать карточки
    const render = () => {
      if (rendered) return true;
      // не `box`: внешний box — элемент ленты (.usl-rev .revs), затенение ломало dispatchEvent ниже
      const all = window.swapp_data && window.swapp_data.WidgetReviewsAll;
      const w   = all && all[KEY];
      if (!w || !Array.isArray(w.items) || !w.items.length) return false;

      const good = w.items.filter(r => r.rating === 5 && r.text
                                    && r.text.length > 60 && r.text.length < 320);
      // сначала по одному от каждой площадки, иначе Яндекс (568 отзывов) вытеснит 2ГИС (32)
      const seen = new Set(), picked = [];
      for (const r of good) if (!seen.has(r.from)) { seen.add(r.from); picked.push(r); }
      for (const r of good) { if (picked.length >= LIMIT) break;
                              if (!picked.includes(r)) picked.push(r); }
      picked.length = Math.min(picked.length, LIMIT);
      if (picked.length < LIMIT) return false;      // мало годного — оставляем статику

      picked.unshift(SITE_DEMO);                     // впереди — пример отзыва с сайта (--site), пока нет своего потока
      picked.length = Math.min(picked.length, LIMIT);
      grid.replaceChildren(...picked.map(card));
      rendered = true;
      box.dispatchEvent(new CustomEvent('mk:sync'));   // карточек стало больше/меньше — пересчитать стрелки
      // подсказка прокрутки: мерить после свопа шрифтов И завершения раскладки новых карточек
      // кнопки «Показать полностью» — тоже здесь: карточки виджета ЗАМЕНИЛИ статичные
      // (grid.replaceChildren), и разметка, поставленная при загрузке, ушла вместе с ними
      const hint = () => { markReviewScroll(grid); markReviewClamp(grid); };
      (document.fonts && document.fonts.ready || Promise.resolve())
        .then(() => requestAnimationFrame(() => requestAnimationFrame(hint)));
      setTimeout(hint, 300);                           // страховка, если rAF отработал до реколка

      // сводка: суммарное число отзывов по источникам
      const total = Object.values(w.item || {}).flat()
                          .reduce((n, s) => n + (s.count || 0), 0);
      /* Склонение: 631 отзыв, 632 отзыва, 635 отзывов. Без него подпись писала «631 отзывов». */
      const plural = (n, one, few, many) => {
        const d = Math.abs(n) % 100, u = d % 10;
        if (d > 10 && d < 20) return many;
        if (u > 1 && u < 5) return few;
        return u === 1 ? one : many;
      };
      const of = document.querySelector('.usl-rev .rev-of');
      if (of && total) of.textContent =
        `${total} ${plural(total, 'отзыв', 'отзыва', 'отзывов')} на Яндекс.Картах, 2ГИС и на сайте`;

      /* ОЦЕНКА ОСТАЁТСЯ ИЗ РАЗМЕТКИ — посчитать её из виджета НЕЛЬЗЯ, проверено на живых
         данных 19.08: `stat` пустой, в сводке по площадкам (`item`) только адрес, контакты и
         рубрики, а в `items` приезжают одни пятёрки (72 из 72) — среднее по ним всегда даст 5,0.
         Поэтому цифра — поле редактора (CMS_FIELDS §2.11), обновляется при ревизии; количество
         отзывов рядом считается честно, из `count` по площадкам.
         Свои отзывы с сайта в эту цифру не подмешиваем. */
      return true;
    };

    document.addEventListener('swAppComplite', () => { if (!render()) setTimeout(render, 1200); });
    setTimeout(render, 3000);                        // страховка, если событие не долетело
  })();

/* ═══════════════════════════════════════════════════════════════════════ */

  /* ── КУКИ-БАННЕР ────────────────────────────────────────────────────────────
     Решение храним с датой и версией текста: если политику перепишут, версию поднимают и
     согласие спрашивают заново — старое относилось к другому тексту.
     На бою здесь же включаются счётчики: при 'all' — аналитика и реклама, при 'necessary' —
     ничего, кроме технических cookie. localStorage взят потому, что бэкенда у прототипа нет;
     в проде это cookie с датой истечения (год) плюс запись согласия на стороне сервера. */
  const COOKIE_KEY = 'mdm.cookie.consent';
  const COOKIE_VER = 1;
  (function(){
    const bar = document.getElementById('cookieBar');
    if(!bar) return;
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(COOKIE_KEY) || 'null'); } catch { saved = null; }
    if(saved && saved.ver === COOKIE_VER) return;          // уже решил — не спрашиваем снова
    bar.hidden = false;
    document.body.classList.add('cookie-open');            // липкая полоса ждёт решения
    bar.querySelectorAll('[data-cookie]').forEach(b => b.addEventListener('click', ()=>{
      try {
        localStorage.setItem(COOKIE_KEY, JSON.stringify({
          choice: b.dataset.cookie, ver: COOKIE_VER, ts: new Date().toISOString()
        }));
      } catch {}                                            // приватный режим — просто закрываем
      bar.hidden = true;
      document.body.classList.remove('cookie-open');
      // на бою: if(b.dataset.cookie === 'all') подключить счётчики
    }));
  })();

  /* ЛИПКИЙ CTA — показывать только тогда, когда помочь больше нечем.
     Правило: бар виден, если НИ ОДНА настоящая кнопка заявки не попадает в экран
     и мы не в самом верху страницы. Наблюдаем четыре блочных CTA (герой, цены,
     требования, финальный) и футер: пока любой из них на экране, бар спрятан.
     Футер в списке намеренно — иначе бар перекрывал бы контакты и ссылки внизу.
     IntersectionObserver, а не обработчик scroll: пересечения считает сам браузер,
     без чтения геометрии на каждый кадр (это главный источник тормозов при скролле). */
  (function(){
    const bar = document.querySelector('.usl-stickycta');
    if(!bar || !('IntersectionObserver' in window)) return;
    // из фокуса убираем ВСЮ полосу: рядом с кнопкой теперь ещё и каналы связи
    const focusables = [...bar.querySelectorAll('.mk-btn, .scta-ic')];

    const footAnchor = document.querySelector('.usl-foot');
    const anchors = [
      ...document.querySelectorAll('.usl-hero .tb-cta, .usl-price .tb-cta, .usl-final .tb-cta, .usl-req .req-cta .mk-btn--primary'),
      footAnchor
    ].filter(Boolean);

    const onScreen = new Set();
    const io = new IntersectionObserver(entries=>{
      entries.forEach(e=> e.isIntersecting ? onScreen.add(e.target) : onScreen.delete(e.target));
      update();
    }, {threshold:0});
    anchors.forEach(el=> io.observe(el));

    const mq = matchMedia('(max-width:1023px)');

    function update(){
      /* Порог 240px: у самого верха кнопка героя может быть чуть ниже среза экрана
         на коротких телефонах, и бар выскакивал бы в паре свайпов от такой же
         жёлтой кнопки. */
      /* Условие показа разное по устройству:
         — МОБИЛКА: полоса во всю ширину клашится с настоящей CTA → прячем, когда любая на экране.
         — ДЕСКТОП: кнопка маленькая, в углу; держим ПОСТОЯННО (надёжный якорь «оставить заявку»),
           прячем только у ФУТЕРА, чтобы не наезжать на футер/финальную CTA. */
      const scrolled = scrollY > 240;
      const footerVisible = footAnchor && onScreen.has(footAnchor);
      /* Пока куки-баннер не решён, полосу не показываем: это один и тот же угол экрана,
         и два слоя друг на друге заставляют выбирать между «принять» и «оставить заявку». */
      const cookieOpen = document.body.classList.contains('cookie-open');
      const show = !cookieOpen && (mq.matches
        ? (onScreen.size === 0 && scrolled && !document.body.classList.contains('nav-open'))
        : (scrolled && !footerVisible));
      bar.classList.toggle('show', show);
      /* Скрытый бар убираем и из доступности, иначе скринридер и Tab находят
         кнопку, которой на экране нет. */
      bar.setAttribute('aria-hidden', show ? 'false' : 'true');
      focusables.forEach(el => { el.tabIndex = show ? 0 : -1; });
    }

    addEventListener('scroll', update, {passive:true});
    mq.addEventListener('change', update);
    /* Меню открывается без скролла (он залочен), поэтому ловим смену класса на body. */
    new MutationObserver(update).observe(document.body, {attributes:true, attributeFilter:['class']});
    update();
  })();

/* ═══════════════════════════════════════════════════════════════════════ */

  /* ── Авторизация по SMS: 2 шага + вошедшее состояние шапки. Тестовый код 1234. ── */
  (function(){
    'use strict';
    const $ = s => document.querySelector(s);
    const back = $('#authBack'); if(!back) return;
    const TEST_CODE='1234', RESEND_SEC=60;
    const steps=[...back.querySelectorAll('.auth-step')];
    const show = n => steps.forEach(s=>s.hidden = s.dataset.step!==String(n));
    let timerId=null, currentPhone='', loggedIn=false;

    /* Телефон здесь тот же, что в формах, — берём общие правила (fk выше по документу),
       свою копию не держим. Заодно ушёл висячий дефис: старая копия на девяти цифрах
       показывала «+7 (999) 123-45-», хотя вводить ещё две. */
    const fmtPhone = v => fk.fmtPhone(v);
    const isValidPhone = v => fk.phoneOk(v);

    function open(){ back.classList.add('show'); back.setAttribute('aria-hidden','false'); resetAll(); }
    function close(){ back.classList.remove('show'); back.setAttribute('aria-hidden','true'); stopTimer(); }
    function resetAll(){ show(1); iPhone.value=''; $('#iConsent').checked=false; $('#fPhone').classList.remove('invalid'); $('#fConsent').classList.remove('invalid'); $('#eForm').textContent=''; iPhone.focus(); }

    $('#authClose').addEventListener('click', close);
    back.addEventListener('click', e=>{ if(e.target===back) close(); });
    document.addEventListener('keydown', e=>{ if(e.key==='Escape' && back.classList.contains('show')) close(); });

    const iPhone=$('#iPhone');
    iPhone.addEventListener('input', ()=>{ iPhone.value=fmtPhone(iPhone.value); $('#fPhone').classList.remove('invalid'); });
    $('#phoneForm').addEventListener('submit', e=>{
      e.preventDefault(); let ok=true;
      if(!isValidPhone(iPhone.value)){ $('#fPhone').classList.add('invalid'); ok=false; } else $('#fPhone').classList.remove('invalid');
      if(!$('#iConsent').checked){ $('#fConsent').classList.add('invalid'); ok=false; } else $('#fConsent').classList.remove('invalid');
      if(!ok) return;
      const b=$('#btnGetCode'); b.classList.add('is-loading'); b.disabled=true; $('#eForm').textContent='';
      setTimeout(()=>{ b.classList.remove('is-loading'); b.disabled=false; currentPhone=iPhone.value; $('#phoneEcho').textContent=currentPhone;
        show(2); startTimer(); clearCode(); cells[0].focus(); }, 700);
    });

    const codeBox=$('#codeBox'), cells=[...codeBox.querySelectorAll('.auth-cell')], eCode=$('#eCode'), btnVerify=$('#btnVerify');
    const codeVal=()=>cells.map(c=>c.value).join('');
    function clearCode(){ cells.forEach(c=>{c.value='';c.classList.remove('filled');}); codeBox.classList.remove('invalid'); eCode.classList.remove('show'); btnVerify.disabled=true; }
    function syncCode(){ cells.forEach(c=>c.classList.toggle('filled',!!c.value)); btnVerify.disabled=codeVal().length!==4; }
    cells.forEach((c,i)=>{
      c.addEventListener('input', ()=>{ c.value=c.value.replace(/\D/g,'').slice(0,1); codeBox.classList.remove('invalid'); eCode.classList.remove('show');
        if(c.value && i<cells.length-1) cells[i+1].focus(); syncCode(); if(codeVal().length===4) verify(); });
      c.addEventListener('keydown', e=>{ if(e.key==='Backspace' && !c.value && i>0){ cells[i-1].focus(); cells[i-1].value=''; syncCode(); } });
      c.addEventListener('paste', e=>{ e.preventDefault(); const d=(e.clipboardData.getData('text')||'').replace(/\D/g,'').slice(0,4);
        d.split('').forEach((n,k)=>{ if(cells[k]) cells[k].value=n; }); syncCode(); (cells[Math.min(d.length,3)]||cells[3]).focus(); if(codeVal().length===4) verify(); });
    });
    function verify(){ btnVerify.classList.add('is-loading'); btnVerify.disabled=true;
      setTimeout(()=>{ btnVerify.classList.remove('is-loading');
        if(codeVal()===TEST_CODE){ stopTimer(); $('#doneEcho').textContent=currentPhone; show('done'); $('#btnDone').focus(); }
        else{ codeBox.classList.add('invalid','shake'); eCode.textContent='Неверный код'; eCode.classList.add('show'); setTimeout(()=>codeBox.classList.remove('shake'),400); btnVerify.disabled=false; }
      }, 650);
    }
    btnVerify.addEventListener('click', ()=>{ if(codeVal().length===4) verify(); });
    $('#btnBack').addEventListener('click', ()=>{ stopTimer(); show(1); iPhone.focus(); });
    $('#btnDone').addEventListener('click', ()=>{ close(); doLogin(currentPhone, PROFILE_NAME); });

    function fmtTime(s){ return Math.floor(s/60)+':'+String(s%60).padStart(2,'0'); }
    function startTimer(){ stopTimer(); let left=RESEND_SEC; const tx=$('#timerTx'), b=$('#btnResend');
      tx.hidden=false; tx.classList.remove('auth-sent'); b.hidden=true; tx.textContent='Отправить код повторно через '+fmtTime(left);
      timerId=setInterval(()=>{ left--; if(left<=0){ stopTimer(); tx.hidden=true; b.hidden=false; } else tx.textContent='Отправить код повторно через '+fmtTime(left); },1000); }
    function stopTimer(){ if(timerId){ clearInterval(timerId); timerId=null; } }
    $('#btnResend').addEventListener('click', ()=>{ clearCode(); const tx=$('#timerTx'), b=$('#btnResend');
      b.hidden=true; tx.hidden=false; tx.textContent='Код отправлен повторно'; tx.classList.add('auth-sent');
      setTimeout(()=>{ tx.classList.remove('auth-sent'); startTimer(); },1600); cells[0].focus(); });

    /* фокус-трап */
    back.addEventListener('keydown', e=>{ if(e.key!=='Tab') return;
      const f=[...back.querySelectorAll('button,a[href],input')].filter(el=>!el.disabled && el.offsetParent!==null);
      if(!f.length) return; const first=f[0], last=f[f.length-1];
      if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); } });

    /* ── ШАПКА: «Войти» ↔ ЛК. Имя из профиля → инициалы+имя; пусто → иконка+«Кабинет».
       ДЕМО: имя профиля (в реале — с бэка). Пусто = сценарий «профиль не заполнен». ── */
    const PROFILE_NAME = '';   // имя из профиля (с бэка). Пусто → «Кабинет». 'Иван Иванов' → инициалы «ИИ»
    const authBtn=$('#authBtn'), authBtnLbl=$('#authBtnLbl'), umenu=$('#umenu'), huser=$('#huser');
    const authAv=$('#authAv'), umenuName=$('#umenuName'), umenuPhone=$('#umenuPhone');
    const initials = n => { const p=n.trim().split(/\s+/).filter(Boolean); return p.length ? (p[0][0]+(p[1]?p[1][0]:'')).toUpperCase() : ''; };
    const firstName = n => n.trim().split(/\s+/)[0] || '';
    function doLogin(phone, name){ loggedIn=true; name=(name||'').trim(); umenuPhone.textContent=phone;
      if(name){ huser.classList.add('has-name'); authAv.textContent=initials(name);
        authBtnLbl.textContent=firstName(name); authBtn.title=name; umenuName.textContent=name; }
      else { huser.classList.remove('has-name'); authBtnLbl.textContent='Кабинет'; authBtn.title='Личный кабинет'; umenuName.textContent='Личный кабинет'; } }
    function doLogout(){ loggedIn=false; huser.classList.remove('has-name'); authBtnLbl.textContent='Войти'; authBtn.title='Войти'; umenu.classList.remove('show'); authBtn.setAttribute('aria-expanded','false'); }
    authBtn.addEventListener('click', e=>{ e.stopPropagation(); if(!loggedIn){ open(); return; }
      const o=umenu.classList.toggle('show'); authBtn.setAttribute('aria-expanded', o?'true':'false'); });
    $('#logout').addEventListener('click', doLogout);
    document.addEventListener('click', e=>{ if(huser && !huser.contains(e.target)){ umenu.classList.remove('show'); authBtn.setAttribute('aria-expanded','false'); } });
  })();
