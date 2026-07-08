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
  checkThermalChangeArAssetsAvailable,
  getThermalChangeArButtonState,
  getThermalChangeArModelUrls,
  shouldMountThermalChangeArViewer,
  type ThermalChangeArAssetStatus,
} from "@/lib/thermal-change-assets";
import {
  BATAS_DAYA,
  BATAS_MASSA,
  BATAS_SUHU_AWAL,
  EFISIENSI_DEFAULT,
  SIM_SPEED_DEFAULT,
  SIM_SPEED_OPTIONS,
  SUHU_MAKSIMUM_C,
  THERMAL_MATERIALS,
  calculateThermalResult,
  comparisonResultStripDetail,
  getThermalMaterial,
  heatingResultStripDetail,
  quickInfoComparison,
  quickInfoHeating,
  type SimSpeedMultiplier,
  type ThermalExperimentMode,
  type ThermalMaterialId,
} from "@/lib/thermal-change-utils";
import { PracticumShell } from "@/components/praktikum/practicum-shell";
import { PanduanLangkah } from "@/components/praktikum/panduan-langkah";
import {
  PracticumResultStrip,
  useValueHighlight,
} from "@/components/praktikum/practicum-result-strip";
import { ThermalChangeScene } from "./thermal-change-scene";
import { ThermalChangeQuickInfo } from "./thermal-change-quick-info";
import {
  ThermalTemperatureChart,
  type ChartPoint,
} from "./thermal-temperature-chart";

export type ThermalSimStatus = "idle" | "running" | "paused" | "completed";

type ThermalChangePraktikumProps = {
  modul: Modul;
  langkah: LangkahPraktikum[];
  arSupported: boolean | null;
  onArAvailability: (supported: boolean) => void;
  onArStatus: (status: ArStatus) => void;
};

const PILIHAN_MODE: { id: ThermalExperimentMode; label: string }[] = [
  { id: "heating", label: "Pemanasan Zat" },
  { id: "comparison", label: "Bandingkan Zat" },
];

