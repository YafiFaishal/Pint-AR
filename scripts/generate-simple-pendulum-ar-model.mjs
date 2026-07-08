/**
 * Menghasilkan public/models/simple-pendulum.glb (animasi) + simple-pendulum.usdz (statis).
 * Demo AR: L = 1.0 m, θ₀ = 15°, g = 9.8 m/s² — ayunan sinusoidal.
 * Visual sinkron dengan simple-pendulum-scene.tsx (lihat simple-pendulum-visual.mjs).
 *
 * Jalankan: npm run generate:simple-pendulum-ar
 */
import { mkdirSync, writeFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { USDZExporter } from "three/examples/jsm/exporters/USDZExporter.js";
import {
  bobRadiusFromMass,
  PENDULUM_COLORS,
  PENDULUM_CROSSBAR_Y,
  PENDULUM_DIM,
  PENDULUM_METER_TO_UNIT,
  PENDULUM_STAND_HEIGHT,
  PENDULUM_TABLE_DEPTH,
  PENDULUM_TABLE_HEIGHT,
  PENDULUM_TABLE_WIDTH,
} from "./simple-pendulum-visual.mjs";

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
const OUT_GLB = join(__dirname, "../public/models/simple-pendulum.glb");
const OUT_USDZ = join(__dirname, "../public/models/simple-pendulum.usdz");

const AR_SCALE = 0.24;
const LENGTH_M = 1.0;
const MASS_KG = 1.0;
const INITIAL_ANGLE_DEG = 15;
const GRAVITY_MS2 = 9.8;

const Lvis = LENGTH_M * PENDULUM_METER_TO_UNIT;
const BOB_R = bobRadiusFromMass(MASS_KG);
const THETA0 = (INITIAL_ANGLE_DEG * Math.PI) / 180;
const OMEGA = Math.sqrt(GRAVITY_MS2 / LENGTH_M);
const PERIOD = (2 * Math.PI) / OMEGA;

// Loop mulus: durasi = kelipatan bulat periode → cos kembali persis di ujung.
const PERIODS = 4;
const DURASI = PERIODS * PERIOD;

function mat(opts) {
  return new THREE.MeshStandardMaterial(opts);
}

function buatMeja() {
  const grup = new THREE.Group();
  grup.name = "Base";

  const alas = new THREE.Mesh(
    new THREE.BoxGeometry(
      PENDULUM_TABLE_WIDTH,
      PENDULUM_TABLE_HEIGHT,
      PENDULUM_TABLE_DEPTH,
    ),
    mat({ color: PENDULUM_COLORS.table, metalness: 0.08, roughness: 0.62 }),
  );
  alas.position.y = PENDULUM_TABLE_HEIGHT / 2;
  grup.add(alas);

  const top = new THREE.Mesh(
    new THREE.BoxGeometry(
      PENDULUM_TABLE_WIDTH - 0.08,
      0.006,
      PENDULUM_TABLE_DEPTH - 0.08,
    ),
    mat({ color: PENDULUM_COLORS.tableTop, metalness: 0.04, roughness: 0.5 }),
  );
  top.position.y = PENDULUM_TABLE_HEIGHT + 0.003;
  grup.add(top);

  return grup;
}

function buatKaki(x) {
  const grup = new THREE.Group();
  const { postRadius, footRadius, footHeight, jointRadius } = PENDULUM_DIM;
  const yMid = PENDULUM_TABLE_HEIGHT + PENDULUM_STAND_HEIGHT / 2;
  const postLen = PENDULUM_STAND_HEIGHT - postRadius * 2;

  const foot = new THREE.Mesh(
    new THREE.CylinderGeometry(footRadius, footRadius * 1.15, footHeight, 20),
    mat({ color: PENDULUM_COLORS.foot, metalness: 0.55, roughness: 0.45 }),
  );
  foot.position.set(x, PENDULUM_TABLE_HEIGHT + footHeight / 2, 0);
  grup.add(foot);

  const post = new THREE.Mesh(
    new THREE.CapsuleGeometry(postRadius, postLen, 4, 12),
    mat({ color: PENDULUM_COLORS.stand, metalness: 0.62, roughness: 0.4 }),
  );
  post.position.set(x, yMid, 0);
  grup.add(post);

  const joint = new THREE.Mesh(
    new THREE.SphereGeometry(jointRadius, 16, 12),
    mat({ color: PENDULUM_COLORS.joint, metalness: 0.6, roughness: 0.42 }),
  );
  joint.position.set(x, PENDULUM_CROSSBAR_Y, 0);
  grup.add(joint);

  return grup;
}

function buatTiang() {
  const grup = new THREE.Group();
  grup.name = "Stand";
  const {
    postX,
    crossbarRadius,
    crossbarLength,
    clampWidth,
    clampHeight,
    clampDepth,
    pivotRadius,
  } = PENDULUM_DIM;

  grup.add(buatKaki(-postX));
  grup.add(buatKaki(postX));

  const crossbarLen = crossbarLength - crossbarRadius * 2;
  const crossbar = new THREE.Mesh(
    new THREE.CapsuleGeometry(crossbarRadius, crossbarLen, 4, 16),
    mat({ color: PENDULUM_COLORS.crossbar, metalness: 0.58, roughness: 0.38 }),
  );
  crossbar.position.set(0, PENDULUM_CROSSBAR_Y, 0);
  crossbar.rotation.z = Math.PI / 2;
  grup.add(crossbar);

  const clamp = new THREE.Mesh(
    new THREE.BoxGeometry(clampWidth, clampHeight, clampDepth),
    mat({ color: PENDULUM_COLORS.clamp, metalness: 0.5, roughness: 0.45 }),
  );
  clamp.position.set(0, PENDULUM_CROSSBAR_Y - clampHeight / 2 + 0.006, 0);
  grup.add(clamp);

  const pivot = new THREE.Mesh(
    new THREE.SphereGeometry(pivotRadius, 16, 12),
    mat({ color: PENDULUM_COLORS.pivot, metalness: 0.65, roughness: 0.3 }),
  );
  pivot.position.set(0, PENDULUM_CROSSBAR_Y, 0);
  pivot.name = "Pivot";
  grup.add(pivot);

  return grup;
}

function buatGarisSetimbang() {
  const grup = new THREE.Group();
  grup.name = "EquilibriumLine";

  const bawah = PENDULUM_CROSSBAR_Y - Lvis - 0.02;
  const panjang = PENDULUM_CROSSBAR_Y - bawah;
  const garis = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0009, 0.0009, panjang, 6),
    mat({
      color: PENDULUM_COLORS.equilibrium,
      transparent: true,
      opacity: 0.5,
      roughness: 0.85,
    }),
  );
  garis.position.set(0, (PENDULUM_CROSSBAR_Y + bawah) / 2, 0.015);
  grup.add(garis);

  return grup;
}

