"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { Group } from "three";
import {
  type ArchimedesResult,
  type BentukBenda,
  type JenisCairan,
  objectHeightMeters,
} from "@/lib/archimedes-utils";

const METER_TO_UNIT = 0.55;
const TABLE_HEIGHT = 0.05;
const TANK_INNER_W = 0.38;
const TANK_INNER_D = 0.28;
const TANK_INNER_H = 0.32;
const WALL_THICK = 0.01;
const LIQUID_HEIGHT = 0.26;

const MAT_TABLE = { color: "#94a3b8", metalness: 0.08, roughness: 0.62 } as const;
const MAT_OBJECT = { color: "#ea580c", metalness: 0.28, roughness: 0.38 } as const;
const MAT_WEIGHT = { color: "#dc2626", metalness: 0.12, roughness: 0.5 } as const;
const MAT_BUOYANT = { color: "#2563eb", metalness: 0.12, roughness: 0.5 } as const;

const CAIRAN_WARNA: Record<JenisCairan, { color: string; opacity: number }> = {
  minyak: { color: "#d4a017", opacity: 0.38 },
  air: { color: "#60a5fa", opacity: 0.35 },
  "air-garam": { color: "#3b82f6", opacity: 0.42 },
};

function liquidSurfaceY(): number {
  return TABLE_HEIGHT + LIQUID_HEIGHT;
}

function tankBottomY(): number {
  return TABLE_HEIGHT;
}

function objectHeightScene(volumeM3: number, bentuk: BentukBenda): number {
  return objectHeightMeters(volumeM3, bentuk) * METER_TO_UNIT;
}

function targetCenterY(
  result: ArchimedesResult,
  objectHeight: number,
): number {
  const surface = liquidSurfaceY();
  const bottom = tankBottomY();
  const H = objectHeight;

  if (result.condition === "floating") {
    return surface + H * (0.5 - result.submergedFraction);
  }
  if (result.condition === "suspended") {
    return bottom + LIQUID_HEIGHT / 2;
  }
  return bottom + H / 2 + 0.008;
}

function startCenterY(objectHeight: number): number {
  return liquidSurfaceY() + objectHeight * 0.55 + 0.04;
}

const PANAH_MIN = 0.11;
const PANAH_MAX = 0.26;
const KEPALA_TINGGI = 0.048;

/** Panjang batang + posisi ujung panah (relatif pusat benda). */
function dimensiPanah(panjang: number): { batang: number; ujungY: number } {
  const batang = Math.max(panjang - KEPALA_TINGGI * 0.55, 0.07);
  const ujungY = batang + KEPALA_TINGGI * 0.42;
  return { batang, ujungY };
}

/** Geometri panah vertikal ke atas — dipakai ulang untuk panah ke bawah via rotasi. */
function PanahGayaKeAtas({
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

function PanahGaya({
  arah,
  panjang,
  warna,
}: {
  arah: "bawah" | "atas";
  panjang: number;
  warna: { color: string; metalness: number; roughness: number };
}) {
  if (arah === "bawah") {
    return (
      <group rotation={[Math.PI, 0, 0]}>
        <PanahGayaKeAtas panjang={panjang} warna={warna} />
      </group>
    );
  }
  return <PanahGayaKeAtas panjang={panjang} warna={warna} />;
}

const LABEL_FONT_PX = 9;

/**
 * Label simbol gaya — ukuran pixel tetap (transform=false), tanpa bubble putih.
 * Pola sama dengan LabelSimbol di jatuh-bebas-scene.tsx.
 */
function LabelGaya({
  teks,
  posisi,
  varian,
}: {
  teks: string;
  posisi: [number, number, number];
  varian: "apung" | "berat";
}) {
  const color = varian === "apung" ? "#1d4ed8" : "#b91c1c";

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
          color,
          WebkitTextStroke: "0.25px #ffffff",
          paintOrder: "stroke fill",
        }}
      >
        {teks}
      </span>
    </Html>
  );
}

/** Panah gaya + label sebagai satu unit visual. */
function IndikatorGaya({
  arah,
  panjang,
  warna,
  label,
  varian,
  offsetX,
}: {
  arah: "bawah" | "atas";
  panjang: number;
  warna: { color: string; metalness: number; roughness: number };
  label: string;
  varian: "apung" | "berat";
  offsetX: number;
}) {
  const { ujungY } = dimensiPanah(panjang);
  const labelY =
    arah === "atas" ? ujungY + 0.022 : -(ujungY + 0.022);
  const labelX = varian === "apung" ? 0.045 : -0.038;

  return (
    <group position={[offsetX, 0, 0.025]}>
      <PanahGaya arah={arah} panjang={panjang} warna={warna} />
      <LabelGaya
        teks={label}
        posisi={[labelX, labelY, 0]}
        varian={varian}
      />
    </group>
  );
}

