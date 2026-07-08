"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";
import type { LangkahPraktikum } from "@/db/schema";
import { usePracticumPanelOptional } from "@/components/praktikum/practicum-panel-context";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

/** Instruksi global saat pengguna berada di viewer 3D (belum masuk AR). */
export const INSTRUKSI_3D = {
  judul: "Amati Model 3D",
  deskripsi:
    "Putar model dengan satu jari, cubit untuk memperbesar, lalu ikuti langkah praktikum dan isi LKS.",
} as const;

export const INSTRUKSI_NEWTON_3D = {
  judul: "Simulasi Gaya & Gerak",
  deskripsi:
    "Atur massa dan gaya dengan slider, baca percepatan (a = F/m), lalu tekan Dorong untuk menggerakkan balok di lintasan.",
} as const;

export const INSTRUKSI_RANGKAIAN_3D = {
  judul: "Simulasi Rangkaian Listrik",
  deskripsi:
    "Nyalakan saklar, atur tegangan dan hambatan, lalu amati arus (I = V/R) serta lampu yang menyala saat rangkaian tertutup.",
} as const;

export const INSTRUKSI_TATA_SURYA_3D = {
  judul: "Simulasi Orbit Planet",
  deskripsi:
    "Amati planet mengorbit Matahari, ubah jarak orbit planet terpilih, lalu bandingkan periode revolusi (T = √r³).",
} as const;

export const INSTRUKSI_JATUH_BEBAS_3D = {
  judul: "Simulasi Gerak Jatuh Bebas",
  deskripsi:
    "Atur ketinggian dan gravitasi, pilih mode udara atau hampa, lalu tekan Jatuhkan dan amati waktu jatuh (t) serta kecepatan akhir (v).",
} as const;

export const INSTRUKSI_REAKSI_KIMIA_3D = {
  judul: "Simulasi Reaksi Kimia",
  deskripsi:
    "Atur volume larutan A dan B, pilih jenis reaksi, lalu tekan Campurkan dan amati perubahan warna, suhu, pH, serta gelembung.",
} as const;

export const INSTRUKSI_ARCHIMEDES_3D = {
  judul: "Simulasi Hukum Archimedes",
  deskripsi:
    "Atur massa dan volume benda, pilih jenis cairan, lalu tekan Masukkan Benda dan bandingkan gaya berat (W) dengan gaya apung (Fₐ).",
} as const;

export const INSTRUKSI_CAHAYA_OPTIK_3D = {
  judul: "Simulasi Pemantulan & Pembiasan",
  deskripsi:
    "Atur sudut datang dan mode eksperimen, pilih medium pada pembiasan, lalu tekan Pancarkan Cahaya dan bandingkan sudut pantul atau bias terhadap garis normal.",
} as const;

export const INSTRUKSI_BANDUL_SEDERHANA_3D = {
  judul: "Simulasi Getaran Bandul",
  deskripsi:
    "Atur panjang tali, massa, dan sudut awal, pilih lingkungan gravitasi, lalu tekan Mulai Ayunan dan amati periode teori bandul.",
} as const;

export const INSTRUKSI_HOOKE_SPRING_3D = {
  judul: "Simulasi Elastisitas Pegas",
  deskripsi:
    "Atur konstanta pegas dan massa beban, pilih mode Beban Statis atau Getaran Pegas, lalu amati hubungan F = kx dan periode T = 2π√(m/k).",
} as const;

export const INSTRUKSI_THERMAL_CHANGE_3D = {
  judul: "Simulasi Kalor & Suhu",
  deskripsi:
    "Atur massa, daya pemanas, dan jenis zat, lalu jalankan pemanasan dan amati hubungan Q = mcΔT pada grafik suhu terhadap waktu.",
} as const;

export const INSTRUKSI_AR = {
  judul: "Arahkan Kamera ke Meja",
  deskripsi:
    "Gerakkan HP perlahan ke permukaan meja yang datar dan cukup terang sampai alat 3D muncul.",
} as const;

