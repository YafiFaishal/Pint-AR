"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type PracticumResultStripProps = {
  label: string;
  value: string;
  detail?: string;
  status?: string;
  highlight?: boolean;
  className?: string;
};

export function useValueHighlight(value: string | number | boolean) {
  const [highlight, setHighlight] = useState(false);
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current === value) return;
    prev.current = value;
    let clearHighlight: ReturnType<typeof setTimeout> | undefined;
    const show = setTimeout(() => {
      setHighlight(true);
      clearHighlight = setTimeout(() => setHighlight(false), 350);
    }, 0);
    return () => {
      clearTimeout(show);
      if (clearHighlight) clearTimeout(clearHighlight);
    };
  }, [value]);

  return highlight;
}

export function PracticumResultStrip({
  label,
  value,
  detail,
  status,
  highlight = false,
  className,
}: PracticumResultStripProps) {
  return (
    <div
      className={cn(
        "rounded-[14px] border bg-muted/30 px-3 py-2.5 transition-colors duration-300",
        highlight && "border-foreground/25 bg-muted/60",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-foreground/80">{label}</span>
        <span className="shrink-0 text-[15px] font-semibold tabular-nums leading-tight">
          {value}
        </span>
      </div>
      {detail ? (
        <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground tabular-nums">
          {detail}
        </p>
      ) : null}
      {status ? (
        <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
          {status}
        </p>
      ) : null}
    </div>
  );
}
