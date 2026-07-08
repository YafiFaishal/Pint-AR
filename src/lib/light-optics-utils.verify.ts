/**
 * Verifikasi fisika Pemantulan & Pembiasan Cahaya — jalankan:
 * npx tsx src/lib/light-optics-utils.verify.ts
 */
import {
  calculateLightOpticsResult,
  calculateRefractionAngle,
  calculateCriticalAngle,
  determineRefractionDirection,
} from "./light-optics-utils";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function approx(a: number, b: number, tol = 0.15) {
  return Math.abs(a - b) <= tol;
}

// Kasus pemantulan
{
  const r = calculateLightOpticsResult({
    mode: "reflection",
    incidentAngleDeg: 30,
    medium1Index: 1,
    medium2Index: 1.5,
  });
  assert(r.reflectedAngleDeg === 30, `pantul: ${r.reflectedAngleDeg}`);
}

// Udara ke kaca
{
  const refracted = calculateRefractionAngle(30, 1.0, 1.5);
  assert(refracted !== null && approx(refracted, 19.47), `udara→kaca: ${refracted}`);
  const r = calculateLightOpticsResult({
    mode: "refraction",
    incidentAngleDeg: 30,
    medium1Index: 1.0,
    medium2Index: 1.5,
  });
  assert(
    determineRefractionDirection(1.0, 1.5, false) === "toward-normal",
    "arah mendekati normal",
  );
  assert(
    r.refractedAngleDeg !== null && approx(r.refractedAngleDeg, 19.47),
    `hasil bias: ${r.refractedAngleDeg}`,
  );
}

// Kaca ke udara
{
  const refracted = calculateRefractionAngle(30, 1.5, 1.0);
  assert(refracted !== null && approx(refracted, 48.59), `kaca→udara: ${refracted}`);
  assert(
    determineRefractionDirection(1.5, 1.0, false) === "away-from-normal",
    "arah menjauhi normal",
  );
}

// Pemantulan internal total
{
  const critical = calculateCriticalAngle(1.5, 1.0);
  assert(critical !== null && approx(critical, 41.81), `kritis: ${critical}`);
  const r = calculateLightOpticsResult({
    mode: "refraction",
    incidentAngleDeg: 50,
    medium1Index: 1.5,
    medium2Index: 1.0,
  });
  assert(r.totalInternalReflection, "TIR harus true");
  assert(r.refractedAngleDeg === null, "bias harus null");
}

// Medium sama
{
  const refracted = calculateRefractionAngle(40, 1.33, 1.33);
  assert(refracted !== null && approx(refracted, 40), `medium sama: ${refracted}`);
}

console.log("✅ Semua verifikasi fisika Cahaya & Optik lulus.");
