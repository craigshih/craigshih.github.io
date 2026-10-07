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

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 卡片游標光暈：把滑鼠位置寫進 --mx / --my
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('pointermove', function(e){
      var card = e.target.closest && e.target.closest('.card');
      if (!card) return;
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, {passive:true});
  }

  // 十字準星游標 + 即時座標（X 為畫面座標，Y 為整頁座標）
  var xh = document.querySelector('.xhair');
  if (xh && !reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var lbl = xh.querySelector('.xh-lbl'), mx = 0, my = 0, queued = false;
    var pad = function(n){ n = Math.max(0, Math.round(n)); return ('0000' + n).slice(-4); };
    var draw = function(){
      queued = false;
      xh.style.setProperty('--x', mx + 'px');
      xh.style.setProperty('--y', my + 'px');
      lbl.textContent = 'X ' + pad(mx) + '  Y ' + pad(my + scrollY);
      xh.classList.toggle('flip-x', mx > innerWidth - 150);
      xh.classList.toggle('flip-y', my > innerHeight - 44);
    };
    var ask = function(){ if (!queued) { queued = true; requestAnimationFrame(draw); } };
    document.documentElement.classList.add('has-xhair');
    document.addEventListener('pointermove', function(e){
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX; my = e.clientY; xh.classList.add('on'); ask();
      xh.classList.toggle('hot', !!(e.target.closest && e.target.closest('a,button,[data-lb],.tools li,.traits li')));
    }, {passive:true});
    addEventListener('scroll', ask, {passive:true});
    document.addEventListener('pointerdown', function(){ xh.classList.add('press'); });
    document.addEventListener('pointerup', function(){ xh.classList.remove('press'); });
    document.documentElement.addEventListener('mouseleave', function(){ xh.classList.remove('on'); });
  }

  // 頂部捲動進度條 + 經歷時間軸的填色進度
  var bar = document.querySelector('.progress'), tl = document.querySelector('.tl'), ticking = false;
  function onScroll(){
    ticking = false;
    var h = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.setProperty('--sp', h > 0 ? (scrollY / h).toFixed(4) : 0);
    if (tl) {
      var r = tl.getBoundingClientRect();
      var p = (innerHeight * 0.6 - r.top) / r.height;
      tl.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(4));
    }
  }
  addEventListener('scroll', function(){ if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, {passive:true});
  addEventListener('resize', onScroll);
  onScroll();

  // 數字卡：進入畫面時從 0 跑到目標值（只動第一個純數字的文字節點）
  function countUp(el){
    var t = el.firstChild;
    if (!t || t.nodeType !== 3 || !/^\d+(\.\d+)?$/.test(t.nodeValue.trim())) return;
    var end = parseFloat(t.nodeValue), dec = (t.nodeValue.split('.')[1] || '').length, t0 = null;
    function step(ts){
      if (t0 === null) t0 = ts;
      var k = Math.min(1, (ts - t0) / 1400), e = 1 - Math.pow(1 - k, 3);
      t.nodeValue = (end * e).toFixed(dec);
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (!reduce && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if (en.isIntersecting) { countUp(en.target); cio.unobserve(en.target); } });
    }, {threshold:.6});
    document.querySelectorAll('.stat .n').forEach(function(el){ cio.observe(el); });
  }

  // 財經站瀏覽器框：每 5.2 秒換一頁；滑鼠移入暫停、點分頁可切換、離開畫面就停
  document.querySelectorAll('[data-cycle]').forEach(function(b){
    var tabs = b.querySelectorAll('.b-tabs button'), slides = b.querySelectorAll('.b-slide'), i = 0, timer = null;
    function go(n){
      i = (n + slides.length) % slides.length;
      for (var k = 0; k < slides.length; k++) {
        slides[k].classList.remove('on'); tabs[k].classList.remove('on'); tabs[k].setAttribute('aria-selected', k === i);
      }
      void b.offsetWidth;   // 重新觸發 CSS 動畫
      slides[i].classList.add('on'); tabs[i].classList.add('on');
    }
    function stop(){ clearInterval(timer); timer = null; }
    function start(){ stop(); if (!reduce) timer = setInterval(function(){ go(i + 1); }, 5200); }
    tabs.forEach(function(t, k){ t.addEventListener('click', function(){ go(k); start(); }); });
    b.addEventListener('mouseenter', function(){ stop(); b.classList.add('paused'); });
    b.addEventListener('mouseleave', function(){ b.classList.remove('paused'); start(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function(en){ en[0].isIntersecting ? (go(i), start()) : stop(); }).observe(b);
    } else { start(); }
  });

  // 捲動進場
  var items = document.querySelectorAll('.reveal, .tl-item');
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
