"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SimulationLksActionButton } from "@/components/praktikum/simulation-action-button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PracticumPanelProvider,
  type PracticumPanelContextValue,
} from "@/components/praktikum/practicum-panel-context";
import { LksPanel, useLksAvailability } from "@/components/praktikum/lks-panel";
import type {
  PracticumShellProps,
  PracticumTabId,
} from "@/components/praktikum/practicum-shell-types";

export type { PracticumShellProps } from "@/components/praktikum/practicum-shell-types";

const HEADER_HEIGHT_CLASS = "h-[calc(4.5rem+env(safe-area-inset-top,0px))]";
const HEADER_TOP_CLASS = "top-[calc(4.5rem+env(safe-area-inset-top,0px))]";

const SHEET_BODY_CLASS =
  "min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain touch-pan-y [-webkit-overflow-scrolling:touch]";

const SHEET_FOOTER_CLASS =
  "shrink-0 border-t bg-background px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]";

const DESKTOP_TAB_PANEL_CLASS =
  "min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 pt-2";

type ControlPanelSize = "compact" | "medium";

function PanelActionFooter({
  arButton,
  arHint,
  lksAvailability,
  isLKSOpen,
  onOpenLKS,
}: {
  arButton?: ReactNode;
  arHint?: string | null;
  lksAvailability: "loading" | "available" | "unavailable";
  isLKSOpen: boolean;
  onOpenLKS: () => void;
}) {
  const lksDisabled =
    lksAvailability === "loading" || lksAvailability === "unavailable";
  const lksUnavailable = lksAvailability === "unavailable";

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "grid gap-3",
          arButton ? "grid-cols-2" : "grid-cols-1",
        )}
      >
        {arButton ? (
          <div className="min-w-0 w-full">{arButton}</div>
        ) : null}
        <SimulationLksActionButton
          onClick={onOpenLKS}
          disabled={lksDisabled}
          unavailable={lksUnavailable}
          isOpen={isLKSOpen}
        />
      </div>
      {arHint ? (
        <p className="px-0.5 text-[10px] leading-snug text-muted-foreground lg:text-[11px]">
          {arHint}
        </p>
      ) : null}
    </div>
  );
}

function WorkspaceTabsList() {
  return (
    <TabsList className="grid h-11 w-full grid-cols-2 gap-1 rounded-xl bg-muted/50 p-1">
      <TabsTrigger
        value="kontrol"
        className="min-h-10 rounded-lg text-xs font-medium data-active:bg-foreground data-active:text-background data-active:shadow-none sm:text-sm"
      >
        Kontrol
      </TabsTrigger>
      <TabsTrigger
        value="panduan"
        className="min-h-10 rounded-lg text-xs font-medium data-active:bg-foreground data-active:text-background data-active:shadow-none sm:text-sm"
      >
        Panduan
      </TabsTrigger>
    </TabsList>
  );
}

