/* 홈: 대표 작품 전환 + 흘러가는 작품 줄 */
(function () {
  var root = document.getElementById('v-home'); if (!root) return;
  var rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var slides = [].slice.call(root.querySelectorAll('.hs')), dots = [].slice.call(root.querySelectorAll('.hm-dots button'));
  var hb = root.querySelector('.hm-hb a'), ms = parseInt(root.getAttribute('data-ms'), 10) || 6000, i = 0, hold = 0;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function go(k) {
    if (!slides.length) return; i = (k + slides.length) % slides.length;
    slides.forEach(function (el, j) { el.classList.toggle('on', j === i); });
    dots.forEach(function (b, j) { if (j === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
    var s = slides[i]; if (hb && s.getAttribute('data-href')) { hb.setAttribute('href', s.getAttribute('data-href')); hb.innerHTML = '<b>' + esc(s.getAttribute('data-name')) + '</b><span class="cap">' + esc(s.getAttribute('data-cap')) + '</span>'; }
  }
  dots.forEach(function (b) { b.addEventListener('click', function () { go(+b.getAttribute('data-hs')); hold = Date.now() + ms; }); });
  if (!rm && slides.length > 1) setInterval(function () { if (!document.hidden && Date.now() > hold) go(i + 1); }, ms);

  var rl = document.getElementById('rail'); if (!rl) return;
  var n = parseInt(rl.getAttribute('data-n'), 10) || 0, pos = 0, lastSet = -1, hold2 = 0, vis = true, speed = 0.55, drag = null, moved = false;
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }).observe(rl);
  function period() { var a = rl.children[0], b = rl.children[n]; return b ? b.offsetLeft - a.offsetLeft : 0; }
  function tick() {
    if (vis) {
      var P = period();
      if (P > 0) {
        if (lastSet >= 0 && Math.abs(rl.scrollLeft - lastSet) > 1.6) { pos = rl.scrollLeft; hold2 = Date.now() + 2600; }
        if (!rm && !drag && Date.now() > hold2 && !rl.matches(':hover')) pos += speed;
        if (pos >= P) pos -= P; if (pos < 0) pos += P;
        if (Math.abs(rl.scrollLeft - pos) > 0.01) rl.scrollLeft = pos; lastSet = rl.scrollLeft;
      }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  rl.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; drag = { x: e.clientX, l: rl.scrollLeft }; moved = false; });
  window.addEventListener('pointermove', function (e) { if (!drag) return; var dx = e.clientX - drag.x; if (Math.abs(dx) > 4) { moved = true; rl.classList.add('drag'); } if (moved) rl.scrollLeft = drag.l - dx; });
  window.addEventListener('pointerup', function () { if (drag) { drag = null; rl.classList.remove('drag'); hold2 = Date.now() + 2600; } });
  rl.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
})();
