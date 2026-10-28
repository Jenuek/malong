// 빌드 후 정리: 어디에서도 쓰이지 않는 원본 사진 파일을 dist 에서 지웁니다 (배포 용량 절약)
import { readdirSync, readFileSync, statSync, unlinkSync } from 'fs';
import { join, extname } from 'path';
const root = 'dist', asset = join(root, '_astro');
const text = ['.html', '.json', '.css', '.js', '.xml', '.svg', '.txt'];
function walk(d, out = []) { for (const f of readdirSync(d)) { const p = join(d, f), s = statSync(p); if (s.isDirectory()) walk(p, out); else out.push(p); } return out; }
const all = walk(root);
let blob = '';
for (const f of all) if (text.includes(extname(f))) blob += readFileSync(f, 'utf8') + '\n';
let n = 0, bytes = 0;
for (const f of readdirSync(asset)) {
  if (!/\.(jpe?g|png|webp|avif|gif)$/i.test(f)) continue;
  if (!blob.includes(f)) { const p = join(asset, f); bytes += statSync(p).size; unlinkSync(p); n++; }
}
console.log(`[prune] 쓰이지 않는 원본 사진 ${n}개 삭제 (${(bytes / 1048576).toFixed(1)}MB)`);
