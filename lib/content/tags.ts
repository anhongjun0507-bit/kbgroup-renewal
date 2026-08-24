/**
 * 콘텐츠 캐시 태그 네임스페이스 (PROGRESS §10-1 확정 규약).
 *
 * 리더는 unstable_cache(..., { tags, revalidate: 3600 }) 로 감싸고,
 * 무효화는 Server Action 안에서 updateTag(tag) 로 한다.
 * Server Action 밖에서 불가피할 때만 revalidateTag(tag, "max") — 2번째 인자 생략 금지.
 * revalidatePath("/", "layout") 광역 무효화는 쓰지 않는다 (E-12).
 */
export const CONTENT_TAGS = {
  complexes: "content:complexes",
  settings: "content:settings",
  sections: "content:sections",
  nav: "content:nav",
  pages: "content:pages",
} as const;

export type ContentTag = (typeof CONTENT_TAGS)[keyof typeof CONTENT_TAGS];
