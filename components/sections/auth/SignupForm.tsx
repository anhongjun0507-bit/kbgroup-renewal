"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Container } from "@/components/ui";
import { signupAction, type SignupState } from "@/app/(auth)/signup/actions";

const INITIAL_STATE: SignupState = { error: null, fieldErrors: {} };

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(
    signupAction,
    INITIAL_STATE,
  );

  return (
    <section className="bg-cream pb-32">
      <Container>
        <form action={formAction} className="mx-auto max-w-md space-y-8">
          {state.error && (
            <p
              role="alert"
              className="border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {state.error}
            </p>
          )}

          <Field
            name="email"
            label="이메일"
            type="email"
            required
            autoComplete="email"
            error={state.fieldErrors?.email}
          />

          <Field
            name="password"
            label="비밀번호 (8자 이상)"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            error={state.fieldErrors?.password}
          />

          <Field
            name="passwordConfirm"
            label="비밀번호 확인"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            error={state.fieldErrors?.passwordConfirm}
          />

          <Field
            name="displayName"
            label="표시 이름 (선택)"
            type="text"
            autoComplete="nickname"
            error={state.fieldErrors?.displayName}
          />

          <button
            type="submit"
            disabled={isPending}
            className="mt-4 w-full bg-primary px-7 py-3.5 text-base font-medium tracking-[0.02em] text-white transition-all duration-300 hover:bg-primary-dark hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isPending ? "처리 중..." : "회원가입"}
          </button>

          <p className="pt-2 text-center text-sm text-ink-soft">
            이미 회원이신가요?{" "}
            <Link
              href="/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              로그인
            </Link>
          </p>
        </form>
      </Container>
    </section>
  );
}

interface FieldProps {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  error?: string;
}

function Field({ name, label, error, ...input }: FieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        /* Phase 14-B B-5 — 한글 라벨에 uppercase + tracking 0.2em는 글자 분리 ("이 메 일") → 정상화 */
        className="block text-[13px] font-semibold text-ink-muted"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        {...input}
        className="mt-2 w-full border-0 border-b border-line bg-transparent py-2 text-base text-ink transition-colors focus:border-primary"
      />
      {error && (
        <p className="mt-2 text-xs text-red-700">{error}</p>
      )}
    </div>
  );
}
