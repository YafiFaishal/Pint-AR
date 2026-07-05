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
  checkRangkaianArAssetsAvailable,
  getRangkaianArButtonState,
  getRangkaianArModelUrls,
  shouldMountRangkaianArViewer,
  type RangkaianArAssetStatus,
} from "@/lib/rangkaian-assets";
import { RangkaianScene } from "./rangkaian-scene";

type RangkaianPraktikumProps = {
  modul: Modul;
  arSupported: boolean | null;
  onArAvailability: (supported: boolean) => void;
  onArStatus: (status: ArStatus) => void;
};

export function RangkaianPraktikum({
  modul,
  arSupported,
  onArAvailability,
  onArStatus,
}: RangkaianPraktikumProps) {
  const modelViewerRef = useRef<ModelViewerHandle>(null);
  const [saklarMenyala, setSaklarMenyala] = useState(false);
  const [tegangan, setTegangan] = useState(6);
  const [hambatan, setHambatan] = useState(6);
  const [arAktif, setArAktif] = useState(false);
  const [arAssets, setArAssets] = useState<RangkaianArAssetStatus | null>(null);
  const [desktop, setDesktop] = useState(false);

  const arUrls = getRangkaianArModelUrls();
  const arus = tegangan / hambatan;
  const rangkaianTerbuka = !saklarMenyala;

  const arTombol = useMemo(
    () => getRangkaianArButtonState(arAssets),
    [arAssets],
  );
  const arViewerSiap = shouldMountRangkaianArViewer(arAssets);
  const arTombolAktif = arTombol.aktif && arSupported !== false;

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const perbarui = () => setDesktop(mq.matches);
    perbarui();
    mq.addEventListener("change", perbarui);
    return () => mq.removeEventListener("change", perbarui);
  }, []);

  useEffect(() => {
    let aktif = true;
    checkRangkaianArAssetsAvailable().then((status) => {
      if (aktif) setArAssets(status);
    });
    return () => {
      aktif = false;
    };
  }, []);

  const handleSaklar = useCallback(() => {
    setSaklarMenyala((v) => !v);
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
    <div className="relative flex flex-col max-lg:h-auto lg:h-full lg:min-h-0">
      {/* Scene — tinggi tetap di mobile agar kontrol + AR muat */}
      <div className="relative h-[min(10rem,22svh)] shrink-0 overflow-hidden lg:min-h-0 lg:h-auto lg:flex-[2] lg:basis-0">
        <div className="absolute inset-0">
          <RangkaianScene
            saklarMenyala={saklarMenyala}
            tegangan={tegangan}
            hambatan={hambatan}
            arus={arus}
            rangkaianTerbuka={rangkaianTerbuka}
            tampilkanLabel={desktop}
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

      {/* Kontrol — ringkas di mobile */}
      <div className="shrink-0 space-y-1.5 border-t bg-background/95 p-2 backdrop-blur-sm lg:space-y-3 lg:p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium">Saklar</span>
          <Button
            className="min-h-9 min-w-[5.5rem] text-xs"
            variant={saklarMenyala ? "default" : "outline"}
            onClick={handleSaklar}
          >
            {saklarMenyala ? "ON" : "OFF"}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 lg:gap-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">Tegangan (V)</span>
              <span className="text-muted-foreground tabular-nums">
                {tegangan} V
              </span>
            </div>
            <Slider
              min={1}
              max={12}
              step={1}
              value={[tegangan]}
              onValueChange={(v) =>
                setTegangan(Array.isArray(v) ? v[0] : v)
              }
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">Hambatan (R)</span>
              <span className="text-muted-foreground tabular-nums">
                {hambatan} Ω
              </span>
            </div>
            <Slider
              min={1}
              max={20}
              step={1}
              value={[hambatan]}
              onValueChange={(v) =>
                setHambatan(Array.isArray(v) ? v[0] : v)
              }
            />
          </div>
        </div>

        {/* Ringkasan V/R/I — desktop saja; mobile cukup di card arus */}
        <div className="hidden grid-cols-3 gap-1.5 text-center lg:grid">
          <div className="rounded-md border bg-background px-1 py-1.5">
            <p className="text-[10px] text-muted-foreground">V</p>
            <p className="text-xs font-semibold tabular-nums">{tegangan} V</p>
          </div>
          <div className="rounded-md border bg-background px-1 py-1.5">
            <p className="text-[10px] text-muted-foreground">R</p>
            <p className="text-xs font-semibold tabular-nums">{hambatan} Ω</p>
          </div>
          <div className="rounded-md border bg-background px-1 py-1.5">
            <p className="text-[10px] text-muted-foreground">I</p>
            <p className="text-xs font-semibold tabular-nums">
              {arus.toFixed(2)} A
            </p>
          </div>
        </div>

        <div className="rounded-md border bg-muted/40 px-2.5 py-1.5 text-xs lg:px-3 lg:py-2 lg:text-sm">
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
            <span className="font-medium">Arus (I = V / R)</span>
            <span className="shrink-0 font-semibold tabular-nums">
              {arus.toFixed(2)} A
            </span>
          </div>
          <p className="mt-0.5 text-[10px] text-muted-foreground tabular-nums lg:text-xs">
            V = {tegangan} V · R = {hambatan} Ω
          </p>
          <p
            className={cn(
              "text-[10px] lg:text-xs",
              rangkaianTerbuka ? "text-amber-700" : "text-emerald-700",
            )}
          >
            {rangkaianTerbuka
              ? "Rangkaian terbuka — arus tidak mengalir"
              : "Rangkaian tertutup — arus mengalir"}
            {" · "}
            Lampu {saklarMenyala ? "menyala" : "mati"}
          </p>
        </div>
      </div>

      {/* Tombol AR — blok terpisah, selalu terlihat di mobile */}
      <div className="relative z-20 shrink-0 border-t bg-background px-2 pb-2.5 pt-2 lg:px-3 lg:pb-3">
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
          <p className="mt-1.5 px-0.5 text-[10px] leading-snug text-muted-foreground lg:text-[11px]">
            {arTombol.petunjuk}
          </p>
        ) : null}
      </div>
    </div>
  );
}
