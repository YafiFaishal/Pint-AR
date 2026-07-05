import type { Modul } from "@/db/schema";

/** Modul dengan praktikum 3D interaktif (simulasi Newton). */
export function isNewtonModul(modul: Pick<Modul, "judul">): boolean {
  return modul.judul.toLowerCase().includes("newton");
}