function Meja() {
  return (
    <group>
      <mesh position={[0, TABLE_HEIGHT / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[1.4, TABLE_HEIGHT, 0.9]} />
        <meshStandardMaterial {...MAT_TABLE} />
      </mesh>
      <mesh position={[0, TABLE_HEIGHT + 0.002, 0]} receiveShadow>
        <boxGeometry args={[1.3, 0.004, 0.8]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.55} />
      </mesh>
    </group>
  );
}

function BakCairan({ jenisCairan }: { jenisCairan: JenisCairan }) {
  const bottomY = tankBottomY();
  const midY = bottomY + TANK_INNER_H / 2;
  const liquidY = bottomY + LIQUID_HEIGHT / 2;
  const cairan = CAIRAN_WARNA[jenisCairan];

  const wallProps = {
    color: "#cbd5e1",
    transparent: true,
    opacity: 0.22,
    roughness: 0.15,
    metalness: 0.05,
    depthWrite: false,
  } as const;

  return (
    <group position={[0, 0, 0]}>
      {/* Dasar bak */}
      <mesh position={[0, bottomY + 0.004, 0]} receiveShadow>
        <boxGeometry args={[TANK_INNER_W, 0.008, TANK_INNER_D]} />
        <meshStandardMaterial color="#64748b" roughness={0.5} />
      </mesh>

      {/* Cairan */}
      <mesh position={[0, liquidY, 0]}>
        <boxGeometry args={[TANK_INNER_W - 0.02, LIQUID_HEIGHT, TANK_INNER_D - 0.02]} />
        <meshStandardMaterial
          color={cairan.color}
          transparent
          opacity={cairan.opacity}
          roughness={0.2}
          depthWrite={false}
        />
      </mesh>

      {/* Garis permukaan cairan */}
      <mesh position={[0, liquidSurfaceY(), 0]}>
        <boxGeometry args={[TANK_INNER_W - 0.01, 0.003, TANK_INNER_D - 0.01]} />
        <meshStandardMaterial
          color={cairan.color}
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </mesh>

      {/* Dinding kiri */}
      <mesh position={[-TANK_INNER_W / 2 - WALL_THICK / 2, midY, 0]}>
        <boxGeometry args={[WALL_THICK, TANK_INNER_H, TANK_INNER_D + WALL_THICK * 2]} />
        <meshStandardMaterial {...wallProps} />
      </mesh>

      {/* Dinding kanan */}
      <mesh position={[TANK_INNER_W / 2 + WALL_THICK / 2, midY, 0]}>
        <boxGeometry args={[WALL_THICK, TANK_INNER_H, TANK_INNER_D + WALL_THICK * 2]} />
        <meshStandardMaterial {...wallProps} />
      </mesh>

      {/* Dinding depan */}
      <mesh position={[0, midY, TANK_INNER_D / 2 + WALL_THICK / 2]}>
        <boxGeometry args={[TANK_INNER_W + WALL_THICK * 2, TANK_INNER_H, WALL_THICK]} />
        <meshStandardMaterial {...wallProps} />
      </mesh>

      {/* Dinding belakang */}
      <mesh position={[0, midY, -TANK_INNER_D / 2 - WALL_THICK / 2]}>
        <boxGeometry args={[TANK_INNER_W + WALL_THICK * 2, TANK_INNER_H, WALL_THICK]} />
        <meshStandardMaterial {...wallProps} />
      </mesh>
    </group>
  );
}

function BendaUji({
  volumeM3,
  bentuk,
  result,
  dropSignal,
  resetSignal,
  eksperimenAktif,
}: {
  volumeM3: number;
  bentuk: BentukBenda;
  result: ArchimedesResult;
  dropSignal: number;
  resetSignal: number;
  eksperimenAktif: boolean;
}) {
  const groupRef = useRef<Group>(null);
  const animating = useRef(false);
  const resetting = useRef(false);
  const lastDrop = useRef(0);
  const lastReset = useRef(0);

  const objectHeight = objectHeightScene(volumeM3, bentuk);
  const startY = startCenterY(objectHeight);
  const targetY = eksperimenAktif
    ? targetCenterY(result, objectHeight)
    : startY;

  useEffect(() => {
    if (dropSignal > lastDrop.current) {
      lastDrop.current = dropSignal;
      resetting.current = false;
      animating.current = true;
    }
  }, [dropSignal]);

  useEffect(() => {
    if (resetSignal > lastReset.current) {
      lastReset.current = resetSignal;
      animating.current = false;
      resetting.current = true;
    }
  }, [resetSignal]);

  useEffect(() => {
    if (!animating.current && !resetting.current && groupRef.current) {
      groupRef.current.position.y = eksperimenAktif ? targetY : startY;
    }
  }, [volumeM3, bentuk, result, eksperimenAktif, targetY, startY]);

  useFrame((_, dt) => {
    if (!groupRef.current) return;

    const currentTarget = eksperimenAktif ? targetY : startY;

    if (resetting.current) {
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        startY,
        Math.min(dt * 7, 1),
      );
      if (Math.abs(groupRef.current.position.y - startY) < 0.005) {
        groupRef.current.position.y = startY;
        resetting.current = false;
      }
      return;
    }

    if (animating.current || eksperimenAktif) {
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        currentTarget,
        Math.min(dt * (animating.current ? 3.5 : 5), 1),
      );
      if (
        animating.current &&
        Math.abs(groupRef.current.position.y - currentTarget) < 0.004
      ) {
        groupRef.current.position.y = currentTarget;
        animating.current = false;
      }
    } else {
      groupRef.current.position.y = startY;
    }
  });

  const radius =
    bentuk === "bola"
      ? objectHeight / 2
      : objectHeight / 2 * 0.92;

  const maxForce = Math.max(result.weightN, result.buoyantForceN, 0.1);
  const skalaGaya = (f: number) =>
    PANAH_MIN + (f / maxForce) * (PANAH_MAX - PANAH_MIN);

  const offsetGaya = Math.min(objectHeight * 0.2 + 0.028, 0.1);

  return (
    <group ref={groupRef} position={[0, startY, 0]}>
      {bentuk === "kubus" ? (
        <mesh castShadow>
          <boxGeometry args={[objectHeight, objectHeight, objectHeight]} />
          <meshStandardMaterial {...MAT_OBJECT} />
        </mesh>
      ) : (
        <mesh castShadow>
          <sphereGeometry args={[radius, 24, 24]} />
          <meshStandardMaterial {...MAT_OBJECT} />
        </mesh>
      )}

      {eksperimenAktif ? (
        <>
          <IndikatorGaya
            arah="bawah"
            panjang={skalaGaya(result.weightN)}
            warna={MAT_WEIGHT}
            label="W"
            varian="berat"
            offsetX={-offsetGaya}
          />
          <IndikatorGaya
            arah="atas"
            panjang={skalaGaya(result.buoyantForceN)}
            warna={MAT_BUOYANT}
            label="Fa"
            varian="apung"
            offsetX={offsetGaya}
          />
        </>
      ) : null}
    </group>
  );
}

