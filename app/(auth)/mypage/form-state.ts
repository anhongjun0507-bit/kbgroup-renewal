/**
 * 마이페이지 폼 공유 상태/타입.
 *
 * ⚠️ actions.ts는 `"use server"` 파일이라 async 함수 외의 값(객체·상수)을
 * export할 수 없다. 따라서 초기 상태 상수·타입은 이 일반 모듈에 두고
 * 서버 액션(actions.ts)과 클라이언트 컴포넌트(MypageForms.tsx)가 함께 import 한다.
 */
export type FormState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export const INITIAL_FORM_STATE: FormState = { status: "idle", message: null };
