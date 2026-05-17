"use client";

import { useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container, Heading } from "@/components/ui";
import { contact } from "@/data/site-content";

/* Phase 5.I.3 — 채용 공고 빈 상태 + 인재 풀 등록 모달 */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export function CareersOpenings() {
  const shouldReduce = useReducedMotion() ?? false;
  const careersEmail = contact.careersEmail ?? contact.email;
  const [modalOpen, setModalOpen] = useState(false);

  const headerVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.8, ease: EASE_OUT_EXPO },
    },
  };

  return (
    <section
      aria-labelledby="careers-openings-heading"
      className="section bg-gray-50"
    >
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={headerVariants}
        >
          <Heading
            kicker="OPEN POSITIONS"
            title="현재 채용 중인 공고"
            italicWord="공고"
            subtitle="진행 중인 채용 정보입니다. 공고가 없을 때는 인재 풀 등록으로 미리 연결하세요."
            align="left"
            size="md"
            as="h2"
            className="mb-12"
          />
        </motion.div>

        {/* 빈 상태 카드 */}
        <div className="mx-auto max-w-3xl rounded-md border border-line bg-white p-10 text-center md:p-14">
          <div className="mx-auto h-12 w-12 text-ink-faint">
            <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="8" y="14" width="32" height="26" rx="2" />
              <path d="M18 14V10C18 8.9 18.9 8 20 8H28C29.1 8 30 8.9 30 10V14" />
              <path d="M14 22H34" />
              <circle cx="20" cy="30" r="1.5" fill="currentColor" />
              <path d="M24 30H32" />
            </svg>
          </div>
          <p className="mt-6 font-display text-[24px] font-bold tracking-tight text-ink-strong md:text-[28px]">
            현재 진행 중인 공고가 없습니다
          </p>
          <p className="mt-4 text-[15px] leading-[1.75] text-ink-muted">
            신규 공고는 이곳에 게재됩니다. 관심 직무가 있으시면
            <br className="hidden sm:inline" />
            인재 풀에 등록해 주세요. 적합한 포지션이 열릴 때 먼저 연락드립니다.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex h-14 items-center gap-2 rounded-sm bg-accent-500 px-8 text-base font-bold text-navy-900 transition-all duration-200 [transition-timing-function:var(--ease)] hover:bg-accent-600 hover:shadow-[var(--shadow-cta)]"
            >
              인재 풀 등록하기
              <span aria-hidden="true">→</span>
            </button>
            <a
              href={`mailto:${careersEmail}`}
              className="inline-flex h-14 items-center gap-2 rounded-sm border border-ink-strong px-8 text-base font-semibold text-ink-strong transition-colors duration-200 hover:bg-ink-strong hover:text-white"
            >
              이메일로 직접 문의
            </a>
          </div>
        </div>
      </Container>

      {modalOpen && (
        <TalentPoolModal
          email={careersEmail}
          onClose={() => setModalOpen(false)}
        />
      )}
    </section>
  );
}

function TalentPoolModal({
  email,
  onClose,
}: {
  email: string;
  onClose: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "");
    const phone = String(fd.get("phone") ?? "");
    const role = String(fd.get("role") ?? "");
    const summary = String(fd.get("summary") ?? "");

    const subject = `[케이비개발] 인재 풀 등록 — ${name} (${role})`;
    const body = [
      `■ 이름: ${name}`,
      `■ 연락처: ${phone}`,
      `■ 희망 직무: ${role}`,
      "",
      "■ 경력 요약",
      summary,
      "",
      "※ 이력서 파일은 본 메일에 첨부해 주세요.",
    ].join("\n");
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="인재 풀 등록"
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/80 p-5 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-md bg-white p-6 md:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-sm text-ink-strong transition-colors hover:bg-gray-100"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 6L18 18M6 18L18 6" strokeLinecap="round" />
          </svg>
        </button>

        <p className="eyebrow">TALENT POOL</p>
        <h3 className="mt-4 font-display text-[24px] font-bold tracking-tight text-ink-strong">
          인재 풀 등록
        </h3>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">
          기본 정보와 경력 요약을 남겨주시면, 적합한 포지션이 열릴 때 먼저
          연락드립니다.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="tp-name" className="eyebrow mb-2 block">
              이름 *
            </label>
            <input
              id="tp-name"
              name="name"
              type="text"
              required
              className="block w-full rounded-sm border border-line bg-white px-4 py-3 text-[16px] text-ink-strong placeholder:text-ink-faint focus:border-navy-700 focus:outline-none md:text-[15px]"
              placeholder="홍길동"
            />
          </div>
          <div>
            <label htmlFor="tp-phone" className="eyebrow mb-2 block">
              연락처 *
            </label>
            <input
              id="tp-phone"
              name="phone"
              type="tel"
              required
              className="block w-full rounded-sm border border-line bg-white px-4 py-3 text-[16px] text-ink-strong placeholder:text-ink-faint focus:border-navy-700 focus:outline-none md:text-[15px]"
              placeholder="010-0000-0000"
            />
          </div>
          <div>
            <label htmlFor="tp-role" className="eyebrow mb-2 block">
              희망 직무 *
            </label>
            <input
              id="tp-role"
              name="role"
              type="text"
              required
              className="block w-full rounded-sm border border-line bg-white px-4 py-3 text-[16px] text-ink-strong placeholder:text-ink-faint focus:border-navy-700 focus:outline-none md:text-[15px]"
              placeholder="예) 시설 관리소장 / 경비반장"
            />
          </div>
          <div>
            <label htmlFor="tp-summary" className="eyebrow mb-2 block">
              경력 요약 *
            </label>
            <textarea
              id="tp-summary"
              name="summary"
              required
              rows={4}
              className="block w-full resize-y rounded-sm border border-line bg-white px-4 py-3 text-[16px] text-ink-strong placeholder:text-ink-faint focus:border-navy-700 focus:outline-none md:text-[15px]"
              placeholder="근무 경력, 보유 자격증, 강점 등을 자유롭게 적어주세요."
            />
          </div>

          <div className="flex flex-col items-start gap-3 pt-2 md:flex-row md:items-center md:justify-between">
            <p className="text-[12px] text-ink-faint">
              ※ 전송 시 메일 클라이언트가 열리며, 이력서 파일은 직접 첨부하시면
              됩니다.
            </p>
            <button
              type="submit"
              className="inline-flex h-12 items-center gap-2 rounded-sm bg-accent-500 px-6 text-[14px] font-bold text-navy-900 transition-all duration-200 [transition-timing-function:var(--ease)] hover:bg-accent-600 hover:shadow-[var(--shadow-cta)]"
            >
              메일 작성 시작
              <span aria-hidden="true">→</span>
            </button>
          </div>

          {submitted && (
            <p
              role="status"
              className="rounded-sm border border-success/30 bg-success/5 px-4 py-3 text-[13px] text-success"
            >
              메일 클라이언트가 열렸습니다. 발송 버튼을 눌러주세요.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
