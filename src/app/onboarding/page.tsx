import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { asc } from "drizzle-orm";
import { db, modul } from "@/db";
import { requireUser, berandaPath } from "@/lib/session";
import { OnboardingTour } from "@/components/onboarding/onboarding-tour";

export const metadata: Metadata = {
  title: "Selamat Datang — PintAR",
};

export default async function OnboardingPage() {
  const user = await requireUser();
  // Guru tidak butuh tur; yang sudah onboarding langsung ke beranda.
  if (user.role !== "siswa" || user.onboarded) {
    redirect(berandaPath(user.role));
  }

  const [pertama] = await db
    .select({ id: modul.id })
    .from(modul)
    .orderBy(asc(modul.judul))
    .limit(1);

  return (
    <div className="flex min-h-dvh flex-1 items-center justify-center px-4 py-10">
      <OnboardingTour firstModuleId={pertama?.id ?? null} />
    </div>
  );
}
