/**
 * Memperbarui panduan & LKS modul Reaksi Kimia di database yang sudah ada.
 * Idempoten — aman dijalankan berulang.
 *
 * Jalankan: npm run db:seed-reaksi-kimia
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { modul, langkahPraktikum, lksTemplate } from "./schema";

const JUDUL_MODUL = "Reaksi Kimia";

const LANGKAH = [
  {
    urutan: 1,
    judul: "Amati Larutan Awal",
    instruksi:
      "Perhatikan warna dan kondisi awal larutan A dan B.",
  },
  {
    urutan: 2,
    judul: "Atur Volume Larutan",
    instruksi:
      "Geser slider volume untuk menentukan banyaknya larutan yang akan dicampurkan.",
  },
  {
    urutan: 3,
    judul: "Campurkan Larutan",
    instruksi:
      "Tekan tombol Campurkan dan amati perubahan yang terjadi pada beaker hasil.",
  },
  {
    urutan: 4,
    judul: "Catat Perubahan",
    instruksi:
      "Amati perubahan warna, suhu, pH, dan gelembung sebagai tanda reaksi kimia.",
  },
] as const;

const LKS = [
  {
    urutan: 1,
    pertanyaan:
      "Apa perubahan warna yang terjadi setelah larutan dicampurkan?",
  },
  {
    urutan: 2,
    pertanyaan: "Apa yang terjadi pada suhu saat reaksi berlangsung?",
  },
  {
    urutan: 3,
    pertanyaan: "Bagaimana perubahan pH setelah pencampuran?",
  },
  {
    urutan: 4,
    pertanyaan:
      "Apa tanda-tanda terjadinya reaksi kimia berdasarkan simulasi?",
  },
  {
    urutan: 5,
    pertanyaan: "Apa kesimpulanmu dari percobaan ini?",
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
      `❌ Modul "${JUDUL_MODUL}" tidak ditemukan. Jalankan db:seed-modules dulu.`,
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
