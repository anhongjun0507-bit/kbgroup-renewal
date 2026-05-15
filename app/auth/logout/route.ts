import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * 로그아웃 핸들러.
 *
 * 사용 패턴 (script-free):
 *   <form action="/auth/logout" method="POST">
 *     <button type="submit">로그아웃</button>
 *   </form>
 *
 * POST만 받는 이유: GET이면 prefetch·검색엔진 등이 우연히 호출해
 * 의도치 않은 로그아웃이 발생할 수 있음.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");

  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/`, { status: 303 });
}
