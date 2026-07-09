"use client";

import { Box, ClipboardList, ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: Box,
    label: "Simulasi 3D",
    desc: "Ubah variabel, amati model",
  },
  {
    icon: ScanLine,
    label: "Augmented Reality",
    desc: "Tampilkan objek di lingkungan nyata",
  },
  {
    icon: ClipboardList,
    label: "LKS terintegrasi",
    desc: "Catat hasil eksplorasi",
  },
] as const;

export function LandingFeatureStrip({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "grid w-full max-w-lg grid-cols-1 gap-2 sm:max-w-2xl sm:grid-cols-3 sm:gap-3",
        className,
      )}
    >
      {FEATURES.map(({ icon: Icon, label, desc }) => (
        <div
          key={label}
          className="flex items-start gap-2.5 rounded-xl border border-border/80 bg-card/60 px-3 py-2.5 text-left"
        >
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-4" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-semibold leading-snug">{label}</span>
            <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
              {desc}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
