# Selarasan Proposal LIDM dengan Implementasi Pint-AR

Dokumen ini membandingkan proposal lama (*COACHING 2-PINTAR-LIDM26.pdf*) dengan kondisi produk Pint-AR saat ini, serta memberikan panduan revisi untuk proposal lomba.

**Tanggal:** 7 Juli 2026  
**Sumber proposal:** `COACHING 2-PINTAR-LIDM26.pdf`  
**Sumber implementasi:** repositori Pint-AR (`PRD.md`, `features/`, kode aplikasi)

---

## Ringkasan Eksekutif

| Aspek | Proposal lama | Pint-AR sekarang |
|-------|---------------|------------------|
| Nama produk | PintAR | PintAR (sama) |
| Teknologi AR | Marker-based (Hiro) | WebAR surface detection (`<model-viewer>`) |
| Autentikasi | Tidak ada | Login siswa & guru |
| LKS Digital | Tidak ada | Fitur inti (autosave, penilaian) |
| Dasbor Guru | Tidak ada | Pantau progres + nilai LKS |
| Alur utama | Cetak marker → pilih mode → eksperimen | Login → dasbor → praktikum + LKS |
| Scan-Hero | — | Tidak pernah dipakai di codebase |

**Kesimpulan:** Visi produk masih sama (praktikum sains interaktif berbasis AR), tetapi proposal perlu diperbarui agar menggambarkan platform WebAR + LKS + peran siswa/guru — bukan lagi aplikasi marker-based tanpa akun.

---

## 1. Yang Masih Selaras (Tetap Bisa Dipakai)

- **Nama & akronim:** PintAR — *Praktikum Interaktif Augmented Reality*
- **Target pengguna:** Siswa SMP/SMA
- **Masalah:** Konsep sains abstrak, laboratorium terbatas, pembelajaran terlalu teoritis
- **Solusi:** Visualisasi 3D interaktif + AR untuk praktikum virtual
- **Platform:** Web browser (HP & PC), tanpa instal aplikasi
- **Metode pengembangan:** Agile (sprint, iterasi, evaluasi)
- **Latar belakang & daftar pustaka:** Masih relevan, bisa dipertahankan dengan sedikit penyesuaian

---

## 2. Perbedaan Besar yang Harus Diluruskan

### 2.1 Marker Hiro & Scan-Hero — Sudah Tidak Dipakai

**Di proposal lama (Bab 4.1):**
- Menu **Cetak Marker**
- Marker **Hiro** diunduh dan dicetak
- AR Processing Layer mendeteksi marker lewat kamera
- Objek 3D muncul di atas marker

**Di Pint-AR sekarang:**
- Tidak ada menu cetak marker
- Tidak ada deteksi marker Hiro
- AR memakai **Google `<model-viewer>`** dengan **WebXR** (Android) atau **AR Quick Look** (iOS)
- Objek diproyeksikan ke **permukaan meja** (surface tracking), tanpa kertas marker
- Istilah **Scan-Hero** tidak muncul di proposal PDF maupun di codebase — kemungkinan konsep versi lebih awal

**Tindakan revisi proposal:**
- Hapus seluruh bagian tentang marker Hiro, cetak marker, dan deteksi marker
- Ganti penjelasan AR dengan WebAR berbasis surface detection
- Hapus atau revisi "AR Processing Layer" yang khusus untuk pemindaian marker

---

### 2.2 Alur Pengguna (Workflow) — Perlu Ditulis Ulang

**Proposal lama:**
```
Landing Page
  → Menu Utama (Cetak Marker | Mulai Praktikum)
    → [Cetak Marker] → Unduh Hiro → Selesai
    → [Mulai Praktikum] → Daftar Eksperimen
      → Pilih Modul
        → Pilih Mode (Simulasi | Augmented Reality)
          → Interaksi
            → Selesai → Kembali ke menu
```

