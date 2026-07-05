/**
 * Menghasilkan public/models/chemistry-reaction.glb
 * Geometri & warna disamakan dengan reaksi-kimia-scene.tsx (tray + 2 tabung + beaker).
 *
 * Jalankan: npm run generate:chemistry-ar
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
const OUT_FILE = join(__dirname, "../public/models/chemistry-reaction.glb");

/** Low-poly untuk mobile AR — proporsi sama dengan scene web */
const SEG = 16;

/** Warna larutan awal (merah + ungu) — netralisasi/indikator */
const WARNA_KIRI = 0xef4444;
const WARNA_KANAN = 0x8b5cf6;
const TINGGI_ISI = 0.32;
const DURASI = 4.5;
const JUMLAH_FRAME = 30;

function mat(opts) {
  return new THREE.MeshStandardMaterial(opts);
}

function matKaca() {
  return new THREE.MeshPhysicalMaterial({
    color: 0xf8fafc,
    metalness: 0,
    roughness: 0.06,
    transmission: 0.88,
    transparent: true,
    opacity: 1,
    thickness: 0.012,
    ior: 1.48,
    side: THREE.FrontSide,
  });
}

function buatBibirAtas(radius, y) {
  const grup = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(radius * 0.96, radius * 1.045, SEG),
    mat({ color: 0xcbd5e1, metalness: 0.18, roughness: 0.16 }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = y;
  grup.add(ring);
  return grup;
}

function buatSelubungKaca({ radiusAtas, radiusBawah, tinggi, y, tutupBawah = false }) {
  const grup = new THREE.Group();
  grup.position.y = y + tinggi / 2;

  const kaca = matKaca();
  const silinder = new THREE.Mesh(
    new THREE.CylinderGeometry(radiusAtas, radiusBawah, tinggi, SEG, 1, true),
    kaca,
  );
  grup.add(silinder);
  grup.add(buatBibirAtas(radiusAtas, tinggi / 2 + 0.002));

  if (tutupBawah) {
    const dasar = new THREE.Mesh(
      new THREE.CircleGeometry(radiusBawah * 0.92, SEG),
      kaca,
    );
    dasar.rotation.x = -Math.PI / 2;
    dasar.position.y = -tinggi / 2 + 0.002;
    grup.add(dasar);
  }

  return grup;
}

function buatCairan({ radiusAtas, radiusBawah, tinggi, warna, y, name }) {
  if (tinggi < 0.012) return new THREE.Group();

  const grup = new THREE.Group();
  grup.name = name;
  grup.position.y = y;

  const matCairan = mat({ color: warna, roughness: 0.32, metalness: 0.04 });

  const silinder = new THREE.Mesh(
    new THREE.CylinderGeometry(radiusAtas, radiusBawah, tinggi, SEG),
    matCairan,
  );
  silinder.position.y = tinggi / 2;
  grup.add(silinder);

  const permukaan = new THREE.Mesh(
    new THREE.CircleGeometry(radiusAtas * 0.96, SEG),
    mat({ color: warna, roughness: 0.22, metalness: 0.02 }),
  );
  permukaan.rotation.x = -Math.PI / 2;
  permukaan.position.y = tinggi + 0.001;
  grup.add(permukaan);

  return grup;
}

function buatDudukanTabung() {
  const grup = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.048, 0.052, 0.012, SEG),
    mat({ color: 0x475569, metalness: 0.35, roughness: 0.42 }),
  );
  base.position.y = 0.006;
  grup.add(base);

  const clamp = new THREE.Mesh(
    new THREE.RingGeometry(0.054, 0.062, SEG),
    mat({ color: 0x64748b, metalness: 0.4, roughness: 0.38 }),
  );
  clamp.rotation.x = -Math.PI / 2;
  clamp.position.y = 0.024;
  grup.add(clamp);

  return grup;
}

function buatTabungReaksi({ posisi, warnaCairan, tinggiIsi }) {
  const tinggi = 0.68;
  const radius = 0.062;
  const yDasar = 0.028;
  const radiusCairan = radius * 0.78;
  const isi = Math.max(0.08, Math.min(0.5, tinggiIsi));

  const grup = new THREE.Group();
  grup.name = posisi[0] < 0 ? "TabungKiri" : "TabungKanan";
  grup.position.set(...posisi);

  grup.add(buatDudukanTabung());

  const dasarKaca = new THREE.Mesh(
    new THREE.CircleGeometry(radius * 0.9, SEG),
    new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      transmission: 0.82,
      transparent: true,
      roughness: 0.08,
      thickness: 0.008,
      ior: 1.48,
      side: THREE.DoubleSide,
    }),
  );
  dasarKaca.rotation.x = -Math.PI / 2;
  dasarKaca.position.y = yDasar + 0.006;
  grup.add(dasarKaca);

  grup.add(
    buatSelubungKaca({
      radiusAtas: radius,
      radiusBawah: radius * 0.94,
      tinggi,
      y: yDasar,
    }),
  );

  grup.add(
    buatCairan({
      radiusAtas: radiusCairan,
      radiusBawah: radiusCairan * 0.92,
      tinggi: isi * tinggi * 0.88,
      warna: warnaCairan,
      y: yDasar + 0.018,
      name: posisi[0] < 0 ? "CairanKiri" : "CairanKanan",
    }),
  );

  return grup;
}

