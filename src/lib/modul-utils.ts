import type { Modul } from "@/db/schema";

/** Modul dengan praktikum 3D interaktif (simulasi Newton). */
export function isNewtonModul(modul: Pick<Modul, "judul">): boolean {
  return modul.judul.toLowerCase().includes("newton");
}

/** Modul dengan praktikum 3D interaktif (simulasi rangkaian listrik). */
export function isRangkaianModul(modul: Pick<Modul, "judul">): boolean {
  const judul = modul.judul.toLowerCase();
  return judul.includes("rangkaian") && judul.includes("listrik");
}

/** Modul praktikum interaktif (layout mobile khusus). */
export function isPraktikumInteraktif(modul: Pick<Modul, "judul">): boolean {
  return isNewtonModul(modul) || isRangkaianModul(modul);
}
