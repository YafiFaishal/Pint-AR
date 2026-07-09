import type { ComponentType } from "react";
import { cn } from "@/lib/utils";
import type { ModuleIllustrationType } from "@/lib/module-illustration-type";

type SvgProps = { className?: string; color?: string };

const SW = 1.75;
const CAP = { strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function FreeFallIllustration({ className, color = "currentColor" }: SvgProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path d="M14 36h20" stroke={color} strokeWidth={SW} {...CAP} />
      <path d="M18 12v20" stroke={color} strokeWidth={1.2} strokeDasharray="2.5 2.5" opacity="0.55" />
      <path d="M15 14v4M15 16h-3" stroke={color} strokeWidth={1.2} {...CAP} />
      <path d="M32 18v6M32 24l-2 2.5" stroke={color} strokeWidth={1.2} {...CAP} />
      <g className="mod-anim-free-fall-ball">
        <circle cx="24" cy="14" r="4" fill={color} fillOpacity="0.12" stroke={color} strokeWidth={SW} />
      </g>
      <circle cx="24" cy="30" r="4" fill={color} fillOpacity="0.22" stroke={color} strokeWidth={SW} opacity="0.45" />
    </svg>
  );
}

function NewtonIllustration({ className, color = "currentColor" }: SvgProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path d="M10 34h28" stroke={color} strokeWidth={SW} {...CAP} />
      <circle cx="12" cy="34" r="2" fill={color} fillOpacity="0.25" />
      <circle cx="36" cy="34" r="2" fill={color} fillOpacity="0.25" />
      <g className="mod-anim-newton-block">
        <rect x="16" y="24" width="14" height="10" rx="1.5" fill={color} fillOpacity="0.14" stroke={color} strokeWidth={SW} />
        <path d="M30 29h8" stroke={color} strokeWidth={SW} {...CAP} />
        <path d="M36 29l-2.5-2v4l2.5-2Z" fill={color} fillOpacity="0.45" />
      </g>
      <path d="M12 28h3M12 26h2M12 30h2" stroke={color} strokeWidth={1.1} strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

function CircuitIllustration({ className, color = "currentColor" }: SvgProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <rect x="10" y="16" width="28" height="16" rx="2" fill="none" stroke={color} strokeWidth={SW} />
      <rect x="14" y="20" width="7" height="8" rx="1" fill={color} fillOpacity="0.12" stroke={color} strokeWidth={1.4} />
      <path d="M17.5 20v-2h1" stroke={color} strokeWidth={1.2} {...CAP} />
      <path d="M17.5 30v2h1" stroke={color} strokeWidth={1.2} {...CAP} />
      <text x="16.2" y="26.5" fontSize="4" fill={color} opacity="0.7">+</text>
      <text x="16.2" y="31" fontSize="3.5" fill={color} opacity="0.55">−</text>
      <g className="mod-anim-circuit-bulb">
        <circle cx="33" cy="24" r="5" fill={color} fillOpacity="0.1" stroke={color} strokeWidth={SW} />
        <path d="M31 24c0-1.2 1-2 2-2s2 .8 2 2" stroke={color} strokeWidth={1.2} fill="none" />
        <path d="M30 21l1-1M36 21l-1-1M30 27l1 1M36 27l-1 1" stroke={color} strokeWidth={1} strokeLinecap="round" opacity="0.55" />
      </g>
    </svg>
  );
}

function ChemistryIllustration({ className, color = "currentColor" }: SvgProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path d="M12 14h7l3.5 16H8.5L12 14Z" fill={color} fillOpacity="0.08" stroke={color} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M26 14h7l3.5 16H22.5L26 14Z" fill={color} fillOpacity="0.1" stroke={color} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M10 30h10M24 30h10" stroke={color} strokeWidth={1.2} opacity="0.35" />
      <g className="mod-anim-chem-bubble">
        <circle cx="15" cy="26" r="1.2" fill={color} fillOpacity="0.5" />
        <circle cx="17" cy="23" r="0.9" fill={color} fillOpacity="0.4" />
        <circle cx="31" cy="25" r="1.1" fill={color} fillOpacity="0.45" />
      </g>
    </svg>
  );
}

