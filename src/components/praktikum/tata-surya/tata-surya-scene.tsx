"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Line, OrbitControls } from "@react-three/drei";
import type { Group } from "three";
import {
  hitungPeriodeRelatif,
  PLANET_IDS,
  PLANET_INFO,
  type PlanetId,
} from "@/lib/kepler-utils";

type Vec3 = [number, number, number];

const JARAK_ORBIT_BULAN = 0.14;
const UKURAN_BULAN = 0.016;
/** Periode orbit Bulan (detik) — independen dari Kepler, lebih cepat dari Bumi */
const PERIODE_ORBIT_BULAN = 1.6;

function Starfield() {
  const posisi = useMemo(() => {
    const n = 96;
    const buf = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 14 + Math.random() * 10;
      buf[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      buf[i * 3 + 1] = r * Math.cos(phi) * 0.35 + 1.5;
      buf[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return buf;
  }, []);

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[posisi, 3]}
          count={posisi.length / 3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#e2e8f0"
        transparent
        opacity={0.45}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function GarisOrbit({
  radius,
  terpilih,
}: {
  radius: number;
  terpilih: boolean;
}) {
  const titik = useMemo(() => {
    const segmen = 64;
    const pts: Vec3[] = [];
    for (let i = 0; i <= segmen; i++) {
      const t = (i / segmen) * Math.PI * 2;
      pts.push([Math.cos(t) * radius, 0, Math.sin(t) * radius]);
    }
    return pts;
  }, [radius]);

  return (
    <Line
      points={titik}
      color={terpilih ? "#7dd3fc" : "#475569"}
      transparent
      opacity={terpilih ? 0.55 : 0.22}
      lineWidth={terpilih ? 1 : 0.5}
    />
  );
}

function LabelPlanet({
  label,
  terpilih,
  offset,
}: {
  label: string;
  terpilih: boolean;
  offset: number;
}) {
  return (
    <Html position={[0, offset, 0]} center distanceFactor={5.5} zIndexRange={[0, 0]}>
      <div
        className={
          terpilih
            ? "whitespace-nowrap rounded border border-sky-400/50 bg-slate-900/90 px-1.5 py-0.5 text-[10px] font-semibold text-sky-100 shadow-sm"
            : "whitespace-nowrap rounded border border-transparent bg-slate-900/55 px-1 py-0.5 text-[9px] font-normal text-slate-300/90"
        }
      >
        {label}
      </div>
    </Html>
  );
}

function PlanetMesh({ id, terpilih }: { id: PlanetId; terpilih: boolean }) {
  const info = PLANET_INFO[id];
  const emisif = terpilih ? 0.18 : 0;

  if (id === "bumi") {
    return (
      <group>
        <mesh castShadow>
          <sphereGeometry args={[info.ukuran, 16, 16]} />
          <meshStandardMaterial
            color="#2563eb"
            emissive="#1d4ed8"
            emissiveIntensity={emisif}
            metalness={0.05}
            roughness={0.6}
          />
        </mesh>
        <mesh position={[info.ukuran * 0.35, info.ukuran * 0.2, info.ukuran * 0.55]}>
          <sphereGeometry args={[info.ukuran * 0.42, 8, 8]} />
          <meshStandardMaterial color="#22c55e" roughness={0.75} />
        </mesh>
        <mesh position={[-info.ukuran * 0.4, info.ukuran * 0.35, info.ukuran * 0.2]}>
          <sphereGeometry args={[info.ukuran * 0.22, 6, 6]} />
          <meshStandardMaterial
            color="#f8fafc"
            transparent
            opacity={0.55}
            roughness={0.9}
          />
        </mesh>
      </group>
    );
  }

  if (id === "jupiter") {
    return (
      <group>
        <mesh castShadow>
          <sphereGeometry args={[info.ukuran, 16, 16]} />
          <meshStandardMaterial
            color="#c98b3d"
            emissive="#a16207"
            emissiveIntensity={emisif}
            metalness={0.05}
            roughness={0.65}
          />
        </mesh>
        <mesh rotation={[0.35, 0.6, 0.15]}>
          <torusGeometry args={[info.ukuran * 1.02, info.ukuran * 0.06, 6, 24]} />
          <meshStandardMaterial color="#92400e" roughness={0.8} />
        </mesh>
      </group>
    );
  }

  return (
    <mesh castShadow>
      <sphereGeometry args={[info.ukuran, 16, 16]} />
      <meshStandardMaterial
        color={info.warna}
        emissive={terpilih ? info.warna : "#000000"}
        emissiveIntensity={emisif}
        metalness={0.08}
        roughness={0.58}
      />
    </mesh>
  );
}

function BulanMengorbit({
  kecepatan,
  terlihat,
}: {
  kecepatan: number;
  terlihat: boolean;
}) {
  const grupRef = useRef<Group>(null);
  const sudut = useRef(0.8);

  const titikOrbit = useMemo(() => {
    const segmen = 32;
    const pts: Vec3[] = [];
    for (let i = 0; i <= segmen; i++) {
      const t = (i / segmen) * Math.PI * 2;
      pts.push([
        Math.cos(t) * JARAK_ORBIT_BULAN,
        0,
        Math.sin(t) * JARAK_ORBIT_BULAN,
      ]);
    }
    return pts;
  }, []);

  useFrame((_, dt) => {
    if (!grupRef.current) return;
    const omega = ((2 * Math.PI) / PERIODE_ORBIT_BULAN) * kecepatan;
    sudut.current += omega * dt;
    grupRef.current.position.x =
      Math.cos(sudut.current) * JARAK_ORBIT_BULAN;
    grupRef.current.position.z =
      Math.sin(sudut.current) * JARAK_ORBIT_BULAN;
  });

  return (
    <group visible={terlihat}>
      <Line
        points={titikOrbit}
        color="#94a3b8"
        transparent
        opacity={0.18}
        lineWidth={0.5}
      />
      <group ref={grupRef}>
        <mesh>
          <sphereGeometry args={[UKURAN_BULAN, 10, 10]} />
          <meshStandardMaterial
            color="#d1d5db"
            emissive="#e5e7eb"
            emissiveIntensity={0.12}
            roughness={0.85}
            metalness={0.02}
          />
        </mesh>
        <Html
          position={[0, UKURAN_BULAN + 0.06, 0]}
          center
          distanceFactor={6}
          zIndexRange={[0, 0]}
        >
          <div className="whitespace-nowrap rounded bg-slate-900/70 px-1 py-0.5 text-[8px] text-slate-300">
            Bulan
          </div>
        </Html>
      </group>
    </group>
  );
}

function PlanetMengorbit({
  id,
  radius,
  kecepatan,
  terpilih,
  bumiAktif,
  faseAwal,
}: {
  id: PlanetId;
  radius: number;
  kecepatan: number;
  terpilih: boolean;
  bumiAktif: boolean;
  faseAwal: number;
}) {
  const grupRef = useRef<Group>(null);
  const sudut = useRef(faseAwal);
  const info = PLANET_INFO[id];
  const periode = hitungPeriodeRelatif(radius);

  useFrame((_, dt) => {
    if (!grupRef.current) return;
    const omega = ((2 * Math.PI) / periode) * kecepatan;
    sudut.current += omega * dt;
    grupRef.current.position.x = Math.cos(sudut.current) * radius;
    grupRef.current.position.z = Math.sin(sudut.current) * radius;
  });

  return (
    <group ref={grupRef}>
      <PlanetMesh id={id} terpilih={terpilih} />
      <LabelPlanet
        label={info.label}
        terpilih={terpilih}
        offset={info.ukuran + 0.12}
      />
      {id === "bumi" ? (
        <BulanMengorbit kecepatan={kecepatan} terlihat={bumiAktif} />
      ) : null}
    </group>
  );
}

function Matahari() {
  return (
    <group>
      <mesh castShadow>
        <sphereGeometry args={[0.22, 20, 20]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#f97316"
          emissiveIntensity={0.55}
          roughness={0.4}
        />
      </mesh>
      <pointLight intensity={1.1} distance={12} color="#fde68a" />
      <mesh>
        <sphereGeometry args={[0.27, 14, 14]} />
        <meshBasicMaterial color="#fcd34d" transparent opacity={0.1} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.31, 12, 12]} />
        <meshBasicMaterial color="#fef3c7" transparent opacity={0.05} />
      </mesh>
    </group>
  );
}

export function TataSuryaScene({
  jarakOrbit,
  planetTerpilih,
  kecepatan,
}: {
  jarakOrbit: Record<PlanetId, number>;
  planetTerpilih: PlanetId;
  kecepatan: number;
}) {
  const faseAwal: Record<PlanetId, number> = {
    merkurius: 0.2,
    bumi: 1.4,
    mars: 2.8,
    jupiter: 4.5,
  };

  const bumiAktif = planetTerpilih === "bumi";

  return (
    <Canvas
      shadows
      camera={{ position: [0, 3.8, 4.2], fov: 42 }}
      className="h-full w-full touch-none"
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={["#0b1220"]} />
      <Starfield />
      <ambientLight intensity={0.32} />
      <directionalLight
        position={[2, 5, 3]}
        intensity={0.4}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />

      <OrbitControls
        enablePan={false}
        minDistance={2.5}
        maxDistance={9}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, 0, 0]}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[3.6, 48]} />
        <meshStandardMaterial color="#1a2332" roughness={0.92} />
      </mesh>

      <Matahari />

      {PLANET_IDS.map((id) => (
        <GarisOrbit
          key={`orbit-${id}`}
          radius={jarakOrbit[id]}
          terpilih={id === planetTerpilih}
        />
      ))}

      {PLANET_IDS.map((id) => (
        <PlanetMengorbit
          key={id}
          id={id}
          radius={jarakOrbit[id]}
          kecepatan={kecepatan}
          terpilih={id === planetTerpilih}
          bumiAktif={bumiAktif}
          faseAwal={faseAwal[id]}
        />
      ))}
    </Canvas>
  );
}
