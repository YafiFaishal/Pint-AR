"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Box,
  ChevronRight,
  ClipboardList,
  ScanLine,
  Star,
} from "lucide-react";
import type {
  ModulDashboardItem,
  RingkasanProgres,
} from "@/lib/siswa-dashboard-data";
import { setLastModule, getLastModule } from "@/lib/last-module-storage";
import {
  REKOMENDASI_MODUL_JUDUL,
  cocokFilter,
  tombolAksiModul,
  type FilterModul,
  type StatusModul,
} from "@/lib/siswa-modul-utils";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const FILTER_OPSI: FilterModul[] = [
  "Semua",
  "Fisika",
  "Kimia",
  "Astronomi",
  "Belum selesai",
];

function statusVariant(
  status: StatusModul,
): "default" | "secondary" | "outline" {
  switch (status) {
    case "Sudah dinilai":
      return "default";
    case "LKS selesai":
      return "secondary";
    default:
      return "outline";
  }
}

function arInfoPesan(): string {
  if (typeof navigator === "undefined") {
    return "Gunakan perangkat mobile untuk pengalaman AR.";
  }
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua);
  const android = /Android/.test(ua);

  if (ios) {
    return "AR iOS tersedia jika aset USDZ sudah ada.";
  }
  if (android) {
    return "AR tersedia melalui perangkat Android yang mendukung.";
  }
  return "Gunakan perangkat mobile untuk pengalaman AR.";
}

function subscribeClientOnly() {
  return () => {};
}

function useLastModuleId() {
  return useSyncExternalStore(
    subscribeClientOnly,
    () => getLastModule()?.id ?? null,
    () => null,
  );
}

function useArInfo() {
  return useSyncExternalStore(
    subscribeClientOnly,
    arInfoPesan,
    () => "Gunakan perangkat mobile untuk pengalaman AR.",
  );
}

