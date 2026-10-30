/* 작품 필터 · 검색 · 정렬 — 빌드(Astro)와 브라우저에서 같은 코드를 씁니다. */
import { TYPES, PURPOSES, REGIONS, KEYWORDS } from './normalize.js';

var ORDER = { u: TYPES, c: PURPOSES, r: REGIONS, k: KEYWORDS };   // 유형 · 목적 · 지역 · 키워드는 템플릿에 적힌 순서대로 보여 줍니다

export var GROUPS = ['u', 'c', 'r', 'k', 'y', 't'];   // 유형 · 목적 · 지역 · 키워드 · 연도 · 태그
export var PAGE = 24;

export function emptyState() { return { u: [], c: [], r: [], k: [], y: [], t: [], q: '', sort: 'rec' }; }

export function norm(s) { return String(s == null ? '' : s).toLowerCase().replace(/\s+/g, ' ').trim(); }

/* 주소 ?c=공공미술&y=2024&t=LED&q=포토존 → 상태 */
export function parseQuery(search) {
  var st = emptyState(), sp = new URLSearchParams(search || '');
  GROUPS.forEach(function (g) {
    sp.getAll(g).forEach(function (v) { v = String(v).trim(); if (v && st[g].indexOf(v) < 0) st[g].push(v); });
  });
  st.q = (sp.get('q') || '').slice(0, 80);
  var s = sp.get('sort'); if (s === 'new' || s === 'name') st.sort = s;
  return st;
}
export function toQuery(st) {
  var sp = new URLSearchParams();
  GROUPS.forEach(function (g) { st[g].forEach(function (v) { sp.append(g, v); }); });
  if (st.q) sp.set('q', st.q);
  if (st.sort && st.sort !== 'rec') sp.set('sort', st.sort);
  var s = sp.toString();
  return s ? '?' + s : '';
}
export function isFiltered(st) { return !!(st.q || GROUPS.some(function (g) { return st[g].length; })); }

/* 한 작품이 선택 조건에 맞는지. skip 으로 한 그룹을 빼고 따질 수 있습니다(패싯 개수 계산용) */
export function matches(w, st, skip) {
  if (st.q && skip !== 'q') {
    var h = w.q || '';
    var toks = norm(st.q).split(' ');
    for (var i = 0; i < toks.length; i++) if (toks[i] && h.indexOf(toks[i]) < 0) return false;
  }
  if (skip !== 'y' && st.y.length && st.y.indexOf(String(w.y)) < 0) return false;
  /* 유형 · 목적 · 지역 · 키워드 · 태그는 한 작품이 여러 값을 가질 수 있어, 하나라도 겹치면 통과 */
  var MULTI = ['u', 'c', 'r', 'k', 't'];
  for (var g = 0; g < MULTI.length; g++) {
    var key = MULTI[g];
    if (skip === key || !st[key].length) continue;
    if (!(w[key] || []).some(function (v) { return st[key].indexOf(v) > -1; })) return false;
  }
  return true;
}

export function sortList(list, sort) {
  var a = list.slice();
  if (sort === 'new') a.sort(function (x, y) { return (parseInt(y.y, 10) || 0) - (parseInt(x.y, 10) || 0) || (parseInt(y.p, 10) || 0) - (parseInt(x.p, 10) || 0); });
  else if (sort === 'name') a.sort(function (x, y) { return x.n.localeCompare(y.n, 'ko'); });
  else a.sort(function (x, y) { return x.o - y.o; });
  return a;
}

export function applyFilters(base, st) {
  return sortList(base.filter(function (w) { return matches(w, st); }), st.sort);
}

/* 패싯: 다른 그룹의 선택은 반영하고, 자기 그룹의 선택은 빼고 센 개수 (OR 안, AND 밖) */
export function facetsOf(base, st) {
  var out = {};
  GROUPS.forEach(function (g) {
    var cnt = {}, order = [];
    base.forEach(function (w) {
      if (!matches(w, st, g)) return;
      var vals = g === 'y' ? [String(w.y || '')] : (w[g] || []);
      vals.forEach(function (v) { if (!v) return; if (!(v in cnt)) { cnt[v] = 0; order.push(v); } cnt[v]++; });
    });
    /* 선택된 값은 개수가 0이어도 남겨 둡니다 */
    st[g].forEach(function (v) { if (!(v in cnt)) { cnt[v] = 0; order.push(v); } });
    var items = order.map(function (v) { return { v: v, l: v, n: cnt[v] }; });
    if (g === 'y') items.sort(function (a, b) { return (parseInt(b.v, 10) || 0) - (parseInt(a.v, 10) || 0); });
    else if (ORDER[g]) items.sort(function (a, b) { var x = ORDER[g].indexOf(a.v), y = ORDER[g].indexOf(b.v); return (x < 0 ? 99 : x) - (y < 0 ? 99 : y); });
    else if (g === 't') items.sort(function (a, b) { return b.n - a.n || a.v.localeCompare(b.v, 'ko'); });
    else items.sort(function (a, b) { return b.n - a.n || a.v.localeCompare(b.v, 'ko'); });
    out[g] = items;
  });
  return out;
}

/* 검색용 문자열 (빌드 때 한 번 만들어 인덱스에 넣습니다) */
export function haystack(w, matNames) {
  return norm([w.name, w.pid, (w.purposes || []).join(' '), w.year, (w.regions || []).join(' '), w.client, (w.tags || []).join(' '), (w.keywords || []).join(' '), (w.types || []).join(' '), matNames.join(' ')].join(' '));
}
