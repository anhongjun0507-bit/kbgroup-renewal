"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { translateAuthError } from "@/lib/supabase/auth-errors";

export type LoginState = {
  error: string | null;
};

/** /로 시작하고 //가 아닌 내부 경로만 허용 (open redirect 방지) */
function safeNext(value: unknown): string {
  const s = typeof value === "string" ? value : "";
  if (!s.startsWith("/") || s.startsWith("//")) return "/mypage";
  return s;
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력해주세요." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  // 가입 승인제 게이트: 승인되지 않은 계정은 로그인 직후 세션을 파기한다.
  // (관리자는 status와 무관하게 항상 로그인 허용 — 잠금 방지 안전장치)
  if (data.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", data.user.id)
      .single();

    if (profile?.role !== "admin" && profile?.status !== "approved") {
      await supabase.auth.signOut();
      return {
        error:
          profile?.status === "rejected"
            ? "가입이 거절된 계정입니다. 자세한 내용은 운영 담당자에게 문의해 주세요."
            : "관리자 승인 대기 중인 계정입니다. 승인 완료 후 로그인할 수 있습니다.",
      };
    }
  }

  // Header가 user 상태를 다시 읽도록 layout 단위 revalidate
  revalidatePath("/", "layout");
  redirect(next);
}
