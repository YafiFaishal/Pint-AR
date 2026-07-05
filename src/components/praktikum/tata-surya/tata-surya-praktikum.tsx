"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  ModelViewer,
  type ArStatus,
  type ModelViewerHandle,
} from "@/components/model-viewer";
import type { LangkahPraktikum, Modul } from "@/db/schema";
import { cn } from "@/lib/utils";
import {
  hitungPeriodeRelatif,
  JARAK_ORBIT_MAX,
  JARAK_ORBIT_MIN,
  jarakOrbitAwal,
  PLANET_IDS,
  PLANET_INFO,
  type PlanetId,
} from "@/lib/kepler-utils";
import {
  checkTataSuryaArAssetsAvailable,
  getTataSuryaArButtonState,
  getTataSuryaArModelUrls,
  shouldMountTataSuryaArViewer,
  type TataSuryaArAssetStatus,
} from "@/lib/tata-surya-assets";
import { PracticumShell } from "@/components/praktikum/practicum-shell";
import { PanduanLangkah } from "@/components/praktikum/panduan-langkah";
import { LksPanel } from "@/components/praktikum/lks-panel";
import { TataSuryaScene } from "./tata-surya-scene";

type TataSuryaPraktikumProps = {
  modul: Modul;
  langkah: LangkahPraktikum[];
  arSupported: boolean | null;
  onArAvailability: (supported: boolean) => void;
  onArStatus: (status: ArStatus) => void;
};

function TataSuryaQuickInfo({
  planetLabel,
  jarak,
  periode,
}: {
  planetLabel: string;
  jarak: number;
  periode: number;
}) {
  const items = [
    { label: "Planet", value: planetLabel },
    { label: "r", value: jarak.toFixed(2) },
    { label: "T", value: periode.toFixed(2) },
  ] as const;

  return (
    <div className="grid grid-cols-3 gap-1.5 lg:gap-2">
      {items.map(({ label, value }) => (
        <div
          key={label}
          className="rounded-md border bg-background px-2 py-1.5 text-center shadow-sm lg:bg-background/90 lg:backdrop-blur-sm"
        >
          <p className="text-[9px] font-medium text-muted-foreground lg:text-[10px]">
            {label}
          </p>
          <p className="truncate text-xs font-semibold tabular-nums">{value}</p>
        </div>
      ))}
    </div>
  );
}

