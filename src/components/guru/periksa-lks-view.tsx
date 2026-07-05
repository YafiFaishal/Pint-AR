"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Soal = {
  lksTemplateId: string;
  pertanyaan: string;
  urutan: number;
  jawabanSiswa: string;
  skor: number;
  dinilai: boolean;
};

export function PeriksaLksView({
  moduleId,
  judulModul,
  studentId,
  namaSiswa,
}: {
  moduleId: string;
  judulModul: string;
  studentId: string;
  namaSiswa: string;
}) {
  const router = useRouter();
  const [soal, setSoal] = useState<Soal[] | null>(null);
  const [skor, setSkor] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let aktif = true;
    (async () => {
      const res = await fetch(
        `/api/guru/lks?moduleId=${moduleId}&studentId=${studentId}`,
      );
      if (!aktif) return;
      if (res.ok) {
        const data = await res.json();
        const list: Soal[] = data.soal ?? [];
        setSoal(list);
        setSkor(
          Object.fromEntries(
            list.map((s) => [s.lksTemplateId, String(s.skor ?? 0)]),
          ),
        );
      } else {
        setSoal([]);
      }
    })();
    return () => {
      aktif = false;
    };
  }, [moduleId, studentId]);

  async function simpanNilai() {
    if (!soal) return;
    setSaving(true);
    const nilai = soal.map((s) => ({
      lksTemplateId: s.lksTemplateId,
      skor: Math.max(0, Math.round(Number(skor[s.lksTemplateId]) || 0)),
    }));
    try {
      const res = await fetch("/api/guru/lks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId, studentId, nilai }),
      });
      if (res.ok) {
        toast.success("Nilai berhasil disimpan.");
        router.push(`/guru/modul/${moduleId}`);
        router.refresh();
      } else {
        toast.error("Gagal menyimpan nilai.");
      }
    } catch {
      toast.error("Gagal menyimpan nilai.");
    } finally {
      setSaving(false);
    }
  }

  const total = soal
    ? soal.reduce(
        (s, q) => s + (Math.max(0, Math.round(Number(skor[q.lksTemplateId]) || 0))),
        0,
      )
    : 0;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-2">
        <Button
          render={<Link href={`/guru/modul/${moduleId}`} />}
          nativeButton={false}
          variant="ghost"
          size="icon-sm"
          aria-label="Kembali"
        >
          <ArrowLeft />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{namaSiswa}</h1>
          <p className="text-sm text-muted-foreground">{judulModul}</p>
        </div>
      </div>

      {soal === null ? (
        <div className="flex items-center gap-2 p-8 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Memuat lembar kerja…
        </div>
      ) : soal.length === 0 ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          Modul ini belum memiliki lembar kerja.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {soal.map((s, i) => (
            <Card key={s.lksTemplateId}>
              <CardHeader>
                <CardTitle className="text-base leading-snug">
                  {i + 1}. {s.pertanyaan}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="rounded-md bg-muted p-3 text-sm">
                  {s.jawabanSiswa?.trim() ? (
                    s.jawabanSiswa
                  ) : (
                    <span className="text-muted-foreground italic">
                      (Belum dijawab)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`skor-${s.lksTemplateId}`} className="shrink-0">
                    Skor
                  </Label>
                  <Input
                    id={`skor-${s.lksTemplateId}`}
                    type="number"
                    min={0}
                    max={100}
                    inputMode="numeric"
                    value={skor[s.lksTemplateId] ?? "0"}
                    onChange={(e) =>
                      setSkor((prev) => ({
                        ...prev,
                        [s.lksTemplateId]: e.target.value,
                      }))
                    }
                    className="w-24"
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t bg-background/95 py-3 backdrop-blur">
            <span className="text-sm text-muted-foreground">
              Total skor:{" "}
              <span className="font-semibold text-foreground">{total}</span>
            </span>
            <Button onClick={simpanNilai} disabled={saving}>
              {saving ? "Menyimpan…" : "Simpan Nilai"}
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
