/* data/*.json → 화면 그리기 엔진이 쓰는 모양으로 바꿉니다. (브라우저·Node 어디서나 같은 결과)
   이전 사이트(index.html)의 apply* 함수를 옮겨 온 것입니다. */

export function S(v) { return v == null ? '' : String(v).replace(/\r/g, '').trim(); }
export function L(v) { return Array.isArray(v) ? v : []; }
export function pad2(v) { v = S(v); return /^\d$/.test(v) ? '0' + v : v; }
export function okLink(u) { return /^https?:\/\/[^\s"'<>]+$/i.test(u) ? u : ''; }
export function isOn(v) { return !(v === false || /^(n|no|false|0|off|숨김|아니오)$/i.test(S(v))); }
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

/* 소재 */
export function normMats(j, img) {
  var out = [];
  L(j && j.items).forEach(function (r) {
    var id = S(r.id).toLowerCase(); if (!id || out.some(function (m) { return m.id === id; })) return;
    var ly = L(r.layers).filter(function (x) { return x && S(x.name); }).slice(0, 4).map(function (x) {
      var cl = S(x.color); cl = cl && cl[0] !== '#' ? '#' + cl : cl;
      return [S(x.name), S(x.desc), /^#[0-9a-f]{6}$/i.test(cl) ? cl : '#8E97A5'];
    });
    var im = img ? img(r.image) : null;
    out.push({
      id: id, no: pad2(r.no), en: S(r.en), kr: S(r.kr), tag: S(r.tag),
      img: im ? im.src : '',
      specs: [['설치', S(r.install)], ['비용', S(r.cost)], ['기간', S(r.period)]],
      pts: L(r.points).map(S).filter(Boolean).slice(0, 3),
      steps: L(r.steps).map(S).filter(Boolean).slice(0, 4),
      layers: ly.length ? ly : [['', '', '#8E97A5']]
    });
  });
  return out;
}

/* 홈 */
export function normHome(j, validPid, img) {
  var H = { eyebrow: '', title: '', sub: '', hero: [], heroMs: 6000, n: 12, end: '', biz: [], clients: [], certs: '' };
  if (!j) return H;
  H.eyebrow = S(j.eyebrow);
  H.title = esc(S(j.title)).replace(/\n/g, '<br>');
  H.sub = S(j.sub);
  L(j.hero).forEach(function (h) {
    var pid = S(h && h.work);
    if (pid && validPid(pid) && H.hero.length < 6) { var im = img ? img(h.image) : null; H.hero.push({ pid: pid, img: im ? im.src : '' }); }
  });
  var n = parseInt(j.latest_count, 10); if (n >= 3) H.n = Math.min(n, 40);
  var s = parseFloat(j.interval_sec); if (s >= 2) H.heroMs = Math.min(s, 60) * 1000;
  H.end = S(j.end);
  H.biz = L(j.biz).filter(function (b) { return b && S(b.title); }).map(function (b) { return [S(b.title), S(b.desc), S(b.page)]; });
  H.clients = L(j.clients).map(function (c) { return S(c && c.name != null ? c.name : c); }).filter(Boolean);
  H.certs = S(j.certs);
  return H;
}

/* 회사 소개 */
export function normAbout(j, img) {
  var A = { who: { lead: '', short: '', text: [], values: [], img: '' }, base: '', areas: [], contents: [], promise: [], howLead: '', how: [], flow: [], matText: '', record: [], recordNote: '', history: [], contact: [] };
  if (!j) return A;
  function rows(arr, keys) { return L(arr).map(function (x) { return keys.map(function (k) { return S(x && x[k]); }); }).filter(function (x) { return x[0]; }); }
  A.who.lead = S(j.lead); A.who.short = S(j.short);
  A.who.text = L(j.paragraphs).map(S).filter(Boolean);
  var ph = img ? img(j.photo) : null; A.who.img = ph ? ph.src : '';
  A.who.values = rows(j.values, ['name', 'desc']);
  A.base = S(j.link_base);
  A.areas = rows(j.areas, ['name', 'desc', 'link']);
  A.contents = rows(j.contents, ['name', 'desc']);
  A.promise = rows(j.promises, ['name', 'desc']);
  A.howLead = S(j.how_lead);
  A.how = rows(j.how_steps, ['name', 'desc', 'image']).map(function (x) { var im = img ? img(x[2]) : null; return [x[0], x[1], im ? im.src : '']; });
  A.flow = rows(j.review_steps, ['name', 'desc']);
  A.matText = S(j.mat_text);
  A.record = rows(j.record, ['value', 'label']);
  A.recordNote = S(j.record_note);
  var ys = {}, keys = [];
  L(j.history).forEach(function (x) { var y = S(x && x.year), t = S(x && x.text); if (!y || !t) return; if (!ys[y]) { ys[y] = []; keys.push(y); } ys[y].push([pad2(x.month), t]); });
  keys.sort(function (a, b) { return (parseInt(a, 10) || 0) - (parseInt(b, 10) || 0); });
  A.history = keys.map(function (y) { return [y, ys[y].sort(function (p, q) { return p[0] < q[0] ? -1 : p[0] > q[0] ? 1 : 0; })]; });
  A.contact = rows(j.contact, ['label', 'value']);
  return A;
}

/* 사업분야 · 전시 이력 */
export function normBiz(j) {
  var out = { BD: j || null, STANDS_URL: '#', EXH: { areas: [], hist: [] } };
  if (!j) return out;
  var u = S(j.stands_url); if (okLink(u)) out.STANDS_URL = u;
  var ex = j.exhibit || {};
  out.EXH.areas = L(ex.areas).map(S).filter(Boolean);
  out.EXH.hist = L(ex.history).map(function (y) {
    return [S(y && y.year), L(y && y.items).map(function (e) { return [S(e && e.kind), S(e && e.text)]; }).filter(function (e) { return e[1]; })];
  }).filter(function (y) { return y[0] && y[1].length; });
  return out;
}

/* 설정 */
export function normSettings(j) {
  j = j || {};
  var rl = S(j.recruit_link);
  return {
    kakao: okLink(S(j.kakao_url)),
    portfolio: okLink(S(j.portfolio_link)) || 'https://www.malongcompany.co.kr/sub/portfolio/portfolio.php',
    recruit: okLink(rl) || /^mailto:[^\s"'<>]+$/i.test(rl) ? rl : 'mailto:admin@malong.co.kr',
    footer: L(j.footer).map(S).filter(Boolean),
    siteName: S(j.site_name) || '마롱컴퍼니',
    siteDescription: S(j.site_description) || '공공미술 · 건축미술 · 전시기획 · 조형물 제작. 기획부터 제작, 설치까지 마롱컴퍼니가 함께합니다.',
    ogImage: S(j.og_image)
  };
}

/* ---- 작품 분류 항목 (마케팅 아카이빙 템플릿 기준) ----
   관리 화면(.pages.yml)의 체크 항목과 글자가 똑같아야 합니다. 바꿀 때는 두 곳을 함께 고치세요. */
export var TYPES = ['그림', '금속', 'FRP', '스티로폼', 'EPS', '벽화', '미디어아트', '기타'];
export var REGIONS = ['서울', '경기, 인천', '부산', '강원', '경상, 대구', '전라, 광주', '충청, 대전, 세종', '제주'];
export var PURPOSES = ['주거단지', '공공 시설물', '기업·브랜드홍보', '호텔·레저·업무시설', '행사·전시·이벤트'];
export var KEYWORDS = ['건축미술', '포토존', '캐릭터', '글자'];
/* 유형 → 사이트의 6가지 소재(소재 페이지·소재 찾기) 연결. 연결이 없는 유형은 소재 페이지에 나오지 않습니다. */
var TYPE_MAT = { 'FRP': 'frp', '금속': 'metal', '스티로폼': 'eps', 'EPS': 'eps' };

function uniq(a) { return a.filter(function (x, i) { return x && a.indexOf(x) === i; }); }
function pick(v, allowed) { return uniq(L(v).map(S)).filter(function (x) { return allowed.indexOf(x) > -1; }); }

/* 사진 설명(alt) 자동 규칙: 프로젝트명-목적-키워드-01 (목적·키워드는 첫 번째로 고른 값, 비어 있으면 생략) */
export function altOf(name, purposes, keywords, n) {
  return [name, purposes[0], keywords[0], pad2(String(n))].filter(Boolean).join('-');
}

/* 작품 한 건 (data/works/<id>.json) → 엔진용 객체. 사진 처리는 img(경로, 용도) 가 맡습니다. */
export function normWork(r, matIds) {
  if (!r || !isOn(r.show === undefined ? true : r.show)) return null;
  var pid = S(r.id), name = S(r.name);
  if (!pid || !name) return null;
  var types = pick(r.types, TYPES), purposes = pick(r.purposes, PURPOSES), regions = pick(r.regions, REGIONS), keywords = pick(r.keywords, KEYWORDS);
  /* 소재 = 유형에서 이어진 소재 + (예전 데이터에 남아 있는) materials */
  var mats = uniq(types.map(function (t) { return TYPE_MAT[t]; }).concat(L(r.materials).map(function (x) { return S(x).toLowerCase(); }))).filter(function (x) { return matIds.indexOf(x) > -1; });
  var tags = uniq(L(r.tags).map(S));
  var yr = S(r.year);
  var gallery = L(r.gallery).map(function (g) { return { image: S(g && g.image), alt: S(g && g.alt) }; }).filter(function (g) { return g.image; }).slice(0, 4);
  return {
    pid: pid, name: name, mats: mats, types: types, purposes: purposes, regions: regions, keywords: keywords,
    year: /^\d{4}$/.test(yr) ? yr : '', client: S(r.client), tags: tags, desc: S(r.desc),
    alt: S(r.alt) || altOf(name, purposes, keywords, 1),
    seoTitle: S(r.seo_title), seoDesc: S(r.seo_description),
    _image: S(r.image),
    _gallery: gallery.map(function (g, k) { return { image: g.image, alt: g.alt || altOf(name, purposes, keywords, k + 2) }; })
  };
}
