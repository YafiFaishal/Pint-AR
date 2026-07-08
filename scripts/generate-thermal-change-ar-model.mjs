/**
 * Menghasilkan aset AR modul "Kalor dan Perubahan Suhu" — satu pasang GLB+USDZ
 * per jenis zat (Air, Minyak, Aluminium, Tembaga).
 *
 *   GLB  : animasi looping (HeatLoop) — gelembung naik, uap mengapung, glow
 *          pemanas berdenyut halus. Untuk Android / Scene Viewer / WebXR.
 *   USDZ : statis (Quick Look iOS) pada kondisi "sedang dipanaskan".
 *
 * Visual sinkron dengan thermal-change-scene.tsx (lihat thermal-change-visual.mjs).
 * Jalankan: npm run generate:thermal-change-ar
 */
import { mkdirSync, writeFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { USDZExporter } from "three/examples/jsm/exporters/USDZExporter.js";
import {
  THERMAL_AR_FILE,
  THERMAL_COLORS,
  THERMAL_DIM,
  THERMAL_MATERIAL_VISUAL,
  THERMAL_TABLE_DEPTH,
  THERMAL_TABLE_HEIGHT,
  THERMAL_TABLE_WIDTH,
} from "./thermal-change-visual.mjs";

if (typeof globalThis.FileReader === "undefined") {
  globalThis.FileReader = class FileReader {
    result = null;
    onloadend = null;
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((buf) => {
        this.result = buf;
        this.onloadend?.();
      });
    }
  };
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "../public/models");

const AR_SCALE = 0.26;
const DURASI = 6;
const CLIP_NAME = "HeatLoop";
/** Kondisi visual "sedang dipanaskan" untuk demo AR. */
const AR_PROGRESS_LIQUID = 0.68;
const AR_PROGRESS_SOLID = 0.6;

const {
  hotPlateWidth,
  hotPlateHeight,
  hotPlateDepth,
  ringOuter,
  ringInner,
  footRadius,
  footHeight,
  beakerRadius,
  beakerHeight,
  liquidHeight,
  blockWidth,
  blockHeight,
  blockDepth,
  probeRadius,
  probeLength,
} = THERMAL_DIM;

const TABLE_H = THERMAL_TABLE_HEIGHT;
const HEATER_TOP = TABLE_H + footHeight + hotPlateHeight;

function lerpColor(a, b, t) {
  return new THREE.Color(a).lerp(new THREE.Color(b), t);
}
function mat(opts) {
  return new THREE.MeshStandardMaterial(opts);
}

/* ------------------------------ platform ------------------------------ */

function buatMeja() {
  const grup = new THREE.Group();
  grup.name = "PlatformBase";

  const alas = new THREE.Mesh(
    new THREE.BoxGeometry(
      THERMAL_TABLE_WIDTH,
      TABLE_H,
      THERMAL_TABLE_DEPTH,
    ),
    mat({ color: THERMAL_COLORS.table, metalness: 0.06, roughness: 0.68 }),
  );
  alas.position.y = TABLE_H / 2;
  grup.add(alas);

  const top = new THREE.Mesh(
    new THREE.BoxGeometry(
      THERMAL_TABLE_WIDTH - 0.06,
      0.007,
      THERMAL_TABLE_DEPTH - 0.06,
    ),
    mat({ color: THERMAL_COLORS.tableTop, metalness: 0.04, roughness: 0.5 }),
  );
  top.position.y = TABLE_H + 0.0035;
  grup.add(top);

  return grup;
}

/* ------------------------------ hot plate ------------------------------ */

