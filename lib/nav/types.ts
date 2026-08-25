/**
 * 네비게이션 타입 + 기본값 (PLAN B / DAY 8, ITEM 03).
 *
 * **이 파일은 클라이언트 번들에 들어간다** (`Header.tsx` 가 타입을 가져간다).
 * 서버 전용 코드(`server-only`·supabase)를 절대 넣지 않는다. 읽기는 `lib/nav/read.ts`.
 *
 * 아래 기본값은 전환 전 `Header.tsx` 의 `buildNavItems()` 와 `Footer.tsx` 의 `SITEMAP`
 * 상수를 **그대로 옮긴 것**이다. `nav_items` 에 행이 하나도 없거나 조회가 실패하면
 * 이 값으로 렌더된다 — 즉 전환 전과 동일한 화면이다 (DAY 7 오버레이와 같은 원칙).
 */
export type NavChild = { label: string; href: string };

export type NavItem = {
  label: string;
  krLabel: string;
  href: string;
  children?: NavChild[];
};

/**
 * 하위 항목을 `nav_items` 가 아니라 `businessAreas` 설정에서 만드는 부모 항목.
 *
 * 사업영역 목록은 관리자 「사이트 설정 · 사업영역」에서 편집한다(DAY 5). 같은 목록을
 * `nav_items` 에도 복제하면 사업영역을 추가·개명해도 드롭다운이 따라오지 않는
 * 두 출처 문제가 생긴다. 그래서 이 항목의 자식만 코드에서 파생시킨다.
 */
export const BUSINESS_NAV_HREF = "/business";

/** 헤더 상단 메뉴 기본값. BUSINESS 하위는 businessAreas 에서 파생된다(위 주석). */
export const HEADER_NAV_DEFAULT: NavItem[] = [
  { label: "ABOUT", krLabel: "회사소개", href: "/about" },
  { label: "BUSINESS", krLabel: "사업영역", href: "/business" },
  { label: "PROJECTS", krLabel: "관리현황", href: "/cases" },
  { label: "LICENSES", krLabel: "인허가", href: "/licenses" },
  {
    label: "CAREERS",
    krLabel: "채용",
    href: "/careers",
    // 호버 시 "KB 인재채용" 단일 항목 → 현재 채용 중인 공고 목록으로 이동
    children: [{ label: "KB 인재채용", href: "/careers/openings" }],
  },
  {
    label: "NEWS",
    krLabel: "소식",
    href: "/notices",
    children: [
      { label: "공지사항", href: "/notices" },
      { label: "자유게시판", href: "/notices/board" },
      { label: "갤러리", href: "/notices/gallery" },
      { label: "단지소식", href: "/notices/news" },
      { label: "자료실", href: "/notices/resources" },
    ],
  },
];

/** 푸터 SITEMAP 열 기본값 — 헤더 영문 GNB 와 라벨 일치 (krLabel 은 보조). */
export const FOOTER_NAV_DEFAULT: NavItem[] = [
  { label: "ABOUT", krLabel: "회사소개", href: "/about" },
  { label: "BUSINESS", krLabel: "사업영역", href: "/business" },
  { label: "PROJECTS", krLabel: "관리현황", href: "/cases" },
  { label: "LICENSES", krLabel: "인허가", href: "/licenses" },
  { label: "CAREERS", krLabel: "채용", href: "/careers" },
  { label: "NEWS", krLabel: "소식", href: "/notices" },
];

/**
 * 푸터 하단 법적 고지 링크. `nav_items` 로 빼지 않는다 —
 * 개인정보처리방침·이용약관은 법정 고지라 관리자가 이름을 바꾸거나 지울 대상이 아니다.
 * 다만 해당 페이지를 비공개로 돌리면 링크도 함께 사라진다(§8-3 연쇄 영향).
 */
export const FOOTER_LEGAL: NavChild[] = [
  { label: "개인정보처리방침", href: "/privacy" },
  { label: "이용약관", href: "/terms" },
];
