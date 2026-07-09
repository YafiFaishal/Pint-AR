# Pint-AR — Warm Scholarly Theme Implementation Guide

Dokumen ini adalah **instruksi siap tempel ke Cursor** untuk mengganti seluruh warna website Pint-AR ke palet baru tanpa mengubah layout, struktur, fungsi, urutan konten, ukuran komponen, maupun responsivitas yang sudah ada.

---

# 1. Perintah utama untuk Cursor

> Baca seluruh project Pint-AR terlebih dahulu, lalu terapkan sistem warna baru berdasarkan dokumen ini.
>
> **ATURAN PALING PENTING: JANGAN UBAH LAYOUT.**
>
> Jangan mengubah:
>
> - struktur halaman;
> - urutan section;
> - posisi komponen;
> - ukuran kartu;
> - padding dan margin yang sudah ada;
> - grid/flex layout;
> - breakpoint responsive;
> - teks;
> - alur navigasi;
> - logika autentikasi;
> - data praktikum;
> - route;
> - fungsi tombol;
> - tinggi halaman;
> - jumlah kolom;
> - bentuk formulir;
> - struktur dashboard guru dan siswa.
>
> Yang boleh diubah hanya:
>
> - warna;
> - gradasi;
> - background;
> - border;
> - shadow;
> - warna teks;
> - warna status;
> - warna tombol;
> - warna input/focus state;
> - warna filter/chip;
> - logo Pint-AR;
> - ikon kecil modul/praktikum;
> - transisi warna yang halus.
>
> Jangan melakukan redesign layout. Jangan memindahkan elemen. Jangan menambah section baru.
>
> Pertahankan stack dan cara styling project yang sekarang. Jika project memakai Tailwind, tetap gunakan Tailwind. Jika memakai CSS/SCSS/CSS Module, tetap gunakan sistem tersebut. Jangan migrasi framework styling.

---

# 2. Palet warna resmi Pint-AR

Gunakan enam warna utama berikut sebagai sumber warna seluruh website:

| Token | Hex | Nama | Fungsi utama |
|---|---:|---|---|
| `fairy-pink` | `#EED4CB` | Fairy Pink | highlight lembut, background badge, glow |
| `osprey-nest` | `#CEB8B0` | Osprey Nest | border, input, soft surface |
| `tranquil-taupe` | `#B1A495` | Tranquil Taupe | secondary text, divider, inactive state |
| `antique-gold` | `#A58257` | Rookwood Antique Gold | aksen utama, CTA, AR highlight |
| `jute-brown` | `#815F40` | Jute Brown | primary button, active state, heading accent |
| `balsamic` | `#44433E` | Balsamic Reduction | teks utama, navbar, dark button |

Warna netral tambahan yang boleh digunakan:

```css
#FFFFFF  /* card dan input */
#FFFDFC  /* background utama */
#F8F3EF  /* background sekunder */
```

Jangan gunakan lagi warna neon biru, ungu, cyan, hijau terang, atau hitam pekat sebagai identitas utama.

---

# 3. Design tokens

Tambahkan token berikut di file global theme yang sudah digunakan project.

