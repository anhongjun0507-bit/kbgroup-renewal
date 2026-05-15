"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Container } from "@/components/ui";
import { loginAction, type LoginState } from "@/app/(auth)/login/actions";

const INITIAL_STATE: LoginState = { error: null };

interface Props {
  /** 로그인 성공 후 이동할 경로 (?next= 쿼리) */
  next?: string;
}

export function LoginForm({ next }: Props) {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    INITIAL_STATE,
  );

  return (
    <section className="bg-cream pb-32">
      <Container>
        <form action={formAction} className="mx-auto max-w-md space-y-8">
          {/* next 경로를 hidden input으로 server action에 전달 */}
          {next && <input type="hidden" name="next" value={next} />}

          {state.error && (
            <p
              role="alert"
              className="border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {state.error}
            </p>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium uppercase tracking-[0.2em] text-ink-muted"
            >
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-2 w-full border-0 border-b border-line bg-transparent py-2 text-base text-ink outline-none transition-colors focus:border-primary"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium uppercase tracking-[0.2em] text-ink-muted"
            >
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-2 w-full border-0 border-b border-line bg-transparent py-2 text-base text-ink outline-none transition-colors focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="mt-4 w-full bg-primary px-7 py-3.5 text-base font-medium tracking-[0.02em] text-white transition-all duration-300 hover:bg-primary-dark hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isPending ? "로그인 중..." : "로그인"}
          </button>

          <p className="pt-2 text-center text-sm text-ink-soft">
            아직 회원이 아니신가요?{" "}
            <Link
              href="/signup"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              회원가입
            </Link>
          </p>
        </form>
      </Container>
    </section>
  );
}
