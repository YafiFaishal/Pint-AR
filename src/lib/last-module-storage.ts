const STORAGE_KEY = "pintar-last-module";

export type LastModule = {
  id: string;
  judul: string;
  openedAt: string;
};

export function getLastModule(): LastModule | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LastModule;
    if (!parsed?.id || !parsed?.judul) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setLastModule(modul: Pick<LastModule, "id" | "judul">) {
  if (typeof window === "undefined") return;
  const payload: LastModule = {
    id: modul.id,
    judul: modul.judul,
    openedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}
