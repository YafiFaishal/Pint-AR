/** Sinkronkan dengan src/lib/thermal-change-visual.ts (versi angka hex untuk three di Node). */
export const THERMAL_TABLE_HEIGHT = 0.05;
export const THERMAL_TABLE_WIDTH = 0.95;
export const THERMAL_TABLE_DEPTH = 0.6;

export const THERMAL_VIS_TEMP_MIN = 25;
export const THERMAL_VIS_TEMP_MAX = 90;

export const THERMAL_COLORS = {
  table: 0x9aa4b3,
  tableTop: 0xeef1f6,
  tableEdge: 0x7c8698,
  hotPlateBody: 0x23272f,
  hotPlateBodyEdge: 0x33383f,
  hotPlateSurface: 0x15181d,
  hotPlateActive: 0x3a1c12,
  hotPlateGlow: 0xe04a12,
  hotPlateGlowHot: 0xff7a2a,
  indicatorOff: 0x3d4657,
  indicatorOn: 0xf97316,
  beaker: 0xdbe6f2,
  beakerRim: 0xc3d2e2,
  steam: 0xeef2f7,
  probeBody: 0xcbd5e1,
  probeStem: 0x334155,
  probeTip: 0x94a3b8,
  probeDisplay: 0x1e293b,
};

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
};

/** Progress visual 0..1 dari suhu. */
export function heatProgress(temperatureC) {
  const span = THERMAL_VIS_TEMP_MAX - THERMAL_VIS_TEMP_MIN;
  const p = (temperatureC - THERMAL_VIS_TEMP_MIN) / span;
  return Math.min(1, Math.max(0, p));
}

/** Profil visual tiap zat (mirror THERMAL_MATERIAL_VISUAL). */
export const THERMAL_MATERIAL_VISUAL = {
  water: {
    state: "liquid",
    coolColor: 0x4aa3f0,
    warmColor: 0x86c5ff,
    metalness: 0.0,
    roughness: 0.12,
    opacity: 0.62,
    emissiveWarm: 0x123a63,
    emissiveMaxIntensity: 0.12,
    bubble: { maxCount: 6, minRadius: 0.0035, maxRadius: 0.0075 },
    steam: { maxOpacity: 0.32 },
  },
  oil: {
    state: "liquid",
    coolColor: 0xd98a1f,
    warmColor: 0xf2b23e,
    metalness: 0.02,
    roughness: 0.26,
    opacity: 0.8,
    emissiveWarm: 0xa8560d,
    emissiveMaxIntensity: 0.14,
    bubble: { maxCount: 4, minRadius: 0.005, maxRadius: 0.012 },
    steam: { maxOpacity: 0.2 },
  },
  aluminum: {
    state: "solid",
    coolColor: 0xc2c9d2,
    warmColor: 0xe2e6ec,
    metalness: 0.82,
    roughness: 0.34,
    emissiveWarm: 0x5a3016,
    emissiveMaxIntensity: 0.16,
  },
  copper: {
    state: "solid",
    coolColor: 0xb4652f,
    warmColor: 0xe88a3e,
    metalness: 0.84,
    roughness: 0.28,
    emissiveWarm: 0x6e2408,
    emissiveMaxIntensity: 0.24,
  },
};

/** Nama file AR per zat (mengikuti contoh pengguna: aluminium ejaan Inggris). */
export const THERMAL_AR_FILE = {
  water: "heat-water-ar",
  oil: "heat-oil-ar",
  aluminum: "heat-aluminium-ar",
  copper: "heat-copper-ar",
};
