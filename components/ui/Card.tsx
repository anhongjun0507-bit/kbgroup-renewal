import { cn } from "@/lib/cn";

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
        "bg-white border border-line transition-all duration-200",
        "[transition-timing-function:var(--ease)]",
        hoverable &&
          "cursor-pointer hover:-translate-y-1 hover:border-ink-strong hover:shadow-[var(--shadow-card)]",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