function isLangkahPenempatanAr(l: LangkahPraktikum): boolean {
  const teks = `${l.judul ?? ""} ${l.instruksi}`.toLowerCase();
  return /kamera|meja|arahkan/.test(teks);
}

export type PanduanLangkahProps = {
  langkah: LangkahPraktikum[];
  arAktif: boolean;
  newton?: boolean;
  rangkaian?: boolean;
  tataSurya?: boolean;
  jatuhBebas?: boolean;
  reaksiKimia?: boolean;
  archimedes?: boolean;
  cahayaOptik?: boolean;
  bandulSederhana?: boolean;
  hookeSpring?: boolean;
  thermalChange?: boolean;
};

function PanduanNavFooter({
  idx,
  total,
  onPrev,
  onNext,
  onFinish,
}: {
  idx: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onFinish: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Button
        variant="outline"
        className="min-h-11 flex-1"
        onClick={onPrev}
        disabled={idx === 0}
      >
        <ChevronLeft className="size-4" />
        Sebelumnya
      </Button>
      {idx < total - 1 ? (
        <Button className="min-h-11 flex-1" onClick={onNext}>
          Selanjutnya
          <ChevronRight className="size-4" />
        </Button>
      ) : (
        <Button className="min-h-11 flex-1" onClick={onFinish}>
          <CheckCircle2 className="size-4" />
          Selesai
        </Button>
      )}
    </div>
  );
}

function PanduanSelesaiView({
  onBackToSimulation,
  onOpenLKS,
  onRestartGuide,
  lksAvailable,
}: {
  onBackToSimulation: () => void;
  onOpenLKS: () => void;
  onRestartGuide: () => void;
  lksAvailable: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-5 py-4 text-center sm:py-6">
      <CheckCircle2 className="size-10 text-primary" aria-hidden />
      <div className="max-w-sm space-y-2">
        <h2 className="text-2xl font-semibold leading-snug">Panduan Selesai</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Kamu sudah membaca seluruh langkah panduan. Sekarang lakukan
          eksperimen dan catat hasil pengamatanmu pada LKS.
        </p>
      </div>
      <div className="flex w-full max-w-sm flex-col gap-2.5">
        <Button
          type="button"
          variant="outline"
          className="min-h-12 w-full"
          onClick={onBackToSimulation}
        >
          Kembali ke Simulasi
        </Button>
        <Button
          type="button"
          className="min-h-12 w-full gap-2"
          disabled={!lksAvailable}
          onClick={onOpenLKS}
        >
          <ClipboardList className="size-4 shrink-0" aria-hidden />
          {lksAvailable ? "Kerjakan LKS" : "LKS belum tersedia"}
        </Button>
      </div>
      <button
        type="button"
        className="min-h-11 text-sm text-muted-foreground underline-offset-4 hover:underline"
        onClick={onRestartGuide}
      >
        Ulangi panduan
      </button>
    </div>
  );
}

