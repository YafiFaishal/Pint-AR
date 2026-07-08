/**
 * Menghasilkan public/models/archimedes-buoyancy.glb
 * Geometri & warna disamakan dengan hukum-archimedes-scene.tsx (demo terapung).
 *
 * Jalankan: npm run generate:archimedes-ar
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
const OUT_GLB = join(__dirname, "../public/models/archimedes-buoyancy.glb");
const OUT_USDZ = join(__dirname, "../public/models/archimedes-buoyancy.usdz");
const FONT_PATH = join(
  __dirname,
  "../node_modules/three/examples/fonts/helvetiker_regular.typeface.json",
);

/** Sama dengan hukum-archimedes-scene.tsx */
const TABLE_HEIGHT = 0.05;
const TANK_INNER_W = 0.38;
const TANK_INNER_D = 0.28;
const TANK_INNER_H = 0.32;
const WALL_THICK = 0.01;
const LIQUID_HEIGHT = 0.26;
const METER_TO_UNIT = 0.55;
const AR_SCALE = 0.22;

const KEPALA_TINGGI = 0.048;
const PANAH_PANJANG = 0.18;
const LABEL_SIZE = 0.009;
const LABEL_DEPTH = 0.0006;

/** Demo: 1 kg, 0.002 m³, air 1000 kg/m³ → terapung 50% */
const VOLUME_M3 = 0.002;
const SUBMERGED_FRACTION = 0.5;
const DURASI = 6;

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

function liquidSurfaceY() {
  return TABLE_HEIGHT + LIQUID_HEIGHT;
}

function tankBottomY() {
  return TABLE_HEIGHT;
}

function objectHeightScene() {
  return Math.cbrt(VOLUME_M3) * METER_TO_UNIT;
}

function startCenterY() {
  const H = objectHeightScene();
  return liquidSurfaceY() + H * 0.55 + 0.04;
}

function floatCenterY() {
  const H = objectHeightScene();
  return liquidSurfaceY() + H * (0.5 - SUBMERGED_FRACTION);
}

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

/** Panah gaya — arah up/down dengan rotasi eksplisit, tanpa scale negatif. */
function createForceArrow({ direction, color, length, name }) {
  const material = mat({ color, metalness: 0.12, roughness: 0.5 });
  const panahAtas = buatPanahKeAtas(length, material);
  const grup = new THREE.Group();
  grup.name = name;

  if (direction === "down") {
    grup.rotation.x = Math.PI;
  }
  grup.add(panahAtas);
  return grup;
}

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

function buatMeja() {
  const grup = new THREE.Group();
  grup.name = "Base";

  const meja = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, TABLE_HEIGHT, 0.9),
    mat({ color: 0x94a3b8, metalness: 0.08, roughness: 0.62 }),
  );
  meja.position.y = TABLE_HEIGHT / 2;
  grup.add(meja);

  const atas = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 0.004, 0.8),
    mat({ color: 0xe2e8f0, roughness: 0.55 }),
  );
  atas.position.y = TABLE_HEIGHT + 0.002;
  grup.add(atas);

  return grup;
}

function buatBak() {
  const grup = new THREE.Group();
  grup.name = "Tank";

  const bottomY = tankBottomY();
  const midY = bottomY + TANK_INNER_H / 2;
  const liquidY = bottomY + LIQUID_HEIGHT / 2;

  const dasar = new THREE.Mesh(
    new THREE.BoxGeometry(TANK_INNER_W, 0.008, TANK_INNER_D),
    mat({ color: 0x64748b, roughness: 0.5 }),
  );
  dasar.position.y = bottomY + 0.004;
  grup.add(dasar);

  const cairan = new THREE.Mesh(
    new THREE.BoxGeometry(TANK_INNER_W - 0.02, LIQUID_HEIGHT, TANK_INNER_D - 0.02),
    mat({ color: 0x60a5fa, transparent: true, opacity: 0.35, roughness: 0.2 }),
  );
  cairan.name = "Liquid";
  cairan.position.y = liquidY;
  grup.add(cairan);

  const permukaan = new THREE.Mesh(
    new THREE.BoxGeometry(TANK_INNER_W - 0.01, 0.003, TANK_INNER_D - 0.01),
    mat({ color: 0x60a5fa, transparent: true, opacity: 0.55 }),
  );
  permukaan.position.y = liquidSurfaceY();
  grup.add(permukaan);

  const wallMat = mat({
    color: 0xcbd5e1,
    transparent: true,
    opacity: 0.22,
    roughness: 0.15,
  });

  const dinding = [
    [-TANK_INNER_W / 2 - WALL_THICK / 2, midY, 0, WALL_THICK, TANK_INNER_H, TANK_INNER_D + WALL_THICK * 2],
    [TANK_INNER_W / 2 + WALL_THICK / 2, midY, 0, WALL_THICK, TANK_INNER_H, TANK_INNER_D + WALL_THICK * 2],
    [0, midY, TANK_INNER_D / 2 + WALL_THICK / 2, TANK_INNER_W + WALL_THICK * 2, TANK_INNER_H, WALL_THICK],
    [0, midY, -TANK_INNER_D / 2 - WALL_THICK / 2, TANK_INNER_W + WALL_THICK * 2, TANK_INNER_H, WALL_THICK],
  ];

  for (const [x, y, z, w, h, d] of dinding) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
    m.position.set(x, y, z);
    grup.add(m);
  }

  return grup;
}

