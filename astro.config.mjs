import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import sharp from 'sharp';
import { existsSync } from 'fs';

/* 주소 설정 — 나중에 도메인이 정해지면 GitHub 저장소의 Settings → Variables 에서
   SITE_URL (예: https://www.malong.co.kr), BASE_PATH (도메인 루트면 /) 만 바꾸면 됩니다. */
const site = process.env.SITE_URL || 'https://jenuek.github.io';
const base = process.env.BASE_PATH || '/malong';
const origin = site.replace(/\/+$/, '') + (base === '/' ? '' : base.replace(/\/+$/, ''));

/* 블로그 글 안의 처리
   1) '/uploads/…' 같은 사이트 안 주소에 base 를 붙입니다.
   2) 사진은 지연 로딩(loading="lazy"). 올린 jpg·png 는 빌드 전에 만들어 둔 WebP(public/uploads/_webp)로 바꿔 끼우고, 가로·세로 크기도 적어 둡니다.
   3) 사진 설명 문구(캡션): 마크다운 사진의 따옴표 글 ![설명](주소 "캡션") 또는 사진 바로 다음 줄이 ▲ 로 시작하면 사진 아래 캡션으로 바꿉니다. */
function rehypeSite() {
  const root = base.replace(/\/+$/, '');
  const fix = (u) => (typeof u === 'string' && u.startsWith('/') && !u.startsWith('//') && base !== '/' && !u.startsWith(base + '/') ? root + u : u);
  const text = (n) => (n.type === 'text' ? n.value : (n.children || []).map(text).join(''));
  /* 사진 한 장(과 그 뒤에 이어 쓴 ▲ 캡션 글자)만 들어 있는 문단 */
  const isImgPara = (n) => {
    if (n.type !== 'element' || n.tagName !== 'p') return false;
    const els = n.children.filter((c) => c.type === 'element');
    if (els.length !== 1 || els[0].tagName !== 'img') return false;
    const after = n.children.slice(n.children.indexOf(els[0]) + 1).map(text).join('').trim();
    const before = n.children.slice(0, n.children.indexOf(els[0])).map(text).join('').trim();
    return !before && (!after || after.startsWith('▲'));
  };
  return async (tree) => {
    const jobs = [];
    const walk = (n) => {
      if (n.type === 'element') {
        if (n.tagName === 'img') {
          const raw = n.properties.src;
          n.properties.loading = n.properties.loading || 'lazy'; n.properties.decoding = 'async';
          if (typeof raw === 'string' && /^\/uploads\/[^/]+\.(jpe?g|png)$/i.test(raw)) {
            const name = decodeURIComponent(raw.slice('/uploads/'.length));
            const file = 'public/uploads/_webp/' + name + '.webp';
            if (existsSync(file)) jobs.push(sharp(file).metadata().then((m) => {
              n.properties.src = fix('/uploads/_webp/' + encodeURIComponent(name) + '.webp');
              n.properties.width = m.width; n.properties.height = m.height;
            }).catch(() => { n.properties.src = fix(raw); }));
            else n.properties.src = fix(raw);
          } else n.properties.src = fix(raw);
        }
        if (n.tagName === 'a') n.properties.href = fix(n.properties.href);
      }
      (n.children || []).forEach(walk);
    };
    walk(tree);
    await Promise.all(jobs);
    /* 캡션 묶기 */
    const wrap = (parent) => {
      const kids = parent.children || [];
      for (let i = 0; i < kids.length; i++) {
        const k = kids[i];
        if (isImgPara(k)) {
          const img = k.children.find((c) => c.type === 'element' && c.tagName === 'img');
          let cap = '';
          const tail = k.children.slice(k.children.indexOf(img) + 1).map(text).join('').trim();
          if (tail.startsWith('▲')) cap = tail.replace(/^▲\s*/, '').trim();
          if (img.properties.title) { cap = String(img.properties.title); delete img.properties.title; }
          let j = i + 1; while (kids[j] && kids[j].type === 'text' && !kids[j].value.trim()) j++;
          const nx = kids[j];
          if (!cap && nx && nx.type === 'element' && nx.tagName === 'p' && /^\s*▲/.test(text(nx))) {
            cap = text(nx).replace(/^\s*▲\s*/, '').trim(); kids.splice(i + 1, j - i); 
          }
          const fig = { type: 'element', tagName: 'figure', properties: { className: ['ed-fig'] }, children: [img] };
          if (cap) fig.children.push({ type: 'element', tagName: 'figcaption', properties: {}, children: [{ type: 'text', value: cap }] });
          kids[i] = fig;
        } else wrap(k);
      }
    };
    wrap(tree);
  };
}

export default defineConfig({
  markdown: { rehypePlugins: [rehypeSite] },
  site,
  base,
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  devToolbar: { enabled: false },
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
  integrations: [
    sitemap({
      serialize(item) {
        if (/\/blog\/tag\//.test(item.url)) item.priority = 0.4;
        else if (/\/work\/page\//.test(item.url)) item.priority = 0.5;
        else if (/\/work\/[^/]+\/$/.test(item.url)) item.priority = 0.7;
        return item;
      },
      filter: (page) => !/\/(404|redirect)/.test(page),
    }),
  ],
});
