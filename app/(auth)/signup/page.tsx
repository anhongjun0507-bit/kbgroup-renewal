import type { Metadata } from "next";
import { PageHero } from "@/components/sections/common/PageHero";
import { SignupForm } from "@/components/sections/auth/SignupForm";

export const metadata: Metadata = {
  title: "회원가입 | (주)케이비개발",
  description: "이메일과 비밀번호로 케이비개발 사이트에 가입하세요.",
};

export default function SignupPage() {
  return (
    <>
      <PageHero
        kicker="JOIN US · 회원가입"
        title="당신과 함께"
        italicWord="당신"
        subtitle="가입 신청 후 관리자 승인이 완료되면 자료실 다운로드 등 회원 기능을 이용하실 수 있습니다."
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "JOIN" },
        ]}
      />
      <SignupForm />
    </>
  );
}
