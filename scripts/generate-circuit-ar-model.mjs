/**
 * Menghasilkan public/models/circuit-simple.glb
 * Rangkaian listrik + animasi arus (titik bergerak) & pulse lampu.
 *
 * Jalankan: npm run generate:circuit-ar
 *
 * TODO iterasi berikutnya: sinkronkan animasi AR dengan state saklar ON/OFF
 * dari praktikum interaktif (saat ini AR selalu menampilkan rangkaian aktif).
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
const OUT_FILE = join(__dirname, "../public/models/circuit-simple.glb");

const BOARD_TOP = 0.1;
const WIRE_Y = 0.118;
const Z_DEPAN = 0.05;
const Z_BELAKANG = -0.24;
const X_BAT = -0.7;
const X_SAK = 0;
const X_LAM = 0.7;
const DURASI = 2.5;
const JUMLAH_ARUS = 5;
const JUMLAH_FRAME = 32;

const JALUR_ARUS = [
  [X_BAT + 0.11, WIRE_Y, Z_DEPAN],
  [X_BAT + 0.26, WIRE_Y, Z_DEPAN],
  [X_SAK - 0.13, WIRE_Y, Z_DEPAN],
  [X_SAK + 0.13, WIRE_Y, Z_DEPAN],
  [X_LAM - 0.26, WIRE_Y, Z_DEPAN],
  [X_LAM - 0.1, WIRE_Y, Z_DEPAN],
  [X_LAM + 0.02, WIRE_Y, Z_DEPAN],
  [X_LAM + 0.02, WIRE_Y, Z_BELAKANG],
  [X_BAT - 0.02, WIRE_Y, Z_BELAKANG],
  [X_BAT - 0.02, WIRE_Y, Z_DEPAN],
  [X_BAT + 0.11, WIRE_Y, Z_DEPAN],
];

function posisiDiJalur(t) {
  const segmen = JALUR_ARUS.length - 1;
  let sisa = (t % 1) * segmen;
  for (let i = 0; i < segmen; i++) {
    if (sisa <= 1) {
      const a = JALUR_ARUS[i];
      const b = JALUR_ARUS[i + 1];
      return new THREE.Vector3(
        a[0] + (b[0] - a[0]) * sisa,
        a[1] + (b[1] - a[1]) * sisa,
        a[2] + (b[2] - a[2]) * sisa,
      );
    }
    sisa -= 1;
  }
  const akhir = JALUR_ARUS[JALUR_ARUS.length - 1];
  return new THREE.Vector3(akhir[0], akhir[1], akhir[2]);
}

function buatAnimasi(dots, bulb) {
  const tracks = [];

  dots.forEach((dot, idx) => {
    const times = [];
    const values = [];
    const phase = idx / dots.length;
    for (let f = 0; f <= JUMLAH_FRAME; f++) {
      const t = f / JUMLAH_FRAME;
      times.push(t * DURASI);
      const pos = posisiDiJalur((t + phase) % 1);
      values.push(pos.x, pos.y, pos.z);
    }
    tracks.push(
      new THREE.VectorKeyframeTrack(`${dot.name}.position`, times, values),
    );
  });

  const pulseTimes = [0, DURASI * 0.25, DURASI * 0.5, DURASI * 0.75, DURASI];
  const pulseScale = [1, 1, 1, 1.1, 1.1, 1.1, 1, 1, 1, 1.06, 1.06, 1.06, 1, 1, 1];
  tracks.push(
    new THREE.VectorKeyframeTrack(`${bulb.name}.scale`, pulseTimes, pulseScale),
  );

  return [new THREE.AnimationClip("RangkaianAktif", DURASI, tracks)];
}

function buatScene() {
  const root = new THREE.Group();
  root.name = "CircuitSimpleAR";

  const matBoard = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.15,
    roughness: 0.45,
  });
  const matBoardTop = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.2,
    roughness: 0.38,
  });
  const matKabel = new THREE.MeshStandardMaterial({
    color: 0xb87333,
    metalness: 0.72,
    roughness: 0.28,
  });
  const matBaterai = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.25,
    roughness: 0.55,
  });
  const matSaklar = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    metalness: 0.35,
    roughness: 0.45,
  });
  const matLampu = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xfde047,
    emissiveIntensity: 0.65,
    metalness: 0.05,
    roughness: 0.15,
    transparent: true,
    opacity: 0.92,
  });
  const matArus = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.1,
  });
  const matSocket = new THREE.MeshStandardMaterial({
    color: 0x475569,
    metalness: 0.5,
    roughness: 0.35,
  });

  const board = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.1, 0.78), matBoard);
  board.name = "Board";
  board.position.set(0, BOARD_TOP / 2 - 0.01, -0.04);
  board.castShadow = true;
  board.receiveShadow = true;
  root.add(board);

  const topPlate = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.006, 0.68), matBoardTop);
  topPlate.position.set(0, BOARD_TOP + 0.001, -0.04);
  topPlate.name = "BoardTop";
  root.add(topPlate);

  const titik = JALUR_ARUS.map(([x, y, z]) => new THREE.Vector3(x, y, z));
  const kurva = new THREE.CatmullRomCurve3(titik, true, "centripetal", 0.35);
  const kabel = new THREE.Mesh(
    new THREE.TubeGeometry(kurva, 100, 0.021, 10, true),
    matKabel,
  );
  kabel.name = "Kabel";
  kabel.castShadow = true;
  root.add(kabel);

  const batGrup = new THREE.Group();
  batGrup.name = "Baterai";
  batGrup.position.set(X_BAT, BOARD_TOP, Z_DEPAN);
  const batBody = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.28, 0.13), matBaterai);
  batBody.position.y = 0.14;
  batBody.castShadow = true;
  batGrup.add(batBody);
  root.add(batGrup);

  const sakGrup = new THREE.Group();
  sakGrup.name = "Saklar";
  sakGrup.position.set(X_SAK, BOARD_TOP, Z_DEPAN);
  const sakBase = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.12), matSaklar);
  sakBase.position.y = 0.07;
  sakBase.castShadow = true;
  sakGrup.add(sakBase);
  root.add(sakGrup);

  const lamGrup = new THREE.Group();
  lamGrup.name = "Lampu";
  lamGrup.position.set(X_LAM, BOARD_TOP, Z_DEPAN);
  const socket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.065, 0.04, 14),
    matSocket,
  );
  socket.position.y = 0.02;
  lamGrup.add(socket);
  root.add(lamGrup);

  /** Bola lampu di root agar animasi scale ter-export ke GLB. */
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.095, 16, 16), matLampu);
  bulb.name = "LampuBulb";
  bulb.position.set(X_LAM, BOARD_TOP + 0.14, Z_DEPAN);
  bulb.castShadow = true;
  root.add(bulb);

  /** Titik arus di root agar jalur animasi GLTF sederhana. */
  const dots = [];
  for (let i = 0; i < JUMLAH_ARUS; i++) {
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), matArus);
    dot.name = `ArusDot${i}`;
    const awal = posisiDiJalur(i / JUMLAH_ARUS);
    dot.position.copy(awal);
    root.add(dot);
    dots.push(dot);
  }

  root.updateMatrixWorld(true);
  root.animations = buatAnimasi(dots, bulb);

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
  console.log(`✓ ${jumlah} animation clip: ${gltf.animations.map((a) => a.name).join(", ")}`);
  return true;
}

async function main() {
  const root = buatScene();
  const scene = new THREE.Scene();
  scene.name = "CircuitScene";
  scene.add(root);
  scene.animations = root.animations;

  const buffer = await eksporGlb(scene, root.animations);
  mkdirSync(dirname(OUT_FILE), { recursive: true });
  writeFileSync(OUT_FILE, Buffer.from(buffer));
  console.log(`✓ circuit-simple.glb (${(buffer.byteLength / 1024).toFixed(1)} KB)`);
  await verifikasi(buffer);
}

main().catch((e) => {
  console.error("Gagal membuat GLB:", e);
  process.exit(1);
});
