/**
 * Memperbarui panduan & LKS modul Gerak Jatuh Bebas di database yang sudah ada.
 * Idempoten — aman dijalankan berulang.
 *
 * Jalankan: npm run db:seed-jatuh-bebas
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { modul, langkahPraktikum, lksTemplate } from "./schema";

const JUDUL_MODUL = "Gerak Jatuh Bebas";

const LANGKAH = [
  {
    urutan: 1,
    judul: "Atur Ketinggian",
    instruksi:
      "Geser slider ketinggian untuk menentukan posisi awal benda sebelum dijatuhkan.",
  },
  {
    urutan: 2,
    judul: "Pilih Gravitasi",
    instruksi:
      "Ubah nilai gravitasi untuk melihat pengaruhnya terhadap waktu jatuh dan kecepatan akhir.",
  },
  {
    urutan: 3,
    judul: "Jatuhkan Benda",
    instruksi:
      "Tekan tombol Jatuhkan dan amati gerak benda dari atas ke bawah.",
  },
  {
    urutan: 4,
    judul: "Bandingkan Udara dan Hampa",
    instruksi:
      "Bandingkan gerak benda pada mode udara dan hampa, lalu catat perbedaannya.",
  },
] as const;

const LKS = [
  {
    urutan: 1,
    pertanyaan:
      "Apa yang terjadi pada waktu jatuh ketika ketinggian diperbesar?",
  },
  {
    urutan: 2,
    pertanyaan: "Apa pengaruh gravitasi terhadap waktu jatuh benda?",
  },
  {
    urutan: 3,
    pertanyaan: "Bandingkan gerak jatuh di udara dan di ruang hampa.",
  },
  {
    urutan: 4,
    pertanyaan:
      "Jika h = 20 m dan g = 10 m/s², hitung waktu jatuh dengan rumus t = sqrt(2h/g).",
  },
  {
    urutan: 5,
    pertanyaan: "Apa kesimpulanmu tentang gerak jatuh bebas?",
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
