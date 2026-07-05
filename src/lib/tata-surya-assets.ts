/**
 * Aset AR modul Tata Surya.
 * Simulasi 3D interaktif memakai React Three Fiber — AR memakai file di public/models/.
 */

export const TATA_SURYA_AR_GLB_URL = "/models/solar-system.glb";
export const TATA_SURYA_AR_USDZ_URL = "/models/solar-system.usdz";

export const TATA_SURYA_AR_UNAVAILABLE_MESSAGE =
  "Aset AR Tata Surya belum tersedia. Gunakan simulasi 3D interaktif.";

export const TATA_SURYA_AR_IOS_UNAVAILABLE_MESSAGE =
  "Aset AR iOS Tata Surya belum tersedia. Konversi solar-system.usdz dari GLB (lihat public/models/README-solar-system.md).";

export const TATA_SURYA_AR_DESKTOP_HINT =
  "AR tersedia di perangkat mobile. Gunakan simulasi 3D interaktif di desktop.";

export const TATA_SURYA_AR_IOS_HINT =
  "AR iOS belum tersedia. File solar-system.usdz belum ditambahkan.";

export const TATA_SURYA_AR_GLB_HINT =
  "Aset AR belum tersedia. Jalankan npm run generate:solar-ar.";

export type TataSuryaArAssetStatus = {
  glb: boolean;
  usdz: boolean;
};

export type TataSuryaArButtonState = {
  aktif: boolean;
  petunjuk: string | null;
  toastSaatTekan: string | null;
};

export function getTataSuryaArModelUrls() {
  return {
    glb: TATA_SURYA_AR_GLB_URL,
    usdz: TATA_SURYA_AR_USDZ_URL,
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

export async function checkTataSuryaArAssetsAvailable(): Promise<TataSuryaArAssetStatus> {
  const [glb, usdz] = await Promise.all([
    headOk(TATA_SURYA_AR_GLB_URL),
    headOk(TATA_SURYA_AR_USDZ_URL),
  ]);
  return { glb, usdz };
}

export function getTataSuryaArButtonState(
  status: TataSuryaArAssetStatus | null,
): TataSuryaArButtonState {
  if (!status) {
    return { aktif: false, petunjuk: null, toastSaatTekan: null };
  }

  if (isDesktopBrowser()) {
    return {
      aktif: false,
      petunjuk: TATA_SURYA_AR_DESKTOP_HINT,
      toastSaatTekan: null,
    };
  }

  if (isIosDevice()) {
    if (!status.usdz) {
      return {
        aktif: false,
        petunjuk: TATA_SURYA_AR_IOS_HINT,
        toastSaatTekan: TATA_SURYA_AR_IOS_UNAVAILABLE_MESSAGE,
      };
    }
    return { aktif: true, petunjuk: null, toastSaatTekan: null };
  }

  if (!status.glb) {
    return {
      aktif: false,
      petunjuk: TATA_SURYA_AR_GLB_HINT,
      toastSaatTekan: TATA_SURYA_AR_UNAVAILABLE_MESSAGE,
    };
  }

  return { aktif: true, petunjuk: null, toastSaatTekan: null };
}

export function shouldMountTataSuryaArViewer(
  status: TataSuryaArAssetStatus | null,
): boolean {
  if (!status?.glb) return false;
  if (isIosDevice()) return status.usdz;
  if (isDesktopBrowser()) return false;
  return true;
}
