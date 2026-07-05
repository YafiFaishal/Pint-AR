# Autentikasi

Sistem login sederhana untuk membedakan akses Siswa dan Guru.

## Spesifikasi

### Tujuan
Memberikan akses masuk yang aman ke aplikasi berdasarkan peran (Siswa atau Guru) agar setiap pengguna hanya melihat menu dan data sesuai haknya.
### Selesai bila
- Pengguna pertama kali melihat halaman login yang bersih dan tidak membingungkan.
- Hanya pengguna dengan email dan kata sandi valid yang bisa masuk ke halaman utama.
- Setelah dikenali, aplikasi langsung menampilkan tampilan khusus yang berbeda: area praktikum untuk Siswa, dasbor pemantauan untuk Guru.
- Kesalahan pengisian email atau kata sandi menampilkan pesan yang jelas dan membantu, bukan pesan teknis.

## Sub-fitur: Daftar Akun

Membuat akun baru dengan memilih peran sebagai Siswa atau Guru.

### Tujuan
Memungkinkan calon pengguna membuat akun pribadi baru dengan memilih identitas apakah dirinya seorang Siswa atau Guru.
### Selesai bila
- Formulir pendaftaran hanya meminta tiga hal: Nama Lengkap, Email, dan Kata Sandi.
- Terdapat pilihan peran 'Siswa' atau 'Guru' yang mudah diklik dengan penjelasan singkat di bawahnya (misalnya: "Saya akan mengikuti praktikum" atau "Saya akan memantau kelas").
- Setelah berhasil mendaftar, pengguna langsung diarahkan ke halaman masuk tanpa perlu konfirmasi email.

## Sub-fitur: Masuk & Keluar

Login dan logout untuk mengamankan data praktikum dan LKS.

### Tujuan
Memberikan jalan bagi pengguna terdaftar untuk mengamankan sesi mereka (masuk) dan mengakhirinya saat selesai menggunakan aplikasi (keluar).
### Selesai bila
- Setelah mengisi email dan kata sandi yang benar, pengguna langsung masuk ke halaman beranda sesuai perannya.
- Kegagalan login menampilkan pesan yang spesifik namun aman (contoh: "Kata sandi tidak sesuai" atau "Email belum terdaftar").
- Tombol atau menu 'Keluar' mudah ditemukan, dan setelah diklik, pengguna benar-benar keluar dari sesinya sehingga data pribadi tidak bisa diakses orang lain yang memakai HP yang sama.

## Task

### 1. Buat halaman login dan layout beranda awal dengan data tiruan

### 2. Buat halaman pendaftaran akun dengan data tiruan

### 3. Lengkapi halaman beranda siswa dengan data tiruan

### 4. Lengkapi halaman beranda guru dengan data tiruan

### 5. Implementasi tombol logout dan navigasi

### 6. Buat skema database untuk tabel pengguna

### 7. Buat endpoint registrasi pengguna

### 8. Buat endpoint login dan autentikasi

### 9. Buat endpoint logout

### 10. Implementasi middleware otentikasi untuk route yang dilindungi
