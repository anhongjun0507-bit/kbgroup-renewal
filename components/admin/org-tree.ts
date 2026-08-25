import type { OrgNode } from "@/lib/content";

/**
 * 조직도 트리 ↔ 들여쓰기 목록(아웃라인) 변환 (PLAN B / DAY 5).
 *
 * 편집기(클라이언트)와 Server Action 이 **같은 변환 함수**를 써야 왕복이 맞는다.
 * "use client" 모듈에서 값을 가져오면 서버 쪽에서는 클라이언트 참조가 잡히므로
 * 순수 모듈로 분리해 둔다.
 */

export type OutlineRow = { depth: number; name: string; role: string };

/** 트리 → 아웃라인. 깊이 우선 순회, 배열 순서 = 화면 순서. */
export function flattenOrg(nodes: OrgNode[], depth = 0, out: OutlineRow[] = []): OutlineRow[] {
  for (const n of nodes) {
    out.push({ depth, name: n.name, role: n.role ?? "" });
    if (n.children?.length) flattenOrg(n.children, depth + 1, out);
  }
  return out;
}

/**
 * 아웃라인 → 트리.
 *
 * depth 가 건너뛰어도(0 → 2) 직전 노드의 자식으로 붙인다. 입력 행 수와 출력 노드 수는 항상 같다 —
 * 노드가 조용히 사라지지 않는다는 것이 이 함수의 유일한 불변식이다.
 */
export function buildOrgTree(rows: OutlineRow[]): OrgNode[] {
  const roots: OrgNode[] = [];
  const stack: OrgNode[] = [];
  for (const r of rows) {
    const node: OrgNode = { name: r.name, ...(r.role ? { role: r.role } : {}) };
    const depth = Math.min(r.depth, stack.length);
    stack.length = depth;
    if (depth === 0) roots.push(node);
    else (stack[depth - 1].children ??= []).push(node);
    stack.push(node);
  }
  return roots;
}

/** 트리의 노드 총 개수. 편집 전후 대조용 (DAY 5 검증 항목). */
export function countOrgNodes(nodes: OrgNode[]): number {
  return nodes.reduce((n, node) => n + 1 + countOrgNodes(node.children ?? []), 0);
}
