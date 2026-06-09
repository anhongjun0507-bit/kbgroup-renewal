"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutGroup, motion, MotionConfig } from "framer-motion";
import { cn } from "@/lib/cn";
import { businessAreas } from "@/data/site-content";

type NavChild = { label: string; href: string };

interface HeaderProps {
  isAuthed?: boolean;
  isAdmin?: boolean;
}

type NavItem = {
  label: string;
  krLabel: string;
  href: string;
  children?: NavChild[];
};

/* Phase 15 — 스크롤에 따라 헤더가 2단(가운데 정렬) ↔ 1단(좌 로고/우 메뉴)으로 변형.
   framer-motion layout으로 로고·메뉴 위치 보간 → 자연스러운 FLIP 애니메이션. */
const NAV_ITEMS: NavItem[] = [
  { label: "ABOUT", krLabel: "회사소개", href: "/about" },
  {
    label: "BUSINESS",
    krLabel: "사업영역",
    href: "/business",
    children: businessAreas.map((b) => ({
      label: b.name,
      href: `/business/${b.slug}`,
    })),
  },
  { label: "PROJECTS", krLabel: "관리현황", href: "/cases" },
  { label: "LICENSES", krLabel: "인허가", href: "/licenses" },
  {
    label: "CAREERS",
    krLabel: "채용",
    href: "/careers",
    // 호버 시 "KB 인재채용" 단일 항목 → 현재 채용 중인 공고 목록으로 이동
    children: [{ label: "KB 인재채용", href: "/careers/openings" }],
  },
  {
    label: "NEWS",
    krLabel: "소식",
    href: "/notices",
    children: [
      { label: "공지사항", href: "/notices" },
      { label: "자유게시판", href: "/notices/board" },
      { label: "갤러리", href: "/notices/gallery" },
      { label: "단지소식", href: "/notices/news" },
      { label: "자료실", href: "/notices/resources" },
    ],
  },
];

const LAYOUT_TX = { duration: 0.45, ease: [0.4, 0, 0.2, 1] as const };

function KBLogoMark({
  size = "md",
  tone = "onDark",
}: {
  size?: "sm" | "md" | "lg";
  tone?: "onDark" | "onLight";
}) {
  const main = size === "sm" ? 17 : size === "lg" ? 28 : 22;
  const sub = size === "sm" ? 8.5 : size === "lg" ? 11.5 : 10;
  const gap = size === "sm" ? 3 : 5;
  const onLight = tone === "onLight";
  /* 어두운 배경(투명 헤더, 히어로 위) → 골드 + 그림자.
     밝은 배경(화이트 헤더) → 네이비 워드마크 + 딥골드 서브 (대비 확보). */
  const shadow = onLight ? "none" : "0 2px 12px rgba(0,0,0,0.55)";
  return (
    <div className="flex flex-col items-center leading-none">
      <span
        className={cn(
          "font-display font-bold tracking-tight",
          onLight ? "text-navy-900" : "text-accent-300",
        )}
        style={{ fontSize: main, textShadow: shadow }}
      >
        (주)케이비개발
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "block h-px w-[72%]",
          onLight ? "bg-accent-deep/40" : "bg-accent-300/55",
        )}
        style={{ marginTop: gap, marginBottom: gap }}
      />
      <span
        className={cn(
          "font-medium uppercase",
          onLight ? "text-accent-deep" : "text-accent-300",
        )}
        style={{ fontSize: sub, letterSpacing: "0.4em", textShadow: shadow }}
      >
        KB GROUP
      </span>
    </div>
  );
}

