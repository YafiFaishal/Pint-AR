# Aset AR — Hukum Archimedes

File untuk mode **Lihat AR** pada modul Hukum Archimedes. Simulasi 3D interaktif (slider, Masukkan Benda, Reset) tidak memakai file ini.

## File

| File | Platform | Status |
|------|----------|--------|
| `archimedes-buoyancy.glb` | Web, Android, WebXR, Scene Viewer | Dibuat otomatis via `npm run generate:archimedes-ar` |
| `archimedes-buoyancy.usdz` | iPhone / iOS AR Quick Look | **Harus dikonversi manual** (lihat bawah) |

Isi model: meja laboratorium, bak transparan berisi air biru, kubus oranye demo terapung (50% tercelup), panah **Fa** biru ke atas dan **W** merah ke bawah (rotasi eksplisit, tanpa scale negatif), label **Fa**/**W** kecil (TextGeometry datar). Animasi `ArchimedesFloatDemo` (~6 s, loop).

## Regenerasi GLB + USDZ (jika tool tersedia)

```bash
npm run generate:archimedes-ar
```

Skrip: `scripts/generate-archimedes-ar-model.mjs`. Jika `usdz_converter` (Xcode) terpasang, USDZ ikut di-generate; jika tidak, USDZ lama dihapus agar iOS tidak memuat visual usang.

## Konversi GLB → USDZ (iOS)

Node **tidak** menghasilkan USDZ secara native. Pilih salah satu:

### Opsi A — Reality Converter (paling mudah)

1. Unduh [Reality Converter](https://developer.apple.com/augmented-reality/tools/) (macOS).
2. Buka `archimedes-buoyancy.glb`.
3. Export / Save as `archimedes-buoyancy.usdz` ke folder ini.

### Opsi B — usdzconvert (Xcode)

```bash
xcrun usdz_converter public/models/archimedes-buoyancy.glb public/models/archimedes-buoyancy.usdz
```

> **Penting:** Setelah regenerate GLB, konversi ulang USDZ. File USDZ lama (panah W terbalik, tanpa label) tidak boleh dipakai.

## Verifikasi

```bash
curl -I http://localhost:3000/models/archimedes-buoyancy.glb
curl -I http://localhost:3000/models/archimedes-buoyancy.usdz
```

- **Android / desktop WebXR:** butuh `archimedes-buoyancy.glb`
- **iPhone Safari:** butuh `archimedes-buoyancy.usdz` untuk AR Quick Look
