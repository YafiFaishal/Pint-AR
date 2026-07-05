import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-4 sm:px-10">
        <span className="text-lg font-bold tracking-tight">
          Pint<span className="text-primary">AR</span>
        </span>
        <div className="flex items-center gap-2">
          <Button
            render={<Link href="/masuk" />}
            nativeButton={false}
            variant="ghost"
            size="sm"
          >
            Masuk
          </Button>
          <Button
            render={<Link href="/daftar" />}
            nativeButton={false}
            size="sm"
          >
            Daftar
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-20 text-center">
        <div className="inline-flex items-center rounded-full border bg-muted px-4 py-1.5 text-sm text-muted-foreground">
          Praktikum Interaktif Augmented Reality
        </div>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
          Laboratorium sains{" "}
          <span className="text-primary">langsung di meja belajarmu</span>
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Proyeksikan alat lab 3D ke atas meja lewat kamera HP, ikuti panduan
          langkah, dan isi Lembar Kerja Siswa di layar yang sama. Tanpa instal
          aplikasi, cukup buka browser.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button render={<Link href="/daftar" />} nativeButton={false} size="lg">
            Mulai Sekarang
          </Button>
          <Button
            render={<Link href="/masuk" />}
            nativeButton={false}
            size="lg"
            variant="outline"
          >
            Sudah punya akun
          </Button>
        </div>
      </main>

      <footer className="border-t px-6 py-6 text-center text-sm text-muted-foreground">
        PintAR — Belajar sains tanpa batas ruang & alat.
      </footer>
    </div>
  );
}
