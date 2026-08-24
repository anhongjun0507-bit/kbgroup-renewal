/**
 * Node 22 타입 스트리핑으로 `lib/content/*` 를 Next 런타임 밖에서 직접 실행하기 위한
 * ESM resolve 훅. (scripts/verify-content-adapter.ts 전용)
 *
 *  - "server-only"  → 빈 모듈 (Next 번들러가 제공하는 가드라 Node 에는 없다)
 *  - "next/cache"   → unstable_cache 를 패스스루로 스텁 (캐시 없이 원함수 그대로 호출)
 *  - "@/x"          → <repo>/x
 *  - 확장자 없는 상대 경로 → .ts 우선 시도
 *
 * 사용: node --experimental-strip-types --import ./scripts/node-ts-register.mjs scripts/xxx.ts
 */
import { pathToFileURL } from "node:url";

const ROOT = pathToFileURL(process.cwd() + "/").href;
const NEXT_CACHE_STUB =
  "export const unstable_cache = (fn) => fn;" +
  "export const revalidateTag = () => {};" +
  "export const updateTag = () => {};" +
  "export const revalidatePath = () => {};";

export async function resolve(spec, ctx, next) {
  if (spec === "server-only") {
    return { url: "data:text/javascript,", shortCircuit: true };
  }
  if (spec === "next/cache") {
    return {
      url: "data:text/javascript," + encodeURIComponent(NEXT_CACHE_STUB),
      shortCircuit: true,
    };
  }
  let s = spec;
  if (s.startsWith("@/")) s = new URL(s.slice(2), ROOT).href;
  if (!/\.[a-z]+$/.test(s) && (s.startsWith(".") || s.startsWith("file:"))) {
    try {
      return await next(s + ".ts", ctx);
    } catch {
      /* 확장자 없는 패키지 스펙일 수 있다 — 아래 기본 해석으로 넘긴다 */
    }
  }
  return next(s, ctx);
}