export function TataSuryaPraktikum({
  modul,
  langkah,
  arSupported,
  onArAvailability,
  onArStatus,
}: TataSuryaPraktikumProps) {
  const modelViewerRef = useRef<ModelViewerHandle>(null);
  const [planetTerpilih, setPlanetTerpilih] = useState<PlanetId>("bumi");
  const [jarakOrbit, setJarakOrbit] = useState(jarakOrbitAwal);
  const [kecepatan, setKecepatan] = useState(1);
  const [arAktif, setArAktif] = useState(false);
  const [arAssets, setArAssets] = useState<TataSuryaArAssetStatus | null>(null);

  const arUrls = getTataSuryaArModelUrls();
  const jarakAktif = jarakOrbit[planetTerpilih];
  const periode = hitungPeriodeRelatif(jarakAktif);

  const arTombol = useMemo(
    () => getTataSuryaArButtonState(arAssets),
    [arAssets],
  );
  const arViewerSiap = shouldMountTataSuryaArViewer(arAssets);
  const arTombolAktif = arTombol.aktif && arSupported !== false;

  useEffect(() => {
    let aktif = true;
    checkTataSuryaArAssetsAvailable().then((status) => {
      if (aktif) setArAssets(status);
    });
    return () => {
      aktif = false;
    };
  }, []);

  const handlePilihPlanet = useCallback((id: PlanetId) => {
    setPlanetTerpilih(id);
  }, []);

  const handleJarakOrbit = useCallback(
    (nilai: number) => {
      setJarakOrbit((prev) => ({ ...prev, [planetTerpilih]: nilai }));
    },
    [planetTerpilih],
  );

  const handleArStatus = useCallback(
    (status: ArStatus) => {
      onArStatus(status);
      if (status === "session-started" || status === "object-placed") {
        setArAktif(true);
      } else if (status === "not-presenting" || status === "failed") {
        setArAktif(false);
      }
    },
    [onArStatus],
  );

  const handleLihatDiMeja = useCallback(() => {
    if (arTombol.toastSaatTekan) {
      toast.info(arTombol.toastSaatTekan);
      return;
    }
    if (!arTombolAktif) return;
    modelViewerRef.current?.activateAR();
  }, [arTombol, arTombolAktif]);

  const badge = arAktif ? (
    <Badge>Mode AR aktif</Badge>
  ) : (
    <Badge>Praktikum Interaktif</Badge>
  );

  const scene = (
    <>
      <TataSuryaScene
        jarakOrbit={jarakOrbit}
        planetTerpilih={planetTerpilih}
        kecepatan={kecepatan}
      />
      {arViewerSiap ? (
        <div className="sr-only" aria-hidden>
          <ModelViewer
            ref={modelViewerRef}
            src={arUrls.glb}
            iosSrc={arAssets?.usdz ? arUrls.usdz : undefined}
            alt={`Model AR: ${modul.judul}`}
            autoRotate={false}
            autoplay
            onArAvailability={onArAvailability}
            onArStatus={handleArStatus}
          />
        </div>
      ) : null}
    </>
  );

  const controls = (
    <div className="space-y-2 lg:space-y-3">
      <div className="space-y-1">
        <span className="text-xs font-medium">Pilih Planet</span>
        <div className="grid grid-cols-2 gap-1.5 min-[420px]:grid-cols-4">
          {PLANET_IDS.map((id) => (
            <Button
              key={id}
              className="min-h-9 text-[11px] lg:text-xs"
              variant={planetTerpilih === id ? "default" : "outline"}
              onClick={() => handlePilihPlanet(id)}
            >
              {PLANET_INFO[id].label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 lg:gap-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Kecepatan Simulasi</span>
            <span className="text-muted-foreground tabular-nums">
              {kecepatan.toFixed(1)}×
            </span>
          </div>
          <Slider
            min={0.25}
            max={3}
            step={0.25}
            value={[kecepatan]}
            onValueChange={(v) =>
              setKecepatan(Array.isArray(v) ? v[0] : v)
            }
          />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Jarak Orbit (r)</span>
            <span className="text-muted-foreground tabular-nums">
              {jarakAktif.toFixed(2)}
            </span>
          </div>
          <Slider
            min={JARAK_ORBIT_MIN}
            max={JARAK_ORBIT_MAX}
            step={0.05}
            value={[jarakAktif]}
            onValueChange={(v) =>
              handleJarakOrbit(Array.isArray(v) ? v[0] : v)
            }
          />
        </div>
      </div>

      <div className="hidden rounded-md border bg-muted/40 px-2.5 py-1.5 text-xs lg:block lg:px-3 lg:py-2 lg:text-sm">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
          <span className="font-medium">Periode Orbit (T = √r³)</span>
          <span className="shrink-0 font-semibold tabular-nums">
            {periode.toFixed(2)} sat
          </span>
        </div>
        <p className="mt-0.5 text-[10px] text-muted-foreground tabular-nums lg:text-xs">
          {PLANET_INFO[planetTerpilih].label} · r = {jarakAktif.toFixed(2)} ·
          T² ∝ r³
        </p>
        <p className="text-[10px] text-sky-700 lg:text-xs">
          Semakin jauh dari Matahari, periode revolusi semakin panjang.
        </p>
      </div>
    </div>
  );

  const arButton = (
    <div className="space-y-1">
      <Button
        className={cn(
          "flex h-[52px] min-h-[52px] w-full items-center justify-center gap-2 border-2 px-4 py-0 text-sm leading-normal font-medium",
          arTombolAktif
            ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
            : "border-primary/50 bg-primary/5 text-foreground hover:bg-primary/10",
        )}
        variant="outline"
        onClick={handleLihatDiMeja}
        aria-label="Lihat di Meja (AR)"
        aria-disabled={!arTombolAktif}
      >
        <Box className="size-4 shrink-0" aria-hidden />
        <span className="lg:hidden">Lihat AR</span>
        <span className="hidden lg:inline">Lihat di Meja (AR)</span>
      </Button>
      {arTombol.petunjuk ? (
        <p className="px-0.5 text-[10px] leading-snug text-muted-foreground lg:text-[11px]">
          {arTombol.petunjuk}
        </p>
      ) : null}
    </div>
  );

  return (
    <PracticumShell
      title={modul.judul}
      badge={badge}
      scene={scene}
      quickInfo={
        <TataSuryaQuickInfo
          planetLabel={PLANET_INFO[planetTerpilih].label}
          jarak={jarakAktif}
          periode={periode}
        />
      }
      mobileQuickInfoBelowScene
      controls={controls}
      guide={
        <PanduanLangkah
          langkah={langkah}
          arAktif={arAktif}
          tataSurya
        />
      }
      lks={<LksPanel moduleId={modul.id} />}
      arButton={arButton}
      sceneClassName="max-lg:min-h-0 max-lg:flex-1 max-lg:shrink"
    />
  );
}
