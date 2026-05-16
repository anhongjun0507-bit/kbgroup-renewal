"use client";

import { useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container, Heading } from "@/components/ui";
import type { BusinessCategory } from "@/data/site-content";
import { cn } from "@/lib/cn";

/* Phase 4.F.4 — FAQ accordion (사업별 자주 묻는 질문) */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

type FAQ = { q: string; a: string };

const FAQ_BY_AREA: Record<BusinessCategory, FAQ[]> = {
  facility: [
    {
      q: "관리 계약 기간은 어떻게 되나요?",
      a: "기본은 1년 단위 계약이며, 단지 상황에 맞춰 3년·5년 장기 계약도 가능합니다. 계약 종료 3개월 전 운영 성과 리뷰 후 갱신 협의를 진행합니다.",
    },
    {
      q: "야간·공휴일 긴급 대응이 가능한가요?",
      a: "전 단지 24시간 핫라인을 운영하며, 누수·정전·승강기 장애 등 긴급 상황은 평균 15분 이내에 현장에 도착합니다.",
    },
    {
      q: "기존 관리회사에서 인수인계는 어떻게 이뤄지나요?",
      a: "전담 인수팀이 도면·이력·설비 상태를 한 달간 정밀 점검 후, 입주자대표회의에 보고서를 제출하고 단계적으로 인수합니다.",
    },
  ],
  sanitation: [
    {
      q: "세대 내부 청소도 가능한가요?",
      a: "공용부 청소가 기본이며, 입주민 요청 시 세대 입주 청소·정기 청소를 별도 견적으로 진행합니다.",
    },
    {
      q: "친환경 세제만 사용하나요?",
      a: "공동공간은 친환경 인증 세제, 특수 오염(유분·곰팡이)은 전용 세제를 사용합니다. 사용 약품 목록은 분기마다 공유드립니다.",
    },
    {
      q: "방역 작업 후 안전 시간은?",
      a: "사용 약품에 따라 1~3시간이며, 작업 전후 게시판·방송으로 안내합니다. 의약외품 등록 약품만 사용합니다.",
    },
  ],
  security: [
    {
      q: "관제 인력은 외주인가요, 자체인가요?",
      a: "100% 자체 채용·교육 인력입니다. 4주 신입 교육과 분기별 보수 교육을 의무로 운영합니다.",
    },
    {
      q: "CCTV 영상 보관 기간은?",
      a: "법정 30일 이상 보관하며, 단지 요청 시 60~90일 확장 가능합니다. 외부 열람은 정당한 사유와 절차에 따라서만 처리됩니다.",
    },
    {
      q: "방문 차량 관리는 어떻게 하나요?",
      a: "차량 번호 자동 인식 + 모바일 사전 등록으로 운영하며, 입주민 앱에서 실시간 방문 차량을 확인할 수 있습니다.",
    },
  ],
  development: [
    {
      q: "소규모 리모델링 공사도 가능한가요?",
      a: "공용부 리모델링·노후 설비 교체·외관 도장 등 단지 단위 공사를 종합 시공합니다. 견적은 무료입니다.",
    },
    {
      q: "하자 보수 기간은 어떻게 되나요?",
      a: "공사 완료 후 2년 무상 하자 보수를 기본으로 하며, 구조·방수 부분은 법정 기간을 준수합니다.",
    },
    {
      q: "공사 중 입주민 불편 최소화 방안은?",
      a: "공사 구간 격리·소음 시간대 제한·일일 진행 알림을 기본으로 진행하며, 입대의와 사전에 공사 계획을 협의합니다.",
    },
  ],
  other: [
    {
      q: "위탁 가능한 분야는 어떻게 되나요?",
      a: "조경·수목 관리, 차량 운영, 폐기물 처리, 단지 행사 지원 등 단지 운영과 연결된 영역 전반을 위탁받습니다.",
    },
    {
      q: "단발성 행사 지원도 가능한가요?",
      a: "단지 입주 행사·축제·총회 등 단발 지원도 가능합니다. 인력·장비·진행을 패키지로 견적 드립니다.",
    },
    {
      q: "견적까지 얼마나 걸리나요?",
      a: "요구사항 접수 후 48시간 이내 1차 견적, 현장 실사 후 1주일 이내 확정 견적을 회신드립니다.",
    },
  ],
};

interface Props {
  areaId: BusinessCategory;
}

export function BusinessFAQ({ areaId }: Props) {
  const shouldReduce = useReducedMotion() ?? false;
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const faqs = FAQ_BY_AREA[areaId];

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
      aria-labelledby="business-faq-heading"
      className="section bg-white"
    >
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={headerVariants}
          className="mx-auto max-w-4xl"
        >
          <Heading
            kicker="FAQ"
            title="자주 묻는 질문"
            italicWord="질문"
            align="left"
            size="md"
            as="h2"
            className="mb-12"
          />
        </motion.div>

        <ul className="mx-auto max-w-4xl divide-y divide-line border-y border-line">
          {faqs.map((faq, idx) => {
            const open = openIdx === idx;
            return (
              <li key={idx}>
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={`faq-panel-${idx}`}
                  onClick={() => setOpenIdx(open ? null : idx)}
                  className="flex w-full items-start justify-between gap-6 py-6 text-left transition-colors duration-200 hover:bg-gray-50"
                >
                  <span className="flex items-baseline gap-4">
                    <span
                      aria-hidden="true"
                      className="font-mono-num text-[16px] font-bold text-accent-500"
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-[18px] font-bold tracking-tight text-ink-strong md:text-[20px]">
                      {faq.q}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-1.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center text-ink-strong transition-transform duration-300",
                      open && "rotate-45 text-accent-500",
                    )}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 5V19M5 12H19" strokeLinecap="round" />
                    </svg>
                  </span>
                </button>
                {open && (
                  <div
                    id={`faq-panel-${idx}`}
                    role="region"
                    className="pb-7 pl-10 pr-12 text-[15px] leading-[1.75] text-ink-muted md:text-[16px]"
                  >
                    {faq.a}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
