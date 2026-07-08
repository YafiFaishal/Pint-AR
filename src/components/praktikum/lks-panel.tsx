"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, CloudOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

type LksPanelProps = {
  moduleId: string;
  modulTitle?: string;
  layout?: "inline" | "workspace";
  open?: boolean;
  onClose?: () => void;
  onAvailabilityChange?: (available: boolean) => void;
};

const AUTOSAVE_DELAY = 1000;

function countFilledAnswers(
  pertanyaan: Pertanyaan[],
  jawaban: Record<string, string>,
): number {
  return pertanyaan.filter((p) => (jawaban[p.id] ?? "").trim().length > 0)
    .length;
}

export function LksPanel({
  moduleId,
  modulTitle = "",
  layout = "inline",
  open = true,
  onClose,
  onAvailabilityChange,
}: LksPanelProps) {
  const [pertanyaan, setPertanyaan] = useState<Pertanyaan[]>([]);
  const [jawaban, setJawaban] = useState<Record<string, string>>({});
  const [grades, setGrades] = useState<Grades | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const jawabanRef = useRef(jawaban);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onAvailabilityChangeRef = useRef(onAvailabilityChange);

  useEffect(() => {
    onAvailabilityChangeRef.current = onAvailabilityChange;
  }, [onAvailabilityChange]);

  useEffect(() => {
    jawabanRef.current = jawaban;
  }, [jawaban]);

  const storageKey = `lks:${moduleId}`;

  useEffect(() => {
    let aktif = true;

    let lokal: Record<string, string> = {};
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) lokal = JSON.parse(raw);
    } catch {
      // abaikan
    }

    async function muat() {
      setLoading(true);
      setLoadError(false);
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

        const qs: Pertanyaan[] = pData.pertanyaan ?? [];
        setPertanyaan(qs);
        setJawaban(gabungan);
        setGrades(gData);
        onAvailabilityChangeRef.current?.(qs.length > 0);
      } catch {
        if (aktif) {
          setJawaban(lokal);
          setLoadError(true);
          onAvailabilityChangeRef.current?.(false);
        }
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

  useEffect(() => {
    if (layout === "workspace" && open) {
      closeButtonRef.current?.focus();
    }
  }, [layout, open]);

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

  const ubahJawaban = useCallback(
    (id: string, nilai: string) => {
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
    },
    [simpanKeServer, storageKey],
  );

  const nilaiMap = useMemo(
    () => new Map((grades?.nilai ?? []).map((n) => [n.lksTemplateId, n])),
    [grades?.nilai],
  );

  const filledCount = useMemo(
    () => countFilledAnswers(pertanyaan, jawaban),
    [pertanyaan, jawaban],
  );

  const progressLabel =
    pertanyaan.length > 0
      ? `${filledCount} dari ${pertanyaan.length} pertanyaan terisi`
      : null;

  const loadingView = (
    <div className="flex min-h-[10rem] items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-5 animate-spin" />
      Memuat LKS…
    </div>
  );

  const errorView = (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-6 text-center">
      <p className="text-sm font-medium">Gagal memuat lembar kerja</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Periksa koneksi internet lalu coba buka kembali.
      </p>
    </div>
  );

  const emptyView = (
    <div className="rounded-lg border bg-muted/30 px-4 py-8 text-center">
      <p className="text-sm font-medium">LKS belum tersedia</p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        Lembar kerja untuk modul ini masih dalam tahap penyusunan.
      </p>
      {layout === "workspace" && onClose ? (
        <Button
          type="button"
          variant="outline"
          className="mt-4 min-h-11"
          onClick={onClose}
        >
          Kembali ke Praktikum
        </Button>
      ) : null}
    </div>
  );

  const gradesBanner =
    grades?.sudahDinilai ? (
      <div className="flex items-center justify-between rounded-lg border bg-primary/5 px-3 py-2">
        <span className="text-sm font-medium">Nilai dari Guru</span>
        <span className="text-lg font-bold text-primary">
          {grades.dinilaiPenuh ? grades.total : `${grades.total ?? 0}*`}
        </span>
      </div>
    ) : null;

  const questionCards = pertanyaan.map((p, i) => {
    const n = nilaiMap.get(p.id);
    const terkunci = Boolean(n?.dinilai);
    const cardClass =
      layout === "workspace"
        ? "rounded-lg border bg-background p-4 sm:p-5"
        : "grid gap-2";

    return (
      <div key={p.id} className={cardClass}>
        <div className="flex items-start justify-between gap-2">
          {layout === "workspace" ? (
            <>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Pertanyaan {i + 1}
              </p>
              {terkunci ? (
                <Badge variant="secondary" className="shrink-0">
                  Nilai: {n?.skor ?? 0}
                </Badge>
              ) : null}
            </>
          ) : (
            <>
              <Label htmlFor={`soal-${p.id}`} className="leading-snug">
                {i + 1}. {p.pertanyaan}
              </Label>
              {terkunci ? (
                <Badge variant="secondary" className="shrink-0">
                  Nilai: {n?.skor ?? 0}
                </Badge>
              ) : null}
            </>
          )}
        </div>
        {layout === "workspace" ? (
          <p className="mt-2 text-sm leading-relaxed">{p.pertanyaan}</p>
        ) : null}
        <Textarea
          id={`soal-${p.id}`}
          value={jawaban[p.id] ?? ""}
          onChange={(e) => ubahJawaban(p.id, e.target.value)}
          onBlur={() => {
            if (timerRef.current) clearTimeout(timerRef.current);
            simpanKeServer();
          }}
          placeholder="Tulis hasil pengamatanmu di sini…"
          rows={layout === "workspace" ? 5 : 3}
          disabled={terkunci}
          className={cn(
            layout === "workspace" &&
              "mt-3 min-h-[7.5rem] text-base leading-relaxed",
          )}
          onFocus={(e) => {
            if (layout === "workspace") {
              e.currentTarget.scrollIntoView({
                block: "nearest",
                behavior: "smooth",
              });
            }
          }}
        />
      </div>
    );
  });

  const partialGradeNote =
    grades?.sudahDinilai && !grades.dinilaiPenuh ? (
      <p className="text-xs text-muted-foreground">
        *Sebagian jawaban belum dinilai. Nilai akhir muncul setelah semua soal
        diperiksa guru.
      </p>
    ) : null;

  const saveFooter = (
    <div className="space-y-2">
      <div className="flex items-center justify-center">
        <StatusIndikator status={status} />
      </div>
      <Button
        type="button"
        className="min-h-[52px] w-full"
        disabled={status === "saving" || pertanyaan.length === 0}
        onClick={() => {
          if (timerRef.current) clearTimeout(timerRef.current);
          simpanKeServer();
        }}
      >
        Simpan LKS
      </Button>
    </div>
  );

  const formContent = loading ? (
    loadingView
  ) : loadError && pertanyaan.length === 0 ? (
    errorView
  ) : pertanyaan.length === 0 ? (
    emptyView
  ) : (
    <div className={cn("flex flex-col", layout === "workspace" ? "gap-4" : "gap-4")}>
      {layout === "inline" ? (
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Lembar Kerja Siswa</h2>
          <StatusIndikator status={status} />
        </div>
      ) : null}
      {gradesBanner}
      {questionCards}
      {partialGradeNote}
    </div>
  );

  if (layout === "inline") {
    return (
      <div className="flex flex-col gap-4">
        {formContent}
        {pertanyaan.length > 0 && !loading ? saveFooter : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "lks-workspace fixed inset-x-0 bottom-0 z-50 flex min-h-0 flex-col overflow-hidden bg-background",
        "top-[calc(4.5rem+env(safe-area-inset-top,0px))] h-[calc(100dvh-4.5rem-env(safe-area-inset-top,0px))] min-h-[calc(100dvh-4.5rem-env(safe-area-inset-top,0px))]",
        !open && "pointer-events-none invisible opacity-0",
      )}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      aria-label="Lembar Kerja Siswa"
    >
      <header className="lks-header shrink-0 border-b bg-background px-4 pb-3 pt-1 sm:px-5">
        <Button
          ref={closeButtonRef}
          type="button"
          variant="ghost"
          className="mb-2 min-h-11 -ml-2 gap-2 px-2"
          onClick={onClose}
          aria-label="Kembali ke Praktikum"
        >
          <ArrowLeft className="size-4" />
          Kembali ke Praktikum
        </Button>
        <div className="space-y-0.5">
          <h2 className="text-base font-semibold leading-snug">
            Lembar Kerja Siswa
          </h2>
          <p className="text-sm text-muted-foreground">{modulTitle}</p>
          {progressLabel ? (
            <p className="text-xs text-muted-foreground">{progressLabel}</p>
          ) : null}
        </div>
      </header>

      <div className="lks-body min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-4 py-4 [-webkit-overflow-scrolling:touch] sm:px-5">
        {formContent}
        <div className="h-4 shrink-0" aria-hidden />
      </div>

      {pertanyaan.length > 0 && !loading ? (
        <footer className="lks-footer shrink-0 border-t bg-background px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:px-5">
          {saveFooter}
        </footer>
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
        className={cn("flex items-center gap-1 text-xs text-muted-foreground")}
        title="Jawaban tetap tersimpan di perangkatmu"
      >
        <CloudOff className="size-3" /> Tersimpan lokal
      </span>
    );
  }
  return null;
}

export function useLksAvailability(moduleId: string) {
  const [state, setState] = useState<{
    moduleId: string;
    availability: "loading" | "available" | "unavailable";
  }>({ moduleId, availability: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/lks/${moduleId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (cancelled) return;
        setState({
          moduleId,
          availability:
            (data.pertanyaan?.length ?? 0) > 0 ? "available" : "unavailable",
        });
      })
      .catch(() => {
        if (!cancelled) {
          setState({ moduleId, availability: "unavailable" });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [moduleId]);

  if (state.moduleId !== moduleId) {
    return "loading" as const;
  }
  return state.availability;
}
