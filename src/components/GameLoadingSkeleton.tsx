import { Skeleton } from "@/components/ui/skeleton";

type GameLoadingSkeletonProps = {
  label?: string;
};

export function GameLoadingSkeleton({
  label = "Loading puzzle",
}: GameLoadingSkeletonProps) {
  return (
    <div aria-busy="true" aria-live="polite" className="mx-auto flex max-w-lg flex-col items-center gap-6">
      <p className="sr-only">{label}…</p>
      <Skeleton className="h-12 w-full rounded-2xl" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, row) => (
          <div key={row} className="flex gap-2">
            {Array.from({ length: 5 }).map((__, col) => (
              <Skeleton key={col} className="size-14 rounded-xl md:size-[4.25rem] lg:size-16" />
            ))}
          </div>
        ))}
      </div>
      <div className="flex w-full max-w-lg flex-col gap-2">
        <Skeleton className="mx-auto h-12 w-[90%] rounded-xl" />
        <Skeleton className="mx-auto h-12 w-[75%] rounded-xl" />
        <Skeleton className="mx-auto h-12 w-[60%] rounded-xl" />
      </div>
    </div>
  );
}
