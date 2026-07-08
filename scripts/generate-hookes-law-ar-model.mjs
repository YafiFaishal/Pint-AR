/**
 * Menghasilkan aset AR modul Hukum Hooke (versi 2) — mengikuti scene web terbaru.
 *   public/models/hooke-elasticity-v2.glb  (Android/Scene Viewer, animasi looping)
 *   public/models/hooke-elasticity-v2.usdz (iOS Quick Look, statis @ setimbang)
 *
 * Demo default: k = 50 N/m, m = 1 kg, g = 9.8 m/s² → x ≈ 19.6 cm, F ≈ 9.8 N.
 * Struktur & proporsi identik dengan hookes-law-scene.tsx.
 * Animasi GLB: "HookeLoop" — pegas memanjang/memendek via morph target,
 * beban + pengait bawah + panah gaya bergerak sebagai satu sistem.
 *
 * Jalankan: npm run generate:hookes-law-ar
 */
import { mkdirSync, writeFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { USDZExporter } from "three/examples/jsm/exporters/USDZExporter.js";
import {
  SPRING_ANCHOR_Y,
  SPRING_BOTTOM_HOOK_LEN,
  SPRING_COLORS,
  SPRING_DIM,
  SPRING_METER_TO_UNIT,
  SPRING_NATURAL_VIS,
  SPRING_STAND_HEIGHT,
  SPRING_TABLE_DEPTH,
  SPRING_TABLE_HEIGHT,
  SPRING_TABLE_WIDTH,
  SPRING_TOP_ANCHOR_Y,
  SPRING_TOP_CONNECTOR_LEN,
  SPRING_TOP_Y,
  massHeightFromKg,
  massRadiusFromKg,
} from "./hookes-law-visual.mjs";

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
const OUT_GLB = join(__dirname, "../public/models/hooke-elasticity-v2.glb");
const OUT_USDZ = join(__dirname, "../public/models/hooke-elasticity-v2.usdz");

const AR_SCALE = 0.9;
const CLIP_NAME = "HookeLoop";
const DURASI = 3.2;

// Demo default (Bumi): x = mg/k = 1 * 9.8 / 50 = 0.196 m
const K = 50;
const MASS = 1.0;
const GRAVITY = 9.8;
const WEIGHT_N = MASS * GRAVITY;
const EQ_EXT_M = WEIGHT_N / K;

const eqExtVis = EQ_EXT_M * SPRING_METER_TO_UNIT;
const eqLen = SPRING_NATURAL_VIS + eqExtVis;
const AMP_VIS = 0.03;
const minLen = eqLen - AMP_VIS;
const maxLen = eqLen + AMP_VIS;

const massR = massRadiusFromKg(MASS);
const massH = massHeightFromKg(MASS);

// Topologi tube tetap agar morph target punya jumlah vertex identik.
const TUBULAR_SEGMENTS = Math.max(48, SPRING_DIM.coilTurns * 8);
const RADIAL_SEGMENTS = 8;

function mat(opts) {
  return new THREE.MeshStandardMaterial(opts);
}

/** Helix dengan ujung meruncing ke sumbu (menyatu dengan connector). */
function helixPositions(length) {
  const { coilRadius, coilTurns } = SPRING_DIM;
  const edge = 0.06;
  const points = [];
  for (let i = 0; i <= TUBULAR_SEGMENTS; i++) {
    const t = i / TUBULAR_SEGMENTS;
    const angle = coilTurns * Math.PI * 2 * t;
    let rf = 1;
    if (t < edge) rf = t / edge;
    else if (t > 1 - edge) rf = (1 - t) / edge;
    const r = coilRadius * rf;
    points.push(
      new THREE.Vector3(r * Math.cos(angle), -length * t, r * Math.sin(angle)),
    );
  }
  const curve = new THREE.CatmullRomCurve3(points);
  return new THREE.TubeGeometry(
    curve,
    TUBULAR_SEGMENTS,
    SPRING_DIM.wireRadius,
    RADIAL_SEGMENTS,
    false,
  );
}

function springMaterial() {
  return mat({ color: SPRING_COLORS.spring, metalness: 0.35, roughness: 0.45 });
}

/** Pegas statis pada panjang tertentu (untuk USDZ). */
function buatSpringStatic(length) {
  const spring = new THREE.Mesh(helixPositions(length), springMaterial());
  spring.name = "Spring";
  spring.position.set(0, SPRING_TOP_Y, 0);
  spring.castShadow = true;
  return spring;
}

/** Pegas dengan morph target (base = minLen, target = maxLen) untuk animasi GLB. */
function buatSpringMorph() {
  const base = helixPositions(minLen);
  const target = helixPositions(maxLen);
  const basePos = base.attributes.position.array;
  const targetPos = target.attributes.position.array;
  const delta = new Float32Array(basePos.length);
  for (let i = 0; i < basePos.length; i++) delta[i] = targetPos[i] - basePos[i];
  target.dispose();

  base.morphAttributes.position = [
    new THREE.Float32BufferAttribute(delta, 3),
  ];
  base.morphTargetsRelative = true;

  const spring = new THREE.Mesh(base, springMaterial());
  spring.name = "Spring";
  spring.position.set(0, SPRING_TOP_Y, 0);
  spring.castShadow = true;
  spring.morphTargetInfluences = [0];
  spring.morphTargetDictionary = { stretch: 0 };
  return spring;
}

function buatMeja() {
  const grup = new THREE.Group();
  grup.name = "Base";
  const alas = new THREE.Mesh(
    new THREE.BoxGeometry(
      SPRING_TABLE_WIDTH,
      SPRING_TABLE_HEIGHT,
      SPRING_TABLE_DEPTH,
    ),
    mat({ color: SPRING_COLORS.table, metalness: 0.08, roughness: 0.62 }),
  );
  alas.position.y = SPRING_TABLE_HEIGHT / 2;
  alas.receiveShadow = true;
  grup.add(alas);
  const top = new THREE.Mesh(
    new THREE.BoxGeometry(
      SPRING_TABLE_WIDTH - 0.08,
      0.006,
      SPRING_TABLE_DEPTH - 0.08,
    ),
    mat({ color: SPRING_COLORS.tableTop, metalness: 0.04, roughness: 0.5 }),
  );
  top.position.y = SPRING_TABLE_HEIGHT + 0.003;
  top.receiveShadow = true;
  grup.add(top);
  return grup;
}

function buatKaki(x) {
  const grup = new THREE.Group();
  const { postRadius, footRadius, footHeight, jointRadius } = SPRING_DIM;
  const yMid = SPRING_TABLE_HEIGHT + SPRING_STAND_HEIGHT / 2;
  const postLen = SPRING_STAND_HEIGHT - postRadius * 2;

  const foot = new THREE.Mesh(
    new THREE.CylinderGeometry(footRadius, footRadius * 1.15, footHeight, 20),
    mat({ color: SPRING_COLORS.foot, metalness: 0.5, roughness: 0.5 }),
  );
  foot.position.set(x, SPRING_TABLE_HEIGHT + footHeight / 2, 0);
  foot.castShadow = true;
  grup.add(foot);

  const post = new THREE.Mesh(
    new THREE.CapsuleGeometry(postRadius, postLen, 4, 12),
    mat({ color: SPRING_COLORS.stand, metalness: 0.4, roughness: 0.55 }),
  );
  post.position.set(x, yMid, 0);
  post.castShadow = true;
  grup.add(post);

  const joint = new THREE.Mesh(
    new THREE.SphereGeometry(jointRadius, 16, 12),
    mat({ color: SPRING_COLORS.joint, metalness: 0.45, roughness: 0.5 }),
  );
  joint.position.set(x, SPRING_ANCHOR_Y, 0);
  grup.add(joint);
  return grup;
}

function buatStandDanBalok() {
  const grup = new THREE.Group();
  grup.name = "Stand";
  const {
    postX,
    crossbarRadius,
    crossbarLength,
    clampWidth,
    clampHeight,
    clampDepth,
  } = SPRING_DIM;

  grup.add(buatKaki(-postX));
  grup.add(buatKaki(postX));

  const crossbarLen = crossbarLength - crossbarRadius * 2;
  const crossbar = new THREE.Mesh(
    new THREE.CapsuleGeometry(crossbarRadius, crossbarLen, 4, 16),
    mat({ color: SPRING_COLORS.crossbar, metalness: 0.4, roughness: 0.5 }),
  );
  crossbar.name = "TopBeam";
  crossbar.position.set(0, SPRING_ANCHOR_Y, 0);
  crossbar.rotation.z = Math.PI / 2;
  crossbar.castShadow = true;
  grup.add(crossbar);

  const clamp = new THREE.Mesh(
    new THREE.BoxGeometry(clampWidth, clampHeight, clampDepth),
    mat({ color: SPRING_COLORS.clamp, metalness: 0.4, roughness: 0.5 }),
  );
  clamp.position.set(0, SPRING_ANCHOR_Y - clampHeight / 2 + 0.006, 0);
  grup.add(clamp);
  return grup;
}

function buatFixedTopHook() {
  const grup = new THREE.Group();
  grup.name = "FixedTopHook";
  const { topConnectorRadius } = SPRING_DIM;

  const anchor = new THREE.Mesh(
    new THREE.SphereGeometry(0.014, 16, 12),
    mat({ color: SPRING_COLORS.anchor, metalness: 0.55, roughness: 0.4 }),
  );
  anchor.position.set(0, SPRING_TOP_ANCHOR_Y, 0);
  grup.add(anchor);

  const connector = new THREE.Mesh(
    new THREE.CylinderGeometry(
      topConnectorRadius,
      topConnectorRadius,
      SPRING_TOP_CONNECTOR_LEN,
      10,
    ),
    mat({ color: SPRING_COLORS.hook, metalness: 0.55, roughness: 0.42 }),
  );
  connector.position.set(0, (SPRING_TOP_ANCHOR_Y + SPRING_TOP_Y) / 2, 0);
  grup.add(connector);
  return grup;
}

function buatPanah(direction, length, color) {
  const grup = new THREE.Group();
  const shaftLen = Math.min(Math.max(length, 0.045), 0.11);
  const headH = 0.014;
  const ySign = direction === "up" ? 1 : -1;

  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.003, 0.003, shaftLen, 8),
    mat({ color, metalness: 0.2, roughness: 0.5 }),
  );
  shaft.position.y = (ySign * shaftLen) / 2;
  grup.add(shaft);

  const head = new THREE.Mesh(
    new THREE.ConeGeometry(0.008, headH, 10),
    mat({ color, metalness: 0.2, roughness: 0.5 }),
  );
  head.position.y = ySign * (shaftLen + headH / 2);
  if (direction === "down") head.rotation.x = Math.PI;
  grup.add(head);
  return grup;
}

