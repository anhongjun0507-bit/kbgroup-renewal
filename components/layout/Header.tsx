"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import { businessAreas } from "@/data/site-content";

interface HeaderProps {
  isAuthed?: boolean;
}

type NavChild = { label: string; href: string };
type NavItem = { label: string; href: string; children?: NavChild[] };

const NAV_ITEMS: NavItem[] = [
  { label: "왜 케이비개발", href: "/about" },
  {
    label: "사업영역",
    href: "/business",
    children: businessAreas.map((b) => ({
      label: b.name,
      href: `/business/${b.slug}`,
    })),
  },
  { label: "실적", href: "/cases" },
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
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpand, setMobileExpand] = useState<string | null>(null);

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
        "sticky top-0 z-50 transition-all duration-300 ease-out",
        scrolled
          ? "bg-cream/95 backdrop-blur-md border-b border-line/40"
          : "bg-transparent border-b border-transparent",
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            aria-label="KB GROUP 메인으로"
            className="flex-shrink-0"
            onClick={closeMobile}
          >
            <span className="inline-block bg-primary px-3 py-2 font-serif text-sm font-bold uppercase tracking-[0.15em] text-white">
              KB GROUP
            </span>
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden items-center gap-10 lg:flex"
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
                    className="group relative inline-flex items-center py-2 text-sm font-medium tracking-wide text-ink transition-colors duration-200 hover:text-primary"
                  >
                    {item.label}
                    <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
                  </Link>
                  {hasChildren && isOpen && (
                    <div className="absolute left-1/2 top-full -translate-x-1/2 pt-4">
                      <div className="min-w-[200px] border border-line/60 bg-white py-2 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)]">
                        {item.children!.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-5 py-2.5 text-sm text-ink-soft transition-colors duration-200 hover:bg-cream hover:text-primary"
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
                    className="text-sm font-medium text-ink transition-colors duration-200 hover:text-primary"
                  >
                    마이페이지
                  </Link>
                  <form action="/auth/logout" method="POST">
                    <button
                      type="submit"
                      className="border border-line px-5 py-2.5 text-sm font-medium text-ink-soft transition-colors duration-300 hover:border-ink hover:text-ink"
                    >
                      로그아웃
                    </button>
                  </form>
                </>
              ) : (
                <Button as="link" href="/login" variant="outline" size="sm">
                  LOGIN
                </Button>
              )}
            </div>
            <button
              type="button"
              aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center text-ink transition-colors hover:text-primary lg:hidden"
            >
              {mobileOpen ? (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path d="M6 6L18 18M6 18L18 6" strokeLinecap="round" />
                </svg>
              ) : (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
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
          className="fixed inset-x-0 bottom-0 top-20 z-40 overflow-y-auto bg-cream lg:hidden"
        >
          <nav
            className="mx-auto w-full max-w-7xl px-6 py-8"
            aria-label="모바일 메뉴"
          >
            {NAV_ITEMS.map((item) => {
              const hasChildren = !!item.children?.length;
              const expanded = mobileExpand === item.href;
              return (
                <div key={item.href} className="border-b border-line/40">
                  {hasChildren ? (
                    <>
                      <button
                        type="button"
                        aria-expanded={expanded}
                        onClick={() =>
                          setMobileExpand(expanded ? null : item.href)
                        }
                        className="flex w-full items-center justify-between py-5 text-left text-lg font-medium text-ink"
                      >
                        {item.label}
                        <span
                          className={cn(
                            "inline-flex transition-transform duration-300",
                            expanded && "rotate-180",
                          )}
                          aria-hidden="true"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              d="M6 9L12 15L18 9"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </button>
                      {expanded && (
                        <div className="space-y-4 pb-5 pl-4">
                          {item.children!.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={closeMobile}
                              className="block text-base text-ink-soft transition-colors hover:text-primary"
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
                      className="block py-5 text-lg font-medium text-ink transition-colors hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              );
            })}
            <div className="space-y-3 pt-10">
              {isAuthed ? (
                <>
                  <Link
                    href="/mypage"
                    onClick={closeMobile}
                    className="block border border-primary px-6 py-3 text-center text-base font-medium text-primary transition-colors duration-300 hover:bg-primary hover:text-white"
                  >
                    마이페이지
                  </Link>
                  <form action="/auth/logout" method="POST">
                    <button
                      type="submit"
                      onClick={closeMobile}
                      className="w-full border border-line px-6 py-3 text-center text-base font-medium text-ink-soft transition-colors duration-300 hover:border-ink hover:text-ink"
                    >
                      로그아웃
                    </button>
                  </form>
                </>
              ) : (
                <Button
                  as="link"
                  href="/login"
                  variant="outline"
                  size="md"
                  className="w-full"
                  onClick={closeMobile}
                >
                  LOGIN
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
