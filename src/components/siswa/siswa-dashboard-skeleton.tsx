import { Skeleton } from "@/components/ui/skeleton";

export function SiswaDashboardSkeleton() {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] pt-4 sm:px-6 sm:pt-6">
      <div className="mb-4 space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      </div>

      <Skeleton className="mb-5 h-24 w-full rounded-xl" />

      <div className="mb-3 flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-44 rounded-xl" />
        ))}
      </div>
    </main>
  );
}
