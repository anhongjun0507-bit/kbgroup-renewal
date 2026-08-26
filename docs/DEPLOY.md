# 프로덕션 배포 절차서

> 대상: `kbgroup-renewal` (Next.js 16.2.6 · Supabase · Vercel)
> 이 문서만 보고 순서대로 실행하면 된다. 작성 기준일 2026-08-26 (PLAN B / DAY 10).
> **배포는 사람이 실행한다.** 이 저장소는 Vercel Git 연동이 아니라 CLI 수동 배포다 —
> `git push` 로는 어떤 배포도 일어나지 않는다.

---

## 0. 한눈에 보는 순서

```
① 배포 전 확인 (환경변수 · 마이그레이션 · 빌드)
② 배포 실행    npx vercel --prod --token=$VERCEL_TOKEN
③ 배포 직후 체크리스트 8항목
④ 문제가 생기면 롤백 (2단계)
```

소요 시간: ① 5분 · ② 4~6분 · ③ 10분.

---

## 1. 배포 전 확인

### 1-1. 로컬 환경변수 (`.env.local`)

`.env.local` 은 git 에 올라가지 않는다. 배포 실행 머신에 아래 값이 있어야 한다.

| 키 | 용도 | 배포에 필요 |
|----|------|:---:|
| `NEXT_PUBLIC_SUPABASE_URL` | 브라우저·서버 공용 | ○ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 브라우저·서버 공용 (RLS 로 보호) | ○ |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 전용. 시드 스크립트 | 시드 시 |
| `VERCEL_TOKEN` | **배포 명령에 쓴다.** `vercel --token=$VERCEL_TOKEN` | ○ |
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI / Management API | 마이그레이션 시 |
| `CONTENT_SOURCE` | **미설정 = db 모드.** `file` 이면 킬스위치 | 롤백 시 |

확인:

```bash
cd /home/dev/kbgroup-renewal
grep -E '^(NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_ANON_KEY|VERCEL_TOKEN)=' .env.local | sed 's/=.*/=<설정됨>/'
```

세 줄이 다 나와야 한다.

> `SUPABASE_SERVICE_ROLE_KEY` · `VERCEL_TOKEN` 에 **`NEXT_PUBLIC_` 접두사를 절대 붙이지 않는다.**
> 붙이면 브라우저 번들에 그대로 실려 나간다.

### 1-2. Vercel 프로젝트 환경변수

Vercel 대시보드 → 프로젝트 → Settings → Environment Variables (Production) 에 아래 2개가 있어야 한다.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

`SUPABASE_SERVICE_ROLE_KEY` 는 **런타임에 쓰지 않는다**(시드 스크립트 전용). 넣지 않아도 된다.
`CONTENT_SOURCE` 는 **평소에는 넣지 않는다**(미설정 = DB 모드). 롤백할 때만 넣는다(§4-2).

CLI 로 확인:

```bash
npx vercel env ls production --token=$VERCEL_TOKEN
```

### 1-3. 마이그레이션 적용 여부

**미적용 마이그레이션이 있는 채로 배포하면 안 된다.** DB 에 없는 테이블을 코드가 읽으면
어댑터 폴백이 잡아 주긴 하지만(사이트는 살아 있다) 관리자 화면이 통째로 실패한다.

PLAN B 에서 추가된 마이그레이션 10종 — 전부 **이미 적용 완료**다.

```
20260824000001_content_complexes.sql          20260824000006_content_revisions.sql
20260824000002_site_settings.sql              20260824000007_content_storage_buckets.sql
20260824000003_page_sections.sql              20260824000008_content_revisions_select_admin.sql
20260824000004_nav_items.sql                  20260825000001_hero_slides_setting.sql
20260824000005_pages.sql                      20260825000002_business_gallery_ceo_portrait.sql
```

확인 (DB 에 표가 실제로 있는지):

```bash
node -e '
const fs=require("fs");
const env=Object.fromEntries(fs.readFileSync(".env.local","utf8").split("\n")
  .filter(l=>l.includes("=")&&!l.trim().startsWith("#"))
  .map(l=>{const i=l.indexOf("=");return [l.slice(0,i).trim(),l.slice(i+1).trim()];}));
const {createClient}=require("@supabase/supabase-js");
const sb=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
(async()=>{for(const t of ["complexes","site_settings","page_sections","nav_items","pages","content_revisions"]){
  const {count,error}=await sb.from(t).select("*",{count:"exact",head:true});
  console.log(t.padEnd(18), error?("❌ "+error.message):(count+"행"));
}})();'
```

