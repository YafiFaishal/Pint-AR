/** Mode eksperimen optik. */
export type LightMode = "reflection" | "refraction";

export type OpticalMediumId = "udara" | "air" | "akrilik" | "kaca";

export type OpticalMedium = {
  id: OpticalMediumId;
  label: string;
  refractiveIndex: number;
};

export type LightOpticsInput = {
  mode: LightMode;
  incidentAngleDeg: number;
  medium1Index: number;
  medium2Index: number;
};

export type RefractionDirection =
  | "same"
  | "toward-normal"
  | "away-from-normal"
  | "total-internal-reflection";

export type LightOpticsResult = {
  incidentAngleDeg: number;
  reflectedAngleDeg: number;
  refractedAngleDeg: number | null;
  criticalAngleDeg: number | null;
  totalInternalReflection: boolean;
  directionDescription: RefractionDirection;
};

export const BATAS_SUDUT = {
  min: 0,
  max: 75,
  step: 1,
  default: 30,
} as const;

export const MODE_DEFAULT: LightMode = "refraction";

export const PILIHAN_MEDIUM: OpticalMedium[] = [
  { id: "udara", label: "Udara", refractiveIndex: 1.0 },
  { id: "air", label: "Air", refractiveIndex: 1.33 },
  { id: "akrilik", label: "Akrilik", refractiveIndex: 1.49 },
  { id: "kaca", label: "Kaca", refractiveIndex: 1.5 },
];

export const DEFAULT_MEDIUM1: OpticalMediumId = "udara";
export const DEFAULT_MEDIUM2: OpticalMediumId = "kaca";

const ASIN_EPS = 1e-10;

export function degreesToRadians(deg: number): number {
  if (!Number.isFinite(deg)) return 0;
  return (deg * Math.PI) / 180;
}

export function radiansToDegrees(rad: number): number {
  if (!Number.isFinite(rad)) return 0;
  return (rad * 180) / Math.PI;
}

export function clampAngle(deg: number): number {
  return Math.min(BATAS_SUDUT.max, Math.max(BATAS_SUDUT.min, sanitizeFinite(deg)));
}

function sanitizeFinite(value: number, fallback = 0): number {
  if (!Number.isFinite(value)) return fallback;
  return value;
}

export function sanitizeRefractiveIndex(n: number): number {
  const v = sanitizeFinite(n);
  if (v <= 0) return 1;
  return v;
}

function safeAsin(x: number): number {
  const c = Math.max(-1, Math.min(1, x));
  if (Math.abs(c) < ASIN_EPS) return 0;
  return Math.asin(c);
}

/** θ pantul = θ datang */
export function calculateReflectionAngle(incidentAngleDeg: number): number {
  return clampAngle(incidentAngleDeg);
}

/** θ₂ = arcsin((n₁/n₂) × sin(θ₁)) — null jika di luar domain asin. */
export function calculateRefractionAngle(
  incidentAngleDeg: number,
  n1: number,
  n2: number,
): number | null {
  const theta1 = degreesToRadians(clampAngle(incidentAngleDeg));
  const idx1 = sanitizeRefractiveIndex(n1);
  const idx2 = sanitizeRefractiveIndex(n2);

  if (Math.abs(idx1 - idx2) < 1e-9) {
    return clampAngle(incidentAngleDeg);
  }

  const sinTheta2 = (idx1 / idx2) * Math.sin(theta1);
  if (Math.abs(sinTheta2) > 1 + 1e-9) return null;

  return clampAngle(radiansToDegrees(safeAsin(sinTheta2)));
}

/** θ kritis = arcsin(n₂/n₁) — hanya jika n₁ > n₂. */
export function calculateCriticalAngle(n1: number, n2: number): number | null {
  const idx1 = sanitizeRefractiveIndex(n1);
  const idx2 = sanitizeRefractiveIndex(n2);
  if (idx1 <= idx2) return null;

  const ratio = idx2 / idx1;
  if (ratio >= 1) return null;
  return clampAngle(radiansToDegrees(safeAsin(ratio)));
}

export function isTotalInternalReflection(
  incidentAngleDeg: number,
  n1: number,
  n2: number,
): boolean {
  const critical = calculateCriticalAngle(n1, n2);
  if (critical === null) return false;
  return clampAngle(incidentAngleDeg) > critical + 1e-9;
}

export function determineRefractionDirection(
  n1: number,
  n2: number,
  totalInternalReflection: boolean,
): RefractionDirection {
  if (totalInternalReflection) return "total-internal-reflection";

  const idx1 = sanitizeRefractiveIndex(n1);
  const idx2 = sanitizeRefractiveIndex(n2);

  if (Math.abs(idx1 - idx2) < 1e-9) return "same";
  if (idx2 > idx1) return "toward-normal";
  return "away-from-normal";
}

