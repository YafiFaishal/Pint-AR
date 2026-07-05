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

/** Modul dengan praktikum 3D interaktif (simulasi Tata Surya / Kepler). */
export function isTataSuryaModul(modul: Pick<Modul, "judul">): boolean {
  const judul = modul.judul.toLowerCase();
  return judul.includes("tata surya") || judul.includes("kepler");
}

/** Modul dengan praktikum 3D interaktif (simulasi gerak jatuh bebas). */
export function isJatuhBebasModul(modul: Pick<Modul, "judul">): boolean {
  const judul = modul.judul.toLowerCase();
  return judul.includes("jatuh bebas") || judul.includes("gerak jatuh");
}

/** Modul dengan praktikum 3D interaktif (simulasi reaksi kimia). */
export function isReaksiKimiaModul(modul: Pick<Modul, "judul">): boolean {
  return modul.judul.toLowerCase().includes("reaksi kimia");
}

/** Modul praktikum interaktif (layout mobile khusus). */
export function isPraktikumInteraktif(modul: Pick<Modul, "judul">): boolean {
  return (
    isNewtonModul(modul) ||
    isRangkaianModul(modul) ||
    isTataSuryaModul(modul) ||
    isJatuhBebasModul(modul) ||
    isReaksiKimiaModul(modul)
  );
}

/** Modul yang simulasinya belum tersedia — tampilkan placeholder. */
export function isModulBelumSiap(modul: Pick<Modul, "judul">): boolean {
  return !isPraktikumInteraktif(modul);
}
