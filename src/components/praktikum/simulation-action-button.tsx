"use client";

import { Box, ClipboardList, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Dimensi & alignment seragam untuk Lihat AR / Kerjakan LKS di seluruh modul. */
export const simulationActionButtonClass =
  "flex h-14 min-h-14 w-full min-w-0 items-center justify-center gap-2.5 rounded-2xl px-3 text-base font-medium leading-none whitespace-nowrap sm:h-[3.25rem] sm:min-h-[3.25rem] sm:px-4 [&_svg]:size-[1.375rem] [&_svg]:shrink-0";

type SimulationActionButtonProps = {
  icon: LucideIcon;
  label: string;
  mobileLabel?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  "aria-expanded"?: boolean;
  "aria-disabled"?: boolean;
};

export function SimulationActionButton({
  icon: Icon,
  label,
  mobileLabel,
  onClick,
  disabled,
  className,
  "aria-label": ariaLabel,
  "aria-expanded": ariaExpanded,
  "aria-disabled": ariaDisabled,
}: SimulationActionButtonProps) {
  return (
    <Button
      type="button"
      variant="default"
      disabled={disabled}
      className={cn(simulationActionButtonClass, className)}
      aria-label={ariaLabel ?? label}
      aria-expanded={ariaExpanded}
      aria-disabled={ariaDisabled}
      onClick={onClick}
    >
      <Icon aria-hidden />
      <span className="lg:hidden">{mobileLabel ?? label}</span>
      <span className="hidden lg:inline">{label}</span>
    </Button>
  );
}

type SimulationArActionButtonProps = {
  onClick: () => void;
  active?: boolean;
};

export function SimulationArActionButton({
  onClick,
  active = true,
}: SimulationArActionButtonProps) {
  return (
    <SimulationActionButton
      icon={Box}
      label="Lihat di Meja (AR)"
      mobileLabel="Lihat AR"
      onClick={onClick}
      aria-label="Lihat di Meja (AR)"
      aria-disabled={!active}
      className={cn(!active && "opacity-60")}
    />
  );
}

type SimulationLksActionButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  unavailable?: boolean;
  isOpen?: boolean;
};

export function SimulationLksActionButton({
  onClick,
  disabled,
  unavailable,
  isOpen,
}: SimulationLksActionButtonProps) {
  const label = unavailable ? "LKS belum tersedia" : "Kerjakan LKS";

  return (
    <SimulationActionButton
      icon={ClipboardList}
      label={label}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-expanded={isOpen}
      data-practicum-open-lks
    />
  );
}
