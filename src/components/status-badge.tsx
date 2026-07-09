import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { StatusModul } from "@/lib/siswa-modul-utils";

const STATUS_CLASS: Record<StatusModul, string> = {
  "Belum mulai": "status-badge-neutral",
  "Sedang dipelajari": "status-badge-info",
  "LKS belum lengkap": "status-badge-info",
  "LKS selesai": "status-badge-primary",
  "Sudah dinilai": "status-badge-success",
};

export function SiswaStatusBadge({
  status,
  className,
}: {
  status: StatusModul;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("shrink-0 border text-[10px] font-medium", STATUS_CLASS[status], className)}
    >
      {status}
    </Badge>
  );
}

/** Status modul guru dashboard. */
export function GuruModulStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const cls =
    status === "Perlu dinilai"
      ? "status-badge-warning"
      : status === "Sudah dinilai"
        ? "status-badge-success"
        : status === "Ada progres"
          ? "status-badge-info"
          : "status-badge-neutral";

  return (
    <Badge
      variant="outline"
      className={cn("shrink-0 border text-[10px] font-medium", cls, className)}
    >
      {status}
    </Badge>
  );
}
