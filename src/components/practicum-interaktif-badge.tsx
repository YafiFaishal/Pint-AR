import { Badge } from "@/components/ui/badge";
import { PINTAR_SIMULASI_BADGE } from "@/lib/branding";
import { cn } from "@/lib/utils";

export function SimulasiInteraktifBadge({
  className,
}: {
  className?: string;
}) {
  return <Badge className={cn(className)}>{PINTAR_SIMULASI_BADGE}</Badge>;
}
