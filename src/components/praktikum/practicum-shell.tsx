"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type PracticumShellProps = {
  /** Judul modul di header */
  title: string;
  /** Badge status di header (mis. Praktikum Interaktif) */
  badge?: ReactNode;
  /** Area visual 3D / AR */
  scene: ReactNode;
  /** Overlay opsional di atas scene (mis. pill status) */
  sceneOverlay?: ReactNode;
  /** Ringkasan nilai singkat di bawah scene (desktop) atau di sheet (mobile) */
  quickInfo?: ReactNode;
  /** Panel kontrol simulasi (slider, tombol, dll.) */
  controls: ReactNode;
  /** Konten tab Panduan */
  guide: ReactNode;
  /** Konten tab LKS */
  lks: ReactNode;
  /** Tombol AR + petunjuk opsional */
  arButton?: ReactNode;
  /** Tautan tombol kembali */
  backHref?: string;
  /** Kelas tambahan pada wrapper scene */
  sceneClassName?: string;
  /**
   * `interactive` — modul dengan kontrol simulasi (Newton, Rangkaian, Tata Surya).
   * `default` — modul model-viewer / placeholder.
   */
  layoutVariant?: "interactive" | "default";
  /**
   * Tampilkan quickInfo sebagai strip di bawah scene pada mobile
   * (bukan di dalam tab Kontrol).
   */
  mobileQuickInfoBelowScene?: boolean;
};

const DESKTOP_TAB_PANEL_CLASS =
  "min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3 pt-1 lg:px-4 lg:pb-4 lg:pt-2";

/** Panel tab mobile — scrollable, aman untuk Safari bottom bar */
const MOBILE_TAB_PANEL_CLASS = cn(
  "min-h-0 max-h-full flex-1 overflow-y-auto overscroll-y-contain",
  "touch-pan-y px-3 pt-1",
  "pb-[calc(10rem+env(safe-area-inset-bottom,0px))]",
  "[-webkit-overflow-scrolling:touch]",
  "[hidden]:hidden data-[hidden]:hidden",
);

function SceneArea({
  scene,
  sceneOverlay,
  quickInfo,
  sceneClassName,
}: Pick<
  PracticumShellProps,
  "scene" | "sceneOverlay" | "quickInfo" | "sceneClassName"
>) {
  return (
    <div
      className={cn(
        "relative min-h-0 bg-gradient-to-b from-muted/60 to-muted",
        sceneClassName,
      )}
    >
      <div className="absolute inset-0">{scene}</div>
      {sceneOverlay ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 p-2 lg:p-3">
          {sceneOverlay}
        </div>
      ) : null}
      {quickInfo ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden p-2 lg:block lg:p-3">
          {quickInfo}
        </div>
      ) : null}
    </div>
  );
}

