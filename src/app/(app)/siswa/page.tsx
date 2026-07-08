import { redirect } from "next/navigation";
import { SiswaDashboard } from "@/components/siswa/siswa-dashboard";
import { getSiswaDashboardData } from "@/lib/siswa-dashboard-data";
import { requireUser } from "@/lib/session";

export default async function SiswaBerandaPage() {
  const user = await requireUser("siswa");
  if (!user.onboarded) {
    redirect("/onboarding");
  }

  const { modul, ringkasan } = await getSiswaDashboardData(user.id);
  const namaDepan = user.name.split(" ")[0] ?? user.name;

  return (
    <SiswaDashboard
      namaDepan={namaDepan}
      modul={modul}
      ringkasan={ringkasan}
    />
  );
}
