import { redirect } from "next/navigation";
import { requireUser, berandaPath } from "@/lib/session";

// Titik masuk netral setelah login: alihkan sesuai peran pengguna.
export default async function BerandaPage() {
  const user = await requireUser();
  // Siswa baru diarahkan ke tur onboarding lebih dulu.
  if (user.role === "siswa" && !user.onboarded) {
    redirect("/onboarding");
  }
  redirect(berandaPath(user.role));
}