function ModulCard({ modul }: { modul: ModulDashboardItem }) {
  const aksi = tombolAksiModul(modul.status);
  const href = `/praktikum/${modul.id}`;

  return (
    <Link
      href={href}
      onClick={() => setLastModule({ id: modul.id, judul: modul.judul })}
      className="group block min-h-[44px] rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card
        size="sm"
        className="h-full transition-colors hover:bg-muted/30 active:bg-muted/40"
      >
        <CardHeader className="gap-1 pb-0">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-2 text-base leading-snug">
              {modul.judul}
            </CardTitle>
            <Badge variant={statusVariant(modul.status)} className="shrink-0 text-[10px]">
              {modul.status}
            </Badge>
          </div>
          {modul.deskripsi ? (
            <CardDescription className="line-clamp-2 text-xs">
              {modul.deskripsi}
            </CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="flex flex-col gap-2.5 pt-2">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-[10px]">
              {modul.kategori}
            </Badge>
            {modul.jumlahLangkah > 0 ? (
              <Badge variant="outline" className="text-[10px]">
                {modul.jumlahLangkah} langkah
              </Badge>
            ) : null}
            <Badge variant="outline" className="text-[10px]">
              {modul.arSiap ? "AR tersedia" : "AR belum siap"}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {modul.lksTersedia
                ? `LKS ${modul.dijawab}/${modul.totalSoalLks} soal`
                : "LKS tersedia"}
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground group-hover:text-foreground">
              Buka praktikum
            </span>
            <Button
              variant={modul.status === "Belum mulai" ? "default" : "outline"}
              size="sm"
              className="pointer-events-none min-h-[44px] min-w-[7rem] shrink-0"
              tabIndex={-1}
            >
              {aksi}
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ContinueCard({
  modul,
  modulList,
}: {
  modul: ModulDashboardItem | null;
  modulList: ModulDashboardItem[];
}) {
  const rekomendasi =
    modulList.find((m) => m.judul === REKOMENDASI_MODUL_JUDUL) ??
    modulList[0] ??
    null;

  const target = modul ?? rekomendasi;
  if (!target) return null;

  const adaLast = Boolean(modul);
  const href = `/praktikum/${target.id}`;

  return (
    <Card size="sm" className="border-dashed">
      <CardContent className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {adaLast ? "Lanjutkan Praktikum" : "Rekomendasi Modul"}
          </p>
          <p className="truncate font-medium">{target.judul}</p>
          <p className="text-xs text-muted-foreground">
            Status: {target.status}
            {target.lksTersedia
              ? ` · LKS ${target.dijawab}/${target.totalSoalLks}`
              : ""}
          </p>
        </div>
        <Link
          href={href}
          onClick={() => setLastModule({ id: target.id, judul: target.judul })}
          className="w-full shrink-0 sm:w-auto"
        >
          <Button size="sm" className="min-h-[44px] w-full sm:w-auto">
            {adaLast ? "Lanjutkan" : "Mulai dari rekomendasi"}
            <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function RingkasanGrid({ ringkasan }: { ringkasan: RingkasanProgres }) {
  const items = [
    { label: "Total modul", value: ringkasan.totalModul },
    { label: "Belum mulai", value: ringkasan.belumMulai },
    { label: "LKS selesai", value: ringkasan.lksSelesai },
    { label: "Sudah dinilai", value: ringkasan.sudahDinilai },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border bg-muted/20 px-3 py-2 text-center"
        >
          <p className="text-lg font-semibold tabular-nums">{item.value}</p>
          <p className="text-[11px] text-muted-foreground">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

const ALUR = [
  { icon: BookOpen, teks: "Pilih modul" },
  { icon: Box, teks: "Amati simulasi 3D" },
  { icon: ScanLine, teks: "Buka AR jika tersedia" },
  { icon: ClipboardList, teks: "Isi LKS" },
  { icon: Star, teks: "Tunggu penilaian guru" },
] as const;

export function SiswaDashboard({
  namaDepan,
  modul: modulAwal,
  ringkasan,
}: {
  namaDepan: string;
  modul: ModulDashboardItem[];
  ringkasan: RingkasanProgres;
}) {
  const [filter, setFilter] = useState<FilterModul>("Semua");
  const lastModuleId = useLastModuleId();
  const arInfo = useArInfo();

  const modul = useMemo(() => {
    return modulAwal.map((m) => {
      if (m.status === "Belum mulai" && lastModuleId === m.id) {
        return { ...m, status: "Sedang dikerjakan" as StatusModul };
      }
      return m;
    });
  }, [modulAwal, lastModuleId]);

  const modulTersaring = useMemo(
    () => modul.filter((m) => cocokFilter(m, filter)),
    [modul, filter],
  );

  const lastModul = useMemo(
    () => modul.find((m) => m.id === lastModuleId) ?? null,
    [modul, lastModuleId],
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] pt-4 sm:px-6 sm:pt-6">
      <section className="mb-4 space-y-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Selamat datang, {namaDepan}!
          </h1>
          <p className="text-sm text-muted-foreground">
            Pilih praktikum dan lanjutkan pengamatanmu.
          </p>
        </div>
        <RingkasanGrid ringkasan={ringkasan} />
      </section>

      {modul.length > 0 ? (
        <section className="mb-5">
          <ContinueCard modul={lastModul} modulList={modul} />
        </section>
      ) : null}

      {modul.length > 0 ? (
        <>
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {FILTER_OPSI.map((opsi) => (
              <button
                key={opsi}
                type="button"
                onClick={() => setFilter(opsi)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors min-h-[44px] sm:min-h-0 sm:py-1",
                  filter === opsi
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                {opsi}
              </button>
            ))}
          </div>

          {modulTersaring.length === 0 ? (
            <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              Tidak ada modul untuk filter &ldquo;{filter}&rdquo;.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {modulTersaring.map((m) => (
                <ModulCard key={m.id} modul={m} />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="rounded-lg border border-dashed px-4 py-10 text-center">
          <p className="font-medium">Belum ada modul praktikum.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Hubungi guru untuk membuka modul.
          </p>
        </div>
      )}

      <section className="mt-6 space-y-3">
        <h2 className="text-sm font-semibold">Alur Praktikum</h2>
        <ol className="grid gap-2 sm:grid-cols-5">
          {ALUR.map(({ icon: Icon, teks }, i) => (
            <li
              key={teks}
              className="flex items-start gap-2 rounded-lg border bg-muted/10 px-3 py-2 text-xs"
            >
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium">
                {i + 1}
              </span>
              <span className="flex min-w-0 items-start gap-1.5">
                <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                <span>{teks}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {arInfo}
        </p>
      </section>
    </main>
  );
}