```css
:root {
  /* Brand palette */
  --pintar-fairy-pink: #EED4CB;
  --pintar-osprey-nest: #CEB8B0;
  --pintar-tranquil-taupe: #B1A495;
  --pintar-antique-gold: #A58257;
  --pintar-jute-brown: #815F40;
  --pintar-balsamic: #44433E;

  /* Semantic colors */
  --color-primary: var(--pintar-jute-brown);
  --color-primary-hover: #6F5036;
  --color-secondary: var(--pintar-antique-gold);
  --color-accent: var(--pintar-fairy-pink);

  --color-text: var(--pintar-balsamic);
  --color-text-muted: #756F68;
  --color-text-soft: var(--pintar-tranquil-taupe);

  --color-bg: #FFFDFC;
  --color-bg-soft: #F8F3EF;
  --color-surface: #FFFFFF;

  --color-border: rgba(177, 164, 149, 0.42);
  --color-border-strong: rgba(129, 95, 64, 0.55);

  /* Shadows */
  --shadow-soft:
    0 8px 24px rgba(68, 67, 62, 0.07);

  --shadow-card:
    0 14px 36px rgba(68, 67, 62, 0.09);

  --shadow-primary:
    0 10px 24px rgba(129, 95, 64, 0.20);

  /* Gradients */
  --gradient-primary:
    linear-gradient(
      135deg,
      #815F40 0%,
      #A58257 58%,
      #CEB8B0 100%
    );

  --gradient-primary-dark:
    linear-gradient(
      135deg,
      #44433E 0%,
      #815F40 62%,
      #A58257 100%
    );

  --gradient-soft:
    linear-gradient(
      135deg,
      rgba(238, 212, 203, 0.88) 0%,
      rgba(206, 184, 176, 0.62) 55%,
      rgba(177, 164, 149, 0.32) 100%
    );

  --gradient-card:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.96) 0%,
      rgba(238, 212, 203, 0.22) 100%
    );

  --focus-ring:
    0 0 0 4px rgba(165, 130, 87, 0.20);
}
```

Apabila project memakai Tailwind, masukkan warna yang sama ke `theme.extend.colors` dan gradient ke utility/class yang sesuai. Jangan membuat ulang sistem styling project.

---

# 4. Background seluruh halaman

Jangan mengubah tinggi, lebar, susunan, atau wrapper halaman.

Ganti background putih polos menjadi background hangat yang sangat lembut:

```css
body {
  color: var(--color-text);
  background:
    radial-gradient(
      circle at 8% 4%,
      rgba(238, 212, 203, 0.52),
      transparent 28rem
    ),
    radial-gradient(
      circle at 96% 18%,
      rgba(165, 130, 87, 0.11),
      transparent 25rem
    ),
    linear-gradient(
      180deg,
      #FFFDFC 0%,
      #F8F3EF 100%
    );
}
```

Untuk halaman yang sangat panjang, background harus tetap ringan dan tidak mengurangi keterbacaan.

Jangan menambahkan ilustrasi besar baru di belakang halaman.

---

# 5. Logo Pint-AR

Ganti logo lama menjadi versi palet hangat.

## Aturan warna logo

- Tulisan `Pint-` menggunakan `#44433E`.
- Tulisan `AR` menggunakan gradasi `#815F40` → `#A58257`.
- Wajah atas kubus menggunakan `#EED4CB`.
- Sisi kiri kubus menggunakan `#CEB8B0`.
- Sisi kanan kubus menggunakan `#A58257`.
- Scan corner menggunakan `#B1A495`.
- Orbit dan bentuk buku menggunakan `#815F40`.
- Background logo transparan.

## File logo yang disarankan

```text
/public/brand/pint-ar-logo.svg
/public/brand/pint-ar-mark.svg
/public/brand/pint-ar-favicon.svg
```

## Ketentuan implementasi

- Pertahankan ukuran logo navbar yang sudah ada.
- Jangan mengubah tinggi navbar.
- Jangan mengubah jarak tombol `Masuk`, `Daftar`, `Guru`, `Siswa`, atau `Keluar`.
- Logo harus tetap terbaca pada ukuran kecil.
- Jangan memakai efek glow neon.
- Gunakan SVG supaya tetap tajam.

---

# 6. Tipografi

Jangan mengganti font apabila perubahan font berpotensi mengubah layout.

Jika font sekarang sudah digunakan di seluruh website, pertahankan font tersebut.

Hanya ubah warnanya:

```css
h1,
h2,
h3,
h4,
h5,
h6 {
  color: var(--pintar-balsamic);
}

p,
.description,
.helper-text {
  color: var(--color-text-muted);
}
```

Teks penting boleh menggunakan aksen:

```css
.text-accent {
  color: var(--pintar-jute-brown);
}
```

Jangan menggunakan gradient pada paragraf panjang.

---

# 7. Navbar

Tanpa mengubah tinggi atau layout navbar:

