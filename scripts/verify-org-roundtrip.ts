/**
 * 조직도 편집 왕복 검증 (PLAN B / DAY 5).
 *
 * 확인 대상은 **노드 유실**이다. 조직도는 JSONB 재귀 트리라 노드를 옮기거나 지울 때
 * 자식 하위 트리가 조용히 사라지기 쉽다. 편집 전후 노드 총 개수와 구조를 대조한다.
 *
 * 검증 단계:
 *   1) 항등 왕복      — DB 값 → 아웃라인 → 트리 가 원본과 완전히 같은지 (노드 수·구조·문자열)
 *   2) 편집 시뮬레이션 — 하위 추가 / 하위 트리 삭제 / 형제 이동 / 들여쓰기 4종의 노드 수 불변식
 *   3) DB 왕복        — 실제 UPDATE → SELECT 후 노드 수·구조 대조
 *   4) 원복           — 검증용으로 바꾼 값을 원래대로 되돌린다
 *
 * 실행:
 *   node --experimental-strip-types --import ./scripts/node-ts-register.mjs \
 *     scripts/verify-org-roundtrip.ts
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import {
  buildOrgTree,
  countOrgNodes,
  flattenOrg,
  type OutlineRow,
} from "../components/admin/org-tree.ts";
import type { OrgNode } from "@/data/site-content";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

let failures = 0;
function check(label: string, ok: boolean, detail = "") {
  console.log(`${ok ? "✅" : "❌"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
}

/** 편집기의 subtreeEnd 와 같은 규칙 — 자기보다 깊은 행이 이어지는 구간이 자식이다. */
function subtreeEnd(rows: OutlineRow[], i: number): number {
  let j = i + 1;
  while (j < rows.length && rows[j].depth > rows[i].depth) j++;
  return j;
}

type Organization = { tree: OrgNode; branches: OrgNode[] };

/* ── 0) 현재 값 읽기 ───────────────────────────────────────────────────── */

const { data: row, error } = await supabase
  .from("site_settings")
  .select("value, updated_at")
  .eq("key", "organization")
  .single();

if (error || !row) {
  console.error("❌ site_settings.organization 조회 실패:", error?.message);
  process.exit(1);
}

const original = row.value as Organization;
const originalCount =
  countOrgNodes([original.tree]) + countOrgNodes(original.branches ?? []);
console.log(
  `조직도 원본 — 본사 ${countOrgNodes([original.tree])}노드 · 지사 ${countOrgNodes(original.branches ?? [])}노드 · 합계 ${originalCount}`,
);

/* ── 1) 항등 왕복 ──────────────────────────────────────────────────────── */

const treeRows = flattenOrg([original.tree]);
const branchRows = flattenOrg(original.branches ?? []);

check(
  "아웃라인 행 수 == 원본 노드 수",
  treeRows.length + branchRows.length === originalCount,
  `${treeRows.length} + ${branchRows.length} vs ${originalCount}`,
);

const rebuilt: Organization = {
  tree: buildOrgTree(treeRows)[0],
  branches: buildOrgTree(branchRows),
};

check(
  "트리 → 아웃라인 → 트리 가 원본과 구조·문자열까지 동일",
  JSON.stringify(rebuilt) === JSON.stringify(original),
);
check(
  "왕복 후 노드 수 보존",
  countOrgNodes([rebuilt.tree]) + countOrgNodes(rebuilt.branches) === originalCount,
);

/* ── 2) 편집 시뮬레이션 ────────────────────────────────────────────────── */

// (a) 하위 추가 — 임의 노드(마지막 중간 노드) 아래에 1개
{
  const rows = [...treeRows];
  const target = Math.max(0, rows.length - 2);
  rows.splice(subtreeEnd(rows, target), 0, {
    depth: rows[target].depth + 1,
    name: "__검증용 부서__",
    role: "",
  });
  const t = buildOrgTree(rows);
  check(
    "하위 추가 — 노드 +1",
    countOrgNodes(t) === treeRows.length + 1,
    `${countOrgNodes(t)} (기대 ${treeRows.length + 1})`,
  );
}

// (b) 하위 트리 삭제 — 자식을 가진 노드를 통째로 지운다
{
  const i = treeRows.findIndex(
    (_, k) => subtreeEnd(treeRows, k) - k > 1 && treeRows[k].depth > 0,
  );
  const end = subtreeEnd(treeRows, i);
  const removed = end - i;
  const rows = [...treeRows.slice(0, i), ...treeRows.slice(end)];
  const t = buildOrgTree(rows);
  check(
    `하위 트리 삭제 — "${treeRows[i].name}"(자식 ${removed - 1}) 삭제 후 노드 -${removed}`,
    countOrgNodes(t) === treeRows.length - removed,
    `${countOrgNodes(t)} (기대 ${treeRows.length - removed})`,
  );
}

