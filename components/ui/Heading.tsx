import { cn } from "@/lib/cn";

type HeadingSize = "sm" | "md" | "lg" | "xl";
type HeadingAlign = "left" | "center";
type HeadingTag = "h1" | "h2" | "h3";

type HeadingProps = {
  kicker?: string;
  title: React.ReactNode;
  italicWord?: string;
  subtitle?: string;
  align?: HeadingAlign;
  size?: HeadingSize;
  as?: HeadingTag;
  className?: string;
};

const TITLE_SIZE: Record<HeadingSize, string> = {
  sm: "text-3xl md:text-4xl",
  md: "text-4xl md:text-5xl lg:text-6xl",
  lg: "text-5xl md:text-6xl lg:text-7xl",
  xl: "text-6xl md:text-7xl lg:text-8xl",
};

/**
 * title이 문자열이고 italicWord가 그 안에 있으면 첫 일치 부분만
 * serif italic + primary 컬러로 강조. title이 ReactNode면 그대로 렌더.
 */
function renderTitle(title: React.ReactNode, italicWord?: string) {
  if (typeof title !== "string" || !italicWord) return title;
  const idx = title.indexOf(italicWord);
  if (idx === -1) return title;
  return (
    <>
      {title.slice(0, idx)}
      <em className="serif-em">{italicWord}</em>
      {title.slice(idx + italicWord.length)}
    </>
  );
}

export function Heading({
  kicker,
  title,
  italicWord,
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
        <div>
          <div
            aria-hidden="true"
            className={cn("h-px w-12 bg-primary", isCenter && "mx-auto")}
          />
          <div className="mt-4 text-xs sm:text-sm font-medium uppercase tracking-[0.3em] text-primary">
            {kicker}
          </div>
        </div>
      )}
      <Tag
        className={cn(
          "font-serif font-bold leading-[1.1] tracking-[-0.02em] text-ink",
          TITLE_SIZE[size],
          kicker && "mt-6",
        )}
      >
        {renderTitle(title, italicWord)}
      </Tag>
      {subtitle && (
        <p
          className={cn(
            "mt-6 max-w-xl text-base leading-relaxed text-ink-soft",
            isCenter && "mx-auto",
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