function buatHotPlate(progress) {
  const grup = new THREE.Group();
  grup.name = "HeaterAssembly";

  const glow = lerpColor(
    THERMAL_COLORS.hotPlateGlow,
    THERMAL_COLORS.hotPlateGlowHot,
    progress,
  );

  // Kaki
  const footMat = mat({ color: 0x15181d, metalness: 0.4, roughness: 0.6 });
  [
    [hotPlateWidth * 0.36, hotPlateDepth * 0.36],
    [-hotPlateWidth * 0.36, hotPlateDepth * 0.36],
    [hotPlateWidth * 0.36, -hotPlateDepth * 0.36],
    [-hotPlateWidth * 0.36, -hotPlateDepth * 0.36],
  ].forEach(([x, z]) => {
    const foot = new THREE.Mesh(
      new THREE.CylinderGeometry(footRadius, footRadius * 1.1, footHeight, 10),
      footMat,
    );
    foot.position.set(x, footHeight / 2, z);
    grup.add(foot);
  });

  // Body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(hotPlateWidth, hotPlateHeight, hotPlateDepth),
    mat({ color: THERMAL_COLORS.hotPlateBody, metalness: 0.45, roughness: 0.5 }),
  );
  body.position.y = footHeight + hotPlateHeight / 2;
  grup.add(body);

  // Bezel
  const bezel = new THREE.Mesh(
    new THREE.CylinderGeometry(hotPlateWidth * 0.46, hotPlateWidth * 0.46, 0.006, 40),
    mat({ color: THERMAL_COLORS.hotPlateBodyEdge, metalness: 0.5, roughness: 0.4 }),
  );
  bezel.position.y = footHeight + hotPlateHeight + 0.001;
  grup.add(bezel);

  // Permukaan panas gelap (emissive lembut)
  const surface = new THREE.Mesh(
    new THREE.CylinderGeometry(ringOuter + 0.006, ringOuter + 0.006, 0.004, 40),
    mat({
      color: THERMAL_COLORS.hotPlateSurface,
      emissive: glow,
      emissiveIntensity: progress > 0 ? 0.25 : 0,
      metalness: 0.3,
      roughness: 0.55,
    }),
  );
  surface.position.y = footHeight + hotPlateHeight + 0.005;
  grup.add(surface);

  // Ring pemanas
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(ringInner, ringOuter, 48),
    mat({
      color: THERMAL_COLORS.hotPlateSurface,
      emissive: glow,
      emissiveIntensity: 0.85,
      metalness: 0.2,
      roughness: 0.5,
    }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = footHeight + hotPlateHeight + 0.008;
  grup.add(ring);

  // Glow halo (untuk denyut)
  const halo = new THREE.Mesh(
    new THREE.CircleGeometry(ringOuter * 1.05, 40),
    mat({
      color: glow,
      emissive: glow,
      emissiveIntensity: 1.1,
      transparent: true,
      opacity: 0.28,
      roughness: 1,
      depthWrite: false,
    }),
  );
  halo.name = "GlowHalo";
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = footHeight + hotPlateHeight + 0.007;
  grup.add(halo);

  // Lampu indikator
  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.007, 12, 12),
    mat({
      color: THERMAL_COLORS.indicatorOn,
      emissive: THERMAL_COLORS.indicatorOn,
      emissiveIntensity: 0.9,
    }),
  );
  lamp.name = "Indicator";
  lamp.position.set(
    hotPlateWidth * 0.38,
    footHeight + hotPlateHeight * 0.55,
    hotPlateDepth * 0.38,
  );
  grup.add(lamp);

  return grup;
}

/* ------------------------------ beaker ------------------------------ */

function buatGelasKimia() {
  const grup = new THREE.Group();
  grup.name = "Container";

  // FrontSide (bukan DoubleSide) agar aman & bersih di USDZ Quick Look.
  const glassMat = mat({
    color: THERMAL_COLORS.beaker,
    transparent: true,
    opacity: 0.32,
    roughness: 0.1,
    metalness: 0,
    depthWrite: false,
  });

  const wall = new THREE.Mesh(
    new THREE.CylinderGeometry(
      beakerRadius,
      beakerRadius * 0.94,
      beakerHeight,
      36,
      1,
      true,
    ),
    glassMat,
  );
  wall.position.y = HEATER_TOP + beakerHeight / 2;
  grup.add(wall);

  const bottom = new THREE.Mesh(
    new THREE.CylinderGeometry(beakerRadius * 0.94, beakerRadius * 0.94, 0.008, 36),
    mat({
      color: THERMAL_COLORS.beaker,
      transparent: true,
      opacity: 0.45,
      roughness: 0.15,
    }),
  );
  bottom.position.y = HEATER_TOP + 0.004;
  grup.add(bottom);

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(beakerRadius, 0.004, 8, 36),
    mat({
      color: THERMAL_COLORS.beakerRim,
      transparent: true,
      opacity: 0.6,
      roughness: 0.1,
    }),
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = HEATER_TOP + beakerHeight;
  grup.add(rim);

  return grup;
}

