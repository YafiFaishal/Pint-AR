"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

type Vec3 = [number, number, number];

/* ── Tata letak rangkaian (meter, terpusat di origin) ── */
const BOARD_TOP = 0.1;
const WIRE_Y = 0.118;
const Z_DEPAN = 0.05;
const Z_BELAKANG = -0.24;
const X_BAT = -0.7;
const X_SAK = 0;
const X_LAM = 0.7;

/** Jalur kabel tertutup — dipakai untuk tube kabel & animasi arus. */
const JALUR_ARUS: Vec3[] = [
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

const MAT_KABEL = {
  color: "#b87333",
  metalness: 0.72,
  roughness: 0.28,
} as const;

function posisiDiJalur(jalur: Vec3[], t: number): THREE.Vector3 {
  const segmen = jalur.length - 1;
  let sisa = (t % 1) * segmen;
  for (let i = 0; i < segmen; i++) {
    if (sisa <= 1) {
      const a = jalur[i];
      const b = jalur[i + 1];
      return new THREE.Vector3(
        a[0] + (b[0] - a[0]) * sisa,
        a[1] + (b[1] - a[1]) * sisa,
        a[2] + (b[2] - a[2]) * sisa,
      );
    }
    sisa -= 1;
  }
  const akhir = jalur[jalur.length - 1];
  return new THREE.Vector3(akhir[0], akhir[1], akhir[2]);
}

function PapanDasar() {
  return (
    <group position={[0, BOARD_TOP / 2 - 0.01, -0.04]}>
      <RoundedBox
        args={[2.15, 0.1, 0.78]}
        radius={0.018}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#1e293b"
          metalness={0.15}
          roughness={0.45}
        />
      </RoundedBox>
      {/* Permukaan atas sedikit lebih terang */}
      <mesh position={[0, 0.051, 0]} receiveShadow>
        <boxGeometry args={[2.05, 0.006, 0.68]} />
        <meshStandardMaterial
          color="#334155"
          metalness={0.2}
          roughness={0.38}
        />
      </mesh>
      {/* Alur kabel (groove) */}
      <mesh position={[0, 0.054, Z_DEPAN]} receiveShadow>
        <boxGeometry args={[1.75, 0.008, 0.04]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.054, Z_BELAKANG]} receiveShadow>
        <boxGeometry args={[1.5, 0.008, 0.035]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>
      {/* Kaki karet */}
      {(
        [
          [-0.95, -0.06, 0.28],
          [0.95, -0.06, 0.28],
          [-0.95, -0.06, -0.36],
          [0.95, -0.06, -0.36],
        ] as Vec3[]
      ).map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <cylinderGeometry args={[0.03, 0.035, 0.02, 10]} />
          <meshStandardMaterial color="#0f172a" roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

function KabelRangkaian() {
  const geometri = useMemo(() => {
    const titik = JALUR_ARUS.map(([x, y, z]) => new THREE.Vector3(x, y, z));
    const kurva = new THREE.CatmullRomCurve3(titik, true, "centripetal", 0.35);
    return new THREE.TubeGeometry(kurva, 120, 0.021, 10, true);
  }, []);

  return (
    <mesh geometry={geometri} castShadow>
      <meshStandardMaterial {...MAT_KABEL} />
    </mesh>
  );
}

function Baterai() {
  return (
    <group position={[X_BAT, BOARD_TOP, Z_DEPAN]}>
      <RoundedBox
        args={[0.2, 0.28, 0.13]}
        radius={0.02}
        smoothness={3}
        position={[0, 0.14, 0]}
        castShadow
      >
        <meshStandardMaterial
          color="#1e293b"
          metalness={0.25}
          roughness={0.55}
        />
      </RoundedBox>
      {/* Label strip */}
      <mesh position={[0, 0.14, 0.066]} castShadow>
        <boxGeometry args={[0.14, 0.1, 0.004]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.6} />
      </mesh>
      {/* Terminal + */}
      <mesh position={[0.05, 0.3, 0.05]} castShadow>
        <cylinderGeometry args={[0.035, 0.038, 0.04, 12]} />
        <meshStandardMaterial
          color="#dc2626"
          metalness={0.6}
          roughness={0.25}
        />
      </mesh>
      <mesh position={[0.05, 0.33, 0.05]}>
        <sphereGeometry args={[0.022, 10, 10]} />
        <meshStandardMaterial
          color="#ef4444"
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>
      {/* Terminal − */}
      <mesh position={[-0.05, 0.3, 0.05]} castShadow>
        <cylinderGeometry args={[0.035, 0.038, 0.04, 12]} />
        <meshStandardMaterial
          color="#334155"
          metalness={0.55}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[-0.05, 0.33, 0.05]}>
        <sphereGeometry args={[0.02, 10, 10]} />
        <meshStandardMaterial
          color="#475569"
          metalness={0.65}
          roughness={0.25}
        />
      </mesh>
    </group>
  );
}

function Saklar({ menyala }: { menyala: boolean }) {
  const sudut = menyala ? Math.PI / 7 : -Math.PI / 5;
  return (
    <group position={[X_SAK, BOARD_TOP, Z_DEPAN]}>
      {/* Dudukan di board */}
      <mesh position={[0, 0.012, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.024, 0.14]} />
        <meshStandardMaterial color="#475569" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Housing */}
      <RoundedBox
        args={[0.16, 0.1, 0.12]}
        radius={0.012}
        smoothness={3}
        position={[0, 0.07, 0]}
        castShadow
      >
        <meshStandardMaterial color="#64748b" metalness={0.35} roughness={0.45} />
      </RoundedBox>
      {/* Pivot tuas */}
      <group position={[0, 0.1, 0.02]} rotation={[0, 0, sudut]}>
        <mesh position={[0, 0.06, 0]} castShadow>
          <boxGeometry args={[0.04, 0.13, 0.035]} />
          <meshStandardMaterial color="#f1f5f9" metalness={0.1} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.125, 0]} castShadow>
          <sphereGeometry args={[0.022, 10, 10]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.2} roughness={0.35} />
        </mesh>
      </group>
      {/* Kontak logam */}
      <mesh position={[-0.06, 0.05, -0.04]} castShadow>
        <boxGeometry args={[0.03, 0.02, 0.03]} />
        <meshStandardMaterial color="#ca8a04" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.06, 0.05, -0.04]} castShadow>
        <boxGeometry args={[0.03, 0.02, 0.03]} />
        <meshStandardMaterial color="#ca8a04" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

