import { NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db, user, lksTemplate, jawabanLks } from "@/db";
import { getGuru } from "@/lib/session";

// Rekap nilai seluruh siswa aktif pada sebuah modul + rata-rata kelas.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ moduleId: string }> },
) {
  const guard = await getGuru();
  if (!guard.user) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { moduleId } = await params;

  const rows = await db
    .select({
      id: user.id,
      nama: user.name,
      dijawab: sql<number>`count(${jawabanLks.id})`,
      dinilaiCount: sql<number>`sum(case when ${jawabanLks.dinilai} then 1 else 0 end)`,
      totalSkor: sql<number>`sum(${jawabanLks.skor})`,
    })
    .from(jawabanLks)
    .innerJoin(lksTemplate, eq(lksTemplate.id, jawabanLks.lksTemplateId))
    .innerJoin(user, eq(user.id, jawabanLks.userId))
    .where(and(eq(lksTemplate.modulId, moduleId), eq(user.role, "siswa")))
    .groupBy(user.id);

  const rekap = rows.map((r) => {
    const dijawab = Number(r.dijawab) || 0;
    const dinilaiCount = Number(r.dinilaiCount) || 0;
    const sudahDinilai = dijawab > 0 && dinilaiCount >= dijawab;
    return {
      id: r.id,
      nama: r.nama,
      totalSkor: sudahDinilai ? Number(r.totalSkor) || 0 : null,
      status: sudahDinilai ? "Sudah Dinilai" : "Belum Dinilai",
    };
  });

  const dinilai = rekap.filter((r) => r.totalSkor !== null);
  const rataKelas =
    dinilai.length > 0
      ? Number(
          (
            dinilai.reduce((s, r) => s + (r.totalSkor ?? 0), 0) /
            dinilai.length
          ).toFixed(1),
        )
      : null;

  return NextResponse.json({
    rekap,
    rataKelas,
    jumlahDinilai: dinilai.length,
    jumlahSiswa: rekap.length,
  });
}