/** Assembly bawah: pengait bawah, eyelet, beban, collar, panah. Bergerak sbg satu sistem. */
function buatBottomAnchor() {
  const grup = new THREE.Group();
  grup.name = "SpringBottomAnchor";

  const bottomHook = new THREE.Mesh(
    new THREE.CylinderGeometry(
      SPRING_DIM.bottomHookRadius,
      SPRING_DIM.bottomHookRadius,
      SPRING_BOTTOM_HOOK_LEN,
      10,
    ),
    mat({ color: SPRING_COLORS.hook, metalness: 0.55, roughness: 0.42 }),
  );
  bottomHook.position.y = -SPRING_BOTTOM_HOOK_LEN / 2;
  grup.add(bottomHook);

  const eyelet = new THREE.Mesh(
    new THREE.TorusGeometry(
      SPRING_DIM.eyeletRadius,
      SPRING_DIM.eyeletTube,
      8,
      20,
    ),
    mat({ color: SPRING_COLORS.hook, metalness: 0.55, roughness: 0.42 }),
  );
  eyelet.position.y = -SPRING_BOTTOM_HOOK_LEN;
  eyelet.rotation.x = Math.PI / 2;
  grup.add(eyelet);

  const massCenterLocalY = -SPRING_BOTTOM_HOOK_LEN - massH / 2;

  const mass = new THREE.Mesh(
    new THREE.CylinderGeometry(massR, massR * 0.96, massH, 24),
    mat({ color: SPRING_COLORS.mass, metalness: 0.3, roughness: 0.45 }),
  );
  mass.name = "Mass";
  mass.position.y = massCenterLocalY;
  mass.castShadow = true;
  grup.add(mass);

  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(massR * 0.55, massR * 0.7, 0.008, 16),
    mat({ color: SPRING_COLORS.massCollar, metalness: 0.35, roughness: 0.5 }),
  );
  collar.position.y = massCenterLocalY + massH / 2 + 0.004;
  grup.add(collar);

  const arrowLen = Math.min(0.1, 0.05 + WEIGHT_N / 60);
  const arrows = new THREE.Group();
  arrows.name = "ForceIndicators";
  arrows.position.set(0, massCenterLocalY, massR + 0.03);
  arrows.add(buatPanah("down", arrowLen, SPRING_COLORS.weightArrow));
  arrows.add(buatPanah("up", arrowLen, SPRING_COLORS.springArrow));
  grup.add(arrows);

  return grup;
}

