"use client";

import { useState } from "react";
import { Container, Input, Textarea, Select, Label } from "@/components/ui";
import type { SettingValue } from "@/lib/content";

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

/* Phase 10 P1-07/08 — 단일 Input/Select/Label 컴포넌트 사용 */

export type ContactFormProps = {
  /** 페이지별 컨텍스트 — 메일 제목 prefix */
  context?: string;
  className?: string;
  /** 연락처는 마운트하는 페이지가 콘텐츠 어댑터에서 읽어 주입한다 (PLAN B / DAY 4). */
  contact: SettingValue<"contact">;
};

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success" }
  | { status: "error"; message: string };

export function ContactForm({ context, className, contact }: ContactFormProps) {
  /* Phase 9 P0-06 — mailto fallback 제거 → /api/contact POST */
  const [state, setState] = useState<SubmitState>({ status: "idle" });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    const payload = {
      company: String(fd.get("company") ?? ""),
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? ""),
      households: String(fd.get("households") ?? ""),
      inquiryType:
        INQUIRY_TYPES.find((t) => t.value === fd.get("inquiryType"))?.label ??
        String(fd.get("inquiryType") ?? ""),
      preferredDate: String(fd.get("preferredDate") ?? ""),
      message: String(fd.get("message") ?? ""),
      context: context ?? "사업 상담 문의",
    };

    setState({ status: "submitting" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setState({
          status: "error",
          message: data.error ?? "전송에 실패했습니다. 잠시 후 다시 시도해 주세요.",
        });
        return;
      }
      setState({ status: "success" });
      form.reset();
    } catch {
      setState({
        status: "error",
        message: "네트워크 오류로 전송하지 못했습니다.",
      });
    }
  }

  const submitting = state.status === "submitting";
  const success = state.status === "success";
  const error = state.status === "error" ? state.message : null;

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
                <dt className="text-[13px] text-ink-muted">상담시간 외</dt>
                <dd className="text-[16px] font-bold text-ink-strong">자동 접수</dd>
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
            {/* Phase 12 업그레이드 #8 — 3 그룹 시각 분할 (필드 인지 부담 ↓) */}
            <div className="space-y-10">
              {/* Step 1 — 단지 정보 */}
              <fieldset className="space-y-5">
                <legend className="mb-4 flex w-full items-baseline gap-3 border-b border-line pb-3">
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-accent-500 font-mono-num text-[12px] font-bold text-navy-900"
                  >
                    1
                  </span>
                  <span className="font-display text-[16px] font-bold tracking-tight text-ink-strong">
                    단지 정보
                  </span>
                  <span className="ml-auto text-[12px] text-ink-faint">
                    기본 식별 정보
                  </span>
                </legend>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <Label htmlFor="cf-company" required>
                      회사명 / 단지명
                    </Label>
                    <Input
                      id="cf-company"
                      name="company"
                      required
                      placeholder="예) ○○아파트 입주자대표회의"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cf-households">단지 규모 (세대수)</Label>
                    <Input
                      id="cf-households"
                      name="households"
                      type="number"
                      min={0}
                      placeholder="예) 1200"
                    />
                  </div>
                </div>
              </fieldset>

              {/* Step 2 — 문의 유형·일정 */}
              <fieldset className="space-y-5">
                <legend className="mb-4 flex w-full items-baseline gap-3 border-b border-line pb-3">
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-accent-500 font-mono-num text-[12px] font-bold text-navy-900"
                  >
                    2
                  </span>
                  <span className="font-display text-[16px] font-bold tracking-tight text-ink-strong">
                    문의 유형 · 희망일
                  </span>
                  <span className="ml-auto text-[12px] text-ink-faint">
                    상담 범위
                  </span>
                </legend>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <Label htmlFor="cf-inquiry-type" required>
                      문의 유형
                    </Label>
                    <Select
                      id="cf-inquiry-type"
                      name="inquiryType"
                      required
                      placeholder="선택해 주세요"
                      options={INQUIRY_TYPES}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cf-preferred-date">상담 희망일 (선택)</Label>
                    {/* Phase 14-H H-3 — iOS 일부 버전에서 type=date placeholder 미노출 →
                        라벨에 (선택) 명시 + 보조 텍스트로 형식 안내 */}
                    <Input
                      id="cf-preferred-date"
                      name="preferredDate"
                      type="date"
                      aria-describedby="cf-preferred-date-hint"
                      min={new Date().toISOString().slice(0, 10)}
                    />
                    <p
                      id="cf-preferred-date-hint"
                      className="mt-1.5 text-[12px] text-ink-faint"
                    >
                      예: 2026-06-15 (오늘 이후 날짜)
                    </p>
                  </div>
                </div>
              </fieldset>

              {/* Step 3 — 연락처·내용 */}
              <fieldset className="space-y-5">
                <legend className="mb-4 flex w-full items-baseline gap-3 border-b border-line pb-3">
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-accent-500 font-mono-num text-[12px] font-bold text-navy-900"
                  >
                    3
                  </span>
                  <span className="font-display text-[16px] font-bold tracking-tight text-ink-strong">
                    연락처 · 문의 내용
                  </span>
                  <span className="ml-auto text-[12px] text-ink-faint">
                    회신 정보
                  </span>
                </legend>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <Label htmlFor="cf-name" required>
                      담당자
                    </Label>
                    <Input
                      id="cf-name"
                      name="name"
                      required
                      placeholder="예) 홍길동"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cf-phone" required>
                      연락처
                    </Label>
                    <Input
                      id="cf-phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      required
                      placeholder="010-0000-0000"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="cf-email" required>
                      이메일
                    </Label>
                    <Input
                      id="cf-email"
                      name="email"
                      type="email"
                      required
                      placeholder="example@company.com"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="cf-message" required>
                      문의 내용
                    </Label>
                    <Textarea
                      id="cf-message"
                      name="message"
                      required
                      rows={5}
                      placeholder="현재 관리 상황, 요청 범위, 일정 등을 자유롭게 적어주세요."
                    />
                  </div>
                  <div className="md:col-span-2">
                    {/* Phase 14 P0-06 — checkbox id+htmlFor 명시 연결로 a11y 강화 */}
                    <label
                      htmlFor="cf-privacy-agree"
                      className="flex items-start gap-3 text-[13px] text-ink-muted"
                    >
                      <input
                        id="cf-privacy-agree"
                        type="checkbox"
                        name="privacyAgree"
                        required
                        aria-required="true"
                        className="mt-0.5 h-4 w-4 accent-accent-500"
                      />
                      <span>
                        <a
                          href="/privacy"
                          target="_blank"
                          rel="noopener"
                          className="font-semibold text-accent-deep underline-offset-2 hover:underline"
                        >
                          개인정보 수집 및 이용
                        </a>
                        에 동의합니다. 수집 항목은 상담 응대 목적에 한해
                        사용되며 6개월 후 파기됩니다. *
                      </span>
                    </label>
                  </div>
                </div>
              </fieldset>
            </div>

            <div className="mt-8 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-[13px] text-ink-faint">
                * 필수 항목. 영업일 기준 평균 4시간 안에 회신드립니다.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-14 items-center gap-2 rounded-sm bg-accent-500 px-8 text-base font-bold text-navy-900 transition-all duration-200 [transition-timing-function:var(--ease)] hover:bg-accent-600 hover:text-white hover:shadow-[var(--shadow-cta)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeDasharray="40 60"
                      />
                    </svg>
                    전송 중…
                  </>
                ) : (
                  <>
                    상담 문의 보내기 <span aria-hidden="true">→</span>
                  </>
                )}
              </button>
            </div>

            {success && (
              <p
                role="status"
                className="mt-6 rounded-sm border border-success/30 bg-success/5 px-4 py-3 text-[14px] text-success"
              >
                ✓ 상담 문의가 접수되었습니다. 영업일 기준 평균 4시간 안에
                회신드립니다.
              </p>
            )}
            {error && (
              <p
                role="alert"
                className="mt-6 rounded-sm border border-danger/30 bg-danger/5 px-4 py-3 text-[14px] text-danger"
              >
                {error}
              </p>
            )}
          </form>
        </div>
      </Container>
    </section>
  );
}
