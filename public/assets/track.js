(function () {
  'use strict';
  /* =====================================================================
     설정
     API    : 구글 Apps Script 웹 앱 주소(…/exec). 비워 두면 'DEMO' 코드만 샘플 화면이 나옵니다.
     KAKAO  : 카카오톡 채널 채팅 주소(예: https://pf.kakao.com/_abcDEF/chat). 시안 승인·수정 요청 버튼이 이 채널을 엽니다.
     INQUIRY: 카카오 주소가 없을 때 연결할 문의 페이지
     SITE   : 사이트 메인 파일 이름
     ===================================================================== */
  var BASE = document.body.getAttribute('data-base') || '/';
  var TRACK = {
    API: '',
    KAKAO: '',
    GUIDE: BASE + 'find/',
    INQUIRY: BASE + 'quote/',
    SITE: BASE,
    TEL: '1644-4762'
  };
  var STEPS = [
    ['상담', '요청하신 내용과 공간, 예산, 일정을 확인하고 제작 방향을 함께 정리하는 단계예요.'],
    ['디자인', '정리된 방향으로 디자인과 설계를 진행하는 단계예요.'],
    ['3D 시안 확인', '완성된 3D 시안을 확인하고 승인해 주시는 단계예요. 수정이 필요하면 알려 주세요.'],
    ['제작', '확정된 시안으로 제작을 진행하는 단계예요. 공정 사진을 계속 올려 드려요.'],
    ['운송', '완성된 작품을 안전하게 포장해 설치 장소로 옮기는 단계예요.'],
    ['설치', '현장에서 작품을 설치하고 마무리하는 단계예요.'],
    ['완료', '프로젝트가 마무리됐어요. 함께해 주셔서 감사합니다.']
  ];
  var MODEL_VIEWER = 'https://unpkg.com/@google/model-viewer@3.5.0/dist/model-viewer.min.js';

  /* ---------- 샘플(DEMO) 화면: 단계별로 어떻게 보이는지 보여 주기 위한 것입니다. 실제 서비스에서는 쓰이지 않습니다 ---------- */
  function art(kind) {
    var V = '#6458B1', D = '#5443A3', S = '<path d="M262 352C214 270 238 152 322 140C406 128 440 232 394 352Z"';
    var hole = '<circle cx="322" cy="228" r="34" fill="#F3F1F6"/>', floor = '<rect y="352" width="640" height="128" fill="#E6E2EE"/><ellipse cx="328" cy="356" rx="110" ry="12" fill="#00000018"/>';
    var bg = '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7F5FA"/><stop offset="1" stop-color="#E9E5F0"/></linearGradient><linearGradient id="p" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8A7DD6"/><stop offset="1" stop-color="' + D + '"/></linearGradient></defs><rect width="640" height="480" fill="url(#g)"/>';
    var body = '';
    if (kind === 'wire') body = '<g stroke="#AB94D1" stroke-width="1" opacity=".6">' + [100, 160, 220, 280, 340, 400, 460, 520].map(function (x) { return '<path d="M' + x + ' 80V400"/>'; }).join('') + [120, 180, 240, 300, 360].map(function (y) { return '<path d="M60 ' + y + 'H580"/>'; }).join('') + '</g>' + S + ' fill="none" stroke="' + V + '" stroke-width="3" stroke-dasharray="8 6"/><circle cx="322" cy="228" r="34" fill="none" stroke="' + V + '" stroke-width="3" stroke-dasharray="8 6"/>';
    else if (kind === 'mold') body = floor + '<rect x="196" y="120" width="130" height="232" rx="10" fill="#8E97A5"/><rect x="330" y="120" width="130" height="232" rx="10" fill="#B4BBC7"/><path d="M262 352C230 290 250 200 322 190C390 182 414 270 394 352Z" fill="#6E7685"/><rect x="190" y="104" width="276" height="18" rx="6" fill="#5E6573"/>';
    else if (kind === 'layup') body = floor + S + ' fill="#E9E3D2"/>' + hole + '<g stroke="#C9BFA2" stroke-width="2"><path d="M270 300L380 170M262 260L350 150M290 340L398 230M310 330L410 300"/></g><rect x="420" y="290" width="26" height="100" rx="8" fill="#DDAA6C" transform="rotate(24 433 340)"/>';
    else if (kind === 'sand') body = floor + S + ' fill="#F1EEF5" stroke="#CFCADB" stroke-width="2"/>' + hole + [[300, 180], [350, 200], [280, 270], [372, 290], [330, 330], [420, 250], [250, 330]].map(function (c) { return '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="3" fill="#C9C3D8"/>'; }).join('');
    else if (kind === 'paint') body = floor + S + ' fill="url(#p)"/>' + hole + '<path d="M290 190C300 160 330 150 350 154" stroke="#fff" stroke-width="7" stroke-linecap="round" fill="none" opacity=".45"/><path d="M470 150L430 190M480 190L440 214M474 232L436 238" stroke="#A1D239" stroke-width="4" stroke-linecap="round" opacity=".9"/>';
    else if (kind === 'pack') body = floor + '<rect x="190" y="110" width="280" height="242" rx="6" fill="#C9A675"/><rect x="190" y="110" width="280" height="242" rx="6" fill="none" stroke="#9C7C4E" stroke-width="3"/><rect x="316" y="110" width="28" height="242" fill="#E8D9BC"/><rect x="214" y="150" width="86" height="44" rx="3" fill="#fff"/><text x="257" y="178" text-anchor="middle" font-family="Arial" font-weight="700" font-size="16" fill="#C8323C">FRAGILE</text><path d="M214 320H300M214 304H280" stroke="#9C7C4E" stroke-width="3"/>';
    else if (kind === 'truck') body = '<rect y="352" width="640" height="128" fill="#D5D0DF"/><path d="M0 420H640" stroke="#fff" stroke-width="4" stroke-dasharray="26 22"/><rect x="110" y="170" width="290" height="170" rx="8" fill="#fff" stroke="#111" stroke-width="3"/><rect x="404" y="214" width="110" height="126" rx="10" fill="' + V + '"/><rect x="430" y="232" width="62" height="42" rx="4" fill="#E6E2EE"/><rect x="190" y="206" width="130" height="100" rx="6" fill="#C9A675"/><circle cx="190" cy="346" r="26" fill="#111"/><circle cx="190" cy="346" r="10" fill="#9A97A8"/><circle cx="450" cy="346" r="26" fill="#111"/><circle cx="450" cy="346" r="10" fill="#9A97A8"/>';
    else if (kind === 'site' || kind === 'done') {
      body = '<rect width="640" height="352" fill="#EDEAF2"/><rect x="40" y="70" width="560" height="230" fill="#F8F7FA"/>' + floor + '<rect x="212" y="338" width="230" height="16" rx="4" fill="#3E3065"/>';
      if (kind === 'site') body += S + ' fill="url(#p)"/>' + hole + '<g stroke="#111" stroke-width="3" fill="none"><path d="M180 120V352M470 120V352M180 150H470M180 250H470"/></g><path d="M430 330L470 290" stroke="#A1D239" stroke-width="5"/>';
      else body += '<path d="M200 70L440 70L520 352L120 352Z" fill="#FFF7D6" opacity=".35"/>' + S + ' fill="url(#p)"/>' + hole + '<path d="M290 190C300 160 330 150 350 154" stroke="#fff" stroke-width="7" stroke-linecap="round" fill="none" opacity=".5"/><g fill="#A1D239"><path d="M462 140l5 12 12 5-12 5-5 12-5-12-12-5 12-5z"/><path d="M190 180l3 8 8 3-8 3-3 8-3-8-8-3 8-3z"/></g>';
    }
    return bg + body;
  }
  function artURL(kind, cap) {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">' + art(kind) + '<rect x="16" y="16" width="190" height="30" rx="15" fill="#111"/><text x="111" y="36" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="14" fill="#fff">SAMPLE · ' + cap + '</text></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }
  var DEMO_KEYS = [['DEMO', '시안 확인'], ['DEMOMAKE', '제작'], ['DEMOSHIP', '운송'], ['DEMOINSTALL', '설치'], ['DEMODONE', '완료']];
  function demoData(key) {
    var all = [
      { at: 0, date: '2026-09-28', stage: '상담', title: '현장 실측과 방향 확정', memo: '현장 실측을 마치고 소재는 FRP + 도장으로 정했어요.', photos: [] },
      { at: 0, date: '2026-10-05', stage: '디자인', title: '디자인 1차 시안 전달', memo: '로비 중앙 기둥에 맞춘 비례로 높이 2.4m 안으로 정리했어요.', photos: [artURL('wire', '디자인')] },
      { at: 0, date: '2026-10-12', stage: '3D 시안 확인', title: '3D 시안이 준비됐어요', memo: '아래 3D 화면에서 마우스나 손가락으로 돌려 보실 수 있어요.\n확인 후 승인 또는 수정 요청을 눌러 주세요.', photos: [] },
      { at: 1, date: '2026-10-16', stage: '3D 시안 확인', title: '시안 승인 완료', memo: '확정된 시안으로 제작을 시작합니다.', photos: [] },
      { at: 1, date: '2026-10-19', stage: '제작', title: '원형 · 몰드 제작', memo: '확정 시안으로 원형을 깎고 몰드를 떴어요.', photos: [artURL('mold', '몰드 제작')] },
      { at: 1, date: '2026-10-23', stage: '제작', title: 'FRP 적층', memo: '유리섬유와 수지를 겹겹이 쌓는 중이에요. 두께는 설계값 6mm로 맞췄어요.', photos: [artURL('layup', 'FRP 적층')] },
      { at: 1, date: '2026-10-28', stage: '제작', title: '샌딩 · 퍼티 작업', memo: '표면을 매끈하게 다듬고 있어요. 다음 주 도장에 들어가요.', photos: [artURL('sand', '샌딩')] },
      { at: 2, date: '2026-11-05', stage: '제작', title: '도장 완료', memo: '시안 색(딥 바이올렛)으로 도장을 마쳤어요. 색 확인용 사진이에요.', photos: [artURL('paint', '도장 완료')] },
      { at: 2, date: '2026-11-12', stage: '운송', title: '포장 완료', memo: '충격 방지재로 감싸 나무 틀에 고정했어요.', photos: [artURL('pack', '포장')] },
      { at: 2, date: '2026-11-18', stage: '운송', title: '현장으로 출발했어요', memo: '전용 차량으로 이동 중이에요. 내일 오전 현장에 도착합니다.', photos: [artURL('truck', '운송')] },
      { at: 3, date: '2026-11-20', stage: '설치', title: '현장 도착 · 설치 시작', memo: '로비 바닥 기초 위치를 확인하고 작품을 올렸어요.', photos: [artURL('site', '설치 중')] },
      { at: 4, date: '2026-11-22', stage: '완료', title: '설치 완료', memo: '현장 검수까지 마쳤어요. 프로젝트가 완료됐어요.', photos: [artURL('done', '설치 완료')] }
    ];
    var lv = Math.max(0, DEMO_KEYS.map(function (k) { return k[0]; }).indexOf(key));
    var info = [
      { stage: '3D 시안 확인', progress: '', next: '시안 승인 후 바로 제작에 들어가요' },
      { stage: '제작', progress: 70, next: '11/05 도장 작업 시작' },
      { stage: '운송', progress: 60, next: '11/19 오전 현장 도착 예정' },
      { stage: '설치', progress: 80, next: '11/22 설치 마무리 · 현장 검수' },
      { stage: '완료', progress: '', next: '' }
    ][lv];
    return {
      ok: true, demo: true, demoKey: key,
      project: { code: key, name: '○○ 호텔 로비 상징 조형물', client: '○○호텔 마케팅팀', stage: info.stage, eta: '2026-11-22', manager: '김마롱 매니저', model: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb', progress: info.progress, next: info.next },
      log: all.filter(function (x) { return x.at <= lv; }).reverse()   /* 최신 기록이 위로 */
    };
  }

  var demoMode = false;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function okLink(u) { return /^https?:\/\/[^\s"'<>]+$/i.test(u) ? u : ''; }
  function imgURL(u) {
    u = String(u || '').trim(); if (!u) return '';
    var m = /drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:[^#]*&)?id=|thumbnail\?(?:[^#]*&)?id=)([\w-]{20,})/.exec(u);
    if (m) return 'https://lh3.googleusercontent.com/d/' + m[1] + '=w1600';
    if (demoMode && /^data:image\/svg\+xml;charset=utf-8,%3Csvg/.test(u)) return u;
    if (/^https?:\/\//i.test(u)) return okLink(u);
    if (/^[a-z][a-z0-9+.-]*:/i.test(u) || u.slice(0, 2) === '//' || /["'<>\s]/.test(u)) return '';
    return u;
  }
  function modelURL(u) { u = String(u || '').trim(); if (!u) return ''; if (/^https?:\/\//i.test(u)) return okLink(u); if (/^[a-z][a-z0-9+.-]*:/i.test(u) || u.slice(0, 2) === '//' || /["'<>\s]/.test(u)) return ''; return u; }
  function fmtDate(s) { var m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(String(s || '')); return m ? m[1] + '.' + ('0' + m[2]).slice(-2) + '.' + ('0' + m[3]).slice(-2) : esc(s || ''); }
  function toast(msg) { var t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast.h); toast.h = setTimeout(function () { t.classList.remove('on'); }, 3200); }
  function normCode(s) { return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
  function getCode() { return decodeURIComponent((location.hash || '').replace(/^#\/?/, '')).trim(); }

  /* ---------- 화면: 코드 입력 ---------- */
  function showFind(msg) {
    document.title = '프로젝트 진행 확인 | 마롱컴퍼니';
    $('#app').innerHTML = '<section class="find"><p class="cap">Project Tracking</p><h1>프로젝트 진행을<br>한눈에 확인하세요</h1><p>의뢰하신 프로젝트의 진행 단계, 3D 시안, 제작 과정 사진을 이곳에서 볼 수 있어요. 접수 시 안내드린 접수코드를 입력해 주세요.</p>' +
      '<form id="ff"><input id="fc" type="text" inputmode="latin" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="접수코드" aria-label="접수코드"><button class="btn" type="submit">확인하기</button></form>' +
      (msg ? '<div class="err" role="alert">' + esc(msg) + '</div>' : '') +
      '<p class="help">접수코드를 모르시거나 확인이 안 되면 담당자에게 문의해 주세요.<br>대표전화 ' + esc(TRACK.TEL) + '</p></section>';
    $('#ff').addEventListener('submit', function (e) { e.preventDefault(); var v = $('#fc').value.trim(); if (v) { if (getCode() === v) route(); else location.hash = '#' + encodeURIComponent(v); } });
    var i = $('#fc'); if (i && !msg) i.focus();
  }
  function showLoad() { $('#app').innerHTML = '<div class="load" role="status">불러오는 중이에요…</div>'; }

  /* ---------- 화면: 프로젝트 ---------- */
  function stepIndex(name) { var n = String(name || '').trim(); for (var i = 0; i < STEPS.length; i++) if (STEPS[i][0] === n) return i; return -1; }
  function show(d) {
    demoMode = !!d.demo;
    var p = d.project, si = stepIndex(p.stage), log = d.log || [];
    if (si < 0) si = 0;
    var done = si === STEPS.length - 1, approved = si > 2;
    document.title = (p.name || '프로젝트') + ' | 마롱컴퍼니';
    var steps = STEPS.map(function (s, i) { return '<li class="' + (i < si ? 'done' : i === si ? 'cur' : '') + '"' + (i === si ? ' aria-current="step"' : '') + '><span><em>' + ('0' + (i + 1)).slice(-2) + '</em>' + esc(s[0]) + '</span></li>'; }).join('');
    var meta = '';
    if (p.client) meta += '<span>의뢰<b>' + esc(p.client) + '</b></span>';
    if (p.eta) meta += '<span>' + (done ? '완료일' : '예상 완료') + '<b>' + fmtDate(p.eta) + '</b></span>';
    if (p.manager) meta += '<span>담당<b>' + esc(p.manager) + '</b></span>';

    /* 진행률 · 다음 일정 */
    var pr = parseInt(p.progress, 10), info = '';
    if (!done && pr >= 0 && pr <= 100) info += '<div class="ic"><span class="cap">' + esc(STEPS[si][0]) + ' 진행률</span><div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pr + '"><i style="width:' + pr + '%"></i></div><b>' + pr + '%</b></div>';
    if (!done && p.next) info += '<div class="ic"><span class="cap">다음 일정</span><b class="nx">' + esc(p.next) + '</b></div>';
    if (info) info = '<div class="tinfo">' + info + '</div>';

    /* 가장 최근 사진 */
    var lastPh = '', lr = null; log.some(function (r) { var u = (r.photos || []).map(imgURL).filter(Boolean)[0]; if (u) { lr = { u: u, r: r }; return true; } });
    if (lr && si >= 3) lastPh = '<section class="tsec"><div class="tsec-h"><h2>' + (done ? '완성된 모습' : '가장 최근 사진') + '</h2><span class="cap">' + fmtDate(lr.r.date) + '</span></div><button type="button" class="latest" data-lb="' + esc(lr.u) + '" aria-label="사진 크게 보기"><img src="' + esc(lr.u) + '" alt="" referrerpolicy="no-referrer"><span><b>' + esc(lr.r.title || lr.r.stage) + '</b>' + (lr.r.memo ? esc(lr.r.memo) : '') + '</span></button></section>';

    /* 완료 안내 */
    var fin = done ? '<section class="tsec"><div class="fin"><p class="cap">Completed</p><h2>프로젝트가 완료됐어요</h2><p>함께해 주셔서 감사합니다. 설치 후 사용하시면서 궁금한 점이나 보수가 필요한 부분이 생기면 언제든 알려 주세요. 담당자가 확인 후 안내드려요.</p><div class="row"><a class="btn sm" href="' + esc(TRACK.KAKAO || TRACK.INQUIRY) + '"' + (TRACK.KAKAO ? ' target="_blank" rel="noopener noreferrer"' : '') + '>A/S · 문의하기 ' + (TRACK.KAKAO ? '↗' : '→') + '</a><a class="btn sm ln" href="work/">비슷한 작품 보기</a><a class="btn sm ln" href="' + esc(TRACK.GUIDE) + '">새 프로젝트 견적 내보기</a></div></div></section>' : '';

    /* 3D */
    var model = modelURL(p.model), v3 = '';
    if (model) v3 = '<div class="v3d" id="v3d"><div class="hint">드래그해서 돌려 보고, 두 손가락(또는 휠)으로 확대할 수 있어요</div></div>';
    else v3 = '<div class="v3d tempty"><p>3D 시안이 준비되면 이곳에 표시돼요.</p></div>';
    var ask = si === 2 ? '<div class="ask"><div><h3>시안을 확인해 주세요</h3><p>3D 화면을 충분히 돌려 보신 뒤 알려 주세요. 버튼을 누르면 내용이 복사되고 담당자와 채팅할 수 있는 창이 열려요.</p></div><div class="row"><button class="btn sm" type="button" data-ask="ok">시안 승인할게요</button><button class="btn sm ln" type="button" data-ask="rev">수정 요청할게요</button></div></div>' : '';
    var sec3d = '<section class="tsec"><div class="tsec-h"><h2>' + (approved ? '확정 3D 시안' : '3D 시안') + '</h2>' + (approved ? '<span class="tag">승인 완료</span>' : '<span class="cap">3D Model</span>') + '</div>' + v3 + ask + '</section>';

    /* 기록 */
    var tl = log.length ? log.map(function (r) {
      var ph = (r.photos || []).map(imgURL).filter(Boolean).map(function (u) { return '<button type="button" data-lb="' + esc(u) + '" aria-label="사진 크게 보기"><img src="' + esc(u) + '" alt="" loading="lazy" referrerpolicy="no-referrer"></button>'; }).join('');
      return '<li><div class="d">' + fmtDate(r.date) + (r.stage ? '<small>' + esc(r.stage) + '</small>' : '') + '</div><div><h3>' + esc(r.title || r.stage || '진행 기록') + '</h3>' + (r.memo ? '<p>' + esc(r.memo) + '</p>' : '') + (ph ? '<div class="tph">' + ph + '</div>' : '') + '</div></li>';
    }).join('') : '<li class="empty-tl">아직 올라온 기록이 없어요. 진행 상황이 생기면 이곳에 차례로 쌓여요.</li>';
    var secLog = '<section class="tsec"><div class="tsec-h"><h2>진행 기록</h2><span class="cap">' + log.length + ' updates</span></div><ol class="tl">' + tl + '</ol></section>';

    var demoBar = d.demo ? '<div class="demo"><span class="cap">Sample</span><span>샘플 단계 보기</span>' + DEMO_KEYS.map(function (k) { return '<button type="button" data-demo="' + k[0] + '"' + (k[0] === d.demoKey ? ' aria-pressed="true"' : '') + '>' + k[1] + '</button>'; }).join('') + '</div>' : '';

    $('#app').innerHTML = demoBar + '<div class="wrap"><section class="head"><div><p class="cap">Project · ' + (d.demo ? 'SAMPLE' : esc(p.code)) + '</p><h1>' + esc(p.name || '프로젝트') + '</h1><div class="meta">' + meta + '</div></div>' +
      '<div><p class="now' + (done ? ' done' : '') + '"><i></i>' + (done ? '완료' : '현재 단계 · ' + esc(STEPS[si][0])) + '</p></div>' +
      '<div><ol class="tsteps" aria-label="진행 단계">' + steps + '</ol><p class="steps-m">' + (si + 1) + ' / ' + STEPS.length + ' · ' + esc(STEPS[si][0]) + '</p><p class="stepdesc"><b>' + esc(STEPS[si][0]) + '</b> · ' + esc(STEPS[si][1]) + '</p>' + info + '</div></section>' +
      (si >= 3 ? fin + lastPh + secLog + sec3d : sec3d + secLog) +
      '<footer class="tfoot"><span><b>궁금한 점이 있으세요?</b><br>담당자 또는 대표전화 ' + esc(TRACK.TEL) + '로 편하게 문의해 주세요.</span><a class="btn ln sm" href="' + esc(TRACK.KAKAO || TRACK.INQUIRY) + '"' + (TRACK.KAKAO ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + (TRACK.KAKAO ? '카카오톡으로 문의 ↗' : '문의하기 →') + '</a></footer></div>';
    if (model) loadViewer(model, p.name);
    $('#app').onclick = function (e) {
      var a = e.target.closest('[data-ask]'); if (a) { askTeam(a.getAttribute('data-ask'), p); return; }
      var dm = e.target.closest('[data-demo]'); if (dm) { location.hash = '#' + dm.getAttribute('data-demo'); window.scrollTo(0, 0); return; }
      var l = e.target.closest('[data-lb]'); if (l) { lightbox(l.getAttribute('data-lb')); }
    };
  }

  /* ---------- 3D ---------- */
  function sfId(s) { s = String(s || '').trim(); var m = /^[0-9a-f]{32}$/i.exec(s) || (/sketchfab\.com\//i.test(s) && /([0-9a-f]{32})(?![0-9a-f])/i.exec(s)); return m ? (m[1] || m[0]).toLowerCase() : ''; }
  var viewerLoading = null;
  function loadViewer(src, name) {
    var box = $('#v3d'); if (!box) return;
    var sf = sfId(src);
    if (sf) {
      box.innerHTML = '<iframe title="' + esc((name || '프로젝트') + ' 3D 시안') + '" src="https://sketchfab.com/models/' + sf + '/embed?autostart=1&preload=1&dnt=1&ui_infos=0&ui_hint=2" allow="autoplay; fullscreen; xr-spatial-tracking" allowfullscreen loading="eager"></iframe><p class="sfc">3D viewer by <a href="https://sketchfab.com/models/' + sf + '" target="_blank" rel="noopener noreferrer">Sketchfab</a></p>';
      return;
    }
    function build() {
      if (!$('#v3d')) return;
      var mv = document.createElement('model-viewer');
      mv.setAttribute('src', src); mv.setAttribute('alt', (name || '프로젝트') + ' 3D 시안');
      mv.setAttribute('camera-controls', ''); mv.setAttribute('touch-action', 'pan-y'); mv.setAttribute('auto-rotate', ''); mv.setAttribute('shadow-intensity', '1'); mv.setAttribute('ar', ''); mv.setAttribute('ar-modes', 'webxr scene-viewer quick-look'); mv.setAttribute('loading', 'eager');
      box.insertBefore(mv, box.firstChild);
      var tools = document.createElement('div'); tools.className = 'tools';
      tools.innerHTML = '<button type="button" data-t="rot">회전 멈춤</button><button type="button" data-t="full">크게 보기</button>';
      box.appendChild(tools);
      tools.addEventListener('click', function (e) {
        var b = e.target.closest('[data-t]'); if (!b) return;
        if (b.getAttribute('data-t') === 'rot') { var on = mv.hasAttribute('auto-rotate'); if (on) mv.removeAttribute('auto-rotate'); else mv.setAttribute('auto-rotate', ''); b.textContent = on ? '자동 회전' : '회전 멈춤'; }
        else { var f = box.classList.toggle('full'); b.textContent = f ? '닫기' : '크게 보기'; document.body.style.overflow = f ? 'hidden' : ''; }
      });
      mv.addEventListener('error', function () { fail(); });
    }
    function fail() {
      var b = $('#v3d'); if (!b) return;
      b.className = 'v3d tempty'; b.innerHTML = '<p>3D 화면을 불러오지 못했어요.<br>잠시 후 새로고침해 보시고, 계속 안 보이면 담당자에게 알려 주세요.</p>';
    }
    if (window.customElements && customElements.get('model-viewer')) { build(); return; }
    if (!viewerLoading) viewerLoading = new Promise(function (ok, no) { var s = document.createElement('script'); s.type = 'module'; s.src = MODEL_VIEWER; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
    viewerLoading.then(build, fail);
  }

  /* ---------- 승인 · 수정 요청 ---------- */
  function askTeam(kind, p) {
    var head = '[' + (p.name || '프로젝트') + ' · ' + p.code + '] ';
    var text = kind === 'ok' ? head + '3D 시안을 확인했고, 이대로 진행해 주세요.' : head + '3D 시안 수정을 요청드립니다.\n수정하고 싶은 부분: ';
    function after() { toast((TRACK.KAKAO ? '내용을 복사했어요. 열린 채팅창에 붙여 넣어 주세요.' : '내용을 복사했어요. 담당자에게 전달해 주세요.')); if (TRACK.KAKAO) window.open(TRACK.KAKAO, '_blank', 'noopener'); }
    try { navigator.clipboard.writeText(text).then(after, function () { toast('자동 복사가 안 됐어요. 담당자에게 직접 알려 주세요.'); }); } catch (e) { toast('자동 복사가 안 됐어요. 담당자에게 직접 알려 주세요.'); }
  }
  function lightbox(u) {
    var d = document.createElement('div'); d.className = 'trk-lb'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
    d.innerHTML = '<img src="' + esc(u) + '" alt="" referrerpolicy="no-referrer"><button type="button">닫기</button>';
    function close() { d.remove(); document.removeEventListener('keydown', key); }
    function key(e) { if (e.key === 'Escape') close(); }
    d.addEventListener('click', close); document.addEventListener('keydown', key); document.body.appendChild(d);
  }

  /* ---------- 가져오기 ---------- */
  function fetchJSON(url) {
    return new Promise(function (ok, no) {
      var ac = window.AbortController ? new AbortController() : null, to = setTimeout(function () { if (ac) ac.abort(); no(new Error('timeout')); }, 15000);
      fetch(url, ac ? { signal: ac.signal } : {}).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (j) { clearTimeout(to); ok(j); }, function (e) { clearTimeout(to); no(e); });
    });
  }
  var token = 0;
  function route() {
    var code = getCode(), my = ++token;
    if (!code) { showFind(); return; }
    showLoad();
    var job;
    var dk = DEMO_KEYS.filter(function (k) { return k[0] === normCode(code); })[0];
    if (dk && (!TRACK.API || /^DEMO/.test(normCode(code)))) job = Promise.resolve(demoData(dk[0]));
    else if (!TRACK.API) job = Promise.resolve({ ok: false, error: 'notfound' });
    else job = fetchJSON(TRACK.API + (TRACK.API.indexOf('?') > -1 ? '&' : '?') + 'code=' + encodeURIComponent(code));
    job.then(function (d) {
      if (my !== token) return;
      if (d && d.ok && d.project) show(d);
      else if (d && d.error === 'busy') showFind('지금 접속이 많아요. 잠시 후 다시 시도해 주세요.');
      else showFind('접수코드를 찾을 수 없어요. 코드를 다시 확인해 주세요.');
    }, function () {
      if (my !== token) return;
      $('#app').innerHTML = '<section class="find"><p class="cap">Project Tracking</p><h1>연결이 원활하지 않아요</h1><p>잠시 후 다시 시도해 주세요. 계속 안 되면 담당자에게 알려 주세요.</p><form id="rt"><button class="btn" type="submit">다시 시도</button></form></section>';
      $('#rt').addEventListener('submit', function (e) { e.preventDefault(); route(); });
    });
  }
  window.addEventListener('hashchange', route);

  route();
})();
