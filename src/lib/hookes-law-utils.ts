/** Preset lingkungan gravitasi. */
export type GravityPresetId = "moon" | "mars" | "earth" | "jupiter";

export type SpringExperimentMode = "static" | "oscillation";

export type SpringInput = {
  springConstantNm: number;
  massKg: number;
  gravityMs2: number;
  initialAmplitudeM: number;
  naturalLengthM: number;
};

export type SpringResult = {
  weightN: number;
  equilibriumExtensionM: number;
  springForceN: number;
  periodS: number;
  frequencyHz: number;
  angularFrequencyRadS: number;
  elasticPotentialEnergyJ: number;
};

export const BATAS_KONSTANTA_PEGAS = {
  min: 20,
  max: 150,
  step: 5,
  default: 50,
} as const;

export const BATAS_MASSA = {
  min: 0.25,
  max: 3.0,
  step: 0.25,
  default: 1.0,
} as const;

export const BATAS_AMPLITUDO = {
  min: 0.02,
  max: 0.2,
  step: 0.01,
  default: 0.1,
} as const;

export const PANJANG_ALAMI_DEFAULT = 0.5;

/** Batas visual agar massa tidak menembus alas. */
export const MAX_VISUAL_EXTENSION_M = 0.42;

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

function sanitizeFinite(value: number, fallback = 0): number {
  if (!Number.isFinite(value)) return fallback;
  return value;
}

export function sanitizeSpringConstant(k: number): number {
  return Math.min(
    BATAS_KONSTANTA_PEGAS.max,
    Math.max(
      BATAS_KONSTANTA_PEGAS.min,
      sanitizeFinite(k, BATAS_KONSTANTA_PEGAS.default),
    ),
  );
}

export function sanitizeMass(kg: number): number {
  return Math.min(
    BATAS_MASSA.max,
    Math.max(BATAS_MASSA.min, sanitizeFinite(kg, BATAS_MASSA.default)),
  );
}

export function sanitizeGravity(g: number): number {
  const v = sanitizeFinite(g, 9.8);
  return v > 0 ? v : 9.8;
}

export function sanitizeAmplitude(m: number): number {
  return Math.min(
    BATAS_AMPLITUDO.max,
    Math.max(BATAS_AMPLITUDO.min, sanitizeFinite(m, BATAS_AMPLITUDO.default)),
  );
}

export function getGravityPreset(id: GravityPresetId): number {
  return GRAVITY_PRESETS.find((p) => p.id === id)?.gravityMs2 ?? 9.8;
}

export function labelGravityPreset(id: GravityPresetId): string {
  return GRAVITY_PRESETS.find((p) => p.id === id)?.label ?? "Bumi";
}

/** Gaya berat W = mg */
export function calculateWeight(massKg: number, gravityMs2: number): number {
  const m = sanitizeMass(massKg);
  const g = sanitizeGravity(gravityMs2);
  const w = m * g;
  return Number.isFinite(w) ? w : 0;
}

/** Pertambahan panjang pada setimbang x = mg/k */
export function calculateEquilibriumExtension(
  massKg: number,
  springConstantNm: number,
  gravityMs2: number,
): number {
  const k = sanitizeSpringConstant(springConstantNm);
  const w = calculateWeight(massKg, gravityMs2);
  const x = w / k;
  return Number.isFinite(x) && x >= 0 ? x : 0;
}

/** Gaya pegas Fₛ = kx */
export function calculateSpringForce(
  springConstantNm: number,
  extensionM: number,
): number {
  const k = sanitizeSpringConstant(springConstantNm);
  const x = Math.max(0, sanitizeFinite(extensionM, 0));
  const f = k * x;
  return Number.isFinite(f) ? f : 0;
}

/** T = 2π √(m/k) */
export function calculateSpringPeriod(
  massKg: number,
  springConstantNm: number,
): number {
  const m = sanitizeMass(massKg);
  const k = sanitizeSpringConstant(springConstantNm);
  const T = 2 * Math.PI * Math.sqrt(m / k);
  return Number.isFinite(T) && T > 0 ? T : 0;
}

export function calculateSpringFrequency(
  massKg: number,
  springConstantNm: number,
): number {
  const T = calculateSpringPeriod(massKg, springConstantNm);
  if (T <= 0) return 0;
  const f = 1 / T;
  return Number.isFinite(f) ? f : 0;
}

/** ω = √(k/m) */
export function calculateAngularFrequency(
  massKg: number,
  springConstantNm: number,
): number {
  const m = sanitizeMass(massKg);
  const k = sanitizeSpringConstant(springConstantNm);
  const omega = Math.sqrt(k / m);
  return Number.isFinite(omega) ? omega : 0;
}

