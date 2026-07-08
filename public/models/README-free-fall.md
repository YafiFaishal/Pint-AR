# Aset AR — Gerak Jatuh Bebas

File untuk mode **Lihat AR** pada modul Gerak Jatuh Bebas. Simulasi 3D interaktif (slider, Jatuhkan, Reset) tidak memakai file ini.

## File

| File | Platform | Status |
|------|----------|--------|
| `free-fall.glb` | Web, Android, WebXR, Scene Viewer | Dibuat otomatis via `npm run generate:free-fall-ar` |
| `free-fall.usdz` | iPhone / iOS AR Quick Look | **Konversi manual** setelah regenerate GLB (lihat bawah) |

Isi model: **sama geometri & warna** dengan simulasi 3D (`jatuh-bebas-scene.tsx`) — lantai abu-abu lebar, menara kiri + garis tinggi, bola oranye di tengah, panah gravitasi merah ke bawah (rotasi 180°), label **h** dan **g** kecil (TextGeometry datar). Animasi `FreeFallDemo` (~5 s, loop).

## Regenerasi GLB + USDZ (jika tool tersedia)

```bash
npm run generate:free-fall-ar
```

Skrip: `scripts/generate-free-fall-ar-model.mjs` (Three.js GLTFExporter). Jika `usdz_converter` (Xcode) terpasang, USDZ ikut di-generate otomatis.

## Konversi GLB → USDZ (iOS)

Node **tidak** menghasilkan USDZ secara native. Pilih salah satu:

### Opsi A — Reality Converter (paling mudah)

1. Unduh [Reality Converter](https://developer.apple.com/augmented-reality/tools/) (macOS).
2. Buka `free-fall.glb`.
3. Export / Save as `free-fall.usdz` ke folder ini.

### Opsi B — usdzconvert (Xcode)

```bash
xcrun usdz_converter public/models/free-fall.glb public/models/free-fall.usdz
```

> **Penting:** Setelah regenerate GLB, konversi ulang USDZ. File USDZ lama (visual panah terbalik) tidak boleh dipakai.

## Verifikasi

```bash
curl -I http://localhost:3000/models/free-fall.glb
curl -I http://localhost:3000/models/free-fall.usdz
```

- **Android / desktop WebXR:** butuh `free-fall.glb`
- **iPhone Safari:** butuh `free-fall.usdz` untuk AR Quick Look
