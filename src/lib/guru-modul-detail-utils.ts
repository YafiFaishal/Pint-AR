export type SiswaModulRow = {
  id: string;
  nama: string;
  email: string;
  dijawab: number;
  totalSoal: number;
  status: string;
  sudahDinilai: boolean;
};

export type RekapSiswaRow = {
  id: string;
  nama: string;
  totalSkor: number | null;
  status: string;
};

export type StatusSiswaDetail =
  | "Belum mulai"
  | "Sedang dipelajari"
  | "Selesai"
  | "Perlu dinilai"
  | "Sudah dinilai";

export type FilterSiswaDetail =
  | "Semua"
  | "Perlu dinilai"
  | "Selesai"
  | "Mengerjakan"
  | "Sudah dinilai";

export type FilterRekapDetail = "Semua" | "Sudah dinilai" | "Belum dinilai";

export type TabModulDetail = "siswa" | "rekap";

/** Skor per soal 0–100; totalSkor di API adalah jumlah poin mentah. */
export function maxPoinModul(totalSoal: number): number {
  return Math.max(0, totalSoal) * 100;
}

export function nilaiAkhirDariTotal(
  totalSkor: number | null,
  totalSoal: number,
): number | null {
  if (totalSkor === null || totalSoal <= 0) return null;
  return Math.round(totalSkor / totalSoal);
}

export function formatNilaiAkhir(
  totalSkor: number | null,
  totalSoal: number,
): string {
  const nilai = nilaiAkhirDariTotal(totalSkor, totalSoal);
  return nilai !== null ? String(nilai) : "—";
}

export function formatPoinMentah(
  totalSkor: number | null,
  totalSoal: number,
): string | null {
  if (totalSkor === null || totalSoal <= 0) return null;
  const max = maxPoinModul(totalSoal);
  return `${totalSkor}/${max} poin`;
}

export function hitungPersenProgres(dijawab: number, totalSoal: number): number {
  if (totalSoal <= 0) return 0;
  return Math.min(100, Math.round((dijawab / totalSoal) * 100));
}

export function deriveStatusSiswa(s: SiswaModulRow): StatusSiswaDetail {
  const selesai =
    s.totalSoal > 0 && s.dijawab >= s.totalSoal;
  if (s.dijawab === 0) return "Belum mulai";
  if (s.sudahDinilai) return "Sudah dinilai";
  if (selesai) return "Perlu dinilai";
  if (s.dijawab > 0) return "Sedang dipelajari";
  return "Belum mulai";
}

export function statusBadgesSiswa(
  status: StatusSiswaDetail,
): StatusSiswaDetail[] {
  switch (status) {
    case "Sudah dinilai":
      return ["Selesai", "Sudah dinilai"];
    case "Perlu dinilai":
      return ["Selesai", "Perlu dinilai"];
    case "Sedang dipelajari":
      return ["Sedang dipelajari"];
    case "Selesai":
      return ["Selesai"];
    default:
      return ["Belum mulai"];
  }
}

export function tombolAksiSiswa(status: StatusSiswaDetail): {
  label: string;
  disabled: boolean;
} {
  switch (status) {
    case "Belum mulai":
      return { label: "Belum ada progres", disabled: true };
    case "Sedang dipelajari":
      return { label: "Lihat Progres", disabled: false };
    case "Perlu dinilai":
      return { label: "Periksa LKS", disabled: false };
    case "Sudah dinilai":
      return { label: "Lihat Penilaian", disabled: false };
    default:
      return { label: "Periksa LKS", disabled: false };
  }
}

export function ringkasanSiswaModul(siswa: SiswaModulRow[]) {
  let aktif = 0;
  let selesai = 0;
  let perluNilai = 0;

  for (const s of siswa) {
    const st = deriveStatusSiswa(s);
    if (st !== "Belum mulai") aktif += 1;
    if (st === "Selesai" || st === "Perlu dinilai" || st === "Sudah dinilai") {
      selesai += 1;
    }
    if (st === "Perlu dinilai") perluNilai += 1;
  }

  return { aktif, selesai, perluNilai };
}

export function cocokFilterSiswa(
  s: SiswaModulRow,
  filter: FilterSiswaDetail,
): boolean {
  const st = deriveStatusSiswa(s);
  if (filter === "Semua") return true;
  if (filter === "Perlu dinilai") return st === "Perlu dinilai";
  if (filter === "Selesai")
    return st === "Selesai" || st === "Perlu dinilai" || st === "Sudah dinilai";
  if (filter === "Mengerjakan") return st === "Sedang dipelajari";
  if (filter === "Sudah dinilai") return st === "Sudah dinilai";
  return true;
}

export function cocokFilterRekap(
  r: RekapSiswaRow,
  filter: FilterRekapDetail,
): boolean {
  if (filter === "Semua") return true;
  if (filter === "Sudah dinilai") return r.status === "Sudah Dinilai";
  if (filter === "Belum dinilai") return r.status !== "Sudah Dinilai";
  return true;
}

export function hitungRataRataKelas(
  rekap: RekapSiswaRow[],
  totalSoal: number,
): number | null {
  const nilai = rekap
    .filter((r) => r.totalSkor !== null)
    .map((r) => nilaiAkhirDariTotal(r.totalSkor, totalSoal))
    .filter((n): n is number => n !== null);

  if (nilai.length === 0) return null;
  return Number(
    (nilai.reduce((a, b) => a + b, 0) / nilai.length).toFixed(1),
  );
}

export function rekapCtaLabel(status: string): string {
  return status === "Sudah Dinilai" ? "Lihat Penilaian" : "Periksa LKS";
}
