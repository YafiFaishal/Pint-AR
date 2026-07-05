import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Tetapkan root ke folder proyek agar Next tidak salah mendeteksi
  // lockfile lain di direktori induk.
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Izinkan akses dev dari IP LAN & domain tunnel (untuk uji di HP asli).
  allowedDevOrigins: [
    "192.168.100.99",
    "*.ngrok-free.app",
    "*.ngrok-free.dev",
    "*.ngrok.app",
    "*.ngrok.io",
    "*.trycloudflare.com",
  ],
};

export default nextConfig;
