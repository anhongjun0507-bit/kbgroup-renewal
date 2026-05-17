import { cn } from "@/lib/cn";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "header" | "footer" | "main";
};

export function Container({
  children,
  className,
  as: Tag = "div",
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        /* Phase 14 P2-05 — 모바일 20 / 태블릿 32 / 데스크탑 48 / XL 64 패딩 단계화 */
        "mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12 xl:px-16",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
