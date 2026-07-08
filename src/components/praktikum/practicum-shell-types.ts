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
  backHref?: string;
  sceneClassName?: string;
  layoutVariant?: "interactive" | "default";
  mobileQuickInfoBelowScene?: boolean;
  mobileQuickInfoClassName?: string;
};

export type PracticumTabId = "kontrol" | "panduan";

export type LksAvailability = "loading" | "available" | "unavailable";