function buatPendulumGroup() {
  const pivot = new THREE.Group();
  pivot.name = "PendulumGroup";
  pivot.position.set(0, PENDULUM_CROSSBAR_Y, 0);
  pivot.rotation.z = THETA0;

  const { stringRadius, collarRadius, collarHeight } = PENDULUM_DIM;

  const tali = new THREE.Mesh(
    new THREE.CylinderGeometry(stringRadius, stringRadius, Lvis, 6),
    mat({ color: PENDULUM_COLORS.string, roughness: 0.75, metalness: 0.1 }),
  );
  tali.position.set(0, -Lvis / 2, 0);
  tali.name = "String";
  pivot.add(tali);

  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(collarRadius * 0.6, collarRadius, collarHeight, 12),
    mat({ color: PENDULUM_COLORS.bobCollar, metalness: 0.55, roughness: 0.4 }),
  );
  collar.position.set(0, -Lvis + BOB_R + collarHeight * 0.4, 0);
  collar.name = "Collar";
  pivot.add(collar);

  const bob = new THREE.Mesh(
    new THREE.SphereGeometry(BOB_R, 32, 24),
    mat({ color: PENDULUM_COLORS.bob, metalness: 0.5, roughness: 0.28 }),
  );
  bob.position.set(0, -Lvis, 0);
  bob.name = "Bob";
  pivot.add(bob);

  return pivot;
}

function quatZ(angleRad) {
  const q = new THREE.Quaternion();
  q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), angleRad);
  return q;
}

function buatAnimasi() {
  const samplesPerPeriod = 32;
  const frameCount = samplesPerPeriod * PERIODS;
  const times = [];
  const values = [];

  for (let i = 0; i <= frameCount; i++) {
    const t = (i / frameCount) * DURASI;
    const theta = THETA0 * Math.cos(OMEGA * t);
    const q = quatZ(theta);
    times.push(t);
    values.push(q.x, q.y, q.z, q.w);
  }

  // QuaternionKeyframeTrack memakai slerp linear (mulus) — kerapatan keyframe
  // tinggi menjaga titik balik ayunan tetap halus.
  const track = new THREE.QuaternionKeyframeTrack(
    "PendulumGroup.quaternion",
    times,
    values,
  );

  return [new THREE.AnimationClip("SimplePendulumDemo", DURASI, [track])];
}

