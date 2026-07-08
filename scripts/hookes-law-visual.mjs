/** Sinkronkan dengan src/lib/hookes-law-visual.ts (versi web = source of truth) */
export const SPRING_TABLE_HEIGHT = 0.05;
export const SPRING_TABLE_WIDTH = 0.9;
export const SPRING_TABLE_DEPTH = 0.58;
export const SPRING_STAND_HEIGHT = 0.5;
export const SPRING_ANCHOR_Y = SPRING_TABLE_HEIGHT + SPRING_STAND_HEIGHT;
export const SPRING_METER_TO_UNIT = 0.32;

export const SPRING_NATURAL_LENGTH_M = 0.5;
export const SPRING_NATURAL_VIS = SPRING_NATURAL_LENGTH_M * SPRING_METER_TO_UNIT;

export const SPRING_BASE_TOP_Y = SPRING_TABLE_HEIGHT;
export const SPRING_TOP_ANCHOR_Y = SPRING_ANCHOR_Y;
export const SPRING_TOP_CONNECTOR_LEN = 0.026;
export const SPRING_TOP_Y = SPRING_TOP_ANCHOR_Y - SPRING_TOP_CONNECTOR_LEN;
export const SPRING_BOTTOM_HOOK_LEN = 0.022;
export const SPRING_SAFETY_CLEARANCE = 0.03;
export const SPRING_MIN_LENGTH_VIS = 0.06;

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
};

export const SPRING_COLORS = {
  table: 0x9aa4b3,
  tableTop: 0xeef1f6,
  stand: 0x39414f,
  crossbar: 0x454e5e,
  joint: 0x2c333f,
  foot: 0x2b313c,
  clamp: 0x333b48,
  anchor: 0x222833,
  spring: 0x4a5568,
  mass: 0x7c1420,
  massCollar: 0x3f0c12,
  hook: 0x334155,
  ruler: 0x94a3b8,
  equilibrium: 0x64748b,
  weightArrow: 0xdc2626,
  springArrow: 0x2563eb,
};

export function massRadiusFromKg(massKg) {
  const m = Math.min(3, Math.max(0.25, massKg));
  return 0.038 + m * 0.005;
}

export function massHeightFromKg(massKg) {
  const m = Math.min(3, Math.max(0.25, massKg));
  return 0.055 + m * 0.012;
}
