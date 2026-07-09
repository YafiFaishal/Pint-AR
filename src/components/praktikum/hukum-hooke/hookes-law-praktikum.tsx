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
  checkHookesLawArAssetsAvailable,
  getHookesLawArButtonState,
  getHookesLawArModelUrls,
  shouldMountHookesLawArViewer,
  type HookesLawArAssetStatus,
} from "@/lib/hookes-law-assets";
import {
  BATAS_AMPLITUDO,
  BATAS_KONSTANTA_PEGAS,
  BATAS_MASSA,
  DEFAULT_GRAVITY_PRESET,
  GRAVITY_PRESETS,
  PANJANG_ALAMI_DEFAULT,
  calculateSpringResult,
  getGravityPreset,
  labelGravityPreset,
  oscillationResultStripDetail,
  quickInfoOscillation,
  quickInfoStatic,
  staticResultStripDetail,
  type GravityPresetId,
  type SpringExperimentMode,
} from "@/lib/hookes-law-utils";
import { PracticumShell } from "@/components/praktikum/practicum-shell";
import { PanduanLangkah } from "@/components/praktikum/panduan-langkah";
import {
  PracticumResultStrip,
  useValueHighlight,
} from "@/components/praktikum/practicum-result-strip";
import {
  HookesLawScene,
  type SpringSimStatus,
} from "./hookes-law-scene";
import { HookesLawQuickInfo } from "./hookes-law-quick-info";

type HookesLawPraktikumProps = {
  modul: Modul;
  langkah: LangkahPraktikum[];
  arSupported: boolean | null;
  onArAvailability: (supported: boolean) => void;
  onArStatus: (status: ArStatus) => void;
};

const PILIHAN_MODE: { id: SpringExperimentMode; label: string }[] = [
  { id: "static", label: "Beban Statis" },
  { id: "oscillation", label: "Getaran Pegas" },
];

