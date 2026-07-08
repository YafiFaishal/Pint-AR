# Model AR — Hukum Hooke dan Elastisitas Pegas

File (versi 2 — mengikuti scene web terbaru sebagai source of truth):

- `hooke-elasticity-v2.glb` — model animasi untuk Android AR / Scene Viewer / model-viewer
- `hooke-elasticity-v2.usdz` — model iOS Quick Look (statis, via three USDZExporter)

> Nama versi `-v2` dipakai untuk cache-busting agar browser & Quick Look tidak memuat aset lama.

## Generate

```bash
npm run generate:hookes-law-ar
```

Skrip: `scripts/generate-hookes-law-ar-model.mjs` (Three.js GLTFExporter + USDZExporter).
Struktur & proporsi identik dengan `src/components/praktikum/hukum-hooke/hookes-law-scene.tsx`.

## Animasi (Android GLB)

- Clip pertama: `HookeLoop` (~3.2 s, looping seamless).
- Pegas memanjang/memendek via **morph target** (coil radius & ketebalan kawat tetap).
- `SpringBottomAnchor` (pengait bawah + beban + panah gaya) bergerak vertikal sinkron dengan morph.
- Base, stand, top beam, dan fixed top hook selalu diam.
- Demo default: k = 50 N/m, m = 1 kg, g = 9.8 m/s² → x ≈ 19.6 cm, F ≈ 9.8 N.

## USDZ (iOS)

`hooke-elasticity-v2.usdz` statis pada posisi setimbang (x ≈ 19.6 cm). Origin di bawah base
(bagian bawah menempel ke meja). Animasi USDZ Quick Look tidak dijamin — GLB beranimasi untuk Android.

## Verifikasi

```bash
curl -I http://localhost:3000/models/hooke-elasticity-v2.glb
curl -I http://localhost:3000/models/hooke-elasticity-v2.usdz
```
