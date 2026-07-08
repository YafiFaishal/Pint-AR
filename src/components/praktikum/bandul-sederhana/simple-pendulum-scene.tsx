"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import type { Group } from "three";
import {
  calculateAngularFrequency,
  calculatePendulumAngleAtTime,
  clampInitialAngle,
  clampPendulumLength,
  degreesToRadians,
  DAMPING_DEFAULT,
  sanitizeGravity,
  sanitizeMass,
} from "@/lib/simple-pendulum-utils";
import {
  bobRadiusFromMass,
  PENDULUM_COLORS,
  PENDULUM_CROSSBAR_Y,
  PENDULUM_DIM,
  PENDULUM_METER_TO_UNIT,
  PENDULUM_STAND_HEIGHT,
  PENDULUM_TABLE_DEPTH,
  PENDULUM_TABLE_HEIGHT,
  PENDULUM_TABLE_WIDTH,
} from "@/lib/simple-pendulum-visual";

export type PendulumSimStatus = "idle" | "running" | "paused";

type SimplePendulumSceneProps = {
  lengthM: number;
  massKg: number;
  initialAngleDeg: number;
  gravityMs2: number;
  simStatus: PendulumSimStatus;
  resetSignal: number;
  onSimUpdate?: (state: {
    elapsed: number;
    running: boolean;
    oscillations: number;
    periodS: number;
  }) => void;
};

function lengthVisual(lengthM: number): number {
  return clampPendulumLength(lengthM) * PENDULUM_METER_TO_UNIT;
}

function MejaBandul() {
  return (
    <group>
      <mesh
        position={[0, PENDULUM_TABLE_HEIGHT / 2, 0]}
        receiveShadow
        castShadow
      >
        <boxGeometry
          args={[
            PENDULUM_TABLE_WIDTH,
            PENDULUM_TABLE_HEIGHT,
            PENDULUM_TABLE_DEPTH,
          ]}
        />
        <meshStandardMaterial
          color={PENDULUM_COLORS.table}
          metalness={0.08}
          roughness={0.62}
        />
      </mesh>
      <mesh position={[0, PENDULUM_TABLE_HEIGHT + 0.003, 0]} receiveShadow>
        <boxGeometry
          args={[
            PENDULUM_TABLE_WIDTH - 0.08,
            0.006,
            PENDULUM_TABLE_DEPTH - 0.08,
          ]}
        />
        <meshStandardMaterial
          color={PENDULUM_COLORS.tableTop}
          metalness={0.04}
          roughness={0.5}
        />
      </mesh>
    </group>
  );
}

