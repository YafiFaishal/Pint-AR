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
  checkSimplePendulumArAssetsAvailable,
  getSimplePendulumArButtonState,
  getSimplePendulumArModelUrls,
  shouldMountSimplePendulumArViewer,
  type SimplePendulumArAssetStatus,
} from "@/lib/simple-pendulum-assets";
import {
  BATAS_MASSA,
  BATAS_PANJANG,
  BATAS_SUDUT_AWAL,
  DEFAULT_GRAVITY_PRESET,
  GRAVITY_PRESETS,
  calculatePendulumResult,
  getGravityPreset,
  labelGravityPreset,
  pendulumResultStripDetail,
  quickInfoPendulum,
  type GravityPresetId,
} from "@/lib/simple-pendulum-utils";
import { PracticumShell } from "@/components/praktikum/practicum-shell";
import { PanduanLangkah } from "@/components/praktikum/panduan-langkah";
import {
  PracticumResultStrip,
  useValueHighlight,
} from "@/components/praktikum/practicum-result-strip";
import {
  SimplePendulumScene,
  type PendulumSimStatus,
} from "./simple-pendulum-scene";
import { SimplePendulumQuickInfo } from "./simple-pendulum-quick-info";

type SimplePendulumPraktikumProps = {
  modul: Modul;
  langkah: LangkahPraktikum[];
  arSupported: boolean | null;
  onArAvailability: (supported: boolean) => void;
  onArStatus: (status: ArStatus) => void;
};

export function SimplePendulumPraktikum({
  modul,
  langkah,
  arSupported,
  onArAvailability,
  onArStatus,
}: SimplePendulumPraktikumProps) {
  const modelViewerRef = useRef<ModelViewerHandle>(null);
  const [panjang, setPanjang] = useState<number>(BATAS_PANJANG.default);
  const [massa, setMassa] = useState<number>(BATAS_MASSA.default);
  const [sudutAwal, setSudutAwal] = useState<number>(BATAS_SUDUT_AWAL.default);
  const [gravityPreset, setGravityPreset] = useState<GravityPresetId>(
    DEFAULT_GRAVITY_PRESET,
  );
  const [massBaruDiubah, setMassBaruDiubah] = useState(false);
  const [simStatus, setSimStatus] = useState<PendulumSimStatus>("idle");
  const [resetSignal, setResetSignal] = useState(0);
  const [simStats, setSimStats] = useState({
    elapsed: 0,
    oscillations: 0,
  });
  const [arAktif, setArAktif] = useState(false);
  const [arAssets, setArAssets] = useState<SimplePendulumArAssetStatus | null>(
    null,
  );

  const gravitasi = getGravityPreset(gravityPreset);

  const hasil = useMemo(
    () =>
      calculatePendulumResult({
        lengthM: panjang,
        massKg: massa,
        initialAngleDeg: sudutAwal,
        gravityMs2: gravitasi,
        damping: 0,
      }),
    [panjang, massa, sudutAwal, gravitasi],
  );

  const strip = useMemo(
    () =>
      pendulumResultStripDetail(hasil, panjang, gravitasi, massBaruDiubah),
    [hasil, panjang, gravitasi, massBaruDiubah],
  );

  const resultHighlight = useValueHighlight(
    `${hasil.periodS.toFixed(3)}-${hasil.frequencyHz.toFixed(3)}-${panjang}-${gravitasi}-${massa}`,
  );

  const quickItems = useMemo(
    () => quickInfoPendulum(panjang, hasil, simStats.oscillations),
    [panjang, hasil, simStats.oscillations],
  );

  const arUrls = getSimplePendulumArModelUrls();
  const arTombol = useMemo(
    () => getSimplePendulumArButtonState(arAssets),
    [arAssets],
  );
  const arViewerSiap = shouldMountSimplePendulumArViewer(arAssets);
  const arTombolAktif = arTombol.aktif && arSupported !== false;

  useEffect(() => {
    let aktif = true;
    checkSimplePendulumArAssetsAvailable().then((status) => {
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

  const ubahPanjang = useCallback(
    (v: number) => {
      setPanjang(v);
      resetSimulasi();
    },
    [resetSimulasi],
  );

  const ubahSudutAwal = useCallback(
    (v: number) => {
      setSudutAwal(v);
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

  const handleToggleAyunan = useCallback(() => {
    if (simStatus === "idle" || simStatus === "paused") {
      setSimStatus("running");
    } else {
      setSimStatus("paused");
    }
  }, [simStatus]);

  const handleReset = useCallback(() => {
    setPanjang(BATAS_PANJANG.default);
    setMassa(BATAS_MASSA.default);
    setSudutAwal(BATAS_SUDUT_AWAL.default);
    setGravityPreset(DEFAULT_GRAVITY_PRESET);
    setMassBaruDiubah(false);
    resetSimulasi();
  }, [resetSimulasi]);

  const handleSimUpdate = useCallback(
    (state: {
      elapsed: number;
      running: boolean;
      oscillations: number;
    }) => {
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

  const tombolAyunanLabel =
    simStatus === "running" ? "Jeda" : simStatus === "paused" ? "Lanjutkan" : "Mulai Ayunan";

  const badge = arAktif ? (
    <Badge>Mode AR aktif</Badge>
  ) : (
    <Badge>Praktikum Interaktif</Badge>
  );

  const scene = (
    <>
      <SimplePendulumScene
        lengthM={panjang}
        massKg={massa}
        initialAngleDeg={sudutAwal}
        gravityMs2={gravitasi}
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
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">Panjang tali</span>
          <span className="text-muted-foreground tabular-nums">
            {panjang.toFixed(2)} m
          </span>
        </div>
        <Slider
          min={BATAS_PANJANG.min}
          max={BATAS_PANJANG.max}
          step={BATAS_PANJANG.step}
          value={[panjang]}
          onValueChange={(v) => ubahPanjang(Array.isArray(v) ? v[0] : v)}
          aria-label="Panjang tali bandul"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">Massa bandul</span>
          <span className="text-muted-foreground tabular-nums">
            {massa.toFixed(2)} kg
          </span>
        </div>
        <Slider
          min={BATAS_MASSA.min}
          max={BATAS_MASSA.max}
          step={BATAS_MASSA.step}
          value={[massa]}
          onValueChange={(v) => {
            setMassa(Array.isArray(v) ? v[0] : v);
            setMassBaruDiubah(true);
          }}
          aria-label="Massa bandul"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">Sudut awal</span>
          <span
            className="text-muted-foreground tabular-nums"
            aria-label={`Sudut awal ${sudutAwal} derajat`}
          >
            {sudutAwal}°
          </span>
        </div>
        <Slider
          min={BATAS_SUDUT_AWAL.min}
          max={BATAS_SUDUT_AWAL.max}
          step={BATAS_SUDUT_AWAL.step}
          value={[sudutAwal]}
          onValueChange={(v) => ubahSudutAwal(Array.isArray(v) ? v[0] : v)}
          aria-label="Sudut awal bandul"
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
          onClick={handleToggleAyunan}
          aria-label={tombolAyunanLabel}
        >
          {tombolAyunanLabel}
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
      quickInfo={<SimplePendulumQuickInfo items={quickItems} />}
      mobileQuickInfoBelowScene
      controls={controls}
      guide={
        <PanduanLangkah
          langkah={langkah}
          arAktif={arAktif}
          bandulSederhana
        />
      }
      arButton={arButton}
    />
  );
}
