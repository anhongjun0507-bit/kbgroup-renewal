import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { OpeningForm } from "@/components/admin/OpeningForm";
import { requireAdmin } from "@/lib/auth";
import { createOpening } from "../actions";

export const metadata: Metadata = {
  title: "새 채용 공고 | 관리자 | (주)케이비개발",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NewOpeningPage() {
  await requireAdmin("/admin/openings/new");

  return (
    <section className="section min-h-[70vh] bg-bg-soft">
      <Container>
        <AdminTabs active="openings" />
        <div className="mx-auto max-w-3xl">
          <div className="border-b border-line pb-6">
            <p className="eyebrow text-accent-deep">ADMIN · 채용 공고</p>
            <h1 className="mt-3 font-display text-[26px] font-extrabold tracking-tight text-ink-strong md:text-[32px]">
              새 채용 공고 작성
            </h1>
          </div>
          <div className="mt-8 rounded-md border border-line bg-white p-6 md:p-8">
            <OpeningForm action={createOpening} submitLabel="공고 등록" />
          </div>
        </div>
      </Container>
    </section>
  );
}
