import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { ContentOrigin } from "./types";

/**
 * 3모드 (PROGRESS §6 단계 2)
 *
 *   CONTENT_SOURCE 미설정 | "db"  → DB 모드(기본). 조회 실패·빈 결과면 파일 폴백.
 *   CONTENT_SOURCE = "file"      → 킬스위치. DB 를 아예 조회하지 않는다 (롤백 레벨 2).
 *
 * Vercel 환경변수 CONTENT_SOURCE 를 file 로 바꾸고 재배포하면 파일 기반 사이트로 즉시 복귀한다.
 */
export function isKillSwitchOn(): boolean {
  return (process.env.CONTENT_SOURCE ?? "db").trim().toLowerCase() === "file";
}

/**
 * 캐시된 리더 전용 Supabase 클라이언트.
 *
 * `lib/supabase/server.ts` 의 createClient() 는 cookies() 를 읽으므로
 * unstable_cache 안에서 쓸 수 없다(요청 스코프 API). 콘텐츠는 전부 SELECT 공개(RLS)라
 * 쿠키 없는 anon 클라이언트로 읽는다.
 */
export function createContentReadClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("[content] Supabase 환경변수 미설정 (URL / ANON_KEY)");
  }
  return createClient<Database>(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** 폴백이 발동할 때 남기는 로그. 조용한 폴백은 장애를 숨기므로 반드시 찍는다 (E-9). */
export function logFallback(scope: string, reason: unknown): void {
  console.error(
    `[content] ${scope} DB 조회 실패 → data/site-content.ts 폴백:`,
    reason instanceof Error ? reason.message : reason,
  );
}

export type { ContentOrigin };
