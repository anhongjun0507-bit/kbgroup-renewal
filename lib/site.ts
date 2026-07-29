/**
 * 사이트 전역 상수.
 *
 * SITE_URL은 정식 도메인(apex). canonical·og:url·metadataBase·sitemap·robots가
 * 모두 이 값을 기준으로 하므로, vercel.app 프리뷰 주소를 넣으면
 * 구글이 프리뷰 도메인을 정식 주소로 색인해 SEO가 분산된다.
 */
export const SITE_URL = "https://kbgroup.kr";
