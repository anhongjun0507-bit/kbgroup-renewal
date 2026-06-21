import Link from "next/link";

/** 관리자 페이지 상단 탭 (지원·문의 / 채용 공고 / 소식 관리). */
export function AdminTabs({
  active,
}: {
  active: "applications" | "openings" | "posts";
}) {
  const tabs = [
    { key: "applications", label: "지원·문의", href: "/admin" },
    { key: "openings", label: "채용 공고", href: "/admin/openings" },
    { key: "posts", label: "소식 관리", href: "/admin/posts" },
  ] as const;

  return (
    <nav className="mb-8 flex gap-1 border-b border-line" aria-label="관리자 메뉴">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          aria-current={active === t.key ? "page" : undefined}
          className={
            "-mb-px border-b-2 px-4 py-3 text-[14px] font-semibold transition-colors " +
            (active === t.key
              ? "border-accent-500 text-ink-strong"
              : "border-transparent text-ink-muted hover:text-ink-strong")
          }
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
