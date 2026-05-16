"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Container, Input, Label } from "@/components/ui";
import { loginAction, type LoginState } from "@/app/(auth)/login/actions";

/* Phase 10 P1-07 / P1-10 — 단일 Input/Label 적용 + 비밀번호 찾기·회원가입 동선 */

const INITIAL_STATE: LoginState = { error: null };

interface Props {
  next?: string;
}

export function LoginForm({ next }: Props) {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    INITIAL_STATE,
  );

  return (
    <section className="section bg-white">
      <Container>
        <form action={formAction} className="mx-auto max-w-md space-y-6">
          {next && <input type="hidden" name="next" value={next} />}

          {state.error && (
            <p
              role="alert"
              className="rounded-md border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger"
            >
              {state.error}
            </p>
          )}

          <div>
            <Label htmlFor="email" required>
              이메일
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="example@company.com"
            />
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <Label htmlFor="password" required>
                비밀번호
              </Label>
              <Link
                href="/forgot-password"
                className="mb-2 text-[12px] font-medium text-ink-faint transition-colors hover:text-accent-700"
              >
                비밀번호 찾기
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-12 w-full items-center justify-center rounded-md bg-accent-500 text-base font-bold text-navy-900 transition-all duration-200 [transition-timing-function:var(--ease)] hover:bg-accent-600 hover:text-white hover:shadow-[var(--shadow-cta)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "로그인 중..." : "로그인"}
          </button>

          <p className="pt-2 text-center text-sm text-ink-muted">
            아직 회원이 아니신가요?{" "}
            <Link
              href="/signup"
              className="font-semibold text-accent-700 underline-offset-4 hover:underline"
            >
              회원가입
            </Link>
          </p>
        </form>
      </Container>
    </section>
  );
}
