#!/usr/bin/env python3
"""
Periksa apakah file USDZ punya rentang waktu animasi & prims bergerak.
Butuh: pip install usd-core

Usage:
  python3 scripts/ios-animated-usdz/inspect-usdz-animation.py public/models/solar-system.usdz
"""
from __future__ import annotations

import sys
from pathlib import Path


def inspect(path: Path) -> int:
    try:
        from pxr import Usd
    except ImportError:
        print("❌ usd-core belum terpasang. Jalankan: pip install usd-core")
        return 1

    if not path.exists():
        print(f"❌ File tidak ditemukan: {path}")
        return 1

    stage = Usd.Stage.Open(str(path))
    start = stage.GetStartTimeCode()
    end = stage.GetEndTimeCode()
    fps = stage.GetTimeCodesPerSecond()

    print(f"File: {path.name}")
    print(f"  Time range: {start} → {end} (fps {fps})")

    animated_attrs: list[str] = []
    for prim in stage.Traverse():
        for attr in prim.GetAttributes():
            if attr.ValueMightBeTimeVarying():
                animated_attrs.append(f"{prim.GetPath()}.{attr.GetName()}")

    if end <= start and not animated_attrs:
        print("  Status: ⚠ STATIS — tidak ada clip animasi (Quick Look tidak akan orbit)")
        return 2

    print(f"  Status: ✓ {len(animated_attrs)} atribut time-varying")
    for line in animated_attrs[:12]:
        print(f"    · {line}")
    if len(animated_attrs) > 12:
        print(f"    … +{len(animated_attrs) - 12} lainnya")
    return 0


if __name__ == "__main__":
    target = Path(sys.argv[1] if len(sys.argv) > 1 else "public/models/solar-system.usdz")
    raise SystemExit(inspect(target))
