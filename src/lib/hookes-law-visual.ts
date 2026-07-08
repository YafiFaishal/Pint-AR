/** Konstanta visual scene pegas — sinkronkan dengan scripts/hookes-law-visual.mjs */

export const SPRING_TABLE_HEIGHT = 0.05;
export const SPRING_TABLE_WIDTH = 0.9;
export const SPRING_TABLE_DEPTH = 0.58;
export const SPRING_STAND_HEIGHT = 0.5;
export const SPRING_ANCHOR_Y = SPRING_TABLE_HEIGHT + SPRING_STAND_HEIGHT;
export const SPRING_METER_TO_UNIT = 0.32;

/** Panjang alami pegas dalam unit scene (dari titik pengait atas). */
export const SPRING_NATURAL_LENGTH_M = 0.5;
export const SPRING_NATURAL_VIS = SPRING_NATURAL_LENGTH_M * SPRING_METER_TO_UNIT;

/** Titik-titik acuan vertikal tetap (tidak boleh bergerak saat gravitasi berubah). */
export const SPRING_BASE_TOP_Y = SPRING_TABLE_HEIGHT;
/** Pengait atas tetap tepat di bawah balok/crossbar. */
export const SPRING_TOP_ANCHOR_Y = SPRING_ANCHOR_Y;
/** Panjang connector pendek dari pengait atas menuju coil pertama. */
export const SPRING_TOP_CONNECTOR_LEN = 0.026;
/** Y coil teratas pegas (tetap). */
export const SPRING_TOP_Y = SPRING_TOP_ANCHOR_Y - SPRING_TOP_CONNECTOR_LEN;
/** Panjang pengait bawah antara coil terakhir dan beban. */
export const SPRING_BOTTOM_HOOK_LEN = 0.022;
/** Jarak aman minimal antara dasar beban dan permukaan alas. */
export const SPRING_SAFETY_CLEARANCE = 0.03;

export const SPRING_DIM = {
  postX: 0.2,
  postRadius: 0.019,
  footRadius: 0.05,
  footHeight: 0.02,
  crossbarRadius: 0.023,
  crossbarLength: 0.52,
  jointRadius: 0.028,
  clampWidth: 0.036,
  clampHeight: 0.05,
  clampDepth: 0.04,
  coilRadius: 0.022,
  wireRadius: 0.0032,
  coilTurns: 11,
  hookHeight: 0.018,
  topConnectorRadius: 0.006,
  bottomHookRadius: 0.005,
  eyeletRadius: 0.012,
  eyeletTube: 0.0035,
  rulerX: 0.14,
} as const;

/** Panjang pegas minimum agar coil tidak terbalik/terkompresi ekstrem. */
export const SPRING_MIN_LENGTH_VIS = 0.06;

export const SPRING_COLORS = {
  table: "#9aa4b3",
  tableTop: "#eef1f6",
  stand: "#39414f",
  crossbar: "#454e5e",
  joint: "#2c333f",
  foot: "#2b313c",
  clamp: "#333b48",
  anchor: "#222833",
  spring: "#4a5568",
  mass: "#7c1420",
  massCollar: "#3f0c12",
  hook: "#334155",
  ruler: "#94a3b8",
  equilibrium: "#64748b",
  weightArrow: "#dc2626",
  springArrow: "#2563eb",
} as const;

export function massRadiusFromKg(massKg: number): number {
  const m = Math.min(3, Math.max(0.25, massKg));
  return 0.038 + m * 0.005;
}

export function massHeightFromKg(massKg: number): number {
  const m = Math.min(3, Math.max(0.25, massKg));
  return 0.055 + m * 0.012;
}
