import Link from "next/link";
import { redirect } from "next/navigation";
import { asc } from "drizzle-orm";
import { db, modul } from "@/db";
import { requireUser } from "@/lib/session";
import { isPraktikumInteraktif } from "@/lib/modul-utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function SiswaBerandaPage() {
  const user = await requireUser("siswa");
  if (!user.onboarded) {
    redirect("/onboarding");
  }
  const daftarModul = await db.select().from(modul).orderBy(asc(modul.judul));

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Selamat datang, {user.name.split(" ")[0]}!
        </h1>
        <p className="text-muted-foreground">
          Pilih modul praktikum untuk mulai bereksperimen.
        </p>
      </div>

      {daftarModul.length === 0 ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          Belum ada modul praktikum yang tersedia.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {daftarModul.map((m) => {
            const siap = isPraktikumInteraktif(m);
            return (
            <Card key={m.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{m.judul}</CardTitle>
                  {!siap ? (
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      Segera
                    </Badge>
                  ) : null}
                </div>
                {m.deskripsi ? (
                  <CardDescription>{m.deskripsi}</CardDescription>
                ) : null}
              </CardHeader>
              <CardContent className="mt-auto">
                <Button
                  render={<Link href={`/praktikum/${m.id}`} />}
                  nativeButton={false}
                  className="w-full"
                  variant={siap ? "default" : "outline"}
                >
                  Mulai Praktikum
                </Button>
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
