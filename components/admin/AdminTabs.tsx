import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

/** 관리자 페이지 상단 탭 (지원·문의 / 채용 공고 / 소식 관리 / 회원 관리 / 단지 관리 / 사이트 설정).
 *  회원 관리 탭에는 승인 대기 인원 배지를 표시한다. */
export async function AdminTabs({
  active,
}: {
  active: "applications" | "openings" | "posts" | "members" | "complexes" | "settings";
}) {
  // 승인 대기 회원 수 — 모든 관리자 페이지에서 한눈에 보이도록 탭 배지로 노출.
  // (admin 세션 기준 RLS로 전체 profiles 카운트 허용. status 컬럼 미적용 시엔 null → 0.)
  let pendingCount = 0;
  try {
    const supabase = await createClient();
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");
    pendingCount = count ?? 0;
  } catch {
    pendingCount = 0;
  }

  const tabs = [
    { key: "applications", label: "지원·문의", href: "/admin" },
    { key: "openings", label: "채용 공고", href: "/admin/openings" },
    { key: "posts", label: "소식 관리", href: "/admin/posts" },
    { key: "members", label: "회원 관리", href: "/admin/members" },
    { key: "complexes", label: "단지 관리", href: "/admin/content/complexes" },
    { key: "settings", label: "사이트 설정", href: "/admin/content/settings" },
  ] as const;

  return (
    <nav className="mb-8 flex gap-1 border-b border-line" aria-label="관리자 메뉴">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          aria-current={active === t.key ? "page" : undefined}
          className={
            "-mb-px inline-flex items-center gap-1.5 border-b-2 px-4 py-3 text-[14px] font-semibold transition-colors " +
            (active === t.key
              ? "border-accent-500 text-ink-strong"
              : "border-transparent text-ink-muted hover:text-ink-strong")
          }
        >
          {t.label}
          {t.key === "members" && pendingCount > 0 && (
            <span
              className="inline-flex min-w-[18px] items-center justify-center rounded-full bg-accent-500 px-1.5 text-[11px] font-bold text-navy-900"
              aria-label={`승인 대기 ${pendingCount}명`}
            >
              {pendingCount}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