/** Garis pengukuran statis (natural → terbebani), tidak ikut bergerak. */
function buatMeasurementGuide() {
  const grup = new THREE.Group();
  grup.name = "MeasurementGuide";
  const x = SPRING_DIM.rulerX;
  const naturalY = SPRING_TOP_Y - SPRING_NATURAL_VIS;
  const loadedY = SPRING_TOP_Y - eqLen;

  const bar = new THREE.Mesh(
    new THREE.BoxGeometry(0.0055, Math.abs(naturalY - loadedY), 0.004),
    mat({
      color: SPRING_COLORS.ruler,
      roughness: 0.7,
      transparent: true,
      opacity: 0.8,
    }),
  );
  bar.position.set(x, (naturalY + loadedY) / 2, 0.02);
  grup.add(bar);

  for (const [y, color] of [
    [naturalY, SPRING_COLORS.ruler],
    [loadedY, SPRING_COLORS.equilibrium],
  ]) {
    const tick = new THREE.Mesh(
      new THREE.BoxGeometry(0.026, 0.0022, 0.004),
      mat({ color, roughness: 0.7 }),
    );
    tick.position.set(x - 0.012, y, 0.02);
    grup.add(tick);
  }
  return grup;
}

function buatApparatus() {
  const grup = new THREE.Group();
  grup.add(buatMeja());
  grup.add(buatStandDanBalok());
  grup.add(buatFixedTopHook());
  grup.add(buatMeasurementGuide());
  return grup;
}

