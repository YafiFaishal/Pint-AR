/** Skor untuk memilih modul kanonik saat judul duplikat (stub vs modul lengkap). */
export function skorModulKanonic({
  jumlahLangkah,
  totalSoalLks,
  aktivitas = 0,
}: {
  jumlahLangkah: number;
  totalSoalLks: number;
  aktivitas?: number;
}): number {
  return jumlahLangkah * 10_000 + totalSoalLks * 100 + aktivitas;
}

export function kunciJudulModul(judul: string): string {
  return judul.trim().toLowerCase();
}

/**
 * Satu entri per judul — simpan modul dengan konten paling lengkap.
 */
export function dedupeByJudulModul<T extends { judul: string }>(
  items: T[],
  skor: (item: T) => number,
): T[] {
  const byJudul = new Map<string, T>();

  for (const item of items) {
    const key = kunciJudulModul(item.judul);
    const itemScore = skor(item);
    const existing = byJudul.get(key);

    if (!existing || itemScore > skor(existing)) {
      byJudul.set(key, item);
    }
  }

  return Array.from(byJudul.values());
}
