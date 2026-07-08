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

/** Modul dengan praktikum 3D interaktif (simulasi Hukum Archimedes). */
export function isArchimedesModul(modul: Pick<Modul, "judul">): boolean {
  return modul.judul.toLowerCase().includes("archimedes");
}

/** Modul dengan praktikum 3D interaktif (simulasi pemantulan & pembiasan cahaya). */
export function isCahayaOptikModul(modul: Pick<Modul, "judul">): boolean {
  const judul = modul.judul.toLowerCase();
  return (
    judul.includes("pemantulan") ||
    judul.includes("pembiasan cahaya") ||
    judul.includes("cahaya dan optik")
  );
}

/** Modul dengan praktikum 3D interaktif (simulasi getaran bandul sederhana). */
export function isBandulSederhanaModul(modul: Pick<Modul, "judul">): boolean {
  const judul = modul.judul.toLowerCase();
  return judul.includes("bandul") || judul.includes("getaran bandul");
}

/** Modul dengan praktikum 3D interaktif (simulasi Hukum Hooke & elastisitas pegas). */
export function isHookeSpringModul(modul: Pick<Modul, "judul">): boolean {
  const judul = modul.judul.toLowerCase();
  return (
    judul.includes("hooke") ||
    judul.includes("elastisitas pegas") ||
    (judul.includes("pegas") && judul.includes("elastis"))
  );
}

/** Modul dengan praktikum 3D interaktif (simulasi kalor & perubahan suhu). */
export function isThermalChangeModul(modul: Pick<Modul, "judul">): boolean {
  const judul = modul.judul.toLowerCase();
  return (
    judul.includes("kalor") ||
    judul.includes("perubahan suhu") ||
    judul.includes("kalor-perubahan-suhu")
  );
}

/** Modul praktikum interaktif (layout mobile khusus). */
export function isPraktikumInteraktif(modul: Pick<Modul, "judul">): boolean {
  return (
    isNewtonModul(modul) ||
    isRangkaianModul(modul) ||
    isTataSuryaModul(modul) ||
    isJatuhBebasModul(modul) ||
    isReaksiKimiaModul(modul) ||
    isArchimedesModul(modul) ||
    isCahayaOptikModul(modul) ||
    isBandulSederhanaModul(modul) ||
    isHookeSpringModul(modul) ||
    isThermalChangeModul(modul)
  );
}

/** Modul yang simulasinya belum tersedia — tampilkan placeholder. */
export function isModulBelumSiap(modul: Pick<Modul, "judul">): boolean {
  return !isPraktikumInteraktif(modul);
}
