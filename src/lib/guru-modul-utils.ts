import type { Modul } from "@/db/schema";
import {
  getKategoriModul,
  type KategoriModul,
} from "@/lib/siswa-modul-utils";

export type StatusModulGuru =
  | "Perlu dinilai"
  | "Ada progres"
  | "Sudah dinilai"
  | "Belum ada aktivitas";

export type FilterModulGuru =
  | "Semua"
  | "Perlu dinilai"
  | "Ada progres"
  | "Sudah dinilai"
  | "Belum dimulai"
  | KategoriModul;

export type StatSiswaModul = {
  dijawab: number;
  dinilaiCount: number;
  totalSkor: number;
};

export function hitungStatSiswaModul(
  totalSoal: number,
  stat: StatSiswaModul,
): {
  selesai: boolean;
  sudahDinilai: boolean;
  menungguNilai: boolean;
} {
  const dijawab = stat.dijawab;
  const dinilaiCount = stat.dinilaiCount;
  const selesai = totalSoal > 0 && dijawab >= totalSoal;
  const sudahDinilai = dijawab > 0 && dinilaiCount >= dijawab;
  const menungguNilai = selesai && !sudahDinilai;
  return { selesai, sudahDinilai, menungguNilai };
}

export function hitungStatusModulGuru(input: {
  jumlahSiswaAktif: number;
  menungguNilai: number;
  lksMasuk: number;
  sudahDinilaiCount: number;
}): StatusModulGuru {
  const { jumlahSiswaAktif, menungguNilai, lksMasuk, sudahDinilaiCount } =
    input;

  if (menungguNilai > 0) return "Perlu dinilai";
  if (jumlahSiswaAktif === 0) return "Belum ada aktivitas";
  if (lksMasuk > 0 && sudahDinilaiCount >= lksMasuk) return "Sudah dinilai";
  if (jumlahSiswaAktif > 0) return "Ada progres";
  return "Belum ada aktivitas";
}

export function ringkasanStatusModul(
  status: StatusModulGuru,
  input: {
    menungguNilai: number;
    lksMasuk: number;
    sudahDinilaiCount: number;
    jumlahSiswaAktif: number;
  },
): string {
  if (status === "Perlu dinilai") {
    return `${input.menungguNilai} LKS menunggu penilaian`;
  }
  if (status === "Sudah dinilai") {
    return `${input.sudahDinilaiCount} dari ${input.lksMasuk} LKS sudah dinilai.`;
  }
  if (status === "Ada progres") {
    return `${input.jumlahSiswaAktif} siswa sedang mengerjakan.`;
  }
  return "Belum ada siswa yang memulai.";
}

export function cocokFilterGuru(
  modul: { kategori: KategoriModul; status: StatusModulGuru },
  filter: FilterModulGuru,
): boolean {
  if (filter === "Semua") return true;
  if (filter === "Perlu dinilai") return modul.status === "Perlu dinilai";
  if (filter === "Ada progres") return modul.status === "Ada progres";
  if (filter === "Sudah dinilai") return modul.status === "Sudah dinilai";
  if (filter === "Belum dimulai") return modul.status === "Belum ada aktivitas";
  return modul.kategori === filter;
}

export function statusBadgeVariant(
  status: StatusModulGuru,
): "default" | "secondary" | "outline" {
  if (status === "Perlu dinilai") return "default";
  if (status === "Sudah dinilai") return "secondary";
  return "outline";
}

export { getKategoriModul };