export function ThermalChangePraktikum({
  modul,
  langkah,
  arSupported,
  onArAvailability,
  onArStatus,
}: ThermalChangePraktikumProps) {
  const modelViewerRef = useRef<ModelViewerHandle>(null);
  const elapsedRealRef = useRef(0);
  const lastChartTimeRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const tickRef = useRef<(now: number) => void>(() => {});

  const [mode, setMode] = useState<ThermalExperimentMode>("heating");
  const [materialA, setMaterialA] = useState<ThermalMaterialId>("water");
  const [materialB, setMaterialB] = useState<ThermalMaterialId>("oil");
  const [massa, setMassa] = useState<number>(BATAS_MASSA.default);
  const [daya, setDaya] = useState<number>(BATAS_DAYA.default);
  const [suhuAwal, setSuhuAwal] = useState<number>(BATAS_SUHU_AWAL.default);
  const [simSpeed, setSimSpeed] = useState<SimSpeedMultiplier>(SIM_SPEED_DEFAULT);
  const [simStatus, setSimStatus] = useState<ThermalSimStatus>("idle");
  const [elapsedSimS, setElapsedSimS] = useState(0);
  const [chartPoints, setChartPoints] = useState<ChartPoint[]>([
    { timeS: 0, tempA: BATAS_SUHU_AWAL.default, tempB: BATAS_SUHU_AWAL.default },
  ]);
  const [arAktif, setArAktif] = useState(false);
  const [arAssets, setArAssets] = useState<ThermalChangeArAssetStatus | null>(
    null,
  );

  const matA = getThermalMaterial(materialA);
  const matB = getThermalMaterial(materialB);

  const hasilA = useMemo(
    () =>
      calculateThermalResult({
        materialId: materialA,
        massKg: massa,
        initialTemperatureC: suhuAwal,
        heaterPowerW: daya,
        efficiency: EFISIENSI_DEFAULT,
        elapsedTimeS: elapsedSimS,
      }),
    [materialA, massa, suhuAwal, daya, elapsedSimS],
  );

  const hasilB = useMemo(
    () =>
      calculateThermalResult({
        materialId: materialB,
        massKg: massa,
        initialTemperatureC: suhuAwal,
        heaterPowerW: daya,
        efficiency: EFISIENSI_DEFAULT,
        elapsedTimeS: elapsedSimS,
      }),
    [materialB, massa, suhuAwal, daya, elapsedSimS],
  );

  const strip = useMemo(
    () =>
      mode === "heating"
        ? heatingResultStripDetail(hasilA, matA)
        : comparisonResultStripDetail(
            matA,
            matB,
            hasilA.currentTemperatureC,
            hasilB.currentTemperatureC,
          ),
    [mode, hasilA, hasilB, matA, matB],
  );

  const resultHighlight = useValueHighlight(
    `${mode}-${hasilA.currentTemperatureC.toFixed(2)}-${hasilB.currentTemperatureC.toFixed(2)}-${massa}-${daya}`,
  );

  const quickItems = useMemo(
    () =>
      mode === "heating"
        ? quickInfoHeating(hasilA, matA, elapsedSimS)
        : quickInfoComparison(
            hasilA.currentTemperatureC,
            hasilB.currentTemperatureC,
            elapsedSimS,
          ),
    [mode, hasilA, hasilB, matA, elapsedSimS],
  );

  const arMaterial = materialA;
  const arUrls = useMemo(
    () => getThermalChangeArModelUrls(arMaterial),
    [arMaterial],
  );
  const arTombol = useMemo(
    () => getThermalChangeArButtonState(arAssets),
    [arAssets],
  );
  const arViewerSiap = shouldMountThermalChangeArViewer(arAssets);
  const arTombolAktif = arTombol.aktif && arSupported !== false;

  const heaterActive = simStatus === "running";

  useEffect(() => {
    let aktif = true;
    checkThermalChangeArAssetsAvailable(arMaterial).then((status) => {
      if (aktif) setArAssets(status);
    });
    return () => {
      aktif = false;
    };
  }, [arMaterial]);

  const resetSimulasi = useCallback(() => {
    elapsedRealRef.current = 0;
    lastChartTimeRef.current = 0;
    lastFrameRef.current = null;
    setElapsedSimS(0);
    setSimStatus("idle");
    setChartPoints([{ timeS: 0, tempA: suhuAwal, tempB: suhuAwal }]);
  }, [suhuAwal]);

  const ubahMode = useCallback(
    (m: ThermalExperimentMode) => {
      setMode(m);
      resetSimulasi();
    },
    [resetSimulasi],
  );

  const ubahParameter = useCallback(() => {
    resetSimulasi();
  }, [resetSimulasi]);

  const handleReset = useCallback(() => {
    setMode("heating");
    setMaterialA("water");
    setMaterialB("oil");
    setMassa(BATAS_MASSA.default);
    setDaya(BATAS_DAYA.default);
    setSuhuAwal(BATAS_SUHU_AWAL.default);
    setSimSpeed(SIM_SPEED_DEFAULT);
    elapsedRealRef.current = 0;
    lastChartTimeRef.current = 0;
    lastFrameRef.current = null;
    setElapsedSimS(0);
    setSimStatus("idle");
    setChartPoints([
      { timeS: 0, tempA: BATAS_SUHU_AWAL.default, tempB: BATAS_SUHU_AWAL.default },
    ]);
  }, []);

  useEffect(() => {
    tickRef.current = (now: number) => {
      if (simStatus !== "running") return;

      if (lastFrameRef.current !== null) {
        const dt = Math.min((now - lastFrameRef.current) / 1000, 0.05);
        elapsedRealRef.current += dt;
        const simT = elapsedRealRef.current * simSpeed;
        setElapsedSimS(simT);

        const resA = calculateThermalResult({
          materialId: materialA,
          massKg: massa,
          initialTemperatureC: suhuAwal,
          heaterPowerW: daya,
          efficiency: EFISIENSI_DEFAULT,
          elapsedTimeS: simT,
        });
        const resB = calculateThermalResult({
          materialId: materialB,
          massKg: massa,
          initialTemperatureC: suhuAwal,
          heaterPowerW: daya,
          efficiency: EFISIENSI_DEFAULT,
          elapsedTimeS: simT,
        });

        if (simT - lastChartTimeRef.current >= 0.5) {
          lastChartTimeRef.current = simT;
          setChartPoints((prev) => [
            ...prev,
            {
              timeS: simT,
              tempA: resA.currentTemperatureC,
              tempB: resB.currentTemperatureC,
            },
          ]);
        }

        const maxTemp = Math.max(
          resA.currentTemperatureC,
          mode === "comparison"
            ? resB.currentTemperatureC
            : resA.currentTemperatureC,
        );
        if (maxTemp >= SUHU_MAKSIMUM_C - 0.01) {
          setSimStatus("completed");
          toast.info("Suhu maksimum tercapai.");
          return;
        }
      }

      lastFrameRef.current = now;
      rafRef.current = requestAnimationFrame((t) => tickRef.current(t));
    };
  }, [simStatus, simSpeed, materialA, materialB, massa, suhuAwal, daya, mode]);

  useEffect(() => {
    if (simStatus === "running") {
      lastFrameRef.current = null;
      rafRef.current = requestAnimationFrame((t) => tickRef.current(t));
    }
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [simStatus]);

  const handleTogglePemanasan = useCallback(() => {
    if (simStatus === "completed") return;
    if (simStatus === "idle" || simStatus === "paused") {
      setSimStatus("running");
    } else {
      setSimStatus("paused");
    }
  }, [simStatus]);

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

  const tombolLabel =
    simStatus === "running"
      ? "Jeda"
      : simStatus === "paused"
        ? "Lanjutkan"
        : simStatus === "completed"
          ? "Selesai"
          : mode === "comparison"
            ? "Mulai Perbandingan"
            : "Mulai Pemanasan";

  const badge = arAktif ? (
    <Badge>Mode AR aktif</Badge>
  ) : simStatus === "completed" ? (
    <Badge variant="secondary">Suhu target tercapai</Badge>
  ) : (
    <Badge>Praktikum Interaktif</Badge>
  );

  const scene = (
    <>
      <ThermalChangeScene
        mode={mode}
        materialA={materialA}
        materialB={mode === "comparison" ? materialB : undefined}
        temperatureA={hasilA.currentTemperatureC}
        temperatureB={mode === "comparison" ? hasilB.currentTemperatureC : undefined}
        heaterActive={heaterActive}
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

  const materialSelector = (
    selected: ThermalMaterialId,
    onSelect: (id: ThermalMaterialId) => void,
    label: string,
  ) => (
    <div className="space-y-1.5">
      <span className="text-xs font-medium">{label}</span>
      <div className="-mx-0.5 flex gap-1.5 overflow-x-auto pb-0.5">
        {THERMAL_MATERIALS.map((m) => (
          <Button
            key={m.id}
            type="button"
            variant={selected === m.id ? "default" : "outline"}
            className="min-h-11 shrink-0 rounded-lg px-3 text-xs"
            onClick={() => {
              onSelect(m.id);
              ubahParameter();
            }}
            aria-pressed={selected === m.id}
          >
            {m.name}
          </Button>
        ))}
      </div>
    </div>
  );

  const controls = (
    <div className="space-y-3">
      <p className="text-xs font-semibold leading-snug">Kontrol Eksperimen</p>

      <div className="space-y-1.5">
        <span className="text-xs font-medium">Mode eksperimen</span>
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

      {mode === "heating"
        ? materialSelector(materialA, setMaterialA, "Jenis zat")
        : (
          <>
            {materialSelector(materialA, setMaterialA, "Zat A")}
            {materialSelector(materialB, setMaterialB, "Zat B")}
          </>
        )}

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">Massa</span>
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
            ubahParameter();
          }}
          aria-label="Massa zat"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">Daya pemanas</span>
          <span className="text-muted-foreground tabular-nums">{daya} W</span>
        </div>
        <Slider
          min={BATAS_DAYA.min}
          max={BATAS_DAYA.max}
          step={BATAS_DAYA.step}
          value={[daya]}
          onValueChange={(v) => {
            setDaya(Array.isArray(v) ? v[0] : v);
            ubahParameter();
          }}
          aria-label="Daya pemanas"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">Suhu awal</span>
          <span className="text-muted-foreground tabular-nums">{suhuAwal}°C</span>
        </div>
        <Slider
          min={BATAS_SUHU_AWAL.min}
          max={BATAS_SUHU_AWAL.max}
          step={BATAS_SUHU_AWAL.step}
          value={[suhuAwal]}
          onValueChange={(v) => {
            setSuhuAwal(Array.isArray(v) ? v[0] : v);
            ubahParameter();
          }}
          aria-label="Suhu awal"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">Kecepatan simulasi</span>
          <span className="text-muted-foreground">{simSpeed}×</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 rounded-xl border bg-muted/40 p-1">
          {SIM_SPEED_OPTIONS.map((s) => (
            <Button
              key={s}
              type="button"
              variant={simSpeed === s ? "default" : "outline"}
              className="min-h-11 rounded-lg text-xs"
              onClick={() => {
                setSimSpeed(s);
                ubahParameter();
              }}
              aria-pressed={simSpeed === s}
            >
              {s}×
            </Button>
          ))}
        </div>
      </div>

      <ThermalTemperatureChart
        points={chartPoints}
        mode={mode}
        labelA={matA.name}
        labelB={matB.name}
        compact
      />

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
          onClick={handleTogglePemanasan}
          disabled={simStatus === "completed"}
          aria-label={tombolLabel}
        >
          {tombolLabel}
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
      quickInfo={<ThermalChangeQuickInfo items={quickItems} />}
      mobileQuickInfoBelowScene
      controls={controls}
      guide={
        <PanduanLangkah langkah={langkah} arAktif={arAktif} thermalChange />
      }
      arButton={arButton}
    />
  );
}
