/** Jenis zat untuk eksperimen kalor. */
export type ThermalMaterialId = "water" | "oil" | "aluminum" | "copper";

export type ThermalExperimentMode = "heating" | "comparison";

export type ThermalInput = {
  materialId: ThermalMaterialId;
  massKg: number;
  initialTemperatureC: number;
  heaterPowerW: number;
  efficiency: number;
  elapsedTimeS: number;
};

export type ThermalMaterial = {
  id: ThermalMaterialId;
  name: string;
  specificHeatJkgC: number;
  state: "liquid" | "solid";
};

export type ThermalResult = {
  effectiveEnergyJ: number;
  temperatureChangeC: number;
  currentTemperatureC: number;
  heatingRateCPerS: number;
  timeToTargetS: number | null;
};

export const THERMAL_MATERIALS: ThermalMaterial[] = [
  { id: "water", name: "Air", specificHeatJkgC: 4186, state: "liquid" },
  { id: "oil", name: "Minyak", specificHeatJkgC: 2000, state: "liquid" },
  { id: "aluminum", name: "Aluminium", specificHeatJkgC: 900, state: "solid" },
  { id: "copper", name: "Tembaga", specificHeatJkgC: 385, state: "solid" },
];

export const BATAS_MASSA = {
  min: 0.1,
  max: 1.0,
  step: 0.05,
  default: 0.5,
} as const;

export const BATAS_DAYA = {
  min: 100,
  max: 1000,
  step: 50,
  default: 500,
} as const;

export const BATAS_SUHU_AWAL = {
  min: 20,
  max: 40,
  step: 1,
  default: 25,
} as const;

export const SUHU_MAKSIMUM_C = 90;
export const EFISIENSI_DEFAULT = 0.85;

export const SIM_SPEED_OPTIONS = [1, 5, 10] as const;
export type SimSpeedMultiplier = (typeof SIM_SPEED_OPTIONS)[number];
export const SIM_SPEED_DEFAULT: SimSpeedMultiplier = 5;

function sanitizeFinite(value: number, fallback = 0): number {
  if (!Number.isFinite(value)) return fallback;
  return value;
}

export function getThermalMaterial(id: ThermalMaterialId): ThermalMaterial {
  return (
    THERMAL_MATERIALS.find((m) => m.id === id) ?? THERMAL_MATERIALS[0]
  );
}

export function sanitizeMass(kg: number): number {
  return Math.min(
    BATAS_MASSA.max,
    Math.max(BATAS_MASSA.min, sanitizeFinite(kg, BATAS_MASSA.default)),
  );
}

export function sanitizePower(w: number): number {
  return Math.min(
    BATAS_DAYA.max,
    Math.max(BATAS_DAYA.min, sanitizeFinite(w, BATAS_DAYA.default)),
  );
}

export function sanitizeTemperature(c: number): number {
  return Math.min(
    SUHU_MAKSIMUM_C,
    Math.max(
      BATAS_SUHU_AWAL.min,
      sanitizeFinite(c, BATAS_SUHU_AWAL.default),
    ),
  );
}

export function sanitizeEfficiency(eta: number): number {
  const v = sanitizeFinite(eta, EFISIENSI_DEFAULT);
  return Math.min(1, Math.max(0.01, v));
}

/** Qefektif = η P t */
export function calculateEffectiveHeatEnergy(
  powerW: number,
  elapsedTimeS: number,
  efficiency: number,
): number {
  const P = sanitizePower(powerW);
  const t = Math.max(0, sanitizeFinite(elapsedTimeS, 0));
  const eta = sanitizeEfficiency(efficiency);
  const q = eta * P * t;
  return Number.isFinite(q) ? q : 0;
}

/** ΔT = Q / (mc) */
export function calculateTemperatureChange(
  energyJ: number,
  massKg: number,
  specificHeatJkgC: number,
): number {
  const m = sanitizeMass(massKg);
  const c = Math.max(1, sanitizeFinite(specificHeatJkgC, 4186));
  const q = Math.max(0, sanitizeFinite(energyJ, 0));
  const dT = q / (m * c);
  return Number.isFinite(dT) ? dT : 0;
}

/** T = T₀ + ΔT, dibatasi maksimum eksperimen */
export function calculateCurrentTemperature(
  initialTemperatureC: number,
  temperatureChangeC: number,
): number {
  const t0 = sanitizeTemperature(initialTemperatureC);
  const dT = Math.max(0, sanitizeFinite(temperatureChangeC, 0));
  return clampExperimentTemperature(t0 + dT);
}

export function clampExperimentTemperature(c: number): number {
  if (!Number.isFinite(c)) return BATAS_SUHU_AWAL.default;
  return Math.min(SUHU_MAKSIMUM_C, Math.max(BATAS_SUHU_AWAL.min, c));
}

/** Laju pemanasan dT/dt = ηP / (mc) */
export function calculateHeatingRate(
  powerW: number,
  massKg: number,
  specificHeatJkgC: number,
  efficiency: number,
): number {
  const m = sanitizeMass(massKg);
  const c = Math.max(1, sanitizeFinite(specificHeatJkgC, 4186));
  const P = sanitizePower(powerW);
  const eta = sanitizeEfficiency(efficiency);
  const rate = (eta * P) / (m * c);
  return Number.isFinite(rate) && rate > 0 ? rate : 0;
}