```css
.navbar {
  background: rgba(255, 253, 252, 0.90);
  border-bottom-color: rgba(177, 164, 149, 0.34);
  color: var(--pintar-balsamic);
  backdrop-filter: blur(10px);
}

.navbar a {
  color: var(--pintar-balsamic);
}

.navbar a:hover,
.navbar a[aria-current="page"] {
  color: var(--pintar-jute-brown);
}
```

Role badge:

```css
.role-badge {
  color: var(--pintar-jute-brown);
  background: rgba(238, 212, 203, 0.58);
  border-color: rgba(206, 184, 176, 0.85);
}
```

---

# 8. Tombol

## Primary button

Gunakan untuk:

- Mulai Sekarang
- Masuk
- Daftar
- Lanjutkan
- Mulai
- Buka Penilaian
- Pantau & Nilai ketika ada tugas penting

```css
.button-primary {
  color: #FFFFFF;
  background: var(--gradient-primary-dark);
  border-color: transparent;
  box-shadow: var(--shadow-primary);
  transition:
    background 160ms ease,
    filter 160ms ease,
    box-shadow 160ms ease;
}

.button-primary:hover {
  filter: brightness(1.04);
}

.button-primary:active {
  filter: brightness(0.96);
}

.button-primary:focus-visible {
  outline: none;
  box-shadow:
    var(--focus-ring),
    var(--shadow-primary);
}
```

## Secondary button

```css
.button-secondary {
  color: var(--pintar-balsamic);
  background: rgba(255, 255, 255, 0.78);
  border-color: rgba(177, 164, 149, 0.58);
}

.button-secondary:hover {
  background: rgba(238, 212, 203, 0.34);
  border-color: rgba(129, 95, 64, 0.55);
}
```

## Aturan penting tombol

- Jangan mengubah tinggi tombol.
- Jangan mengubah lebar tombol.
- Jangan mengubah border radius.
- Jangan mengubah posisi ikon atau teks.
- Jangan menambahkan animasi gerak.
- Hanya gunakan transisi warna, border, shadow, dan brightness.

---

# 9. Kartu

Gunakan style berikut tanpa mengubah ukuran atau layout kartu:

```css
.card {
  color: var(--pintar-balsamic);
  background: var(--gradient-card);
  border-color: var(--color-border);
  box-shadow: var(--shadow-soft);
}

.card:hover {
  border-color: rgba(165, 130, 87, 0.48);
}
```

Kartu penting seperti `Lanjutkan Praktikum` dan `Perlu Perhatian`:

```css
.card-highlight {
  background:
    linear-gradient(
      135deg,
      rgba(238, 212, 203, 0.60),
      rgba(255, 255, 255, 0.92) 48%,
      rgba(165, 130, 87, 0.13)
    );
  border-color: rgba(165, 130, 87, 0.46);
  box-shadow: var(--shadow-card);
}
```

Jangan menambahkan thumbnail besar apabila kartu sebelumnya tidak memiliki ruang untuk thumbnail.

---

# 10. Form, login, dan register

Tanpa mengubah struktur form:

```css
input,
textarea,
select {
  color: var(--pintar-balsamic);
  background: rgba(255, 255, 255, 0.86);
  border-color: rgba(206, 184, 176, 0.78);
}

input::placeholder,
textarea::placeholder {
  color: var(--pintar-tranquil-taupe);
}

input:hover,
textarea:hover,
select:hover {
  border-color: rgba(165, 130, 87, 0.58);
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: var(--pintar-antique-gold);
  box-shadow: var(--focus-ring);
}
```

Role selector:

```css
.role-option {
  background: rgba(255, 255, 255, 0.78);
  border-color: rgba(177, 164, 149, 0.48);
}

.role-option[data-selected="true"],
.role-option[aria-checked="true"] {
  background:
    linear-gradient(
      135deg,
      rgba(238, 212, 203, 0.74),
      rgba(206, 184, 176, 0.34)
    );
  border-color: var(--pintar-jute-brown);
  box-shadow: 0 8px 20px rgba(129, 95, 64, 0.12);
}
```

---

# 11. Filter dan chip

## Filter aktif

```css
.filter-chip.active,
.filter-chip[aria-pressed="true"] {
  color: #FFFFFF;
  background: var(--gradient-primary-dark);
  border-color: transparent;
  box-shadow: 0 8px 18px rgba(129, 95, 64, 0.18);
}
```

