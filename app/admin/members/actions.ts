"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_STATUS = ["pending", "approved", "rejected"] as const;
type Status = (typeof ALLOWED_STATUS)[number];

/**
 * 회원 승인 상태 변경 (admin 전용).
 * - 본인 계정은 변경 불가 (실수로 자기 잠금 방지).
 * - RLS(profiles UPDATE own-or-admin) + prevent_status_change 트리거(admin만 status 변경)를
 *   admin 세션 클라이언트로 통과.
 */
export async function setMemberStatus(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!id || !ALLOWED_STATUS.includes(status as Status)) return;
  if (id === user.id) return; // 본인 상태는 변경하지 않음

  await supabase.from("profiles").update({ status }).eq("id", id);
  revalidatePath("/admin/members");
}

/**
 * 회원 삭제 (admin 전용).
 * auth.users 삭제 → profiles는 ON DELETE CASCADE로 함께 삭제.
 * - 본인·다른 관리자 계정은 삭제 불가.
 * - service_role 클라이언트로 auth.admin.deleteUser 호출.
 */
export async function deleteMember(formData: FormData) {
  const { user } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id || id === user.id) return;

  const admin = createAdminClient();

  // 관리자 계정은 삭제 금지 (실수 잠금 방지)
  const { data: target } = await admin
    .from("profiles")
    .select("role")
    .eq("id", id)
    .single();
  if (!target || target.role === "admin") return;

  await admin.auth.admin.deleteUser(id);
  revalidatePath("/admin/members");
}
