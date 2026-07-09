import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PINTAR_NAME } from "@/lib/branding";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-medium text-muted-foreground">{PINTAR_NAME}</p>
      <h1 className="text-2xl font-bold tracking-tight">Halaman tidak ditemukan</h1>
      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
        Tautan yang kamu buka tidak tersedia. Kembali ke beranda untuk
        melanjutkan belajar.
      </p>
      <Button
        render={<Link href="/" />}
        nativeButton={false}
        className="min-h-11"
      >
        Ke Beranda
      </Button>
    </div>
  );
}
