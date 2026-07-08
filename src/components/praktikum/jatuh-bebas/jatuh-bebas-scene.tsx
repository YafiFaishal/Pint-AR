"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { Group } from "three";
import {
  gravitasiEfektif,
  hitungWaktuJatuh,
  type ModeJatuh,
} from "@/lib/jatuh-bebas-utils";

const METER_TO_UNIT = 0.11;
const RADIUS_BOLA = 0.09;
const TINGGI_LANTAI = 0.06;

const MAT_MENARA = { color: "#64748b", metalness: 0.15, roughness: 0.55 } as const;
const MAT_BOLA = { color: "#ea580c", metalness: 0.28, roughness: 0.38 } as const;
const MAT_LANTAI = { color: "#94a3b8", metalness: 0.08, roughness: 0.62 } as const;
const MAT_PANAH = { color: "#dc2626", metalness: 0.12, roughness: 0.5 } as const;

const KEPALA_TINGGI = 0.048;
const LABEL_FONT_PX = 9;

/** Panjang batang + posisi ujung panah (relatif pusat). */
function dimensiPanah(panjang: number): { batang: number; ujungY: number } {
  const batang = Math.max(panjang - KEPALA_TINGGI * 0.55, 0.07);
  const ujungY = batang + KEPALA_TINGGI * 0.42;
  return { batang, ujungY };
}

/** Geometri panah vertikal ke atas — diputar 180° untuk arah ke bawah. */
function PanahKeAtas({
  panjang,
  warna,
}: {
  panjang: number;
  warna: { color: string; metalness: number; roughness: number };
}) {
  const { batang, ujungY } = dimensiPanah(panjang);
  const r = 0.0075;

  return (
    <group>
      <mesh position={[0, batang / 2, 0]} castShadow>
        <cylinderGeometry args={[r, r * 1.12, batang, 10]} />
        <meshStandardMaterial {...warna} />
      </mesh>
      <mesh position={[0, ujungY, 0]} castShadow>
        <coneGeometry args={[0.02, KEPALA_TINGGI, 10]} />
        <meshStandardMaterial {...warna} />
      </mesh>
    </group>
  );
}

function PanahKeBawah({
  panjang,
  warna,
}: {
  panjang: number;
  warna: { color: string; metalness: number; roughness: number };
}) {
  return (
    <group rotation={[Math.PI, 0, 0]}>
      <PanahKeAtas panjang={panjang} warna={warna} />
    </group>
  );
}

/** Label simbol kecil — ukuran pixel tetap, konsisten dengan modul Archimedes. */
function LabelSimbol({
  teks,
  posisi,
  warna = "#475569",
}: {
  teks: string;
  posisi: [number, number, number];
  warna?: string;
}) {
  return (
    <Html
      position={posisi}
      center
      transform={false}
      zIndexRange={[10, 0]}
      style={{ pointerEvents: "none" }}
    >
      <span
        className="pointer-events-none select-none whitespace-nowrap font-semibold leading-none"
        style={{
          fontSize: LABEL_FONT_PX,
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: warna,
          WebkitTextStroke: "0.25px #ffffff",
          paintOrder: "stroke fill",
        }}
      >
        {teks}
      </span>
    </Html>
  );
}

function PanahGravitasi({ tinggiMeter }: { tinggiMeter: number }) {
  const h = tinggiMeter * METER_TO_UNIT;
  const panjang = Math.min(0.28 + h * 0.06, 0.42);
  const y = h * 0.55 + TINGGI_LANTAI + 0.05;
  const { ujungY } = dimensiPanah(panjang);

  return (
    <group position={[0.78, y, 0.42]}>
      <PanahKeBawah panjang={panjang} warna={MAT_PANAH} />
      <LabelSimbol
        teks="g"
        posisi={[0.038, -(ujungY + 0.022), 0]}
        warna="#b91c1c"
      />
    </group>
  );
}