**Pint-AR sekarang:**
```
Landing Page (/)
  → Daftar (/daftar) atau Masuk (/masuk)
    → [Siswa baru] Onboarding (/onboarding) — tur 3 langkah
    → Dasbor Siswa (/siswa) — daftar modul, filter, progres
      → Pilih Modul → Praktikum (/praktikum/[modulId])
        → Simulasi 3D interaktif + tombol AR + Panduan + LKS (satu layar)
          → Isi LKS (autosave) → Selesai
            → Lihat nilai setelah guru menilai

[Guru]
  → Masuk → Dasbor Guru (/guru)
    → Pilih Modul → Daftar Siswa & Rekap Nilai
      → Periksa LKS per siswa → Beri skor
```

**Tindakan revisi proposal:** Ganti Gambar 4.1.1 dan narasi Bab 4.1 dengan alur di atas.

---

### 2.3 Fitur Baru yang Belum Ada di Proposal

| Fitur | Deskripsi singkat | Prioritas revisi |
|-------|-------------------|------------------|
| **Autentikasi** | Login/daftar, peran siswa & guru, kode undangan guru | Tinggi |
| **LKS Digital** | Lembar kerja terintegrasi di layar praktikum, autosave, penilaian guru | Tinggi |
| **Dasbor Siswa** | Daftar modul, filter kategori, progres, lanjutkan praktikum | Tinggi |
| **Dasbor Guru** | Pantau siswa aktif, periksa LKS, rekap nilai kelas | Tinggi |
| **Split-screen UX** | 3D/AR di atas, LKS di panel bawah (mobile: bottom sheet) | Sedang |
| **Onboarding** | Tur interaktif 3 langkah untuk siswa baru | Sedang |
| **Mode 3D fallback** | Otomatis ke tampilan 3D 360° jika AR gagal | Sedang |
| **Simulasi R3F** | Newton, rangkaian listrik, Tata Surya pakai React Three Fiber | Sedang |

---

### 2.4 Fitur Lama yang Sudah Tidak Relevan

| Fitur di proposal | Status di Pint-AR |
|-------------------|-------------------|
| Menu Cetak Marker | ❌ Tidak ada |
| Marker Hiro | ❌ Tidak dipakai |
| Pilihan terpisah Mode Simulasi vs Mode AR | ❌ Digabung dalam satu layar praktikum |
| Input via sensor goyang HP | ❌ Diganti slider, tombol, drag |
| Tanpa login | ❌ Wajib login |
| Tanpa LKS | ❌ LKS jadi fitur utama |
| Tanpa peran guru | ❌ Guru punya dasbor sendiri |

---

### 2.5 Arsitektur Sistem

**Proposal lama:** 3-layer — Client Layer, AR Processing Layer (deteksi marker), Content Layer

**Pint-AR sekarang:**

```
┌─────────────────────────────────────────────────────────┐
│  Client Layer (Next.js + React)                         │
│  • Landing, Auth, Dasbor Siswa/Guru, Praktikum UI       │
│  • Split-screen: 3D/AR + Panduan + LKS                  │
└─────────────────────┬───────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
┌──────────────┐ ┌──────────┐ ┌──────────────────────┐
│ model-viewer │ │ Better   │ │ Next.js API Routes   │
│ (WebXR /     │ │ Auth     │ │ • LKS answers        │
│  Quick Look) │ │          │ │ • Grades             │
└──────────────┘ └──────────┘ │ • Guru monitoring    │
                              └──────────┬───────────┘
                                         ▼
                              ┌──────────────────────┐
                              │ SQLite (Turso)       │
                              │ users, modul, lks,   │
                              │ jawaban, skor        │
                              └──────────────────────┘
```

**Tindakan revisi proposal:** Ganti Gambar 4.2.1 dan penjelasan Bab 4.2.

---

### 2.6 Modul Eksperimen

**Proposal:** "Daftar eksperimen" secara umum, tanpa detail modul.

**Pint-AR sekarang (5 modul):**

