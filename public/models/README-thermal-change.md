# Aset AR — Kalor dan Perubahan Suhu

File untuk mode **Lihat AR** pada modul Kalor dan Perubahan Suhu. Simulasi 3D interaktif (slider, pemanasan, grafik) tidak memakai file ini. Setiap jenis zat punya pasangan GLB + USDZ tersendiri, dipilih otomatis mengikuti zat yang sedang dipilih siswa.

## File (per jenis zat)

| Zat | GLB (Android/WebXR/Scene Viewer) | USDZ (iOS Quick Look) |
|-----|----------------------------------|-----------------------|
| Air | `heat-water-ar.glb` | `heat-water-ar.usdz` |
| Minyak | `heat-oil-ar.glb` | `heat-oil-ar.usdz` |
| Aluminium | `heat-aluminium-ar.glb` | `heat-aluminium-ar.usdz` |
| Tembaga | `heat-copper-ar.glb` | `heat-copper-ar.usdz` |

Isi model mengikuti simulasi 3D terbaru: alas praktikum, hot plate (body, permukaan panas, ring glow, lampu indikator, kaki), wadah gelas kimia + cairan + permukaan (zat cair), balok logam (zat padat), probe/termometer dengan kepala display, gelembung, dan uap.

- **GLB (Android):** animasi looping `HeatLoop` (~6 s) — gelembung naik & membesar lalu menghilang, uap mengapung & memudar, glow pemanas + lampu berdenyut halus. Animasi berhenti mulus di batas loop (gelembung/uap ber-scale 0 di ujung klip) sehingga tidak ada lompatan.
- **USDZ (iOS):** statis pada kondisi "sedang dipanaskan" — hot plate menyala, warna zat sudah hangat, beberapa gelembung & uap tipis dalam posisi diam. Animasi tidak dijamin berjalan di Quick Look (sesuai desain).

Zat padat (Aluminium & Tembaga) tidak memakai gelembung/uap; kondisi panas ditunjukkan lewat pergeseran warna + emissive hangat halus.

## Regenerasi

```bash
npm run generate:thermal-change-ar
```

Skrip: `scripts/generate-thermal-change-ar-model.mjs` (Three.js GLTFExporter untuk GLB beranimasi + USDZExporter untuk USDZ statis). Konstanta visual disinkronkan dari `scripts/thermal-change-visual.mjs` (mirror `src/lib/thermal-change-visual.ts`).

- Skala AR: `0.26×` → lebar meja ~0.25 m saat ditempatkan.
- Pivot di tengah-bawah alas; `minY ≈ 0` sehingga model berdiri di atas permukaan, tidak tenggelam/melayang.

## Verifikasi

```bash
curl -I http://localhost:3000/models/heat-water-ar.glb
curl -I http://localhost:3000/models/heat-water-ar.usdz
```

- **Android / WebXR / Scene Viewer:** butuh `.glb` (beranimasi).
- **iPhone Safari:** butuh `.usdz` (statis).
- Jika aset zat tertentu belum ada, tombol AR menampilkan pesan "Model AR untuk zat ini belum tersedia." tanpa membuat halaman error.
