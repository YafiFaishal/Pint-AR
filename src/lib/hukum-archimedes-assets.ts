/**
 * Aset AR khusus modul Hukum Archimedes.
 *
 * Simulasi 3D interaktif memakai primitive di React Three Fiber.
 * Mode AR memakai file statis di `public/models/` — bukan URL dari database.
 */

export const ARCHIMEDES_AR_GLB_URL = "/models/archimedes-buoyancy.glb";
export const ARCHIMEDES_AR_USDZ_URL = "/models/archimedes-buoyancy.usdz";

export const ARCHIMEDES_AR_GLB_UNAVAILABLE_MESSAGE =
  "Aset AR Hukum Archimedes belum tersedia. Gunakan simulasi 3D interaktif.";

export const ARCHIMEDES_AR_IOS_UNAVAILABLE_MESSAGE =
  "Aset AR iOS Hukum Archimedes belum tersedia. Gunakan simulasi 3D interaktif.";

export const ARCHIMEDES_AR_IOS_HINT =
  "AR iOS belum tersedia. File archimedes-buoyancy.usdz belum ditambahkan.";

export const ARCHIMEDES_AR_DESKTOP_HINT =
  "AR tersedia di perangkat mobile. Gunakan mode 3D interaktif di desktop.";

export const ARCHIMEDES_AR_GLB_HINT =
  "Aset AR belum tersedia. File GLB belum ditambahkan.";

export type ArchimedesArAssetStatus = {
  glb: boolean;
  usdz: boolean;
};

export type ArchimedesArButtonState = {
  aktif: boolean;
  petunjuk: string | null;
  toastSaatTekan: string | null;
};

export type ArchimedesArModelUrls = {
  glb: string;
  usdz: string;
};

export function getArchimedesArModelUrls(): ArchimedesArModelUrls {
  return {
    glb: ARCHIMEDES_AR_GLB_URL,
    usdz: ARCHIMEDES_AR_USDZ_URL,
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

export async function checkArchimedesArAssetsAvailable(): Promise<ArchimedesArAssetStatus> {
  const [glb, usdz] = await Promise.all([
    headOk(ARCHIMEDES_AR_GLB_URL),
    headOk(ARCHIMEDES_AR_USDZ_URL),
  ]);
  return { glb, usdz };
}

export function getArchimedesArButtonState(
  status: ArchimedesArAssetStatus | null,
): ArchimedesArButtonState {
  if (!status) {
    return { aktif: false, petunjuk: null, toastSaatTekan: null };
  }

  if (isDesktopBrowser()) {
    return {
      aktif: false,
      petunjuk: ARCHIMEDES_AR_DESKTOP_HINT,
      toastSaatTekan: null,
    };
  }

  if (isIosDevice()) {
    if (!status.usdz) {
      return {
        aktif: false,
        petunjuk: ARCHIMEDES_AR_IOS_HINT,
        toastSaatTekan: ARCHIMEDES_AR_IOS_UNAVAILABLE_MESSAGE,
      };
    }
    return { aktif: true, petunjuk: null, toastSaatTekan: null };
  }

  if (!status.glb) {
    return {
      aktif: false,
      petunjuk: ARCHIMEDES_AR_GLB_HINT,
      toastSaatTekan: ARCHIMEDES_AR_GLB_UNAVAILABLE_MESSAGE,
    };
  }

  return { aktif: true, petunjuk: null, toastSaatTekan: null };
}

export function shouldMountArchimedesArViewer(
  status: ArchimedesArAssetStatus | null,
): boolean {
  if (!status?.glb) return false;
  if (isIosDevice()) return status.usdz;
  if (isDesktopBrowser()) return false;
  return true;
}