// (c) 형제 이동 — 같은 depth 형제 두 블록을 맞바꾼다
{
  let i = -1;
  for (let k = 0; k < treeRows.length; k++) {
    const end = subtreeEnd(treeRows, k);
    if (end < treeRows.length && treeRows[end].depth === treeRows[k].depth) {
      i = k;
      break;
    }
  }
  if (i < 0) {
    check("형제 이동 — 대상 형제 쌍이 없어 건너뜀", true);
  } else {
    const end = subtreeEnd(treeRows, i);
    const nextEnd = subtreeEnd(treeRows, end);
    const rows = [
      ...treeRows.slice(0, i),
      ...treeRows.slice(end, nextEnd),
      ...treeRows.slice(i, end),
      ...treeRows.slice(nextEnd),
    ];
    const t = buildOrgTree(rows);
    const names = (n: OrgNode[]): string[] =>
      n.flatMap((x) => [x.name, ...names(x.children ?? [])]).sort();
    check(
      `형제 이동 — "${treeRows[i].name}" ↔ "${treeRows[end].name}" 후 노드 수 불변`,
      countOrgNodes(t) === treeRows.length,
      `${countOrgNodes(t)} (기대 ${treeRows.length})`,
    );
    check(
      "형제 이동 — 노드 이름 집합 불변 (자식 유실 없음)",
      JSON.stringify(names(t)) === JSON.stringify(names([original.tree])),
    );
  }
}

// (d) 들여쓰기 — 하위 트리 전체 depth +1
{
  let i = -1;
  for (let k = 1; k < treeRows.length; k++) {
    if (treeRows[k - 1].depth >= treeRows[k].depth) {
      i = k;
      break;
    }
  }
  const end = subtreeEnd(treeRows, i);
  const rows = treeRows.map((r, k) =>
    k >= i && k < end ? { ...r, depth: r.depth + 1 } : r,
  );
  const t = buildOrgTree(rows);
  check(
    `들여쓰기 — "${treeRows[i].name}" 하위 트리(${end - i}노드) 이동 후 노드 수 불변`,
    countOrgNodes(t) === treeRows.length,
    `${countOrgNodes(t)} (기대 ${treeRows.length})`,
  );
}

/* ── 3) DB 왕복 ────────────────────────────────────────────────────────── */

// 편집기가 실제로 만들어 보내는 것과 같은 경로: 아웃라인 → buildOrgTree → JSONB
const marked: Organization = {
  tree: buildOrgTree(
    treeRows.map((r, k) => (k === 0 ? { ...r, role: `${r.role}__검증__` } : r)),
  )[0],
  branches: buildOrgTree(branchRows),
};

const { error: upError } = await supabase
  .from("site_settings")
  .update({ value: marked as never })
  .eq("key", "organization")
  .eq("updated_at", row.updated_at);
check("낙관적 잠금 조건부 UPDATE 성공", !upError, upError?.message ?? "");

const { data: after } = await supabase
  .from("site_settings")
  .select("value, updated_at")
  .eq("key", "organization")
  .single();

const saved = after!.value as Organization;
const savedCount = countOrgNodes([saved.tree]) + countOrgNodes(saved.branches ?? []);
check("DB 왕복 후 노드 수 보존", savedCount === originalCount, `${savedCount} vs ${originalCount}`);
check("DB 왕복 후 표식 저장 확인", String(saved.tree.role).includes("__검증__"));
check("updated_at 갱신됨", after!.updated_at !== row.updated_at);
check(
  "표식을 제외하면 저장 전후 구조 동일",
  JSON.stringify({ ...saved, tree: { ...saved.tree, role: original.tree.role } }) ===
    JSON.stringify(original),
);

/* ── 4) 원복 ───────────────────────────────────────────────────────────── */

const { error: restoreError } = await supabase
  .from("site_settings")
  .update({ value: original as never })
  .eq("key", "organization");

const { data: restored } = await supabase
  .from("site_settings")
  .select("value")
  .eq("key", "organization")
  .single();

check(
  "원복 확인 — 원본과 완전 동일",
  !restoreError && JSON.stringify(restored!.value) === JSON.stringify(original),
);

console.log(
  failures === 0 ? "\n✅ 조직도 왕복 전 항목 통과" : `\n❌ ${failures}건 실패`,
);
process.exit(failures === 0 ? 0 : 1);
