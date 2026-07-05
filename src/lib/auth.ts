import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    // MVP: tidak perlu verifikasi email
    requireEmailVerification: false,
    autoSignIn: false,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "siswa",
        // Klien TIDAK boleh menentukan peran sendiri saat daftar.
        // Kenaikan peran ke "guru" hanya lewat server action + Kode Guru.
        input: false,
      },
      onboarded: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 hari
    updateAge: 60 * 60 * 24, // perbarui tiap 1 hari
  },
  // Origin yang diizinkan (CSRF). Mendukung wildcard untuk domain tunnel dev.
  trustedOrigins: [
    "http://localhost:3000",
    "https://*.ngrok-free.app",
    "https://*.ngrok-free.dev",
    "https://*.ngrok.app",
    "https://*.ngrok.io",
    "https://*.trycloudflare.com",
    ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? []),
  ],
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
