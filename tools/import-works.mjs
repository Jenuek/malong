// 작품 목록(CSV)을 data/works/<ID>.json 으로 한꺼번에 바꿔 줍니다.
// 사용:  node tools/import-works.mjs works.csv
// CSV 첫 줄(머리글): id,name,materials,category,year,region,client,tags,image,desc
//   materials / tags 는 쉼표(,) 또는 슬래시(/) 로 구분  (예: frp/metal   로비/포토존)
//   image 는 src/assets/images/ 안에 올려 둔 파일 이름 (예: works/401.jpg), 없으면 비워 두세요.
// 이미 있는 같은 ID 파일은 덮어씁니다.
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const file = process.argv[2];
if (!file) { console.log('사용법: node tools/import-works.mjs works.csv'); process.exit(1); }
function parse(text) {
  const rows = []; let row = [], cur = '', q = false;
  text = text.replace(/^﻿/, '');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
    else if (c !== '\r') cur += c;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows.filter((r) => r.some((x) => x.trim()));
}
const rows = parse(readFileSync(file, 'utf8'));
const head = rows.shift().map((h) => h.trim());
const list = (v) => String(v || '').split(/[,/、;]/).map((x) => x.trim()).filter(Boolean);
mkdirSync('data/works', { recursive: true });
let n = 0;
for (const r of rows) {
  const o = Object.fromEntries(head.map((h, i) => [h, (r[i] || '').trim()]));
  if (!o.id || !o.name) { console.warn('건너뜀(ID/이름 없음):', r.join(',')); continue; }
  const img = o.image ? (o.image.startsWith('/') ? o.image : '/src/assets/images/' + o.image.replace(/^images\//, '')) : '';
  const d = {
    show: true, id: o.id, name: o.name, materials: list(o.materials).map((x) => x.toLowerCase()),
    category: o.category || '', year: /^\d{4}$/.test(o.year) ? Number(o.year) : '', region: o.region || '', client: o.client || '',
    tags: list(o.tags), image: img, gallery: [], alt: '', desc: o.desc || '', seo_title: '', seo_description: '',
  };
  writeFileSync(`data/works/${o.id}.json`, JSON.stringify(d, null, 2) + '\n');
  n++;
}
console.log(`${n}개 작품 파일을 data/works/ 에 만들었어요.`);
