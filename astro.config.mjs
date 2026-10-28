import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/* 주소 설정 — 나중에 도메인이 정해지면 GitHub 저장소의 Settings → Variables 에서
   SITE_URL (예: https://www.malong.co.kr), BASE_PATH (도메인 루트면 /) 만 바꾸면 됩니다. */
const site = process.env.SITE_URL || 'https://jenuek.github.io';
const base = process.env.BASE_PATH || '/malong';
const origin = site.replace(/\/+$/, '') + (base === '/' ? '' : base.replace(/\/+$/, ''));

/* 에디토리얼 글 안의 '/uploads/…' 같은 사이트 안 주소에 base 를 붙이고, 사진은 지연 로딩 */
function rehypeSite() {
  const fix = (u) => (typeof u === 'string' && u.startsWith('/') && !u.startsWith('//') && base !== '/' && !u.startsWith(base + '/') ? base.replace(/\/+$/, '') + u : u);
  const walk = (n) => {
    if (n.type === 'element') {
      if (n.tagName === 'img') { n.properties.src = fix(n.properties.src); n.properties.loading = n.properties.loading || 'lazy'; n.properties.decoding = 'async'; }
      if (n.tagName === 'a') n.properties.href = fix(n.properties.href);
    }
    (n.children || []).forEach(walk);
  };
  return (tree) => walk(tree);
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
      customPages: [origin + '/guide.html'],
      serialize(item) {
        if (/\/editorial\/tag\//.test(item.url)) item.priority = 0.4;
        else if (/\/work\/page\//.test(item.url)) item.priority = 0.5;
        else if (/\/work\/[^/]+\/$/.test(item.url)) item.priority = 0.7;
        return item;
      },
      filter: (page) => !/\/(404|redirect)/.test(page),
    }),
  ],
});
