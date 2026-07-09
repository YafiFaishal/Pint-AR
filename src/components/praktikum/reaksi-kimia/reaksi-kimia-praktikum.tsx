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
  checkReaksiKimiaArAssetsAvailable,
  getReaksiKimiaArButtonState,
  getReaksiKimiaArModelUrls,
  shouldMountReaksiKimiaArViewer,
  type ReaksiKimiaArAssetStatus,
} from "@/lib/reaksi-kimia-assets";
import {
  BATAS_VOLUME,
  hitungHasilReaksi,
  hitungKondisiAwal,
  namaJenisReaksi,
  type JenisReaksi,
} from "@/lib/reaksi-kimia-utils";
import { PracticumShell } from "@/components/praktikum/practicum-shell";
import { PanduanLangkah } from "@/components/praktikum/panduan-langkah";
import { PracticumQuickInfo } from "@/components/praktikum/practicum-quick-info";
import {
  PracticumResultStrip,
  useValueHighlight,
} from "@/components/praktikum/practicum-result-strip";
import { ReaksiKimiaScene } from "./reaksi-kimia-scene";

type ReaksiKimiaPraktikumProps = {
  modul: Modul;
  langkah: LangkahPraktikum[];
  arSupported: boolean | null;
  onArAvailability: (supported: boolean) => void;
  onArStatus: (status: ArStatus) => void;
};

const PILIHAN_REAKSI: { id: JenisReaksi; label: string }[] = [
  { id: "netralisasi", label: "Netralisasi" },
  { id: "eksoterm", label: "Eksoterm" },
  { id: "indikator", label: "Indikator pH" },
];

export function ReaksiKimiaPraktikum({
  modul,
  langkah,
  arSupported,
  onArAvailability,
  onArStatus,
}: ReaksiKimiaPraktikumProps) {
  const modelViewerRef = useRef<ModelViewerHandle>(null);
  const [volumeA, setVolumeA] = useState(50);
  const [volumeB, setVolumeB] = useState(50);
  const [jenis, setJenis] = useState<JenisReaksi>("netralisasi");
  const [campurSignal, setCampurSignal] = useState(0);
  const [resetSignal, setResetSignal] = useState(0);
  const [sudahCampur, setSudahCampur] = useState(false);
  const [arAktif, setArAktif] = useState(false);
  const [arAssets, setArAssets] = useState<ReaksiKimiaArAssetStatus | null>(null);

  const arUrls = getReaksiKimiaArModelUrls();
  const kondisiAwal = hitungKondisiAwal(jenis);
  const hasilTarget = hitungHasilReaksi(volumeA, volumeB, jenis);
  const tampilan = sudahCampur ? hasilTarget : kondisiAwal;
  const resultHighlight = useValueHighlight(
    `${tampilan.ph}-${tampilan.suhu}-${tampilan.status}-${sudahCampur}`,
  );

  const arTombol = useMemo(
    () => getReaksiKimiaArButtonState(arAssets),
    [arAssets],
  );
  const arViewerSiap = shouldMountReaksiKimiaArViewer(arAssets);
  const arTombolAktif = arTombol.aktif && arSupported !== false;

  useEffect(() => {
    let aktif = true;
    checkReaksiKimiaArAssetsAvailable().then((status) => {
      if (aktif) setArAssets(status);
    });
    return () => {
      aktif = false;
    };
  }, []);

  const handleCampurkan = useCallback(() => {
    setSudahCampur(true);
    setCampurSignal((n) => n + 1);
  }, []);

  const handleReset = useCallback(() => {
    setSudahCampur(false);
    setResetSignal((n) => n + 1);
  }, []);

  const handleJenisChange = useCallback((baru: JenisReaksi) => {
    setJenis(baru);
    setSudahCampur(false);
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
      <ReaksiKimiaScene
        volumeA={volumeA}
        volumeB={volumeB}
        jenis={jenis}
        campurSignal={campurSignal}
        resetSignal={resetSignal}
        hasilTarget={hasilTarget}
        sudahCampur={sudahCampur}
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
          <span className="font-medium">Volume larutan A</span>
          <span className="text-muted-foreground tabular-nums">{volumeA} mL</span>
        </div>
        <Slider
          min={BATAS_VOLUME.min}
          max={BATAS_VOLUME.max}
          step={5}
          value={[volumeA]}
          onValueChange={(v) => setVolumeA(Array.isArray(v) ? v[0] : v)}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">Volume larutan B</span>
          <span className="text-muted-foreground tabular-nums">{volumeB} mL</span>
        </div>
        <Slider
          min={BATAS_VOLUME.min}
          max={BATAS_VOLUME.max}
          step={5}
          value={[volumeB]}
          onValueChange={(v) => setVolumeB(Array.isArray(v) ? v[0] : v)}
        />
      </div>

      <div className="space-y-1.5">
        <span className="text-xs font-medium leading-snug">Jenis reaksi</span>
        <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-3">
          {PILIHAN_REAKSI.map(({ id, label }) => (
            <Button
              key={id}
              type="button"
              variant={jenis === id ? "default" : "outline"}
              className="min-h-10 text-xs"
              onClick={() => handleJenisChange(id)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <PracticumResultStrip
        label="pH"
        value={tampilan.ph.toFixed(1)}
        detail={`Suhu ${tampilan.suhu.toFixed(0)}°C`}
        status={tampilan.status}
        highlight={resultHighlight}
      />

      <div className="grid grid-cols-2 gap-2.5">
        <Button className="min-h-12" onClick={handleCampurkan}>
          Campurkan
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
            { key: "ph", label: "pH", value: tampilan.ph.toFixed(1) },
            {
              key: "suhu",
              label: "Suhu",
              value: `${tampilan.suhu.toFixed(0)}°C`,
            },
            {
              key: "warna",
              label: "Warna",
              value: tampilan.labelWarna,
            },
            {
              key: "jenis",
              label: "Reaksi",
              value: namaJenisReaksi(jenis),
            },
          ]}
        />
      }
      mobileQuickInfoBelowScene
      controls={controls}
      guide={
        <PanduanLangkah langkah={langkah} arAktif={arAktif} reaksiKimia />
      }
      arButton={arButton}
    />
  );
}
