"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * 채용 지원/문의 접수 — job_applications 테이블에 저장.
 * RLS 정책상 익명 포함 누구나 INSERT 가능(로그인 불필요).
 * 관리자는 /admin 에서 조회·상태 관리.
 */

export type ApplyState = {
  ok: boolean;
  error: string | null;
  fieldErrors?: {
    name?: string;
    phone?: string;
    email?: string;
  };
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitApplication(
  _prev: ApplyState,
  formData: FormData,
): Promise<ApplyState> {
  const openingId = String(formData.get("openingId") ?? "").trim() || null;
  const openingTitle =
    String(formData.get("openingTitle") ?? "").trim() || null;
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  const fieldErrors: ApplyState["fieldErrors"] = {};
  if (!name) fieldErrors.name = "이름을 입력해주세요.";
  if (!phone) fieldErrors.phone = "연락처를 입력해주세요.";
  if (email && !EMAIL_RE.test(email))
    fieldErrors.email = "올바른 이메일 형식이 아닙니다.";

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: null, fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("job_applications").insert({
    opening_id: openingId,
    opening_title: openingTitle,
    name,
    phone,
    email: email || null,
    message: message || null,
  });

  if (error) {
    return {
      ok: false,
      error: "접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
    };
  }

  return { ok: true, error: null };
}
