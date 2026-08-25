"use client";

import { useMemo, useState } from "react";
import { FormShell, type Action } from "./SettingsForms";
import type { OrgNode, SettingValue } from "@/lib/content";
import { flattenOrg } from "./org-tree";

/**
 * 조직도(JSONB 재귀 트리) 편집기 (PLAN B / DAY 5).
 *
 * 트리를 **들여쓰기 목록(아웃라인)** 으로 평탄화해 편집한다. 트리를 트리 모양 그대로 편집하면
 * "노드를 옮겼는데 자식이 사라진다"가 가장 흔한 버그인데, 아웃라인에서는 한 노드의 하위 트리가
 * 곧 "바로 아래에 이어지는, 더 깊은 depth 행들의 연속 구간"이라 **구간을 통째로** 옮기고 지우면
 * 자식 유실이 원리적으로 일어나지 않는다. 저장 시 depth 스택으로 다시 트리를 세운다.
 *
 * 노드 총 개수는 화면 상단에 항상 표시된다. 편집 전후 개수를 눈으로 대조할 수 있어야 하기 때문이다.
 */

type Row = { rowId: number; depth: number; name: string; role: string };

function toRows(nodes: OrgNode[]): Row[] {
  return flattenOrg(nodes).map((r, i) => ({ rowId: i, ...r }));
}

/** i 번 행의 하위 트리 끝 위치(미포함). 자기보다 깊은 행이 이어지는 동안이 자식 구간이다. */
function subtreeEnd(rows: Row[], i: number): number {
  let j = i + 1;
  while (j < rows.length && rows[j].depth > rows[i].depth) j++;
  return j;
}

const BTN =
  "btn-reset inline-flex h-8 w-8 items-center justify-center rounded-sm border border-line bg-white text-[14px] text-ink-strong hover:border-navy-700 disabled:opacity-30";
const INPUT =
  "block w-full rounded-sm border border-line bg-white px-3 py-2 text-[14px] text-ink-strong focus:border-navy-700 focus:outline-none";

