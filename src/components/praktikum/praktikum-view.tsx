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
import { LksPanel } from "@/components/praktikum/lks-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function PraktikumView({
  modul,
  langkah,
}: {
  modul: Modul;
  langkah: LangkahPraktikum[];
}) {
  const [arTersedia, setArTersedia] = useState<boolean | null>(null);
  const arGagalRef = useRef(false);

  function tanganiStatusAr(status: ArStatus) {
    // Bila sesi AR gagal (mis. izin kamera ditolak), beri tahu & tetap di 3D.
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
        <ModeBadge arTersedia={arTersedia} />
      </header>

      {/* Split-screen: AR/3D di atas (mobile) atau kiri (desktop), panel di sisi lain */}
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        <section className="relative h-[45vh] shrink-0 bg-gradient-to-b from-muted/60 to-muted lg:h-auto lg:flex-1">
          {modul.modelGlbUrl ? (
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

          <p className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-background/80 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            Geser untuk memutar · Cubit untuk memperbesar
          </p>

          {arTersedia === false ? (
            <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-start gap-2 rounded-lg bg-background/90 px-3 py-2 text-xs text-muted-foreground shadow-sm backdrop-blur">
              <Rotate3d className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                <span className="font-medium text-foreground">
                  Mode 3D 360° aktif.
                </span>{" "}
                Perangkatmu belum mendukung AR, tapi kamu tetap bisa memutar,
                memperbesar, dan mengamati alat dari segala sisi.
              </span>
            </div>
          ) : null}
        </section>

        {/* Panel bawah/samping: tab Panduan & LKS */}
        <aside className="flex flex-1 flex-col overflow-hidden border-t lg:max-w-md lg:border-l lg:border-t-0">
          <Tabs defaultValue="panduan" className="flex flex-1 flex-col overflow-hidden">
            <div className="px-4 pt-3">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="panduan">Panduan</TabsTrigger>
                <TabsTrigger value="lks">LKS</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="panduan"
              className="flex-1 overflow-y-auto p-4"
            >
              <PanduanLangkah langkah={langkah} />
            </TabsContent>

            <TabsContent value="lks" className="flex-1 overflow-y-auto p-4">
              <LksPanel moduleId={modul.id} />
            </TabsContent>
          </Tabs>
        </aside>
      </div>
    </div>
  );
}

function PanduanLangkah({ langkah }: { langkah: LangkahPraktikum[] }) {
  const total = langkah.length;
  const [idx, setIdx] = useState(0);
  const [selesai, setSelesai] = useState(false);

  const langkahAktif = langkah[idx];
  const persen = useMemo(
    () => (total > 0 ? Math.round(((idx + 1) / total) * 100) : 0),
    [idx, total],
  );

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
        {langkahAktif?.judul ? (
          <h2 className="mb-2 text-lg font-semibold">{langkahAktif.judul}</h2>
        ) : null}
        <p className="leading-relaxed text-foreground/90">
          {langkahAktif?.instruksi}
        </p>
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

function ModeBadge({ arTersedia }: { arTersedia: boolean | null }) {
  if (arTersedia === null) {
    return (
      <Badge variant="secondary" className="shrink-0">
        Menyiapkan…
      </Badge>
    );
  }
  return arTersedia ? (
    <Badge className="shrink-0">Mode AR tersedia</Badge>
  ) : (
    <Badge variant="secondary" className="shrink-0">
      Mode 3D 360°
    </Badge>
  );
}
