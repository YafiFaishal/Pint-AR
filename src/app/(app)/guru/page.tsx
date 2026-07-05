import Link from "next/link";
import { asc } from "drizzle-orm";
import { db, modul } from "@/db";
import { requireUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function GuruBerandaPage() {
  const user = await requireUser("guru");
  const daftarModul = await db.select().from(modul).orderBy(asc(modul.judul));

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Dasbor Guru</h1>
        <p className="text-muted-foreground">
          Halo {user.name.split(" ")[0]}, pilih modul untuk memantau progres dan
          menilai LKS siswa.
        </p>
      </div>

      {daftarModul.length === 0 ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          Belum ada modul praktikum.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {daftarModul.map((m) => (
            <Card key={m.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">{m.judul}</CardTitle>
                {m.deskripsi ? (
                  <CardDescription>{m.deskripsi}</CardDescription>
                ) : null}
              </CardHeader>
              <CardContent className="mt-auto">
                <Button
                  render={<Link href={`/guru/modul/${m.id}`} />}
                  nativeButton={false}
                  className="w-full"
                >
                  Pantau & Nilai
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
