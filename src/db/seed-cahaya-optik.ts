/**
 * Memperbarui panduan & LKS modul Pemantulan dan Pembiasan Cahaya di database yang sudah ada.
 * Idempoten — aman dijalankan berulang.
 *
 * Jalankan: npm run db:seed-cahaya-optik
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { modul, langkahPraktikum, lksTemplate } from "./schema";

const JUDUL_MODUL = "Pemantulan dan Pembiasan Cahaya";

const LANGKAH = [
  {
    urutan: 1,
    judul: "Atur Sudut Datang",
    instruksi:
      "Atur besar sudut datang terhadap garis normal menggunakan slider.",
  },
  {
    urutan: 2,
    judul: "Amati Pemantulan",
    instruksi:
      "Pilih mode Pemantulan, pancarkan cahaya, lalu bandingkan sudut datang dan sudut pantul.",
  },
  {
    urutan: 3,
    judul: "Uji Dua Medium",
    instruksi:
      "Pilih mode Pembiasan dan bandingkan arah cahaya ketika berpindah dari medium pertama ke medium kedua.",
  },
  {
    urutan: 4,
    judul: "Temukan Pemantulan Total",
    instruksi:
      "Pilih medium pertama yang indeks biasnya lebih besar, lalu tingkatkan sudut datang hingga sinar bias tidak terbentuk.",
  },
] as const;

const LKS = [
  {
    urutan: 1,
    pertanyaan:
      "Bagaimana hubungan sudut datang dan sudut pantul pada cermin datar?",
  },
  {
    urutan: 2,
    pertanyaan:
      "Apa yang terjadi pada arah cahaya ketika berpindah dari udara ke kaca?",
  },
  {
    urutan: 3,
    pertanyaan:
      "Bandingkan sudut bias ketika cahaya bergerak dari medium berindeks bias kecil ke medium berindeks bias besar.",
  },
  {
    urutan: 4,
    pertanyaan: "Pada kondisi apa pemantulan internal total terjadi?",
  },
  {
    urutan: 5,
    pertanyaan:
      "Buat kesimpulan tentang hubungan sudut datang, indeks bias medium, dan arah pembiasan cahaya.",
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
