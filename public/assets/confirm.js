(function () {
  'use strict';
  /* =====================================================================
     설정
     KAKAO : 카카오톡 채널 채팅 주소(예: https://pf.kakao.com/_abcDEF/chat). 비워 두면 문의 페이지가 열립니다.
     BASE  : 프로젝트 파일이 들어 있는 폴더 이름 (기본 'projects')
     ===================================================================== */
  var SB = document.body.getAttribute('data-base') || '/';   // 사이트 주소 앞부분(예: /malong/)
  var CFG = {
    KAKAO: '',
    INQUIRY: SB + 'quote/',
    BASE: SB + 'projects',
    TEL: '1644-4762',
    SITE: SB
  };
  var MODEL_VIEWER = 'https://unpkg.com/@google/model-viewer@3.5.0/dist/model-viewer.min.js';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function okLink(u) { return /^https?:\/\/[^\s"'<>]+$/i.test(u) ? u : ''; }
  function toast(m) { var t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toast.h); toast.h = setTimeout(function () { t.classList.remove('on'); }, 3200); }
  function norm(s) { return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
  function sha(s) {
    var enc = new TextEncoder().encode(s);
    return crypto.subtle.digest('SHA-256', enc).then(function (b) { return [].map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join('').slice(0, 24); });
  }
  /* 파일 경로: https 주소는 그대로, 그 밖에는 프로젝트 폴더 안의 파일로 */
  var FOLDER = '';
  function asset(u) {
    u = String(u || '').trim(); if (!u) return '';
    if (/^https?:\/\//i.test(u)) return okLink(u);
    if (/^[a-z][a-z0-9+.-]*:/i.test(u) || u.slice(0, 2) === '//' || /["'<>\s\\]/.test(u) || u.indexOf('..') > -1) return '';
    return FOLDER + u.replace(/^\/+/, '');
  }
  /* 스케치팹 주소(또는 모델 ID)에서 32자리 ID 뽑기 */
  function sfId(s) { s = String(s || '').trim(); var m = /^[0-9a-f]{32}$/i.exec(s) || (/sketchfab\.com\//i.test(s) && /([0-9a-f]{32})(?![0-9a-f])/i.exec(s)); return m ? (m[1] || m[0]).toLowerCase() : ''; }
  function fmtDate(s) { var m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(String(s || '')); return m ? m[1] + '.' + ('0' + m[2]).slice(-2) + '.' + ('0' + m[3]).slice(-2) : esc(s || ''); }

  /* ---------- 코드 입력 화면 ---------- */
  var fails = 0, lockUntil = 0;
  function showGate(msg, prefill) {
    document.title = '디자인 시안 확인 | 마롱컴퍼니';
    $('#app').innerHTML = '<section class="gate"><div class="gate-in"><div class="lock" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg></div>' +
      '<p class="cap">Design Review</p><h1>디자인 시안<br>확인 페이지</h1><p class="d">전달드린 프로젝트 코드를 입력하시면 3D 시안, 렌더링 이미지, 제안서를 확인하실 수 있어요.</p>' +
      '<form id="gf" autocomplete="off"><label for="gc">프로젝트 코드</label><div class="row"><input id="gc" type="text" inputmode="latin" autocapitalize="characters" spellcheck="false" placeholder="예: K7M2-X9QP-4D"><button class="btn" type="submit">확인하기</button></div>' +
      (msg ? '<div class="err" role="alert">' + esc(msg) + '</div>' : '') + '</form>' +
      '<p class="help">코드를 모르시거나 열리지 않으면 담당자에게 문의해 주세요.<br>대표전화 ' + esc(CFG.TEL) + '</p><p class="conf">본 페이지의 자료는 의뢰 고객에게만 제공되는 비공개 자료입니다.</p></div></section>';
    var inp = $('#gc'); if (prefill) inp.value = prefill; inp.focus();
    $('#gf').addEventListener('submit', function (e) { e.preventDefault(); var v = inp.value.trim(); if (v) openProject(v); });
  }
  function showLoad() { $('#app').innerHTML = '<div class="load" role="status">확인 중이에요…</div>'; }

  /* ---------- 코드 확인 ---------- */
  function openProject(code) {
    var n = norm(code);
    if (Date.now() < lockUntil) { showGate('입력을 여러 번 틀리셨어요. 잠시 후 다시 시도해 주세요.', code); return; }
    if (n.length < 4) { showGate('프로젝트 코드를 확인해 주세요.', code); return; }
    showLoad();
    if (!(window.crypto && crypto.subtle)) { showGate('이 브라우저에서는 열 수 없어요. 최신 브라우저로 접속해 주세요.', code); return; }
    sha(n).then(function (h) {
      FOLDER = CFG.BASE + '/' + h + '/';
      return fetch(CFG.BASE + '/' + h + '.json', { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error('nf'); return r.json(); });
    }).then(function (d) {
      fails = 0; try { sessionStorage.setItem('malong_confirm', n); } catch (e) {}
      if (location.hash) { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} }
      show(d, n);
    }, function () {
      fails++; if (fails >= 5) { lockUntil = Date.now() + 30000; fails = 0; }
      try { sessionStorage.removeItem('malong_confirm'); } catch (e) {}
      showGate('프로젝트 코드를 찾을 수 없어요. 코드를 다시 확인해 주세요.', code);
    });
  }

  /* ---------- 프로젝트 화면 ---------- */
  function list(a) { return Array.isArray(a) ? a : []; }
  function show(d, code) {
    var models = list(d.models).map(function (m) { var sf = sfId(m.sketchfab || m.src); return { title: String(m.title || ''), sf: sf, src: sf ? '' : (/^https?:/i.test(m.src || '') ? okLink(m.src) : asset(m.src)) }; }).filter(function (m) { return m.sf || m.src; });
    var ta = d.turnaround || {}, imgs = list(ta.images).map(function (x) { return { src: asset(typeof x === 'string' ? x : x.src), label: typeof x === 'string' ? '' : String(x.label || '') }; }).filter(function (x) { return x.src; });
    var docs = list(d.documents).map(function (x) { return { file: asset(x.file), title: String(x.title || '문서'), note: String(x.note || '') }; }).filter(function (x) { return x.file; });
    var checks = list(d.checks).map(String).filter(Boolean);
    document.title = (d.title || '시안 확인') + ' | 마롱컴퍼니';
    var meta = '';
    if (d.client) meta += '<span>의뢰<b>' + esc(d.client) + '</b></span>';
    if (d.version) meta += '<span>시안<b>' + esc(d.version) + '</b></span>';
    if (d.date) meta += '<span>전달일<b>' + fmtDate(d.date) + '</b></span>';
    if (d.manager) meta += '<span>담당<b>' + esc(d.manager) + '</b></span>';
    var toc = [];
    if (models.length) toc.push(['m', '3D 시안']); if (imgs.length) toc.push(['t', '렌더링']); if (docs.length) toc.push(['d', '제안서']); toc.push(['c', '확인 · 의견']);
    var h = '<div class="wrap"><section class="head"><div><p class="cap">' + esc(d.eyebrow || 'Design Proposal') + '</p><h1>' + esc(d.title || '디자인 시안') + '</h1><div class="meta">' + meta + '</div></div>' +
      (d.message ? '<p class="msg">' + esc(d.message) + '</p>' : '') +
      '<nav class="toc" aria-label="이 페이지의 구성">' + toc.map(function (t) { return '<a href="#' + t[0] + '">' + t[1] + '</a>'; }).join('') + '</nav></section>';
    if (models.length) h += '<section class="csec" id="m"><div class="csec-h"><h2>3D 시안</h2><span class="cap">3D Model</span></div><p class="csec-d">마우스나 손가락으로 돌려 보고, 확대해서 구석구석 확인하실 수 있어요.</p>' +
      (models.length > 1 ? '<div class="tabs" role="group" aria-label="시안 선택">' + models.map(function (m, i) { return '<button type="button" data-mi="' + i + '" aria-pressed="' + (i === 0) + '">' + esc(m.title || (i + 1) + '안') + '</button>'; }).join('') + '</div>' : '') +
      '<div class="v3d" id="v3d"></div></section>';
    if (imgs.length) h += '<section class="csec" id="t"><div class="csec-h"><h2>' + esc(ta.title || '턴어라운드 렌더링') + '</h2><span class="cap">' + imgs.length + ' views</span></div><p class="csec-d">' + (ta.spin ? '이미지를 좌우로 드래그하면 작품이 한 바퀴 돌아요.' : '각도별 렌더링 이미지예요. 좌우로 넘겨 보거나 아래 작은 이미지를 눌러 주세요.') + '</p><div class="ta" id="ta"></div></section>';
    if (docs.length) h += '<section class="csec" id="d"><div class="csec-h"><h2>디자인 제안서</h2><span class="cap">Documents</span></div><ul class="docs">' + docs.map(function (x) { return '<li><div class="ic">PDF</div><div><h3>' + esc(x.title) + '</h3>' + (x.note ? '<p>' + esc(x.note) + '</p>' : '') + '</div><div class="acts"><a class="btn sm ln" href="' + esc(x.file) + '" target="_blank" rel="noopener noreferrer">바로 보기</a><a class="btn sm" href="' + esc(x.file) + '" download>다운로드</a></div></li>'; }).join('') + '</ul></section>';
    h += '<section class="csec" id="c"><div class="csec-h"><h2>확인 · 의견</h2><span class="cap">Feedback</span></div><div class="ask"><div><h3>시안을 확인해 주세요</h3><p>확인하신 뒤 아래 버튼으로 알려 주세요. 버튼을 누르면 내용이 복사되고 담당자와 채팅할 수 있는 창이 열려요.</p></div>' +
      (checks.length ? '<ul>' + checks.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>' : '') +
      '<div class="row"><button class="btn sm" type="button" data-ask="ok">이대로 진행해 주세요</button><button class="btn sm ln" type="button" data-ask="rev">수정을 요청할게요</button></div></div></section>' +
      '<footer class="cfoot"><div><b>문의</b> · 담당자 또는 대표전화 ' + esc(CFG.TEL) + '</div><p class="cp">본 자료의 저작권은 (주)마롱컴퍼니에 있으며, 계약 체결 및 대금 지급 전에는 복제, 제3자 제공, 유사 제작에 사용할 수 없습니다. 이 페이지 주소와 프로젝트 코드는 의뢰하신 분께만 공유해 주세요.</p><div><button type="button" class="btn sm ln" id="out">다른 코드로 보기</button></div></footer></div>';
    $('#app').innerHTML = h; window.scrollTo(0, 0);
    if (models.length) mountModel(models, 0, d.title);
    if (imgs.length) mountTurn(imgs, !!ta.spin);
    $('#app').onclick = function (e) {
      var a = e.target.closest('[data-ask]'); if (a) { askTeam(a.getAttribute('data-ask'), d, code); return; }
      var mi = e.target.closest('[data-mi]'); if (mi) { $$('[data-mi]').forEach(function (b) { b.setAttribute('aria-pressed', b === mi ? 'true' : 'false'); }); mountModel(models, +mi.getAttribute('data-mi'), d.title); return; }
      if (e.target.closest('#out')) { try { sessionStorage.removeItem('malong_confirm'); } catch (x) {} showGate(); }
    };
  }

  /* ---------- 3D ---------- */
  var vLoad = null;
  function mountModel(models, i, name) {
    var box = $('#v3d'); if (!box) return;
    box.className = 'v3d'; box.innerHTML = '<div class="hint">드래그해서 돌려 보고, 두 손가락(또는 휠)으로 확대할 수 있어요</div>'; document.body.style.overflow = '';
    if (models[i].sf) {
      box.innerHTML = '<iframe title="' + esc((name || '프로젝트') + ' 3D 시안') + '" src="https://sketchfab.com/models/' + models[i].sf + '/embed?autostart=1&preload=1&dnt=1&ui_infos=0&ui_hint=2" allow="autoplay; fullscreen; xr-spatial-tracking" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" loading="eager"></iframe><p class="sfc">3D viewer by <a href="https://sketchfab.com/models/' + models[i].sf + '" target="_blank" rel="noopener noreferrer">Sketchfab</a></p>';
      return;
    }
    function build() {
      if (!$('#v3d')) return;
      var mv = document.createElement('model-viewer');
      mv.setAttribute('src', models[i].src); mv.setAttribute('alt', (name || '프로젝트') + ' 3D 시안'); mv.setAttribute('camera-controls', ''); mv.setAttribute('touch-action', 'pan-y');
      mv.setAttribute('auto-rotate', ''); mv.setAttribute('shadow-intensity', '1'); mv.setAttribute('ar', ''); mv.setAttribute('ar-modes', 'webxr scene-viewer quick-look'); mv.setAttribute('loading', 'eager');
      box.insertBefore(mv, box.firstChild);
      var t = document.createElement('div'); t.className = 'tools'; t.innerHTML = '<button type="button" data-t="rot">회전 멈춤</button><button type="button" data-t="full">크게 보기</button>'; box.appendChild(t);
      t.addEventListener('click', function (e) {
        var b = e.target.closest('[data-t]'); if (!b) return;
        if (b.getAttribute('data-t') === 'rot') { var on = mv.hasAttribute('auto-rotate'); if (on) mv.removeAttribute('auto-rotate'); else mv.setAttribute('auto-rotate', ''); b.textContent = on ? '자동 회전' : '회전 멈춤'; }
        else { var f = box.classList.toggle('full'); b.textContent = f ? '닫기' : '크게 보기'; document.body.style.overflow = f ? 'hidden' : ''; }
      });
      mv.addEventListener('error', fail);
    }
    function fail() { var b = $('#v3d'); if (!b) return; b.className = 'v3d empty'; b.innerHTML = '<p>3D 화면을 불러오지 못했어요.<br>잠시 후 새로고침해 보시고, 계속 안 보이면 담당자에게 알려 주세요.</p>'; }
    if (window.customElements && customElements.get('model-viewer')) { build(); return; }
    if (!vLoad) vLoad = new Promise(function (ok, no) { var s = document.createElement('script'); s.type = 'module'; s.src = MODEL_VIEWER; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
    vLoad.then(build, fail);
  }

  /* ---------- 턴어라운드 ---------- */
  function mountTurn(imgs, spin) {
    var box = $('#ta'); if (!box) return;
    var n = imgs.length, cur = 0, timer = null, many = n > 1;
    box.innerHTML = '<div class="ta-st" id="tas" role="img" aria-label="턴어라운드 이미지"><img alt="" id="tai" referrerpolicy="no-referrer"></div>' +
      (many ? '<div class="ta-prog"><i id="tap"></i></div>' : '') +
      '<div class="ta-bar"><span class="lbl" id="tal"></span>' + (many ? '<button type="button" data-ta="prev" aria-label="이전 이미지">←</button><button type="button" data-ta="next" aria-label="다음 이미지">→</button>' : '') + (spin && many ? '<button type="button" data-ta="play" id="tapl">자동 회전</button>' : '') + '<button type="button" data-ta="big">크게 보기</button></div>' +
      (many ? '<div class="ta-th" id="tath">' + imgs.map(function (x, i) { return '<button type="button" data-tk="' + i + '" aria-label="' + (i + 1) + '번 이미지"><img src="' + esc(x.src) + '" alt="" loading="lazy" referrerpolicy="no-referrer">' + (x.label ? '<span>' + esc(x.label) + '</span>' : '') + '</button>'; }).join('') + '</div>' : '');
    imgs.forEach(function (x) { var p = new Image(); p.src = x.src; });
    function go(i) {
      cur = ((i % n) + n) % n; $('#tai').src = imgs[cur].src;
      $('#tal').innerHTML = esc(imgs[cur].label || ('View ' + (cur + 1))) + '<small>' + (cur + 1) + ' / ' + n + '</small>';
      var p = $('#tap'); if (p) p.style.width = ((cur + 1) / n * 100) + '%';
      $$('#tath button').forEach(function (b, k) { if (k === cur) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; var b = $('#tapl'); if (b) b.textContent = '자동 회전'; } }
    function play() { if (timer) return; timer = setInterval(function () { go(cur + 1); }, 140); var b = $('#tapl'); if (b) b.textContent = '멈춤'; }
    go(0);
    var st = $('#tas'), drag = null;
    st.addEventListener('pointerdown', function (e) { if (!many) return; stop(); drag = { x: e.clientX, c: cur }; st.classList.add('drag'); try { st.setPointerCapture(e.pointerId); } catch (x) {} });
    st.addEventListener('pointermove', function (e) { if (!drag) return; var step = Math.max(14, Math.min(40, st.clientWidth / n)); go(drag.c - Math.round((e.clientX - drag.x) / step)); });
    function up() { drag = null; st.classList.remove('drag'); }
    st.addEventListener('pointerup', up); st.addEventListener('pointercancel', up);
    st.addEventListener('keydown', function () {});
    box.addEventListener('click', function (e) {
      var a = e.target.closest('[data-ta]'), k = e.target.closest('[data-tk]');
      if (k) { stop(); go(+k.getAttribute('data-tk')); return; }
      if (!a) return; var t = a.getAttribute('data-ta');
      if (t === 'prev') { stop(); go(cur - 1); } else if (t === 'next') { stop(); go(cur + 1); } else if (t === 'play') { timer ? stop() : play(); } else if (t === 'big') lightbox(imgs[cur].src);
    });
    box.setAttribute('tabindex', '0');
    box.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { stop(); go(cur + 1); } else if (e.key === 'ArrowLeft') { stop(); go(cur - 1); } });
  }
  function lightbox(u) {
    var d = document.createElement('div'); d.className = 'cfm-lb'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
    d.innerHTML = '<img src="' + esc(u) + '" alt="" referrerpolicy="no-referrer"><button type="button">닫기</button>';
    function close() { d.remove(); document.removeEventListener('keydown', key); } function key(e) { if (e.key === 'Escape') close(); }
    d.addEventListener('click', close); document.addEventListener('keydown', key); document.body.appendChild(d);
  }

  /* ---------- 확인 · 수정 요청 ---------- */
  function askTeam(kind, d, code) {
    var head = '[' + (d.title || '프로젝트') + (d.version ? ' ' + d.version : '') + '] ';
    var text = kind === 'ok' ? head + '시안을 확인했고, 이대로 진행해 주세요.' : head + '시안 수정을 요청드립니다.\n수정하고 싶은 부분: ';
    var url = okLink(d.kakao) || CFG.KAKAO;
    function after() { toast(url ? '내용을 복사했어요. 열린 채팅창에 붙여 넣어 주세요.' : '내용을 복사했어요. 담당자에게 전달해 주세요.'); if (url) window.open(url, '_blank', 'noopener'); }
    try { navigator.clipboard.writeText(text).then(after, function () { toast('자동 복사가 안 됐어요. 담당자에게 직접 알려 주세요.'); }); } catch (e) { toast('자동 복사가 안 됐어요. 담당자에게 직접 알려 주세요.'); }
  }

  /* ---------- 시작 ---------- */
  var hc = decodeURIComponent((location.hash || '').replace(/^#\/?/, '')).trim(), saved = '';
  try { saved = sessionStorage.getItem('malong_confirm') || ''; } catch (e) {}
  if (hc) openProject(hc); else if (saved) openProject(saved); else showGate();
  window.addEventListener('hashchange', function () { var v = decodeURIComponent((location.hash || '').replace(/^#\/?/, '')).trim(); if (v) openProject(v); });
})();
