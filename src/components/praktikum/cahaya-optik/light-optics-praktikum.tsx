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
  checkLightOpticsArAssetsAvailable,
  getLightOpticsArButtonState,
  getLightOpticsArModelUrls,
  shouldMountLightOpticsArViewer,
  type LightOpticsArAssetStatus,
} from "@/lib/light-optics-assets";
import {
  BATAS_SUDUT,
  DEFAULT_MEDIUM1,
  DEFAULT_MEDIUM2,
  MODE_DEFAULT,
  PILIHAN_MEDIUM,
  calculateLightOpticsResult,
  lightOpticsResultStripDetail,
  quickInfoReflection,
  quickInfoRefraction,
  refractiveIndexFromMedium,
  type LightMode,
  type OpticalMediumId,
} from "@/lib/light-optics-utils";
import { PracticumShell } from "@/components/praktikum/practicum-shell";
import { PanduanLangkah } from "@/components/praktikum/panduan-langkah";
import { LightOpticsQuickInfo } from "./light-optics-quick-info";
import {
  PracticumResultStrip,
  useValueHighlight,
} from "@/components/praktikum/practicum-result-strip";
import { LightOpticsScene } from "./light-optics-scene";

type LightOpticsPraktikumProps = {
  modul: Modul;
  langkah: LangkahPraktikum[];
  arSupported: boolean | null;
  onArAvailability: (supported: boolean) => void;
  onArStatus: (status: ArStatus) => void;
};

const PILIHAN_MODE: { id: LightMode; label: string }[] = [
  { id: "reflection", label: "Pemantulan" },
  { id: "refraction", label: "Pembiasan" },
];

