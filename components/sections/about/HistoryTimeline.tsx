"use client";

import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Container } from "@/components/ui";
import { history, type HistoryEntry } from "@/data/site-content";
import { cn } from "@/lib/cn";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const MONTH_TO_ENGLISH: Record<string, string> = {
  "01": "JAN",
  "02": "FEB",
  "03": "MAR",
  "04": "APR",
  "05": "MAY",
  "06": "JUN",
  "07": "JUL",
  "08": "AUG",
  "09": "SEP",
  "10": "OCT",
  "11": "NOV",
  "12": "DEC",
};

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
    (a, b) => parseInt(a.year, 10) - parseInt(b.year, 10),
  );
}

export function HistoryTimeline() {
  const shouldReduce = useReducedMotion() ?? false;
  const groups = groupByYear(history);

  return (
    <section
      aria-labelledby="history-timeline-heading"
      className="bg-cream py-32 md:py-40"
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
    visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.1 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.7, ease: EASE_OUT_EXPO },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={blockVariants}
      className={cn(
        "grid grid-cols-1 gap-6 border-t border-line pb-12 pt-12 lg:grid-cols-12 lg:gap-8",
        isLast && "border-b",
      )}
    >
      <motion.div variants={itemVariants} className="lg:col-span-3">
        <span
          aria-hidden="true"
          className="block font-serif text-5xl font-bold italic leading-none tracking-[-0.02em] text-primary md:text-6xl lg:text-7xl"
        >
          {group.year}
        </span>
        <span className="sr-only">{group.year}년</span>
      </motion.div>

      <ul className="lg:col-span-9">
        {group.entries.map((entry, ei) => (
          <motion.li
            key={ei}
            variants={itemVariants}
            className="grid grid-cols-12 items-baseline gap-4 py-3"
          >
            <span
              aria-hidden="true"
              className="col-span-2 text-xs font-medium uppercase tracking-[0.2em] text-ink-muted"
            >
              {entry.monthEn}
            </span>
            <span className="col-span-10 text-base leading-relaxed text-ink md:text-lg">
              {entry.event}
            </span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
