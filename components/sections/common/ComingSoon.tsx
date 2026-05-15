import { Container } from "@/components/ui";

interface Props {
  /** 준비 중 메뉴 이름 (예: "공지사항", "갤러리") */
  title: string;
  /** 보조 설명 */
  description?: string;
}

/**
 * 게시판·자료실 등 아직 콘텐츠가 없는 페이지의 "준비 중" 안내.
 * GNB 메뉴는 노출하되 클릭 시 404 대신 이 페이지를 보여줌.
 */
export function ComingSoon({ title, description }: Props) {
  return (
    <section className="bg-white py-24 md:py-32 lg:py-40">
      <Container>
        <div className="mx-auto max-w-2xl py-12 text-center md:py-20">
          <p className="text-[13px] font-medium uppercase tracking-[0.18em] text-ink-muted">
            COMING SOON
          </p>
          <h2 className="mt-6 text-[28px] font-bold leading-[1.25] tracking-[-0.03em] text-ink-strong md:text-[40px]">
            {title} 페이지는<br />
            준비 중입니다
          </h2>
          {description && (
            <p className="mt-6 text-base leading-relaxed text-ink md:text-lg">
              {description}
            </p>
          )}
          <p className="mt-10 text-sm text-ink-muted">
            오픈 일정이 확정되면 안내드리겠습니다. <br className="md:hidden" />
            급한 문의는 대표전화 062-416-3021로 연락 주세요.
          </p>
          <div className="mt-12">
            <a
              href="/"
              className="inline-flex items-center gap-2 border-b border-ink-strong pb-1 text-[14px] font-medium text-ink-strong transition-colors duration-300 hover:border-primary hover:text-primary"
            >
              <span aria-hidden="true">←</span> 홈으로 돌아가기
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
