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
import { PracticumQuickInfo } from "@/components/praktikum/practicum-quick-info";
import {
  PracticumResultStrip,
  useValueHighlight,
} from "@/components/praktikum/practicum-result-strip";
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
  const resultHighlight = useValueHighlight(
    `${tampilanWaktu.toFixed(2)}-${tampilanKecepatan.toFixed(1)}-${mode}`,
  );

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
    <SimulasiInteraktifBadge />
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
    <div className="space-y-3">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">Ketinggian</span>
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

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">Gravitasi</span>
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

      <div className="space-y-1.5">
        <span className="text-xs font-medium leading-snug">Lingkungan</span>
        <div className="grid grid-cols-2 gap-2 rounded-xl border bg-muted/40 p-1">
          <Button
            type="button"
            variant={mode === "udara" ? "default" : "outline"}
            className="min-h-10 rounded-lg text-xs"
            onClick={() => setMode("udara")}
          >
            Udara
          </Button>
          <Button
            type="button"
            variant={mode === "hampa" ? "default" : "outline"}
            className="min-h-10 rounded-lg text-xs"
            onClick={() => setMode("hampa")}
          >
            Hampa
          </Button>
        </div>
      </div>

      <PracticumResultStrip
        label="Waktu"
        value={`${tampilanWaktu.toFixed(2)} s`}
        detail={`Kecepatan ${tampilanKecepatan.toFixed(1)} m/s`}
        status={`Lingkungan: ${mode === "udara" ? "Udara" : "Hampa"}`}
        highlight={resultHighlight}
      />

      <div className="grid grid-cols-2 gap-2.5">
        <Button className="min-h-12" onClick={handleJatuhkan}>
          Jatuhkan
        </Button>
        <Button
          className="min-h-12"
          variant="outline"
          onClick={handleReset}
        >
          Reset
        </Button>
      </div>
    </div>
  );

  const arButton = (
    <div className="space-y-1">
      <Button
        className={cn(
          "flex min-h-[52px] w-full items-center justify-center gap-2 border-2 px-4 py-0 text-sm leading-normal font-medium",
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
      moduleId={modul.id}
      badge={badge}
      scene={scene}
      quickInfo={
        <PracticumQuickInfo
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
      controls={controls}
      guide={
        <PanduanLangkah langkah={langkah} arAktif={arAktif} jatuhBebas />
      }
      arButton={arButton}
    />
  );
}
