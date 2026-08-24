import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { ComplexForm } from "@/components/admin/ComplexForm";
import { requireAdmin } from "@/lib/auth";
import { createComplex } from "../actions";

export const metadata: Metadata = {
  title: "새 단지 등록 | 관리자 | (주)케이비개발",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NewComplexPage() {
  await requireAdmin("/admin/content/complexes/new");

  return (
    <section className="section min-h-[70vh] bg-bg-soft">
      <Container>
        <AdminTabs active="complexes" />
        <div className="mx-auto max-w-3xl">
          <div className="border-b border-line pb-6">
            <p className="eyebrow text-accent-deep">ADMIN · 단지 관리</p>
            <h1 className="mt-3 font-display text-[26px] font-extrabold tracking-tight text-ink-strong md:text-[32px]">
              새 단지 등록
            </h1>
            <p className="mt-3 text-[14px] text-ink-muted">
              URL(slug)은 등록 시점의 단지명으로 자동 생성되며, 이후에는 바뀌지 않습니다.
            </p>
          </div>
          <div className="mt-8 rounded-md border border-line bg-white p-6 md:p-8">
            <ComplexForm action={createComplex} submitLabel="단지 등록" />
          </div>
        </div>
      </Container>
    </section>
  );
}