/* ------------------------------ liquid ------------------------------ */

function buatCairan(visual, progress) {
  const grup = new THREE.Group();
  grup.name = "LiquidBody";

  const liquidRadius = beakerRadius * 0.88;
  const color = lerpColor(visual.coolColor, visual.warmColor, progress);

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(liquidRadius, liquidRadius, liquidHeight, 36),
    mat({
      color,
      transparent: true,
      opacity: visual.opacity ?? 0.6,
      roughness: visual.roughness,
      metalness: visual.metalness,
      emissive: visual.emissiveWarm ?? 0x000000,
      emissiveIntensity: (visual.emissiveMaxIntensity ?? 0) * progress,
    }),
  );
  body.position.y = HEATER_TOP + 0.008 + liquidHeight / 2;
  grup.add(body);

  const surface = new THREE.Mesh(
    new THREE.CylinderGeometry(liquidRadius, liquidRadius, 0.002, 36),
    mat({
      color,
      transparent: true,
      opacity: (visual.opacity ?? 0.6) + 0.15,
      roughness: 0.06,
      metalness: 0.05,
    }),
  );
  surface.position.y = HEATER_TOP + 0.008 + liquidHeight;
  grup.add(surface);

  return grup;
}

/* ------------------------------ bubbles ------------------------------ */

function buatGelembung(visual) {
  const grup = new THREE.Group();
  grup.name = "Bubbles";
  const profile = visual.bubble;
  if (!profile) return grup;

  const liquidRadius = beakerRadius * 0.88;
  const areaR = liquidRadius * 0.72;
  const baseY = HEATER_TOP + 0.012;
  const topY = HEATER_TOP + 0.008 + liquidHeight - 0.008;

  const bubbleMat = mat({
    color: 0xffffff,
    transparent: true,
    opacity: 0.5,
    roughness: 0.1,
    metalness: 0,
    depthWrite: false,
  });

  const N = profile.maxCount;
  for (let i = 0; i < N; i++) {
    const ang = (i / N) * Math.PI * 2;
    const r = (0.3 + ((i * 37) % 100) / 140) * areaR;
    const bubble = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 8), bubbleMat.clone());
    bubble.name = `Bubble${i}`;
    bubble.position.set(Math.cos(ang) * r, baseY, Math.sin(ang) * r);
    bubble.scale.setScalar(0);
    bubble.userData = {
      baseY,
      topY,
      minR: profile.minRadius,
      maxR: profile.maxRadius,
    };
    grup.add(bubble);
  }
  return grup;
}

/* ------------------------------ steam ------------------------------ */

function buatUap(visual, surfaceY) {
  const grup = new THREE.Group();
  grup.name = "Steam";
  const profile = visual.steam;
  if (!profile) return grup;

  const steamMat = mat({
    color: THERMAL_COLORS.steam,
    transparent: true,
    opacity: profile.maxOpacity,
    roughness: 1,
    depthWrite: false,
  });

  for (let i = 0; i < 4; i++) {
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(1, 8, 8),
      steamMat.clone(),
    );
    puff.name = `SteamPuff${i}`;
    puff.position.set((i - 1.5) * 0.016, surfaceY + 0.01, 0);
    puff.scale.setScalar(0);
    grup.add(puff);
  }
  return grup;
}

/* ------------------------------ probe ------------------------------ */

function buatProbe(yBase) {
  const grup = new THREE.Group();
  grup.name = "TemperatureProbe";
  grup.position.set(0.088, yBase, 0.05);

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(probeRadius, probeRadius, probeLength, 12),
    mat({ color: THERMAL_COLORS.probeBody, metalness: 0.55, roughness: 0.3 }),
  );
  stem.position.y = probeLength / 2;
  grup.add(stem);

  const tip = new THREE.Mesh(
    new THREE.SphereGeometry(probeRadius * 2.1, 12, 12),
    mat({ color: THERMAL_COLORS.probeTip, metalness: 0.5, roughness: 0.35 }),
  );
  tip.position.y = 0.004;
  grup.add(tip);

  const headGroup = new THREE.Group();
  headGroup.position.y = probeLength + 0.012;
  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.03, 0.024, 0.014),
    mat({ color: THERMAL_COLORS.probeStem, metalness: 0.35, roughness: 0.45 }),
  );
  headGroup.add(head);
  const display = new THREE.Mesh(
    new THREE.PlaneGeometry(0.02, 0.014),
    mat({
      color: THERMAL_COLORS.probeDisplay,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.4,
      roughness: 0.3,
    }),
  );
  display.position.set(0, 0.001, 0.0075);
  headGroup.add(display);
  grup.add(headGroup);

  return grup;
}