export function PanduanLangkah({
  langkah,
  arAktif,
  newton = false,
  rangkaian = false,
  tataSurya = false,
  jatuhBebas = false,
  reaksiKimia = false,
  archimedes = false,
  cahayaOptik = false,
  bandulSederhana = false,
  hookeSpring = false,
  thermalChange = false,
}: PanduanLangkahProps) {
  const panel = usePracticumPanelOptional();
  const total = langkah.length;
  const [idx, setIdx] = useState(0);
  const [localSelesai, setLocalSelesai] = useState(false);
  const selesai = panel?.guideComplete ?? localSelesai;

  const langkahAktif = langkah[idx];
  const persen = useMemo(
    () => (total > 0 ? Math.round(((idx + 1) / total) * 100) : 0),
    [idx, total],
  );

  const tampil = useMemo(() => {
    if (!langkahAktif) return null;
    if (isLangkahPenempatanAr(langkahAktif)) {
      if (arAktif) return INSTRUKSI_AR;
      if (newton) return INSTRUKSI_NEWTON_3D;
      if (rangkaian) return INSTRUKSI_RANGKAIAN_3D;
      if (tataSurya) return INSTRUKSI_TATA_SURYA_3D;
      if (jatuhBebas) return INSTRUKSI_JATUH_BEBAS_3D;
      if (reaksiKimia) return INSTRUKSI_REAKSI_KIMIA_3D;
      if (archimedes) return INSTRUKSI_ARCHIMEDES_3D;
      if (cahayaOptik) return INSTRUKSI_CAHAYA_OPTIK_3D;
      if (bandulSederhana) return INSTRUKSI_BANDUL_SEDERHANA_3D;
      if (hookeSpring) return INSTRUKSI_HOOKE_SPRING_3D;
      if (thermalChange) return INSTRUKSI_THERMAL_CHANGE_3D;
      return INSTRUKSI_3D;
    }
    return { judul: langkahAktif.judul, deskripsi: langkahAktif.instruksi };
  }, [langkahAktif, arAktif, newton, rangkaian, tataSurya, jatuhBebas, reaksiKimia, archimedes, cahayaOptik, bandulSederhana, hookeSpring, thermalChange]);

  const goPrev = useCallback(() => setIdx((i) => Math.max(0, i - 1)), []);
  const goNext = useCallback(
    () => setIdx((i) => Math.min(total - 1, i + 1)),
    [total],
  );
  const goFinish = useCallback(() => {
    if (panel) {
      panel.setGuideComplete(true);
    } else {
      setLocalSelesai(true);
    }
    toast.success("Panduan selesai dibaca.");
  }, [panel]);

  const restartGuide = useCallback(() => {
    panel?.setGuideComplete(false);
    setLocalSelesai(false);
    setIdx(0);
    panel?.scrollToTop();
  }, [panel]);

  useEffect(() => {
    if (!panel || selesai || total === 0) {
      panel?.setFooter(null);
      return;
    }

    panel.setFooter(
      <PanduanNavFooter
        idx={idx}
        total={total}
        onPrev={goPrev}
        onNext={goNext}
        onFinish={goFinish}
      />,
    );

    return () => panel.setFooter(null);
  }, [panel, idx, total, selesai, goPrev, goNext, goFinish]);

  useEffect(() => {
    panel?.scrollToTop();
  }, [panel, idx]);

  if (total === 0) {
    return (
      <p className="text-sm leading-relaxed text-muted-foreground">
        Belum ada panduan langkah untuk modul ini.
      </p>
    );
  }

  if (selesai) {
    return (
      <PanduanSelesaiView
        onBackToSimulation={() => {
          panel?.backToSimulation();
          setLocalSelesai(false);
        }}
        onOpenLKS={() => panel?.openLKS()}
        onRestartGuide={restartGuide}
        lksAvailable={panel?.lksAvailable ?? false}
      />
    );
  }

  const navFooter = (
    <PanduanNavFooter
      idx={idx}
      total={total}
      onPrev={goPrev}
      onNext={goNext}
      onFinish={goFinish}
    />
  );

  return (
    <div>
      <div className="mb-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold leading-snug">
            Panduan Praktikum
          </h3>
          <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
            {idx + 1}/{total}
          </span>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Langkah {idx + 1} dari {total}
            </span>
            <span className="tabular-nums">{persen}%</span>
          </div>
          <Progress value={persen} className="h-1.5" />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Langkah {idx + 1}
        </p>
        {tampil?.judul ? (
          <h2 className="text-base font-semibold leading-snug sm:text-lg">
            {tampil.judul}
          </h2>
        ) : null}
        <p className="text-sm leading-[1.55] text-foreground/90">
          {tampil?.deskripsi}
        </p>
      </div>

      {!panel ? (
        <div className="mt-6 border-t pt-4 lg:mt-8">{navFooter}</div>
      ) : null}
    </div>
  );
}
