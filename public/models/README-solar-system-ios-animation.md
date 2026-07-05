# Eksperimen: Animasi orbit Tata Surya di iPhone Quick Look

> **Status MVP:** AR iOS **statis** tetap valid. GLB animasi di Android **tidak diubah**.
> Dokumen ini mencatat percobaan agar USDZ ikut animasi — **bukan blocker** rilis.

## Diagnosis (Juli 2026)

| Aset | Animasi? | Platform |
|------|----------|----------|
| `solar-system.glb` | ✅ Clip `TataSuryaOrbit` (6 track, 12 detik) | Android / WebXR |
| `solar-system.usdz` (production) | ❌ **Statis** | iPhone Quick Look |

Verifikasi USDZ production (`usd-core`):

```bash
pip install usd-core   # sekali
python3 scripts/ios-animated-usdz/inspect-usdz-animation.py public/models/solar-system.usdz
```

Hasil saat ini:

```
Time range: 0.0 → 0.0
Status: ⚠ STATIS — tidak ada clip animasi
```

Hierarchy USDZ production: mesh digabung (`Object_45`, `Object_46`, …) — **animasi GLB hilang saat konversi**, bukan bug di app.

**Kesimpulan:** iPhone tampil statis karena file USDZ-nya statis, bukan karena `model-viewer` atau logic praktikum.

---

## Opsi yang dicoba

Jalankan semua cek otomatis:

```bash
bash scripts/ios-animated-usdz/try-pipelines.sh
```

### Opsi 1 — Blender → USDZ (baked transform animation)

| | |
|---|---|
| **Tool** | Blender 3.6+ headless |
| **Skrip** | `scripts/ios-animated-usdz/blender-export-solar-system-usdz.py` |
| **Output uji** | `public/models/solar-system-animated.usdz` |
| **Status di CI/dev machine** | ❌ Blender tidak terpasang — **belum diuji end-to-end** |
| **Harapan** | Import GLB (bawa clip) → Export USD dengan `export_animation=True` |

```bash
npm run generate:solar-ar

/Applications/Blender.app/Contents/MacOS/Blender --background \
  --python scripts/ios-animated-usdz/blender-export-solar-system-usdz.py

python3 scripts/ios-animated-usdz/inspect-usdz-animation.py \
  public/models/solar-system-animated.usdz
```

**Uji iPhone:** AirDrop / host file → tap → planet harus orbit. Jika OK, ganti `solar-system.usdz` manual.

**Risiko:** Material transmission/emissive GLB mungkin disederhanakan; orbit Bulan nested perlu dicek visual.

---

### Opsi 2 — Apple `usdzconvert` / `usdz_converter`

| | |
|---|---|
| **Tool** | USDZ Tools (Apple) atau Xcode CLI |
| **Status di dev machine** | ❌ `usdzconvert` & `usdz_converter` tidak ditemukan |
| **Alternatif** | Docker (jika ada): `docker run -v ${PWD}:/mnt/assets --rm michaelgold/usdzconvert /mnt/assets/public/models/solar-system.glb` |
| **Harapan** | Konversi resmi Apple sering membawa animasi transform rigid-body |

```bash
# Setelah install USDZ Tools (PATH)
usdzconvert public/models/solar-system.glb public/models/solar-system-animated.usdz

# atau
xcrun usdz_converter public/models/solar-system.glb public/models/solar-system-animated.usdz
```

**Catatan komunitas:** `usd_from_gltf` (Google) bagus untuk transform animation, tapi ada laporan regresi skeletal di iOS 15+. Model kita pakai **transform position/scale** (bukan skeleton) — seharusnya lebih aman.

---

### Opsi 3 — Reality Composer / Reality Composer Pro

| | |
|---|---|
| **Tool** | Reality Composer (iPad/Mac) atau Reality Composer Pro (Xcode) |
| **Status** | ⚠️ **Manual** — tidak bisa diotomasi dari repo |
| **Langkah** | Import `solar-system.glb` → preview animasi di Quick Look (tombol ▶ di RCP) → export USDZ |
| **`.reality`** | Bisa animasi di editor, tapi **web `ios-src` butuh `.usdz`**, bukan `.reality` |

**Reality Composer Pro (disarankan Apple WWDC):**

1. Buka RCP → Import `solar-system.glb`
2. Timeline: pastikan clip `TataSuryaOrbit` terdeteksi
3. Preview on Device (Quick Look)
4. Export / publish sebagai USDZ

**Status:** Belum diverifikasi di device — perlu Mac + Xcode.

---

### Opsi 4 — Google `usd_from_gltf` (CLI)

| | |
|---|---|
| **Repo** | https://github.com/google/usd_from_gltf |
| **Status di dev machine** | ❌ Perlu compile (cmake + USD SDK) — tidak di-build otomatis |
| **Command** | `usd_from_gltf solar-system.glb solar-system-animated.usdz` |
| **Catatan** | Dirancang khusus glTF→USDZ untuk Quick Look; mendukung rigid animation |

---

## Rekomendasi urutan uji (Mac + iPhone)

1. **Reality Converter** — buka GLB → Save USDZ → uji iPhone (cepat; sering animasi ikut untuk transform)
2. **`usdzconvert`** (USDZ Tools) — jika animasi RC gagal
3. **Blender USD export** — kontrol penuh bake animation
4. **`usd_from_gltf`** — pipeline CI headless jika compile OK

Setelah setiap export:

```bash
python3 scripts/ios-animated-usdz/inspect-usdz-animation.py path/to/output.usdz
```

Time range harus **> 0** (mis. `0 → 288` pada 24 fps untuk 12 detik).

---

## Jika semua gagal (fallback MVP)

- Tetap pakai `solar-system.usdz` **statis** di iPhone
- Android tetap `solar-system.glb` **animasi** + `autoplay`
- Simulasi 3D interaktif (slider Kepler) tetap penuh di semua platform
- **Tidak ada perubahan logic app**

---

## File terkait

| File | Fungsi |
|------|--------|
| `scripts/generate-solar-system-ar-model.mjs` | Generate GLB animasi |
| `scripts/ios-animated-usdz/try-pipelines.sh` | Coba tool yang tersedia |
| `scripts/ios-animated-usdz/inspect-usdz-animation.py` | Cek animasi di USDZ |
| `scripts/ios-animated-usdz/blender-export-solar-system-usdz.py` | Export Blender headless |
| `public/models/README-solar-system.md` | Dokumentasi aset utama |
