"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Smartphone,
  ScanLine,
  Sparkles,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Langkah = {
  judul: string;
  deskripsi: string;
  ilustrasi: React.ReactNode;
};

const LANGKAH: Langkah[] = [
  {
    judul: "Arahkan Kamera ke Meja",
    deskripsi:
      "Buka kamera dan arahkan perlahan ke permukaan meja yang datar dan cukup terang.",
    ilustrasi: (
      <div className="relative flex h-40 items-end justify-center">
        <Smartphone className="size-16 animate-bounce text-primary" />
        <div className="absolute bottom-0 h-3 w-40 rounded-full bg-primary/20 blur-sm" />
      </div>
    ),
  },
  {
    judul: "Tunggu Deteksi Permukaan",
    deskripsi:
      "Sistem akan memindai meja. Gerakkan HP pelan-pelan sampai area terdeteksi.",
    ilustrasi: (
      <div className="flex h-40 items-center justify-center">
        <div className="relative flex size-28 items-center justify-center rounded-xl border-2 border-dashed border-primary">
          <span className="absolute inset-0 animate-ping rounded-xl border-2 border-primary/40" />
          <ScanLine className="size-12 animate-pulse text-primary" />
        </div>
      </div>
    ),
  },
  {
    judul: "Alat Lab Muncul!",
    deskripsi:
      "Alat simulasi 3D akan muncul di meja. Sentuh untuk memutar, cubit untuk memperbesar.",
    ilustrasi: (
      <div className="flex h-40 items-center justify-center">
        <div className="animate-bounce">
          <Sparkles className="size-16 text-primary" />
        </div>
      </div>
    ),
  },
];

export function OnboardingTour({
  firstModuleId,
}: {
  firstModuleId: string | null;
}) {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [fase, setFase] = useState<"tur" | "akhir">("tur");
  const [proses, setProses] = useState(false);

  const total = LANGKAH.length;
  const langkah = LANGKAH[idx];

  async function tandaiSelesai() {
    try {
      await fetch("/api/onboarding", { method: "POST" });
    } catch {
      // tetap lanjut walau gagal menyimpan status
    }
  }

  async function cobaSekarang() {
    setProses(true);
    await tandaiSelesai();
    router.push(firstModuleId ? `/praktikum/${firstModuleId}` : "/siswa");
    router.refresh();
  }

  async function keDaftarModul() {
    setProses(true);
    await tandaiSelesai();
    router.push("/siswa");
    router.refresh();
  }

  if (fase === "akhir") {
    return (
      <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
          <Rocket className="size-10 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Siap Bereksperimen!</h1>
          <p className="mt-1 text-muted-foreground">
            Kamu sudah paham dasarnya. Ayo coba simulasi AR pertamamu.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2">
          <Button size="lg" onClick={cobaSekarang} disabled={proses}>
            {proses ? "Membuka…" : "Coba Sekarang"}
          </Button>
          <Button
            variant="ghost"
            onClick={keDaftarModul}
            disabled={proses}
          >
            Ke Daftar Modul
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFase("akhir")}
          className="text-muted-foreground"
        >
          Lewati Tur
        </Button>
      </div>

      <div className="rounded-2xl border bg-card p-8">
        {langkah.ilustrasi}
      </div>

      <div className="text-center">
        <h1 className="text-xl font-bold">{langkah.judul}</h1>
        <p className="mt-2 text-muted-foreground">{langkah.deskripsi}</p>
      </div>

      {/* Indikator progres */}
      <div className="flex justify-center gap-2" aria-label={`Langkah ${idx + 1} dari ${total}`}>
        {LANGKAH.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-2 rounded-full transition-all",
              i === idx ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30",
            )}
          />
        ))}
      </div>

      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0}
        >
          <ChevronLeft /> Kembali
        </Button>
        {idx < total - 1 ? (
          <Button onClick={() => setIdx((i) => Math.min(total - 1, i + 1))}>
            Lanjut <ChevronRight />
          </Button>
        ) : (
          <Button onClick={() => setFase("akhir")}>
            Selesai <ChevronRight />
          </Button>
        )}
      </div>
    </div>
  );
}
