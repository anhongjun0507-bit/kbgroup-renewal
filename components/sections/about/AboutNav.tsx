import Link from "next/link";
import { Container } from "@/components/ui";
import { cn } from "@/lib/cn";

export type AboutNavCurrent = "why" | "ceo" | "history" | "location";

interface Props {
  current: AboutNavCurrent;
}

const TABS: {
  key: AboutNavCurrent;
  korean: string;
  english: string;
  href: string;
}[] = [
  { key: "why", korean: "왜 케이비개발", english: "WHY US", href: "/about" },
  { key: "ceo", korean: "대표 메시지", english: "CEO", href: "/about/ceo" },
  { key: "history", korean: "연혁", english: "HISTORY", href: "/about/history" },
  { key: "location", korean: "오시는 길", english: "LOCATION", href: "/about/location" },
];

/* Phase 4.E.1, 4.E.2 — pill segmented control
   - 모바일: 가로 스크롤 + 스크롤바 숨김 + 좌우 fade mask + scroll-snap
   - 데스크탑: gap 8, active = bg-navy-800 + 흰 텍스트 */
export function AboutNav({ current }: Props) {
  return (
    <nav
      aria-label="회사소개 페이지 네비게이션"
      className="sticky top-[72px] z-30 border-b border-line bg-white/95 backdrop-blur-sm md:top-20"
    >
      <Container>
        <div className="relative">
          {/* 좌우 fade mask (모바일) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-white to-transparent md:hidden"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-white to-transparent md:hidden"
          />

          <ul
            className="flex items-center gap-2 overflow-x-auto py-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-3"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {TABS.map((tab) => {
              const isActive = tab.key === current;
              return (
                <li
                  key={tab.key}
                  className="flex-shrink-0"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <Link
                    href={tab.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "inline-flex items-baseline gap-2 rounded-sm px-4 py-2.5 text-[14px] font-semibold transition-colors duration-200 [transition-timing-function:var(--ease)] md:px-5 md:py-3",
                      isActive
                        ? "bg-navy-800 text-white"
                        : "bg-transparent text-ink hover:bg-gray-100 hover:text-ink-strong",
                    )}
                  >
                    <span>{tab.korean}</span>
                    <span
                      className={cn(
                        "text-[10px] font-medium uppercase tracking-[0.18em]",
                        isActive ? "text-white/65" : "text-ink-faint",
                      )}
                    >
                      {tab.english}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </nav>
  );
}
