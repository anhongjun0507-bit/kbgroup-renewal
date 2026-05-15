-- =============================================================================
-- 002_posts.sql
-- posts 테이블 (4개 게시판 통합: notice·gallery·news·resources)
-- post_number: board_type별 채번. advisory lock + MAX+1 방식 → 트랜잭션 롤백 시 빵꾸 없음.
-- =============================================================================

create table public.posts (
  id          uuid primary key default gen_random_uuid(),
  board_type  text not null check (board_type in ('notice','gallery','news','resources')),
  post_number integer not null,
  title       text not null check (char_length(title) between 1 and 200),
  content     text,
  author_id   uuid references public.profiles(id) on delete set null,
  is_pinned   boolean not null default false,
  view_count  integer not null default 0 check (view_count >= 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (board_type, post_number)
);

-- 게시판 목록 쿼리: 상단고정 우선, 최신순
create index posts_board_pinned_created_idx
  on public.posts(board_type, is_pinned desc, created_at desc);

create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- post_number 자동 할당 (board_type별 advisory lock + MAX+1)
-- sequence 방식 대비 장점: 트랜잭션 롤백 시 번호 빵꾸 없음 (1,2,3,4 연속).
-- 비용: 같은 board_type 동시 INSERT 시 lock 대기 (게시판 트래픽 수준에선 무시 가능).
create or replace function public.assign_post_number()
returns trigger
language plpgsql
as $$
begin
  if new.post_number is null or new.post_number = 0 then
    -- 같은 board_type 내 직렬화 (트랜잭션 종료 시 자동 해제)
    perform pg_advisory_xact_lock(hashtext('posts_number_' || new.board_type));
    select coalesce(max(post_number), 0) + 1
      into new.post_number
      from public.posts
     where board_type = new.board_type;
  end if;
  return new;
end;
$$;

create trigger posts_assign_number
  before insert on public.posts
  for each row execute function public.assign_post_number();