## Filter tidak aktif

```css
.filter-chip {
  color: var(--color-text-muted);
  background: rgba(255, 255, 255, 0.70);
  border-color: rgba(177, 164, 149, 0.42);
}

.filter-chip:hover {
  color: var(--pintar-jute-brown);
  background: rgba(238, 212, 203, 0.32);
  border-color: rgba(165, 130, 87, 0.48);
}
```

## Tag metadata

Contoh: `Fisika`, `4 langkah`, `AR tersedia`, `LKS 0/5 soal`.

```css
.meta-chip {
  color: var(--pintar-balsamic);
  background: rgba(255, 255, 255, 0.72);
  border-color: rgba(177, 164, 149, 0.42);
}
```

---

# 12. Warna status

Semua warna status harus tetap berasal dari palet baru.

## Perlu dinilai

```css
.status-needs-review {
  color: #6F4D2F;
  background: rgba(165, 130, 87, 0.18);
  border-color: rgba(165, 130, 87, 0.40);
}
```

## Ada progres / sedang dikerjakan

```css
.status-progress {
  color: var(--pintar-jute-brown);
  background: rgba(238, 212, 203, 0.58);
  border-color: rgba(206, 184, 176, 0.78);
}
```

## Sudah dinilai / selesai

```css
.status-complete {
  color: var(--pintar-balsamic);
  background: rgba(177, 164, 149, 0.22);
  border-color: rgba(177, 164, 149, 0.54);
}
```

## Belum mulai

```css
.status-not-started {
  color: #756F68;
  background: rgba(255, 255, 255, 0.72);
  border-color: rgba(177, 164, 149, 0.46);
}
```

Jangan memakai warna hijau, biru, oranye, atau ungu di status.

---

# 13. Kartu statistik dashboard

Pertahankan grid 2 × 2 dan ukuran yang sudah ada.

Ubah hanya warna dan ikon:

```css
.stat-card {
  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.94),
      rgba(238, 212, 203, 0.20)
    );
  border-color: rgba(177, 164, 149, 0.38);
  box-shadow: var(--shadow-soft);
}

.stat-card .value {
  color: var(--pintar-balsamic);
}

.stat-card .label {
  color: var(--color-text-muted);
}
```

Warna badge ikon statistik:

```css
.stat-icon.total {
  color: var(--pintar-jute-brown);
  background: rgba(238, 212, 203, 0.62);
}

.stat-icon.pending {
  color: var(--pintar-antique-gold);
  background: rgba(165, 130, 87, 0.15);
}

.stat-icon.progress {
  color: var(--pintar-jute-brown);
  background: rgba(206, 184, 176, 0.38);
}

.stat-icon.complete {
  color: var(--pintar-balsamic);
  background: rgba(177, 164, 149, 0.24);
}
```

---

# 14. Ikon modul praktikum

Boleh menambahkan ikon kecil untuk setiap modul, tetapi **tidak boleh mengubah layout kartu**.

## Cara aman

Tambahkan ikon berukuran `20–24px` tepat sebelum judul modul, dalam baris judul yang sudah ada.

Contoh struktur:

```html
<h3 class="module-title">
  <span class="module-title-icon" aria-hidden="true"></span>
  <span>Gerak Jatuh Bebas</span>
</h3>
```

Style:

```css
.module-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.module-title-icon {
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  color: var(--pintar-jute-brown);
}
```

Apabila judul sekarang sudah memakai flex dengan status di kanan, pertahankan struktur flex yang ada dan sisipkan ikon hanya di dalam kelompok judul.

Jangan menambahkan kolom thumbnail baru.

## Style ikon

- Bentuk outline minimal.
- Stroke `1.75–2px`.
- Round linecap dan round linejoin.
- Maksimal dua warna.
- Tanpa efek 3D berat.
- Tanpa foto.
- Tanpa emoji.
- Tanpa ilustrasi berbeda style.

## Pemetaan ikon

