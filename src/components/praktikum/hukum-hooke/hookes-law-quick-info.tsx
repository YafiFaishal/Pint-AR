"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { PracticumQuickInfoItem } from "@/components/praktikum/practicum-quick-info";

function useChangedKeys(items: PracticumQuickInfoItem[]) {
  const [changed, setChanged] = useState<Set<string>>(new Set());
  const prev = useRef<Record<string, string>>({});

  useEffect(() => {
    const next = new Set<string>();
    for (const item of items) {
      if (
        prev.current[item.key] !== undefined &&
        prev.current[item.key] !== item.value
      ) {
        next.add(item.key);
      }
      prev.current[item.key] = item.value;
    }
    if (next.size === 0) return;

    let clearHighlight: ReturnType<typeof setTimeout> | undefined;
    const show = setTimeout(() => {
      setChanged(next);
      clearHighlight = setTimeout(() => setChanged(new Set()), 350);
    }, 0);

    return () => {
      clearTimeout(show);
      if (clearHighlight) clearTimeout(clearHighlight);
    };
  }, [items]);

  return changed;
}

function valueClassName(key: string): string {
  if (key === "osc") {
    return cn(
      "mt-0.5 w-full min-w-0 font-semibold tabular-nums leading-tight",
      "whitespace-nowrap text-[clamp(0.9rem,3.5vw,1.1rem)] sm:text-[16px]",
    );
  }
  if (key === "frequency" || key === "extension") {
    return cn(
      "mt-0.5 w-full min-w-0 font-semibold tabular-nums leading-tight",
      "whitespace-nowrap text-[clamp(0.78rem,3.2vw,1.05rem)] sm:text-[15px]",
    );
  }
  return cn(
    "mt-0.5 w-full min-w-0 font-semibold tabular-nums leading-tight",
    "whitespace-nowrap text-[clamp(0.85rem,3.4vw,1.1rem)] sm:text-[16px]",
  );
}

/** Kartu statistik compact satu baris — khusus modul Hukum Hooke. */
export function HookesLawQuickInfo({
  items,
}: {
  items: PracticumQuickInfoItem[];
}) {
  const changed = useChangedKeys(items);

  return (
    <div
      className={cn(
        "grid w-full min-w-0",
        "gap-1.5 sm:gap-2",
        "max-[339px]:gap-1 max-[339px]:overflow-x-auto",
        "grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)]",
        "max-[339px]:grid-cols-[repeat(4,minmax(68px,1fr))]",
        "sm:grid-cols-4",
      )}
    >
      {items.map(({ key, label, value, valueClassName: extra }) => (
        <div
          key={key}
          className={cn(
            "flex min-h-[4.75rem] min-w-0 flex-col items-center justify-center",
            "rounded-[14px] border bg-background px-1.5 py-2.5 text-center",
            "max-[339px]:min-h-[4.5rem] max-[339px]:px-1 max-[339px]:py-2",
            "sm:min-h-[4.25rem] sm:px-2 sm:py-2.5",
            "transition-colors duration-300",
            changed.has(key) && "border-foreground/25 bg-muted/50",
          )}
        >
          <p
            className={cn(
              "text-[11px] font-medium leading-none text-muted-foreground",
              "sm:text-[13px]",
            )}
          >
            {label}
          </p>
          <p className={cn(valueClassName(key), extra)}>{value}</p>
        </div>
      ))}
    </div>
  );
}