기대값: `complexes 172행` · `site_settings 19행` · `page_sections`(0 이상) ·
`nav_items 18행` · `pages 14행` · `content_revisions`(0 이상).
**하나라도 `❌` 가 나오면 배포하지 말고 중단한다.**

### 1-4. 최종 빌드

```bash
cd /home/dev/kbgroup-renewal
npx tsc --noEmit && npm run build
echo "EXIT=$?"
```

`EXIT=0` 이어야 한다. 빌드는 약 4분 걸린다.

빌드 로그 끝의 라우트 표에서 확인할 것:

- 총 라우트 **58개**
- `/sitemap.xml` 이 **`○ (Static)`** — 여기가 `ƒ` 로 바뀌었으면 페이지 공개 게이트가
  사이트맵까지 흘러 들어간 것이다. 배포하지 말고 보고한다.

---

## 2. 배포 실행

```bash
cd /home/dev/kbgroup-renewal
npx vercel --prod --token=$VERCEL_TOKEN
```

- 첫 실행이면 프로젝트 연결(link)을 물어본다. 기존 `kbgroup-renewal` 프로젝트를 고른다.
- 4~6분 뒤 배포 URL 이 출력된다. 프로덕션 도메인은 `https://kbgroup-renewal.vercel.app`
  (커스텀 도메인 `https://kbgroup.kr`).

배포 이력 확인:

```bash
npx vercel ls --token=$VERCEL_TOKEN | head
```

---

## 3. 배포 직후 체크리스트

`https://kbgroup-renewal.vercel.app` 기준. **8항목 전부 확인한 뒤에 완료로 본다.**

| # | 항목 | 기대값 | 확인 방법 |
|---|------|--------|-----------|
| ① | 메인 카운터 | 관리 단지 **200+** 표기 | `/` 접속 후 카운터 영역 육안 |
| ② | 히어로 슬라이드 | **8슬라이드** 순환 | `/` 상단, 인디케이터 8개 |
| ③ | 관리현황 | 현재 **153** · 과거 **19** | `/cases` 상단 건수 |
| ④ | 관리자 로그인 | 관리자 화면 진입 | `/admin` → 탭 11개 |
| ⑤ | 편집 → 반영 1건 | 저장 직후 공개 페이지 반영 | 아래 3-1 |
| ⑥ | sitemap | **191 URL** | 아래 3-2 |
| ⑦ | `updateTag` 즉시 반영 | 페이지 비공개 → sitemap 즉시 감소 | 아래 3-3 (**§11-5 잔여 항목**) |
| ⑧ | 채용 공고 | **3건** 노출 | `/careers/openings` |

명령으로 한번에 확인 (①③⑥⑧):

```bash
BASE=https://kbgroup-renewal.vercel.app
curl -s $BASE/sitemap.xml | grep -c "<loc>"                 # → 191
curl -s $BASE/cases        | grep -o "153" | head -1          # → 153
curl -s $BASE/careers/openings | grep -o "진행 중 " | head -1  # 렌더 확인
```

### 3-1. 편집 → 반영 실측 (⑤)

되돌리기 쉬운 값 하나로만 한다.

1. `/admin/content/settings` → 「연락처」 → **팩스 번호** 끝자리를 바꿔 저장
2. 새 탭에서 `/contact` 를 열어 바뀐 번호가 보이는지 확인 (새로고침 1회)
3. 다시 원래 번호로 되돌려 저장하고 `/contact` 에서 원복 확인

> 되돌리는 것을 잊었더라도 `/admin/content/revisions` → 「연락처」 → 이전 시점 복원으로 되돌릴 수 있다.

### 3-2. sitemap 건수 (⑥)

```bash
curl -s https://kbgroup-renewal.vercel.app/sitemap.xml | grep -c "<loc>"
```