| Modul | Konsep ikon |
|---|---|
| Gerak Jatuh Bebas | bola + panah ke bawah |
| Getaran Bandul Sederhana | bandul / pendulum |
| Hukum Archimedes | benda mengapung di permukaan air |
| Rangkaian Listrik Sederhana | baterai + kabel + lampu |
| Reaksi Kimia | lab flask + gelembung |
| Tata Surya (Kepler) | planet + orbit elips |
| Kalor / Perpindahan Panas | termometer + tiga gelombang panas |
| Gelombang | garis sinus / wave |
| Hukum Newton / Gaya | panah gaya pada sebuah benda |
| Modul default | kubus AR + scan corner |

## Warna ikon menurut kategori

```css
.module-icon.physics {
  color: var(--pintar-jute-brown);
  background: rgba(238, 212, 203, 0.58);
}

.module-icon.chemistry {
  color: var(--pintar-balsamic);
  background: rgba(206, 184, 176, 0.48);
}

.module-icon.astronomy {
  color: var(--pintar-antique-gold);
  background: rgba(177, 164, 149, 0.25);
}
```

Jika ikon diberi background badge, gunakan ukuran maksimal `32px × 32px` agar tidak menggeser layout.

---

# 15. Implementasi ikon di React/Next

Gunakan ini hanya apabila project memang menggunakan React/Next.

Jangan memasang dependency baru apabila project sudah memiliki library ikon.

Prioritas:

1. gunakan library ikon yang sudah ada;
2. jika memakai `lucide-react`, gunakan ikon yang tersedia;
3. jika tidak ada, buat SVG inline sederhana;
4. jangan menggunakan file PNG.

Contoh mapping:

```tsx
const moduleIconMap = {
  "gerak jatuh bebas": "CircleArrowDown",
  "getaran bandul sederhana": "Activity",
  "hukum archimedes": "Waves",
  "rangkaian listrik sederhana": "BatteryCharging",
  "reaksi kimia": "FlaskConical",
  "tata surya (kepler)": "Orbit",
  "kalor": "ThermometerSun",
  "gelombang": "AudioWaveform",
} as const;
```

Gunakan fallback icon `ScanLine` atau `Box`.

Jangan mengubah data modul hanya untuk menambahkan ikon. Buat mapping berdasarkan judul yang sudah ada.

---

# 16. Landing page

Jangan mengubah layout hero.

Ubah style menjadi:

- background hangat;
- label kecil memakai Fairy Pink;
- headline memakai Balsamic;
- kata atau frasa penting boleh memakai gradasi Jute Brown → Antique Gold;
- tombol utama memakai gradient primary dark;
- tombol sekunder memakai white/soft pink surface;
- teks kecil memakai Tranquil Taupe.

Contoh gradient text:

```css
.hero-accent {
  color: var(--pintar-jute-brown);
  background: linear-gradient(
    90deg,
    #815F40,
    #A58257
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

Gunakan gradient text hanya pada satu frasa pendek.

---

# 17. Alur praktikum

Pertahankan lima baris yang sudah ada.

Ganti warna ikon menjadi:

```css
.flow-step-icon {
  color: var(--pintar-jute-brown);
}

.flow-step {
  background: rgba(255, 255, 255, 0.72);
  border-color: rgba(177, 164, 149, 0.42);
}

.flow-step:hover {
  background: rgba(238, 212, 203, 0.28);
}
```

Tidak boleh mengubah nomor, ikon, teks, tinggi, atau jarak antarbaris.

---

# 18. Scrollbar dan selection

Opsional, hanya jika browser mendukung:

```css
::selection {
  color: var(--pintar-balsamic);
  background: rgba(238, 212, 203, 0.92);
}

