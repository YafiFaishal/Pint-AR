/**
 * Menghasilkan public/models/light-optics.glb
 * Demo AR: pembiasan udara → kaca, θ datang 45°, θ bias ≈ 28.13°
 * Visual sinkron dengan light-optics-scene.tsx (lihat light-optics-visual.mjs).
 *
 * Jalankan: npm run generate:light-optics-ar
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  FLASHLIGHT_COLORS,
  FLASHLIGHT_DIM,
  MEDIUM_VISUAL,
  OPTICS_COLORS,
  OPTICS_INTERFACE_Y,
  OPTICS_RAY_LEN,
  OPTICS_RAY_RADIUS,
  OPTICS_TABLE_HEIGHT,
} from "./light-optics-visual.mjs";

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
const OUT_GLB = join(__dirname, "../public/models/light-optics.glb");
const OUT_USDZ = join(__dirname, "../public/models/light-optics.usdz");

const INTERFACE_Y = OPTICS_INTERFACE_Y;
const RAY_LEN = OPTICS_RAY_LEN;
const RAY_RADIUS = OPTICS_RAY_RADIUS;
const TABLE_HEIGHT = OPTICS_TABLE_HEIGHT;
const AR_SCALE = 0.24;
const DURASI = 6;

const INCIDENT_DEG = 45;
const REFRACTED_DEG = 28.125;

function mat(opts) {
  return new THREE.MeshStandardMaterial(opts);
}

function matFisik(opts) {
  return new THREE.MeshPhysicalMaterial(opts);
}

function degToRad(d) {
  return (d * Math.PI) / 180;
}

function titikSumber(incidentDeg) {
  const r = degToRad(incidentDeg);
  return new THREE.Vector3(
    -Math.sin(r) * RAY_LEN,
    INTERFACE_Y + Math.cos(r) * RAY_LEN,
    0.02,
  );
}

function titikBias(refractedDeg) {
  const r = degToRad(refractedDeg);
  return new THREE.Vector3(
    Math.sin(r) * RAY_LEN,
    INTERFACE_Y - Math.cos(r) * RAY_LEN,
    0.02,
  );
}

function titikPantul(reflectedDeg) {
  const r = degToRad(reflectedDeg);
  return new THREE.Vector3(
    Math.sin(r) * RAY_LEN,
    INTERFACE_Y + Math.cos(r) * RAY_LEN,
    0.02,
  );
}

function quatMenujuTarget(dari, ke) {
  const dir = new THREE.Vector3().subVectors(ke, dari);
  if (dir.lengthSq() < 1e-8) return new THREE.Quaternion();
  dir.normalize();
  return new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(1, 0, 0),
    dir,
  );
}

function buatSinar(dari, ke, warna, nama, emissive = 0.42) {
  const grup = new THREE.Group();
  grup.name = nama;

  const arah = new THREE.Vector3().subVectors(ke, dari);
  const panjang = arah.length();
  arah.normalize();

  const silinder = new THREE.Mesh(
    new THREE.CylinderGeometry(RAY_RADIUS, RAY_RADIUS, panjang, 10),
    mat({
      color: warna,
      emissive: warna,
      emissiveIntensity: emissive,
      roughness: 0.28,
      metalness: 0.04,
    }),
  );
  silinder.position.y = panjang / 2;

  const inti = new THREE.Mesh(
    new THREE.CylinderGeometry(
      RAY_RADIUS * 0.45,
      RAY_RADIUS * 0.45,
      panjang,
      8,
    ),
    mat({
      color: 0xffffff,
      emissive: warna,
      emissiveIntensity: emissive * 0.55,
      roughness: 0.2,
    }),
  );
  inti.position.y = panjang / 2;

  const q = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    arah,
  );
  grup.quaternion.copy(q);
  grup.position.copy(dari);
  grup.add(silinder);
  grup.add(inti);

  return grup;
}

function buatMeja() {
  const grup = new THREE.Group();
  grup.name = "OpticsTable";

  const meja = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, TABLE_HEIGHT, 0.75),
    mat({ color: OPTICS_COLORS.table, metalness: 0.1, roughness: 0.58 }),
  );
  meja.position.y = TABLE_HEIGHT / 2;
  grup.add(meja);

  const atas = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 0.004, 0.65),
    mat({ color: OPTICS_COLORS.tableTop, roughness: 0.48, metalness: 0.04 }),
  );
  atas.position.y = TABLE_HEIGHT + 0.002;
  grup.add(atas);

  return grup;
}

function buatVolumeMedium(mediumId, yCenter, height, variant) {
  const vis = MEDIUM_VISUAL[mediumId];
  const isZone = variant === "zone";
  const color = isZone ? vis.zoneColor : vis.blockColor;
  const opacity = isZone ? vis.zoneOpacity : vis.blockOpacity;

  if (isZone && opacity < 0.03) return null;

  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.56, height, 0.3),
    isZone
      ? mat({
          color,
          transparent: true,
          opacity,
          roughness: 0.9,
          metalness: 0,
        })
      : matFisik({
          color,
          transparent: true,
          opacity,
          roughness: vis.blockRoughness,
          metalness: vis.blockMetalness,
          transmission: Math.min(0.55, opacity + 0.15),
          thickness: 0.12,
          ior: mediumId === "kaca" ? 1.5 : 1.33,
          clearcoat: 0.15,
          clearcoatRoughness: 0.25,
        }),
  );
  mesh.position.set(0, yCenter, -0.02);
  mesh.name = isZone ? `Zone_${mediumId}` : `Block_${mediumId}`;
  return mesh;
}

function buatSusunanMedium(medium1, medium2) {
  const grup = new THREE.Group();
  grup.name = "MediumAssembly";

  const tinggiAtas = 0.17;
  const tinggiBawah = 0.2;

  const zona = buatVolumeMedium(
    medium1,
    INTERFACE_Y + tinggiAtas / 2,
    tinggiAtas,
    "zone",
  );
  const blok = buatVolumeMedium(
    medium2,
    INTERFACE_Y - tinggiBawah / 2,
    tinggiBawah,
    "block",
  );
  if (zona) grup.add(zona);
  if (blok) grup.add(blok);

  const bidang = new THREE.Mesh(
    new THREE.BoxGeometry(0.58, 0.003, 0.34),
    mat({ color: OPTICS_COLORS.interface, roughness: 0.35, metalness: 0.08 }),
  );
  bidang.position.y = INTERFACE_Y;
  bidang.name = "InterfacePlane";
  grup.add(bidang);

  return grup;
}

function buatSenter(posisi, target) {
  const grup = new THREE.Group();
  grup.name = "Flashlight";
  grup.position.copy(posisi);
  grup.quaternion.copy(quatMenujuTarget(posisi, target));

  const d = FLASHLIGHT_DIM;

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(
      d.bodyRadiusBack,
      d.bodyRadiusFront,
      d.bodyLength,
      14,
    ),
    mat({ color: FLASHLIGHT_COLORS.body, metalness: 0.35, roughness: 0.45 }),
  );
  body.position.set(-d.bodyLength * 0.52, 0, 0);
  body.rotation.z = Math.PI / 2;
  grup.add(body);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(d.ringRadius, 0.0035, 8, 20),
    mat({ color: FLASHLIGHT_COLORS.grip, metalness: 0.4, roughness: 0.5 }),
  );
  ring.position.set(-d.bodyLength * 0.18, 0, 0);
  ring.rotation.y = Math.PI / 2;
  grup.add(ring);

  const head = new THREE.Mesh(
    new THREE.CylinderGeometry(
      d.headRadius,
      d.headRadius * 0.9,
      d.headLength,
      14,
    ),
    mat({ color: FLASHLIGHT_COLORS.head, metalness: 0.45, roughness: 0.38 }),
  );
  head.position.set(d.headLength * 0.42, 0, 0);
  head.rotation.z = Math.PI / 2;
  grup.add(head);

  const lens = new THREE.Mesh(
    new THREE.CylinderGeometry(
      d.lensRadius,
      d.lensRadius * 0.96,
      d.lensDepth,
      12,
    ),
    mat({
      color: FLASHLIGHT_COLORS.lens,
      emissive: FLASHLIGHT_COLORS.lensEmissive,
      emissiveIntensity: 0.65,
      roughness: 0.25,
      metalness: 0.05,
    }),
  );
  lens.position.set(d.headLength * 0.88, 0, 0);
  lens.rotation.z = Math.PI / 2;
  grup.add(lens);

  return grup;
}

function buatNormal() {
  const grup = new THREE.Group();
  grup.name = "NormalLine";

  const panjang = 0.3;
  const silinder = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0014, 0.0014, panjang, 6),
    mat({ color: OPTICS_COLORS.normal, roughness: 0.85, transparent: true, opacity: 0.75 }),
  );
  silinder.position.y = INTERFACE_Y;
  grup.add(silinder);

  return grup;
}

function buatAnimasi() {
  const times = [0, 0.4, 0.45, 1.2, 2.2, 3.5, 4.8, 5.2, DURASI];
  const incidentScale = [0, 0, 0, 0.35, 0.75, 1, 1, 0, 0];
  const secondaryScale = [0, 0, 0, 0, 0.4, 0.85, 1, 0, 0];

  return [
    new THREE.AnimationClip("LightRefractionDemo", DURASI, [
      new THREE.VectorKeyframeTrack(
        "IncidentRay.scale",
        times,
        incidentScale.flatMap((s) => [1, s, 1]),
      ),
      new THREE.VectorKeyframeTrack(
        "RefractedRay.scale",
        times,
        secondaryScale.flatMap((s) => [1, s, 1]),
      ),
      new THREE.VectorKeyframeTrack(
        "ReflectedRay.scale",
        times,
        secondaryScale.map((s) => s * 0.45).flatMap((s) => [1, s, 1]),
      ),
    ]),
  ];
}

function buatScene() {
  const root = new THREE.Group();
  root.name = "LightOpticsExperiment";
  root.scale.setScalar(AR_SCALE);

  const titik = new THREE.Vector3(0, INTERFACE_Y, 0);
  const sumber = titikSumber(INCIDENT_DEG);
  const bias = titikBias(REFRACTED_DEG);
  const pantul = titikPantul(INCIDENT_DEG);

  root.add(buatMeja());
  root.add(buatSusunanMedium("udara", "kaca"));
  root.add(buatNormal());
  root.add(buatSenter(sumber, titik));

  const incident = buatSinar(sumber, titik, OPTICS_COLORS.incident, "IncidentRay");
  const refracted = buatSinar(titik, bias, OPTICS_COLORS.refracted, "RefractedRay");
  const reflected = buatSinar(
    titik,
    pantul,
    OPTICS_COLORS.reflected,
    "ReflectedRay",
    0.22,
  );

  incident.scale.set(1, 0, 1);
  refracted.scale.set(1, 0, 1);
  reflected.scale.set(1, 0, 1);

  root.add(incident);
  root.add(refracted);
  root.add(reflected);

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
    `✓ Nodes: ${nodeNames.filter((n) => /Ray|Flash|Medium|Table|Normal|Interface|Zone|Block/i.test(n)).join(", ")}`,
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
  console.log(
    `✓ ${jumlah} animation clip: ${gltf.animations.map((a) => a.name).join(", ")} (${clip.duration.toFixed(1)}s)`,
  );
  return true;
}

async function cobaKonversiUsdz() {
  const { spawnSync } = await import("node:child_process");
  for (const cmd of ["usdz_converter", "usdzconvert"]) {
    const finder = spawnSync("xcrun", ["--find", cmd], { encoding: "utf8" });
    if (finder.status !== 0) continue;

    const usdzPath = finder.stdout.trim();
    const result = spawnSync(usdzPath, [OUT_GLB, OUT_USDZ], { encoding: "utf8" });
    if (result.status !== 0) continue;

    const { statSync } = await import("node:fs");
    const size = statSync(OUT_USDZ).size;
    if (size < 1000) continue;

    console.log(`✓ light-optics.usdz (${(size / 1024).toFixed(1)} KB) via ${cmd}`);
    console.log(
      "ℹ Animasi USDZ bergantung Quick Look — uji di iPhone; fallback statis jika animasi tidak berjalan.",
    );
    return true;
  }

  console.log(
    "ℹ usdz_converter tidak tersedia — konversi manual ke light-optics.usdz (lihat README-light-optics.md).",
  );
  return false;
}

async function main() {
  const root = buatScene();
  const scene = new THREE.Scene();
  scene.name = "LightOpticsScene";
  scene.add(root);

  const buffer = await eksporGlb(scene, root.animations);
  mkdirSync(dirname(OUT_GLB), { recursive: true });
  writeFileSync(OUT_GLB, Buffer.from(buffer));
  console.log(`✓ light-optics.glb (${(buffer.byteLength / 1024).toFixed(1)} KB)`);
  console.log(
    `  Skala AR: ${AR_SCALE}× — meja ~${(1.2 * AR_SCALE).toFixed(2)} m lebar`,
  );
  await verifikasi(buffer);
  await cobaKonversiUsdz();
}

main().catch((err) => {
  console.error("Gagal membuat GLB:", err);
  process.exit(1);
});
