/**
 * KB GROUP / (주)케이비개발 — 사이트 콘텐츠 단일 소스 (Single Source of Truth)
 *
 * 출처:
 *  - Phase 7 (2026-05-16): 공식 회사소개서 PDF "케이비개발 지명원" 기준 전수 교체
 *  - 회사정보·연혁·인허가·자격증·관리실적·협력업체: PDF 페이지별 데이터 추출
 *
 * 데이터 갱신 시 이 파일만 수정하면 사이트 전반에 반영됩니다.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────────────────────────────────────

export type Counter = {
  key: string;
  label: string;
  caption: string;
  value: number;
  suffix?: string;
  isPlaceholder?: boolean;
  /** Phase 14 UP-02 — 데이터 컨텍스트 1줄 (예: "광주시 평균 단지의 5배 규모") */
  context?: string;
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
  slug: string;
  name: string;
  englishName: string;
  tagline: string;
  summary: string;
  highlights: string[];
  subBusinesses: string[];
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
  /** 관리면적 ㎡ */
  area?: number;
  /** 관리 분야 (위탁관리/경비/청소/전기 등) */
  scope?: string;
  /** 단지 분류 — 공동주택 / 집합건물 */
  kind?: "apartment" | "mixed-use";
  type?: "LH" | "민간" | "공공";
  /**
   * 단지 대표 사진 경로 (선택, public/images/cases/* 기준).
   * Phase 14 P0-03 — 슬롯 신규. image 지정 시 모노그램 fallback 대신 next/image 노출.
   * complexes 배열의 각 항목에 사용자가 매핑 정보 입력 시 자동 적용.
   */
  image?: string;
  /** Phase 14-M (2026-05-20) — hwpx 등 고객 자료에서 사용된 표기 별칭 (검색·필터·SEO 보조) */
  aliases?: string[];
  /**
   * Phase 14-M (2026-05-20) — hwpx 명시 "주요 관리실적 19개"에 포함되어 카드 우선 노출.
   * LH 단지(type === "LH")는 자동 카드 표시이므로 별도 마킹 불필요.
   */
  isFeatured?: boolean;
};

/* Phase 14-M (2026-05-20) — 과거 운영 단지.
   클라 제공 "관리실적리스트 - 현재관리단지제외.pdf" 18건.
   현재 운영 X, 계약 종료/임시 운영 후 종결. /cases 페이지 별도 섹션으로 표시. */
export type PastComplex = {
  name: string;
  region: string;
  households?: number;
  /** 관리면적 ㎡ */
  area?: number;
  /** 계약 기간 (예: "2019.3.1 ~ 2025.10.31") */
  period?: string;
  kind?: "apartment" | "mixed-use";
  type?: "LH" | "민간" | "공공";
  /** Phase 14-M — hwpx 등 고객 자료에서 사용된 표기 별칭 */
  aliases?: string[];
  /**
   * Phase 14-M-3 (2026-05-20) — hwpx "주요 19개" 명시 단지 중 현재 운영 X 단지.
   * 카드 영역(CasesGallery)에 "종료" 라벨로 노출. PastProjects에도 그대로 표시. */
  isFeatured?: boolean;
};

export type Partner = {
  name: string;
  category: "public" | "client" | "construction";
  note?: string;
  placeholder?: boolean;
};

export type Collaborator = {
  name: string;
  field: string;
  scope: string;
};

export type License = {
  name: string;
  issuer: string;
  acquiredAt?: string;
  /** 증명서 사진 (선택) */
  image?: string;
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
  /** 계열사 로고 (선택) */
  logo?: string;
};

export type CompanyStrength = {
  number: string;
  title: string;
  description: string;
};

/* Phase 14-M (2026-05-20) — 클라 hwpx 조직도 도식 (image2) 기반.
   대표이사 → 총괄사장 → (사장 → 주택관리부 사장 → 4부서) + (부동산임대관리 → 2부서).
   별도 지사: 서울 경인 지사·전남지사 (각 지사장). */