function OrbitIllustration({ className, color = "currentColor" }: SvgProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <g className="mod-anim-orbit-path">
        <ellipse cx="24" cy="26" rx="15" ry="9" stroke={color} strokeWidth={1.3} fill="none" opacity="0.55" strokeDasharray="3 2.5" />
      </g>
      <circle cx="24" cy="26" r="5.5" fill={color} fillOpacity="0.2" stroke={color} strokeWidth={SW} />
      <path d="M24 20v-2M24 34v2M18 26h-2M30 26h2" stroke={color} strokeWidth={1} strokeLinecap="round" opacity="0.35" />
      <g className="mod-anim-orbit-planet">
        <circle cx="37" cy="22" r="2.8" fill={color} fillOpacity="0.3" stroke={color} strokeWidth={1.2} />
      </g>
    </svg>
  );
}

function ArchimedesIllustration({ className, color = "currentColor" }: SvgProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path d="M12 32h24v4H12z" fill={color} fillOpacity="0.1" stroke={color} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M12 28h24" stroke={color} strokeWidth={1.3} opacity="0.5" />
      <rect x="20" y="18" width="8" height="12" rx="1" fill={color} fillOpacity="0.18" stroke={color} strokeWidth={SW} />
      <g className="mod-anim-archimedes-buoy">
        <path d="M30 22v-7" stroke={color} strokeWidth={1.3} strokeLinecap="round" />
        <path d="M28 15l2-2.5 2 2.5" stroke={color} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <text x="31" y="21" fontSize="3.5" fill={color} opacity="0.65">F</text>
      </g>
    </svg>
  );
}

function OpticsIllustration({ className, color = "currentColor" }: SvgProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <rect x="8" y="28" width="32" height="10" fill={color} fillOpacity="0.08" />
      <line x1="8" y1="28" x2="40" y2="28" stroke={color} strokeWidth={1.2} opacity="0.45" />
      <path d="M24 10v30" stroke={color} strokeWidth={1} strokeDasharray="2 2" opacity="0.35" />
      <g className="mod-anim-optics-rays">
        <path d="M8 28l16-14" stroke={color} strokeWidth={SW} fill="none" {...CAP} />
        <path d="M24 14l16 14" stroke={color} strokeWidth={1.3} fill="none" opacity="0.7" {...CAP} />
        <path d="M24 14l10 18" stroke={color} strokeWidth={1.2} fill="none" opacity="0.55" {...CAP} />
        <circle cx="8" cy="28" r="1.5" fill={color} fillOpacity="0.5" />
      </g>
    </svg>
  );
}

function PendulumIllustration({ className, color = "currentColor" }: SvgProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path d="M14 12h20" stroke={color} strokeWidth={SW} {...CAP} />
      <path d="M16 34 Q24 22 32 34" stroke={color} strokeWidth={1} fill="none" opacity="0.25" strokeDasharray="2 2" />
      <circle cx="16" cy="34" r="3" fill={color} fillOpacity="0.08" stroke={color} strokeWidth={1} opacity="0.35" />
      <circle cx="32" cy="34" r="3" fill={color} fillOpacity="0.08" stroke={color} strokeWidth={1} opacity="0.35" />
      <g className="mod-anim-pendulum mod-svg-pendulum">
        <path d="M24 12v20" stroke={color} strokeWidth={1.3} />
        <circle cx="24" cy="34" r="4" fill={color} fillOpacity="0.18" stroke={color} strokeWidth={SW} />
      </g>
    </svg>
  );
}

function SpringIllustration({ className, color = "currentColor" }: SvgProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path d="M14 12h20" stroke={color} strokeWidth={SW} {...CAP} />
      <path d="M16 12h16" stroke={color} strokeWidth={2} opacity="0.2" />
      <path d="M24 12v4" stroke={color} strokeWidth={1.2} />
      <path d="M20 16h8l-2 3.5h4l-2 3.5h4l-2 3.5h4l-2 3.5h8" stroke={color} strokeWidth={1.35} fill="none" {...CAP} />
      <g className="mod-anim-spring-mass">
        <rect x="18" y="34" width="12" height="6" rx="1" fill={color} fillOpacity="0.16" stroke={color} strokeWidth={SW} />
        <path d="M33 36v5M33 36h3M33 41h3" stroke={color} strokeWidth={1.1} {...CAP} opacity="0.55" />
      </g>
    </svg>
  );
}

