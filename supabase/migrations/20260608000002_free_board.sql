-- =============================================================================
-- 20260608000002_free_board.sql
-- 자유게시판(board_type='free') 지원
--
-- 1) posts.board_type CHECK 에 'free' 추가
-- 2) author_name 컬럼 — profiles RLS(본인/admin만 SELECT)로 공개 게시판에서
--    타인 display_name 조인이 막히므로, 작성 시점에 표시명을 스냅샷 저장
-- 3) increment_post_view RPC — posts UPDATE RLS는 author/admin만 허용하므로
--    조회한 누구나 조회수를 +1 할 수 있도록 SECURITY DEFINER 함수로 제공
-- =============================================================================

alter table public.posts drop constraint posts_board_type_check;
alter table public.posts add constraint posts_board_type_check
  check (board_type in ('notice','gallery','news','resources','free'));

alter table public.posts add column if not exists author_name text;

create or replace function public.increment_post_view(p_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.posts set view_count = view_count + 1 where id = p_id;
$$;

grant execute on function public.increment_post_view(uuid) to anon, authenticated;
