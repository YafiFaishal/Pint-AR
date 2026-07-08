import type { OpticalMediumId } from "./light-optics-utils";

/** Konstanta geometri scene — sinkronkan dengan scripts/light-optics-visual.mjs untuk AR. */
export const OPTICS_TABLE_HEIGHT = 0.05;
export const OPTICS_INTERFACE_Y = OPTICS_TABLE_HEIGHT + 0.22;
export const OPTICS_RAY_LEN = 0.38;
export const OPTICS_RAY_RADIUS = 0.005;

export const OPTICS_COLORS = {
  incident: "#f59e0b",
  reflected: "#3b82f6",
  refracted: "#10b981",
  normal: "#94a3b8",
  mirror: "#cbd5e1",
  table: "#94a3b8",
  tableTop: "#e2e8f0",
  interface: "#f1f5f9",
} as const;

export type MediumVisual = {
  blockColor: string;
  blockOpacity: number;
  blockRoughness: number;
  blockMetalness: number;
  zoneColor: string;
  zoneOpacity: number;
};

/** Material halus per medium — perbedaan subtle tapi terbaca. */
export const MEDIUM_VISUAL: Record<OpticalMediumId, MediumVisual> = {
  udara: {
    blockColor: "#f8fafc",
    blockOpacity: 0.05,
    blockRoughness: 0.85,
    blockMetalness: 0,
    zoneColor: "#ffffff",
    zoneOpacity: 0.02,
  },
  air: {
    blockColor: "#7dd3fc",
    blockOpacity: 0.24,
    blockRoughness: 0.1,
    blockMetalness: 0.02,
    zoneColor: "#e0f2fe",
    zoneOpacity: 0.14,
  },
  akrilik: {
    blockColor: "#67e8f9",
    blockOpacity: 0.34,
    blockRoughness: 0.07,
    blockMetalness: 0.03,
    zoneColor: "#cffafe",
    zoneOpacity: 0.18,
  },
  kaca: {
    blockColor: "#cbd5e1",
    blockOpacity: 0.4,
    blockRoughness: 0.05,
    blockMetalness: 0.04,
    zoneColor: "#e2e8f0",
    zoneOpacity: 0.12,
  },
};

export function mediumVisual(id: OpticalMediumId): MediumVisual {
  return MEDIUM_VISUAL[id];
}

/** Dimensi senter (sumbu panjang = +X lokal, mengarah ke titik datang). */
export const FLASHLIGHT_DIM = {
  bodyLength: 0.09,
  bodyRadiusBack: 0.024,
  bodyRadiusFront: 0.028,
  headLength: 0.028,
  headRadius: 0.032,
  lensRadius: 0.022,
  lensDepth: 0.012,
  ringRadius: 0.03,
} as const;

export const FLASHLIGHT_COLORS = {
  body: "#1e293b",
  grip: "#334155",
  head: "#475569",
  lens: "#fbbf24",
  lensEmissive: "#f59e0b",
} as const;
