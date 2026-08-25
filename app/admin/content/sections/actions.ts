"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { CONTENT_TAGS } from "@/lib/content/tags";
import { PAGE_SECTIONS, type PageKey } from "@/lib/sections/meta";
import { orderSections, type PageOverlay } from "@/lib/sections/overlay";

/**
 * 섹션 구성(page_sections) Server Actions (PLAN B / DAY 7, ITEM 02).
 *
 * 공통 규약 — DAY 3~5 와 동일:
 *  · 진입부 requireAdmin() — RLS(public.is_admin())와 이중 방어.
 *  · 무효화는 content:sections 태그 하나 (E-12). revalidatePath 는 쓰지 않는다.
 *
 * 쓰기 방식 — 저장할 때마다 **그 페이지의 전 섹션 행을 0..n-1 로 정규화**해 upsert 한다.
 *  행이 하나도 없는 상태(= 레지스트리 기본 배치)에서 시작해도 첫 조작으로 전부 채워지므로
 *  "일부만 행이 있어 순서가 섞이는" 상태가 생기지 않는다.
 *  낙관적 잠금은 걸지 않는다 — 값이 표시·순서뿐이고 화면에서 즉시 되돌릴 수 있어
 *  단지·설정 편집과 달리 덮어쓰기 손실이 없다.
 */

function assertPage(pageKey: string): PageKey {
  if (!(pageKey in PAGE_SECTIONS)) throw new Error(`알 수 없는 페이지 키: ${pageKey}`);
  return pageKey as PageKey;
}

type Row = { section_key: string; is_visible: boolean; sort_order: number };

/** 현재 DB 오버레이 → 레지스트리 순서가 반영된 전체 목록(숨김 포함). */
function toOverlay(rows: Row[] | null): PageOverlay {
  const overlay: PageOverlay = {};
  for (const r of rows ?? []) {
    overlay[r.section_key] = { is_visible: r.is_visible, sort_order: r.sort_order };
  }
  return overlay;
}

type Entry = { key: string; is_visible: boolean };

async function load(page: PageKey) {
  const { supabase } = await requireAdmin("/admin/content/sections");
  const { data, error } = await supabase
    .from("page_sections")
    .select("section_key, is_visible, sort_order")
    .eq("page_key", page);
  if (error) throw new Error(error.message);

  const overlay = toOverlay(data as Row[] | null);
  const entries: Entry[] = orderSections(page, overlay).map(({ section }) => ({
    key: section.key,
    /* orderSections 의 visible 은 removable:false 를 강제 표시로 덮어쓴 값이라 여기서는 원본을 본다. */
    is_visible: overlay[section.key]?.is_visible ?? true,
  }));
  return { supabase, entries };
}

async function save(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  page: PageKey,
  entries: Entry[],
) {
  const { error } = await supabase.from("page_sections").upsert(
    entries.map((e, i) => ({
      page_key: page,
      section_key: e.key,
      is_visible: e.is_visible,
      sort_order: i,
    })),
    { onConflict: "page_key,section_key" },
  );
  if (error) throw new Error(error.message);
  updateTag(CONTENT_TAGS.sections);
}

/** 표시 ↔ 숨김 토글. removable:false 섹션은 거부한다(UI 에서도 잠겨 있다). */
export async function toggleSectionVisibility(formData: FormData): Promise<void> {
  const page = assertPage(String(formData.get("page") ?? ""));
  const key = String(formData.get("section") ?? "");

  const meta = PAGE_SECTIONS[page].sections.find((s) => s.key === key);
  if (!meta) throw new Error(`알 수 없는 섹션 키: ${page} / ${key}`);
  if (!meta.removable) throw new Error(`필수 섹션은 숨길 수 없습니다: ${meta.label}`);

  const { supabase, entries } = await load(page);
  const target = entries.find((e) => e.key === key);
  if (!target) throw new Error(`섹션을 찾을 수 없습니다: ${key}`);
  target.is_visible = !target.is_visible;

  await save(supabase, page, entries);
}

/** 위/아래 한 칸 이동. 자유 DnD 는 범위 밖(PROGRESS §3). */
export async function moveSection(formData: FormData): Promise<void> {
  const page = assertPage(String(formData.get("page") ?? ""));
  const key = String(formData.get("section") ?? "");
  const dir = String(formData.get("direction") ?? "");
  if (dir !== "up" && dir !== "down") throw new Error(`알 수 없는 이동 방향: ${dir}`);

  const { supabase, entries } = await load(page);
  const i = entries.findIndex((e) => e.key === key);
  if (i === -1) throw new Error(`섹션을 찾을 수 없습니다: ${key}`);

  const j = dir === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= entries.length) return; // 양끝 — 아무것도 하지 않는다
  [entries[i], entries[j]] = [entries[j], entries[i]];

  await save(supabase, page, entries);
}
