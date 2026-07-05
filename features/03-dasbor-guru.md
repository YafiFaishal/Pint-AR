# Dasbor Guru

Panel bagi guru untuk memantau progres praktikum dan nilai LKS siswa.

## Spesifikasi

### Tujuan
Memudahkan guru memantau perkembangan praktikum siswa dan memberikan penilaian LKS dalam satu tempat terpusat.
### Selesai bila
- Guru bisa melihat daftar siswa beserta status praktikum mereka (sedang berlangsung atau sudah selesai).
- Guru bisa membuka, memeriksa, dan memberikan skor untuk setiap LKS siswa secara individual.
- Guru bisa melihat ringkasan nilai seluruh siswa dalam satu modul praktikum tertentu.

## Sub-fitur: Daftar Siswa Aktif

Melihat siswa mana yang sedang atau sudah menyelesaikan praktikum.

### Tujuan
Menampilkan daftar siswa yang terdaftar dalam modul praktikum tertentu beserta status penyelesaian LKS mereka.
### Selesai bila
- Guru dapat memilih modul praktikum dan melihat daftar nama siswa yang ditugaskan.
- Setiap siswa menampilkan label status: "Sedang Praktikum" atau "Selesai".
- Guru dapat mengklik nama siswa untuk langsung menuju halaman Pemeriksaan LKS milik siswa tersebut.

## Sub-fitur: Periksa LKS

Membuka dan menilai lembar kerja siswa satu per satu.

### Tujuan
Memungkinkan guru membaca jawaban LKS siswa dan memberikan penilaian berupa skor.
### Selesai bila
- Guru dapat melihat seluruh pertanyaan dan jawaban yang telah diisi oleh siswa dalam satu tampilan.
- Terdapat kolom input angka untuk memberikan skor pada setiap jawaban siswa.
- Setelah skor diberikan, guru dapat menekan tombol "Simpan Nilai" dan langsung melihat skor tersimpan tanpa pesan error.

## Sub-fitur: Rekap Nilai

Melihat ringkasan pencapaian seluruh siswa dalam satu modul.

### Tujuan
Memberikan ringkasan perolehan skor seluruh siswa dalam satu modul praktikum untuk memantau capaian kelas.
### Selesai bila
- Guru dapat memilih modul praktikum dan melihat tabel berisi nama siswa dan total skor yang telah diberikan.
- Tabel menampilkan status penilaian: "Sudah Dinilai" atau "Belum Dinilai" untuk setiap siswa.
- Guru dapat melihat rata-rata skor kelas untuk modul tersebut, ditampilkan dalam format angka desimal satu digit di belakang koma (contoh: 78.5).

## Task

### 1. Buat halaman utama Dasbor Guru dengan navigasi dan data dummy

### 2. Buat komponen Daftar Siswa Aktif dengan status dan data dummy

### 3. Buat komponen Periksa LKS per siswa dengan input skor dan data dummy

### 4. Buat komponen Rekap Nilai modul dengan tabel dan rata-rata data dummy

### 5. Buat migrasi dan model database untuk modul, siswa, LKS, dan nilai

### 6. Buat API endpoint untuk daftar siswa aktif per modul

### 7. Buat API endpoint untuk mengambil dan menyimpan skor LKS per siswa

### 8. Buat API endpoint rekap nilai modul lengkap dengan rata-rata kelas
