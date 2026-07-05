/**
 * Aset AR khusus modul Gerak Jatuh Bebas.
 *
 * Simulasi 3D interaktif memakai primitive di React Three Fiber.
 * Mode AR memakai file statis di `public/models/` — bukan URL dari database.
 */

export const JATUH_BEBAS_AR_GLB_URL = "/models/free-fall.glb";
export const JATUH_BEBAS_AR_USDZ_URL = "/models/free-fall.usdz";

export const JATUH_BEBAS_AR_GLB_UNAVAILABLE_MESSAGE =
  "Aset AR Gerak Jatuh Bebas belum tersedia. Gunakan simulasi 3D interaktif.";

export const JATUH_BEBAS_AR_IOS_UNAVAILABLE_MESSAGE =
  "Aset AR iOS Gerak Jatuh Bebas belum tersedia. Gunakan simulasi 3D interaktif.";

export const JATUH_BEBAS_AR_IOS_HINT =
  "AR iOS belum tersedia. File free-fall.usdz belum ditambahkan.";

export const JATUH_BEBAS_AR_DESKTOP_HINT =
  "AR tersedia di perangkat mobile. Gunakan mode 3D interaktif di desktop.";

export const JATUH_BEBAS_AR_GLB_HINT =
  "Aset AR belum tersedia. File GLB belum ditambahkan.";

export type JatuhBebasArAssetStatus = {
  glb: boolean;
  usdz: boolean;
};

export type JatuhBebasArButtonState = {
  aktif: boolean;
  petunjuk: string | null;
  toastSaatTekan: string | null;
};

export type JatuhBebasArModelUrls = {
  glb: string;
  usdz: string;
};

export function getJatuhBebasArModelUrls(): JatuhBebasArModelUrls {
  return {
    glb: JATUH_BEBAS_AR_GLB_URL,
    usdz: JATUH_BEBAS_AR_USDZ_URL,
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

export async function checkJatuhBebasArAssetsAvailable(): Promise<JatuhBebasArAssetStatus> {
  const [glb, usdz] = await Promise.all([
    headOk(JATUH_BEBAS_AR_GLB_URL),
    headOk(JATUH_BEBAS_AR_USDZ_URL),
  ]);
  return { glb, usdz };
}

export function getJatuhBebasArButtonState(
  status: JatuhBebasArAssetStatus | null,
): JatuhBebasArButtonState {
  if (!status) {
    return { aktif: false, petunjuk: null, toastSaatTekan: null };
  }

  if (isDesktopBrowser()) {
    return {
      aktif: false,
      petunjuk: JATUH_BEBAS_AR_DESKTOP_HINT,
      toastSaatTekan: null,
    };
  }

  if (isIosDevice()) {
    if (!status.usdz) {
      return {
        aktif: false,
        petunjuk: JATUH_BEBAS_AR_IOS_HINT,
        toastSaatTekan: JATUH_BEBAS_AR_IOS_UNAVAILABLE_MESSAGE,
      };
    }
    return { aktif: true, petunjuk: null, toastSaatTekan: null };
  }

  if (!status.glb) {
    return {
      aktif: false,
      petunjuk: JATUH_BEBAS_AR_GLB_HINT,
      toastSaatTekan: JATUH_BEBAS_AR_GLB_UNAVAILABLE_MESSAGE,
    };
  }

  return { aktif: true, petunjuk: null, toastSaatTekan: null };
}

export function shouldMountJatuhBebasArViewer(
  status: JatuhBebasArAssetStatus | null,
): boolean {
  if (!status?.glb) return false;
  if (isIosDevice()) return status.usdz;
  if (isDesktopBrowser()) return false;
  return true;
}
