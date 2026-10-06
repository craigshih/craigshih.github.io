(function(){
  document.documentElement.classList.remove('no-js');

  // 手機選單
  var btn = document.querySelector('.menu-btn'), nav = document.getElementById('nav');
  if (btn && nav) {
    btn.addEventListener('click', function(){
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    });
    nav.addEventListener('click', function(e){
      if (e.target.tagName === 'A') { nav.classList.remove('open'); btn.setAttribute('aria-expanded', false); }
    });
  }

  // 捲動進場
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, {rootMargin:'0px 0px -8% 0px'});
    items.forEach(function(el){ io.observe(el); });
  } else {
    items.forEach(function(el){ el.classList.add('in'); });
  }

  // 圖片燈箱：同一個 [data-lb-group] 內可左右切換
  var lb = document.getElementById('lb');
  if (!lb) return;
  var im = lb.querySelector('img'), cap = lb.querySelector('figcaption'), list = [], idx = 0, last = null;

  function show(i){
    idx = (i + list.length) % list.length;
    var el = list[idx], img = el.tagName === 'IMG' ? el : el.querySelector('img');
    im.src = img.currentSrc || img.src;
    im.alt = img.alt;
    cap.textContent = el.getAttribute('data-cap') || img.alt;
    if (list.length > 1) {
      var n = document.createElement('span'); n.textContent = (idx + 1) + ' / ' + list.length; cap.appendChild(n);
    }
    lb.querySelector('.prev').hidden = lb.querySelector('.next').hidden = list.length < 2;
  }
  function open(el){
    var group = el.closest('[data-lb-group]') || document.body;
    list = Array.prototype.slice.call(group.querySelectorAll('[data-lb]'));
    last = el;
    show(list.indexOf(el));
    lb.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
    lb.querySelector('.x').focus();
  }
  function close(){
    lb.removeAttribute('open'); im.src = ''; document.body.style.overflow = '';
    if (last) last.focus();
  }

  document.querySelectorAll('[data-lb]').forEach(function(el){
    el.addEventListener('click', function(){ open(el); });
    if (el.tagName === 'IMG') {
      el.tabIndex = 0;
      el.setAttribute('role', 'button');
      el.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(el); } });
    }
  });
  lb.querySelector('.x').addEventListener('click', close);
  lb.querySelector('.prev').addEventListener('click', function(){ show(idx - 1); });
  lb.querySelector('.next').addEventListener('click', function(){ show(idx + 1); });
  lb.addEventListener('click', function(e){ if (e.target === lb) close(); });
  document.addEventListener('keydown', function(e){
    if (!lb.hasAttribute('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });

  // 手機左右滑動切換
  var x0 = null;
  lb.addEventListener('touchstart', function(e){ x0 = e.touches[0].clientX; }, {passive:true});
  lb.addEventListener('touchend', function(e){
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    x0 = null;
  });
})();
