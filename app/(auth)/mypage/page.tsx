import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHero } from "@/components/sections/common/PageHero";
import { MypageForms } from "@/components/sections/auth/MypageForms";
import { Container } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "마이페이지 | (주)케이비개발",
  description: "회원 정보 관리.",
};

export default async function MypagePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/mypage");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role, created_at")
    .eq("id", user.id)
    .single();

  const joinedAt = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

  return (
    <>
      <PageHero
        kicker="MY PAGE · 마이페이지"
        title="회원 정보"
        italicWord="회원"
        subtitle="기본 정보 확인과 표시 이름·비밀번호 변경을 할 수 있습니다."
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "MY PAGE" },
        ]}
      />
      <section className="bg-cream pb-32">
        <Container>
          <div className="mx-auto max-w-md space-y-16">
            <div className="space-y-6 border border-line bg-white p-6">
              <Info label="이메일" value={user.email ?? "-"} />
              <Info label="가입일" value={joinedAt} />
              {profile?.role === "admin" && (
                <Info label="권한" value="관리자" highlight />
              )}
            </div>

            <MypageForms currentDisplayName={profile?.display_name ?? null} />
          </div>
        </Container>
      </section>
    </>
  );
}

function Info({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">
        {label}
      </p>
      <p
        className={`mt-1 text-base ${
          highlight ? "font-medium text-primary" : "text-ink"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
