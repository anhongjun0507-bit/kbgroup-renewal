/**
 * Supabase Auth 에러 메시지(영문) → 한국어 매핑.
 *
 * Supabase 메시지가 변할 수 있으므로 정확 매칭 후 fallback 룩업 + 미매칭은 원문 반환.
 * Server Action에서 catch한 에러를 그대로 폼에 노출하지 말고 이 유틸을 통과시킬 것.
 */

const EXACT_MAP: Record<string, string> = {
  "User already registered": "이미 가입된 이메일입니다.",
  "Invalid login credentials": "이메일 또는 비밀번호가 일치하지 않습니다.",
  "Email not confirmed":
    "이메일 인증이 완료되지 않았습니다. 받은편지함의 인증 메일을 확인해주세요.",
  "Email rate limit exceeded":
    "이메일 발송 한도를 초과했습니다. 잠시 후 다시 시도해주세요.",
  "Signup requires a valid password": "비밀번호를 입력해주세요.",
  "Unable to validate email address: invalid format":
    "올바른 이메일 형식이 아닙니다.",
  "Password is too short":
    "비밀번호가 너무 짧습니다. 8자 이상으로 설정해주세요.",
  "New password should be different from the old password":
    "기존 비밀번호와 다른 비밀번호를 입력해주세요.",
};

/** 부분 일치 패턴 → 한국어. EXACT_MAP에 없는 경우 차례대로 검사. */
const PATTERN_MAP: Array<{ test: RegExp; ko: string }> = [
  {
    test: /Password should be at least (\d+) characters/i,
    ko: "비밀번호는 8자 이상이어야 합니다.",
  },
  {
    test: /For security purposes, you can only request this after (\d+) seconds/i,
    ko: "보안상 잠시 후 다시 시도해주세요.",
  },
  {
    test: /rate limit/i,
    ko: "요청이 너무 잦습니다. 잠시 후 다시 시도해주세요.",
  },
  {
    test: /invalid.+email/i,
    ko: "올바른 이메일 형식이 아닙니다.",
  },
];

export function translateAuthError(message: string | null | undefined): string {
  if (!message) return "알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";

  if (EXACT_MAP[message]) return EXACT_MAP[message];

  for (const { test, ko } of PATTERN_MAP) {
    if (test.test(message)) return ko;
  }

  return message;
}
