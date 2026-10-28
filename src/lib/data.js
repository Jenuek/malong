/* 사이트 데이터 불러오기 (빌드 때 한 번만 실행)
   data/*.json · data/works/*.json · 사진(src/assets/…) 을 읽어 화면에 쓸 모양으로 정리합니다. */
import { getImage } from 'astro:assets';
import { normMats, normHome, normAbout, normBiz, normSettings, normWork, S, L } from './normalize.js';
import { haystack } from './filter.js';

const jsonFiles = import.meta.glob('/data/*.json', { eager: true, import: 'default' });
const workFiles = import.meta.glob('/data/works/*.json', { eager: true, import: 'default' });
const imgFiles = import.meta.glob('/src/assets/**/*.{jpg,jpeg,png,webp,avif,gif,JPG,JPEG,PNG,WEBP}', { import: 'default' });

export const BASE = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '') + '/';
export const SITE = (import.meta.env.SITE || 'https://jenuek.github.io').replace(/\/+$/, '');
export const ORIGIN = SITE + (BASE === '/' ? '' : BASE.replace(/\/+$/, ''));
export const abs = (p) => ORIGIN + '/' + String(p || '').replace(/^\/+/, '');

const J = (name) => jsonFiles['/data/' + name + '.json'] || null;

/* ---- 사진 ---- */
function keyOf(p) {
  p = S(p);
  if (!p || /^[a-z][a-z0-9+.-]*:/i.test(p) || p.startsWith('//')) return '';
  p = p.replace(/^\/+/, '');
  if (imgFiles['/' + p]) return '/' + p;
  if (imgFiles['/src/assets/' + p]) return '/src/assets/' + p;
  if (imgFiles['/src/assets/images/' + p.replace(/^images\//, '')]) return '/src/assets/images/' + p.replace(/^images\//, '');
  return '';
}
const metaCache = new Map();
async function metaOf(key) { if (!metaCache.has(key)) metaCache.set(key, imgFiles[key]()); return metaCache.get(key); }
const varCache = new Map();
/* 한 장을 여러 크기(webp)로 만들어 {src, srcset, w, h} 로 돌려줍니다. src 는 가운데 크기. */
export async function variants(path, widths, opts = {}) {
  const p = S(path);
  if (!p) return null;
  if (/^https?:\/\//i.test(p)) return { src: p, srcset: '', w: 0, h: 0 };
  const key = keyOf(p);
  if (!key) { console.warn('[image] 파일을 찾지 못했어요:', p); return null; }
  const ck = key + '|' + widths.join(',') + '|' + (opts.format || 'webp');
  if (varCache.has(ck)) return varCache.get(ck);
  const job = (async () => {
    const meta = await metaOf(key);
    const ws = widths.filter((w) => w <= meta.width).length ? widths.filter((w) => w <= meta.width) : [meta.width];
    const list = [];
    for (const w of ws) list.push(await getImage({ src: meta, width: w, format: opts.format || 'webp', quality: opts.quality || 74 }));
    const mid = list[Math.min(Math.floor((list.length - 1) / 2) + (list.length > 2 ? 0 : 0), list.length - 1)];
    const pick = opts.pick === 'first' ? list[0] : opts.pick === 'last' ? list[list.length - 1] : mid;
    return {
      src: pick.src, w: pick.attributes.width, h: pick.attributes.height,
      srcset: list.length > 1 ? list.map((g, i) => g.src + ' ' + ws[i] + 'w').join(', ') : '',
    };
  })();
  varCache.set(ck, job);
  return job;
}

async function collectImages(paths, widths, opts) {
  const map = {};
  for (const p of new Set(paths.map(S).filter(Boolean))) map[p] = await variants(p, widths, opts);
  return (p) => (S(p) ? map[S(p)] || null : null);
}

/* ---- 전체 데이터 ---- */
let cache = null;
export function getSite() { if (!cache) cache = build(); return cache; }

async function build() {
  const settings = normSettings(J('settings'));
  const matsJ = J('materials'), homeJ = J('home'), aboutJ = J('about'), bizJ = J('business'), featJ = J('featured');

  /* 소재 · 홈 · 소개 사진 */
  const pathsA = [];
  L(matsJ && matsJ.items).forEach((r) => pathsA.push(r.image));
  L(homeJ && homeJ.hero).forEach((h) => pathsA.push(h && h.image));
  if (aboutJ) { pathsA.push(aboutJ.photo); L(aboutJ.how_steps).forEach((x) => pathsA.push(x && x.image)); }
  const imgGen = await collectImages(pathsA, [640, 1280, 1920], {});
  const imgHero = await collectImages(L(homeJ && homeJ.hero).map((h) => h && h.image), [960, 1600, 2400], {});

  const MATS = normMats(matsJ, imgGen);
  const matIds = MATS.map((m) => m.id);

  /* 작품 */
  const raw = Object.values(workFiles).map((r) => normWork(r, matIds)).filter(Boolean);
  const seen = new Set();
  const works = raw.filter((w) => (seen.has(w.pid) ? false : seen.add(w.pid)));
  /* 기본 순서(추천순): 고정 목록(featured) 순서 → 나머지는 연도 최신순 → ID 큰 순 */
  const pin = L(featJ && featJ.items).map((x) => S(x && x.work)).filter(Boolean);
  const rank = (w) => { const i = pin.indexOf(w.pid); return i < 0 ? 1e9 : i; };
  works.sort((a, b) => rank(a) - rank(b) ||
    (parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0) ||
    (parseInt(b.pid, 10) || 0) - (parseInt(a.pid, 10) || 0) || a.pid.localeCompare(b.pid));
  for (let i = 0; i < works.length; i++) {
    const w = works[i];
    w.order = i;
    const t = await variants(w._image, [480, 960], { pick: 'first' });
    if (t) { w.img = t.src; w.srcset = t.srcset; w.w = t.w; w.h = t.h; } else { w.img = ''; }
    w.q = haystack(w, w.mats.map((id) => { const m = MATS.find((x) => x.id === id); return m ? m.en + ' ' + m.kr : id; }));
  }

  const HOME = normHome(homeJ, (pid) => works.some((w) => w.pid === pid), (p) => imgHero(p) && { src: imgHero(p).src });
  const ABOUT = normAbout(aboutJ, imgGen);
  const BIZ = normBiz(bizJ);

  return {
    settings, MATS, PORT: works, HOME, ABOUT, EXH: BIZ.EXH, BD: BIZ.BD, STANDS_URL: BIZ.STANDS_URL,
    guide: J('guide'),
    ctx: { MATS, PORT: works, ABOUT, HOME, EXH: BIZ.EXH, BD: BIZ.BD, STANDS_URL: BIZ.STANDS_URL, base: BASE },
  };
}

/* 작품 상세용: 큰 사진 + 갤러리 + 공유용(OG) 이미지를 만들어 줍니다 */
export async function detailOf(w) {
  const big = await variants(w._image, [800, 1280, 1920], {});
  const og = w._image ? await variants(w._image, [1200], { format: 'jpg', quality: 80 }) : null;
  const gallery = [];
  for (const g of w._gallery || []) {
    const v = await variants(g.image, [800, 1280, 1920], {});
    if (v) gallery.push({ img: v.src, srcset: v.srcset, w: v.w, h: v.h, alt: g.alt });
  }
  const d = Object.assign({}, w, { gallery });
  if (big) { d.img = big.src; d.srcset = big.srcset; d.w = big.w; d.h = big.h; }
  return { work: d, og: og ? abs(og.src.replace(BASE, '')) : '' };
}

/* 에디토리얼 사진 (표지 · 목록 · 공유용) */
export async function coverOf(path) {
  if (!S(path)) return null;
  const v = await variants(path, [480, 960, 1600], {});
  const og = await variants(path, [1200], { format: 'jpg', quality: 80 });
  return v && { src: v.src, srcset: v.srcset, w: v.w, h: v.h, og: og ? abs(og.src.replace(BASE, '')) : '' };
}

/* 필터/검색에 쓰는 가벼운 형태 */
export function compact(w) {
  return { p: w.pid, n: w.name, m: w.mats, c: w.cat, y: w.year, r: w.region, t: w.tags, q: w.q, o: w.order };
}
