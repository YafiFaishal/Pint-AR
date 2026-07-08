/**
 * Menghasilkan public/models/free-fall.glb
 * Geometri & warna disamakan dengan jatuh-bebas-scene.tsx (tinggi referensi 10 m).
 * Diskalakan untuk ukuran meja AR (~0.64 m lebar lantai).
 *
 * Jalankan: npm run generate:free-fall-ar
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

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
const OUT_GLB = join(__dirname, "../public/models/free-fall.glb");
const OUT_USDZ = join(__dirname, "../public/models/free-fall.usdz");
const FONT_PATH = join(
  __dirname,
  "../node_modules/three/examples/fonts/helvetiker_regular.typeface.json",
);

/** Sama dengan jatuh-bebas-scene.tsx — tinggi referensi tetap untuk AR */
const TINGGI_METER = 10;
const METER_TO_UNIT = 0.11;
const RADIUS_BOLA = 0.09;
const TINGGI_LANTAI = 0.06;
const AR_SCALE = 0.2;

const KEPALA_TINGGI = 0.048;
const LABEL_SIZE = 0.009;
const LABEL_DEPTH = 0.0006;

const DURASI = 5;
const h = TINGGI_METER * METER_TO_UNIT;

let fontCache = null;

function mat(opts) {
  return new THREE.MeshStandardMaterial(opts);
}

function loadFont() {
  if (!fontCache) {
    const loader = new FontLoader();
    fontCache = loader.parse(JSON.parse(readFileSync(FONT_PATH, "utf8")));
  }
  return fontCache;
}

function yBolaAtas() {
  return h + TINGGI_LANTAI + RADIUS_BOLA;
}

function yBolaBawah() {
  return TINGGI_LANTAI + RADIUS_BOLA + 0.01;
}

/** Panjang batang + posisi ujung panah — sama dengan scene web. */
function dimensiPanah(panjang) {
  const batang = Math.max(panjang - KEPALA_TINGGI * 0.55, 0.07);
  const ujungY = batang + KEPALA_TINGGI * 0.42;
  return { batang, ujungY };
}

function buatPanahKeAtas(panjang, material) {
  const { batang, ujungY } = dimensiPanah(panjang);
  const r = 0.0075;
  const grup = new THREE.Group();

  const silinder = new THREE.Mesh(
    new THREE.CylinderGeometry(r, r * 1.12, batang, 10),
    material,
  );
  silinder.position.y = batang / 2;
  grup.add(silinder);

  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(0.02, KEPALA_TINGGI, 10),
    material,
  );
  cone.position.y = ujungY;
  grup.add(cone);

  return grup;
}

function buatPanahKeBawah(panjang, material) {
  const grup = buatPanahKeAtas(panjang, material);
  grup.rotation.x = Math.PI;
  return grup;
}

/** Label huruf kecil datar — tanpa extrusion tebal. */
function buatLabelHuruf(teks, color, posisi) {
  const geo = new TextGeometry(teks, {
    font: loadFont(),
    size: LABEL_SIZE,
    depth: LABEL_DEPTH,
    curveSegments: 3,
    bevelEnabled: false,
  });
  geo.computeBoundingBox();
  const bb = geo.boundingBox;
  geo.translate(-(bb.max.x + bb.min.x) / 2, -(bb.max.y + bb.min.y) / 2, 0);

  const mesh = new THREE.Mesh(
    geo,
    mat({ color, roughness: 0.55, metalness: 0.05 }),
  );
  mesh.position.set(posisi[0], posisi[1], posisi[2]);
  mesh.name = `Label_${teks}`;
  return mesh;
}

function buatLantai() {
  const grup = new THREE.Group();
  grup.name = "Lantai";

  const lantai = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, TINGGI_LANTAI, 1.6),
    mat({ color: 0x94a3b8, metalness: 0.08, roughness: 0.62 }),
  );
  lantai.position.y = TINGGI_LANTAI / 2;
  grup.add(lantai);

  const atas = new THREE.Mesh(
    new THREE.BoxGeometry(3.0, 0.004, 1.4),
    mat({ color: 0xe2e8f0, roughness: 0.55 }),
  );
  atas.position.y = TINGGI_LANTAI + 0.002;
  grup.add(atas);

  return grup;
}

function buatMenara() {
  const grup = new THREE.Group();
  grup.name = "Menara";
  grup.position.set(-0.72, 0, 0);

  const jumlahTanda = Math.min(Math.floor(TINGGI_METER / 5) + 1, 5);
  const midY = TINGGI_LANTAI + h / 2;

  const tiang = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, h, 0.05),
    mat({ color: 0x64748b, metalness: 0.15, roughness: 0.55 }),
  );
  tiang.position.y = midY;
  grup.add(tiang);

  const garis = new THREE.Mesh(
    new THREE.BoxGeometry(0.006, h, 0.006),
    mat({ color: 0x475569, roughness: 0.7 }),
  );
  garis.position.set(0.06, midY, 0);
  grup.add(garis);

  for (let i = 0; i < jumlahTanda; i++) {
    const fraksi = i / Math.max(jumlahTanda - 1, 1);
    const y = TINGGI_LANTAI + h * fraksi;
    const tanda = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.01, 0.01),
      mat({ color: 0x334155, roughness: 0.75 }),
    );
    tanda.position.set(0.1, y, 0);
    grup.add(tanda);
  }

  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.03, 0.22),
    mat({ color: 0xcbd5e1, metalness: 0.1, roughness: 0.5 }),
  );
  platform.position.set(0, h + TINGGI_LANTAI + 0.015, 0);
  grup.add(platform);

  grup.add(buatLabelHuruf("h", 0x475569, [-0.1, midY, 0.1]));

  return grup;
}

