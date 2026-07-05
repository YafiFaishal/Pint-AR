# Aset AR — Tata Surya (Kepler)

File untuk mode **Lihat di Meja (AR)** pada modul Tata Surya. Simulasi 3D interaktif (slider, pilih planet) tidak memakai file ini.

## File

| File | Platform | Status |
|------|----------|--------|
| `Solar_system.glb` | Web, Android, WebXR, Scene Viewer | File GLB produksi (AR) |
| `Solar_system.usdz` | iPhone / iOS AR Quick Look | File USDZ produksi (AR) |
| `solar-system.glb` / `solar-system.usdz` | — | Legacy orrery dari skrip generator (cadangan) |

## Isi model (orrery tabletop edukatif)

- Alas bundar gelap + tiang pusat
- Matahari di tengah (glow/pulse ringan)
- 4 planet: Merkurius, Bumi (+ Bulan), Mars, Jupiter
- Orbit ring tipis statis per planet + orbit Bulan kecil
- **Bukan skala riil** — planet terlihat jelas, semua muat satu frame meja
- **Tanpa** sky sphere / background sphere
- Terpusat di origin

## Animasi GLB (`TataSuryaOrbit`, loop 12 detik)

| Objek | Perilaku |
|-------|----------|
| Merkurius | Orbit paling cepat |
| Bumi | Orbit sedang |
| Mars | Orbit lebih lambat |
| Jupiter | Orbit paling lambat |
| Bulan | Orbit cepat mengelilingi Bumi |
| Halo Matahari | Pulse scale ringan |
| Orbit ring | Statis |

## Regenerasi GLB

```bash
npm run generate:solar-ar
```

Skrip: `scripts/generate-solar-system-ar-model.mjs` (Three.js GLTFExporter).

## Konversi GLB → USDZ (iOS)

Node **tidak** menghasilkan USDZ secara native. Pilih salah satu:

### Opsi A — Reality Converter (paling mudah)

1. Unduh [Reality Converter](https://developer.apple.com/augmented-reality/tools/) (macOS).
2. Buka `solar-system.glb`.
3. Export / Save as `solar-system.usdz` ke folder ini.

### Opsi B — usdzconvert (CLI Apple)

```bash
usdzconvert public/models/solar-system.glb public/models/solar-system.usdz
```

### Opsi C — Xcode (versi lama)

```bash
xcrun usdz_converter public/models/solar-system.glb public/models/solar-system.usdz
```

> **Animasi di iOS:** Quick Look **mungkin** tidak memutar animasi GLB setelah konversi — model tetap tampil statis. Uji di iPhone; jika animasi tidak jalan, AR iOS tetap valid sebagai orrery statis.

**Eksperimen pipeline animasi iOS:** lihat [README-solar-system-ios-animation.md](./README-solar-system-ios-animation.md)

```bash
bash scripts/ios-animated-usdz/try-pipelines.sh
python3 scripts/ios-animated-usdz/inspect-usdz-animation.py public/models/solar-system.usdz
```

## Verifikasi

```bash
curl -I http://localhost:3000/models/Solar_system.glb
curl -I http://localhost:3000/models/Solar_system.usdz
```

- **Android:** butuh `Solar_system.glb`
- **iPhone Safari:** butuh `Solar_system.usdz` untuk AR Quick Look

Jika file belum ada, aplikasi menampilkan pesan jelas — tidak ada fallback ke model astronaut.
