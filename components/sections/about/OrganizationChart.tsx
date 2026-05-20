"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Container, Heading } from "@/components/ui";
import { organization, type OrgNode } from "@/data/site-content";

/* Phase 14-M (2026-05-20) — 본사 조직도.
   클라 hwpx 요청 + image2 도식. 카드 그리드 + CSS 연결선. 모바일 세로 stack 자동 전환.
   디자인 토큰: navy 계열 직급별, accent gold 포인트, line border, ease 토큰. */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

interface NodeCardProps {
  node: OrgNode;
  variant: "head" | "exec" | "vp" | "lead" | "leaf";
}

function NodeCard({ node, variant }: NodeCardProps) {
  /* variant별 visual hierarchy
     head : 대표이사  — navy-900 진한 배경 + 흰 텍스트 + accent 좌측 바
     exec : 총괄사장  — navy-800 (한 단계 옅음)
     vp   : 사장/부동산임대관리 — navy-700
     lead : 주택관리부 사장 — navy 톤 outline
     leaf : 부서 — white 배경 + line border */
  const styles: Record<typeof variant, string> = {
    head: "bg-navy-900 text-white border-navy-900 shadow-[var(--shadow-card)]",
    exec: "bg-navy-800 text-white border-navy-800",
    vp: "bg-white text-navy-900 border-navy-700 border-2",
    lead: "bg-white text-navy-800 border-navy-500 border",
    leaf: "bg-gray-50 text-ink-strong border-line",
  };

  const accentBar = variant === "head" || variant === "exec";

  return (
    <div
      className={`relative inline-flex min-w-[140px] max-w-[260px] flex-col items-center gap-1 rounded-md border px-5 py-3.5 text-center transition-all duration-200 [transition-timing-function:var(--ease)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] md:min-w-[160px] md:px-6 md:py-4 ${styles[variant]}`}
    >
      {accentBar && (
        <div
          aria-hidden="true"
          className="absolute inset-y-2 left-0 w-[3px] bg-accent-500"
        />
      )}
      {node.role && variant !== "leaf" && (
        <span
          className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${
            variant === "head" || variant === "exec"
              ? "text-accent-300"
              : "text-accent-ink"
          }`}
        >
          {node.role}
        </span>
      )}
      <span
        className={`font-display tracking-tight ${
          variant === "head"
            ? "text-[18px] font-bold md:text-[20px]"
            : variant === "exec"
              ? "text-[16px] font-bold md:text-[18px]"
              : variant === "vp"
                ? "text-[15px] font-bold md:text-[16px]"
                : variant === "lead"
                  ? "text-[14px] font-semibold md:text-[15px]"
                  : "text-[13px] font-semibold md:text-[14px]"
        }`}
      >
        {node.name}
      </span>
      {node.role && variant === "leaf" && (
        <span className="text-[11px] text-ink-muted">{node.role}</span>
      )}
    </div>
  );
}

/* 세로 연결선 (부모 → 자식)
   모바일에서는 좌측 트리 들여쓰기 가이드로 동작.
   데스크탑에서는 카드 사이 중앙 vertical line. */
function VLine({ height = 24 }: { height?: number }) {
  return (
    <div
      aria-hidden="true"
      className="mx-auto w-px bg-line"
      style={{ height: `${height}px` }}
    />
  );
}

/* 가로 연결선 + 분기점 (n개 자식 카드 위에 ┬ 형태) */
function BranchConnector({ count }: { count: number }) {
  if (count < 2) return <VLine height={24} />;
  return (
    <div aria-hidden="true" className="relative mx-auto h-6 w-full">
      {/* 수직 (위에서 분기점까지) */}
      <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-line" />
      {/* 수평 (좌끝 → 우끝) */}
      <span className="absolute left-[8%] top-3 h-px w-[84%] bg-line" />
      {/* 자식 각각 위로 내려가는 짧은 수직선 */}
      {Array.from({ length: count }).map((_, i) => {
        const pct = 8 + (i * 84) / (count - 1);
        return (
          <span
            key={i}
            className="absolute top-3 h-3 w-px bg-line"
            style={{ left: `${pct}%` }}
          />
        );
      })}
    </div>
  );
}

export function OrganizationChart() {
  const shouldReduce = useReducedMotion() ?? false;

  const headerVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.8, ease: EASE_OUT_EXPO },
    },
  };

  const fadeVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduce ? 0 : 0.5, ease: EASE_OUT_EXPO },
    },
  };

  const root = organization.tree;
  const totalSosa = root.children?.[0]; // 총괄사장
  const sajangBranch = totalSosa?.children?.find((c) => c.name === "사장");
  const rentBranch = totalSosa?.children?.find((c) => c.name === "부동산임대관리");
  const housingPresident = sajangBranch?.children?.[0]; // 주택관리부 사장
  const housingDepts = housingPresident?.children ?? [];
  const rentDepts = rentBranch?.children ?? [];

  return (
    <section
      aria-labelledby="org-chart-heading"
      className="section bg-white"
    >
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={headerVariants}
        >
          <Heading
            kicker="ORGANIZATION · 조직도"
            title="단지 운영을 떠받치는 조직"
            italicWord="조직"
            subtitle="대표이사부터 일선 부서·지사까지 — 단지 한 곳을 운영하는 데 필요한 역할이 명확하게 나뉘어 있습니다."
            align="left"
            size="md"
            as="h2"
            className="mb-12"
          />
        </motion.div>

        {/* ─────────── 본사 트리 ─────────── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={fadeVariants}
          className="mx-auto max-w-5xl"
        >
          {/* Lv0: 대표이사 */}
          <div className="flex justify-center">
            <NodeCard node={root} variant="head" />
          </div>
          <VLine height={28} />

          {/* Lv1: 총괄사장 */}
          {totalSosa && (
            <>
              <div className="flex justify-center">
                <NodeCard node={totalSosa} variant="exec" />
              </div>
              {/* 2 갈래 분기 */}
              <BranchConnector count={2} />

              {/* Lv2: 사장 + 부동산임대관리 */}
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-6">
                {/* 왼쪽: 사장 → 주택관리부 사장 → 4부서 */}
                <div className="flex flex-col">
                  {sajangBranch && (
                    <div className="flex justify-center">
                      <NodeCard node={sajangBranch} variant="vp" />
                    </div>
                  )}
                  <VLine height={20} />
                  {housingPresident && (
                    <div className="flex justify-center">
                      <NodeCard node={housingPresident} variant="lead" />
                    </div>
                  )}
                  {housingDepts.length > 0 && (
                    <>
                      <BranchConnector count={housingDepts.length} />
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-2">
                        {housingDepts.map((d) => (
                          <div key={d.name} className="flex justify-center">
                            <NodeCard node={d} variant="leaf" />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* 오른쪽: 부동산임대관리 → 2부서 */}
                <div className="flex flex-col">
                  {rentBranch && (
                    <div className="flex justify-center">
                      <NodeCard node={rentBranch} variant="vp" />
                    </div>
                  )}
                  {rentDepts.length > 0 && (
                    <>
                      <BranchConnector count={rentDepts.length} />
                      <div className="grid grid-cols-2 gap-3">
                        {rentDepts.map((d) => (
                          <div key={d.name} className="flex justify-center">
                            <NodeCard node={d} variant="leaf" />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* ─────────── 별도 지사 ─────────── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeVariants}
          className="mx-auto mt-16 max-w-4xl border-t border-line pt-10 md:mt-20 md:pt-12"
        >
          <p className="mb-6 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-ink">
            BRANCHES · 별도 지사
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
            {organization.branches.map((b) => (
              <div
                key={b.name}
                className="group flex items-center justify-between gap-4 rounded-md border border-line bg-white px-6 py-5 transition-all duration-200 [transition-timing-function:var(--ease)] hover:-translate-y-0.5 hover:border-navy-700 hover:shadow-[var(--shadow-card)]"
              >
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-ink">
                    BRANCH
                  </p>
                  <p className="mt-1 font-display text-[16px] font-bold tracking-tight text-ink-strong md:text-[18px]">
                    {b.name}
                  </p>
                </div>
                {b.role && (
                  <span className="inline-flex items-center rounded-sm border border-navy-700 px-3 py-1 text-[12px] font-semibold text-navy-800">
                    {b.role}
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
