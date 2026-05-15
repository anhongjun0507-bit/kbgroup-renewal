import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next.js 루트 미들웨어.
 *
 * 매 요청마다 Supabase 세션 갱신 (`updateSession`).
 * PHASE 5에서 /admin 경로 인증·role 확인 로직 추가 예정.
 *
 * matcher는 정적 자산·이미지를 제외해 불필요한 미들웨어 실행 방지.
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * 다음 경로 제외:
     * - _next/static (Next 정적 파일)
     * - _next/image (이미지 최적화)
     * - favicon.ico
     * - 정적 이미지 (svg/png/jpg/jpeg/gif/webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
