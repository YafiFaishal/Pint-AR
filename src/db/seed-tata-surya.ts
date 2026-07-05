/**
 * Memperbarui panduan & LKS modul Tata Surya (Kepler) di database yang sudah ada.
 * Idempoten — aman dijalankan berulang.
 *
 * Jalankan: npm run db:seed-tata-surya
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { modul, langkahPraktikum, lksTemplate } from "./schema";

const JUDUL_MODUL = "Tata Surya (Kepler)";

const LANGKAH = [
  {
    urutan: 1,
    judul: "Amati Orbit Planet",
    instruksi:
      "Amati planet-planet yang mengorbit Matahari. Perhatikan bentuk lintasan dan arah gerak setiap planet.",
  },
  {
    urutan: 2,
    judul: "Ubah Jarak Orbit",
    instruksi:
      "Pilih satu planet, lalu geser slider jarak orbit (r). Perhatikan bagaimana lintasannya melebar atau menyempit.",
  },
  {
    urutan: 3,
    judul: "Amati Perubahan Periode",
    instruksi:
      "Baca nilai periode orbit relatif (T). Bandingkan: semakin jauh jarak orbit, semakin besar periode revolusi (T = √r³).",
  },
  {
    urutan: 4,
    judul: "Catat Kesimpulan",
    instruksi:
      "Isi LKS berdasarkan pengamatanmu tentang hubungan jarak orbit dan periode revolusi planet.",
  },
] as const;

const LKS = [
  {
    urutan: 1,
    pertanyaan:
      "Apa yang terjadi pada periode orbit ketika jarak planet dari Matahari diperbesar?",
  },
  {
    urutan: 2,
    pertanyaan: "Planet yang lebih jauh bergerak lebih cepat atau lebih lambat?",
  },
  {
    urutan: 3,
    pertanyaan:
      "Jelaskan hubungan jarak orbit dan periode revolusi berdasarkan pengamatanmu.",
  },
  {
    urutan: 4,
    pertanyaan: "Apa kesimpulanmu tentang Hukum Kepler?",
  },
] as const;

async function main() {
  const [m] = await db
    .select({ id: modul.id })
    .from(modul)
    .where(eq(modul.judul, JUDUL_MODUL))
    .limit(1);

  if (!m) {
    console.error(`❌ Modul "${JUDUL_MODUL}" tidak ditemukan. Jalankan db:seed-modules dulu.`);
    process.exit(1);
  }

  await db.delete(langkahPraktikum).where(eq(langkahPraktikum.modulId, m.id));
  await db.delete(lksTemplate).where(eq(lksTemplate.modulId, m.id));

  await db.insert(langkahPraktikum).values(
    LANGKAH.map((l) => ({
      id: randomUUID(),
      modulId: m.id,
      ...l,
    })),
  );

  await db.insert(lksTemplate).values(
    LKS.map((l) => ({
      id: randomUUID(),
      modulId: m.id,
      ...l,
    })),
  );

  console.log(`✅ Panduan (${LANGKAH.length} langkah) & LKS (${LKS.length} soal) diperbarui.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Gagal:", err);
    process.exit(1);
  });
