import { Skeleton } from '@/components/ui/skeleton';

const SKELETON_CARD_COUNT = 6;

const TeamsSkeleton = () => {
  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-8 w-full sm:w-48" />
        <Skeleton className="h-8 w-full sm:w-48" />
      </div>

      <div className="grid grid-cols-1 gap-4 min-[900px]:grid-cols-2">
        {Array.from({ length: SKELETON_CARD_COUNT }).map((_, index) => (
          <div
            key={index}
            className="relative h-23 overflow-hidden rounded-xl border bg-card p-4 shadow-sm"
          >
            <Skeleton className="h-5 w-2/5 max-w-48" />
            <Skeleton className="mt-2 h-4 w-3/5 max-w-64" />

            <Skeleton className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full" />
            <Skeleton className="absolute -right-3 top-1/2 h-24 w-32 -translate-y-1/2 rounded-full opacity-40" />
          </div>
        ))}
      </div>
    </>
  );
};

export default TeamsSkeleton;
