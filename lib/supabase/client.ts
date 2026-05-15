import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

/**
 * 브라우저(Client Component)에서 사용하는 Supabase 클라이언트.
 * 사용 예: `'use client'` 컴포넌트 안에서 `createClient()` 호출.
 *
 * - `NEXT_PUBLIC_*` 환경변수만 사용 (브라우저 노출 OK, RLS로 보호).
 * - 환경변수 미설정 시 호출 시점에 에러 (모듈 로드 시점 X).
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase 환경변수 미설정. .env.local에 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 추가하세요.",
    );
  }

  return createBrowserClient<Database>(url, anonKey);
}
