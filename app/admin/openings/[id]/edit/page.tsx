import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { OpeningForm } from "@/components/admin/OpeningForm";
import { requireAdmin } from "@/lib/auth";
import { getOpeningById } from "@/lib/job-openings";
import { updateOpening } from "../../actions";

type Params = { id: string };

export const metadata: Metadata = {
  title: "채용 공고 수정 | 관리자 | (주)케이비개발",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function EditOpeningPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  await requireAdmin(`/admin/openings/${id}/edit`);

  const opening = await getOpeningById(id);
  if (!opening) notFound();

  return (
    <section className="section min-h-[70vh] bg-bg-soft">
      <Container>
        <AdminTabs active="openings" />
        <div className="mx-auto max-w-3xl">
          <div className="border-b border-line pb-6">
            <p className="eyebrow text-accent-deep">ADMIN · 채용 공고</p>
            <h1 className="mt-3 font-display text-[26px] font-extrabold tracking-tight text-ink-strong md:text-[32px]">
              채용 공고 수정
            </h1>
            <p className="mt-2 text-[14px] text-ink-muted">{opening.title}</p>
          </div>
          <div className="mt-8 rounded-md border border-line bg-white p-6 md:p-8">
            <OpeningForm
              action={updateOpening}
              initial={opening}
              submitLabel="수정 완료"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
