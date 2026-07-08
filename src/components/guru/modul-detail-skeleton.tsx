import { Skeleton } from "@/components/ui/skeleton";

export function ModulDetailSkeleton() {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] pt-4 sm:px-6 sm:pt-6">
      <div className="mb-4 flex gap-2">
        <Skeleton className="size-11 shrink-0 rounded-md" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-full max-w-sm" />
        </div>
      </div>
      <Skeleton className="mb-4 h-12 w-full rounded-xl" />
      <div className="mb-3 flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    </main>
  );
}
