import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { PageHero } from "@/components/sections/common/PageHero";
import { MailtoCard } from "@/components/sections/common/MailtoCard";
import { contact } from "@/data/site-content";

/* Phase 10 P1-10 — 비밀번호 찾기 동선
   B2B 특성상 자체 비밀번호 재설정 메일 흐름 대신 운영 담당자 직접 안내 */

export const metadata: Metadata = {
  title: "비밀번호 찾기 | (주)케이비개발",
  description: "케이비개발 사이트 비밀번호 재설정 안내.",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <PageHero
        kicker="ACCOUNT · 비밀번호 찾기"
        title="비밀번호 재설정 안내"
        italicWord="재설정"
        subtitle="가입 이메일을 확인할 수 없거나 비밀번호를 잊으셨다면 운영 담당자에게 직접 요청해 주세요."
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "LOGIN", href: "/login" },
          { label: "비밀번호 찾기" },
        ]}
      />

      <section className="section bg-white">
        <Container>
          <div className="mx-auto max-w-2xl">
            <div className="rounded-md border border-line bg-gray-50 p-8 md:p-10">
              <p className="eyebrow">RESET STEPS</p>
              <h2 className="mt-4 font-display text-[24px] font-bold tracking-tight text-ink-strong md:text-[28px]">
                3단계 안내
              </h2>

              <ol className="mt-8 space-y-5">
                <li className="flex items-start gap-4">
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-accent-500 font-mono-num text-[14px] font-bold text-navy-900"
                  >
                    1
                  </span>
                  <div>
                    <p className="font-display text-[16px] font-bold text-ink-strong">
                      운영 담당자에게 연락
                    </p>
                    <p className="mt-1 text-[14px] leading-[1.7] text-ink-muted">
                      가입 이메일 또는 본인 확인 정보(소속 단지·담당자명)를 함께 알려주세요.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-accent-500 font-mono-num text-[14px] font-bold text-navy-900"
                  >
                    2
                  </span>
                  <div>
                    <p className="font-display text-[16px] font-bold text-ink-strong">
                      임시 비밀번호 발급
                    </p>
                    <p className="mt-1 text-[14px] leading-[1.7] text-ink-muted">
                      신원 확인 후 가입 이메일로 임시 비밀번호를 전달드립니다. 1영업일 이내 처리됩니다.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-accent-500 font-mono-num text-[14px] font-bold text-navy-900"
                  >
                    3
                  </span>
                  <div>
                    <p className="font-display text-[16px] font-bold text-ink-strong">
                      로그인 후 비밀번호 변경
                    </p>
                    <p className="mt-1 text-[14px] leading-[1.7] text-ink-muted">
                      임시 비밀번호로 로그인하시면 마이페이지에서 새 비밀번호로 변경하실 수 있습니다.
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            {/* 연락 채널 */}
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center justify-between rounded-md border border-line bg-white px-6 py-5 transition-colors duration-200 hover:border-ink-strong"
              >
                <span>
                  <span className="block text-[12px] uppercase tracking-[0.12em] text-ink-faint">
                    전화 문의
                  </span>
                  <span className="mt-1 block font-display text-[18px] font-bold text-ink-strong">
                    {contact.phone}
                  </span>
                </span>
                <span aria-hidden="true" className="text-ink-faint">
                  →
                </span>
              </a>
              <MailtoCard
                email={contact.email}
                subject="[케이비개발] 비밀번호 재설정 요청"
                label="이메일 문의"
              />
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/login"
                className="text-[14px] font-medium text-ink-muted transition-colors hover:text-accent-deep"
              >
                ← 로그인 페이지로 돌아가기
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
