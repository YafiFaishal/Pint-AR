#!/usr/bin/env bash
# Start dev + ngrok tanpa restart bolak-balik.
# Pakai: npm run dev:tunnel
set -euo pipefail
cd "$(dirname "$0")/.."

ENV_FILE=".env"
NGROK_API="http://127.0.0.1:4040/api/tunnels"

# Sudah jalan? Cukup lapor URL.
if curl -sf -o /dev/null http://localhost:3000 2>/dev/null && pgrep -f "ngrok http 3000" >/dev/null 2>&1; then
  URL=$(curl -sf "$NGROK_API" | python3 -c "import json,sys; d=json.load(sys.stdin); print(next((t['public_url'] for t in d.get('tunnels',[]) if t.get('public_url','').startswith('https')), ''))" 2>/dev/null || true)
  echo "✓ Sudah jalan."
  echo "  Local:  http://localhost:3000"
  echo "  Ngrok:  ${URL:-?}"
  exit 0
fi

# Bersihkan port 3000 kalau zombie (bukan next dev aktif).
if lsof -ti :3000 >/dev/null 2>&1 && ! pgrep -f "next dev" >/dev/null 2>&1; then
  lsof -ti :3000 | xargs kill 2>/dev/null || true
  sleep 1
fi

# Start ngrok di background kalau belum ada.
if ! pgrep -f "ngrok http 3000" >/dev/null 2>&1; then
  echo "→ Menjalankan ngrok…"
  ngrok http 3000 --log=stdout > /tmp/pintar-ngrok.log 2>&1 &
  sleep 2
fi

URL=$(curl -sf "$NGROK_API" | python3 -c "import json,sys; d=json.load(sys.stdin); print(next((t['public_url'] for t in d.get('tunnels',[]) if t.get('public_url','').startswith('https')), ''))")
if [[ -z "$URL" ]]; then
  echo "✗ Ngrok belum siap. Cek: ngrok http 3000"
  exit 1
fi

# Update .env hanya kalau URL berubah.
CURRENT=$(grep '^BETTER_AUTH_URL=' "$ENV_FILE" 2>/dev/null | cut -d= -f2- || true)
if [[ "$CURRENT" != "$URL" ]]; then
  echo "→ Memperbarui .env ($URL)"
  sed -i '' "s|^BETTER_AUTH_URL=.*|BETTER_AUTH_URL=${URL}|" "$ENV_FILE"
  sed -i '' "s|^NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=${URL}|" "$ENV_FILE"
  NEED_RESTART=1
else
  echo "→ .env sudah sesuai, tanpa restart env."
  NEED_RESTART=0
fi

# Start dev (foreground — terminal ini harus tetap terbuka).
echo ""
echo "✓ Ngrok:  $URL"
echo "✓ Local:  http://localhost:3000"
echo ""
echo "Jangan tutup terminal ini supaya server tidak mati."
echo "Tekan Ctrl+C untuk stop."
echo ""

exec npm run dev