function Outliner({
  legend,
  prefix,
  rows,
  setRows,
  /** 이 아웃라인에서 허용하는 최소 depth. 본사 트리는 루트가 고정이라 1, 지사 목록은 0. */
  minDepth,
  /** 이동·삭제·내어쓰기를 막을 행 index (본사 트리의 루트). */
  lockedIndex,
}: {
  legend: string;
  prefix: string;
  rows: Row[];
  setRows: (fn: (prev: Row[]) => Row[]) => void;
  minDepth: number;
  lockedIndex?: number;
}) {
  const nextId = () => Math.max(0, ...rows.map((r) => r.rowId)) + 1;

  /** 하위 노드 추가 — i 의 자식 구간 맨 끝에 붙인다. */
  const addChild = (i: number) =>
    setRows((prev) => {
      const end = subtreeEnd(prev, i);
      const next = [...prev];
      next.splice(end, 0, {
        rowId: nextId(),
        depth: prev[i].depth + 1,
        name: "새 부서",
        role: "",
      });
      return next;
    });

  const addRoot = () =>
    setRows((prev) => [
      ...prev,
      { rowId: nextId(), depth: minDepth, name: "새 조직", role: "" },
    ]);

  /** 삭제 — 하위 트리를 통째로 지운다. 몇 개가 지워지는지 먼저 알린다. */
  const removeSubtree = (i: number) =>
    setRows((prev) => {
      const end = subtreeEnd(prev, i);
      const count = end - i;
      if (
        count > 1 &&
        !window.confirm(
          `"${prev[i].name}" 아래 ${count - 1}개 하위 조직도 함께 삭제됩니다. 계속할까요?`,
        )
      ) {
        return prev;
      }
      return [...prev.slice(0, i), ...prev.slice(end)];
    });

  /** 형제 단위 이동 — 하위 트리를 달고 통째로 옮긴다. */
  const move = (i: number, dir: -1 | 1) =>
    setRows((prev) => {
      const depth = prev[i].depth;
      const end = subtreeEnd(prev, i);
      const block = prev.slice(i, end);
      if (dir === 1) {
        if (end >= prev.length || prev[end].depth !== depth) return prev;
        const nextEnd = subtreeEnd(prev, end);
        return [
          ...prev.slice(0, i),
          ...prev.slice(end, nextEnd),
          ...block,
          ...prev.slice(nextEnd),
        ];
      }
      // 위로 — 직전 형제(같은 depth)의 시작 위치를 찾는다.
      let p = i - 1;
      while (p >= 0 && prev[p].depth > depth) p--;
      if (p < 0 || prev[p].depth !== depth) return prev;
      return [...prev.slice(0, p), ...block, ...prev.slice(p, i), ...prev.slice(end)];
    });

  /** 들여쓰기·내어쓰기 — 하위 트리 전체의 depth 를 같이 옮긴다. */
  const shift = (i: number, delta: -1 | 1) =>
    setRows((prev) => {
      if (delta === 1 && (i === 0 || prev[i - 1].depth < prev[i].depth)) return prev;
      if (delta === -1 && prev[i].depth <= minDepth) return prev;
      const end = subtreeEnd(prev, i);
      return prev.map((r, k) => (k >= i && k < end ? { ...r, depth: r.depth + delta } : r));
    });

  return (
    <fieldset data-org-outline={prefix} className="rounded-md border border-line bg-bg-soft p-4">
      <legend className="eyebrow px-2">
        {legend} <span className="font-mono-num text-ink-faint">({rows.length})</span>
      </legend>

      <input type="hidden" name={`${prefix}Count`} value={rows.length} />

      <div className="mt-2 space-y-2">
        {rows.map((r, i) => {
          const locked = i === lockedIndex;
          return (
            <div
              key={r.rowId}
              data-org-row={prefix}
              className="flex flex-col gap-2 rounded-sm border border-line bg-white p-3 sm:flex-row sm:items-center"
              style={{ marginInlineStart: `${Math.min(r.depth, 6) * 20}px` }}
            >
              <input type="hidden" name={`${prefix}Depth_${i}`} value={r.depth} />
              <span
                aria-hidden="true"
                className="hidden shrink-0 font-mono-num text-[12px] text-ink-faint sm:inline"
              >
                L{r.depth}
              </span>
              <input
                name={`${prefix}Name_${i}`}
                defaultValue={r.name}
                aria-label={`${i + 1}번 조직명`}
                className={INPUT}
              />
              <input
                name={`${prefix}Role_${i}`}
                defaultValue={r.role}
                aria-label={`${i + 1}번 직급·역할`}
                placeholder="직급·역할 (선택)"
                className={INPUT}
              />
              <div className="flex shrink-0 items-center gap-1">
                <button type="button" className={BTN} onClick={() => shift(i, -1)} disabled={locked || r.depth <= minDepth} aria-label="상위로">
                  ←
                </button>
                <button type="button" className={BTN} onClick={() => shift(i, 1)} disabled={locked || i === 0 || rows[i - 1].depth < r.depth} aria-label="하위로">
                  →
                </button>
                <button type="button" className={BTN} onClick={() => move(i, -1)} disabled={locked} aria-label="위로">
                  ↑
                </button>
                <button type="button" className={BTN} onClick={() => move(i, 1)} disabled={locked} aria-label="아래로">
                  ↓
                </button>
                <button type="button" className={BTN} onClick={() => addChild(i)} aria-label="하위 조직 추가">
                  +
                </button>
                <button
                  type="button"
                  onClick={() => removeSubtree(i)}
                  disabled={locked}
                  aria-label="삭제"
                  className="btn-reset inline-flex h-8 w-8 items-center justify-center rounded-sm border border-red-300 bg-white text-[14px] text-red-700 hover:bg-red-50 disabled:opacity-30"
                >
                  ×
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {lockedIndex === undefined && (
        <button
          type="button"
          onClick={addRoot}
          className="btn-reset mt-4 inline-flex h-10 items-center rounded-sm border border-navy-700 px-4 text-[13px] font-semibold text-navy-900 hover:bg-navy-900 hover:text-white"
        >
          + 지사 추가
        </button>
      )}
    </fieldset>
  );
}

export function OrgChartEditor({
  action,
  value,
  updatedAt,
}: {
  action: Action;
  value: SettingValue<"organization">;
  updatedAt: string;
}) {
  const [treeRows, setTreeRows] = useState<Row[]>(() => toRows([value.tree]));
  const [branchRows, setBranchRows] = useState<Row[]>(() =>
    toRows(value.branches ?? []).map((r) => ({ ...r, rowId: r.rowId + 10_000 })),
  );

  const originalCount = useMemo(
    () => toRows([value.tree]).length + toRows(value.branches ?? []).length,
    [value],
  );
  const currentCount = treeRows.length + branchRows.length;

  return (
    <FormShell
      id="setting-organization"
      title="조직도"
      desc="본사 조직 트리와 별도 지사 목록입니다. 화살표로 순서·계층을 바꾸고, + 로 하위 조직을 추가합니다."
      action={action}
      updatedAt={updatedAt}
      note={
        <p className="mt-2 text-[12px] text-ink-faint">
          노출 위치: /about — OrganizationChart · 노드{" "}
          <span className="font-mono-num">
            {currentCount}
            {currentCount !== originalCount && ` (불러올 때 ${originalCount})`}
          </span>
          개 · 삭제하면 하위 조직도 함께 사라집니다
        </p>
      }
    >
      <input type="hidden" name="settingKey" value="organization" />

      {currentCount !== originalCount && (
        <p
          role="status"
          className="rounded-sm border-l-2 border-amber-600 bg-amber-50 px-4 py-3 text-[13px] text-amber-900"
        >
          불러올 때 {originalCount}개였던 노드가 지금 {currentCount}개입니다. 의도한 변경인지
          확인한 뒤 저장해주세요.
        </p>
      )}

      <Outliner
        legend="본사 조직"
        prefix="tree"
        rows={treeRows}
        setRows={setTreeRows}
        minDepth={1}
        lockedIndex={0}
      />
      <Outliner
        legend="별도 지사"
        prefix="branch"
        rows={branchRows}
        setRows={setBranchRows}
        minDepth={0}
      />
    </FormShell>
  );
}
