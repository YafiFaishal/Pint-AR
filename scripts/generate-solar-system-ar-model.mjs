/**
 * Menghasilkan public/models/solar-system.glb
 * Tata Surya low-poly untuk AR Quick Look / WebXR / Scene Viewer.
 *
 * Jalankan: npm run generate:solar-ar
 *
 * USDZ (iOS): konversi manual dari GLB — lihat public/models/README-solar-system.md
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
const OUT_FILE = join(__dirname, "../public/models/solar-system.glb");

/** Durasi satu siklus animasi — Jupiter ~1 putaran penuh */
const DURASI = 10;
const JUMLAH_FRAME = 36;
const Y_ORBIT = 0.022;

const PLANET = {
  merkurius: { label: "Merkurius", radius: 0.09, ukuran: 0.009, warna: 0x8b7355, fase: 0.3 },
  bumi: { label: "Bumi", radius: 0.14, ukuran: 0.011, warna: 0x2563eb, fase: 1.6 },
  mars: { label: "Mars", radius: 0.19, ukuran: 0.01, warna: 0xd45c2a, fase: 2.9 },
  jupiter: { label: "Jupiter", radius: 0.28, ukuran: 0.02, warna: 0xc98b3d, fase: 4.2 },
};

const JARAK_ORBIT_BULAN = 0.028;
const UKURAN_BULAN = 0.004;
const PERIODE_BULAN = 1.2;

function periodeRelatif(r) {
  return Math.sqrt(r ** 3);
}

function posisiOrbit(radius, sudut) {
  return [
    Math.cos(sudut) * radius,
    Y_ORBIT,
    Math.sin(sudut) * radius,
  ];
}

function buatOrbitRing(radius) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius, 0.0012, 4, 56),
    new THREE.MeshBasicMaterial({
      color: 0x64748b,
      transparent: true,
      opacity: 0.35,
    }),
  );
  ring.name = `Orbit_${radius.toFixed(2)}`;
  ring.rotation.x = Math.PI / 2;
  ring.position.y = Y_ORBIT - 0.002;
  return ring;
}

function buatPlanet(id, data) {
  const grup = new THREE.Group();
  grup.name = `Planet_${id}`;

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(data.ukuran, 12, 12),
    new THREE.MeshStandardMaterial({
      color: data.warna,
      metalness: 0.06,
      roughness: 0.62,
    }),
  );
  mesh.name = data.label;
  mesh.castShadow = true;
  grup.add(mesh);

  const awal = posisiOrbit(data.radius, data.fase);
  grup.position.set(awal[0], awal[1], awal[2]);

  return grup;
}

function buatBumiDenganBulan() {
  const data = PLANET.bumi;
  const grup = buatPlanet("bumi", data);

  const bulanGrup = new THREE.Group();
  bulanGrup.name = "BulanBumi";

  const bulan = new THREE.Mesh(
    new THREE.SphereGeometry(UKURAN_BULAN, 8, 8),
    new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      emissive: 0x9ca3af,
      emissiveIntensity: 0.15,
      roughness: 0.85,
    }),
  );
  bulan.name = "Bulan";
  bulanGrup.add(bulan);

  const sudutAwal = 0.6;
  bulanGrup.position.set(
    Math.cos(sudutAwal) * JARAK_ORBIT_BULAN,
    0,
    Math.sin(sudutAwal) * JARAK_ORBIT_BULAN,
  );
  grup.add(bulanGrup);

  const orbitBulan = new THREE.Mesh(
    new THREE.TorusGeometry(JARAK_ORBIT_BULAN, 0.0006, 4, 32),
    new THREE.MeshBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.22,
    }),
  );
  orbitBulan.name = "OrbitBulan";
  orbitBulan.rotation.x = Math.PI / 2;
  grup.add(orbitBulan);

  return { grup, bulanGrup };
}

