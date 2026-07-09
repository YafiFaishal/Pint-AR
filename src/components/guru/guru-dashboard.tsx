"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, ClipboardCheck, Layers, Users, UserCheck } from "lucide-react";
import type {
  GuruDashboardData,
  ModulGuruDashboardItem,
} from "@/lib/guru-dashboard-data";
import {
  cocokFilterGuru,
  ringkasanStatusModul,
  type FilterModulGuru,
} from "@/lib/guru-modul-utils";
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
import { UI_COPY } from "@/lib/branding";
import { ModuleIconImage } from "@/components/module-icon-image";
import { GuruModulStatusBadge } from "@/components/status-badge";

const FILTER_OPSI: FilterModulGuru[] = [
  "Semua",
  "Perlu dinilai",
  "Ada progres",
  "Sudah dinilai",
  "Belum dimulai",
  "Fisika",
  "Kimia",
  "Astronomi",
];

function RingkasanGrid({
  ringkasan,
}: {
  ringkasan: GuruDashboardData["ringkasan"];
}) {
  const items = [
    { label: "Total modul", value: ringkasan.totalModul, icon: Layers, tint: "stat-tile-tint-primary" },
    { label: "Siswa aktif", value: ringkasan.siswaAktif, icon: Users, tint: "stat-tile-tint-info" },
    { label: "Menunggu dinilai", value: ringkasan.menungguDinilai, icon: ClipboardCheck, tint: "stat-tile-tint-neutral" },
    { label: "Sudah dinilai", value: ringkasan.sudahDinilai, icon: UserCheck, tint: "stat-tile-tint-success" },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map(({ label, value, icon: Icon, tint }) => (
        <div key={label} className={cn("stat-tile", tint)}>
          <Icon className="mb-0.5 size-3.5 text-muted-foreground" aria-hidden />
          <p className="text-xl font-semibold tabular-nums sm:text-2xl">{value}</p>
          <p className="text-[11px] leading-snug text-muted-foreground sm:text-xs">{label}</p>
        </div>
      ))}
    </div>
  );
}

