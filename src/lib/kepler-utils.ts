/**
 * Perhitungan edukatif Hukum Kepler — T² ∝ r³ (satuan relatif).
 * T = √(r³) — semakin jauh dari Matahari, periode semakin panjang.
 */

export type PlanetId = "merkurius" | "bumi" | "mars" | "jupiter";

export const PLANET_INFO: Record<
  PlanetId,
  { label: string; warna: string; ukuran: number; jarakAwal: number }
> = {
  merkurius: {
    label: "Merkurius",
    warna: "#8b7355",
    ukuran: 0.055,
    jarakAwal: 0.72,
  },
  bumi: {
    label: "Bumi",
    warna: "#2563eb",
    ukuran: 0.065,
    jarakAwal: 1.1,
  },
  mars: {
    label: "Mars",
    warna: "#d45c2a",
    ukuran: 0.06,
    jarakAwal: 1.48,
  },
  jupiter: {
    label: "Jupiter",
    warna: "#c98b3d",
    ukuran: 0.11,
    jarakAwal: 2.35,
  },
};

export const PLANET_IDS = Object.keys(PLANET_INFO) as PlanetId[];

export const JARAK_ORBIT_MIN = 0.55;
export const JARAK_ORBIT_MAX = 3.0;

/** Periode orbit relatif: T = √(r³) */
export function hitungPeriodeRelatif(r: number): number {
  return Math.sqrt(r ** 3);
}

export function jarakOrbitAwal(): Record<PlanetId, number> {
  return Object.fromEntries(
    PLANET_IDS.map((id) => [id, PLANET_INFO[id].jarakAwal]),
  ) as Record<PlanetId, number>;
}
