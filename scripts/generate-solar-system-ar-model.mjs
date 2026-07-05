/**
 * Menghasilkan public/models/solar-system.glb
 * Orrery tabletop edukatif — bukan skala riil.
 * Matahari + 4 planet + Bulan, orbit ring tipis, animasi loop ringan.
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

/** Satu siklus — Jupiter ~1 putaran penuh */
const DURASI = 12;
const JUMLAH_FRAME = 40;
const Y_ORBIT = 0.028;
const RADIUS_ALAS = 0.34;

/** Skala edukatif: planet terlihat jelas, jarak orbit kompak */
const PLANET = {
  merkurius: {
    label: "Merkurius",
    radius: 0.085,
    ukuran: 0.013,
    warna: 0x9ca3af,
    fase: 0.4,
  },
  bumi: {
    label: "Bumi",
    radius: 0.135,
    ukuran: 0.016,
    warna: 0x2563eb,
    fase: 1.8,
  },
  mars: {
    label: "Mars",
    radius: 0.185,
    ukuran: 0.014,
    warna: 0xd45c2a,
    fase: 3.1,
  },
  jupiter: {
    label: "Jupiter",
    radius: 0.27,
    ukuran: 0.034,
    warna: 0xc98b3d,
    fase: 4.6,
  },
};

const JARAK_ORBIT_BULAN = 0.034;
const UKURAN_BULAN = 0.0055;
/** Bulan cepat mengelilingi Bumi */
const PERIODE_BULAN = 1.4;

function periodeRelatif(r) {
  return Math.sqrt(r ** 3);
}

function posisiOrbit(radius, sudut) {
  return [Math.cos(sudut) * radius, Y_ORBIT, Math.sin(sudut) * radius];
}

function buatOrbitRing(radius) {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(radius - 0.001, radius + 0.001, 64),
    new THREE.MeshBasicMaterial({
      color: 0x64748b,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
    }),
  );
  ring.name = `OrbitRing_${radius.toFixed(2)}`;
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = Y_ORBIT - 0.001;
  return ring;
}

function buatPlanet(id, data) {
  const grup = new THREE.Group();
  grup.name = `Planet_${id}`;

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(data.ukuran, 14, 14),
    new THREE.MeshStandardMaterial({
      color: data.warna,
      metalness: 0.08,
      roughness: 0.58,
    }),
  );
  mesh.name = data.label;
  mesh.castShadow = true;
  grup.add(mesh);

  if (id === "jupiter") {
    const stripe = new THREE.Mesh(
      new THREE.TorusGeometry(data.ukuran * 0.92, data.ukuran * 0.08, 4, 20),
      new THREE.MeshStandardMaterial({
        color: 0xd4a574,
        roughness: 0.65,
      }),
    );
    stripe.rotation.x = Math.PI / 2.4;
    grup.add(stripe);
  }

  if (id === "bumi") {
    const land = new THREE.Mesh(
      new THREE.SphereGeometry(data.ukuran * 0.88, 10, 10, 0, Math.PI * 2, 0, Math.PI * 0.45),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.7 }),
    );
    land.rotation.z = 0.35;
    grup.add(land);
  }

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
    new THREE.SphereGeometry(UKURAN_BULAN, 10, 10),
    new THREE.MeshStandardMaterial({
      color: 0xe5e7eb,
      emissive: 0x9ca3af,
      emissiveIntensity: 0.12,
      roughness: 0.82,
    }),
  );
  bulan.name = "Bulan";
  bulanGrup.add(bulan);

  const sudutAwal = 0.9;
  bulanGrup.position.set(
    Math.cos(sudutAwal) * JARAK_ORBIT_BULAN,
    0,
    Math.sin(sudutAwal) * JARAK_ORBIT_BULAN,
  );
  grup.add(bulanGrup);

  const orbitBulan = new THREE.Mesh(
    new THREE.RingGeometry(
      JARAK_ORBIT_BULAN - 0.0005,
      JARAK_ORBIT_BULAN + 0.0005,
      32,
    ),
    new THREE.MeshBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
    }),
  );
  orbitBulan.name = "OrbitBulan";
  orbitBulan.rotation.x = -Math.PI / 2;
  grup.add(orbitBulan);

  return { grup, bulanGrup };
}

function buatAnimasi(planetGroups, bulanGrup, matahariHalo) {
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

  if (matahariHalo) {
    const times = [0, DURASI * 0.5, DURASI];
    tracks.push(
      new THREE.VectorKeyframeTrack(
        `${matahariHalo.name}.scale`,
        times,
        [1, 1, 1, 1.14, 1.14, 1.14, 1, 1, 1],
      ),
    );
  }

  return [new THREE.AnimationClip("TataSuryaOrbit", DURASI, tracks)];
}

function buatAlas() {
  const grup = new THREE.Group();
  grup.name = "AlasOrrery";

  const bidang = new THREE.Mesh(
    new THREE.CylinderGeometry(RADIUS_ALAS, RADIUS_ALAS * 1.02, 0.012, 48),
    new THREE.MeshStandardMaterial({
      color: 0x1a2332,
      roughness: 0.88,
      metalness: 0.12,
    }),
  );
  bidang.name = "BidangOrbit";
  bidang.position.y = 0.006;
  bidang.receiveShadow = true;
  grup.add(bidang);

  const tepi = new THREE.Mesh(
    new THREE.TorusGeometry(RADIUS_ALAS * 1.01, 0.003, 6, 48),
    new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.25,
      roughness: 0.55,
    }),
  );
  tepi.name = "TepiAlas";
  tepi.rotation.x = Math.PI / 2;
  tepi.position.y = 0.012;
  grup.add(tepi);

  const tiang = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.012, Y_ORBIT, 8),
    new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6 }),
  );
  tiang.name = "TiangPusat";
  tiang.position.y = Y_ORBIT / 2;
  grup.add(tiang);

  return grup;
}

function buatMatahari() {
  const grup = new THREE.Group();
  grup.name = "MatahariGrup";

  const matahari = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 18, 18),
    new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf97316,
      emissiveIntensity: 0.7,
      roughness: 0.38,
    }),
  );
  matahari.name = "Matahari";
  matahari.position.y = Y_ORBIT;
  matahari.castShadow = true;
  grup.add(matahari);

  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(0.062, 14, 14),
    new THREE.MeshBasicMaterial({
      color: 0xfcd34d,
      transparent: true,
      opacity: 0.14,
    }),
  );
  halo.name = "MatahariHalo";
  halo.position.y = Y_ORBIT;
  grup.add(halo);

  return { grup, halo };
}

function buatScene() {
  const root = new THREE.Group();
  root.name = "SolarSystemAR";

  root.add(buatAlas());

  const { grup: matahariGrup, halo } = buatMatahari();
  root.add(matahariGrup);

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
  root.animations = buatAnimasi(planetGroups, bulanGrup, halo);

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
  const trackCount = gltf.animations[0]?.tracks?.length ?? 0;
  console.log(`  ${trackCount} track (planet + bulan + halo matahari)`);
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
  console.log(
    `  Orrery tabletop ~${(RADIUS_ALAS * 2).toFixed(2)} m lebar — tanpa sky sphere`,
  );
  await verifikasi(buffer);
  console.log(
    "ℹ Konversi ulang solar-system.usdz untuk iOS (animasi mungkin statis jika konversi tidak membawa clip).",
  );
}

main().catch((err) => {
  console.error("Gagal membuat GLB:", err);
  process.exit(1);
});
