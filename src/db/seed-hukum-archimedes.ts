/**
 * Memperbarui panduan & LKS modul Hukum Archimedes di database yang sudah ada.
 * Idempoten — aman dijalankan berulang.
 *
 * Jalankan: npm run db:seed-hukum-archimedes
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { modul, langkahPraktikum, lksTemplate } from "./schema";

const JUDUL_MODUL = "Hukum Archimedes";

const LANGKAH = [
  {
    urutan: 1,
    judul: "Atur Benda dan Cairan",
    instruksi:
      "Atur massa dan volume benda, lalu pilih jenis cairan yang akan digunakan.",
  },
  {
    urutan: 2,
    judul: "Masukkan Benda",
    instruksi:
      "Tekan tombol Masukkan Benda dan amati posisi akhir benda di dalam cairan.",
  },
  {
    urutan: 3,
    judul: "Bandingkan Gaya",
    instruksi:
      "Bandingkan gaya berat dan gaya apung. Perhatikan arah dan panjang kedua panah gaya.",
  },
  {
    urutan: 4,
    judul: "Uji Tiga Kondisi",
    instruksi:
      "Ubah massa, volume, atau jenis cairan hingga benda mengalami kondisi terapung, melayang, dan tenggelam.",
  },
] as const;

const LKS = [
  {
    urutan: 1,
    pertanyaan:
      "Apa yang terjadi ketika massa benda diperbesar sementara volumenya tetap?",
  },
  {
    urutan: 2,
    pertanyaan:
      "Bandingkan massa jenis benda dan massa jenis cairan ketika benda terapung.",
  },
  {
    urutan: 3,
    pertanyaan:
      "Bagaimana perbandingan gaya berat dan gaya apung ketika benda melayang?",
  },
  {
    urutan: 4,
    pertanyaan:
      "Mengapa benda yang tenggelam di air dapat terapung pada cairan yang massa jenisnya lebih besar?",
  },
  {
    urutan: 5,
    pertanyaan:
      "Buat kesimpulan tentang syarat benda terapung, melayang, dan tenggelam berdasarkan percobaanmu.",
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
