"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container } from "@/components/ui";
import type { HistoryEntry, SettingValue } from "@/lib/content";

/* Phase 4.E.5 — 연혁
   좌측 연도 sticky + 우측 세로 타임라인 (점·라인) + 주요 마일스톤에 아이콘
   마일스톤 키워드: 설립/창립/취득/등록/인가/지정/허가/수주 → 아이콘 표시 */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const MONTH_TO_ENGLISH: Record<string, string> = {
  "01": "JAN", "02": "FEB", "03": "MAR", "04": "APR",
  "05": "MAY", "06": "JUN", "07": "JUL", "08": "AUG",
  "09": "SEP", "10": "OCT", "11": "NOV", "12": "DEC",
};

const MILESTONE_KEYWORDS = ["설립", "창립", "취득", "등록", "인가", "지정", "허가", "수주"];

function isMilestone(event: string) {
  return MILESTONE_KEYWORDS.some((kw) => event.includes(kw));
}

type GroupedEntry = { month: string; monthEn: string; event: string };
type HistoryGroup = { year: string; entries: GroupedEntry[] };

function groupByYear(entries: HistoryEntry[]): HistoryGroup[] {
  const groups: Record<string, HistoryGroup> = {};
  for (const entry of entries) {
    const [year, month] = entry.date.split(".");
    if (!groups[year]) groups[year] = { year, entries: [] };
    groups[year].entries.push({
      month,
      monthEn: MONTH_TO_ENGLISH[month] ?? month,
      event: entry.event,
    });
  }
  return Object.values(groups).sort(
    (a, b) => parseInt(b.year, 10) - parseInt(a.year, 10),
  );
}

const MILESTONE_ICON = (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="4" fill="#C9A24B" />
    <circle cx="8" cy="8" r="6.5" stroke="#C9A24B" strokeOpacity="0.3" strokeWidth="1" />
  </svg>
);
const NORMAL_DOT = (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="2.5" fill="#0E1F3A" />
  </svg>
);

export function HistoryTimeline({ history }: { history: SettingValue<"history"> }) {
  const shouldReduce = useReducedMotion() ?? false;
  const groups = groupByYear(history);

  return (
    <section
      aria-labelledby="history-timeline-heading"
      className="section bg-white"
    >
      <Container>
        <div className="mx-auto max-w-5xl">
          {groups.map((group, gi) => (
            <YearBlock
              key={group.year}
              group={group}
              isLast={gi === groups.length - 1}
              shouldReduce={shouldReduce}
            />
          ))}
        </div>
      </Container>

      <span id="history-timeline-heading" className="sr-only">
        우리의 발자취
      </span>
    </section>
  );
}

function YearBlock({
  group,
  isLast,
  shouldReduce,
}: {
  group: HistoryGroup;
  isLast: boolean;
  shouldReduce: boolean;
}) {
  const blockVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.08 } },
  };

  /* Phase 14-D D-3 — initial opacity 0 → 1 (JS-off/지연 환경 invisible 방지).
     16개 history 항목 중 viewport once 0.2 트리거 위 항목이 영구 안 보이던 문제 해소. */
  const itemVariants: Variants = {
    hidden: { opacity: 1, y: shouldReduce ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.5, ease: EASE_OUT_EXPO },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={blockVariants}
      className={
        "grid grid-cols-1 gap-8 border-t border-line py-12 lg:grid-cols-[200px_1fr] lg:gap-12" +
        (isLast ? " border-b" : "")
      }
    >
      {/* 좌측 연도 sticky */}
      <motion.div variants={itemVariants} className="lg:sticky lg:top-32 lg:self-start">
        <span
          aria-hidden="true"
          className="number-display block font-mono-num text-[64px] font-extrabold text-navy-800 lg:text-[80px]"
        >
          {group.year}
        </span>
        <span className="sr-only">{group.year}년</span>
        <p className="mt-2 text-[12px] uppercase tracking-[0.18em] text-ink-faint">
          {group.entries.length} milestones
        </p>
      </motion.div>

      {/* 우측 타임라인 */}
      <ul className="relative ml-2 border-l border-line pl-8 lg:ml-0">
        {group.entries.map((entry, ei) => {
          const milestone = isMilestone(entry.event);
          return (
            <motion.li
              key={ei}
              variants={itemVariants}
              className="relative grid grid-cols-12 items-baseline gap-4 py-4 first:pt-0"
            >
              {/* 타임라인 점 */}
              <span
                aria-hidden="true"
                className="absolute -left-[42px] top-5 inline-block h-4 w-4"
              >
                {milestone ? MILESTONE_ICON : NORMAL_DOT}
              </span>

              <span className="col-span-3 text-[12px] font-medium uppercase tracking-[0.2em] text-ink-faint md:col-span-2">
                {entry.monthEn}
              </span>
              <p
                className={
                  "col-span-9 text-[15px] leading-[1.75] md:col-span-10 md:text-[16px] " +
                  (milestone
                    ? "font-semibold text-ink-strong"
                    : "text-ink-muted")
                }
              >
                {entry.event}
              </p>
            </motion.li>
          );
        })}
      </ul>
    </motion.div>
  );
}
