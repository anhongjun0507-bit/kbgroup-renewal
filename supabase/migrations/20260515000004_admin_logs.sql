-- =============================================================================
-- 004_admin_logs.sql
-- 관리자 작업 감사 로그 (append-only). UPDATE/DELETE는 RLS에서 차단.
-- action 예시: 'post.create', 'post.update', 'post.delete', 'role.grant', 'attachment.delete'
-- metadata: 자유 jsonb (변경 전/후 값, 사유 등)
-- =============================================================================

create table public.admin_logs (
  id          bigserial primary key,
  actor_id    uuid references public.profiles(id) on delete set null,
  action      text not null,
  target_type text,
  target_id   text,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index admin_logs_created_idx       on public.admin_logs(created_at desc);
create index admin_logs_actor_created_idx on public.admin_logs(actor_id, created_at desc);
