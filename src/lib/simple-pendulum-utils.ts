/** Preset lingkungan gravitasi. */
export type GravityPresetId = "moon" | "mars" | "earth" | "jupiter";

export type PendulumInput = {
  lengthM: number;
  massKg: number;
  initialAngleDeg: number;
  gravityMs2: number;
  damping: number;
};

export type PendulumResult = {
  periodS: number;
  frequencyHz: number;
  angularFrequencyRadS: number;
  maxHeightM: number;
  maxPotentialEnergyJ: number;
};

export const BATAS_PANJANG = {
  min: 0.25,
  max: 2.0,
  step: 0.05,
  default: 1.0,
} as const;

export const BATAS_MASSA = {
  min: 0.25,
  max: 3.0,
  step: 0.25,
  default: 1.0,
} as const;

export const BATAS_SUDUT_AWAL = {
  min: 5,
  max: 20,
  step: 1,
  default: 15,
} as const;

/** Redaman internal ringan agar ayunan terlihat alami. */
export const DAMPING_DEFAULT = 0.06;

export const GRAVITY_PRESETS: {
  id: GravityPresetId;
  label: string;
  gravityMs2: number;
}[] = [
  { id: "moon", label: "Bulan", gravityMs2: 1.62 },
  { id: "mars", label: "Mars", gravityMs2: 3.71 },
  { id: "earth", label: "Bumi", gravityMs2: 9.8 },
  { id: "jupiter", label: "Jupiter", gravityMs2: 24.79 },
];

export const DEFAULT_GRAVITY_PRESET: GravityPresetId = "earth";

export function degreesToRadians(deg: number): number {
  if (!Number.isFinite(deg)) return 0;
  return (deg * Math.PI) / 180;
}

export function radiansToDegrees(rad: number): number {
  if (!Number.isFinite(rad)) return 0;
  return (rad * 180) / Math.PI;
}

function sanitizeFinite(value: number, fallback = 0): number {
  if (!Number.isFinite(value)) return fallback;
  return value;
}

export function clampPendulumLength(m: number): number {
  return Math.min(
    BATAS_PANJANG.max,
    Math.max(BATAS_PANJANG.min, sanitizeFinite(m, BATAS_PANJANG.default)),
  );
}

export function clampInitialAngle(deg: number): number {
  return Math.min(
    BATAS_SUDUT_AWAL.max,
    Math.max(BATAS_SUDUT_AWAL.min, sanitizeFinite(deg, BATAS_SUDUT_AWAL.default)),
  );
}

export function sanitizeGravity(g: number): number {
  const v = sanitizeFinite(g, 9.8);
  return v > 0 ? v : 9.8;
}

export function sanitizeMass(kg: number): number {
  return Math.min(
    BATAS_MASSA.max,
    Math.max(BATAS_MASSA.min, sanitizeFinite(kg, BATAS_MASSA.default)),
  );
}

export function getGravityPreset(id: GravityPresetId): number {
  return (
    GRAVITY_PRESETS.find((p) => p.id === id)?.gravityMs2 ?? 9.8
  );
}

export function labelGravityPreset(id: GravityPresetId): string {
  return GRAVITY_PRESETS.find((p) => p.id === id)?.label ?? "Bumi";
}

/** T = 2π √(L/g) */
export function calculatePendulumPeriod(
  lengthM: number,
  gravityMs2: number,
): number {
  const L = clampPendulumLength(lengthM);
  const g = sanitizeGravity(gravityMs2);
  const T = 2 * Math.PI * Math.sqrt(L / g);
  return Number.isFinite(T) && T > 0 ? T : 0;
}

export function calculatePendulumFrequency(
  lengthM: number,
  gravityMs2: number,
): number {
  const T = calculatePendulumPeriod(lengthM, gravityMs2);
  if (T <= 0) return 0;
  const f = 1 / T;
  return Number.isFinite(f) ? f : 0;
}

export function calculateAngularFrequency(
  lengthM: number,
  gravityMs2: number,
): number {
  const L = clampPendulumLength(lengthM);
  const g = sanitizeGravity(gravityMs2);
  const w = Math.sqrt(g / L);
  return Number.isFinite(w) ? w : 0;
}

export function calculateMaximumHeight(
  lengthM: number,
  initialAngleDeg: number,
): number {
  const L = clampPendulumLength(lengthM);
  const rad = degreesToRadians(clampInitialAngle(initialAngleDeg));
  const h = L * (1 - Math.cos(rad));
  return Number.isFinite(h) && h >= 0 ? h : 0;
}

