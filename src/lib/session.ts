import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export type Role = "siswa" | "guru";

/** Ambil sesi pengguna saat ini di Server Component / Server Action / Route. */
export async function getCurrentSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Ambil pengguna saat ini, atau null jika belum masuk. */
export async function getCurrentUser() {
  const session = await getCurrentSession();
  return session?.user ?? null;
}

/**
 * Ambil pengguna guru untuk guard di API route.
 * Mengembalikan { user } bila guru, atau { error, status } bila tidak.
 */
export async function getGuru() {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, error: "Tidak diizinkan.", status: 401 as const };
  }
  if (user.role !== "guru") {
    return { user: null, error: "Khusus guru.", status: 403 as const };
  }
  return { user, error: null, status: 200 as const };
}

/** Path beranda default sesuai peran. */
export function berandaPath(role: Role | string | null | undefined) {
  return role === "guru" ? "/guru" : "/siswa";
}

/**
 * Pastikan ada pengguna yang masuk. Jika tidak, alihkan ke /masuk.
 * Jika `role` diberikan dan tidak cocok, alihkan ke beranda peran pengguna.
 */
export async function requireUser(role?: Role) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/masuk");
  }
  if (role && user.role !== role) {
    redirect(berandaPath(user.role));
  }
  return user;
}