export function HookesLawPraktikum({
  modul,
  langkah,
  arSupported,
  onArAvailability,
  onArStatus,
}: HookesLawPraktikumProps) {
  const modelViewerRef = useRef<ModelViewerHandle>(null);
  const [mode, setMode] = useState<SpringExperimentMode>("static");
  const [konstanta, setKonstanta] = useState<number>(
    BATAS_KONSTANTA_PEGAS.default,
  );
  const [massa, setMassa] = useState<number>(BATAS_MASSA.default);
  const [amplitudo, setAmplitudo] = useState<number>(BATAS_AMPLITUDO.default);
  const [gravityPreset, setGravityPreset] = useState<GravityPresetId>(
    DEFAULT_GRAVITY_PRESET,
  );
  const [simStatus, setSimStatus] = useState<SpringSimStatus>("idle");
  const [resetSignal, setResetSignal] = useState(0);
  const [simStats, setSimStats] = useState({ elapsed: 0, oscillations: 0 });
  const [arAktif, setArAktif] = useState(false);
  const [arAssets, setArAssets] = useState<HookesLawArAssetStatus | null>(null);

  const gravitasi = getGravityPreset(gravityPreset);

  const hasil = useMemo(
    () =>
      calculateSpringResult({
        springConstantNm: konstanta,
        massKg: massa,
        gravityMs2: gravitasi,
        initialAmplitudeM: amplitudo,
        naturalLengthM: PANJANG_ALAMI_DEFAULT,
      }),
    [konstanta, massa, gravitasi, amplitudo],
  );

  const strip = useMemo(
    () =>
      mode === "static"
        ? staticResultStripDetail(hasil)
        : oscillationResultStripDetail(hasil),
    [mode, hasil],
  );

  const resultHighlight = useValueHighlight(
    `${mode}-${hasil.equilibriumExtensionM.toFixed(3)}-${hasil.periodS.toFixed(3)}-${konstanta}-${massa}-${gravitasi}`,
  );

  const quickItems = useMemo(
    () =>
      mode === "static"
        ? quickInfoStatic(konstanta, massa, hasil)
        : quickInfoOscillation(konstanta, hasil, simStats.oscillations),
    [mode, konstanta, massa, hasil, simStats.oscillations],
  );

  const arUrls = getHookesLawArModelUrls();
  const arTombol = useMemo(
    () => getHookesLawArButtonState(arAssets),
    [arAssets],
  );
  const arViewerSiap = shouldMountHookesLawArViewer(arAssets);
  const arTombolAktif = arTombol.aktif && arSupported !== false;

  useEffect(() => {
    let aktif = true;
    checkHookesLawArAssetsAvailable().then((status) => {
      if (aktif) setArAssets(status);
    });
    return () => {
      aktif = false;
    };
  }, []);

  const resetSimulasi = useCallback(() => {
    setSimStatus("idle");
    setSimStats({ elapsed: 0, oscillations: 0 });
    setResetSignal((n) => n + 1);
  }, []);

  const ubahMode = useCallback(
    (m: SpringExperimentMode) => {
      setMode(m);
      resetSimulasi();
    },
    [resetSimulasi],
  );

  const ubahKonstanta = useCallback(
    (v: number) => {
      setKonstanta(v);
      resetSimulasi();
    },
    [resetSimulasi],
  );

  const ubahMassa = useCallback(
    (v: number) => {
      setMassa(v);
      resetSimulasi();
    },
    [resetSimulasi],
  );

  const ubahAmplitudo = useCallback(
    (v: number) => {
      setAmplitudo(v);
      resetSimulasi();
    },
    [resetSimulasi],
  );

  const ubahGravitasi = useCallback(
    (id: GravityPresetId) => {
      setGravityPreset(id);
      resetSimulasi();
    },
    [resetSimulasi],
  );

  const handleToggleGetaran = useCallback(() => {
    if (simStatus === "idle" || simStatus === "paused") {
      setSimStatus("running");
    } else {
      setSimStatus("paused");
    }
  }, [simStatus]);

  const handleReset = useCallback(() => {
    setMode("static");
    setKonstanta(BATAS_KONSTANTA_PEGAS.default);
    setMassa(BATAS_MASSA.default);
    setAmplitudo(BATAS_AMPLITUDO.default);
    setGravityPreset(DEFAULT_GRAVITY_PRESET);
    resetSimulasi();
  }, [resetSimulasi]);

  const handleSimUpdate = useCallback(
    (state: { elapsed: number; oscillations: number }) => {
      setSimStats({
        elapsed: state.elapsed,
        oscillations: state.oscillations,
      });
    },
    [],
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

  const tombolAksiLabel =
    mode === "static"
      ? "Amati Perubahan"
      : simStatus === "running"
        ? "Jeda"
        : simStatus === "paused"
          ? "Lanjutkan"
          : "Mulai Getaran";

  const badge = arAktif ? (
    <Badge>Mode AR aktif</Badge>
  ) : (
    <SimulasiInteraktifBadge />
  );

  const scene = (
    <>
      <HookesLawScene
        mode={mode}
        springConstantNm={konstanta}
        massKg={massa}
        gravityMs2={gravitasi}
        initialAmplitudeM={amplitudo}
        simStatus={simStatus}
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
              onClick={() => ubahMode(m.id)}
              aria-pressed={mode === m.id}
            >
              {m.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">Konstanta pegas</span>
          <span className="text-muted-foreground tabular-nums">
            {konstanta} N/m
          </span>
        </div>
        <Slider
          min={BATAS_KONSTANTA_PEGAS.min}
          max={BATAS_KONSTANTA_PEGAS.max}
          step={BATAS_KONSTANTA_PEGAS.step}
          value={[konstanta]}
          onValueChange={(v) => ubahKonstanta(Array.isArray(v) ? v[0] : v)}
          aria-label="Konstanta pegas"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">Massa beban</span>
          <span className="text-muted-foreground tabular-nums">
            {massa.toFixed(2)} kg
          </span>
        </div>
        <Slider
          min={BATAS_MASSA.min}
          max={BATAS_MASSA.max}
          step={BATAS_MASSA.step}
          value={[massa]}
          onValueChange={(v) => ubahMassa(Array.isArray(v) ? v[0] : v)}
          aria-label="Massa beban"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">Gravitasi</span>
          <span className="text-muted-foreground">
            Lingkungan: {labelGravityPreset(gravityPreset)}
          </span>
        </div>
        <div className="-mx-0.5 flex gap-1.5 overflow-x-auto pb-0.5">
          {GRAVITY_PRESETS.map((p) => (
            <Button
              key={p.id}
              type="button"
              variant={gravityPreset === p.id ? "default" : "outline"}
              className="min-h-11 shrink-0 rounded-lg px-3 text-xs"
              onClick={() => ubahGravitasi(p.id)}
              aria-pressed={gravityPreset === p.id}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {mode === "oscillation" ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Amplitudo awal</span>
            <span className="text-muted-foreground tabular-nums">
              {amplitudo.toFixed(2)} m
            </span>
          </div>
          <Slider
            min={BATAS_AMPLITUDO.min}
            max={BATAS_AMPLITUDO.max}
            step={BATAS_AMPLITUDO.step}
            value={[amplitudo]}
            onValueChange={(v) => ubahAmplitudo(Array.isArray(v) ? v[0] : v)}
            aria-label="Amplitudo awal getaran"
          />
        </div>
      ) : null}

      <PracticumResultStrip
        label={strip.label}
        value={strip.value}
        detail={strip.detail}
        status={strip.status}
        highlight={resultHighlight}
      />

      <div className="grid grid-cols-2 gap-2.5">
        <Button
          className="min-h-12"
          onClick={
            mode === "oscillation" ? handleToggleGetaran : undefined
          }
          disabled={mode === "static"}
          aria-label={tombolAksiLabel}
        >
          {tombolAksiLabel}
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

  return (
    <PracticumShell
      title={modul.judul}
      moduleId={modul.id}
      badge={badge}
      scene={scene}
      quickInfo={<HookesLawQuickInfo items={quickItems} />}
      mobileQuickInfoBelowScene
      controls={controls}
      guide={
        <PanduanLangkah
          langkah={langkah}
          arAktif={arAktif}
          hookeSpring
        />
      }
      arButton={arButton}
    />
  );
}