/** t = mc(Ttarget - T₀) / (ηP) */
export function calculateTimeToTarget(
  massKg: number,
  specificHeatJkgC: number,
  initialTemperatureC: number,
  targetTemperatureC: number,
  powerW: number,
  efficiency: number,
): number | null {
  const m = sanitizeMass(massKg);
  const c = Math.max(1, sanitizeFinite(specificHeatJkgC, 4186));
  const t0 = sanitizeTemperature(initialTemperatureC);
  const target = clampExperimentTemperature(targetTemperatureC);
  const delta = target - t0;
  if (delta <= 0) return 0;
  const P = sanitizePower(powerW);
  const eta = sanitizeEfficiency(efficiency);
  const denom = eta * P;
  if (denom <= 0) return null;
  const t = (m * c * delta) / denom;
  return Number.isFinite(t) && t > 0 ? t : null;
}

export function calculateThermalResult(input: ThermalInput): ThermalResult {
  const mat = getThermalMaterial(input.materialId);
  const m = sanitizeMass(input.massKg);
  const t0 = sanitizeTemperature(input.initialTemperatureC);
  const eta = sanitizeEfficiency(input.efficiency);
  const energy = calculateEffectiveHeatEnergy(
    input.heaterPowerW,
    input.elapsedTimeS,
    eta,
  );
  const dT = calculateTemperatureChange(energy, m, mat.specificHeatJkgC);
  const currentT = calculateCurrentTemperature(t0, dT);
  const rate = calculateHeatingRate(
    input.heaterPowerW,
    m,
    mat.specificHeatJkgC,
    eta,
  );
  const timeToMax = calculateTimeToTarget(
    m,
    mat.specificHeatJkgC,
    t0,
    SUHU_MAKSIMUM_C,
    input.heaterPowerW,
    eta,
  );

  return {
    effectiveEnergyJ: energy,
    temperatureChangeC: currentT - t0,
    currentTemperatureC: currentT,
    heatingRateCPerS: rate,
    timeToTargetS: timeToMax,
  };
}

export function formatTemperature(c: number): string {
  if (!Number.isFinite(c)) return "—";
  return `${c.toFixed(1)}°C`;
}

export function formatEnergy(j: number): string {
  if (!Number.isFinite(j)) return "—";
  if (j >= 1000) return `${(j / 1000).toFixed(1)} kJ`;
  return `${j.toFixed(0)} J`;
}

export function formatSpecificHeat(c: number): string {
  if (!Number.isFinite(c)) return "—";
  return `${c.toFixed(0)}`;
}

export function formatSpecificHeatUnit(): string {
  return "J/kg°C";
}

export function formatHeatingRate(rate: number): string {
  if (!Number.isFinite(rate) || rate <= 0) return "—";
  return `${rate.toFixed(2)}°C/s`;
}

export function formatTime(s: number): string {
  if (!Number.isFinite(s) || s < 0) return "0 s";
  if (s >= 60) {
    const m = Math.floor(s / 60);
    const sec = Math.round(s % 60);
    return sec > 0 ? `${m}m ${sec}s` : `${m}m`;
  }
  return `${Math.round(s)} s`;
}

export function heatingResultStripDetail(
  result: ThermalResult,
  material: ThermalMaterial,
): { label: string; value: string; detail: string; status: string } {
  return {
    label: "Suhu saat ini",
    value: formatTemperature(result.currentTemperatureC),
    detail: "Q = mcΔT",
    status: `${material.name} memiliki kalor jenis ${material.specificHeatJkgC} J/kg°C.`,
  };
}

export function comparisonResultStripDetail(
  materialA: ThermalMaterial,
  materialB: ThermalMaterial,
  tempA: number,
  tempB: number,
): { label: string; value: string; detail: string; status: string } {
  const diff = Math.abs(tempA - tempB);
  const faster =
    tempA > tempB
      ? materialA.name
      : tempB > tempA
        ? materialB.name
        : "Sama";

  if (materialA.id === materialB.id) {
    return {
      label: "Zat perbandingan",
      value: "—",
      detail: "Pilih dua zat berbeda",
      status: "Pilih dua zat berbeda untuk membandingkan.",
    };
  }

  const fasterMat = tempA >= tempB ? materialA : materialB;
  return {
    label: "Zat lebih cepat panas",
    value: faster,
    detail: `Selisih suhu: ${diff.toFixed(1)}°C`,
    status: `${fasterMat.name} mengalami kenaikan suhu lebih cepat karena kalor jenisnya lebih kecil.`,
  };
}

export function quickInfoHeating(
  result: ThermalResult,
  material: ThermalMaterial,
  elapsedSimS: number,
) {
  return [
    {
      key: "temp",
      label: "Suhu",
      value: formatTemperature(result.currentTemperatureC),
    },
    {
      key: "energy",
      label: "Energi",
      value: formatEnergy(result.effectiveEnergyJ),
    },
    {
      key: "time",
      label: "Waktu",
      value: formatTime(elapsedSimS),
    },
    {
      key: "c",
      label: "Kalor jenis",
      value: formatSpecificHeat(material.specificHeatJkgC),
      valueClassName: "text-[clamp(0.72rem,2.8vw,0.95rem)] sm:text-[13px]",
    },
  ];
}

export function quickInfoComparison(
  tempA: number,
  tempB: number,
  elapsedSimS: number,
) {
  return [
    {
      key: "tempA",
      label: "Suhu A",
      value: formatTemperature(tempA),
    },
    {
      key: "tempB",
      label: "Suhu B",
      value: formatTemperature(tempB),
    },
    {
      key: "diff",
      label: "Selisih",
      value: `${Math.abs(tempA - tempB).toFixed(1)}°C`,
    },
    {
      key: "time",
      label: "Waktu",
      value: formatTime(elapsedSimS),
    },
  ];
}
