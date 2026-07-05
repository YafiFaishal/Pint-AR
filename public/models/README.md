# Aset AR — Hukum Newton: Gaya & Gerak

File untuk mode **Lihat di Meja (AR)** pada modul Newton. Simulasi 3D interaktif (slider, Dorong, Reset) tidak memakai file ini.

Modul lain dengan aset AR terpisah:

| Modul | README |
|-------|--------|
| Reaksi Kimia | [README-chemistry-reaction.md](./README-chemistry-reaction.md) |
| Gerak Jatuh Bebas | [README-free-fall.md](./README-free-fall.md) |
| Tata Surya | [README-solar-system.md](./README-solar-system.md) |

## File

| File | Platform | Status |
|------|----------|--------|
| `newton-force.glb` | Web, Android, WebXR, Scene Viewer | Dibuat otomatis via `npm run generate:newton-ar` |
| `newton-force.usdz` | iPhone / iOS AR Quick Look | **Harus dikonversi manual** (lihat bawah) |

Isi model: lintasan abu-abu, balok biru, panah gaya merah ke kanan — terpusat di origin.

## Regenerasi GLB

```bash
npm run generate:newton-ar
```

Skrip: `scripts/generate-newton-ar-model.mjs` (Three.js GLTFExporter).

## Konversi GLB → USDZ (iOS)

Cursor/Node **tidak** menghasilkan USDZ secara native. Pilih salah satu:

### Opsi A — Reality Converter (paling mudah)

1. Unduh [Reality Converter](https://developer.apple.com/augmented-reality/tools/) (macOS).
2. Buka `newton-force.glb`.
3. Export / Save as `newton-force.usdz` ke folder ini.

### Opsi B — usdzconvert (CLI Apple)

1. Unduh **USDZ Tools** dari [Apple AR Quick Look](https://developer.apple.com/augmented-reality/quick-look/) (bagian bawah halaman).
2. Ekstrak zip, jalankan `USD.command` atau set `PATH` / `PYTHONPATH` sesuai README paket.
3. Konversi:

```bash
usdzconvert public/models/newton-force.glb public/models/newton-force.usdz
```

### Opsi C — Xcode (versi lama)

Jika `usdz_converter` tersedia di Xcode Command Line Tools:

```bash
xcrun usdz_converter public/models/newton-force.glb public/models/newton-force.usdz
```

> Catatan: `usdz_converter` sering tidak tersedia di Xcode terbaru; gunakan Opsi A atau B.

## Verifikasi

```bash
# GLB ada
curl -I http://localhost:3000/models/newton-force.glb

# USDZ ada (setelah konversi)
curl -I http://localhost:3000/models/newton-force.usdz
```

- **Android / desktop:** butuh `newton-force.glb`
- **iPhone Safari:** butuh `newton-force.usdz` untuk AR Quick Look

Jika file belum ada, aplikasi menampilkan pesan jelas — tidak ada fallback ke model astronaut.
