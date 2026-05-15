import { cn } from "@/lib/cn";

type HeadingSize = "sm" | "md" | "lg" | "xl";
type HeadingAlign = "left" | "center";
type HeadingTag = "h1" | "h2" | "h3";

type HeadingProps = {
  kicker?: string;
  title: React.ReactNode;
  /** 호환용 — 표시 시각엔 영향 없음 (모노톤) */
  italicWord?: string;
  subtitle?: string;
  align?: HeadingAlign;
  size?: HeadingSize;
  as?: HeadingTag;
  className?: string;
};

const TITLE_SIZE: Record<HeadingSize, string> = {
  sm: "text-[22px] md:text-[26px]",
  md: "text-[28px] md:text-[34px] lg:text-[40px]",
  lg: "text-[32px] md:text-[42px] lg:text-[52px]",
  xl: "text-[40px] md:text-[56px] lg:text-[72px]",
};

function renderTitle(title: React.ReactNode) {
  return title;
}

export function Heading({
  kicker,
  title,
  subtitle,
  align = "left",
  size = "md",
  as: Tag = "h2",
  className,
}: HeadingProps) {
  const isCenter = align === "center";
  return (
    <div className={cn(isCenter ? "text-center" : "text-left", className)}>
      {kicker && (
        <p className="text-[13px] font-medium tracking-wide text-ink-muted">
          {kicker}
        </p>
      )}
      <Tag
        className={cn(
          "font-bold tracking-tight text-ink-strong",
          TITLE_SIZE[size],
          kicker && "mt-3",
        )}
      >
        {renderTitle(title)}
      </Tag>
      {subtitle && (
        <p
          className={cn(
            "mt-4 max-w-2xl leading-relaxed text-ink-muted",
            isCenter && "mx-auto",
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
