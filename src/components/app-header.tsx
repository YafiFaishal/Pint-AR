import { LogoutButton } from "@/components/auth/logout-button";
import { PintARBrand } from "@/components/brand/pintar-brand";
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
  const roleLabel = role ?? "siswa";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/80 bg-card/80 px-5 pt-[env(safe-area-inset-top,0px)] backdrop-blur-sm sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <PintARBrand href={beranda} variant="auto" className="min-w-0" />
        <Badge
          variant="outline"
          className="h-5 shrink-0 border-primary/20 bg-primary/5 px-1.5 text-[10px] capitalize text-primary"
        >
          {roleLabel}
        </Badge>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="hidden text-sm text-muted-foreground sm:inline">
          Halo,{" "}
          <span className="font-medium text-foreground">{namaTampil}</span>
        </span>
        <LogoutButton variant="ghost" />
      </div>
    </header>
  );
}
