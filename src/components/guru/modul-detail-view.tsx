"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Search, X } from "lucide-react";
import {
  type FilterRekapDetail,
  type FilterSiswaDetail,
  type RekapSiswaRow,
  type SiswaModulRow,
  type StatusSiswaDetail,
  type TabModulDetail,
  cocokFilterRekap,
  cocokFilterSiswa,
  deriveStatusSiswa,
  formatNilaiAkhir,
  formatPoinMentah,
  hitungPersenProgres,
  hitungRataRataKelas,
  rekapCtaLabel,
  ringkasanSiswaModul,
  statusBadgesSiswa,
  tombolAksiSiswa,
} from "@/lib/guru-modul-detail-utils";
import { cn } from "@/lib/utils";
import { ModuleIconImage } from "@/components/module-icon-image";
import type { KategoriModul } from "@/lib/siswa-modul-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const FILTER_SISWA: FilterSiswaDetail[] = [
  "Semua",
  "Perlu dinilai",
  "Selesai",
  "Mengerjakan",
  "Sudah dinilai",
];

const FILTER_REKAP: FilterRekapDetail[] = [
  "Semua",
  "Sudah dinilai",
  "Belum dinilai",
];

function FilterChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {options.map((opsi) => (
        <button
          key={opsi}
          type="button"
          onClick={() => onChange(opsi)}
          className={cn(
            "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors min-h-[44px] sm:min-h-0 sm:py-1",
            value === opsi ? "filter-chip-active" : "filter-chip-inactive",
          )}
        >
          {opsi}
        </button>
      ))}
    </div>
  );
}

