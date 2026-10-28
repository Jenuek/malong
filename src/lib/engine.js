/* 마롱컴퍼니 화면 그리기 모듈 — 빌드(Astro)와 브라우저에서 같이 씁니다.
   원래 index.html 안에 있던 그리기 코드를 data 를 받아 HTML 문자열을 돌려주는 형태로 옮긴 것입니다. */
import { STANDS_IMG } from './assets.js';

export function createEngine(ctx) {
  'use strict';
  var MATS = ctx.MATS || [], PORT = ctx.PORT || [], ABOUT = ctx.ABOUT || { areas: [], record: [], promise: [], contents: [], flow: [], how: [], history: [], contact: [], who: { text: [], values: [] } },
      HOME = ctx.HOME || {}, EXH = ctx.EXH || { areas: [], hist: [] }, BD = ctx.BD || null, STANDS_URL = ctx.STANDS_URL || '#';
  var BASE = ctx.base || '/';
  function U(p) { return BASE + p; }
  var GUIDE_URL = U('guide.html');
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
  var LAYERS = [
    ['who', 'Who we are', '우리는 누구인가요?', '#1B1A22'],
    ['what', 'What we do', '무엇을 하나요?', '#3B3A46'],
    ['how', 'How we work', '어떻게 만드나요?', '#6C6B7B'],
    ['mat', 'Materials', '무엇으로 만드나요?', '#C9C7D6'],
    ['rec', 'Record', '어떤 일을 해왔나요?', '#E2E0EC'],
    ['ct', 'Contact', '어떻게 만날 수 있나요?', '#4E3F7A']
  ];
  function mc(m) { return m.layers[0][2]; }
  var AMAT = ['frp', 'eps', 'metal', 'acrylic', 'brass', 'print'], AMAIN = ['#B5543A', '#C79A35', '#5A7FA6', '#4F6B4A', '#7B5836', '#4E3F7A'];
  var AMAT = ['frp', 'eps', 'metal', 'acrylic', 'brass', 'print'], AMAIN = ['#B5543A', '#C79A35', '#5A7FA6', '#4F6B4A', '#7B5836', '#4E3F7A'];
  function acol(i) { return AMAIN[i]; }
  function atone(i, k) { return tone({ id: AMAT[i] }, k); }
  function stackSVGA() {
    var n = 6, a = 96, b = 36, t = 12, gap = 18, cx = 108, y0 = 14, H = y0 + (n - 1) * (t + gap) + 2 * b + t + 22;
    var out = '<svg viewBox="0 0 250 ' + H + '" role="group" aria-label="소개 층 목차">';
    out += '<ellipse cx="' + cx + '" cy="' + (H - 12) + '" rx="' + (a * 0.9) + '" ry="7" fill="#000" opacity=".06"/>';
    for (var i = n - 1; i >= 0; i--) {
      var c = LAYERS[i][3], e = (i === 5 ? atone(5, 0) : acol(i)), y = y0 + i * (t + gap), T = [[cx, y], [cx + a, y + b], [cx, y + 2 * b], [cx - a, y + b]], ly = y + b + t / 2 + 3.5;
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
  function aband(i) { var L = LAYERS[i]; return '<div class="abnd" style="--a:' + (i === 5 ? atone(5, 0) : acol(i)) + ';--c:' + L[3] + ';--t:' + txt(L[3]) + '"><div class="abi"><div class="abn" aria-hidden="true">' + two(i + 1) + '</div><div class="abq"><h2>' + esc(L[1]) + '</h2><p>' + esc(L[2]) + '</p></div></div></div>'; }
  function pp(t) { return t.map(function (x) { return '<p class="txt">' + esc(x) + '</p>'; }).join(''); }
  function svc(list, cls, withLink) {
    return '<ul class="svc ' + cls + '" style="padding:0;margin:0">' + list.map(function (w, k) {
      return '<li><em>' + two(k + 1) + '</em><b>' + esc(w[0]) + '</b><span>' + esc(w[1]) + '</span>' + (withLink && BIZMAP[w[0]] ? '<a href="' + U('business/' + BIZMAP[w[0]] + '/') + '">자세히 →</a>' : '') + '</li>';
    }).join('') + '</ul>';
  }
  function sections() {
    var A = ABOUT, h = '';
    h += '<section id="s1" data-i="0">' + aband(0) + '<div class="abbody"><div class="two"><div class="stack"><p class="lead">' + esc(A.who.lead).replace('\n', '<br>') + '</p>' + pp(A.who.text) + '</div>' + '<div>' + ph(0, 'frp', A.who.img, 'PHOTO · 대표 작품') + '</div></div>' +
      '<div class="sub-h">Values</div>' + svc(A.who.values, 'k3') + '</div></section>';
    h += '<section id="s2" data-i="1">' + aband(1) + '<div class="abbody">' + svc(A.areas, 'k2', true) + '<div class="sub-h">공공미술 콘텐츠</div>' + svc(A.contents, 'k4') + '<div class="sub-h">건축미술팀의 약속</div>' + svc(A.promise, 'k4') + '</div></section>';
    var mats = ['print', 'eps', 'frp', 'metal', 'acrylic'];
    h += '<section id="s3" data-i="2">' + aband(2) + '<div class="abbody"><p class="txt" style="max-width:68ch;margin-bottom:26px">' + esc(A.howLead) + '</p><div class="sub-h" style="padding-top:0">공공미술 · 5 Steps</div><div class="abst k5" style="margin-top:18px">' + A.how.map(function (w, k) { return '<div class="stp">' + ph(k, mats[k % 5], w[2], 'PHOTO · ' + two(k + 1)) + '<div class="h"><em>' + two(k + 1) + '</em><b>' + esc(w[0]) + '</b></div><p>' + esc(w[1]) + '</p></div>'; }).join('') + '</div>' +
      '<div class="sub-h">건축미술 · 심의 5 Steps</div><ol class="flow">' + A.flow.map(function (f, k) { return '<li><em>' + two(k + 1) + '</em><b>' + esc(f[0]) + '</b><span>' + esc(f[1]) + '</span></li>'; }).join('') + '</ol></div></section>';
    h += '<section id="s4" data-i="3">' + aband(3) + '<div class="abbody"><div class="two"><div class="stack"><p class="lead">소재마다 만드는 방식과 어울리는 곳이 다릅니다.</p><p class="txt">' + esc(A.matText) + '</p></div><ol class="mrows">' +
      MATS.map(function (m) { return '<li><a href="' + U('materials/' + m.id + '/') + '">' + miniSlab(mc(m)) + '<em>' + m.no + '</em><span class="nm"><b>' + esc(m.en) + '</b><span>' + esc(m.kr) + '</span></span><span class="ar">작품 보기 →</span></a></li>'; }).join('') + '</ol></div></div></section>';
    h += '<section id="s5" data-i="4">' + aband(4) + '<div class="abbody"><div class="stats">' + A.record.map(function (r) { return '<div class="stat"><b>' + esc(r[0]) + '</b><span>' + esc(r[1]) + '</span></div>'; }).join('') + '</div><p class="note">' + esc(A.recordNote) + '</p><div class="sub-h">History</div><ol class="hist">' +
      A.history.slice().reverse().map(function (y) { return '<li><span class="y">' + y[0] + '</span><ul>' + y[1].map(function (e) { return '<li><em>' + e[0] + '</em><span>' + esc(e[1]) + '</span></li>'; }).join('') + '</ul></li>'; }).join('') + '</ol></div></section>';
    h += '<section id="s6" data-i="5">' + aband(5) + '<div class="abbody"><div class="two"><div class="stack"><p class="cbig">Let’s<br>build it.</p><div class="abgo"><a href="' + GUIDE_URL + '">소재 찾기 · 가견적 · 문의<span>→</span></a></div></div>' +
      '<dl class="cl">' + A.contact.map(function (c) { return '<div><dt>' + esc(c[0]) + '</dt><dd>' + esc(c[1]) + '</dd><button type="button" data-copy="' + esc(c[1]) + '">Copy</button></div>'; }).join('') + '</dl></div></div></section>';
    return h;
  }
  var BIZMAP = { '공공미술': 'public', '건축미술': 'arch', '전시기획': 'exhibit', '갤러리': 'exhibit' };
  var BIZ_IDS = ['arch', 'public', 'exhibit'];
  function areaText(n) { var a = ABOUT.areas.filter(function (x) { return x[0] === n; })[0]; return a ? a[1] : ''; }
  function stBlock(head, line) {
    return '<aside class="bzst" aria-label="STANDS"><div><p class="cap">Where art STANDS?</p><h3>' + esc(head) + '</h3><p>' + esc(line) + '</p></div>' +
      '<a class="go" href="' + STANDS_URL + '" target="_blank" rel="noopener noreferrer" aria-label="STANDS 아트 프로젝트 문의"><img src="' + STANDS_IMG + '" alt="STANDS"><span>아트 프로젝트 문의 ↗</span></a></aside>';
  }
  function guideRow() {   // 공공미술: 소재 찾기 · 가견적 · 문의는 하나의 흐름(guide.html)으로 이어집니다
    return '<div class="sub-h">문의</div><div class="abgo"><a href="' + GUIDE_URL + '">소재 찾기 · 가견적 · 문의<span>→</span></a></div>';
  }
  function statsOf(list) { return '<div class="stats">' + list.map(function (r) { return '<div class="stat"><b>' + esc(r[0]) + '</b><span>' + esc(r[1]) + '</span></div>'; }).join('') + '</div>'; }
  function flowOf(list) { return '<ol class="flow">' + list.map(function (f, k) { return '<li><em>' + two(k + 1) + '</em><b>' + esc(f[0]) + '</b><span>' + esc(f[1]) + '</span></li>'; }).join('') + '</ol>'; }
  function exStats() { var l = BD && BD.exhibit && L(BD.exhibit.stats).map(function (x) { return [S(x && x.value), S(x && x.label)]; }).filter(function (x) { return x[0]; }); return l && l.length ? l : [['36명', '협업작가'], ['56명', '전시작가']]; }
  function S(v) { return v == null ? '' : String(v).replace(/\r/g, '').trim(); }
  function L(v) { return Array.isArray(v) ? v : []; }
  function pad2(v) { v = S(v); return /^\d$/.test(v) ? '0' + v : v; }
  var BIZ = {
    arch: {
      title: '건축미술', en: 'Architectural Art', mat: 'metal',
      get lead() { return bz('arch', 'lead', '건축물 미술작품 심의, 처음부터 끝까지.'); },
      body: function () {
        var A = ABOUT;
        return '<div class="two"><div class="stack"><p class="lead">' + esc(bz('arch', 'intro_title', '건축주는 건축 개요만 전달해 주세요.')) + '</p><p class="txt">' + esc(bz('arch', 'intro_text', '심의 서류 준비와 접수는 전담 팀이 맡습니다. 작품 제작과 설치, 준공에 필요한 미술작품 설치확인서를 받을 때까지 이어서 진행합니다.')) + '</p></div>' +
          '<div>' + statsOf(A.record.slice(2)) + '<p class="note">' + esc(A.recordNote) + '</p></div></div>' +
          '<div class="sub-h">건축미술팀의 약속</div>' + svc(A.promise, 'k4') +
          '<div class="sub-h">심의 5 Steps</div>' + flowOf(A.flow) +
          stBlock(bz('arch', 'stands_title', '건물에 놓을 작품이 필요하다면'), bz('arch', 'stands_text', '작품이 설 자리를 찾고, 세우고, 그 이후까지 돌보는 아트 컴퍼니.'));
      }
    },
    public: {
      title: '공공미술', en: 'Public Art', mat: 'frp',
      get lead() { return bz('public', 'lead', '디자인부터 설치까지, 한 팀이 맡습니다.'); },
      body: function () {
        var A = ABOUT;
        return '<div class="two"><div class="stack"><p class="lead">' + esc(bz('public', 'intro_title', '컨설팅, 기획, 제작, 운송, 설치.')) + '</p><p class="txt">' + esc(bz('public', 'intro_text', '프로젝트마다 전담 매니저가 배정되어 기한과 품질, 안전한 운송과 설치, 유지보수까지 챙깁니다.')) + '</p></div>' +
          '<div>' + statsOf(A.record.slice(0, 2)) + '<p class="note">' + esc(A.recordNote) + '</p></div></div>' +
          '<div class="sub-h">공공미술 콘텐츠</div>' + svc(A.contents, 'k4') +
          '<div class="sub-h">5 Steps</div>' + flowOf(A.how.map(function (w) { return [w[0], w[1]]; })) +
          '<div class="sub-h">소재별 작품</div><ol class="mrows">' + MATS.map(function (m) { return '<li><a href="' + U('materials/' + m.id + '/') + '">' + miniSlab(mc(m)) + '<em>' + m.no + '</em><span class="nm"><b>' + esc(m.en) + '</b><span>' + esc(m.kr) + '</span></span><span class="ar">작품 보기 →</span></a></li>'; }).join('') + '</ol>' +
          guideRow();
      }
    },
    exhibit: {
      title: '전시 · 갤러리', en: 'Exhibition & Gallery', mat: 'print',
      get lead() { return bz('exhibit', 'lead', '전시를 기획하고, 작가와 작품을 소개합니다.'); },
      body: function () {
        return '<div class="two"><div class="stack"><p class="lead">' + esc(bz('exhibit', 'intro_title', '기업·기관 전시부터 해외 전시까지.')) + '</p><p class="txt">' + esc(bz('exhibit', 'intro_text', '한국을 넘어 유럽까지, 대중과 예술을 잇는 전시를 기획해 왔습니다. 복합문화공간 셀렉티드마롱에서는 작가를 소개하는 전시를 엽니다.')) + '</p></div>' +
          '<div>' + statsOf(exStats()) + '</div></div>' +
          '<div class="sub-h">전시기획</div><ul class="svc k4" style="padding:0;margin:0">' + EXH.areas.map(function (t, k) { return '<li><em>' + two(k + 1) + '</em><b>' + esc(t) + '</b></li>'; }).join('') + '</ul>' +
          '<div class="sub-h">전시 이력</div><ol class="bzhist">' + EXH.hist.map(function (y) { return '<li><span class="y">' + y[0] + '</span><ul>' + y[1].map(function (e) { return '<li><em>' + esc(e[0]) + '</em><span>' + esc(e[1]) + '</span></li>'; }).join('') + '</ul></li>'; }).join('') + '</ol>' +
          '<div class="sub-h">갤러리</div><div class="two"><div class="stack"><p class="lead" style="font-size:clamp(18px,2.4vw,26px)">' + esc(bz('exhibit', 'gallery_title', '셀렉티드마롱 SLTD MALONG')) + '</p></div><p class="txt">' + esc(areaText('갤러리')) + '</p></div>' +
          stBlock(bz('exhibit', 'stands_title', '새 아트 프로젝트가 필요하다면'), bz('exhibit', 'stands_text', '작품이 설 자리를 찾고, 세우고, 그 이후까지 돌보는 아트 컴퍼니.'));
      }
    }
  };
  function bz(id, key, dflt) { var v = BD && BD[id] && S(BD[id][key]); return v || dflt; }
  function artP(w, secColor, seed) {
    var bgs = [shade(secColor, 0.8), shade(secColor, 0.55), shade(secColor, 0.3), '#F3F2F5'];
    var bg = bgs[seed % bgs.length], mat = w.mats[0];
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
  function workBy(pid) { return PORT.filter(function (w) { return w.pid === pid; })[0]; }
  function col(m) { return m.layers[0][2]; }
  function worksOf(id) { return id === 'all' ? PORT : PORT.filter(function (w) { return w.mats.indexOf(id) > -1; }); }
  function ctxColor(w) { var m = state.view === 'work' ? byId(state.f) : null; return col(m || byId(w.mats[0])); }
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
    var lay = w.mats.map(function (id) { return '<i style="background:' + col(byId(id)) + '"></i>'; }).join('');
    return '<a class="wk" href="' + U('work/' + esc(w.pid) + '/') + '"><span class="im">' + pic(w, ctxColor(w), o) + '<span class="lay">' + lay + '</span></span>' +
      '<span class="fc"><span class="nm">' + esc(w.name) + '</span><span class="pid">ID ' + esc(w.pid) + '</span><span class="mt">' + esc(w.mats.map(function (id) { return byId(id).en; }).join(' · ')) + '</span></span></a>';
  }
  function ctaTile(m) {
    return '<div class="wk cta"><a href="' + GUIDE_URL + '" style="--c:' + (m ? col(m) : '#1B1A22') + ';--t:' + (m ? txt(col(m)) : '#FFFFFF') + '">' + (m ? esc(m.en) + '로<br>견적 내보기' : '내 프로젝트<br>견적 내보기') + '<span>→</span></a></div>';
  }
  function pageHeadHTML(m, count) {
    return '<h1>' + (m ? 'Works' : 'All Works') + '</h1><span class="cap">' + (m ? esc(m.en) + ' · ' : '') + two(count) + '</span>';
  }

  /* ---------- 작품 찾기 도구(필터 · 검색 · 정렬) ---------- */
  var FACETS = [['c', '분류'], ['y', '연도'], ['r', '지역'], ['t', '태그']];
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
      '<div class="tb-top"><label class="tb-q"><span class="cap">Search</span><input type="search" name="q" value="' + esc(st.q || '') + '" placeholder="작품명 · 태그 · 지역으로 검색" autocomplete="off" enterkeyhint="search"></label>' +
      '<label class="tb-s"><span class="cap">Sort</span><select name="sort"><option value="rec"' + (st.sort === 'rec' || !st.sort ? ' selected' : '') + '>추천순</option><option value="new"' + (st.sort === 'new' ? ' selected' : '') + '>최신순</option><option value="name"' + (st.sort === 'name' ? ' selected' : '') + '>이름순</option></select></label></div>' +
      '<div class="tb-f">' + FACETS.map(function (f) { return grp(f[0], f[1]); }).join('') + '</div>' +
      '<div class="tb-r"><span class="res" aria-live="polite"></span><button type="button" class="reset" data-reset hidden>필터 초기화</button></div></form>';
  }

  function homeHTML() {
    var hs = (HOME.hero || []).filter(function (h) { return workBy(h.pid); });
    if (!hs.length && PORT.length) hs = [{ pid: PORT[0].pid, img: '' }];
    function cap(w) { return 'ID ' + w.pid + ' · ' + w.mats.map(function (id) { return byId(id).en; }).join(' · '); }
    function heroPic(h, w) {
      if (h.img) return '<img src="' + esc(h.img) + '" alt="' + esc(w.name) + '" decoding="async">';
      var svg = artP(w, col(byId(w.mats[0])), 1), bg = (svg.match(/<rect[^>]*fill="(#[0-9A-Fa-f]{6})"/) || [])[1] || '#F3F2F7';
      return '<span style="position:absolute;inset:0;background:' + bg + '"></span>' + svg.replace('xMidYMid slice', 'xMidYMid meet');
    }
    var slides = hs.map(function (h, k) { var w = workBy(h.pid); return '<div class="hs' + (k === 0 ? ' on' : '') + '" aria-hidden="true" data-href="' + U('work/' + esc(w.pid) + '/') + '" data-name="' + esc(w.name) + '" data-cap="' + esc(cap(w)) + '">' + heroPic(h, w) + '</div>'; }).join('');
    var dots = hs.length > 1 ? '<div class="hm-dots" role="group" aria-label="대표 작품">' + hs.map(function (h, k) { return '<button type="button" data-hs="' + k + '" aria-label="' + (k + 1) + '번째 작품"' + (k === 0 ? ' aria-current="true"' : '') + '></button>'; }).join('') + '</div>' : '';
    var w0 = hs.length ? workBy(hs[0].pid) : null;
    var items = PORT.slice(0, HOME.n || 12).map(function (w, i) { return tileHTML(w, i); }), reps = Math.max(2, Math.ceil(2600 / (Math.max(items.length, 1) * 230)) + 1), rail = '';
    for (var r = 0; r < reps; r++) rail += r ? items.map(function (t) { return t.replace('<a class="wk', '<a tabindex="-1" aria-hidden="true" class="wk'); }).join('') : items.join('');
    var cs = ['metal', 'frp', 'print'].map(function (id) { var m = byId(id); return m ? col(m) : '#1B1A22'; });
    var biz = '<div class="hm-h"><span class="cap">What we do</span><a href="' + U('business/arch/') + '">사업분야 보기 →</a></div>' +
      '<div class="hm-biz">' + (HOME.biz || []).map(function (b, k) {
        return '<a href="' + U('business/' + b[2] + '/') + '" style="--c:' + cs[k % 3] + '"><span class="no">' + two(k + 1) + '</span><b>' + esc(b[0]) + '</b><i aria-hidden="true">→</i><span class="ds">' + esc(b[1]) + '</span></a>';
      }).join('') + '</div>';
    var num = '<div class="hm-h"><span class="cap">Track record</span><a href="' + U('about/#s5') + '">연혁 · 인증 →</a></div>' +
      '<div class="hm-num"><div class="stats">' + ABOUT.record.map(function (r) { return '<div class="stat"><b>' + esc(r[0]) + '</b><span>' + esc(r[1]) + '</span></div>'; }).join('') + '</div><p class="note">' + esc(ABOUT.recordNote || '') + '</p></div>';
    var cl = '<div class="hm-cl"><span class="cap">Clients</span><ul>' + (HOME.clients || []).map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul><p>' + esc(HOME.certs || '') + '</p></div>';
    return '<section class="hm-hero" aria-label="대표 작품">' + slides + '<div class="hm-hv"><div><p class="cap">' + esc(HOME.eyebrow || '') + '</p><h1>' + HOME.title + '</h1><p class="sub">' + esc(HOME.sub || '') + '</p><div class="go2"><a href="' + U('work/') + '">작품 보기 →</a><a href="' + U('about/') + '">회사 소개</a></div></div>' +
      '<div class="hm-hb"><a href="' + (w0 ? U('work/' + esc(w0.pid) + '/') : U('work/')) + '">' + (w0 ? '<b>' + esc(w0.name) + '</b><span class="cap">' + esc(cap(w0)) + '</span>' : '') + '</a>' + dots + '</div></div></section>' +
      '<div class="hm-bar" aria-hidden="true">' + MATS.map(function (m) { return '<i style="background:' + col(m) + '"></i>'; }).join('') + '</div>' +
      biz + num + '<div class="hm-h"><span class="cap">Latest works</span><a href="' + U('work/') + '">전체 보기 ' + two(PORT.length) + ' →</a></div><div class="hm-rail" id="rail" data-n="' + items.length + '">' + rail + '</div>' +
      cl + '<div class="hm-end"><p>' + esc(HOME.end || '') + '</p><div class="acts"><a href="' + GUIDE_URL + '">소재 찾기 · 가견적 · 문의 →</a><a href="' + U('track.html') + '">진행 확인 →</a><i class="vb" aria-hidden="true"></i><a class="st" href="' + STANDS_URL + '" target="_blank" rel="noopener noreferrer" aria-label="STANDS 아트 프로젝트 문의"><span>아트 프로젝트 문의 ↗</span><img src="' + STANDS_IMG + '" alt="STANDS"></a></div></div>';
  }

  function aboutHTML() { return stackAnchors2(sections()); }
  function stackAnchors2(h) { return h; }

  function bizPageHTML(id) {
    var B = BIZ[id], m = byId(B.mat), acc = m ? col(m) : '#1B1A22';
    var tabs = BIZ_IDS.map(function (k) { return '<a href="' + U('business/' + k + '/') + '"' + (k === id ? ' aria-current="page"' : '') + '>' + esc(BIZ[k].title) + '</a>'; }).join('');
    return '<section class="bzh" style="--a:' + acc + '"><div class="bzi"><p class="cap">Business · ' + esc(B.en) + '</p><h1>' + esc(B.title) + '</h1><p class="bzl">' + esc(B.lead) + '</p><nav class="bztabs" aria-label="사업분야">' + tabs + '</nav></div></section><div class="abbody bzb">' + B.body() + '</div>';
  }

  /* 작품 상세 페이지 */
  function workDetailHTML(w, o) {
    o = o || {}; var m0 = byId(w.mats[0]);
    var imgs = [w].concat((w.gallery || []).map(function (g, k) { return { name: w.name, pid: w.pid, mats: w.mats, img: g.img, srcset: g.srcset, alt: g.alt || (w.name + ' ' + (k + 2)), w: g.w, h: g.h, seed: 3 + k }; }));
    var figs = imgs.map(function (g, k) {
      var big = Object.assign({}, g, { alt: k === 0 ? (w.alt || w.name) : g.alt });
      return '<figure class="pic' + (k ? ' sub' : '') + '">' + pic(big, col(m0), { eager: k === 0, sizes: '(min-width: 900px) 60vw, 100vw' }) + (k === 0 ? '<span class="lay2">' + w.mats.map(function (id) { return '<i style="background:' + col(byId(id)) + '"></i>'; }).join('') + '</span>' : '') + '</figure>';
    }).join('');
    function row(k, v) { return v ? '<div><dt>' + k + '</dt><dd>' + v + '</dd></div>' : ''; }
    var dl = '<dl>' +
      row('소재', w.mats.map(function (id) { return '<a href="' + U('materials/' + id + '/') + '">' + esc(byId(id).en) + '</a>'; }).join('')) +
      row('분류', w.catLabel ? '<a href="' + U('work/?c=' + encodeURIComponent(w.cat)) + '">' + esc(w.catLabel) + '</a>' : '') +
      row('연도', w.year ? '<a href="' + U('work/?y=' + w.year) + '">' + esc(w.year) + '</a>' : '') +
      row('지역', w.region ? '<a href="' + U('work/?r=' + encodeURIComponent(w.region)) + '">' + esc(w.region) + '</a>' : '') +
      row('발주', w.client ? esc(w.client) : '') +
      row('태그', (w.tags || []).map(function (t) { return '<a href="' + U('work/?t=' + encodeURIComponent(t)) + '">#' + esc(t) + '</a>'; }).join('')) + '</dl>';
    var nav = '<div class="acts">' + (o.prev ? '<a href="' + U('work/' + esc(o.prev.pid) + '/') + '" rel="prev">← Prev</a>' : '') + (o.next ? '<a href="' + U('work/' + esc(o.next.pid) + '/') + '" rel="next">Next →</a>' : '') + '<a class="x" href="' + U('work/') + '">All works</a></div>';
    var rel = (o.related || []).length ? '<section class="rel" aria-label="관련 작품"><div class="sub-h">Related works</div><div class="works">' + o.related.map(function (r, i) { return tileHTML(r, i); }).join('') + '</div></section>' : '';
    return '<article class="wpage"><div class="ovl-bar"><span class="cap">Project ID ' + esc(w.pid) + '</span>' + nav + '</div>' +
      '<div class="wv"><div class="figs">' + figs + '</div><div class="info"><div><h1>' + esc(w.name) + '</h1><p class="pidl cap">Project ID ' + esc(w.pid) + '</p></div>' + dl +
      '<p class="ds">' + (w.desc ? esc(w.desc) : '작품 설명이 들어가는 자리입니다. 프로젝트 배경과 제작 포인트를 두세 줄로 적어 주세요.') + '</p>' +
      '<div class="go"><a href="' + U('materials/' + w.mats[0] + '/') + '">' + esc(byId(w.mats[0]).en) + ' 작품 모아보기<span>→</span></a><a href="' + GUIDE_URL + '">비슷한 작품 견적 내보기<span>→</span></a></div></div></div>' + rel + '</article>';
  }

  return {
    U: U, esc: esc, two: two, col: col, byId: byId, workBy: workBy, worksOf: worksOf, state: state,
    tileHTML: tileHTML, ctaTile: ctaTile, pageHeadHTML: pageHeadHTML, bandHTML: bandHTML, filtersHTML: filtersHTML, chipsHTML: chipsHTML,
    stackHTML: function () { return stackLinks(stackSVG()); }, stackAboutHTML: function () { return stackAnchors(stackSVGA()); },
    aboutFilterHTML: function () { return LAYERS.map(function (L, i) { return '<a href="#s' + (i + 1) + '" data-a="s' + (i + 1) + '"><i style="background:' + L[3] + ';box-shadow:inset 0 -3px 0 ' + (i === 5 ? atone(5, 0) : acol(i)) + '"></i><em>' + two(i + 1) + '</em><span>' + esc(L[1]) + '</span></a>'; }).join(''); },
    aboutChipsHTML: function () { return LAYERS.map(function (L, i) { return '<a href="#s' + (i + 1) + '" data-a="s' + (i + 1) + '" aria-label="' + esc(L[1]) + '">' + miniSlabA(L[3], i === 5 ? atone(5, 0) : acol(i)) + two(i + 1) + '</a>'; }).join(''); },
    toolbarHTML: toolbarHTML, homeHTML: homeHTML, aboutHTML: aboutHTML, bizPageHTML: bizPageHTML, workDetailHTML: workDetailHTML,
    setState: function (v, f) { state.view = v; state.f = f; }, BIZ: BIZ, BIZ_IDS: BIZ_IDS, LAYERS: LAYERS
  };
}
