"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { Group } from "three";
import {
  type HasilReaksi,
  type JenisReaksi,
  warnaLarutanAwal,
} from "@/lib/reaksi-kimia-utils";

const SEG = 24;

function buatMaterialKaca() {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#f8fafc"),
    metalness: 0,
    roughness: 0.06,
    transmission: 0.88,
    transparent: true,
    opacity: 1,
    thickness: 0.012,
    ior: 1.48,
    envMapIntensity: 0.6,
    side: THREE.FrontSide,
  });
}

function Cairan({
  radiusAtas,
  radiusBawah,
  tinggi,
  warna,
  y,
  emissive = "#000000",
  emissiveIntensity = 0,
}: {
  radiusAtas: number;
  radiusBawah: number;
  tinggi: number;
  warna: string;
  y: number;
  emissive?: string;
  emissiveIntensity?: number;
}) {
  if (tinggi < 0.012) return null;

  const yCenter = y + tinggi / 2;

  return (
    <group>
      <mesh position={[0, yCenter, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radiusAtas, radiusBawah, tinggi, SEG]} />
        <meshStandardMaterial
          color={warna}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          roughness={0.32}
          metalness={0.04}
        />
      </mesh>
      {/* Permukaan cairan rata */}
      <mesh position={[0, y + tinggi + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radiusAtas * 0.96, SEG]} />
        <meshStandardMaterial
          color={warna}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity * 0.6}
          roughness={0.22}
          metalness={0.02}
        />
      </mesh>
    </group>
  );
}

/** Bibir kaca rata di bukaan atas tabung/beaker. */
function BibirAtas({ radius, y }: { radius: number; y: number }) {
  return (
    <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius * 0.96, radius * 1.045, SEG]} />
      <meshStandardMaterial color="#cbd5e1" metalness={0.18} roughness={0.16} />
    </mesh>
  );
}

