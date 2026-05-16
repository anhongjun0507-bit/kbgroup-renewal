import { cn } from "@/lib/cn";

/* Phase 10 P2-05 — 카드 hover 정책 강화
   hoverable=true: translateY(-2px) + shadow-card + border accent-500 + 화살표 translateX(4px) */

type CardProps = {
  children: React.ReactNode;
  hoverable?: boolean;
  className?: string;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "className" | "children">;

export function Card({
  children,
  hoverable = false,
  className,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-md border border-line transition-all duration-200",
        "[transition-timing-function:var(--ease)]",
        hoverable &&
          "group cursor-pointer hover:-translate-y-1 hover:border-accent-500 hover:shadow-[var(--shadow-card)]",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
