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

/* 작품 한 건 (data/works/<id>.json) → 엔진용 객체. 사진 처리는 img(경로, 용도) 가 맡습니다. */
export function normWork(r, matIds) {
  if (!r || !isOn(r.show === undefined ? true : r.show)) return null;
  var pid = S(r.id), name = S(r.name);
  var mats = L(r.materials).map(function (x) { return S(x).toLowerCase(); }).filter(function (x, i, a) { return matIds.indexOf(x) > -1 && a.indexOf(x) === i; });
  if (!pid || !name || !mats.length) return null;
  var tags = L(r.tags).map(S).filter(Boolean).filter(function (x, i, a) { return a.indexOf(x) === i; });
  var yr = S(r.year);
  return {
    pid: pid, name: name, mats: mats, cat: S(r.category), catLabel: S(r.category), year: /^\d{4}$/.test(yr) ? yr : '',
    region: S(r.region), client: S(r.client), tags: tags, desc: S(r.desc), alt: S(r.alt),
    seoTitle: S(r.seo_title), seoDesc: S(r.seo_description),
    _image: S(r.image), _gallery: L(r.gallery).map(function (g) { return { image: S(g && g.image), alt: S(g && g.alt) }; }).filter(function (g) { return g.image; })
  };
}
