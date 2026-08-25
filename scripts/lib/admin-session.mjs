/**
 * 관리자 로그인 브라우저 세션 (검증 스크립트 공용 · PLAN B / DAY 6).
 *
 * `verify-day5-admin.mjs` 에서 쓰던 로그인 절차를 그대로 옮긴 것이다. DAY 6 검증도 같은 절차가
 * 필요해 두 번 적어 두면 한쪽만 고치는 순간 조용히 어긋난다.
 *
 * 매직링크의 redirect_to 는 Supabase 허용 목록에 없는 localhost 로는 못 간다(프로덕션으로 튕긴다).
 * 그래서 링크를 브라우저로 열지 않고 Node 에서 verifyOtp 로 세션만 받은 뒤,
 * 앱이 실제로 쓰는 @supabase/ssr 쿠키 형식 그대로 브라우저 컨텍스트에 심는다.
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export async function openAdminBrowser({ base, adminEmail, supabase }) {
  const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
  const { createClient } = require("@supabase/supabase-js");
  const { createServerClient } = require("@supabase/ssr");

  const { data: link, error: linkError } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: adminEmail,
  });
  if (linkError) throw new Error(`매직링크 발급 실패: ${linkError.message}`);

  const anon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const { data: otp, error: otpError } = await anon.auth.verifyOtp({
    type: "magiclink",
    token_hash: link.properties.hashed_token,
  });
  if (otpError || !otp.session) throw new Error(`verifyOtp 실패: ${otpError?.message}`);

  // 앱과 같은 @supabase/ssr 어댑터로 쿠키를 만들게 해 이름·청크 규칙을 직접 흉내내지 않는다.
  const jar = [];
  const ssr = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => jar.map(({ name, value }) => ({ name, value })),
        setAll: (list) => {
          for (const c of list) {
            const i = jar.findIndex((x) => x.name === c.name);
            if (i >= 0) jar[i] = { name: c.name, value: c.value };
            else jar.push({ name: c.name, value: c.value });
          }
        },
      },
    },
  );
  await ssr.auth.setSession({
    access_token: otp.session.access_token,
    refresh_token: otp.session.refresh_token,
  });
  if (jar.length === 0) throw new Error("@supabase/ssr 쿠키를 만들지 못했습니다.");

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addCookies(
    jar.map((c) => ({
      name: c.name,
      value: c.value,
      domain: new URL(base).hostname,
      path: "/",
      httpOnly: false,
      secure: base.startsWith("https"),
      sameSite: "Lax",
    })),
  );
  const page = await ctx.newPage();
  page.setDefaultTimeout(120_000);
  page.setDefaultNavigationTimeout(120_000);
  return { browser, ctx, page };
}

/** .env.local 을 process.env 에 얹는다 (이미 있는 값은 덮어쓰지 않는다). */
export function loadEnvLocal(readFileSync) {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
