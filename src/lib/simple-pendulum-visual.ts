/** Konstanta visual scene bandul — sinkronkan dengan scripts/simple-pendulum-visual.mjs */

/** Alas / meja praktikum. */
export const PENDULUM_TABLE_HEIGHT = 0.05;
export const PENDULUM_TABLE_WIDTH = 0.9;
export const PENDULUM_TABLE_DEPTH = 0.58;

/** Tinggi kolom penyangga (dari atas alas ke palang). */
export const PENDULUM_STAND_HEIGHT = 0.5;

/** Ketinggian titik gantung (pivot) dari lantai. */
export const PENDULUM_CROSSBAR_Y = PENDULUM_TABLE_HEIGHT + PENDULUM_STAND_HEIGHT;

/**
 * Skala meter → unit scene. Dijaga agar bandul terpanjang (2 m) tetap
 * menggantung di atas alas tanpa menembusnya.
 */
export const PENDULUM_METER_TO_UNIT = 0.18;

/** Dimensi rangka penyangga (kaki + palang). */
export const PENDULUM_DIM = {
  postX: 0.2,
  postRadius: 0.019,
  footRadius: 0.05,
  footHeight: 0.02,
  crossbarRadius: 0.023,
  crossbarLength: 0.52,
  jointRadius: 0.028,
  pivotRadius: 0.015,
  clampWidth: 0.036,
  clampHeight: 0.05,
  clampDepth: 0.04,
  stringRadius: 0.0018,
  collarRadius: 0.007,
  collarHeight: 0.012,
} as const;

export const PENDULUM_COLORS = {
  table: "#9aa4b3",
  tableTop: "#eef1f6",
  stand: "#39414f",
  crossbar: "#454e5e",
  joint: "#2c333f",
  foot: "#2b313c",
  clamp: "#333b48",
  pivot: "#222833",
  string: "#0f1420",
  bob: "#7c1420",
  bobCollar: "#3f0c12",
  equilibrium: "#94a3b8",
  arc: "#f59e0b",
} as const;

/** Radius bandul dasar + skala halus massa. */
export function bobRadiusFromMass(massKg: number): number {
  const m = Math.min(3, Math.max(0.25, massKg));
  return 0.042 + m * 0.005;
}
