import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { db, jawabanLks, langkahPraktikum, lksTemplate, modul, user } from "@/db";
import {
  getKategoriModul,
  hitungStatSiswaModul,
  hitungStatusModulGuru,
  type StatusModulGuru,
} from "@/lib/guru-modul-utils";
import type { KategoriModul } from "@/lib/siswa-modul-utils";

export type ModulGuruDashboardItem = {
  id: string;
  judul: string;
  deskripsi: string | null;
  kategori: KategoriModul;
  jumlahLangkah: number;
  totalSoalLks: number;
  jumlahSiswaAktif: number;
  lksMasuk: number;
  menungguNilai: number;
  sudahDinilaiCount: number;
  rataRata: number | null;
  status: StatusModulGuru;
};

export type RingkasanGuru = {
  totalModul: number;
  siswaAktif: number;
  menungguDinilai: number;
  sudahDinilai: number;
};

export type PrioritasPenilaian = {
  modulId: string;
  modulJudul: string;
  jumlahMenunggu: number;
} | null;

export type GuruDashboardData = {
  modul: ModulGuruDashboardItem[];
  ringkasan: RingkasanGuru;
  prioritas: PrioritasPenilaian;
};

export async function getGuruDashboardData(): Promise<GuruDashboardData> {
  const daftarModul = await db.select().from(modul).orderBy(asc(modul.judul));

  if (daftarModul.length === 0) {
    return {
      modul: [],
      ringkasan: {
        totalModul: 0,
        siswaAktif: 0,
        menungguDinilai: 0,
        sudahDinilai: 0,
      },
      prioritas: null,
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

  const siswaModulRows = await db
    .select({
      modulId: lksTemplate.modulId,
      userId: jawabanLks.userId,
      dijawab: sql<number>`count(${jawabanLks.id})`,
      dinilaiCount: sql<number>`sum(case when ${jawabanLks.dinilai} then 1 else 0 end)`,
      totalSkor: sql<number>`sum(${jawabanLks.skor})`,
    })
    .from(jawabanLks)
    .innerJoin(lksTemplate, eq(jawabanLks.lksTemplateId, lksTemplate.id))
    .innerJoin(user, eq(user.id, jawabanLks.userId))
    .where(
      and(eq(user.role, "siswa"), inArray(lksTemplate.modulId, modulIds)),
    )
    .groupBy(lksTemplate.modulId, jawabanLks.userId);

  const langkahMap = new Map(
    langkahRows.map((r) => [r.modulId, Number(r.jumlah) || 0]),
  );
  const lksMap = new Map(
    lksRows.map((r) => [r.modulId, Number(r.jumlah) || 0]),
  );

  const siswaPerModul = new Map<
    string,
    Array<{
      dijawab: number;
      dinilaiCount: number;
      totalSkor: number;
    }>
  >();

  const siswaAktifSet = new Set<string>();

  for (const row of siswaModulRows) {
    const dijawab = Number(row.dijawab) || 0;
    if (dijawab <= 0) continue;

    siswaAktifSet.add(row.userId);
    const list = siswaPerModul.get(row.modulId) ?? [];
    list.push({
      dijawab,
      dinilaiCount: Number(row.dinilaiCount) || 0,
      totalSkor: Number(row.totalSkor) || 0,
    });
    siswaPerModul.set(row.modulId, list);
  }

  let totalMenunggu = 0;
  let totalSudahDinilai = 0;

  const items: ModulGuruDashboardItem[] = daftarModul.map((m) => {
    const totalSoalLks = lksMap.get(m.id) ?? 0;
    const siswaStats = siswaPerModul.get(m.id) ?? [];

    let jumlahSiswaAktif = 0;
    let lksMasuk = 0;
    let menungguNilai = 0;
    let sudahDinilaiCount = 0;
    const skorDinilai: number[] = [];

    for (const stat of siswaStats) {
      jumlahSiswaAktif += 1;
      const { selesai, sudahDinilai, menungguNilai: tunggu } =
        hitungStatSiswaModul(totalSoalLks, stat);

      if (selesai) lksMasuk += 1;
      if (tunggu) menungguNilai += 1;
      if (sudahDinilai) {
        sudahDinilaiCount += 1;
        skorDinilai.push(stat.totalSkor);
      }
    }

    totalMenunggu += menungguNilai;
    totalSudahDinilai += sudahDinilaiCount;

    const rataRata =
      skorDinilai.length > 0
        ? Number(
            (
              skorDinilai.reduce((s, v) => s + v, 0) / skorDinilai.length
            ).toFixed(1),
          )
        : null;

    const status = hitungStatusModulGuru({
      jumlahSiswaAktif,
      menungguNilai,
      lksMasuk,
      sudahDinilaiCount,
    });

    return {
      id: m.id,
      judul: m.judul,
      deskripsi: m.deskripsi,
      kategori: getKategoriModul(m),
      jumlahLangkah: langkahMap.get(m.id) ?? 0,
      totalSoalLks,
      jumlahSiswaAktif,
      lksMasuk,
      menungguNilai,
      sudahDinilaiCount,
      rataRata,
      status,
    };
  });

  const prioritasModul = items
    .filter((m) => m.menungguNilai > 0)
    .sort((a, b) => b.menungguNilai - a.menungguNilai)[0];

  return {
    modul: items,
    ringkasan: {
      totalModul: items.length,
      siswaAktif: siswaAktifSet.size,
      menungguDinilai: totalMenunggu,
      sudahDinilai: totalSudahDinilai,
    },
    prioritas: prioritasModul
      ? {
          modulId: prioritasModul.id,
          modulJudul: prioritasModul.judul,
          jumlahMenunggu: prioritasModul.menungguNilai,
        }
      : null,
  };
}
