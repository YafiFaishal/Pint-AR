import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Proteksi optimistik: cek keberadaan cookie sesi untuk mengalihkan pengguna
 * yang belum masuk. Validasi sesi & pengecekan peran yang sebenarnya tetap
 * dilakukan di Server Component (lihat `requireUser`).
 */
export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const url = new URL("/masuk", request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/beranda",
    "/onboarding",
    "/siswa",
    "/siswa/:path*",
    "/guru",
    "/guru/:path*",
    "/praktikum",
    "/praktikum/:path*",
  ],
};
