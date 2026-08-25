import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { getComplexes, getSetting } from "@/lib/content";
import { BOARD_ORDER, BOARD_CONFIGS, postDetailPath } from "@/lib/boards";
import { SITE_URL } from "@/lib/site";

/**
 * /sitemap.xml (Next Metadata File Convention).
 *
 * 구성:
 *  1) 정적 공개 페이지 (회사소개·사업영역·실적·채용·공지 허브 등)
 *  2) 콘텐츠 기반 동적 경로 — /business/[slug], /cases/[slug]
 *  3) 게시판 글 — Supabase posts 테이블
 *  4) 채용 공고 상세 — Supabase job_openings 테이블 (게시된 공고만)
 *
 * 제외: /admin, /mypage, 인증 플로우(/login·/signup·/forgot-password), /api.
 *       robots.ts의 disallow와 동일 기준.
 *
 * 게시판 글 조회는 실패해도 사이트맵 전체가 죽지 않도록 try/catch로 감싼다
 * (Supabase 일시 중지·네트워크 오류 시 정적 경로만이라도 제공).
 */

/** 1시간마다 재생성 — 게시글 추가가 하루 단위라 잦은 재조회가 불필요. */
export const revalidate = 3600;

/** 사이트맵에 넣을 게시글 상한. 초과분은 색인 우선순위가 낮은 과거 글. */
const POST_LIMIT = 1000;

type Entry = MetadataRoute.Sitemap[number];

const entry = (
  path: string,
  priority: number,
  changeFrequency: Entry["changeFrequency"],
  lastModified?: Date,
): Entry => ({
  url: `${SITE_URL}${path}`,
  lastModified: lastModified ?? new Date(),
  changeFrequency,
  priority,
});

/** 정적 공개 페이지 — 경로, 우선순위, 변경 빈도. */
const STATIC_ROUTES: Array<[string, number, Entry["changeFrequency"]]> = [
  ["", 1.0, "weekly"],
  ["/about", 0.9, "monthly"],
  ["/about/ceo", 0.7, "yearly"],
  ["/about/history", 0.6, "yearly"],
  ["/about/location", 0.7, "yearly"],
  ["/business", 0.9, "monthly"],
  ["/cases", 0.9, "weekly"],
  ["/licenses", 0.6, "yearly"],
  ["/careers", 0.8, "weekly"],
  ["/careers/openings", 0.8, "weekly"],
  ["/contact", 0.8, "monthly"],
  ["/notices", 0.7, "weekly"],
  ["/privacy", 0.3, "yearly"],
  ["/terms", 0.3, "yearly"],
];

/** 쿠키·세션이 필요 없는 공개 데이터 전용 클라이언트.
    ssr 클라이언트(cookies 의존)를 쓰면 사이트맵이 동적 라우트가 되므로 분리. */
function publicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey);
}

/** 게시판 글 목록 (id, 수정일). 실패 시 빈 배열. */
async function boardPostEntries(): Promise<Entry[]> {
  const supabase = publicClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("posts")
      .select("id, board_type, updated_at, created_at")
      .order("created_at", { ascending: false })
      .limit(POST_LIMIT);

    if (error || !data) return [];

    return data.flatMap((row): Entry[] => {
      const board = BOARD_ORDER.find((b) => b === row.board_type);
      if (!board) return [];
      const modified = row.updated_at ?? row.created_at;
      return [
        entry(
          postDetailPath(board, row.id),
          0.5,
          "monthly",
          modified ? new Date(modified) : undefined,
        ),
      ];
    });
  } catch {
    return [];
  }
}

/** 게시된 채용 공고 상세. 실패 시 빈 배열. */
async function jobOpeningEntries(): Promise<Entry[]> {
  const supabase = publicClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("job_openings")
      .select("id, updated_at, created_at")
      .eq("is_published", true)
      .limit(POST_LIMIT);

    if (error || !data) return [];

    return data.map((row) => {
      const modified = row.updated_at ?? row.created_at;
      return entry(
        `/careers/openings/${row.id}`,
        0.7,
        "weekly",
        modified ? new Date(modified) : undefined,
      );
    });
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [businessAreas, complexes] = await Promise.all([
    getSetting("businessAreas"),
    getComplexes(),
  ]);

  const staticEntries = STATIC_ROUTES.map(([path, priority, freq]) =>
    entry(path, priority, freq),
  );

  /* 게시판 목록 페이지 (/notices/board, /notices/gallery, ...) */
  const boardListEntries = BOARD_ORDER.map((board) =>
    entry(BOARD_CONFIGS[board].listPath, 0.7, "weekly"),
  );

  /* 사업영역 상세 — businessAreas 설정의 slug 기준 */
  const businessEntries = businessAreas.map((area) =>
    entry(`/business/${area.slug}`, 0.8, "monthly"),
  );

  /* 실적 상세 — E-1. DB 의 불변 slug 를 그대로 쓴다(= 최초 시드 시점 encodeURIComponent(name)). */
  const caseEntries = complexes.map((c) =>
    entry(`/cases/${c.slug}`, 0.6, "monthly"),
  );

  const [postEntries, openingEntries] = await Promise.all([
    boardPostEntries(),
    jobOpeningEntries(),
  ]);

  return [
    ...staticEntries,
    ...boardListEntries,
    ...businessEntries,
    ...caseEntries,
    ...postEntries,
    ...openingEntries,
  ];
}
