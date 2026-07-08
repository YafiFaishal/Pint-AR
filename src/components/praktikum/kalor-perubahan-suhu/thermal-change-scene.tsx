"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { ThermalMaterialId } from "@/lib/thermal-change-utils";
import { getThermalMaterial } from "@/lib/thermal-change-utils";
import {
  heatProgress,
  smoothstep,
  THERMAL_COLORS,
  THERMAL_DIM,
  THERMAL_MATERIAL_VISUAL,
  THERMAL_TABLE_DEPTH,
  THERMAL_TABLE_HEIGHT,
  THERMAL_TABLE_WIDTH,
  type BubbleProfile,
  type SteamProfile,
} from "@/lib/thermal-change-visual";

type ThermalChangeSceneProps = {
  mode: "heating" | "comparison";
  materialA: ThermalMaterialId;
  materialB?: ThermalMaterialId;
  temperatureA: number;
  temperatureB?: number;
  heaterActive: boolean;
};

const PLATE_TOP = THERMAL_TABLE_HEIGHT + THERMAL_DIM.hotPlateHeight;

/** Lerp dua warna hex menjadi THREE.Color. */
function mixColor(a: string, b: string, t: number, target: THREE.Color) {
  target.set(a).lerp(_tmpColor.set(b), t);
  return target;
}
const _tmpColor = new THREE.Color();

/* ============================ Meja / platform ============================ */

function PlatformBase() {
  return (
    <group>
      <mesh position={[0, THERMAL_TABLE_HEIGHT / 2, 0]} receiveShadow>
        <boxGeometry
          args={[THERMAL_TABLE_WIDTH, THERMAL_TABLE_HEIGHT, THERMAL_TABLE_DEPTH]}
        />
        <meshStandardMaterial
          color={THERMAL_COLORS.table}
          metalness={0.06}
          roughness={0.68}
        />
      </mesh>
      <mesh position={[0, THERMAL_TABLE_HEIGHT + 0.0035, 0]} receiveShadow>
        <boxGeometry
          args={[THERMAL_TABLE_WIDTH - 0.06, 0.007, THERMAL_TABLE_DEPTH - 0.06]}
        />
        <meshStandardMaterial
          color={THERMAL_COLORS.tableTop}
          metalness={0.04}
          roughness={0.5}
        />
      </mesh>
    </group>
  );
}

/* ============================ Hot plate ============================ */

