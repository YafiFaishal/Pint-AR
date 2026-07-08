"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  PANJANG_ALAMI_DEFAULT,
  calculateOscillationDisplacement,
  calculateSpringResult,
  sanitizeAmplitude,
  sanitizeGravity,
  sanitizeMass,
  sanitizeSpringConstant,
  type SpringExperimentMode,
} from "@/lib/hookes-law-utils";
import {
  SPRING_ANCHOR_Y,
  SPRING_BASE_TOP_Y,
  SPRING_BOTTOM_HOOK_LEN,
  SPRING_COLORS,
  SPRING_DIM,
  SPRING_METER_TO_UNIT,
  SPRING_MIN_LENGTH_VIS,
  SPRING_NATURAL_VIS,
  SPRING_SAFETY_CLEARANCE,
  SPRING_STAND_HEIGHT,
  SPRING_TABLE_DEPTH,
  SPRING_TABLE_HEIGHT,
  SPRING_TABLE_WIDTH,
  SPRING_TOP_ANCHOR_Y,
  SPRING_TOP_CONNECTOR_LEN,
  SPRING_TOP_Y,
  massHeightFromKg,
  massRadiusFromKg,
} from "@/lib/hookes-law-visual";

export type SpringSimStatus = "idle" | "running" | "paused";

type HookesLawSceneProps = {
  mode: SpringExperimentMode;
  springConstantNm: number;
  massKg: number;
  gravityMs2: number;
  initialAmplitudeM: number;
  simStatus: SpringSimStatus;
  resetSignal: number;
  onSimUpdate?: (state: {
    elapsed: number;
    oscillations: number;
    periodS: number;
  }) => void;
};

const TRANSITION_TAU = 0.08;

function toVisual(m: number): number {
  return m * SPRING_METER_TO_UNIT;
}

/**
 * Helix pegas dengan ujung meruncing ke sumbu tengah agar menyatu dengan
 * connector atas/bawah. Panjang dinamis; radius coil & ketebalan kawat tetap.
 */
function createHelixGeometry(
  length: number,
  coilRadius: number,
  wireRadius: number,
  turns: number,
): THREE.TubeGeometry {
  const segments = Math.max(48, Math.round(turns * 8));
  const edge = 0.06;
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = turns * Math.PI * 2 * t;
    let rFactor = 1;
    if (t < edge) rFactor = t / edge;
    else if (t > 1 - edge) rFactor = (1 - t) / edge;
    const r = coilRadius * rFactor;
    points.push(
      new THREE.Vector3(
        r * Math.cos(angle),
        -length * t,
        r * Math.sin(angle),
      ),
    );
  }
  const curve = new THREE.CatmullRomCurve3(points);
  return new THREE.TubeGeometry(curve, segments, wireRadius, 8, false);
}

/** Kapasitas visual maksimum pertambahan panjang (unit scene) untuk massa tertentu. */
function maxVisualExtensionForMass(massH: number): number {
  return Math.max(
    0,
    SPRING_TOP_Y -
      SPRING_NATURAL_VIS -
      SPRING_BOTTOM_HOOK_LEN -
      massH -
      SPRING_BASE_TOP_Y -
      SPRING_SAFETY_CLEARANCE,
  );
}

/* ----------------------------- Static apparatus ---------------------------- */

function BaseAlas() {
  return (
    <group>
      <mesh position={[0, SPRING_TABLE_HEIGHT / 2, 0]} receiveShadow castShadow>
        <boxGeometry
          args={[SPRING_TABLE_WIDTH, SPRING_TABLE_HEIGHT, SPRING_TABLE_DEPTH]}
        />
        <meshStandardMaterial
          color={SPRING_COLORS.table}
          metalness={0.08}
          roughness={0.62}
        />
      </mesh>
      <mesh position={[0, SPRING_TABLE_HEIGHT + 0.003, 0]} receiveShadow>
        <boxGeometry
          args={[SPRING_TABLE_WIDTH - 0.08, 0.006, SPRING_TABLE_DEPTH - 0.08]}
        />
        <meshStandardMaterial
          color={SPRING_COLORS.tableTop}
          metalness={0.04}
          roughness={0.5}
        />
      </mesh>
    </group>
  );
}

