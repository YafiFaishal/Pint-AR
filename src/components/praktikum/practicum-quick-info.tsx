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
  /** Strip lebih pendek untuk mobile (4 kolom rapat) */
  compact?: boolean;
};

const CARD_CLASS =
  "min-w-0 rounded-md border bg-background text-center shadow-sm lg:bg-background/90 lg:backdrop-blur-sm";

const LABEL_CLASS = "font-medium text-muted-foreground";
const VALUE_CLASS = "truncate font-semibold tabular-nums whitespace-nowrap";

const GRID_CLASS = {
  3: "grid w-full grid-cols-3 gap-1.5 lg:gap-2",
  4: "grid w-full grid-cols-4 gap-1.5 lg:gap-2",
} as const;

const COMPACT_GRID_CLASS = {
  3: "grid w-full grid-cols-3 gap-1",
  4: "grid w-full grid-cols-4 gap-1",
} as const;

/**
 * Ringkasan nilai di bawah scene (mobile) / overlay scene (desktop).
 * Pola visual mengikuti modul Tata Surya.
 */
export function PracticumQuickInfo({
  items,
  columns = 3,
  compact = false,
}: PracticumQuickInfoProps) {
  const cardPad = compact ? "px-1 py-1" : "px-2 py-1.5";
  const labelSize = compact
    ? "text-[8px] leading-none lg:text-[10px]"
    : "text-[9px] lg:text-[10px]";
  const valueSize = compact
    ? "text-[10px] leading-tight lg:text-xs"
    : "text-xs";
  const subSize = compact
    ? "mt-0.5 truncate text-[7px] lg:text-[9px]"
    : "mt-0.5 truncate text-[8px] lg:text-[9px]";

  return (
    <div
      className={cn(
        "w-full shrink-0",
        compact ? COMPACT_GRID_CLASS[columns] : GRID_CLASS[columns],
        compact && "max-lg:max-h-[4.5rem]",
      )}
    >
      {items.map(({ key, label, value, valueClassName, sub, subClassName }) => (
        <div key={key} className={cn(CARD_CLASS, cardPad)}>
          <p className={cn(LABEL_CLASS, labelSize)}>{label}</p>
          <p className={cn(VALUE_CLASS, valueSize, valueClassName)}>{value}</p>
          {sub ? (
            <p className={cn(subSize, subClassName)}>{sub}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
