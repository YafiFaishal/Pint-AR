import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db, lksTemplate } from "@/db";
import { getCurrentUser } from "@/lib/session";

// Daftar pertanyaan LKS untuk sebuah modul.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ moduleId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }

  const { moduleId } = await params;

  const pertanyaan = await db
    .select({
      id: lksTemplate.id,
      pertanyaan: lksTemplate.pertanyaan,
      urutan: lksTemplate.urutan,
    })
    .from(lksTemplate)
    .where(eq(lksTemplate.modulId, moduleId))
    .orderBy(asc(lksTemplate.urutan));

  return NextResponse.json({ pertanyaan });
}