export function Header({ isAuthed = false, isAdmin = false }: HeaderProps) {
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpand, setMobileExpand] = useState<string | null>(null);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  useEffect(() => {
    if (!isHomepage) {
      setScrolled(true);
      return;
    }
    /* rAF 스로틀 + 히스테리시스: 80px 넘으면 컴팩트, 24px 아래로 돌아오면 복귀.
       임계값을 단일 지점이 아닌 데드존으로 두어 경계 근처 떨림(깜빡임)을 차단. */
    let raf = 0;
    const evaluate = () => {
      raf = 0;
      const y = window.scrollY;
      setScrolled((prev) => {
        if (!prev && y > 80) return true;
        if (prev && y < 24) return false;
        return prev;
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(evaluate);
    };
    evaluate();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isHomepage]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

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

  /* 호버 / 스크롤 / 다른 페이지 → 솔리드. 그 외 완전 투명. */
  const solid = scrolled || hovered || !isHomepage;
  /* compact = 1단 레이아웃 (스크롤 후 또는 다른 페이지). 그 외 2단. */
  const compact = scrolled || !isHomepage;
  /* 솔리드 = 밝은(화이트) 바 → 본문/로고를 다크 톤으로.
     투명(히어로 위) = 어두운 배경 → 화이트/골드 톤. */
  const onLight = solid;

  const headerStyle: React.CSSProperties = {
    backgroundColor: solid ? "rgba(255,255,255,0.92)" : "transparent",
    backdropFilter: solid ? "saturate(180%) blur(12px)" : "none",
    WebkitBackdropFilter: solid ? "saturate(180%) blur(12px)" : "none",
    borderBottomColor: solid ? "rgba(11,26,51,0.08)" : "transparent",
    boxShadow: solid ? "0 4px 20px rgba(11,26,51,0.06)" : "none",
    transition:
      "background-color 300ms cubic-bezier(0.4,0,0.2,1), border-color 300ms ease, box-shadow 300ms ease",
  };

  const renderNavItem = (item: NavItem) => {
    const hasChildren = !!item.children?.length;
    const isOpen = openDropdown === item.href;
    const active = isActive(item.href);
    return (
      <div
        key={item.href}
        className="relative"
        onMouseEnter={() => hasChildren && setOpenDropdown(item.href)}
        onMouseLeave={() => setOpenDropdown(null)}
      >
        <Link
          href={item.href}
          aria-label={`${item.krLabel} — ${item.label}`}
          aria-haspopup={hasChildren || undefined}
          aria-expanded={hasChildren ? isOpen : undefined}
          aria-current={active ? "page" : undefined}
          className={cn(
            "group relative inline-flex min-h-10 items-center px-3 py-2 text-[16px] font-semibold transition-colors duration-200",
            "after:absolute after:left-3 after:right-3 after:bottom-0 after:h-[2px] after:w-0 after:rounded-full after:bg-accent-500 after:transition-[width,opacity] after:duration-200 after:[transition-timing-function:var(--ease)]",
            active
              ? "after:w-[calc(100%-1.5rem)] after:opacity-100"
              : "after:opacity-70 hover:after:w-[calc(100%-1.5rem)]",
            onLight
              ? active
                ? "text-ink-strong"
                : "text-ink-muted hover:text-ink-strong"
              : active
                ? "text-white"
                : "text-white/85 hover:text-white",
          )}
          style={{ letterSpacing: "0.01em" }}
        >
          {item.krLabel}
        </Link>
        {hasChildren && isOpen && (
          <div className="absolute left-1/2 top-full z-50 -translate-x-1/2">
            <span aria-hidden="true" className="block h-2 w-full" />
            <div className="min-w-[220px] rounded-md border border-line bg-white py-2 shadow-[0_12px_32px_rgba(11,26,51,0.14)]">
              {item.children!.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className="block min-h-11 px-5 py-2.5 text-[15px] font-medium text-ink-muted transition-colors duration-200 hover:bg-accent-50 hover:text-accent-deep"
                >
                  {child.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <MotionConfig transition={LAYOUT_TX}>
      <header
        className="site-header fixed inset-x-0 top-0 z-50 border-b"
        style={headerStyle}
        data-scrolled={scrolled || undefined}
        data-surface={solid ? undefined : "dark"}
        onMouseEnter={() => isHomepage && setHovered(true)}
        onMouseLeave={() => isHomepage && setHovered(false)}
      >
        <div className="mx-auto w-full max-w-[1400px] px-5 md:px-8">
          {/* Mobile (lg 미만) — 항상 1단 / 햄버거 + 가운데 로고. 고정 높이 h-16(64px). */}
          <div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center lg:hidden">
            <button
              type="button"
              aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen((v) => !v)}
              className={cn(
                "inline-flex h-11 w-11 items-center justify-center transition-colors",
                onLight ? "text-ink-strong" : "text-white",
              )}
            >
              {mobileOpen ? (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M6 6L18 18M6 18L18 6" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M4 8H20M4 16H20" strokeLinecap="round" />
                </svg>
              )}
            </button>
            <Link
              href="/"
              aria-label="(주)케이비개발 KB GROUP 메인으로"
              className="btn-reset flex-shrink-0 justify-self-center"
              onClick={closeMobile}
            >
              <KBLogoMark size="sm" tone={onLight ? "onLight" : "onDark"} />
            </Link>
            <div />
          </div>

          {/* Desktop (lg+) — compact 시 1단 (좌 로고 / 가운데 메뉴)
              그 외 2단 (가운데 로고 / 가운데 메뉴). LOGIN은 항상 우측 absolute 고정. */}
          <div className="relative hidden lg:block">
            <LayoutGroup>
              <motion.div
                layout
                transition={LAYOUT_TX}
                className={cn(
                  "flex items-center",
                  compact
                    ? "h-[72px] flex-row gap-6"
                    : "flex-col gap-3 pt-5 pb-4",
                )}
              >
                <motion.div layout transition={LAYOUT_TX}>
                  <Link
                    href="/"
                    aria-label="(주)케이비개발 KB GROUP 메인으로"
                    className="btn-reset"
                    onClick={closeMobile}
                  >
                    <KBLogoMark
                      size={compact ? "sm" : "lg"}
                      tone={onLight ? "onLight" : "onDark"}
                    />
                  </Link>
                </motion.div>

                <motion.nav
                  layout
                  transition={LAYOUT_TX}
                  className={cn(
                    "flex items-center gap-3 xl:gap-5",
                    compact ? "mx-auto" : "",
                  )}
                  aria-label="주 메뉴"
                >
                  {NAV_ITEMS.map(renderNavItem)}
                </motion.nav>
              </motion.div>
            </LayoutGroup>

            {/* LOGIN — 헤더 우측 세로 가운데 absolute (모핑 영향 X) */}
            <div className="pointer-events-none absolute right-0 top-0 flex h-full items-center gap-1">
              {isAdmin && (
                <div className="pointer-events-auto">
                  <Link
                    href="/admin"
                    aria-label="ADMIN — 관리자 페이지"
                    className={cn(
                      "inline-flex min-h-9 items-center px-2.5 text-[14px] font-semibold uppercase transition-colors duration-200",
                      onLight
                        ? "text-accent-deep hover:text-accent-ink"
                        : "text-accent-300 hover:text-accent-200",
                    )}
                    style={{ letterSpacing: "0.16em" }}
                  >
                    ADMIN
                  </Link>
                </div>
              )}
              <div className="pointer-events-auto">
                {isAuthed ? (
                  <Link
                    href="/mypage"
                    aria-label="MY PAGE — 마이페이지"
                    className={cn(
                      "inline-flex min-h-9 items-center px-2.5 text-[14px] font-semibold uppercase transition-colors duration-200",
                      onLight
                        ? "text-ink-muted hover:text-ink-strong"
                        : "text-white/85 hover:text-white",
                    )}
                    style={{ letterSpacing: "0.16em" }}
                  >
                    MY PAGE
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className={cn(
                      "inline-flex min-h-9 items-center px-2.5 text-[14px] font-semibold uppercase transition-colors duration-200",
                      onLight
                        ? "text-ink-muted hover:text-ink-strong"
                        : "text-white/85 hover:text-white",
                    )}
                    style={{ letterSpacing: "0.16em" }}
                  >
                    LOGIN
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 모바일 풀스크린 오버레이 */}
      <div
        id="mobile-menu"
        data-surface="dark"
        className={cn(
          "fixed inset-0 z-[60] overflow-y-auto bg-[#0A0908] transition-opacity duration-200 lg:hidden",
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        aria-hidden={!mobileOpen}
      >
        <div className="sticky top-0 z-10 border-b border-white/10 bg-[#0A0908]">
          <div className="mx-auto grid grid-cols-[1fr_auto_1fr] items-center px-5 pt-4 pb-3 md:px-8 md:pt-5">
            <div />
            <Link
              href="/"
              aria-label="(주)케이비개발 KB GROUP 메인으로"
              className="btn-reset flex-shrink-0 justify-self-center"
              onClick={closeMobile}
            >
              <KBLogoMark size="sm" />
            </Link>
            <button
              type="button"
              aria-label="메뉴 닫기"
              onClick={() => setMobileOpen(false)}
              className="btn-reset inline-flex h-11 w-11 items-center justify-center justify-self-end text-white"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 6L18 18M6 18L18 6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
        <nav
          className="mx-auto w-full max-w-[1400px] px-5 pb-12 pt-4 md:px-8"
          aria-label="모바일 메뉴"
        >
          {NAV_ITEMS.map((item) => {
            const hasChildren = !!item.children?.length;
            const expanded = mobileExpand === item.href;
            return (
              <div key={item.href} className="border-b border-white/10">
                {hasChildren ? (
                  <>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-label={`${item.label} — ${item.krLabel}`}
                      onClick={() =>
                        setMobileExpand(expanded ? null : item.href)
                      }
                      className="flex w-full items-center justify-between py-5 text-left"
                    >
                      <span className="flex flex-col">
                        <span
                          className="text-[22px] font-bold text-white"
                          style={{ letterSpacing: "0.01em" }}
                        >
                          {item.krLabel}
                        </span>
                        <span
                          className="mt-1 text-[11px] uppercase text-white/50"
                          style={{ letterSpacing: "0.16em" }}
                        >
                          {item.label}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "inline-flex h-5 w-5 items-center justify-center transition-transform duration-300 [transform-origin:center]",
                          expanded && "rotate-180",
                        )}
                        aria-hidden="true"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                            className="btn-reset flex min-h-11 items-center text-base text-white/75 transition-colors hover:text-accent-300"
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
                    aria-label={`${item.label} — ${item.krLabel}`}
                    onClick={closeMobile}
                    className="btn-reset block py-5 transition-colors hover:text-accent-300"
                  >
                    <span className="flex flex-col">
                      <span
                        className="text-[22px] font-bold text-white"
                        style={{ letterSpacing: "0.01em" }}
                      >
                        {item.krLabel}
                      </span>
                      <span
                        className="mt-1 text-[11px] uppercase text-white/50"
                        style={{ letterSpacing: "0.16em" }}
                      >
                        {item.label}
                      </span>
                    </span>
                  </Link>
                )}
              </div>
            );
          })}
          <div className="space-y-3 pt-8">
            {isAuthed ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={closeMobile}
                    className="block rounded-sm border border-accent-500 bg-accent-500/10 px-6 py-3 text-center text-base font-semibold uppercase text-accent-300 transition-colors duration-300 hover:bg-accent-500 hover:text-navy-900"
                    style={{ letterSpacing: "0.12em" }}
                  >
                    ADMIN
                  </Link>
                )}
                <Link
                  href="/mypage"
                  onClick={closeMobile}
                  className="block rounded-sm border border-white px-6 py-3 text-center text-base font-semibold uppercase text-white transition-colors duration-300 hover:bg-white hover:text-ink-strong"
                  style={{ letterSpacing: "0.12em" }}
                >
                  MY PAGE
                </Link>
                <form action="/auth/logout" method="POST">
                  <button
                    type="submit"
                    onClick={closeMobile}
                    className="w-full rounded-sm border border-white/30 px-6 py-3 text-center text-base font-medium uppercase text-white/80 transition-colors duration-300 hover:border-white hover:text-white"
                    style={{ letterSpacing: "0.1em" }}
                  >
                    LOGOUT
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                onClick={closeMobile}
                className="block w-full rounded-sm border border-white px-6 py-3 text-center text-base font-semibold uppercase text-white transition-colors hover:bg-white hover:text-ink-strong"
                style={{ letterSpacing: "0.12em" }}
              >
                LOGIN
              </Link>
            )}
          </div>
        </nav>
      </div>
    </MotionConfig>
  );
}
