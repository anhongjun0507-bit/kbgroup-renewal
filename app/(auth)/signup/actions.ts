"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { translateAuthError } from "@/lib/supabase/auth-errors";

export type SignupState = {
  error: string | null;
  fieldErrors?: {
    email?: string;
    password?: string;
    passwordConfirm?: string;
    displayName?: string;
  };
};

export async function signupAction(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();

  const fieldErrors: SignupState["fieldErrors"] = {};
  if (!email) fieldErrors.email = "이메일을 입력해주세요.";
  if (password.length < 8)
    fieldErrors.password = "비밀번호는 8자 이상이어야 합니다.";
  if (password !== passwordConfirm)
    fieldErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";

  if (Object.keys(fieldErrors).length > 0) {
    return { error: null, fieldErrors };
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/mypage`,
      data: displayName ? { display_name: displayName } : undefined,
    },
  });

  if (error) {
    return { error: translateAuthError(error.message), fieldErrors: {} };
  }

  // 가입 승인제: 계정(profiles.status='pending')은 생성되지만 관리자 승인 전까지는
  // 로그인할 수 없다. 이메일 인증이 꺼진 현 설정에선 signUp이 세션을 즉시 반환하며
  // 자동 로그인되므로, 그 세션을 곧바로 로그아웃해 승인 전 접근을 차단한다.
  if (data.session) {
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");
  redirect("/signup/pending");
}
