"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import type { LangkahPraktikum } from "@/db/schema";
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
};

export function PanduanLangkah({
  langkah,
  arAktif,
  newton = false,
  rangkaian = false,
  tataSurya = false,
  jatuhBebas = false,
}: PanduanLangkahProps) {
  const total = langkah.length;
  const [idx, setIdx] = useState(0);
  const [selesai, setSelesai] = useState(false);

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
      return INSTRUKSI_3D;
    }
    return { judul: langkahAktif.judul, deskripsi: langkahAktif.instruksi };
  }, [langkahAktif, arAktif, newton, rangkaian, tataSurya, jatuhBebas]);

  if (total === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Belum ada panduan langkah untuk modul ini.
      </p>
    );
  }

  if (selesai) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <CheckCircle2 className="size-14 text-primary" />
        <div>
          <h2 className="text-xl font-semibold">Praktikum Selesai!</h2>
          <p className="text-muted-foreground">
            Kamu telah menyelesaikan seluruh langkah. Jangan lupa isi LKS-mu ya.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setSelesai(false);
              setIdx(0);
            }}
          >
            Ulangi
          </Button>
          <Button render={<Link href="/siswa" />} nativeButton={false}>
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="font-medium text-muted-foreground">
            Langkah {idx + 1} dari {total}
          </span>
          <span className="text-muted-foreground">{persen}%</span>
        </div>
        <Progress value={persen} />
      </div>

      <div className="flex-1">
        {tampil?.judul ? (
          <h2 className="mb-2 text-lg font-semibold">{tampil.judul}</h2>
        ) : null}
        <p className="leading-relaxed text-foreground/90">{tampil?.deskripsi}</p>
      </div>

      <div className="mt-6 flex items-center justify-between gap-2">
        <Button
          variant="outline"
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0}
        >
          <ChevronLeft /> Sebelumnya
        </Button>
        {idx < total - 1 ? (
          <Button onClick={() => setIdx((i) => Math.min(total - 1, i + 1))}>
            Selanjutnya <ChevronRight />
          </Button>
        ) : (
          <Button
            onClick={() => {
              setSelesai(true);
              toast.success("Praktikum selesai! Kerja bagus. 🎉");
            }}
          >
            <CheckCircle2 /> Selesaikan
          </Button>
        )}
      </div>
    </div>
  );
}
