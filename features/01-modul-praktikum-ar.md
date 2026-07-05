# Modul Praktikum AR

Menampilkan alat lab 3D di meja pengguna dan memandu langkah percobaan secara interaktif.

## Spesifikasi

### Tujuan
Menyediakan pengalaman praktikum sains virtual interaktif yang memungkinkan siswa melihat, menyentuh, dan mengoperasikan alat lab 3D seolah-olah nyata di meja mereka, sambil dipandu langkah percobaan yang jelas.

### Selesai bila
- Model alat lab 3D muncul secara stabil dan akurat di atas permukaan meja melalui kamera HP.
- Siswa dapat memutar, memperbesar/memperkecil, dan menggerakkan objek 3D dengan sentuhan jari.
- Instruksi langkah demi langkah muncul dalam bentuk teks dan/atau animasi di layar selama praktikum.
- Sistem otomatis memilih cara menampilkan 3D terbaik (AR atau 3D biasa) sesuai perangkat dan kondisi, tanpa perlu diatur manual oleh siswa.
- Siswa bisa menyelesaikan seluruh rangkaian praktikum tanpa keluar dari tampilan AR.

## Sub-fitur: Proyeksi Alat 3D

Memunculkan model alat lab virtual di permukaan meja melalui kamera HP.

### Tujuan
Memungkinkan siswa melihat alat lab virtual seperti nyata di meja mereka melalui layar HP, menciptakan momen "Aha!" saat objek 3D pertama kali muncul.

### Selesai bila
- Tombol "Mulai AR" atau "Lihat di Meja" tersedia dan merespons saat ditekan.
- Kamera HP terbuka dan pemandu awal (misalnya "Arahkan kamera ke meja") muncul.
- Model 3D alat lab muncul di layar dan seolah menempel pada permukaan meja yang terdeteksi.
- Saat AR tidak dapat berjalan, tampilan 3D 360° alternatif muncul secara otomatis untuk menggantikannya.

## Sub-fitur: Panduan Langkah

Menampilkan instruksi visual tahap demi tahap selama praktikum berlangsung.

### Tujuan
Memberikan petunjuk yang jelas dan terstruktur agar siswa tahu persis apa yang harus dilakukan di setiap tahap praktikum, mengurangi kebingungan.

### Selesai bila
- Panel atau area di layar menampilkan teks petunjuk langkah saat ini (misalnya "Langkah 1: Arahkan kamera ke meja").
- Terdapat tombol untuk maju ke langkah berikutnya atau mundur ke langkah sebelumnya.
- Indikator progres langkah (misalnya "Langkah 2 dari 5") terlihat jelas oleh siswa.
- Petunjuk berubah secara otomatis atau setelah konfirmasi siswa ketika suatu langkah dianggap selesai.

## Sub-fitur: Interaksi Objek

Memungkinkan siswa menyentuh atau menggerakkan alat 3D untuk simulasi penggunaan.

### Tujuan
Memberi siswa kendali langsung atas alat lab virtual sehingga mereka bisa mengeksplorasi bentuk, bagian, dan mekanisme alat seakan-akan memegangnya sendiri.

### Selesai bila
- Model 3D bisa diputar 360° dengan cara menggeser (swipe) satu jari di layar.
- Model 3D bisa diperbesar atau diperkecil dengan cara mencubit (pinch) dua jari di layar.
- Bagian tertentu pada alat (jika ada) bisa ditekan atau disentuh untuk menjalankan simulasi gerakan (misalnya menekan tombol atau menggeser bagian alat).
- Setiap interaksi memberikan respons visual langsung (misalnya bagian yang disentuh berubah warna atau bergerak).

## Sub-fitur: Deteksi Otomatis

Mengenali perangkat pengguna dan memilih teknologi AR yang paling ringan.

### Tujuan
Memastikan semua siswa dapat mengikut praktikum tanpa kesulitan teknis, karena sistem otomatis menyesuaikan cara menampilkan alat 3D sesuai kemampuan HP masing-masing.

### Selesai bila
- Siswa tidak perlu memilih sendiri pengaturan AR di aplikasi.
- Perangkat Android dengan dukungan WebXR otomatis menggunakan tampilan AR meja.
- Perangkat iOS otomatis menggunakan AR Quick Look saat tombol AR ditekan.
- Jika kamera atau sensor tidak memadai, sistem otomatis beralih ke mode 3D interaktif 360° tanpa mengganggu alur praktikum.

## Task

### 1. Buat layout utama halaman AR dengan data mock

### 2. Implementasi deteksi perangkat dan pemilihan mode AR otomatis

### 3. Buat komponen proyeksi objek 3D dengan Three.js/A-Frame

### 4. Implementasi kontrol interaksi objek 3D sentuhan jari

### 5. Buat panel panduan langkah praktikum interaktif

### 6. Buat komponen indikator progres dan navigasi langkah

### 7. Integrasikan AR Quick Look untuk iOS dalam deteksi mode

### 8. Implementasi fallback mode 3D 360° saat AR tidak tersedia

### 9. Tambahkan animasi dan efek visual respons interaksi objek

### 10. Optimasi performa rendering 3D untuk perangkat menengah

### 11. Buat migrasi tabel modul dan langkah praktikum

### 12. Buat endpoint API data langkah praktikum
