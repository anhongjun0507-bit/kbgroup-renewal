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
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  // Header가 user 상태를 다시 읽도록 layout 단위 revalidate
  revalidatePath("/", "layout");
  redirect(next);
}
