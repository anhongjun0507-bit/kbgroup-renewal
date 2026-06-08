import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * 관리자 전용 페이지/액션 가드.
 * - 미인증 → /login?next=...
 * - 인증됐지만 admin 아님 → 홈으로
 * 통과 시 user·profile·supabase(이미 인증된 클라이언트)를 반환해 재사용한다.
 *
 * RLS(public.is_admin())가 데이터 접근의 1차 방어선이고, 이 가드는 페이지
 * 셸 노출까지 차단하는 2차 방어선.
 */
export async function requireAdmin(next = "/admin") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name, email")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  return { user, profile, supabase };
}
