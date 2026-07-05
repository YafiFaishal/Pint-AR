/**
 * Menghasilkan public/models/newton-force.glb
 * Lintasan abu-abu + balok biru + panah gaya merah, terpusat di origin.
 *
 * Jalankan: npm run generate:newton-ar
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

// Polyfill minimal untuk GLTFExporter di Node.js
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
const OUT_FILE = join(OUT_DIR, "newton-force.glb");

function buatPanahGaya() {
  const grup = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    metalness: 0.1,
    roughness: 0.6,
  });

  const panjangBatang = 0.42;
  const batang = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.018, panjangBatang, 10),
    material,
  );
  batang.rotation.z = -Math.PI / 2;
  batang.position.x = panjangBatang / 2;
  grup.add(batang);

  const kepala = new THREE.Mesh(
    new THREE.ConeGeometry(0.045, 0.1, 10),
    material,
  );
  kepala.rotation.z = -Math.PI / 2;
  kepala.position.x = panjangBatang + 0.05;
  grup.add(kepala);

  return grup;
}

function buatScene() {
  const root = new THREE.Group();
  root.name = "NewtonForceAR";

  const materialLintasan = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.05,
    roughness: 0.85,
  });
  const materialBalok = new THREE.MeshStandardMaterial({
    color: 0x2563eb,
    metalness: 0.15,
    roughness: 0.55,
  });

  const lintasan = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.04, 0.36),
    materialLintasan,
  );
  lintasan.name = "Lintasan";
  lintasan.position.y = 0.02;
  root.add(lintasan);

  const ukuranBalok = 0.18;
  const balok = new THREE.Mesh(
    new THREE.BoxGeometry(ukuranBalok, ukuranBalok, ukuranBalok),
    materialBalok,
  );
  balok.name = "Balok";
  balok.position.y = 0.04 + ukuranBalok / 2;
  root.add(balok);

  const panah = buatPanahGaya();
  panah.name = "PanahGaya";
  panah.position.set(ukuranBalok / 2 + 0.02, balok.position.y, 0.06);
  root.add(panah);

  return root;
}

async function eksporGlb(scene) {
  const exporter = new GLTFExporter();
  return new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      (result) => {
        if (result instanceof ArrayBuffer) {
          resolve(result);
          return;
        }
        reject(new Error("GLTFExporter mengembalikan format JSON, bukan GLB"));
      },
      (err) => reject(err),
      { binary: true },
    );
  });
}

async function main() {
  const scene = buatScene();
  const buffer = await eksporGlb(scene);

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, Buffer.from(buffer));

  const kb = (buffer.byteLength / 1024).toFixed(1);
  console.log(`✓ newton-force.glb ditulis (${kb} KB) → ${OUT_FILE}`);
}

main().catch((err) => {
  console.error("Gagal membuat GLB:", err);
  process.exit(1);
});
