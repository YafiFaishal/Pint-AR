import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

/**
 * ===== Tabel inti Better Auth =====
 * Kolom `role` dan `onboarded` adalah field tambahan khusus PintAR.
 */
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .default(false)
    .notNull(),
  image: text("image"),
  // Peran pengguna: "siswa" atau "guru"
  role: text("role", { enum: ["siswa", "guru"] })
    .default("siswa")
    .notNull(),
  // Menandai apakah siswa sudah menyelesaikan/melewati onboarding
  onboarded: integer("onboarded", { mode: "boolean" })
    .default(false)
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`,
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(unixepoch())`,
  ),
});

/**
 * ===== Tabel domain PintAR =====
 */

// Modul praktikum (mis. Hukum Newton) + aset 3D
export const modul = sqliteTable("modul", {
  id: text("id").primaryKey(),
  judul: text("judul").notNull(),
  // Aset 3D — URL bisa diganti ke file GLB/USDZ milik pengguna nanti
  modelGlbUrl: text("model_glb_url"),
  modelUsdzUrl: text("model_usdz_url"),
  deskripsi: text("deskripsi"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

// Langkah panduan praktikum per modul
export const langkahPraktikum = sqliteTable("langkah_praktikum", {
  id: text("id").primaryKey(),
  modulId: text("modul_id")
    .notNull()
    .references(() => modul.id, { onDelete: "cascade" }),
  urutan: integer("urutan").notNull(),
  judul: text("judul"),
  instruksi: text("instruksi").notNull(),
});

// Template pertanyaan LKS per modul
export const lksTemplate = sqliteTable("lks_template", {
  id: text("id").primaryKey(),
  modulId: text("modul_id")
    .notNull()
    .references(() => modul.id, { onDelete: "cascade" }),
  pertanyaan: text("pertanyaan").notNull(),
  urutan: integer("urutan").notNull(),
});

// Jawaban siswa + skor dari guru
export const jawabanLks = sqliteTable(
  "jawaban_lks",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lksTemplateId: text("lks_template_id")
      .notNull()
      .references(() => lksTemplate.id, { onDelete: "cascade" }),
    jawabanSiswa: text("jawaban_siswa"),
    skor: integer("skor").default(0).notNull(),
    // Ditandai true setelah guru memeriksa; nilai hanya tampil bila true.
    dinilai: integer("dinilai", { mode: "boolean" }).default(false).notNull(),
    autosaveAt: integer("autosave_at", { mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
  },
  (t) => [
    // Satu jawaban per (siswa, soal) — memungkinkan upsert saat autosave.
    uniqueIndex("jawaban_user_template_unq").on(t.userId, t.lksTemplateId),
  ],
);

export type User = typeof user.$inferSelect;
export type Modul = typeof modul.$inferSelect;
export type LangkahPraktikum = typeof langkahPraktikum.$inferSelect;
export type LksTemplate = typeof lksTemplate.$inferSelect;
export type JawabanLks = typeof jawabanLks.$inferSelect;