function SegmentedTabs({
  active,
  onChange,
}: {
  active: TabModulDetail;
  onChange: (tab: TabModulDetail) => void;
}) {
  return (
    <div
      className="mb-4 grid grid-cols-2 gap-1 rounded-xl border bg-muted/30 p-1"
      role="tablist"
      aria-label="Navigasi modul"
    >
      {(
        [
          ["siswa", "Daftar Siswa"],
          ["rekap", "Rekap Nilai"],
        ] as const
      ).map(([id, label]) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={active === id}
          onClick={() => onChange(id)}
          className={cn(
            "min-h-11 rounded-lg text-sm font-medium transition-colors sm:min-h-12",
            active === id
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function DetailStatusBadge({ status }: { status: StatusSiswaDetail | string }) {
  const cls =
    status === "Perlu dinilai"
      ? "status-badge-warning"
      : status === "Sudah dinilai" || status === "Selesai"
        ? "status-badge-success"
        : status === "Mengerjakan" || status === "Sedang dipelajari"
          ? "status-badge-info"
          : "status-badge-neutral";

  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] font-medium", cls)}
    >
      {status}
    </Badge>
  );
}

function SiswaMobileCard({
  siswa,
  moduleId,
  totalSkor,
}: {
  siswa: SiswaModulRow;
  moduleId: string;
  totalSkor: number | null;
}) {
  const status = deriveStatusSiswa(siswa);
  const badges = statusBadgesSiswa(status);
  const aksi = tombolAksiSiswa(status);
  const persen = hitungPersenProgres(siswa.dijawab, siswa.totalSoal);
  const poin = formatPoinMentah(totalSkor, siswa.totalSoal);
  const href = `/guru/modul/${moduleId}/siswa/${siswa.id}`;

  return (
    <div className="rounded-xl border bg-card p-4 sm:p-5">
      <h3 className="line-clamp-2 text-base font-semibold leading-snug">
        {siswa.nama}
      </h3>

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Progres LKS</span>
          <span className="font-medium tabular-nums">
            {siswa.dijawab}/{siswa.totalSoal} soal
          </span>
        </div>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={persen}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progres ${persen} persen`}
        >
          <div
            className="h-full bg-primary transition-[width] duration-300"
            style={{ width: `${persen}%` }}
          />
        </div>
        <p className="text-right text-[10px] tabular-nums text-muted-foreground">
          {persen}%
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {badges.map((b) => (
          <DetailStatusBadge key={b} status={b} />
        ))}
      </div>

      {status === "Sudah dinilai" && totalSkor !== null ? (
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Nilai akhir</span>
          <span className="font-semibold tabular-nums">
            {formatNilaiAkhir(totalSkor, siswa.totalSoal)}
          </span>
        </div>
      ) : null}
      {status === "Sudah dinilai" && poin ? (
        <p className="mt-0.5 text-right text-[10px] text-muted-foreground">
          {poin}
        </p>
      ) : null}

      <div className="mt-4">
        {aksi.disabled ? (
          <Button variant="outline" className="min-h-12 w-full" disabled>
            {aksi.label}
          </Button>
        ) : (
          <Button
            render={<Link href={href} />}
            nativeButton={false}
            className="min-h-12 w-full"
            variant={status === "Perlu dinilai" ? "default" : "outline"}
          >
            {aksi.label}
            <ChevronRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function SiswaDesktopTable({
  rows,
  moduleId,
  skorMap,
}: {
  rows: SiswaModulRow[];
  moduleId: string;
  skorMap: Map<string, number | null>;
}) {
  return (
    <div className="hidden overflow-x-auto rounded-xl border md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Progres</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Nilai</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((s) => {
            const status = deriveStatusSiswa(s);
            const aksi = tombolAksiSiswa(status);
            const totalSkor = skorMap.get(s.id) ?? null;
            const href = `/guru/modul/${moduleId}/siswa/${s.id}`;
            return (
              <TableRow key={s.id} className="min-h-14">
                <TableCell className="max-w-[14rem] font-medium">
                  <span className="line-clamp-2">{s.nama}</span>
                </TableCell>
                <TableCell className="tabular-nums text-muted-foreground">
                  {s.dijawab}/{s.totalSoal} soal
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {statusBadgesSiswa(status).map((b) => (
                      <DetailStatusBadge key={b} status={b} />
                    ))}
                  </div>
                </TableCell>
                <TableCell className="tabular-nums">
                  {status === "Sudah dinilai"
                    ? formatNilaiAkhir(totalSkor, s.totalSoal)
                    : "—"}
                </TableCell>
                <TableCell className="text-right">
                  {aksi.disabled ? (
                    <Button size="sm" variant="outline" disabled>
                      {aksi.label}
                    </Button>
                  ) : (
                    <Button
                      render={<Link href={href} />}
                      nativeButton={false}
                      size="sm"
                      variant={status === "Perlu dinilai" ? "default" : "outline"}
                    >
                      {aksi.label}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function RekapMobileCard({
  row,
  moduleId,
  totalSoal,
}: {
  row: RekapSiswaRow;
  moduleId: string;
  totalSoal: number;
}) {
  const dinilai = row.status === "Sudah Dinilai";
  const href = `/guru/modul/${moduleId}/siswa/${row.id}`;

  return (
    <div className="rounded-xl border bg-card p-4 sm:p-5">
      <h3 className="line-clamp-2 text-base font-semibold leading-snug">
        {row.nama}
      </h3>
      <div className="mt-3 space-y-2 text-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Nilai akhir</span>
          <span className="font-semibold tabular-nums">
            {formatNilaiAkhir(row.totalSkor, totalSoal)}
          </span>
        </div>
        {dinilai && row.totalSkor !== null ? (
          <p className="text-right text-[10px] text-muted-foreground">
            {formatPoinMentah(row.totalSkor, totalSoal)}
          </p>
        ) : null}
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Status</span>
          <DetailStatusBadge
            status={dinilai ? "Sudah dinilai" : "Belum dinilai"}
          />
        </div>
      </div>
      <Button
        render={<Link href={href} />}
        nativeButton={false}
        className="mt-4 min-h-12 w-full"
        variant={dinilai ? "outline" : "default"}
      >
        {rekapCtaLabel(row.status)}
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed px-4 py-8 text-center sm:py-9">
      <p className="font-medium">{title}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-36 animate-pulse rounded-xl border bg-muted/30" />
      ))}
    </div>
  );
}

export function ModulDetailView({
  moduleId,
  judul,
}: {
  moduleId: string;
  judul: string;
  kategori: KategoriModul;
}) {
  const [tab, setTab] = useState<TabModulDetail>("siswa");
  const [siswa, setSiswa] = useState<SiswaModulRow[] | null>(null);
  const [totalSoal, setTotalSoal] = useState(0);
  const [rekap, setRekap] = useState<RekapSiswaRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filterSiswa, setFilterSiswa] = useState<FilterSiswaDetail>("Semua");
  const [filterRekap, setFilterRekap] = useState<FilterRekapDetail>("Semua");
  const [cari, setCari] = useState("");

  const muatData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [sRes, rRes] = await Promise.all([
        fetch(`/api/guru/modul/${moduleId}/siswa`),
        fetch(`/api/guru/modul/${moduleId}/rekap`),
      ]);
      if (!sRes.ok || !rRes.ok) throw new Error("fetch failed");
      const sData = await sRes.json();
      const rData = await rRes.json();
      setSiswa(sData.siswa ?? []);
      setTotalSoal(Number(sData.totalSoal) || 0);
      setRekap(rData.rekap ?? []);
    } catch {
      setSiswa(null);
      setRekap(null);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const [sRes, rRes] = await Promise.all([
          fetch(`/api/guru/modul/${moduleId}/siswa`),
          fetch(`/api/guru/modul/${moduleId}/rekap`),
        ]);
        if (!sRes.ok || !rRes.ok) throw new Error("fetch failed");
        const sData = await sRes.json();
        const rData = await rRes.json();
        if (cancelled) return;
        setSiswa(sData.siswa ?? []);
        setTotalSoal(Number(sData.totalSoal) || 0);
        setRekap(rData.rekap ?? []);
        setError(false);
      } catch {
        if (cancelled) return;
        setSiswa(null);
        setRekap(null);
        setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [moduleId]);

  const skorMap = useMemo(() => {
    const map = new Map<string, number | null>();
    for (const r of rekap ?? []) {
      map.set(r.id, r.totalSkor);
    }
    return map;
  }, [rekap]);

  const ringkasan = useMemo(
    () => ringkasanSiswaModul(siswa ?? []),
    [siswa],
  );

  const siswaTersaring = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return (siswa ?? []).filter((s) => {
      if (!cocokFilterSiswa(s, filterSiswa)) return false;
      if (q && !s.nama.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [siswa, filterSiswa, cari]);

  const rekapTersaring = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return (rekap ?? []).filter((r) => {
      if (!cocokFilterRekap(r, filterRekap)) return false;
      if (q && !r.nama.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rekap, filterRekap, cari]);

  const rataKelas = useMemo(
    () => hitungRataRataKelas(rekap ?? [], totalSoal),
    [rekap, totalSoal],
  );

  const jumlahDinilai = useMemo(
    () => (rekap ?? []).filter((r) => r.status === "Sudah Dinilai").length,
    [rekap],
  );
  const jumlahBelum = (rekap ?? []).length - jumlahDinilai;

  return (
    <main className="page-container lg:max-w-6xl">
      <div className="mb-4 flex gap-3 sm:mb-5">
        <Button
          render={<Link href="/guru" />}
          nativeButton={false}
          variant="ghost"
          className="size-11 shrink-0 self-start"
          aria-label="Kembali ke Dasbor Guru"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <ModuleIconImage
          judul={judul}
          moduleId={moduleId}
          size="md"
          className="shrink-0 self-start"
        />
        <div className="min-w-0 flex-1">
          <h1 className="line-clamp-2 text-xl font-bold tracking-tight sm:text-2xl">
            {judul}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Pantau progres siswa dan periksa lembar kerja.
          </p>
        </div>
      </div>

      <SegmentedTabs active={tab} onChange={setTab} />

      {error ? (
        <EmptyState
          title="Data siswa belum dapat dimuat"
          description="Periksa koneksi internet lalu coba muat ulang."
          action={
            <Button variant="outline" className="min-h-11" onClick={muatData}>
              Coba lagi
            </Button>
          }
        />
      ) : tab === "siswa" ? (
        <section role="tabpanel" aria-label="Daftar Siswa">
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <>
              {(siswa?.length ?? 0) > 0 ? (
                <>
                  <p className="mb-3 text-xs text-muted-foreground sm:text-sm">
                    {ringkasan.aktif} siswa aktif · {ringkasan.selesai} selesai
                    · {ringkasan.perluNilai} perlu dinilai
                  </p>
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="text-[10px]">
                      {ringkasan.aktif} siswa aktif
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {ringkasan.selesai} selesai
                    </Badge>
                    {ringkasan.perluNilai > 0 ? (
                      <Badge variant="outline" className="text-[10px]">
                        {ringkasan.perluNilai} perlu dinilai
                      </Badge>
                    ) : null}
                  </div>

                  <div className="mb-3">
                    <FilterChips
                      options={FILTER_SISWA}
                      value={filterSiswa}
                      onChange={setFilterSiswa}
                    />
                  </div>

                  <div className="relative mb-4">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="search"
                      value={cari}
                      onChange={(e) => setCari(e.target.value)}
                      placeholder="Cari nama siswa"
                      aria-label="Cari nama siswa"
                      className="min-h-11 pl-9 text-base sm:text-sm"
                    />
                    {cari ? (
                      <button
                        type="button"
                        className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground"
                        onClick={() => setCari("")}
                        aria-label="Hapus pencarian"
                      >
                        <X className="size-4" />
                      </button>
                    ) : null}
                  </div>

                  {siswaTersaring.length === 0 ? (
                    <EmptyState
                      title="Tidak ada siswa pada status ini"
                      description="Coba pilih filter lain atau hapus pencarian."
                    />
                  ) : (
                    <>
                      <div className="grid gap-3 md:hidden">
                        {siswaTersaring.map((s) => (
                          <SiswaMobileCard
                            key={s.id}
                            siswa={s}
                            moduleId={moduleId}
                            totalSkor={skorMap.get(s.id) ?? null}
                          />
                        ))}
                      </div>
                      <SiswaDesktopTable
                        rows={siswaTersaring}
                        moduleId={moduleId}
                        skorMap={skorMap}
                      />
                    </>
                  )}
                </>
              ) : (
                <EmptyState
                  title="Belum ada siswa aktif"
                  description="Belum ada siswa yang memulai modul ini. Data progres akan muncul setelah siswa membuka simulasi."
                />
              )}
            </>
          )}
        </section>
      ) : (
        <section role="tabpanel" aria-label="Rekap Nilai">
          {loading ? (
            <LoadingSkeleton />
          ) : (rekap?.length ?? 0) === 0 ? (
            <EmptyState
              title="Belum ada nilai"
              description="Nilai kelas akan muncul setelah guru memeriksa dan menyimpan penilaian LKS siswa."
              action={
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11"
                  onClick={() => setTab("siswa")}
                >
                  Buka Daftar Siswa
                </Button>
              }
            />
          ) : (
            <>
              <p className="mb-3 text-sm text-muted-foreground">
                {jumlahDinilai} dari {rekap?.length ?? 0} siswa sudah dinilai.
              </p>

              <div className="mb-4 grid grid-cols-3 gap-2">
                <div className="flex min-h-[4.5rem] flex-col items-center justify-center rounded-lg border bg-muted/20 px-2 py-2 text-center">
                  <p className="text-lg font-semibold tabular-nums sm:text-xl">
                    {rataKelas !== null ? rataKelas : "—"}
                  </p>
                  <p className="text-[10px] text-muted-foreground sm:text-[11px]">
                    Rata-rata
                  </p>
                </div>
                <div className="flex min-h-[4.5rem] flex-col items-center justify-center rounded-lg border bg-muted/20 px-2 py-2 text-center">
                  <p className="text-lg font-semibold tabular-nums sm:text-xl">
                    {jumlahDinilai}/{rekap?.length ?? 0}
                  </p>
                  <p className="text-[10px] text-muted-foreground sm:text-[11px]">
                    Dinilai
                  </p>
                </div>
                <div className="flex min-h-[4.5rem] flex-col items-center justify-center rounded-lg border bg-muted/20 px-2 py-2 text-center">
                  <p className="text-lg font-semibold tabular-nums sm:text-xl">
                    {jumlahBelum}
                  </p>
                  <p className="text-[10px] text-muted-foreground sm:text-[11px]">
                    Belum nilai
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <FilterChips
                  options={FILTER_REKAP}
                  value={filterRekap}
                  onChange={setFilterRekap}
                />
              </div>

              <div className="relative mb-4">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  value={cari}
                  onChange={(e) => setCari(e.target.value)}
                  placeholder="Cari nama siswa"
                  aria-label="Cari nama siswa"
                  className="min-h-11 pl-9 text-base sm:text-sm"
                />
                {cari ? (
                  <button
                    type="button"
                    className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground"
                    onClick={() => setCari("")}
                    aria-label="Hapus pencarian"
                  >
                    <X className="size-4" />
                  </button>
                ) : null}
              </div>

              {rekapTersaring.length === 0 ? (
                <EmptyState
                  title="Tidak ada siswa pada status ini"
                  description="Coba pilih filter lain atau hapus pencarian."
                />
              ) : (
                <>
                  <div className="grid gap-3 md:hidden">
                    {rekapTersaring.map((r) => (
                      <RekapMobileCard
                        key={r.id}
                        row={r}
                        moduleId={moduleId}
                        totalSoal={totalSoal}
                      />
                    ))}
                  </div>
                  <div className="hidden overflow-x-auto rounded-xl border md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama</TableHead>
                          <TableHead>Nilai akhir</TableHead>
                          <TableHead>Total poin</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rekapTersaring.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell className="max-w-[14rem] font-medium">
                              <span className="line-clamp-2">{r.nama}</span>
                            </TableCell>
                            <TableCell className="tabular-nums font-semibold">
                              {formatNilaiAkhir(r.totalSkor, totalSoal)}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground tabular-nums">
                              {formatPoinMentah(r.totalSkor, totalSoal) ?? "—"}
                            </TableCell>
                            <TableCell>
                              <DetailStatusBadge
                                status={
                                  r.status === "Sudah Dinilai"
                                    ? "Sudah dinilai"
                                    : "Belum dinilai"
                                }
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                render={
                                  <Link
                                    href={`/guru/modul/${moduleId}/siswa/${r.id}`}
                                  />
                                }
                                nativeButton={false}
                                size="sm"
                                variant={
                                  r.status === "Sudah Dinilai"
                                    ? "outline"
                                    : "default"
                                }
                              >
                                {rekapCtaLabel(r.status)}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </>
          )}
        </section>
      )}
    </main>
  );
}
