"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Rotate3d,
} from "lucide-react";
import type { Modul, LangkahPraktikum } from "@/db/schema";
import { ModelViewer, type ArStatus } from "@/components/model-viewer";
import { NewtonPraktikum } from "@/components/praktikum/newton/newton-praktikum";
import { LksPanel } from "@/components/praktikum/lks-panel";
import { isNewtonModul } from "@/lib/modul-utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/** Instruksi global saat pengguna berada di viewer 3D (belum masuk AR). */
const INSTRUKSI_3D = {
  judul: "Amati Model 3D",
  deskripsi:
    "Putar model dengan satu jari, cubit untuk memperbesar, lalu ikuti langkah praktikum dan isi LKS.",
} as const;

/** Instruksi praktikum interaktif Hukum Newton (mode 3D, bukan AR). */
const INSTRUKSI_NEWTON_3D = {
  judul: "Simulasi Gaya & Gerak",
  deskripsi:
    "Atur massa dan gaya dengan slider, baca percepatan (a = F/m), lalu tekan Dorong untuk menggerakkan balok di lintasan.",
} as const;

/** Instruksi global saat sesi AR aktif (setelah tombol "Lihat di Meja"). */
const INSTRUKSI_AR = {
  judul: "Arahkan Kamera ke Meja",
  deskripsi:
    "Gerakkan HP perlahan ke permukaan meja yang datar dan cukup terang sampai alat 3D muncul.",
} as const;

/** Langkah yang meminta penempatan AR — teksnya diganti sesuai mode tampilan. */
function isLangkahPenempatanAr(l: LangkahPraktikum): boolean {
  const teks = `${l.judul ?? ""} ${l.instruksi}`.toLowerCase();
  return /kamera|meja|arahkan/.test(teks);
}

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
          interaktif={newton && !arAktif}
        />
      </header>

      {/* Split-screen: AR/3D di atas (mobile) atau kiri (desktop), panel di sisi lain */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <section
          className={cn(
            "relative shrink-0 bg-gradient-to-b from-muted/60 to-muted",
            newton
              ? "h-[min(60svh,calc(100svh-3.5rem-34svh))] max-h-[62svh] min-h-0 max-lg:overflow-hidden lg:h-auto lg:max-h-none lg:min-h-0 lg:flex-1"
              : "h-[45vh] lg:h-auto lg:flex-1",
          )}
        >
          {newton ? (
            <NewtonPraktikum
              modul={modul}
              arSupported={arTersedia}
              onArAvailability={setArTersedia}
              onArStatus={tanganiStatusAr}
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

          {!newton ? (
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
            newton
              ? "max-h-[min(36svh,calc(100svh-3.5rem-48svh))] flex-1 min-h-0 max-lg:shrink lg:max-h-none lg:min-h-0 lg:flex-1"
              : "flex-1",
          )}
        >
          <Tabs
            defaultValue="panduan"
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <div
              className={cn(
                "shrink-0 px-4 pt-3",
                newton && "max-lg:px-3 max-lg:pt-2",
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
                newton && "max-lg:p-3",
              )}
            >
              <PanduanLangkah
                langkah={langkah}
                arAktif={arAktif}
                newton={newton}
              />
            </TabsContent>

            <TabsContent
              value="lks"
              className={cn(
                "min-h-0 flex-1 overflow-y-auto p-4",
                newton && "max-lg:p-3",
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

function PanduanLangkah({
  langkah,
  arAktif,
  newton,
}: {
  langkah: LangkahPraktikum[];
  arAktif: boolean;
  newton: boolean;
}) {
  const total = langkah.length;
  const [idx, setIdx] = useState(0);
  const [selesai, setSelesai] = useState(false);

  const langkahAktif = langkah[idx];
  const persen = useMemo(
    () => (total > 0 ? Math.round(((idx + 1) / total) * 100) : 0),
    [idx, total],
  );

  // Untuk langkah penempatan AR, tampilkan instruksi sesuai mode tampilan saat ini.
  const tampil = useMemo(() => {
    if (!langkahAktif) return null;
    if (isLangkahPenempatanAr(langkahAktif)) {
      if (arAktif) return INSTRUKSI_AR;
      return newton ? INSTRUKSI_NEWTON_3D : INSTRUKSI_3D;
    }
    return { judul: langkahAktif.judul, deskripsi: langkahAktif.instruksi };
  }, [langkahAktif, arAktif, newton]);

  if (total === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Belum ada panduan langkah untuk modul ini.
      </p>
    );
  }

  if (selesai) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <CheckCircle2 className="size-14 text-primary" />
        <div>
          <h2 className="text-xl font-semibold">Praktikum Selesai!</h2>
          <p className="text-muted-foreground">
            Kamu telah menyelesaikan seluruh langkah. Jangan lupa isi LKS-mu ya.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setSelesai(false);
              setIdx(0);
            }}
          >
            Ulangi
          </Button>
          <Button render={<Link href="/siswa" />} nativeButton={false}>
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="font-medium text-muted-foreground">
            Langkah {idx + 1} dari {total}
          </span>
          <span className="text-muted-foreground">{persen}%</span>
        </div>
        <Progress value={persen} />
      </div>

      <div className="flex-1">
        {tampil?.judul ? (
          <h2 className="mb-2 text-lg font-semibold">{tampil.judul}</h2>
        ) : null}
        <p className="leading-relaxed text-foreground/90">{tampil?.deskripsi}</p>
      </div>

      <div className="mt-6 flex items-center justify-between gap-2">
        <Button
          variant="outline"
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0}
        >
          <ChevronLeft /> Sebelumnya
        </Button>
        {idx < total - 1 ? (
          <Button onClick={() => setIdx((i) => Math.min(total - 1, i + 1))}>
            Selanjutnya <ChevronRight />
          </Button>
        ) : (
          <Button
            onClick={() => {
              setSelesai(true);
              toast.success("Praktikum selesai! Kerja bagus. 🎉");
            }}
          >
            <CheckCircle2 /> Selesaikan
          </Button>
        )}
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
}: {
  arTersedia: boolean | null;
  arAktif: boolean;
  interaktif?: boolean;
}) {
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