/** Bottom sheet mobile: Kontrol · Panduan · LKS */
function MobileBottomSheet({
  controls,
  guide,
  lks,
  quickInfo,
  arButton,
  quickInfoInSheet,
}: Pick<
  PracticumShellProps,
  "controls" | "guide" | "lks" | "quickInfo" | "arButton"
> & { quickInfoInSheet: boolean }) {
  return (
    <div
      className={cn(
        "flex min-h-0 max-h-[72svh] flex-1 flex-col overflow-hidden border-t bg-background",
        "shadow-[0_-6px_24px_rgba(15,23,42,0.08)]",
        "rounded-t-2xl lg:hidden",
      )}
    >
      <div
        className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/25"
        aria-hidden
      />

      <Tabs
        defaultValue="kontrol"
        className="flex h-full min-h-0 flex-1 flex-col gap-0 overflow-hidden"
      >
        <div className="shrink-0 px-3 pt-2 pb-1">
          <TabsList className="grid h-9 w-full grid-cols-3">
            <TabsTrigger value="kontrol" className="text-xs">
              Kontrol
            </TabsTrigger>
            <TabsTrigger value="panduan" className="text-xs">
              Panduan
            </TabsTrigger>
            <TabsTrigger value="lks" className="text-xs">
              LKS
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="kontrol" className={MOBILE_TAB_PANEL_CLASS}>
          <div className="space-y-2">
            {quickInfoInSheet && quickInfo ? (
              <div className="pointer-events-auto">{quickInfo}</div>
            ) : null}
            <div className="pointer-events-auto">{controls}</div>
            {arButton ? (
              <div className="pointer-events-auto pt-1">{arButton}</div>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="panduan" className={MOBILE_TAB_PANEL_CLASS}>
          <div className="pointer-events-auto min-h-0">{guide}</div>
        </TabsContent>

        <TabsContent value="lks" className={MOBILE_TAB_PANEL_CLASS}>
          <div className="pointer-events-auto min-h-0">{lks}</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/** Sidebar desktop: Panduan · LKS */
function DesktopSidebar({ guide, lks }: Pick<PracticumShellProps, "guide" | "lks">) {
  return (
    <aside
      className={cn(
        "hidden min-h-0 w-full flex-col overflow-hidden border-t bg-background lg:flex",
        "lg:max-w-md lg:border-l lg:border-t-0",
      )}
    >
      <Tabs
        defaultValue="panduan"
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <div className="shrink-0 px-4 pt-3">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="panduan">Panduan</TabsTrigger>
            <TabsTrigger value="lks">LKS</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="panduan" className={DESKTOP_TAB_PANEL_CLASS}>
          {guide}
        </TabsContent>

        <TabsContent value="lks" className={DESKTOP_TAB_PANEL_CLASS}>
          {lks}
        </TabsContent>
      </Tabs>
    </aside>
  );
}

/**
 * Layout dasar modul praktikum PintAR.
 *
 * - **Mobile:** scene di atas + bottom sheet (Kontrol · Panduan · LKS)
 * - **Desktop:** split — scene + kontrol kiri, Panduan/LKS kanan
 */
export function PracticumShell({
  title,
  badge,
  scene,
  sceneOverlay,
  quickInfo,
  controls,
  guide,
  lks,
  arButton,
  backHref = "/siswa",
  sceneClassName,
  layoutVariant = "interactive",
  mobileQuickInfoBelowScene = false,
}: PracticumShellProps) {
  const interactive = layoutVariant === "interactive";

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            render={<Link href={backHref} />}
            nativeButton={false}
            variant="ghost"
            size="icon-sm"
            aria-label="Kembali"
          >
            <ArrowLeft />
          </Button>
          <span className="truncate font-semibold">{title}</span>
        </div>
        {badge ? <div className="shrink-0">{badge}</div> : null}
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Kolom utama: scene + kontrol (desktop) */}
        <section
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-hidden",
          )}
        >
          <SceneArea
            scene={scene}
            sceneOverlay={sceneOverlay}
            quickInfo={quickInfo}
            sceneClassName={cn(
              interactive
                ? "min-h-[min(28svh,16rem)] flex-[2] shrink-0 lg:min-h-0 lg:flex-1"
                : "h-[45vh] shrink-0 lg:h-auto lg:flex-1",
              sceneClassName,
            )}
          />

          {mobileQuickInfoBelowScene && quickInfo ? (
            <div className="shrink-0 border-t bg-background/95 px-3 py-2 backdrop-blur-sm lg:hidden">
              {quickInfo}
            </div>
          ) : null}

          {/* Kontrol + AR — hanya desktop */}
          <div className="hidden min-h-0 shrink-0 flex-col border-t bg-background/95 backdrop-blur-sm lg:flex">
            <div className="space-y-3 overflow-y-auto p-3">
              {controls}
              {arButton}
            </div>
          </div>

          <MobileBottomSheet
            controls={controls}
            guide={guide}
            lks={lks}
            quickInfo={quickInfo}
            arButton={arButton}
            quickInfoInSheet={!mobileQuickInfoBelowScene}
          />
        </section>

        <DesktopSidebar guide={guide} lks={lks} />
      </div>
    </div>
  );
}

/** Alias untuk PracticumShell */
export const PracticumLayout = PracticumShell;