function buatGelasHasil() {
  const tinggi = 0.72;
  const radiusAtas = 0.145;
  const radiusBawah = 0.108;
  const yDasar = 0.024;
  const radiusCairanAtas = radiusAtas * 0.82;
  const radiusCairanBawah = radiusBawah * 0.88;
  const tinggiCairan = 0.38 * tinggi * 0.82;

  const grup = new THREE.Group();
  grup.name = "BeakerTengah";

  const alas = new THREE.Mesh(
    new THREE.CylinderGeometry(radiusBawah * 1.05, radiusBawah * 1.08, 0.016, SEG),
    mat({ color: 0x64748b, metalness: 0.2, roughness: 0.48 }),
  );
  alas.position.y = 0.008;
  grup.add(alas);

  grup.add(
    buatSelubungKaca({
      radiusAtas,
      radiusBawah,
      tinggi,
      y: yDasar,
      tutupBawah: true,
    }),
  );

  const cairanHasil = buatCairan({
    radiusAtas: radiusCairanAtas,
    radiusBawah: radiusCairanBawah,
    tinggi: tinggiCairan,
    warna: 0x22c55e,
    y: yDasar + 0.012,
    name: "CairanHasil",
  });
  cairanHasil.scale.y = 0.06;
  grup.add(cairanHasil);

  for (let i = 0; i < 3; i++) {
    const gelembung = new THREE.Mesh(
      new THREE.SphereGeometry(0.009, 6, 6),
      mat({
        color: 0xe0f2fe,
        transparent: true,
        opacity: 0.55,
        roughness: 0.2,
      }),
    );
    gelembung.name = `Gelembung${i + 1}`;
    gelembung.position.set(
      Math.sin(i * 2.1) * 0.03,
      yDasar + 0.08 + i * 0.04,
      Math.cos(i * 1.7) * 0.025,
    );
    grup.add(gelembung);
  }

  return grup;
}

function buatAnimasi() {
  const times = [0, DURASI * 0.55, DURASI];
  const scaleUniform = (a, b, c) => [a, a, a, b, b, b, c, c, c];

  const tracks = [
    new THREE.VectorKeyframeTrack(
      "CairanKiri.scale",
      times,
      scaleUniform(1, 0.38, 1),
    ),
    new THREE.VectorKeyframeTrack(
      "CairanKanan.scale",
      times,
      scaleUniform(1, 0.38, 1),
    ),
    new THREE.VectorKeyframeTrack(
      "CairanHasil.scale",
      times,
      scaleUniform(0.06, 0.82, 0.06),
    ),
  ];

  for (let i = 0; i < 3; i++) {
    const yBase = 0.08 + i * 0.035;
    const bubbleTimes = [];
    const bubbleValues = [];
    for (let f = 0; f <= JUMLAH_FRAME; f++) {
      const t = (f / JUMLAH_FRAME) * DURASI;
      bubbleTimes.push(t);
      const phase = (t / DURASI + i * 0.22) % 1;
      bubbleValues.push(
        Math.sin(i * 2.1) * 0.03,
        yBase + phase * 0.14,
        Math.cos(i * 1.7) * 0.025,
      );
    }
    tracks.push(
      new THREE.VectorKeyframeTrack(
        `Gelembung${i + 1}.position`,
        bubbleTimes,
        bubbleValues,
      ),
    );
  }

  return [new THREE.AnimationClip("ReaksiCampurDemo", DURASI, tracks)];
}

function buatTray() {
  const grup = new THREE.Group();
  grup.name = "TrayLab";

  const tray = new THREE.Mesh(
    new THREE.BoxGeometry(1.85, 0.018, 0.82),
    mat({ color: 0x475569, roughness: 0.55, metalness: 0.08 }),
  );
  tray.position.y = 0.01;
  grup.add(tray);

  const permukaan = new THREE.Mesh(
    new THREE.BoxGeometry(1.72, 0.003, 0.72),
    mat({ color: 0xe2e8f0, roughness: 0.38 }),
  );
  permukaan.position.y = 0.022;
  grup.add(permukaan);

  const tepiMat = mat({ color: 0x64748b, roughness: 0.5 });
  for (const [pos, size] of [
    [[0, 0.028, 0.36], [1.72, 0.006, 0.006]],
    [[0, 0.028, -0.36], [1.72, 0.006, 0.006]],
    [[0.86, 0.028, 0], [0.006, 0.006, 0.72]],
    [[-0.86, 0.028, 0], [0.006, 0.006, 0.72]],
  ]) {
    const tepi = new THREE.Mesh(new THREE.BoxGeometry(...size), tepiMat);
    tepi.position.set(...pos);
    grup.add(tepi);
  }

  return grup;
}

function buatScene() {
  const root = new THREE.Group();
  root.name = "ChemistryReactionAR";

  root.add(buatTray());
  root.add(
    buatTabungReaksi({
      posisi: [-0.46, 0.018, 0.1],
      warnaCairan: WARNA_KIRI,
      tinggiIsi: TINGGI_ISI,
    }),
  );
  root.add(
    buatTabungReaksi({
      posisi: [0.46, 0.018, 0.1],
      warnaCairan: WARNA_KANAN,
      tinggiIsi: TINGGI_ISI,
    }),
  );
  root.add(buatGelasHasil());

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
  scene.name = "ChemistryReactionScene";
  scene.add(root);

  const buffer = await eksporGlb(scene, root.animations);
  mkdirSync(dirname(OUT_FILE), { recursive: true });
  writeFileSync(OUT_FILE, Buffer.from(buffer));
  console.log(
    `✓ chemistry-reaction.glb (${(buffer.byteLength / 1024).toFixed(1)} KB)`,
  );
  await verifikasi(buffer);
  console.log(
    "ℹ Konversi manual: chemistry-reaction.glb → chemistry-reaction.usdz untuk AR iOS.",
  );
}

main().catch((err) => {
  console.error("Gagal membuat GLB:", err);
  process.exit(1);
});
