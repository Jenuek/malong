// 빌드 후 점검 — dist 안의 모든 페이지에서 사이트 내부 링크·이미지·스크립트·앵커(#…)가 실제로 있는지 확인합니다.
// 깨진 게 있으면 목록을 보여 주고 빌드를 실패로 처리합니다. (페이지를 합치거나 주소를 바꿀 때 놓친 링크를 잡아 줍니다)
import { readdirSync, readFileSync, statSync, existsSync } from 'fs';
import { join, posix } from 'path';

const ROOT = 'dist';
const BASE = ((process.env.BASE_PATH || '/malong').replace(/\/+$/, '')) + '/';
const walk = (d, out = []) => { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p, out) : out.push(p); } return out; };
const files = walk(ROOT);
const pages = files.filter((f) => f.endsWith('.html'));
const urlOf = (f) => { let u = '/' + f.slice(ROOT.length + 1).split('\\').join('/'); return u.endsWith('/index.html') ? u.slice(0, -10) : u; };

const exists = new Set(files.map((f) => '/' + f.slice(ROOT.length + 1).split('\\').join('/')));
const hasTarget = (path) => {   // path: BASE 를 뺀 '/a/b/' 또는 '/a.html'
  if (exists.has(path)) return true;
  const dir = path.endsWith('/') ? path : path + '/';
  return exists.has(dir + 'index.html');
};
const idCache = new Map();
const idsOf = (path) => {
  if (idCache.has(path)) return idCache.get(path);
  const f = exists.has(path) ? path : (path.endsWith('/') ? path : path + '/') + 'index.html';
  const ids = new Set(); const html = readFileSync(join(ROOT, f), 'utf8');
  for (const m of html.matchAll(/\sid="([^"]+)"/g)) ids.add(m[1]);
  idCache.set(path, ids); return ids;
};

const SKIP = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#?$|\{|%7B)/i;   // 외부 주소 · mailto · tel · javascript · data
const problems = [];
for (const file of pages) {
  const pageUrl = urlOf(file);                      // 예: /about/
  const html = readFileSync(file, 'utf8');
  const refs = [];
  for (const m of html.matchAll(/\s(?:href|src|poster)="([^"]*)"/g)) refs.push(m[1]);
  for (const m of html.matchAll(/\ssrcset="([^"]*)"/g)) for (const part of m[1].split(',')) refs.push(part.trim().split(/\s+/)[0]);
  for (const m of html.matchAll(/http-equiv="refresh"\s+content="[^"]*url=([^"]+)"/gi)) refs.push(m[1]);
  for (let raw of refs) {
    raw = raw.replace(/&#38;|&amp;/g, '&');
    if (!raw || SKIP.test(raw) && !raw.startsWith('#')) continue;
    if (/['"+<>\s]/.test(raw)) continue;                              // 스크립트 안에서 조립되는 문자열 조각
    if (/^#\/?$/.test(raw) || raw.startsWith('#/')) continue;           // 예전 주소(#/…) 호환
    let [pathPart, hash = ''] = raw.split('#'); pathPart = decodeURIComponent(pathPart.split('?')[0]);
    let target;
    if (!pathPart) target = pageUrl;                                  // 같은 페이지 안 앵커
    else if (pathPart.startsWith('/')) {
      if (!pathPart.startsWith(BASE)) { problems.push([pageUrl, raw, `사이트 주소(${BASE})로 시작하지 않는 내부 경로`]); continue; }
      target = '/' + pathPart.slice(BASE.length);
    } else target = posix.normalize(posix.join(pageUrl.endsWith('/') ? pageUrl : posix.dirname(pageUrl) + '/', pathPart));
    if (pathPart && !hasTarget(target)) { problems.push([pageUrl, raw, '대상 파일이 없습니다']); continue; }
    if (hash && /\.html$|\/$|^[^.]*$/.test(target) && !idsOf(target).has(decodeURIComponent(hash))) problems.push([pageUrl, raw, `앵커 #${hash} 가 대상 페이지에 없습니다`]);
  }
}
if (problems.length) {
  const uniq = [...new Map(problems.map((p) => [p.join('|'), p])).values()];
  console.error(`\n[check-links] 깨진 내부 링크 ${uniq.length}건`);
  for (const [page, ref, why] of uniq) console.error(` - ${page}  →  ${ref}   (${why})`);
  console.error('');
  process.exit(1);
}
console.log(`[check-links] ${pages.length}개 페이지의 내부 링크 점검 통과`);
