/**
 * Menambahkan 3 modul baru ke database yang sudah ada (idempoten).
 * Aman dijalankan berulang — melewati modul yang judulnya sudah ada.
 *
 * Jalankan: npm run db:seed-modules
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { modul, langkahPraktikum } from "./schema";

const MODUL_BARU = [
  {
    judul: "Tata Surya (Kepler)",
    deskripsi:
      "Eksplorasi orbit planet-planet dengan simulasi fisika Hukum Kepler interaktif.",
    instruksi:
      "Simulasi orbit planet dan Hukum Kepler sedang dikembangkan. Pantau pembaruan berikutnya.",
  },
  {
    judul: "Gerak Jatuh Bebas",
    deskripsi:
      "Buktikan percepatan gravitasi bumi dan bandingkan jatuh di ruang udara vs hampa.",
    instruksi:
      "Simulasi gerak jatuh bebas di udara dan ruang hampa sedang dikembangkan. Pantau pembaruan berikutnya.",
  },
  {
    judul: "Reaksi Kimia",
    deskripsi:
      "Campurkan bahan kimia untuk mengamati perubahan suhu, pH, dan warna.",
    instruksi:
      "Simulasi pencampuran bahan kimia sedang dikembangkan. Pantau pembaruan berikutnya.",
  },
  {
    judul: "Hukum Archimedes",
    deskripsi:
      "Uji pengaruh massa, volume, dan jenis cairan terhadap kondisi terapung, melayang, atau tenggelam.",
    instruksi:
      "Simulasi Hukum Archimedes sedang dikembangkan. Pantau pembaruan berikutnya.",
  },
  {
    judul: "Pemantulan dan Pembiasan Cahaya",
    deskripsi:
      "Amati arah cahaya saat dipantulkan dan dibiaskan pada medium yang berbeda.",
    instruksi:
      "Simulasi pemantulan dan pembiasan cahaya sedang dikembangkan. Pantau pembaruan berikutnya.",
  },
  {
    judul: "Getaran Bandul Sederhana",
    deskripsi:
      "Amati pengaruh panjang tali, gravitasi, dan massa terhadap periode ayunan bandul.",
    instruksi:
      "Simulasi getaran bandul sederhana sedang dikembangkan. Pantau pembaruan berikutnya.",
  },
  {
    judul: "Hukum Hooke dan Elastisitas Pegas",
    deskripsi:
      "Amati hubungan gaya, pertambahan panjang, konstanta pegas, dan getaran massa–pegas.",
    instruksi:
      "Simulasi Hukum Hooke dan elastisitas pegas sedang dikembangkan. Pantau pembaruan berikutnya.",
  },
  {
    judul: "Kalor dan Perubahan Suhu",
    deskripsi:
      "Amati pengaruh massa, kalor jenis, dan energi pemanas terhadap perubahan suhu suatu zat.",
    instruksi:
      "Simulasi kalor dan perubahan suhu sedang dikembangkan. Pantau pembaruan berikutnya.",
  },
] as const;

async function main() {
  console.log("🌱 Menambahkan modul baru (jika belum ada)...");

  let ditambah = 0;

  for (const item of MODUL_BARU) {
    const [ada] = await db
      .select({ id: modul.id })
      .from(modul)
      .where(eq(modul.judul, item.judul))
      .limit(1);

    if (ada) {
      console.log(`  ↷ Lewati "${item.judul}" — sudah ada`);
      continue;
    }

    const modulId = randomUUID();
    await db.insert(modul).values({
      id: modulId,
      judul: item.judul,
      modelGlbUrl: null,
      modelUsdzUrl: null,
      deskripsi: item.deskripsi,
    });

    await db.insert(langkahPraktikum).values({
      id: randomUUID(),
      modulId,
      urutan: 1,
      judul: "Praktikum Sedang Disiapkan",
      instruksi: item.instruksi,
    });

    console.log(`  ✓ Ditambahkan "${item.judul}"`);
    ditambah++;
  }

  const semua = await db.select({ judul: modul.judul }).from(modul);
  console.log(`\n✅ Selesai. ${ditambah} modul baru. Total di database: ${semua.length}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Gagal:", err);
    process.exit(1);
  });
