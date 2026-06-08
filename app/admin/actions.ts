"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

const ALLOWED_STATUS = ["new", "reviewing", "done", "rejected"] as const;

/** 지원/문의 상태 변경 (admin 전용) */
export async function updateApplicationStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!id || !ALLOWED_STATUS.includes(status as (typeof ALLOWED_STATUS)[number])) {
    return;
  }

  await supabase.from("job_applications").update({ status }).eq("id", id);
  revalidatePath("/admin");
}

/** 지원/문의 삭제 (admin 전용) */
export async function deleteApplication(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await supabase.from("job_applications").delete().eq("id", id);
  revalidatePath("/admin");
}