export type OrgNode = {
  name: string;
  /** 직급·역할 (예: "대표이사", "지사장") */
  role?: string;
  children?: OrgNode[];
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. 회사 정보 — PDF p4 회사개요 기준
// ─────────────────────────────────────────────────────────────────────────────

export const company = {
  brandName: "KB GROUP",
  name: "(주)케이비개발",
  legalName: "주식회사 케이비개발",
  domain: "kb-dvp.com",
  ceo: "김 현",
  /** PDF p5·p8: 2013.09 법인 설립 */
  founded: "2013-09",
  foundedYear: 2013,
  /** PDF p4: 자본금 12억 1천만원 */
  capital: "12억 1천만원",
  businessNumber: "410-87-05616",
  /** PDF p6: "꿈은 현실로, 현실은 노력으로" */
  motto: "꿈은 현실로, 현실은 노력으로",
  goals: [
    { en: "PLAN", kr: "철저한 기획" },
    { en: "DECISION", kr: "정확한 판단" },
    { en: "MANAGEMENT", kr: "정직한 관리" },
  ],
  tagline: "신뢰받는 종합 시설관리 파트너",
  intro:
    "(주)케이비개발은 주택관리, 경비, 상주청소, 저수조청소, 방역소독, 수목관리 등을 아우르는 종합 시설관리 기업입니다. 경륜 있는 주택관리사와 공동주택 건설 현장소장 출신, 공직·대기업 출신 임직원이 한 팀이 되어 공정하고 투명한 단지 운영을 약속드립니다.",
  /** PDF p4 주요사업 */
  businessFields: [
    "주택관리업",
    "경비/청소용역",
    "소독 및 방역",
    "저수조청소업",
    "주택임대사업",
    "주택임대관리업",
    "시설관리업",
  ],
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 2. 연락처 — PDF p1, p48 기준
// ─────────────────────────────────────────────────────────────────────────────

export type Contact = {
  phone: string;
  fax: string;
  email: string;
  careersEmail?: string;
  address: string;
  /** Phase 14-L — 본사 빌딩 별칭 (지도 검색 정확도 보완용) */
  buildingAlias?: string;
  /** Phase 14-L — 사용자 hwpx 요청 반영 */
  businessHours?: string;
  privacyOfficer: { name: string; phone: string };
  parking: string;
  nearestStops: string[];
  busRoutes: string[];
};

export const contact: Contact = {
  phone: "062-416-3021",
  fax: "062-974-3070",
  /** PDF p48 — 회사 공식 메일 */
  email: "7970kb@naver.com",
  /* Phase 14-K K-1 — 번지수 "223-22"의 hyphen을 non-breaking hyphen(U+2011)으로 교체.
     좁은 컨테이너에서 "223-"와 "22"가 분리 줄바꿈되던 문제 해소. 시각·검색은 동일. */
  address: "광주광역시 광산구 월계로 223‑22, 2층 201·202호",
  buildingAlias: "윤진리안채 빌딩",
  businessHours: "평일 09:00~18:00",
  privacyOfficer: { name: "고예근", phone: "062-416-3037" },
  parking: "지하 1층 주차장 (방문객 무료)",
  nearestStops: ["첨단롯데마트", "우편집중국"],
  busRoutes: ["금호46", "첨단30", "첨단22", "첨단23", "송정33", "임곡91"],
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. 대표 메시지 — PDF p3 인사말 기준
// ─────────────────────────────────────────────────────────────────────────────

export const ceoMessage = {
  authorName: "김 현",
  authorTitle: "(주)케이비개발 대표이사",
  paragraphs: [
    "안녕하십니까? (주)케이비개발입니다.",
    "당사는 주택관리, 경비, 상주청소, 저수조청소, 방역소독, 수목관리 등의 사업을 하는 종합주택관리회사입니다.",
    "현재 급변하는 주거문화와 다양한 건축물 및 주택관리를 위하여 저희 회사는 경륜 있는 주택관리사와 공동주택 현장소장 출신 및 다양한 식견과 관리지도에 탁월한 공직자, 대기업 출신 등의 임직원으로 구성되어 성실하게 신뢰를 쌓으며 급성장해 나가고 있는 기업입니다.",
    "또한 당사는 주택관리업체 중 유일하게 주택임대관리업 및 주택사업장을 관리하여 회사 재정 확충 및 위탁단지 입주민에게도 재산 증식의 기회 또한 제공해 드리고 있습니다.",
    "저희는 크고 작은 사업장 구분 없이 단지마다 소중하고 한결같은 마음으로 입주자대표회의와 입주민의 뜻을 받들어 공정하고 투명한 관리가 되도록 최선을 다하고 있습니다.",
    "당사의 발전된 주택관리 운영 노하우와 경험 많고 책임감 높은 직원들을 배치하여 단지 관리에 만전을 기함은 물론 본사의 적극적인 지원으로 명품 아파트가 되도록 최선을 다하겠습니다.",
    "저희 (주)케이비개발과 함께 하여 주시기를 간절히 소망드립니다. 감사합니다.",
  ],
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 4. 카운터 — PDF p22 회사강점 + 관리실적 합산 기준
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Phase 14 P0-05 / Phase 14-L (2026-05-18) — 단일 출처 통계.
 * 사용자 제공 "홈페이지 단지 수정 요청.xlsx" 반영으로 운영 단지 73 → 106 확장.
 *   complexes 106 = 실제 운영 중 단지 수 (배열 length와 자동 동기화).
 *   licenses 11 = /licenses 페이지 보유 인허가 grid 카운트와 일치.
 *   workforce 1,575 = /licenses WorkforceStats 정본.
 *   households 32,000+ = 사용자 확정 마케팅 표기 (전체 누적 운영 세대 기준).
 * 주의: counters는 complexes 선언보다 위에 있어 length 직접 참조 불가 →
 *       하단 invariant assert로 literal 동기화 보장.
 */
export const counters: Counter[] = [
  {
    key: "households",
    label: "관리 세대수",
    caption: "MANAGED HOUSEHOLDS",
    /** Phase 14-M (2026-05-20) — 154개 단지 세대수 정밀 합산 (47,978 hwpx + 의왕초평 981) */
    value: 48959,
    suffix: "+",
    context: "약 14만 6천 명의 일상을 책임지는 규모",
  },
  {
    key: "complexes",
    label: "운영 단지",
    caption: "ACTIVE COMPLEXES",
    /** complexes.length 미러 — 배열 수정 시 STATS.activeComplexes가 자동 동기화 (Phase 14-M: 154) */
    value: 154,
    suffix: "",
    context: "광주·전남·경기·충청 등 전국 단위 운영",
  },
  {
    key: "licenses",
    label: "보유 인허가",
    caption: "REGISTERED LICENSES",
    /** /licenses 페이지 보유 인허가 grid 정본 */
    value: 11,
    suffix: "",
    context: "주택관리·경비·청소·방역·전기 전 영역 자격 확보",
  },
  {
    key: "workforce",
    label: "자격증 보유 인력",
    caption: "CERTIFIED PROFESSIONALS",
    /** /licenses WorkforceStats 정본 */
    value: 1575,
    suffix: "+",
    context: "단지당 평균 20명 이상의 전문 인력 투입 가능",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 5. 사업영역 — 5개 대분류 (기존 구조 유지, 톤 보완)
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
    subBusinesses: ["건물위생관리용역업", "방역및소독", "저수조청소업", "수목치료"],
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
    subBusinesses: ["시설경비업", "근로자파견업"],
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
      "아파트·오피스텔·도시형 생활주택 시행 사업과, 관계사 ㈜기담종합건설을 통한 유지보수·도장·방수·미장 시공을 제공합니다.",
    highlights: [
      "주거·교통·학군 우수 입지 중심 시행 사업",
      "시설물 유지관리 다년 노하우 (놀이터·놀이시설 등)",
      "도장공사업: 재도장·신축 도장 풍부한 실적",
      "미장·타일·방수·조적 등 습식공사 통합 시공",
    ],
    subBusinesses: ["시행업", "종합건설(㈜기담종합건설)"],
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
      "관계사 ㈜케이비뷰·㈜케이위더스·㈜기담종합건설과 시너지 운영",
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
// 6. 핵심 가치 / 차별점 / 프로세스
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
  { number: "01", englishName: "Trust", koreanName: "신뢰", tagline: "약속한 것을 지킨다" },
  { number: "02", englishName: "Expertise", koreanName: "전문성", tagline: "검증된 기술과 경험" },
  { number: "03", englishName: "Responsibility", koreanName: "책임", tagline: "공간을 끝까지 책임진다" },
];

export const differentiators: Differentiator[] = [
  { number: "01", englishName: "INTEGRATED SERVICES", koreanName: "종합 서비스 운영",
    description: "시설·위생·경비·시행을 한 회사에서 책임집니다." },
  { number: "02", englishName: "VERIFIED EXPERTISE", koreanName: "검증된 전문 인력",
    description: "자격증 보유 전문 인력만 현장에 투입합니다." },
  { number: "03", englishName: "TRANSPARENT RECORDS", koreanName: "투명한 기록 관리",
    description: "모든 작업 내역을 체계적으로 기록하고 공유합니다." },
  { number: "04", englishName: "RAPID RESPONSE", koreanName: "신속한 응급 대응",
    description: "비상 상황에 즉시 응급조치를 시행합니다." },
  { number: "05", englishName: "LASTING RELATIONSHIPS", koreanName: "지속적 신뢰 관계",
    description: "한 번의 계약을 넘어 오래 함께합니다." },
];

/* Phase 14-K K-4 — description 한 줄 → 2~3 문장으로 확장.
   사용자 인식: 한 줄 카피는 "성의 부족" 인상 → 실제 운영 흐름·산출물·기간 명시 */
export const processSteps: ProcessStep[] = [
  {
    key: "consultation",
    numberLabel: "01",
    name: "상담 · 견적",
    englishName: "CONSULTATION",
    description:
      "단지·시설 현황과 요구 범위를 직접 방문 진단하여 맞춤형 제안서를 작성합니다. " +
      "초기 상담은 무료이며 영업일 기준 평균 4시간 안에 회신, 1주 이내 견적서 전달을 원칙으로 합니다.",
  },
  {
    key: "contract",
    numberLabel: "02",
    name: "계약 · 준비",
    englishName: "CONTRACT",
    description:
      "단지 운영 표준·인력 배치·점검 사이클·비용 구조를 협의하여 표준 계약서를 체결합니다. " +
      "계약 직후 관리소장·시설반장·경비·청소 인력 매칭과 운영 시스템(점검 체크리스트·보고 라인) 구축을 동시 진행합니다.",
  },
  {
    key: "operation",
    numberLabel: "03",
    name: "운영 · 관리",
    englishName: "OPERATION",
    description:
      "일상 관리·정기 점검·법정 의무 점검을 통합 운영합니다. " +
      "본사 통합 관제로 야간·휴일 대응을 보장하고, 월간 운영 리포트를 입주자대표회의·발주처에 정기 공유합니다.",
  },
  {
    key: "after-care",
    numberLabel: "04",
    name: "사후 관리",
    englishName: "AFTER-CARE",
    description:
      "운영 데이터를 분기·연간 단위로 분석하여 개선 과제를 도출하고 다음 계약 갱신 시점까지 반영합니다. " +
      "민원·하자·안전 이슈는 24시간 핫라인으로 별도 트래킹하며 만족도 조사 결과는 운영 KPI에 직접 반영합니다.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 7. 회사 강점 — PDF p22
// ─────────────────────────────────────────────────────────────────────────────

export const companyStrengths: CompanyStrength[] = [
  { number: "01", title: "튼튼한 자본력",
    description: "광주 동종업계 중 가장 높은 자본력을 보유한 안정 경영." },
  { number: "02", title: "다양한 재정 창출능력",
    description: "아파트·오피스텔 1,000여 세대를 직접 임대관리 및 임대사업으로 운영하여 임대 수익 + 수수료 동시 창출." },
  { number: "03", title: "우수 기술 인력",
    description: "본사 자체 보유 자격증 인력 1,575명 풀을 현장에 적극 투입." },
  { number: "04", title: "대형아파트 위탁관리 전환",
    description: "광주 현장 위탁관리를 케이비개발로 전환하여 현재까지 우수하게 운영 중." },
  { number: "05", title: "빠른 성장력",
    description: "공동주택관리업을 시작한 이래 106개 단지를 직접 운영하며 빠르게 성장." },
];

// ─────────────────────────────────────────────────────────────────────────────
// 8. 관리 단지 — 2026-05-18 사용자 제공 "홈페이지 단지 수정 요청.xlsx" 전면 반영
//    공동주택 + 집합건물(오피스텔·상가) 총 106단지 (이전 73 → 106 확장)
// ─────────────────────────────────────────────────────────────────────────────

export const complexes: Complex[] = [
  { name: "계림아이파크 SK뷰", region: "광주광역시 동구", households: 1715, area: 175004, kind: "apartment", aliases: ["계림 아이파크 sk뷰"], isFeatured: true },
  { name: "계림아이파크 SK뷰(근린생활)", region: "광주광역시 동구", households: 76, area: 5193, kind: "apartment" },
  { name: "그랜드 센트럴 상가", region: "광주광역시 동구", households: 177, area: 14104, kind: "mixed-use" },
  { name: "금남로 센텀시티", region: "광주광역시 동구", households: 224, area: 18792, kind: "mixed-use" },
  { name: "금남유탑", region: "광주광역시 동구", kind: "apartment" },
  { name: "동명동 센트럴파크오피스텔", region: "광주광역시 동구", households: 253, area: 21899.73, kind: "mixed-use" },
  { name: "무등산 명지로드힐", region: "광주광역시 동구", households: 270, area: 35131.82, kind: "apartment" },
  { name: "용산호반맨션", region: "광주광역시 동구", households: 190, area: 15702, kind: "apartment" },
  { name: "학1마을아파트", region: "광주광역시 동구", households: 297, area: 31472.5, kind: "apartment" },
  { name: "광천 프라임 아너팰리스아파트", region: "광주광역시 서구", households: 186, area: 21956.98, kind: "apartment" },
  { name: "농성 삼익아파트", region: "광주광역시 서구", households: 374, kind: "apartment" },
  { name: "대광로제비앙 본사", region: "광주광역시 서구", kind: "mixed-use" },
  { name: "동천호반베르디움", region: "광주광역시 서구", households: 803, area: 140807, kind: "apartment" },
  { name: "마륵시티", region: "광주광역시 서구", kind: "apartment" },
  { name: "쌍촌프라임아너팰리스", region: "광주광역시 서구", households: 52, area: 6136.1531, kind: "apartment" },
  { name: "화정유탑", region: "광주광역시 서구", households: 286, kind: "apartment" },
  { name: "화정한국아델리움 1단지", region: "광주광역시 서구", households: 28, area: 6341.855, kind: "apartment" },
  { name: "화정한국아델리움 2단지", region: "광주광역시 서구", households: 28, area: 6367.079, kind: "apartment" },
  { name: "휴먼빌딩", region: "광주광역시 서구", households: 107, area: 10817.38, kind: "mixed-use" },
  { name: "골드레이크(송화)", region: "광주광역시 남구", households: 530, kind: "apartment" },
  { name: "방림동 오네뜨하이브", region: "광주광역시 남구", households: 225, area: 21025.1177, kind: "apartment" },
  { name: "백운동 프라임로하스", region: "광주광역시 남구", households: 17, kind: "apartment" },
  { name: "봉선 유탑 메트로시티", region: "광주광역시 남구", households: 88, area: 14652, kind: "apartment" },
  { name: "봉선동 아델리움57 더힐", region: "광주광역시 남구", households: 29, area: 5836.8466, kind: "apartment" },
  { name: "봉선라인2,3차", region: "광주광역시 남구", households: 358, area: 35398, kind: "apartment" },
  { name: "봉선무등파크3차2단지", region: "광주광역시 남구", households: 309, area: 33291.38, kind: "apartment" },
  { name: "스타타워(케이오아시스)", region: "광주광역시 남구", kind: "mixed-use" },
  { name: "양림1휴먼시아", region: "광주광역시 남구", households: 987, area: 127525.6642, kind: "apartment", aliases: ["양림1휴먼시아"], isFeatured: true },
  { name: "효천 천년나무 2단지", region: "광주광역시 남구", households: 324, area: 16792, kind: "apartment", type: "LH" },
  { name: "각화 휴먼파크 서희스타힐스", region: "광주광역시 북구", households: 946, area: 107277, kind: "apartment", aliases: ["각화 휴먼파크 서희스타힐스"], isFeatured: true },
  { name: "더샵 광주포레스트 오피스텔", region: "광주광역시 북구", households: 84, area: 0, kind: "mixed-use", aliases: ["더샵광주포레스트"], isFeatured: true },
  { name: "무등산 자이앤어울림 상가", region: "광주광역시 북구", households: 15, area: 1994, kind: "mixed-use" },
  { name: "문흥우성아파트", region: "광주광역시 북구", households: 564, kind: "apartment" },
  { name: "신안동 프라임로하스", region: "광주광역시 북구", households: 20, area: 29679, kind: "apartment" },
  { name: "양산 명지써밋 주상복합", region: "광주광역시 북구", households: 273, area: 52476, kind: "mixed-use", aliases: ["양산명지써밋"], isFeatured: true },
  { name: "오치 대광아파트", region: "광주광역시 북구", households: 111, area: 5826, kind: "apartment" },
  { name: "오치 우성아파트", region: "광주광역시 북구", households: 402, area: 43721, kind: "apartment" },
  { name: "용봉 금호아파트", region: "광주광역시 북구", households: 221, area: 34185, kind: "apartment" },
  { name: "용봉 삼성아파트", region: "광주광역시 북구", households: 544, area: 65734, kind: "apartment" },
  { name: "용봉 한국아델리움2차아파트", region: "광주광역시 북구", households: 61, area: 5546.45, kind: "apartment" },
  { name: "용봉엘리체", region: "광주광역시 북구", households: 430, area: 43735.327, kind: "apartment" },
  { name: "운암 블루시안1차", region: "광주광역시 북구", households: 103, area: 12186, kind: "apartment" },
  { name: "운암 센텀플로라에듀", region: "광주광역시 북구", households: 60, area: 7539, kind: "apartment" },
  { name: "임동평화맨션", region: "광주광역시 북구", households: 196, area: 20051, kind: "apartment" },
  { name: "점핑몬스터", region: "광주광역시 북구", kind: "apartment" },
  { name: "중흥 프라임베르가 아파트", region: "광주광역시 북구", households: 114, area: 13310.93, kind: "apartment" },
  { name: "무진 테라스", region: "광주광역시 광산구", households: 24, area: 6493, kind: "apartment" },
  { name: "미르채 프라자 상가", region: "광주광역시 광산구", households: 31, area: 3738, kind: "mixed-use" },
  { name: "벨루미체 첨단", region: "광주광역시 광산구", households: 103, area: 11047.405, kind: "apartment" },
  { name: "선운 메디컬스퀘어", region: "광주광역시 광산구", households: 37, area: 4781, kind: "mixed-use" },
  { name: "송정역 숲안애1차아파트", region: "광주광역시 광산구", households: 82, area: 10146.51, kind: "apartment" },
  { name: "수완 대라수 상가", region: "광주광역시 광산구", households: 33, area: 1932, kind: "mixed-use" },
  { name: "어등산 대광로제비앙", region: "광주광역시 광산구", households: 213, area: 21958, kind: "apartment" },
  { name: "우산동 am-city 스카이하이", region: "광주광역시 광산구", households: 154, area: 6025.0571, kind: "mixed-use" },
  { name: "우산동 am-city 하이클래스", region: "광주광역시 광산구", households: 150, area: 6067.2496, kind: "mixed-use" },
  { name: "우산동 더스위트2차 센트럴빌", region: "광주광역시 광산구", households: 26, area: 2569, kind: "apartment" },
  { name: "창우빌딩", region: "광주광역시 광산구", area: 4521.77, kind: "mixed-use" },
  { name: "첨단 AM-STAY 센트럴파크 오피스텔", region: "광주광역시 광산구", households: 98, area: 4039, kind: "mixed-use" },
  { name: "첨단 대라수1차", region: "광주광역시 광산구", households: 315, area: 41800.73, kind: "apartment" },
  { name: "첨단 도휘에드가2차", region: "광주광역시 광산구", households: 288, area: 13086.9, kind: "apartment" },
  { name: "첨단 무들에코클래스", region: "광주광역시 광산구", households: 355, area: 14262.59, kind: "apartment" },
  { name: "첨단 미르채리버파크오피스텔", region: "광주광역시 광산구", households: 508, area: 29004.85, kind: "mixed-use", aliases: ["첨단미르채리버파크"], isFeatured: true },
  { name: "첨단 부영1차아파트", region: "광주광역시 광산구", households: 1198, area: 101801, kind: "apartment", aliases: ["첨단1차부영"], isFeatured: true },
  { name: "첨단 야스텍타워", region: "광주광역시 광산구", households: 54, area: 8986, kind: "mixed-use" },
  { name: "첨단 윤진리안채리버뷰", region: "광주광역시 광산구", households: 182, area: 10099.09, kind: "apartment" },
  { name: "첨단 윤진리안채상가(본사)", region: "광주광역시 광산구", households: 14, area: 3228.42, kind: "mixed-use" },
  { name: "첨단 일신프레뷰아파트", region: "광주광역시 광산구", households: 113, area: 14824.3, kind: "apartment" },
  { name: "첨단 중해마루힐", region: "광주광역시 광산구", households: 350, area: 10305, kind: "apartment" },
  { name: "첨단 한양에드가3차 301동", region: "광주광역시 광산구", households: 71, area: 3030.17, kind: "apartment" },
  { name: "첨단 한양에드가3차 302동", region: "광주광역시 광산구", households: 195, area: 7438.37, kind: "apartment" },
  { name: "첨단 한양에드가3차 303동", region: "광주광역시 광산구", households: 195, area: 7438.37, kind: "apartment" },
  { name: "첨단 힐스테이트 리버파크 상가", region: "광주광역시 광산구", households: 36, area: 2790.87, kind: "mixed-use" },
  { name: "첨단프라자", region: "광주광역시 광산구", kind: "apartment", aliases: ["첨단프라자"], isFeatured: true },
  { name: "도산 서경아파트", region: "광주광역시 광산구", households: 306, area: 24041.67, kind: "apartment" },
  { name: "도산 우미아파트", region: "광주광역시 광산구", households: 348, area: 27610, kind: "apartment" },
  { name: "도천1단지 중흥파크맨션", region: "광주광역시 광산구", households: 408, area: 34413.65, kind: "apartment" },
  { name: "소촌2차 국제미소래 아파트", region: "광주광역시 광산구", households: 382, area: 59786, kind: "apartment" },
  { name: "수완 현진에버빌 1단지아파트", region: "광주광역시 광산구", households: 672, area: 147884.61, kind: "apartment" },
  { name: "수완2차 중흥S-클래스아파트", region: "광주광역시 광산구", households: 241, area: 28915, kind: "apartment" },
  { name: "수완대라수 어썸테라스", region: "광주광역시 광산구", households: 140, area: 29738, kind: "apartment" },
  { name: "수완대성베르힐", region: "광주광역시 광산구", households: 410, area: 45013, kind: "apartment" },
  { name: "신창 부영6차아파트", region: "광주광역시 광산구", households: 494, area: 57057, kind: "apartment" },
  { name: "운남 삼성아파트", region: "광주광역시 광산구", households: 1956, area: 179899, kind: "apartment", aliases: ["운남 삼성"], isFeatured: true },
  { name: "첨단 부영 3차", region: "광주광역시 광산구", households: 492, area: 50420, kind: "apartment" },
  { name: "여수 골드 더테라스 하우스", region: "전라남도 여수시", households: 44, area: 4983.25, kind: "apartment" },
  { name: "여수 구송 파르테논 더 테라스", region: "전라남도 여수시", households: 45, area: 5355, kind: "apartment" },
  { name: "오션블루", region: "전라남도 여수시", households: 123, area: 7925, kind: "apartment" },
  { name: "지오스테이션", region: "전라남도 화순군", households: 302, area: 32695.7283, kind: "apartment" },
  { name: "고랑동 광신프로그레스 아파트", region: "전라북도 전주시", households: 381, kind: "apartment" },
  { name: "순천 가곡 대광로제비앙", region: "전라남도 순천시", households: 727, area: 109150, kind: "apartment" },
  { name: "순천대광로제비앙 지에이그린웰", region: "전라남도 순천시", households: 436, area: 49116.3285, kind: "apartment" },
  { name: "내포 에드가2차 오피스텔", region: "충청남도 예산군", households: 300, area: 21875.62, kind: "mixed-use" },
  { name: "영동 수푸름", region: "충청북도 영동군", households: 70, kind: "apartment" },
  { name: "오송역 대광로제비앙", region: "충청북도 청주시", households: 1615, area: 178211.1935, kind: "apartment", aliases: ["오송역대광로제비앙"], isFeatured: true },
  { name: "고흥 남계 승원팰리체 하이엔드", region: "전라남도 고흥군", households: 183, area: 30231, kind: "apartment" },
  { name: "고흥 녹동 승원팰리체", region: "전라남도 고흥군", households: 192, area: 20934, kind: "apartment" },
  { name: "고흥 승원팰리체 더퍼스트아파트", region: "전라남도 고흥군", households: 220, area: 32372.85, kind: "apartment" },
  { name: "장흥 토광미르채아파트", region: "전라남도 장흥군", households: 210, area: 23079.54, kind: "apartment" },
  { name: "곡성 수푸름", region: "전라남도 곡성군", households: 48, area: 4839.26, kind: "apartment" },
  { name: "LH시흥 장현 트리플센텀 (A-8블록)", region: "경기도 시흥시", households: 546, area: 71291, kind: "apartment", type: "LH" },
  { name: "LH지행역 더 퍼스트아파트 (LH 동두천송내 행복주택아파트)", region: "경기도 동두천시", households: 420, area: 2513.31, kind: "apartment", type: "LH" },
  { name: "경기 용인 한보라마을 휴먼시아4단지", region: "경기도 용인시", households: 581, area: 48409.24, kind: "apartment", type: "LH" },
  { name: "경기광주 월드메르디앙 라 테라스 2단지", region: "경기도 광주시", households: 38, area: 7512, kind: "apartment" },
  { name: "성남 신흥", region: "경기도 성남시", households: 1856, area: 259494, kind: "apartment", aliases: ["성남 산성역자이푸르지오"], isFeatured: true },
  { name: "수원 오목천 상송마을", region: "경기도 수원시", households: 1185, area: 83381, kind: "apartment", type: "LH" },
  { name: "양주 회천 A21BL", region: "경기도 양주시", households: 995, area: 151434, kind: "apartment", aliases: ["양주회천베네스트"], isFeatured: true },
  { name: "파주운정3 A37BL", region: "경기도 파주시", households: 1810, area: 128143, kind: "apartment", type: "LH", aliases: ["파주운정 물향기마을1단지"] },
  { name: "평택고덕모아엘가", region: "경기도 평택시", households: 1255, area: 144027.1302, kind: "apartment" },
  { name: "안동 어반 마제네스", region: "경상북도 안동시", households: 89, area: 9425, kind: "apartment" },
  { name: "포항 일월 LH1단지", region: "경상북도 포항시", households: 460, area: 24179.56, kind: "apartment", type: "LH" },
  { name: "순창 미르채아파트", region: "전라북도 순창군", households: 75, area: 9944.09, kind: "apartment" },
  { name: "제이아트 은파 더레이크", region: "전라북도 군산시", households: 219, area: 24393.967, kind: "apartment" },
  { name: "영광 뉴스카이", region: "전라남도 영광군", households: 69, area: 3357, kind: "apartment" },
  { name: "영광 성화누리안", region: "전라남도 영광군", households: 198, area: 27590, kind: "apartment" },
  { name: "영광 수푸름아파트", region: "전라남도 영광군", households: 48, area: 5712.4, kind: "apartment" },
  { name: "힐스테이트 영광", region: "전라남도 영광군", households: 493, area: 57509.0923, kind: "apartment" },
  { name: "제주 블루빌딩(본사)", region: "제주특별자치도 서귀포시", households: 14, area: 2210.8, kind: "mixed-use" },
  { name: "제주 세종안채 오피스텔", region: "제주특별자치도 서귀포시", households: 100, area: 5553.12, kind: "mixed-use" },
  { name: "장성 수산 LH1단지", region: "전라남도 장성군", households: 150, area: 8086.0726, kind: "apartment", type: "LH" },
  { name: "STX KAN 중우 하나린", region: "전라남도 나주시", households: 700, area: 66872.9572, kind: "apartment", aliases: ["STX KAN 중우하나린"], isFeatured: true },
  { name: "나주 이노파크 식스틴 지식산업센터", region: "전라남도 나주시", households: 400, area: 31000, kind: "mixed-use", aliases: ["나주 이노파크식스틴"], isFeatured: true },
  { name: "해남 센트럴팰리체", region: "전라남도 해남군", households: 99, area: 17908, kind: "apartment" },
  { name: "목동 메디컬스퀘어", region: "서울특별시 강서구", households: 54, area: 6722.8, kind: "mixed-use" },
  { name: "화랑대 디오베이션", region: "서울특별시 노원구", households: 62, area: 5997.9058, kind: "apartment" },
  { name: "쌍용 더 플래티넘 완도", region: "전라남도 완도군", households: 223, area: 28779, kind: "apartment" },
  { name: "완도 무등파크맨션", region: "전라남도 완도군", households: 240, area: 22807, kind: "apartment" },
  { name: "완도 우성팰리스힐 아파트", region: "전라남도 완도군", households: 159, area: 0, kind: "apartment" },
  { name: "완도 프라임아너스 더 시그니쳐", region: "전라남도 완도군", households: 40, area: 4391, kind: "apartment" },
  { name: "완도 현대아파트", region: "전라남도 완도군", households: 450, area: 34610, kind: "apartment" },
  { name: "완도미르채 센텀시티", region: "전라남도 완도군", households: 108, area: 10998.3969, kind: "mixed-use" },
  { name: "목포 산정 대광로제비앙", region: "전라남도 목포시", households: 416, area: 44176.53, kind: "apartment" },
  { name: "석현동 에드가안채", region: "전라남도 목포시", households: 114, area: 5893.79, kind: "apartment" },
  { name: "용해호반리젠시빌", region: "전라남도 목포시", households: 732, area: 84950, kind: "apartment", aliases: ["목포용해호반리젠시빌"], isFeatured: true },
  { name: "종원나이스빌 아파트", region: "전라남도 목포시", households: 351, area: 61283.223, kind: "apartment" },
  { name: "평화광장 미래엔스위트", region: "전라남도 목포시", households: 193, area: 16265.024, kind: "apartment" },
  { name: "하당 센트럴팰리체1차아파트", region: "전라남도 목포시", households: 134, area: 12476.61, kind: "apartment" },
  { name: "하당 센트럴팰리체2차아파트", region: "전라남도 목포시", households: 85, area: 9671.59, kind: "apartment" },
  { name: "하당 프라임아너팰리스아파트", region: "전라남도 목포시", households: 185, area: 21463.27, kind: "apartment" },
  { name: "남악 에드가2차오피스텔", region: "전라남도 무안군", households: 236, area: 14644.87, kind: "mixed-use" },
  { name: "남악 에드가5차오피스텔", region: "전라남도 무안군", households: 334, area: 22522.03, kind: "mixed-use" },
  { name: "남악 에드가6차오피스텔", region: "전라남도 무안군", households: 408, area: 22258.08, kind: "mixed-use" },
  { name: "남악 에드가7차오피스텔", region: "전라남도 무안군", households: 409, area: 20235.76, kind: "mixed-use" },
  { name: "남악 에드가8차오피스텔", region: "전라남도 무안군", households: 262, area: 17096.7, kind: "mixed-use" },
  { name: "남악 에드가9차", region: "전라남도 무안군", households: 224, area: 17096.7, kind: "apartment" },
  { name: "남악 에드가채움아파트", region: "전라남도 무안군", households: 116, area: 26025.53, kind: "apartment" },
  { name: "남악유탑", region: "전라남도 무안군", households: 895, kind: "apartment" },
  { name: "무안 센텀플로라아파트", region: "전라남도 무안군", households: 154, area: 22423.25, kind: "apartment" },
  { name: "영암 대불 렉시안파크타운", region: "전라남도 영암군", households: 626, area: 56603, kind: "apartment" },
  { name: "담양 양우내안애1단지", region: "전라남도 담양군", households: 322, area: 34525, kind: "apartment" },
  { name: "담양 양우내안애2단지", region: "전라남도 담양군", households: 358, area: 36584, kind: "apartment" },
  { name: "담양 일신 더 프레뷰", region: "전라남도 담양군", households: 41, area: 5118, kind: "apartment" },
  { name: "담양 퍼스트35 타운하우스", region: "전라남도 담양군", households: 35, area: 4284, kind: "apartment" },
  { name: "황금 푸르지오 더센트럴", region: "전라남도 광양시", households: 565, area: 75778, kind: "apartment" },
  { name: "의왕초평 A-3BL 신혼희망타운", region: "경기도 의왕시", households: 981, area: 125868.32, kind: "apartment", type: "LH" },
];

/* Phase 14-M (2026-05-20) — 과거 운영 단지 18건.
   클라 PDF "관리실적리스트 - 현재관리단지제외.pdf" 원문 그대로.
   /cases 페이지 별도 섹션 "PAST PROJECTS"로 표시. 카운트는 현재 운영(154)과 분리. */
export const pastComplexes: PastComplex[] = [
  { name: "에드가리움", region: "광주광역시 광산구", households: 103, area: 8546, period: "2019.3.1 ~ 2025.10.31", kind: "apartment" },
  { name: "수완산이고운더테라스", region: "광주광역시 광산구", households: 76, area: 8968, period: "2018.10.1 ~ 2021.9.30", kind: "apartment" },
  { name: "광주 송정역 모아엘가", region: "광주광역시 광산구", households: 341, area: 22905, period: "2019.6.1 ~ 2025.6.31", kind: "apartment" },
  { name: "리안채", region: "전라북도 고창군", households: 160, area: 18257, period: "2018.8.1 ~ 2021.1.31", kind: "apartment" },
  { name: "동우아스트로", region: "광주광역시 북구", households: 158, area: 16306, period: "2019.12 ~ 2020.12.31", kind: "apartment" },
  { name: "목포 상동 프라임 주상복합아파트", region: "전라남도 목포시", households: 171, area: 21463, period: "2020.6.1 ~ 2026.5.31", kind: "mixed-use" },
  { name: "그랜드센트럴 아파트", region: "광주광역시 동구", households: 2336, area: 364652, period: "2020.9.1 ~ 2021.5.31", kind: "apartment", aliases: ["광주 그랜드 센트럴"], isFeatured: true },
  { name: "어등산 한양수자인 아파트", region: "광주광역시 광산구", households: 592, area: 76999, period: "2021.10.1 ~ 2024.9.30", kind: "apartment" },
  { name: "의정부 LH고산3단지 아파트", region: "경기도 의정부시", households: 1331, area: 155225, period: "2021.05.13 ~ 2021.12.31", kind: "apartment", type: "LH", aliases: ["의정부 LH고산3단지"], isFeatured: true },
  { name: "첨단 부영e그린", region: "광주광역시 광산구", households: 384, area: 44725, period: "2020.1.1 ~ 2025.12.31", kind: "apartment" },
  { name: "봉선라인광장1차아파트", region: "광주광역시 남구", households: 385, area: 33000, period: "2023.1.1 ~ 2025.12.31", kind: "apartment" },
  { name: "여수 양우내안애 아파트", region: "전라남도 여수시", households: 813, area: 113641, period: "2021.9.1 ~ 2024.8.31", kind: "apartment" },
  { name: "더샾광주포레스트 아파트", region: "광주광역시 북구", households: 907, area: 149929, period: "2023.7.31 ~ 2024.8.31", kind: "apartment" },
  { name: "첨단 프라임시티 서희스타힐스", region: "광주광역시 북구", households: 414, area: 42836, period: "2024.7.26 ~ 2025.3.31", kind: "apartment" },
  { name: "홍성 승원팰리체", region: "충청남도 홍성군", households: 341, area: 36917, period: "2023.10.1 ~ 2025.5.31", kind: "apartment" },
  { name: "남원월락유탑유블레스킹덤", region: "전라북도 남원시", households: 359, area: 41873, period: "2024.8.23 ~ 2025.5.31", kind: "apartment" },
  { name: "함안 데시앙 아파트", region: "경상남도 함안군", households: 563, area: 33424, period: "2023.08.01 ~ 2025.07.31", kind: "apartment" },
  { name: "문흥대주2차아파트", region: "광주광역시 북구", households: 959, area: 86137, period: "2023.09.05 ~ 2025.09.04", kind: "apartment", aliases: ["문흥대주2차"], isFeatured: true },
];

// ─────────────────────────────────────────────────────────────────────────────
// 9. 파트너사 (실제 발주처)
// ─────────────────────────────────────────────────────────────────────────────

export const partners: Partner[] = [
  { name: "LH 한국토지주택공사", category: "client",
    note: "주요 발주처 — 다수 위탁관리 단지" },
  { name: "광주광역시청", category: "public" },
  { name: "광주광역시 광산구청", category: "public" },
  { name: "광주지방경찰청", category: "public" },
  { name: "대광건영", category: "construction",
    note: "대광로제비앙 시리즈 시공사" },
  { name: "SK에코플랜트", category: "construction",
    note: "계림 IPARK SK뷰 시공사" },
  { name: "현대산업개발", category: "construction",
    note: "계림 아이파크 SK뷰 시공사" },
  { name: "포스코이앤씨", category: "construction",
    note: "광주 더샵 포레스트 시공사" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 10. 협력업체 — PDF p45 기준 15개사
// ─────────────────────────────────────────────────────────────────────────────

export const collaborators: Collaborator[] = [
  { name: "조흥종합건설㈜", field: "건축", scope: "건축물 관리, 하자 관련" },
  { name: "신진종합건설㈜", field: "토목·건축", scope: "건축물 관리, 하자 관련" },
  { name: "법무법인 이노센스", field: "법률 자문", scope: "법률 자문" },
  { name: "주택관리공단", field: "인력 관리", scope: "인력 관리 등" },
  { name: "광주아파트연합회", field: "인력 관리 및 교육", scope: "인력 관리 및 교육 훈련" },
  { name: "한울회계법인", field: "세무", scope: "세무 교육 및 회계 자문" },
  { name: "첨단 메디케어", field: "건강검진", scope: "직원 건강 관리" },
  { name: "호남직업전문학교", field: "인력 관리 및 교육", scope: "직원 기술 지원 및 기술인력 공급" },
  { name: "정명재 공인노무사", field: "노무 및 법률 자문", scope: "노무 교육 및 법률 자문" },
  { name: "㈜에프원방재", field: "소방", scope: "소방시설 관리, 점검, 수리" },
  { name: "㈜대명엘리베이터", field: "승강기", scope: "승강기 유지관리, 점검, 수리" },
  { name: "㈜에코원", field: "방역, 저수조 청소", scope: "소독, 방역, 저수조 청소" },
  { name: "㈜한신전기 / 신광전기", field: "전기", scope: "전기 대행" },
  { name: "㈜미래정보통신", field: "CCTV", scope: "CCTV 공사" },
  { name: "새천년파지", field: "재활용 수거", scope: "플라스틱·비닐·공병·고철·헌옷 등 수거" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 11. 인허가 9건 — PDF p8 기준 (정확한 등록일)
// ─────────────────────────────────────────────────────────────────────────────

export const licenses: License[] = [
  { name: "(주)케이비개발 법인 설립", issuer: "광주지방법원 등기소", acquiredAt: "2013.09" },
  { name: "주택임대관리업 등록", issuer: "광산구청", acquiredAt: "2016.01",
    image: "/images/licenses/p09_07.jpeg" },
  { name: "주택관리업 등록", issuer: "광산구청", acquiredAt: "2016.04",
    image: "/images/licenses/p09_06.jpeg" },
  { name: "건물위생관리용역업 신고", issuer: "광산구청", acquiredAt: "2016.04",
    image: "/images/licenses/p09_08.jpeg" },
  { name: "시설경비업 허가", issuer: "광주지방경찰청장", acquiredAt: "2016.04",
    image: "/images/licenses/p09_09.jpeg" },
  { name: "소독업 신고", issuer: "광주광역시 광산구", acquiredAt: "2018.04",
    image: "/images/licenses/p09_10.jpeg" },
  { name: "저수조청소업 신고", issuer: "광산구청장", acquiredAt: "2018.09",
    image: "/images/licenses/p09_11.jpeg" },
  { name: "근로자파견업 등록", issuer: "광주지방고용노동청", acquiredAt: "2021.04",
    image: "/images/licenses/p09_14.jpeg" },
  { name: "안전보건경영시스템 ISO 45001 인증", issuer: "한국표준협회", acquiredAt: "2023.12",
    image: "/images/licenses/p09_13.jpeg" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 12. 보유 자격증 27종 — PDF p21 기준 / 총 1,575명 (Phase 14 P0-05 정본)
// ─────────────────────────────────────────────────────────────────────────────

export const totalCertHolders = 1575;

/**
 * Phase 14-B 정본 상수 — 사이트 전역 단일 출처.
 * licenses 배열 실제 항목 9건이나 정본 등록 보유 인허가는 11종(법인 설립·기타 등록 포함).
 * certifications 배열 자동 카운트로 27종 정합.
 * 사이트 어디서든 이 상수를 import 해 표기 일관성 보장.
 */
export const STATS = {
  /** 누적 운영 단지 (LH + 민간) — complexes 배열과 자동 동기화 */
  activeComplexes: complexes.length,
  /** 관리 세대수 */
  managedHouseholds: 48959,
  /** 보유 인허가 종수 (정본) — licenses 배열 9건은 운영 면허 노출용 */
  registeredLicenses: 11,
  /** 기술 인증 종수 */
  certificationTypes: 27,
  /** 자격증 보유 전문 인력 */
  certifiedProfessionals: 1575,
} as const;

/* Phase 14-L invariant — counters의 literal 값과 complexes.length 동기화 보장.
   complexes 배열을 수정한 후 counters[1].value 갱신을 잊으면 즉시 빌드/런타임 경고. */
if (counters[1].value !== complexes.length) {
  console.warn(
    `[site-content] counters.complexes(${counters[1].value}) !== complexes.length(${complexes.length}). counters를 ${complexes.length}로 갱신해 주세요.`,
  );
}

const _FOUNDING_DATE = new Date(2013, 8, 1); // 2013년 9월 1일
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
// 13. 연혁 — PDF p5 + 기존 마일스톤 통합 (시간 정렬)
// ─────────────────────────────────────────────────────────────────────────────

export const history: HistoryEntry[] = [
  { date: "2013.09", event: "(주)케이비개발 법인 설립" },
  { date: "2013.12", event: "임대사업자 등록" },
  { date: "2016.01", event: "주택임대관리업 등록 (광산구청)" },
  { date: "2016.04", event: "주택관리업 등록 (광산구청)" },
  { date: "2016.04", event: "시설경비업 허가 (광주지방경찰청)" },
  { date: "2016.06", event: "위생관리용역업 신고 (광산구청)" },
  { date: "2017.06", event: "본사 사옥 이전" },
  { date: "2017.11", event: "(주)케이비뷰 설립" },
  { date: "2018.04", event: "소독업 신고" },
  { date: "2018.09", event: "저수조청소업 신고" },
  { date: "2019.05", event: "본사 사옥 이전" },
  { date: "2021.04", event: "근로자 파견업 등록" },
  { date: "2023.06", event: "서울 경인지사 개소" },
  { date: "2023.12", event: "안전보건경영시스템 ISO 45001 인증" },
  { date: "2025.02", event: "목포지사 개소" },
  { date: "2026.02", event: "전남지사 이전" },
];

// ─────────────────────────────────────────────────────────────────────────────
// 14. 계열사 — PDF p43~44 기준 (4사)
// ─────────────────────────────────────────────────────────────────────────────

/* Phase 14-M (2026-05-20) — 클라 hwpx 요청 반영.
   기존 4개 → 6개 확장. 받은 로고 4개 적용. 기담은 모회사 라벨 노출. */
/* Phase 14-M (2026-05-20) — 본사 조직도 (클라 hwpx image2 기반).
   level 의미:
     0 = 대표이사 (최상위)
     1 = 총괄사장
     2 = 사장 / 부동산임대관리 (2갈래)
     3 = 주택관리부 사장 (사장 산하)
     4 = 말단 부서 */
export const organization: { tree: OrgNode; branches: OrgNode[] } = {
  tree: {
    name: "대표이사",
    role: "CEO",
    children: [{
      name: "총괄사장",
      role: "Chief Executive",
      children: [
        {
          name: "사장",
          role: "President",
          children: [{
            name: "주택관리부 사장",
            role: "Housing Management",
            children: [
              { name: "주택관리부" },
              { name: "총무부" },
              { name: "용역사업부" },
              { name: "회계관리부" },
            ],
          }],
        },
        {
          name: "부동산임대관리",
          role: "Real-Estate Leasing",
          children: [
            { name: "용역사업부" },
            { name: "고객지원부" },
          ],
        },
      ],
    }],
  },
  branches: [
    { name: "서울 경인 지사", role: "지사장" },
    { name: "전남지사", role: "지사장" },
  ],
};

export const relatedCompanies: RelatedCompany[] = [
  { name: "㈜기담종합건설",
    note: "건설업·시행사·위생관리·시설경비업·금융 및 보험업 (모회사·종합건설)",
    logo: "/images/partners/gidam-logo.png" },
  { name: "㈜케이비뷰",
    note: "2017.11 설립 — 부동산 임대 운영 관계사",
    logo: "/images/partners/kbview-logo.png" },
  { name: "㈜금태건설",
    note: "도장·습식·방수·석공사업 (도장공사·습식·방수공사)",
    logo: "/images/partners/geumtae-logo.png" },
  { name: "㈜더케이금융대부",
    note: "금융 및 보험업 — 기타 여신금융업",
    logo: "/images/partners/thek-finance-logo.png" },
  { name: "㈜케이위더스",
    note: "주택관리·종합 서비스 관계사",
    logo: "/images/partners/k-withus-logo.png" },
  { name: "(유)케이오아시스",
    note: "청소용품 도·소매업 + 경비·청소 서비스",
    logo: "/images/partners/k-oasis-image1.png" },
];
