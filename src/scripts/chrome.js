/* 모든 페이지 공통: 복사 버튼 · STANDS 문구 순환 · 예전 주소(#/…) 이동 */
(function () {
  var base = document.body.getAttribute('data-base') || '/';

  /* 예전 사이트의 #/… 주소로 들어온 경우 새 주소로 보냅니다 (홈에서만) */
  if (location.pathname === base || location.pathname === base.replace(/\/$/, '') || location.pathname === base + 'index.html') {
    var h = (location.hash || '').replace(/^#\/?/, '').split('/').filter(Boolean), to = '';
    if (location.hash.indexOf('#/') === 0 && h.length) {
      if (h[0] === 'w' && h[1]) to = 'work/' + encodeURIComponent(h[1]) + '/';
      else if (h[0] === 'work') to = h[1] ? 'materials/' + encodeURIComponent(h[1]) + '/' : 'work/';
      else if (h[0] === 'about') to = 'about/' + (/^s[1-6]$/.test(h[1] || '') ? '#' + h[1] : '');
      else if (h[0] === 'biz') to = 'business/' + (/^(arch|public|exhibit)$/.test(h[1] || '') ? h[1] : 'arch') + '/';
      if (to) location.replace(base + to);
    }
  }

  document.addEventListener('click', function (e) {
    var c = e.target.closest && e.target.closest('[data-copy]');
    if (!c) return;
    var val = c.getAttribute('data-copy');
    var done = function () { var o = c.textContent; c.textContent = 'Copied'; setTimeout(function () { c.textContent = o; }, 1200); };
    try { navigator.clipboard.writeText(val).then(done, done); } catch (x) { done(); }
  });

  var box = document.querySelector('.famnav .fns');
  if (box && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var it = box.querySelectorAll('span'), n = 0, t = null, a = document.querySelector('.famnav');
    var tick = function () { it[n].classList.remove('on'); n = (n + 1) % it.length; it[n].classList.add('on'); };
    var start = function () { if (!t) t = setInterval(tick, 3600); };
    var stop = function () { clearInterval(t); t = null; };
    a.addEventListener('mouseenter', stop); a.addEventListener('mouseleave', start); a.addEventListener('focus', stop); a.addEventListener('blur', start);
    start();
  }
})();