function Menara({ tinggiMeter }: { tinggiMeter: number }) {
  const h = tinggiMeter * METER_TO_UNIT;
  const jumlahTanda = Math.min(Math.floor(tinggiMeter / 5) + 1, 5);
  const midY = TINGGI_LANTAI + h / 2;

  return (
    <group position={[-0.72, 0, 0]}>
      {/* Tiang vertikal */}
      <mesh position={[0, midY, 0]} castShadow>
        <boxGeometry args={[0.05, h, 0.05]} />
        <meshStandardMaterial {...MAT_MENARA} />
      </mesh>

      {/* Garis ketinggian */}
      <mesh position={[0.06, midY, 0]}>
        <boxGeometry args={[0.006, h, 0.006]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>

      {/* Tanda skala */}
      {Array.from({ length: jumlahTanda }, (_, i) => {
        const fraksi = i / Math.max(jumlahTanda - 1, 1);
        const y = TINGGI_LANTAI + h * fraksi;
        return (
          <mesh key={i} position={[0.1, y, 0]}>
            <boxGeometry args={[0.1, 0.01, 0.01]} />
            <meshStandardMaterial color="#334155" roughness={0.75} />
          </mesh>
        );
      })}

      {/* Platform atas */}
      <mesh position={[0, h + TINGGI_LANTAI + 0.015, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.28, 0.03, 0.22]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.1} roughness={0.5} />
      </mesh>

      <LabelSimbol teks="h" posisi={[-0.1, midY, 0.1]} warna="#475569" />
    </group>
  );
}

function Lantai() {
  return (
    <group>
      <mesh position={[0, TINGGI_LANTAI / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[3.2, TINGGI_LANTAI, 1.6]} />
        <meshStandardMaterial {...MAT_LANTAI} />
      </mesh>
      <mesh position={[0, TINGGI_LANTAI + 0.002, 0]} receiveShadow>
        <boxGeometry args={[3.0, 0.004, 1.4]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.55} />
      </mesh>
    </group>
  );
}

function BolaJatuh({
  tinggiMeter,
  gravitasi,
  mode,
  dropSignal,
  resetSignal,
  onSimUpdate,
}: {
  tinggiMeter: number;
  gravitasi: number;
  mode: ModeJatuh;
  dropSignal: number;
  resetSignal: number;
  onSimUpdate?: (state: { elapsed: number; falling: boolean }) => void;
}) {
  const groupRef = useRef<Group>(null);
  const elapsed = useRef(0);
  const falling = useRef(false);
  const resetting = useRef(false);
  const lastDrop = useRef(0);
  const lastReset = useRef(0);

  const ge = gravitasiEfektif(gravitasi, mode);
  const fallDuration = hitungWaktuJatuh(tinggiMeter, gravitasi, mode);
  const startY = tinggiMeter * METER_TO_UNIT + TINGGI_LANTAI + RADIUS_BOLA;
  const endY = TINGGI_LANTAI + RADIUS_BOLA + 0.01;

  useEffect(() => {
    if (dropSignal > lastDrop.current) {
      lastDrop.current = dropSignal;
      resetting.current = false;
      falling.current = true;
      elapsed.current = 0;
    }
  }, [dropSignal]);

  useEffect(() => {
    if (resetSignal > lastReset.current) {
      lastReset.current = resetSignal;
      falling.current = false;
      resetting.current = true;
      elapsed.current = 0;
      onSimUpdate?.({ elapsed: 0, falling: false });
    }
  }, [resetSignal, onSimUpdate]);

  useEffect(() => {
    if (!falling.current && !resetting.current && groupRef.current) {
      groupRef.current.position.y = startY;
    }
  }, [tinggiMeter, startY]);

  useFrame((_, dt) => {
    if (!groupRef.current) return;

    if (resetting.current) {
      const target = startY;
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        target,
        Math.min(dt * 8, 1),
      );
      if (Math.abs(groupRef.current.position.y - target) < 0.006) {
        groupRef.current.position.y = target;
        resetting.current = false;
      }
      return;
    }

    if (falling.current) {
      elapsed.current += dt;
      const t = Math.min(elapsed.current, fallDuration);
      const yMeter = tinggiMeter - 0.5 * ge * t * t;
      const yScene = Math.max(yMeter * METER_TO_UNIT + TINGGI_LANTAI + RADIUS_BOLA, endY);
      groupRef.current.position.y = yScene;
      onSimUpdate?.({ elapsed: t, falling: true });

      if (elapsed.current >= fallDuration) {
        falling.current = false;
        groupRef.current.position.y = endY;
        onSimUpdate?.({ elapsed: fallDuration, falling: false });
      }
    } else {
      groupRef.current.position.y = startY;
    }
  });

  return (
    <group ref={groupRef} position={[0, startY, 0]}>
      <mesh castShadow>
        <sphereGeometry args={[RADIUS_BOLA, 24, 24]} />
        <meshStandardMaterial {...MAT_BOLA} />
      </mesh>
      <mesh position={[0, RADIUS_BOLA * 0.35, RADIUS_BOLA * 0.55]}>
        <sphereGeometry args={[RADIUS_BOLA * 0.18, 10, 10]} />
        <meshStandardMaterial color="#fed7aa" roughness={0.3} metalness={0.05} />
      </mesh>
    </group>
  );
}

export function JatuhBebasScene({
  tinggi,
  gravitasi,
  mode,
  dropSignal,
  resetSignal,
  onSimUpdate,
}: {
  tinggi: number;
  gravitasi: number;
  mode: ModeJatuh;
  dropSignal: number;
  resetSignal: number;
  onSimUpdate?: (state: { elapsed: number; falling: boolean }) => void;
}) {
  const hScene = tinggi * METER_TO_UNIT + TINGGI_LANTAI;

  return (
    <div className="relative h-full w-full">
      <Canvas
        shadows
        camera={{ position: [2.4, 1.35, 3.2], fov: 38 }}
        className="h-full w-full touch-none"
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#f1f5f9"]} />
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[3, 5, 4]}
          intensity={1.05}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-2, 3, -1.5]} intensity={0.2} />

        <OrbitControls
          enablePan={false}
          minDistance={2.2}
          maxDistance={5.5}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.1}
          minAzimuthAngle={-Math.PI / 3}
          maxAzimuthAngle={Math.PI / 3}
          target={[0, hScene * 0.45, 0]}
        />

        <Lantai />
        <Menara tinggiMeter={tinggi} />
        <BolaJatuh
          tinggiMeter={tinggi}
          gravitasi={gravitasi}
          mode={mode}
          dropSignal={dropSignal}
          resetSignal={resetSignal}
          onSimUpdate={onSimUpdate}
        />
        <PanahGravitasi tinggiMeter={tinggi} />
      </Canvas>
    </div>
  );
}
