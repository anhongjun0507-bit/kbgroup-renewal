import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { ServiceCategories } from "@/components/sections/ServiceCategories";

export const metadata: Metadata = {
  title: "사업영역 | (주)케이비개발",
  description:
    "케이비개발의 다섯 가지 전문 사업영역 — 시설관리, 위생청소, 경비보안, 시행건설, 기타.",
};

export default function BusinessIndexPage() {
  return (
    <>
      {/* Page Hero */}
      <section
        aria-labelledby="business-index-title"
        className="bg-cream pb-24 pt-32 md:pb-32 md:pt-40"
      >
        <Container>
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-12">
            <ol className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">
              <li>
                <Link
                  href="/"
                  className="transition-colors duration-200 hover:text-primary"
                >
                  HOME
                </Link>
              </li>
              <li aria-hidden="true" className="text-ink-muted/60">
                /
              </li>
              <li className="text-ink-soft">SERVICES</li>
            </ol>
          </nav>

          <div className="max-w-4xl">
            <div
              aria-hidden="true"
              className="mb-6 h-px w-12 bg-primary"
            />
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
              BUSINESS AREAS
            </p>
            <h1
              id="business-index-title"
              className="mt-6 font-serif text-5xl font-bold leading-[0.95] tracking-[-0.03em] text-ink md:text-6xl lg:text-7xl xl:text-8xl"
            >
              사업<span className="serif-em">영역</span>
            </h1>
            <div
              aria-hidden="true"
              className="mb-8 mt-10 h-px w-16 bg-gold"
            />
            <p className="max-w-2xl text-lg leading-[1.85] text-ink-soft md:text-xl">
              케이비개발은 시설관리부터 시행건설까지 다섯 가지 전문 분야에서
              단지의 일상을 책임집니다.
            </p>
          </div>
        </Container>
      </section>

      {/* 5개 카테고리 리스트 — 메인의 ServiceCategories 재사용 */}
      <ServiceCategories />
    </>
  );
}
