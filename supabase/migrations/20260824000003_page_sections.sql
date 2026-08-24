-- =============================================================================
-- 20260824000003_page_sections.sql
-- PLAN B / DAY 1 — ITEM 02 「섹션 구성 관리」. 페이지별 섹션의 표시·숨김과 순서.
--
-- page_key    : 페이지 식별자 (예: 'home', 'about', 'about/ceo', 'business', 'cases' …)
-- section_key : DAY 7 에 만드는 섹션 레지스트리의 키 (예: 'hero', 'data-counter', 'cases')
--               레지스트리에 없는 키는 렌더러가 무시한다(고아 행 허용 — 코드 롤백 시 데이터 보존).
-- sort_order  : 위/아래 화살표로만 조정한다. 자유 DnD 는 범위 밖.
-- =============================================================================

create table public.page_sections (
  id          uuid primary key default gen_random_uuid(),
  page_key    text not null check (char_length(page_key) between 1 and 100),
  section_key text not null check (char_length(section_key) between 1 and 100),
  is_visible  boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (page_key, section_key)
);

create index page_sections_page_idx on public.page_sections(page_key, sort_order, id);

create trigger page_sections_set_updated_at
  before update on public.page_sections
  for each row execute function public.set_updated_at();

alter table public.page_sections enable row level security;

create policy page_sections_select_public
  on public.page_sections for select
  to anon, authenticated
  using (true);

create policy page_sections_admin_insert
  on public.page_sections for insert
  to authenticated
  with check (public.is_admin());

create policy page_sections_admin_update
  on public.page_sections for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy page_sections_admin_delete
  on public.page_sections for delete
  to authenticated
  using (public.is_admin());
