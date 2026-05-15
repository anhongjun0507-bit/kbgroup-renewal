import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * SERVICE_ROLE_KEY를 사용하는 관리자 클라이언트.
 * RLS 우회 가능 — 반드시 서버에서만 사용. `'use client'` 컴포넌트로 import 금지.
 *
 * `import "server-only"` 가드로 클라이언트 번들 포함 시 빌드 에러 발생.
 *
 * 사용 예 (Route Handler / Server Action):
 *   ```ts
 *   const admin = createAdminClient();
 *   await admin.from('profiles').update({ role: 'admin' }).eq('email', '...');
 *   ```
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase 관리자 환경변수 미설정. .env.local에 SUPABASE_SERVICE_ROLE_KEY를 추가하세요.",
    );
  }

  return createSupabaseClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
