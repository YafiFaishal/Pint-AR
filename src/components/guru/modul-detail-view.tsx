"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Siswa = {
  id: string;
  nama: string;
  email: string;
  dijawab: number;
  totalSoal: number;
  status: string;
  sudahDinilai: boolean;
};

type RekapRow = { id: string; nama: string; totalSkor: number | null; status: string };
type Rekap = {
  rekap: RekapRow[];
  rataKelas: number | null;
  jumlahDinilai: number;
  jumlahSiswa: number;
};

export function ModulDetailView({
  moduleId,
  judul,
}: {
  moduleId: string;
  judul: string;
}) {
  const [siswa, setSiswa] = useState<Siswa[] | null>(null);
  const [rekap, setRekap] = useState<Rekap | null>(null);

  useEffect(() => {
    let aktif = true;
    (async () => {
      const [sRes, rRes] = await Promise.all([
        fetch(`/api/guru/modul/${moduleId}/siswa`),
        fetch(`/api/guru/modul/${moduleId}/rekap`),
      ]);
      if (!aktif) return;
      if (sRes.ok) setSiswa((await sRes.json()).siswa);
      else setSiswa([]);
      if (rRes.ok) setRekap(await rRes.json());
    })();
    return () => {
      aktif = false;
    };
  }, [moduleId]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-2">
        <Button
          render={<Link href="/guru" />}
          nativeButton={false}
          variant="ghost"
          size="icon-sm"
          aria-label="Kembali"
        >
          <ArrowLeft />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{judul}</h1>
          <p className="text-sm text-muted-foreground">
            Pantau progres siswa dan periksa lembar kerja.
          </p>
        </div>
      </div>

      <Tabs defaultValue="siswa">
        <TabsList className="mb-4">
          <TabsTrigger value="siswa">Daftar Siswa</TabsTrigger>
          <TabsTrigger value="rekap">Rekap Nilai</TabsTrigger>
        </TabsList>

        <TabsContent value="siswa">
          <DaftarSiswa moduleId={moduleId} siswa={siswa} />
        </TabsContent>

        <TabsContent value="rekap">
          <RekapNilai rekap={rekap} />
        </TabsContent>
      </Tabs>
    </main>
  );
}

function DaftarSiswa({
  moduleId,
  siswa,
}: {
  moduleId: string;
  siswa: Siswa[] | null;
}) {
  if (siswa === null) return <Memuat />;
  if (siswa.length === 0)
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        Belum ada siswa yang mengerjakan modul ini.
      </p>
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Siswa Aktif</CardTitle>
        <CardDescription>
          Klik &ldquo;Periksa&rdquo; untuk menilai lembar kerja siswa.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Progres</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {siswa.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.nama}</TableCell>
                <TableCell className="text-muted-foreground">
                  {s.dijawab}/{s.totalSoal} soal
                </TableCell>
                <TableCell>
                  <Badge variant={s.status === "Selesai" ? "default" : "secondary"}>
                    {s.status}
                  </Badge>
                  {s.sudahDinilai ? (
                    <Badge variant="outline" className="ml-1">
                      Dinilai
                    </Badge>
                  ) : null}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    render={
                      <Link href={`/guru/modul/${moduleId}/siswa/${s.id}`} />
                    }
                    nativeButton={false}
                    size="sm"
                    variant="outline"
                  >
                    Periksa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function RekapNilai({ rekap }: { rekap: Rekap | null }) {
  if (rekap === null) return <Memuat />;
  if (rekap.rekap.length === 0)
    return (
      <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        Belum ada data nilai untuk modul ini.
      </p>
    );

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="text-lg">Rekap Nilai Kelas</CardTitle>
          <CardDescription>
            {rekap.jumlahDinilai} dari {rekap.jumlahSiswa} siswa sudah dinilai.
          </CardDescription>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Rata-rata Kelas</div>
          <div className="text-2xl font-bold text-primary">
            {rekap.rataKelas !== null ? rekap.rataKelas.toFixed(1) : "—"}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Total Skor</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rekap.rekap.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.nama}</TableCell>
                <TableCell>{r.totalSkor ?? "—"}</TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={
                      r.status === "Sudah Dinilai" ? "default" : "secondary"
                    }
                  >
                    {r.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function Memuat() {
  return (
    <div className="flex items-center gap-2 p-8 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" /> Memuat data…
    </div>
  );
}
