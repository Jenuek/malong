import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { getSite, ORIGIN } from '../../lib/data.js';

export async function GET() {
  const site = await getSite();
  const posts = (await getCollection('editorial')).filter((e) => !e.data.draft && !e.data.noindex)
    .sort((a, b) => b.data.date - a.data.date);
  return rss({
    title: site.settings.siteName + ' 블로그',
    description: '조형물 · 공공미술 · 건축미술 · 전시 프로젝트의 제작 이야기',
    site: ORIGIN + '/',
    items: posts.map((e) => ({
      title: e.data.title, pubDate: e.data.date, description: e.data.description,
      link: ORIGIN + '/blog/' + (e.data.slug || e.id) + '/', categories: e.data.tags,
    })),
    customData: '<language>ko-KR</language>',
  });
}
