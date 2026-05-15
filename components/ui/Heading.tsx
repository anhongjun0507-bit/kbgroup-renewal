import { cn } from "@/lib/cn";

type HeadingSize = "sm" | "md" | "lg" | "xl";
type HeadingAlign = "left" | "center";
type HeadingTag = "h1" | "h2" | "h3";

type HeadingProps = {
  kicker?: string;
  title: React.ReactNode;
  /** title이 string이고 이 단어를 포함하면 primary 컬러로 강조 (serif 사용 X) */
  italicWord?: string;
  subtitle?: string;
  align?: HeadingAlign;
  size?: HeadingSize;
  as?: HeadingTag;
  className?: string;
};

const TITLE_SIZE: Record<HeadingSize, string> = {
  sm: "text-[22px] md:text-[26px]",
  md: "text-[28px] md:text-[36px] lg:text-[42px]",
  lg: "text-[34px] md:text-[44px] lg:text-[54px]",
  xl: "text-[42px] md:text-[56px] lg:text-[68px]",
};

const SUBTITLE_SIZE: Record<HeadingSize, string> = {
  sm: "text-sm md:text-base",
  md: "text-base md:text-lg",
  lg: "text-base md:text-lg lg:text-xl",
  xl: "text-lg md:text-xl",
};

/** italicWord를 만나면 primary 컬러로 색 강조 (이탤릭 X — 모던 톤) */
function renderTitle(title: React.ReactNode, italicWord?: string) {
  if (typeof title !== "string" || !italicWord) return title;
  const idx = title.indexOf(italicWord);
  if (idx === -1) return title;
  return (
    <>
      {title.slice(0, idx)}
      <span className="text-primary">{italicWord}</span>
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
        <div
          className={cn(
            "inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary",
          )}
        >
          {kicker}
        </div>
      )}
      <Tag
        className={cn(
          "font-bold leading-[1.2] tracking-[-0.025em] text-ink-strong",
          TITLE_SIZE[size],
          kicker && "mt-4",
        )}
      >
        {renderTitle(title, italicWord)}
      </Tag>
      {subtitle && (
        <p
          className={cn(
            "mt-4 max-w-2xl leading-relaxed text-ink",
            SUBTITLE_SIZE[size],
            isCenter && "mx-auto",
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
