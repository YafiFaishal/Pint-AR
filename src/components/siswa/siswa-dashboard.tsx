"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Box,
  ChevronRight,
  ClipboardList,
  Layers,
  ScanLine,
  Star,
  Trophy,
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
import { PINTAR_DISCLAIMER, UI_COPY } from "@/lib/branding";
import { ModuleIconImage } from "@/components/module-icon-image";
import { SiswaStatusBadge } from "@/components/status-badge";

const FILTER_OPSI: FilterModul[] = [
  "Semua",
  "Fisika",
  "Kimia",
  "Astronomi",
  "Belum selesai",
];

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
        className="h-full border-border/80 bg-card transition-all duration-200 hover:-translate-y-px hover:border-[var(--color-border-strong)] hover:shadow-sm"
      >
        <CardHeader className="gap-1 pb-0">
          <div className="flex items-start gap-3">
            <ModuleIconImage
              judul={modul.judul}
              moduleId={modul.id}
              animateOnHover
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="line-clamp-2 text-base leading-snug">
                  {modul.judul}
                </CardTitle>
                <SiswaStatusBadge status={modul.status} />
              </div>
              {modul.deskripsi ? (
                <CardDescription className="mt-1 line-clamp-2 text-xs">
                  {modul.deskripsi}
                </CardDescription>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2.5 pt-2">
          <div className="flex flex-wrap gap-1.5">
            <Badge
              variant="outline"
              className="border-current/15 text-[10px]"
              style={{
                color:
                  modul.kategori === "Kimia"
                    ? "var(--chemistry)"
                    : modul.kategori === "Astronomi"
                      ? "var(--astronomy)"
                      : "var(--physics)",
                background:
                  modul.kategori === "Kimia"
                    ? "var(--chemistry-soft)"
                    : modul.kategori === "Astronomi"
                      ? "var(--astronomy-soft)"
                      : "var(--physics-soft)",
              }}
            >
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
              {UI_COPY.bukaSimulasi}
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
  return () => { };
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
    <Card size="sm" className="continue-simulation-card">
      <CardContent className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <ModuleIconImage
            judul={target.judul}
            moduleId={target.id}
          />
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-medium tracking-wide text-primary">
              {adaLast ? UI_COPY.lanjutkanSimulasi : UI_COPY.rekomendasiModul}
            </p>
            <p className="truncate font-medium">{target.judul}</p>
            <p className="text-xs text-muted-foreground">
              Status: {target.status}
              {target.lksTersedia
                ? ` · LKS ${target.dijawab}/${target.totalSoalLks}`
                : ""}
            </p>
          </div>
        </div>
        <Link
          href={href}
          onClick={() => setLastModule({ id: target.id, judul: target.judul })}
          className="w-full shrink-0 sm:w-auto"
        >
          <Button size="sm" className="min-h-[44px] w-full sm:w-auto">
            {adaLast ? UI_COPY.lanjutkanSimulasi : UI_COPY.mulaiSimulasi}
            <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function RingkasanGrid({ ringkasan }: { ringkasan: RingkasanProgres }) {
  const items = [
    {
      label: "Total modul",
      value: ringkasan.totalModul,
      icon: Layers,
      tint: "stat-tile-tint-primary",
    },
    {
      label: "Belum mulai",
      value: ringkasan.belumMulai,
      icon: BookOpen,
      tint: "stat-tile-tint-neutral",
    },
    {
      label: "LKS selesai",
      value: ringkasan.lksSelesai,
      icon: ClipboardList,
      tint: "stat-tile-tint-info",
    },
    {
      label: "Sudah dinilai",
      value: ringkasan.sudahDinilai,
      icon: Trophy,
      tint: "stat-tile-tint-success",
    },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map(({ label, value, icon: Icon, tint }) => (
        <div key={label} className={cn("stat-tile", tint)}>
          <Icon className="mb-0.5 size-3.5 text-muted-foreground" aria-hidden />
          <p className="text-xl font-semibold tabular-nums sm:text-2xl">
            {value}
          </p>
          <p className="text-[11px] leading-snug text-muted-foreground sm:text-xs">
            {label}
          </p>
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
        return { ...m, status: "Sedang dipelajari" as StatusModul };
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
    <main className="page-container">
      <section className="mb-4 space-y-3">
        <div>
          <div className="welcome-accent mb-2" aria-hidden />
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Selamat datang, {namaDepan}
          </h1>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Pilih modul simulasi dan lanjutkan eksplorasimu.
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
                  filter === opsi ? "filter-chip-active" : "filter-chip-inactive",
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
        <div className="rounded-xl border border-dashed px-4 py-8 text-center">
          <p className="font-medium">{UI_COPY.belumAdaModul}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Hubungi guru untuk membuka modul.
          </p>
        </div>
      )}

      <section className="mt-6 space-y-3">
        <h2 className="text-sm font-semibold">{UI_COPY.alurBelajar}</h2>
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
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {PINTAR_DISCLAIMER}
        </p>
      </section>
    </main>
  );
}
