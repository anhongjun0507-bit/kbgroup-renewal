import { Fragment, type ReactNode } from "react";
import { FadeIn } from "@/components/ui";
import type { PageKey, SectionRenderers } from "./meta";
import { getPageOverlay, resolveSections } from "./overlay";

/**
 * 섹션 렌더러 (PLAN B / DAY 7).
 *
 * 페이지는 데이터만 가져와 넘기고, 무엇을 어떤 순서로 그릴지는 여기서 결정한다.
 * `fade` 섹션의 `<FadeIn>` 래핑도 여기로 이관해 페이지에서 사라졌다 —
 * 감싸는 마크업은 전환 전 `app/page.tsx` 와 완전히 동일하다.
 */
export async function PageSections<P extends PageKey, D>({
  page,
  data,
  sections,
}: {
  page: P;
  data: D;
  sections: SectionRenderers<P, D>;
}) {
  const overlay = await getPageOverlay(page);
  const visible = resolveSections(page, overlay);
  const render = sections as Record<string, (data: D) => ReactNode>;

  return (
    <>
      {visible.map((section) =>
        section.fade ? (
          <FadeIn key={section.key} as="div" distance={32} duration={800}>
            {render[section.key](data)}
          </FadeIn>
        ) : (
          <Fragment key={section.key}>{render[section.key](data)}</Fragment>
        ),
      )}
    </>
  );
}