function buatAnimasi(planetGroups, bulanGrup) {
  const tracks = [];

  for (const [id, data] of Object.entries(PLANET)) {
    const grup = planetGroups[id];
    if (!grup) continue;

    const periode =
      (periodeRelatif(data.radius) / periodeRelatif(PLANET.jupiter.radius)) *
      DURASI;
    const times = [];
    const values = [];

    for (let f = 0; f <= JUMLAH_FRAME; f++) {
      const t = (f / JUMLAH_FRAME) * DURASI;
      times.push(t);
      const sudut = (t / periode) * Math.PI * 2 + data.fase;
      const [x, y, z] = posisiOrbit(data.radius, sudut);
      values.push(x, y, z);
    }

    tracks.push(
      new THREE.VectorKeyframeTrack(`${grup.name}.position`, times, values),
    );
  }

  if (bulanGrup) {
    const times = [];
    const values = [];
    const frameBulan = JUMLAH_FRAME * 2;
    for (let f = 0; f <= frameBulan; f++) {
      const t = (f / frameBulan) * DURASI;
      times.push(t);
      const sudut = (t / PERIODE_BULAN) * Math.PI * 2;
      values.push(
        Math.cos(sudut) * JARAK_ORBIT_BULAN,
        0,
        Math.sin(sudut) * JARAK_ORBIT_BULAN,
      );
    }
    tracks.push(
      new THREE.VectorKeyframeTrack(
        `${bulanGrup.name}.position`,
        times,
        values,
      ),
    );
  }

  return [new THREE.AnimationClip("TataSuryaOrbit", DURASI, tracks)];
}

function buatScene() {
  const root = new THREE.Group();
  root.name = "SolarSystemAR";

  const bidang = new THREE.Mesh(
    new THREE.CircleGeometry(0.34, 48),
    new THREE.MeshStandardMaterial({
      color: 0x1a2332,
      roughness: 0.92,
      metalness: 0.05,
    }),
  );
  bidang.name = "BidangOrbit";
  bidang.rotation.x = -Math.PI / 2;
  bidang.position.y = 0.005;
  bidang.receiveShadow = true;
  root.add(bidang);

  const matahari = new THREE.Mesh(
    new THREE.SphereGeometry(0.042, 16, 16),
    new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf97316,
      emissiveIntensity: 0.65,
      roughness: 0.4,
    }),
  );
  matahari.name = "Matahari";
  matahari.position.y = Y_ORBIT;
  matahari.castShadow = true;
  root.add(matahari);

  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(0.052, 12, 12),
    new THREE.MeshBasicMaterial({
      color: 0xfcd34d,
      transparent: true,
      opacity: 0.12,
    }),
  );
  halo.name = "MatahariHalo";
  halo.position.y = Y_ORBIT;
  root.add(halo);

  for (const data of Object.values(PLANET)) {
    root.add(buatOrbitRing(data.radius));
  }

  const planetGroups = {};
  planetGroups.merkurius = buatPlanet("merkurius", PLANET.merkurius);
  root.add(planetGroups.merkurius);

  const { grup: bumi, bulanGrup } = buatBumiDenganBulan();
  planetGroups.bumi = bumi;
  root.add(bumi);

  planetGroups.mars = buatPlanet("mars", PLANET.mars);
  root.add(planetGroups.mars);

  planetGroups.jupiter = buatPlanet("jupiter", PLANET.jupiter);
  root.add(planetGroups.jupiter);

  root.updateMatrixWorld(true);
  root.animations = buatAnimasi(planetGroups, bulanGrup);

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
  scene.name = "TataSuryaScene";
  scene.add(root);

  const buffer = await eksporGlb(scene, root.animations);
  mkdirSync(dirname(OUT_FILE), { recursive: true });
  writeFileSync(OUT_FILE, Buffer.from(buffer));
  console.log(
    `✓ solar-system.glb (${(buffer.byteLength / 1024).toFixed(1)} KB)`,
  );
  await verifikasi(buffer);
  console.log(
    "ℹ Konversi solar-system.usdz untuk iOS: lihat public/models/README-solar-system.md",
  );
}

main().catch((err) => {
  console.error("Gagal membuat GLB:", err);
  process.exit(1);
});
