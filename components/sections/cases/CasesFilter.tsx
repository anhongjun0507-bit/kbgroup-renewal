"use client";

import { Container } from "@/components/ui";
import { cn } from "@/lib/cn";

export type CasesFilterValue = "ALL" | "LH" | "민간";

interface Props {
  current: CasesFilterValue;
  onChange: (value: CasesFilterValue) => void;
  counts: Record<CasesFilterValue, number>;
}

const OPTIONS: { value: CasesFilterValue; label: string }[] = [
  { value: "ALL", label: "ALL" },
  { value: "LH", label: "LH 발주" },
  { value: "민간", label: "민간" },
];

export function CasesFilter({ current, onChange, counts }: Props) {
  return (
    <div className="sticky top-20 z-30 border-b border-line/40 bg-cream/95 backdrop-blur-sm">
      <Container>
        <div
          role="tablist"
          aria-label="단지 필터"
          className="-mx-1 flex items-center gap-3 overflow-x-auto whitespace-nowrap px-1 py-5"
        >
          {OPTIONS.map((opt) => {
            const isActive = current === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onChange(opt.value)}
                className={cn(
                  "inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.2em] transition-all duration-300 ease-out",
                  isActive
                    ? "bg-primary text-cream"
                    : "border border-line text-ink hover:-translate-y-0.5 hover:border-primary",
                )}
              >
                {opt.label}
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    isActive ? "text-cream/70" : "text-ink-muted",
                  )}
                >
                  {counts[opt.value]}
                </span>
              </button>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
