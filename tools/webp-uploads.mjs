// 블로그 본문 사진 최적화: public/uploads 의 jpg·png 를 WebP(가로 최대 1600px)로 바꿔 public/uploads/_webp/ 에 만듭니다.
// 사이트를 만들 때(npm run build) 자동으로 먼저 실행돼요. 원본은 그대로 두고, 만들어진 파일은 저장소에 올라가지 않습니다.
import { readdirSync, mkdirSync, existsSync, statSync } from 'fs';
import { join, extname } from 'path';
import sharp from 'sharp';

const src = 'public/uploads', out = join(src, '_webp');
if (!existsSync(src)) { console.log('[webp] public/uploads 가 없어 건너뜁니다.'); process.exit(0); }
mkdirSync(out, { recursive: true });
let n = 0, skipped = 0;
for (const f of readdirSync(src)) {
  const p = join(src, f);
  if (!statSync(p).isFile() || !/\.(jpe?g|png)$/i.test(extname(f))) continue;
  const o = join(out, f + '.webp');
  if (existsSync(o) && statSync(o).mtimeMs >= statSync(p).mtimeMs) { skipped++; continue; }
  try {
    await sharp(p).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 78 }).toFile(o);
    n++;
  } catch (e) { console.warn('[webp] 변환하지 못했어요:', f, e.message); }
}
console.log(`[webp] 본문 사진 ${n}장을 WebP 로 만들었습니다 (이미 있던 것 ${skipped}장).`);
