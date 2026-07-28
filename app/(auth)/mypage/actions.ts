"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { translateAuthError } from "@/lib/supabase/auth-errors";
import type { FormState } from "./form-state";

export async function updateDisplayName(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const displayName = String(formData.get("displayName") ?? "").trim();

  if (displayName.length > 50) {
    return { status: "error", message: "표시 이름은 50자 이하여야 합니다." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { status: "error", message: "로그인이 필요합니다." };

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName || null })
    .eq("id", user.id);

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/mypage");
  return { status: "success", message: "표시 이름을 변경했습니다." };
}

export async function updatePassword(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  if (password.length < 8) {
    return {
      status: "error",
      message: "비밀번호는 8자 이상이어야 합니다.",
    };
  }
  if (password !== passwordConfirm) {
    return { status: "error", message: "비밀번호가 일치하지 않습니다." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { status: "error", message: translateAuthError(error.message) };
  }

  return { status: "success", message: "비밀번호를 변경했습니다." };
}
