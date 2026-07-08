"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import {
  AuthField,
  authCardClass,
  authCardHeaderClass,
  authFormClass,
  authInputClass,
  authLinkClass,
  authSubmitClass,
} from "@/components/auth/auth-form-primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function pesanError(code?: string, fallback?: string) {
  switch (code) {
    case "INVALID_EMAIL_OR_PASSWORD":
      return "Email atau kata sandi tidak sesuai.";
    case "USER_NOT_FOUND":
      return "Email belum terdaftar.";
    default:
      return fallback ?? "Terjadi kesalahan. Coba lagi ya.";
  }
}

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (!email || !password) {
      setError("Mohon isi email dan kata sandi.");
      return;
    }

    setLoading(true);
    const { error } = await authClient.signIn.email({ email, password });
    setLoading(false);

    if (error) {
      setError(pesanError(error.code, error.message));
      return;
    }

    toast.success("Berhasil masuk. Selamat datang kembali!");
    router.push("/beranda");
    router.refresh();
  }

  return (
    <div className="w-full">
      <Card className={authCardClass}>
        <CardHeader className={authCardHeaderClass}>
          <CardTitle className="text-xl font-semibold leading-[1.2]">
            Masuk
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            Lanjutkan praktikum, isi LKS, atau pantau kelas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className={authFormClass}>
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
                autoComplete="current-password"
                placeholder="••••••••"
                className={authInputClass}
                required
              />
            </AuthField>

            {error ? (
              <p
                role="alert"
                className="rounded-md bg-destructive/10 px-3 py-2 text-sm leading-relaxed text-destructive"
              >
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={loading}
              className={authSubmitClass}
            >
              {loading ? "Memproses…" : "Masuk"}
            </Button>

            <p className="mt-5 text-center text-sm leading-relaxed text-muted-foreground">
              Belum punya akun?{" "}
              <Link href="/daftar" className={authLinkClass}>
                Daftar di sini
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
      <p className="mt-7 text-center text-xs leading-relaxed text-muted-foreground">
        Akses siswa dan guru menggunakan akun yang terdaftar.
      </p>
    </div>
  );
}
