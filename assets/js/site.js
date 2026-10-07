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

  // 星座背景：點緩慢漂移、彼此靠近就連線；有滑鼠時，游標附近的點會連到游標
  var cv = document.querySelector('.bg-fx .stars');
  if (cv && !reduce && cv.getContext) {
    var ctx = cv.getContext('2d'), dpr = Math.min(2, window.devicePixelRatio || 1), W = 0, H = 0, pts = [];
    var cur = {x: -999, y: -999}, LINK = 130, PULL = 190, running = true;
    var COLORS = ['rgba(255,200,61,', 'rgba(229,64,43,', 'rgba(244,240,232,'];
    var size = function(){
      W = innerWidth; H = innerHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(90, W * H / 16000));
      pts = [];
      for (var k = 0; k < n; k++) pts.push({x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25, r: Math.random() * 1.6 + .6, c: COLORS[k % 3]});
    };
    var frame = function(){
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      for (var a = 0; a < pts.length; a++) {
        var p = pts[a];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        for (var b = a + 1; b < pts.length; b++) {
          var q = pts[b], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
          if (d < LINK * LINK) {
            ctx.strokeStyle = 'rgba(244,240,232,' + (0.09 * (1 - Math.sqrt(d) / LINK)).toFixed(3) + ')';
            ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        var cx = p.x - cur.x, cy = p.y - cur.y, cd = Math.sqrt(cx * cx + cy * cy);
        if (cd < PULL) {
          ctx.strokeStyle = 'rgba(255,200,61,' + (0.45 * (1 - cd / PULL)).toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(cur.x, cur.y); ctx.stroke();
          p.x -= cx * .004; p.y -= cy * .004;
        }
        ctx.fillStyle = p.c + (cd < PULL ? .95 : .6) + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      }
      requestAnimationFrame(frame);
    };
    size(); addEventListener('resize', size);
    document.addEventListener('pointermove', function(e){ if (e.pointerType === 'mouse') { cur.x = e.clientX; cur.y = e.clientY; } }, {passive:true});
    document.documentElement.addEventListener('mouseleave', function(){ cur.x = cur.y = -999; });
    document.addEventListener('visibilitychange', function(){ running = !document.hidden; if (running) requestAnimationFrame(frame); });
    requestAnimationFrame(frame);
  }

  // 跨界座標：點星球切換說明；沒互動時每 5 秒自動輪播
  document.querySelectorAll('.xmap').forEach(function(m){
    var hubs = m.querySelectorAll('.hub'), panels = m.querySelectorAll('.mp'), keys = [], auto = null;
    hubs.forEach(function(h){ keys.push(h.getAttribute('data-hub')); });
    function show(k){
      m.setAttribute('data-active', k);
      panels.forEach(function(p){ p.hidden = p.getAttribute('data-hub') !== k; });
    }
    function stopAuto(){ clearInterval(auto); auto = null; }
    hubs.forEach(function(h){
      var k = h.getAttribute('data-hub');
      h.addEventListener('click', function(){ stopAuto(); show(k); });
      h.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); stopAuto(); show(k); } });
      h.addEventListener('mouseenter', function(){ stopAuto(); show(k); });
    });
    if (!reduce) auto = setInterval(function(){
      show(keys[(keys.indexOf(m.getAttribute('data-active')) + 1) % keys.length]);
    }, 5000);
  });

  // 角落 hashtag：打字機輪播
  var tagBox = document.querySelector('.corner-tag');
  if (tagBox && !reduce) {
    var tags = JSON.parse(tagBox.getAttribute('data-tags')), span = tagBox.querySelector('span'), ti = 0, ci = tags[0].length, dir = -1;
    var tick = function(){
      ci += dir;
      span.textContent = tags[ti].slice(0, Math.max(0, ci));
      var wait = dir < 0 ? 45 : 90;
      if (dir < 0 && ci <= 0) { ti = (ti + 1) % tags.length; dir = 1; wait = 300; }
      else if (dir > 0 && ci >= tags[ti].length) { dir = -1; wait = 2600; }
      setTimeout(tick, wait);
    };
    setTimeout(tick, 2600);
  }

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
