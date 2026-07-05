# LKS Digital

Menyediakan lembar kerja digital yang bisa diisi siswa langsung saat praktikum AR berjalan.

## Spesifikasi

### Tujuan
Memungkinkan siswa mencatat data pengamatan praktikum langsung di layar yang sama saat praktikum AR berlangsung, tanpa perlu berpindah aplikasi atau menulis di kertas.
### Selesai bila
- Siswa dapat melihat daftar pertanyaan atau tabel pengamatan di panel LKS saat modul AR aktif.
- Siswa dapat mengetik atau mengisi jawaban pada setiap pertanyaan.
- Jawaban siswa tersimpan secara otomatis meskipun koneksi terputus sementara.
- Siswa dapat melihat nilai yang diberikan guru setelah LKS diperiksa.

## Sub-fitur: Isi Data Pengamatan

Formulir di layar yang sama untuk mencatat hasil pengamatan praktikum.

### Tujuan
Memberikan formulir interaktif di samping tampilan AR agar siswa dapat langsung mengisi hasil pengamatan praktikum tanpa meninggalkan layar praktikum.
### Selesai bila
- Panel LKS menampilkan pertanyaan sesuai modul yang sedang dijalankan.
- Siswa dapat mengetik jawaban teks pada setiap kolom pertanyaan.
- Kolom jawaban terlihat jelas dan mudah dijangkau, tidak menutupi area AR secara penuh.

## Sub-fitur: Simpan Otomatis

Menyimpan jawaban siswa secara berkala agar tidak hilang.

### Tujuan
Mencegah kehilangan data jawaban siswa akibat koneksi internet tidak stabil atau browser tertutup tiba-tiba dengan menyimpan progres secara berkala.
### Selesai bila
- Jawaban siswa tersimpan secara otomatis setiap beberapa detik atau saat siswa berhenti mengetik.
- Terdapat indikator kecil yang menunjukkan status penyimpanan (mis. "Tersimpan") tanpa mengganggu praktikum.
- Siswa dapat melanjutkan mengisi LKS dari titik terakhir saat membuka kembali modul yang sama.

## Sub-fitur: Lihat Nilai

Menampilkan hasil penilaian dari guru setelah LKS diperiksa.

### Tujuan
Menampilkan hasil penilaian guru kepada siswa setelah LKS diperiksa, sehingga siswa dapat mengetahui pencapaian dan umpan balik.
### Selesai bila
- Siswa dapat melihat nilai (skor) untuk setiap pertanyaan atau total di halaman LKS.
- Nilai hanya muncul setelah guru selesai memeriksa dan memberi skor.
- Tampilan nilai jelas, misalnya berupa angka atau bintang, tanpa perlu membuka halaman terpisah.

## Task

### 1. Buat panel LKS interaktif dengan daftar pertanyaan & input jawaban (data tiruan)

### 2. Implementasi penyimpanan otomatis lokal & indikator status 'Tersimpan'

### 3. Tampilkan skor nilai per pertanyaan & total di panel LKS (data tiruan)

### 4. Buat skema database LKS: tabel modul, pertanyaan, jawaban, nilai

### 5. Buat API GET /lks/{moduleId} untuk mengambil daftar pertanyaan

### 6. Buat API GET dan POST /lks/answers untuk menyimpan dan mengambil jawaban siswa

### 7. Buat API GET /lks/grades/{moduleId} untuk menampilkan nilai LKS siswa