/** Dinding kaca tabung — shell tipis, bibir rata di atas. */
function SelubungKaca({
  radiusAtas,
  radiusBawah,
  tinggi,
  y,
  tutupBawah = false,
}: {
  radiusAtas: number;
  radiusBawah: number;
  tinggi: number;
  y: number;
  tutupBawah?: boolean;
}) {
  const matKaca = useMemo(() => buatMaterialKaca(), []);

  return (
    <group position={[0, y + tinggi / 2, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[radiusAtas, radiusBawah, tinggi, SEG, 1, true]} />
        <primitive object={matKaca} attach="material" />
      </mesh>

      <BibirAtas radius={radiusAtas} y={tinggi / 2 + 0.002} />

      {tutupBawah ? (
        <mesh position={[0, -tinggi / 2 + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[radiusBawah * 0.92, SEG]} />
          <primitive object={matKaca} attach="material" />
        </mesh>
      ) : null}
    </group>
  );
}

function DudukanTabung({ posisi }: { posisi: [number, number, number] }) {
  return (
    <group position={posisi}>
      <mesh position={[0, 0.006, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.048, 0.052, 0.012, SEG]} />
        <meshStandardMaterial color="#475569" metalness={0.35} roughness={0.42} />
      </mesh>
      <mesh position={[0, 0.024, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.054, 0.062, SEG]} />
        <meshStandardMaterial color="#64748b" metalness={0.4} roughness={0.38} />
      </mesh>
    </group>
  );
}

function TabungReaksi({
  posisi,
  warnaCairan,
  tinggiIsi,
  maxIsi = 0.5,
}: {
  posisi: [number, number, number];
  warnaCairan: string;
  tinggiIsi: number;
  maxIsi?: number;
}) {
  const tinggi = 0.68;
  const radius = 0.062;
  const isi = Math.max(0, Math.min(maxIsi, tinggiIsi));
  const yDasar = 0.028;
  const radiusCairan = radius * 0.78;

  return (
    <group position={posisi}>
      <DudukanTabung posisi={[0, 0, 0]} />

      {/* Dasar tabung bulat — disk horizontal, bukan torus miring */}
      <mesh position={[0, yDasar + 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius * 0.9, SEG]} />
        <meshPhysicalMaterial
          color="#f8fafc"
          transmission={0.82}
          transparent
          roughness={0.08}
          thickness={0.008}
          ior={1.48}
          side={THREE.DoubleSide}
        />
      </mesh>

      <SelubungKaca
        radiusAtas={radius}
        radiusBawah={radius * 0.94}
        tinggi={tinggi}
        y={yDasar}
      />

      <Cairan
        radiusAtas={radiusCairan}
        radiusBawah={radiusCairan * 0.92}
        tinggi={Math.max(0, isi * tinggi * 0.88)}
        warna={warnaCairan}
        y={yDasar + 0.018}
      />
    </group>
  );
}

function GelasHasil({
  warnaCairan,
  tinggiIsi,
  glowHangat,
}: {
  warnaCairan: string;
  tinggiIsi: number;
  glowHangat: boolean;
}) {
  const tinggi = 0.72;
  const radiusAtas = 0.145;
  const radiusBawah = 0.108;
  const yDasar = 0.024;
  const isi = Math.max(0, Math.min(0.55, tinggiIsi));
  const emissive = glowHangat ? "#f97316" : "#000000";
  const emissiveInt = glowHangat ? 0.15 : 0;
  const radiusCairanAtas = radiusAtas * 0.82;
  const radiusCairanBawah = radiusBawah * 0.88;
  const tinggiCairan = isi * tinggi * 0.82;

  return (
    <group>
      {/* Alas beaker */}
      <mesh position={[0, 0.008, 0]} receiveShadow>
        <cylinderGeometry args={[radiusBawah * 1.05, radiusBawah * 1.08, 0.016, SEG]} />
        <meshStandardMaterial color="#64748b" metalness={0.2} roughness={0.48} />
      </mesh>

      <SelubungKaca
        radiusAtas={radiusAtas}
        radiusBawah={radiusBawah}
        tinggi={tinggi}
        y={yDasar}
        tutupBawah
      />

      <Cairan
        radiusAtas={radiusCairanAtas}
        radiusBawah={radiusCairanBawah}
        tinggi={tinggiCairan}
        warna={warnaCairan}
        y={yDasar + 0.012}
        emissive={emissive}
        emissiveIntensity={emissiveInt}
      />

      {glowHangat && tinggiCairan > 0.06 ? (
        <mesh position={[0, yDasar + tinggiCairan * 0.55, 0]}>
          <sphereGeometry args={[0.12, 10, 10]} />
          <meshStandardMaterial
            color="#fb923c"
            transparent
            opacity={0.08}
            emissive="#f97316"
            emissiveIntensity={0.3}
            depthWrite={false}
          />
        </mesh>
      ) : null}
    </group>
  );
}

function Termometer({ suhu, posisi }: { suhu: number; posisi: [number, number, number] }) {
  const fraksi = Math.min(1, Math.max(0.08, (suhu - 20) / 35));
  const tinggi = 0.34;
  const warnaMerah = suhu > 32 ? "#ef4444" : suhu > 28 ? "#f97316" : "#3b82f6";

  return (
    <group position={posisi}>
      <mesh position={[0, 0.016, 0]}>
        <sphereGeometry args={[0.018, 10, 10]} />
        <meshStandardMaterial color={warnaMerah} roughness={0.35} />
      </mesh>
      <mesh position={[0, tinggi / 2 + 0.028, 0]}>
        <cylinderGeometry args={[0.007, 0.007, tinggi, 10]} />
        <meshPhysicalMaterial
          color="#f1f5f9"
          transmission={0.6}
          transparent
          roughness={0.15}
          thickness={0.004}
        />
      </mesh>
      <mesh position={[0, 0.028 + (tinggi * fraksi) / 2, 0.001]}>
        <cylinderGeometry args={[0.0035, 0.0035, tinggi * fraksi, 8]} />
        <meshStandardMaterial
          color={warnaMerah}
          emissive={suhu > 32 ? warnaMerah : "#000000"}
          emissiveIntensity={suhu > 32 ? 0.2 : 0}
        />
      </mesh>
    </group>
  );
}

function StripPh({ ph, posisi }: { ph: number; posisi: [number, number, number] }) {
  const warna =
    ph < 4
      ? "#ef4444"
      : ph < 6
        ? "#f97316"
        : ph < 8
          ? "#22c55e"
          : ph < 10
            ? "#3b82f6"
            : "#8b5cf6";

  return (
    <group position={posisi}>
      <mesh>
        <boxGeometry args={[0.026, 0.09, 0.01]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.45} />
      </mesh>
      <mesh position={[0, 0, 0.006]}>
        <boxGeometry args={[0.016, 0.065, 0.005]} />
        <meshStandardMaterial
          color={warna}
          roughness={0.35}
          emissive={warna}
          emissiveIntensity={0.06}
        />
      </mesh>
    </group>
  );
}

function Gelembung({ aktif, posisi }: { aktif: boolean; posisi: [number, number, number] }) {
  const ref = useRef<Group>(null);
  const waktu = useRef(0);

  const gelembung = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        x: Math.sin(i * 2.1) * 0.04,
        z: Math.cos(i * 1.8) * 0.035,
        speed: 0.2 + (i % 2) * 0.05,
        fase: i * 0.55,
      })),
    [],
  );

  useFrame((_, dt) => {
    if (!ref.current || !aktif) return;
    waktu.current += dt;
    ref.current.children.forEach((child, i) => {
      const g = gelembung[i];
      const t = (waktu.current * g.speed + g.fase) % 1;
      child.position.y = 0.14 + t * 0.26;
      child.position.x = g.x;
      child.position.z = g.z;
      child.scale.setScalar(0.55 + (1 - t) * 0.45);
    });
  });

  if (!aktif) return null;

  return (
    <group ref={ref} position={posisi}>
      {gelembung.map((g, i) => (
        <mesh key={i} position={[g.x, 0.14, g.z]}>
          <sphereGeometry args={[0.011, 6, 6]} />
          <meshStandardMaterial color="#e0f2fe" transparent opacity={0.5} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function UapRingan({ aktif, posisi }: { aktif: boolean; posisi: [number, number, number] }) {
  const ref = useRef<Group>(null);

  useFrame(() => {
    if (!ref.current || !aktif) return;
    ref.current.children.forEach((child, i) => {
      child.position.y =
        0.52 + Math.sin(Date.now() * 0.0018 + i * 1.2) * 0.022 + i * 0.018;
    });
  });

  if (!aktif) return null;

  return (
    <group ref={ref} position={posisi}>
      {[0, 1].map((i) => (
        <mesh key={i} position={[(i - 0.5) * 0.035, 0.52, 0]}>
          <sphereGeometry args={[0.028, 6, 6]} />
          <meshStandardMaterial color="#fef9c3" transparent opacity={0.18} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function WadahHasil({
  hasil,
  tinggiIsi,
  jenis,
  sudahCampur,
  warnaTampil,
}: {
  hasil: HasilReaksi;
  tinggiIsi: number;
  jenis: JenisReaksi;
  sudahCampur: boolean;
  warnaTampil: string;
}) {
  const glowHangat = jenis === "eksoterm" && sudahCampur && tinggiIsi > 0.08;
  const tampilIndikator = sudahCampur && tinggiIsi > 0.06;

  return (
    <group position={[0, 0, 0]}>
      <GelasHasil
        warnaCairan={warnaTampil}
        tinggiIsi={tinggiIsi}
        glowHangat={glowHangat}
      />
      {tampilIndikator ? (
        <>
          <Termometer suhu={hasil.suhu} posisi={[-0.24, 0.02, 0.14]} />
          <StripPh ph={hasil.ph} posisi={[0.22, 0.16, 0.12]} />
        </>
      ) : null}
    </group>
  );
}

function SimulasiReaksi({
  volumeA,
  volumeB,
  jenis,
  campurSignal,
  resetSignal,
  hasilTarget,
  sudahCampur,
}: {
  volumeA: number;
  volumeB: number;
  jenis: JenisReaksi;
  campurSignal: number;
  resetSignal: number;
  hasilTarget: HasilReaksi;
  sudahCampur: boolean;
}) {
  const [animIsiA, setAnimIsiA] = useState(volumeA / 100);
  const [animIsiB, setAnimIsiB] = useState(volumeB / 100);
  const [animIsiHasil, setAnimIsiHasil] = useState(0);
  const [warnaHasil, setWarnaHasil] = useState("#e2e8f0");
  const [gelembung, setGelembung] = useState(false);
  const [uap, setUap] = useState(false);
  const lastCampur = useRef(0);
  const lastReset = useRef(0);
  const warnaAwal = warnaLarutanAwal(jenis);

  useEffect(() => {
    if (campurSignal > lastCampur.current) {
      lastCampur.current = campurSignal;
      setGelembung(true);
      setUap(jenis === "eksoterm");
      const t = setTimeout(() => setGelembung(false), 2200);
      return () => clearTimeout(t);
    }
  }, [campurSignal, jenis]);

  useEffect(() => {
    if (resetSignal > lastReset.current) {
      lastReset.current = resetSignal;
      setAnimIsiHasil(0);
      setWarnaHasil("#e2e8f0");
      setGelembung(false);
      setUap(false);
    }
  }, [resetSignal]);

  useEffect(() => {
    if (!sudahCampur) return;
    const targetA = 0.04;
    const targetB = 0.04;
    const targetHasil = (volumeA + volumeB) / 180;
    let frame = 0;
    const id = setInterval(() => {
      frame++;
      const t = Math.min(frame / 40, 1);
      setAnimIsiA(targetA + (volumeA / 100 - targetA) * (1 - t));
      setAnimIsiB(targetB + (volumeB / 100 - targetB) * (1 - t));
      setAnimIsiHasil(targetHasil * t);
      setWarnaHasil(
        new THREE.Color(warnaAwal.warnaA)
          .lerp(new THREE.Color(hasilTarget.warna), t)
          .getStyle(),
      );
      if (t >= 1) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [sudahCampur, campurSignal, volumeA, volumeB, hasilTarget.warna, warnaAwal.warnaA]);

  const warnaHasilTampil = sudahCampur ? warnaHasil : "#e2e8f0";
  const tinggiIsiA = sudahCampur ? animIsiA : volumeA / 100;
  const tinggiIsiB = sudahCampur ? animIsiB : volumeB / 100;

  return (
    <>
      <TabungReaksi
        posisi={[-0.46, 0.018, 0.1]}
        warnaCairan={warnaAwal.warnaA}
        tinggiIsi={tinggiIsiA * 0.5}
      />
      <TabungReaksi
        posisi={[0.46, 0.018, 0.1]}
        warnaCairan={warnaAwal.warnaB}
        tinggiIsi={tinggiIsiB * 0.5}
      />
      <WadahHasil
        hasil={hasilTarget}
        tinggiIsi={animIsiHasil}
        jenis={jenis}
        sudahCampur={sudahCampur}
        warnaTampil={warnaHasilTampil}
      />
      <Gelembung aktif={gelembung} posisi={[0, 0.12, 0.02]} />
      <UapRingan aktif={uap && sudahCampur} posisi={[0, 0, 0]} />
    </>
  );
}

function TrayLab() {
  return (
    <group>
      {/* Tray utama */}
      <mesh position={[0, 0.01, 0]} receiveShadow castShadow>
        <boxGeometry args={[1.85, 0.018, 0.82]} />
        <meshStandardMaterial color="#475569" roughness={0.55} metalness={0.08} />
      </mesh>
      {/* Permukaan kerja */}
      <mesh position={[0, 0.022, 0]} receiveShadow>
        <boxGeometry args={[1.72, 0.003, 0.72]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.38} />
      </mesh>
      {/* Tepi tray */}
      <mesh position={[0, 0.028, 0.36]}>
        <boxGeometry args={[1.72, 0.006, 0.006]} />
        <meshStandardMaterial color="#64748b" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.028, -0.36]}>
        <boxGeometry args={[1.72, 0.006, 0.006]} />
        <meshStandardMaterial color="#64748b" roughness={0.5} />
      </mesh>
      <mesh position={[0.86, 0.028, 0]}>
        <boxGeometry args={[0.006, 0.006, 0.72]} />
        <meshStandardMaterial color="#64748b" roughness={0.5} />
      </mesh>
      <mesh position={[-0.86, 0.028, 0]}>
        <boxGeometry args={[0.006, 0.006, 0.72]} />
        <meshStandardMaterial color="#64748b" roughness={0.5} />
      </mesh>
    </group>
  );
}

export function ReaksiKimiaScene({
  volumeA,
  volumeB,
  jenis,
  campurSignal,
  resetSignal,
  hasilTarget,
  sudahCampur,
}: {
  volumeA: number;
  volumeB: number;
  jenis: JenisReaksi;
  campurSignal: number;
  resetSignal: number;
  hasilTarget: HasilReaksi;
  sudahCampur: boolean;
}) {
  return (
    <div className="relative h-full w-full">
      <Canvas
        shadows
        camera={{ position: [0.05, 0.88, 2.15], fov: 34 }}
        className="h-full w-full touch-none"
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#f1f5f9"]} />
        <ambientLight intensity={0.62} />
        <directionalLight
          position={[2.2, 3.8, 2.8]}
          intensity={0.95}
          castShadow
          shadow-mapSize-width={512}
          shadow-mapSize-height={512}
        />
        <directionalLight position={[-1.8, 2.2, -1.2]} intensity={0.22} />
        <hemisphereLight args={["#e0f2fe", "#64748b", 0.35]} />

        <OrbitControls
          enablePan={false}
          minDistance={1.65}
          maxDistance={3.5}
          minPolarAngle={Math.PI / 5.5}
          maxPolarAngle={Math.PI / 2.12}
          target={[0, 0.28, 0.04]}
        />

        <TrayLab />
        <SimulasiReaksi
          volumeA={volumeA}
          volumeB={volumeB}
          jenis={jenis}
          campurSignal={campurSignal}
          resetSignal={resetSignal}
          hasilTarget={hasilTarget}
          sudahCampur={sudahCampur}
        />

        <ContactShadows
          position={[0, 0.024, 0]}
          opacity={0.28}
          scale={2.2}
          blur={2.4}
          far={1.2}
          color="#334155"
        />
      </Canvas>
    </div>
  );
}
