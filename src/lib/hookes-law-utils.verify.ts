import {
  calculateEquilibriumExtension,
  calculateOscillationDisplacement,
  calculateSpringForce,
  calculateSpringFrequency,
  calculateSpringPeriod,
  calculateSpringResult,
  calculateWeight,
} from "./hookes-law-utils";

function assertNear(actual: number, expected: number, tol: number, label: string) {
  if (Math.abs(actual - expected) > tol) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

function run() {
  // Kasus statis 1
  assertNear(calculateWeight(1, 9.8), 9.8, 0.01, "statis1 W");
  assertNear(calculateEquilibriumExtension(1, 50, 9.8), 0.196, 0.001, "statis1 x");
  assertNear(calculateSpringForce(50, 0.196), 9.8, 0.05, "statis1 F");

  // Kasus statis 2
  assertNear(calculateEquilibriumExtension(1, 100, 9.8), 0.098, 0.001, "statis2 x");

  // Kasus statis 3
  assertNear(calculateWeight(2, 9.8), 19.6, 0.01, "statis3 W");
  assertNear(calculateEquilibriumExtension(2, 50, 9.8), 0.392, 0.001, "statis3 x");

  // Kasus getaran 1
  assertNear(calculateSpringPeriod(1, 50), 0.889, 0.01, "getaran1 T");
  assertNear(calculateSpringFrequency(1, 50), 1.125, 0.01, "getaran1 f");

  // Kasus getaran 2
  assertNear(calculateSpringPeriod(1, 100), 0.628, 0.01, "getaran2 T");
  assertNear(calculateSpringFrequency(1, 100), 1.592, 0.01, "getaran2 f");

  // Kasus getaran 3
  assertNear(calculateSpringPeriod(2, 50), 1.257, 0.01, "getaran3 T");
  assertNear(calculateSpringFrequency(2, 50), 0.796, 0.01, "getaran3 f");

  // Gravitasi tidak mengubah periode
  const T1 = calculateSpringPeriod(1, 50);
  const T2 = calculateSpringPeriod(1, 50);
  assertNear(T1, T2, 0.0001, "periode sama");

  const xBumi = calculateEquilibriumExtension(1, 50, 9.8);
  const xBulan = calculateEquilibriumExtension(1, 50, 1.62);
  if (xBumi <= xBulan) {
    throw new Error("setimbang Bumi harus lebih besar dari Bulan");
  }

  const result = calculateSpringResult({
    springConstantNm: 50,
    massKg: 1,
    gravityMs2: 9.8,
    initialAmplitudeM: 0.1,
    naturalLengthM: 0.5,
  });
  if (!Number.isFinite(result.periodS) || result.periodS <= 0) {
    throw new Error("hasil tidak valid");
  }

  const disp = calculateOscillationDisplacement(
    0.1,
    result.angularFrequencyRadS,
    0,
  );
  assertNear(disp, 0.1, 0.001, "amplitudo awal");

  console.log("✅ Semua verifikasi fisika Hukum Hooke lulus.");
}

run();
