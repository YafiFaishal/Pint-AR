import { Skeleton } from "@/components/ui/skeleton";

export function GuruDashboardSkeleton() {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] pt-4 sm:px-6 sm:pt-6 lg:max-w-6xl">
      <div className="mb-4 space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[4.5rem] rounded-lg sm:h-[5.5rem]" />
          ))}
        </div>
      </div>

      <Skeleton className="mb-5 h-28 w-full rounded-xl" />

      <div className="mb-4 flex items-center justify-between gap-2">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-16" />
      </div>

      <div className="mb-3 flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-24 rounded-full sm:h-8" />
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    </main>
  );
}