function buatSceneStatic() {
  const root = new THREE.Group();
  root.name = "HookeExperiment";
  root.scale.setScalar(AR_SCALE);
  root.add(buatApparatus());
  root.add(buatSpringStatic(eqLen));
  const bottom = buatBottomAnchor();
  bottom.position.y = SPRING_TOP_Y - eqLen;
  root.add(bottom);
  return root;
}

function buatSceneAnimated() {
  const root = new THREE.Group();
  root.name = "HookeExperiment";
  root.scale.setScalar(AR_SCALE);
  root.add(buatApparatus());

  const spring = buatSpringMorph();
  root.add(spring);

  const bottom = buatBottomAnchor();
  bottom.position.y = SPRING_TOP_Y - minLen;
  root.add(bottom);

  root.animations = buatAnimasi();
  return root;
}

function buatAnimasi() {
  const frames = 48;
  const times = [];
  const influence = [];
  const anchorPos = [];

  for (let i = 0; i <= frames; i++) {
    const t = (i / frames) * DURASI;
    // (1 - cos)/2: mulai & selesai di minLen (influence 0), tengah di maxLen.
    const f = (1 - Math.cos((2 * Math.PI * t) / DURASI)) / 2;
    const len = minLen + f * (maxLen - minLen);
    times.push(t);
    influence.push(f);
    anchorPos.push(0, SPRING_TOP_Y - len, 0);
  }

  return [
    new THREE.AnimationClip(CLIP_NAME, DURASI, [
      new THREE.NumberKeyframeTrack("Spring.morphTargetInfluences", times, influence),
      new THREE.VectorKeyframeTrack("SpringBottomAnchor.position", times, anchorPos),
    ]),
  ];
}

