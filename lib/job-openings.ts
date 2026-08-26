import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";
import { todayKst, type JobOpening } from "@/lib/jobs";

/**
 * 채용 공고 DB 조회 (서버 전용).
 * - 공개 페이지/내비: getPublishedOpenings (is_published=true; RLS도 동일 보장)
 * - 상세: getOpeningById
 * - 관리자 목록: getAllOpeningsForAdmin (비공개 포함; RLS가 admin만 전체 허용)
 */

type Row = Tables<"job_openings">;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function mapRow(r: Row): JobOpening {
  return {
    id: r.id,
    title: r.title,
    type: r.type,
    location: r.location,
    summary: r.summary,
    responsibilities: r.responsibilities ?? [],
    requirements: r.requirements ?? [],
    preferred: r.preferred ?? [],
    applyMethod: r.apply_method,
    applyEmail: r.apply_email,
    deadline: r.deadline,
    postedAt: r.posted_at,
    isPublished: r.is_published,
    sortOrder: r.sort_order,
  };
}

/**
 * 게시된 공고 (요청 단위 캐시 — layout 내비 + careers 섹션 중복 호출 dedup).
 *
 * PLAN B / DAY 9 — **마감일이 지난 공고는 여기서 자동으로 빠진다.**
 * 관리자가 따로 내리지 않아도 `/careers`·`/careers/openings` 에서 사라지고,
 * 관리자 목록(`getAllOpeningsForAdmin`)에는 「마감」 상태로 그대로 남는다.
 * `deadline` 이 null 이면 상시채용이라 만료 대상이 아니다.
 */
export const getPublishedOpenings = cache(async (): Promise<JobOpening[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("job_openings")
    .select("*")
    .eq("is_published", true)
    .or(`deadline.is.null,deadline.gte.${todayKst()}`)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  return (data ?? []).map(mapRow);
});

export async function getOpeningById(id: string): Promise<JobOpening | null> {
  if (!UUID_RE.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("job_openings")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data ? mapRow(data) : null;
}

/** 관리자용 — 비공개 포함 전체 (RLS가 admin만 전체 SELECT 허용) */
export async function getAllOpeningsForAdmin(): Promise<JobOpening[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("job_openings")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  return (data ?? []).map(mapRow);
}
