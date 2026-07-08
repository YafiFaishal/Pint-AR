/**
 * Konstanta visual optik — sinkronkan dengan src/lib/light-optics-visual.ts
 */
export const OPTICS_TABLE_HEIGHT = 0.05;
export const OPTICS_INTERFACE_Y = OPTICS_TABLE_HEIGHT + 0.22;
export const OPTICS_RAY_LEN = 0.38;
export const OPTICS_RAY_RADIUS = 0.005;

export const OPTICS_COLORS = {
  incident: 0xf59e0b,
  reflected: 0x3b82f6,
  refracted: 0x10b981,
  normal: 0x94a3b8,
  mirror: 0xcbd5e1,
  table: 0x94a3b8,
  tableTop: 0xe2e8f0,
  interface: 0xf1f5f9,
};

export const MEDIUM_VISUAL = {
  udara: {
    blockColor: 0xf8fafc,
    blockOpacity: 0.05,
    blockRoughness: 0.85,
    blockMetalness: 0,
    zoneColor: 0xffffff,
    zoneOpacity: 0.02,
  },
  air: {
    blockColor: 0x7dd3fc,
    blockOpacity: 0.24,
    blockRoughness: 0.1,
    blockMetalness: 0.02,
    zoneColor: 0xe0f2fe,
    zoneOpacity: 0.14,
  },
  akrilik: {
    blockColor: 0x67e8f9,
    blockOpacity: 0.34,
    blockRoughness: 0.07,
    blockMetalness: 0.03,
    zoneColor: 0xcffafe,
    zoneOpacity: 0.18,
  },
  kaca: {
    blockColor: 0xcbd5e1,
    blockOpacity: 0.4,
    blockRoughness: 0.05,
    blockMetalness: 0.04,
    zoneColor: 0xe2e8f0,
    zoneOpacity: 0.12,
  },
};

export const FLASHLIGHT_DIM = {
  bodyLength: 0.09,
  bodyRadiusBack: 0.024,
  bodyRadiusFront: 0.028,
  headLength: 0.028,
  headRadius: 0.032,
  lensRadius: 0.022,
  lensDepth: 0.012,
  ringRadius: 0.03,
};

export const FLASHLIGHT_COLORS = {
  body: 0x1e293b,
  grip: 0x334155,
  head: 0x475569,
  lens: 0xfbbf24,
  lensEmissive: 0xf59e0b,
};