function HeatIllustration({ className, color = "currentColor" }: SvgProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <rect x="14" y="30" width="16" height="5" rx="1" fill={color} fillOpacity="0.1" stroke={color} strokeWidth={SW} />
      <circle cx="22" cy="32.5" r="2" fill="none" stroke={color} strokeWidth={1.1} opacity="0.45" />
      <path d="M16 30h12v-12h-8l-1 12Z" fill={color} fillOpacity="0.08" stroke={color} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M32 14v22" stroke={color} strokeWidth={1.3} />
      <circle cx="32" cy="12" r="2.2" fill={color} fillOpacity="0.2" stroke={color} strokeWidth={1.1} />
      <rect x="30.5" y="18" width="3" height="10" rx="1" fill={color} fillOpacity="0.25" />
      <g className="mod-anim-heat-wave">
        <path d="M20 18c0 2-1.5 3-1.5 5M23 17c0 2.5-1.5 3.5-1.5 6M26 18c0 2-1.5 3-1.5 5" stroke={color} strokeWidth={1.1} fill="none" opacity="0.45" />
        <circle cx="19" cy="24" r="0.9" fill={color} fillOpacity="0.4" />
      </g>
    </svg>
  );
}

function DefaultIllustration({ className, color = "currentColor" }: SvgProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <rect x="12" y="14" width="24" height="20" rx="3" fill={color} fillOpacity="0.08" stroke={color} strokeWidth={SW} />
      <path d="M18 22h12M18 26h8" stroke={color} strokeWidth={1.2} strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

const MAP: Record<ModuleIllustrationType, ComponentType<SvgProps>> = {
  freeFall: FreeFallIllustration,
  newton: NewtonIllustration,
  circuit: CircuitIllustration,
  chemistry: ChemistryIllustration,
  orbit: OrbitIllustration,
  archimedes: ArchimedesIllustration,
  optics: OpticsIllustration,
  pendulum: PendulumIllustration,
  spring: SpringIllustration,
  heat: HeatIllustration,
  default: DefaultIllustration,
};

export function ModuleIllustrationSvg({
  type,
  className,
  color,
}: {
  type: ModuleIllustrationType;
  className?: string;
  color?: string;
}) {
  const Comp = MAP[type] ?? DefaultIllustration;
  return <Comp className={className} color={color} />;
}

export function ModuleIllustration({
  type,
  kategori,
  size,
  className,
  animateOnHover,
}: {
  type: ModuleIllustrationType;
  kategori: "Fisika" | "Kimia" | "Astronomi";
  size?: "sm" | "md";
  className?: string;
  animateOnHover?: boolean;
}) {
  return (
    <ModuleIllustrationTile
      type={type}
      kategori={kategori}
      size={size}
      className={className}
      animateOnHover={animateOnHover}
    />
  );
}

export function ModuleIllustrationTile({
  type,
  kategori,
  size = "md",
  className,
  animateOnHover = false,
}: {
  type: ModuleIllustrationType;
  kategori: "Fisika" | "Kimia" | "Astronomi";
  size?: "sm" | "md";
  className?: string;
  animateOnHover?: boolean;
}) {
  const dim = size === "sm" ? "size-[52px] sm:size-14" : "size-14 sm:size-16";
  const catClass =
    kategori === "Kimia"
      ? "module-tile-chemistry"
      : kategori === "Astronomi"
        ? "module-tile-astronomy"
        : "module-tile-physics";

  return (
    <div
      className={cn(
        "module-illustration-tile flex shrink-0 items-center justify-center rounded-[14px] border",
        dim,
        catClass,
        animateOnHover && "module-tile-animate",
        className,
      )}
    >
      <ModuleIllustrationSvg
        type={type}
        className={cn("h-[68%] w-[68%]", `module-svg-${type}`)}
      />
    </div>
  );
}
