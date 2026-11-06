/* 마롱컴퍼니 화면 그리기 모듈 — 빌드(Astro)와 브라우저에서 같이 씁니다.
   원래 index.html 안에 있던 그리기 코드를 data 를 받아 HTML 문자열을 돌려주는 형태로 옮긴 것입니다. */
import { STANDS_IMG } from './assets.js';

export function createEngine(ctx) {
  'use strict';
  var MATS = ctx.MATS || [], PORT = ctx.PORT || [], ABOUT = ctx.ABOUT || { areas: [], record: [], promise: [], contents: [], flow: [], how: [], history: [], contact: [], who: { text: [], values: [] } },
      HOME = ctx.HOME || {}, SET = ctx.settings || {}, EXH = ctx.EXH || { areas: [], hist: [] }, BD = ctx.BD || null, STANDS_URL = ctx.STANDS_URL || '#';
  var BASE = ctx.base || '/';
  function U(p) { return BASE + p; }
  var GUIDE_URL = U('find/'), QUOTE_URL = U('quote/');
  var state = { view: 'work', f: 'all' };

  var BG = ['#EFEBF6', '#F2EEE8', '#E8EDF1', '#EAF1EF', '#F3EBE9', '#EEEEF2'];
  function shade(hex, f) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    function c(v) { v = f < 0 ? v * (1 + f) : v + (255 - v) * f; return Math.max(0, Math.min(255, Math.round(v))); }
    return '#' + [c(r), c(g), c(b)].map(function (v) { return (v < 16 ? '0' : '') + v.toString(16); }).join('');
  }
  var OBJ = {
    frp: '<ellipse cx="100" cy="168" rx="46" ry="8" fill="#000" opacity=".1"/><path d="M62 160 C58 112 74 88 100 88 C126 88 142 112 138 160 Z" fill="#B5543A"/><path d="M72 150 C70 118 80 100 92 96" stroke="#fff" stroke-opacity=".35" stroke-width="6" stroke-linecap="round" fill="none"/><circle cx="100" cy="66" r="26" fill="#E9D2BD"/><circle cx="91" cy="64" r="3" fill="#2a2430"/><circle cx="109" cy="64" r="3" fill="#2a2430"/><path d="M76 54 C80 36 120 36 124 54 C112 46 88 46 76 54Z" fill="#576EAB"/>',
    eps: '<ellipse cx="100" cy="172" rx="62" ry="9" fill="#000" opacity=".08"/><g><path d="M48 150 L82 134 L116 150 L82 166Z" fill="#FAFAF7"/><path d="M48 150 L82 166 L82 188 L48 172Z" fill="#E1DED5"/><path d="M82 166 L116 150 L116 172 L82 188Z" fill="#CFCBC0"/></g><g><path d="M84 112 L122 94 L160 112 L122 130Z" fill="#FAFAF7"/><path d="M84 112 L122 130 L122 154 L84 136Z" fill="#E1DED5"/><path d="M122 130 L160 112 L160 136 L122 154Z" fill="#CFCBC0"/></g><g><path d="M64 84 L92 70 L120 84 L92 98Z" fill="#fff"/><path d="M64 84 L92 98 L92 116 L64 102Z" fill="#E6E3DB"/><path d="M92 98 L120 84 L120 102 L92 116Z" fill="#D5D1C6"/></g>',
    metal: '<ellipse cx="100" cy="172" rx="58" ry="8" fill="#000" opacity=".1"/><defs><linearGradient id="mg" x1="0" x2="1"><stop offset="0" stop-color="#EAEDF1"/><stop offset=".5" stop-color="#B6BEC9"/><stop offset="1" stop-color="#DFE2E7"/></linearGradient></defs><path d="M54 70 L120 52 L150 66 L150 160 L84 178 L54 164Z" fill="url(#mg)"/><path d="M54 70 L84 84 L84 178 L54 164Z" fill="#9AA3B0"/><path d="M54 70 L120 52 L150 66 L84 84Z" fill="#F5F6F8"/><g stroke="#fff" stroke-opacity=".5" stroke-width="1">' + (function () { var s = ''; for (var i = 0; i < 12; i++) s += '<path d="M' + (86) + ' ' + (92 + i * 7) + ' L' + 148 + ' ' + (74 + i * 7) + '"/>'; return s; })() + '</g>',
    acrylic: '<ellipse cx="100" cy="172" rx="40" ry="8" fill="#000" opacity=".08"/><circle cx="100" cy="104" r="62" fill="#ACDAE1" opacity=".28"/><defs><linearGradient id="ag" x1="0" x2="1"><stop offset="0" stop-color="#9DD1D8"/><stop offset=".45" stop-color="#F5FBFC"/><stop offset="1" stop-color="#A6D0D7"/></linearGradient></defs><rect x="68" y="46" width="64" height="122" rx="10" fill="url(#ag)"/><ellipse cx="100" cy="46" rx="32" ry="8" fill="#F9FDFE"/><rect x="82" y="62" width="8" height="90" rx="4" fill="#fff" opacity=".7"/><circle cx="100" cy="106" r="16" fill="#EBD993" opacity=".9"/>',
    brass: '<ellipse cx="100" cy="172" rx="44" ry="8" fill="#000" opacity=".1"/><defs><linearGradient id="bg" x1="0" x2="1"><stop offset="0" stop-color="#DFCA96"/><stop offset=".5" stop-color="#B89550"/><stop offset="1" stop-color="#866836"/></linearGradient></defs><rect x="66" y="152" width="68" height="18" rx="3" fill="url(#bg)"/><path d="M78 152 C72 124 80 104 100 100 C120 104 128 124 122 152Z" fill="url(#bg)"/><circle cx="100" cy="78" r="20" fill="url(#bg)"/><path d="M86 118 C86 110 90 106 94 104" stroke="#fff" stroke-opacity=".4" stroke-width="5" stroke-linecap="round" fill="none"/>',
    print: '<ellipse cx="100" cy="172" rx="44" ry="7" fill="#000" opacity=".08"/><g fill="none" stroke="#4B4766" stroke-width="2.2"><circle cx="100" cy="104" r="58"/><ellipse cx="100" cy="104" rx="58" ry="22"/><ellipse cx="100" cy="104" rx="22" ry="58"/><ellipse cx="100" cy="104" rx="42" ry="58" transform="rotate(35 100 104)"/><ellipse cx="100" cy="104" rx="42" ry="58" transform="rotate(-35 100 104)"/><path d="M42 104 H158 M100 46 V162" opacity=".6"/></g><circle cx="100" cy="104" r="8" fill="#4E3F7A"/>'
  };
  function art(mat, seed, big, plain) {
    var bg = plain ? 'none' : BG[seed % BG.length];
    var x = big ? 0 : [-10, 8, 0, 12, -6][seed % 5], sc = big ? 1 : [0.86, 0.94, 0.8, 0.9][seed % 4], flip = (!big && seed % 2) ? -1 : 1;
    return '<svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid ' + (plain ? 'meet' : 'slice') + '" aria-hidden="true">' + (plain ? '' : '<rect width="200" height="200" fill="' + bg + '"/>') +
      '<g transform="translate(' + (100 + x) + ' 104) scale(' + (sc * flip) + ' ' + sc + ') translate(-100 -104)">' + OBJ[mat] + '</g></svg>';
  }
  function layerSVG(m) {
    var L = m.layers, n = L.length, a = 190, b = 76, t = 22, gap = 18;
    var cx = 230, y0 = 20, H = y0 + (n - 1) * (t + gap) + 2 * b + t + 36;
    var out = '<svg viewBox="0 0 520 ' + H + '" role="img" aria-label="' + esc(m.en) + ' 층 구조">';
    out += '<ellipse cx="' + cx + '" cy="' + (H - 22) + '" rx="' + (a * 0.92) + '" ry="14" fill="#000" opacity=".06"/>';
    for (var i = n - 1; i >= 0; i--) {
      var y = y0 + i * (t + gap), c = L[i][2];
      var T = [[cx, y], [cx + a, y + b], [cx, y + 2 * b], [cx - a, y + b]];
      out += '<path d="M' + T[3][0] + ' ' + T[3][1] + ' L' + T[2][0] + ' ' + T[2][1] + ' L' + T[2][0] + ' ' + (T[2][1] + t) + ' L' + T[3][0] + ' ' + (T[3][1] + t) + 'Z" fill="' + shade(c, -0.18) + '"/>' +
        '<path d="M' + T[2][0] + ' ' + T[2][1] + ' L' + T[1][0] + ' ' + T[1][1] + ' L' + T[1][0] + ' ' + (T[1][1] + t) + ' L' + T[2][0] + ' ' + (T[2][1] + t) + 'Z" fill="' + shade(c, -0.32) + '"/>' +
        '<path d="M' + T.map(function (p) { return p[0] + ' ' + p[1]; }).join(' L') + 'Z" fill="' + c + '"/>' +
        '<path d="M' + T[3][0] + ' ' + T[3][1] + ' L' + T[0][0] + ' ' + T[0][1] + ' L' + T[1][0] + ' ' + T[1][1] + '" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.2"/>';
      var ly = y + b + t / 2 + 4;
      out += '<path d="M' + (cx + a - 4) + ' ' + ly + ' H' + (cx + a + 26) + '" stroke="#111" stroke-width="1"/>' +
        '<text x="' + (cx + a + 34) + '" y="' + (ly + 4) + '" font-size="12" font-weight="800" fill="#111" font-family="Archivo, sans-serif" letter-spacing=".5">0' + (i + 1) + '</text>';
    }
    return out + '</svg>';
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function txt(c) { var n = parseInt(c.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; return (0.299 * r + 0.587 * g + 0.114 * b) > 165 ? '#111111' : '#FFFFFF'; }
  function two(n) { return (n < 10 ? '0' : '') + n; }
  var TONES = {frp:['#D9C3A5','#F1E7D6'],eps:['#E3CC8F','#F6EEDA'],metal:['#B7C4D2','#E4EAF0'],acrylic:['#A9BA9E','#E6E8DA'],brass:['#C8A97E','#F1E8DA'],print:['#B9AEDB','#ECE8F6']};
  function hsl(hex,dl,ds){var n=parseInt(hex.slice(1),16),r=(n>>16)/255,g=((n>>8)&255)/255,b=(n&255)/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,s=0,h=0,d=mx-mn;if(d){s=d/(1-Math.abs(2*l-1));h=mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4;h*=60;if(h<0)h+=360;}s=Math.min(1,Math.max(0,s*ds));l=Math.min(1,Math.max(0,l+dl));var c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2,q=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];return '#'+q.map(function(v){v=Math.round((v+m)*255);return (v<16?'0':'')+v.toString(16);}).join('');}
  function mix(a,b,t){var A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16);function f(s){var x=(A>>s)&255,y=(B>>s)&255,v=Math.round(x+(y-x)*t);return (v<16?'0':'')+v.toString(16);}return '#'+f(16)+f(8)+f(0);}
  function tone(m,k){ var t=TONES[m.id]; return t?t[k]:shade(col(m),k?0.8:0.5); }
  function stackSVG() {
    var n = MATS.length, a = 96, b = 36, t = 12, gap = 18, cx = 108, y0 = 14, H = y0 + (n - 1) * (t + gap) + 2 * b + t + 22;
    var out = '<svg viewBox="0 0 250 ' + H + '" role="group" aria-label="소재 층 필터">';
    out += '<ellipse cx="' + cx + '" cy="' + (H - 12) + '" rx="' + (a * 0.9) + '" ry="7" fill="#000" opacity=".06"/>';
    for (var i = n - 1; i >= 0; i--) {
      var m = MATS[i], c = col(m), y = y0 + i * (t + gap), T = [[cx, y], [cx + a, y + b], [cx, y + 2 * b], [cx - a, y + b]], ly = y + b + t / 2 + 3.5;
      out += '<g class="slab" data-slab="' + m.id + '" data-f="' + m.id + '" tabindex="0" role="button" aria-label="' + esc(m.en) + ' 작품만 보기">' +
        '<path class="sd" d="M' + T[3][0] + ' ' + T[3][1] + ' L' + T[2][0] + ' ' + T[2][1] + ' L' + T[2][0] + ' ' + (T[2][1] + t) + ' L' + T[3][0] + ' ' + (T[3][1] + t) + 'Z" fill="' + mix(c,tone(m,0),0.35) + '" style="--h:' + hsl(c,-0.07,1.2) + '"/>' +
        '<path class="sd" d="M' + T[2][0] + ' ' + T[2][1] + ' L' + T[1][0] + ' ' + T[1][1] + ' L' + T[1][0] + ' ' + (T[1][1] + t) + ' L' + T[2][0] + ' ' + (T[2][1] + t) + 'Z" fill="' + mix(c,tone(m,0),0.15) + '" style="--h:' + hsl(c,-0.15,1.2) + '"/>' +
        '<path d="M' + T.map(function (p) { return p[0] + ' ' + p[1]; }).join(' L') + 'Z" fill="' + c + '"/>' +
        '<path d="M' + T[3][0] + ' ' + T[3][1] + ' L' + T[0][0] + ' ' + T[0][1] + ' L' + T[1][0] + ' ' + T[1][1] + '" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1"/>' +
        '<path d="M' + (cx + a - 3) + ' ' + ly + ' H' + (cx + a + 12) + '" stroke="#111" stroke-width=".8"/>' +
        '<text x="' + (cx + a + 17) + '" y="' + (ly + 3.5) + '" font-size="9.5" font-weight="800" fill="#111" font-family="Archivo, sans-serif">' + m.no + '</text></g>';
    }
    return out + '</svg>';
  }
  function miniSlab(c) {
    return '<svg viewBox="0 0 22 14" aria-hidden="true"><path d="M1 6 L11 11 L11 14 L1 9Z" fill="' + shade(c, -0.2) + '"/><path d="M11 11 L21 6 L21 9 L11 14Z" fill="' + shade(c, -0.34) + '"/><path d="M11 1 L21 6 L11 11 L1 6Z" fill="' + c + '"/></svg>';
  }
  function bandHTML(m) {
    var c = col(m), legend = m.layers.map(function (l, k) { return '<li><em>0' + (k + 1) + '</em><strong>' + esc(l[0]) + '</strong><span>' + esc(l[1]) + '</span></li>'; }).join('');
    return '<div class="band" style="--c:' + c + ';--t:' + txt(c) + '"><div class="in">' +
      '<div class="b-id"><div class="b-num" aria-hidden="true">' + m.no + '</div><div class="b-name"><h2>' + esc(m.en) + '</h2><p>' + esc(m.kr) + '</p></div></div>' +
      '<div class="b-tx"><p class="tg">' + esc(m.tag) + '</p><dl class="b-sp">' + m.specs.map(function (s) { return '<div><dt>' + esc(s[0]) + '</dt><dd>' + esc(s[1]) + '</dd></div>'; }).join('') + '</dl></div>' +
      '<div class="b-act"><button type="button" data-tog aria-expanded="false" aria-controls="det">단면 · 제작 과정</button><a href="' + GUIDE_URL + '">이 소재로 견적 →</a></div></div></div>' +
      '<div class="det" id="det" hidden><div class="in"><div class="fig">' + layerSVG(m) + '<div class="figcap cap"><span>Fig. ' + m.no + '</span><span>' + esc(m.en) + ' — Layer structure</span></div><ol class="legend">' + legend + '</ol></div>' +
      '<div class="col"><div class="blk"><h3>Process</h3><ol class="steps">' + m.steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol></div><div class="blk"><h3>Point</h3><ul class="pts">' + m.pts.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul></div></div></div></div>';
  }
  /* 회사 소개는 3개 층: 사업 내용(What we do · How we work · Materials)은 Business 페이지로 합쳤습니다 */
  var LAYERS = [
    ['who', 'Who we are', '우리는 누구인가요?', '#1B1A22'],
    ['rec', 'Record', '어떤 일을 해왔나요?', '#E2E0EC'],
    ['ct', 'Contact', '어떻게 만날 수 있나요?', '#4E3F7A']
  ];
  function mc(m) { return m.layers[0][2]; }
  var AMAT = ['frp', 'eps', 'metal', 'acrylic', 'brass', 'print'], AMAIN = ['#B5543A', '#C79A35', '#5A7FA6', '#4F6B4A', '#7B5836', '#4E3F7A'];
  function acol(i) { return AMAIN[i]; }
  function lacc(i) { return i === 2 ? atone(5, 0) : acol(i === 0 ? 0 : 4); }
  function atone(i, k) { return tone({ id: AMAT[i] }, k); }
  function stackSVGA() {
    var n = LAYERS.length, a = 96, b = 36, t = 12, gap = 18, cx = 108, y0 = 14, H = y0 + (n - 1) * (t + gap) + 2 * b + t + 22;
    var out = '<svg viewBox="0 0 250 ' + H + '" role="group" aria-label="소개 층 목차">';
    out += '<ellipse cx="' + cx + '" cy="' + (H - 12) + '" rx="' + (a * 0.9) + '" ry="7" fill="#000" opacity=".06"/>';
    for (var i = n - 1; i >= 0; i--) {
      var c = LAYERS[i][3], e = (lacc(i)), y = y0 + i * (t + gap), T = [[cx, y], [cx + a, y + b], [cx, y + 2 * b], [cx - a, y + b]], ly = y + b + t / 2 + 3.5;
      out += '<g class="slab" data-a="s' + (i + 1) + '" tabindex="0" role="button" aria-label="' + esc(LAYERS[i][1]) + '로 이동">' +
        '<path class="ed ed1" d="M' + T[3][0] + ' ' + T[3][1] + ' L' + T[2][0] + ' ' + T[2][1] + ' L' + T[2][0] + ' ' + (T[2][1] + t) + ' L' + T[3][0] + ' ' + (T[3][1] + t) + 'Z" fill="' + e + '" style="--f:' + e + ';--n:' + mix(c, '#E2E0EC', 0.35) + '"/>' +
        '<path class="ed ed2" d="M' + T[2][0] + ' ' + T[2][1] + ' L' + T[1][0] + ' ' + T[1][1] + ' L' + T[1][0] + ' ' + (T[1][1] + t) + ' L' + T[2][0] + ' ' + (T[2][1] + t) + 'Z" fill="' + shade(e, -0.16) + '" style="--f:' + shade(e, -0.16) + ';--n:' + mix(c, '#E2E0EC', 0.15) + '"/>' +
        '<path d="M' + T.map(function (p) { return p[0] + ' ' + p[1]; }).join(' L') + 'Z" fill="' + c + '" stroke="rgba(27,26,34,.12)" stroke-width="1"/>' +
        '<path d="M' + (cx + a - 3) + ' ' + ly + ' H' + (cx + a + 12) + '" stroke="#111" stroke-width=".8"/>' +
        '<text x="' + (cx + a + 17) + '" y="' + (ly + 3.5) + '" font-size="9.5" font-weight="800" fill="#111" font-family="Archivo, sans-serif">' + two(i + 1) + '</text></g>';
    }
    return out + '</svg>';
  }
  function miniSlabA(c, e) { return '<svg viewBox="0 0 22 14" aria-hidden="true"><path d="M1 6 L11 11 L11 14 L1 9Z" fill="' + e + '"/><path d="M11 11 L21 6 L21 9 L11 14Z" fill="' + shade(e, -0.16) + '"/><path d="M11 1 L21 6 L11 11 L1 6Z" fill="' + c + '" stroke="rgba(27,26,34,.15)" stroke-width=".6"/></svg>'; }
  var BIZ_IDS = ['arch', 'public', 'exhibit'];
  function areaText(n) { var a = ABOUT.areas.filter(function (x) { return x[0] === n; })[0]; return a ? a[1] : ''; }
  function S(v) { return v == null ? '' : String(v).replace(/\r/g, '').trim(); }
  /* 사업분야 이름·영문·대표 소재·한 줄 소개. 본문 화면은 src/components/business/BizPage.astro 에 있습니다 */
  var BIZ = {
    arch: { title: '건축미술', en: 'Architectural Art', mat: 'metal', get lead() { return bz('arch', 'lead', '건축물 미술작품 심의, 처음부터 끝까지.'); } },
    public: { title: '공공미술', en: 'Public Art', mat: 'frp', get lead() { return bz('public', 'lead', '디자인부터 설치까지, 한 팀이 맡습니다.'); } },
    exhibit: { title: '전시 · 갤러리', en: 'Exhibition & Gallery', mat: 'print', get lead() { return bz('exhibit', 'lead', '전시를 기획하고, 작가와 작품을 소개합니다.'); } }
  };
  function bz(id, key, dflt) { var v = BD && BD[id] && S(BD[id][key]); return v || dflt; }
  function artP(w, secColor, seed) {
    var bgs = [shade(secColor, 0.8), shade(secColor, 0.55), shade(secColor, 0.3), '#F3F2F5'];
    var bg = bgs[seed % bgs.length], mat = w.mats[0] || 'frp';
    var x = [-6, 6, 0, 8, -4][seed % 5], sc = [1.0, 0.9, 1.08, 0.96][seed % 4], flip = (seed % 3 === 1) ? -1 : 1;
    return '<svg viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="200" height="250" fill="' + bg + '"/>' +
      '<g transform="translate(' + (100 + x) + ' 132) scale(' + (sc * flip) + ' ' + sc + ') translate(-100 -104)">' + OBJ[mat] + '</g></svg>';
  }
  function ph(i, mat, src, label) {
    if (src) return '<span class="ph">' + '<img src="' + esc(src) + '" alt="" loading="lazy" onerror="this.remove()"></span>';
    var c = acol(i % 6), bg = atone(i % 6, [1, 0, 1][i % 3]);
    return '<span class="ph"><span class="tg">' + esc(label || 'PHOTO') + '</span><svg viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="200" height="150" fill="' + bg + '"/><g transform="translate(100 76) scale(.95) translate(-100 -104)">' + OBJ[mat] + '</g></svg></span>';
  }

  function byId(id) { return MATS.filter(function (m) { return m.id === id; })[0]; }
  /* 소재와 이어지지 않는 유형(그림·벽화 등)의 작품은 회색 기본색을 씁니다 */
  var NOMAT = { id: '', no: '', en: '', kr: '', layers: [['', '', '#8E97A5']] };
  function m0of(w) { return byId(w.mats[0]) || NOMAT; }
  function typeLabel(w) { return (w.types && w.types.length) ? w.types.join(' · ') : w.mats.map(function (id) { return byId(id).en; }).join(' · '); }
  function layDots(w) { return (w.mats.length ? w.mats.map(function (id) { return col(byId(id)); }) : [col(NOMAT)]).map(function (c) { return '<i style="background:' + c + '"></i>'; }).join(''); }
  function workBy(pid) { return PORT.filter(function (w) { return w.pid === pid; })[0]; }
  function col(m) { return m.layers[0][2]; }
  function worksOf(id) { return id === 'all' ? PORT : PORT.filter(function (w) { return w.mats.indexOf(id) > -1; }); }
  function ctxColor(w) { var m = state.view === 'work' ? byId(state.f) : null; return col(m || m0of(w)); }
  function seedOf(w) { return (parseInt(w.pid, 10) || 0) + (w.seed != null ? w.seed : PORT.indexOf(w)); }
  function pic(w, c, o) {
    o = o || {};
    if (w.img) {
      var ss = w.srcset ? ' srcset="' + esc(w.srcset) + '" sizes="' + esc(o.sizes || '(min-width: 1500px) 20vw, (min-width: 900px) 24vw, (min-width: 640px) 33vw, 50vw') + '"' : '';
      return '<img src="' + esc(w.img) + '"' + ss + ' alt="' + esc(w.alt || w.name) + '"' + (w.w ? ' width="' + w.w + '" height="' + w.h + '"' : '') + (o.eager ? ' fetchpriority="high"' : ' loading="lazy"') + ' decoding="async">';
    }
    return artP(w, c, seedOf(w));
  }
  function filtersHTML(f) {
    var h = '<a href="' + U('work/') + '" data-f="all" aria-pressed="' + (f === 'all') + '"><i style="background:linear-gradient(135deg,#B5543A,#C79A35,#4E3F7A)"></i><em>00</em><span>All</span><span class="n">' + PORT.length + '</span></a>';
    return h + MATS.map(function (m) { return '<a href="' + U('materials/' + m.id + '/') + '" data-f="' + m.id + '" aria-pressed="' + (f === m.id) + '"><i style="background:' + col(m) + '"></i><em>' + m.no + '</em><span>' + esc(m.en) + '</span><span class="n">' + worksOf(m.id).length + '</span></a>'; }).join('');
  }
  function chipsHTML(f) {
    return '<a href="' + U('work/') + '" data-f="all" aria-pressed="' + (f === 'all') + '">ALL<span class="n">' + PORT.length + '</span></a>' +
      MATS.map(function (m) { return '<a href="' + U('materials/' + m.id + '/') + '" data-f="' + m.id + '" aria-pressed="' + (f === m.id) + '" aria-label="' + esc(m.en) + '">' + miniSlab(col(m)) + m.no + '</a>'; }).join('');
  }
  /* 사이드 층 그래픽(소재 필터): 각 층이 링크 */
  function stackLinks(svg) {
    return svg.replace(/<g class="slab" data-slab="([a-z]+)" data-f="[a-z]+" tabindex="0" role="button" aria-label="([^"]*)">([\s\S]*?)<\/g>/g, function (_, id, label, inner) {
      return '<a class="slab" data-slab="' + id + '" data-f="' + id + '" href="' + U('materials/' + id + '/') + '" aria-label="' + label + '">' + inner + '</a>';
    });
  }
  function stackAnchors(svg) {
    return svg.replace(/<g class="slab" data-a="(s\d)" tabindex="0" role="button" aria-label="([^"]*)">([\s\S]*?)<\/g>/g, function (_, id, label, inner) {
      return '<a class="slab" data-a="' + id + '" href="#' + id + '" aria-label="' + label + '">' + inner + '</a>';
    });
  }

  function tileHTML(w, i, o) {
    var lay = layDots(w);
    return '<a class="wk" href="' + U('work/' + esc(w.pid) + '/') + '"><span class="im">' + pic(w, ctxColor(w), o) + '<span class="lay">' + lay + '</span></span>' +
      '<span class="fc"><span class="nm">' + esc(w.name) + '</span><span class="pid">ID ' + esc(w.pid) + '</span><span class="mt">' + esc(typeLabel(w)) + '</span></span></a>';
  }
  function ctaTile(m) {
    return '<div class="wk cta"><a href="' + GUIDE_URL + '" style="--c:' + (m ? col(m) : '#1B1A22') + ';--t:' + (m ? txt(col(m)) : '#FFFFFF') + '">' + (m ? esc(m.en) + '로<br>견적 내보기' : '내 프로젝트<br>견적 내보기') + '<span>→</span></a></div>';
  }
  function pageHeadHTML(m, count) {
    return '<h1>' + (m ? 'Works' : 'All Works') + '</h1><span class="cap">' + (m ? esc(m.en) + ' · ' : '') + two(count) + '</span>';
  }

  /* ---------- 작품 찾기 도구(필터 · 검색 · 정렬) ---------- */
  var FACETS = [['u', '유형'], ['c', '목적'], ['r', '지역'], ['k', '키워드'], ['y', '연도'], ['t', '태그']];
  function toolbarHTML(F, st) {
    st = st || {};
    function grp(key, label) {
      var items = (F[key] || []), sel = st[key] || [];
      if (!items.length) return '';
      var cap = key === 't' ? 14 : 99, hidden = items.length > cap;
      return '<div class="fg" data-g="' + key + '"><span class="cap">' + label + '</span><div class="fl">' + items.map(function (it, k) {
        return '<button type="button" data-g="' + key + '" data-v="' + esc(it.v) + '" aria-pressed="' + (sel.indexOf(it.v) > -1) + '"' + (k >= cap ? ' hidden data-x' : '') + '>' + esc(it.l) + '<span class="n">' + it.n + '</span></button>';
      }).join('') + (hidden ? '<button type="button" class="fmore" data-fmore aria-expanded="false">+ 더보기</button>' : '') + '</div></div>';
    }
    return '<form class="tb" role="search" aria-label="작품 검색 · 필터" onsubmit="return false">' +
      '<div class="tb-top"><label class="tb-q"><span class="cap">Search</span><input type="search" name="q" value="' + esc(st.q || '') + '" placeholder="작품명 · 키워드 · 지역으로 검색" autocomplete="off" enterkeyhint="search"></label>' +
      '<label class="tb-s"><span class="cap">Sort</span><select name="sort"><option value="rec"' + (st.sort === 'rec' || !st.sort ? ' selected' : '') + '>추천순</option><option value="new"' + (st.sort === 'new' ? ' selected' : '') + '>최신순</option><option value="name"' + (st.sort === 'name' ? ' selected' : '') + '>이름순</option></select></label></div>' +
      '<div class="tb-f">' + FACETS.map(function (f) { return grp(f[0], f[1]); }).join('') + '</div>' +
      '<div class="tb-r"><span class="res" aria-live="polite"></span><button type="button" class="reset" data-reset hidden>필터 초기화</button></div></form>';
  }




  /* 작품 상세 페이지 */

  return {
    U: U, esc: esc, two: two, col: col, byId: byId, workBy: workBy, worksOf: worksOf, state: state,
    tileHTML: tileHTML, ctaTile: ctaTile, pageHeadHTML: pageHeadHTML, bandHTML: bandHTML, filtersHTML: filtersHTML, chipsHTML: chipsHTML,
    stackHTML: function () { return stackLinks(stackSVG()); }, stackAboutHTML: function () { return stackAnchors(stackSVGA()); },
    aboutFilterHTML: function () { return LAYERS.map(function (L, i) { return '<a href="#s' + (i + 1) + '" data-a="s' + (i + 1) + '"><i style="background:' + L[3] + ';box-shadow:inset 0 -3px 0 ' + (lacc(i)) + '"></i><em>' + two(i + 1) + '</em><span>' + esc(L[1]) + '</span></a>'; }).join(''); },
    aboutChipsHTML: function () { return LAYERS.map(function (L, i) { return '<a href="#s' + (i + 1) + '" data-a="s' + (i + 1) + '" aria-label="' + esc(L[1]) + '">' + miniSlabA(L[3], lacc(i)) + two(i + 1) + '</a>'; }).join(''); },
    toolbarHTML: toolbarHTML,
    /* 서버에서 화면 컴포넌트(src/components/*)가 쓰는 도우미 */
    artP: artP, m0of: m0of, typeLabel: typeLabel, pic: pic, layDots: layDots, ph: ph, txt: txt, lacc: lacc, bz: bz, areaText: areaText, miniSlab: miniSlab, mc: mc,
    setState: function (v, f) { state.view = v; state.f = f; }, BIZ: BIZ, BIZ_IDS: BIZ_IDS, LAYERS: LAYERS
  };
}
