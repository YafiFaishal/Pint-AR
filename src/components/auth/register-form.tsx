"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { daftarAkun } from "@/app/(auth)/actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Role = "siswa" | "guru";

const PILIHAN_PERAN: { value: Role; judul: string; deskripsi: string }[] = [
  { value: "siswa", judul: "Siswa", deskripsi: "Saya akan mengikuti praktikum" },
  { value: "guru", judul: "Guru", deskripsi: "Saya akan memantau kelas" },
];

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<Role>("siswa");
  const [kodeGuru, setKodeGuru] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (!name || !email || !password) {
      setError("Mohon lengkapi semua kolom.");
      return;
    }
    if (password.length < 8) {
      setError("Kata sandi minimal 8 karakter.");
      return;
    }
    if (role === "guru" && !kodeGuru.trim()) {
      setError("Masukkan Kode Guru untuk mendaftar sebagai guru.");
      return;
    }

    setLoading(true);
    const result = await daftarAkun({
      name,
      email,
      password,
      role,
      kodeGuru: role === "guru" ? kodeGuru.trim() : undefined,
    });
    setLoading(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    toast.success("Akun berhasil dibuat. Silakan masuk.");
    router.push("/masuk");
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Daftar Akun</CardTitle>
        <CardDescription>
          Buat akun untuk mulai menggunakan PintAR.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input id="name" name="name" placeholder="Nama lengkap kamu" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="nama@contoh.id"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Kata Sandi</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Minimal 8 karakter"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label>Saya mendaftar sebagai</Label>
            <div className="grid grid-cols-2 gap-3">
              {PILIHAN_PERAN.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setRole(p.value)}
                  aria-pressed={role === p.value}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-colors",
                    role === p.value
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:bg-muted",
                  )}
                >
                  <span className="block font-medium">{p.judul}</span>
                  <span className="block text-xs text-muted-foreground">
                    {p.deskripsi}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {role === "guru" ? (
            <div className="grid gap-2">
              <Label htmlFor="kodeGuru">Kode Guru</Label>
              <Input
                id="kodeGuru"
                name="kodeGuru"
                value={kodeGuru}
                onChange={(e) => setKodeGuru(e.target.value)}
                placeholder="Masukkan kode dari sekolah"
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                Kode ini diberikan oleh sekolah untuk memverifikasi akun guru.
              </p>
            </div>
          ) : null}

          {error ? (
            <p
              role="alert"
              className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Memproses…" : "Daftar"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link href="/masuk" className="font-medium text-primary underline-offset-4 hover:underline">
              Masuk di sini
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
