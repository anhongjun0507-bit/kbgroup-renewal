/**
 * KB GROUP / (주)케이비개발 — 사이트 콘텐츠 단일 소스 (Single Source of Truth)
 *
 * 출처:
 *  - 회사정보·연혁·사업영역·인허가·자격증·연락처: kb-dvp.com 크롤링 (2026-05)
 *  - 카운터 수치·파트너 일부: 스펙상의 더미값 (실제 자료 확보 후 교체 예정)
 *
 * 데이터 갱신 시 이 파일만 수정하면 사이트 전반에 반영됩니다.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────────────────────────────────────

export type Counter = {
  key: string;
  label: string;
  /** 영문 캡션 (kicker 스타일, 라벨 아래) */
  caption: string;
  value: number;
  suffix?: string;
  /** 실제 클라이언트 자료 확보 전 더미 수치 여부 */
  isPlaceholder?: boolean;
};

export type BusinessCategory =
  | "facility"
  | "sanitation"
  | "security"
  | "development"
  | "other";

export type Reason = {
  title: string;
  description: string;
};

export type BusinessArea = {
  id: BusinessCategory;
  /** URL 슬러그 — `/business/{slug}` */
  slug: string;
  name: string;
  /** 영문 부제 (카드/리스트 영문 캡션용) */
  englishName: string;
  tagline: string;
  summary: string;
  highlights: string[];
  subBusinesses: string[];
  /** 상세 페이지 "WHY US" 섹션 3 reasons */
  reasons: Reason[];
};

export type ProcessStep = {
  key: string;
  numberLabel: string;
  name: string;
  englishName: string;
  description: string;
};

export type Complex = {
  name: string;
  client?: string;
  region: string;
  households?: number;
  type?: "LH" | "민간" | "공공";
};

export type Partner = {
  name: string;
  category: "public" | "client" | "construction";
  note?: string;
  /** 더미 데이터 여부 (실 거래처 확정 시 false로) */
  placeholder?: boolean;
};

export type License = {
  name: string;
  issuer: string;
  acquiredAt?: string;
};

export type Certification = {
  name: string;
  count: number;
  issuer: string;
};

export type HistoryEntry = {
  date: string;
  event: string;
};