function Kaki({ x }: { x: number }) {
  const { postRadius, footRadius, footHeight, jointRadius } = SPRING_DIM;
  const yMid = SPRING_TABLE_HEIGHT + SPRING_STAND_HEIGHT / 2;
  const postLen = SPRING_STAND_HEIGHT - postRadius * 2;
  return (
    <group>
      <mesh
        position={[x, SPRING_TABLE_HEIGHT + footHeight / 2, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[footRadius, footRadius * 1.15, footHeight, 20]} />
        <meshStandardMaterial
          color={SPRING_COLORS.foot}
          metalness={0.5}
          roughness={0.5}
        />
      </mesh>
      <mesh position={[x, yMid, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[postRadius, postLen, 4, 12]} />
        <meshStandardMaterial
          color={SPRING_COLORS.stand}
          metalness={0.4}
          roughness={0.55}
        />
      </mesh>
      <mesh position={[x, SPRING_ANCHOR_Y, 0]} castShadow>
        <sphereGeometry args={[jointRadius, 16, 12]} />
        <meshStandardMaterial
          color={SPRING_COLORS.joint}
          metalness={0.45}
          roughness={0.5}
        />
      </mesh>
    </group>
  );
}

function StandDanBalok() {
  const { postX, crossbarRadius, crossbarLength, clampWidth, clampHeight, clampDepth } =
    SPRING_DIM;
  const crossbarLen = crossbarLength - crossbarRadius * 2;
  return (
    <group>
      <Kaki x={-postX} />
      <Kaki x={postX} />
      {/* Balok atas */}
      <mesh
        position={[0, SPRING_ANCHOR_Y, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
        receiveShadow
      >
        <capsuleGeometry args={[crossbarRadius, crossbarLen, 4, 16]} />
        <meshStandardMaterial
          color={SPRING_COLORS.crossbar}
          metalness={0.4}
          roughness={0.5}
        />
      </mesh>
      {/* Clamp tengah */}
      <mesh position={[0, SPRING_ANCHOR_Y - clampHeight / 2 + 0.006, 0]} castShadow>
        <boxGeometry args={[clampWidth, clampHeight, clampDepth]} />
        <meshStandardMaterial
          color={SPRING_COLORS.clamp}
          metalness={0.4}
          roughness={0.5}
        />
      </mesh>
    </group>
  );
}

/** Pengait atas tetap + connector menuju coil pertama (tidak bergerak). */
function FixedTopHook() {
  const { topConnectorRadius } = SPRING_DIM;
  const connectorMidY = (SPRING_TOP_ANCHOR_Y + SPRING_TOP_Y) / 2;
  return (
    <group>
      <mesh position={[0, SPRING_TOP_ANCHOR_Y, 0]}>
        <sphereGeometry args={[0.014, 16, 12]} />
        <meshStandardMaterial
          color={SPRING_COLORS.anchor}
          metalness={0.55}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[0, connectorMidY, 0]}>
        <cylinderGeometry
          args={[
            topConnectorRadius,
            topConnectorRadius,
            SPRING_TOP_CONNECTOR_LEN,
            10,
          ]}
        />
        <meshStandardMaterial
          color={SPRING_COLORS.hook}
          metalness={0.55}
          roughness={0.42}
        />
      </mesh>
    </group>
  );
}

/* --------------------------- Dynamic spring system -------------------------- */

function PanahGaya({
  yCenter,
  direction,
  length,
  color,
}: {
  yCenter: number;
  direction: "up" | "down";
  length: number;
  color: string;
}) {
  const shaftLen = Math.min(Math.max(length, 0.045), 0.11);
  const headH = 0.014;
  const ySign = direction === "up" ? 1 : -1;
  const shaftY = yCenter + (ySign * shaftLen) / 2;
  const headY = yCenter + ySign * (shaftLen + headH / 2);
  return (
    <group>
      <mesh position={[0, shaftY, 0]}>
        <cylinderGeometry args={[0.003, 0.003, shaftLen, 8]} />
        <meshStandardMaterial color={color} metalness={0.2} roughness={0.5} />
      </mesh>
      <mesh
        position={[0, headY, 0]}
        rotation={direction === "up" ? [0, 0, 0] : [Math.PI, 0, 0]}
      >
        <coneGeometry args={[0.008, headH, 10]} />
        <meshStandardMaterial color={color} metalness={0.2} roughness={0.5} />
      </mesh>
    </group>
  );
}

/**
 * Sistem pegas + beban. Semua posisi diturunkan dari SATU sumber:
 * currentExtVis (pertambahan panjang visual saat ini).
 * Base, stand, balok, dan pengait atas tidak berada di dalam komponen ini.
 */
function SpringSystem({
  mode,
  springConstantNm,
  massKg,
  gravityMs2,
  initialAmplitudeM,
  simStatus,
  resetSignal,
  onSimUpdate,
  eqExtVisClamped,
  maxVisualExtension,
  massH,
  massR,
  weightN,
  angularFrequencyRadS,
  periodS,
}: HookesLawSceneProps & {
  eqExtVisClamped: number;
  maxVisualExtension: number;
  massH: number;
  massR: number;
  weightN: number;
  angularFrequencyRadS: number;
  periodS: number;
}) {
  const springMeshRef = useRef<THREE.Mesh>(null);
  const bottomAnchorRef = useRef<THREE.Group>(null);

  const currentExtVis = useRef<number | null>(null);
  const lastGeoLen = useRef(-1);
  const elapsed = useRef(0);
  const lastReset = useRef(0);

  const A = sanitizeAmplitude(initialAmplitudeM);

  const minExtVis = SPRING_MIN_LENGTH_VIS - SPRING_NATURAL_VIS;

  const applyGeometry = (len: number) => {
    if (!springMeshRef.current) return;
    if (Math.abs(len - lastGeoLen.current) < 0.0006) return;
    const geo = createHelixGeometry(
      len,
      SPRING_DIM.coilRadius,
      SPRING_DIM.wireRadius,
      SPRING_DIM.coilTurns,
    );
    springMeshRef.current.geometry.dispose();
    springMeshRef.current.geometry = geo;
    lastGeoLen.current = len;
  };

  const applyTransforms = (extVis: number) => {
    const springLength = Math.max(
      SPRING_MIN_LENGTH_VIS,
      SPRING_NATURAL_VIS + extVis,
    );
    const springBottomY = SPRING_TOP_Y - springLength;
    applyGeometry(springLength);
    if (bottomAnchorRef.current) {
      bottomAnchorRef.current.position.y = springBottomY;
    }
  };

  // Inisialisasi posisi sebelum frame pertama (hindari lerp dari 0).
  useLayoutEffect(() => {
    if (currentExtVis.current === null) {
      currentExtVis.current = eqExtVisClamped;
    }
    applyTransforms(currentExtVis.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const mesh = springMeshRef.current;
    return () => {
      mesh?.geometry.dispose();
    };
  }, []);

  useEffect(() => {
    if (resetSignal > lastReset.current) {
      lastReset.current = resetSignal;
      elapsed.current = 0;
      currentExtVis.current = eqExtVisClamped;
      onSimUpdate?.({ elapsed: 0, oscillations: 0, periodS });
    }
  }, [resetSignal, eqExtVisClamped, onSimUpdate, periodS]);

  useEffect(() => {
    elapsed.current = 0;
    onSimUpdate?.({ elapsed: 0, oscillations: 0, periodS });
  }, [mode, springConstantNm, massKg, gravityMs2, onSimUpdate, periodS]);

  useFrame((_, dt) => {
    const clampedDt = Math.min(dt, 0.05);
    if (currentExtVis.current === null) currentExtVis.current = eqExtVisClamped;

    if (mode === "oscillation" && simStatus === "running") {
      elapsed.current += clampedDt;
      const disp = calculateOscillationDisplacement(
        A,
        angularFrequencyRadS,
        elapsed.current,
      );
      const target = eqExtVisClamped + toVisual(disp);
      currentExtVis.current = Math.min(
        maxVisualExtension,
        Math.max(minExtVis, target),
      );
      const osc = periodS > 0 ? Math.floor(elapsed.current / periodS) : 0;
      onSimUpdate?.({ elapsed: elapsed.current, oscillations: osc, periodS });
    } else if (mode === "oscillation" && simStatus === "paused") {
      // tahan posisi terakhir
    } else {
      // static / idle: transisi halus menuju posisi setimbang
      const s = 1 - Math.exp(-clampedDt / TRANSITION_TAU);
      currentExtVis.current +=
        (eqExtVisClamped - currentExtVis.current) * s;
    }

    applyTransforms(currentExtVis.current);
  });

  const arrowLen = Math.min(0.1, 0.05 + weightN / 60);
  const massCenterLocalY = -SPRING_BOTTOM_HOOK_LEN - massH / 2;
  const arrowZ = massR + 0.03;

  return (
    <>
      {/* Pegas: coil teratas TETAP di SPRING_TOP_Y, geometry dibangun ke bawah. */}
      <mesh ref={springMeshRef} position={[0, SPRING_TOP_Y, 0]} castShadow>
        <meshStandardMaterial
          color={SPRING_COLORS.spring}
          metalness={0.35}
          roughness={0.45}
        />
      </mesh>

      {/* Assembly bawah: bergerak sebagai satu sistem mengikuti ujung pegas. */}
      <group ref={bottomAnchorRef}>
        {/* Pengait bawah */}
        <mesh position={[0, -SPRING_BOTTOM_HOOK_LEN / 2, 0]}>
          <cylinderGeometry
            args={[
              SPRING_DIM.bottomHookRadius,
              SPRING_DIM.bottomHookRadius,
              SPRING_BOTTOM_HOOK_LEN,
              10,
            ]}
          />
          <meshStandardMaterial
            color={SPRING_COLORS.hook}
            metalness={0.55}
            roughness={0.42}
          />
        </mesh>
        {/* Eyelet/ring di atas beban */}
        <mesh position={[0, -SPRING_BOTTOM_HOOK_LEN, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry
            args={[SPRING_DIM.eyeletRadius, SPRING_DIM.eyeletTube, 8, 20]}
          />
          <meshStandardMaterial
            color={SPRING_COLORS.hook}
            metalness={0.55}
            roughness={0.42}
          />
        </mesh>
        {/* Beban */}
        <mesh position={[0, massCenterLocalY, 0]} castShadow>
          <cylinderGeometry args={[massR, massR * 0.96, massH, 24]} />
          <meshStandardMaterial
            color={SPRING_COLORS.mass}
            metalness={0.3}
            roughness={0.45}
          />
        </mesh>
        <mesh
          position={[0, massCenterLocalY + massH / 2 + 0.004, 0]}
        >
          <cylinderGeometry args={[massR * 0.55, massR * 0.7, 0.008, 16]} />
          <meshStandardMaterial
            color={SPRING_COLORS.massCollar}
            metalness={0.35}
            roughness={0.5}
          />
        </mesh>

        {/* Panah gaya mengikuti beban (hanya mode statis). */}
        {mode === "static" ? (
          <group position={[0, massCenterLocalY, arrowZ]}>
            <PanahGaya
              yCenter={0}
              direction="down"
              length={arrowLen}
              color={SPRING_COLORS.weightArrow}
            />
            <PanahGaya
              yCenter={0}
              direction="up"
              length={arrowLen}
              color={SPRING_COLORS.springArrow}
            />
          </group>
        ) : null}
      </group>
    </>
  );
}

/* ----------------------------- Measurement guide ---------------------------- */

function SpringMeasurementGuide({
  eqExtVisClamped,
  mode,
  springConstantNm,
  massKg,
  gravityMs2,
  initialAmplitudeM,
  simStatus,
  angularFrequencyRadS,
  maxVisualExtension,
}: {
  eqExtVisClamped: number;
  mode: SpringExperimentMode;
  springConstantNm: number;
  massKg: number;
  gravityMs2: number;
  initialAmplitudeM: number;
  simStatus: SpringSimStatus;
  angularFrequencyRadS: number;
  maxVisualExtension: number;
}) {
  const x = SPRING_DIM.rulerX;
  const naturalY = SPRING_TOP_Y - SPRING_NATURAL_VIS;

  const barRef = useRef<THREE.Mesh>(null);
  const tickRef = useRef<THREE.Mesh>(null);
  const currentExt = useRef(eqExtVisClamped);
  const elapsed = useRef(0);
  const A = sanitizeAmplitude(initialAmplitudeM);
  const minExtVis = SPRING_MIN_LENGTH_VIS - SPRING_NATURAL_VIS;

  useEffect(() => {
    elapsed.current = 0;
  }, [mode, springConstantNm, massKg, gravityMs2, initialAmplitudeM]);

  useFrame((_, dt) => {
    const clampedDt = Math.min(dt, 0.05);
    if (mode === "oscillation" && simStatus === "running") {
      elapsed.current += clampedDt;
      const disp = calculateOscillationDisplacement(
        A,
        angularFrequencyRadS,
        elapsed.current,
      );
      currentExt.current = Math.min(
        maxVisualExtension,
        Math.max(minExtVis, eqExtVisClamped + toVisual(disp)),
      );
    } else if (mode === "oscillation" && simStatus === "paused") {
      // tahan
    } else {
      const s = 1 - Math.exp(-clampedDt / TRANSITION_TAU);
      currentExt.current += (eqExtVisClamped - currentExt.current) * s;
    }

    const bottomY = naturalY - currentExt.current;
    if (tickRef.current) tickRef.current.position.y = bottomY;
    if (barRef.current) {
      const h = Math.max(0.0002, Math.abs(naturalY - bottomY));
      barRef.current.position.y = (naturalY + bottomY) / 2;
      barRef.current.scale.y = h;
    }
  });

  return (
    <group>
      {/* Tanda posisi alami (tetap) */}
      <mesh position={[x - 0.012, naturalY, 0.02]}>
        <boxGeometry args={[0.026, 0.0022, 0.004]} />
        <meshStandardMaterial color={SPRING_COLORS.ruler} roughness={0.7} />
      </mesh>
      {/* Tanda posisi bawah pegas (dinamis) */}
      <mesh ref={tickRef} position={[x - 0.012, naturalY, 0.02]}>
        <boxGeometry args={[0.026, 0.0022, 0.004]} />
        <meshStandardMaterial color={SPRING_COLORS.equilibrium} roughness={0.7} />
      </mesh>
      {/* Bar pertambahan panjang (dinamis, tinggi 1 lalu di-scale) */}
      <mesh ref={barRef} position={[x, naturalY, 0.02]}>
        <boxGeometry args={[0.0055, 1, 0.004]} />
        <meshStandardMaterial
          color={SPRING_COLORS.ruler}
          transparent
          opacity={0.75}
          roughness={0.7}
        />
      </mesh>
    </group>
  );
}

function EquilibriumMarker({ eqExtVisClamped }: { eqExtVisClamped: number }) {
  const y = SPRING_TOP_Y - SPRING_NATURAL_VIS - eqExtVisClamped;
  return (
    <Line
      points={[
        [-0.075, y, 0.015],
        [0.075, y, 0.015],
      ]}
      color={SPRING_COLORS.equilibrium}
      lineWidth={1}
      dashed
      dashSize={0.018}
      gapSize={0.014}
      transparent
      opacity={0.6}
    />
  );
}

/* --------------------------------- Scene root ------------------------------- */

function HookeApparatus(props: HookesLawSceneProps) {
  const k = sanitizeSpringConstant(props.springConstantNm);
  const m = sanitizeMass(props.massKg);
  const g = sanitizeGravity(props.gravityMs2);

  const hasil = useMemo(
    () =>
      calculateSpringResult({
        springConstantNm: k,
        massKg: m,
        gravityMs2: g,
        initialAmplitudeM: props.initialAmplitudeM,
        naturalLengthM: PANJANG_ALAMI_DEFAULT,
      }),
    [k, m, g, props.initialAmplitudeM],
  );

  const massH = massHeightFromKg(m);
  const massR = massRadiusFromKg(m);
  const maxVisualExtension = maxVisualExtensionForMass(massH);
  const eqExtVisReal = toVisual(hasil.equilibriumExtensionM);
  const eqExtVisClamped = Math.min(eqExtVisReal, maxVisualExtension);

  return (
    <group>
      <BaseAlas />
      <StandDanBalok />
      <FixedTopHook />
      <EquilibriumMarker eqExtVisClamped={eqExtVisClamped} />
      <SpringMeasurementGuide
        eqExtVisClamped={eqExtVisClamped}
        mode={props.mode}
        springConstantNm={k}
        massKg={m}
        gravityMs2={g}
        initialAmplitudeM={props.initialAmplitudeM}
        simStatus={props.simStatus}
        angularFrequencyRadS={hasil.angularFrequencyRadS}
        maxVisualExtension={maxVisualExtension}
      />
      <SpringSystem
        {...props}
        springConstantNm={k}
        massKg={m}
        gravityMs2={g}
        eqExtVisClamped={eqExtVisClamped}
        maxVisualExtension={maxVisualExtension}
        massH={massH}
        massR={massR}
        weightN={hasil.weightN}
        angularFrequencyRadS={hasil.angularFrequencyRadS}
        periodS={hasil.periodS}
      />
    </group>
  );
}

function computeBeyondRange(props: HookesLawSceneProps): boolean {
  const k = sanitizeSpringConstant(props.springConstantNm);
  const m = sanitizeMass(props.massKg);
  const g = sanitizeGravity(props.gravityMs2);
  const hasil = calculateSpringResult({
    springConstantNm: k,
    massKg: m,
    gravityMs2: g,
    initialAmplitudeM: props.initialAmplitudeM,
    naturalLengthM: PANJANG_ALAMI_DEFAULT,
  });
  const massH = massHeightFromKg(m);
  const maxVis = maxVisualExtensionForMass(massH);
  return toVisual(hasil.equilibriumExtensionM) > maxVis + 1e-6;
}

export function HookesLawScene(props: HookesLawSceneProps) {
  const beyondRange = useMemo(
    () => computeBeyondRange(props),
    [props],
  );

  return (
    <div className="relative h-full w-full">
      <Canvas
        shadows="soft"
        // Kamera & target TETAP — tidak pernah auto-fit terhadap objek dinamis.
        camera={{ position: [0.66, 0.5, 1.24], fov: 42, near: 0.1, far: 20 }}
        gl={{ antialias: true, alpha: true }}
        className="h-full w-full touch-none"
      >
        <color attach="background" args={["#eef2f7"]} />
        <hemisphereLight args={["#f8fafc", "#c3cddb", 0.55]} />
        <ambientLight intensity={0.3} />
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
        <directionalLight position={[-1.8, 1.6, -0.8]} intensity={0.3} />
        <directionalLight position={[0, 1.2, -2.4]} intensity={0.18} />

        <HookeApparatus {...props} />

        <OrbitControls
          enablePan={false}
          minDistance={0.8}
          maxDistance={2.4}
          maxPolarAngle={Math.PI / 2 + 0.1}
          target={[0, 0.3, 0]}
        />
      </Canvas>

      {beyondRange ? (
        <div className="pointer-events-none absolute inset-x-2 bottom-2 rounded-lg border border-amber-300/70 bg-amber-50/95 px-3 py-1.5 text-center text-[11px] leading-snug font-medium text-amber-800 shadow-sm">
          Pertambahan panjang melebihi kapasitas visual alat. Nilai fisika tetap
          ditampilkan pada kartu statistik.
        </div>
      ) : null}
    </div>
  );
}

export { SPRING_ANCHOR_Y };
