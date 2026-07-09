"use client";

/**
 * Contoh penggunaan PracticumShell — tidak dipakai di routing produksi.
 * Referensi saat migrasi modul praktikum ke layout baru.
 */
import { useState } from "react";
import { Box } from "lucide-react";
import { PracticumShell } from "@/components/praktikum/practicum-shell";
import { SimulasiInteraktifBadge } from "@/components/practicum-interaktif-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export function PracticumShellDemo() {
  const [nilai, setNilai] = useState(50);

  return (
    <PracticumShell
      title="Demo PracticumShell"
      moduleId="00000000-0000-0000-0000-000000000000"
      badge={<SimulasiInteraktifBadge />}
      scene={
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
          <div
            className="size-24 rounded-full bg-primary/80 shadow-lg transition-transform duration-300"
            style={{ transform: `scale(${0.6 + nilai / 100})` }}
          />
        </div>
      }
      sceneOverlay={
        <span className="inline-flex rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur-sm">
          Scene placeholder
        </span>
      }
      quickInfo={
        <div className="rounded-md border bg-background/90 px-3 py-2 text-center text-xs shadow-sm backdrop-blur-sm">
          Nilai demo: <strong className="tabular-nums">{nilai}</strong>
        </div>
      }
      controls={
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Slider demo</span>
            <span className="text-muted-foreground tabular-nums">{nilai}</span>
          </div>
          <Slider
            min={0}
            max={100}
            step={1}
            value={[nilai]}
            onValueChange={(v) => setNilai(Array.isArray(v) ? v[0] : v)}
          />
        </div>
      }
      guide={
        <div className="space-y-2 text-sm">
          <h2 className="font-semibold">Langkah 1: Amati Scene</h2>
          <p className="text-muted-foreground">
            Ini slot <code className="text-xs">guide</code>. Di mobile, buka tab
            Panduan di bottom sheet.
          </p>
        </div>
      }
      arButton={
        <Button className="w-full gap-2" variant="outline" disabled>
          <Box className="size-4" />
          Lihat di Meja (AR) — demo
        </Button>
      }
    />
  );
}
