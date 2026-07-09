import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, modul } from "@/db";
import { requireUser } from "@/lib/session";
import { getKategoriModul } from "@/lib/siswa-modul-utils";
import { ModulDetailView } from "@/components/guru/modul-detail-view";

export default async function GuruModulPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  await requireUser("guru");
  const { moduleId } = await params;

  const [m] = await db.select().from(modul).where(eq(modul.id, moduleId));
  if (!m) {
    notFound();
  }

  return (
    <ModulDetailView
      moduleId={m.id}
      judul={m.judul}
      kategori={getKategoriModul(m)}
    />
  );
}
