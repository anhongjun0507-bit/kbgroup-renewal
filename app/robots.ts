import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * /robots.txt (Next Metadata File Convention).
 *
 * 공개 페이지는 전부 허용하고, 색인 가치가 없거나 노출되면 안 되는 경로만 차단:
 * - /admin      : 관리자 전용
 * - /mypage     : 로그인 사용자 개인 페이지
 * - /login, /signup, /forgot-password : 인증 플로우(중복·저품질 색인 방지)
 * - /api        : JSON 엔드포인트
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/mypage",
        "/login",
        "/signup",
        "/forgot-password",
        "/api",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
