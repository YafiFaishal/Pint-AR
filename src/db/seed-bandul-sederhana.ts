/**
 * Memperbarui panduan & LKS modul Getaran Bandul Sederhana di database yang sudah ada.
 * Idempoten — aman dijalankan berulang.
 *
 * Jalankan: npm run db:seed-bandul-sederhana
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { modul, langkahPraktikum, lksTemplate } from "./schema";

const JUDUL_MODUL = "Getaran Bandul Sederhana";

const LANGKAH = [
  {
    urutan: 1,
    judul: "Atur Panjang Tali",
    instruksi:
      "Geser panjang tali, lalu amati perubahan waktu yang dibutuhkan bandul untuk menyelesaikan satu getaran.",
  },
  {
    urutan: 2,
    judul: "Bandingkan Massa",
    instruksi:
      "Ubah massa bandul dengan panjang tali dan gravitasi yang sama. Amati apakah periodenya berubah.",
  },
  {
    urutan: 3,
    judul: "Uji Gravitasi",
    instruksi:
      "Bandingkan gerak bandul pada Bulan, Mars, Bumi, dan Jupiter.",
  },
  {
    urutan: 4,
    judul: "Catat Periode",
    instruksi:
      "Jalankan beberapa percobaan dan catat hubungan panjang tali, gravitasi, periode, dan frekuensi.",
  },
] as const;

const LKS = [
  {
    urutan: 1,
    pertanyaan:
      "Apa yang terjadi pada periode bandul ketika panjang tali diperbesar?",
  },
  {
    urutan: 2,
    pertanyaan:
      "Apakah perubahan massa bandul memengaruhi periode? Jelaskan berdasarkan hasil pengamatan.",
  },
  {
    urutan: 3,
    pertanyaan:
      "Bandingkan periode bandul pada Bumi dan Bulan dengan panjang tali yang sama.",
  },
  {
    urutan: 4,
    pertanyaan:
      "Bagaimana hubungan antara periode dan frekuensi bandul?",
  },
  {
    urutan: 5,
    pertanyaan:
      "Buat kesimpulan mengenai faktor-faktor yang memengaruhi periode bandul sederhana.",
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
