import "dotenv/config";
import { randomUUID } from "node:crypto";
import { db } from "./index";
import { modul, langkahPraktikum, lksTemplate } from "./schema";

/**
 * Seed data awal PintAR.
 * Model 3D memakai aset contoh resmi dari model-viewer.
 * Ganti `modelGlbUrl` / `modelUsdzUrl` dengan file GLB/USDZ milik Anda saat sudah tersedia.
 */
async function seed() {
  console.log("🌱 Menyemai data awal...");

  const modulNewtonId = randomUUID();
  const modulRangkaId = randomUUID();
  const modulTataSuryaId = randomUUID();
  const modulJatuhBebasId = randomUUID();
  const modulReaksiKimiaId = randomUUID();
  const modulArchimedesId = randomUUID();
  const modulCahayaOptikId = randomUUID();
  const modulBandulId = randomUUID();
  const modulHookeId = randomUUID();
  const modulThermalId = randomUUID();

  await db.insert(modul).values([
    {
      id: modulNewtonId,
      judul: "Hukum Newton: Gaya & Gerak",
      // TODO: ganti dengan aset milik pengguna
      modelGlbUrl:
        "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
      modelUsdzUrl:
        "https://modelviewer.dev/shared-assets/models/Astronaut.usdz",
      deskripsi:
        "Amati bagaimana gaya memengaruhi gerak benda melalui simulasi alat peraga 3D.",
    },
    {
      id: modulRangkaId,
      judul: "Rangkaian Listrik Sederhana",
      modelGlbUrl:
        "https://modelviewer.dev/shared-assets/models/NeilArmstrong.glb",
      modelUsdzUrl:
        "https://modelviewer.dev/shared-assets/models/NeilArmstrong.usdz",
      deskripsi:
        "Rangkai baterai, kabel, dan lampu untuk memahami arus listrik pada rangkaian tertutup.",
    },
    {
      id: modulTataSuryaId,
      judul: "Tata Surya (Kepler)",
      modelGlbUrl: null,
      modelUsdzUrl: null,
      deskripsi:
        "Eksplorasi orbit planet-planet dengan simulasi fisika Hukum Kepler interaktif.",
    },
    {
      id: modulJatuhBebasId,
      judul: "Gerak Jatuh Bebas",
      modelGlbUrl: null,
      modelUsdzUrl: null,
      deskripsi:
        "Buktikan percepatan gravitasi bumi dan bandingkan jatuh di ruang udara vs hampa.",
    },
    {
      id: modulReaksiKimiaId,
      judul: "Reaksi Kimia",
      modelGlbUrl: null,
      modelUsdzUrl: null,
      deskripsi:
        "Campurkan bahan kimia untuk mengamati perubahan suhu, pH, dan warna.",
    },
    {
      id: modulArchimedesId,
      judul: "Hukum Archimedes",
      modelGlbUrl: null,
      modelUsdzUrl: null,
      deskripsi:
        "Uji pengaruh massa, volume, dan jenis cairan terhadap kondisi terapung, melayang, atau tenggelam.",
    },
    {
      id: modulCahayaOptikId,
      judul: "Pemantulan dan Pembiasan Cahaya",
      modelGlbUrl: null,
      modelUsdzUrl: null,
      deskripsi:
        "Amati arah cahaya saat dipantulkan dan dibiaskan pada medium yang berbeda.",
    },
    {
      id: modulBandulId,
      judul: "Getaran Bandul Sederhana",
      modelGlbUrl: null,
      modelUsdzUrl: null,
      deskripsi:
        "Amati pengaruh panjang tali, gravitasi, dan massa terhadap periode ayunan bandul.",
    },
    {
      id: modulHookeId,
      judul: "Hukum Hooke dan Elastisitas Pegas",
      modelGlbUrl: null,
      modelUsdzUrl: null,
      deskripsi:
        "Amati hubungan gaya, pertambahan panjang, konstanta pegas, dan getaran massa–pegas.",
    },
    {
      id: modulThermalId,
      judul: "Kalor dan Perubahan Suhu",
      modelGlbUrl: null,
      modelUsdzUrl: null,
      deskripsi:
        "Amati pengaruh massa, kalor jenis, dan energi pemanas terhadap perubahan suhu suatu zat.",
    },
  ]);

  await db.insert(langkahPraktikum).values([
    {
      id: randomUUID(),
      modulId: modulNewtonId,
      urutan: 1,
      judul: "Arahkan Kamera ke Meja",
      instruksi:
        "Arahkan kamera HP ke permukaan meja yang datar hingga alat muncul.",
    },
    {
      id: randomUUID(),
      modulId: modulNewtonId,
      urutan: 2,
      judul: "Amati Posisi Awal",
      instruksi: "Perhatikan posisi benda sebelum diberi gaya. Catat kondisinya.",
    },
    {
      id: randomUUID(),
      modulId: modulNewtonId,
      urutan: 3,
      judul: "Berikan Gaya",
      instruksi:
        "Sentuh benda untuk memberi dorongan, lalu amati perubahan gerakannya.",
    },
    {
      id: randomUUID(),
      modulId: modulRangkaId,
      urutan: 1,
      judul: "Amati Komponen Rangkaian",
      instruksi:
        "Perhatikan komponen utama seperti baterai, kabel, saklar, dan lampu. Putar model 3D untuk melihat posisi setiap bagian.",
    },
    {
      id: randomUUID(),
      modulId: modulRangkaId,
      urutan: 2,
      judul: "Pahami Rangkaian Terbuka",
      instruksi:
        "Saat saklar terbuka, jalur listrik terputus sehingga arus tidak dapat mengalir dan lampu tidak menyala.",
    },
    {
      id: randomUUID(),
      modulId: modulRangkaId,
      urutan: 3,
      judul: "Pahami Rangkaian Tertutup",
      instruksi:
        "Saat saklar tertutup, jalur listrik tersambung sehingga arus dapat mengalir dari baterai melalui kabel dan lampu menyala.",
    },
    {
      id: randomUUID(),
      modulId: modulRangkaId,
      urutan: 4,
      judul: "Catat Hasil Pengamatan",
      instruksi:
        "Isi LKS berdasarkan pengamatanmu. Jelaskan mengapa lampu hanya menyala saat rangkaian tertutup.",
    },
    {
      id: randomUUID(),
      modulId: modulTataSuryaId,
      urutan: 1,
      judul: "Amati Orbit Planet",
      instruksi:
        "Amati planet-planet yang mengorbit Matahari. Perhatikan bentuk lintasan dan arah gerak setiap planet.",
    },
    {
      id: randomUUID(),
      modulId: modulTataSuryaId,
      urutan: 2,
      judul: "Ubah Jarak Orbit",
      instruksi:
        "Pilih satu planet, lalu geser slider jarak orbit (r). Perhatikan bagaimana lintasannya melebar atau menyempit.",
    },
    {
      id: randomUUID(),
      modulId: modulTataSuryaId,
      urutan: 3,
      judul: "Amati Perubahan Periode",
      instruksi:
        "Baca nilai periode orbit relatif (T). Bandingkan: semakin jauh jarak orbit, semakin besar periode revolusi (T = √r³).",
    },
    {
      id: randomUUID(),
      modulId: modulTataSuryaId,
      urutan: 4,
      judul: "Catat Kesimpulan",
      instruksi:
        "Isi LKS berdasarkan pengamatanmu tentang hubungan jarak orbit dan periode revolusi planet.",
    },
    {
      id: randomUUID(),
      modulId: modulJatuhBebasId,
      urutan: 1,
      judul: "Simulasi Sedang Disiapkan",
      instruksi:
        "Simulasi gerak jatuh bebas di udara dan ruang hampa sedang dikembangkan. Pantau pembaruan berikutnya.",
    },
    {
      id: randomUUID(),
      modulId: modulReaksiKimiaId,
      urutan: 1,
      judul: "Simulasi Sedang Disiapkan",
      instruksi:
        "Simulasi pencampuran bahan kimia sedang dikembangkan. Pantau pembaruan berikutnya.",
    },
    {
      id: randomUUID(),
      modulId: modulArchimedesId,
      urutan: 1,
      judul: "Simulasi Sedang Disiapkan",
      instruksi:
        "Simulasi Hukum Archimedes sedang dikembangkan. Pantau pembaruan berikutnya.",
    },
    {
      id: randomUUID(),
      modulId: modulCahayaOptikId,
      urutan: 1,
      judul: "Simulasi Sedang Disiapkan",
      instruksi:
        "Simulasi pemantulan dan pembiasan cahaya sedang dikembangkan. Pantau pembaruan berikutnya.",
    },
    {
      id: randomUUID(),
      modulId: modulBandulId,
      urutan: 1,
      judul: "Simulasi Sedang Disiapkan",
      instruksi:
        "Simulasi getaran bandul sederhana sedang dikembangkan. Pantau pembaruan berikutnya.",
    },
    {
      id: randomUUID(),
      modulId: modulHookeId,
      urutan: 1,
      judul: "Simulasi Sedang Disiapkan",
      instruksi:
        "Simulasi Hukum Hooke dan elastisitas pegas sedang dikembangkan. Pantau pembaruan berikutnya.",
    },
    {
      id: randomUUID(),
      modulId: modulThermalId,
      urutan: 1,
      judul: "Simulasi Sedang Disiapkan",
      instruksi:
        "Simulasi kalor dan perubahan suhu sedang dikembangkan. Pantau pembaruan berikutnya.",
    },
  ]);

  await db.insert(lksTemplate).values([
    {
      id: randomUUID(),
      modulId: modulNewtonId,
      urutan: 1,
      pertanyaan: "Apa yang terjadi pada benda saat diberi gaya dorong?",
    },
    {
      id: randomUUID(),
      modulId: modulNewtonId,
      urutan: 2,
      pertanyaan:
        "Jelaskan hubungan antara besar gaya dengan percepatan benda.",
    },
    {
      id: randomUUID(),
      modulId: modulRangkaId,
      urutan: 1,
      pertanyaan: "Apakah lampu menyala saat rangkaian terhubung? Mengapa?",
    },
    {
      id: randomUUID(),
      modulId: modulRangkaId,
      urutan: 2,
      pertanyaan: "Apa yang terjadi jika saklar terbuka?",
    },
    {
      id: randomUUID(),
      modulId: modulRangkaId,
      urutan: 3,
      pertanyaan:
        "Mengapa arus listrik hanya dapat mengalir pada rangkaian tertutup?",
    },
    {
      id: randomUUID(),
      modulId: modulRangkaId,
      urutan: 4,
      pertanyaan:
        "Menurutmu, apa fungsi baterai dalam rangkaian listrik sederhana?",
    },
    {
      id: randomUUID(),
      modulId: modulTataSuryaId,
      urutan: 1,
      pertanyaan:
        "Apa yang terjadi pada periode orbit ketika jarak planet dari Matahari diperbesar?",
    },
    {
      id: randomUUID(),
      modulId: modulTataSuryaId,
      urutan: 2,
      pertanyaan: "Planet yang lebih jauh bergerak lebih cepat atau lebih lambat?",
    },
    {
      id: randomUUID(),
      modulId: modulTataSuryaId,
      urutan: 3,
      pertanyaan:
        "Jelaskan hubungan jarak orbit dan periode revolusi berdasarkan pengamatanmu.",
    },
    {
      id: randomUUID(),
      modulId: modulTataSuryaId,
      urutan: 4,
      pertanyaan: "Apa kesimpulanmu tentang Hukum Kepler?",
    },
  ]);

  console.log("✅ Selesai menyemai data.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Gagal seed:", err);
    process.exit(1);
  });
