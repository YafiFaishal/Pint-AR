/**
 * Menghasilkan public/models/newton-force.glb
 * Lintasan + balok + panah gaya — low-poly clean untuk AR Quick Look / WebXR.
 *
 * Jalankan: npm run generate:newton-ar
 *
 * TODO: setelah regenerasi GLB, konversi ulang newton-force.usdz (Reality Converter).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
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
const OUT_FILE = join(__dirname, "../public/models/newton-force.glb");

const DURASI = 2.5;
const PANJANG = 1.35;
const LEBAR = 0.28;
const TINGGI = 0.09;
const UKURAN_BALOK = 0.17;
const BALOK_AWAL_X = -0.22;
const BALOK_AKHIR_X = 0.18;

function buatPanahGaya() {
  const grup = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    metalness: 0.15,
    roughness: 0.5,
  });

  const panjangBatang = 0.36;
  const batang = new THREE.Mesh(
    new THREE.CylinderGeometry(0.016, 0.019, panjangBatang, 10),
    material,
  );
  batang.rotation.z = -Math.PI / 2;
  batang.position.x = panjangBatang / 2;
  grup.add(batang);

  const kepala = new THREE.Mesh(
    new THREE.ConeGeometry(0.042, 0.095, 10),
    material,
  );
  kepala.rotation.z = -Math.PI / 2;
  kepala.position.x = panjangBatang + 0.045;
  grup.add(kepala);

  return grup;
}

function buatAnimasi(balokGrup) {
  const y = balokGrup.position.y;
  const z = balokGrup.position.z;
  const times = [0, DURASI * 0.55, DURASI];

  const posisiBalok = new THREE.VectorKeyframeTrack(
    "Balok.position",
    times,
    [BALOK_AWAL_X, y, z, BALOK_AKHIR_X, y, z, BALOK_AWAL_X, y, z],
  );

  const pulsePanah = new THREE.VectorKeyframeTrack(
    "PanahGaya.scale",
    [0, DURASI * 0.45, DURASI],
    [1, 1, 1, 1.1, 1.1, 1.1, 1, 1, 1],
  );

  return [
    new THREE.AnimationClip("NewtonDorong", DURASI, [posisiBalok, pulsePanah]),
  ];
}

function buatScene() {
  const root = new THREE.Group();
  root.name = "NewtonForceAR";

  const matLintasan = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    metalness: 0.12,
    roughness: 0.52,
  });
  const matAtas = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.08,
    roughness: 0.48,
  });
  const matBalok = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8,
    metalness: 0.22,
    roughness: 0.42,
  });
  const matKaki = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.85,
  });

  const lintasanGrup = new THREE.Group();
  lintasanGrup.name = "Lintasan";

  const dasar = new THREE.Mesh(
    new THREE.BoxGeometry(PANJANG, TINGGI, LEBAR),
    matLintasan,
  );
  dasar.position.y = TINGGI / 2;
  lintasanGrup.add(dasar);

  const atas = new THREE.Mesh(
    new THREE.BoxGeometry(PANJANG - 0.08, 0.006, LEBAR - 0.05),
    matAtas,
  );
  atas.position.y = TINGGI + 0.003;
  lintasanGrup.add(atas);

  const garis = new THREE.Mesh(
    new THREE.BoxGeometry(PANJANG - 0.22, 0.004, 0.025),
    new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 }),
  );
  garis.position.y = TINGGI + 0.006;
  lintasanGrup.add(garis);

  for (const sisi of [-1, 1]) {
    const ujung = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.007, LEBAR - 0.06),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.75 }),
    );
    ujung.position.set(sisi * (PANJANG / 2 - 0.03), TINGGI + 0.005, 0);
    lintasanGrup.add(ujung);
  }

  const posKaki = [
    [-0.52, -0.01, 0.1],
    [0.52, -0.01, 0.1],
    [-0.52, -0.01, -0.1],
    [0.52, -0.01, -0.1],
  ];
  for (const [x, y, z] of posKaki) {
    const kaki = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.016, 0.012, 8),
      matKaki,
    );
    kaki.position.set(x, y, z);
    lintasanGrup.add(kaki);
  }

  root.add(lintasanGrup);

  const balokY = TINGGI + UKURAN_BALOK / 2 + 0.008;
  const balokGrup = new THREE.Group();
  balokGrup.name = "Balok";
  balokGrup.position.set(BALOK_AWAL_X, balokY, 0);

  const balok = new THREE.Mesh(
    new THREE.BoxGeometry(UKURAN_BALOK, UKURAN_BALOK, UKURAN_BALOK),
    matBalok,
  );
  balokGrup.add(balok);

  const highlight = new THREE.Mesh(
    new THREE.BoxGeometry(UKURAN_BALOK * 0.82, 0.01, UKURAN_BALOK * 0.82),
    new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      metalness: 0.1,
      roughness: 0.35,
    }),
  );
  highlight.position.y = UKURAN_BALOK / 2 - 0.006;
  balokGrup.add(highlight);

  root.add(balokGrup);

  const panah = buatPanahGaya();
  panah.name = "PanahGaya";
  panah.position.set(UKURAN_BALOK / 2 + 0.015, 0, 0.045);
  balokGrup.add(panah);

  root.updateMatrixWorld(true);
  root.animations = buatAnimasi(balokGrup);

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
  if (jumlah === 0) {
    console.warn("⚠ Animasi tidak ter-export — AR akan memakai model statis.");
    return false;
  }
  console.log(
    `✓ ${jumlah} animation clip: ${gltf.animations.map((a) => a.name).join(", ")}`,
  );
  return true;
}

async function main() {
  const root = buatScene();
  const scene = new THREE.Scene();
  scene.name = "NewtonScene";
  scene.add(root);

  const buffer = await eksporGlb(scene, root.animations);
  mkdirSync(dirname(OUT_FILE), { recursive: true });
  writeFileSync(OUT_FILE, Buffer.from(buffer));
  console.log(`✓ newton-force.glb (${(buffer.byteLength / 1024).toFixed(1)} KB)`);
  await verifikasi(buffer);
  console.log(
    "ℹ Konversi ulang newton-force.usdz jika AR iOS perlu diperbarui.",
  );
}

main().catch((err) => {
  console.error("Gagal membuat GLB:", err);
  process.exit(1);
});
