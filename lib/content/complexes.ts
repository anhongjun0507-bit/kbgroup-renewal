import "server-only";
import { unstable_cache } from "next/cache";
import { CONTENT_TAGS } from "./tags";
import { FILE_COMPLEXES } from "./file-source";
import { createContentReadClient, isKillSwitchOn, logFallback } from "./source";
import type { ContentComplex } from "./types";

/**
 * 단지 읽기 어댑터.
 *
 * 172행 전체를 캐시 엔트리 **하나**로 잡고 파생 목록은 순수 함수로 만든다.
 * 단지 하나를 저장해도 무효화 대상이 이 엔트리 1개뿐이므로
 * 153개 상세 경로 광역 재검증이 원리적으로 발생하지 않는다 (E-12).
 */

const SELECT_COLUMNS =
  "id, slug, name, client, region, households, area, scope, period, kind, type, image, images, aliases, is_featured, is_active, sort_order, updated_at";

type Row = {
  id: string;
  slug: string;
  name: string;
  client: string | null;
  region: string;
  households: number | null;
  area: number | null;
  scope: string | null;
  period: string | null;
  kind: string | null;
  type: string | null;
  image: string | null;
  images: string[];
  aliases: string[];
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  updated_at: string;
};

/** DB row → 정규 타입. null 은 전부 undefined 로 정규화한다. */
function fromRow(r: Row): ContentComplex {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    client: r.client ?? undefined,
    region: r.region,
    households: r.households ?? undefined,
    area: r.area ?? undefined,
    scope: r.scope ?? undefined,
    period: r.period ?? undefined,
    kind: (r.kind ?? undefined) as ContentComplex["kind"],
    type: (r.type ?? undefined) as ContentComplex["type"],
    image: r.image ?? undefined,
    images: r.images ?? [],
    aliases: r.aliases ?? [],
    isFeatured: r.is_featured,
    isActive: r.is_active,
    sortOrder: r.sort_order,
    updatedAt: r.updated_at,
  };
}

/**
 * 캐시된 DB 리더. 실패하거나 결과가 비면 **throw** 한다.
 * 실패 결과를 캐시에 눌러앉히지 않기 위한 것 — 폴백 판단은 바깥 래퍼에서 한다.
 */
const fetchComplexesFromDb = unstable_cache(
  async (): Promise<ContentComplex[]> => {
    const supabase = createContentReadClient();
    const { data, error } = await supabase
      .from("complexes")
      .select(SELECT_COLUMNS)
      // 현재 단지 먼저, 각 그룹 내 sort_order = 원본 배열 순서 (화면 출력 순서)
      .order("is_active", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true });

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) throw new Error("complexes 결과가 비어 있음");
    return (data as Row[]).map(fromRow);
  },
  ["content", "complexes", "all"],
  { tags: [CONTENT_TAGS.complexes], revalidate: 3600 },
);

/** 172건 전체 (현재 → 과거 순). DB 모드 실패 시 파일 폴백. */
export async function getAllComplexes(): Promise<ContentComplex[]> {
  if (isKillSwitchOn()) return FILE_COMPLEXES;
  try {
    return await fetchComplexesFromDb();
  } catch (e) {
    logFallback("complexes", e);
    return FILE_COMPLEXES;
  }
}

/** 현재 운영 단지 (is_active = true). 파일의 `complexes` 배열에 대응. */
export async function getComplexes(): Promise<ContentComplex[]> {
  return (await getAllComplexes()).filter((c) => c.isActive);
}

/** 과거 운영 단지 (is_active = false). 파일의 `pastComplexes` 배열에 대응. */
export async function getPastComplexes(): Promise<ContentComplex[]> {
  return (await getAllComplexes()).filter((c) => !c.isActive);
}

/**
 * slug 로 단지 1건.
 * `activeOnly` 기본 true — /cases/[slug] 는 현재 단지만 상세 페이지를 가진다.
 * 과거 단지 slug 는 여기서 undefined 가 나와 기존과 동일하게 404 로 이어진다.
 */
export async function getComplexBySlug(
  slug: string,
  { activeOnly = true }: { activeOnly?: boolean } = {},
): Promise<ContentComplex | undefined> {
  const list = activeOnly ? await getComplexes() : await getAllComplexes();
  return list.find((c) => c.slug === slug);
}

/**
 * 라우트 파라미터 → DB 의 불변 slug.
 *
 * `params.slug` 는 Next 버전·경로에 따라 퍼센트 인코딩된 채로 오기도 하고
 * 디코드돼 오기도 한다(실측: Next 16.2.6 /cases/[slug] 은 **인코딩된 채로** 온다 —
 * 전환 전 코드가 decodeURIComponent 를 거쳤던 이유다).
 * decode → encode 로 정규화하면 두 경우 모두 같은 값이 나온다(멱등).
 *
 * 단지명에 "%" 가 들어가면 이 정규화가 깨지지만, 172건 전수 확인 결과 0건이고
 * slug 는 불변이라 이후에도 새 이름이 기존 slug 에 영향을 주지 않는다.
 */
export function toSlug(routeParam: string): string {
  try {
    return encodeURIComponent(decodeURIComponent(routeParam));
  } catch {
    // 잘못된 퍼센트 시퀀스 → 디코드 불가. 원본을 그대로 인코딩한다(어차피 매칭 실패 → 404).
    return encodeURIComponent(routeParam);
  }
}
