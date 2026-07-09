"use client";

import { FlaskConical } from "lucide-react";

export function PraktikumPlaceholder({
  judul,
  deskripsi,
}: {
  judul: string;
  deskripsi?: string | null;
}) {
  return (
    <div className="flex h-full min-h-[12rem] flex-col items-center justify-center gap-3 px-6 py-8 text-center">
      <div className="rounded-full bg-primary/10 p-4 text-primary">
        <FlaskConical className="size-8" aria-hidden />
      </div>
      <div className="max-w-sm space-y-1">
        <h2 className="text-lg font-semibold">Simulasi sedang disiapkan</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {deskripsi ??
            `Simulasi interaktif untuk modul "${judul}" akan segera hadir. Kamu tetap bisa membaca panduan singkat di panel bawah.`}
        </p>
      </div>
    </div>
  );
}
