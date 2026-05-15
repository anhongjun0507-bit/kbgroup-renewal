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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpand, setMobileExpand] = useState<string | null>(null);

  /** href와 현재 pathname이 일치(또는 sub) 하면 활성 메뉴 */
  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMobile = () => {
    setMobileOpen(false);
    setMobileExpand(null);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-white transition-shadow duration-300 ease-out",
        scrolled ? "border-b border-line shadow-sm" : "border-b border-line/0",
      )}
    >
      <div className="mx-auto w-full max-w-[1320px] px-6 sm:px-8 lg:px-10">
        <div className="flex h-[72px] items-center justify-between md:h-[76px]">
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
              className="h-9 w-auto md:h-10"
            />
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden items-center gap-9 lg:flex"
            aria-label="주 메뉴"
          >
            {NAV_ITEMS.map((item) => {
              const hasChildren = !!item.children?.length;
              const isOpen = openDropdown === item.href;
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
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "relative inline-flex items-center py-3 text-[14px] transition-colors duration-200",
                      isActive(item.href)
                        ? "font-bold text-ink-strong after:absolute after:inset-x-0 after:-bottom-px after:h-[2px] after:bg-primary"
                        : "font-medium text-ink hover:text-ink-strong",
                    )}
                  >
                    {item.label}
                  </Link>
                  {hasChildren && isOpen && (
                    <div className="absolute left-1/2 top-full -translate-x-1/2 pt-1">
                      <div className="min-w-[200px] border border-line bg-white py-2">
                        {item.children!.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-5 py-2.5 text-sm font-medium text-ink-muted transition-colors duration-200 hover:bg-bg-soft hover:text-primary"
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
            <div className="hidden items-center gap-5 lg:flex">
              {isAuthed ? (
                <>
                  <Link
                    href="/mypage"
                    className="text-[14px] font-medium text-ink-muted transition-colors duration-200 hover:text-primary"
                  >
                    마이페이지
                  </Link>
                  <form action="/auth/logout" method="POST">
                    <button
                      type="submit"
                      className="text-[14px] font-medium text-ink-muted transition-colors duration-200 hover:text-primary"
                    >
                      로그아웃
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/login"
                  className="text-[14px] font-medium text-ink-muted transition-colors duration-200 hover:text-primary"
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
              className="inline-flex h-10 w-10 items-center justify-center text-ink-strong transition-colors hover:text-primary lg:hidden"
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

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 bottom-0 top-[72px] z-40 overflow-y-auto bg-white md:top-[76px] lg:hidden"
        >
          <nav
            className="mx-auto w-full max-w-[1400px] px-5 py-8"
            aria-label="모바일 메뉴"
          >
            {NAV_ITEMS.map((item) => {
              const hasChildren = !!item.children?.length;
              const expanded = mobileExpand === item.href;
              return (
                <div key={item.href} className="border-b border-line">
                  {hasChildren ? (
                    <>
                      <button
                        type="button"
                        aria-expanded={expanded}
                        onClick={() =>
                          setMobileExpand(expanded ? null : item.href)
                        }
                        className="flex w-full items-center justify-between py-5 text-left text-lg font-medium text-ink-strong"
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
                              className="block text-base text-ink-muted transition-colors hover:text-primary"
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
                      className="block py-5 text-lg font-medium text-ink-strong transition-colors hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              );
            })}
            <div className="space-y-3 pt-8">
              {isAuthed ? (
                <>
                  <Link
                    href="/mypage"
                    onClick={closeMobile}
                    className="block border border-ink-strong px-6 py-3 text-center text-base font-medium text-ink-strong transition-colors duration-300 hover:bg-ink-strong hover:text-white"
                  >
                    마이페이지
                  </Link>
                  <form action="/auth/logout" method="POST">
                    <button
                      type="submit"
                      onClick={closeMobile}
                      className="w-full border border-line px-6 py-3 text-center text-base font-medium text-ink-muted transition-colors duration-300 hover:border-ink-strong hover:text-ink-strong"
                    >
                      로그아웃
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={closeMobile}
                  className="block w-full border border-ink-strong px-6 py-3 text-center text-base font-medium text-ink-strong transition-colors hover:bg-ink-strong hover:text-white"
                >
                  LOGIN
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
