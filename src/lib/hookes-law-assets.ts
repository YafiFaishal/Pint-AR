/**
 * Aset AR khusus modul Hukum Hooke dan Elastisitas Pegas.
 */

export const HOOKES_LAW_AR_GLB_URL = "/models/hooke-elasticity-v2.glb";
export const HOOKES_LAW_AR_USDZ_URL = "/models/hooke-elasticity-v2.usdz";

export const HOOKES_LAW_AR_GLB_UNAVAILABLE_MESSAGE =
  "Aset AR Pegas belum tersedia. Gunakan simulasi 3D interaktif.";

export const HOOKES_LAW_AR_IOS_UNAVAILABLE_MESSAGE =
  "Aset AR iOS Pegas belum tersedia. Gunakan simulasi 3D interaktif.";

export const HOOKES_LAW_AR_IOS_HINT =
  "AR iOS belum tersedia. File hooke-elasticity-v2.usdz belum ditambahkan.";

export const HOOKES_LAW_AR_DESKTOP_HINT =
  "AR tersedia di perangkat mobile. Gunakan mode 3D interaktif di desktop.";

export const HOOKES_LAW_AR_GLB_HINT =
  "Aset AR belum tersedia. File GLB belum ditambahkan.";

export type HookesLawArAssetStatus = {
  glb: boolean;
  usdz: boolean;
};

export type HookesLawArButtonState = {
  aktif: boolean;
  petunjuk: string | null;
  toastSaatTekan: string | null;
};

export type HookesLawArModelUrls = {
  glb: string;
  usdz: string;
};

export function getHookesLawArModelUrls(): HookesLawArModelUrls {
  return {
    glb: HOOKES_LAW_AR_GLB_URL,
    usdz: HOOKES_LAW_AR_USDZ_URL,
  };
}

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

export async function checkHookesLawArAssetsAvailable(): Promise<HookesLawArAssetStatus> {
  const [glb, usdz] = await Promise.all([
    headOk(HOOKES_LAW_AR_GLB_URL),
    headOk(HOOKES_LAW_AR_USDZ_URL),
  ]);
  return { glb, usdz };
}

export function getHookesLawArButtonState(
  status: HookesLawArAssetStatus | null,
): HookesLawArButtonState {
  if (!status) {
    return { aktif: false, petunjuk: null, toastSaatTekan: null };
  }

  if (isDesktopBrowser()) {
    return {
      aktif: false,
      petunjuk: HOOKES_LAW_AR_DESKTOP_HINT,
      toastSaatTekan: null,
    };
  }

  if (isIosDevice()) {
    if (!status.usdz) {
      return {
        aktif: false,
        petunjuk: HOOKES_LAW_AR_IOS_HINT,
        toastSaatTekan: HOOKES_LAW_AR_IOS_UNAVAILABLE_MESSAGE,
      };
    }
    return { aktif: true, petunjuk: null, toastSaatTekan: null };
  }

  if (!status.glb) {
    return {
      aktif: false,
      petunjuk: HOOKES_LAW_AR_GLB_HINT,
      toastSaatTekan: HOOKES_LAW_AR_GLB_UNAVAILABLE_MESSAGE,
    };
  }

  return { aktif: true, petunjuk: null, toastSaatTekan: null };
}

export function shouldMountHookesLawArViewer(
  status: HookesLawArAssetStatus | null,
): boolean {
  if (!status?.glb) return false;
  if (isIosDevice()) return status.usdz;
  if (isDesktopBrowser()) return false;
  return true;
}
