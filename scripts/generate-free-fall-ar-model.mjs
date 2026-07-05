/**
 * Menghasilkan public/models/free-fall.glb
 * Geometri & warna disamakan dengan jatuh-bebas-scene.tsx (tinggi referensi 10 m).
 * Diskalakan untuk ukuran meja AR (~0.64 m lebar lantai).
 *
 * Jalankan: npm run generate:free-fall-ar
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
const OUT_FILE = join(__dirname, "../public/models/free-fall.glb");

/** Sama dengan jatuh-bebas-scene.tsx — tinggi referensi tetap untuk AR */
const TINGGI_METER = 10;
const METER_TO_UNIT = 0.11;
const RADIUS_BOLA = 0.09;
const TINGGI_LANTAI = 0.06;
const AR_SCALE = 0.2;

const DURASI = 2.2;
const h = TINGGI_METER * METER_TO_UNIT;

function mat(opts) {
  return new THREE.MeshStandardMaterial(opts);
}

function yBolaAtas() {
  return h + TINGGI_LANTAI + RADIUS_BOLA;
}

function yBolaBawah() {
  return TINGGI_LANTAI + RADIUS_BOLA + 0.01;
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

  return grup;
}

function buatPanahGravitasi() {
  const grup = new THREE.Group();
  grup.name = "PanahGravitasi";

  const panjang = Math.min(0.38 + h * 0.08, 0.62);
  const kepala = 0.07;
  const batang = Math.max(panjang - kepala * 0.5, 0.12);
  const y = h * 0.55 + TINGGI_LANTAI + 0.05;

  const material = mat({ color: 0xdc2626, metalness: 0.12, roughness: 0.5 });

  const silinder = new THREE.Mesh(
    new THREE.CylinderGeometry(0.014, 0.018, batang, 8),
    material,
  );
  silinder.position.y = -batang / 2;
  grup.add(silinder);

  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(0.034, kepala, 8),
    material,
  );
  cone.position.y = -batang - kepala * 0.32;
  grup.add(cone);

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
  highlight.position.set(
    0,
    RADIUS_BOLA * 0.35,
    RADIUS_BOLA * 0.55,
  );
  grup.add(highlight);

  grup.position.set(0, yBolaAtas(), 0);
  return grup;
}

function buatAnimasi(bolaGrup) {
  const x = bolaGrup.position.x;
  const z = bolaGrup.position.z;
  const yAtas = yBolaAtas();
  const yBawah = yBolaBawah();
  const times = [0, DURASI * 0.72, DURASI];

  const posisiBola = new THREE.VectorKeyframeTrack(
    "Bola.position",
    times,
    [x, yAtas, z, x, yBawah, z, x, yAtas, z],
  );

  return [new THREE.AnimationClip("FreeFallDrop", DURASI, [posisiBola])];
}

function buatScene() {
  const root = new THREE.Group();
  root.name = "FreeFallAR";
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
  scene.name = "FreeFallScene";
  scene.add(root);

  const buffer = await eksporGlb(scene, root.animations);
  mkdirSync(dirname(OUT_FILE), { recursive: true });
  writeFileSync(OUT_FILE, Buffer.from(buffer));
  console.log(`✓ free-fall.glb (${(buffer.byteLength / 1024).toFixed(1)} KB)`);
  console.log(
    `  Skala AR: ${AR_SCALE}× — lantai ~${(3.2 * AR_SCALE).toFixed(2)} m lebar`,
  );
  await verifikasi(buffer);
  console.log(
    "ℹ Konversi manual: free-fall.glb → free-fall.usdz untuk AR iOS.",
  );
}

main().catch((err) => {
  console.error("Gagal membuat GLB:", err);
  process.exit(1);
});