function HeaterAssembly({
  active,
  progress,
}: {
  active: boolean;
  progress: number;
}) {
  const {
    hotPlateWidth,
    hotPlateHeight,
    hotPlateDepth,
    hotPlateBevel,
    ringOuter,
    ringInner,
    footRadius,
    footHeight,
  } = THERMAL_DIM;

  const ringMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const surfaceMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const lampMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const glowColor = useRef(new THREE.Color(THERMAL_COLORS.hotPlateGlow));

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Target intensitas glow naik perlahan mengikuti progress + flicker halus.
    const base = active ? 0.2 + progress * 0.95 : 0;
    const flicker = active ? 1 + Math.sin(t * 9) * 0.05 + Math.sin(t * 3.3) * 0.03 : 1;
    const target = base * flicker;

    glowColor.current
      .set(THERMAL_COLORS.hotPlateGlow)
      .lerp(_tmpColor.set(THERMAL_COLORS.hotPlateGlowHot), progress);

    if (ringMatRef.current) {
      ringMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        ringMatRef.current.emissiveIntensity,
        target,
        0.12,
      );
      ringMatRef.current.emissive.copy(glowColor.current);
      ringMatRef.current.color
        .set(THERMAL_COLORS.hotPlateSurface)
        .lerp(glowColor.current, active ? 0.25 + progress * 0.4 : 0);
    }
    if (surfaceMatRef.current) {
      surfaceMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        surfaceMatRef.current.emissiveIntensity,
        active ? 0.12 + progress * 0.35 : 0,
        0.12,
      );
      surfaceMatRef.current.emissive.copy(glowColor.current);
    }
    if (lampMatRef.current) {
      lampMatRef.current.emissiveIntensity = active
        ? 0.8 + Math.sin(t * 6) * 0.15
        : 0;
    }
  });

  return (
    <group position={[0, THERMAL_TABLE_HEIGHT, 0]}>
      {/* Kaki-kaki kecil */}
      {[
        [hotPlateWidth * 0.36, hotPlateDepth * 0.36],
        [-hotPlateWidth * 0.36, hotPlateDepth * 0.36],
        [hotPlateWidth * 0.36, -hotPlateDepth * 0.36],
        [-hotPlateWidth * 0.36, -hotPlateDepth * 0.36],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, footHeight / 2, z]}>
          <cylinderGeometry args={[footRadius, footRadius * 1.1, footHeight, 12]} />
          <meshStandardMaterial color="#15181d" metalness={0.4} roughness={0.6} />
        </mesh>
      ))}

      {/* Body pemanas (beveled) */}
      <RoundedBox
        args={[hotPlateWidth, hotPlateHeight, hotPlateDepth]}
        radius={hotPlateBevel}
        smoothness={3}
        position={[0, footHeight + hotPlateHeight / 2, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={THERMAL_COLORS.hotPlateBody}
          metalness={0.45}
          roughness={0.5}
        />
      </RoundedBox>

      {/* Bezel atas sedikit lebih terang */}
      <mesh position={[0, footHeight + hotPlateHeight + 0.001, 0]}>
        <cylinderGeometry
          args={[hotPlateWidth * 0.46, hotPlateWidth * 0.46, 0.006, 40]}
        />
        <meshStandardMaterial
          color={THERMAL_COLORS.hotPlateBodyEdge}
          metalness={0.5}
          roughness={0.4}
        />
      </mesh>

      {/* Permukaan panas gelap */}
      <mesh position={[0, footHeight + hotPlateHeight + 0.005, 0]}>
        <cylinderGeometry args={[ringOuter + 0.006, ringOuter + 0.006, 0.004, 40]} />
        <meshStandardMaterial
          ref={surfaceMatRef}
          color={THERMAL_COLORS.hotPlateSurface}
          emissive={THERMAL_COLORS.hotPlateGlow}
          emissiveIntensity={0}
          metalness={0.3}
          roughness={0.55}
        />
      </mesh>

      {/* Ring pemanas (area panas) */}
      <mesh
        position={[0, footHeight + hotPlateHeight + 0.008, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[ringInner, ringOuter, 48]} />
        <meshStandardMaterial
          ref={ringMatRef}
          color={THERMAL_COLORS.hotPlateSurface}
          emissive={THERMAL_COLORS.hotPlateGlow}
          emissiveIntensity={0}
          metalness={0.2}
          roughness={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Lampu indikator */}
      <mesh
        position={[
          hotPlateWidth * 0.38,
          footHeight + hotPlateHeight * 0.55,
          hotPlateDepth * 0.38,
        ]}
      >
        <sphereGeometry args={[0.007, 12, 12]} />
        <meshStandardMaterial
          ref={lampMatRef}
          color={active ? THERMAL_COLORS.indicatorOn : THERMAL_COLORS.indicatorOff}
          emissive={THERMAL_COLORS.indicatorOn}
          emissiveIntensity={0}
        />
      </mesh>

      {/* Warm glow point light (murah, tanpa shadow) */}
      <pointLight
        position={[0, footHeight + hotPlateHeight + 0.05, 0]}
        color={THERMAL_COLORS.hotPlateGlowHot}
        intensity={active ? 0.15 + progress * 0.55 : 0}
        distance={0.4}
        decay={2}
      />
    </group>
  );
}

/* ============================ Probe / termometer ============================ */

function TemperatureProbe({ yBase }: { yBase: number }) {
  const { probeRadius, probeLength } = THERMAL_DIM;
  return (
    <group position={[0.088, yBase, 0.05]}>
      {/* Batang */}
      <mesh position={[0, probeLength / 2, 0]} castShadow>
        <cylinderGeometry args={[probeRadius, probeRadius, probeLength, 12]} />
        <meshStandardMaterial
          color={THERMAL_COLORS.probeBody}
          metalness={0.55}
          roughness={0.3}
        />
      </mesh>
      {/* Ujung sensor */}
      <mesh position={[0, 0.004, 0]}>
        <sphereGeometry args={[probeRadius * 2.1, 12, 12]} />
        <meshStandardMaterial
          color={THERMAL_COLORS.probeTip}
          metalness={0.5}
          roughness={0.35}
        />
      </mesh>
      {/* Kepala display kecil */}
      <group position={[0, probeLength + 0.012, 0]}>
        <RoundedBox args={[0.03, 0.024, 0.014]} radius={0.004} smoothness={2} castShadow>
          <meshStandardMaterial
            color={THERMAL_COLORS.probeStem}
            metalness={0.35}
            roughness={0.45}
          />
        </RoundedBox>
        <mesh position={[0, 0.001, 0.0075]}>
          <planeGeometry args={[0.02, 0.014]} />
          <meshStandardMaterial
            color={THERMAL_COLORS.probeDisplay}
            emissive="#38bdf8"
            emissiveIntensity={0.35}
            roughness={0.3}
          />
        </mesh>
      </group>
    </group>
  );
}

/* ============================ Wadah cairan ============================ */

function Beaker() {
  const { beakerRadius, beakerHeight } = THERMAL_DIM;
  const beakerY = PLATE_TOP + beakerHeight / 2;
  return (
    <group>
      {/* Dinding luar kaca */}
      <mesh position={[0, beakerY, 0]} renderOrder={3}>
        <cylinderGeometry
          args={[beakerRadius, beakerRadius * 0.94, beakerHeight, 40, 1, true]}
        />
        <meshPhysicalMaterial
          color={THERMAL_COLORS.beaker}
          transparent
          opacity={0.24}
          roughness={0.08}
          metalness={0}
          clearcoat={0.6}
          clearcoatRoughness={0.2}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* Bibir / rim */}
      <mesh
        position={[0, PLATE_TOP + beakerHeight, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={3}
      >
        <torusGeometry args={[beakerRadius, 0.004, 8, 40]} />
        <meshPhysicalMaterial
          color={THERMAL_COLORS.beakerRim}
          transparent
          opacity={0.55}
          roughness={0.1}
        />
      </mesh>
      {/* Dasar wadah */}
      <mesh position={[0, PLATE_TOP + 0.004, 0]} renderOrder={2}>
        <cylinderGeometry
          args={[beakerRadius * 0.94, beakerRadius * 0.94, 0.008, 40]}
        />
        <meshPhysicalMaterial
          color={THERMAL_COLORS.beaker}
          transparent
          opacity={0.4}
          roughness={0.15}
        />
      </mesh>
    </group>
  );
}

/* ============================ Gelembung (instanced) ============================ */

type BubbleState = { x: number; z: number; phase: number; speed: number; scale: number };

/** PRNG deterministik (pure) agar layout gelembung stabil antar-render. */
function hashRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function Bubbles({
  profile,
  progress,
  active,
  areaRadius,
  baseY,
  columnHeight,
}: {
  profile: BubbleProfile;
  progress: number;
  active: boolean;
  areaRadius: number;
  baseY: number;
  columnHeight: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const bubbles = useMemo<BubbleState[]>(() => {
    return Array.from({ length: profile.maxCount }, (_, i) => {
      const r = Math.sqrt(hashRandom(i + 1)) * areaRadius;
      const a = hashRandom(i + 17) * Math.PI * 2;
      return {
        x: Math.cos(a) * r,
        z: Math.sin(a) * r,
        phase: hashRandom(i + 41),
        speed: 0.7 + hashRandom(i + 73) * 0.6,
        scale:
          profile.minRadius +
          hashRandom(i + 101) * (profile.maxRadius - profile.minRadius),
      };
    });
  }, [profile, areaRadius]);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const intensity = active
      ? smoothstep(profile.startProgress, 1, progress)
      : 0;
    const activeCount = Math.round(profile.maxCount * intensity);
    const t = state.clock.elapsedTime;

    for (let i = 0; i < profile.maxCount; i++) {
      const b = bubbles[i];
      if (i >= activeCount) {
        dummy.scale.setScalar(0);
        dummy.position.set(b.x, baseY, b.z);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        continue;
      }
      const cycle = (t * profile.riseSpeed * b.speed + b.phase) % 1;
      const y = baseY + cycle * columnHeight;
      // Membesar sedikit lalu mengecil saat mendekati permukaan.
      const grow = Math.sin(cycle * Math.PI);
      const s = b.scale * (0.5 + grow * 0.5);
      dummy.position.set(
        b.x + Math.sin(t * 2 + b.phase * 6) * 0.002,
        y,
        b.z,
      );
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.visible = activeCount > 0;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, profile.maxCount]}
      renderOrder={2}
    >
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        color="#ffffff"
        transparent
        opacity={0.5}
        roughness={0.1}
        metalness={0}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

/* ============================ Uap ============================ */

function Steam({
  profile,
  progress,
  active,
  baseY,
}: {
  profile: SteamProfile;
  progress: number;
  active: boolean;
  baseY: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const puffs = useMemo(
    () =>
      [0, 1, 2, 3].map((i) => ({
        x: (i - 1.5) * 0.016,
        phase: i * 0.27,
        r: 0.014 + (i % 2) * 0.006,
      })),
    [],
  );

  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;
    const intensity = active ? smoothstep(profile.startProgress, 1, progress) : 0;
    const t = state.clock.elapsedTime;
    g.children.forEach((child, i) => {
      const p = puffs[i];
      const cycle = (t * profile.driftSpeed + p.phase) % 1;
      child.position.y = cycle * 0.12;
      child.position.x = p.x + Math.sin(t * 0.8 + p.phase * 5) * 0.006;
      const fade = Math.sin(cycle * Math.PI);
      const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
      mat.opacity = intensity * profile.maxOpacity * fade;
      const s = 0.7 + cycle * 0.9;
      child.scale.setScalar(s);
    });
    g.visible = intensity > 0.01;
  });

  return (
    <group ref={groupRef} position={[0, baseY, 0]}>
      {puffs.map((p, i) => (
        <mesh key={i} position={[p.x, 0, 0]}>
          <sphereGeometry args={[p.r, 8, 8]} />
          <meshStandardMaterial
            color={THERMAL_COLORS.steam}
            transparent
            opacity={0}
            roughness={1}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ============================ Setup cairan ============================ */

function LiquidSetup({
  materialId,
  progress,
  active,
}: {
  materialId: "water" | "oil";
  progress: number;
  active: boolean;
}) {
  const { beakerRadius, liquidHeight } = THERMAL_DIM;
  const visual = THERMAL_MATERIAL_VISUAL[materialId];
  const liquidRadius = beakerRadius * 0.88;
  const liquidY = PLATE_TOP + 0.008 + liquidHeight / 2;
  const surfaceY = PLATE_TOP + 0.008 + liquidHeight;

  const bodyMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const surfaceRef = useRef<THREE.Mesh>(null);
  const surfaceMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const color = useRef(new THREE.Color(visual.coolColor));
  const emissive = useRef(new THREE.Color(visual.emissiveWarm ?? "#000000"));

  useFrame((state) => {
    mixColor(visual.coolColor, visual.warmColor, progress, color.current);
    const emInt = active ? (visual.emissiveMaxIntensity ?? 0) * progress : 0;
    if (bodyMatRef.current) {
      bodyMatRef.current.color.lerp(color.current, 0.1);
      bodyMatRef.current.emissive.copy(emissive.current);
      bodyMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        bodyMatRef.current.emissiveIntensity,
        emInt,
        0.1,
      );
    }
    if (surfaceMatRef.current) {
      surfaceMatRef.current.color.lerp(color.current, 0.1);
    }
    // Ripple sangat halus pada permukaan saat aktif.
    if (surfaceRef.current) {
      const t = state.clock.elapsedTime;
      const amp = active ? 0.0006 + progress * 0.0012 : 0;
      surfaceRef.current.position.y = surfaceY + Math.sin(t * 3) * amp;
      surfaceRef.current.scale.x = 1 + Math.sin(t * 2.1) * amp * 6;
      surfaceRef.current.scale.z = 1 + Math.cos(t * 2.4) * amp * 6;
    }
  });

  return (
    <group>
      <Beaker />
      {/* Badan cairan */}
      <mesh position={[0, liquidY, 0]} renderOrder={1}>
        <cylinderGeometry args={[liquidRadius, liquidRadius, liquidHeight, 40]} />
        <meshPhysicalMaterial
          ref={bodyMatRef}
          color={visual.coolColor}
          transparent
          opacity={visual.opacity ?? 0.55}
          roughness={visual.roughness}
          metalness={visual.metalness}
          emissive={visual.emissiveWarm ?? "#000000"}
          emissiveIntensity={0}
          depthWrite={false}
        />
      </mesh>
      {/* Permukaan cairan */}
      <mesh ref={surfaceRef} position={[0, surfaceY, 0]} renderOrder={1}>
        <cylinderGeometry args={[liquidRadius, liquidRadius, 0.002, 40]} />
        <meshPhysicalMaterial
          ref={surfaceMatRef}
          color={visual.coolColor}
          transparent
          opacity={(visual.opacity ?? 0.55) + 0.2}
          roughness={0.05}
          metalness={materialId === "oil" ? 0.1 : 0.02}
          clearcoat={0.5}
        />
      </mesh>
      {visual.bubble ? (
        <Bubbles
          profile={visual.bubble}
          progress={progress}
          active={active}
          areaRadius={liquidRadius * 0.8}
          baseY={PLATE_TOP + 0.012}
          columnHeight={liquidHeight - 0.01}
        />
      ) : null}
      {visual.steam ? (
        <Steam
          profile={visual.steam}
          progress={progress}
          active={active}
          baseY={surfaceY + 0.01}
        />
      ) : null}
      <TemperatureProbe yBase={PLATE_TOP + 0.02} />
    </group>
  );
}

/* ============================ Setup logam ============================ */

function SolidSetup({
  materialId,
  progress,
  active,
}: {
  materialId: "aluminum" | "copper";
  progress: number;
  active: boolean;
}) {
  const { blockWidth, blockHeight, blockDepth, blockBevel } = THERMAL_DIM;
  const visual = THERMAL_MATERIAL_VISUAL[materialId];
  const blockY = PLATE_TOP + blockHeight / 2 + 0.004;

  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const color = useRef(new THREE.Color(visual.coolColor));

  useFrame(() => {
    mixColor(visual.coolColor, visual.warmColor, progress * 0.85, color.current);
    const emInt = active ? (visual.emissiveMaxIntensity ?? 0) * progress : 0;
    if (matRef.current) {
      matRef.current.color.lerp(color.current, 0.1);
      matRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        matRef.current.emissiveIntensity,
        emInt,
        0.08,
      );
      matRef.current.roughness = THREE.MathUtils.lerp(
        matRef.current.roughness,
        visual.roughness - progress * 0.08,
        0.1,
      );
    }
  });

  return (
    <group>
      <RoundedBox
        args={[blockWidth, blockHeight, blockDepth]}
        radius={blockBevel}
        smoothness={3}
        position={[0, blockY, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          ref={matRef}
          color={visual.coolColor}
          metalness={visual.metalness}
          roughness={visual.roughness}
          emissive={visual.emissiveWarm ?? "#000000"}
          emissiveIntensity={0}
        />
      </RoundedBox>
      <TemperatureProbe yBase={PLATE_TOP + blockHeight * 0.35} />
    </group>
  );
}

/* ============================ Satu eksperimen ============================ */

function SingleExperiment({
  materialId,
  temperatureC,
  heaterActive,
}: {
  materialId: ThermalMaterialId;
  temperatureC: number;
  heaterActive: boolean;
}) {
  const mat = getThermalMaterial(materialId);
  const progress = heatProgress(temperatureC);

  return (
    <group>
      <HeaterAssembly active={heaterActive} progress={progress} />
      <MaterialTransition key={materialId}>
        {mat.state === "liquid" ? (
          <LiquidSetup
            materialId={materialId as "water" | "oil"}
            progress={progress}
            active={heaterActive}
          />
        ) : (
          <SolidSetup
            materialId={materialId as "aluminum" | "copper"}
            progress={progress}
            active={heaterActive}
          />
        )}
      </MaterialTransition>
    </group>
  );
}

/** Animasi scale-in halus setiap kali material berganti (keyed di parent). */
function MaterialTransition({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const progress = useRef(0);

  useFrame((_, dt) => {
    if (!ref.current || progress.current >= 1) return;
    progress.current = Math.min(1, progress.current + dt * 4);
    const eased = 1 - Math.pow(1 - progress.current, 3);
    const s = 0.82 + eased * 0.18;
    ref.current.scale.setScalar(s);
  });

  return (
    <group ref={ref} scale={0.82}>
      {children}
    </group>
  );
}

/* ============================ Kamera ============================ */

const CAMERA_POSES: Record<
  "heating" | "comparison",
  { pos: [number, number, number]; target: [number, number, number] }
> = {
  heating: { pos: [0.42, 0.34, 0.92], target: [0, 0.15, 0] },
  comparison: { pos: [0.3, 0.46, 1.32], target: [0, 0.14, 0] },
};

function CameraRig({ mode }: { mode: "heating" | "comparison" }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as
    | { target: THREE.Vector3; update: () => void }
    | null;
  const anim = useRef<number>(0);
  const from = useRef({ pos: new THREE.Vector3(), target: new THREE.Vector3() });
  const to = useRef({ pos: new THREE.Vector3(), target: new THREE.Vector3() });

  useEffect(() => {
    const pose = CAMERA_POSES[mode];
    from.current.pos.copy(camera.position);
    from.current.target.copy(
      controls?.target ?? new THREE.Vector3(...pose.target),
    );
    to.current.pos.set(...pose.pos);
    to.current.target.set(...pose.target);
    anim.current = 0.0001;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useFrame((_, dt) => {
    if (anim.current <= 0 || anim.current >= 1) return;
    anim.current = Math.min(1, anim.current + dt * 2.2);
    const eased = 1 - Math.pow(1 - anim.current, 3);
    camera.position.lerpVectors(from.current.pos, to.current.pos, eased);
    if (controls) {
      controls.target.lerpVectors(
        from.current.target,
        to.current.target,
        eased,
      );
      controls.update();
    }
  });

  return null;
}

/* ============================ Root ============================ */

function ThermalLab(props: ThermalChangeSceneProps) {
  const offset = THERMAL_DIM.comparisonOffsetX;

  if (props.mode === "comparison" && props.materialB) {
    return (
      <group>
        <PlatformBase />
        <group position={[-offset, 0, 0]}>
          <SingleExperiment
            materialId={props.materialA}
            temperatureC={props.temperatureA}
            heaterActive={props.heaterActive}
          />
        </group>
        <group position={[offset, 0, 0]}>
          <SingleExperiment
            materialId={props.materialB}
            temperatureC={props.temperatureB ?? props.temperatureA}
            heaterActive={props.heaterActive}
          />
        </group>
        <ContactShadows
          position={[0, THERMAL_TABLE_HEIGHT + 0.001, 0]}
          scale={0.9}
          resolution={512}
          blur={2.6}
          opacity={0.35}
          far={0.4}
          frames={1}
        />
      </group>
    );
  }

  return (
    <group>
      <PlatformBase />
      <SingleExperiment
        materialId={props.materialA}
        temperatureC={props.temperatureA}
        heaterActive={props.heaterActive}
      />
      <ContactShadows
        position={[0, THERMAL_TABLE_HEIGHT + 0.001, 0]}
        scale={0.55}
        resolution={512}
        blur={2.4}
        opacity={0.4}
        far={0.35}
        frames={1}
      />
    </group>
  );
}

export function ThermalChangeScene(props: ThermalChangeSceneProps) {
  return (
    <Canvas
      shadows="soft"
      dpr={[1, 2]}
      camera={{
        position: CAMERA_POSES[props.mode].pos,
        fov: 40,
        near: 0.05,
        far: 20,
      }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      className="h-full w-full touch-none"
    >
      <color attach="background" args={["#eef2f7"]} />
      <fog attach="fog" args={["#eef2f7", 2.2, 5]} />

      <hemisphereLight args={["#ffffff", "#c3cddb", 0.62]} />
      <ambientLight intensity={0.28} />
      <directionalLight
        position={[1.8, 3.2, 2.0]}
        intensity={1.05}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.00018}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-1.6, 1.4, -1.0]} intensity={0.3} color="#dbeafe" />

      <ThermalLab {...props} />
      <CameraRig mode={props.mode} />

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={0.6}
        maxDistance={2.6}
        maxPolarAngle={Math.PI / 2 + 0.08}
        target={CAMERA_POSES[props.mode].target}
      />
    </Canvas>
  );
}
