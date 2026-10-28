/* 작품 목록: 필터 · 검색 · 정렬 · 더 보기
   서버가 미리 그려 둔 첫 화면(검색엔진이 읽는 부분) 위에, 브라우저에서 전체 목록(works-index.json)을 읽어 이어 붙입니다. */
import { createEngine } from '../lib/engine.js';
import { PAGE, GROUPS, emptyState, parseQuery, toQuery, isFiltered, applyFilters, facetsOf, haystack } from '../lib/filter.js';

(function () {
  var root = document.getElementById('v-work'); if (!root) return;
  var BASE = document.body.getAttribute('data-base') || '/';
  var mat = root.getAttribute('data-mat') || 'all', pageNo = parseInt(root.getAttribute('data-page'), 10) || 1, home = root.getAttribute('data-home') || '';
  var grid = document.getElementById('works'), moreBox = document.getElementById('more'), pager = root.querySelector('.pager');
  var form = root.querySelector('form.tb');
  var cur = [], st = parseQuery(location.search), E = null, W = [], baseList = [], X = {}, shown = PAGE, io = null, tagsOpen = false, loading = false, t0 = 0;

  /* ---- 소재 상세(단면 · 제작 과정) 펼치기 ---- */
  document.addEventListener('click', function (e) {
    var tg = e.target.closest && e.target.closest('[data-tog]'); if (!tg) return;
    var det = document.getElementById('det'), open = det.hidden; det.hidden = !open; tg.setAttribute('aria-expanded', open ? 'true' : 'false'); fitCTA();
  });

  /* 마지막 줄의 빈 칸을 견적 타일이 채워 줄 끝까지 맞춥니다 */
  function fitCTA() {
    var c = grid && grid.querySelector('.cta'); if (!c) return;
    c.style.gridColumn = 'span 1';
    var cs = getComputedStyle(grid), cols = cs.gridTemplateColumns.split(' ').length, gap = parseFloat(cs.columnGap) || 0, gr = grid.getBoundingClientRect(), cr = c.getBoundingClientRect();
    var colW = (gr.width - gap * (cols - 1)) / cols, empty = Math.round((gr.right - cr.right) / (colW + gap));
    if (empty > 0) c.style.gridColumn = 'span ' + (1 + empty);
  }
  window.addEventListener('resize', fitCTA);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitCTA);
  fitCTA();

  if (!form || !grid || !window.fetch) return;

  /* ---- 목록 데이터 ---- */
  function expand(r) {
    return { pid: r.p, name: r.n, mats: r.m, img: r.i || '', srcset: r.s || '', w: r.w || 0, h: r.h || 0, alt: r.a || '', cat: r.c, year: r.y, region: r.r, client: r.cl || '', tags: r.t || [] };
  }
  function boot(j) {
    var mats = j.mats.map(function (m) { return { id: m.id, no: m.no, en: m.en, kr: m.kr, layers: [['', '', m.c]], specs: [], pts: [], steps: [] }; });
    var names = {}; mats.forEach(function (m) { names[m.id] = m.en + ' ' + m.kr; });
    W = j.works.map(function (r) {
      var w = { p: r.p, n: r.n, m: r.m, c: r.c || '', y: r.y || '', r: r.r || '', t: r.t || [], o: r.o };
      w.q = haystack({ name: r.n, pid: r.p, cat: r.c, year: r.y, region: r.r, client: r.cl, tags: r.t }, r.m.map(function (id) { return names[id] || id; }));
      X[r.p] = expand(r); return w;
    });
    E = createEngine({ MATS: mats, PORT: [], base: BASE });
    E.setState('work', mat);
    baseList = W.filter(function (w) { return mat === 'all' || w.m.indexOf(mat) > -1; });
    var fresh = !isFiltered(st) && st.sort === 'rec' && pageNo === 1;
    if (fresh) { cur = baseList; shown = PAGE; syncToolbar(baseList); moreUI(baseList.length); if (pager) pager.hidden = true; watch(); }
    else if (pageNo === 1) { render(true); if (pager) pager.hidden = true; }
    else { syncToolbar(baseList); }
    root.classList.remove('is-loading');
  }

  /* ---- 그리기 ---- */
  function tiles(list, from, to) {
    var out = ''; for (var i = from; i < Math.min(to, list.length); i++) out += E.tileHTML(X[list[i].p], i);
    return out;
  }
  function ctaHTML() {
    var m = mat !== 'all' ? E.byId(mat) : null; return E.ctaTile(m);
  }
  function syncToolbar(list) {
    var F = facetsOf(baseList, st), tmp = document.createElement('div'); tmp.innerHTML = E.toolbarHTML(F, st);
    var nf = tmp.querySelector('.tb-f'), of = form.querySelector('.tb-f'), ae = document.activeElement, key = null;
    if (ae && of.contains(ae) && ae.getAttribute) key = [ae.getAttribute('data-g'), ae.getAttribute('data-v')];
    of.innerHTML = nf.innerHTML;
    if (tagsOpen) { [].forEach.call(of.querySelectorAll('[data-x]'), function (b) { b.hidden = false; }); var fm = of.querySelector('[data-fmore]'); if (fm) { fm.setAttribute('aria-expanded', 'true'); fm.textContent = '접기'; } }
    if (key && key[1] != null) { var nb = [].filter.call(of.querySelectorAll('button[data-v]'), function (b) { return b.getAttribute('data-g') === key[0] && b.getAttribute('data-v') === key[1]; })[0]; if (nb) nb.focus(); }
    var filtered = isFiltered(st);
    form.querySelector('.res').textContent = filtered ? list.length + '개 작품 (전체 ' + baseList.length + ')' : '작품 ' + baseList.length + '개';
    form.querySelector('[data-reset]').hidden = !filtered;
    var cnt = root.querySelector('.page-h .cap'); if (cnt && pageNo === 1) { var m = mat !== 'all' ? E.byId(mat) : null; cnt.textContent = (m ? m.en + ' · ' : '') + E.two(list.length); }
    var lc = document.getElementById('lcount'); if (lc) lc.textContent = E.two(list.length);
  }
  function moreUI(total) {
    moreBox.innerHTML = shown < total ? '<button type="button" class="more" data-more>더 보기<span>' + shown + ' / ' + total + '</span></button>' : '';
  }
  function watch() {
    if (io) { io.disconnect(); io = null; }
    var b = moreBox.querySelector('[data-more]'); if (!b || !('IntersectionObserver' in window)) return;
    io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) more(); }, { rootMargin: '0px 0px 700px 0px' });
    io.observe(b);
  }
  function render(initial) {
    cur = applyFilters(baseList, st); shown = PAGE;
    var old = grid.querySelector('.cta'); if (old) old.remove();
    grid.innerHTML = (cur.length ? tiles(cur, 0, shown) : '<p class="empty">조건에 맞는 작품이 없어요. 조건을 줄이거나 <button type="button" class="linkbtn" data-reset>필터를 초기화</button>해 보세요.</p>') + (cur.length && shown >= cur.length ? ctaHTML() : '');
    moreUI(cur.length); syncToolbar(cur); watch(); fitCTA();
    if (!initial) { try { history.replaceState(null, '', location.pathname + toQuery(st)); } catch (e) {} }
  }
  function more() {
    var list = cur;
    var from = shown; if (from >= list.length) return;
    shown = from + PAGE;
    var old = grid.querySelector('.cta'); if (old) old.remove();
    grid.insertAdjacentHTML('beforeend', tiles(list, from, shown) + (shown >= list.length ? ctaHTML() : ''));
    moreUI(list.length); watch(); fitCTA();
  }

  /* ---- 조작 ---- */
  function leave() {   /* 2쪽 이후(검색엔진용 정적 페이지)에서 조건을 바꾸면 1쪽으로 보냅니다 */
    if (pageNo > 1) { location.href = home + toQuery(st); return true; }
    return false;
  }
  function change() { if (leave()) return; render(false); }
  root.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.hasAttribute('data-more')) { more(); return; }
    if (b.hasAttribute('data-reset')) { var s = st.sort; st = emptyState(); st.sort = s; var qi = form.querySelector('[name=q]'); if (qi) qi.value = ''; change(); return; }
    if (b.hasAttribute('data-fmore')) {
      tagsOpen = b.getAttribute('aria-expanded') !== 'true';
      [].forEach.call(b.parentNode.querySelectorAll('[data-x]'), function (x) { x.hidden = !tagsOpen; });
      b.setAttribute('aria-expanded', tagsOpen ? 'true' : 'false'); b.textContent = tagsOpen ? '접기' : '+ 더보기'; return;
    }
    if (b.hasAttribute('data-g') && b.hasAttribute('data-v')) {
      var g = b.getAttribute('data-g'), v = b.getAttribute('data-v'), k = st[g].indexOf(v);
      if (k > -1) st[g].splice(k, 1); else st[g].push(v);
      change();
    }
  });
  var qt = null, qi = form.querySelector('[name=q]');
  if (qi) qi.addEventListener('input', function () { clearTimeout(qt); qt = setTimeout(function () { st.q = qi.value.slice(0, 80); change(); }, 140); });
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  var ss = form.querySelector('[name=sort]');
  if (ss) ss.addEventListener('change', function () { st.sort = ss.value; change(); });

  /* 쓰는 순간 미리 받아 둡니다 */
  function start() {
    if (loading || E) return; loading = true;
    fetch(BASE + 'data/works-index.json').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(boot, function () { loading = false; root.classList.remove('is-loading'); });
  }
  if (isFiltered(st) || st.sort !== 'rec') root.classList.add('is-loading');
  start();
})();
