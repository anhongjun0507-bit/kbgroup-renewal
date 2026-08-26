/**
 * DAY 9 실동작 검증 (PLAN B / ITEM 04 + 복구 이력).
 *
 * 실제 브라우저로 관리자 화면을 **클릭**하고 공개 페이지를 HTTP 로 다시 읽어 확인한 뒤
 * **원복까지** 돈다. 원복 후에는 DAY 9 기준 스냅샷과 한 줄도 다르지 않아야 한다.
 *
 *  1) 채용 공고 — 등록 → /careers 노출 → 마감 처리 → 공개 목록 제외 · 관리자 잔존 → 삭제
 *  2) 채용 공고 — 마감일 경과 공고가 자동으로 빠지는지 (관리자가 내리지 않아도)
 *  3) 공지 상단 고정 — 토글 → 목록 최상단 → 토글 원복
 *  4) 게시판 카테고리 — 이름·설명 변경 → 게시판 페이지 반영 → 기본값 복귀 → diff 0
 *  5) 복구 이력 — 단지 1건 수정 → 복원 → 원값 일치 (복원 자체도 새 리비전)
 *
 * playwright 는 이 저장소의 의존성이 아니다. PLAYWRIGHT_PATH 로 주입한다.
 *   BASE_URL=http://localhost:3210 \
 *   BASELINE=docs/regression/ssr/day9-after \
 *   PLAYWRIGHT_PATH=/home/dev/fordex/node_modules/playwright \
 *   node scripts/verify-day9.mjs
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { openAdminBrowser, loadEnvLocal } from "./lib/admin-session.mjs";
import { visibleLines } from "./lib/visible-text.mjs";

const require = createRequire(import.meta.url);
const { createClient } = require("@supabase/supabase-js");

loadEnvLocal(readFileSync);

const BASE = process.env.BASE_URL || "http://localhost:3210";
const BASELINE = process.env.BASELINE || "docs/regression/ssr/day9-after";
const ADMIN_EMAIL = process.env.INSPECT_ADMIN_EMAIL || "inspect-admin@kbgroup.kr";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

let failures = 0;
function check(label, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
}

/** 쿠키 없는 방문자 시점 요청. 관리자 미리보기와 구분하려면 반드시 이쪽으로 읽는다. */
async function anon(path) {
  return fetch(`${BASE}${path}`, { headers: { "user-agent": "kb-regression" } });
}
async function lines(path) {
  const res = await anon(path);
  if (!res.ok) throw new Error(`${path} → HTTP ${res.status}`);
  return visibleLines(await res.text());
}
function baseline(key) {
  return readFileSync(`${BASELINE}/${key}.txt`, "utf8").split("\n").filter(Boolean);
}
function diffCount(a, b) {
  let n = 0;
  for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) n++;
  return n;
}
function firstDiff(a, b) {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] !== b[i]) return `[${i}] ${a[i] ?? "(없음)"} != ${b[i] ?? "(없음)"}`;
  }
  return null;
}
/**
 * Server Action 은 응답을 돌려준 뒤에도 캐시 무효화가 이어진다.
 * `networkidle` 직후에 읽으면 이전 값이 잡히므로 조건이 참이 될 때까지 다시 읽는다.
 * (DAY 8 검증의 `until()` 과 같은 이유·같은 방식)
 */
async function until(fn, timeout = 30_000) {
  const started = Date.now();
  let last;
  for (;;) {
    last = await fn();
    if (last) return last;
    if (Date.now() - started > timeout) return last;
    await new Promise((r) => setTimeout(r, 500));
  }
}

function ymd(offsetDays) {
  const d = new Date(Date.now() + 9 * 3600_000 + offsetDays * 86_400_000);
  return d.toISOString().slice(0, 10);
}

const { browser, page } = await openAdminBrowser({
  base: BASE,
  adminEmail: ADMIN_EMAIL,
  supabase,
});

/** 검증이 중간에 죽어도 남지 않도록 만든 것들을 모아 둔다. */
const cleanup = { openingIds: [], expiredId: null };

