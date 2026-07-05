import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Masuk — PintAR",
};

export default function MasukPage() {
  return <LoginForm />;
}
