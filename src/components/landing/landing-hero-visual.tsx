import Image from "next/image";
import { cn } from "@/lib/utils";

const HERO_SRC = "/illustrations/pintar-landing-hero-final.png";
const HERO_WIDTH = 1448;
const HERO_HEIGHT = 1086;

/** Ilustrasi hero landing — PNG final dengan scan line & partikel ringan. */
export function PintARHeroIllustration({ className }: { className?: string }) {
  return (
    <div className={cn("landing-hero-card landing-hero-enter", className)}>
      <div className="landing-hero-visual">
        <Image
          src={HERO_SRC}
          alt="Ilustrasi simulasi sains PintAR"
          width={HERO_WIDTH}
          height={HERO_HEIGHT}
          priority
          sizes="(max-width: 768px) 100vw, 720px"
          className="landing-hero-image"
        />
        <div className="landing-hero-scan-line" aria-hidden="true" />
        <span
          className="landing-hero-particle landing-hero-particle-1"
          aria-hidden="true"
        />
        <span
          className="landing-hero-particle landing-hero-particle-2"
          aria-hidden="true"
        />
        <span
          className="landing-hero-particle landing-hero-particle-3"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

/** @deprecated Gunakan PintARHeroIllustration */
export const LandingHeroVisual = PintARHeroIllustration;
