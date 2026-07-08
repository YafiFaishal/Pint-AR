import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { Badge } from "@/components/ui/badge";
import type { Role } from "@/lib/session";

export function AppHeader({
  name,
  role,
}: {
  name?: string | null;
  role?: Role | string | null;
}) {
  const beranda = role === "guru" ? "/guru" : "/siswa";
  const namaTampil = name?.trim() || "Pengguna";
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b px-5 pt-[env(safe-area-inset-top,0px)] sm:px-6">
      <div className="flex items-center gap-2">
        <Link href={beranda} className="text-lg font-bold tracking-tight">
          Pint<span className="text-primary">AR</span>
        </Link>
        <Badge
          variant="secondary"
          className="h-5 px-1.5 text-[10px] capitalize"
        >
          {role ?? "siswa"}
        </Badge>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="hidden text-sm text-muted-foreground sm:inline">
          Halo, <span className="font-medium text-foreground">{namaTampil}</span>
        </span>
        <LogoutButton variant="ghost" />
      </div>
    </header>
  );
}