try {
  /* ── 1) 채용 공고 등록 → 마감 → 삭제 ────────────────────────────────── */
  const TITLE = `검증용 공고 ${Date.now()}`;

  let res = await page.goto(`${BASE}/admin/openings`, { waitUntil: "domcontentloaded" });
  check("/admin/openings 200", res.status() === 200, `HTTP ${res.status()}`);
  const before = await page.locator("ul > li .font-display").count();

  await page.goto(`${BASE}/admin/openings/new`, { waitUntil: "domcontentloaded" });
  await page.fill('input[name="title"]', TITLE);
  await page.fill('input[name="location"]', "검증 지역");
  await page.fill('textarea[name="summary"]', "DAY 9 검증용 임시 공고입니다.");
  /* 헤더 모바일 메뉴의 LOGOUT 도 button[type=submit] 이다 — 반드시 라벨로 집는다. */
  await page.getByRole("button", { name: "공고 등록" }).click();
  await page.waitForURL(`${BASE}/admin/openings`, { timeout: 60_000 });

  const { data: created } = await supabase
    .from("job_openings")
    .select("id, is_published")
    .eq("title", TITLE)
    .maybeSingle();
  check("공고 등록 — DB 적재", Boolean(created), created?.id ?? "행 없음");
  if (created) cleanup.openingIds.push(created.id);

  const after = await page.locator("ul > li .font-display").count();
  check("공고 등록 — 관리자 목록 +1", after === before + 1, `${before} → ${after}`);

  let pub = await lines("/careers/openings");
  check("공고 등록 — 공개 목록 노출", pub.some((l) => l.includes(TITLE)), TITLE);

  // 마감 처리 (버튼 클릭)
  const row = page.locator("ul > li").filter({ hasText: TITLE });
  await row.getByRole("button", { name: "마감 처리" }).click();
  await page.waitForLoadState("networkidle");

  const status = await row.locator("[data-status]").first().getAttribute("data-status");
  check("마감 처리 — 관리자 배지", status === "closed", `data-status=${status}`);

  const closedRow = await page.locator("ul > li").filter({ hasText: TITLE }).count();
  check("마감 처리 — 관리자 화면에 잔존", closedRow === 1, `${closedRow}행`);

  pub = await lines("/careers/openings");
  check("마감 처리 — 공개 목록에서 제외", !pub.some((l) => l.includes(TITLE)), TITLE);
  const careers = await lines("/careers");
  check("마감 처리 — /careers 섹션에서도 제외", !careers.some((l) => l.includes(TITLE)));

  // 삭제 (원복)
  page.once("dialog", (d) => d.accept());
  await page.locator("ul > li").filter({ hasText: TITLE }).getByRole("button", { name: "삭제" }).click();
  await page.waitForLoadState("networkidle");
  const gone = await until(async () => {
    const { data } = await supabase
      .from("job_openings")
      .select("id")
      .eq("title", TITLE)
      .maybeSingle();
    return data ? null : true;
  });
  check("공고 삭제 — 원복", gone === true);
  if (gone === true) cleanup.openingIds = [];

  /* ── 2) 마감일 경과 자동 제외 (관리자가 내리지 않아도) ──────────────── */
  const EXPIRED_TITLE = `검증용 기한경과 ${Date.now()}`;
  const { data: expired } = await supabase
    .from("job_openings")
    .insert({
      title: EXPIRED_TITLE,
      location: "검증 지역",
      deadline: ymd(-1),
      is_published: true,
      sort_order: 999,
    })
    .select("id")
    .single();
  cleanup.expiredId = expired.id;

  pub = await lines("/careers/openings");
  check(
    "마감일 경과 — 공개 목록 자동 제외 (is_published=true 인데도)",
    !pub.some((l) => l.includes(EXPIRED_TITLE)),
    `deadline=${ymd(-1)}`,
  );

  await page.goto(`${BASE}/admin/openings`, { waitUntil: "domcontentloaded" });
  const expiredVisible = await page.locator("ul > li").filter({ hasText: EXPIRED_TITLE }).count();
  const expiredBadge = await page.getByText("기한 경과", { exact: true }).count();
  check("마감일 경과 — 관리자 화면에 잔존", expiredVisible === 1, `${expiredVisible}행`);
  check("마감일 경과 — 「기한 경과」 안내", expiredBadge >= 1, `${expiredBadge}개`);

  // 마감일을 미래로 바꾸면 다시 노출되는지
  await supabase.from("job_openings").update({ deadline: ymd(30) }).eq("id", expired.id);
  pub = await lines("/careers/openings");
  check(
    "마감일 연장 — 공개 목록 복귀",
    pub.some((l) => l.includes(EXPIRED_TITLE)),
    `deadline=${ymd(30)}`,
  );

  await supabase.from("job_openings").delete().eq("id", expired.id);
  cleanup.expiredId = null;

  const careersBack = await lines("/careers");
  check(
    "채용 왕복 후 — /careers diff 0줄",
    diffCount(careersBack, baseline("careers")) === 0,
    firstDiff(careersBack, baseline("careers")) ?? "",
  );
  const openingsBack = await lines("/careers/openings");
  check(
    "채용 왕복 후 — /careers/openings diff 0줄",
    diffCount(openingsBack, baseline("careers-openings")) === 0,
    firstDiff(openingsBack, baseline("careers-openings")) ?? "",
  );

  /* ── 3) 공지 상단 고정 ──────────────────────────────────────────────── */
  const { data: notices } = await supabase
    .from("posts")
    .select("id, title, post_number, is_pinned")
    .eq("board_type", "notice")
    .order("created_at", { ascending: true });

  if (!notices || notices.length < 2) {
    check("공지 고정 — 공지 2건 이상 필요", false, `${notices?.length ?? 0}건`);
  } else {
    const target = notices[0]; // 가장 오래된 글 = 기본 정렬에서 맨 아래
    const listBefore = await lines("/notices");
    check("공지 고정 — 사전 상태 미고정", target.is_pinned === false, target.title);

    await page.goto(`${BASE}/admin/posts/notice`, { waitUntil: "domcontentloaded" });
    const postRow = page.locator("tbody tr, ul > li").filter({ hasText: target.title }).first();
    await postRow.getByRole("button", { name: "상단 고정" }).click();
    await page.waitForLoadState("networkidle");

    const pinnedOk = await until(async () => {
      const { data } = await supabase
        .from("posts")
        .select("is_pinned")
        .eq("id", target.id)
        .single();
      return data.is_pinned === true;
    });
    check("공지 고정 — DB is_pinned=true", pinnedOk === true);

    const listPinned = await lines("/notices");
    const idxPinned = listPinned.findIndex((l) => l.includes(target.title));
    const others = notices
      .slice(1)
      .map((n) => listPinned.findIndex((l) => l.includes(n.title)))
      .filter((i) => i >= 0);
    check(
      "공지 고정 — 목록 최상단으로 이동",
      others.length > 0 && idxPinned >= 0 && others.every((i) => idxPinned < i),
      `고정글 index=${idxPinned}, 나머지 최소 index=${Math.min(...others)}`,
    );

    await page.locator("tbody tr, ul > li").filter({ hasText: target.title }).first()
      .getByRole("button", { name: "고정 해제" }).click();
    await page.waitForLoadState("networkidle");
    const unpinnedOk = await until(async () => {
      const { data } = await supabase
        .from("posts")
        .select("is_pinned")
        .eq("id", target.id)
        .single();
      return data.is_pinned === false;
    });
    check("공지 고정 — 해제 원복", unpinnedOk === true);

    const listBack = await until(async () => {
      const l = await lines("/notices");
      return diffCount(l, listBefore) === 0 ? l : null;
    }) ?? (await lines("/notices"));
    check(
      "공지 고정 왕복 후 — /notices diff 0줄",
      diffCount(listBack, listBefore) === 0,
      firstDiff(listBack, listBefore) ?? "",
    );
  }

  /* ── 4) 게시판 카테고리 이름·설명 ──────────────────────────────────── */
  res = await page.goto(`${BASE}/admin/content/boards`, { waitUntil: "domcontentloaded" });
  check("/admin/content/boards 200", res.status() === 200, `HTTP ${res.status()}`);
  const boardRows = await page.locator("li[data-board]").count();
  check("게시판 행 4종", boardRows === 4, `${boardRows}행`);

  await page.fill('input[name="news_label"]', "단지 이야기");
  await page.fill('input[name="news_subtitle"]', "검증용 설명 문구입니다.");
  await page.getByRole("button", { name: "저장" }).click();
  await page.waitForLoadState("networkidle");

  const newsChanged =
    (await until(async () => {
      const l = await lines("/notices/news");
      return l.some((x) => x.includes("단지 이야기")) ? l : null;
    })) ?? (await lines("/notices/news"));
  check(
    "게시판 이름 변경 — 목록 페이지 반영",
    newsChanged.some((l) => l.includes("단지 이야기")),
    newsChanged.find((l) => l.includes("단지 이야기")) ?? "미반영",
  );
  check(
    "게시판 설명 변경 — 목록 페이지 반영",
    newsChanged.some((l) => l.includes("검증용 설명 문구입니다.")),
  );
  check(
    "게시판 이름 변경 — 줄 수 유지",
    newsChanged.length === baseline("notices-news").length,
    `${newsChanged.length} vs ${baseline("notices-news").length}`,
  );

  // 다른 게시판은 영향 없음
  const galleryDuring = await lines("/notices/gallery");
  check(
    "게시판 이름 변경 — 다른 게시판 무영향",
    diffCount(galleryDuring, baseline("notices-gallery")) === 0,
    firstDiff(galleryDuring, baseline("notices-gallery")) ?? "",
  );

  // 비우면 기본값 복귀
  await page.goto(`${BASE}/admin/content/boards`, { waitUntil: "domcontentloaded" });
  await page.fill('input[name="news_label"]', "");
  await page.fill('input[name="news_subtitle"]', "");
  await page.getByRole("button", { name: "저장" }).click();
  await page.waitForLoadState("networkidle");

  const newsBack =
    (await until(async () => {
      const l = await lines("/notices/news");
      return diffCount(l, baseline("notices-news")) === 0 ? l : null;
    })) ?? (await lines("/notices/news"));
  check(
    "게시판 기본값 복귀 — /notices/news diff 0줄",
    diffCount(newsBack, baseline("notices-news")) === 0,
    firstDiff(newsBack, baseline("notices-news")) ?? "",
  );

  /* ── 5) 복구 이력 — 단지 수정 → 복원 → 원값 일치 ────────────────────── */
  const { data: complex } = await supabase
    .from("complexes")
    .select("id, name, region, households, updated_at")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .limit(1)
    .single();
  const original = { name: complex.name, region: complex.region, households: complex.households };

  await page.goto(`${BASE}/admin/content/complexes/${complex.id}/edit`, {
    waitUntil: "domcontentloaded",
  });
  await page.fill('input[name="region"]', "검증용 지역 변경");
  await page.getByRole("button", { name: "변경 저장" }).click();
  await page.waitForURL(`${BASE}/admin/content/complexes`, { timeout: 60_000 });

  const { data: mutated } = await supabase
    .from("complexes")
    .select("region")
    .eq("id", complex.id)
    .single();
  check("리비전 — 수정 반영", mutated.region === "검증용 지역 변경", mutated.region);

  res = await page.goto(
    `${BASE}/admin/content/revisions?table=complexes&record=${complex.id}`,
    { waitUntil: "domcontentloaded" },
  );
  check("복구 이력 상세 200", res.status() === 200, `HTTP ${res.status()}`);
  const revCount = await page.locator("li[data-revision]").count();
  check("복구 이력 — 스냅샷 목록", revCount >= 1, `${revCount}건`);
  const actorShown = await page.getByText("편집자", { exact: false }).count();
  check("복구 이력 — 편집자 표시", actorShown >= 1, `${actorShown}개`);

  page.once("dialog", (d) => d.accept());
  await page.locator("li[data-revision]").first().getByRole("button", { name: "이 시점으로 복원" }).click();
  await page.waitForLoadState("networkidle");

  const restored = await until(async () => {
    const { data } = await supabase
      .from("complexes")
      .select("name, region, households")
      .eq("id", complex.id)
      .single();
    return data.region === original.region ? data : null;
  }) ?? { name: null, region: null, households: null };
  check(
    "리비전 복원 — 원값 일치",
    restored.region === original.region &&
      restored.name === original.name &&
      restored.households === original.households,
    `region=${restored.region}`,
  );

  const { count: revAfter } = await supabase
    .from("content_revisions")
    .select("id", { count: "exact", head: true })
    .eq("table_name", "complexes")
    .eq("record_id", complex.id);
  check(
    "리비전 복원 — 복원 직전 값도 적재(되돌리기의 되돌리기)",
    (revAfter ?? 0) >= 2,
    `${revAfter}건`,
  );

  const casesBack = await lines("/cases");
  check(
    "리비전 복원 후 — /cases diff 0줄",
    diffCount(casesBack, baseline("cases")) === 0,
    firstDiff(casesBack, baseline("cases")) ?? "",
  );

  /* ── 6) 잔존물 확인 ────────────────────────────────────────────────── */
  const { data: leftover } = await supabase
    .from("job_openings")
    .select("id, title")
    .like("title", "검증용%");
  check("잔존 검증용 공고 0건", (leftover ?? []).length === 0, JSON.stringify(leftover));

  const { data: boardSetting } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "boardCategories")
    .maybeSingle();
  const overrideKeys = Object.keys(boardSetting?.value ?? {});
  check("게시판 오버레이 잔존 0건", overrideKeys.length === 0, overrideKeys.join(","));

  const { count: pinnedLeft } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("is_pinned", true);
  check("상단 고정 잔존 0건", (pinnedLeft ?? 0) === 0, `${pinnedLeft}건`);
} finally {
  /* 스크립트가 중간에 죽어도 프로덕션 DB 에 검증 흔적을 남기지 않는다(§11-4). */
  for (const id of cleanup.openingIds) await supabase.from("job_openings").delete().eq("id", id);
  if (cleanup.expiredId) await supabase.from("job_openings").delete().eq("id", cleanup.expiredId);
  await browser.close();
}

console.log(`\n${failures === 0 ? "✅ 전 항목 통과" : `❌ 실패 ${failures}건`}`);
process.exit(failures === 0 ? 0 : 1);
