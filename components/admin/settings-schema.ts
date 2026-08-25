/**
 * 목록형 site_settings 키의 편집 스키마 (PLAN B / DAY 5).
 *
 * 클라이언트 폼(`ListEditor`)과 Server Action(`saveListSetting`)이 **같은 스키마 하나**를 읽는다.
 * 두 곳에 필드를 따로 적으면 화면에는 있는데 저장이 안 되는(또는 그 반대) 조용한 누락이 생긴다.
 * 서버 전용 코드가 들어오면 클라이언트 번들이 깨지므로 이 파일에는 순수 데이터만 둔다.
 *
 * `mutable: false` 인 키는 항목 추가·삭제·순서 변경을 막는다. 값만 고칠 수 있다.
 *  · businessAreas — `id` 가 코드의 카테고리 유니온(BusinessCategory)과 FAQ·비주얼 맵의 키다.
 *    항목을 늘리면 대응하는 코드가 없어 화면이 비고, `slug` 는 /business/[slug] URL 이다 (E-1).
 *  · processSteps — `numberLabel`(01~04)이 배열 순서와 짝을 이룬다. 순서만 바꾸면 번호가 어긋난다.
 *    섹션 순서 변경은 DAY 8 의 주제다.
 */

export type ListFieldKind =
  | "text"
  | "textarea"
  | "number"
  | "lines"
  | "pairs"
  | "select"
  | "checkbox"
  | "readonly"
  | "image";

export type ListField = {
  name: string;
  label: string;
  kind: ListFieldKind;
  hint?: string;
  rows?: number;
  /** 비면 저장을 막는다. */
  required?: boolean;
  /** 비면 키 자체를 넣지 않는다 (빈 문자열을 넣으면 소비처의 `x ? ... : ...` 분기가 뒤집힌다). */
  optional?: boolean;
  options?: readonly { value: string; label: string }[];
  /** kind: "pairs" — 한 줄 `왼쪽|오른쪽` 을 이 두 키를 가진 객체로 만든다. */
  pairKeys?: readonly [string, string];
  /** kind: "image" — Storage 경로 접두사(`{scope}` 부분). 항목 번호가 `{entity-id}` 로 붙는다. */
  uploadPrefix?: string;
  /** kind: "image" — 허용 종류. 기본 image. `both` 는 파일 종류로 버킷을 고른다(히어로 슬라이드). */
  accept?: "image" | "video" | "both";
  /** 2열 그리드에서 한 줄 전체를 차지한다. */
  wide?: boolean;
};

export type ListSchema = {
  key: string;
  title: string;
  desc: string;
  /** 항목 헤더에 쓸 필드명. */
  labelField: string;
  /** 항목 추가·삭제·순서 변경 허용 여부. */
  mutable: boolean;
  /** 추가 버튼 라벨 (mutable 일 때만). */
  addLabel?: string;
  /** 화면에 노출되는 곳 안내. */
  where: string;
  fields: readonly ListField[];
};

const PARTNER_CATEGORIES = [
  { value: "public", label: "공공기관" },
  { value: "client", label: "발주처" },
  { value: "construction", label: "시공사" },
] as const;

