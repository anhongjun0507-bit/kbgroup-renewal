"use client";

import { useActionState } from "react";
import {
  updateDisplayName,
  updatePassword,
  INITIAL_FORM_STATE,
  type FormState,
} from "@/app/(auth)/mypage/actions";

interface Props {
  currentDisplayName: string | null;
}

export function MypageForms({ currentDisplayName }: Props) {
  return (
    <div className="space-y-16">
      <DisplayNameSection current={currentDisplayName} />
      <PasswordSection />
      <LogoutSection />
    </div>
  );
}

function DisplayNameSection({ current }: { current: string | null }) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    updateDisplayName,
    INITIAL_FORM_STATE,
  );

  return (
    <section className="space-y-4">
      <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
        표시 이름
      </h2>
      <form action={formAction} className="space-y-4">
        <input
          name="displayName"
          type="text"
          defaultValue={current ?? ""}
          maxLength={50}
          placeholder="표시할 이름"
          className="w-full border-0 border-b border-line bg-transparent py-2 text-base text-ink transition-colors focus:border-primary"
        />
        <FormMessage state={state} />
        <button
          type="submit"
          disabled={isPending}
          className="border border-primary px-6 py-2.5 text-sm font-medium text-primary transition-all duration-300 hover:bg-primary hover:text-white disabled:opacity-50"
        >
          {isPending ? "저장 중..." : "표시 이름 변경"}
        </button>
      </form>
    </section>
  );
}

function PasswordSection() {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    updatePassword,
    INITIAL_FORM_STATE,
  );

  return (
    <section className="space-y-4">
      <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
        비밀번호 변경
      </h2>
      <form action={formAction} className="space-y-6">
        <div>
          <label
            htmlFor="new-password"
            className="block text-xs uppercase tracking-[0.15em] text-ink-muted"
          >
            새 비밀번호 (8자 이상)
          </label>
          <input
            id="new-password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-2 w-full border-0 border-b border-line bg-transparent py-2 text-base text-ink transition-colors focus:border-primary"
          />
        </div>
        <div>
          <label
            htmlFor="new-password-confirm"
            className="block text-xs uppercase tracking-[0.15em] text-ink-muted"
          >
            새 비밀번호 확인
          </label>
          <input
            id="new-password-confirm"
            name="passwordConfirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-2 w-full border-0 border-b border-line bg-transparent py-2 text-base text-ink transition-colors focus:border-primary"
          />
        </div>
        <FormMessage state={state} />
        <button
          type="submit"
          disabled={isPending}
          className="border border-primary px-6 py-2.5 text-sm font-medium text-primary transition-all duration-300 hover:bg-primary hover:text-white disabled:opacity-50"
        >
          {isPending ? "변경 중..." : "비밀번호 변경"}
        </button>
      </form>
    </section>
  );
}

function LogoutSection() {
  return (
    <section className="space-y-4 border-t border-line pt-12">
      <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">
        로그아웃
      </h2>
      <form action="/auth/logout" method="POST">
        <button
          type="submit"
          className="border border-line px-6 py-2.5 text-sm font-medium text-ink-soft transition-colors duration-300 hover:border-ink hover:text-ink"
        >
          로그아웃
        </button>
      </form>
    </section>
  );
}

function FormMessage({ state }: { state: FormState }) {
  if (state.status === "idle") return null;
  const isError = state.status === "error";
  return (
    <p
      role={isError ? "alert" : "status"}
      className={
        isError
          ? "text-xs text-red-700"
          : "text-xs text-primary"
      }
    >
      {state.message}
    </p>
  );
}
