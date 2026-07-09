"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { SimulasiInteraktifBadge } from "@/components/practicum-interaktif-badge";
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
import { PracticumQuickInfo } from "@/components/praktikum/practicum-quick-info";
import {
  PracticumResultStrip,
  useValueHighlight,
} from "@/components/praktikum/practicum-result-strip";
import { PanduanLangkah } from "@/components/praktikum/panduan-langkah";
import { TataSuryaScene } from "./tata-surya-scene";

type TataSuryaPraktikumProps = {
  modul: Modul;
  langkah: LangkahPraktikum[];
  arSupported: boolean | null;
  onArAvailability: (supported: boolean) => void;
  onArStatus: (status: ArStatus) => void;
};

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
  const resultHighlight = useValueHighlight(
    `${planetTerpilih}-${jarakAktif.toFixed(2)}-${periode.toFixed(2)}`,
  );

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
    <SimulasiInteraktifBadge />
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
    <div className="space-y-3">
      <div className="space-y-1.5">
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

      <div className="space-y-3">
        <div className="space-y-1.5">
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
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Jarak Orbit</span>
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

      <PracticumResultStrip
        label="Planet"
        value={PLANET_INFO[planetTerpilih].label}
        detail={`r ${jarakAktif.toFixed(2)} · T ${periode.toFixed(2)}`}
        status="Semakin jauh dari Matahari, periode revolusi semakin panjang."
        highlight={resultHighlight}
      />
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
      moduleId={modul.id}
      badge={badge}
      scene={scene}
      quickInfo={
        <PracticumQuickInfo
          items={[
            {
              key: "planet",
              label: "Planet",
              value: PLANET_INFO[planetTerpilih].label,
            },
            { key: "r", label: "r", value: jarakAktif.toFixed(2) },
            { key: "t", label: "T", value: periode.toFixed(2) },
          ]}
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
      arButton={arButton}
    />
  );
}
