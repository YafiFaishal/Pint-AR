import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, user as userTable } from "@/db";
import { getCurrentUser } from "@/lib/session";

// Ambil status onboarding pengguna saat ini.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }
  return NextResponse.json({ onboarded: Boolean(user.onboarded) });
}

// Tandai onboarding selesai (dipakai saat menekan "Coba Sekarang"/"Lewati Tur").
export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }

  await db
    .update(userTable)
    .set({ onboarded: true })
    .where(eq(userTable.id, user.id));

  return NextResponse.json({ success: true });
}