* {
  scrollbar-color:
    rgba(129, 95, 64, 0.58)
    rgba(238, 212, 203, 0.28);
}
```

---

# 19. Hal yang dilarang

Cursor tidak boleh:

- memindahkan elemen;
- mengubah layout;
- mengubah grid;
- mengubah ukuran kartu;
- mengubah tinggi tombol;
- mengubah padding atau margin;
- mengganti seluruh font;
- menghapus konten;
- menambah section;
- membuat sidebar;
- menambah bottom navigation;
- menambah gambar besar;
- menambah video;
- menambah background ramai;
- menggunakan warna biru neon;
- menggunakan warna ungu neon;
- menggunakan warna cyan;
- menggunakan warna hijau terang;
- menggunakan warna oranye terang;
- menggunakan pure black `#000000`;
- menambah animasi floating;
- menambah transform scale yang membuat layout bergeser;
- mengubah route dan logika aplikasi.

---

# 20. Urutan pekerjaan Cursor

Lakukan perubahan dengan urutan berikut:

1. Audit semua warna hard-coded di project.
2. Temukan file global theme/style.
3. Tambahkan token palet Pint-AR.
4. Ganti warna global text, background, border, dan surface.
5. Ganti warna navbar dan logo.
6. Ganti warna tombol.
7. Ganti warna kartu.
8. Ganti warna input login/register.
9. Ganti filter dan chip.
10. Ganti status.
11. Ganti statistik dashboard.
12. Tambahkan ikon kecil modul tanpa mengubah layout.
13. Pastikan tidak ada warna lama yang tertinggal.
14. Jalankan lint, type-check, test, dan build yang tersedia.
15. Periksa ulang tampilan mobile.

---

# 21. Acceptance criteria

Pekerjaan dianggap selesai apabila:

- layout sebelum dan sesudah tetap sama;
- jumlah section tetap sama;
- urutan komponen tetap sama;
- mobile tidak mengalami horizontal overflow;
- seluruh halaman memakai palet hangat yang konsisten;
- tombol utama memakai satu sistem gradient;
- tidak ada warna neon lama;
- teks tetap mudah dibaca;
- logo Pint-AR sudah memakai palette baru;
- ikon modul konsisten;
- ikon tidak menggeser kartu;
- status dapat dibedakan tanpa memakai warna di luar palet;
- focus state keyboard tetap terlihat;
- build project berhasil;
- tidak ada perubahan fitur atau logika.

---

# 22. Prompt singkat siap tempel ke Cursor

```text
Terapkan redesign warna Pint-AR berdasarkan file design.md.

ATURAN MUTLAK:
JANGAN UBAH LAYOUT, struktur, ukuran, spacing, urutan komponen, responsive breakpoint, teks, route, data, atau fungsi apa pun.

Yang boleh diubah hanya warna, gradient, background, border, shadow, focus state, logo, dan ikon kecil modul.

Gunakan palet:
#EED4CB
#CEB8B0
#B1A495
#A58257
#815F40
#44433E

Gunakan #44433E untuk teks utama, #815F40 sebagai primary, #A58257 sebagai accent, dan campuran #EED4CB / #CEB8B0 / #B1A495 untuk surface, border, chip, dan background lembut.

Ganti seluruh warna biru, ungu, cyan, hijau, oranye, serta hitam pekat dengan sistem warna di design.md.

Primary gradient:
linear-gradient(135deg, #44433E 0%, #815F40 62%, #A58257 100%)

Soft gradient:
linear-gradient(135deg, rgba(238,212,203,.88), rgba(206,184,176,.62), rgba(177,164,149,.32))

Logo:
Pint- = #44433E
AR = gradient #815F40 ke #A58257
Cube = #EED4CB, #CEB8B0, #A58257
Scan frame = #B1A495
Orbit/book = #815F40

Tambahkan ikon outline kecil 20–24px sebelum judul setiap modul tanpa membuat kolom baru dan tanpa mengubah tinggi card. Gunakan mapping judul modul di design.md.

Pertahankan teknologi styling yang sekarang. Jangan memasang library baru apabila tidak diperlukan. Setelah selesai, jalankan lint, type-check, test, dan build project.
```

---

# 23. Ringkasan visual

Arah visual akhir:

- hangat;
- akademik;
- bersih;
- modern;
- tenang;
- premium;
- tetap berhubungan dengan sains dan AR;
- tidak terlihat seperti aplikasi game;
- tidak terlihat terlalu ramai;
- tidak mengorbankan keterbacaan;
- layout asli tetap dipertahankan.
