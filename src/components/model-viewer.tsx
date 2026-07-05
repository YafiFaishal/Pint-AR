"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

type ModelViewerElement = HTMLElement & {
  canActivateAR?: boolean;
  activateAR?: () => void;
};

export type ModelViewerHandle = {
  activateAR: () => void;
};

/** Status sesi AR dari model-viewer. */
export type ArStatus =
  | "not-presenting"
  | "session-started"
  | "object-placed"
  | "failed";

export interface ModelViewerProps {
  /** URL model GLB/glTF (Android/WebXR & fallback 3D). */
  src: string;
  /** URL model USDZ (iOS / AR Quick Look). Opsional. */
  iosSrc?: string;
  alt?: string;
  /** Aktifkan tombol AR (default: true). */
  ar?: boolean;
  /** Putar objek otomatis saat diam. */
  autoRotate?: boolean;
  poster?: string;
  /** Label tombol AR kustom. */
  arButtonLabel?: string;
  /**
   * Dipanggil setelah model dimuat dengan status ketersediaan AR di perangkat.
   * `true` = bisa masuk mode AR (WebXR/Quick Look), `false` = hanya 3D 360°.
   */
  onArAvailability?: (available: boolean) => void;
  /**
   * Dipanggil saat status sesi AR berubah. Berguna untuk mendeteksi kegagalan
   * AR (mis. izin kamera ditolak) lalu memberi tahu pengguna soal mode 3D.
   */
  onArStatus?: (status: ArStatus) => void;
  className?: string;
}

/**
 * Pembungkus <model-viewer> Google.
 *
 * Web component dimuat secara dinamis di sisi klien saja untuk menghindari
 * error SSR. Deteksi AR (WebXR / AR Quick Look) & fallback 3D 360° ditangani
 * otomatis oleh model-viewer sesuai perangkat.
 *
 * Ganti `src` / `iosSrc` dengan URL aset GLB/USDZ milik Anda kapan saja.
 */
export const ModelViewer = forwardRef<ModelViewerHandle, ModelViewerProps>(
  function ModelViewer(
    {
      src,
      iosSrc,
      alt = "Model 3D alat lab",
      ar = true,
      autoRotate = true,
      poster,
      arButtonLabel = "Lihat di Meja (AR)",
      onArAvailability,
      onArStatus,
      className,
    },
    ref,
  ) {
  const [ready, setReady] = useState(false);
  const elRef = useRef<ModelViewerElement | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      activateAR: () => {
        elRef.current?.activateAR?.();
      },
    }),
    [],
  );

  useEffect(() => {
    let mounted = true;
    import("@google/model-viewer")
      .then(() => {
        if (mounted) setReady(true);
      })
      .catch((err) => console.error("Gagal memuat model-viewer:", err));
    return () => {
      mounted = false;
    };
  }, []);

  const handleRef = useCallback(
    (node: HTMLElement | null) => {
      const el = node as ModelViewerElement | null;
      if (elRef.current) {
        elRef.current.removeEventListener("load", reportAr);
        elRef.current.removeEventListener("ar-status", reportStatus);
      }
      elRef.current = el;
      if (el) {
        el.addEventListener("load", reportAr);
        el.addEventListener("ar-status", reportStatus);
      }
      function reportAr() {
        onArAvailability?.(Boolean(el?.canActivateAR));
      }
      function reportStatus(event: Event) {
        const status = (event as CustomEvent<{ status: ArStatus }>).detail
          ?.status;
        if (status) onArStatus?.(status);
      }
    },
    [onArAvailability, onArStatus],
  );

  if (!ready) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground",
          className,
        )}
      >
        Memuat model 3D…
      </div>
    );
  }

  return (
    <model-viewer
      ref={handleRef}
      src={src}
      ios-src={iosSrc}
      alt={alt}
      ar={ar}
      ar-modes="webxr scene-viewer quick-look"
      ar-placement="floor"
      camera-controls
      touch-action="pan-y"
      auto-rotate={autoRotate}
      shadow-intensity="1"
      poster={poster}
      className={cn("h-full w-full", className)}
      style={{ backgroundColor: "transparent" }}
    >
      {ar ? (
        <button
          slot="ar-button"
          className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
        >
          {arButtonLabel}
        </button>
      ) : null}
    </model-viewer>
  );
},
);
