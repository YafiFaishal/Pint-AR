/** Konstanta visual scene kalor — sinkronkan dengan scripts/thermal-change-visual.mjs */

import type { ThermalMaterialId } from "@/lib/thermal-change-utils";

export const THERMAL_TABLE_HEIGHT = 0.05;
export const THERMAL_TABLE_WIDTH = 0.95;
export const THERMAL_TABLE_DEPTH = 0.6;

/** Rentang suhu yang dipakai untuk memetakan progress visual (bukan fisika). */
export const THERMAL_VIS_TEMP_MIN = 25;
export const THERMAL_VIS_TEMP_MAX = 90;

export const THERMAL_COLORS = {
  table: "#9aa4b3",
  tableTop: "#eef1f6",
  tableEdge: "#7c8698",
  hotPlateBody: "#23272f",
  hotPlateBodyEdge: "#33383f",
  hotPlateSurface: "#15181d",
  hotPlateActive: "#3a1c12",
  hotPlateGlow: "#e04a12",
  hotPlateGlowHot: "#ff7a2a",
  indicatorOff: "#3d4657",
  indicatorOn: "#f97316",
  beaker: "#dbe6f2",
  beakerRim: "#c3d2e2",
  steam: "#eef2f7",
  probeBody: "#cbd5e1",
  probeStem: "#334155",
  probeTip: "#94a3b8",
  probeDisplay: "#1e293b",
  // Warna lama (dipertahankan untuk kompatibilitas).
  water: "#4aa3f0",
  waterWarm: "#7cc0ff",
  oil: "#d98a1f",
  oilWarm: "#f0b03a",
  aluminum: "#c2c9d2",
  aluminumWarm: "#dfe4ea",
  copper: "#b4652f",
  copperWarm: "#e08a3c",
  probe: "#334155",
} as const;

export const THERMAL_DIM = {
  hotPlateWidth: 0.24,
  hotPlateHeight: 0.045,
  hotPlateDepth: 0.24,
  hotPlateBevel: 0.01,
  ringOuter: 0.085,
  ringInner: 0.058,
  footRadius: 0.012,
  footHeight: 0.012,
  beakerRadius: 0.072,
  beakerHeight: 0.145,
  beakerWall: 0.004,
  liquidHeight: 0.104,
  blockWidth: 0.13,
  blockHeight: 0.075,
  blockDepth: 0.09,
  blockBevel: 0.008,
  probeRadius: 0.0035,
  probeLength: 0.12,
  comparisonOffsetX: 0.24,
} as const;

/** Progress visual 0..1 dari suhu (dipakai hanya untuk tampilan). */
export function heatProgress(temperatureC: number): number {
  const span = THERMAL_VIS_TEMP_MAX - THERMAL_VIS_TEMP_MIN;
  const p = (temperatureC - THERMAL_VIS_TEMP_MIN) / span;
  return Math.min(1, Math.max(0, p));
}

/** Smoothstep 0..1 di antara edge0 dan edge1. */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge0 === edge1) return x < edge0 ? 0 : 1;
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export type BubbleProfile = {
  maxCount: number;
  minRadius: number;
  maxRadius: number;
  riseSpeed: number;
  /** Progress saat gelembung mulai muncul. */
  startProgress: number;
};

export type SteamProfile = {
  startProgress: number;
  maxOpacity: number;
  driftSpeed: number;
};

export type MaterialVisual = {
  state: "liquid" | "solid";
  /** Warna saat dingin & saat panas — di-lerp berdasarkan progress. */
  coolColor: string;
  warmColor: string;
  metalness: number;
  roughness: number;
  /** Cairan: opacity dasar. */
  opacity?: number;
  /** Tint emissive hangat + intensitas maksimum (halus). */
  emissiveWarm?: string;
  emissiveMaxIntensity?: number;
  bubble?: BubbleProfile;
  steam?: SteamProfile;
};

export const THERMAL_MATERIAL_VISUAL: Record<ThermalMaterialId, MaterialVisual> = {
  water: {
    state: "liquid",
    coolColor: "#4aa3f0",
    warmColor: "#86c5ff",
    metalness: 0.0,
    roughness: 0.12,
    opacity: 0.52,
    emissiveWarm: "#123a63",
    emissiveMaxIntensity: 0.12,
    bubble: {
      maxCount: 14,
      minRadius: 0.003,
      maxRadius: 0.0075,
      riseSpeed: 0.055,
      startProgress: 0.26,
    },
    steam: { startProgress: 0.5, maxOpacity: 0.3, driftSpeed: 0.05 },
  },
  oil: {
    state: "liquid",
    coolColor: "#d98a1f",
    warmColor: "#f2b23e",
    metalness: 0.02,
    roughness: 0.26,
    opacity: 0.74,
    emissiveWarm: "#a8560d",
    emissiveMaxIntensity: 0.14,
    bubble: {
      maxCount: 8,
      minRadius: 0.005,
      maxRadius: 0.012,
      riseSpeed: 0.032,
      startProgress: 0.34,
    },
    steam: { startProgress: 0.62, maxOpacity: 0.18, driftSpeed: 0.035 },
  },
  aluminum: {
    state: "solid",
    coolColor: "#c2c9d2",
    warmColor: "#e2e6ec",
    metalness: 0.82,
    roughness: 0.34,
    emissiveWarm: "#5a3016",
    emissiveMaxIntensity: 0.14,
  },
  copper: {
    state: "solid",
    coolColor: "#b4652f",
    warmColor: "#e88a3e",
    metalness: 0.84,
    roughness: 0.28,
    emissiveWarm: "#6e2408",
    emissiveMaxIntensity: 0.22,
  },
};

/* -------- helper lama (kompatibilitas) -------- */

/** Warna cairan berdasarkan suhu (25–90°C). */
export function liquidColor(
  materialId: "water" | "oil",
  temperatureC: number,
  active: boolean,
): string {
  const t = Math.min(90, Math.max(25, temperatureC));
  const factor = (t - 25) / 65;
  if (materialId === "water") {
    return active && factor > 0.3 ? THERMAL_COLORS.waterWarm : THERMAL_COLORS.water;
  }
  return active && factor > 0.2 ? THERMAL_COLORS.oilWarm : THERMAL_COLORS.oil;
}

/** Warna logam berdasarkan suhu. */
export function solidColor(
  materialId: "aluminum" | "copper",
  temperatureC: number,
): string {
  const t = Math.min(90, Math.max(25, temperatureC));
  const warm = (t - 25) / 65 > 0.35;
  if (materialId === "aluminum") {
    return warm ? THERMAL_COLORS.aluminumWarm : THERMAL_COLORS.aluminum;
  }
  return warm ? THERMAL_COLORS.copperWarm : THERMAL_COLORS.copper;
}

export function steamOpacity(temperatureC: number, heaterActive: boolean): number {
  if (!heaterActive || temperatureC < 60) return 0;
  return Math.min(0.35, ((temperatureC - 60) / 30) * 0.35);
}
