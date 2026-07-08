/** Kondisi apung benda dalam cairan. */
export type BuoyancyCondition = "floating" | "suspended" | "sinking";

export type JenisCairan = "minyak" | "air" | "air-garam";

export type BentukBenda = "kubus" | "bola";

export type ArchimedesInput = {
  massKg: number;
  volumeM3: number;
  liquidDensityKgM3: number;
  gravity?: number;
};

export type ArchimedesResult = {
  objectDensityKgM3: number;
  liquidDensityKgM3: number;
  weightN: number;
  buoyantForceN: number;
  netForceN: number;
  submergedVolumeM3: number;
  submergedFraction: number;
  condition: BuoyancyCondition;
};

export const GRAVITY_DEFAULT = 9.8;

/** Toleransi relatif ~2% untuk kondisi melayang. */
export const SUSPENDED_TOLERANCE = 0.02;

export const BATAS_MASSA = { min: 0.5, max: 3.0, step: 0.1, default: 1.0 } as const;

export const BATAS_VOLUME = {
  min: 0.001,
  max: 0.003,
  step: 0.0001,
  default: 0.002,
} as const;

export const PILIHAN_CAIRAN: {
  id: JenisCairan;
  label: string;
  densityKgM3: number;
}[] = [
  { id: "minyak", label: "Minyak", densityKgM3: 800 },
  { id: "air", label: "Air", densityKgM3: 1000 },
  { id: "air-garam", label: "Air garam", densityKgM3: 1200 },
];

export function densityFromJenisCairan(jenis: JenisCairan): number {
  return PILIHAN_CAIRAN.find((c) => c.id === jenis)?.densityKgM3 ?? 1000;
}

export function labelJenisCairan(jenis: JenisCairan): string {
  return PILIHAN_CAIRAN.find((c) => c.id === jenis)?.label ?? "Air";
}

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function sanitizePositive(value: number, fallback = 0): number {
  if (!Number.isFinite(value) || value < 0) return fallback;
  return value;
}

/** ρ benda = m / V */
export function calculateObjectDensity(massKg: number, volumeM3: number): number {
  const m = sanitizePositive(massKg);
  const v = sanitizePositive(volumeM3);
  if (v <= 0) return 0;
  return m / v;
}

/** W = m × g */
export function calculateWeight(massKg: number, gravity = GRAVITY_DEFAULT): number {
  const m = sanitizePositive(massKg);
  const g = sanitizePositive(gravity, GRAVITY_DEFAULT);
  return m * g;
}

/** Fₐ = ρ cairan × g × V tercelup */
export function calculateBuoyantForce(
  liquidDensityKgM3: number,
  submergedVolumeM3: number,
  gravity = GRAVITY_DEFAULT,
): number {
  const rho = sanitizePositive(liquidDensityKgM3);
  const v = sanitizePositive(submergedVolumeM3);
  const g = sanitizePositive(gravity, GRAVITY_DEFAULT);
  return rho * g * v;
}

/** Fraksi volume tercelup pada keseimbangan. */
export function calculateSubmergedFraction(
  objectDensityKgM3: number,
  liquidDensityKgM3: number,
  condition: BuoyancyCondition,
): number {
  const rhoObj = sanitizePositive(objectDensityKgM3);
  const rhoLiq = sanitizePositive(liquidDensityKgM3);
  if (rhoLiq <= 0) return 0;

  if (condition === "floating") {
    return clamp(rhoObj / rhoLiq, 0, 1);
  }
  return 1;
}

/** Tentukan kondisi terapung / melayang / tenggelam. */
export function determineBuoyancyCondition(
  objectDensityKgM3: number,
  liquidDensityKgM3: number,
  tolerance = SUSPENDED_TOLERANCE,
): BuoyancyCondition {
  const rhoObj = sanitizePositive(objectDensityKgM3);
  const rhoLiq = sanitizePositive(liquidDensityKgM3);
  if (rhoLiq <= 0) return "sinking";

  const ratio = rhoObj / rhoLiq;
  if (ratio < 1 - tolerance) return "floating";
  if (ratio <= 1 + tolerance) return "suspended";
  return "sinking";
}

export function calculateArchimedesResult(input: ArchimedesInput): ArchimedesResult {
  const gravity = sanitizePositive(input.gravity ?? GRAVITY_DEFAULT, GRAVITY_DEFAULT);
  const massKg = sanitizePositive(input.massKg);
  const volumeM3 = sanitizePositive(input.volumeM3);
  const liquidDensityKgM3 = sanitizePositive(input.liquidDensityKgM3);

  const objectDensityKgM3 = calculateObjectDensity(massKg, volumeM3);
  const condition = determineBuoyancyCondition(
    objectDensityKgM3,
    liquidDensityKgM3,
  );
  const submergedFraction = calculateSubmergedFraction(
    objectDensityKgM3,
    liquidDensityKgM3,
    condition,
  );
  const submergedVolumeM3 = volumeM3 > 0 ? volumeM3 * submergedFraction : 0;

  const weightN = calculateWeight(massKg, gravity);

  let buoyantForceN: number;
  if (condition === "floating" || condition === "suspended") {
    buoyantForceN = weightN;
  } else {
    buoyantForceN = calculateBuoyantForce(
      liquidDensityKgM3,
      volumeM3,
      gravity,
    );
  }

  const netForceN = buoyantForceN - weightN;

  return {
    objectDensityKgM3,
    liquidDensityKgM3,
    weightN,
    buoyantForceN,
    netForceN,
    submergedVolumeM3,
    submergedFraction,
    condition,
  };
}

export function labelKondisi(condition: BuoyancyCondition): string {
  switch (condition) {
    case "floating":
      return "Terapung";
    case "suspended":
      return "Melayang";
    case "sinking":
      return "Tenggelam";
  }
}

export function formatDensity(kgM3: number): string {
  if (!Number.isFinite(kgM3)) return "—";
  return `${Math.round(kgM3)} kg/m³`;
}

export function formatForce(newtons: number): string {
  if (!Number.isFinite(newtons)) return "—";
  return `${newtons.toFixed(1)} N`;
}

export function formatVolumeM3(volumeM3: number): string {
  if (!Number.isFinite(volumeM3)) return "—";
  return `${volumeM3.toFixed(4)} m³`;
}

export function formatSubmergedPercent(fraction: number): string {
  if (!Number.isFinite(fraction)) return "—";
  return `${Math.round(fraction * 100)}%`;
}

/** Detail ringkas untuk result strip. */
export function archimedesResultStripDetail(result: ArchimedesResult): string {
  const w = formatForce(result.weightN);
  const fa = formatForce(result.buoyantForceN);

  switch (result.condition) {
    case "floating":
      return `${formatSubmergedPercent(result.submergedFraction)} volume benda tercelup`;
    case "suspended":
      return "Massa jenis benda ≈ massa jenis cairan";
    case "sinking":
      return "Gaya resultan mengarah ke bawah";
    default:
      return `W ${w} · Fₐ ${fa}`;
  }
}

/** Ukuran benda dalam meter (tinggi kubus atau diameter bola). */
export function objectHeightMeters(volumeM3: number, bentuk: BentukBenda): number {
  const v = sanitizePositive(volumeM3);
  if (v <= 0) return 0.1;

  if (bentuk === "kubus") {
    return Math.cbrt(v);
  }
  const radius = Math.pow((3 * v) / (4 * Math.PI), 1 / 3);
  return radius * 2;
}
