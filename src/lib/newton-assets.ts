/**
 * Aset AR khusus modul Hukum Newton.
 *
 * Simulasi 3D interaktif memakai primitive di React Three Fiber.
 * Mode AR memakai file statis di `public/models/` — bukan URL dari database.
 */

export const NEWTON_AR_GLB_URL = "/models/newton-force.glb";
export const NEWTON_AR_USDZ_URL = "/models/newton-force.usdz";

export const NEWTON_AR_GLB_UNAVAILABLE_MESSAGE =
  "Aset AR Newton belum tersedia. Gunakan simulasi 3D interaktif.";

export const NEWTON_AR_IOS_UNAVAILABLE_MESSAGE =
  "Aset AR iOS Newton belum tersedia. Gunakan simulasi 3D interaktif.";

export const NEWTON_AR_IOS_HINT =
  "AR iOS belum tersedia. File USDZ belum ditambahkan.";

export const NEWTON_AR_DESKTOP_HINT =
  "AR tersedia di perangkat mobile. Gunakan mode 3D interaktif di desktop.";

export const NEWTON_AR_GLB_HINT =
  "Aset AR belum tersedia. File GLB belum ditambahkan.";

export type NewtonArAssetStatus = {
  glb: boolean;
  usdz: boolean;
};

export type NewtonArButtonState = {
  /** Tombol boleh membuka sesi AR. */
  aktif: boolean;
  /** Petunjuk ringkas di bawah tombol (null jika tidak perlu). */
  petunjuk: string | null;
  /** Toast saat tombol ditekan meski AR belum siap. */
  toastSaatTekan: string | null;
};

export type NewtonArModelUrls = {
  glb: string;
  usdz: string;
};

/** URL model AR Newton — tidak memakai `modelGlbUrl` dari database. */
export function getNewtonArModelUrls(): NewtonArModelUrls {
  return {
    glb: NEWTON_AR_GLB_URL,
    usdz: NEWTON_AR_USDZ_URL,
  };
}

/** Deteksi perangkat iOS (AR Quick Look membutuhkan USDZ). */
export function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/** Perangkat mobile non-desktop (iOS, Android, dll.). */
export function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    isIosDevice() ||
    /Android/i.test(navigator.userAgent) ||
    /Mobile/i.test(navigator.userAgent)
  );
}

/** Browser desktop — AR Quick Look / Scene Viewer bukan target utama. */
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

/** Cek ketersediaan GLB dan USDZ di `public/models/`. */
export async function checkNewtonArAssetsAvailable(): Promise<NewtonArAssetStatus> {
  const [glb, usdz] = await Promise.all([
    headOk(NEWTON_AR_GLB_URL),
    headOk(NEWTON_AR_USDZ_URL),
  ]);
  return { glb, usdz };
}

/** Apakah AR Newton bisa dibuka di perangkat saat ini. */
export function canOpenNewtonAr(
  status: NewtonArAssetStatus,
  ios = isIosDevice(),
): boolean {
  return ios ? status.usdz : status.glb;
}

/** Pesan ketika aset AR untuk platform saat ini belum ada. */
export function getNewtonArUnavailableMessage(ios = isIosDevice()): string {
  return ios
    ? NEWTON_AR_IOS_UNAVAILABLE_MESSAGE
    : NEWTON_AR_GLB_UNAVAILABLE_MESSAGE;
}

/** Status tombol AR Newton per platform dan ketersediaan aset. */
export function getNewtonArButtonState(
  status: NewtonArAssetStatus | null,
): NewtonArButtonState {
  if (!status) {
    return { aktif: false, petunjuk: null, toastSaatTekan: null };
  }

  if (isDesktopBrowser()) {
    return {
      aktif: false,
      petunjuk: NEWTON_AR_DESKTOP_HINT,
      toastSaatTekan: null,
    };
  }

  if (isIosDevice()) {
    if (!status.usdz) {
      return {
        aktif: false,
        petunjuk: NEWTON_AR_IOS_HINT,
        toastSaatTekan: NEWTON_AR_IOS_UNAVAILABLE_MESSAGE,
      };
    }
    return { aktif: true, petunjuk: null, toastSaatTekan: null };
  }

  if (!status.glb) {
    return {
      aktif: false,
      petunjuk: NEWTON_AR_GLB_HINT,
      toastSaatTekan: NEWTON_AR_GLB_UNAVAILABLE_MESSAGE,
    };
  }

  return { aktif: true, petunjuk: null, toastSaatTekan: null };
}

/** ModelViewer perlu dimuat jika aset platform siap dipakai. */
export function shouldMountNewtonArViewer(
  status: NewtonArAssetStatus | null,
): boolean {
  if (!status?.glb) return false;
  if (isIosDevice()) return status.usdz;
  if (isDesktopBrowser()) return false;
  return true;
}
