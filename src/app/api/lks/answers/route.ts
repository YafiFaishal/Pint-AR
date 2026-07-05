import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db, jawabanLks, lksTemplate } from "@/db";
import { getCurrentUser } from "@/lib/session";

// Ambil jawaban milik siswa saat ini untuk sebuah modul.
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const moduleId = searchParams.get("moduleId");
  if (!moduleId) {
    return NextResponse.json(
      { error: "Parameter moduleId wajib diisi." },
      { status: 400 },
    );
  }

  const jawaban = await db
    .select({
      lksTemplateId: jawabanLks.lksTemplateId,
      jawabanSiswa: jawabanLks.jawabanSiswa,
      autosaveAt: jawabanLks.autosaveAt,
    })
    .from(jawabanLks)
    .innerJoin(lksTemplate, eq(jawabanLks.lksTemplateId, lksTemplate.id))
    .where(
      and(
        eq(jawabanLks.userId, user.id),
        eq(lksTemplate.modulId, moduleId),
      ),
    );

  return NextResponse.json({ jawaban });
}

type JawabanInput = { lksTemplateId: string; jawaban: string };

// Simpan (upsert) satu atau beberapa jawaban siswa. Dipakai untuk autosave.
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }

  let body: { answers?: JawabanInput[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid." }, { status: 400 });
  }

  const answers = Array.isArray(body.answers) ? body.answers : [];
  if (answers.length === 0) {
    return NextResponse.json(
      { error: "Tidak ada jawaban untuk disimpan." },
      { status: 400 },
    );
  }

  const now = new Date();
  for (const a of answers) {
    if (!a?.lksTemplateId) continue;
    await db
      .insert(jawabanLks)
      .values({
        id: randomUUID(),
        userId: user.id,
        lksTemplateId: a.lksTemplateId,
        jawabanSiswa: a.jawaban ?? "",
        autosaveAt: now,
      })
      .onConflictDoUpdate({
        target: [jawabanLks.userId, jawabanLks.lksTemplateId],
        set: { jawabanSiswa: a.jawaban ?? "", autosaveAt: now },
      });
  }

  return NextResponse.json({ success: true, savedAt: now.toISOString() });
}
