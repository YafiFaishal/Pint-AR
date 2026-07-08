"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import type {
  GuruDashboardData,
  ModulGuruDashboardItem,
} from "@/lib/guru-dashboard-data";
import {
  cocokFilterGuru,
  ringkasanStatusModul,
  statusBadgeVariant,
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
    { label: "Total modul", value: ringkasan.totalModul },
    { label: "Siswa aktif", value: ringkasan.siswaAktif },
    { label: "Menunggu dinilai", value: ringkasan.menungguDinilai },
    { label: "Sudah dinilai", value: ringkasan.sudahDinilai },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex min-h-[4.5rem] flex-col items-center justify-center rounded-lg border bg-muted/20 px-3 py-3 text-center sm:min-h-[5.5rem]"
        >
          <p className="text-xl font-semibold tabular-nums sm:text-2xl">
            {item.value}
          </p>
          <p className="text-[11px] leading-snug text-muted-foreground sm:text-xs">
            {item.label}
          </p>
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
      <Card size="sm" className="border-dashed">
        <CardContent className="space-y-1 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
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
    <Card size="sm" className="border-dashed">
      <CardContent className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
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
    <Card size="sm" className="h-full">
      <CardHeader className="gap-1 pb-0">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-base leading-snug">
            {modul.judul}
          </CardTitle>
          <Badge
            variant={statusBadgeVariant(modul.status)}
            className="shrink-0 text-[10px]"
          >
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
    <main className="mx-auto w-full max-w-5xl px-5 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] pt-4 sm:px-6 sm:pt-6 lg:max-w-6xl">
      <section className="mb-4 space-y-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Dasbor Guru
          </h1>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Pantau progres praktikum, periksa LKS, dan lihat hasil belajar
            siswa.
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
        <div className="rounded-lg border border-dashed px-4 py-10 text-center">
          <p className="font-medium">Belum ada modul praktikum</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Modul yang tersedia akan muncul di sini.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-3 flex items-end justify-between gap-2">
            <h2 className="text-sm font-semibold">Modul Praktikum</h2>
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