**191** 이어야 한다 (정적 14경로 + 게시판 목록 4 + 활성 단지 153 + 사업영역 5 + 게시글 등).
과거 단지 19건은 상세 페이지가 없으므로 **들어 있으면 안 된다**:

```bash
curl -s https://kbgroup-renewal.vercel.app/sitemap.xml | grep -c "cases/" # → 153
```

### 3-3. `updateTag` 즉시 반영 — **프로덕션에서 처음 확인하는 항목** (⑦)

로컬 프로덕션 빌드에서는 통과했지만 **Vercel 에서 같은지 아직 확인되지 않았다**
(PROGRESS §11-5 · §18-8-7). 배포 후 반드시 이 순서로 실측한다.

1. `curl -s $BASE/sitemap.xml | grep -c "<loc>"` → **191** 기록
2. `/admin/content/pages` → 「인허가」 를 **비공개**로 토글
3. 즉시 (1분 이내) 다시 `curl -s $BASE/sitemap.xml | grep -c "<loc>"`
   - **190 이면 통과** — 태그 무효화가 Vercel 에서도 사이트맵까지 전파된다.
   - **191 그대로면** 태그 전파가 Vercel 의 정적 라우트 캐시에는 닿지 않는 것이다.
     사이트 동작에는 문제가 없다(비공개 페이지는 즉시 404 가 되고 메뉴에서도 빠진다).
     **최대 1시간 뒤 자동 갱신**된다. 이 경우 보고만 하면 된다.
4. `curl -s -o /dev/null -w "%{http_code}" $BASE/licenses` → **404** 확인
5. `/admin/content/pages` 에서 「인허가」 를 다시 **공개**로 되돌리고,
   `$BASE/licenses` 가 **200**, sitemap 이 **191** 로 복귀하는지 확인

---

## 4. 롤백

### 4-1. 1단계 — Vercel 즉시 롤백 (배포 자체가 문제일 때)

이전 배포로 되돌린다. **DB 는 건드리지 않는다** — 마이그레이션은 전부 additive 라
옛 코드에서도 문제가 없다.

대시보드: 프로젝트 → Deployments → 직전 정상 배포 → `⋯` → **Instant Rollback**

CLI:

```bash
npx vercel ls --token=$VERCEL_TOKEN                 # 직전 정상 배포 URL 확인
npx vercel rollback <배포URL> --token=$VERCEL_TOKEN
```

소요 시간 1분 이내.

### 4-2. 2단계 — `CONTENT_SOURCE=file` 킬스위치 (DB 쪽이 문제일 때)

DB 를 아예 읽지 않고 `data/site-content.ts` 파일 값만으로 사이트를 렌더한다.
**관리자가 편집한 내용은 화면에서 사라지지만 사이트는 배포 전과 똑같이 살아 있다.**
(단지 172건 · 설정 19키 · 메뉴 · 섹션 전부 코드 기본값으로 떨어진다. DB 데이터는 지워지지 않는다.)

```bash
npx vercel env add CONTENT_SOURCE production --token=$VERCEL_TOKEN
# 값 입력: file
npx vercel --prod --token=$VERCEL_TOKEN            # 환경변수 반영을 위해 재배포 1회 필요
```

복구할 때:

```bash
npx vercel env rm CONTENT_SOURCE production --token=$VERCEL_TOKEN
npx vercel --prod --token=$VERCEL_TOKEN
```

> 킬스위치 상태에서도 **게시판 글·채용 공고·회원**은 정상 동작한다.
> 그쪽은 PLAN B 콘텐츠 어댑터가 아니라 원래부터 DB 기반이기 때문이다.

### 4-3. 데이터 1건만 잘못됐을 때 (롤백 아님)

배포를 건드릴 필요가 없다. `/admin/content/revisions` 에서 해당 항목의 이전 시점을 골라
복원한다. 복원 직전 값도 이력에 남으므로 되돌리기를 다시 되돌릴 수 있다.

---

## 5. 배포하지 않아야 하는 상황

- `npm run build` 가 `EXIT != 0`
- 라우트 표에서 `/sitemap.xml` 이 `ƒ (Dynamic)` 으로 바뀜
- §1-3 표 확인에서 `❌` 가 하나라도 나옴
- `npx tsc --noEmit` 실패
