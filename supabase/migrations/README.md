# Supabase Migrations — KB GROUP Renewal

PHASE 2 데이터 모델. 4개 게시판 통합 + 인증 + 첨부 + 감사 로그.

---

## 실행 순서

파일명 prefix가 곧 적용 순서다. **이전 파일이 만든 함수·테이블에 의존**하므로 절대 순서를 바꾸지 말 것.

파일명은 Supabase 표준인 14자리 timestamp 포맷. 마지막 6자리(`000001` ~ `000006`)가 시퀀스 번호 역할.

| # | 파일 | 무엇을 만드나 | 의존 |
|---|------|------|------|
| 001 | `20260515000001_profiles.sql` | `set_updated_at()`, `is_admin()`, `profiles` 테이블, `handle_new_user` / `prevent_role_change` 트리거 | — |
| 002 | `20260515000002_posts.sql` | `posts` 테이블, board_type별 `post_number` 자동 채번 트리거 (advisory lock) | 001 (set_updated_at) |
| 003 | `20260515000003_attachments.sql` | `attachments` 테이블, 게시판별 첨부 수 강제 트리거 | 002 (posts.id 참조) |
| 004 | `20260515000004_admin_logs.sql` | `admin_logs` 테이블 (append-only) | 001 (profiles.id 참조) |
| 005 | `20260515000005_rls_policies.sql` | 전 테이블 RLS 활성화 + 정책 | 001 (is_admin) |
| 006 | `20260515000006_storage_buckets.sql` | `gallery` · `resources` 버킷 + Storage RLS | 001 (is_admin) |

---

## 적용 방법

`SUPABASE_ACCESS_TOKEN` 은 `.env.local` 에 있음.

```bash
export SUPABASE_ACCESS_TOKEN=$(grep '^SUPABASE_ACCESS_TOKEN=' .env.local | cut -d= -f2-)

# 최초 1회: 프로젝트 연결
npx supabase link --project-ref yydvpwjvxyhyplzpxdds

# 마이그레이션 적용
npx supabase db push
```

재적용·재실행 안전성: 모든 파일은 `create ...` 기반이라 두 번 돌리면 충돌난다.
재실행이 필요하면 Supabase Dashboard → SQL Editor에서 `drop` 후 다시 push.

---

## 첫 관리자 지정 (seed)

`supabase/seed/first_admin.sql` 는 git에 커밋되는 **템플릿**.
실제 이메일을 박지 말고, 로컬에서 복사해 실행한다.

```bash
# 1. Supabase Dashboard → Authentication → 사용자 추가 (admin@kb-dvp.com 등)
# 2. 템플릿 복사 후 이메일 교체
cp supabase/seed/first_admin.sql /tmp/first_admin.local.sql
# /tmp/first_admin.local.sql 에서 'admin@example.com' → 실제 이메일로 교체
# 3. Supabase Dashboard → SQL Editor 에 붙여넣어 실행
```

또는 CLI:

```bash
npx supabase db execute --file /tmp/first_admin.local.sql
```

`prevent_role_change` 트리거는 `auth.uid()` 가 비어있는 SQL Editor 컨텍스트에서 실패하므로,
seed 스크립트가 트리거를 일시 disable → update → re-enable 처리한다.

---

## 주요 설계 결정

- **board 분리 vs 통합**: 통합 (`posts.board_type`). 게시판별 정책은 트리거·체크 제약으로.
- **post_number 채번**: advisory lock + `MAX+1`. sequence 대비 빵꾸 없음, 트래픽 수준에서 lock 비용 무시 가능.
- **갤러리 대표 이미지**: 별도 컬럼 없이 `attachments.display_order` 최소값 (0-indexed).
- **자료실 SELECT**: 공개 (비로그인 OK). 회원가입 장벽 최소화. 향후 회원 전용 자료 생기면 별도 private 버킷 분리 권장.
- **profiles 컬럼**: phone·avatar_url 없음. 개인정보 최소 수집 원칙.
- **admin_logs**: append-only. UPDATE/DELETE 정책 없음 → RLS가 차단.

---

## 향후 변경 시 주의

- `prevent_role_change` 우회는 첫 admin seed에만. 이후 role 부여는 admin이 앱 UI에서 수행 (auth.uid() 통과).
- 게시판 추가 시:
  1. `002_posts.sql` 의 `check (board_type in (...))` 에 추가
  2. `002_posts.sql` 의 `assign_post_number()` 함수는 board_type 무관 — 그대로 동작
  3. `003_attachments.sql` 의 `check_attachment_count()` 에 limit 추가
- 첨부 수·크기 한도 변경은 트리거 함수 + Storage 버킷 옵션 **둘 다** 수정.
