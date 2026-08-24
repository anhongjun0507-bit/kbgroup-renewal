#!/usr/bin/env python3
"""
회귀 스크린샷 비교 (PROGRESS.md §8).

docs/regression/before/ ↔ docs/regression/after/ 의 동일 파일명끼리 픽셀 비교한다.
크기가 다르면 겹치는 영역만 비교하고 크기 차이를 함께 보고한다.

사용:
  python3 scripts/diff-regression.py                 # 전체
  python3 scripts/diff-regression.py 07 12 13 14     # 순번 prefix 로 일부만
"""
import sys
from pathlib import Path

from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parent.parent
BEFORE = ROOT / "docs/regression/before"
AFTER = ROOT / "docs/regression/after"
OUT = ROOT / "docs/regression/diff"

# 픽셀당 이 값 이하의 채널 차이는 인코딩·안티에일리어싱 잡음으로 본다.
TOLERANCE = 8


def compare(name: str) -> dict:
    a = Image.open(BEFORE / name).convert("RGB")
    b = Image.open(AFTER / name).convert("RGB")
    size = (min(a.width, b.width), min(a.height, b.height))
    ac, bc = a.crop((0, 0, *size)), b.crop((0, 0, *size))

    diff = ImageChops.difference(ac, bc).convert("L")
    hist = diff.histogram()
    changed = sum(hist[TOLERANCE + 1:])
    total = size[0] * size[1]

    if changed:
        OUT.mkdir(parents=True, exist_ok=True)
        diff.point(lambda v: 255 if v > TOLERANCE else 0).save(OUT / name)

    return {
        "name": name,
        "before": (a.width, a.height),
        "after": (b.width, b.height),
        "changed": changed,
        "total": total,
        "pct": 100.0 * changed / total if total else 0.0,
    }


def main() -> int:
    prefixes = sys.argv[1:]
    names = sorted(
        p.name
        for p in BEFORE.glob("*.png")
        if (AFTER / p.name).exists()
        and (not prefixes or any(p.name.startswith(x + "_") for x in prefixes))
    )
    if not names:
        print("비교할 파일이 없습니다 (after/ 에 동일 파일명이 있어야 합니다).")
        return 1

    worst = 0.0
    for name in names:
        r = compare(name)
        same_size = r["before"] == r["after"]
        size_note = "" if same_size else f"  ⚠ 크기 {r['before']} → {r['after']}"
        mark = "동일" if r["changed"] == 0 else f"{r['pct']:.4f}% 차이"
        print(f"[{'OK ' if r['changed'] == 0 and same_size else 'DIFF'}] {name}: {mark}{size_note}")
        worst = max(worst, r["pct"])

    print(f"\n비교 {len(names)}건 · 최대 차이 {worst:.4f}%")
    print("차이 마스크: docs/regression/diff/ (차이 있는 파일만)" if worst else "픽셀 차이 0건.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
