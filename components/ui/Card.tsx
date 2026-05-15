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
        "bg-white border border-line/60 rounded-none transition-all duration-500 ease-out",
        hoverable &&
          "hover:-translate-y-1 hover:border-line hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