function PrioritasCard({
  prioritas,
  totalMenunggu,
}: {
  prioritas: GuruDashboardData["prioritas"];
  totalMenunggu: number;
}) {
  if (totalMenunggu === 0) {
    return (
      <Card size="sm" className="border border-[var(--color-success-soft)] bg-[color-mix(in_srgb,var(--color-success-soft)_40%,var(--color-surface))]">
        <CardContent className="space-y-1 py-4">
          <p className="text-xs font-medium tracking-wide text-muted-foreground">
            Perlu Perhatian
          </p>
          <p className="font-medium">Semua LKS sudah diperiksa</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Belum ada lembar kerja baru yang perlu dinilai.
          </p>
        </CardContent>
      </Card>
    );
  }

  const satuModul = prioritas && prioritas.jumlahMenunggu === totalMenunggu;
  const href = `/guru/modul/${prioritas!.modulId}`;

  return (
    <Card size="sm" className="border border-[var(--color-warning-soft)] bg-[color-mix(in_srgb,var(--color-warning-soft)_45%,var(--color-surface))]">
      <CardContent className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-medium tracking-wide text-muted-foreground">
            {satuModul ? "Perlu dinilai" : "LKS menunggu penilaian"}
          </p>
          <p className="font-medium leading-snug">
            {satuModul
              ? prioritas!.modulJudul
              : `${totalMenunggu} LKS perlu diperiksa`}
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {satuModul
              ? `${prioritas!.jumlahMenunggu} LKS siswa menunggu pemeriksaan.`
              : "Periksa jawaban siswa dan berikan nilai agar progres kelas tetap diperbarui."}
          </p>
        </div>
        <Link href={href} className="w-full shrink-0 sm:w-auto">
          <Button size="sm" className="min-h-12 w-full sm:min-h-11 sm:w-auto">
            {satuModul ? "Periksa Sekarang" : "Buka Penilaian"}
            <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function ModulGuruCard({ modul }: { modul: ModulGuruDashboardItem }) {
  const href = `/guru/modul/${modul.id}`;
  const ringkasan = ringkasanStatusModul(modul.status, modul);
  const tombolTeks =
    modul.status === "Belum ada aktivitas" ? "Buka Modul" : "Pantau & Nilai";

  return (
    <Card size="sm" className="group h-full border-border/80 bg-card transition-all duration-200 hover:-translate-y-px hover:border-[var(--color-border-strong)] hover:shadow-sm">
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
              <GuruModulStatusBadge status={modul.status} />
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
          <Badge variant="outline" className="text-[10px]">
            {modul.kategori}
          </Badge>
          {modul.jumlahLangkah > 0 ? (
            <Badge variant="outline" className="text-[10px]">
              {modul.jumlahLangkah} langkah
            </Badge>
          ) : null}
          <Badge variant="outline" className="text-[10px]">
            {modul.jumlahSiswaAktif} siswa
          </Badge>
          {modul.lksMasuk > 0 ? (
            <Badge variant="outline" className="text-[10px]">
              {modul.lksMasuk} LKS masuk
            </Badge>
          ) : null}
          {modul.menungguNilai > 0 ? (
            <Badge variant="outline" className="text-[10px]">
              {modul.menungguNilai} perlu dinilai
            </Badge>
          ) : null}
          {modul.rataRata !== null ? (
            <Badge variant="outline" className="text-[10px]">
              Rata-rata {modul.rataRata}
            </Badge>
          ) : null}
        </div>

        <div className="flex flex-col gap-2.5 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
          <p className="text-xs leading-relaxed text-muted-foreground">
            {ringkasan}
          </p>
          <Button
            render={<Link href={href} />}
            nativeButton={false}
            size="sm"
            variant={modul.status === "Perlu dinilai" ? "default" : "outline"}
            className="min-h-12 w-full shrink-0 min-[420px]:min-h-11 min-[420px]:w-auto min-[420px]:min-w-[9.5rem]"
          >
            {tombolTeks}
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function GuruDashboard({
  modul,
  ringkasan,
  prioritas,
}: GuruDashboardData) {
  const [filter, setFilter] = useState<FilterModulGuru>("Semua");

  const modulTersaring = useMemo(
    () => modul.filter((m) => cocokFilterGuru(m, filter)),
    [modul, filter],
  );

  return (
    <main className="page-container lg:max-w-6xl">
      <section className="mb-4 space-y-3">
        <div>
          <div className="welcome-accent mb-2" aria-hidden />
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Dasbor Guru
          </h1>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Pantau progres simulasi dan LKS, periksa jawaban, lalu nilai hasil
            belajar siswa.
          </p>
        </div>
        <RingkasanGrid ringkasan={ringkasan} />
      </section>

      <section className="mb-5">
        <h2 className="mb-2 text-sm font-semibold">Perlu Perhatian</h2>
        <PrioritasCard
          prioritas={prioritas}
          totalMenunggu={ringkasan.menungguDinilai}
        />
      </section>

      {modul.length === 0 ? (
        <div className="rounded-xl border border-dashed px-4 py-8 text-center">
          <p className="font-medium">{UI_COPY.belumAdaModul}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Modul yang tersedia akan muncul di sini.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-3 flex items-end justify-between gap-2">
            <h2 className="text-sm font-semibold">{UI_COPY.modulSimulasi}</h2>
            <span className="shrink-0 text-xs text-muted-foreground">
              {modul.length} modul
            </span>
          </div>

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
            <div className="rounded-lg border border-dashed px-4 py-8 text-center">
              <p className="font-medium">Tidak ada modul pada status ini</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Coba pilih filter lain.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {modulTersaring.map((m) => (
                <ModulGuruCard key={m.id} modul={m} />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