export function calculateMaximumPotentialEnergy(
  massKg: number,
  lengthM: number,
  initialAngleDeg: number,
  gravityMs2: number,
): number {
  const m = sanitizeMass(massKg);
  const g = sanitizeGravity(gravityMs2);
  const h = calculateMaximumHeight(lengthM, initialAngleDeg);
  const Ep = m * g * h;
  return Number.isFinite(Ep) ? Ep : 0;
}

export function calculatePendulumResult(input: PendulumInput): PendulumResult {
  const lengthM = clampPendulumLength(input.lengthM);
  const gravityMs2 = sanitizeGravity(input.gravityMs2);
  const massKg = sanitizeMass(input.massKg);
  const initialAngleDeg = clampInitialAngle(input.initialAngleDeg);

  return {
    periodS: calculatePendulumPeriod(lengthM, gravityMs2),
    frequencyHz: calculatePendulumFrequency(lengthM, gravityMs2),
    angularFrequencyRadS: calculateAngularFrequency(lengthM, gravityMs2),
    maxHeightM: calculateMaximumHeight(lengthM, initialAngleDeg),
    maxPotentialEnergyJ: calculateMaximumPotentialEnergy(
      massKg,
      lengthM,
      initialAngleDeg,
      gravityMs2,
    ),
  };
}

/** Sudut θ(t) dalam radian — redaman ringan opsional. */
export function calculatePendulumAngleAtTime(
  initialAngleDeg: number,
  angularFrequencyRadS: number,
  elapsedTime: number,
  damping = 0,
): number {
  const theta0 = degreesToRadians(clampInitialAngle(initialAngleDeg));
  const w = sanitizeFinite(angularFrequencyRadS);
  const t = Math.max(0, sanitizeFinite(elapsedTime));
  const beta = Math.max(0, sanitizeFinite(damping));

  let theta: number;
  if (beta > 0) {
    theta = theta0 * Math.exp(-beta * t) * Math.cos(w * t);
  } else {
    theta = theta0 * Math.cos(w * t);
  }

  return Number.isFinite(theta) ? theta : 0;
}

/** Posisi ujung bandul relatif pivot (bidang X-Y). */
export function calculatePendulumPosition(
  lengthM: number,
  angleRad: number,
): { x: number; y: number } {
  const L = clampPendulumLength(lengthM);
  const a = sanitizeFinite(angleRad);
  return {
    x: L * Math.sin(a),
    y: -L * Math.cos(a),
  };
}

export function completedOscillations(
  elapsedTime: number,
  periodS: number,
): number {
  const t = Math.max(0, sanitizeFinite(elapsedTime));
  const T = sanitizeFinite(periodS);
  if (T <= 0) return 0;
  return Math.floor(t / T);
}

export function formatPeriod(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "—";
  return `${seconds.toFixed(2)} s`;
}

export function formatFrequency(hz: number): string {
  if (!Number.isFinite(hz) || hz <= 0) return "—";
  return `${hz.toFixed(2)} Hz`;
}

export function formatLengthM(m: number): string {
  if (!Number.isFinite(m)) return "—";
  return `${m.toFixed(2)} m`;
}

export function formatMassKg(kg: number): string {
  if (!Number.isFinite(kg)) return "—";
  return `${kg.toFixed(2)} kg`;
}

export function formatElapsedTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0.0 s";
  return `${seconds.toFixed(1)} s`;
}

export function pendulumResultStripDetail(
  result: PendulumResult,
  lengthM: number,
  gravityMs2: number,
  massChanged?: boolean,
): { label: string; value: string; detail: string; status: string } {
  return {
    label: "Periode teori",
    value: formatPeriod(result.periodS),
    detail: `L = ${formatLengthM(lengthM)} · g = ${gravityMs2.toFixed(1)} m/s²`,
    status: massChanged
      ? "Massa berubah, tetapi periode tetap sama pada bandul ideal."
      : "Massa tidak memengaruhi periode bandul ideal.",
  };
}

export function quickInfoPendulum(
  lengthM: number,
  result: PendulumResult,
  oscillations: number,
) {
  return [
    { key: "length", label: "Panjang", value: formatLengthM(lengthM) },
    { key: "period", label: "Periode", value: formatPeriod(result.periodS) },
    {
      key: "frequency",
      label: "Frekuensi",
      value: formatFrequency(result.frequencyHz),
    },
    { key: "osc", label: "Getaran", value: String(oscillations) },
  ];
}
