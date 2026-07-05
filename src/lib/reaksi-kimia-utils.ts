/** Jenis simulasi reaksi kimia. */
export type JenisReaksi = "netralisasi" | "eksoterm" | "indikator";

export const BATAS_VOLUME = { min: 10, max: 100 } as const;

export type HasilReaksi = {
  ph: number;
  suhu: number;
  warna: string;
  labelWarna: string;
  status: string;
};

export function namaJenisReaksi(jenis: JenisReaksi): string {
  switch (jenis) {
    case "netralisasi":
      return "Netralisasi";
    case "eksoterm":
      return "Eksoterm";
    case "indikator":
      return "Indikator pH";
  }
}

/** Warna indikator universal dari nilai pH (visual edukatif). */
export function warnaDariPh(ph: number): string {
  if (ph < 4) return "#ef4444";
  if (ph < 6) return "#f97316";
  if (ph < 8) return "#22c55e";
  if (ph < 10) return "#3b82f6";
  return "#8b5cf6";
}

export function labelWarnaDariPh(ph: number): string {
  if (ph < 4) return "Merah";
  if (ph < 6) return "Oranye";
  if (ph < 8) return "Hijau";
  if (ph < 10) return "Biru";
  return "Ungu";
}

/** Kondisi awal sebelum pencampuran. */
export function hitungKondisiAwal(jenis: JenisReaksi): HasilReaksi {
  const phAwal =
    jenis === "netralisasi" ? 2.5 : jenis === "eksoterm" ? 4.0 : 3.0;
  return {
    ph: phAwal,
    suhu: 25,
    warna: warnaDariPh(phAwal),
    labelWarna: labelWarnaDariPh(phAwal),
    status: "Siap dicampur",
  };
}

/**
 * Hasil setelah larutan A dan B dicampur.
 * Tidak akurat secara kimia — fokus visual edukatif.
 */
export function hitungHasilReaksi(
  volumeA: number,
  volumeB: number,
  jenis: JenisReaksi,
): HasilReaksi {
  const total = volumeA + volumeB;
  const rasioB = volumeB / total;

  switch (jenis) {
    case "netralisasi": {
      const ph = 7 + ((volumeB - volumeA) / total) * 2.5;
      const phClamp = Math.min(7.8, Math.max(6.2, ph));
      const suhu = 25 + (total / 200) * 10;
      return {
        ph: phClamp,
        suhu,
        warna: warnaDariPh(phClamp),
        labelWarna: labelWarnaDariPh(phClamp),
        status: "Netral",
      };
    }
    case "eksoterm": {
      const suhu = 25 + (total / 110) * 22;
      const ph = 6.2;
      return {
        ph,
        suhu,
        warna: "#f97316",
        labelWarna: "Panas",
        status: "Eksoterm",
      };
    }
    case "indikator": {
      const ph = 2.5 + rasioB * 9;
      const phClamp = Math.min(11.5, Math.max(2.5, ph));
      return {
        ph: phClamp,
        suhu: 25 + rasioB * 4,
        warna: warnaDariPh(phClamp),
        labelWarna: labelWarnaDariPh(phClamp),
        status: "Indikator",
      };
    }
  }
}

/** Warna larutan A dan B sebelum dicampur. */
export function warnaLarutanAwal(jenis: JenisReaksi): {
  warnaA: string;
  warnaB: string;
} {
  switch (jenis) {
    case "netralisasi":
      return { warnaA: "#ef4444", warnaB: "#3b82f6" };
    case "eksoterm":
      return { warnaA: "#f97316", warnaB: "#eab308" };
    case "indikator":
      return { warnaA: "#ef4444", warnaB: "#8b5cf6" };
  }
}