export function HukumArchimedesScene({
  volumeM3,
  bentuk,
  jenisCairan,
  result,
  dropSignal,
  resetSignal,
  eksperimenAktif,
}: {
  volumeM3: number;
  bentuk: BentukBenda;
  jenisCairan: JenisCairan;
  result: ArchimedesResult;
  dropSignal: number;
  resetSignal: number;
  eksperimenAktif: boolean;
}) {
  return (
    <div className="relative h-full w-full">
      <Canvas
        shadows
        camera={{ position: [1.1, 0.75, 1.45], fov: 40 }}
        className="h-full w-full touch-none"
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#f1f5f9"]} />
        <ambientLight intensity={0.58} />
        <directionalLight
          position={[2, 4, 3]}
          intensity={1.05}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-1.5, 2.5, -1]} intensity={0.22} />

        <OrbitControls
          enablePan={false}
          minDistance={1.2}
          maxDistance={2.8}
          minPolarAngle={Math.PI / 5}
          maxPolarAngle={Math.PI / 2.05}
          minAzimuthAngle={-Math.PI / 3}
          maxAzimuthAngle={Math.PI / 3}
          target={[0, TABLE_HEIGHT + TANK_INNER_H * 0.42, 0]}
        />

        <Meja />
        <BakCairan jenisCairan={jenisCairan} />
        <BendaUji
          volumeM3={volumeM3}
          bentuk={bentuk}
          result={result}
          dropSignal={dropSignal}
          resetSignal={resetSignal}
          eksperimenAktif={eksperimenAktif}
        />
      </Canvas>
    </div>
  );
}
