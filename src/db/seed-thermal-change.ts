/**
 * Memperbarui panduan & LKS modul Kalor dan Perubahan Suhu.
 * Idempoten — aman dijalankan berulang.
 *
 * Jalankan: npm run db:seed-thermal-change
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { modul, langkahPraktikum, lksTemplate } from "./schema";

const JUDUL_MODUL = "Kalor dan Perubahan Suhu";

const LANGKAH = [
  {
    urutan: 1,
    judul: "Atur Massa Zat",
    instruksi:
      "Ubah massa zat, lalu amati pengaruhnya terhadap kenaikan suhu ketika energi pemanas tetap.",
  },
  {
    urutan: 2,
    judul: "Ubah Daya Pemanas",
    instruksi:
      "Bandingkan perubahan suhu ketika daya pemanas diperbesar atau diperkecil.",
  },
  {
    urutan: 3,
    judul: "Bandingkan Kalor Jenis",
    instruksi:
      "Gunakan mode Bandingkan Zat untuk mengamati perbedaan kenaikan suhu pada dua zat dengan massa dan daya yang sama.",
  },
  {
    urutan: 4,
    judul: "Amati Grafik Suhu",
    instruksi:
      "Jalankan simulasi dan amati hubungan waktu, energi kalor, dan suhu pada grafik.",
  },
] as const;

const LKS = [
  {
    urutan: 1,
    pertanyaan:
      "Apa yang terjadi pada kenaikan suhu ketika massa zat diperbesar, sedangkan energi pemanas tetap?",
  },
  {
    urutan: 2,
    pertanyaan:
      "Bagaimana pengaruh daya pemanas terhadap kecepatan kenaikan suhu?",
  },
  {
    urutan: 3,
    pertanyaan:
      "Zat mana yang mengalami kenaikan suhu paling cepat? Jelaskan hubungannya dengan kalor jenis.",
  },
  {
    urutan: 4,
    pertanyaan:
      "Jelaskan hubungan antara energi kalor, massa, kalor jenis, dan perubahan suhu berdasarkan persamaan Q = mcΔT.",
  },
  {
    urutan: 5,
    pertanyaan:
      "Buat kesimpulan mengenai faktor-faktor yang memengaruhi perubahan suhu suatu zat.",
  },
] as const;

async function main() {
  const [m] = await db
    .select({ id: modul.id })
    .from(modul)
    .where(eq(modul.judul, JUDUL_MODUL))
    .limit(1);

  if (!m) {
    console.error(
      `❌ Modul "${JUDUL_MODUL}" tidak ditemukan. Jalankan db:seed atau db:seed-modules dulu.`,
    );
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

  console.log(
    `✅ Panduan (${LANGKAH.length} langkah) & LKS (${LKS.length} soal) diperbarui.`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Gagal:", err);
    process.exit(1);
  });
