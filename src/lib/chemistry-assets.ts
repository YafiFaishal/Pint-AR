/**
 * Aset AR khusus modul Reaksi Kimia.
 * Simulasi 3D interaktif memakai primitive di React Three Fiber.
 */

export const CHEMISTRY_AR_GLB_URL = "/models/chemistry-reaction.glb";
export const CHEMISTRY_AR_USDZ_URL = "/models/chemistry-reaction.usdz";

export const CHEMISTRY_AR_GLB_UNAVAILABLE_MESSAGE =
  "Aset AR Reaksi Kimia belum tersedia. Gunakan simulasi 3D interaktif.";

export const CHEMISTRY_AR_IOS_UNAVAILABLE_MESSAGE =
  "Aset AR iOS Reaksi Kimia belum tersedia. Tambahkan file USDZ untuk Quick Look.";

export const CHEMISTRY_AR_IOS_HINT =
  "AR iOS belum tersedia. File chemistry-reaction.usdz belum ditambahkan.";

export const CHEMISTRY_AR_DESKTOP_HINT =
  "AR tersedia di perangkat mobile. Gunakan mode 3D interaktif di desktop.";

export const CHEMISTRY_AR_GLB_HINT =
  "Aset AR belum tersedia. File GLB belum ditambahkan.";

export type ChemistryArAssetStatus = {
  glb: boolean;
  usdz: boolean;
};

export type ChemistryArButtonState = {
  aktif: boolean;
  petunjuk: string | null;
  toastSaatTekan: string | null;
};

export type ChemistryArModelUrls = {
  glb: string;
  usdz: string;
};

export function getChemistryArModelUrls(): ChemistryArModelUrls {
  return {
    glb: CHEMISTRY_AR_GLB_URL,
    usdz: CHEMISTRY_AR_USDZ_URL,
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

export async function checkChemistryArAssetsAvailable(): Promise<ChemistryArAssetStatus> {
  const [glb, usdz] = await Promise.all([
    headOk(CHEMISTRY_AR_GLB_URL),
    headOk(CHEMISTRY_AR_USDZ_URL),
  ]);
  return { glb, usdz };
}

export function getChemistryArButtonState(
  status: ChemistryArAssetStatus | null,
): ChemistryArButtonState {
  if (!status) {
    return { aktif: false, petunjuk: null, toastSaatTekan: null };
  }

  if (isDesktopBrowser()) {
    return {
      aktif: false,
      petunjuk: CHEMISTRY_AR_DESKTOP_HINT,
      toastSaatTekan: null,
    };
  }

  if (isIosDevice()) {
    if (!status.usdz) {
      return {
        aktif: false,
        petunjuk: CHEMISTRY_AR_IOS_HINT,
        toastSaatTekan: CHEMISTRY_AR_IOS_UNAVAILABLE_MESSAGE,
      };
    }
    return { aktif: true, petunjuk: null, toastSaatTekan: null };
  }

  if (!status.glb) {
    return {
      aktif: false,
      petunjuk: CHEMISTRY_AR_GLB_HINT,
      toastSaatTekan: CHEMISTRY_AR_GLB_UNAVAILABLE_MESSAGE,
    };
  }

  return { aktif: true, petunjuk: null, toastSaatTekan: null };
}

export function shouldMountChemistryArViewer(
  status: ChemistryArAssetStatus | null,
): boolean {
  if (!status?.glb) return false;
  if (isIosDevice()) return status.usdz;
  if (isDesktopBrowser()) return false;
  return true;
}
