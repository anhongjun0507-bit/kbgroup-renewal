import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { PageHero } from "@/components/sections/common/PageHero";
import { getSetting } from "@/lib/content";
import { UnpublishedNotice } from "@/components/layout/UnpublishedNotice";
import { requirePublished } from "@/lib/pages/gate";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description:
    "(주)케이비개발의 개인정보 수집·이용·보관·파기 정책 안내. 정보주체의 권리와 처리 항목·기간을 명시합니다.",
  robots: { index: true, follow: true },
};

/* Phase 14 P1-10 — 개인정보처리방침 페이지 신설.
   상담 폼 동의 항목·footer 링크에서 접근. 사업자 정보·연락처는 콘텐츠 어댑터(lib/content) 단일 출처. */

const SECTIONS = [
  {
    title: "1. 수집하는 개인정보 항목",
    body: [
      "사업 상담 폼: 회사명/단지명, 단지 규모, 문의 유형, 상담 희망일, 담당자명, 연락처, 이메일, 문의 내용.",
      "회원가입(임직원·운영 담당자 전용): 이메일, 비밀번호, 표시 이름.",
      "자동 수집: 접속 IP, 접속 일시, 브라우저 식별 정보 (보안·통계 목적).",
    ],
  },
  {
    title: "2. 수집·이용 목적",
    body: [
      "상담 응대 및 견적 제공, 계약 체결 및 이행, 운영 담당자 식별.",
      "법령·정부 정책에 의한 보존 의무 이행, 분쟁 대응 및 민원 처리.",
      "서비스 안정성 확보 및 부정 이용 방지.",
    ],
  },
  {
    title: "3. 보유 및 이용 기간",
    body: [
      "상담 폼 수집 정보: 응대 완료 후 6개월간 보관 후 자동 파기.",
      "회원 정보: 회원 탈퇴 또는 운영 권한 종료 시 지체 없이 파기.",
      "관련 법령에 의해 보존이 필요한 경우 해당 기간 동안 보관 (예: 계약·청약 철회 5년, 대금 결제·재화 공급 5년, 소비자 불만·분쟁 처리 3년).",
    ],
  },
  {
    title: "4. 제3자 제공",
    body: [
      "원칙적으로 정보주체의 동의 없이 제3자에게 제공하지 않습니다.",
      "예외: 법령에 특별한 규정이 있거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우.",
    ],
  },
  {
    title: "5. 처리 위탁",
    body: [
      "메일 발송·홈페이지 인프라 등 일부 업무를 외부 사업자에게 위탁할 수 있으며, 위탁 시 개인정보 보호를 위한 안전조치를 계약서에 명시합니다.",
      "위탁 현황은 본 방침의 개정과 함께 공개하며 변동 시 사전 고지합니다.",
    ],
  },
  {
    title: "6. 정보주체의 권리",
    body: [
      "정보주체는 언제든지 본인의 개인정보 열람·정정·삭제·처리정지를 요구할 수 있습니다.",
      "요청은 본 방침 하단의 개인정보보호책임자 연락처로 접수하시면 지체 없이(법령상 10일 이내) 처리합니다.",
      "만 14세 미만 아동의 개인정보는 수집하지 않습니다.",
    ],
  },
  {
    title: "7. 안전성 확보 조치",
    body: [
      "관리적: 개인정보 처리 직원의 최소화, 정기적 자체 점검.",
      "기술적: 비밀번호 단방향 암호화, 접근권한 관리, 통신 구간 HTTPS 적용.",
      "물리적: 본사 서류 보관 구역 출입 통제.",
    ],
  },
  {
    title: "8. 개정 이력",
    body: [
      "본 방침은 법령·정책 변경에 따라 변경될 수 있으며, 변경 시 본 페이지를 통해 사전 고지합니다.",
      "최초 시행일: 2026-05-17",
    ],
  },
];

export default async function PrivacyPage() {
  /* 비공개면 404(리다이렉트 아님). 관리자면 미리보기 + 배너 (PLAN B / DAY 8). */
  const { preview } = await requirePublished("/privacy");

  const [company, contact] = await Promise.all([getSetting("company"), getSetting("contact")]);

  return (
    <>
      {preview && <UnpublishedNotice path="/privacy" />}
      <PageHero
        kicker="PRIVACY POLICY"
        title="개인정보처리방침"
        italicWord="처리방침"
        subtitle="(주)케이비개발이 수집·이용하는 개인정보의 항목, 목적, 보유 기간 및 정보주체의 권리를 안내합니다."
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "PRIVACY" },
        ]}
      />

      <section className="section bg-white">
        <Container>
          <div className="mx-auto max-w-3xl">
            <p className="text-[14px] leading-[1.85] text-ink-muted">
              {company.legalName}(이하 &ldquo;회사&rdquo;)는 정보주체의 자유와 권리 보호를 위해
              「개인정보 보호법」 및 관계 법령이 정한 바를 준수하며, 적법하게 개인정보를
              처리하고 안전하게 관리하기 위해 본 처리방침을 수립·공개합니다.
            </p>

            <div className="mt-12 space-y-12">
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

            <section className="mt-16 rounded-md border border-line bg-gray-50 p-8">
              <h2 className="font-display text-[18px] font-bold tracking-tight text-ink-strong">
                개인정보보호책임자
              </h2>
              <dl className="mt-5 grid grid-cols-1 gap-3 text-[14px] sm:grid-cols-[100px_1fr]">
                <dt className="font-semibold text-accent-deep">담당자</dt>
                <dd className="text-ink-muted">{contact.privacyOfficer.name}</dd>
                <dt className="font-semibold text-accent-deep">전화</dt>
                <dd className="text-ink-muted">
                  <a href={`tel:${contact.privacyOfficer.phone}`} className="hover:text-accent-deep">
                    {contact.privacyOfficer.phone}
                  </a>
                </dd>
                <dt className="font-semibold text-accent-deep">이메일</dt>
                <dd className="text-ink-muted">
                  <a href={`mailto:${contact.email}`} className="hover:text-accent-deep">
                    {contact.email}
                  </a>
                </dd>
                <dt className="font-semibold text-accent-deep">주소</dt>
                <dd className="text-ink-muted">{contact.address}</dd>
              </dl>
            </section>
          </div>
        </Container>
      </section>
    </>
  );
}
