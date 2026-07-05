import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, modul, user } from "@/db";
import { requireUser } from "@/lib/session";
import { PeriksaLksView } from "@/components/guru/periksa-lks-view";

export default async function PeriksaLksPage({
  params,
}: {
  params: Promise<{ moduleId: string; studentId: string }>;
}) {
  await requireUser("guru");
  const { moduleId, studentId } = await params;

  const [m] = await db.select().from(modul).where(eq(modul.id, moduleId));
  const [s] = await db.select().from(user).where(eq(user.id, studentId));
  if (!m || !s) {
    notFound();
  }

  return (
    <PeriksaLksView
      moduleId={m.id}
      judulModul={m.judul}
      studentId={s.id}
      namaSiswa={s.name}
    />
  );
}
