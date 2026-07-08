/**
 * Memperbarui panduan & LKS modul Hukum Hooke dan Elastisitas Pegas.
 * Idempoten — aman dijalankan berulang.
 *
 * Jalankan: npm run db:seed-hooke-spring
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { modul, langkahPraktikum, lksTemplate } from "./schema";

const JUDUL_MODUL = "Hukum Hooke dan Elastisitas Pegas";

const LANGKAH = [
  {
    urutan: 1,
    judul: "Atur Konstanta Pegas",
    instruksi:
      "Ubah konstanta pegas, lalu amati bagaimana kekakuan pegas memengaruhi pertambahan panjang.",
  },
  {
    urutan: 2,
    judul: "Tambahkan Massa",
    instruksi:
      "Ubah massa beban dan bandingkan besar gaya berat dengan pertambahan panjang pegas.",
  },
  {
    urutan: 3,
    judul: "Amati Getaran",
    instruksi:
      "Pindah ke mode Getaran Pegas, lalu jalankan simulasi untuk mengamati periode dan frekuensi.",
  },
  {
    urutan: 4,
    judul: "Bandingkan Parameter",
    instruksi:
      "Bandingkan pengaruh massa dan konstanta pegas terhadap periode getaran.",
  },
] as const;

const LKS = [
  {
    urutan: 1,
    pertanyaan:
      "Apa yang terjadi pada pertambahan panjang pegas ketika massa beban diperbesar?",
  },
  {
    urutan: 2,
    pertanyaan:
      "Bagaimana pengaruh konstanta pegas terhadap pertambahan panjang?",
  },
  {
    urutan: 3,
    pertanyaan:
      "Apakah gravitasi mengubah posisi setimbang pegas? Jelaskan berdasarkan pengamatan.",
  },
  {
    urutan: 4,
    pertanyaan:
      "Bagaimana pengaruh massa dan konstanta pegas terhadap periode getaran?",
  },
  {
    urutan: 5,
    pertanyaan:
      "Buat kesimpulan mengenai hubungan gaya, konstanta pegas, pertambahan panjang, dan periode.",
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
