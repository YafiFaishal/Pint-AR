"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, CloudOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type Pertanyaan = { id: string; pertanyaan: string; urutan: number };
type NilaiSoal = {
  lksTemplateId: string;
  dinilai: boolean;
  skor: number | null;
};
type Grades = {
  nilai: NilaiSoal[];
  total: number | null;
  sudahDinilai: boolean;
  dinilaiPenuh: boolean;
};

type Status = "idle" | "saving" | "saved" | "error";

const AUTOSAVE_DELAY = 1000;

export function LksPanel({ moduleId }: { moduleId: string }) {
  const [pertanyaan, setPertanyaan] = useState<Pertanyaan[]>([]);
  const [jawaban, setJawaban] = useState<Record<string, string>>({});
  const [grades, setGrades] = useState<Grades | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<Status>("idle");

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const jawabanRef = useRef(jawaban);

  useEffect(() => {
    jawabanRef.current = jawaban;
  }, [jawaban]);

  const storageKey = `lks:${moduleId}`;

  // Muat pertanyaan, jawaban tersimpan, dan nilai.
  useEffect(() => {
    let aktif = true;

    // Cadangan lokal dimuat lebih dulu (tahan koneksi buruk).
    let lokal: Record<string, string> = {};
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) lokal = JSON.parse(raw);
    } catch {
      // abaikan
    }

    async function muat() {
      try {
        const [pRes, aRes, gRes] = await Promise.all([
          fetch(`/api/lks/${moduleId}`),
          fetch(`/api/lks/answers?moduleId=${moduleId}`),
          fetch(`/api/lks/grades/${moduleId}`),
        ]);
        const pData = pRes.ok ? await pRes.json() : { pertanyaan: [] };
        const aData = aRes.ok ? await aRes.json() : { jawaban: [] };
        const gData: Grades | null = gRes.ok ? await gRes.json() : null;

        if (!aktif) return;

        const gabungan: Record<string, string> = { ...lokal };
        for (const a of aData.jawaban ?? []) {
          gabungan[a.lksTemplateId] = a.jawabanSiswa ?? "";
        }

        setPertanyaan(pData.pertanyaan ?? []);
        setJawaban(gabungan);
        setGrades(gData);
      } catch {
        // Server tak terjangkau: pakai cadangan lokal saja.
        if (aktif) setJawaban(lokal);
      } finally {
        if (aktif) setLoading(false);
      }
    }

    muat();
    return () => {
      aktif = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [moduleId, storageKey]);

  const simpanKeServer = useCallback(async () => {
    const answers = Object.entries(jawabanRef.current).map(
      ([lksTemplateId, jawaban]) => ({ lksTemplateId, jawaban }),
    );
    if (answers.length === 0) return;
    setStatus("saving");
    try {
      const res = await fetch("/api/lks/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      setStatus(res.ok ? "saved" : "error");
    } catch {
      setStatus("error");
    }
  }, []);

  function ubahJawaban(id: string, nilai: string) {
    setJawaban((prev) => {
      const next = { ...prev, [id]: nilai };
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // abaikan kuota penuh
      }
      return next;
    });
    setStatus("saving");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(simpanKeServer, AUTOSAVE_DELAY);
  }

  const nilaiMap = new Map(
    (grades?.nilai ?? []).map((n) => [n.lksTemplateId, n]),
  );

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Memuat LKS…
      </div>
    );
  }

  if (pertanyaan.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Belum ada lembar kerja untuk modul ini.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Lembar Kerja Siswa</h2>
        <StatusIndikator status={status} />
      </div>

      {grades?.sudahDinilai ? (
        <div className="flex items-center justify-between rounded-lg border bg-primary/5 px-3 py-2">
          <span className="text-sm font-medium">Nilai dari Guru</span>
          <span className="text-lg font-bold text-primary">
            {grades.dinilaiPenuh ? grades.total : `${grades.total ?? 0}*`}
          </span>
        </div>
      ) : null}

      {pertanyaan.map((p, i) => {
        const n = nilaiMap.get(p.id);
        const terkunci = Boolean(n?.dinilai);
        return (
          <div key={p.id} className="grid gap-2">
            <div className="flex items-start justify-between gap-2">
              <Label htmlFor={`soal-${p.id}`} className="leading-snug">
                {i + 1}. {p.pertanyaan}
              </Label>
              {terkunci ? (
                <Badge variant="secondary" className="shrink-0">
                  Nilai: {n?.skor ?? 0}
                </Badge>
              ) : null}
            </div>
            <Textarea
              id={`soal-${p.id}`}
              value={jawaban[p.id] ?? ""}
              onChange={(e) => ubahJawaban(p.id, e.target.value)}
              onBlur={() => {
                if (timerRef.current) clearTimeout(timerRef.current);
                simpanKeServer();
              }}
              placeholder="Tulis hasil pengamatanmu di sini…"
              rows={3}
              disabled={terkunci}
            />
          </div>
        );
      })}

      {grades?.sudahDinilai && !grades.dinilaiPenuh ? (
        <p className="text-xs text-muted-foreground">
          *Sebagian jawaban belum dinilai. Nilai akhir muncul setelah semua soal
          diperiksa guru.
        </p>
      ) : null}
    </div>
  );
}

function StatusIndikator({ status }: { status: Status }) {
  if (status === "saving") {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 className="size-3 animate-spin" /> Menyimpan…
      </span>
    );
  }
  if (status === "saved") {
    return (
      <span className="flex items-center gap-1 text-xs text-primary">
        <Check className="size-3" /> Tersimpan
      </span>
    );
  }
  if (status === "error") {
    return (
      <span
        className={cn("flex items-center gap-1 text-xs text-amber-600")}
        title="Jawaban tetap tersimpan di perangkatmu"
      >
        <CloudOff className="size-3" /> Tersimpan lokal
      </span>
    );
  }
  return null;
}
