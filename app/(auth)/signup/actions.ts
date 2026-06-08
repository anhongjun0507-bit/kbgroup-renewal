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

  // 이메일 인증이 꺼져 있으면(현 Supabase 설정) signUp이 곧바로 세션을 반환 → 자동 로그인.
  // 인증이 켜진 환경(폴백)에서는 세션이 없으므로 메일 확인 안내 페이지로 이동.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/mypage");
  }

  redirect(`/signup/confirm?email=${encodeURIComponent(email)}`);
}