| No | Modul | Kategori | Status |
|----|-------|----------|--------|
| 1 | Hukum Newton: Gaya & Gerak | Fisika | ✅ Lengkap |
| 2 | Rangkaian Listrik Sederhana | Fisika | ✅ Lengkap |
| 3 | Tata Surya (Kepler) | Astronomi | ✅ Lengkap |
| 4 | Gerak Jatuh Bebas | Fisika | 🔄 Sedang dikembangkan |
| 5 | Reaksi Kimia | Kimia | 🔄 Sedang dikembangkan |

**Tindakan revisi proposal:** Sebut modul konkret di Bab 5 dan Bab 6.

---

### 2.7 Desain UI (Bab 5)

Screenshot di proposal (Landing, Daftar Eksperimen, Panduan, Area Eksperimen) menggambarkan UI lama. Ganti dengan tampilan aktual:

| Halaman | Route | Yang perlu di-screenshot |
|---------|-------|--------------------------|
| Landing | `/` | Hero + CTA Daftar/Masuk |
| Dasbor Siswa | `/siswa` | Kartu modul, filter, progres |
| Praktikum | `/praktikum/[id]` | Split-screen 3D + LKS |
| Dasbor Guru | `/guru` | Daftar modul |
| Periksa LKS | `/guru/modul/.../siswa/...` | Form penilaian |

---

## 3. Checklist Revisi Proposal

### Prioritas tinggi (wajib)

- [ ] **Bab 4.1 Workflow** — tulis ulang sesuai alur login → dasbor → praktikum → LKS
- [ ] **Hapus referensi marker** — Hiro, cetak marker, deteksi marker, Scan-Hero
- [ ] **Bab 4.2 Arsitektur** — tambah auth, database, LKS; ganti AR engine ke model-viewer
- [ ] **Bab 5 Desain UI** — ganti screenshot dengan UI terbaru
- [ ] **Tambah LKS Digital** di analisis fungsional
- [ ] **Tambah Dasbor Guru & Siswa** di analisis fungsional
- [ ] **Tambah Autentikasi** (peran siswa/guru)

### Prioritas sedang

- [ ] **Bab 2 Manfaat Guru** — perkuat dengan penilaian LKS & rekap nilai
- [ ] **Bab 6 Validasi** — tambah uji LKS, penilaian guru, autosave
- [ ] **Bab 6 Demo** — sesuaikan langkah demo dengan alur baru
- [ ] Sebut **5 modul** dengan nama dan topik spesifik

### Prioritas rendah

- [ ] **Abstrak** — tambah LKS terintegrasi & akses guru
- [ ] **Mode 3D fallback** untuk inklusivitas perangkat
- [ ] **Onboarding interaktif** untuk siswa baru

---

## 4. Draft Teks untuk Bagian yang Perlu Diperbarui

### 4.1 Abstrak (revisi)

> Pembelajaran sains di sekolah sering menghadapi tantangan karena banyak konsep yang bersifat abstrak dan sulit dipahami oleh siswa. Metode pembelajaran yang masih didominasi cara konvensional cenderung menekankan teori dibandingkan praktik, sehingga siswa kurang mendapatkan pengalaman langsung. Berdasarkan permasalahan tersebut, dikembangkan **PintAR** sebagai platform praktikum interaktif berbasis **Web Augmented Reality (WebAR)** yang menghadirkan konsep sains dalam bentuk visualisasi tiga dimensi interaktif. Melalui teknologi ini, siswa dapat memproyeksikan alat lab virtual ke meja belajar melalui kamera perangkat, berinteraksi dengan simulasi 3D, dan mengisi **Lembar Kerja Siswa (LKS) digital** dalam satu layar tanpa perlu menginstal aplikasi. Guru dapat memantau progres siswa dan menilai LKS melalui dasbor khusus. PintAR diharapkan dapat membantu meningkatkan pemahaman konsep sains siswa melalui pengalaman belajar yang lebih konkret, interaktif, dan dapat diakses di berbagai sekolah.
>
> **Kata Kunci:** Augmented Reality, WebAR, Pembelajaran Sains, LKS Digital, Visualisasi 3D, Pendidikan Sekolah.

