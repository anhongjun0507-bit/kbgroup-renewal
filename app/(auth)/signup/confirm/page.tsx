import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/sections/common/PageHero";
import { Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "이메일 확인 | (주)케이비개발",
  description: "회원가입 인증 메일이 발송되었습니다.",
};

interface Props {
  searchParams: Promise<{ email?: string }>;
}

export default async function SignupConfirmPage({ searchParams }: Props) {
  const { email } = await searchParams;

  return (
    <>
      <PageHero
        kicker="CHECK YOUR EMAIL · 메일 확인"
        title="메일을 확인해주세요"
        italicWord="확인"
        subtitle="입력하신 이메일로 인증 링크를 발송했습니다. 링크를 클릭하면 가입이 완료됩니다."
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "JOIN", href: "/signup" },
          { label: "EMAIL" },
        ]}
      />
      <section className="bg-cream pb-32">
        <Container>
          <div className="mx-auto max-w-md space-y-6">
            {email && (
              <div className="border border-line bg-white p-6">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">
                  발송 주소
                </p>
                <p className="mt-2 text-lg font-medium text-ink">{email}</p>
              </div>
            )}

            <ul className="space-y-3 text-sm leading-relaxed text-ink-soft">
              <li>· 받은편지함을 확인해주세요. 도착까지 1-2분 걸릴 수 있습니다.</li>
              <li>· 메일이 오지 않으면 스팸함도 확인해주세요.</li>
              <li>· 링크는 24시간 후 만료됩니다. 만료 시 다시 가입해주세요.</li>
            </ul>

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
