-- =============================================================================
-- 005_rls_policies.sql
-- 모든 테이블 RLS 활성화 + 정책 정의
-- 원칙:
--   - 모든 게시판 SELECT는 익명 포함 누구나 (회원가입 장벽 최소화)
--   - INSERT/UPDATE/DELETE는 author 본인 또는 admin
--   - profiles는 본인 또는 admin만 SELECT (개인정보)
--   - admin_logs는 admin SELECT만, INSERT는 admin, UPDATE/DELETE 차단 (append-only)
-- =============================================================================

alter table public.profiles    enable row level security;
alter table public.posts       enable row level security;
alter table public.attachments enable row level security;
alter table public.admin_logs  enable row level security;

-- -----------------------------------------------------------------------------
-- profiles: 본인 SELECT/UPDATE, admin은 전체. role 변경 차단은 트리거에서.
-- -----------------------------------------------------------------------------
create policy profiles_select_own_or_admin
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

create policy profiles_update_own_or_admin
  on public.profiles for update
  to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- INSERT는 handle_new_user 트리거(security definer)만 사용. 직접 INSERT 차단.
-- DELETE는 auth.users CASCADE로만 (직접 DELETE 차단).

-- -----------------------------------------------------------------------------
-- posts: SELECT 공개, 작성·수정·삭제는 author 또는 admin
-- -----------------------------------------------------------------------------
create policy posts_select_public
  on public.posts for select
  to anon, authenticated
  using (true);

create policy posts_insert_authenticated
  on public.posts for insert
  to authenticated
  with check (author_id = auth.uid() or public.is_admin());

create policy posts_update_author_or_admin
  on public.posts for update
  to authenticated
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());

create policy posts_delete_author_or_admin
  on public.posts for delete
  to authenticated
  using (author_id = auth.uid() or public.is_admin());

-- -----------------------------------------------------------------------------
-- attachments: SELECT 공개, 작성·삭제는 해당 post의 author 또는 admin
-- -----------------------------------------------------------------------------
create policy attachments_select_public
  on public.attachments for select
  to anon, authenticated
  using (true);

create policy attachments_insert_author_or_admin
  on public.attachments for insert
  to authenticated
  with check (
    public.is_admin() or exists (
      select 1 from public.posts p
      where p.id = attachments.post_id and p.author_id = auth.uid()
    )
  );

create policy attachments_update_author_or_admin
  on public.attachments for update
  to authenticated
  using (
    public.is_admin() or exists (
      select 1 from public.posts p
      where p.id = attachments.post_id and p.author_id = auth.uid()
    )
  )
  with check (
    public.is_admin() or exists (
      select 1 from public.posts p
      where p.id = attachments.post_id and p.author_id = auth.uid()
    )
  );

create policy attachments_delete_author_or_admin
  on public.attachments for delete
  to authenticated
  using (
    public.is_admin() or exists (
      select 1 from public.posts p
      where p.id = attachments.post_id and p.author_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- admin_logs: admin 전용 (SELECT/INSERT). UPDATE/DELETE 정책 없음 → 차단.
-- -----------------------------------------------------------------------------
create policy admin_logs_select_admin
  on public.admin_logs for select
  to authenticated
  using (public.is_admin());

create policy admin_logs_insert_admin
  on public.admin_logs for insert
  to authenticated
  with check (public.is_admin() and actor_id = auth.uid());
