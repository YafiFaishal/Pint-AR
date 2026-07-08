"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { Group } from "three";
import {
  type LightMode,
  type LightOpticsResult,
  type OpticalMediumId,
  degreesToRadians,
} from "@/lib/light-optics-utils";
import {
  FLASHLIGHT_COLORS,
  FLASHLIGHT_DIM,
  MEDIUM_VISUAL,
  OPTICS_COLORS,
  OPTICS_INTERFACE_Y,
  OPTICS_RAY_LEN,
  OPTICS_RAY_RADIUS,
  OPTICS_TABLE_HEIGHT,
  mediumVisual,
} from "@/lib/light-optics-visual";

const INTERFACE_Y = OPTICS_INTERFACE_Y;
const RAY_LEN = OPTICS_RAY_LEN;
const RAY_RADIUS = OPTICS_RAY_RADIUS;
const TABLE_HEIGHT = OPTICS_TABLE_HEIGHT;

type LightOpticsSceneProps = {
  mode: LightMode;
  result: LightOpticsResult;
  medium1: OpticalMediumId;
  medium2: OpticalMediumId;
  beamSignal: number;
  resetSignal: number;
};

function quatMenujuTarget(
  dari: [number, number, number],
  ke: [number, number, number],
): THREE.Quaternion {
  const dir = new THREE.Vector3(
    ke[0] - dari[0],
    ke[1] - dari[1],
    ke[2] - dari[2],
  );
  if (dir.lengthSq() < 1e-8) return new THREE.Quaternion();
  dir.normalize();
  return new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(1, 0, 0),
    dir,
  );
}

function titikSumber(incidentDeg: number): [number, number, number] {
  const visualDeg = incidentDeg < 0.5 ? 2 : incidentDeg;
  const r = degreesToRadians(visualDeg);
  return [
    -Math.sin(r) * RAY_LEN,
    INTERFACE_Y + Math.cos(r) * RAY_LEN,
    0.02,
  ];
}

function titikPantul(reflectedDeg: number): [number, number, number] {
  const r = degreesToRadians(reflectedDeg);
  return [Math.sin(r) * RAY_LEN, INTERFACE_Y + Math.cos(r) * RAY_LEN, 0.02];
}

function titikBias(refractedDeg: number): [number, number, number] {
  const r = degreesToRadians(refractedDeg);
  return [Math.sin(r) * RAY_LEN, INTERFACE_Y - Math.cos(r) * RAY_LEN, 0.02];
}

function SinarMesh({
  dari,
  ke,
  warna,
  progressRef,
  multiplier = 1,
  emissive = 0.42,
}: {
  dari: [number, number, number];
  ke: [number, number, number];
  warna: string;
  progressRef: RefObject<number>;
  multiplier?: number;
  emissive?: number;
}) {
  const grupRef = useRef<Group>(null);
  const panjangPenuh = useMemo(() => {
    const v = new THREE.Vector3(ke[0] - dari[0], ke[1] - dari[1], ke[2] - dari[2]);
    return v.length();
  }, [dari, ke]);

  const arah = useMemo(() => {
    const v = new THREE.Vector3(ke[0] - dari[0], ke[1] - dari[1], ke[2] - dari[2]);
    if (v.length() < 1e-6) return new THREE.Quaternion();
    v.normalize();
    return new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      v,
    );
  }, [dari, ke]);

  useFrame(() => {
    const grup = grupRef.current;
    if (!grup) return;
    const p = Math.max(0, Math.min(1, progressRef.current * multiplier));
    grup.visible = p >= 0.01;
    grup.position.set(dari[0], dari[1], dari[2]);
    grup.quaternion.copy(arah);
    grup.scale.set(1, p, 1);
  });

  if (panjangPenuh < 1e-6) return null;

  return (
    <group ref={grupRef} visible={false}>
      <mesh position={[0, panjangPenuh / 2, 0]}>
        <cylinderGeometry args={[RAY_RADIUS, RAY_RADIUS, panjangPenuh, 10]} />
        <meshStandardMaterial
          color={warna}
          emissive={warna}
          emissiveIntensity={emissive}
          roughness={0.28}
          metalness={0.04}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, panjangPenuh / 2, 0]}>
        <cylinderGeometry
          args={[RAY_RADIUS * 0.45, RAY_RADIUS * 0.45, panjangPenuh, 8]}
        />
        <meshStandardMaterial
          color="#ffffff"
          emissive={warna}
          emissiveIntensity={emissive * 0.55}
          roughness={0.2}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function ArcSudutKontrol({
  sudutDeg,
  sisi,
  warna,
  visibleRef,
}: {
  sudutDeg: number;
  sisi: "kiri-atas" | "kanan-atas" | "kanan-bawah";
  warna: string;
  visibleRef: RefObject<boolean>;
}) {
  const grupRef = useRef<Group>(null);

  useFrame(() => {
    if (grupRef.current) {
      grupRef.current.visible = visibleRef.current;
    }
  });

  return (
    <group ref={grupRef} visible={false}>
      <ArcSudut sudutDeg={sudutDeg} sisi={sisi} warna={warna} />
    </group>
  );
}

