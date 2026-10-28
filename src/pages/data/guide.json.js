import guide from '../../../data/guide.json';
/* 견적 가이드(guide.html)가 읽는 문구 — Pages CMS 의 '견적 가이드' 항목을 고치면 반영됩니다 */
export function GET() {
  return new Response(JSON.stringify(guide), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