function buatIndikatorGaya(objectHeight) {
  const grup = new THREE.Group();
  grup.name = "ForceIndicators";

  const { ujungY } = dimensiPanah(PANAH_PANJANG);
  const offsetGaya = Math.min(objectHeight * 0.28 + 0.04, 0.1);

  const wGrup = new THREE.Group();
  wGrup.name = "WeightArrow";
  wGrup.position.set(-offsetGaya, 0, 0.025);
  wGrup.add(
    createForceArrow({
      direction: "down",
      color: 0xdc2626,
      length: PANAH_PANJANG,
      name: "WeightForceArrow",
    }),
  );
  wGrup.add(
    buatLabelHuruf("W", 0xb91c1c, [-0.038, -(ujungY + 0.022), 0]),
  );
  grup.add(wGrup);

  const faGrup = new THREE.Group();
  faGrup.name = "BuoyantArrow";
  faGrup.position.set(offsetGaya, 0, 0.025);
  faGrup.add(
    createForceArrow({
      direction: "up",
      color: 0x2563eb,
      length: PANAH_PANJANG,
      name: "BuoyantForceArrow",
    }),
  );
  faGrup.add(
    buatLabelHuruf("Fa", 0x1d4ed8, [0.045, ujungY + 0.022, 0]),
  );
  grup.add(faGrup);

  return grup;
}

function buatBenda() {
  const grup = new THREE.Group();
  grup.name = "TestObject";

  const H = objectHeightScene();
  const kubus = new THREE.Mesh(
    new THREE.BoxGeometry(H, H, H),
    mat({ color: 0xea580c, metalness: 0.28, roughness: 0.38 }),
  );
  grup.add(kubus);

  grup.add(buatIndikatorGaya(H));
  grup.position.set(0, startCenterY(), 0);
  return grup;
}

function buatAnimasi() {
  const yAtas = startCenterY();
  const yTerapung = floatCenterY();
  const jatuh = yAtas - yTerapung;

  /** Turun dengan percepatan, jeda terapung, reset singkat. */
  const times = [0, 0.6, 0.65, 1.6, 2.5, 3.4, 4.8, 5.2, DURASI];
  const fraksi = [0, 0, 0, 0.28, 0.62, 0.92, 1, 0, 0];
  const ys = fraksi.map((f) => yAtas - jatuh * f);

  const posisiBenda = new THREE.VectorKeyframeTrack(
    "TestObject.position",
    times,
    ys.flatMap((y) => [0, y, 0]),
  );

  return [
    new THREE.AnimationClip("ArchimedesFloatDemo", DURASI, [posisiBenda]),
  ];
}

function buatScene() {
  const root = new THREE.Group();
  root.name = "ArchimedesExperiment";
  root.scale.setScalar(AR_SCALE);

  root.add(buatMeja());
  root.add(buatBak());

  const benda = buatBenda();
  root.add(benda);

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
    `✓ Nodes: ${nodeNames.filter((n) => /Base|Tank|Liquid|TestObject|Arrow|Label|Force/i.test(n)).join(", ")}`,
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
  const converter = spawnSync("xcrun", ["--find", "usdz_converter"], {
    encoding: "utf8",
  });
  if (converter.status !== 0) {
    console.log(
      "ℹ usdz_converter tidak tersedia — konversi manual ke archimedes-buoyancy.usdz (lihat README-archimedes.md).",
    );
    return false;
  }

  const usdzPath = converter.stdout.trim();
  const result = spawnSync(usdzPath, [OUT_GLB, OUT_USDZ], { encoding: "utf8" });

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

  console.log(`✓ archimedes-buoyancy.usdz (${(size / 1024).toFixed(1)} KB)`);
  console.log(
    "ℹ Animasi USDZ bergantung Quick Look — uji di iPhone jika animasi diperlukan.",
  );
  return true;
}

async function main() {
  const root = buatScene();
  const scene = new THREE.Scene();
  scene.name = "ArchimedesScene";
  scene.add(root);

  const buffer = await eksporGlb(scene, root.animations);
  mkdirSync(dirname(OUT_GLB), { recursive: true });
  writeFileSync(OUT_GLB, Buffer.from(buffer));
  console.log(
    `✓ archimedes-buoyancy.glb (${(buffer.byteLength / 1024).toFixed(1)} KB)`,
  );
  console.log(
    `  Skala AR: ${AR_SCALE}× — meja ~${(1.4 * AR_SCALE).toFixed(2)} m lebar`,
  );
  await verifikasi(buffer);

  const usdzOk = await cobaKonversiUsdz();
  if (!usdzOk) {
    try {
      const { unlinkSync, existsSync } = await import("node:fs");
      if (existsSync(OUT_USDZ)) {
        unlinkSync(OUT_USDZ);
        console.log("ℹ USDZ lama dihapus — konversi ulang diperlukan untuk AR iOS.");
      }
    } catch {
      /* abaikan */
    }
  }
}

main().catch((err) => {
  console.error("Gagal membuat GLB:", err);
  process.exit(1);
});
