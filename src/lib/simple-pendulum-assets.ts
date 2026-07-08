/**
 * Aset AR khusus modul Getaran Bandul Sederhana.
 */

export const SIMPLE_PENDULUM_AR_GLB_URL = "/models/simple-pendulum.glb";
export const SIMPLE_PENDULUM_AR_USDZ_URL = "/models/simple-pendulum.usdz";

export const SIMPLE_PENDULUM_AR_GLB_UNAVAILABLE_MESSAGE =
  "Aset AR Bandul belum tersedia. Gunakan simulasi 3D interaktif.";

export const SIMPLE_PENDULUM_AR_IOS_UNAVAILABLE_MESSAGE =
  "Aset AR iOS Bandul belum tersedia. Gunakan simulasi 3D interaktif.";

export const SIMPLE_PENDULUM_AR_IOS_HINT =
  "AR iOS belum tersedia. File simple-pendulum.usdz belum ditambahkan.";

export const SIMPLE_PENDULUM_AR_DESKTOP_HINT =
  "AR tersedia di perangkat mobile. Gunakan mode 3D interaktif di desktop.";

export const SIMPLE_PENDULUM_AR_GLB_HINT =
  "Aset AR belum tersedia. File GLB belum ditambahkan.";

export type SimplePendulumArAssetStatus = {
  glb: boolean;
  usdz: boolean;
};

export type SimplePendulumArButtonState = {
  aktif: boolean;
  petunjuk: string | null;
  toastSaatTekan: string | null;
};

export type SimplePendulumArModelUrls = {
  glb: string;
  usdz: string;
};

export function getSimplePendulumArModelUrls(): SimplePendulumArModelUrls {
  return {
    glb: SIMPLE_PENDULUM_AR_GLB_URL,
    usdz: SIMPLE_PENDULUM_AR_USDZ_URL,
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

export async function checkSimplePendulumArAssetsAvailable(): Promise<SimplePendulumArAssetStatus> {
  const [glb, usdz] = await Promise.all([
    headOk(SIMPLE_PENDULUM_AR_GLB_URL),
    headOk(SIMPLE_PENDULUM_AR_USDZ_URL),
  ]);
  return { glb, usdz };
}

export function getSimplePendulumArButtonState(
  status: SimplePendulumArAssetStatus | null,
): SimplePendulumArButtonState {
  if (!status) {
    return { aktif: false, petunjuk: null, toastSaatTekan: null };
  }

  if (isDesktopBrowser()) {
    return {
      aktif: false,
      petunjuk: SIMPLE_PENDULUM_AR_DESKTOP_HINT,
      toastSaatTekan: null,
    };
  }

  if (isIosDevice()) {
    if (!status.usdz) {
      return {
        aktif: false,
        petunjuk: SIMPLE_PENDULUM_AR_IOS_HINT,
        toastSaatTekan: SIMPLE_PENDULUM_AR_IOS_UNAVAILABLE_MESSAGE,
      };
    }
    return { aktif: true, petunjuk: null, toastSaatTekan: null };
  }

  if (!status.glb) {
    return {
      aktif: false,
      petunjuk: SIMPLE_PENDULUM_AR_GLB_HINT,
      toastSaatTekan: SIMPLE_PENDULUM_AR_GLB_UNAVAILABLE_MESSAGE,
    };
  }

  return { aktif: true, petunjuk: null, toastSaatTekan: null };
}

export function shouldMountSimplePendulumArViewer(
  status: SimplePendulumArAssetStatus | null,
): boolean {
  if (!status?.glb) return false;
  if (isIosDevice()) return status.usdz;
  if (isDesktopBrowser()) return false;
  return true;
}
