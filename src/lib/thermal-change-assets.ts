/**
 * Aset AR modul Kalor dan Perubahan Suhu — satu pasang GLB+USDZ per jenis zat.
 * GLB (Android/WebXR/Scene Viewer) animasi looping, USDZ (iOS Quick Look) statis.
 */

import type { ThermalMaterialId } from "@/lib/thermal-change-utils";

/** Nama file dasar per zat (ejaan file mengikuti aset yang di-generate). */
const THERMAL_AR_FILE: Record<ThermalMaterialId, string> = {
  water: "heat-water-ar",
  oil: "heat-oil-ar",
  aluminum: "heat-aluminium-ar",
  copper: "heat-copper-ar",
};

export type ThermalChangeArModelUrls = {
  glb: string;
  usdz: string;
};

/** Mapping URL aset AR berdasarkan zat terpilih (fallback: Air). */
export function getThermalChangeArModelUrls(
  materialId: ThermalMaterialId,
): ThermalChangeArModelUrls {
  const file = THERMAL_AR_FILE[materialId] ?? THERMAL_AR_FILE.water;
  return {
    glb: `/models/${file}.glb`,
    usdz: `/models/${file}.usdz`,
  };
}

export const THERMAL_CHANGE_AR_UNAVAILABLE_MESSAGE =
  "Model AR untuk zat ini belum tersedia.";

export const THERMAL_CHANGE_AR_IOS_HINT =
  "AR iOS untuk zat ini belum tersedia. Gunakan simulasi 3D interaktif.";

export const THERMAL_CHANGE_AR_DESKTOP_HINT =
  "AR tersedia di perangkat mobile. Gunakan mode 3D interaktif di desktop.";

export const THERMAL_CHANGE_AR_GLB_HINT =
  "Model AR untuk zat ini belum tersedia. Gunakan simulasi 3D interaktif.";

export type ThermalChangeArAssetStatus = {
  glb: boolean;
  usdz: boolean;
};

export type ThermalChangeArButtonState = {
  aktif: boolean;
  petunjuk: string | null;
  toastSaatTekan: string | null;
};

function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    isIosDevice() ||
    /Android/i.test(navigator.userAgent) ||
    /Mobile/i.test(navigator.userAgent)
  );
}

function isDesktopBrowser(): boolean {
  return !isMobileDevice();
}

async function headOk(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

/** Cek ketersediaan aset AR untuk zat tertentu. */
export async function checkThermalChangeArAssetsAvailable(
  materialId: ThermalMaterialId,
): Promise<ThermalChangeArAssetStatus> {
  const urls = getThermalChangeArModelUrls(materialId);
  const [glb, usdz] = await Promise.all([headOk(urls.glb), headOk(urls.usdz)]);
  return { glb, usdz };
}

export function getThermalChangeArButtonState(
  status: ThermalChangeArAssetStatus | null,
): ThermalChangeArButtonState {
  if (!status) {
    return { aktif: false, petunjuk: null, toastSaatTekan: null };
  }

  if (isDesktopBrowser()) {
    return {
      aktif: false,
      petunjuk: THERMAL_CHANGE_AR_DESKTOP_HINT,
      toastSaatTekan: null,
    };
  }

  if (isIosDevice()) {
    if (!status.usdz) {
      return {
        aktif: false,
        petunjuk: THERMAL_CHANGE_AR_IOS_HINT,
        toastSaatTekan: THERMAL_CHANGE_AR_UNAVAILABLE_MESSAGE,
      };
    }
    return { aktif: true, petunjuk: null, toastSaatTekan: null };
  }

  if (!status.glb) {
    return {
      aktif: false,
      petunjuk: THERMAL_CHANGE_AR_GLB_HINT,
      toastSaatTekan: THERMAL_CHANGE_AR_UNAVAILABLE_MESSAGE,
    };
  }

  return { aktif: true, petunjuk: null, toastSaatTekan: null };
}

export function shouldMountThermalChangeArViewer(
  status: ThermalChangeArAssetStatus | null,
): boolean {
  if (!status?.glb) return false;
  if (isIosDevice()) return status.usdz;
  if (isDesktopBrowser()) return false;
  return true;
}
