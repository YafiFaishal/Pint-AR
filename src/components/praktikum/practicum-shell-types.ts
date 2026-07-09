import type { ReactNode } from "react";

export type PracticumShellProps = {
  title: string;
  moduleId: string;
  badge?: ReactNode;
  scene: ReactNode;
  sceneOverlay?: ReactNode;
  quickInfo?: ReactNode;
  controls: ReactNode;
  guide: ReactNode;
  arButton?: ReactNode;
  /** Petunjuk AR di bawah bar aksi (bukan di dalam sel tombol). */
  arHint?: string | null;
  backHref?: string;
  sceneClassName?: string;
  layoutVariant?: "interactive" | "default";
  mobileQuickInfoBelowScene?: boolean;
  mobileQuickInfoClassName?: string;
};

export type PracticumTabId = "kontrol" | "panduan";

export type LksAvailability = "loading" | "available" | "unavailable";
