/**
 * Hapus modul duplikat (judul sama) dari database.
 * Mempertahankan modul dengan langkah/LKS/progres terbanyak.
 *
 * Jalankan: npm run db:dedupe-modules
 */
import "dotenv/config";
import { eq, inArray, sql } from "drizzle-orm";
import { db } from "./index";
import { jawabanLks, langkahPraktikum, lksTemplate, modul } from "./schema";
import {
  dedupeByJudulModul,
  kunciJudulModul,
  skorModulKanonic,
} from "@/lib/modul-dedupe";

async function main() {
  console.log("🧹 Membersihkan modul duplikat...");

  const daftarModul = await db.select().from(modul);
  if (daftarModul.length === 0) {
    console.log("✅ Tidak ada modul di database.");
    return;
  }

  const modulIds = daftarModul.map((m) => m.id);

  const langkahRows = await db
    .select({
      modulId: langkahPraktikum.modulId,
      jumlah: sql<number>`count(*)`,
    })
    .from(langkahPraktikum)
    .where(inArray(langkahPraktikum.modulId, modulIds))
    .groupBy(langkahPraktikum.modulId);

  const lksRows = await db
    .select({
      modulId: lksTemplate.modulId,
      jumlah: sql<number>`count(*)`,
    })
    .from(lksTemplate)
    .where(inArray(lksTemplate.modulId, modulIds))
    .groupBy(lksTemplate.modulId);

  const jawabanRows = await db
    .select({
      modulId: lksTemplate.modulId,
      jumlah: sql<number>`count(${jawabanLks.id})`,
    })
    .from(jawabanLks)
    .innerJoin(lksTemplate, eq(jawabanLks.lksTemplateId, lksTemplate.id))
    .where(inArray(lksTemplate.modulId, modulIds))
    .groupBy(lksTemplate.modulId);

  const langkahMap = new Map(
    langkahRows.map((r) => [r.modulId, Number(r.jumlah) || 0]),
  );
  const lksMap = new Map(lksRows.map((r) => [r.modulId, Number(r.jumlah) || 0]));
  const jawabanMap = new Map(
    jawabanRows.map((r) => [r.modulId, Number(r.jumlah) || 0]),
  );

  const enriched = daftarModul.map((m) => ({
    ...m,
    jumlahLangkah: langkahMap.get(m.id) ?? 0,
    totalSoalLks: lksMap.get(m.id) ?? 0,
    jawaban: jawabanMap.get(m.id) ?? 0,
  }));

  const grouped = new Map<string, typeof enriched>();
  for (const item of enriched) {
    const key = kunciJudulModul(item.judul);
    const list = grouped.get(key) ?? [];
    list.push(item);
    grouped.set(key, list);
  }

  const idsToDelete: string[] = [];

  for (const [judulKey, group] of grouped) {
    if (group.length <= 1) continue;

    const keeper = dedupeByJudulModul(group, (m) =>
      skorModulKanonic({
        jumlahLangkah: m.jumlahLangkah,
        totalSoalLks: m.totalSoalLks,
        aktivitas: m.jawaban,
      }),
    )[0]!;

    const duplicates = group.filter((m) => m.id !== keeper.id);
    console.log(
      `  "${group[0]!.judul}" — simpan ${keeper.id.slice(0, 8)}… (${keeper.jumlahLangkah} langkah, ${keeper.totalSoalLks} LKS); hapus ${duplicates.length} duplikat`,
    );

    for (const dup of duplicates) {
      idsToDelete.push(dup.id);
    }

    void judulKey;
  }

  if (idsToDelete.length === 0) {
    console.log("✅ Tidak ada duplikat. Total modul:", daftarModul.length);
    return;
  }

  for (const id of idsToDelete) {
    await db.delete(modul).where(eq(modul.id, id));
  }

  const sisa = await db.select({ id: modul.id }).from(modul);
  console.log(
    `\n✅ Selesai. ${idsToDelete.length} modul duplikat dihapus. Sisa: ${sisa.length} modul.`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Gagal dedupe:", err);
    process.exit(1);
  });
