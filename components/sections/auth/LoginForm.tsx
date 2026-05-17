"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Container, Input, Label } from "@/components/ui";
import { loginAction, type LoginState } from "@/app/(auth)/login/actions";
import { contact } from "@/data/site-content";

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
                className="mb-2 text-[12px] font-medium text-ink-faint transition-colors hover:text-accent-deep"
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
              placeholder="비밀번호 입력"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-12 w-full items-center justify-center rounded-md bg-accent-500 text-base font-bold text-navy-900 transition-all duration-200 [transition-timing-function:var(--ease)] hover:bg-accent-600 hover:text-white hover:shadow-[var(--shadow-cta)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "로그인 중..." : "로그인"}
          </button>

          {/* Phase 11 P2-B — 회원가입 + 운영 담당자 동선 명확화 */}
          <div className="pt-4 space-y-3 text-center">
            <p className="text-sm text-ink-muted">
              아직 회원이 아니신가요?{" "}
              <Link
                href="/signup"
                className="font-semibold text-accent-deep underline-offset-4 hover:underline"
              >
                회원가입
              </Link>
            </p>
            <p className="text-[13px] text-ink-faint">
              초기 계정 발급은 운영 담당자에게 문의해 주세요 ·{" "}
              <a
                href={`tel:${contact.phone}`}
                className="font-semibold text-ink-muted underline-offset-4 hover:text-accent-deep hover:underline"
              >
                {contact.phone}
              </a>
            </p>
          </div>
        </form>
      </Container>
    </section>
  );
}
