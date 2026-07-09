"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { daftarAkun } from "@/app/(auth)/actions";
import {
  AuthField,
  authCardClass,
  authCardHeaderClass,
  authFormClass,
  authInputClass,
  authLinkClass,
  authSubmitClass,
} from "@/components/auth/auth-form-primitives";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PINTAR_NAME } from "@/lib/branding";

type Role = "siswa" | "guru";

const PILIHAN_PERAN: {
  value: Role;
  judul: string;
  deskripsi: string;
}[] = [
    {
      value: "siswa",
      judul: "Siswa",
      deskripsi: "Menjalankan simulasi dan mengisi LKS",
    },
    {
      value: "guru",
      judul: "Guru",
      deskripsi: "Memantau progres simulasi dan menilai LKS",
    },
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
    <Card className={authCardClass}>
      <CardHeader className={authCardHeaderClass}>
        <CardTitle className="text-xl font-semibold leading-[1.2]">
          Daftar Akun
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed">
          Pilih peran dan buat akun untuk mulai menggunakan {PINTAR_NAME}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className={authFormClass}>
          <AuthField label="Nama Lengkap" htmlFor="name">
            <Input
              id="name"
              name="name"
              placeholder="Nama lengkap kamu"
              className={authInputClass}
              required
            />
          </AuthField>
          <AuthField label="Email" htmlFor="email">
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="nama@contoh.id"
              className={authInputClass}
              required
            />
          </AuthField>
          <AuthField label="Kata Sandi" htmlFor="password">
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Minimal 8 karakter"
              className={authInputClass}
              required
            />
          </AuthField>

          <AuthField label="Saya mendaftar sebagai">
            <div
              className="flex flex-col gap-3 sm:grid sm:grid-cols-2"
              role="radiogroup"
              aria-label="Pilih peran"
            >
              {PILIHAN_PERAN.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  role="radio"
                  aria-checked={role === p.value}
                  onClick={() => setRole(p.value)}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-colors",
                    role === p.value
                      ? "border-foreground bg-muted/30 ring-1 ring-foreground/10"
                      : "border-border hover:bg-muted/20",
                  )}
                >
                  <span className="block text-sm font-medium leading-snug">
                    {p.judul}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                    {p.deskripsi}
                  </span>
                </button>
              ))}
            </div>
          </AuthField>

          {role === "guru" ? (
            <AuthField label="Kode Guru" htmlFor="kodeGuru">
              <Input
                id="kodeGuru"
                name="kodeGuru"
                value={kodeGuru}
                onChange={(e) => setKodeGuru(e.target.value)}
                placeholder="Masukkan kode dari sekolah"
                autoComplete="off"
                className={authInputClass}
              />
              <p className="text-xs leading-relaxed text-muted-foreground">
                Kode dari sekolah untuk verifikasi akun guru.
              </p>
            </AuthField>
          ) : null}

          {error ? (
            <p
              role="alert"
              className="rounded-md bg-destructive/10 px-3 py-2 text-sm leading-relaxed text-destructive"
            >
              {error}
            </p>
          ) : null}

          <Button type="submit" disabled={loading} className={authSubmitClass}>
            {loading ? "Memproses…" : "Daftar"}
          </Button>

          <p className="mt-5 text-center text-sm leading-relaxed text-muted-foreground">
            Sudah punya akun?{" "}
            <Link href="/masuk" className={authLinkClass}>
              Masuk di sini
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
