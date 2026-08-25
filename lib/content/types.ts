/**
 * 어댑터가 반환하는 정규 콘텐츠 타입.
 *
 * 필드명은 `data/site-content.ts` 의 camelCase 를 그대로 따른다 (DB 는 snake_case).
 * 소비처가 파일 → DB 전환 시 필드 접근 코드를 바꾸지 않아도 되게 하기 위함이다.
 * null 은 undefined 로 정규화한다 — 기존 소비처가 `c.households !== undefined` 같은
 * 검사를 하고 있어 null 이 새어 들어가면 조용히 렌더가 달라진다.
 */
export type ContentComplex = {
  /** DB uuid. 파일 폴백일 때는 `file:<slug>`. */
  id: string;
  /** 불변 URL 키 (E-1). = encodeURIComponent(최초 시드 시점 name) */
  slug: string;
  name: string;
  client?: string;
  region: string;
  households?: number;
  /** 관리면적 ㎡ */
  area?: number;
  /** 관리 분야 (complexes 전용, 실데이터 전무) */
  scope?: string;
  /** 계약 기간 (과거 단지 전용) */
  period?: string;
  kind?: "apartment" | "mixed-use";
  type?: "LH" | "민간" | "공공";
  image?: string;
  images: string[];
  aliases: string[];
  isFeatured: boolean;
  /** true = 현재 운영, false = 과거 단지 */
  isActive: boolean;
  sortOrder: number;
  /** 낙관적 잠금 토큰 (E-8). 파일 폴백일 때는 빈 문자열. */
  updatedAt: string;
};

/** 어댑터가 실제로 어디서 값을 읽었는지 — 진단·로깅용. */
export type ContentOrigin = "db" | "file";

/**
 * 콘텐츠 구조 타입 재수출 (PLAN B / DAY 4).
 *
 * `data/site-content.ts` 는 값의 폴백 소스인 동시에 이 도메인 타입들의 정의처다.
 * 소비처가 타입만 쓰겠다고 데이터 파일을 직접 import 하면 "누가 아직 파일을 보고 있나"를
 * grep 으로 셀 수 없게 된다. 타입도 어댑터 한 곳을 통해 가져가게 한다.
 * (타입 전용 재수출이라 번들에는 아무것도 남지 않는다.)
 */
export type {
  BusinessArea,
  BusinessCategory,
  BusinessGalleryPhoto,
  Certification,
  Complex,
  Contact,
  Counter,
  HeroSlide,
  HistoryEntry,
  License,
  OrgNode,
  Partner,
} from "@/data/site-content";