function SceneArea({
  scene,
  sceneOverlay,
  quickInfo,
  sceneClassName,
  controlMode,
}: Pick<
  PracticumShellProps,
  "scene" | "sceneOverlay" | "quickInfo" | "sceneClassName"
> & {
  controlMode: boolean;
}) {
  return (
    <div
      className={cn(
        "relative min-h-0 bg-gradient-to-b from-muted/60 to-muted",
        controlMode
          ? "min-h-[clamp(180px,30dvh,360px)] flex-1"
          : "h-[clamp(240px,34dvh,380px)] shrink-0 max-[740px]:h-[clamp(220px,32dvh,340px)]",
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

function MobilePracticumSheet({
  controls,
  guide,
  quickInfo,
  arButton,
  arHint,
  quickInfoInSheet,
  controlPanelSize,
  activeTab,
  onTabChange,
  onToggleControlSize,
  onCollapseGuide,
  lksAvailability,
  isLKSOpen,
  onOpenLKS,
  guideComplete,
  setGuideComplete,
  backToSimulation,
}: Pick<
  PracticumShellProps,
  "controls" | "guide" | "quickInfo" | "arButton" | "arHint"
> & {
  quickInfoInSheet: boolean;
  controlPanelSize: ControlPanelSize;
  activeTab: PracticumTabId;
  onTabChange: (tab: PracticumTabId) => void;
  onToggleControlSize: () => void;
  onCollapseGuide: () => void;
  lksAvailability: "loading" | "available" | "unavailable";
  isLKSOpen: boolean;
  onOpenLKS: () => void;
  guideComplete: boolean;
  setGuideComplete: (v: boolean) => void;
  backToSimulation: () => void;
}) {
  const [tabFooter, setTabFooter] = useState<ReactNode | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const scrollToTop = useCallback(() => {
    bodyRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const setFooter = useCallback((node: ReactNode | null) => {
    setTabFooter(node);
  }, []);

  const panelCtx: PracticumPanelContextValue = useMemo(
    () => ({
      setFooter,
      scrollToTop,
      bodyRef,
      guideComplete,
      setGuideComplete,
      backToSimulation,
      openLKS: onOpenLKS,
      lksAvailable: lksAvailability === "available",
    }),
    [
      scrollToTop,
      setFooter,
      guideComplete,
      setGuideComplete,
      backToSimulation,
      onOpenLKS,
      lksAvailability,
    ],
  );

  const handleTabChange = useCallback(
    (value: string) => {
      const tab = value as PracticumTabId;
      onTabChange(tab);
      if (tab === "kontrol") {
        setGuideComplete(false);
      }
      setTabFooter(null);
      requestAnimationFrame(scrollToTop);
    },
    [onTabChange, scrollToTop, setGuideComplete],
  );

  const isGuideExpanded = activeTab === "panduan";
  const showPanduanNav =
    isGuideExpanded && tabFooter && !guideComplete;
  const hideGlobalFooter = isGuideExpanded && guideComplete;

  const handleToggle = isGuideExpanded ? onCollapseGuide : onToggleControlSize;

  return (
    <PracticumPanelProvider value={panelCtx}>
      <div
        className={cn(
          "flex min-h-0 flex-col overflow-hidden border-t bg-background shadow-[0_-4px_24px_rgba(15,23,42,0.06)] lg:hidden",
          "rounded-t-3xl",
          isGuideExpanded
            ? cn("fixed inset-x-0 bottom-0 z-30", HEADER_TOP_CLASS)
            : cn(
                "relative shrink-0",
                controlPanelSize === "compact"
                  ? "h-[clamp(260px,32dvh,320px)] max-h-[320px]"
                  : "h-[clamp(300px,42dvh,48dvh)] max-h-[48dvh]",
              ),
        )}
        aria-expanded={isGuideExpanded || controlPanelSize === "medium"}
      >
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="shrink-0 border-b bg-background px-3 pt-2 pb-2.5">
            <div className="mb-2 flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={handleToggle}
                aria-expanded={isGuideExpanded || controlPanelSize === "medium"}
                aria-label={
                  isGuideExpanded
                    ? "Perkecil panel"
                    : controlPanelSize === "medium"
                      ? "Perkecil kontrol"
                      : "Perbesar kontrol"
                }
                className="flex min-h-11 w-full flex-col items-center justify-center gap-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  className="h-1 w-10 rounded-full bg-muted-foreground/30"
                  aria-hidden
                />
                <span className="text-[11px] leading-snug text-muted-foreground">
                  {isGuideExpanded
                    ? "Perkecil panel"
                    : controlPanelSize === "medium"
                      ? "Perkecil kontrol"
                      : "Perbesar kontrol"}
                </span>
              </button>
            </div>
            <WorkspaceTabsList />
          </div>

          <div
            ref={bodyRef}
            className={cn(SHEET_BODY_CLASS, "px-4 py-4")}
            style={{ scrollPaddingBottom: hideGlobalFooter ? "1rem" : "7rem" }}
          >
            {activeTab === "kontrol" ? (
              <div className="space-y-3">
                {quickInfoInSheet && quickInfo ? <div>{quickInfo}</div> : null}
                <h3 className="text-lg font-semibold leading-snug">
                  Kontrol Simulasi
                </h3>
                {controls}
              </div>
            ) : null}
            {activeTab === "panduan" ? guide : null}
          </div>

          {!hideGlobalFooter ? (
            <div className={SHEET_FOOTER_CLASS}>
              {showPanduanNav ? (
                <div className="mb-2.5">{tabFooter}</div>
              ) : null}
              <PanelActionFooter
                arButton={arButton}
                arHint={arHint}
                lksAvailability={lksAvailability}
                isLKSOpen={isLKSOpen}
                onOpenLKS={onOpenLKS}
              />
            </div>
          ) : showPanduanNav ? (
            <div className={SHEET_FOOTER_CLASS}>{tabFooter}</div>
          ) : null}
        </Tabs>
      </div>
    </PracticumPanelProvider>
  );
}

function DesktopSidebar({
  guide,
  arButton,
  arHint,
  lksAvailability,
  isLKSOpen,
  onOpenLKS,
}: {
  guide: ReactNode;
  arButton?: ReactNode;
  arHint?: string | null;
  lksAvailability: "loading" | "available" | "unavailable";
  isLKSOpen: boolean;
  onOpenLKS: () => void;
}) {
  return (
    <aside className="hidden min-h-0 w-full flex-col overflow-hidden border-t bg-background lg:flex lg:max-w-md lg:border-l lg:border-t-0">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Panduan Simulasi</h3>
        </div>
        <div className={DESKTOP_TAB_PANEL_CLASS}>{guide}</div>
        <div className={SHEET_FOOTER_CLASS}>
          <PanelActionFooter
            arButton={arButton}
            arHint={arHint}
            lksAvailability={lksAvailability}
            isLKSOpen={isLKSOpen}
            onOpenLKS={onOpenLKS}
          />
        </div>
      </div>
    </aside>
  );
}

export function PracticumShell({
  title,
  moduleId,
  badge,
  scene,
  sceneOverlay,
  quickInfo,
  controls,
  guide,
  arButton,
  arHint,
  backHref = "/siswa",
  sceneClassName,
  layoutVariant = "interactive",
  mobileQuickInfoBelowScene = false,
  mobileQuickInfoClassName,
}: PracticumShellProps) {
  const [activePanelTab, setActivePanelTab] =
    useState<PracticumTabId>("kontrol");
  const [controlPanelSize, setControlPanelSize] =
    useState<ControlPanelSize>("compact");
  const [isLKSOpen, setIsLKSOpen] = useState(false);
  const [guideComplete, setGuideComplete] = useState(false);
  const lksAvailability = useLksAvailability(moduleId);
  const interactive = layoutVariant === "interactive";

  const isGuideExpanded = activePanelTab === "panduan";
  const hideSimulationMobile = isGuideExpanded || isLKSOpen;
  const controlMode = activePanelTab === "kontrol" && !isLKSOpen;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleTabChange = useCallback((tab: PracticumTabId) => {
    setActivePanelTab(tab);
    if (tab === "panduan") {
      setControlPanelSize("compact");
    }
  }, []);

  const handleToggleControlSize = useCallback(() => {
    setControlPanelSize((s) => (s === "compact" ? "medium" : "compact"));
  }, []);

  const handleCollapseGuide = useCallback(() => {
    setActivePanelTab("kontrol");
    setControlPanelSize("compact");
  }, []);

  const backToSimulation = useCallback(() => {
    setGuideComplete(false);
    setActivePanelTab("kontrol");
    setControlPanelSize("compact");
  }, []);

  const handleOpenLKS = useCallback(() => {
    if (lksAvailability === "available") {
      setIsLKSOpen(true);
    }
  }, [lksAvailability]);

  const handleCloseLKS = useCallback(() => {
    setIsLKSOpen(false);
  }, []);

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden">
      <header
        className={cn(
          "relative z-40 flex shrink-0 items-center gap-2 border-b bg-background px-3 sm:px-5",
          HEADER_HEIGHT_CLASS,
        )}
      >
        <Button
          render={<Link href={backHref} />}
          nativeButton={false}
          variant="ghost"
          className="size-11 shrink-0"
          aria-label="Kembali"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <span
          className="min-w-0 flex-1 line-clamp-2 text-base font-semibold leading-snug sm:text-lg"
          title={title}
        >
          {title}
        </span>
        {badge ? (
          <div className="max-w-[38%] shrink-0 [&_span]:max-w-full [&_span]:truncate [&_span]:text-[9px] sm:[&_span]:text-[10px]">
            {badge}
          </div>
        ) : null}
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <section className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
          <div
            className={cn(
              "flex min-h-0 flex-col transition-opacity duration-200 lg:flex-1",
              hideSimulationMobile &&
                "pointer-events-none invisible max-h-0 min-h-0 overflow-hidden opacity-0 lg:visible lg:max-h-none lg:min-h-0 lg:opacity-100 lg:pointer-events-auto",
              controlMode && "min-h-0 flex-1",
            )}
            aria-hidden={hideSimulationMobile}
          >
            <SceneArea
              scene={scene}
              sceneOverlay={sceneOverlay}
              quickInfo={quickInfo}
              controlMode={controlMode}
              sceneClassName={cn(
                !interactive &&
                  "h-[clamp(220px,32dvh,360px)] max-[740px]:h-[clamp(200px,28dvh,300px)] lg:h-auto lg:flex-1",
                sceneClassName,
              )}
            />

            {mobileQuickInfoBelowScene && quickInfo ? (
              <div
                className={cn(
                  "shrink-0 bg-background px-3 py-2 lg:hidden",
                  mobileQuickInfoClassName,
                )}
              >
                {quickInfo}
              </div>
            ) : null}
          </div>

          <div className="hidden min-h-0 shrink-0 flex-col border-t bg-background lg:flex lg:max-h-[42%]">
            <div className="space-y-3 overflow-y-auto p-4">
              <h3 className="text-lg font-semibold">Kontrol Simulasi</h3>
              {controls}
            </div>
          </div>

          {!isLKSOpen ? (
            <MobilePracticumSheet
              controls={controls}
              guide={guide}
              quickInfo={quickInfo}
              arButton={arButton}
              arHint={arHint}
              quickInfoInSheet={!mobileQuickInfoBelowScene}
              controlPanelSize={controlPanelSize}
              activeTab={activePanelTab}
              onTabChange={handleTabChange}
              onToggleControlSize={handleToggleControlSize}
              onCollapseGuide={handleCollapseGuide}
              lksAvailability={lksAvailability}
              isLKSOpen={isLKSOpen}
              onOpenLKS={handleOpenLKS}
              guideComplete={guideComplete}
              setGuideComplete={setGuideComplete}
              backToSimulation={backToSimulation}
            />
          ) : null}
        </section>

        {!isLKSOpen ? (
          <DesktopSidebar
            guide={guide}
            arButton={arButton}
            arHint={arHint}
            lksAvailability={lksAvailability}
            isLKSOpen={isLKSOpen}
            onOpenLKS={handleOpenLKS}
          />
        ) : null}
      </div>

      <LksPanel
        moduleId={moduleId}
        modulTitle={title}
        layout="workspace"
        open={isLKSOpen}
        onClose={handleCloseLKS}
      />
    </div>
  );
}

export const PracticumLayout = PracticumShell;
