# Aset AR — Tata Surya (Kepler)

File untuk mode **Lihat di Meja (AR)** pada modul Tata Surya. Simulasi 3D interaktif (slider, pilih planet) tidak memakai file ini.

## File

| File | Platform | Status |
|------|----------|--------|
| `solar-system.glb` | Web, Android, WebXR, Scene Viewer | Dibuat otomatis via `npm run generate:solar-ar` |
| `solar-system.usdz` | iPhone / iOS AR Quick Look | **Harus dikonversi manual** (lihat bawah) |

Isi model: Matahari di tengah, orbit tipis, Merkurius · Bumi (+ Bulan) · Mars · Jupiter — terpusat di origin, ukuran cocok untuk meja.

Animasi GLB (bonus): planet mengorbit Matahari, Bulan mengorbit Bumi.

## Regenerasi GLB

```bash
npm run generate:solar-ar
```

Skrip: `scripts/generate-solar-system-ar-model.mjs` (Three.js GLTFExporter).

## Konversi GLB → USDZ (iOS)

Cursor/Node **tidak** menghasilkan USDZ secara native. Pilih salah satu:

### Opsi A — Reality Converter (paling mudah)

1. Unduh [Reality Converter](https://developer.apple.com/augmented-reality/tools/) (macOS).
2. Buka `solar-system.glb`.
3. Export / Save as `solar-system.usdz` ke folder ini.

### Opsi B — usdzconvert (CLI Apple)

1. Unduh **USDZ Tools** dari [Apple AR Quick Look](https://developer.apple.com/augmented-reality/quick-look/).
2. Konversi:

```bash
usdzconvert public/models/solar-system.glb public/models/solar-system.usdz
```

### Opsi C — Xcode (versi lama)

```bash
xcrun usdz_converter public/models/solar-system.glb public/models/solar-system.usdz
```

> Catatan: `usdz_converter` sering tidak tersedia di Xcode terbaru; gunakan Opsi A atau B.

## Verifikasi

```bash
curl -I http://localhost:3000/models/solar-system.glb
curl -I http://localhost:3000/models/solar-system.usdz
```

- **Android:** butuh `solar-system.glb`
- **iPhone Safari:** butuh `solar-system.usdz` untuk AR Quick Look

Jika USDZ belum ada, tombol AR di iPhone menampilkan pesan jelas — tidak ada file palsu atau fallback astronaut.
