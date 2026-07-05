import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db, modul, langkahPraktikum } from "@/db";
import { getCurrentUser } from "@/lib/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ modulId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }

  const { modulId } = await params;

  const [m] = await db.select().from(modul).where(eq(modul.id, modulId));
  if (!m) {
    return NextResponse.json(
      { error: "Modul tidak ditemukan." },
      { status: 404 },
    );
  }

  const langkah = await db
    .select()
    .from(langkahPraktikum)
    .where(eq(langkahPraktikum.modulId, modulId))
    .orderBy(asc(langkahPraktikum.urutan));

  return NextResponse.json({ modul: m, langkah });
}