export const LIST_SCHEMAS: readonly ListSchema[] = [
  {
    key: "heroSlides",
    title: "메인 히어로 슬라이드",
    desc:
      "메인 첫 화면의 영상·사진 슬라이드입니다. 목록 순서가 곧 재생 순서이고, 우하단 카운터(01/08)는 항목 수에서 자동으로 계산됩니다.",
    where: "/ — Hero",
    labelField: "alt",
    mutable: true,
    addLabel: "슬라이드 추가",
    fields: [
      {
        name: "type",
        label: "종류",
        kind: "select",
        required: true,
        options: [
          { value: "video", label: "영상 (재생이 끝나면 다음 슬라이드)" },
          { value: "image", label: "사진 (6.5초 후 다음 슬라이드)" },
        ],
      },
      { name: "alt", label: "대체 텍스트 (스크린리더·SEO)", kind: "text", required: true },
      {
        name: "src",
        label: "슬라이드 파일",
        kind: "image",
        accept: "both",
        uploadPrefix: "hero",
        required: true,
        wide: true,
        hint: "「종류」와 맞는 파일을 올리세요. 영상은 mp4·webm(50MB), 사진은 jpeg·png·webp·avif(10MB)입니다.",
      },
      {
        name: "poster",
        label: "영상 포스터 (영상일 때만)",
        kind: "image",
        accept: "image",
        uploadPrefix: "hero-poster",
        optional: true,
        wide: true,
        hint: "영상의 첫 프레임이 로딩되기 전에 대신 보여줄 사진입니다. 사진 슬라이드에는 필요 없습니다.",
      },
    ],
  },
  {
    key: "coreValues",
    title: "핵심 가치",
    desc: "회사소개 「세 가지 가치」 카드입니다.",
    where: "/about — WhyValues",
    labelField: "koreanName",
    mutable: true,
    addLabel: "가치 추가",
    fields: [
      { name: "number", label: "번호 (01·02…)", kind: "text", required: true },
      {
        name: "englishName",
        label: "영문명",
        kind: "text",
        required: true,
        hint: "Trust · Expertise · Responsibility 세 값에만 전용 아이콘이 있습니다. 다른 값을 넣으면 아이콘 없이 렌더됩니다.",
      },
      { name: "koreanName", label: "국문명", kind: "text", required: true },
      { name: "tagline", label: "한 줄 설명", kind: "text", required: true, wide: true },
    ],
  },
  {
    key: "differentiators",
    title: "차별점",
    desc: "회사소개 「우리가 다른 이유」 목록입니다.",
    where: "/about — WhyDifferentiators",
    labelField: "koreanName",
    mutable: true,
    addLabel: "차별점 추가",
    fields: [
      { name: "number", label: "번호", kind: "text", required: true },
      { name: "englishName", label: "영문명", kind: "text", required: true },
      { name: "koreanName", label: "국문명", kind: "text", required: true },
      { name: "description", label: "설명", kind: "textarea", rows: 2, required: true, wide: true },
    ],
  },
  {
    key: "companyStrengths",
    title: "회사 강점",
    desc: "PDF p22 기반 강점 목록입니다.",
    where: "현재 어느 페이지에도 노출되지 않습니다 (2026-05 /about 에서 제외).",
    labelField: "title",
    mutable: true,
    addLabel: "강점 추가",
    fields: [
      { name: "number", label: "번호", kind: "text", required: true },
      { name: "title", label: "제목", kind: "text", required: true },
      { name: "description", label: "설명", kind: "textarea", rows: 2, required: true, wide: true },
    ],
  },
  {
    key: "history",
    title: "연혁",
    desc: "설립 이후 주요 이력입니다. 표시 순서는 아래 목록 순서와 같습니다.",
    where: "/about/history — HistoryTimeline",
    labelField: "date",
    mutable: true,
    addLabel: "연혁 추가",
    fields: [
      { name: "date", label: "시점 (예: 2026.02)", kind: "text", required: true },
      { name: "event", label: "내용", kind: "text", required: true },
    ],
  },
  {
    key: "partners",
    title: "발주처 · 시공사",
    desc: "메인 페이지 파트너 스트립과 신뢰 시그널에 노출됩니다.",
    where: "/ — Partners · TrustSignals",
    labelField: "name",
    mutable: true,
    addLabel: "파트너 추가",
    fields: [
      { name: "name", label: "기관·회사명", kind: "text", required: true },
      { name: "category", label: "분류", kind: "select", options: PARTNER_CATEGORIES, required: true },
      { name: "note", label: "비고 (선택)", kind: "text", optional: true, wide: true },
    ],
  },
  {
    key: "collaborators",
    title: "협력업체",
    desc: "분야별 협력업체 표입니다.",
    where: "/about — CollaboratorsTable",
    labelField: "name",
    mutable: true,
    addLabel: "협력업체 추가",
    fields: [
      { name: "name", label: "업체명", kind: "text", required: true },
      { name: "field", label: "분야", kind: "text", required: true },
      { name: "scope", label: "협력 범위", kind: "text", required: true, wide: true },
    ],
  },
  {
    key: "relatedCompanies",
    title: "계열사",
    desc: "로고를 올리면 Storage 공개 URL 로 교체됩니다. 비워두면 기존 이미지를 유지합니다.",
    where: "/about — RelatedCompaniesGrid",
    labelField: "name",
    mutable: true,
    addLabel: "계열사 추가",
    fields: [
      { name: "name", label: "회사명", kind: "text", required: true },
      { name: "note", label: "설명", kind: "text", required: true },
      {
        name: "logo",
        label: "로고",
        kind: "image",
        optional: true,
        uploadPrefix: "related-companies",
        wide: true,
      },
    ],
  },
  {
    key: "licenses",
    title: "보유 인허가",
    desc: "인허가 페이지의 면허 카드입니다. 증명서 사진을 올리면 카드에서 바로 볼 수 있습니다.",
    where: "/licenses — LicensesGrid · LicensesKPI(발급 기관 수)",
    labelField: "name",
    mutable: true,
    addLabel: "인허가 추가",
    fields: [
      { name: "name", label: "면허·등록명", kind: "text", required: true },
      { name: "issuer", label: "발급 기관", kind: "text", required: true },
      { name: "acquiredAt", label: "취득 시점 (예: 2016.04)", kind: "text", optional: true },
      {
        name: "image",
        label: "증명서 사진",
        kind: "image",
        optional: true,
        uploadPrefix: "licenses",
        wide: true,
      },
    ],
  },
  {
    key: "certifications",
    title: "기술 자격증",
    desc: "종수와 인원 합계가 마케팅 표기값 대조표(맨 위)의 실제값으로 곧바로 반영됩니다.",
    where: "/licenses — CertificationsGrid · LicensesOverview(도넛)",
    labelField: "name",
    mutable: true,
    addLabel: "자격증 추가",
    fields: [
      { name: "name", label: "자격증명", kind: "text", required: true },
      { name: "count", label: "보유 인원", kind: "number", required: true },
      { name: "issuer", label: "발급 기관", kind: "text", required: true, wide: true },
    ],
  },
  {
    key: "businessGallery",
    title: "사업영역 현장 사진",
    desc:
      "5개 사업영역 상세 페이지가 공유하는 현장 사진입니다. 대체 텍스트는 사업영역명에서 자동으로 만들어집니다.",
    where: "/business/[slug] — BusinessSubServices 갤러리",
    labelField: "src",
    mutable: true,
    addLabel: "사진 추가",
    fields: [
      {
        name: "src",
        label: "사진",
        kind: "image",
        uploadPrefix: "business-gallery",
        required: true,
        wide: true,
      },
    ],
  },
  {
    key: "businessAreas",
    title: "사업영역",
    desc: "5개 사업영역의 카피입니다. 항목 추가·삭제·순서 변경은 지원하지 않습니다.",
    where: "/business · /business/[slug] · 헤더 BUSINESS 드롭다운 · 메인 ServiceCategories",
    labelField: "name",
    mutable: false,
    fields: [
      { name: "id", label: "코드", kind: "readonly", hint: "코드에서 참조하는 고정 식별자입니다." },
      { name: "slug", label: "URL", kind: "readonly", hint: "/business/{slug} — 바꾸면 기존 링크가 끊깁니다 (E-1)." },
      { name: "name", label: "이름", kind: "text", required: true },
      { name: "englishName", label: "영문명", kind: "text", required: true },
      { name: "tagline", label: "한 줄 카피", kind: "text", required: true, wide: true },
      { name: "summary", label: "요약", kind: "textarea", rows: 3, required: true, wide: true },
      {
        name: "highlights",
        label: "강점",
        kind: "lines",
        rows: 5,
        hint: "한 줄에 하나씩. 빈 줄은 무시합니다.",
        wide: true,
      },
      {
        name: "subBusinesses",
        label: "세부 사업",
        kind: "lines",
        rows: 3,
        hint: "한 줄에 하나씩.",
        wide: true,
      },
      {
        name: "reasons",
        label: "선택 이유",
        kind: "pairs",
        pairKeys: ["title", "description"],
        rows: 4,
        hint: '한 줄에 하나씩 "제목|설명" 형식으로 입력하세요.',
        wide: true,
      },
    ],
  },
  {
    key: "processSteps",
    title: "서비스 프로세스",
    desc: "사업영역 상세 페이지의 4단계 안내입니다. 항목 추가·삭제·순서 변경은 지원하지 않습니다.",
    where: "/business/[slug] — BusinessProcess",
    labelField: "name",
    mutable: false,
    fields: [
      { name: "key", label: "코드", kind: "readonly" },
      { name: "numberLabel", label: "번호", kind: "text", required: true },
      { name: "name", label: "단계명", kind: "text", required: true },
      { name: "englishName", label: "영문명", kind: "text", required: true },
      { name: "description", label: "설명", kind: "textarea", rows: 4, required: true, wide: true },
    ],
  },
] as const;

export function findListSchema(key: string): ListSchema | undefined {
  return LIST_SCHEMAS.find((s) => s.key === key);
}
