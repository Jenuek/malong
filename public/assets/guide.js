(function () {
  'use strict';

  /* =====================================================================
     설정
     문구·점수·가견적 금액·사진은 data/guide.json 에 있고, Pages CMS 의 "견적 가이드" 에서 고칩니다.
     KAKAO_URL     : 카카오톡 채널 채팅 주소 (예: https://pf.kakao.com/_abcDEF/chat).
                     비워 두면 '카카오톡 문의하기' 버튼 대신 '내용 복사하기' 버튼이 보입니다.
                     (CMS 의 ct_kakao 칸에 넣어도 됩니다. CMS 값이 우선합니다.)
     SITE_URL      : 사이트 메인(Home/Work/About) 파일 이름. 메뉴와 '작품 보기' 링크가 이 파일로 연결됩니다.
     PORTFOLIO_URL : 소재 화면의 '작업 사례 더 보기' 버튼이 열 포트폴리오 주소.
     ===================================================================== */
  var CONFIG = {
    KAKAO_URL: '',
    PORTFOLIO_URL: '',
    SITE_URL: './',
    LEAD_URL: '',          // 이메일·문의를 받는 주소(Apps Script 웹앱). 사이트 설정(data/lead-config.json)에서 자동으로 채워집니다.
    PRIVACY_URL: 'privacy/'
  };
  /* 이 파일은 두 페이지가 함께 씁니다. find.html = 소재 찾기·가견적(1~3단계), quote.html = 견적 문의 */
  var MODE = window.GUIDE_MODE === 'quote' ? 'quote' : 'find';

  var CONTENT = {};
  var ORDER = [], SEEN = {}, DEF = {}, LDEF = {}, NDEF = {}, FDEF = {}, PHOTOS = [];
  /* JSON 에는 점(.)이 들어간 이름을 쓸 수 없어 '.' 대신 '_' 로 저장합니다 (예: m.frp.name → m_frp_name) */
  function K(k) { return String(k).replace(/\./g, '_'); }

  function reg(k) { if (!SEEN[k]) { SEEN[k] = 1; ORDER.push(k); } }
  function has(k) { return Object.prototype.hasOwnProperty.call(CONTENT, K(k)); }
  function T(k, d) { reg(k); DEF[k] = d; return has(k) ? CONTENT[K(k)] : d; }
  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function LS(k, d) {
    reg(k); LDEF[k] = d;
    var re = new RegExp('^' + escRe(K(k)) + '_(\\d+)$'), items = [];
    Object.keys(CONTENT).forEach(function (key) { var m = re.exec(key); if (m) items.push([parseInt(m[1], 10), CONTENT[key]]); });
    if (!items.length) return d;
    items.sort(function (a, b) { return a[0] - b[0]; });
    return items.map(function (x) { return x[1]; }).filter(function (s) { return String(s).trim() !== ''; });
  }
  // 0~5 점수
  function NV(k, d) {
    reg(k); NDEF[k] = d;
    if (!has(k)) return d;
    var n = parseInt(CONTENT[K(k)], 10);
    return isNaN(n) ? d : Math.max(0, Math.min(5, n));
  }
  // 0 이상의 일반 숫자 (가견적 단가·일수 등)
  function NN(k, d) {
    reg(k); FDEF[k] = d;
    if (!has(k)) return d;
    var n = parseFloat(String(CONTENT[K(k)]).replace(/[,\s원]/g, ''));
    return (isNaN(n) || n < 0) ? d : n;
  }
  function imgURL(u) {
    u = String(u || '').trim(); if (!u) return '';
    if (/^https:\/\//i.test(u)) return u;
    u = u.replace(/^\/(?!\/)/, '');
    // 저장소 안의 사진 (예: images/frp-1.jpg)
    return /^(?![a-z][a-z0-9+.-]*:)(?!\/\/)[\w.\-\/%]+\.(?:jpe?g|png|webp|gif|avif)$/i.test(u) ? u : '';
  }
  function PK(k) { reg(k); DEF[k] = ''; if (PHOTOS.indexOf(k) < 0) PHOTOS.push(k); return has(k) ? imgURL(CONTENT[K(k)]) : ''; }
  function linkURL(u) { u = String(u || '').trim(); return /^https:\/\//i.test(u) ? u : ''; }
  function P(id) { var k = 'm.' + id + '.photo'; reg(k); if (PHOTOS.indexOf(k) < 0) PHOTOS.push(k); return has(k) ? imgURL(CONTENT[K(k)]) : ''; }
  function kakaoURL() {
    reg('ct.kakao'); DEF['ct.kakao'] = CONFIG.KAKAO_URL || '';
    var u = (has('ct.kakao') && String(CONTENT[K('ct.kakao')]).trim()) ? CONTENT[K('ct.kakao')] : CONFIG.KAKAO_URL;
    u = String(u || '').trim();
    return /^https:\/\//i.test(u) ? u : '';
  }

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function escBr(s) { return esc(s).replace(/\r?\n/g, '<br>'); }
  function clean(s) { return String(s).replace(/\s+/g, ' ').trim(); }

  var MATS = [
    { id: 'frp', no: '01', name: 'FRP', sub: '유리섬유강화플라스틱',
      tag: '곡면과 캐릭터 표현에 가장 폭넓게 쓰이는 가볍고 단단한 소재',
      meta: ['실내·실외', '₩₩', '기간 보통~긴 편'], rate: [5,4,4,4,3],
      good: ['곡면·캐릭터 같은 유기적인 형태를 가장 자유롭게 표현할 수 있어요.', '가볍고 단단하며 물과 부식에 강해 실외 설치에 적합해요.', '몰드를 한 번 만들면 같은 형태를 여러 개 만들기 쉬워요. 반투명 수지로 내부 조명을 넣는 것도 가능해요.'],
      know: ['원형과 몰드를 만드는 공정이 있어 1점만 제작하면 초기 비용과 기간 부담이 커요.', '강한 충격에는 균열이 생길 수 있어요. 부분 보수는 가능해요.', '오래 설치하면 자외선으로 도장 색이 바랠 수 있어 재도장 계획이 필요해요.'],
      steps: '원형 확정 → 몰드 → 유리섬유·수지 적층 → 샌딩·도장',
      ask: ['같은 형태를 몇 개 제작하시나요? 수량에 따라 몰드 방식이 유리한지 달라져요.', '바닥 앵커, 좌대, 벽체 중 설치 방식은 어떻게 되나요?', '야간 점등이 필요하신가요? 반투명 FRP에 내부 투광이 가능해요.'],
      use: '캐릭터 마스코트, 곡면 포토존, 시리즈로 여러 개 제작하는 조형물' },
    { id: 'eps', no: '02', name: '스티로폼 + 우레아 코팅', sub: '가공 스티로폼에 폴리우레아 코팅',
      tag: '가볍게, 크게, 빠르게. 대형·단기 프로젝트에 강한 소재',
      meta: ['실내 · 실외 단기~중기', '₩', '기간 짧음'], rate: [4,2,5,5,1],
      good: ['크기가 커도 가볍고, 운반과 설치가 쉬워요.', '몰드 없이 직접 가공해서 1점 제작과 짧은 납기에 유리해요.', '입체 글자, 큰 소품 같은 단순~중간 복잡도의 형태를 경제적으로 만들 수 있어요.'],
      know: ['표면이 손상되면 안쪽 스티로폼이 드러나 수분과 파손에 약해요. 장기 실외 설치는 FRP·금속보다 내구성이 낮아요.', '충격과 긁힘에 약해 사람 손이 자주 닿는 곳은 보강이 필요해요.', '스티로폼은 불에 약해요. 방염 기준이 필요한 장소라면 미리 알려 주세요.'],
      steps: '형태 확정 → 스티로폼 절삭·조립 → 우레아 코팅·경화 → 퍼티·도장',
      ask: ['설치 기간은 얼마나 되나요? 행사·전시 기간인지 영구 설치인지 알려 주세요.', '실외라면 비바람과 직사광선에 노출되나요?', '방염 성능이 요구되는 시설인가요? 관람객이 만지거나 기댈 수 있는 위치인가요?'],
      use: '대형 입체 글자, 전시·행사용 대형 연출물, 단기~중기 설치' },
    { id: 'metal', no: '03', name: '금속', sub: '스테인리스 · 알루미늄 · 철(갈바)',
      tag: '정제된 라인과 오래가는 내구성. 구조와 마감을 모두 책임지는 소재',
      meta: ['실내·실외 장기', '₩ ~ ₩₩₩', '기간 보통'], rate: [3,4,2,5,1],
      variants: [
        ['스테인리스', '녹에 강하고 헤어라인·미러 같은 고급 질감. 무겁고 비싸며 용접·연마 품질이 완성도를 좌우해요.'],
        ['알루미늄', '가볍고 가공이 쉬워요(강철의 약 1/3 밀도). 절대 강도는 낮아 큰 구조는 보강이 필요하고 용접 열변형에 주의해야 해요.'],
        ['철(갈바·아연도금)', '가장 경제적이고 강도가 높아 골조와 좌대에 적합해요. 도금이 손상되면 녹이 슬 수 있어 도장·보수가 필요해요.']],
      good: ['각진 형태, 글자, 사인 같은 기하학적 조형을 정밀하게 만들 수 있어요.', '실외에서 오래 쓰는 외장과 구조체에 알맞아요.', '표면 마감(헤어라인, 미러, 도장)으로 분위기를 폭넓게 고를 수 있어요.'],
      know: ['곡면이 많은 형태는 FRP나 주물이 더 알맞을 수 있어요.', '해안·산업지대처럼 부식이 심한 환경은 소재 등급과 도장 사양이 달라져요.', '기초 공사, 앵커 방식, 하중 조건이 먼저 정해져 있어야 해요.'],
      steps: '도면·전개도 확정 → 절단·절곡·용접 → 연마·도장 마감 → 운반·설치',
      ask: ['설치 지역이 해안이나 산업지대인가요?', '원하는 표면 마감은 헤어라인, 미러, 도장 중 어떤 쪽인가요?', '기초 공사와 앵커 방식, 하중 조건이 정해져 있나요?'],
      use: '로비·광장 상징 조형물, 글자·사인, 장기 실외 설치, 내부 골조와 좌대' },
    { id: 'acrylic', no: '04', name: '아크릴 · PC · 광확산시트', sub: '+ LED 조명',
      tag: '빛을 품은 조형물. 밤에 완성되는 투광·포토존용 소재',
      meta: ['실내 · 실외(방수 설계 필요)', '₩₩', '기간 보통'], rate: [3,3,3,3,5],
      variants: [
        ['아크릴(PMMA)', '투명도가 매우 높고 가공·접합이 깔끔하며 비교적 저렴해요. 충격에 깨질 수 있어요.'],
        ['폴리카보네이트(PC)', '충격에 매우 강하고 투명도는 유리 수준이에요. 스크래치에 약해 표면 코팅을 확인해야 하고 아크릴보다 비싸요.'],
        ['광확산시트·판', 'LED의 점 광원을 부드럽고 균일한 면광으로 바꿔 줘요. 두께와 확산도에 따라 밝기가 달라 시안 테스트가 필요해요.']],
      good: ['LED 포토존, 투광 사인처럼 빛으로 연출하는 조형에 가장 알맞아요.', '투명한 표현과 면발광을 정밀하게 만들 수 있어요.', '점등 방식(상시·타이머·센서)과 색, 밝기를 연출에 맞게 정할 수 있어요.'],
      know: ['전원 인입 위치와 공사 범위를 확인해야 해요. 1차 전기 인입은 별도인 경우가 많아요.', '실외라면 방수·방진 등급과 우천·결로 대응이 필요해요.', '사람 손이 닿는 높이는 소재 선택과 안전 사양에 영향을 줘요.'],
      steps: '형태·조명 연출 확정 → 판재 재단·성형·접합 → 프레임·LED 조립 → 점등 테스트·설치',
      ask: ['낮에도 보이는 형태인가요, 야간 점등이 핵심인가요?', '전원을 끌어올 위치가 가까이 있나요?', '실외라면 비와 습기에 대한 대응을 어디까지 원하세요?'],
      use: '야간 점등 포토존, 투광 사인, 면발광 조형' },
    { id: 'brass', no: '05', name: '황동 주물', sub: '황동 주조',
      tag: '시간이 지날수록 깊어지는 금속의 질감. 상징성과 고급감을 위한 선택',
      meta: ['실내 중심', '₩₩₩', '기간 긴 편'], rate: [5,3,1,2,1],
      good: ['미세한 디테일과 조각의 결을 그대로 재현해요.', '금속 특유의 무게감과 광택으로 상징성과 고급감이 강해요.', '관리가 잘 되면 매우 오래 보존할 수 있어요.'],
      know: ['소재와 공정 모두 비용이 높고 제작 기간이 길어요.', '매우 무거워서 기초와 설치 구조 설계가 중요해요. 대형은 분할 주조 후 용접해 이어 붙이는 경우가 많아요.', '황동은 청동보다 내식성이 낮아 산업·해안 환경의 실외에서는 변색 가능성이 있어요. 실외 장기 설치는 청동 등 대안을 함께 상담해 보세요.'],
      steps: '원형 확정 → 주형 제작 → 주조·분할 용접·연마 → 착색·코팅·설치',
      ask: ['설치 장소가 실내인가요, 실외인가요?', '최종 색감은 밝은 금색 유지, 자연 변색, 착색 마감 중 어느 쪽인가요?', '크기와 무게를 받칠 바닥·기초 조건이 되나요?'],
      use: '상징 조형물, 기념 오브제, 정밀 디테일의 소형~중형 조각' },
    { id: 'print', no: '06', name: '3D 프린팅', sub: '적층 제조 (FDM·레진)',
      tag: '복잡한 형태도 데이터 그대로. 정밀 표현과 빠른 시안에 강한 방식',
      meta: ['소재에 따라 다름', '₩ ~ ₩₩₩', '소형 짧음 · 대형 김'], rate: [5,2,4,2,2],
      good: ['몰드 없이 복잡한 형상과 유기적인 디테일을 구현해요.', '데이터 기반이라 수정이 쉽고 여러 방향에서 형태가 일관되게 나와요.', '출력한 원형을 FRP나 주물 제작으로 확장할 수 있어요.'],
      know: ['출력 크기에 한계가 있어 대형은 나눠서 출력하고 접합해요.', '적층 자국이 남아 샌딩·퍼티·도장 같은 후가공이 필요해요.', '소재에 따라 야외 내구성이 크게 달라요. PLA는 열과 자외선에 약해 실내용이고, 실외는 ASA처럼 내후성이 좋은 소재를 써요.'],
      steps: '3D 데이터 확정 → 분할 출력 → 접합·퍼티·샌딩 → 도장·조립',
      ask: ['최종 작품의 크기가 어느 정도인가요?', '실내와 실외 중 어디에 놓이나요?', '결과물이 출력물 자체인가요, FRP·주물 제작용 원형인가요?'],
      use: '정밀 캐릭터와 소품, 소형~중형 조형, 시안과 원형 제작' }
  ];


  // finder scores: 0 비추천, 1 조건부, 2 가능, 3 잘 맞음
  var SC = {
    frp:     { env: { in: 3, out: 3 }, dur: { s: 2, m: 3, l: 2 }, form: { c: 3, g: 1, l: 2, f: 2 }, size: { s: 3, l: 3 } },
    eps:     { env: { in: 3, out: 1 }, dur: { s: 3, m: 2, l: 0 }, form: { c: 2, g: 2, l: 0, f: 1 }, size: { s: 2, l: 3 } },
    metal:   { env: { in: 3, out: 3 }, dur: { s: 2, m: 3, l: 3 }, form: { c: 1, g: 3, l: 1, f: 1 }, size: { s: 2, l: 3 } },
    acrylic: { env: { in: 3, out: 2 }, dur: { s: 2, m: 2, l: 1 }, form: { c: 1, g: 2, l: 3, f: 1 }, size: { s: 3, l: 2 } },
    brass:   { env: { in: 3, out: 1 }, dur: { s: 1, m: 2, l: 3 }, form: { c: 2, g: 1, l: 0, f: 3 }, size: { s: 3, l: 1 } },
    print:   { env: { in: 3, out: 1 }, dur: { s: 3, m: 2, l: 1 }, form: { c: 2, g: 1, l: 1, f: 3 }, size: { s: 3, l: 1 } }
  };


  /* ---------- 고정 데이터 ---------- */
  var KEYS = ['env', 'dur', 'form', 'size'];
  var COMPFORM = { c: 'character', g: 'simple', l: 'simple', f: 'realistic' };
  var CMOD = { simple: { metal: .5, eps: .5, acrylic: .5 }, character: { frp: .5, eps: .25 }, realistic: { brass: .5, print: .5, frp: .25 } };
  var CALCMATS = ['frp', 'eps', 'metal', 'brass'];
  var RL = ['표현 자유도', '실외 내구성', '가벼움', '대형화', '조명(투광)'];
  var OPT = {
    env: [['in', '실내', '건물 안 · 전시장 · 매장'], ['out', '실외', '광장 · 공원 · 건물 외부']],
    dur: [['s', '단기', '행사·전시용'], ['m', '1~3년', '시즌·중기 운영'], ['l', '장기·영구', '오래 두고 쓰는 설치']],
    form: [['c', '곡면·캐릭터', '동물·캐릭터 등 유기적인 형태'], ['g', '각진 형태·글자·사인', '로고·입체 글자·기하학적 조형'], ['l', '빛으로 연출', '야간 점등·포토존'], ['f', '정밀 소형·상징물', '디테일이 중요한 작은 조각·기념물']],
    comp: [['simple', '단순 형태', '로고·기하학적 형태'], ['character', '캐릭터·입체', '동물·캐릭터'], ['realistic', '극사실·인체', '정밀한 묘사']]
  };
  var FIN = [['primer', '기본 프라이머', '직접 도색/무도색 출고'], ['urethane', '우레탄 도색', '고광택/지정 컬러 도장'], ['uv', '야외용 UV 코팅', '장기 야외 변색 방지'], ['chrome', '특수 크롬/도금', '미러 피니시/광택 가공']];
  var INS = [['self', '자체 수거', '공장 출고'], ['indoor', '실내 거치', '운송 및 안착'], ['outdoor', '야외 앙카', '기초 앙카 고정']];
  var CALCSUB = { frp: '야외 캐릭터/조형물 표준', eps: '단기 행사/실내 전시용', metal: '영구 설치/모던 조형물', brass: '기념비/동상/예술품', acrylic: '상담 후 견적', print: '상담 후 견적' };
  var CALCDEF = {
    mats: { frp: [1200000, 18], eps: [400000, 7], metal: [1800000, 21], brass: [3500000, 35] },
    comp: { simple: [1.0, 0], character: [1.35, 3], realistic: [1.75, 7] },
    fin: { primer: [0, 0], urethane: [350000, 3], uv: [550000, 4], chrome: [950000, 6] },
    inst: { self: [0, 0], indoor: [250000, 1], outdoor: [600000, 2] }
  };
  var CMP = [
    ['FRP', 'frp', [5, 4, 4, 4, 3], '₩₩', '보통~긴', '곡면·캐릭터, 같은 형태를 여러 개 제작'],
    ['스티로폼 + 우레아', 'eps', [4, 2, 5, 5, 1], '₩', '짧음', '대형·단기·행사용, 빠른 납기'],
    ['스테인리스', 'metal', [3, 5, 1, 5, 1], '₩₩₩', '보통', '장기 실외, 상징 조형물, 고급 질감'],
    ['알루미늄', 'metal', [3, 4, 4, 5, 1], '₩₩', '보통', '대형이지만 가벼워야 하는 판금·사인'],
    ['철(갈바)', 'metal', [2, 3, 1, 5, 1], '₩', '짧음~보통', '내부 골조, 좌대, 비용에 민감한 구조물'],
    ['아크릴·PC + LED', 'acrylic', [3, 3, 3, 3, 5], '₩₩', '보통', '야간 점등 포토존, 투광 사인'],
    ['황동 주물', 'brass', [5, 3, 1, 2, 1], '₩₩₩', '긴 편', '상징·기념 오브제, 정밀한 소형~중형'],
    ['3D 프린팅', 'print', [5, 2, 4, 2, 2], '₩ ~ ₩₩₩', '소형 짧음 / 대형 김', '정밀 소품, 시안, 원형 제작']
  ];
  var COMBO = [
    '금속(갈바) 골조 + FRP 외피: 큰 캐릭터를 가볍고 튼튼하게 세울 때',
    '3D 프린팅 원형 → FRP 또는 황동 주물: 형태를 먼저 확정하고 내구성 있는 소재로 제작할 때',
    '금속 프레임 + 아크릴/PC + LED: 점등 포토존과 사인 조형물',
    '스티로폼 + 우레아 본체 + 금속 좌대: 대형 조형물을 경제적으로 세울 때'
  ];
  var LOGO = 'M 61.8 1016.5 C 59.9 1016.5 58 1017.2 56.7 1018.6 C 55.4 1019.9 54.6 1021.7 54.6 1023.6 C 54.6 1025.5 55.4 1027.3 56.7 1028.7 C 58 1030 59.9 1030.8 61.8 1030.8 C 63.7 1030.8 65.5 1030 66.8 1028.7 C 68.2 1027.3 68.9 1025.5 68.9 1023.6 C 68.9 1021.7 68.2 1019.9 66.8 1018.6 C 65.5 1017.2 63.7 1016.5 61.8 1016.5 Z M 96.1 1027.9 L 110.4 1030.8 L 110.4 987.9 L 96.1 1002.2 Z M 84.4 1030.8 L 94.6 1020.7 L 61.8 987.9 L 61.8 1008.1 Z';

  /* ---------- 상태 ---------- */
  var SKEY = 'malong-guide-v2';
  var S = { step: 0, env: '', dur: '', form: '', height: 150, comp: '', mat: 'frp', ov: {}, f: { qty: '', budget: '', date: '', ref: '' }, c: { name: '', company: '', email: '', phone: '' }, sid: '' };
  var started = false;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function matById(id) { for (var i = 0; i < MATS.length; i++) if (MATS[i].id === id) return MATS[i]; return MATS[0]; }
  function mname(m) { return T('m.' + m.id + '.name', m.name); }
  function muse(m) { return T('m.' + m.id + '.use', m.use); }
  function ready() { return !!(S.env && S.dur && S.form); }
  function compEff() { return S.comp || COMPFORM[S.form] || 'character'; }
  function optName(g, v) { for (var i = 0; i < OPT[g].length; i++) if (OPT[g][i][0] === v) return T('o.' + g + '.' + v + '.n', OPT[g][i][1]); return ''; }
  function optSub(g, v) { for (var i = 0; i < OPT[g].length; i++) if (OPT[g][i][0] === v) return T('o.' + g + '.' + v + '.s', OPT[g][i][2]); return ''; }
  function finName(v) { for (var i = 0; i < FIN.length; i++) if (FIN[i][0] === v) return T('calc.f.' + v + '.n', FIN[i][1]); return ''; }
  function insName(v) { for (var i = 0; i < INS.length; i++) if (INS[i][0] === v) return T('calc.i.' + v + '.n', INS[i][1]); return ''; }
  function fmt(s, o) { return String(s).replace(/\{(\w+)\}/g, function (a, k) { return o[k] != null ? o[k] : a; }); }
  function mapNames(arr) { return arr.map(function (k) { return T('qn.' + k, { env: '설치 장소', dur: '설치 기간', form: '조형 종류', size: '크기' }[k]); }).join('·'); }

  function saveState() { try { sessionStorage.setItem(SKEY, JSON.stringify(S)); } catch (e) {} }
  /* 저장된 값(j)을 검증해서 S 에 반영합니다. 세션 저장값과 주소(?env=…)에서 모두 씁니다. */
  function absorb(j) {
    if (!j || typeof j !== 'object') return;
    ['env', 'dur', 'form', 'comp', 'mat'].forEach(function (k) { if (typeof j[k] === 'string') S[k] = j[k]; });
    if (!OPT.env.some(function (o) { return o[0] === S.env; })) S.env = '';
    if (!OPT.dur.some(function (o) { return o[0] === S.dur; })) S.dur = '';
    if (!OPT.form.some(function (o) { return o[0] === S.form; })) S.form = '';
    if (S.comp && !OPT.comp.some(function (o) { return o[0] === S.comp; })) S.comp = '';
    if (!MATS.some(function (m) { return m.id === S.mat; })) S.mat = 'frp';
    if (typeof j.height === 'number' && j.height >= 50 && j.height <= 400) S.height = j.height;
    if (j.ov && typeof j.ov === 'object') {
      var o = {}; ['mat', 'comp', 'finish', 'install'].forEach(function (k) { if (typeof j.ov[k] === 'string' && j.ov[k]) o[k] = j.ov[k]; });
      if (typeof j.ov.height === 'number' && j.ov.height >= 50 && j.ov.height <= 400) o.height = j.ov.height;
      S.ov = o;
    }
    if (j.f && typeof j.f === 'object') ['qty', 'budget', 'date', 'ref'].forEach(function (k) { if (typeof j.f[k] === 'string') S.f[k] = j.f[k].slice(0, 2000); });
    if (j.c && typeof j.c === 'object') ['name', 'company', 'email', 'phone'].forEach(function (k) { if (typeof j.c[k] === 'string') S.c[k] = j.c[k].slice(0, 200); });
    if (typeof j.sid === 'string') S.sid = j.sid.replace(/[^a-z0-9]/gi, '').slice(0, 32);
    if (typeof j.step === 'number' && j.step >= 0 && j.step <= 3) S.step = Math.floor(j.step);
  }
  function loadState() {
    try { absorb(JSON.parse(sessionStorage.getItem(SKEY) || 'null')); } catch (e) {}
    /* 소재 찾기에서 넘어온 주소 값이 있으면 그것이 우선합니다 */
    try {
      var sp = new URLSearchParams(location.search), q = {}, any = false;
      ['env', 'dur', 'form', 'comp', 'mat'].forEach(function (k) { var v = sp.get(k); if (v) { q[k] = v; any = true; } });
      var h = parseInt(sp.get('h'), 10); if (h) { q.height = h; any = true; }
      var ov = {}; [['om', 'mat'], ['oc', 'comp'], ['of', 'finish'], ['oi', 'install']].forEach(function (p) { var v = sp.get(p[0]); if (v) { ov[p[1]] = v; any = true; } });
      var oh = parseInt(sp.get('oh'), 10); if (oh) { ov.height = oh; any = true; }
      if (any) { q.ov = ov; var keep = S.step; absorb(q); S.step = keep; }
    } catch (e) {}
    /* 소재 찾기는 메뉴·버튼으로 들어오면 항상 1단계부터. (?s=3 은 '견적 문의 → 이전'으로 돌아올 때만 가견적 단계로) */
    var back = false; try { back = new URLSearchParams(location.search).get('s') === '3'; } catch (e) {}
    S.step = MODE === 'quote' ? 3 : (back ? 2 : 0);
  }
  /* 선택값을 주소로 만들어 소재 찾기 → 견적 문의로 넘깁니다 */
  function qs() {
    var p = [];
    function a(k, v) { if (v !== '' && v != null) p.push(k + '=' + encodeURIComponent(v)); }
    a('env', S.env); a('dur', S.dur); a('form', S.form); a('comp', S.comp); a('mat', S.mat); a('h', S.height);
    a('om', S.ov.mat); a('oc', S.ov.comp); a('of', S.ov.finish); a('oi', S.ov.install); a('oh', S.ov.height);
    return p.length ? '?' + p.join('&') : '';
  }
  function picked() { return ready() || Object.keys(S.ov).length > 0; }

  /* ---------- 추천 계산 ---------- */
  function rank() {
    if (!ready()) return [];
    var comp = compEff(), t = Math.max(0, Math.min(1, (S.height - 100) / 100));
    return MATS.map(function (m, i) {
      var s = SC[m.id];
      var lv = { env: s.env[S.env], dur: s.dur[S.dur], form: s.form[S.form], size: s.size.s + (s.size.l - s.size.s) * t };
      var total = lv.env + lv.dur + lv.form + lv.size + ((CMOD[comp] || {})[m.id] || 0) + (S.form === 'l' && m.id === 'acrylic' ? 1 : 0);
      if (lv.env === 0 || lv.dur === 0) total -= 3;
      return { m: m, lv: lv, total: total, i: i };
    }).sort(function (a, b) { return (b.total - a.total) || (a.i - b.i); });
  }
  function rankIdx() { var o = {}; rank().slice(0, 3).forEach(function (x, i) { o[x.m.id] = i + 1; }); return o; }
  function lvr(x, k) { return Math.round(x.lv[k]); }

  /* ---------- 가견적 계산 (기존 계산기와 같은 식) ---------- */
  function tbl() {
    var t = { mats: {}, comp: {}, fin: {}, inst: {} }, d = CALCDEF;
    CALCMATS.forEach(function (id) { t.mats[id] = { base: NN('calc.m.' + id + '.base', d.mats[id][0]), days: NN('calc.m.' + id + '.days', d.mats[id][1]) }; });
    Object.keys(d.comp).forEach(function (k) { t.comp[k] = { rate: NN('calc.c.' + k + '.rate', d.comp[k][0]), days: NN('calc.c.' + k + '.days', d.comp[k][1]) }; });
    Object.keys(d.fin).forEach(function (k) { t.fin[k] = { base: NN('calc.f.' + k + '.base', d.fin[k][0]), days: NN('calc.f.' + k + '.days', d.fin[k][1]) }; });
    Object.keys(d.inst).forEach(function (k) { t.inst[k] = { cost: NN('calc.i.' + k + '.cost', d.inst[k][0]), days: NN('calc.i.' + k + '.days', d.inst[k][1]) }; });
    t.exp = NN('calc.exp', 1.85); t.lo = NN('calc.lo', 0.9); t.hi = NN('calc.hi', 1.15);
    return t;
  }
  function calcOn() { return NN('calc.on', 1) !== 0; }
  function firstCalcMat() { var r = rank(); for (var i = 0; i < r.length; i++) if (CALCMATS.indexOf(r[i].m.id) > -1) return r[i].m.id; return 'frp'; }
  function derived() {
    return {
      mat: ready() ? firstCalcMat() : 'frp',
      height: S.height,
      comp: compEff(),
      finish: (S.env === 'out' && S.dur !== 's') ? 'uv' : 'urethane',
      install: S.env === 'out' ? 'outdoor' : 'indoor'
    };
  }
  function eff() { var d = derived(), o = S.ov, e = {}; Object.keys(d).forEach(function (k) { e[k] = (o[k] != null && o[k] !== '') ? o[k] : d[k]; }); return e; }
  function calc(e) {
    if (!calcOn() || CALCMATS.indexOf(e.mat) < 0) return null;
    var t = tbl(), md = t.mats[e.mat], c = t.comp[e.comp], f = t.fin[e.finish], i = t.inst[e.install];
    if (!md || !c || !f || !i) return null;
    var base = md.base * Math.pow(e.height / 100, t.exp) * c.rate, fin = f.base * (e.height / 100), ins = i.cost, mid = base + fin + ins;
    return { base: base, fin: fin, ins: ins, lo: mid * t.lo, hi: mid * t.hi, days: md.days + c.days + f.days + i.days };
  }
  function won(n) {
    var m = Math.round(n / 10000);
    if (m >= 10000) return (m / 10000).toFixed(1).replace(/\.0$/, '') + '억 원';
    return m.toLocaleString('ko-KR') + '만 원';
  }
  function range(r) { return fmt(T('calc.fmt', '약 {a} ~ {b}'), { a: won(r.lo), b: won(r.hi) }); }
  function hLabel(h) { return h + 'cm (' + (h / 100).toFixed(1).replace(/\.0$/, '') + 'm)'; }

  /* ---------- html 조각 ---------- */
  function x(k, d, tag, cls, more) { return '<' + tag + (cls ? ' class="' + cls + '"' : '') + (more || '') + '>' + escBr(T(k, d)) + '</' + tag + '>'; }
  function ulist(k, d, cls) { return '<ul class="ck' + (cls ? ' ' + cls : '') + '">' + LS(k, d).map(function (t) { return '<li>' + escBr(t) + '</li>'; }).join('') + '</ul>'; }
  function dotsHTML(k, d) {
    var n = NV(k, d), s = '';
    for (var i = 0; i < 5; i++) s += '<i class="' + (i < n ? '' : 'o') + '"></i>';
    return '<span class="dots" role="img" aria-label="5점 중 ' + n + '점">' + s + '</span>';
  }
  function ph(p, eb, h, pt) { return '<div class="ph">' + x(p + '.eb', eb, 'div', 'eyebrow') + x(p + '.h', h, 'h1', '', ' tabindex="-1"') + x(p + '.p', pt, 'p') + '</div>'; }
  function pct(v, a, b) { return Math.round((v - a) / (b - a) * 100) + '%'; }
  function rangeHTML(id, val, label) {
    return '<div class="range"><div class="range-top"><span class="range-hint">' + esc(label) + '</span><span class="range-val" id="' + id + 'v"></span></div>' +
      '<input type="range" id="' + id + '" min="50" max="400" step="10" value="' + val + '" aria-label="' + esc(label) + '">' +
      '<div class="range-ends"><span>50cm</span><span>400cm</span></div></div>';
  }
  function setRange(id, v) {
    var r = document.getElementById(id), o = document.getElementById(id + 'v'); if (!r || !o) return;
    r.value = v; r.style.setProperty('--p', pct(v, 50, 400));
    o.innerHTML = v + '<small>cm · ' + (v / 100).toFixed(1).replace(/\.0$/, '') + 'm</small>';
  }

  /* ---------- 1단계 ---------- */
  function optBtn(g, o) {
    return '<button type="button" class="opt" data-q="' + g + '" data-v="' + o[0] + '" aria-pressed="false"><span class="n">' + esc(optName(g, o[0])) + '</span>' +
      '<span class="s">' + esc(optSub(g, o[0])) + '</span>' + (g === 'comp' ? '<span class="tagauto" hidden>' + esc(T('tag.auto', '위 선택에 맞춰 자동 선택')) + '</span>' : '') + '</button>';
  }
  function qBlock(g, cls) {
    return '<div class="q" data-qk="' + g + '"><div class="q-l">' + x('q.' + g + '.l', { env: '설치 장소는 어디인가요?', dur: '얼마나 오래 설치하나요?', form: '어떤 조형인가요?', comp: '형태는 얼마나 정교한가요?' }[g], 'span') + '</div>' +
      (g === 'comp' ? x('q.comp.h', '잘 모르겠다면 그대로 두셔도 괜찮아요.', 'div', 'q-s') : '') +
      '<div class="opts' + (cls ? ' ' + cls : '') + '">' + OPT[g].map(function (o) { return optBtn(g, o); }).join('') + '</div></div>';
  }
  function page0() {
    return ph('s1', 'Step 1', '나에게 맞는 소재 알아보기', '몇 가지만 골라 주세요. 잘 맞는 소재를 바로 알려드려요.') +
      qBlock('env') + qBlock('dur', 'c3') + qBlock('form') +
      '<div class="q" data-qk="size"><div class="q-l">' + x('q.size.l', '높이가 얼마나 되나요?', 'span') + '</div>' + x('q.size.h', '지면에서 가장 높은 곳까지, 대략으로 괜찮아요.', 'div', 'q-s') + rangeHTML('hr', S.height, T('q.size.l', '높이가 얼마나 되나요?')) + '</div>' +
      qBlock('comp', 'c3') + '<div id="rec" aria-live="polite"></div>';
  }
  function recHTML() {
    if (!ready()) {
      return '<div class="na">' + escBr(T('rec.empty', '설치 장소, 기간, 조형 종류를 고르면 잘 맞는 소재를 바로 알려드려요.')) + '</div>' +
        '<button type="button" class="linkbtn" data-step="1" style="margin-top:10px">' + esc(T('rec.skip', '잘 모르겠다면 소재부터 둘러볼게요')) + ' ›</button>';
    }
    if (locked()) {
      return '<div class="lock"><div class="lock-t">' + esc(T('gate.lock.t', '추천 결과가 준비됐어요')) + '</div>' +
        '<p>' + esc(T('gate.lock.p', '이메일만 남기시면 잘 맞는 소재와 가견적 범위를 바로 보여드려요.')) + '</p>' +
        '<button type="button" class="btn pri blk" data-act="unlock">' + esc(T('gate.lock.b', '이메일 입력하고 결과 보기')) + '</button></div>';
    }
    var r = rank(), a = r[0];
    var strong = KEYS.filter(function (k) { return lvr(a, k) >= 3; }), weak = KEYS.filter(function (k) { return lvr(a, k) <= 1; });
    var s = '<div class="rec" style="--mc:' + mcol(a.m.id) + '"><div class="rec-lead">' + esc(T('rec.lead', '가장 잘 맞는 소재')) + '</div><div class="rec-top"><div class="rec-name">' + esc(mname(a.m)) + '<span class="badge">' + esc(T('rec.b1', '1순위')) + '</span></div>' +
      '<div class="use">' + escBr(T('m.' + a.m.id + '.tag', a.m.tag)) + '</div><div class="why">';
    if (strong.length) s += '<div><b>' + esc(T('rec.good', '잘 맞는 점')) + '</b> ' + esc(mapNames(strong)) + '</div>';
    if (weak.length) s += '<div class="warn"><b>' + esc(T('rec.warn', '상담이 필요한 점')) + '</b> ' + esc(mapNames(weak)) + ' ' + esc(T('rec.warn2', '항목은 이 소재의 약점이에요. 보완 방법을 함께 확인해 보세요.')) + '</div>';
    if (!strong.length && !weak.length) s += '<div>' + escBr(muse(a.m)) + '</div>';
    s += '</div></div><div class="rec-more">';
    r.slice(1, 3).forEach(function (xx, i) {
      var st = KEYS.filter(function (k) { return lvr(xx, k) >= 3; }), wk = KEYS.filter(function (k) { return lvr(xx, k) <= 1; });
      var w = st.length ? T('rec.good', '잘 맞는 점') + ' · ' + mapNames(st) : (wk.length ? T('rec.warn', '상담이 필요한 점') + ' · ' + mapNames(wk) : muse(xx.m));
      s += '<button type="button" class="rec-row" data-go="' + xx.m.id + '"><span class="no">' + esc(T('rec.b' + (i + 2), (i + 2) + '순위')) + '</span><span class="nm">' + esc(mname(xx.m)) + '</span><span class="go" aria-hidden="true">›</span><span class="why">' + esc(w) + '</span></button>';
    });
    s += '</div><button type="button" class="rec-link" data-go="' + a.m.id + '">' + esc(T('rec.more', '1순위 소재 자세히 보기')) + ' ›</button><a class="rec-link" href="' + esc(workURL(a.m.id)) + '">' + esc(T('rec.work', '이 소재로 만든 작품 보기')) + ' →</a></div>';
    return s;
  }
  function refresh0() {
    $$('.opt[data-q]').forEach(function (b) {
      var g = b.getAttribute('data-q'), v = b.getAttribute('data-v'), on = g === 'comp' ? (S.form && compEff() === v) || (!S.form && S.comp === v) : S[g] === v;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      var t = $('.tagauto', b); if (t) t.hidden = !(on && !S.comp && S.form);
    });
    setRange('hr', S.height);
    var r = $('#rec'); if (r) r.innerHTML = recHTML();
  }

  /* ---------- 2단계 ---------- */
  function page1() {
    return ph('s2', 'Step 2', '소재별 더 알아보기', '소재를 눌러 하나씩 살펴보세요.') + '<div class="mchips" id="mchips" role="group" aria-label="소재 선택"></div><div id="mpbody"></div>';
  }
  function chipsHTML() {
    var ri = rankIdx();
    return MATS.map(function (m) {
      return '<button type="button" class="mchip" style="' + mvars(m.id) + '" data-mat="' + m.id + '" aria-pressed="' + (S.mat === m.id ? 'true' : 'false') + '"><i class="sw" style="background:' + mcol(m.id) + '"></i>' + esc(mname(m)) + (ri[m.id] ? '<span class="badge' + (ri[m.id] > 1 ? ' b2' : '') + '">' + esc(T('rec.b' + ri[m.id], ri[m.id] + '순위')) + '</span>' : '') + '</button>';
    }).join('');
  }
  function matBody(m) {
    var id = m.id, k = 'm.' + id + '.', name = mname(m), s = '<div class="mp sw" style="' + mvars(id) + '"><div class="mp-head"><div class="eyebrow">' + esc(m.no) + '</div><h2>' + esc(name) + (rankIdx()[id] ? '<span class="badge' + (rankIdx()[id] > 1 ? ' b2' : '') + '">' + esc(T('rec.b' + rankIdx()[id], rankIdx()[id] + '순위')) + '</span>' : '') + '</h2>' + x(k + 'tag', m.tag, 'p', 'tg') +
      '<div class="meta">' + m.meta.map(function (t, i) { return x(k + 'meta.' + i, t, 'span'); }).join('') + '</div></div>';
    s += galleryHTML(id, name);
    s += '<div class="card"><h3>' + x('lbl.good', '이런 점이 좋아요', 'span') + '</h3>' + ulist(k + 'good', m.good) + '</div>';
    s += '<div class="card warn"><h3>' + x('lbl.know', '알아두세요', 'span') + '</h3>' + ulist(k + 'know', m.know, 'know') + '</div>';
    s += '<div class="card"><h3>' + x('lbl.cmp', '소재 비교 (상대 평가)', 'span') + '</h3><div class="rates">' +
      RL.map(function (l, i) { return '<div class="rate">' + x('lbl.r' + i, l, 'span') + dotsHTML(k + 'r' + i, m.rate[i]) + '</div>'; }).join('') + '</div></div>';
    s += '<div>';
    if (m.variants) s += '<details class="acc"><summary>' + x('lbl.var', '세부 소재', 'span') + ' ' + m.variants.length + '가지</summary><div class="acc-b">' +
      m.variants.map(function (v, i) { return '<div class="vr">' + x(k + 'v' + i + 'n', v[0], 'b') + x(k + 'v' + i + 'd', v[1], 'span') + '</div>'; }).join('') + '</div></details>';
    s += '<details class="acc"><summary>' + x('lbl.proc', '제작 과정', 'span') + '</summary><div class="acc-b"><div class="flow">' +
      T(k + 'steps', m.steps).split(/\s*→\s*/).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('<i>›</i>') + '</div></div></details>';
    s += '<details class="acc"><summary>' + x('lbl.ask', '의뢰 전에 확인해 주세요', 'span') + '</summary><div class="acc-b">' + ulist(k + 'ask', m.ask, 'ask') + '</div></details></div>';
    s += '<p class="use"><b>' + x('lbl.use', '잘 맞는 작품', 'span') + '</b> ' + x(k + 'use', m.use, 'span') + '</p>';
    s += '<div class="cta-row"><button type="button" class="btn pri blk" data-act="estimate" data-v="' + id + '">' + esc(T('s2.cta', '이 소재로 가견적 보기')) + '</button>' +
      '<button type="button" class="btn ln" data-step="2">' + esc(T('s2.cta2', '다른 소재와 한눈에 비교하기')) + '</button><a class="btn ln" href="' + esc(workURL(id)) + '">' + esc(T('s2.cta3', '이 소재로 만든 작품 보기')) + ' →</a></div></div>';
    return s;
  }
  /* ---------- 작업 사진 갤러리 ---------- */
  function galleryHTML(id, name) {
    var items = [], i, k = 'm.' + id + '.';
    for (i = 0; i < 6; i++) { var u = PK(k + 'g.' + i), c = T(k + 'gc.' + i, ''); if (u) items.push([u, c]); }
    if (!items.length && has(k + 'photo')) { var lg = imgURL(CONTENT[K(k + 'photo')]); if (lg) items.push([lg, '']); }
    var lk = linkURL(T(k + 'link', '')), h = ''; if (!lk || /malongcompany\.co\.kr/i.test(lk)) lk = workURL(id); var ext = /^https?:/i.test(lk);
    if (items.length) {
      var one = items.length === 1;
      h += '<div class="gal' + (one ? ' one' : '') + '" data-n="' + items.length + '"><div class="gal-track" tabindex="0" role="group" aria-label="' + esc(name) + ' ' + esc(T('gal.label', '작업 사진')) + '">' +
        items.map(function (it, n) {
          return '<figure class="gal-s"><button type="button" class="gal-img" data-zoom aria-label="' + esc(T('gal.zoom', '사진 크게 보기')) + '"><img src="' + esc(it[0]) + '" alt="' + esc(name + ' 작업 사진 ' + (n + 1) + (it[1] ? ': ' + it[1] : '')) + '" loading="' + (n ? 'lazy' : 'eager') + '" referrerpolicy="no-referrer" draggable="false"></button>' +
            (it[1] ? '<figcaption>' + escBr(it[1]) + '</figcaption>' : '') + '</figure>';
        }).join('') + '</div>';
      if (!one) h += '<button type="button" class="gal-nav prev off" data-gal="-1" aria-label="' + esc(T('gal.prev', '이전 사진')) + '">‹</button><button type="button" class="gal-nav next" data-gal="1" aria-label="' + esc(T('gal.next', '다음 사진')) + '">›</button>' +
        '<div class="gal-foot"><span class="gal-dots" aria-hidden="true">' + items.map(function (_, n) { return '<i' + (n ? '' : ' class="on"') + '></i>'; }).join('') + '</span><span class="gal-count">1 / ' + items.length + '</span></div>';
      h += '</div>';
    }
    if (lk) h += '<a class="gal-link" href="' + esc(lk) + '"' + (ext ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + esc(T('gal.more', '이 소재 작업 사례 더 보기')) + '<span aria-hidden="true">' + (ext ? ' ↗' : ' →') + '</span></a>';
    return h;
  }
  function galStep(tr) { var s = tr.firstElementChild; return s ? s.offsetWidth + 10 : 0; }
  function galSync(tr) {
    var g = tr.parentNode, n = tr.children.length, st = galStep(tr); if (!st || n < 2) return;
    var i = Math.max(0, Math.min(n - 1, Math.round(tr.scrollLeft / st)));
    $$('.gal-dots i', g).forEach(function (d, j) { d.className = j === i ? 'on' : ''; });
    var ct = $('.gal-count', g); if (ct) ct.textContent = (i + 1) + ' / ' + n;
    var pv = $('.gal-nav.prev', g), nx = $('.gal-nav.next', g);
    if (pv) pv.classList.toggle('off', i === 0);
    if (nx) nx.classList.toggle('off', tr.scrollLeft + tr.clientWidth >= tr.scrollWidth - 4);
  }
  function openZoom(img, cap) {
    var o = document.createElement('div'); o.className = 'lb'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true'); o.setAttribute('aria-label', T('gal.zoom', '사진 크게 보기'));
    o.innerHTML = '<button type="button" class="lb-x" aria-label="' + esc(T('gal.close', '닫기')) + '">×</button><img alt="' + esc(img.alt) + '" src="' + esc(img.currentSrc || img.src) + '">' + (cap ? '<p>' + escBr(cap) + '</p>' : '');
    var close = function () { if (o.parentNode) o.parentNode.removeChild(o); document.removeEventListener('keydown', key); };
    var key = function (e) { if (e.key === 'Escape') close(); };
    o.addEventListener('click', close); document.addEventListener('keydown', key);
    document.body.appendChild(o); $('.lb-x', o).focus();
  }
  document.addEventListener('scroll', function (e) { var t = e.target; if (t && t.classList && t.classList.contains('gal-track')) galSync(t); }, true);
  document.addEventListener('error', function (e) {
    var t = e.target; if (!t || t.tagName !== 'IMG' || !t.closest) return;
    var f = t.closest('.gal-s'); if (!f) return;
    var tr = f.parentNode, g = tr.parentNode; tr.removeChild(f);
    var n = tr.children.length;
    if (!n) { g.parentNode.removeChild(g); return; }
    var d = $('.gal-dots', g); if (d) d.innerHTML = Array(n + 1).join('<i></i>');
    if (n < 2) { g.classList.add('one'); $$('.gal-nav,.gal-foot', g).forEach(function (x) { x.parentNode.removeChild(x); }); } else galSync(tr);
  }, true);

  function refresh1(animate) {
    var c = $('#mchips'); if (!c) return;
    c.innerHTML = chipsHTML();
    var b = $('#mpbody'); b.innerHTML = matBody(matById(S.mat));
    if (!animate) { var mp = $('.mp', b); if (mp) mp.classList.remove('sw'); }
    var on = $('.mchip[aria-pressed="true"]', c);
    if (on) { var tg = on.offsetLeft - (c.clientWidth - on.offsetWidth) / 2; c.scrollLeft = tg < 28 ? 0 : tg; }
  }

  /* ---------- 3단계 ---------- */
  function cmpHTML() {
    var ri = rankIdx();
    var th = function (k, d, cls) { return x(k, d, 'th', cls || '', ' scope="col"'); };
    var s = '<thead><tr>' + th('ch.0', '소재') + RL.map(function (l, i) { return th('lbl.r' + i, l); }).join('') + th('ch.6', '비용') + th('ch.7', '제작 기간') + th('ch.8', '이럴 때 추천', 'l') + '</tr></thead><tbody>';
    var shown = {};
    s += CMP.map(function (r, i) {
      var p = 'c.' + i + '.', n = ri[r[1]], first = n && !shown[r[1]]; if (n) shown[r[1]] = 1;
      return '<tr' + (n ? ' class="hi"' : '') + '>' + '<td scope="row">' + escBr(T(p + 'n', r[0])) + (first ? '<span class="badge' + (n > 1 ? ' b2' : '') + '">' + esc(T('rec.b' + n, n + '순위')) + '</span>' : '') + '</td>' +
        r[2].map(function (v, j) { return '<td>' + dotsHTML(p + 'r' + j, v) + '</td>'; }).join('') + x(p + 'c', r[3], 'td') + x(p + 't', r[4], 'td') + x(p + 'd', r[5], 'td', 'rc') + '</tr>';
    }).join('');
    return s + '</tbody>';
  }
  function copts(g, list, nameFn, subFn) {
    return '<div class="opts">' + list.map(function (o) {
      return '<button type="button" class="copt" data-c="' + g + '" data-v="' + o + '" aria-pressed="false"><span class="n">' + nameFn(o) + '</span><span class="s">' + esc(subFn(o)) + '</span></button>';
    }).join('') + '</div>';
  }
  function grp(g, label, body) { return '<div class="grp" data-g="' + g + '"><div class="grp-l">' + esc(label) + '<span class="tagauto" hidden>' + esc(T('tag.carry', '1단계 선택 반영')) + '</span></div>' + body + '</div>'; }
  function page2() {
    var s = ph('s3', 'Step 3', '한눈에 비교하고 가견적 내보기', '비교표에서 추천 소재가 강조돼요. 아래에서 조건을 바꿔 가며 가견적도 확인해 보세요.');
    s += '<section class="sec"><h2>' + x('s3a.h', '소재 한눈에 비교', 'span') + '</h2><p class="sp" id="cmpnote"></p><div class="tw"><div class="scroll" tabindex="0" aria-label="소재 비교표"><table class="cmp" id="cmp"></table></div>' +
      '<button type="button" class="tnav prev off" data-tscroll="-1" aria-label="' + esc(T('tbl.left', '표 왼쪽으로')) + '">‹</button><button type="button" class="tnav next" data-tscroll="1" aria-label="' + esc(T('tbl.right', '표 오른쪽으로')) + '">›</button></div>' +
      x('legend', '5점 만점의 상대 비교이며 절대 수치가 아닙니다. ₩가 많을수록 비용 부담이 큰 경향입니다. 비용과 기간은 크기, 형태 복잡도, 수량, 마감 사양에 따라 크게 달라집니다.', 'p', 'legend') +
      '<div class="card"><h3>' + x('combo.h', '소재를 조합하기도 합니다', 'span') + '</h3>' + ulist('combo', COMBO) + '</div></section>';
    if (calcOn()) {
      s += '<section class="sec"><h2>' + x('s3b.h', '가견적 내보기', 'span') + '</h2>' + x('s3b.p', '조건을 고르면 예상 금액과 제작 기간이 바로 계산돼요.', 'p', 'sp') + '<div id="autonote"></div><div id="calcwarn"></div>';
      s += grp('mat', T('g.mat', '소재'), '<div class="opts">' + MATS.map(function (m) {
        var calcable = CALCMATS.indexOf(m.id) > -1;
        return '<button type="button" class="copt" data-c="mat" data-v="' + m.id + '" aria-pressed="false"><span class="n">' + esc(mname(m)) + '<span class="rk"></span></span><span class="s">' + esc(T('calc.m.' + m.id + '.s', CALCSUB[m.id])) + '</span></button>';
      }).join('') + '</div>');
      s += grp('height', T('g.height', '높이'), rangeHTML('cr', S.height, T('g.height', '높이')));
      s += grp('comp', T('g.comp', '형태 난이도'), '<div class="opts c3">' + OPT.comp.map(function (o) { return '<button type="button" class="copt" data-c="comp" data-v="' + o[0] + '" aria-pressed="false"><span class="n">' + esc(optName('comp', o[0])) + '</span><span class="s">' + esc(optSub('comp', o[0])) + '</span></button>'; }).join('') + '</div>');
      s += grp('finish', T('g.finish', '표면 마감'), '<div class="opts">' + FIN.map(function (o) { return '<button type="button" class="copt" data-c="finish" data-v="' + o[0] + '" aria-pressed="false"><span class="n">' + esc(finName(o[0])) + '</span><span class="s">' + esc(T('calc.f.' + o[0] + '.s', o[2])) + '</span></button>'; }).join('') + '</div>');
      s += grp('install', T('g.install', '배송 및 설치'), '<div class="opts c3">' + INS.map(function (o) { return '<button type="button" class="copt" data-c="install" data-v="' + o[0] + '" aria-pressed="false"><span class="n">' + esc(insName(o[0])) + '</span><span class="s">' + esc(T('calc.i.' + o[0] + '.s', o[2])) + '</span></button>'; }).join('') + '</div>');
      s += '<div id="calcres"></div></section>';
    }
    return s;
  }
  /* ---------- 비교표 좌우 이동 (마우스용 화살표·끌기) ---------- */
  function tblSync(sc) {
    if (!sc) return; var w = sc.parentNode, pv = $('.tnav.prev', w), nx = $('.tnav.next', w), mx = sc.scrollWidth - sc.clientWidth;
    if (pv) pv.classList.toggle('off', sc.scrollLeft <= 4);
    if (nx) nx.classList.toggle('off', mx <= 4 || sc.scrollLeft >= mx - 4);
  }
  document.addEventListener('scroll', function (e) { var t = e.target; if (t && t.classList && t.classList.contains('scroll')) tblSync(t); }, true);
  window.addEventListener('resize', function () { tblSync($('#pg2 .scroll')); });
  var drag = null;
  document.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse' || e.button !== 0 || !e.target.closest) return;
    var sc = e.target.closest('.scroll'); if (!sc) return;
    drag = { sc: sc, x: e.clientX, l: sc.scrollLeft, moved: false };
  });
  document.addEventListener('pointermove', function (e) {
    if (!drag) return; var dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) > 4) { drag.moved = true; drag.sc.classList.add('grabbing'); }
    if (drag.moved) drag.sc.scrollLeft = drag.l - dx;
  });
  function endDrag() { if (drag) { drag.sc.classList.remove('grabbing'); drag = null; } }
  document.addEventListener('pointerup', endDrag); document.addEventListener('pointercancel', endDrag);

  function refresh2() {
    var cm = $('#cmp'); if (!cm) return;
    cm.innerHTML = cmpHTML(); tblSync($('.scroll', cm.closest('.tw')));
    var n = $('#cmpnote'); if (n) n.textContent = ready() ? T('s3a.p', '1단계 결과에 맞는 소재 3가지를 강조해 두었어요. 표는 옆으로 밀어서 볼 수 있어요.') : T('s3a.p0', '1단계에서 조건을 고르면 잘 맞는 소재가 여기에 강조돼요. 표는 옆으로 밀어서 볼 수 있어요.');
    if (!calcOn()) return;
    var e = eff(), d = derived(), ov = S.ov, ri = rankIdx(), hasOv = Object.keys(ov).length > 0;
    $$('.copt[data-c]').forEach(function (b) { b.setAttribute('aria-pressed', e[b.getAttribute('data-c')] === b.getAttribute('data-v') ? 'true' : 'false'); });
    $$('.copt[data-c="mat"]').forEach(function (b) { var id = b.getAttribute('data-v'), t = $('.rk', b); if (t) t.innerHTML = ri[id] ? ' <span class="badge' + (ri[id] > 1 ? ' b2' : '') + '">' + esc(T('rec.b' + ri[id], ri[id] + '순위')) + '</span>' : ''; });
    $$('.grp').forEach(function (g) { var k = g.getAttribute('data-g'), t = $('.tagauto', g); if (t) t.hidden = !(ready() && (ov[k] == null || ov[k] === '')); });
    setRange('cr', e.height);
    var an = $('#autonote');
    if (an) an.innerHTML = ready()
      ? '<div class="auto-note"><span>' + esc(T('calc.auto', '1단계에서 고른 조건이 미리 입력되어 있어요. 바꾸고 싶은 항목만 눌러 보세요.')) + '</span>' + (hasOv ? '<button type="button" data-act="reset-calc">' + esc(T('calc.reset', '처음 선택으로')) + '</button>' : '') + '</div>'
      : '<div class="auto-note"><span>' + esc(T('calc.noauto', '1단계를 건너뛰어 기본 조건이 입력되어 있어요. 직접 골라 보세요.')) + '</span><button type="button" data-step="0">' + esc(T('calc.go1', '1단계로')) + '</button></div>';
    var w = '', rk = rank();
    if (ready() && !ov.mat && rk.length && CALCMATS.indexOf(rk[0].m.id) < 0) w = '<div class="warnbox">' + escBr(fmt(T('calc.warn1', '1순위 추천인 ‘{a}’는 가견적 계산기를 지원하지 않아서, 계산 가능한 소재 중 가장 잘 맞는 ‘{b}’로 먼저 보여드려요.'), { a: mname(rk[0].m), b: mname(matById(d.mat)) })) + '</div>';
    var cw = $('#calcwarn'); if (cw) cw.innerHTML = w;
    var r = calc(e), res = $('#calcres'); if (!res) return;
    if (!r) res.innerHTML = '<div class="na">' + escBr(fmt(T('calc.na', '‘{m}’는 형태와 사양에 따라 견적 차이가 커서 계산기로 가견적을 내기 어려워요. 문의하시면 상담 후 정확하게 안내해 드려요.'), { m: mname(matById(e.mat)) })) + '</div>';
    else {
      var nt = [T('calc.note', '가견적은 참고용 범위이며, 실제 견적은 형태·수량·설치 조건에 따라 달라져요.')];
      if (S.form === 'l') nt.push(T('calc.led', '조명(LED)과 전원 공사는 가견적에 포함되지 않아요. 별도로 안내드려요.'));
      res.innerHTML = '<div class="res3"><div class="t">' + esc(T('calc.t', '예상 가견적 범위 (VAT 별도)')) + '</div><div class="price">' + esc(range(r)) + '</div><div class="bk">' +
        '<div><span>' + esc(T('calc.b0', '원형/성형 가공비')) + '</span><b>' + won(r.base) + '</b></div><div><span>' + esc(T('calc.b1', '표면 마감비')) + '</span><b>' + won(r.fin) + '</b></div>' +
        '<div><span>' + esc(T('calc.b2', '운송 및 설치비')) + '</span><b>' + won(r.ins) + '</b></div><div><span>' + esc(T('calc.b3', '예상 제작 소요일')) + '</span><b>약 ' + Math.round(r.days) + '일</b></div></div>' +
        '<div class="nt">' + nt.map(escBr).join('<br>') + '</div></div>';
    }
  }

  /* ---------- 4단계 ---------- */
  var FL = [['qty', 'fl.qty', '수량', '같은 형태를 몇 개 만드나요', 'number'], ['budget', 'fl.budget', '예산 범위', '예: 3천만 원 안팎', 'text'], ['date', 'fl.date', '희망 설치 완료일', '', 'date'], ['ref', 'fl.ref', '참고 자료와 기타 요청', '캐릭터 턴어라운드(정면·측면·후면), 설치 장소 사진, 유사 사례 링크 등', 'area']];
  function summaryItems() {
    var e = eff(), r = calc(e), rk = rank(), u = T('sm.none', '(미정)'), it = [];
    it.push([T('sm.env', '설치 장소'), S.env ? optName('env', S.env) : u]);
    it.push([T('sm.dur', '설치 기간'), S.dur ? optName('dur', S.dur) : u]);
    it.push([T('sm.form', '조형 종류'), S.form ? optName('form', S.form) : u]);
    if (rk.length) it.push([T('sm.rec', '추천 소재'), rk.slice(0, 3).map(function (xx) { return mname(xx.m); }).join(', ')]);
    it.push([T('sm.mat', '견적 기준 소재'), mname(matById(e.mat))]);
    it.push([T('sm.h', '높이'), hLabel(e.height)]);
    it.push([T('sm.comp', '형태 난이도'), optName('comp', e.comp)]);
    it.push([T('sm.fin', '표면 마감'), finName(e.finish)]);
    it.push([T('sm.ins', '배송 및 설치'), insName(e.install)]);
    if (calcOn()) {
      if (r) {
        it.push([T('sm.price', '가견적 (VAT 별도)'), range(r), 'pr']);
        it.push([T('sm.days', '예상 제작 기간'), '약 ' + Math.round(r.days) + '일']);
      } else it.push([T('sm.price', '가견적 (VAT 별도)'), T('sm.consult', '상담 후 안내'), 'pr']);
    }
    return it;
  }
  function fieldItems() {
    return FL.map(function (f) { return [T(f[1], f[2]), (S.f[f[0]] || '').trim()]; }).filter(function (a) { return a[1]; });
  }
  function summaryText() {
    var t = T('sm.title', '[조형물 제작 문의 · 마롱컴퍼니]') + '\n';
    if (picked()) summaryItems().forEach(function (a) { t += '· ' + a[0] + ': ' + a[1] + '\n'; });
    fieldItems().forEach(function (a) { t += '· ' + a[0] + ': ' + a[1] + '\n'; });
    return t + T('sm.foot', '※ 가견적은 참고용 범위이며 정확한 견적은 상담 후 확정돼요.');
  }
  function fl(id, label, type, ph0, ac, req) {
    return '<div class="fld"><label for="' + id + '">' + esc(label) + (req ? ' <i class="req">' + esc(T('qf.req', '필수')) + '</i>' : '') + '</label><input id="' + id + '" type="' + type + '"' +
      (ph0 ? ' placeholder="' + esc(ph0) + '"' : '') + (ac ? ' autocomplete="' + ac + '"' : '') + (type === 'email' ? ' inputmode="email"' : '') + (type === 'tel' ? ' inputmode="tel"' : '') + '></div>';
  }
  function page3() {
    var on = leadOn();
    var s = ph('q', 'Quote', '견적 문의하기', on ? '남겨 주신 내용을 확인한 뒤 담당자가 이메일로 연락드려요.' : '지금까지 고른 내용을 정리했어요. 카카오톡으로 문의하면서 그대로 붙여 넣어 주세요.');
    s += '<div id="q-pre"></div><div class="sum" id="sum"></div>';
    if (on) s += '<div id="q-wrap"><form id="qf" novalidate>' +
      '<section class="sec"><h2>' + x('qf.h1', '연락 받으실 분', 'span') + '</h2>' +
      fl('q-name', T('qf.name', '이름 / 담당자'), 'text', '홍길동', 'name', true) + fl('q-company', T('qf.company', '회사 · 기관명'), 'text', '', 'organization', false) +
      fl('q-email', T('qf.email', '이메일'), 'email', 'name@company.com', 'email', true) + fl('q-phone', T('qf.phone', '연락처'), 'tel', '연락처를 남기시면 더 빨리 연락드려요', 'tel', false) + '</section>';
    s += '<section class="sec"><h2>' + x('s4a.h', '더 알려주실 내용 (선택)', 'span') + '</h2>' +
      FL.map(function (f) {
        var id = 'f-' + f[0], lab = '<label for="' + id + '">' + escBr(T(f[1], f[2])) + '</label>';
        if (f[4] === 'area') return '<div class="fld">' + lab + '<textarea id="' + id + '" rows="3" placeholder="' + esc(f[3]) + '"></textarea></div>';
        return '<div class="fld">' + lab + '<input id="' + id + '" type="' + f[4] + '"' + (f[3] ? ' placeholder="' + esc(f[3]) + '"' : '') + (f[4] === 'number' ? ' min="1" inputmode="numeric"' : '') + '></div>';
      }).join('') + '</section>';
    s += '<div class="tip">' + x('ready.t', '이미지가 있다면 함께 보내 주세요', 'b') + x('ready.note', '캐릭터 이미지가 AI로 만든 것이라면 각도마다 형태가 다를 수 있어요. 문의 때 알려 주시면 제작 전에 형태를 먼저 맞춰 확인해요.', 'span') + '</div>';
    if (on) s += '<div class="hp" aria-hidden="true"><label>Website<input id="q-hp" type="text" tabindex="-1" autocomplete="off"></label></div>' +
      '<label class="chk"><input type="checkbox" id="q-c1"><span><b>' + esc(T('gate.req', '[필수]')) + '</b> ' + esc(T('qf.c1', '개인정보 수집·이용에 동의합니다.')) + '</span></label>' +
      '<p class="chk-note">' + escBr(T('qf.terms', '수집 항목: 이름, 이메일, 연락처, 회사명, 문의 내용 · 이용 목적: 견적 상담 및 회신 · 보유 기간: 수집일로부터 1년(동의 철회 시 지체 없이 파기) · 동의를 거부할 수 있으나, 거부하시면 문의 접수가 제한돼요.')) + ' <a href="' + esc(CONFIG.PRIVACY_URL) + '" target="_blank" rel="noopener">' + esc(T('gate.pp', '개인정보처리방침')) + '</a></p>' +
      '<label class="chk"><input type="checkbox" id="q-c2"><span>' + esc(T('gate.c2', '[선택] 마롱컴퍼니의 소식과 프로모션 이메일 수신에 동의합니다.')) + '</span></label>' +
      '<div class="gate-err" id="q-err" role="alert"></div>' +
      '<button type="submit" class="btn pri blk" id="q-go">' + esc(T('qf.go', '견적 문의 보내기')) + '</button></form></div>' +
      '<div class="done" id="q-done" tabindex="-1" hidden><div class="done-k">' + esc(T('qf.done.k', '접수 완료')) + '</div><h2>' + esc(T('qf.done.h', '문의가 접수됐어요')) + '</h2>' +
      '<p>' + esc(T('qf.done.p', '담당자가 내용을 확인한 뒤 남겨 주신 이메일로 연락드려요. 급하시면 아래 연락처로 문의해 주세요.')) + '</p>' +
      '<div class="cta-row"><a class="btn ln" href="work/">' + esc(T('qf.done.w', '작품 둘러보기')) + '</a><a class="btn gh" href="./">' + esc(T('qf.done.h2', '홈으로')) + '</a></div></div>';
    s += '<div class="cta-row" id="s4cta"></div>';
    s += '<div id="s4ct"></div>' + x('disc', '이 페이지는 일반적인 소재 특성을 정리한 참고 자료입니다. 실제 사양, 내구성, 비용은 설치 환경과 프로젝트에 따라 달라지며 견적 단계에서 확정됩니다. ㈜마롱컴퍼니', 'p', 'disc');
    s += '<button type="button" class="restart" data-act="restart">' + esc(T('s4.restart', '처음부터 다시 하기')) + '</button>';
    return s;
  }
  function refresh3() {
    var sm = $('#sum'); if (!sm) return;
    var pk = picked(), on = leadOn();
    sm.hidden = !pk;
    sm.innerHTML = pk ? summaryItems().map(function (a) { return '<div class="sum-r' + (a[2] ? ' ' + a[2] : '') + '"><span>' + esc(a[0]) + '</span><b>' + esc(a[1]) + '</b></div>'; }).join('') : '';
    var pre = $('#q-pre');
    if (pre) pre.innerHTML = pk ? '' : '<div class="notice"><b>' + esc(T('qf.pre.t', '소재 찾기를 먼저 해 보셨나요?')) + '</b><span>' + esc(T('qf.pre.p', '몇 가지만 고르면 추천 소재와 가견적이 문의 내용에 자동으로 담겨요. 바로 문의하셔도 괜찮아요.')) + '</span><a class="btn ln" href="' + FIND_URL + '">' + esc(T('qf.pre.b', '소재 찾기 시작하기')) + ' →</a></div>';
    if (!S.c.email && LEAD) S.c.email = LEAD.email;
    FL.forEach(function (f) { var el = document.getElementById('f-' + f[0]); if (el && el.value !== S.f[f[0]]) el.value = S.f[f[0]]; });
    ['name', 'company', 'email', 'phone'].forEach(function (k) { var el = document.getElementById('q-' + k); if (el && el.value !== S.c[k]) el.value = S.c[k]; });
    var k = kakaoURL();
    $('#s4cta').innerHTML = on ? (k ? '<a class="btn ln blk" data-act="kakao" href="' + esc(k) + '" target="_blank" rel="noopener noreferrer">' + esc(T('qf.kakao', '카카오톡으로 상담하기')) + '</a>' : '') :
      (k ? '<a class="btn pri blk" data-act="kakao" href="' + esc(k) + '" target="_blank" rel="noopener noreferrer">' + esc(T('s4.kakao', '카카오톡 문의하기')) + '</a>' : '') +
      '<button type="button" class="btn ' + (k ? 'ln' : 'pri blk') + '" data-act="copy">' + esc(T('s4.copy', '내용 복사하기')) + '</button>';
    $('#s4ct').innerHTML =
      '<div class="ct">' + x('ct.0.k', '전화', 'span', 'k') + x('ct.0.v', '1644-4762', 'span', 'v') + '<button class="mini" type="button" data-cv>' + esc(T('btn.cv', '복사')) + '</button></div>' +
      '<div class="ct">' + x('ct.1.k', '이메일', 'span', 'k') + x('ct.1.v', 'admin@malong.co.kr', 'span', 'v') + '<button class="mini" type="button" data-cv>' + esc(T('btn.cv', '복사')) + '</button></div>';
  }

  /* ---------- 사이트 공통: 메뉴 주소 / 소재 색 ---------- */
  var MC = { frp: '#C8323C', eps: '#EFB54B', metal: '#B4BBC7', acrylic: '#BDE5EC', brass: '#8B5B2C', print: '#6458B1' };
  function mcol(id) { return MC[id] || '#111111'; }
  function mtext(id) { var c = mcol(id), n = parseInt(c.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; return (0.299 * r + 0.587 * g + 0.114 * b) > 165 ? '#111111' : '#FFFFFF'; }
  function mvars(id) { return '--mc:' + mcol(id) + ';--mt:' + mtext(id); }
  function siteURL(h) { h = h || ''; if (!h || h === '#/') return CONFIG.SITE_URL || './'; if (h === '#/about') return 'about/'; if (h === '#/work') return 'work/'; var m = /^#\/work\/(.+)$/.exec(h); if (m) return 'materials/' + m[1] + '/'; return h; }
  function workURL(id) { return siteURL('#/work' + (id ? '/' + id : '')); }

  /* ---------- 틀, 헤더, 하단 독 ---------- */
  var STEPS = [['st.0', '소재 알아보기'], ['st.1', '소재별 더 알아보기'], ['st.2', '비교하고 가견적'], ['st.3', '견적 문의']];
  function shell() {
    var q = MODE === 'quote', idx = q ? [3] : [0, 1, 2], fns = [page0, page1, page2, page3];
    return '<header class="top"><div class="top-in"><a class="brand" href="' + esc(siteURL('#/')) + '" aria-label="마롱컴퍼니 홈"><svg viewBox="54 987 57 44" aria-hidden="true"><path d="' + LOGO + '"/></svg>' + x('bar.name', 'MALONG COMPANY', 'span') + '</a>' +
      '<nav class="gnav" aria-label="사이트 메뉴"><a href="' + esc(siteURL('#/')) + '">Home</a><a href="' + esc(workURL()) + '">Work</a><a href="' + esc(siteURL('#/about')) + '">About</a><a href="' + FIND_URL + '"' + (q ? '' : ' aria-current="page"') + '>소재 찾기</a><a href="' + QUOTE_URL + '"' + (q ? ' aria-current="page"' : '') + '>견적 문의</a></nav></div>' +
      '<div class="toolbar"><span class="tool">' + (q ? x('bar.tool.q', '견적 문의', 'span') : x('bar.tool.f', '소재 찾기 · 가견적', 'span')) + '</span><span class="stepno" id="stepno"></span></div>' +
      (q ? '' : '<ol class="prog" id="prog">' + STEPS.slice(0, 3).map(function (s, i) { return '<li><button type="button" data-step="' + i + '" aria-label="' + (i + 1) + '단계 ' + esc(T(s[0], s[1])) + '"></button></li>'; }).join('') + '</ol><div class="mybar" id="mybar" hidden></div>') + '</header>' +
      '<main class="stage" id="stage">' + idx.map(function (i) { return '<section class="page" id="pg' + i + '" aria-label="' + (i + 1) + '단계 ' + esc(T(STEPS[i][0], STEPS[i][1])) + '">' + fns[i]() + '</section>'; }).join('') + '</main>' +
      '<div class="dock"><div class="dock-in" id="dock"></div></div><div class="toast" id="toast" role="status" aria-live="polite"></div>';
  }
  function head() {
    var no = $('#stepno'); if (no) no.innerHTML = MODE === 'quote' ? '' : '<b>STEP ' + (S.step + 1) + '</b> / 3 · ' + esc(T(STEPS[S.step][0], STEPS[S.step][1]));
    $$('#prog li').forEach(function (li, i) { li.className = i < S.step ? 'done' : (i === S.step ? 'now' : ''); });
    var mb = $('#mybar'); if (!mb) return;
    if (S.step === 0 || S.step === 3 || !ready() || locked()) { mb.hidden = true; mb.innerHTML = ''; return; }
    var rk = rank(), p = [];
    p.push('<button type="button" class="pill key" data-step="0">' + esc(T('rec.tag', '추천')) + ' · ' + esc(mname(rk[0].m)) + '</button>');
    [optName('env', S.env), optName('dur', S.dur), optName('form', S.form), S.height + 'cm'].forEach(function (t) { p.push('<button type="button" class="pill" data-step="0">' + esc(t) + '</button>'); });
    mb.innerHTML = p.join(''); mb.hidden = false;
  }
  function dock() {
    var el = $('#dock'); if (!el) return;
    var st = S.step, sum = '', b = '', k = kakaoURL();
    if (st === 0) sum = ready() ? (locked() ? '<span>' + esc(T('gate.dock', '추천 결과가 준비됐어요')) + '</span>' : '<span>' + esc(T('dock.rec', '추천 1순위')) + '</span><b>' + esc(mname(rank()[0].m)) + '</b>') : '<span>' + esc(T('dock.pick', '설치 장소·기간·조형 종류를 골라 주세요')) + '</span>';
    if (st === 2 && calcOn()) { var r = calc(eff()); sum = '<span>' + esc(T('dock.est', '가견적')) + '</span><b>' + esc(r ? range(r) : T('sm.consult', '상담 후 안내')) + '</b>'; }
    if (MODE === 'quote') {
      b += '<a class="btn gh" href="' + FIND_URL + (qs() ? qs() + '&s=3' : '?s=3') + '">' + esc(T('dock.tofind', '소재 찾기')) + '</a>';
      if (leadOn()) b += '<button type="button" class="btn pri" data-act="submit"' + ($('#q-wrap') && $('#q-wrap').hidden ? ' hidden' : '') + '>' + esc(T('qf.go', '견적 문의 보내기')) + '</button>';
      else b += k ? '<a class="btn pri" data-act="kakao" href="' + esc(k) + '" target="_blank" rel="noopener noreferrer">' + esc(T('s4.kakao', '카카오톡 문의하기')) + '</a>' : '<button type="button" class="btn pri" data-act="copy">' + esc(T('s4.copy', '내용 복사하기')) + '</button>';
    } else {
      if (st > 0) b += '<button type="button" class="btn gh" data-act="prev">' + esc(T('dock.prev', '이전')) + '</button>';
      b += '<button type="button" class="btn pri" data-act="next"' + (st === 0 && !ready() ? ' aria-disabled="true"' : '') + '>' + esc(T('dock.n' + st, ['소재별 더 알아보기', '비교하고 가견적 보기', '견적 문의하기'][st])) + '</button>';
    }
    el.innerHTML = '<div class="dock-sum"' + (sum ? '' : ' hidden') + '>' + sum + '</div><div class="dock-btns">' + b + '</div>';
    fitDock();
  }
  // 하단 고정 영역의 실제 높이에 맞춰 본문 아래 여백을 정확히 맞춘다
  function fitDock() {
    var d = document.querySelector('.dock'); if (!d) return;
    var fixed = getComputedStyle(d).position === 'fixed';
    document.documentElement.style.setProperty('--dock-h', (fixed ? d.offsetHeight : 0) + 'px');
  }
  window.addEventListener('resize', fitDock);

  /* ---------- 리드(이메일) 수집 · 문의 전송 ---------- */
  var LKEY = 'malong-lead-v1', LEAD = null, gateNext = null, gateOpenAt = 0;
  var FIND_URL = 'find.html', QUOTE_URL = 'quote.html';
  function leadOn() { return /^https:\/\//i.test(String(CONFIG.LEAD_URL || '')); }
  function locked() { return MODE === 'find' && leadOn() && !LEAD; }
  function okMail(s) { return /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']{2,}$/.test(String(s || '').trim()); }
  function uid() {
    try { var a = new Uint8Array(8); crypto.getRandomValues(a); return Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
    catch (e) { return (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)).replace(/[^a-z0-9]/g, ''); }
  }
  function loadLead() { try { var j = JSON.parse(localStorage.getItem(LKEY) || 'null'); if (j && /^[a-z0-9]{8,32}$/i.test(j.id) && okMail(j.email)) LEAD = j; } catch (e) {} }
  function saveLead() { try { localStorage.setItem(LKEY, JSON.stringify(LEAD)); } catch (e) {} }
  function ext(a, b) { for (var k in b) if (Object.prototype.hasOwnProperty.call(b, k)) a[k] = b[k]; return a; }
  function base(type) {
    var b = { type: type, v: 1, leadId: LEAD ? LEAD.id : '', page: (location.pathname.split('/').pop() || 'index'), ref: String(document.referrer || '').slice(0, 200), at: new Date().toISOString() };
    try { var sp = new URLSearchParams(location.search); ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (k) { var v = sp.get(k); if (v) b[k] = v.slice(0, 80); }); } catch (e) {}
    return b;
  }
  /* 지금까지 고른 내용을 한 덩어리로 (리드 목록에서 어떤 걸 찾았는지 볼 수 있게) */
  function snap() {
    var e = eff(), r = calc(e), rk = rank();
    return { env: S.env, dur: S.dur, form: S.form, height: e.height, comp: e.comp, mat: e.mat, rec: rk.slice(0, 3).map(function (z) { return z.m.id; }), price: r ? range(r) : '' };
  }
  /* 응답을 확인하며 보냅니다. 응답을 못 읽는 환경이면 응답 없이 한 번 더 보내고(서버가 같은 id 는 한 번만 저장), 그래도 안 되면 실패 */
  function post(p, cb) {
    var body = JSON.stringify(p), done = false, hdr = { 'Content-Type': 'text/plain;charset=utf-8' };
    function fin(ok) { if (done) return; done = true; clearTimeout(to); if (cb) cb(ok); }
    var to = setTimeout(function () { fin(false); }, 20000);
    if (!window.fetch) { fin(false); return; }
    fetch(CONFIG.LEAD_URL, { method: 'POST', headers: hdr, body: body, redirect: 'follow' })
      .then(function (r) { return r.json(); })
      .then(function (j) { fin(!!(j && j.ok)); })
      .catch(function () {
        fetch(CONFIG.LEAD_URL, { method: 'POST', mode: 'no-cors', headers: hdr, body: body }).then(function () { fin(true); }, function () { fin(false); });
      });
  }
  function ping(p) {
    if (!leadOn() || !window.fetch) return;
    try { fetch(CONFIG.LEAD_URL, { method: 'POST', mode: 'no-cors', keepalive: true, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(p) }).catch(function () {}); } catch (e) {}
  }
  function toQuote() {
    saveState();
    if (leadOn() && LEAD) ping(ext(base('select'), { snapshot: snap() }));
    location.href = QUOTE_URL + qs();
  }

  /* 이메일 입력 창 */
  function gateHTML() {
    return '<div class="gate-box"><button type="button" class="gate-x" data-act="gate-close" aria-label="' + esc(T('gate.close', '닫기')) + '">×</button>' +
      x('gate.eb', 'Free result', 'div', 'eyebrow') + x('gate.h', '이메일만 남기면 결과가 바로 열려요', 'h2', '', ' id="gate-h"') +
      x('gate.p', '잘 맞는 소재 추천, 소재별 비교, 가견적 범위를 확인하실 수 있어요. 남겨 주신 이메일은 견적 상담 안내에만 사용해요.', 'p', 'gate-p') +
      '<form id="gf" novalidate><div class="fld"><label for="g-email">' + esc(T('gate.email', '이메일')) + '</label><input id="g-email" type="email" inputmode="email" autocomplete="email" placeholder="name@company.com"></div>' +
      '<div class="hp" aria-hidden="true"><label>Website<input id="g-hp" type="text" tabindex="-1" autocomplete="off"></label></div>' +
      '<label class="chk"><input type="checkbox" id="g-c1"><span><b>' + esc(T('gate.req', '[필수]')) + '</b> ' + esc(T('gate.c1', '개인정보 수집·이용에 동의합니다.')) + '</span></label>' +
      '<p class="chk-note">' + escBr(T('gate.terms', '수집 항목: 이메일 · 이용 목적: 소재 추천 결과 제공, 견적 상담 안내 · 보유 기간: 수집일로부터 1년(동의 철회 시 지체 없이 파기) · 동의를 거부할 수 있으나, 거부하시면 결과 확인이 제한돼요.')) + ' <a href="' + esc(CONFIG.PRIVACY_URL) + '" target="_blank" rel="noopener">' + esc(T('gate.pp', '개인정보처리방침')) + '</a></p>' +
      '<label class="chk"><input type="checkbox" id="g-c2"><span>' + esc(T('gate.c2', '[선택] 마롱컴퍼니의 소식과 프로모션 이메일 수신에 동의합니다.')) + '</span></label>' +
      '<div class="gate-err" id="g-err" role="alert"></div>' +
      '<button type="submit" class="btn pri blk" id="g-go">' + esc(T('gate.go', '결과 확인하기')) + '</button></form></div>';
  }
  function openGate(next) {
    gateNext = next == null ? null : next; gateOpenAt = Date.now();
    var g = $('#gate');
    if (!g) { g = document.createElement('div'); g.id = 'gate'; g.className = 'gate'; g.setAttribute('role', 'dialog'); g.setAttribute('aria-modal', 'true'); g.setAttribute('aria-labelledby', 'gate-h'); document.body.appendChild(g); }
    g.innerHTML = gateHTML(); g.hidden = false; document.documentElement.classList.add('gate-on');
    var em = $('#g-email'); if (em) setTimeout(function () { try { em.focus(); } catch (e) {} }, 60);
  }
  function closeGate() { var g = $('#gate'); if (g) g.hidden = true; document.documentElement.classList.remove('gate-on'); gateNext = null; }
  function gateSubmit() {
    var em = $('#g-email'), c1 = $('#g-c1'), c2 = $('#g-c2'), hp = $('#g-hp'), err = $('#g-err'), btn = $('#g-go');
    if (!em || btn.disabled) return;
    var mail = em.value.trim();
    function bad(m) { err.textContent = m; }
    if (!okMail(mail)) { bad(T('gate.e1', '이메일 주소를 확인해 주세요.')); em.focus(); return; }
    if (!c1.checked) { bad(T('gate.e2', '개인정보 수집·이용에 동의해 주셔야 결과를 보여드릴 수 있어요.')); return; }
    bad(''); btn.disabled = true; btn.textContent = T('gate.sending', '확인하는 중…');
    var prev = LEAD, lead = { id: uid(), email: mail, mk: !!c2.checked, at: Date.now() };
    LEAD = lead;
    var p = ext(base('lead'), { email: mail, consentPrivacy: true, consentMarketing: lead.mk, consentVer: 'v1', snapshot: snap(), hp: hp ? hp.value : '', dwell: Date.now() - gateOpenAt });
    post(p, function (ok) {
      if (!ok) { LEAD = prev; btn.disabled = false; btn.textContent = T('gate.go', '결과 확인하기'); bad(T('gate.e3', '전송이 안 됐어요. 잠시 후 다시 눌러 주세요.')); return; }
      saveLead();
      var nx = gateNext; closeGate();
      if (nx != null) go(nx); else { refresh0(); dock(); }
    });
  }

  /* 견적 문의 보내기 */
  function inquirySubmit() {
    var F = $('#qf'); if (!F) return;
    var err = $('#q-err'), btn = $('#q-go'); if (btn.disabled) return;
    ['name', 'company', 'email', 'phone'].forEach(function (k) { var el = document.getElementById('q-' + k); if (el) S.c[k] = el.value.trim().slice(0, 200); });
    FL.forEach(function (f) { var el = document.getElementById('f-' + f[0]); if (el) S.f[f[0]] = el.value.slice(0, 2000); });
    function bad(m, id) { err.textContent = m; var el = id && document.getElementById(id); if (el) { try { el.focus(); } catch (e) {} } }
    if (!S.c.name) { bad(T('qf.e1', '이름을 입력해 주세요.'), 'q-name'); return; }
    if (!okMail(S.c.email)) { bad(T('qf.e2', '이메일 주소를 확인해 주세요.'), 'q-email'); return; }
    if (!$('#q-c1').checked) { bad(T('qf.e3', '개인정보 수집·이용에 동의해 주셔야 문의를 접수할 수 있어요.'), 'q-c1'); return; }
    bad(''); btn.disabled = true; btn.textContent = T('qf.sending', '보내는 중…');
    if (!S.sid) S.sid = uid();
    saveState();
    var p = ext(base('inquiry'), {
      id: S.sid, name: S.c.name, company: S.c.company, email: S.c.email, phone: S.c.phone, fields: S.f,
      items: picked() ? summaryItems().map(function (a) { return [a[0], a[1]]; }) : [], text: summaryText(), picked: picked(),
      consentPrivacy: true, consentMarketing: !!$('#q-c2').checked, consentVer: 'v1', hp: ($('#q-hp') || {}).value || ''
    });
    post(p, function (ok) {
      if (!ok) { btn.disabled = false; btn.textContent = T('qf.go', '견적 문의 보내기'); bad(T('qf.e4', '전송이 안 됐어요. 잠시 후 다시 눌러 주시거나 아래 전화·이메일로 문의해 주세요.')); return; }
      if (!LEAD) { LEAD = { id: uid(), email: S.c.email, mk: !!$('#q-c2').checked, at: Date.now() }; saveLead(); }
      S.sid = ''; S.f = { qty: '', budget: '', date: '', ref: '' }; saveState();
      var w = $('#q-wrap'), d = $('#q-done'); if (w) w.hidden = true; if (d) { d.hidden = false; try { d.focus(); } catch (e) {} }
      var pre = $('#q-pre'); if (pre) pre.innerHTML = '';
      dock(); window.scrollTo(0, 0);
    });
  }

  /* ---------- 이동 ---------- */
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function renderStep(n) {
    if (n === 0) refresh0(); else if (n === 1) refresh1(true); else if (n === 2) refresh2(); else refresh3();
  }
  function go(n, noPush) {
    n = n | 0;
    if (MODE === 'quote') n = 3;
    else {
      if (n > 2) { toQuote(); return; }
      n = Math.max(0, n);
      if (n >= 1 && locked()) { if (started) { openGate(n); return; } n = 0; }
    }
    if (started && n === S.step) return;
    var from = S.step, dir = n > from ? 'r' : 'l', oldp = $('#pg' + from), newp = $('#pg' + n);
    S.step = n; renderStep(n); head(); dock(); saveState();
    if (!started || RM) { $$('.page').forEach(function (p) { p.className = 'page' + (p === newp ? ' on' : ''); }); }
    else {
      $$('.page').forEach(function (p) { if (p !== oldp && p !== newp) p.className = 'page'; });
      oldp.className = 'page out out-' + (dir === 'r' ? 'l' : 'r');
      newp.className = 'page on in-' + dir;
      setTimeout(function () { oldp.className = 'page'; newp.className = 'page on'; }, 330);
    }
    window.scrollTo(0, 0);
    setTimeout(function () { tblSync($('#pg2 .scroll')); }, 20); setTimeout(function () { tblSync($('#pg2 .scroll')); }, 360);
    if (!noPush && started) { try { history.pushState({ step: n }, ''); } catch (e) {} }
    var h = $('h1', newp); if (h && started) { try { h.focus({ preventScroll: true }); } catch (e) {} }
    started = true;
  }
  var TOAST = {
    pick: '설치 장소, 기간, 조형 종류를 먼저 골라 주세요.',
    kakao: '내용이 복사됐어요. 카카오톡 채팅창에 붙여 넣어 주세요.',
    kakao2: '자동 복사가 안 됐어요. 채팅창에서 ‘내용 복사하기’로 다시 복사해 주세요.',
    copy: '복사했어요. 카카오톡이나 이메일에 붙여 넣어 주세요.',
    copy2: '자동 복사가 안 돼서 내용을 선택해 두었어요. 길게 눌러 복사해 주세요.'
  };
  function TS(k) { return T('toast.' + k, TOAST[k]); }
  function toast(msg) { var t = $('#toast'); if (!t) return; t.textContent = msg; t.classList.add('on'); clearTimeout(toast.h); toast.h = setTimeout(function () { t.classList.remove('on'); }, 2600); }
  function update() { saveState(); renderStep(S.step); head(); dock(); }

  /* ---------- 복사 ---------- */
  function fallbackCopy(text, done) {
    var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (e) {} document.body.removeChild(ta); done(ok);
  }
  function copy(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) { try { navigator.clipboard.writeText(text).then(function () { done(true); }, function () { fallbackCopy(text, done); }); } catch (e) { fallbackCopy(text, done); } }
    else fallbackCopy(text, done);
  }

  /* ---------- data/guide.json 읽기 ---------- */
  /* guide.json 은 { 구역: { 키: 값, … }, … } 모양 → 키: 값 한 줄짜리로 펼칩니다 */
  function flatten(j) {
    var c = {};
    Object.keys(j || {}).forEach(function (sec) {
      var o = j[sec]; if (!o || typeof o !== 'object') return;
      Object.keys(o).forEach(function (k) { var v = o[k]; c[k] = v == null ? '' : String(v).replace(/\r/g, '').replace(/^\s+|\s+$/g, ''); });
    });
    return c;
  }
  var DEBUG = /[?&]debug\b/.test(location.search), dbgEl = null;
  function dbg(t) {
    if (!DEBUG) return;
    if (!dbgEl) { dbgEl = document.createElement('div'); dbgEl.className = 'dbg'; document.body.appendChild(dbgEl); }
    dbgEl.textContent = t;
  }
  function render() {
    var sy = window.scrollY, was = started;
    $('#app').innerHTML = shell();
    var cur = S.step; started = false; S.step = -1; go(cur, true);
    if (was) window.scrollTo(0, sy);
    FL.forEach(function (f) { var el = document.getElementById('f-' + f[0]); if (el) el.value = S.f[f[0]] || ''; });
  }
  function loadGuide(done) {
    var fin = false, to = setTimeout(function () { finish(null); }, 5000);
    function finish(j) {
      if (fin) return; fin = true; clearTimeout(to);
      var c = flatten(j), n = Object.keys(c).length;
      if (n) CONTENT = c;
      dbg(n ? 'data/guide.json 에서 ' + n + '개 항목을 불러왔어요.' : 'data/guide.json 을 불러오지 못해 기본 내용을 보여주는 중이에요.');
      done();
    }
    if (!window.fetch) { finish(null); return; }
    fetch('data/guide.json', { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); }).then(finish, function () { finish(null); });
  }

  /* ---------- 이벤트 ---------- */
  function firstUnanswered() { return !S.env ? 'env' : !S.dur ? 'dur' : !S.form ? 'form' : ''; }
  function kakaoCopy() {
    copy(summaryText(), function (ok) {
      toast(ok ? TS('kakao') : TS('kakao2'));
    });
  }
  document.addEventListener('click', function (e) {
    var t = e.target; if (!t.closest) return; var c;
    if ((c = t.closest('[data-tscroll]'))) { var ts = $('.scroll', c.parentNode); if (ts) ts.scrollBy({ left: parseInt(c.getAttribute('data-tscroll'), 10) * Math.max(240, ts.clientWidth * 0.6), behavior: RM ? 'auto' : 'smooth' }); return; }
    if ((c = t.closest('[data-gal]'))) { var gt = $('.gal-track', c.parentNode), gs = galStep(gt); if (gt && gs) gt.scrollBy({ left: parseInt(c.getAttribute('data-gal'), 10) * gs, behavior: RM ? 'auto' : 'smooth' }); return; }
    if ((c = t.closest('[data-zoom]'))) { var zi = $('img', c), zf = c.closest('.gal-s'), zc = zf && $('figcaption', zf); if (zi) openZoom(zi, zc ? zc.textContent : ''); return; }
    if ((c = t.closest('[data-q]'))) {
      var g = c.getAttribute('data-q'), v = c.getAttribute('data-v');
      if (g === 'comp') S.comp = v; else S[g] = v;
      if (g === 'form' && !S.comp) { /* 자동 난이도 유지 */ }
      update(); return;
    }
    if ((c = t.closest('[data-c]'))) { var gg = c.getAttribute('data-c'); S.ov[gg] = c.getAttribute('data-v'); update(); return; }
    if ((c = t.closest('[data-mat]'))) { S.mat = c.getAttribute('data-mat'); saveState(); refresh1(true); return; }
    if ((c = t.closest('[data-go]'))) { S.mat = c.getAttribute('data-go'); go(1); return; }
    if ((c = t.closest('[data-step]'))) { go(parseInt(c.getAttribute('data-step'), 10)); return; }
    if ((c = t.closest('[data-act]'))) {
      var a = c.getAttribute('data-act');
      if (a === 'next') {
        if (c.getAttribute('aria-disabled') === 'true') { toast(TS('pick')); var fq = firstUnanswered(), qe = fq && $('.q[data-qk="' + fq + '"]'); if (qe) qe.scrollIntoView({ block: 'center', behavior: RM ? 'auto' : 'smooth' }); return; }
        if (S.step === 0 && ready()) S.mat = rank()[0].m.id;
        go(S.step + 1);
      }
      else if (a === 'prev') go(S.step - 1);
      else if (a === 'estimate') { S.ov.mat = c.getAttribute('data-v'); saveState(); go(2); }
      else if (a === 'reset-calc') { S.ov = {}; update(); }
      else if (a === 'restart') { S.env = ''; S.dur = ''; S.form = ''; S.comp = ''; S.height = 150; S.mat = 'frp'; S.ov = {}; S.f = { qty: '', budget: '', date: '', ref: '' }; S.step = 0; saveState(); location.href = FIND_URL; }
      else if (a === 'unlock') openGate(null);
      else if (a === 'gate-close') closeGate();
      else if (a === 'submit') inquirySubmit();
      else if (a === 'kakao') kakaoCopy();
      else if (a === 'copy') copy(summaryText(), function (ok) {
        if (ok) toast(TS('copy'));
        else { var r = document.createRange(), sm = $('#sum'); if (sm) { r.selectNodeContents(sm); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); } toast(TS('copy2')); }
      });
      return;
    }
    if ((c = t.closest('[data-cv]'))) {
      var v2 = c.closest('.ct').querySelector('.v'), old = c.textContent;
      copy(clean(v2.textContent), function (ok) { c.textContent = ok ? T('btn.cvd', '복사됨') : T('btn.cvf', '선택해서 복사하세요'); setTimeout(function () { c.textContent = old; }, 1600); });
    }
  });
  document.addEventListener('input', function (e) {
    var t = e.target; if (!t || !t.id) return;
    if (t.id === 'hr') { S.height = parseInt(t.value, 10); setRange('hr', S.height); saveState(); var r = $('#rec'); if (r) r.innerHTML = recHTML(); dock(); return; }
    if (t.id === 'cr') { S.ov.height = parseInt(t.value, 10); saveState(); refresh2(); dock(); return; }
    if (/^q-/.test(t.id)) { var ck = t.id.slice(2); if (S.c && ck in S.c) { S.c[ck] = t.value.slice(0, 200); saveState(); } return; }
    if (/^f-/.test(t.id)) { var k = t.id.slice(2); if (k in S.f) { S.f[k] = t.value.slice(0, 2000); saveState(); var sm = $('#sum'); if (sm) { /* 요약 카드는 필수 항목만 보여 주므로 갱신 불필요 */ } } }
  });
  document.addEventListener('submit', function (e) {
    var f = e.target; if (!f || !f.id) return;
    if (f.id === 'gf') { e.preventDefault(); gateSubmit(); }
    else if (f.id === 'qf') { e.preventDefault(); inquirySubmit(); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && $('#gate') && !$('#gate').hidden) closeGate(); });
  window.addEventListener('popstate', function (e) { var st = e.state && typeof e.state.step === 'number' ? e.state.step : 0; go(st, true); });

  /* ---------- 시작 ---------- */
  /* data/lead-config.json: 사이트 설정(CMS)에서 정한 문의 접수 주소·카카오톡 주소 */
  function loadCfg(done) {
    var fin = false, to = setTimeout(function () { finish(null); }, 4000);
    function finish(j) {
      if (fin) return; fin = true; clearTimeout(to);
      if (j && typeof j === 'object') {
        if (/^https:\/\//i.test(j.endpoint || '')) CONFIG.LEAD_URL = j.endpoint;
        if (/^https:\/\//i.test(j.kakao || '') && !CONFIG.KAKAO_URL) CONFIG.KAKAO_URL = j.kakao;
        if (typeof j.privacy === 'string' && j.privacy) CONFIG.PRIVACY_URL = j.privacy;
      }
      done();
    }
    if (!window.fetch) { finish(null); return; }
    fetch('data/lead-config.json', { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); }).then(finish, function () { finish(null); });
  }
  loadState(); loadLead();
  var pend = 2;
  function ready2() {
    if (--pend) return;
    render();
    try { history.replaceState({ step: S.step }, ''); } catch (e) {}
  }
  loadGuide(ready2); loadCfg(ready2);

  // 입력 칸(.pages.yml)을 만들 때 쓰는 기본값 목록 (화면에는 영향 없음)
  function registerAll() {
    var save = JSON.stringify(S), was = started;
    MATS.forEach(function (m) { matBody(m); });
    page0(); page1(); page2(); page3(); cmpHTML(); tbl(); calcOn(); kakaoURL(); chipsHTML();
    [[{ env: 'out', dur: 'l', form: 'c' }, {}], [{ env: 'out', dur: 's', form: 'f' }, {}], [{ env: '', dur: '', form: '' }, {}], [{ env: 'in', dur: 's', form: 'l' }, {}], [{ env: 'out', dur: 's', form: 'c' }, { mat: 'acrylic' }]].forEach(function (sc) {
      S = JSON.parse(save); for (var k in sc[0]) S[k] = sc[0][k]; S.ov = sc[1]; S.mat = 'frp';
      recHTML(); refresh2(); summaryText();
      for (var st = 0; st < 4; st++) { S.step = st; dock(); head(); }
    });
    Object.keys(TOAST).forEach(TS);
    T('rec.warn', '상담이 필요한 점'); T('rec.warn2', '항목은 이 소재의 약점이에요. 보완 방법을 함께 확인해 보세요.');
    T('btn.cvd', '복사됨'); T('btn.cvf', '선택해서 복사하세요'); T('tbl.left', '표 왼쪽으로'); T('tbl.right', '표 오른쪽으로');
    S = JSON.parse(save); started = was; refresh2(); refresh3();
  }
  window.malongGuide = { order: ORDER, text: DEF, lists: LDEF, scores: NDEF, nums: FDEF, photos: PHOTOS, registerAll: registerAll };
})();

