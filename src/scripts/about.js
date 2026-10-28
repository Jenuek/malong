/* 회사소개: 스크롤하면 왼쪽 층 그래픽이 따라 바뀌고, 목차를 누르면 부드럽게 이동 */
(function () {
  var stk = document.getElementById('stkA'); if (!stk) return;
  var rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function setOn(id) {
    stk.classList.add('has-f');
    $$('.slab', stk).forEach(function (g) { g.classList.toggle('on', g.getAttribute('data-a') === id); });
    $$('#fltA a').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-a') === id ? 'true' : 'false'); });
    $$('#mchipsA a').forEach(function (b) {
      var on = b.getAttribute('data-a') === id; b.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on) { var bx = b.parentNode, r = b.offsetLeft + b.offsetWidth + 20; if (r > bx.clientWidth) bx.scrollTo({ left: r - bx.clientWidth, behavior: 'auto' }); else bx.scrollTo({ left: 0, behavior: 'auto' }); }
    });
  }
  function secTop(id) { var el = document.getElementById(id), off = window.matchMedia('(min-width: 900px)').matches ? 0 : document.getElementById('top').offsetHeight; return el.getBoundingClientRect().top + window.scrollY - off; }
  function goTo(id) {
    if (!document.getElementById(id)) return;
    window.scrollTo({ top: secTop(id), behavior: rm ? 'auto' : 'smooth' });
    try { history.replaceState(null, '', '#' + id); } catch (e) {}
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-a]'); if (!a) return;
    e.preventDefault(); goTo(a.getAttribute('data-a'));
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) setOn(en.target.id); }); }, { rootMargin: '-30% 0px -65% 0px' });
    $$('#v-about section').forEach(function (s) { io.observe(s); });
  }
  var m = /^#(s[1-6])$/.exec(location.hash || '');
  setOn(m ? m[1] : 's1');
  if (m) window.scrollTo({ top: secTop(m[1]), behavior: 'auto' });
})();