export function LightOpticsPraktikum({
  modul,
  langkah,
  arSupported,
  onArAvailability,
  onArStatus,
}: LightOpticsPraktikumProps) {
  const modelViewerRef = useRef<ModelViewerHandle>(null);
  const [mode, setMode] = useState<LightMode>(MODE_DEFAULT);
  const [sudutDatang, setSudutDatang] = useState(BATAS_SUDUT.default);
  const [medium1, setMedium1] = useState<OpticalMediumId>(DEFAULT_MEDIUM1);
  const [medium2, setMedium2] = useState<OpticalMediumId>(DEFAULT_MEDIUM2);
  const [beamSignal, setBeamSignal] = useState(0);
  const [resetSignal, setResetSignal] = useState(0);
  const [arAktif, setArAktif] = useState(false);
  const [arAssets, setArAssets] = useState<LightOpticsArAssetStatus | null>(
    null,
  );

  const n1 = refractiveIndexFromMedium(medium1);
  const n2 = refractiveIndexFromMedium(medium2);
  const labelM1 = PILIHAN_MEDIUM.find((m) => m.id === medium1)?.label ?? "Udara";
  const labelM2 = PILIHAN_MEDIUM.find((m) => m.id === medium2)?.label ?? "Kaca";

  const hasil = useMemo(
    () =>
      calculateLightOpticsResult({
        mode,
        incidentAngleDeg: sudutDatang,
        medium1Index: n1,
        medium2Index: n2,
      }),
    [mode, sudutDatang, n1, n2],
  );

  const strip = useMemo(
    () => lightOpticsResultStripDetail(hasil, mode, labelM1, labelM2, n1, n2),
    [hasil, mode, labelM1, labelM2, n1, n2],
  );

  const resultHighlight = useValueHighlight(
    `${mode}-${hasil.incidentAngleDeg}-${hasil.reflectedAngleDeg}-${hasil.refractedAngleDeg}-${hasil.totalInternalReflection}-${beamSignal}`,
  );

  const arUrls = getLightOpticsArModelUrls();
  const arTombol = useMemo(
    () => getLightOpticsArButtonState(arAssets),
    [arAssets],
  );
  const arViewerSiap = shouldMountLightOpticsArViewer(arAssets);
  const arTombolAktif = arTombol.aktif && arSupported !== false;

  useEffect(() => {
    let aktif = true;
    checkLightOpticsArAssetsAvailable().then((status) => {
      if (aktif) setArAssets(status);
    });
    return () => {
      aktif = false;
    };
  }, []);

  const handlePancarkan = useCallback(() => {
    setBeamSignal((n) => n + 1);
  }, []);

  const handleReset = useCallback(() => {
    setMode(MODE_DEFAULT);
    setSudutDatang(BATAS_SUDUT.default);
    setMedium1(DEFAULT_MEDIUM1);
    setMedium2(DEFAULT_MEDIUM2);
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
      <LightOpticsScene
        mode={mode}
        result={hasil}
        medium1={medium1}
        medium2={medium2}
        beamSignal={beamSignal}
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
      <p className="text-xs font-semibold leading-snug">Kontrol Eksperimen</p>

      <div className="space-y-1.5">
        <span className="text-xs font-medium leading-snug">Mode eksperimen</span>
        <div className="grid grid-cols-2 gap-1.5 rounded-xl border bg-muted/40 p-1">
          {PILIHAN_MODE.map((m) => (
            <Button
              key={m.id}
              type="button"
              variant={mode === m.id ? "default" : "outline"}
              className="min-h-11 rounded-lg text-xs"
              onClick={() => setMode(m.id)}
              aria-pressed={mode === m.id}
            >
              {m.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">Sudut datang</span>
          <span
            className="text-muted-foreground tabular-nums"
            aria-label={`Sudut datang ${sudutDatang} derajat`}
          >
            {sudutDatang}°
          </span>
        </div>
        <Slider
          min={BATAS_SUDUT.min}
          max={BATAS_SUDUT.max}
          step={BATAS_SUDUT.step}
          value={[sudutDatang]}
          onValueChange={(v) => setSudutDatang(Array.isArray(v) ? v[0] : v)}
          aria-label="Sudut datang terhadap garis normal"
        />
      </div>

      {mode === "refraction" ? (
        <>
          <div className="space-y-1.5">
            <span className="text-xs font-medium leading-snug">Medium pertama</span>
            <div className="-mx-0.5 flex gap-1.5 overflow-x-auto pb-0.5">
              {PILIHAN_MEDIUM.map((m) => (
                <Button
                  key={m.id}
                  type="button"
                  variant={medium1 === m.id ? "default" : "outline"}
                  className="min-h-11 shrink-0 rounded-lg px-3 text-xs"
                  onClick={() => setMedium1(m.id)}
                  aria-pressed={medium1 === m.id}
                >
                  {m.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-medium leading-snug">Medium kedua</span>
            <div className="-mx-0.5 flex gap-1.5 overflow-x-auto pb-0.5">
              {PILIHAN_MEDIUM.map((m) => (
                <Button
                  key={m.id}
                  type="button"
                  variant={medium2 === m.id ? "default" : "outline"}
                  className="min-h-11 shrink-0 rounded-lg px-3 text-xs"
                  onClick={() => setMedium2(m.id)}
                  aria-pressed={medium2 === m.id}
                >
                  {m.label}
                </Button>
              ))}
            </div>
          </div>
        </>
      ) : null}

      <PracticumResultStrip
        label={strip.label}
        value={strip.value}
        detail={strip.detail}
        status={strip.status}
        highlight={resultHighlight}
      />

      <div className="grid grid-cols-2 gap-2.5">
        <Button className="min-h-12" onClick={handlePancarkan}>
          Pancarkan Cahaya
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

  const quickItems =
    mode === "reflection"
      ? quickInfoReflection(hasil)
      : quickInfoRefraction(hasil, n1, n2);

  return (
    <PracticumShell
      title={modul.judul}
      moduleId={modul.id}
      badge={badge}
      scene={scene}
      quickInfo={<LightOpticsQuickInfo items={quickItems} />}
      mobileQuickInfoBelowScene
      controls={controls}
      guide={
        <PanduanLangkah langkah={langkah} arAktif={arAktif} cahayaOptik />
      }
      arButton={arButton}
    />
  );
}
