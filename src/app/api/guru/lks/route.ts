import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { and, asc, eq } from "drizzle-orm";
import { db, lksTemplate, jawabanLks } from "@/db";
import { getGuru } from "@/lib/session";

// Ambil pertanyaan + jawaban + skor seorang siswa untuk sebuah modul.
export async function GET(request: Request) {
  const guard = await getGuru();
  if (!guard.user) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const { searchParams } = new URL(request.url);
  const moduleId = searchParams.get("moduleId");
  const studentId = searchParams.get("studentId");
  if (!moduleId || !studentId) {
    return NextResponse.json(
      { error: "Parameter moduleId dan studentId wajib diisi." },
      { status: 400 },
    );
  }

  const rows = await db
    .select({
      lksTemplateId: lksTemplate.id,
      pertanyaan: lksTemplate.pertanyaan,
      urutan: lksTemplate.urutan,
      jawabanSiswa: jawabanLks.jawabanSiswa,
      skor: jawabanLks.skor,
      dinilai: jawabanLks.dinilai,
    })
    .from(lksTemplate)
    .leftJoin(
      jawabanLks,
      and(
        eq(jawabanLks.lksTemplateId, lksTemplate.id),
        eq(jawabanLks.userId, studentId),
      ),
    )
    .where(eq(lksTemplate.modulId, moduleId))
    .orderBy(asc(lksTemplate.urutan));

  const soal = rows.map((r) => ({
    lksTemplateId: r.lksTemplateId,
    pertanyaan: r.pertanyaan,
    urutan: r.urutan,
    jawabanSiswa: r.jawabanSiswa ?? "",
    skor: r.skor ?? 0,
    dinilai: Boolean(r.dinilai),
  }));

  return NextResponse.json({ soal });
}

type NilaiInput = { lksTemplateId: string; skor: number };

// Simpan skor untuk jawaban siswa (menandai dinilai = true).
export async function POST(request: Request) {
  const guard = await getGuru();
  if (!guard.user) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  let body: { studentId?: string; nilai?: NilaiInput[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const studentId = body.studentId;
  const nilai = Array.isArray(body.nilai) ? body.nilai : [];
  if (!studentId || nilai.length === 0) {
    return NextResponse.json(
      { error: "studentId dan nilai wajib diisi." },
      { status: 400 },
    );
  }

  const now = new Date();
  for (const n of nilai) {
    if (!n?.lksTemplateId) continue;
    const skor = Math.max(0, Math.round(Number(n.skor) || 0));
    // Upsert: bila siswa belum menjawab, tetap simpan skornya.
    await db
      .insert(jawabanLks)
      .values({
        id: randomUUID(),
        userId: studentId,
        lksTemplateId: n.lksTemplateId,
        jawabanSiswa: "",
        skor,
        dinilai: true,
        autosaveAt: now,
      })
      .onConflictDoUpdate({
        target: [jawabanLks.userId, jawabanLks.lksTemplateId],
        set: { skor, dinilai: true },
      });
  }

  return NextResponse.json({ success: true });
}
