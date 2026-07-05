/**
 * Aset AR khusus modul Rangkaian Listrik.
 * Simulasi 3D interaktif memakai primitive — bukan URL database.
 */

export const RANGKAIAN_AR_GLB_URL = "/models/circuit-simple.glb";
export const RANGKAIAN_AR_USDZ_URL = "/models/circuit-simple.usdz";

export const RANGKAIAN_AR_GLB_UNAVAILABLE_MESSAGE =
  "Aset AR Rangkaian Listrik belum tersedia. Gunakan simulasi 3D interaktif.";

export const RANGKAIAN_AR_IOS_UNAVAILABLE_MESSAGE =
  "Aset AR iOS Rangkaian Listrik belum tersedia. Gunakan simulasi 3D interaktif.";

export const RANGKAIAN_AR_IOS_HINT =
  "AR iOS belum tersedia. File USDZ belum ditambahkan.";

export const RANGKAIAN_AR_DESKTOP_HINT =
  "AR tersedia di perangkat mobile. Gunakan mode 3D interaktif di desktop.";

export const RANGKAIAN_AR_GLB_HINT =
  "Aset AR belum tersedia. File GLB belum ditambahkan.";

export type RangkaianArAssetStatus = {
  glb: boolean;
  usdz: boolean;
};

export type RangkaianArButtonState = {
  aktif: boolean;
  petunjuk: string | null;
  toastSaatTekan: string | null;
};

export function getRangkaianArModelUrls() {
  return {
    glb: RANGKAIAN_AR_GLB_URL,
    usdz: RANGKAIAN_AR_USDZ_URL,
  };
}

export function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    isIosDevice() ||
    /Android/i.test(navigator.userAgent) ||
    /Mobile/i.test(navigator.userAgent)
  );
}

export function isDesktopBrowser(): boolean {
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

export async function checkRangkaianArAssetsAvailable(): Promise<RangkaianArAssetStatus> {
  const [glb, usdz] = await Promise.all([
    headOk(RANGKAIAN_AR_GLB_URL),
    headOk(RANGKAIAN_AR_USDZ_URL),
  ]);
  return { glb, usdz };
}

export function getRangkaianArButtonState(
  status: RangkaianArAssetStatus | null,
): RangkaianArButtonState {
  if (!status) {
    return { aktif: false, petunjuk: null, toastSaatTekan: null };
  }

  if (isDesktopBrowser()) {
    return {
      aktif: false,
      petunjuk: RANGKAIAN_AR_DESKTOP_HINT,
      toastSaatTekan: null,
    };
  }

  if (isIosDevice()) {
    if (!status.usdz) {
      return {
        aktif: false,
        petunjuk: RANGKAIAN_AR_IOS_HINT,
        toastSaatTekan: RANGKAIAN_AR_IOS_UNAVAILABLE_MESSAGE,
      };
    }
    return { aktif: true, petunjuk: null, toastSaatTekan: null };
  }

  if (!status.glb) {
    return {
      aktif: false,
      petunjuk: RANGKAIAN_AR_GLB_HINT,
      toastSaatTekan: RANGKAIAN_AR_GLB_UNAVAILABLE_MESSAGE,
    };
  }

  return { aktif: true, petunjuk: null, toastSaatTekan: null };
}

export function shouldMountRangkaianArViewer(
  status: RangkaianArAssetStatus | null,
): boolean {
  if (!status?.glb) return false;
  if (isIosDevice()) return status.usdz;
  if (isDesktopBrowser()) return false;
  return true;
}