function buatScene() {
  const root = new THREE.Group();
  root.name = "SimplePendulumAR";
  root.scale.setScalar(AR_SCALE);

  root.add(buatMeja());
  root.add(buatTiang());
  root.add(buatGarisSetimbang());
  root.add(buatPendulumGroup());

  root.updateMatrixWorld(true);
  root.animations = buatAnimasi();

  return root;
}

async function eksporGlb(scene, animations) {
  const exporter = new GLTFExporter();
  return new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      (result) => {
        if (result instanceof ArrayBuffer) resolve(result);
        else reject(new Error("Bukan GLB"));
      },
      reject,
      { binary: true, animations },
    );
  });
}

async function verifikasi(buffer) {
  const loader = new GLTFLoader();
  const gltf = await loader.parseAsync(buffer, "");

  const nodeNames = [];
  gltf.scene.traverse((n) => {
    if (n.name) nodeNames.push(n.name);
  });
  console.log(
    `✓ Nodes: ${nodeNames.filter((n) => /Base|Stand|Pivot|Pendulum|String|Collar|Bob|Equilibrium/i.test(n)).join(", ")}`,
  );

  const box = new THREE.Box3().setFromObject(gltf.scene);
  const size = new THREE.Vector3();
  box.getSize(size);
  console.log(
    `✓ Bounding box: ${size.x.toFixed(2)} × ${size.y.toFixed(2)} × ${size.z.toFixed(2)} m (skala AR)`,
  );

  const jumlah = gltf.animations?.length ?? 0;
  if (jumlah === 0) {
    console.warn("⚠ Animasi tidak ter-export — AR akan memakai model statis.");
    return false;
  }

  const clip = gltf.animations[0];
  const track = clip.tracks.find((t) => t.name.includes("PendulumGroup"));
  if (!track) {
    console.warn("⚠ Track rotasi PendulumGroup tidak ditemukan.");
    return false;
  }
  console.log(
    `✓ ${jumlah} animation clip: ${gltf.animations.map((a) => a.name).join(", ")} (${clip.duration.toFixed(2)}s, ${track.times.length} keyframe)`,
  );
  return true;
}

/** USDZ statis (bandul pada sudut awal) — three USDZExporter tidak membawa animasi. */
async function eksporUsdz() {
  try {
    const root = buatScene();
    const scene = new THREE.Scene();
    scene.add(root);
    scene.updateMatrixWorld(true);

    const exporter = new USDZExporter();
    const result = await exporter.parseAsync(scene);
    const bytes =
      result instanceof Uint8Array ? result : new Uint8Array(result);
    writeFileSync(OUT_USDZ, Buffer.from(bytes));

    const size = statSync(OUT_USDZ).size;
    if (size < 1000) {
      console.warn("⚠ USDZ terlalu kecil — kemungkinan tidak valid.");
      return false;
    }
    console.log(`✓ simple-pendulum.usdz (${(size / 1024).toFixed(1)} KB) — statis @ ${INITIAL_ANGLE_DEG}°`);
    console.log(
      "ℹ USDZ statis (Quick Look). GLB animated untuk Android/model-viewer.",
    );
    return true;
  } catch (err) {
    console.warn("⚠ Gagal membuat USDZ:", err?.message ?? err);
    console.log(
      "ℹ Konversi manual bila perlu (lihat README-simple-pendulum.md).",
    );
    return false;
  }
}

async function main() {
  const root = buatScene();
  const scene = new THREE.Scene();
  scene.name = "SimplePendulumScene";
  scene.add(root);

  const buffer = await eksporGlb(scene, root.animations);
  mkdirSync(dirname(OUT_GLB), { recursive: true });
  writeFileSync(OUT_GLB, Buffer.from(buffer));
  console.log(`✓ simple-pendulum.glb (${(buffer.byteLength / 1024).toFixed(1)} KB)`);
  console.log(
    `  Skala AR: ${AR_SCALE}× — meja ~${(PENDULUM_TABLE_WIDTH * AR_SCALE).toFixed(2)} m lebar`,
  );
  console.log(
    `  Demo: L=${LENGTH_M} m, θ₀=${INITIAL_ANGLE_DEG}°, g=${GRAVITY_MS2} m/s², T≈${PERIOD.toFixed(2)} s, loop=${DURASI.toFixed(2)} s`,
  );
  await verifikasi(buffer);
  await eksporUsdz();
}

main().catch((err) => {
  console.error("Gagal membuat GLB:", err);
  process.exit(1);
});
