import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * 이메일 인증 콜백 핸들러.
 *
 * 사용자가 가입 후 받은 이메일의 확인 링크를 클릭하면 Supabase가
 * `{site_url}/auth/callback?code=<code>&next=<path>` 로 리다이렉트.
 * 여기서 code를 세션으로 교환한 후 next 경로(또는 홈)로 이동.
 *
 * Supabase 대시보드 → Authentication → URL Configuration에서
 * - Site URL: dev `http://localhost:3000`, prod `https://kbgroup.kr`
 * - Redirect URLs에 `{site_url}/auth/callback` 추가 필요 (PHASE 3에서 가입 흐름 작성 시 안내).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=auth-callback-failed`,
  );
}
