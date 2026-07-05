"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  ModelViewer,
  type ArStatus,
  type ModelViewerHandle,
} from "@/components/model-viewer";
import type { Modul } from "@/db/schema";
import { cn } from "@/lib/utils";
import {
  checkNewtonArAssetsAvailable,
  getNewtonArButtonState,
  getNewtonArModelUrls,
  shouldMountNewtonArViewer,
  type NewtonArAssetStatus,
} from "@/lib/newton-assets";
import { NewtonScene } from "./newton-scene";

type NewtonPraktikumProps = {
  modul: Modul;
  arSupported: boolean | null;
  onArAvailability: (supported: boolean) => void;
  onArStatus: (status: ArStatus) => void;
};

export function NewtonPraktikum({
  modul,
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
  const arTombol = useMemo(
    () => getNewtonArButtonState(arAssets),
    [arAssets],
  );
  const arViewerSiap = shouldMountNewtonArViewer(arAssets);
  const arTombolAktif =
    arTombol.aktif && arSupported !== false;

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

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
      {/* Area visual 3D — prioritas tinggi di mobile */}
      <div className="relative min-h-[min(11rem,26svh)] flex-[2] basis-0 lg:min-h-0 lg:flex-1">
        <div className="absolute inset-0">
          <NewtonScene
            mass={mass}
            force={force}
            acceleration={acceleration}
            pushSignal={pushSignal}
            resetSignal={resetSignal}
          />
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-2 lg:p-3">
          <span className="rounded-full bg-background/90 px-2 py-0.5 text-[11px] font-medium shadow-sm backdrop-blur-sm lg:px-2.5 lg:py-1 lg:text-xs">
            {arAktif ? "Mode AR aktif" : "Praktikum Interaktif"}
          </span>
        </div>

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
      </div>

      {/* Kontrol praktikum — ringkas di mobile, tidak menekan canvas */}
      <div className="shrink-0 space-y-2 border-t bg-background/95 p-2 backdrop-blur-sm lg:space-y-3 lg:p-3">
        <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 lg:gap-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">Massa (m)</span>
              <span className="text-muted-foreground tabular-nums">{mass} kg</span>
            </div>
            <Slider
              min={1}
              max={10}
              step={1}
              value={[mass]}
              onValueChange={(v) =>
                setMass(Array.isArray(v) ? v[0] : v)
              }
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">Gaya (F)</span>
              <span className="text-muted-foreground tabular-nums">{force} N</span>
            </div>
            <Slider
              min={1}
              max={50}
              step={1}
              value={[force]}
              onValueChange={(v) =>
                setForce(Array.isArray(v) ? v[0] : v)
              }
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 rounded-md border bg-muted/40 px-2.5 py-1.5 text-xs lg:px-3 lg:py-2 lg:text-sm">
          <span className="font-medium">Percepatan (a = F / m)</span>
          <span className="shrink-0 font-semibold tabular-nums">
            {acceleration.toFixed(2)} m/s²
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button className="min-h-11" onClick={handleDorong}>
            Dorong
          </Button>
          <Button className="min-h-11" variant="outline" onClick={handleReset}>
            Reset
          </Button>
        </div>

        <div className="space-y-1">
          <Button
            className={cn(
              "min-h-11 w-full gap-2 border-2 font-medium",
              arTombolAktif
                ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                : "border-primary/50 bg-primary/5 text-foreground hover:bg-primary/10",
            )}
            variant="outline"
            onClick={handleLihatDiMeja}
            aria-label="Lihat di Meja (AR)"
            aria-disabled={!arTombolAktif}
          >
            <Box className="size-4 shrink-0" />
            Lihat di Meja (AR)
          </Button>
          {arTombol.petunjuk ? (
            <p className="px-0.5 text-[10px] leading-snug text-muted-foreground lg:text-[11px]">
              {arTombol.petunjuk}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
