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
        "bg-white rounded-2xl border border-line/70 transition-all duration-300 ease-out",
        hoverable &&
          "hover:-translate-y-0.5 hover:border-line hover:shadow-md cursor-pointer",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