function Lampu({ menyala, terang }: { menyala: boolean; terang: number }) {
  const intensitas = menyala ? Math.min(2.2, terang * 2) : 0;
  const warnaBola = menyala ? "#fef08a" : "#cbd5e1";
  const warnaFilamen = menyala ? "#fde047" : "#64748b";

  return (
    <group position={[X_LAM, BOARD_TOP, Z_DEPAN]}>
      {/* Socket / dudukan */}
      <mesh position={[0, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.065, 0.04, 14]} />
        <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.048, 0.052, 0.03, 14]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.55} roughness={0.3} />
      </mesh>
      {/* Bulb glass */}
      <mesh position={[0, 0.14, 0]} castShadow>
        <sphereGeometry args={[0.095, 20, 20]} />
        <meshStandardMaterial
          color={warnaBola}
          emissive={warnaBola}
          emissiveIntensity={intensitas * 0.35}
          metalness={0.05}
          roughness={0.15}
          transparent
          opacity={0.92}
        />
      </mesh>
      {/* Filamen */}
      <mesh position={[0, 0.13, 0]}>
        <torusGeometry args={[0.028, 0.006, 8, 16]} />
        <meshStandardMaterial
          color={warnaFilamen}
          emissive={warnaFilamen}
          emissiveIntensity={intensitas}
          metalness={0.1}
          roughness={0.5}
        />
      </mesh>
      {menyala ? (
        <pointLight
          position={[0, 0.2, 0]}
          intensity={intensitas * 0.7}
          color="#fef08a"
          distance={1.1}
        />
      ) : null}
    </group>
  );
}

function TitikArus({
  indeks,
  jumlah,
  fase,
  aktif,
}: {
  indeks: number;
  jumlah: number;
  fase: React.MutableRefObject<number>;
  aktif: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    if (!aktif) {
      meshRef.current.visible = false;
      return;
    }
    meshRef.current.visible = true;
    const t = (fase.current + indeks / jumlah) % 1;
    meshRef.current.position.copy(posisiDiJalur(JALUR_ARUS, t));
  });

  return (
    <mesh ref={meshRef} visible={false}>
      <sphereGeometry args={[0.028, 8, 8]} />
      <meshStandardMaterial
        color="#fbbf24"
        emissive="#f59e0b"
        emissiveIntensity={1.4}
      />
    </mesh>
  );
}

function IndikatorArus({ aktif, arus }: { aktif: boolean; arus: number }) {
  const fase = useRef(0);
  const jumlahTitik = 7;

  useFrame((_, dt) => {
    if (!aktif) return;
    fase.current += dt * arus * 0.45;
  });

  if (!aktif) return null;

  return (
    <group>
      {Array.from({ length: jumlahTitik }, (_, i) => (
        <TitikArus
          key={i}
          indeks={i}
          jumlah={jumlahTitik}
          fase={fase}
          aktif={aktif}
        />
      ))}
    </group>
  );
}

function LabelTeks({
  position,
  children,
}: {
  position: Vec3;
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

export function RangkaianScene({
  saklarMenyala,
  tegangan,
  hambatan,
  arus,
  rangkaianTerbuka,
  tampilkanLabel = false,
}: {
  saklarMenyala: boolean;
  tegangan: number;
  hambatan: number;
  arus: number;
  rangkaianTerbuka: boolean;
  tampilkanLabel?: boolean;
}) {
  const terangLampu = arus / (12 / 1);

  return (
    <Canvas
      shadows
      camera={{ position: [0.15, 1.45, 2.65], fov: 40 }}
      className="h-full w-full touch-none"
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={["#f1f5f9"]} />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[2.5, 5, 3]}
        intensity={1.05}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-2, 3, -1]} intensity={0.25} />
      <OrbitControls
        enablePan={false}
        minDistance={1.7}
        maxDistance={4.5}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 0.14, 0]}
      />

      <PapanDasar />
      <KabelRangkaian />
      <Baterai />
      <Saklar menyala={saklarMenyala} />
      <Lampu menyala={saklarMenyala} terang={terangLampu} />
      <IndikatorArus aktif={saklarMenyala} arus={arus} />

      {tampilkanLabel ? (
        <>
          <LabelTeks position={[-1.05, 0.72, 0]}>
            V = {tegangan} V
          </LabelTeks>
          <LabelTeks position={[0, 0.72, 0]}>
            R = {hambatan} Ω
          </LabelTeks>
          <LabelTeks position={[1.05, 0.72, 0]}>
            I = {arus.toFixed(2)} A
            {rangkaianTerbuka ? " (terbuka)" : ""}
          </LabelTeks>
        </>
      ) : null}
    </Canvas>
  );
}
