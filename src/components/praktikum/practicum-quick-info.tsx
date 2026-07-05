"use client";

import { cn } from "@/lib/utils";

export type PracticumQuickInfoItem = {
  key: string;
  label: string;
  value: string;
  valueClassName?: string;
  sub?: string;
  subClassName?: string;
};

type PracticumQuickInfoProps = {
  items: PracticumQuickInfoItem[];
  /** Jumlah kolom grid — default 3 (Tata Surya, Newton) */
  columns?: 3 | 4;
};

const CARD_CLASS =
  "min-w-0 rounded-md border bg-background px-2 py-1.5 text-center shadow-sm lg:bg-background/90 lg:backdrop-blur-sm";

const LABEL_CLASS = "text-[9px] font-medium text-muted-foreground lg:text-[10px]";
const VALUE_CLASS = "truncate text-xs font-semibold tabular-nums";
const SUB_CLASS = "mt-0.5 truncate text-[8px] lg:text-[9px]";

const GRID_CLASS = {
  3: "grid w-full grid-cols-3 gap-1.5 lg:gap-2",
  4: "grid w-full grid-cols-4 gap-1.5 lg:gap-2",
} as const;

/**
 * Ringkasan nilai di bawah scene (mobile) / overlay scene (desktop).
 * Pola visual mengikuti modul Tata Surya.
 */
export function PracticumQuickInfo({
  items,
  columns = 3,
}: PracticumQuickInfoProps) {
  return (
    <div className={cn("w-full shrink-0", GRID_CLASS[columns])}>
      {items.map(({ key, label, value, valueClassName, sub, subClassName }) => (
        <div key={key} className={CARD_CLASS}>
          <p className={LABEL_CLASS}>{label}</p>
          <p className={cn(VALUE_CLASS, valueClassName)}>{value}</p>
          {sub ? (
            <p className={cn(SUB_CLASS, subClassName)}>{sub}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
