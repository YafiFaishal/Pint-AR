/**
 * Verifikasi fisika Hukum Archimedes — jalankan: npx tsx src/lib/archimedes-utils.verify.ts
 */
import {
  calculateArchimedesResult,
  densityFromJenisCairan,
} from "./archimedes-utils";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function approx(a: number, b: number, tol = 0.05) {
  return Math.abs(a - b) <= tol;
}

// Kasus terapung
{
  const r = calculateArchimedesResult({
    massKg: 1,
    volumeM3: 0.002,
    liquidDensityKgM3: 1000,
  });
  assert(r.objectDensityKgM3 === 500, `terapung density: ${r.objectDensityKgM3}`);
  assert(r.condition === "floating", `terapung condition: ${r.condition}`);
  assert(approx(r.submergedFraction, 0.5), `terapung fraction: ${r.submergedFraction}`);
  assert(approx(r.weightN, 9.8), `terapung weight: ${r.weightN}`);
  assert(approx(r.buoyantForceN, 9.8), `terapung buoyant: ${r.buoyantForceN}`);
}

// Kasus melayang
{
  const r = calculateArchimedesResult({
    massKg: 2,
    volumeM3: 0.002,
    liquidDensityKgM3: 1000,
  });
  assert(r.objectDensityKgM3 === 1000, `melayang density: ${r.objectDensityKgM3}`);
  assert(r.condition === "suspended", `melayang condition: ${r.condition}`);
  assert(r.submergedFraction === 1, `melayang fraction: ${r.submergedFraction}`);
  assert(approx(r.weightN, r.buoyantForceN, 0.01), "melayang W ≈ Fa");
}

// Kasus tenggelam
{
  const r = calculateArchimedesResult({
    massKg: 3,
    volumeM3: 0.002,
    liquidDensityKgM3: 1000,
  });
  assert(r.objectDensityKgM3 === 1500, `tenggelam density: ${r.objectDensityKgM3}`);
  assert(r.condition === "sinking", `tenggelam condition: ${r.condition}`);
  assert(r.weightN > r.buoyantForceN, "tenggelam W > Fa");
  assert(r.netForceN < 0, "tenggelam net ke bawah");
}

// Cairan berbeda — benda sama
{
  const base = { massKg: 2, volumeM3: 0.002 };
  const minyak = calculateArchimedesResult({
    ...base,
    liquidDensityKgM3: densityFromJenisCairan("minyak"),
  });
  const air = calculateArchimedesResult({
    ...base,
    liquidDensityKgM3: densityFromJenisCairan("air"),
  });
  const garam = calculateArchimedesResult({
    ...base,
    liquidDensityKgM3: densityFromJenisCairan("air-garam"),
  });
  assert(minyak.condition === "sinking", "minyak: tenggelam");
  assert(air.condition === "suspended", "air: melayang");
  assert(garam.condition === "floating", "air garam: terapung");
}

console.log("✅ Semua verifikasi fisika Archimedes lulus.");
