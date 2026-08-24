-- =============================================================================
-- 20260824000001_content_complexes.sql
-- PLAN B / DAY 1 — 단지 마스터. data/site-content.ts 의 complexes(153) + pastComplexes(19)
--                  = 172건을 한 테이블로 통합하고 is_active 로 현재/과거를 구분한다.
--
-- 필드 차이 흡수:
--   - complexes 에만 있던 scope  → scope 컬럼 (pastComplexes 행은 null)
--   - pastComplexes 에만 있던 period → period 컬럼 (complexes 행은 null)
--   - 나머지(name·client·region·households·area·kind·type·image·images·aliases·isFeatured)는 동일 필드명
--   - type 은 "민간"이 배열에 명시된 적이 없다(= 미지정이 민간). null 을 그대로 보존한다.
--   - 배열 순서(지역별 그룹 정렬)가 화면 출력 순서이므로 sort_order 로 보존한다.
--
-- slug (E-1): 현재 /cases/[slug] 는 encodeURIComponent(name) 로 URL 을 만든다.
--   시드 시 slug 는 그 결과와 코드포인트 단위로 동일해야 하며, 이후 name 이 바뀌어도
--   slug 는 바뀌지 않는다. 트리거로 UPDATE 시 slug 변경을 물리적으로 차단한다.
--
-- updated_at (E-8): 낙관적 잠금용. 수정 폼이 읽어온 updated_at 과 다르면 저장 거부.
-- =============================================================================

create table public.complexes (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name         text not null check (char_length(name) between 1 and 200),
  client       text,
  region       text not null default '',
  households   integer check (households is null or households >= 0),
  area         numeric(14,4) check (area is null or area >= 0),   -- 관리면적 ㎡
  scope        text,                                              -- 관리 분야 (complexes 전용)
  period       text,                                              -- 계약 기간 (pastComplexes 전용)
  kind         text check (kind is null or kind in ('apartment','mixed-use')),
  type         text check (type is null or type in ('LH','민간','공공')),
  image        text,
  images       text[] not null default '{}',
  aliases      text[] not null default '{}',
  is_featured  boolean not null default false,
  is_active    boolean not null default true,   -- true = 현재 운영, false = 과거(pastComplexes)
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index complexes_active_sort_idx on public.complexes(is_active, sort_order, id);
create index complexes_region_idx       on public.complexes(region);
create index complexes_type_idx         on public.complexes(type) where type is not null;
create index complexes_featured_idx     on public.complexes(is_featured) where is_featured;
-- slug 는 unique 제약이 인덱스를 겸한다.

create trigger complexes_set_updated_at
  before update on public.complexes
  for each row execute function public.set_updated_at();

-- slug 불변 강제 (E-1). 관리자가 단지명을 바꿔도 URL 은 절대 바뀌지 않는다.
create or replace function public.prevent_complex_slug_change()
returns trigger
language plpgsql
as $$
begin
  if new.slug is distinct from old.slug then
    raise exception 'complexes.slug 는 불변입니다 (기존 URL 보존). old=% new=%', old.slug, new.slug;
  end if;
  return new;
end;
$$;

create trigger complexes_slug_immutable
  before update on public.complexes
  for each row execute function public.prevent_complex_slug_change();

alter table public.complexes enable row level security;

create policy complexes_select_public
  on public.complexes for select
  to anon, authenticated
  using (true);

create policy complexes_admin_insert
  on public.complexes for insert
  to authenticated
  with check (public.is_admin());

create policy complexes_admin_update
  on public.complexes for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy complexes_admin_delete
  on public.complexes for delete
  to authenticated
  using (public.is_admin());
