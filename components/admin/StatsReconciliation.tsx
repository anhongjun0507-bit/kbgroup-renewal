/**
 * STATS 이원화 대조표 (PLAN B / DAY 4 · E-7).
 *
 * 실제 집계값과 마케팅 표기값을 나란히 보여준다. 둘은 **일부러** 다르다.
 * 예) 운영 단지 실제 153건 / 표기 200+ — 2026-05-30 클라이언트 요청으로 확정된 값이다
 * (커밋 8a27ace, PROGRESS §9.2). 자동 동기화하지 않는다.
 *
 * 이 화면의 목적은 "틀렸으니 고쳐라"가 아니라 "지금 얼마나 벌어져 있는지 알고 있어라"다.
 */

export type ReconRow = {
  label: string;
  /** DB·배열에서 계산한 실제값. null 이면 계산 근거가 없는 항목. */
  real: number | null;
  realNote: string;
  /** 관리자가 직접 넣은 화면 표기값. */
  display: number;
  displayNote: string;
};

function fmt(n: number | null) {
  return n === null ? "—" : n.toLocaleString();
}

export function StatsReconciliation({ rows }: { rows: ReconRow[] }) {
  const gaps = rows.filter((r) => r.real !== null && r.real !== r.display);

  return (
    <section className="rounded-md border border-line bg-white p-6 md:p-8">
      <h2 className="text-[19px] font-bold text-ink-strong">실제값 ↔ 표기값 대조</h2>
      <p className="mt-1 text-[13px] text-ink-muted">
        왼쪽은 DB·배열에서 계산한 실제값, 오른쪽은 화면에 노출되는 마케팅 표기값입니다.
      </p>

      {gaps.length > 0 && (
        <div
          role="status"
          className="mt-5 rounded-sm border-l-2 border-amber-600 bg-amber-50 px-4 py-3 text-[14px] text-amber-900"
        >
          <p className="font-semibold">
            실제값과 표기값이 다른 항목이 {gaps.length}건 있습니다 — 의도된 불일치입니다.
          </p>
          <p className="mt-1 text-[13px] leading-[1.7]">
            표기값은 마케팅 목적으로 관리자가 직접 정하는 값이고, 실제값은 데이터에서 자동
            계산되는 값입니다. 둘은 <strong>자동으로 맞춰지지 않으며 맞출 필요도 없습니다.</strong>{" "}
            특히 운영 단지 <strong>200+</strong> 는 2026-05-30 클라이언트 요청으로 확정된 표기값이니
            임의로 실제값에 맞추지 마세요. 값을 바꿀 근거가 생겼을 때만 아래 「마케팅 표기값(STATS)」
            에서 직접 수정하시면 됩니다.
          </p>
        </div>
      )}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-[14px]">
          <thead>
            <tr className="border-b border-line text-left">
              <th scope="col" className="py-3 pr-4 font-semibold text-ink-strong">
                항목
              </th>
              <th scope="col" className="py-3 pr-4 font-semibold text-ink-strong">
                실제값 (자동 계산)
              </th>
              <th scope="col" className="py-3 pr-4 font-semibold text-ink-strong">
                표기값 (수기 관리)
              </th>
              <th scope="col" className="py-3 font-semibold text-ink-strong">
                차이
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const gap = r.real === null ? null : r.display - r.real;
              return (
                <tr key={r.label} className="border-b border-line/60 align-top">
                  <th scope="row" className="py-3 pr-4 text-left font-semibold text-ink-strong">
                    {r.label}
                  </th>
                  <td className="py-3 pr-4">
                    <span className="font-mono-num text-[15px] text-ink-strong">{fmt(r.real)}</span>
                    <span className="mt-0.5 block text-[12px] text-ink-faint">{r.realNote}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="font-mono-num text-[15px] text-ink-strong">
                      {r.display.toLocaleString()}
                    </span>
                    <span className="mt-0.5 block text-[12px] text-ink-faint">{r.displayNote}</span>
                  </td>
                  <td className="py-3">
                    {gap === null ? (
                      <span className="text-[13px] text-ink-faint">—</span>
                    ) : gap === 0 ? (
                      <span className="text-[13px] font-semibold text-emerald-700">일치</span>
                    ) : (
                      <span className="font-mono-num text-[13px] font-semibold text-amber-700">
                        {gap > 0 ? "+" : ""}
                        {gap.toLocaleString()}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
