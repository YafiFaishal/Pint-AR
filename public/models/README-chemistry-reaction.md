# Aset AR — Reaksi Kimia

File untuk mode **Lihat AR** pada modul Reaksi Kimia. Simulasi 3D interaktif (slider, Campurkan, Reset) tidak memakai file ini.

## File

| File | Platform | Status |
|------|----------|--------|
| `chemistry-reaction.glb` | Web, Android, WebXR, Scene Viewer | Dibuat otomatis via `npm run generate:chemistry-ar` |
| `chemistry-reaction.usdz` | iPhone / iOS AR Quick Look | **Harus dikonversi manual** (lihat bawah) |

Isi model: **sama geometri & warna** dengan simulasi 3D (`reaksi-kimia-scene.tsx`) — tray abu-biru gelap, tabung kiri larutan merah, tabung kanan larutan ungu, beaker tengah kosong.

Animasi GLB (`ReaksiCampurDemo`, loop ~4.5 detik): cairan tabung turun → cairan hijau naik di beaker + gelembung ringan. **Android/WebXR** via `autoplay`; **iOS USDZ** tetap statis.

## Regenerasi GLB

```bash
npm run generate:chemistry-ar
```

Skrip: `scripts/generate-chemistry-reaction-ar-model.mjs` (Three.js GLTFExporter).

## Konversi GLB → USDZ (iOS)

Node **tidak** menghasilkan USDZ secara native. Pilih salah satu:

### Opsi A — Reality Converter (paling mudah)

1. Unduh [Reality Converter](https://developer.apple.com/augmented-reality/tools/) (macOS).
2. Buka `chemistry-reaction.glb`.
3. Export / Save as `chemistry-reaction.usdz` ke folder ini.

### Opsi B — usdzconvert (Xcode)

```bash
xcrun usdz_converter public/models/chemistry-reaction.glb public/models/chemistry-reaction.usdz
```

## Verifikasi

```bash
curl -I http://localhost:3000/models/chemistry-reaction.glb
curl -I http://localhost:3000/models/chemistry-reaction.usdz
```

- **Android / desktop WebXR:** butuh `chemistry-reaction.glb`
- **iPhone Safari:** butuh `chemistry-reaction.usdz` untuk AR Quick Look
