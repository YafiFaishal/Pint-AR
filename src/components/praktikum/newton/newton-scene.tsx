"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, OrbitControls, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { Group } from "three";

/* ── Tata letak lintasan (meter, terpusat di origin) ── */
const PANJANG_LINTASAN = 4.8;
const LEBAR_LINTASAN = 0.95;
const TINGGI_LINTASAN = 0.11;
const AWAL_BLOK = -1.35;
const AKHIR_LINTASAN = 1.35;

const MAT_LINTASAN = {
  color: "#64748b",
  metalness: 0.12,
  roughness: 0.52,
} as const;

const MAT_LINTASAN_ATAS = {
  color: "#94a3b8",
  metalness: 0.08,
  roughness: 0.48,
} as const;

const MAT_BALOK = {
  color: "#1d4ed8",
  metalness: 0.22,
  roughness: 0.42,
} as const;

const MAT_PANAH = {
  color: "#dc2626",
  metalness: 0.15,
  roughness: 0.5,
} as const;

function Lintasan() {
  return (
    <group position={[0, TINGGI_LINTASAN / 2 - 0.01, 0]}>
      <RoundedBox
        args={[PANJANG_LINTASAN, TINGGI_LINTASAN, LEBAR_LINTASAN]}
        radius={0.02}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial {...MAT_LINTASAN} />
      </RoundedBox>

      {/* Permukaan atas sedikit lebih terang */}
      <mesh position={[0, TINGGI_LINTASAN / 2 + 0.003, 0]} receiveShadow>
        <boxGeometry args={[PANJANG_LINTASAN - 0.12, 0.006, LEBAR_LINTASAN - 0.1]} />
        <meshStandardMaterial {...MAT_LINTASAN_ATAS} />
      </mesh>

      {/* Garis arah gerak */}
      <mesh position={[0, TINGGI_LINTASAN / 2 + 0.006, 0]} receiveShadow>
        <boxGeometry args={[PANJANG_LINTASAN - 0.5, 0.004, 0.03]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>

      {/* Ujung lintasan */}
      {([-1, 1] as const).map((sisi) => (
        <mesh
          key={sisi}
          position={[sisi * (PANJANG_LINTASAN / 2 - 0.04), TINGGI_LINTASAN / 2 + 0.005, 0]}
          receiveShadow
        >
          <boxGeometry args={[0.06, 0.008, LEBAR_LINTASAN - 0.14]} />
          <meshStandardMaterial color="#334155" roughness={0.75} />
        </mesh>
      ))}

      {/* Kaki karet */}
      {(
        [
          [-1.95, -0.055, 0.32],
          [1.95, -0.055, 0.32],
          [-1.95, -0.055, -0.32],
          [1.95, -0.055, -0.32],
        ] as [number, number, number][]
      ).map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <cylinderGeometry args={[0.035, 0.04, 0.022, 10]} />
          <meshStandardMaterial color="#1e293b" roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

function PanahGaya({ panjang }: { panjang: number }) {
  const kepala = 0.14;
  const batang = Math.max(panjang - kepala * 0.55, 0.12);

  return (
    <group position={[0.02, 0, 0.22]}>
      <mesh rotation={[0, 0, -Math.PI / 2]} position={[batang / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.028, 0.032, batang, 10]} />
        <meshStandardMaterial {...MAT_PANAH} />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI / 2]} position={[batang + kepala * 0.42, 0, 0]} castShadow>
        <coneGeometry args={[0.065, kepala, 10]} />
        <meshStandardMaterial {...MAT_PANAH} />
      </mesh>
    </group>
  );
}

function BalokDenganGaya({
  mass,
  force,
  pushSignal,
  resetSignal,
}: {
  mass: number;
  force: number;
  pushSignal: number;
  resetSignal: number;
}) {
  const groupRef = useRef<Group>(null);
  const vel = useRef(0);
  const pos = useRef(AWAL_BLOK);
  const animating = useRef(false);
  const resetting = useRef(false);
  const lastPush = useRef(0);
  const lastReset = useRef(0);

  const blockScale = 0.28 + mass * 0.028;
  const panjangPanah = 0.38 + (force / 50) * 0.95;

  useEffect(() => {
    if (pushSignal > lastPush.current) {
      lastPush.current = pushSignal;
      resetting.current = false;
      animating.current = true;
      vel.current = (force / mass) * 0.32;
    }
  }, [pushSignal, force, mass]);

  useEffect(() => {
    if (resetSignal > lastReset.current) {
      lastReset.current = resetSignal;
      animating.current = false;
      vel.current = 0;
      resetting.current = true;
    }
  }, [resetSignal]);

  useFrame((_, dt) => {
    if (!groupRef.current) return;

    if (resetting.current) {
      pos.current = THREE.MathUtils.lerp(pos.current, AWAL_BLOK, Math.min(dt * 7, 1));
      if (Math.abs(pos.current - AWAL_BLOK) < 0.008) {
        pos.current = AWAL_BLOK;
        resetting.current = false;
      }
    } else if (animating.current) {
      const a = force / mass;
      vel.current += a * dt * 0.42;
      pos.current += vel.current * dt;

      if (pos.current >= AKHIR_LINTASAN) {
        pos.current = AKHIR_LINTASAN;
        animating.current = false;
        vel.current *= 0.35;
      }
    }

    groupRef.current.position.x = pos.current;
  });

  const y = TINGGI_LINTASAN / 2 + blockScale / 2 + 0.01;

  return (
    <group ref={groupRef} position={[AWAL_BLOK, y, 0]}>
      <RoundedBox
        args={[blockScale, blockScale, blockScale]}
        radius={0.018}
        smoothness={4}
        castShadow
      >
        <meshStandardMaterial {...MAT_BALOK} />
      </RoundedBox>

      {/* Highlight tepi atas */}
      <mesh position={[0, blockScale / 2 - 0.008, 0]}>
        <boxGeometry args={[blockScale * 0.82, 0.012, blockScale * 0.82]} />
        <meshStandardMaterial color="#3b82f6" metalness={0.1} roughness={0.35} />
      </mesh>

      <group position={[blockScale / 2 + 0.01, 0, 0]}>
        <PanahGaya panjang={panjangPanah} />
      </group>
    </group>
  );
}

export function NewtonScene({
  mass,
  force,
  pushSignal,
  resetSignal,
}: {
  mass: number;
  force: number;
  acceleration: number;
  pushSignal: number;
  resetSignal: number;
}) {
  return (
    <div className="relative h-full w-full">
      <Canvas
        shadows
        camera={{ position: [1.65, 1.55, 3.15], fov: 38 }}
        className="h-full w-full touch-none"
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#f1f5f9"]} />
        <ambientLight intensity={0.52} />
        <directionalLight
          position={[3.5, 5.5, 4]}
          intensity={1.05}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-2.5, 3, -1.5]} intensity={0.22} />

        <OrbitControls
          enablePan={false}
          minDistance={2.4}
          maxDistance={5.5}
          minPolarAngle={Math.PI / 5.5}
          maxPolarAngle={Math.PI / 2.15}
          minAzimuthAngle={-Math.PI / 2.8}
          maxAzimuthAngle={Math.PI / 2.8}
          target={[0, 0.16, 0]}
        />

        <Lintasan />
        <BalokDenganGaya
          mass={mass}
          force={force}
          pushSignal={pushSignal}
          resetSignal={resetSignal}
        />

        <ContactShadows
          position={[0, 0.001, 0]}
          opacity={0.32}
          scale={7}
          blur={2.2}
          far={2.5}
          color="#334155"
        />
      </Canvas>
    </div>
  );
}