export function calculateLightOpticsResult(
  input: LightOpticsInput,
): LightOpticsResult {
  const incidentAngleDeg = clampAngle(input.incidentAngleDeg);
  const n1 = sanitizeRefractiveIndex(input.medium1Index);
  const n2 = sanitizeRefractiveIndex(input.medium2Index);
  const reflectedAngleDeg = calculateReflectionAngle(incidentAngleDeg);
  const criticalAngleDeg = calculateCriticalAngle(n1, n2);

  if (input.mode === "reflection") {
    return {
      incidentAngleDeg,
      reflectedAngleDeg,
      refractedAngleDeg: null,
      criticalAngleDeg: null,
      totalInternalReflection: false,
      directionDescription: "same",
    };
  }

  const tir = isTotalInternalReflection(incidentAngleDeg, n1, n2);
  const refractedAngleDeg = tir
    ? null
    : calculateRefractionAngle(incidentAngleDeg, n1, n2);

  const directionDescription = determineRefractionDirection(n1, n2, tir);

  return {
    incidentAngleDeg,
    reflectedAngleDeg,
    refractedAngleDeg,
    criticalAngleDeg,
    totalInternalReflection: tir,
    directionDescription,
  };
}

export function formatAngle(deg: number | null): string {
  if (deg === null || !Number.isFinite(deg)) return "—";
  return `${deg.toFixed(1)}°`;
}

export function refractiveIndexFromMedium(id: OpticalMediumId): number {
  return (
    PILIHAN_MEDIUM.find((m) => m.id === id)?.refractiveIndex ?? 1
  );
}

export function labelMedium(id: OpticalMediumId): string {
  return PILIHAN_MEDIUM.find((m) => m.id === id)?.label ?? "Udara";
}

export function labelRefractionDirection(
  dir: RefractionDirection,
): string {
  switch (dir) {
    case "same":
      return "Tidak berbelok";
    case "toward-normal":
      return "Mendekati normal";
    case "away-from-normal":
      return "Menjauhi normal";
    case "total-internal-reflection":
      return "Pemantulan total";
  }
}

export function lightOpticsResultStripDetail(
  result: LightOpticsResult,
  mode: LightMode,
  medium1Label: string,
  medium2Label: string,
  n1: number,
  n2: number,
): { label: string; value: string; detail: string; status: string } {
  if (mode === "reflection") {
    return {
      label: "Sudut pantul",
      value: formatAngle(result.reflectedAngleDeg),
      detail: `θ datang ${formatAngle(result.incidentAngleDeg)} · θ pantul ${formatAngle(result.reflectedAngleDeg)}`,
      status: "Sudut datang sama dengan sudut pantul.",
    };
  }

  if (result.totalInternalReflection) {
    return {
      label: "Status",
      value: "Pemantulan total",
      detail: `θ datang ${formatAngle(result.incidentAngleDeg)} · θ kritis ${formatAngle(result.criticalAngleDeg)}`,
      status: "Tidak terbentuk sinar bias.",
    };
  }

  if (result.directionDescription === "same") {
    return {
      label: "Sudut bias",
      value: formatAngle(result.refractedAngleDeg),
      detail: `${medium1Label} ${n1.toFixed(2)} → ${medium2Label} ${n2.toFixed(2)}`,
      status:
        "Tidak terjadi pembelokan karena kedua medium memiliki indeks bias yang sama.",
    };
  }

  const arah =
    result.directionDescription === "toward-normal"
      ? "Cahaya dibiaskan mendekati garis normal."
      : "Cahaya dibiaskan menjauhi garis normal.";

  return {
    label: "Sudut bias",
    value: formatAngle(result.refractedAngleDeg),
    detail: `${medium1Label} ${n1.toFixed(2)} → ${medium2Label} ${n2.toFixed(2)}`,
    status: arah,
  };
}

export function quickInfoReflection(result: LightOpticsResult) {
  return [
    {
      key: "theta-i",
      label: "θ datang",
      value: formatAngle(result.incidentAngleDeg),
    },
    {
      key: "theta-r",
      label: "θ pantul",
      value: formatAngle(result.reflectedAngleDeg),
    },
    { key: "hukum", label: "Hukum", value: "θi = θr" },
    { key: "status", label: "Status", value: "Dipantulkan" },
  ];
}

export function quickInfoRefraction(
  result: LightOpticsResult,
  n1: number,
  n2: number,
) {
  return [
    {
      key: "theta-i",
      label: "θ datang",
      value: formatAngle(result.incidentAngleDeg),
    },
    {
      key: "theta-b",
      label: "θ bias",
      value: result.totalInternalReflection
        ? "—"
        : formatAngle(result.refractedAngleDeg),
    },
    {
      key: "n",
      label: "n₁ → n₂",
      value: `${n1.toFixed(2)} → ${n2.toFixed(2)}`,
    },
    {
      key: "status",
      label: "Status",
      value: labelRefractionDirection(result.directionDescription),
    },
  ];
}
