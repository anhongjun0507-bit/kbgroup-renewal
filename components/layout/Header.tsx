"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { businessAreas } from "@/data/site-content";

interface HeaderProps {
  isAuthed?: boolean;
}

type NavChild = { label: string; href: string };
type NavItem = { label: string; href: string; children?: NavChild[] };

const NAV_ITEMS: NavItem[] = [
  { label: "회사소개", href: "/about" },
  {
    label: "사업영역",
    href: "/business",
    children: businessAreas.map((b) => ({
      label: b.name,
      href: `/business/${b.slug}`,
    })),
  },
  { label: "관리현황", href: "/cases" },
  { label: "인허가", href: "/licenses" },
  { label: "채용", href: "/careers" },
  {
    label: "소식",
    href: "/notices",
    children: [
      { label: "공지사항", href: "/notices" },
      { label: "갤러리", href: "/notices/gallery" },
      { label: "단지소식", href: "/notices/news" },
      { label: "자료실", href: "/notices/resources" },
    ],
  },
];

export function Header({ isAuthed = false }: HeaderProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [overDark, setOverDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpand, setMobileExpand] = useState<string | null>(null);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  /* Phase 6 A-4: scroll threshold 20 → 8, data-scrolled 명시 토글 */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Phase 6 A-4: data-over-dark — 다크 hero(data-surface="dark")가 헤더 영역과 겹치면 true */
  useEffect(() => {
    setOverDark(false);
    const targets = document.querySelectorAll('[data-surface="dark"]');
    if (targets.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        let anyVisible = false;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            anyVisible = true;
            break;
          }
        }
        setOverDark(anyVisible);
      },
      { rootMargin: "-72px 0px -100% 0px", threshold: 0 },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  /* Phase 10 P1-03 — ESC 키로 모바일 메뉴 닫기 + 화면 크기 lg+ 전환 시 자동 닫기 */
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [mobileOpen]);

  const closeMobile = () => {
    setMobileOpen(false);
    setMobileExpand(null);
  };

  /* Phase 9 P0-02 / 업그레이드 5 — 헤더 다크 일관 톤
     모든 페이지에서 다크 네이비 (blur 12) 유지 — 로고 흰색 invert + 시각 깜빡임 제거
     scrolled 시 opacity만 약간 증가 + shadow */
  const dark = true; // 다크 톤 일관
  void overDark; // 미사용 — 단순화
  const headerStyle: React.CSSProperties = {
    backgroundColor: scrolled
      ? "rgba(11, 26, 51, 0.92)"
      : "rgba(11, 26, 51, 0.72)",
    backdropFilter: "saturate(140%) blur(12px)",
    WebkitBackdropFilter: "saturate(140%) blur(12px)",
    borderBottomColor: scrolled ? "rgba(255,255,255,0.08)" : "transparent",
    boxShadow: scrolled ? "0 4px 16px rgba(11,26,51,0.18)" : "none",
  };

  return (
    <header
      className="site-header sticky top-0 z-50 border-b transition-all duration-200 [transition-timing-function:var(--ease)]"
      style={headerStyle}
      data-scrolled={scrolled || undefined}
      data-over-dark={dark || undefined}
      data-surface={dark ? "dark" : undefined}
    >
      <div className="mx-auto w-full max-w-[1280px] px-5 md:px-8">
        <div className="flex h-[72px] items-center justify-between md:h-20">
          {/* Logo */}
          <Link
            href="/"
            aria-label="(주)케이비개발 KB GROUP 메인으로"
            className="btn-reset flex-shrink-0"
            onClick={closeMobile}
          >
            {/* Phase 11 P0-B — 다크 헤더용 텍스트 로고
                기존 컬러 png는 흰배경 자산이라 다크 헤더에서 흰 박스로 보이는 문제
                → 좌측 골드 액센트 바 + KB GROUP(brand) + (주)케이비개발(legal) 텍스트 마크 */}
            <span className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="inline-block h-8 w-[3px] flex-shrink-0 bg-accent-500 md:h-9"
              />
              <span className="flex flex-col leading-none">
                <span className="font-display text-[18px] font-extrabold tracking-tight text-white md:text-[20px]">
                  KB GROUP
                </span>
                <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-accent-300 md:text-[11px]">
                  (주)케이비개발
                </span>
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden items-center gap-8 lg:flex"
            aria-label="주 메뉴"
          >
            {NAV_ITEMS.map((item) => {
              const hasChildren = !!item.children?.length;
              const isOpen = openDropdown === item.href;
              const active = isActive(item.href);
              return (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() =>
                    hasChildren && setOpenDropdown(item.href)
                  }
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    href={item.href}
                    aria-haspopup={hasChildren || undefined}
                    aria-expanded={hasChildren ? isOpen : undefined}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      /* Phase 14 P1-06 — hover vs active 시각 분리.
                         비액티브 hover 언더라인: 70% 투명도, 액티브: 100% */
                      "group relative inline-flex min-h-11 items-center px-4 py-3 text-[14px] font-medium transition-colors duration-200",
                      "after:absolute after:left-4 after:right-4 after:bottom-1.5 after:h-[3px] after:w-0 after:rounded-full after:bg-accent-500 after:transition-[width,opacity] after:duration-200 after:[transition-timing-function:var(--ease)]",
                      active
                        ? "after:w-[calc(100%-2rem)] after:opacity-100"
                        : "after:opacity-70 hover:after:w-[calc(100%-2rem)]",
                      "text-white/85 hover:text-white",
                    )}
                  >
                    {item.label}
                  </Link>
                  {hasChildren && isOpen && (
                    /* Phase 14-C C-7 — 드롭다운 안정화.
                       pt-1 갭 제거 → mouseleave 깜빡임 차단.
                       링크 하단과 메뉴 사이 invisible bridge로 마우스 이동 안전 */
                    <div className="absolute left-1/2 top-full z-50 -translate-x-1/2">
                      <span aria-hidden="true" className="block h-2 w-full" />
                      <div className="min-w-[220px] rounded-sm border border-white/10 bg-navy-900/95 py-2 shadow-[0_12px_32px_rgba(0,0,0,0.35)] backdrop-blur-md">
                        {item.children!.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block min-h-11 px-5 py-2.5 text-sm font-medium text-white/85 transition-colors duration-200 hover:bg-accent-500/10 hover:text-accent-300"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 lg:flex">
              {isAuthed ? (
                <>
                  <Link
                    href="/mypage"
                    className="inline-flex min-h-11 items-center rounded-sm border border-white/60 px-4 py-2 text-[13px] font-semibold text-white transition-colors duration-200 hover:bg-white hover:text-ink-strong"
                  >
                    마이페이지
                  </Link>
                  <form action="/auth/logout" method="POST">
                    <button
                      type="submit"
                      className="min-h-11 px-2 text-[13px] font-medium text-white/75 transition-colors duration-200 hover:text-white"
                    >
                      로그아웃
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex min-h-11 items-center rounded-sm border border-white/60 px-5 py-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-white transition-colors duration-200 hover:bg-white hover:text-ink-strong"
                >
                  LOGIN
                </Link>
              )}
            </div>
            <button
              type="button"
              aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex h-11 w-11 items-center justify-center text-white transition-colors lg:hidden"
            >
              {mobileOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M6 6L18 18M6 18L18 6" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M4 8H20M4 16H20" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Phase 2.4 — 모바일 풀스크린 오버레이 + stagger 등장 */}
      <div
        id="mobile-menu"
        data-surface="dark"
        className={cn(
          "fixed inset-0 z-40 overflow-y-auto bg-navy-900 transition-opacity duration-300 lg:hidden",
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        aria-hidden={!mobileOpen}
      >
        <div className="h-[72px] md:h-20" />
        <nav
          className="mx-auto w-full max-w-[1280px] px-5 pb-12 pt-4 md:px-8"
          aria-label="모바일 메뉴"
        >
          {NAV_ITEMS.map((item, idx) => {
            const hasChildren = !!item.children?.length;
            const expanded = mobileExpand === item.href;
            const delay = 80 + idx * 60;
            return (
              <div
                key={item.href}
                className="border-b border-white/10"
                style={{
                  opacity: mobileOpen ? 1 : 0,
                  transform: mobileOpen ? "translateY(0)" : "translateY(12px)",
                  transition: `opacity 400ms var(--ease) ${delay}ms, transform 400ms var(--ease) ${delay}ms`,
                }}
              >
                {hasChildren ? (
                  <>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      onClick={() =>
                        setMobileExpand(expanded ? null : item.href)
                      }
                      className="flex w-full items-center justify-between py-5 text-left text-lg font-semibold text-white"
                    >
                      {item.label}
                      <span
                        className={cn(
                          "inline-flex transition-transform duration-300",
                          expanded && "rotate-180",
                        )}
                        aria-hidden="true"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 9L12 15L18 9" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </button>
                    {expanded && (
                      <div className="space-y-1 pb-5 pl-3">
                        {item.children!.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={closeMobile}
                            className="flex min-h-11 items-center text-base text-white/75 transition-colors hover:text-accent-500"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={closeMobile}
                    className="block py-5 text-lg font-semibold text-white transition-colors hover:text-accent-500"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            );
          })}
          <div
            className="space-y-3 pt-8"
            style={{
              opacity: mobileOpen ? 1 : 0,
              transform: mobileOpen ? "translateY(0)" : "translateY(12px)",
              transition: `opacity 400ms var(--ease) ${80 + NAV_ITEMS.length * 60}ms, transform 400ms var(--ease) ${80 + NAV_ITEMS.length * 60}ms`,
            }}
          >
            {isAuthed ? (
              <>
                <Link
                  href="/mypage"
                  onClick={closeMobile}
                  className="block rounded-sm border border-white px-6 py-3 text-center text-base font-semibold text-white transition-colors duration-300 hover:bg-white hover:text-ink-strong"
                >
                  마이페이지
                </Link>
                <form action="/auth/logout" method="POST">
                  <button
                    type="submit"
                    onClick={closeMobile}
                    className="w-full rounded-sm border border-white/30 px-6 py-3 text-center text-base font-medium text-white/80 transition-colors duration-300 hover:border-white hover:text-white"
                  >
                    로그아웃
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                onClick={closeMobile}
                className="block w-full rounded-sm border border-white px-6 py-3 text-center text-base font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-white hover:text-ink-strong"
              >
                LOGIN
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
