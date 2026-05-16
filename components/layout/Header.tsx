"use client";

import Link from "next/link";
import Image from "next/image";
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
            className="flex-shrink-0"
            onClick={closeMobile}
          >
            <Image
              src="/logo.png"
              alt="(주)케이비개발 KB DEVELOPMENT"
              width={2117}
              height={743}
              priority
              className="h-9 w-auto brightness-0 invert md:h-11"
            />
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
                      /* Phase 9 P1-02 — 클릭 영역 ≥44px (min-h-11 + px-3) */
                      "group relative inline-flex min-h-11 items-center px-3 py-3 text-[14px] font-medium transition-colors duration-200",
                      "after:absolute after:left-3 after:right-3 after:bottom-2 after:h-[2px] after:w-0 after:bg-accent-500 after:transition-[width] after:duration-200 after:[transition-timing-function:var(--ease)] hover:after:w-[calc(100%-1.5rem)]",
                      active && "after:w-[calc(100%-1.5rem)]",
                      "text-white/85 hover:text-white",
                    )}
                  >
                    {item.label}
                  </Link>
                  {hasChildren && isOpen && (
                    <div className="absolute left-1/2 top-full -translate-x-1/2 pt-1">
                      <div className="min-w-[200px] rounded-sm border border-white/10 bg-navy-900/95 py-2 shadow-md backdrop-blur-md">
                        {item.children!.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block min-h-11 px-5 py-2.5 text-sm font-medium text-white/75 transition-colors duration-200 hover:bg-white/10 hover:text-white"
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
                      <div className="space-y-3 pb-5 pl-3">
                        {item.children!.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={closeMobile}
                            className="block text-base text-white/70 transition-colors hover:text-accent-500"
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
