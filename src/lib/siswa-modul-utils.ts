import type { Modul } from "@/db/schema";
import {
  isPraktikumInteraktif,
  isReaksiKimiaModul,
  isTataSuryaModul,
} from "@/lib/modul-utils";

export type KategoriModul = "Fisika" | "Kimia" | "Astronomi";

export type StatusModul =
  | "Belum mulai"
  | "Sedang dikerjakan"
  | "LKS belum lengkap"
  | "LKS selesai"
  | "Sudah dinilai";

export type FilterModul = "Semua" | KategoriModul | "Belum selesai";

export const REKOMENDASI_MODUL_JUDUL = "Hukum Newton: Gaya & Gerak";

export function getKategoriModul(modul: Pick<Modul, "judul">): KategoriModul {
  if (isReaksiKimiaModul(modul)) return "Kimia";
  if (isTataSuryaModul(modul)) return "Astronomi";
  return "Fisika";
}

export function isArTersedia(
  modul: Pick<Modul, "judul" | "modelGlbUrl" | "modelUsdzUrl">,
): boolean {
  return isPraktikumInteraktif(modul);
}

export function hitungStatusModul(input: {
  totalSoalLks: number;
  dijawab: number;
  dinilaiCount: number;
}): StatusModul {
  const { totalSoalLks, dijawab, dinilaiCount } = input;

  if (totalSoalLks > 0 && dinilaiCount >= totalSoalLks) {
    return "Sudah dinilai";
  }
  if (totalSoalLks > 0 && dijawab >= totalSoalLks) {
    return "LKS selesai";
  }
  if (dijawab > 0) {
    return "LKS belum lengkap";
  }
  return "Belum mulai";
}

export function tombolAksiModul(status: StatusModul): string {
  switch (status) {
    case "Sudah dinilai":
      return "Lihat hasil";
    case "Belum mulai":
      return "Mulai";
    default:
      return "Lanjutkan";
  }
}

export function modulBelumSelesai(status: StatusModul): boolean {
  return status !== "Sudah dinilai";
}

export function cocokFilter(
  modul: { kategori: KategoriModul; status: StatusModul },
  filter: FilterModul,
): boolean {
  if (filter === "Semua") return true;
  if (filter === "Belum selesai") return modulBelumSelesai(modul.status);
  return modul.kategori === filter;
}
