import Link from "next/link";
import { Container } from "@/components/ui";

export default function BusinessNotFound() {
  return (
    <section className="bg-cream py-32 md:py-40">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <div
            aria-hidden="true"
            className="mx-auto mb-6 h-px w-12 bg-primary"
          />
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-primary">
            NOT FOUND
          </p>
          <h1 className="mt-8 font-serif text-4xl font-bold leading-[1.1] tracking-[-0.02em] text-ink md:text-5xl">
            요청하신 사업영역을{" "}
            <span className="serif-em">찾을 수 없습니다</span>
          </h1>
          <p className="mt-6 text-base leading-relaxed text-ink-soft md:text-lg">
            URL을 다시 확인하시거나 사업영역 목록으로 이동해주세요.
          </p>
          <div className="mt-12 flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-12">
            <Link
              href="/business"
              className="group inline-flex items-center gap-2 border-b border-ink pb-2 text-sm font-medium uppercase tracking-[0.2em] text-ink transition-colors duration-300 ease-out hover:border-primary hover:text-primary"
            >
              사업영역 보기
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
            <Link
              href="/"
              className="text-sm tracking-wide text-ink-soft transition-colors duration-300 ease-out hover:text-ink"
            >
              메인으로
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
