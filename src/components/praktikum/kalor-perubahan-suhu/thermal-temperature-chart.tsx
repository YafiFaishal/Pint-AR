"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

export type ChartPoint = {
  timeS: number;
  tempA: number;
  tempB?: number;
};

type ThermalTemperatureChartProps = {
  points: ChartPoint[];
  mode: "heating" | "comparison";
  labelA?: string;
  labelB?: string;
  className?: string;
  compact?: boolean;
};

export function ThermalTemperatureChart({
  points,
  mode,
  labelA = "Zat A",
  labelB = "Zat B",
  className,
  compact = false,
}: ThermalTemperatureChartProps) {
  const { pathA, pathB, minT, maxT, maxTime } = useMemo(() => {
    if (points.length === 0) {
      return { pathA: "", pathB: "", minT: 20, maxT: 90, maxTime: 60 };
    }

    const temps = points.flatMap((p) =>
      p.tempB !== undefined ? [p.tempA, p.tempB] : [p.tempA],
    );
    const minT = Math.min(20, ...temps) - 2;
    const maxT = Math.max(90, ...temps) + 2;
    const maxTime = Math.max(60, ...points.map((p) => p.timeS));

    const w = 100;
    const h = 100;
    const pad = 8;

    const toX = (t: number) => pad + ((w - 2 * pad) * t) / maxTime;
    const toY = (temp: number) =>
      h - pad - ((h - 2 * pad) * (temp - minT)) / (maxT - minT);

    const pathA = points
      .map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.timeS).toFixed(2)},${toY(p.tempA).toFixed(2)}`)
      .join(" ");

    const pathB =
      mode === "comparison"
        ? points
          .filter((p) => p.tempB !== undefined)
          .map((p, i) =>
            `${i === 0 ? "M" : "L"}${toX(p.timeS).toFixed(2)},${toY(p.tempB!).toFixed(2)}`,
          )
          .join(" ")
        : "";

    return { pathA, pathB, minT, maxT, maxTime };
  }, [points, mode]);

  const height = compact ? 72 : 120;

  return (
    <div className={cn("w-full min-w-0", className)}>
      <div className="mb-1 flex items-center justify-between gap-2 text-[10px] text-muted-foreground sm:text-xs">
        <span>Grafik suhu–waktu</span>
        <div className="flex gap-2">
          <span className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-full bg-blue-500" />
            {mode === "comparison" ? labelA : "Suhu"}
          </span>
          {mode === "comparison" ? (
            <span className="flex items-center gap-1">
              <span className="inline-block size-2 rounded-full bg-amber-500" />
              {labelB}
            </span>
          ) : null}
        </div>
      </div>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full rounded-lg border bg-background/80"
        style={{ height }}
        role="img"
        aria-label={`Grafik suhu dari ${minT.toFixed(0)} hingga ${maxT.toFixed(0)} derajat Celsius, waktu hingga ${maxTime.toFixed(0)} detik`}
      >
        <line x1="8" y1="92" x2="96" y2="92" stroke="currentColor" strokeOpacity={0.15} strokeWidth="0.5" />
        <line x1="8" y1="8" x2="8" y2="92" stroke="currentColor" strokeOpacity={0.15} strokeWidth="0.5" />
        {pathA ? (
          <path d={pathA} fill="none" stroke="#3b82f6" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
        ) : null}
        {pathB ? (
          <path d={pathB} fill="none" stroke="#f59e0b" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
        ) : null}
      </svg>
      <p className="mt-1 text-[9px] text-muted-foreground sm:text-[10px]">
        Sumbu X: waktu simulasi (s) · Sumbu Y: suhu (°C)
      </p>
    </div>
  );
}
