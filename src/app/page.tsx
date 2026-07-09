import Link from "next/link";
import { AuthShell, AuthNavLink } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import {
  PINTAR_FOOTER,
  PINTAR_HERO_DESCRIPTION,
  PINTAR_HERO_HEADLINE,
  PINTAR_SUBTITLE,
} from "@/lib/branding";

const VALUE_POINTS = [
  "Tanpa instal aplikasi",
  "Simulasi 3D dan AR",
  "LKS terintegrasi",
] as const;

export default function Home() {
  return (
    <AuthShell
      variant="landing"
      headerRight={
        <>
          <AuthNavLink href="/masuk">Masuk</AuthNavLink>
          <AuthNavLink href="/daftar">Daftar</AuthNavLink>
        </>
      }
      footer={PINTAR_FOOTER}
    >
      <div className="flex w-full flex-col items-center gap-8 text-center sm:gap-10">
        <p className="max-w-2xl text-xs font-medium leading-snug text-muted-foreground sm:text-sm">
          {PINTAR_SUBTITLE}
        </p>

        <div className="space-y-4">
          <h1 className="text-[1.75rem] font-bold leading-[1.15] tracking-tight sm:text-3xl lg:text-4xl">
            {PINTAR_HERO_HEADLINE}
          </h1>
          <p className="mx-auto max-w-md text-sm leading-[1.55] text-muted-foreground sm:text-base">
            {PINTAR_HERO_DESCRIPTION}
          </p>
        </div>

        <div className="flex w-full max-w-sm flex-col gap-3 pt-1 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4">
          <Button
            render={<Link href="/daftar" />}
            nativeButton={false}
            className="min-h-[52px] w-full sm:w-auto"
          >
            Mulai Sekarang
          </Button>
          <Button
            render={<Link href="/masuk" />}
            nativeButton={false}
            variant="outline"
            className="min-h-[52px] w-full sm:w-auto"
          >
            Masuk ke akun
          </Button>
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          {VALUE_POINTS.join(" · ")}
        </p>
      </div>
    </AuthShell>
  );
}
