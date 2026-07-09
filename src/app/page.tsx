import Link from "next/link";
import { Fraunces, Inter } from "next/font/google";
import { AuthShell, AuthNavLink } from "@/components/auth/auth-shell";
import { LandingFeatureStrip } from "@/components/landing/landing-feature-strip";
import { PintARHeroIllustration } from "@/components/landing/landing-hero-visual";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PINTAR_DISCLAIMER,
  PINTAR_FOOTER,
  PINTAR_HERO_DESCRIPTION,
  PINTAR_HERO_EYEBROW,
  PINTAR_HERO_MICRO,
  UI_COPY,
} from "@/lib/branding";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-landing-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-landing-body",
  display: "swap",
});

export default function Home() {
  return (
    <AuthShell
      variant="landing"
      rootClassName={cn(fraunces.variable, inter.variable, "landing-shell")}
      headerRight={
        <>
          <AuthNavLink href="/masuk" className="landing-nav-link">
            Masuk
          </AuthNavLink>
          <AuthNavLink href="/daftar" className="landing-nav-link">
            Daftar
          </AuthNavLink>
        </>
      }
      footer={
        <span className="flex flex-col gap-1.5">
          <span>{PINTAR_FOOTER}</span>
          <span className="text-[11px] opacity-80">{PINTAR_DISCLAIMER}</span>
        </span>
      }
    >
      <section className="landing-page landing-hero w-full">
        <div className="landing-page-grid">
          <div className="landing-hero-copy landing-enter">
            <p className="landing-eyebrow">{PINTAR_HERO_EYEBROW}</p>
            <h1 className="landing-headline landing-enter-delay-1">
              Jelajahi konsep sains
              <br />
              langsung dari meja belajarmu
            </h1>
            <p className="landing-description landing-enter-delay-1">
              {PINTAR_HERO_DESCRIPTION}
            </p>
          </div>

          <div className="landing-hero-col landing-enter-delay-2">
            <PintARHeroIllustration />
          </div>

          <div className="landing-cta landing-enter-delay-2">
            <Button
              render={<Link href="/daftar" />}
              nativeButton={false}
              className="landing-cta-btn landing-cta-primary"
            >
              <span className="sm:hidden">Mulai</span>
              <span className="hidden sm:inline">{UI_COPY.mulaiBelajar}</span>
            </Button>
            <Button
              render={<Link href="/masuk" />}
              nativeButton={false}
              variant="outline"
              className="landing-cta-btn landing-cta-secondary"
            >
              <span className="sm:hidden">Masuk</span>
              <span className="hidden sm:inline">{UI_COPY.masukKeAkun}</span>
            </Button>
          </div>

          <LandingFeatureStrip className="landing-features landing-enter-delay-3" />

          <p className="landing-micro landing-enter-delay-3">{PINTAR_HERO_MICRO}</p>
        </div>
      </section>
    </AuthShell>
  );
}
