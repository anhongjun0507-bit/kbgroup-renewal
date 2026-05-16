"use client";

import { useState } from "react";
import { Container } from "@/components/ui";
import { contact } from "@/data/site-content";

/* Phase 2.12 — CONTACT 인라인 문의 폼
   필드: 회사명/담당자/연락처/단지규모(세대수)/문의유형/상담희망일/문의내용 + 개인정보 동의
   Phase 5에서 백엔드(Resend/SendGrid/Slack) 결정 전까지 mailto: fallback */

const INQUIRY_TYPES = [
  { value: "facility", label: "주택관리" },
  { value: "sanitation", label: "위생청소" },
  { value: "security", label: "경비·보안" },
  { value: "development", label: "시행·건설" },
  { value: "other", label: "기타 / 종합 문의" },
];

const labelClass = "eyebrow mb-2 block";
const inputBase =
  "w-full rounded-sm border border-line bg-white px-4 py-3 text-[15px] text-ink-strong placeholder:text-ink-faint transition-colors duration-200 focus:border-navy-700 focus:outline-none";

export type ContactFormProps = {
  /** 페이지별 컨텍스트 — 메일 제목 prefix */
  context?: string;
  className?: string;
};

export function ContactForm({ context, className }: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const company = String(fd.get("company") ?? "");
    const name = String(fd.get("name") ?? "");
    const phone = String(fd.get("phone") ?? "");
    const email = String(fd.get("email") ?? "");
    const households = String(fd.get("households") ?? "");
    const inquiryType = String(fd.get("inquiryType") ?? "");
    const preferredDate = String(fd.get("preferredDate") ?? "");
    const message = String(fd.get("message") ?? "");

    const subject = `[케이비개발] ${context ?? "사업 상담 문의"} — ${company}`;
    const body = [
      `■ 회사명: ${company}`,
      `■ 담당자: ${name}`,
      `■ 연락처: ${phone}`,
      `■ 이메일: ${email}`,
      `■ 단지 규모(세대수): ${households}`,
      `■ 문의 유형: ${INQUIRY_TYPES.find((t) => t.value === inquiryType)?.label ?? inquiryType}`,
      `■ 상담 희망일: ${preferredDate || "협의 가능"}`,
      "",
      "■ 문의 내용",
      message,
    ].join("\n");

    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
  }

  return (
    <section
      className={["section bg-white", className ?? ""].join(" ").trim()}
      aria-labelledby="contact-form-heading"
    >
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          {/* 좌측 — 신뢰 메트릭 + 채널 카드 */}
          <div>
            <p className="eyebrow">CONTACT</p>
            <h2
              id="contact-form-heading"
              className="mt-4 font-extrabold tracking-tight text-ink-strong"
            >
              상담 문의를 <span className="accent-em">남겨주세요</span>
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-muted">
              단지 규모·관리 범위·운영 형태에 맞춰 견적을 산정합니다. 영업일
              기준 평균 4시간 안에 회신드립니다.
            </p>

            <dl className="mt-10 space-y-1 rounded-sm border border-line bg-gray-50 p-6">
              <div className="flex items-baseline justify-between border-b border-line py-3">
                <dt className="text-[13px] text-ink-muted">평균 응답 시간</dt>
                <dd className="text-[16px] font-bold text-ink-strong">
                  4시간 이내
                </dd>
              </div>
              <div className="flex items-baseline justify-between border-b border-line py-3">
                <dt className="text-[13px] text-ink-muted">상담 가능 시간</dt>
                <dd className="text-[16px] font-bold text-ink-strong">
                  평일 09:00 - 18:00
                </dd>
              </div>
              <div className="flex items-baseline justify-between py-3">
                <dt className="text-[13px] text-ink-muted">긴급 야간 대응</dt>
                <dd className="text-[16px] font-bold text-ink-strong">24시간</dd>
              </div>
            </dl>

            <ul className="mt-8 space-y-3">
              <li>
                <a
                  href={`tel:${contact.phone}`}
                  className="flex items-center justify-between rounded-sm border border-line bg-white px-5 py-4 text-[15px] transition-colors duration-200 hover:border-ink-strong"
                >
                  <span className="text-ink-muted">전화 문의</span>
                  <span className="font-bold text-ink-strong">
                    {contact.phone}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center justify-between rounded-sm border border-line bg-white px-5 py-4 text-[15px] transition-colors duration-200 hover:border-ink-strong"
                >
                  <span className="text-ink-muted">이메일</span>
                  <span className="font-bold text-ink-strong">
                    {contact.email}
                  </span>
                </a>
              </li>
            </ul>
          </div>

          {/* 우측 — 문의 폼 */}
          <form
            onSubmit={handleSubmit}
            className="rounded-sm border border-line bg-white p-6 md:p-10"
            noValidate
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="md:col-span-1">
                <label htmlFor="cf-company" className={labelClass}>
                  회사명 / 단지명 *
                </label>
                <input
                  id="cf-company"
                  name="company"
                  type="text"
                  required
                  className={inputBase}
                  placeholder="예) ○○아파트 입주자대표회의"
                />
              </div>
              <div>
                <label htmlFor="cf-name" className={labelClass}>
                  담당자 *
                </label>
                <input
                  id="cf-name"
                  name="name"
                  type="text"
                  required
                  className={inputBase}
                  placeholder="예) 홍길동"
                />
              </div>
              <div>
                <label htmlFor="cf-phone" className={labelClass}>
                  연락처 *
                </label>
                <input
                  id="cf-phone"
                  name="phone"
                  type="tel"
                  required
                  inputMode="tel"
                  className={inputBase}
                  placeholder="010-0000-0000"
                />
              </div>
              <div>
                <label htmlFor="cf-email" className={labelClass}>
                  이메일 *
                </label>
                <input
                  id="cf-email"
                  name="email"
                  type="email"
                  required
                  className={inputBase}
                  placeholder="example@company.com"
                />
              </div>
              <div>
                <label htmlFor="cf-households" className={labelClass}>
                  단지 규모 (세대수)
                </label>
                <input
                  id="cf-households"
                  name="households"
                  type="number"
                  min={0}
                  className={inputBase}
                  placeholder="예) 1200"
                />
              </div>
              <div>
                <label htmlFor="cf-inquiry-type" className={labelClass}>
                  문의 유형 *
                </label>
                <select
                  id="cf-inquiry-type"
                  name="inquiryType"
                  required
                  className={inputBase}
                  defaultValue=""
                >
                  <option value="" disabled>
                    선택해 주세요
                  </option>
                  {INQUIRY_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="cf-preferred-date" className={labelClass}>
                  상담 희망일
                </label>
                <input
                  id="cf-preferred-date"
                  name="preferredDate"
                  type="date"
                  className={inputBase}
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="cf-message" className={labelClass}>
                  문의 내용 *
                </label>
                <textarea
                  id="cf-message"
                  name="message"
                  required
                  rows={5}
                  className={inputBase + " resize-y"}
                  placeholder="현재 관리 상황, 요청 범위, 일정 등을 자유롭게 적어주세요."
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-start gap-3 text-[13px] text-ink-muted">
                  <input
                    type="checkbox"
                    name="privacyAgree"
                    required
                    className="mt-0.5 h-4 w-4 border-line accent-accent-500"
                  />
                  <span>
                    개인정보 수집 및 이용에 동의합니다. 수집 항목은 상담 응대
                    목적에 한해 사용되며 6개월 후 파기됩니다. *
                  </span>
                </label>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-[13px] text-ink-faint">
                * 필수 항목. 전송 시 기본 메일 클라이언트가 열립니다.
              </p>
              <button
                type="submit"
                className="inline-flex h-14 items-center gap-2 rounded-sm bg-accent-500 px-8 text-base font-bold text-white transition-all duration-200 [transition-timing-function:var(--ease)] hover:bg-accent-600 hover:shadow-[var(--shadow-cta)]"
              >
                상담 문의 보내기 <span aria-hidden="true">→</span>
              </button>
            </div>

            {submitted && (
              <p
                role="status"
                className="mt-6 rounded-sm border border-success/30 bg-success/5 px-4 py-3 text-[14px] text-success"
              >
                메일 클라이언트가 열렸습니다. 발송 버튼을 눌러주세요.
              </p>
            )}
          </form>
        </div>
      </Container>
    </section>
  );
}
