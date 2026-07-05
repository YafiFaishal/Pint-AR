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
  checkJatuhBebasArAssetsAvailable,
  getJatuhBebasArButtonState,
  getJatuhBebasArModelUrls,
  shouldMountJatuhBebasArViewer,
  type JatuhBebasArAssetStatus,
} from "@/lib/jatuh-bebas-assets";
import {
  BATAS_GRAVITASI,
  BATAS_TINGGI,
  hitungKecepatanAkhir,
  hitungKecepatanSaatIni,
  hitungWaktuJatuh,
  type ModeJatuh,
} from "@/lib/jatuh-bebas-utils";
import { PracticumShell } from "@/components/praktikum/practicum-shell";
import { PanduanLangkah } from "@/components/praktikum/panduan-langkah";
import { LksPanel } from "@/components/praktikum/lks-panel";
import { PracticumQuickInfo } from "@/components/praktikum/practicum-quick-info";
import { JatuhBebasScene } from "./jatuh-bebas-scene";

type JatuhBebasPraktikumProps = {
  modul: Modul;
  langkah: LangkahPraktikum[];
  arSupported: boolean | null;
  onArAvailability: (supported: boolean) => void;
  onArStatus: (status: ArStatus) => void;
};

export function JatuhBebasPraktikum({
  modul,
  langkah,
  arSupported,
  onArAvailability,
  onArStatus,
}: JatuhBebasPraktikumProps) {
  const modelViewerRef = useRef<ModelViewerHandle>(null);
  const [tinggi, setTinggi] = useState(10);
  const [gravitasi, setGravitasi] = useState(9.8);
  const [mode, setMode] = useState<ModeJatuh>("hampa");
  const [dropSignal, setDropSignal] = useState(0);
  const [resetSignal, setResetSignal] = useState(0);
  const [simState, setSimState] = useState({ elapsed: 0, falling: false });
  const [arAktif, setArAktif] = useState(false);
  const [arAssets, setArAssets] = useState<JatuhBebasArAssetStatus | null>(null);

  const arUrls = getJatuhBebasArModelUrls();
  const waktuTeoritis = hitungWaktuJatuh(tinggi, gravitasi, mode);
  const kecepatanTeoritis = hitungKecepatanAkhir(tinggi, gravitasi, mode);

  const tampilanWaktu = simState.falling ? simState.elapsed : waktuTeoritis;
  const tampilanKecepatan = simState.falling
    ? hitungKecepatanSaatIni(gravitasi, mode, simState.elapsed)
    : kecepatanTeoritis;

  const arTombol = useMemo(
    () => getJatuhBebasArButtonState(arAssets),
    [arAssets],
  );
  const arViewerSiap = shouldMountJatuhBebasArViewer(arAssets);
  const arTombolAktif = arTombol.aktif && arSupported !== false;

  useEffect(() => {
    let aktif = true;
    checkJatuhBebasArAssetsAvailable().then((status) => {
      if (aktif) setArAssets(status);
    });
    return () => {
      aktif = false;
    };
  }, []);

  const handleSimUpdate = useCallback(
    (state: { elapsed: number; falling: boolean }) => {
      setSimState(state);
    },
    [],
  );

  const handleJatuhkan = useCallback(() => {
    setDropSignal((n) => n + 1);
  }, []);

  const handleReset = useCallback(() => {
    setResetSignal((n) => n + 1);
    setSimState({ elapsed: 0, falling: false });
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
      <JatuhBebasScene
        tinggi={tinggi}
        gravitasi={gravitasi}
        mode={mode}
        dropSignal={dropSignal}
        resetSignal={resetSignal}
        onSimUpdate={handleSimUpdate}
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
    <div className="space-y-1.5 lg:space-y-3">
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">Ketinggian (h)</span>
          <span className="text-muted-foreground tabular-nums">{tinggi} m</span>
        </div>
        <Slider
          min={BATAS_TINGGI.min}
          max={BATAS_TINGGI.max}
          step={0.5}
          value={[tinggi]}
          onValueChange={(v) => setTinggi(Array.isArray(v) ? v[0] : v)}
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">Gravitasi (g)</span>
          <span className="text-muted-foreground tabular-nums">
            {gravitasi.toFixed(1)} m/s²
          </span>
        </div>
        <Slider
          min={BATAS_GRAVITASI.min}
          max={BATAS_GRAVITASI.max}
          step={0.1}
          value={[gravitasi]}
          onValueChange={(v) => setGravitasi(Array.isArray(v) ? v[0] : v)}
        />
      </div>

      <div className="space-y-1">
        <span className="text-xs font-medium">Lingkungan</span>
        <div className="grid grid-cols-2 gap-1.5">
          <Button
            type="button"
            variant={mode === "udara" ? "default" : "outline"}
            className="min-h-9 text-xs"
            onClick={() => setMode("udara")}
          >
            Udara
          </Button>
          <Button
            type="button"
            variant={mode === "hampa" ? "default" : "outline"}
            className="min-h-9 text-xs"
            onClick={() => setMode("hampa")}
          >
            Hampa
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 rounded-md border bg-muted/30 px-2.5 py-1.5 text-[11px] lg:text-xs">
        <span className="tabular-nums">
          <span className="font-medium text-muted-foreground">t </span>
          {tampilanWaktu.toFixed(2)} s
        </span>
        <span className="tabular-nums">
          <span className="font-medium text-muted-foreground">v </span>
          {tampilanKecepatan.toFixed(1)} m/s
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button className="min-h-10 lg:min-h-11" onClick={handleJatuhkan}>
          Jatuhkan
        </Button>
        <Button
          className="min-h-10 lg:min-h-11"
          variant="outline"
          onClick={handleReset}
        >
          Reset
        </Button>
      </div>
    </div>
  );

  const arButton = (
    <div className="space-y-0.5 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
      <Button
        className={cn(
          "flex h-11 min-h-11 w-full items-center justify-center gap-2 border-2 px-4 py-0 text-sm leading-normal font-medium lg:h-[52px] lg:min-h-[52px]",
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
        <p className="px-0.5 text-[9px] leading-snug text-muted-foreground lg:text-[11px]">
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
        <PracticumQuickInfo
          compact
          columns={4}
          items={[
            { key: "h", label: "h", value: `${tinggi} m` },
            { key: "g", label: "g", value: `${gravitasi.toFixed(1)} m/s²` },
            {
              key: "t",
              label: "t",
              value: `${tampilanWaktu.toFixed(2)} s`,
            },
            {
              key: "v",
              label: "v",
              value: `${tampilanKecepatan.toFixed(1)} m/s`,
            },
          ]}
        />
      }
      mobileQuickInfoBelowScene
      mobileQuickInfoClassName="max-lg:max-h-[5rem] max-lg:px-2 max-lg:py-1.5"
      mobileSheetPadding="large"
      controls={controls}
      guide={
        <PanduanLangkah langkah={langkah} arAktif={arAktif} jatuhBebas />
      }
      lks={<LksPanel moduleId={modul.id} />}
      arButton={arButton}
      sceneClassName="max-lg:min-h-[55svh] max-lg:max-h-[65svh] max-lg:flex-none max-lg:shrink-0 lg:min-h-0 lg:flex-1"
    />
  );
}
