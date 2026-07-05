import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db, lksTemplate, jawabanLks } from "@/db";
import { getCurrentUser } from "@/lib/session";

// Nilai LKS siswa untuk sebuah modul (skor per soal + total).
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ moduleId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }

  const { moduleId } = await params;

  // leftJoin dengan filter userId di kondisi JOIN: semua soal tetap tampil,
  // hanya jawaban milik siswa ini yang ikut tergabung.
  const rows = await db
    .select({
      lksTemplateId: lksTemplate.id,
      pertanyaan: lksTemplate.pertanyaan,
      urutan: lksTemplate.urutan,
      skor: jawabanLks.skor,
      dinilai: jawabanLks.dinilai,
    })
    .from(lksTemplate)
    .leftJoin(
      jawabanLks,
      and(
        eq(jawabanLks.lksTemplateId, lksTemplate.id),
        eq(jawabanLks.userId, user.id),
      ),
    )
    .where(eq(lksTemplate.modulId, moduleId))
    .orderBy(asc(lksTemplate.urutan));

  const nilai = rows.map((r) => ({
    lksTemplateId: r.lksTemplateId,
    pertanyaan: r.pertanyaan,
    urutan: r.urutan,
    dinilai: Boolean(r.dinilai),
    skor: r.dinilai ? (r.skor ?? 0) : null,
  }));

  const totalDinilai = nilai.filter((n) => n.dinilai).length;
  const total = nilai.reduce((s, n) => s + (n.skor ?? 0), 0);
  const sudahDinilai = totalDinilai > 0;
  // Sudah dinilai penuh bila setiap soal telah diberi nilai.
  const dinilaiPenuh = nilai.length > 0 && totalDinilai === nilai.length;

  return NextResponse.json({
    nilai,
    total: sudahDinilai ? total : null,
    sudahDinilai,
    dinilaiPenuh,
  });
}
