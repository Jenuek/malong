/**
 * 마롱컴퍼니 사이트 — 이메일(리드) 수집 · 견적 문의 접수 (Google Apps Script 웹앱)
 *
 * 하는 일
 *  1) 소재 찾기에서 입력한 이메일을 '리드' 시트에 저장
 *  2) 소재 찾기 결과(선택 내용)를 같은 리드 행에 이어서 기록
 *  3) 견적 문의를 '견적문의' 시트에 저장하고 NOTIFY_TO 메일로 바로 전달
 *  4) (선택) 두레이 메신저 방에도 알림
 *
 * 설치/수정 방법은 저장소의 '문의접수_설정.md' 를 보세요.
 * 두레이 웹훅 주소 같은 비밀값은 코드에 쓰지 않고 [프로젝트 설정 → 스크립트 속성]에 넣습니다.
 */

var NOTIFY_TO = 'admin@malong.co.kr';      // 견적 문의 메일을 받을 주소
var NOTIFY_ON_LEAD = false;                 // true 로 바꾸면 이메일 입력(리드)마다 알림 메일도 받습니다
var SHEET_LEADS = '리드';
var SHEET_INQ = '견적문의';
var MAX_PER_EMAIL_HOUR = 6;                 // 같은 이메일이 1시간에 보낼 수 있는 횟수
var MAX_PER_HOUR = 300;                     // 전체 1시간 상한 (스팸 폭주 방지)

var LEAD_HEAD = ['접수시각', '리드ID', '이메일', '마케팅 수신동의', '동의버전', '처음 본 페이지', '유입 경로', 'utm_source', 'utm_medium', 'utm_campaign', '선택 내용(처음)', '최근 선택', '최근 갱신', '상태'];
var INQ_HEAD = ['접수시각', '접수ID', '리드ID', '이름', '회사·기관', '이메일', '연락처', '수량', '예산', '희망 설치일', '참고·기타 요청', '선택 내용', '가견적', '마케팅 수신동의', '유입 경로', '처리 상태', '담당자 메모'];

