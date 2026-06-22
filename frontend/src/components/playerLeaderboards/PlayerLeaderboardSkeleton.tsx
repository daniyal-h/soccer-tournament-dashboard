import { Skeleton } from '@/components/ui/skeleton';

const SKELETON_CARDS = Array.from({ length: 8 }, (_, index) => index);

function PlayerLeaderboardSkeleton() {
  return (
    <div className="grid gap-4 min-[900px]:grid-cols-2">
      {SKELETON_CARDS.map((item) => (
        <article
          key={item}
          className="flex min-w-0 items-center gap-4 rounded-xl border bg-card p-4 shadow-sm"
        >
          <Skeleton className="h-16 w-16 shrink-0 rounded-full" />

          <Skeleton className="h-16 w-16 shrink-0 rounded-full" />

          <div className="min-w-0 flex-1 space-y-3">
            <div className="space-y-2">
              <Skeleton className="h-5 w-40 max-w-full" />
              <Skeleton className="h-4 w-28 max-w-full" />
            </div>

            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            <Skeleton className="h-8 w-10" />
            <Skeleton className="h-3 w-12" />
          </div>
        </article>
      ))}
    </div>
  );
}

export default PlayerLeaderboardSkeleton;
