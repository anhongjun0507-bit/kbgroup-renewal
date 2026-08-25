"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";

/**
 * 메뉴(nav_items) Server Actions (PLAN B / DAY 8, ITEM 03).
 *
 * 공통 규약 — DAY 3~7 과 동일:
 *  · 진입부 requireAdmin() — RLS(public.is_admin())와 이중 방어.
 *  · 무효화는 content:nav 태그 하나 (E-12). revalidatePath 는 쓰지 않는다.
 *
 * 순서는 **형제 그룹(같은 location + 같은 parent_id) 안에서만** 뒤집고, 저장할 때
 * 그 그룹 전체를 0..n-1 로 정규화한다. 시드가 이미 그렇게 들어가 있어도, 사람이 DB 를
 * 직접 만졌을 때 동률·구멍이 남지 않게 하려는 것이다(DAY 7 섹션 액션과 같은 방식).
 *
 * href 는 편집하지 않는다 — 계약 문구는 「이름 변경 · 순서 조정 · 표시·숨김」까지고,
 * 경로를 바꾸면 실재하지 않는 라우트를 가리켜 404 를 만들 수 있다(PROGRESS §3).
 */

type Row = {
  id: string;
  parent_id: string | null;
  location: string;
  sort_order: number;
};

async function loadSiblings(id: string) {
  const { supabase } = await requireAdmin("/admin/content/nav");

  const { data: self, error: selfError } = await supabase
    .from("nav_items")
    .select("id, parent_id, location, sort_order")
    .eq("id", id)
    .single();
  if (selfError || !self) throw new Error(`메뉴 항목을 찾을 수 없습니다: ${id}`);

  const query = supabase
    .from("nav_items")
    .select("id, parent_id, location, sort_order")
    .eq("location", self.location)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  const { data, error } = self.parent_id
    ? await query.eq("parent_id", self.parent_id)
    : await query.is("parent_id", null);
  if (error) throw new Error(error.message);

  return { supabase, self: self as Row, siblings: (data ?? []) as Row[] };
}

/** 이름 변경 — 영문 label 과 한글 kr_label. */
export async function renameNavItem(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  const krLabelRaw = String(formData.get("kr_label") ?? "").trim();

  if (!id) throw new Error("메뉴 항목 id 가 없습니다.");
  if (label.length < 1 || label.length > 100)
    throw new Error("메뉴 이름은 1~100자여야 합니다.");

  const { supabase } = await requireAdmin("/admin/content/nav");
  const { error } = await supabase
    .from("nav_items")
    /* 한글 라벨을 비우면 헤더가 영문 label 로 대체 표시한다(lib/nav/read.ts). */
    .update({ label, kr_label: krLabelRaw || null })
    .eq("id", id);
  if (error) throw new Error(error.message);

  updateTag(CONTENT_TAGS.nav);
}

/** 표시 ↔ 숨김 토글. 부모를 숨기면 하위 드롭다운도 함께 사라진다. */
export async function toggleNavVisibility(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("메뉴 항목 id 가 없습니다.");

  const { supabase } = await requireAdmin("/admin/content/nav");
  const { data, error: readError } = await supabase
    .from("nav_items")
    .select("is_visible")
    .eq("id", id)
    .single();
  if (readError || !data) throw new Error(`메뉴 항목을 찾을 수 없습니다: ${id}`);

  const { error } = await supabase
    .from("nav_items")
    .update({ is_visible: !data.is_visible })
    .eq("id", id);
  if (error) throw new Error(error.message);

  updateTag(CONTENT_TAGS.nav);
}

/** 위/아래 한 칸 이동. 자유 DnD 는 범위 밖(PROGRESS §3). */
export async function moveNavItem(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const dir = String(formData.get("direction") ?? "");
  if (!id) throw new Error("메뉴 항목 id 가 없습니다.");
  if (dir !== "up" && dir !== "down") throw new Error(`알 수 없는 이동 방향: ${dir}`);

  const { supabase, siblings } = await loadSiblings(id);
  const i = siblings.findIndex((r) => r.id === id);
  if (i === -1) throw new Error(`메뉴 항목을 찾을 수 없습니다: ${id}`);

  const j = dir === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= siblings.length) return; // 양끝 — 아무것도 하지 않는다
  [siblings[i], siblings[j]] = [siblings[j], siblings[i]];

  /* 형제 전체를 0..n-1 로 다시 매긴다. 두 행만 스왑하면 기존 값이 동률일 때 순서가 안 바뀐다. */
  for (const [order, row] of siblings.entries()) {
    if (row.sort_order === order) continue;
    const { error } = await supabase
      .from("nav_items")
      .update({ sort_order: order })
      .eq("id", row.id);
    if (error) throw new Error(error.message);
  }

  updateTag(CONTENT_TAGS.nav);
}
