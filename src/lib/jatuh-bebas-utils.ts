/** Mode lingkungan jatuh bebas. */
export type ModeJatuh = "udara" | "hampa";

/** Faktor gravitasi efektif di udara (simulasi sederhana, tanpa drag kompleks). */
export const FAKTOR_GRAVITASI_UDARA = 0.9;

export const BATAS_TINGGI = { min: 1, max: 20 } as const;
export const BATAS_GRAVITASI = { min: 1.6, max: 24.8 } as const;

export function gravitasiEfektif(g: number, mode: ModeJatuh): number {
  return mode === "udara" ? g * FAKTOR_GRAVITASI_UDARA : g;
}

/** Waktu jatuh: t = √(2h / g). */
export function hitungWaktuJatuh(h: number, g: number, mode: ModeJatuh): number {
  const ge = gravitasiEfektif(g, mode);
  if (ge <= 0 || h <= 0) return 0;
  return Math.sqrt((2 * h) / ge);
}

/** Kecepatan akhir: v = √(2gh). */
export function hitungKecepatanAkhir(h: number, g: number, mode: ModeJatuh): number {
  const ge = gravitasiEfektif(g, mode);
  if (ge <= 0 || h <= 0) return 0;
  return Math.sqrt(2 * ge * h);
}

/** Kecepatan pada detik ke-t selama jatuh. */
export function hitungKecepatanSaatIni(
  g: number,
  mode: ModeJatuh,
  elapsed: number,
): number {
  return gravitasiEfektif(g, mode) * Math.max(0, elapsed);
}
