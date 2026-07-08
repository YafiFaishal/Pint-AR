"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Rotate3d } from "lucide-react";
import type { Modul, LangkahPraktikum } from "@/db/schema";
import { ModelViewer, type ArStatus } from "@/components/model-viewer";
import { ReaksiKimiaPraktikum } from "@/components/praktikum/reaksi-kimia/reaksi-kimia-praktikum";
import { HookesLawPraktikum } from "@/components/praktikum/hukum-hooke/hookes-law-praktikum";
import { ThermalChangePraktikum } from "@/components/praktikum/kalor-perubahan-suhu/thermal-change-praktikum";
import { HukumArchimedesPraktikum } from "@/components/praktikum/hukum-archimedes/hukum-archimedes-praktikum";
import { LightOpticsPraktikum } from "@/components/praktikum/cahaya-optik/light-optics-praktikum";
import { SimplePendulumPraktikum } from "@/components/praktikum/bandul-sederhana/simple-pendulum-praktikum";
import { JatuhBebasPraktikum } from "@/components/praktikum/jatuh-bebas/jatuh-bebas-praktikum";
import { NewtonPraktikum } from "@/components/praktikum/newton/newton-praktikum";
import { RangkaianPraktikum } from "@/components/praktikum/rangkaian/rangkaian-praktikum";
import { TataSuryaPraktikum } from "@/components/praktikum/tata-surya/tata-surya-praktikum";
import { PraktikumPlaceholder } from "@/components/praktikum/praktikum-placeholder";
import { LksPanel } from "@/components/praktikum/lks-panel";
import {
  INSTRUKSI_3D,
  INSTRUKSI_AR,
  PanduanLangkah,
} from "@/components/praktikum/panduan-langkah";
import {
  isArchimedesModul,
  isBandulSederhanaModul,
  isCahayaOptikModul,
  isHookeSpringModul,
  isThermalChangeModul,
  isJatuhBebasModul,
  isModulBelumSiap,
  isNewtonModul,
  isPraktikumInteraktif,
  isRangkaianModul,
  isReaksiKimiaModul,
  isTataSuryaModul,
} from "@/lib/modul-utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function PraktikumView({
  modul,
  langkah,
}: {
  modul: Modul;
  langkah: LangkahPraktikum[];
}) {
  const [arTersedia, setArTersedia] = useState<boolean | null>(null);
  const [arAktif, setArAktif] = useState(false);
  const arGagalRef = useRef(false);
  const newton = isNewtonModul(modul);
  const rangkaian = isRangkaianModul(modul);
  const tataSurya = isTataSuryaModul(modul);
  const jatuhBebas = isJatuhBebasModul(modul);
  const reaksiKimia = isReaksiKimiaModul(modul);
  const archimedes = isArchimedesModul(modul);
  const cahayaOptik = isCahayaOptikModul(modul);
  const bandulSederhana = isBandulSederhanaModul(modul);
  const hookeSpring = isHookeSpringModul(modul);
  const thermalChange = isThermalChangeModul(modul);
  const interaktif = isPraktikumInteraktif(modul);
  const belumSiap = isModulBelumSiap(modul);

  function tanganiStatusAr(status: ArStatus) {
    if (status === "session-started" || status === "object-placed") {
      setArAktif(true);
    }
    if (status === "not-presenting" || status === "failed") {
      setArAktif(false);
    }
    if (status === "failed" && !arGagalRef.current) {
      arGagalRef.current = true;
      toast.info("Mode AR tidak dapat dibuka. Menampilkan tampilan 3D 360°.");
    }
  }

  if (tataSurya) {
    return (
      <TataSuryaPraktikum
        modul={modul}
        langkah={langkah}
        arSupported={arTersedia}
        onArAvailability={setArTersedia}
        onArStatus={tanganiStatusAr}
      />
    );
  }

  if (rangkaian) {
    return (
      <RangkaianPraktikum
        modul={modul}
        langkah={langkah}
        arSupported={arTersedia}
        onArAvailability={setArTersedia}
        onArStatus={tanganiStatusAr}
      />
    );
  }

  if (newton) {
    return (
      <NewtonPraktikum
        modul={modul}
        langkah={langkah}
        arSupported={arTersedia}
        onArAvailability={setArTersedia}
        onArStatus={tanganiStatusAr}
      />
    );
  }

  if (jatuhBebas) {
    return (
      <JatuhBebasPraktikum
        modul={modul}
        langkah={langkah}
        arSupported={arTersedia}
        onArAvailability={setArTersedia}
        onArStatus={tanganiStatusAr}
      />
    );
  }

  if (reaksiKimia) {
    return (
      <ReaksiKimiaPraktikum
        modul={modul}
        langkah={langkah}
        arSupported={arTersedia}
        onArAvailability={setArTersedia}
        onArStatus={tanganiStatusAr}
      />
    );
  }

  if (archimedes) {
    return (
      <HukumArchimedesPraktikum
        modul={modul}
        langkah={langkah}
        arSupported={arTersedia}
        onArAvailability={setArTersedia}
        onArStatus={tanganiStatusAr}
      />
    );
  }

  if (cahayaOptik) {
    return (
      <LightOpticsPraktikum
        modul={modul}
        langkah={langkah}
        arSupported={arTersedia}
        onArAvailability={setArTersedia}
        onArStatus={tanganiStatusAr}
      />
    );
  }

  if (bandulSederhana) {
    return (
      <SimplePendulumPraktikum
        modul={modul}
        langkah={langkah}
        arSupported={arTersedia}
        onArAvailability={setArTersedia}
        onArStatus={tanganiStatusAr}
      />
    );
  }

  if (hookeSpring) {
    return (
      <HookesLawPraktikum
        modul={modul}
        langkah={langkah}
        arSupported={arTersedia}
        onArAvailability={setArTersedia}
        onArStatus={tanganiStatusAr}
      />
    );
  }

  if (thermalChange) {
    return (
      <ThermalChangePraktikum
        modul={modul}
        langkah={langkah}
        arSupported={arTersedia}
        onArAvailability={setArTersedia}
        onArStatus={tanganiStatusAr}
      />
    );
  }

  return (
    <div className="flex h-dvh flex-col">
      {/* Bilah atas */}
      <header className="flex items-center justify-between gap-3 border-b px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            render={<Link href="/siswa" />}
            nativeButton={false}
            variant="ghost"
            size="icon-sm"
            aria-label="Kembali"
          >
            <ArrowLeft />
          </Button>
          <span className="truncate font-semibold">{modul.judul}</span>
        </div>
        <ModeBadge
          arTersedia={arTersedia}
          arAktif={arAktif}
          interaktif={interaktif && !arAktif}
          belumSiap={belumSiap}
        />
      </header>

      {/* Split-screen: AR/3D di atas (mobile) atau kiri (desktop), panel di sisi lain */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <section
          className={cn(
            "relative shrink-0 bg-gradient-to-b from-muted/60 to-muted",
            !interaktif && "h-[45vh] lg:h-auto lg:flex-1",
          )}
        >
          {belumSiap ? (
            <PraktikumPlaceholder
              judul={modul.judul}
              deskripsi={modul.deskripsi}
            />
          ) : modul.modelGlbUrl ? (
            <ModelViewer
              src={modul.modelGlbUrl}
              iosSrc={modul.modelUsdzUrl ?? undefined}
              alt={`Model 3D: ${modul.judul}`}
              onArAvailability={setArTersedia}
              onArStatus={tanganiStatusAr}
              className="h-full w-full"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
              Model 3D untuk modul ini belum tersedia.
            </div>
          )}

          {!interaktif ? (
            <ModeInstruksiOverlay
              arAktif={arAktif}
              arTersedia={arTersedia}
            />
          ) : null}
        </section>

        {/* Panel bawah/samping: tab Panduan & LKS */}
        <aside
          className={cn(
            "flex min-h-0 flex-col overflow-hidden border-t lg:max-w-md lg:border-l lg:border-t-0",
            !interaktif && "flex-1",
          )}
        >
          <Tabs
            defaultValue="panduan"
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <div
              className={cn(
                "shrink-0 px-4 pt-3",
                interaktif && "max-lg:px-3 max-lg:pt-2",
              )}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="panduan">Panduan</TabsTrigger>
                <TabsTrigger value="lks">LKS</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="panduan"
              className={cn(
                "min-h-0 flex-1 overflow-y-auto p-4",
                interaktif && "max-lg:p-3",
              )}
            >
              <PanduanLangkah
                langkah={langkah}
                arAktif={arAktif}
              />
            </TabsContent>

            <TabsContent
              value="lks"
              className={cn(
                "min-h-0 flex-1 overflow-y-auto p-4",
                interaktif && "max-lg:p-3",
              )}
            >
              <LksPanel moduleId={modul.id} />
            </TabsContent>
          </Tabs>
        </aside>
      </div>
    </div>
  );
}

function ModeInstruksiOverlay({
  arAktif,
  arTersedia,
}: {
  arAktif: boolean;
  arTersedia: boolean | null;
}) {
  const instruksi = arAktif ? INSTRUKSI_AR : INSTRUKSI_3D;

  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-lg border bg-background/95 px-3 py-2.5 shadow-sm backdrop-blur">
      <div className="flex items-start gap-2">
        {!arAktif ? (
          <Rotate3d className="mt-0.5 size-4 shrink-0 text-primary" />
        ) : null}
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-snug">{instruksi.judul}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {instruksi.deskripsi}
          </p>
          {!arAktif && arTersedia === false ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Perangkat ini memakai mode 3D 360° (AR tidak didukung).
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ModeBadge({
  arTersedia,
  arAktif,
  interaktif,
  belumSiap,
}: {
  arTersedia: boolean | null;
  arAktif: boolean;
  interaktif?: boolean;
  belumSiap?: boolean;
}) {
  if (belumSiap) {
    return (
      <Badge variant="outline" className="shrink-0">
        Segera Hadir
      </Badge>
    );
  }
  if (arAktif) {
    return <Badge className="shrink-0">Mode AR aktif</Badge>;
  }
  if (interaktif) {
    return <Badge className="shrink-0">Praktikum Interaktif</Badge>;
  }
  if (arTersedia === null) {
    return (
      <Badge variant="secondary" className="shrink-0">
        Menyiapkan…
      </Badge>
    );
  }
  return arTersedia ? (
    <Badge variant="secondary" className="shrink-0">
      Mode 3D
    </Badge>
  ) : (
    <Badge variant="secondary" className="shrink-0">
      Mode 3D 360°
    </Badge>
  );
}
