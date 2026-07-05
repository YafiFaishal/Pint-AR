"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import type { Group } from "three";

const AWAL_BLOK = -2.5;
const AKHIR_LINTASAN = 2.5;

function Lintasan() {
  return (
    <mesh position={[0, 0, 0]} receiveShadow>
      <boxGeometry args={[8, 0.1, 1.4]} />
      <meshStandardMaterial color="#94a3b8" />
    </mesh>
  );
}

function PanahGaya({ panjang }: { panjang: number }) {
  return (
    <group position={[0.05, 0, 0.35]}>
      <mesh rotation={[0, 0, -Math.PI / 2]} position={[panjang / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, panjang, 8]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI / 2]} position={[panjang + 0.12, 0, 0]}>
        <coneGeometry args={[0.1, 0.22, 8]} />
        <meshStandardMaterial color="#ef4444" />
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
  const lastPush = useRef(0);
  const lastReset = useRef(0);

  const blockScale = 0.3 + mass * 0.03;
  const panjangPanah = 0.35 + (force / 50) * 1.4;

  useEffect(() => {
    if (pushSignal > lastPush.current) {
      lastPush.current = pushSignal;
      animating.current = true;
      vel.current = (force / mass) * 0.25;
    }
  }, [pushSignal, force, mass]);

  useEffect(() => {
    if (resetSignal > lastReset.current) {
      lastReset.current = resetSignal;
      animating.current = false;
      vel.current = 0;
      pos.current = AWAL_BLOK;
    }
  }, [resetSignal]);

  useFrame((_, dt) => {
    if (!groupRef.current) return;
    if (animating.current) {
      const a = force / mass;
      vel.current += a * dt * 0.35;
      pos.current += vel.current * dt;
      if (pos.current >= AKHIR_LINTASAN) {
        pos.current = AKHIR_LINTASAN;
        animating.current = false;
      }
    }
    groupRef.current.position.x = pos.current;
  });

  const y = 0.05 + blockScale / 2;

  return (
    <group ref={groupRef} position={[AWAL_BLOK, y, 0]}>
      <mesh castShadow position={[0, 0, 0]}>
        <boxGeometry args={[blockScale, blockScale, blockScale]} />
        <meshStandardMaterial color="#2563eb" />
      </mesh>
      <group position={[blockScale / 2, 0, 0]}>
        <PanahGaya panjang={panjangPanah} />
      </group>
    </group>
  );
}

function LabelTeks({
  position,
  children,
}: {
  position: [number, number, number];
  children: React.ReactNode;
}) {
  return (
    <Html position={position} center distanceFactor={6}>
      <div className="whitespace-nowrap rounded-md border bg-background/95 px-2 py-1 text-xs font-medium shadow-sm">
        {children}
      </div>
    </Html>
  );
}

export function NewtonScene({
  mass,
  force,
  acceleration,
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
    <Canvas
      shadows
      camera={{ position: [0, 2.2, 4.5], fov: 42 }}
      className="h-full w-full touch-none"
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={["#f1f5f9"]} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[4, 6, 3]} intensity={1.1} castShadow />
      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={8}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 0.2, 0]}
      />
      <Lintasan />
      <BalokDenganGaya
        mass={mass}
        force={force}
        pushSignal={pushSignal}
        resetSignal={resetSignal}
      />
      <LabelTeks position={[-3, 1.6, 0]}>
        F = {force} N
      </LabelTeks>
      <LabelTeks position={[0, 1.6, 0]}>
        m = {mass} kg
      </LabelTeks>
      <LabelTeks position={[3, 1.6, 0]}>
        a = {acceleration.toFixed(2)} m/s²
      </LabelTeks>
    </Canvas>
  );
}
