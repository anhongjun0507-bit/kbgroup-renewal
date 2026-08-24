import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { ComplexForm, type ComplexInitial } from "@/components/admin/ComplexForm";
import { requireAdmin } from "@/lib/auth";
import { updateComplex } from "../../actions";

export const metadata: Metadata = {
  title: "단지 수정 | 관리자 | (주)케이비개발",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function EditComplexPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireAdmin(`/admin/content/complexes/${id}/edit`);

  const { data } = await supabase
    .from("complexes")
    .select(
      "id, slug, name, client, region, households, area, type, period, image, images, aliases, is_featured, is_active, sort_order, updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();

  const initial: ComplexInitial = {
    id: data.id,
    slug: data.slug,
    name: data.name,
    region: data.region,
    client: data.client,
    households: data.households,
    area: data.area,
    type: data.type,
    period: data.period,
    aliases: data.aliases ?? [],
    image: data.image,
    images: data.images ?? [],
    isFeatured: data.is_featured,
    isActive: data.is_active,
    sortOrder: data.sort_order,
    // 낙관적 잠금 토큰 (E-8). 저장 시 이 값과 DB 값이 다르면 덮어쓰지 않는다.
    updatedAt: data.updated_at,
  };

  return (
    <section className="section min-h-[70vh] bg-bg-soft">
      <Container>
        <AdminTabs active="complexes" />
        <div className="mx-auto max-w-3xl">
          <div className="border-b border-line pb-6">
            <p className="eyebrow text-accent-deep">ADMIN · 단지 관리</p>
            <h1 className="mt-3 font-display text-[26px] font-extrabold tracking-tight text-ink-strong md:text-[32px]">
              {data.name}
            </h1>
          </div>
          <div className="mt-8 rounded-md border border-line bg-white p-6 md:p-8">
            <ComplexForm action={updateComplex} initial={initial} submitLabel="변경 저장" />
          </div>
        </div>
      </Container>
    </section>
  );
}