/* ------------------------------ metal block ------------------------------ */

function buatBalokLogam(visual, progress) {
  const grup = new THREE.Group();
  grup.name = "SolidBlock";
  const color = lerpColor(visual.coolColor, visual.warmColor, progress * 0.85);

  const block = new THREE.Mesh(
    new THREE.BoxGeometry(blockWidth, blockHeight, blockDepth),
    mat({
      color,
      metalness: visual.metalness,
      roughness: visual.roughness - progress * 0.08,
      emissive: visual.emissiveWarm ?? 0x000000,
      emissiveIntensity: (visual.emissiveMaxIntensity ?? 0) * progress,
    }),
  );
  block.position.y = HEATER_TOP + blockHeight / 2 + 0.004;
  grup.add(block);

  return grup;
}

/* ------------------------------ animasi ------------------------------ */

function buatAnimasi(root) {
  root.updateMatrixWorld(true);
  const tracks = [];

  // Denyut glow + lampu
  const halo = root.getObjectByName("GlowHalo");
  if (halo) {
    tracks.push(
      new THREE.VectorKeyframeTrack(
        "GlowHalo.scale",
        [0, DURASI / 2, DURASI],
        [1, 1, 1, 1.14, 1.14, 1.14, 1, 1, 1],
      ),
    );
  }
  const lamp = root.getObjectByName("Indicator");
  if (lamp) {
    tracks.push(
      new THREE.VectorKeyframeTrack(
        "Indicator.scale",
        [0, DURASI / 2, DURASI],
        [1, 1, 1, 1.18, 1.18, 1.18, 1, 1, 1],
      ),
    );
  }

  // Gelembung: jendela berurutan, invisible di batas loop → mulus.
  const bubbles = [];
  root.traverse((n) => {
    if (/^Bubble\d+$/.test(n.name)) bubbles.push(n);
  });
  const NB = bubbles.length;
  bubbles.forEach((b, i) => {
    const { baseY, topY, minR, maxR } = b.userData;
    const start = (i / Math.max(1, NB)) * DURASI * 0.55;
    const dur = DURASI * 0.45;
    const end = Math.min(DURASI, start + dur);
    const midT = start + (end - start) * 0.45;

    tracks.push(
      new THREE.NumberKeyframeTrack(
        `${b.name}.position[y]`,
        [0, start, end, DURASI],
        [baseY, baseY, topY, topY],
      ),
    );
    tracks.push(
      new THREE.VectorKeyframeTrack(
        `${b.name}.scale`,
        [0, start, midT, end, DURASI],
        [0, 0, 0, minR, minR, minR, maxR, maxR, maxR, 0, 0, 0, 0, 0, 0],
      ),
    );
  });

  // Uap: naik + melebar lalu memudar (scale 0), jendela berurutan.
  const steam = [];
  root.traverse((n) => {
    if (/^SteamPuff\d+$/.test(n.name)) steam.push(n);
  });
  const NS = steam.length;
  steam.forEach((p, i) => {
    const y0 = p.position.y;
    const yEnd = y0 + 0.11;
    const start = (i / Math.max(1, NS)) * DURASI * 0.5;
    const end = Math.min(DURASI, start + DURASI * 0.5);
    const midT = start + (end - start) * 0.5;
    const sMin = 0.01;
    const sMax = 0.024;

    tracks.push(
      new THREE.NumberKeyframeTrack(
        `${p.name}.position[y]`,
        [0, start, end, DURASI],
        [y0, y0, yEnd, yEnd],
      ),
    );
    tracks.push(
      new THREE.VectorKeyframeTrack(
        `${p.name}.scale`,
        [0, start, midT, end, DURASI],
        [0, 0, 0, sMin, sMin, sMin, sMax, sMax, sMax, 0, 0, 0, 0, 0, 0],
      ),
    );
  });

  return [new THREE.AnimationClip(CLIP_NAME, DURASI, tracks)];
}

/* ------------------------------ scene ------------------------------ */

