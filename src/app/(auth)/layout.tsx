import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, berandaPath } from "@/lib/session";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (user) {
    redirect(berandaPath(user.role));
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="px-6 py-4 sm:px-10">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Pint<span className="text-primary">AR</span>
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        {children}
      </main>
    </div>
  );
}
