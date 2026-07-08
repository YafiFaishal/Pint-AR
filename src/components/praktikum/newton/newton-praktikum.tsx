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
  checkNewtonArAssetsAvailable,
  getNewtonArButtonState,
  getNewtonArModelUrls,
  shouldMountNewtonArViewer,
  type NewtonArAssetStatus,
} from "@/lib/newton-assets";
import { PracticumShell } from "@/components/praktikum/practicum-shell";
import { PanduanLangkah } from "@/components/praktikum/panduan-langkah";
import { PracticumQuickInfo } from "@/components/praktikum/practicum-quick-info";
import {
  PracticumResultStrip,
  useValueHighlight,
} from "@/components/praktikum/practicum-result-strip";
import { NewtonScene } from "./newton-scene";

type NewtonPraktikumProps = {
  modul: Modul;
  langkah: LangkahPraktikum[];
  arSupported: boolean | null;
  onArAvailability: (supported: boolean) => void;
  onArStatus: (status: ArStatus) => void;
};

export function NewtonPraktikum({
  modul,
  langkah,
  arSupported,
  onArAvailability,
  onArStatus,
}: NewtonPraktikumProps) {
  const modelViewerRef = useRef<ModelViewerHandle>(null);
  const [mass, setMass] = useState(5);
  const [force, setForce] = useState(20);
  const [pushSignal, setPushSignal] = useState(0);
  const [resetSignal, setResetSignal] = useState(0);
  const [arAktif, setArAktif] = useState(false);
  const [arAssets, setArAssets] = useState<NewtonArAssetStatus | null>(null);

  const arUrls = getNewtonArModelUrls();
  const acceleration = force / mass;
  const resultHighlight = useValueHighlight(
    `${force}-${mass}-${acceleration.toFixed(2)}`,
  );
  const arTombol = useMemo(
    () => getNewtonArButtonState(arAssets),
    [arAssets],
  );
  const arViewerSiap = shouldMountNewtonArViewer(arAssets);
  const arTombolAktif = arTombol.aktif && arSupported !== false;

  useEffect(() => {
    let aktif = true;
    checkNewtonArAssetsAvailable().then((status) => {
      if (aktif) setArAssets(status);
    });
    return () => {
      aktif = false;
    };
  }, []);

  const handleDorong = useCallback(() => {
    setPushSignal((n) => n + 1);
  }, []);

  const handleReset = useCallback(() => {
    setResetSignal((n) => n + 1);
  }, []);

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
      <NewtonScene
        mass={mass}
        force={force}
        acceleration={acceleration}
        pushSignal={pushSignal}
        resetSignal={resetSignal}
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
      <div className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Massa</span>
            <span className="text-muted-foreground tabular-nums">{mass} kg</span>
          </div>
          <Slider
            min={1}
            max={10}
            step={1}
            value={[mass]}
            onValueChange={(v) => setMass(Array.isArray(v) ? v[0] : v)}
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Gaya</span>
            <span className="text-muted-foreground tabular-nums">{force} N</span>
          </div>
          <Slider
            min={1}
            max={50}
            step={1}
            value={[force]}
            onValueChange={(v) => setForce(Array.isArray(v) ? v[0] : v)}
          />
        </div>
      </div>

      <PracticumResultStrip
        label="Percepatan"
        value={`${acceleration.toFixed(2)} m/s²`}
        detail={`F ${force} N · m ${mass} kg`}
        highlight={resultHighlight}
      />

      <div className="grid grid-cols-2 gap-2.5">
        <Button className="min-h-12" onClick={handleDorong}>
          Dorong
        </Button>
        <Button className="min-h-12" variant="outline" onClick={handleReset}>
          Reset
        </Button>
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
      moduleId={modul.id}
      badge={badge}
      scene={scene}
      quickInfo={
        <PracticumQuickInfo
          items={[
            { key: "f", label: "F", value: `${force} N` },
            { key: "m", label: "m", value: `${mass} kg` },
            {
              key: "a",
              label: "a",
              value: `${acceleration.toFixed(2)} m/s²`,
            },
          ]}
        />
      }
      mobileQuickInfoBelowScene
      controls={controls}
      guide={
        <PanduanLangkah langkah={langkah} arAktif={arAktif} newton />
      }
      arButton={arButton}
    />
  );
}