function GarisNormal() {
  const atas: [number, number, number] = [0, INTERFACE_Y + 0.15, 0.01];
  const bawah: [number, number, number] = [0, INTERFACE_Y - 0.15, 0.01];
  return (
    <Line
      points={[atas, bawah]}
      color={OPTICS_COLORS.normal}
      lineWidth={1}
      dashed
      dashSize={0.028}
      gapSize={0.018}
      transparent
      opacity={0.75}
    />
  );
}

function ArcSudut({
  sudutDeg,
  sisi,
  warna,
}: {
  sudutDeg: number;
  sisi: "kiri-atas" | "kanan-atas" | "kanan-bawah";
  warna: string;
}) {
  const radius = 0.065;
  const segmen = 14;
  const rad = degreesToRadians(Math.max(sudutDeg, 2));
  const titik: [number, number, number][] = [];

  let t0 = -Math.PI / 2;
  if (sisi === "kanan-bawah") t0 = Math.PI / 2;
  else if (sisi === "kiri-atas") t0 = -Math.PI / 2 - rad;

  const t1 =
    sisi === "kiri-atas"
      ? -Math.PI / 2
      : sisi === "kanan-atas"
        ? -Math.PI / 2 + rad
        : Math.PI / 2 - rad;

  for (let i = 0; i <= segmen; i++) {
    const t = t0 + ((t1 - t0) * i) / segmen;
    titik.push([
      Math.sin(t) * radius,
      INTERFACE_Y + Math.cos(t) * radius,
      0.035,
    ]);
  }

  return <Line points={titik} color={warna} lineWidth={1.25} transparent opacity={0.9} />;
}

