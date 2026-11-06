// 빌드 전 설정 점검 — 코드(src/lib/normalize.js)의 분류 목록과 관리 화면(.pages.yml)의 선택 항목이 같은지,
// 그리고 모든 작품(data/works/*.json)이 허용된 값만 쓰는지 확인합니다. 어긋나면 빌드를 멈추고 이유를 알려 줍니다.
// (어긋난 값은 사이트에서 조용히 사라지기 때문에, 미리 잡아 두려는 장치입니다)
import { readFileSync, readdirSync } from 'fs';
import { parse } from 'yaml';
import { TYPES, PURPOSES, REGIONS, KEYWORDS } from '../src/lib/normalize.js';

const LISTS = { types: TYPES, purposes: PURPOSES, regions: REGIONS, keywords: KEYWORDS };
const errors = [];

/* 1) .pages.yml 의 작품 선택 항목 = 코드 목록 */
const cfg = parse(readFileSync('.pages.yml', 'utf8'));
const works = (cfg.content || []).find((c) => c.name === 'works');
if (!works) errors.push('.pages.yml 에서 works 항목을 찾지 못했습니다.');
else {
  for (const [name, list] of Object.entries(LISTS)) {
    const f = (works.fields || []).find((x) => x.name === name);
    const vals = f && f.options && f.options.values;
    if (!vals) { errors.push(`.pages.yml 의 works.${name} 선택 항목을 찾지 못했습니다.`); continue; }
    if (JSON.stringify(vals) !== JSON.stringify(list))
      errors.push(`'${name}' 목록이 다릅니다.\n   코드(src/lib/normalize.js): ${list.join(' | ')}\n   관리 화면(.pages.yml)   : ${vals.join(' | ')}\n   → 두 곳을 같은 순서·글자로 맞춰 주세요.`);
  }
}

/* 2) 작품 데이터가 허용된 값만 쓰는지 */
for (const file of readdirSync('data/works').filter((f) => f.endsWith('.json'))) {
  const w = JSON.parse(readFileSync('data/works/' + file, 'utf8'));
  for (const [name, list] of Object.entries(LISTS)) {
    for (const v of w[name] || []) if (!list.includes(v)) errors.push(`작품 ${file}: ${name} 에 허용되지 않은 값 '${v}' (사이트에 표시되지 않습니다)`);
  }
}

if (errors.length) {
  console.error('\n[check-config] 설정 점검 실패 ' + errors.length + '건\n' + errors.map((e) => ' - ' + e).join('\n') + '\n');
  process.exit(1);
}
console.log('[check-config] 분류 목록 · 작품 데이터 점검 통과');
