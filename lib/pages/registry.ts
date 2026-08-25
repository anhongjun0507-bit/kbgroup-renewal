/**
 * 공개 페이지 레지스트리 (PLAN B / DAY 8, ITEM 03 「페이지 공개·비공개 전환」).
 *
 * 계약 범위는 **기존 페이지의 노출 토글**까지다(PROGRESS §1·§3). 페이지 신규 생성은 없다.
 * 그래서 "어떤 경로가 존재하는가"는 코드가 갖고, DB(`pages`)는 `is_published` 만 얹는다.
 * DAY 7 섹션 레지스트리와 같은 구조다 — 행이 없으면 전부 공개(= 전환 전과 동일).
 *
 * 이 배열은 `app/sitemap.ts` 의 `STATIC_ROUTES` 를 그대로 옮긴 것이다.
 * **순서·priority·changeFrequency 를 바꾸지 마라.** sitemap.xml 의 항목 순서가 바뀐다.
 *
 * 범위 밖(레지스트리에 넣지 않는 경로):
 *  · 상세 라우트 — `/cases/[slug]`·`/business/[slug]`·`/careers/openings/[id]`·`/notices/…/[id]`
 *  · 게시판 목록 — `/notices/board`·`/gallery`·`/news`·`/resources` (게시판 관리는 ITEM 04)
 *  · 비공개 영역 — `/admin`·`/mypage`·인증 플로우·`/api` (robots.ts 가 이미 차단)
 * 부모를 비공개로 돌려도 자식 상세는 자동으로 닫히지 않는다(연쇄 차단은 지시 밖이다).
 */
export type PublicPage = {
  /** 라우트 경로. 홈만 "/" 이고 sitemap 에서는 빈 문자열로 나간다(`sitemapPath`). */
  path: string;
  /** 관리자 화면 표시명. */
  label: string;
  /** false = 비공개 전환 불가. 홈을 닫으면 사이트 전체가 404 가 되어 되돌릴 길이 좁아진다. */
  togglable: boolean;
  priority: number;
  changeFrequency: "weekly" | "monthly" | "yearly";
};

export const PUBLIC_PAGES: PublicPage[] = [
  { path: "/", label: "메인", togglable: false, priority: 1.0, changeFrequency: "weekly" },
  { path: "/about", label: "회사소개", togglable: true, priority: 0.9, changeFrequency: "monthly" },
  { path: "/about/ceo", label: "회사소개 · 대표 메시지", togglable: true, priority: 0.7, changeFrequency: "yearly" },
  { path: "/about/history", label: "회사소개 · 연혁", togglable: true, priority: 0.6, changeFrequency: "yearly" },
  { path: "/about/location", label: "회사소개 · 오시는 길", togglable: true, priority: 0.7, changeFrequency: "yearly" },
  { path: "/business", label: "사업영역", togglable: true, priority: 0.9, changeFrequency: "monthly" },
  { path: "/cases", label: "관리현황", togglable: true, priority: 0.9, changeFrequency: "weekly" },
  { path: "/licenses", label: "인허가", togglable: true, priority: 0.6, changeFrequency: "yearly" },
  { path: "/careers", label: "채용", togglable: true, priority: 0.8, changeFrequency: "weekly" },
  { path: "/careers/openings", label: "채용 공고 목록", togglable: true, priority: 0.8, changeFrequency: "weekly" },
  { path: "/contact", label: "상담 문의", togglable: true, priority: 0.8, changeFrequency: "monthly" },
  { path: "/notices", label: "공지사항", togglable: true, priority: 0.7, changeFrequency: "weekly" },
  { path: "/privacy", label: "개인정보처리방침", togglable: true, priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", label: "이용약관", togglable: true, priority: 0.3, changeFrequency: "yearly" },
];

/** 레지스트리에 있는 경로만 비공개 판정 대상이다. 그 외 경로는 항상 공개로 본다. */
export const PUBLIC_PAGE_PATHS: ReadonlySet<string> = new Set(
  PUBLIC_PAGES.map((p) => p.path),
);

export function findPublicPage(path: string): PublicPage | undefined {
  return PUBLIC_PAGES.find((p) => p.path === path);
}

/** sitemap URL 용 경로. 홈은 `${SITE_URL}` 로 나가야 하므로 빈 문자열이다(전환 전과 동일). */
export function sitemapPath(path: string): string {
  return path === "/" ? "" : path;
}
