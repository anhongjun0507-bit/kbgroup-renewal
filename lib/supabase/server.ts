import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

/**
 * Server Component / Route Handler / Server Action에서 사용하는 Supabase 클라이언트.
 *
 * Next 16에서 `cookies()`가 async이므로 이 함수도 async.
 * 사용 예:
 *   ```ts
 *   const supabase = await createClient();
 *   const { data } = await supabase.from('posts').select();
 *   ```
 *
 * Server Component에서 cookies 쓰기는 Next가 금지함 → 내부 try/catch로 무시 (middleware가 처리).
 */
export async function createClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase 환경변수 미설정. .env.local에 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 추가하세요.",
    );
  }

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Component에서는 cookie set 불가 — middleware에서 처리하므로 무시.
        }
      },
    },
  });
}
