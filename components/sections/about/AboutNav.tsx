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
  {
    key: "history",
    korean: "연혁",
    english: "HISTORY",
    href: "/about/history",
  },
  {
    key: "location",
    korean: "오시는 길",
    english: "LOCATION",
    href: "/about/location",
  },
];

export function AboutNav({ current }: Props) {
  return (
    <nav
      aria-label="회사소개 페이지 네비게이션"
      className="sticky top-20 z-30 border-b border-line/40 bg-cream/95 backdrop-blur-sm"
    >
      <Container>
        <ul className="-mx-1 flex items-center gap-8 overflow-x-auto whitespace-nowrap px-1 py-6 lg:gap-12">
          {TABS.map((tab) => {
            const isActive = tab.key === current;
            return (
              <li key={tab.key}>
                <Link
                  href={tab.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group inline-flex flex-col items-start gap-2 transition-colors duration-200",
                    isActive
                      ? "text-primary"
                      : "text-ink-soft hover:text-ink",
                  )}
                >
                  <span className="flex items-baseline gap-2 text-sm font-medium tracking-wide">
                    {tab.korean}
                    <span
                      className={cn(
                        "text-[10px] font-medium uppercase tracking-[0.25em]",
                        isActive ? "text-primary/70" : "text-ink-muted",
                      )}
                    >
                      {tab.english}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "block h-px transition-all duration-300",
                      isActive
                        ? "w-full bg-primary"
                        : "w-0 bg-ink-soft/40 group-hover:w-full",
                    )}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </nav>
  );
}
