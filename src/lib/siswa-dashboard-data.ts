import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { db, jawabanLks, langkahPraktikum, lksTemplate, modul } from "@/db";
import {
  getKategoriModul,
  hitungStatusModul,
  isArTersedia,
  type StatusModul,
  type KategoriModul,
} from "@/lib/siswa-modul-utils";
import {
  dedupeByJudulModul,
  skorModulKanonic,
} from "@/lib/modul-dedupe";

export type ModulDashboardItem = {
  id: string;
  judul: string;
  deskripsi: string | null;
  kategori: KategoriModul;
  jumlahLangkah: number;
  totalSoalLks: number;
  dijawab: number;
  dinilaiCount: number;
  status: StatusModul;
  arSiap: boolean;
  lksTersedia: boolean;
};

export type RingkasanProgres = {
  totalModul: number;
  belumMulai: number;
  lksSelesai: number;
  sudahDinilai: number;
};

export type SiswaDashboardData = {
  modul: ModulDashboardItem[];
  ringkasan: RingkasanProgres;
};

export async function getSiswaDashboardData(
  userId: string,
): Promise<SiswaDashboardData> {
  const daftarModul = await db.select().from(modul).orderBy(asc(modul.judul));

  if (daftarModul.length === 0) {
    return {
      modul: [],
      ringkasan: {
        totalModul: 0,
        belumMulai: 0,
        lksSelesai: 0,
        sudahDinilai: 0,
      },
    };
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
      dijawab: sql<number>`count(${jawabanLks.id})`,
      dinilaiCount: sql<number>`sum(case when ${jawabanLks.dinilai} then 1 else 0 end)`,
    })
    .from(jawabanLks)
    .innerJoin(lksTemplate, eq(jawabanLks.lksTemplateId, lksTemplate.id))
    .where(
      and(
        eq(jawabanLks.userId, userId),
        inArray(lksTemplate.modulId, modulIds),
      ),
    )
    .groupBy(lksTemplate.modulId);

  const langkahMap = new Map(
    langkahRows.map((r) => [r.modulId, Number(r.jumlah) || 0]),
  );
  const lksMap = new Map(
    lksRows.map((r) => [r.modulId, Number(r.jumlah) || 0]),
  );
  const jawabanMap = new Map(
    jawabanRows.map((r) => [
      r.modulId,
      {
        dijawab: Number(r.dijawab) || 0,
        dinilaiCount: Number(r.dinilaiCount) || 0,
      },
    ]),
  );

  const items: ModulDashboardItem[] = daftarModul.map((m) => {
    const totalSoalLks = lksMap.get(m.id) ?? 0;
    const jawaban = jawabanMap.get(m.id) ?? { dijawab: 0, dinilaiCount: 0 };
    const status = hitungStatusModul({
      totalSoalLks,
      dijawab: jawaban.dijawab,
      dinilaiCount: jawaban.dinilaiCount,
    });

    return {
      id: m.id,
      judul: m.judul,
      deskripsi: m.deskripsi,
      kategori: getKategoriModul(m),
      jumlahLangkah: langkahMap.get(m.id) ?? 0,
      totalSoalLks,
      dijawab: jawaban.dijawab,
      dinilaiCount: jawaban.dinilaiCount,
      status,
      arSiap: isArTersedia(m),
      lksTersedia: totalSoalLks > 0,
    };
  });

  const modulUnik = dedupeByJudulModul(items, (m) =>
    skorModulKanonic({
      jumlahLangkah: m.jumlahLangkah,
      totalSoalLks: m.totalSoalLks,
      aktivitas: m.dijawab,
    }),
  ).sort((a, b) => a.judul.localeCompare(b.judul, "id"));

  return {
    modul: modulUnik,
    ringkasan: {
      totalModul: modulUnik.length,
      belumMulai: modulUnik.filter((m) => m.status === "Belum mulai").length,
      lksSelesai: modulUnik.filter(
        (m) => m.status === "LKS selesai" || m.status === "Sudah dinilai",
      ).length,
      sudahDinilai: modulUnik.filter((m) => m.status === "Sudah dinilai").length,
    },
  };
}
