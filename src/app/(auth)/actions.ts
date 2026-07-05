"use server";

import { eq } from "drizzle-orm";
import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth";
import { db, user as userTable } from "@/db";

export type DaftarInput = {
  name: string;
  email: string;
  password: string;
  role: "siswa" | "guru";
  kodeGuru?: string;
};

export type DaftarResult = { success: true } | { error: string };

function pesanApiError(err: APIError): string {
  const code = (err.body as { code?: string } | undefined)?.code;
  switch (code) {
    case "USER_ALREADY_EXISTS":
      return "Email ini sudah terdaftar. Silakan masuk.";
    case "PASSWORD_TOO_SHORT":
      return "Kata sandi minimal 8 karakter.";
    default:
      return err.message || "Terjadi kesalahan. Coba lagi ya.";
  }
}

/**
 * Registrasi akun. Peran "guru" hanya diberikan jika Kode Guru valid.
 * Validasi kode & penetapan peran dilakukan sepenuhnya di server sehingga
 * tidak bisa dimanipulasi dari sisi klien.
 */
export async function daftarAkun(input: DaftarInput): Promise<DaftarResult> {
  const name = input.name?.trim();
  const email = input.email?.trim();
  const password = input.password ?? "";
  const inginGuru = input.role === "guru";

  if (!name || !email || !password) {
    return { error: "Mohon lengkapi semua kolom." };
  }
  if (password.length < 8) {
    return { error: "Kata sandi minimal 8 karakter." };
  }

  // Validasi Kode Guru di server sebelum membuat akun.
  if (inginGuru) {
    const kodeSeharusnya = process.env.GURU_INVITE_CODE;
    if (!kodeSeharusnya) {
      return {
        error: "Pendaftaran guru sedang tidak tersedia. Hubungi admin sekolah.",
      };
    }
    if ((input.kodeGuru ?? "").trim() !== kodeSeharusnya) {
      return { error: "Kode Guru tidak valid." };
    }
  }

  // Buat akun (selalu default sebagai siswa karena role.input = false).
  let userId: string;
  try {
    const res = await auth.api.signUpEmail({
      body: { name, email, password },
    });
    userId = res.user.id;
  } catch (err) {
    if (err instanceof APIError) {
      return { error: pesanApiError(err) };
    }
    return { error: "Terjadi kesalahan. Coba lagi ya." };
  }

  // Naikkan peran ke guru hanya setelah kode terbukti valid di atas.
  if (inginGuru) {
    await db
      .update(userTable)
      .set({ role: "guru" })
      .where(eq(userTable.id, userId));
  }

  return { success: true };
}
