import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db, modul, langkahPraktikum } from "@/db";
import { requireUser } from "@/lib/session";
import { PraktikumView } from "@/components/praktikum/praktikum-view";

export const metadata: Metadata = {
  title: "Praktikum — PintAR",
};

export default async function PraktikumPage({
  params,
}: {
  params: Promise<{ modulId: string }>;
}) {
  await requireUser();
  const { modulId } = await params;

  const [m] = await db.select().from(modul).where(eq(modul.id, modulId));
  if (!m) {
    notFound();
  }

  const langkah = await db
    .select()
    .from(langkahPraktikum)
    .where(eq(langkahPraktikum.modulId, modulId))
    .orderBy(asc(langkahPraktikum.urutan));

  return <PraktikumView modul={m} langkah={langkah} />;
}