---

### 4.2 System Workflow (Bab 4.1 — ganti narasi lama)

#### a. Akses Aplikasi
Pengguna membuka platform PintAR melalui peramban web. Halaman utama menampilkan informasi produk dan opsi untuk mendaftar atau masuk ke akun.

#### b. Autentikasi
Pengguna memilih peran sebagai **Siswa** atau **Guru**. Siswa mendaftar dengan email dan kata sandi. Guru mendaftar dengan kode undangan khusus. Setelah login, sistem mengarahkan pengguna sesuai perannya.

#### c. Onboarding (Siswa Baru)
Siswa yang baru pertama kali login diarahkan ke tur interaktif singkat yang menjelaskan cara menggunakan kamera AR dan memulai praktikum.

#### d. Dasbor Siswa
Siswa melihat daftar modul praktikum yang tersedia, dapat memfilter berdasarkan kategori (Fisika, Kimia, Astronomi), melihat progres LKS, dan melanjutkan modul terakhir yang dibuka.

#### e. Pemilihan Modul Praktikum
Siswa memilih modul yang ingin dipelajari. Sistem memuat halaman praktikum dengan tampilan terbagi: simulasi 3D interaktif di bagian atas, panel panduan langkah, dan LKS digital di panel bawah.

#### f. Simulasi 3D Interaktif
Siswa berinteraksi dengan simulasi melalui kontrol (slider, tombol, drag) untuk memahami konsep sains secara visual dan mendalam sebelum atau bersamaan dengan mode AR.

#### g. Mode Augmented Reality
Siswa dapat mengaktifkan mode AR untuk memproyeksikan model 3D ke permukaan meja melalui kamera. Sistem meminta izin kamera; jika ditolak atau perangkat tidak mendukung, otomatis beralih ke tampilan 3D 360°.

#### h. Pengisian LKS Digital
Selama praktikum, siswa mengisi pertanyaan pengamatan di LKS digital yang terintegrasi di layar yang sama. Jawaban disimpan otomatis secara berkala.

#### i. Penilaian oleh Guru
Guru masuk ke dasbor, memilih modul, melihat daftar siswa dan progres LKS, lalu memberikan skor per pertanyaan. Siswa dapat melihat nilai setelah LKS dinilai.

#### j. Penyelesaian Sesi
Setelah selesai, siswa dapat kembali ke dasbor atau memilih modul lain. Progres dan jawaban LKS tersimpan di server.

---

### 4.3 System Architecture (Bab 4.2 — ganti narasi lama)

#### a. Client Layer (Antarmuka Pengguna)
Lapisan antarmuka berbasis Next.js dan React. Menyediakan halaman landing, autentikasi, dasbor siswa dan guru, serta layar praktikum dengan tampilan terbagi (3D/AR, panduan, LKS). Mengelola izin kamera dan interaksi pengguna.

#### b. WebAR Engine (`<model-viewer>`)
Komponen Google yang menangani proyeksi AR. Secara otomatis memilih teknologi sesuai perangkat: WebXR untuk Android, AR Quick Look untuk iOS. Objek 3D diproyeksikan ke permukaan meja tanpa memerlukan marker fisik.

#### c. Simulasi 3D Interaktif
Modul praktikum tertentu memakai React Three Fiber untuk simulasi fisika interaktif (misalnya Hukum Newton, rangkaian listrik, orbit planet) yang berjalan di browser.

#### d. Backend & API
Next.js API Routes menangani penyimpanan jawaban LKS, penilaian guru, data modul, dan autentikasi. Better Auth mengelola sesi dan peran pengguna.

#### e. Database (SQLite/Turso)
Menyimpan data pengguna, modul praktikum, template LKS, jawaban siswa, dan skor penilaian.

#### f. Content Layer
Model 3D (format GLB untuk Android/Web, USDZ untuk iOS), materi panduan langkah, dan template pertanyaan LKS per modul.

---

### 4.4 Manfaat Bagi Guru (Bab 2.2.2 — tambahan)

