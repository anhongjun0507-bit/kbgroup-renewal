import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";

/**
 * Next.js 미들웨어에서 호출하는 세션 갱신 헬퍼.
 *
 * - 매 요청마다 Supabase auth 토큰을 갱신해 만료된 세션 자동 refresh.
 * - 환경변수 미설정 시 통과 (PHASE 1에서는 OK, PHASE 5에서 /admin 경로 보호 추가 예정).
 *
 * `/middleware.ts`에서 import해서 사용.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 환경변수 없으면 미들웨어 통과만 (Supabase 미설정 상태에서도 사이트 정상 동작)
  if (!url || !anonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // 토큰 만료 시 자동 갱신 (Supabase 권장 패턴)
  await supabase.auth.getUser();

  return supabaseResponse;
}
