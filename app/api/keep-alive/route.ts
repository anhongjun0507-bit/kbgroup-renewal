import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabase 무료 플랜 자동 정지 방지용 keep-alive.
 *
 * 무료 플랜은 7일간 API/DB 활동이 없으면 프로젝트가 자동 정지(INACTIVE)되어
 * Auth·DB·REST가 전면 다운된다(2026-06-08 회원가입 장애의 실제 원인).
 * Vercel Cron이 매일 이 경로를 호출 → 가벼운 DB 쿼리로 활성 상태를 유지한다.
 *
 * RLS로 행이 보이지 않아도 쿼리 자체가 DB에 도달하므로 비활성 타이머가 리셋된다.
 * Cron 스케줄은 vercel.json의 `crons`에 등록.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true });

    return NextResponse.json({
      ok: true,
      ts: new Date().toISOString(),
      dbError: error?.message ?? null,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "unknown" },
      { status: 500 },
    );
  }
}