Tambahkan poin berikut ke manfaat bagi guru:

- e. Memantau progres praktikum siswa secara real-time melalui dasbor guru
- f. Menilai LKS digital siswa secara langsung di platform tanpa perlu kertas
- g. Melihat rekap nilai seluruh siswa per modul untuk evaluasi pembelajaran

---

### 4.5 Validasi (Bab 6.2 — tambahan)

Tambahkan aspek validasi:

- **Validitas LKS Digital:** Pengujian autosave, kelengkapan form, dan alur pengumpulan jawaban
- **Validitas Dasbor Guru:** Kemudahan memantau siswa dan memberikan penilaian
- **Validitas WebAR tanpa Marker:** Kestabilan proyeksi objek ke permukaan meja di berbagai perangkat

---

### 4.6 Demo Pengembangan (Bab 6.3 — revisi)

Alur demo yang sesuai implementasi saat ini:

a. Pengguna membuka platform PintAR melalui peramban web  
b. Pengguna mendaftar atau masuk sebagai Siswa  
c. Siswa baru mengikuti tur onboarding singkat  
d. Siswa memilih modul praktikum dari dasbor  
e. Sistem menampilkan simulasi 3D interaktif dan panduan langkah  
f. Siswa mengisi LKS digital sambil mengeksplorasi simulasi  
g. Siswa mengaktifkan mode AR dan memproyeksikan model ke meja  
h. Guru masuk, memilih modul, dan menilai LKS siswa  
i. Siswa melihat nilai setelah penilaian selesai  

---

## 5. Rute Aplikasi (Referensi Teknis)

| Route | Peran | Fungsi |
|-------|-------|--------|
| `/` | Publik | Landing page |
| `/masuk` | Publik | Login |
| `/daftar` | Publik | Registrasi siswa/guru |
| `/onboarding` | Siswa | Tur interaktif pertama kali |
| `/siswa` | Siswa | Dasbor modul & progres |
| `/praktikum/[modulId]` | Siswa | Praktikum 3D + AR + LKS |
| `/guru` | Guru | Dasbor modul |
| `/guru/modul/[moduleId]` | Guru | Daftar siswa & rekap nilai |
| `/guru/modul/[moduleId]/siswa/[studentId]` | Guru | Periksa & nilai LKS |

---

## 6. File Referensi di Repositori

| Dokumen | Path | Isi |
|---------|------|-----|
| PRD | `PRD.md` | Visi produk, user flow, arsitektur, skema DB |
| Modul AR | `features/01-modul-praktikum-ar.md` | Spesifikasi modul praktikum |
| LKS Digital | `features/02-lks-digital.md` | Spesifikasi LKS |
| Dasbor Guru | `features/03-dasbor-guru.md` | Spesifikasi dasbor guru |
| Autentikasi | `features/04-autentikasi.md` | Spesifikasi login & peran |
| Onboarding | `features/05-onboarding-interaktif.md` | Spesifikasi tur siswa baru |
| Mode 3D Fallback | `features/06-mode-3d-fallback.md` | Spesifikasi fallback AR |

---

## 7. Catatan untuk Tim

1. **Scan-Hero** tidak muncul di proposal PDF maupun di kode — aman untuk diabaikan atau disebutkan sebagai konsep awal yang sudah diganti WebAR.
2. **Marker Hiro** adalah perbedaan teknis terbesar; pastikan seluruh diagram dan narasi AR di proposal tidak lagi menyebut marker.
3. **Screenshot Bab 5** wajib diganti agar juri melihat produk yang benar-benar dibangun.
4. **Manfaat guru** di proposal lama masih generik — sekarang ada fitur konkret (dasbor, penilaian LKS) yang harus ditonjolkan.
5. Tiga modul (Newton, Rangkaian Listrik, Tata Surya) siap didemo; dua modul lain masih dalam pengembangan — sebutkan dengan jujur di proposal.

---

*Dokumen ini dibuat untuk membantu penyelarasan proposal LIDM dengan implementasi aktual Pint-AR.*