function doGet() { return out({ ok: true, service: 'malong-lead' }); }

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(25000);
    var p = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    return out(handle(p));
  } catch (err) {
    console.error(err && err.stack || err);
    return out({ ok: false, error: 'server' });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function handle(p) {
  if (!p || p.v !== 1 || ['lead', 'select', 'inquiry'].indexOf(p.type) < 0) return { ok: false, error: 'bad' };
  if (p.hp) return { ok: true };                         // 스팸 봇이 숨은 칸을 채웠으면 조용히 버립니다
  if (p.type === 'lead' && p.dwell != null && p.dwell < 700) return { ok: true };   // 너무 빠른 제출(봇)
  var cache = CacheService.getScriptCache();
  var hour = Math.floor(Date.now() / 3600000);
  if (!bump(cache, 'g' + hour, MAX_PER_HOUR)) return { ok: false, error: 'busy' };

  if (p.type === 'select') { touchLead(p); return { ok: true }; }

  var email = clean(p.email, 120).toLowerCase();
  if (!/^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']{2,}$/.test(email)) return { ok: false, error: 'email' };
  if (p.consentPrivacy !== true) return { ok: false, error: 'consent' };
  if (!bump(cache, 'e' + hour + email, MAX_PER_EMAIL_HOUR)) return { ok: false, error: 'busy' };

  if (p.type === 'lead') {
    var lid = id(p.leadId);
    if (!lid) return { ok: false, error: 'id' };
    if (cache.get('L' + lid)) return { ok: true };       // 같은 요청이 다시 온 경우
    cache.put('L' + lid, '1', 21600);
    var s = sheet(SHEET_LEADS, LEAD_HEAD), sn = p.snapshot || {};
    s.appendRow([now(), lid, safe(email), p.consentMarketing ? 'Y' : 'N', clean(p.consentVer, 10), clean(p.page, 40), clean(p.ref, 200),
      clean(p.utm_source, 80), clean(p.utm_medium, 80), clean(p.utm_campaign, 80), snapText(sn), '', '', '리드']);
    if (NOTIFY_ON_LEAD) notify('[새 리드] ' + email, '이메일: ' + email + '\n마케팅 수신동의: ' + (p.consentMarketing ? '예' : '아니오') + '\n선택 내용: ' + snapText(sn) + '\n유입: ' + clean(p.ref, 200));
    return { ok: true };
  }

  /* 견적 문의 */
  var iid = id(p.id);
  if (!iid) return { ok: false, error: 'id' };
  if (cache.get('Q' + iid)) return { ok: true };
  var name = clean(p.name, 60), company = clean(p.company, 100), phone = clean(p.phone, 40);
  if (!name) return { ok: false, error: 'name' };
  cache.put('Q' + iid, '1', 21600);
  var f = p.fields || {}, items = (p.items || []).map(function (r) { return clean(r[0], 40) + ': ' + clean(r[1], 120); });
  var price = '';
  (p.items || []).forEach(function (r) { if (/가견적/.test(String(r[0]))) price = clean(r[1], 80); });
  sheet(SHEET_INQ, INQ_HEAD).appendRow([now(), iid, id(p.leadId), safe(name), safe(company), safe(email), safe(phone), safe(clean(f.qty, 20)), safe(clean(f.budget, 80)), safe(clean(f.date, 20)),
    safe(clean(f.ref, 2000)), safe(items.join(' / ')), safe(price), p.consentMarketing ? 'Y' : 'N', clean(p.ref, 200), '신규', '']);
  markLead(id(p.leadId), email, '문의 완료');

  var subject = '[견적 문의] ' + name + (company ? ' (' + company + ')' : '') + (price ? ' · ' + price : '');
  var body = clean(p.text, 4000, true) + '\n\n──────────\n' +
    '이름: ' + name + '\n회사·기관: ' + (company || '-') + '\n이메일: ' + email + '\n연락처: ' + (phone || '-') + '\n마케팅 수신동의: ' + (p.consentMarketing ? '예' : '아니오') + '\n' +
    (p.picked ? '' : '※ 소재 찾기를 거치지 않고 바로 접수된 문의입니다.\n') + '접수번호: ' + iid + '\n\n이 메일에 답장하면 고객 이메일(' + email + ')로 바로 전달됩니다.';
  notify(subject, body, email);
  return { ok: true };
}

/* ---------- 도우미 ---------- */
function ss() { return SpreadsheetApp.getActiveSpreadsheet(); }
function sheet(name, head) {
  var s = ss().getSheetByName(name);
  if (!s) { s = ss().insertSheet(name); s.appendRow(head); s.setFrozenRows(1); s.getRange(1, 1, 1, head.length).setFontWeight('bold').setBackground('#EADAF0'); }
  return s;
}
function now() { return Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss'); }
function id(v) { v = String(v || ''); return /^[a-z0-9]{8,32}$/i.test(v) ? v : ''; }
function clean(v, max, keepNewline) {
  v = String(v == null ? '' : v).replace(keepNewline ? /[\u0000-\u0009\u000B\u000C\u000E-\u001F]/g : /[\u0000-\u001F]/g, ' ').trim();
  return v.slice(0, max || 200);
}
function safe(v) { v = String(v); return /^[=+\-@\t\r]/.test(v) ? "'" + v : v; }   // 시트 수식 삽입 방지
function bump(cache, key, max) {
  var n = parseInt(cache.get(key) || '0', 10) + 1;
  if (n > max) return false;
  cache.put(key, String(n), 3700);
  return true;
}
var MAT_KR = { frp: 'FRP', eps: '스티로폼+우레아', metal: '금속', acrylic: '아크릴·LED', brass: '황동 주조', print: '3D프린팅' };
function snapText(sn) {
  if (!sn || !sn.env) return '';
  var rec = (sn.rec || []).map(function (m) { return MAT_KR[m] || m; }).join(', ');
  return clean('장소 ' + sn.env + ' / 기간 ' + sn.dur + ' / 형태 ' + sn.form + ' / 높이 ' + sn.height + 'cm / 추천 ' + rec + (sn.price ? ' / 가견적 ' + sn.price : ''), 300);
}
function findRow(s, lid) {
  if (!lid || s.getLastRow() < 2) return 0;
  var f = s.getRange(2, 2, s.getLastRow() - 1, 1).createTextFinder(lid).matchEntireCell(true).findNext();
  return f ? f.getRow() : 0;
}
function touchLead(p) {                                   // 소재 찾기를 마치고 문의 페이지로 넘어갈 때 최근 선택을 갱신
  var lid = id(p.leadId); if (!lid) return;
  var s = sheet(SHEET_LEADS, LEAD_HEAD), r = findRow(s, lid); if (!r) return;
  s.getRange(r, 12, 1, 3).setValues([[snapText(p.snapshot), now(), '문의 페이지 이동']]);
}
function markLead(lid, email, status) {
  var s = sheet(SHEET_LEADS, LEAD_HEAD), r = findRow(s, lid);
  if (r) s.getRange(r, 13, 1, 2).setValues([[now(), status]]);
}
function notify(subject, body, replyTo) {
  var opt = { to: NOTIFY_TO, subject: clean(subject, 200), body: body, name: '마롱컴퍼니 사이트' };
  if (replyTo) opt.replyTo = replyTo;
  MailApp.sendEmail(opt);
  var hook = PropertiesService.getScriptProperties().getProperty('DOORAY_WEBHOOK');   // 선택: 두레이 메신저 알림
  if (hook) {
    try {
      UrlFetchApp.fetch(hook, { method: 'post', contentType: 'application/json', muteHttpExceptions: true,
        payload: JSON.stringify({ botName: '마롱 사이트', text: clean(subject, 200) + '\n' + clean(body, 900, true) }) });
    } catch (e) { console.error(e); }
  }
}

/* 설치 후 한 번 실행해서 권한 승인과 메일 발송을 확인하는 용도 */
function testMail() { notify('[테스트] 마롱컴퍼니 문의 접수 연결 확인', '이 메일이 보이면 사이트 문의 → 메일 전달이 정상입니다.'); }
