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
        "bg-white border border-line transition-colors duration-300 ease-out",
        hoverable && "hover:border-ink-strong cursor-pointer",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
