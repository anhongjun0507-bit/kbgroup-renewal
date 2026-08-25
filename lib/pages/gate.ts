import "server-only";
import { notFound } from "next/navigation";
import { getViewer } from "@/lib/auth";
import { getPublishedMap, isPublished } from "./published";

/**
 * 페이지 진입 가드. 비공개면 `notFound()` — **리다이렉트하지 않는다.**
 * 301/302 는 검색엔진에 "이 문서는 옮겨졌다"는 신호라, 다시 공개로 돌렸을 때
 * 색인 회복이 느리다. 404 는 "지금은 없다"라서 되돌리면 그대로 회복된다.
 *
 * 관리자에게는 미리보기를 허용하고 `{ preview: true }` 를 돌려준다(페이지가 배너를 띄운다).
 * 뷰어 조회(쿠키+profiles 1회)는 **비공개일 때만** 한다 — 공개 페이지의 정상 경로에는
 * 캐시된 맵 조회 외에 아무 비용도 붙지 않는다.
 *
 * `published.ts` 와 파일을 나눈 이유: 이 모듈은 `getViewer()` 를 통해 `next/headers` 를 끌어온다.
 * `app/sitemap.ts` 는 쿠키를 읽지 않는 정적 라우트(`○`)이므로 그 체인이 닿으면 안 된다.
 */
export async function requirePublished(path: string): Promise<{ preview: boolean }> {
  const map = await getPublishedMap();
  if (isPublished(map, path)) return { preview: false };

  const { isAdmin } = await getViewer();
  if (!isAdmin) notFound();
  return { preview: true };
}
