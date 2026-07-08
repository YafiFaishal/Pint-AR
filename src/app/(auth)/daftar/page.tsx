import type { Metadata } from "next";
import { AuthShell, AuthNavLink } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Daftar — PintAR",
};

export default function DaftarPage() {
  return (
    <AuthShell
      variant="register"
      headerRight={
        <>
          <AuthNavLink href="/masuk">Masuk</AuthNavLink>
          <AuthNavLink href="/daftar" active>
            Daftar
          </AuthNavLink>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