function MejaOptik() {
  return (
    <group>
      <mesh position={[0, TABLE_HEIGHT / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[1.2, TABLE_HEIGHT, 0.75]} />
        <meshStandardMaterial
          color={OPTICS_COLORS.table}
          metalness={0.1}
          roughness={0.58}
        />
      </mesh>
      <mesh position={[0, TABLE_HEIGHT + 0.002, 0]} receiveShadow>
        <boxGeometry args={[1.1, 0.004, 0.65]} />
        <meshStandardMaterial
          color={OPTICS_COLORS.tableTop}
          roughness={0.48}
          metalness={0.04}
        />
      </mesh>
    </group>
  );
}

function SenterCahaya({
  posisi,
  target,
}: {
  posisi: [number, number, number];
  target: [number, number, number];
}) {
  const quat = useMemo(
    () => quatMenujuTarget(posisi, target),
    [posisi, target],
  );
  const d = FLASHLIGHT_DIM;

  return (
    <group position={posisi} quaternion={quat}>
      <mesh
        position={[-d.bodyLength * 0.52, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry
          args={[d.bodyRadiusBack, d.bodyRadiusFront, d.bodyLength, 14]}
        />
        <meshStandardMaterial
          color={FLASHLIGHT_COLORS.body}
          metalness={0.35}
          roughness={0.45}
        />
      </mesh>

      <mesh position={[-d.bodyLength * 0.18, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[d.ringRadius, 0.0035, 8, 20]} />
        <meshStandardMaterial
          color={FLASHLIGHT_COLORS.grip}
          metalness={0.4}
          roughness={0.5}
        />
      </mesh>

      <mesh
        position={[d.headLength * 0.42, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry
          args={[d.headRadius, d.headRadius * 0.9, d.headLength, 14]}
        />
        <meshStandardMaterial
          color={FLASHLIGHT_COLORS.head}
          metalness={0.45}
          roughness={0.38}
        />
      </mesh>

      <mesh position={[d.headLength * 0.88, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry
          args={[d.lensRadius, d.lensRadius * 0.96, d.lensDepth, 12]}
        />
        <meshStandardMaterial
          color={FLASHLIGHT_COLORS.lens}
          emissive={FLASHLIGHT_COLORS.lensEmissive}
          emissiveIntensity={0.65}
          roughness={0.25}
          metalness={0.05}
          toneMapped={false}
        />
      </mesh>

      <pointLight
        position={[d.headLength + 0.02, 0, 0]}
        color={FLASHLIGHT_COLORS.lensEmissive}
        intensity={0.35}
        distance={0.45}
        decay={2}
      />
    </group>
  );
}

function CerminDatar() {
  return (
    <group position={[0, INTERFACE_Y, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <boxGeometry args={[0.55, 0.34, 0.005]} />
        <meshStandardMaterial
          color={OPTICS_COLORS.mirror}
          metalness={0.92}
          roughness={0.12}
        />
      </mesh>
      <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.27, 32]} />
        <meshStandardMaterial
          color="#e2e8f0"
          metalness={0.7}
          roughness={0.2}
          transparent
          opacity={0.35}
        />
      </mesh>
    </group>
  );
}

function BidangBatas() {
  return (
    <group position={[0, INTERFACE_Y, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <boxGeometry args={[0.58, 0.34, 0.003]} />
        <meshStandardMaterial
          color={OPTICS_COLORS.interface}
          roughness={0.35}
          metalness={0.08}
        />
      </mesh>
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.24, 0.29, 4]} />
        <meshStandardMaterial
          color="#94a3b8"
          transparent
          opacity={0.25}
          roughness={0.6}
        />
      </mesh>
    </group>
  );
}

function VolumeMedium({
  medium,
  yCenter,
  height,
  width = 0.56,
  depth = 0.3,
  variant,
}: {
  medium: OpticalMediumId;
  yCenter: number;
  height: number;
  width?: number;
  depth?: number;
  variant: "zone" | "block";
}) {
  const vis = mediumVisual(medium);
  const isZone = variant === "zone";
  const color = isZone ? vis.zoneColor : vis.blockColor;
  const opacity = isZone ? vis.zoneOpacity : vis.blockOpacity;

  if (isZone && opacity < 0.03) return null;

  return (
    <mesh position={[0, yCenter, -0.02]} castShadow={!isZone}>
      <boxGeometry args={[width, height, depth]} />
      <meshPhysicalMaterial
        color={color}
        transparent
        opacity={opacity}
        roughness={isZone ? 0.9 : vis.blockRoughness}
        metalness={isZone ? 0 : vis.blockMetalness}
        transmission={isZone ? 0 : Math.min(0.55, opacity + 0.15)}
        thickness={isZone ? 0 : 0.12}
        ior={medium === "kaca" ? 1.5 : medium === "akrilik" ? 1.49 : medium === "air" ? 1.33 : 1}
        clearcoat={isZone ? 0 : 0.15}
        clearcoatRoughness={0.25}
      />
    </mesh>
  );
}

function SusunanMedium({
  medium1,
  medium2,
}: {
  medium1: OpticalMediumId;
  medium2: OpticalMediumId;
}) {
  const tinggiAtas = 0.17;
  const tinggiBawah = 0.2;

  return (
    <group>
      <VolumeMedium
        medium={medium1}
        variant="zone"
        yCenter={INTERFACE_Y + tinggiAtas / 2}
        height={tinggiAtas}
      />
      <VolumeMedium
        medium={medium2}
        variant="block"
        yCenter={INTERFACE_Y - tinggiBawah / 2}
        height={tinggiBawah}
      />
      <BidangBatas />
    </group>
  );
}

function OpticsExperiment({
  mode,
  result,
  medium1,
  medium2,
  beamSignal,
  resetSignal,
}: LightOpticsSceneProps) {
  const incidentRef = useRef(0);
  const secondaryRef = useRef(0);
  const activeRef = useRef(false);
  const arcsVisibleRef = useRef(false);
  const lastBeam = useRef(0);
  const lastReset = useRef(0);

  const titik = useMemo(
    () => [0, INTERFACE_Y, 0] as [number, number, number],
    [],
  );
  const sumber = useMemo(
    () => titikSumber(result.incidentAngleDeg),
    [result.incidentAngleDeg],
  );
  const pantul = useMemo(
    () => titikPantul(result.reflectedAngleDeg),
    [result.reflectedAngleDeg],
  );
  const bias = useMemo(
    () =>
      result.refractedAngleDeg !== null
        ? titikBias(result.refractedAngleDeg)
        : titik,
    [result.refractedAngleDeg, titik],
  );

  useEffect(() => {
    if (beamSignal > lastBeam.current) {
      lastBeam.current = beamSignal;
      incidentRef.current = 0;
      secondaryRef.current = 0;
      activeRef.current = true;
      arcsVisibleRef.current = false;
    }
  }, [beamSignal]);

  useEffect(() => {
    if (resetSignal > lastReset.current) {
      lastReset.current = resetSignal;
      incidentRef.current = 0;
      secondaryRef.current = 0;
      activeRef.current = false;
      arcsVisibleRef.current = false;
    }
  }, [resetSignal]);

  useEffect(() => {
    incidentRef.current = 0;
    secondaryRef.current = 0;
    activeRef.current = false;
    arcsVisibleRef.current = false;
  }, [mode, result.incidentAngleDeg, medium1, medium2]);

  useFrame((_, delta) => {
    if (!activeRef.current && incidentRef.current <= 0) return;

    if (incidentRef.current < 1) {
      incidentRef.current = Math.min(1, incidentRef.current + delta * 1.4);
      if (!activeRef.current) activeRef.current = true;
      return;
    }

    secondaryRef.current = Math.min(1, secondaryRef.current + delta * 1.2);
    arcsVisibleRef.current = secondaryRef.current > 0.02;
    if (secondaryRef.current >= 1) {
      activeRef.current = false;
    }
  });

  const tir =
    mode === "refraction" &&
    (result.totalInternalReflection || result.refractedAngleDeg === null);

  return (
    <group>
      <MejaOptik />
      <SenterCahaya posisi={sumber} target={titik} />

      {mode === "reflection" ? <CerminDatar /> : null}
      {mode === "refraction" ? (
        <SusunanMedium medium1={medium1} medium2={medium2} />
      ) : null}

      <GarisNormal />

      <SinarMesh
        dari={sumber}
        ke={titik}
        warna={OPTICS_COLORS.incident}
        progressRef={incidentRef}
      />

      {mode === "reflection" ? (
        <>
          <SinarMesh
            dari={titik}
            ke={pantul}
            warna={OPTICS_COLORS.reflected}
            progressRef={secondaryRef}
          />
          <ArcSudutKontrol
            sudutDeg={result.incidentAngleDeg}
            sisi="kiri-atas"
            warna={OPTICS_COLORS.incident}
            visibleRef={arcsVisibleRef}
          />
          <ArcSudutKontrol
            sudutDeg={result.reflectedAngleDeg}
            sisi="kanan-atas"
            warna={OPTICS_COLORS.reflected}
            visibleRef={arcsVisibleRef}
          />
        </>
      ) : (
        <>
          {!tir ? (
            <SinarMesh
              dari={titik}
              ke={pantul}
              warna={OPTICS_COLORS.reflected}
              progressRef={secondaryRef}
              multiplier={0.45}
              emissive={0.22}
            />
          ) : null}
          <SinarMesh
            dari={titik}
            ke={tir ? pantul : bias}
            warna={tir ? OPTICS_COLORS.reflected : OPTICS_COLORS.refracted}
            progressRef={secondaryRef}
          />
          <ArcSudutKontrol
            sudutDeg={result.incidentAngleDeg}
            sisi="kiri-atas"
            warna={OPTICS_COLORS.incident}
            visibleRef={arcsVisibleRef}
          />
          <ArcSudutKontrol
            sudutDeg={
              tir
                ? result.reflectedAngleDeg
                : result.refractedAngleDeg ?? result.reflectedAngleDeg
            }
            sisi={tir ? "kanan-atas" : "kanan-bawah"}
            warna={tir ? OPTICS_COLORS.reflected : OPTICS_COLORS.refracted}
            visibleRef={arcsVisibleRef}
          />
        </>
      )}
    </group>
  );
}

export function LightOpticsScene(props: LightOpticsSceneProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [0.35, 0.55, 1.05], fov: 42, near: 0.1, far: 20 }}
      gl={{ antialias: true, alpha: true }}
      className="h-full w-full touch-none"
    >
      <color attach="background" args={["#eef2f7"]} />
      <hemisphereLight args={["#f8fafc", "#cbd5e1", 0.45]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[2.2, 4.5, 2.8]}
        intensity={0.95}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0002}
        shadow-camera-near={0.1}
        shadow-camera-far={8}
        shadow-camera-left={-1.2}
        shadow-camera-right={1.2}
        shadow-camera-top={1.2}
        shadow-camera-bottom={-0.2}
      />
      <directionalLight position={[-1.5, 2.5, -1]} intensity={0.28} />

      <OpticsExperiment {...props} />

      <OrbitControls
        enablePan={false}
        minDistance={0.65}
        maxDistance={2.2}
        maxPolarAngle={Math.PI / 2 + 0.15}
        target={[0, INTERFACE_Y, 0]}
      />
    </Canvas>
  );
}

export { INTERFACE_Y, RAY_LEN, TABLE_HEIGHT, MEDIUM_VISUAL };