function buatScene(materialId, { animated = true } = {}) {
  const visual = THERMAL_MATERIAL_VISUAL[materialId];
  const progress =
    visual.state === "liquid" ? AR_PROGRESS_LIQUID : AR_PROGRESS_SOLID;

  const root = new THREE.Group();
  root.name = "HeatExperimentScene";
  root.scale.setScalar(AR_SCALE);

  root.add(buatMeja());
  root.add(buatHotPlate(progress));

  if (visual.state === "liquid") {
    root.add(buatGelasKimia());
    root.add(buatCairan(visual, progress));
    root.add(buatGelembung(visual));
    const surfaceY = HEATER_TOP + 0.008 + liquidHeight;
    root.add(buatUap(visual, surfaceY));
    root.add(buatProbe(HEATER_TOP + 0.02));
  } else {
    root.add(buatBalokLogam(visual, progress));
    root.add(buatProbe(HEATER_TOP + blockHeight * 0.35));
  }

  if (animated) root.animations = buatAnimasi(root);
  return root;
}

/* ------------------------------ export ------------------------------ */

function eksporGlb(scene, animations) {
  return new Promise((resolve, reject) => {
    new GLTFExporter().parse(
      scene,
      (result) => {
        if (result instanceof ArrayBuffer) resolve(result);
        else reject(new Error("GLTF export bukan ArrayBuffer"));
      },
      (err) => reject(err),
      { binary: true, animations },
    );
  });
}

async function verifikasiGlb(buffer, materialId) {
  const gltf = await new GLTFLoader().parseAsync(buffer, "");
  const box = new THREE.Box3().setFromObject(gltf.scene);
  const size = new THREE.Vector3();
  box.getSize(size);
  const minY = box.min.y;
  const clip = gltf.animations?.[0];
  const okAnim = clip && clip.name === CLIP_NAME && clip.tracks.length > 0;
  const okFloor = Math.abs(minY) < 0.01;
  console.log(
    `  ✓ ${materialId}: bbox ${size.x.toFixed(2)}×${size.y.toFixed(2)}×${size.z.toFixed(2)}m, ` +
      `minY=${minY.toFixed(3)} ${okFloor ? "(di lantai)" : "(⚠ offset)"}, ` +
      `clip=${clip?.name ?? "-"} (${clip?.tracks.length ?? 0} track)`,
  );
  return okAnim && okFloor;
}

async function eksporUsdz(materialId, file) {
  const root = buatScene(materialId, { animated: false });
  const scene = new THREE.Scene();
  scene.add(root);
  scene.updateMatrixWorld(true);

  const result = await new USDZExporter().parseAsync(scene);
  const bytes = result instanceof Uint8Array ? result : new Uint8Array(result);
  const out = join(OUT_DIR, `${file}.usdz`);
  writeFileSync(out, Buffer.from(bytes));
  const size = statSync(out).size;
  if (size < 1000) {
    console.warn(`  ⚠ ${file}.usdz terlalu kecil.`);
    return false;
  }
  console.log(`  ✓ ${file}.usdz (${(size / 1024).toFixed(1)} KB) — statis`);
  return true;
}

async function buatMaterial(materialId) {
  const file = THERMAL_AR_FILE[materialId];
  console.log(`\n▸ ${materialId} → ${file}`);

  const root = buatScene(materialId, { animated: true });
  const scene = new THREE.Scene();
  scene.add(root);
  const buffer = await eksporGlb(scene, root.animations);
  const outGlb = join(OUT_DIR, `${file}.glb`);
  writeFileSync(outGlb, Buffer.from(buffer));
  console.log(`  ✓ ${file}.glb (${(buffer.byteLength / 1024).toFixed(1)} KB)`);
  await verifikasiGlb(buffer, materialId);
  await eksporUsdz(materialId, file);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  console.log(
    `Skala AR ${AR_SCALE}× — meja ~${(THERMAL_TABLE_WIDTH * AR_SCALE).toFixed(2)} m, clip=${CLIP_NAME} (${DURASI}s)`,
  );
  for (const materialId of ["water", "oil", "aluminum", "copper"]) {
    await buatMaterial(materialId);
  }
  console.log("\nSelesai. 4 GLB (animasi) + 4 USDZ (statis).");
}

main().catch((err) => {
  console.error("Gagal membuat aset AR kalor:", err);
  process.exit(1);
});
