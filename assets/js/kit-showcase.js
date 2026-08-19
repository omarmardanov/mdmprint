/* Скрипт витрины кита (prototypes/kit.html). Вынесено из inline 19.08. */

  // табы: переключение панели + высота обёртки без скачка
  document.querySelectorAll('.mk-tabs').forEach(function(tabs){
    var panels = tabs.parentNode.querySelector('.mk-tabpanels');
    tabs.addEventListener('click', function(e){
      var btn = e.target.closest('.mk-tab');
      if (!btn) return;
      tabs.querySelectorAll('.mk-tab').forEach(function(b){
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-selected', b === btn);
      });
      panels.querySelectorAll('.mk-tabpanel').forEach(function(p, i){
        p.classList.toggle('is-active', i === +btn.dataset.tab);
      });
    });
  });

  // стрелки ленты: шаг на ширину кадра
  document.querySelectorAll('.mk-scroller__nav').forEach(function(nav){
    nav.addEventListener('click', function(){
      var track = nav.parentNode.querySelector('.mk-scroller__track');
      track.scrollBy({left: +nav.dataset.dir * track.clientWidth, behavior: 'smooth'});
    });
  });
