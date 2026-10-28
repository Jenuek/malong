import lead from '../../../data/lead.json';
import settings from '../../../data/settings.json';
/* 소재 찾기·견적 문의 페이지(find.html, quote.html)가 읽는 설정.
   endpoint 는 이메일·문의를 받는 Apps Script 웹앱 주소 — Pages CMS 의 '문의 접수 설정'에서 바꿉니다.
   비워 두면 이메일 입력 단계가 꺼지고, 문의는 예전처럼 카카오톡/복사 방식으로 동작합니다. */
const ok = (u) => (/^https:\/\/[^\s"'<>]+$/i.test(String(u || '').trim()) ? String(u).trim() : '');
export function GET() {
  const body = { endpoint: ok(lead.endpoint), kakao: ok(settings.kakao_url), privacy: '' };
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
