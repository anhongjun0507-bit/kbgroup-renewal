import type { Metadata } from "next";
import { PageHero } from "@/components/sections/common/PageHero";
import { LoginForm } from "@/components/sections/auth/LoginForm";

export const metadata: Metadata = {
  title: "로그인 | (주)케이비개발",
  description: "케이비개발 사이트에 로그인하세요.",
};

interface Props {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams;

  return (
    <>
      <PageHero
        kicker="SIGN IN · 로그인"
        title="다시 만나서 반갑습니다"
        italicWord="반갑습니다"
        subtitle="가입하신 이메일과 비밀번호로 로그인해주세요."
        breadcrumb={[
          { label: "HOME", href: "/" },
          { label: "LOGIN" },
        ]}
      />
      <LoginForm next={next} />
    </>
  );
}
