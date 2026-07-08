# Model AR: Pemantulan dan Pembiasan Cahaya

## File

| File | Keterangan |
|------|------------|
| `light-optics.glb` | Model AR Android / Scene Viewer — **beranimasi** |
| `light-optics.usdz` | Model AR iOS Quick Look — animasi bergantung perangkat |

## Visual

Material dan geometri disinkronkan dengan `src/lib/light-optics-visual.ts` dan
`light-optics-scene.tsx` (senter, volume medium, sinar emissive).

## Generate

```bash
npm run generate:light-optics-ar
```

## Demo AR (baked)

- Mode: Pembiasan
- θ datang: 45°
- Medium: Udara (n = 1.00) → Kaca (n = 1.50)
- θ bias: ≈ 28.13°
- AnimationClip: `LightRefractionDemo` (~6 detik, loop)

## USDZ

Jika `usdz_converter` (Xcode) tersedia, script mengonversi otomatis.
Jika tidak, konversi manual dengan **Reality Converter** dari `light-optics.glb`.

**Catatan:** GLB memiliki animasi sinar; USDZ dapat tampil statis di Quick Look
jika animasi tidak didukung — seluruh sinar tetap terlihat pada posisi akhir.
