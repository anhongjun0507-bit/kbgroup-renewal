-- =============================================================================
-- 20260608000004_post_comments.sql
-- 자유게시판 댓글·답글(대댓글). parent_id가 null이면 댓글, 있으면 답글.
--
-- RLS: SELECT 공개, INSERT는 로그인 유저(본인 author_id), UPDATE/DELETE는 작성자·admin.
-- author_name: 공개 게시판이라 profiles 조인이 막히므로 작성 시점 표시명 스냅샷.
-- =============================================================================

create table public.post_comments (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.posts(id) on delete cascade,
  parent_id   uuid references public.post_comments(id) on delete cascade,
  author_id   uuid references public.profiles(id) on delete set null,
  author_name text,
  content     text not null check (char_length(content) between 1 and 2000),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index post_comments_post_idx
  on public.post_comments(post_id, created_at);
create index post_comments_parent_idx
  on public.post_comments(parent_id);

create trigger post_comments_set_updated_at
  before update on public.post_comments
  for each row execute function public.set_updated_at();

alter table public.post_comments enable row level security;

create policy post_comments_select_public
  on public.post_comments for select
  to anon, authenticated
  using (true);

create policy post_comments_insert_authenticated
  on public.post_comments for insert
  to authenticated
  with check (author_id = auth.uid());

create policy post_comments_update_author_or_admin
  on public.post_comments for update
  to authenticated
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());

create policy post_comments_delete_author_or_admin
  on public.post_comments for delete
  to authenticated
  using (author_id = auth.uid() or public.is_admin());
