import { GuruDashboard } from "@/components/guru/guru-dashboard";
import { getGuruDashboardData } from "@/lib/guru-dashboard-data";
import { requireUser } from "@/lib/session";

export default async function GuruBerandaPage() {
  await requireUser("guru");
  const data = await getGuruDashboardData();

  return (
    <GuruDashboard
      modul={data.modul}
      ringkasan={data.ringkasan}
      prioritas={data.prioritas}
    />
  );
}