function Kaki({ x }: { x: number }) {
  const { postRadius, footRadius, footHeight } = PENDULUM_DIM;
  const yMid = PENDULUM_TABLE_HEIGHT + PENDULUM_STAND_HEIGHT / 2;
  const postLen = PENDULUM_STAND_HEIGHT - postRadius * 2;
  return (
    <group>
      <mesh
        position={[x, PENDULUM_TABLE_HEIGHT + footHeight / 2, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[footRadius, footRadius * 1.15, footHeight, 24]} />
        <meshStandardMaterial
          color={PENDULUM_COLORS.foot}
          metalness={0.55}
          roughness={0.45}
        />
      </mesh>
      <mesh position={[x, yMid, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[postRadius, postLen, 6, 16]} />
        <meshStandardMaterial
          color={PENDULUM_COLORS.stand}
          metalness={0.62}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[x, PENDULUM_CROSSBAR_Y, 0]} castShadow>
        <sphereGeometry args={[PENDULUM_DIM.jointRadius, 20, 20]} />
        <meshStandardMaterial
          color={PENDULUM_COLORS.joint}
          metalness={0.6}
          roughness={0.42}
        />
      </mesh>
    </group>
  );
}

function TiangBandul() {
  const { postX, crossbarRadius, crossbarLength, clampWidth, clampHeight, clampDepth, pivotRadius } =
    PENDULUM_DIM;
  const crossbarLen = crossbarLength - crossbarRadius * 2;
  return (
    <group>
      <Kaki x={-postX} />
      <Kaki x={postX} />

      <mesh
        position={[0, PENDULUM_CROSSBAR_Y, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
        receiveShadow
      >
        <capsuleGeometry args={[crossbarRadius, crossbarLen, 6, 20]} />
        <meshStandardMaterial
          color={PENDULUM_COLORS.crossbar}
          metalness={0.58}
          roughness={0.38}
        />
      </mesh>

      <mesh
        position={[0, PENDULUM_CROSSBAR_Y - clampHeight / 2 + 0.006, 0]}
        castShadow
      >
        <boxGeometry args={[clampWidth, clampHeight, clampDepth]} />
        <meshStandardMaterial
          color={PENDULUM_COLORS.clamp}
          metalness={0.5}
          roughness={0.45}
        />
      </mesh>

      <mesh position={[0, PENDULUM_CROSSBAR_Y, 0]}>
        <sphereGeometry args={[pivotRadius, 18, 18]} />
        <meshStandardMaterial
          color={PENDULUM_COLORS.pivot}
          metalness={0.65}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

function GarisSetimbang({ panjangVisual }: { panjangVisual: number }) {
  const bawah = PENDULUM_CROSSBAR_Y - panjangVisual - 0.02;
  return (
    <Line
      points={[
        [0, PENDULUM_CROSSBAR_Y, 0.015],
        [0, bawah, 0.015],
      ]}
      color={PENDULUM_COLORS.equilibrium}
      lineWidth={1}
      dashed
      dashSize={0.022}
      gapSize={0.016}
      transparent
      opacity={0.55}
    />
  );
}

function ArcSudutAwal({
  initialAngleDeg,
  panjangVisual,
}: {
  initialAngleDeg: number;
  panjangVisual: number;
}) {
  const rad = degreesToRadians(Math.max(clampInitialAngle(initialAngleDeg), 5));
  const radius = Math.min(panjangVisual * 0.32, 0.085);
  const segmen = 16;
  const titik: [number, number, number][] = [];

  for (let i = 0; i <= segmen; i++) {
    const t = -Math.PI / 2 - rad + (rad * i) / segmen;
    titik.push([
      Math.sin(t + Math.PI / 2) * radius,
      PENDULUM_CROSSBAR_Y - Math.cos(t + Math.PI / 2) * radius,
      0.02,
    ]);
  }

  return (
    <Line
      points={titik}
      color={PENDULUM_COLORS.arc}
      lineWidth={1.4}
      transparent
      opacity={0.85}
    />
  );
}

function Bandul({
  lengthM,
  massKg,
  initialAngleDeg,
  gravityMs2,
  simStatus,
  resetSignal,
  onSimUpdate,
}: SimplePendulumSceneProps) {
  const grupRef = useRef<Group>(null);
  const elapsed = useRef(0);
  const lastReset = useRef(0);
  const lastStatus = useRef<PendulumSimStatus>("idle");

  const Lvis = lengthVisual(lengthM);
  const bobR = bobRadiusFromMass(sanitizeMass(massKg));
  const theta0 = degreesToRadians(clampInitialAngle(initialAngleDeg));
  const omega = calculateAngularFrequency(lengthM, sanitizeGravity(gravityMs2));
  const periodS = omega > 0 ? (2 * Math.PI) / omega : 0;

  useEffect(() => {
    if (resetSignal > lastReset.current) {
      lastReset.current = resetSignal;
      elapsed.current = 0;
      if (grupRef.current) {
        grupRef.current.rotation.z = theta0;
      }
      onSimUpdate?.({
        elapsed: 0,
        running: false,
        oscillations: 0,
        periodS,
      });
    }
  }, [resetSignal, theta0, onSimUpdate, periodS]);

  useEffect(() => {
    elapsed.current = 0;
    if (grupRef.current) {
      grupRef.current.rotation.z = theta0;
    }
    onSimUpdate?.({
      elapsed: 0,
      running: false,
      oscillations: 0,
      periodS,
    });
  }, [lengthM, initialAngleDeg, gravityMs2, theta0, onSimUpdate, periodS]);

  useEffect(() => {
    if (simStatus === "idle" && lastStatus.current !== "idle") {
      elapsed.current = 0;
      if (grupRef.current) {
        grupRef.current.rotation.z = theta0;
      }
    }
    lastStatus.current = simStatus;
  }, [simStatus, theta0]);

  useFrame((_, dt) => {
    if (!grupRef.current) return;

    if (simStatus === "running") {
      // Delta-time clamp menjaga langkah tetap stabil walau frame-rate turun.
      elapsed.current += Math.min(dt, 0.05);
      const angle = calculatePendulumAngleAtTime(
        initialAngleDeg,
        omega,
        elapsed.current,
        DAMPING_DEFAULT,
      );
      grupRef.current.rotation.z = angle;

      const osc = periodS > 0 ? Math.floor(elapsed.current / periodS) : 0;
      onSimUpdate?.({
        elapsed: elapsed.current,
        running: true,
        oscillations: osc,
        periodS,
      });
    } else if (simStatus === "paused") {
      onSimUpdate?.({
        elapsed: elapsed.current,
        running: false,
        oscillations: periodS > 0 ? Math.floor(elapsed.current / periodS) : 0,
        periodS,
      });
    } else {
      grupRef.current.rotation.z = theta0;
    }
  });

  const { stringRadius, collarRadius, collarHeight } = PENDULUM_DIM;

  return (
    <group position={[0, PENDULUM_CROSSBAR_Y, 0]}>
      <group ref={grupRef} rotation={[0, 0, theta0]}>
        <mesh position={[0, -Lvis / 2, 0]}>
          <cylinderGeometry args={[stringRadius, stringRadius, Lvis, 6]} />
          <meshStandardMaterial
            color={PENDULUM_COLORS.string}
            roughness={0.75}
            metalness={0.1}
          />
        </mesh>
        <mesh position={[0, -Lvis + bobR + collarHeight * 0.4, 0]}>
          <cylinderGeometry
            args={[collarRadius * 0.6, collarRadius, collarHeight, 12]}
          />
          <meshStandardMaterial
            color={PENDULUM_COLORS.bobCollar}
            metalness={0.55}
            roughness={0.4}
          />
        </mesh>
        <mesh position={[0, -Lvis, 0]} castShadow>
          <sphereGeometry args={[bobR, 36, 28]} />
          <meshStandardMaterial
            color={PENDULUM_COLORS.bob}
            metalness={0.5}
            roughness={0.28}
          />
        </mesh>
      </group>
    </group>
  );
}

function PendulumLab(props: SimplePendulumSceneProps) {
  const Lvis = useMemo(() => lengthVisual(props.lengthM), [props.lengthM]);

  return (
    <group>
      <MejaBandul />
      <TiangBandul />
      <GarisSetimbang panjangVisual={Lvis} />
      <ArcSudutAwal
        initialAngleDeg={props.initialAngleDeg}
        panjangVisual={Lvis}
      />
      <Bandul {...props} />
    </group>
  );
}

export function SimplePendulumScene(props: SimplePendulumSceneProps) {
  return (
    <Canvas
      shadows="soft"
      camera={{ position: [0.62, 0.52, 1.2], fov: 40, near: 0.1, far: 20 }}
      gl={{ antialias: true, alpha: true }}
      className="h-full w-full touch-none"
    >
      <color attach="background" args={["#eef2f7"]} />
      <hemisphereLight args={["#f8fafc", "#c3cddb", 0.55]} />
      <ambientLight intensity={0.28} />
      <directionalLight
        position={[1.8, 3.4, 2.2]}
        intensity={1.05}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.00018}
        shadow-normalBias={0.02}
        shadow-camera-near={0.1}
        shadow-camera-far={9}
        shadow-camera-left={-1.1}
        shadow-camera-right={1.1}
        shadow-camera-top={1.1}
        shadow-camera-bottom={-1.1}
      />
      <directionalLight position={[-1.8, 1.6, -0.8]} intensity={0.32} />
      <directionalLight position={[0, 1.2, -2.4]} intensity={0.18} />

      <PendulumLab {...props} />

      <OrbitControls
        enablePan={false}
        minDistance={0.75}
        maxDistance={2.4}
        maxPolarAngle={Math.PI / 2 + 0.1}
        target={[0, PENDULUM_CROSSBAR_Y * 0.52, 0]}
      />
    </Canvas>
  );
}

export { PENDULUM_CROSSBAR_Y };
