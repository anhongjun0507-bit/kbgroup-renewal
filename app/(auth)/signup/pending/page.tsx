import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/sections/common/PageHero";
import { Container } from "@/components/ui";
import { getSetting } from "@/lib/content";

export const metadata: Metadata = {
  title: "가입 신청 완료 · 승인 대기 | (주)케이비개발",
  description: "회원가입 신청이 접수되었습니다. 관리자 승인 후 로그인할 수 있습니다.",
};

export default async function SignupPendingPage() {
  const contact = await getSetting("contact");

  return (
    <>
      <PageHero
        kicker="PENDING APPROVAL · 승인 대기"
        title="가입 신청이 접수되었습니다"
        italicWord="접수"
        subtitle="관리자 승인이 완료되면 로그인하실 수 있습니다."
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "JOIN", href: "/signup" },
          { label: "PENDING" },
        ]}
      />
      <section className="bg-cream pb-32">
        <Container>
          <div className="mx-auto max-w-md space-y-6">
            <div className="border border-line bg-white p-6">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">
                안내
              </p>
              <ul className="mt-3 space-y-3 text-sm leading-relaxed text-ink-soft">
                <li>· 가입 신청은 정상적으로 접수되었습니다.</li>
                <li>
                  · 관리자가 승인하면 가입하신 이메일·비밀번호로{" "}
                  <span className="font-medium text-ink">로그인</span>할 수
                  있습니다.
                </li>
                <li>· 승인 전에는 로그인 및 회원 기능 이용이 제한됩니다.</li>
                <li>
                  · 승인이 지연되면 운영 담당자에게 문의해 주세요 ·{" "}
                  <a
                    href={`tel:${contact.phone}`}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {contact.phone}
                  </a>
                </li>
              </ul>
            </div>

            <div className="pt-4">
              <Link
                href="/login"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                ← 로그인으로 돌아가기
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
