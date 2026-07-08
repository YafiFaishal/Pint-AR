# Lampiran — Pernyataan Transparansi Penggunaan KA/AI (LIDM 2026)

Isian untuk tabel **"Karya inovasi menggunakan sumber daya KA/AI berbasis awan (Cloud AI) atau API pihak ketiga..."** pada Lampiran 3.b proposal PintAR.

> **Catatan:** PintAR **tidak** memakai Generative AI (ChatGPT, Gemini, dll.) sebagai fitur yang dijalankan pengguna saat praktikum. Tabel ini mencantumkan **API pihak ketiga** yang menjadi komponen operasional produk. Centang pada formulir tetap valid karena klausul memakai kata **"atau API pihak ketiga"**.

---

## Tabel (siap salin ke proposal)

| No. | Nama Aplikasi AI/API | Fungsi yang Didukung dalam Inovasi | Kustomisasi |
|-----|----------------------|-------------------------------------|-------------|
| 1 | **Google `<model-viewer>`** (library WebAR) | Menampilkan model 3D alat lab, mendeteksi ketersediaan AR per perangkat, dan memanggil mode AR (WebXR / AR Quick Look) saat siswa menekan tombol *Lihat di Meja (AR)* | Tim membuat wrapper React (`ModelViewer`), memetakan aset GLB/USDZ per modul, menangani fallback ke mode 3D 360° jika AR gagal, serta mengatur label tombol dan callback status sesi AR |
| 2 | **WebXR API** (browser Android/Chrome) | Proyeksi objek 3D ke permukaan meja melalui kamera HP pada perangkat Android yang mendukung WebXR | Integrasi tidak langsung; dipanggil otomatis oleh `model-viewer`. Tim menguji kompatibilitas perangkat dan menambahkan alur izin kamera + pesan error ke pengguna |
| 3 | **AR Quick Look** (iOS Safari) | Menampilkan model USDZ dalam sesi AR native di iPhone/iPad saat siswa membuka mode AR | Tim menyiapkan aset USDZ kustom per modul (mis. Newton, Tata Surya, Reaksi Kimia) dan memetakan `iosSrc` di komponen praktikum agar sesuai materi pembelajaran |
| 4 | **Turso / libSQL** (database berbasis cloud, opsional saat deploy) | Menyimpan data akun siswa/guru, template LKS, jawaban siswa, skor penilaian guru, dan progres praktikum | Tim merancang skema database sendiri (Drizzle ORM), API Routes Next.js untuk LKS & dasbor guru, serta logika autosave jawaban — bukan memakai layanan AI |

---

## Versi ringkas (jika kolom sempit)

| No. | Nama Aplikasi AI/API | Fungsi | Kustomisasi |
|-----|----------------------|--------|-------------|
| 1 | Google `model-viewer` | WebAR & tampilan 3D model alat lab | Wrapper React, mapping aset per modul, fallback 3D |
| 2 | WebXR API | AR proyeksi ke meja (Android) | Uji perangkat, izin kamera, handling error |
| 3 | AR Quick Look (iOS) | AR model USDZ (iPhone/iPad) | Aset USDZ kustom per modul praktikum |
| 4 | Turso / libSQL | Penyimpanan akun, LKS, nilai | Skema DB & API buatan tim (Drizzle + Next.js) |

---

## Yang tidak dimasukkan ke tabel ini

| Alat/Layanan | Alasan |
|--------------|--------|
| ChatGPT / Cursor / Copilot (jika dipakai saat ngoding) | Alat bantu pengembangan, **bukan** komponen operasional yang dijalankan pengguna saat memakai PintAR |
| Better Auth | Library autentikasi open-source yang di-host sendiri di server tim, bukan API cloud pihak ketiga |
| React Three Fiber / Three.js | Library open-source untuk simulasi 3D, dijalankan di browser pengguna |

Jika tim memakai AI generatif hanya untuk **asistensi penulisan proposal atau kode** (bukan fitur produk), cantumkan di bagian pernyataan transparansi lain atau di penjelasan bahwa penggunaan AI ≤ 25% sebagai alat bantu, sesuai aturan LIDM.

---

## Kalimat pendukung (opsional, di bawah tabel)

> Arsitektur integrasi API di atas dirancang mandiri oleh tim: pemilihan `model-viewer` sebagai mesin WebAR, pemetaan aset 3D per modul sains, alur izin kamera, fallback mode 3D, serta API backend untuk LKS dan penilaian guru. Tidak ada layanan Generative AI yang dipanggil saat siswa atau guru menggunakan platform PintAR.