function buatPanahGravitasi() {
  const grup = new THREE.Group();
  grup.name = "PanahGravitasi";

  const panjang = Math.min(0.28 + h * 0.06, 0.42);
  const y = h * 0.55 + TINGGI_LANTAI + 0.05;
  const { ujungY } = dimensiPanah(panjang);
  const material = mat({ color: 0xdc2626, metalness: 0.12, roughness: 0.5 });

  const panah = buatPanahKeBawah(panjang, material);
  grup.add(panah);

  grup.add(buatLabelHuruf("g", 0xb91c1c, [0.038, -(ujungY + 0.022), 0]));

  grup.position.set(0.78, y, 0.42);
  return grup;
}

function buatBola() {
  const grup = new THREE.Group();
  grup.name = "Bola";

  const bola = new THREE.Mesh(
    new THREE.SphereGeometry(RADIUS_BOLA, 20, 20),
    mat({ color: 0xea580c, metalness: 0.28, roughness: 0.38 }),
  );
  grup.add(bola);

  const highlight = new THREE.Mesh(
    new THREE.SphereGeometry(RADIUS_BOLA * 0.18, 8, 8),
    mat({ color: 0xfed7aa, roughness: 0.3, metalness: 0.05 }),
  );
  highlight.position.set(0, RADIUS_BOLA * 0.35, RADIUS_BOLA * 0.55);
  grup.add(highlight);

  grup.position.set(0, yBolaAtas(), 0);
  return grup;
}

function buatAnimasi(bolaGrup) {
  const x = bolaGrup.position.x;
  const z = bolaGrup.position.z;
  const yAtas = yBolaAtas();
  const yBawah = yBolaBawah();
  const jatuh = yAtas - yBawah;

  /** Timing non-linear: percepatan jatuh, jeda di bawah, reset singkat. */
  const times = [0, 0.5, 0.55, 1.4, 2.4, 3.4, 3.75, 4.0, DURASI];
  const fraksi = [0, 0, 0, 0.22, 0.52, 0.92, 1, 0, 0];
  const ys = fraksi.map((f) => yAtas - jatuh * f);

  const posisiBola = new THREE.VectorKeyframeTrack(
    "Bola.position",
    times,
    ys.flatMap((y) => [x, y, z]),
  );

  return [new THREE.AnimationClip("FreeFallDemo", DURASI, [posisiBola])];
}

function buatScene() {
  const root = new THREE.Group();
  root.name = "FreeFallExperiment";
  root.scale.setScalar(AR_SCALE);

  root.add(buatLantai());
  root.add(buatMenara());
  root.add(buatPanahGravitasi());

  const bola = buatBola();
  root.add(bola);

  root.updateMatrixWorld(true);
  root.animations = buatAnimasi(bola);

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
  const jumlah = gltf.animations?.length ?? 0;

  const nodeNames = [];
  gltf.scene.traverse((n) => {
    if (n.name) nodeNames.push(n.name);
  });

  console.log(`✓ Nodes: ${nodeNames.filter((n) => /Bola|Menara|Panah|Label|Lantai/i.test(n)).join(", ")}`);

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
  const converter = spawnSync("xcrun", ["--find", "usdz_converter"], {
    encoding: "utf8",
  });
  if (converter.status !== 0) {
    console.log(
      "ℹ usdz_converter tidak tersedia — konversi manual ke free-fall.usdz (lihat README-free-fall.md).",
    );
    return false;
  }

  const usdzPath = converter.stdout.trim();
  const result = spawnSync(
    usdzPath,
    [OUT_GLB, OUT_USDZ],
    { encoding: "utf8" },
  );

  if (result.status !== 0) {
    console.warn("⚠ Konversi USDZ gagal:", result.stderr || result.stdout);
    return false;
  }

  const { statSync } = await import("node:fs");
  const size = statSync(OUT_USDZ).size;
  if (size < 1000) {
    console.warn("⚠ USDZ terlalu kecil — kemungkinan file tidak valid.");
    return false;
  }

  console.log(`✓ free-fall.usdz (${(size / 1024).toFixed(1)} KB)`);
  console.log(
    "ℹ Animasi USDZ bergantung Quick Look — uji di iPhone jika animasi diperlukan.",
  );
  return true;
}

async function main() {
  const root = buatScene();
  const scene = new THREE.Scene();
  scene.name = "FreeFallScene";
  scene.add(root);

  const buffer = await eksporGlb(scene, root.animations);
  mkdirSync(dirname(OUT_GLB), { recursive: true });
  writeFileSync(OUT_GLB, Buffer.from(buffer));
  console.log(`✓ free-fall.glb (${(buffer.byteLength / 1024).toFixed(1)} KB)`);
  console.log(
    `  Skala AR: ${AR_SCALE}× — lantai ~${(3.2 * AR_SCALE).toFixed(2)} m lebar`,
  );
  await verifikasi(buffer);
  await cobaKonversiUsdz();
}

main().catch((err) => {
  console.error("Gagal membuat GLB:", err);
  process.exit(1);
});
