"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type PracticumQuickInfoItem = {
  key: string;
  label: string;
  value: string;
  valueClassName?: string;
};

type PracticumQuickInfoProps = {
  items: PracticumQuickInfoItem[];
  columns?: 3 | 4;
  /** Kolom grid di layar < sm (640px). Default: sama dengan `columns`. */
  mobileColumns?: 2 | 3 | 4;
  /** Izinkan value wrap; hilangkan truncate (untuk teks panjang seperti indeks bias). */
  wrapValues?: boolean;
  /** Key item yang boleh wrap maksimal 2 baris (mis. status). */
  clampValueKeys?: string[];
};

const CARD_CLASS =
  "flex min-h-[4rem] min-w-0 flex-col items-center justify-center rounded-[14px] border bg-background px-1.5 py-2 text-center transition-colors duration-300 sm:min-h-[4.25rem]";

const CARD_CLASS_WRAP =
  "flex min-h-[3.5rem] min-w-0 flex-col items-center justify-center rounded-[14px] border bg-background px-1 py-1.5 text-center transition-colors duration-300 sm:min-h-[4.25rem] sm:px-1.5 sm:py-2";

const LABEL_CLASS =
  "text-[12px] font-medium leading-none text-muted-foreground sm:text-[13px]";
const VALUE_CLASS =
  "mt-1 w-full truncate text-[15px] font-semibold tabular-nums leading-tight sm:text-[16px]";
const VALUE_WRAP_CLASS =
  "mt-1 w-full min-w-0 whitespace-normal break-words text-[clamp(0.8125rem,2.6vw,1rem)] font-semibold tabular-nums leading-snug [overflow-wrap:anywhere] sm:text-[16px] sm:leading-tight";

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

function gridClass(columns: 3 | 4, mobileColumns?: 2 | 3 | 4): string {
  const desktop = columns === 4 ? "sm:grid-cols-4" : "sm:grid-cols-3";
  const mobile = mobileColumns ?? columns;

  if (mobile === 2) return cn("grid-cols-2", desktop);
  if (mobile === 3) return cn("grid-cols-3", desktop);
  if (mobile === 4) return cn("grid-cols-4", desktop);
  return columns === 4 ? "grid-cols-4" : "grid-cols-3";
}

export function PracticumQuickInfo({
  items,
  columns = 3,
  mobileColumns,
  wrapValues = false,
  clampValueKeys = [],
}: PracticumQuickInfoProps) {
  const changed = useChangedKeys(items);
  const clampKeys = new Set(clampValueKeys);

  return (
    <div
      className={cn(
        "grid w-full min-w-0 gap-1.5 sm:gap-2",
        gridClass(columns, mobileColumns),
      )}
    >
      {items.map(({ key, label, value, valueClassName }) => (
        <div
          key={key}
          className={cn(
            wrapValues ? CARD_CLASS_WRAP : CARD_CLASS,
            changed.has(key) && "border-foreground/25 bg-muted/50",
          )}
        >
          <p className={LABEL_CLASS}>{label}</p>
          <p
            className={cn(
              wrapValues ? VALUE_WRAP_CLASS : VALUE_CLASS,
              clampKeys.has(key) && "line-clamp-2",
              valueClassName,
            )}
          >
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}