export type RelatedCompany = {
  name: string;
  note: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. 회사 정보
// ─────────────────────────────────────────────────────────────────────────────

export const company = {
  brandName: "KB GROUP",
  name: "(주)케이비개발",
  legalName: "주식회사 케이비개발",
  domain: "kbgroup.kr",
  ceo: "김 현",
  founded: "2014-12",
  foundedYear: 2014,
  capital: "12억 1천만원",
  businessNumber: "410-87-05616",
  motto: "꿈은 현실로 현실은 노력으로",
  goals: [
    { en: "PLAN", kr: "철저한 기획" },
    { en: "DECISION", kr: "정확한 판단" },
    { en: "MANAGEMENT", kr: "정직한 관리" },
  ],
  tagline: "신뢰받는 종합 시설관리 파트너",
  intro:
    "(주)케이비개발은 주택관리, 경비, 상주청소, 저수조청소, 방역소독, 수목관리 등을 아우르는 종합 시설관리 기업입니다. 경륜 있는 주택관리사와 공동주택 건설 현장소장 출신, 공직·대기업 출신 임직원이 한 팀이 되어 공정하고 투명한 단지 운영을 약속드립니다.",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 2. 연락처
// ─────────────────────────────────────────────────────────────────────────────

export type Contact = {
  phone: string;
  fax: string;
  email: string;
  /** 채용 전용 이메일 — 현재 미보유. 실제 받으면 채우기. */
  careersEmail?: string;
  address: string;
  privacyOfficer: { name: string; phone: string };
  parking: string;
  nearestStops: string[];
  busRoutes: string[];
};

export const contact: Contact = {
  phone: "062-416-3021",
  fax: "062-974-3070",
  // TODO: 실제 대표 이메일 확인 후 교체
  email: "info@kbgroup.kr",
  // careersEmail: 미보유. 사용처에서 `careersEmail ?? email` fallback.
  address: "광주광역시 광산구 월계로 223-22, 2층 201·202호",
  privacyOfficer: { name: "고예근", phone: "062-416-3037" },
  parking: "지하 1층 주차장 (방문객 무료)",
  nearestStops: ["첨단롯데마트", "우편집중국"],
  busRoutes: ["금호46", "첨단30", "첨단22", "첨단23", "송정33", "임곡91"],
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. 대표 메시지
// ─────────────────────────────────────────────────────────────────────────────

export const ceoMessage = {
  authorName: "김 현",
  authorTitle: "(주)케이비개발 대표이사",
  paragraphs: [
    "(주)케이비개발 홈페이지에 방문해주셔서 감사합니다.",
    "당사는 주택관리, 경비, 상주청소, 저수조청소, 방역소독, 수목관리 등의 사업을 영위하는 종합주택관리회사입니다.",
    "급변하는 주거문화와 다양한 건축물 관리에 대응하기 위해, 경륜 있는 주택관리사와 공동주택 건설 현장소장 출신, 공직·대기업 출신 임직원이 한 팀이 되어 성실하게 신뢰를 쌓으며 성장하고 있습니다.",
    "또한 주택관리업체 중 보기 드물게 자체 주택임대사업장 1,000여 세대를 운영하며 회사 재정을 견고히 함과 동시에, 위탁 단지 입주민에게도 재산 증식의 기회를 제공해드리고 있습니다.",
    "크고 작은 사업장 구분 없이 단지마다 소중하고 한결같은 마음으로 입주자대표회의와 입주민의 뜻을 받들어, 공정하고 투명한 관리가 되도록 최선을 다하겠습니다.",
    "(주)케이비개발과 함께해주시기를 간절히 소망드립니다. 감사합니다.",
  ],
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 4. 카운터 (메인 페이지 핵심 수치)
//    실제 사이트 표기는 "1,000여 세대" — 12,000+는 스펙상의 더미값.
// ─────────────────────────────────────────────────────────────────────────────

export const counters: Counter[] = [
  {
    key: "households",
    label: "관리 세대수",
    caption: "MANAGED HOUSEHOLDS",
    value: 12000,
    suffix: "+",
    isPlaceholder: true,
  },
  {
    key: "complexes",
    label: "누적 운영 단지",
    caption: "COMPLEXES OPERATED",
    value: 85,
    suffix: "+",
    isPlaceholder: true,
  },
  {
    key: "licenses",
    label: "인허가 보유",
    caption: "CERTIFICATIONS",
    value: 15,
    suffix: "+",
    isPlaceholder: true,
  },
  {
    key: "lhProjects",
    label: "LH 실적",
    caption: "LH PROJECTS",
    value: 42,
    suffix: "+",
    isPlaceholder: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 5. 사업영역 — 원본 9개 사업을 5개 대분류로 매핑
// ─────────────────────────────────────────────────────────────────────────────

export const businessAreas: BusinessArea[] = [
  {
    id: "facility",
    slug: "facility",
    name: "시설관리",
    englishName: "FACILITY MANAGEMENT",
    tagline: "회계·시설·인사·민원, 단지 운영의 모든 것",
    summary:
      "공동주택·오피스텔·빌딩 위탁관리. 전문 인력이 일관된 기준으로 단지를 운영해 시설 효율성과 회계 투명성을 함께 끌어올립니다.",
    highlights: [
      "기업회계 기준·공동주택 회계원칙 준수로 투명한 회계 관리",
      "정기 안전점검·일일 점검으로 사고 위험 사전 차단",
      "직무교육·기술인력 풀 운영으로 일관된 서비스 품질",
      "민원 당일 처리 + 2일 내 피드백 프로세스",
    ],
    subBusinesses: ["주택관리업"],
    reasons: [
      { title: "24시간 통합 관리", description: "기계·전기·소방 전 분야 통합 운영" },
      { title: "검증된 전문 인력", description: "자격증 보유 기술자 상주" },
      { title: "사고 예방 시스템", description: "정기 점검과 예측 정비" },
    ],
  },
  {
    id: "sanitation",
    slug: "sanitation",
    name: "위생청소",
    englishName: "SANITATION",
    tagline: "계단실부터 저수조까지, 단지 위생 한 곳에서",
    summary:
      "계단실·복도 미화부터 살충·살균 방역, 저수조 청소, 수목 진단까지. 단지 전 구역의 위생을 한 회사가 책임집니다.",
    highlights: [
      "구역별 책임 청소제 + 계획적 대청소 운영",
      "실내·실외·수목 통합 소독 (분무·도포·연막)",
      "수도법 기준 6개월 1회 저수조 청소·위생점검",
      "나무병원 등록(2급, 광주광역시) 기반 수목 진단·치료",
    ],
    subBusinesses: ["위생관리업", "방역및소독", "저수조청소업", "나무병원"],
    reasons: [
      { title: "위생 표준화", description: "일일 점검 체크리스트 기반 관리" },
      { title: "친환경 약품 사용", description: "입주자 건강 우선" },
      { title: "방역 통합 서비스", description: "정기 방역 + 응급 대응" },
    ],
  },
  {
    id: "security",
    slug: "security",
    name: "경비보안",
    englishName: "SECURITY",
    tagline: "출입·방재·주차를 통합한 단지 안전",
    summary:
      "잘 훈련된 경비 인력이 출입 관리부터 화재·도난 방지, 주차 정비까지 통합 운영해 단지의 안전과 품격을 함께 지킵니다.",
    highlights: [
      "단정한 복장·친절한 응대로 단지 이미지 제고",
      "비상사태 시 초기 응급조치 + 입주민 피난 유도",
      "정시·수시 순찰로 도난·화재 사전 예방",
      "주차계획 수립부터 외부차량 단속까지 일원화 관리",
    ],
    subBusinesses: ["시설경비업"],
    reasons: [
      { title: "24시간 모니터링", description: "CCTV + 상주 인력" },
      { title: "출입 통제 시스템", description: "디지털 + 휴먼 케어" },
      { title: "응급 대응 체계", description: "신고-출동 평균 5분" },
    ],
  },
  {
    id: "development",
    slug: "construction",
    name: "시행건설",
    englishName: "CONSTRUCTION",
    tagline: "시행부터 유지·도장·방수까지, 가치를 지키는 시공",
    summary:
      "아파트·오피스텔·도시형 생활주택 시행 사업과, 관계사 기담산업개발을 통한 유지보수·도장·방수·미장 시공을 제공합니다.",
    highlights: [
      "주거·교통·학군 우수 입지 중심 시행 사업",
      "시설물 유지관리 다년 노하우 (놀이터·놀이시설 등)",
      "도장공사업: 재도장·신축 도장 풍부한 실적",
      "미장·타일·방수·조적 등 습식공사 통합 시공",
    ],
    subBusinesses: ["시행업", "종합건설(기담산업개발)"],
    reasons: [
      { title: "통합 솔루션", description: "기획부터 시공까지 원스톱" },
      { title: "검증된 협력사", description: "분야별 전문 시공팀" },
      { title: "사후 관리 보장", description: "시공 후 유지보수 연계" },
    ],
  },
  {
    id: "other",
    slug: "others",
    name: "기타",
    englishName: "OTHERS",
    tagline: "임대운영·도소매까지, 확장된 서비스 라인업",
    summary:
      "자체 임대주택 1,000여 세대 운영 노하우와, 관계사 (유)케이오아시스의 청소용품 도소매·서비스를 통해 종합 솔루션을 제공합니다.",
    highlights: [
      "자체 임대주택 1,000여 세대 운영 노하우",
      "임차인 모집·임대료 징수·유지관리 풀 서비스",
      "(유)케이오아시스: 청소용품 도소매 + 경비·청소 서비스",
      "관계사 케이비뷰·기담산업개발과 시너지 운영",
    ],
    subBusinesses: ["주택임대업", "주택임대관리업", "도·소매업 및 서비스업"],
    reasons: [
      { title: "맞춤형 컨설팅", description: "단지별 특성 분석 기반" },
      { title: "분야 통합 자문", description: "시설·운영·법무 통합 조언" },
      { title: "장기 파트너십", description: "단발성 X, 지속적 관계" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 12. 서비스 진행 프로세스 (카테고리 무관 공통 4단계)
// ─────────────────────────────────────────────────────────────────────────────

export type CoreValue = {
  number: string;
  englishName: string;
  koreanName: string;
  tagline: string;
};

export type Differentiator = {
  number: string;
  englishName: string;
  koreanName: string;
  description: string;
};

export const coreValues: CoreValue[] = [
  {
    number: "01",
    englishName: "Trust",
    koreanName: "신뢰",
    tagline: "약속한 것을 지킨다",
  },
  {
    number: "02",
    englishName: "Expertise",
    koreanName: "전문성",
    tagline: "검증된 기술과 경험",
  },
  {
    number: "03",
    englishName: "Responsibility",
    koreanName: "책임",
    tagline: "공간을 끝까지 책임진다",
  },
];

export const differentiators: Differentiator[] = [
  {
    number: "01",
    englishName: "INTEGRATED SERVICES",
    koreanName: "종합 서비스 운영",
    description: "시설·위생·경비·시행을 한 회사에서 책임집니다.",
  },
  {
    number: "02",
    englishName: "VERIFIED EXPERTISE",
    koreanName: "검증된 전문 인력",
    description: "자격증 보유 전문 인력만 현장에 투입합니다.",
  },
  {
    number: "03",
    englishName: "TRANSPARENT RECORDS",
    koreanName: "투명한 기록 관리",
    description: "모든 작업 내역을 체계적으로 기록하고 공유합니다.",
  },
  {
    number: "04",
    englishName: "RAPID RESPONSE",
    koreanName: "신속한 응급 대응",
    description: "비상 상황에 즉시 응급조치를 시행합니다.",
  },
  {
    number: "05",
    englishName: "LASTING RELATIONSHIPS",
    koreanName: "지속적 신뢰 관계",
    description: "한 번의 계약을 넘어 오래 함께합니다.",
  },
];

export const processSteps: ProcessStep[] = [
  {
    key: "consultation",
    numberLabel: "01",
    name: "상담 · 견적",
    englishName: "CONSULTATION",
    description: "고객 요구사항 분석 후 맞춤형 제안",
  },
  {
    key: "contract",
    numberLabel: "02",
    name: "계약 · 준비",
    englishName: "CONTRACT",
    description: "세부 사항 협의 후 운영 체계 구축",
  },
  {
    key: "operation",
    numberLabel: "03",
    name: "운영 · 관리",
    englishName: "OPERATION",
    description: "체계적인 관리와 정기 점검",
  },
  {
    key: "after-care",
    numberLabel: "04",
    name: "사후 관리",
    englishName: "AFTER-CARE",
    description: "지속적인 모니터링과 개선",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 6. 관리 단지 (대표 실적 — 메인 슬라이드 상위 5개 LH + 신규 단지)
// ─────────────────────────────────────────────────────────────────────────────

export const complexes: Complex[] = [
  {
    name: "LH 파주 운정 물향기마을 1단지",
    client: "LH 한국토지주택공사",
    region: "경기 파주",
    type: "LH",
  },
  {
    name: "LH 시흥 장현 트리플센텀아파트",
    client: "LH 한국토지주택공사",
    region: "경기 시흥",
    type: "LH",
  },
  {
    name: "LH 용인 한보라마을 휴먼시아4단지",
    client: "LH 한국토지주택공사",
    region: "경기 용인",
    type: "LH",
  },
  {
    name: "LH 의왕 초평 루젠트힐",
    client: "LH 한국토지주택공사",
    region: "경기 의왕",
    type: "LH",
  },
  {
    name: "LH 성남 신흥 산성역 자이푸르지오",
    client: "LH 한국토지주택공사",
    region: "경기 성남",
    type: "LH",
  },
  // type 필드 제거: 크롤링 출처에 명시 없음. 단지명 기반 판단은 컴포넌트 로직에서 처리.
  { name: "계림 IPARK SK뷰", region: "광주 계림동" },
  { name: "담양 양우내안애퍼스트힐 1,2단지", region: "전남 담양" },
  { name: "양림1차휴먼시아", region: "광주 양림" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 7. 파트너사 — 원본 사이트에 별도 파트너 페이지 없음.
//    실제 발주처는 LH 중심, 일부는 스펙대로 더미값.
// ─────────────────────────────────────────────────────────────────────────────

export const partners: Partner[] = [
  {
    name: "LH 한국토지주택공사",
    category: "client",
    note: "주요 발주처 — 다수 위탁관리 단지",
  },
  { name: "광주광역시청", category: "public" },
  { name: "광주광역시 광산구청", category: "public" },
  { name: "광주지방경찰청", category: "public" },
  { name: "GS건설", category: "construction", placeholder: true },
  { name: "현대건설", category: "construction", placeholder: true },
  { name: "대우건설", category: "construction", placeholder: true },
  { name: "포스코이앤씨", category: "construction", placeholder: true },
];

// ─────────────────────────────────────────────────────────────────────────────
// 8. 인허가 (실제 보유 11종)
// ─────────────────────────────────────────────────────────────────────────────

export const licenses: License[] = [
  { name: "주택관리업 등록", issuer: "광산구청", acquiredAt: "2016.04" },
  {
    name: "주택임대관리업 등록",
    issuer: "광산구청",
    acquiredAt: "2016.01",
  },
  { name: "임대사업자 등록", issuer: "광산구청", acquiredAt: "2014.12" },
  {
    name: "시설경비업 허가",
    issuer: "광주지방경찰청장",
    acquiredAt: "2016.04",
  },
  { name: "위생관리용역업 신고", issuer: "광산구청장", acquiredAt: "2016.06" },
  { name: "소독업 신고", issuer: "광주광역시 광산구", acquiredAt: "2018.04" },
  { name: "저수조청소업 신고", issuer: "광산구청장", acquiredAt: "2018.09" },
  {
    name: "나무병원(2급) 등록",
    issuer: "광주광역시청",
    acquiredAt: "2019.08",
  },
  {
    name: "안전보건경영시스템 ISO 45001:2018 인증",
    issuer: "KSR",
    acquiredAt: "2020.12",
  },
  // 사업자등록증 acquiredAt는 출처에 explicit 표기 없음 → 표시 안 함
  { name: "사업자등록증", issuer: "광주세무서" },
  {
    name: "광주지방경찰청장 감사장",
    issuer: "광주지방경찰청장",
    acquiredAt: "2018.10",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 9. 보유 자격증 (27종, 총 1,575명)
// ─────────────────────────────────────────────────────────────────────────────

export const totalCertHolders = 1575;

/**
 * 운영 년수 — 설립일(2014.12) 기준 동적 계산.
 * 모듈 로드 시점에 평가되므로 빌드 또는 클라이언트 로드 시 값이 갱신됨.
 * 매년 12월 1일 경계에서 자동 +1 (재빌드 또는 페이지 재방문 시).
 */
const _FOUNDING_DATE = new Date(2014, 11, 1); // 2014년 12월 1일
export const yearsOfOperation: number = Math.max(
  0,
  Math.floor(
    (Date.now() - _FOUNDING_DATE.getTime()) /
      (365.25 * 24 * 60 * 60 * 1000),
  ),
);

export const certifications: Certification[] = [
  { name: "주택관리사", count: 150, issuer: "국토교통부" },
  { name: "주택관리사(보)", count: 80, issuer: "국토교통부" },
  { name: "공인중개사", count: 150, issuer: "국토교통부" },
  { name: "소방안전관리자", count: 130, issuer: "한국소방안전원" },
  { name: "소방설비기사", count: 60, issuer: "한국산업인력관리공단" },
  { name: "전기기사", count: 70, issuer: "한국산업인력관리공단" },
  { name: "전기산업기사", count: 60, issuer: "한국산업인력관리공단" },
  { name: "전기기능사", count: 50, issuer: "한국산업인력관리공단" },
  { name: "전기공사기능사", count: 40, issuer: "한국산업인력관리공단" },
  { name: "승강기기능사", count: 50, issuer: "한국산업인력관리공단" },
  { name: "건축기사", count: 50, issuer: "한국산업인력관리공단" },
  { name: "건축산업기사", count: 60, issuer: "한국산업인력관리공단" },
  { name: "건축설비기사", count: 25, issuer: "한국산업인력관리공단" },
  { name: "토목기사", count: 30, issuer: "한국산업인력관리공단" },
  { name: "기계설비", count: 50, issuer: "대한기계설비건설협회" },
  { name: "초경량비행장치 조종자", count: 30, issuer: "교통안전공단" },
  { name: "열처리기능사", count: 35, issuer: "한국산업인력관리공단" },
  { name: "에너지관리기능사", count: 40, issuer: "한국산업인력관리공단" },
  { name: "고압가스기능사", count: 37, issuer: "한국산업인력관리공단" },
  { name: "위험물취급기능사", count: 33, issuer: "한국산업인력관리공단" },
  { name: "조경기능사", count: 25, issuer: "한국산업인력관리공단" },
  { name: "전산세무 1급", count: 80, issuer: "한국세무사회" },
  { name: "전산세무 2급", count: 70, issuer: "한국세무사회" },
  { name: "전산회계 1급", count: 80, issuer: "한국세무사회" },
  { name: "전산회계 2급", count: 70, issuer: "한국세무사회" },
  { name: "경비지도사", count: 15, issuer: "경찰청장" },
  { name: "수목치료사", count: 5, issuer: "산림청장" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 10. 연혁
// ─────────────────────────────────────────────────────────────────────────────

export const history: HistoryEntry[] = [
  { date: "2014.12", event: "(주)케이비개발 법인 설립" },
  { date: "2014.12", event: "임대사업자 등록 (광산구청)" },
  { date: "2015.01", event: "(주)케이비개발 목포지사 설립" },
  { date: "2016.01", event: "주택임대관리업 등록 (광산구청)" },
  { date: "2016.04", event: "주택관리업 등록 (광산구청)" },
  { date: "2016.04", event: "시설경비업 허가 (광주지방경찰청)" },
  { date: "2016.06", event: "위생관리용역업 신고 (광산구청)" },
  { date: "2017.06", event: "본사 사옥 이전" },
  { date: "2017.11", event: "(주)케이비뷰 설립" },
  { date: "2018.04", event: "소독업 신고" },
  { date: "2018.09", event: "저수조청소업 신고" },
  { date: "2019.05", event: "본사 사옥 이전" },
  { date: "2019.08", event: "나무병원 등록 (광주광역시청)" },
  { date: "2020.12", event: "안전보건경영시스템 ISO 45001 인증 (KSR)" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 11. 관계사
// ─────────────────────────────────────────────────────────────────────────────

export const relatedCompanies: RelatedCompany[] = [
  { name: "(주)케이비뷰", note: "2017.11 설립 관계사" },
  { name: "(주)케이비개발 목포지사", note: "2015.01 설립" },
  { name: "기담산업개발", note: "종합건설업 (관계사)" },
  { name: "(유)케이오아시스", note: "도·소매업 / 청소용품·서비스 (관계사)" },
];
