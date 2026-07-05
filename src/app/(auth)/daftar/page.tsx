import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Daftar — PintAR",
};

export default function DaftarPage() {
  return <RegisterForm />;
}
