/**
 * Aset AR khusus modul Pemantulan dan Pembiasan Cahaya.
 *
 * Simulasi 3D interaktif memakai primitive di React Three Fiber.
 * Mode AR memakai file statis di `public/models/` — bukan URL dari database.
 */

export const LIGHT_OPTICS_AR_GLB_URL = "/models/light-optics.glb";
export const LIGHT_OPTICS_AR_USDZ_URL = "/models/light-optics.usdz";

export const LIGHT_OPTICS_AR_GLB_UNAVAILABLE_MESSAGE =
  "Aset AR Cahaya & Optik belum tersedia. Gunakan simulasi 3D interaktif.";

export const LIGHT_OPTICS_AR_IOS_UNAVAILABLE_MESSAGE =
  "Aset AR iOS Cahaya & Optik belum tersedia. Gunakan simulasi 3D interaktif.";

export const LIGHT_OPTICS_AR_IOS_HINT =
  "AR iOS belum tersedia. File light-optics.usdz belum ditambahkan.";

export const LIGHT_OPTICS_AR_DESKTOP_HINT =
  "AR tersedia di perangkat mobile. Gunakan mode 3D interaktif di desktop.";

export const LIGHT_OPTICS_AR_GLB_HINT =
  "Aset AR belum tersedia. File GLB belum ditambahkan.";

export type LightOpticsArAssetStatus = {
  glb: boolean;
  usdz: boolean;
};

export type LightOpticsArButtonState = {
  aktif: boolean;
  petunjuk: string | null;
  toastSaatTekan: string | null;
};

export type LightOpticsArModelUrls = {
  glb: string;
  usdz: string;
};

export function getLightOpticsArModelUrls(): LightOpticsArModelUrls {
  return {
    glb: LIGHT_OPTICS_AR_GLB_URL,
    usdz: LIGHT_OPTICS_AR_USDZ_URL,
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

export async function checkLightOpticsArAssetsAvailable(): Promise<LightOpticsArAssetStatus> {
  const [glb, usdz] = await Promise.all([
    headOk(LIGHT_OPTICS_AR_GLB_URL),
    headOk(LIGHT_OPTICS_AR_USDZ_URL),
  ]);
  return { glb, usdz };
}

export function getLightOpticsArButtonState(
  status: LightOpticsArAssetStatus | null,
): LightOpticsArButtonState {
  if (!status) {
    return { aktif: false, petunjuk: null, toastSaatTekan: null };
  }

  if (isDesktopBrowser()) {
    return {
      aktif: false,
      petunjuk: LIGHT_OPTICS_AR_DESKTOP_HINT,
      toastSaatTekan: null,
    };
  }

  if (isIosDevice()) {
    if (!status.usdz) {
      return {
        aktif: false,
        petunjuk: LIGHT_OPTICS_AR_IOS_HINT,
        toastSaatTekan: LIGHT_OPTICS_AR_IOS_UNAVAILABLE_MESSAGE,
      };
    }
    return { aktif: true, petunjuk: null, toastSaatTekan: null };
  }

  if (!status.glb) {
    return {
      aktif: false,
      petunjuk: LIGHT_OPTICS_AR_GLB_HINT,
      toastSaatTekan: LIGHT_OPTICS_AR_GLB_UNAVAILABLE_MESSAGE,
    };
  }

  return { aktif: true, petunjuk: null, toastSaatTekan: null };
}

export function shouldMountLightOpticsArViewer(
  status: LightOpticsArAssetStatus | null,
): boolean {
  if (!status?.glb) return false;
  if (isIosDevice()) return status.usdz;
  if (isDesktopBrowser()) return false;
  return true;
}
