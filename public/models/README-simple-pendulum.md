# Model AR — Getaran Bandul Sederhana

File:

- `simple-pendulum.glb` — model animasi untuk Android AR / model-viewer
- `simple-pendulum.usdz` — model iOS Quick Look (konversi manual jika perlu)

## Generate

```bash
npm run generate:simple-pendulum-ar
```

Animasi: `SimplePendulumDemo` (~9 s, loop) — rotasi `PendulumGroup` sinusoidal (L = 1 m, θ₀ = 15°, g = 9.8 m/s²).

## USDZ (iOS)

`simple-pendulum.usdz` dibuat otomatis oleh generator lewat `USDZExporter` three.js
(bagian dari `npm run generate:simple-pendulum-ar`).

**Catatan:** `USDZExporter` tidak membawa animasi, jadi USDZ adalah **model statis**
pada sudut awal ~15° (fallback yang valid untuk iOS Quick Look). Versi Android /
model-viewer memakai `simple-pendulum.glb` yang **beranimasi** (`SimplePendulumDemo`).

Untuk USDZ beranimasi (opsional), gunakan pipeline Blender/Reality Composer di
`scripts/ios-animated-usdz/`.