function eksporGlb(scene, animations) {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
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

async function verifikasi(buffer) {
  const loader = new GLTFLoader();
  const gltf = await loader.parseAsync(buffer, "");

  const nodeNames = [];
  gltf.scene.traverse((n) => {
    if (n.name) nodeNames.push(n.name);
  });
  console.log(
    `✓ Nodes: ${nodeNames.filter((n) => /Base|Stand|TopBeam|FixedTopHook|Spring|SpringBottomAnchor|Mass|Measurement|ForceIndicators/i.test(n)).join(", ")}`,
  );

  const box = new THREE.Box3().setFromObject(gltf.scene);
  const size = new THREE.Vector3();
  box.getSize(size);
  const min = new THREE.Vector3();
  box.getCenter(min);
  console.log(
    `✓ Bounding box: ${size.x.toFixed(2)} × ${size.y.toFixed(2)} × ${size.z.toFixed(2)} m (skala AR)`,
  );
  console.log(`✓ Base bawah Y ≈ ${box.min.y.toFixed(3)} m (harus ~0)`);

  const jumlah = gltf.animations?.length ?? 0;
  if (jumlah === 0) {
    console.warn("⚠ Animasi tidak ter-export.");
    return false;
  }
  const clip = gltf.animations[0];
  const hasMorph = clip.tracks.some((t) => t.name.includes("morphTargetInfluences"));
  const hasAnchor = clip.tracks.some((t) => t.name.includes("SpringBottomAnchor"));
  console.log(
    `✓ ${jumlah} clip. Pertama: "${clip.name}" (${clip.duration.toFixed(2)}s) | morph=${hasMorph} anchor=${hasAnchor}`,
  );
  if (clip.name !== CLIP_NAME) {
    console.warn(`⚠ Clip pertama bukan "${CLIP_NAME}".`);
  }
  return true;
}

async function eksporUsdz() {
  try {
    const root = buatSceneStatic();
    const scene = new THREE.Scene();
    scene.add(root);
    scene.updateMatrixWorld(true);

    const exporter = new USDZExporter();
    const result = await exporter.parseAsync(scene);
    const bytes = result instanceof Uint8Array ? result : new Uint8Array(result);
    writeFileSync(OUT_USDZ, Buffer.from(bytes));

    const size = statSync(OUT_USDZ).size;
    if (size < 1000) {
      console.warn("⚠ USDZ terlalu kecil — kemungkinan tidak valid.");
      return false;
    }
    console.log(
      `✓ hooke-elasticity-v2.usdz (${(size / 1024).toFixed(1)} KB) — statis @ setimbang (x≈19.6 cm)`,
    );
    console.log(
      "ℹ USDZ statis (Quick Look). GLB animated untuk Android/model-viewer.",
    );
    return true;
  } catch (err) {
    console.warn("⚠ Gagal membuat USDZ:", err?.message ?? err);
    return false;
  }
}

async function main() {
  const root = buatSceneAnimated();
  const scene = new THREE.Scene();
  scene.name = "HookeExperimentScene";
  scene.add(root);

  const buffer = await eksporGlb(scene, root.animations);
  mkdirSync(dirname(OUT_GLB), { recursive: true });
  writeFileSync(OUT_GLB, Buffer.from(buffer));
  console.log(`✓ hooke-elasticity-v2.glb (${(buffer.byteLength / 1024).toFixed(1)} KB)`);
  console.log(
    `  Skala AR: ${AR_SCALE}× — meja ~${(SPRING_TABLE_WIDTH * AR_SCALE).toFixed(2)} m lebar, tinggi ~${(SPRING_ANCHOR_Y * AR_SCALE).toFixed(2)} m`,
  );
  console.log(
    `  Demo: k=${K} N/m, m=${MASS} kg, g=${GRAVITY} → x≈${(EQ_EXT_M * 100).toFixed(1)} cm, F≈${WEIGHT_N.toFixed(1)} N`,
  );
  console.log(
    `  Loop: ${CLIP_NAME} ${DURASI}s, len ${minLen.toFixed(3)}→${maxLen.toFixed(3)} (eq ${eqLen.toFixed(3)})`,
  );
  await verifikasi(buffer);
  await eksporUsdz();
}

main().catch((err) => {
  console.error("Gagal membuat GLB:", err);
  process.exit(1);
});
