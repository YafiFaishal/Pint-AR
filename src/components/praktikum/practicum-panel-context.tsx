"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
  type RefObject,
} from "react";

export type PracticumPanelContextValue = {
  setFooter: (node: ReactNode | null) => void;
  scrollToTop: () => void;
  bodyRef: RefObject<HTMLDivElement | null>;
  guideComplete: boolean;
  setGuideComplete: (complete: boolean) => void;
  backToSimulation: () => void;
  openLKS: () => void;
  lksAvailable: boolean;
};

const PracticumPanelContext = createContext<PracticumPanelContextValue | null>(
  null,
);

export function PracticumPanelProvider({
  value,
  children,
}: {
  value: PracticumPanelContextValue;
  children: ReactNode;
}) {
  const memo = useMemo(() => value, [value]);
  return (
    <PracticumPanelContext.Provider value={memo}>
      {children}
    </PracticumPanelContext.Provider>
  );
}

export function usePracticumPanel() {
  const ctx = useContext(PracticumPanelContext);
  if (!ctx) {
    throw new Error("usePracticumPanel harus dipakai di dalam PracticumShell");
  }
  return ctx;
}

export function usePracticumPanelOptional() {
  return useContext(PracticumPanelContext);
}
