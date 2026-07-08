import {
  BATAS_DAYA,
  BATAS_MASSA,
  BATAS_SUHU_AWAL,
  EFISIENSI_DEFAULT,
  calculateCurrentTemperature,
  calculateEffectiveHeatEnergy,
  calculateHeatingRate,
  calculateTemperatureChange,
  calculateThermalResult,
} from "./thermal-change-utils";

function assertNear(actual: number, expected: number, tol: number, label: string) {
  if (Math.abs(actual - expected) > tol) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

function run() {
  const eta = 1; // 100% untuk unit test

  // Kasus 1: Air
  const q1 = calculateEffectiveHeatEnergy(500, 60, eta);
  assertNear(q1, 30000, 1, "kasus1 Q");
  const dT1 = calculateTemperatureChange(q1, 0.5, 4186);
  assertNear(dT1, 14.33, 0.1, "kasus1 ΔT");
  const t1 = calculateCurrentTemperature(25, dT1);
  assertNear(t1, 39.33, 0.15, "kasus1 T");

  // Kasus 2: Minyak
  const q2 = calculateEffectiveHeatEnergy(500, 60, eta);
  const dT2 = calculateTemperatureChange(q2, 0.5, 2000);
  assertNear(dT2, 30, 0.1, "kasus2 ΔT");
  assertNear(calculateCurrentTemperature(25, dT2), 55, 0.1, "kasus2 T");

  // Kasus 3: Aluminium
  const q3 = calculateEffectiveHeatEnergy(500, 30, eta);
  assertNear(q3, 15000, 1, "kasus3 Q");
  const dT3 = calculateTemperatureChange(q3, 0.5, 900);
  assertNear(dT3, 33.33, 0.15, "kasus3 ΔT");

  // Kasus 4: Tembaga
  const q4 = calculateEffectiveHeatEnergy(500, 20, eta);
  assertNear(q4, 10000, 1, "kasus4 Q");
  const dT4 = calculateTemperatureChange(q4, 0.5, 385);
  assertNear(dT4, 51.95, 0.2, "kasus4 ΔT");

  // Kasus massa: massa 2x → ΔT setengah
  const dT_half = calculateTemperatureChange(q1, 1.0, 4186);
  assertNear(dT_half, dT1 / 2, 0.05, "massa 2x");

  // Kasus daya: daya 2x → rate 2x
  const rate1 = calculateHeatingRate(500, 0.5, 4186, eta);
  const rate2 = calculateHeatingRate(1000, 0.5, 4186, eta);
  assertNear(rate2 / rate1, 2, 0.01, "daya 2x");

  const result = calculateThermalResult({
    materialId: "water",
    massKg: BATAS_MASSA.default,
    initialTemperatureC: BATAS_SUHU_AWAL.default,
    heaterPowerW: BATAS_DAYA.default,
    efficiency: EFISIENSI_DEFAULT,
    elapsedTimeS: 60,
  });
  if (!Number.isFinite(result.currentTemperatureC)) {
    throw new Error("hasil tidak valid");
  }

  console.log("✅ Semua verifikasi fisika Kalor dan Perubahan Suhu lulus.");
}

run();
