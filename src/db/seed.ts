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
  ]);

  console.log("✅ Selesai menyemai data.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Gagal seed:", err);
    process.exit(1);
  });
