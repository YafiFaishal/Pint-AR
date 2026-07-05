# Onboarding Interaktif

Panduan singkat pertama kali membuka aplikasi agar siswa langsung paham cara memulai AR.

## Spesifikasi

### Tujuan
Memperkenalkan cara kerja AR kepada siswa baru secara visual dan langsung agar mereka percaya diri memulai praktikum pertama.

### Selesai bila
- Tur visual muncul otomatis saat akun baru (siswa) pertama kali login ke aplikasi.
- Setiap langkah tur menampilkan ilustrasi animasi dan teks singkat yang menjelaskan satu aksi penting (arahkan kamera, deteksi meja, munculkan alat).
- Navigasi langkah tur bisa dilakukan dengan tombol “Lanjut” dan “Kembali”.
- Terdapat tombol “Lewati Tur” di setiap langkah yang langsung mengakhiri tur dan membawa siswa ke halaman daftar modul.
- Tombol “Coba Sekarang” muncul di akhir tur dan ketika tur dilewati, mengarahkan siswa langsung ke modul AR pertama yang tersedia.

## Sub-fitur: Tur Visual

Beberapa langkah animasi yang menunjukkan cara mengarahkan kamera dan memunculkan alat.

### Tujuan
Menampilkan urutan langkah animasi yang memandu siswa memahami cara dasar mengoperasikan kamera dan memunculkan alat 3D di meja.

### Selesai bila
- Terdapat minimal 3 langkah animasi yang masing-masing menampilkan visual gerakan (misalnya menggerakkan HP, mengarahkan ke meja polos) disertai teks penjelasan.
- Terdapat indikator progres (misalnya titik/langkah 1 dari 3) agar siswa tahu posisi mereka dalam tur.
- Terdapat tombol navigasi yang responsif: “Lanjut” untuk maju, “Kembali” untuk mundur, dan “Lewati Tur” untuk keluar dari tur kapan saja.

## Sub-fitur: Coba Langsung

Tombol untuk langsung masuk ke modul AR setelah atau tanpa tur.

### Tujuan
Menyediakan jalan pintas agar siswa bisa melewati tur dan langsung mencoba modul AR, atau masuk ke modul setelah menyelesaikan tur.

### Selesai bila
- Tombol “Coba Sekarang” terlihat jelas di layar langkah terakhir tur, dan ketika ditekan membawa siswa ke tampilan modul AR.
- Tombol “Lewati Tur” yang ada di setiap langkah tur berfungsi langsung mengakhiri tur dan menampilkan tombol “Coba Sekarang” di halaman yang sama.
- Setelah tombol “Coba Sekarang” ditekan (baik dari akhir tur maupun dari lompatan lewati), aplikasi membuka modul AR pertama yang tersedia dan siap meminta izin kamera.

## Task

### 1. Buat halaman onboarding dengan kerangka langkah dan data tiruan

### 2. Bangun animasi untuk setiap langkah tur minimal 3 langkah

### 3. Terapkan indikator progres dan navigasi Lanjut/Kembali antar langkah

### 4. Implementasikan tombol Lewati Tur di semua langkah dan transisi ke layar akhir

### 5. Buat layar akhir tur dengan tombol Coba Sekarang yang mengarah ke modul AR pertama (data tiruan)

### 6. Buat endpoint API untuk menyimpan dan mengambil status onboarding pengguna

### 7. Tambahkan logika pengecekan status onboarding saat login untuk memicu tur hanya bagi pengguna baru
