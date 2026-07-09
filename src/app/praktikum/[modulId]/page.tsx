import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db, modul, langkahPraktikum } from "@/db";
import { requireUser } from "@/lib/session";
import { PraktikumView } from "@/components/praktikum/praktikum-view";

import { PINTAR_NAME } from "@/lib/branding";

export const metadata: Metadata = {
  title: `Simulasi Eksperimen — ${PINTAR_NAME}`,
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
