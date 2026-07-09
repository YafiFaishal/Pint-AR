"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { SimulationArActionButton } from "@/components/praktikum/simulation-action-button";
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
import {
  checkRangkaianArAssetsAvailable,
  getRangkaianArButtonState,
  getRangkaianArModelUrls,
  shouldMountRangkaianArViewer,
  type RangkaianArAssetStatus,
} from "@/lib/rangkaian-assets";
import { PracticumShell } from "@/components/praktikum/practicum-shell";
import { PanduanLangkah } from "@/components/praktikum/panduan-langkah";
import { PracticumQuickInfo } from "@/components/praktikum/practicum-quick-info";
import {
  PracticumResultStrip,
  useValueHighlight,
} from "@/components/praktikum/practicum-result-strip";
import { RangkaianScene } from "./rangkaian-scene";

type RangkaianPraktikumProps = {
  modul: Modul;
  langkah: LangkahPraktikum[];
  arSupported: boolean | null;
  onArAvailability: (supported: boolean) => void;
  onArStatus: (status: ArStatus) => void;
};

export function RangkaianPraktikum({
  modul,
  langkah,
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

  const arUrls = getRangkaianArModelUrls();
  const arus = tegangan / hambatan;
  const rangkaianTerbuka = !saklarMenyala;
  const resultHighlight = useValueHighlight(
    `${tegangan}-${hambatan}-${saklarMenyala}-${arus.toFixed(2)}`,
  );

  const arTombol = useMemo(
    () => getRangkaianArButtonState(arAssets),
    [arAssets],
  );
  const arViewerSiap = shouldMountRangkaianArViewer(arAssets);
  const arTombolAktif = arTombol.aktif && arSupported !== false;

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

  const badge = arAktif ? (
    <Badge>Mode AR aktif</Badge>
  ) : (
    <SimulasiInteraktifBadge />
  );

  const scene = (
    <>
      <RangkaianScene
        saklarMenyala={saklarMenyala}
        tegangan={tegangan}
        hambatan={hambatan}
        arus={arus}
        rangkaianTerbuka={rangkaianTerbuka}
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

      <div className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Tegangan</span>
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
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Hambatan</span>
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

      <PracticumResultStrip
        label="Arus"
        value={`${arus.toFixed(2)} A`}
        detail={`V ${tegangan} V · R ${hambatan} Ω`}
        status={`${
          rangkaianTerbuka
            ? "Rangkaian terbuka — arus tidak mengalir"
            : "Rangkaian tertutup — arus mengalir"
        } · Lampu ${saklarMenyala ? "menyala" : "mati"}`}
        highlight={resultHighlight}
      />
    </div>
  );

  const arButton = (
    <SimulationArActionButton
      onClick={handleLihatDiMeja}
      active={arTombolAktif}
    />
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
            { key: "v", label: "V", value: `${tegangan} V` },
            { key: "r", label: "R", value: `${hambatan} Ω` },
            { key: "i", label: "I", value: `${arus.toFixed(2)} A` },
            {
              key: "saklar",
              label: "Saklar",
              value: saklarMenyala ? "ON" : "OFF",
              valueClassName: saklarMenyala
                ? "text-muted-foreground"
                : "text-muted-foreground",
            },
          ]}
        />
      }
      mobileQuickInfoBelowScene
      controls={controls}
      guide={
        <PanduanLangkah
          langkah={langkah}
          arAktif={arAktif}
          rangkaian
        />
      }
      arButton={arButton}
      arHint={arTombol.petunjuk}
    />
  );
}
