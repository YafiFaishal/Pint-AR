/**
 * Verifikasi fisika Getaran Bandul — jalankan:
 * npx tsx src/lib/simple-pendulum-utils.verify.ts
 */
import {
  calculatePendulumFrequency,
  calculatePendulumPeriod,
  calculatePendulumResult,
} from "./simple-pendulum-utils";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function approx(a: number, b: number, tol = 0.02) {
  return Math.abs(a - b) <= tol;
}

// Kasus 1: L=1, g=9.8
{
  const T = calculatePendulumPeriod(1.0, 9.8);
  const f = calculatePendulumFrequency(1.0, 9.8);
  assert(approx(T, 2.007), `T1: ${T}`);
  assert(approx(f, 0.498), `f1: ${f}`);
}

// Kasus 2: L=0.25, g=9.8
{
  const T = calculatePendulumPeriod(0.25, 9.8);
  const f = calculatePendulumFrequency(0.25, 9.8);
  assert(approx(T, 1.003), `T2: ${T}`);
  assert(approx(f, 0.997), `f2: ${f}`);
}

// Kasus 3: L=2.0, g=9.8
{
  const T = calculatePendulumPeriod(2.0, 9.8);
  const f = calculatePendulumFrequency(2.0, 9.8);
  assert(approx(T, 2.838), `T3: ${T}`);
  assert(approx(f, 0.352), `f3: ${f}`);
}

// Kasus 4: L=1, g=1.62 (Bulan)
{
  const T = calculatePendulumPeriod(1.0, 1.62);
  const f = calculatePendulumFrequency(1.0, 1.62);
  assert(approx(T, 4.936), `T4: ${T}`);
  assert(approx(f, 0.203), `f4: ${f}`);
}

// Kasus 5: L=1, g=24.79 (Jupiter)
{
  const T = calculatePendulumPeriod(1.0, 24.79);
  const f = calculatePendulumFrequency(1.0, 24.79);
  assert(approx(T, 1.262), `T5: ${T}`);
  assert(approx(f, 0.792), `f5: ${f}`);
}

// Massa tidak memengaruhi periode
{
  const r05 = calculatePendulumResult({
    lengthM: 1,
    massKg: 0.5,
    initialAngleDeg: 15,
    gravityMs2: 9.8,
    damping: 0,
  });
  const r30 = calculatePendulumResult({
    lengthM: 1,
    massKg: 3.0,
    initialAngleDeg: 15,
    gravityMs2: 9.8,
    damping: 0,
  });
  assert(r05.periodS === r30.periodS, "periode harus sama");
  assert(r05.frequencyHz === r30.frequencyHz, "frekuensi harus sama");
  assert(r05.maxPotentialEnergyJ !== r30.maxPotentialEnergyJ, "Ep harus beda");
}

console.log("✅ Semua verifikasi fisika Bandul Sederhana lulus.");
