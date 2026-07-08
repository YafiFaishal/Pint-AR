/** Sinkronkan dengan src/lib/simple-pendulum-visual.ts */
export const PENDULUM_TABLE_HEIGHT = 0.05;
export const PENDULUM_TABLE_WIDTH = 0.9;
export const PENDULUM_TABLE_DEPTH = 0.58;
export const PENDULUM_STAND_HEIGHT = 0.5;
export const PENDULUM_CROSSBAR_Y = PENDULUM_TABLE_HEIGHT + PENDULUM_STAND_HEIGHT;
export const PENDULUM_METER_TO_UNIT = 0.18;

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
};

export const PENDULUM_COLORS = {
  table: 0x9aa4b3,
  tableTop: 0xeef1f6,
  stand: 0x39414f,
  crossbar: 0x454e5e,
  joint: 0x2c333f,
  foot: 0x2b313c,
  clamp: 0x333b48,
  pivot: 0x222833,
  string: 0x0f1420,
  bob: 0x7c1420,
  bobCollar: 0x3f0c12,
  equilibrium: 0x94a3b8,
  arc: 0xf59e0b,
};

export function bobRadiusFromMass(massKg) {
  const m = Math.min(3, Math.max(0.25, massKg));
  return 0.042 + m * 0.005;
}
