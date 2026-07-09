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
  checkArchimedesArAssetsAvailable,
  getArchimedesArButtonState,
  getArchimedesArModelUrls,
  shouldMountArchimedesArViewer,
  type ArchimedesArAssetStatus,
} from "@/lib/hukum-archimedes-assets";
import {
  archimedesResultStripDetail,
  BATAS_MASSA,
  BATAS_VOLUME,
  calculateArchimedesResult,
  densityFromJenisCairan,
  formatDensity,
  formatForce,
  formatVolumeM3,
  labelKondisi,
  PILIHAN_CAIRAN,
  type BentukBenda,
  type JenisCairan,
} from "@/lib/archimedes-utils";
import { PracticumShell } from "@/components/praktikum/practicum-shell";
import { PanduanLangkah } from "@/components/praktikum/panduan-langkah";
import { PracticumQuickInfo } from "@/components/praktikum/practicum-quick-info";
import {
  PracticumResultStrip,
  useValueHighlight,
} from "@/components/praktikum/practicum-result-strip";
import { HukumArchimedesScene } from "./hukum-archimedes-scene";

type HukumArchimedesPraktikumProps = {
  modul: Modul;
  langkah: LangkahPraktikum[];
  arSupported: boolean | null;
  onArAvailability: (supported: boolean) => void;
  onArStatus: (status: ArStatus) => void;
};

const PILIHAN_BENTUK: { id: BentukBenda; label: string }[] = [
  { id: "kubus", label: "Kubus" },
  { id: "bola", label: "Bola" },
];

export function HukumArchimedesPraktikum({
  modul,
  langkah,
  arSupported,
  onArAvailability,
  onArStatus,
}: HukumArchimedesPraktikumProps) {
  const modelViewerRef = useRef<ModelViewerHandle>(null);
  const [massa, setMassa] = useState(BATAS_MASSA.default);
  const [volume, setVolume] = useState(BATAS_VOLUME.default);
  const [jenisCairan, setJenisCairan] = useState<JenisCairan>("air");
  const [bentuk, setBentuk] = useState<BentukBenda>("kubus");
  const [dropSignal, setDropSignal] = useState(0);
  const [resetSignal, setResetSignal] = useState(0);
  const [eksperimenAktif, setEksperimenAktif] = useState(false);
  const [arAktif, setArAktif] = useState(false);
  const [arAssets, setArAssets] = useState<ArchimedesArAssetStatus | null>(null);

  const arUrls = getArchimedesArModelUrls();
  const rhoCairan = densityFromJenisCairan(jenisCairan);
  const hasil = useMemo(
    () =>
      calculateArchimedesResult({
        massKg: massa,
        volumeM3: volume,
        liquidDensityKgM3: rhoCairan,
      }),
    [massa, volume, rhoCairan],
  );

  const resultHighlight = useValueHighlight(
    `${hasil.condition}-${hasil.weightN.toFixed(1)}-${hasil.buoyantForceN.toFixed(1)}-${eksperimenAktif}`,
  );

  const arTombol = useMemo(
    () => getArchimedesArButtonState(arAssets),
    [arAssets],
  );
  const arViewerSiap = shouldMountArchimedesArViewer(arAssets);
  const arTombolAktif = arTombol.aktif && arSupported !== false;

  useEffect(() => {
    let aktif = true;
    checkArchimedesArAssetsAvailable().then((status) => {
      if (aktif) setArAssets(status);
    });
    return () => {
      aktif = false;
    };
  }, []);

  const handleMasukkan = useCallback(() => {
    setEksperimenAktif(true);
    setDropSignal((n) => n + 1);
  }, []);

  const handleReset = useCallback(() => {
    setMassa(BATAS_MASSA.default);
    setVolume(BATAS_VOLUME.default);
    setJenisCairan("air");
    setBentuk("kubus");
    setEksperimenAktif(false);
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
    <SimulasiInteraktifBadge />
  );

  const scene = (
    <>
      <HukumArchimedesScene
        volumeM3={volume}
        bentuk={bentuk}
        jenisCairan={jenisCairan}
        result={hasil}
        dropSignal={dropSignal}
        resetSignal={resetSignal}
        eksperimenAktif={eksperimenAktif}
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
          <span className="font-medium">Massa benda</span>
          <span className="text-muted-foreground tabular-nums">
            {massa.toFixed(1)} kg
          </span>
        </div>
        <Slider
          min={BATAS_MASSA.min}
          max={BATAS_MASSA.max}
          step={BATAS_MASSA.step}
          value={[massa]}
          onValueChange={(v) => setMassa(Array.isArray(v) ? v[0] : v)}
          aria-label="Massa benda"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">Volume benda</span>
          <span className="text-muted-foreground tabular-nums">
            {formatVolumeM3(volume)}
          </span>
        </div>
        <Slider
          min={BATAS_VOLUME.min}
          max={BATAS_VOLUME.max}
          step={BATAS_VOLUME.step}
          value={[volume]}
          onValueChange={(v) => setVolume(Array.isArray(v) ? v[0] : v)}
          aria-label="Volume benda"
        />
      </div>

      <div className="space-y-1.5">
        <span className="text-xs font-medium leading-snug">Jenis cairan</span>
        <div className="grid grid-cols-3 gap-1.5 rounded-xl border bg-muted/40 p-1">
          {PILIHAN_CAIRAN.map((c) => (
            <Button
              key={c.id}
              type="button"
              variant={jenisCairan === c.id ? "default" : "outline"}
              className="min-h-10 rounded-lg px-1 text-[10px] sm:text-xs"
              onClick={() => setJenisCairan(c.id)}
              aria-pressed={jenisCairan === c.id}
            >
              {c.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <span className="text-xs font-medium leading-snug">Bentuk benda</span>
        <div className="grid grid-cols-2 gap-2 rounded-xl border bg-muted/40 p-1">
          {PILIHAN_BENTUK.map((b) => (
            <Button
              key={b.id}
              type="button"
              variant={bentuk === b.id ? "default" : "outline"}
              className="min-h-10 rounded-lg text-xs"
              onClick={() => setBentuk(b.id)}
              aria-pressed={bentuk === b.id}
            >
              {b.label}
            </Button>
          ))}
        </div>
      </div>

      <PracticumResultStrip
        label="Kondisi"
        value={labelKondisi(hasil.condition)}
        detail={`W ${formatForce(hasil.weightN)} · Fₐ ${formatForce(hasil.buoyantForceN)}`}
        status={archimedesResultStripDetail(hasil)}
        highlight={resultHighlight}
      />

      <div className="grid grid-cols-2 gap-2.5">
        <Button className="min-h-12" onClick={handleMasukkan}>
          Masukkan Benda
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
      quickInfo={
        <PracticumQuickInfo
          columns={4}
          items={[
            {
              key: "rho-benda",
              label: "ρ benda",
              value: formatDensity(hasil.objectDensityKgM3),
            },
            {
              key: "rho-cairan",
              label: "ρ cairan",
              value: formatDensity(hasil.liquidDensityKgM3),
            },
            {
              key: "fa",
              label: "Fₐ",
              value: formatForce(hasil.buoyantForceN),
            },
            {
              key: "kondisi",
              label: "Kondisi",
              value: labelKondisi(hasil.condition),
            },
          ]}
        />
      }
      mobileQuickInfoBelowScene
      controls={controls}
      guide={
        <PanduanLangkah langkah={langkah} arAktif={arAktif} archimedes />
      }
      arButton={arButton}
    />
  );
}
