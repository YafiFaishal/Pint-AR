#!/usr/bin/env bash
# Eksperimen pipeline USDZ animasi untuk iOS Quick Look (Tata Surya).
# Jalankan dari root repo: bash scripts/ios-animated-usdz/try-pipelines.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
GLB="$ROOT/public/models/solar-system.glb"
USDZ="$ROOT/public/models/solar-system.usdz"
OUT_TEST="$ROOT/public/models/solar-system-animated.usdz"
LOG="$ROOT/scripts/ios-animated-usdz/last-run.log"

mkdir -p "$(dirname "$LOG")"
exec > >(tee "$LOG") 2>&1

echo "=== Pint-AR: iOS animated USDZ pipeline test ==="
echo "Waktu: $(date)"
echo

# --- Baseline: GLB ---
echo "--- [0] Verifikasi GLB (Android) ---"
if [[ -f "$GLB" ]]; then
  node -e "
const fs=require('fs');
const { GLTFLoader }=require('three/examples/jsm/loaders/GLTFLoader.js');
global.FileReader=class{readAsArrayBuffer(b){b.arrayBuffer().then(x=>{this.result=x;this.onloadend()})}};
const buf=fs.readFileSync('$GLB');
new GLTFLoader().parse(buf.buffer.slice(buf.byteOffset,buf.byteOffset+buf.byteLength),'',g=>{
  const n=g.animations?.length??0;
  console.log(n?('✓ GLB punya '+n+' clip: '+g.animations.map(a=>a.name).join(', ')):'✗ GLB tanpa animasi');
});
" || echo "⚠ Gagal parse GLB"
else
  echo "✗ GLB tidak ada — npm run generate:solar-ar"
fi
echo

# --- Baseline: USDZ saat ini ---
echo "--- [0b] Verifikasi USDZ production ---"
if command -v python3 >/dev/null; then
  python3 "$ROOT/scripts/ios-animated-usdz/inspect-usdz-animation.py" "$USDZ" || true
else
  echo "⚠ python3 tidak ada"
fi
echo

# --- Opsi 2: Apple usdzconvert / usdz_converter ---
echo "--- [2] Apple usdzconvert / usdz_converter ---"
if command -v usdzconvert >/dev/null; then
  echo "Mencoba usdzconvert…"
  usdzconvert "$GLB" "$OUT_TEST" && echo "✓ usdzconvert selesai → $OUT_TEST"
elif xcrun --find usdz_converter >/dev/null 2>&1; then
  echo "Mencoba xcrun usdz_converter…"
  xcrun usdz_converter "$GLB" "$OUT_TEST" && echo "✓ usdz_converter selesai → $OUT_TEST"
else
  echo "✗ Tidak tersedia di mesin ini."
  echo "  Install: USDZ Tools dari https://developer.apple.com/augmented-reality/quick-look/"
  echo "  Atau Docker: docker run -v \${PWD}:/mnt/assets --rm michaelgold/usdzconvert /mnt/assets/public/models/solar-system.glb"
fi
echo

# --- Opsi 1: Blender headless ---
echo "--- [1] Blender headless export ---"
BLENDER=""
for candidate in \
  "/Applications/Blender.app/Contents/MacOS/Blender" \
  "/Applications/Blender 4.app/Contents/MacOS/Blender" \
  blender; do
  if command -v "$candidate" >/dev/null 2>&1 || [[ -x "$candidate" ]]; then
    BLENDER="$candidate"
    break
  fi
done
if [[ -n "$BLENDER" ]]; then
  echo "Mencoba Blender: $BLENDER"
  "$BLENDER" --background --python "$ROOT/scripts/ios-animated-usdz/blender-export-solar-system-usdz.py" \
    && python3 "$ROOT/scripts/ios-animated-usdz/inspect-usdz-animation.py" "$OUT_TEST" || true
else
  echo "✗ Blender tidak terpasang."
  echo "  Install Blender lalu jalankan skrip Python di scripts/ios-animated-usdz/blender-export-solar-system-usdz.py"
fi
echo

# --- Opsi 3: Reality Composer (manual) ---
echo "--- [3] Reality Composer / Reality Composer Pro ---"
echo "Manual only — tidak bisa diotomasi dari CI."
echo "  Reality Composer (iPad/Mac): import GLB → export .reality → Quick Look preview"
echo "  Reality Composer Pro (Xcode): File → Import solar-system.glb → Preview di device"
echo "  Catatan: .reality tidak dipakai model-viewer; hasil akhir tetap harus USDZ untuk ios-src web."
echo

echo "=== Selesai. Log: $LOG ==="
