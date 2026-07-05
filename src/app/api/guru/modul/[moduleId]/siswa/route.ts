import { NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db, user, lksTemplate, jawabanLks } from "@/db";
import { getGuru } from "@/lib/session";

// Daftar siswa aktif pada sebuah modul beserta status penyelesaiannya.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ moduleId: string }> },
) {
  const guard = await getGuru();
  if (!guard.user) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { moduleId } = await params;

  const [{ totalSoal }] = await db
    .select({ totalSoal: sql<number>`count(*)` })
    .from(lksTemplate)
    .where(eq(lksTemplate.modulId, moduleId));

  const rows = await db
    .select({
      id: user.id,
      nama: user.name,
      email: user.email,
      dijawab: sql<number>`count(${jawabanLks.id})`,
      dinilaiCount: sql<number>`sum(case when ${jawabanLks.dinilai} then 1 else 0 end)`,
    })
    .from(jawabanLks)
    .innerJoin(lksTemplate, eq(lksTemplate.id, jawabanLks.lksTemplateId))
    .innerJoin(user, eq(user.id, jawabanLks.userId))
    .where(and(eq(lksTemplate.modulId, moduleId), eq(user.role, "siswa")))
    .groupBy(user.id);

  const siswa = rows.map((r) => {
    const dijawab = Number(r.dijawab) || 0;
    const dinilaiCount = Number(r.dinilaiCount) || 0;
    const selesai = totalSoal > 0 && dijawab >= totalSoal;
    return {
      id: r.id,
      nama: r.nama,
      email: r.email,
      dijawab,
      totalSoal,
      status: selesai ? "Selesai" : "Sedang Praktikum",
      sudahDinilai: dijawab > 0 && dinilaiCount >= dijawab,
    };
  });

  return NextResponse.json({ totalSoal, siswa });
}
