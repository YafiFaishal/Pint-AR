import type { Metadata } from "next";
import { AuthShell, AuthNavLink } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

import { PINTAR_NAME } from "@/lib/branding";

export const metadata: Metadata = {
  title: `Masuk — ${PINTAR_NAME}`,
};

export default function MasukPage() {
  return (
    <AuthShell
      variant="login"
      headerRight={
        <>
          <AuthNavLink href="/masuk" active>
            Masuk
          </AuthNavLink>
          <AuthNavLink href="/daftar">Daftar</AuthNavLink>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
