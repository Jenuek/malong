import { ORIGIN } from '../lib/data.js';
export function GET() {
  return new Response(`User-agent: *\nAllow: /\nDisallow: ${new URL(ORIGIN + '/').pathname}track.html\nDisallow: ${new URL(ORIGIN + '/').pathname}confirm.html\n\nSitemap: ${ORIGIN}/sitemap-index.xml\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