/** Ep = ½kx² */
export function calculateElasticPotentialEnergy(
  springConstantNm: number,
  extensionM: number,
): number {
  const k = sanitizeSpringConstant(springConstantNm);
  const x = Math.max(0, sanitizeFinite(extensionM, 0));
  const e = 0.5 * k * x * x;
  return Number.isFinite(e) ? e : 0;
}

/** Posisi osilasi relatif setimbang: A cos(ωt) */
export function calculateOscillationDisplacement(
  amplitudeM: number,
  angularFrequencyRadS: number,
  elapsedTime: number,
): number {
  const A = sanitizeAmplitude(amplitudeM);
  const omega = sanitizeFinite(angularFrequencyRadS, 0);
  const t = Math.max(0, sanitizeFinite(elapsedTime, 0));
  const d = A * Math.cos(omega * t);
  return Number.isFinite(d) ? d : 0;
}

export function clampVisualExtension(extensionM: number): number {
  return Math.min(
    MAX_VISUAL_EXTENSION_M,
    Math.max(0, sanitizeFinite(extensionM, 0)),
  );
}

export function calculateSpringResult(input: SpringInput): SpringResult {
  const k = sanitizeSpringConstant(input.springConstantNm);
  const m = sanitizeMass(input.massKg);
  const g = sanitizeGravity(input.gravityMs2);
  const xEq = calculateEquilibriumExtension(m, k, g);
  const weightN = calculateWeight(m, g);
  const springForceN = calculateSpringForce(k, xEq);
  const periodS = calculateSpringPeriod(m, k);
  const frequencyHz = calculateSpringFrequency(m, k);
  const angularFrequencyRadS = calculateAngularFrequency(m, k);
  const elasticPotentialEnergyJ = calculateElasticPotentialEnergy(k, xEq);

  return {
    weightN,
    equilibriumExtensionM: xEq,
    springForceN,
    periodS,
    frequencyHz,
    angularFrequencyRadS,
    elasticPotentialEnergyJ,
  };
}

export function formatLengthMeters(m: number): string {
  if (!Number.isFinite(m)) return "—";
  return `${m.toFixed(2)} m`;
}

export function formatLengthCentimeters(m: number): string {
  if (!Number.isFinite(m)) return "—";
  return `${(m * 100).toFixed(1)} cm`;
}

export function formatForce(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return `${n.toFixed(1)} N`;
}

export function formatPeriod(s: number): string {
  if (!Number.isFinite(s) || s <= 0) return "—";
  return `${s.toFixed(2)} s`;
}

export function formatFrequency(hz: number): string {
  if (!Number.isFinite(hz) || hz <= 0) return "—";
  return `${hz.toFixed(2)} Hz`;
}

export function formatSpringConstant(k: number): string {
  if (!Number.isFinite(k)) return "—";
  return `${k.toFixed(0)} N/m`;
}

export function formatOscillationCount(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "0 kali";
  return `${Math.floor(n)} kali`;
}

export function staticResultStripDetail(
  result: SpringResult,
): { label: string; value: string; detail: string; status: string } {
  return {
    label: "Pertambahan panjang",
    value: formatLengthCentimeters(result.equilibriumExtensionM),
    detail: `F = kx = ${formatForce(result.springForceN)}`,
    status:
      "Pada posisi setimbang, gaya pegas sama dengan gaya berat.",
  };
}

export function oscillationResultStripDetail(
  result: SpringResult,
): { label: string; value: string; detail: string; status: string } {
  return {
    label: "Periode teori",
    value: formatPeriod(result.periodS),
    detail: "T = 2π√(m/k)",
    status:
      "Gravitasi mengubah posisi setimbang, tetapi tidak mengubah periode ideal.",
  };
}

export function quickInfoStatic(
  springConstantNm: number,
  massKg: number,
  result: SpringResult,
) {
  return [
    {
      key: "k",
      label: "Konstanta",
      value: formatSpringConstant(springConstantNm),
    },
    {
      key: "mass",
      label: "Massa",
      value: `${sanitizeMass(massKg).toFixed(2)} kg`,
    },
    {
      key: "extension",
      label: "Pertambahan",
      value: formatLengthCentimeters(result.equilibriumExtensionM),
    },
    {
      key: "force",
      label: "Gaya",
      value: formatForce(result.springForceN),
    },
  ];
}

export function quickInfoOscillation(
  springConstantNm: number,
  result: SpringResult,
  oscillations: number,
) {
  return [
    {
      key: "k",
      label: "Konstanta",
      value: formatSpringConstant(springConstantNm),
    },
    {
      key: "period",
      label: "Periode",
      value: formatPeriod(result.periodS),
    },
    {
      key: "frequency",
      label: "Frekuensi",
      value: formatFrequency(result.frequencyHz),
    },
    {
      key: "osc",
      label: "Getaran",
      value: formatOscillationCount(oscillations),
    },
  ];
}
