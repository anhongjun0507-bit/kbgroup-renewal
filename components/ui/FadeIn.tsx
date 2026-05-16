"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type FadeInProps = {
  children: React.ReactNode;
  className?: string;
  /** ms 단위 delay — stagger 용 */
  delay?: number;
  /** 등장 거리(px) — 기본 16 */
  distance?: number;
  /** 등장 duration(ms) — 기본 600 */
  duration?: number;
  /** rootMargin — 기본 -64px (조금 일찍 트리거) */
  rootMargin?: string;
  as?: "div" | "section" | "article" | "li" | "span";
};

export function FadeIn({
  children,
  className,
  delay = 0,
  distance = 16,
  duration = 600,
  rootMargin = "0px 0px -64px 0px",
  as: Tag = "div",
}: FadeInProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // prefers-reduced-motion 존중 — 즉시 표시
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin, threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return (
    <Tag
      ref={(el: HTMLElement | null) => {
        ref.current = el;
      }}
      className={cn("will-change-[transform,opacity]", className)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : `translateY(${distance}px)`,
        transition: `opacity ${duration}ms var(--ease), transform ${duration}ms var(--ease)`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}
