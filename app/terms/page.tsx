import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { PageHero } from "@/components/sections/common/PageHero";
import { getSetting } from "@/lib/content";
import { UnpublishedNotice } from "@/components/layout/UnpublishedNotice";
import { requirePublished } from "@/lib/pages/gate";

export const metadata: Metadata = {
  title: "이용약관",
  description:
    "(주)케이비개발 홈페이지 이용에 관한 회사·이용자의 권리·의무·책임 사항을 안내합니다.",
  robots: { index: true, follow: true },
};

/* Phase 14 P1-10 — 이용약관 페이지 신설.
   본 약관은 홈페이지 정보 제공 및 상담 문의 접수에 한정. 추후 회원 서비스 확장 시 갱신. */

/* 제1조에 법인 정식 명칭이 들어가므로 상수가 아니라 함수로 둔다 (PLAN B / DAY 4). */
const sections = (legalName: string) => [
  {
    title: "제1조 (목적)",
    body: [
      `본 약관은 ${legalName}(이하 "회사")가 운영하는 홈페이지(이하 "본 사이트")의 이용에 관한 회사와 이용자 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.`,
    ],
  },
  {
    title: "제2조 (용어의 정의)",
    body: [
      "「이용자」란 본 사이트에 접속하여 본 약관에 따라 회사가 제공하는 서비스를 이용하는 자를 말합니다.",
      "「회원」이란 회사가 별도로 발급한 계정으로 본 사이트의 운영자 전용 페이지(마이페이지 등)에 접근할 수 있는 임직원·운영 담당자를 말합니다.",
      "「콘텐츠」란 회사가 본 사이트를 통해 제공하는 회사 정보, 사업 소개, 관리 현황, 공지사항 등 일체의 텍스트·이미지·자료를 말합니다.",
    ],
  },
  {
    title: "제3조 (약관의 효력 및 변경)",
    body: [
      "본 약관은 본 사이트에 게시함으로써 효력이 발생합니다.",
      "회사는 관련 법령을 위배하지 않는 범위 내에서 본 약관을 개정할 수 있으며, 변경 시 본 사이트에 사전 공지합니다.",
      "이용자는 변경된 약관에 동의하지 않을 권리가 있으며, 동의하지 않을 경우 서비스 이용을 중단할 수 있습니다.",
    ],
  },
  {
    title: "제4조 (서비스의 제공 및 변경)",
    body: [
      "회사는 본 사이트를 통해 회사 소개, 사업영역 안내, 관리 단지 현황, 인허가 정보, 채용 정보, 공지사항, 사업 상담 접수 등의 서비스를 제공합니다.",
      "회사는 운영상·기술상 필요한 경우 제공 중인 서비스를 변경하거나 종료할 수 있으며, 사전에 본 사이트에 공지합니다.",
    ],
  },
  {
    title: "제5조 (이용자의 의무)",
    body: [
      "이용자는 다음 행위를 하여서는 안 됩니다: (가) 타인의 정보 도용, (나) 회사가 게시한 정보의 무단 변경, (다) 회사·제3자의 저작권 등 권리 침해, (라) 본 사이트의 정상 운영을 방해하는 행위.",
      "이용자는 회사가 제공하는 상담 폼에 허위 정보를 입력해서는 안 되며, 입력한 정보에 대한 책임을 부담합니다.",
    ],
  },
  {
    title: "제6조 (저작권의 귀속)",
    body: [
      "본 사이트에 게시된 콘텐츠의 저작권은 회사 또는 정당한 권리자에게 귀속됩니다.",
      "이용자는 사전 서면 동의 없이 본 사이트의 콘텐츠를 복제·배포·전송·출판할 수 없습니다.",
    ],
  },
  {
    title: "제7조 (면책 조항)",
    body: [
      "회사는 천재지변·전쟁·정전·통신 장애 등 불가항력으로 인한 서비스 중단에 대해 책임을 지지 않습니다.",
      "회사는 이용자가 본 사이트를 통해 게시·제공한 정보의 신뢰성, 정확성 등에 관해 책임을 지지 않습니다.",
      "본 사이트에서 외부 사이트로의 링크는 정보 제공 목적이며, 회사는 외부 사이트의 내용에 대해 책임을 지지 않습니다.",
    ],
  },
  {
    title: "제8조 (분쟁 해결)",
    body: [
      "본 약관 및 본 사이트 이용과 관련하여 분쟁이 발생한 경우 회사와 이용자는 우선 상호 협의를 통해 해결합니다.",
      "협의가 이루어지지 않는 경우 관할 법원은 민사소송법상의 관할법원에 따릅니다.",
    ],
  },
  {
    title: "부칙",
    body: [
      "본 약관은 2026-05-17부터 시행합니다.",
    ],
  },
];

export default async function TermsPage() {
  /* 비공개면 404(리다이렉트 아님). 관리자면 미리보기 + 배너 (PLAN B / DAY 8). */
  const { preview } = await requirePublished("/terms");

  const company = await getSetting("company");
  const SECTIONS = sections(company.legalName);

  return (
    <>
      {preview && <UnpublishedNotice path="/terms" />}
      <PageHero
        kicker="TERMS OF SERVICE"
        title="이용약관"
        italicWord="이용약관"
        subtitle="(주)케이비개발 홈페이지 이용에 관한 회사와 이용자의 권리·의무·책임 사항을 안내합니다."
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "TERMS" },
        ]}
      />

      <section className="section bg-white">
        <Container>
          <div className="mx-auto max-w-3xl space-y-12">
            {SECTIONS.map((s) => (
              <section key={s.title}>
                <h2 className="font-display text-[20px] font-bold tracking-tight text-ink-strong md:text-[22px]">
                  {s.title}
                </h2>
                <ul className="mt-5 space-y-3 text-[15px] leading-[1.85] text-ink-muted">
                  {s.body.map((line, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span
                        aria-hidden="true"
                        className="mt-2.5 inline-block h-1 w-1 flex-shrink-0 rounded-full bg-accent-ink"
                      />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
