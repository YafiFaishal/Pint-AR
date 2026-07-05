#!/usr/bin/env python3
"""
Opsi 1 — Export USDZ animasi dari Blender (headless).

Prasyarat:
  - Blender 3.6+ (https://www.blender.org/download/)
  - Plugin USD bawaan Blender aktif

Jalankan dari root repo:

  /Applications/Blender.app/Contents/MacOS/Blender --background \\
    --python scripts/ios-animated-usdz/blender-export-solar-system-usdz.py

Output:
  public/models/solar-system-animated.usdz  (uji dulu, jangan timpa production)

Setelah verifikasi di iPhone, rename manual ke solar-system.usdz jika animasi jalan.
"""
from __future__ import annotations

import bpy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GLB = ROOT / "public/models/solar-system.glb"
OUT = ROOT / "public/models/solar-system-animated.usdz"


def main() -> None:
    if not GLB.exists():
        raise SystemExit(f"GLB tidak ditemukan: {GLB}. Jalankan npm run generate:solar-ar")

    bpy.ops.wm.read_factory_settings(use_empty=True)

    print(f"Import GLB: {GLB}")
    bpy.ops.import_scene.gltf(filepath=str(GLB))

    # Pastikan clip animasi aktif
    if bpy.data.actions:
        for action in bpy.data.actions:
            print(f"  Action: {action.name}, frames {action.frame_range[0]:.0f}-{action.frame_range[1]:.0f}")
        bpy.context.scene.render.fps = 24
    else:
        print("⚠ Tidak ada action — export mungkin statis")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    print(f"Export USDZ: {OUT}")

    bpy.ops.wm.usd_export(
        filepath=str(OUT),
        export_animation=True,
        export_hierarchy=True,
        export_materials=True,
        export_mesh_attributes=True,
        generate_preview_surface=True,
        evaluation_mode="RENDER",
    )

    print("✓ Selesai. Uji di iPhone Quick Look sebelum mengganti solar-system.usdz")


if __name__ == "__main__":
    main()
