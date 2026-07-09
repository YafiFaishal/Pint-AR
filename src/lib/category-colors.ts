import type { KategoriModul } from "@/lib/siswa-modul-utils";

export type CategoryKey = KategoriModul | "default";

export const CATEGORY_COLORS: Record<
  CategoryKey,
  { main: string; soft: string; border: string }
> = {
  Fisika: {
    main: "var(--physics)",
    soft: "var(--physics-soft)",
    border: "color-mix(in srgb, var(--physics) 22%, transparent)",
  },
  Kimia: {
    main: "var(--chemistry)",
    soft: "var(--chemistry-soft)",
    border: "color-mix(in srgb, var(--chemistry) 22%, transparent)",
  },
  Astronomi: {
    main: "var(--astronomy)",
    soft: "var(--astronomy-soft)",
    border: "color-mix(in srgb, var(--astronomy) 22%, transparent)",
  },
  default: {
    main: "var(--color-secondary)",
    soft: "var(--color-secondary-soft)",
    border: "var(--color-border)",
  },
};

export function getCategoryColors(kategori: KategoriModul) {
  return CATEGORY_COLORS[kategori] ?? CATEGORY_COLORS.default;
}
