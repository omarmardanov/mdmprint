/* Скрипт страниц-«топов» (технологии и материалы). Вынесено из inline 19.08, файл общий:
   в обеих страницах лежал один и тот же код переключения табов.
   Подключается в конце <body> — рассчитывает на разобранный DOM. */

  const tabs = document.getElementById('tabs');
  tabs.addEventListener('click', e=>{
    const b = e.target.closest('.mk-tab'); if(!b) return;
    tabs.querySelectorAll('.mk-tab').forEach(x=>{
      const on = x===b;
      x.classList.toggle('is-active', on);
      x.setAttribute('aria-selected', on);
    });
    document.querySelectorAll('.pane').forEach(p=>p.classList.toggle('show', p.dataset.pane===b.dataset.tab));
  });
